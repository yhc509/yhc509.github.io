---
date: 2022-08-29
title: Vulkan Tutorial (21) - Draw a triangle - Swap chain recreation
categories: ['Graphics/Vulkan']
open: true
---

-[Khronos Vulkan Tutorial](https://docs.vulkan.org/tutorial/latest/00_Introduction.html)

# 소개

우리 어플리케이션은 이제 삼각형을 성공적으로 그립니다. 하지만 아직 제대로 처리되지 않는 몇가지 상황이 있습니다. 스왑체인이 더 이상 호환되지 않도록 윈도우 창이 변경될 수도 있습니다. 이 문제를 일으킬 수 있는 이유 중 하나는 창 크기가 변경되기 때문입니다. 우리는 이러한 이벤트를 포착하고 스왑체인을 다시 만들어야 합니다.

# 스왑체인 재생성

`createSwapChain`과 스왑체인 또는 창 크기에 의존하는 객체를 생성하는 모든 함수를 호출하는 `recreateSwapChain` 함수를 만듭니다.

```cpp
void recreateSwapChain() {
    vkDeviceWaitIdle(device);

    createSwapChain();
    createImageViews();
    createFramebuffers();
}
```

지난 챕터에서와 마찬가지로 아직 사용 중인 리소스를 건들면 안 되기 때문에 먼저 [`vkDeviceWaitIdle`](https://www.notion.so/Drawing-a-triangle-Swap-chain-recreation-7eabaac360454690976f8d769f53077e?pvs=21)을 호출합니다. 스왑체인 자체를 다시 만드는 것은 분명합니다. 이미지 뷰는 스왑체인 이미지에 직접 기반으로 하기 때문에 재생성해야 합니다. 마지막으로 프레임 버퍼는 스왑체인 이미지에 직접 의존하므로 재생성해야 합니다.

이러한 객체를 다시 만들기 전에 이전 버전을 확실히 정리하기 위해, 일부 정리 코드를 분리하여 `recreateSwapChain`에서 호출해야 합니다. 이 함수를 `cleanupSwapChain`이라고 부르겠습니다:

```cpp
void cleanupSwapChain() {

}

void recreateSwapChain() {
    vkDeviceWaitIdle(device);

    cleanupSwapChain();

    createSwapChain();
    createImageViews();
    createFramebuffers();
}
```

여기서는 단순성을 위해 렌더패스를 재생성하지 않습니다. 이론적으로, 스왑체인 이미지 형식은 어플리케이션 수명 동안 변경될 수 있습니다. 예를 들면 표준 범위에서 높은 동적 범위 모니터로 윈도우 창이 이동할 때입니다. 이는 응용프로그램에서 동적 범위간의 변경 사항이 제대로 반영되도록 렌더패스를 다시 만들어야 할 수 있습니다.

`cleanup`에서 `cleanupSwapChain`으로 스왑체인 새로고침의 일부로 재생성된 객체의 정리 코드를 이동시키겠습니다:

```cpp
void cleanupSwapChain() {
    for (size_t i = 0; i < swapChainFramebuffers.size(); i++) {
        vkDestroyFramebuffer(device, swapChainFramebuffers[i], nullptr);
    }

    for (size_t i = 0; i < swapChainImageViews.size(); i++) {
        vkDestroyImageView(device, swapChainImageViews[i], nullptr);
    }

    vkDestroySwapchainKHR(device, swapChain, nullptr);
}

void cleanup() {
    cleanupSwapChain();

    vkDestroyPipeline(device, graphicsPipeline, nullptr);
    vkDestroyPipelineLayout(device, pipelineLayout, nullptr);

    vkDestroyRenderPass(device, renderPass, nullptr);

    for (size_t i = 0; i < MAX_FRAMES_IN_FLIGHT; i++) {
        vkDestroySemaphore(device, renderFinishedSemaphores[i], nullptr);
        vkDestroySemaphore(device, imageAvailableSemaphores[i], nullptr);
        vkDestroyFence(device, inFlightFences[i], nullptr);
    }

    vkDestroyCommandPool(device, commandPool, nullptr);

    vkDestroyDevice(device, nullptr);

    if (enableValidationLayers) {
        DestroyDebugUtilsMessengerEXT(instance, debugMessenger, nullptr);
    }

    vkDestroySurfaceKHR(instance, surface, nullptr);
    vkDestroyInstance(instance, nullptr);

    glfwDestroyWindow(window);

    glfwTerminate();
}
```

`chooseSwapExtent`에서 이미 우리는 스왑체인 이미지가 올바른 사이즈인지 확인하기 위해 새 창 해상도를 쿼리하므로, `chooseSwapExtent`를 수정할 필요가 없습니다. (스왑체인을 만들 때 surface 해상도를 픽셀 단위로 가져오기 위해 `glfwGetFramebufferSize`를 이미 사용하고 있다는 것을 기억하세요.)

이것이 스왑체인을 재생성하는데 필요한 전부입니다! 하지만 이 접근 방식의 단점은 새 스왑체인을 만들기 전에 모든 렌더링을 중지해야 하는 것입니다. 이전 스왑체인에서 이미지를 그리는 동안 새 스왑체인을 만들 수 있습니다. 이전 스왑체인을 `VkSwapchainCreateInfoKHR` 구조체의 `oldSwapChain` 필드에 전달하고 사용이 끝나는 즉시 이전 스왑체인을 파괴해야 합니다.

# 차선책 또는 오래된 스왑체인

이제 우리는 스왑체인 재생성이 필요한 시점을 파악하고 새로운 `recreateSwapChain` 함수를 호출하기만 하면 됩니다. 운 좋게도 Vulkan은 일반적으로 프레젠테이션 중에 스왑체인이 더 이상 적절하지 않다고 알려줍니다.

vkAcquireNextImageKHR과 vkQueuePresentKHR 함수는 이를 위해 다음과 같은 특별한 값을 반환할 수 있습니다.

- `VK_ERROR_OUT_OF_DATE_KHR`: 스왑체인이 surface와 호환되지 않아 더 이상 렌더링에 사용할 수 없습니다. 일반적으로 창 크기 조정 후에 발생합니다.
- `VK_SUBOPTIMAL_KHR`: 스왑체인을 사용하여 성공적으로 surface에 표시할 수 있지만, surface 속성이 더 이상 정확히 일치하지 않습니다.

```cpp
VkResult result = vkAcquireNextImageKHR(device, swapChain, UINT64_MAX, imageAvailableSemaphores[currentFrame], VK_NULL_HANDLE, &imageIndex);

if (result == VK_ERROR_OUT_OF_DATE_KHR) {
    recreateSwapChain();
    return;
} else if (result != VK_SUCCESS && result != VK_SUBOPTIMAL_KHR) {
    throw std::runtime_error("failed to acquire swap chain image!");
}
```

이미지 획득을 시도할 때 스왑체인이 오래된 것으로 판명되면 더 이상 표시할 수 없습니다. 그러므로 즉시 스왑체인을 재생성하고 다음 `drawFame` 호출에서 시도해야 합니다.

스왑체인이 최적이 아닌 경우에도 그렇게 하도록 결정할 수 있지만, 이미 이미지를 획득했기 때문에 이 경우에는 그대로 진행하기로 결정했습니다.

`VK_SUCCESS`와 `VK_SUBOPTIMAL_KHR`은 둘 다 성공 반환 코드로 간주됩니다.

```cpp
result = vkQueuePresentKHR(presentQueue, &presentInfo);

if (result == VK_ERROR_OUT_OF_DATE_KHR || result == VK_SUBOPTIMAL_KHR) {
    recreateSwapChain();
} else if (result != VK_SUCCESS) {
    throw std::runtime_error("failed to present swap chain image!");
}

currentFrame = (currentFrame + 1) % MAX_FRAMES_IN_FLIGHT;
```

`vkQueuePresentKHR` 함수는 동일한 의미를 가진 동일한 값을 반환합니다. 이 경우 최상의 결과를 원하기 때문에 최적이 아닌 경우에도 스왑체인이 재생성됩니다.

# 교착 상태 수정

지금 코드를 실행하려고 하면 교착상태가 발생할 수 있습니다. 코드를 디버깅하면 어플리케이션이 `vkWaitForFences`에 도달하지만 더 진행되지 않는다는 것을 알 수 있습니다. `vkAcquireNextImageKHR`이 `VK_ERROR_OUT_OF_DATE_KHR`을 반환할 때, `drawFrame`에서 스왑체인을 재생성하고 반환하기 때문입니다. 그러나 그 전에 현재 프레임의 펜스가 기다리고 재설정되었습니다. 우리가 즉시 반환하기 때문에, 실행을 위해 제출된 작업이 없으며 펜스가 신호를 받지 않아 [`vkWaitForFences`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkWaitForFences.html)가 영원히 정지됩니다.

다행히 간단한 수정법이 있습니다. 작업이 제출될 것임을 확실히 알 수 있을 때까지 펜스 재설정을 연기하세요. 그러므로 일찍 반환하면 펜스는 여전히 신호를 받고, [`vkWaitForFences`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkWaitForFences.html) 다음에 동일한 펜스 객체를 사용할 때 교착상태가 되지 않습니다.

`drawFrame`의 시작부는 이제 다음과 같아야 합니다:

```cpp
vkWaitForFences(device, 1, &inFlightFences[currentFrame], VK_TRUE, UINT64_MAX);

uint32_t imageIndex;
VkResult result = vkAcquireNextImageKHR(device, swapChain, UINT64_MAX, imageAvailableSemaphores[currentFrame], VK_NULL_HANDLE, &imageIndex);

if (result == VK_ERROR_OUT_OF_DATE_KHR) {
    recreateSwapChain();
    return;
} else if (result != VK_SUCCESS && result != VK_SUBOPTIMAL_KHR) {
    throw std::runtime_error("failed to acquire swap chain image!");
}

// Only reset the fence if we are submitting work
vkResetFences(device, 1, &inFlightFences[currentFrame]);
```

# 명시적으로 크기 조정 처리

많은 드라이버와 플랫폼은 창 크기가 바뀐 후 자동적으로 `VK_ERROR_OUT_OF_DATE_KHR`이 트리거되지만, 발생이 보장되지는 않습니다. 그렇기 때문에 명시적으로 크기 조정을 처리하기 위해 몇가지 코드를 추가할 것입니다. 먼저 크기 조정이 발생했음을 알리는 새 멤버 변수를 추가합니다.

```cpp
std::vector<VkFence> inFlightFences;

bool framebufferResized = false;
```

`drawFrame` 함수가 이 플래그를 체크하도록 수정합니다:

```cpp
if (result == VK_ERROR_OUT_OF_DATE_KHR || result == VK_SUBOPTIMAL_KHR || framebufferResized) {
    framebufferResized = false;
    recreateSwapChain();
} else if (result != VK_SUCCESS) {
    ...
}
```

`vkQueuePresentKHR` 후에 세마포어가 일관된 상태인지 확인하는 것은 중요합니다. 그렇지 않으면 신호된 세마포어가 제대로 기다리지 않을 수 있습니다. 이제 실제로 크기 조정을 감지하기 위해 GLFW 프레임워크에 있는`glfwSetFramebufferSizeCallback` 함수를 사용하겠습니다:

```cpp
void initWindow() {
    glfwInit();

    glfwWindowHint(GLFW_CLIENT_API, GLFW_NO_API);

    window = glfwCreateWindow(WIDTH, HEIGHT, "Vulkan", nullptr, nullptr);
    glfwSetFramebufferSizeCallback(window, framebufferResizeCallback);
}

static void framebufferResizeCallback(GLFWwindow* window, int width, int height) {

}
```

콜백으로 `static` 함수를 만드는 이유는 GLFW가 `HelloTriangleApplication` 인스턴스에 대한 올바른 `this` 포인터를 호출하는 방법을 모르기 때문입니다.

하지만 콜백에서 `GLFWwindow`에 대한 참조를 얻고, 그 안에 임의의 포인터를 저장할 수 있는 또 다른 GLFW 함수가 있습니다. `glfwSetWindowUserPointer` 입니다.

```cpp
window = glfwCreateWindow(WIDTH, HEIGHT, "Vulkan", nullptr, nullptr);
glfwSetWindowUserPointer(window, this);
glfwSetFramebufferSizeCallback(window, framebufferResizeCallback);
```

이제 플래그를 올바르게 설정하기 위해 `glfwGetWindowUserPointer`를 사용하여 콜백 내에서 이 값을 검색할 수 있습니다.

```cpp
static void framebufferResizeCallback(GLFWwindow* window, int width, int height) {
    auto app = reinterpret_cast<HelloTriangleApplication*>(glfwGetWindowUserPointer(window));
    app->framebufferResized = true;
}
```

이제 프로그램을 실행하고 창 크기를 조정하여 프레임 버퍼가 창과 함께 실제로 크기가 조정되는지 확인합니다.

## 처리 최소화

스왑체인이 구식이 될 수 있는 또 다른 경우가 있는데, 이는 특별한 종류의 창 최소화입니다. 이 경우는 프레임 버퍼 크기가 `0`입니다. 이 튜토리얼에서는 `recreateSwapChain` 함수를 확장하여 창이 다시 포그라운드로 될 때까지 일시중지하여 처리합니다:

```cpp
void recreateSwapChain() {
    int width = 0, height = 0;
    glfwGetFramebufferSize(window, &width, &height);
    while (width == 0 || height == 0) {
        glfwGetFramebufferSize(window, &width, &height);
        glfwWaitEvents();
    }

    vkDeviceWaitIdle(device);

    ...
}
```

glfwGetFramebufferSize에 대한 초기 호출은 사이즈가 이미 정확하고 glfwWaitEvents를 기다리지 않는 경우를 처리합니다.

축하합니다. 이제 첫번째 잘 돌아가는 Vulkan 프로그램을 마무리했습니다! 다음 챕터에서는 정점 셰이더에서 하드코딩된 정점을 제거하고, 실제 정점 버퍼를 사용할 것입니다.

[C++ code](https://vulkan-tutorial.com/code/17_swap_chain_recreation.cpp) / [Vertex shader](https://vulkan-tutorial.com/code/09_shader_base.vert) / [Fragment shader](https://vulkan-tutorial.com/code/09_shader_base.frag)