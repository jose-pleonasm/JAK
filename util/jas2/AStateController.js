"use strict";

/**
 * @author Jose
 * @overview <em>Abstraktní třída</em> pro kontrolery stavu, s nimiž bude pracovat StateManager
 */

/**
 * <em>Abstraktní třída</em> pro kontrolery stavu, s nimiž bude pracovat StateManager
 *
 * @memberof JAS
 * @class AStateController
 */
JAS.AStateController = JAK.ClassMaker.makeClass({
	NAME: "AStateController",
	VERSION: "1.0"
});

JAS.AStateController.prototype.$constructor = function() {
	this._id = "";
};

/**
 * Vratí ID stavu, který obstarává tento kontroler
 *
 * @return {string} ID stavu
 */
JAS.AStateController.prototype.getId = function() {
	return this._id;
};

/**
 * Zda je změna stavu povolena
 *
 * @return {boolean}
 */
JAS.AStateController.prototype.isChangeApproved = function() {
	return true;
};

/**
 * Aktivuje kontroler
 *
 * @param {object} params parametry stavu
 */
JAS.AStateController.prototype.activate = function(params) {
	throw new Error("Not implemented");
};

/**
 * Deaktivuje kontroler
 *
 * @param {JAS.AStateController} newState instance kontroleru, který bude následně aktivován
 */
JAS.AStateController.prototype.deactivate = function(newState) {
	throw new Error("Not implemented");
};
