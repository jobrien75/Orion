/*
    Summary:
    Provides functionality to make the dynamically generate
	different parts of a request.

    Copyright:         Robert Bosch GmbH, 2021
	Author:			   Paul Göbel
 */

function fillCategoryDropdown() {
	var dropdown = document.getElementById('type');
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
            var categories = JSON.parse(xhr.responseText);
			for (i in categories){
				expandDropdown(dropdown, categories[i].categoryname);
			}
		}
    }
    xhr.open("GET", window.apiRoute + '/data/categories', true);
    xhr.send(null);
}

function loadIndex() {
	window.location.href = "index.html";
}

function loadDashboard() {
	window.location.href = "dashboard.html";
}

function showUserInput() {
	// Hide previous input fields
	var inputForm = document.getElementById('requestForm');
	hideContent(inputForm);

	// Remove Summary if it exists
	if (document.getElementById('requestDiv').childElementCount >= 3) {
			document.getElementById('requestDiv').removeChild(document.getElementById('requestDiv').lastChild);
	}

	document.getElementById('type').parentElement.parentElement.style.display = "block";
	document.getElementById('type').setAttribute('disabled', '');
	document.getElementById('type').parentElement.setAttribute('class', 'a-dropdown a-dropdown--disabled');
	document.getElementById('Select Request Category').style.display = "block";
	document.getElementById('Proceed to Component Selection').style.display = "inline-flex";

	document.getElementById('tlrid').parentElement.parentElement.style.display = "block";
	document.getElementById('tlrid').setAttribute('disabled', '');
	document.getElementById('Copy TLR').style.display = "inline-flex";
	document.getElementById('Copy TLR').setAttribute('disabled', '');
	document.getElementById('Return to Landing Page').style.display = "inline-flex";
	document.getElementById('Return to Landing Page').setAttribute('disabled', '');
	document.getElementById('Jump to Dashboard').style.display = "inline-flex";
	document.getElementById('Jump to Dashboard').setAttribute('disabled', '');
}

function copyTLRID() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) {
			var data = JSON.parse(this.responseText);
			document.getElementById('Proceed to Component Selection').setAttribute('disabled', '');
			document.getElementById('Copy TLR').setAttribute('disabled', '');
			document.getElementById('Copy TLR').firstChild.innerHTML = 'Submitted Successfully';
			createSuccessBanner(document.getElementById('requestDiv'), 'rsuccess', 'The request was successfully submitted, TLR-ID: ' + data.tlrid);
		}
		if (this.status == 400) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: Missing Data');}
		if (this.status == 401) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: No authenticated User was found');}
		if (this.status == 500) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/request/copy', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		copytlrid: document.getElementById('tlrid').value
	}));
}

// Hides the previous form components and generates
// selections for product generation and component.
function proceedComponentInput() {
	// Hide previous input fields
	var inputForm = document.getElementById('requestForm');
	hideContent(inputForm);

	// Update Icon
	var prevIcon = document.getElementById('icon-user');
	prevIcon.setAttribute('src','../resources/icon/user-green.svg');
	prevIcon.setAttribute('style', 'height:100%; width:100%; border: 2px solid #00884a; cursor: pointer');

	document.getElementById('Proceed to Component Selection').onclick = showComponentInput;

	document.getElementById('icon-settings-editor').setAttribute('style', 'height:100%; width:100%; border: 2px dashed #000000; cursor: pointer');
	document.getElementById('icon-settings-editor').onclick = showComponentInput;

	// Check what product type is selected
	var type = document.getElementById('type').value;

	// Append Fields needed for injectors
	if (type == 'Injector') {
		appendHeading(inputForm, "5", "Select Injector Generation");
		appendDropdown(inputForm, "generation", "Generation", true);
		appendHeading(inputForm, "5", "Select Product / Component");
		appendDropdown(inputForm, "product", "Product", true);
		appendFunctionButton(inputForm, "Proceed to Customer Selection", "proceedCustomerInput()");

		// Grab available Generations and Products from Server and append to dropdown menus
		var xhrGeneration = new XMLHttpRequest();
		xhrGeneration.onreadystatechange = function() {
			if (xhrGeneration.readyState == 4 && xhrGeneration.status == 200){
				var generations = JSON.parse(xhrGeneration.responseText);
				for (i in generations){
					expandDropdown(document.getElementById('generation'), generations[i].generation);
				}
			}
		}
		xhrGeneration.open("GET", window.apiRoute + '/data/generations/specific?category=Injector', true);
		xhrGeneration.send(null);

		var xhrProduct = new XMLHttpRequest();
		xhrProduct.onreadystatechange = function() {
			if (xhrProduct.readyState == 4 && xhrProduct.status == 200){
				var products = JSON.parse(xhrProduct.responseText);
				for (i in products){
					expandDropdown(document.getElementById('product'), products[i].product);
				}
			}
		}
		xhrProduct.open("GET", window.apiRoute + '/data/products/specific?category=Injector', true);
		xhrProduct.send(null);

	} else if (type == 'Rail') {
		appendHeading(inputForm, "5", "Select Rail Generation");

		appendDropdown(inputForm, "generation", "Generation", true);
		appendFunctionButton(inputForm, "Proceed to Customer Selection", "proceedCustomerInput()");

		// Grab available Generations from Server and append to dropdown menus
		var xhrGeneration = new XMLHttpRequest();
		xhrGeneration.onreadystatechange = function() {
			if (xhrGeneration.readyState == 4 && xhrGeneration.status == 200){
				var generations = JSON.parse(xhrGeneration.responseText);
				for (i in generations){
					expandDropdown(document.getElementById('generation'), generations[i].generation);
				}
			}
		}
		xhrGeneration.open("GET", window.apiRoute + '/data/generations/specific?category=' + type, true);
		xhrGeneration.send(null);
	}
	else if (type == 'Nozzle') {
		appendHeading(inputForm, "5", "Select Injector and Nozzle");
		appendDropdown(inputForm, "injector", "Injector", true);
		appendText(inputForm, "model", "Model Year", false);
		appendDropdown(inputForm, "nozzle", "Nozzle Type / Component", true);
		appendFunctionButton(inputForm, "Proceed to Customer Selection", "proceedCustomerInput()");

		// Grab available Generations and Products from Server and append to dropdown menus
		var xhrInjector = new XMLHttpRequest();
		xhrInjector.onreadystatechange = function() {
			if (xhrInjector.readyState == 4 && xhrInjector.status == 200){
				var igenerations = JSON.parse(xhrInjector.responseText);
				for (i in igenerations){
					expandDropdown(document.getElementById('injector'), igenerations[i].generation);
				}
			}
		}
		xhrInjector.open("GET", window.apiRoute + '/data/generations/specific?category=Injector', true);
		xhrInjector.send(null);

		var xhrNozzle = new XMLHttpRequest();
		xhrNozzle.onreadystatechange = function() {
			if (xhrNozzle.readyState == 4 && xhrNozzle.status == 200){
				var nproducts = JSON.parse(xhrNozzle.responseText);
				for (i in nproducts){
					expandDropdown(document.getElementById('nozzle'), nproducts[i].product);
				}
			}
		}
		xhrNozzle.open("GET", window.apiRoute + '/data/products/specific?category=Nozzle', true);
		xhrNozzle.send(null);
	}
	else if ( type == 'Pump' ) {
		appendHeading(inputForm, "5", "Select Pump Generation");
		appendDropdown(inputForm, "generation", "Generation", true);
		appendHeading(inputForm, "5", "Select Product / Component");
		appendDropdown(inputForm, "product", "Product", true);
		appendFunctionButton(inputForm, "Proceed to Customer Selection", "proceedCustomerInput()");

		// Grab available Generations and Products from Server and append to dropdown menus
		var xhrGeneration = new XMLHttpRequest();
		xhrGeneration.onreadystatechange = function() {
			if (xhrGeneration.readyState == 4 && xhrGeneration.status == 200){
				var generations = JSON.parse(xhrGeneration.responseText);
				for (i in generations){
					expandDropdown(document.getElementById('generation'), generations[i].generation);
				}
			}
		}
		xhrGeneration.open("GET", window.apiRoute + '/data/generations/specific?category=Pump', true);
		xhrGeneration.send(null);

		var xhrProduct = new XMLHttpRequest();
		xhrProduct.onreadystatechange = function() {
			if (xhrProduct.readyState == 4 && xhrProduct.status == 200){
				var products = JSON.parse(xhrProduct.responseText);
				for (i in products){
					expandDropdown(document.getElementById('product'), products[i].product);
				}
			}
		}
		xhrProduct.open("GET", window.apiRoute + '/data/products/specific?category=Pump', true);
		xhrProduct.send(null);

	}
	// User general request when no specific workflow applies
	else {
		appendHeading(inputForm, "5", "Select Product / Component");
		appendDropdown(inputForm, "product", "Product (or best applicable alternative)", true);
		appendFunctionButton(inputForm, "Proceed to Customer Selection", "proceedCustomerInput()");

		var xhrProduct = new XMLHttpRequest();
		xhrProduct.onreadystatechange = function() {
			if (xhrProduct.readyState == 4 && xhrProduct.status == 200){
				var products = JSON.parse(xhrProduct.responseText);
				for (i in products){
					expandDropdown(document.getElementById('product'), products[i].product);
				}
			}
		}
		xhrProduct.open("GET", window.apiRoute + '/data/products/specific?category=' + type, true);
		xhrProduct.send(null);
	}
}

