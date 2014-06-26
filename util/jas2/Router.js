"use strict";

JAS.Router = JAK.ClassMaker.makeClass({
	NAME: "Router",
	VERSION: "1.0",
	IMPLEMENT: [JAK.ISignals]
});

JAS.Router.route = function(rule, stateId, defaultParams) {
	if (!rule) {
		throw new Error("[JAS.Router] Invalid argument: rule must be specified");
	}
	if (!stateId) {
		throw new Error("[JAS.Router] Invalid argument: stateId must be specified");
	}
	return {
		rule: rule,
		stateId: stateId,
		defaultParams: defaultParams || null
	};
};

JAS.Router.prototype.$constructor = function(locationMiddleman, stateManager, routeList) {
	if (!locationMiddleman) {
		throw new Error("[JAS.Router] Invalid argument: locationMiddleman must be specified");
	}
	if (!stateManager) {
		throw new Error("[JAS.Router] Invalid argument: stateManager must be specified");
	}
	this._location = locationMiddleman;
	this._stateMgr = stateManager;
	this._routeList = routeList;

	this.process(this._location.get());
	this.addListener("history-change", "_handleUrlChange", this._location);
};

JAS.Router.prototype.process = function(url) {
	var match = this._match(url);
	if (match) {
		this._stateMgr.change(match.stateId, match.defaultParams, url, false, true);
	}
};

JAS.Router.prototype._match = function(url) {
	for (var i = 0, len = this._routeList.length; i < len; i++) {
		if (url === this._routeList[i].rule) {
			return this._routeList[i];
		}
	}
	return null;
};

JAS.Router.prototype._handleUrlChange = function(e) {
	this.process(e.data.state);
};
