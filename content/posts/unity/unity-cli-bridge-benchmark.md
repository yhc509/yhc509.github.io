---
title: "내 Unity CLI를 재 보고, 거기서 나온 구멍을 고쳤다"
date: "2026-10-21"
description: "스크립트와 AI 에이전트가 터미널에서 Unity Editor를 다루게 하려고 unity-cli-bridge를 만들었다. 다른 도구 세 개와 재 보니 내 쪽 구멍이 보였고, 고친 뒤 다시 쟀다."
open: true
type: article
---

![터미널에서 Unity Editor를 다루는 unity-cli-bridge](https://raw.githubusercontent.com/yhc509/unity-cli-bridge/main/docs/assets/demo.gif)

*v0.5.6 CLI로 실제로 돌린 20초다. 큐브를 만들고, 머티리얼을 넣고, 스크립트를 붙이고, Play Mode에 들어갔다가, 콘솔을 보고, 멈춘다. JSON은 화면에 맞게 줄였다.*

unity-cli-bridge는 Unity Editor용 CLI다. 터미널에서 명령을 치면 열려 있는 Editor에 local IPC로 닿고, JSON이 찍힌다. 0.5.6은 [GitHub](https://github.com/yhc509/unity-cli-bridge)와 [itch.io](https://yhkk.itch.io/unity-cli-bridge)에 올라가 있다.

왜 만들었는지, 다른 세 도구와 어떻게 비교했는지, 내 도구에서 뭐가 빠졌는지, 고친 뒤 숫자가 어떻게 바뀌었는지를 적는다. 벤치마크는 내가 돌렸다. 숫자는 그걸 알고 보면 된다. 이 얘기는 뒤에서 다시 한다.

## 만든 이유

스크립트와 AI 코딩 에이전트(Claude Code, Codex, Grok Build)가 셸에서 하듯 Unity Editor에서도 일하게 하고 싶었다. 명령을 치고, 결과를 읽고, 다음을 정한다.

Editor 자동화는 대개 둘 중 하나였다.

- **가운데 서버.** Python이나 Node 프로세스가 동작을 수십 개 감싼다. 호출은 전부 거길 거친 뒤에야 Editor에 닿는다. 띄울 프로세스가 하나 늘고, 깨질 곳도 하나 는다.
- **C#을 그대로 실행.** Editor에 C#을 보내고 로그에서 결과를 읽는다. 폭은 넓은데, 부를 때마다 맞는 C#을 써야 하고, 결과를 읽으려면 한 번 더 칠 때가 많다.

원했던 건 그 중간이다. 가운데 서버 없이, C#을 매번 짜지 않아도 되는 명령.

```
CLI ──── local IPC ──── Unity Editor (bridge)
         (named pipe on Windows, Unix socket on macOS)
```

C# 대신 `scene add-object --primitive Cube --position 3,0,0`이다. 부르는 쪽은 API가 아니라 옵션을 고른다. 명령마다 JSON이 stdout으로 바로 나온다. `--output compact`, `--omit-defaults` 같은 플래그는 그 JSON을 짧게 유지한다. 에이전트는 읽는 토큰마다 돈을 낸다. 맞는 명령이 없으면 `execute`가 C#을 대신 돌린다.

저장소에 에이전트 스킬을 같이 넣어 뒀다. 명령을 고르게 하고, 고치기 전에 inspect부터 하게 하고, 바꾼 뒤에는 `read-console`을 보게 한다.

## 벤치마크

그림은 이미 있었다. 실제 프로젝트에서 에이전트한테 도움이 되는지가 궁금해서 비교를 짰다.

- **도구 네 개.** unity-cli-bridge, 공식 Unity CLI, 그리고 내가 Tool A, Tool B라고 부르는 커뮤니티 도구 둘. Tool A는 동적 C# 실행이 빠른 쪽이다. Tool B는 MCP 서버다.
- **과제 네 개.** 프롬프트는 영어로 고정했다. 대상은 코드가 이미 있고, nested prefab이랑 큰 직렬화 데이터가 있는 중간 크기 Unity 6 URP 프로젝트다. 빈 샘플이 아니다.
- **에이전트 하나.** Claude Code, Opus 5.5, low effort, headless. 한 번에 한 런. Mac mini 한 대, Unity 6000.3.10f1.
- **숨긴 검증.** 런이 끝나면, 에이전트가 본 적 없는 EditMode/PlayMode 테스트가 결과를 검사한다. 필수 항목이 다 맞고 컴파일 에러가 새로 없을 때만 통과로 쳤다.
- **격리.** 런마다 프로젝트 복사본을 새로 줬다. 에이전트에게는 그 도구의 스킬이나 플러그인만 줬다. 권한 규칙이랑 hook으로, 디스크에 있는 도구 소스는 읽지 못하게 막았다.

과제는 씬 감사와 수정(s1c), C#을 금지한 같은 감사(s1q), pause-menu UI(s3), prefab variant 20개(s4)다. 아래 숫자는 유효한 런만 넣었다. 무엇을 빼 뒀고 왜인지는 [위키](https://github.com/yhc509/unity-cli-bridge/wiki/Benchmark-v0.5.6)에 있다.

## 내 도구에서 나온 것

C# 없이 명령만 쓴 첫 s1q는 예전 `main` (`04778d6`)이었다. 통과는 했다. 느렸다. 2번 돌려 평균 332.8 s, 런당 $1.127, tool call은 평균 40번. 트랜스크립트를 읽어 보니 이유가 보였다. 에이전트가 씬이랑 prefab YAML을 grep해서 손으로 파싱했다. 다른 도구로 이 과제를 돌릴 때도 그렇게 빠졌다.

이 과제는 nested prefab 안에 꺼져 있는 renderer를 보게 되어 있다. `--omit-defaults`를 주면 `scene inspect`가 enabled 상태랑 nested prefab 정보를 기본값으로 보고 빼 버렸다. 출력에 그 상태가 없었다. scene patch 스펙도 스킬에 없어서, 포맷이 필요할 때 열어 볼 파일이 없었다.

빼 둔 런 중에 계속 생각난 게 있다. 초반 baseline 두 번은 버렸다. 격리를 조이기 전에 에이전트가 디스크의 unity-cli-bridge 패키지 소스를 읽었다. 소스를 읽은 런이 더 빨랐다. 출력에 없는 걸 코드를 읽어서 메운 것이다.

## 고친 것, PR #205

[PR #205](https://github.com/yhc509/unity-cli-bridge/pull/205)는 트랜스크립트에서 본 걸 고쳤다.

- `scene inspect --omit-defaults`는 이제 enabled 상태랑 nested prefab 정보를 빼지 않고 남긴다.
- scene patch 스펙을 스킬 안 레퍼런스 파일로 넣었다. 포맷이 필요할 때 에이전트가 연다.
- `scene patch`는 모르는 operation이 오면 가장 가까운 유효한 operation을 제안한다.
- `prefab inspect`는 모델 파일(`.fbx`)을 받는다.
- `qa world-dump`는 Edit Mode에서 동작한다.

큰 수정은 아니다. 트랜스크립트에 바로 손댄 건 앞의 둘이다.

## 다시 잰 결과

같은 과제다. 명령만 쓴다. `main`은 `9f53c04`다. PR #205가 들어 있고, 이 커밋이 v0.5.6이 됐다.

| s1q (명령만) | 횟수 | 통과 | 걸린 시간, 평균 | 비용, 평균 | tool call, 평균 | output token, 평균 |
|---|---|---|---|---|---|---|
| 이전 (`04778d6`) | 2 | 2/2 | 332.8 s | $1.127 | 40 | 15,144 |
| PR #205 이후 (`9f53c04`) | 5 | 5/5 | 119.9 s | $0.465 | 13 | 5,626 |

이 과제에서 걸린 시간은 64% 줄었고, 비용은 59% 줄었다. 이제 에이전트는 `scene inspect --omit-defaults`로 씬을 읽고, `scene add-component`랑 `scene patch`로 고친다.

같은 과제, 도구마다 5번이다.

| s1q | unity-cli-bridge | 공식 Unity CLI | Tool A | Tool B |
|---|---|---|---|---|
| 통과 | 5/5 | 5/5 | 4/5 | 5/5 |
| 걸린 시간, 평균 | 119.9 s | 224.1 s | 454.9 s | 216.2 s |
| 걸린 시간, 중앙값 | 84.7 s | 232.8 s | 250.8 s | 181.6 s |
| 비용, 평균 | $0.465 | $0.897 | $1.659 | $1.977 |

C#을 허용한 세 과제는 훨씬 비슷했다. 네 도구 다 모든 런을 통과했다. 어떤 도구를 줘도 에이전트는 C# 스니펫 1개에서 5개로 일을 끝냈다. 시간 차이는 대부분 런마다 흔들리는 범위였고, 비용은 각 도구가 첫 턴에 올리는 컨텍스트 양을 따라갔다. unity-cli-bridge의 첫 턴 컨텍스트가 네 개 중 제일 작았다. 약 14.1k 토큰이다.

씬 작업에서 갈린 건, 도구가 읽어 준 출력에 필요한 상태가 이미 있었는지였다. 없으면 에이전트가 YAML을 파고, 시간이랑 비용이 불어난다. 고치기 전 내 도구도 그랬고, 다른 도구도 그랬다.

## 못 이긴 부분

- **코드 실행 속도.** Tool A는 C# 한 번이 대략 열 배 빠르다. Edit Mode에서 약 19 ms다. unity-cli-bridge에서 새 `execute` 스니펫은 약 0.5 s다. 새 스니펫은 아직 매번 컴파일한다. Play Mode를 프레임마다 돌리는 것처럼 짧은 스니펫을 많이 치는 작업에서는, 위에서 본 차이보다 이게 더 크다.
- **C#을 허용한 과제.** Tool A가 s1c랑 s3에서 제일 빨랐다. 어차피 C#을 쓸 거면 네 개 중 뭘 써도 된다.
- **이유가 안 보이는 느린 런.** 내 s1q 중에 r4는 295.3 s였다. 중앙값은 84.7 s다. 대부분은 tool 시간이었는데, 이유는 아직 모른다. 평균이 중앙값보다 한참 올라간다.

## 한계와 편향

이 부분은 돌려 말하지 않겠다.

- **도구도 내가 만들었고, 벤치마크도 내가 짰고, 돌린 것도 나고, 다시 재기 전에 내 도구를 고친 것도 나다.** 다른 도구는 릴리스된 그대로 한 번만 쟀다. 이 과제에 맞춰 고칠 기회는 없었다. 프롬프트는 고정했고, 검증은 숨겼고, 소스는 막았다. 그래도 치우친 비교다.
- **전후 숫자는 전체가 빨라졌다는 뜻이 아니다.** 고친 건 이번에 본 실패다. 같은 과제에서 다시 쟀다. 이 구멍이 막혔다고 보면 된다.
- **표본이 작다.** s1q는 도구당 5번, 나머지는 3번, 예전 baseline은 2번이다. 느린 런 하나가 평균을 많이 민다. 10%에서 20% 차이는 노이즈로 보면 된다.
- **조건도 좁다.** 모델 하나, effort 하나, 클라이언트 하나, 머신 하나, Unity 버전 하나, 프로젝트 하나에서 과제 네 개다. 모델이나 클라이언트가 바뀌면 순위도 바뀔 수 있다.

표 전체, 방법, 빼 둔 런은 [위키](https://github.com/yhc509/unity-cli-bridge/wiki/Benchmark-v0.5.6)에 있다.

## 남은 일

알려진 버그가 둘 있다. 둘 다 열려 있다.

- [#210](https://github.com/yhc509/unity-cli-bridge/issues/210): `scene set-transform`은 안 준 필드를 리셋한다. `--rotation 0,30,0`만 넘겨도 position이랑 scale이 0이 된다. 지금은 position, rotation, scale을 같이 넘긴다. 데모 GIF 찍다가 찾았다.
- [#208](https://github.com/yhc509/unity-cli-bridge/issues/208): `read-console --type error`에 Exception이 안 들어온다.

느린 r4도 아직 봐야 한다.

unity-cli-bridge는 개인 사이드 프로젝트다. 남는 시간에 되는 만큼 고친다. 버그랑 새 Unity 버전 호환이 먼저다. 이슈랑 PR은 받는다. 언제 답할지는 정하지 않는다.

## 링크

- itch.io: [yhkk.itch.io/unity-cli-bridge](https://yhkk.itch.io/unity-cli-bridge)
- GitHub: [github.com/yhc509/unity-cli-bridge](https://github.com/yhc509/unity-cli-bridge)
- Release: [v0.5.6](https://github.com/yhc509/unity-cli-bridge/releases/tag/v0.5.6)
- Benchmark: [Benchmark v0.5.6 on the wiki](https://github.com/yhc509/unity-cli-bridge/wiki/Benchmark-v0.5.6)
- PR: [#205](https://github.com/yhc509/unity-cli-bridge/pull/205)
