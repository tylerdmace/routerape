/*
 * utils.js
 *
 * Copyright © 2007 Ubicom Inc. <www.ubicom.com>.  All rights reserved.
 *
 * This file contains confidential information of Ubicom, Inc. and your use of
 * this file is subject to the Ubicom Software License Agreement distributed with
 * this file. If you are uncertain whether you are an authorized user or to report
 * any unauthorized use, please contact Ubicom, Inc. at +1-408-789-2200.
 * Unauthorized reproduction or distribution of this file is subject to civil and
 * criminal penalties.
 *
 * $RCSfile: utils.js,v $
 * $Date: 2008/06/23 11:05:35 $
 * $Revision: 1.1 $
 */

/*
 * IE5.X has a bug, patch it.
 */
if (document.getElementsByTagName("*").length === 0) {
	document._getElementsByTagName = document.getElementsByTagName;
	document.getElementsByTagName = function(tag) {
		if (tag == "*" ) {
			return document.all;
		} else {
			return document._getElementsByTagName(tag);
		}
	};
}

/*
 * Array:push
 *	Adds an element at the end of an array.
 */
if (typeof Array.prototype.push === "undefined") {
	Array.prototype.push = function(elt) {
		if(elt) {
			this[this.length] = elt;
		}
	};
}

/*
 * Array:pop
 *	Removes the last element of an array.
 */
if (typeof Array.prototype.pop === "undefined") {
	Array.prototype.pop = function() {
		this.length --;
	};
}

/*
 * Array:copy
 *	Returns the copy of an array.
 */
if (typeof Array.prototype.copy === "undefined") {
	Array.prototype.copy = function() {
		var res = [];
		var i = this.length;
		while (i) {
			res[i] = (typeof this[i].copy !== "undefined") ? this[i].copy() : this[i];
			i--;
		}
		return res;
	};
}

/*
 * Array:splice
 *	Inserts, replaces or removes array elements.
 */
if (typeof Array.prototype.splice === "undefined") {
	Array.prototype.splice = function(start, delcnt) {
		var len = this.length;
		var inscnt = Math.max(arguments.length - 2, 0);
		var res = [];
		var i = 0;
		start = start || 0;
		if (start < 0) {
			start += len;
		}
		start = Math.max(Math.min(start, len), 0);
		delcnt = (typeof delcnt == "number") ? delcnt : len;
		delcnt = Math.max(Math.min(delcnt, len - start), 0);
		var delta = inscnt - delcnt;
		var newlen = len + delta;
		while (i < delcnt) {
			var elt = this[start + i];
			if (typeof elt !== "undefined") {
				res[i] = elt;
			}
			i++;
		}
		var shift = len - start - delcnt;
		if (delta < 0) {
			i = start + inscnt;
			while (shift) {
				this[i] = this[i - delta];
				i++;
				shift--;
			}
			this.length = newlen;
		} else if (delta > 0) {
			i = 1;
			while (shift) {
				this[newlen - i] = this[len - i];
				i++;
				shift--;
			}
		}
		for (i = 0; i < inscnt; i++) {
			this[start + i] = arguments[i + 2];
		}
		return res;
	};
}

/*
 * Array:indexOf
 *	Returns the first (least) index of an element within the array equal to
 *	the specified value, or -1 if none is found.
 */
if (typeof Array.prototype.indexOf === "undefined") {
	Array.prototype.indexOf = function(elt) {
		if (typeof elt == "undefined") {
			return -1;
		}
		for (var i = 0, len = this.length; i < len; i++) {
			if (this[i] === elt) {
				return i;
			}
		}
		return -1;
	};
}

/*
 * Array:lastIndexOf
 *	Returns the last (greatest) index of an element within the array equal to
 *	the specified value, or -1 if none is found.
 */
if (typeof Array.prototype.lastIndexOf === "undefined") {
	Array.prototype.lastIndexOf = function(elt) {
		if (typeof elt == "undefined") {
			return -1;
		}
		var len = this.length;
		while (len) {
			if (this[len] === elt) {
				return len;
			}
			len--;
		}
		return -1;
	};
}