function showComponentInput() {
	// Hide previous input fields
	var inputForm = document.getElementById('requestForm');
	hideContent(inputForm);

	// Check what product type is selected
	var type = document.getElementById('type').value;

	// Remove Summary if it exists
	if (document.getElementById('requestDiv').childElementCount >= 3) {
			document.getElementById('requestDiv').removeChild(document.getElementById('requestDiv').lastChild);
	}

	// Append Fields needed for injectors
	if (type == 'Injector') {
		document.getElementById('Select Injector Generation').style.display = "block";
		document.getElementById('generation').parentElement.parentElement.style.display = "block";
		document.getElementById('product').parentElement.parentElement.style.display = "block";
		document.getElementById('Proceed to Customer Selection').style.display = "inline-flex";

	} else if (type == 'Rail') {
		document.getElementById('Select Rail Generation').style.display = "block";
		document.getElementById('generation').parentElement.parentElement.style.display = "block";
		document.getElementById('Proceed to Customer Selection').style.display = "inline-flex";

	} else if (type == 'Pump') {
		document.getElementById('Select Pump Generation').style.display = "block";
		document.getElementById('generation').parentElement.parentElement.style.display = "block";
		document.getElementById('product').parentElement.parentElement.style.display = "block";
		document.getElementById('Proceed to Customer Selection').style.display = "inline-flex";
	}

	else if (type == 'Nozzle') {
		document.getElementById('Select Injector and Nozzle').style.display = "block";
		document.getElementById('injector').parentElement.parentElement.style.display = "block";
		document.getElementById('model').parentElement.parentElement.style.display = "block";
		document.getElementById('nozzle').parentElement.parentElement.style.display = "block";
		document.getElementById('Proceed to Customer Selection').style.display = "inline-flex";

	}
	// User general request when no specific workflow applies
	else {
		document.getElementById('Select Product / Component').style.display = "block";
		document.getElementById('product').parentElement.parentElement.style.display = "block";
		document.getElementById('Proceed to Customer Selection').style.display = "inline-flex";
	}
}

// Hides the previous form components and generates
// Dropdown-Menus for customer and project.
// Data for the selection is requested from server.
function proceedCustomerInput() {
	// Hide previous input fields
	var inputForm = document.getElementById('requestForm');
	hideContent(inputForm);

	// Update Icon
	var prevIcon = document.getElementById('icon-settings-editor');
	prevIcon.setAttribute('src','../resources/icon/settings-editor-green.svg');
	prevIcon.setAttribute('style', 'height:100%; width:100%; border: 2px solid #00884a; cursor: pointer');

	document.getElementById('Proceed to Customer Selection').onclick = showCustomerInput;

	document.getElementById('icon-customer').setAttribute('style', 'height:100%; width:100%; border: 2px dashed #000000; cursor: pointer;');
	document.getElementById('icon-customer').onclick = showCustomerInput;

	// Generate Heading, Button and empty Dropdown-Menus
	appendHeading(inputForm, "5", "Select Customer (and Project)");
	appendDropdown(inputForm, "customer", "Customer", true)
	appendDropdown(inputForm, "customer project", "Project", true)
	appendFunctionButton(inputForm, "Proceed to Request Info", "proceedRequestInfoInput()");

	// Grab all available customers projects, append Dropdown
	// by adding the data received to the corresponding (empty) Menu
	var xhrProject = new XMLHttpRequest();
	xhrProject.onreadystatechange = function() {
		if (xhrProject.readyState == 4 && xhrProject.status == 200){
			var projects = JSON.parse(xhrProject.responseText);
			for (i in projects){
				expandDropdownSeparate(document.getElementById('customer project'), projects[i].mcrid, projects[i].mcrid + ' | ' + projects[i].mcridtext);
			}
		}
	}
	xhrProject.open("GET", window.apiRoute + '/data/projects', true);
	xhrProject.send(null);

	var xhrCustomer = new XMLHttpRequest();
    xhrCustomer.onreadystatechange = function() {
        if (xhrCustomer.readyState == 4 && xhrCustomer.status == 200){
            var customers = JSON.parse(xhrCustomer.responseText);
			for (i in customers){
				expandDropdown(document.getElementById('customer'), customers[i].customername);
			}
		}
    }
    xhrCustomer.open("GET", window.apiRoute + '/data/customers', true);
    xhrCustomer.send(null);
}

function showCustomerInput() {
	// Hide previous input fields
	var inputForm = document.getElementById('requestForm');
	hideContent(inputForm);

	// Remove Summary if it exists
	if (document.getElementById('requestDiv').childElementCount >= 3) {
			document.getElementById('requestDiv').removeChild(document.getElementById('requestDiv').lastChild);
	}

	document.getElementById('Select Customer (and Project)').style.display = "block";
	document.getElementById('customer').parentElement.parentElement.style.display = "block";
	document.getElementById('customer project').parentElement.parentElement.style.display = "block";
	document.getElementById('Proceed to Request Info').style.display = "inline-flex";
}

// Hides all form components from previous steps and generates
// the input fields for request info, test type, project type, product history and part numbers.
function proceedRequestInfoInput() {
	// Hide previous input fields
	var inputForm = document.getElementById('requestForm');
	hideContent(inputForm);

	// Update Icon
	var prevIcon = document.getElementById('icon-customer');
	prevIcon.setAttribute('src','../resources/icon/customer-green.svg');
	prevIcon.setAttribute('style', 'height:100%; width:100%; border: 2px solid #00884a; cursor: pointer');

	document.getElementById('Proceed to Request Info').onclick = showRequestInput;

	document.getElementById('icon-document-copy').setAttribute('style', 'height:100%; width:100%; border: 2px dashed #000000; cursor: pointer;');
	document.getElementById('icon-document-copy').onclick = showRequestInput;

	appendHeading(inputForm, "5", "Enter additional Request and Product Info");

	appendTextArea(inputForm, "request info", "Request Info", "Please give a brief overview over what is requested.", true);
	if (document.getElementById('type').value == "Nozzle" || document.getElementById('type').value == "Injector") {
		appendText(inputForm, "test type", "Test Type", true);
	}
	appendDropdown(inputForm, "projecttype", "Project Type", true);
	appendTextArea(inputForm, "specifications", "Test Output and Specifications", "What does the originator or customer expect when complete? \nHow do we measure the results? \nWhat Specifications, Test Data Sheets, etc. are required to complete this task?", true);
	appendTextArea(inputForm, "product history", "Product History", "What is the experienced problem? \nWhen, where, how and what (vehicle) tests were conducted? \nAre there any additional notable details regarding the product?", true);
	appendValue(inputForm, "number parts", "Number of Parts", true);

	appendFunctionButton(inputForm, "Proceed to Shipping Information", "proceedShippingInfo()");

	// Grab available project types from the server and append them to the dropdown menu
	var xhrPT = new XMLHttpRequest();
	xhrPT.onreadystatechange = function() {
		if (xhrPT.readyState == 4 && xhrPT.status == 200){
			var projecttypes = JSON.parse(xhrPT.responseText);
			for (i in projecttypes){
				expandDropdown(document.getElementById('projecttype'), projecttypes[i].projecttype);
			}
		}
	}
	xhrPT.open("GET", window.apiRoute + '/data/projecttypes/specific?category=' + document.getElementById('type').value, true);
	xhrPT.send(null);
}

