const { clamp, Pair, randint } =  require('./utils');
const { Player, AI, Obstacles } = require('./CustomGameObjects');
const { Gun } = require('./Weapons');
const { Map } = require('./Map');
const { Spawner } = require('./Spawner');

class Stage {
	constructor(canvas, restartGame, reportScore) {
		this.canvas = canvas;
		this.restartCallback = restartGame;
		this.reportScore = reportScore;

		this.actors = []; // all actors on this stage (monsters, player, boxes, ...)
		this.player = null; // a special actor, the player

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

		this.internal_map_grid = new Map(this, this.rows, this.cols, this.squareSize);

		// the logical width and height of the stage (viewport/window)
		// this.width = window.innerWidth;
		// this.height = window.innerHeight;

		this.idCounter = 0;

		// Add the player to the center of the stage
		var health = 100.0;
		var colour = 'rgba(0,0,0,1)';
		var position = new Pair(Math.floor(this.worldWidth / 2), Math.floor(this.worldHeight / 2));
		this.addPlayer(new Player(this, position, health, colour));
		this.addActor(Gun.generateSMG(this, (new Pair(randint(750), randint(600))).add(this.player.position), null));
		this.addActor(Gun.generateAR(this, (new Pair(randint(750), randint(600))).add(this.player.position), null));
		this.spawner = new Spawner(this, 1, 4);
		this.generateObstacles();
	}

	/**
	 * JSONify this class to be sent over network
	 */
	pack() {
		const json = {};
		json['player'] = this.player.pack();
		json['worldWidth'] = this.worldWidth;
		json['worldHeight'] = this.worldHeight;
		json['squareSize'] = this.squareSize;
		json['rows'] = this.rows;
		json['cols'] = this.cols;

		let actors = [];
		this.actors.forEach(actor => actors.push(actor.pack()));
		json['actors'] = actors;
		json['time'] = Date.now();
		
		return json;
	}

	resetGame() {
		const enemiesKilled = this.spawner.totalEnemiesSpawned - this.activeAI;
		this.reportScore(this.score, enemiesKilled, this.spawner.round - 1);
		this.restartCallback();
	}

	generateObstacles(){
		var  i = 0;
		while (i < 8){
			var position = new Pair(randint(this.worldWidth), randint(this.worldHeight));
			var obj = new Obstacles(this, position, Infinity, 'rgb(0,0,0)', 'Obstacle');
			if (!obj.intersects()){
				i++;
				this.addActor(obj);
			}
		}
	}

	addPlayer(player) {
		this.addActor(player);
		this.player = player;
	}

	removePlayer() {
		this.removeActor(this.player);
		this.player = null;
	}

	addActor(actor) {
		this.actors.push(actor);
	}

	countAI(){
		var c = 0;
		for (var i = 0; i < this.actors.length; i++){
			if (this.actors[i] instanceof AI){
				c++;
			}
		}
		this.activeAI = c;
	}

	removeActor(actor) {
		var index = this.actors.indexOf(actor);
		if (index != -1) {
			const destroyed = this.actors.splice(index, 1)[0];
			destroyed.onDestroy();

			if (destroyed instanceof AI) {
				this.score += this.spawner.getScorePerKill();
				if (this.actors.findIndex((actor) => actor instanceof AI) === -1) {
					// queue next round with a delay to allow player to get ready
					setTimeout(() => {
						this.spawner.startNextRound();
						console.log(this.spawner.toString());
					}, 5000);
					this.score += this.spawner.round * 100;
				}
			}
		}
	}

	togglePause() {
		this.isPaused = !this.isPaused;
	}

	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step. 
	step(delta) {
		if (this.isPaused) return;
		for (var i = 0; i < this.actors.length; i++) {
			this.actors[i].step(delta);
		}

		this.internal_map_grid.clearGrid();
		this.internal_map_grid.updateGrid();
		this.spawner.step(delta);

		this.countAI();
	}
	// TODO: migrate to frontend
	// setGameWindowSize(ctx) {
	// 	ctx.canvas.width = window.innerWidth;
	// 	ctx.canvas.height = window.innerHeight;
	// 	this.width = ctx.canvas.width;
	// 	this.height = ctx.canvas.height;
	// }

	// draw() {
	// 	var context = this.canvas.getContext('2d');
	// 	this.setGameWindowSize(context);

	// 	context.clearRect(0, 0, this.width, this.height);

	// 	context.save();

	// 	const camX = clamp(this.player.position.x - (this.width / 2), 0, this.worldWidth - this.width);
	// 	const camY = clamp(this.player.position.y - (this.height / 2), 0, this.worldHeight - this.height);
	// 	this.ptrOffset = new Pair(camX, camY);
	// 	context.translate(-camX, -camY);

	// 	this.drawCheckeredBoard(context, this.squareSize, this.rows, this.cols)

	// 	for (var i = 0; i < this.actors.length; i++) {
	// 		if (this.actors[i] instanceof Player) continue;
	// 		this.actors[i].draw(context);
	// 	}

	// 	// draw player at the end to make sure it's drawn on top of everything else
	// 	this.actors.forEach(act => {
	// 		if (act instanceof Player) act.draw(context);
	// 	});

	// 	context.restore();

	// }

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

	// TODO: migrate to frontend
	// drawCheckeredBoard(ctx, squareSize, rows, cols) {
	// 	if (!this.map) this.generateMap(squareSize, rows, cols);
	// 	for (let j = 0; j < rows; j++) {
	// 		for (let i = 0; i < cols; i++) {
	// 			ctx.fillStyle = this.map[j][i];
	// 			ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize)
	// 		}
	// 	}
	// }

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y) {
		for (var i = 0; i < this.actors.length; i++) {
			if (this.actors[i].x == x && this.actors[i].y == y) {
				return this.actors[i];
			}
		}
		return null;
	}
} // End Class Stage

module.exports = {
	Stage
}