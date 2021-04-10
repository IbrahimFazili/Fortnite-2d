import { RTCConnectionHandler } from "./VoiceChatHandler";


export class Socket {

    /**
     * 
     * @param {Stage} game reference to the main game object
     * @param {Number} tickRate (Optional) rate at which to send updates to the server (default 60)
     * @param {function(string):void} errCallback function to call on error
     * @param {function(string):void} showWaitingScreen callback to show waiting screen if server tells us to
     */
    constructor(game, tickRate = 60, errCallback = undefined, showWaitingScreen = undefined) {
        this.game = game;
        this.userActions = [];
        this.tickRate = tickRate;
        this.url = 'ws://localhost:8100';
        this.ws = null;
        this.voiceHandler = null;
        this.ping = 0;
        this.connected = false;
        this.errCallback = errCallback;
        this.showWaitingScreen = showWaitingScreen;
        // number for the setInterval that sends data over fixed intervals
        this.ticker = -1;
    }

    onConnected() {
        // initiate voice connection to peers
        this.startTick();
        this.voiceHandler = new RTCConnectionHandler(this.ws, () => {
            this.ws.send(JSON.stringify({
                type: 'Voice',
                action: 'Join'
            }));
        });
    }

    /**
     * Establish socket connection
     */
    connect(username) {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = (ev) => {
            console.log('connection open');
            this.ws.send(JSON.stringify({
                type: 'Auth',
                username, // only for testing purpose, need to remove it
                token: `Bearer ${localStorage.getItem('auth')}`
            }));
        }

        this.ws.onerror = (ev) => {
            console.log(ev);
            this.errCallback && this.errCallback(ev);
            this.connected = false;
        }

        this.ws.onclose = (ev) => {
            console.log(ev);
            this.connected = false;
        }

        this.ws.onmessage = (ev) => {
            const data = JSON.parse(ev.data);
            // invalid packet -> drop
            if (!data.type) return;
            else if (data.type === 'PlayerState') {
                if (data.status === 'waiting') {
                    // show wait screen
                    this.showWaitingScreen && this.showWaitingScreen(true);
                }
                else if (data.status === 'playing'){
                    // actually playing
                    this.showWaitingScreen && this.showWaitingScreen(false);
                } else if (data.status === 'won') {
                    this.showWaitingScreen && this.showWaitingScreen(true);
                }
            }
            else if (data.type === 'Voice') this.voiceHandler.handleConnectionData(data);
            else if (data.type === 'GameState') {
                this.ping = Date.now() - data['time'];
                this.game.unpack(data);
            }
            else if (data.type === 'Auth') {
                if (data.success) {
                    this.connected = true;
                    this.onConnected();
                }
                else {
                    // auth failed, handle appropriately
                    this.errCallback && this.errCallback(data.reason);
                    return;
                }

                console.log(`Connection status ${this.connected}`);
            }
        }
    }

    disconnect() {
        this.stopTick();
        this.voiceHandler.terminateConnections();
        this.ws.close(1000, 'User closed the app');
    }

    startTick() {
        this.ticker = setInterval(this.tick.bind(this), 1000 / this.tickRate);
    }

    stopTick() {
        clearInterval(this.ticker);
    }

    tick() {
        // need to show an error here instead
        if (!this.connected) return;

        const data = this.game.pack();
        if (!data) return;
        data['actions'] = this.userActions.splice(0, this.userActions.length);
        data['type'] = 'State';
        this.ws.send(JSON.stringify(data));
    }
}
