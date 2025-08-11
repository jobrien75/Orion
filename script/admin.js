/*
    Summary:
    Provides administrative funtions for generated forms and dashboards

    Copyright:         Robert Bosch GmbH, 2021
	Author:			   Paul Göbel
 */

// Created functions for going to the landing page and 3 pages of the admin view
// Created functions for the various dropdown menus of the adminview pages
// DELETE USER ADDITION
// Create a function that displays the users and gives the ability to delete them
// Create a variable for the data to be inputed into
// Put a heading at the top of the doc labeled Manage Users
// Add dropdown box to show all users
// Add delete button for that function
// Add to left side of the admin page
// Fill the dropdown menus with users
// Create a function to delete the users from the database
// Prompts the user to verify that they want to delete the user
// Creates a query and removes the user from the database
//
//
//
//

function loadIndex() {
	window.location.href = "index.html";
}
function loadfrontpage() {
	window.location.href = "admin.html";
}
function loadusermngmt() {
	window.location.href = "usermngmt.html";
}
function loadtlrmngm() {
	window.location.href = "tlrmngmt.html";
}

function manageUserAuthorization() {
	// Create Dropdown-Menus and Button
	var authorizationDiv = document.createElement('div');
	appendHeading(authorizationDiv, "5", "User Authorization Levels");
	appendDropdown(authorizationDiv, 'userauth', 'Available users and their Authorization level');
	appendDropdown(authorizationDiv, 'availableauth', 'New authorization level');
	appendFunctionButtonSecondary(authorizationDiv, 'Update', 'updateAuthorization()');

	document.getElementById('adminDivLeft').appendChild(authorizationDiv);

	// Populate Dropdowns
	var userauth = document.getElementById('userauth');
	var availableauth = document.getElementById('availableauth');
	expandDropdownSeparate(availableauth, 0, 'External (0)');
	expandDropdownSeparate(availableauth, 1, 'Team Member (1)');
	expandDropdownSeparate(availableauth, 2, 'Team Leader (2)');
	expandDropdownSeparate(availableauth, 3, 'Project Leader (3)');
	expandDropdownSeparate(availableauth, 4, 'Administrator (4)');


	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
            var users = JSON.parse(xhr.responseText);
			for (i in users){
				expandDropdownSeparate(userauth,  users[i].userid, users[i].userid + ' ( ' + users[i].name + ' ) | ' + users[i].auth);
			}
		}
    }
    xhr.open("GET", window.apiRoute + '/account/authorizations', true);
    xhr.send(null);
}

function updateAuthorization() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Authorization successfully updated'); window.location.reload();}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to change user authorization');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("PUT", window.apiRoute + '/account/authorization', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		userid: document.getElementById('userauth').value,
		auth: document.getElementById('availableauth').value
	}));
}

function manageUserPasswords() {
	// Create Dropdown-Menu, Password Fields and Button
	var passwordDiv = document.createElement('div');
	appendHeading(passwordDiv, "5", "User Passwords");
	appendDropdown(passwordDiv, 'pwuserid', 'Available users');
	appendPassword(passwordDiv, "pwn", "New Password");
	appendPassword(passwordDiv, "pwc", "Confirm New Password");
	appendFunctionButtonSecondary(passwordDiv, 'Update', 'updatePassword()');

	document.getElementById('adminDivLeft').appendChild(passwordDiv);

	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
            var users = JSON.parse(xhr.responseText);
			for (i in users){
				expandDropdownSeparate(pwuserid,  users[i].userid, users[i].userid + ' ( ' + users[i].name + ' )');
			}
		}
    }
    xhr.open("GET", window.apiRoute + '/account/authorizations', true);
    xhr.send(null);
}

