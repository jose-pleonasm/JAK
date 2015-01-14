"use strict";

/**
 * @author Jose
 * @overview Definice API pro kontrolery stavu (s nimiž bude pracovat {@link JAS.StateManager}) + implementace jejich základních metod.
 */

/**
 * <em>Abstraktní třída</em> pro kontrolery stavu.
 *
 * @memberof JAS
 * @class AStateController
 */
JAS.AStateController = JAK.ClassMaker.makeClass({
	NAME: "AStateController",
	VERSION: "1.0"
});

/* @constructs */
JAS.AStateController.prototype.$constructor = function() {
	this._id = "";
};

/**
 * Vrací ID stavu, který obstarává tento kontroler.
 *
 * @return {string} ID stavu.
 */
JAS.AStateController.prototype.getId = function() {
	return this._id;
};

/**
 * Vyjadřuje zda je aktuálně změna stavu povolena.
 * (Může se hodit například při rozpracovaném formuláři.)
 *
 * @return {boolean} Pokud je změna stavu nyní nežádoucí tak false, jinak true.
 */
JAS.AStateController.prototype.isChangeApproved = function() {
	return true;
};

/**
 * Aktivuje kontroler.
 *
 * @abstract
 * @param  {Object} params Parametry stavu.
 */
JAS.AStateController.prototype.activate = function(params) {
	throw new Error("Not implemented");
};

/**
 * Deaktivuje kontroler.
 *
 * @abstract
 * @param  {JAS.AStateController} newStateCtrl Kontroler, který bude následně aktivován.
 */
JAS.AStateController.prototype.deactivate = function(newStateCtrl) {
	throw new Error("Not implemented");
};
