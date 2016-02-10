/*
 * ajax.js
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
 * $RCSfile: ajax.js,v $
 * $Date: 2008/06/23 11:05:35 $
 * $Revision: 1.1 $
 */

/*
 * For Internet Explorer, find the latest available MSXML progIDs, store them in global variables.
 * This code is executed in the global execution path but it is self-contend and only 4 global variables subsist.
 */
if (document.all && window.ActiveXObject && navigator.userAgent.toLowerCase().indexOf("msie") > -1  && navigator.userAgent.toLowerCase().indexOf("opera") == -1) {
	/*
	 * Global variables.
	 */
	var MSXML_HTTP_ID;
	var MSXML_FT_ID;
	var MSXML_DOM_ID;
	var MSXML_XSL_ID;

	var list = [
		"Msxml2.XMLHTTP.5.0",
		"Msxml2.XMLHTTP.4.0",
		"MSXML2.XMLHTTP.3.0",
		"MSXML2.XMLHTTP",
		"Microsoft.XMLHTTP"
	];
	for (var i = 0; i < list.length; i++) {
		try {
			var doc = new ActiveXObject(list[i]);
			MSXML_HTTP_ID = list[i];
			break;
		} catch(e) {
			// Trap.
		}
	}

	list = [
		"MSXML2.FreeThreadedDOMDocument.5.0",
		"MSXML2.FreeThreadedDOMDocument.4.0",
		"MSXML2.FreeThreadedDOMDocument.3.0",
		"Microsoft.XMLDOM",
		"Msxml2.XMLHTTP",
		"Microsoft.XMLHTTP"
	];
	for (i = 0; i < list.length; i++) {
		try {
			doc = new ActiveXObject(list[i]);
			MSXML_FT_ID = list[i];
			break;
		} catch(e) {
			// Trap.
		}
	}

	list = [
		"Msxml2.DOMDocument.5.0",
		"Msxml2.DOMDocument.4.0",
		"Msxml2.DOMDocument.3.0",
		"MSXML2.DOMDocument",
		"MSXML.DOMDocument",
		"Microsoft.XMLDOM"
	];
	for (i = 0; i < list.length; i++) {
		try {
			doc = new ActiveXObject(list[i]);
			MSXML_DOM_ID = list[i];
			break;
		} catch(e) {
			// Trap.
		}
	}

	list = [
		"Msxml2.XSLTemplate.5.0",
		"Msxml2.XSLTemplate.4.0",
		"MSXML2.XSLTemplate.3.0"
	];

	for (i = 0; i < list.length; i++) {
		try {
			doc = new ActiveXObject(list[i]);
			MSXML_XSL_ID = list[i];
			break;
		} catch(e) {
			// Trap.
		}
	}

	/*
	 * Let these two globals be garbage collected.
	 */
	list = null;
	doc = null;
}

/*
 * DOMParser is used to construct DOM document from XML strings.
 */
if (!window.DOMParser) {
	var DOMParser = function() { };

	DOMParser.prototype.parseFromString = function(xmlstr, content_type) {
		if (window.ActiveXObject && MSXML_DOM_ID) {
			var doc = new ActiveXObject(MSXML_DOM_ID);
			doc.async = false;
			doc.loadXML(xmlstr);
			return doc;
		}
		if (window.XMLHttpRequest) {
			var req = new XMLHttpRequest();
			if (!content_type) {
				content_type = "application/xml";
			}
			req.open("GET", "data:" + content_type + ";charset=utf-8," + encodeURIComponent(xmlstr), false);
			if (req.overrideMimeType) {
				req.overrideMimeType(content_type);
			}
			req.send(null);
			return req.responseXML;
		}
		return null;
	};
}

/*
 * Booleans that the application should check to make sure the browser
 *	supports XML HTTP and has a XSLT processor.
 */
