
/**
 * @overview Kontrolovani verze prohlizece dle specifikace a pripadne zobrazeni informacniho panelu
 * @author jose
 */

/**
 * @namespace
 */
JAK.BrowserInfo = { NAME:"JAK.BrowserInfo" };

/**
 * @see JAK.BrowserInfo.Processor#setLinks
 * @type {Object}
 */
JAK.BrowserInfo.DEFAULT_LINKS = {
	win: {
		gecko: {
			seznam: "http://download.seznam.cz/firefox/release/seznam-firefox-win32-cs.exe",
			common: "http://www.mozilla.cz/stahnout/firefox/"
		},
		opera: {
			seznam: "http://download.seznam.cz/opera/Opera_1700_int_Setup.exe",
			common: "http://www.opera.com/download/get/?partner=www&opsys=Windows"
		},
		ie64: {
			seznam: "http://download.seznam.cz/ie/IE10-Setup-Seven64.exe",
			common: "http://windows.microsoft.com/cs-cz/internet-explorer/download-ie"
		},
		ie32: {
			seznam: "http://download.seznam.cz/ie/IE10-Setup-Seven32.exe",
			common: "http://windows.microsoft.com/cs-cz/internet-explorer/download-ie"
		},
		ie: {
			common: "http://windows.microsoft.com/cs-cz/internet-explorer/download-ie"
		}
	},
	mac: {
		gecko: {
			seznam: "http://download.seznam.cz/firefox/release/seznam-firefox-mac-cs.dmg",
			common: "http://www.mozilla.cz/stahnout/firefox/"
		},
		opera: {
			common: "http://www.opera.com/download/get/?partner=www&opsys=MacOS"
		},
		safari: {
			common: "http://support.apple.com/downloads/#safari"
		}
	},
	nix: {
		gecko: {
			seznam: "http://download.seznam.cz/firefox/release/seznam-firefox-linux-cs.bz2",
			common: "http://www.mozilla.cz/stahnout/firefox/"
		},
		opera: {
			common: "http://www.opera.com/download/guide/?os=linux"
		}
	}
};

/**
 * Vrati nazev OS
 *
 * @param   {string} platform identifikace os (JAK.Browser.platform)
 * @returns {string}
 * @throws  {Error}
 */
JAK.BrowserInfo.getPlatformName = function(platform) {
	switch (platform) {
		case "win":
			return "Windows";
		case "mac":
			return "Mac OS";
		case "nix":
			return "Linux";
		case "and":
			return "Android";
		case "ios":
			return "iOS";
		case "oth":
			return "";
		default:
			throw new Error("Invalid argument: unknown platform");
	}
};

/**
 * Vrati nazev prohlizece
 *
 * @param   {string} client identifikace prohlizece (JAK.Browser.client)
 * @returns {string}
 * @throws  {Error}
 */
JAK.BrowserInfo.getClientName = function(client) {
	switch (client) {
		case "ie":
			return "Internet Explorer";
		case "gecko":
			return "Firefox";
		case "chrome":
			return "Google Chrome";
		case "safari":
			return "Safari";
		case "opera":
			return "Opera";
		case "konqueror":
			return "Konqueror";
		case "oth":
			return "";
		default:
			throw new Error("Invalid argument: unknown client");
	}
};


/**
 * @class Detekce prostredi
 * @group JAK.BrowserInfo
 */
JAK.BrowserInfo.Detection = JAK.ClassMaker.makeStatic({
	NAME: "JAK.BrowserInfo.Detection",
	VERSION: "1.0"
});

/**
 * @field  {number}  win_ver  verze Win, pokud neni win pak -1
 */
JAK.BrowserInfo.Detection.win_ver = -1;

/**
 * @field  {string}  client  identifikcae prohlizece (korekce JAK.Browser.client)
 */
JAK.BrowserInfo.Detection.client = "";

/**
 * @field  {number}  version  verze prohlizece (korekce JAK.Browser.version)
 */
JAK.BrowserInfo.Detection.version = -1;

/**
 * @field  {boolean}  isIe64bit  zda jde o 64bit verzi, pokud neni ie pak false
 */
JAK.BrowserInfo.Detection.isIe64bit = false;

