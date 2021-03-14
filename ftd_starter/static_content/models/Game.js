import { clamp, Pair, randint } from './utils';
import { Player } from './CustomGameObjects';
import { Gun } from './Weapons';

export class Stage {
	constructor(canvas) {
		this.canvas = canvas;

		this.actors = []; // all actors on this stage (monsters, player, boxes, ...)
		this.player = null; // a special actor, the player

		// logical width and height of the world (map)
		this.worldWidth = 2000;
		this.worldHeight = 2000;
		this.map = null;

		// the logical width and height of the stage (viewport/window)
		this.width = window.innerWidth;
		this.height = window.innerHeight;
        this.ptrOffset = new Pair(0, 0);
		this.ptrDirection = new Pair(1, 0);

		this.idCounter = 0;

		// Add the player to the center of the stage
		var health = 100.0;
		var colour = 'rgba(0,0,0,1)';
		var position = new Pair(Math.floor(this.width / 2), Math.floor(this.height / 2));
		this.addPlayer(new Player(this, position, health, colour));
		this.addActor(Gun.generateSMG(this, (new Pair(25, 25)).add(this.player.position)));
		this.addActor(Gun.generateAR(this, (new Pair(-25, -25)).add(this.player.position)))
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

	removeActor(actor) {
		var index = this.actors.indexOf(actor);
		if (index != -1) {
			this.actors.splice(index, 1);
		}
	}

	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step. 
	// NOTE: Careful if an actor died, this may break!
	step(delta) {
		for (var i = 0; i < this.actors.length; i++) {
			this.actors[i].step(delta);
		}
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
		let cols = this.worldWidth / 10;
		let rows = this.worldHeight / 10;
		let squareSize = 50;
		context.clearRect(0, 0, this.width, this.height);

        context.save();

        const camX = clamp(this.player.position.x - (this.width / 2), 0, this.worldWidth - this.width);
        const camY = clamp(this.player.position.y - (this.height / 2), 0, this.worldHeight - this.height);
        this.ptrOffset = new Pair(camX, camY);
        context.translate(-camX, -camY);

		this.drawCheckeredBoard(context, squareSize, rows, cols)

		for (var i = 0; i < this.actors.length; i++) {
			if (this.actors[i] instanceof Player) continue;
			this.actors[i].draw(context);
		}

		// draw player at the end to make sure it's drawn on top of everything else
		this.player.draw(context);

        context.restore();

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

	drawCheckeredBoard(ctx, squareSize, rows, cols) {
	
		if (!this.map) this.generateMap(squareSize, rows, cols);
		for (let j = 0; j < rows; j++)
			for (let i = 0; i < cols; i++) {
				ctx.fillStyle = this.map[j][i];
				ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize)
			}
	}

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




// dynamic objects

	// player
	// AI player
	// bullets

// static objects

	// resources
		// wood
		// bricks
		// metal

	// walls

	// weapons
		// guns
		// ammo