function manageUsers() {
	var userDiv = document.createElement('div');
	appendHeading(userDiv, "5", "Manage Users");
	appendDropdown(userDiv, 'users', 'Available Users');
	appendFunctionButtonSecondary(userDiv, 'Delete', 'deleteUsers()');

	document.getElementById('adminDivLeft').appendChild(userDiv);

	// Populate Dropdowns
	var useravail = document.getElementById('users');

	var xhr = new XMLHttpRequest();
	 xhr.onreadystatechange = function() {
		  if xhr.readyState == 4 && xhr.status == 200){
			var users = JSON.parse(xhr.responseText);
			for (i in users){
				expandDropdownSeparate(users, users[i].userid, users[i].userid + ' ( ' + users[i].name + ' );
			}
		}
	}
	xhr.open("GET", window.apiroute + '/account/authorizations', true);
	xhr.send(null);
}

function deleteUsers() { ---> NEW ADDITION
	if (confirm("Are you sure you want to delete this user?" + document.getElementById('user').value)){
		var xhr = new XMLHttpRequest();
		  xhr.onreadystatechange = function() {
			     if (this.readystate != ) return;
			     if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'User Successfully Deleted'); window.location.reload();}
			     if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
			     if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
		}
		xhr.open("DELETE", window.api + '/data/delete/customer', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			name: document.getElementById('customer').value

		}));
	}
}


function updatePassword() {
	var pwn = document.getElementById('pwn').value;
	var pwc = document.getElementById('pwc').value;

	if (pwn != pwc) {
		createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Password and ConfirmPassword do not match');
		return
	}

	var xhr = new XMLHttpRequest();
	// Configure Reaction to Response
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 201) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Password successfully updated');}
		if (this.status == 400) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Faulty values submitted. Please check if you entered a valid password');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to change passwords');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	};

	xhr.open("POST", window.apiRoute + '/account/password/change', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	// Grab Data from Forms and attach it to request
	xhr.send(JSON.stringify({
		userid: document.getElementById('pwuserid').value,
		pwn: pwn
	}));
}

function manageTeamLeader() {
	// Create Dropdown-Menus and Button
	var teamleaderDiv = document.createElement('div');
	appendHeading(teamleaderDiv, "5", "Organise Team Leaders");
	appendDropdown(teamleaderDiv, 'teamMemberUser', 'Available Users and their Team Leader');
	appendDropdown(teamleaderDiv, 'teamLeaderUser', 'Available Team Leaders');
	appendFunctionButtonSecondary(teamleaderDiv, 'Add Team Leader', 'updateTeamLeader()');
	appendFunctionButtonSecondary(teamleaderDiv, 'Remove Team Leader', 'deleteTeamLeader()');

	document.getElementById('adminDivLeft').appendChild(teamleaderDiv);

	// Populate Dropdowns
	var members = document.getElementById('teamMemberUser');
	var leaders = document.getElementById('teamLeaderUser');

	var xhrMember = new XMLHttpRequest();
    xhrMember.onreadystatechange = function() {
        if (xhrMember.readyState == 4 && xhrMember.status == 200){
            var users = JSON.parse(xhrMember.responseText);
			for (i in users){
				if (users[i].teamleaders != null && users[i].teamleaders != undefined) {
					expandDropdownSeparate(members, users[i].userid, users[i].userid + ' ( ' + users[i].name + " ) | " + users[i].teamleaders);
				} else {
					expandDropdownSeparate(members, users[i].userid, users[i].userid + ' ( ' + users[i].name + " ) | ");
				}
			}
		}
    }
    xhrMember.open("GET", window.apiRoute + '/account/teammembers', true);
    xhrMember.send(null);

	var xhrLeader = new XMLHttpRequest();
    xhrLeader.onreadystatechange = function() {
        if (xhrLeader.readyState == 4 && xhrLeader.status == 200){
            var users = JSON.parse(xhrLeader.responseText);
			for (i in users){
				expandDropdownSeparate(leaders, users[i].userid, users[i].userid + ' ( ' + users[i].name + " ) ");
			}
		}
    }
    xhrLeader.open("GET", window.apiRoute + '/account/teamleaders', true);
    xhrLeader.send(null);
}

function updateTeamLeader() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Team Leader successfully added'); window.location.reload();}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to change team leaders');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/account/assign/teamleader', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		member: document.getElementById('teamMemberUser').value,
		leader: document.getElementById('teamLeaderUser').value
	}));
}

