
export class Socket {

    /**
     * 
     * @param {Stage} game reference to the main game object
     * @param {Number} tickRate (Optional) rate at which to send updates to the server (default 60)
     */
    constructor(game, tickRate=60) {
        this.game = game;
        this.userActions = [];
        this.tickRate = tickRate;
        this.url = 'ws://localhost:8100';
        this.ws = null;
        this.ping = 0;
        this.connected = false;
        // number for the setInterval that sends data over fixed intervals
        this.ticker = -1;
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
            else if (data.type === 'GameState') {
                this.ping = Date.now() - data['time'];
                this.game.unpack(data);
            }
            // TODO: handle error
            else if (data.type === 'Error') console.log(data);
            else if (data.type === 'Auth') {
                if (data.success) {
                    this.connected = true;
                    this.startTick();
                }
                else {
                    // auth failed, handle appropriately
                }

                console.log(`Connection status ${this.connected}`);
            }
        }
    }

    disconnect() {
        this.stopTick();
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