function showRequestInput() {
	// Hide previous input fields
	var inputForm = document.getElementById('requestForm');
	hideContent(inputForm);

	// Check what product type is selected
	var type = document.getElementById('type').value;

	// Remove Summary if it exists
	if (document.getElementById('requestDiv').childElementCount >= 3) {
			document.getElementById('requestDiv').removeChild(document.getElementById('requestDiv').lastChild);
	}

	document.getElementById('Enter additional Request and Product Info').style.display = "block";
	document.getElementById('request info').parentElement.parentElement.style.display = "block";
	document.getElementById('projecttype').parentElement.parentElement.style.display = "block";
	document.getElementById('specifications').parentElement.parentElement.style.display = "block";
	document.getElementById('product history').parentElement.parentElement.style.display = "block";
	document.getElementById('number parts').parentElement.parentElement.style.display = "block";

	document.getElementById('Proceed to Shipping Information').style.display = "inline-flex";

	// Append Fields needed for injectors
	if (type == 'Injector' || type == 'Nozzle') {
		document.getElementById('test type').parentElement.parentElement.style.display = "block";
	}
}

// Hides all form components from previous steps and generates
// selections / inputs for shipping information.
function proceedShippingInfo() {
	// check if all required data was submitted
	if (document.getElementById('request info').value == undefined || document.getElementById('request info').value == "" || document.getElementById('specifications').value == undefined || document.getElementById('specifications').value == "" || document.getElementById('product history').value == undefined || document.getElementById('product history').value == "" || document.getElementById('number parts').value == "" || isNaN(document.getElementById('number parts').value)) {
		createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
	} else if ((document.getElementById('type').value == 'Nozzle' || document.getElementById('type').value == 'Injector') && (document.getElementById('test type').value == undefined || document.getElementById('test type').value == "")){
		createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
	} else {
		// Hide previous input fields
		var inputForm = document.getElementById('requestForm');
		hideContent(inputForm);

		// Update Icon
		var prevIcon = document.getElementById('icon-document-copy');
		prevIcon.setAttribute('src','../resources/icon/document-copy-green.svg');
		prevIcon.setAttribute('style', 'height:100%; width:100%; border: 2px solid #00884a; cursor: pointer');

		document.getElementById('Proceed to Shipping Information').onclick = showShippingInput;

		document.getElementById('icon-delivery').setAttribute('style', 'height:100%; width:100%; border: 2px dashed #000000; cursor: pointer;');
		document.getElementById('icon-delivery').onclick = showShippingInput;

		// Append Fields for Project Type and Shipping
		appendHeading(inputForm, "5", "Enter Shipping Details");
		appendDate(inputForm, "ship date", "Ship Date", false);
		appendText(inputForm, "delivery method", "Delivery Method", false);
		appendText(inputForm, "tracking number", "Tracking Number", false);

		appendFunctionButton(inputForm, "Proceed to Technical Details", "proceedTechnicalDetails()");
	}
}

function showShippingInput() {
	// check if all required data was submitted
	if (document.getElementById('request info').value == undefined || document.getElementById('request info').value == "" || document.getElementById('specifications').value == undefined || document.getElementById('specifications').value == "" || document.getElementById('product history').value == undefined || document.getElementById('product history').value == "" || document.getElementById('number parts').value == "" || isNaN(document.getElementById('number parts').value)) {
		createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
	} else if ((document.getElementById('type').value == 'Nozzle' || document.getElementById('type').value == 'Injector') && (document.getElementById('test type').value == undefined || document.getElementById('test type').value == "")){
		createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
	} else {
		// Hide previous input fields
		var inputForm = document.getElementById('requestForm');
		hideContent(inputForm);

		// Remove Summary if it exists
		if (document.getElementById('requestDiv').childElementCount >= 3) {
				document.getElementById('requestDiv').removeChild(document.getElementById('requestDiv').lastChild);
		}

		document.getElementById('Enter Shipping Details').style.display = "block";
		document.getElementById('ship date').parentElement.parentElement.style.display = "block";
		document.getElementById('delivery method').parentElement.parentElement.style.display = "block";
		document.getElementById('tracking number').parentElement.parentElement.style.display = "block";

		document.getElementById('Proceed to Technical Details').style.display = "inline-flex";
	}
}

