---
date: 2024-04-10
title: LangChain (3) - 프롬프트 작성 요령
categories: ['AI/LangChain']
open: true
---


LLM 프롬프트 작성 시 다음과 같은 요령을 참고하시면 좋습니다:

​
## 프롬프트 작성 요령

### 1. System 프롬프트
- LLM에게 역할, 성격, 능력 등 전반적인 설정을 해준다.
    - "너는 역사 전문가이며 청소년들에게 역사를 쉽게 설명해주는 것을 좋아하는 성격이야"

### 2. User 프롬프트
- 실제 사용자가 입력하는 질문이나 요청.
- 명확하고 구체적일수록 좋다. 예시나 맥락을 활용하자.

### 3.단계별 지시
- 복잡한 요청은 단계를 나누어 지시하자.
    - 1단계: 주제 정하기
    - 2단계: 개요 작성하기
    - 3단계: 각 섹션별로 상세 내용 생성하기

### 4.명확한 출력 형식 지정
- LLM에게 어떤 형태로 출력할지 (예: 글, 표, 목록, 대화 등) 포맷을 말해주자.​

### 5.제약 조건 설정
- LLM이 지켜야할 제약 조건 (예: 글자수 제한, 주제 제한, 어조/문체 등)을 말해주자.

### 6.몇 차례 반복 및 수정 지시
- 결과물이 미흡할 경우 피드백을 주고 수정을 요청하자
- 사람과 대화하는 것처럼 피드백 핑퐁을 하는 것이다.

```python3
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
llm = ChatOpenAI(model="gpt-3.5-turbo-0125")

chat_prompt = ChatPromptTemplate.from_messages([
    ("system", "당신은 StableDiffusion 프롬프트 엔지니어입니다. 길이는 30단어 이내. 캡션은 영어로 작성하세요."),
    ("user", "{input}"),
])
chain = chat_prompt | llm | StrOutputParser()
output = chain.invoke({"input": "파란 머리의 엘프 소녀가 바다를 바라보는 모습을 묘사해주세요."})
print(output)
```
```shell
"Mysterious elven maiden with blue hair gazes wistfully out to sea, lost in thought as the waves gently lap at the shore."
```

---

## 프롬프트 파라메터

### 1. Temperature
- 모델의 출력 확률 분포를 조정한다.
- 다음 토큰을 선택할 때 확률 분포의 엔트로피를 조절할 때 사용된다.
- 값이 높으면(1 이상)
    - 확률 분포를 더 균등하게 만든다.
    - 즉, 다양하고 창의적인 출력을 생성하는 경향이 있다.
    - 확률이 낮은 토큰도 선택할 가능성이 높아짐을 의미한다.
- 값이 낮으면(0.5 이하)
    - 확률 분포를 더 집중시켜 가장 확률이 높은 토큰을 선택하는 경향이 있다.
    - 안정적이고 예측 가능한 출력을 생성함을 의미한다.
- 기본값은 일반적으로 1.0이다. (범위는 0 ~ 무한대)

### Top-p (Nucleus Sampling):
- Nucleus Sampling이라고도 불린다.
- 다음 토큰을 선택할 때 고려할 누적 확률 질량의 임계값을 설정한다. (0 ~ 1)
- 예를 들어 값이 0.9라면,
    - 모델은 누적 확률이 0.9에 도달할 때까지, 가장 높은 확률을 가진 토큰들을 선택 대상으로 고려한다.
    - 확률이 낮은 토큰들은 선택에서 제외되어 더 관련성 높고 일관된 출력을 생성하게 된다.
- 값을 낮게 설정할수록
    - 모델은 더 적은 수의 고확률 토큰을 고려한다.
    - 더 집중되고 안정적인 출력을 생성한다.

### frequency_penalty
- 모델이 이전에 자주 생성한 토큰을 반복적으로 생성하는 것을 방지하는데 사용된다.
- 값이 높으면,
    - 모델은 이전에 자주 등장한 토큰을 덜 자주 생성한다.
    - 더 다양한 어휘를 사용한다.
- 값을 낮게 설정하면,
    - 모델은 이전에 자주 등장한 토큰을 더 자주 생성한다.
    - 반복적인 어휘 사용이 많아진다.
- 일반적으로 0 ~ 1 범위로 사용.
​
### presence_penalty
- 모델이 이전에 자주 생성한 토큰을 반복적으로 생성하는 것을 방지하는데 사용된다.
- 값이 높으면,
    - 모델은 이전 생성 결과에 등장한 토큰을 덜 자주 생성한다.
    - 새로운 토픽이나 아이디어를 생성한다.
- 값을 낮게 설정하면,
    - 모델은 이전 생성 결과에 등장한 토큰을 더 자주 생성한다.
    - 같은 주제에 대해 깊이 있게 다룰 수 있다.
- 일반적으로 0 ~ 1 범위로 사용.

```python3
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

params = {
    "temperature": 0.1,         # 생성된 텍스트의 다양성 조정
    "max_tokens": 100,          # 생성할 최대 토큰 수
}

kwargs = {
    "frequency_penalty": 0.5,   # 이미 등장한 단어의 재등장 확률
    "presence_penalty": 0.5,    # 새로운 단어의 도입을 장려
    "stop": ["\n"]              # 정지 시퀀스 설정

}

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", **params, model_kwargs = kwargs)

chat_prompt = ChatPromptTemplate.from_messages([
    ("system", "당신은 소설가입니다. 주어진 문장을 완성시키세요."),
    ("user", "{input}"),
])
chain = chat_prompt | llm | StrOutputParser()
output = chain.invoke({"input": "고양이는"})
print(output)
```
```shell
창문 밖을 응시하며, 자신만의 비밀스러운 세계에 빠져든다.
```

---

## 참고하면 좋은 사이트
- [프롬프트 엔지니어링 가이드](https://www.promptingguide.ai/kr)
- [인공지능을 사용하는 인간을 위한 안내서](https://slashpage.com/haebom/hitchhiker)