function deleteTeamLeader() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Team Leader successfully removed'); window.location.reload();}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to change team leaders');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("DELETE", window.apiRoute + '/account/teamleaders', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		member: document.getElementById('teamMemberUser').value,
		leader: document.getElementById('teamLeaderUser').value
	}));
}

function manageRouterTemplates() {
	// Create Dropdown-Menus and Button
	var templateDiv = document.createElement('div');
	appendHeading(templateDiv, "5", "Organise Global Router Templates");
	appendDropdown(templateDiv, 'templatePersonal', 'Available Personal Templates');
	appendFunctionButtonSecondary(templateDiv, 'Add to Global Templates', 'globalizeTemplate()');
	appendDropdown(templateDiv, 'templateGlobal', 'Available Global Templates');
	appendFunctionButtonSecondary(templateDiv, 'Delete Global Template', 'deleteTemplate()');

	document.getElementById('adminDivLeft').appendChild(templateDiv);

	// Populate Dropdowns
	var personalTemplates = document.getElementById('templatePersonal');
	var globalTemplates = document.getElementById('templateGlobal');

	var xhrTemplates = new XMLHttpRequest();
    xhrTemplates.onreadystatechange = function() {
        if (xhrTemplates.readyState == 4 && xhrTemplates.status == 200){
            var templates = JSON.parse(xhrTemplates.responseText);
			for (i in templates){
				if (templates[i].templateowner == "") {
					expandDropdown(globalTemplates, templates[i].templatename);
				} else {
					expandDropdownSeparate(personalTemplates, templates[i].templatename + " | " + templates[i].templateowner, templates[i].templatename + " | " + templates[i].name);
				}
			}
		}
    }
    xhrTemplates.open("GET", window.apiRoute + '/request/progress/alltemplates', true);
    xhrTemplates.send(null);
}

function globalizeTemplate() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Router Template successfully updated'); window.location.reload();}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to change router templates');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("PUT", window.apiRoute + '/request/progress/globalizetemplate', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		templatename: document.getElementById('templatePersonal').value.split(" | ")[0],
		templateowner: document.getElementById('templatePersonal').value.split(" | ")[1]
	}));
}

function deleteTemplate() {
	if (confirm("Are you sure you want to delete the template: " + document.getElementById('templateGlobal').value)){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState != 4) return;
			if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Template successfully deleted'); window.location.reload();}
			if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
			if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify available router templates');}
			if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
		}
		xhr.open("DELETE", window.apiRoute + '/request/progress/template', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			templatename: document.getElementById('templateGlobal').value
		}));
	}
}

function manageCategories() {
	var categoryDiv = document.createElement('div');
	appendHeading(categoryDiv, "5", "Manage Request Categories");
	appendDropdown(categoryDiv, 'category', 'Available Categories');
	appendText(categoryDiv, 'newcategory', 'Create new Category: Name');
	appendFunctionButtonSecondary(categoryDiv, 'Create Category', 'createCategory()');
	appendFunctionButtonSecondary(categoryDiv, 'Delete Category', 'deleteCategory()');

	document.getElementById('adminDivLeft').appendChild(categoryDiv);

	var categoryDropdown = document.getElementById('category');
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
            var categories = JSON.parse(xhr.responseText);
			for (i in categories){
				expandDropdown(categoryDropdown, categories[i].categoryname);
			}
		}
    }
    xhr.open("GET", window.apiRoute + '/data/categories', true);
    xhr.send(null);
}

function createCategory() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Category successfully added'); window.location.reload();}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Category requires a unique name');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify available categories');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/data/new/category', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		name: document.getElementById('newcategory').value
	}));
}

function deleteCategory() {
	if (confirm("Are you sure you want to delete the category: " + document.getElementById('category').value)){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState != 4) return;
			if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Category successfully deleted'); window.location.reload();}
			if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
			if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify available categories');}
			if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
		}
		xhr.open("DELETE", window.apiRoute + '/data/delete/category', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			name: document.getElementById('category').value
		}));
	}
}

