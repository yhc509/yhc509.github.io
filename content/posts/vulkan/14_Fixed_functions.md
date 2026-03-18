---
date: 2022-08-15
title: Vulkan Tutorial (14) - Draw a triangle - Graphics Pipeline Basic - Fixed functions
categories: ['Graphics/Vulkan']
open: true
---

-[Khronos Vulkan Tutorial](https://docs.vulkan.org/tutorial/latest/00_Introduction.html)

이전 그래픽 API들은 대부분 그래픽 파이프라인 단계에 대해 기본 상태를 제공했습니다. Vulkan에서는 바뀌지 않는 파이프라인 상태 오브젝트로 구워질 것이기 때문에 대부분의 파이프라인에 대해 명시적이어야 합니다. 이 챕터에서는 이러한 고정 기능 연산을 구성하기 위한 구조를 채울 것입니다.

# 동적 상태

대부분의 파이프라인 상태가 구워지는 동안, 그리기 시간에 파이프라인을 다시 만들지 않고도 상태의 제한량이 변경될 수 있습니다. 예로 뷰포트의 크기, 선 너비와 블렌드 상수가 있습니다. 동적 상태를 사용하고 이러한 속성들을 유지하려면, `VkPipelineDynamicStateCreateInfo`에 다음과 같은 구조를 채워야 합니다:

```cpp
std::vector<VkDynamicState> dynamicStates = {
    VK_DYNAMIC_STATE_VIEWPORT,
    VK_DYNAMIC_STATE_SCISSOR
};

VkPipelineDynamicStateCreateInfo dynamicState{};
dynamicState.sType = VK_STRUCTURE_TYPE_PIPELINE_DYNAMIC_STATE_CREATE_INFO;
dynamicState.dynamicStateCount = static_cast<uint32_t>(dynamicStates.size());
dynamicState.pDynamicStates = dynamicStates.data();
```

이렇게 하면 값의 구성이 무시되고, 당신은 그리기 시간에 데이터를 지정할 수 있습니다. 유연한 설정의 결과는 뷰포트나 자르기 상태같이 매우 일반적인 것들을 파이프라인 상태로 구울 때 설정이 더 복잡해지는 것입니다.

# 정점 입력

`VkPipelineVertexInputStateCreateInfo` 구조체는 정점 셰이터에 전달될 정점 데이터의 형식을 설명합니다. 대략 두가지 방법으로 설명합니다:

- 바인딩 : 데이터 사이의 공간이 정점마다인지 인스턴스마다인지 ([instancing](https://en.wikipedia.org/wiki/Geometry_instancing) 참고)
- 속성 설명 : 정점 셰이더에 전달된 속성의 종류, 로드할 속성과 오프셋 바인딩

정점 셰이더에서 정점 데이터를 직접 작성하는 것은 어렵기 때문에, 지금은 정점 데이터를 로드하지 않도록 구조체를 채울 것입니다. 정점 버퍼 챕터에서 다시 다룰 것입니다.

```cpp
VkPipelineVertexInputStateCreateInfo vertexInputInfo{};
vertexInputInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO;
vertexInputInfo.vertexBindingDescriptionCount = 0;
vertexInputInfo.pVertexBindingDescriptions = nullptr; // Optional
vertexInputInfo.vertexAttributeDescriptionCount = 0;
vertexInputInfo.pVertexAttributeDescriptions = nullptr; // Optional
```

`pVertexBinidngDescriptions`와 `pVertexAttributeDescriptions` 멤버는 정점 데이터를 불러오기 위해 앞서 말한 세부 사항들을 설명하기 위한 구조체 배열을 가리킵니다. 이 구조체를 `createGraphicsPipeline` 함수의 `shaderStages` 배열 바로 뒤에 추가하세요.

# 입력 어셈블리

`VkPipelineInputAsemblyStateCreateInfo` 구조체는 두가지를 설명합니다: 정점들을 어떤 종류의 지오메트리로 그릴 것인지, 그리고 프리미티브 재시작이 활성화되어야 하는지입니다. 전자는 `topology` 멤버에서 지정되며 다음과 같은 값을 가질 수 있습니다:

- `VK_PRIMITIVE_TOPOLOGY_POINT_LIST`: 정점.
- `VK_PRIMITIVE_TOPOLOGY_LINE_LIST`: 재사용 없이 2개 정점의 선.
- `VK_PRIMITIVE_TOPOLOGY_LINE_STRIP`: 모든 선의 마지막 정점이 시작 정점을 다음 선의 시작 정점으로 사용됨.
- `VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST`: 재사용 없이 3개 정점의 삼각형.
- `VK_PRIMITIVE_TOPOLOGY_TRIANGLE_STRIP`: 모든 삼각형의 두번째와 세번째 정점이 다음 삼각형의 첫번째와 두번째 정점으로 사용됨.

일반적으로, 정점들은 정점 버퍼에서 인덱스에 따라 순차적으로 로드되지만, 요소 버퍼를 사용하면 인덱스를 직접 지정할 수 있습니다. 이를 통해 정점을 재사용하는 등의 최적화를 할 수 있습니다. `primitiveRestartEnable`을 VK_TRUE로 세팅하면, `0xFFFF`나 `0xFFFFFFFF` 같은 특별한 인덱스를 사용하여 `_STRIP` topology mode에서 선과 삼각형을 분할할 수 있습니다.

이 튜토리얼 전체에서 삼각형을 그릴 것이므로 다음과 같은 데이터를 사용합니다:

```cpp
VkPipelineInputAssemblyStateCreateInfo inputAssembly{};
inputAssembly.sType = VK_STRUCTURE_TYPE_PIPELINE_INPUT_ASSEMBLY_STATE_CREATE_INFO;
inputAssembly.topology = VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST;
inputAssembly.primitiveRestartEnable = VK_FALSE;
```

# 뷰포트와 시저

뷰포트는 기본적으로 출력이 렌더링될 프레임버퍼의 영역을 설명합니다. 이것은 항상 `(0, 0)`에서 `(width, height)`의 범위를 갖고 이 튜토리얼에서도 마찬가지입니다.

```cpp
VkViewport viewport{};
viewport.x = 0.0f;
viewport.y = 0.0f;
viewport.width = (float) swapChainExtent.width;
viewport.height = (float) swapChainExtent.height;
viewport.minDepth = 0.0f;
viewport.maxDepth = 1.0f;
```

스왑체인과 해당 이미지는 창의 `WIDTH`와 `HEIGHT`와 다를 수 있음을 기억하세요. 스왑체인 이미지는 나중에 프레임버퍼로 사용되므로, 그 크기를 유지해야만 합니다.

`minDepth`와 `maxDepth` 값은 프레임버퍼에 사용할 깊이 값의 범위를 지정합니다. 이 값들은 `[0.0f, 1.0f]` 범위에 있어야 하지만, `minDepth`는 `maxDepth`보다 높을 수 있습니다. 특별한 작업을 하지 않는 한, `0.0f`와 `1.0f`표준 값을 지켜야 합니다.

뷰포트가 이미지에서 프레임버퍼로 변환하는 한편, 시저 사각형(scissor rectangle)은 픽셀들이 실제로 저장되는 영역을 정의합니다. 시저 사각형 외부의 모든 픽셀들은 래스터라이저에 의해 폐기됩니다. 그것들은 변환보다는 필터와 같습니다. 차이점은 아래 그림에 있습니다. 왼쪽 시저 사각형은 뷰포트보다 큰 이미지를 생성하는 여러 가능성들 중 하나일 뿐입니다.

![viewports_scissors.png](./img/3c0df57b-69e8-427c-a136-4526e35549ec/viewports_scissors.png)

따라서 프레임 버퍼 전체를 그리고 싶다면 전체를 덮는 시저 사각형을 지정해야 합니다.

```cpp
VkRect2D scissor{};
scissor.offset = {0, 0};
scissor.extent = swapChainExtent;
```

뷰포트와 시저 사각형은 파이프라인의 정적 부분으로 지정하거나 명령 버퍼에 설정된 [동적 상태](https://vulkan-tutorial.com/Drawing_a_triangle/Graphics_pipeline_basics/Fixed_functions#dynamic-state)로 지정할 수 있습니다. 전자가 다른 상태와 좀 더 일치하지만, 뷰포트와 시저 상태를 동적으로 만드는 것이 훨씬 유연성있으므로 대체로 편리합니다. 이것은 매우 일반적이고 모든 구현에 성능 저하가 없이 동적 상태를 처리할 수 있습니다.

동적 뷰포트와 시저 사각형을 선택할 때 파이프라인에서 각각의 동적 상태를 활성화해야 합니다.

```cpp
std::vector<VkDynamicState> dynamicStates = {
    VK_DYNAMIC_STATE_VIEWPORT,
    VK_DYNAMIC_STATE_SCISSOR
};

VkPipelineDynamicStateCreateInfo dynamicState{};
dynamicState.sType = VK_STRUCTURE_TYPE_PIPELINE_DYNAMIC_STATE_CREATE_INFO;
dynamicState.dynamicStateCount = static_cast<uint32_t>(dynamicStates.size());
dynamicState.pDynamicStates = dynamicStates.data();
```

그리고 파이프라인 생성시 필요한 개수를 지정합니다:

```cpp
VkPipelineViewportStateCreateInfo viewportState{};
viewportState.sType = VK_STRUCTURE_TYPE_PIPELINE_VIEWPORT_STATE_CREATE_INFO;
viewportState.viewportCount = 1;
viewportState.scissorCount = 1;
```

실제 뷰포트와 시저 사각형은 나중에 그리기 시간에 설정됩니다.

동적 상태를 사용하면 단일 명령 버퍼에서 다른 뷰포트와 시저 사각형을 지정할 수 있습니다.

동적 상태가 없으면 뷰포트와 시저 사각형은 `VkPipelineViewportStateCreateInfo` 구조체를 사용하여 파이프라인에서 설정이 필요합니다. 이건 파이프라인의 뷰포트와 시저 사각형을 변경되지 않도록 만듭니다. 이러한 값들을 바꾸기 위해서는 새 값으로 생성된 새로운 파이프라인이 필요합니다.

```cpp
VkPipelineViewportStateCreateInfo viewportState{};
viewportState.sType = VK_STRUCTURE_TYPE_PIPELINE_VIEWPORT_STATE_CREATE_INFO;
viewportState.viewportCount = 1;
viewportState.pViewports = &viewport;
viewportState.scissorCount = 1;
viewportState.pScissors = &scissor;
```

어떻게 설정하든 상관없이, 일부 그래픽 카드에서 다중 뷰포트와 시저 사각형을 사용할 수 있으므로, 구조 멤버가 해당 배열을 참조하도록 합니다. 여러 개를 사용하려면 GPU 기능을 활성화해야 합니다. (logical device 생성을 참고하세요.)

# 래스터라이저

래스터라이저는 정점 셰이더의 정점들로 형성된 지오매트리를 가져와서 조각 셰이더의 색칠될 조각들로 바꿉니다. 또한 [깊이 테스트](https://en.wikipedia.org/wiki/Z-buffering), [페이스 컬링](https://en.wikipedia.org/wiki/Back-face_culling) 및 시저 테스트를 수행하며, 전체 다각형이나 가장자리만 채우는 조각들을 출력하도록 구성할 수 있습니다. (와이어프레임 렌더링) 이 모든 것은 `VkPipelineRasterizationStateCreateInfo` 구조체르 사용하여 구성됩니다.

```cpp
VkPipelineRasterizationStateCreateInfo rasterizer{};
rasterizer.sType = VK_STRUCTURE_TYPE_PIPELINE_RASTERIZATION_STATE_CREATE_INFO;
rasterizer.depthClampEnable = VK_FALSE;
```

`depClampEnable`을 `VK_TRUE`로 설정하면 근거리와 원거리 평면 너머에 있는 조각을 버리지 않고 고정합니다. 이것은 그림자 맵 같은 특별한 경우에 유용합니다. 이를 사용하려면 GPU 기능을 활성화해야 합니다.

```cpp
rasterizer.rasterizerDiscardEnable = VK_FALSE;
```

`rasterizerDiscardEnable`을 `VK_TRUE`로 설정하면 래스터라이저 단계에서 지오매트리가 통과되지 않습니다. 기본적으로 프레임 버퍼에 대한 모든 출력을 비활성화 합니다.

```cpp
rasterizer.polygonMode = VK_POLYGON_MODE_FILL;
```

`polygoneMode`는 지오매트리를 위한 조각이 어떻게 생성되는지를 결정합니다. 다음 모드를 사용할 수 있습니다:

- `VK_POLYGON_MODE_FILL`: 다각형 영역을 조각으로 채웁니다.
- `VK_POLYGON_MODE_LINE`: 폴리곤 모서리를 선으로 그립니다.
- `VK_POLYGON_MODE_POINT`: 다각형 정점을 점으로 그립니다.

채우기 외의 모드를 사용하려면 GPU 기능을 활성화해야 합니다.

```cpp
rasterizer.lineWidth = 1.0f;
```

`lineWidth`는 간단합니다. 선의 두께를 나타내며 조각의 수입니다. 최대 선 굵기는 하드웨어마다 다릅니다. 모든 선의 두깨가 `1.0f`보다 크려면 GPU 기능의 `wideLines`가 활성화되어야 합니다.

```cpp
rasterizer.cullMode = VK_CULL_MODE_BACK_BIT;
rasterizer.frontFace = VK_FRONT_FACE_CLOCKWISE;
```

`cullMode` 변수는 사용할 페이스 컬링 타입을 지정합니다. 컬링을 비활성화할 수 있고, 전면을 컬링하거나, 후면을 컬링하거나, 둘다 할 수 있습니다. `frontFace` 변수는 정면을 향하는 정점의 순서를 지정하며, 시계 방향이나 반시계 방향일 수 있습니다. 

```cpp
rasterizer.depthBiasEnable = VK_FALSE;
rasterizer.depthBiasConstantFactor = 0.0f; // Optional
rasterizer.depthBiasClamp = 0.0f; // Optional
rasterizer.depthBiasSlopeFactor = 0.0f; // Optional
```

래스터라이저는 상수를 추가하거나 조각의 기울기를 기반으로 바이어스하여 깊이 값을 변경할 수 있습니다. 이것은 종종 그림자 맵에 사용되지만 우리는 사용하지 않겠습니다. `depthBiasEnable`을 `VK_FALSE`로 지정하세요.

# 멀티 샘플링

`VkPipelineMultisampleStateCreateInfo` 구조체는 [안티앨리어싱](https://en.wikipedia.org/wiki/Multisample_anti-aliasing) 같은 멀티샘플링을 구성합니다. 동일한 픽셀로 래스터라이즈한 여러 다각형의 조각 셰이더를 결합하여 작동합니다. 이건 주로 가장 알아차리기 쉬운 앨리어싱 아티팩트가 발생하는 가장자리에서 발생합니다. 하나의 다각형만 픽셀에 매핑된다면 조각 셰이더를 여러번 실행할 필요가 없기 때문에, 고해상도로 렌더링한 다음 축소하는 것보다 비용이 저렴합니다. 활성화하려면 GPU 기능을 활성화해야 합니다.

```cpp
VkPipelineMultisampleStateCreateInfo multisampling{};
multisampling.sType = VK_STRUCTURE_TYPE_PIPELINE_MULTISAMPLE_STATE_CREATE_INFO;
multisampling.sampleShadingEnable = VK_FALSE;
multisampling.rasterizationSamples = VK_SAMPLE_COUNT_1_BIT;
multisampling.minSampleShading = 1.0f; // Optional
multisampling.pSampleMask = nullptr; // Optional
multisampling.alphaToCoverageEnable = VK_FALSE; // Optional
multisampling.alphaToOneEnable = VK_FALSE; // Optional
```

멀티샘플링은 이후 챕터에서 다룰 것이니 지금은 비활성화하겠습니다.

# 깊이 및 스텐실 테스트

깊이, 스텐실 버퍼를 사용하는 경우 `VkPipelineDepthStencilStateCreateInfo`를 사용하여 깊이와 스텐실 테스트도 구성해야 합니다. 지금 당장은 없으므로 구조체에 대한 포인터 대신 `nullptr`로 간단히 넘길 수 있습니다. 깊이 버퍼링 챕터에서 다시 다루겠습니다.

# 색상 혼합

조각 셰이더가 색상을 반환한 후에는 프레임 버퍼에 이미 있는 색상들을 혼합해야 합니다. 이 변환을 색상 혼합이라고 하며 두가지 방법이 있습니다:

- 이전 값과 새 값을 혼합하여 최종 색상을 생성
- 이전 값과 새 값을 비트 연산하여 결합

색상 혼합을 구성하는 두가지 구조체가 있습니다. 첫번째 구조체는 `VkpipelineColorBlendAttachmentState`이고 프레임 버퍼당 구성을 포함합니다. 두번째 구조체는 `VkPipelineColorBlendStateCreateInfo`이고 전역 색상 혼합 설정을 포함합니다. 우리는 하나의 프레임 버퍼만 있습니다:

```cpp
VkPipelineColorBlendAttachmentState colorBlendAttachment{};
colorBlendAttachment.colorWriteMask = VK_COLOR_COMPONENT_R_BIT | VK_COLOR_COMPONENT_G_BIT | VK_COLOR_COMPONENT_B_BIT | VK_COLOR_COMPONENT_A_BIT;
colorBlendAttachment.blendEnable = VK_FALSE;
colorBlendAttachment.srcColorBlendFactor = VK_BLEND_FACTOR_ONE; // Optional
colorBlendAttachment.dstColorBlendFactor = VK_BLEND_FACTOR_ZERO; // Optional
colorBlendAttachment.colorBlendOp = VK_BLEND_OP_ADD; // Optional
colorBlendAttachment.srcAlphaBlendFactor = VK_BLEND_FACTOR_ONE; // Optional
colorBlendAttachment.dstAlphaBlendFactor = VK_BLEND_FACTOR_ZERO; // Optional
colorBlendAttachment.alphaBlendOp = VK_BLEND_OP_ADD; // Optional
```

이 프레임 버퍼당 구조체를 사용하여 색상 혼합의 첫번째 방법을 구성할 수 있습니다. 수행될 작업은 다음 의사코드를 사용하여 가장 잘 시연됩니다:

```cpp
if (blendEnable) {
    finalColor.rgb = (srcColorBlendFactor * newColor.rgb) <colorBlendOp> (dstColorBlendFactor * oldColor.rgb);
    finalColor.a = (srcAlphaBlendFactor * newColor.a) <alphaBlendOp> (dstAlphaBlendFactor * oldColor.a);
} else {
    finalColor = newColor;
}

finalColor = finalColor & colorWriteMask;
```

`blendEnable`이 `VK_FALSE`이면 조각 셰이더의 새 색상이 수정되지 않은 상태로 전달됩니다. 그렇지 않으면 새로운 색상을 계산하기 위해 두 혼합 연산이 실행됩니다. 결과 색상은 `colorWriteMask`와 AND되어 실제 통과하는 채널을 결정합니다.

색상 혼합을 사용하는 가장 일반적인 경우는 불투명도에 따라 새 색상을 이전 색상과 혼합하는 알파 블렌딩입니다. `finalColor`는 다음과 같이 계산되어야 합니다.

```cpp
finalColor.rgb = newAlpha * newColor + (1 - newAlpha) * oldColor;
finalColor.a = newAlpha.a;
```

이는 다음 매개변수를 사용하여 수행할 수 있습니다:

```cpp
colorBlendAttachment.blendEnable = VK_TRUE;
colorBlendAttachment.srcColorBlendFactor = VK_BLEND_FACTOR_SRC_ALPHA;
colorBlendAttachment.dstColorBlendFactor = VK_BLEND_FACTOR_ONE_MINUS_SRC_ALPHA;
colorBlendAttachment.colorBlendOp = VK_BLEND_OP_ADD;
colorBlendAttachment.srcAlphaBlendFactor = VK_BLEND_FACTOR_ONE;
colorBlendAttachment.dstAlphaBlendFactor = VK_BLEND_FACTOR_ZERO;
colorBlendAttachment.alphaBlendOp = VK_BLEND_OP_ADD;
```

`VkBlendFactor`와 `VkBlendOp` 열거에서 가능한 작업을 찾을 수 있습니다.

두번째 구조는 모든 프레임 버퍼에 대한 구조 배열을 참조하며, 앞서 언급한 계산에서 혼합 계수로 사용할 혼합 상수를 설정할 수 있습니다.

```cpp
VkPipelineColorBlendStateCreateInfo colorBlending{};
colorBlending.sType = VK_STRUCTURE_TYPE_PIPELINE_COLOR_BLEND_STATE_CREATE_INFO;
colorBlending.logicOpEnable = VK_FALSE;
colorBlending.logicOp = VK_LOGIC_OP_COPY; // Optional
colorBlending.attachmentCount = 1;
colorBlending.pAttachments = &colorBlendAttachment;
colorBlending.blendConstants[0] = 0.0f; // Optional
colorBlending.blendConstants[1] = 0.0f; // Optional
colorBlending.blendConstants[2] = 0.0f; // Optional
colorBlending.blendConstants[3] = 0.0f; // Optional
```

두번째 혼합 방법(비트 조합)을 사용하려면, `logicOpEnable`을 `VK_TRUE`로 설정해야 합니다. 그러면 비트 연산을 `logicOp` 필드에서 지정할 수 있습니다. 마치 모든 연결된 프레임 버퍼에 대해 `blendEnable`을 `VK_FALSE`로 설정한 것처럼 첫번째 방법이 자동적으로 비활성화 됩니다. `colorWriteMask`는 이 모드에서 프레임 버퍼의 어떤 채널이 실제로 영향을 받을지 결정하는데 사용됩니다. 여기서 한 것처럼 두 모드를 모두 비활성화할 수도 있습니다. 이 경우에는 조각 색상이 수정되지 않은 상태로 프레임 버퍼에 기록됩니다.

# 파이프라인 레이아웃

셰이더에서 `uniform` 값을 사용할 수 있습니다. 이는 동적 상태 변수와 유사한 전역 변수인데, 셰이더의 동작을 바꾸기 위해 새로 만들지 않고도 그리기 시간에 변경할 수 있습니다. 그것들은 보통 변환 행렬을 정점 셰이더로 전달할 때 사용하거나, 조각 셰이더에서 텍스쳐 샘플러를 만들 때 사용합니다.

이러한 균일한 값들은 [`VkPipelineLayout`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkPipelineLayout.html) 개체를 만들어서 파이프라인 생성 중에 지정해야 합니다. 다음 챕터까지 사용하지 않겠지만 빈 파이프라인 레이아웃을 만들어야 합니다.

나중에 다른 함수에서 참조할 것이기 때문에 이 개체를 보유할 클래스를 만듭니다.

```cpp
VkPipelineLayout pipelineLayout;
```

그리고 `createGraphicsPipeline` 함수에서 개체를 만듭니다:

```cpp
VkPipelineLayoutCreateInfo pipelineLayoutInfo{};
pipelineLayoutInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO;
pipelineLayoutInfo.setLayoutCount = 0; // Optional
pipelineLayoutInfo.pSetLayouts = nullptr; // Optional
pipelineLayoutInfo.pushConstantRangeCount = 0; // Optional
pipelineLayoutInfo.pPushConstantRanges = nullptr; // Optional

if (vkCreatePipelineLayout(device, &pipelineLayoutInfo, nullptr, &pipelineLayout) != VK_SUCCESS) {
    throw std::runtime_error("failed to create pipeline layout!");
}
```

이 구조는 푸시 상수를 지정합니다. 이는 동적 값을 셰이더에 전달하는 또 다른 방법이며, 이후 챕터에서 다룹니다. 파이프라인 레이아웃은 프로그램 수명 내내 참조되므로 마지막에 파괴되어야 합니다:

```cpp
void cleanup() {
    vkDestroyPipelineLayout(device, pipelineLayout, nullptr);
    ...
}
```

# 결론

이것은 모든 고정 기능 상태에 대한 것입니다! 처음부터 설정하려면 많은 것이 필요하지만, 장점은 우리가 그래픽 파이프라인에서 일어나는 거의 모든 것을 알 수 있다는 것입니다! 이렇게 하면 특정 구성 요소의 기본 상태가 예상과 다름으로 인해 예상 못한 동작이 발생할 확률이 줄어듭니다.

하지만 최종적으로 그래픽 파이프라인을 생성하기 전에 생성해야 하는 개체가 하나 더 있습니다. 그것은 [렌더패스](https://vulkan-tutorial.com/Drawing_a_triangle/Graphics_pipeline_basics/Render_passes)입니다.

[C++ code](https://vulkan-tutorial.com/code/10_fixed_functions.cpp) / [Vertex shader](https://vulkan-tutorial.com/code/09_shader_base.vert) / [Fragment shader](https://vulkan-tutorial.com/code/09_shader_base.frag)