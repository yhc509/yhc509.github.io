---
date: 2022-08-15
title: Vulkan Tutorial (15) - Draw a triangle - Graphics Pipeline Basic - Render passes
categories: ['Graphics/Vulkan']
open: true
---

-[Khronos Vulkan Tutorial](https://docs.vulkan.org/tutorial/latest/00_Introduction.html)

# 설정

파이프라인 생성을 끝내기 전에 렌더링하는 동안 사용할 프레임버퍼 첨부사항에 대해 Vulkan에게 알려야 합니다. 색상과 깊이 버퍼의 수, 각각 사용할 샘플 수, 렌더링 작업 전반에 걸쳐 그것들을 처리할 방법을 지정해야 합니다. 이 모든 정보는 `createRenderPass`로 생성되는 렌더 패스 객체에 래핑됩니다. `initVulkan`에서 `createGraphicsPipeline` 이전에 이 함수를 호출하세요.

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
}

...

void createRenderPass() {

}
```

# 첨부 사항 설명

우리의 경우 스왑체인의 이미지 중 하나로 표시되는 단일 색상 첨부사항만 있을 것입니다.

```cpp
void createRenderPass() {
    VkAttachmentDescription colorAttachment{};
    colorAttachment.format = swapChainImageFormat;
    colorAttachment.samples = VK_SAMPLE_COUNT_1_BIT;
}
```

색상 첨부의 `format`은 스왑체인 이미지 형식과 일치해야 하고, 우리는 아직 멀티샘플링으로 아무 작업도 하지 않으므로 1개의 샘플로 고정합니다.

```cpp
colorAttachment.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
colorAttachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
```

`loopOp`와 `storeOp`은 렌더링 전/후에 첨부사항 데이터로 무슨 작업을 할지 결정합니다. `loopOp`에는 다음과 같은 선택 사항이 있습니다:

- `VK_ATTACHMENT_LOAD_OP_LOAD`: 첨부사항의 기존 내용 유지
- `VK_ATTACHMENT_LOAD_OP_CLEAR`: 시작할 때 값을 상수로 지움
- `VK_ATTACHMENT_LOAD_OP_DONT_CARE`: 정의되지 않은 내용이 존재함: 우리는 이것에 신경 쓸 필요가 없습니다.

우리의 경우 새 프레임을 크리기 전에 clear 작업을 사용하여 프레임 버퍼를 검은색으로 지웁니다. `storeOp`에는 두가지 선택이 가능합니다:

- `VK_ATTACHMENT_STORE_OP_STORE`: 렌더링된 내용은 메모리에 저장되며 나중에 읽을 수 있음
- `VK_ATTACHMENT_STORE_OP_DONT_CARE`: 프레임버퍼의 내용은 렌더링 작업 후 정의되지 않음

우리는 화면에 삼각형을 그려서 보고 싶으므로, 저장 작업을 진행하겠습니다.

```cpp
colorAttachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
colorAttachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
```

`loadOp`와 `storeOp`은 색상과 깊이 데이터에 적용합니다. 그리고 `stencilLoadOp` / `stencilStoreOp`은 스텐실 데이터에 적용합니다. 우리 어플리케이션은 스텐실 버퍼로 아무 작업도 하지 않으므로 로드, 저장 결과는 관련이 없습니다.

```cpp
colorAttachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
colorAttachment.finalLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;
```

Vulkan의 텍스쳐와 프레임 버퍼는 특정 픽셀 형식인 [`VkImage`](https://www.notion.so/Drawing-a-triangle-Graphics-pipeline-basics-Render-passes-8deb01398bec422d87751f5d946dca80?pvs=21) 객체로 표시됩니다. 그러나 메모리의 픽셀 레이아웃은 당신이 이미지로 하려는 작업에 따라 변경될 수 있습니다.

가장 일반적인 레이아웃들은 다음과 같습니다:

- `VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL`: 색상 첨부로 사용된 이미지
- `VK_IMAGE_LAYOUT_PRESENT_SRC_KHR`: 스왑체인에 표시될 이미지
- `VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL`: 메모리 복사 작업 대상으로 사용될 이미지

텍스쳐링 챕터에서 이 주제를 더 깊게 다룰 것이지만, 지금 알아야할 중요한 것은 이미지가 다음에 포함될 작업에 적합한 특정 레이아웃으로 전환되어야 한다는 것입니다.

`initialLayout`은 렌더패스가 시작하기 전에 이미지 레이아웃을 지정합니다. `finalLayout`은 렌더패스가 완료될 때 자동으로 전환할 레이아웃을 지정합니다. `initialLayout`의 `VK_IMAGE_LAYOUT_UNDEFINED`를 사용하는 것은 우리가 이전 이미지가 어떤 레이아웃에 있었는지 신경쓰지 않는다는 것을 의미합니다. 이 특별한 값의 주의사항은 이미지의 내용이 보존된다는 보장이 없지만, 어쨌든 우리는 지울 것이기 때문에 중요하지 않습니다. 우리는 렌더링 이후 스왑체인을 이용해서 이미지를 표시할 준비가 되기를 원하기에 `finalLayout`을 `VK_IMAGE_LAYOUT_PRESENT_SRC_KHR`로 사용합니다.

# 서브패스와 첨부 참조

단일 렌더패스는 여러 서브패스로 구성될 수 있습니다. 서브패스는 이전 패스의 프레임 버퍼 내용에 따라 달라지는 후속 렌더링 작업입니다. 예를 들어 차례대로 적용되는 일련의 포스트 프로세싱들이 있습니다. 이러한 렌더링 작업을 하나의 렌더패스로 그룹화하면, Vulkan은 작업을 재정렬하고 더 나은 성능을 위해 메모리 대역폭을 절약할 수 있습니다. 그러나 우리의 첫번째 삼각형에서는 단일 서브패스를 사용하겠습니다.

모든 서브패스는 이전 섹션에서 사용한 구조를 사용하여 설명한 하나 이상의 첨부를 참조합니다. 이 참조들은 다음과 같은 [`VkAttachmentReference`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkAttachmentReference.html) 구조체입니다.

```cpp
VkAttachmentReference colorAttachmentRef{};
colorAttachmentRef.attachment = 0;
colorAttachmentRef.layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;
```

`attachment` 매개변수는 첨부 설명 배열의 인덱스로 참조할 첨부를 지정합니다. 우리의 배열은 단일의 [`VkAttachmentDescription`](https://www.notion.so/Drawing-a-triangle-Graphics-pipeline-basics-Render-passes-8deb01398bec422d87751f5d946dca80?pvs=21)으로 구성되어 있으므로, index는 `0`입니다. 이 레이아웃은 참조를 사용하는 서브패스 중에 첨부에 포함할 레이아웃을 지정합니다. Vulkan은 서브패스가 시작할 때 자동으로 첨부를 이 레이아웃으로 전환합니다. 우리는 첨부를 색상 버퍼로 사용하고 `VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTILMAL` 레이아웃은 이름에서 알 수 있듯 최고의 성능을 제공할 것입니다.

서브패스는 [`VkSubpassDescription`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkSubpassDescription.html) 구조를 사용하여 설명합니다:

```cpp
VkSubpassDescription subpass{};
subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
```

Vulkan이 향후 컴퓨트 서브패스도 지원할 수 있으므로, 이것이 그래픽 서브패스임을 인지해야 합니다. 다음으로, 색상 첨부에 대한 참조를 지정합니다:

```cpp
subpass.colorAttachmentCount = 1;
subpass.pColorAttachments = &colorAttachmentRef;
```

이 배열에 있는 첨부 인덱스는 조각 셰이더에 있는`layout(location = 0) out vec4 outColor`를 직접적으로 참조합니다!

서브패스에서 참조될 수 있는 첨부들의 타입은 다음과 같습니다:

- `pInputAttachments`: 셰이더에서 읽은 첨부
- `pResolveAttachments`: 멀티샘플링에서 사용할 색상 첨부에 대한 첨부
- `pDepthStencilAttachment`: 깊이와 스텐실 데이터에 대한 첨부
- `pPreserveAttachments`: 이 서브패스에서 사용하지 않지만, 보존해야 하는 데이터에 대한 첨부

# 렌더 패스

이제 첨부와 기본 서브패스에 대해 설명했으므로 렌더패스를 생성할 수 있습니다. `pipelineLayout` 변수 위에 [`VkRenderPass`](https://www.notion.so/Drawing-a-triangle-Graphics-pipeline-basics-Render-passes-8deb01398bec422d87751f5d946dca80?pvs=21) 객체를 보관할 멤버 변수를 생성합니다.

```cpp
VkRenderPass renderPass;
VkPipelineLayout pipelineLayout;
```

렌더 패스 객체는 [`VkRenderPassCreateInfo`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkRenderPassCreateInfo.html)를 첨부 배열과 서브패스로 구조를 채워서 생성될 수 있습니다. [`VkAttachmentReference`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkAttachmentReference.html) 객체는 이 배열의 인덱스를 사용하여 첨부를 참조합니다.

```cpp
VkRenderPassCreateInfo renderPassInfo{};
renderPassInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;
renderPassInfo.attachmentCount = 1;
renderPassInfo.pAttachments = &colorAttachment;
renderPassInfo.subpassCount = 1;
renderPassInfo.pSubpasses = &subpass;

if (vkCreateRenderPass(device, &renderPassInfo, nullptr, &renderPass) != VK_SUCCESS) {
    throw std::runtime_error("failed to create render pass!");
}
```

파이프라인 레이아웃과 마찬가지로, 렌더패스는 프로그램 전체에서 참조되므로 마지막에 정리해야 합니다:

```cpp
void cleanup() {
    vkDestroyPipelineLayout(device, pipelineLayout, nullptr);
    vkDestroyRenderPass(device, renderPass, nullptr);
    ...
}
```

많은 작업이 필요했지만, 다음 챕터에서는 드디어 그래픽 파이프라인 객체를 만듭니다!

[C++ code](https://vulkan-tutorial.com/code/11_render_passes.cpp) / [Vertex shader](https://vulkan-tutorial.com/code/09_shader_base.vert) / [Fragment shader](https://vulkan-tutorial.com/code/09_shader_base.frag)