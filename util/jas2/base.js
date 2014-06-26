"use strict";

var JAS = {
	NAME: "JAS",
	VERSION: "2.0"
};

JAS.stdRun = function(controllers, routeList) {
	JAK.Events.onDomReady(window, function() {
		JAS.StateManager.getInstance().configure({
			stateHistory: new JAS.StateHistory(),
			locationMiddleman: JAK.History2.getInstance(),
			controllers: controllers
		});
		var router = new JAS.Router(JAK.History2.getInstance(), JAS.StateManager.getInstance(), routeList);
	});
};
