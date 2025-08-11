/*
    Summary:
    Provides functionality to make the dashboard interactive by providing
	dynamic generation of page content.

    Copyright:         Robert Bosch GmbH, 2021
	Author:			   Paul Göbel
 */

function updateHome(index){
	// reset colors
	document.getElementById('icon-Start').setAttribute('src','../resources/icon/user-black.svg');
	document.getElementById('icon-Details').setAttribute('src','../resources/icon/document-search-black.svg');
	if (parseInt(sessionStorage.getItem('authorization')) > 0){
		document.getElementById('icon-Progress').setAttribute('src','../resources/icon/reference-black.svg');
		document.getElementById('icon-Changes').setAttribute('src','../resources/icon/document-settings-black.svg');
	}
	document.getElementById('icon-Archive').setAttribute('src','../resources/icon/document-copy-black.svg');

	// reset border
	document.getElementById('icon-Start').setAttribute('style','height:100%; width:100%; border:none');
	document.getElementById('icon-Details').setAttribute('style','height:100%; width:100%; border:none');
	if (parseInt(sessionStorage.getItem('authorization')) > 0){
		document.getElementById('icon-Progress').setAttribute('style','height:100%; width:100%; border:none');
		document.getElementById('icon-Changes').setAttribute('style','height:100%; width:100%; border:none');
	}
	document.getElementById('icon-Archive').setAttribute('style','height:100%; width:100%; border:none');

	// highlight selected
	if (index == 1) {
		document.getElementById('icon-Start').setAttribute('src','../resources/icon/user-green.svg');
		document.getElementById('icon-Start').setAttribute('style', 'height:100%; width:100%; border: 2px dashed #00884a');
	}
	else if (index == 2) {
		document.getElementById('icon-Details').setAttribute('src','../resources/icon/document-search-green.svg');
		document.getElementById('icon-Details').setAttribute('style','height:100%; width:100%; border: 2px dashed #00884a');
	}
	else if (index == 3 && parseInt(sessionStorage.getItem('authorization')) > 0) {
		document.getElementById('icon-Progress').setAttribute('src','../resources/icon/reference-green.svg');
		document.getElementById('icon-Progress').setAttribute('style','height:100%; width:100%; border: 2px dashed #00884a');
	}
	else if (index == 4 && parseInt(sessionStorage.getItem('authorization')) > 0) {
		document.getElementById('icon-Changes').setAttribute('src','../resources/icon/document-settings-green.svg');
		document.getElementById('icon-Changes').setAttribute('style','height:100%; width:100%; border: 2px dashed #00884a');
	}
	else if (index == 5) {
		document.getElementById('icon-Archive').setAttribute('src','../resources/icon/document-copy-green.svg');
		document.getElementById('icon-Archive').setAttribute('style','height:100%; width:100%; border: 2px dashed #00884a');
	}
}

function loadIndex() {
	window.location.href = "index.html";
}

function loadRequest() {
	window.location.href = "request.html";
}

function generateTable(div, startIndex, endIndex, selector, step) {
	// generate tableId and url depending on future content of table
	var tableId;
	var url;

	if (selector === 1) {
		tableId = 'open-table';
		url = window.apiRoute + '/request/open?start=' + startIndex + '&end=' + (endIndex - startIndex);
		var headlist = ['TLR-ID', 'Requesting User', 'Category', 'Opened on', 'Progress', 'Delayed', 'Assigned'];
		var heading = sessionStorage.getItem('userid') + 's Open Requests';
	} else if (selector === 2) {
		tableId = 'closed-table';
		url = window.apiRoute + '/request/closed?start=' + startIndex + '&end=' + (endIndex - startIndex);
		var headlist = ['TLR-ID', 'Requesting User', 'Category', 'Opened on', 'Closed on', 'Assigned'];
		var heading = sessionStorage.getItem('userid') + 's Closed Requests';
	} else if (selector === 3){
		tableId = 'complete-table';
		url = window.apiRoute + '/request/all?start=' + startIndex + '&end=' + (endIndex - startIndex);
		var headlist = ['TLR-ID', 'Requesting User', 'Category', 'Opened on', 'Closed on', 'Progress', 'Delayed', 'Assigned'];
		var heading = 'All Requests of ' + sessionStorage.getItem('userid');
	} else if (selector == 4){
		tableId = 'open-team-table';
		url = window.apiRoute + '/request/team?start=' + startIndex + '&end=' + (endIndex - startIndex);
		var headlist = ['TLR-ID', 'Requesting User', 'Category', 'Opened on', 'Progress', 'Delayed', 'Assigned'];
		var heading = 'Requests relevant for ' + sessionStorage.getItem('userid') + 's Team';
	} else if (selector === 5) {
		tableId = 'unassigned-table';
		url = window.apiRoute + '/request/unassigned?start=' + startIndex + '&end=' + (endIndex - startIndex);
		var headlist = ['TLR-ID', 'Requesting User', 'Category', 'Opened on', 'Assign'];
		var heading = 'Unassigned Requests';
	} else if (selector === 6) {
		tableId = 'teamblock-table';
		url = window.apiRoute + '/request/teamblocked?start=' + startIndex + '&end=' + (endIndex - startIndex);
		var headlist = ['TLR-ID', 'Requesting User', 'Category', 'Opened on', 'Progress', 'Delayed', 'Assigned'];
		var heading = 'Delayed Requests Assigned to ' + sessionStorage.getItem('userid') + 's Team';
	}

	// delete the current table
	div.innerHTML = '';

	appendHeading(div, '4', heading);

	// create new table head
	var table = document.createElement('table');
	table.setAttribute('class', 'm-table');
	table.setAttribute('aria-label', tableId);
	table.setAttribute('id', tableId);

	// create the table head entries
	var heads = '';
	headlist.forEach(head => {heads += '<th class="">' + head + '</th>';})

	table.innerHTML = '<thead><tr>' + heads + '</tr></thead>';
	div.appendChild(table);

	// Grab all available open / closed requests, and append table
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
            // Parse data and create empty table body
			var requests = JSON.parse(xhr.responseText);
			var tablecontent = document.createElement('tbody');
			// transform the received request-data into table rows
			for (i in requests){
				var row = document.createElement('tr');

				// Convert dates in a more readable format
				var opendate = requests[i].opened.substring(0,10);
				if (selector == 2){
					var closedate = requests[i].closed.substring(0,10);
				} else if (selector == 5) {
					var closedate = 'Click to Assign Worker';
				} else if (selector == 3) {
					if (requests[i].closed != null){
						var closedate = requests[i].closed.substring(0,10) + " ";
					} else {
						var closedate = 'Open';
					}
				}

				// Create Icon for blocked entry
				if (selector == 1 || selector == 3 || selector == 4 || selector == 6) {
					// create iconbutton and popver menu for the block-reason
					if (requests[i].block.length != 0){
						var blockedIcon = '<div class="frontend-kit-example_attached-popover" style="margin-bottom:0"><button type="button" class="a-button a-button--tertiary -without-label" style="padding-left: 40%; padding-right: 40%"><i class="a-icon ui-ic-alert-error" title="" style="color:#ed0007;"></i></button><div class="m-popover -top-left -close-button"><div class="a-box -floating"><div class="m-popover__content"><div class="m-popover__head"><button type="button" class="a-button a-button--integrated -without-label" data-frok-action="close" aria-label="close popover"><i class="a-icon a-button__icon ui-ic-close" title="Lorem Ipsum"></i></button></div><div class="m-popover__paragraph">' + (' ' + requests[i].block).slice(1) + '</div></div></div></div></div>';
					} else {
						var blockedIcon = '';
					}
					// create a list of icons showing the progress of the request, not showing any icons if no router is assigned
					if (requests[i].count == 0) {
						var progressicons = '';
					} else {
						var progressicons = '';
						// remove all duplicate values, as DISTINCT doesn't work as wanted in the query
						var icons = [...new Set(requests[i].icons)];
						var iconnames = [...new Set(requests[i].iconnames)];
						for (j in icons) {
							if (requests[i].closedcategories == null) {
								progressicons += '<i class="a-icon boschicon-bosch-ic-' + icons[j] +'" title="' + iconnames[j] + '"></i>';
							}
							else if (requests[i].closedcategories.includes(icons[j])){
								progressicons += '<i class="a-icon boschicon-bosch-ic-' + icons[j] +'" title="' + iconnames[j] + '" style="color:#00884a"></i>';
							} else {
								progressicons += '<i class="a-icon boschicon-bosch-ic-' + icons[j] +'" title="' + iconnames[j] + '"></i>';
							}
						}
					}

				if (selector != 5) {
					if (requests[i].workers == null) {
						requests[i].workers = "";
					}
				}

				}
				if (selector == 1 || selector == 4 || selector == 6) {
					row.innerHTML = '<td>' + requests[i].tlrid + '</td><td>' + requests[i].requester + '</td><td>' + requests[i].category + '</td><td>' + opendate + '</td><td>' + progressicons + '</td><td>' + blockedIcon + '</td><td>' + requests[i].workers + '</td>';
				} else if (selector == 2) {
					row.innerHTML = '<td>' + requests[i].tlrid + '</td><td>' + requests[i].requester + '</td><td>' + requests[i].category + '</td><td>' + opendate + '</td><td>' + closedate + '</td><td>' + requests[i].workers + '</td>';
				} else if (selector == 5) {
					row.innerHTML = '<td>' + requests[i].tlrid + '</td><td>' + requests[i].requester + '</td><td>' + requests[i].category + '</td><td>' + opendate + '</td><td>' + closedate + '</td>';
				} else {
					row.innerHTML = '<td>' + requests[i].tlrid + '</td><td>' + requests[i].requester + '</td><td>' + requests[i].category + '</td><td>' + opendate + '</td><td>' + closedate + '</td><td>' + progressicons + '</td><td>' + blockedIcon + '</td><td>' + requests[i].workers + '</td>';
				}

				// Add Eventlistener to load details on click
				row.children[0].addEventListener('click', function() {
					showDetails(this.parentNode.firstChild.innerText);
				}, false);
				row.children[0].setAttribute('class', 'clickable');

				// Add Eventlistener to load progress on click
				if (selector == 5 ) { var surpressAuthentificationError = true }
				else { var surpressAuthentificationError = false }
				row.children[4].addEventListener('click', function() {
					progressDetails(this.parentNode.firstChild.innerText, surpressAuthentificationError);
				}, false);
				row.children[4].setAttribute('class', 'clickable');

				if (selector == 1 || selector == 4 || selector == 6) { var pos = 5 }
				else if (selector == 3) { var pos = 6 }
				if (requests[i].block.length != 0 && (selector == 1 || selector == 3 || selector == 4 || selector == 6)) {
					row.children[pos].firstChild.firstChild.addEventListener('click', function() {
						this.parentNode.lastChild.setAttribute("style", "max-width: 24rem; display: block; position: absolute");
					}, false);
					row.children[pos].firstChild.lastChild.firstChild.firstChild.firstChild.firstChild.addEventListener('click', function() {
						this.parentNode.parentNode.parentNode.parentNode.setAttribute("style", "max-width: 24rem; display: none; position: absolute");
					}, false);
				}

				tablecontent.appendChild(row);
			}
			// append body to table head
			table.appendChild(tablecontent);

			// generate buttons to scroll back
			var backbutton = document.createElement('button');
			backbutton.setAttribute('type', 'button');
			backbutton.setAttribute('class', 'a-button a-button--secondary -without-icon');
			backbutton.innerHTML = '<div class="a-button__label">Previous</div>';
			backbutton.addEventListener('click', function(){
				generateTable(div, startIndex - step, endIndex - step, selector, step)
			});

			// generate buttons to scroll forward
			var forwardbutton = document.createElement('button');
			forwardbutton.setAttribute('type', 'button');
			forwardbutton.setAttribute('class', 'a-button a-button--secondary -without-icon');
			forwardbutton.innerHTML = '<div class="a-button__label">Next</div>';
			forwardbutton.addEventListener('click', function() {
				generateTable(div, startIndex + step, endIndex + step, selector, step)
			});

			// append buttons if needed
			if (startIndex >= step){
				div.appendChild(backbutton);
			}
			div.appendChild(forwardbutton);
		} else if (xhr.readyState == 4 && xhr.status == 401) {
		} else if (xhr.readyState == 4 && xhr.status == 500) {
			createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');;
		}
    }
    xhr.open("GET", url, true);
    xhr.send(null);
}