var AJAX_BROWSER_HAS_XMLHTTP = !!(document.getElementById && window.XMLHttpRequest || (MSXML_HTTP_ID && MSXML_DOM_ID));
var AJAX_BROWSER_HAS_XSLT = !!(MSXML_FT_ID && MSXML_XSL_ID);
if (!AJAX_BROWSER_HAS_XSLT && window.XMLHttpRequest && window.XSLTProcessor) {
	var xsltproc = new XSLTProcessor();
	AJAX_BROWSER_HAS_XSLT = !!(xsltproc.importStylesheet && xsltproc.transformToFragment);
	xsltproc = null;
}

/*
 * xmlhttp class
 *	Constructor parameters:
 *		- URL to GET with the XML HTTP request object.
 *		- Function to call back when the GET is completed.
 *		- Optional function to call back if the GET times out.
 *		- Optional timeout value in ms.
 *	Public members:
 *		- init_from_string(xmlstr)
 *		- retrieve_xml()
 *		- get_element_data(tag)
 *		- xmldoc (this is the retrieved XML DOM object)
 *		- textdoc (this is the retrieved XML in plain text)
 */
function ajax_xmlhttp(url, ready_cb, timeout_cb, timeout_ms)
{
	if (!AJAX_BROWSER_HAS_XMLHTTP) {
		return;
	}

	/*
	 * Public members.
	 */
	this.xmlhttp_url = url;

	/*
	 * Private members.
	 */
	var xmlhttp_timeout_ms = timeout_ms || 6000;
	var xmlhttp_timeout_id = 0;
	var xmlhttp_ready_app_cb = ready_cb;
	var xmlhttp_timeout_app_cb = timeout_cb || null;

	/*
	 * This is incorrectly set in inner anonymous functions.
	 */
	var that = this;

	/*
	 * Get an XMLHttpRequest object.
	 */
	var xmlhttpreq;
	if (window.XMLHttpRequest) {
		xmlhttpreq = new XMLHttpRequest();
	} else if (window.ActiveXObject) {
		xmlhttpreq = new ActiveXObject(MSXML_HTTP_ID);
	}

	/*
	 * xmlhttp_onunload()
	 *	Private window.onunload event handler.
	 *	Aborts the XML HTTP request and clears the timeout.
	 */
	var xmlhttp_onunload = function() {
		if (xmlhttp_timeout_id !== 0) {
			window.clearTimeout(xmlhttp_timeout_id);
			xmlhttp_timeout_id = 0;
		}
		if (xmlhttpreq) {
			if (typeof xmlhttpreq.abort == "function") {
				xmlhttpreq.abort();
			}
			delete xmlhttpreq.onreadystatechange;
			xmlhttpreq = null;
		}
	};

	/*
	 * Add a window.onunload event listener.
	 */
	if (window.addEventListener) {
		window.addEventListener('unload', xmlhttp_onunload, false);
	} else if (window.attachEvent) {
		window.attachEvent('onunload', xmlhttp_onunload);
	} else {
		if (typeof window.onunload != "function") {
			window.onload = xmlhttp_onunload;
		} else {
			var oldfunc = window.onunload;
			window.onunload = function() {
				oldfunc();
				xmlhttp_onunload();
			};
		}
	}

	/*
	 * xmlhttp_timeout_cb()
	 *	Private method that will either call the application timeout callback,
	 *	or retry the GET, but less often.
	 */
	var xmlhttp_timeout_cb = function() {
		if (typeof xmlhttpreq.abort == "function") {
			xmlhttpreq.abort();
		}
		if (typeof xmlhttp_timeout_app_cb == "function") {
			/*
			 * Call the application timeout callback.
			 */
			xmlhttp_timeout_app_cb(that);
		} else {
			/*
			 * Retry to reload, but less often.
			 */
			xmlhttp_timeout_ms = 20000;
			that.retrieve_xml();
		}
	};

	/*
	 * onreadystatechange()
	 *	Private method called back for each readyState by the asynchronous GET.
	 *	Once everything is loaded and OK, call back the application function.
	 */

	/*
	 * init_from_string()
	 *	Public method that creates an XML DOM document from a string.
	 */
	this.init_from_string = function(xmlstr) {
		that.xmldoc = (new DOMParser()).parseFromString(xmlstr, "text/xml");
	};

	/*
	 * retrieve_xml()
	 *	Public method that sends an asynchronous GET.
	 */
	this.retrieve_xml = function() {
		xmlhttpreq.open('GET', that.xmlhttp_url, true);
		if (typeof xmlhttpreq.setRequestHeader == "function") {
			xmlhttpreq.setRequestHeader("Cache-Control", "no-cache");
			xmlhttpreq.setRequestHeader("Pragma", "no-cache");
			xmlhttpreq.setRequestHeader('If-Modified-Since', 'Wed, 15 Nov 1995 00:00:00 GMT');
		}
		xmlhttp_timeout_id = window.setTimeout(xmlhttp_timeout_cb, xmlhttp_timeout_ms);
		xmlhttpreq.onreadystatechange = function() {
			/*
			 * We only process the "complete" state.
			 */
			if (xmlhttpreq.readyState == 4) {
				try {
					if (xmlhttpreq.status == 200) {
						window.clearTimeout(xmlhttp_timeout_id);
						xmlhttp_timeout_id = 0;
						if (typeof xmlhttp_ready_app_cb == "function") {
							if (xmlhttpreq.responseXML) {
								that.xmldoc = xmlhttpreq.responseXML;
							} else {
								that.xmldoc = xmlhttpreq;
							}
							that.textdoc = xmlhttpreq.responseText;
							xmlhttp_ready_app_cb(that);
						}
					}
				} catch(e) {
					// Trap for Mozilla (https://bugzilla.mozilla.org/show_bug.cgi?id=238559)
				}
			}
		};
		xmlhttpreq.send(null);
	};

	/*
	 * get_element_data()
	 *	Public method to get a node value in a XML DOM document.
	 *	If an index is given, we get the indexed value from the list of values that share the same tag name
	 */
	this.get_element_data = function(tag, index) {
		if (!that.xmldoc) {
			return null;
		}
		var i = index || 0;
		var elts = that.xmldoc.getElementsByTagName(tag);
		if (!elts || elts.length < i + 1|| !elts[i].hasChildNodes()) {
			return null;
		}
		return elts[i].firstChild.nodeValue;
	};

	/*
	 * is_node_empty()
	 *	Public method to see if a node is empty in a XML DOM document.
	 */
	this.is_node_empty = function(tag, index) {
		if (!that.xmldoc) {
			return null;
		}
		var i = index || 0;
		var elts = that.xmldoc.getElementsByTagName(tag);
		if (!elts || elts.length < i + 1|| !elts[i].hasChildNodes()) {
			return true;
		}
		return false;
	};
}

