/*     
    Summary: 
    Provides a variety of functions to generate and append html-elements.
   
    Copyright:         Robert Bosch GmbH, 2021
	Author:			   Paul Göbel
 */

// Helper function to append a Radiobutton to the 
// parentNode under a given group (name), with a 
// label corresponding to the value.
function appendRadio(parentNode, name, label, checked){
	var div = document.createElement('div');
	if (checked) {
		div.innerHTML = '<input type="radio" checked id="'+ name + label +'" name="' + name +'" value="' + label +'"/> <label for="' + name + label +'">' + label +'</label>';
	} else {
		div.innerHTML = '<input type="radio" id="'+ name + label +'" name="' + name +'" value="' + label +'"/> <label for="' + name + label +'">' + label +'</label>';
	}
	div.setAttribute("class", "a-radio-button");
	parentNode.appendChild(div);
	parentNode.appendChild(document.createElement('br'));
}

// Helper to append a Dropdown-Menu to a given
// parentNode with the given id and label shown.
function appendDropdown(parentNode, id, label, required=false){
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	if (required) {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i> <div class="a-dropdown" style="display:inline-block; width:45rem"> <label for="' + id + '">' + label + '</label> <select id="' + id + '"> </select> </div>';
	} else {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="visibility:hidden; display:inline-block"></i> <div class="a-dropdown" style="display:inline-block; width:45rem"> <label for="' + id + '">' + label + '</label> <select id="' + id + '"> </select> </div>';
	}
	div.setAttribute('style', 'width:50rem');
	parentNode.appendChild(div);
}

// Helper to append a Dropdown-Menu to a given
// parentNode with the given id and label shown.
// Omits the option for required and does not have the corresponding indent.
function appendDropdownUnmarked(parentNode, id, label){
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	div.innerHTML = '<label for="' + id + '">' + label + '</label> <select id="' + id + '"> </select>'
	div.setAttribute('class', 'a-dropdown');
	div.setAttribute('style', 'width:50rem');
	parentNode.appendChild(div);
}

function appendSelectableDropdown(parentNode, id, label) {
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	div.innerHTML = '<div class="a-checkbox" style="display: inline-block; margin-bottom: 0rem; top:1rem" ><input type="checkbox" id="' + id + '-checkbox" /><label for="' + id + '-checkbox"></label></div><div class="a-dropdown" style="display:inline-block; width:45rem; left: 2rem"> <label for="' + id + '">' + label + '</label> <select id="' + id + '"> </select> </div>';
	div.setAttribute('style', 'width:20rem; display: inline-block; margin-right: 2.5rem');
	parentNode.appendChild(div);
}

// Helper to expand a parentNode (Dropdown-Menu),
// adding a new option with the given label/value.
function expandDropdown(parentNode, label){
	var dropdownOption = document.createElement('option');
	dropdownOption.innerHTML = label;
	dropdownOption.setAttribute('value', label);
	dropdownOption.setAttribute('id', label);
	parentNode.appendChild(dropdownOption);
}

// Helper to expand a parentNode (Dropdown-Menu),
// adding a new option with the given value, having
// a label independent of its value.
function expandDropdownSeparate(parentNode, value, label){
	var dropdownOption = document.createElement('option');
	dropdownOption.innerHTML = label;
	dropdownOption.setAttribute('value', value);
	dropdownOption.setAttribute('id', value);
	parentNode.appendChild(dropdownOption);
}

// Helper to append a Textfield-Input to the 
// parentNode with the given label displayed and 
// id assigned.
function appendText(parentNode, id, label, required=false){
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	if (required) {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i> <div class="a-text-field" style="display:inline-block; width:45rem"><label for="' + id + '">' + label + ' </label> <input type="text" id="' + id + '"  /><i class="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i> </div>';
	}
	else {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="visibility:hidden; display:inline-block"></i> <div class="a-text-field" style="display:inline-block; width:45rem"><label for="' + id + '">' + label + ' </label> <input type="text" id="' + id + '"  /><i class="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i> </div>';
	}
	div.setAttribute('style', 'width:50rem');
	parentNode.appendChild(div);
}

function appendSelectableText(parentNode, id, label) {
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	div.innerHTML = '<div class="a-checkbox" style="display: inline-block; margin-bottom: 0rem; top:1rem" ><input type="checkbox" id="' + id + '-checkbox" /><label for="' + id + '-checkbox"></label></div><div class="a-text-field" style="display:inline-block; width:45rem; left: 2rem"><label for="' + id + '">' + label + ' </label> <input type="text" id="' + id + '"  /><i class="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i> </div>';
	div.setAttribute('style', 'width:20rem; display: inline-block; margin-right: 2.5rem');
	parentNode.appendChild(div);
}

