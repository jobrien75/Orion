/*
    Summary:
    Functions providing the varying business-logic needed
	for the different routes.

    Copyright:         Robert Bosch GmbH, 2021
    Version:           0.1.0
	Author:			   Paul Göbel
 */

const Pool = require('pg').Pool;
const dotenv = require('dotenv').config();
const exceljs = require('exceljs');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Setup database connections
const pool = new Pool ({
	user: process.env.DBUSER,
	host: process.env.DBHOST,
	database: process.env.DBNAME,
	password: process.env.DBPW,
	port: process.env.DBPORT,
})

// Method to create Injector Requests
const createInjectorRequest = (request, response) => {
	// Grab Data from POST
	var {generation, product, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition, cylinders, rcomment } = request.body;
	cylindersParsed = JSON.parse(cylinders);

	// Start Generating the new TLR-ID
	var tlrid = "TLR" + new Date().getFullYear().toString().substring(2,4) + "-";

	// Check for faulty variables, e.g. too long or not a number where needed
	if ( generation.length > 255 || product.length > 255 || customer.length > 255 || customerproject.length > 255 ||
	 rinfo.length > 9999 || rhistory.length > 9999 || isNaN(pnumber) || pnumber.length == 0 || rtype.length > 255 || testtype.length > 255 ||
	specifications.length > 9999 || deliverymethod.length > 255 || trackingnumber.length > 255 || vetype.length > 255 ||
	vin.length > 255 || enginenr.length > 255 || runtimeunit.length > 255 || isNaN(runtime) || runtime.length == 0 || fuel.length > 255 || disposition.length > 255 ||
	rcomment.length > 9999 ) {
		response.status(400).send('Bad Request 1');
		return
	}

	// check if required data is missing
	// check all strings
	for (let data of [generation, product, customer, customerproject, rinfo, testtype, specifications, rhistory, rtype, vetype, vin, enginenr, runtimeunit, fuel, disposition]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send('Bad Request 2');
			return
		}
	}
	// check all integers
	for (let data of [pnumber, runtime]) {
		if (data == undefined || data == null) {
			response.status(400).send('Bad Request 3');
			return
		}
	}

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Standardize Shipdate if no actual date is supplied
	if(!((new Date(shipdate)).getTime() > 0) || shipdate == undefined){
		shipdate = null;
	}

	// Insert Data for Request and generate TLR-ID
	pool.query('INSERT INTO request (tlrid, requester, opened, closed, block, rcomment, category) VALUES ((SELECT DISTINCT CASE WHEN (SELECT MAX(tlrid) FROM request WHERE SUBSTRING(tlrid from 0 for 7) = $1) IS null THEN CONCAT($1, $8::varchar) ELSE (CONCAT($1, (SELECT lpad((SUBSTRING((SELECT MAX(tlrid) FROM request WHERE substring(tlrid from 0 for 7) = $1) from 7 for 3)::integer + 1)::varchar, 3, $9)))) END), $2, $3, $4, $5, $6, $7) RETURNING tlrid', [tlrid, request.session.userid, new Date(), null, "", rcomment, 'Injector', '001', '0'], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		} else {
			tlrid = results.rows[0].tlrid
			pool.query('INSERT INTO injectorrequest (tlrid, generation, product, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)', [tlrid, generation, product, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition], (error, results) => {
				if (error) {
					// remove data already inserted in previous step
					pool.query('DELETE FROM request WHERE tlrid = $1', [tlrid], (error, results) => {
						response.status(500).send();
						console.error(error);
						return
					});
				} else {
					// Loop over each Cylinder and insert it seperately
					for (i in cylindersParsed) {
						var item = cylindersParsed[i];
						if (item[0].length > 255 || item[1].length > 255 || item[2].length > 255 || item[3].length > 255 || item[4].length > 255 || item[6].length > 255 || item[7].length > 255 || item[0] == undefined || item[0] == null || item[0] == "") {
							response.status(400).send();
							return
						} else {
							pool.query('INSERT INTO injectorcylinder (tlrid, trow, cylindernr, bpn, cpn, serialnr, plant, mdate, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [tlrid, item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7]], (error, results) => {
								if (error) {
									response.status(500).send();
									console.error(error);
									return
								}
							});
						}
					};
					response.status(201).json({ tlrid: tlrid });
				}
			});
			// automatically assign user to request if he is a team member or higher
			if (request.session.authorization >= 1) {
				pool.query('INSERT INTO requestworker (tlrid, userid) VALUES ($1, $2)', [tlrid, request.session.userid], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					}
				});
			}
		}
	});
}

// Method to create Rail request
const createRailRequest = (request, response) => {
	// Grab Data from POST
	var { generation, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, pressure, disposition, components, rcomment } = request.body;
	componentsParsed = JSON.parse(components);

	// Start generating TLR-ID
	var tlrid = "TLR" + new Date().getFullYear().toString().substring(2,4) + "-";

	// Check for faulty variables, e.g. too long or not a number where needed
	if ( tlrid.length > 255 || generation.length > 255 || customer.length > 255 || customerproject.length > 255 ||
	rinfo.length > 9999 || specifications.length > 9999 || rhistory.length > 9999 || isNaN(pnumber) || pnumber.length == 0 || rtype.length > 255 ||
	deliverymethod.length > 255 || trackingnumber.length > 255 || pressure.length > 255 ||
	disposition.length > 255 || rcomment.length > 9999 ) {
		response.status(400).send('Bad Request 1');
		return
	}

	// check if required data is missing
	// check all strings
	for (let data of [generation, customer, customerproject, rinfo, specifications, rhistory, rtype, pressure, disposition]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send('Bad Request 2');
			return
		}
	}
	// check all integers
	for (let data of [pnumber]) {
		if (data == undefined || data == null) {
			response.status(400).send('Bad Request 3');
			return
		}
	}

	// Standardize shipping date in case no actual date is supplied
	if(!((new Date(shipdate)).getTime() > 0) || shipdate == undefined){
		shipdate = null;
	}

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Insert Data for Request and generate TLR-ID
	pool.query('INSERT INTO request (tlrid, requester, opened, closed, block, rcomment, category) VALUES ((SELECT DISTINCT CASE WHEN (SELECT MAX(tlrid) FROM request WHERE SUBSTRING(tlrid from 0 for 7) = $1) IS null THEN CONCAT($1, $8::varchar) ELSE (CONCAT($1, (SELECT lpad((SUBSTRING((SELECT MAX(tlrid) FROM request WHERE substring(tlrid from 0 for 7) = $1) from 7 for 3)::integer + 1)::varchar, 3, $9)))) END), $2, $3, $4, $5, $6, $7) RETURNING tlrid', [tlrid, request.session.userid, new Date(), null, "", rcomment, 'Rail', '001', '0'], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		} else {
			tlrid = results.rows[0].tlrid
			pool.query('INSERT INTO railrequest (tlrid, generation, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, pressure, disposition) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)', [tlrid, generation, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, pressure, disposition], (error, results) => {
				if (error) {
					// remove data already inserted in previous step
					pool.qery('DELETE FROM request WHERE tlrid = $1', [tlrid], (error, results) => {
						response.status(500).send();
						console.error(error);
						return
					});
				} else {
					// Loop over each Component and insert it seperately
					for (i in componentsParsed) {
						var item = componentsParsed[i];
						if (item[0].length > 255 || item[1].length > 255 || item[2].length > 255 || item[3].length > 255 || item[5].length > 255 || item[6].length > 255 || item[7].length > 255 || item[8].length > 255 || item[0] == undefined || item[0] == null || item[0] == "") {
							response.status(400).send();
							return
						} else {
							if (item[5] == "") {item[5] = null}
							pool.query('INSERT INTO railcomponent (tlrid, trow, component, generation, partnumber, serialnumber, manufacturingdate, odometervalue, odometerunit, arrivaldate, moedate, tfrdate, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [tlrid, item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7], null, null, null, item[8]], (error, results) => {
								if (error) {
									response.status(500).send();
									console.error(error);
									return
								}
							});
						}
					};
					response.status(201).json({ tlrid: tlrid });
				}
			});
			// automatically assign user to request if he is a team member or higher
			if (request.session.authorization >= 1) {
				pool.query('INSERT INTO requestworker (tlrid, userid) VALUES ($1, $2)', [tlrid, request.session.userid], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					}
				});
			}
		}
	});
}

// Method to create Nozzle Request
const createNozzleRequest = (request, response) => {
	// Grab Data from POST
	var {injector, model, nozzle, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition, bims, cylinders, rcomment } = request.body;
	cylindersParsed = JSON.parse(cylinders);

	// Start generating TLR-ID
	var tlrid = "TLR" + new Date().getFullYear().toString().substring(2,4) + "-";

	// Check for faulty variables, e.g. too long or not a number where needed
	if ( injector.length > 255 || model.length > 255 || nozzle.length > 255 || customer.length > 255 || customerproject.length > 255 ||
	 rinfo.length > 9999 || rhistory.length > 9999 || isNaN(pnumber) || pnumber.length == 0 || rtype.length > 255 || testtype.length > 255 ||
	specifications.length > 9999 || deliverymethod.length > 255 || trackingnumber.length > 255 || vetype.length > 255 ||
	vin.length > 255 || runtimeunit.length > 255 || isNaN(runtime) || runtime.length == 0 || fuel.length > 255 || disposition.length > 255 ||
	rcomment.length > 9999 || bims.length > 255 || enginenr.length > 255) {
		response.status(400).send('Bad Request 1');
		return
	}

	// check if required data is missing
	// check all strings
	for (let data of [injector, nozzle, customer, customerproject, rinfo, testtype, specifications, rhistory, rtype, vetype, vin, enginenr, runtimeunit, fuel, disposition]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send('Bad Request 2');
			return
		}
	}
	// check all integers
	for (let data of [pnumber, runtime]) {
		if (data == undefined || data == null) {
			response.status(400).send('Bad Request 3');
			return
		}
	}

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Standardize shipping date in case no actual date is supplied
	if(!((new Date(shipdate)).getTime() > 0) || shipdate == undefined){
		shipdate = null;
	}

	// Insert Data for Request and generate TLR-ID
	pool.query('INSERT INTO request (tlrid, requester, opened, closed, block, rcomment, category) VALUES ((SELECT DISTINCT CASE WHEN (SELECT MAX(tlrid) FROM request WHERE SUBSTRING(tlrid from 0 for 7) = $1) IS null THEN CONCAT($1, $8::varchar) ELSE (CONCAT($1, (SELECT lpad((SUBSTRING((SELECT MAX(tlrid) FROM request WHERE substring(tlrid from 0 for 7) = $1) from 7 for 3)::integer + 1)::varchar, 3, $9)))) END), $2, $3, $4, $5, $6, $7) RETURNING tlrid', [tlrid, request.session.userid, new Date(), null, "", rcomment, 'Nozzle', '001', '0'], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		} else {
			tlrid = results.rows[0].tlrid;
			pool.query('INSERT INTO nozzlerequest (tlrid, injector, model, nozzle, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition, bims) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)', [tlrid, injector, model, nozzle, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition, bims], (error, results) => {
				if (error) {
					// remove data already inserted in previous step
					pool.query('DELETE FROM request WHERE tlrid = $1', [tlrid], (error, results) => {
						response.status(500).send();
						console.error(error);
						return
					});
				} else {
					// Loop over each Cylinder and insert it seperately
					for (i in cylindersParsed) {
						var item = cylindersParsed[i];
						if (item[0].length > 255 || item[1].length > 255 || item[2].length > 255 || item[3].length > 255 || item[4].length > 255 || item[6].length > 255 || item[7].length > 255 || item[0] == undefined || item[0] == null || item[0] == "") {
							response.status(400).send();
							return
						} else {
							pool.query('INSERT INTO injectorcylinder (tlrid, trow, cylindernr, bpn, cpn, serialnr, plant, mdate, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [tlrid, item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7]], (error, results) => {
									if (error) {
									response.status(500).send();
									console.error(error);
									return
								}
							});
						}
					};
					response.status(201).json({ tlrid: tlrid });
				}
			});
			// automatically assign user to request if he is a team member or higher
			if (request.session.authorization >= 1) {
				pool.query('INSERT INTO requestworker (tlrid, userid) VALUES ($1, $2)', [tlrid, request.session.userid], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					}
				});
			}
		}
	});
}

// Method to create a Pump request
const createPumpRequest = (request, response) => {
	// Grab Data from POST
	var { generation, product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vin, enginenr, pressure, fuel, disposition, components, rcomment } = request.body;
	componentsParsed = JSON.parse(components);

	// Start generating TLR-ID
	var tlrid = "TLR" + new Date().getFullYear().toString().substring(2,4) + "-";

	// Check for faulty variables, e.g. too long or not a number where needed
	if ( tlrid.length > 255 || generation.length > 255 || product.length > 255 || customer.length > 255 || customerproject.length > 255 ||
	rinfo.length > 9999 || specifications.length > 9999 || rhistory.length > 9999 || isNaN(pnumber) || pnumber.length == 0 || rtype.length > 255 ||
	deliverymethod.length > 255 || trackingnumber.length > 255 || vin.length > 255 || enginenr.length > 255 || pressure.length > 255 ||
	fuel.length > 255 || disposition.length > 255 || rcomment.length > 9999 ) {
		response.status(400).send('Bad Request 1');
		return
	}

	// check if required data is missing
	// check all strings
	for (let data of [generation, product, customer, customerproject, rinfo, specifications, rhistory, rtype, vin, enginenr, pressure, fuel, disposition]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send('Bad Request 2');
			return
		}
	}
	// check all integers
	for (let data of [pnumber]) {
		if (data == undefined || data == null) {
			response.status(400).send('Bad Request 3');
			return
		}
	}

	// Standardize shipping date in case no actual date was supplied
	if(!((new Date(shipdate)).getTime() > 0) || shipdate == undefined){
		shipdate = null;
	}

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Insert Data for Request and generate TLR-ID
	pool.query('INSERT INTO request (tlrid, requester, opened, closed, block, rcomment, category) VALUES ((SELECT DISTINCT CASE WHEN (SELECT MAX(tlrid) FROM request WHERE SUBSTRING(tlrid from 0 for 7) = $1) IS null THEN CONCAT($1, $8::varchar) ELSE (CONCAT($1, (SELECT lpad((SUBSTRING((SELECT MAX(tlrid) FROM request WHERE substring(tlrid from 0 for 7) = $1) from 7 for 3)::integer + 1)::varchar, 3, $9)))) END), $2, $3, $4, $5, $6, $7) RETURNING tlrid', [tlrid, request.session.userid, new Date(), null, "", rcomment, 'Pump', '001', '0'], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		} else {
			tlrid = results.rows[0].tlrid
			pool.query('INSERT INTO pumprequest (tlrid, generation, product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vin, enginenr, pressure, fuel, disposition) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)', [tlrid, generation, product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vin, enginenr, pressure, fuel, disposition], (error, results) => {
				if (error) {
					// remove data already inserted in previous step
					pool.qery('DELETE FROM request WHERE tlrid = $1', [tlrid], (error, results) => {
						response.status(500).send();
						console.error(error);
						return
					});
				} else {
					// Loop over each Component and insert it seperately. Use rail component table as both have same structure
					// Since rail was created long before pump, the table is now badly named and should be renamed
					for (i in componentsParsed) {
						var item = componentsParsed[i];
						if (item[0].length > 255 || item[1].length > 255 || item[2].length > 255 || item[3].length > 255 || item[5].length > 255 || item[6].length > 255 || item[7].length > 255 || item[8].length > 255 || item[0] == undefined || item[0] == null || item[0] == "") {
							response.status(400).send();
							return
						} else {
							if (item[5] == "") {item[5] = null}
							pool.query('INSERT INTO railcomponent (tlrid, trow, component, generation, partnumber, serialnumber, manufacturingdate, odometervalue, odometerunit, arrivaldate, moedate, tfrdate, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [tlrid, item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7], null, null, null, item[8]], (error, results) => {
								if (error) {
									response.status(500).send();
									console.error(error);
									return
								}
							});
						}
					};
					response.status(201).json({ tlrid: tlrid });
				}
			});
			// automatically assign user to request if he is a team member or higher
			if (request.session.authorization >= 1) {
				pool.query('INSERT INTO requestworker (tlrid, userid) VALUES ($1, $2)', [tlrid, request.session.userid], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					}
				});
			}
		}
	});
}