// Hides all previous form components and display the various more general
// inputs concerned with technical details.
function proceedTechnicalDetails() {
	// Hide previous input fields
	var inputForm = document.getElementById("requestForm");
	hideContent(inputForm);

	// Update Icon
	var prevIcon = document.getElementById("icon-delivery");
	prevIcon.setAttribute("src","../resources/icon/delivery-green.svg");
	prevIcon.setAttribute('style', 'height:100%; width:100%; border: 2px solid #00884a; cursor: pointer');

	document.getElementById('Proceed to Technical Details').onclick = showTechnicalDetailsInput;

	document.getElementById('icon-settings').setAttribute('style', 'height:100%; width:100%; border: 2px dashed #000000; cursor: pointer;');
	document.getElementById('icon-settings').onclick = showTechnicalDetailsInput;

	// Check what product type is selected
	var type = document.getElementById('type').value;

	// Append Fields needed for injectors
	if (type == 'Injector') {
		appendHeading(inputForm, "5", "Enter technical Details");
		appendText(inputForm, "vehicle engine type", "Vehicle / Engine Type", true);
		appendText(inputForm, "vin", "Vehicle ID", true);
		appendText(inputForm, "enginenr", "Engine Number", true);

		appendDropdown(inputForm, "runtime unit", "Runtime Unit", true);
		var runtimeDropdown = document.getElementById("runtime unit", true);
		expandDropdown(runtimeDropdown, "Hours");
		expandDropdown(runtimeDropdown, "Miles");
		expandDropdown(runtimeDropdown, "Kilometres");

		appendText(inputForm, "runtime", "Runtime", true);
		appendText(inputForm, "fuel type", "Fuel Type", true);
		appendDropdown(inputForm, "disposition parts", "Disposition of Parts", true);

		var dispositionDropdown = document.getElementById('disposition parts');
		var xhrDisposition = new XMLHttpRequest();
		xhrDisposition.onreadystatechange = function() {
			if (xhrDisposition.readyState == 4 && xhrDisposition.status == 200){
				var options = JSON.parse(xhrDisposition.responseText);
				for (i in options){
					expandDropdown(dispositionDropdown, options[i].disposition);
				}
			}
		}
		xhrDisposition.open("GET", window.apiRoute + '/data/disposition', true);
		xhrDisposition.send(null);

		appendFunctionButton(inputForm, "Continue Technical Details", "proceedTechnicalDetailsII()");
	} else if (type == 'Rail') {
		appendHeading(inputForm, "5", "Enter technical Details");

		// Check if we have a specific rail selected and use a prefilled value field if thats the case
		var pressure = document.getElementById('generation').value.split('-');
		if (pressure.length == 1) {
			appendValue(inputForm, 'pressure', 'System Pressure in bar', true);
		} else if (pressure.length > 1) {
			appendValuePrefilled(inputForm, 'pressure', 'System Pressure in bar', pressure[1] + '00', true);
		}

		appendDropdown(inputForm, "disposition parts", "Disposition of Parts", true);

		var dispositionDropdown = document.getElementById('disposition parts');
		var xhrDisposition = new XMLHttpRequest();
		xhrDisposition.onreadystatechange = function() {
			if (xhrDisposition.readyState == 4 && xhrDisposition.status == 200){
				var options = JSON.parse(xhrDisposition.responseText);
				for (i in options){
					expandDropdown(dispositionDropdown, options[i].disposition);
				}
			}
		}
		xhrDisposition.open("GET", window.apiRoute + '/data/disposition', true);
		xhrDisposition.send(null);

		appendFunctionButton(inputForm, "Continue Technical Details", "proceedTechnicalDetailsII()");
	} else if (type == 'Nozzle') {
		appendHeading(inputForm, "5", "Enter technical Details");
		appendText(inputForm, "vehicle engine type", "Vehicle / Engine Type", true);
		appendText(inputForm, "vin", "Vehicle ID", true);
		appendText(inputForm, "enginenr", "Engine Number", true);

		appendDropdown(inputForm, "runtime unit", "Runtime Unit", true);
		var runtimeDropdown = document.getElementById("runtime unit", true);
		expandDropdown(runtimeDropdown, "Hours");
		expandDropdown(runtimeDropdown, "Miles");
		expandDropdown(runtimeDropdown, "Kilometres");

		appendText(inputForm, "runtime", "Runtime", true);
		appendText(inputForm, "fuel type", "Fuel Type", true);
		appendDropdown(inputForm, "disposition parts", "Disposition of Parts", true);
		appendText(inputForm, "bims", "BIMS number", false);

		var dispositionDropdown = document.getElementById('disposition parts');
		var xhrDisposition = new XMLHttpRequest();
		xhrDisposition.onreadystatechange = function() {
			if (xhrDisposition.readyState == 4 && xhrDisposition.status == 200){
				var options = JSON.parse(xhrDisposition.responseText);
				for (i in options){
					expandDropdown(dispositionDropdown, options[i].disposition);
				}
			}
		}
		xhrDisposition.open("GET", window.apiRoute + '/data/disposition', true);
		xhrDisposition.send(null);

		appendFunctionButton(inputForm, "Continue Technical Details", "proceedTechnicalDetailsII()");
	} else if ( type == 'Pump' ) {
		appendHeading(inputForm, "5", "Enter technical Details");
		appendText(inputForm, "vin", "Vehicle ID", true);
		appendText(inputForm, "enginenr", "Engine Number", true);
		appendValue(inputForm, 'pressure', 'System Pressure in bar', true);
		appendText(inputForm, "fuel type", "Fuel Type", true);

		appendDropdown(inputForm, "disposition parts", "Disposition of Parts", true);
		var dispositionDropdown = document.getElementById('disposition parts');
		var xhrDisposition = new XMLHttpRequest();
		xhrDisposition.onreadystatechange = function() {
			if (xhrDisposition.readyState == 4 && xhrDisposition.status == 200){
				var options = JSON.parse(xhrDisposition.responseText);
				for (i in options){
					expandDropdown(dispositionDropdown, options[i].disposition);
				}
			}
		}
		xhrDisposition.open("GET", window.apiRoute + '/data/disposition', true);
		xhrDisposition.send(null);

		appendFunctionButton(inputForm, "Continue Technical Details", "proceedTechnicalDetailsII()");

	} else {
		appendHeading(inputForm, "5", "Enter technical Details");
		appendTextArea(inputForm, "additional info", "Additional Info", "Additional technical information (if required)");
		appendDropdown(inputForm, "disposition parts", "Disposition of Parts", true);

		var heads = ['Row <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>', "Component #", "Bosch PN", "Customer PN", "Serial Number", "Plant code", "Manufacturing date", "Notes"];
		appendTable(inputForm, "component table", "Table for relevant components", heads);
		appendFunctionButtonSecondary(inputForm, "Add Row to Table", "addInjectorTableRowHelper()");
		appendFunctionButtonSecondary(inputForm, "Remove last Row", "reduceComponentTableRowHelper()");
		appendFunctionButtonIntegrated(inputForm, "Reference for Date Norms", "loadManufacturingDateNorm()");
		appendBR(inputForm);
		appendBR(inputForm);

		appendFunctionButton(inputForm, "Proceed to Summary", "proceedTechnicalDetailsII()");

		var dispositionDropdown = document.getElementById('disposition parts');
		var xhrDisposition = new XMLHttpRequest();
		xhrDisposition.onreadystatechange = function() {
			if (xhrDisposition.readyState == 4 && xhrDisposition.status == 200){
				var options = JSON.parse(xhrDisposition.responseText);
				for (i in options){
					expandDropdown(dispositionDropdown, options[i].disposition);
				}
			}
		}
		xhrDisposition.open("GET", window.apiRoute + '/data/disposition', true);
		xhrDisposition.send(null);
	}
}

function showTechnicalDetailsInput() {
	// check if all required data was submitted
	if (document.getElementById('request info').value == undefined || document.getElementById('request info').value == "" || document.getElementById('specifications').value == undefined || document.getElementById('specifications').value == "" || document.getElementById('product history').value == undefined || document.getElementById('product history').value == "" || document.getElementById('number parts').value == "" || isNaN(document.getElementById('number parts').value)) {
		createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
	} else if ((document.getElementById('type').value == 'Nozzle' || document.getElementById('type').value == 'Injector') && (document.getElementById('test type').value == undefined || document.getElementById('test type').value == "")){
		createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
	} else {
		// Hide previous input fields
		var inputForm = document.getElementById('requestForm');
		hideContent(inputForm);

		// Check what product type is selected
		var type = document.getElementById('type').value;

		// Remove Summary if it exists
		if (document.getElementById('requestDiv').childElementCount >= 3) {
				document.getElementById('requestDiv').removeChild(document.getElementById('requestDiv').lastChild);
		}

		// Display fields according to category
		if (type == 'Injector') {
			document.getElementById('Enter technical Details').style.display = "block";
			document.getElementById('vehicle engine type').parentElement.parentElement.style.display = "block";
			document.getElementById('vin').parentElement.parentElement.style.display = "block";
			document.getElementById('enginenr').parentElement.parentElement.style.display = "block";
			document.getElementById('runtime unit').parentElement.parentElement.style.display = "block";
			document.getElementById('runtime').parentElement.parentElement.style.display = "block";
			document.getElementById('fuel type').parentElement.parentElement.style.display = "block";
			document.getElementById('disposition parts').parentElement.parentElement.style.display = "block";
			document.getElementById('Continue Technical Details').style.display = "inline-flex";

		} else if (type == 'Rail') {
			document.getElementById('Enter technical Details').style.display = "block";
			document.getElementById('pressure').parentElement.parentElement.style.display = "block";
			document.getElementById('disposition parts').parentElement.parentElement.style.display = "block";
			document.getElementById('Continue Technical Details').style.display = "inline-flex";

		}
		else if (type == 'Nozzle') {
			document.getElementById('Enter technical Details').style.display = "block";
			document.getElementById('vehicle engine type", "Vehicle / Engine Type').parentElement.parentElement.style.display = "block";
			document.getElementById('vin').parentElement.parentElement.style.display = "block";
			document.getElementById('enginenr').parentElement.parentElement.style.display = "block";
			document.getElementById('runtime unit').parentElement.parentElement.style.display = "block";
			document.getElementById('runtime').parentElement.parentElement.style.display = "block";
			document.getElementById('fuel type').parentElement.parentElement.style.display = "block";
			document.getElementById('disposition parts').parentElement.parentElement.style.display = "block";
			document.getElementById('bims').parentElement.parentElement.style.display = "block";
			document.getElementById('Continue Technical Details').style.display = "inline-flex";

		} else if (type == 'Pump') {
			document.getElementById('Enter technical Details').style.display = "block";
			document.getElementById('vin').parentElement.parentElement.style.display = "block";
			document.getElementById('enginenr').parentElement.parentElement.style.display = "block";
			document.getElementById('pressure').parentElement.parentElement.style.display = "block";
			document.getElementById('fuel type').parentElement.parentElement.style.display = "block";
			document.getElementById('disposition parts').parentElement.parentElement.style.display = "block";
			document.getElementById('Continue Technical Details').style.display = "inline-flex";
		}
		// User general request when no specific workflow applies
		else {
			document.getElementById('Enter technical Details').style.display = "block";
			document.getElementById('additional info').parentElement.parentElement.style.display = "block";
			document.getElementById('disposition parts').parentElement.parentElement.style.display = "block";
			document.getElementById('component table').style.display = "block";
			document.getElementById('Add Row to Table').style.display = "inline-flex";
			document.getElementById('Remove last Row').style.display = "inline-flex";
			document.getElementById('Proceed to Summary').style.display = "block";
			document.getElementById('Reference for Date Norms').style.display = "block";
		}
	}
}

