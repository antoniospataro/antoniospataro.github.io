---
layout: post
category: writeups
---

During our internal research period, we decided to run some tests on a few Bug Bounty programs, with the goal of assessing the effectiveness of common security controls.

During these activities, we stumbled upon an interesting case: an apparently harmless file upload feature which, after deeper analysis, turned out to be exploitable and could be escalated into a **Stored Cross-Site Scripting (XSS)**. From a seemingly legitimate file upload we were able to escalate the issue into a **single-click Account Takeover (1-click ATO)** despite the presence of the `httpOnly` attribute on session cookies. This showed how even seemingly robust defenses can be bypassed with a methodical yet creative approach.

link: [Da XSS ad Account Takeover sfruttando l&#039;autocompletamento](https://www.unlock-security.it/en/bug-bounty-en/from-xss-to-account-takeover/)
