---
title: "Character Forge: ComfyUI 기반 캐릭터 일러스트 생성기"
date: "2026-02-28"
description: "캐릭터 속성 태그를 조합해 프롬프트를 만들고 로컬에서 일러스트를 생성하는 툴을 만들었다."
categories: ['GameDev/Epoch: Unseen', 'AI/AgenticCoding']
open: true
type: article
project: "project-t"
---

## 만든 이유

Epoch: Unseen용 캐릭터 비주얼을 더 빠르게 검토하려고, ComfyUI를 감싼 캐릭터 일러스트 생성기 `Character Forge`를 만들었다.

![Character Forge 메인 화면](/posts-images/project-t/img/devlog-6-01.png)

## 태그에서 프롬프트까지

캐릭터 속성 태그를 조합해 프롬프트를 만들고 있고, 아직 기능은 계속 추가 중이다.

![Character Forge 속성 화면](/posts-images/project-t/img/devlog-6-02.png)

![Character Forge 프롬프트 화면](/posts-images/project-t/img/devlog-6-03.png)

![Character Forge 세부 설정 화면](/posts-images/project-t/img/devlog-6-04.png)

태그를 프롬프트로 바꾸는 규칙을 따로 잡아 두고 있다.

![태그에서 프롬프트로 변환하는 화면](/posts-images/project-t/img/devlog-6-05.png)

![생성 결과 예시](/posts-images/project-t/img/devlog-6-06.png)

## 현재 상태

로컬에서 직접 돌린다. 맥 미니라 성능이 아주 좋은 편은 아니라 한 장 뽑는 데 4~5분 정도 걸리는데, 워크플로우를 더 다듬으면 줄일 수 있을 것 같다.

최대한 그림체 톤이 흔들리지 않도록 맞추는 데 신경을 많이 썼다. 이제 일러스트 프롬프트 규칙은 큰 틀에서 거의 고칠 일이 없을 것 같다.
