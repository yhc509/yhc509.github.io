---
date: 2022-08-01
title: Vulkan Tutorial (6) - Draw a triangle - Setup - Validation Layers
categories: ['Graphics/Vulkan']
open: true
---

-[Khronos Vulkan Tutorial](https://docs.vulkan.org/tutorial/latest/00_Introduction.html)

# 유효성 검사 레이어(validataion layer)는 무엇입니까?

Vulkan API는 드라이버 오버헤드를 최소화한다는 아이디어를 중심으로 설계되었으며, 그 목표의 표현 중 하나는 기본적으로 API에서 매우 제한된 오류 검사가 있다는 것입니다. 잘못된 값으로 열거형을 설정하거나 필수 매개변수에 nullptr을 전달하는 것과 같은 단순한 실수도, 일반적으로는 명시적으로 처리되지 않으며 단순히 크래시나 정의되지 않은 동작을 일으킵니다. Vulkan은 수행하는 모든 작업에 대해 매우 명시적이어야 하기 때문에, 새로운 GPU 기능을 사용하거나 논리적 장치 생성을 할 때 요청하는 것을 잊어버리는 등의 작은 실수를 하기 쉽습니다.

그러나 이러한 검사를 API에 추가할 수 없다는 것은 아닙니다. Vulkan은 유효성 검사 레이어라는 우아한 시스템을 도입했습니다. 유효성 검사 레이어는 Vulkan 함수 호출에 연결하여 추가 작업을 적용하는 선택적인 구성 요소입니다. 유효성 검사 레이어 작업은 일반적으로 다음과 같습니다.

- 사양에 대한 매개변수 값을 확인하여 잘못된 사용 감지
- 리소스 누수를 찾기 위해 객체 생성 및 파괴 추적
- 호출이 시작된 스레드를 추적하여 스레드 안전성 확인
- 모든 호출과 매개변수를 표준 출력에 기록
- 프로파일링과 리플레이를 위한 Vulkan 호출 추적

다음은 진단 유효성 검사 레이어에서 기능을 구현하는 예입니다:

```cpp
VkResult vkCreateInstance(
    const VkInstanceCreateInfo* pCreateInfo,
    const VkAllocationCallbacks* pAllocator,
    VkInstance* instance) {

    if (pCreateInfo == nullptr || instance == nullptr) {
        log("Null pointer passed to required parameter!");
        return VK_ERROR_INITIALIZATION_FAILED;
    }

    return real_vkCreateInstance(pCreateInfo, pAllocator, instance);
}
```

이러한 유효성 검사 레이어는 관심있는 모든 디버깅 기능을 포함하도록 자유롭게 쌓을 수 있습니다. 디버그 빌드에 대해 유효성 검사 레이어를 활성화하고 릴리즈 빌드에 대해 비활성화하면 두 가지 장점을 모두 누릴 수 있습니다!

Vulkan에는 검증 레이어가 내장되어 있지 않지만, LunarG Vulkan SDK는 일반적인 오류를 확인하는 훌륭한 레이어 세트를 제공합니다. 이것들은 모두 완전히 [오픈소스](https://github.com/KhronosGroup/Vulkan-ValidationLayers)이므로, 어떤 종류의 실수를 하는지 확인하고 기여할 수 있습니다. 유효성 검사 계층을 사용하는 것은 정의되지 않은 동작에 의해 어플리케이션이 중단되는 것을 막는 좋은 방법입니다.

검사 계층은 시스템에 설치된 경우에만 사용할 수 있습니다. 예를 들어, LunarG 유효성 검사 레이어는 Vulkan SDK가 설치된 PC에서만 사용할 수 있습니다.

Vulkan에는 이전에 두 가지 유형의 유효성 검사 레이어가 있었습니다:인스턴스 레이어와 장치별 레이어입니다. 이 아이디어는 인스턴스 레이어가 인스턴스와 같은 전역 Vulkan 객체에 관련된 호출만 확인하고, 장치별 레이어는 특정 GPU와 관련된 호출만 확인한다는 것입니다. 장치별 레이어는 더 이상 사용되지 않습니다. 즉, 인스턴스 유효성 검사 레이어가 모든 Vulkan 호출에 적용됩니다. 사양 문서에는 일부 구현에 필요한 호환성을 위해 장치 수준에서 유효성 검사 레이어를 활성화할 것을 여전히 권장합니다. [나중에 볼](https://vulkan-tutorial.com/Drawing_a_triangle/Setup/Logical_device_and_queues) 논리적 디바이스 수준에서 인스턴스와 동일한 레이어를 지정하기만 하면 됩니다.

# 유효성 검사 레이어 사용하기

이 섹션에서는 Vulkan SDK에서 제공하는 표준 진단 레이어를 활성화하는 방법을 살펴보겠습니다. 확장과 마찬가지로 유효성 검사 레이어는 이름을 지정하여 활성화해야 합니다. 모든 유용한 표준 유효성 검사는 `VK_LAYER_KHRONOS_validataion`이라고 하는, SDK에 포함되어 있는 레이어에 번들로 제공됩니다.

먼저 활성화할 계층과 활성화 여부를 지정하기 위해 프로그램에 두 개의 구성 변수를 추가해보겠습니다. 프로그램이 디버그 모드에서 컴파일되는지 여부에 따라, 해당 값을 기반으로 할 것입니다. `NDEBUG` 매크로는 C++ 표준의 일부이며, ‘디버그가 아님’을 의미합니다.

```cpp
const uint32_t WIDTH = 800;
const uint32_t HEIGHT = 600;

const std::vector<const char*> validationLayers = {
    "VK_LAYER_KHRONOS_validation"
};

#ifdef NDEBUG
    const bool enableValidationLayers = false;
#else
    const bool enableValidationLayers = true;
#endif
```

새로운 함수 `checkValidationLayerSupport`를 추가하겠습니다. 이 함수는 요청된 모든 레이어를 사용할 수 있는지 확인합니다. 먼저 [`vkEnumerateInstancelayerProperties`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkEnumerateInstanceLayerProperties.html)를 사용하여 사용 가능한 모든 레이어를 나열합니다. 사용법은 [`vkEnumerateInstanceExtensionProperties`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkEnumerateInstanceExtensionProperties.html)와 동일합니다. 이는 이전 챕터에서 논의했었습니다.

```cpp
bool checkValidationLayerSupport() {
    uint32_t layerCount;
    vkEnumerateInstanceLayerProperties(&layerCount, nullptr);

    std::vector<VkLayerProperties> availableLayers(layerCount);
    vkEnumerateInstanceLayerProperties(&layerCount, availableLayers.data());

    return false;
}
```

다음으로, `validationLayers`의 모든 레이어가 `availableLayers` 리스트에 있는지 확인합니다. `strcmp`를 위해 `<cstring>`을 include해야 합니다.

```cpp
for (const char* layerName : validationLayers) {
    bool layerFound = false;

    for (const auto& layerProperties : availableLayers) {
        if (strcmp(layerName, layerProperties.layerName) == 0) {
            layerFound = true;
            break;
        }
    }

    if (!layerFound) {
        return false;
    }
}

return true;
```

`createInstance`에서 이 함수를 사용합니다:

```cpp
void createInstance() {
    if (enableValidationLayers && !checkValidationLayerSupport()) {
        throw std::runtime_error("validation layers requested, but not available!");
    }

    ...
}
```

이제 디버그 모드에서 프로그램을 실행하고, 오류가 발생하지 않는지 확인하세요. 만약 발생한다면 FAQ를 살펴보세요.

마지막으로 유효성 검사 레이어 이름이 활성화된 경우, 이를 포함하도록 [`VkInstanceCreateInfo`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkInstanceCreateInfo.html) 구조체를 수정합니다.

```cpp
if (enableValidationLayers) {
    createInfo.enabledLayerCount = static_cast<uint32_t>(validationLayers.size());
    createInfo.ppEnabledLayerNames = validationLayers.data();
} else {
    createInfo.enabledLayerCount = 0;
}
```

[`vkCreateInstance`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkCreateInstance.html)가 `VK_ERROR_LAYER_NOT_PRESENT` 오류를 반환하지 않아야 합니다. 반드시 프로그램을 실행해서 확인해보세요.

# 메세지 콜백

유효성 검사 레이어는 기본적으로 디버그 메세지를 표준 출력으로 프린트하지 않지만, 프로그램에서 명시적으로 콜백을 제공하여 처리할 수 있습니다. 또한 모든 메세지가 반드시 fatal 에러는 아니기 때문에 보고 싶은 메세지 종류를 결정할 수 있습니다. 지금 당장 하고 싶지 않다면 이 챕터의 마지막 섹션으로 건너뛰어도 됩니다.

메세지 및 관련 세부 정보를 처리하기 위해 프로그램에서 콜백을 설정하려면 `VK_EXT_debug_utils` 확장을 사용하여 콜백으로 디버그 메신저를 설정해야 합니다.

먼저 유효성 검사 레이어가 사용되었는지 여부에 따라, 필요한 확장 목록을 반환하는 `getRequiredExtensions` 함수를 만듭니다.

```cpp
std::vector<const char*> getRequiredExtensions() {
    uint32_t glfwExtensionCount = 0;
    const char** glfwExtensions;
    glfwExtensions = glfwGetRequiredInstanceExtensions(&glfwExtensionCount);

    std::vector<const char*> extensions(glfwExtensions, glfwExtensions + glfwExtensionCount);

    if (enableValidationLayers) {
        extensions.push_back(VK_EXT_DEBUG_UTILS_EXTENSION_NAME);
    }

    return extensions;
}
```

GLFW에서 지정한 확장은 항상 필요하지만, 디버그 메신저 확장은 조건부로 추가됩니다. 여기서 `VK_EXT_debug_utils`와 동일한 `VK_EXT_DEBUG_UTILS_EXTENSION_NAME`을 사용했습니다. 이 매크로를 사용하면 오타를 피할 수 있습니다.
이제 이 함수를 `createInstance` 함수에서 사용할 수 있습니다:

```cpp
auto extensions = getRequiredExtensions();
createInfo.enabledExtensionCount = static_cast<uint32_t>(extensions.size());
createInfo.ppEnabledExtensionNames = extensions.data();
```

프로그램을 실행하여 `VK_ERROR_EXTENSION_NOT_PRESENT` 오류가 발생하지 않는지 확인하세요. 우리는 이 확장이 존재하는지 진짜로 체크할 필요는 없습니다. 유효성 검사 레이어의 가용성에 의해 암시적으로 되기 때문입니다.

이제 디버그 콜백 함수가 어떻게 생겼는지 봅시다. 새로운 static 멤버 함수 `debugCallback`을 만듭니다. `PFN_vkDebugUtilsMessengerCallbackEXT` 프로토타입을 사용할 것입니다. `VKAPI_ATTR`과 `VKAPI_CALL`은 Vulkan이 호출할 수 있는 올바른 서명이 함수에 있는지 확인합니다.

```cpp
static VKAPI_ATTR VkBool32 VKAPI_CALL debugCallback(
    VkDebugUtilsMessageSeverityFlagBitsEXT messageSeverity,
    VkDebugUtilsMessageTypeFlagsEXT messageType,
    const VkDebugUtilsMessengerCallbackDataEXT* pCallbackData,
    void* pUserData) {

    std::cerr << "validation layer: " << pCallbackData->pMessage << std::endl;

    return VK_FALSE;
}
```

첫번째 매개변수는 메세지의 심각도를 지정합니다. 다음 플래그 중 하나입니다:

- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT`: 진단 메세지
- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_INFO_BIT_EXT`: 리소스 생성 같은 정보 메세지
- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT`: 오류는 아니지만 어플리케이션의 버그일 가능성이 높은 동작에 대한 메세지
- `VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT`: 유효하지 않고 크래시를 일으킬 수 있는 동작에 대한 메세지

이 열거형의 값은 비교 작업을 사용하여 메세지가 특정 심각도 수준과 같거나 더 나쁜지 확인할 수 있는 방식으로 설정됩니다. 예를 들면 다음과 같습니다:

```cpp
if (messageSeverity >= VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT) {
    // Message is important enough to show
}
```

`messageType` 매개변수는 다음 값을 가질 수 있습니다:

- `VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT`: 사양 또는 성능과 관련이 없는 일부 이벤트가 발생
- `VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT`: 사양을 위반하거나 가능한 실수를 나타내는 이벤트가 발생
- `VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT`: Vulkan에 잠재적으로 최적화되지 않은 사용

`pCallbackData` 매개변수는 메세지 자체의 세부 정보를 포함하는 `VkDebugUtilMessengerCallbackDataEXT` 구조체를 참조하며, 가장 중요한 구성원은 다음과 같습니다:

- `pMessage`: null로 끝나는 문자열로 된 디버그 메세지
- `pObjects`: 메세지와 관련된 Vulkan 객체 핸들의 배열
- `objectCount`: 배열의 객체 수

마지막으로, `pUserData` 매개변수는 콜백 설정 중에 지정된 포인터가 포함되어 있으며, 이를 통해 자신의 데이터를 전달할 수 있습니다.

콜백은 Vulkan이 유효성 검사 레이어 메세지로 트리거된 호출을 중단해야하는지 여부를 나타내는 boolean을 반환합니다. 콜백이 true를 반환하면 `VK_ERROR_VALIDATION_FAILED_EXT` 에러와 함께 중단됩니다. 일반적으로 유효성 검사 레이어 자체를 테스트하는데만 사용되므로 항상 `VK_FALSE`를 반환해야 합니다.

이제 남은 것은 콜백 함수에 대해 Vulkan에 알리는 것입니다. 아마도 놀랍게도 Vulkan의 디버그 콜백조차도 명시적으로 생성, 소멸되어야 하는 핸들로 관리됩니다. 이러한 콜백은 디버그 메신저의 일부이며, 원하는 만큼 가질 수 있습니다. `instance` 바로 아래에 핸들의 클래스 멤버를 추가합니다:

```cpp
VkDebugUtilsMessengerEXT debugMessenger;
```

이제 `initVulkan`에서 `createInstance` 바로 뒤에 호출할 setupDebugMessenger 함수를 추가합니다.

```cpp
void initVulkan() {
    createInstance();
    setupDebugMessenger();
}

void setupDebugMessenger() {
    if (!enableValidationLayers) return;

}
```

메신저와 콜백에 대한 세부 정보로 구조체를 채워야 합니다:

```cpp
VkDebugUtilsMessengerCreateInfoEXT createInfo{};
createInfo.sType = VK_STRUCTURE_TYPE_DEBUG_UTILS_MESSENGER_CREATE_INFO_EXT;
createInfo.messageSeverity = VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT;
createInfo.messageType = VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT;
createInfo.pfnUserCallback = debugCallback;
createInfo.pUserData = nullptr; // Optional
```

`messageSeverity` 필드를 사용하면 콜백을 호출할 모든 심각도 유형을 지정할 수 있습니다. 여기에서 `VK_DEBUG_UTILS_MESSAGE_SEVERITY_INFO_BIT_EXT`를 제외한 모든 유형을 지정하여 방대한 일반 디버그 정보들을 생략하면서 가능한 문제에 대한 알림을 수신했습니다.

마찬가지로 `messageType` 필드를 사용하면 콜백에 알림을 받는 메세지 유형을 필터링 할 수 있습니다. 여기에서 모든 유형을 단순히 활성화했습니다. 유용하지 않은 경우 언제든지 비활성화 할 수 있습니다.

마지막으로 `pfnUserCallback` 필드는 콜백 함수에 대한 포인터를 지정합니다. 선택적으로 `pUserData` 매개변수를 통해 콜백 함수에 전달될 `pUserData` 필드에 대한 포인터를 전달할 수 있습니다. 예를 들어, 이것을 사용하여 `HelloTriangleApplication` 클래스에 대한 포인터를 전달할 수 있습니다.

유효성 검사 레이어 메세지를 구성하고 콜백을 디버그하는 방법은 많지만, 이 튜토리얼을 시작하는 데에는 이것이 좋은 설정입니다. 다른 방법에 대해서는 이 [확장 사양](https://www.khronos.org/registry/vulkan/specs/1.3-extensions/html/chap50.html#VK_EXT_debug_utils)을 참조하세요.

이 구조체는 `VkDebugUtilsMessengerEXT` 객체를 생성하기 위해 `vkCreateDebugUtilsMessengerEXT` 함수에 전달되어야 합니다. 안타깝게도 이 함수는 확장 함수이기 때문에 자동으로 로드되지 않습니다. [`vkGetInstanceProcAddr`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkGetInstanceProcAddr.html)를 사용하여 주소를 직접 조회해야 합니다. 이를 백그라운드에서 처리하는 자체 프록시 함수를 만들 것입니다. `HelloTriangleApplication` 클래스 정의 바로 위에 추가했습니다.

```cpp
VkResult CreateDebugUtilsMessengerEXT(VkInstance instance, const VkDebugUtilsMessengerCreateInfoEXT* pCreateInfo, const VkAllocationCallbacks* pAllocator, VkDebugUtilsMessengerEXT* pDebugMessenger) {
    auto func = (PFN_vkCreateDebugUtilsMessengerEXT) vkGetInstanceProcAddr(instance, "vkCreateDebugUtilsMessengerEXT");
    if (func != nullptr) {
        return func(instance, pCreateInfo, pAllocator, pDebugMessenger);
    } else {
        return VK_ERROR_EXTENSION_NOT_PRESENT;
    }
}
```

[`vkGetInstanceProcAddr`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkGetInstanceProcAddr.html) 함수는 로드할 수 없는 경우 `nullptr`을 반환합니다. 이제 이 함수를 호출하여 사용 가능한 경우 확장 객체를 만들 수 있습니다.

```cpp
if (CreateDebugUtilsMessengerEXT(instance, &createInfo, nullptr, &debugMessenger) != VK_SUCCESS) {
    throw std::runtime_error("failed to set up debug messenger!");
}
```

마지막에서 두번째 매개변수는 콜백에 대한 할당자이며 옵션입니다. 우리는 `nullptr`로 설정하겠습니다. 나머지 매개변수들은 간단합니다. 디버그 메신저는 Vulkan 인스턴스와 해당 계층에 대해 특정되기 때문에 첫번째 인수를 명시적으로 지정해야 합니다. 나중에 다른 *자식* 객체들에 대해서도 이 패턴을 볼 수 있습니다.

`VkDebugUtilsMessengerEXT` 객체도 `vkDestroyDebugUtilsMessengerEXT`를 호출하여 정리해야 합니다. `vkCreateDebugUtilsMessengerEXT`와 비슷하게 함수를 명시적으로 로드해야 합니다.

`CreateDebugUtilsMessengerEXT` 바로 아래에 다른 프록시 함수를 만듭니다 :

```cpp
void DestroyDebugUtilsMessengerEXT(VkInstance instance, VkDebugUtilsMessengerEXT debugMessenger, const VkAllocationCallbacks* pAllocator) {
    auto func = (PFN_vkDestroyDebugUtilsMessengerEXT) vkGetInstanceProcAddr(instance, "vkDestroyDebugUtilsMessengerEXT");
    if (func != nullptr) {
        func(instance, debugMessenger, pAllocator);
    }
}
```

이 함수가 정적 클래스이거나 클래스 외부의 함수인지 확인하세요. 그 다음 `cleanup` 함수에서 호출할 수 있습니다.

```cpp
void cleanup() {
    if (enableValidationLayers) {
        DestroyDebugUtilsMessengerEXT(instance, debugMessenger, nullptr);
    }

    vkDestroyInstance(instance, nullptr);

    glfwDestroyWindow(window);

    glfwTerminate();
}
```

# 디버깅 인스턴스 생성 및 파괴

이제 유효성 검사 레이어를 사용한 디버깅을 프로그램에 추가했지만 아직 모든 것을 다루지는 않았습니다. `vkCreateDebugUtilsMessengerEXT`를 호출하려면 유효한 인스턴스가 생성되어야 하며 인스턴스가 삭제되기 전에 `vkDestroyDebugUtilsMessengerEXT`를 호출해야 합니다. 이로 인해 현재 [`vkCreateInstance`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkCreateInstance.html) 및 [`vkDestroyInstance`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkDestroyInstance.html) 호출 시 발생할 수 있는 문제를 디버그할 수 없습니다.

하지만 [확장 문서](https://github.com/KhronosGroup/Vulkan-Docs/blob/master/appendices/VK_EXT_debug_utils.txt#L120)를 자세히 읽어보면 이 두 함수의 호출을 위해 특별히 별도의 디버그 유틸리티 메신저를 만드는 방법이 있다는 것을 알 수 있습니다. [`VkInstanceCreateInfo`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/VkInstanceCreateInfo.html)의 `pNext` 확장 필드에 있는 `VkDebugUtilsMessengerCreateInfoEXT` 구조체에 대한 포인터를 전달하기만 하면 됩니다. 메신저의 첫 번째 추출 인구는 정보를 별도의 기능으로 만듭니다.

```cpp
void populateDebugMessengerCreateInfo(VkDebugUtilsMessengerCreateInfoEXT& createInfo) {
    createInfo = {};
    createInfo.sType = VK_STRUCTURE_TYPE_DEBUG_UTILS_MESSENGER_CREATE_INFO_EXT;
    createInfo.messageSeverity = VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT;
    createInfo.messageType = VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT;
    createInfo.pfnUserCallback = debugCallback;
}

...

void setupDebugMessenger() {
    if (!enableValidationLayers) return;

    VkDebugUtilsMessengerCreateInfoEXT createInfo;
    populateDebugMessengerCreateInfo(createInfo);

    if (CreateDebugUtilsMessengerEXT(instance, &createInfo, nullptr, &debugMessenger) != VK_SUCCESS) {
        throw std::runtime_error("failed to set up debug messenger!");
    }
}
```

우리는 이제 `createInstance` 함수를 다시 사용할 수 있습니다.

```cpp
void createInstance() {
    ...

    VkInstanceCreateInfo createInfo{};
    createInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
    createInfo.pApplicationInfo = &appInfo;

    ...

    VkDebugUtilsMessengerCreateInfoEXT debugCreateInfo{};
    if (enableValidationLayers) {
        createInfo.enabledLayerCount = static_cast<uint32_t>(validationLayers.size());
        createInfo.ppEnabledLayerNames = validationLayers.data();

        populateDebugMessengerCreateInfo(debugCreateInfo);
        createInfo.pNext = (VkDebugUtilsMessengerCreateInfoEXT*) &debugCreateInfo;
    } else {
        createInfo.enabledLayerCount = 0;

        createInfo.pNext = nullptr;
    }

    if (vkCreateInstance(&createInfo, nullptr, &instance) != VK_SUCCESS) {
        throw std::runtime_error("failed to create instance!");
    }
}
```

`debugCreateInfo` 변수는 [`vkCreateInstance`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkCreateInstance.html) 호출 전에 소멸되지 않도록 if문 외부에 배치됩니다. 이 방법으로 추가 디버그 메신저를 만들면 [`vkCreateInstance`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkCreateInstance.html)와 [`vkDestroyInstance`](https://www.khronos.org/registry/vulkan/specs/1.0/man/html/vkDestroyInstance.html) 중에 자동으로 사용되며, 그 이후에는 정리됩니다.

# 테스트

이제 유효성 검사 레이어가 작동하는 것을 보기 위해 의도적으로 실수를 해봅시다. `cleanup` 함수에서 `DestroyDebugUtilsMessengerEXT`에 대한 호출을 잠시 제거하고 프로그램을 실행하세요. 종료될 때 다음과 같이 표시되어야 합니다.

![validation_layer_test.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/07a30a3c-bc5d-4b7e-9efa-4922a5829772/validation_layer_test.png)

> 메세지가 표시되지 않으면 [설치 상태](https://vulkan.lunarg.com/doc/view/1.2.131.1/windows/getting_started.html#user-content-verify-the-installation)를 확인해보세요.
> 

메세지를 발생시킨 호출을 확인하려면 메세지 콜백에 중단점을 추가하고 스택을 볼 수 있습니다.

# 구성

`VkDebugUtilsMessengerCreateInfoEXT` 구조체에 지정된 플래그보다 유효성 검사 레이어의 동작에 대한 설정이 훨씬 더 많습니다. Vulkan SDK로 이동해서 `Config` 디렉터리로 이동합니다. 여기에서 레이어 구성 방법을 설명하는 `vk_layer_settings.txt` 파일을 찾을 수 있습니다.

우리의 어플리케이션에 대한 레이어 설정을 구성하려면 파일을 프로젝트의 `Debug`, `Release` 디렉터리에 복사하고 튜토리얼에 따라 원하는 동작을 설정합니다. 그러나 이 튜토리얼의 나머지 부분에서는 기본 설정을 사용한다고 가정하겠습니다.

이 튜토리얼 전반에서 유효성 검사 레이어가 버그를 잡는데 얼마나 도움이 되는지 보여주고 Vulkan이 무엇을 수행하고 있는지 아는 것이 얼마나 중요한지 알려주기 위해서 일부러 몇가지 실수를 범할 것입니다. 이제 [시스템의 Vulkan 디바이스](https://vulkan-tutorial.com/Drawing_a_triangle/Setup/Physical_devices_and_queue_families)를 살펴볼 차례입니다.

[C++ code](https://vulkan-tutorial.com/code/02_validation_layers.cpp)