// Helper to append a Textfield-Input for emails to the 
// parentNode with the given label displayed and 
// id assigned.
function appendEmail(parentNode, id, label, required=false){
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	if (required) {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i> <div class="a-text-field" style="display:inline-block; width:45rem"><label for="' + id + '">' + label + ' </label> <input type="email" required="true" id="' + id + '"  /><i class="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i> </div>';
	}
	else {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="visibility:hidden; display:inline-block"></i> <div class="a-text-field" style="display:inline-block; width:45rem"><label for="' + id + '">' + label + ' </label> <input type="email" required="true" id="' + id + '"  /><i class="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i> </div>';
	}
	div.setAttribute('style', 'width:50rem');
	parentNode.appendChild(div);
}

// Helper to append a Textfield-Input to the 
// parentNode with the given label displayed and 
// id assigned.
// This is a specialized version that accepts an 
// additional parameter containing a default value.
function appendTextPrefilled(parentNode, id, label, fill, required=false) {
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	if (required) {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i> <div class="a-text-field" style="display:inline-block; width:45rem"><label for="' + id + '">' + label + '</label> <input type="text" id="' + id +'" value="' + fill + '" /> </div>';
	}
	else {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="visibility:hidden; display:inline-block"></i> <div class="a-text-field" style="display:inline-block; width:45rem"><label for="' + id + '">' + label + '</label> <input type="text" id="' + id +'" value="' + fill + '" /> </div>';
	}
	div.setAttribute('style', 'width:50rem');
	parentNode.appendChild(div);
}

// Helper to append a Numerical-Input to the 
// parentNode with the given label displayed and 
// id assigned.
function appendValue(parentNode, id, label, required=false) {
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	if (required) {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i> <div class="a-value-modificator" style="display:inline-block; width:45rem"><label for="' + id + '">' + label + '</label><input type="number" min="0" step="1" id="' + id +'" /><i class="a-icon a-value-modificator__icon a-value-modificator__minus-icon boschicon-bosch-ic-less-minimize" title="decrease value"></i><i class="a-icon a-value-modificator__icon a-value-modificator__plus-icon boschicon-bosch-ic-add" title="increase value"></i> </div>';
	}
	else {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="visibility:hidden; display:inline-block"></i>  <div class="a-value-modificator" style="display:inline-block; width:45rem"><label for="' + id + '">' + label + '</label><input type="number" min="0" step="1" id="' + id +'" /><i class="a-icon a-value-modificator__icon a-value-modificator__minus-icon boschicon-bosch-ic-less-minimize" title="decrease value"></i><i class="a-icon a-value-modificator__icon a-value-modificator__plus-icon boschicon-bosch-ic-add" title="increase value"></i> </div>';
	}
	div.lastChild.children[2].onclick = function() {
		if (this.parentElement.children[1].value != undefined && this.parentElement.children[1].value != "") {
			this.parentElement.children[1].value = parseInt(this.parentElement.children[1].value) - 1;
		} else {
			this.parentElement.children[1].value = -1;
		}
	}
	div.lastChild.children[3].onclick = function() {
		if (this.parentElement.children[1].value != undefined && this.parentElement.children[1].value != "") {
			this.parentElement.children[1].value = parseInt(this.parentElement.children[1].value) + 1;
		} else {
			this.parentElement.children[1].value = 1;
		}
	}
	div.setAttribute('style', 'width:50rem; margin:0rem; margin-bottom:1.5rem;');
	parentNode.appendChild(div);	
}

