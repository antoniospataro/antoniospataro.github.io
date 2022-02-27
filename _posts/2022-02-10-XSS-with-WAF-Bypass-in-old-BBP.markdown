---
layout: post
category: writeups
---

A month ago i was trying to hack a company that had just invited me to its bug bounty program. The company had been running the program since 2017, so I didn't expect to find much, because I knew it had been tested by tons of bug hunters. Looking at the leaderboard the situation did not improve, there were so many great hackers from the ranking of the top 100 in the world. I decided to focus on the main site.
After half an hour of searching I had found only a low vulnerability (closed with a $ X00 payment). I really wanted to find something a little more serious for personal satisfaction and so I continued to dig deep into the site. 

# Found a redirect parameter!
I soon came across an endpoint that used an r parameter to redirect to other pages on the site. I immediately tried redirecting to a random site, but unfortunately, the site in question had a firewall. I also tried to inject Javascript, but nothing. After two hours of trying various payloads and obfuscating portions of code with various techniques, I was able to find a bypass for an xss, using various techniques, but the browser, unfortunately, was not running it. I took a break from that program and rested, trying to think about it as little as possible. 

# Solution
After a few hours, I came up with a method that I had not tested, which is to exploit an anchor on the site. I turned on the pc, tried a simple payload like `javascript:alert()` , but before forwarding the url, I asked for an anchor on the page.
BOOM, using an anchor, the request did not go through the Web Firewall running my XSS. 

As soon as I found this bypass I thought: "will it also work in main pages?". I went to the main site's Homepage, found an anchor and tested my XSS. The code also ran on the home!

##### My final simple payload was: `target.com/#anchorNameInHome=X&r=javas%00cript:alert();%0A`

## Conclusion

After 4 days company triaged it, and after 8 paid me a good bounty of $X00. The company closed the report like medium.

The advice I can give to everyone, after this short report, is that you must never give up even if it seems that much more experienced people have already solved every problem of a company, there is always some vulnerability around the corner. In one day I managed to make something like $XX00 and I felt a lot satisfied that I found flaws in such an old program. It doesn't matter how long it takes, but if you are driven by passion, the results will come sooner or later.
