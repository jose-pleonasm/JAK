/*
	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt
	Licenced under the MIT Licence, complete text is available in licence.txt file
*/

/**
 * @overview Vytvari okna a obstarava jejich zakladni funkce: presouvani, zmenu velikosti, minmalizaci, zavreni
 * @version 1.0
 * @author jose
 */

/**
 * @class Winbox
 * @group jak-widgets
 */
JAK.Winbox = JAK.ClassMaker.makeClass({
	NAME: 'JAK.Winbox',
	VERSION: '1.0'
});

/**
 * @param {object}	opts	nastaveni okna
 * @param {object}	[opts.target = body]	odkaz na element, kam okno vlozit
 * @param {string}	[opts.title = '']	titulek okna
 * @param {string}	[opts.id = JAK.idGenerator()]	ID okna
 * @param {string}	[opts.addClass = '']	trida/y, do ktere bude okno nalezet
 * @param {boolean}	[opts.fixed = false]	zda pozicovat fixne
 * @param {object}	[opts.position = { top:'10px', left:'10px' }]	objekt pro nastaveni pozice okna, vlastnosti: top, bottom, left, right
 * @param {number}	[opts.zIndex = 1]	vychozi z-index okna
 * @param {string}	[opts.borderSize = '5px']	defaultni velikost borderu (okraje okna pro resize)
 * @param {string}	[opts.buttonSize = '10px']	defaultni velikost tlacitek (pro zavreni atd.)
 * @param {boolean}	[opts.closeable = true]	zda jde okno zavrit
 * @param {boolean}	[opts.minimizable = true]	zda jde okno minimalizovat
 * @param {boolean}	[opts.movable = true]	zda jde okno presouvat
 * @param {boolean}	[opts.resizable = true]	zda jde menit velikost okna
 */
JAK.Winbox.prototype.$constructor = function(opts) {
	opts = opts || {};
	this.opts = null;
	this._setOpts(opts);

	this.content = JAK.mel('div', { className:'jw-content', id:this.opts.id+'-content' });
	this.flags = {
		open: true,
		manipulative: false
	};
	this._dom = {};
	this._dom.target = null;
	this._ec = [];
	this._data = {};
};

/**
 * Destruktor
 */
JAK.Winbox.prototype.$destructor = function() {
	if (this._dom.target) {
		this._dom.target.removeChild(this._dom.root);
	}

	for (var i = 0; i < this._ec.length; i++) {
		JAK.Events.removeListener(this._ec[i]);
	}
	for (var p in this) { this[p] = null; }
};

/**
 * Nastavi titulek okna
 */
JAK.Winbox.prototype.setTitle = function(s) {
	this.opts.title = s;
	if (this._dom.root) {
		this._dom.title.innerHTML = this.opts.title;
	}
};

/**
 * Zobrazi okno
 */
JAK.Winbox.prototype.show = function() {
	if (!this._dom.root) {
		this._build();
	}
	this._dom.root.style.display = 'block';
};

/**
 * Skryje okno
 */
JAK.Winbox.prototype.hide = function() {
	if (this._dom.root) {
		this._dom.root.style.display = 'none';
	}
};

/**
 * Zrusi okno
 */
JAK.Winbox.prototype.close = function() {
	if (!this.opts.closeable) {
		throw new Error('[JAK.Winbox::close] InvalidStateException: zavreni okna neni povolene, viz. JAK.Winbox.opts.closeable');
	}
	this.$destructor();
};

/**
 * Mini/maxi-malizuje okno
 */
