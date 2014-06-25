"use strict";

JAS.StateManager = JAK.ClassMaker.makeSingleton({
	NAME: "StateManager",
	VERSION: "1.0"
});

JAS.StateManager.prototype.$constructor = function() {
	this._controllers = null;
	this._location = null;
	this._stack = null;

	this._activeStateCtrl = null;
};

JAS.StateManager.prototype.configure = function(configuration) {
	if (!configuration.controllers) {
		throw new Error("[JAS.StateManager] Invalid argument: controllers must be specified");
	}
	if (!Array.isArray(configuration.controllers)) {
		throw new Error("[JAS.StateManager] Invalid argument: controllers must be array");
	}
	if (!configuration.locationMiddleman) {
		throw new Error("[JAS.StateManager] Invalid argument: locationMiddleman must be specified");
	}
	if (!configuration.stateStack) {
		throw new Error("[JAS.StateManager] Invalid argument: stateStack must be specified");
	}

	this._controllers = configuration.controllers;
	this._location = configuration.locationMiddleman;
	this._stack = configuration.stateStack;
};

JAS.StateManager.prototype.change = function(stateId, params, stateUrl, updateLocation) {
	if (!this._controllers) {
		throw new Error("[JAS.StateManager] Invalid state: StateManager is not configured");
	}
	if (!stateId) {
		throw new Error("[JAS.StateManager] Invalid argument: stateId must be specified");
	}
	if (!stateUrl) {
		throw new Error("[JAS.StateManager] Invalid argument: stateUrl must be specified");
	}

	var newStateCtrl = null;
	for (var i = 0, len = this._controllers.length; i < len; i++) {
		if (stateId === this._controllers[i].getId()) {
			newStateCtrl = this._controllers[i];
			break;
		}
	}
	if (this._activeStateCtrl && !this._activeStateCtrl.isChangeApproved()) {
		return;
	}
	if (newStateCtrl != this._activeStateCtrl) {
		this._activeStateCtrl.deactivate(newStateCtrl);
	}
	this._activeStateCtrl = null;
	if (newStateCtrl) {
		this._activeStateCtrl = newStateCtrl;
		this._activeStateCtrl.activate(params);
	} else {
		console.warn("There isn't state controller for stateId „" + stateId + "“");
	}
	//TODO: change state

	if (updateLocation) {
		this._location.save(stateUrl);
	}

	this._stack.push(stateId, params, stateUrl, updateLocation);
};

JAS.StateManager.prototype.updateLocation = function(stateUrl) {
	if (!stateUrl) {
		throw new Error("[JAS.StateManager] Invalid argument: stateUrl must be specified");
	}

	this._location.save(stateUrl);

	this._stack.updateCurrentLocation(stateUrl);
};
