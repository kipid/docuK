window.m={};
(function (m, $, undefined) {
$window=$(window);
$document=$(document);
$html=$("html");

$.fn.exists=function () { return this.length!==0; };
m.browserWidth=window.innerWidth;
const docuK=$(".docuK");
m.docuK=docuK;

m.getSearchVars=function (searchStr) {
	let vars=[];
	if (searchStr!==null&&searchStr!==undefined&&searchStr.length!==0) {
		if (searchStr.startsWith("?")) { searchStr=searchStr.substring(1); }
		let j=searchStr.indexOf("#");
		if (j!==-1) { searchStr=searchStr.substring(0,j); }
		let splits=searchStr.replace(/&amp;/ig,"&").split("&");
		for (let i=0;i<splits.length;i++) {
			let key=splits[i];
			let value="";
			let k=key.indexOf("=");
			if (k!==-1) {
				value=decodeURIComponent(key.substring(k+1));
				key=key.substring(0,k);
			}
			key=decodeURIComponent(key);
			vars[i]=vars[key]={key:key, val:value};
		}
	}
	return vars;
};

m.fsToRs=[];
////////////////////////////////////////////////////
// URI rendering :: http link itself, videos, images, maps.
////////////////////////////////////////////////////
m.ptnURI=[];
m.ptnURL=/^https?:\/\/\S+/i;
m.ptnTag=/^<\w+[\s\S]+>$/i;
m.ptnVal=/^([0-9]+(?:\.[0-9]+)?)\/([0-9]+(?:\.[0-9]+)?)$/;

m.uriToA=function (uri) {
	if (!uri||uri.constructor!==String) { return ""; }
	let exec=m.ptnURL.exec(uri);
	if (exec!==null) {
		return `<a target="_blank" href="${exec[0]}">${m.escapeHTML(decodeURIComponent(uri))}</a>`;
	}
	else {
		return m.escapeHTML(uri);
	}
};
m.videoZIndex=10000;
m.togglePosition=function (elem) {
	let $elem=$(elem);
	let $parent=$elem.parents(".rC");
	if ($parent.hasClass("fixed")) {
		$parent.removeClass("fixed");
		$parent.css("z-index", 0);
		window.scrollTo(0, $parent.offset().top);
		$elem.text("▲ [--stick to the left top--]");
		m.fsToRs.fixed=false;
	}
	else {
		$parent.addClass("fixed");
		$parent.css("z-index", m.videoZIndex--);
		window.scrollBy(0, -$parent.height());
		$elem.text("▲ [--return to the original position--]");
		m.fsToRs.fixed=true;
	}
};
m.rC=function (elemStr, option, id, noPc) {
	return `<div class="rC${(option?` ${option}`:'')}"${!!id?` id="${id}"`:""}><div class="rSC">${elemStr}</div>${noPc?"":`<div class="pc"><span onclick="m.togglePosition(this)">▲ [--stick to the left top--]</span></div>`}</div>`;
};
m.YTiframe=function (v, inListPlay) {
	return m.rC(`<iframe delayed-src="https://www.youtube.com/embed/${v}?origin=https://recoeve.net" frameborder="0" allowfullscreen="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>`, (inListPlay&&m.fsToRs.fixed?"fixed":null));
};

let ptnURI;
ptnURI=m.ptnURI["www.youtube.com"]=m.ptnURI["youtube.com"]=m.ptnURI["youtu.be"]=m.ptnURI["m.youtube.com"]={};
ptnURI.regEx=/^(?:watch|embed\/([\w-]+))(\?\S+)?/i;
ptnURI.regEx1=/^shorts\/([\w-]+)/i;
ptnURI.regEx2=/^([\w-]+)(\?\S+)?/i;
ptnURI.regEx3=/^watch(\?\S+)/i;
ptnURI.toIframe=function (uriRest, inListPlay, toA) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI["www.youtube.com"].regEx.exec(uriRest);
	if (exec!==null) {
		let vars=null;
		if (exec[2]) { vars=m.getSearchVars(exec[2]); }
		let v=null;
		if (exec[1]) {
			v=exec[1];
		}
		else if (vars&&vars.v) {
			v=vars.v.val;
		}
		if (v) {
			let list=vars?.list?.val;
			return resolve({html:(toA?`<a target="_blank" href="https://www.youtube.com/watch?v=${v}${list?`&list=${list}`:""}">https://www.youtube.com/watch?v=${v}${list?`&list=${list}`:""}</a><br>`:"")+m.YTiframe(v, inListPlay), from:"youtube", videoId:v, list});
		}
	}
	else {
		exec=m.ptnURI["www.youtube.com"].regEx1.exec(uriRest);
		if (exec!==null) {
			let v=exec[1];
			if (v) {
				return resolve({html:(toA?`<a target="_blank" href="https://www.youtube.com/watch?v=${v}">https://www.youtube.com/watch?v=${v}</a><br>`:"")+m.YTiframe(v, inListPlay), from:"youtube", videoId:v});
			}
		}
		else {
			exec=m.ptnURI["youtu.be"].regEx2.exec(uriRest);
			if (exec!==null) {
				let vars=null;
				if (exec[2]) {
					vars=m.getSearchVars(exec[2]);
				}
				let list=vars?.list?.val;
				return resolve({html:(toA?`<a target="_blank" href="https://www.youtube.com/watch?v=${v}${list?`&list=${list}`:""}">https://www.youtube.com/watch?v=${v}${list?`&list=${list}`:""}</a><br>`:"")+m.YTiframe(exec[1], inListPlay), from:"youtube", videoId:exec[1], list});
			}
			else {
				exec=m.ptnURI["m.youtube.com"].regEx3.exec(uriRest);
				if (exec!==null) {
					let vars=m.getSearchVars(exec[1]);
					let v=vars?.v?.val;
					if (v) {
						let list=vars?.list?.val;
						return resolve({html:(toA?`<a target="_blank" href="https://www.youtube.com/watch?v=${v}${list?`&list=${list}`:""}">https://www.youtube.com/watch?v=${v}${list?`&list=${list}`:""}</a><br>`:"")+m.YTiframe(v, inListPlay), from:"youtube", videoId:v});
					}
				}
			}
		}
	}
	return resolve(false);
});
};

ptnURI=m.ptnURI["instagram.com"]=m.ptnURI["www.instagram.com"]={};
ptnURI.regEx=/^(?:p|tv|reel)\/([\w-]+)/i;
ptnURI.toIframe=function (uriRest, inListPlay, toA) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI["instagram.com"].regEx.exec(uriRest);
	if (exec!==null) {
		return resolve({html:(toA?`<a target="_blank" href="https://www.instagram.com/p/${exec[1]}/">https://www.instagram.com/p/${exec[1]}/</a><br>`:"")+m.rC(`<div class="center"><iframe delayed-src="https://www.instagram.com/p/${exec[1]}/embed" frameborder="0" scrolling="auto" allowtransparency="true"></iframe></div>`, "instagram", null, true), from:"instagram", imgId:exec[1]});
	}
	else {
		return resolve(false);
	}
});
};

ptnURI=m.ptnURI["www.tiktok.com"]={};
ptnURI.regEx=/^@(\S+)\/video\/([0-9]+)/i;
ptnURI.toIframe=function (uriRest, inListPlay, toA) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI["www.tiktok.com"].regEx.exec(uriRest);
	if (exec!==null) {
		return resolve({html:(toA?`<a target="_blank" href="https://www.tiktok.com/@${exec[1]}/video/${exec[2]}">https://www.tiktok.com/@${exec[1]}/video/${exec[2]}</a><br>`:"")+m.rC(`<div class="center"><iframe sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts allow-top-navigation allow-same-origin" delayed-src="https://www.tiktok.com/embed/v2/${exec[2]}?referrer=${encodeURIComponent(window.location.href)}" frameborder="no" scrolling="auto"></iframe></div>`, "tiktok", null, true), from:"tiktok", userId:exec[1], videoId:exec[2]});
	}
	else {
		return resolve(false);
	}
});
};

ptnURI=m.ptnURI["vt.tiktok.com"]={};
ptnURI.regEx=/^(\w+)\//i;
ptnURI.toIframe=function (uriRest, inListPlay, toA) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI["vt.tiktok.com"].regEx.exec(uriRest);
	if (exec!==null) {
		let shortURI=`https://vt.tiktok.com/${exec[1]}/`;
		$.ajax({
			type:"POST", url:"https://recoeve.net/BlogStat/getFullURI", data:shortURI, dataType:"text"
		}).fail(function (resp) {
			resolve(resp);
			// throw new Error("Failed to expand TikTok URL");
		}).done(async function (resp) {
			let uriRendered=await uriRendering(resp, toA, inListPlay);
			uriRendered.newURI=resp;
			resolve(uriRendered);
		});
	}
});
};

