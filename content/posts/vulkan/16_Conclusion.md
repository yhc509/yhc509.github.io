---
date: 2022-08-22
title: Vulkan Tutorial (16) - Draw a triangle - Graphics Pipeline Basic - Conclusion
categories: ['Graphics/Vulkan']
open: true
---

-[Khronos Vulkan Tutorial](https://docs.vulkan.org/tutorial/latest/00_Introduction.html)

이제 이전 장의 모든 구조와 개체를 합쳐서 그래픽 파이프라인을 만들 수 있습니다! 간략히 요약하면 다음과 같은 객체 유형이 있습니다:

- 셰이더 단계 : 그래픽 파이프라인의 프로그래밍 가능한 단계의 기능을 정의하는 셰이더 모듈
- 고정 기능 상태 : 입력 어셈블리, 래스터라이저, 뷰포트 및 색상 혼합 같은 파이프라인의 고정 기능을 정의하는 모든 구조
- 파이프라인 레이아웃 : 그리기 시간에 업데이트 할 수 있는 셰이더에서 참조하는 uniform 및 push 값
- 렌더 패스 : 파이프라인 단계에서 참조하는 attachment 및 사용

이것들이 결합하여 그래픽 파이프라인의 기능을 정의하므로, 이제 `createGraphicsPipeline`의 끝에 [`VkGraphicsPipelineCreateInfo`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkGraphicsPipelineCreateInfo.html) 구조를 채울 수 있습니다. 하지만 이것들을 생성하는 동안에도 계속 사용해야 하기 때문에 `vkDestroyShaderModule` 을 호출하기 전이여야 합니다.

```cpp
VkGraphicsPipelineCreateInfo pipelineInfo{};
pipelineInfo.sType = VK_STRUCTURE_TYPE_GRAPHICS_PIPELINE_CREATE_INFO;
pipelineInfo.stageCount = 2;
pipelineInfo.pStages = shaderStages;
```

[`VkPipelineShaderStageCreateInfo`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkPipelineShaderStageCreateInfo.html) 구조체 배열을 참조하는 것으로 시작합니다.

```cpp
pipelineInfo.pVertexInputState = &vertexInputInfo;
pipelineInfo.pInputAssemblyState = &inputAssembly;
pipelineInfo.pViewportState = &viewportState;
pipelineInfo.pRasterizationState = &rasterizer;
pipelineInfo.pMultisampleState = &multisampling;
pipelineInfo.pDepthStencilState = nullptr; // Optional
pipelineInfo.pColorBlendState = &colorBlending;
pipelineInfo.pDynamicState = &dynamicState;
```

그 다음 고정 기능 단계를 설명하는 모든 구조를 참조합니다.

```cpp
pipelineInfo.layout = pipelineLayout;
```

그 다음에는 구조체 포인터가 아닌 Vulkan 핸들인 파이프라인 레이아웃이 나옵니다.

```cpp
pipelineInfo.renderPass = renderPass;
pipelineInfo.subpass = 0;
```

마지막으로 렌더패스에 대한 참조와 그래픽 파이프라인이 사용할 서브패스의 인덱스가 있습니다. 이 특정 인스턴스 대신 이 파이프라인과 함께 다른 렌더패스를 사용할 수도 있지만, `rederPass`와 호환되어야 합니다. 호환성 요구사항은 [여기](https://www.khronos.org/registry/vulkan/specs/1.3-extensions/html/chap8.html#renderpass-compatibility)에 설명되어 있지만 이 튜토리얼에선 해당 기능을 사용하지 않습니다.

```cpp
pipelineInfo.basePipelineHandle = VK_NULL_HANDLE; // Optional
pipelineInfo.basePipelineIndex = -1; // Optional
```

실제로 두개의 매개변수가 더 있습니다: `basePipelineHandle`과 `basePipelineIndex`. Vulkan은 기존 파이프라인에서 파생하여 새로운 그래픽 파이프라인을 만들 수 있습니다. 파이프라인 파생 아이디어는 기존 파이프라인과 많은 기능을 공유하고 동일한 상위 파이프라인 간의 전환도 더 빠르게 수행할 수 있다면 파이프라인을 구성하는 비용이 더 적다는 것입니다. basePipelineHandler에 기존 파이프라인 핸들을 지정하거나, basePipelineIndex에 인덱스에 의해 생성될 다른 파이프라인을 참조할 수 있습니다. 지금은 단일 파이프라인만 있으므로 핸들에 null을 지정하고 적합하지 않은 인덱스를 지정하겠습니다. 이 값들은 [`VkGraphicsPipelineCreateInfo`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkGraphicsPipelineCreateInfo.html)의 `flag` 값이 `VK_PIPELINE_CREATE_DERIVATIVE_BIT` 으로 지정된 경우에만 사용됩니다.

이제 [`VkPipeline`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkPipeline.html) 객체를 담을 클래스 멤버를 생성하여 마지막 단계를 준비합니다:

```cpp
VkPipeline graphicsPipeline;
```

마지막으로 그래픽 파이프라인을 만듭니다:

```cpp
if (vkCreateGraphicsPipelines(device, VK_NULL_HANDLE, 1, &pipelineInfo, nullptr, &graphicsPipeline) != VK_SUCCESS) {
    throw std::runtime_error("failed to create graphics pipeline!");
}
```

이 [`vkCreateGraphicsPipeline`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkCreateGraphicsPipelines.html) 함수는 실제로 Vulkan의 일반적인 객체 생성 함수보다 더 많은 매개변수를 가집니다. 한 번의 호출로 여러 [`VkGraphicsPipelineCreateInfo`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkGraphicsPipelineCreateInfo.html) 객체를 가져와 여러 [`VkPipeline`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkPipeline.html) 객체를 생성하도록 설계되었습니다.

`VK_NULL_HANDLE`로 넘긴 두번째 매개변수는 선택적으로 [`VkPipelineCache`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkPipelineCache.html) 객체를 참조합니다. 파이프라인 캐시는 캐시가 파일에 저장된 경우, 여러 번의 [`vkCreateGrapihcsPipeline`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkCreateGraphicsPipelines.html) 호출과 프로그램 실행 전반에 걸쳐 파이프라인 생성과 관련된 데이터를 저장하고 재사용할 수 있습니다. 이를 통해 나중에 파이프라인 생성 속도를 크게 높일 수 있습니다. 파이프라인 캐시 챕터에서 설명하겠습니다.

그래픽 파이프라인은 모든 일반적인 그리기 작업에 필요하므로, 프로그램이 종료될 때에만 파괴되어야 합니다:

```cpp
void cleanup() {
    vkDestroyPipeline(device, graphicsPipeline, nullptr);
    vkDestroyPipelineLayout(device, pipelineLayout, nullptr);
    ...
}
```

이제 프로그램을 실행하여 이 모든 노력이 성공적인 파이프라인 생성으로 이어졌는지 확인하세요! 우리는 이미 화면에 무언가 나타나는 것에 거의 다가왔습니다. 다음 몇개의 챕터에서는 스왑 체인 이미지에서 실제 프레임 버퍼를 설정하고 그리기 명령을 준비합니다.

[C++ code](https://vulkan-tutorial.com/code/12_graphics_pipeline_complete.cpp) / [Vertex shader](https://vulkan-tutorial.com/code/09_shader_base.vert) / [Fragment shader](https://vulkan-tutorial.com/code/09_shader_base.frag)