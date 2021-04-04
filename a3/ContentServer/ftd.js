// https://www.freecodecamp.org/news/express-explained-with-examples-installation-routing-middleware-and-more/
// https://medium.com/@viral_shah/express-middlewares-demystified-f0c2c37ea6a1
// https://www.sohamkamani.com/blog/2018/05/30/understanding-how-expressjs-works/

require('dotenv').config();
var port = 8000;
var express = require('express');
var app = express();
const bcrypt = require('bcrypt');
const { Validator } = require('node-input-validator');
const { randomBytes } = require('crypto');
const { generateAccessToken, authenticateToken, tokenExpiryTime } = require('./authorization');
const cors = require('cors');

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

const VALIDATE_EMAIL = (email) => {
	const v = new Validator({ email }, {
		email: 'required|email'
	});
	return v.check();
}

const VALIDATE_USERNAME = (u) => {
	const v = new Validator({ u }, {
		u: 'required|string|minLength:3'
	});
	return v.check();
}

const VALIDATE_GENDER = (g) => {
	return (g === 'M' || g === 'F' || g === 'O')
}

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
// app.use(bodyParser.raw()); // support raw bodies

// Non authenticated route. Can visit this without credentials
app.post('/api/test', function (req, res) {
	res.status(200);
	res.json({ "message": "got here" });
});

app.post('/api/register', async (req, res) => {

	const credentials = {
		username: req.body.username,
		password: bcrypt.hashSync(req.body.password, 5),
		gender: req.body.gender,
		email: req.body.email
	}

	if (!(await VALIDATE_USERNAME(credentials.username)) || !VALIDATE_GENDER(credentials.gender)
	|| !(await VALIDATE_EMAIL(credentials.email))) {
		res.status(400).send({ 
			error: 'Validation error',
			info: 'Input is invalid'
		});
		return;
	}

	let sql = 'INSERT INTO ftduser VALUES ($1, $2, $3, $4);';
	pool.query(sql, [credentials.username, credentials.password, credentials.gender, credentials.email],
		(err, pgRes) => {
		if (err && err.code == 23505) { // pg duplicate key error
			res.status(409);
			res.json({
				"error": `${credentials.username} is already in database`,
				'info': 'Given Username already exists'
			});
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

app.get('/controllers/:controller', (req, res) => {
	res.status(200).sendFile(`${__dirname}/static_content/controllers/${req.params.controller}.js`);
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

app.get('/api/auth', (req, res) => {
	res.status(200).send({
		username: req.username
	});
});

app.patch('/api/auth/profile/update', async (req, res)=> {
	const { username, email, gender } = req.body;
	// validate input here
	if (!(await VALIDATE_USERNAME(username)) || !VALIDATE_GENDER(gender)
	|| !(await VALIDATE_EMAIL(email))) {
		res.status(400).send({ 
			error: 'Validation error',
			info: 'Input is invalid'
		});
		return;
	}

	try {
		let sql = "UPDATE ftduser set username=$1, email=$2, gender=$3 WHERE username=$4";
		const args = [username, email, gender, req.username];
		pool.query(sql, args, (err, pgRes) => {
			if (err && err.code == 23505) {
				res.status(409).send({
					error: 'DB error',
					info: 'User with given username already exists'
				})
			}
			else if (err) {
				res.status(500).send({
					error: 'DB error',
					info: 'update failed'
				});
			} else {
				// generate a new token with the new username encoded in the token
				const token = generateAccessToken({ username });
				res.status(200).send({
					message: 'Update successful',
					authorization: token,
					duration: tokenExpiryTime
				});
			}
		});
	} catch (error) {
		res.status(500).send({
			error,
			info: 'database error'
		});
	}
});

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

app.get('/api/auth/profile', (req, res)=> {

	try {
		let sql = 'SELECT * FROM ftduser WHERE username=$1';
		const args = [req.username];
		pool.query(sql, args, (err, pgRes) => {
			if (err) {
				res.status(401).json({
					error: 'DB error',
					info: err.message
				});
			}
			else if (pgRes.rowCount === 1) {
				res.status(201).send(pgRes.rows[0]);
			}
			else {
				res.status(404).send({
					error: 'Invalid Request',
					info: "Couldn't find the user profile"
				});
			}
		});
	} catch (err) {
		res.status(401).json({
			error: 'DB error',
			info: err.toString()
		});
	}
})

app.get('/api/auth/leaderboard', (req, res)=>{
	
	try{
		let sql = 'SELECT username, MAX(score) as highscore from gamestats group by username order by highscore desc limit 10';
		const empty = [];
		pool.query(sql, empty, (err, pgRes) =>{
			if (err){
				res.status(401).json({
					error: 'DB error',
					info: err.message
				});
			}
			else{
				res.status(200).send(pgRes.rows);
			}
		});
	}
	catch (err){
		res.status(401).json({
			error: 'DB error',
			info: err.toString()
		});
	}
});

app.delete('/api/auth/profile', (req, res) => {
	try {
		let sql = 'DELETE FROM ftduser WHERE username=$1';
		const args = [req.username];
		pool.query(sql, args, (err, pgRes) => {
			if (err) {
				res.status(500).json({
					error: 'DB error',
					info: err.message
				});
			}
			else if (pgRes.rowCount === 1) {
				res.status(200).send({
					message: 'profile successfully deleted'
				});
			}
			else {
				res.status(404).send({
					error: 'Invalid Request',
					info: "Couldn't find the user profile"
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