JAK.Winbox.prototype.toggle = function() {
	if (!this.opts.minimizable) {
		throw new Error('[JAK.Winbox::toggle] InvalidStateException: minimalizovani okna neni povolene, viz. JAK.Winbox.opts.minimizable');
	}
	if (!this.flags.manipulative) {
		this._makeManipulative();
	}

	if (this.flags.open) {
		this._data.originMainHeight = JAK.DOM.getStyle(this._dom.root, 'height');
		this._data.originMainMinHeight = JAK.DOM.getStyle(this._dom.root, 'minHeight');
		this.content.style.display = 'none';
		this._dom.root.style.minHeight = '0';
		this._dom.root.style.height = 'auto';
		this.flags.open = false;
	} else {
		this.content.style.display = 'block';
		if (!!this._data.originMainMinHeight) {
			this._dom.root.style.minHeight = this._data.originMainMinHeight;
		}
		this._dom.root.style.height = this._data.originMainHeight;
		this.flags.open = true;
	}
};

/**
 * Vrati pozici okna od leveho horniho rohu
 */
JAK.Winbox.prototype.getPosition = function() {
	var top = JAK.DOM.getStyle(this._dom.root, 'top');
	var left = JAK.DOM.getStyle(this._dom.root, 'left');
	if (top.indexOf('px') > -1 && left.indexOf('px') > -1) {
		return {
			top: parseInt(top),
			left: parseInt(left)
		};
	}

	var position = JAK.DOM.getBoxPosition(this._dom.root);
	var marTop = JAK.DOM.getStyle(this._dom.root, 'marginTop');
	if (marTop.indexOf('px') > -1) {
		position.top = position.top - parseInt(marTop);
	}
	var marLeft = JAK.DOM.getStyle(this._dom.root, 'marginLeft');
	if (marLeft.indexOf('px') > -1) {
		position.left = position.left - parseInt(marLeft);
	}
	if (this.opts.fixed) {
		var scrollPos = JAK.DOM.getScrollPos();
		position.top = position.top - scrollPos.y;
		position.left = position.left - scrollPos.x;
	}
	return position;
};

/**
 * Vrati rozmery okna
 */
JAK.Winbox.prototype.getDimension = function() {
	return {
		width: this._dom.root.offsetWidth,
		height: this._dom.root.offsetHeight
	};
};

/**
 * Nastavi vlastnosti
 */
JAK.Winbox.prototype._setOpts = function(opts) {
	this.opts = {
		target: '',
		title: '',
		id: '',
		addClass: '',
		fixed: false,
		position: { top:'', left:'', bottom:'', right:'' },
		zIndex: 1,
		borderSize: '',
		buttonSize: '',
		closeable: true,
		minimizable: true,
		movable: true,
		resizable: true
	};

	// ID elementu kam vlozit okno
	if (opts.target) {
		this.opts.target = opts.target;
	}

	// titulek okna
	if (opts.title) {
		this.opts.title = opts.title;
	}

	// ID
	if (opts.id) {
		this.opts.id = opts.id;
	} else {
		this.opts.id = JAK.idGenerator();
	}

	// pozice
	if (opts.fixed !== undefined) {
		this.opts.fixed = !!opts.fixed;
	}
	if (opts.position) {
		if (opts.position.top) {
			this.opts.position.top = opts.position.top;
		} else if (opts.position.bottom) {
			this.opts.position.bottom = opts.position.bottom;
		}
		if (opts.position.left) {
			this.opts.position.left = opts.position.left;
		} else if (opts.position.right) {
			this.opts.position.right = opts.position.right;
		}
	} else {
		this.opts.position.top = '10px';
		this.opts.position.left = '10px';
	}

	// z-index
	if (opts.zIndex) {
		var zIndex = parseInt(opts.zIndex);
		if (isNaN(zIndex)) {
			zIndex = 1;
		}
		this.opts.zIndex = zIndex;
	}

	// vlastni trida
	if (opts.addClass) {
		this.opts.addClass = opts.addClass;
	}

	// velikost ovladacich prvku
	if (opts.borderSize) {
		this.opts.borderSize = opts.borderSize;
	} else {
		this.opts.borderSize = '5px';
	}
	if (opts.buttonSize) {
		this.opts.buttonSize = opts.buttonSize;
	} else {
		this.opts.buttonSize = '10px';
	}

	// vlastnosti
	if (opts.closeable !== undefined) {
		this.opts.closeable = !!opts.closeable;
	}
	if (opts.minimizable !== undefined) {
		this.opts.minimizable = !!opts.minimizable;
	}
	if (opts.movable !== undefined) {
		this.opts.movable = !!opts.movable;
	}
	if (opts.resizable !== undefined) {
		this.opts.resizable = !!opts.resizable;
	}
};

