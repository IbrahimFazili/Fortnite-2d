const { clamp, Pair, randint } = require('./utils');
const { Player, AI, Obstacles } = require('./CustomGameObjects');
const { Gun } = require('./Weapons');
const { Map } = require('./Map');
const { Spawner } = require('./Spawner');
const { randomBytes } = require('crypto');

class Stage {
	/**
	 * 
	 * @param {function():void} onStart
	 * @param {function(string):void} onRestart
	 */
	constructor(onStart, onRestart) {
		this.gameID = this.genGameId();
		this.onStart = onStart;
		this.onRestart = onRestart;
		this.gameEnded = false;

		this.actors = []; // all actors on this stage (monsters, player, boxes, ...)

		this.isPaused = false;
		this.squareSize = 20;

		// logical width and height of the world (map)
		this.worldWidth = 2000;
		this.worldHeight = 2000;
		this.map = null;

		// stats for the game
		this.activeAI = 0;
		this.score = 0;

		this.cols = this.worldWidth / this.squareSize;
		this.rows = this.worldHeight / this.squareSize;
		this.generateMap(this.squareSize, this.rows, this.cols);
		// this.internal_map_grid = new Map(this, this.rows, this.cols, this.squareSize);

		this.idCounter = 0;
		this.spawner = new Spawner(this, 1, 0);
		this.killed = []; // players (usernames) that have died

		this.waitingQueue = []; // players waiting for next round
	}

	genGameId() {
		return randomBytes(8).toString('hex');
	}

	/**
	 * JSONify this class to be sent over network
	 */
	pack() {
		const json = {};
		json['worldWidth'] = this.worldWidth;
		json['worldHeight'] = this.worldHeight;
		json['squareSize'] = this.squareSize;
		json['rows'] = this.rows;
		json['cols'] = this.cols;
		json['round'] = this.spawner.round;
		json['score'] = this.score;

		let actors = [];
		this.actors.forEach(actor => actors.push(actor.pack()));
		json['actors'] = actors;
		json['time'] = Date.now();
		json['map'] = this.map;

		return json;
	}

	updateActor(json) {
		const actor = this.getActor(json.id);
		if (!actor) return;

		// update actors' own props
		actor.update(json);
		// process actions actor has done
		if (!json['actions']) return;

		// console.log(json['actions']);
		json['actions'].forEach(action => {
			switch (action) {
				case 'fire_auto': actor.fire(true); break;
				case 'fire': actor.fire(); break;
				case 'fire_stop': actor.stopFire(); break;
				case 'reload': actor.reload(); break;
				case 'pick': actor.pickupItem(); break;
				case 'deploy_steel_wall': actor.deploySteelWall(); break;
				case 'deploy_brick_wall': actor.deployItem(); break;
				case 'switch_weapon_0': actor.switchWeapon(0); break;
				case 'switch_weapon_1': actor.switchWeapon(1); break;
				case 'switch_weapon_2': actor.switchWeapon(2); break;
			}
		});
	}

	/**
	 * Restart the game
	 * @param {Player} lastPlayer
	 */
	resetGame(lastPlayer) {
		console.log('restarting game');
		this.actors = [];
		this.killed = [];
		this.gameID = this.genGameId();
		this.spawner = new Spawner(this, 1, 0);
		this.waitingQueue.forEach((user) => {
			this.createNewPlayer(user);
		});
		this.waitingQueue = [];

		this.onStart();
		this.onRestart(lastPlayer.label);
	}

	createNewPlayer(username) {
		if (this.killed.findIndex(element => element === username) === - 1) {
			this.spawner.spawnPlayer(username);

			return {
				success: true,
				status: 'playing'
			}
		}

		this.waitingQueue.push(username);
		return {
			success: true,
			status: 'waiting'
		};
	}

	addActor(actor) {
		this.actors.push(actor);
	}

	countAI() {
		var c = 0;
		for (var i = 0; i < this.actors.length; i++) {
			if (this.actors[i] instanceof AI) {
				c++;
			}
		}
		this.activeAI = c;
	}

	getPlayerCount() {
		let count = 0;
		this.actors.forEach((a) => {
			if (a instanceof Player) count++;
		});

		return count;
	}

	removeActor(actor) {
		var index = this.actors.indexOf(actor);
		if (index != -1) {
			const destroyed = this.actors.splice(index, 1)[0];
			destroyed.onDestroy();

			// if (destroyed instanceof AI) {
			// 	if (this.actors.findIndex((actor) => actor instanceof AI) === -1) {
			// 		// queue next round with a delay to allow player to get ready
			// 		setTimeout(() => {
			// 			this.spawner.startNextRound();
			// 			console.log(this.spawner.toString());
			// 		}, 5000);
			// 		this.score += this.spawner.round * 100;
			// 	}
			// }
		}
	}

	removePlayer(username) {
		const player = this.actors.findIndex((a) => a.label === username);
		if (player !== -1) {
			this.killed.push(username); // stop people from spawning once dead
			this.removeActor(this.actors[player]);
		}
	}

	togglePause() {
		this.isPaused = !this.isPaused;
	}

	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step. 
	step(delta) {
		if (this.gameEnded) return;
		if (this.getPlayerCount() === 1 && this.killed.length > 0) {
			// game's done
			const player = this.actors.find((a) => a instanceof Player);
			player.scoreTracker.reportScore(true);
			this.resetGame(player);
			return;
		}

		for (var i = 0; i < this.actors.length; i++) {
			this.actors[i].step(delta);
		}

		this.spawner.step(delta);

		this.countAI();
	}

	generateMap(squareSize, rows, cols) {
		this.map = new Array(rows);
		for (let index = 0; index < this.map.length; index++) {
			this.map[index] = new Array(cols);
		}

		for (let j = 0; j < rows; j++)
			for (let i = 0; i < cols; i++) {
				let color = [0, 143, 5];
				color[1] += randint(40) - 20;
				// if ((i % 2 == 0 && j % 2 == 0) || (i % 2 != 0 && j % 2 != 0)) 
				this.map[i][j] = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
			}
	}

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(id) {
		for (let i = 0; i < this.actors.length; i++) {
			const actor = this.actors[i];
			if (actor.id === id) return actor;
		}

		return null;
	}
} // End Class Stage

module.exports = {
	Stage
}