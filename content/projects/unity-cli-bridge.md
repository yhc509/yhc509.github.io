---
title: "unity-cli-bridge"
date: "2026-04-05"
description: "터미널에서 Unity 에디터를 다루는 명령줄 도구다. 스크립트와 AI 코딩 에이전트가 씬, 프리팹, 에셋, 테스트, 플레이 모드 점검을 명령 한 줄로 처리하고 결과를 JSON으로 받는다."
thumbnail: "/images/projects/unity-cli-bridge.png"
role: "설계부터 개발, 배포까지 혼자 하는 개인 프로젝트"
highlights:
  - "CLI가 열려 있는 Unity 에디터와 로컬 IPC로 바로 통신한다. 중간에 거치는 서버가 없다."
  - "씬, 프리팹, 머티리얼, 에셋, 패키지, 테스트를 C# 코드를 짜지 않고 명령어 옵션만으로 다룬다."
  - "모든 명령이 결과를 JSON으로 돌려줘서 스크립트와 AI 에이전트가 바로 읽을 수 있다."
  - "플레이 모드 점검, 화면 녹화, 프로파일링까지 터미널에서 할 수 있다."
  - "Unity 2021.3 LTS 이상과 Unity 6을 지원하고, macOS Apple Silicon과 Windows x64용 CLI를 배포한다."
links:
  github: "https://github.com/yhc509/unity-cli-bridge"
  docs: "https://github.com/yhc509/unity-cli-bridge/blob/main/docs/cli-reference.md"
  itch: "https://yhkk.itch.io/unity-cli-bridge"
---

![터미널에서 Unity 에디터를 조작하는 unity-cli-bridge](https://raw.githubusercontent.com/yhc509/unity-cli-bridge/main/docs/assets/demo.gif)

## 왜 만들었나

AI 코딩 에이전트에게 Unity 작업을 맡기면 늘 에디터 앞에서 막혔다. 코드는 잘 고치는데, 씬에 오브젝트를 놓거나 프리팹을 손보거나 플레이 모드에서 결과를 확인하는 일은 사람이 에디터를 직접 눌러야 했다.

비슷한 도구는 이미 있었는데, 방식이 크게 두 가지였다. 하나는 Python이나 Node 서버를 중간에 두고 그 서버가 에디터에 명령을 전하는 방식이고, 다른 하나는 C# 코드를 통째로 보내 실행하고 결과는 로그에서 찾아 읽는 방식이다. 앞쪽은 거치는 단계가 많아 고장 날 곳도 많고, 뒤쪽은 호출할 때마다 맞는 C# 코드를 새로 짜야 한다.

그래서 둘 다 아닌 방식으로 만들었다. 터미널에서 친 명령이 열려 있는 에디터로 바로 전달되고, 할 일은 옵션으로 고르고, 결과는 곧바로 JSON으로 받는다.

## 어떻게 동작하나

Unity 프로젝트에 패키지를 넣으면 에디터가 열릴 때 브리지가 자동으로 켜진다. CLI는 Windows에서는 Named Pipe, macOS에서는 Unix 소켓으로 이 브리지와 통신한다.

```
CLI ──── 로컬 IPC ──── Unity 에디터 (브리지)
```

예를 들어 `scene add-object --primitive Cube --position 3,0,0`처럼 쓰면 큐브가 생기고, 무엇이 만들어졌는지가 JSON으로 출력된다. 옵션을 잘못 넣으면 그냥 넘어가지 않고 어디가 틀렸는지 바로 알려 준다. 응답이 길면 AI 에이전트의 토큰을 많이 쓰기 때문에, 필요 없는 값을 빼고 짧게 돌려받는 옵션도 있다.

에디터가 꺼져 있어도 `editor launch`로 띄울 수 있고, 화면 없는 배치 모드로도 실행된다. AI 에이전트가 이 명령들을 바로 쓸 수 있게 에이전트용 스킬도 레포에 같이 들어 있다.

## 설치

패키지는 itch 페이지나 GitHub 릴리스에서 `.unitypackage`로 받거나, Package Manager에 Git 주소를 넣어 설치한다. CLI는 에디터의 **Window > Unity CLI Manager**에서 버튼 하나로 받을 수 있다. 자세한 설치 방법과 명령 목록은 GitHub 레포의 README와 문서에 정리해 두었다.

## 지금 상태

남는 시간에 꾸준히 손보는 개인 프로젝트다. 버그 수정과 새 Unity 버전 호환을 먼저 챙기고, 이슈나 PR은 언제든 올려 주면 좋은데, 답은 좀 늦을 수 있다. 다른 도구와 비교해 보고 부족한 점을 고친 과정은 아래 글에 따로 적었다.