/*
 * xslproc class
 *	Constructor parameters:
 *		- URL to GET with the XML HTTP request object.
 *		- Function to call back when the GET is completed.
 *		- Optional function to call back if the GET times out.
 *		- Optional timeout value in ms.
 *	Public members:
 *		- retrieve_xsl()
 *		- addparam()
 *		- transform()
 */
function ajax_xslproc(url, ready_cb, timeout_cb, timeout_ms)
{
	if (!AJAX_BROWSER_HAS_XMLHTTP || !AJAX_BROWSER_HAS_XSLT) {
		return;
	}

	/*
	 * Private members.
	 */
	var xslproc_url = url;
	var xslproc_timeout_ms = timeout_ms || 6000;
	var xslproc_timeout_id = 0;
	var xslproc_ready_app_cb = ready_cb;
	var xslproc_timeout_app_cb = timeout_cb || null;

	/*
	 * This is incorrectly set in inner anonymous functions.
	 */
	var that = this;

	/*
	 * xsl_ready_cb()
	 *	Private method called once the XSL is loaded, that creates
	 *	an XSLT processor, and call back the application function.
	 */
	var xsl_ready_cb = function(xslobj) {
		if (window.XMLHttpRequest && window.XSLTProcessor) {
			that.xslproc = new XSLTProcessor();
			that.xslproc.importStylesheet(xslobj.xmldoc);
		} else if (window.ActiveXObject) {
			var xslft = new ActiveXObject(MSXML_FT_ID);
			xslft.loadXML(xslobj.textdoc);
			var xsltemp = new ActiveXObject(MSXML_XSL_ID);
			xsltemp.stylesheet = xslft;
			that.xslproc = xsltemp.createProcessor();
		}
		xslproc_ready_app_cb(that);
	};

	/*
	 * Instantiate a XMLHTTPRequest object.
	 */
	var xmlhttp = new ajax_xmlhttp(xslproc_url, xsl_ready_cb, timeout_cb || null, timeout_ms || null);
	if (!xmlhttp.retrieve_xml) {
		return;
	}

	/*
	 * retrieve_xsl()
	 *	Public method that initiates the XSL retrieval.
	 */
	this.retrieve_xsl = function() {
		xmlhttp.retrieve_xml();
	};

	/*
	 * add_param()
	 *	Public method that sets a value for a parameter to be used in later
	 *	XSL transformations.
	 */
	this.add_param = function(name, value) {
		if (window.XMLHttpRequest && window.XSLTProcessor) {
			that.xslproc.setParameter(null, name, value);
		} else if (window.ActiveXObject) {
			that.xslproc.addParameter(name, value);
		}
	};

	/*
	 * transform()
	 *	Public method that transforms a XML DOM document with the loaded XSL
	 *	into an HTML DOM object, and eventually appends it to a HTML target element.
	 */
	this.transform = function(xmlobj, owner, target) {
		if (window.XMLHttpRequest && window.XSLTProcessor) {
			var fragment = that.xslproc.transformToFragment(xmlobj.xmldoc, owner);
			if (target) {
				target.appendChild(fragment);
				return null;
			}
			return fragment;
		} else if (window.ActiveXObject) {
			that.xslproc.input = xmlobj.xmldoc;
			that.xslproc.transform();
			var output = that.xslproc.output;
			if (target) {
				if (output && output.length > 0) {
					target.innerHTML = output;
					return null;
				}
			}
			var result = owner.createElement('span');
			result.outerHTML = output;
			return result;
		}
	};
}