// Method to create a generic request
const createDefaultRequest = (request, response) => {
	// Grab Data from POST
	var {category, product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, additionalinfo, disposition, components, rcomment } = request.body;
	componentsParsed = JSON.parse(components);

	// Start generating the TLR-ID
	var tlrid = "TLR" + new Date().getFullYear().toString().substring(2,4) + "-";

	// Check for faulty variables, e.g. too long or not a number where needed
	if ( category.length > 255, product.length > 255 || customer.length > 255 || customerproject.length > 255 ||
	rinfo.length > 9999 || specifications.length > 9999 || rhistory.length > 9999 || isNaN(pnumber) || pnumber.length == 0 || rtype.length > 255 ||
	deliverymethod.length > 255 || trackingnumber.length > 255 ||
	additionalinfo.length > 9999 || disposition.length > 255 || rcomment.length > 9999 ) {
		response.status(400).send('Bad Request 1');
		return
	}

	// check if required data is missing
	// check all strings
	for (let data of [category, product, customer, customerproject, rinfo, specifications, rhistory, rtype, disposition]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send('Bad Request 2');
			return
		}
	}
	// check all integers
	for (let data of [pnumber]) {
		if (data == undefined || data == null) {
			response.status(400).send('Bad Request 3');
			return
		}
	}

	// Standardize shipping date in case no actual date was supplied
	if(!((new Date(shipdate)).getTime() > 0) || shipdate == undefined){
		shipdate = null;
	}

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Insert Data for Request and generate TLR-ID
	pool.query('INSERT INTO request (tlrid, requester, opened, closed, block, rcomment, category) VALUES ((SELECT DISTINCT CASE WHEN (SELECT MAX(tlrid) FROM request WHERE SUBSTRING(tlrid from 0 for 7) = $1) IS null THEN CONCAT($1, $8::varchar) ELSE (CONCAT($1, (SELECT lpad((SUBSTRING((SELECT MAX(tlrid) FROM request WHERE substring(tlrid from 0 for 7) = $1) from 7 for 3)::integer + 1)::varchar, 3, $9)))) END), $2, $3, $4, $5, $6, $7) RETURNING tlrid', [tlrid, request.session.userid, new Date(), null, "", rcomment, category, '001', '0'], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		} else {
			tlrid = results.rows[0].tlrid
			pool.query('INSERT INTO defaultrequest (tlrid, product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, additionalinfo, disposition) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)', [tlrid, product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, additionalinfo, disposition], (error, results) => {
				if (error) {
					// remove data already inserted in previous step
					pool.query('DELETE FROM request WHERE tlrid = $1', [tlrid], (error, results) => {
						if (error) {
							response.status(500).send();
							console.error(error);
							return
						}
					});
					response.status(500).send();
					console.error(error);
					return
				} else {
					// Loop over each Cylinder and insert it seperately
					for (i in componentsParsed) {
						var item = componentsParsed[i];
						if (item[0].length > 255 || item[1].length > 255 || item[2].length > 255 || item[3].length > 255 || item[4].length > 255 || item[6].length > 255 || item[7].length > 255 || item[0] == undefined || item[0] == null || item[0] == "") {
							response.status(400).send();
							return
						} else {
							pool.query('INSERT INTO defaultcomponent (tlrid, trow, componentnr, bpn, cpn, serialnr, plant, mdate, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [tlrid, item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7]], (error, results) => {
								if (error) {
									response.status(500).send();
									console.error(error);
									return
								}
							});
						}
					};
					response.status(201).json({ tlrid: tlrid });
				}
			});
			// automatically assign user to request if he is a team member or higher
			if (request.session.authorization >= 1) {
				pool.query('INSERT INTO requestworker (tlrid, userid) VALUES ($1, $2)', [tlrid, request.session.userid], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					}
				});
			}
		}
	});
}

// Method to copy an existing request
const copyRequest = (request, response) => {
	// Grab TLR-ID of the existing request from body
	var { copytlrid } = request.body;

	// Check if id is entered
	if (copytlrid.length == 0 || copytlrid == undefined || copytlrid == null) {
		response.status(400).send('Bad Request');
		return
	}

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	var tlrid = "TLR" + new Date().getFullYear().toString().substring(2,4) + "-";
	// Copy request table
	pool.query('INSERT INTO request(tlrid, requester, opened, closed, block, rcomment, category) SELECT (SELECT DISTINCT CASE WHEN (SELECT MAX(tlrid) FROM request WHERE SUBSTRING(tlrid from 0 for 7) = $1) IS null THEN CONCAT($1, $6::varchar) ELSE (CONCAT($1, (SELECT lpad((SUBSTRING((SELECT MAX(tlrid) FROM request WHERE substring(tlrid from 0 for 7) = $1) from 7 for 3)::integer + 1)::varchar, 3, $7)))) END), $2, $3, $4, block, rcomment, category FROM request WHERE tlrid = $5 RETURNING tlrid, category', [tlrid, request.session.userid, new Date(), null, copytlrid, '001', '0'], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		} else {
			tlrid = results.rows[0].tlrid
			category = results.rows[0].category
			// copy individual request and component table
			if (category == 'Injector') {
				pool.query('INSERT INTO injectorrequest (tlrid, generation, product, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition) SELECT $1, generation, product, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition FROM injectorrequest WHERE tlrid = $2', [tlrid, copytlrid], (error, _) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					} else {
						pool.query('INSERT INTO injectorcylinder (tlrid, trow, cylindernr, bpn, cpn, serialnr, plant, notes, mdate) SELECT $1, trow, cylindernr, bpn, cpn, serialnr, plant, notes, mdate FROM injectorcylinder WHERE tlrid = $2', [tlrid, copytlrid], (error, _) => {
							if (error) {
								response.status(500).send();
								console.error(error);
								return
							} else {
								// automatically assign user to request if he is a team member or higher
								if (request.session.authorization >= 1) {
									pool.query('INSERT INTO requestworker (tlrid, userid) VALUES ($1, $2)', [tlrid, request.session.userid], (error, results) => {
										if (error) {
											response.status(500).send();
											console.error(error);
											return
										} else {
											response.status(201).json({ tlrid: tlrid });
										}
									});
								}
							}
						});
					}
				});
			} else if (category == 'Rail') {
				pool.query('INSERT INTO railrequest (tlrid, generation, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, pressure, disposition) SELECT $1, generation, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, pressure, disposition FROM railrequest WHERE tlrid = $2', [tlrid, copytlrid], (error, _) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					} else {
						pool.query('INSERT INTO railcomponent (tlrid, component, generation, partnumber, serialnumber, odometerunit, odometervalue, arrivaldate, moedate, tfrdate, notes, trow, manufacturingdate) SELECT $1, component, generation, partnumber, serialnumber, odometerunit, odometervalue, arrivaldate, moedate, tfrdate, notes, trow, manufacturingdate FROM railcomponent WHERE tlrid = $2', [tlrid, copytlrid], (error, _) => {
							if (error) {
								response.status(500).send();
								console.error(error);
								return
							} else {
								// automatically assign user to request if he is a team member or higher
								if (request.session.authorization >= 1) {
									pool.query('INSERT INTO requestworker (tlrid, userid) VALUES ($1, $2)', [tlrid, request.session.userid], (error, results) => {
										if (error) {
												response.status(500).send();
											console.error(error);
										return
										} else {
											response.status(201).json({ tlrid: tlrid });
										}
									});
								}
							}
						});
					}
				});
			} else if (category == 'Nozzle') {
				pool.query('INSERT INTO nozzlerequest (tlrid, injector, model, nozzle, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition, bims) SELECT $1, injector, model, nozzle, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition, bims FROM nozzlerequest WHERE tlrid = $2', [tlrid, copytlrid], (error, _) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					} else {
						pool.query('INSERT INTO injectorcylinder (tlrid, trow, cylindernr, bpn, cpn, serialnr, plant, notes, mdate) SELECT $1, trow, cylindernr, bpn, cpn, serialnr, plant, notes, mdate FROM injectorcylinder WHERE tlrid = $2', [tlrid, copytlrid], (error, _) => {
							if (error) {
								response.status(500).send();
								console.error(error);
								return
							} else {
								// automatically assign user to request if he is a team member or higher
								if (request.session.authorization >= 1) {
									pool.query('INSERT INTO requestworker (tlrid, userid) VALUES ($1, $2)', [tlrid, request.session.userid], (error, results) => {
										if (error) {
											response.status(500).send();
											console.error(error);
											return
										} else {
											response.status(201).json({ tlrid: tlrid });
										}
									});
								}
							}
						});
					}
				});
			} else if (category == 'Pump') {
				pool.query('INSERT INTO pumprequest (tlrid, generation, product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vin, enginenr, pressure, fuel, disposition) SELECT $1, generation, product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vin, enginenr, pressure, fuel, disposition FROM pumprequest WHERE tlrid = $2', [tlrid, copytlrid], (error, _) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					} else {
						pool.query('INSERT INTO railcomponent (tlrid, component, generation, partnumber, serialnumber, odometerunit, odometervalue, arrivaldate, moedate, tfrdate, notes, trow, manufacturingdate) SELECT $1, component, generation, partnumber, serialnumber, odometerunit, odometervalue, arrivaldate, moedate, tfrdate, notes, trow, manufacturingdate FROM railcomponent WHERE tlrid = $2', [tlrid, copytlrid], (error, _) => {
							if (error) {
								response.status(500).send();
								console.error(error);
								return
							} else {
							// automatically assign user to request if he is a team member or higher
								if (request.session.authorization >= 1) {
									pool.query('INSERT INTO requestworker (tlrid, userid) VALUES ($1, $2)', [tlrid, request.session.userid], (error, results) => {
									if (error) {
											response.status(500).send();
											console.error(error);
											return
										} else {
											response.status(201).json({ tlrid: tlrid });
										}
									});
								}
							}
						});
					}
				});
			} else {
				pool.query('INSERT INTO defaultrequest (tlrid, product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, additionalinfo, disposition) SELECT $1, product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, additionalinfo, disposition FROM defaultrequest WHERE tlrid = $2', [tlrid, copytlrid], (error, _) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					} else {
						pool.query('INSERT INTO defaultcomponent (tlrid, componentnr, bpn, cpn, serialnr, plant, notes, mdate, trow) SELECT $1, componentnr, bpn, cpn, serialnr, plant, notes, mdate, trow FROM defaultcomponent WHERE tlrid = $2', [tlrid, copytlrid], (error, _) => {
							if (error) {
								response.status(500).send();
								console.error(error);
								return
							} else {
								// automatically assign user to request if he is a team member or higher
								if (request.session.authorization >= 1) {
									pool.query('INSERT INTO requestworker (tlrid, userid) VALUES ($1, $2)', [tlrid, request.session.userid], (error, results) => {
										if (error) {
										response.status(500).send();
											console.error(error);
											return
										} else {
											response.status(201).json({ tlrid: tlrid });
										}
									});
								}
							}
						});
					}
				});
			}
		}
	});
}


// Method to update an existing Injector Request
const updateInjectorRequest = (request, response) => {
	// Grab values from request body
	var { tlrid, userid, generation, product, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition, rcomment, cylinders } = request.body;
	var cylindersParsed = JSON.parse(cylinders);

	// Check for faulty variables, e.g. too long or not a number where needed
	if ( tlrid.length > 255 || userid.length > 255 || generation.length > 255 || product.length > 255 || customer.length > 255 || testtype.length > 255 ||
	specifications.length > 9999 || customerproject.length > 255 || rinfo.length > 9999 || rhistory.length > 9999 || isNaN(pnumber) || pnumber.length == 0 || rtype.length > 255 ||
	deliverymethod.length > 255 || trackingnumber.length > 255 || vetype.length > 255 ||
	vin.length > 255 || enginenr.length > 255 || runtimeunit.length > 255 || isNaN(runtime) || runtime.length == 0 || fuel.length > 255 || disposition.length > 255 ||
	rcomment.length > 9999 ) {
		response.status(400).send('Bad Request');
		return
	}

	// Standardize Date in case no actual date is supplied
	if(!((new Date(shipdate)).getTime() > 0) || shipdate == undefined){
		shipdate = null;
	}

	// Verify if logged in User has authorization for changes
	if (request.session.authorization == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Check if the user requesting the update is assigned to the request
	pool.query('SELECT DISTINCT request.tlrid FROM request LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid WHERE request.tlrid = $1 AND userid = $2', [tlrid, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		}
		// if the logged in user is neither the author nor assigned, deny the changes
		if (results.rows.length == 0){
			response.status(403).send();
			return
		}
		// if the logged in user is the author or authorized, process the updates
		else {
			// Update general data from request table
			pool.query('UPDATE request SET requester = $2 , rcomment = $3 WHERE tlrid = $1', [ tlrid, userid, rcomment], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				}
			})
			// Update technical data from injectorrequest table
			pool.query('UPDATE injectorrequest SET generation = $1, product = $2, customer = $3, customerproject = $4, rinfo = $5, testtype=$6, specifications=$7, rhistory = $8, pnumber = $9, rtype = $10, shipdate = $11, deliverymethod = $12, trackingnumber = $13, vetype = $14, vin = $15, enginenr = $16, runtimeunit = $17, runtime = $18, fuel = $19, disposition =$20 WHERE tlrid = $21', [generation, product, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition, tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				}
			});

			// Drop all Cylinders of this request and enter the new ones
			// this is easier than updating as we do not have to look for deleted cylinders, new ones, etc. separately
			pool.query('DELETE FROM injectorcylinder WHERE tlrid = $1', [tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				} else {
					// Loop over each Cylinder and insert
					for (i in cylindersParsed) {
						var item = cylindersParsed[i];
						if (item[0].length > 255 || item[1].length > 255 || item[2].length > 255 || item[3].length > 255 || item[4].length > 255 || item[6].length > 255 || item[7].length > 255 || item[0] == undefined || item[0] == null || item[0] == "") {
							response.status(400).send();
							return
						} else {
							pool.query('INSERT INTO injectorcylinder (tlrid, trow, cylindernr, bpn, cpn, serialnr, plant, mdate, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [tlrid, item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7]], (error, results) => {
								if (error) {
									response.status(500).send();
									console.error(error);
									return
								}
							});
						}
					};
					response.status(204).send();
				}
			});
		}
	});
}

