declare global {
	interface Window {
		jQuery: typeof import("jquery") & {
			fn: {
				exists: (selector: string) => boolean;
				inView: () => boolean;
				delayedLoad: () => boolean;
			};
		};
		k: K;
		m: K;
		$out_focus?: JQuery<HTMLElement>;
		$fuzzy_search_container?: JQuery<HTMLElement>;
		$fuzzy_search_container_move?: JQuery<HTMLElement>;
		$fuzzy_search?: JQuery<HTMLTextAreaElement>;
		$fuzzy_search_list?: JQuery<HTMLElement>;
		$button_Go?: JQuery<HTMLElement>;
		$button_log?: JQuery<HTMLElement>;
		$disqus_thread?: JQuery<HTMLElement>;
		$page_views_chart?: JQuery<HTMLElement>;
		MathJax?: {
			startup?: boolean;
			typeset?: (elements: HTMLElement[]) => void;
			typesetPromise?: (elements: HTMLElement[]) => Promise<void>;
		};
		Prism?: Prism;
		Kakao?: Kakao;
		disqus_config?: () => void;
		processShortcut?: (event: any) => void;
		PR?: { prettyPrint?: () => void };
	}
	interface JQuery<TElement> {
		exists: (selector: string) => boolean;
		inView: () => boolean;
		delayedLoad: () => boolean;
	}
	interface Kakao {
		isInitialized: () => boolean;
		Share: {
			sendDefault: (data: {
				objectType: string;
				content: {
					title: string;
					description: string;
					imageUrl: string;
					link: {
						mobileWebUrl: string;
						webUrl: string;
					};
				};
			}) => void;
		};
	}
	interface Prism {
		highlightAll: () => void;
	}
}