(function() {
	var agent = window.navigator.userAgent.toLowerCase();

	// win version
	if (JAK.Browser.platform == "win") {
		var r = agent.match(/windows nt (\d+\.\d+)/);
		if (r) {
			JAK.BrowserInfo.Detection.win_ver = parseFloat(r[1]);
		}
	}

	// client and version
	JAK.BrowserInfo.Detection.client = JAK.Browser.client;
	JAK.BrowserInfo.Detection.version = parseFloat(JAK.Browser.version);
	if (JAK.BrowserInfo.Detection.client == "chrome") {
		var r = agent.match(/opr\/(\d+\.\d+)/);
		if (r) {
			JAK.BrowserInfo.Detection.client = "opera";
			JAK.BrowserInfo.Detection.version = parseFloat(r[1]);
		}
	}
	if (JAK.BrowserInfo.Detection.version === "0") {
		JAK.BrowserInfo.Detection.version = -1;
	} else if (JAK.BrowserInfo.Detection.client == "gecko" && JAK.BrowserInfo.Detection.version == "7") {
		var r = agent.match(/firefox\/(\d+)/);
		if (r) {
			JAK.BrowserInfo.Detection.version = parseFloat(r[1]);
		}
	}

	// detect IE 64bit
	if (JAK.BrowserInfo.Detection.client == "ie") {
		JAK.BrowserInfo.Detection.isIe64bit = agent.indexOf("wow64") > -1 || agent.indexOf("win64") > -1 || agent.indexOf("x64") > -1 || window.navigator.platform.toLowerCase() == "win64";
	}
})();
/* END of JAK.BrowserInfo.Detection */


/**
 * @class Testuje jednotlive pozadavky na prostredi
 * @group JAK.BrowserInfo
 */
JAK.BrowserInfo.Checker = JAK.ClassMaker.makeStatic({
	NAME: "Checker",
	VERSION: "1.0"
});

JAK.BrowserInfo.Checker.MAX_IE_XP = 8;
JAK.BrowserInfo.Checker.MAX_IE_VISTA = 9;

JAK.BrowserInfo.Checker.isOkay = function(requirements) {
	for (var i = 0, len = requirements.length; i < len; i++) {
		var client = Object.keys(requirements[i])[0];
		if (client == JAK.BrowserInfo.Detection.client) {
			return JAK.BrowserInfo.Detection.version >= parseFloat(requirements[i][client]);
		}
	}
	return true;
};

JAK.BrowserInfo.Checker.getRelevantClients = function() {
	var clients = ["gecko", "chrome", "opera"];
	if (JAK.Browser.platform == "win") {
		clients.push("ie");
	}
	if (JAK.Browser.platform == "mac") {
		clients.push("safari");
	}
	return clients;
};

JAK.BrowserInfo.Checker.isPossibleGetNewer = function() {
	if (JAK.BrowserInfo.Detection.client == "ie") {
		// XPecka a nizsi
		if (JAK.BrowserInfo.Detection.win_ver < 6.0 && parseInt(JAK.Browser.version) >= JAK.BrowserInfo.Checker.MAX_IE_XP) {
			return false;
		}
		// Visty
		if (JAK.BrowserInfo.Detection.win_ver < 6.1 && parseInt(JAK.Browser.version) >= JAK.BrowserInfo.Checker.MAX_IE_VISTA) {
			return false;
		}
	}
	if (JAK.BrowserInfo.Detection.client == "safari" && JAK.Browser.platform == "win") {
		return false;
	}
	return true;
};
/* END of JAK.BrowserInfo.Checker */


/**
 * @class Realizuje informacni panel
 * @group JAK.BrowserInfo
 */
JAK.BrowserInfo.Bar = JAK.ClassMaker.makeClass({
	NAME: "JAK.BrowserInfo.Bar",
	VERSION: "1.0",
	IMPLEMENT: [JAK.ISignals]
});

/**
 * Vytvori bar
 *
 * @param   {object}  options
 * @param   {object}  options.container
 * @param   {string}  options.preText
 * @param   {string}  [options.link]
 * @param   {string}  [options.linkText]
 * @param   {string}  [options.postText]
 * @param   {string}  [options.elmClass]
 * @param   {string}  [options.id]
 * @param   {string}  [options.closeImg]
 */