// Update an exisiting Rail request
const updateRailRequest = (request, response) => {
	// Grab Data from POST
	var {tlrid, userid, generation, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, pressure, disposition, components, rcomment } = request.body;
	componentsParsed = JSON.parse(components);

	// Check for faulty variables, e.g. too long or not a number where needed
	if ( tlrid.length > 255 || generation.length > 255 || customer.length > 255 || customerproject.length > 255 ||
	rinfo.length > 9999 || specifications.length > 9999 || rhistory.length > 9999 || isNaN(pnumber) || pnumber.length == 0 || rtype.length > 255 ||
	deliverymethod.length > 255 || trackingnumber.length > 255 || pressure.length > 255 ||
	disposition.length > 255 || rcomment.length > 9999 ) {
		response.status(400).send('Bad Request');
		return
	}

	// Standardize shipping date in case no actual date is supplied
	if(!((new Date(shipdate)).getTime() > 0) || shipdate == undefined){
		shipdate = null;
	}

	// Verify if logged in User has authorization for changes
	if (request.session.authorization == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Check if the user requesting the update is assigned to the request
	pool.query('SELECT DISTINCT request.tlrid FROM request LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid WHERE request.tlrid = $1 AND userid = $2', [tlrid, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		}
		// if the logged in user is neither the author nor assigned, deny the changes
		if (results.rows.length == 0){
			response.status(403).send();
			return
		}
		// if the logged in user is the author or authorized, process the updates
		else {
			// Update general data from the request table
			pool.query('UPDATE request SET requester = $2 , rcomment = $3 WHERE tlrid = $1', [ tlrid, userid, rcomment], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				}
			})
			// Update technical data from the railrequest table
			pool.query('UPDATE railrequest SET generation = $1, customer = $2, customerproject = $3, rinfo = $4, specifications = $5, rhistory = $6, pnumber = $7, rtype = $8, shipdate = $9, deliverymethod = $10, trackingnumber = $11, pressure = $12, disposition =$13 WHERE tlrid = $14', [generation, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, pressure, disposition, tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				}
			});

			// Drop all Rail Components of this request and enter the new ones
			// this is easier than updating as we do not have to look for deleted components, new ones, etc. separately
			pool.query('DELETE FROM railcomponent WHERE tlrid = $1', [tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				} else {
					// Loop over each Component and insert
					for (i in componentsParsed) {
						var item = componentsParsed[i];
						if (item[0].length > 255 || item[1].length > 255 || item[2].length > 255 || item[3].length > 255 || item[5].length > 255 || item[6].length > 255 || item[10].length > 255 || item[11].length > 255 || item[0] == undefined || item[0] == null || item[0] == "") {
							response.status(400).send();
							return
						} else {
							if (item[5] == "") {item[5] = null}
							if (item[8] == "") {item[8] = null}
							if (item[9] == "") {item[9] = null}
							if (item[10] == "") {item[10] = null}
							pool.query('INSERT INTO railcomponent (tlrid, trow, component, generation, partnumber, serialnumber, manufacturingdate, odometervalue, odometerunit, arrivaldate, moedate, tfrdate, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [tlrid, item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7], item[8], item[9], item[10], item[11]], (error, results) => {
								if (error) {
									response.status(500).send();
									console.error(error);
									return
								}
							});
						}
					};
					response.status(204).send();
				}
			});
		}
	});
}

// Method to update an exisiting nozzle request
const updateNozzleRequest = (request, response) => {
	// Grab values from request body
	var { tlrid, userid, injector, model, nozzle, product, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition, rcomment, cylinders, bims } = request.body;
	var cylindersParsed = JSON.parse(cylinders);

	// Check for faulty variables, e.g. too long or not a number where needed
	if ( tlrid.length > 255 || userid.length > 255 || injector.length > 255 || model.length > 255 || nozzle.length > 255 || customer.length > 255 || testtype.length > 255 ||
	specifications.length > 9999 || customerproject.length > 255 || rinfo.length > 9999 || rhistory.length > 9999 || isNaN(pnumber) || pnumber.length == 0 || rtype.length > 255 ||
	deliverymethod.length > 255 || trackingnumber.length > 255 || vetype.length > 255 || vin.length > 255 || enginenr.length > 255 ||
	runtimeunit.length > 255 || isNaN(runtime) || runtime.length == 0 || fuel.length > 255 || disposition.length > 255 ||
	rcomment.length > 9999 || bims.length > 255) {
		response.status(400).send('Bad Request');
		return
	}

	// Standardize shipping date in case no actual date is supplied
	if(!((new Date(shipdate)).getTime() > 0) || shipdate == undefined){
		shipdate = null;
	}

	// Verify if logged in User has authorization for changes
	if (request.session.authorization == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Check if the user requesting the update is assigned to the request
	pool.query('SELECT DISTINCT request.tlrid FROM request LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid WHERE request.tlrid = $1 AND userid = $2', [tlrid, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		}
		// if the logged in user is neither the author nor assigned, deny the changes
		if (results.rows.length == 0){
			response.status(403).send();
			return
		}
		// if the logged in user is the author or authorized, process the updates
		else {
			// Update general data in request table
			pool.query('UPDATE request SET requester = $2 , rcomment = $3 WHERE tlrid = $1', [ tlrid, userid, rcomment], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				}
			})
			// Update technical data in nozzlerequest table
			pool.query('UPDATE nozzlerequest SET injector = $1, model = $2, nozzle = $3, customer = $4, customerproject = $5, rinfo = $6, testtype=$7, specifications=$8, rhistory = $9, pnumber = $10, rtype = $11, shipdate = $12, deliverymethod = $13, trackingnumber = $14, vetype = $15, vin = $16, enginenr = $17, runtimeunit = $18, runtime = $19, fuel = $20, disposition =$21, bims = $22 WHERE tlrid = $23', [injector, model, nozzle, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition, bims, tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				}
			});

			// Drop all Cylinders of this request and enter the new ones
			// this is easier than updating as we do not have to look for deleted cylinders, new ones, etc. separately
			pool.query('DELETE FROM injectorcylinder WHERE tlrid = $1', [tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				} else {
					// Loop over each Cylinder and insert
					for (i in cylindersParsed) {
						var item = cylindersParsed[i];
						if (item[0].length > 255 || item[1].length > 255 || item[2].length > 255 || item[3].length > 255 || item[4].length > 255 || item[6].length > 255 || item[7].length > 255 || item[0] == undefined || item[0] == null || item[0] == "") {
							response.status(400).send();
							return
						} else {
							pool.query('INSERT INTO injectorcylinder (tlrid, trow, cylindernr, bpn, cpn, serialnr, plant, mdate, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [tlrid, item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7]], (error, results) => {
								if (error) {
									response.status(500).send();
									console.error(error);
									return
								}
							});
						}
					};
					response.status(204).send();
				}
			});
		}
	});
}

// Method to update an existing pump request
const updatePumpRequest = (request, response) => {
	// Grab Data from POST
	var {tlrid, userid, generation, product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vin, enginenr, pressure, fuel, disposition, components, rcomment } = request.body;
	componentsParsed = JSON.parse(components);

	// Check for faulty variables, e.g. too long or not a number where needed
	if ( tlrid.length > 255 || generation.length > 255 || product.length > 255 || customer.length > 255 || customerproject.length > 255 ||
	rinfo.length > 9999 || specifications.length > 9999 || rhistory.length > 9999 || isNaN(pnumber) || pnumber.length == 0 || rtype.length > 255 ||
	deliverymethod.length > 255 || trackingnumber.length > 255 || vin.length > 255 || enginenr.length > 255 || pressure.length > 255 ||
	fuel.length > 255 || disposition.length > 255 || rcomment.length > 9999 ) {
		response.status(400).send('Bad Request');
		return
	}

	// Standardize shipping date in case no actual date was provided
	if(!((new Date(shipdate)).getTime() > 0) || shipdate == undefined){
		shipdate = null;
	}

	// Verify if logged in User has authorization for changes
	if (request.session.authorization == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Check if the user requesting the update is assigned to the request
	pool.query('SELECT DISTINCT request.tlrid FROM request LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid WHERE request.tlrid = $1 AND userid = $2', [tlrid, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		}
		// if the logged in user is neither the author nor assigned, deny the changes
		if (results.rows.length == 0){
			response.status(403).send();
			return
		}
		// if the logged in user is the author or authorized, process the updates
		else {
			// Update general data in request table
			pool.query('UPDATE request SET requester = $2 , rcomment = $3 WHERE tlrid = $1', [ tlrid, userid, rcomment], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				}
			})
			// Update technical data in pumprequest table
			pool.query('UPDATE pumprequest SET generation = $1, product = $2, customer = $3, customerproject = $4, rinfo = $5, specifications = $6, rhistory = $7, pnumber = $8, rtype = $9, shipdate = $10, deliverymethod = $11, trackingnumber = $12, vin = $13, enginenr = $14, pressure = $15, fuel = $16, disposition =$17 WHERE tlrid = $18', [generation, product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, vin, enginenr, pressure, fuel, disposition, tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				}
			});

			// Drop all Pump Components of this request and enter the new ones
			// this is easier than updating as we do not have to look for deleted components, new ones, etc. separately
			// Use the railcomponent table as both have the same strcuture. Since rail was created earlier, the table was named before pump was planned
			pool.query('DELETE FROM railcomponent WHERE tlrid = $1', [tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				} else {
					// Loop over each Component and insert
					for (i in componentsParsed) {
						var item = componentsParsed[i];
						if (item[0].length > 255 || item[1].length > 255 || item[2].length > 255 || item[3].length > 255 || item[5].length > 255 || item[6].length > 255 || item[10].length > 255 || item[11].length > 255 || item[0] == undefined || item[0] == null || item[0] == "") {
							response.status(400).send();
							return
						} else {
							// Set empty strings to null as strings are not accepted in timestamp columns
							if (item[5] == "") {item[5] = null}
							if (item[8] == "") {item[8] = null}
							if (item[9] == "") {item[9] = null}
							if (item[10] == "") {item[10] = null}
							pool.query('INSERT INTO railcomponent (tlrid, trow, component, generation, partnumber, serialnumber, manufacturingdate, odometervalue, odometerunit, arrivaldate, moedate, tfrdate, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [tlrid, item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7], item[8], item[9], item[10], item[11]], (error, results) => {
								if (error) {
									response.status(500).send();
									console.error(error);
									return
								}
							});
						}
					};
					response.status(204).send();
				}
			});
		}
	});
}

// Method to update an existing generic request
const updateDefaultRequest = (request, response) => {
	// Grab values from request body
	var { tlrid, userid, product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, additionalinfo, disposition, rcomment, components } = request.body;
	var componentsParsed = JSON.parse(components);

	// Check for faulty variables, e.g. too long or not a number where needed
	if ( tlrid.length > 255 || userid.length > 255 || product.length > 255 || customer.length > 255 || specifications.length > 9999 ||
	customerproject.length > 255 || rinfo.length > 9999 || rhistory.length > 9999 || isNaN(pnumber) || pnumber.length == 0 || rtype.length > 255 ||
	deliverymethod.length > 255 || trackingnumber.length > 255 ||
	additionalinfo.length > 9999 || disposition.length > 255 || rcomment.length > 9999 ) {
		response.status(400).send('Bad Request');
		return
	}

	// Standardize shipping date in case no actual date was supplied
	if(!((new Date(shipdate)).getTime() > 0) || shipdate == undefined){
		shipdate = null;
	}

	// Verify if logged in User has authorization for changes
	if (request.session.authorization == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Check if the user requesting the update is assigned to the request
	pool.query('SELECT DISTINCT request.tlrid FROM request LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid WHERE request.tlrid = $1 AND userid = $2', [tlrid, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		}
		// if the logged in user is neither the author nor assigned, deny the changes
		if (results.rows.length == 0){
			response.status(403).send();
			return
		}
		// if the logged in user is the author or authorized, process the updates
		else {
			// Update general data from request table
			pool.query('UPDATE request SET requester = $2 , rcomment = $3 WHERE tlrid = $1', [ tlrid, userid, rcomment], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				}
			})
			// Update technical data from defaultrequest table
			pool.query('UPDATE defaultrequest SET product = $1, customer = $2, customerproject = $3, rinfo = $4, specifications = $5, rhistory = $6, pnumber = $7, rtype = $8, shipdate = $9, deliverymethod = $10, trackingnumber = $11, additionalinfo = $12, disposition =$13 WHERE tlrid = $14', [product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, shipdate, deliverymethod, trackingnumber, additionalinfo, disposition, tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				}
			});

			// Drop all Components of this request and enter the new ones
			// this is easier than updating as we do not have to look for deleted cylinders, new ones, etc. separately
			pool.query('DELETE FROM defaultcomponent WHERE tlrid = $1', [tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				} else {
					// Loop over each Component and insert
					for (i in componentsParsed) {
						var item = componentsParsed[i];
						if (item[0].length > 255 || item[1].length > 255 || item[2].length > 255 || item[3].length > 255 || item[5].length > 255 || item[6].length > 255 || item[7].length > 255 || item[0] == "" || item[0] == null || item[0] == undefined) {
							response.status(400).send();
							return
						} else {
							pool.query('INSERT INTO defaultcomponent (tlrid, trow, componentnr, bpn, cpn, serialnr, plant, mdate, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [tlrid, item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7]], (error, results) => {
								if (error) {
									response.status(500).send();
									console.error(error);
									return
								}
							});
						}
					};
					response.status(204).send();
				}
			});
		}
	});
}

// Method to close a request and insert the closing data
const closeRequest = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// get data from request body
	const { tlrid, closeResult, closeDispo } = request.body;

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if the user is assigned to the request
	pool.query('SELECT tlrid, userid FROM requestworker WHERE tlrid=$1 AND userid=$2', [tlrid, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		} else if (results.rows.length == 0) {
			response.status(403).send();
			return
		} else {
			// Insert timestamp to show that request is closed
			pool.query('UPDATE request SET closed = $1 WHERE tlrid=$2', [new Date(), tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				} else {
					// Insert additional info in the closingdate table
					pool.query('INSERT INTO closingdata (tlrid, userid, results, disposition) VALUES ($1, $2, $3, $4)', [tlrid, request.session.userid, closeResult, closeDispo], (error, results) => {
						if (error) {
							response.status(500).send();
							console.error(error);
							return
						} else {
							response.status(204).send();
						}
					});
				}
			});
		}
	});
}

// Method to retrieve closing data
const getClosingData = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Grab TLR-ID of relevant request from web adress
	var tlrid = request.query.tlrid;

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Select the relevant data and return it
	pool.query('SELECT closingdata.userid, name, results, disposition, closed FROM request INNER JOIN closingdata ON request.tlrid = closingdata.tlrid LEFT JOIN accounts on accounts.userid = closingdata.userid WHERE request.tlrid = $1', [tlrid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		} else {
			response.status(200).json(results.rows);
		}
	});
}

// Method to open an already closed request
const reopenRequest = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Grab TLR-ID of relevant request from web adress
	var tlrid = request.query.tlrid;

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if the user is assigned to the request and deny request if not assigned
	pool.query('SELECT tlrid, userid FROM requestworker WHERE tlrid=$1 AND userid=$2', [tlrid, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		} else if (results.rows.length == 0) {
			response.status(403).send();
			return
		} else {
			// Remove the timestamp marking the request as closed
			pool.query('UPDATE request SET closed = $1 WHERE tlrid=$2', [null, tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				} else {
					// Delete the submitted data from the closingdata table
					pool.query('DELETE FROM closingdata WHERE tlrid = $1', [tlrid], (error, results) => {
						if (error) {
							response.status(500).send();
							console.error(error);
							return
						} else {
							response.status(204).send();
						}
					});
				}
			});
		}
	});
}

