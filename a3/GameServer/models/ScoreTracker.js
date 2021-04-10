const { APIHandler } = require("../APIHandler");

class ScoreTracker {
    constructor(username, gameID) {
        this.kills = 0;
        this.score = 0;
        this.username = username;
        this.gameID = gameID;
    }

    registerKill() {
        this.kills++;
        this.updateScore();
    }

    updateScore() {
        this.score += 5 + 10**(Math.floor(this.kills / 5));
    }

    reportScore(win) {
        // report score to API (score, kills, win, gameID)
        APIHandler.reportScore(this.score, this.kills, win, this.gameID, this.username);
    }
}

module.exports.ScoreTracker = ScoreTracker;
