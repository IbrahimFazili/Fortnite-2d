require('dotenv').config();
const { Stage } = require('./models/Game');
const http = require('http');
const app = require('express')();
const WebSocket = require('ws');
const { Inventory } = require('./models/utils');
const { verifyUserToken } = require('./APIHandler');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const TICK_RATE = 60;
const SIMULATION_RATE = 60;
const clients = {};
const game = new Stage();

app.get('/', (req, res) => {
    res.status(200).sendFile(__dirname + '/client.html');
});

wss.on('connection', (ws) => {
    ws.on('message', async (data) => {
        data = JSON.parse(data);
        // console.log(data);
        // invalid packet -> drop
        if (!data.type) return;
        // update client's state
        else if (data.type === 'State') game.updateActor(data);
        else if (data.type === 'Auth') {
            // verify if the user's token is valid
            if (!data.token) {
                sendErrAndClose(ws, 'Authentication failed, missing auth token');
                return;
            }

            const username = await verifyUserToken(data.token);
            if (!username) {
                sendErrAndClose(ws, 'Authentication failed, invalid auth token');
                return;
            }

            ws.send(JSON.stringify({
                type: 'Auth',
                success: true
            }));

            clients[data.username] = {
                ws,
                mapSent: false
            };
            ws.username = data.username;
            game.createNewPlayer(data.username, data.token);
        }
    });

    ws.on('close', function (code, reason) {
        console.log(`client (${this.username}) left with code: ${code} | ${reason}`);
        // delete from client list here
        game.removePlayer(this.username);
        delete clients[this.username];
    });

});

/**
 * Send the error message to the client and terminate the connection
 * @param {WebSocket} ws websocket connection over which to send the error
 * @param {*} err error raised
 */
function sendErrAndClose(ws, err) {
    ws.send(JSON.stringify({
        type: 'Auth',
        success: false,
        reason: err.toString()
    }));

    ws.close(1000);
}

function simulateGame() {
    game.step(1000 / SIMULATION_RATE);
}

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

function startSimulation() {
    setInterval(simulateGame, 1000 / SIMULATION_RATE);
}

server.listen(8100, () => {
    console.log('Listening on Port 8100');
    startSimulation();
    startTick();
});
