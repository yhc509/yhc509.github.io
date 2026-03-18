---
date: 2022-09-05
title: Vulkan Tutorial (22) - Vertext buffers - Vertex input description
categories: ['Graphics/Vulkan']
open: true
---

-[Khronos Vulkan Tutorial](https://docs.vulkan.org/tutorial/latest/00_Introduction.html)

# 소개

다음 몇 챕터에서 우리는 정점셰이더의 하드코딩된 정점 데이터를 메모리의 정점 버퍼로 교체할 것입니다. CPU 가시적 버퍼를 생성하고 `memcpy`를 사용하여 정점 데이터를 직접적으로 복사하는 쉬운 접근부터 시작하여, 정점 데이터를 고성능 메모리에 복사하기 위해 스테이징 버퍼를 사용하는 방법을 볼 것입니다.

# 정점 셰이더

먼저 정점 셰이더가 더 이상 셰이더 코드 자체에 정점 데이터를 포함하지 않도록 합니다. 정점 셰이더는 `in` 키워드를 사용하여 정점 버퍼로부터 입력을 받습니다.

```glsl
#version 450

layout(location = 0) in vec2 inPosition;
layout(location = 1) in vec3 inColor;

layout(location = 0) out vec3 fragColor;

void main() {
    gl_Position = vec4(inPosition, 0.0, 1.0);
    fragColor = inColor;
}
```

`inPosition`과 `inColor` 변수는 정점 속성입니다. 이것들은 두 개의 배열을 사용하여 수동으로 위치와 색상을 지정한 것처럼 정점 버퍼에서 정점마다 지정되는 속성입니다. 정점 셰이더를 다시 컴파일하세요!

fagColor와 마찬가지로 layout(location = x)는 나중에 참조하는데 사용할 수 있도록 입력에 인덱스를 할당합니다. `dvec3` 64bit vector같은 몇가지 타입은 다중 슬롯을 사용한다는 것을 아는 것이 중요합니다. 이는 그 뒤의 인덱스가 최소 2 높아야 한다는 것을 의미합니다:

```glsl
layout(location = 0) in dvec3 inPosition;
layout(location = 2) in vec3 inColor;
```

[OpenGL wiki](https://www.khronos.org/opengl/wiki/Layout_Qualifier_(GLSL))에서 레이아웃 한정자에 대한 더 많은 정보를 찾아볼 수 있습니다.

# 정점 데이터

정점 데이터를 셰이더 코드에서 프로그램 코드의 배열로 이동합니다. GLM 라이브러리를 포함하는 것으로 시작합니다. 이 라이브러리는 벡터와 행렬같은 선형 대수 관련 타입을 제공합니다. 이러한 타입들을 사용하여 위치와 색상 벡터를 지정하겠습니다.

```cpp
#include <glm/glm.hpp>
```

정점 셰이더 내부에서 사용할 두 개의 속성이 있는 `Vertex` 구조체를 만듭니다.

```cpp
struct Vertex {
    glm::vec2 pos;
    glm::vec3 color;
};
```

GLM은 셰이더 언어에서 사용되는 벡터 타입과 정확히 일치하는 C++ 타입을 편하게 제공합니다.

```cpp
const std::vector<Vertex> vertices = {
    {{0.0f, -0.5f}, {1.0f, 0.0f, 0.0f}},
    {{0.5f, 0.5f}, {0.0f, 1.0f, 0.0f}},
    {{-0.5f, 0.5f}, {0.0f, 0.0f, 1.0f}}
};
```

이제 `Vertex` 구조체를 사용하여 정점 데이터 배열을 지정합니다. 이전과 동일한 위치와 색상 값을 사용하고 있지만, 이제는 정점 배열로 결합됩니다. 이를 정점 속성을 *interleaving* 한다고 합니다.

# 바인딩 설명

다음 단계는 Vulkan에게 GPU 메모리에 업로드된 후 이 정점 데이터 포맷을 정점 셰이더에 전달하는 방법을 알리는 것입니다. 

첫번째 구조는 [`VkVertexInputBindingDescription`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkVertexInputBindingDescription.html)입니다. 올바른 데이터로 채우기 위해 `Vertex` 구조체에 멤버 함수를 추가할 것입니다.

```cpp
struct Vertex {
    glm::vec2 pos;
    glm::vec3 color;

    static VkVertexInputBindingDescription getBindingDescription() {
        VkVertexInputBindingDescription bindingDescription{};

        return bindingDescription;
    }
};
```

정점 바인딩은 정점 전체에 걸쳐 메모리에서 데이터를 로드하는 속도를 설명합니다. 데이터 항목 사이의 바이트 수와 각 정점 또는 각 인스턴스 이후에 다음 데이터 항목으로 이동할지 여부를 지정합니다.

```cpp
VkVertexInputBindingDescription bindingDescription{};
bindingDescription.binding = 0;
bindingDescription.stride = sizeof(Vertex);
bindingDescription.inputRate = VK_VERTEX_INPUT_RATE_VERTEX;
```

모든 정점별 데이터는 하나의 배열에 함께 포장되므로, 하나의 바인딩만 갖게 됩니다. `binding` 매개변수는 바인딩 배열의 바인딩 인덱스를 지정합니다. `stride` 매개변수는 한 항목에서 다음 항목까지의 바이트 수를 지정하며, `inputRate` 매개변수는 다음 값 중 하나를 가질 수 있습니다:

- `VK_VERTEX_INPUT_RATE_VERTEX`: 각 정점 뒤의 다음 데이터 항목으로 이동
- `VK_VERTEX_INPUT_RATE_INSTANCE`: 각 인스턴스 이후 다음 데이터 항목으로 이동

인스턴스 렌더링을 사용하지 않을 것이므로 정점별 데이터를 사용하겠습니다.

# 속성 설명

정점 입력을 처리하는 방법을 설명하는 두번째 구조는 [`VKVertexInputAttributeDescription`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkVertexInputAttributeDescription.html)입니다. 이 구조체를 채우기 위해 `Vertex`에 또 다른 헬퍼 함수를 추가할 것입니다.

```cpp
#include <array>

...

static std::array<VkVertexInputAttributeDescription, 2> getAttributeDescriptions() {
    std::array<VkVertexInputAttributeDescription, 2> attributeDescriptions{};

    return attributeDescriptions;
}
```

함수 프로토타입에서 알 수 있듯, 이러한 구조는 두가지가 될 것입니다. 속성 설명 구조체는 바인딩 설명에서 비롯된 정점 데이터 청크에서 정점 속성을 추출하는 방법을 설명합니다. 우리는 위치와 색상 두가지 속성이 있으므로, 두개의 속성 설명 구조체가 필요합니다.

```cpp
attributeDescriptions[0].binding = 0;
attributeDescriptions[0].location = 0;
attributeDescriptions[0].format = VK_FORMAT_R32G32_SFLOAT;
attributeDescriptions[0].offset = offsetof(Vertex, pos);
```

`binding` 매개변수는 Vulkan에게 정점별 데이터와 바인딩을 알려줍니다. `location` 매개변수는 정점 셰이더에서 입력한 `location` 지시문을 참조합니다. 정점 셰이더에서 location `0`으로 된 입력은 32-bit float으로 된 position입니다.

`format` 매개변수는 속성에 대한 데이터 유형을 설명합니다. 약간 혼란스럽게도, 형식은 색상 형식과 동일한 열거형을 사용하여 지정됩니다. 일반적으로 다음 셰이더 유형 및 형식이 사용됩니다:

- `float`: `VK_FORMAT_R32_SFLOAT`
- `vec2`: `VK_FORMAT_R32G32_SFLOAT`
- `vec3`: `VK_FORMAT_R32G32B32_SFLOAT`
- `vec4`: `VK_FORMAT_R32G32B32A32_SFLOAT`

보시다시피 색상 채널의 양과 셰이더 데이터 유형의 구성 요소 수가 일치하는 형식을 사용해야 합니다. 셰이더의 구성 요소 수보다 더 많은 채널을 사용할 수 있지만 자동으로 삭제됩니다. 채널 수가 구성 요소 수보다 적으면 BGA 구성 요소는 기본값 `(0, 0, 1)`을 사용해야 합니다. 이 색상 타입 `(SFLOAT, UINT, SINT)`와 비트 너비도 셰이더 입력 유형과 일치해야 합니다. 다음 예를 참고하세요:

- `ivec2`: `VK_FORMAT_R32G32_SINT`, 32비트 부호있는 정수의 2성분 벡터
- `uvec4`: `VK_FORMAT_R32G32B32A32_UINT`, 32비트 부호없는 정수의 4성분 벡터
- `double`: `VK_FORMAT_R64_SFLOAT`, 64비트 부동 소수점

`format` 매개변수는 속성 데이터의 바이트 크기를 암시적으로 정의하고 `offset` 매개변수는 읽을 정점별 데이터의 시작 이후 바이트 수를 지정합니다. 바인딩은 하나의 `Vertex`를 로드하고 위치 속성(`pos`)는 이 구조체 시작 부분에 0 바이트 오프셋에 있습니다. 이것은 `offsetof` 매크로를 사용하여 자동적으로 계산됩니다.

```cpp
attributeDescriptions[1].binding = 0;
attributeDescriptions[1].location = 1;
attributeDescriptions[1].format = VK_FORMAT_R32G32B32_SFLOAT;
attributeDescriptions[1].offset = offsetof(Vertex, color);
```

color 속성은 거의 같은 방식으로 설명됩니다.

# 파이프라인 정점 입력

이제 `createGraphicsPipeline`의 구조를 참조하여 이 형식의 정점 데이터를 받아들이도록 그래픽 파이프라인을 설정해야 합니다. `vertexInputInfo` 구조체를 찾고 두 설명을 참조하도록 수정합니다.

```cpp
auto bindingDescription = Vertex::getBindingDescription();
auto attributeDescriptions = Vertex::getAttributeDescriptions();

vertexInputInfo.vertexBindingDescriptionCount = 1;
vertexInputInfo.vertexAttributeDescriptionCount = static_cast<uint32_t>(attributeDescriptions.size());
vertexInputInfo.pVertexBindingDescriptions = &bindingDescription;
vertexInputInfo.pVertexAttributeDescriptions = attributeDescriptions.data();
```

파이프라인은 이제 `vertices` 컨테이너의 형식을 받아 정점 셰이더에 넘길 준비가 되었습니다. 유효성 검사 레이어가 활성화된 상태에서 프로그램을 실행하면 바인딩된 정점 버퍼가 없다고 하는 것을 볼 수 있습니다. 다음 단계는 정점 버퍼를 만들고 정점 데이터를 GPU가 접근할 수 있도록 정점 버퍼로 이동하는 것입니다.

[C++ code](https://vulkan-tutorial.com/code/18_vertex_input.cpp) / [Vertex shader](https://vulkan-tutorial.com/code/18_shader_vertexbuffer.vert) / [Fragment shader](https://vulkan-tutorial.com/code/18_shader_vertexbuffer.frag)