ptnURI=m.ptnURI["tv.naver.com"]={};
ptnURI.regEx=/^(?:v|embed)\/([0-9]+)/i;
ptnURI.toIframe=function (uriRest, inListPlay, toA) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI["tv.naver.com"].regEx.exec(uriRest);
	if (exec!==null) {
		return resolve({html:(toA?`<a target="_blank" href="https://tv.naver.com/v/${exec[1]}">https://tv.naver.com/v/${exec[1]}</a><br>`:"")+m.rC(`<iframe delayed-src="https://tv.naver.com/embed/${exec[1]}?autoPlay=false" frameborder="no" scrolling="auto" marginwidth="0" marginheight="0" allowfullscreen></iframe>`, (inListPlay&&m.fsToRs.fixed?"fixed":null)), from:"naver", videoId:exec[1]});
	}
	else {
		return resolve(false);
	}
});
};

ptnURI=m.ptnURI["weverse.io"]={};
ptnURI.regEx=/^(\S+)\/artist\/([0-9\-]+)/i;
ptnURI.toIframe=function (uriRest, inListPlay, toA) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI["weverse.io"].regEx.exec(uriRest);
	if (exec!==null) {
		return resolve({html:(toA?`<a target="_blank" href="https://weverse.io/${exec[1]}/artist/${exec[2]}">https://weverse.io/${exec[1]}/artist/${exec[2]}</a><br>`:"")+m.rC(`<iframe src="https://weverse.io/${exec[1]}/artist/${exec[2]}" frameborder="no" scrolling="auto" marginwidth="0" marginheight="0" allowfullscreen></iframe>`, (inListPlay&&m.fsToRs.fixed?"fixed":null)), from:"weverse", singer:exec[1] ,videoId:exec[2]});
	}
	else {
		return resolve(false);
	}
});
};

ptnURI=m.ptnURI["tv.kakao.com"]=m.ptnURI["entertain.daum.net"]={};
ptnURI.regEx=/(?:v|cliplink)\/([0-9]+)/i;
ptnURI.regEx1=/video\/([0-9]+)/i;
ptnURI.toIframe=function (uriRest, inListPlay, toA) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI["tv.kakao.com"].regEx.exec(uriRest);
	if (exec!==null) {
		return resolve({html:(toA?`<a target="_blank" href="https://tv.kakao.com/v/${exec[1]}">https://tv.kakao.com/v/${exec[1]}</a><br>`:"")+m.rC(`<iframe delayed-src="https://play-tv.kakao.com/embed/player/cliplink/${exec[1]}" frameborder="0" scrolling="auto" allowfullscreen></iframe>`, (inListPlay&&m.fsToRs.fixed?"fixed":null)), from:"kakao", videoId:exec[1]});
	}
	else {
		exec=m.ptnURI["entertain.daum.net"].regEx1.exec(uriRest);
		if (exec!==null) {
			return resolve({html:(toA?`<a target="_blank" href="https://tv.kakao.com/v/${exec[1]}">https://tv.kakao.com/v/${exec[1]}</a><br>`:"")+m.rC(`<iframe delayed-src="https://play-tv.kakao.com/embed/player/cliplink/${exec[1]}" frameborder="0" scrolling="auto" allowfullscreen></iframe>`, (inListPlay&&m.fsToRs.fixed?"fixed":null)), from:"kakao", videoId:exec[1]});
		}
		else {
			return resolve(false);
		}
	}
});
};

ptnURI=m.ptnURI["tvpot.daum.net"]={};
ptnURI.regEx=/^v\/([\w-]+)/i;
ptnURI.toIframe=function (uriRest, inListPlay, toA) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI["tvpot.daum.net"].regEx.exec(uriRest);
	if (exec!==null) {
		return resolve({html:(toA?`<a target="_blank" href="https://tvpot.daum.net/v/${exec[1]}">https://tvpot.daum.net/v/${exec[1]}</a><br>`:"")+m.rC(`<iframe delayed-src="https://videofarm.daum.net/controller/video/viewer/Video.html?vid=${exec[1]}${exec[1].length<15?'$':''}&play_loc=undefined" frameborder="0" scrolling="auto"></iframe>`, (inListPlay&&m.fsToRs.fixed?"fixed":null)), from:"daum", videoId:exec[1]});
	}
	return resolve(false);
});
};

ptnURI=m.ptnURI["vimeo.com"]={};
ptnURI.regEx=/^([0-9]+)/i;
ptnURI.toIframe=function (uriRest, inListPlay, toA) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI["vimeo.com"].regEx.exec(uriRest);
	if (exec!==null) {
		return resolve({html:(toA?`<a target="_blank" href="https://vimeo.com/${exec[1]}">https://vimeo.com/${exec[1]}</a><br>`:"")+m.rC(`<iframe delayed-src="https://player.vimeo.com/video/${exec[1]}" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>`, (inListPlay&&m.fsToRs.fixed?"fixed":null)), from:"vimeo", videoId:exec[1]});
	}
	else {
		return resolve(false);
	}
});
};

ptnURI=m.ptnURI["www.dailymotion.com"]={};
ptnURI.regEx=/video\/(\w+)/i;
ptnURI.toIframe=function (uriRest, inListPlay, toA) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI["www.dailymotion.com"].regEx.exec(uriRest);
	if (exec!==null) {
		return resolve({html:(toA?`<a target="_blank" href="https://www.dailymotion.com/video/${exec[1]}">https://www.dailymotion.com/video/${exec[1]}</a><br>`:"")+m.rC(`<iframe delayed-src="https://www.dailymotion.com/embed/video/${exec[1]}" frameborder="0" allowfullscreen></iframe>`, (inListPlay&&m.fsToRs.fixed?"fixed":null)), from:"dailymotion", videoId:exec[1]});
	}
	else {
		return resolve(false);
	}
});
};

ptnURI=m.ptnURI["www.ted.com"]=m.ptnURI["embed.ted.com"]={};
ptnURI.regEx=/^talks\/(\S+)/i;
ptnURI.toIframe=function (uriRest, inListPlay, toA) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI["www.ted.com"].regEx.exec(uriRest);
	if (exec!==null) {
		uriRest=uriRest.substring(6);
		let k=uriRest.indexOf("?");
		let vars=null;
		if (k!==-1) {
			vars=m.getSearchVars(uriRest.substring(k));
			uriRest=uriRest.substring(0,k);
		}
		let v=uriRest;
		if (vars?.language) {
			uriRest="lang/"+vars.language.val+"/"+uriRest;
		}
		return resolve({html:(toA?`<a target="_blank" href="https://www.ted.com/${exec[1]}">https://www.ted.com/${exec[1]}</a><br>`:"")+m.rC(`<iframe delayed-src="https://embed.ted.com/talks/${uriRest}" frameborder="0" scrolling="auto" allowfullscreen></iframe>`, (inListPlay&&m.fsToRs.fixed?"fixed":null)), from:"ted", videoId:v});
	}
	else {
		return resolve(false);
	}
});
};

ptnURI=m.ptnURI["w.soundcloud.com"]={};
ptnURI.regEx=/^player\/(\?\S+)/i;
ptnURI.toIframe=function (uriRest, inListPlay, toA) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI["w.soundcloud.com"].regEx.exec(uriRest);
	if (exec!==null) {
		let vars=m.getSearchVars(exec[1]);
		let lastPath="player/?";
		for (let i=0;i<vars.length;i++) {
			if (vars[i].key==="auto_play") {
				lastPath+="auto_play=false&";
			}
			else {
				lastPath+=vars[i].key+"="+vars[i].val+"&";
			}
		}
		return resolve({html:(toA?`<a target="_blank" href="https://w.soundcloud.com/${exec[1]}">https://w.soundcloud.com/${exec[1]}</a><br>`:"")+m.rC(`<iframe delayed-src="https://w.soundcloud.com/${lastPath.substring(0,lastPath.length-1)}" scrolling="auto" frameborder="no"></iframe>`, (inListPlay&&m.fsToRs.fixed?"fixed soundcloud":"soundcloud")), from:"soundcloud", videoId:vars?.url?.val});
	}
	else {
		return resolve(false);
	}
});
};