JAK.BrowserInfo.Bar.prototype.$constructor = function(options) {
	if (!options || !options.container) {
		throw new Error("Invalid argument: option 'container' must be specified");
	}
	this._options = options;
	if (!this._options.id) {
		this._options.id = "selaimentiedotbaari";
	}
	if (this._options.elmClass) {
		this._options.elmClass += " ";
	} else {
		this._options.elmClass = "";
	}
	this._options.elmClass += "browserInfoBar";

	this._container = JAK.gel(options.container);
	this._dom = {};
	this._ec = [];
};

JAK.BrowserInfo.Bar.prototype.show = function() {
	this._build();
};

JAK.BrowserInfo.Bar.prototype.hide = function() {
	this._dom.bar.style.height = "0";
	var hideDone = new JAK.Promise();
	setTimeout(function() { hideDone.fulfill(); }, 500);
	return hideDone;
};

JAK.BrowserInfo.Bar.prototype.close = function() {
	if (this._dom.bar) {
		this.hide().then(this._finishClose.bind(this));
	} else {
		this._finishClose();
	}
};

JAK.BrowserInfo.Bar.prototype._finishClose = function() {
	this.makeEvent("infobar-close", { id:this._options.id });
	this.$destructor();
};

JAK.BrowserInfo.Bar.prototype.$destructor = function() {
	JAK.Events.removeListeners(this._ec);
	if (this._dom.bar) {
		JAK.DOM.clear(this._dom.bar);
		this._container.removeChild(this._dom.bar);
		this._dom = null;
	}
};

JAK.BrowserInfo.Bar.prototype._build = function() {
	this._dom.bar = JAK.cel("div", this._options.elmClass, this._options.id);
	this._dom.barInner = JAK.cel("div", "barinner");
	this._dom.bar.appendChild(this._dom.barInner);
	this._dom.close = JAK.cel("span", "close");
	this._dom.close.setAttribute("data-dot", "/close-browser-info-bar");
	this._dom.bar.appendChild(this._dom.close);
	if (this._options.closeImg) {
		this._dom.closeImg = JAK.cel("img");
		this._dom.closeImg.src = this._options.closeImg;
		this._dom.close.appendChild(this._dom.closeImg);
	} else {
		this._dom.closeInner = JAK.cel("span", "closeinner");
		this._dom.closeInner.innerHTML = "x";
		this._dom.close.appendChild(this._dom.closeInner);
	}
	this._dom.msg = JAK.cel("p", "msg");
	if (this._options.preText) {
		this._dom.msg.appendChild(document.createTextNode(this._options.preText));
	}
	if (this._options.linkText) {
		this._dom.link = JAK.cel("a");
		this._dom.link.href = this._options.link;
		this._dom.link.innerHTML = this._options.linkText;
		this._dom.msg.appendChild(this._dom.link);
		this._ec.push(JAK.Events.addListener(this._dom.link, "click", this, "_click"));
	}
	if (this._options.postText) {
		this._dom.msg.appendChild(document.createTextNode(this._options.postText));
	}
	this._dom.barInner.appendChild(this._dom.msg);

	this._ec.push(JAK.Events.addListener(this._dom.close, 'click', this, 'close'));

	this._container.appendChild(this._dom.bar);
};

JAK.BrowserInfo.Bar.prototype._click = function(e) {
	this.makeEvent("infobar-click", { id:this._options.id });
	JAK.Events.cancelDef(e);
	JAK.Events.stopEvent(e);
};
/* END of JAK.BrowserInfo.Bar */


/**
 * @class Zobrazi okno s nabidkou prohlizecu
 * @group JAK.BrowserInfo
 */
JAK.BrowserInfo.Window = JAK.ClassMaker.makeClass({
	NAME: "JAK.BrowserInfo.Window",
	VERSION: "1.0",
	IMPLEMENT: [JAK.ISignals],
	DEPEND: [
		{ sClass: JAK.ModalWindow, ver: "1.5" }
	]
});

JAK.BrowserInfo.Window.MSG = "Bohužel vaše verze webového prohlížeče není aktuální. Může se tak stát, že budete ochuzeni o některé funkcionality webu, které jsou v modernějších prohlížečích samozřejmostí.<br /> Abyste si mohli užívat prohlížení webu a jeho obsahu bez omezení, doporučujeme váš současný prohlížeč aktualizovat jedním z prohlížečů z nabídky níže.";

/**
 * Vytvori okno
 *
 * @param   {object}  options
 * @param   {string}  options.platform
 * @param   {string}  options.imgPath
 * @param   {object}  options.others
 * @param   {object}  [options.main]
 */