/**
 * Sestavi okno
 */
JAK.Winbox.prototype._build = function() {
	this._dom.target = this.opts.target ? JAK.gel(this.opts.target) : window.document.body;

	var rootStyle = {};
	rootStyle.display = 'none';
	rootStyle.overflow = 'hidden';
	rootStyle.position = this.opts.fixed ? 'fixed' : 'absolute';
	rootStyle.zIndex = this.opts.zIndex;
	if (this.opts.position.top) {
		rootStyle.top = this.opts.position.top;
	}
	if (this.opts.position.bottom) {
		rootStyle.bottom = this.opts.position.bottom;
	}
	if (this.opts.position.left) {
		rootStyle.left = this.opts.position.left;
	}
	if (this.opts.position.right) {
		rootStyle.right = this.opts.position.right;
	}
	this._dom.root = JAK.mel('div', { className:'jw-window' + (this.opts.addClass ? ' '+this.opts.addClass : ''), id:this.opts.id }, rootStyle);

	if (this.opts.resizable) {
		this._dom.border = {};
		this._dom.border.tl = JAK.mel('div',
		                              { className:'jw-border jw-corner jw-winBorTopLeft' },
		                              { position:'absolute', top:'0', left:'0', zIndex:this.opts.zIndex+5, width:this.opts.borderSize, height:this.opts.borderSize, cursor:'nw-resize' });
		this._dom.border.l = JAK.mel('div',
		                             { className:'jw-border jw-horizontal jw-winBorLeft' },
		                             { position:'absolute', top:'0', left:'0', zIndex:this.opts.zIndex+4, width:this.opts.borderSize, height:'100%', cursor:'w-resize' });
		this._dom.border.bl = JAK.mel('div',
		                              { className:'jw-border jw-corner jw-winBorBottomLeft' },
		                              { position:'absolute', bottom:'0', left:'0', zIndex:this.opts.zIndex+5, width:this.opts.borderSize, height:this.opts.borderSize, cursor:'sw-resize' });
		this._dom.border.b = JAK.mel('div',
		                             { className:'jw-border jw-vertical jw-winBorBottom' },
		                             { position:'absolute', bottom:'0', left:'0', zIndex:this.opts.zIndex+4, width:'100%', height:this.opts.borderSize, cursor:'s-resize' });
		this._dom.border.br = JAK.mel('div',
		                              { className:'jw-border jw-corner jw-winBorBottomRight' },
		                              { position:'absolute', bottom:'0', right:'0', zIndex:this.opts.zIndex+5, width:this.opts.borderSize, height:this.opts.borderSize, cursor:'se-resize' });
		this._dom.border.r = JAK.mel('div',
		                             { className:'jw-border jw-horizontal jw-winBorRight' },
		                             { position:'absolute', top:'0', right:'0', zIndex:this.opts.zIndex+4, width:this.opts.borderSize, height:'100%', cursor:'e-resize' });
		this._dom.border.tr = JAK.mel('div',
		                              { className:'jw-border jw-corner jw-winBorTopRight' },
		                              { position:'absolute', top:'0', right:'0', zIndex:this.opts.zIndex+5, width:this.opts.borderSize, height:this.opts.borderSize, cursor:'ne-resize' });
		this._dom.border.t = JAK.mel('div',
		                             { className:'jw-border jw-vertical jw-winBorTop' },
		                             { position:'absolute', top:'0', left:'0', zIndex:this.opts.zIndex+4, width:'100%', height:this.opts.borderSize, cursor:'n-resize' });

		this._ec.push(JAK.Events.addListener(this._dom.border.tl, 'mousedown', this, '_resizeStart'));
		this._ec.push(JAK.Events.addListener(this._dom.border.l, 'mousedown', this, '_resizeStart'));
		this._ec.push(JAK.Events.addListener(this._dom.border.bl, 'mousedown', this, '_resizeStart'));
		this._ec.push(JAK.Events.addListener(this._dom.border.b, 'mousedown', this, '_resizeStart'));
		this._ec.push(JAK.Events.addListener(this._dom.border.br, 'mousedown', this, '_resizeStart'));
		this._ec.push(JAK.Events.addListener(this._dom.border.r, 'mousedown', this, '_resizeStart'));
		this._ec.push(JAK.Events.addListener(this._dom.border.tr, 'mousedown', this, '_resizeStart'));
		this._ec.push(JAK.Events.addListener(this._dom.border.t, 'mousedown', this, '_resizeStart'));

		this._dom.root.appendChild(this._dom.border.tl);
		this._dom.root.appendChild(this._dom.border.l);
		this._dom.root.appendChild(this._dom.border.bl);
		this._dom.root.appendChild(this._dom.border.b);
		this._dom.root.appendChild(this._dom.border.br);
		this._dom.root.appendChild(this._dom.border.r);
		this._dom.root.appendChild(this._dom.border.tr);
		this._dom.root.appendChild(this._dom.border.t);
	}

	if (this.opts.minimizable) {
		var offset = this.opts.resizable ? parseInt(this.opts.borderSize) : 0;
		this._dom.toggle = JAK.mel('div',
		                           { className:'jw-button jw-toggle', title:'minimalizovat' },
		                           { position:'absolute', top:(offset + 2)+'px', right:(offset + 2 + parseInt(this.opts.buttonSize) + 2)+'px', zIndex:this.opts.zIndex+3, width:this.opts.buttonSize, height:this.opts.buttonSize, overflow:'hidden', cursor:'pointer' });
		this._dom.toggle.innerHTML = '_';
		this._ec.push(JAK.Events.addListener(this._dom.toggle, 'click', this, 'toggle'));
		this._dom.root.appendChild(this._dom.toggle);
	}

	if (this.opts.closeable) {
		var offset = offset || (this.opts.resizable ? parseInt(this.opts.borderSize) : 0);
		this._dom.close = JAK.mel('div',
		                          { className:'jw-button jw-close', title:'zavřít' },
		                          { position:'absolute', top:(offset + 2)+'px', right:(offset + 2)+'px', zIndex:this.opts.zIndex+3, width:this.opts.buttonSize, height:this.opts.buttonSize, overflow:'hidden', cursor:'pointer' });
		this._dom.close.innerHTML = '×';
		this._ec.push(JAK.Events.addListener(this._dom.close, 'click', this, 'close'));
		this._dom.root.appendChild(this._dom.close);
	}

	this._dom.title = JAK.mel('div', { className:'jw-title' });
	this._dom.title.style.position = 'relative';
	this._dom.title.style.zIndex = this.opts.zIndex+2;
	if (this.opts.title) {
		this._dom.title.innerHTML = this.opts.title;
	}
	if (this.opts.movable) {
		this._ec.push(JAK.Events.addListener(this._dom.title, 'mousedown', this, '_moveStart'));
		this._dom.title.style.cursor = 'move';
	}
	this._dom.root.appendChild(this._dom.title);

	this.content.style.position = 'relative';
	this.content.style.zIndex = this.opts.zIndex+1;
	this._dom.root.appendChild(this.content);

	this._dom.target.appendChild(this._dom.root);
	if (this.opts.resizable) {
		this._dom.root.style.padding = JAK.DOM.getStyle(this._dom.border.t, 'height') + ' ' + JAK.DOM.getStyle(this._dom.border.r, 'width')
		                             + ' ' + JAK.DOM.getStyle(this._dom.border.b, 'height') + ' ' + JAK.DOM.getStyle(this._dom.border.l, 'width');
	}
};