// Method to create a progress router from scratch
const createProgressRouter = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Grab tlrid and router table from request body
	const { tlrid, rawprogress } = request.body;
	var progress = JSON.parse(rawprogress);

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if the user is assigned to the request
	pool.query('SELECT tlrid, userid FROM requestworker WHERE tlrid=$1 AND userid=$2', [tlrid, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		} else if (results.rows.length == 0) {
			response.status(403).send();
			return
		} else {
			// Delete possible previous Router
			pool.query('DELETE FROM progress WHERE tlrid=$1', [tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				} else {
					// Loop over each Step and insert it seperately
					progress.forEach(item => {
						pool.query('INSERT INTO progress (tlrid, category, step, description, finished, userid, fdate, fcomment) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [tlrid, item[0], item[1], item[2], false, null, null, item[3]], (error, results) => {
							if (error) {
								response.status(500).send();
								console.error(error);
								return
							}
						});
					});
					response.status(201).send();
					return
				}
			});
		}
	});
}

// Method of copying an existing progress router by TLR-ID
const copyProgressRouter = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Grab the own TLR-ID and the TLR-ID with the router to be copied from the request body
	const { owntlrid, copytlrid } = request.body;

	// check if required data is missing
	for (let data of [owntlrid, copytlrid ]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if the user is assigned to the request that receives the router
	pool.query('SELECT tlrid, userid FROM requestworker WHERE tlrid=$1 AND userid=$2', [owntlrid, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		// Deny changes if the user is not assigned
		} else if (results.rows.length == 0) {
			response.status(403).send();
			return
		} else {
			// Grab the progress router from the other request
			pool.query('SELECT step, description, fcomment, category FROM progress WHERE tlrid=$1', [copytlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				// Inform the user in case no router was found
				} else if (results.rows.length == 0) {
					response.status(400).send();
					return
				} else {
					// Delete possible previous Router
					pool.query('DELETE FROM progress WHERE tlrid=$1', [owntlrid], (error, _) => {
						if (error) {
							response.status(500).send();
							console.error(error);
							return
						} else {
							// Loop over each step and insert it seperately
							results.rows.forEach(item => {
								pool.query('INSERT INTO progress (tlrid, step, description, finished, userid, fdate, fcomment, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [owntlrid, item.step, item.description, false, null, null, item.fcomment, item.category], (error, results) => {
									if (error) {
										response.status(500).send();
										console.error(error);
										return
									}
								});
							});
						}
					});
					response.status(201).send();
				}
			});
		}
	});
}

// Method to create a personal router template
const createProgressRouterTemplate = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Grab the router and the name of the template from the request
	const { templatename, rawprogress } = request.body;
	var progress = JSON.parse(rawprogress);

	// check if required data is missing
	for (let data of [templatename]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Delete possible previous template with the same name
	pool.query('DELETE FROM progresstemplate WHERE templatename = $1 AND templateowner = $2', [templatename, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		} else {
			// Loop over each Step and insert it seperately
			for (i in progress) {
				var item = progress[i];
				pool.query('INSERT INTO progresstemplate (templatename, templateowner, category, step, description, fcomment) VALUES ($1, $2, $3, $4, $5, $6)', [templatename, request.session.userid, item[0], item[1], item[2], item[3]], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					}
				});
			};
			response.status(201).send();
			return
		}
	});
}

// Method to retrieve a list of all templates from a person
const getProgressRouterTemplates = (request, response) => {
	// Check if user is logged in
	if (request.session.userid == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// get the name of the templateowner from the web adress
	var templateowner = request.query.templateowner;

	// check if required data is missing
	for (let data of [templateowner]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Select the templates and return them
	pool.query("SELECT DISTINCT templatename FROM progresstemplate WHERE templateowner = $1 ORDER BY templatename ASC", [templateowner], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error)
		} else {
			response.status(200).json(results.rows);
		}
	});
}

// Method to get all templates and the name of their owner
const getAllProgressRouterTemplates = (request, response) => {
	// Check if user is logged in and authorized
	if (request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// Select all templates as well as their template owner and return them
	pool.query("SELECT DISTINCT templatename, templateowner, name FROM progresstemplate LEFT JOIN accounts ON progresstemplate.templateowner = accounts.userid ORDER BY templatename ASC", [], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error)
		} else {
			response.status(200).json(results.rows);
		}
	});
}

// Method to mark a router template global
const makeProgressTemplateGlobal = (request, response) => {
	// Check if user is logged in and authorized
	if (request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// Get the name and owner of the template from the request body
	const { templatename, templateowner } = request.body;

	// check if required data is missing
	for (let data of [templatename, templateowner]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Remove the templateowner from the specified template, thus marking it as a global template
	pool.query("UPDATE progresstemplate SET templateowner = $1 WHERE templateowner = $2 AND templatename = $3", ['', templateowner, templatename], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error)
		} else {
			response.status(204).send();
		}
	});
}

// Method to delete a global template
const deleteGlobalTemplate = (request, response) => {
	// Check if user is logged in and authorized
	if (request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// Get the name of the template from the request body
	// since it is a global template, we know that the owner is marked as ''
	const { templatename } = request.body;

	// check if required data is missing
	for (let data of [templatename]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Run the query to delete the template
	pool.query("DELETE FROM progresstemplate WHERE templateowner = $1 AND templatename = $2", ['', templatename], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error)
		} else {
			response.status(204).send();
		}
	});
}

// Method to copy a progress router from a template
const copyProgressRouterTemplate = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Get the required information from the request body
	const { owntlrid, templatename, templateowner } = request.body;

	// check if required data is missing
	for (let data of [owntlrid, templatename, templateowner]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if the logged in user is assigned to the request
	pool.query('SELECT tlrid, userid FROM requestworker WHERE tlrid=$1 AND userid=$2', [owntlrid, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		// Deny the changes if the user isn't assigned
		} else if (results.rows.length == 0) {
			response.status(403).send();
			return
		} else {
			// Delete possible previous router from the request
			pool.query('DELETE FROM progress WHERE tlrid=$1', [owntlrid], (error, _) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				} else {
					// Copy and insert the template as the new router
					pool.query('INSERT INTO progress(tlrid, finished, step, description, fcomment, category) SELECT $1, $4, step, description, fcomment, category FROM progresstemplate WHERE templatename = $2 AND templateowner = $3', [owntlrid, templatename, templateowner, false], (error, results) => {
						if (error) {
							response.status(500).send();
							console.error(error);
							return
						} else {
							response.status(201).send();
						}
					});
				}
			});
		}
	});
}

// Method to update an existing progress router
const updateProgressRouter = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Get the TLR-ID and the router from the request body
	const { tlrid, rawprogress } = request.body;
	var progress = JSON.parse(rawprogress);

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if the user is assigned to the request
	pool.query('SELECT tlrid, userid FROM requestworker WHERE tlrid=$1 AND userid=$2', [tlrid, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		} else if (results.rows.length == 0) {
			response.status(403).send();
			return
		} else {
			// Delete previous Router
			// Use a DELETE - INSERT Workflow to reduce code complexity
			// since we do not have to differentiate between new steps, deleted steps, changed steps and unchanges steps
			pool.query('DELETE FROM progress WHERE tlrid=$1', [tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				} else {
					// Loop over each Step and insert it seperately
					progress.forEach(item => {
						// Replace possible empty strings or string-nulls with proper nulls
						if (item[4] == "null" || item[4] == "") { item[4] = null; }
						if (item[5] == "") { item[5] = null; }
						if (isNaN(item[1]) || item[1] == "") { return }
						pool.query('INSERT INTO progress (tlrid, category, step, description, finished, userid, fdate, fcomment) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [tlrid, item[0], item[1], item[2], item[3], item[4], item[5], item[6]], (error, results) => {
							if (error) {
								response.status(500).send();
								console.error(error);
								return
							}
						});
					});
					response.status(201).send();
					return
				}
			});
		}
	});
}

// Method to mark a progress step as finished
const finishProgressStep = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Get the TLR-ID and step number from the request body
	const { tlrid, step } = request.body;

	// check if required data is missing
	// check all strings
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}
	// check all integers
	for (let data of [step]) {
		if (isNaN(data) || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if the user is assigned to the request
	pool.query('SELECT tlrid, userid FROM requestworker WHERE tlrid=$1 AND userid=$2', [tlrid, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		// Deny the changes if the user isn't assigned
		} else if (results.rows.length == 0) {
			response.status(403).send();
			return
		} else {
			// Update the row specified with tlrid, step, set finished to true and add the current date and user
			pool.query('UPDATE progress SET finished=$3, fdate=$4, userid=$5 WHERE tlrid=$1 AND step=$2', [tlrid, step, true, new Date(), request.session.userid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				}
			});
			response.status(204).send();
			return
		}
	});
}

// Method to set the delay message of a request
const updateProgressBlock = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Get the TLR-ID and delay message from the request body
	const { tlrid, block } = request.body;

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if the user is assigned to the request
	pool.query('SELECT tlrid, userid FROM requestworker WHERE tlrid=$1 AND userid=$2', [tlrid, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		// Deny the changes if the user isn't assigned
		} else if (results.rows.length == 0) {
			response.status(403).send();
			return
		} else {
			// Update the row specified with tlrid and update the block (delay message)
			pool.query('UPDATE request SET block=$1 WHERE tlrid=$2', [block, tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				}
			});
			response.status(204).send();
			return
		}
	});
}

// Method to retrieve the progress by the TLR-ID
const getProgressByTLRID = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Grab tlrid from query parameter
	var tlrid = request.query.tlrid;

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if the user is assigned to the request or the teamleader of an assigned worker
	pool.query('SELECT tlrid, requestworker.userid FROM requestworker LEFT JOIN accounts ON requestworker.userid = accounts.userid WHERE tlrid=$1 AND (requestworker.userid=$2 OR $2 IN (SELECT leaderid FROM teamleaders WHERE memberid IN (SELECT userid FROM requestworker WHERE requestworker.tlrid = $1)))', [tlrid, request.session.userid], (controlerror, controlresults) => {
		if (controlerror) {
			response.status(500).send();
			throw controlerror;
			return
		// Deny the request if the user isn't assigned or the teamleader
		} else if (controlresults.rows.length == 0) {
			response.status(403).send();
			return
		} else {
			// Select the relevant data from the progress table, adding the account name connected to the userid, and return it
			pool.query('SELECT step, description, finished, (SELECT name FROM accounts WHERE accounts.userid = progress.userid), progress.userid, fdate, fcomment, category FROM progress WHERE tlrid=$1 ORDER BY step ASC', [tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				}
				response.status(200).json(results.rows);
				return
			});
		}
	});
}

// Method to retrieve the block / delay message of a request
const getBlockByTLRID = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined || request.session.authorization == 0) {
		response.status(401).send();
		return
	}

	// Grab tlrid from query parameter
	var tlrid = request.query.tlrid;

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if the user is assigned to the request or the teamleader of an assigned worker
	pool.query('SELECT tlrid, requestworker.userid FROM requestworker LEFT JOIN accounts ON requestworker.userid = accounts.userid WHERE tlrid=$1 AND (requestworker.userid=$2 OR $2 IN (SELECT leaderid FROM teamleaders WHERE memberid IN (SELECT userid FROM requestworker WHERE requestworker.tlrid = $1)))', [tlrid, request.session.userid], (controlerror, controlresults) => {
		if (controlerror) {
			response.status(500).send();
			throw controlerror;
			return
		// Deny the request if the user isn't assigned or the teamleader
		} else if (controlresults.rows.length == 0) {
			response.status(403).send();
			return
		} else {
			// Retrieve the delay message of the specified request and return it
			pool.query('SELECT block FROM request WHERE tlrid=$1', [tlrid], (error, results) => {
				if (error) {
					response.status(500).send();
					console.error(error);
					return
				}
				response.status(200).json(results.rows);
				return
			});
		}
	});
}

// Method to get all Categories currently available in the category table
const getCategories = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Select all Categories and return them
	pool.query('SELECT categoryname FROM category ORDER BY categoryname ASC', (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	})
}

// Method to add a new category to the category table
const insertCategory = (request, response) => {
	// Check if user is authorized to modify categories
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// Get the name of the new category from the request
	const { name } = request.body;

	// Check if name was entered
	if (name.length == 0) {
		response.status(400).send();
		console.error(error);
		return
	}

	// Check if category with that name already exists and deny inserting it if that is the case
	pool.query('SELECT categoryname FROM category WHERE categoryname = $1', [name], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			if (results.rows.length > 0){
				response.status(400).send();
				return
			} else {
				// Insert new Category
				pool.query('INSERT INTO category (categoryname) VALUES ($1)', [name], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
					} else {
						response.status(201).json('');
					}
				});
			}
		}
	});
}

// Method to delete an exisiting category from the category table
const deleteCategory = (request, response) => {
	// Check if user is authorized to get modify categories
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// Get the name of the category from the request body
	const { name } = request.body;

	// check if required data is missing
	for (let data of [name]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Delete Category from the table
	pool.query('DELETE FROM category WHERE categoryname=$1', [name], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(204).send();
		}
	})
}

// Method to retrieve all customers currently available via the customer table
const getCustomers = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Select all Customers and return them to the user
	pool.query('SELECT customername FROM customer ORDER BY customername ASC', (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	})
}

// Method to insert a new customer into the customer table
const insertCustomer = (request, response) => {
	// Check if user is authorized to modify the available customers
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// Get the name of the new customer from the request body
	const { name } = request.body;

	// Check if name was entered
	if (name.length == 0) {
		response.status(400).send();
		console.error(error);
		return
	}

	// Check if Customer with that name already exists and deny inserting it if that is the case
	pool.query('SELECT customername FROM customer WHERE customername = $1', [name], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			if (results.rows.length > 0){
				response.status(400).send();
				return
			} else {
				// Insert new Customer
				pool.query('INSERT INTO customer (customername) VALUES ($1)', [name], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
					} else {
						response.status(201).json('');
					}
				});
			}
		}
	});
}

// Method to delete an existing customer from the customer table
const deleteCustomer = (request, response) => {
	// Check if user is authorized to modify the available customers
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// Get the name of the customer from the request body
	const { name } = request.body;

	// check if required data is missing
	for (let data of [name]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Delete Customer from the customer table
	pool.query('DELETE FROM customer WHERE customername=$1', [name], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(204).send();
		}
	})
}

// Method to get all projects made available via the projects table
const getProjects = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Select the project ids and descriptions and return them to the user
	pool.query('SELECT mcrid, mcridtext FROM projects ORDER BY mcrid ASC', (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	})
}

// Method to insert a new Project into the database
const insertProject = (request, response) => {
	// Check if user is authorized to modify the available projects
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// Get the required data from the request body
	var { rbu, pdcl, mcrid, mcridtext } = request.body;

	// check if required data is missing
	for (let data of [pdcl, mcrid, mcridtext]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// If no RBU is entered, use null instead of ''
	if (rbu.length == 0){
		rbu = null;
	}

	// Check if Project with that MCRID already exists and deny adding it if that is the case
	pool.query('SELECT mcrid FROM projects WHERE mcrid = $1', [mcrid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			if (results.rows.length > 0){
				response.status(400).send();
				return
			} else {
				// Insert new Project into the projects table
				pool.query('INSERT INTO projects (mcrid, mcridtext, pdcl, rbu) VALUES ($1, $2, $3, $4)', [mcrid, mcridtext, pdcl, rbu], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
					} else {
						response.status(201).json('');
					}
				});
			}
		}
	});
}

// Method to delete an exisiting project from the projects table
const deleteProject = (request, response) => {
	// Check if user is authorized to modify the available projects
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// Get the MCR-ID from the request body
	const { mcrid } = request.body;

	// check if required data is missing
	for (let data of [mcrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Delete Project from the projects table
	pool.query('DELETE FROM projects WHERE mcrid=$1', [mcrid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(204).send();
		}
	})
}

// Method to get all generations alongside their categories
const getGenerations = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Select the generations and their category and return them
	pool.query("SELECT generation, category FROM generations ORDER BY category ASC, generation ASC", (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	})
}

