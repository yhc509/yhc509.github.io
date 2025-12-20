---
date: 2022-09-19
title: Vulkan Tutorial (24) - Vertext buffers - Staging buffer
categories: ['Vulkan']
open: true
---

-[Khronos Vulkan Tutorial](https://docs.vulkan.org/tutorial/latest/00_Introduction.html)

# 소개

우리가 갖고 있는 정점 버퍼는 올바르게 작동하지만, CPU에서 접근할 수 있는 메모리 유형은 그래픽 카드에서 읽을 수 있는 가장 최적화된 메모리 유형이 아닐 수 있습니다. 가장 최적한 메모리는 `VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT` 플래그가 있으며, 일반적으로 전용 그래픽 카드의 CPU에서 접근할 수 없습니다. 이번 챕터에서 두 개의 정점 버퍼를 만들 것입니다. 하나는 정점 배열에서 데이터를 업로드하기 위해 CPU 접근 가능한 메모리인 스테이징 버퍼와, 디바이스 로컬 메모리의 최종 정점 버퍼입니다. 그 다음 버퍼 복사 명령을 사용하여 데이터를 스테이징 버퍼에서 실제 정점 버퍼로 이동시키겠습니다.

# 전송 대기열

버퍼 복사 명령은 `VK_QUEUE_TRANSFER_BIT`을 사용하여 전송 작업을 지원하는 큐 패밀리가 필요합니다. 좋은 소식은 `VK_QUEUE_GRAPHICS_BIT`이나 `VK_QUEUE_COMPUTE_BIT`이 있는 모든 큐 패밀리가 이미 암시적으로 `VK_QUEUE_TRANSFER_BIT` 작업을 지원한다는 것입니다.  이런 경우에는 `queueFlags`에 명시적으로 구현할 필요가 없습니다.

당신이 도전을 좋아한다면, 다른 큐 패밀리를 사용하는 것을 시도해 볼 수 있습니다. 특히 전송 작업에서 말입니다. 프로그램을 다음과 같이 수정해야 합니다:

- `VK_QUEUE_TRANSFER_BIT`가 있지만 `VK_QUEUE_GRAPHICS_BIT`가 아닌 큐 패밀리를 명시적으로 찾도록 `QueueFamilyIndices`와 `findQueueFamilies`를 수정합니다.
- 전송 큐에 대한 요청을 핸들링하도록 `createLogicalDevice`를 수정합니다.
- 전송 큐 패밀리에 제출된 명령 버퍼를 위한 두번째 명령 풀을 만듭니다.
- 리소스의 `sharingMode`를 `VK_SHARING_MOD_CONCURRENT`로 바꾸고 그래픽과 전송 큐 패밀리를 모두 지정합니다.
- [`vkCmdCopyBuffer`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkCmdCopyBuffer.html) (이 챕터에서 사용할 것) 같은 전송 명령을 그래픽 큐 대신 전송 큐에 제출합니다.

작은 작업이지만, 큐 패밀리 간에 리소스를 어떻게 공유하는지에 대해 많은 것을 알려줄 것입니다.

# 추상화 버퍼 생성

이 챕터에서 여러 버퍼를 생성할 것이기 때문에, 버퍼 생성을 도와주는 함수를 만드는 것이 좋습니다. `createBuffer` 새로운 함수를 만들고 `createVertexBuffer` (매핑은 제외)의 코드를 옮깁니다.

```cpp
void createBuffer(VkDeviceSize size, VkBufferUsageFlags usage, VkMemoryPropertyFlags properties, VkBuffer& buffer, VkDeviceMemory& bufferMemory) {
    VkBufferCreateInfo bufferInfo{};
    bufferInfo.sType = VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO;
    bufferInfo.size = size;
    bufferInfo.usage = usage;
    bufferInfo.sharingMode = VK_SHARING_MODE_EXCLUSIVE;

    if (vkCreateBuffer(device, &bufferInfo, nullptr, &buffer) != VK_SUCCESS) {
        throw std::runtime_error("failed to create buffer!");
    }

    VkMemoryRequirements memRequirements;
    vkGetBufferMemoryRequirements(device, buffer, &memRequirements);

    VkMemoryAllocateInfo allocInfo{};
    allocInfo.sType = VK_STRUCTURE_TYPE_MEMORY_ALLOCATE_INFO;
    allocInfo.allocationSize = memRequirements.size;
    allocInfo.memoryTypeIndex = findMemoryType(memRequirements.memoryTypeBits, properties);

    if (vkAllocateMemory(device, &allocInfo, nullptr, &bufferMemory) != VK_SUCCESS) {
        throw std::runtime_error("failed to allocate buffer memory!");
    }

    vkBindBufferMemory(device, buffer, bufferMemory, 0);
}
```

이 함수를 사용하여 다양한 종류의 버퍼를 생성할 수 있도록 버퍼 크기, 메모리 속성 및 사용에 대한 매개변수를 추가합니다. 마지막 두 매개변수는 핸들을 기록할 출력 변수입니다.

이제 `createVertexBuffer`에서 버퍼 생성과 메모리 할당 코드를 제거하고 대신 `createBuffer`를 호출합니다:

```cpp
void createVertexBuffer() {
    VkDeviceSize bufferSize = sizeof(vertices[0]) * vertices.size();
    createBuffer(bufferSize, VK_BUFFER_USAGE_VERTEX_BUFFER_BIT, VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT, vertexBuffer, vertexBufferMemory);

    void* data;
    vkMapMemory(device, vertexBufferMemory, 0, bufferSize, 0, &data);
        memcpy(data, vertices.data(), (size_t) bufferSize);
    vkUnmapMemory(device, vertexBufferMemory);
}
```

프로그램을 실행하여 정점 버퍼가 여전히 잘 작동하는지 확인해보세요.

# 스테이징 버퍼 사용

이제 `createVertexBuffer`를 변경하여 호스트에서 볼 수 있는 버퍼만 임시 버퍼로 사용하고, 장치 로컬 버퍼를 실제 정점 버퍼로 사용하도록 하겠습니다.

```cpp
void createVertexBuffer() {
    VkDeviceSize bufferSize = sizeof(vertices[0]) * vertices.size();

    VkBuffer stagingBuffer;
    VkDeviceMemory stagingBufferMemory;
    createBuffer(bufferSize, VK_BUFFER_USAGE_TRANSFER_SRC_BIT, VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT, stagingBuffer, stagingBufferMemory);

    void* data;
    vkMapMemory(device, stagingBufferMemory, 0, bufferSize, 0, &data);
        memcpy(data, vertices.data(), (size_t) bufferSize);
    vkUnmapMemory(device, stagingBufferMemory);

    createBuffer(bufferSize, VK_BUFFER_USAGE_TRANSFER_DST_BIT | VK_BUFFER_USAGE_VERTEX_BUFFER_BIT, VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT, vertexBuffer, vertexBufferMemory);
}
```

이제 매핑과 복사를 위해 `stagingBufferMemory`를 사용한 새로운 `stagingBuffer`를 사용합니다. 이 챕터에서는 두 개의 새로운 버퍼 플래그를 사용합니다:

- `VK_BUFFER_USAGE_TRANSFER_SRC_BIT`: 버퍼는 메모리 전송 작업에서 소스로 사용될 수 있습니다.
- `K_BUFFER_USAGE_TRANSFER_DST_BIT`: 버퍼는 메모리 전송 작업에서 목적지로 사용될 수 있습니다.

`vertexBuffer`는 장치 로컬인 메모리 유형에서 할당됩니다. 이는 일반적으로 [`vkMapMemory`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkMapMemory.html)를 사용할 수 없다는 것입니다. 하지만 `stagingBuffer`에서 `vertexBuffer`로 데이터를 복사할 수 있습니다. 정점 버퍼 사용 플래그와 함께 `stagingBuffer`에 대한 전송 소스 플래그와 `vertexBuffer`에 대한 전송 대상 플래그를 지정하여, 이를 수행할 것임을 나타내야 합니다.

이제 한 버퍼에서 다른 버퍼로 내용을 복사하는 함수인 `copyBuffer`를 작성합니다.

```cpp
void copyBuffer(VkBuffer srcBuffer, VkBuffer dstBuffer, VkDeviceSize size) {

}
```

메모리 전송 작업은 그리기 명령과 마찬가지로, 명령 버퍼를 사용하여 실행됩니다. 따라서 먼저 임시 명령 버퍼를 할당해야 합니다. 구현에서 메모리 할당 최적화를 적용할 수 있기 때문에 이러한 종류의 단기 버퍼에 대해 별도의 명령 풀을 생성할 수 있습니다. 이 경우 명령 풀 생성 중에 `VK_COMMAND_POOL_CREATE_TRANSIENT_BIT` 플래그를 사용할 수 있습니다.

```cpp
void copyBuffer(VkBuffer srcBuffer, VkBuffer dstBuffer, VkDeviceSize size) {
    VkCommandBufferAllocateInfo allocInfo{};
    allocInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
    allocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
    allocInfo.commandPool = commandPool;
    allocInfo.commandBufferCount = 1;

    VkCommandBuffer commandBuffer;
    vkAllocateCommandBuffers(device, &allocInfo, &commandBuffer);
}
```

그리고 즉시 명령 버퍼에 기록을 시작합니다:

```cpp
VkCommandBufferBeginInfo beginInfo{};
beginInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
beginInfo.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;

vkBeginCommandBuffer(commandBuffer, &beginInfo);
```

우리는 명령 버퍼를 한 번만 사용하고 복사 작업 실행이 완료될 때까지 함수에서 돌면서 기다립니다. `VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT`를 사용하여 드라이버에게 우리의 의도를 알리는 것이 좋습니다.

```cpp
VkBufferCopy copyRegion{};
copyRegion.srcOffset = 0; // Optional
copyRegion.dstOffset = 0; // Optional
copyRegion.size = size;
vkCmdCopyBuffer(commandBuffer, srcBuffer, dstBuffer, 1, &copyRegion);
```

버퍼의 내용은 [`vkCmdCopyBuffer`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkCmdCopyBuffer.html) 명령을 사용하여 전송됩니다. 소스 및 대상 버퍼를 인수로 사용하고, 복사항 영역 배열을 사용합니다. 영역은 [`VkBufferCopy`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkBufferCopy.html) 구조체에 정의되어있고, 소스 버퍼 오프셋과 대상 버퍼 오프셋 및 크기로 구성됩니다. [`vkMapMemory`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkMapMemory.html) 명령과 다르게 여기에는 `VK_WHOLE_SIZE`를 지정할 수 없습니다.

```cpp
vkEndCommandBuffer(commandBuffer);
```

이 명령 버퍼에는 복사 명령만 포함되어 있으므로, 그 직후에 기록을 중지할 수 있습니다. 이제 명령 버퍼를 실행하여 전송을 완료합니다:

```cpp
VkSubmitInfo submitInfo{};
submitInfo.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;
submitInfo.commandBufferCount = 1;
submitInfo.pCommandBuffers = &commandBuffer;

vkQueueSubmit(graphicsQueue, 1, &submitInfo, VK_NULL_HANDLE);
vkQueueWaitIdle(graphicsQueue);
```

그리기 명령과 다르게 이번에는 기다려야 하는 이벤트가 없습니다. 우리는 버퍼에서 즉시 전송을 실행하기를 원합니다. 이 전송이 완료될 때까지 기다리는 두 가지 방법이 있습니다. 우리는 [`vkWaitForFences`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkWaitForFences.html)로 펜스를 사용하거나, 단순히 [`vkQueueWaitIdle`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkQueueWaitIdle.html)로 큐가 idle 상태가 될 때까지 기다릴 수 있습니다. 펜스를 사용하면 한 번에 하나씩 실행하는 대신, 여러 전송을 동시에 예약하고 모두 완료될 때까지 기다릴 수 있습니다. 이는 드라이버에게 최적화할 수 있는 더 많은 기회를 제공합니다.

```cpp
vkFreeCommandBuffers(device, commandPool, 1, &commandBuffer);
```

전송 작업에서 사용된 명령 버퍼를 정리하는 것을 잊지 마세요.

`createVertexBuffer` 함수에서 `copyBuffer`를 호출하여 정점 데이터를 디바이스 로컬 버퍼로 이동시킬 수 있습니다.

```cpp
createBuffer(bufferSize, VK_BUFFER_USAGE_TRANSFER_DST_BIT | VK_BUFFER_USAGE_VERTEX_BUFFER_BIT, VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT, vertexBuffer, vertexBufferMemory);

copyBuffer(stagingBuffer, vertexBuffer, bufferSize);
```

스테이징 버퍼에서 장치 버퍼로 데이터를 복사한 후 반드시 정리해야 합니다:

```cpp
		...

    copyBuffer(stagingBuffer, vertexBuffer, bufferSize);

    vkDestroyBuffer(device, stagingBuffer, nullptr);
    vkFreeMemory(device, stagingBufferMemory, nullptr);
}
```

프로그램을 실행하여 익숙한 삼각형이 보이는지 확인하세요. 지금은 개선된 것이 보이지 않을 수 있지만 정점 데이터는 이제 고성능 메모리에서 로드됩니다. 이것은 더 복잡한 지오메트리 렌더링을 시작할 때 중요합니다.

# 결론

실제 어플리케이션에서는 모든 개별 버퍼를 위해 실제로 [`vkAllocateMemory`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkAllocateMemory.html)를 호출하는 것은 아닙니다. 최대 동시 메모리 할당 수는  `maxMemoryAllocationCount` 물리적 장치 한도에 의해 제한됩니다. NVIDIA GTX 1080같은 고급 하드웨어에서도 `4096`만큼 낮을 수 있습니다. 동시에 많은 수의 개체에서 메모리를 할당하는 올바른 방법은 많은 함수에서 `offset` 매개변수를 사용하여 여러 객체간에 단일 할당을 분할하는 맞춤 할당자를 만드는 것입니다.

이러한 할당자를 직접 구현하거나, GPUOpen에서 제공하는 [VulkanMemoryAllocator](https://github.com/GPUOpen-LibrariesAndSDKs/VulkanMemoryAllocator) 라이브러리를 사용할 수 있습니다. 하지만 이 튜토리얼에서는 모든 리소스에 대해 별도의 할당을 하겠습니다. 지금은 이런 제한에 도달하지 않을 것이기 때문입니다.

[C++ code](https://vulkan-tutorial.com/code/20_staging_buffer.cpp) / [Vertex shader](https://vulkan-tutorial.com/code/18_shader_vertexbuffer.vert) / [Fragment shader](https://vulkan-tutorial.com/code/18_shader_vertexbuffer.frag)