function manageCustomers() {
	var customerDiv = document.createElement('div');
	appendHeading(customerDiv, "5", "Manage Customers");
	appendDropdown(customerDiv, 'customer', 'Available Customers');
	appendText(customerDiv, 'newcustomer', 'Create new Customer: Name');
	appendFunctionButtonSecondary(customerDiv, 'Create Customer', 'createCustomer()');
	appendFunctionButtonSecondary(customerDiv, 'Delete Customer', 'deleteCustomer()');

	document.getElementById('adminDivLeft').appendChild(customerDiv);

	var customerDropdown = document.getElementById('customer');
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
            var customers = JSON.parse(xhr.responseText);
			for (i in customers){
				expandDropdown(customerDropdown, customers[i].customername);
			}
		}
    }
    xhr.open("GET", window.apiRoute + '/data/customers', true);
    xhr.send(null);
}

function createCustomer() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Customer successfully added'); window.location.reload();}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Customer requires a unique name');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify customers');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/data/new/customer', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		name: document.getElementById('newcustomer').value
	}));
}

function deleteCustomer() {
	if (confirm("Are you sure you want to delete the customer: " + document.getElementById('customer').value)){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState != 4) return;
			if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Customer successfully deleted'); window.location.reload();}
			if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
			if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify customers');}
			if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
		}
		xhr.open("DELETE", window.apiRoute + '/data/delete/customer', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			name: document.getElementById('customer').value
		}));
	}
}

function manageProjects() {
	var projectDiv = document.createElement('div');
	appendHeading(projectDiv, "5", "Manage Projects");
	appendDropdown(projectDiv, 'project', 'Available Projects');
	appendText(projectDiv, 'newrbu', 'Create new Project: RBU');
	appendText(projectDiv, 'newpdcl', 'Create new Project: PDCL');
	appendText(projectDiv, 'newmcrid', 'Create new Project: MCR-ID');
	appendText(projectDiv, 'newmcridtext', 'Create new Project: MCR-ID-Text');
	appendFunctionButtonSecondary(projectDiv, 'Create Project', 'createProject()');
	appendFunctionButtonSecondary(projectDiv, 'Delete Project', 'deleteProject()');

	document.getElementById('adminDivLeft').appendChild(projectDiv);

	var projectDropdown = document.getElementById('project');
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
            var projects = JSON.parse(xhr.responseText);
			for (i in projects){
				expandDropdownSeparate(projectDropdown, projects[i].mcrid, projects[i].mcrid + " | " + projects[i].mcridtext);
			}
		}
    }
    xhr.open("GET", window.apiRoute + '/data/projects', true);
    xhr.send(null);
}

function createProject() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Project successfully added'); window.location.reload();}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Customer requires a PDCL, unique MCR-ID and MCR-ID-Text');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify projects');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/data/new/project', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		rbu: document.getElementById('newrbu').value,
		pdcl: document.getElementById('newpdcl').value,
		mcrid: document.getElementById('newmcrid').value,
		mcridtext: document.getElementById('newmcridtext').value
	}));
}

function deleteProject() {
	if (confirm("Are you sure you want to delete the project: " + document.getElementById('project').value)){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState != 4) return;
			if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Project successfully deleted'); window.location.reload();}
			if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
			if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify projects');}
			if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
		}
		xhr.open("DELETE", window.apiRoute + '/data/delete/project', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			mcrid: document.getElementById('project').value
		}));
	}
}

function manageLogo() {
	// Create Dropdown-Menus and Button
	var logoDiv = document.createElement('div');
	appendHeading(logoDiv, "5", "Upload new Logo");
	appendFile(logoDiv, 'logo', '.jpg File');
	appendFunctionButtonSecondary(logoDiv, 'Update', 'updateLogo()');

	document.getElementById('adminDivRight').appendChild(logoDiv);
}