JAK.BrowserInfo.Window.prototype.$constructor = function(options) {
	if (!options || !options.others) {
		throw new Error("Invalid argument: option 'others' must be specified");
	}
	if (!options.platform) {
		throw new Error("Invalid argument: option 'platform' must be specified");
	}
	if (!options.imgPath) {
		throw new Error("Invalid argument: option 'imgPath' must be specified");
	}

	this._options = options;
	this._content = null;
	this._build();

	var conf = {
		winClass: "bordersOrange browserInfoWindow",
		bordersImgSupport: "dumb", //zapnout podporu pro obrazkove okraje jen pro hloupe prohlizece
		bordersImg: options.imgPath + "mw_sprite_orange.png",
		bordersWidth: 70
	};
	this._sznwin = new JAK.ModalWindow(this._content, conf);
	this._sznwin.open();
};

JAK.BrowserInfo.Window.prototype._build = function() {
	// container
	this._content = JAK.cel("div", "biwContainer");

	// text
	var sznH = JAK.cel("h1");
	var sznLogo = JAK.cel("img", "logo");
	sznLogo.src = this._options.imgPath + "bi-seznam.png";
	sznLogo.alt = "Seznam.cz";
	var txt = JAK.cel("p");
	txt.innerHTML = JAK.BrowserInfo.Window.MSG;
	sznH.appendChild(sznLogo);
	this._content.appendChild(sznH);
	this._content.appendChild(txt);

	// hlavni button
	if (this._options.main) {
		var btn = JAK.cel("div", "dlb");
		var btnA = JAK.cel("a");
		btnA.href = this._options.main.links["common"];
		var btnLeft = JAK.cel("span", "dlb-jigsaw dlb-left");
		var btnMiddle = JAK.cel("span", "dlb-jigsaw dlb-middle");
		var btnRight = JAK.cel("span", "dlb-jigsaw dlb-right");
			var btnC1 = JAK.cel("span", "dlb-c1");
				var btnC2 = JAK.cel("span", "dlb-c2");
					var btnC3 = JAK.cel("span", "dlb-c3");
		var btnTxt = JAK.cel("strong", "dlb-text");
		var linkTxt = "Stáhnout " + JAK.BrowserInfo.getClientName(this._options.main.client);
		if (this._options.main.links["seznam"]) {
			btnA.href = this._options.main.links["seznam"];
			linkTxt += " od&nbsp;Seznamu";
		} else {
			btnA.target = "_blank";
		}
		btnTxt.innerHTML = linkTxt;
		var btnSup = JAK.cel("span", "dlb-sup");
		btnSup.innerHTML = "Verze pro " + JAK.BrowserInfo.getPlatformName(this._options.platform);
		btn.appendChild(btnA);
		btnC3.appendChild(btnTxt);
		btnC3.appendChild(btnSup);
		btnC2.appendChild(btnC3);
		btnC1.appendChild(btnC2);
		btnMiddle.appendChild(btnC1);
		btnA.appendChild(btnLeft);
		btnA.appendChild(btnMiddle);
		btnA.appendChild(btnRight);
		this._content.appendChild(btn);
	}

	// dalsi prohlizece
	var other = JAK.cel("div", "other");
	var oTitle = JAK.cel("h2");
	oTitle.innerHTML = "Další prohlížeče ke stažení";
	var oMenu = JAK.cel("ul", "clearfix");
	var oItem = null;
	var oItemA = null;
	var oItemLogo = null;
	var oItemText = null;
	var inx = 0;
	for (var client in this._options.others) {
		oItem = JAK.cel("li", client + " " + (inx % 2 ? "even" : "odd"));
		oItemA = JAK.cel("a");
		oItemLogo = JAK.cel("span", "logo");
		oItemText = JAK.cel("span", "text");
		oItemText.innerHTML = JAK.BrowserInfo.getClientName(client);
		if (this._options.others[client]["seznam"]) {
			oItemA.href = this._options.others[client]["seznam"];
		} else {
			oItemA.href = this._options.others[client]["common"];
			oItemA.target = "_blank";
		}
		oItemA.appendChild(oItemLogo);
		oItemA.appendChild(oItemText);
		oItem.appendChild(oItemA);
		oMenu.appendChild(oItem);
		inx++;
	}
	other.appendChild(oTitle);
	other.appendChild(oMenu);
	this._content.appendChild(other);
};
/* END of JAK.BrowserInfo.Window */


