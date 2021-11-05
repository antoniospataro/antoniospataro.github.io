---
layout: post
category: writeups
---

It was one of the many days in which I turned on twitter to read something interesting when I discovered, for the first time, a challenge of intigriti, so I thought, why not do it! So, I tried my first intigriti ctf.

# Obtain information
The challenge starts by giving you a `?html` parameter in the page content that you can use on the site to test it.

the first thing i tried was injecting some text, some tags and some javascript. There was an HTML injection, but upon inspecting the page, it was clear why the javascript could not run. On the site, there was a CSP (Content Security Policy)[^1].

![html](https://antoniospataro.github.io/img/html-inj.png){:.ioda}

![csp](https://antoniospataro.github.io/img/CSP.png){:.ioda}

quickly reading the CSP you can realize that it is not possible to execute any javascript inline except for two scripts already included in the source. What we will need will be the second script.
```
window.addEventListener("DOMContentLoaded", function () {
        e = `)]}'` + new URL(location.href).searchParams.get("xss");
        c = document.getElementById("body").lastElementChild;
        if (c.id === "intigriti") {
          l = c.lastElementChild;
          i = l.innerHTML.trim();
          f = i.substr(i.length - 4);
          e = f + e;
        }
        let s = document.createElement("script");
        s.type = "text/javascript";
        s.appendChild(document.createTextNode(e));
        document.body.appendChild(s);
      });
```

# Analyze the script:    
In the first line, it creates a string equal to `)]}'VALUE`, where VALUE can be chosen by us at will, simply passing the value in the link through the `?xss` parameter.

Subsequently, the last element of the tag with `id="body"` will be saved in a variable c. If the id of this last element is equal to "intigriti", then it will save the last element of the tag with `id="intigriti"` in a new variable and add the last four letters to the string c.

For example, if the last element tag with id="intigriti" was `<abcd> </abcd>`:
```
var c before if ---> ")]}'VALUE"
var c after if  ---> "bcd>)]}'VALUE"
```

Finally, the script will paste the final variable c to the bottom of the body to be executed like javascript.

Now it is possible to notice how in the first photo there is an error in the execution of the js code created by the script, due to the fact that the parenthesis ) of `)]}'` is not well indented. 

# Solve
### to solve the challenge it is necessary:
1. Inject a </h1> tag to close the string.
2. Inject a </div> tag to return to the body.
3. Inject any tag with id = "intigriti".
4. Inject a new tag, which should be the last tag of the body or the payload will not work.
5. Open and close any new tag, so that `)]}'` can be adjusted with the last four characters of the tag.
6. Inject a working javascript in `?xss` parameter, in my case:"%0Aalert(document.location)" 

There is the possibility to create a lot of different payloads to solve the challenge.

![solution](https://antoniospataro.github.io/img/hallowXss.png){:.ioda}

###### My final payload --> <a href="https://challenge-1021.intigriti.io/challenge/challenge.php?xss=%0Aalert(document.domain)&html=SpasticMMonkey%3C/h1%3E%3C/div%3E%3Cdiv%20id=%22intigriti%22%3E%3Cdiv%20id=%22LOL%22%3E%3Cdiv%20class=%22a%22%3E%27%22%3C/div%3E%3C/body%3E%3Cs%27[(%3EI%3C/span%3E%3C!--">here</a>



