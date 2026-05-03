---
date: 2024-03-23
title: "Why Color and Vector Looked Different in URP Shader Graph"
description: "In a Linear Color Space project, Color and Vector nodes with identical numbers produced different results in Shader Graph. Experiment notes on why."
categories: ['Game Engine/Unity']
open: true
type: article
---

Linear URP project. Adding Shader Graph values, I paused. `Color(0.5, 0.5, 0.5)` added twice — didn't reach white. Same numbers through Vector got the expected result.

First thought: wiring mistake. The real issue was value semantics, not math. I'd been treating "visible color" and "computation number" as the same thing.

## Where I got confused

![Unity Setting](./img/gamma_02.png)

In a Linear URP project, what you see on screen and what the shader computes don't map 1:1. Knew this in theory, but mixing Color and Vector nodes in Shader Graph made the gap feel larger.

![Linear Pipeline Add Effect](./img/gamma_03.png)

The problem case:

![Shader Graph](./img/gamma_04.png)

Both say `0.5`. But the Color side didn't brighten as expected. The Vector side added as predicted. Same-looking numbers, different treatment inside the pipeline.

![Shader Graph](./img/gamma_05.png)

## How I sorted it out

The core issue: in a Linear project, lighting and color math happen in linear space. The color you see on screen goes through a display transform. So "what looks like mid-gray" and "the number you plug into a calculation" aren't the same thing.

![Gamma Chart](./img/gamma_00.png)

![Color Encoding](./img/gamma_01.png)

Rules I wrote down:

- Inputs that mean "color" (Texture, Color) may carry display correction.
- Inputs that mean "number" (Vector) are safer to read as computation values.
- When adding or multiplying colors in Shader Graph, first ask: is this a "visible color" or a "computation value"?

I didn't trace every internal implementation. But in practice, this distinction cut most of the confusion. When Shader Graph values look wrong, it's usually not the nodes — it's me treating values from different spaces as if they're the same.

## Notes

- In Linear projects, don't trust Color Picker numbers as direct computation constants.
- For coefficients, correction values, masks — use Vector or Float. Less confusing.
- For final color output, use Color input, but if intermediate math surprises you, suspect color space first.

What confused me wasn't gamma theory itself. It was "how does this number enter the Shader Graph." When URP colors add up wrong, checking "is this a color or a number?" first was faster than reaching for theory.

---

## References
- [Cambridge In Colour](https://www.cambridgeincolour.com/tutorials/gamma-correction.htm)
- [Gamma가 어디 Gamma - Unity Korea Youtube](https://youtu.be/Xwlm5V-bnBc?si=mE10FiL2s3nmuMIn)
