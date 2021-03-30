import { clamp, getAssetPath, Pair, randint } from './utils';
import { Player, AI, Obstacles, Wall } from './CustomGameObjects';
import { Bullet, Gun } from './Weapons';
import { Resource } from './Resources';

export class Stage {
	constructor(canvas, username) {
		this.canvas = canvas;
		this.username = username;

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

		// the logical width and height of the stage (viewport/window)
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.ptrOffset = new Pair(0, 0);
		this.ptrDirection = new Pair(1, 0);
	}

	unpack(json) {
		let processed_ids = [];
		Object.keys(json).forEach((prop) => {
			if (prop === 'actors') {
				// clear actors list to process update from server
				// could do better than this?
				json[prop].forEach((actor, i) => {
					this.unpackActor(actor);
					processed_ids.push(actor.id);
				});
			}
			else this[prop] = json[prop];
		});

		this.actors = this.actors.filter((actor) => (processed_ids.findIndex((id) => id === actor.id)) !== -1);
	}

	unpackActor(prop) {
		const actor = this.getActor(prop['id']);
		const pos = new Pair(prop['position']);
		const getResourceGenerator = (resName) => Resource[`generate${resName}`];
		const getAmmoGenerator = (ammoType) => Resource[`generate${ammoType.split(' ').join('')}`];
		switch (prop['name']) {
			case 'Player':
				if (!actor) {
					const player = new Player(this, pos, 100, 'black', 'Player 1', true);
					player.unpack(prop);
					if (player.label === this.username) this.addPlayer(player);
					else this.addActor(player);
				}
				else actor.unpack(prop);
				break;

			case 'AI':
				if (!actor) {
					var ai = new AI(this, pos, 100, 'green', 0);
					ai.unpack(prop);
					this.addActor(ai);
				}
				else actor.unpack(prop);
				break;

			case 'Resource':
				if (!actor) {
					let gen = getResourceGenerator(prop['label']);
					if (!gen) gen = getAmmoGenerator(prop['label']);
					const resource = gen(this, pos);
					resource.unpack(prop);
					this.addActor(resource);
				}
				else actor.unpack(prop);
				break;

			case 'Wall':
				if (!actor) {
					let orient;
					if (prop['w'] > prop['h']) orient = new Pair(0, 1);
					else orient = new Pair(1, 0);
					const wall = new Wall(this, pos, 50, prop['color'], orient);
					wall.unpack(prop);
					this.addActor(wall);
				}
				else actor.unpack(prop);
				break;

			case 'Gun':
				if (!actor) {
					const gun = prop['label'] === 'SMG' ? Gun.generateSMG(this, pos, null)
						: Gun.generateAR(this, pos, null);
					gun.unpack(prop);
					this.addActor(gun);
				}
				else actor.unpack(prop);
				break;

			case 'Bullet':
				if (!actor) {
					const b = new Bullet(this, pos, 5, Infinity, new Pair(1, 0));
					b.unpack(prop);
					this.addActor(b);
				}
				else actor.unpack(prop);
				break;
			case 'Obstacles':
				if (!actor) {
					var obj = new Obstacles(this, pos, prop['w'], prop['h'], Infinity, 'red', 'wall');
					obj.unpack(prop);
					this.addActor(obj);
				}
				else actor.unpack(prop);
				return;
		}
	}

	pack() {
		const json = {};
		if (!this.player) return null;
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

		json['id'] = this.player.id;

		return json;
	}

	resetGame() {
		const enemiesKilled = this.spawner.totalEnemiesSpawned - this.activeAI;
		// this.reportScore(this.score, enemiesKilled, this.spawner.round - 1);
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
		}
	}

	togglePause() {
		this.isPaused = !this.isPaused;
	}

	// Take one step in the animation of the game. Do this by asking each of the actors to take a single step. 
	step(delta) {
		if (this.isPaused) return;
		for (var i = 0; i < this.actors.length; i++) {
			if (this.actors[i] instanceof Bullet) continue;
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