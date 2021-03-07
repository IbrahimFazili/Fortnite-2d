import { Pair } from './utils';
import { Player } from './CustomGameObjects';

export class Stage {
	constructor(canvas) {
		this.canvas = canvas;

		this.actors = []; // all actors on this stage (monsters, player, boxes, ...)
		this.player = null; // a special actor, the player

		// logical width and height of the world (map)
		this.worldwidth = 5000
		this.worldheight = 5000

		// the logical width and height of the stage (viewport/window)
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		// Add the player to the center of the stage
		var health = 100.0;
		var colour = 'rgba(0,0,0,1)';
		var position = new Pair(Math.floor(this.width / 2), Math.floor(this.height / 2));
		this.addPlayer(new Player(this, position, health, colour, 20));
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
	step() {
		for (var i = 0; i < this.actors.length; i++) {
			this.actors[i].step();
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
		let cols = this.width / 10;
		let rows = this.height / 10;
		let squareSize = 50;
		context.clearRect(0, 0, this.width, this.height);

		this.drawCheckeredBoard(context, squareSize, rows, cols)

		for (var i = 0; i < this.actors.length; i++) {
			this.actors[i].draw(context);
		}

	}

	drawCheckeredBoard(ctx, squareSize, rows, cols) {
		let whiteSquareColor = "#ffe6cc"
		let blackSquareColor = "#cc6600"
	
		for (let j = 0; j < rows; j++)
			for (let i = 0; i < cols; i++) {
				if ((i % 2 == 0 && j % 2 == 0) || (i % 2 != 0 && j % 2 != 0)) 
					ctx.fillStyle = whiteSquareColor
				else ctx.fillStyle = blackSquareColor
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
		// trees
		// bricks
		// metal

	// walls

	// weapons
		// guns
		// ammo