/*
 * Array:insert
 *	Inserts an element in an array.
 */
if (typeof Array.prototype.insert === "undefined") {
	Array.prototype.insert = function(index, value) {
		if (index > -1) {
			this.splice(index, 0, value);
		} else {
			this.push(value);
		}
	};
}

/*
 * Array:forEach
 *	Calls a function for each element, without changing the array.
 */
if (typeof Array.prototype.forEach === "undefined") {
	Array.prototype.forEach = function(callback) {
		for (var i = 0, len = this.length; i < len; i++) {
			callback(this[i]);
		}
	};
}

/*
 * Array:walk
 *	Applies a function to each element and return the modified array.
 */
if (typeof Array.prototype.walk === "undefined") {
	Array.prototype.walk = function(callback) {
		var arr = [];
		var len = this.length;
		while (len) {
			arr.push(callback(this[len - 1]));
			len--;
		}
		return arr.reverse();
	};
}

/*
 * String:stripTags
 *	Returns a string stripped of any HTML tags.
 */
if (typeof String.prototype.stripTags === "undefined") {
	String.prototype.stripTags = function() {
		   return this.replace(/<\/?[^>]+>/gi, '');
	};
}

/*
 * String:toArray
 *	Returns an array from a string (each character is an element).
 */
if (typeof String.prototype.toArray === "undefined") {
	String.prototype.toArray = function() {
		return this.split('');
	};
}

/*
 * String:trim
 *	Returns a string trimmed of spaces at its start and at its end.
 */
if (typeof String.prototype.trim === "undefined") {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, '');
	};
}

/*
 * innerText
 *	Implement innerText for browsers that do not have it.
 */
if (typeof HTMLElement !== "undefined" && HTMLElement.prototype) {
	HTMLElement.prototype.__defineGetter__ ("innerText", function() {
		var rng = this.ownerDocument.createRange();
		rng.selectNodeContents(this);
		return rng.toString();
	});

	HTMLElement.prototype.__defineSetter__ ("innerText", function(text) {
		var parsed = document.createTextNode(text);
		this.innerHTML = "";
		this.appendChild(parsed);
	});
}

/*
 * hide_all_ssi_tr()
 *	Strips document.title and form's input buttons of HTML tags.
 */
function hide_all_ssi_tr()
{
	document.title = document.title.stripTags();
	for (var i = 0, flen = document.forms.length; i < flen; i++) {
		var df = document.forms[i];
		for (var j = 0, elen = df.elements.length; j < elen; j++) {
			var dfe = df.elements[j];
			if (dfe.type == "button") {
				dfe.value = dfe.value.stripTags();
			}
		}
	}
}

/*
 * set_form_always_modified()
 *	Sets the custom attribute "modified" to "true.
 */
function set_form_always_modified(form)
{
	if (typeof form == "string") {
		form = document.forms[form];
	}
	if (!form) {
		return;
	}
	form.setAttribute('modified', "true");
}

/*
 * save_form_default_values()
 *	Saves a form's current values to a custom attribute.
 */
function save_form_default_values(form)
{
	if (typeof form == "string") {
		form = document.forms[form];
	}
	for (var i = 0, flen = form.elements.length; i < flen; i++) {
		var obj = form.elements[i];
		if (obj.getAttribute('modified') == 'ignore') {
			continue;
		}
		var name = obj.tagName;
		if (name == 'INPUT') {
			var type = obj.type;
			if ((type == 'text') || (type == 'textarea') || (type == 'password') || (type == 'hidden')) {
				obj.setAttribute('default', obj.value);
				/* Workaround for FF error when calling focus() from an input text element. */
				if (type == 'text') {
					obj.setAttribute('autocomplete', 'off');
				}
			} else if ((type == 'checkbox') || (type == 'radio')) {
				obj.setAttribute('default', obj.checked);
			}
		} else if (name == 'SELECT') {
			var opt = obj.options;
			for (var j = 0, olen = opt.length; j < olen; j++) {
				opt[j].setAttribute('default', opt[j].selected);
			}
		}
	}
	form.setAttribute('saved', "true");
}