ptnURI=m.ptnURI[0]={};
ptnURI.regEx=/^https?:\/\/\S+\.(?:jpg|jpeg|bmp|gif|png|webp|svg|tif)(?=$|\?|\s)/i;
ptnURI.toIframe=function (uri, inListPlay, toA) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI[0].regEx.exec(uri);
	if (exec!==null) {
		return resolve({html:(toA?`<a target="_blank" href="${exec[0]}">${m.escapeHTML(decodeURIComponent(uri))}</a><br>`:"")+m.rC(`<div class="center"><img delayed-src="${exec[0]}"/></div>`, (inListPlay&&m.fsToRs.fixed?"fixed eveElse":"eveElse")), from:'image', src:exec[0]});
	}
	else {
		return resolve(false);
	}
});
};

ptnURI=m.ptnURI[1]={};
ptnURI.regEx=/^https?:\/\/\S+\.(?:mp4|ogg|webm)(?=$|\?|\s)/i;
ptnURI.toIframe=function (uri, inListPlay, toA) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI[1].regEx.exec(uri);
	if (exec!==null) {
		return resolve({html:(toA?`<a target="_blank" href="${exec[0]}">${m.escapeHTML(decodeURIComponent(uri))}</a><br>`:"")+m.rC(`<video controls preload="auto" delayed-src="${exec[0]}"></video>`, (inListPlay&&m.fsToRs.fixed?"fixed":null)), from:'video', src:exec[0]});
	}
	else {
		return resolve(false);
	}
});
};

