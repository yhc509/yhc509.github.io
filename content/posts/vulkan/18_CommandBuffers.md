---
date: 2022-08-22
title: Vulkan Tutorial (18) - Draw a triangle - Drawing - CommandBuffers
categories: ['Graphics/Vulkan']
open: true
---

-[Khronos Vulkan Tutorial](https://docs.vulkan.org/tutorial/latest/00_Introduction.html)

그리기 작업이나 메모리 전송 등의 Vulkan 명령들은 함수 호출로 직접 실행되지 않습니다. 명령 버퍼 객체에서 수행하려는 모든 작업을 기록해야 합니다. 이 장점은 Vulkan에게 우리가 하고 싶은 것을 말할 준비가 되었을 때, 모든 명령이 함께 제출되고 Vulkan은 모든 명령을 함께 사용할 수 있기 때문에 보다 효율적인 작업을 할 수 있습니다. 또한 원한다면 여러 쓰레드에서 명령 기록을 수행할 수 있습니다.

# 명령 풀 (Command pools)

명령 버퍼를 만들기 전에 명령 풀을 만들어야 합니다. 명령 풀은 버퍼를 저장하는데 사용되는 메모리를 관리하고, 명령 버퍼를 할당합니다. [`VkCommandPool`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkCommandPool.html)를 저장할 새로운 클래스 멤버를 추가합니다:

```cpp
VkCommandPool commandPool;
```

그 다음 새로운 함수 `createCommandPool`를 만들고 `initVulkan`에서 프레임버퍼가 생성된 이후에 호출합니다.

```cpp
void initVulkan() {
    createInstance();
    setupDebugMessenger();
    createSurface();
    pickPhysicalDevice();
    createLogicalDevice();
    createSwapChain();
    createImageViews();
    createRenderPass();
    createGraphicsPipeline();
    createFramebuffers();
    createCommandPool();
}

...

void createCommandPool() {

}
```

명령 버퍼를 생성할 때는 두 매개변수만 사용합니다:

```cpp
QueueFamilyIndices queueFamilyIndices = findQueueFamilies(physicalDevice);

VkCommandPoolCreateInfo poolInfo{};
poolInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
poolInfo.flags = VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT;
poolInfo.queueFamilyIndex = queueFamilyIndices.graphicsFamily.value();
```

명령 풀에는 두가지 플래그가 있습니다:

- `VK_COMMAND_POOL_CREATE_TRANSIENT_BIT`: 명령 버퍼가 새 명령으로 자주 기록된다는 힌트 (메모리 할당 동작이 변경될 수 있음)
- `VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT`: 명령 버퍼가 개별적으로 다시 기록되도록 허용. 이 플래그가 없으면 모두 재설정해야 함.

우리는 매 프레임마다 커멘드 버퍼를 기록할 것이기 때문에, 리셋하고 다시 기록하길 원합니다. 그러므로 우리의 커멘드 풀에는 `VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT` 플래그를 설정해야 합니다.

명령 버퍼는 우리가 검색한 그래픽과 프레젠테이션 큐 같은 장치 큐 중의 하나에 제출되어 실행됩니다. 각 명령 풀은 단일 유형의 큐에 제출된 명령 버퍼만 할당할 수 있습니다. 그리기 명령을 기록할 것이므로, 그래픽 큐 패밀리를 선택했습니다.

```cpp
if (vkCreateCommandPool(device, &poolInfo, nullptr, &commandPool) != VK_SUCCESS) {
    throw std::runtime_error("failed to create command pool!");
}
```

명령 풀 생성을 [`vkCreateCommandPool`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkCreateCommandPool.html) 함수를 사용하여 끝냅니다. 특별한 매게변수가 필요없습니다. 명령은 프로그램 전반에서 화면에 무언가를 그리는데 사용되므로, 마지막에 파괴되어야 합니다:

```cpp
void cleanup() {
    vkDestroyCommandPool(device, commandPool, nullptr);

    ...
}
```

# 명령 버퍼 할당

이제 명령 버퍼 할당을 시작할 수 있습니다.

클래스 멤버로 [`VkCreateBuffer`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkCommandBuffer.html) 객체를 만듭니다. 명령 버퍼는 명령 풀이 파괴될 때 자동으로 해제되므로 명시적 정리가 필요하지 않습니다.

```cpp
VkCommandBuffer commandBuffer;
```

`createCommandBuffer` 함수에 명령 풀에서 단일 명령 버퍼를 할당하는 함수를 작업하겠습니다.

```cpp
void initVulkan() {
    createInstance();
    setupDebugMessenger();
    createSurface();
    pickPhysicalDevice();
    createLogicalDevice();
    createSwapChain();
    createImageViews();
    createRenderPass();
    createGraphicsPipeline();
    createFramebuffers();
    createCommandPool();
    createCommandBuffer();
}

...

void createCommandBuffer() {

}
```

명령 버퍼는 [`vkAllocateCommandBuffers`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkAllocateCommandBuffers.html)함수로 할당합니다. 이 함수는 명령 풀과 할당할 버퍼의 수를 지정하는 [`VkCommandBufferAllocateInfo`](https://www.notion.so/Drawing-a-triangle-Drawing-Command-buffers-a88fcea554d54041beb98ccd08276bb7?pvs=21) 구조체를 매개변수로 받습니다:

```cpp
VkCommandBufferAllocateInfo allocInfo{};
allocInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
allocInfo.commandPool = commandPool;
allocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
allocInfo.commandBufferCount = 1;

if (vkAllocateCommandBuffers(device, &allocInfo, &commandBuffer) != VK_SUCCESS) {
    throw std::runtime_error("failed to allocate command buffers!");
}
```

`level` 매개변수는 할당된 명령 버퍼가 기본인지, 아니면 보조 명령 버퍼인지를 지정합니다.

- `VK_COMMAND_BUFFER_LEVEL_PRIMARY`: 실행을 위해 큐에 제출할 수 있지만, 다른 명령 버퍼에서 호출할 수 없습니다.
- `VK_COMMAND_BUFFER_LEVEL_SECONDARY`: 직접 제출할 수 없지만, 기본 명령 버퍼에서 호출할 수 있습니다.

여기서는 보조 명령 버퍼 기능을 사용하지 않겠지만, 기본 명령 버퍼에서 일반적인 작업을 재사용하는 것이 도움이 된다고 상상할 수 있습니다.

하나의 명령 버퍼만 할당하기 때문에, `commandBufferCount` 매개변수는 1입니다.

# 명령 버퍼 기록

이제 실행하려는 명령을 명령 버퍼에 쓰는 `recordCommandBuffer` 함수를 작업하겠습니다. [`VkCommandBuffer`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkCommandBuffer.html)는 우리가 쓰고자 하는 현재 스왑체인 이미지의 인덱스와 함께 매개변수로 전달됩니다.

```cpp
void recordCommandBuffer(VkCommandBuffer commandBuffer, uint32_t imageIndex) {

}
```

우리는 항상 [`vkBeginCommandBuffer`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkBeginCommandBuffer.html) 를 호출하는 것으로 명령 버퍼 기록을 시작합니다. 이는 특정 명령 버퍼를 사용하는 몇가지 세부 사항을 지정하는 인수로 [`vkCommandBufferBeginInfo`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkCommandBufferBeginInfo.html) 구조를 사용합니다.

```cpp
VkCommandBufferBeginInfo beginInfo{};
beginInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
beginInfo.flags = 0; // Optional
beginInfo.pInheritanceInfo = nullptr; // Optional

if (vkBeginCommandBuffer(commandBuffer, &beginInfo) != VK_SUCCESS) {
    throw std::runtime_error("failed to begin recording command buffer!");
}
```

`flags` 는 명령 버퍼를 사용하는 방법을 지정합니다. 아래와 같은 값을 사용할 수 있습니다:

- `VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT`: 명령 버퍼는 한번 실행된 직후 다시 기록됩니다.`K_COMMAND_BUFFER_USAGE_RENDER_PASS_CONTINUE_BIT`: 단일 명령 버퍼 내에 완전히 포함될 보조 명령 버퍼입니다.
- `VK_COMMAND_BUFFER_USAGE_SIMULTANEOUS_USE_BIT`: 이미 실행 보류 중인 명령 버퍼를 다시 제출할 수 있습니다.

이 플래그 중 어느 것도 현재 적용할 수 없습니다.

`pInheritanceInfo` 매개변수는 보조 명령 버퍼에만 관련됩니다. 호출하는 기본 명령 버퍼에서 상속할 상태를 지정합니다.

명령 버퍼가 이미 한번 기록되었다면, [`vkBeginCommandBuffer`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkBeginCommandBuffer.html)를 호출하여 암시적으로 재설정합니다. 나중에 버퍼에 명령을 추가할 수 없습니다.

# 렌더 패스 시작

그리기는 [`vkCmdBeginRenderPass`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkCmdBeginRenderPass.html)로 렌더패스를 시작하는 것으로 시작됩니다. 렌더패스는 [`VkRenderPassBeginInfo`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkRenderPassBeginInfo.html) 구조체에 몇가지 매개변수를 사용하여 구성됩니다.

```cpp
VkRenderPassBeginInfo renderPassInfo{};
renderPassInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
renderPassInfo.renderPass = renderPass;
renderPassInfo.framebuffer = swapChainFramebuffers[imageIndex];
```

첫번째 매개변수는 렌더패스와 바인딩할 attachment 입니다. 우리는 색상 attachment로 지정된 각 스왑체인 이미지에 대해 프레임 버퍼를 만들었었습니다. 그러므로 우리가 그리고자 하는 스왑체인 이미지에 대한 프레임 버퍼를 바인딩해야 합니다. 전달받은 imageIndex 매개변수를 사용하는 것으로 현재 스왑체인 이미지에 적합한 프레임 버퍼를 선택할 수 있습니다.

```cpp
renderPassInfo.renderArea.offset = {0, 0};
renderPassInfo.renderArea.extent = swapChainExtent;
```

다음 두 매개변수는 렌더 영역의 크기를 정의합니다. 렌더 영역은 셰이더 로드 및 저장이 수행되는 위치를 정의합니다. 이 영역 밖의 픽셀은 정의되지 않은 값이 있습니다. 최상의 성능을 위해 attachment의 크기와 동일해야 합니다.

```cpp
VkClearValue clearColor = {{{0.0f, 0.0f, 0.0f, 1.0f}}};
renderPassInfo.clearValueCount = 1;
renderPassInfo.pClearValues = &clearColor;
```

마지막 두 매개변수는 색상 attachment에 대한 로드 작업으로 사용된  `VK_ATTACHMENT_LOAD_OP_CLEAR`를 사용하여 투명 값을 정의합니다. 저는 투명 색상을 100% 불투명도의 검은색으로 정의했습니다.

```cpp
vkCmdBeginRenderPass(commandBuffer, &renderPassInfo, VK_SUBPASS_CONTENTS_INLINE);
```

이제 렌더패스를 시작할 수 있습니다. 명령을 기록하는 모든 기능은 [`vkCmd`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkCmd.html) 접두사를 통해 인식할 수 있습니다. 그것들은 모두 `void`를 반환하므로, 기록을 마칠 때까지 오류를 핸들링하지 않습니다.

모든 명령의 첫번째 매개변수는 항상 명령을 기록할 명령 버퍼입니다. 두번째 매개변수는 제공한 렌더패스의 세부 정보를 지정합니다. 마지막 매개변수는 렌더패스 내에서 그리기 명령이 제공되는 방식을 제어합니다. 다음 두 값중 하나를 가질 수 있습니다.

- `VK_SUBPASS_CONTENTS_INLINE`: 렌더패스 명령은 기본 명령 버퍼에 포함되며, 보조 명령 버퍼는 실행되지 않습니다.
- `VK_SUBPASS_CONTENTS_SECONDARY_COMMAND_BUFFERS`: 렌더패스 명령은 보조 명령 버퍼에서 실행됩니다.

우리는 보조 명령 버퍼를 사용하지 않으므로 첫번째 옵션으로 하겠습니다.

# 기본 그리기 명령

이제 그래픽 파이프라인을 바인딩할 수 있습니다:

```cpp
vkCmdBindPipeline(commandBuffer, VK_PIPELINE_BIND_POINT_GRAPHICS, graphicsPipeline);
```

두번째 매개변수는 파이프라인 객체가 그래픽 파이프라인인지, 컴퓨트 파이프라인인지를 지정합니다. 이제 Vulkan에게 그래픽 파이프라인에서 실행될 작업과 조각 셰이더에서 사용할 attachment를 알려줬습니다.

[fixed functions chapter](https://vulkan-tutorial.com/Drawing_a_triangle/Graphics_pipeline_basics/Fixed_functions#dynamic-state)에서 언급했듯이, 이 파이프라인이 동적이 되도록 뷰포트와 시저 상태를 지정했었습니다. 따라서 그리기 명령을 실행하기 전에 명령 버퍼에 설정해야 합니다.

```cpp
VkViewport viewport{};
viewport.x = 0.0f;
viewport.y = 0.0f;
viewport.width = static_cast<float>(swapChainExtent.width);
viewport.height = static_cast<float>(swapChainExtent.height);
viewport.minDepth = 0.0f;
viewport.maxDepth = 1.0f;
vkCmdSetViewport(commandBuffer, 0, 1, &viewport);

VkRect2D scissor{};
scissor.offset = {0, 0};
scissor.extent = swapChainExtent;
vkCmdSetScissor(commandBuffer, 0, 1, &scissor);

```

이제 삼각형에 대한 그리기 명령을 실행할 준비가 되었습니다:

```cpp
vkCmdDraw(commandBuffer, 3, 1, 0, 0);
```

실제 [`vkCmdDraw`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkCmdDraw.html) 함수는 조금 실망스럽지만, 우리가 미리 지정한 정보들 때문에 매우 간단합니다. 명령 버퍼를 제외하고 다음 매개변수가 있습니다.

- `vertexCount`: 정점 버퍼가 없더라도, 기술적으로 아직 그릴 3개의 정점이 있습니다.
- `instanceCount`: 인스턴스 렌더링에 사용하며, 사용하지 않는다면 1입니다.
- `firstVertex`: 정점 버퍼에 대한 오프셋으로 사용되며 `gl_VertexIndex` 중 가장 낮은 값을 사용합니다.
- `firstInstance`: 인스턴스 렌더링의 오프셋으로 사용되며 `gl_InstanceIndex`의 가장 낮은 값을 사용합니다.

# 마무리

이제 렌더패스를 종료할 수 있습니다.

```cpp
vkCmdEndRenderPass(commandBuffer);

```

그리고 명령버퍼 기록을 마쳤습니다:

```cpp
if (vkEndCommandBuffer(commandBuffer) != VK_SUCCESS) {
    throw std::runtime_error("failed to record command buffer!");
}
```

다음 챕터에서는 메인 루프에 대한 코드를 작성하겠습니다. 이는 스왑체인에서 이미지를 획득하고 명령 버퍼를 기록, 실행한 다음, 스왑체인에 최종 이미지를 반환합니다.

[C++ code](https://vulkan-tutorial.com/code/14_command_buffers.cpp) / [Vertex shader](https://vulkan-tutorial.com/code/09_shader_base.vert) / [Fragment shader](https://vulkan-tutorial.com/code/09_shader_base.frag)