/*
 * is_form_modified()
 *	Checks if a form's current values differ from saved values in custom attribute.
 *	Skips elements with attribute 'modified' set to 'ignore'.
 */
function is_form_modified(form)
{
	/*
	 * Mozilla always saves custom attributes as a string.
	 * IE keeps the type of the value.
	 */
	function are_values_equal(val1, val2)
	{
		if (typeof val1 !== "string") {
			val1 = val1.toString();
		}
		if (typeof val2 !== "string") {
			val2 = val2.toString();
		}
		return val1.toLowerCase() === val2.toLowerCase();
	}

	if (typeof form == "string") {
		form = document.forms[form];
	}
	if (form.getAttribute('modified') == "true") {
		return true;
	}
	if (form.getAttribute('saved') != "true") {
		return false;
	}

	for (var i = 0, flen = form.elements.length; i < flen; i++) {
		var obj = form.elements[i];
		if (obj.getAttribute('modified') == 'ignore') {
			continue;
		}
		var name = obj.tagName;
		if (name == 'INPUT') {
			var type = obj.type;
			if (((type == 'text') || (type == 'textarea') || (type == 'password') || (type == 'hidden')) && !are_values_equal(obj.getAttribute('default'), obj.value)) {
				return true;
			} 
			if (((type == 'checkbox') || (type == 'radio')) && !are_values_equal(obj.getAttribute('default'), obj.checked)) {
				return true;
			}
		}
		if (name == 'SELECT') {
			var opt = obj.options;
			for (var j = 0, olen = opt.length; j < olen; j++) {
				/*
				 * populate_selectors() after save_form_default_values() makes null 'default' attr. of the options
				 *  and we need check it if null otherwise javascript crash
				 */
				if (opt[j].getAttribute('default') && !are_values_equal(opt[j].getAttribute('default'), opt[j].selected)) {
					return true;
				}
			}
		}
	}
	return false;
}

/*
 * reset_form()
 *	Resets a form with previously saved default values.
 *	Skips elements with attribute 'modified' set to 'ignore'.
 */
function reset_form(form)
{
	if (typeof form == "string") {
		form = document.forms[form];
	}
	if (!form) {
		return;
	}
	if (form.getAttribute('saved') != "true") {
	return;
	}

	for (var i = 0, flen = form.elements.length; i < flen; i++) {
		var obj = form.elements[i];
		if (obj.getAttribute('modified') == 'ignore') {
			continue;
		}
		var name = obj.tagName;
		var value;
		if (name == 'INPUT') {
			var type = obj.type;
			if ((type == 'text') || (type == 'textarea') || (type == 'password') || (type == 'hidden')) {
				obj.value = obj.getAttribute('default');
			} else if ((type == 'checkbox') || (type == 'radio')) {
				value = obj.getAttribute('default');
				switch (typeof(value)) {
				case 'boolean':
					obj.checked = value;
					break;
				case 'string':
					if (typeof value.toLowerCase == "function") {
						value = value.toLowerCase();
					}
					if (value == "1" || value == "true" || value == "on") {
						obj.checked = true;
					}
					if (value == "0" || value == "false" || value == "off") {
						obj.checked = false;
					}
					break;
				default:
					break;
				}
			}
		} else if (name == 'SELECT') {
			var opt = obj.options;
			for (var j = 0, olen = opt.length; j < olen; j++) {
				value = obj[j].getAttribute('default');
				switch (typeof(value)) {
				case 'boolean':
					obj[j].selected = value;
					break;
				case 'string':
					if (typeof value.toLowerCase == "function") {
						value = value.toLowerCase();
					}
					if (value == "1" || value == "true" || value == "on") {
						obj[j].selected = true;
					}
					if (value == "0" || value == "false" || value == "off") {
						obj[j].selected = false;
					}
					break;
				default:
					break;
				}
			}
		}
	}
}

