docuK HTML format
=====

This is an HTML document format named docuK which is rendered by JavaScript, jQuery, MathJax, and google code prettifier.

Specific features are
* Changable mode, font-family.
* Resizable font-size, line-height.
* Table of contents.
* Numbering of sections/figures/equations.
* Citing references in bubble-shape pop up.
* Refering figures and equations.
* Refering anything with id and element with class="number".
* Delayed(lazy)-loading of figures (images, iframes).
* Delayed(lazy)-rendering of maths (MathJax).
* Auto code printing from `<codeprint id="code-id"></codeprint>` to `<pre id="pre-code-id"></pre>`.

Quite similar to LaTeX or Wiki document, but extended a little bit.

The details are described in

* [kipid's blog - HTML docuK format ver. 2.1](http://kipid.tistory.com/entry/HTML-docuK-format-ver-20): Full detailed description about docuK.
* [kipid's blog - HTML docuK format 2.1, short copiable version](http://kipid.tistory.com/entry/docuK-short-copiable-version): Short copiable version of docuK. You can copy and paste it, and revise the contents part only to produce a new document of your own.
* [kipid's blog - Super Easy Edit (SEE) of docuK](http://kipid.tistory.com/entry/Super-Easy-Edit-SEE-of-docuK): Working on this. You can simply edit the docu in super easy manner, and you can post it anywhere by "copy and paste" way.

The above documents are also made up by using docuK format.

# Simple Example

## Stylesheet comes at first (Do not edit).

DO NOT EDIT this part unless you are willing to change some style of the document. This is a default style with dark mode.

```html
<codeprint id="docuK-style">
<link rel="stylesheet" media="all" type="text/css" 
href="http://cfs.tistory.com/custom/blog/146/1468360/skin/images/docuK-min.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js">
</script>
</codeprint><!-- docuK-style -->
```


## Document part comes at middle (Edit it yourself).

EDIT it yourself, following the format.

### SEE (Super Easy Edit of docuK)

```html
<codeprint class="SEE">
# Main title

Write document.


## TOC

###/ Table of Contents


## section

something1 <cite class="ref-ex"></cite>


### subsection

something2


#### subsubsection

something3


## RRA

<ol class="refs">
	<li id="ref-ex"><a href="...">Reference 1</a></li>
</ol>
</codeprint>
```

### HTML form.

```html
<codeprint id="docuK-docu">
<div class="docuK">
<!-- <div class="docuK bright"> for default bright docu. -->
<div class="sec" id="docuK-log"></div>
<!-- docuK format lastly updated at 2014-06-12. -->
<meta name="description" content="HTML docuK format ver. 2.1 short copiable version" />

<div class="sec"><h1>TITLE</h1>
	<div class="p">
		Cite references like this <cite class="ref-latex"></cite>.
	</div>
</div>

<div class="sec hiden"><h2 class="no-sec-N" id="sec-PH">Posting History</h2>
	<ul>
		<li>2014-??-??: First Posting.</li>
	</ul>
</div>

<div class="sec"><h2 class="notSec">Table of Contents</h2>
	<div class="toc p"></div>
</div>

<!--
Additional classes you can use in "div.sec" and "div.sec>h2:first-child".
sec class="noToggleUI hiden",
h2 class="notSec",
h2 class="no-sec-N" id="sec-id"
-->
<div class="sec"><h2>section</h2>
	<div class="p">
		Citing the reference <cite class="ref-docuK"></cite><cite class="ref-1"></cite>
	</div>
	
	<div class="subsec"><h3>subsection</h3>
		<div class="subsubsec"><h4>subsubsection</h4>
			<div class="p">
				citing the reference <cite class="ref-"></cite><cite class="ref-1"></cite>
			</div>
		</div>
	</div>
</div>

<div class="sec"><h2>Equations, Figures, and Code printing</h2>
	<div class="subsec"><h3>Equation</h3>
		<div class="p">
			Equations: <eq>g(a)</eq>.
			Using &amp;ensp;, break maths into newlineable fragments:
			$f(x)$&ensp;$= x^4$&ensp;$+ 3 x^3$&ensp;$- 8 x^2$&ensp;$+ x$&ensp;$- 5$.
			Or using &amp;thinsp;: $f(x)$&thinsp;$= x^4$&thinsp;$+ 3 x^3$&thinsp;$- 8 x^2$&thinsp;$+ x$&thinsp;$- 5$.
			Using only `\$`: $f(x)$$= x^4$$+ 3 x^3$$- 8 x^2$$+ x$$- 5$,
			Without: $f(x)= x^4+ 3 x^3- 8 x^2+ x- 5$.
			<eqq id="eq-">
				f(x)
			</eqq>
			Refering equations <refer class="eq-"></refer>
		</div>
	</div>
	
	<div class="subsection"><h3>Comment/BeCareFul box</h3>
		<div class="cmt">
			This is cmt box.
		</div>
		<div class="cmt">
			<div class="p">This is cmt box.</div>
			<div class="p">This is cmt box.</div>
		</div>
		
		<div class="bcf">
			This is bcf box.
		</div>
		<div class="bcf">
			<div class="p">This is bcf box.</div>
			<div class="p">This is bcf box.</div>
		</div>
	</div>
	
	<div class="subsec"><h3>Figures</h3>
		<figure><div class="fig">
			<div style="display:inline-block; padding:15px; background:gray">
				<img src="http://cfile1.uf.tistory.com/image/2479CF495319A30A248DC6"/>
			</div>
			<div class="caption">border formatting.</div>
		</div></figure>
		
		<div class="p">
			Elements with disableQ0 class 
			remove <code>&lt;!-- --&gt;</code> 
			inside them only when deviceWidth>321. 
			This is for Galaxy S (or old smartphones) problem
			like unexpected scrollTop.
		</div>
		<figure id="fig-"><div class="fig disableQ0">
			<!-- <div class="rC" style="border:6px rgb(70,70,70) solid"><div class="rSC">
				<iframe src="http://www.youtube.com/embed/Az9hckMi6KI" frameborder="0" allowfullscreen>
				</iframe>
			</div></div> -->
			<div class="caption">iframe youtube with fixed ratio. And border formatting</div>
		</div></figure>
		<div class="p">Refering figures <refer class="fig-"></refer></div>
	</div>
</div>

<div class="sec hiden"><h2>Opening Sources</h2>
	<div class="subsec"><h3>docuK CSS style</h3>
		<pre id="pre-docuK-style" class="prettyprint linenums lang-html scrollable"></pre>
	</div>
	
	<div class="subsec"><h3>docuK HTML document</h3>
		<pre id="pre-docuK-docu" class="prettyprint linenums lang-html scrollable"></pre>
	</div>
	
	<div class="subsec"><h3>docuK SCRIPT (JavaScript including jQuery, MathJax, and Google code prettyfier)</h3>
		<pre id="pre-docuK-script" class="prettyprint linenums lang-html scrollable"></pre>
	</div>
</div>

<div class="sec noToggleUI"><h2 class="no-sec-N" id="sec-Refs">References and Related Articles</h2>
	<ol class="refs">
		<div class="subsec"><h3>Main</h3></div>
		<li id="ref-docuK">
			<a href="http://kipid.tistory.com/entry/HTML-docuK-format-ver-20">
			kipid's blog - HTML docuK format ver. 2.1
			</a>
		</li>
		<li id="ref-docuKShort">
			<a href="http://kipid.tistory.com/entry/docuK-short-copiable-version">
			kipid's blog - docuK short copiable version
			</a>
		</li>
		<li id="ref-docuKGithub">
			<a href="https://github.com/kipid/docuK">
			github.com - kipid - docuK
			</a>
		</li>
	</ol>
</div>
</div><!-- docuK -->
</codeprint><!-- docuK-docu -->
```


## Scripts comes at last (Do not edit).

DO NOT EDIT this part unless you are willing to change some properties of the document and MathJax.

```html
<codeprint id="docuK-script">
<script>
window.kipid=window.kipid||{};
kipid.delayPad=3000;
kipid.wait=2000;
</script>
<script type="text/x-mathjax-config">
MathJax.Hub.Config({
	skipStartupTypeset: true, // Skip startup typeset.
	positionToHash: false, // No repositioning to #something anchor.
	tex2jax: {
		inlineMath: [['$','$'], ['\\(','\\)']], // Using $ for inline math.
		displayMath: [['$$','$$'], ['\\[','\\]']], // Using $$ for outline math.
		processEscapes: true, // Escape \$
		processEnvironments: false, // Ignore \begin{something} ... \end{something}
	}
});
</script>
<script src="https://c328740.ssl.cf1.rackcdn.com/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" defer></script>

<script src="http://cfs.tistory.com/custom/blog/146/1468360/skin/images/docuK-min.js"></script>
</codeprint><!-- docuK-script -->
```


# Recommended to

## Use good editors
When you write the HTML document including docuK document also, using good editors such as [Sublime Text](http://www.sublimetext.com/) editor with [Emmet (ex-Zen Coding) package](https://sublime.wbond.net/packages/Emmet) installed is highly recommended. Try useful shortkeys 'Ctrl+D' (Multiple Selections and Simultaneous Multiple Edit. 'Ctrl+K, D': skip the current selection. 'Ctrl+U': soft undo. 'Ctrl+Shift+U': soft redo.), 'Ctrl+P' (Go to Anything. 'Ctrl+R':go to Symbols (id). 'Ctrl+G':go to Line.), and [emmet style typings](http://emmet.io/) (Watch the demo video in the link).

See the introducing of mine at [Sublime Text (editor) 소개 (Korean)](http://kipid.tistory.com/entry/Introducing-Sublime-Text-editor), if you can read Hangul.


## Use browser developement tools
F12 key opens developement tool in many browsers (Chrome, Firefox, IE). Inspect your HTML documents by them. You can easily find out your html element one by one, clicking 'magnifying glass'-shaped button (in Chrome) and clicking an element which you want to inspect in your html document.

Then CSS testing through inserting inline styles (element.style or class style) and JavaScript testing through console are extremely useful. You can change your style by inserting CSS code inside `<style></style>` tag or directly putting a `style` attribute in html elements like `<div style="background:rgb(255,230,230); float:right">`.