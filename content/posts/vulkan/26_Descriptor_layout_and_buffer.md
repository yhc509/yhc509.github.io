---
date: 2022-09-26
title: Vulkan Tutorial (26) - Uniform buffers - Descriptor layout and buffer
categories: ['Vulkan']
open: true
---

-[Khronos Vulkan Tutorial](https://docs.vulkan.org/tutorial/latest/00_Introduction.html)

# 소개

이제 각 정점의 정점 셰이더에 임의의 속성을 전달할 수 있지만, 전역 변수는 어떻습니까? 우리는 이 챕터에서 3D 그래픽스로 넘어갈 것이고, 이를 위해서는 model-view-projection 행렬이 필요합니다. 정점 데이터로 포함할 수 있지만, 이는 메모리 낭비이며 변환이 변경될 때마다 정점 버퍼를 업데이트 해야 합니다. 변환은 모든 단일 프레임을 쉽게 바꿀 수 있습니다.

Vulkan에서 이 문제를 해결하는 올바른 방법은 *resource decriptor*를 사용하는 것입니다. descriptor는 셰이더가 버퍼와 이미지 같은 리소스에 자유롭게 접근할 수 있는 방법입니다. 변환 행렬을 포함하는 버퍼를 설정하고 정점 셰이더가 descriptor를 통해 접근하도록 합니다. descriptor의 사용은 세 부분으로 구성됩니다:

- 파이프라인 생성 중 descriptor 레이아웃 지정
- descriptor 풀에서 descriptor set 할당
- 렌더링 중 descriptor set 바인딩

descriptor 레이아웃은 렌더 패스가 접근할 attachment 유형을 지정하는 것처럼, 파이프라인에서 접근할 리소스 유형을 지정합니다. 프레임 버퍼가 렌더 패스 attachment에 바인딩할 실제 이미지 뷰를 지정하는 것처럼, descriptor set는 디스크립터에 바인딩될 실제 버퍼 또는 이미지 리소스를 지정합니다.

descriptor에는 많은 유형이 있지만, 이 챕터에서는 uniform buffer objects (UBO)로 작업하겠습니다. 다음 챕터에서 다른 유형의 desciptor를 살펴보겠지만 기본 프로세스는 동일합니다. 정점 셰이더가 다음과 같이 C 구조체에 갖고자 하는 데이터가 있다고 가정해보겠습니다.

```cpp
struct UniformBufferObject {
    glm::mat4 model;
    glm::mat4 view;
    glm::mat4 proj;
};
```

그 다음 uniform buffer object descriptor를 통해 정점 셰이더에서 [`VkBuffer`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkBuffer.html)로 데이터를 복사할 수 있습니다:

```cpp
layout(binding = 0) uniform UniformBufferObject {
    mat4 model;
    mat4 view;
    mat4 proj;
} ubo;

void main() {
    gl_Position = ubo.proj * ubo.view * ubo.model * vec4(inPosition, 0.0, 1.0);
    fragColor = inColor;
}
```

우리는 이전 챕터에서 만든 사각형이 회전하도록 매 프레임마다 model, view, projection 행렬을 업데이트할 것입니다. 

# 정점 셰이더

위에서 지정한 것처럼 uniform buffer object를 포함하도록 정점 셰이더를 수정합니다. 당신이 MVP 변환에 익숙하다고 가정하겠습니다. 그렇지 않다면 첫번째 챕터에서 언급한 [리소스](https://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices/)를 보세요.

```cpp
#version 450

layout(binding = 0) uniform UniformBufferObject {
    mat4 model;
    mat4 view;
    mat4 proj;
} ubo;

layout(location = 0) in vec2 inPosition;
layout(location = 1) in vec3 inColor;

layout(location = 0) out vec3 fragColor;

void main() {
    gl_Position = ubo.proj * ubo.view * ubo.model * vec4(inPosition, 0.0, 1.0);
    fragColor = inColor;
}
```

`uniform`, `in`, `out` 정의의 순서는 중요하지 않습니다. `binding`은 속성에 대한 `location`과 유사합니다. descriptor 레이아웃에서 이 바인딩을 참조할 것입니다. gl_Position 줄은 클립 좌표의 최종 위치를 계산하기 위해 변환을 사용하도록 바꿉니다.  2D 삼각형과는 다르게, 클립 좌표의 마지막 컴포넌트는 `1`이 아닐 수 있습니다. 화면상에 정규화된 장치 좌표로 변환할 때 분할이 발생합니다. 이것은 원근 투영에서 원근 분할로 사용되며 가까운 물체를 멀리 있는 물체보다 크게 보이게 하는데 필수입니다.

# Descriptor set 레이아웃

다음 단계는 C++에 UBO를 정의하고 Vulkan에게 정점 셰이더에서 이 descripor에 대해 알려주는 것입니다.

```cpp
struct UniformBufferObject {
    glm::mat4 model;
    glm::mat4 view;
    glm::mat4 proj;
};
```

GLM에서 데이터 유형을 사용하여 셰이더의 정의를 정확히 일치시킬 수 있습니다. 행렬의 데이터는 셰이더가 예상하는 방식과 바이너리 호환 되므로, 나중에 `UniformBufferObject`에서 [`VkBuffer`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkBuffer.html)로 `memcpy`하기만 하면 됩니다.

파이프라인 생성을 위해 셰이더에 사용된 모든 descriptor 바인딩에 대한 세부 정보를 제공해야 합니다. `location` 인덱스를 모든 정점 속성에 대해 수행했던 것처럼 말이죠. 이 모든 정보를 정의하는 `createDescriptorSetLayout`라는 새 함수를 만듭니다. 파이프라인에서 필요하므로 파이프라인 생성 전에 호출해야 합니다.

```cpp
void initVulkan() {
    ...
    createDescriptorSetLayout();
    createGraphicsPipeline();
    ...
}

...

void createDescriptorSetLayout() {

}
```

모든 바인딩은 [`VkDescriptorSetLayoutBinding`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkDescriptorSetLayoutBinding.html) 구조체를 통해 설명되어야 합니다.

```cpp
void createDescriptorSetLayout() {
    VkDescriptorSetLayoutBinding uboLayoutBinding{};
    uboLayoutBinding.binding = 0;
    uboLayoutBinding.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
    uboLayoutBinding.descriptorCount = 1;
}
```

처음 두 필드는 셰이더에서 사용할 binding과 uniform buffer object인 descriptor의 유형을 지정합니다. 셰이더 변수는 uniform buffer object의 배열을 나타낼 수 있으며, `descriptorCount`는 배열의 길이를 지정합니다. 이는 스켈레톤 애니메이션에 대한 변환을 지정하는데 사용할 수 있습니다. 예를 들면 MVP 변환은 단일 uniform buffer object이므로, `descriptorCount`는 `1`을 사용하고 있습니다.

```cpp
uboLayoutBinding.stageFlags = VK_SHADER_STAGE_VERTEX_BIT;
```

또한 descriptor가 참조할 셰이더 단계를 지접해야 합니다. `stageFlags` 필드는 [`VkShaderStageFlagBits`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkShaderStageFlagBits.html) 값이나 `VK_SHADER_STAGE_ALL_GRAPHICS`의 조합일 수 있습니다. 우리의 경우, 정점 셰이더의 descriptor만 참조합니다.

```cpp
uboLayoutBinding.pImmutableSamplers = nullptr; // Optional
```

`pImmutableSamplers` 필드는 나중에 살펴볼 이미지 샘플링 관련 descriptor에만 관련이 있습니다. 기본 값으로 두겠습니다.

모든 descriptor 바인딩은 단일 [`VkDescriptorSetLayout`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkDescriptorSetLayout.html) 객체로 결합됩니다. `pipelineLayout` 위에 새로운 클래스 멤버를 정의합니다:

```cpp
VkDescriptorSetLayout descriptorSetLayout;
VkPipelineLayout pipelineLayout;
```

그 다음 [`vkCreateDescriptorSetLayout`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkCreateDescriptorSetLayout.html)을 사용하여 만들 수 있습니다. 이 함수는 바인딩 배열을 사용하는[`VkDescriptorSetLayoutCraeteInfo`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkDescriptorSetLayoutCreateInfo.html)를 허용합니다:

```cpp
VkDescriptorSetLayoutCreateInfo layoutInfo{};
layoutInfo.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
layoutInfo.bindingCount = 1;
layoutInfo.pBindings = &uboLayoutBinding;

if (vkCreateDescriptorSetLayout(device, &layoutInfo, nullptr, &descriptorSetLayout) != VK_SUCCESS) {
    throw std::runtime_error("failed to create descriptor set layout!");
}
```

셰이더가 사용할 descriptor를 Vulkan에게 알리기 위해 파이프라인 생성 중에 descriptor set 레이아웃을 지정해야 합니다. descriptor set 레이아웃은 파이프라인 레이아웃 객체에 지정됩니다. 레이아웃 객체를 참조하도록 [`VkPipelineLayoutCraeteInfo`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkPipelineLayoutCreateInfo.html)를 수정합니다:

```cpp
VkPipelineLayoutCreateInfo pipelineLayoutInfo{};
pipelineLayoutInfo.sType = VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO;
pipelineLayoutInfo.setLayoutCount = 1;
pipelineLayoutInfo.pSetLayouts = &descriptorSetLayout;
```

여기서 여러 descriptor set 레이아웃을 지정할 수 있는 이유가 궁금할 것입니다. 하나의 바인딩에 이미 모든 바인딩이 포함되어 있기 때문입니다. 다음 챕터에서 descriptor pool과 descriptor set에 대해 다시 살펴보겠습니다.

descriptor 레이아웃은 그래픽 파이프라인을 새로 생성하는 동안, 즉 프로그램이 끝날 때까지 계속 유지되어야 합니다:

```cpp
void cleanup() {
    cleanupSwapChain();

    vkDestroyDescriptorSetLayout(device, descriptorSetLayout, nullptr);

    ...
}
```

# Uniform buffer

다음 챕터에서 셰이더에 대한 UBO 데이터가 포함된 버퍼를 지정하지만, 먼저 이 버퍼를 만들어야 합니다. 매 프레임마다 새로운 데이터를 uniform 버퍼에 복사할 것이므로, 스테이징 버퍼를 갖는 것은 의미가 없습니다. 단지 오버헤드가 추가되고 성능을 저하시킬 뿐입니다.

우리는 여러 버퍼가 있어야 합니다. 여러 프레임이 동시에 flight 중일 수 있고, 이전 프레임이 아직 읽히는 동안 다음 프레임을 준비하기 위해 버퍼를 업데이트 하고 싶지 않기 때문입니다. 따라서 flight 중인 프레임 수만큼 현재 GPU에 의해 읽고 있지 않는 uniform 버퍼가 필요합니다. 

이를 위해 `uniformBuffer`와 `uniformBufferMemory` 클래스 멤버를 추가합니다:

```cpp
VkBuffer indexBuffer;
VkDeviceMemory indexBufferMemory;

std::vector<VkBuffer> uniformBuffers;
std::vector<VkDeviceMemory> uniformBuffersMemory;
```

마찬가지로, `createIndexBuffer` 후에 호출되고 버퍼를 할당하는 새 함수 `createUniformBuffers`를 생성합니다:

```cpp
void initVulkan() {
    ...
    createVertexBuffer();
    createIndexBuffer();
    createUniformBuffers();
    ...
}

...

void createUniformBuffers() {
    VkDeviceSize bufferSize = sizeof(UniformBufferObject);

    uniformBuffers.resize(MAX_FRAMES_IN_FLIGHT);
    uniformBuffersMemory.resize(MAX_FRAMES_IN_FLIGHT);

    for (size_t i = 0; i < MAX_FRAMES_IN_FLIGHT; i++) {
        createBuffer(bufferSize, VK_BUFFER_USAGE_UNIFORM_BUFFER_BIT, VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT, uniformBuffers[i], uniformBuffersMemory[i]);
    }
}
```

매 프레임마다 새로운 변환으로 uniform 버퍼를 업데이트하는 별도의 함수를 만들 것입니다. 따라서 여기에는 [`vkMapMemory`](https://www.notion.so/Master-Plan-1-7ac895a7cc894d3ca4868f33817bcce8?pvs=21)가 없습니다. uniform 데이터는 모든 그리기 호출에 사용되므로, 이를 포함하는 버퍼는 렌더링을 중지할 때만 파괴되어야 합니다.

```cpp
void cleanup() {
    ...

    for (size_t i = 0; i < MAX_FRAMES_IN_FLIGHT; i++) {
        vkDestroyBuffer(device, uniformBuffers[i], nullptr);
        vkFreeMemory(device, uniformBuffersMemory[i], nullptr);
    }

    vkDestroyDescriptorSetLayout(device, descriptorSetLayout, nullptr);

    ...

}
```

# uniform 데이터 업데이트

`updateUniformBuffer` 함수를 생성하고 `drawFrame` 함수에서 다음 프레임을 제출하기 전에 이 함수에 대한 호출을 추가합니다:

```cpp
void drawFrame() {
    ...

    updateUniformBuffer(currentFrame);

    ...

    VkSubmitInfo submitInfo{};
    submitInfo.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;

    ...
}

...

void updateUniformBuffer(uint32_t currentImage) {

}
```

이 함수는 매 프레임마다 새로운 변환을 생성하여 지오메트리를 회전시킵니다. 이를 기능을 구현하려면 두 개의 헤더를 포함해야 합니다.

```cpp
#define GLM_FORCE_RADIANS
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

#include <chrono>
```

`glm/gtc/matrix_transform.hpp` 헤더는 `glm::rotate` 같은 모델 변환, `glm::lookAt` 같은 뷰 변환, `glm::perspective` 같은 투영 변환을 생성할 때 사용하는 함수를 노출합니다. `GLM_FORCE_RADIANS` 정의는 가능한 혼동을 피하기 위해 `glm::rotate` 같은 함수가 라디안을 필수로 사용하도록 하는데 필요합니다.

`chrono` 표준 시간 라이브러리 헤더는 정확한 시간 기록을 수행하는 기능을 제공합니다. 이를 사용하여 프레임 속도에 상관없이 지오메트리가 초당 90도 회전하도록 합니다.

```cpp
void updateUniformBuffer(uint32_t currentImage) {
    static auto startTime = std::chrono::high_resolution_clock::now();

    auto currentTime = std::chrono::high_resolution_clock::now();
    float time = std::chrono::duration<float, std::chrono::seconds::period>(currentTime - startTime).count();
}
```

`updateUniformBuffer` 함수는 렌더링이 부동소수점 정확도로 시작된 이후, 시간을 초 단위로 계산하는 몇가지 로직으로 시작됩니다.

이제 uniform buffer object에서 모델, 뷰, 투영 변환을 정의합니다. 모델 회전은 `time` 변수를 사용하여 Z축을 중심으로 단순 회전합니다:

```cpp
UniformBufferObject ubo{};
ubo.model = glm::rotate(glm::mat4(1.0f), time * glm::radians(90.0f), glm::vec3(0.0f, 0.0f, 1.0f));
```

`glm::rotate` 함수는 기존 변환, 회전 각도와 회전 축을 매개변수로 사용합니다. `glm::mat4(1.0f)` 생성자는 단위 행렬을 반환합니다. `time * flm::radians(90.0f)`를 사용하면 초당 90도 회전의 목적을 달성합니다.

```cpp
ubo.view = glm::lookAt(glm::vec3(2.0f, 2.0f, 2.0f), glm::vec3(0.0f, 0.0f, 0.0f), glm::vec3(0.0f, 0.0f, 1.0f));
```

뷰 변환을 위해서 위에서 45도 각도로 지오메트리를 보기로 결정했습니다. `glm::lookAt` 함수는 눈 위치, 중심 위치 및 up축을 매개변수로 사용합니다.

```cpp
ubo.proj = glm::perspective(glm::radians(45.0f), swapChainExtent.width / (float) swapChainExtent.height, 0.1f, 10.0f);
```

저는 45도 수직 시야각으로 원근 투영을 사용하기로 선택했습니다. 다른 매개변수는 종횡비(aspect ratio), near와 far view plane입니다. 현재 스왑체인 범위를 사용하여 크기 조정 후 창의 새 너비와 높이를 고려하여 종횡비를 계산하는 것이 중요합니다.

```cpp
ubo.proj[1][1] *= -1;
```

GLM은 원래 클립 좌표의 Y좌표가 반전되는 OpenGL용으로 설계되었습니다. 이를 보상하는 쉬운 방법은 투영 행렬에서 Y축의 배율 인수 부호를 뒤집는 것입니다. 이렇게 하지 않으면 이미지가 거꾸로 렌더링됩니다.

이제 모든 변환이 정의되었으므로 uniform buffer object의 데이터를 현재 uniform 버퍼에 복사할 수 있습니다. 이것은 스테이징 버퍼가 없는 것을 제외하고는 정점 버퍼에 대해 했던 것과 정확히 같은 방식으로 발생합니다:

```cpp
void* data;
vkMapMemory(device, uniformBuffersMemory[currentImage], 0, sizeof(ubo), 0, &data);
    memcpy(data, &ubo, sizeof(ubo));
vkUnmapMemory(device, uniformBuffersMemory[currentImage]);
```

이렇게 UBO를 사용하는 것은 자주 변경되는 값을 셰이더에 전달하는 가장 효율적인 방법이 아닙니다. 작은 데이터 버퍼를 셰이더에 전달하는 더 효율적인 방법은 푸시 상수입니다. 다음 챕터에서 살펴보겠습니다.

다음 챕터에서 셰이더가 변환 데이터에 엑세스할 수 있도록 [`VkBuffers`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkBuffer.html)를 uniform buffer descriptor에 실제로 바인딩하는 descriptor set를 보겠습니다.

[C++ code](https://vulkan-tutorial.com/code/22_descriptor_layout.cpp) / [Vertex shader](https://vulkan-tutorial.com/code/22_shader_ubo.vert) / [Fragment shader](https://vulkan-tutorial.com/code/22_shader_ubo.frag)