function updateLogo() {
	var logoInput = document.getElementById('logo');
	var logo = logoInput.files;

	var formData = new FormData();
	formData.append('logo', logo[0], logo[0].name);

	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Logo successfully updated'); window.location.reload();}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: No .jpg file uploaded');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify logo');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/data/new/logo', true);
	xhr.send(formData);
}

function manageLandingPage() {
	var landingPageDiv = document.createElement('div');
	appendHeading(landingPageDiv, "5", "Manage Landing Page");
	appendTextArea(landingPageDiv, 'landingPageHeading', 'Heading');
	appendTextArea(landingPageDiv, 'landingPageSubHeading', 'Subeading');
	appendTextArea(landingPageDiv, 'landingPageWarningHeading', 'Warning');
	appendTextArea(landingPageDiv, 'landingPageParagraph1', 'Paragraph 1');
	appendTextArea(landingPageDiv, 'landingPageParagraph2', 'Paragraph 2');
	appendFunctionButtonSecondary(landingPageDiv, 'Update Landing Page', 'updateLandingPage()');

	document.getElementById('adminDivRight').appendChild(landingPageDiv);

	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
            var content = JSON.parse(xhr.responseText);
			document.getElementById('landingPageHeading').value = content[0].heading;
			document.getElementById('landingPageSubHeading').value = content[0].subheading;
			document.getElementById('landingPageWarningHeading').value = content[0].warningheading;
			document.getElementById('landingPageParagraph1').value = content[0].paragraph1;
			document.getElementById('landingPageParagraph2').value = content[0].paragraph2;
		}
    }
    xhr.open("GET", window.apiRoute + '/data/landingpage', true);
    xhr.send(null);
}

function updateLandingPage() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Landing Page updated'); window.location.reload();}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Submitted text is too long');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify the landing page');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("PUT", window.apiRoute + '/data/landingpage', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		heading: document.getElementById('landingPageHeading').value,
		subheading: document.getElementById('landingPageSubHeading').value,
		warningheading: document.getElementById('landingPageWarningHeading').value,
		paragraph1: document.getElementById('landingPageParagraph1').value,
		paragraph2: document.getElementById('landingPageParagraph2').value
	}));
}

function manageProgressCategories() {
	var projectDiv = document.createElement('div');
	appendHeading(projectDiv, "5", "Manage Progress Groups / Categories");
	appendDropdown(projectDiv, 'progresscategory', 'Available Progress Groups / Categories');
	appendText(projectDiv, 'newprogresscategory', 'Create new Progress Group / Category: Name');
	appendText(projectDiv, 'newprogresscategoryicon', 'Create new Progress Group / Category: Icon Title (used in bosch icon font)');
	appendFunctionButtonSecondary(projectDiv, 'Create Progress Group / Category', 'createProgressCategory()');
	appendFunctionButtonSecondary(projectDiv, 'Delete Progress Group / Category', 'deleteProgressCategory()');

	document.getElementById('adminDivRight').appendChild(projectDiv);

	var categoryDropdown = document.getElementById('progresscategory');
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
            var categories = JSON.parse(xhr.responseText);
			for (i in categories){
				expandDropdown(categoryDropdown, categories[i].category);
			}
		}
    }
    xhr.open("GET", window.apiRoute + '/data/progress/categories', true);
    xhr.send(null);
}

function createProgressCategory() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Progress Group / Category successfully added'); window.location.reload();}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: A Progress Group / Category requires a unique name and an icon title');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify progress groups / categories');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/data/new/progress/category', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		category: document.getElementById('newprogresscategory').value,
		icon: document.getElementById('newprogresscategoryicon').value,
	}));
}

function deleteProgressCategory() {
	if (confirm("Are you sure you want to delete the Progress Group / Category: " + document.getElementById('progresscategory').value)){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState != 4) return;
			if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Progress Group / Category successfully deleted'); window.location.reload();}
			if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
			if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify progress groups / categories');}
			if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
		}
		xhr.open("DELETE", window.apiRoute + '/data/delete/progress/category', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			category: document.getElementById('progresscategory').value,
		}));
	}
}