interface K {
	version0?: string;
	version1?: string;
	$window?: JQuery<Window>;
	$document?: JQuery<Document>;
	$html?: JQuery<HTMLHtmlElement>;
	$title?: JQuery<HTMLTitleElement>;
	fsToRs?: FSToRs;
	browserWidth?: number;
	$docuK?: JQuery<HTMLElement>;
	getUTF8Length?: (s: string) => number;
	getSearchVars?: (searchStr: string | null | undefined) => SearchVars;
	heapify?: (arr: any[], key: string, sorted: number[], n: number, i: number) => void;
	heapsort?: (arr: any[], key: string, sorted: number[], upto: number) => number;
	heapsortRest?: (arr: any[], key: string, sorted: number[], upto: number, n: number) => number;
	escapeHTML?: (str: string) => string;
	escapeOnlyTag?: (str: string) => string;
	unescapeHTML?: (str: string) => string;
	escapeAMP?: (str: string) => string;
	unescapeAMP?: (str: string) => string;
	escapeEncodePctg?: (str: string) => string;
	ptnURL?: RegExp;
	ptnFILE?: RegExp;
	ptnTag?: RegExp;
	ptnVal?: RegExp;
	uriToA?: (uri: string | null | undefined) => string;
	videoZIndex?: number;
	togglePosition?: (elem: HTMLElement) => void;
	rC?: (elemStr: string, option?: string | null, id?: string | null, noPc?: boolean) => string;
	YTiframe?: (v: string, inListPlay: boolean, config: YTiframeConfig, list?: string) => string;
	timeToSeconds?: (time: string) => number;
	ptnURI?: PatternURI;
	decomposeURI?: (uri: string) => DecomposedURI;
	uriRendering?: (uri: string, toA: boolean, inListPlay: boolean, descR?: DescR) => Promise<RenderResult & DecomposedURI & { uri: string }>;
	$textarea_copied?: JQuery<HTMLTextAreaElement>;
	getConciseURI?: (uri: string) => Promise<string>;
	ptnPureNumber?: RegExp;
	formatURI?: (uri: string, keepOriginal: boolean) => Promise<string>;
	relatedRendering?: (str: string) => Promise<string>;
	expire?: number;
	docCookies?: {
		hasItem: (sKey: string) => boolean;
		getItem: (sKey: string) => string;
		removeItem: (sKey: string, sPath?: string | false, sDomain?: string | false) => boolean;
		setItem: (sKey: string, sValue: string, vEnd?: number | string | Date, sPath?: string | false, sDomain?: string | false, bSecure?: boolean) => boolean;
		keys: () => string[];
	};
	localStorage?: {
		setItem: (key: string, val: string) => boolean;
		getItem: (key: string) => string | null;
		removeItem: (key: string) => boolean;
		clear: () => boolean;
	};
	toggleFK?: () => void;
	$floating_key?: JQuery<HTMLElement>;
	promoting?: (id: string) => string;
	recoCats?: string;
	recoeveUserId?: string;
	$log?: JQuery<HTMLElement>;
	$logAll?: JQuery<HTMLElement>;
	logPrint?: (str: string) => void;
	jamoKE?: string[];
	jamo?: string[];
	mapKE?: {
		[key: string]: string;
	};
	rChoKE?: string[];
	rCho?: string[];
	rJungKE?: string[];
	rJung?: string[];
	rJongKE?: string[];
	rJong?: string[];
	splitHangul?: (str: string) => SplitHangul;
	fsLength?: number;
	fsGo?: FuzzySearch;
	quote?: (str: string) => string;
	spaceRegExpStr?: string;
	arrayRegExs?: (ptnSH: SplitHangul) => RegExp[];
	highlightStrFromIndices?: (strSplitted: SplitHangul, indices: { start: number; end: number }[]) => string;
	matchScoreFromIndices?: (strSH: SplitHangul, ptnSH: SplitHangul, indices: { start: number; end: number }[]) => number;
	fuzzySearch?: (ptnSH: SplitHangul, fs: FuzzySearch) => FuzzySearchResult;
	gotoLi?: (e: any, elem: HTMLElement, k: number, fs: FuzzySearch) => void;
	doFSGo?: (fs: FuzzySearch) => void;
	fsGoOn?: () => void;
	previous?: number;
	wait?: number;
	encloseStr?: (str: string) => string;
	strToJSON?: (str: string, colMap?: boolean, rowMap?: boolean) => Promise<StrToJSON>;
	csvToJSON?: (str: string, colMap?: boolean, rowMap?: boolean) => Promise<StrToJSON>;
	arrayToTableHTML?: (txtArray: StrToJSON) => string;
	SEEToArray?: (SEE: string) => string[];
	getEmmetFromHead?: (head: string) => string;
	getClassesFromEmmet?: (emmet: string) => string;
	getIdFromEmmet?: (emmet: string) => string;
	renderToDocuK?: (toBeRendered: string, docuKI: number) => string;
	getContentsJoinedWithEnter?: ($elem: JQuery<HTMLElement>) => string;
	indentsRemove?: (str: string) => string;
	printCode?: (codeId: string) => void;
	toggleHeight?: (elem: HTMLElement) => void;
	ShowHide?: (elem: HTMLElement) => void;
	Hide?: (elem: HTMLElement) => void;
	ShowBR?: (elem: HTMLElement) => void;
	timerHideBRQueue?: ReturnType<typeof setTimeout>;
	timerHideBR?: (elem: HTMLElement) => void;
	HideBR?: (elem: HTMLElement) => void;
	mode?: "Bright" | "Dark";
	fontFamily?: string;
	fontSize?: number;
	lineHeight10?: number;
	defaultStyles?: {
		mode: "Bright" | "Dark";
		fontFamily?: string;
		fontSize?: number;
		lineHeight10?: number;
	};
	printDeviceInfo?: () => void;
	plink?: string;
	resetStyle?: () => void;
	Cmode?: (modeI: "Bright" | "Dark") => boolean;
	CfontFamily?: (fontFamily: string) => boolean;
	CfontSize?: (increment: number) => boolean;
	ClineHeight?: (increment: number) => boolean;
	shareSNS?: (sns: string) => boolean;
	delayPad?: number;
	$delayedElems?: JQuery<HTMLElement>;
	delayedLoadAll?: () => Promise<void>;
	delayedLoadByScroll?: () => Promise<void>;
	setTimeoutDelayedLoad?: ReturnType<typeof setTimeout>;
	toggleAMess?: (elem: HTMLElement) => void;
	docuKProcess?: (docuKI: number) => void;
	printMode?: boolean;
	ripplesDisabled?: boolean;
	SEEHTMLs?: string[];
	canonicalURI?: string;
	$bubbleRefs?: JQuery<HTMLElement>;
	$headOrBody?: JQuery<HTMLElement>;
	goOn?: boolean;
	logOn?: boolean;
	disqusVars?: { page: { url?: string; identifier?: string } };
	$deviceInfo?: JQuery<HTMLElement>;
	myIPs?: string[];
	ignoreMe?: boolean;
	weekDays?: WeekDays;
	daysToPlotPageViewsChart?: number;
	to?: {
		date: string;
		month: string;
		day: string;
		weekday: "일" | "월" | "화" | "수" | "목" | "금" | "토";
	}[];
	from?: { date: string }[];
	blogStatRes?: StrToJSON;
	getBlogStat?: () => Promise<void>;
	loadPageViewsStat?: () => Promise<void>;
	setIntervalBlogStatN?: number;
	kakao_js_id?: string;
	kakaoInitDo?: () => void;
	kakaoInit?: ReturnType<typeof setInterval>;
	popUpKakao?: () => void;
	$fdList?: JQuery<HTMLElement>;
	fdList?: HTMLElement[];
	$tocs?: JQuery<HTMLElement>;
	$rras?: JQuery<HTMLElement>;
	processShortKey?: (event: any) => void;
	handleComments?: () => void;
	processElement?: ($elem: JQuery<HTMLElement>) => Promise<void>;
	processAllElements?: () => Promise<void>;
	$prePrettyScrollable?: JQuery<HTMLElement>;
	reNewAndReOn?: () => void;
	mathJaxPreProcessDo?: () => void;
	mathJaxPreProcess?: ReturnType<typeof setTimeout>;
	doPrettyPrint?: () => void;
	$button_menu?: JQuery<HTMLElement>;
}