// Hides all previous form components and appends the input fields needed for more
// specific technical details.
function proceedTechnicalDetailsII() {
	// check if all required data was submitted
	if (document.getElementById('type').value == 'Injector' || document.getElementById('type').value == 'Nozzle') {
		if (document.getElementById('vehicle engine type').value == undefined || document.getElementById('vehicle engine type').value == "" || document.getElementById('vin').value == undefined || document.getElementById('vin').value == "" || document.getElementById('enginenr').value == undefined || document.getElementById('enginenr').value == "" || document.getElementById('runtime').value == undefined || isNaN(document.getElementById('runtime').value) || document.getElementById('fuel type').value == undefined || document.getElementById('fuel type').value == "" || document.getElementById('request info').value == undefined || document.getElementById('request info').value == "" || document.getElementById('specifications').value == undefined || document.getElementById('specifications').value == "" || document.getElementById('product history').value == undefined || document.getElementById('product history').value == "" || document.getElementById('number parts').value == "" || isNaN(document.getElementById('number parts').value) || document.getElementById('test type').value == undefined || document.getElementById('test type').value == "") {
			createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
			return;
		}
	} else if (document.getElementById('type').value == 'Rail') {
		if (document.getElementById('pressure').value == undefined || document.getElementById('pressure').value == "" || isNaN(document.getElementById('pressure').value) || document.getElementById('request info').value == undefined || document.getElementById('request info').value == "" || document.getElementById('specifications').value == undefined || document.getElementById('specifications').value == "" || document.getElementById('product history').value == undefined || document.getElementById('product history').value == "" || document.getElementById('number parts').value == "" || isNaN(document.getElementById('number parts').value)) {
			createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
			return;
		}
	} else if (document.getElementById('type').value == 'Pump') {
		if (document.getElementById('fuel type').value == undefined || document.getElementById('fuel type').value == "" || document.getElementById('enginenr').value == undefined || document.getElementById('enginenr').value == "" || document.getElementById('vin').value == undefined || document.getElementById('vin').value == "" || document.getElementById('pressure').value == undefined || document.getElementById('pressure').value == "" || isNaN(document.getElementById('pressure').value) || document.getElementById('request info').value == undefined || document.getElementById('request info').value == "" || document.getElementById('specifications').value == undefined || document.getElementById('specifications').value == "" || document.getElementById('product history').value == undefined || document.getElementById('product history').value == "" || document.getElementById('number parts').value == "" || isNaN(document.getElementById('number parts').value)) {
			createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
			return;
		}
	} else {
		if (document.getElementById('request info').value == undefined || document.getElementById('request info').value == "" || document.getElementById('specifications').value == undefined || document.getElementById('specifications').value == "" || document.getElementById('product history').value == undefined || document.getElementById('product history').value == "" || document.getElementById('number parts').value == "" || isNaN(document.getElementById('number parts').value)) {
			createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
			return;
		}
	}

	// Hide previous input fields
	var inputForm = document.getElementById("requestForm");
	hideContent(inputForm);

	// Update Icon
	var prevIcon = document.getElementById("icon-settings");
	prevIcon.setAttribute("src","../resources/icon/settings-green.svg");
	prevIcon.setAttribute('style', 'height:100%; width:100%; border: 2px solid #00884a; cursor: pointer;');

	document.getElementById('icon-gears-3').setAttribute('style', 'height:100%; width:100%; border: 2px dashed #000000; cursor: pointer');
	document.getElementById('icon-gears-3').onclick = showTechnicalDetailsInputII;

	// Check what product type is selected
	var type = document.getElementById('type').value;

	// Append tables according to category
	if (type == 'Injector' || type == 'Nozzle') {
		document.getElementById('Continue Technical Details').onclick = showTechnicalDetailsInputII;
		var heads = ['Row <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>', "Cylinder #", "Bosch PN", "Customer PN", "Serial Number", "Plant code", "Manufacturing date", "Notes"];

		appendTable(inputForm, "component table", "Table for relevant components", heads);
		appendFunctionButtonSecondary(inputForm, "Add Row to Table", "addInjectorTableRowHelper()");
		appendFunctionButtonSecondary(inputForm, "Remove last Row", "reduceComponentTableRowHelper()");
		appendFunctionButtonIntegrated(inputForm, "Reference for Date Norms", "loadManufacturingDateNorm()");
		appendBR(inputForm);
		appendBR(inputForm);
		appendFunctionButton(inputForm, "Proceed to Summary", "proceedSummary()");

	} else if (type == 'Rail') {
		document.getElementById('Continue Technical Details').onclick = showTechnicalDetailsInputII;
		var heads = ['Row <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>', "Component", "Generation", "Part Number", "Serial Number", "Manufacturing date", "Runtime", "Runtime unit", "Notes"];

		appendTable(inputForm, "component table", "Table for relevant components", heads);
		appendFunctionButtonSecondary(inputForm, "Add Row to Table", "addRailTableRowHelper()");
		appendFunctionButtonSecondary(inputForm, "Remove last Row", "reduceComponentTableRowHelper()");
		appendFunctionButtonIntegrated(inputForm, "Reference for Date Norms", "loadManufacturingDateNorm()");
		appendBR(inputForm);
		appendBR(inputForm);
		appendFunctionButton(inputForm, "Proceed to Summary", "proceedSummary()");

		addRailTableRowHelper();
	} else if (type == 'Pump') {
		document.getElementById('Continue Technical Details').onclick = showTechnicalDetailsInputII;
		var heads = ['Row <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>', "Component", "Generation", "Part Number", "Serial Number", "Manufacturing date", "Runtime", "Runtime unit", "Notes"];

		appendTable(inputForm, "component table", "Table for relevant components", heads);
		appendFunctionButtonSecondary(inputForm, "Add Row to Table", "addRailTableRowHelper()");
		appendFunctionButtonSecondary(inputForm, "Remove last Row", "reduceComponentTableRowHelper()");
		appendFunctionButtonIntegrated(inputForm, "Reference for Date Norms", "loadManufacturingDateNorm()");
		appendBR(inputForm);
		appendBR(inputForm);
		appendFunctionButton(inputForm, "Proceed to Summary", "proceedSummary()");

		addRailTableRowHelper();
	} else {
		proceedSummary();
	}
}

