/*     
    Summary: 
    Provides functionality to allow for login and page redirection.
   
    Copyright:         Robert Bosch GmbH, 2021
	Author:			   Paul Göbel
 */
 
function redirectRegistration(){ window.location.href = "registration.html"; }

function redirectRequest() { window.location.href = "request.html"; }

function redirectDashboard() { window.location.href = "dashboard.html"; }

function redirectAdmin() { window.location.href = "admin.html"; }

function redirectProfile() { window.location.href = "profile.html"; }

function redirectStatusBoard() { window.location.href = "statusboard.html"; }

function loadLandingPageText(){
	var main = document.getElementById('main');
	
	var xhr = new XMLHttpRequest();
	// Configure Reaction to Response
	xhr.onreadystatechange = function () {
		if (this.readyState != 4 || this.status != 200) return;
		var content = JSON.parse(xhr.responseText);
		main.innerHTML += '<h2>' + content[0].heading + '</h2>';
		main.innerHTML += '<h4>' + content[0].subheading + '</h4>';
		main.innerHTML += '<h5>' + content[0].warningheading + '</h5>';
		main.innerHTML += '<p>' + content[0].paragraph1 + '</p>';
		main.innerHTML += '<p>' + content[0].paragraph2 + '</p>';
	};
	
	// send get request to delete session data
	xhr.open("GET", window.apiRoute + '/data/landingpage', true);
	xhr.send(null);
}

function logoutredirected() {
	var xhr = new XMLHttpRequest();
	// Configure Reaction to Response
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;
			sessionStorage.removeItem('authorization');
			sessionStorage.removeItem('userid');
		if (this.status == 200) { window.location.href = "index.html"; }
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	};
	
	// send get request to delete session data
	xhr.open("GET", window.apiRoute + '/account/logout', true);
	xhr.send(null);
}

function logoutlocal() {
	var xhr = new XMLHttpRequest();
	// Configure Reaction to Response
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;
		sessionStorage.removeItem('authorization');
		sessionStorage.removeItem('userid');
		if (this.status == 200) {}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	};
	
	// send get request to delete session data
	xhr.open("GET", window.apiRoute + '/account/logout', true);
	xhr.send(null);
}
 
function login() {
	var xhr = new XMLHttpRequest();
	// Configure Reaction to Response
	xhr.onreadystatechange = function () {
		if (this.readyState != 4) return;

		if (this.status == 200) {
			sessionStorage.setItem('authorization', xhr.responseText);
			sessionStorage.setItem('userid', document.getElementById('userid').value.toUpperCase());
			showIndexMenu();
		}
		if (this.status == 400) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: User-ID or Password wrong');}
		if (this.status == 500) {createErrorBanner(document.getElementsByTagName('body')[0], 'rfailure', 'Error: Internal Server Error');}
	};
	
	xhr.open("POST", window.apiRoute + '/account/login', true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	// Grab Data from Forms and attach it to request
	xhr.send(JSON.stringify({
		userid: document.getElementById('userid').value.toUpperCase(),
		pw: document.getElementById('pw').value
	}));
}

function showIndexMenu() {
	var login = document.getElementById('login');
	login.innerHTML = "";
	
	var top_pos = 15;
	
	appendFunctionButtonSecondary(login, "Create Request", "redirectRequest()");
	document.getElementById("Create Request").setAttribute("style", "position:relative;left:10%;top:" + top_pos + "rem; width:80%");
	top_pos += 2;
	appendFunctionButtonSecondary(login, "Dashboard", "redirectDashboard()");
	document.getElementById("Dashboard").setAttribute("style", "position:relative;left:10%;top:" + top_pos + "rem; width:80%");
	top_pos += 2;
	if (sessionStorage.getItem('authorization') == '4') {
		appendFunctionButtonSecondary(login, "AdminView", "redirectAdmin()");
		document.getElementById("AdminView").setAttribute("style", "position:relative;left:10%;top:" + top_pos + "rem; width:80%");
		top_pos += 2;
	}
	appendFunctionButtonSecondary(login, "Profile", "redirectProfile()");
	document.getElementById("Profile").setAttribute("style", "position:relative;left:10%;top:" + top_pos + "rem; width:80%");
	top_pos += 2;
	appendFunctionButtonSecondary(login, "Status Board", "redirectStatusBoard()");
	document.getElementById("Status Board").setAttribute("style", "position:relative;left:10%;top:" + top_pos + "rem; width:80%");
	top_pos += 2;
	appendFunctionButtonSecondary(login, "Logout", "logoutredirected()");
	document.getElementById("Logout").setAttribute("style", "position:relative;left:10%;top:" + top_pos + "rem; width:80%");
}