// Method to add a new Generation
const insertGeneration = (request, response) => {
	// Check if user is authorized to modify the available generations
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// Get the generation name and associated category from the request body
	var { name, category } = request.body;

	// check if required data is missing
	for (let data of [name, category]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if Generation with that name and category already exists and deny insert if that is the case
	pool.query('SELECT generation, category FROM generations WHERE generation = $1 AND category = $2', [name, category], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			if (results.rows.length > 0){
				response.status(400).send();
				return
			} else {
				// Insert new Product Generation
				pool.query('INSERT INTO generations (generation, category) VALUES ($1, $2)', [name, category], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
					} else {
						response.status(201).json('');
					}
				});
			}
		}
	});
}

// Method to delete an exisiting Generation
const deleteGeneration = (request, response) => {
	// Check if user is authorized to modify the available generations
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// Get the generation name and category from the request
	var { name, category } = request.body;

	// check if required data is missing
	for (let data of [name, category]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Delete Generation
	pool.query('DELETE FROM generations WHERE generation=$1 AND category=$2', [name, category], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(204).send();
		}
	})
}

// Method to get the Generations of a specific Category
const getSpecificGenerations = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Grab category from query parameter
	var category = request.query.category;

	// check if required data is missing
	for (let data of [category]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Select the generations for that category and return them
	pool.query("SELECT generation FROM generations WHERE category = $1 ORDER BY generation ASC", [category], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	})
}

// Method to
const getComponentGenerationByCategory = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Grab category from query parameter
	var category = request.query.category;

	// check if required data is missing
	for (let data of [category]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	pool.query("SELECT DISTINCT component FROM componentgenerations WHERE category = $1 ORDER BY component ASC", [category], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const getComponentGenerationByComponent = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Grab category and component from query parameter
	var category = request.query.category;
	var component = request.query.component;

	// check if required data is missing
	for (let data of [component, category]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	pool.query("SELECT DISTINCT generation FROM componentgenerations WHERE category = $1 AND component = $2 ORDER BY generation ASC", [category, component], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const getComponentGenerationByCategoryCombined = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Grab category and component from query parameter
	var category = request.query.category;

	// check if required data is missing
	for (let data of [category]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	pool.query("SELECT array_agg(generation) AS generations, component FROM componentgenerations WHERE category = $1 GROUP BY componentgenerations.component", [category], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const getComponentGeneration = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	pool.query("SELECT category, component, generation FROM componentgenerations ORDER BY category, component, generation", [], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const insertComponentGeneration = (request, response) => {
	// Check if user is authorized to modify the available generations
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	var { name, component, category } = request.body;

	// check if required data is missing
	for (let data of [name, component, category]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if Generation with that name and category already exists and deny insert if that is the case
	pool.query('SELECT generation, component, category FROM componentgenerations WHERE generation = $1 AND component = $2 AND category = $3', [name, component, category], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			if (results.rows.length > 0){
				response.status(400).send();
				return
			} else {
				// Insert new Product Generation
				pool.query('INSERT INTO componentgenerations (generation, component, category) VALUES ($1, $2, $3)', [name, component, category], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
					} else {
						response.status(201).json('');
					}
				});
			}
		}
	});
}

const deleteComponentGeneration = (request, response) => {
	// Check if user is authorized to modify the available generations
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	var { name, category, component } = request.body;

	// check if required data is missing
	for (let data of [name, component, category]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Delete Generation
	pool.query('DELETE FROM componentgenerations WHERE generation=$1 AND component = $2 AND category=$3', [name, component, category], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(204).send();
		}
	})
}

const getProducts = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	pool.query("SELECT product, category FROM products ORDER BY category ASC, product ASC", (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	})
}

const insertProduct = (request, response) => {
	// Check if user is authorized to modify the available products
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	var { name, category } = request.body;

	// check if required data is missing
	for (let data of [name, category]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if Product with that name and category already exists and deny insert if that is the case
	pool.query('SELECT product, category FROM products WHERE product = $1 AND category = $2', [name, category], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			if (results.rows.length > 0){
				response.status(400).send();
				return
			} else {
				// Insert new Product
				pool.query('INSERT INTO products (product, category) VALUES ($1, $2)', [name, category], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
					} else {
						response.status(201).json('');
					}
				});
			}
		}
	});
}

const deleteProduct = (request, response) => {
	// Check if user is authorized to modify the available products
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	var { name, category } = request.body;

	// check if required data is missing
	for (let data of [name, category]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}


	// Delete Product
	pool.query('DELETE FROM products WHERE product=$1 AND category=$2', [name, category], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(204).send();
		}
	})
}


const getSpecificProducts = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Grab category from query parameter
	var category = request.query.category;

	// check if required data is missing
	for (let data of [category]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if we have a category, else return all distinct products
	if (category.length != 0 && category != null && category != undefined){
		pool.query("SELECT product FROM products WHERE category = $1 ORDER BY product ASC", [category], (error, results) => {
			if (error) {
				response.status(500).send();
				console.error(error);
			} else {
				response.status(200).json(results.rows);
			}
		});
	} else {
		pool.query("SELECT DISTINCT product FROM products ORDER BY product ASC", [], (error, results) => {
			if (error) {
				response.status(500).send();
				console.error(error);
			} else {
				response.status(200).json(results.rows);
			}
		});
	}
}

const getProjectTypes = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	pool.query("SELECT projecttype, category FROM projecttypes ORDER BY category ASC, projecttype ASC", (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error)
		} else {
			response.status(200).json(results.rows);
		}
	})
}

const insertProjectType = (request, response) => {
	// Check if user is authorized to modify the available project types
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	var { name, category } = request.body;

	// check if required data is missing
	for (let data of [name, category]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if Project Type with that name and category already exists and deny insert if that is the case
	pool.query('SELECT projecttype, category FROM projecttypes WHERE projecttype = $1 AND category = $2', [name, category], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			if (results.rows.length > 0){
				response.status(400).send();
				return
			} else {
				// Insert new Project Type
				pool.query('INSERT INTO projecttypes (projecttype, category) VALUES ($1, $2)', [name, category], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
					} else {
						response.status(201).json('');
					}
				});
			}
		}
	});
}

const deleteProjectType = (request, response) => {
	// Check if user is authorized to modify the available project types
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	var { name, category } = request.body;

	// check if required data is missing
	for (let data of [name, category]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Delete Project Type
	pool.query('DELETE FROM projecttypes WHERE projecttype=$1 AND category=$2', [name, category], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(204).send();
		}
	})
}

const getSpecificProjectTypes = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Grab category from query parameter
	var category = request.query.category;

	// check if required data is missing
	for (let data of [category]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	pool.query("SELECT projecttype FROM projecttypes WHERE category = $1 ORDER BY projecttype ASC", [category], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error)
		} else {
			response.status(200).json(results.rows);
		}
	})
}

const getDisposition = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	pool.query("SELECT disposition FROM disposition ORDER BY disposition ASC", (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error)
		} else {
			response.status(200).json(results.rows);
		}
	})
}

const insertDisposition = (request, response) => {
	// Check if user is authorized to modify the available disposition options
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	var { disposition } = request.body;

	// check if required data is missing
	for (let data of [disposition]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if Disposition already exists and deny insert if that is the case
	pool.query('SELECT disposition FROM disposition WHERE disposition = $1', [disposition], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			if (results.rows.length > 0){
				response.status(400).send();
				return
			} else {
				// Insert new Project Type
				pool.query('INSERT INTO disposition (disposition) VALUES ($1)', [disposition], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					} else {
						response.status(201).json('');
					}
				});
			}
		}
	});
}

const deleteDisposition = (request, response) => {
	// Check if user is authorized to modify the available disposition options
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	var { disposition } = request.body;

	// check if required data is missing
	for (let data of [disposition]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Delete Project Type
	pool.query('DELETE FROM disposition WHERE disposition=$1', [disposition], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(204).send();
		}
	})
}

const getProgressCategories = (request, response) => {
	// Check if user is logged in
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}
	pool.query("SELECT category, icon FROM progresscategories ORDER BY category ASC", (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error)
		} else {
			response.status(200).json(results.rows);
		}
	})
}

const insertProgressCategories = (request, response) => {
	// Check if user is authorized to modify the available progress categories
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	var { category, icon } = request.body;

	// check if required data is missing
	for (let data of [category, icon]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if Progress Category already exists and deny insert if that is the case
	pool.query('SELECT category FROM progresscategories WHERE category = $1', [category], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			if (results.rows.length > 0){
				response.status(400).send();
				return
			} else {
				// Insert new Project Type
				pool.query('INSERT INTO progresscategories (category, icon) VALUES ($1, $2)', [category, icon], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
					} else {
						response.status(201).json('');
					}
				});
			}
		}
	});
}

const deleteProgressCategories = (request, response) => {
	// Check if user is authorized to modify the available progress categories
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	var { category } = request.body;

	// check if required data is missing
	for (let data of [category]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Delete Project Type
	pool.query('DELETE FROM progresscategories WHERE category=$1', [category], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(204).send();
		}
	})
}

const getOpenRequests = (request, response) => {
	// Grab Limit from query parameters
	var startIndex = request.query.start;
	var step = request.query.end;

	// check if required data is missing
	for (let data of [startIndex, step]) {
		if (isNaN(data) || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send('{}');
		return
	}

	// set query depending on authorization level of user
	var query = 'SELECT DISTINCT request.tlrid, (SELECT name AS requester FROM accounts WHERE userid=request.requester), opened, closed, block, request.category, (SELECT string_agg(accounts.name, $4) FROM requestworker LEFT JOIN accounts ON requestworker.userid = accounts.userid WHERE requestworker.tlrid = request.tlrid) AS workers, SUM(CASE finished WHEN true THEN 1 ELSE 0 END), COUNT(step), (SELECT array_agg(icon) FROM (SELECT icon FROM progress AS p LEFT JOIN progresscategories ON p.category = progresscategories.category WHERE p.tlrid = request.tlrid ORDER BY p.step ASC) AS icontable) AS icons, (SELECT array_agg(icon) FROM progress LEFT JOIN progresscategories ON progress.category = progresscategories.category WHERE progress.tlrid = request.tlrid AND progress.category NOT IN (SELECT category FROM progress WHERE fdate IS NULL AND progress.tlrid = request.tlrid)) AS closedcategories, (SELECT array_agg(category) FROM (SELECT category FROM progress AS p WHERE p.tlrid = request.tlrid ORDER BY p.step ASC) AS iconnametable) AS iconnames FROM request LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid LEFT JOIN progress ON request.tlrid=progress.tlrid WHERE closed IS NULL AND (requester = $1 OR requestworker.userid = $1) GROUP BY request.tlrid ORDER BY opened DESC LIMIT $2 OFFSET $3';

	// Select open Request, snippet defined by start and step
	pool.query(query, [request.session.userid, step, startIndex, ', '], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	})
}

const getClosedRequests = (request, response) => {
	// Grab Limit from query parameters
	var startIndex = request.query.start;
	var step = request.query.end;

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send('{}');
		return
	}

	// check if required data is missing
	for (let data of [startIndex, step]) {
		if (isNaN(data) || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// set query depending on authorization level of user
	var query = 'SELECT DISTINCT request.tlrid, (SELECT name AS requester FROM accounts WHERE userid=request.requester), opened, closed, block, (SELECT string_agg(accounts.name, $4) FROM requestworker LEFT JOIN accounts ON requestworker.userid = accounts.userid WHERE requestworker.tlrid = request.tlrid) AS workers, request.category FROM request LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid WHERE closed IS NOT NULL AND (requester = $1 OR requestworker.userid = $1) GROUP BY request.tlrid ORDER BY opened DESC LIMIT $2 OFFSET $3';

	// Select closed requests, snippet defined by start and step
	pool.query(query, [request.session.userid, step, startIndex, ', '], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	})
}

