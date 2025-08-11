/*     
    Summary: 
    Provides general overview over all open requests
   
    Copyright:         Robert Bosch GmbH, 2021
	Author:			   Paul Göbel
 */
 
function loadIndex() {
	window.location.href = "index.html";
}

function generateStatusBoard(startIndex, endIndex, step) {
		var div = document.getElementById('overview');
		var tableId = 'statusBoard';
		var url = window.apiRoute + '/request/statusboard?start=' + startIndex + '&end=' + (endIndex - startIndex);
		var headlist = ['TLR-ID', 'Requesting User', 'Category', 'Opened on', 'Progress', 'Delayed', 'Assigned'];
		var heading = 'Status Board';
	
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
				
				// Create Icon for blocked entry
				// create iconbutton and popver menu for the block-reason
				if (requests[i].block.length != 0){
					var blockedIcon = '<i class="a-icon ui-ic-alert-error" title="" style="color:#ed0007;"></i>';
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
					
				row.innerHTML = '<td>' + requests[i].tlrid + '</td><td>' + requests[i].requester + '</td><td>' + requests[i].category + '</td><td>' + requests[i].opened.substring(0,10) + '</td><td>' + progressicons + '</td><td>' + blockedIcon + '</td><td>' + requests[i].workers + '</td>';
				
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
				generateStatusBoard(startIndex - step, endIndex - step, step)
			});
			
			// generate buttons to scroll forward
			var forwardbutton = document.createElement('button');
			forwardbutton.setAttribute('type', 'button');
			forwardbutton.setAttribute('class', 'a-button a-button--secondary -without-icon');
			forwardbutton.innerHTML = '<div class="a-button__label">Next</div>';
			forwardbutton.addEventListener('click', function() {
				generateStatusBoard(startIndex + step, endIndex + step, step)
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