ptnURI=m.ptnURI[2]={};
ptnURI.regEx=/^https?:\/\/kr[\d]+\.sogirl\.so(\/\S*)?/i;
ptnURI.regEx1=/^https?:\/\/kr[\d]+\.sogirl\.co(\/\S*)?/i;
ptnURI.toIframe=function (uri, inListPlay) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI[2].regEx.exec(uri);
	if (exec!==null) {
		return resolve({html:`<a target="_blank" href="https://kr56.sogirl.so${exec[1]?exec[1]:"/"}">${m.escapeHTML(decodeURIComponent(`https://kr56.sogirl.so${exec[1]?exec[1]:"/"}`))}</a>`, from:'sogirl', src:exec[1]});
	}
	else {
		exec=m.ptnURI[2].regEx1.exec(uri);
		if (exec!==null) {
			return resolve({html:`<a target="_blank" href="https://kr56.sogirl.so${exec[1]?exec[1]:"/"}">${m.escapeHTML(decodeURIComponent(`https://kr56.sogirl.so${exec[1]?exec[1]:"/"}`))}</a>`, from:'sogirl', src:exec[1]});
		}
		else {
			return resolve(false);
		}
	}
});
};

ptnURI=m.ptnURI[3]={};
ptnURI.regEx=/^https?:\/\/kr[\d]+\.topgirl\.co(?:(\/[\s\S]*))?/i;
ptnURI.toIframe=function (uri, inListPlay) {
return new Promise(function (resolve, reject) {
	let exec=m.ptnURI[3].regEx.exec(uri);
	if (exec!==null) {
		return resolve({html:`<a target="_blank" href="https://kr25.topgirl.co${exec[1]?exec[1]:"/"}">${m.escapeHTML(decodeURIComponent(`https://kr25.topgirl.co${exec[1]?exec[1]:"/"}`))}</a>`, from:'topgirl', src:exec[1]});
	}
	else {
		return resolve(false);
	}
});
};

window.uriRendering=function (uri, toA, inListPlay) {
return new Promise(async function (resolve, reject) {
	if (uri?.constructor===String) {
		if (uri.length>6) {
			if (uri.substring(0,4).toLowerCase()==="http") {
				let k=4;
				if (uri.charAt(k).toLowerCase()==='s') {
					k++;
				}
				if (uri.substring(k,k+3)==="://") {
					k+=3;
					let l=uri.indexOf('/',k);
					let uriHost=null;
					let uriRest='';
					if (l===-1) {
						uriHost=uri.substring(k);
					}
					else {
						uriHost=uri.substring(k,l);
						uriRest=uri.substring(l+1);
					}
					if (m.ptnURI[uriHost]) {
						let promise=m.ptnURI[uriHost].toIframe(uriRest, inListPlay, toA);
						let result=await promise;
						promise.then(function (result) {
							if (result!==false&&(!result.list)) {
								return resolve(result);
							}
						});
					}
				}
			}
			for (let i=0;i<m.ptnURI.length;i++) {
				let promise=m.ptnURI[i].toIframe(uri, inListPlay, toA); // img or video
				let result=await promise;
				promise.then(function (result) {
					if (result!==false) {
						return resolve(result);
					}
				});
			}
			if (toA) {
				return resolve({html:m.uriToA(uri)});
			}
		}
		else {
			return resolve({html:m.escapeHTML(uri)});
		}
	}
	return resolve({html:""});
});
};



// cookies.js (copied from cookie-test.html)
m.expire=365*24*60*60; // max-age in seconds.
m.docCookies={
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

m.toggleFK=function () {
	if ($floating_key.is(":visible")) {
		m.docCookies.setItem("hideFK", "y", Infinity, "/", false, true);
	}
	else {
		m.docCookies.removeItem("hideFK", "/", false, true);
	}
	$floating_key.toggle();
};

m.promoting=function (id) {
	return `<div class="promoting"${id?` id="${id}"`:""}>
<div class="p">* 홍보/Promoting <span style="color:rgb(255,180,180)">Reco</span><span style="color:rgb(100,100,255)">eve</span>.net (3S | Slow/Sexy/Sincere SNS)</div>
<div class="bcf">
<a target="_blank" href="https://recoeve.net/user/kipid/mode/multireco?cat=%5BMusic%2FBreak%5D--K-Pop&lang=ko#headPlay">유튜브 음악 MV 들을 광고없이 목록재생</a> 해보세요.<br>
접속하셔서 별점만 드레그 하시면 자신의 페이지에 저장 됩니다.<br>
그리고 자신의 페이지로 이동한 뒤 추천 받기 (단축키 R) 를 누르시면 자신이 점수 메긴것들로 이웃 (이웃보기 단축키 B) 을 자동으로 찾아주고 그 이웃들로부터 추천을 받을 수 있습니다.<br>
<br>
Come <a target="_blank" href="https://recoeve.net/user/kipid/mode/multireco?cat=%5BMusic%2FBreak%5D--Pop&lang=en#headPlay">here</a> and just drag stars/points.<br>
Based on your points on URIs (musics), you will be connected to your neighbors (See neighbors: shortkey 'B') of your kind. And you will get recoms (recommendations: shortkey 'R') from them, and also give recoms to them.
</div>
<div class="bcf">
<span class="bold">평가와 기록</span>: 웹사이트에서 본 기사, 뉴스, 영상, 음악 등을 기록하고 평가하세요. 이 정보는 추천 알고리즘을 통해 사용자에게 맞춤형 추천을 제공하는 데 사용됩니다. 즉, 당신이 좋아하는 유형의 콘텐츠를 더 많이 발견할 수 있습니다.<br>
<br>
<span class="bold">Evaluate and Rate Content</span>: As you explore content on the platform, you can evaluate and rate it based on your preferences and interests. This could involve liking, rating, or commenting on articles, posts, or other types of content.<br>
<br>
<span class="bold">Connect with Like-Minded Users</span>: The platform likely has features for connecting with other users who share your interests. You might follow or connect with these users to build your network.
</div>
<div class="caption p cmt" style="margin:1em 0 0">
* For the usage examples, visit my page (예제를 보시려면 제 페이지를 방문해 주세요.)
<ul>
<li><a target="_blank" href="https://recoeve.net/user/kipid/mode/multireco?cat=%5BMusic%2FBreak%5D--K-Pop#headPlay">[Music/Break]--K-Pop of kipid's Recoeve.net (Multireco mode)</a></li>
<li><a target="_blank" href="https://recoeve.net/user/kipid/mode/multireco?cat=%5BMusic%2FBreak%5D--Pop#headPlay">[Music/Break]--Pop of kipid's Recoeve.net (Multireco mode)</a></li>
<li><a target="_blank" href="https://recoeve.net/user/kipid/mode/multireco?cat=%5BMusic%2FBreak%5D--%EB%82%A8%EA%B7%9C%EB%A6%AC#headPlay">[Music/Break]--남규리 | Nam Gyuri (Actor of Korea) of kipid's Recoeve.net (Multireco mode)</a></li>
<li><a target="_blank" href="https://recoeve.net/user/kipid/mode/multireco?cat=%5BMy%20Blog%5D--%5BMusic%2FBreak%5D--%EC%B8%84%EC%B8%84#headPlay">[My Blog]--[Music/Break]--츄츄 (My Pet) of kipid's Recoeve.net (Multireco mode)</a></li>
<li><a target="_blank" href="https://recoeve.net/user/kipid?cat=%5BPhysics%2FMath%2FScience%5D--Physics&lang=ko&PRL=0.80&PRR=1.00#headPlay">[Physics/Math/Science]--Physics of kipid's Recoeve.net</a></li>
<li><a target="_blank" href="https://recoeve.net/user/kipid?cat=%5B%EC%9D%8C%EC%8B%9D%2F%EC%9A%94%EB%A6%AC%2F%EA%B1%B4%EA%B0%95%5D--%EA%B1%B4%EA%B0%95&lang=ko&PRL=0.80&PRR=1.00#headPlay">[음식/요리/건강]--건강 of kipid's Recoeve.net</a></li>
</ul>
</div>
<div class="caption p cmt" style="margin:1em 0 0">Recoeve.net Manual collection | 사용방법 모음집: <a class="wheat" target="_blank" href="https://recoeve.net/user/kipid?cat=%5BRecoeve%5D--%EC%84%A4%EB%AA%85%EC%84%9C&PRL=0.85&PRR=1.00#headPlay">[Recoeve]--설명서 | Manuals of kipid's Recoeve.net</a></div>
<div class="p bcf">Kakao talk open chat (카카오톡 오픈 채팅방) :: <a class="wheat" target="_blank" href="https://open.kakao.com/me/kipid">open.kakao.com :: Recoeve.net 개발 관련</a></div>
<div class="caption p cmt" style="margin:1em 0 0">Recoeve manual, How to use. (레코이브 사용 설명서, 가입하기, 다른 사람 페이지에서 multireco 하기, 내 페이지에서 자동으로 연결된 이웃들로부터 추천받기.)
<div class="p rC"><div class="rSC">
	<iframe delayed-src="https://www.youtube.com/embed/YGadSrC2UXw" frameborder="0"></iframe>
</div></div></div>
<div class="caption p cmt" style="margin:1em 0 0">Recoeve.net 유튜브 뮤비들 목록 재생하기, Playing Youtube MV (Music Videos) playlist.
<div class="p rC"><div class="rSC">
	<iframe delayed-src="https://www.youtube.com/embed/t5Uc8Uyau38" frameborder="0"></iframe>
</div></div></div>
</div>`;
};

// logPrint function.
m.$log=$("#docuK-log");
m.$log.addClass("fixed");
m.$log.before(`<div id="floating-key">
	<div id="button-hideFK" class="button" onclick="m.toggleFK()">▼ Hid<span class="bold underline">e</span></div>
	<div class="button button-Go" style="width:4.5em; border-right:none" onclick="$window.trigger({type:'keydown', keyCode:'G'.charCodeAt(0)})">
		<span class="bold underline">G</span>o (FS)
	</div>
	<div class="button" style="width:4.5em" onclick="$window.trigger({type:'keydown', keyCode:'T'.charCodeAt(0)})">
		<span class="bold underline">T</span>ofC
	</div>
	<div class="button button-log" onclick="$window.trigger({type:'keydown', keyCode:'K'.charCodeAt(0)})">
		Docu<span class="bold underline">K</span> Log
	</div>
	<div class="button" onclick="$window.trigger({type:'keydown', keyCode:'D'.charCodeAt(0)})">
		Backwar<span class="bold underline">d</span>
	</div>
	<div class="button" onclick="$window.trigger({type:'keydown', keyCode:'F'.charCodeAt(0)})">
		<span class="bold underline">F</span>orward
	</div>
	<div class="button" style="width:4.5em; border-right:none" onclick="$window.trigger({type:'keydown', keyCode:'R'.charCodeAt(0)})">
		<span class="bold underline">R</span>RA
	</div>
	<div class="button" style="width:4.5em" onclick="$window.trigger({type:'keydown', keyCode:'L'.charCodeAt(0)})">
		<span class="bold underline">L</span>ists
	</div>
	<div class="button" style="width:4.5em; border-right:none" onclick="$window.trigger({type:'keydown', keyCode:'Z'.charCodeAt(0)})">
		Cmt<span class="bold underline">Z</span>
	</div>
	<div class="button" style="width:4.5em" onclick="$window.trigger({type:'keydown', keyCode:'X'.charCodeAt(0)})">
		Cmt<span class="bold underline">X</span>
	</div>
	<div class="button" onclick="$window.trigger({type:'keydown', keyCode:'H'.charCodeAt(0)})">
		<span class="bold underline">H</span>andle CmtZ
	</div>
	${m.docCookies.hasItem("REACTION_GUEST")?`<div class="button" onclick="$window.trigger({type:'keydown', keyCode:'I'.charCodeAt(0)})">
		Log <span class="bold underline">i</span>n
	</div>`:`<div class="button" onclick="$window.trigger({type:'keydown', keyCode:'O'.charCodeAt(0)})">
		Log <span class="bold underline">o</span>ut
	</div>`}
	<div id="SNS-floating"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/link.png" onclick="m.shareSNS('link')"><img class="SNS-img" src="https://tistory2.daumcdn.net/tistory/1468360/skin/images/icon-Twitter.png" onclick="m.shareSNS('twitter')"><img class="SNS-img" src="https://tistory2.daumcdn.net/tistory/1468360/skin/images/icon-Facebook.png" onclick="m.shareSNS('facebook')"><img class="SNS-img" src="https://tistory3.daumcdn.net/tistory/1468360/skin/images/icon-Recoeve.png" onclick="m.shareSNS('recoeve')"><img class="SNS-img" src="https://tistory2.daumcdn.net/tistory/1468360/skin/images/icon-Kakao.png" onclick="m.shareSNS('kakao')"></div></div><div class="button" id="toggle-floating-key" onclick="m.toggleFK()">▲</div>`);
$floating_key=$("#floating-key");
if (m.docCookies.getItem("hideFK")==="y") {
	$floating_key.hide();
}
m.$log.html(`<div class="exit" onclick="$window.trigger({type:'keydown', keyCode:'K'.charCodeAt(0)})"><svg><g style="stroke:white;stroke-width:23%"><line x1="20%" y1="20%" x2="80%" y2="80%"></line><line x1="80%" y1="20%" x2="20%" y2="80%"></line></g>✖</svg></div>`);
m.logPrint=function (str) {
	m.$log.append(str);
	m.$log.scrollTop(m.$log[0].scrollHeight);
};
m.logPrint(`m.logPrint() is working!`);
m.$log.after(`<div id="fuzzy-search-container" style="display:none">
	<div class="move" style="z-index:20000; position:absolute; display:inline-block; left:0; top:0; width:1.8em; height:1.8em; line-height:1.0; text-align:center; cursor:pointer; border:2px rgb(80, 80, 80) solid; background-color:rgb(30,30,30); color:white"><svg style="display:inline-block; width:100%; height:100%"><g style="stroke:white; stroke-width:10%; stroke-linecap:round">
		<line x1="10%" y1="50%" x2="90%" y2="50%"></line>
		<line x1="10%" y1="50%" x2="20%" y2="40%"></line>
		<line x1="10%" y1="50%" x2="20%" y2="60%"></line>
		<line x1="80%" y1="40%" x2="90%" y2="50%"></line>
		<line x1="80%" y1="60%" x2="90%" y2="50%"></line>
		<line x1="50%" y1="10%" x2="50%" y2="90%"></line>
		<line x1="50%" y1="10%" x2="40%" y2="20%"></line>
		<line x1="50%" y1="10%" x2="60%" y2="20%"></line>
		<line x1="40%" y1="80%" x2="50%" y2="90%"></line>
		<line x1="60%" y1="80%" x2="50%" y2="90%"></line>
	</g></svg></div>
	<div id="fuzzy-search" contenteditable="true"></div>
	<div id="fuzzy-search-list"></div>
	<div class="reset" style="z-index:20000; position:absolute; display:inline-block; right:1.8em; top:0; width:1.8em; height:1.8em; line-height:1.0; text-align:center; cursor:pointer; border:2px rgb(80, 80, 80) solid; background-color:rgb(30,30,30); color:white"><svg style="display:inline-block; width:100%; height:100%"><g style="stroke:white; stroke-width:10%; stroke-linecap:round">
		<line x1="20%" y1="30%" x2="80%" y2="30%"></line>
		<line x1="80%" y1="30%" x2="80%" y2="70%"></line>
		<line x1="80%" y1="70%" x2="20%" y2="70%"></line>
		<line x1="20%" y1="70%" x2="30%" y2="60%"></line>
		<line x1="20%" y1="70%" x2="30%" y2="80%"></line>
	</g></svg></div>
	<div class="exit" onclick="$window.trigger({type:'keydown', keyCode:'G'.charCodeAt(0)})"><svg><g style="stroke:white;stroke-width:23%"><line x1="20%" y1="20%" x2="80%" y2="80%"></line><line x1="80%" y1="20%" x2="20%" y2="80%"></line></g>✖</svg></div>
</div>
<div id="out-focus" class="none">out focus</div>`);

$out_focus=$("#out-focus");
$fuzzy_search_container=$("#fuzzy-search-container");
$fuzzy_search_container_move=$("#fuzzy-search-container>.move");
$fuzzy_search=$("#fuzzy-search");
$fuzzy_search_list=$("#fuzzy-search-list");

$fuzzy_search_container_move.on("mousedown.move touchstart.move", function (e) {
	let touch0=(e.type==='touchstart')?e.originalEvent.touches[0]:e;
	let relativeX=touch0.clientX-Math.round($fuzzy_search_container_move.offset().left)+$window.scrollLeft();
	let relativeY=touch0.clientY-Math.round($fuzzy_search_container_move.offset().top)+$window.scrollTop();
	$html.on("mousemove.move touchmove.move", function (e) {
		window.getSelection().removeAllRanges();
		e.preventDefault();
		e.stopPropagation();
		let touch0=(e.type==='touchmove')?e.originalEvent.touches[0]:e;
		$fuzzy_search_container.css({left:touch0.clientX-relativeX, top:touch0.clientY-relativeY});
		$html.on("mouseup.move touchend.move", function () {
			$html.off("mouseup.move touchend.move mousemove.move touchmove.move");
		});
	});
});

$("#fuzzy-search-container>.reset").on("click.reset", function (e) {
	$fuzzy_search.html("");
	$fuzzy_search.focus();
	$fuzzy_search.trigger("input.fs");
});

// String to Array
m.encloseStr=function (str) {
	if (!str||str.constructor!==String) { return ''; }
	if (str.charAt(0)==='"'||/[\n\t]/.test(str)) {
		return `"${str.replace(/"/g,'""')}"`;
	} return str;
};
m.strToJSON=function (str, colMap=true, rowMap=false) {
	if (!str||str.constructor!==String) {
		return Promise.resolve(str);
	}
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
	function increaseRC(delim) {
		if (delim==='\t') {
			col++; return true;
		}
		else if (delim==='\n') {
			row++; col=0; ret.push([]); return true;
		} return false;
	}
	while (start<str.length&&increaseRC(delim)) {
		if ((str.substring(start, start+1))==='"') {
			lastQuote.lastIndex=start+1;
			if ((exec=lastQuote.exec(str))!==null) {
				strElem=str.substring(start+1, lastQuote.lastIndex-2);
				delim=exec[1];
				start=delimiter.lastIndex=lastQuote.lastIndex;
			}
			else {
				strElem=str.substring(start+1);
				delim="";
				start=str.length;
			}
			strElem=strElem.replace(/""/g,'"');
		}
		else {
			if ((exec=delimiter.exec(str))!==null) {
				strElem=exec[1];
				delim=exec[2];
				start=delimiter.lastIndex;
			}
			else {
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
			for (let j=0;j<firstColSize;j++) {
				let key=ret[0][j];
				if (j>=jMax) {
					ret[i][key]="";
				}
				else {
					ret[i][key]=ret[i][j];
				}
			}
		}
	}
	if (rowMap) {
		for (let i=0;i<ret.length;i++) {
			let key=ret[i][0];
			ret[key]=ret[i];
		}
	}
	return Promise.resolve(ret);
};
m.csvToJSON=function (str, colMap=true, rowMap=false) {
	if (!str||str.constructor!==String) {
		return Promise.resolve(str);
	}
	let rows=str.split("\n");
	for (let i=0;i<rows.length;i++) {
		if (rows[i].substring(0,1)==='"'&&rows[i].substring(rows[i].length-1)==='"') {
			rows[i]=rows[i].substring(1,rows[i].length-1).split('","');
		}
		else {
			rows[i]=rows[i].split(",");
		}
	}
	if (colMap) {
		const firstColSize=rows[0].length;
		for (let i=0;i<rows.length;i++) {
			let jMax=rows[i].length;
			if (jMax>firstColSize) { jMax=firstColSize; }
			for (let j=0;j<jMax;j++) {
				let key=rows[0][j];
				if (key!==undefined) {
					rows[i][key]=rows[i][j];
				}
			}
		}
	}
	if (rowMap) {
		for (let i=0;i<rows.length;i++) {
			let key=rows[i][0];
			if (key!==undefined) {
				rows[key]=rows[i];
			}
		}
	}
	return Promise.resolve(rows);
};
m.arrayToTableHTML=function (txtArray) {
	let tableStr="<table>";
	for (let row=0;row<txtArray.length;row++) {
		tableStr+="<tr>";
		for (let col=0;col<txtArray[row].length;col++) {
			tableStr+=`<td>${m.escapeHTML(txtArray[row][col]).replace(/\n/g,'<br>')}</td>`;
		}
		tableStr+="</tr>";
	}
	tableStr+="</table>";
	return tableStr;
};

// SEE (Super Easy Edit).
m.SEEToArray=function (SEE) {
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
		}
		else if (/^```/.test(subStr)) {
			while (!/```\/$/.test(subStr)) {
				re=dE.exec(SEE);
				end=dE.lastIndex;
				subStr=SEE.substring(start,end).trim();
			}
		}
		else if (/^<script\s*[^>]*>/i.test(subStr)) {
			while (!/<\/script>$/i.test(subStr)) {
				re=dE.exec(SEE);
				end=dE.lastIndex;
				subStr=SEE.substring(start,end).trim();
			}
		}
		else if (/^<textarea\s*[^>]*>/i.test(subStr)) {
			while (!/<\/textarea>$/i.test(subStr)) {
				re=dE.exec(SEE);
				end=dE.lastIndex;
				subStr=SEE.substring(start,end).trim();
			}
		}
		else if (/^<data\s*[^>]*>/i.test(subStr)) {
			while (!/<\/data>$/i.test(subStr)) {
				re=dE.exec(SEE);
				end=dE.lastIndex;
				subStr=SEE.substring(start,end).trim();
			}
		}
		else if (/^<eqq\s*[^>]*>/i.test(subStr)) {
			while (!/<\/eqq>$/i.test(subStr)) {
				re=dE.exec(SEE);
				end=dE.lastIndex;
				subStr=SEE.substring(start,end).trim();
			}
		}
		else if (/^<!--/i.test(subStr)) {
			while (!/-->$/i.test(subStr)) {
				re=dE.exec(SEE);
				end=dE.lastIndex;
				subStr=SEE.substring(start,end).trim();
			}
			subStr="";
		}
		if (subStr) { ps.push(subStr); }
		start=end;
	}
	subStr=SEE.substring(start).trim();
	if (subStr) { ps.push(subStr); }
	return ps;
};

m.renderToDocuK=function (toBeRendered) {
	const ps=m.SEEToArray(toBeRendered);

	const TOC="Table of Contents";
	const PH="Posting History";
	const COTD="Categories of this document";
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

	for (let i=0;i<ps.length;i++) {
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
						str+=`<div class="sec">`;
						head=TOC;
						str+=`<h2 class="notSec">${head}</h2><div class="toc"></div></div>`; // self closing.
					}
					else if (head==="COTD") {
						str+=`<div class="sec hiden">`;
						head=COTD;
						str+=`<h2 class="no-sec-N" id="sec-COTD">${head}</h2>`;
						secOn=true;
					}
					else if (head==="PH") {
						str+=`<div class="sec hiden">`;
						head=PH;
						str+=`<h2 class="no-sec-N" id="sec-PH">${head}</h2>`;
						secOn=true;
					}
					else if (head==="RRA") {
						str+=`<div class="sec">`;
						head=RRA;
						str+=`<h2 class="no-sec-N" id="sec-Refs">${head}</h2>`;
						secOn=true;
					}
					else {
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
		}
		else if (hN=/^#+(?=\/)/.exec(ps[i])) {
			hN=hN[0].length;
			closeSec(hN);
			continue; // Text after '#/' is ignored. Use '#####/' for comment.
		}

		if (ps[i].length) {
			if (/^<\/?\w/.test(ps[i])) {
				str+=ps[i];
			}
			else if (/^```/.test(ps[i])) {
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
			}
			else {
				str+=`<div class="p">${ps[i]}</div>`;
			}
		}
	}
	closeSec(1);

	return str;
};

m.getContentsJoinedWithEnter=function ($elem) {
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
		}
		else {
			strArray.push(contentI.text().trim());
		}
	}
	return strArray.join("\n");
};

// Functions for printing codes into 'pre.prettyprint'.
m.indentsRemove=function (str) {
	let firstIndent=str.match(/^\n\t+/), indentRegExp;
	if (firstIndent!==null) { // if match (first indent) is found
		indentRegExp=new RegExp("\\n\\t{1,"+(firstIndent[0].length-1)+"}",'g'); // /\n\t{1,n}/g: global greedy matching
	}
	else {
		indentRegExp=/^\n/; // just for minimum match
	}
	return str.replace(indentRegExp,'\n');
};
m.escapeHTML=function (str) {
	if (!str||str.constructor!==String) { return ""; }
	return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
};
m.unescapeHTML=function (str) {
	if (!str||str.constructor!==String) { return ""; }
	return str.replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&amp;/g,'&');
};
m.printCode=function (codeId) {
	const $pre=$("pre#pre-"+codeId);
	const $code=$("#"+codeId);
	if ($pre.exists()) {
		let html=m.indentsRemove($code.html()).trim();
		if (!$code.is(".noEscapeHTML")) {
			html=m.escapeHTML(html);
		}
		$pre.html(html);
	}
};

// Function for toggling height, i.e. switching scrollability with conserving view.
m.toggleHeight=function (obj) {
	let next=$(obj).next();
	let toBeScrolledBy=0;
	let windowScrollTop=$window.scrollTop();
		// (window.pageYOffset!==undefined)?window.pageYOffset:(document.documentElement||document.body.parentNode||document.body).scrollTop
	let nOffsetTop=next.offset().top;
	let nHeight=next.height();
	// m.resultTest.append("before:\twindowScrollTop: "+windowScrollTop+";\tnOffsetTop: "+nOffsetTop+";\tnHeight: "+nHeight+"\n");

	if (next.is(".scrollable")) { // becomes expanded.
		toBeScrolledBy=next.scrollTop();
		next.removeClass("scrollable");
		window.scrollTo(0,windowScrollTop+toBeScrolledBy);
	}
	else { // becomes scrollable.
		if (windowScrollTop<nOffsetTop) {
			// case0: no scroll
			next.addClass("scrollable");
		}
		else {
			// case1: scroll both
			toBeScrolledBy=windowScrollTop-nOffsetTop;
			let tailHeight=nHeight-toBeScrolledBy;
			next.addClass("scrollable");
			nHeight=next.height();
			window.scrollTo(0,(nHeight>tailHeight)?nOffsetTop+nHeight-tailHeight:nOffsetTop);
			next[0].scrollTop=toBeScrolledBy;
		}
	}
	// m.resultTest.append("after : \twindowScrollTop: "+$window.scrollTop()+";\tnOffsetTop: "+next.offset().top+";\tnHeight: "+next.height()+"\n\n");
	// m.resultTest[0].scrollTop=m.resultTest[0].scrollHeight;
};

// section's show/hide functions
m.ShowHide=function (elem) {
	$(elem).next().toggle();
	if ($(elem).next().is(":visible")) {
		$(elem).html("▼ Hide");
	}
	else {
		$(elem).html("▼ Show");
	}
	setTimeout(function () {$window.trigger("scroll.delayedLoad");}, 1000);
};
m.Hide=function (elem) {
	let $elem=$(elem).parent();
	window.scrollBy(0,-$elem.outerHeight());
	$elem.hide();
	$elem.parent().find(".ShowHide").html("▼ Show");
};

// bubbleRef's show/hide functions
m.ShowBR=function (elem) {
	clearTimeout(m.timerHideBRQueue);
	m.bubbleRefs.hide();
	$(elem).find(">.bubbleRef").show();
};
m.timerHideBR=function (elem) {
	m.timerHideBRQueue=setTimeout(function () {$(elem).find(">.bubbleRef").hide();}, 1000);
};
m.HideBR=function (elem) {
	$(elem).parent().hide();
};

// Changing Styles of docuK
m.mode="Dark";
m.fontFamily="맑은 고딕";
m.fontSize=10;
m.lineHeight10=16;
m.defaultStyles={mode:m.mode, fontFamily:m.fontFamily, fontSize:m.fontSize, lineHeight10:m.lineHeight10};

m.printDeviceInfo=function () {
	if (m.$deviceInfo) {
		let referrer=document.referrer;
		let referrerHTML=(referrer?`<a target="_blank" href="${referrer}">${m.escapeHTML(decodeURIComponent(referrer))}</a>`:`Empty`);
		m.$deviceInfo.html(
			`Mode: ${m.mode}; Font: ${m.fontFamily}; font-size: ${(m.fontSize*1.8).toFixed(1)}px (${m.fontSize.toFixed(1)}); line-height: ${(m.lineHeight10/10).toFixed(1)};<br>
width: ${m.browserWidth}, height: ${window.innerHeight}<br>
document.referrer: ${referrerHTML}`
		);
	}
};

m.resetStyle=function () {
	m.Cmode(m.defaultStyles.mode);
	m.CfontFamily(m.defaultStyles.fontFamily);
	m.CfontSize(m.defaultStyles.fontSize-m.fontSize);
	m.ClineHeight(m.defaultStyles.lineHeight10-m.lineHeight10);
	if (!$floating_key.is(":visible")) {
		m.toggleFK();
	}
}
m.Cmode=function (modeI) {
	if (modeI=="Dark") {
		m.docuK.removeClass("bright");
	}
	else if (modeI=="Bright") {
		m.docuK.addClass("bright");
	}
	else {
		return false;
	}
	m.mode=modeI;
	m.printDeviceInfo();
	if (m.mode===m.defaultStyles.mode) {
		m.docCookies.removeItem("m.mode", "/");
	}
	else {
		m.docCookies.setItem("m.mode", m.mode, m.expire, "/");
	}
	return true;
};
m.CfontFamily=function (font) {
	m.docuK.css({fontFamily:font});
	m.fontFamily=font;
	m.printDeviceInfo();
	if (m.fontFamily===m.defaultStyles.fontFamily) {
		m.docCookies.removeItem("m.fontFamily", "/");
	}
	else {
		m.docCookies.setItem("m.fontFamily", m.fontFamily, m.expire, "/");
	}
	return true;
};
m.CfontSize=function (increment) {
	if (increment.constructor===Number&&!isNaN(increment)) {
		m.fontSize+=increment;
		if (m.fontSize<5) {
			m.fontSize=5;
		}
		else if (m.fontSize>33) {
			m.fontSize=33;
		}
		m.docuK.css({"font-size":m.fontSize.toFixed(1)+"px"});
		m.printDeviceInfo();
		if (m.fontSize===m.defaultStyles.fontSize) {
			m.docCookies.removeItem("m.fontSize", "/");
		}
		else {
			m.docCookies.setItem("m.fontSize", m.fontSize.toFixed(1), m.expire, "/");
		}
		return true;
	}
	return false;
};
m.ClineHeight=function (increment) {
	if (increment.constructor===Number&&!isNaN(increment)) {
		m.lineHeight10+=increment;
		if (m.lineHeight10<10) {
			m.lineHeight10=10;
			return false;
		}
		else if (m.lineHeight10>25) {
			m.lineHeight10=25;
			return false;
		}
		m.docuK.attr("style", `line-height:${(m.lineHeight10/10).toFixed(1)} !important`);
		m.printDeviceInfo();
		if (m.lineHeight10===m.defaultStyles.lineHeight10) {
			m.docCookies.removeItem("m.lineHeight10", "/");
		}
		else {
			m.docCookies.setItem("m.lineHeight10", m.lineHeight10, m.expire, "/");
		}
		return true;
	}
	return false;
};
$window.on("resize.deviceInfo", function () {
	if (window.innerWidth!==m.browserWidth) {
		m.browserWidth=window.innerWidth;
		m.fontSize=parseInt(m.docuK.css("font-size"));
		m.printDeviceInfo();
	}
});

// Share a link through SNS
m.shareSNS=function (service) {
	let title=$("title").eq(0).html()+` at ${window.location.host}`;
	let url=window.location.href;
	let open="";
	switch (service) {
		case 'link':
			let written=`${url}\n${title}`;
			navigator.clipboard.writeText(written).then(function () {
				alert(`The following is copied!\n"${written}"`);
			}
			, function (err) {
				alert(`Could not copy text: ${err}`);
			});
			return;
		case 'twitter':
			open="https://twitter.com/intent/tweet?via=kipacti&text="+encodeURIComponent(title)+"&url="+encodeURIComponent(url);
			break;
		case 'facebook':
			open="https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(url);
			break;
		case 'recoeve':
			open=`https://recoeve.net/reco?uri=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}${m.recoCats?`&cats=${encodeURIComponent(m.recoCats)}`:""}`;
			break;
		case 'kakao':
			m.popUpKakao();
			return;
		default:
			return;
	}
	window.open(open);
};

// Delayed Loading. (Copied from user-page.html)
m.delayPad=m.delayPad||1024;
m.wait=m.wait||1024;
m.$delayedElems=$("#nothing");
m.previous=Date.now();
$.fn.inView=function () {
	if (this.is(":visible")) {
		let viewportHeight=window.innerHeight;
		let scrollTop=$window.scrollTop();
		let elemTop=this.offset().top-m.delayPad;
		let elemBottom=elemTop+this.height()+m.delayPad;
		return (scrollTop+viewportHeight>elemTop)&&(scrollTop<elemBottom);
	}
	else {
		return false;
	}
};
$.fn.delayedLoad=function () {
	let done=false;
	if (this.inView()) {
		if (this.hasClass("to-be-executed")) {
			this.removeClass("to-be-executed");
			this.trigger("click");
			done=true;
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
		// MathJax Process :: TODO: update MathJax (maybe typesetPromise?)
		// if (typeof MathJax!=='undefined'&&this.is(".MathJax_Preview")) {
		// 	MathJax.Hub.Queue(["Process", MathJax.Hub, this.next()[0]]);
		// 	done=true;
		// }
	}
	return done;
};
m.delayedLoadAll=function () {
	m.logPrint(`<br>Doing delayed-load. : ${m.$delayedElems.length}`);
	if (m.$delayedElems.length>0) {
		m.$delayedElems.each(function () {
			if ($(this).delayedLoad()) {
				m.$delayedElems=m.$delayedElems.not(this);
				m.logPrint(`<br><span class="emph">${this} at vertical position of ${(100.0*$(this).offset().top/$document.height()).toPrecision(3)}% of document is delayed-loaded.</span><br>${m.$delayedElems.length} of $delayedElems are remained.<br>`);
			}
		});
		$window.on("scroll.delayedLoad", m.delayedLoadByScroll);
	}
	else {
		m.logPrint(`<br><br>All delayedElem are loaded.`);
		$window.off("scroll.delayedLoad");
	}
	m.previous=Date.now();
};
m.delayedLoadByScroll=function () {
	$window.off("scroll.delayedLoad");
	let now=Date.now();
	let passed=now-m.previous;
	if (passed>m.wait) {
		m.delayedLoadAll();
	}
	else {
		setTimeout(function () {
			m.delayedLoadAll();
		}, m.wait*1.1-passed);
		m.logPrint(`<br>wait ${(m.wait*1.1-passed).toFixed(0)}ms.`);
	}
};
$window.on("scroll.delayedLoad", m.delayedLoadByScroll);

// docuK Process
m.docuKProcess=function docuK(m, $, docuKI, undefined) {
	// Possible duplicate id is handled.
	docuKI=(isNaN(docuKI)||docuKI<0)?0:parseInt(docuKI);
	m.logPrint(`<br><br>docuK-${docuKI} scripts started!<br><span class="emph">If this log is not closed automatically, there must be an error somewhere in your document or scripts.</span>`);
	let docuK=$(".docuK").eq(docuKI);
	if (docuK.is(".rendered")) {
		m.logPrint(`<br><br>docuK-${docuKI} is already rendered.`);
		return;
	}

	let postId="-in-docuK"+docuKI;
	let postIdRegEx=new RegExp(postId+"$");
	if (docuK.is(".noDIdHandle")) {
		postId="";
	}
	else {
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
<div id="shortkey" class="shortkey bcf">
	Short Keys
	<ul class="ul-short-key">
		<li><span onclick="$window.trigger({type:'keydown', keyCode:'G'.charCodeAt(0)})"><span class="bold underline">G</span>: <span class="bold underline">G</span>o (Fuzzy Search).</span></li>
		<li><span onclick="$window.trigger({type:'keydown', keyCode:'K'.charCodeAt(0)})"><span class="bold underline">K</span>: Docu<span class="bold underline">K</span> Log.</span></li>
		<li><span onclick="$window.trigger({type:'keydown', keyCode:'F'.charCodeAt(0)})"><span class="bold underline">F</span>: <span class="bold underline">F</span>orward Section.</span></li>
		<li><span onclick="$window.trigger({type:'keydown', keyCode:'D'.charCodeAt(0)})"><span class="bold underline">D</span>: Backwar<span class="bold underline">d</span> Section.</span></li>
		<li><span onclick="$window.trigger({type:'keydown', keyCode:'T'.charCodeAt(0)})"><span class="bold underline">T</span>: <span class="bold underline">T</span>able of Contents.</span></li>
		<li><span onclick="$window.trigger({type:'keydown', keyCode:'R'.charCodeAt(0)})"><span class="bold underline">R</span>: <span class="bold underline">R</span>eferences.</span></li>
	</ul>
	<ul class="ul-short-key">
		<li><span onclick="$window.trigger({type:'keydown', keyCode:'L'.charCodeAt(0)})"><span class="bold underline">L</span>: To 전체목록/[<span class="bold underline">L</span>ists].</span></li>
		<li><span onclick="$window.trigger({type:'keydown', keyCode:'Z'.charCodeAt(0)})"><span class="bold underline">Z</span>: Tistory comments.</span></li>
		<li><span onclick="$window.trigger({type:'keydown', keyCode:'H'.charCodeAt(0)})"><span class="bold underline">H</span>: <span class="bold underline">H</span>andle URI links in Tistory comments.</span></li>
		<li><span onclick="$window.trigger({type:'keydown', keyCode:'X'.charCodeAt(0)})"><span class="bold underline">X</span>: DISQUS comments.</span></li>
	</ul>
	<ul class="ul-short-key">
		<li><span onclick="$window.trigger({type:'keydown', keyCode:'I'.charCodeAt(0)})"><span class="bold underline">I</span>: Log <span class="bold underline">i</span>n to Tistory.</span></li>
		<li><span onclick="$window.trigger({type:'keydown', keyCode:'O'.charCodeAt(0)})"><span class="bold underline">O</span>: Log <span class="bold underline">o</span>ut from Tistory.</span></li>
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
	<form><button type="button" onclick="m.resetStyle()" style="width:auto; padding:0 .5em">Reset docuK style</button></form>
	<form><input id="button${docuKI}-Dark" type="radio" name="mode" value="Dark" onclick="m.Cmode(this.value)"><label for="button${docuKI}-Dark" style="display:inline-block; background:black; color:white; border:2px solid rgb(150,150,150); padding:0.1em 0.2em">Dark</label>
	</input><input id="button${docuKI}-Bright" type="radio" name="mode" value="Bright" onclick="m.Cmode(this.value)"><label for="button${docuKI}-Bright" style="display:inline-block; background:white; color:black; border:2px solid rgb(150,150,150); padding:0.1em 0.2em">Bright</label></input></form>
	<form><input id="input${docuKI}-font-family" class="bold" type="text" name="font" value="맑은 고딕" style="font-family:'맑은 고딕'; font-size:1.2em; width:73px; height:23px; text-align:center" onchange="m.CfontFamily(this.value)"></input></form>
	<form><button type="button" onclick="m.CfontSize(-0.1)" style="font-size:1em">A</button><button type="button" onclick="m.CfontSize(0.1)" style="font-size:1.4em">A</button></form>
	<form><button type="button" onclick="m.ClineHeight(-1)" style="font-size:1em">=</button><button type="button" onclick="m.ClineHeight(1)" style="font-size:1.6em">=</button></form>
	<form><button class="button-log" type="button" onclick="$window.trigger({type:'keydown', keyCode:'K'.charCodeAt(0)})" style="width:auto; padding:0 .5em">DocuK Log</button></form>
	<form><button class="button-Go" type="button" onclick="$window.trigger({type:'keydown', keyCode:'G'.charCodeAt(0)})" style="font:inherit; width:auto; padding:0 .5em">Fuzzy search</button></form>
	<div class="deviceInfo"></div>
	<div class="promoting-docuK">This document is rendered by <a href="http://kipid.tistory.com/entry/HTML-docuK-format-ver-20">docuK</a> (See also <a href="http://kipid.tistory.com/entry/Super-Easy-Edit-SEE-of-docuK">SEE (Super Easy Edit)</a>).</div>
	</div>
<div class="SNS-top"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/link.png" onclick="m.shareSNS('link')"><img class="SNS-img" src="https://tistory2.daumcdn.net/tistory/1468360/skin/images/icon-Twitter.png" onclick="m.shareSNS('twitter')"><img class="SNS-img" src="https://tistory2.daumcdn.net/tistory/1468360/skin/images/icon-Facebook.png" onclick="m.shareSNS('facebook')"><img class="SNS-img" src="https://tistory3.daumcdn.net/tistory/1468360/skin/images/icon-Recoeve.png" onclick="m.shareSNS('recoeve')"><img class="SNS-img" src="https://tistory2.daumcdn.net/tistory/1468360/skin/images/icon-Kakao.png" onclick="m.shareSNS('kakao')"></div>`
	);
	docuK.append(`<div class="SNS-bottom"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/link.png" onclick="m.shareSNS('link')"><img class="SNS-img" src="https://tistory2.daumcdn.net/tistory/1468360/skin/images/icon-Twitter.png" onclick="m.shareSNS('twitter')"><img class="SNS-img" src="https://tistory2.daumcdn.net/tistory/1468360/skin/images/icon-Facebook.png" onclick="m.shareSNS('facebook')"><img class="SNS-img" src="https://tistory3.daumcdn.net/tistory/1468360/skin/images/icon-Recoeve.png" onclick="m.shareSNS('recoeve')"><img class="SNS-img" src="https://tistory2.daumcdn.net/tistory/1468360/skin/images/icon-Kakao.png" onclick="m.shareSNS('kakao')"></div>`);

	// Scrollable switching of 'pre.prettyprint'.
	docuK.find("pre.prettyprint.scrollable").wrap("<div class='preC'></div>").before('<div class="preSSE">On the left side of codes is there a hiden button to toggle/switch scrollability ({max-height:some} or {max-height:none}).</div><div class="preSS" onclick="m.toggleHeight(this)"></div>');
	m.logPrint(`<br><br>&lt;codeprint&gt; tags are printed to corresponding &lt;pre&gt; tags, only when the tags exist in the document.`);

	// Numbering section, making table of contents, and numbering eqq (formatting to MathJax also) and figure tags
	let secs=docuK.find(">.sec"), subsecs, subsubsecs, secContentsId="";
	let secI, secIH2, subsecJH3, subsubsecKH4;
	let secN=0, secITxt="", subsecI=0, subsubsecI=0, tocHtml="", txt="", secId="", secPreTxt="";
	let eqqs, eqN="", eqC="", figs;
	function fTocHtml(numbering) {
		let secN=(numbering===undefined||numbering)?"secN":"none";
		return `<h${hN}><a class="jump" id="toc${docuKI}-${secId}" href="#secId${docuKI}-${secId}"><span class="${secN}"><span class="number">${secPreTxt}</span>.</span>${txt}</a></h${hN}>`;
	}
	function fSecHtml(numbering) {
		let secN="none", endA0="", endA1="</a>";
		if (numbering===undefined||numbering) {
			secN="secN"; endA0="</a>"; endA1="";
		}
		return `<a class="jump tJump" href="#toc${docuKI}-${secId}">T</a><a class="jump" id="secId${docuKI}-${secId}" href="#secId${docuKI}-${secId}"><span class="${secN}"><span class="number">${secPreTxt}</span>.</span>${endA0}<span class="head-txt">${txt}</span>${endA1}`;
	}
	function fEqqHtml() {
		return `<div class="eqCC"><div class="eqN"><span class="number">(${eqN})</span></div><div class="eqC">${eqC}</div></div>`;
	}
	for (let i=0;i<secs.length;i++) {
		secI=secs.eq(i);
		secIH2=secI.find("h2:first-child");
		if (secIH2.exists() && !secIH2.is(".notSec")) { // exclude ".sec>h1" and ".sec>h2.notSec" in ToC
			hN="2"; txt=secIH2.html();
			if (secIH2.is(".no-sec-N")||secI.is(".no-sec-N")) {
				secPreTxt=secId=secITxt=(secIH2.is("[id]"))?secIH2.attr('id').replace(/^sec-/i,'').replace(postIdRegEx,''):`secPreTxt${docuKI}-${i}`;
				tocHtml+=fTocHtml(false);
				secIH2.html(fSecHtml(false));
			}
			else {
				secN++;
				secPreTxt=secId=secITxt=secN.toString();
				tocHtml+=fTocHtml();
				secIH2.html(fSecHtml());
			}

			if (!secI.is(".noToggleUI")) {
				secContentsId=`sec${docuKI}-${secITxt}-contents`;
				secI.append(`<div class="cBoth"></div><div class="Hide" onclick="m.Hide(this)">▲ Hide</div><div class="cBoth"></div>`);
				secI.contents().slice(1).wrapAll(`<div class="sec-contents" id="${secContentsId}"></div>`);
				secIH2.after(`<div class="ShowHide" onclick="m.ShowHide(this)">▼ Show/Hide</div>`);
				secI.append(`<div class="cBoth"></div>`);
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
		}
		else {
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
			figs.eq(j).find(".caption").html(function (ith,orgTxt) {return `Fig. <span class="number">(${figN})</span>: ${orgTxt.trim()}`;});
		}
	}
	secs.find(".toc").html(tocHtml);
	m.logPrint(`<br><br>Table of Contents is filled out.<br><br>Auto numberings of sections (div.sec>h2, div.subsec>h3, div.subsubsec>h4), &lt;eqq&gt; tags, and &lt;figure&gt; tags are done.`);

	// Make 'cite' tags bubble-refer references in ".docuK ol.refs>li".
	// Make 'refer' tags bubble-refer equations (eqq tag) or figures (figure tag). Any tag with id can be bubble-refered with refer tag.
	function pad(str, max) {
		str=str.toString();
		return str.length<max?pad("0"+str,max):str;
	}
	let refN="", preRefHtml="", refHtml="", citeN="";
	function fCiteHtml() {
		let str=`<div class="inRef" onmouseover="m.ShowBR(this)" onmouseout="m.timerHideBR(this)">${refN}<div class="bubbleRef"><div class="content">${preRefHtml}${refHtml}</div><div class="arrow"></div><div class="exit" onclick="m.HideBR(this)"><svg><g style="stroke:white;stroke-width:23%"><line x1="20%" y1="20%" x2="80%" y2="80%"/><line x1="80%" y1="20%" x2="20%" y2="80%"/></g>✖</svg></div></div></div>`;
		if (m.browserWidth<321) {
			str=str.replace(/<iframe[^>]*>[^<]*<\/iframe>/ig, '<span class="emph">In bubble refs, iframe (or youtube video) is intentionally NOT supported for various reasons (security, and cross browsing). See it in the original position of the iframe (video).</span>'); // 말풍선에서 비디오 등의 iframe을 의도적으로 지원하지 않았습니다. 원래의 위치에서 보세요.
		}
		return str;
	}
	let olRefs=docuK.find("ol.refs");
	olRefs=olRefs.eq(olRefs.length-1);
	let refs=docuK.find("ol.refs>li");
	let refsN=refs.length;
	for (i=0;i<refsN;i++) { // ref [i+1] with id
		refs.eq(i).prepend(`<span class="refN">Ref. <span class="number">[${pad(i+1,2)}]</span> </span>`);
	}
	let cites=docuK.find("cite"), citeI, refered;
	for (i=0;i<cites.length;i++) {
		citeI=cites.eq(i);
		if (citeI.is("[class]")) {
			if (citeI.html()!=="") {
				refered=docuK.find("#"+citeI.attr("class")+postId);
				if (refered.exists()) {
					let refNHtml=refered.find(".refN").html();
					refered.html(`<span class="refN">${refNHtml}</span>${citeI.html()}`);
				}
				else {
					refsN+=1;
					olRefs.append(`<li id="${citeI.attr("class")}${postId}"><span class="refN">Ref. <span class="number">[${pad(refsN,2)}]</span> </span>${citeI.html()}</li>`);
				}
			}
			refered=docuK.find("#"+citeI.attr("class")+postId);
			if (refered.exists()) {
				citeN=(i+1).toString()+"-"+citeI.attr("class")+postId;
				refHtml=refered.html().trim().replace(/\bid\s*=/gi,'psudoId=');
				refN=refered.find(".number").html();
				citeI.html(fCiteHtml());
			}
			else {
				citeI.html(`<span class="emph">( No refer. )</span>`);
			}
		}
	}
	let refers=docuK.find("refer"), referI;
	refers.html(`<span class="emph">( No refer. )</span>`);
	for (i=0;i<refers.length;i++) {
		referI=refers.eq(i);
		if (referI.is("[class]")) {
			refered=docuK.find(`#${referI.attr("class")}${postId}`);
			if (refered.exists()) {
				citeN=(i+1).toString()+"-"+referI.attr("class")+postId;
				refHtml=refered.html().trim().replace(/\bid\s*=/gi,'psudoId=');
				refN=refered.find(".number").html();
				referI.html(fCiteHtml());
			}
		}
	}
	m.logPrint(`<br><br>&lt;cite&gt; and &lt;refer&gt; tags are rendered to show bubble reference.`);

	docuK.addClass("rendered");
};
})(window.m, jQuery);