// Helper to append a Numerical-Input to the 
// parentNode with the given label displayed and 
// id assigned.
// This is a specialized version that accepts an 
// additional parameter containing a default value.
function appendValuePrefilled(parentNode, id, label, fill, required=false) {
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	if (required) {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i> <div class="a-value-modificator" style="display:inline-block; width:45rem"><label for="' + id + '">' + label + '</label><input type="number" min="0" step="1" id="' + id +'" value="' + fill + '" /><i class="a-icon a-value-modificator__icon a-value-modificator__minus-icon boschicon-bosch-ic-less-minimize" title="decrease value"></i><i class="a-icon a-value-modificator__icon a-value-modificator__plus-icon boschicon-bosch-ic-add" title="increase value"></i> </div>';
	}
	else {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="visibility:hidden; display:inline-block"></i> <div class="a-value-modificator" style="display:inline-block; width:45rem"><label for="' + id + '">' + label + '</label><input type="number" min="0" step="1" id="' + id +'" value="' + fill + '" /><i class="a-icon a-value-modificator__icon a-value-modificator__minus-icon boschicon-bosch-ic-less-minimize" title="decrease value"></i><i class="a-icon a-value-modificator__icon a-value-modificator__plus-icon boschicon-bosch-ic-add" title="increase value"></i> </div>';
	}
	div.lastChild.children[2].onclick = function() {
		if (this.parentElement.children[1].value != undefined && this.parentElement.children[1].value != "") {
			this.parentElement.children[1].value = parseInt(this.parentElement.children[1].value) - 1;
		} else {
			this.parentElement.children[1].value = -1;
		}
	}
	div.lastChild.children[3].onclick = function() {
		if (this.parentElement.children[1].value != undefined && this.parentElement.children[1].value != "") {
			this.parentElement.children[1].value = parseInt(this.parentElement.children[1].value) + 1;
		} else {
			this.parentElement.children[1].value = 1;
		}
	}
	div.setAttribute('style', 'width:50rem; margin:0rem; margin-bottom:1.5rem;');
	parentNode.appendChild(div);	
}

// Helper to append a Datepicker-Input to the 
// parentNode with the given label displayed and 
// id assigned.
function appendDate(parentNode, id, label, required=false){
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	if (required) {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i> <div class="a-text-field" style="display:inline-block; width:45rem"><label for="userid">' + label + ' </label> <input type="date" required="true" id="' + id + '"  /><i class="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i> </div>';
	}
	else {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="visibility:hidden; display:inline-block"></i> <div class="a-text-field" style="display:inline-block; width:45rem"><label for="userid">' + label + ' </label> <input type="date" required="true" id="' + id + '"  /><i class="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i> </div>';
	}
	div.setAttribute('style', 'width:50rem');
	parentNode.appendChild(div);
}

function appendSelectableDate(parentNode, id, label) {
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	div.innerHTML = '<div class="a-checkbox" style="display: inline-block; margin-bottom: 0rem; top:1rem" ><input type="checkbox" id="' + id + '-checkbox" /><label for="' + id + '-checkbox"></label></div><div class="a-text-field" style="display:inline-block; width:45rem; left: 2rem"><label for="userid">' + label + ' </label> <input type="date" required="true" id="' + id + '"  /><i class="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i> </div>';
	div.setAttribute('style', 'width:20rem; display: inline-block; margin-right: 2.5rem');
	parentNode.appendChild(div);
}

// Helper to append a Datepicker-Input to the 
// parentNode with the given label displayed and 
// id assigned.
// This is a specialized version that accepts an 
// additional parameter containing a default value.
function appendDatePrefilled(parentNode, id, label, fill, required=false){
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	if (required) {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i> <div class="a-text-field" style="display:inline-block; width:45rem"><label for="userid">' + label + ' </label> <input type="date" required="true" id="' + id + '" value="' + fill + '" /><i class="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i> </div>';
	}
	else {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="visibility:hidden; display:inline-block"></i> <div class="a-text-field" style="display:inline-block; width:45rem"><label for="userid">' + label + ' </label> <input type="date" required="true" id="' + id + '" value="' + fill + '" /><i class="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i> </div>';
	}
	div.setAttribute('style', 'width:50rem');
	parentNode.appendChild(div);
}

// Helper to append a Textarea-Input to the 
// parentNode with the given label displayed and 
// id assigned.
function appendTextArea(parentNode, id, label, placeholder, required=false) {
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	if (required) {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block; position: absolute; top: 35%"></i> <div class="a-text-area" style="display:inline-block; width:45rem; margin-left: 1.5rem"><label for="' + id + '">' + label + '</label><textarea id="' + id + '" placeholder="' + placeholder + '"></textarea> </div>';
	}
	else {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="visibility:hidden; display:inline-block; position: absolute; top: 35"></i> <div class="a-text-area" style="display:inline-block; width:45rem; margin-left: 1.5rem"><label for="' + id + '">' + label + '</label><textarea id="' + id + '" placeholder="' + placeholder + '"></textarea> </div>';
	}
    div.setAttribute('style', 'width:50rem; position: relative');
	parentNode.appendChild(div);
}

