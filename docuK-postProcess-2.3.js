(function(kipid, $, undefined) {
// SEE (Super Easy Edit)
let $SEE=$("codeprint.SEE");
for (let i=0;i<$SEE.length;i++) {
	let $SEEi=$SEE.eq(i);
	let SEEiHTML=$SEEi.html().trim();
	$SEEi.html("");
	$SEEi.after(kipid.renderToDocuK(SEEiHTML));
}
$("pre.prettyprint.scrollable").addClass("linenums");

let docuK=$(".docuK");
kipid.docuK=docuK;

// Showing disableQ0 only in width>321.
if (kipid.browserWidth>321) {
	docuK.find(".disableQ0").html(function(ith,orgText) {
		kipid.logPrint(`<br><br>".disableQ0"s are enabled at vertical position of ${(100*$(this).offset().top/$document.height()).toPrecision(3)}% of document.`);
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
kipid.logPrint(`<br><br>&lt;eq&gt; and &lt;eqq&gt; tags are rendered to MathJax format, being enclosed by \\ ( and \\ ).`);

// docuK process.
docuK.has("script").addClass("noDIdHandle");
let k=docuK.length;
for(let i=1;i<k;i++) {
	kipid.docuKProcess(kipid, jQuery, i);
}

kipid.bubbleRefs=docuK.find(".bubbleRef"); // for function kipid.ShowBR

let $inRefs=docuK.find(".inRef");
// Centering arrow.
$inRefs.each(function () {
	let $elem=$(this);
	let width=$elem.width()-2;
	let $arrow=$elem.find(".arrow");
	let borderWidth=parseFloat($arrow.css("borderWidth"));
	let fontSize=parseFloat($arrow.css("fontSize"));
	$arrow.css({marginLeft:((width/2-borderWidth)/fontSize).toFixed(2)+"em"});
});
// Delayed-Load in bubble ref.
$inRefs.on("mouseenter.delayedLoad", function () {
	kipid.logPrint(`<br>Do delayed-load in bubble ref.`);
	$window.trigger("scroll.delayedLoad");
	$(this).off("mouseenter.delayedLoad");
});

// Fuzzy Search
////////////////////////////////////////////////////
// Hangul (Korean) split and map to English
// KE : Korean Expanded
////////////////////////////////////////////////////
kipid.jamoKE=["ㄱ", "ㄱㄱ", "ㄱㅅ", "ㄴ", "ㄴㅈ", "ㄴㅎ", "ㄷ", "ㄷㄷ", "ㄹ", "ㄹㄱ", "ㄹㅁ", "ㄹㅂ", "ㄹㅅ", "ㄹㅌ", "ㄹㅍ", "ㄹㅎ", "ㅁ", "ㅂ", "ㅂㅂ", "ㅂㅅ", "ㅅ", "ㅅㅅ", "ㅇ", "ㅈ", "ㅈㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ", "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅗㅏ", "ㅗㅐ", "ㅗㅣ", "ㅛ", "ㅜ", "ㅜㅓ", "ㅜㅔ", "ㅜㅣ", "ㅠ", "ㅡ", "ㅡㅣ", "ㅣ"];
kipid.jamo=["ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄸ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅃ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ", "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];

kipid.mapKE={"q":"ㅂ", "Q":"ㅃ", "w":"ㅈ", "W":"ㅉ", "e":"ㄷ", "E":"ㄸ", "r":"ㄱ", "R":"ㄲ", "t":"ㅅ", "T":"ㅆ", "y":"ㅛ", "Y":"ㅛ", "u":"ㅕ", "U":"ㅕ", "i":"ㅑ", "I":"ㅑ", "o":"ㅐ", "O":"ㅒ", "p":"ㅔ", "P":"ㅖ", "a":"ㅁ", "A":"ㅁ", "s":"ㄴ", "S":"ㄴ", "d":"ㅇ", "D":"ㅇ", "f":"ㄹ", "F":"ㄹ", "g":"ㅎ", "G":"ㅎ", "h":"ㅗ", "H":"ㅗ", "j":"ㅓ", "J":"ㅓ", "k":"ㅏ", "K":"ㅏ", "l":"ㅣ", "L":"ㅣ", "z":"ㅋ", "Z":"ㅋ", "x":"ㅌ", "X":"ㅌ", "c":"ㅊ", "C":"ㅊ", "v":"ㅍ", "V":"ㅍ", "b":"ㅠ", "B":"ㅠ", "n":"ㅜ", "N":"ㅜ", "m":"ㅡ", "M":"ㅡ"};
for (let p in kipid.mapKE) {
	kipid.mapKE[kipid.mapKE[p]]=p; // Add reversed mapping.
}

kipid.rChoKE=["ㄱ", "ㄱㄱ", "ㄴ", "ㄷ", "ㄷㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅂㅂ", "ㅅ", "ㅅㅅ", "ㅇ", "ㅈ", "ㅈㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
kipid.rCho=["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

kipid.rJungKE=["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅗㅏ", "ㅗㅐ", "ㅗㅣ", "ㅛ", "ㅜ", "ㅜㅓ", "ㅜㅔ", "ㅜㅣ", "ㅠ", "ㅡ", "ㅡㅣ", "ㅣ"];
kipid.rJung=["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];

kipid.rJongKE=["", "ㄱ", "ㄱㄱ", "ㄱㅅ", "ㄴ", "ㄴㅈ", "ㄴㅎ", "ㄷ", "ㄹ", "ㄹㄱ", "ㄹㅁ", "ㄹㅂ", "ㄹㅅ", "ㄹㅌ", "ㄹㅍ", "ㄹㅎ", "ㅁ", "ㅂ", "ㅂㅅ", "ㅅ", "ㅅㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
kipid.rJong=["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

kipid.splitHangul=function(str) {
	let res=[];
	res.originalStr=str;
	res.splitted3="";
	res.splitted="";
	res.pCho=[]; // position of word-start or 초성
	let p=0;
	res.pCho[p]=true;
	let cho, jung, jong;
	for (let i=0;i<str.length;i++) {
		let c=str.charAt(i)
		let n=str.charCodeAt(i);
		if (n>=0x3131&&n<=0x3163) {
			n-=0x3131;
			res[i]={"char":c, "splitted3":c, "splitted":kipid.jamoKE[n]};
			res.pCho[p]=true;
		}
		else if (n>=0xAC00&&n<=0xD7A3) {
			n-=0xAC00;
			jong=n%28;
			jung=( (n-jong)/28 )%21;
			cho=( ((n-jong)/28)-jung )/21;
			res[i]={"char":c
				, "splitted3":kipid.rCho[cho]+kipid.rJung[jung]+kipid.rJong[jong]
				, "splitted":kipid.rChoKE[cho]+kipid.rJungKE[jung]+kipid.rJongKE[jong]};
			res.pCho[p]=true;
		}
		else {
			res[i]={"char":c, "splitted3":c, "splitted":c};
			if (i>0&&/[^a-zA-Z0-9]$/.test(res[i-1].splitted)&&/[a-zA-Z0-9]/.test(c)) {
				res.pCho[p]=true;
			}
		}
		p+=res[i].splitted.length;
		res.splitted3+=res[i].splitted3;
		res.splitted+=res[i].splitted;
	}
	return res;
};

////////////////////////////////////////////////////
// Fuzzy search prepare
////////////////////////////////////////////////////
kipid.fsGo=[];
kipid.fsGo[0]=kipid.fsGo[1]=[];
kipid.fsGo[0].ptnSH=kipid.fsGo[1].ptnSH=kipid.splitHangul("$!@#");
kipid.fsGo.fullList=[];
kipid.fsGo.$fs=$fuzzy_search;
kipid.fsGo.$fsl=$fuzzy_search_list;
kipid.fsGo.$fsLis=$fuzzy_search_list.find(".list-item");
RegExp.quote=function(str) {
	return str.replace(/[.?*+^$[\]\\{}()|-]/g, "\\$&").replace(/\s/g, "[\\s\\S]");
};
kipid.arrayRegExs=function(ptnSH) {
	let str=ptnSH.splitted;
	let res=[];
	for (let i=0;i<str.length;i++) {
		let c=str.charAt(i);
		let mapKE=kipid.mapKE[c];
		if (mapKE) {
			res.push( new RegExp("["+c+mapKE+"]", "ig") );
		}
		else {
			res.push( new RegExp(RegExp.quote(c), "ig") );
		}
	}
	return res;
};
kipid.highlightStrFromIndices=function(strSplitted, indices) {
	let res="";
	for (let i=0, j=1, k=0, p1=0, p2=0;j<=indices.length;i=j,j++) {
		while (j<indices.length&&indices[j-1].end===indices[j].start) {
			j++;
		}
		for (;k<strSplitted.length;k++) {
			p1=p2;
			p2=p1+strSplitted[k].splitted.length;
			if (p2<=indices[i].start) {
				strSplitted[k].matched=false;
			}
			else if (p1<indices[j-1].end) {
				strSplitted[k].matched=true;
			}
			else {
				if (j===indices.length) {
					for (;k<strSplitted.length;k++) {
						strSplitted[k].matched=false;
					}
				}
				p2=p1;
				break;
			}
		}
	}
	for (let i=0;i<strSplitted.length;) {
		if (strSplitted[i].matched) {
			res+='<span class="bold">';
			while (i<strSplitted.length&&strSplitted[i].matched) {
				res+=kipid.escapeHTML(strSplitted[i].char);
				i++;
			}
			res+='</span>';
		}
		else {
			while (i<strSplitted.length&&!strSplitted[i].matched) {
				res+=kipid.escapeHTML(strSplitted[i].char);
				i++;
			}
		}
	}
	return res;
};
kipid.matchScoreFromIndices=function(strSH, ptnSH, indices) {
	let res=0;
	for (let i=0;i<indices.length;i++) {
		if (strSH.pCho[indices[i].start])
			res+=10;
	}
	for (let i=1;i<indices.length;i++) {
		let diff=indices[i].start-indices[i-1].start;
		if (diff<5) res+=8*(5-diff);
	}
	return res;
};
kipid.fuzzySearch=function(ptnSH, fs) {
	if (ptnSH.splitted===fs[0].ptnSH.splitted) {
		return fs[0];
	}
	if (ptnSH.splitted.indexOf(fs[0].ptnSH.splitted)!==-1) {
		fs[1]=fs[0];
	}
	else if (fs[1]&&ptnSH.splitted.indexOf(fs[1].ptnSH.splitted)!==-1) {
		if (ptnSH.splitted===fs[1].ptnSH.splitted) {
			return fs[1];
		}
	}
	else {
		fs[1]=null;
	}
	let list=[];
	if (fs[1]&&fs[1].sorted) {
		let sorted=fs[1].sorted;
		for (let i=0;i<sorted.length;i++) {
			list.push(fs.fullList[fs[1][sorted[i]].i]);
		}
	}
	else {
		if (fs.shuffled) {
			let shuffled=fs.shuffled;
			for (let i=0;i<shuffled.length;i++) {
				list.push(fs.fullList[shuffled[i].i]);
			}
		}
		else {
			let l=fs.fullList.length;
			for (let i=0;i<l;i++) {
				list.push(fs.fullList[l-1-i]);
			}
		}
	}
	fs[0]=[];
	fs[0].ptnSH=ptnSH;
	let regExs=kipid.arrayRegExs(ptnSH);
	let regExsReversed=[];
	for (let i=0;i<regExs.length;i++) {
		regExsReversed[i]=regExs[regExs.length-1-i];
	}
	for (let i=0;i<list.length;i++) {
	 let listI=list[i];
	if (regExs.length>0) {
		let txt=listI.txt;
		let txtS=txt.splitted;
		let txtSReversed=txtS.split("").reverse().join("");
		regExs[0].lastIndex=0;
		let exec=regExs[0].exec(txtS);
		let matched=(exec!==null);
		let indices=[];
		if (matched) {
			indices[0]={start:exec.index, end:regExs[0].lastIndex};
		}
		for (let j=1;matched&&(j<regExs.length);j++) {
			regExs[j].lastIndex=regExs[j-1].lastIndex;
			exec=regExs[j].exec(txtS);
			matched=(exec!==null);
			if (matched) {
				indices[j]={start:exec.index, end:regExs[j].lastIndex};
			}
		}
		let maxMatchScore=0;
		if (matched) {
			maxMatchScore=kipid.matchScoreFromIndices(txt, ptnSH, indices);
			let indicesMMS=[]; // indices of max match score
			for (let p=0;p<indices.length;p++) {
				indicesMMS[p]=indices[p]; // hard copy of indices
			}
			if (txt.length<512) {
				for (let k=indices.length-2;k>=0;) {
					regExs[k].lastIndex=indices[k].start+1;
					exec=regExs[k].exec(txtS);
					matched=(exec!==null);
					if (matched) {
						indices[k]={start:exec.index, end:regExs[k].lastIndex};
					}
					for (let j=k+1;matched&&(j<regExs.length);j++) {
						regExs[j].lastIndex=regExs[j-1].lastIndex;
						exec=regExs[j].exec(txtS);
						matched=(exec!==null);
						if (matched) {
							indices[j]={start:exec.index, end:regExs[j].lastIndex};
						}
					}
					if (matched) {
						let matchScore=kipid.matchScoreFromIndices(txt, ptnSH, indices);
						if (matchScore>maxMatchScore) {
							maxMatchScore=matchScore;
							indicesMMS=[];
							for (let p=0;p<indices.length;p++) {
								indicesMMS[p]=indices[p]; // hard copy of indices
							}
						}
						k=indices.length-2;
					}
					else {
						k--;
					}
				}
			}
			else {
				// Reverse match and compare only two results.
				regExsReversed[0].lastIndex=0;
				exec=regExsReversed[0].exec(txtSReversed);
				matched=(exec!==null);
				let indicesReversed=[];
				if (matched) {
					indicesReversed[0]={start:exec.index, end:regExsReversed[0].lastIndex};
				}
				for (let j=1;matched&&(j<regExsReversed.length);j++) {
					regExsReversed[j].lastIndex=regExsReversed[j-1].lastIndex;
					exec=regExsReversed[j].exec(txtSReversed);
					matched=(exec!==null);
					if (matched) {
						indicesReversed[j]={start:exec.index, end:regExsReversed[j].lastIndex};
					}
				}
				if (matched) {
					indices=[];
					for (let j=0;j<indicesReversed.length;j++) {
						let iR=indicesReversed[indicesReversed.length-1-j];
						indices[j]={start:(txtSReversed.length-iR.end), end:(txtSReversed.length-iR.start)};
					}
					let matchScore=kipid.matchScoreFromIndices(txt, ptnSH, indices);
					if (matchScore>maxMatchScore) {
						maxMatchScore=matchScore;
						indicesMMS=indices;
					}
				}
			}
			fs[0].push({i:listI.i, maxMatchScore:maxMatchScore, highlight:kipid.highlightStrFromIndices(txt, indicesMMS)});
		}
	}
	else {
		fs[0].push({i:listI.i, maxMatchScore:0});
	}}
	let sorted=fs[0].sorted=[];
	for (let i=0;i<fs[0].length;i++) {
		// sorted[i]=fs[0].length-1-i;
		// sorted[i]=i;
		sorted.push(i);
	}
	for (let i=1;i<sorted.length;i++) {
		let temp=sorted[i];
		let j=i;
		for (;(j>0)&&(fs[0][sorted[j-1]].maxMatchScore<fs[0][temp].maxMatchScore);j--) {
			sorted[j]=sorted[j-1];
		}
		sorted[j]=temp;
	}
	return fs[0];
};

$fuzzy_search.on("keydown", function(e) {
	e.stopPropagation();
	switch (e.keyCode) {
	case 27: // ESC=27
		e.preventDefault();
		$window.trigger({type:"keydown", keyCode:71}); // G=71
		break;
	case 38: // up=38
	case 40: // down=40
		e.preventDefault();
		let $fsl=$fuzzy_search_list;
		let $lis=$fsl.find(".list-item");
		let $liSelected=$fsl.find(".list-item.selected").eq(0);
		let $liTo=null;
		if ($liSelected.exists()) {
			if (e.keyCode===38) {
				$liTo=$liSelected.prev();
			}
			else {
				$liTo=$liSelected.next();
			}
			if ($liTo.exists()) {
				$liTo.eq(0).trigger("click");
				if ($liTo.offset().top<$fsl.offset().top+2) { // $liTo at upside of scroll.
					$fsl.scrollTop($fsl.scrollTop()+$liTo.offset().top-$fsl.offset().top-2);
				}
				else if ($liTo.offset().top+$liTo.outerHeight()>$fsl.offset().top+$fsl.height()+2) { // $liTo at downside of scroll.
					$fsl.scrollTop($fsl.scrollTop()+$liTo.offset().top+$liTo.outerHeight()-$fsl.offset().top-$fsl.height()-2);
				}
			}
		}
		else {
			if ($lis.exists()) {
				if (e.keyCode===38) {
					$liTo=$lis.last();
					$fsl.scrollTop($fsl[0].scrollHeight);
				}
				else {
					$liTo=$lis.first();
					$fsl.scrollTop(0);
				}
				$liTo.eq(0).trigger("click");
			}
		}
		break;
	}
});
kipid.gotoLi=function(e, elem, k, fs) {
if (e&&e.srcElement&&e.srcElement.nodeName=="A") {
}
else {
	let $elem=$(elem);
	if ($elem.hasClass("selected")) {
		$fuzzy_search.trigger({type:"keydown", keyCode:27}); // keyCode:27=ESC
	}
	else {
		fs.$fsLis.removeClass("selected");
		$elem.addClass("selected");
	}
	let $listI=fs.fullList[k].$listI;
	if ($listI) {
		if (!$listI.is(":visible")) {
			$listI.parents("*").show();
		}
		$window.scrollTop($listI.offset().top);
	}
}};
kipid.doFSGo=function(fs) {
	let fsPtnSH=kipid.splitHangul(fs.$fs.text().trim());
	if (fs[0].ptnSH.splitted!==fsPtnSH.splitted) {
		let res=kipid.fuzzySearch(fsPtnSH, fs);
		let sorted=res.sorted;
		let str="";
		for (let i=0;i<sorted.length;i++) {
			let k=res[sorted[i]].i;
			let fsFLk=fs.fullList[k];
			str+=`<div class="list-item" onclick="kipid.gotoLi(event,this,${k},kipid.fsGo)">${fsFLk.html}${res[sorted[i]].highlight!==undefined?`<div class="highlighted"><span class="maxMatchScore">${res[sorted[i]].maxMatchScore}</span> :: ${res[sorted[i]].highlight}</div>`:''}</div>`;
		}
		fs.$fsl.html(str);
		fs.$fsLis=fs.$fsl.find(".list-item");
	}
};
kipid.fsGoOn=function() {
	let now=Date.now();
	let passed=now-kipid.previous;
	if (passed>kipid.wait) {
		kipid.previous=now;
		kipid.doFSGo(kipid.fsGo);
	}
	else {
		$fuzzy_search.off("input.fs keyup.fs cut.fs paste.fs");
		setTimeout(function() {
			$fuzzy_search.on("input.fs keyup.fs cut.fs paste.fs", kipid.fsGoOn);
			kipid.previous=Date.now();
			kipid.doFSGo(kipid.fsGo);
		}, kipid.wait*1.1-passed);
	}
};
$fuzzy_search.on("input.fs keyup.fs cut.fs paste.fs", kipid.fsGoOn);

//////////////////////////////////////////
// Fuzzy search fullList
//////////////////////////////////////////
let $list=$(".docuK .p, .docuK .cmt, .docuK .bcf, .docuK li");
for (let i=0;i<$list.length;i++) {
	let $listI=$list.eq(i);
	let $sec=$listI.parents(".docuK>.sec");
	let txt="";
	let html="";
	if ($sec.exists()) {
		let cat=$sec.find("h2:first-child .head-txt").text();
		let $subsec=$listI.parents(".subsec");
		if ($subsec.exists()) {
			cat+="\n&nbsp; -- "+$subsec.find("h3:first-child .head-txt").text();
			let $subsubsec=$listI.parents(".subsubsec");
			if ($subsubsec.exists()) {
				cat+="\n&nbsp; &nbsp; -- "+$subsubsec.find("h4:first-child .head-txt").text();
			}
		}
		txt=cat.replace(/\n&nbsp; &nbsp;/g,"").replace(/\n&nbsp;/g,"")+"\n";
		html='<div class="cat">'+cat.replace(/\n/g, "<br>")+'</div>';
	}
	txt+="* "+$listI.text();
	html+=`<div class="li">* ${$listI.html().trim().replace(/\sid=/g,"\squasi-id=")}</div>`;
	kipid.fsGo.fullList[$list.length-1-i]={i:$list.length-1-i, txt:kipid.splitHangul(txt), html:html, $listI:$listI};
}

$fuzzy_search.trigger("keyup.fs");
$button_Go=$(".button-Go");
$button_log=$(".button-log");

// Scripts will be appended on this.
window.$headOrBody=$("head")||$("body")||$("#docuK-style");

window.onpopstate=function (e) {
	if (!!e.state) {
		if (e.state?.goOn!==kipid.goOn) {
			$window.trigger({type:'keydown', keyCode:'G'.charCodeAt(0)});
		}
		if (e.state?.logOn!==kipid.logOn) {
			$window.trigger({type:'keydown', keyCode:'K'.charCodeAt(0)});
		}
	}
};

// On ready.
$document.ready(function () {
	// Printing codes in <codeprint> with id (which starts with "code-") into <pre id="pre-code-...">.
	let codeprints=$("codeprint");
	for (let i=0;i<codeprints.length;i++) {
		let codeId=codeprints.eq(i).attr('id');
		if (codeId!==null&&codeId!==undefined&&codeId.startsWith("code-")) {
			kipid.printCode(codeId);
		}
	}

	// Hiding hiden sections.
	docuK.find(".sec.hiden").find(">.sec-contents").css({display:"none"});

	// Setting and Printing Styles
	kipid.$deviceInfo=docuK.find(".deviceInfo");

	let cookieItem;
	kipid.logPrint(`<br>`);

	cookieItem=kipid.docCookies.getItem("kipid.mode");
	if (cookieItem!==null) {
		kipid.Cmode(cookieItem);
		kipid.logPrint(`<br>Mode ${cookieItem} is set from cookie.`);
	} else {
		kipid.Cmode("Dark");
	}
	for(let i=1;i<kipid.docuK.length;i++) {
		$(`#button${i}-${kipid.mode}`).prop('checked', true);
	}

	cookieItem=kipid.docCookies.getItem("kipid.fontFamily");
	if (cookieItem!==null) {
		kipid.CfontFamily(cookieItem);
		kipid.logPrint(`<br>Font ${cookieItem} is set from cookie.`);
		for(let i=1;i<kipid.docuK.length;i++) {
			$(`#input${i}-font-family`)[0].value=kipid.fontFamily;
		}
	}

	cookieItem=kipid.docCookies.getItem("kipid.fontSize");
	if (cookieItem!==null) {
		kipid.CfontSize(Number(cookieItem)-10);
		kipid.logPrint(`<br>Font-size ${(Number(cookieItem)*1.8).toFixed(1)} is set from cookie.`);
	}

	cookieItem=kipid.docCookies.getItem("kipid.lineHeight10");
	if (cookieItem!==null) {
		kipid.ClineHeight(Number(cookieItem)-16);
		kipid.logPrint(`<br>Line-height ${(Number(cookieItem)/10).toFixed(1)} is set from cookie.`);
	}

	kipid.printDeviceInfo();
	kipid.logPrint(`<br><br>Current styles (dark/bright mode, font-family, font-size, line-height) are shown.`);

	// Initial Delayed Load.
	kipid.$delayedElems=$("[delayed-src], [delayed-bgimage], .to-be-executed");
	kipid.logPrint(`<br><br>There are ${kipid.$delayedElems.length} delayed elements.`);
	setTimeout(function () {
		$window.on("scroll.delayedLoad", kipid.delayedLoadByScroll);
		$window.trigger("scroll.delayedLoad");
	}, 2000);

	// Disqus js script
	if (!($("#disqus_thread").exists())) {
		($("body")||$("#docuK-script")).append(`<div id="disqus_thread"></div>`);
	}
	let $disqus_js=$(`<script id="disqus-js" defer src="https://kipid.disqus.com/embed.js" data-timestamp="${new Date()}"></`+`script>`); // Avoid closing script
	$headOrBody.append($disqus_js);
	kipid.logPrint(`<br><br>disqus.js with id="disqus-js" is loaded.`);

	// Kakao js script (from kakao.com CDN) is added.
	kipid.kakao_js_id='kakao-jssdk';
	if (!$(`#${kipid.kakao_js_id}`)) {
		let $kakao_js=$(`<script id="${kipid.kakao_js_id}" src="https://developers.kakao.com/sdk/js/kakao.js"></`+`script>`); // Avoid closing script
		$headOrBody.append($kakao_js);
	}
	kipid.logPrint(`<br><br>kakao.js with id="${kipid.kakao_js_id}" is loaded.`);
	kipid.kakaoInitDo=function () {
		if (typeof Kakao!=='undefined') {
			clearInterval(kipid.kakaoInit);
			if (!Kakao.isInitialized()) {
				Kakao.init('c85c800b54a2a95faa5ca7a5e3d357ef');
			}
			kipid.logPrint(`<br>Kakao.isInitialized()=${Kakao.isInitialized()};`);
		}
	};
	kipid.kakaoInit=setInterval(kipid.kakaoInitDo, 2000);

	kipid.popUpKakao=function () {
		let $desc=$("meta[name='description']");
		let href=window.location.href;
		Kakao.Share.sendDefault({
			objectType: 'feed',
			content: {
				title: $("title").html(),
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
		let $gcp=$(`<script id="prettyfy-js" defer src="https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js"></`+`script>`); // Avoid closing script
		$headOrBody.append($gcp);
		kipid.logPrint(`<br><br>Google code prettyfy.js is loaded since ".prettyprint" is there in your document.`);
	}

	// MathJax js script (from cdn.mathjax.org) is added.
	if (docuK.find('eq, eqq').exists()) {
		let $mjxConfig=$(`<script>
window.MathJax={
	startup: {
		typeset: false, // Skip startup typeset.
		ready: function () {
			kipid.logPrint('<br><br>MathJax is loaded, but not yet initialized.');
			MathJax.startup.defaultReady();
			kipid.logPrint('<br><br>MathJax is initialized, and the initial typeset is queued.');
		}
	},
	asciimath: {
		delimiters: [['$','$']] // AsciiMath to Jax
	},
	tex: {
		inlineMath: [['$','$'], ['\\\\(','\\\\)']], // Using $ for inline math.
		displayMath: [['$$','$$'], ['\\\\[','\\\\]']], // Using $$ for outline math.
		processEscapes: true, // Escape \\$
		processEnvironments: false // Ignore \\begin{something} ... \\end{something}
	},
	svg: {
		fontCache: 'global'
	}
};
</`+`script>`); // Avoid closing script
		$headOrBody.append($mjxConfig);
		let $mjx=$(`<script id="MathJax-script" defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></`+`script>`); // Avoid closing script
		$headOrBody.append($mjx);
		kipid.logPrint(`<br><br>MathJax.js (mathjax@3/es5/tex-chtml.js) is loaded since "&lt;eq&gt;, &lt;eqq&gt;" is there in your document.`);
		// MathJax PreProcess after the above MathJax.js is loaded.
		kipid.mathJaxPreProcessDo=function () {
			if (typeof (MathJax.startup)!=='undefined') {
				clearInterval(kipid.mathJaxPreProcess);
				MathJax.typeset();
			}
		};
		kipid.mathJaxPreProcess=setInterval(kipid.mathJaxPreProcessDo, 2000);
	}

	// ShortKeys (including default 'processShortcut(event)' of tistory.)
	kipid.fdList=$("#header,#content,#container,#wrapContent,.docuK .sec>h1,.docuK .sec>h2,.docuK .subsec>h3,.docuK .subsubsec>h4,div.comments,#disqus_thread,#aside"); // Ordered automatically by jQuery.
	kipid.tocs=$(".docuK>.sec").has(".toc");
	kipid.rras=$(".docuK>.sec").has("ol.refs");
	kipid.goOn=false;
	kipid.logOn=false;
	kipid.processShortKey=function(event) {
		if (event.altKey||event.ctrlKey||event.metaKey) return;
		switch (event.target&&event.target.nodeName) {
			case "INPUT": case "SELECT": case "TEXTAREA": return;
		}
		let scrollTop=null;
		let i, k;
		switch (event.keyCode) {
			case 71: // G=71
				event.preventDefault();
				if ($fuzzy_search_container.is(":visible")) {
					$fuzzy_search_container.hide();
					$out_focus.focus();
					$button_Go.removeClass("enabled");
					kipid.goOn=false;
					window.history.pushState({goOn:kipid.goOn, logOn:kipid.logOn}, "");
				}
				else {
					$fuzzy_search_container.show();
					$fuzzy_search.focus();
					$button_Go.addClass("enabled");
					kipid.goOn=true;
					window.history.pushState({goOn:kipid.goOn, logOn:kipid.logOn}, "");
				}
				break;
			case 75: // K=75
				event.preventDefault();
				if (kipid.$log.is(":visible")) {
					kipid.$log.hide();
					$out_focus.focus();
					$button_log.removeClass("enabled");
					kipid.logOn=false;
					window.history.pushState({goOn:kipid.goOn, logOn:kipid.logOn}, "");
				}
				else {
					kipid.$log.show();
					$button_log.addClass("enabled");
					kipid.logOn=true;
					window.history.pushState({goOn:kipid.goOn, logOn:kipid.logOn}, "");
				}
				break;
			case 70: // F=70
			case 68: // D=68
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
			case 84: // T=84
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
			case 82: // R=82
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
			case 76: // L=76
				if (window.location.pathname==="/entry/Lists") {
					window.location="/category";
				} else {
					window.location="/entry/Lists";
				}
				break;
			case 90: // Z=90
				if ($("div.comments").exists()) $window.scrollTop($("div.comments").offset().top);
				// kipid.HandleAhrefInComment();
				break;
			case 88: // X=88
				if ($("#disqus_thread").exists()) $window.scrollTop($("#disqus_thread").offset().top);
				break;
			default:
				if (window['processShortcut']!==undefined) {processShortcut(event);}
		}
	}
	$window.on("keydown", kipid.processShortKey);
	kipid.logPrint(`<br><br>New ShortKeys (T: Table of Contents, F: Forward Section, D: Previous Section, L: To 전체목록/[Lists]) are set.`);

	kipid.logPrint(`<br><br>kipid.delayPad=${kipid.delayPad};<br>kipid.wait=${kipid.wait};`);

	kipid.HandleAhrefInComment=function () {
		$("div.comments").find("p").each(function (i, elem) {
			$(elem).html(
				$(elem).html().replaceAll(/(https?:\/\/[^<>\s\t\n\r]+)/ig, function (match) {
					return `<a target="_blank" href="${match}">${kipid.escapeHTML(decodeURIComponent(match))}</a>`
				})
			);
		});
	};
	kipid.HandleAhrefInComment();

	// Closing docuK Log.
	kipid.logPrint(`<br><br><span class='emph'>docuK scripts are all done. Then this log is closing in 1.0 sec.</span>`);
	setTimeout(function () {kipid.$log.hide();}, 300);
});
})(window.kipid, jQuery);