---
date: 2022-08-01
title: Vulkan Tutorial (5) - Draw a triangle - Setup - Instance
categories: ['Vulkan']
open: true
---

-[Khronos Vulkan Tutorial](https://docs.vulkan.org/tutorial/latest/00_Introduction.html)

# 인스턴스 생성

가장 먼저 인스턴스를 생성하여 Vulkan 라이브러리를 초기화해야 합니다. 인스턴스는 어플리케이션과 Vulkan 라이브러리 간의 연결이며, 어플리케이션에 대한 몇가지 정보를 드라이버에 지정하는 작업이 포함됩니다.

`createInstance` 함수를 추가하고 `initVulkan` 함수에서 호출합니다.

```cpp
void initVulkan() {
    createInstance();
}
```

추가로 인스턴스에 대한 핸들을 보유할 데이터 멤버를 추가합니다:

```cpp
private:
VkInstance instance;
```

이제 인스턴스를 생성하기 위해 우리들의 어플리케이션에 대한 몇가지 정보를 구조체에 추가해야 합니다. 이 데이터는 기술적으로 선택사항이지만, 특정 어플리케이션을 최적화하기 위해 드라이버에게 유용한 정보를 제공할 수도 있습니다. (특정 특수 동작으로 잘 알려진 그래픽 엔진을 사용하기 때문에). 이 구조체는 `VkApplicationInfo`입니다:

```cpp
void createInstance() {
    VkApplicationInfo appInfo{};
    appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
    appInfo.pApplicationName = "Hello Triangle";
    appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
    appInfo.pEngineName = "No Engine";
    appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
    appInfo.apiVersion = VK_API_VERSION_1_0;
}
```

앞에서 언급했듯이, Vulkan의 많은 구조체는 `sType` 멤버에 형식을 명시적으로 지정해야 합니다. 많은 구조체에 있는 것으로 `pNext`도 있는데, 미래에 확장 정보를 가리킬 수 있는 멤버입니다. 일단은 `nullPtr`로 초기화합니다.

Vulkan의 많은 정보들은 함수 매개변수 대신 구조체를 통해 전달이 됩니다. 인스턴스를 생성할 때 충분한 정보를 제공하려면 구조체를 하나 더 채워야 합니다. 다음 구조체는 선택사항이 아니며, Vulkan 드라이버에 전역 확장 및 유효성 검사 계층을 알려줍니다. 전역이란 의미는 특정 장치가 아닌 프로그램 전반에 적용되는 것을 말합니다. 다음 몇 챕터에서 명확해질 것입니다.

```cpp
VkInstanceCreateInfo createInfo{};
createInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
createInfo.pApplicationInfo = &appInfo;
```

처음 두 매개변수는 간단합니다. 다음 두 계층은 원하는 전역 확장을 지정합니다. Overview 챕터에서 말했듯이 Vulkan은 플랫폼에 구애받지 않는 API입니다. 즉, 창 시스템과 인터페이스 하려면 확장이 필요하다는 것입니다. GLFW는 우리가 구조체에 전달하기 위해 필요한 여러 확장을 반환하는 내장 함수들을 가지고 있습니다.

```cpp
uint32_t glfwExtensionCount = 0;
const char** glfwExtensions;

glfwExtensions = glfwGetRequiredInstanceExtensions(&glfwExtensionCount);

createInfo.enabledExtensionCount = glfwExtensionCount;
createInfo.ppEnabledExtensionNames = glfwExtensions;
```

구조체의 마지막 두 멤버는 활성화할 전역 유효성 검사 계층을 결정합니다. 우리는 다음 챕터에서 더 깊게 볼 것이므로, 지금은 비워두도록 합시다.

```cpp
createInfo.enabledLayerCount = 0;
```

이제 Vulkan이 인스턴스를 생성하는데 필요한 모든 것들을 지정했습니다. 드디어 `vkCreateInstance`를 호출할 수 있습니다.

```cpp
VkResult result = vkCreateInstance(&createInfo, nullptr, &instance);
```

보다시피 Vulkan에서 오브젝트 생성 함수의 매개변수가 따르는 일반적인 패턴은 이렇습니다:

- 생성 정보가 있는 구조체에 대한 포인터
- 할당 콜백 함수 포인터. 이 튜토리얼에서는 항상 `nullptr`.
- 새 오브젝트에 대한 핸들을 저장하는 변수에 대한 포인터

모든 것이 잘 되었다면 `VkInstance` 클래스 멤버에 인스턴스에 대한 핸들이 저장될 것입니다. 거의 모든 Vulkan 함수들은 `VkResult`를 반환하는데, `VK_SUCCESS` 이거나 에러 코드 값일 것입니다. 인스턴스가 성공적으로 생성되었는지를 체크하기 위해, 우리는 결과 값을 저장할 필요 없이 성공 값에 대한 확인을 하면 됩니다:

```cpp
if (vkCreateInstance(&createInfo, nullptr, &instance) != VK_SUCCESS) {
    throw std::runtime_error("failed to create instance!");
}
```

이제 프로그램을 실행하여 인스턴스가 생성되었는지 확인합니다.

# VK_ERROR_INCOMPATIBLE_DRIVER 발생시:

MacOS에서 최신 MoltenVK sdk를 사용할 때 `vkCreateInstance`에서 `VK_ERROR_INCOMPATIBLE_DRIVER`가 반환될 수 있습니다. [Getting Start Notes](https://vulkan.lunarg.com/doc/sdk/1.3.216.0/mac/getting_started.html)에 따르면 Vulkan SDK 1.3.216부터 `VK_KHR_PORTABILITY_subset` 확장이 필수입니다.

이 오류를 해결하려면, 먼저 VkInstanceCreateInfo 구조체에 `VK_INSTANCE_CREATE_ENUMERATE_PORTABILITY_BIT_KHR` 비트를 추가한 다음, 인스턴스 활성화 확장 리스트에 `VK_KHR_PORTABILITY_ENUMERATION_EXTENSION_NAME` 를 추가하세요:

```cpp
...

std::vector<const char*> requiredExtensions;

for(uint32_t i = 0; i < glfwExtensionCount; i++) {
    requiredExtensions.emplace_back(glfwExtensions[i]);
}

requiredExtensions.emplace_back(VK_KHR_PORTABILITY_ENUMERATION_EXTENSION_NAME)

createInfo.flags |= VK_INSTANCE_CREATE_ENUMERATE_PORTABILITY_BIT_KHR;

createInfo.enabledExtensionCount = (uint32_t) requiredExtensions.size();
createInfo.ppEnabledExtensionNames = requiredExtensions.data();

if (vkCreateInstance(&createInfo, nullptr, &instance) != VK_SUCCESS) {
    throw std::runtime_error("failed to create instance!");
}
```

# 확장 지원 확인

`vkCreateInstance` 문서를 보면 `VK_ERROR_EXTENSION_NOT_PRESENT` 오류 코드가 발생할 수 있는 것을 볼 수 있습니다. 간단히 필요한 확장을 지정하고 오류 코드가 발생하면 종료할 수 있습니다. 창 시스템 인터페이스같은 필수 확장에 대해 의미가 있지만, 선택적인 기능을 확인하려면 어떻게 해야 할까요?

인스턴스를 생성하기 전 지원되는 확장 리스트를 검색하는 `vkEnumerateInstanceExtensionProperties` 함수가 있습니다. 확장의 수와 확장에 대한 세부사항을 저장하는 vkExtensionProperties 배열을 저장하는 포인터 변수입니다. 또한 특정 유효성 계층을 필터링하는 확장을 첫번째 매개변수를 선택적으로 사용합니다. 이건 일단 무시합니다.

확장 세부 정보를 보유할 배열을 할당하기 위해서는 얼마나 필요한지 먼저 알아야 합니다. 후자의 매개변수를 비워 두어 확장의 수를 요청할 수 있습니다.

```cpp
uint32_t extensionCount = 0;
vkEnumerateInstanceExtensionProperties(nullptr, &extensionCount, nullptr);
```

이제 확장 세부 정보 보유할 배열을 할당합니다. (`include <vector>`):

```cpp
std::vector<VkExtensionProperties> extensions(extensionCount);
```

마지막으로 확장 세부 정보를 쿼리할 수 있습니다:

```cpp
vkEnumerateInstanceExtensionProperties(nullptr, &extensionCount, extensions.data());
```

각 `VkExtensionProperties` 구조체는 확장의 이름과 버전이 포함됩니다. for 루프로 간단히 나열할 수 있습니다. (`\t`는 들여쓰기를 위한 탭)

```cpp
std::cout << "available extensions:\n";

for (const auto& extension : extensions) {
    std::cout << '\t' << extension.extensionName << '\n';
}
```

Vulkan 지원에 대한 세부 정보를 제공하려는 경우 `createInstance` 함수에 이 코드를 추가할 수 있습니다. 도전과제로 지원 확장 리스트에서 `glfwGetRequiredInstanceExtensions`으로 반환되는 확장들을 확인하는 함수를 만들어보세요.

# 청소

[`VkInstance`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkInstance.html)는 프로그램이 종료되기 전에 파괴되어야 합니다. `cleanup`에서 [`vkDestoryInstance`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkDestroyInstance.html) 함수로 파괴할 수 있습니다:

```cpp
void cleanup() {
    vkDestroyInstance(instance, nullptr);

    glfwDestroyWindow(window);

    glfwTerminate();
}
```

[`vkDestroyInstance`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkDestroyInstance.html) 함수의 매개변수는 간단합니다. 이전 장에서 언급했듯, Vulkan의 할당과 해제는 선택적으로 할당자 콜백이 있으며 우리는 nullptr로 무시하고 넘어갑니다. 다음 장에서 생성할 Vulkan 리소스들은 모두 인스턴스가 파괴되기 전에 정리되어야 합니다.

[C++ code](https://vulkan-tutorial.com/code/01_instance_creation.cpp)