"use strict";(()=>{(function(e,o){e.version1=".1",e.printMode=!0,e.ripplesDisabled=!0;let S=o("codeprint.SEE");e.SEEHTMLs=e.SEEHTMLs||[];for(let r=0;r<S.length;r++){let l=S.eq(r),p="";e.SEEHTMLs[r]?p=e.SEEHTMLs[r].trim():p=l.html().trim(),l.html(""),l.after(e.renderToDocuK(p,r))}e.$docuK=o(".docuK"),o("code").each((r,l)=>{const p=o(l);p.hasClass("no-escape-HTML")||p.html(e.escapeOnlyTag(p.html()))}),o("code").addClass("prettyprint");let T=o("eq");for(let r=0;r<T.length;r++)T.eq(r).html(function(l,p){return"\\( "+p.trim()+" \\)"});let v=o("eqq");for(let r=0;r<v.length;r++)v.eq(r).html(function(l,p){return"\\[ "+p.trim()+" \\]"});e.logPrint("<br><br>&lt;eq&gt; and &lt;eqq&gt; tags are rendered to MathJax format, being enclosed by \\ ( \\ ) and \\ [ \\ ]."),e.$docuK.has("script").addClass("noDIdHandle"),e.$docuK.length<=1&&e.$docuK.addClass("noDIdHandle");let x=e.$docuK.length;for(let r=1;r<x;r++)e.docuKProcess(r);e.$bubbleRefs=e.$docuK.find(".bubbleRef");let K=e.$docuK.find(".inRef");K.each(function(){let r=o(this),l=r.width()-2,p=r.find(".arrow"),b=parseFloat(p.css("borderWidth")),t=parseFloat(p.css("fontSize"));p.css({marginLeft:((l/2-b)/t).toFixed(2)+"em"})}),K.on("mouseenter.delayedLoad",function(){e.logPrint("<br>Do delayed-load in bubble ref."),e.$window.trigger("scroll.delayedLoad"),o(this).off("mouseenter.delayedLoad")});let $=o(".docuK .p, .docuK .cmt, .docuK .bcf, .docuK li, .docuK pre");for(let r=0;r<$.length;r++){let l=$.eq(r),p=l.parents(".docuK>.sec"),b="",t="";if(p.length){let i=p.find("h2:first-child .head-txt").text(),n=l.parents(".subsec");if(n.length){i+=`
&nbsp; -- `+n.find("h3:first-child .head-txt").text();let s=l.parents(".subsubsec");s.length&&(i+=`
&nbsp; &nbsp; -- `+s.find("h4:first-child .head-txt").text())}b=i.replace(/\n&nbsp; &nbsp;/g,"").replace(/\n&nbsp;/g,"")+`
`,t='<div class="cat">'+i.replace(/\n/g,"<br>")+"</div>"}b+="* "+l.text(),t+=`<div class="li">* ${l.html().trim().replace(/\sid=/g," squasi-id=")}</div>`,e.fsGo.fullList[$.length-1-r]={i:$.length-1-r,txt:e.splitHangul(b),html:t,$listI:l}}e.$headOrBody=o("head")||o("body")||o("#docuK-style"),window.onpopstate=function(r){r.state&&(r.state?.goOn!==e.goOn&&e.$window.trigger({type:"keydown",code:"KeyG"}),r.state?.logOn!==e.logOn&&e.$window.trigger({type:"keydown",code:"KeyK"}))},e.$document.ready(function(){if(window.disqus_config){e.disqusVars={page:{}},window.disqus_config.apply(e.disqusVars);let t=e.canonicalURI=e.disqusVars.page.url;o('link[rel="canonical"]').remove(),(o("head")||o("#docuK-style")).append(`<link rel="canonical" href="${t}" />`);let i=new URL(window.location.href),n=new URL(t);i.hostname==="kipid.tistory.com"&&i.protocol.toLowerCase()===n.protocol.toLowerCase()&&decodeURIComponent(i.pathname)!==decodeURIComponent(n.pathname)&&(window.location.pathname=n.pathname)}if(setTimeout(function(){let i=new URL(window.location.href).origin.toLowerCase();if(i==="https://kipid.tistory.com"||i==="http://localhost:8080"||i==="http://127.0.0.1:8080"||i==="https://recoeve.net"||i==="https://www.recoeve.net"){let n=`URI	referer	REACTION_GUEST
${window.location.href}	${document.referrer}	${e.docCookies.getItem("REACTION_GUEST")}`;o.ajax({type:"POST",url:"https://recoeve.net/BlogStat",data:n,dataType:"text"}).fail(async function(s){e.logPrint("<br><br>BlogStat failed. "+await e.uriRendering(s.toString(),!0,!1))}).done(async function(s){e.logPrint("<br><br>BlogStat is logged. "+await e.uriRendering(s.toString(),!0,!1))})}},8*e.wait),e.$title.html(e.$title.html()+` at ${window.location.host}`),e.$log.after(`<div id="floating-key">
<div id="button-hideFK" class="button" onclick="k.toggleFK()">\u25BC Hid<span class="bold underline">e</span></div>
<div class="button toggle-a-mess" onclick="k.$window.trigger({type:'keydown', code:'KeyA'})">Toggle <span class="bold underline">a</span> mess</div>
<div class="button button-Go" style="width:4.5em; border-right:none" onclick="k.$window.trigger({type:'keydown', code:'KeyG'})">
<span class="bold underline">G</span>o (FS)
</div>
<div class="button button-ToR" style="width:4.5em" onclick="k.$window.trigger({type:'keydown', code:'KeyT'})">
<span class="bold underline">T</span>ofC
</div>
<div class="button button-log" onclick="k.$window.trigger({type:'keydown', code:'KeyK'})">
Docu<span class="bold underline">K</span> Log
</div>
<div class="button darkgoldenrod" onclick="k.$window.trigger({type:'keydown', code:'KeyD'})">
Backwar<span class="bold underline">d</span>
</div>
<div class="button darkgoldenrod" onclick="k.$window.trigger({type:'keydown', code:'KeyF'})">
<span class="bold underline">F</span>orward
</div>
<div class="button darkgoldenrod" style="width:4.5em; border-right:none" onclick="k.$window.trigger({type:'keydown', code:'KeyR'})">
<span class="bold underline">R</span>RA
</div>
<div class="button button-list" style="width:4.5em" onclick="k.$window.trigger({type:'keydown', code:'KeyL'})">
<span class="bold underline">L</span>ists
</div>
<div class="button darkgoldenrod" style="width:4.5em; border-right:none" onclick="k.$window.trigger({type:'keydown', code:'KeyZ'})">
Cmt<span class="bold underline">Z</span>
</div>
<div class="button darkgoldenrod" style="width:4.5em" onclick="k.$window.trigger({type:'keydown', code:'KeyX'})">
Cmt<span class="bold underline">X</span>
</div>
<div class="button button-cmt-handle" onclick="k.$window.trigger({type:'keydown', code:'KeyN'})">
Ha<span class="bold underline">n</span>dle CmtZ
</div>
${e.docCookies.hasItem("REACTION_GUEST")?`<div class="button darkred" onclick="k.$window.trigger({type:'keydown', code:'KeyI'})">
Log <span class="bold underline">i</span>n
</div>`:`<div class="button darkred" onclick="k.$window.trigger({type:'keydown', code:'KeyO'})">
Log <span class="bold underline">o</span>ut
</div>`}
<div id="SNS-floating"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/link.png" onclick="return m.shareSNS('link')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Tag.png" onclick="return m.shareSNS('tag')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Recoeve.png" onclick="k.shareSNS('recoeve')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-X.png" onclick="k.shareSNS('X')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Facebook.png" onclick="k.shareSNS('facebook')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Kakao.png" onclick="k.shareSNS('kakao')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Whatsapp.png" onclick="k.shareSNS('Whatsapp')"></div></div><div class="button" id="toggle-floating-key" onclick="k.toggleFK()">\u25B2</div>`),e.$floating_key=o("#floating-key"),e.docCookies.getItem("hideFK")==="y"&&e.$floating_key.hide(),!e.printMode)for(let t=1;t<e.$docuK.length;t++)e.$docuK.eq(t).before(e.promoting(`promoting-${t}-0`)),e.$docuK.eq(t).after(e.promoting(`promoting-${t}-1`));window.$fuzzy_search.trigger("keyup.fs"),window.$button_Go=o(".button-Go"),window.$button_log=o(".button-log");let r=o("codeprint");for(let t=0;t<r.length;t++){let i=r.eq(t).attr("id");i!=null&&i.startsWith("code-")&&e.printCode(i)}e.logPrint("<br/><br/>&lt;codeprint&gt; tags are printed to corresponding &lt;pre&gt; tags, only when the tags exist in the document."),e.$docuK.find(".sec.hiden").find(">.sec-contents").css({display:"none"}),e.$deviceInfo=e.$docuK.find(".deviceInfo");let l;e.logPrint("<br>"),l=e.docCookies.getItem("m.mode"),l!==null?(e.Cmode(l),e.logPrint(`<br>Mode ${l} is set from cookie.`)):e.Cmode("Bright");for(let t=1;t<e.$docuK.length;t++)o(`#button${t}-${e.mode}`).prop("checked",!0);if(l=e.docCookies.getItem("m.fontFamily"),l!==null){e.CfontFamily(l),e.logPrint(`<br>Font ${l} is set from cookie.`);for(let t=1;t<e.$docuK.length;t++)o(`#input${t}-font-family`)[0].value=e.fontFamily}l=e.docCookies.getItem("m.fontSize"),l!==null&&(e.CfontSize(Number(l)-e.defaultStyles.fontSize),e.logPrint(`<br>Font-size ${(Number(l)*1.8).toFixed(1)} is set from cookie.`)),l=e.docCookies.getItem("m.lineHeight10"),l!==null&&(e.ClineHeight(Number(l)-e.defaultStyles.lineHeight10),e.logPrint(`<br>Line-height ${(Number(l)/10).toFixed(1)} is set from cookie.`)),e.plink=o('meta[property="dg:plink"]').attr("content"),e.logPrint("<br><br>Current styles (dark/bright mode, font-family, font-size, line-height) are shown."),e.printDeviceInfo(),window.$disqus_thread=o("#disqus_thread"),window.$disqus_thread.length||((o("#docuK-script")||o("body")).append('<div id="disqus_thread"></div>'),window.$disqus_thread=o("#disqus_thread"));let p=o(`<script id="disqus-js" defer src="https://kipid.disqus.com/embed.js" data-timestamp="${new Date}"><\/script>`);e.$headOrBody.append(p),e.logPrint('<br><br>disqus.js with id="disqus-js" is loaded.'),e.myIPs=["14.38.247.30","175.212.158.53"],e.ignoreMe=!0,e.weekDays=["\uC77C","\uC6D4","\uD654","\uC218","\uBAA9","\uAE08","\uD1A0"],e.daysToPlotPageViewsChart=31,e.to=[],e.from=[];let b=new Date;for(let t=0;t<e.daysToPlotPageViewsChart;t++){let i=b,n=i.getFullYear(),s=String(i.getMonth()+1).padStart(2,"0"),c=String(i.getDate()).padStart(2,"0");e.to.push({date:`${n}-${s}-${c}`,month:s,day:c,weekday:e.weekDays[i.getDay()]});let d=new Date(b.setDate(b.getDate()-1));n=d.getFullYear(),s=String(d.getMonth()+1).padStart(2,"0"),c=String(d.getDate()).padStart(2,"0"),e.from.push({date:`${n}-${s}-${c}`})}if(e.blogStatRes=[],e.getBlogStat=function(){return new Promise(function(t,i){let n="host	from	to";for(let s=0;s<e.daysToPlotPageViewsChart;s++)n+=`
kipid.tistory.com	${e.from[s].date} 15:00:00	${e.to[s].date} 15:00:00`;o.ajax({type:"POST",url:"https://recoeve.net/BlogStat/Get",data:n,dataType:"text"}).fail(function(s){e.logPrint("<br><br>BlogStat is failed to be got."),i(s)}).done(async function(s){e.logPrint("<br><br>BlogStat is got."),e.blogStatRes=await e.strToJSON(s);for(let c=1;c<e.blogStatRes.length;c++){let d=e.blogStatRes[c];d.splice(2,1);let y=`${d.from}	${d.to}`;d.id=y,e.blogStatRes[y]=d,d.stats=await e.strToJSON(d.stats);let u=0;for(let w=1;w<d.stats.length;w++){let f=d.stats[w].ip.split(":")[0];e.ignoreMe&&(f===e.myIPs[0]||f===e.myIPs[1])||u++}d.pageViews=u}t()})})},e.loadPageViewsStat=async function(){await e.getBlogStat();let t='<div class="rC" style="margin:1em 0"><div class="rSC"><div><svg width="100%" height="100%">',i=3,n=3,s=7,c=20,d=100-c,y=100-s-c,u=(100-i-n)/e.daysToPlotPageViewsChart/2;e.setIntervalBlogStatN=0,setTimeout(function w(){if(e.blogStatRes?.length<e.daysToPlotPageViewsChart&&e.setIntervalBlogStatN++<=17){setTimeout(w,2048);return}let f=0;for(let a=1;a<e.blogStatRes.length;a++){let h=e.blogStatRes[a].pageViews;h>f&&(f=h)}let g=[];for(let a=0;a<e.daysToPlotPageViewsChart;a++){let h=e.blogStatRes[a+1],k=i+(e.daysToPlotPageViewsChart-1-a)*u*2,m=i+(e.daysToPlotPageViewsChart-.5-a)*u*2,C=y*h.pageViews/f;g[a]={pageViews:h.pageViews,x:k,tick:m,month:e.to[a].month,day:e.to[a].day,weekday:e.to[a].weekday,h:C}}for(let a=0;a<g.length;a++)t+=`<rect class="column" x="${g[a].x}%" y="${d-g[a].h}%" width="${2*u}%" height="${g[a].h}%"></rect><text class="page-views" x="${g[a].tick}%" text-anchor="middle" y="${d-g[a].h-1}%" dominant-baseline="text-bottom">${g[a].pageViews?.toFixed(0)}</text>`;t+=`<line class="bar" x1="${i}%" y1="${d}%" x2="${100-n}%" y2="${d}%"/>`;for(let a=0;a<g.length;a++)t+=`<line class="bar" x1="${g[a].tick}%" y1="${d-1.5}%" x2="${g[a].tick}%" y2="${d+1}%"/>
<text class="tick${g[a].weekday==="\uD1A0"?" saturday":g[a].weekday==="\uC77C"?" sunday":""}" x="${g[a].tick}%" y="${d}%">
<tspan x="${g[a].tick}%" text-anchor="middle" dy="2.0em">${g[a].month}</tspan>
<tspan x="${g[a].tick}%" text-anchor="middle" dy="1.1em">/${g[a].day}</tspan>
<tspan x="${g[a].tick}%" text-anchor="middle" dy="1.6em">${g[a].weekday}</tspan>
</text>`;t+=`<text class="now-local" x="100%" y="100%"><tspan x="100%" text-anchor="end" y="99%" dominant-baseline="text-bottom">${new Date().toLocaleString()}</tspan></text>`,t+="</svg></div></div></div>",window.$page_views_chart.html(t)},512)},window.$page_views_chart=o("#page-views-chart"),window.$page_views_chart.length||(window.$disqus_thread.after('<div id="page-views-chart" class="to-be-executed" onclick="k.loadPageViewsStat()">Get page views</div>'),window.$page_views_chart=o("#page-views-chart")),e.kakao_js_id="kakao-js-sdk",!o(`#${e.kakao_js_id}`)){let t=o(`<script id="${e.kakao_js_id}" src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js"><\/script>`);e.$headOrBody.append(t)}e.logPrint(`<br><br>kakao.js with id="${e.kakao_js_id}" is loaded.`),e.kakaoInitDo=function(){typeof Kakao<"u"&&(clearInterval(e.kakaoInit),Kakao.isInitialized()||Kakao.init("c85c800b54a2a95faa5ca7a5e3d357ef"),e.logPrint(`<br>Kakao.isInitialized()=${Kakao.isInitialized()};`))},e.kakaoInit=setInterval(e.kakaoInitDo,2048),e.popUpKakao=function(){let t=o("meta[name='description']"),i=window.location.href;window.Kakao.Share.sendDefault({objectType:"feed",content:{title:o("title").html(),description:t?t[0].value:"",imageUrl:"",link:{mobileWebUrl:i,webUrl:i}}})},e.$fdList=o("#header, #shortkey, .promoting, .change-docuK-style, #content, #container, #wrapContent, .docuK .sec>h1, .docuK .sec>h2, .docuK .subsec>h3, .docuK .subsubsec>h4, .comments, .comments>.comment-list>ul>li, #disqus_thread, #aside, #page-views-chart, #chartdiv, #recentComments, #tistorySidebarProfileLayer"),e.fdList=e.$fdList.get().sort((t,i)=>o(t).offset().top-o(i).offset().top),e.$tocs=o(".docuK>.sec").has(".toc"),e.$rras=o(".docuK>.sec").has("ol.refs"),e.goOn=!1,e.logOn=!1,e.processShortKey=function(t){if(t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)return;switch(t.target&&t.target.nodeName){case"INPUT":case"SELECT":case"TEXTAREA":return}let i=null,n,s;switch(t.code){case"KeyQ":window.location.href="/manage";break;case"KeyA":o(".toggle-a-mess.order").eq(0).trigger("click");break;case"KeyE":e.toggleFK();break;case"KeyG":t.preventDefault(),window.$fuzzy_search_container.is(":visible")?(window.$fuzzy_search_container.hide(),window.$out_focus.focus(),window.$button_Go.removeClass("enabled"),e.goOn=!1,window.history.pushState({goOn:e.goOn,logOn:e.logOn},"")):(window.$fuzzy_search_container.show(),window.$fuzzy_search.focus(),window.$button_Go.addClass("enabled"),e.goOn=!0,window.history.pushState({goOn:e.goOn,logOn:e.logOn},""));break;case"KeyK":e.$log.is(":visible")?(e.$logAll.hide(),window.$out_focus.focus(),window.$button_log.removeClass("enabled"),e.logOn=!1,window.history.pushState({goOn:e.goOn,logOn:e.logOn},"")):(e.$logAll.show(),window.$button_log.addClass("enabled"),e.logOn=!0,window.history.pushState({goOn:e.goOn,logOn:e.logOn},""));break;case"KeyF":case"KeyD":i=e.$window.scrollTop(),s=e.fdList.length;let c;if(t.code==="KeyF"){for(i+=15,n=0;n<s&&(c=o(e.fdList[n]),!(c.is(":visible")&&i<c.offset().top));n++);if(n===s)return}else{for(i-=15,n=s-1;n>=0&&(c=o(e.fdList[n]),!(c.is(":visible")&&i>c.offset().top));n--);if(n===-1)return}let y=c.find("[id]").addBack("[id]").eq(0).attr("id");y?window.location.hash=`#${y}`:window.location.hash="",e.$window.scrollTop(c.offset().top);break;case"KeyT":i=e.$window.scrollTop(),s=e.$tocs.length;let u;for(i-=10,n=s-1;n>=0&&(u=e.$tocs.eq(n),!(u.is(":visible")&&i>u.offset().top));n--);n===-1&&(u=e.$tocs.eq(s-1)),e.$window.scrollTop(u.offset().top);break;case"KeyR":i=e.$window.scrollTop(),s=e.$rras.length;let w;for(i-=10,n=s-1;n>=0&&(w=e.$rras.eq(n),!(w.is(":visible")&&i>w.offset().top));n--);n===-1&&(w=e.$rras.eq(s-1)),e.$window.scrollTop(w.offset().top);break;case"KeyL":window.location.pathname==="/entry/Lists"?window.location.pathname="/category":window.location.pathname="/entry/Lists";break;case"KeyZ":o("div.comments").length&&e.$window.scrollTop(o("div.comments").offset().top);break;case"KeyN":e.handleComments();break;case"KeyX":o("#disqus_thread").length&&e.$window.scrollTop(o("#disqus_thread").offset().top);break;case"KeyI":e.docCookies.removeItem("REACTION_GUEST","/"),window.location.href=`https://www.tistory.com/auth/login?redirectUrl=${encodeURIComponent(window.location.href)}&isPopup=true`;break;case"KeyO":window.location.href="https://www.tistory.com/auth/logout";break;default:window.processShortcut!==void 0&&window.processShortcut(t)}},e.$window.on("keydown.shortkey",e.processShortKey),e.logPrint("<br><br>New ShortKeys (T: Table of Contents, F: Forward Section, D: Previous Section, L: To \uC804\uCCB4\uBAA9\uB85D/[Lists]) are set."),e.logPrint(`<br><br>m.delayPad=${e.delayPad};<br>m.wait=${e.wait};`),e.handleComments=async function(){let t=o(".comments .comment-list li p");async function i(n){let s=n.wholeText;return await e.relatedRendering(s)}e.processElement=async function(n){let s=n.contents(),c="";for(let d=0;d<s.length;d++){let y=s[d];if(y?.nodeType===Node.TEXT_NODE){let u=y?.wholeText,w=!1,f="",g="";if(/^```/.test(u)){w=!0;let a=!1;for(g=u.substring(3),d++;d<s.length;){let h=s[d],k=h?.wholeText;for(a=h?.nodeType===Node.TEXT_NODE&&typeof k=="string"&&/```\//.test(k);!a&&(h?.nodeType===Node.TEXT_NODE?f+=await i(h):f+=h.outerHTML,d++,d!==s.length);)if(h=s[d],k=h?.wholeText,a=h?.nodeType===Node.TEXT_NODE&&typeof k=="string"&&/```\//.test(k),a){f+=await i(h);break}if(a){f=f.replace(/```\//,""),d++;break}d++}}if(w){g=e.getEmmetFromHead(g);let a=e.getClassesFromEmmet(g),h=e.getIdFromEmmet(g);c+=`<pre${h?` id="${h}"`:""} class="prettyprint${a?` ${a}`:""}">${e.escapeOnlyTag(f.replace(/\n{0,1}\<br\s*\/?\>\n{0,1}/gi,`
`).trim())}</pre>`}else c+=await i(y)}else c+=y.outerHTML}n.html(c.trim())},e.processAllElements=async function(){for(let n=0;n<t.length;n++)await e.processElement(t.eq(n))},await e.processAllElements(),o("pre.prettyprint").each((n,s)=>{const c=o(s);c.hasClass("no-escape-HTML")||c.html(e.escapeOnlyTag(c.html()))}),o("pre.prettyprint").addClass("linenums"),e.$prePrettyScrollable=o("pre.prettyprint.scrollable");for(let n=0;n<e.$prePrettyScrollable.length;n++)e.$prePrettyScrollable.eq(n).parents(".preC").length||e.$prePrettyScrollable.eq(n).wrap("<div class='preC'></div>").before('<div class="preSSE">On the left side of codes is there a hiden button to toggle/switch scrollability ({max-height:some} or {max-height:none}).</div><div class="preSS" onclick="k.toggleHeight(this)"></div>');o(".comments").length&&(window?.MathJax?.typesetPromise?.([o(".comments")[0]]),window?.PR?.prettyPrint?.()),e.reNewAndReOn()},e.$window.on("resize.menubar",function(t){o("#menubar_wrapper").parents().show()}),e.reNewAndReOn=function(){e.$delayedElems=o("[delayed-src], [delayed-bgimage], .to-be-executed, .MathJax_Preview"),e.$window.off("scroll.delayedLoad").on("scroll.delayedLoad",e.delayedLoadByScroll),e.$window.trigger("scroll.delayedLoad"),e.$fdList=o("#header, #shortkey, .promoting, .change-docuK-style, #content, #container, #wrapContent, .docuK, .docuK .sec>h1, .docuK .sec>h2, .docuK .subsec>h3, .docuK .subsubsec>h4, .comments, .comments>.comment-list>ul>li, #disqus_thread, #aside, #page-views-chart, #chartdiv, #recentComments, #tistorySidebarProfileLayer"),e.fdList=e.$fdList.get().sort((t,i)=>o(t).offset().top-o(i).offset().top)},e.handleComments(),setTimeout(function(){e.handleComments();let t=o(`<script>
window.MathJax={
startup: {
typeset: false, // Skip startup typeset.
ready: function () {
m.logPrint('<br><br>MathJax is loaded, but not yet initialized.');
MathJax.startup.defaultReady();
m.logPrint('<br><br>MathJax is initialized, and the initial typeset is queued.');
}
},
tex: {
inlineMath: [['\\\\(','\\\\)']], // Using $ for inline math.
displayMath: [['\\\\[','\\\\]']], // Using $$ for outline math.
processEscapes: true, // Escape \\$
processEnvironments: false // Ignore \\begin{something} ... \\end{something}
},
svg: {
fontCache: 'global'
}
};
<\/script>`);e.$headOrBody.append(t);let i=document.createElement("script");i.id="MathJax-script",i.defer=!0,i.src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js",e.$headOrBody.append(i),e.logPrint("<br><br>MathJax.js (mathjax@3/es5/tex-mml-chtml.min.js) is loaded."),e.mathJaxPreProcessDo=function(){if(window.MathJax?.startup!==void 0&&window.MathJax.typesetPromise){let s=[];e.$docuK&&(s=[...e.$docuK]),o(".comments").length&&s.push(o(".comments")[0]),window.MathJax.typesetPromise(s)}else setTimeout(e.mathJaxPreProcessDo,2048)},e.mathJaxPreProcess=setTimeout(e.mathJaxPreProcessDo,2048);let n=document.createElement("script");n.id="prettyfy-js",n.defer=!0,n.src="https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js",e.$headOrBody.append(n),e.logPrint("<br><br>Google code prettyfy.js is loaded."),e.doPrettyPrint=function(){window?.PR?.prettyPrint?window.PR.prettyPrint():setTimeout(e.doPrettyPrint,2048)},e.logPrint("<br><br><span class='emph'>docuK scripts are all done. Then this log is closing in 1.0 sec.</span>"),e.$window.scrollTop(o(window.location.hash)?.offset()?.top??e.$window.scrollTop()),setTimeout(function(){e.$logAll.hide(),e.$window.scrollTop(o(window.location.hash)?.offset()?.top??e.$window.scrollTop())},2048),e.reNewAndReOn()},2048)});const P='<div class="docuK-ads">\uC774 \uAE00\uC774 \uB3C4\uC6C0\uC774 \uB418\uC168\uB2E4\uBA74, \uAD11\uACE0 \uD074\uB9AD \uD55C\uBC88\uC529\uB9CC \uBD80\uD0C1\uB4DC\uB9BD\uB2C8\uB2E4 =\u3142=\u314B. (If this article was helpful, please click the ad once. Thank you. ;)</div>';for(let r=1;r<e.$docuK.length;r++){const l=e.$docuK.eq(r);l.before(P),l.after(P)}})(window.k,jQuery);})();
//# sourceMappingURL=docuK-postProcess-2.3.js.map