function showTechnicalDetailsInputII() {
	// check if all required data was submitted
	if (document.getElementById('type').value == 'Injector' || document.getElementById('type').value == 'Nozzle') {
		if (document.getElementById('vehicle engine type').value == undefined || document.getElementById('vehicle engine type').value == "" || document.getElementById('vin').value == undefined || document.getElementById('vin').value == "" || document.getElementById('enginenr').value == undefined || document.getElementById('enginenr').value == "" || document.getElementById('runtime').value == undefined || isNaN(document.getElementById('runtime').value) || document.getElementById('fuel type').value == undefined || document.getElementById('fuel type').value == "" || document.getElementById('request info').value == undefined || document.getElementById('request info').value == "" || document.getElementById('specifications').value == undefined || document.getElementById('specifications').value == "" || document.getElementById('product history').value == undefined || document.getElementById('product history').value == "" || document.getElementById('number parts').value == "" || isNaN(document.getElementById('number parts').value) || document.getElementById('test type').value == undefined || document.getElementById('test type').value == "") {
			createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
			return;
		}
	} else if (document.getElementById('type').value == 'Rail') {
		if (document.getElementById('pressure').value == undefined || document.getElementById('pressure').value == ""  || isNaN(document.getElementById('pressure').value) || document.getElementById('request info').value == undefined || document.getElementById('request info').value == "" || document.getElementById('specifications').value == undefined || document.getElementById('specifications').value == "" || document.getElementById('product history').value == undefined || document.getElementById('product history').value == "" || document.getElementById('number parts').value == "" || isNaN(document.getElementById('number parts').value)) {
			createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
			return;
		}
	} else if (document.getElementById('type').value == 'Pump') {
		if (document.getElementById('fuel type').value == undefined || document.getElementById('fuel type').value == "" || document.getElementById('enginenr').value == undefined || document.getElementById('enginenr').value == "" || document.getElementById('vin').value == undefined || document.getElementById('vin').value == "" || document.getElementById('pressure').value == undefined || document.getElementById('pressure').value == "" || isNaN(document.getElementById('pressure').value) || document.getElementById('request info').value == undefined || document.getElementById('request info').value == "" || document.getElementById('specifications').value == undefined || document.getElementById('specifications').value == "" || document.getElementById('product history').value == undefined || document.getElementById('product history').value == "" || document.getElementById('number parts').value == "" || isNaN(document.getElementById('number parts').value)) {
			createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
			return;
		}
	} else {
		if (document.getElementById('request info').value == undefined || document.getElementById('request info').value == "" || document.getElementById('specifications').value == undefined || document.getElementById('specifications').value == "" || document.getElementById('product history').value == undefined || document.getElementById('product history').value == "" || document.getElementById('number parts').value == "" || isNaN(document.getElementById('number parts').value)) {
			createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
			return;
		}
	}

	// Hide previous input fields
	var inputForm = document.getElementById('requestForm');
	hideContent(inputForm);

	// Check what product type is selected
	var type = document.getElementById('type').value;

	// Remove Summary if it exists
	if (document.getElementById('requestDiv').childElementCount >= 3) {
			document.getElementById('requestDiv').removeChild(document.getElementById('requestDiv').lastChild);
	}

	// Display fields according to category
	if (type == 'Injector' || type == 'Nozzle') {
		document.getElementById('component table').style.display = "block";
		document.getElementById('Add Row to Table').style.display = "inline-flex";
		document.getElementById('Remove last Row').style.display = "inline-flex";
		document.getElementById('Proceed to Summary').style.display = "block";
		document.getElementById('Reference for Date Norms').style.display = "block";

	} else if (type == 'Rail' || type == 'Pump') {
		document.getElementById('component table').style.display = "block";
		document.getElementById('Add Row to Table').style.display = "inline-flex";
		document.getElementById('Remove last Row').style.display = "inline-flex";
		document.getElementById('Proceed to Summary').style.display = "block";
		document.getElementById('Reference for Date Norms').style.display = "block";
	}
	// Skip to step before in case of generic request, as these lack this step
	else {
		showTechnicalDetailsInput();
	}
}

function loadManufacturingDateNorm() {
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
       	if (this.readyState != 4) return;
		if (this.status == 200) {
			var reader = new FileReader();
			var blob = new Blob([xhr.response], { type: 'application/pdf' });
			reader.readAsDataURL(blob);

			const link = document.createElement('a');
			// Browsers that support HTML5 download attribute
			if (link.download !== undefined) {
			  const url = URL.createObjectURL(blob);
			  link.setAttribute('href', url);
			  link.setAttribute('download', 'Manufacturing Date Norms.pdf');
			  link.style.visibility = 'hidden';
			  document.body.appendChild(link);
			  link.click();
			  document.body.removeChild(link);
			}
		}
	}

    xhr.open("GET", window.apiRoute + '/data/norms/dates', true);
	xhr.responseType = "arraybuffer";
    xhr.send(null);
}

// Helper to add row to the cylinder input table.
function addInjectorTableRowHelper(){
	var table = document.getElementById('component table');
	appendCustomTableInputRowPrefilled(table, ["" + (table.lastChild.childElementCount + 1), "", "", "", "", "", "", ""], ["t", "t", "t", "t", "t", "t", "td", "t"]);
}

// Helper to remove row from the cylinder input table.
function reduceComponentTableRowHelper() {
	var table = document.getElementById('component table');
	var body = table.childNodes[1];
	body.removeChild(body.lastChild);
}

// Helper to add row to the cylinder input table.
function addRailTableRowHelper(){
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
					appendCustomTableInputRowPrefilled(table, [table.lastChild.childElementCount + 1, "", "", "", "", "", "", "", ""], ["t", "dd", "dd", "t", "t", "td", "t", "dd", "t"], null, ["Component", "Generation", "Unit"], [components, generations, odometerUnits]);

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
						xhrGeneration.open("GET", window.apiRoute + '/data/componentgenerations?category=' + document.getElementById('type').value + "&component=" + this.value, true);
						xhrGeneration.send(null);
					}

					//prefill if this is the first Row
					if (table.lastChild.childElementCount == 1) {
						table.lastChild.firstChild.children[1].firstChild.lastChild.value = document.getElementById('type').value;

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
						xhrGenerationFirstline.open("GET", window.apiRoute + '/data/componentgenerations?category=' + document.getElementById('type').value + "&component=" + document.getElementById('type').value, true);
						xhrGenerationFirstline.send(null);
					}
				}
			}
			xhrGeneration.open("GET", window.apiRoute + '/data/componentgenerations?category=' + document.getElementById('type').value + "&component=" + components[0], true);
			xhrGeneration.send(null);

		}
    }
    xhrComponent.open("GET", window.apiRoute + '/data/components?category=' + document.getElementById('type').value, true);
    xhrComponent.send(null);
}