function loadStart() {
	// Update to correct icon colors
	updateHome(1);

	// get dashboard div and clear it
	var parentdiv = document.getElementById('dashboard');
	parentdiv.innerHTML = '';

	// Create Headings
	appendHeading(parentdiv, "3", "Welcome to your personal Dashboard");

	// Create div for blocked requests assigned to team
	var teamblockedrequests = document.createElement('div');
	parentdiv.appendChild(teamblockedrequests);

	// Create div for open requests
	var openrequests = document.createElement('div');
	parentdiv.appendChild(openrequests);

	// Create elements for closed requests
	var closedrequests = document.createElement('div');
	parentdiv.appendChild(closedrequests);

	// Create elements for requests from team
	var teamrequests = document.createElement('div');
	parentdiv.appendChild(teamrequests);

	// Create elements for unassigned requests
	var unassignedrequests = document.createElement('div');
	parentdiv.appendChild(unassignedrequests);

	// Get Data and fill table
	if (parseInt(sessionStorage.getItem('authorization')) > 1) {
		generateTable(teamblockedrequests, 0, 10, 6, 10);
		generateTable(teamrequests, 0, 10, 4, 10);
		generateTable(unassignedrequests, 0, 10, 5, 10);
	}
	generateTable(openrequests, 0, 10, 1, 10);
	generateTable(closedrequests, 0, 10, 2, 10);
}

function showDetails(tlrid) {
	// Update to correct icon colors
	updateHome(2);

	// Reset Event listeners
	var clone = document.getElementById('icon-Details');
	clone.replaceWith(clone.cloneNode(true));
	if (parseInt(sessionStorage.getItem('authorization')) > 0) {
		clone = document.getElementById('icon-Progress');
		clone.replaceWith(clone.cloneNode(true));
		clone = document.getElementById('icon-Changes');
		clone.replaceWith(clone.cloneNode(true));
	}
	// Allow Click on Icon to show last selected detail page
	document.getElementById('icon-Details').addEventListener('click', function clicked() {
		showDetails(tlrid);
	}, false);
	document.getElementById('icon-Details').setAttribute('class', 'clickable');

	if (parseInt(sessionStorage.getItem('authorization')) > 0) {
		// Allow Click on Progress to change the request state
		document.getElementById('icon-Progress').removeEventListener('click', progressDetails);
		document.getElementById('icon-Progress').addEventListener('click', function() {progressDetails(tlrid, true);}, false);
		document.getElementById('icon-Progress').setAttribute('class', 'clickable');

		// Allow Click on Changes to change request data
		document.getElementById('icon-Changes').removeEventListener('click', changeDetails);
		document.getElementById('icon-Changes').addEventListener('click', function() {changeDetails(tlrid);}, false);
		document.getElementById('icon-Changes').setAttribute('class', 'clickable');
	}

	// get dashboard div and clear it
	var parentdiv = document.getElementById('dashboard');
	parentdiv.innerHTML = '<p id="hiddentlrid" style="display: none">' + tlrid + '</p>';;

	appendHeading(parentdiv, "4", "Details");

	// Grab all available customers, append Dropdown
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200){
            var details = JSON.parse(xhr.responseText)[0];
			var div = document.createElement('div');

			// Create summary content
			var content = '<h5> General Info </h5>'
			content += "TLR-ID: " + details.tlrid + "<br>";
			content += "Category: " + details.category + "<br>";
			content += "Requesting User: " + details.requester + "<br>";
			content += "Opened on: " + details.opened.substring(0,10) + " " + details.opened.substring(11,18) + "<br>";

			if (details.closed == null) {
				content += "<br>";
			} else {
				content += "<br>";
				content += '<h5> Closing Info </h5>'
				content += "Closed on: " + details.closed.substring(0,10) + " " + details.closed.substring(11,18) + "<br>";
				content += "Closed by: " + details.closinguser + " ( " + details.closinguserid + " ) <br>";
				content += "Results: " + details.closingresults + "<br>";
				content += "Additional Disposition Data: " + details.closingdisposition + "<br>";
				content += "<br>";
			}

			content += '<h5> Request Info </h5>'
			content += "Customer: " + details.customer + "<br>";
			content += "Project: " + details.customerproject + "<br>";
			content += "Request Info: " + details.rinfo + "<br>";
			if (details.category == 'Injector' || details.category == 'Nozzle') {
				content += "Test Type: " + details.testtype + "<br>";
			}
			content += "Test Output and Specifications: " + details.specifications + "<br>";
			content += "Project Type: " + details.rtype + "<br>";
			content += "Request Comment: " + details.rcomment + "<br>";

			content += '<h5> Product Info </h5>'
			if (details.category == 'Injector' || details.category == 'Pump') {
				content += "Injector Generation: " + details.generation + "<br>";
				content += "Product / Component: " + details.product + "<br>";
			} else if (details.category == 'Rail') {
				content += "Rail Generation: " + details.generation + "<br>";
			} else if (details.category == 'Nozzle') {
				content += "Injector: " + details.injector + "<br>";
				content += "Model Year: " + details.model + "<br>";
				content += "Nozzle Type / Component: " + details.nozzle + "<br>";
			} else {
				content += "Product / Component: " + details.product + "<br>";
			}
			content += "Product History: " + details.rhistory + "<br>";

			content += '<h5> Shipping Info </h5>'
			content += "Number of Parts: " + details.pnumber + "<br>";

			// for some reason the timestamp shifts by 2h after storing it in db
			if (details.shipdate != null) {
				content += "Shipping Date: " + details.shipdate.substring(0,10) + "<br>";
			} else {
				content += "Shipping Date: <br>";
			}
			content += "Delivery Method: " + details.deliverymethod + "<br>";
			content += "Tracking Number: " + details.trackingnumber + "<br>";

			content += '<h5> Technical Details </h5>'
			if (details.category == 'Injector') {
				content += "Vehicle / Engine Type: " + details.vetype + "<br>";
				content += "VIN: " + details.vin + "<br>";
				content += "Engine number: " + details.enginenr + "<br>";
				content += "Runtime: " + details.runtime + " " + details.runtimeunit + "<br>";
				content += "Fuel Type: " + details.fuel + "<br>";
			} else if (details.category == 'Rail') {
				content += "System Pressure: " + details.pressure + "<br>";
			} else if (details.category == 'Nozzle') {
				content += "Vehicle / Engine Type: " + details.vetype + "<br>";
				content += "Vehicle ID: " + details.vin + "<br>";
				content += "Engine number: " + details.enginenr + "<br>";
				content += "Runtime: " + details.runtime + " " + details.runtimeunit + "<br>";
				content += "Fuel Type: " + details.fuel + "<br>";
				content += "BIMS: " + details.bims + "<br>";
			} else if (details.category == 'Pump') {
				content += "Vehicle ID: " + details.vin + "<br>";
				content += "Engine number: " + details.enginenr + "<br>";
				content += "System Pressure: " + details.pressure + "<br>";
				content += "Fuel Type: " + details.fuel + "<br>";
			} else {
				content += "Additional Details: " + details.additionalinfo + "<br>";
			}
			content += "Disposition of Parts: " + details.disposition + "<br>";

			div.innerHTML = content;
			parentdiv.appendChild(div);

			if (details.category == 'Injector' ||details.category == 'Nozzle') {
				appendCylinderTable(parentdiv, tlrid);
			} else if (details.category == 'Rail') {
				appendRailComponentTable(parentdiv, tlrid, 'Rail');
			} else if (details.category == 'Pump') {
				appendRailComponentTable(parentdiv, tlrid, 'Pump');
			} else {
				appendDefaultComponentTable(parentdiv, tlrid);
			}
		} else if (xhr.readyState == 4 && (xhr.status == 401 || xhr.status == 403)) {
			createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to read request');
		} else if (xhr.readyState == 4 && xhr.status == 500) {
			createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');
		}
    }
    xhr.open("GET", window.apiRoute + '/request/tlrid?tlrid=' + tlrid, true);
    xhr.send(null);
}

function appendCylinderTable(parentdiv, tlrid){
	// Grab the cylinders corresponding to the tlrid and create a table
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
			// Get Data
			var cylinders = JSON.parse(xhr.responseText);

			// Create table
			var headlist = ['Row', 'Cylinder Nr', 'Bosch PN', 'Customer PN', 'Serial Number', 'Plant Code', 'Manufacturing Date', 'Notes'];
			appendTable(parentdiv, 'cylinder table', 'cylinder table', headlist);

			var table = document.getElementById('cylinder table');

			// create table rows
			for (i in cylinders){
				appendTextRow(table, [cylinders[i].trow, cylinders[i].cylindernr, cylinders[i].bpn, cylinders[i].cpn, cylinders[i].serialnr, cylinders[i].plant, cylinders[i].mdate, cylinders[i].notes]);
			}

			appendBR(parentdiv);
			appendFunctionButton(parentdiv, "Print Details", "printDetails()");
			appendFunctionButton(parentdiv, "Export Return Sheet", "exportReturnSheet()");
		}
    }
    xhr.open("GET", window.apiRoute + '/request/cylinders/tlrid?tlrid=' + tlrid, true);
    xhr.send(null);
}

function appendRailComponentTable(parentdiv, tlrid, type) {
	// Grab the rail components corresponding to the tlrid and create a table
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
			// Get Data
			var components = JSON.parse(xhr.responseText);

			// Create table
			var headlist = ['Row', 'Component', 'Generation', 'Part Number', 'Serial Number', 'Manufacturing Date', 'Odometer', 'Arrival Date', 'MAP Order Entry Date', 'Target Final Report Date', 'Notes'];
			appendTable(parentdiv, 'component table', 'component table', headlist);

			var table = document.getElementById('component table');

			// create table rows
			for (i in components){
				// Check for dates being null
				if (components[i].manufacturingdate == null) {
					var manufacturingdate = "";
				} else {
					var manufacturingdate = components[i].manufacturingdate.substring(0,10)
				}

				if (components[i].arrivaldate == null) {
					var arrivaldate = "";
				} else {
					var arrivaldate = components[i].arrivaldate.substring(0,10)
				}

				if (components[i].moedate == null) {
					var moedate = "";
				} else {
					var moedate = components[i].moedate.substring(0,10)
				}

				if (components[i].tfrdate == null) {
					var tfrdate = "";
				} else {
					var tfrdate = components[i].tfrdate.substring(0,10)
				}
				appendTextRow(table, [components[i].trow, components[i].component, components[i].generation, components[i].partnumber, components[i].serialnumber, manufacturingdate, components[i].odometervalue + " " + components[i].odometerunit, arrivaldate, moedate, tfrdate, components[i].notes]);
			}

			appendBR(parentdiv);
			appendFunctionButton(parentdiv, "Print Details", "printDetails()");
			if (type == 'Rail') {
				appendFunctionButton(parentdiv, "Export Return Sheet", "exportReturnSheet()");
				appendFunctionButton(parentdiv, "Export Excel Sheet", "exportRailExcelSheet()");
			}
		}
    }
    xhr.open("GET", window.apiRoute + '/request/railcomponents/tlrid?tlrid=' + tlrid, true);
    xhr.send(null);
}

function appendDefaultComponentTable(parentdiv, tlrid){
	// Grab the components corresponding to the tlrid and create a table
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
	   if (xhr.readyState == 4 && xhr.status == 200){
			// Get Data
			var components = JSON.parse(xhr.responseText);

			// Create table
			var headlist = ['Row', 'Component Nr', 'Bosch PN', 'Customer PN', 'Serial Number', 'Plant Code', 'Manufacturing Date', 'Notes'];
			appendTable(parentdiv, 'component table', 'component table', headlist);

			var table = document.getElementById('component table');

			// create table rows
			for (i in components){
				appendTextRow(table, [components[i].trow, components[i].componentnr, components[i].bpn, components[i].cpn, components[i].serialnr, components[i].plant, components[i].mdate, components[i].notes]);
			}

			appendBR(parentdiv);
			appendFunctionButton(parentdiv, "Print Details", "printDetails()");
			appendFunctionButton(parentdiv, "Export Return Sheet", "exportReturnSheet()");
		}
    }
    xhr.open("GET", window.apiRoute + '/request/defaultcomponents/tlrid?tlrid=' + tlrid, true);
    xhr.send(null);
}

function printDetails() {
	// Occult Imports and Configurations
	window.html2canvas = html2canvas;

	// Create an empty pdf-file
	const doc = new jspdf.jsPDF({
	  orientation: "portrait",
	  unit: "pt",
	  format: "letter"
	});

	// set the Font (I don't know if it really works, but the font seems to be embedded in the pdf)
	doc.setFont("BoschSans-Regular", "normal");

	// hide the button to not print it
	document.getElementById('Print Details').style.display = 'none';
	if (document.getElementById('Export Return Sheet') != null && document.getElementById('Export Return Sheet') != undefined) {
		document.getElementById('Export Return Sheet').style.display = 'none';
	}
	if (document.getElementById('Export Excel Sheet') != null && document.getElementById('Export Excel Sheet') != undefined) {
		document.getElementById('Export Excel Sheet').style.display = 'none';
	}

	doc.html(document.getElementById('dashboard'), {
		callback: function (doc) {
			doc.save("Details.pdf");
			// make the button visible again
			document.getElementById('Print Details').style.display = 'inline-flex';
			if (document.getElementById('Export Return Sheet') != null && document.getElementById('Export Return Sheet') != undefined) {
				document.getElementById('Export Return Sheet').style.display = 'inline-flex';
			}
			if (document.getElementById('Export Excel Sheet') != null && document.getElementById('Export Excel Sheet') != undefined) {
				document.getElementById('Export Excel Sheet').style.display = 'inline-flex';
			}
		},
		x: 25,
		y: 0,
		pagesplit: true,
		html2canvas: {
			scale: 0.5,
			windowWidth: doc.internal.pageSize.getWidth() + 450,
		}
	});
}