const getOpenTeamRequests = (request, response) => {
	// Grab Limit from query parameters
	var startIndex = request.query.start;
	var step = request.query.end;

	// Verify Account by checking if session exists
	if (request.session.authorization < 2) {
		response.status(401).send('{}');
		return
	}

	// check if required data is missing
	for (let data of [startIndex, step]) {
		if (isNaN(data) || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	pool.query('SELECT DISTINCT request.tlrid, (SELECT name AS requester FROM accounts WHERE userid=request.requester), opened, closed, block, (SELECT string_agg(accounts.name, $4) FROM requestworker LEFT JOIN accounts ON requestworker.userid = accounts.userid WHERE requestworker.tlrid = request.tlrid) AS workers, request.category, SUM(CASE finished WHEN true THEN 1 ELSE 0 END), COUNT(step), (SELECT array_agg(icon) FROM (SELECT icon FROM progress AS p LEFT JOIN progresscategories ON p.category = progresscategories.category WHERE p.tlrid = request.tlrid ORDER BY p.step ASC) AS icontable) AS icons, (SELECT array_agg(icon) FROM progress LEFT JOIN progresscategories ON progress.category = progresscategories.category WHERE progress.tlrid = request.tlrid AND progress.category NOT IN (SELECT category FROM progress WHERE fdate IS NULL AND progress.tlrid = request.tlrid)) AS closedcategories, (SELECT array_agg(category) FROM (SELECT category FROM progress AS p WHERE p.tlrid = request.tlrid ORDER BY p.step ASC) AS iconnametable) AS iconnames FROM request LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid LEFT JOIN progress ON request.tlrid=progress.tlrid WHERE closed IS NULL AND (requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $3) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $3) OR requestworker.userid = $3) GROUP BY request.tlrid ORDER BY opened DESC LIMIT $1 OFFSET $2', [step, startIndex, request.session.userid, ', '], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	})
}

const getBlockedTeamRequests = (request, response) => {
	// Grab Limit from query parameters
	var startIndex = request.query.start;
	var step = request.query.end;

	// Verify Account by checking if session exists
	if (request.session.authorization < 2) {
		response.status(401).send('{}');
		return
	}

	// check if required data is missing
	for (let data of [startIndex, step]) {
		if (isNaN(data) || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	pool.query('SELECT DISTINCT request.tlrid, (SELECT name AS requester FROM accounts WHERE userid=request.requester), opened, closed, block, (SELECT string_agg(accounts.name, $5) FROM requestworker LEFT JOIN accounts ON requestworker.userid = accounts.userid WHERE requestworker.tlrid = request.tlrid) AS workers, request.category, SUM(CASE finished WHEN true THEN 1 ELSE 0 END), COUNT(step), (SELECT array_agg(icon) FROM (SELECT icon FROM progress AS p LEFT JOIN progresscategories ON p.category = progresscategories.category WHERE p.tlrid = request.tlrid ORDER BY p.step ASC) AS icontable) AS icons, (SELECT array_agg(icon) FROM progress LEFT JOIN progresscategories ON progress.category = progresscategories.category WHERE progress.tlrid = request.tlrid AND progress.category NOT IN (SELECT category FROM progress WHERE fdate IS NULL AND progress.tlrid = request.tlrid)) AS closedcategories, (SELECT array_agg(category) FROM (SELECT category FROM progress AS p WHERE p.tlrid = request.tlrid ORDER BY p.step ASC) AS iconnametable) AS iconnames FROM request LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid LEFT JOIN progress ON request.tlrid=progress.tlrid WHERE closed IS NULL AND block <> $4 AND (requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $3) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $3)) GROUP BY request.tlrid ORDER BY opened DESC LIMIT $1 OFFSET $2', [step, startIndex, request.session.userid, "", ", "], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	})
}

const getUnassignedRequests = (request, response) => {
	// Grab Limit from query parameters
	var startIndex = request.query.start;
	var step = request.query.end;

	// Verify Account by checking if session exists
	if (request.session.authorization < 2) {
		response.status(401).send('{}');
		return
	}

	// check if required data is missing
	for (let data of [startIndex, step]) {
		if (isNaN(data) || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	pool.query('SELECT DISTINCT request.tlrid, (SELECT name AS requester FROM accounts WHERE userid=request.requester), opened, closed, block, request.category FROM request LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid WHERE closed IS NULL AND request.tlrid NOT IN (SELECT DISTINCT tlrid FROM requestworker) ORDER BY opened DESC LIMIT $1 OFFSET $2', [step, startIndex], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	})
}

const getAllRequests = (request, response) => {
	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send('{}');
		return
	}

	var { startIndex, step, category, requester, lowTLRID, highTLRID, lowOpened, highOpened, lowClosed, highClosed} = request.body;

	// check if required data is missing
	for (let data of [startIndex, step]) {
		if (isNaN(data) || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// set query depending on authorization level of user
	if (request.session.authorization == 1 || request.session.authorization == 0) {
		var query = 'SELECT DISTINCT request.tlrid, (SELECT name AS requester FROM accounts WHERE userid=request.requester), opened, closed, block, (SELECT string_agg(accounts.name, $4) FROM requestworker LEFT JOIN accounts ON requestworker.userid = accounts.userid WHERE requestworker.tlrid = request.tlrid) AS workers, request.category, SUM(CASE finished WHEN true THEN 1 ELSE 0 END), COUNT(step), (SELECT array_agg(icon) FROM (SELECT icon FROM progress AS p LEFT JOIN progresscategories ON p.category = progresscategories.category WHERE p.tlrid = request.tlrid ORDER BY p.step ASC) AS icontable) AS icons, (SELECT array_agg(icon) FROM progress LEFT JOIN progresscategories ON progress.category = progresscategories.category WHERE progress.tlrid = request.tlrid AND progress.category NOT IN (SELECT category FROM progress WHERE fdate IS NULL AND progress.tlrid = request.tlrid)) AS closedcategories, (SELECT array_agg(category) FROM (SELECT category FROM progress AS p WHERE p.tlrid = request.tlrid ORDER BY p.step ASC) AS iconnametable) AS iconnames FROM request LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid LEFT JOIN progress ON request.tlrid = progress.tlrid WHERE (requester = $1 OR requestworker.userid = $1)';
	}
	else if (request.session.authorization >= 2) {
		var query = 'SELECT DISTINCT request.tlrid, (SELECT name AS requester FROM accounts WHERE userid=request.requester), opened, closed, block, (SELECT string_agg(accounts.name, $4) FROM requestworker LEFT JOIN accounts ON requestworker.userid = accounts.userid WHERE requestworker.tlrid = request.tlrid) AS workers, request.category, SUM(CASE finished WHEN true THEN 1 ELSE 0 END), COUNT(step), (SELECT array_agg(icon) FROM (SELECT icon FROM progress AS p LEFT JOIN progresscategories ON p.category = progresscategories.category WHERE p.tlrid = request.tlrid ORDER BY p.step ASC) AS icontable) AS icons, (SELECT array_agg(icon) FROM progress LEFT JOIN progresscategories ON progress.category = progresscategories.category WHERE progress.tlrid = request.tlrid AND progress.category NOT IN (SELECT category FROM progress WHERE fdate IS NULL AND progress.tlrid = request.tlrid)) AS closedcategories, (SELECT array_agg(category) FROM (SELECT category FROM progress AS p WHERE p.tlrid = request.tlrid ORDER BY p.step ASC) AS iconnametable) AS iconnames FROM request LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid LEFT JOIN progress ON request.tlrid = progress.tlrid WHERE (requester = $1 OR requestworker.userid = $1 OR requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $1) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $1))';
	}

	if (category != "") {
		query += " AND request.category = '" + category + "'";
	}
	if (requester != "") {
		query += " AND request.requester = '" + requester + "'";
	}
	if (lowTLRID != "") {
		query += " AND request.tlrid >= '" + lowTLRID + "'";
	}
	if (highTLRID != "") {
		query += " AND request.tlrid <= '" + highTLRID + "'";
	}
	if (lowOpened != "") {
		query += " AND request.opened >= '" + lowOpened + "'";
	}
	if (highOpened != "") {
		query += " AND request.opened <= '" + highOpened + "'";
	}
	if (lowClosed != "") {
		query += " AND request.closed >= '" + lowClosed + "'";
	}
	if (highClosed != "") {
		query += " AND request.closed <= '" + highClosed + "'";
	}

	query += 'GROUP BY request.tlrid ORDER BY opened DESC LIMIT $2 OFFSET $3';

	// Select requests, snippet defined by start and step
	pool.query(query, [request.session.userid, step, startIndex, ', '], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	})
}

const getStatusboardRequests = (request, response) => {
	// Grab Limit from query parameters
	var startIndex = request.query.start;
	var step = request.query.end;

	// check if required data is missing
	for (let data of [startIndex, step]) {
		if (isNaN(data) || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// set query depending on authorization level of user
	var query = 'SELECT DISTINCT request.tlrid, (SELECT name AS requester FROM accounts WHERE userid=request.requester), opened, block, request.category, (SELECT string_agg(accounts.name, $3) FROM requestworker LEFT JOIN accounts ON requestworker.userid = accounts.userid WHERE requestworker.tlrid = request.tlrid) AS workers, (SELECT array_agg(icon) FROM (SELECT icon FROM progress AS p LEFT JOIN progresscategories ON p.category = progresscategories.category WHERE p.tlrid = request.tlrid ORDER BY p.step ASC) AS icontable) AS icons, (SELECT array_agg(icon) FROM progress LEFT JOIN progresscategories ON progress.category = progresscategories.category WHERE progress.tlrid = request.tlrid AND progress.category NOT IN (SELECT category FROM progress WHERE fdate IS NULL AND progress.tlrid = request.tlrid)) AS closedcategories, (SELECT array_agg(category) FROM (SELECT category FROM progress AS p WHERE p.tlrid = request.tlrid ORDER BY p.step ASC) AS iconnametable) AS iconnames FROM request LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid LEFT JOIN progress ON request.tlrid=progress.tlrid WHERE closed IS NULL GROUP BY request.tlrid ORDER BY opened DESC LIMIT $1 OFFSET $2';

	// Select open Request, snippet defined by start and step
	pool.query(query, [step, startIndex, ', '], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	})
}

const getRequestByTLRID = (request, response) => {
	// Grab TLR-ID from query parameter
	var tlrid = request.query.tlrid;

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send('{}');
		return
	}

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check request category and grab relevant data from the tables used by the category
	pool.query('SELECT category FROM request WHERE tlrid = $1', [tlrid], (error, catres) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		} else {
			// Check what Requesttype we have
			if (catres.rows[0].category == 'Injector') {
				var query = 'SELECT DISTINCT request.tlrid, requester, opened, closed, block, rcomment, category, generation, product, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, timezone($3, shipdate) AS shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, injectorrequest.disposition, closingdata.userid AS closinguserid, accounts.name AS closinguser, closingdata.results AS closingresults, closingdata.disposition AS closingdisposition FROM request INNER JOIN injectorrequest ON request.tlrid = injectorrequest.tlrid LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid LEFT JOIN closingdata ON request.tlrid = closingdata.tlrid LEFT JOIN accounts ON accounts.userid = closingdata.userid WHERE request.tlrid = $1 AND ((requester = $2 OR requestworker.userid = $2 OR requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $2) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $2)) OR (request.tlrid NOT IN (SELECT DISTINCT tlrid FROM requestworker) AND (SELECT auth FROM accounts WHERE userid = $2) >= 2))';
				// Run final Query
				pool.query(query, [tlrid, request.session.userid, 'utc'], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					} else {
						if (results.rows.length == 0) {
							response.status(403).send();
						} else {
							response.status(200).json(results.rows);
						}
					}
				});
			} else if (catres.rows[0].category == 'Rail') {
				// Run final Query
				pool.query('SELECT DISTINCT request.tlrid, requester, opened, closed, block, rcomment, category, generation, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, timezone($3, shipdate) AS shipdate, deliverymethod, trackingnumber, pressure, railrequest.disposition, closingdata.userid AS closinguserid, accounts.name AS closinguser, closingdata.results AS closingresults, closingdata.disposition AS closingdisposition FROM request INNER JOIN railrequest ON request.tlrid = railrequest.tlrid LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid LEFT JOIN closingdata ON request.tlrid = closingdata.tlrid LEFT JOIN accounts ON accounts.userid = closingdata.userid WHERE request.tlrid = $1 AND ((requester = $2 OR requestworker.userid = $2 OR requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $2) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $2)) OR (request.tlrid NOT IN (SELECT DISTINCT tlrid FROM requestworker) AND (SELECT auth FROM accounts WHERE userid = $2) >= 2))', [tlrid, request.session.userid, 'utc'], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					} else {
						if (results.rows.length == 0) {
							response.status(403).send();
						} else {
							response.status(200).json(results.rows);
						}
					}
				});
			} else if (catres.rows[0].category == 'Nozzle') {
				// Run final Query
				pool.query('SELECT DISTINCT request.tlrid, requester, opened, closed, block, rcomment, category, injector, model, nozzle, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, timezone($3, shipdate) AS shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, nozzlerequest.disposition, bims, closingdata.userid AS closinguserid, accounts.name AS closinguser, closingdata.results AS closingresults, closingdata.disposition AS closingdisposition  FROM request INNER JOIN nozzlerequest ON request.tlrid = nozzlerequest.tlrid LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid LEFT JOIN closingdata ON request.tlrid = closingdata.tlrid LEFT JOIN accounts ON accounts.userid = closingdata.userid WHERE request.tlrid = $1 AND ((requester = $2 OR requestworker.userid = $2 OR requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $2) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $2)) OR (request.tlrid NOT IN (SELECT DISTINCT tlrid FROM requestworker) AND (SELECT auth FROM accounts WHERE userid = $2) >= 2))', [tlrid, request.session.userid, 'utc'], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					} else {
						if (results.rows.length == 0) {
							response.status(403).send();
						} else {
							response.status(200).json(results.rows);
						}
					}
				});
			} else if (catres.rows[0].category == 'Pump') {
				// Run final Query
				pool.query('SELECT DISTINCT request.tlrid, requester, opened, closed, block, rcomment, category, generation, product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, timezone($3, shipdate) AS shipdate, deliverymethod, trackingnumber, vin, enginenr, pressure, fuel, pumprequest.disposition, closingdata.userid AS closinguserid, accounts.name AS closinguser, closingdata.results AS closingresults, closingdata.disposition AS closingdisposition FROM request INNER JOIN pumprequest ON request.tlrid = pumprequest.tlrid LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid LEFT JOIN closingdata ON request.tlrid = closingdata.tlrid LEFT JOIN accounts ON accounts.userid = closingdata.userid WHERE request.tlrid = $1 AND ((requester = $2 OR requestworker.userid = $2 OR requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $2) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $2)) OR (request.tlrid NOT IN (SELECT DISTINCT tlrid FROM requestworker) AND (SELECT auth FROM accounts WHERE userid = $2) >= 2))', [tlrid, request.session.userid, 'utc'], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					} else {
						if (results.rows.length == 0) {
							response.status(403).send();
						} else {
							response.status(200).json(results.rows);
						}
					}
				});
			} else {
				// Run final Query
				pool.query('SELECT DISTINCT request.tlrid, requester, opened, closed, block, rcomment, category, product, customer, customerproject, rinfo, specifications, rhistory, pnumber, rtype, timezone($3, shipdate) AS shipdate, deliverymethod, trackingnumber, additionalinfo, defaultrequest.disposition, closingdata.userid AS closinguserid, accounts.name AS closinguser, closingdata.results AS closingresults, closingdata.disposition AS closingdisposition  FROM request INNER JOIN defaultrequest ON request.tlrid = defaultrequest.tlrid LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid LEFT JOIN closingdata ON request.tlrid = closingdata.tlrid LEFT JOIN accounts ON accounts.userid = closingdata.userid WHERE request.tlrid = $1 AND ((requester = $2 OR requestworker.userid = $2 OR requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $2) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $3)) OR (request.tlrid NOT IN (SELECT DISTINCT tlrid FROM requestworker) AND (SELECT auth FROM accounts WHERE userid = $2) >= 2))', [tlrid, request.session.userid, 'utc'], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					} else {
						if (results.rows.length == 0) {
							response.status(403).send();
						} else {
							response.status(200).json(results.rows);
						}
					}
				});
			}
		}
	});
}