// Hides the input form and extracts the entered data to create
// and display a textbased summary of the request. Also appends a
// Textarea for optional, additional comments.
function proceedSummary(){
	// check if all required data was submitted
	if (document.getElementById('type').value == 'Injector' || document.getElementById('type').value == 'Nozzle') {
		if (document.getElementById('vehicle engine type').value == undefined || document.getElementById('vehicle engine type').value == "" || document.getElementById('vin').value == undefined || document.getElementById('vin').value == "" || document.getElementById('enginenr').value == undefined || document.getElementById('enginenr').value == "" || document.getElementById('runtime').value == undefined || isNaN(document.getElementById('runtime').value) || document.getElementById('fuel type').value == undefined || document.getElementById('fuel type').value == "" || document.getElementById('request info').value == undefined || document.getElementById('request info').value == "" || document.getElementById('specifications').value == undefined || document.getElementById('specifications').value == "" || document.getElementById('product history').value == undefined || document.getElementById('product history').value == "" || document.getElementById('number parts').value == "" || isNaN(document.getElementById('number parts').value) || document.getElementById('test type').value == undefined || document.getElementById('test type').value == "") {
			createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
			return;
		}
	} else if (document.getElementById('type').value == 'Rail') {
		if (document.getElementById('pressure').value == undefined || document.getElementById('pressure').value == ""  || isNaN(document.getElementById('pressure').value) || document.getElementById('request info').value == undefined || document.getElementById('request info').value == "" || document.getElementById('specifications').value == undefined || document.getElementById('specifications').value == "" || document.getElementById('product history').value == undefined || document.getElementById('product history').value == "" || document.getElementById('number parts').value == "" || isNaN(document.getElementById('number parts').value)) {
			createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
			return;
		}
	} else {
		if (document.getElementById('request info').value == undefined || document.getElementById('request info').value == "" || document.getElementById('specifications').value == undefined || document.getElementById('specifications').value == "" || document.getElementById('product history').value == undefined || document.getElementById('product history').value == "" || document.getElementById('number parts').value == "" || isNaN(document.getElementById('number parts').value)) {
			createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Please fill out all input fields that are marked as required by a <i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i>');
			return;
		}
	}

	// Hide previous input fields
	var inputForm = document.getElementById("requestForm");
	hideContent(inputForm);

	// Update Icon
	var prevIcon = document.getElementById("icon-gears-3");
	prevIcon.setAttribute("src","../resources/icon/gears-3-green.svg");
	prevIcon.setAttribute('style', 'height:100%; width:100%; border: 2px solid #00884a');

	// Gather all relevant data for a summary
	var summary = document.createElement('div');
	summary.setAttribute('class', 'text');

	// Check what product type is selected
	var type = document.getElementById('type').value;
	var projecttype = document.getElementById('projecttype').value;

	// Create summary content
	var content = '<h5> General Info </h5>'
	content += "Customer: " + document.getElementById("customer").value + "<br>";
	content += "Project: " + document.getElementById('customer project').value + "<br>";
	content += "Request Info: " + document.getElementById('request info').value + "<br>";
	if (type == 'Injector' || type == 'Nozzle') {
		content += "Test Type: " + document.getElementById('test type').value + "<br>";
	}
	content += "Project Type: " + document.getElementById('projecttype').value + "<br>";
	content += "Test Output and Specifications: " + document.getElementById('specifications').value + "<br>";

	content += '<h5> Product Info </h5>'
	if (type == 'Injector') {
		content += "Injector Generation: " + document.getElementById('generation').value + "<br>";
		content += "Product / Component: " + document.getElementById('product').value + "<br>";
	} else if (type == 'Rail') {
		content += "Rail Generation: " + document.getElementById('generation').value + "<br>";
	} else if (type == 'Nozzle') {
		content += "Injector: " + document.getElementById('injector').value + "<br>";
		content += "Model Year: " + document.getElementById('model').value + "<br>";
		content += "Nozzle Type / Component: " + document.getElementById('nozzle').value + "<br>";
	} else {
		content += "Product / Component: " + document.getElementById('product').value + "<br>";
	}
	content += "Product History: " + document.getElementById('product history').value + "<br>";

	content += '<h5> Shipping Info </h5>'
	content += "Number of Parts: " + document.getElementById('number parts').value + "<br>";
	content += "Shipping Date: " + document.getElementById('ship date').value + "<br>";
	content += "Delivery Method: " + document.getElementById('delivery method').value + "<br>";
	content += "Tracking Number: " + document.getElementById('tracking number').value + "<br>";

	if (type == 'Injector' || type == 'Nozzle') {
		content += '<h5> Technical Details </h5>'
		content += "Vehicle / Engine Type: " + document.getElementById('vehicle engine type').value + "<br>";
		content += "Vehicle ID: " + document.getElementById('vin').value + "<br>";
		content += "Engine number: " + document.getElementById('enginenr').value + "<br>";
		content += "Runtime: " + document.getElementById('runtime').value + " " + document.getElementById('runtime unit').value + "<br>";
		content += "Fuel Type: " + document.getElementById('fuel type').value + "<br>";
		content += "Disposition of Parts: " + document.getElementById('disposition parts').value + "<br>";

		if (type == 'Nozzle') {
			content += "BIMS number: " + document.getElementById('bims').value + "<br>";
		}

		// Grab Data from Table and convert each row into a string
		var table = document.getElementById('component table');
		var tableRowLength = table.rows.length;
		for (i = 1; i < tableRowLength; i++) {
			var rowContent = "Table Entry " + i + " : ";
			var rowCells = table.rows.item(i).cells;
			var rowCellLength = rowCells.length;
			for (j = 0; j < rowCellLength; j++) {
				rowContent += rowCells.item(j).firstChild.firstChild.value + " | " ;
			}
			content += rowContent + "<br>";
		}
	} else if (type == 'Rail') {
		content += '<h5> Technical Details </h5>';
		content += "System Pressure: " + document.getElementById('pressure').value + "<br>";
		content += "Disposition of Parts: " + document.getElementById('disposition parts').value + "<br>";

		// Grab Data from Table and convert each row into a string
		var table = document.getElementById('component table');
		var tableRowLength = table.rows.length;
		for (i = 1; i < tableRowLength; i++) {
			var rowContent = "Table Entry " + i + " : ";
			var rowCells = table.rows.item(i).cells;
			var rowCellLength = rowCells.length;
			for (j = 0; j < rowCellLength; j++) {
				if (j == 1 || j == 2 || j == 7) {
					rowContent += rowCells.item(j).firstChild.lastChild.value + " | " ;
				} else {
					rowContent += rowCells.item(j).firstChild.firstChild.value + " | " ;
				}
			}
			content += rowContent + "<br>";
		}
	} else if (type == 'Pump') {
		content += '<h5> Technical Details </h5>';
		content += "Vehicle ID: " + document.getElementById('vin').value + "<br>";
		content += "Engine number: " + document.getElementById('enginenr').value + "<br>";
		content += "System Pressure: " + document.getElementById('pressure').value + "<br>";
		content += "Fuel Type: " + document.getElementById('fuel type').value + "<br>";
		content += "Disposition of Parts: " + document.getElementById('disposition parts').value + "<br>";

		// Grab Data from Table and convert each row into a string
		var table = document.getElementById('component table');
		var tableRowLength = table.rows.length;
		for (i = 1; i < tableRowLength; i++) {
			var rowContent = "Table Entry " + i + " : ";
			var rowCells = table.rows.item(i).cells;
			var rowCellLength = rowCells.length;
			for (j = 0; j < rowCellLength; j++) {
				if (j == 1 || j == 2 || j == 7) {
					rowContent += rowCells.item(j).firstChild.lastChild.value + " | " ;
				} else {
					rowContent += rowCells.item(j).firstChild.firstChild.value + " | " ;
				}
			}
			content += rowContent + "<br>";
		}
	} else {
		content += '<h5> Technical Details </h5>'
		content += "Disposition of Parts: " + document.getElementById('disposition parts').value + "<br>";

		// Grab Data from Table and convert each row into a string
		var table = document.getElementById('component table');
		var tableRowLength = table.rows.length;
		for (i = 1; i < tableRowLength; i++) {
			var rowContent = "Table Entry " + i + " : ";
			var rowCells = table.rows.item(i).cells;
			var rowCellLength = rowCells.length;
			for (j = 0; j < rowCellLength; j++) {
				rowContent += rowCells.item(j).firstChild.firstChild.value + " | " ;
			}
			content += rowContent + "<br>";
		}
		content += "Additional technical Details: " + document.getElementById('additional info').value + "<br>";
	}

	summary.innerHTML = content;

	appendBR(summary);
	appendTextArea(summary, "comment", "Optional Comment", "Would you like to add any additional information about this request?");
	if (type == 'Injector' ) { appendFunctionButton(summary, "Submit Request", "submitRequestInjector()"); }
	else if (type == 'Rail' ) { appendFunctionButton(summary, "Submit Request", "submitRequestRail()"); }
	else if (type == 'Nozzle' ) { appendFunctionButton(summary, "Submit Request", "submitRequestNozzle()"); }
	else if (type == 'Pump' ) { appendFunctionButton(summary, "Submit Request", "submitRequestPump()"); }
	else { appendFunctionButton(summary, "Submit Request", "submitRequestDefault()"); }
	appendFunctionButton(summary, "Return to Landing Page", "loadIndex()");
	appendFunctionButton(summary, "Jump to Dashboard", "loadDashboard()");

	var inputDiv = document.getElementById('requestDiv');
	inputDiv.appendChild(summary);
}

// Extracts the data from the input form and creates a POST to the server
// containing the data formatted as JSON. Extracts the id from the response and passes it to the user.
function submitRequestInjector() {
	// evaluate component/cylinder table
	var table = document.getElementById('component table');
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
	var projecttype = document.getElementById('projecttype').value;
	// Configure Reaction to Response
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 201) {
			var data = JSON.parse(this.responseText);
			document.getElementById('Submit Request').setAttribute('disabled', '');
			document.getElementById('Submit Request').firstChild.innerHTML = 'Submitted Successfully';
			createSuccessBanner(document.getElementById('requestDiv'), 'rsuccess', 'The request was successfully submitted, TLR-ID: ' + data.tlrid);
		}
		if (this.status == 400) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: Faulty values submitted, no Request was created');}
		if (this.status == 401) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: No authenticated User was found');}
		if (this.status == 500) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: Internal Server Error');}
	};
	xhr.open("POST", window.apiRoute + '/request/injector', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	// Grab Data from Forms and attach it to request
	xhr.send(JSON.stringify({
		generation: document.getElementById('generation').value,
		product: document.getElementById('product').value,
		customer: document.getElementById("customer").value,
		customerproject: document.getElementById('customer project').value,
		rinfo: document.getElementById('request info').value,
		testtype: document.getElementById('test type').value,
		specifications: document.getElementById('specifications').value,
		rhistory: document.getElementById('product history').value,
		pnumber: document.getElementById('number parts').value,
		rtype: document.getElementById('projecttype').value,
		shipdate: document.getElementById('ship date').value,
		deliverymethod: document.getElementById('delivery method').value,
		trackingnumber: document.getElementById('tracking number').value,
		vetype: document.getElementById('vehicle engine type').value,
		vin: document.getElementById('vin').value,
		enginenr: document.getElementById('enginenr').value,
		runtimeunit: document.getElementById('runtime unit').value,
		runtime: document.getElementById('runtime').value,
		fuel: document.getElementById('fuel type').value,
		disposition: document.getElementById('disposition parts').value,
		cylinders: cylinderJSON,
		rcomment: document.getElementById('comment').value
	}));
}

