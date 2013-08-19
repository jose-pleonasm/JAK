
/**
 * @constructor
 * @param {object} obj objekt jehoz reflexe se ma vytvorit
 */
var ReflectionClass = function(obj) {
	this.obj = null;
	this.hierarchy = null;
	this.isJAK = false;
	this.isSZN = false;
	if (typeof obj == 'object') {
		this.obj = obj;
	} else if (typeof obj == 'string') {
		this.obj = new String(obj);
	} else {
		throw new Error('Invalid object');
	}
	var constructor = this.getConstructor();
	if (constructor && constructor.NAME) {
		if (constructor.NAME.indexOf('JAK') === 0) {
			this.isJAK = true;
		}
		if (constructor.NAME.indexOf('SZN') === 0) {
			this.isSZN = true;
		}
	}
};

/**
 * Spocita kolik rodicu ma dana trida
 *
 * @private
 * @static
 * @param {string} jsClassName nazev tridy
 * @return {(number|boolen)} pocet rodicu
 */
ReflectionClass._countParent = function(jsClassName) {
	if (jsClassName == 'Object') {
		return 0;
	}
	var count = 0;
	var proto = window[jsClassName].prototype;
	if (!proto || !proto.__proto__) {
		return false;
	}
	while (proto = proto.__proto__) {
		count++;
	}
	return count;
};

/**
 * Porovnava tridy dle dedicnosti
 *
 * @private
 * @static
 * @param {object} a
 * @param {object} b
 * @return {number}
 */
ReflectionClass._sortClassesByInheritance = function(a, b) {
	var countA = ReflectionClass._countParent(a),
	    countB = ReflectionClass._countParent(b);
	if (countA > countB) {
		return -1;
	}
	if (countA < countB) {
		return 1;
	}
	return 0;
};

/**
 * Vrati seznam vsech JAK trid dle dedicnosti
 *
 * @private
 * @static
 * @param {function} JAKConstructor
 * @return {array}
 */
ReflectionClass._getJAKInheritance = function(JAKConstructor) {
	var temp = [];
	if (JAKConstructor.EXTEND) {
		temp = temp.concat(ReflectionClass._getJAKInheritance(JAKConstructor.EXTEND));
	}
	if (JAKConstructor.IMPLEMENT) {
		for (var i = 0; i < JAKConstructor.IMPLEMENT.length; i++) {
			temp = temp.concat(ReflectionClass._getJAKInheritance(JAKConstructor.IMPLEMENT[i]));
		}
	}
	temp.push(JAKConstructor.NAME);
	return temp;
};

/**
 * Vytvori hierarchii, uplatni se u JAKa
 */
ReflectionClass.prototype._makeHierarchyJAK = function() {
	this.hierarchy = ['Object'];
	this.hierarchy = this.hierarchy.concat(ReflectionClass._getJAKInheritance(this.obj.constructor));
	this.hierarchy.reverse();
};

/**
 * Vytvori hierarchii
 */
