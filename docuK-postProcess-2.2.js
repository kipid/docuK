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
	
	kipid.bubbleRefs=docuK.find(".bubbleRef"); // for function kipid.ShowBR
	
	var inRefs=docuK.find(".inRef");
	// Centering arrow.
	inRefs.each(function(){
		var $elem=$(this);
		var width=parseFloat($elem.width());
		var $arrow=$elem.find(".arrow");
		var borderWidth=parseFloat($arrow.css("borderWidth"));
		var fontSize=parseFloat($arrow.css("fontSize"));
		$arrow.css({marginLeft:((width/2-borderWidth)/fontSize).toFixed(2)+"em"});
	});
	// Delayed-Load in bubble ref.
	inRefs.on("mouseenter.delayedLoad", function(){
		kipid.logPrint("<br>Do delayed-load in bubble ref.");
		$(window).trigger("scroll.delayedLoad");
		$(this).off("mouseenter.delayedLoad");
	});
	
	////////////////////////////////////////////////////
	// On ready.
	////////////////////////////////////////////////////
	$(document).ready(function(){
		// Hiding hiden sections.
		docuK.find(".sec.hiden").find(">.sec-contents").css({display:"none"});
		
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
		if (docuK.find(".prettyprint").exists()){
			var gcp=document.createElement('script');
			gcp.defer="";
			gcp.src="http://cfs.tistory.com/custom/blog/146/1468360/skin/images/run_prettify.js";
			(document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(gcp);
			kipid.logPrint("<br><br>Google code prettyfy.js is loaded since pre.prettyprint is in your document.");
		}
		
		////////////////////////////////////////////////////
		// ShortKeys (including default 'processShortcut(event)' of tistory.)
		////////////////////////////////////////////////////
		kipid.hLists=$("#content .titleWrap>h2,.docuK .sec>h1,.docuK .sec>h2,.docuK .subsec>h3,.docuK .subsubsec>h4");
		kipid.processShortKey=function(event){
			if (event.altKey||event.ctrlKey||event.metaKey) return;
			switch (event.target.nodeName) {
				case "INPUT": case "SELECT": case "TEXTAREA": return;
			}
			switch (event.keyCode){
				case 70: //F = 70
				case 68: //D = 68
					var scrollTop=$(window).scrollTop();
					var i=0, k=kipid.hLists.length;
					var location;
					var hI;
					
					if (event.keyCode===70){
						scrollTop+=10;
						for (i=0;i<k;i++){
							hI=kipid.hLists.eq(i);
							if (hI.is(":visible")&&scrollTop<hI.offset().top){ break; }
						}
						if (i===k){
							// hI=kipid.hLists.eq(0);
							// alert("This is the last section.");
							return;
						}
					} else{
						scrollTop-=10;
						for (i=k-1;i>=0;i--){
							hI=kipid.hLists.eq(i);
							if (hI.is(":visible")&&scrollTop>hI.offset().top){ break; }
						}
						if (i===-1){
							// hI=kipid.hLists.eq(k-1);
							// alert("This is the first section.");
							return;
						}
					}
					$(window).scrollTop(hI.offset().top);
					break;
				case 76: //L = 76
					window.location = "/category/0"
					break;
				case 90: //Z
					if ($("#recentEntries").exists()) $(window).scrollTop($("#recentEntries").offset().top);
					break;
				case 88: //X
					if ($("#recentComments").exists()) $(window).scrollTop($("#recentComments").offset().top);
					break;
				case 67: //C
					if ($("#recentTrackback").exists()) $(window).scrollTop($("#recentTrackback").offset().top);
					break;
				default:
					if (window['processShortcut']!==undefined) processShortcut(event);
			}
		}
		document.onkeydown=kipid.processShortKey;
		var shortkeyDesc=$("#shortkey>ul");
		if (shortkeyDesc.exists()){
			shortkeyDesc.prepend(
				"<li>D: Previous Section</li>"
				+"<li>F: Forward Section</li>"
				+"<li>L: To the [Lists]</li>"
			);
		}
		kipid.logPrint("<br><br>New ShortKeys (D, F, L) are set.");
		
		////////////////////////////////////////////////////
		// Closing docuK Log.
		////////////////////////////////////////////////////
		kipid.logPrint("<br><br><span class='emph'>docuK scripts are all done. Then this log is closing in 1.0 sec.</span>");
		setTimeout(function(){kipid.log.hide();}, 0);
	});
})(window.kipid, jQuery);