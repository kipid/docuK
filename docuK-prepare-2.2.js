////////////////////////////////////////////////////
////////////////////////////////////////////////////
// Public functions which can be used elsewhere, and functions called only once in the beginning.
////////////////////////////////////////////////////
////////////////////////////////////////////////////
(function(kipid, $, undefined) {
$window=$(window);

$.fn.exists=function() { return this.length!==0; };
kipid.browserWidth=window.innerWidth;
var docuK=$(".docuK");
kipid.docuK=docuK;

////////////////////////////////////////////////////
// logPrint function.
////////////////////////////////////////////////////
kipid.log=$("#docuK-log").eq(0);
kipid.logPrint=function(str) {
	kipid.log.append(str);
	kipid.log.scrollTop(kipid.log[0].scrollHeight);
};
kipid.logPrint("kipid.logPrint is working!");

////////////////////////////////////////////////////
// String to Array (copied from recoeve.net user-page.html)
////////////////////////////////////////////////////
kipid.encloseStr=function(str) {
	if (!str||str.constructor!==String) { return ""; }
	if (str.charAt(0)==="\""||/[\n\t]/.test(str)) {
		return '"'+str.replace(/"/g,'""')+'"';
	} return str;
};
kipid.strToJSON=function(str, colMap, rowMap) {
	if (!str||str.constructor!==String) { return []; }
	if (colMap===undefined||colMap===null) { colMap=true; }
	// str=str.trim()+"\n";
	if (str.charAt(str.length-1)!=="\n") {
		str+="\n";
	}
	var ret=[];
	var delimiter=/([^\t\n]*)([\t\n])/g;
	var lastQuote=/[^"](?:"")*"([\t\n])/g;
	var exec;
	var start=0;
	var row=-1, col=-1, delim="\n";
	var strElem="";
	function increseRC(str) {
		if (str==='\t') {
			col++; return true;
		} else if (str==='\n') {
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
		var firstColSize=ret[0].length;
		for (var i=0;i<ret.length;i++) {
			var jMax=ret[i].length;
			if (jMax>firstColSize) { jMax=firstColSize; }
			for (var j=0;j<jMax;j++) {
				var key=ret[0][j];
				if (key!==undefined) {
					ret[i][key]=ret[i][j];
				}
			}
		}
	}
	if (rowMap) {
		for (var i=0;i<ret.length;i++) {
			var key=ret[i][0];
			if (key!==undefined) {
				ret[key]=ret[i];
			}
		}
	}
	return ret;
};
kipid.strToArray=function(str) {
	return kipid.strToJSON(str,false,false);
};
kipid.arrayToTableHTML=function(txtArray) {
	var tableStr="<table><tbody>";
	for (var row=0;row<txtArray.length;row++) {
		// console.log(txtArray[row]);
		tableStr+="<tr>";
		for (var col=0;col<txtArray[row].length;col++) {
			tableStr+="<td>"+kipid.escapeHTML(txtArray[row][col]).replace(/\n/g,'<br>')+"</td>";
		}
		tableStr+="</tr>";
	}
	tableStr+="</tbody></table>";
	return tableStr;
};

////////////////////////////////////////////////////
// SEE (Super Easy Edit).
////////////////////////////////////////////////////
kipid.SEEToArray=function(SEE) {
	SEE=SEE.trim();
	var dE=/\s*\n\n+\s*/g; // split by double enter.
	var start=end=0;
	var re, subStr;
	var ps=[];
	while((re=dE.exec(SEE))!==null) {
		end=dE.lastIndex;
		subStr=SEE.substring(start,end).trim();
		if (/^<pre\s*[^>]*>/i.test(subStr)) {
			while(!/<\/pre>$/i.test(subStr)) {
				re=dE.exec(SEE);
				end=dE.lastIndex;
				subStr=SEE.substring(start,end).trim();
			}
		} else if (/^```/.test(subStr)) {
			while(!/```\/$/.test(subStr)) {
				re=dE.exec(SEE);
				end=dE.lastIndex;
				subStr=SEE.substring(start,end).trim();
			}
		} else if (/^<script\s*[^>]*>/i.test(subStr)) {
			while(!/<\/script>$/i.test(subStr)) {
				re=dE.exec(SEE);
				end=dE.lastIndex;
				subStr=SEE.substring(start,end).trim();
			}
		} else if (/^<data\s*[^>]*>/i.test(subStr)) {
			while(!/<\/data>$/i.test(subStr)) {
				re=dE.exec(SEE);
				end=dE.lastIndex;
				subStr=SEE.substring(start,end).trim();
			}
		} else if (/^<!--/i.test(subStr)) {
			while(!/-->$/i.test(subStr)) {
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

kipid.renderToDocuK=function(toBeRendered) {
	var ps=kipid.SEEToArray(toBeRendered);
	var p=ps.length;
	
	var TOC="Table of Contents";
	var PH="Posting History";
	var RRA="References and Related Articles";
	
	var untilEnter=/[^\n]+/g; // until enter.
	var head, hN; // #*hN
	var emmet=classes=elemId="";
	
	var docuOn=secOn=subsecOn=subsubsecOn=false;
	var str='';
	
	function closeSec(hN) {
		if (hN===undefined) { hN=1; }
		switch(hN) {
			case 1: if (docuOn) { str+='</div>'; docuOn=false; }
			case 2: if (secOn) { str+='</div>'; secOn=false; }
			case 3: if (subsecOn) { str+='</div>'; subsecOn=false; }
			case 4: if (subsubsecOn) { str+='</div>'; subsubsecOn=false; }
			default:
		}
	}
	function getEmmetFromHead(trimedHead) {
		var res;
		var emmet="";
		var rexHeadEmmet=/^\[([\w\s#._-]+)\]/;
		res=rexHeadEmmet.exec(trimedHead);
		if (res!=null) { emmet=res[1]; }
		return emmet;
	}
	function getClassesFromEmmet(str) {
		var res;
		var classes="";
		var rexClasses=/\.([\w-]+)/g;
		while((res=rexClasses.exec(str))!=null) {
			classes+=res[1]+" ";
		}
		return classes.trim();
	}
	function getIdFromEmmet(str) {
		var res;
		var elemId="";
		var rexId=/#([\w-]+)/;
		res=rexId.exec(str);
		if (res!=null) { elemId=res[1]; }
		return elemId;
	}
	
	for (var i=0;i<p;i++) {
		ps[i]=ps[i].trim();
		
		if ((hN=/^#+(?![#\/])/.exec(ps[i]))!==null) {
			untilEnter.lastIndex=hN=hN[0].length;
			closeSec(hN);
			head=untilEnter.exec(ps[i]);
			head=head[0].trim();
			emmet=getEmmetFromHead(head);
			classes=elemId="";
			if (emmet.length>0) {
				head=head.substring(emmet.length+2).trim();
				classes=getClassesFromEmmet(emmet);
				elemId=getIdFromEmmet(emmet);
				if(classes.length>0) {
					classes=" "+classes;
				}
				if(elemId.length>0) {
					elemId=' id="'+elemId+'"';
				}
			}
			switch(hN) {
				case 1: str+='<div class="docuK fromSEE"><div class="sec'+classes+'"><h1'+elemId+'>'+head+'</h1>';
					docuOn=secOn=true; break;
				case 2:
					if (head==="TOC") {
						str+='<div class="sec">';
						head=TOC;
						str+='<h2 class="notSec">'+head+'</h2><div class="p toc"></div></div>'; // self closing.
					} else if (head==="PH") {
						str+='<div class="sec hiden">';
						head=PH;
						str+='<h2 class="no-sec-N" id="sec-PH">'+head+'</h2>';
						secOn=true;
					} else if (head==="RRA") {
						str+='<div class="sec">';
						head=RRA;
						str+='<h2 class="no-sec-N" id="sec-Refs">'+head+'</h2>';
						secOn=true;
					} else {
						str+='<div class="sec'+classes+'">';
						str+='<h2'+elemId+'>'+head+'</h2>';
						secOn=true;
					}
					break;
				case 3: str+='<div class="subsec'+classes+'"><h3'+elemId+'>'+head+'</h3>';
					subsecOn=true; break;
				case 4: str+='<div class="subsubsec'+classes+'"><h4'+elemId+'>'+head+'</h4>';
					subsubsecOn=true; break;
				default: str+='<h'+hN+elemId+'>'+head+'</h'+hN+'>';
			}
			ps[i]=ps[i].substring(untilEnter.lastIndex).trim();
		} else if ((hN=/^#+(?=\/)/.exec(ps[i]))!==null) {
			hN=hN[0].length;
			closeSec(hN);
			continue; // Text after '#/' is ignored. Use '#####/' for comment.
		}
		
		if (ps[i].length!==0) {
			if (/^<\/?\w/.test(ps[i])) {
				str+=ps[i];
			} else if (/^```/.test(ps[i])) {
				ps[i]=ps[i].replace(/^```/,'').replace(/```\/$/,'').trim();
				emmet=getEmmetFromHead(ps[i]);
				classes=elemId="";
				if (emmet.length>0) {
					ps[i]=ps[i].substring(emmet.length+2).trim();
					classes=getClassesFromEmmet(emmet);
					elemId=getIdFromEmmet(emmet);
					if(classes.length>0) {
						classes=" "+classes;
					}
					if(elemId.length>0) {
						elemId=' id="'+elemId+'"';
					}
				}
				str+='<pre class="prettyprint'+classes+'"'+elemId+'>'
					+ps[i].replace(/<\/pre>/ig,'/pre replaced>')
					+'</pre>'
			} else {
				str+='<div class="p';
				// if (/^-/.test(ps[i])) {
				// 	str+=' cmt';
				// }
				str+='">'+ps[i]+'</div>';
			}
		}
	}
	closeSec();
	
	return str;
};

kipid.getContentsJoinedWithEnter=function($elem) {
	var contents=$elem.contents();
	var contentsL=contents.length;
	var i, contentI;
	var lis, lisL, j;
	var strArray=[];
	for (i=0;i<contentsL;i++) {
		contentI=contents.eq(i);
		if (contentI.is("ol")) {
			lis=contentI.contents();
			lisL=lis.length;
			for (j=0;j<lisL;j++) {
				strArray.push(lis.eq(j).text().trim());
			}
		} else {
			strArray.push(contentI.text().trim());
		}
	}
	return strArray.join("\n");
};

////////////////////////////////////////////////////
// cookies.js (copied from cookie-test.html)
////////////////////////////////////////////////////
kipid.expire=365*24*60*60; // max-age in seconds.
kipid.docCookies={
	hasItem:function(sKey) {
		return (new RegExp("(?:^|;\\s*)"+encodeURIComponent(sKey).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=")).test(document.cookie);
	}
	, getItem:function(sKey) {
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*"+encodeURIComponent(sKey).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=\\s*([^;]*).*$)|^.*$"),"$1"))||null;
	}
	, removeItem:function(sKey, sPath, sDomain, bSecure) {
		if (!sKey||/^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
		document.cookie=encodeURIComponent(sKey)+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT"+(sDomain?"; domain="+sDomain:"")+(sPath?"; path="+sPath:"")+(bSecure?"; secure":"");
		return true;
	}
	, setItem:function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		if (!sKey||/^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
		var sExpires="";
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
	, keys:function() {
		var aKeys=document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g,"").split(/\s*(?:\=[^;]*)?;\s*/);
		for (var nIdx=0;nIdx<aKeys.length;nIdx++) { aKeys[nIdx]=decodeURIComponent(aKeys[nIdx]); }
		return aKeys;
	}
};

////////////////////////////////////////////////////
// Functions for printing codes into 'pre.prettyprint'.
////////////////////////////////////////////////////
kipid.indentsRemove=function(str) {
	var firstIndent=str.match(/^\n\t+/), indentRegExp;
	if (firstIndent!==null) { // if match (first indent) is found
		indentRegExp=new RegExp("\\n\\t{1,"+(firstIndent[0].length-1)+"}",'g'); // /\n\t{1,n}/g: global greedy matching
	} else {
		indentRegExp=/^\n/; // just for minimum match
	}
	return str.replace(indentRegExp,'\n');
};
kipid.escapeHTML=function(str, query) {
	return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
};
kipid.printCode=function(codeId) {
	var $pre=$("#pre-"+codeId);
	var $code=$("#"+codeId);
	if ($pre.exists()) {
		var html=// ('<codeprint id="'+codeId+'">'+
			kipid.indentsRemove($code.html())
			// +'</codeprint><!-- '+codeId+' -->')
			.trim();
		if (!$code.is(".noEscapeHTML")) {
			html=kipid.escapeHTML(html);
		}
		$pre.html(html);
	}
};

////////////////////////////////////////////////////
// Function for toggling height, i.e. switching scrollability with conserving view.
////////////////////////////////////////////////////
kipid.toggleHeight=function(obj) {
	var next=$(obj).next();
	var toBeScrolledBy=0;
	var windowScrollTop=$window.scrollTop();
		// (window.pageYOffset!==undefined)?window.pageYOffset:(document.documentElement || document.body.parentNode || document.body).scrollTop
	var nOffsetTop=next.offset().top;
	var nHeight=next.height();
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
			var tailHeight=nHeight-toBeScrolledBy;
			next.addClass("scrollable");
			nHeight=next.height();
			window.scrollTo(0,(nHeight>tailHeight)?nOffsetTop+nHeight-tailHeight:nOffsetTop);
			next[0].scrollTop=toBeScrolledBy;
		}
	}
	// kipid.resultTest.append("after : \twindowScrollTop: "+$window.scrollTop()+";\tnOffsetTop: "+next.offset().top+";\tnHeight: "+next.height()+"\n\n");
	// kipid.resultTest[0].scrollTop=kipid.resultTest[0].scrollHeight;
};

////////////////////////////////////////////////////
// section's show/hide functions
////////////////////////////////////////////////////
kipid.ShowHide=function(elem) {
	$(elem).next().toggle();
	if ($(elem).next().is(":visible")) {
		$(elem).html("▼ Hide");
	} else {
		$(elem).html("▼ Show");
	}
	setTimeout(function() {$window.trigger("scroll.delayedLoad");}, 1000);
};
kipid.Hide=function(elem) {
	var $elem=$(elem).parent();
	window.scrollBy(0,-$elem.outerHeight());
	$elem.hide();
	$elem.parent().find(".ShowHide").html("▼ Show");
};

////////////////////////////////////////////////////
// bubbleRef's show/hide functions
////////////////////////////////////////////////////
kipid.ShowBR=function(elem) {
	clearTimeout(kipid.timerHideBRQueue);
	kipid.bubbleRefs.hide();
	$(elem).find(">.bubbleRef").show();
};
kipid.timerHideBR=function(elem) {
	kipid.timerHideBRQueue=setTimeout(function() {$(elem).find(">.bubbleRef").hide();}, 1000);
};
kipid.HideBR=function(elem) {
	$(elem).parent().hide();
};

////////////////////////////////////////////////////
// Changing Styles of docuK
////////////////////////////////////////////////////
// kipid.TFontSize=docuK.find(".TFontSize");
// kipid.TLineHeight=docuK.find(".TLineHeight");

kipid.deviceInfo=null; // docuK.find(".deviceInfo");
kipid.fontSize=0; // parseInt(docuK.css('font-size'));
kipid.lineHeight10=0; // parseInt(parseFloat(docuK.css('line-height'))/kipid.fontSize*10);
kipid.fontFamily=""; // docuK.css('font-family').trim().split(/\s*,\s*/)[0];
kipid.mode=""; // (docuK.is(".bright"))?"Bright":"Dark";

kipid.printDeviceInfo=function(){
	if (kipid.deviceInfo) {
		kipid.deviceInfo.html(
			"Mode:"+kipid.mode
			+"; Font:"+kipid.fontFamily
			+"; font-size:"+(kipid.fontSize*1.8).toFixed(1)+"px("+kipid.fontSize.toFixed(1)+")"
			+"; line-height:"+(kipid.lineHeight10/10).toFixed(1)
			+";<br>width: "+kipid.browserWidth
			+", height: "+window.innerHeight
		);
	}
};

kipid.Cmode=function(modeI) {
	if (modeI=="Dark") {
		kipid.docuK.removeClass("bright");
	} else if (modeI=="Bright") {
		kipid.docuK.addClass("bright");
	} else {
		return false;
	}
	kipid.mode=modeI;
	// kipid.browserWidth=0;
	// $window.trigger("resize.deviceInfo");
	kipid.printDeviceInfo();
	kipid.docCookies.setItem("kipid.mode", kipid.mode, kipid.expire, "/");
	return true;
};
kipid.CfontFamily=function(font) {
	kipid.docuK.css({fontFamily:font});
	kipid.fontFamily=font;
	kipid.printDeviceInfo();
	kipid.docCookies.setItem("kipid.fontFamily", kipid.fontFamily, kipid.expire, "/");
	return true;
};
kipid.CfontSize=function(increment) {
	if (increment.constructor===Number&&!isNaN(increment)) {
		kipid.fontSize+=increment;
		if (kipid.fontSize<7) {
			kipid.fontSize=7;
		} else if (kipid.fontSize>20) {
			kipid.fontSize=20;
		}
		kipid.docuK.css({"font-size":kipid.fontSize.toFixed(1)+"px"});
		// kipid.TFontSize.html((kipid.fontSize*1.8).toFixed(1)+"px");
		kipid.printDeviceInfo();
		kipid.docCookies.setItem("kipid.fontSize", kipid.fontSize.toFixed(1), kipid.expire, "/");
		return true;
	}
	return false;
};
kipid.ClineHeight=function(increment) {
	if (increment.constructor===Number&&!isNaN(increment)) {
		kipid.lineHeight10+=increment;
		if (kipid.lineHeight10<10) {
			kipid.lineHeight10=10;
			return false;
		} else if (kipid.lineHeight10>25) {
			kipid.lineHeight10=25;
			return false;
		}
		kipid.docuK.css({"line-height":(kipid.lineHeight10/10).toString()});
		// kipid.TLineHeight.html((kipid.lineHeight10/10).toFixed(1));
		kipid.printDeviceInfo();
		kipid.docCookies.setItem("kipid.lineHeight10", kipid.lineHeight10, kipid.expire, "/");
		return true;
	}
	return false;
};
$window.on("resize.deviceInfo", function() {
	if (window.innerWidth!==kipid.browserWidth) {
		kipid.browserWidth=window.innerWidth;
		kipid.fontSize=parseInt(kipid.docuK.css("font-size"));
		// kipid.TFontSize.html((kipid.fontSize*1.8).toFixed(1)+"px");
		kipid.printDeviceInfo();
	}
});

////////////////////////////////////////////////////
// Share a link through SNS
////////////////////////////////////////////////////
kipid.shareSNS=function(service) {
	var title=encodeURIComponent( $("title").text() );
	var url=encodeURIComponent(window.location.href);
	var open="";
	switch (service) {
		case 'twitter':
			open="https://twitter.com/intent/tweet"+"?via=kipacti"+"&text="+title+"&url="+url;
			break;
		case 'facebook':
			open="https://www.facebook.com/sharer/sharer.php"+"?u="+url;
			break;
	}
	window.open(open);
};

////////////////////////////////////////////////////
// Delayed Loading. (Copied from user-page.html)
////////////////////////////////////////////////////
kipid.delayPad=kipid.delayPad||1024;
kipid.wait=kipid.wait||512;
kipid.delayedElems=[];
kipid.previous=Date.now();
$.fn.inView=function() {
	if (this.is(":visible")) {
		var viewportHeight=window.innerHeight;
		var scrollTop=$window.scrollTop();
		var elemTop=this.offset().top-kipid.delayPad;
		var elemBottom=elemTop+this.height()+kipid.delayPad;
		return (scrollTop+viewportHeight>elemTop)&&(scrollTop<elemBottom);
	} else {
		return false;
	}
};
$.fn.delayedLoad=function() {
	var done=false;
	if (this.inView()) {
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
			kipid.logPrint("<br><br>MathJax.Hub.Process("+this.next()[0]+") is called.");
			done=true;
		}
	}
	return done;
};
kipid.delayedLoadAll=function() {
	// kipid.logPrint("<br>Doing delayed-load. "+kipid.delayedElems.length);
	if (kipid.delayedElems.length===0) {
		kipid.logPrint("<br><br>All delayedElem are loaded.");
		clearTimeout(kipid.delayedLoadSetTimeout);
		$window.off("scroll.delayedLoad");
	} else {
		kipid.delayedElems.each(function() {
			if ($(this).delayedLoad()) {
				kipid.delayedElems=kipid.delayedElems.not(this);
				kipid.logPrint("<br><span class=\"emph\">"+this+" at vertical position of "+(100*$(this).offset().top/$(document).height()).toPrecision(3)+"% of document is delayed-loaded.</span><br>"+kipid.delayedElems.length+" of delayedElems are remained.<br>");
			}
		});
	}
};
kipid.delayedLoadByScroll=function delayedLoadByScroll() {
	var now=Date.now();
	var passed=now-kipid.previous;
	if (passed>kipid.wait) {
		kipid.delayedLoadAll();
		kipid.previous=now;
	} else {
		$window.off("scroll.delayedLoad");
		kipid.delayedLoadSetTimeout=setTimeout(function() {
			kipid.delayedLoadAll();
			kipid.previous=Date.now();
			$window.on("scroll.delayedLoad", delayedLoadByScroll);
		}, kipid.wait*1.1-passed);
		// kipid.logPrint("<br>wait "+(kipid.wait*1.1-passed).toFixed(0)+"ms.");
	}
};
$window.on("scroll.delayedLoad", kipid.delayedLoadByScroll);

////////////////////////////////////////////////////
////////////////////////////////////////////////////
// docuK Process
////////////////////////////////////////////////////
////////////////////////////////////////////////////
kipid.docuKProcess=function docuK(kipid, $, docuKI, undefined) {
	////////////////////////////////////////////////////
	// Possible duplicate id is handled.
	////////////////////////////////////////////////////
	docuKI=(isNaN(docuKI)||docuKI<0)?0:parseInt(docuKI);
	kipid.logPrint("<br><br>docuK-"+docuKI+" scripts started!<br><span class='emph'>If this log is not closed automatically, there must be an error somewhere in your document or scripts.</span>");
	var docuK=kipid.docuK.eq(docuKI);
	if (docuK.is(".rendered")) {
		kipid.logPrint("<br><br>docuK-"+docuKI+" is already rendered.");
		return;
	}
	
	var postId="-in-docuK"+docuKI;
	var postIdRegEx=new RegExp(postId+"$");
	if (docuK.is(".noDIdHandle")) {
		postId="";
	} else {
		docuK.find("[id]").each(function() {
			var $this=$(this);
			$this[0].id+=postId;
		});
	}
	
	////////////////////////////////////////////////////
	// Style change widget, and SNS widget.
	////////////////////////////////////////////////////
	docuK.prepend(
		'<div class="change-docuK-style">'
		+'<form><input id="button'+docuKI+'-Dark" type="radio" name="mode" value="Dark" onclick="kipid.Cmode(this.value)"><label for="button'+docuKI+'-Dark" style="display:inline-block; background:black; color:white; border:2px solid rgb(150,150,150); padding:0.1em 0.2em">Dark</label>'
		+'</input><input id="button'+docuKI+'-Bright" type="radio" name="mode" value="Bright" onclick="kipid.Cmode(this.value)"><label for="button'+docuKI+'-Bright" style="display:inline-block; background:white; color:black; border:2px solid rgb(150,150,150); padding:0.1em 0.2em">Bright</label></input></form> '
		+'<form><input class="bold" type="text" name="font" value="맑은 고딕" style="font-family:\'맑은 고딕\'; font-size:1.2em; width:73px; height:23px; text-align:center" onchange="kipid.CfontFamily(this.value)"></input></form> '
		+((docuKI===1)?'<form><button type="button" onclick="kipid.CfontSize(-0.1)" style="font-size:1em">A</button>'+'<button type="button" onclick="kipid.CfontSize(0.1)" style="font-size:1.4em">A</button></form> '
		+'<form><button type="button" onclick="kipid.ClineHeight(-1)" style="font-size:1.3em">=</button>'+'<button type="button" onclick="kipid.ClineHeight(1)" style="font-size:1.3em">〓</button></form> ':'')
		+'<form><button type="button" onclick="MathJax.Hub.Queue([\'Typeset\', MathJax.Hub])" style="width:auto; padding:0 .5em">All Maths</button></form> '
		+'<form><button type="button" onclick="kipid.log.toggle()" style="width:auto; padding:0 .5em">DocuK Log</button></form> '
		+'<div class="deviceInfo"></div>'
		+'<div class="promoting-docuK">This document is rendered by <a href="http://kipid.tistory.com/entry/HTML-docuK-format-ver-20">docuK</a> (See also <a href="http://kipid.tistory.com/entry/Super-Easy-Edit-SEE-of-docuK">SEE (Super Easy Edit)</a>).</div>'
	+'</div>'
		+'<div class="SNS-top"><img class="SNS-img" src="http://cfs.tistory.com/custom/blog/146/1468360/skin/images/icon-Twitter.png" onclick="kipid.shareSNS(\'twitter\')"><img class="SNS-img" src="http://cfs.tistory.com/custom/blog/146/1468360/skin/images/icon-Facebook.png" onclick="kipid.shareSNS(\'facebook\')"></div>'
	);
	docuK.append('<div class="SNS-bottom"><img class="SNS-img" src="http://cfs.tistory.com/custom/blog/146/1468360/skin/images/icon-Twitter.png" onclick="kipid.shareSNS(\'twitter\')"><img class="SNS-img" src="http://cfs.tistory.com/custom/blog/146/1468360/skin/images/icon-Facebook.png" onclick="kipid.shareSNS(\'facebook\')"></div>');
	
	////////////////////////////////////////////////////
	// Scrollable switching of 'pre.prettyprint'.
	////////////////////////////////////////////////////
	docuK.find("pre.prettyprint.scrollable").wrap("<div class='preC'></div>").before('<div class="preSSE">On the left side of codes is there a hiden button to toggle/switch scrollability ({max-height:some} or {max-height:none}).</div><div class="preSS" onclick="kipid.toggleHeight(this)"></div>');
	kipid.logPrint("<br><br>&lt;codeprint&gt; tags are printed to corresponding &lt;pre&gt; tags, only when the tags exist in the document.");
	
	////////////////////////////////////////////////////
	// Numbering section, making table of contents, and numbering eqq (formatting to MathJax also) and figure tags
	////////////////////////////////////////////////////
	var secs=docuK.find(">.sec"), subsecs, subsubsecs, secContentsId="";
	var secI, secIH2, subsecJH3, subsubsecKH4;
	var secN=0, secITxt="", subsecI=0, subsubsecI=0, tocHtml="", txt="", secId="", secPreTxt="";
	var eqqs, eqN="", eqC="", figs;
	function fTocHtml(numbering) {
		var secN=(numbering===undefined||numbering)?"secN":"none";
		return "<h"+hN+">"
		+"<a class='jump' id='toc"+docuKI+"-"+secId+"' href='#secId"+docuKI+"-"+secId+"'>"
			+"<span class=\""+secN+"\"><span class=\"number\">"+secPreTxt+"</span>.</span>"
			+txt
		+"</a></h"+hN+">";
	}
	function fSecHtml(numbering) {
		var secN="none", endA0="", endA1="</a>";
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
	for (var i=0;i<secs.length;i++) {
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
			for (var j=0;j<subsecs.length;j++) {
				subsecJH3=subsecs.eq(j).find("h3:first-child");
				hN="3"; subsecI++; secId=secITxt+"-"+subsecI; secPreTxt=secITxt+"."+subsecI; txt=subsecJH3.html();
				tocHtml+=fTocHtml();
				subsecJH3.html(fSecHtml());
				
				subsubsecs=subsecs.eq(j).find(".subsubsec"); subsubsecI=0;
				for (var k=0;k<subsubsecs.length;k++) {
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
			figs.eq(j).find(".caption").html(function(ith,orgTxt) {return "Fig. <span class=\"number\">("+figN+")</span>: "+orgTxt.trim();});
		}
	}
	secs.find(".toc").html(tocHtml);
	kipid.logPrint("<br><br>Table of Contents is filled out.<br><br>Auto numberings of sections (div.sec>h2, div.subsec>h3, div.subsubsec>h4), &lt;eqq&gt; tags, and &lt;figure&gt; tags are done.");

	////////////////////////////////////////////////////
	// Make 'cite' tags bubble-refer references in ".docuK ol.refs>li".
	// Make 'refer' tags bubble-refer equations (eqq tag) or figures (figure tag). Any tag with id can be bubble-refered with refer tag.
	////////////////////////////////////////////////////
	function pad(str, max) {
		str=str.toString();
		return str.length<max?pad("0"+str,max):str;
	}
	var refN="", preRefHtml="", refHtml="", citeN="";
	function fCiteHtml() {
		var str='<div class="inRef" onmouseover="kipid.ShowBR(this)" onmouseout="kipid.timerHideBR(this)">'
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
	var olRefs=docuK.find("ol.refs");
	olRefs=olRefs.eq(olRefs.length-1);
	var refs=docuK.find("ol.refs>li");
	var refsN=refs.length;
	for (i=0;i<refsN;i++) { // ref [i+1] with id
		refs.eq(i).prepend('<span class="refN">Ref. <span class="number">['+pad(i+1,2)+']</span> </span>');
	}
	var cites=docuK.find("cite"), citeI, refered;
	for (i=0;i<cites.length;i++) {
		citeI=cites.eq(i);
		if (citeI.is("[class]")) {
			if (citeI.html()!=="") {
				refered=docuK.find("#"+citeI.attr("class")+postId);
				if (refered.exists()) {
					var refNHtml=refered.find(".refN").html();
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
	var refers=docuK.find("refer"), referI;
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
	kipid.logPrint("<br><br>&lt;cite&gt; and &lt;refer&gt; tags are rendered to show bubble reference.");
	
	docuK.addClass("rendered");
};
})(window.kipid=window.kipid||{}, jQuery);