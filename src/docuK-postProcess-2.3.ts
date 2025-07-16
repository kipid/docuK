(function (m, $) {
	m.version1 = ".2";
	// SEE (Super Easy Edit)
	let $SEE: JQuery<HTMLElement> = $("codeprint.SEE");
	m.SEEHTMLs = m.SEEHTMLs || [];
	for (let i = 0; i < $SEE.length; i++) {
		let $SEEi = $SEE.eq(i);
		let SEEHTMLi = "";
		if (!!m.SEEHTMLs[i]) {
			SEEHTMLi = m.SEEHTMLs[i].trim();
		} else {
			SEEHTMLi = $SEEi.html().trim();
		}
		$SEEi.html("");
		$SEEi.after(m.renderToDocuK(SEEHTMLi, i));
	}

	m.$docuK = $(".docuK");

	$("code").each((index: number, elem: HTMLElement) => {
		const $elem = $(elem);
		if (!$elem.hasClass("no-escape-HTML")) {
			$elem.html(m.escapeOnlyTag($elem.html()));
		}
	});
	// <eq> and <eqq> tags to MathJax format
	let $eqs: JQuery<HTMLElement> = $("eq");
	for (let i = 0; i < $eqs.length; i++) {
		$eqs.eq(i).html(function (ith, orgTxt) {
			return "\\( " + orgTxt.trim() + " \\)";
		});
	}
	let $eqqs: JQuery<HTMLElement> = $("eqq");
	for (let i = 0; i < $eqqs.length; i++) {
		$eqqs.eq(i).html(function (ith, orgTxt) {
			return "\\[ " + orgTxt.trim() + " \\]";
		});
	}
	m.logPrint(`<br><br>&lt;eq&gt; and &lt;eqq&gt; tags are rendered to MathJax format, being enclosed by \\ ( \\ ) and \\ [ \\ ].`);

	// docuK process.
	m.$docuK.has("script").addClass("noDIdHandle");
	if (m.$docuK.length <= 1) {
		m.$docuK.addClass("noDIdHandle");
	}
	let k = m.$docuK.length;
	for (let i = 1; i < k; i++) {
		m.docuKProcess(i); // * (docuKI)
	}

	m.$bubbleRefs = m.$docuK.find(".bubbleRef"); // for function m.ShowBR

	let $inRefs: JQuery<HTMLElement> = m.$docuK.find(".inRef"); // The whole ref elements.
	// Centering arrow.
	$inRefs.each(function () {
		let $elem = $(this);
		let width = $elem.width() - 2;
		let $arrow = $elem.find(".arrow");
		let borderWidth = parseFloat($arrow.css("borderWidth"));
		let fontSize = parseFloat($arrow.css("fontSize"));
		$arrow.css({
			marginLeft: ((width / 2 - borderWidth) / fontSize).toFixed(2) + "em",
		});
	});
	// Delayed-Load in bubble ref.
	$inRefs.on("mouseenter.delayedLoad", function () {
		m.logPrint(`<br>Do delayed-load in bubble ref.`);
		m.$window.trigger("scroll.delayedLoad");
		$(this).off("mouseenter.delayedLoad");
	});

	//////////////////////////////////////////
	// Fuzzy search fullList
	//////////////////////////////////////////
	let $list = $(".docuK .p, .docuK .cmt, .docuK .bcf, .docuK li, .docuK pre");
	for (let i = 0; i < $list.length; i++) {
		let $listI = $list.eq(i);
		let $sec = $listI.parents(".docuK>.sec");
		let txt = "";
		let html = "";
		if ($sec.length) {
			let cat = $sec.find("h2:first-child .head-txt").text();
			let $subSec = $listI.parents(".subsec");
			if ($subSec.length) {
				cat += "\n&nbsp; -- " + $subSec.find("h3:first-child .head-txt").text();
				let $subSubSec = $listI.parents(".subsubsec");
				if ($subSubSec.length) {
					cat += "\n&nbsp; &nbsp; -- " + $subSubSec.find("h4:first-child .head-txt").text();
				}
			}
			txt = cat.replace(/\n&nbsp; &nbsp;/g, "").replace(/\n&nbsp;/g, "") + "\n";
			html = '<div class="cat">' + cat.replace(/\n/g, "<br>") + "</div>";
		}
		txt += "* " + $listI.text();
		html += `<div class="li">* ${$listI.html().trim().replace(/\sid=/g, " squasi-id=")}</div>`;
		m.fsGo.fullList[$list.length - 1 - i] = {
			i: $list.length - 1 - i,
			txt: m.splitHangul(txt),
			html: html,
			$listI: $listI,
		};
	}

	window.onpopstate = function (e) {
		if (!!e.state) {
			if (e.state?.goOn !== m.goOn) {
				m.$window.trigger({ type: "keydown", code: "KeyG" } as any);
			}
			if (e.state?.logOn !== m.logOn) {
				m.$window.trigger({ type: "keydown", code: "KeyK" } as any);
			}
		}
	};

	// On ready.
	m.$document.ready(function () {
		// Disqus js script, and Redirect to the canonical URL.
		if (window.disqus_config) {
			m.disqusVars = { page: {} };
			window.disqus_config.apply(m.disqusVars);
			let url = (m.canonicalURI = m.disqusVars.page.url);
			$('link[rel="canonical"]').remove();
			m.$headOrBody.append(`<link rel="canonical" href="${url}" />`);
			let hrefAnalyzed = new URL(window.location.href);
			let urlAnalyzed = new URL(url);
			if (hrefAnalyzed.hostname === "kipid.tistory.com" && hrefAnalyzed.protocol.toLowerCase() === urlAnalyzed.protocol.toLowerCase() && decodeURIComponent(hrefAnalyzed.pathname) !== decodeURIComponent(urlAnalyzed.pathname)) {
				window.location.pathname = urlAnalyzed.pathname;
			}
		}

		setTimeout(function () {
			let parsedHref = new URL(window.location.href);
			let origin = parsedHref.origin.toLowerCase();
			if (origin === "https://kipid.tistory.com" || origin === "http://localhost:8080" || origin === "http://127.0.0.1:8080" || origin === "https://recoeve.net" || origin === "https://www.recoeve.net") {
				let blogStat = `URI\treferer\tREACTION_GUEST\n${window.location.href}\t${document.referrer}\t${m.docCookies.getItem("REACTION_GUEST")}`;
				$.ajax({
					type: "POST",
					url: "https://recoeve.net/BlogStat",
					data: blogStat,
					dataType: "text",
				})
					.fail(async function (resp) {
						m.logPrint("<br><br>BlogStat failed. " + (await m.uriRendering(resp.toString(), true, false)));
					})
					.done(async function (resp) {
						m.logPrint("<br><br>BlogStat is logged. " + (await m.uriRendering(resp.toString(), true, false)));
					});
			}
		}, 8 * m.wait);

		m.$title.html(m.$title.html() + ` at ${window.location.host}`);

		m.$log.after(`<div id="floating-key">
<div id="button-hideFK" class="button" onclick="k.toggleFK()">▼ Hid<span class="bold underline">e</span></div>
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
${
	m.docCookies.hasItem("REACTION_GUEST")
		? `<div class="button darkred" onclick="k.$window.trigger({type:'keydown', code:'KeyI'})">
Log <span class="bold underline">i</span>n
</div>`
		: `<div class="button darkred" onclick="k.$window.trigger({type:'keydown', code:'KeyO'})">
Log <span class="bold underline">o</span>ut
</div>`
}
<div id="SNS-floating"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Link.png" onclick="return m.shareSNS('link')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Tag.png" onclick="return m.shareSNS('tag')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Recoeve.png" onclick="k.shareSNS('recoeve')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-X.png" onclick="k.shareSNS('X')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Facebook.png" onclick="k.shareSNS('facebook')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Kakao.png" onclick="k.shareSNS('kakao')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Whatsapp.png" onclick="k.shareSNS('Whatsapp')"></div></div><div class="button" id="toggle-floating-key" onclick="k.toggleFK()">▲</div>`);
		m.$floating_key = $("#floating-key");
		if (m.docCookies.getItem("hideFK") === "y") {
			m.$floating_key.hide();
		}
		if (!m.printMode) {
			m.$docuK.eq(m.$docuK.length - 1).after(m.promoting(`promoting-recoeve`));
		}
		window.$fuzzy_search.trigger("keyup.fs");
		window.$button_Go = $(".button-Go");
		window.$button_log = $(".button-log");
		// Printing codes in <codeprint> with id (which starts with "code-") into <pre id="pre-code-...">.
		let $codeprints: JQuery<HTMLElement> = $("codeprint");
		for (let i = 0; i < $codeprints.length; i++) {
			let codeId = $codeprints.eq(i).attr("id");
			if (codeId !== null && codeId !== undefined && codeId.startsWith("code-")) {
				m.printCode(codeId);
			}
		}
		m.logPrint(`<br/><br/>&lt;codeprint&gt; tags are printed to corresponding &lt;pre&gt; tags, only when the tags exist in the document.`);

		// Hiding hiden sections.
		m.$docuK.find(".sec.hiden").find(">.sec-contents").css({ display: "none" });

		// Setting and Printing Styles
		m.$deviceInfo = m.$docuK.find(".deviceInfo");

		let cookieItem: string | null;
		m.logPrint(`<br>`);

		cookieItem = m.docCookies.getItem("m.mode");
		if (cookieItem !== null) {
			m.Cmode(cookieItem as "Bright" | "Dark");
			m.logPrint(`<br>Mode ${cookieItem} is set from cookie.`);
		} else {
			m.Cmode("Bright");
		}
		for (let i = 1; i < m.$docuK.length; i++) {
			$(`#button${i}-${m.mode}`).prop("checked", true);
		}

		cookieItem = m.docCookies.getItem("m.fontFamily");
		if (cookieItem !== null) {
			m.CfontFamily(cookieItem as string);
			m.logPrint(`<br>Font ${cookieItem} is set from cookie.`);
			for (let i = 1; i < m.$docuK.length; i++) {
				($(`#input${i}-font-family`)[0] as HTMLInputElement).value = m.fontFamily;
			}
		}

		cookieItem = m.docCookies.getItem("m.fontSize");
		if (cookieItem !== null) {
			m.CfontSize(Number(cookieItem) - m.defaultStyles.fontSize);
			m.logPrint(`<br>Font-size ${(Number(cookieItem) * 1.8).toFixed(1)} is set from cookie.`);
		}

		cookieItem = m.docCookies.getItem("m.lineHeight10");
		if (cookieItem !== null) {
			m.ClineHeight(Number(cookieItem) - m.defaultStyles.lineHeight10);
			m.logPrint(`<br>Line-height ${(Number(cookieItem) / 10).toFixed(1)} is set from cookie.`);
		}

		m.plink = $('meta[property="dg:plink"]').attr("content");
		m.logPrint(`<br><br>Current styles (dark/bright mode, font-family, font-size, line-height) are shown.`);
		m.printDeviceInfo();

		window.$disqus_thread = $("#disqus_thread");
		if (!window.$disqus_thread.length) {
			($("#docuK-script") || $("body")).append(`<div id="disqus_thread"></div>`);
			window.$disqus_thread = $("#disqus_thread");
		}
		// let $disqus_js = $(`<script id="disqus-js" defer src="https://kipid.disqus.com/embed.js" data-timestamp="${new Date()}"></` + `script>`); // Avoid closing script
		// m.$headOrBody.append($disqus_js);
		// m.logPrint(`<br><br>disqus.js with id="disqus-js" is loaded.`);

		m.myIPs = ["14.38.247.30", "175.212.158.53"];
		m.ignoreMe = true;
		m.weekDays = ["일", "월", "화", "수", "목", "금", "토"];
		m.daysToPlotPageViewsChart = 31;
		m.to = [];
		m.from = [];
		let currentDate = new Date();
		for (let i = 0; i < m.daysToPlotPageViewsChart; i++) {
			let toDate = currentDate;
			let year = toDate.getFullYear();
			let month = String(toDate.getMonth() + 1).padStart(2, "0"); // Adding 1 because months are zero-based
			let day = String(toDate.getDate()).padStart(2, "0");
			// Format the date as YYYY-MM-DD (Locale date)
			m.to.push({
				date: `${year}-${month}-${day}`,
				month,
				day,
				weekday: m.weekDays[toDate.getDay()],
			});

			let fromDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
			year = fromDate.getFullYear();
			month = String(fromDate.getMonth() + 1).padStart(2, "0"); // Adding 1 because months are zero-based
			day = String(fromDate.getDate()).padStart(2, "0");
			m.from.push({ date: `${year}-${month}-${day}` });
		}
		m.blogStatRes = [];
		m.getBlogStat = function (): Promise<void> {
			return new Promise(function (resolve, reject) {
				let reqTimes = `host\tfrom\tto`;
				for (let i = 0; i < m.daysToPlotPageViewsChart; i++) {
					reqTimes += `\nkipid.tistory.com\t${m.from[i].date} 15:00:00\t${m.to[i].date} 15:00:00`; // until 24:00:00 of today. UTC+09:00.
				}
				$.ajax({
					type: "POST",
					url: "https://recoeve.net/BlogStat/Get",
					data: reqTimes,
					dataType: "text",
				})
					.fail(function (resp) {
						m.logPrint("<br><br>BlogStat is failed to be got.");
						reject(resp);
					})
					.done(async function (resp) {
						m.logPrint("<br><br>BlogStat is got.");
						m.blogStatRes = await m.strToJSON(resp);

						for (let i = 1; i < m.blogStatRes.length; i++) {
							let statI = m.blogStatRes[i];
							statI.splice(2, 1);
							let id = `${statI.from}\t${statI.to}`;
							statI.id = id;
							m.blogStatRes[id] = statI;
							statI.stats = await m.strToJSON(statI.stats);

							let pageViews = 0;
							for (let k = 1; k < statI.stats.length; k++) {
								let ip = statI.stats[k].ip.split(":")[0];
								if (m.ignoreMe && (ip === m.myIPs[0] || ip === m.myIPs[1])) {
									continue;
								}
								pageViews++;
							}
							statI.pageViews = pageViews;
						}
						resolve();
					});
			});
		};
		m.loadPageViewsStat = async function (): Promise<void> {
			await m.getBlogStat();
			let countChartHTML = `<div class="rC" style="margin:1em 0"><div class="rSC"><div><svg width="100%" height="100%">`;
			let leftPadding = 3.0;
			let rightPadding = 3.0;
			let topPadding = 7.0;
			let bottomPadding = 20.0;
			let bottomLine = 100.0 - bottomPadding;
			let maxHeight = 100.0 - topPadding - bottomPadding;
			let dx = (100.0 - leftPadding - rightPadding) / m.daysToPlotPageViewsChart / 2.0;
			m.setIntervalBlogStatN = 0;
			setTimeout(function self() {
				if (m.blogStatRes?.length < m.daysToPlotPageViewsChart && m.setIntervalBlogStatN++ <= 17) {
					setTimeout(self, 2048);
					return;
				}
				let maxPageViews = 0;
				for (let i = 1; i < m.blogStatRes.length; i++) {
					let pageViews = m.blogStatRes[i].pageViews;
					if (pageViews > maxPageViews) {
						maxPageViews = pageViews;
					}
				}
				let pageViewsOfADay = [];
				for (let k = 0; k < m.daysToPlotPageViewsChart; k++) {
					let blogStatResK = m.blogStatRes[k + 1];
					let x = leftPadding + (m.daysToPlotPageViewsChart - 1.0 - k) * dx * 2.0;
					let tick = leftPadding + (m.daysToPlotPageViewsChart - 0.5 - k) * dx * 2.0;
					let h = (maxHeight * blogStatResK.pageViews) / maxPageViews;
					pageViewsOfADay[k] = {
						pageViews: blogStatResK.pageViews,
						x,
						tick,
						month: m.to[k].month,
						day: m.to[k].day,
						weekday: m.to[k].weekday,
						h,
					};
				}
				for (let i = 0; i < pageViewsOfADay.length; i++) {
					countChartHTML += `<rect class="column" x="${pageViewsOfADay[i].x}%" y="${bottomLine - pageViewsOfADay[i].h}%" width="${2.0 * dx}%" height="${pageViewsOfADay[i].h}%"></rect><text class="page-views" x="${pageViewsOfADay[i].tick}%" text-anchor="middle" y="${bottomLine - pageViewsOfADay[i].h - 1.0}%" dominant-baseline="text-bottom">${pageViewsOfADay[i].pageViews?.toFixed(0)}</text>`;
				}
				countChartHTML += `<line class="bar" x1="${leftPadding}%" y1="${bottomLine}%" x2="${100.0 - rightPadding}%" y2="${bottomLine}%"/>`;
				for (let i = 0; i < pageViewsOfADay.length; i++) {
					countChartHTML += `<line class="bar" x1="${pageViewsOfADay[i].tick}%" y1="${bottomLine - 1.5}%" x2="${pageViewsOfADay[i].tick}%" y2="${bottomLine + 1.0}%"/>
<text class="tick${pageViewsOfADay[i].weekday === "토" ? " saturday" : pageViewsOfADay[i].weekday === "일" ? " sunday" : ""}" x="${pageViewsOfADay[i].tick}%" y="${bottomLine}%">
<tspan x="${pageViewsOfADay[i].tick}%" text-anchor="middle" dy="2.0em">${pageViewsOfADay[i].month}</tspan>
<tspan x="${pageViewsOfADay[i].tick}%" text-anchor="middle" dy="1.1em">/${pageViewsOfADay[i].day}</tspan>
<tspan x="${pageViewsOfADay[i].tick}%" text-anchor="middle" dy="1.6em">${pageViewsOfADay[i].weekday}</tspan>
</text>`;
				}
				countChartHTML += `<text class="now-local" x="100%" y="100%"><tspan x="100%" text-anchor="end" y="99%" dominant-baseline="text-bottom">${new Date().toLocaleString()}</tspan></text>`;
				countChartHTML += `</svg></div></div></div>`;
				window.$page_views_chart.html(countChartHTML);
			}, 512);
		};
		window.$page_views_chart = $("#page-views-chart");
		if (!window.$page_views_chart.length) {
			window.$disqus_thread.after(`<div id="page-views-chart" class="to-be-executed" onclick="k.loadPageViewsStat()">Get page views</div>`);
			window.$page_views_chart = $("#page-views-chart");
		}

		// Kakao js script (from kakao.com CDN) is added.
		m.kakao_js_id = "kakao-js-sdk";
		if (!$(`#${m.kakao_js_id}`).length) {
			let $kakao_js = $(`<script id="${m.kakao_js_id}" src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js"></` + `script>`); // Avoid closing script
			m.$headOrBody.append($kakao_js);
		}
		m.logPrint(`<br><br>kakao.js with id="${m.kakao_js_id}" is loaded.`);
		m.kakaoInitDo = function () {
			if (window.Kakao && window.Kakao?.isInitialized) {
				clearInterval(m.kakaoInit);
				if (!window.Kakao.isInitialized()) {
					window.Kakao.init("c85c800b54a2a95faa5ca7a5e3d357ef");
				}
				m.logPrint(`<br>window.Kakao.isInitialized()=${window.Kakao.isInitialized()};`);
			}
		};
		m.kakaoInit = setInterval(m.kakaoInitDo, 2048);

		m.popUpKakao = function () {
			let $desc = $("meta[name='description']");
			let href = window.location.href;
			window.Kakao.Share.sendDefault({
				objectType: "feed",
				content: {
					title: $("title").html() || $("h1").html() || "제목 없음",
					description: $desc ? $desc.attr("content") : "",
					imageUrl: "",
					link: {
						mobileWebUrl: href,
						webUrl: href,
					},
				},
			});
		};

		// ShortKeys (including default 'processShortcut(event)' of tistory.)
		m.$fdList = $("#header, #shortkey, .promoting, .change-docuK-style, #content, #container, #wrapContent, .docuK .sec>h1, .docuK .sec>h2, .docuK .subsec>h3, .docuK .subsubsec>h4, .comments, .comments>.comment-list>ul>li, #disqus_thread, #aside, #page-views-chart, #chartdiv, #recentComments, #tistorySidebarProfileLayer"); // Ordered automatically by jQuery.
		m.fdList = m.$fdList.get().sort((a, b) => {
			return $(a).offset().top - $(b).offset().top;
		});
		m.$tocs = $(".docuK>.sec").has(".toc");
		m.$rras = $(".docuK>.sec").has("ol.refs");
		m.goOn = false;
		m.logOn = false;
		m.processShortKey = function (event: any) {
			if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
			switch (event.target && event.target.nodeName) {
				case "INPUT":
				case "SELECT":
				case "TEXTAREA":
					return;
			}
			let scrollTop: number;
			let i: number, k: number;
			switch (event.code) {
				case "KeyQ": // To manage
					window.location.href = "/manage";
					break;
				case "KeyA": // Toggle a mess
					$(".toggle-a-mess.order").eq(0).trigger("click");
					break;
				case "KeyE": // Expand/Hide floating keys
					m.toggleFK();
					break;
				case "KeyG":
					event.preventDefault();
					if (window.$fuzzy_search_container.is(":visible")) {
						window.$fuzzy_search_container.hide();
						window.$out_focus.focus();
						window.$button_Go.removeClass("enabled");
						m.goOn = false;
						window.history.pushState({ goOn: m.goOn, logOn: m.logOn }, "");
					} else {
						window.$fuzzy_search_container.show();
						window.$fuzzy_search.focus();
						window.$button_Go.addClass("enabled");
						m.goOn = true;
						window.history.pushState({ goOn: m.goOn, logOn: m.logOn }, "");
					}
					break;
				case "KeyK":
					if (m.$log.is(":visible")) {
						m.$logAll.hide();
						window.$out_focus.focus();
						window.$button_log.removeClass("enabled");
						m.logOn = false;
						window.history.pushState({ goOn: m.goOn, logOn: m.logOn }, "");
					} else {
						m.$logAll.show();
						window.$button_log.addClass("enabled");
						m.logOn = true;
						window.history.pushState({ goOn: m.goOn, logOn: m.logOn }, "");
					}
					break;
				case "KeyF":
				case "KeyD":
					scrollTop = m.$window.scrollTop();
					k = m.fdList.length;
					let $hI;

					if (event.code === "KeyF") {
						scrollTop += 15;
						for (i = 0; i < k; i++) {
							$hI = $(m.fdList[i]);
							if ($hI.is(":visible") && scrollTop < $hI.offset().top) {
								break;
							}
						}
						if (i === k) {
							return;
						}
					} else {
						scrollTop -= 15;
						for (i = k - 1; i >= 0; i--) {
							$hI = $(m.fdList[i]);
							if ($hI.is(":visible") && scrollTop > $hI.offset().top) {
								break;
							}
						}
						if (i === -1) {
							return;
						}
					}
					let $hIWithId = $hI.find("[id]").addBack("[id]");
					let hIID = $hIWithId.eq(0).attr("id");
					if (hIID) {
						window.location.hash = `#${hIID}`;
					} else {
						window.location.hash = "";
					}
					m.$window.scrollTop($hI.offset().top);
					break;
				case "KeyT":
					scrollTop = m.$window.scrollTop();
					k = m.$tocs.length;
					let $tocI: JQuery<HTMLElement>;
					scrollTop -= 10;
					for (i = k - 1; i >= 0; i--) {
						$tocI = m.$tocs.eq(i);
						if ($tocI.is(":visible") && scrollTop > $tocI.offset().top) {
							break;
						}
					}
					if (i === -1) {
						$tocI = m.$tocs.eq(k - 1);
					}
					let $tocIWithId = $tocI.find("[id]").addBack("[id]");
					let tocIID = $tocIWithId.eq(0).attr("id");
					if (tocIID) {
						window.location.hash = `#${tocIID}`;
					} else {
						window.location.hash = "";
					}
					m.$window.scrollTop($tocI.offset().top);
					break;
				case "KeyR":
					scrollTop = m.$window.scrollTop();
					k = m.$rras.length;
					let $rraI: JQuery<HTMLElement>;
					scrollTop -= 10;
					for (i = k - 1; i >= 0; i--) {
						$rraI = m.$rras.eq(i);
						if ($rraI.is(":visible") && scrollTop > $rraI.offset().top) {
							break;
						}
					}
					if (i === -1) {
						$rraI = m.$rras.eq(k - 1);
					}
					let $rraIWithId = $rraI.find("[id]").addBack("[id]");
					let rraIID = $rraIWithId.eq(0).attr("id");
					if (rraIID) {
						window.location.hash = `#${rraIID}`;
					} else {
						window.location.hash = "";
					}
					m.$window.scrollTop($rraI.offset().top);
					break;
				case "KeyL":
					if (window.location.pathname === "/entry/Lists") {
						window.location.pathname = "/category";
					} else {
						window.location.pathname = "/entry/Lists";
					}
					break;
				case "KeyZ":
					if ($("div.comments").length) m.$window.scrollTop($("div.comments").offset().top);
					break;
				case "KeyN":
					m.handleComments();
					break;
				case "KeyX":
					if ($("#disqus_thread").length) m.$window.scrollTop($("#disqus_thread").offset().top);
					break;
				case "KeyI":
					m.docCookies.removeItem("REACTION_GUEST", "/");
					window.location.href = `https://www.tistory.com/auth/login?redirectUrl=${encodeURIComponent(window.location.href)}&isPopup=true`;
					break;
				case "KeyO":
					window.location.href = "https://www.tistory.com/auth/logout";
					break;
				default:
					if (window.processShortcut !== undefined) {
						window.processShortcut(event);
					}
			}
		};
		m.$window.on("keydown.shortkey", m.processShortKey);
		m.logPrint(`<br><br>New ShortKeys (T: Table of Contents, F: Forward Section, D: Previous Section, L: To 전체목록/[Lists]) are set.`);

		m.logPrint(`<br><br>m.delayPad=${m.delayPad};<br>m.wait=${m.wait};`);

		m.handleComments = async function () {
			let $ps = $(".comments .comment-list li p");

			async function processTextNode(textNode: Text): Promise<string> {
				let str = textNode.wholeText;
				return await m.relatedRendering(str);
			}

			m.processElement = async function ($elem: JQuery<HTMLElement>): Promise<void> {
				let contents = $elem.contents();
				let elemHTML = "";

				for (let i = 0; i < contents.length; i++) {
					let content = contents[i] as any;
					if (content?.nodeType === Node.TEXT_NODE) {
						let str = content?.wholeText;
						let codeStarted = false;
						let innerContents = "";
						let emmet = "";
						if (/^```/.test(str)) {
							codeStarted = true;
							let codeEnded = false;
							emmet = str.substring(3);
							i++;
							while (i < contents.length) {
								let nextContent = contents[i] as any;
								let nextStr = nextContent?.wholeText;
								codeEnded = nextContent?.nodeType === Node.TEXT_NODE && typeof nextStr === "string" && /```\//.test(nextStr);
								while (!codeEnded) {
									if (nextContent?.nodeType === Node.TEXT_NODE) {
										innerContents += await processTextNode(nextContent);
									} else {
										innerContents += nextContent.outerHTML;
									}
									i++;
									if (i === contents.length) {
										break;
									}
									nextContent = contents[i];
									nextStr = nextContent?.wholeText;
									codeEnded = nextContent?.nodeType === Node.TEXT_NODE && typeof nextStr === "string" && /```\//.test(nextStr);
									if (codeEnded) {
										innerContents += await processTextNode(nextContent);
										break;
									}
								}
								if (codeEnded) {
									innerContents = innerContents.replace(/```\//, "");
									i++;
									break;
								}
								i++;
							}
						}
						if (codeStarted) {
							emmet = m.getEmmetFromHead(emmet);
							let classes = m.getClassesFromEmmet(emmet);
							let elemId = m.getIdFromEmmet(emmet);
							elemHTML += `<pre${elemId ? ` id="${elemId}"` : ``} class="${classes.split(" ").some((str) => str === "no-linenums") ? "" : "line-numbers "}${classes}"><code class="${classes}">${m.escapeOnlyTag(innerContents.replace(/\n{0,1}\<br\s*\/?\>\n{0,1}/gi, "\n").trim())}</code></pre>`;
						} else {
							elemHTML += await processTextNode(content);
						}
					} else {
						elemHTML += content.outerHTML;
					}
				}

				$elem.html(elemHTML.trim());
			};

			m.processAllElements = async function (): Promise<void> {
				for (let k = 0; k < $ps.length; k++) {
					await m.processElement($ps.eq(k));
				}
			};

			await m.processAllElements();
			$("pre>code").each((index: number, elem: HTMLElement) => {
				const $elem = $(elem);
				if (!$elem.hasClass("no-escape-HTML")) {
					$elem.html(m.escapeOnlyTag($elem.html()));
				}
			});
			// Scrollable switching of 'pre'.
			let $pre = $("pre");
			if (!$pre.hasClass("no-linenums")) {
				$("pre").addClass("line-numbers");
			}
			m.$prePrettyScrollable = $("pre.scrollable");
			for (let i = 0; i < m.$prePrettyScrollable.length; i++) {
				if (!m.$prePrettyScrollable.eq(i).parents(".preC").length) {
					m.$prePrettyScrollable.eq(i).wrap("<div class='preC'></div>").before('<div class="preSSE">On the left side of codes is there a hiden button to toggle/switch scrollability ({max-height:some} or {max-height:none}).</div><div class="preSS" onclick="k.toggleHeight(this)"></div>');
				}
			}
			if ($(".comments").length) {
				window?.MathJax?.typesetPromise?.([$(".comments")[0]]);
				window?.Prism?.highlightAll?.();
			}
			m.reNewAndReOn();
		};

		m.$window.on("resize.menubar", function (e) {
			$("#menubar_wrapper").parents().show();
		});

		m.reNewAndReOn = function () {
			m.$delayedElems = $("[delayed-src], [delayed-bgimage], .to-be-executed, .MathJax_Preview");
			m.$window.off("scroll.delayedLoad").on("scroll.delayedLoad", m.delayedLoadByScroll);
			m.$window.trigger("scroll.delayedLoad");
			m.$fdList = $("#header, #shortkey, .promoting, .change-docuK-style, #content, #container, #wrapContent, .docuK, .docuK .sec>h1, .docuK .sec>h2, .docuK .subsec>h3, .docuK .subsubsec>h4, .comments, .comments>.comment-list>ul>li, #disqus_thread, #aside, #page-views-chart, #chartdiv, #recentComments, #tistorySidebarProfileLayer");
			m.fdList = m.$fdList.get().sort((a, b) => {
				return $(a).offset().top - $(b).offset().top;
			});
		};
		m.handleComments();

		setTimeout(function () {
			m.handleComments();

			// MathJax js script (from cdn.mathjax.org) is added.
			let $mjxConfig = $(
				`<script>
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
</` + `script>`,
			); // Avoid closing script
			m.$headOrBody.append($mjxConfig);
			let $mjx = document.createElement("script");
			$mjx.id = "MathJax-script";
			$mjx.defer = true;
			$mjx.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
			m.$headOrBody.append($mjx);
			m.logPrint(`<br><br>MathJax.js (mathjax@3/es5/tex-mml-chtml.min.js) is loaded.`);
			// MathJax PreProcess after the above MathJax.js is loaded.
			m.mathJaxPreProcessDo = function () {
				if (window.MathJax?.startup !== undefined && window.MathJax.typesetPromise) {
					let mathElems: HTMLElement[] = [];
					if (m.$docuK) {
						mathElems = [...m.$docuK];
					}
					if ($(".comments").length) {
						mathElems.push($(".comments")[0]);
					}
					window.MathJax.typesetPromise(mathElems);
				} else {
					setTimeout(m.mathJaxPreProcessDo, 2048);
				}
			};
			m.mathJaxPreProcess = setTimeout(m.mathJaxPreProcessDo, 2048);

			// Prism.js js script (from cdn.jsdelivr.net CDN) is added.
			m.$headOrBody.append(`<link href="https://tistory1.daumcdn.net/tistory/1468360/skin/images/docuK-prism.css" rel="stylesheet" />`);

			let $prism = document.createElement("script");
			$prism.id = "prism-js";
			$prism.defer = true;
			$prism.src = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js";
			m.$headOrBody.append($prism);
			m.logPrint(`<br><br>Prism.js (code prettifier) is loaded.`);

			let $prism_line_numbers = document.createElement("script");
			$prism_line_numbers.id = "prism-js";
			$prism_line_numbers.defer = true;
			$prism_line_numbers.src = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js";
			m.$headOrBody.append($prism_line_numbers);
			m.logPrint(`<br>Prism-line-numbers.js is loaded.`);

			const codeLangMap: { [key: string]: string } = {
				"lang-js": "prism-javascript",
				"lang-ts": "prism-typescript",
				"lang-html": "prism-markup",
				"lang-css": "prism-css",
				"lang-json": "prism-json",
				"lang-xml": "prism-markup",
				"lang-sql": "prism-sql",
				"lang-sh": "prism-bash",
				"lang-py": "prism-python",
				"lang-java": "prism-java",
				"lang-c": "prism-c",
				"lang-cpp": "prism-cpp",
				"lang-cs": "prism-csharp",
				"lang-php": "prism-php",
				"lang-bat": "prism-batch",
				"lang-git": "prism-git",
				"lang-md": "prism-markdown",
				"lang-env": "prism-env",
			};
			const $preAndCode = $("pre, code");
			const langToBeLoaded: any = [];
			$preAndCode.each((index: number, elem: HTMLElement) => {
				let classes = elem.classList;
				for (let className of classes) {
					if (codeLangMap[className] && !langToBeLoaded[className]) {
						langToBeLoaded[className] = codeLangMap[className];
						langToBeLoaded.push(langToBeLoaded[className]);
					}
				}
			});
			for (let lang of langToBeLoaded) {
				let $script = document.createElement("script");
				$script.id = lang;
				$script.defer = true;
				$script.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/${lang}.min.js`;
				m.$headOrBody.append($script);
				m.logPrint(`<br>${lang}.min.js of prism.js is loaded.`);
			}

			// Closing docuK Log.
			m.logPrint(`<br><br><span class='emph'>docuK scripts are all done. Then this log is closing in 1.0 sec.</span>`);
			m.$window.scrollTop($(window.location.hash)?.offset()?.top ?? m.$window.scrollTop());
			setTimeout(function () {
				m.$logAll.hide();
				m.$window.scrollTop($(window.location.hash)?.offset()?.top ?? m.$window.scrollTop());
			}, 2048);

			m.reNewAndReOn();
		}, 2048);
	});

	// Ads
	const adsHTML = `<div class="docuK-con"><div class="docuK-ads">이 글이 도움이 되셨다면, 광고 클릭 한번씩만 부탁드립니다 =ㅂ=ㅋ.<br>(If this article was helpful, please click the ad once. Thank you. ;)</div></div>`;
	for (let i = 1; i < m.$docuK.length; i++) {
		const $docuKI = m.$docuK.eq(i);
		$docuKI.before(adsHTML);
		$docuKI.after(adsHTML);
	}
})(window.k, jQuery);