function manageGenerations() {
	var generationDiv = document.createElement('div');
	appendHeading(generationDiv, "5", "Manage Product Generations");
	appendDropdown(generationDiv, 'generation', 'Available Generations');
	appendText(generationDiv, 'newgeneration', 'Create new Generation: Name');
	appendDropdown(generationDiv, 'newgenerationcategory', 'Create new Generation: Category');
	appendFunctionButtonSecondary(generationDiv, 'Create Generation', 'createGeneration()');
	appendFunctionButtonSecondary(generationDiv, 'Delete Generation', 'deleteGeneration()');

	document.getElementById('adminDivRight').appendChild(generationDiv);

	var generationDropdown = document.getElementById('generation');
	var xhrGeneration = new XMLHttpRequest();
    xhrGeneration.onreadystatechange = function() {
        if (xhrGeneration.readyState == 4 && xhrGeneration.status == 200){
            var generations = JSON.parse(xhrGeneration.responseText);
			for (i in generations){
				expandDropdown(generationDropdown, generations[i].category + " | " + generations[i].generation);
			}
		}
    }
    xhrGeneration.open("GET", window.apiRoute + '/data/generations', true);
    xhrGeneration.send(null);

	var categoryDropdown = document.getElementById('newgenerationcategory');
	var xhrCategory = new XMLHttpRequest();
    xhrCategory.onreadystatechange = function() {
        if (xhrCategory.readyState == 4 && xhrCategory.status == 200){
            var categories = JSON.parse(xhrCategory.responseText);
			for (i in categories){
				expandDropdown(categoryDropdown, categories[i].categoryname);
			}
		}
    }
    xhrCategory.open("GET", window.apiRoute + '/data/categories', true);
    xhrCategory.send(null);
}

function createGeneration() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Generation successfully added'); window.location.reload();}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Generations require a name and a category, and can not be a duplicat of an existing, identical entry.');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify generations');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/data/new/generation', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		name: document.getElementById('newgeneration').value,
		category: document.getElementById('newgenerationcategory').value,
	}));
}

function deleteGeneration() {
	if (confirm("Are you sure you want to delete the Generation: " + document.getElementById('generation').value)){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState != 4) return;
			if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Generation successfully deleted'); window.location.reload();}
			if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
			if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify generations');}
			if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
		}
		xhr.open("DELETE", window.apiRoute + '/data/delete/generation', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			name: document.getElementById('generation').value.split(' | ')[1],
			category: document.getElementById('generation').value.split(' | ')[0],
		}));
	}
}

function manageComponentGenerations() {
	var generationDiv = document.createElement('div');
	appendHeading(generationDiv, "5", "Manage Component Generations");
	appendParagraph(generationDiv, "compgenPar", "Note: These are the options selectable in component tables etc.");
	appendDropdown(generationDiv, 'compgeneration', 'Available Generations');
	appendText(generationDiv, 'newcompgenerationcomp', 'Create new Generation: Component');
	appendText(generationDiv, 'newcompgenerationname', 'Create new Generation: Generation');
	appendDropdown(generationDiv, 'newcompgenerationcategory', 'Create new Generation: Category');
	appendFunctionButtonSecondary(generationDiv, 'Create Generation', 'createCompGeneration()');
	appendFunctionButtonSecondary(generationDiv, 'Delete Generation', 'deleteCompGeneration()');

	document.getElementById('adminDivRight').appendChild(generationDiv);

	var generationDropdown = document.getElementById('compgeneration');
	var xhrGeneration = new XMLHttpRequest();
    xhrGeneration.onreadystatechange = function() {
        if (xhrGeneration.readyState == 4 && xhrGeneration.status == 200){
            var generations = JSON.parse(xhrGeneration.responseText);
			for (i in generations){
				expandDropdown(generationDropdown, generations[i].category + " | " + generations[i].component + " | " + generations[i].generation);
			}
		}
    }
    xhrGeneration.open("GET", window.apiRoute + '/data/componentgenerations/all', true);
    xhrGeneration.send(null);

	var categoryDropdown = document.getElementById('newcompgenerationcategory');
	var xhrCategory = new XMLHttpRequest();
    xhrCategory.onreadystatechange = function() {
        if (xhrCategory.readyState == 4 && xhrCategory.status == 200){
            var categories = JSON.parse(xhrCategory.responseText);
			for (i in categories){
				expandDropdown(categoryDropdown, categories[i].categoryname);
			}
		}
    }
    xhrCategory.open("GET", window.apiRoute + '/data/categories', true);
    xhrCategory.send(null);
}

