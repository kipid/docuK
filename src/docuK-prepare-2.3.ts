import type {
	DecomposedURI,
	DescR,
	FSToRs,
	FuzzySearch,
	FuzzySearchResult,
	RenderResult,
	SearchVars,
	SplitHangul,
	StrToJSON,
	YTiframeConfig,
	YTiframeResult,
} from "./types/types";

window.m = window.k = window.k || {}; // window.m can be asigned another JSON or number/string and so on. But window.k must be kept.
(function (m, $, undefined) {
	m.version0 = "3.0";
	m.$window = $(window);
	m.$document = $(document);
	m.$html = $("html");
	m.$title = $("title");
	const fsToRs: FSToRs = (m.fsToRs = {
		fixed: false,
	});

	$.fn.exists = function (): boolean {
		return Boolean(this.length);
	};
	m.browserWidth = window.innerWidth;
	m.$docuK = $(".docuK");

	m.getUTF8Length = function (s: string): number {
		let len = 0;
		for (let i = 0; i < s.length; i++) {
			let code = s.charCodeAt(i);
			if (code <= 0x7f) {
				len += 1;
			} else if (code <= 0x7ff) {
				len += 2;
			} else if (code >= 0xd800 && code <= 0xdfff) {
				// Surrogate pair: These take 4 bytes in UTF-8 and 2 chars in UCS-2
				// (Assume next char is the other [valid] half and just skip it)
				len += 4;
				i++;
			} else if (code < 0xffff) {
				len += 3;
			} else {
				len += 4;
			}
		}
		return len;
	};
	m.symArray = Symbol("array");
	m.getSearchVars = function (
		searchStr: string | null | undefined
	): SearchVars {
		let vars: SearchVars = {};
		if (searchStr !== null && searchStr !== undefined && searchStr.length) {
			if (searchStr.startsWith("?")) {
				searchStr = searchStr.substring(1);
			}
			let j = searchStr.indexOf("#");
			if (j !== -1) {
				searchStr = searchStr.substring(0, j);
			}
			let splits = searchStr.replace(/&amp;/gi, "&").split("&");
			vars[m.symArray as symbol] = [];
			for (let i = 0; i < splits.length; i++) {
				let key = splits[i];
				let value = "";
				let k = key.indexOf("=");
				if (k !== -1) {
					value = decodeURIComponent(key.substring(k + 1));
					key = key.substring(0, k);
				}
				key = decodeURIComponent(key);
				vars[m.symArray as symbol][i] = vars[key] = { key: key, val: value };
			}
		}
		return vars;
	};

	////////////////////////////////////////////////////
	// Heap sort.
	////////////////////////////////////////////////////
	m.heapify = function (
		arr: any[],
		key: string,
		sorted: number[],
		n: number,
		i: number
	): void {
		let largest = i;
		let l = 2 * i + 1;
		let r = 2 * i + 2;
		if (l < n && arr[sorted[l]][key] > arr[sorted[largest]][key]) {
			largest = l;
		}
		if (r < n && arr[sorted[r]][key] > arr[sorted[largest]][key]) {
			largest = r;
		}
		if (largest != i) {
			[sorted[i], sorted[largest]] = [sorted[largest], sorted[i]];
			m.heapify(arr, key, sorted, n, largest);
		}
	};
	m.heapsort = function (
		arr: any[],
		key: string,
		sorted: number[],
		upto: number
	): number {
		let n = arr.length;
		for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
			m.heapify(arr, key, sorted, n, i);
		}
		if (upto) {
			upto = upto > n ? n : upto;
		} else {
			upto = n;
		}
		let until = n - upto;
		for (let i = n - 1; i >= until; i--) {
			[sorted[0], sorted[i]] = [sorted[i], sorted[0]];
			m.heapify(arr, key, sorted, i, 0);
		}
		return until;
	};
	m.heapsortRest = function (
		arr: any[],
		key: string,
		sorted: number[],
		upto: number,
		n: number
	): number {
		upto = upto > n ? n : upto;
		let until = n - upto;
		for (let i = n - 1; i >= until; i--) {
			[sorted[0], sorted[i]] = [sorted[i], sorted[0]];
			m.heapify(arr, key, sorted, i, 0);
		}
		return until;
	};

	////////////////////////////////////////////////////
	// Escape and Unescape HTML string.
	////////////////////////////////////////////////////
	m.escapeHTML = function (str: string): string {
		if (!str || typeof str !== "string") {
			return "";
		}
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	};
	m.escapeOnlyTag = function (str: string): string {
		if (!str || typeof str !== "string") {
			return "";
		}
		return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	};
	m.unescapeHTML = function (str: string): string {
		if (!str || typeof str !== "string") {
			return "";
		}
		return str
			.replace(/&gt;/g, ">")
			.replace(/&lt;/g, "<")
			.replace(/&amp;/g, "&");
	};
	m.escapeAMP = function (str: string): string {
		if (!str || typeof str !== "string") {
			return "";
		}
		return str.replace(/%/g, "%25").replace(/&/g, "%26").replace(/#/g, "%23");
	};
	m.unescapeAMP = function (str: string): string {
		if (!str || typeof str !== "string") {
			return "";
		}
		return str.replace(/%23/g, "#").replace(/%26/g, "&").replace(/%25/g, "%");
	};
	m.escapeEncodePctg = function (str: string): string {
		if (!str || typeof str !== "string") {
			return "";
		}
		return str.replace(/([\!\@\#\$\%\^\&\*\[\]\{\}\_\<\>\,\.\/\?\~])/g, "\\$1");
	};

	////////////////////////////////////////////////////
	// URI rendering :: http link itself, videos, images, maps.
	////////////////////////////////////////////////////
	m.ptnURI = {};
	m.ptnURL = /^https?:\/\/[^\s\t\n\r\"\'\`\<\>\{\}\[\]]+/i;
	m.ptnFILE = /^file:\/\/\/[^\s\t\n\r\"\'\`\<\>\{\}\[\]]+/i;
	m.ptnTag = /^<\w+[\s\S]+>/i;
	m.ptnVal = /^([0-9]+(?:\.[0-9]+)?)\/([0-9]+(?:\.[0-9]+)?)$/;

	m.uriToA = function (uri: string | null | undefined): string {
		if (!uri || typeof uri !== "string") {
			uri = String(uri);
		}
		let exec = m.ptnURL.exec(uri);
		if (exec !== null) {
			return `<a target="_blank" href="${exec[0]}">${m.escapeOnlyTag(
				decodeURIComponent(uri).replace(/[\n\s\t\r]/g, " ")
			)}</a>`;
		} else {
			exec = m.ptnFILE.exec(uri);
			if (exec !== null) {
				return `<a target="_blank" href="${exec[0]}">${m.escapeOnlyTag(
					decodeURIComponent(uri).replace(/[\n\s\t\r]/g, " ")
				)}</a>`;
			} else {
				return m.escapeOnlyTag(uri);
			}
		}
	};
	m.videoZIndex = 10000;
	m.togglePosition = function (elem: HTMLElement): void {
		let $elem = $(elem);
		let $parent = $elem.closest(".rC");
		if ($parent.hasClass("fixed")) {
			$parent.removeClass("fixed");
			$parent.css("z-index", 0);
			window.scrollTo(0, $parent.offset().top);
			$elem.text("▲ [--stick to the left top--]");
			m.fsToRs.fixed = false;
		} else {
			window.scrollBy({ left: 0, top: -$parent.height(), behavior: "smooth" });
			$parent.addClass("fixed");
			let $z = $parent.find(".z-index");
			let zIndex = m.videoZIndex;
			if ($z.length) {
				zIndex = parseInt($z.html());
			} else {
				$elem.before(`<span class="none z-index">${m.videoZIndex}</span>`);
				m.videoZIndex--;
			}
			$parent.css("z-index", zIndex);
			$elem.text("▲ [--return to the original position--]");
			m.fsToRs.fixed = true;
		}
	};
	m.rC = function (
		elemStr: string,
		option?: string | null,
		id?: string | null,
		noPc?: boolean
	): string {
		return `<div class="rC${option ? ` ${option}` : ""}"${
			!!id ? ` id="${id}"` : ""
		}><div class="rSC">${elemStr}</div>${
			noPc
				? ""
				: `<div class="pc"><span onclick="k.togglePosition(this)">▲ [--stick to the left top--]</span></div>`
		}</div>`;
	};
	m.YTiframe = function (
		v: string,
		inListPlay: boolean,
		config: YTiframeConfig,
		list?: string
	): string {
		if (list && list.constructor === String) {
			return m.rC(
				`<iframe delayed-src="https://www.youtube.com/embed/videoseries?list=${list}&origin=${window.location.origin}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`,
				inListPlay && m.fsToRs.fixed ? "fixed" : null
			);
		}
		return m.rC(
			`<iframe delayed-src="https://www.youtube.com/embed/${v}?origin=${
				window.location.origin
			}${config.start ? `&start=${config.start}` : ""}${
				config.end ? `&end=${config.end}` : ""
			}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`,
			inListPlay && m.fsToRs.fixed ? "fixed" : null
		);
	};
	m.timeToSeconds = function (time: string): number {
		let secondToSeek = 0;
		let exec = /(?:([0-9]{1,2})\:)?(?:([0-9]{1,2})\:)([0-9]{1,})/.exec(time);
		if (exec !== null) {
			let hour = exec[1];
			let minute = exec[2];
			let second = exec[3];
			if (hour && !isNaN(Number(hour))) {
				secondToSeek += Number(hour) * 3600;
			}
			if (minute && !isNaN(Number(minute))) {
				secondToSeek += Number(minute) * 60;
			}
			if (second && !isNaN(Number(second))) {
				secondToSeek += Number(second);
			}
		}
		return secondToSeek;
	};

	let ptnURI;
	ptnURI =
		m.ptnURI["www.youtube.com"] =
		m.ptnURI["youtube.com"] =
		m.ptnURI["youtu.be"] =
		m.ptnURI["m.youtube.com"] =
			{};
	ptnURI.regEx =
		/^(?:watch|embed|live|shorts|playlist)\/?([\w\-\_]+)?(\?[^\"\'\`\<\>\[\]\s\t\n\r]+)?/i;
	ptnURI.regEx0 = /^([\w\-\_]+)\/?(\?[^\"\'\`\<\>\[\]\s\t\n\r]+)?/i;
	ptnURI.regEx1 = /^(@?[^\"\'\`\<\>\[\]\s\t\n\r]+)?/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean,
		descR: DescR
	): Promise<YTiframeResult> {
		return new Promise(function (resolve, reject): void {
			let config: YTiframeConfig = {};
			if (descR) {
				if (descR["#start"]?.val) {
					config.startSeconds = config.start = m.timeToSeconds(
						descR["#start"].val.trim()
					);
				}
				if (descR["#end"]?.val) {
					config.endSeconds = config.end = m.timeToSeconds(
						descR["#end"].val.trim()
					);
				}
			}
			let exec = m.ptnURI["www.youtube.com"].regEx.exec(uriRest);
			if (exec !== null) {
				let vars = null;
				if (exec[2]) {
					vars = m.getSearchVars(exec[2]);
				}
				let v = null;
				let list = null;
				if (exec[1]) {
					v = exec[1];
				}
				if (vars?.v?.val) {
					v = vars.v.val;
				}
				if (vars?.list?.val) {
					list = vars?.list?.val;
				}
				if (list) {
					return resolve({
						html:
							(toA
								? `<a target="_blank" href="https://www.youtube.com/watch?list=${list}">https://www.youtube.com/watch?list=${list}</a><br/>`
								: "") + m.YTiframe(v, inListPlay, config, list),
						from: "youtube-list",
						list,
						config,
					});
				}
				if (v) {
					return resolve({
						html:
							(toA
								? `<a target="_blank" href="https://www.youtube.com/watch?v=${v}${
										config.start ? `&start=${config.start}` : ""
								  }${config.end ? `&end=${config.end}` : ""}${
										list ? `&list=${list}` : ""
								  }">https://www.youtube.com/watch?v=${v}${
										config.start ? `&start=${config.start}` : ""
								  }${config.end ? `&end=${config.end}` : ""}${
										list ? `&list=${list}` : ""
								  }</a><br/>`
								: "") + m.YTiframe(v, inListPlay, config),
						from: "youtube",
						videoId: v,
						list,
						config,
					});
				}
			} else {
				exec = m.ptnURI["youtu.be"].regEx0.exec(uriRest);
				if (exec !== null) {
					let vars = null;
					if (exec[2]) {
						vars = m.getSearchVars(exec[2]);
					}
					let v = null;
					let list = null;
					if (exec[1]) {
						v = exec[1];
					}
					if (vars?.v?.val) {
						v = vars.v.val;
					}
					if (vars?.list?.val) {
						list = vars.list.val;
					}
					if (list) {
						return resolve({
							html:
								(toA
									? `<a target="_blank" href="https://www.youtube.com/watch?list=${list}">https://www.youtube.com/watch?list=${list}</a><br/>`
									: "") + m.YTiframe(v, inListPlay, config, list),
							from: "youtube-list",
							list,
							config,
						});
					}
					return resolve({
						html:
							(toA
								? `<a target="_blank" href="https://www.youtube.com/watch?v=${v}${
										config.start ? `&start=${config.start}` : ""
								  }${config.end ? `&end=${config.end}` : ""}${
										list ? `&list=${list}` : ""
								  }">https://www.youtube.com/watch?v=${v}${
										config.start ? `&start=${config.start}` : ""
								  }${config.end ? `&end=${config.end}` : ""}${
										list ? `&list=${list}` : ""
								  }</a><br/>`
								: "") + m.YTiframe(v, inListPlay, config),
						from: "youtube",
						videoId: v,
						list,
						config,
					});
				} else {
					exec = m.ptnURI["www.youtube.com"].regEx1.exec(uriRest);
					if (exec !== null) {
						return resolve({
							html: toA
								? `<a target="_blank" href="https://www.youtube.com/${exec[0]}">https://www.youtube.com/${exec[0]}</a>`
								: ``,
							from: "-youtube-link",
						});
					}
				}
			}
			reject(false);
		});
	};

	ptnURI = m.ptnURI["docs.google.com"] = {};
	ptnURI.regEx = /^spreadsheets\/d\/e\/([\w\-\_]+)/i;
	ptnURI.regEx1 = /^spreadsheets\/d\/([\w\-\_]+)/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { docId: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["docs.google.com"].regEx.exec(uriRest);
			if (exec !== null) {
				return resolve({
					html:
						(toA
							? `<a target="_blank" href="https://docs.google.com/spreadsheets/d/e/${exec[1]}/pubhtml">https://docs.google.com/spreadsheets/d/e/${exec[1]}/pubhtml</a><br/>`
							: "") +
						m.rC(
							`<iframe delayed-src="https://docs.google.com/spreadsheets/d/e/${exec[1]}/pubhtml?widget=true&headers=false"></iframe>`
						),
					from: "docs-google",
					docId: exec[1],
				});
			} else {
				let exec = m.ptnURI["docs.google.com"].regEx1.exec(uriRest);
				if (exec !== null) {
					return resolve({
						html: toA
							? `<a target="_blank" href="https://docs.google.com/${uriRest}">https://docs.google.com/${uriRest}</a>`
							: ``,
						from: "-docs-google",
						docId: exec[1],
					});
				}
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI["instagram.com"] = m.ptnURI["www.instagram.com"] = {};
	ptnURI.regEx = /^(?:p|tv|reel)\/([\w\-\_]+)/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { imgId: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["instagram.com"].regEx.exec(uriRest);
			if (exec !== null) {
				resolve({
					html:
						(toA
							? `<a target="_blank" href="https://www.instagram.com/p/${exec[1]}/">https://www.instagram.com/p/${exec[1]}/</a><br/>`
							: "") +
						m.rC(
							`<div class="center"><iframe delayed-src="https://www.instagram.com/p/${exec[1]}/embed" allowtransparency="true"></iframe></div>`,
							"instagram",
							null,
							true
						),
					from: "instagram",
					imgId: exec[1],
				});
			} else {
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI["imgur.com"] = m.ptnURI["www.imgur.com"] = {};
	ptnURI.regEx = /^a\/([\w\-\_]+)/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { imgId: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["imgur.com"].regEx.exec(uriRest);
			if (exec !== null) {
				resolve({
					html:
						(toA
							? `<a target="_blank" href="https://imgur.com/a/${exec[1]}">https://imgur.com/a/${exec[1]}</a><br/>`
							: "") +
						m.rC(
							`<div class="center"><iframe delayed-src="https://imgur.com/a/${exec[1]}/embed?pub=true&context=false" allowtransparency="true"></iframe></div>`,
							"imgur",
							null,
							true
						),
					from: "imgur",
					imgId: exec[1],
				});
			} else {
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI["www.tiktok.com"] = {};
	ptnURI.regEx = /^@(\S+)\/video\/([0-9]+)/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { userId: string; videoId: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["www.tiktok.com"].regEx.exec(uriRest);
			if (exec !== null) {
				resolve({
					html:
						(toA
							? `<a target="_blank" href="https://www.tiktok.com/@${exec[1]}/video/${exec[2]}">https://www.tiktok.com/@${exec[1]}/video/${exec[2]}</a><br/>`
							: "") +
						m.rC(
							`<div class="center"><iframe sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts allow-top-navigation allow-same-origin" delayed-src="https://www.tiktok.com/embed/v2/${
								exec[2]
							}?referrer=${encodeURIComponent(
								window.location.host
							)}"></iframe></div>`,
							"tiktok",
							null,
							true
						),
					from: "tiktok",
					userId: exec[1],
					videoId: exec[2],
				});
			} else {
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI["vt.tiktok.com"] = {};
	ptnURI.regEx = /^(\w+)\//i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<
		RenderResult &
			DecomposedURI & { userId?: string; videoId?: string; newURI?: string }
	> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["vt.tiktok.com"].regEx.exec(uriRest);
			if (exec !== null) {
				let shortURI = `https://vt.tiktok.com/${exec[1]}/`;
				$.ajax({
					type: "POST",
					url: "https://recoeve.net/BlogStat/getFullURI",
					data: shortURI,
					dataType: "text",
				})
					.fail(function (resp) {
						resolve(resp);
					})
					.done(async function (resp) {
						let decomposedURI: DecomposedURI = m.decomposeURI(resp);
						if (decomposedURI.uriHost === "www.tiktok.com") {
							let uriRendered: RenderResult & { newURI?: string } =
								await m.uriRendering(resp, toA, inListPlay);
							// * (uri, toA, inListPlay, descR)
							uriRendered.newURI = resp;
							resolve({ ...uriRendered, ...decomposedURI });
						} else {
							resolve({
								html: toA
									? `<a target="_blank" href="${shortURI}">${shortURI}</a>`
									: "",
								from: "-tiktok-link",
								...decomposedURI,
							});
						}
					});
			}
		});
	};

	ptnURI = m.ptnURI["serviceapi.rmcnmv.naver.com"] = {};
	ptnURI.regEx = /^\S+/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { videoId: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["serviceapi.rmcnmv.naver.com"].regEx.exec(uriRest);
			if (exec !== null) {
				resolve({
					html:
						(toA
							? `<a target="_blank" href="https://serviceapi.rmcnmv.naver.com/${exec[0]}">https://serviceapi.rmcnmv.naver.com/${exec[0]}</a><br/>`
							: "") +
						m.rC(
							`<iframe delayed-src="https://serviceapi.rmcnmv.naver.com/${exec[0]}" marginwidth="0" marginheight="0" allowfullscreen></iframe>`,
							inListPlay && m.fsToRs.fixed ? "fixed" : null
						),
					from: "naver",
					videoId: exec[0],
				});
			} else {
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI["tv.naver.com"] = {};
	ptnURI.regEx = /^(?:v|embed)\/([0-9]+)/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { videoId: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["tv.naver.com"].regEx.exec(uriRest);
			if (exec !== null) {
				resolve({
					html:
						(toA
							? `<a target="_blank" href="https://tv.naver.com/v/${exec[1]}">https://tv.naver.com/v/${exec[1]}</a><br/>`
							: "") +
						m.rC(
							`<iframe delayed-src="https://tv.naver.com/embed/${exec[1]}?autoPlay=false" marginwidth="0" marginheight="0" allowfullscreen></iframe>`,
							inListPlay && m.fsToRs.fixed ? "fixed" : null
						),
					from: "naver",
					videoId: exec[1],
				});
			} else {
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI["weverse.io"] = {};
	ptnURI.regEx = /^(\S+)\/artist\/([0-9\-]+)/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { singer: string; videoId: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["weverse.io"].regEx.exec(uriRest);
			if (exec !== null) {
				resolve({
					html:
						(toA
							? `<a target="_blank" href="https://weverse.io/${exec[1]}/artist/${exec[2]}">https://weverse.io/${exec[1]}/artist/${exec[2]}</a><br/>`
							: "") +
						m.rC(
							`<iframe src="https://weverse.io/${exec[1]}/artist/${exec[2]}" marginwidth="0" marginheight="0" allowfullscreen></iframe>`,
							inListPlay && m.fsToRs.fixed ? "fixed" : null
						),
					from: "weverse",
					singer: exec[1],
					videoId: exec[2],
				});
			} else {
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI["tv.kakao.com"] = m.ptnURI["entertain.daum.net"] = {};
	ptnURI.regEx = /(?:v|cliplink)\/([0-9]+)/i;
	ptnURI.regEx1 = /video\/([0-9]+)/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { videoId: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["tv.kakao.com"].regEx.exec(uriRest);
			if (exec !== null) {
				return resolve({
					html:
						(toA
							? `<a target="_blank" href="https://tv.kakao.com/v/${exec[1]}">https://tv.kakao.com/v/${exec[1]}</a><br/>`
							: "") +
						m.rC(
							`<iframe delayed-src="https://play-tv.kakao.com/embed/player/cliplink/${exec[1]}" allowfullscreen></iframe>`,
							inListPlay && m.fsToRs.fixed ? "fixed" : null
						),
					from: "kakao",
					videoId: exec[1],
				});
			} else {
				exec = m.ptnURI["entertain.daum.net"].regEx1.exec(uriRest);
				if (exec !== null) {
					return resolve({
						html:
							(toA
								? `<a target="_blank" href="https://tv.kakao.com/v/${exec[1]}">https://tv.kakao.com/v/${exec[1]}</a><br/>`
								: "") +
							m.rC(
								`<iframe delayed-src="https://play-tv.kakao.com/embed/player/cliplink/${exec[1]}" allowfullscreen></iframe>`,
								inListPlay && m.fsToRs.fixed ? "fixed" : null
							),
						from: "kakao",
						videoId: exec[1],
					});
				} else {
					reject(false);
				}
			}
		});
	};

	ptnURI = m.ptnURI["tvpot.daum.net"] = {};
	ptnURI.regEx = /^v\/([\w\-\_]+)/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { videoId: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["tvpot.daum.net"].regEx.exec(uriRest);
			if (exec !== null) {
				return resolve({
					html:
						(toA
							? `<a target="_blank" href="https://tvpot.daum.net/v/${exec[1]}">https://tvpot.daum.net/v/${exec[1]}</a><br/>`
							: "") +
						m.rC(
							`<iframe delayed-src="https://videofarm.daum.net/controller/video/viewer/Video.html?vid=${
								exec[1]
							}${exec[1].length < 15 ? "$" : ""}&play_loc=undefined"></iframe>`,
							inListPlay && m.fsToRs.fixed ? "fixed" : null
						),
					from: "daum",
					videoId: exec[1],
				});
			} else {
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI["vimeo.com"] = {};
	ptnURI.regEx = /^([0-9]+)/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { videoId: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["vimeo.com"].regEx.exec(uriRest);
			if (exec !== null) {
				resolve({
					html:
						(toA
							? `<a target="_blank" href="https://vimeo.com/${exec[1]}">https://vimeo.com/${exec[1]}</a><br/>`
							: "") +
						m.rC(
							`<iframe delayed-src="https://player.vimeo.com/video/${exec[1]}" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>`,
							inListPlay && m.fsToRs.fixed ? "fixed" : null
						),
					from: "vimeo",
					videoId: exec[1],
				});
			} else {
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI["www.dailymotion.com"] = {};
	ptnURI.regEx = /video\/(\w+)/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { videoId: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["www.dailymotion.com"].regEx.exec(uriRest);
			if (exec !== null) {
				resolve({
					html:
						(toA
							? `<a target="_blank" href="https://www.dailymotion.com/video/${exec[1]}">https://www.dailymotion.com/video/${exec[1]}</a><br/>`
							: "") +
						m.rC(
							`<iframe delayed-src="https://www.dailymotion.com/embed/video/${exec[1]}" allowfullscreen></iframe>`,
							inListPlay && m.fsToRs.fixed ? "fixed" : null
						),
					from: "dailymotion",
					videoId: exec[1],
				});
			} else {
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI["namu.wiki"] = {};
	ptnURI.regEx = /w\/(.*)/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { pathname: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["namu.wiki"].regEx.exec(uriRest);
			if (exec !== null) {
				let pathname = exec[1].replace(/\+/g, "%20").replace(/%2B/g, "%20");
				resolve({
					html: `<a target="_blank" href="https://namu.wiki/w/${pathname}">https://namu.wiki/w/${m.escapeOnlyTag(
						decodeURIComponent(pathname)
					)}</a>`,
					from: "namu.wiki",
					pathname,
				});
			} else {
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI["www.ted.com"] = m.ptnURI["embed.ted.com"] = {};
	ptnURI.regEx = /^talks\/(\S+)/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { videoId: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["www.ted.com"].regEx.exec(uriRest);
			if (exec !== null) {
				uriRest = uriRest.substring(6);
				let k = uriRest.indexOf("?");
				let vars = null;
				if (k !== -1) {
					vars = m.getSearchVars(uriRest.substring(k));
					uriRest = uriRest.substring(0, k);
				}
				let v = uriRest;
				if (vars?.language) {
					uriRest = "lang/" + vars.language.val + "/" + uriRest;
				}
				resolve({
					html:
						(toA
							? `<a target="_blank" href="https://www.ted.com/${exec[1]}">https://www.ted.com/${exec[1]}</a><br/>`
							: "") +
						m.rC(
							`<iframe delayed-src="https://embed.ted.com/talks/${uriRest}" allowfullscreen></iframe>`,
							inListPlay && m.fsToRs.fixed ? "fixed" : null
						),
					from: "ted",
					videoId: v,
				});
			} else {
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI["w.soundcloud.com"] = {};
	ptnURI.regEx = /^player\/(\?\S+)/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { videoId: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["w.soundcloud.com"].regEx.exec(uriRest);
			if (exec !== null) {
				let vars = m.getSearchVars(exec[1]);
				let lastPath = "player/?";
				for (let i = 0; i < vars[m.symArray].length; i++) {
					if (vars[m.symArray][i].key === "auto_play") {
						lastPath += "auto_play=false&";
					} else {
						lastPath +=
							vars[m.symArray][i].key + "=" + vars[m.symArray][i].val + "&";
					}
				}
				return resolve({
					html:
						(toA
							? `<a target="_blank" href="https://w.soundcloud.com/${exec[1]}">https://w.soundcloud.com/${exec[1]}</a><br/>`
							: "") +
						m.rC(
							`<iframe delayed-src="https://w.soundcloud.com/${lastPath.substring(
								0,
								lastPath.length - 1
							)}"></iframe>`,
							inListPlay && m.fsToRs.fixed ? "fixed soundcloud" : "soundcloud"
						),
					from: "soundcloud",
					videoId: vars?.url?.val,
				});
			} else {
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI["gall.dcinside.com"] = {};
	ptnURI.regEx = /\/movie\/share_movie(\?\S+)/i;
	ptnURI.regEx1 = /\/poll\/vote(\?\S+)/i;
	// https://gall.dcinside.com/board/poll/vote?no=710233
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { videoId?: string; voteId?: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["gall.dcinside.com"].regEx.exec(uriRest);
			if (exec !== null) {
				let vars = m.getSearchVars(exec[1]);
				let v = vars.no?.val;
				if (v) {
					return resolve({
						html:
							(toA
								? `<a target="_blank" href="https://gall.dcinside.com/board/movie/share_movie?no=${v}">https://gall.dcinside.com/board/movie/share_movie?no=${v}</a><br/>`
								: "") +
							m.rC(
								`<iframe delayed-src="https://gall.dcinside.com/board/movie/share_movie?no=${v}"></iframe>`,
								inListPlay && m.fsToRs.fixed ? "fixed" : ""
							),
						from: "dcinside",
						videoId: v,
					});
				} else {
					return resolve({
						html: `<a target="_blank" href="https://gall.dcinside.com/${uriRest}">https://gall.dcinside.com/${m.escapeOnlyTag(
							decodeURIComponent(uriRest)
						)}</a>`,
						from: "dcinside",
					});
				}
			} else {
				exec = m.ptnURI["gall.dcinside.com"].regEx1.exec(uriRest);
				if (exec !== null) {
					let vars = m.getSearchVars(exec[1]);
					let no = vars.no?.val;
					if (no) {
						return resolve({
							html:
								(toA
									? `<a target="_blank" href="https://gall.dcinside.com/board/poll/vote?no=${no}">https://gall.dcinside.com/board/poll/vote?no=${no}</a><br/>`
									: "") +
								m.rC(
									`<iframe src="https://gall.dcinside.com/board/poll/vote?no=${no}"></iframe>`
								),
							from: "dcinside",
							voteId: no,
						});
					}
				}
			}
			reject(false);
		});
	};

	ptnURI = m.ptnURI["v.qq.com"] = {};
	ptnURI.regEx = /([\w\d]+)\/([\w\d]+).html$/i;
	ptnURI.toIframe = function (
		uriRest: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { videoId: string; newURI: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI["v.qq.com"].regEx.exec(uriRest);
			if (exec !== null) {
				let v = exec[2];
				if (v) {
					return resolve({
						html:
							(toA
								? `<a target="_blank" href="https://v.qq.com/${uriRest}">https://v.qq.com/${uriRest}</a><br/>`
								: "") +
							m.rC(
								`<iframe delayed-src="https://v.qq.com/txp/iframe/player.html?vid=${v}"></iframe>`,
								inListPlay && m.fsToRs.fixed ? "fixed" : ""
							),
						from: "qq",
						videoId: v,
						newURI: `https://v.qq.com/${uriRest}`,
					});
				}
			}
			reject(false);
		});
	};

	m.ptnURI[m.symArray] = [];
	ptnURI = m.ptnURI[m.symArray][0] = {};
	ptnURI.regEx =
		/^(https?:\/\/[^\s\t\n\r\"\'\`\<\>\{\}\[\]]+\.(?:jpg|jpeg|bmp|gif|png|webp|svg|tif))(?=$|\?|\s)/i;
	ptnURI.toIframe = function (
		uri: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { src: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI[m.symArray][0].regEx.exec(uri);
			if (exec !== null) {
				resolve({
					html:
						(toA
							? `<a target="_blank" href="${exec[1]}">${m.escapeOnlyTag(
									decodeURIComponent(uri)
							  )}</a><br/>`
							: "") +
						`<div class="center"><img delayed-src="${exec[1]}"/></div>`,
					from: "image",
					src: exec[1],
				});
			} else {
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI[m.symArray][1] = {};
	ptnURI.regEx =
		/^https?:\/\/[^\s\t\n\r\"\'\`\<\>\{\}\[\]]+\.(?:mp4|ogg|webm|avif|avi)(?=$|\?|\s)/i;
	ptnURI.toIframe = function (
		uri: string,
		inListPlay: boolean,
		toA: boolean,
		descR: DescR
	): Promise<RenderResult & { config: YTiframeConfig; src: string }> {
		return new Promise(function (resolve, reject): void {
			let config: YTiframeConfig = {};
			if (descR) {
				if (descR["#start"]?.val) {
					config.start = m.timeToSeconds(descR["#start"].val.trim());
				}
				if (descR["#end"]?.val) {
					config.end = m.timeToSeconds(descR["#end"].val.trim());
				}
				if (config.start || config.end) {
					config.hash = `${config.start ? `#t=${config.start}` : "#t=0"}${
						config.end ? `,${config.end}` : ""
					}`;
				}
			}
			let exec = m.ptnURI[m.symArray][1].regEx.exec(uri);
			if (exec !== null) {
				return resolve({
					html:
						(toA
							? `<a target="_blank" href="${exec[0]}${
									config.hash ? config.hash : ""
							  }">${m.escapeOnlyTag(
									decodeURIComponent(`${uri}${config.hash ? config.hash : ""}`)
							  )}</a><br/>`
							: "") +
						m.rC(
							`<video controls preload="metadata" delayed-src="${exec[0]}${
								config.hash ? config.hash : ""
							}"></video>`,
							inListPlay && m.fsToRs.fixed ? "fixed" : null
						),
					from: "video",
					src: exec[0],
					config,
				});
			} else {
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI[m.symArray][2] = {};
	ptnURI.regEx =
		/^https?:\/\/kr[\d]+\.sogirl\.so(\/[^\s\t\n\r\"\'\`\<\>\{\}\[\]]*)?/i;
	ptnURI.regEx1 =
		/^https?:\/\/kr[\d]+\.sogirl\.co(\/[^\s\t\n\r\"\'\`\<\>\{\}\[\]]*)?/i;
	ptnURI.toIframe = function (
		uri: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { newURI: string; src: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI[m.symArray][2].regEx.exec(uri);
			if (exec !== null) {
				return resolve({
					html: `<a target="_blank" href="https://kr78.sogirl.so${
						exec[1] ? exec[1] : ""
					}">${m.escapeOnlyTag(
						decodeURIComponent(
							`https://kr78.sogirl.so${exec[1] ? exec[1] : ""}`
						)
					)}</a>`,
					newURI: `https://kr78.sogirl.so${exec[1] ? exec[1] : ""}`,
					from: "sogirl",
					src: exec[1],
				});
			} else {
				exec = m.ptnURI[m.symArray][2].regEx1.exec(uri);
				if (exec !== null) {
					return resolve({
						html: `<a target="_blank" href="https://kr78.sogirl.so${
							exec[1] ? exec[1] : ""
						}">${m.escapeOnlyTag(
							decodeURIComponent(
								`https://kr78.sogirl.so${exec[1] ? exec[1] : ""}`
							)
						)}</a>`,
						newURI: `https://kr78.sogirl.so${exec[1] ? exec[1] : ""}`,
						from: "sogirl",
						src: exec[1],
					});
				} else {
					reject(false);
				}
			}
		});
	};

	ptnURI = m.ptnURI[m.symArray][3] = {};
	ptnURI.regEx =
		/^https?:\/\/kr[\d]+\.topgirl\.co(\/[^\s\t\n\r\"\'\`\<\>\{\}\[\]]*)?/i;
	ptnURI.toIframe = function (
		uri: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { newURI: string; src: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI[m.symArray][3].regEx.exec(uri);
			if (exec !== null) {
				resolve({
					html: `<a target="_blank" href="https://kr37.topgirl.co${
						exec[1] ? exec[1] : ""
					}">${m.escapeOnlyTag(
						decodeURIComponent(
							`https://kr37.topgirl.co${exec[1] ? exec[1] : ""}`
						)
					)}</a>`,
					newURI: `https://kr37.topgirl.co${exec[1] ? exec[1] : ""}`,
					from: "topgirl",
					src: exec[1],
				});
			} else {
				reject(false);
			}
		});
	};

	ptnURI = m.ptnURI[m.symArray][4] = {};
	ptnURI.regEx =
		/^file:\/\/\/([^\s\t\n\r\"\'\`\<\>\{\}\[\]]+\.(?:jpg|jpeg|bmp|gif|png|webp|svg|tif))(?=$|\?|\s)/i;
	ptnURI.regEx1 =
		/^file:\/\/\/([^\s\t\n\r\"\'\`\<\>\{\}\[\]]+\.(?:mp4|ogg|webm|avi))(?=$|\?|\s)/i;
	ptnURI.regEx2 =
		/^file:\/\/\/([^\s\t\n\r\"\'\`\<\>\{\}\[\]]+\.(?:pdf|html|htm))(?=$|\?|\s)/i;
	ptnURI.toIframe = function (
		uri: string,
		inListPlay: boolean,
		toA: boolean
	): Promise<RenderResult & { src: string }> {
		return new Promise(function (resolve, reject): void {
			let exec = m.ptnURI[m.symArray][4].regEx.exec(uri);
			let href = null;
			if (exec !== null) {
				href = exec[1].replace(/\+/g, "%20").replace(/%2B/g, "%20");
				uri = uri.replace(/\+/g, "%20").replace(/%2B/g, "%20");
				return resolve({
					html:
						`<a target="_blank" href="${href}">${m.escapeOnlyTag(
							decodeURIComponent(uri)
						)}</a>` +
						m.rC(
							`<div class="center"><img delayed-src="${href}"/></div>`,
							inListPlay && m.fsToRs.fixed ? "fixed eveElse" : "eveElse"
						),
					from: "file-image",
					src: href,
				});
			} else {
				exec = m.ptnURI[m.symArray][4].regEx1.exec(uri);
				if (exec !== null) {
					href = exec[1].replace(/\+/g, "%20").replace(/%2B/g, "%20");
					uri = uri.replace(/\+/g, "%20").replace(/%2B/g, "%20");
					return resolve({
						html:
							`<a target="_blank" href="${href}">${m.escapeOnlyTag(
								decodeURIComponent(uri)
							)}</a><br/>` +
							m.rC(
								`<video controls preload="metadata" delayed-src="${href}"></video>`,
								inListPlay && m.fsToRs.fixed ? "fixed" : null
							),
						from: "file-video",
						src: href,
					});
				} else {
					exec = m.ptnURI[m.symArray][4].regEx2.exec(uri);
					if (exec !== null) {
						href = exec[1].replace(/\+/g, "%20").replace(/%2B/g, "%20");
						uri = uri.replace(/\+/g, "%20").replace(/%2B/g, "%20");
						return resolve({
							html:
								`<a target="_blank" href="${href}">${m.escapeOnlyTag(
									decodeURIComponent(uri)
								)}</a><br/>` +
								m.rC(
									`<iframe delayed-src="${href}"></iframe>`,
									inListPlay && m.fsToRs.fixed ? "fixed" : null
								),
							from: "file-pdf",
							src: href,
						});
					}
				}
				return reject(false);
			}
		});
	};

	m.getConciseURI = function (uri: string): Promise<string> {
		return new Promise(function (resolve, reject): void {
			$.ajax({
				type: "POST",
				url: "https://recoeve.net/reco/getConciseURI",
				data: uri.trim(),
				dataType: "text",
			})
				.fail(function (resp) {
					reject(resp);
				})
				.done(function (resp) {
					resolve(resp);
				});
		});
	};
	m.ptnPureNumber = /^\d+$/;
	m.formatURI = async function (
		uri: string,
		keepOriginal: boolean
	): Promise<string> {
		return new Promise(async function (resolve, reject): Promise<void> {
			if (uri && uri.constructor === String) {
				uri = uri.trim().replace(/[\s\t\n]+/g, " ");
				let exec = m.ptnTag.exec(uri);
				if (exec !== null) {
					try {
						let $uri = $(uri);
						let src = $uri.attr("src");
						if (src) {
							uri = src;
						} else {
							src = $uri.find("[src]").attr("src");
							if (src) {
								uri = src;
							}
						}
					} catch (err) {
						console.log(err);
					}
				}
				exec = m.ptnPureNumber.exec(uri);
				if (exec !== null) {
					uri = "Number: " + uri;
				}
				if (!keepOriginal && m.getUTF8Length(uri) > 255) {
					return m
						.getConciseURI(uri)
						.then((conciseURI: string) => resolve(m.unescapeHTML(conciseURI)));
				}
				return resolve(m.unescapeHTML(uri).trim());
			}
			return resolve("");
		});
	};
	m.decomposeURI = function (uri: string): DecomposedURI {
		uri = String(uri);
		uri = uri.split(/[\s\t\n\r]+/)[0];
		const res: DecomposedURI = {
			uri,
			protocol: null,
			uriHost: null,
			pathname: null,
			search: null,
			hash: null,
		}; // uriHost, pathname, search, hash
		if (uri.length > 4 && uri.substring(0, 4).toLowerCase() === "http") {
			let k = 4;
			res.protocol = "http:";
			if (uri.charAt(k) == "s" || uri.charAt(k) == "S") {
				k++;
				res.protocol = "https:";
			}
			if (uri.startsWith("://", k)) {
				k += 3;
				let l = uri.indexOf("/", k);
				if (l > 0) {
					res.uriHost = uri.substring(k, l);
					let m = uri.indexOf("?", l);
					if (m > 0) {
						res.pathname = uri.substring(l, m);
						let n = uri.indexOf("#", m);
						if (n > 0) {
							res.search = uri.substring(m, n);
							res.hash = uri.substring(n);
						} else {
							res.search = uri.substring(m);
							res.hash = "";
						}
					} else {
						res.search = "";
						let n = uri.indexOf("#", l);
						if (n > 0) {
							res.pathname = uri.substring(l, n);
							res.hash = uri.substring(n);
						} else {
							res.pathname = uri.substring(l);
							res.hash = "";
						}
					}
				} else {
					res.pathname = "";
					let m = uri.indexOf("?", k);
					if (m > 0) {
						res.uriHost = uri.substring(k, m);
						let n = uri.indexOf("#", m);
						if (n > 0) {
							res.search = uri.substring(m, n);
							res.hash = uri.substring(n);
						} else {
							res.search = uri.substring(m);
							res.hash = "";
						}
					} else {
						res.search = "";
						let n = uri.indexOf("#", k);
						if (n > 0) {
							res.uriHost = uri.substring(k, n);
							res.hash = uri.substring(n);
						} else {
							res.uriHost = uri.substring(k);
							res.hash = "";
						}
					}
				}
			}
		}
		if (res.uriHost) {
			res.uriHost = res.uriHost.toLowerCase();
			res.uriWithoutHash =
				res.protocol + "//" + res.uriHost + res.pathname + res.search;
		}
		return res;
	};
	m.uriRendering = function (
		uri: string,
		toA: boolean,
		inListPlay: boolean,
		descR?: DescR
	): Promise<RenderResult & DecomposedURI & { uri: string }> {
		return new Promise(async function (resolve, reject): Promise<void> {
			uri = uri.trim();
			let decomposedURI: DecomposedURI;
			let result: RenderResult;
			const { uriHost, pathname, search, hash } = (decomposedURI =
				m.decomposeURI(uri));
			const uriRest = (pathname ? pathname.substring(1) : "") + search;
			if (uriHost) {
				if (m.ptnURI[uriHost]) {
					try {
						result = await m.ptnURI[uriHost]?.toIframe(
							uriRest,
							inListPlay,
							toA,
							descR
						);
						if (result) {
							return resolve({
								...result,
								...decomposedURI,
								uri,
							});
						}
					} catch (err) {}
				}
				for (let i = 0; i < m.ptnURI[m.symArray].length; i += 1) {
					try {
						result = await m.ptnURI[m.symArray][i]?.toIframe(
							uri,
							inListPlay,
							toA,
							descR
						);
						if (Boolean(result)) {
							return resolve({ ...result, ...decomposedURI, uri });
						}
					} catch (err) {}
				}
				if (toA) {
					return resolve({
						html: m.uriToA(uri),
						from: "uriToA",
						...decomposedURI,
						uri,
					});
				}
			}
			return resolve({
				html: m.escapeOnlyTag(decodeURIComponent(uri)),
				from: "uri",
				...decomposedURI,
				uri,
			});
		});
	};
	m.relatedRendering = function (str: string): Promise<string> {
		return new Promise(async function (resolve, reject): Promise<void> {
			if (!str || typeof str !== "string") {
				return resolve("");
			}
			const ptnURL = /https?:\/\/[^\s\t\n\r\"\'\`\<\>\{\}\[\]]+/gi;
			ptnURL.lastIndex = 0;
			let exec = ptnURL.exec(str);
			let start = 0;
			let res = "";
			while (exec !== null) {
				res += m.escapeOnlyTag(str.substring(start, exec.index));
				let uriRendered = await m.uriRendering(exec[0], true, false, {});
				// * (uri, toA, inListPlay, descR)
				res += uriRendered.html;
				start = ptnURL.lastIndex;
				if (start <= 0 || start >= str.length) {
					break;
				}
				exec = ptnURL.exec(str);
			}
			if (exec === null && start >= 0 && start < str.length) {
				res += m.escapeOnlyTag(str.substring(start));
			}
			resolve(res);
		});
	};

	/*	:: cookies.js :: Slightly edited by kipid at 2023-10-25.
|*|
|*|	A complete cookies reader/writer framework with full unicode support.
|*|
|*|	https://developer.mozilla.org/en-US/docs/DOM/document.cookie
|*|
|*|	This framework is released under the GNU Public License, version 3 or later.
|*|	https://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|	Syntaxes:
|*|	* docCookies.setItem(name, value[, end[, path[, domain[, secure]]]]) // end :: Number: max-age in seconds
|*|	* docCookies.getItem(name)
|*|	* docCookies.removeItem(name[, path], domain)
|*|	* docCookies.hasItem(name)
|*|	* docCookies.keys()
*/
	m.expire = 365 * 24 * 60 * 60; // max-age in seconds.
	m.docCookies = {
		hasItem: function (sKey: string): boolean {
			return new RegExp(
				"(?:^|;\\s*)" +
					encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") +
					"\\s*\\="
			).test(document.cookie);
		},
		getItem: function (sKey: string): string | null {
			return (
				decodeURIComponent(
					document.cookie.replace(
						new RegExp(
							"(?:(?:^|.*;)\\s*" +
								encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") +
								"\\s*\\=\\s*([^;]*).*$)|^.*$"
						),
						"$1"
					)
				) || null
			);
		},
		removeItem: function (
			sKey: string,
			sPath?: string | false,
			sDomain?: string | false,
			bSecure?: boolean
		): boolean {
			if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
				return false;
			}
			document.cookie =
				encodeURIComponent(sKey) +
				"=; expires=Thu, 01 Jan 1970 00:00:00 GMT" +
				(sDomain ? "; domain=" + sDomain : "") +
				(sPath ? "; path=" + sPath : "") +
				(bSecure ? "; secure" : "");
			return true;
		},
		setItem: function (
			sKey: string,
			sValue: string,
			vEnd?: number | string | Date,
			sPath?: string | false,
			sDomain?: string | false,
			bSecure?: boolean
		): boolean {
			if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
				return false;
			}
			let sExpires = "";
			if (vEnd) {
				switch (vEnd.constructor) {
					case Number: {
						sExpires =
							vEnd === Infinity
								? "; expires=Fri, 31 Dec 9999 23:59:59 GMT"
								: "; max-age=" + vEnd;
						break;
					}
					case String: {
						sExpires = "; expires=" + vEnd;
						break;
					}
					case Date: {
						sExpires = "; expires=" + (vEnd as Date).toUTCString();
						break;
					}
				}
			}
			document.cookie =
				encodeURIComponent(sKey) +
				"=" +
				encodeURIComponent(sValue) +
				sExpires +
				(sDomain ? "; domain=" + sDomain : "") +
				(sPath ? "; path=" + sPath : "") +
				(bSecure ? "; secure" : "");
			return true;
		},
		keys: function (): string[] {
			let aKeys = document.cookie
				.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "")
				.split(/\s*(?:\=[^;]*)?;\s*/);
			// for (let nIdx=0;nIdx<aKeys.length;nIdx++) { aKeys[nIdx]=decodeURIComponent(aKeys[nIdx]); }
			return aKeys;
		},
	};

	////////////////////////////////////////////////////
	// Local storage
	////////////////////////////////////////////////////
	m.localStorage = {
		setItem: function (key: string, val: string): boolean {
			localStorage.setItem(encodeURIComponent(key), encodeURIComponent(val));
			return true;
		},
		getItem: function (key: string): string | null {
			return decodeURIComponent(localStorage.getItem(encodeURIComponent(key)));
		},
		removeItem: function (key: string): boolean {
			localStorage.removeItem(encodeURIComponent(key));
			return true;
		},
		clear: function (): boolean {
			localStorage.clear();
			return true;
		},
	};

	m.toggleFK = function (): void {
		if (m.$floating_key.is(":visible")) {
			m.docCookies.setItem("hideFK", "y", Infinity, "/", false, true);
		} else {
			m.docCookies.removeItem("hideFK", "/", false);
		}
		m.$floating_key.toggle();
	};

	m.promoting = function (id: string): string {
		if (m.recoCats) {
			m.recoCat = m.recoCats.split(";")[0];
		} else {
			m.recoCat = "[Music/Break]--K-Pop";
		}
		return `<div class="button toggle-a-mess fRight cBoth order" onclick="k.toggleAMess(this)">Toggle <span class="bold underline">a</span> mess</div>
<div class="cBoth"></div>
<div class="promoting order"${id ? ` id="${id}"` : ""}>
<div class="p">* 홍보/Promoting <span style="color:rgb(255,180,180)">Reco</span><span style="color:rgb(100,100,255)">eve</span>.net (3S | Slow/Sexy/Sincere SNS)</div>
<div class="bcf">
<a target="_blank" href="https://recoeve.net/user/kipid/mode/multireco?cat=%5BMusic%2FBreak%5D--K-Pop#headPlay">유튜브 음악 MV 들을 광고없이 목록재생</a> 해보세요.<br/>
접속하셔서 별점만 드레그 하시면 자신의 페이지에 저장 됩니다.<br/>
그리고 자신의 페이지로 이동한 뒤 추천 받기 (단축키 R) 를 누르시면 자신이 점수 메긴것들로 이웃 (이웃보기 단축키 B) 을 자동으로 찾아주고 그 이웃들로부터 추천을 받을 수 있습니다.<br/>
<br/>
Come <a target="_blank" href="https://recoeve.net/user/kipid/mode/multireco?cat=%5BMusic%2FBreak%5D--Pop#headPlay">here ([Music/Break]--Pop of kipid's Recoeve.net)</a> and just drag stars/points.<br/>
Based on your points on URIs (musics), you will be connected to your neighbors (See neighbors: shortkey 'B') of your kind. And you will get recoms (recommendations: shortkey 'R') from them, and also give recoms to them.
</div>
<div class="bcf">
<span class="bold">평가와 기록</span>: 웹사이트에서 본 기사, 뉴스, 영상, 음악 등을 기록하고 평가하세요. 이 정보는 추천 알고리즘을 통해 사용자에게 맞춤형 추천을 제공하는 데 사용됩니다. 즉, 당신이 좋아하는 유형의 콘텐츠를 더 많이 발견할 수 있습니다.<br/>
<br/>
<span class="bold">Evaluate and Rate Content</span>: As you explore content on the platform, you can evaluate and rate it based on your preferences and interests. This could involve liking, rating, or commenting on articles, posts, or other types of content.<br/>
<br/>
<span class="bold">Connect with Like-Minded Users</span>: The platform likely has features for connecting with other users who share your interests. You might follow or connect with these users to build your network.
</div>
<div class="caption p cmt" style="margin:1em 0 0">
* For the usage examples, visit my page (예제를 보시려면 제 페이지를 방문해 주세요.)
<ul>
<li><a target="_blank" href="https://recoeve.net/user/kipid/mode/multireco?cat=%5BMusic%2FBreak%5D--K-Pop#headPlay">[Music/Break]--K-Pop of kipid's Recoeve.net (Multireco mode)</a></li>
<li><a target="_blank" href="https://recoeve.net/user/kipid/mode/multireco?cat=%5BMusic%2FBreak%5D--Pop#headPlay">[Music/Break]--Pop of kipid's Recoeve.net (Multireco mode)</a></li>
<li><a target="_blank" href="https://recoeve.net/user/kipid/mode/multireco?cat=%5BMusic%2FBreak%5D--%EB%82%A8%EA%B7%9C%EB%A6%AC#headPlay">[Music/Break]--남규리 | Nam Gyuri (Actor of Korea) of kipid's Recoeve.net (Multireco mode)</a></li>
<li><a target="_blank" href="https://recoeve.net/user/kipid/mode/multireco?cat=%5BMusic%2FBreak%5D--Pet#headPlay">[Music/Break]--Pet of kipid's Recoeve.net (Multireco mode)</a></li>
<li><a target="_blank" href="https://recoeve.net/user/kipid?cat=%5BPhysics%2FMath%2FScience%5D--Physics&PRL=0.80&PRR=1.00#headPlay">[Physics/Math/Science]--Physics of kipid's Recoeve.net</a></li>
<li><a target="_blank" href="https://recoeve.net/user/kipid?cat=%5B%EC%9D%8C%EC%8B%9D%2F%EC%9A%94%EB%A6%AC%2F%EA%B1%B4%EA%B0%95%5D--%EA%B1%B4%EA%B0%95&PRL=0.80&PRR=1.00#headPlay">[음식/요리/건강]--건강 of kipid's Recoeve.net</a></li>
</ul>
</div>
<div class="caption p cmt" style="margin:1em 0 0">Recoeve.net Manual collection | 사용방법 모음집: <a class="wheat" target="_blank" href="https://recoeve.net/user/kipid/mode/multireco?cat=%5BRecoeve%5D--Manual%2F%EC%84%A4%EB%AA%85%EC%84%9C#headPlay">[Recoeve]--Manual/설명서 of kipid's Recoeve.net</a></div>
<div class="caption p cmt" style="margin:1em 0 0"><a target="_blank" href="https://recoeve.net/user/${
			m.recoeveUserId ? encodeURIComponent(m.recoeveUserId) : "kipid"
		}/mode/multireco?cat=${encodeURIComponent(
			m.recoCat
		)}&ToR=#numbers-of-recos">${m.escapeOnlyTag(m.recoCat)} of ${
			m.recoeveUserId ? encodeURIComponent(m.recoeveUserId) : "kipid"
		}'s Recoeve.net (multireco mode)</a>
<div class="rC recoeve"><div class="rSC">
<iframe delayed-src="https://recoeve.net/user/${
			m.recoeveUserId ? encodeURIComponent(m.recoeveUserId) : "kipid"
		}/mode/multireco?cat=${encodeURIComponent(
			m.recoCat
		)}&ToR=#numbers-of-recos" frameborder="0"></iframe>
</div></div></div>
</div>
<div class="button toggle-a-mess fRight cBoth order" onclick="k.toggleAMess(this)">Toggle <span class="bold underline">a</span> mess</div>
<div class="cBoth"></div>`;
	};

	// logPrint function.
	m.$log = $("#docuK-log");
	m.$log.addClass("fixed");
	m.$log.before(
		`<div class="docuK-log exit" onclick="k.$window.trigger({type:'keydown', code:'KeyK'})"><svg><g style="stroke:white;stroke-width:23%"><line x1="20%" y1="20%" x2="80%" y2="80%"></line><line x1="80%" y1="20%" x2="20%" y2="80%"></line></g>✖</svg></div>`
	);
	m.$logAll = $("#docuK-log, .docuK-log.exit");
	m.logPrint = function (str: string): void {
		m.$log.append(str);
		m.$log.scrollTop(m.$log[0].scrollHeight);
	};
	m.logPrint(`m.logPrint() is working!`);
	m.$log
		.after(`<div class="fs-container" id="fuzzy-search-container" style="display:none">
<div class="fs-name">Go: Fuzzy search</div>
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
<textarea class="fs-input single-line" id="fuzzy-search"></textarea>
<div class="fs-list" id="fuzzy-search-list"></div>
<div class="reset" style="z-index:20000; position:absolute; display:inline-block; right:1.8em; top:0; width:1.8em; height:1.8em; line-height:1.0; text-align:center; cursor:pointer; border:2px rgb(80, 80, 80) solid; background-color:rgb(30,30,30); color:white"><svg style="display:inline-block; width:100%; height:100%"><g style="stroke:white; stroke-width:10%; stroke-linecap:round">
<line x1="20%" y1="30%" x2="80%" y2="30%"></line>
<line x1="80%" y1="30%" x2="80%" y2="70%"></line>
<line x1="80%" y1="70%" x2="20%" y2="70%"></line>
<line x1="20%" y1="70%" x2="30%" y2="60%"></line>
<line x1="20%" y1="70%" x2="30%" y2="80%"></line>
</g></svg></div>
<div class="exit" onclick="k.$window.trigger({type:'keydown', code:'KeyG'})"><svg><g style="stroke:white;stroke-width:23%"><line x1="20%" y1="20%" x2="80%" y2="80%"></line><line x1="80%" y1="20%" x2="20%" y2="80%"></line></g>✖</svg></div>
</div>
<a id="out-focus" class="none">out focus</a>`);

	window.$out_focus = $("#out-focus");
	window.$fuzzy_search_container = $("#fuzzy-search-container");
	window.$fuzzy_search_container_move = $("#fuzzy-search-container>.move");
	window.$fuzzy_search = $("#fuzzy-search");
	window.$fuzzy_search_list = $("#fuzzy-search-list");

	window.$fuzzy_search_container_move.on(
		"mousedown.move touchstart.move",
		function (e) {
			let touch0 =
				e.type === "touchstart" ? (e as any).originalEvent.touches[0] : e;
			let relativeX =
				touch0.clientX -
				Math.round(window.$fuzzy_search_container_move.offset().left) +
				m.$window.scrollLeft();
			let relativeY =
				touch0.clientY -
				Math.round(window.$fuzzy_search_container_move.offset().top) +
				m.$window.scrollTop();
			m.$html.on("mousemove.move touchmove.move", function (e) {
				window.getSelection().removeAllRanges();
				e.preventDefault();
				e.stopPropagation();
				let touch0 =
					e.type === "touchmove" ? (e as any).originalEvent.touches[0] : e;
				window.$fuzzy_search_container.css({
					left: touch0.clientX - relativeX,
					top: touch0.clientY - relativeY,
				});
				m.$html.on("mouseup.move touchend.move", function () {
					m.$html.off(
						"mouseup.move touchend.move mousemove.move touchmove.move"
					);
				});
			});
		}
	);

	$("#fuzzy-search-container>.reset").on("click.reset", function (e) {
		(window.$fuzzy_search as JQuery<HTMLTextAreaElement>)[0].value = "";
		(window.$fuzzy_search as JQuery<HTMLTextAreaElement>).focus();
		(window.$fuzzy_search as JQuery<HTMLTextAreaElement>).trigger("keyup.fs");
	});

	// Fuzzy Search
	////////////////////////////////////////////////////
	// Hangul (Korean) split and map to English
	// KE : Korean Expanded
	////////////////////////////////////////////////////
	m.jamoKE = [
		"ㄱ",
		"ㄱㄱ",
		"ㄱㅅ",
		"ㄴ",
		"ㄴㅈ",
		"ㄴㅎ",
		"ㄷ",
		"ㄷㄷ",
		"ㄹ",
		"ㄹㄱ",
		"ㄹㅁ",
		"ㄹㅂ",
		"ㄹㅅ",
		"ㄹㅌ",
		"ㄹㅍ",
		"ㄹㅎ",
		"ㅁ",
		"ㅂ",
		"ㅂㅂ",
		"ㅂㅅ",
		"ㅅ",
		"ㅅㅅ",
		"ㅇ",
		"ㅈ",
		"ㅈㅈ",
		"ㅊ",
		"ㅋ",
		"ㅌ",
		"ㅍ",
		"ㅎ",
		"ㅏ",
		"ㅐ",
		"ㅑ",
		"ㅒ",
		"ㅓ",
		"ㅔ",
		"ㅕ",
		"ㅖ",
		"ㅗ",
		"ㅗㅏ",
		"ㅗㅐ",
		"ㅗㅣ",
		"ㅛ",
		"ㅜ",
		"ㅜㅓ",
		"ㅜㅔ",
		"ㅜㅣ",
		"ㅠ",
		"ㅡ",
		"ㅡㅣ",
		"ㅣ",
	];
	m.jamo = [
		"ㄱ",
		"ㄲ",
		"ㄳ",
		"ㄴ",
		"ㄵ",
		"ㄶ",
		"ㄷ",
		"ㄸ",
		"ㄹ",
		"ㄺ",
		"ㄻ",
		"ㄼ",
		"ㄽ",
		"ㄾ",
		"ㄿ",
		"ㅀ",
		"ㅁ",
		"ㅂ",
		"ㅃ",
		"ㅄ",
		"ㅅ",
		"ㅆ",
		"ㅇ",
		"ㅈ",
		"ㅉ",
		"ㅊ",
		"ㅋ",
		"ㅌ",
		"ㅍ",
		"ㅎ",
		"ㅏ",
		"ㅐ",
		"ㅑ",
		"ㅒ",
		"ㅓ",
		"ㅔ",
		"ㅕ",
		"ㅖ",
		"ㅗ",
		"ㅘ",
		"ㅙ",
		"ㅚ",
		"ㅛ",
		"ㅜ",
		"ㅝ",
		"ㅞ",
		"ㅟ",
		"ㅠ",
		"ㅡ",
		"ㅢ",
		"ㅣ",
	];

	m.mapKE = {
		q: "ㅂ",
		Q: "ㅃ",
		w: "ㅈ",
		W: "ㅉ",
		e: "ㄷ",
		E: "ㄸ",
		r: "ㄱ",
		R: "ㄲ",
		t: "ㅅ",
		T: "ㅆ",
		y: "ㅛ",
		Y: "ㅛ",
		u: "ㅕ",
		U: "ㅕ",
		i: "ㅑ",
		I: "ㅑ",
		o: "ㅐ",
		O: "ㅒ",
		p: "ㅔ",
		P: "ㅖ",
		a: "ㅁ",
		A: "ㅁ",
		s: "ㄴ",
		S: "ㄴ",
		d: "ㅇ",
		D: "ㅇ",
		f: "ㄹ",
		F: "ㄹ",
		g: "ㅎ",
		G: "ㅎ",
		h: "ㅗ",
		H: "ㅗ",
		j: "ㅓ",
		J: "ㅓ",
		k: "ㅏ",
		K: "ㅏ",
		l: "ㅣ",
		L: "ㅣ",
		z: "ㅋ",
		Z: "ㅋ",
		x: "ㅌ",
		X: "ㅌ",
		c: "ㅊ",
		C: "ㅊ",
		v: "ㅍ",
		V: "ㅍ",
		b: "ㅠ",
		B: "ㅠ",
		n: "ㅜ",
		N: "ㅜ",
		m: "ㅡ",
		M: "ㅡ",
	};
	for (let p in m.mapKE) {
		m.mapKE[m.mapKE[p]] = p; // Add reversed mapping.
	}

	m.rChoKE = [
		"ㄱ",
		"ㄱㄱ",
		"ㄴ",
		"ㄷ",
		"ㄷㄷ",
		"ㄹ",
		"ㅁ",
		"ㅂ",
		"ㅂㅂ",
		"ㅅ",
		"ㅅㅅ",
		"ㅇ",
		"ㅈ",
		"ㅈㅈ",
		"ㅊ",
		"ㅋ",
		"ㅌ",
		"ㅍ",
		"ㅎ",
	];
	m.rCho = [
		"ㄱ",
		"ㄲ",
		"ㄴ",
		"ㄷ",
		"ㄸ",
		"ㄹ",
		"ㅁ",
		"ㅂ",
		"ㅃ",
		"ㅅ",
		"ㅆ",
		"ㅇ",
		"ㅈ",
		"ㅉ",
		"ㅊ",
		"ㅋ",
		"ㅌ",
		"ㅍ",
		"ㅎ",
	];

	m.rJungKE = [
		"ㅏ",
		"ㅐ",
		"ㅑ",
		"ㅒ",
		"ㅓ",
		"ㅔ",
		"ㅕ",
		"ㅖ",
		"ㅗ",
		"ㅗㅏ",
		"ㅗㅐ",
		"ㅗㅣ",
		"ㅛ",
		"ㅜ",
		"ㅜㅓ",
		"ㅜㅔ",
		"ㅜㅣ",
		"ㅠ",
		"ㅡ",
		"ㅡㅣ",
		"ㅣ",
	];
	m.rJung = [
		"ㅏ",
		"ㅐ",
		"ㅑ",
		"ㅒ",
		"ㅓ",
		"ㅔ",
		"ㅕ",
		"ㅖ",
		"ㅗ",
		"ㅘ",
		"ㅙ",
		"ㅚ",
		"ㅛ",
		"ㅜ",
		"ㅝ",
		"ㅞ",
		"ㅟ",
		"ㅠ",
		"ㅡ",
		"ㅢ",
		"ㅣ",
	];

	m.rJongKE = [
		"",
		"ㄱ",
		"ㄱㄱ",
		"ㄱㅅ",
		"ㄴ",
		"ㄴㅈ",
		"ㄴㅎ",
		"ㄷ",
		"ㄹ",
		"ㄹㄱ",
		"ㄹㅁ",
		"ㄹㅂ",
		"ㄹㅅ",
		"ㄹㅌ",
		"ㄹㅍ",
		"ㄹㅎ",
		"ㅁ",
		"ㅂ",
		"ㅂㅅ",
		"ㅅ",
		"ㅅㅅ",
		"ㅇ",
		"ㅈ",
		"ㅊ",
		"ㅋ",
		"ㅌ",
		"ㅍ",
		"ㅎ",
	];
	m.rJong = [
		"",
		"ㄱ",
		"ㄲ",
		"ㄳ",
		"ㄴ",
		"ㄵ",
		"ㄶ",
		"ㄷ",
		"ㄹ",
		"ㄺ",
		"ㄻ",
		"ㄼ",
		"ㄽ",
		"ㄾ",
		"ㄿ",
		"ㅀ",
		"ㅁ",
		"ㅂ",
		"ㅄ",
		"ㅅ",
		"ㅆ",
		"ㅇ",
		"ㅈ",
		"ㅊ",
		"ㅋ",
		"ㅌ",
		"ㅍ",
		"ㅎ",
	];

	m.splitHangul = function (str: string): SplitHangul {
		let res: SplitHangul = {
			array: [],
			originalStr: str,
			splitted3: "",
			splitted: "",
			pCho: [], // position of word-start or 초성
		};
		let p = 0;
		res.pCho[p] = true;
		let cho: number, jung: number, jong: number;
		for (let i = 0; i < str.length; i++) {
			let c: string = str.charAt(i);
			let n: number = str.charCodeAt(i);
			if (n >= 0x3131 && n <= 0x3163) {
				n -= 0x3131;
				res.array[i] = { char: c, splitted3: c, splitted: m.jamoKE[n] };
				res.pCho[p] = true;
			} else if (n >= 0xac00 && n <= 0xd7a3) {
				n -= 0xac00;
				jong = n % 28;
				jung = ((n - jong) / 28) % 21;
				cho = ((n - jong) / 28 - jung) / 21;
				res.array[i] = {
					char: c,
					splitted3: m.rCho[cho] + m.rJung[jung] + m.rJong[jong],
					splitted: m.rChoKE[cho] + m.rJungKE[jung] + m.rJongKE[jong],
				};
				res.pCho[p] = true;
			} else {
				res.array[i] = { char: c, splitted3: c, splitted: c };
				if (
					i > 0 &&
					/[^a-zA-Z0-9]$/.test(res.array[i - 1].splitted) &&
					/[a-zA-Z0-9]/.test(c)
				) {
					res.pCho[p] = true;
				}
			}
			p += res.array[i].splitted.length;
			res.splitted3 += res.array[i].splitted3;
			res.splitted += res.array[i].splitted;
		}
		return res;
	};

	////////////////////////////////////////////////////
	// Fuzzy search prepare
	////////////////////////////////////////////////////
	m.fsLength = 300;
	m.fsGo = {
		array: [{ ptnSH: m.splitHangul("$!@#") }, { ptnSH: m.splitHangul("$!@#") }],
		fullList: [],
		$fs: window.$fuzzy_search as JQuery<HTMLTextAreaElement>,
		$fsl: window.$fuzzy_search_list,
		$fsLis: window.$fuzzy_search_list.find(".list-item"),
		shuffled: [],
	};
	m.quote = function (str: string): string {
		return str
			.replace(/[.?*+^$[\]\\{}()|-]/g, "\\$&")
			.replace(/\s/g, "[\\s\\S]");
	};
	m.spaceRegExpStr = new RegExp(m.quote(" "), "ig").toString();
	m.arrayRegExs = function (ptnSH: SplitHangul): RegExp[] {
		let str = ptnSH.splitted;
		let res: RegExp[] = [];
		for (let i = 0; i < str.length; i++) {
			let c: string = str.charAt(i);
			let mapKE: string | undefined = m.mapKE[c];
			if (mapKE) {
				res.push(new RegExp("[" + c + mapKE + "]", "ig"));
			} else {
				res.push(new RegExp(m.quote(c), "ig"));
			}
		}
		return res;
	};
	m.highlightStrFromIndices = function (
		strSplitted: SplitHangul,
		indices: { start: number; end: number }[]
	): string {
		let res = "";
		for (
			let i = 0, j = 1, k = 0, p1 = 0, p2 = 0;
			j <= indices.length;
			i = j, j++
		) {
			while (j < indices.length && indices[j - 1].end === indices[j].start) {
				j++;
			}
			for (; k < strSplitted.array.length; k++) {
				p1 = p2;
				p2 = p1 + strSplitted.array[k].splitted.length;
				if (p2 <= indices[i].start) {
					strSplitted.array[k].matched = false;
				} else if (p1 < indices[j - 1].end) {
					strSplitted.array[k].matched = true;
				} else {
					if (j === indices.length) {
						for (; k < strSplitted.array.length; k++) {
							strSplitted.array[k].matched = false;
						}
					}
					p2 = p1;
					break;
				}
			}
		}
		for (let i = 0; i < strSplitted.array.length; ) {
			if (strSplitted.array[i].matched) {
				res += '<span class="bold">';
				while (i < strSplitted.array.length && strSplitted.array[i].matched) {
					res += m.escapeOnlyTag(strSplitted.array[i].char);
					i++;
				}
				res += "</span>";
			} else {
				while (i < strSplitted.array.length && !strSplitted.array[i].matched) {
					res += m.escapeOnlyTag(strSplitted.array[i].char);
					i++;
				}
			}
		}
		return res;
	};
	m.matchScoreFromIndices = function (
		strSH: SplitHangul,
		ptnSH: SplitHangul,
		indices: { start: number; end: number }[]
	): number {
		let res = 0;
		for (let i = 0; i < indices.length; i++) {
			if (strSH.pCho[indices[i].start]) res += 15;
		}
		for (let i = 1; i < indices.length; i++) {
			let diff = indices[i].start - indices[i - 1].start;
			if (diff < 5) res += 8 * (5 - diff);
		}
		return res;
	};
	m.fuzzySearch = function (
		ptnSH: SplitHangul,
		fs: FuzzySearch
	): FuzzySearchResult {
		if (ptnSH.splitted === fs.array[0].ptnSH.splitted) {
			return fs.array[0];
		}
		if (ptnSH.splitted.indexOf(fs.array[0].ptnSH.splitted) >= 0) {
			fs.array[1] = fs.array[0];
		} else if (
			fs.array[1] &&
			ptnSH.splitted.indexOf(fs.array[1].ptnSH.splitted) >= 0
		) {
			if (ptnSH.splitted === fs.array[1].ptnSH.splitted) {
				return fs.array[1];
			}
		} else {
			fs.array[1] = null;
		}
		let list = [];
		if (fs.array[1] && fs.array[1].sorted) {
			let sorted = fs.array[1].sorted;
			for (let i = 0; i < sorted.length; i++) {
				list.push(fs.fullList[fs.array[1][sorted[i]].i]);
			}
		} else {
			if (fs.shuffled) {
				let shuffled = fs.shuffled;
				for (let i = 0; i < shuffled.length; i++) {
					list.push(fs.fullList[shuffled[i].i]);
				}
			} else {
				let l = fs.fullList.length;
				for (let i = 0; i < l; i++) {
					list.push(fs.fullList[l - 1 - i]);
				}
			}
		}
		fs.array[0] = { ptnSH };
		let regExs = m.arrayRegExs(ptnSH);
		let regExsReversed = [];
		for (let i = 0; i < regExs.length; i++) {
			regExsReversed[i] = regExs[regExs.length - 1 - i];
		}
		for (let i = 0; i < list.length; i++) {
			let listI = list[i];
			if (regExs.length > 0) {
				let txt = listI.txt;
				let txtS = txt.splitted;
				let txtSReversed = txtS.split("").reverse().join("");
				regExs[0].lastIndex = 0;
				let exec = regExs[0].exec(txtS);
				let matched = exec !== null;
				let indices = [];
				if (matched) {
					indices[0] = { start: exec.index, end: regExs[0].lastIndex };
				}
				for (let j = 1; matched && j < regExs.length; j++) {
					regExs[j].lastIndex = regExs[j - 1].lastIndex;
					exec = regExs[j].exec(txtS);
					matched = exec !== null;
					if (matched) {
						indices[j] = { start: exec.index, end: regExs[j].lastIndex };
					}
				}
				let maxMatchScore = 0;
				if (matched) {
					maxMatchScore = m.matchScoreFromIndices(txt, ptnSH, indices);
					let indicesMMS = []; // indices of max match score
					for (let p = 0; p < indices.length; p++) {
						indicesMMS[p] = indices[p]; // hard copy of indices
					}
					if (txt.length < m.fsLength) {
						for (let k = indices.length - 1; k >= 0; ) {
							if (regExs[k].toString() === m.spaceRegExpStr) {
								k--;
								continue;
							}
							regExs[k].lastIndex = indices[k].start + 1;
							exec = regExs[k].exec(txtS);
							matched = exec !== null;
							if (matched) {
								indices[k] = { start: exec.index, end: regExs[k].lastIndex };
							}
							for (let j = k + 1; matched && j < regExs.length; j++) {
								regExs[j].lastIndex = regExs[j - 1].lastIndex;
								exec = regExs[j].exec(txtS);
								matched = exec !== null;
								if (matched) {
									indices[j] = { start: exec.index, end: regExs[j].lastIndex };
								}
							}
							if (matched) {
								let matchScore = m.matchScoreFromIndices(txt, ptnSH, indices);
								if (matchScore > maxMatchScore) {
									maxMatchScore = matchScore;
									indicesMMS = [];
									for (let p = 0; p < indices.length; p++) {
										indicesMMS[p] = indices[p]; // hard copy of indices
									}
								}
								k = indices.length - 2;
							} else {
								k--;
							}
						}
					} else {
						// Reverse match and compare only two results.
						regExsReversed[0].lastIndex = 0;
						exec = regExsReversed[0].exec(txtSReversed);
						matched = exec !== null;
						let indicesReversed = [];
						if (matched) {
							indicesReversed[0] = {
								start: exec.index,
								end: regExsReversed[0].lastIndex,
							};
						}
						for (let j = 1; matched && j < regExsReversed.length; j++) {
							regExsReversed[j].lastIndex = regExsReversed[j - 1].lastIndex;
							exec = regExsReversed[j].exec(txtSReversed);
							matched = exec !== null;
							if (matched) {
								indicesReversed[j] = {
									start: exec.index,
									end: regExsReversed[j].lastIndex,
								};
							}
						}
						if (matched) {
							indices = [];
							for (let j = 0; j < indicesReversed.length; j++) {
								let iR = indicesReversed[indicesReversed.length - 1 - j];
								indices[j] = {
									start: txtSReversed.length - iR.end,
									end: txtSReversed.length - iR.start,
								};
							}
							let matchScore = m.matchScoreFromIndices(txt, ptnSH, indices);
							if (matchScore > maxMatchScore) {
								maxMatchScore = matchScore;
								indicesMMS = indices;
							}
						}
					}
					fs[0].push({
						i: listI.i,
						maxMatchScore: maxMatchScore,
						highlight: m.highlightStrFromIndices(txt, indicesMMS),
					});
				}
			} else {
				fs.array[0].array.push({ i: listI.i, maxMatchScore: 0 });
			}
		}
		let sorted: number[] = (fs.array[0].sorted = []);
		for (let i = 0; i < fs.array[0].array.length; i++) {
			// sorted[i]=fs[0].length-1-i;
			// sorted[i]=i;
			sorted.push(i);
		}
		for (let i = 1; i < sorted.length; i++) {
			let temp = sorted[i];
			let j = i;
			for (
				;
				j > 0 &&
				fs.array[0].array[sorted[j - 1]].maxMatchScore <
					fs.array[0].array[temp].maxMatchScore;
				j--
			) {
				sorted[j] = sorted[j - 1];
			}
			sorted[j] = temp;
		}
		return fs.array[0];
	};

	(window.$fuzzy_search as JQuery<HTMLTextAreaElement>).on(
		"keydown.fs-move-exit",
		function (e: any) {
			e.stopPropagation();
			switch (e.code) {
				case "Escape": // ESC=27
					e.preventDefault();
					m.$window.trigger({ type: "keydown", code: "KeyG" } as any); // G=71
					break;
				case "ArrowUp": // up=38
				case "ArrowDown": // down=40
					e.preventDefault();
					let $fsl = window.$fuzzy_search_list;
					let $lis = $fsl.find(".list-item");
					let $liSelected = $fsl.find(".list-item.selected").eq(0);
					let $liTo = null;
					if ($liSelected.length) {
						if (e.code === "ArrowUp") {
							$liTo = $liSelected.prev();
						} else {
							$liTo = $liSelected.next();
						}
						if ($liTo.length) {
							$liTo.eq(0).trigger("click");
							if ($liTo.offset().top < $fsl.offset().top + 2) {
								// $liTo at upside of scroll.
								$fsl.scrollTop(
									$fsl.scrollTop() + $liTo.offset().top - $fsl.offset().top - 2
								);
							} else if (
								$liTo.offset().top + $liTo.outerHeight() >
								$fsl.offset().top + $fsl.height() + 2
							) {
								// $liTo at downside of scroll.
								$fsl.scrollTop(
									$fsl.scrollTop() +
										$liTo.offset().top +
										$liTo.outerHeight() -
										$fsl.offset().top -
										$fsl.height() -
										2
								);
							}
						}
					} else {
						if ($lis.length) {
							if (e.code === "ArrowUp") {
								$liTo = $lis.last();
								$fsl.scrollTop($fsl[0].scrollHeight);
							} else {
								$liTo = $lis.first();
								$fsl.scrollTop(0);
							}
							$liTo.eq(0).trigger("click");
						}
					}
					break;
			}
		}
	);
	m.gotoLi = function (
		e: any,
		elem: HTMLElement,
		k: number,
		fs: FuzzySearch
	): void {
		if (e && e.srcElement && e.srcElement.nodeName == "A") {
		} else {
			let $elem = $(elem);
			$elem = $elem.closest(".list-item");
			if ($elem.hasClass("selected")) {
				(fs.$fs as JQuery<HTMLTextAreaElement>).trigger({
					type: "keydown",
					code: "Escape",
				} as any); // 27=ESC
			} else {
				fs.$fsLis.removeClass("selected");
				$elem.addClass("selected");
			}
			let $listI = fs.fullList[k].$listI;
			if ($listI) {
				if (!$listI.is(":visible")) {
					$listI.parents("*").show();
				}
				m.$window.scrollTop($listI.offset().top);
			}
		}
	};
	m.doFSGo = function (fs: FuzzySearch): void {
		let fsPtnSH = m.splitHangul(fs.$fs[0].value);
		if (fs.array[0].ptnSH.splitted !== fsPtnSH.splitted) {
			let res = m.fuzzySearch(fsPtnSH, fs);
			let sorted = res.sorted;
			let str = "";
			for (let i = 0; i < sorted.length; i++) {
				let k = res[sorted[i]].i;
				let fsFLk = fs.fullList[k];
				str += `<div class="list-item" onclick="k.gotoLi(event,this,${k},m.fsGo)">${
					fsFLk.html
				}${
					res[sorted[i]].highlight !== undefined
						? `<div class="highlighted"><span class="maxMatchScore">${
								res[sorted[i]].maxMatchScore
						  }</span> :: ${res[sorted[i]].highlight}</div>`
						: ""
				}</div>`;
			}
			fs.$fsl.html(str);
			fs.$fsLis = fs.$fsl.find(".list-item");
		}
	};
	m.fsGoOn = function (): void {
		let now = Date.now();
		let passed = now - m.previous;
		if (passed > m.wait) {
			m.previous = now;
			m.doFSGo(m.fsGo);
		} else {
			(window.$fuzzy_search as JQuery<HTMLTextAreaElement>).off(
				"keyup.fs cut.fs paste.fs"
			);
			setTimeout(function () {
				(window.$fuzzy_search as JQuery<HTMLTextAreaElement>).on(
					"keyup.fs cut.fs paste.fs",
					m.fsGoOn
				);
				m.previous = Date.now();
				m.doFSGo(m.fsGo);
			}, m.wait * 1.5 - passed);
		}
	};
	(window.$fuzzy_search as JQuery<HTMLTextAreaElement>).on(
		"keyup.fs cut.fs paste.fs",
		m.fsGoOn
	);

	// String to Array
	m.encloseStr = function (str: string): string {
		if (!str || typeof str !== "string") {
			return "";
		}
		if (str.charAt(0) === '"' || /[\n\t]/.test(str)) {
			return `"${str.replace(/"/g, '""')}"`;
		}
		return str;
	};

	m.strToJSON = function (
		str: string,
		colMap = true,
		rowMap = false
	): Promise<StrToJSON> {
		if (!str || typeof str !== "string") {
			return Promise.reject(str);
		}
		if (str.charAt(str.length - 1) !== "\n") {
			str += "\n";
		}
		const ret: StrToJSON = {};
		const delimiter = /([^\t\n]*)([\t\n])/g;
		const lastQuote = /[^"](?:"")*"([\t\n])/g;
		let exec: ReturnType<typeof RegExp.prototype.exec>;
		let start = 0;
		let row = -1,
			col = -1,
			delim = "\n";
		let strElem = "";
		function increaseRC(delim: string): boolean {
			if (delim === "\t") {
				col++;
				return true;
			} else if (delim === "\n") {
				row++;
				col = 0;
				ret[m.symArray].push([]);
				return true;
			}
			return false;
		}
		while (start < str.length && increaseRC(delim)) {
			if (str.substring(start, start + 1) === '"') {
				lastQuote.lastIndex = start + 1;
				if ((exec = lastQuote.exec(str)) !== null) {
					strElem = str.substring(start + 1, lastQuote.lastIndex - 2);
					delim = exec[1];
					start = delimiter.lastIndex = lastQuote.lastIndex;
				} else {
					strElem = str.substring(start + 1);
					delim = "";
					start = str.length;
				}
				strElem = strElem.replace(/""/g, '"');
			} else {
				if ((exec = delimiter.exec(str)) !== null) {
					strElem = exec[1];
					delim = exec[2];
					start = delimiter.lastIndex;
				} else {
					strElem = str.substring(start);
					delim = "";
					start = str.length;
				}
			}
			ret[m.symArray][row][col] = strElem;
		}
		if (colMap) {
			const firstColSize = ret[m.symArray][0].length;
			for (let i = 0; i < ret[m.symArray].length; i++) {
				let jMax =
					ret[m.symArray][i].length > firstColSize
						? firstColSize
						: ret[m.symArray][i].length;
				for (let j = 0; j < firstColSize; j++) {
					let key = ret[m.symArray][0][j];
					if (j < jMax) {
						ret[i][key] = ret[m.symArray][i][j];
					} else {
						ret[i][key] = "";
					}
				}
			}
		}
		if (rowMap) {
			for (let i = 0; i < ret[m.symArray].length; i++) {
				let key = ret[m.symArray][i][0];
				ret[key] = ret[m.symArray][i];
			}
		}
		return Promise.resolve(ret);
	};
	m.csvToJSON = function (
		str: string,
		colMap = true,
		rowMap = false
	): Promise<StrToJSON> {
		if (!str || typeof str !== "string") {
			return Promise.reject(str);
		}
		let rows: any = str.split("\n");
		for (let i = 0; i < rows.length; i++) {
			if (
				rows[i].substring(0, 1) === '"' &&
				rows[i].substring(rows[i].length - 1) === '"'
			) {
				rows[m.symArray][i] = rows[i]
					.substring(1, rows[i].length - 1)
					.split('","');
			} else {
				rows[m.symArray][i] = rows[i].split(",");
			}
		}
		if (colMap) {
			const firstColSize = rows[m.symArray][0].length;
			for (let i = 0; i < rows[m.symArray].length; i++) {
				let jMax =
					rows[m.symArray][i].length > firstColSize
						? firstColSize
						: rows[m.symArray][i].length;
				for (let j = 0; j < jMax; j++) {
					let key = rows[m.symArray][0][j];
					if (key !== undefined) {
						rows[i][key] = rows[m.symArray][i][j];
					}
				}
			}
		}
		if (rowMap) {
			for (let i = 0; i < rows[m.symArray].length; i++) {
				let key = rows[m.symArray][i][0];
				if (key !== undefined) {
					rows[key] = rows[m.symArray][i];
				}
			}
		}
		return Promise.resolve(rows);
	};
	m.arrayToTableHTML = function (txtArray: StrToJSON): string {
		let tableStr = "<table>";
		for (let row = 0; row < txtArray[m.symArray].length; row++) {
			tableStr += "<tr>";
			for (let col = 0; col < txtArray[m.symArray][row].length; col++) {
				tableStr += `<td>${m
					.escapeOnlyTag(txtArray[m.symArray][row][col])
					.replace(/\n/g, "<br/>")}</td>`;
			}
			tableStr += "</tr>";
		}
		tableStr += "</table>";
		return tableStr;
	};

	// SEE (Super Easy Edit).
	m.SEEToArray = function (SEE: string): string[] {
		SEE = SEE.trim();
		const dE = /\s*\n\n+\s*/g; // split by double enter.
		let start = 0;
		let end = 0;
		let subStr: string;
		const ps: string[] = []; // paragraphs
		while (dE.exec(SEE) !== null) {
			end = dE.lastIndex;
			subStr = SEE.substring(start, end).trim();
			if (/^<pre\s*[^>]*>/i.test(subStr)) {
				while (!/<\/pre>$/i.test(subStr)) {
					dE.exec(SEE);
					end = dE.lastIndex;
					subStr = SEE.substring(start, end).trim();
				}
			} else if (/^```/.test(subStr)) {
				while (!/```\/$/.test(subStr)) {
					dE.exec(SEE);
					end = dE.lastIndex;
					subStr = SEE.substring(start, end).trim();
				}
			} else if (/^<script\s*[^>]*>/i.test(subStr)) {
				while (!/<\/script>$/i.test(subStr)) {
					dE.exec(SEE);
					end = dE.lastIndex;
					subStr = SEE.substring(start, end).trim();
				}
			} else if (/^<textarea\s*[^>]*>/i.test(subStr)) {
				while (!/<\/textarea>$/i.test(subStr)) {
					dE.exec(SEE);
					end = dE.lastIndex;
					subStr = SEE.substring(start, end).trim();
				}
			} else if (/^<data\s*[^>]*>/i.test(subStr)) {
				while (!/<\/data>$/i.test(subStr)) {
					dE.exec(SEE);
					end = dE.lastIndex;
					subStr = SEE.substring(start, end).trim();
				}
			} else if (/^<eqq\s*[^>]*>/i.test(subStr)) {
				while (!/<\/eqq>$/i.test(subStr)) {
					dE.exec(SEE);
					end = dE.lastIndex;
					subStr = SEE.substring(start, end).trim();
				}
			} else if (/^<!--/i.test(subStr)) {
				while (!/-->$/i.test(subStr)) {
					dE.exec(SEE);
					end = dE.lastIndex;
					subStr = SEE.substring(start, end).trim();
				}
				subStr = "";
			}
			if (subStr) {
				ps.push(subStr);
			}
			start = end;
		}
		subStr = SEE.substring(start).trim();
		if (subStr) {
			ps.push(subStr);
		}
		return ps;
	};

	m.getEmmetFromHead = function (head: string): string {
		const exec = /^\[([^\s\t\n\]]+?)\]/.exec(head);
		if (exec) {
			return exec[1];
		}
		return "";
	};
	m.getClassesFromEmmet = function (str: string): string {
		const rexClasses = /\.([\w\:\-\%]+)/g;
		let classes = "";
		let res: ReturnType<typeof RegExp.prototype.exec>;
		while ((res = rexClasses.exec(str))) {
			classes += res[1] + " ";
		}
		return classes.trim();
	};
	m.getIdFromEmmet = function (str: string): string {
		let res = /#([\w\:\-\%]+)/.exec(str);
		if (res) {
			return res[1];
		}
		return "";
	};

	m.renderToDocuK = function (toBeRendered: string, docuKI: number): string {
		const ps = m.SEEToArray(toBeRendered);

		const TOC = "Table of Contents";
		const PH = "Posting History";
		const COTD = "Categories of this document";
		const RRA = "References and Related Articles";

		const untilEnter = /[^\n]+/g; // until enter.
		let head: string, hN: number; // #*hN
		let emmet = "",
			classes = "",
			elemId = "";

		let docuOn = false,
			secOn = false,
			subsecOn = false,
			subsubsecOn = false;
		let str = "";

		function closeSec(hN: number) {
			switch (hN) {
				case 1:
					if (docuOn) {
						str += "</div>";
						docuOn = false;
					}
				case 2:
					if (secOn) {
						str += "</div>";
						secOn = false;
					}
				case 3:
					if (subsecOn) {
						str += "</div>";
						subsecOn = false;
					}
				case 4:
					if (subsubsecOn) {
						str += "</div>";
						subsubsecOn = false;
					}
					break; // 마지막 case에 break 추가
				default:
			}
		}

		for (let i = 0; i < ps.length; i++) {
			ps[i] = ps[i].trim();

			let hNExec: ReturnType<typeof RegExp.prototype.exec>;
			if ((hNExec = /^#+(?![#\/])/.exec(ps[i]))) {
				untilEnter.lastIndex = hN = hNExec[0].length;
				closeSec(hN);
				let headTotal: ReturnType<typeof RegExp.prototype.exec>;
				headTotal = untilEnter.exec(ps[i]);
				emmet = m.getEmmetFromHead(headTotal[0]);
				head = headTotal[0].trim();
				classes = elemId = "";
				if (emmet) {
					head = headTotal[0].substring(emmet.length + 2).trim();
					classes = m.getClassesFromEmmet(emmet);
					elemId = m.getIdFromEmmet(emmet);
					if (classes) {
						classes = ` ${classes}`;
					}
					if (elemId) {
						elemId = ` id="${elemId}"`;
					} else {
						elemId = ` id="docuK${docuKI}`;
					}
				}
				let countTOC = 0;
				let countCOTD = 0;
				let countPH = 0;
				let countRRA = 0;
				switch (hN) {
					case 1:
						str += `<div class="docuK fromSEE"><div class="sec${classes}"><h1${elemId}>${head}</h1>`;
						docuOn = secOn = true;
						break;
					case 2:
						switch (head) {
							case "TOC":
								str += `<div class="sec">`;
								head = TOC;
								str += `<h2 class="notSec" id="docuK${docuKI}-sec-TOC${countTOC++}">${head}</h2><div class="toc"></div></div>`; // self closing.
								break;
							case "COTD":
								str += `<div class="sec hiden">`;
								head = COTD;
								str += `<h2 class="no-sec-N" id="docuK${docuKI}-sec-COTD${countCOTD++}">${head}</h2>`;
								secOn = true;
								break;
							case "PH":
								str += `<div class="sec hiden">`;
								head = PH;
								str += `<h2 class="no-sec-N" id="docuK${docuKI}-sec-PH${countPH++}">${head}</h2>`;
								secOn = true;
								break;
							case "RRA":
								str += `<div class="sec">`;
								head = RRA;
								str += `<h2 class="no-sec-N" id="docuK${docuKI}-sec-RRA${countRRA++}">${head}</h2>`;
								secOn = true;
								break;
							default:
								str += `<div class="sec${classes}">`;
								str += `<h2${elemId}>${head}</h2>`;
								secOn = true;
								break;
						}
						break;
					case 3:
						str += `<div class="subsec${classes}"><h3${elemId}>${head}</h3>`;
						subsecOn = true;
						break;
					case 4:
						str += `<div class="subsubsec${classes}"><h4${elemId}>${head}</h4>`;
						subsubsecOn = true;
						break;
					default:
						str += `<h${hN}${elemId}>${head}</h${hN}>`;
				}
				ps[i] = ps[i].substring(untilEnter.lastIndex).trim();
			} else if ((hNExec = /^#+(?=\/)/.exec(ps[i]))) {
				hN = hNExec[0].length;
				closeSec(hN);
				continue; // Text after '#/' is ignored. Use '#####/' for comment.
			}

			if (ps[i].length) {
				if (/^<\/?\w/.test(ps[i])) {
					str += ps[i];
				} else if (/^```/.test(ps[i])) {
					ps[i] = ps[i].replace(/^```/, "").replace(/```\/$/, "");
					emmet = m.getEmmetFromHead(ps[i]);
					classes = elemId = "";
					if (emmet) {
						ps[i] = ps[i].substring(emmet.length + 2).trim();
						classes = m.getClassesFromEmmet(emmet);
						elemId = m.getIdFromEmmet(emmet);
						if (classes) {
							classes = ` ${classes}`;
						}
						if (elemId) {
							elemId = ` id="${elemId}"`;
						}
					}
					str += `<pre class="prettyprint linenums${classes}"${elemId}>${m.escapeOnlyTag(
						ps[i]
					)}</pre>`;
				} else {
					str += `<div class="p">${ps[i]}</div>`;
				}
			}
		}
		closeSec(1);

		return str;
	};

	m.getContentsJoinedWithEnter = function ($elem: JQuery<HTMLElement>): string {
		const $contents = $elem.contents();
		const contentsL = $contents.length;
		const strArray: string[] = [];
		for (let i = 0; i < contentsL; i++) {
			const $contentI = $contents.eq(i);
			if ($contentI.is("ol")) {
				const $lis = $contentI.contents();
				for (let j = 0; j < $lis.length; j++) {
					strArray.push($lis.eq(j).text().trim());
				}
			} else {
				strArray.push($contentI.text().trim());
			}
		}
		return strArray.join("\n");
	};

	// Functions for printing codes into 'pre.prettyprint'.
	m.indentsRemove = function (str: string): string {
		let firstIndent = str.match(/^\n\t+/),
			indentRegExp;
		if (firstIndent !== null) {
			// if match (first indent) is found
			indentRegExp = new RegExp(
				"\\n\\t{1," + (firstIndent[0].length - 1) + "}",
				"g"
			); // /\n\t{1,n}/g: global greedy matching
		} else {
			indentRegExp = /^\n/; // just for minimum match
		}
		return str.replace(indentRegExp, "\n");
	};

	m.printCode = function (codeId: string): void {
		const $pre = $("pre#pre-" + codeId);
		const $code = $("#" + codeId);
		if ($pre.length) {
			let html = m.indentsRemove($code.html()).trim();
			if (!$code.is(".noEscapeHTML")) {
				html = m.escapeOnlyTag(html);
			}
			$pre.html(html);
		}
	};

	// Function for toggling height, i.e. switching scrollability with conserving view.
	m.toggleHeight = function (obj: HTMLElement): void {
		let next = $(obj).next();
		let toBeScrolledBy = 0;
		let windowScrollTop = m.$window.scrollTop();
		let nOffsetTop = next.offset().top;
		let nHeight = next.height();

		if (next.is(".scrollable")) {
			// becomes expanded.
			toBeScrolledBy = next.scrollTop();
			next.removeClass("scrollable");
			window.scrollTo(0, windowScrollTop + toBeScrolledBy);
		} else {
			// becomes scrollable.
			if (windowScrollTop < nOffsetTop) {
				// case0: no scroll
				next.addClass("scrollable");
			} else {
				// case1: scroll both
				toBeScrolledBy = windowScrollTop - nOffsetTop;
				let tailHeight = nHeight - toBeScrolledBy;
				next.addClass("scrollable");
				nHeight = next.height();
				window.scrollTo(
					0,
					nHeight > tailHeight ? nOffsetTop + nHeight - tailHeight : nOffsetTop
				);
				next[0].scrollTop = toBeScrolledBy;
			}
		}
	};

	// section's show/hide functions
	m.ShowHide = function (elem: HTMLElement): void {
		$(elem).next().toggle();
		if ($(elem).next().is(":visible")) {
			$(elem).html("▼ Hide");
		} else {
			$(elem).html("▼ Show");
		}
		setTimeout(function () {
			m.$window.trigger("scroll.delayedLoad");
		}, 1000);
	};
	m.Hide = function (elem: HTMLElement): void {
		let $elem = $(elem).parent();
		window.scrollBy(0, -$elem.outerHeight());
		$elem.hide();
		$elem.parent().find(".ShowHide").html("▼ Show");
	};

	// bubbleRef's show/hide functions
	m.ShowBR = function (elem: HTMLElement): void {
		clearTimeout(m.timerHideBRQueue);
		m.$bubbleRefs.hide();
		$(elem).find(">.bubbleRef").show();
	};
	m.timerHideBR = function (elem: HTMLElement): void {
		m.timerHideBRQueue = setTimeout(function () {
			$(elem).find(">.bubbleRef").hide();
		}, 1000);
	};
	m.HideBR = function (elem: HTMLElement): void {
		$(elem).parents(".bubbleRef").hide();
	};

	// Changing Styles of docuK
	m.mode = "Bright";
	m.fontFamily = "Noto Sans KR";
	m.fontSize = 10;
	m.lineHeight10 = 16;
	m.defaultStyles = {
		mode: m.mode,
		fontFamily: m.fontFamily,
		fontSize: m.fontSize,
		lineHeight10: m.lineHeight10,
	};

	m.printDeviceInfo = function (): void {
		if (m.$deviceInfo) {
			let referrer = document.referrer;
			let referrerHTML = referrer
				? `<a target="_blank" href="${referrer}">${m.escapeOnlyTag(
						decodeURIComponent(referrer)
				  )}</a>`
				: `Empty`;
			m.$deviceInfo.html(
				`Mode: ${m.mode}; Font: ${m.fontFamily}; font-size: ${(
					m.fontSize * 1.8
				).toFixed(1)}px (${m.fontSize.toFixed(1)}); line-height: ${(
					m.lineHeight10 / 10
				).toFixed(1)};<br/>
width: ${m.browserWidth}, height: ${window.innerHeight}, version: ${
					m.version0
				}${m.version1}<br/>
${
	m.canonicalURI
		? `Canonical URI: <a target="_blank" href="${
				m.canonicalURI
		  }">${m.escapeOnlyTag(decodeURIComponent(m.canonicalURI))}</a><br/>`
		: ""
}
${
	m.plink
		? `dg:plink (Document Global Permanent Link): <a target="_blank" href="${m.plink}">${m.plink}</a><br/>`
		: ""
}
document.referrer: ${referrerHTML}`
			);
		}
	};

	m.resetStyle = function (): void {
		m.Cmode(m.defaultStyles.mode);
		m.CfontFamily(m.defaultStyles.fontFamily);
		m.CfontSize(m.defaultStyles.fontSize - m.fontSize);
		m.ClineHeight(m.defaultStyles.lineHeight10 - m.lineHeight10);
		if (!m.$floating_key.is(":visible")) {
			m.toggleFK();
		}
	};
	m.Cmode = function (modeI: string): boolean {
		if (modeI === "Dark") {
			m.$docuK.removeClass("bright");
		} else if (modeI === "Bright") {
			m.$docuK.addClass("bright");
		} else {
			return false;
		}
		m.mode = modeI;
		m.printDeviceInfo();
		if (m.mode === m.defaultStyles.mode) {
			m.docCookies.removeItem("m.mode", "/");
		} else {
			m.docCookies.setItem("m.mode", m.mode, m.expire, "/");
		}
		return true;
	};
	m.CfontFamily = function (font: string): boolean {
		m.$docuK.css({ fontFamily: font });
		m.fontFamily = font;
		m.printDeviceInfo();
		if (m.fontFamily === m.defaultStyles.fontFamily) {
			m.docCookies.removeItem("m.fontFamily", "/");
		} else {
			m.docCookies.setItem("m.fontFamily", m.fontFamily, m.expire, "/");
		}
		return true;
	};
	m.CfontSize = function (increment: number): boolean {
		if (increment.constructor === Number && !isNaN(Number(increment))) {
			m.fontSize += increment;
			if (m.fontSize < 5) {
				m.fontSize = 5;
			} else if (m.fontSize > 33) {
				m.fontSize = 33;
			}
			m.$docuK.css({ "font-size": m.fontSize.toFixed(1) + "px" });
			m.printDeviceInfo();
			if (m.fontSize === m.defaultStyles.fontSize) {
				m.docCookies.removeItem("m.fontSize", "/");
			} else {
				m.docCookies.setItem(
					"m.fontSize",
					m.fontSize.toFixed(1),
					m.expire,
					"/"
				);
			}
			return true;
		}
		return false;
	};
	m.ClineHeight = function (increment: number): boolean {
		if (increment.constructor === Number && !isNaN(Number(increment))) {
			m.lineHeight10 += increment;
			if (m.lineHeight10 < 10) {
				m.lineHeight10 = 10;
				return false;
			} else if (m.lineHeight10 > 25) {
				m.lineHeight10 = 25;
				return false;
			}
			m.$docuK.attr(
				"style",
				`line-height:${(m.lineHeight10 / 10).toFixed(1)} !important`
			);
			m.printDeviceInfo();
			if (m.lineHeight10 === m.defaultStyles.lineHeight10) {
				m.docCookies.removeItem("m.lineHeight10", "/");
			} else {
				m.docCookies.setItem(
					"m.lineHeight10",
					m.lineHeight10.toString(),
					m.expire,
					"/"
				);
			}
			return true;
		}
		return false;
	};
	m.$window.on("resize.deviceInfo", function () {
		if (window.innerWidth !== m.browserWidth) {
			m.browserWidth = window.innerWidth;
			m.fontSize = parseInt(m.$docuK.css("font-size")); // font-size in px. (Default: 10px)
			m.printDeviceInfo();
		}
	});

	$(`#docuK-style`).after(`<div id="notify-copied" class="block-touch">
<div>
<div>[--The following is copied!--]</div>
<textarea id="textarea-copied"></textarea>
</div>
</div>
<div id="notify-copied-exit" class="block-touch-exit exit" onclick="$('#notify-copied, #notify-copied-exit').hide()">
<svg>
<g>
<line x1="20%" y1="20%" x2="80%" y2="80%"></line>
<line x1="80%" y1="20%" x2="20%" y2="80%"></line>
</g>
✖
</svg>
</div>`);
	$("#notify-copied, #notify-copied-exit").hide();
	m.$textarea_copied = $(`#textarea-copied`);

	// Share a link through SNS
	m.shareSNS = function (service: string): boolean {
		const title = m.$title.html();
		const url = window.location.href;
		const decodedURL = m.escapeOnlyTag(decodeURIComponent(url));
		let open = "";
		switch (service) {
			case "link":
				let written = `${title}\n${url}${
					url !== decodedURL ? `\n${decodedURL}` : ``
				}`;
				navigator.clipboard.writeText(written).then(
					function () {
						m.$textarea_copied[0].value = written;
						$("#notify-copied, #notify-copied-exit").show();
					},
					function (err) {
						m.$textarea_copied[0].value = `Could not copy text: ${err}`;
						$("#notify-copied, #notify-copied-exit").show();
					}
				);
				return false;
			case "tag":
				let written1 = `${title}:<br/>\n<a target="_blank" href="${url}">${decodedURL}</a>`;
				navigator.clipboard.writeText(written1).then(
					function () {
						m.$textarea_copied[0].value = written1;
						$("#notify-copied, #notify-copied-exit").show();
					},
					function (err) {
						m.$textarea_copied[0].value = `Could not copy text: ${err}`;
						$("#notify-copied, #notify-copied-exit").show();
					}
				);
				return false;
			case "X":
				open =
					"https://X.com/intent/tweet?via=kipacti&text=" +
					encodeURIComponent(title) +
					"&url=" +
					encodeURIComponent(url);
				break;
			case "facebook":
				open =
					"https://www.facebook.com/sharer/sharer.php?u=" +
					encodeURIComponent(url);
				break;
			case "recoeve":
				open = `https://recoeve.net/reco?uri=${encodeURIComponent(
					url
				)}&title=${encodeURIComponent(title)}${
					m.recoCats ? `&cats=${encodeURIComponent(m.recoCats)}` : ""
				}`;
				break;
			case "kakao":
				m.popUpKakao();
				return;
			case "Whatsapp":
				open = `https://wa.me/?text=${encodeURIComponent(
					title
				)}%0A${encodeURIComponent(url)}`;
				break;
			default:
				return;
		}
		window.open(open);
	};

	// Delayed Loading. (Copied from user-page.html)
	m.delayPad = m.delayPad || 0;
	m.wait = m.wait || 1024;
	m.$delayedElems = $("#nothing");
	m.previous = Date.now();
	$.fn.inView = function (): boolean {
		if (this.is(":visible")) {
			let viewportHeight = window.innerHeight;
			let scrollTop = m.$window.scrollTop();
			let elemTop = this.offset().top - m.delayPad;
			let elemBottom = elemTop + this.height() + m.delayPad;
			return scrollTop + viewportHeight > elemTop && scrollTop < elemBottom;
		} else {
			return false;
		}
	};
	$.fn.delayedLoad = function (): boolean {
		let done = false;
		if (this.inView()) {
			if (this.hasClass("to-be-executed")) {
				this.removeClass("to-be-executed");
				this.trigger("click");
				done = true;
			}
			// divs with background-image
			if (this.attr("delayed-bgimage")) {
				this.css(
					"background-image",
					"url(" + this.attr("delayed-bgimage") + ")"
				);
				this.removeAttr("delayed-bgimage");
				done = true;
			}
			// iframes or images
			if (this.attr("delayed-src")) {
				this.attr("src", this.attr("delayed-src"));
				this.removeAttr("delayed-src");
				done = true;
			}
			// MathJax Process
			if (
				typeof window.MathJax !== "undefined" &&
				this.is(".MathJax_Preview")
			) {
				window.MathJax.typesetPromise([this.next()[0]]);
				done = true;
			}
		}
		return done;
	};
	m.delayedLoadAll = function (): Promise<void> {
		return new Promise(async function (resolve, reject): Promise<void> {
			m.logPrint(`<br/>Doing delayed-load. : ${m.$delayedElems.length}`);
			if (m.$delayedElems.length > 0) {
				m.$delayedElems.each(function () {
					if ($(this).delayedLoad()) {
						m.$delayedElems = m.$delayedElems.not(this);
						m.logPrint(
							`<br/><span class="emph">${this} at vertical position of ${(
								(100.0 * $(this).offset().top) /
								m.$document.height()
							).toPrecision(3)}% of document is delayed-loaded.</span><br/>${
								m.$delayedElems.length
							} of $delayedElems are remained.<br/>`
						);
					}
				});
				m.$window.on("scroll.delayedLoad", m.delayedLoadByScroll);
			} else {
				m.logPrint(`<br/><br/>All delayedElem are loaded.`);
				m.$window.off("scroll.delayedLoad");
			}
			m.previous = Date.now();
			resolve();
		});
	};
	m.delayedLoadByScroll = function (): Promise<void> {
		return new Promise(async function (resolve, reject): Promise<void> {
			m.$window.off("scroll.delayedLoad");
			let now = Date.now();
			let passed = now - m.previous;
			if (passed > m.wait) {
				await m.delayedLoadAll();
				resolve();
			} else {
				clearTimeout(m.setTimeoutDelayedLoad);
				m.setTimeoutDelayedLoad = setTimeout(async function () {
					await m.delayedLoadAll();
					resolve();
				}, m.wait * 1.5 - passed);
				m.logPrint(`<br/>wait ${(m.wait * 1.5 - passed).toFixed(0)}ms.`);
			}
		});
	};
	m.$window.on("scroll.delayedLoad", m.delayedLoadByScroll);

	m.toggleAMess = function (elem: HTMLElement): void {
		let $elem = $(elem);
		let wSTBefore = m.$window.scrollTop();
		m.$window.on("scroll.stopDF", function (e) {
			e.preventDefault();
			e.stopPropagation();
		});
		let orderElem = $elem.index(".order");
		let orderLastElem = $(".order").last().index(".order");
		let $collection = $(".copyright, .shortkey, .promoting");
		if ($collection.is(":visible")) {
			if (orderElem === orderLastElem) {
				let sHBefore = document.documentElement.scrollHeight;
				$collection.hide();
				let sHAfter = document.documentElement.scrollHeight;
				m.$window.scrollTop(wSTBefore - sHBefore + sHAfter);
			} else {
				let outerHeightBefore = 0;
				$collection.each(function () {
					if ($(this).index(".order") < orderElem) {
						outerHeightBefore += $(this).outerHeight(true);
					} else {
						return false;
					}
				});
				$collection.hide();
				m.$window.scrollTop(wSTBefore - outerHeightBefore);
			}
		} else {
			if (orderElem === orderLastElem) {
				let sHBefore = document.documentElement.scrollHeight;
				$collection.show();
				let sHAfter = document.documentElement.scrollHeight;
				m.$window.scrollTop(wSTBefore - sHBefore + sHAfter);
			} else {
				let outerHeightBefore = 0;
				$collection.each(function () {
					if ($(this).index(".order") < orderElem) {
						outerHeightBefore += $(this).outerHeight(true);
					} else {
						return false;
					}
				});
				$collection.show();
				m.$window.scrollTop(wSTBefore + outerHeightBefore);
			}
		}
		setTimeout(function () {
			m.$window.off("scroll.stopDF");
		}, 32);
	};

	// docuK Process
	m.docuKProcess = function docuK(m: any, docuKI: number): void {
		// Possible duplicate id is handled.
		docuKI = isNaN(docuKI) ? 1 : parseInt(String(docuKI));
		m.logPrint(
			`<br/><br/>docuK${docuKI} scripts started!<br/><span class="emph">If this log is not closed automatically, there must be an error somewhere in your document or scripts.</span>`
		);
		const $docuKI: JQuery<HTMLElement> = m.$docuK.eq(docuKI);
		if ($docuKI.is(".rendered")) {
			m.logPrint(`<br/><br/>docuK${docuKI} is already rendered.`);
			return;
		}

		let postId = "-in-docuK" + docuKI;
		const postIdRegEx = new RegExp(postId + "$");
		if ($docuKI.is(".noDIdHandle") || docuKI <= 1) {
			postId = "";
		} else {
			$docuKI.find("[id]").each((index: number, element: HTMLElement) => {
				const $this: JQuery<HTMLElement> = this as JQuery<HTMLElement>;
				$this.attr("id", $this.attr("id") + postId);
			});
		}

		if (!m.printMode) {
			// Copyright and Short Keys announcement.
			$docuKI.before(`<div class="button toggle-a-mess fRight cBoth order" onclick="k.toggleAMess(this)">Toggle <span class="bold underline">a</span> mess</div>
<div class="cBoth"></div>
<div class="copyright order"><ul>
<li class="license cc"><span class="bold">Creative Commons</span></li>
<li class="license by"><span class="bold">저작자표시</span> - 적절한 출처와, 해당 라이센스 링크를 표시하고, 변경이 있는 경우 공지해야 합니다. 합리적인 방식으로 이렇게 하면 되지만, 이용 허락권자가 귀하에게 권리를 부여한다거나 귀하의 사용을 허가한다는 내용을 나타내서는 안 됩니다.</li>
<li class="license nc"><span class="bold">비영리</span> - 이 저작물은 영리 목적으로 이용할 수 없습니다.</li>
<li class="license nd"><span class="bold">변경금지</span> - 이 저작물을 리믹스, 변형하거나 2차적 저작물을 작성하였을 경우 그 결과물을 공유할 수 없습니다.</li>
</ul></div>
<div id="shortkey" class="shortkey bcf order">
Short Keys
<ul class="ul-short-key">
<li class="toggle-a-mess" style="color:#717171 !important"><span onclick="k.$window.trigger({type:'keydown', code:'KeyA'})">Toggle <span class="bold underline">a</span> mess</span></li>
<li class="button-Go"><span onclick="k.$window.trigger({type:'keydown', code:'KeyG'})"><span class="bold underline">G</span>: <span class="bold underline">G</span>o (Fuzzy Search).</span></li>
<li class="button-ToR"><span onclick="k.$window.trigger({type:'keydown', code:'KeyT'})"><span class="bold underline">T</span>: <span class="bold underline">T</span>able of Contents.</span></li>
<li><span onclick="k.$window.trigger({type:'keydown', code:'KeyK'})"><span class="bold underline">K</span>: Docu<span class="bold underline">K</span> Log.</span></li>
<li class="darkgoldenrod"><span onclick="k.$window.trigger({type:'keydown', code:'KeyF'})"><span class="bold underline">F</span>: <span class="bold underline">F</span>orward Section.</span></li>
<li class="darkgoldenrod"><span onclick="k.$window.trigger({type:'keydown', code:'KeyD'})"><span class="bold underline">D</span>: Backwar<span class="bold underline">d</span> Section.</span></li>
<li class="darkgoldenrod"><span onclick="k.$window.trigger({type:'keydown', code:'KeyR'})"><span class="bold underline">R</span>: <span class="bold underline">R</span>eferences.</span></li>
</ul>
<ul class="ul-short-key">
<li class="button-list"><span onclick="k.$window.trigger({type:'keydown', code:'KeyL'})"><span class="bold underline">L</span>: To 전체목록/[<span class="bold underline">L</span>ists].</span></li>
<li class="darkgoldenrod"><span onclick="k.$window.trigger({type:'keydown', code:'KeyZ'})"><span class="bold underline">Z</span>: Tistory comments.</span></li>
<li class="darkgoldenrod"><span onclick="k.$window.trigger({type:'keydown', code:'KeyX'})"><span class="bold underline">X</span>: DISQUS comments.</span></li>
<li class="button-cmt-handle"><span onclick="k.$window.trigger({type:'keydown', code:'KeyN'})"><span class="bold underline">N</span>: Ha<span class="bold underline">n</span>dle URI links in Tistory comments.</span></li>
</ul>
<ul class="ul-short-key">
<li class="darkred"><span onclick="k.$window.trigger({type:'keydown', code:'KeyI'})"><span class="bold underline">I</span>: Log <span class="bold underline">i</span>n to Tistory.</span></li>
<li class="darkred"><span onclick="k.$window.trigger({type:'keydown', code:'KeyO'})"><span class="bold underline">O</span>: Log <span class="bold underline">o</span>ut from Tistory.</span></li>
</ul>
</div>`);
			$docuKI.after(`<div class="copyright order"><ul>
<li class="license cc"><span class="bold">Creative Commons</span></li>
<li class="license by"><span class="bold">저작자표시</span> - 적절한 출처와, 해당 라이센스 링크를 표시하고, 변경이 있는 경우 공지해야 합니다. 합리적인 방식으로 이렇게 하면 되지만, 이용 허락권자가 귀하에게 권리를 부여한다거나 귀하의 사용을 허가한다는 내용을 나타내서는 안 됩니다.</li>
<li class="license nc"><span class="bold">비영리</span> - 이 저작물은 영리 목적으로 이용할 수 없습니다.</li>
<li class="license nd"><span class="bold">변경금지</span> - 이 저작물을 리믹스, 변형하거나 2차적 저작물을 작성하였을 경우 그 결과물을 공유할 수 없습니다.</li>
</ul></div>
<div class="button toggle-a-mess fRight cBoth order" onclick="k.toggleAMess(this)">Toggle <span class="bold underline">a</span> mess</div>
<div class="cBoth"></div>`);
		}

		// Style change widget, and SNS widget.
		$docuKI.prepend(`<div class="change-docuK-style">
<form><button type="button" onclick="k.resetStyle()" style="width:auto; padding:0 .5em">Reset docuK style</button></form>
<form><input id="button${docuKI}-Dark" type="radio" name="mode" value="Dark" onclick="k.Cmode(this.value)"><label for="button${docuKI}-Dark" style="display:inline-block; background:black; color:white; border:2px solid rgb(150,150,150); padding:0.1em 0.2em">Dark</label>
</input><input id="button${docuKI}-Bright" type="radio" name="mode" value="Bright" onclick="k.Cmode(this.value)"><label for="button${docuKI}-Bright" style="display:inline-block; background:white; color:black; border:2px solid rgb(150,150,150); padding:0.1em 0.2em">Bright</label></input></form>
<form><input id="input${docuKI}-font-family" class="bold" type="text" name="font" value="Noto Sans KR" style="font-size:1.2em; width:8em; height:1.8em; text-align:center" onchange="m.CfontFamily(this.value)"></input></form>
<form><button type="button" onclick="k.CfontSize(-0.1)" style="font-size:1em">A</button><button type="button" onclick="k.CfontSize(0.1)" style="font-size:1.4em">A</button></form>
<form><button type="button" onclick="k.ClineHeight(-1)" style="font-size:1em">=</button><button type="button" onclick="k.ClineHeight(1)" style="font-size:1.6em">=</button></form>
<form><button class="button-log" type="button" onclick="k.$window.trigger({type:'keydown', code:'KeyK'})" style="width:auto; padding:0 .5em">DocuK Log</button></form>
<form><button class="button-Go" type="button" onclick="k.$window.trigger({type:'keydown', code:'KeyG'})" style="font:inherit; width:auto; padding:0 .5em">Fuzzy search</button></form>
<div class="deviceInfo"></div>
<div class="promoting-docuK">This document is rendered by <a href="https://kipid.tistory.com/entry/HTML-docuK-format-ver-20">docuK</a> (See also <a href="https://kipid.tistory.com/entry/Super-Easy-Edit-SEE-of-docuK">SEE (Super Easy Edit) of docuK</a> and <a href="https://kipid.tistory.com/entry/pure-SEE">pure SEE</a>).</div>
</div>
<div class="SNS-top"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/link.png" onclick="return m.shareSNS('link')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Tag.png" onclick="return m.shareSNS('tag')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Recoeve.png" onclick="k.shareSNS('recoeve')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-X.png" onclick="k.shareSNS('X')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Facebook.png" onclick="k.shareSNS('facebook')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Kakao.png" onclick="k.shareSNS('kakao')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Whatsapp.png" onclick="k.shareSNS('Whatsapp')"></div>`);
		$docuKI.append(
			`<div class="SNS-bottom"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/link.png" onclick="return m.shareSNS('link')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Tag.png" onclick="return m.shareSNS('tag')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Recoeve.png" onclick="k.shareSNS('recoeve')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-X.png" onclick="k.shareSNS('X')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Facebook.png" onclick="k.shareSNS('facebook')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Kakao.png" onclick="k.shareSNS('kakao')"><img class="SNS-img" src="https://tistory1.daumcdn.net/tistory/1468360/skin/images/icon-Whatsapp.png" onclick="k.shareSNS('Whatsapp')"></div>`
		);

		// Numbering section, making table of contents, and numbering eqq (formatting to MathJax also) and figure tags
		let $secs: JQuery<HTMLElement> = $docuKI.find(">.sec");
		let $subSecs: JQuery<HTMLElement>;
		let $subSubSecs: JQuery<HTMLElement>;
		let secContentsId = "";
		let $secI: JQuery<HTMLElement>;
		let $secIH2: JQuery<HTMLElement>;
		let $subsecJH3: JQuery<HTMLElement>;
		let $subsubsecKH4: JQuery<HTMLElement>;
		let secN = 0;
		let secITxt = "";
		let subsecI = 0;
		let subsubsecI = 0;
		let tocHtml = "";
		let txt = "";
		let secId = "";
		let secPreTxt = "";
		let $eqqs: JQuery<HTMLElement>;
		let eqN = "";
		let eqC = "";
		let $figs: JQuery<HTMLElement>;
		let hN = 2;
		function fTocHtml(numbering?: boolean): string {
			let secN = numbering === undefined || numbering ? "secN" : "none";
			return `<h${hN}><a class="jump" id="toc${docuKI}-${secId}" href="#secId${docuKI}-${secId}"><span class="${secN}"><span class="number">${secPreTxt}</span>.</span>${txt}</a></h${hN}>`;
		}
		function fSecHtml(numbering?: boolean): string {
			let secN = "none",
				endA0 = "",
				endA1 = "</a>";
			if (numbering === undefined || numbering) {
				secN = "secN";
				endA0 = "</a>";
				endA1 = "";
			}
			return `<a class="jump tJump" href="#toc${docuKI}-${secId}">T</a><a class="jump" id="secId${docuKI}-${secId}" href="#secId${docuKI}-${secId}"><span class="${secN}"><span class="number">${secPreTxt}</span>.</span>${endA0}<span class="head-txt">${txt}</span>${endA1}`;
		}
		function fEqqHtml(): string {
			return `<div class="eqCC"><div class="eqN"><span class="number">(${eqN})</span></div><div class="eqC">${eqC}</div></div>`;
		}
		for (let i = 0; i < $secs.length; i++) {
			$secI = $secs.eq(i);
			$secIH2 = $secI.find("h2:first-child");
			if ($secIH2 && $secIH2.length && !$secIH2.is(".notSec")) {
				// exclude ".sec>h1" and ".sec>h2.notSec" in ToC
				hN = 2;
				txt = $secIH2.html();
				if ($secIH2.is(".no-sec-N") || $secI.is(".no-sec-N")) {
					secPreTxt =
						secId =
						secITxt =
							$secIH2.is("[id]")
								? $secIH2
										.attr("id")
										?.replace(/^sec\-/i, "")
										.replace(postIdRegEx, "")
								: `secPreTxt${docuKI}-${i}`;
					tocHtml += fTocHtml(false);
					$secIH2.html(fSecHtml(false));
				} else {
					secN++;
					secPreTxt = secId = secITxt = secN.toString();
					tocHtml += fTocHtml();
					$secIH2.html(fSecHtml());
				}

				secContentsId = `sec${docuKI}-${secITxt}-contents`;
				$secI.append(
					`<div class="cBoth"></div><div class="Hide" onclick="k.Hide(this)">▲ Hide</div><div class="cBoth"></div>`
				);
				$secI
					.contents()
					.slice(1)
					.wrapAll(`<div class="sec-contents" id="${secContentsId}"></div>`);
				$secIH2.after(
					`<div class="ShowHide" onclick="k.ShowHide(this)">▼ Show/Hide</div>`
				);
				$secI.append(`<div class="cBoth"></div>`);

				$subSecs = $secI.find(".subsec");
				subsecI = 0;
				for (let j = 0; j < $subSecs.length; j++) {
					$subsecJH3 = $subSecs.eq(j).find("h3:first-child");
					hN = 3;
					subsecI++;
					secId = secITxt + "-" + subsecI;
					secPreTxt = secITxt + "." + subsecI;
					txt = $subsecJH3.html();
					tocHtml += fTocHtml();
					$subsecJH3.html(fSecHtml());

					$subSubSecs = $subSecs.eq(j).find(".subsubsec");
					subsubsecI = 0;
					for (let k = 0; k < $subSubSecs.length; k++) {
						$subsubsecKH4 = $subSubSecs.eq(k).find("h4:first-child");
						hN = 4;
						subsubsecI++;
						secId = secITxt + "-" + subsecI + "-" + subsubsecI;
						secPreTxt = secITxt + "." + subsecI + "." + subsubsecI;
						txt = $subsubsecKH4.html();
						tocHtml += fTocHtml();
						$subsubsecKH4.html(fSecHtml());
					}
				}
			} else {
				secITxt = "x";
			}
			$eqqs = $secI.find("eqq");
			for (let j = 0; j < $eqqs.length; j++) {
				eqN = secITxt + "-" + (j + 1).toString();
				eqC = $eqqs.eq(j).html().trim();
				$eqqs.eq(j).html(fEqqHtml());
			}
			$figs = $secI.find("figure");
			for (let j = 0; j < $figs.length; j++) {
				const figN = secITxt + "-" + (j + 1).toString();
				$figs
					.eq(j)
					.find(".caption")
					.html(function (ith, orgTxt) {
						return `Fig. <span class="number">(${figN})</span>: ${orgTxt.trim()}`;
					});
			}
		}
		$secs.find(".toc").html(tocHtml);
		m.logPrint(
			`<br/><br/>Table of Contents is filled out.<br/><br/>Auto numberings of sections (div.sec>h2, div.subsec>h3, div.subsubsec>h4), &lt;eqq&gt; tags, and &lt;figure&gt; tags are done.`
		);

		// Make 'cite' tags bubble-refer references in ".docuK ol.refs>li".
		// Make 'refer' tags bubble-refer equations (eqq tag) or figures (figure tag). Any tag with id can be bubble-refered with refer tag.
		function pad(str: string, max: number) {
			str = str.toString();
			return str.padStart(max, "0");
		}
		let refN = "",
			preRefHtml = "",
			refHtml = "",
			citeN = "";
		function fCiteHtml() {
			let str = `<div class="inRef" onmouseover="m.ShowBR(this)" onmouseout="m.timerHideBR(this)">${refN}<div class="bubbleRef"><div class="content">${preRefHtml}${refHtml}<div class="exit" onclick="k.HideBR(this)"><svg><g style="stroke:white;stroke-width:23%"><line x1="20%" y1="20%" x2="80%" y2="80%"/><line x1="80%" y1="20%" x2="20%" y2="80%"/></g>✖</svg></div></div><div class="arrow"></div></div></div>`;
			return str;
		}
		let $olRefs: JQuery<HTMLElement> = $docuKI.find("ol.refs");
		$olRefs = $olRefs.eq($olRefs.length - 1);
		let $refs: JQuery<HTMLElement> = $docuKI.find("ol.refs>li");
		let refsN = $refs.length;
		for (let i = 0; i < refsN; i++) {
			// ref [i+1] with id
			$refs
				.eq(i)
				.prepend(
					`<span class="refN">Ref. <span class="number">[${pad(
						(i + 1).toString(),
						2
					)}]</span> </span>`
				);
		}
		let $cites: JQuery<HTMLElement> = $docuKI.find("cite"),
			$citeI: JQuery<HTMLElement>,
			$refered: JQuery<HTMLElement>;
		for (let i = 0; i < $cites.length; i++) {
			$citeI = $cites.eq(i);
			if ($citeI.is("[class]")) {
				if ($citeI.html() !== "") {
					$refered = $docuKI.find("#" + $citeI.attr("class") + postId);
					if ($refered.length) {
						let refNHtml = $refered.find(".refN").html();
						$refered.html(
							`<span class="refN">${refNHtml}</span>${$citeI.html()}`
						);
					} else {
						refsN += 1;
						$olRefs.append(
							`<li id="${$citeI.attr(
								"class"
							)}${postId}"><span class="refN">Ref. <span class="number">[${pad(
								refsN.toString(),
								2
							)}]</span> </span>${$citeI.html()}</li>`
						);
					}
				}
				$refered = $docuKI.find("#" + $citeI.attr("class") + postId);
				if ($refered.length) {
					citeN = (i + 1).toString() + "-" + $citeI.attr("class") + postId;
					refHtml = $refered
						.html()
						.trim()
						.replace(/\bid\s*=/gi, "psudoId=");
					refN = $refered.find(".number").html();
					$citeI.html(fCiteHtml());
				} else {
					$citeI.html(`<span class="emph">( No refer. )</span>`);
				}
			}
		}
		let $refers: JQuery<HTMLElement> = $docuKI.find("refer"),
			$referI: JQuery<HTMLElement>;
		$refers.html(`<span class="emph">( No refer. )</span>`);
		for (let i = 0; i < $refers.length; i++) {
			$referI = $refers.eq(i);
			if ($referI.is("[class]")) {
				$refered = $docuKI.find(`#${$referI.attr("class")}${postId}`);
				if ($refered.length) {
					citeN = (i + 1).toString() + "-" + $referI.attr("class") + postId;
					refHtml = $refered
						.html()
						.trim()
						.replace(/\bid\s*=/gi, "psudoId=");
					refN = $refered.find(".number").html();
					$referI.html(fCiteHtml());
				}
			}
		}
		m.logPrint(
			`<br/><br/>&lt;cite&gt; and &lt;refer&gt; tags are rendered to show bubble reference.`
		);

		$docuKI.addClass("rendered");
	};
})(window.k, jQuery);
