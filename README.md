## Orion
### Laboratory Management Database
#### Currently maintained by Paul Goebel (GPB9FE)

This repository contains Orion, a Laboratory Management Database (LMD) created in cooperation with PS-DP/ENP1-NA. 

This Project aims to create a simple REST-Service using Node.js to allow the creation and management of requests in a database.
In Addition, the formerly seperated UI-Project has been integrated, meaning that this project also provides the required
resources to serve and display the web-based user interface.

Ths project requires: Node.Js, Express, PostgreSQL 13

#### Node.js Setup
This Project requires Node.Js 14, please download it from [here](https://nodejs.org/en/) and run the installer. 
Next, navigate to your local copy of this repository and run `npm install` to download all dependencies of this project.

#### Database Setup
The first step in setting up the PostgreSQL Database is creating a new User/Role that will be used by the API to run SQL-Queries. 
When creating the User, use the following parameters:
- Name and Password as specified in your .env
- Can Login: yes
- Can Create Database
Next, you need to run the Commands in setup.sql as the new User to create the required tables.

#### Enviromental Variables
A .env file directly in the project folder (next to package.json, ...) is used to store central variables like portnumbers. It has to contain:
- HOST (domain of the api, e.g. localhost)
- PORTNR (port of the api)
- SERVERPATH (absolute path to this folder)
- SESSIONSECRET (secret for session-cookie signatures)
- DBUSER (name of the PostgreSQL User of this project)
- DBHOST (domain of the database, e.g. localhost)
- DBNAME (name of the database, default: orion)
- DBPW (password of the PostgreSQL User of this project9
- DBPORT (port of the database)

Additionally, in the script folder, a global.js is used for global variables in the vanilla JS:
- window.apiRoute (http://domain:port)

#### Imports and Dependencies
Currently, the project uses the following node.js imports:
- [bcrypt](https://www.npmjs.com/package/bcrypt) Version: ^5.0.1,
- [body-parser](https://www.npmjs.com/package/body-parser) Version: ^1.19.0
- [compression](https://www.npmjs.com/package/compression) Version: ^1.7.4
- [connect-pg-simple](https://www.npmjs.com/package/connect-pg-simple) Version: ^6.2.1
- [cors](https://www.npmjs.com/package/cors) Version: ^2.8.5
- [dotenv](https://www.npmjs.com/package/dotenv) Version: ^10.0.0
- [exceljs](https://www.npmjs.com/package/exceljs) Version: ^4.2.1
- [express](https://www.npmjs.com/package/express) Version: ^4.17.1
- [express-fileupload](https://www.npmjs.com/package/express-fileupload) Version: ^1.2.1
- [express-session](https://www.npmjs.com/package/express-session) Version: ^1.17.2
- [pg](https://www.npmjs.com/package/pg) Version: ^8.6.0
- [serve-favicon](https://www.npmjs.com/package/serve-favicon) Version: ^2.5.0

Aside from these, the following libraries are in the script-folder:
- jsPDF (UMD module format, version 2.3.1) [GitHub Repository](https://github.com/MrRio/jsPDF)
- html2canvas (needed for jspdf) (version 1.1.2) [GitHub Repository](https://github.com/niklasvh/html2canvas)