---
title: "Malware Ran on My Mac Today — LiteLLM Supply Chain Attack Post-Mortem"
date: "2026-03-24"
description: "Installed one Claude Code plugin. A backdoor in a transitive dependency exfiltrated API keys and credentials. Detection through response, documented."
categories: ["AI/AgenticCoding"]
open: true
type: article
---

This evening, I wasn't in the mood to code. Figured I'd install a Claude Code plugin I'd been eyeing. Ouroboros — adds autonomous loops to AI coding agents. A well-known AI professor had recommended it. Zero suspicion. A minute after installing, my Mac started choking.

## 1,000 python3.12 Processes

Rebooted three or four times. Every time I launched Claude Code, it froze again. Then I remembered — I'd just installed Ouroboros. Decided not to launch Claude at all. Opened Codex CLI instead and had it inspect the processes. That was the move that saved me.

Over a thousand `python3.12` processes were running. Couldn't even spawn a new shell — `fork failed: resource temporarily unavailable`. Not CPU. The sheer number of processes was suffocating the system.

Most had `PPID=1`. Orphans — parent processes dead, children left behind. Not normal workers. A runaway explosion of spawns in a short window.

## It Was Malware

Not just a runaway. The command line of a Python interpreter under the `uv` cache contained a `base64`-encoded payload. Decoded, it was a script that collected credential files and sent them to `https://models.litellm.cloud/`.

Infection chain:

```
Ouroboros install
  → litellm>=1.80.0 dependency
    → litellm 1.82.8 (compromised version)
      → litellm_init.pth (malicious .pth hook)
        → auto-executes on every Python startup
          → credential harvesting + exfiltration
```

`.pth` files are site initialization files that Python executes automatically on startup. The first line of `litellm_init.pth` was `subprocess.Popen([sys.executable, "-c", "import base64; exec(...)"])`. Not legitimate initialization code.

The process explosion was actually a bug in the malware. The `.pth` auto-execution ran recursively, spawning processes infinitely. Ironically, this bug is why I caught the infection early. If it had run quietly, I wouldn't have noticed.

## Supply Chain Attack

Ouroboros itself wasn't malicious. The culprit was `litellm 1.82.8` — someone planted a backdoor in a package that Ouroboros pulled in as a dependency.

Public analysis released the same day:

- Both `litellm 1.82.7` and `1.82.8` were compromised
- Uploaded directly to PyPI with no corresponding GitHub release or tag
- PyPI quarantined the `litellm` project the same day
- Suspected compromise of a LiteLLM maintainer account

No evidence points to the Ouroboros developer. Nor to any LiteLLM maintainer personally. The most that can be identified is "an unknown attacker who hijacked LiteLLM's PyPI publishing credentials."

## What It Targeted

The malware's collection targets:

- `.env` files (API keys, DB passwords, service secrets)
- SSH keys, AWS/GCP/Azure credentials
- Docker config, Git config
- Shell history, `printenv` output
- Slack/Discord webhook URLs (recursive grep through file contents)

It also attempted persistence. `~/.config/sysmon/sysmon.py` and `~/.config/systemd/user` were created at the time of infection. `sysmon.py` was 0 bytes. Looks like it reached the persistence stage but crashed from the process explosion before completing.

## Response

### Immediate Actions

1. Killed all runaway processes
2. Removed Ouroboros, deleted it from Claude settings
3. Wiped the infected `uv` cache environment
4. Deleted persistence artifacts (`sysmon`, `systemd`)
5. Posted [root cause analysis](https://github.com/Q00/ouroboros/issues/195#issuecomment-4117989406) on the Ouroboros repo

### Token/Key Rotation

Assumed all secrets stored in files were compromised and rotated them. Anthropic, Google AI, Clerk, Supabase, Twitter/X, LemonSqueezy, CouchDB, Linear API Key, and DB accounts in every project's DATABASE_URL.

### Verification

After reboot: no `python3.12`, `litellm`, or `sysmon` processes reappearing. Relaunching Claude caused no recurrence. No residual malicious files.

## Was Data Actually Exfiltrated?

Can't confirm.

- **Malware execution**: Confirmed
- **Exfiltration attempt**: Highly likely. Persistence artifacts were created, which means the preceding stages — collection and upload — likely executed too
- **Exfiltration success**: Unconfirmable without network logs

The malware was designed to send data silently, `curl -s -o /dev/null` style. Without packet capture or DNS logs, there's no way to prove whether it succeeded. I wasn't running a network monitor like Little Snitch or LuLu.

Only option is to assume exfiltration occurred and respond accordingly.

## Timing

I'd been putting off installing Ouroboros for days. Today I thought, "not feeling productive, might as well install it and take a look." That moment happened to be one hour after the backdoor was uploaded to PyPI. `litellm 1.82.8` was published on March 24th. The `models.litellm.cloud` domain was registered just before the attack.

I didn't install something sketchy. The timing of a routine open-source install was catastrophically unlucky.

## Lessons

What this incident made clear: no matter how careful I am, a compromised dependency somewhere in the chain can get me. I didn't write bad code. The project looked legitimate. The cause was a transitive dependency in the supply chain.

**"Don't get breached" is less realistic than "keep the blast radius small."** Perfect prevention is impossible. Separate your main environment from your experiment environment. Use short-lived tokens instead of long-lived ones. Isolate projects with lots of secrets from environments where you try new tools.

**New plugins go in an isolated environment first.** I installed this on my main dev machine — the one with dozens of `.env` files. Running it in a VM or a separate user session first would have drastically limited the damage.

**You need a network monitor.** Little Snitch or LuLu would have caught the traffic to `models.litellm.cloud` and let me confirm whether exfiltration actually succeeded. A developer machine without a network monitor is a blind spot.

**The process explosion saved me.** If the malware developer hadn't introduced the `.pth` recursive execution bug, the system would have stayed quiet, and I wouldn't have noticed for a long time. Silent malware is scarier.

## References

- [LiteLLM Issue #24512 — Malicious litellm_init.pth](https://github.com/BerriAI/litellm/issues/24512)
- [FutureSearch — LiteLLM PyPI Supply Chain Attack](https://futuresearch.ai/blog/litellm-pypi-supply-chain-attack/)
- [Ouroboros Issue #195](https://github.com/Q00/ouroboros/issues/195)
- [PyPI litellm (quarantined)](https://pypi.org/project/litellm/)
