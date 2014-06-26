"use strict";

JAS.StateHistory = JAK.ClassMaker.makeClass({
	NAME: "StateHistory",
	VERSION: "1.0"
});

JAS.StateHistory.prototype.$constructor = function() {
	this._stack = [];
	this._pointer = -1;
};

JAS.StateHistory.prototype.push = function(stateId, params, stateUrl, updateLocation) {
	this._stack.push({
		stateId: stateId,
		params: params,
		stateUrlStack: [stateUrl],
		updateLocation: updateLocation
	});
	this._pointer++;
};

JAS.StateHistory.prototype.updateCurrentLocation = function(stateUrl) {
	if (!this._stack.length) {
		throw new Error("[JAS.StateHistory] Invalid state: There is no state yet");
	}

	this._stack[this._pointer].stateUrlStack.push(stateUrl);
};

JAS.StateHistory.prototype.isEmpty = function() {
	return this._stack.length === 0;
};

JAS.StateHistory.prototype.exists = function(stateUrl) {
	if (!this._stack.length) {
		throw new Error("[JAS.StateHistory] Invalid state: There is no state yet");
	}

	return this._getPointer(stateUrl) > -1;
};

JAS.StateHistory.prototype.current = function() {
	if (!this._stack.length) {
		throw new Error("[JAS.StateHistory] Invalid state: There is no state yet");
	}

	return this._stack[this._pointer];
};

JAS.StateHistory.prototype.get = function(stateUrl) {
	if (!this._stack.length) {
		throw new Error("[JAS.StateHistory] Invalid state: There is no state yet");
	}
	var pointer = this._getPointer(stateUrl);
	if (pointer === -1) {
		throw new Error("[JAS.StateHistory] Argument out of range: There is no state for „" + stateUrl + "“");
	}

	return this._stack[pointer];
};

JAS.StateHistory.prototype.moveTo = function(stateUrl) {
	if (!this._stack.length) {
		throw new Error("[JAS.StateHistory] Invalid state: There is no state yet");
	}
	var newPointer = this._getPointer(stateUrl);
	if (newPointer === -1) {
		throw new Error("[JAS.StateHistory] Argument out of range: There is no state for „" + stateUrl + "“");
	}

	this._pointer = newPointer;
};

JAS.StateHistory.prototype._getPointer = function(stateUrl) {
	for (var i = 0, len = this._stack.length; i < len; i++) {
		if (this._stack[i].stateUrlStack.indexOf(stateUrl) > -1) {
			return i;
		}
	}
	return -1;
};