// Helper to append a Textarea-Input to the 
// parentNode with the given label displayed and 
// id assigned.
// This is a specialized version that accepts an 
// additional parameter containing a default value.
function appendTextAreaPrefilled(parentNode, id, label, placeholder, fill, required=false) {
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	if (required) {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block; position: absolute; top: 35%"></i> <div class="a-text-area" style="display:inline-block; width:45rem; margin-left: 1.5rem"><label for="' + id + '">' + label + '</label><textarea id="' + id + '" placeholder="' + placeholder + '">' + fill + '</textarea> </div>';
	}
	else {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="visibility:hidden; display:inline-block; position: absolute; top: 35%"></i> <div class="a-text-area" style="display:inline-block; width:45rem; margin-left: 1.5rem"><label for="' + id + '">' + label + '</label><textarea id="' + id + '" placeholder="' + placeholder + '">' + fill + '</textarea> </div>';
	}
    div.setAttribute('style', 'width:50rem; position: relative');
	parentNode.appendChild(div);
}

// Helper to append a Textfield-Input to the 
// parentNode with the given label displayed and 
// id assigned. The entered Text will only be 
// displayed as dots.
function appendPassword(parentNode, id, label, required=false){
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	if (required) {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i> <div class="a-text-field a-text-field--password" style="display:inline-block; width:45rem"><label for="pw">' + label + '</label><input type="password" pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*#?&+\\-_.])[A-Za-z\\d@$!%*#?&+\\-_.]{12,}$" title="Minimum twelve characters, at least one uppercase letter, one lowercase letter, one number and one special character" required="true" id="' + id + '" /><button type="button" class="a-text-field__icon-password"><i class="a-icon boschicon-bosch-ic-watch-on" title="Toggle"></i></button><i class="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined" title=""></i></div>';
	}
	else {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="visibility:hidden; display:inline-block"></i> <div class="a-text-field a-text-field--password" style="display:inline-block; width:45rem"><label for="pw">' + label + '</label><input type="password" pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*#?&+\\-_.])[A-Za-z\\d@$!%*#?&+\\-_.]{12,}$" title="Minimum twelve characters, at least one uppercase letter, one lowercase letter, one number and one special character" required="true" id="' + id + '" /><button type="button" class="a-text-field__icon-password"><i class="a-icon boschicon-bosch-ic-watch-on" title="Toggle"></i></button><i class="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined" title=""></i></div>';
	}
	div.lastChild.children[2].onclick = function () {
		if (this.parentElement.children[1].type == "password") {
			this.parentElement.children[1].type = "text";
			this.firstChild.className = 'a-icon ui-ic-watch-off';
		} else {
			this.parentElement.children[1].type = "password";
			this.firstChild.className = 'a-icon ui-ic-watch-on';
		}
	}
	div.setAttribute('style', 'width:50rem');
	parentNode.appendChild(div);
}

// Helper to append a Fie-Input to the 
// parentNode with the given label displayed and 
// id assigned.
function appendFile(parentNode, id, label, required=false){
	var div = document.createElement('div');
	div.setAttribute('class', 'inputwrapper');
	if (required) {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="color:#007bc0; display:inline-block"></i> <div class="a-text-field" style="display:inline-block; width:45rem"><label for="' + id + '">' + label + ' </label> <input type="file" id="' + id + '"  name="' + id + '"/><i class="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i> </div>';
	}
	else {
		div.innerHTML = '<i class="a-icon boschicon-bosch-ic-dot" title="Required" style="visibility:hidden; display:inline-block"></i> <div class="a-text-field" style="display:inline-block; width:45rem"><label for="' + id + '">' + label + ' </label> <input type="file" id="' + id + '"  name="' + id + '"/><i class="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i> </div>';
	}
	div.setAttribute('style', 'width:50rem');
	parentNode.appendChild(div);
}

// Helper to append a heading of the specified size
// to a parentNode, showing the text given in content.
function appendHeading(parentNode, size, content){
	var headline = document.createElement('h'+size);
	headline.innerHTML = content;
	headline.setAttribute('id', content);
	parentNode.appendChild(headline);
}

// Helper to append a parapgraph
// to a parentNode, showing the text given in content.
function appendParagraph(parentNode, id, content) {
	var par = document.createElement('p');
	par.setAttribute('id', id);
	par.innerHTML = content;
	parentNode.appendChild(par);
}

