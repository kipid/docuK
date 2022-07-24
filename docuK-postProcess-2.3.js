(function(kipid, $, undefined) {
// Printing codes in <codeprint> with id into <pre>.
let codeprints=$("codeprint");
for (let i=0;i<codeprints.length;i++) {
	kipid.printCode(codeprints.eq(i).attr('id'));
}

// SEE (Super Easy Edit)
let $SEE=$("codeprint.SEE");
for (let i=0;i<$SEE.length;i++) {
	let $SEEi=$SEE.eq(i);
	let SEEiHTML=$SEEi.html().trim();
	$SEEi.html("");
	$SEEi.after(kipid.renderToDocuK( SEEiHTML ));
}
$("pre.prettyprint.scrollable").addClass("linenums");

let docuK=$(".docuK");
kipid.docuK=docuK;

// Showing disableQ0 only in width>321.
if (kipid.browserWidth>321) {
	docuK.find(".disableQ0").html(function(ith,orgText) {
		kipid.logPrint("<br><br>\".disableQ0\"s are enabled at vertical position of "+(100*$(this).offset().top/$(document).height()).toPrecision(3)+"% of document.");
		return orgText.replace(/<!--/g,'').replace(/-->/g,'');
	});
}

// <eq> and <eqq> tags to MathJax format
let eqs=$("eq");
for (let i=0;i<eqs.length;i++) {
	eqs.eq(i).html(function(ith,orgTxt) {return "\\( "+orgTxt.trim()+" \\)";});
}
let eqqs=$("eqq");
for (let i=0;i<eqqs.length;i++) {
	eqqs.eq(i).html(function(ith,orgTxt) {return "\\[ "+orgTxt.trim()+" \\]";});
}
kipid.logPrint("<br><br>&lt;eq&gt; and &lt;eqq&gt; tags are rendered to MathJax format, being enclosed by \\ ( and \\ ).");

// docuK process.
docuK.has("script").addClass("noDIdHandle");
let k=docuK.length;
for(let i=1;i<k;i++) {
	kipid.docuKProcess(kipid, jQuery, i);
}

kipid.bubbleRefs=docuK.find(".bubbleRef"); // for function kipid.ShowBR

let inRefs=docuK.find(".inRef");
// Centering arrow.
inRefs.each(function () {
	let $elem=$(this);
	let width=$elem.width()-2;
	let $arrow=$elem.find(".arrow");
	let borderWidth=parseFloat($arrow.css("borderWidth"));
	let fontSize=parseFloat($arrow.css("fontSize"));
	$arrow.css({marginLeft:((width/2-borderWidth)/fontSize).toFixed(2)+"em"});
});
// Delayed-Load in bubble ref.
inRefs.on("mouseenter.delayedLoad", function () {
	kipid.logPrint("<br>Do delayed-load in bubble ref.");
	$window.trigger("scroll.delayedLoad");
	$(this).off("mouseenter.delayedLoad");
});

// On ready.
$(document).ready(function () {
	// Hiding hiden sections.
	docuK.find(".sec.hiden").find(">.sec-contents").css({display:"none"});

	// Setting and Printing Styles
	// kipid.TFontSize=docuK.find(".TFontSize");
	// kipid.TLineHeight=docuK.find(".TLineHeight");

	kipid.deviceInfo=docuK.find(".deviceInfo");
	kipid.fontSize=parseFloat(docuK.css('font-size'));
	kipid.lineHeight10=parseInt(parseFloat(docuK.css('line-height'))/kipid.fontSize*10);
	kipid.fontFamily=docuK.css('font-family').trim().split(/\s*,\s*/)[0];
	kipid.mode=(docuK.is(".bright"))?"Bright":"Dark";

	let cookieItem;
	kipid.logPrint("<br>");
	cookieItem=kipid.docCookies.getItem("kipid.mode");
	if (cookieItem!==null) {
		kipid.Cmode(cookieItem);
		kipid.logPrint("<br>Mode "+cookieItem+" is set from cookie.");
	}
	cookieItem=kipid.docCookies.getItem("kipid.fontFamily");
	if (cookieItem!==null) {
		kipid.CfontFamily(cookieItem);
		kipid.logPrint("<br>Font "+cookieItem+" is set from cookie.");
	}
	cookieItem=kipid.docCookies.getItem("kipid.fontSize");
	if (cookieItem!==null) {
		kipid.CfontSize(Number(cookieItem)-kipid.fontSize);
		kipid.logPrint("<br>Font-size "+(Number(cookieItem)*1.8).toFixed(1)+" is set from cookie.");
	}
	cookieItem=kipid.docCookies.getItem("kipid.lineHeight10");
	if (cookieItem!==null) {
		kipid.ClineHeight(parseInt(cookieItem)-kipid.lineHeight10);
		kipid.logPrint("<br>Line-height "+(parseInt(cookieItem)/10).toFixed(1)+" is set from cookie.");
	}

	// kipid.TFontSize.html((kipid.fontSize*1.8).toFixed(1)+"px");
	// kipid.TLineHeight.html((kipid.lineHeight10/10).toFixed(1));
	// kipid.deviceInfo.html("browser width: "+kipid.browserWidth);
	kipid.printDeviceInfo();
	kipid.logPrint("<br><br>Current styles (dark/bright mode, font-family, font-size, line-height) are shown.");

	// Initial Delayed Load.
	kipid.delayedElems=$("[delayed-src], [delayed-bgimage], .to-be-executed");
	kipid.logPrint("<br><br>There are "+kipid.delayedElems.length+" delayed elements.");
	$window.on("scroll.delayedLoad", kipid.delayedLoadByScroll);
	$window.trigger("scroll.delayedLoad");
	// $window.off("scroll.delayedLoad");

	// Kakao js script (from kakao.com CDN) is added.
	kipid.kakao_js_id='kakao-jssdk';
	if (!document.getElementById(kipid.kakao_js_id)) {
		let kakao_js=document.createElement('script');
		kakao_js.src='https://developers.kakao.com/sdk/js/kakao.js';
		kakao_js.id=kipid.kakao_js_id;
		(document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(kakao_js);
	}
	kipid.logPrint('<br><br>kakao.js is loaded.');
	kipid.kakaoInitDo=function () {
		if (typeof Kakao!=='undefined') {
			clearInterval(kipid.kakaoInit);
			if (!Kakao.isInitialized()) {
				Kakao.init('c85c800b54a2a95faa5ca7a5e3d357ef');
			}
			kipid.logPrint('<br>Kakao.isInitialized()='+Kakao.isInitialized());
		}
	};
	kipid.kakaoInit=setInterval(kipid.kakaoInitDo, 2000);

	kipid.popUpKakao=function () {
		let $desc=$("meta[name='description']");
		let href=window.location.href;
		Kakao.Share.sendDefault({
			objectType: 'feed',
			content: {
				title: $("title").text(),
				description: $desc?$desc[0].content:'',
				imageUrl: '',
				link: {
					mobileWebUrl: href,
					webUrl: href,
				},
			},
		});
	};

	// google code prettify js script (from kipid.tistory CDN) is added.
	if (docuK.find('.prettyprint').exists()) {
		let gcp=document.createElement('script');
		gcp.defer='';
		gcp.src='https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js';
		(document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(gcp);
		kipid.logPrint('<br><br>Google code prettyfy.js is loaded since ".prettyprint" is there in your document.');
	}

	// MathJax js script (from cdn.mathjax.org) is added.
	if (docuK.find('eq, eqq').exists()) {
		let mjx=document.createElement('script');
		mjx.defer='';
		mjx.src='https://cdn.rawgit.com/mathjax/MathJax/2.7.1/MathJax.js?config=TeX-AMS-MML_HTMLorMML';
		(document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(mjx);
		kipid.logPrint('<br><br>MathJax.js is loaded since "eq, eqq" is there in your document.');
		// MathJax PreProcess after the above MathJax.js is loaded.
		kipid.mathJaxPreProcessDo=function () {
			if (typeof MathJax!=='undefined') {
				clearInterval(kipid.mathJaxPreProcess);
				MathJax.Hub.Queue(["PreProcess",MathJax.Hub]);
				MathJax.Hub.Queue(function () {
					kipid.delayedElems=kipid.delayedElems.add(".MathJax_Preview");
					kipid.logPrint("<br><br>\".MathJax_Preview\" are added to kipid.delayedElems. Now its length is: "+kipid.delayedElems.length);
					$window.on("scroll.delayedLoad", kipid.delayedLoadByScroll);
				});
			}
		};
		kipid.mathJaxPreProcess=setInterval(kipid.mathJaxPreProcessDo, 2000);
	}

	// ShortKeys (including default 'processShortcut(event)' of tistory.)
	kipid.fdList=$("#header,#content,#container,#wrapContent,.docuK .sec>h1,.docuK .sec>h2,.docuK .subsec>h3,.docuK .subsubsec>h4,#entry1Comment,#disqus_thread,#aside"); // Ordered automatically by jQuery.
	kipid.tocs=$(".docuK>.sec").has(".toc");
	kipid.rras=$(".docuK>.sec").has("ol.refs");
	kipid.processShortKey=function(event) {
		if (event.altKey||event.ctrlKey||event.metaKey) return;
		switch (event.target.nodeName) {
			case "INPUT": case "SELECT": case "TEXTAREA": return;
		}
		let scrollTop=null;
		let i, k;
		switch (event.keyCode) {
			case 70: //F=70
			case 68: //D=68
				scrollTop=$window.scrollTop();
				k=kipid.fdList.length;
				let hI;

				if (event.keyCode===70) {
					scrollTop+=10;
					for (i=0;i<k;i++) {
						hI=kipid.fdList.eq(i);
						if (hI.is(":visible")&&scrollTop<hI.offset().top) { break; }
					}
					if (i===k) {
						// hI=kipid.fdList.eq(0);
						// alert("This is the last section.");
						return;
					}
				} else{
					scrollTop-=10;
					for (i=k-1;i>=0;i--) {
						hI=kipid.fdList.eq(i);
						if (hI.is(":visible")&&scrollTop>hI.offset().top) { break; }
					}
					if (i===-1) {
						// hI=kipid.fdList.eq(k-1);
						// alert("This is the first section.");
						return;
					}
				}
				$window.scrollTop(hI.offset().top);
				break;
			case 84: //T=84
				scrollTop=$window.scrollTop();
				k=kipid.tocs.length;
				let tocI;
				scrollTop-=10;
				for (i=k-1;i>=0;i--) {
					tocI=kipid.tocs.eq(i);
					if (tocI.is(":visible")&&scrollTop>tocI.offset().top) { break; }
				}
				if (i===-1) {
					tocI=kipid.tocs.eq(k-1);
				}
				$window.scrollTop(tocI.offset().top);
				break;
			case 82: //R=82
				scrollTop=$window.scrollTop();
				k=kipid.rras.length;
				let rraI;
				scrollTop-=10;
				for (i=k-1;i>=0;i--) {
					rraI=kipid.rras.eq(i);
					if (rraI.is(":visible")&&scrollTop>rraI.offset().top) { break; }
				}
				if (i===-1) {
					rraI=kipid.rras.eq(k-1);
				}
				$window.scrollTop(rraI.offset().top);
				break;
			case 76: //L=76
				window.location="/category/0";
				break;
			case 90: //Z
				if ($("#recentEntries").exists()) $window.scrollTop($("#recentEntries").offset().top);
				break;
			case 88: //X
				if ($("#recentComment").exists()) $window.scrollTop($("#recentComment").offset().top);
				break;
			case 67: //C
				if ($("#recentTrackback").exists()) $window.scrollTop($("#recentTrackback").offset().top);
				break;
			default:
				if (window['processShortcut']!==undefined) processShortcut(event);
		}
	}
	document.onkeydown=kipid.processShortKey;
	let shortkeyDesc=$("#shortkey>ul");
	if (shortkeyDesc.exists()) {
		shortkeyDesc.prepend(
			"<li>T: Table of Contents</li>"
			+"<li>R: References</li>"
			+"<li>F: Forward Section</li>"
			+"<li>D: Previous Section</li>"
			+"<li>L: To 전체목록/[Lists]</li>"
		);
	}
	kipid.logPrint("<br><br>New ShortKeys (T: Table of Contents, F: Forward Section, D: Previous Section, L: To 전체목록/[Lists]) are set.");

	kipid.logPrint("<br><br>kipid.delayPad="+kipid.delayPad+";<br>kipid.wait="+kipid.wait+";");

	// Closing docuK Log.
	kipid.logPrint("<br><br><span class='emph'>docuK scripts are all done. Then this log is closing in 1.0 sec.</span>");
	setTimeout(function () {kipid.log.hide();}, 300);
});
})(window.kipid, jQuery);