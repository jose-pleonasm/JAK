//"use strict";

/**
 * Pomucka pro ladeni
 */
JAK.Debug = JAK.ClassMaker.makeStatic({
	"NAME": "JAK.Debug",
	"VERSION": "1.0"
});

JAK.Debug.settings = {
	maxLen: 10,
	maxDepth: 2,
	unknownFunctionName: "[unknown]",
	unknownElementName: "[unknown_element_name]",
	useReflectionClass: true,
	stdout: console.log,
	outputEl: null,
	formatString: {
		UNDEFINED_S: "",
		UNDEFINED_E: "",
		NULL_S: "",
		NULL_E: "",
		STRING_S: "\"",
		STRING_E: "\"",
		STRING_SIZE_S: "",
		STRING_SIZE_E: "",
		BOOL_S: "",
		BOOL_E: "",
		NUMBER_S: "",
		NUMBER_E: "",
		FUNCTION_S: "",
		FUNCTION_E: "",
		OBJECT_S: "",
		OBJECT_E: "",
		ARRAY_S: "",
		ARRAY_E: "",
		ARRAY_SIZE_S: "",
		ARRAY_SIZE_E: "",
		NODE_S: "",
		NODE_E: "",
		NODE_NAME_S: "",
		NODE_NAME_E: "",
		NODE_ATTR_S: "",
		NODE_ATTR_E: ""
	},
	formatHtml: {
		UNDEFINED_S: "<span class=\"debug-type-undefined\" style=\"color:#00f;font-weight:normal;\">",
		UNDEFINED_E: "</span>",
		NULL_S: "<span class=\"debug-type-null\" style=\"color:#00f;font-weight:normal;\">",
		NULL_E: "</span>",
		STRING_S: "<span class=\"debug-type-string\" style=\"color:#000;font-weight:normal;\">\"",
		STRING_E: "\"</span>",
		STRING_SIZE_S: "<span class=\"debug-type-string-size\" style=\"color:#000;font-style:italic;font-weight:normal;\">",
		STRING_SIZE_E: "</span>",
		BOOL_S: "<span class=\"debug-type-bool\" style=\"color:#00f;font-weight:normal;\">",
		BOOL_E: "</span>",
		NUMBER_S: "<span class=\"debug-type-number\" style=\"color:#000;font-weight:normal;\">",
		NUMBER_E: "</span>",
		FUNCTION_S: "<span class=\"debug-type-function\" style=\"color:#0a0;font-style:italic;font-weight:normal;\">",
		FUNCTION_E: "</span>",
		OBJECT_S: "<span class=\"debug-type-object\" style=\"color:#0a0;font-style:italic;font-weight:normal;\">",
		OBJECT_E: "</span>",
		ARRAY_S: "<span class=\"debug-type-array\" style=\"color:#000;font-weight:bold;\">",
		ARRAY_E: "</span>",
		ARRAY_SIZE_S: "<span class=\"debug-type-array-size\" style=\"color:#000;font-style:italic;font-weight:normal;\">",
		ARRAY_SIZE_E: "</span>",
		NODE_S: "<span class=\"debug-type-node\" title=\"${title}\" style=\"color:#008;font-weight:normal;\" ${viewer}>",
		NODE_E: "</span>",
		NODE_NAME_S: "<span class=\"debug-type-node-name\" style=\"color:#00f;font-weight:normal;\">",
		NODE_NAME_E: "</span>",
		NODE_ATTR_S: "<span class=\"debug-type-node-attr\" style=\"color:#f00;font-weight:normal;\">",
		NODE_ATTR_E: "</span>"
	}
};

/**
 * Zkraceni stringu
 *
 * @param {string} s
 * @return {string}
 */
JAK.Debug.cut = function(s) {
	if (s.length > JAK.Debug.settings.maxLen) {
		s = s.substring(0, JAK.Debug.settings.maxLen) + "...";
	}
	return s;
};

/**
 * Escape pro HTML
 *
 * @param {string} s
 * @return {string}
 */
