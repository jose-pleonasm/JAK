"use strict";

JAS.StateHistory = JAK.ClassMaker.makeClass({
	NAME: "StateHistory",
	VERSION: "1.0"
});

JAS.StateHistory.prototype.$constructor = function() {
	this._stack = [];
	this._pointer = -1;
};

JAS.StateHistory.prototype.push = function(stateUrl, data) {
	if (!stateUrl) {
		throw new Error("[JAS.StateHistory] Invalid argument: stateUrl must be specified");
	}

	this._stack.push({
		stateUrlStack: [stateUrl],
		data: data || null
	});
	this._pointer++;
};

JAS.StateHistory.prototype.updateCurrentLocation = function(stateUrl) {
	if (!stateUrl) {
		throw new Error("[JAS.StateHistory] Invalid argument: stateUrl must be specified");
	}
	if (!this._stack.length) {
		throw new Error("[JAS.StateHistory] Invalid state: There is no state yet");
	}

	this._stack[this._pointer].stateUrlStack.push(stateUrl);
};

JAS.StateHistory.prototype.isEmpty = function() {
	return this._stack.length === 0;
};

JAS.StateHistory.prototype.exists = function(stateUrl) {
	if (!stateUrl) {
		throw new Error("[JAS.StateHistory] Invalid argument: stateUrl must be specified");
	}
	if (!this._stack.length) {
		throw new Error("[JAS.StateHistory] Invalid state: There is no state yet");
	}

	return this._getPointer(stateUrl) > -1;
};

JAS.StateHistory.prototype.isUnique = function(stateUrl) {
	if (!stateUrl) {
		throw new Error("[JAS.StateHistory] Invalid argument: stateUrl must be specified");
	}

	var alreadyFind = false;
	for (var i = this._stack.length - 1; i > -1; i--) {
		if (this._stack[i].stateUrlStack.indexOf(stateUrl) > -1) {
			if (alreadyFind) {
				return false;
			}
			alreadyFind = true;
		}
	}
	if (!alreadyFind) {
		throw new Error("[JAS.StateHistory] Argument out of range: There is no state for „" + stateUrl + "“");
	}
	return true;
};

JAS.StateHistory.prototype.get = function(stateUrl) {
	if (!stateUrl) {
		throw new Error("[JAS.StateHistory] Invalid argument: stateUrl must be specified");
	}
	if (!this._stack.length) {
		throw new Error("[JAS.StateHistory] Invalid state: There is no state yet");
	}
	var pointer = this._getPointer(stateUrl);
	if (pointer === -1) {
		throw new Error("[JAS.StateHistory] Argument out of range: There is no state for „" + stateUrl + "“");
	}

	return this._stack[pointer].data;
};

JAS.StateHistory.prototype.moveTo = function(stateUrl) {
	if (!stateUrl) {
		throw new Error("[JAS.StateHistory] Invalid argument: stateUrl must be specified");
	}
	if (!this._stack.length) {
		throw new Error("[JAS.StateHistory] Invalid state: There is no state yet");
	}
	var newPointer = this._getPointer(stateUrl);
	if (newPointer === -1) {
		throw new Error("[JAS.StateHistory] Argument out of range: There is no state for „" + stateUrl + "“");
	}

	this._pointer = newPointer;
};

JAS.StateHistory.prototype.current = function() {
	if (!this._stack.length) {
		throw new Error("[JAS.StateHistory] Invalid state: There is no state yet");
	}

	return this._stack[this._pointer].data;
};

JAS.StateHistory.prototype._getPointer = function(stateUrl) {
	for (var i = this._pointer; i > -1; i--) {
		if (this._stack[i].stateUrlStack.indexOf(stateUrl) > -1) {
			return i;
		}
	}
	for (var i = this._pointer, len = this._stack.length; i < len; i++) {
		if (this._stack[i].stateUrlStack.indexOf(stateUrl) > -1) {
			return i;
		}
	}
	return -1;
};