// Helper to append a linebreak to a parentNode.
function appendBR(parentNode){
	parentNode.appendChild(document.createElement('br'));
}

// Helper to append a primary button to a parentNode, 
// calling the specified function on a click.
function appendFunctionButton(parentNode, label, functionName) {
	var funcButton = document.createElement('button');
	funcButton.innerHTML = '<div class="a-button__label">' + label +'</div>';
	funcButton.setAttribute('type', 'button');
	funcButton.setAttribute('class', 'a-button a-button--primary -without-icon');
	funcButton.setAttribute('style', 'margin-right:1rem; margin-bottom:1.5rem');
	funcButton.setAttribute('onclick', functionName);
	funcButton.setAttribute('id', label);
	parentNode.appendChild(funcButton);
}

// Helper to append a secondary button to a parentNode, 
// calling the specified function on a click.
function appendFunctionButtonSecondary(parentNode, label, functionName) {
	var funcButton = document.createElement('button');
	funcButton.innerHTML = '<div class="a-button__label">' + label +'</div>';
	funcButton.setAttribute('type', 'button');
	funcButton.setAttribute('class', 'a-button a-button--secondary -without-icon');
	funcButton.setAttribute('style', 'margin-right:1rem; margin-bottom:1.5rem');
	funcButton.setAttribute('onclick', functionName);
	funcButton.setAttribute('id', label);
	parentNode.appendChild(funcButton);
}

// Helper to append an integrated button to a parentNode, 
// calling the specified function on a click.
function appendFunctionButtonIntegrated(parentNode, label, functionName) {
	var funcButton = document.createElement('button');
	funcButton.innerHTML = '<div class="a-button__label">' + label +'</div>';
	funcButton.setAttribute('type', 'button');
	funcButton.setAttribute('class', 'a-button a-button--integrated -without-icon');
	funcButton.setAttribute('style', 'margin-right:1rem; margin-bottom:1.5rem');
	funcButton.setAttribute('onclick', functionName);
	funcButton.setAttribute('id', label);
	parentNode.appendChild(funcButton);
}

// Helper to create a table with the specified id's and constructing
// the table head using the array of strings specified by headers. 
// When finished, appends the table to the parentNode.
function appendTable(parentNode, id, arialabel, headers){
	var table = document.createElement('table');
	table.setAttribute('class', 'm-table');
	table.setAttribute('aria-label', arialabel);
	table.setAttribute('id', id);
	
	var heads = '';
	headers.forEach(head => {heads += '<th class="">' + head + '</th>';})
	
	table.innerHTML = '<thead><tr>' + heads + '</tr></thead><tbody></tbody>';
	parentNode.appendChild(table);
}

// Helper to create a single table cell containing a text
// and append it to its row.
function appendTextCell(parentNode, content){
	var td = document.createElement('td');
	td.innerHTML = '<div>' + content + '</div>';
	parentNode.appendChild(td);
}

// Helper to create a single table cell containing a single checkmark icon (if checked is true)
// and append it to its row.
function appendCheckedIconCell(parentNode, checked){
	var td = document.createElement('td');
	if (checked) {
		td.innerHTML = '<i class="a-icon ui-ic-checkmark" title="checkmark"></i>';
	}
	parentNode.appendChild(td);
}

// Helper to create a single table cell containing a text input
// and append it to a table row.
function appendTextInputCell(parentNode){
	var td = document.createElement('td');
	td.setAttribute('style', 'padding:0rem');
	td.innerHTML = '<div class="a-text-field" style="margin-bottom:0rem"><input type="text"/><iclass="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i></div>';
	parentNode.appendChild(td);
}

// Helper to create a single table cell containing a prefilled text input
// and append it to a table row.
function appendTextInputCellPrefilled(parentNode, contents){
	var td = document.createElement('td');
	td.setAttribute('style', 'padding:0rem');
	td.innerHTML = '<div class="a-text-field" style="margin-bottom:0rem"><input type="text" value="' + contents + '"/><iclass="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i></div>';
	parentNode.appendChild(td);
}

// Helper to create a single table cell containing a placeholder
// and append it to a table row.
function appendTextInputCellPlaceholder(parentNode, contents){
	var td = document.createElement('td');
	td.setAttribute('style', 'padding:0rem');
	td.innerHTML = '<div class="a-text-field" style="margin-bottom:0rem"><input type="text" placeholder="' + contents + '"/><iclass="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i></div>';
	parentNode.appendChild(td);
}

