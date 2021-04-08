const fetch = require('node-fetch');
const API_URL = 'http://localhost:8000'

const verifyUserToken = async (token) => {
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

const reportScore = async (score, kills, win, gameID, token) => {
    try {
        const stats = { score, kills, gameID, win }
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

module.exports = {
    verifyUserToken,
    reportScore
}