/**
 * @class Provede testy dle konfigurace a na zaklade toho pripadne zobrazi info panel
 * @group JAK.BrowserInfo
 */
JAK.BrowserInfo.Processor = JAK.ClassMaker.makeClass({
	NAME: "JAK.BrowserInfo.Processor",
	VERSION: "1.0",
	IMPLEMENT: [JAK.ISignals],
	DEPEND: [
		{ sClass: JAK.Cookie, ver: "1.0" }
	]
});

JAK.BrowserInfo.Processor.COOKIE_PREFIX = "stbvarasto";

JAK.BrowserInfo.Processor.UNIVERSAL_CLIENT = "gecko";

/**
 * Inicializace
 *
 * @param   {object}  options
 * @param   {string}  options.imgPath   cesta k obrazkum pro tento widget
 * @param   {string}  [options.id]      ID instance (pouzije se i jako atribut id elementu panelu)
 * @param   {number}  [options.exdays]  jak dlouho si pamatovat nezobrazovani panelu, ve dnech, defaultne 2
 */
JAK.BrowserInfo.Processor.prototype.$constructor = function(options) {
	if (!options || !options.imgPath) {
		throw new Error("Invalid argument: option 'imgPath' must be specified");
	}
	this._imgPath = options.imgPath;
	this._id = options.id || "selaimentiedot";
	this._exdays = options.exdays || 2;
	this._minimum = null;
	this._recommended = null;
	this._links = JAK.BrowserInfo.DEFAULT_LINKS[JAK.Browser.platform] || null;
	this._bar = null;
};

/**
 * Nastaveni odkazu na stazeni jednotlivych prohlizecu v jednotlivych OS
 *
 * @param   {object}  links  vzor: {
 *                           	win:{ gecko:{ seznam:"seznam-url-firefox", common:"obecne-url-firefox" }, ie:{ common:"obecne-url-ie" } },
 *                           	mac: { safari:{ common:"obecne-url-safari" } }
 *                           }
 */
JAK.BrowserInfo.Processor.prototype.setLinks = function(links) {
	if (!links) {
		throw new Error("Invalid argument: links must be specified");
	}
	var platformLinks = links[JAK.Browser.platform];
	this._links = platformLinks || null;
};

/**
 * Minimalni pozadavky na prostredi
 *
 * @param   {array}   requirements  pozadavky na prostredi - pole objektu, kde nazev atributu je nazev prohlizece (viz. JAK.Browser.client) a hodnota je jeho verze
 * @param   {string}  preText       zprava ktera se zobrazi, pokud nejsou specifikovane pozadavky splneny - pred odkazem
 * @param   {string}  [linkText]    text odkazu na novejsi verze prohlizece
 * @param   {string}  [postText]    text za odkazem
 */
JAK.BrowserInfo.Processor.prototype.setMinimum = function(requirements, preText, linkText, postText) {
	if (!requirements) {
		throw new Error("Invalid argument: requirements must be set");
	}
	this._minimum = {
		requirements: requirements,
		preText: preText,
		linkText: linkText || "",
		postText: postText || ""
	};
};

/**
 * Doporucene pozadavky na prostredi
 *
 * @see JAK.BrowserInfo.Processor#setMinimum
 */
JAK.BrowserInfo.Processor.prototype.setRecommended = function(requirements, preText, linkText, postText) {
	if (!requirements) {
		throw new Error("Invalid argument: requirements must be set");
	}
	this._recommended = {
		requirements: requirements,
		preText: preText,
		linkText: linkText || "",
		postText: postText || ""
	};
};

/**
 * Spusit testy a pripadne zobrazi info panel
 *
 * @param   {object}   barContainer  ID elementu, nebo odkaz na element, do ktereho se ma vlozit info panel
 * @returns {boolean}  zda prostredi splnuje specifikovane pozadavky
 */