function exportReturnSheet() {
	// Get the TLR-ID and request the excel sheet
	var tlrid = document.getElementById('hiddentlrid').innerText;
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
       	if (this.readyState != 4) return;
		if (this.status == 200) {
			var reader = new FileReader();
			var blob = new Blob([xhr.response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
			reader.readAsDataURL(blob);

			const link = document.createElement('a');
			// Browsers that support HTML5 download attribute
			if (link.download !== undefined) {
			  const url = URL.createObjectURL(blob);
			  link.setAttribute('href', url);
			  link.setAttribute('download', 'updatedreturnsheet.xlsx');
			  link.style.visibility = 'hidden';
			  document.body.appendChild(link);
			  link.click();
			  document.body.removeChild(link);
			}
		}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
		if ((this.status == 401 || this.status == 403) && !surpressAuthentificationError) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to access progress summary');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	}

    xhr.open("GET", window.apiRoute + '/request/returnsheet?tlrid=' + tlrid, true);
	xhr.responseType = "arraybuffer";
    xhr.send(null);
}

function exportRailExcelSheet() {
	// Get the TLR-ID and request the excel sheet
	var tlrid = document.getElementById('hiddentlrid').innerText;
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
       	if (this.readyState != 4) return;
		if (this.status == 200) {
			var reader = new FileReader();
			var blob = new Blob([xhr.response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
			reader.readAsDataURL(blob);

			const link = document.createElement('a');
			// Browsers that support HTML5 download attribute
			if (link.download !== undefined) {
			  const url = URL.createObjectURL(blob);
			  link.setAttribute('href', url);
			  link.setAttribute('download', 'railexport.xlsx');
			  link.style.visibility = 'hidden';
			  document.body.appendChild(link);
			  link.click();
			  document.body.removeChild(link);
			}
		}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
		if ((this.status == 401 || this.status == 403) && !surpressAuthentificationError) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to access progress summary');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	}

    xhr.open("GET", window.apiRoute + '/request/railexport?tlrid=' + tlrid, true);
	xhr.responseType = "arraybuffer";
    xhr.send(null);
}

function progressDetails(tlrid, surpressAuthentificationError) {
	// Update to correct icon colors
	updateHome(3);

	// Reset Event listeners
	var clone = document.getElementById('icon-Details');
	clone.replaceWith(clone.cloneNode(true));
	if (parseInt(sessionStorage.getItem('authorization')) > 0) {
		clone = document.getElementById('icon-Progress');
		clone.replaceWith(clone.cloneNode(true));
		clone = document.getElementById('icon-Changes');
		clone.replaceWith(clone.cloneNode(true));
	}
	// Allow Click on Icon to show last selected detail page
	document.getElementById('icon-Details').addEventListener('click', function clicked() {
		showDetails(tlrid);
	}, false);
	document.getElementById('icon-Details').setAttribute('class', 'clickable');

	if (parseInt(sessionStorage.getItem('authorization')) > 0) {
		// Allow Click on Progress to change the request state
		document.getElementById('icon-Progress').removeEventListener('click', progressDetails);
		document.getElementById('icon-Progress').addEventListener('click', function() {progressDetails(tlrid, surpressAuthentificationError);}, false);
		document.getElementById('icon-Progress').setAttribute('class', 'clickable');

		// Allow Click on Changes to change request data
		document.getElementById('icon-Changes').removeEventListener('click', changeDetails);
		document.getElementById('icon-Changes').addEventListener('click', function() {changeDetails(tlrid);}, false);
		document.getElementById('icon-Changes').setAttribute('class', 'clickable');
	}

	// get dashboard div and clear it
	var parentdiv = document.getElementById('dashboard');
	parentdiv.innerHTML = '';
	parentdiv.innerHTML = '<p id="hiddentlrid" style="display: none">' + tlrid + '</p>';
	appendHeading(parentdiv, '4', 'Progress');

	var summaryDiv = document.createElement('div');
	// show assigned workers, progress, blocked, days open(?)
	appendHeading(summaryDiv, '5', 'Summary');
	parentdiv.appendChild(summaryDiv);

	// Grab and display the progress summary
	var xhrSummary = new XMLHttpRequest();
	xhrSummary.onreadystatechange = function() {
       	if (this.readyState != 4) return;
		if (this.status == 200) {
			var summary = JSON.parse(xhrSummary.responseText);
			// Create icon for block depending on status of the request
			if (summary[0].block == "") {
				var blockmarker = '<i class="a-icon ui-ic-alert-success" title="No Block" style="color:#00884a;"></i>';
			} else {
				var blockmarker = '<i class="a-icon ui-ic-alert-error" title="Progress blocked" style="color:#ed0007;"></i>';
			}
			// Display iformation provided by summary
			summaryDiv.innerHTML += 'TLR-ID: ' + tlrid + ', Category: ' + summary[0].category + '<br> Requester: ' + summary[0].requester  + ', Requested on: ' + summary[0].opened.substring(0,10) + '<br> Progress: ' + summary[0].sum + ' / ' + summary[0].count + ', Delay: ' + blockmarker + '<br>Assigned Workers: ' + summary[0].workers;
		}
		if ((this.status == 401 || this.status == 403) && !surpressAuthentificationError) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to access progress summary');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	}
	xhrSummary.open("GET", window.apiRoute + '/request/progress/summary?tlrid=' + tlrid, true);
	xhrSummary.send(null);

	if (parseInt(sessionStorage.getItem('authorization')) > 1) {
		var assignDiv = document.createElement('div');
		appendHeading(assignDiv, '5', 'Assign and Unassign Team Members');
		appendDropdown(assignDiv, "availableTeam", "Available Team Members");
		appendFunctionButtonSecondary(assignDiv, "Assign", "assignTeamMember()");
		appendDropdown(assignDiv, "assignedTeam", "Assigned Team Members");
		appendFunctionButtonSecondary(assignDiv, "Unassign", "unassignTeamMember()");
		parentdiv.appendChild(assignDiv);

		// Grab all accounts that are assinged to the user but not the current request and append to Dropdown
		var xhrAvailable = new XMLHttpRequest();
		xhrAvailable.onreadystatechange = function() {
        	if (this.readyState != 4) return;
			if (this.status == 200) {
				var availableUsers = JSON.parse(xhrAvailable.responseText);
				for (i in availableUsers){
					expandDropdownSeparate(document.getElementById('availableTeam'), availableUsers[i].userid, availableUsers[i].name);
				}
			}
			if ((this.status == 401 || this.status == 403) && !surpressAuthentificationError) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to access assigned users');}
			if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
		}
		xhrAvailable.open("GET", window.apiRoute + '/request/available?tlrid=' + tlrid, true);
		xhrAvailable.send(null);

		// Grab all assigned Accounts and append to Dropdown
		var xhrAssigned = new XMLHttpRequest();
		xhrAssigned.onreadystatechange = function() {
        	if (this.readyState != 4) return;
			if (this.status == 200) {
				var assignedUsers = JSON.parse(xhrAssigned.responseText);
				for (i in assignedUsers){
					expandDropdownSeparate(document.getElementById('assignedTeam'), assignedUsers[i].userid, assignedUsers[i].name);
				}
			}
			if ((this.status == 401 || this.status == 403) && !surpressAuthentificationError) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to access assigned users');}
			if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
		}
		xhrAssigned.open("GET", window.apiRoute + '/request/assigned?tlrid=' + tlrid, true);
		xhrAssigned.send(null);
	}

	// Create Table showing current progress
	var progressDiv = document.createElement('div');
	progressDiv.setAttribute('id', 'progressDiv');
	appendHeading(progressDiv, '5', 'Request Router');
	parentdiv.appendChild(progressDiv);
	// Grab the progress corresponding to the tlrid and create a table
	var xhrProgress = new XMLHttpRequest();
    xhrProgress.onreadystatechange = function() {
        if (xhrProgress.readyState == 4 && xhrProgress.status == 200){
			// Get Data
			var steps = JSON.parse(xhrProgress.responseText);

			// Create table
			var headlist = ['Group', 'Step', 'Description', 'Finished', 'Finished by', 'Finished on', 'Comment'];
			appendTable(progressDiv, 'progress table', 'progress table', headlist);

			var table = document.getElementById('progress table');

			// Create table rows
			for (i in steps){
				var finished = steps[i].finished;
				if (steps[i].fdate != null) {
					appendCustomRow(table, [steps[i].category, steps[i].step, steps[i].description, steps[i].finished, steps[i].name, steps[i].fdate.substring(0,10), steps[i].fcomment], ["t", "t", "t", "cm", "t", "t", "t"]);
				} else {
					appendCustomRow(table, [steps[i].category, steps[i].step, steps[i].description, steps[i].finished, "", "", steps[i].fcomment], ["t", "t", "t", "cm", "t", "t", "t"]);
				}
				// Make the "Finished" cells clickable, calling a function to mark the entry as finished
				if (finished == false){
					var cell = table.lastChild.lastChild.children[3];
					cell.addEventListener('click', function() {
						finishStep(tlrid, this.parentElement.children[1].innerText);
					}, false);
					cell.setAttribute('class', 'clickable');
				}

			}

			appendBR(progressDiv);
			appendFunctionButtonSecondary(progressDiv, "Create New Progress Router", "createRouter()");
			appendFunctionButtonSecondary(progressDiv, "Manage Progress Router", "modifyRouter()");
		}
		else if (xhrProgress.readyState == 4 && (xhrProgress.status == 403 || xhrProgress.status == 401) && !surpressAuthentificationError){createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to access this router');}
		else if (xhrProgress.readyState == 4 && xhrProgress.status == 500){createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhrProgress.open("GET", window.apiRoute + '/request/progress/router?tlrid=' + tlrid, true);
    xhrProgress.send(null);

	// Create Inputfield for setting a request as blocked
	var blockDiv = document.createElement('div');
	appendHeading(blockDiv, '5', 'Request Delays');
	parentdiv.appendChild(blockDiv);

	var xhrBlock = new XMLHttpRequest();
    xhrBlock.onreadystatechange = function() {
        if (xhrBlock.readyState != 4) { return }
		if (xhrBlock.status == 200){
            var blocktext = JSON.parse(xhrBlock.responseText);
			appendTextAreaPrefilled(blockDiv, "blockstatus", "Reason for Delay", "What is currently preventing further work on this request", blocktext[0].block);
			appendFunctionButtonSecondary(blockDiv, "Insert / Update Delay Message", "blockRequest()");
			appendFunctionButtonSecondary(blockDiv, "Remove Delay", "unblockRequest()");
		}
		if ((xhrBlock.status == 401 || xhrBlock.status == 403) && !surpressAuthentificationError) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to access the details regarding a block of this request');}
		if (xhrBlock.status == 500){createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhrBlock.open("GET", window.apiRoute + '/request/progress/blockstatus?tlrid='+tlrid, true);
    xhrBlock.send(null);

	// Create inputfields for closing a request
	var closeDiv = document.createElement('div');
	appendHeading(closeDiv, '5', 'Close  Request');
	appendTextArea(closeDiv, "closeResult", "Results", "Describe the results of the investigation");
	appendTextArea(closeDiv, "closeDispo", "Disposition", "Add potential additional information regarding the disposition of relevant parts");
	appendFunctionButtonSecondary(closeDiv, "Close Request", "closeRequest()");
	parentdiv.appendChild(closeDiv);

	var xhrClose = new XMLHttpRequest();
    xhrClose.onreadystatechange = function() {
        if (xhrClose.readyState != 4) { return }
		if (xhrClose.status == 200){
            var closingdata = JSON.parse(xhrClose.responseText);
			if (closingdata.length > 0) {
				document.getElementById('closeResult').value = closingdata[0].results;
				document.getElementById('closeDispo').value = closingdata[0].disposition;

				document.getElementById('Close Request').setAttribute('disabled', '');
				document.getElementById('Close Request').firstChild.innerHTML = 'Closed by ' + closingdata[0].name;
				document.getElementById('closeResult').setAttribute('disabled', '');
				document.getElementById('closeDispo').setAttribute('disabled', '');

				appendFunctionButtonSecondary(closeDiv, "Reopen Request", "reopenRequest()");
			}
		}
		if ((xhrClose.status == 401 || xhrClose.status == 403) && !surpressAuthentificationError) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to access the details regarding the closing status of this request');}
		if (xhrClose.status == 500){createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhrClose.open("GET", window.apiRoute + '/request/progress/closed?tlrid='+tlrid, true);
    xhrClose.send(null);
}

function finishStep(tlrid, step) {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 204) {progressDetails(tlrid, false);}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
		if (this.status == 401 || this.status == 403) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to mark steps of this router as completed');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("PUT", window.apiRoute + '/request/progress/step', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		tlrid: tlrid,
		step: step
	}));
}

function createRouter(){
	var progressDiv = document.getElementById('progressDiv');
	progressDiv.innerHTML = '<h5>Create new Router</h5>';
	appendTable(progressDiv, 'progress table', 'new progress table', ['Group', 'Step', 'Description', 'Comment']);

	appendFunctionButtonSecondary(progressDiv, 'Add Row to Table', 'addNewRouterTableRowHelper()');
	appendFunctionButtonSecondary(progressDiv, 'Remove last Row', 'reduceNewRouterTableRowHelper()');
	appendFunctionButtonSecondary(progressDiv, 'Save Router', 'submitNewRouter()');
	appendBR(progressDiv);
	appendHeading(progressDiv, '5', 'Copy Existing Router');
	appendText(progressDiv, 'copytlrid', 'TLR-ID of Request');
	appendFunctionButton(progressDiv, 'Copy Router', 'copyRouterTable()');

	appendHeading(progressDiv, '5', 'Copy Global Router Template');
	appendDropdown(progressDiv, 'templateglobal', 'Name of Template');
	appendFunctionButton(progressDiv, 'Copy Template', 'copyTemplateGlobal()');

	appendHeading(progressDiv, '5', 'Copy Personal Router Template');
	appendDropdown(progressDiv, 'templatepersonal', 'Name of Template');
	appendFunctionButton(progressDiv, 'Copy Template', 'copyTemplatePersonal()');

	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
            var categories = JSON.parse(xhr.responseText);
			var names = [];
			for (i in categories){
				names.push(categories[i].category);
			}
			var table = document.getElementById('progress table');
			appendCustomTableInputRowPrefilled(table, ["", (table.lastChild.childElementCount + 1), "", ""], ['dd', 't', 't', 't'], null, ['Group'], [names]);
		}
    }
    xhr.open("GET", window.apiRoute + '/data/progress/categories', true);
    xhr.send(null);

	var xhrGlobalTemplate = new XMLHttpRequest();
    xhrGlobalTemplate.onreadystatechange = function() {
        if (xhrGlobalTemplate.readyState == 4 && xhrGlobalTemplate.status == 200){
            var gtemplates = JSON.parse(xhrGlobalTemplate.responseText);
			for (i in gtemplates) {
				expandDropdown(document.getElementById('templateglobal'), gtemplates[i].templatename);
			}
		}
    }
    xhrGlobalTemplate.open("GET", window.apiRoute + '/request/progress/templates?templateowner=', true);
    xhrGlobalTemplate.send(null);

	var xhrPersonalTemplate = new XMLHttpRequest();
    xhrPersonalTemplate.onreadystatechange = function() {
        if (xhrPersonalTemplate.readyState == 4 && xhrPersonalTemplate.status == 200){
            var ptemplates = JSON.parse(xhrPersonalTemplate.responseText);
			for (i in ptemplates) {
				expandDropdown(document.getElementById('templatepersonal'), ptemplates[i].templatename);
			}
		}
    }
    xhrPersonalTemplate.open("GET", window.apiRoute + '/request/progress/templates?templateowner=' + sessionStorage.getItem('userid'), true);
    xhrPersonalTemplate.send(null);
}

function copyRouterTable() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Router successfully copied'); progressDetails(document.getElementById('hiddentlrid').innerText, false);}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: No request to copy router from found');}
		if (this.status == 401 || this.status == 403) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to create a new router for this request');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/request/progress/copy', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		owntlrid: document.getElementById('hiddentlrid').innerText,
		copytlrid: document.getElementById('copytlrid').value,
	}));
}

