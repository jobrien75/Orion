CREATE DATABASE orion;

CREATE TABLE "orion_sessions" (
    "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "orion_sessions" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "orion_sessions" ("expire");


CREATE TABLE accounts (
	userid VARCHAR(255) PRIMARY KEY,
	pw VARCHAR(255),
	name VARCHAR(255),
	email VARCHAR(255),
	phone VARCHAR(255),
	location VARCHAR(255),
	department VARCHAR(255),
	auth INTEGER
);

CREATE TABLE teamleaders(
	memberid VARCHAR(255),
	leaderid VARCHAR(255),
	CONSTRAINT pkey_teamleaders PRIMARY KEY (memberid, leaderid)
);

CREATE TABLE request (
	tlrid VARCHAR(255) PRIMARY KEY, 
	requester VARCHAR(255),
	opened TIMESTAMP,
	closed TIMESTAMP,
	block VARCHAR(9999),
	rcomment VARCHAR(9999),
	category VARCHAR(255)
);

CREATE TABLE progress (
	tlrid VARCHAR(255),
	step INTEGER,
	description VARCHAR(9999),
	finished BOOLEAN,
	userid VARCHAR(255),
	fdate TIMESTAMP,
	fcomment VARCHAR(9999),
	category VARCHAR(255),
	CONSTRAINT rsid PRIMARY KEY (tlrid, step)
);

CREATE TABLE progresscategories (
	category VARCHAR(255) PRIMARY KEY,
	icon VARCHAR(255)
);

CREATE TABLE progresstemplate (
	templatename VARCHAR(255),
	templateowner VARCHAR(255),
	step INTEGER,
	description VARCHAR(9999),
	fcomment VARCHAR(9999),
	category VARCHAR(255),
	CONSTRAINT pkey_progresstemplate PRIMARY KEY (templatename, templateowner, step)
);

CREATE TABLE injectorRequest (
	tlrid VARCHAR(255) PRIMARY KEY,
	generation VARCHAR(255),
	product VARCHAR(255),
	customer VARCHAR(255),
	customerproject VARCHAR(255),
	rinfo VARCHAR(9999),
	testtype VARCHAR(255),
	specifications VARCHAR(9999),
	rhistory VARCHAR(9999),
	pnumber VARCHAR(255),
	rtype VARCHAR(255),
	shipdate TIMESTAMP,
	deliverymethod VARCHAR(255),
	trackingnumber VARCHAR(255),
	vetype VARCHAR(255),
	vin VARCHAR(255),
	enginenr VARCHAR(255),
	runtimeunit VARCHAR(255),
	runtime INTEGER,
	fuel VARCHAR(255),
	disposition VARCHAR(255)
);

CREATE TABLE injectorcylinder (
	tlrid VARCHAR(255),
	trow VARCHAR(255), 
	cylindernr VARCHAR(255),
	bpn VARCHAR(255),
	cpn VARCHAR(255),
	serialnr VARCHAR(255),
	plant VARCHAR(255),
	mdate VARCHAR(255),
	notes VARCHAR(9999),
	CONSTRAINT cid PRIMARY KEY (tlrid, trow)
);

CREATE TABLE railrequest (
	tlrid VARCHAR(255) PRIMARY KEY,
	generation VARCHAR(255),
	customer VARCHAR(255),
	customerproject VARCHAR(255),
	rinfo VARCHAR(9999),
	specifications VARCHAR(9999),
	rhistory VARCHAR(9999),
	pnumber VARCHAR(255),
	rtype VARCHAR(255),
	shipdate TIMESTAMP,
	deliverymethod VARCHAR(255),
	trackingnumber VARCHAR(255),
	pressure VARCHAR(255),
	disposition VARCHAR(255)
);

CREATE TABLE railcomponent(
	tlrid VARCHAR(255),
	trow VARCHAR(255),
	component VARCHAR(255),
	generation VARCHAR(255),
	partnumber VARCHAR(255),
	serialnumber VARCHAR(255),
	manufacturingdate VARCHAR(255),
	odometerunit VARCHAR(255),
	odometervalue VARCHAR(255),
	arrivaldate TIMESTAMP,
	moedate TIMESTAMP,
	tfrdate TIMESTAMP,
	notes VARCHAR(9999),
	CONSTRAINT rcid PRIMARY KEY (tlrid, trow)
);

CREATE TABLE componentgenerations (
	category VARCHAR(255),
	component VARCHAR(255),
	generation VARCHAR(255),
	CONSTRAINT pkey_componentgenerations PRIMARY KEY (category, component, generation)
);

CREATE TABLE nozzleRequest (
	tlrid VARCHAR(255) PRIMARY KEY,
	injector VARCHAR(255),
	model VARCHAR(255),
	nozzle VARCHAR(255),
	product VARCHAR(255),
	customer VARCHAR(255),
	customerproject VARCHAR(255),
	rinfo VARCHAR(9999),
	testtype VARCHAR(255),
	specifications VARCHAR(9999),
	rhistory VARCHAR(9999),
	pnumber VARCHAR(255),
	rtype VARCHAR(255),
	shipdate TIMESTAMP,
	deliverymethod VARCHAR(255),
	trackingnumber VARCHAR(255),
	vetype VARCHAR(255),
	vin VARCHAR(255),
	enginenr VARCHAR(255),
	runtimeunit VARCHAR(255),
	runtime INTEGER,
	fuel VARCHAR(255),
	disposition VARCHAR(255),
	bims VARCHAR(255)
);

CREATE TABLE pumprequest (
	tlrid VARCHAR(255) PRIMARY KEY,
	generation VARCHAR(255),
	product VARCHAR(255),
	customer VARCHAR(255),
	customerproject VARCHAR(255),
	rinfo VARCHAR(9999),
	specifications VARCHAR(9999),
	rhistory VARCHAR(9999),
	pnumber VARCHAR(255),
	rtype VARCHAR(255),
	shipdate TIMESTAMP,
	deliverymethod VARCHAR(255),
	trackingnumber VARCHAR(255),
	vin VARCHAR(255),
	enginenr VARCHAR(255),
	fuel VARCHAR(255),
	pressure VARCHAR(255),
	disposition VARCHAR(255)
);

CREATE TABLE defaultRequest (
	tlrid VARCHAR(255) PRIMARY KEY,
	product VARCHAR(255),
	customer VARCHAR(255),
	customerproject VARCHAR(255),
	rinfo VARCHAR(9999),
	specifications VARCHAR(9999),
	rhistory VARCHAR(9999),
	pnumber VARCHAR(255),
	rtype VARCHAR(255),
	shipdate TIMESTAMP,
	deliverymethod VARCHAR(255),
	trackingnumber VARCHAR(255),
	additionalinfo VARCHAR(9999),
	disposition VARCHAR(255)
);

CREATE TABLE defaultcomponent (
	tlrid VARCHAR(255),
	trow VARCHAR(255),
	componentnr VARCHAR(255),
	bpn VARCHAR(255),
	cpn VARCHAR(255),
	serialnr VARCHAR(255),
	plant VARCHAR(255),
	mdate VARCHAR(255),
	notes VARCHAR(9999),
	CONSTRAINT coid PRIMARY KEY (tlrid, trow)
);

CREATE TABLE requestworker (
	tlrid VARCHAR(255),
	userid VARCHAR(255),
	CONSTRAINT rwid PRIMARY KEY (tlrid, userid)
);

CREATE TABLE category (
	categoryname VARCHAR(255) PRIMARY KEY
);

CREATE TABLE customer(
	customername VARCHAR(255) PRIMARY KEY
);

CREATE TABLE projects(
	mcrid VARCHAR(255) PRIMARY KEY,
	mcridtext VARCHAR(9999),
	pdcl VARCHAR(255),
	rbu VARCHAR(16)
);

CREATE TABLE generations (
	generation VARCHAR(255),
	category VARCHAR(255),
	CONSTRAINT generationkey PRIMARY KEY (generation, category)
);

CREATE TABLE products (
	product VARCHAR(255),
	category VARCHAR(255),
	CONSTRAINT productkey PRIMARY KEY (product, category)
);

CREATE TABLE projecttypes (
	projecttype VARCHAR(255),
	category VARCHAR(255),
	CONSTRAINT projecttypekey PRIMARY KEY (projecttype, category)
);

CREATE TABLE disposition (
	disposition VARCHAR(255) PRIMARY KEY
);

CREATE TABLE startingpage (
	nr INTEGER PRIMARY KEY,
	heading VARCHAR(9999),
	subheading VARCHAR(9999),
	warningheading VARCHAR(9999),
	paragraph1 VARCHAR(9999),
	paragraph2 VARCHAR(9999)
);

CREATE TABLE closingdata (
	tlrid VARCHAR(255) PRIMARY KEY,
	userid VARCHAR(255),
	results VARCHAR(9999),
	disposition VARCHAR(9999)
);