/**
 * Prepozicovani elementu
 * Pro manipulaci musi byt okno pozicovan pres top a left
 */
JAK.Winbox.prototype._makeManipulative = function(currentPosition) {
	var position = currentPosition || this.getPosition();
	this._dom.root.style.top = position.top + 'px';
	this._dom.root.style.left = position.left + 'px';
	this._dom.root.style.right = 'auto';
	this._dom.root.style.bottom = 'auto';
	this.flags.manipulative = true;
};

/**
 * Spusti presouvani
 */
JAK.Winbox.prototype._moveStart = function(e, el) {
	JAK.Events.cancelDef(e);

	var position = this.getPosition();
	if (!this.flags.manipulative) {
		this._makeManipulative(position);
	}
	this._data.mouseOffsetY = e.clientY - position.top;
	this._data.mouseOffsetX = e.clientX - position.left;
	this._data.em = JAK.Events.addListener(window.document, 'mousemove', this, '_move');
	this._data.ems = JAK.Events.addListener(window.document, 'mouseup', this, '_moveStop');
	this._dom.root.style.zIndex = parseInt(this._dom.root.style.zIndex) + 1000;
};

/**
 * Presouva
 */
JAK.Winbox.prototype._move = function(e, el) {
	JAK.Events.cancelDef(e);

	var top = Math.max(e.clientY - this._data.mouseOffsetY, 0);
	var left = Math.max(e.clientX - this._data.mouseOffsetX, 0);
	this._dom.root.style.top = top + 'px';
	this._dom.root.style.left = left + 'px';
	this._dom.root.style.right = 'auto';
	this._dom.root.style.bottom = 'auto';
};

