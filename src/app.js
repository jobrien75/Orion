/*     
    Summary: 
    Provides the configuration of the Webserver 
	and definition of valid routes.
   
    Copyright:         Robert Bosch GmbH, 2021
	Author:			   Paul Göbel
 */

// Import required external libraries
const express = require('express');
const expressfileupload = require('express-fileupload');
const session = require('express-session');
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const dotenv = require('dotenv').config();
const favicon = require('serve-favicon');
const path = require('path');

// Import queries.js
const db = require('./queries');

// Read IP and Port from .env
const port = process.env.PORTNR;
const ip = process.env.HOST

// Create Webserver
const app = express();

// Add bodyparser to read body of http-messages
app.use(bodyParser.json());
app.use (
	bodyParser.urlencoded({
		extended: true,
	})
);

// Add favicon
app.use(favicon(path.join(__dirname, '..', 'resources', 'icon', 'Orion.ico')))

// Enable CORS
app.use(cors());

// Enable gzip compression
app.use(compression());

// enable files upload
app.use(expressfileupload({
    createParentPath: true
}));

// Manage session
app.use(session({
	store: new pgSession({
		pool : db.pool,
		tableName : 'orion_sessions'
	}),
	secret: process.env.SESSIONSECRET, 
	name: "OrionSession",
	cookie: {
		httpOnly: false,
		sameSite: true,
		maxAge: 86400000 // 1 day, time is in miliseconds
	},
	resave: false,
	saveUninitialized: false,
}))

// Define Routes for Processing Data
app.post('/request/injector', db.createInjectorRequest);
app.post('/request/rail', db.createRailRequest);
app.post('/request/nozzle', db.createNozzleRequest);
app.post('/request/pump', db.createPumpRequest);
app.post('/request/default', db.createDefaultRequest);
app.post('/request/copy', db.copyRequest);
app.post('/request/progress/new', db.createProgressRouter);
app.post('/request/progress/copy', db.copyProgressRouter);
app.post('/request/progress/update', db.updateProgressRouter);
app.post('/request/progress/copytemplate', db.copyProgressRouterTemplate);
app.post('/request/progress/createtemplate', db.createProgressRouterTemplate);
app.post('/request/all', db.getAllRequests);

app.post('/data/new/category', db.insertCategory);
app.post('/data/new/customer', db.insertCustomer);
app.post('/data/new/project', db.insertProject);
app.post('/data/new/generation', db.insertGeneration);
app.post('/data/new/componentgeneration', db.insertComponentGeneration);
app.post('/data/new/projecttype', db.insertProjectType);
app.post('/data/new/product', db.insertProduct);
app.post('/data/new/disposition', db.insertDisposition);
app.post('/data/new/progress/category', db.insertProgressCategories);
app.post('/data/new/logo', db.changeLogo);

app.post('/account/register', db.registerUser);
app.post('/account/login', db.loginUser);
app.post('/account/assign/tlrid', db.assignAccountToTLRID);
app.post('/account/password/update', db.changePassword);
app.post('/account/password/change', db.changePasswordAdmin);
app.post('/account/assign/teamleader', db.updateAssignedTeamLeader);

app.put('/request/injector', db.updateInjectorRequest);
app.put('/request/rail', db.updateRailRequest);
app.put('/request/nozzle', db.updateNozzleRequest);
app.put('/request/pump', db.updatePumpRequest);
app.put('/request/default', db.updateDefaultRequest);
app.put('/request/progress/step', db.finishProgressStep);
app.put('/request/progress/block', db.updateProgressBlock);
app.put('/request/progress/close', db.closeRequest);
app.put('/request/progress/globalizetemplate', db.makeProgressTemplateGlobal);

app.put('/account/authorization', db.updateUserAuthorization);
app.put('/account/details', db.updateUserDetails);

app.put ('/data/landingpage', db.updateLandingPage);