function copyTemplateGlobal() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Template successfully copied'); progressDetails(document.getElementById('hiddentlrid').innerText, false);}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: No template to copy router from found');}
		if (this.status == 401 || this.status == 403) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to create a new router for this request');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/request/progress/copytemplate', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		owntlrid: document.getElementById('hiddentlrid').innerText,
		templateowner: "",
		templatename: document.getElementById('templateglobal').value,
	}));
}

function copyTemplatePersonal() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Template successfully copied'); progressDetails(document.getElementById('hiddentlrid').innerText, false);}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: No template to copy router from found');}
		if (this.status == 401 || this.status == 403) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to create a new router for this request');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/request/progress/copytemplate', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		owntlrid: document.getElementById('hiddentlrid').innerText,
		templateowner: sessionStorage.getItem('userid'),
		templatename: document.getElementById('templatepersonal').value,
	}));
}

// Helper to add row to the router input table.
function addNewRouterTableRowHelper(){
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
            var categories = JSON.parse(xhr.responseText);
			var names = [];
			for (i in categories){
				names.push(categories[i].category);
			}
			var table = document.getElementById('progress table');
			appendCustomTableInputRowPrefilled(table, ["", (table.lastChild.childElementCount + 1), "", ""], ['dd', 't', 't', 't'], null, ['Group'], [names]);
		}
    }
    xhr.open("GET", window.apiRoute + '/data/progress/categories', true);
    xhr.send(null);
}

// Helper to remove row from the router input table.
function reduceNewRouterTableRowHelper() {
	var table = document.getElementById('progress table');
	var body = table.childNodes[1];
	body.removeChild(body.lastChild);
}

function submitNewRouter() {
	//grab data from table
	var table = document.getElementById('progress table');
	var tableRowLength = table.rows.length;
	var progressJSON = "["
	// iterate over all rows
	if (tableRowLength > 1){
		for (i = 1; i < tableRowLength; i++) {
			var rowCells = table.rows.item(i).cells;
			var rowCellLength = rowCells.length;
			// iterate over the cells in a row
			progressJSON += "["
			for (j = 0; j < rowCellLength; j++) {
				if (j == 0) {
					progressJSON += '"' + rowCells.item(j).firstChild.lastChild.value + '", ' ;
				} else {
					progressJSON += '"' + rowCells.item(j).firstChild.firstChild.value + '", ' ;
				}
			}
			// remove last , and whitespace
			progressJSON = progressJSON.substring(0, progressJSON.length-2);
			progressJSON += "],";
		}
	} else {
		progressJSON = "[]";
	}
	// remove last , and whitespace
	progressJSON = progressJSON.substring(0, progressJSON.length-1);
	progressJSON += "]"

	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) { createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Router successfully created'); progressDetails(document.getElementById('hiddentlrid').innerText, false);}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
		if (this.status == 401 || this.status == 403 ) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to create a new router for this request');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/request/progress/new', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		tlrid: document.getElementById('hiddentlrid').innerText,
		rawprogress: progressJSON,
	}));
}

function modifyRouter() {
	var progressDiv = document.getElementById('progressDiv');
	progressDiv.innerHTML = '<h5>Modify Router</h5>';

	// Grab the router corresponding to the tlrid and create an editable table
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
			// Get Data
			var steps = JSON.parse(xhr.responseText);

			// Create table
			var headlist = ['Group', 'Step', 'Description', 'Finished', 'Finished by', 'Finished on', 'Comment'];
			appendTable(progressDiv, 'progress table', 'progress table modifiable', headlist);

			var xhrCategories = new XMLHttpRequest();
			xhrCategories.onreadystatechange = function() {
				if (xhrCategories.readyState == 4 && xhrCategories.status == 200){
					var categories = JSON.parse(xhrCategories.responseText);
					var names = [];
					for (i in categories){
						names.push(categories[i].category);
					}
					var table = document.getElementById('progress table');

					// create table rows
					for (i in steps){
						if (steps[i].userid == null || steps[i].userid == undefined) {
							steps[i].userid = "";
						}
						if (steps[i].fdate != null) {
							appendCustomTableInputRowPrefilled(table, [steps[i].category, steps[i].step, steps[i].description, steps[i].finished, steps[i].userid, steps[i].fdate.substring(0,10), steps[i].fcomment], ['dd', 't', 't', 'c', 't', 'd', 't'], "c" + i, ['Group'], [names]);
						} else {
							appendCustomTableInputRowPrefilled(table, [steps[i].category, steps[i].step, steps[i].description, steps[i].finished, steps[i].userid, null, steps[i].fcomment], ['dd', 't', 't', 'c', 't', 'd', 't'], "c" + i, ['Group'], [names]);
						}
					}
				}
			}
			xhrCategories.open("GET", window.apiRoute + '/data/progress/categories', true);
			xhrCategories.send(null);

			appendFunctionButtonSecondary(progressDiv, "Add Row to Table", "addModifyProgressTableRowHelper()");
			appendFunctionButtonSecondary(progressDiv, "Remove last Row", "reduceModifyProgressTableRowHelper()");
			appendFunctionButtonSecondary(progressDiv, "Update Router", "submitModifiedRouter()");

			appendHeading(progressDiv, '5', 'Save Router as Template');
			appendText(progressDiv, 'templatename', 'Name of new Template');
			appendFunctionButton(progressDiv, 'Save as Template', 'saveTemplate()');
		}
    }
    xhr.open("GET", window.apiRoute + '/request/progress/router?tlrid=' + document.getElementById('hiddentlrid').innerText, true);
    xhr.send(null);
}

// Helper to add row to the router input table.
function addModifyProgressTableRowHelper(){
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
            var categories = JSON.parse(xhr.responseText);
			var names = [];
			for (i in categories){
				names.push(categories[i].category);
			}
			var table = document.getElementById('progress table');
			appendCustomTableInputRowPrefilled(table, ["", (table.lastChild.childElementCount + 1), "", "", "", "", ""], ['dd', 't', 't', 'c', 't', 'd', 't'], "c" + i, ['Group'], [names]);
		}
    }
    xhr.open("GET", window.apiRoute + '/data/progress/categories', true);
    xhr.send(null);
}

// Helper to remove row from the router input table.
function reduceModifyProgressTableRowHelper() {
	var table = document.getElementById('progress table');
	var body = table.childNodes[1];
	body.removeChild(body.lastChild);
}

function submitModifiedRouter() {
	//grab data from table
	var table = document.getElementById('progress table');
	var tableRowLength = table.rows.length;
	var progressJSON = "["
	// iterate over all rows
	if (tableRowLength > 1){
		for (i = 1; i < tableRowLength; i++) {
			var rowCells = table.rows.item(i).cells;
			var rowCellLength = rowCells.length;
			// iterate over the cells in a row
			progressJSON += "["
			for (j = 0; j < rowCellLength; j++) {
				// check if it is a checkbox, since they do not have a value
				if (rowCells.item(j).firstChild.className == "a-checkbox"){
					if (rowCells.item(j).firstChild.firstChild.checked){
						progressJSON += '"true", ';
					} else {
						progressJSON += '"false", ';
					}
				}
				// check if it is a checkbox, since they have a label as first child and the select as their last Child
				else if (rowCells.item(j).firstChild.className == "a-dropdown") {
					progressJSON += '"' + rowCells.item(j).firstChild.lastChild.value + '", ' ;
				}
				else {
					progressJSON += '"' + rowCells.item(j).firstChild.firstChild.value + '", ' ;
				}
			}
			// remove last , and whitespace
			progressJSON = progressJSON.substring(0, progressJSON.length-2);
			progressJSON += "],";
		}
	} else {
		progressJSON = "[]";
	}
	// remove last , and whitespace
	progressJSON = progressJSON.substring(0, progressJSON.length-1);
	progressJSON += "]"

	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) { createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Router successfully updated'); progressDetails(document.getElementById('hiddentlrid').innerText, false);}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: No template to copy router from found');}
		if (this.status == 401 || this.status == 403 ) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify the router for this request');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/request/progress/update', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		tlrid: document.getElementById('hiddentlrid').innerText,
		rawprogress: progressJSON,
	}));
}

