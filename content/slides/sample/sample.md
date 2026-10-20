---
marp: true
theme: presentation
size: "16:9"
paginate: true
title: 샘플 덱
date: 2026-10-20
description: 빌드 확인용 초안이다. 제목, 목록, 표, HTML, 이미지를 넣었다.
lang: ko
draft: true
---

<!-- _class: title -->
<!-- _paginate: false -->

# 샘플 덱

## 뷰어 확인용 초안

공개 목록에 올리지 않는다.
로컬에서만 본다.

---

###### 구성

# 본문 — 제목과 목록

## 소제목도 한 줄

- **첫 항목** 짧은 설명
- **둘째 항목** 짧은 설명
- **셋째 항목** 다음 슬라이드로 이어진다

---

###### 표

# 표 — 칸을 나눠 적는다

한 줄로 표가 말하려는 것을 적는다.

| 항목 | 설명 |
| --- | --- |
| 제목 | 슬라이드 맨 위 |
| 목록 | 키워드를 앞에 둔다 |
| 표 | 행은 적게 둔다 |
| 그림 | `img/`에 둔다 |

- 표 아래 보충은 한 줄이면 된다

---

###### HTML

# 인라인 HTML — 카드

<div class="cards">
  <div class="card"><div class="name">입력</div><div class="desc">마크다운</div></div>
  <div class="card"><div class="name">빌드</div><div class="desc">정적 SVG</div></div>
  <div class="card"><div class="name">보기</div><div class="desc">사이트 안</div></div>
  <div class="card"><div class="name">초안</div><div class="desc">draft</div></div>
</div>

---

###### 그림

# 이미지 — 상대 경로

![h:180](img/sample-flow.svg)

![h:48](img/swatch.png)

- SVG와 PNG를 같이 둔다
- PNG는 빌드 때 WebP로 바뀐다

---

<!-- _class: divider -->

# 가운데

## 구분 슬라이드

---

###### 비교

# 두 칸 — 인라인 HTML

<div class="vs">
  <div class="col">
    <div class="hd"><div class="nm">스크롤</div></div>
    <div class="bd">세로로 쌓아서 읽는다.</div>
  </div>
  <div class="col">
    <div class="hd"><div class="nm">한 장</div></div>
    <div class="bd">한 장씩 넘긴다.</div>
  </div>
</div>

---

###### 정리

# 번호 목록

1. **첫 메시지** 한 줄
2. **둘째 메시지** 한 줄
3. **셋째 메시지** 한 줄

> 자리만 표시하는 상자

---

<!-- _class: title -->
<!-- _paginate: false -->

# 끝

## 질문
