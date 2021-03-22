const { Stage } = require('./models/Game');
const http = require('http');
const app = require('express')();
const WebSocket = require('ws');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
    res.status(200).sendFile(__dirname + '/client.html');
});

wss.on('connection', (ws) => {
    ws.send("Hello World!");

    ws.on('message', (data) => {
        console.log(`client sent ${data}`);
    });

    ws.on('close', (code, reason) => {
        console.log(`client left with code: ${code} | ${reason}`);
    });

});

server.listen(8100, () => console.log('Listening on Port 8100'));