const createReturnSheet = (request, response) => {
	// Grab TLR-ID from query parameter
	var tlrid = request.query.tlrid;

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send('{}');
		return
	}

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

		// Check request category and grab relevant data from the tables used by the category
	pool.query('SELECT category FROM request WHERE tlrid = $1', [tlrid], (error, catres) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		} else {
			// Check what Requesttype we have and create the appropriate query
			if (catres.rows[0].category == 'Injector') {
				var query = 'SELECT DISTINCT request.tlrid, requester, opened, closed, block, rcomment, category, generation, product, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, timezone($3, shipdate) AS shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition, (SELECT array_agg(ic.bpn) FROM (SELECT bpn FROM injectorcylinder WHERE tlrid = request.tlrid ORDER BY trow) as ic) AS arr_bpn, (SELECT array_agg(ic.cpn) FROM (SELECT cpn FROM injectorcylinder WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_cpn, (SELECT array_agg(ic.serialnr) FROM (SELECT serialnr FROM injectorcylinder WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_serialnr, (SELECT array_agg(ic.plant) FROM (SELECT plant FROM injectorcylinder WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_plant, (SELECT array_agg(ic.mdate) FROM (SELECT mdate FROM injectorcylinder WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_mdate, (SELECT array_agg(ic.notes) FROM (SELECT notes FROM injectorcylinder WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_notes FROM request INNER JOIN injectorrequest ON request.tlrid = injectorrequest.tlrid LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid WHERE request.tlrid = $1 AND ((requester = $2 OR requestworker.userid = $2 OR requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $2) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $2)) OR (request.tlrid NOT IN (SELECT DISTINCT tlrid FROM requestworker) AND (SELECT auth FROM accounts WHERE userid = $2) >= 2))';
			}
			else if (catres.rows[0].category == 'Rail') {
				var query = 'SELECT DISTINCT request.tlrid, requester, opened, closed, block, rcomment, category, generation, customer, customerproject, rinfo, rhistory, pnumber, rtype, timezone($3, shipdate) AS shipdate, deliverymethod, trackingnumber, pressure, disposition, (SELECT array_agg(ic.component) FROM (SELECT component FROM railcomponent WHERE tlrid = request.tlrid ORDER BY partnumber) AS ic) AS arr_component, (SELECT array_agg(ic.serialnumber) FROM (SELECT serialnumber FROM railcomponent WHERE tlrid = request.tlrid ORDER BY partnumber) AS ic) AS arr_serialnr, (SELECT array_agg(ic.manufacturingdate) FROM (SELECT manufacturingdate FROM railcomponent WHERE tlrid = request.tlrid ORDER BY partnumber) AS ic) AS arr_mdate, (SELECT array_agg(ic.notes) FROM (SELECT notes FROM railcomponent WHERE tlrid = request.tlrid ORDER BY partnumber) AS ic) AS arr_notes FROM request INNER JOIN railrequest ON request.tlrid = railrequest.tlrid LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid WHERE request.tlrid = $1 AND ((requester = $2 OR requestworker.userid = $2 OR requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $2) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $2)) OR (request.tlrid NOT IN (SELECT DISTINCT tlrid FROM requestworker) AND (SELECT auth FROM accounts WHERE userid = $2) >= 2))';
			}
			else if (catres.rows[0].category == 'Nozzle') {
				var query = 'SELECT DISTINCT request.tlrid, requester, opened, closed, block, rcomment, category, injector, model, nozzle, customer, customerproject, rinfo, testtype, specifications, rhistory, pnumber, rtype, timezone($3, shipdate) AS shipdate, deliverymethod, trackingnumber, vetype, vin, enginenr, runtimeunit, runtime, fuel, disposition, bims, (SELECT array_agg(ic.bpn) FROM (SELECT bpn FROM injectorcylinder WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_bpn, (SELECT array_agg(ic.cpn) FROM (SELECT cpn FROM injectorcylinder WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_cpn, (SELECT array_agg(ic.serialnr) FROM (SELECT serialnr FROM injectorcylinder WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_serialnr, (SELECT array_agg(ic.plant) FROM (SELECT plant FROM injectorcylinder WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_plant, (SELECT array_agg(ic.mdate) FROM (SELECT mdate FROM injectorcylinder WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_mdate, (SELECT array_agg(ic.notes) FROM (SELECT notes FROM injectorcylinder WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_notes FROM request INNER JOIN nozzlerequest ON request.tlrid = nozzlerequest.tlrid LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid WHERE request.tlrid = $1 AND ((requester = $2 OR requestworker.userid = $2 OR requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $2) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $2)) OR (request.tlrid NOT IN (SELECT DISTINCT tlrid FROM requestworker) AND (SELECT auth FROM accounts WHERE userid = $2) >= 2))';
			} else {
				var query = 'SELECT DISTINCT request.tlrid, requester, opened, closed, block, rcomment, category, product, customer, customerproject, rinfo, rhistory, pnumber, rtype, timezone($3, shipdate) AS shipdate, deliverymethod, trackingnumber, additionalinfo, disposition, (SELECT array_agg(ic.bpn) FROM (SELECT bpn FROM defaultcomponent WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_bpn, (SELECT array_agg(ic.cpn) FROM (SELECT cpn FROM defaultcomponent WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_cpn, (SELECT array_agg(ic.serialnr) FROM (SELECT serialnr FROM defaultcomponent WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_serialnr, (SELECT array_agg(ic.plant) FROM (SELECT plant FROM defaultcomponent WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_plant, (SELECT array_agg(ic.mdate) FROM (SELECT mdate FROM defaultcomponent WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_mdate, (SELECT array_agg(ic.notes) FROM (SELECT notes FROM defaultcomponent WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_notes FROM request INNER JOIN defaultrequest ON request.tlrid = defaultrequest.tlrid LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid WHERE request.tlrid = $1 AND ((requester = $2 OR requestworker.userid = $2 OR requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $2) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $2)) OR (request.tlrid NOT IN (SELECT DISTINCT tlrid FROM requestworker) AND (SELECT auth FROM accounts WHERE userid = $2) >= 2))';
			}
		}
		// run query to get the data
		pool.query(query, [tlrid, request.session.userid, 'utc'], async (error, results) => {
			if (error) {
				response.status(500).send();
				console.error(error);
				return
			} else {
				if (results.rows.length == 0) {
					response.status(403).send();
				} else {
					// get results
					var result = results.rows[0];

					// load the excel template
					const workbook = new exceljs.Workbook();
					await workbook.xlsx.readFile(process.env.SERVERPATH + '/files/updatedreturnsheettemplate.xlsx');

					// get the sheet
					var worksheet = workbook.worksheets[0];

					// modify cells
					worksheet.getRow(4).getCell('D').value = result.customer;
					worksheet.getRow(4).getCell('G').value = result.tlrid;

					if (catres.rows[0].category == 'Injector' || catres.rows[0].category == 'Rail') {
						worksheet.getRow(5).getCell('D').value = result.generation;
					} else if (catres.rows[0].category == 'Nozzle') {
						worksheet.getRow(5).getCell('D').value = result.injector;
					}
					worksheet.getRow(5).getCell('G').value = result.customerproject;

					if (catres.rows[0].category == 'Nozzle'){
						worksheet.getRow(6).getCell('D').value = result.nozzle;
					} else if (catres.rows[0].category != 'Rail'){
						worksheet.getRow(6).getCell('D').value = result.product;
					}
					// worksheet.getRow(6).getCell('G').value = responsible associate;

					if (result.trackingnumber != null && result.trackingnumber != undefined) {
						worksheet.getRow(9).getCell('D').value = result.trackingnumber;
					}
					if (result.shipdate != null && result.shipdate != undefined) {
						worksheet.getRow(9).getCell('G').value = result.shipdate;
					}

					worksheet.getRow(11).getCell('C').value = result.rinfo;
					worksheet.getRow(14).getCell('C').value = result.rhistory;

					// Cylinders / Components
					if (catres.rows[0].category != 'Rail' && result.arr_cpn != null) {
						for (var i = 0; i < result.arr_bpn.length; i++) {
							var row = 16 + i;
							if (row > 23) { break; }
							worksheet.getRow(row).getCell('C').value = result.arr_bpn[i];
							worksheet.getRow(row).getCell('D').value = result.arr_cpn[i];
							worksheet.getRow(row).getCell('E').value = result.arr_mdate[i] + ", " + result.arr_serialnr[i];
							worksheet.getRow(row).getCell('F').value = result.arr_plant[i];
							worksheet.getRow(row).getCell('G').value = result.arr_notes[i];
						}
					} else if (result.arr_component != null){
						for (var i = 0; i < result.arr_component.length; i++) {
							var row = 16 + i;
							if (row > 23) { break; }
							worksheet.getRow(row).getCell('D').value = " ";
							if (result.arr_mdate[i] != null && result.arr_mdate[i] != undefined) {
								worksheet.getRow(row).getCell('E').value = result.arr_mdate[i].toString().substring(0,15) + ", " + result.arr_serialnr[i];
							}
							worksheet.getRow(row).getCell('F').value = " ";
							worksheet.getRow(row).getCell('G').value = result.arr_component[i] + " | " + result.arr_notes[i];
						}
					}

					if (catres.rows[0].category == 'Injector' || catres.rows[0].category == 'Nozzle') {
						worksheet.getRow(28).getCell('D').value = result.vetype;
						worksheet.getRow(29).getCell('D').value = result.vin;
						worksheet.getRow(30).getCell('D').value = result.enginenr;

						if (result.runtimeunit == 'Miles') {
							worksheet.getRow(29).getCell('G').value = result.runtime;
						} else 	if (result.runtimeunit == 'Kilometres') {
							worksheet.getRow(28).getCell('G').value = result.runtime;
						}
					}

					if (result.testtype != null && result.testtype != undefined) {
						worksheet.getRow(33).getCell('D').value = result.testtype;
					}
					worksheet.getRow(34).getCell('D').value = result.fuel;

					if (catres.rows[0].category == 'Rail') {
						worksheet.getRow(33).getCell('G').value = result.pressure;
					}

					if (catres.rows[0].category == 'Injector' || catres.rows[0].category == 'Nozzle') {
						worksheet.getRow(38).getCell('C').value = result.specifications;
					}

					// save workbook
					await workbook.xlsx.writeFile(process.env.SERVERPATH + '/files/returnsheet.xlsx');

					// send file to user
					response.sendFile(process.env.SERVERPATH + '/files/returnsheet.xlsx');
				}
			}
		});
	});
}

const createRailExport = (request, response) => {
	// Grab TLR-ID from query parameter
	var tlrid = request.query.tlrid;

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send('{}');
		return
	}

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	var query = 'SELECT DISTINCT request.tlrid, requester, opened, closed, block, rcomment, category, generation, customer, customerproject, rinfo, rhistory, pnumber, rtype, timezone($3, shipdate) AS shipdate, deliverymethod, trackingnumber, pressure, disposition, (SELECT array_agg(ic.component) FROM (SELECT component FROM railcomponent WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_component, (SELECT array_agg(ic.serialnumber) FROM (SELECT serialnumber FROM railcomponent WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_serialnr, (SELECT array_agg(ic.manufacturingdate) FROM (SELECT manufacturingdate FROM railcomponent WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_mdate, (SELECT array_agg(ic.notes) FROM (SELECT notes FROM railcomponent WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_notes, (SELECT array_agg(ic.generation) FROM (SELECT generation FROM railcomponent WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_generations, (SELECT array_agg(ic.partnumber) FROM (SELECT partnumber FROM railcomponent WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_partnumber, (SELECT array_agg(ic.arrivaldate) FROM (SELECT arrivaldate FROM railcomponent WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_arrivaldate, (SELECT array_agg(ic.moedate) FROM (SELECT moedate FROM railcomponent WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_moedate, (SELECT array_agg(ic.tfrdate) FROM (SELECT tfrdate FROM railcomponent WHERE tlrid = request.tlrid ORDER BY trow) AS ic) AS arr_tfrdate FROM request INNER JOIN railrequest ON request.tlrid = railrequest.tlrid LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid WHERE request.tlrid = $1 AND ((requester = $2 OR requestworker.userid = $2 OR requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $2) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $2)) OR (request.tlrid NOT IN (SELECT DISTINCT tlrid FROM requestworker) AND (SELECT auth FROM accounts WHERE userid = $2) >= 2))';
	// run query to get the data
	pool.query(query, [tlrid, request.session.userid, 'utc'], async (error, results) => {
		// if the logged in user is neither the author nor assigned, block the export
		if (results.rows.length == 0){
			response.status(403).send();
			return
		}

		// get results
		var result = results.rows[0];

		// load the excel template
		const workbook = new exceljs.Workbook();
		await workbook.xlsx.readFile(process.env.SERVERPATH + '/files/railtemplate.xlsx');

		// get the sheet
		var row = workbook.worksheets[0].getRow(3);

		// fill the cells
		row.getCell('D').value = "n/a";
		row.getCell('F').value = "n/a";
		row.getCell('H').value = tlrid;
		row.getCell('I').value = "n/a";
		if (result.customer.toLowerCase() == "internal" || result.customer.toLowerCase() ==  "bosch") {
			row.getCell('J').value = "internal";
			row.getCell('K').value = "Bosch";
		} else {
			row.getCell('J').value = "customer";
			row.getCell('K').value = result.customer;
		}
		row.getCell('L').value = result.rtype;
		row.getCell('M').value = result.pressure;
		row.getCell('N').value = result.pnumber;

		if (result.runtimeunit = "Miles") {
			row.getCell('AI').value = result.pnumber + " mls";
		} else if (result.runtimeunit = "Hours") {
			row.getCell('AI').value = result.pnumber + " h";
		} else {
			row.getCell('AI').value = result.pnumber + " km";
		}
		row.getCell('BA').value = result.rinfo;
		row.getCell('BC').value = result.rhistory;
		row.getCell('BD').value = result.fuel;

		var componentnr = 1;
		for (i in result.arr_component) {
			if (result.arr_component[i] == "Rail") {
				row.getCell('O').value = result.arr_generations[i];
				row.getCell('R').value = result.arr_partnumber[i];
				row.getCell('S').value = result.arr_serialnr[i];
				var date = new Date (result.arr_mdate[i]);
				row.getCell('T').value = date.getDate();
				row.getCell('U').value = date.getMonth() + 1;
				row.getCell('V').value = date.getFullYear() % 100;

				var arrivaldate = new Date (result.arr_arrivaldate[i]);
				row.getCell('AJ').value = arrivaldate.getDate() + "." + (arrivaldate.getMonth() + 1) + "." + arrivaldate.getFullYear();

				var moedate = new Date (result.arr_moedate[i]);
				row.getCell('AK').value = moedate.getDate() + "." + (moedate.getMonth() + 1) + "." + moedate.getFullYear();

				var tfrdate = new Date (result.arr_tfrdate[i]);
				row.getCell('AL').value = tfrdate.getDate() + "." + (tfrdate.getMonth() + 1) + "." + tfrdate.getFullYear();
			} else {
				if (componentnr == 1 && result.arr_component[i] != "Rail") {
					row.getCell('W').value = result.arr_generations[i];
					row.getCell('X').value = result.arr_partnumber[i];
					row.getCell('Y').value = result.arr_serialnr[i];
					var date = new Date (result.arr_mdate[i]);
					row.getCell('Z').value = date.getDate();
					row.getCell('AA').value = date.getMonth() + 1;
					row.getCell('AB').value = date.getFullYear() % 100;
					componentnr += 1;
				} else if (componentnr == 2 && result.arr_component[i] != "Rail") {
					row.getCell('AC').value = result.arr_generations[i];
					row.getCell('AD').value = result.arr_partnumber[i];
					row.getCell('AE').value = result.arr_serialnr[i];
					var date = new Date (result.arr_mdate[i]);
					row.getCell('AF').value = date.getDate();
					row.getCell('AG').value = date.getMonth() + 1;
					row.getCell('AH').value = date.getFullYear() % 100;
					componentnr += 1;
				}
			}
		}

		// save workbook
		await workbook.xlsx.writeFile(process.env.SERVERPATH + '/files/rail.xlsx');

		// send file to user
		response.sendFile(process.env.SERVERPATH + '/files/rail.xlsx');
	});
}