function createCompGeneration() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Generation successfully added'); window.location.reload();}
		if (this.status == 400) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Component generations require a name, a component and a category and can not be indentical to an existing entry');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify generations');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/data/new/componentgeneration', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		name: document.getElementById('newcompgenerationname').value,
		component: document.getElementById('newcompgenerationcomp').value,
		category: document.getElementById('newcompgenerationcategory').value,
	}));
}

function deleteCompGeneration() {
	if (confirm("Are you sure you want to delete the Generation: " + document.getElementById('compgeneration').value)){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState != 4) return;
			if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Generation successfully deleted'); window.location.reload();}
			if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
			if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify generations');}
			if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
		}
		xhr.open("DELETE", window.apiRoute + '/data/delete/componentgeneration', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			name: document.getElementById('compgeneration').value.split(' | ')[2],
			component: document.getElementById('compgeneration').value.split(' | ')[1],
			category: document.getElementById('compgeneration').value.split(' | ')[0],
		}));
	}
}

function manageProjectTypes(){
	var ptypeDiv = document.createElement('div');
	appendHeading(ptypeDiv, "5", "Manage Project Types");
	appendDropdown(ptypeDiv, 'ptype', 'Available Project Types');
	appendText(ptypeDiv, 'newptype', 'Create new Project Type: Name');
	appendDropdown(ptypeDiv, 'newptypecategory', 'Create new Project Type: Category');
	appendFunctionButtonSecondary(ptypeDiv, 'Create Project Type', 'createPType()');
	appendFunctionButtonSecondary(ptypeDiv, 'Delete Project Type', 'deletePType()');

	document.getElementById('adminDivRight').appendChild(ptypeDiv);

	var ptypeDropdown = document.getElementById('ptype');
	var xhrPType = new XMLHttpRequest();
    xhrPType.onreadystatechange = function() {
        if (xhrPType.readyState == 4 && xhrPType.status == 200){
            var ptypes = JSON.parse(xhrPType.responseText);
			for (i in ptypes){
				expandDropdown(ptypeDropdown, ptypes[i].category + " | " + ptypes[i].projecttype);
			}
		}
    }
    xhrPType.open("GET", window.apiRoute + '/data/projecttypes', true);
    xhrPType.send(null);

	var categoryDropdown = document.getElementById('newptypecategory');
	var xhrCategory = new XMLHttpRequest();
    xhrCategory.onreadystatechange = function() {
        if (xhrCategory.readyState == 4 && xhrCategory.status == 200){
            var categories = JSON.parse(xhrCategory.responseText);
			for (i in categories){
				expandDropdown(categoryDropdown, categories[i].categoryname);
			}
		}
    }
    xhrCategory.open("GET", window.apiRoute + '/data/categories', true);
    xhrCategory.send(null);
}

function createPType() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Project Type successfully added'); window.location.reload();}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Project Type require a name and a category, and can not be identical to an existing project type');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify project types');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/data/new/projecttype', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		name: document.getElementById('newptype').value,
		category: document.getElementById('newptypecategory').value,
	}));
}

function deletePType() {
	if (confirm("Are you sure you want to delete the Project Type: " + document.getElementById('ptype').value)){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState != 4) return;
			if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Project Type successfully deleted'); window.location.reload();}
			if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
			if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify project types');}
			if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
		}
		xhr.open("DELETE", window.apiRoute + '/data/delete/projecttype', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			name: document.getElementById('ptype').value.split(' | ')[1],
			category: document.getElementById('ptype').value.split(' | ')[0],
		}));
	}
}