export type PatternURI = {
	regEx?: RegExp;
	regEx0?: RegExp;
	regEx1?: RegExp;
	regEx2?: RegExp;
	toIframe?: (uriRest: string, inListPlay: boolean, toA: boolean, descR: DescR) => Promise<RenderResult>;
}[] &
	any;

export type DescR = {
	"#start"?: {
		key: string;
		val: string;
	};
	"#end"?: {
		key: string;
		val: string;
	};
	"#lyrics"?: {
		key: string;
		val: string;
	};
};

export type YTiframeConfig = {
	startSeconds?: number;
	endSeconds?: number;
	start?: number;
	end?: number;
	hash?: string;
};

export type RenderResult = {
	html: string;
	from: string;
};

export type YTiframeResult = RenderResult & {
	videoId?: string;
	list?: string;
	config?: YTiframeConfig;
};

export type DecomposedURI = {
	uri: string;
	protocol: string | null;
	uriHost: string | null;
	pathname: string | null;
	search: string | null;
	hash: string | null;
	uriWithoutHash?: string | null;
};

export type SearchVars = {
	key: string;
	val: string;
}[] &
	any;

export type SplitHangul = {
	array: {
		char: string;
		splitted3: string;
		splitted: string;
		matched?: boolean;
	}[];
	originalStr: string;
	splitted3: string;
	splitted: string;
	pCho: (boolean | undefined)[];
};

export type FuzzySearchResult = {
	ptnSH: SplitHangul;
	maxMatchScore?: number;
	sorted?: number[];
	shuffled?: number[];
	array?: {
		i: number;
		maxMatchScore: number;
		highlight?: string;
	}[];
} | null;

export type FuzzySearch = {
	array: FuzzySearchResult[];
	fullList: FuzzySearchFullListItem[];
	shuffled: { i: number }[] | undefined | null | false;
	$fsLis: JQuery<HTMLElement>;
	$fs: JQuery<HTMLTextAreaElement>;
	$fsl: JQuery<HTMLElement>;
};

export type FuzzySearchFullListItem = {
	i: number;
	txt: SplitHangul;
	html: string;
	$listI: JQuery<HTMLElement>;
};

export type FSToRs = {
	fixed: boolean;
};

export type StrToJSON = string[][] & any;

export type WeekDays = ["일", "월", "화", "수", "목", "금", "토"];