/**
 * Ukonci presouvani
 */
JAK.Winbox.prototype._moveStop = function(e, el) {
	JAK.Events.cancelDef(e);

	JAK.Events.removeListener(this._data.em);
	JAK.Events.removeListener(this._data.ems);
	this._dom.root.style.zIndex = parseInt(this._dom.root.style.zIndex) - 1000;
};

/**
 * Spusti resizovani
 */
JAK.Winbox.prototype._resizeStart = function(e, el) {
	JAK.Events.cancelDef(e);

	if (el == this._dom.border.tl) {
		this._data.action = 'nw';
	} else if (el == this._dom.border.l) {
		this._data.action = 'w';
	} else if (el == this._dom.border.bl) {
		this._data.action = 'sw';
	} else if (el == this._dom.border.b) {
		this._data.action = 's';
	} else if (el == this._dom.border.br) {
		this._data.action = 'se';
	} else if (el == this._dom.border.r) {
		this._data.action = 'e';
	} else if (el == this._dom.border.tr) {
		this._data.action = 'ne';
	} else if (el == this._dom.border.t) {
		this._data.action = 'n';
	} else {
		this._data.action = '';
	}

	this._data.topOffset = this._sumStyleValues(['borderTopWidth', 'marginTop']);
	this._data.leftOffset = this._sumStyleValues(['borderLeftWidth', 'marginLeft']);
	this._data.verPadding = this._sumStyleValues(['paddingTop', 'paddingBottom']);
	this._data.horPadding = this._sumStyleValues(['paddingLeft', 'paddingRight']);
	var position = this.getPosition();
	this._data.posTop = position.top;
	this._data.posLeft = position.left;
	this._data.posBottom = position.top + this._dom.root.clientHeight;
	this._data.posRight = position.left + this._dom.root.clientWidth;
	if (!this.flags.manipulative) {
		this._makeManipulative(position);
	}

	this._data.er = JAK.Events.addListener(window.document, 'mousemove', this, '_resize');
	this._data.ers = JAK.Events.addListener(window.document, 'mouseup', this, '_resizeStop');
	this._dom.root.style.zIndex = parseInt(this._dom.root.style.zIndex) + 1000;
};