/*
 * do_block_enable()
 *	Enables or disables all forms elements within the given block element
 */
function do_block_enable(block, enable)
{
	if (typeof block == "string") {
		block = document.getElementById(block);
	}
	for (var c = 0, len = block.childNodes.length; c < len; ++c) {
		var child_element = block.childNodes[c];
		if (child_element.hasChildNodes()) {
			do_block_enable(child_element, enable);
		}
		var tag = child_element.tagName;
		if (tag == "INPUT" || tag == "SELECT" || tag == "BUTTON" || tag == "TEXTAREA") {
			child_element.disabled = !enable;
			if (enable) {
				remove_class(child_element, "disabled");
			} else {
				add_class(child_element, "disabled");
			}
		}
	}
}

/*
 * disable_form_field()
 *	Enables or disables a form element.
 */
function disable_form_field(field, disable)
{
	if (disable !== true && disable !== false) {
		disable = !field.disabled;
	}
	if (disable) {
		add_class(field, "disabled");
	} else {
		remove_class(field, "disabled");
	}
	field.disabled = disable;
}

/*
 * set_radio()
 *	Sets the radio button whose value matches the specified one.
 */
function set_radio(radio_group, value)
{
	if (typeof radio_group == "string") {
		radio_group = document.getElementsByName(radio_group);
	}
	value += "";
	for (var i = 0, len = radio_group.length; i < len; i++) {
		if (radio_group[i].value == value) {
			radio_group[i].checked = true;
			return;
		}
	}
}

/*
 * copy_select_options()
 *	Copies <option>'s from a <select> element to another.
 *	Skips the first option which usually is a descriptive label.
 */
function copy_select_options(from_select, to_select)
{
	if (typeof from_select == "string") {
		from_select = document.getElementById(from_select);
	}
	if (typeof to_select == "string") {
		to_select = document.getElementById(to_select);
	}

	var saved_state = to_select.disabled;
	if (!saved_state) {
		to_select.disabled = true;
	}

	var current_value_selection = null;
	if (to_select.selectedIndex) {
		var current_selected_index = to_select.selectedIndex;
		current_value_selection = to_select.value;
	} else {
		current_value_selection = "-1";
	}

	for (var k = to_select.options.length - 1; k > 0; k--) {
		to_select.options[k] = null;
	}

	var selected_index = 0;
	for (var entry = 1, len = from_select.options.length; entry < len; ++entry) {
		to_select.options.add(new Option(from_select.options[entry].text, from_select.options[entry].value));
		if (from_select.options[entry].value == current_value_selection) {
			selected_index = entry;
		}
	}

	to_select.selectedIndex = selected_index;
	to_select.disabled = saved_state;
}

/*
 * has_class()
 *	Returns true if an HTML element has a given CSS class.
 */
function has_class(elt, class_name) {
	if (typeof elt == "string") {
		elt = document.getElementById(elt);
	}
	if (!elt.className)
	{
		elt.className = "";
		return false;
	}
	return elt.className.match(new RegExp("(^|\\s)\\s*" + class_name + "\\s*(\\s|$)"));
}

/*
 * add_class()
 *	Adds a CSS class to an HTML element.
 */
function add_class(elt, class_name) {
	if (typeof elt == "string") {
		elt = document.getElementById(elt);
	}
	if (!has_class(elt, class_name)) {
		elt.className += (elt.className.length > 0 ? " " : "") + class_name;
	}
}

/*
 * remove_class()
 *	Removes a CSS class from an HTML element.
 */
function remove_class(elt, class_name) {
	if (typeof elt == "string") {
		elt = document.getElementById(elt);
	}
	if (!elt.className) {
		elt.className = "";
		return;
	}
	elt.className = elt.className.replace(new RegExp("(^|\\s)\\s*" + class_name + "\\s*(\\s|$)"), "$1$2");
}