const getProgressSummaryByTLRID = (request, response) => {
	// Grab TLR-ID from query parameter
	var tlrid = request.query.tlrid;

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Select and return a summary of the progress
	pool.query('SELECT (SELECT name FROM accounts WHERE accounts.userid = requester) AS requester, timezone($4, opened) AS opened, block, request.category, (SELECT string_agg(accounts.name, $3) FROM requestworker LEFT JOIN accounts ON requestworker.userid = accounts.userid WHERE requestworker.tlrid = request.tlrid) AS workers, SUM(CASE finished WHEN true THEN 1 ELSE 0 END), COUNT(step) FROM request LEFT JOIN requestworker ON request.tlrid = requestworker.tlrid LEFT JOIN progress ON request.tlrid = progress.tlrid LEFT JOIN accounts ON accounts.userid = requestworker.userid WHERE request.tlrid = $1 AND (requester = $2 OR requestworker.userid = $2 OR requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $2) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $2)) GROUP BY request.tlrid, requestworker.userid, accounts.name', [tlrid, request.session.userid, ', ', 'utc'], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const getCylinderByTLRID = (request, response) => {
	// Grab TLR-ID from query parameter
	var tlrid = request.query.tlrid;

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Select and return the assigned Cylinders
	pool.query('SELECT DISTINCT trow, cylindernr, bpn, cpn, serialnr, plant, mdate, notes FROM injectorcylinder INNER JOIN request ON injectorcylinder.tlrid = request.tlrid LEFT JOIN requestworker ON injectorcylinder.tlrid = requestworker.tlrid WHERE injectorcylinder.tlrid = $1 AND ((requester = $2 OR requestworker.userid = $2 OR requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $2) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $2)) OR (request.tlrid NOT IN (SELECT DISTINCT tlrid FROM requestworker) AND (SELECT auth FROM accounts WHERE userid = $2) >= 2))', [tlrid, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const getRailComponentByTLRID = (request, response) => {
	// Grab TlR-ID from query parameter
	var tlrid = request.query.tlrid;

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Select and return the assigned Cylinders
	pool.query('SELECT DISTINCT trow, component, generation, partnumber, serialnumber, manufacturingdate, odometerunit, odometervalue, timezone($3, arrivaldate) AS arrivaldate, timezone($3, moedate) AS moedate, timezone($3, tfrdate) AS tfrdate, notes FROM railcomponent INNER JOIN request ON railcomponent.tlrid = request.tlrid LEFT JOIN requestworker ON railcomponent.tlrid = requestworker.tlrid WHERE railcomponent.tlrid = $1 AND ((requester = $2 OR requestworker.userid = $2 OR requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $2) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $2)) OR (request.tlrid NOT IN (SELECT DISTINCT tlrid FROM requestworker) AND (SELECT auth FROM accounts WHERE userid = $2) >= 2))', [tlrid, request.session.userid, 'utc'], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const getDefaultComponentsByTLRID = (request, response) => {
	// Grab TLR-ID from query parameter
	var tlrid = request.query.tlrid;

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Select and return the assigned Cylinders
	pool.query('SELECT DISTINCT trow, componentnr, bpn, cpn, serialnr, plant, mdate, notes FROM defaultcomponent INNER JOIN request ON defaultcomponent.tlrid = request.tlrid LEFT JOIN requestworker ON defaultcomponent.tlrid = requestworker.tlrid WHERE defaultcomponent.tlrid = $1 AND ((requester = $2 OR requestworker.userid = $2 OR requester IN (SELECT memberid FROM teamleaders WHERE leaderid = $2) OR requestworker.userid IN (SELECT memberid FROM teamleaders WHERE leaderid = $2)) OR (request.tlrid NOT IN (SELECT DISTINCT tlrid FROM requestworker) AND (SELECT auth FROM accounts WHERE userid = $2) >= 2))', [tlrid, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const getAllAccounts = (request, response) => {
	// Check if user is logged in
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// Select all userids assigned to the tlrid
	pool.query('SELECT userid, name FROM accounts ORDER BY name', [], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const getAssignedAccounts = (request, response) => {
	// Check if user is authorized to access assigned workers
	if (request.session.userid == undefined || request.session.authorization < 2) {
		response.status(401).send();
		return
	}

	// Grab TLR-ID from query parameter
	var tlrid = request.query.tlrid;

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Select all userids assigned to the tlrid
	pool.query('SELECT requestworker.userid, accounts.name FROM requestworker LEFT JOIN accounts ON accounts.userid = requestworker.userid WHERE tlrid = $1 ORDER BY accounts.name', [tlrid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const getAvailableAccounts = (request, response) => {
	// Check if user is authorized to access assigned workers
	if (request.session.userid == undefined || request.session.authorization < 2) {
		response.status(401).send();
		return
	}

	// Grab tlrid from query parameter
	var tlrid = request.query.tlrid;

	// check if required data is missing
	for (let data of [tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Select all userids that are not assigned to the request
	pool.query('SELECT userid, name FROM accounts WHERE userid NOT IN (SELECT userid FROM requestworker WHERE tlrid=$1) ORDER BY name', [tlrid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const assignAccountToTLRID = (request, response) => {
	// Check if user is authorized to access assigned workers
	if (request.session.userid == undefined || request.session.authorization < 2) {
		response.status(401).send();
		return
	}

	// Grab userid and tlrid
	var { userid, tlrid } = request.body;

	// check if required data is missing
	for (let data of [userid, tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Assign the user to the request
	pool.query('INSERT INTO requestworker (tlrid, userid) VALUES ($1, $2)', [tlrid, userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(201).send();
		}
	});
}

const unassignAccountToTLRID = (request, response) => {
	// Check if user is authorized to access assigned workers
	if (request.session.userid == undefined || request.session.authorization < 2) {
		response.status(401).send();
		return
	}

	// Grab userid and tlrid
	var { userid, tlrid } = request.body;

	// check if required data is missing
	for (let data of [userid, tlrid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Unassign the user to the request
	pool.query('DELETE FROM requestworker WHERE tlrid=$1 AND userid=$2', [tlrid, userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(204).send();
		}
	});
}

const registerUser = (request, response) => {
	const { userid, pw, name, email, phone, location, department } = request.body;

	// check if required data is missing
	for (let data of [userid, name, pw]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if a user with this id already exists
	pool.query('SELECT userid FROM accounts WHERE userid = $1', [userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		}
		// Deny registration if an account was found
		if (results.rows.length > 0) {
			response.status(409).send("Userid already in use!");
			return
		} else {
			// Check if the password fulfills all requirements
			var pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&+\-_.])[A-Za-z\d@$!%*#?&+\-_.]{12,}$/;

			if (!pwRegex.test(pw)) {
				response.status(400).send("Invalid Password!");
				return
			}

			// use bcrypt to hash the password (async) and store the result in the db
			bcrypt.hash(pw, saltRounds, function(err, hash) {
				pool.query('INSERT INTO accounts (userid, pw, name, email, phone, location, department, auth) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [userid.toString().toUpperCase(), hash, name, email, phone, location, department, 0], (error, results) => {
					if (error) {
						response.status(500).send();
						console.error(error);
						return
					} else {
						response.status(201).send();
					}
				})
			});
		}
	})
}

const getUserDetails = (request, response) => {
	// Grab userid from query
	var userid = request.query.userid;

	// Verify Account by checking if session exists
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// check if required data is missing
	for (let data of [userid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Select and return the user details
	pool.query('SELECT name, email, phone, location, department FROM accounts WHERE userid = $1', [userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const updateUserDetails = (request, response) => {
	// Grab data from body
	const { name, email, phone, department, location } = request.body;

	// Check if user is logged in
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// check if required data is missing
	for (let data of [userid, name]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Update values stored in db
	pool.query('UPDATE accounts SET name=$1, email=$2, phone=$3, location=$4, department=$5 WHERE userid=$6', [name, email, phone, department, location, request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(204).send();
		}
	});
}

const getUserAuthorizations = (request, response ) => {
	// Check if user is authorized to get all users and their authorization
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// Select and return all acounts with their authorization levels
	pool.query('SELECT userid, auth, name FROM accounts ORDER BY userid ASC', [], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const getTeamMembers = (request, response ) => {
	// Check if user is authorized to get all accounts marked as possible team members
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// Select and return all users with at least authorization level 1 (team members) and their teamleaders
	pool.query('SELECT userid, name, (SELECT string_agg(accounts.name, $2) FROM teamleaders LEFT JOIN accounts ON teamleaders.leaderid = accounts.userid WHERE teamleaders.memberid = accs.userid) AS teamleaders FROM accounts AS accs WHERE auth>=$1 ORDER BY userid ASC', [1, ', '], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const getTeamLeaders = (request, response ) => {
	// Check if user is authorized to get all possible team leaders
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// Select and return all users with authorization level 2 (team leaders) or higher
	pool.query('SELECT userid, name FROM accounts WHERE auth>=$1 ORDER BY userid ASC', [2], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const updateUserAuthorization = (request, response) => {
	// Grab data from body
	const { userid, auth } = request.body;

	// Check if user is authorized to change authorization levels
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// check if required data is missing
	for (let data of [userid]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}
	// check if required data is missing
	for (let data of [auth]) {
		if (isNaN(data) || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Update the auth-level
	pool.query('UPDATE accounts SET auth = $1 WHERE userid = $2', [auth, userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(204).send();
		}
	});
}

const updateAssignedTeamLeader = (request, response) => {
	// Grab data from body
	const { member, leader } = request.body;

	// Check if user is authorized to change authorization levels
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}
	// check if required data is missing
	for (let data of [member, leader]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Update the assigned team leader
	pool.query('INSERT INTO teamleaders (leaderid, memberid) VALUES ($1, $2)', [leader, member], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(204).send();
		}
	});
}

const removeAssignedTeamLeader = (request, response) => {
	// Grab data from body
	const { member, leader } = request.body;

	// Check if user is authorized to change authorization levels
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// check if required data is missing
	for (let data of [member, leader]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Update the assigned team leader
	pool.query('DELETE FROM teamleaders WHERE leaderid = $1 AND memberid = $2', [leader, member], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(204).send();
		}
	});
}

const loginUser = (request, response) => {
	const { userid, pw } = request.body;

	// check if required data is missing
	for (let data of [userid, pw]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if a user with this id exists
	pool.query('SELECT pw, auth FROM accounts WHERE userid = $1', [userid.toString().toUpperCase()], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		}
		// Block login for unknown users
		if (results.rows.length == 0) {
			response.status(400).send("User-ID or Password wrong!");
			return
		} else {
			// Check if password is correct
			bcrypt.compare(pw, results.rows[0].pw, function(err, result) {
				// check for error
				if (err) {
					response.status(500).send();
					throw err;
					return
				}
				// Block login with wrong passwords
				if (result == false) {
					response.status(400).send("User-ID or Password wrong!");
				} else {
					// regenerate session
					request.session.regenerate(function(err) {
						// set authenticated user and authorization
						request.session.userid = userid.toString().toUpperCase();
						request.session.authorization = results.rows[0].auth;
						response.status(200).send('' + request.session.authorization);
					})
				}
			});
		}
	});
}

const logoutUser = (request, response) => {
	request.session.destroy(function(err) {
		if (err) {
			response.status(500).send();
		} else {
			response.status(200).send('{}');
		}
	});
}

const changePassword = (request, response) => {
	// Grab data from body
	const { pwo, pwn } = request.body;

	// Check if a user is logged in
	if (request.session.userid == undefined) {
		response.status(401).send();
		return
	}

	// check if required data is missing
	for (let data of [pwo, pwn]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if password is according to rules
	var pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&+\-_.])[A-Za-z\d@$!%*#?&+\-_.]{12,}$/;

	if (!pwRegex.test(pwn)) {
		response.status(400).send("Invalid Password!");
		return
	}

	// Check if a user with this id exists
	pool.query('SELECT pw FROM accounts WHERE userid = $1', [request.session.userid], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
			return
		}
		// Block changes for unknown users
		if (results.rows.length == 0) {
			response.status(401).send();
			return
		} else {
			// Check if password is correct
			bcrypt.compare(pwo, results.rows[0].pw, function(err, result) {
				// check for error
				if (err) {
					response.status(500).send();
					throw err;
					return
				}
				// Block login with wrong passwords
				if (result == false) {
					response.status(401).send();
				} else {
					// use bcrypt to hash the password (async) and store the result in the db
					bcrypt.hash(pwn, saltRounds, function(err, hash) {
						pool.query('UPDATE accounts SET pw = $1 WHERE userid = $2', [hash, request.session.userid], (error, results) => {
							if (error) {
								response.status(500).send();
								console.error(error);
								return
							} else {
								response.status(201).send();
							}
						})
					});
				}
			});
		}
	});
}

const changePasswordAdmin = (request, response) => {
	// Grab data from body
	const { userid, pwn } = request.body;

	// Check if a user is logged in
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// check if required data is missing
	for (let data of [userid, pwn]) {
		if (data.length == 0 || data == undefined || data == null) {
			response.status(400).send();
			return
		}
	}

	// Check if password is according to rules
	var pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&+\-_.])[A-Za-z\d@$!%*#?&+\-_.]{12,}$/;

	if (!pwRegex.test(pwn)) {
		response.status(400).send("Invalid Password!");
		return
	}

	// use bcrypt to hash the password (async) and store the result in the db
	bcrypt.hash(pwn, saltRounds, function(err, hash) {
		pool.query('UPDATE accounts SET pw = $1 WHERE userid = $2', [hash, userid], (error, results) => {
			if (error) {
				response.status(500).send();
				console.error(error);
				return
			} else {
				response.status(201).send();
			}
		})
	});
}

const changeLogo = (request, response) => {
	// Check if a user is logged in
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	// Check if a file was uploaded
	if(!request.files) {
        response.status(400).send();
	} else {
		var logo = request.files.logo;

		// Check if a .jpg is uploaded
		if (logo.name.split(".")[logo.name.split(".").length - 1] != 'jpg'){
			response.status(401).send();
			return
		} else {
			// replace old logo file
			logo.mv('./resources/icon/Orion Logo.jpg');
			response.status(204).send();
		}
	}
}

const getLandingPageText = (request, response) => {
	// Return the strings for the landing page stored in the DB
	pool.query('SELECT heading, subheading, warningheading, paragraph1, paragraph2 FROM startingpage WHERE nr=$1', [1], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(200).json(results.rows);
		}
	});
}

const updateLandingPage = (request, response) => {
	// Grab data from body
	const { heading, subheading, warningheading, paragraph1, paragraph2 } = request.body;

	// Check if a user is logged in
	if (request.session.userid == undefined || request.session.authorization < 4) {
		response.status(401).send();
		return
	}

	if (heading.length > 9999 || subheading > 9999 || warningheading > 9999 || paragraph1 > 9999 || paragraph2 > 9999){
		response.status(400).send();
		return
	}

	pool.query('UPDATE startingpage SET heading = $2, subheading = $3, warningheading = $4, paragraph1 = $5, paragraph2 = $6 WHERE nr=$1', [1, heading, subheading, warningheading, paragraph1, paragraph2], (error, results) => {
		if (error) {
			response.status(500).send();
			console.error(error);
		} else {
			response.status(204).send();
		}
	});
}

module.exports = {
  pool,
  createInjectorRequest,
  createRailRequest,
  createNozzleRequest,
  createPumpRequest,
  createDefaultRequest,
  copyRequest,
  updateInjectorRequest,
  updateRailRequest,
  updateNozzleRequest,
  updatePumpRequest,
  updateDefaultRequest,
  closeRequest,
  getClosingData,
  reopenRequest,
  createProgressRouter,
  copyProgressRouter,
  createProgressRouterTemplate,
  getProgressRouterTemplates,
  getAllProgressRouterTemplates,
  makeProgressTemplateGlobal,
  deleteGlobalTemplate,
  copyProgressRouterTemplate,
  updateProgressRouter,
  finishProgressStep,
  updateProgressBlock,
  getProgressByTLRID,
  getBlockByTLRID,
  getCategories,
  insertCategory,
  deleteCategory,
  getCustomers,
  insertCustomer,
  deleteCustomer,
  getProjects,
  insertProject,
  deleteProject,
  getGenerations,
  insertGeneration,
  deleteGeneration,
  getSpecificGenerations,
  getComponentGenerationByCategory,
  getComponentGenerationByComponent,
  getComponentGenerationByCategoryCombined,
  getComponentGeneration,
  insertComponentGeneration,
  deleteComponentGeneration,
  getProducts,
  insertProduct,
  deleteProduct,
  getSpecificProducts,
  getProjectTypes,
  insertProjectType,
  deleteProjectType,
  getSpecificProjectTypes,
  getDisposition,
  insertDisposition,
  deleteDisposition,
  getProgressCategories,
  insertProgressCategories,
  deleteProgressCategories,
  getAllRequests,
  getOpenRequests,
  getOpenTeamRequests,
  getBlockedTeamRequests,
  getUnassignedRequests,
  getClosedRequests,
  getStatusboardRequests,
  getRequestByTLRID,
  createReturnSheet,
  createRailExport,
  getProgressSummaryByTLRID,
  getCylinderByTLRID,
  getRailComponentByTLRID,
  getDefaultComponentsByTLRID,
  getAllAccounts,
  getAssignedAccounts,
  getAvailableAccounts,
  assignAccountToTLRID,
  unassignAccountToTLRID,
  registerUser,
  getUserDetails,
  updateUserDetails,
  getUserAuthorizations,
  getTeamMembers,
  getTeamLeaders,
  updateUserAuthorization,
  updateAssignedTeamLeader,
  removeAssignedTeamLeader,
  loginUser,
  logoutUser,
  changePassword,
  changePasswordAdmin,
  changeLogo,
  getLandingPageText,
  updateLandingPage,
}
