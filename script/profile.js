/*     
    Summary: 
    Provides functionality to allow for modification of own account
   
    Copyright:         Robert Bosch GmbH, 2021
	Author:			   Paul Göbel
 */
 
 function loadIndex() {
	window.location.href = "index.html";
}

function updatePassword() {
	var pwo = document.getElementById('pwo').value;
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
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Old password incorrect, no passwords updated');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	};
	
	xhr.open("POST", window.apiRoute + '/account/password/update', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	// Grab Data from Forms and attach it to request
	xhr.send(JSON.stringify({
		pwo: pwo,
		pwn: pwn
	}));
}

function loadPersonalDetails() {
	var xhr = new XMLHttpRequest();
	// Configure Reaction to Response
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 200) {
			var details = JSON.parse(xhr.responseText);
			document.getElementById('name').value = details[0].name;
			document.getElementById('email').value = details[0].email;
			document.getElementById('phone').value = details[0].phone;
			document.getElementById('department').value = details[0].department;
			document.getElementById('location').value = details[0].location;
		}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: No authenticated user detected');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	};
	
	xhr.open("GET", window.apiRoute + '/account/details?userid=' + sessionStorage.getItem('userid'), true);
	// Grab Data from Forms and attach it to request
	xhr.send(null);
}

function updatePersonalDetails() {
	var xhr = new XMLHttpRequest();
	// Configure Reaction to Response
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 204) {createSuccessBanner(document.getElementsByTagName('body')[0], 'rsuccess', 'Personal Details successfully updated');}
		if (this.status == 400) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: Faulty values submitted. Please check if you entered a valid text entries of less than 256 characters each');}
		if (this.status == 401) {createWarningBanner(document.getElementsByTagName('body')[0], 'rwarning', 'Error: No authenticated user detected');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	};
	
	xhr.open("PUT", window.apiRoute + '/account/details', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	// Grab Data from Forms and attach it to request
	xhr.send(JSON.stringify({
		name: document.getElementById('name').value,
		email: document.getElementById('email').value,
		phone: document.getElementById('phone').value,
		department: document.getElementById('department').value,
		location: document.getElementById('location').value
	}));
}