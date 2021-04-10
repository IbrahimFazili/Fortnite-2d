const fetch = require('node-fetch');
const API_URL = 'http://localhost:8000'

class APIHandler {

    static setClientsMap(_clients) {
        APIHandler.clients = _clients;
    }

    static async verifyUserToken(token) {
        try {
            const res = await fetch(`${API_URL}/api/auth`, {
                method: 'GET',
                headers: { 'Authorization': token }
            });
    
            if (res.status !== 200) return null;
            const { username } = await res.json();
            return username;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    static async reportScore(score, kills, win, gameID, username) {
        try {
            const token = this.clients[username].token;
            const stats = { score, kills, gameID, win };
            const res = await fetch(`${API_URL}/api/auth/reportGame`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify(stats)
            });
    
            if (res.status !== 201) {
                const json = await res.json();
                console.log(json);
            }
    
            // if it fails, just ignore the error, not much to do as this would be done automatically.
            // no user interaction here
        } catch (error) {
            console.log(error);
        }
    }
}

APIHandler.clients = {};

module.exports = {
    APIHandler
}
