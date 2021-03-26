require('dotenv').config();
const { Stage } = require('./models/Game');
const http = require('http');
const app = require('express')();
const WebSocket = require('ws');
const { Inventory } = require('./models/utils');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const TICK_RATE = 1;
const clients = {};
const game = new Stage();

app.get('/', (req, res) => {
    res.status(200).sendFile(__dirname + '/client.html');
});

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        data = JSON.parse(data);
        // invalid packet -> drop
        if (!data.type) return;
        // update client's state
        else if (data.type === 'State') return;
        else if (data.type === 'Auth') {
            // TODO: call API to verify this user is valid by verifying data.token
            ws.send(JSON.stringify({
                type: 'Auth',
                success: true
            }));

            clients[data.username] = {
                ws,
                mapSent: false
            };
            ws.username = data.username;
        }
    });

    ws.on('close', function (code, reason) {
        console.log(`client (${this.username}) left with code: ${code} | ${reason}`);
        // delete from client list here
        delete clients[this.username];
    });

});

function tick() {
    // 2 copies of the game state, 1 with map, 1 without.
    // if the client has recieved the map, don't send it again as
    // it doesn't change
    const json_map = game.pack();
    json_map['type'] = 'GameState';
    const json = JSON.parse(JSON.stringify(json_map));
    delete json['map'];

    Object.keys(clients).forEach((username) => {
        const sendMap = !(clients[username].mapSent);
        clients[username].mapSent = true;
        clients[username].ws.send(JSON.stringify(sendMap ? json_map : json));
    });
}

function startTick() {
    setInterval(tick, 1000 / TICK_RATE);
}

server.listen(8100, () => {
    console.log('Listening on Port 8100');
    startTick();
});
