// 2014-06-12
(function(kipid, $){
	$.fn.exists=function(){
		return this.length!==0;
	};
	var docuK=$(".docuK").eq(0);
	var i, j, k;
	kipid.docuK=docuK;
	kipid.log=docuK.find("#docuK-log").eq(0);
	kipid.browserWidth=window.innerWidth;
	// or kipid.browserWidth=(window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth);
	kipid.logPrint=function(str){
		kipid.log.append(str);
		kipid.log.scrollTop(kipid.log.prop('scrollHeight'));
	}
	kipid.logPrint("logs:<br>docuK scripts started!<br><span class='emph'>If this log is not closed automatically, there must be an error somewhere in your document or scripts.</span>");
	
	////////////////////////////////////////////////////
	// Showing disableQ0 only in width>321.
	////////////////////////////////////////////////////
	if (kipid.browserWidth>321){
		docuK.find(".disableQ0").html(function(ith,orgText){return orgText.replace(/<!--/g,'').replace(/-->/g,'')});
	}
	
	////////////////////////////////////////////////////
	// Getting <codeprint>'s, print those to corresponding 'pre.prettyprint'.
	////////////////////////////////////////////////////
	kipid.indentsRemove=function(str){
		var firstIndent=str.match(/^\n\t+/), indentRegExp;
		if (firstIndent!==null){ // if match (first indent) is found
			indentRegExp=new RegExp("\\n\\t{1,"+(firstIndent[0].length-1)+"}",'g'); // /\n\t{1,n}/g: global greedy matching
		} else{
			indentRegExp=/^\n/; // just for minimum match
		}
		return str.replace(indentRegExp,'\n');
	};
	kipid.printCode=function(codeId){
		var elem=document.getElementById("pre-"+codeId);
		if (elem!==null){
			elem.innerHTML=// ('<codeprint id="'+codeId+'">'+
				kipid.indentsRemove(document.getElementById(codeId).innerHTML)
				// +'</codeprint><!-- '+codeId+' -->')
				.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').trim();
		}
	}
	var codeprints=$("codeprint");
	for (i=0;i<codeprints.length;i++){
		kipid.printCode(codeprints.eq(i).attr('id'));
	}
	docuK.find("pre").wrap("<div class='preC'></div>").before('<div class="preSSE">On the left side of codes is there a hiden button to toggle/switch scrollability ({max-height:some} or {max-height:none}).</div><div class="preSS" onclick="kipid.toggleHeight(this)"></div>');
	kipid.logPrint("<br><br>&lt;codeprint&gt; tags are printed to corresponding &lt;pre&gt; tags, only when the tags exist in the document.");
	
	////////////////////////////////////////////////////
	// kipid.resultTest=$("#result-test");
	////////////////////////////////////////////////////
	kipid.toggleHeight=function(obj){
		var next=$(obj).next();
		var toBeScrolledBy=0;
		var windowScrollTop=$(window).scrollTop();
			// (window.pageYOffset!==undefined)?window.pageYOffset:(document.documentElement || document.body.parentNode || document.body).scrollTop
		var nOffsetTop=next.offset().top;
		var nHeight=next.height();
		// kipid.resultTest.append("before:\twindowScrollTop: "+windowScrollTop+";\tnOffsetTop: "+nOffsetTop+";\tnHeight: "+nHeight+"\n");
		
		if (next.is(".scrollable")){ // becomes expanded.
			toBeScrolledBy=next.scrollTop();
			next.removeClass("scrollable");
			window.scrollTo(0,windowScrollTop+toBeScrolledBy);
		} else{ // becomes scrollable.
			if (windowScrollTop<nOffsetTop){
				// case0: no scroll
				next.addClass("scrollable");
			} else{
				// case1: scroll both
				toBeScrolledBy=windowScrollTop-nOffsetTop;
				var tailHeight=nHeight-toBeScrolledBy;
				next.addClass("scrollable");
				nHeight=next.height();
				window.scrollTo(0,(nHeight>tailHeight)?nOffsetTop+nHeight-tailHeight:nOffsetTop);
				next[0].scrollTop=toBeScrolledBy;
			}
		}
		// kipid.resultTest.append("after : \twindowScrollTop: "+$(window).scrollTop()+";\tnOffsetTop: "+next.offset().top+";\tnHeight: "+next.height()+"\n\n");
		// kipid.resultTest[0].scrollTop=kipid.resultTest[0].scrollHeight;
	};
	
	////////////////////////////////////////////////////
	// Numbering section, making table of contents, and numbering eqq (formatting to MathJax also) and figure tags
	////////////////////////////////////////////////////
	var sec=docuK.find(">.sec"), subsec, subsubsec, secContents="";
	var secIH2, subsecIH3, subsubsecIH4;
	var secI=0, secITxt="", subsecI=0, subsubsecI=0, tocHtml="", txt="", secId="", secPreTxt="";
	var eqqs, eqN="", eqC="", figs;
	function fTocHtml(){
		return "<h"+hN+"><a class='jump' id='toc-"+secId+"' href='#secId-"+secId+"'><span class=\"secN\"><span class=\"number\">"+secPreTxt+"</span>.</span>"+txt+"</a></h"+hN+">";
	}
	function fTocHtmlN(){
		return "<h"+hN+"><a class='jump' id='toc-"+secId+"' href='#secId-"+secId+"'><span class=\"none\"><span class=\"number\">"+secPreTxt+"</span>.</span>"+txt+"</a></h"+hN+">";
	}
	function fSecHtml(){
		return "<a class='jump tJump' href='#toc-"+secId+"'>T</a><a class='jump' id='secId-"+secId+"' href='#secId-"+secId+"'><span class=\"secN\"><span class=\"number\">"+secPreTxt+"</span>.</a></span>"+txt;
	}
	function fSecHtmlN(){
		return "<a class='jump tJump' href='#toc-"+secId+"'>T</a><a class='jump' id='secId-"+secId+"' href='#secId-"+secId+"'><span class=\"none\"><span class=\"number\">"+secPreTxt+"</span>.</span>"+txt+"</a>";
	}
	function fEqqHtml(){
		return '<div class="eqCC"><div class="eqN"><span class="number">('+eqN+')</span></div><div class="eqC">\\[ '+eqC+' \\]</div></div>';
	}
	for (i=0;i<sec.length;i++) {
		secIH2=sec.eq(i).find("h2:first-child");
		if (secIH2.exists() && !secIH2.is(".notSec")) { // exclude .sec>h1 and .sec>h2.notSec in ToC
			hN="2"; txt=secIH2.html();
			if (secIH2.is(".no-sec-N")) {
				secPreTxt=secId=secITxt=secIH2.attr('id').replace(/^sec-/i,'');
				tocHtml+=fTocHtmlN();
				secIH2.html(fSecHtmlN());
			} else {
				secI++;
				secPreTxt=secId=secITxt=secI.toString();
				tocHtml+=fTocHtml();
				secIH2.html(fSecHtml());
			}
			
			if (!sec.eq(i).is(".noToggleUI")) {
				secContents="sec-"+secITxt+"-contents";
				sec.eq(i).append("<div class=\"Hide\" onclick=\"kipid.Hide('"+secContents+"')\">▲ Hide</div><div class=\"cBoth\"></div>");
				sec.eq(i).find(">*:not(:first-child)").wrapAll("<div class=\"sec-contents\" id=\""+secContents+"\"></div>");
				sec.eq(i).append("<div class=\"cBoth\"></div>");
				secIH2.after("<div class=\"ShowHide\" onclick=\"kipid.ShowHide('"+secContents+"')\">▼ Show/Hide</div>");
			}
			
			subsec=sec.eq(i).find(".subsec"); subsecI=0;
			for (j=0;j<subsec.length;j++) {
				subsecIH3=subsec.eq(j).find("h3:first-child");
				hN="3"; subsecI++; secId=secITxt+"-"+subsecI; secPreTxt=secITxt+"."+subsecI; txt=subsecIH3.html();
				tocHtml+=fTocHtml();
				subsecIH3.html(fSecHtml());
				
				subsubsec=subsec.eq(j).find(".subsubsec"); subsubsecI=0;
				for (k=0;k<subsubsec.length;k++) {
					subsubsecIH4=subsubsec.eq(k).find("h4:first-child");
					hN="4"; subsubsecI++; secId=secITxt+"-"+subsecI+"-"+subsubsecI; secPreTxt=secITxt+"."+subsecI+"."+subsubsecI; txt=subsubsecIH4.html();
					tocHtml+=fTocHtml();
					subsubsecIH4.html(fSecHtml());
				}
			}
		} else {
			secITxt="x";
		}
		eqqs=sec.eq(i).find("eqq");
		for(j=0;j<eqqs.length;j++){
			eqN=secITxt+"-"+(j+1).toString();
			eqC=eqqs.eq(j).html().trim();
			eqqs.eq(j).html(fEqqHtml());
		}
		figs=sec.eq(i).find("figure");
		for(j=0;j<figs.length;j++){
			figN=secITxt+"-"+(j+1).toString();
			figs.eq(j).find(".caption").html(function(ith,orgTxt){return "Fig. <span class=\"number\">("+figN+")</span>: "+orgTxt.trim();});
		}
	}
	sec.find(".toc").html(tocHtml);
	kipid.logPrint("<br><br>Table of Contents is created.<br><br>Auto numberings of sections (div.sec>h2, div.subsec>h3, div.subsubsec>h4), &lt;eqq&gt; tags, and &lt;figure&gt; tags are done.");
	
	////////////////////////////////////////////////////
	// eq tags to MathJax format
	////////////////////////////////////////////////////
	var eqs=docuK.find("eq");
	for (i=0;i<eqs.length;i++){
		eqs.eq(i).html(function(ith,orgTxt){return "\\( "+orgTxt.trim()+" \\)";});
	}
	kipid.logPrint("<br><br>&lt;eq&gt; tags are rendered to MathJax format enclosed by \\ ( and \\ ).");

	////////////////////////////////////////////////////
	// section's show/hide functions
	////////////////////////////////////////////////////
	kipid.ShowHide=function(divId){
		kipid.docuK.find("#"+divId).toggle();
		setTimeout(function(){$(window).trigger("scroll.delayedLoad");}, 1000);
	};
	kipid.Hide=function(divId){
		var div=kipid.docuK.find("#"+divId);
		window.scrollBy(0,-div.outerHeight());
		div.hide();
	};

	////////////////////////////////////////////////////
	// bubbleRef's show/hide functions
	////////////////////////////////////////////////////
	kipid.ShowBR=function(divId){
		clearTimeout(kipid.timerHide);
		kipid.bubbleRefs.hide();
		kipid.docuK.find("#"+divId).show();
	};
	kipid.timerHideBR=function(divId){
		kipid.timerHide=setTimeout(function(){kipid.docuK.find("#"+divId).hide();}, 1000);
	};
	kipid.HideBR=function(divId){
		kipid.docuK.find("#"+divId).hide();
	};
	function pad(str, max){
		str=str.toString();
		return str.length<max?pad("0"+str,max):str;
	}

	////////////////////////////////////////////////////
	// Make 'cite' tags bubble-refer references in ".docuK ol.refs>li".
	////////////////////////////////////////////////////
	var refs=docuK.find("ol.refs>li"), refI, refId, refN="", preRefHtml="", refHtml="";
	var cites=docuK.find("cite"), j, citeN="", citesRefId;
	cites.html('<span class="emph">[ No ref ]</span>');
	function fCiteHtml(){
		var str='<div class="inRef" onmouseover="kipid.ShowBR(\'bRef-'+citeN+'\')" onmouseout="kipid.timerHideBR(\'bRef-'+citeN+'\')">'+refN+'<div id="bRef-'+citeN+'" class="bubbleRef"><div class="content">'+preRefHtml+refHtml+'</div><div class="arrow"></div><div class="exit" onclick="kipid.HideBR(\'bRef-'+citeN+'\')"><svg><g style="stroke:white;stroke-width:23%"><line x1="20%" y1="20%" x2="80%" y2="80%"/><line x1="80%" y1="20%" x2="20%" y2="80%"/></g>✖</svg></div></div></div>';
		if (kipid.browserWidth<321){
			str=str.replace(/<iframe[^>]*>[^<]*<\/iframe>/ig, '<span class="emph">In bubble refs, iframe (or youtube video) is intentionally NOT supported for various reasons (security, and cross browsing). See it in the original position of the iframe (video).</span>');
		}
		return str;
	} // 말풍선에서 비디오 등의 iframe을 의도적으로 지원하지 않았습니다. 원래의 위치에서 보세요.
	for(i=0;i<refs.length;i++){ // ref [i+1] with id
		refI=refs.eq(i);
		if (refI.is("[id]")) {
			refN="["+pad(i+1,2)+"]";
			refHtml=refI.html().trim().replace(/\bid\s*=/gi,'psudoId=');
			refId=refI.attr("id");
			citesRefId=cites.filter("."+refId);
			for(j=0;j<citesRefId.length;j++){ // (j+1)th cite of [i+1] reference.
				citeN=refId+"-"+(j+1).toString();
				preRefHtml="Ref. "+refN+" ";
				citesRefId.eq(j).html(fCiteHtml());
			}
		}
	}

	////////////////////////////////////////////////////
	// Make 'refer' tags bubble-refer equations (eqq tag) or figures (figure tag). Any tag with id can be bubble-refered with refer tag.
	////////////////////////////////////////////////////
	var refers=docuK.find("refer"), referI, refered;
	refers.html('<span class="emph">( No eq or fig. )</span>');
	preRefHtml="";
	for(i=0;i<refers.length;i++){
		referI=refers.eq(i);
		if (referI.is("[class]")) {
			refered=docuK.find("#"+referI.attr("class"));
			if (refered.exists()) {
				citeN=(i+1).toString()+"-"+referI.attr("class");
				refHtml=refered.html().trim().replace(/\bid\s*=/gi,'psudoId=');
				refN=refered.find(".number").html();
				referI.html(fCiteHtml());
			}
		}
	}

	kipid.bubbleRefs=docuK.find(".bubbleRef"); // for function kipid.ShowBR
	docuK.find(".inRef").on("mouseenter.delayedLoad", function(){
		kipid.logPrint("<br>Do delayed-load in bubble ref.");
		$(window).trigger("scroll.delayedLoad");
		$(this).off("mouseenter.delayedLoad");
	});
	docuK.find(".inRef").each(function(){
		var $elem=$(this);
		var width=parseFloat($elem.width());
		var $arrow=$elem.find(".arrow");
		var borderWidth=parseFloat($arrow.css("borderWidth"));
		var fontSize=parseFloat($arrow.css("fontSize"));
		$arrow.css({marginLeft:((width/2-borderWidth)/fontSize).toFixed(2)+"em"});
	});
	sec.filter(".hiden").find(">.sec-contents").css({display:"none"});
	kipid.logPrint("<br><br>&lt;cite&gt; and &lt;refer&gt; tags are rendered to show bubble reference.");

	////////////////////////////////////////////////////
	// Changing Styles of docuK
	////////////////////////////////////////////////////
	kipid.docuK.TFontSize=docuK.find(".TFontSize");
	kipid.docuK.TLineHeight=docuK.find(".TLineHeight");
	kipid.docuK.deviceInfo=docuK.find(".deviceInfo");
	kipid.fontSize=9;
	kipid.lineHeight10=16;
	kipid.fontFamily="'Malgun Gothic', '맑은 고딕'";
	kipid.mode="Dark";
	
	kipid.Cmode=function(modeI){
		if (modeI==kipid.mode){
			return;
		} else if (modeI=="Dark"){
			kipid.docuK.removeClass("bright");
		} else if (modeI=="Bright"){
			kipid.docuK.addClass("bright");
		} else{
			return;
		}
		kipid.mode=modeI;
	};
	kipid.CfontFamily=function(font){
		kipid.docuK.css({fontFamily:font});
	};
	kipid.CfontSize=function(increment){
		kipid.fontSize+=increment;
		if (kipid.fontSize<7) {
			kipid.fontSize=7;
		} else if (kipid.fontSize>13) {
			kipid.fontSize=13;
		}
		kipid.docuK.css({"font-size":kipid.fontSize+"px"});
		kipid.docuK.TFontSize.html((kipid.fontSize*1.8).toFixed(1)+"px");
	};
	kipid.ClineHeight=function(increment){
		kipid.lineHeight10+=increment;
		if (kipid.lineHeight10<13) {
			kipid.lineHeight10=13;
		} else if (kipid.lineHeight10>20) {
			kipid.lineHeight10=20;
		}
		kipid.docuK.css({"line-height":(kipid.lineHeight10/10).toString()});
		kipid.docuK.TLineHeight.html((kipid.lineHeight10/10).toFixed(1));
	};
	kipid.logPrint("<br><br>Current styles (dark/bright mode, font-family, font-size, line-height) are shown.");
	
	////////////////////////////////////////////////////
	// Delayed Loading.
	////////////////////////////////////////////////////
	$.fn.inView=function(delayPad){
		delayPad=delayPad||0;
		var $elem=$(this);
		if ($elem.is(":visible")){
			var viewportHeight=window.innerHeight;
			var scrollTop=$(window).scrollTop();
			var elemTop=$elem.offset().top-delayPad;
			var elemBottom=elemTop+$elem.height()+delayPad*2;
			return (scrollTop+viewportHeight>elemTop) && (scrollTop<elemBottom);
		} else{
			return false;
		}
	};
	$.fn.delayedLoad=function(delayPad){
		var $elem=$(this);
		var done=false;
		if ($elem.inView(delayPad)){
			// divs with background-image
			if ($elem.attr("delayed-bgimage")){
				$elem.css("background-image", "url("+$elem.attr("delayed-bgimage")+")");
				$elem.removeAttr("delayed-bgimage");
				done=true;
			} 
			// iframes or images
			if ($elem.attr("delayed-src")){
				$elem.attr("src", $elem.attr("delayed-src"));
				$elem.removeAttr("delayed-src");
				done=true;
			}
			// MathJax Process
			if ($elem.is(".MathJax_Preview")){
				kipid.logPrint("<br><br>MathJax.Hub.Process("+$elem.next()[0]+") is called.");
				MathJax.Hub.Queue(["Process", MathJax.Hub, $elem.next()[0]]);
				done=true;
			}
		}
		return done;
	};
	
	kipid.delayedElems=docuK.find("[delayed-src], [delayed-bgimage]");
	kipid.logPrint("<br><br>There are "+kipid.delayedElems.length+" delayed elements.");
	kipid.delayPad=kipid.delayPad||50;
	kipid.delayedLoadAll=function(){
		if (kipid.delayedElems.length===0){
			kipid.logPrint("<br><br>All delayedElem are loaded.")
			$(window).off("scroll.delayedLoad");
		} else{
			kipid.delayedElems.each(function(){
				if ($(this).delayedLoad(kipid.delayPad)){
					kipid.delayedElems=kipid.delayedElems.not(this);
					kipid.logPrint("<br><span class=\"emph\">"+this+" at vertical position of "+(100*$(this).offset().top/$(document).height()).toPrecision(3)+"% of document is delayed-loaded.</span><br>"+kipid.delayedElems.length+" of delayedElems are remained.<br>");
				}
			});
		}
	}
	
	kipid.previous=Date.now();
	kipid.wait=kipid.wait||500;
	kipid.logPrint("<br><br>kipid.delayPad = "+kipid.delayPad+";<br>kipid.wait = "+kipid.wait+";");
	kipid.delayedLoadByScroll=function kipidDelayedLoadByScroll(){
		var now=Date.now();
		var passed=now-kipid.previous;
		if (passed>kipid.wait){
			// kipid.logPrint("<br>Doing delayed-load.");
			kipid.delayedLoadAll();
			kipid.previous=now;
		} else{
			$(window).off("scroll.delayedLoad");
			setTimeout(function(){
				// kipid.logPrint(" Now doing delayed-load.");
				kipid.delayedLoadAll();
				kipid.previous=Date.now();
				$(window).on("scroll.delayedLoad", kipidDelayedLoadByScroll);
			}, kipid.wait*1.1-passed);
			// kipid.logPrint("<br>wait "+(kipid.wait*1.1-passed).toFixed(0)+"ms.");
		}
	};
	$(window).on("scroll.delayedLoad", kipid.delayedLoadByScroll);
	
	////////////////////////////////////////////////////
	// On resize and ready.
	////////////////////////////////////////////////////
	$(window).resize(function(){
		if(window.innerWidth!=kipid.browserWidth){
			kipid.browserWidth=window.innerWidth;
			kipid.fontSize=parseInt(kipid.docuK.css("font-size"));
			kipid.docuK.TFontSize.html((kipid.fontSize*1.8).toFixed(1)+"px");
			kipid.docuK.deviceInfo.html("browser width: "+kipid.browserWidth);
		}
	});
	$(document).ready(function(){
		kipid.fontSize=parseInt(kipid.docuK.css("font-size"));
		kipid.docuK.TFontSize.html((kipid.fontSize*1.8).toFixed(1)+"px");
		kipid.docuK.TLineHeight.html((kipid.lineHeight10/10).toFixed(1));
		kipid.docuK.deviceInfo.html("browser width: "+kipid.browserWidth);
		
		$(window).trigger("scroll.delayedLoad");
		
		$(window).off("scroll.delayedLoad");
		MathJax.Hub.Queue(["PreProcess",MathJax.Hub]);
		MathJax.Hub.Queue(function(){
			kipid.delayedElems=kipid.delayedElems.add(".MathJax_Preview");
			kipid.logPrint("<br><br>\".MathJax_Preview\" are added to kipid.delayedElems. Now its length is: "+kipid.delayedElems.length);
			$(window).on("scroll.delayedLoad", kipid.delayedLoadByScroll);
		});
		
		////////////////////////////////////////////////////
		// google code prettify script is added.
		////////////////////////////////////////////////////
		if (docuK.find(".prettyprint").exists()) {
			var gcp=document.createElement('script');
			gcp.src="https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js";
			(document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(gcp);
			kipid.logPrint("<br><br>Google code prettyfy.js is loaded since pre.prettyprint is in your document.");
		}
		
		kipid.logPrint("<br><br><span class='emph'>docuK scripts are all done. Then this log is closing in 1.0 sec.</span>");
		setTimeout(function(){kipid.Hide("docuK-log");}, 1000);
	});
})(window.kipid=window.kipid||{}, jQuery);