function saveTemplate() {
	//grab data from table
	var table = document.getElementById('progress table');
	var tableRowLength = table.rows.length;
	var progressJSON = "["
	// iterate over all rows
	if (tableRowLength > 1){
		for (i = 1; i < tableRowLength; i++) {
			var rowCells = table.rows.item(i).cells;
			var rowCellLength = rowCells.length;
			// iterate over the cells in a row
			progressJSON += "["
			for (j of [0,1,2,6]) {
				// check if is a dropdown menu or text entry and append accordingly
				if (rowCells.item(j).firstChild.className == "a-dropdown") {
					progressJSON += '"' + rowCells.item(j).firstChild.lastChild.value + '", ' ;
				}
				else {
					progressJSON += '"' + rowCells.item(j).firstChild.firstChild.value + '", ' ;
				}
			}
			// remove last , and whitespace
			progressJSON = progressJSON.substring(0, progressJSON.length-2);
			progressJSON += "],";
		}
	} else {
		progressJSON = "[]";
	}
	// remove last , and whitespace
	progressJSON = progressJSON.substring(0, progressJSON.length-1);
	progressJSON += "]";

	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) { createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Template successfully created');}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
		if (this.status == 401 || this.status == 403 ) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to create a new template');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/request/progress/createtemplate', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		templatename: document.getElementById('templatename').value,
		rawprogress: progressJSON,
	}));
}

function closeRequest() {
	if (confirm("Please confirm that you want to mark " + document.getElementById('hiddentlrid').innerText + " as closed")) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState != 4) return;
			if (this.status == 204) { createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Request successfully closed'); progressDetails(document.getElementById('hiddentlrid').innerText, false);}
			if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
			if (this.status == 401 || this.status == 403 ) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to mark this request as closed');}
			if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
		}
		xhr.open("PUT", window.apiRoute + '/request/progress/close', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			tlrid: document.getElementById('hiddentlrid').innerText,
			closeResult: document.getElementById('closeResult').value,
			closeDispo: document.getElementById('closeDispo').value
		}));
	}
}

function reopenRequest() {
	if (confirm("Please confirm that you want to reopen " + document.getElementById('hiddentlrid').innerText)) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState != 4) return;
			if (this.status == 204) { createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Request successfully reopened'); progressDetails(document.getElementById('hiddentlrid').innerText, false);}
			if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
			if (this.status == 401 || this.status == 403 ) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to reopen this request');}
			if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
		}
		xhr.open("DELETE", window.apiRoute + '/request/progress/close?tlrid=' + document.getElementById('hiddentlrid').innerText, true);
		xhr.send();
	}
}

function blockRequest() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 204) { createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Delay successfully updated'); progressDetails(document.getElementById('hiddentlrid').innerText, false);}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
		if (this.status == 401 || this.status == 403 ) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to mark this request as delayed');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("PUT", window.apiRoute + '/request/progress/block', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		tlrid: document.getElementById('hiddentlrid').innerText,
		block: document.getElementById('blockstatus').value,
	}));
}

function unblockRequest() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 204) { createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Delay successfully removed'); progressDetails(document.getElementById('hiddentlrid').innerText, false);}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
		if (this.status == 401 || this.status == 403 ) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to mark this request as not delayed');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("PUT", window.apiRoute + '/request/progress/block', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		tlrid: document.getElementById('hiddentlrid').innerText,
		block: "",
	}));
}

function assignTeamMember() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Team Member successfully assigned'); progressDetails(document.getElementById('hiddentlrid').innerText, false);}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to assign Accounts to this request');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/account/assign/tlrid', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		userid: document.getElementById('availableTeam').value,
		tlrid: document.getElementById('hiddentlrid').innerText
	}));
}
function unassignTeamMember() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Team Member successfully unassigned'); progressDetails(document.getElementById('hiddentlrid').innerText, true);}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to unassign Accounts to this request');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("DELETE", window.apiRoute + '/account/unassign/tlrid', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		userid: document.getElementById('assignedTeam').value,
		tlrid: document.getElementById('hiddentlrid').innerText
	}));
}

function changeDetails(tlrid) {
	// Update to correct icon colors
	updateHome(4);

	// get dashboard div and clear it
	var parentdiv = document.getElementById('dashboard');
	parentdiv.innerHTML = '';

	appendHeading(parentdiv, "4", "Change Details");

	// Grab all available customers, append Dropdown
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
            var details = JSON.parse(xhr.responseText)[0];

			// create invisible marker containing current tlrid
			var tlridmarker = document.createElement('p');
			tlridmarker.setAttribute("style", "display: none");
			tlridmarker.setAttribute("id", "tlridmarker");
			tlridmarker.innerHTML = tlrid;
			parentdiv.appendChild(tlridmarker);

			appendHeading(parentdiv, "5", "Unchangeable Data");
			var div = document.createElement('div');
			div.innerHTML = "TLR-ID: " + tlrid + "<br>Category: " + details.category + "<br>";
			parentdiv.appendChild(div);

			appendHeading(div, "5", "General Info");
			appendTextPrefilled(div, "userid", "Requesting User", details.requester, true);
			appendDropdown(div, "customer", "Customer", true);
			appendDropdown(div, "customerproject", "Customer Project", true)
			appendTextAreaPrefilled(div, "rinfo", "Request Info", "What is requested?", details.rinfo, true);
			if (details.category == 'Injector' || details.category == 'Nozzle') {
				appendTextPrefilled(div, "testtype", "Test Type", details.testtype, true);
			}
			appendTextAreaPrefilled(div, "specifications", "Test Output and Specifications", "What documents / reports are required and what are the desired specifications?", details.specifications, true);
			appendDropdown(div, "rtype", "Project Type", true);

			appendTextAreaPrefilled(div, "rcomment", "Optional Request Comment", "Would you like to add any additional information about this request?", details.rcomment);

			appendHeading(div, "5", "Product Info");
			if (details.category == 'Injector' || details.category == 'Pump') {
				appendDropdown(div, "generation", "Generation", true);
				appendDropdown(div, "product", "Product", true);
			} else if (details.category == 'Rail') {
				appendDropdown(div, "generation", "Generation", true);
			} else if (details.category == 'Nozzle') {
				appendDropdown(div, "injector", "Injector", true);
				appendTextPrefilled(div, "model", "Model Year", details.model, false);
				appendDropdown(div, "nozzle", "Nozzle Type / Component", true);
			} else {
				appendDropdown(div, "product", "Product", true);
			}
			appendTextAreaPrefilled(div, "rhistory", "Product History", "What is the experienced problem / When, where, how and what tests were conducted?", details.rhistory, true);

			appendHeading(div, "5", "Shipping Info");
			appendValuePrefilled(div, "pnumber", "Number of Parts", details.pnumber, true);
			if (details.shipdate != null) {
				appendDatePrefilled(div, "shipdate", "Shipping Date", details.shipdate.substring(0,10));
			} else {
				appendDate(div, "shipdate", "Shipping Date");
			}
			appendTextPrefilled(div, "deliverymethod", "Delivery Method", details.deliverymethod);
			appendTextPrefilled(div, "trackingnumber", "Tracking Number", details.trackingnumber);

			appendHeading(div, "5", "Technical Details");
			if (details.category == 'Injector') {
				appendTextPrefilled(div, "vetype", "Vehicle / Engine Type", details.vetype, true);
				appendTextPrefilled(div, "vin", "Vehicle ID", details.vin, true);
				appendTextPrefilled(div, "enginenr", "Engine Number", details.enginenr, true);
				appendTextPrefilled(div, "runtime", "Runtime", details.runtime, true);
				appendDropdown(div, "runtimeunit", "Runtime Unit", true);
				appendTextPrefilled(div, "fuel", "Fuel", details.fuel, true);
			} else if (details.category == 'Rail') {
				appendTextPrefilled(div, "pressure", "System Pressure in bar", details.pressure, true);
			} else if (details.category == 'Nozzle') {
				appendTextPrefilled(div, "vetype", "Vehicle / Engine Type", details.vetype, true);
				appendTextPrefilled(div, "vin", "Vehicle ID", details.vin, true);
				appendTextPrefilled(div, "enginenr", "Engine Number", details.enginenr, true);
				appendTextPrefilled(div, "runtime", "Runtime", details.runtime, true);
				appendDropdown(div, "runtimeunit", "Runtime Unit", true);
				appendTextPrefilled(div, "fuel", "Fuel", details.fuel, true);
				appendTextPrefilled(div, "bims", "BIMS", details.bims, false);
			} else if (details.category == 'Pump') {
				appendTextPrefilled(div, "vin", "Vehicle ID", details.vin, true);
				appendTextPrefilled(div, "enginenr", "Engine Number", details.enginenr, true);
				appendTextPrefilled(div, "pressure", "System Pressure in bar", details.pressure, true);
				appendTextPrefilled(div, "fuel", "Fuel", details.fuel, true);
			} else {
				appendTextAreaPrefilled(div, "additionalinfo", "Additional technical Details",  "Additional technical information (if required)", details.additionalinfo);
			}
			appendTextPrefilled(div, "disposition", "Disposition of Parts", details.disposition, true);

			if (details.category == 'Injector') {
				appendCylinderTableEditable(div, tlrid);
				appendFunctionButton(parentdiv, "Update Request", "sendInjectorUpdate()");
			} else if (details.category == 'Rail') {
				appendRailComponentTableEditable(div, tlrid, 'Rail');
				appendFunctionButton(parentdiv, "Update Request", "sendRailUpdate()");
			} else if (details.category == 'Nozzle') {
				appendCylinderTableEditable(div, tlrid);
				appendFunctionButton(parentdiv, "Update Request", "sendNozzleUpdate()");
			} else if (details.category == 'Pump') {
				appendRailComponentTableEditable(div, tlrid, 'Pump');
				appendFunctionButton(parentdiv, "Update Request", "sendPumpUpdate()");
			} else {
				appendDefaultComponentTableEditable(div, tlrid);
				appendFunctionButton(parentdiv, "Update Request", "sendDefaultUpdate()");
			}

			// Generate the dynamic content of the dropdown menus
			populateDropdowns(details);
		}
	}
	xhr.open("GET", window.apiRoute + '/request/tlrid?tlrid=' + tlrid, true);
	xhr.send(null);
}

function populateDropdowns(details) {

	// Grab all available Projects and append Dropdown, preselecting the current one
	var xhrProject = new XMLHttpRequest();
	xhrProject.onreadystatechange = function() {
        if (xhrProject.readyState == 4 && xhrProject.status == 200){
			var projects = JSON.parse(xhrProject.responseText);
			for (i in projects){
				expandDropdownSeparate(document.getElementById('customerproject'), projects[i].mcrid, projects[i].mcrid + ' | ' + projects[i].mcridtext);
			}
			document.getElementById(details.customerproject).setAttribute("selected", "selected");
		}
    }
	xhrProject.open("GET", window.apiRoute + '/data/projects', true);
	xhrProject.send(null);

	// Grab all available customers and append Dropdown, preselecting the current one
	var xhrCustomer = new XMLHttpRequest();
    xhrCustomer.onreadystatechange = function() {
        if (xhrCustomer.readyState == 4 && xhrCustomer.status == 200){
            var customers = JSON.parse(xhrCustomer.responseText);
			for (i in customers){
				expandDropdown(document.getElementById('customer'), customers[i].customername);
			}
			document.getElementById(details.customer).setAttribute("selected", "selected");
		}
    }
    xhrCustomer.open("GET", window.apiRoute + '/data/customers', true);
    xhrCustomer.send(null);

	// Grab available Generations and Products from Server, append to dropdown menus and preselect the current ones
	if (details.category == "Injector" || details.category == "Rail" || details.category == 'Pump') {
		var xhrGeneration = new XMLHttpRequest();
		xhrGeneration.onreadystatechange = function() {
			if (xhrGeneration.readyState == 4 && xhrGeneration.status == 200){
				var generations = JSON.parse(xhrGeneration.responseText);
				for (i in generations){
					expandDropdown(document.getElementById('generation'), generations[i].generation);
				}
				document.getElementById(details.generation).setAttribute("selected", "selected");
			}
		}
		xhrGeneration.open("GET", window.apiRoute + '/data/generations/specific?category=' + details.category, true);
		xhrGeneration.send(null);
	} else if (details.category == 'Nozzle') {
		var xhrInjector = new XMLHttpRequest();
		xhrInjector.onreadystatechange = function() {
			if (xhrInjector.readyState == 4 && xhrInjector.status == 200){
				var generations = JSON.parse(xhrInjector.responseText);
				for (i in generations){
					expandDropdown(document.getElementById('injector'), generations[i].generation);
				}
				document.getElementById(details.injector).setAttribute("selected", "selected");
			}
		}
		xhrInjector.open("GET", window.apiRoute + '/data/generations/specific?category=Injector', true);
		xhrInjector.send(null);

		var xhrNozzle = new XMLHttpRequest();
		xhrNozzle.onreadystatechange = function() {
			if (xhrNozzle.readyState == 4 && xhrNozzle.status == 200){
				var generations = JSON.parse(xhrNozzle.responseText);
				for (i in generations){
					expandDropdown(document.getElementById('nozzle'), generations[i].product);
				}
				document.getElementById(details.nozzle).setAttribute("selected", "selected");
			}
		}
		xhrNozzle.open("GET", window.apiRoute + '/data/products/specific?category=Nozzle', true);
		xhrNozzle.send(null);
	}

	if (details.category != 'Rail' && details.category != 'Nozzle') {
		var xhrProduct = new XMLHttpRequest();
		xhrProduct.onreadystatechange = function() {
			if (xhrProduct.readyState == 4 && xhrProduct.status == 200){
				var products = JSON.parse(xhrProduct.responseText);
				for (i in products){
					expandDropdown(document.getElementById('product'), products[i].product);
				}
				document.getElementById(details.product).setAttribute("selected", "selected");
			}
		}
		if (details.category == "Injector") { var querycategory = "Injector"; }
		else { var querycategory = ""; }
		xhrProduct.open("GET", window.apiRoute + '/data/products/specific?category=' + querycategory, true);
		xhrProduct.send(null);
	}

	// Grab available Project Types from Server, append to dropdown menu and preselect the current one
	var xhrPT = new XMLHttpRequest();
	xhrPT.onreadystatechange = function() {
		if (xhrPT.readyState == 4 && xhrPT.status == 200){
			var projecttypes = JSON.parse(xhrPT.responseText);
			for (i in projecttypes){
				expandDropdown(document.getElementById('rtype'), projecttypes[i].projecttype);
			}
			document.getElementById(details.rtype).setAttribute("selected", "selected");
		}
	}
	xhrPT.open("GET", window.apiRoute + '/data/projecttypes/specific?category=' + details.category, true);
	xhrPT.send(null);

	// Fill Dropdown containing the runtime units
	if (details.category == 'Injector' || details.category == 'Nozzle') {
	var runtimeDropdown = document.getElementById("runtimeunit");
		expandDropdown(runtimeDropdown, "Hours");
		expandDropdown(runtimeDropdown, "Miles");
		expandDropdown(runtimeDropdown, "Kilometres");
		document.getElementById(details.runtimeunit).setAttribute("selected", "selected");
	}
}

