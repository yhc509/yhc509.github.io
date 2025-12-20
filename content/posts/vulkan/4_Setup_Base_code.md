---
date: 2022-08-01
title: Vulkan Tutorial (4) - Draw a triangle - Setup - Base Code
categories: ['Vulkan']
open: true
---

-[Khronos Vulkan Tutorial](https://docs.vulkan.org/tutorial/latest/00_Introduction.html)

# 기본 구조

지난 챕터에서 Vulkan 프로젝트를 생성하고, 샘플 코드를 통해서 필요한 구성을 테스트했습니다. 이번 챕터에서는 이 코드로 시작합니다:

```cpp
#include <vulkan/vulkan.h>

#include <iostream>
#include <stdexcept>
#include <cstdlib>

class HelloTriangleApplication {
public:
    void run() {
        initVulkan();
        mainLoop();
        cleanup();
    }

private:
    void initVulkan() {

    }

    void mainLoop() {

    }

    void cleanup() {

    }
};

int main() {
    HelloTriangleApplication app;

    try {
        app.run();
    } catch (const std::exception& e) {
        std::cerr << e.what() << std::endl;
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}
```

먼저 LunarG SDK에 있는 Vulkan 헤더를 include 합니다. 함수나 구조체, 열거형을 제공합니다. 에러 처리를 위해 `stdexcept` 와 `iostream` 헤더를 포함합시다. `cstdlib`는 `EXIT_SUCCESS` 와 `EXIT_FAILURE` 매크로를 제공합니다.

프로그램은 Vulkan 오브젝트를 private 클래스 멤버로 저장하고, 각각을 초기화하는 함수를 추가하는 클래스로 래핑됩니다. 이 클래스는 `initVulkan`에서 호출됩니다. 모든 것이 준비되면, 프레임 렌더링을 시작하는 메인 루프에 진입합니다. `mainLoop`함수는 창이 닫힐 때까지 반복되는 루프입니다. 창이 닫히고 `mainLoop` 함수가 반환되면, `cleanup` 함수에서 사용했던 리소스들을 해제합니다.

실행 중에 치명적인 오류가 발생하면 설명 메세지가 포함된 `std::runtime_error` 예외가 발생합니다. 이 예외는 main 함수로 전파되고 명령 프롬프트에 프린트됩니다. 다양한 표준 예외 타입을 처리하기 위해, 더 일반적인 `std::exception`을 사용합니다. 곧 다룰 에러 중에 한가지 예제는, 필수 확장 기능이 지원되지 않는 것입니다.

이 챕터 이후에 나올 모든 챕터들은 `initVulkan`에서 호출될 새로운 함수를 추가할 것입니다. 그리고 하나 이상의 새로운 Vulkan 오브젝트를 private 클래스 멤버도 추가할 것입니다. 이 멤버들은 `cleanup`에서 해제되어야 합니다.

# 자원 관리

`malloc`으로 할당된 메모리들을 `free`로 해제해야하는 것처럼, 모든 Vulkan 오브젝트는 더 이상 필요하지 않을 때 명시적으로 파괴되어야 합니다. C++에서는 `<memory>` 헤더에서 제공하는 RAII나 스마트 포인터를 사용하여 자동으로 메모리를 관리할 수 있습니다. 그러나 이 튜토리얼에서는 Vulkan 오브젝트들의 할당과 해제를 명시적으로 합니다. 결국, 모든 작업에 대해 명시적으로 하는 것이 실수를 피할 수 있는 방법입니다. 또한, 명시적으로 하는 것은 어떤 API를 배우던 간에 좋은 습관이 될 것입니다.

이 튜토리얼을 따라한 후에는, 자동으로 생성자에서 Vulkan 오브젝트를 생성하고 소멸자에서 해제하여 자원을 관리하는 C++ 클래스를 구현할 수 있습니다. 또는 별도로 `std::unique_ptr`이나 `std::shared_ptr`을 사용하여 별도로 지우는 기능을 정의할 수도 있습니다. RAII는 거대한 Vulkan 프로그램에서 권장되는 모델이지만, 기능을 배울 때에는 항상 뒤에서 무슨 일이 일어나고 있는지 아는 것이 좋습니다.

Vulkan 오브젝트는 `vkCreateXXX`같은 이름의 함수로 생성되거나, `vkAllocateXXX` 등으로 다른 오브젝트를 통해 할당됩니다. 오브젝트가 더 이상 쓰이지 않는 후에는 `vkDestroyXXX`, `vkFreeXXX`로 파괴합니다. 이러한 함수의 매개변수는 일반적으로 오브젝트 유형마다 다르지만, 공통적으로 공유하는 매개변수가 있습니다: 바로 `pAllocator`입니다. 이건 사용자 정의된 메모리 할당자에 대한 콜백을 지정할 수 있는 매개변수입니다. 튜토리얼에서는 이 매개변수를 무시하고 항상 `nullptr`을 지정할 것입니다.

# GLFW 통합

Vulkan은 화면 외 렌더링을 할 때는 윈도우 창이 없어도 완벽하게 돌아가지만, 실제로 무언가를 표시하는 것이 흥미로울 것입니다! 먼저 `#include <vulkan/vulkan.h>` 줄을 이렇게 바꿉니다.

```cpp
#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>
```

이런 식으로 GLFW는 자체적으로 정의를 포함하고 Vulkan 헤더를 불러옵니다. `initWindow` 함수를 추가하고 `run`에서 다른 것들이 불리기 전에 호출되도록 추가하세요. 이 함수로 GLFW를 초기화하고 창을 만듭니다.

```cpp
void run() {
    initWindow();
    initVulkan();
    mainLoop();
    cleanup();
}

private:
    void initWindow() {

    }
```

`iniWindow`에서 호출되는 첫번째 함수는 GLFW 라이브러리를 초기화하는 `glfwInit()`이어야 합니다. GLFW는 원래 OpenGL 컨텍스트를 생성하도록 설계되었기 때문에, 후속 호출에서 OpenGL 컨텍스트를 생성하지 않도록 지시해야 합니다:

```cpp
glfwWindowHint(GLFW_CLIENT_API, GLFW_NO_API);
```

크기가 조정되는 창을 처리하는 것은 특별히 주의가 필요하므로 나중에 보겠습니다. 지금은 다른 창 힌드 호출을 사용하여 비활성화합니다.

```cpp
glfwWindowHint(GLFW_RESIZABLE, GLFW_FALSE);
```

이제 실제 창을 만드는 일이 남았습니다. `GLFWWindow* window;` private 클래스 멤버를 추가하여 참조를 저장하고 창을 다음과 같이 초기화합니다.

```cpp
window = glfwCreateWindow(800, 600, "Vulkan", nullptr, nullptr);
```

처음 세 개의 매개변수는 창의 너비, 높이, 창 제목을 지정합니다. 네번째 매개변수는 창을 열 모니터를 선택적으로 지정할 수 있으며, OpenGL에서만 작동됩니다.

하드코딩된 너비와 높이 숫자 대신 상수를 사용하는 것이 좋습니다. 앞으로 이 값들을 두번 정도 더 참조하게 될 것입니다. `HelloTriangleApplication` 클래스 정의부 위에 다음 줄을 추가합니다:

```cpp
const uint32_t WIDTH = 800;
const uint32_t HEIGHT = 600;
```

그리고 창 생성 호출을 이렇게 대체했습니다.

```cpp
window = glfwCreateWindow(WIDTH, HEIGHT, "Vulkan", nullptr, nullptr);
```

`initWindow` 함수는 이렇게 되어야 합니다:

```cpp
void initWindow() {
    glfwInit();

    glfwWindowHint(GLFW_CLIENT_API, GLFW_NO_API);
    glfwWindowHint(GLFW_RESIZABLE, GLFW_FALSE);

    window = glfwCreateWindow(WIDTH, HEIGHT, "Vulkan", nullptr, nullptr);
}
```

오류가 발생하거나 창이 닫힐 때까지 어플리케이션이 실행되기 위해, `mainLoop`에 이벤트 루프를 추가해야 합니다:

```cpp
void mainLoop() {
    while (!glfwWindowShouldClose(window)) {
        glfwPollEvents();
    }
}
```

이 코드는 상당히 자명해야 합니다. 루프하면서 사용자가 X 버튼을 누르고 창을 닫는 등의 이벤트를 체크합니다. 또한 나중에 단일 프레임을 렌더링하는 함수를 호출하는 루프이기도 합니다.

창이 닫히면 GLFW를 파괴하고 자원을 정리해야 합니다. 우리의 첫번째 `cleanup` 코드는 이렇습니다:

```cpp
void cleanup() {
    glfwDestroyWindow(window);

    glfwTerminate();
}
```

지금 프로그램을 실행하면 창을 닫을 때까지 `Vulkan`이라는 제목이 보이는 창이 표시될 것입니다. 이제 Vulkan 어플리케이션의 골격이 생겼으므로, [첫번째 Vulkan 오브젝트를 만들어봅시다](https://vulkan-tutorial.com/Drawing_a_triangle/Setup/Instance)!

[C++ code](https://vulkan-tutorial.com/code/00_base_code.cpp)