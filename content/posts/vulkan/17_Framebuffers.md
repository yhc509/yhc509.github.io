---
date: 2022-08-22
title: Vulkan Tutorial (17) - Draw a triangle - Drawing - Framebuffers
categories: ['Vulkan']
open: true
---

-[Khronos Vulkan Tutorial](https://docs.vulkan.org/tutorial/latest/00_Introduction.html)

우리는 지난 몇 챕터에서 프레임 버퍼에 대해 많이 이야기했고, 스왑체인 이미지와 동일한 형식의 단일 프레임 버퍼를 예상하도록 렌더패스를 설정했지만 실제로는 아직 만들지 않았습니다.

렌더패스 도중에 생성된 attachment는 [`VkFramebuffer`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkFramebuffer.html) 객체에 래핑되어 바인딩됩니다. 프레임 버퍼 객체는 attachment를 대표하는 모든 [`VkImageView`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkImageView.html) 객체를 참조합니다. 우리의 경우 단 하나 (색상 attachment)일 것입니다. 하지만 attachment에 사용해야 하는 이미지는 프레젠테이션을 위해 검색할 때 스왑체인이 반환하는 이미지에 따라 다릅니다. 즉, 스왑체인의 모든 이미지는 프레임 버퍼를 생성하고 그리기 시간에 검색된 이미지에 해당하는 프레임 버퍼를 사용해야 합니다.

프레임 버퍼를 담을 또 다른 `std::vector` 클래스 멤버를 생성합니다:

```cpp
std::vector<VkFramebuffer> swapChainFramebuffers;
```

`initVulkan`에서 그래픽 파이프라인을 생성한 직후에 `createFramebuffer`함수를 생성해줍니다.

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
}

...

void createFramebuffers() {

}
```

모든 프레임버퍼를 담을 수 있도록 컨테이너 크기를 조정하여 시작합니다.

```cpp
void createFramebuffers() {
    swapChainFramebuffers.resize(swapChainImageViews.size());
}
```

그 다음 image views를 반복하고 프레임버퍼를 만듭니다:

```cpp
for (size_t i = 0; i < swapChainImageViews.size(); i++) {
    VkImageView attachments[] = {
        swapChainImageViews[i]
    };

    VkFramebufferCreateInfo framebufferInfo{};
    framebufferInfo.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
    framebufferInfo.renderPass = renderPass;
    framebufferInfo.attachmentCount = 1;
    framebufferInfo.pAttachments = attachments;
    framebufferInfo.width = swapChainExtent.width;
    framebufferInfo.height = swapChainExtent.height;
    framebufferInfo.layers = 1;

    if (vkCreateFramebuffer(device, &framebufferInfo, nullptr, &swapChainFramebuffers[i]) != VK_SUCCESS) {
        throw std::runtime_error("failed to create framebuffer!");
    }
}
```

보다시피 프레임버퍼를 생성하는 것은 아주 간단합니다. 우리는 먼저 `renderPass`와 호환되어야 하는 프레임 버퍼를 지정해야 합니다. 렌더패스와 호환되는 프레임버퍼만 사용할 수 있습니다. 이는 대략 동일한 수의 attachment 타입을 사용한다는 뜻입니다. `attachmentCount`와 `pAttachments` 매개변수는 `VkImageView` 객체를 지정합니다. 이는 렌더패스 `pAttachment` 배열에 각 attachment 설명으로 바인딩 되어야 하는 객체입니다.

`width`와 `height` 매개변수는 설명이 필요없고 `layers`는 이미지 배열의 레이어 수를 참조합니다. 우리의 스왑체인 이미지는 단일 이미지이므로, 레이어 숫자는 `1`입니다.

우리는 이미지 뷰와 렌더패스 이전에 프레임 버퍼를 삭제해야 합니다. 단 우리가 렌더링을 종료한 후여야 합니다:

```cpp
void cleanup() {
    for (auto framebuffer : swapChainFramebuffers) {
        vkDestroyFramebuffer(device, framebuffer, nullptr);
    }

    ...
}
```

우리는 렌더링을 위해 필요한 모든 객체가 있습니다. 다음 챕터에서는 첫번째 실제 그리기 명령을 작성하겠습니다.

[C++ code](https://vulkan-tutorial.com/code/13_framebuffers.cpp) / [Vertex shader](https://vulkan-tutorial.com/code/09_shader_base.vert) / [Fragment shader](https://vulkan-tutorial.com/code/09_shader_base.frag)