// Helper to create a single table cell containing a placeholder and a prefill
// and append it to a table row.
function appendTextInputCellPlaceholderPrefilled(parentNode, placeholder, contents){
	var td = document.createElement('td');
	td.setAttribute('style', 'padding:0rem');
	td.innerHTML = '<div class="a-text-field" style="margin-bottom:0rem"><input type="text" placeholder="' + placeholder + '" value="' + contents + '"/><iclass="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i></div>';
	parentNode.appendChild(td);
}

// Helper to create a single table cell containing a date input
// and append it to a table row.
function appendDateInputCell(parentNode){
	var td = document.createElement('td');
	td.setAttribute('style', 'padding:0rem');
	td.innerHTML = '<div class="a-text-field" style="margin-bottom:0rem"><input type="date"/><iclass="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i></div>';
	parentNode.appendChild(td);
}

// Helper to create a single table cell containing a prefilled date input
// and append it to a table row.
function appendDateInputCellPrefilled(parentNode, contents){
	var td = document.createElement('td');
	td.setAttribute('style', 'padding:0rem');
	td.innerHTML = '<div class="a-text-field" style="margin-bottom:0rem"><input type="date" value="' + contents + '"/><iclass="a-text-field__icon-state a-ui-icon a-ui-icon--ui-ic-undefined"title=""></i></div>';
	parentNode.appendChild(td);
}

// Helper to create a single table cell containing a checkbox with label
// and append it to a table row.
function appendCheckboxCellPrefilled(parentNode, checked, id) {
	var td = document.createElement('td');
	td.setAttribute('style', 'padding:0rem; background-color:#e0e2e5');
	if (checked == true || checked == "true") { 
		td.innerHTML = '<div class="a-checkbox"><input type="checkbox" id="' + id + '" checked/><label for="' + id + '" style="left:40%"></label></div>';
	} else {
		td.innerHTML = '<div class="a-checkbox"><input type="checkbox" id="' + id + '"/><label for="' + id + '" style="left:40%"></label></div>';
	}
	parentNode.appendChild(td)
}

// Helper to create a single table cell containing a dropdown menu with label
// and append it to a table row.
function appendDropdownCell(parentNode, label, options) {
	var td = document.createElement('td');
	td.setAttribute('style', 'padding: 0rem');
	appendDropdownUnmarked(td, '', label);
	td.firstChild.style.width = "100%";
	td.firstChild.style.margin = "0rem";
	for (var i in options) {
		expandDropdown(td.firstChild.lastChild, options[i]);
	}
	parentNode.appendChild(td);
}

// Helper to create a single table cell containing a dropdown menu with label,
// a preselected value, and append it to a table row.
function appendDropdownCellPrefilled(parentNode, label, options, prefill) {
	var td = document.createElement('td');
	td.setAttribute('style', 'padding: 0rem');
	appendDropdownUnmarked(td, '', label);
	td.firstChild.style.width = "100%";
	td.firstChild.style.margin = "0rem";
	for (i in options) {
		expandDropdown(td.firstChild.lastChild, options[i]);
		if (options[i] == prefill) {
			td.firstChild.lastChild.lastChild.setAttribute('selected', 'true');
		}
	}
	parentNode.appendChild(td);
}

// Creates a row of text cells and fills each cell
// with the corresponding text. Appends the row to a table specified
// in parentNode.
function appendTextRow(parentNode, contents){
	var row = document.createElement('tr');
	row.innerHTML = '';
	for (let i = 0; i<contents.length; i++) {
		appendTextCell(row, contents[i]);
	}
	parentNode.childNodes[1].appendChild(row);
}

// Creates a row of cells, type depending on the entry in types, and fills each cell
// with the corresponding content. Appends the row to a table specified
// in parentNode.
function appendCustomRow(parentNode, contents, types){
	var row = document.createElement('tr');
	row.innerHTML = '';
	for (let i = 0; i<contents.length; i++) {
		if (types[i] == "t") {
			appendTextCell(row, contents[i]);
		} else if (types[i] == "cm") {
			appendCheckedIconCell(row, contents[i]);
		}
	}
	parentNode.childNodes[1].appendChild(row);
}

