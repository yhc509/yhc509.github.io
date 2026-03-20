---
title: "PUC"
date: "2026-03-18"
description: "에디터 여러 개 띄워 놓고 포트 관리하다 지쳐서 만든 Unity CLI다."
thumbnail: "/images/projects/puc.svg"
tags:
  - "Unity"
open: true
role: "CLI 설계, Unity 브리지 패키지 구현, Codex 스킬 설계"
highlights:
  - "포트 없이 프로젝트 경로로 에디터에 바로 붙는다"
  - "Live IPC와 batchmode를 알아서 고른다"
  - "asset, prefab 명령을 CLI에서 바로 쓴다"
links:
  github: "https://github.com/yhc509/PUC"
  docs: "https://github.com/yhc509/PUC/blob/main/docs/architecture.md"
---

Epoch: Unseen을 만들면서 Unity MCP를 쓰고 있었다. 그런데 에디터를 여러 개 띄워 놓고 병렬로 작업하다 보니, 포트를 어디에 물려야 하는지 매번 헷갈렸다. 서버를 직접 실행해야 하는 것도 귀찮았고, 프로젝트마다 어떤 에디터에 붙는지도 불안정했다.

그래서 에디터 자체에 물리면 좋겠다는 생각으로 PUC를 만들었다. 이름이 Portless Unity CLI인 이유가 말 그대로 포트가 없기 때문이다. 프로젝트 경로만 주면 실행 중인 에디터를 찾아서 알아서 붙는다.

Unity 패키지 쪽에서 브리지가 에디터 시작과 함께 자동으로 올라온다. CLI에서는 프로젝트 경로와 레지스트리를 보고 대상 에디터를 고른다. 에디터가 켜져 있으면 Live IPC로 바로 붙고, 꺼져 있으면 batchmode로 처리한다. `asset create`, `prefab create`, `prefab inspect`, `prefab patch` 같은 명령도 CLI에서 바로 쓸 수 있다.

본 프로젝트인 Epoch과 동시에 개발하느라 정신이 왔다갔다 한 게 좀 힘들었지만, 지금도 계속 사용하면서 기능을 붙이는 중이다.

## 링크

- GitHub: [github.com/yhc509/PUC](https://github.com/yhc509/PUC)
- 아키텍처 문서: [docs/architecture.md](https://github.com/yhc509/PUC/blob/main/docs/architecture.md)
