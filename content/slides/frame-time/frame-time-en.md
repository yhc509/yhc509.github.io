---
marp: true
theme: presentation
size: "16:9"
paginate: true
title: Frame time
date: 2026-09-18
description: A draft talk on where to look first when a frame runs long.
lang: en
draft: true
---

<!-- _class: title -->
<!-- _paginate: false -->

# Frame time

## Where to look when a frame misses its budget

Draft only. It stays off the public list.

---

###### Budget

# Budget. The time the display asks for

At 60Hz the budget is 16.6ms. At 30Hz it is 33.3ms.

- **Measure** the slowest 1% of frames, not the average
- **Split** simulation, submit, and GPU wait
- **Jitter** a fine average can still hitch
- **Input** a long frame becomes input latency
- **Record** same scene, camera, and resolution

---

###### CPU

# Main thread. When simulation spends the budget

Cut the span from frame start to render submit first.

- **Scripts** a full scene walk every frame grows with the scene
- **Physics** more colliders enlarge the broadphase
- **Animation** many bones overlap on screen
- **Allocation** mid-frame alloc shows up later as a hitch
- **Logs** a dev build does not time like a release build

---

###### GPU

# GPU. Submit returns, the picture is still late

If the CPU is idle and the GPU is busy, the next frame waits in the queue.

| Signal | Meaning | Look next |
| --- | --- | --- |
| GPU time up | shading or bandwidth | overdraw, resolution |
| CPU wait | blocked on a fence | readback, sync |
| Vertices up | the scene is heavy | culling, LOD |
| Draws up | batching broke | materials, instancing |

- Freeze one scene, then remove one cost at a time

---

###### Order

# Cut one cost, the largest first

Changing several things at once hides which change mattered.

1. **Capture** one long frame timeline
2. **Largest span** try to cut only that span in half
3. **Measure again** check the slowest 1%
4. **Next span** move on when the budget holds

> Draft. These are not sample numbers from a title.

---

<!-- _class: divider -->

# One scene

## Lock the camera and the resolution, then compare

---

###### Traps

# Do not trust the average

A frame time average inside the budget can still feel uneven.

- **Hitches** loading, shader compile, and first use land on one frame
- **Warmup** walk the scene once before recording
- **Focus** an unfocused window changes the frame cap
- **Power** a battery saver makes the same build slower

---

<!-- _class: title -->
<!-- _paginate: false -->

# Questions

## End of the frame time draft
