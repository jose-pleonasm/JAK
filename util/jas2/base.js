"use strict";

/**
 * @author Jose
 * @overview Deklarace jmenného prostoru, obecné funkce.
 */

/**
 * JAS
 * @namespace
 */
var JAS = {
	NAME: "JAS",
	VERSION: "2.0"
};

/**
 * Spustí JAS ve standardní konfiguraci.
 *
 * @memberof JAS
 * @param  {Object[]} controllers Pole vlastních kontrolerů stavu (viz. {@link JAS.AStateController}).
 * @param  {Object[]} routeList Routovací argumenty.
 */
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