function appendCylinderTableEditable(parentdiv, tlrid){
	// Grab the cylinders corresponding to the tlrid and create an editable table
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
			// Get Data
			var cylinders = JSON.parse(xhr.responseText);

			// Create table
			var headlist = ['Row <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>', 'Cylinder Nr', 'Bosch PN', 'Customer PN', 'Serial Number', 'Plant Code', 'Manufacturing Date', 'Notes'];
			appendTable(parentdiv, 'cylinder table', 'cylinder table', headlist);

			var table = document.getElementById('cylinder table');

			// create table rows
			for (i in cylinders){
				appendCustomTableInputRowPrefilled(table, [cylinders[i].trow, cylinders[i].cylindernr, cylinders[i].bpn, cylinders[i].cpn, cylinders[i].serialnr, cylinders[i].plant, cylinders[i].mdate, cylinders[i].notes], ["t", "t", "t", "t", "t", "t", "td", "t"]);
			}
			appendFunctionButtonSecondary(parentdiv, "Add Row to Table", "addCylinderTableRowHelper()");
			appendFunctionButtonSecondary(parentdiv, "Remove last Row", "reduceCylinderTableRowHelper()");
		}
    }
    xhr.open("GET", window.apiRoute + '/request/cylinders/tlrid?tlrid=' + tlrid, true);
    xhr.send(null);
}

// Helper to add row to the cylinder input table.
function addCylinderTableRowHelper(){
	var table = document.getElementById('cylinder table');
	appendCustomTableInputRowPrefilled(table, ["" + (table.lastChild.childElementCount + 1), "", "", "", "", "", "", ""], ["t", "t", "t", "t", "t", "t", "td", "t"]);
}

// Helper to remove row from the cylinder input table.
function reduceCylinderTableRowHelper() {
	var table = document.getElementById('cylinder table');
	var body = table.childNodes[1];
	body.removeChild(body.lastChild);
}

function appendRailComponentTableEditable(parentdiv, tlrid, type) {
	// Grab the rail components corresponding to the tlrid and create an editable table
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
			// Get Data
			var components = JSON.parse(xhr.responseText);

			// Create table
			var headlist = ['Row <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>', "Component", "Generation", "Part Number", "Serial Number", "Manufacturing date", "Runtime", "Runtime unit", "Arrival Date", "MAP Order Entry Date", "Target Final Report Date", "Notes"];;
			appendTable(parentdiv, 'component table', 'component table', headlist);
			var table = document.getElementById('component table');

			var xhrComponent = new XMLHttpRequest();
			xhrComponent.onreadystatechange = function() {
				if (xhrComponent.readyState == 4 && xhrComponent.status == 200){
					var ddqueryresult = JSON.parse(xhrComponent.responseText);

					var ddcomponents = [];
					var ddgenerations = new Map();
					for (i in ddqueryresult) {
						ddcomponents.push(ddqueryresult[i].component);
						ddgenerations.set(ddqueryresult[i].component, ddqueryresult[i].generations);
					}

					var odometerUnits = ["Hours", "Miles", "Kilometres"];

					// create table rows
					for (i in components){
						// Check for dates being null
						if (components[i].manufacturingdate == null) {
							var manufacturingdate = "";
						} else {
							var manufacturingdate = components[i].manufacturingdate.substring(0,10)
						}

						if (components[i].arrivaldate == null) {
							var arrivaldate = "";
						} else {
							var arrivaldate = components[i].arrivaldate.substring(0,10)
						}

						if (components[i].moedate == null) {
							var moedate = "";
						} else {
							var moedate = components[i].moedate.substring(0,10)
						}

						if (components[i].tfrdate == null) {
							var tfrdate = "";
						} else {
							var tfrdate = components[i].tfrdate.substring(0,10)
						}

						if (components[i].odometervalue == null) {
							components[i].odometervalue = "";
						}
						appendCustomTableInputRowPrefilled(table, [components[i].trow, components[i].component, components[i].generation, components[i].partnumber, components[i].serialnumber, manufacturingdate, components[i].odometervalue, components[i].odometerunit, arrivaldate, moedate, tfrdate, components[i].notes], ["t", "dd", "dd", "t", "t", "td", "t", "dd", "d", "d", "d", "t"], "", ["Component", "Generation", "Unit"], [ddcomponents, ddgenerations.get(components[i].component), odometerUnits]);

						// Update dropdown when new component is selected
						if (type == 'Rail') {
							table.lastChild.lastChild.children[1].firstChild.lastChild.onchange = function() {
								var options = this.parentElement.parentElement.parentElement.children[2].firstChild.lastChild;
								var xhrGeneration = new XMLHttpRequest();
								xhrGeneration.onreadystatechange = function() {
									if (xhrGeneration.readyState == 4 && xhrGeneration.status == 200){
										var response_generations = JSON.parse(xhrGeneration.responseText);
										options.innerHTML = "";
										for (i in response_generations) {
											var dropdownOption = document.createElement('option');
											dropdownOption.innerHTML = response_generations[i].generation;
											dropdownOption.setAttribute('value', response_generations[i].generation);
											dropdownOption.setAttribute('id', response_generations[i].generation);
											options.appendChild(dropdownOption);
										}
									}
								}
								xhrGeneration.open("GET", window.apiRoute + '/data/componentgenerations?category=Rail&component=' + this.value, true);
								xhrGeneration.send(null);
							}
						} else if (type == 'Pump') {
							table.lastChild.lastChild.children[1].firstChild.lastChild.onchange = function() {
								var options = this.parentElement.parentElement.parentElement.children[2].firstChild.lastChild;
								var xhrGeneration = new XMLHttpRequest();
								xhrGeneration.onreadystatechange = function() {
									if (xhrGeneration.readyState == 4 && xhrGeneration.status == 200){
										var response_generations = JSON.parse(xhrGeneration.responseText);
										options.innerHTML = "";
										for (i in response_generations) {
											var dropdownOption = document.createElement('option');
											dropdownOption.innerHTML = response_generations[i].generation;
											dropdownOption.setAttribute('value', response_generations[i].generation);
											dropdownOption.setAttribute('id', response_generations[i].generation);
											options.appendChild(dropdownOption);
										}
									}
								}
								xhrGeneration.open("GET", window.apiRoute + '/data/componentgenerations?category=Pump&component=' + this.value, true);
								xhrGeneration.send(null);
							}
						}
					}
					if (type == 'Rail') {
						appendFunctionButtonSecondary(parentdiv, "Add Row to Table", "addRailComponentTableRowCaller()");
					} else if (type == 'Pump') {
						appendFunctionButtonSecondary(parentdiv, "Add Row to Table", "addPumpComponentTableRowCaller()");
					}
					appendFunctionButtonSecondary(parentdiv, "Remove last Row", "reduceRailComponentTableRowHelper()");
				}
			}
			xhrComponent.open("GET", window.apiRoute + '/data/componentgenerations/combined?category=' + type, true);
			xhrComponent.send(null);
		}
    }
    xhr.open("GET", window.apiRoute + '/request/railcomponents/tlrid?tlrid=' + tlrid, true);
    xhr.send(null);
}

// Helper to call addRailComponentTableRowHelper with a parameter
function addRailComponentTableRowCaller() {
	addRailComponentTableRowHelper('Rail');
}

// Helper to call addRailComponentTableRowHelper with a parameter
function addPumpComponentTableRowCaller() {
	addRailComponentTableRowHelper('Pump');
}

// Helper to add row to the rail component input table.
function addRailComponentTableRowHelper(type){
	var table = document.getElementById('component table');
	var odometerUnits = ["Hours", "Miles", "Kilometres"];

	var xhrComponent = new XMLHttpRequest();
    xhrComponent.onreadystatechange = function() {
        if (xhrComponent.readyState == 4 && xhrComponent.status == 200){
            var response_components = JSON.parse(xhrComponent.responseText);
			var components = [];
			for (i in response_components) {
				components.push(response_components[i].component);
			}

			var xhrGeneration = new XMLHttpRequest();
			xhrGeneration.onreadystatechange = function() {
				if (xhrGeneration.readyState == 4 && xhrGeneration.status == 200){
					var response_generations = JSON.parse(xhrGeneration.responseText);
					var generations = [];
					for (i in response_generations) {
						generations.push(response_generations[i].generation);
					}
					appendCustomTableInputRowPrefilled(table, [table.lastChild.childElementCount + 1, "", "", "", "", "", "", "", null, null, null, ""], ["t", "dd", "dd", "t", "t", "td", "t", "dd", "d", "d", "d", "t"], null, ["Component", "Generation", "Unit"], [components, generations, odometerUnits]);

					// Update dropdown when new component is selected
					table.lastChild.lastChild.children[1].firstChild.lastChild.onchange = function() {
						var options = this.parentElement.parentElement.parentElement.children[2].firstChild.lastChild;
						var xhrGeneration = new XMLHttpRequest();
						xhrGeneration.onreadystatechange = function() {
							if (xhrGeneration.readyState == 4 && xhrGeneration.status == 200){
								var response_generations = JSON.parse(xhrGeneration.responseText);
								options.innerHTML = "";
								for (i in response_generations) {
									var dropdownOption = document.createElement('option');
									dropdownOption.innerHTML = response_generations[i].generation;
									dropdownOption.setAttribute('value', response_generations[i].generation);
									dropdownOption.setAttribute('id', response_generations[i].generation);
									options.appendChild(dropdownOption);
								}
							}
						}
						xhrGeneration.open("GET", window.apiRoute + '/data/componentgenerations?category=' + type + '&component=' + this.value, true);
						xhrGeneration.send(null);
					}

					//prefill if this is the first Row
					if (table.lastChild.childElementCount == 1 && type == 'Rail') {
						table.lastChild.firstChild.children[1].firstChild.lastChild.value = "Rail";

						var xhrGenerationFirstline = new XMLHttpRequest();
						xhrGenerationFirstline.onreadystatechange = function() {
							if (xhrGenerationFirstline.readyState == 4 && xhrGenerationFirstline.status == 200){
								var response_generations = JSON.parse(xhrGenerationFirstline.responseText);
								var options = table.lastChild.lastChild.children[2].firstChild.lastChild;
								options.innerHTML = "";
								for (i in response_generations) {
									var dropdownOption = document.createElement('option');
									dropdownOption.innerHTML = response_generations[i].generation;
									dropdownOption.setAttribute('value', response_generations[i].generation);
									dropdownOption.setAttribute('id', response_generations[i].generation);
									options.appendChild(dropdownOption);
								}
								table.lastChild.firstChild.children[2].firstChild.lastChild.value = document.getElementById('generation').value;
							}
						}
						xhrGenerationFirstline.open("GET", window.apiRoute + '/data/componentgenerations?category=Rail&component=Rail', true);
						xhrGenerationFirstline.send(null);
					} else if (table.lastChild.childElementCount == 1 && type == 'Pump') {
						table.lastChild.firstChild.children[1].firstChild.lastChild.value = "Pump";

						var xhrGenerationFirstline = new XMLHttpRequest();
						xhrGenerationFirstline.onreadystatechange = function() {
							if (xhrGenerationFirstline.readyState == 4 && xhrGenerationFirstline.status == 200){
								var response_generations = JSON.parse(xhrGenerationFirstline.responseText);
								var options = table.lastChild.lastChild.children[2].firstChild.lastChild;
								options.innerHTML = "";
								for (i in response_generations) {
									var dropdownOption = document.createElement('option');
									dropdownOption.innerHTML = response_generations[i].generation;
									dropdownOption.setAttribute('value', response_generations[i].generation);
									dropdownOption.setAttribute('id', response_generations[i].generation);
									options.appendChild(dropdownOption);
								}
								table.lastChild.firstChild.children[2].firstChild.lastChild.value = document.getElementById('generation').value;
							}
						}
						xhrGenerationFirstline.open("GET", window.apiRoute + '/data/componentgenerations?category=Pump&component=Pump', true);
						xhrGenerationFirstline.send(null);
					}
				}
			}
			xhrGeneration.open("GET", window.apiRoute + '/data/componentgenerations?category=' + type + '&component=' + components[0], true);
			xhrGeneration.send(null);

		}
    }
    xhrComponent.open("GET", window.apiRoute + '/data/components?category=' + type, true);
    xhrComponent.send(null);
}