app.get('/request/progress/router', db.getProgressByTLRID);
app.get('/request/progress/blockstatus', db.getBlockByTLRID);
app.get('/request/progress/summary', db.getProgressSummaryByTLRID);
app.get('/request/progress/closed', db.getClosingData);
app.get('/request/progress/templates', db.getProgressRouterTemplates);
app.get('/request/progress/alltemplates', db.getAllProgressRouterTemplates);
app.get('/request/open', db.getOpenRequests);
app.get('/request/team', db.getOpenTeamRequests);
app.get('/request/teamblocked', db.getBlockedTeamRequests);
app.get('/request/unassigned', db.getUnassignedRequests);
app.get('/request/closed', db.getClosedRequests);
app.get('/request/statusboard', db.getStatusboardRequests);
app.get('/request/tlrid', db.getRequestByTLRID);
app.get('/request/returnsheet', db.createReturnSheet);
app.get('/request/railexport', db.createRailExport);
app.get('/request/assigned', db.getAssignedAccounts);
app.get('/request/available', db.getAvailableAccounts);
app.get('/request/cylinders/tlrid', db.getCylinderByTLRID);
app.get('/request/railcomponents/tlrid', db.getRailComponentByTLRID);
app.get('/request/defaultcomponents/tlrid', db.getDefaultComponentsByTLRID);

app.get('/data/categories', db.getCategories);
app.get('/data/customers', db.getCustomers);
app.get('/data/projects', db.getProjects);
app.get('/data/generations', db.getGenerations);
app.get('/data/components', db.getComponentGenerationByCategory);
app.get('/data/componentgenerations', db.getComponentGenerationByComponent);
app.get('/data/componentgenerations/combined', db.getComponentGenerationByCategoryCombined);
app.get('/data/componentgenerations/all', db.getComponentGeneration);
app.get('/data/generations/specific', db.getSpecificGenerations);
app.get('/data/products', db.getProducts);
app.get('/data/products/specific', db.getSpecificProducts);
app.get('/data/projecttypes', db.getProjectTypes);
app.get('/data/projecttypes/specific', db.getSpecificProjectTypes);
app.get('/data/disposition', db.getDisposition);
app.get('/data/progress/categories', db.getProgressCategories);
app.get('/data/landingpage', db.getLandingPageText);

app.get('/account/logout', db.logoutUser);
app.get('/account/authorizations', db.getUserAuthorizations);
app.get('/account/teammembers', db.getTeamMembers);
app.get('/account/teamleaders', db.getTeamLeaders);
app.get('/account/details', db.getUserDetails);
app.get('/account/all', db.getAllAccounts);

app.delete('/data/delete/category', db.deleteCategory);
app.delete('/data/delete/customer', db.deleteCustomer);
app.delete('/data/delete/project', db.deleteProject);
app.delete('/data/delete/generation', db.deleteGeneration);
app.delete('/data/delete/componentgeneration', db.deleteComponentGeneration);
app.delete('/data/delete/projecttype', db.deleteProjectType);
app.delete('/data/delete/product', db.deleteProduct);
app.delete('/data/delete/disposition', db.deleteDisposition);
app.delete('/data/delete/progress/category', db.deleteProgressCategories);

app.delete('/request/progress/template', db.deleteGlobalTemplate);
app.delete('/request/progress/close', db.reopenRequest);

app.delete('/account/unassign/tlrid', db.unassignAccountToTLRID);
app.delete('/account/teamleaders', db.removeAssignedTeamLeader);

// Define Routes for static Content 
app.use('/html', express.static(process.env.SERVERPATH + '/html'));
app.use('/resources', express.static(process.env.SERVERPATH + '/resources'));
app.use('/styles', express.static(process.env.SERVERPATH + '/styles'));
app.use('/script', express.static(process.env.SERVERPATH + '/script'));

// Define Routes for static files
app.get('/data/norms/dates', (req, res) => {
  res.sendFile(process.env.SERVERPATH + '/files/ManufacturingDateNorm.pdf');
})

// Redirect requests without path to index.html
app.get('/', (req, res) => {
  res.redirect('/html/index.html');
})

// Start Webserver on port and ip from .env
app.listen(port, ip, () => {
  console.log(`LMD listening at http://${ip}:${port}`);
})