---
date: 2024-03-23
title: URP Shader Graph에서 Color와 Vector가 다르게 보였던 이유
description: "Linear Color Space 프로젝트에서 Shader Graph의 Color 값과 Vector 값이 같은 숫자여도 다르게 보였던 이유를 실험 메모 중심으로 정리했다."
categories: ['Game Engine/Unity']
open: true
type: article
---

Linear로 돌리던 URP 프로젝트에서 Shader Graph 값을 더하다가 한 번 멈췄다. `Color(0.5, 0.5, 0.5)`를 두 번 더했는데 흰색까지 가지 않았다. 같은 숫자를 Vector로 넣으면 훨씬 예상에 가까운 결과가 나왔다.

처음에는 노드 연결을 잘못한 줄 알았다. 그런데 조금 뜯어보니 계산식보다 값의 성격이 더 중요했다. 눈에 보이는 `색`과 계산에 들어가는 `숫자`를 같은 감각으로 다루고 있었던 셈이다.

## 헷갈렸던 장면

![Unity Setting](./img/gamma_02.png)

URP 프로젝트를 Linear로 두면, 화면에 보이는 색과 셰이더 안에서 계산에 쓰이는 값이 바로 1:1로 겹치지 않는다. 머리로는 알고 있었는데도, Shader Graph에서 Color 노드와 Vector 노드를 섞어 쓰니 그 차이가 더 크게 느껴졌다.

![Linear Pipeline Add Effect](./img/gamma_03.png)

문제가 된 예제는 아래였다.

![Shader Graph](./img/gamma_04.png)

겉으로 보기에는 둘 다 `0.5`다. 그런데 Color 쪽은 생각만큼 밝아지지 않았고, Vector 쪽은 예상한 대로 더해졌다. 숫자는 같아 보여도 파이프라인 안에서는 같은 값처럼 취급되지 않았다는 뜻이다.

![Shader Graph](./img/gamma_05.png)

## 내가 정리한 기준

내가 붙잡고 있던 건 결국 이 부분이었다. Linear 프로젝트에서는 조명과 색 계산이 선형 공간 기준으로 이루어지고, 화면에 보이는 색은 다시 표시용 변환을 거친다. 그래서 `눈에 중간 회색으로 보이는 값`과 `연산에 그대로 넣는 숫자`를 같은 감각으로 생각하면 틀어지기 쉽다.

![Gamma Chart](./img/gamma_00.png)

![Color Encoding](./img/gamma_01.png)

메모해 둔 기준은 이 정도였다.

- Texture나 Color처럼 `색`을 의미하는 입력은 표시용 보정이 얽혀 있을 수 있다.
- Vector처럼 `숫자`를 의미하는 입력은 연산값으로 읽는 편이 안전하다.
- Shader Graph에서 색을 직접 더하거나 곱할 때는, 지금 만지는 값이 `보이는 색`인지 `계산용 값`인지 먼저 구분해야 한다.

정확한 내부 구현을 전부 뜯어본 건 아니지만, 실전에서는 이 정도만 알아도 훨씬 덜 헷갈렸다. Shader Graph에서 값이 이상하게 보일 때는 노드가 틀린 게 아니라, 내가 서로 다른 공간의 값을 같은 기준으로 보고 있었던 경우가 많았다.

## 메모

- Linear 프로젝트에서는 Color Picker의 숫자를 곧바로 계산용 상수처럼 믿지 않는 편이 낫다.
- 셰이더에서 계수, 보정값, 마스크처럼 `수치`가 중요한 값은 Vector나 Float로 두는 편이 덜 헷갈린다.
- 반대로 최종 색 자체를 다루는 부분은 Color 입력으로 두되, 중간 계산이 기대와 다르면 색 공간을 먼저 의심하는 게 좋다.

결국 헷갈렸던 건 감마 이론 자체보다 `이 숫자가 Shader Graph 안에서 어떤 값으로 들어오느냐`였다. URP에서 색이 이상하게 더해질 때는 복잡한 이론부터 떠올리기보다, `지금 만지는 값이 색인가 숫자인가`부터 다시 보는 편이 빨랐다.

---

## 참고 자료
- [Cambridge In Colour](https://www.cambridgeincolour.com/tutorials/gamma-correction.htm)
- [Gamma가 어디 Gamma - Unity Korea Youtube](https://youtu.be/Xwlm5V-bnBc?si=mE10FiL2s3nmuMIn)

---