ReflectionClass.prototype._makeHierarchyNormal = function() {
	var ident = '';
	this.hierarchy = ['Object'];
	if (this.obj === window) {
		return;
	}

	ident = ''.concat(this.obj).replace(/^.*function\s+([^\s]*|[^\(]*)\([^\x00]+$/, '$1') || 'anonymous';
	var constructor = this.getConstructor();
	if (constructor && constructor.prototype) {
		for (ident in window) {
			try {
				window[ident];
			}
			catch (e) {
				continue;
			}
			if (typeof(window[ident]) === 'function' && window[ident].prototype && this.obj instanceof window[ident]) {
				this.hierarchy.push(ident);
			}
		}
	}

	this.hierarchy.sort(ReflectionClass._sortClassesByInheritance);
};

/**
 * Rucne definuje objekt jako JAK
 */
ReflectionClass.prototype.defAsJAK = function() {
	this.isJAK = true;
};

/**
 * Rucne definuje objekt jako SZN
 */
ReflectionClass.prototype.defAsSZN = function() {
	this.isSZN = true;
};

/**
 * Zda jde objekt z nejake JAK tridy
 *
 * @return {boolean}
 */
ReflectionClass.prototype.isJAK = function() {
	return this.isJAK;
};

/**
 * Zda jde objekt z nejake SZN tridy
 *
 * @return {boolean}
 */
ReflectionClass.prototype.isSZN = function() {
	return this.isSZN;
};

/**
 * Vrati konstruktor reflektovaneho objektu
 *
 * @return {function} funkce ktera slouzi jako konstruktor
 */
ReflectionClass.prototype.getConstructor = function() {
	return this.obj.constructor;
};

/**
 * Vrati seznam trid reflektovaneho objektu podle dedicnosti:
 * prvni je vlastni trida, pak pripadne predek, pak pripadne dalsi ... pak obecny objekt Object
 *
 * @return {array}
 */
ReflectionClass.prototype.getClassHierarchy = function() {
	if (this.hierarchy !== null) {
		return this.hierarchy;
	}

	if (this.isJAK || this.isSZN) {
		this._makeHierarchyJAK();
	} else {
		this._makeHierarchyNormal();
	}

	return this.hierarchy;
}

/**
 * Vrati tridu - nazev konstruktoru
 *
 * @return {string}
 */
ReflectionClass.prototype.getClass = function() {
	return this.getClassHierarchy()[0];
};

/**
 * Vrati nazev rodicovske tridy reflektovaneho objektu
 *
 * @return {(string|boolean)} nazev tridy, nebo false
 */
ReflectionClass.prototype.getParent = function() {
	var hierarchy = this.getClassHierarchy();
	if (hierarchy[1] !== undefined) {
		return hierarchy[1];
	} else {
		return null;
	}
};

/**
 * Testuje zda jde o statickou vlastnost
 *
 * @param {string} property nazev vlastnosti / metody
 * @return {boolean}
 */
ReflectionClass.prototype.isStatic = function(property) {
	var _class = this.getClass();
	return window[_class][property] !== undefined && this.obj[property] === undefined;
};

/**
 * Vrati seznam konstant reflektovaneho objektu
 *
 * @return {array} pole s nazvy konstant
 */
ReflectionClass.prototype.getConstants = function() {
	var temp = this.getStaticProperties();
	var constants = [];
	var i = 0;

	for (i = 0; i < temp.length; i++) {
		if (temp[i].search(/^[A-Z][A-Z0-9_]+$/) !== -1) {
			constants.push(temp[i]);
		}
	}

	return constants;
};

/**
 * Vrati seznam statickych vlastnosti reflektovaneho objektu
 *
 * @return {array} pole s nazvy statickych vlastnosti
 */
ReflectionClass.prototype.getStaticProperties = function() {
	var properties = [];
	var property = '';
	var _class = this.getClass();

	for (property in window[_class]) {
		//if (window[_class].hasOwnProperty(property)) {
		if (this.obj[property] === undefined) {
			if (typeof window[_class][property] != 'function') {
				properties.push(property);
			}
		}
	}

	return properties;
};

/**
 * Vrati seznam statickych metod reflektovaneho objektu
 *
 * @return {array} pole s nazvy statickych metod
 */
ReflectionClass.prototype.getStaticMethods = function() {
	var methods = [];
	var property = '';
	var _class = this.getClass();

	for (property in window[_class]) {
		//if (window[_class].hasOwnProperty(property)) {
		if (this.obj[property] === undefined) {
			if (typeof window[_class][property] == 'function') {
				methods.push(property);
			}
		}
	}

	return methods;
};

/**
 * Vrati seznam vlastnosti reflektovaneho objektu
 *
 * @return {array} pole s nazvy vlastnosti
 */
ReflectionClass.prototype.getProperties = function() {
	var properties = [];
	var property = '';

	for (property in this.obj) {
		if (!this.obj.hasOwnProperty || this.obj.hasOwnProperty(property)) {
			if (typeof(this.obj[property]) != 'function') {
				properties.push(property);
			}
		}
	}

	return properties;
};

/**
 * Vrati seznam metod reflektovaneho objektu
 *
 * @return {array} pole s nazvy metod
 */
ReflectionClass.prototype.getMethods = function() {
	var methods = [];
	var property = '';

	for (property in this.obj) {
		if (typeof this.obj[property] == 'function') {
			methods.push(property);
		}
	}

	return methods;
};

/**
 * Vrati serialozovany objekt reprezentujici reflektovany objekt
 *
 * @return {string}
 */
ReflectionClass.prototype.getSource = function() {
	if (this.obj.toSource) {
		return this.obj.toSource();
	}

	function getSource(obj) {
		var output = [], temp;
		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				temp = i + ':';
				switch (typeof obj[i]) {
					case 'object' :
						temp += getSource(obj[i]);
						break;
					case 'string' :
						temp += '\'' + obj[i] + '\''; // add in some code to escape quotes
						break;
					default :
						temp += obj[i];
				}
				output.push(temp);
			}
		}
		return '{' + output.join() + '}';
	}
	return getSource(this.obj);
};