// Creates a row of the specified number of cells and fills each cell
// with a textfield to input data. Appends the row to a table specified
// in parentNode.
function appendTableInputRow(parentNode, length) {
	var row = document.createElement('tr');
	row.innerHTML = '';
	for (i = 0; i<length; i++) {
		appendTextInputCell(row);
	}
	parentNode.childNodes[1].appendChild(row);
}

// Creates a row of the specified number of cells and fills each cell
// with a textfield to input data, except for the 
// indext specified by datePos, which instead contains a datepicker. 
// Appends the row to a table specified in parentNode.
function appendTableInputRowWithDate(parentNode, length, datePos) {
	var row = document.createElement('tr');
	row.innerHTML = '';
	for (let i = 0; i<length; i++) {
		if (i === datePos){
			appendDateInputCell(row);
		} else {
			appendTextInputCell(row);
		}
	}
	parentNode.childNodes[1].appendChild(row);
}

// Creates a row of the specified number of cells and fills each cell
// with a textfield, datepicker or checkbox, depending on the value
// in types [t / d / c / m].
// Appends the row to a table specified in parentNode.
function appendCustomTableInputRow(parentNode, types, checkboxId=null, ddcontent=[], ddlabel=[]) {
	var row = document.createElement('tr');
	row.innerHTML = '';
	//counter for index of which array of dropdown values 
	var ddindex = 0;
	
	for (var i = 0; i < types.length; i++) {
		if (types[i] == "d"){
			appendDateInputCell(row);
		} else if (types[i] == "t") {
			appendTextInputCell(row);
		} else if (types[i] == "td") {
			appendTextInputCellPlaceholder(row, 'YYYY-MM-DD');
		} else if (types[i] == "c") {
			appendCheckboxCellPrefilled(row, false, checkboxId + i);
		} else if (types[i] == "dd") { 
			appendDropdownCell(row, ddlabel[ddindex], ddcontent[ddindex]);
			ddindex += 1;
		}
	}
	parentNode.childNodes[1].appendChild(row);
}

// Creates a row of the specified number of cells and fills each cell
// with a prefilled textfield to input data, except for the 
// indext specified by datePos, which instead contains a prefilled datepicker. 
// Appends the row to a table specified in parentNode.
function appendTableInputRowWithDatePrefilled(parentNode, contents, datePos) {
	var row = document.createElement('tr');
	row.innerHTML = '';
	for (let i = 0; i<contents.length; i++) {
		if (i === datePos){
			appendDateInputCellPrefilled(row, contents[i]);
		} else {
			appendTextInputCellPrefilled(row, contents[i]);
		}
	}
	parentNode.childNodes[1].appendChild(row);
}

// Creates a row of the specified number of cells and fills each cell
// with a prefilled textfield, datepicker or checkbox, depending on the value
// in types [t / d / c / dd].
// Appends the row to a table specified in parentNode.
function appendCustomTableInputRowPrefilled(parentNode, contents, types, checkboxId, ddlabels=[], ddcontent=[]) {
	var row = document.createElement('tr');
	row.innerHTML = '';
	
	//counter for index of which array of dropdown values 
	var ddindex = 0;
	
	for (let i = 0; i<contents.length; i++) {
		if (types[i] == "d"){
			appendDateInputCellPrefilled(row, contents[i]);
		} else if (types[i] == "t") {
			appendTextInputCellPrefilled(row, contents[i]);
		} else if (types[i] == "td") {
			appendTextInputCellPlaceholderPrefilled(row, "YYYY-MM-DD", contents[i]);
		} else if (types[i] == "c") {
			appendCheckboxCellPrefilled(row, contents[i], checkboxId + "-" + i);
		} else if (types[i] == "dd") {
			appendDropdownCellPrefilled(row, ddlabels[ddindex], ddcontent[ddindex], contents[i]);
			ddindex += 1;
		}
	}
	parentNode.childNodes[1].appendChild(row);
}

// Creates an image from an icon-file and a subtext, 
// appending it to the specified parent Node
function appendIconImage(parentNode, icon, color, title, clickable, bordered) {
	var fig = document.createElement('figure');
	fig.setAttribute('class', 'a-image');
	
	//check styles needed
	if (clickable) {
		var figstyle = "width:34%; left: 33%; position:relative; cursor: pointer";
	} else {
		var figstyle = "width:34%; left: 33%; position:relative";
	}
	if (bordered) {
		var iconstyle = "height:100%; width:100%; border:2px dashed #00884a";
	} else {
		var iconstyle = "height:100%; width:100%";
	}
	
	fig.setAttribute('style', figstyle);
	fig.setAttribute('id', 'figure-' + title);
	fig.innerHTML = '<div class="a-image__ratioWrapper"><img id="icon-' + title + '"src="../resources/icon/' + icon + '-' + color + '.svg" alt=" " style="' + iconstyle + '"/></div><figcaption style = "margin-top:0.5rem; letter-spacing:0; margin-bottom:1rem"> ' + title + ' </figcaption>';
	parentNode.appendChild(fig);
}

