"use strict";

JAS.StateStack = JAK.ClassMaker.makeClass({
	NAME: "StateStack",
	VERSION: "1.0"
});

JAS.StateStack.prototype.$constructor = function() {
	this._stack = [];
};

JAS.StateStack.prototype.push = function(stateId, params, stateUrl, updateLocation) {
	this._stack.push({
		stateId: stateId,
		params: params,
		stateUrlStack: [stateUrl],
		updateLocation: updateLocation
	});
};

JAS.StateStack.prototype.updateCurrentLocation = function(stateUrl) {
	if (!this._stack.length) {
		throw new Error("[JAS.StateStack] Invalid state: There is no state yet");
	}

	this._stack[this._stack.length-1].stateUrlStack.push(stateUrl);
};
