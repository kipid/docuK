////////////////////////////////////////////////////
////////////////////////////////////////////////////
// Public functions which can be used elsewhere, and functions called only once in the beginning.
////////////////////////////////////////////////////
////////////////////////////////////////////////////
(function(kipid, $, undefined){
	$.fn.exists=function(){ return this.length!==0; };
	kipid.browserWidth=window.innerWidth;
	var docuK=kipid.docuK=$(".docuK");
	
	////////////////////////////////////////////////////
	// logPrint function.
	////////////////////////////////////////////////////
	kipid.log=$("#docuK-log").eq(0);
	kipid.logPrint=function(str){
		kipid.log.append(str);
		kipid.log.scrollTop(kipid.log[0].scrollHeight);
	};
	kipid.logPrint("kipid.logPrint is working!");
	
	////////////////////////////////////////////////////
	// Functions for printing codes into 'pre.prettyprint'.
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
	kipid.escapeHTML=function(str, query){
		return ((query==undefined)&&true||query)?str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):str;
	};
	kipid.printCode=function(codeId){
		var $pre=$("#pre-"+codeId);
		var $code=$("#"+codeId);
		if ($pre.exists()){
			$pre.html(kipid.escapeHTML(
				// ('<codeprint id="'+codeId+'">'+
				kipid.indentsRemove($code.html())
				// +'</codeprint><!-- '+codeId+' -->')
				.trim(), !$code.is(".noEscapeHTML")));
		}
	};
	
	////////////////////////////////////////////////////
	// Function for toggling height, i.e. switching scrollability with conserving view.
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
	// section's show/hide functions
	////////////////////////////////////////////////////
	kipid.ShowHide=function(elem){
		$(elem).next().toggle();
		if ($(elem).next().is(":visible")){
			$(elem).html("▼ Hide");
		} else{
			$(elem).html("▼ Show");
		}
		setTimeout(function(){$(window).trigger("scroll.delayedLoad");}, 1000);
	};
	kipid.Hide=function(elem){
		var $elem=$(elem).parent();
		window.scrollBy(0,-$elem.outerHeight());
		$elem.hide();
		$elem.parent().find(".ShowHide").html("▼ Show");
	};
	
	////////////////////////////////////////////////////
	// bubbleRef's show/hide functions
	////////////////////////////////////////////////////
	kipid.ShowBR=function(divId){
		clearTimeout(kipid.timerHideBRQueue);
		kipid.bubbleRefs.hide();
		$("#"+divId).show();
	};
	kipid.timerHideBR=function(divId){
		kipid.timerHideBRQueue=setTimeout(function(){$("#"+divId).hide();}, 1000);
	};
	kipid.HideBR=function(divId){
		$("#"+divId).hide();
	};
	
	////////////////////////////////////////////////////
	// Changing Styles of docuK
	////////////////////////////////////////////////////
	// kipid.TFontSize=docuK.find(".TFontSize");
	// kipid.TLineHeight=docuK.find(".TLineHeight");
	kipid.deviceInfo=docuK.find(".deviceInfo");
	
	kipid.fontSize=parseInt(docuK.css('font-size'));
	kipid.lineHeight10=parseInt(parseFloat(docuK.css('line-height'))/kipid.fontSize*10);
	kipid.fontFamily=docuK.css('font-family').split(/\s*,\s*/)[0];
	kipid.mode=(docuK.is(".bright"))?"Bright":"Dark";
	
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
		kipid.browserWidth=0;
		$(window).trigger("resize.deviceInfo");
	};
	kipid.CfontFamily=function(font){
		kipid.docuK.css({fontFamily:font});
		kipid.fontFamily=font;
		kipid.browserWidth=0;
		$(window).trigger("resize.deviceInfo");
	};
	kipid.CfontSize=function(increment){
		kipid.fontSize+=increment;
		if (kipid.fontSize<7) {
			kipid.fontSize=7;
		} else if (kipid.fontSize>20) {
			kipid.fontSize=20;
		}
		kipid.docuK.css({"font-size":kipid.fontSize+"px"});
		// kipid.TFontSize.html((kipid.fontSize*1.8).toFixed(1)+"px");
		kipid.browserWidth=0;
		$(window).trigger("resize.deviceInfo");
	};
	kipid.ClineHeight=function(increment){
		kipid.lineHeight10+=increment;
		if (kipid.lineHeight10<10) {
			kipid.lineHeight10=10;
		} else if (kipid.lineHeight10>25) {
			kipid.lineHeight10=25;
		}
		kipid.docuK.css({"line-height":(kipid.lineHeight10/10).toString()});
		// kipid.TLineHeight.html((kipid.lineHeight10/10).toFixed(1));
		kipid.browserWidth=0;
		$(window).trigger("resize.deviceInfo");
	};
	$(window).on("resize.deviceInfo", function(){
		if(window.innerWidth!==kipid.browserWidth){
			kipid.browserWidth=window.innerWidth;
			// kipid.fontSize=parseInt(kipid.docuK.css("font-size"));
			// kipid.TFontSize.html((kipid.fontSize*1.8).toFixed(1)+"px");
			kipid.deviceInfo.html("Mode:"+kipid.mode+"; "
				+"Font:"+kipid.fontFamily+"; "
				+"font-size:"+kipid.fontSize+"; "
				+"line-height:"+(kipid.lineHeight10/10).toFixed(1)+";<br>"
				+"width: "+kipid.browserWidth
				+", height: "+window.innerHeight);
		}
	});
	
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
	
	kipid.delayPad=kipid.delayPad||50;
	kipid.delayedElems=[];
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
})(window.kipid=window.kipid||{}, jQuery);