// https://www.freecodecamp.org/news/express-explained-with-examples-installation-routing-middleware-and-more/
// https://medium.com/@viral_shah/express-middlewares-demystified-f0c2c37ea6a1
// https://www.sohamkamani.com/blog/2018/05/30/understanding-how-expressjs-works/

require('dotenv').config();
var port = 8000;
var express = require('express');
var app = express();
const bcrypt = require('bcrypt');
const { randomBytes } = require('crypto');
const { generateAccessToken, authenticateToken, tokenExpiryTime } = require('./authorization');

const { Pool } = require('pg')
const pool = new Pool({
	user: 'webdbuser',
	host: 'localhost',
	database: 'webdb',
	password: 'password',
	port: 5432
});

const bodyParser = require('body-parser'); // we used this middleware to parse POST bodies

function isObject(o) { return typeof o === 'object' && o !== null; }
function isNaturalNumber(value) { return /^\d+$/.test(value); }

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(bodyParser.raw()); // support raw bodies

// Non authenticated route. Can visit this without credentials
app.post('/api/test', function (req, res) {
	res.status(200);
	res.json({ "message": "got here" });
});

app.post('/api/register', (req, res) => {

	const credentials = {
		username: req.body.username,
		password: bcrypt.hashSync(req.body.password, 5)
	}

	let sql = 'INSERT INTO ftduser(username, password) VALUES ($1,$2);';
	pool.query(sql, [credentials.username, credentials.password], (err, pgRes) => {
		if (err && err.code == 23505) { // pg duplicate key error
			res.status(409);
			res.json({ "error": `${credentials.username} is already in database` });
			return;
		}
		if (err) {
			res.status(500);
			res.json({ "error": err.message });
			return;
		}

		res.status(201).send({ "res": "registration successful" });
	});

});


app.use('/', express.static('static_content'));

app.get('/models/:model', (req, res) => {
	res.status(200).sendFile(`${__dirname}/static_content/models/${req.params.model}.js`);
});

// All routes below /api/auth require credentials 
app.post('/api/login', function (req, res) {
	if (!req.body.username || !req.body.password) {
		res.status(401).send({
			error: "Authorization error",
			info: "Missing credentials"
		});
	}
	try {
		const { username, password } = req.body;

		let sql = 'SELECT * FROM ftduser WHERE username=$1';
		pool.query(sql, [username], (err, pgRes) => {
			const hash = pgRes.rowCount > 0 ? pgRes.rows[0].password.toString() : '';
			if (err) {
				res.status(401).json({
					error: 'Not authorized',
					info: 'Invalid username or password'
				});
			} else if (pgRes.rowCount == 1 && bcrypt.compareSync(password, hash)) {
				res.status(200);
				const token = generateAccessToken({ username });
				res.json({
					"message": "authentication success",
					authorization: token,
					duration: tokenExpiryTime
				});
			} else {
				res.status(401).json({
					error: 'Not authorized',
					info: 'Invalid username or password'
				});
			}
		});
	} catch (err) {
		res.status(401).json({
			error: 'Not authorized',
			info: 'Invalid username or password'
		});
	}
});

app.use(authenticateToken);

app.post('/api/auth/reportGame', (req, res) => {
	const {score, kills, round} = req.body;
	const v = (field) => {
		return (typeof field === "number");
	}

	if (!v(score) || !v(kills) || !v(round)) {
		res.status(406).send({
			error: 'Payload validation error',
			info: 'Payload is missing one of the required parameters'
		});
		return;
	}

	try {
		const gameID = randomBytes(8).toString('hex');
		let sql = 'INSERT INTO gameStats Values($1, $2, $3, $4, $5)';
		const args = [gameID, req.username, score, kills, round];
		pool.query(sql, args, (err, pgRes) => {
			if (err) {
				res.status(401).json({
					error: 'DB error',
					info: err.message
				});
			} else {
				res.status(201).send({
					message: 'stats successfully saved'
				});
			}
		});
	} catch (err) {
		res.status(401).json({
			error: 'DB error',
			info: err.toString()
		});
	}
});

app.post('/api/auth/test', function (req, res) {
	res.status(200);
	res.json({ "message": "got to /api/auth/test" });
});

app.listen(port, function () {
	console.log('Example app listening on port ' + port);
});