// Helper to remove row from the rail component input table.
function reduceRailComponentTableRowHelper() {
	var table = document.getElementById('component table');
	var body = table.childNodes[1];
	body.removeChild(body.lastChild);
}

function appendDefaultComponentTableEditable(parentdiv, tlrid){
	// Grab the components corresponding to the tlrid and create an editable table
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
			// Get Data
			var components = JSON.parse(xhr.responseText);

			// Create table
			var headlist = ['Row <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>', 'Component Nr', 'Bosch PN', 'Customer PN', 'Serial Number', 'Plant Code', 'Manufacturing Date', 'Notes'];
			appendTable(parentdiv, 'cylinder table', 'cylinder table', headlist);

			var table = document.getElementById('cylinder table');

			// create table rows
			for (i in components){
				appendCustomTableInputRowPrefilled(table, [components[i].trow, components[i].componentnr, components[i].bpn, components[i].cpn, components[i].serialnr, components[i].plant, components[i].mdate, components[i].notes], ["t", "t", "t", "t", "t", "t", "td", "t"]);
			}
			// use helpers from cylinder table since the table structure is currently the same
			appendFunctionButtonSecondary(parentdiv, "Add Row to Table", "addCylinderTableRowHelper()");
			appendFunctionButtonSecondary(parentdiv, "Remove last Row", "reduceCylinderTableRowHelper()");
		}
    }
    xhr.open("GET", window.apiRoute + '/request/defaultcomponents/tlrid?tlrid=' + tlrid, true);
    xhr.send(null);
}

function sendInjectorUpdate() {
	// Evaluate cylinder table
	var table = document.getElementById('cylinder table');
	var tableRowLength = table.rows.length;
	var cylinderJSON = "["
	// iterate over all rows
	if (tableRowLength > 1){
		for (i = 1; i < tableRowLength; i++) {
			var rowCells = table.rows.item(i).cells;
			var rowCellLength = rowCells.length;
			// iterate over the cells in a row
			cylinderJSON += "["
			for (j = 0; j < rowCellLength; j++) {
				cylinderJSON += '"' + rowCells.item(j).firstChild.firstChild.value + '", ' ;
			}
			// remove last , and whitespace
			cylinderJSON = cylinderJSON.substring(0, cylinderJSON.length-2);
			cylinderJSON += "],";
		}
	} else {
		cylinderJSON = "[]";
	}
	// remove last , and whitespace
	cylinderJSON = cylinderJSON.substring(0, cylinderJSON.length-1);
	cylinderJSON += "]"

	var xhr = new XMLHttpRequest();
	// Alert to inform user on success or failure of update
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Injector-Request successfully updated');}
		if (this.status == 400) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Faulty values submitted');}
		if (this.status == 401 || this.status == 403) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify this request');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	};

	// Gather values and send request to update
	xhr.open("PUT", window.apiRoute + '/request/injector', true);
	xhr.setRequestHeader('Content-Type', 'application/json');

	// Grab Data from Forms and attach it to request
	xhr.send(JSON.stringify({
		tlrid: document.getElementById("tlridmarker").innerHTML,
		userid: document.getElementById('userid').value,
		generation: document.getElementById('generation').value,
		product: document.getElementById('product').value,
		customer: document.getElementById("customer").value,
		customerproject: document.getElementById('customerproject').value,
		rinfo: document.getElementById('rinfo').value,
		testtype: document.getElementById('testtype').value,
		specifications: document.getElementById('specifications').value,
		rhistory: document.getElementById('rhistory').value,
		pnumber: document.getElementById('pnumber').value,
		rtype: document.getElementById('rtype').value,
		shipdate: document.getElementById('shipdate').value,
		deliverymethod: document.getElementById('deliverymethod').value,
		trackingnumber: document.getElementById('trackingnumber').value,
		vetype: document.getElementById('vetype').value,
		vin: document.getElementById('vin').value,
		enginenr: document.getElementById('enginenr').value,
		runtimeunit: document.getElementById('runtimeunit').value,
		runtime: document.getElementById('runtime').value,
		fuel: document.getElementById('fuel').value,
		disposition: document.getElementById('disposition').value,
		rcomment: document.getElementById('rcomment').value,
		cylinders: cylinderJSON
	}));
}

function sendRailUpdate() {
	// Evaluate cylinder table
	var table = document.getElementById('component table');
	var tableRowLength = table.rows.length;
	var componentJSON = "["
	// iterate over all rows
	if (tableRowLength > 1){
		for (i = 1; i < tableRowLength; i++) {
			var rowCells = table.rows.item(i).cells;
			var rowCellLength = rowCells.length;
			// iterate over the cells in a row
			componentJSON += "["
			for (j = 0; j < rowCellLength; j++) {
				if (j == 1 || j == 2 || j == 7) {
					componentJSON += '"' + rowCells.item(j).firstChild.lastChild.value + '", ' ;
				} else {
					componentJSON += '"' + rowCells.item(j).firstChild.firstChild.value + '", ' ;
				}
			}
			// remove last , and whitespace
			componentJSON = componentJSON.substring(0, componentJSON.length-2);
			componentJSON += "],";
		}
	} else {
		componentJSON = "[]";
	}
	// remove last , and whitespace
	componentJSON = componentJSON.substring(0, componentJSON.length-1);
	componentJSON += "]";


	var xhr = new XMLHttpRequest();
	// Alert to inform user on success or failure of update
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Rail-Request successfully updated');}
		if (this.status == 400) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Faulty values submitted');}
				if (this.status == 401 || this.status == 403) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify this request');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	};

	// Gather values and send request to update
	xhr.open("PUT", window.apiRoute + '/request/rail', true);
	xhr.setRequestHeader('Content-Type', 'application/json');

	// Grab Data from Forms and attach it to request
	xhr.send(JSON.stringify({
		tlrid: document.getElementById("tlridmarker").innerHTML,
		userid: document.getElementById('userid').value,
		generation: document.getElementById('generation').value,
		customer: document.getElementById("customer").value,
		customerproject: document.getElementById('customerproject').value,
		rinfo: document.getElementById('rinfo').value,
		specifications: document.getElementById('specifications').value,
		rhistory: document.getElementById('rhistory').value,
		pnumber: document.getElementById('pnumber').value,
		rtype: document.getElementById('rtype').value,
		shipdate: document.getElementById('shipdate').value,
		deliverymethod: document.getElementById('deliverymethod').value,
		trackingnumber: document.getElementById('trackingnumber').value,
		pressure: document.getElementById('pressure').value,
		disposition: document.getElementById('disposition').value,
		rcomment: document.getElementById('rcomment').value,
		components: componentJSON
	}));
}

function sendNozzleUpdate() {
	// Evaluate cylinder table
	var table = document.getElementById('cylinder table');
	var tableRowLength = table.rows.length;
	var cylinderJSON = "["
	// iterate over all rows
	if (tableRowLength > 1){
		for (i = 1; i < tableRowLength; i++) {
			var rowCells = table.rows.item(i).cells;
			var rowCellLength = rowCells.length;
			// iterate over the cells in a row
			cylinderJSON += "["
			for (j = 0; j < rowCellLength; j++) {
				cylinderJSON += '"' + rowCells.item(j).firstChild.firstChild.value + '", ' ;
			}
			// remove last , and whitespace
			cylinderJSON = cylinderJSON.substring(0, cylinderJSON.length-2);
			cylinderJSON += "],";
		}
	} else {
		cylinderJSON = "[]";
	}
	// remove last , and whitespace
	cylinderJSON = cylinderJSON.substring(0, cylinderJSON.length-1);
	cylinderJSON += "]"

	var xhr = new XMLHttpRequest();
	// Alert to inform user on success or failure of update
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Nozzle-Request successfully updated');}
		if (this.status == 400) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Faulty values submitted');}
		if (this.status == 401 || this.status == 403) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify this request');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	};

	// Gather values and send request to update
	xhr.open("PUT", window.apiRoute + '/request/nozzle', true);
	xhr.setRequestHeader('Content-Type', 'application/json');

	// Grab Data from Forms and attach it to request
	xhr.send(JSON.stringify({
		tlrid: document.getElementById("tlridmarker").innerHTML,
		userid: document.getElementById('userid').value,
		injector: document.getElementById('injector').value,
		nozzle: document.getElementById('nozzle').value,
		model: document.getElementById('model').value,
		customer: document.getElementById("customer").value,
		customerproject: document.getElementById('customerproject').value,
		rinfo: document.getElementById('rinfo').value,
		testtype: document.getElementById('testtype').value,
		specifications: document.getElementById('specifications').value,
		rhistory: document.getElementById('rhistory').value,
		pnumber: document.getElementById('pnumber').value,
		rtype: document.getElementById('rtype').value,
		shipdate: document.getElementById('shipdate').value,
		deliverymethod: document.getElementById('deliverymethod').value,
		trackingnumber: document.getElementById('trackingnumber').value,
		vetype: document.getElementById('vetype').value,
		vin: document.getElementById('vin').value,
		enginenr: document.getElementById('enginenr').value,
		runtimeunit: document.getElementById('runtimeunit').value,
		runtime: document.getElementById('runtime').value,
		fuel: document.getElementById('fuel').value,
		disposition: document.getElementById('disposition').value,
		rcomment: document.getElementById('rcomment').value,
		bims: document.getElementById('bims').value,
		cylinders: cylinderJSON
	}));
}

function sendPumpUpdate() {
	// Evaluate cylinder table
	var table = document.getElementById('component table');
	var tableRowLength = table.rows.length;
	var componentJSON = "["
	// iterate over all rows
	if (tableRowLength > 1){
		for (i = 1; i < tableRowLength; i++) {
			var rowCells = table.rows.item(i).cells;
			var rowCellLength = rowCells.length;
			// iterate over the cells in a row
			componentJSON += "["
			for (j = 0; j < rowCellLength; j++) {
				if (j == 1 || j == 2 || j == 7) {
					componentJSON += '"' + rowCells.item(j).firstChild.lastChild.value + '", ' ;
				} else {
					componentJSON += '"' + rowCells.item(j).firstChild.firstChild.value + '", ' ;
				}
			}
			// remove last , and whitespace
			componentJSON = componentJSON.substring(0, componentJSON.length-2);
			componentJSON += "],";
		}
	} else {
		componentJSON = "[]";
	}
	// remove last , and whitespace
	componentJSON = componentJSON.substring(0, componentJSON.length-1);
	componentJSON += "]";


	var xhr = new XMLHttpRequest();
	// Alert to inform user on success or failure of update
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Pump-Request successfully updated');}
		if (this.status == 400) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Faulty values submitted');}
		if (this.status == 401 || this.status == 403) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify this request');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	};

	// Gather values and send request to update
	xhr.open("PUT", window.apiRoute + '/request/pump', true);
	xhr.setRequestHeader('Content-Type', 'application/json');

	// Grab Data from Forms and attach it to request
	xhr.send(JSON.stringify({
		tlrid: document.getElementById("tlridmarker").innerHTML,
		userid: document.getElementById('userid').value,
		generation: document.getElementById('generation').value,
		product: document.getElementById('product').value,
		customer: document.getElementById("customer").value,
		customerproject: document.getElementById('customerproject').value,
		rinfo: document.getElementById('rinfo').value,
		specifications: document.getElementById('specifications').value,
		rhistory: document.getElementById('rhistory').value,
		pnumber: document.getElementById('pnumber').value,
		rtype: document.getElementById('rtype').value,
		shipdate: document.getElementById('shipdate').value,
		deliverymethod: document.getElementById('deliverymethod').value,
		trackingnumber: document.getElementById('trackingnumber').value,
		vin: document.getElementById('vin').value,
		enginenr: document.getElementById('enginenr').value,
		pressure: document.getElementById('pressure').value,
		fuel: document.getElementById('fuel').value,
		disposition: document.getElementById('disposition').value,
		rcomment: document.getElementById('rcomment').value,
		components: componentJSON
	}));
}

