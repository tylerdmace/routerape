/*
 * Javascript that animates the navigation in pages based on master.dwt
 */

/*
 * Enable or disable specific subnav links, depending on runtime configuration.
 */
function set_subnav_link(enabled,link_id)
{
	var lnk = document.getElementById(link_id);
	if (enabled) {
		remove_class(lnk.parentNode.parentNode, "disabled");
		lnk.onclick = jump_if;
	} else {
		add_class(lnk.parentNode.parentNode, "disabled");
		lnk.onclick = function() {
			return false;
		}
	}
}

/*
 * -----------------------------------------------------------------------------
 * Variables and functions for dynamic navigation
 */
var topnav_current = null;  	// Which topnav are we at.
var subnav_current = null;		// Subnav that corresponds to topnav_current

/*
 * Initialize dynamic navigation
 */
function topnav_init (topnav) 
{
	/*
	 * Determine from current URL what the corresponding topnav item is.
	 */
	var this_uri = get_webserver_ssi_uri();
	var this_path = this_uri.split("/");
	topnav_current = document.getElementById(this_path[1] + "_topnav");
	remove_class(topnav_current.parentNode, "topnavoff");
	add_class(topnav_current.parentNode, "topnavon");
	/*
	 * Show the subnav that corresponds to the current topnav item
	 */
	subnav_current = document.getElementById(topnav_current.rel.split(" ")[1]);
	subnav_current.style.display = "block";
	/*
	 * Set up all the topnav items
	 */
	var top_items = topnav.getElementsByTagName("a");
	for (var i = 0; i < top_items.length; i++) {
		var top_item = top_items[i];
		/*
		 * Make each topnav link the same as its first active subnav link.
		 */
		var subnav_id = top_item.rel.split(" ")[1]; 
		var subnav = document.getElementById(subnav_id);
		var sub_items = subnav.getElementsByTagName("a");
		/*
		 * Look for the first subnav link that doesn't have class "disabled".
		 */
		for (var j = 0; j < sub_items.length; j++) {
			var sub_item = sub_items[j];
			if (!has_class(sub_item.parentNode.parentNode, "disabled")) {
				top_item.href = sub_item.href;
				break;
			}
		}
		/*
		 * If all sub_nav items were disabled, we should disable the top_nav item.
		 * But we know that does not occur in the current navigational system. X
		 */
	}

	var sub_items = subnav_current.getElementsByTagName("a");
	for (var i = 0; i < sub_items.length; i++) {
		//alert ("href: " + sub_item[i].href + "ssi_uri: " + get_webserver_ssi_uri());
		if (sub_items[i].href.search(get_webserver_ssi_uri()) > -1) {
			add_class(sub_items[i].parentNode.parentNode, "here");
		}
	}
	
}

