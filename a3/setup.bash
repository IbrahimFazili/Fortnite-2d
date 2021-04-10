#!/bin/bash

cd ContentServer
npm i
psql "dbname='webdb' user='webdbuser' password='password' host='localhost'" -f db/schema.sql
node ftd.js &
cd ../GameServer
npm i
node index.js