function sendDefaultUpdate() {
	// Evaluate cylinder table
	var table = document.getElementById('cylinder table');
	var tableRowLength = table.rows.length;
	var componentJSON = "["
	// iterate over all rows
	if (tableRowLength > 1){
		for (i = 1; i < tableRowLength; i++) {
			var rowCells = table.rows.item(i).cells;
			var rowCellLength = rowCells.length;
			// iterate over the cells in a row
			componentJSON += "["
			for (j = 0; j < rowCellLength; j++) {
				componentJSON += '"' + rowCells.item(j).firstChild.firstChild.value + '", ' ;
			}
			// remove last , and whitespace
			componentJSON = componentJSON.substring(0, componentJSON.length-2);
			componentJSON += "],";
		}
	} else {
		componentJSON = "[]";
	}
	// remove last , and whitespace
	componentJSON = componentJSON.substring(0, componentJSON.length-1);
	componentJSON += "]"

	var xhr = new XMLHttpRequest();
	// Alert to inform user on success or failure of update
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Generic Request successfully updated');}
		if (this.status == 400) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Faulty values submitted');}
		if (this.status == 401 || this.status == 403) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify this request');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	};

	// Gather values and send request to update
	xhr.open("PUT", window.apiRoute + '/request/default', true);
	xhr.setRequestHeader('Content-Type', 'application/json');

	// Grab Data from Forms and attach it to request
	xhr.send(JSON.stringify({
		tlrid: document.getElementById("tlridmarker").innerHTML,
		userid: document.getElementById('userid').value,
		product: document.getElementById('product').value,
		customer: document.getElementById("customer").value,
		customerproject: document.getElementById('customerproject').value,
		rinfo: document.getElementById('rinfo').value,
		specifications: document.getElementById('specifications').value,
		rhistory: document.getElementById('rhistory').value,
		pnumber: document.getElementById('pnumber').value,
		rtype: document.getElementById('rtype').value,
		shipdate: document.getElementById('shipdate').value,
		deliverymethod: document.getElementById('deliverymethod').value,
		trackingnumber: document.getElementById('trackingnumber').value,
		additionalinfo: document.getElementById('additionalinfo').value,
		disposition: document.getElementById('disposition').value,
		rcomment: document.getElementById('rcomment').value,
		components: componentJSON
	}));
}

function loadArchive() {
	// Update to correct icon colors
	updateHome(5);

	// get dashboard div and clear it
	var parentdiv = document.getElementById('dashboard');
	parentdiv.innerHTML = '';

	appendHeading(parentdiv, "4", "Archive");

	// create div for search parameters
	var querydiv = document.createElement('div');
	appendSelectableDropdown(querydiv, 'category', 'Category');
	appendSelectableDropdown(querydiv, 'requester', 'Requesting User');
	appendSelectableText(querydiv, 'lowTLRID', 'Lower Limit of TLR-IDs');
	appendSelectableText(querydiv, 'highTLRID', 'Upper Limit of TLR-IDs');
	appendSelectableDate(querydiv, 'lowOpened', 'Opened after');
	appendSelectableDate(querydiv, 'highOpened', 'Opened before');
	appendSelectableDate(querydiv, 'lowClosed', 'Closed after');
	appendSelectableDate(querydiv, 'highClosed', 'Closed before');
	appendBR(querydiv);
	appendFunctionButtonSecondary(querydiv, 'Filter Requests', 'filterRequests()');
	parentdiv.appendChild(querydiv);

	var categoryDropdown = document.getElementById('category');
	var xhrCategories = new XMLHttpRequest();
    xhrCategories.onreadystatechange = function() {
        if (xhrCategories.readyState == 4 && xhrCategories.status == 200){
            var categories = JSON.parse(xhrCategories.responseText);
			for (i in categories){
				expandDropdown(categoryDropdown, categories[i].categoryname);
			}
		}
    }
    xhrCategories.open("GET", window.apiRoute + '/data/categories', true);
    xhrCategories.send(null);

	var requesterDropdown = document.getElementById('requester');
	var xhrAccounts = new XMLHttpRequest();
    xhrAccounts.onreadystatechange = function() {
        if (xhrAccounts.readyState == 4 && xhrAccounts.status == 200){
            var accounts = JSON.parse(xhrAccounts.responseText);
			for (i in accounts){
				expandDropdownSeparate(requesterDropdown, accounts[i].userid, accounts[i].name);
			}
		}
    }
    xhrAccounts.open("GET", window.apiRoute + '/account/all', true);
    xhrAccounts.send(null);

	// create div for table (needed to ignore headline)
	var tablediv = document.createElement('div');
	tablediv.setAttribute('id', 'tablediv');
	parentdiv.appendChild(tablediv);

	// generate large table
	filterRequests();
}

function filterRequests(startIndex = 0, endIndex = 50, step = 50) {
	var div = document.getElementById('tablediv');
	var tableId = 'complete-table';
	var headlist = ['TLR-ID', 'Requesting User', 'Category', 'Opened on', 'Closed on', 'Progress', 'Delayed', 'Assigned'];
	var heading = 'All Requests of ' + sessionStorage.getItem('userid');

	// delete the current table
	div.innerHTML = '';

	appendHeading(div, '4', heading);

	// create new table head
	var table = document.createElement('table');
	table.setAttribute('class', 'm-table');
	table.setAttribute('aria-label', tableId);
	table.setAttribute('id', tableId);

	// create the table head entries
	var heads = '';
	headlist.forEach(head => {heads += '<th class="">' + head + '</th>';})

	table.innerHTML = '<thead><tr>' + heads + '</tr></thead>';
	div.appendChild(table);

	// Grab all available open / closed requests, and append table
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
            // Parse data and create empty table body
			var requests = JSON.parse(xhr.responseText);
			var tablecontent = document.createElement('tbody');
			// transform the received request-data into table rows
			for (i in requests){
				var row = document.createElement('tr');

				// Convert dates in a more readable format
				var opendate = requests[i].opened.substring(0,10);
				if (requests[i].closed != null){
					var closedate = requests[i].closed.substring(0,10) + " ";
				} else {
					var closedate = 'Open';
				}

				// Create Icon for blocked entry
				// create iconbutton and popover menu for the block-reason
				if (requests[i].block.length != 0){
					var blockedIcon = '<div class="frontend-kit-example_attached-popover" style="margin-bottom:0"><button type="button" class="a-button a-button--tertiary -without-label" style="padding-left: 40%; padding-right: 40%"><i class="a-icon ui-ic-alert-error" title="" style="color:#ed0007;"></i></button><div class="m-popover -top-left -close-button"><div class="a-box -floating"><div class="m-popover__content"><div class="m-popover__head"><button type="button" class="a-button a-button--integrated -without-label" data-frok-action="close" aria-label="close popover"><i class="a-icon a-button__icon ui-ic-close" title="Lorem Ipsum"></i></button></div><div class="m-popover__paragraph">' + (' ' + requests[i].block).slice(1) + '</div></div></div></div></div>';
				} else {
					var blockedIcon = '';
				}
				// create a list of icons showing the progress of the request, not showing any icons if no router is assigned
				if (requests[i].count == 0) {
					var progressicons = '';
				} else {
					var progressicons = '';
					// remove all duplicate values, as DISTINCT doesn't work as wanted in the query
					var icons = [...new Set(requests[i].icons)];
					var iconnames = [...new Set(requests[i].iconnames)];
					for (j in icons) {
						if (requests[i].closedcategories == null) {
							progressicons += '<i class="a-icon boschicon-bosch-ic-' + icons[j] +'" title="' + iconnames[j] + '"></i>';
						}
						else if (requests[i].closedcategories.includes(icons[j])){
							progressicons += '<i class="a-icon boschicon-bosch-ic-' + icons[j] +'" title="' + iconnames[j] + '" style="color:#00884a"></i>';
						} else {
							progressicons += '<i class="a-icon boschicon-bosch-ic-' + icons[j] +'" title="' + iconnames[j] + '"></i>';
						}
					}
				}

				if (requests[i].workers == null) {
					requests[i].workers = "";
				}

				row.innerHTML = '<td>' + requests[i].tlrid + '</td><td>' + requests[i].requester + '</td><td>' + requests[i].category + '</td><td>' + opendate + '</td><td>' + closedate + '</td><td>' + progressicons + '</td><td>' + blockedIcon + '</td><td>' + requests[i].workers + '</td>';

				// Add Eventlistener to load details on click
				row.children[0].addEventListener('click', function() {
					showDetails(this.parentNode.firstChild.innerText);
				}, false);
				row.children[0].setAttribute('class', 'clickable');

				// Add Eventlistener to load progress on click
				var surpressAuthentificationError = false;

				row.children[4].addEventListener('click', function() {
					progressDetails(this.parentNode.firstChild.innerText, surpressAuthentificationError);
				}, false);
				row.children[4].setAttribute('class', 'clickable');

				if (requests[i].block.length != 0) {
					var pos = 6;
					row.children[pos].firstChild.firstChild.addEventListener('click', function() {
						this.parentNode.lastChild.setAttribute("style", "max-width: 24rem; display: block; position: absolute");
					}, false);
					row.children[pos].firstChild.lastChild.firstChild.firstChild.firstChild.firstChild.addEventListener('click', function() {
						this.parentNode.parentNode.parentNode.parentNode.setAttribute("style", "max-width: 24rem; display: none; position: absolute");
					}, false);
				}

				tablecontent.appendChild(row);
			}
			// append body to table head
			table.appendChild(tablecontent);

			// generate buttons to scroll back
			var backbutton = document.createElement('button');
			backbutton.setAttribute('type', 'button');
			backbutton.setAttribute('class', 'a-button a-button--secondary -without-icon');
			backbutton.innerHTML = '<div class="a-button__label">Previous</div>';
			backbutton.addEventListener('click', function(){
				filterRequests(startIndex - step, endIndex - step, step)
			});

			// generate buttons to scroll forward
			var forwardbutton = document.createElement('button');
			forwardbutton.setAttribute('type', 'button');
			forwardbutton.setAttribute('class', 'a-button a-button--secondary -without-icon');
			forwardbutton.innerHTML = '<div class="a-button__label">Next</div>';
			forwardbutton.addEventListener('click', function() {
				filterRequests(startIndex + step, endIndex + step, step)
			});

			// append buttons if needed
			if (startIndex >= step){
				div.appendChild(backbutton);
			}
			div.appendChild(forwardbutton);
		} else if (xhr.readyState == 4 && xhr.status == 401) {
		} else if (xhr.readyState == 4 && xhr.status == 500) {
			createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');;
		}
    }
	//check the search selection for the parameters
	if (document.getElementById('category-checkbox').checked) {
		var category = document.getElementById('category').value;
	} else {
		var category = "";
	}
	if (document.getElementById('requester-checkbox').checked) {
		var requester = document.getElementById('requester').value;
	} else {
		var requester = "";
	}
	if (document.getElementById('lowTLRID-checkbox').checked) {
		var lowTLRID = document.getElementById('lowTLRID').value;
	} else {
		var lowTLRID = "";
	}
	if (document.getElementById('highTLRID-checkbox').checked) {
		var highTLRID = document.getElementById('highTLRID').value;
	} else {
		var highTLRID = "";
	}
	if (document.getElementById('lowOpened-checkbox').checked) {
		var lowOpened = document.getElementById('lowOpened').value;
	} else {
		var lowOpened = "";
	}
	if (document.getElementById('highOpened-checkbox').checked) {
		var highOpened = document.getElementById('highOpened').value;
	} else {
		var highOpened = "";
	}
	if (document.getElementById('highClosed-checkbox').checked) {
		var highClosed = document.getElementById('highClosed').value;
	} else {
		var highClosed = "";
	}
	if (document.getElementById('lowClosed-checkbox').checked) {
		var lowClosed = document.getElementById('lowClosed').value;
	} else {
		var lowClosed = "";
	}

    xhr.open("POST", window.apiRoute + '/request/all', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		startIndex: startIndex,
		step: endIndex - startIndex,
		category: category,
		requester: requester,
		lowTLRID: lowTLRID,
		highTLRID: highTLRID,
		lowOpened: lowOpened,
		highOpened: highOpened,
		lowClosed: lowClosed,
		highClosed: highClosed
	}));
}