// Extracts the data from the input form and creates a POST to the server
// containing the data formatted as JSON. Extracts the id from the response and passes it to the user.
function submitRequestRail() {
	// evaluate rail component table
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
	componentJSON += "]"

	var xhr = new XMLHttpRequest();
	// Configure Reaction to Response
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 201) {
			var data = JSON.parse(this.responseText);
			document.getElementById('Submit Request').setAttribute('disabled', '');
			document.getElementById('Submit Request').firstChild.innerHTML = 'Submitted Successfully';
			createSuccessBanner(document.getElementById('requestDiv'), 'rsuccess', 'The request was successfully submitted, TLR-ID: ' + data.tlrid);
		}
		if (this.status == 400) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: Faulty values submitted, no Request was created');}
		if (this.status == 401) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: No authenticated User was found');}
		if (this.status == 500) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: Internal Server Error');}
	};
	xhr.open("POST", window.apiRoute + '/request/rail', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	// Grab Data from Forms and attach it to request
	xhr.send(JSON.stringify({
		generation: document.getElementById('generation').value,
		customer: document.getElementById("customer").value,
		customerproject: document.getElementById('customer project').value,
		rinfo: document.getElementById('request info').value,
		specifications: document.getElementById('specifications').value,
		rhistory: document.getElementById('product history').value,
		pnumber: document.getElementById('number parts').value,
		rtype: document.getElementById('projecttype').value,
		shipdate: document.getElementById('ship date').value,
		deliverymethod: document.getElementById('delivery method').value,
		trackingnumber: document.getElementById('tracking number').value,
		pressure: document.getElementById('pressure').value,
		disposition: document.getElementById('disposition parts').value,
		components: componentJSON,
		rcomment: document.getElementById('comment').value
	}));
}

// Extracts the data from the input form and creates a POST to the server
// containing the data formatted as JSON. Extracts the id from the response and passes it to the user.
function submitRequestNozzle() {
	// evaluate component/cylinder table
	var table = document.getElementById('component table');
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
	// Configure Reaction to Response
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 201) {
			var data = JSON.parse(this.responseText);
			document.getElementById('Submit Request').setAttribute('disabled', '');
			document.getElementById('Submit Request').firstChild.innerHTML = 'Submitted Successfully';
			createSuccessBanner(document.getElementById('requestDiv'), 'rsuccess', 'The request was successfully submitted, TLR-ID: ' + data.tlrid);
		}
		if (this.status == 400) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: Faulty values submitted, no Request was created');}
		if (this.status == 401) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: No authenticated User was found');}
		if (this.status == 500) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: Internal Server Error');}
	};
	xhr.open("POST", window.apiRoute + '/request/nozzle', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	// Grab Data from Forms and attach it to request
	xhr.send(JSON.stringify({
		injector: document.getElementById('injector').value,
		model: document.getElementById('model').value,
		nozzle: document.getElementById('nozzle').value,
		customer: document.getElementById("customer").value,
		customerproject: document.getElementById('customer project').value,
		rinfo: document.getElementById('request info').value,
		testtype: document.getElementById('test type').value,
		specifications: document.getElementById('specifications').value,
		rhistory: document.getElementById('product history').value,
		pnumber: document.getElementById('number parts').value,
		rtype: document.getElementById('projecttype').value,
		shipdate: document.getElementById('ship date').value,
		deliverymethod: document.getElementById('delivery method').value,
		trackingnumber: document.getElementById('tracking number').value,
		vetype: document.getElementById('vehicle engine type').value,
		vin: document.getElementById('vin').value,
		enginenr: document.getElementById('enginenr').value,
		runtimeunit: document.getElementById('runtime unit').value,
		runtime: document.getElementById('runtime').value,
		fuel: document.getElementById('fuel type').value,
		disposition: document.getElementById('disposition parts').value,
		bims: document.getElementById('bims').value,
		cylinders: cylinderJSON,
		rcomment: document.getElementById('comment').value
	}));
}

// Extracts the data from the input form and creates a POST to the server
// containing the data formatted as JSON. Extracts the id from the response and passes it to the user.
function submitRequestPump() {
	// evaluate rail component table
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
	componentJSON += "]"

	var xhr = new XMLHttpRequest();
	// Configure Reaction to Response
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 201) {
			var data = JSON.parse(this.responseText);
			document.getElementById('Submit Request').setAttribute('disabled', '');
			document.getElementById('Submit Request').firstChild.innerHTML = 'Submitted Successfully';
			createSuccessBanner(document.getElementById('requestDiv'), 'rsuccess', 'The request was successfully submitted, TLR-ID: ' + data.tlrid);
		}
		if (this.status == 400) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: Faulty values submitted, no Request was created');}
		if (this.status == 401) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: No authenticated User was found');}
		if (this.status == 500) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: Internal Server Error');}
	};
	xhr.open("POST", window.apiRoute + '/request/pump', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	// Grab Data from Forms and attach it to request
	xhr.send(JSON.stringify({
		generation: document.getElementById('generation').value,
		product: document.getElementById('product').value,
		customer: document.getElementById("customer").value,
		customerproject: document.getElementById('customer project').value,
		rinfo: document.getElementById('request info').value,
		specifications: document.getElementById('specifications').value,
		rhistory: document.getElementById('product history').value,
		pnumber: document.getElementById('number parts').value,
		rtype: document.getElementById('projecttype').value,
		shipdate: document.getElementById('ship date').value,
		deliverymethod: document.getElementById('delivery method').value,
		trackingnumber: document.getElementById('tracking number').value,
		vin: document.getElementById('vin').value,
		enginenr: document.getElementById('enginenr').value,
		pressure: document.getElementById('pressure').value,
		fuel: document.getElementById('fuel type').value,
		disposition: document.getElementById('disposition parts').value,
		components: componentJSON,
		rcomment: document.getElementById('comment').value
	}));
}

// Extracts the data from the input form and creates a POST to the server
// containing the data formatted as JSON.
// Also extracts the id from the response and passes it to the user.
function submitRequestDefault() {
	// evaluate component table
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
	// Configure Reaction to Response
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 201) {
			var data = JSON.parse(this.responseText);
			document.getElementById('Submit Request').setAttribute('disabled', '');
			document.getElementById('Submit Request').firstChild.innerHTML = 'Submitted Successfully';
			createSuccessBanner(document.getElementById('requestDiv'), 'rsuccess', 'The request was successfully submitted, TLR-ID: ' + data.tlrid);
		}
		if (this.status == 400) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: Faulty values submitted, no Request was created');}
		if (this.status == 401) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: No authenticated User was found');}
		if (this.status == 500) {createErrorBanner(document.getElementById('requestDiv'), 'rfailure', 'Error: Internal Server Error');}
	};
	xhr.open("POST", window.apiRoute + '/request/default', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	// Grab Data from Forms and attach it to request
	xhr.send(JSON.stringify({
		category: document.getElementById('type').value,
		product: document.getElementById('product').value,
		customer: document.getElementById("customer").value,
		customerproject: document.getElementById('customer project').value,
		rinfo: document.getElementById('request info').value,
		specifications: document.getElementById('specifications').value,
		rhistory: document.getElementById('product history').value,
		pnumber: document.getElementById('number parts').value,
		rtype: document.getElementById('projecttype').value,
		shipdate: document.getElementById('ship date').value,
		deliverymethod: document.getElementById('delivery method').value,
		trackingnumber: document.getElementById('tracking number').value,
		additionalinfo: document.getElementById('additional info').value,
		disposition: document.getElementById('disposition parts').value,
		components: componentJSON,
		rcomment: document.getElementById('comment').value
	}));
}
