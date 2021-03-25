
class Socket {

    /**
     * 
     * @param {Stage} game reference to the main game object
     * @param {Number} tickRate (Optional) rate at which to send updates to the server (default 60)
     */
    constructor(game, tickRate=60) {
        this.game = game;
        this.tickRate = tickRate;
        // ws://localhost:8100
        this.url = document.URL.replace('http', 'ws');
        this.ws = null;
        this.connected = false;
        // number for the setInterval that sends data over fixed intervals
        this.ticker = -1;
    }

    /**
     * Establish socket connection
     */
    connect() {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = (ev) => {
            this.ws.send({
                type: 'Auth',
                token: `Bearer ${localStorage.getItem('auth')}`
            });
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
            const json = JSON.parse(ev.data);
            // invalid packet -> drop
            if (!data.type) return;
            else if (data.type === 'GameState') this.game.unpack(json);
            // TODO: handle error
            else if (data.type === 'Error') console.log(data);
            else if (data.type === 'Auth') {
                if (data.success) this.connected = true;
                else {
                    // auth failed, handle appropriately
                }
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
        data['type'] = 'GameState';
        this.ws.send(JSON.stringify(data));
    }
}
