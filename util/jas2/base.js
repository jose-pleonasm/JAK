"use strict";

var JAS = {
	NAME: "JAS",
	VERSION: "2.0"
};

JAS.stdRun = function(controllers) {
	JAK.Events.onDomReady(window, function() {
		JAS.StateManager.getInstance().configure({
			stateStack: new JAS.StateStack(),
			locationMiddleman: JAK.History2.getInstance(),
			controllers: controllers
		});
	});
};
