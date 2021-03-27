import { clamp, Pair, randint } from './utils';
import { Player, AI, Obstacles } from './CustomGameObjects';
import { Bullet, Gun } from './Weapons';
import { Map } from './Map';
import { Resource } from './Resources';

export class Stage {
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
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.ptrOffset = new Pair(0, 0);
		this.ptrDirection = new Pair(1, 0);

		this.idCounter = 0;

		// Add the player to the center of the stage
		var health = 100.0;
		var colour = 'rgba(0,0,0,1)';
	}

	unpack(json) {
		Object.keys(json).forEach((prop) => {
			if (prop === 'actors') {
				// clear actors list to process update from server
				// could do better than this?
				this.actors = [];
				json[prop].forEach(actor => {
					this.unpackActor(actor);
				});
			}
			else this[prop] = json[prop];
		});
	}

	unpackActor(prop) {
		switch (prop['name']) {
			case 'Player':
				var player = new Player(this,
					new Pair(prop['position']['x'], prop['position']['y']),
					prop['maxHealth'], prop['color'], prop['label'], true);
				player.unpack(prop);
				this.addPlayer(player);
				break;

			case 'AI':
				var ai = new AI(this, 
					new Pair(prop['position']['x'], prop['position']['y']),
					prop['maxHealth'],
					prop['color'],
					prop['aimVarianceFactor']);
				ai.unpack(prop);
				this.addActor(ai);
				break;

			case 'Resource':
				var resource = new Resource(this,
					new Pair(prop['position']['x'], prop['position']['y']),
					prop['maxHealth'], prop['harvestCount'], prop['image'],
					prop['label']);
				resource.unpack(prop);
				this.addActor(resource);
				break;

			case 'Gun':
				if (prop['label'] === 'SMG') {
					// make SMG

					//another condition to check if it has an owner
					var smg = Gun.generateSMG(this,
						new Pair(prop['position']['x'], prop['position']['y']),
						null);
					smg.unpack(prop);
					smg.owner = this.getActor(prop['owner']);
					this.addActor(smg);
					break;
				}
				else if (prop['label'] === 'AR') {
					// make AR

					//another condition to check if it has an owner
					var ar = Gun.generateAR(this,
						new Pair(prop['position']['x'], prop['position']['y']),
						null)
					ar.unpack(prop);
					ar.owner = this.getActor(prop['owner']);
					this.addActor(ar);
					break;
				}

			case 'Bullet':
				const b = new Bullet(this,
					new Pair(prop['position']['x'], prop['position']['y']),
					prop['damage'],
					prop['maxRange'],
					new Pair(prop['dir']['x'], prop['dir']['y']));
				
				this.addActor(b);
				break;
			case 'Obstacles':
				var obj = new Obstacles(this,
					new Pair(prop['position']['x'], prop['position']['y']),
					Infinity, prop['color'], prop['label']);
				obj.unpack(prop);
				this.addActor(obj);
				return;
		}
	}

	pack() {
		const json = {};
		json['position'] = {
			x: this.player.position.x,
			y: this.player.position.y
		};

		json['velocity'] = {
			x: this.player.velocity.x,
			y: this.player.velocity.y
		};

		json['dir'] = {
			x: this.ptrDirection.x,
			y: this.ptrDirection.y
		}

		return json;
	}

	resetGame() {
		const enemiesKilled = this.spawner.totalEnemiesSpawned - this.activeAI;
		this.reportScore(this.score, enemiesKilled, this.spawner.round - 1);
		this.restartCallback();
	}

	generateObstacles() {
		var i = 0;
		while (i < 8) {
			var position = new Pair(randint(this.worldWidth), randint(this.worldHeight));
			var obj = new Obstacles(this, position, Infinity, 'rgb(0,0,0)', 'Obstacle');
			if (!obj.intersects()) {
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

	countAI() {
		var c = 0;
		for (var i = 0; i < this.actors.length; i++) {
			if (this.actors[i] instanceof AI) {
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

		this.countAI();
	}

	setGameWindowSize(ctx) {
		ctx.canvas.width = window.innerWidth;
		ctx.canvas.height = window.innerHeight;
		this.width = ctx.canvas.width;
		this.height = ctx.canvas.height;
	}

	draw() {
		var context = this.canvas.getContext('2d');
		this.setGameWindowSize(context);

		context.clearRect(0, 0, this.width, this.height);

		if (!this.player) return;
		context.save();

		const camX = clamp(this.player.position.x - (this.width / 2), 0, this.worldWidth - this.width);
		const camY = clamp(this.player.position.y - (this.height / 2), 0, this.worldHeight - this.height);
		this.ptrOffset = new Pair(camX, camY);
		context.translate(-camX, -camY);

		this.drawCheckeredBoard(context, this.squareSize, this.rows, this.cols)

		for (var i = 0; i < this.actors.length; i++) {
			if (this.actors[i] instanceof Player) continue;
			this.actors[i].draw(context);
		}

		// draw player at the end to make sure it's drawn on top of everything else
		this.actors.forEach(act => {
			if (act instanceof Player) act.draw(context);
		});

		context.restore();

	}

	drawCheckeredBoard(ctx, squareSize, rows, cols) {
		if (!this.map) return;
		for (let j = 0; j < rows; j++) {
			for (let i = 0; i < cols; i++) {
				ctx.fillStyle = this.map[j][i];
				ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize)
			}
		}
	}

	getActor(id) {
		for (var i = 0; i < this.actors.length; i++) {
			if (this.actors[i].id === id) {
				return this.actors[i];
			}
		}

		return null;
	}
} // End Class Stage