(function (kipid, $, undefined) {
$window=$(window);

$.fn.exists=function () { return this.length!==0; };
kipid.browserWidth=window.innerWidth;
const docuK=$(".docuK");
kipid.docuK=docuK;

// logPrint function.
kipid.$log=$("#docuK-log");
kipid.$log.addClass("fixed");
kipid.$log.html(`<div class="exit" onclick="kipid.HideBR(this)"><svg><g style="stroke:white;stroke-width:23%"><line x1="20%" y1="20%" x2="80%" y2="80%"></line><line x1="80%" y1="20%" x2="20%" y2="80%"></line></g>✖</svg></div>`);
kipid.logPrint=function (str) {
	kipid.$log.append(str);
	kipid.$log.scrollTop(kipid.$log[0].scrollHeight);
};
kipid.logPrint(`kipid.logPrint is working!`);
kipid.$log.after(`<div id="fuzzy-search-container" style="display:none">
	<div id="fuzzy-search" contenteditable="true"></div>
	<div id="fuzzy-search-list"></div>
	<div class="exit" onclick="kipid.HideBR(this)"><svg><g style="stroke:white;stroke-width:23%"><line x1="20%" y1="20%" x2="80%" y2="80%"></line><line x1="80%" y1="20%" x2="20%" y2="80%"></line></g>✖</svg></div>
</div>
<div id="out-focus" class="none">out focus</div>`);

// String to Array
kipid.encloseStr=function (str) {
	if (!str||str.constructor!==String) { return ''; }
	if (str.charAt(0)==='"'||/[\n\t]/.test(str)) {
		return `"${str.replace(/"/g,'""')}"`;
	} return str;
};
kipid.strToJSON=function (str, colMap=true, rowMap=false) {
	if (!str||str.constructor!==String) { return []; }
	if (str.charAt(str.length-1)!=="\n") {
		str+="\n";
	}
	const ret=[];
	const delimiter=/([^\t\n]*)([\t\n])/g;
	const lastQuote=/[^"](?:"")*"([\t\n])/g;
	let exec;
	let start=0;
	let row=-1, col=-1, delim="\n";
	let strElem="";
	function increseRC(delim) {
		if (delim==='\t') {
			col++; return true;
		} else if (delim==='\n') {
			row++; col=0; ret.push([]); return true;
		} return false;
	}
	while (start<str.length&&increseRC(delim)) {
		if ((str.substring(start, start+1))==='"') {
			lastQuote.lastIndex=start+1;
			if ((exec=lastQuote.exec(str))!==null) {
				strElem=str.substring(start+1, lastQuote.lastIndex-2);
				delim=exec[1];
				start=delimiter.lastIndex=lastQuote.lastIndex;
			} else {
				strElem=str.substring(start+1);
				delim="";
				start=str.length;
			}
			strElem=strElem.replace(/""/g,'"');
		} else {
			if ((exec=delimiter.exec(str))!==null) {
				strElem=exec[1];
				delim=exec[2];
				start=delimiter.lastIndex;
			} else {
				strElem=str.substring(start);
				delim="";
				start=str.length;
			}
		}
		ret[row][col]=strElem;
	}
	if (colMap) {
		const firstColSize=ret[0].length;
		for (let i=0;i<ret.length;i++) {
			let jMax=ret[i].length;
			if (jMax>firstColSize) { jMax=firstColSize; }
			for (let j=0;j<jMax;j++) {
				ret[i][ret[0][j]]=ret[i][j];
			}
		}
	}
	if (rowMap) {
		for (let i=0;i<ret.length;i++) {
			ret[ret[i][0]]=ret[i];
		}
	}
	return ret;
};
kipid.strToArray=function (str) {
	return kipid.strToJSON(str,false,false);
};
kipid.arrayToTableHTML=function (txtArray) {
	let tableStr="<table>";
	for (let row=0;row<txtArray.length;row++) {
		tableStr+="<tr>";
		for (let col=0;col<txtArray[row].length;col++) {
			tableStr+=`<td>${kipid.escapeHTML(txtArray[row][col]).replace(/\n/g,'<br>')}</td>`;
		}
		tableStr+="</tr>";
	}
	tableStr+="</table>";
	return tableStr;
};

// SEE (Super Easy Edit).
kipid.SEEToArray=function (SEE) {
	SEE=SEE.trim();
	const dE=/\s*\n\n+\s*/g; // split by double enter.
	let start=end=0;
	let re, subStr;
	const ps=[];
	while ((re=dE.exec(SEE))!==null) {
		end=dE.lastIndex;
		subStr=SEE.substring(start,end).trim();
		if (/^<pre\s*[^>]*>/i.test(subStr)) {
			while (!/<\/pre>$/i.test(subStr)) {
				re=dE.exec(SEE);
				end=dE.lastIndex;
				subStr=SEE.substring(start,end).trim();
			}
		} else if (/^```/.test(subStr)) {
			while (!/```\/$/.test(subStr)) {
				re=dE.exec(SEE);
				end=dE.lastIndex;
				subStr=SEE.substring(start,end).trim();
			}
		} else if (/^<script\s*[^>]*>/i.test(subStr)) {
			while (!/<\/script>$/i.test(subStr)) {
				re=dE.exec(SEE);
				end=dE.lastIndex;
				subStr=SEE.substring(start,end).trim();
			}
		} else if (/^<data\s*[^>]*>/i.test(subStr)) {
			while (!/<\/data>$/i.test(subStr)) {
				re=dE.exec(SEE);
				end=dE.lastIndex;
				subStr=SEE.substring(start,end).trim();
			}
		} else if (/^<!--/i.test(subStr)) {
			while (!/-->$/i.test(subStr)) {
				re=dE.exec(SEE);
				end=dE.lastIndex;
				subStr=SEE.substring(start,end).trim();
			}
		}
		ps.push(subStr);
		start=end;
	}
	subStr=SEE.substring(start).trim();
	ps.push(subStr);
	return ps;
};

kipid.renderToDocuK=function (toBeRendered) {
	const ps=kipid.SEEToArray(toBeRendered);
	const p=ps.length;

	const TOC="Table of Contents";
	const PH="Posting History";
	const RRA="References and Related Articles";
	const RSR="Referneces and Suggested Readings";

	const untilEnter=/[^\n]+/g; // until enter.
	let head, hN; // #*hN
	let emmet="", classes="", elemId="";

	let docuOn=false, secOn=false, subsecOn=false, subsubsecOn=false;
	let str='';

	function closeSec(hN) {
		switch (hN) {
			case 1: if (docuOn) { str+='</div>'; docuOn=false; }
			case 2: if (secOn) { str+='</div>'; secOn=false; }
			case 3: if (subsecOn) { str+='</div>'; subsecOn=false; }
			case 4: if (subsubsecOn) { str+='</div>'; subsubsecOn=false; }
			default:
		}
	}
	function getEmmetFromHead(trimedHead) {
		const exec=/^\[([\w\s#._:-]+)\]/.exec(trimedHead);
		if (exec) {
			return exec[1];
		}
	}
	function getClassesFromEmmet(str) {
		const rexClasses=/\.([\w:-]+)/g;
		let classes="";
		let res;
		while (res=rexClasses.exec(str)) {
			classes+=res[1]+" ";
		}
		return classes.trim();
	}
	function getIdFromEmmet(str) {
		let res=/#([\w:-]+)/.exec(str);
		if (res) {
			return res[1];
		}
		return "";
	}

	for (let i=0;i<p;i++) {
		ps[i]=ps[i].trim();

		if (hN=/^#+(?![#\/])/.exec(ps[i])) {
			untilEnter.lastIndex=hN=hN[0].length;
			closeSec(hN);
			head=untilEnter.exec(ps[i]);
			head=head[0].trim();
			emmet=getEmmetFromHead(head);
			classes=elemId="";
			if (emmet) {
				head=head.substring(emmet.length+2).trim();
				classes=getClassesFromEmmet(emmet);
				elemId=getIdFromEmmet(emmet);
				if (classes) {
					classes=` ${classes}`;
				}
				if (elemId) {
					elemId=` id="${elemId}"`;
				}
			}
			switch (hN) {
				case 1: str+=`<div class="docuK fromSEE"><div class="sec${classes}"><h1${elemId}>${head}</h1>`;
					docuOn=secOn=true; break;
				case 2:
					if (head==="TOC") {
						str+='<div class="sec">';
						head=TOC;
						str+=`<h2 class="notSec">${head}</h2><div class="p toc"></div></div>`; // self closing.
					} else if (head==="PH") {
						str+='<div class="sec hiden">';
						head=PH;
						str+=`<h2 class="no-sec-N" id="sec-PH">${head}</h2>`;
						secOn=true;
					} else if (head==="RRA") {
						str+='<div class="sec">';
						head=RRA;
						str+=`<h2 class="no-sec-N" id="sec-Refs">${head}</h2>`;
						secOn=true;
					} else {
						str+=`<div class="sec${classes}">`;
						str+=`<h2${elemId}>${head}</h2>`;
						secOn=true;
					}
					break;
				case 3: str+=`<div class="subsec${classes}"><h3${elemId}>${head}</h3>`;
					subsecOn=true; break;
				case 4: str+=`<div class="subsubsec${classes}"><h4${elemId}>${head}</h4>`;
					subsubsecOn=true; break;
				default: str+=`<h${hN}${elemId}>${head}</h${hN}>`;
			}
			ps[i]=ps[i].substring(untilEnter.lastIndex).trim();
		} else if (hN=/^#+(?=\/)/.exec(ps[i])) {
			hN=hN[0].length;
			closeSec(hN);
			continue; // Text after '#/' is ignored. Use '#####/' for comment.
		}

		if (ps[i].length) {
			if (/^<\/?\w/.test(ps[i])) {
				str+=ps[i];
			} else if (/^```/.test(ps[i])) {
				ps[i]=ps[i].replace(/^```/,'').replace(/```\/$/,'').trim();
				emmet=getEmmetFromHead(ps[i]);
				classes=elemId="";
				if (emmet) {
					ps[i]=ps[i].substring(emmet.length+2).trim();
					classes=getClassesFromEmmet(emmet);
					elemId=getIdFromEmmet(emmet);
					if (classes) {
						classes=` ${classes}`;
					}
					if (elemId) {
						elemId=` id="${elemId}"`;
					}
				}
				str+=`<pre class="prettyprint${classes}"${elemId}>${ps[i].replace(/<\/pre>/ig,'/pre replaced>')}</pre>`;
			} else {
				str+=`<div class="p">${ps[i]}</div>`;
			}
		}
	}
	closeSec(1);

	return str;
};

kipid.getContentsJoinedWithEnter=function ($elem) {
	const contents=$elem.contents();
	const contentsL=contents.length;
	const strArray=[];
	for (let i=0;i<contentsL;i++) {
		const contentI=contents.eq(i);
		if (contentI.is("ol")) {
			const lis=contentI.contents();
			for (let j=0;j<lis.length;j++) {
				strArray.push(lis.eq(j).text().trim());
			}
		} else {
			strArray.push(contentI.text().trim());
		}
	}
	return strArray.join("\n");
};

// cookies.js (copied from cookie-test.html)
kipid.expire=365*24*60*60; // max-age in seconds.
kipid.docCookies={
	hasItem:function (sKey) {
		return (new RegExp("(?:^|;\\s*)"+encodeURIComponent(sKey).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=")).test(document.cookie);
	}
	, getItem:function (sKey) {
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*"+encodeURIComponent(sKey).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=\\s*([^;]*).*$)|^.*$"),"$1"))||null;
	}
	, removeItem:function (sKey, sPath, sDomain, bSecure) {
		if (!sKey||/^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
		document.cookie=encodeURIComponent(sKey)+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT"+(sDomain?"; domain="+sDomain:"")+(sPath?"; path="+sPath:"")+(bSecure?"; secure":"");
		return true;
	}
	, setItem:function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		if (!sKey||/^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
		let sExpires="";
		if (vEnd) { switch (vEnd.constructor) {
			case Number:
				sExpires=vEnd===Infinity?"; expires=Fri, 31 Dec 9999 23:59:59 GMT":"; max-age="+vEnd;
				break;
			case String:
				sExpires="; expires="+vEnd;
				break;
			case Date:
				sExpires="; expires="+vEnd.toUTCString();
				break;
		}}
		document.cookie=encodeURIComponent(sKey)+"="+encodeURIComponent(sValue)+sExpires+(sDomain?"; domain="+sDomain:"")+(sPath?"; path="+sPath:"")+(bSecure?"; secure":"");
		return true;
	}
	, keys:function () {
		let aKeys=document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g,"").split(/\s*(?:\=[^;]*)?;\s*/);
		for (let nIdx=0;nIdx<aKeys.length;nIdx++) { aKeys[nIdx]=decodeURIComponent(aKeys[nIdx]); }
		return aKeys;
	}
};

// Functions for printing codes into 'pre.prettyprint'.
kipid.indentsRemove=function (str) {
	let firstIndent=str.match(/^\n\t+/), indentRegExp;
	if (firstIndent!==null) { // if match (first indent) is found
		indentRegExp=new RegExp("\\n\\t{1,"+(firstIndent[0].length-1)+"}",'g'); // /\n\t{1,n}/g: global greedy matching
	} else {
		indentRegExp=/^\n/; // just for minimum match
	}
	return str.replace(indentRegExp,'\n');
};
kipid.escapeHTML=function (str) {
	return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
};
kipid.printCode=function (codeId) {
	const $pre=$("pre#pre-"+codeId);
	const $code=$("#"+codeId);
	if ($pre.exists()) {
		let html=// ('<codeprint id="'+codeId+'">'+
			kipid.indentsRemove($code.html())
			// +'</codeprint><!-- '+codeId+' -->')
			.trim();
		if (!$code.is(".noEscapeHTML")) {
			html=kipid.escapeHTML(html);
		}
		$pre.html(html);
	}
};

// Function for toggling height, i.e. switching scrollability with conserving view.
kipid.toggleHeight=function (obj) {
	let next=$(obj).next();
	let toBeScrolledBy=0;
	let windowScrollTop=$window.scrollTop();
		// (window.pageYOffset!==undefined)?window.pageYOffset:(document.documentElement||document.body.parentNode||document.body).scrollTop
	let nOffsetTop=next.offset().top;
	let nHeight=next.height();
	// kipid.resultTest.append("before:\twindowScrollTop: "+windowScrollTop+";\tnOffsetTop: "+nOffsetTop+";\tnHeight: "+nHeight+"\n");

	if (next.is(".scrollable")) { // becomes expanded.
		toBeScrolledBy=next.scrollTop();
		next.removeClass("scrollable");
		window.scrollTo(0,windowScrollTop+toBeScrolledBy);
	} else { // becomes scrollable.
		if (windowScrollTop<nOffsetTop) {
			// case0: no scroll
			next.addClass("scrollable");
		} else {
			// case1: scroll both
			toBeScrolledBy=windowScrollTop-nOffsetTop;
			let tailHeight=nHeight-toBeScrolledBy;
			next.addClass("scrollable");
			nHeight=next.height();
			window.scrollTo(0,(nHeight>tailHeight)?nOffsetTop+nHeight-tailHeight:nOffsetTop);
			next[0].scrollTop=toBeScrolledBy;
		}
	}
	// kipid.resultTest.append("after : \twindowScrollTop: "+$window.scrollTop()+";\tnOffsetTop: "+next.offset().top+";\tnHeight: "+next.height()+"\n\n");
	// kipid.resultTest[0].scrollTop=kipid.resultTest[0].scrollHeight;
};

// section's show/hide functions
kipid.ShowHide=function (elem) {
	$(elem).next().toggle();
	if ($(elem).next().is(":visible")) {
		$(elem).html("▼ Hide");
	} else {
		$(elem).html("▼ Show");
	}
	setTimeout(function () {$window.trigger("scroll.delayedLoad");}, 1000);
};
kipid.Hide=function (elem) {
	let $elem=$(elem).parent();
	window.scrollBy(0,-$elem.outerHeight());
	$elem.hide();
	$elem.parent().find(".ShowHide").html("▼ Show");
};

// bubbleRef's show/hide functions
kipid.ShowBR=function (elem) {
	clearTimeout(kipid.timerHideBRQueue);
	kipid.bubbleRefs.hide();
	$(elem).find(">.bubbleRef").show();
};
kipid.timerHideBR=function (elem) {
	kipid.timerHideBRQueue=setTimeout(function () {$(elem).find(">.bubbleRef").hide();}, 1000);
};
kipid.HideBR=function (elem) {
	$(elem).parent().hide();
};

// Changing Styles of docuK
kipid.mode="Dark";
kipid.fontFamily="맑은 고딕";
kipid.fontSize=10;
kipid.lineHeight10=16;
kipid.defaultStyles={mode:kipid.mode, fontFamily:kipid.fontFamily, fontSize:kipid.fontSize, lineHeight10:kipid.lineHeight10};

kipid.printDeviceInfo=function () {
	if (kipid.$deviceInfo) {
		let referrer=document.referrer;
		let referrerHTML=(referrer?`<a target="_blank" href="${referrer}">${kipid.escapeHTML(decodeURIComponent(referrer))}</a>`:`Empty`);
		kipid.$deviceInfo.html(
			`Mode: ${kipid.mode}; Font: ${kipid.fontFamily}; font-size: ${(kipid.fontSize*1.8).toFixed(1)}px (${kipid.fontSize.toFixed(1)}); line-height: ${(kipid.lineHeight10/10).toFixed(1)};<br>
width: ${kipid.browserWidth}, height: ${window.innerHeight}<br>
document.referrer: ${referrerHTML}`
		);
	}
};

kipid.resetStyle=function () {
	kipid.Cmode(kipid.defaultStyles.mode);
	kipid.CfontFamily(kipid.defaultStyles.fontFamily);
	kipid.CfontSize(kipid.defaultStyles.fontSize-kipid.fontSize);
	kipid.ClineHeight(kipid.defaultStyles.lineHeight10-kipid.lineHeight10);
}
kipid.Cmode=function (modeI) {
	if (modeI=="Dark") {
		kipid.docuK.removeClass("bright");
	} else if (modeI=="Bright") {
		kipid.docuK.addClass("bright");
	} else {
		return false;
	}
	kipid.mode=modeI;
	kipid.printDeviceInfo();
	if (kipid.mode===kipid.defaultStyles.mode) {
		kipid.docCookies.removeItem("kipid.mode", "/");
	}
	else {
		kipid.docCookies.setItem("kipid.mode", kipid.mode, kipid.expire, "/");
	}
	return true;
};
kipid.CfontFamily=function (font) {
	kipid.docuK.css({fontFamily:font});
	kipid.fontFamily=font;
	kipid.printDeviceInfo();
	if (kipid.fontFamily===kipid.defaultStyles.fontFamily) {
		kipid.docCookies.removeItem("kipid.fontFamily", "/");
	}
	else {
		kipid.docCookies.setItem("kipid.fontFamily", kipid.fontFamily, kipid.expire, "/");
	}
	return true;
};
kipid.CfontSize=function (increment) {
	if (increment.constructor===Number&&!isNaN(increment)) {
		kipid.fontSize+=increment;
		if (kipid.fontSize<8) {
			kipid.fontSize=8;
		} else if (kipid.fontSize>27) {
			kipid.fontSize=27;
		}
		kipid.docuK.css({"font-size":kipid.fontSize.toFixed(1)+"px"});
		kipid.printDeviceInfo();
		if (kipid.fontSize===kipid.defaultStyles.fontSize) {
			kipid.docCookies.removeItem("kipid.fontSize", "/");
		}
		else {
			kipid.docCookies.setItem("kipid.fontSize", kipid.fontSize.toFixed(1), kipid.expire, "/");
		}
		return true;
	}
	return false;
};
kipid.ClineHeight=function (increment) {
	if (increment.constructor===Number&&!isNaN(increment)) {
		kipid.lineHeight10+=increment;
		if (kipid.lineHeight10<10) {
			kipid.lineHeight10=10;
			return false;
		} else if (kipid.lineHeight10>25) {
			kipid.lineHeight10=25;
			return false;
		}
		kipid.docuK.attr("style", `line-height:${(kipid.lineHeight10/10).toFixed(1)} !important`);
		kipid.printDeviceInfo();
		if (kipid.lineHeight10===kipid.defaultStyles.lineHeight10) {
			kipid.docCookies.removeItem("kipid.lineHeight10", "/");
		}
		else {
			kipid.docCookies.setItem("kipid.lineHeight10", kipid.lineHeight10, kipid.expire, "/");
		}
		return true;
	}
	return false;
};
$window.on("resize.deviceInfo", function () {
	if (window.innerWidth!==kipid.browserWidth) {
		kipid.browserWidth=window.innerWidth;
		kipid.fontSize=parseInt(kipid.docuK.css("font-size"));
		kipid.printDeviceInfo();
	}
});

// Share a link through SNS
kipid.shareSNS=function (service) {
	let title=encodeURIComponent( $("title").html() );
	let url=encodeURIComponent(window.location.href);
	let open="";
	switch (service) {
		case 'twitter':
			open="https://twitter.com/intent/tweet"+"?via=kipacti"+"&text="+title+"&url="+url;
			break;
		case 'facebook':
			open="https://www.facebook.com/sharer/sharer.php"+"?u="+url;
			break;
		case 'recoeve':
			open="https://recoeve.net/reco?"+"uri="+url+"&title="+title;
			break;
		case 'kakao':
			kipid.popUpKakao();
			return;
	}
	window.open(open);
};

// Delayed Loading. (Copied from user-page.html)
kipid.delayPad=kipid.delayPad||1024;
kipid.wait=kipid.wait||512;
kipid.$delayedElems=$("#nothing");
kipid.previous=Date.now();
$.fn.inView=function () {
	if (this.is(":visible")) {
		let viewportHeight=window.innerHeight;
		let scrollTop=$window.scrollTop();
		let elemTop=this.offset().top-kipid.delayPad;
		let elemBottom=elemTop+this.height()+kipid.delayPad;
		return (scrollTop+viewportHeight>elemTop)&&(scrollTop<elemBottom);
	} else {
		return false;
	}
};
$.fn.delayedLoad=function () {
	let done=false;
	if (this.inView()) {
		if (this.hasClass("to-be-executed")) {
			this.trigger("click");
		}
		// divs with background-image
		if (this.attr("delayed-bgimage")) {
			this.css("background-image", "url("+this.attr("delayed-bgimage")+")");
			this.removeAttr("delayed-bgimage");
			done=true;
		}
		// iframes or images
		if (this.attr("delayed-src")) {
			this.attr("src", this.attr("delayed-src"));
			this.removeAttr("delayed-src");
			done=true;
		}
		// MathJax Process
		if (typeof MathJax!=='undefined'&&this.is(".MathJax_Preview")) {
			MathJax.Hub.Queue(["Process", MathJax.Hub, this.next()[0]]);
			done=true;
		}
	}
	return done;
};
kipid.delayedLoadAll=function () {
	kipid.logPrint(`<br>Doing delayed-load. : ${kipid.$delayedElems.length}`);
	if (kipid.$delayedElems.length>0) {
		kipid.$delayedElems.each(function () {
			if ($(this).delayedLoad()) {
				kipid.$delayedElems=kipid.$delayedElems.not(this);
				kipid.logPrint(`<br><span class="emph">${this} at vertical position of ${(100*$(this).offset().top/$(document).height()).toPrecision(3)}% of document is delayed-loaded.</span><br>${kipid.$delayedElems.length} of $delayedElems are remained.<br>`);
			}
		});
		$window.on("scroll.delayedLoad", kipid.delayedLoadByScroll);
	} else {
		kipid.logPrint(`<br><br>All delayedElem are loaded.`);
		$window.off("scroll.delayedLoad");
	}
	kipid.previous=Date.now();
};
kipid.delayedLoadByScroll=function () {
	$window.off("scroll.delayedLoad");
	let now=Date.now();
	let passed=now-kipid.previous;
	if (passed>kipid.wait) {
		kipid.delayedLoadAll();
	} else {
		setTimeout(function () {
			kipid.delayedLoadAll();
		}, kipid.wait*1.1-passed);
		kipid.logPrint(`<br>wait ${(kipid.wait*1.1-passed).toFixed(0)}ms.`);
	}
};
$window.on("scroll.delayedLoad", kipid.delayedLoadByScroll);

// docuK Process
kipid.docuKProcess=function docuK(kipid, $, docuKI, undefined) {
	// Possible duplicate id is handled.
	docuKI=(isNaN(docuKI)||docuKI<0)?0:parseInt(docuKI);
	kipid.logPrint(`<br><br>docuK-${docuKI} scripts started!<br><span class="emph">If this log is not closed automatically, there must be an error somewhere in your document or scripts.</span>`);
	let docuK=kipid.docuK.eq(docuKI);
	if (docuK.is(".rendered")) {
		kipid.logPrint(`<br><br>docuK-${docuKI} is already rendered.`);
		return;
	}

	let postId="-in-docuK"+docuKI;
	let postIdRegEx=new RegExp(postId+"$");
	if (docuK.is(".noDIdHandle")) {
		postId="";
	} else {
		docuK.find("[id]").each(function () {
			let $this=$(this);
			$this[0].id+=postId;
		});
	}

	// Copyright and Short Keys announcement.
	docuK.before(`<div class="copyright"><ul>
	<li class="license cc"><span class="bold">Creative Commons</span></li>
	<li class="license by"><span class="bold">저작자표시</span> - 적절한 출처와, 해당 라이센스 링크를 표시하고, 변경이 있는 경우 공지해야 합니다. 합리적인 방식으로 이렇게 하면 되지만, 이용 허락권자가 귀하에게 권리를 부여한다거나 귀하의 사용을 허가한다는 내용을 나타내서는 안 됩니다.</li>
	<li class="license nc"><span class="bold">비영리</span> - 이 저작물은 영리 목적으로 이용할 수 없습니다.</li>
	<li class="license nd"><span class="bold">변경금지</span> - 이 저작물을 리믹스, 변형하거나 2차적 저작물을 작성하였을 경우 그 결과물을 공유할 수 없습니다.</li>
</ul></div>
<div class="shortkey">
	Short Keys
	<ul>
		<li onclick="kipid.processShortKey({keyCode:'F'.charCodeAt(0)})"><span class="bold underline">F</span>: <span class="bold underline">F</span>orward Section</li>
		<li onclick="kipid.processShortKey({keyCode:'D'.charCodeAt(0)})"><span class="bold underline">D</span>: Previous Section</li>
		<li onclick="kipid.processShortKey({keyCode:'T'.charCodeAt(0)})"><span class="bold underline">T</span>: <span class="bold underline">T</span>able of Contents</li>
		<li onclick="kipid.processShortKey({keyCode:'R'.charCodeAt(0)})"><span class="bold underline">R</span>: <span class="bold underline">R</span>eferences</li>
		<li onclick="kipid.processShortKey({keyCode:'L'.charCodeAt(0)})"><span class="bold underline">L</span>: To 전체목록/[<span class="bold underline">L</span>ists]</li>
		<li onclick="kipid.processShortKey({keyCode:'Z'.charCodeAt(0)})"><span class="bold underline">Z</span>: Tistory comments</li>
		<li onclick="kipid.processShortKey({keyCode:'X'.charCodeAt(0)})"><span class="bold underline">X</span>: DISQUS comments</li>
	</ul>
</div>`);
	docuK.after(`<div class="copyright"><ul>
	<li class="license cc"><span class="bold">Creative Commons</span></li>
	<li class="license by"><span class="bold">저작자표시</span> - 적절한 출처와, 해당 라이센스 링크를 표시하고, 변경이 있는 경우 공지해야 합니다. 합리적인 방식으로 이렇게 하면 되지만, 이용 허락권자가 귀하에게 권리를 부여한다거나 귀하의 사용을 허가한다는 내용을 나타내서는 안 됩니다.</li>
	<li class="license nc"><span class="bold">비영리</span> - 이 저작물은 영리 목적으로 이용할 수 없습니다.</li>
	<li class="license nd"><span class="bold">변경금지</span> - 이 저작물을 리믹스, 변형하거나 2차적 저작물을 작성하였을 경우 그 결과물을 공유할 수 없습니다.</li>
</ul></div>`);

	// Style change widget, and SNS widget.
	docuK.prepend(`<div class="change-docuK-style">
	<form><button type="button" onclick="kipid.resetStyle()" style="width:auto; padding:0 .5em">Reset docuK style</button></form>
	<form><input id="button${docuKI}-Dark" type="radio" name="mode" value="Dark" onclick="kipid.Cmode(this.value)"><label for="button${docuKI}-Dark" style="display:inline-block; background:black; color:white; border:2px solid rgb(150,150,150); padding:0.1em 0.2em">Dark</label>
	</input><input id="button${docuKI}-Bright" type="radio" name="mode" value="Bright" onclick="kipid.Cmode(this.value)"><label for="button${docuKI}-Bright" style="display:inline-block; background:white; color:black; border:2px solid rgb(150,150,150); padding:0.1em 0.2em">Bright</label></input></form>
	<form><input id="input${docuKI}-font-family" class="bold" type="text" name="font" value="맑은 고딕" style="font-family:'맑은 고딕'; font-size:1.2em; width:73px; height:23px; text-align:center" onchange="kipid.CfontFamily(this.value)"></input></form>
	<form><button type="button" onclick="kipid.CfontSize(-0.1)" style="font-size:1em">A</button><button type="button" onclick="kipid.CfontSize(0.1)" style="font-size:1.4em">A</button></form>
	<form><button type="button" onclick="kipid.ClineHeight(-1)" style="font-size:1em">=</button><button type="button" onclick="kipid.ClineHeight(1)" style="font-size:1.6em">=</button></form>
	<form><button type="button" onclick="kipid.$log.toggle()" style="width:auto; padding:0 .5em">DocuK Log</button></form>
	<form><button type="button button-Go" onclick="$window.trigger({type:'keydown', keyCode:71})" style="font:inherit; width:auto; padding:0 .5em">Fuzzy search</button></form>
	<div class="deviceInfo"></div>
	<div class="promoting-docuK">This document is rendered by <a href="http://kipid.tistory.com/entry/HTML-docuK-format-ver-20">docuK</a> (See also <a href="http://kipid.tistory.com/entry/Super-Easy-Edit-SEE-of-docuK">SEE (Super Easy Edit)</a>).</div>
	</div>
<div class="SNS-top"><img class="SNS-img" src="https://tistory2.daumcdn.net/tistory/1468360/skin/images/icon-Twitter.png" onclick="kipid.shareSNS('twitter')"><img class="SNS-img" src="https://tistory2.daumcdn.net/tistory/1468360/skin/images/icon-Facebook.png" onclick="kipid.shareSNS('facebook')"><img class="SNS-img" src="https://tistory3.daumcdn.net/tistory/1468360/skin/images/icon-Recoeve.png" onclick="kipid.shareSNS('recoeve')"><img class="SNS-img" src="https://tistory2.daumcdn.net/tistory/1468360/skin/images/icon-Kakao.png" onclick="kipid.shareSNS('kakao')"></div>`
	);
	docuK.append(`<div class="SNS-bottom"><img class="SNS-img" src="https://tistory2.daumcdn.net/tistory/1468360/skin/images/icon-Twitter.png" onclick="kipid.shareSNS('twitter')"><img class="SNS-img" src="https://tistory2.daumcdn.net/tistory/1468360/skin/images/icon-Facebook.png" onclick="kipid.shareSNS('facebook')"><img class="SNS-img" src="https://tistory3.daumcdn.net/tistory/1468360/skin/images/icon-Recoeve.png" onclick="kipid.shareSNS('recoeve')"><img class="SNS-img" src="https://tistory2.daumcdn.net/tistory/1468360/skin/images/icon-Kakao.png" onclick="kipid.shareSNS('kakao')"></div>`);

	// Scrollable switching of 'pre.prettyprint'.
	docuK.find("pre.prettyprint.scrollable").wrap("<div class='preC'></div>").before('<div class="preSSE">On the left side of codes is there a hiden button to toggle/switch scrollability ({max-height:some} or {max-height:none}).</div><div class="preSS" onclick="kipid.toggleHeight(this)"></div>');
	kipid.logPrint(`<br><br>&lt;codeprint&gt; tags are printed to corresponding &lt;pre&gt; tags, only when the tags exist in the document.`);

	// Numbering section, making table of contents, and numbering eqq (formatting to MathJax also) and figure tags
	let secs=docuK.find(">.sec"), subsecs, subsubsecs, secContentsId="";
	let secI, secIH2, subsecJH3, subsubsecKH4;
	let secN=0, secITxt="", subsecI=0, subsubsecI=0, tocHtml="", txt="", secId="", secPreTxt="";
	let eqqs, eqN="", eqC="", figs;
	function fTocHtml(numbering) {
		let secN=(numbering===undefined||numbering)?"secN":"none";
		return "<h"+hN+">"
		+"<a class='jump' id='toc"+docuKI+"-"+secId+"' href='#secId"+docuKI+"-"+secId+"'>"
			+"<span class=\""+secN+"\"><span class=\"number\">"+secPreTxt+"</span>.</span>"
			+txt
		+"</a></h"+hN+">";
	}
	function fSecHtml(numbering) {
		let secN="none", endA0="", endA1="</a>";
		if (numbering===undefined||numbering) {
			secN="secN"; endA0="</a>"; endA1="";
		}
		return "<a class='jump tJump' href='#toc"+docuKI+"-"+secId+"'>T</a>"
		+"<a class='jump' id='secId"+docuKI+"-"+secId+"' href='#secId"+docuKI+"-"+secId+"'>"
			+"<span class=\""+secN+"\"><span class=\"number\">"+secPreTxt+"</span>.</span>"
		+endA0+'<span class="head-txt">'+txt+'</span>'+endA1;
	}
	function fEqqHtml() {
		return '<div class="eqCC">'
			+'<div class="eqN"><span class="number">('+eqN+')</span></div>'
			+'<div class="eqC">'+eqC+'</div>'
		+'</div>';
	}
	for (let i=0;i<secs.length;i++) {
		secI=secs.eq(i);
		secIH2=secI.find("h2:first-child");
		if (secIH2.exists() && !secIH2.is(".notSec")) { // exclude ".sec>h1" and ".sec>h2.notSec" in ToC
			hN="2"; txt=secIH2.html();
			if (secIH2.is(".no-sec-N")||secI.is(".no-sec-N")) {
				secPreTxt=secId=secITxt=(secIH2.is("[id]"))?secIH2.attr('id').replace(/^sec-/i,'').replace(postIdRegEx,''):"secPreTxt"+docuKI+"-"+i;
				tocHtml+=fTocHtml(false);
				secIH2.html(fSecHtml(false));
			} else {
				secN++;
				secPreTxt=secId=secITxt=secN.toString();
				tocHtml+=fTocHtml();
				secIH2.html(fSecHtml());
			}

			if (!secI.is(".noToggleUI")) {
				secContentsId="sec"+docuKI+"-"+secITxt+"-contents";
				secI.append("<div class=\"cBoth\"></div><div class=\"Hide\" onclick=\"kipid.Hide(this)\">▲ Hide</div><div class=\"cBoth\"></div>");
				secI.contents().slice(1).wrapAll("<div class=\"sec-contents\" id=\""+secContentsId+"\"></div>");
				secIH2.after("<div class=\"ShowHide\" onclick=\"kipid.ShowHide(this)\">▼ Show/Hide</div>");
				secI.append("<div class=\"cBoth\"></div>");
			}

			subsecs=secI.find(".subsec"); subsecI=0;
			for (let j=0;j<subsecs.length;j++) {
				subsecJH3=subsecs.eq(j).find("h3:first-child");
				hN="3"; subsecI++; secId=secITxt+"-"+subsecI; secPreTxt=secITxt+"."+subsecI; txt=subsecJH3.html();
				tocHtml+=fTocHtml();
				subsecJH3.html(fSecHtml());

				subsubsecs=subsecs.eq(j).find(".subsubsec"); subsubsecI=0;
				for (let k=0;k<subsubsecs.length;k++) {
					subsubsecKH4=subsubsecs.eq(k).find("h4:first-child");
					hN="4"; subsubsecI++; secId=secITxt+"-"+subsecI+"-"+subsubsecI; secPreTxt=secITxt+"."+subsecI+"."+subsubsecI; txt=subsubsecKH4.html();
					tocHtml+=fTocHtml();
					subsubsecKH4.html(fSecHtml());
				}
			}
		} else {
			secITxt="x";
		}
		eqqs=secI.find("eqq");
		for (j=0;j<eqqs.length;j++) {
			eqN=secITxt+"-"+(j+1).toString();
			eqC=eqqs.eq(j).html().trim();
			eqqs.eq(j).html(fEqqHtml());
		}
		figs=secI.find("figure");
		for (j=0;j<figs.length;j++) {
			figN=secITxt+"-"+(j+1).toString();
			figs.eq(j).find(".caption").html(function (ith,orgTxt) {return "Fig. <span class=\"number\">("+figN+")</span>: "+orgTxt.trim();});
		}
	}
	secs.find(".toc").html(tocHtml);
	kipid.logPrint(`<br><br>Table of Contents is filled out.<br><br>Auto numberings of sections (div.sec>h2, div.subsec>h3, div.subsubsec>h4), &lt;eqq&gt; tags, and &lt;figure&gt; tags are done.`);

	// Make 'cite' tags bubble-refer references in ".docuK ol.refs>li".
	// Make 'refer' tags bubble-refer equations (eqq tag) or figures (figure tag). Any tag with id can be bubble-refered with refer tag.
	function pad(str, max) {
		str=str.toString();
		return str.length<max?pad("0"+str,max):str;
	}
	let refN="", preRefHtml="", refHtml="", citeN="";
	function fCiteHtml() {
		let str='<div class="inRef" onmouseover="kipid.ShowBR(this)" onmouseout="kipid.timerHideBR(this)">'
			+refN
			+'<div class="bubbleRef">'
				+'<div class="content">'+preRefHtml+refHtml+'</div>'
				+'<div class="arrow"></div>'
				+'<div class="exit" onclick="kipid.HideBR(this)"><svg>'
					+'<g style="stroke:white;stroke-width:23%">'
						+'<line x1="20%" y1="20%" x2="80%" y2="80%"/>'
						+'<line x1="80%" y1="20%" x2="20%" y2="80%"/>'
					+'</g>'
					+'✖'
				+'</svg></div>'
			+'</div></div>';
		if (kipid.browserWidth<321) {
			str=str.replace(/<iframe[^>]*>[^<]*<\/iframe>/ig, '<span class="emph">In bubble refs, iframe (or youtube video) is intentionally NOT supported for various reasons (security, and cross browsing). See it in the original position of the iframe (video).</span>'); // 말풍선에서 비디오 등의 iframe을 의도적으로 지원하지 않았습니다. 원래의 위치에서 보세요.
		}
		return str;
	}
	let olRefs=docuK.find("ol.refs");
	olRefs=olRefs.eq(olRefs.length-1);
	let refs=docuK.find("ol.refs>li");
	let refsN=refs.length;
	for (i=0;i<refsN;i++) { // ref [i+1] with id
		refs.eq(i).prepend('<span class="refN">Ref. <span class="number">['+pad(i+1,2)+']</span> </span>');
	}
	let cites=docuK.find("cite"), citeI, refered;
	for (i=0;i<cites.length;i++) {
		citeI=cites.eq(i);
		if (citeI.is("[class]")) {
			if (citeI.html()!=="") {
				refered=docuK.find("#"+citeI.attr("class")+postId);
				if (refered.exists()) {
					let refNHtml=refered.find(".refN").html();
					refered.html('<span class="refN">'+refNHtml+'</span>'+citeI.html());
				} else {
					refsN+=1;
					olRefs.append("<li id='"+citeI.attr("class")+postId+"'>"
							+'<span class="refN">Ref. <span class="number">['+pad(refsN,2)+']</span> </span>'
							+citeI.html()
						+"</li>");
				}
			}
			refered=docuK.find("#"+citeI.attr("class")+postId);
			if (refered.exists()) {
				citeN=(i+1).toString()+"-"+citeI.attr("class")+postId;
				refHtml=refered.html().trim().replace(/\bid\s*=/gi,'psudoId=');
				refN=refered.find(".number").html();
				citeI.html(fCiteHtml());
			} else {
				citeI.html('<span class="emph">( No refer. )</span>');
			}
		}
	}
	let refers=docuK.find("refer"), referI;
	refers.html('<span class="emph">( No refer. )</span>');
	for (i=0;i<refers.length;i++) {
		referI=refers.eq(i);
		if (referI.is("[class]")) {
			refered=docuK.find("#"+referI.attr("class")+postId);
			if (refered.exists()) {
				citeN=(i+1).toString()+"-"+referI.attr("class")+postId;
				refHtml=refered.html().trim().replace(/\bid\s*=/gi,'psudoId=');
				refN=refered.find(".number").html();
				referI.html(fCiteHtml());
			}
		}
	}
	kipid.logPrint(`<br><br>&lt;cite&gt; and &lt;refer&gt; tags are rendered to show bubble reference.`);

	docuK.addClass("rendered");
};
})(window.kipid=window.kipid||{}, jQuery);