JAK.BrowserInfo.Processor.prototype.launch = function(barContainer) {
	if (!barContainer) {
		throw new Error("Invalid argument: barContainer must be set");
	}

	if (JAK.Cookie.getInstance().get(JAK.BrowserInfo.Processor.COOKIE_PREFIX + this._id) == "nolaunch") {
		return;
	}

	if (!this._links) {
		console.warn("[JAK.BrowserInfo.Processor] No links for platform '" + JAK.Browser.platform + "'");
		return;
	}

	// zakladni atributy pro panel
	var barOptions = {
		container: barContainer,
		id: this._id,
		closeImg: this._imgPath + "bi-close.png"
	};

	var isBad = false;
	var minimumReady = true;
	if (this._minimum) {
		minimumReady = JAK.BrowserInfo.Checker.isOkay(this._minimum.requirements);
		if (!minimumReady) {
			isBad = true;
			barOptions.elmClass = "error";
			barOptions.preText = this._minimum.preText;
			barOptions.postText = this._minimum.postText;
			barOptions.link = this._getCurrentLink();
			barOptions.linkText = this._minimum.linkText;
		}
	}
	if (minimumReady && this._recommended) {
		if (!JAK.BrowserInfo.Checker.isOkay(this._recommended.requirements)) {
			isBad = true;
			barOptions.elmClass = "warn";
			barOptions.preText = this._recommended.preText;
			barOptions.postText = this._recommended.postText;
			barOptions.link = this._getCurrentLink();
			barOptions.linkText = this._recommended.linkText;
		}
	}

	// pokud neodpovida nekterym podminkam, zbrazime info panel
	if (isBad) {
		this._bar = new JAK.BrowserInfo.Bar(barOptions);
		this.addListener("infobar-close", "_saveUserWill", this._bar);
		this.addListener("infobar-click", "_showMenuWindow", this._bar);
		this._bar.show();
	}

	return !isBad;
};

JAK.BrowserInfo.Processor.prototype._getCurrentLink = function() {
	if (!this._links) {
		return "";
	}

	var currentLink = "";
	var clientLinks = this._links[JAK.BrowserInfo.Detection.client];
	if (clientLinks) {
		if (clientLinks["seznam"]) {
			currentLink = clientLinks["seznam"];
		} else {
			currentLink = clientLinks["common"];
		}
	} else if (this._links[JAK.BrowserInfo.Processor.UNIVERSAL_CLIENT]) {
		var universalLinks = this._links[JAK.BrowserInfo.Processor.UNIVERSAL_CLIENT];
		if (universalLinks) {
			if (universalLinks["seznam"]) {
				currentLink = universalLinks["seznam"];
			} else {
				currentLink = universalLinks["common"];
			}
		}
	}

	return currentLink ? currentLink : "";
};

JAK.BrowserInfo.Processor.prototype._saveUserWill = function() {
	JAK.Cookie.getInstance().set(JAK.BrowserInfo.Processor.COOKIE_PREFIX + this._id, "nolaunch", { expires:this._getCookieExpire() });
};

JAK.BrowserInfo.Processor.prototype._showMenuWindow = function() {
	if (!this._links) {
		console.error("There is any link for platfom " + JAK.Browser.platform);
		return;
	}

	var main = null;
	var others = {};
	var isPossible = JAK.BrowserInfo.Checker.isPossibleGetNewer();
	var rel = JAK.BrowserInfo.Checker.getRelevantClients();
	var ieVer = JAK.BrowserInfo.Detection.isIe64bit ? "64" : "32";
	var _cLinks = null;
	for (var client in this._links) {
		_cLinks = client == "ie" && this._links[client + ieVer] ? this._links[client + ieVer] : this._links[client];
		if (client == JAK.BrowserInfo.Detection.client) {
			if (isPossible) {
				main = {
					client: client,
					links: _cLinks
				};
			}
			continue;
		} else if (rel.indexOf(client) > -1) {
			others[client] = _cLinks;
		}
	}
	// pokud neni pro tento prohlizec novejsi verze, navrhneme defaultni
	if (!main && this._links[JAK.BrowserInfo.Processor.UNIVERSAL_CLIENT]) {
		main = {
			client: JAK.BrowserInfo.Processor.UNIVERSAL_CLIENT,
			links: this._links[JAK.BrowserInfo.Processor.UNIVERSAL_CLIENT]
		}
	}

	var win = new JAK.BrowserInfo.Window({ imgPath:this._imgPath, platform:JAK.Browser.platform, main:main, others:others });
};

/**
 * @returns {Date}  datum kdy ma vyprset cookie
 */
JAK.BrowserInfo.Processor.prototype._getCookieExpire = function() {
	var expireDate = new Date();
	expireDate.setDate(expireDate.getDate() + this._exdays);
	return expireDate;
}
/* END of JAK.BrowserInfo.Processor */
