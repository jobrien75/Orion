/*     
    Summary: 
    Provides functionality to allow for user registration.
   
    Copyright:         Robert Bosch GmbH, 2021
	Author:			   Paul Göbel
 */

function registerUser() {
	var pw = document.getElementById("pw").value;
	var pwc = document.getElementById("pwc").value;
	
	if (pw != pwc) {
		createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Password and ConfirmPassword do not match');
		return
	}
	
	var xhr = new XMLHttpRequest();
	// Configure Reaction to Response
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 201) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Account successfully created');}
		if (this.status == 400) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Faulty values submitted. Please check if you entered a User-Id, a Name and a valid password');}
		if (this.status == 409) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: User-ID is already in use');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	};
	
	xhr.open("POST", window.apiRoute + '/account/register', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	// Grab Data from Forms and attach it to request
	xhr.send(JSON.stringify({
		userid: document.getElementById('userid').value,
		pw: pw,
		name: document.getElementById('name').value,
		email: document.getElementById('email').value,
		phone: document.getElementById('phone').value,
		location: document.getElementById('location').value,
		department: document.getElementById('department').value
	}));
}

function loadIndex() {
	window.location.href = "index.html";
}