JAK.Debug.escapeHtml = function(s) {
	return s
		.toString()
		.replace(/&/g, "&amp;")
		.replace(/>/g, "&gt;")
		.replace(/</g, "&lt;")
		.replace(/"/g, "&quot;");
};

/**
 * Testuje zda je specifikovany parametr pole
 *
 * @param {any} obj
 * @return {bool}
 */
JAK.Debug.isArray = function(obj) {
	if (Array.isArray) {
		return Array.isArray(obj);
	} else {
		return Object.prototype.toString.call(obj).toLowerCase().indexOf("array") > -1;
	}
};

/**
 * Vrati informace o funkci/metode
 *
 * @param {function} func
 * @param {object} obj
 * @param {bool} deep
 * @return {object} context, name
 */
JAK.Debug.getFunctionInfo = function(func, obj, deep) {
	obj = obj || window;
	deep = deep || false;

	if (!func || typeof(func) != "function") {
		throw new Error("[JAK.Debug.getFunctionInfo] Invalid argument 'func'");
	}
	if (typeof(obj) != "object" || obj === null) {
		throw new Error("[JAK.Debug.getFunctionInfo] Invalid argument 'obj'");
	}

	var info = {
		context: obj,
		name: JAK.Debug.settings.unknownFunctionName
	};
	if (func.name && func.name != "") {
		info.name = func.name;
		return info;
	}

	var re = /function\s+(\S+)\s*\((.|\n)*?\)\s*{/;
	if (re.test(func.toString())) {
		info.name = RegExp.$1;
		return info;
	}

	for (var propertyName in obj) {
		try {
			var objProperty = obj[propertyName];
		}
		catch (error) {
			continue;
		}
		if (typeof(objProperty) == "function") {
			if (objProperty == func) {
				info.name = propertyName;
				return info;
			}

		} else if (deep && (typeof(objProperty) == "object" && objProperty !== null)) {
			info = arguments.callee(func, objProperty);
			if (info.name != JAK.Debug.settings.unknownFunctionName) {
				return info;
			}
		}
	}
	return info;
};

/**
 * Vrati nazev funkce
 *
 * @param {function} func
 * @param {object} obj
 * @param {bool} deep
 * @return {string}
 */
JAK.Debug.getFunctionName = function(func, obj, deep) {
	obj = obj || window;
	deep = deep || false;

	var funcInfo = JAK.Debug.getFunctionInfo(func, obj, deep);
	try {
		var contextName = JAK.Debug.describe(funcInfo.context).name;
	}
	catch (error) {
		var contextName = "";
	}

	var funcName = funcInfo.name;
	if (contextName && contextName != "Object") {
		funcName = contextName + "." + funcName;
	}
	return funcName;
};

/**
 * Vrati pole funkci/metod, a jejich argumenty, jez vedli k soucasnemu kodu
 *
 * @return {object}
 */
JAK.Debug.getBacktrace = function() {
	if (!arguments.callee || !arguments.callee.caller) {
		return;
	}
	var originDepth = JAK.Debug.settings.maxDepth;
	JAK.Debug.settings.maxDepth = 0;
	var trace = [];

	var caller = arguments.callee;
	while (caller = caller.caller) {
		trace.push({
			originFunction: caller,
			functionName: JAK.Debug.getFunctionName(caller, window, true),
			arguments: JAK.Debug.describeMulti(caller.arguments, true)
		});
	}

	JAK.Debug.settings.maxDepth = originDepth;
	return trace;
};

/**
 * Vrati retezec reprezentujici funkce/metody jez vedli k soucasnemu kodu
 *
 * @return {string}
 */
JAK.Debug.getBacktraceAsString = function() {
	var trace = JAK.Debug.getBacktrace();
	trace = trace.slice(1);
	var s = "";

	var iFirst = true;
	for (var i = 0; i < trace.length; i++) {
		if (!iFirst) {
			s = s + " ";
		}
		var item = trace[i];
		s = s + "#" + (i) + " ";
		s = s + item.functionName + "(";
		var jFirst = true;
		for (var j = 0; j < item.arguments.length; j++) {
			if (!jFirst) {
				s = s + ", ";
			}
			s = s + item.arguments[j].toString();
			jFirst = false;
		}
		s = s + ")";
		iFirst = false;
	}

	return s;
};

/**
 * dump
 */
JAK.Debug.dump = function() {
	for (var i = 0; i < arguments.length; i++) {
		var ref = this.describe(arguments[i]);
		if (JAK.Debug.settings.stdout) {
			JAK.Debug.settings.stdout.call(window, ref.toString());
		}
		if (JAK.Debug.settings.outputEl) {
			var el = JAK.mel("pre");
			el.innerHTML = ref.toHtml();
			JAK.Debug.settings.outputEl.appendChild(el);
		}
	}
};

/**
 * JAK.Debug.describe pro pole
 *
 * @return {array}
 */
JAK.Debug.describeMulti = function(subjects, objectAsArray) {
	objectAsArray = objectAsArray || false;
	if (!objectAsArray && !JAK.Debug.isArray(subjects)) {
		throw new Error("[JAK.Debug.describeMulti] Argument must be an array");
	}
	var results = [];
	for (var i = 0; i < subjects.length; i++) {
		results.push(JAK.Debug._describe(subjects[i]));
	}
	return results;
};

/**
 * Alias
 *
 * @return {JAK.Debug.Reflection}
 */
JAK.Debug.describe = function(subject) {
	return JAK.Debug._describe(subject);
};

/**
 * Vytvori popisny objekt
 *
 * @return {JAK.Debug.Reflection}
 */
JAK.Debug._describe = function(subject, depth) {
	depth = depth || 0;
	if (depth > JAK.Debug.settings.maxDepth) {
		return;
	}

	var subjectType = typeof(subject);
	var ref = null;

	if (subject === undefined) {
		ref = new JAK.Debug.Reflection(subject, JAK.Debug.Reflection.UNDEFINED);

	} else if (subject === null) {
		ref = new JAK.Debug.Reflection(subject, JAK.Debug.Reflection.NULL);

	} else if (subjectType == "string") {
		ref = new JAK.Debug.Reflection(subject, JAK.Debug.Reflection.STRING, subject.length);

	} else if (subjectType == "boolean") {
		ref = new JAK.Debug.Reflection(subject, JAK.Debug.Reflection.BOOLEAN);

	} else if (subjectType == "number") {
		ref = new JAK.Debug.Reflection(subject, JAK.Debug.Reflection.NUMBER, (""+subject).length);

	} else if (subjectType == "function") {
		try {
			var name = JAK.Debug.getFunctionName(subject, window);
		}
		catch (error) {
			name = "";
		}
		ref = new JAK.Debug.Reflection(subject, JAK.Debug.Reflection.FUNCTION, NaN, null, name);

	// Node
	} else if (subjectType == "object" && subject.nodeType) {
		var name = subject.nodeName ? subject.nodeName.toLowerCase() : JAK.Debug.settings.unknownElementName;
		var properties = [];
		if (subject.attributes) {
			for (var i = 0, len = subject.attributes.length; i < len; i++) {
				var attr = subject.attributes[i];
				if (attr.specified) {
					properties.push({
						name: attr.name,
						ref: attr.value
					});
				}
			}
			properties.reverse();
		}
		var size = 0;
		if (subject.childNodes && subject.childNodes.length > 0) {
			for (var j = 0, len = subject.childNodes.length; j < len; j++) {
				if (subject.childNodes[j].nodeType === 1) {
					size++;
				}
			}
		}
		ref = new JAK.Debug.Reflection(subject, JAK.Debug.Reflection.NODE, size, properties, name);

	// Array
	} else if (subjectType == "object" && JAK.Debug.isArray(subject)) {
		var len = subject.length,
		    properties = [];
		if (depth < JAK.Debug.settings.maxDepth) {
			for (var i = 0; i < len; i++) {
				properties.push({
					name: ""+i,
					ref: JAK.Debug._describe(subject[i], depth+1)
				});
			}
		}
		ref = new JAK.Debug.Reflection(subject, JAK.Debug.Reflection.ARRAY, len, properties, "Array");

	// Object
	} else if (subjectType == "object") {
		if (ReflectionClass) {
			var reflection = new ReflectionClass(subject);
			var subjectProps = reflection.getProperties();
			var len = subjectProps.length,
			    properties = [];
			if (depth < JAK.Debug.settings.maxDepth) {
				for (var i = 0; i < len; i++) {
					properties.push({
						name: subjectProps[i],
						ref: JAK.Debug._describe(subject[subjectProps[i]], depth+1)
					});
				}
			}
			ref = new JAK.Debug.Reflection(subject, JAK.Debug.Reflection.OBJECT, len, properties, reflection.getClass());
		} else {
			ref = new JAK.Debug.Reflection(subject, JAK.Debug.Reflection.OBJECT, subject.length);
		}
	}

	return ref;
};
/* END of JAK.Debug */

/**
 * Popis objektu
 */
JAK.Debug.Reflection = JAK.ClassMaker.makeClass({
	"NAME": "JAK.Debug.Reflection",
	"VERSION": "1.0"
});

JAK.Debug.Reflection.UNDEFINED = "undefined";
JAK.Debug.Reflection.NULL      = "null";
JAK.Debug.Reflection.STRING    = "string";
JAK.Debug.Reflection.BOOLEAN   = "boolean";
JAK.Debug.Reflection.NUMBER    = "number";
JAK.Debug.Reflection.FUNCTION  = "function";
JAK.Debug.Reflection.OBJECT    = "object";
JAK.Debug.Reflection.ARRAY     = "array";
JAK.Debug.Reflection.NODE      = "node";

/**
 * @param {any} original puvodni subjekt
 * @param {string} type typ subjektu
 * @param {number} size velikost subjektu
 * @param {array} properties vlastnosti subjektu
 * @param {string} name nazev subjektu - nazev tridy
 */
JAK.Debug.Reflection.prototype.$constructor = function(original, type, size, properties, name) {
	size = typeof(size) == "undefined" ? NaN : size;
	properties = properties || [];
	name = name || "";

	this.original = original;
	this.type = type;
	this.size = size;
	this.properties = properties;
	this.name = name;

	this._string = "";
	this._html = "";
};

/**
 * @return {string} cisty text
 */
JAK.Debug.Reflection.prototype.toString = function() {
	if (this._string != "") {
		return this._string;
	}
	this._string = this._createOutput(JAK.Debug.settings.formatString);
	return this._string;
};

/**
 * @return {string} html text
 */
JAK.Debug.Reflection.prototype.toHtml = function() {
	if (this._html != "") {
		return this._html;
	}
	this._html = this._createOutput(JAK.Debug.settings.formatHtml, JAK.Debug.escapeHtml);
	return this._html;
};

/**
 * Vytvori text popisujici subjekt
 */
JAK.Debug.Reflection.prototype._createOutput = function(f, escape) {
	escape = escape || function(s) {return s;};
	var s = "";

	if (this.type === JAK.Debug.Reflection.UNDEFINED) {
		s = f.UNDEFINED_S + "undefined" + f.UNDEFINED_E;

	} else if (this.type === JAK.Debug.Reflection.NULL) {
		s = f.NULL_S + "null" + f.NULL_E;

	} else if (this.type === JAK.Debug.Reflection.STRING) {
		s = f.STRING_S + escape(JAK.Debug.cut(this.original)) + f.STRING_E + f.STRING_SIZE_S + "(" + this.size + ")" + f.STRING_SIZE_E;

	} else if (this.type === JAK.Debug.Reflection.BOOLEAN) {
		s = f.BOOL_S + (this.original ? "true" : "false") + f.BOOL_E;

	} else if (this.type === JAK.Debug.Reflection.NUMBER) {
		s = f.NUMBER_S + this.original + f.NUMBER_E;

	} else if (this.type === JAK.Debug.Reflection.FUNCTION) {
		s = f.FUNCTION_S + "function()" + f.FUNCTION_E;

	// Array
	} else if (this.type === JAK.Debug.Reflection.ARRAY) {
		s = f.ARRAY_S + "[ ";
		if (this.properties.length > 0) {
			var first = true;
			for (var i = 0,  len = this.properties.length; i < len; i++) {
				var p = this.properties[i];
				if (!first) {
					s = s + ", ";
				}
				s = s + p.ref._createOutput(f, escape);
				first = false;
			}
		}
		s = s + " ]" + f.ARRAY_E;
		s = s + f.ARRAY_SIZE_S + "(" + this.size + ")" + f.ARRAY_SIZE_E;

	// Node
	} else if (this.type === JAK.Debug.Reflection.NODE) {
		var NODE_S = f.NODE_S;
		if (NODE_S.indexOf("${title}") > -1) {
			NODE_S = NODE_S.replace("${title}", JAK.Debug.cut(escape(this.original.innerHTML)));
		}

		s = NODE_S + escape("<") + f.NODE_NAME_S + escape(this.name) + f.NODE_NAME_E;
		var first = true;
		for (var i = 0, len = this.properties.length; i < len; i++) {
			var p = this.properties[i];
			s = s + escape(" " + p.name + "=\"") + f.NODE_ATTR_S + escape(p.ref) + f.NODE_ATTR_E + escape("\"");
			first = false;
		}
		s = s + escape(">") + f.NODE_E;

		s = this._installViewer(s);

	// Object
	} else if (this.type === JAK.Debug.Reflection.OBJECT) {
		var name = this.name != "" ? this.name : "Object";
		s = f.OBJECT_S + name;
		if (this.properties.length > 0) {
			s = s + " { ";
			var first = true;
			for (var i = 0,  len = this.properties.length; i < len; i++) {
				var p = this.properties[i];
				if (!first) {
					s = s + ", ";
				}
				s = s + p.name + "=" + p.ref._createOutput(f, escape);
				first = false;
			}
			s = s + " }";
		}
		s = s + f.OBJECT_E;

	} else {
		s = escape(this.type);
	}

	return s;
};

/**
 * Vytvori zobrazovac subjektu (jen pokud se jedna o element)
 */
JAK.Debug.Reflection.prototype._installViewer = function(s) {
	if (s.indexOf("${viewer}") === -1) {
		return s;
	}

	this._id = JAK.idGenerator();
	window[this._id] = this;
	s = s.replace("${viewer}", " onmouseover=\"window['"+this._id+"']._showEl()\""
	                         +  " onmouseout=\"window['"+this._id+"']._hideEl()\""
	                         +     " onclick=\"window['"+this._id+"']._toggleEl()\"");

	this._isView = false;
	this._isFixedView = false;
	this._viewEl = JAK.mel("div", {className:"debug-viewer-box"}, {position:"absolute", zIndex:"1000", opacity:"0.5", background:"#9FC4E7"});

	return s;
};

/**
 * Zvyrazni subjekt
 */
JAK.Debug.Reflection.prototype._showEl = function() {
	if (this._isView) {
		return;
	}
	/* pokud nema rodice, neni element v dokumentu */
	if (!this.original.parentNode) {
		return;
	}

	if (this.original == window.document) {
		this._vePos = {top:0, left:0};
	} else {
		this._vePos = JAK.DOM.getBoxPosition(this.original);
	}
	this._veDim = {
		width: this.original.offsetWidth,
		height: this.original.offsetHeight
	}
	this._viewEl.style.top = this._vePos.top + "px";
	this._viewEl.style.left = this._vePos.left + "px";
	this._viewEl.style.width = this._veDim.width + "px";
	this._viewEl.style.height = this._veDim.height + "px";
	document.body.appendChild(this._viewEl);

	this._isView = true;
};

/**
 * Skryje zvyrazneni subjektu
 */
JAK.Debug.Reflection.prototype._hideEl = function() {
	if (!this._isView) {
		return;
	}
	if (this._isFixedView) {
		return;
	}

	document.body.removeChild(this._viewEl);

	this._isView = false;
};

/**
 * Prepina mezi ne/zvyraznenim subjektu
 */
JAK.Debug.Reflection.prototype._toggleEl = function() {
	if (this._isFixedView) {
		this._isFixedView = false;
		this._hideEl();
	} else {
		this._isFixedView = true;
		this._showEl();
	}
};
/* END of JAK.Debug.Reflection */
