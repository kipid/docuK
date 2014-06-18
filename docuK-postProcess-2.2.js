////////////////////////////////////////////////////
////////////////////////////////////////////////////
// docuK Process
////////////////////////////////////////////////////
////////////////////////////////////////////////////
kipid.docuKProcess=function docuK(kipid, $, docuKI, undefined){
	////////////////////////////////////////////////////
	// Possible duplicate id is handled.
	////////////////////////////////////////////////////
	docuKI=(isNaN(docuKI)||docuKI<0)?0:parseInt(docuKI);
	kipid.logPrint("<br><br>docuK-"+docuKI+" scripts started!<br><span class='emph'>If this log is not closed automatically, there must be an error somewhere in your document or scripts.</span>");
	var docuK=kipid.docuK.eq(docuKI);
	if (docuK.is(".rendered")){
		kipid.logPrint("<br><br>docuK-"+docuKI+" is already rendered.");
		return;
	}
	
	var postId="-in-docuK"+docuKI;
	var postIdRegEx=new RegExp(postId+"$");
	if (docuK.is(".noDIdHandle")){
		postId="";
	} else{
		docuK.find("[id]").each(function(){
			var $this=$(this);
			$this[0].id+=postId;
		});
	}
	
	////////////////////////////////////////////////////
	// Style change widget.
	////////////////////////////////////////////////////
	var fontSizeAndLineHeight=(docuKI===1)?
		'<form><button type="button" onclick="kipid.CfontSize(-1)" style="font-size:1em">A</button>'
		+'<button type="button" onclick="kipid.CfontSize(1)" style="font-size:1.4em">A</button></form> '
		+'<form><button type="button" onclick="kipid.ClineHeight(-1)" style="font-size:1.3em">=</button>'
		+'<button type="button" onclick="kipid.ClineHeight(1)" style="font-size:1.3em">〓</button></form> '
		:"";
	docuK.prepend(
		'<div class="change-docuK-style">'
		+'<form><input id="button'+docuKI+'-Dark" type="radio" name="mode" value="Dark" onclick="kipid.Cmode(this.value)"><label for="button'+docuKI+'-Dark" style="display:inline-block; background:black; color:white; border:2px solid rgb(150,150,150); padding:0.1em 0.2em">Dark</label>'
		+'</input><input id="button'+docuKI+'-Bright" type="radio" name="mode" value="Bright" onclick="kipid.Cmode(this.value)"><label for="button'+docuKI+'-Bright" style="display:inline-block; background:white; color:black; border:2px solid rgb(150,150,150); padding:0.1em 0.2em">Bright</label></input></form> '
		+'<form><input class="emph" type="text" name="font" value="맑은 고딕" style="font-family:\'맑은 고딕\'; font-size:1.2em; width:73px; height:23px; text-align:center" onchange="kipid.CfontFamily(this.value)"></input></form> '
		+fontSizeAndLineHeight
		+'<form><button type="button" onclick="MathJax.Hub.Queue([\'Process\', MathJax.Hub])" style="width:auto; padding:0 .5em">All Maths</button></form> '
		+'<form><button type="button" onclick="kipid.log.toggle()" style="width:auto; padding:0 .5em">DocuK Log</button></form> '
		+'<div class="deviceInfo"></div></div>'
	);
	
	////////////////////////////////////////////////////
	// Scrollable switching of 'pre.prettyprint'.
	////////////////////////////////////////////////////
	docuK.find("pre.prettyprint").wrap("<div class='preC'></div>").before('<div class="preSSE">On the left side of codes is there a hiden button to toggle/switch scrollability ({max-height:some} or {max-height:none}).</div><div class="preSS" onclick="kipid.toggleHeight(this)"></div>');
	kipid.logPrint("<br><br>&lt;codeprint&gt; tags are printed to corresponding &lt;pre&gt; tags, only when the tags exist in the document.");
	
	////////////////////////////////////////////////////
	// Numbering section, making table of contents, and numbering eqq (formatting to MathJax also) and figure tags
	////////////////////////////////////////////////////
	var secs=docuK.find(">.sec"), subsecs, subsubsecs, secContents="";
	var secIH2, subsecIH3, subsubsecIH4;
	var secI=0, secITxt="", subsecI=0, subsubsecI=0, tocHtml="", txt="", secId="", secPreTxt="";
	var eqqs, eqN="", eqC="", figs;
	function fTocHtml(numbering){
		var secN=(numbering==undefined||numbering)?"secN":"none";
		return "<h"+hN+"><a class='jump' id='toc"+docuKI+"-"+secId+"' href='#secId"+docuKI+"-"+secId+"'><span class=\""+secN+"\"><span class=\"number\">"+secPreTxt+"</span>.</span>"+txt+"</a></h"+hN+">";
	}
	function fSecHtml(numbering){
		var secN=(numbering==undefined||numbering)?"secN":"none";
		return "<a class='jump tJump' href='#toc"+docuKI+"-"+secId+"'>T</a><a class='jump' id='secId"+docuKI+"-"+secId+"' href='#secId"+docuKI+"-"+secId+"'><span class=\""+secN+"\"><span class=\"number\">"+secPreTxt+"</span>.</a></span>"+txt;
	}
	function fEqqHtml(){
		return '<div class="eqCC"><div class="eqN"><span class="number">('+eqN+')</span></div><div class="eqC">'+eqC+'</div></div>';
	}
	for (var i=0;i<secs.length;i++) {
		secIH2=secs.eq(i).find("h2:first-child");
		if (secIH2.exists() && !secIH2.is(".notSec")) { // exclude .sec>h1 and .sec>h2.notSec in ToC
			hN="2"; txt=secIH2.html();
			if (secIH2.is(".no-sec-N")) {
				secPreTxt=secId=secITxt=(secIH2.is("[id]"))?secIH2.attr('id').replace(/^sec-/i,'').replace(postIdRegEx,''):"secPreTxt"+docuKI+"-"+i;
				tocHtml+=fTocHtml(false);
				secIH2.html(fSecHtml(false));
			} else {
				secI++;
				secPreTxt=secId=secITxt=secI.toString();
				tocHtml+=fTocHtml();
				secIH2.html(fSecHtml());
			}
			
			if (!secs.eq(i).is(".noToggleUI")) {
				secContents="sec"+docuKI+"-"+secITxt+"-contents";
				secs.eq(i).append("<div class=\"Hide\" onclick=\"kipid.Hide(this)\">▲ Hide</div><div class=\"cBoth\"></div>");
				secs.eq(i).find(">*:not(:first-child)").wrapAll("<div class=\"sec-contents\" id=\""+secContents+"\"></div>");
				secs.eq(i).append("<div class=\"cBoth\"></div>");
				secIH2.after("<div class=\"ShowHide\" onclick=\"kipid.ShowHide(this)\">▼ Show/Hide</div>");
			}
			
			subsecs=secs.eq(i).find(".subsec"); subsecI=0;
			for (var j=0;j<subsecs.length;j++) {
				subsecIH3=subsecs.eq(j).find("h3:first-child");
				hN="3"; subsecI++; secId=secITxt+"-"+subsecI; secPreTxt=secITxt+"."+subsecI; txt=subsecIH3.html();
				tocHtml+=fTocHtml();
				subsecIH3.html(fSecHtml());
				
				subsubsecs=subsecs.eq(j).find(".subsubsec"); subsubsecI=0;
				for (var k=0;k<subsubsecs.length;k++) {
					subsubsecIH4=subsubsecs.eq(k).find("h4:first-child");
					hN="4"; subsubsecI++; secId=secITxt+"-"+subsecI+"-"+subsubsecI; secPreTxt=secITxt+"."+subsecI+"."+subsubsecI; txt=subsubsecIH4.html();
					tocHtml+=fTocHtml();
					subsubsecIH4.html(fSecHtml());
				}
			}
		} else {
			secITxt="x";
		}
		eqqs=secs.eq(i).find("eqq");
		for(j=0;j<eqqs.length;j++){
			eqN=secITxt+"-"+(j+1).toString();
			eqC=eqqs.eq(j).html().trim();
			eqqs.eq(j).html(fEqqHtml());
		}
		figs=secs.eq(i).find("figure");
		for(j=0;j<figs.length;j++){
			figN=secITxt+"-"+(j+1).toString();
			figs.eq(j).find(".caption").html(function(ith,orgTxt){return "Fig. <span class=\"number\">("+figN+")</span>: "+orgTxt.trim();});
		}
	}
	secs.find(".toc").html(tocHtml);
	kipid.logPrint("<br><br>Table of Contents is created.<br><br>Auto numberings of sections (div.sec>h2, div.subsec>h3, div.subsubsec>h4), &lt;eqq&gt; tags, and &lt;figure&gt; tags are done.");

	////////////////////////////////////////////////////
	// Make 'cite' tags bubble-refer references in ".docuK ol.refs>li".
	// Make 'refer' tags bubble-refer equations (eqq tag) or figures (figure tag). Any tag with id can be bubble-refered with refer tag.
	////////////////////////////////////////////////////
	function pad(str, max){
		str=str.toString();
		return str.length<max?pad("0"+str,max):str;
	}
	var refN="", preRefHtml="", refHtml="", citeN="";
	function fCiteHtml(){
		var str='<div class="inRef" onmouseover="kipid.ShowBR(\'bRef'+docuKI+'-'+citeN+'\')" onmouseout="kipid.timerHideBR(\'bRef'+docuKI+'-'+citeN+'\')">'+refN+'<div id="bRef'+docuKI+'-'+citeN+'" class="bubbleRef"><div class="content">'+preRefHtml+refHtml+'</div><div class="arrow"></div><div class="exit" onclick="kipid.HideBR(\'bRef'+docuKI+'-'+citeN+'\')"><svg><g style="stroke:white;stroke-width:23%"><line x1="20%" y1="20%" x2="80%" y2="80%"/><line x1="80%" y1="20%" x2="20%" y2="80%"/></g>✖</svg></div></div></div>';
		if (kipid.browserWidth<321){
			str=str.replace(/<iframe[^>]*>[^<]*<\/iframe>/ig, '<span class="emph">In bubble refs, iframe (or youtube video) is intentionally NOT supported for various reasons (security, and cross browsing). See it in the original position of the iframe (video).</span>');
		}
		return str;
	} // 말풍선에서 비디오 등의 iframe을 의도적으로 지원하지 않았습니다. 원래의 위치에서 보세요.
	var refs=docuK.find("ol.refs>li")
	for(i=0;i<refs.length;i++){ // ref [i+1] with id
		refs.eq(i).prepend("<span class='number none'>["+pad(i+1,2)+"]</span>");
	}
	var refers=docuK.find("cite,refer"), referI, refered;
	refers.html('<span class="emph">( No refer. )</span>');
	for(i=0;i<refers.length;i++){
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
	
	kipid.bubbleRefs=(kipid.bubbleRefs==undefined)?docuK.find(".bubbleRef"):kipid.bubbleRefs.add(docuK.find(".bubbleRef")); // for function kipid.ShowBR
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
	secs.filter(".hiden").find(">.sec-contents").css({display:"none"});
	kipid.logPrint("<br><br>&lt;cite&gt; and &lt;refer&gt; tags are rendered to show bubble reference.");
	
	docuK.addClass("rendered");
};

////////////////////////////////////////////////////
////////////////////////////////////////////////////
// docuK post-Process
////////////////////////////////////////////////////
////////////////////////////////////////////////////
(function(kipid, $, undefined){
	var docuK=kipid.docuK=$(".docuK");
	
	////////////////////////////////////////////////////
	// Showing disableQ0 only in width>321.
	////////////////////////////////////////////////////
	if (kipid.browserWidth>321){
		docuK.find(".disableQ0").html(function(ith,orgText){
			kipid.logPrint("<br><br>\".disableQ0\"s are enabled at vertical position of "+(100*$(this).offset().top/$(document).height()).toPrecision(3)+"% of document.");
			return orgText.replace(/<!--/g,'').replace(/-->/g,'');
		});
	}
	
	////////////////////////////////////////////////////
	// Printing codes in <codeprint> with id into <pre>.
	////////////////////////////////////////////////////
	var codeprints=$("codeprint");
	for (var i=0;i<codeprints.length;i++){
		kipid.printCode(codeprints.eq(i).attr('id'));
	}
	
	////////////////////////////////////////////////////
	// <eq> and <eqq> tags to MathJax format
	////////////////////////////////////////////////////
	var eqs=$("eq");
	for (var i=0;i<eqs.length;i++){
		eqs.eq(i).html(function(ith,orgTxt){return "\\( "+orgTxt.trim()+" \\)";});
	}
	var eqqs=$("eqq");
	for (var i=0;i<eqqs.length;i++){
		eqqs.eq(i).html(function(ith,orgTxt){return "\\[ "+orgTxt.trim()+" \\]";});
	}
	kipid.logPrint("<br><br>&lt;eq&gt; and &lt;eqq&gt; tags are rendered to MathJax format enclosed by \\ ( and \\ ).");
	
	////////////////////////////////////////////////////
	// docuK process.
	////////////////////////////////////////////////////
	docuK.has("script").addClass("noDIdHandle");
	var k=docuK.length;
	for(var i=1;i<k;i++){
		kipid.docuKProcess(kipid, jQuery, i);
	}
	
	kipid.TFontSize=docuK.find(".TFontSize");
	kipid.TLineHeight=docuK.find(".TLineHeight");
	kipid.deviceInfo=docuK.find(".deviceInfo");
	
	////////////////////////////////////////////////////
	// On ready.
	////////////////////////////////////////////////////
	$(document).ready(function(){
		////////////////////////////////////////////////////
		// Printing Styles
		////////////////////////////////////////////////////
		// kipid.TFontSize.html((kipid.fontSize*1.8).toFixed(1)+"px");
		// kipid.TLineHeight.html((kipid.lineHeight10/10).toFixed(1));
		// kipid.deviceInfo.html("browser width: "+kipid.browserWidth);
		kipid.browserWidth=0;
		$(window).trigger("resize.deviceInfo");
		kipid.logPrint("<br><br>Current styles (dark/bright mode, font-family, font-size, line-height) are shown.");
		
		////////////////////////////////////////////////////
		// Initial Delayed Load.
		////////////////////////////////////////////////////
		kipid.delayedElems=docuK.find("[delayed-src], [delayed-bgimage]");
		kipid.logPrint("<br><br>There are "+kipid.delayedElems.length+" delayed elements.");
		$(window).trigger("scroll.delayedLoad");
		$(window).off("scroll.delayedLoad");
		
		////////////////////////////////////////////////////
		// MathJax PreProcess.
		////////////////////////////////////////////////////
		MathJax.Hub.Queue(["PreProcess",MathJax.Hub]);
		MathJax.Hub.Queue(function(){
			kipid.delayedElems=kipid.delayedElems.add(".MathJax_Preview");
			kipid.logPrint("<br><br>\".MathJax_Preview\" are added to kipid.delayedElems. Now its length is: "+kipid.delayedElems.length);
			$(window).on("scroll.delayedLoad", kipid.delayedLoadByScroll);
		});
		
		////////////////////////////////////////////////////
		// google code prettify js script is added.
		////////////////////////////////////////////////////
		if (docuK.find(".prettyprint").exists()) {
			var gcp=document.createElement('script');
			gcp.defer="";
			gcp.src="http://cfs.tistory.com/custom/blog/146/1468360/skin/images/run_prettify.js";
			(document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(gcp);
			kipid.logPrint("<br><br>Google code prettyfy.js is loaded since pre.prettyprint is in your document.");
		}
		
		kipid.logPrint("<br><br><span class='emph'>docuK scripts are all done. Then this log is closing in 1.0 sec.</span>");
		setTimeout(function(){kipid.log.hide();}, 0);
	});
})(window.kipid, jQuery);