/*
 * watcher_warnings_check()
 *	Displays any warnings (WEBSERVER_SSI_WATCHER_WARNING) in a container element, using
 *	a specified XSLT, and optionally unhides a container element, if specified.
 */
function watcher_warnings_check(xsl_file, xml_str, container_elt, target_elt)
{
	function warnings_xslt_cb()
	{
		if (typeof target_elt === "string") {
			target_elt = document.getElementById(target_elt);
		}
		warnings_xslproc.transform(warnings_xmlhttp, window.document, target_elt);

		if (container_elt) {
			if (typeof container_elt === "string") {
				container_elt = document.getElementById(container_elt);
			}
			container_elt.style.display = "block";
		}

		/*
		 * Give these back to the garbage collector.
		 */
		warnings_xmlhttp = null;
		warnings_xslproc = null;
	}

	var warnings_xmlhttp = new ajax_xmlhttp();
	if (!warnings_xmlhttp.init_from_string) {
		return;
	}

	warnings_xmlhttp.init_from_string(xml_str);
	if (warnings_xmlhttp.get_element_data("warn") === null) {
		/*
		 * Empty warning, nothing to display.
		 */
		return;
	}

	var warnings_xslproc = new ajax_xslproc(xsl_file, warnings_xslt_cb);
	if (!warnings_xslproc.retrieve_xsl) {
		return;
	}

	warnings_xslproc.retrieve_xsl();
}
