---
title: "The Community News Bot Took One Night. The Filters Took a Month"
date: "2026-08-22"
description: "I added a news bot to a game-industry vibe coding community. Claude wrote it in one night, then I spent a month fixing filters that cut the wrong things."
open: true
type: article
---

I once added a news bot to a game-industry vibe coding community I used to run. Claude wrote the code in one night. The slow part came after: getting the bot to cut the right things and publish the right things took more than a month. The bot is stopped now. These notes come from the numbers left in the commit history.

## Why I built it

People who care about a topic find the news themselves. Beginners don't. For someone just starting out, even finding where the information lives is a wall. If fresh news showed up in the community channel on its own, that was one wall I could take down.

The structure is simple. It collects posts from RSS, Hacker News, Reddit, and X. An LLM scores each one for how useful it is to game developers. Posts that pass get a one-line summary and go to a Discord channel. It ran on schedule on a single Mac through launchd.

## The build took one night

I wrote the spec, pipeline design, and implementation plan first. The next evening Claude committed the collectors, storage, scoring, summaries, and delivery from that plan in a little over 30 minutes. Right after, it made about ten fixes: duplicate sends, Discord's character limit, SQLite locks during concurrent runs.

I left all the code to Claude. My job was to look at what actually got collected and posted, and when something looked wrong, tell it to fix the prompt or the collection logic. Most of the trial and error below started that way. I noticed something off and ordered an inspection. Claude recorded the cause and the numbers in the commits.

## Week one: cutting down

The first version wrote three summaries per post, one each for designers, programmers, and artists. It was long and gave no more reason to read. Three days in I switched to a single line, sent as plain text with a link instead of a Discord embed.

I also raised the bar. At first a 3 out of 5 passed. The "good to know" 3s piled up faster than the daily cap of 7 could drain them: 10 of the last 12 passes over three days were 3s. So only actionable news (4) and breaking news (5) went out, and anything queued for more than three days expired.

There was a security hole too. Feed titles and summaries went straight into messages, so a headline with `@everyone` could ping the whole channel. Turning off all mentions on send closed it. Paste outside text into a channel people read and this is what happens.

## The filters were throwing away the good stuff

The real problems showed up in weeks two and three. The bot ran fine, but the posts worth reading weren't coming through.

First, the keyword prefilter. Korean game outlets publish a lot, so a keyword pass ran before the LLM. That list was validated only against old logs. Nobody checked what survived once it was live. In production it dropped 18 of 22 in-window articles from one outlet, and 3 of the 4 survivors were game sale posts caught by "Steam." That keyword pulled 31 titles over 13 days and none scored 3 or higher. In the end the keywords were rechosen by measuring the yield of each one against 490 real titles, and those numbers went into the config so the next edit starts from evidence.

Second, one line in the scoring rubric. The 2-point anchor said "4 points is limited to third-party conference technical sessions." It was meant as a carve-out for promotional coverage, but it read as a universal rule, so no practitioner post could reach 4. Score-4 items hit zero for three straight days and nothing was published. The rule now applies only to promotional coverage, and a practitioner post can reach 4 if it has two of three things: the stage it targets, the method, and the outcome. Opening that up exposed another gap. Unvetted personal projects were already going out unmarked. Six had shipped that way, three of them asking for feedback on unfinished work. Those now carry a label.

Third, open-weight models. Of 16 open-weight items in the database, 15 were cut, topping out at 3 with reasons like "limited direct impact on game dev pipelines." For this community that's backwards. A model you can run locally can matter more to a solo developer than another API-only frontier model. Open weights went into the rubric, and the labs went into the X account list.

Some things never got in at all. The MCP spec announcement never entered the pipeline. Nothing broke. There was simply no path for it. The Hacker News keywords had nothing on agents or tool standards, and Korean outlets didn't put "MCP" in headlines. Qwen was similar: its keyword was dropped after a 48-hour sample matched only 3 items, but a 30-day window showed 11 new title matches.

In every case the bot ran with no errors. That's why it took so long to notice. If I hadn't looked at the output myself, I'd still not know.

## From Grok to Claude

Scoring and summaries first ran on Grok through the xAI API. It didn't perform as well as I wanted, so I moved them to the Claude CLI. X collection stayed on xAI to the end because it needs x_search.

X had its own small trap. If the account list goes past 20, the rest gets cut silently. Every time I added an account I had to count to 19, 20.

## A sign-up bot, briefly

The same repo also got a first-come sign-up bot. Each option has a cap, and when a seat opens the next person on the waitlist moves up and gets a DM. After the first live test, review caught a bug. When an option was removed, the bot replied that everyone signed up had been DM'd, before it had sent a single DM. Someone with DMs closed would lose a confirmed seat and nobody would know. Now the DMs go first and the reply names whoever couldn't be reached.

## So how did it go

Participation wasn't high. Feedback came now and then, and some people said it helped. The bot is stopped now.

Here's what stuck with me. Hand the code to an agent and the build is done fast. The work after that is looking at the output yourself and fixing the criteria, and that work doesn't end. When a filter is quietly wrong instead of erroring, the logs won't tell you. You have to look at what went out and what got thrown away.
