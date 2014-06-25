"use strict";

/**
 * @overview <em>Abstraktni trida</em> pro stavy, s nimiz bude pracovat StateManager
 * @author Jose
 */

/**
 * @class Abstraktni trida stavu
 * @group jas
 */
JAS.AStateController = JAK.ClassMaker.makeClass({
	NAME: "AStateController",
	VERSION: "1.0"
});

JAS.AStateController.prototype.$constructor = function() {
	this._id = "";
};

/**
 * Vrati ID stavu, ktery obstarava tento stav
 *
 * @returns {string} ID stavu
 */
JAS.AStateController.prototype.getId = function() {
	return this._id;
};

/**
 * Aktivuje stav
 *
 * @param   {object} params parametry stavu
 */
JAS.AStateController.prototype.activate = function(params) {
	throw new Error("Not implemented");
};

/**
 * Deaktivuje stav
 *
 * Parametrem je predana instance stavu, ktery bude nasledne aktivovan
 *
 * @param   {JAS.AStateController} newState
 */
JAS.AStateController.prototype.deactivate = function(newState) {
	throw new Error("Not implemented");
};