// Creates an image from an icon-file and a subtext, 
// appending it to the specified parent Node.
// Also has a function that is executed on click.
function appendIconImageFunction(parentNode, icon, color, title, func, clickable, bordered) {
	var fig = document.createElement('figure');
	fig.setAttribute('class', 'a-image');
	
	//check styles needed
	if (clickable) {
		var figstyle = "width:34%; left: 33%; position:relative; cursor: pointer";
	} else {
		var figstyle = "width:34%; left: 33%; position:relative";
	}
	if (bordered) {
		var iconstyle = "height:100%; width:100%; border:2px dashed #00884a";
	} else {
		var iconstyle = "height:100%; width:100%";
	}
	
	fig.setAttribute('style', figstyle);
	fig.setAttribute('id', 'figure-' + title);
	fig.setAttribute('onclick', func);
	fig.innerHTML = '<div class="a-image__ratioWrapper"><img id="icon-' + title + '"src="../resources/icon/' + icon + '-' + color + '.svg" alt=" " style="' + iconstyle +'"/></div><figcaption style = "margin-top:0.5rem; letter-spacing:0; margin-bottom:1rem"> ' + title + ' </figcaption>';
	parentNode.appendChild(fig);
}

// Creates a banner signaling a successful operation and displays it on the bottom of the screen
function createSuccessBanner(parentdiv, id, content) {
	var div = document.createElement('div');
	div.setAttribute('class', 'a-notification a-notification--banner -success');
	div.setAttribute('id', id);
	div.setAttribute('role', 'alert');
	div.style.display = 'flex';
	div.innerHTML = '<i class="a-icon ui-ic-alert-success" title="Success"></i><div class="a-notification__content">'+ content +'</div><button type="button" class="a-button a-button--integrated -without-label" data-frok-action="close" aria-label="close banner"><i class="a-icon a-button__icon ui-ic-close" title="Close"></i></button>';
	
	// make Close-Button close the banner
	div.children[2].addEventListener('click', function() {
		this.parentNode.remove();
	}, false);
					
	parentdiv.appendChild(div);
}

// Creates a banner signaling an error and displays it on the bottom of the screen
function createErrorBanner(parentdiv, id, content) {
	var div = document.createElement('div');
	div.setAttribute('class', 'a-notification a-notification--banner -error');
	div.setAttribute('id', id);
	div.setAttribute('role', 'alert');
	div.style.display = 'flex';
	div.innerHTML = '<i class="a-icon ui-ic-alert-error" title="Error"></i><div class="a-notification__content">'+ content +'</div><button type="button" class="a-button a-button--integrated -without-label" data-frok-action="close" aria-label="close banner"><i class="a-icon a-button__icon ui-ic-close" title="Close"></i></button>';
	
	// make Close-Button close the banner
	div.children[2].addEventListener('click', function() {
		this.parentNode.remove();
	}, false);
					
	parentdiv.appendChild(div);
}

// Creates a banner signaling a warning and displays it on the bottom of the screen
function createWarningBanner(parentdiv, id, content) {
	var div = document.createElement('div');
	div.setAttribute('class', 'a-notification a-notification--banner -warning');
	div.setAttribute('id', id);
	div.setAttribute('role', 'alert');
	div.style.display = 'flex';
	div.innerHTML = '<i class="a-icon ui-ic-alert-warning" title="Warning"></i><div class="a-notification__content">'+ content +'</div><button type="button" class="a-button a-button--integrated -without-label" data-frok-action="close" aria-label="close banner"><i class="a-icon a-button__icon ui-ic-close" title="Close"></i></button>';
	
	// make Close-Button close the banner
	div.children[2].addEventListener('click', function() {
		this.parentNode.remove();
	}, false);
					
	parentdiv.appendChild(div);
}

// Helper to toggle all children of the node invisible.
function hideContent(parentNode) {
	var nodes = parentNode.children;
	for(var i=0; i<nodes.length; i++) {
		nodes[i].style.display = 'none';
	}
}