/*
 * get_elt_by_class()
 *	Like getElementsByTagName but only returns an array of elements that
 *	have a given class. Tag can be ommited or *, meaning all HTML tags.
 */
function get_elts_by_class(class_name, tag)
{
	if (typeof tag === "undefined") {
		tag = "*";
	}
	var elts = (tag == "*" && document.all)? document.all : document.getElementsByTagName(tag);
	var res = [];
	for (var i = 0, len = elts.length; i < len; i++) {
		if (has_class(elts[i], class_name)) {
			res.push(elts[i]);
		}
	}
	return res;
}

/*
 * add_event_listener()
 *	Adds a listener callback function to an event.
 */
function add_event_listener(evt, callback)
{
	if (typeof window.addEventListener !== "undefined") {
		window.addEventListener(evt, callback, false);
		return true;
	}
	if (typeof window.attachEvent !== "undefined") {
		window.attachEvent("on" + evt, callback);
		return true;
	}
	return false;
}

/*
 * add_onload_listener()
 *	Adds a listener callback function to the window.load event.
 */
function add_onload_listener(callback)
{
	if (!add_event_listener("load", callback)) {
		if (typeof window.onload !== "function") {
			window.onload = callback;
		} else {
			var evtfct = window.onload;
			window.onload = function() {
				evtfct();
				callback();
			};
		}
	}
}

/*
 * add_onunload_listener()
 *	Adds a listener callback function to the window.unload event.
 */
function add_onunload_listener(callback)
{
	if (!add_event_listener("unload", callback)) {
		if (typeof window.onunload !== "function") {
			window.onunload = callback;
		} else {
			var evtfct = window.onunload;
			window.onunload = function() {
				evtfct();
				callback();
			};
		}
	}
}

/*
 * toggle_elt_visible()
 *	Toggles the visibility property of an HTML element.
 */
function toggle_elt_visible(elt)
{
	if (typeof elt == "string") {
		elt = document.getElementById(elt);
	}
	var vis = elt.style.visibility;
	elt.style.visibility = (vis == "visible" || vis === "") ? "hidden" : "visible";
}

/*
 * toggle_elt_display()
 *	Toggles the display property of an HTML element.
 */
function toggle_elt_display(elt)
{
	if (typeof elt == "string") {
		elt = document.getElementById(elt);
	}
	var dis = elt.style.display;
	elt.style.display = (dis == "block" || dis === "") ? "none" : "";
}

/*
 * do_expanse_collapse()
 *	Expanses (unhides) or collapses (hides) a block and toggles the value of an element.
 */
function do_expanse_collapse(elt, alt_val, toggle_block)
{
	toggle_elt_display(toggle_block)

	if (alt_val === "") {
		return;
	}

	if (typeof elt == "string") {
		elt = document.getElementById(elt);
	}
	if (!elt.getAttribute('alt_value')) {
		var node = document.createAttribute('alt_value');
		node.value = alt_val;
		if (node.value != alt_val) {
			node.nodeValue = alt_val;
		}
		elt.setAttributeNode(node);
	}
	var attr = elt.getAttribute('alt_value');
	elt.setAttribute('alt_value', elt.value);
	elt.value = attr;
}

/*
 * is_number()
 *	Returns true if a value represents a number, else return false.
 */
function is_number(value)
{
	value += "";
	return value.match(/^-?\d*\.?\d+$/) ? true : false;
}

/*
 * is_integer()
 *	Returns true if a value represents an integer, else return false.
 */
function is_integer(value)
{
	var str = value + "";
	if (str.match(/^-?\d+$/)) {
		var num = +value;
		if (num >= -32768 && num <= 32767) {
			return true;
		}
	}
	return false;
}

/*
 * is_uinteger()
 *	Returns true if a value represents an unsigned integer, else return false.
 */
function is_uinteger(value)
{
	var str = value + "";
	if (str.match(/^\d+$/)) {
		var num = +value;
		if (num >= 0 && num <= 65535) {
			return true;
		}
	}
	return false;
}

