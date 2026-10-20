---
marp: true
theme: presentation
size: "16:9"
paginate: true
title: Short context
date: 2026-08-04
description: A draft talk on keeping the context given to an agent short.
lang: en
draft: true
---

<!-- _class: title -->
<!-- _paginate: false -->

# Short context

## Leave only the files the next edit needs

Draft only. It stays off the public list.

---

###### Problem

# A long chat hides the current task

The opening instructions and the later corrections stay in the same window.

- **Goal** the first aim and the current aim differ
- **Files** files opened earlier are still in context
- **Logs** output from failed commands takes space
- **Repeats** a corrected sentence sits under the old one
- **Result** the model brings back an old decision

---

###### Keep

# What to keep. Only the next step

Do not summarize the whole chat. Keep what the next edit needs.

- **Goal** one line for the behavior being changed
- **Scope** paths of files to touch
- **Constraint** the interface that must stay
- **Check** the command that has to pass
- **Drop** exploration logs that already finished

---

###### Compare

# Two columns. Keep the whole session, or cut it

<div class="vs">
  <div class="col">
    <div class="hd"><div class="nm">Whole session</div></div>
    <div class="bd">Every attempt from the start remains, so the next edit follows an old conclusion.</div>
  </div>
  <div class="col">
    <div class="hd"><div class="nm">Cut</div></div>
    <div class="bd">A new session gets the goal, the paths, and the check. Finished logs stay out.</div>
  </div>
</div>

---

###### Files

# Files. Write why before opening one

Reading an unrelated file pulls its contents into the answer.

| Keep it in | Leave it out |
| --- | --- |
| This edit changes that file | It was only searched |
| The type lives in that file | It was opened as an example |
| A test fails because of that file | The cause is already a different file |

- Write the path. Do not paste the file body into the chat.

---

<!-- _class: divider -->

# A new session

## A finished task needs one summary line

---

###### Steps

# When to split the session

1. **The behavior changes** drop logs from the previous goal
2. **The check passes** drop that command's output
3. **The next file starts** drop the previous file body
4. **You are stuck** keep one hypothesis and the latest failure

> Draft. No tool names.

---

<!-- _class: title -->
<!-- _paginate: false -->

# Questions

## End of the short context draft
