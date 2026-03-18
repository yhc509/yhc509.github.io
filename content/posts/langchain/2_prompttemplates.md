---
date: 2024-04-10
title: LangChain (2) - ChatPromptTemplate, StrOutputParser, MultiChain
categories: ['AI/LangChain']
open: true
---


## ChatPromptTemplate

문자열 템플릿을 통해 프롬프트를 생성해주는 역할을 함.

```python3
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("1부터 {input}까지의 숫자를 모두 더한 값을 대답하세요.")

from langchain_openai import ChatOpenAI
llm = ChatOpenAI(model="gpt-3.5-turbo-0125")

# chain 연결
chain = prompt | llm

# chain 호출
output = chain.invoke({"input": "20"})
print(output)
```

input이 20이므로 프롬프트는 최종적으로 아래와 같게 됨.

```shell
1부터 20까지의 숫자를 모두 더한 값을 대답하세요.
```
```shell
content='210입니다.' response_metadata={'token_usage': {'completion_tokens': 3, 'prompt_tokens': 32, 'total_tokens': 35}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'stop', 'logprobs': None}
```

---

## StrOutputParser

객체 형식이 아닌 답변 문자열만 반환하도록 StrOutputParser 체인을 사용할 수 있음.

```shell
from langchain_core.output_parsers import StrOutputParser
output_parser = StrOutputParser()

chain = prompt | llm | output_parser
```
```shell
210입니다.
```

---

## 멀티 체인

여러 체인을 묶어서 질의할 수 있다.

```python3
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125")
output_parser = StrOutputParser()

prompt_1 = ChatPromptTemplate.from_template("\"{input}\" 이 단어를 영어로 번역하세요.")
prompt_2 = ChatPromptTemplate.from_template("\"{word}\" 이 단어가 포함된 영어 문장을 하나 만들어보세요.")

chain_1 = prompt_1 | llm | output_parser
output_1 = chain_1.invoke({"input": "벚꽃"})
print("[chain_1] : " + output_1)

chain_2 = {"word": chain_1} | prompt_2 | llm | output_parser
output_2 = chain_2.invoke({"input": "벚꽃"})
print("[chain_2] : " + output_2)
```

```shell
[chain_1] : cherry blossom
[chain_2] : Every spring, the cherry blossom trees in our neighborhood bloom in beautiful shades of pink and white.
```

chain_1은 영어 단어로 번역하는 체인.

chain_2는 chain_1을 실행한 후, 번역된 단어를 이용하여 문장을 만드는 체인이다.