/*
 * is_blank()
 *	Returns true if value is blank or empty (i.e. "").
 */
function is_blank(value)
{
	value += "";
	return value.match(/^\s*$/) ? true : false;
}

/*
 * is_ascii()
 *	Returns true if value is made of printable ASCII characters (or blank).
 */
function is_ascii(value)
{
	value += "";
	return value.match(/^[\x20-\x7E]*$/) ? true : false;
}

/*
 * is_hex()
 *	Returns true if value is made of HEX characters (or blank).
 */
function is_hex(value)
{
	value += "";
	return value.match(/^[0-9a-fA-F]*$/) ? true : false;
}

/*
 * ascii_to_hex()
 */
function ascii_to_hex(s)
{
	var hex_value = "";
	for (var i = 0; i < s.length; i++) {
		var code = s.charCodeAt(i);
		hex_value = hex_value + code.toString(16);
	}
	return hex_value;
}

/*
 * hex_to_ascii()
 */
function hex_to_ascii(s)
{
	var ascii_value = "";
	for (var i = 0; i < s.length; i = i + 2) {
		var code = parseInt(s.charAt(i), 16)*16 + parseInt(s.charAt(i + 1), 16);
		ascii_value = ascii_value + String.fromCharCode(code);
	}
	return ascii_value;
}

/*
 * ipv4_to_bytearray()
 *	Converts an IPv4 address dotted string to a byte array.
 */
function ipv4_to_bytearray(ipaddr)
{
	ipaddr += "";
	var ip = ipaddr.match(/^\s*(\d{1,3})\s*[.]\s*(\d{1,3})\s*[.]\s*(\d{1,3})\s*[.]\s*(\d{1,3})\s*$/);
	if (!ip) {
		return 0;
	}
	var a = [];
	for (var i = 1, q = 0; i <= 4; i++) {
		q = parseInt(ip[i],10);
		if (q < 0 || q > 255) {
			return 0;
		}
		a[i - 1] = q;
	}
	return a;
}

/*
 * is_ipv4_valid()
 *	Checks is an IP address dotted string is valid.
 */
function is_ipv4_valid(ipaddr)
{
	return ipv4_to_bytearray(ipaddr) !== 0;
}

/*
 * integer_to_ipv4()
 *	Converts an integer (signed or not) to an IPv4 address dotted string.
 */
function integer_to_ipv4(num)
{
	var ip = "";
	for (var i = 3, q = 0, n = 0; i >= 0; i--) {
		n = i * 8;
		q = (num & (0xFF << n)) >> n;
		if (q < 0) {
			q = q & 0xFF;
		}
		ip += q.toString(10);
		if (i > 0) {
			ip += ".";
		}
	}
	return ip;
}

/*
 * ipv4_to_unsigned_integer()
 *	Converts an IPv4 address dotted string to an unsigned integer.
 */
function ipv4_to_unsigned_integer(ipaddr)
{
	var ip = ipv4_to_bytearray(ipaddr);
	if (!ip) {
		return null;
	}
	var uint = 0;
	for (var i = 0; i < 4; i++) {
		uint = uint * 256 + ip[i];
	}
	return uint;
}

/*
 * is_port_valid()
 *	Checks if a port is valid.
 */
function is_port_valid(port)
{
	return (is_number(port) && port >= 0 && port < 65536);
}

/*
 * is_mac_valid()
 *	Checks if a MAC address is in a valid form.
 *	Allow 00:00:00:00:00:00 and FF:FF:FF:FF:FF:FF if optional argument full_range is true.
 */
function is_mac_valid(mac, full_range)
{
	mac += "";
	if (!mac.match(/^([0-9a-fA-F]{2}[:-]?){5}[0-9a-fA-F]{2}$/)) {
		return false;
	}
	mac = mac.replace (/[:-]/g, '');
	if (!full_range && (mac.match(/^0{12}$/) || mac.match(/^[fF]{12}$/))) {
		return false;
	}
	return true;
}