function manageProducts() {
	var productDiv = document.createElement('div');
	appendHeading(productDiv, "5", "Manage Products / Components");
	appendDropdown(productDiv, 'product', 'Available Products');
	appendText(productDiv, 'newproduct', 'Create new Product: Name');
	appendDropdown(productDiv, 'newproductcategory', 'Create new Product: Category');
	appendFunctionButtonSecondary(productDiv, 'Create Product', 'createProduct()');
	appendFunctionButtonSecondary(productDiv, 'Delete Product', 'deleteProduct()');

	document.getElementById('adminDivRight').appendChild(productDiv);

	var productDropdown = document.getElementById('product');
	var xhrProduct = new XMLHttpRequest();
    xhrProduct.onreadystatechange = function() {
        if (xhrProduct.readyState == 4 && xhrProduct.status == 200){
            var products = JSON.parse(xhrProduct.responseText);
			for (i in products){
				expandDropdown(productDropdown, products[i].category + " | " + products[i].product);
			}
		}
    }
    xhrProduct.open("GET", window.apiRoute + '/data/products', true);
    xhrProduct.send(null);

	var categoryDropdown = document.getElementById('newproductcategory');
	var xhrCategory = new XMLHttpRequest();
    xhrCategory.onreadystatechange = function() {
        if (xhrCategory.readyState == 4 && xhrCategory.status == 200){
            var categories = JSON.parse(xhrCategory.responseText);
			for (i in categories){
				expandDropdown(categoryDropdown, categories[i].categoryname);
			}
		}
    }
    xhrCategory.open("GET", window.apiRoute + '/data/categories', true);
    xhrCategory.send(null);
}

function createProduct() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Product successfully added'); window.location.reload();}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Product require a name and a category and can not be identical to an exisiting entry');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify project products');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/data/new/product', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		name: document.getElementById('newproduct').value,
		category: document.getElementById('newproductcategory').value,
	}));
}

function deleteProduct() {
	if (confirm("Are you sure you want to delete the Product: " + document.getElementById('product').value)){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState != 4) return;
			if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Product successfully deleted'); window.location.reload();}
			if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
			if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify products');}
			if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
		}
		xhr.open("DELETE", window.apiRoute + '/data/delete/product', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			name: document.getElementById('product').value.split(' | ')[1],
			category: document.getElementById('product').value.split(' | ')[0],
		}));
	}
}

function manageDisposition() {
	var dispositionDiv = document.createElement('div');
	appendHeading(dispositionDiv, "5", "Manage Disposition Options");
	appendDropdown(dispositionDiv, 'disposition', 'Available Options');
	appendText(dispositionDiv, 'newdisposition', 'Create new Disposition Option: Name');
	appendFunctionButtonSecondary(dispositionDiv, 'Create Option', 'createDisposition()');
	appendFunctionButtonSecondary(dispositionDiv, 'Delete Option', 'deleteDisposition()');

	document.getElementById('adminDivRight').appendChild(dispositionDiv);

	var dispositionDropdown = document.getElementById('disposition');
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200){
            var options = JSON.parse(xhr.responseText);
			for (i in options){
				expandDropdown(dispositionDropdown, options[i].disposition);
			}
		}
    }
    xhr.open("GET", window.apiRoute + '/data/disposition', true);
    xhr.send(null);
}

function createDisposition() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;
		if (this.status == 201) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Disposition Option successfully added'); window.location.reload();}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Disposition Option requires a unique name');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify disposition options');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
    }
    xhr.open("POST", window.apiRoute + '/data/new/disposition', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
		disposition: document.getElementById('newdisposition').value
	}));
}

function deleteDisposition() {
	if (confirm("Are you sure you want to delete the disposition option: " + document.getElementById('disposition').value)){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState != 4) return;
			if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Disposition option successfully deleted'); window.location.reload();}
			if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Missing Data');}
			if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Not authenticated / authorized to modify disposition options');}
			if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
		}
		xhr.open("DELETE", window.apiRoute + '/data/delete/disposition', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			disposition: document.getElementById('disposition').value
		}));
	}
}