/**
 * Resizovani
 */
JAK.Winbox.prototype._resize = function(e, el) {
	JAK.Events.cancelDef(e);

	var rWidth = false,
	    rHeight = false,
	    mTop = false,
	    mLeft = false,
	    act = this._data.action;

	if (act == 'nw' || act == 'w' || act == 'sw' || act == 'se' || act == 'e' || act == 'ne') {
		rWidth = true;
	}
	if (act == 'nw' || act == 'n' || act == 'ne' || act == 'sw' || act == 's' || act == 'se') {
		rHeight = true;
	}
	if (act == 'nw' || act == 'w' || act == 'sw') {
		mLeft = true;
	}
	if (act == 'nw' || act == 'n' || act == 'ne') {
		mTop = true;
	}

	if (rWidth) {
		var clientX = Math.max(e.clientX - this._data.leftOffset, 0);
		if (!this.opts.fixed) {
			clientX = clientX + JAK.DOM.getScrollPos().x;
		}
		if (mLeft) {
			var rightLimit = this._data.posRight - this._data.horPadding;
			var newWidth = rightLimit - clientX;
			if (clientX > rightLimit) {
				newWidth = 0;
			}

			var _minWidth = parseInt(JAK.DOM.getStyle(this._dom.root, 'minWidth'));
			if (!isNaN(_minWidth) && newWidth < _minWidth) {
				newWidth = _minWidth;
				this._dom.root.style.width = newWidth + 'px';
				this._dom.root.style.left = this._data.posLeft + 'px';
				return;
			}

			this._dom.root.style.left = Math.min(clientX, rightLimit) + 'px';
		} else {
			var leftLimit = this._data.posLeft + this._data.horPadding;
			var newWidth = clientX - leftLimit;
			if (clientX < leftLimit) {
				newWidth = 0;
			}
		}
		this._dom.root.style.width = newWidth + 'px';
	}

	if (rHeight) {
		var clientY = Math.max(e.clientY - this._data.topOffset, 0);
		if (!this.opts.fixed) {
			clientY = clientY + JAK.DOM.getScrollPos().y;
		}
		if (mTop) {
			var bottomLimit = this._data.posBottom - this._data.verPadding;
			var newHeight = bottomLimit - clientY;
			if (clientY > bottomLimit) {
				newHeight = 0;
			}

			var _minHeight = parseInt(JAK.DOM.getStyle(this._dom.root, 'minHeight'));
			if (!isNaN(_minHeight) && newHeight < _minHeight) {
				newHeight = _minHeight;
				this._dom.root.style.height = newHeight + 'px';
				this._dom.root.style.top = this._data.posTop + 'px';
				return;
			}

			this._dom.root.style.top = Math.min(clientY, bottomLimit) + 'px';
		} else {
			var topLimit = this._data.posTop + this._data.verPadding;
			var newHeight = clientY - topLimit;
			if (clientY < topLimit) {
				newHeight = 0;
			}
		}
		this._dom.root.style.height = newHeight + 'px';
	}
};

/**
 * Ukonci resizovani
 */
JAK.Winbox.prototype._resizeStop = function(e, el) {
	JAK.Events.cancelDef(e);

	JAK.Events.removeListener(this._data.er);
	JAK.Events.removeListener(this._data.ers);
	this._data.action = '';
	this._dom.root.style.zIndex = parseInt(this._dom.root.style.zIndex) - 1000;
};

/**
 * Secte hodnoty specifikovanych css vlastnosti
 */
JAK.Winbox.prototype._sumStyleValues = function(properties) {
	var total = 0;
	for (var i = 0; i < properties.length; i++) {
		var value = JAK.DOM.getStyle(this._dom.root, properties[i]);
		if (value.indexOf('px') > -1) {
			total = total + parseInt(value);
		}
	}
	return total;
};
/* END of JAK.Winbox */
