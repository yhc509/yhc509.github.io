---
date: 2022-08-29
title: Vulkan Tutorial (20) - Draw a triangle - Drawing - Frames in flight
categories: ['Graphics/Vulkan']
open: true
---

-[Khronos Vulkan Tutorial](https://docs.vulkan.org/tutorial/latest/00_Introduction.html)

# 비행 중 프레임

지금 우리의 렌더루프에는 결함이 하나 있습니다. 다음 렌더링을 시작하기 전에 이전 프레임이 완료될 때까지 기다려야 하므로 호스트가 불필요하게 유휴 상태가 됩니다.

이 문제를 해결하는 방법은 여러 프레임이 한 번에 진행되도록 허용하는 것입니다. 즉, 한 프레임의 렌더링이 다음 프레임의 기록을 방해하지 않도록 하는 것입니다. 어떻게 해야 할까요? 렌더링 중에 엑세스, 수정되는 모든 리소스는 복제되어야 합니다. 따라서 여러 명령 버퍼, 세마포어, 펜스가 필요합니다. 이후 챕터에서 다른 리소스의 여러 인스턴스도 추가할 것이므로, 이 개념이 다시 나타나는 것을 볼 수 있을 것입니다.

동시에 처리해야 하는 프레임 수를 정의하는 상수를 프로그램 상단에 추가하여 시작합니다:

```cpp
const int MAX_FRAMES_IN_FLIGHT = 2;
```

CPU가 GPU 보다 너무 앞서는 것을 원하지 않기 때문에 숫자 2를 선택합니다. 2개의 프레임이 비행 중이면, CPU와 GPU가 동시에 자신들의 작업을 수행할 수 있습니다. CPU가 일찍 완료되면 GPU가 렌더링을 마칠 때까지 기다렸다가 추가 작업을 제출합니다. 3개 이상의 프레임이 전송되면, CPU가 GPU보다 앞서게 되어 지연 프레임이 추가될 수 있습니다. 일반적으로 지연시간은 바람직하지 않습니다. 그러나 비행 중인 프레임 수를 어플리케이션에서 제어하는 것은 Vulkan이 명시적임을 보여주는 또 다른 예입니다.

각 프레임에는 자체 명령 버퍼, 세마포어와 펜스가 세팅되어 있어야 합니다. `std::vector` 객체의 이름을 복수형으로 바꿉니다:

```cpp
std::vector<VkCommandBuffer> commandBuffers;

...

std::vector<VkSemaphore> imageAvailableSemaphores;
std::vector<VkSemaphore> renderFinishedSemaphores;
std::vector<VkFence> inFlightFences;
```

그 다음 여러 개의 명령 버퍼를 만들어야 합니다. `createCommandBuffer`를 `createCommandBuffers`로 이름을 바꿉니다. 우리는 명령 버퍼 벡터를 `MAX_FRAMES_IN_FLIGHT` 크기 만큼으로 바꿔야 합니다. [`VkCommandBufferAllocateInfo`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkCommandBufferAllocateInfo.html)를 그 만큼의 명령 버퍼를 포함하도록 바꾸고, 대상을 명령 버퍼의 벡터로 변경해야 합니다.

```cpp
void createCommandBuffers() {
    commandBuffers.resize(MAX_FRAMES_IN_FLIGHT);
    ...
    allocInfo.commandBufferCount = (uint32_t) commandBuffers.size();

    if (vkAllocateCommandBuffers(device, &allocInfo, commandBuffers.data()) != VK_SUCCESS) {
        throw std::runtime_error("failed to allocate command buffers!");
    }
}
```

객체를 생성하려면 `createSyncObjects` 함수를 바꿔야 합니다.

```cpp
void createSyncObjects() {
    imageAvailableSemaphores.resize(MAX_FRAMES_IN_FLIGHT);
    renderFinishedSemaphores.resize(MAX_FRAMES_IN_FLIGHT);
    inFlightFences.resize(MAX_FRAMES_IN_FLIGHT);

    VkSemaphoreCreateInfo semaphoreInfo{};
    semaphoreInfo.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;

    VkFenceCreateInfo fenceInfo{};
    fenceInfo.sType = VK_STRUCTURE_TYPE_FENCE_CREATE_INFO;
    fenceInfo.flags = VK_FENCE_CREATE_SIGNALED_BIT;

    for (size_t i = 0; i < MAX_FRAMES_IN_FLIGHT; i++) {
        if (vkCreateSemaphore(device, &semaphoreInfo, nullptr, &imageAvailableSemaphores[i]) != VK_SUCCESS ||
            vkCreateSemaphore(device, &semaphoreInfo, nullptr, &renderFinishedSemaphores[i]) != VK_SUCCESS ||
            vkCreateFence(device, &fenceInfo, nullptr, &inFlightFences[i]) != VK_SUCCESS) {

            throw std::runtime_error("failed to create synchronization objects for a frame!");
        }
    }
}
```

마찬가지로 모두 정리해야 합니다:

```cpp
void cleanup() {
    for (size_t i = 0; i < MAX_FRAMES_IN_FLIGHT; i++) {
        vkDestroySemaphore(device, renderFinishedSemaphores[i], nullptr);
        vkDestroySemaphore(device, imageAvailableSemaphores[i], nullptr);
        vkDestroyFence(device, inFlightFences[i], nullptr);
    }

    ...
}
```

명령 풀을 해제할 때 명령 버퍼가 해제되기 때문에 명령 버퍼 정리를 위해 추가로 할 일이 없다는 것을 기억하세요.

매 프레임마다 올바른 객체를 사용하려면, 현재 프레임을 추적해야 합니다. 이를 위해 프레임 인덱스를 사용하겠습니다.

```cpp
uint32_t currentFrame = 0;
```

`drawFrame` 함수를 수정하여 올바른 객체를 사용하도록 합니다:

```cpp
void drawFrame() {
    vkWaitForFences(device, 1, &inFlightFences[currentFrame], VK_TRUE, UINT64_MAX);
    vkResetFences(device, 1, &inFlightFences[currentFrame]);

    vkAcquireNextImageKHR(device, swapChain, UINT64_MAX, imageAvailableSemaphores[currentFrame], VK_NULL_HANDLE, &imageIndex);

    ...

    vkResetCommandBuffer(commandBuffers[currentFrame],  0);
    recordCommandBuffer(commandBuffers[currentFrame], imageIndex);

    ...

    submitInfo.pCommandBuffers = &commandBuffers[currentFrame];

    ...

    VkSemaphore waitSemaphores[] = {imageAvailableSemaphores[currentFrame]};

    ...

    VkSemaphore signalSemaphores[] = {renderFinishedSemaphores[currentFrame]};

    ...

    if (vkQueueSubmit(graphicsQueue, 1, &submitInfo, inFlightFences[currentFrame]) != VK_SUCCESS) {
}
```

물론, 매번 다음 프레임으로 넘어가는 것을 잊지 마세요:

```cpp
void drawFrame() {
    ...

    currentFrame = (currentFrame + 1) % MAX_FRAMES_IN_FLIGHT;
}
```

모듈로(%) 연산을 사용하여 `MAX_FRAMES_IN_FLIGHT` 만큼 대기열에 있는 프레임 인덱스가 반복되도록 합니다.

이제 대기열에 추가된 프레임이 MAX_FRAMES_IN_FLIGHT 이하이고,  이러한 프레임이 서로 겹치지 않도록 모든 동기화를 구현했습니다. 마지막 cleanup 같은 코드의 다른 부분은 괜찮습니다. [`vkDeviceWaitIdle`](https://www.notion.so/Drawing-a-triangle-Drawing-Frames-in-flight-7bc595835a7240f7a11112f48f06b00d?pvs=21) 같은 대략적인 동기화에 더 의존합니다. 성능 요구 사항에 따라 접근 방식을 결정해야 합니다.

예제를 통해 동기화에 대해 더 알아보려면 Khronos의 [광범위한 개요](https://www.notion.so/Drawing-a-triangle-Drawing-Frames-in-flight-7bc595835a7240f7a11112f48f06b00d?pvs=21)를 살펴보십시오.

다음 챕터에서 우리는 잘 작동하는 Vulkan 프로그램에 필요한 작은 것 하나를 더 다룰 것입니다.

[C++ code](https://vulkan-tutorial.com/code/16_frames_in_flight.cpp) / [Vertex shader](https://vulkan-tutorial.com/code/09_shader_base.vert) / [Fragment shader](https://vulkan-tutorial.com/code/09_shader_base.frag)