--- load with 
--- psql "dbname='webdb' user='webdbuser' password='password' host='localhost'" -f schema.sql
DROP TABLE ftduser;
DROP TABLE gameStats;

CREATE TABLE ftduser (
	username VARCHAR(20) PRIMARY KEY,
	password BYTEA NOT NULL
);

CREATE TABLE gameStats(
	gameId VARCHAR PRIMARY KEY,
	username VARCHAR(20),
	score INT,
	enemiesKilled INT,
	rounds INT,
	FOREIGN KEY (username) REFERENCES ftduser(username) ON DELETE CASCADE ON UPDATE CASCADE
);
--- Could have also stored as 128 character hex encoded values
--- select char_length(encode(sha512('abc'), 'hex')); --- returns 128
INSERT INTO ftduser VALUES('user1', sha512('password1'));
INSERT INTO ftduser VALUES('user2', sha512('password2'));
