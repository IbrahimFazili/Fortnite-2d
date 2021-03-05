function randint(n) { return Math.round(Math.random() * n); }
function rand(n) { return Math.random() * n; }

class Stage {
	constructor(canvas) {
		this.canvas = canvas;

		this.actors = []; // all actors on this stage (monsters, player, boxes, ...)
		this.player = null; // a special actor, the player

		// logical width and height of the world
		this.worldwidth = 5000
		this.worldheight = 5000

		// the logical width and height of the stage
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		// Add the player to the center of the stage
		var velocity = new Pair(0, 0);
		var radius = 20;
		var health = 100.0;
		var colour = 'rgba(0,0,0,1)';
		var position = new Pair(Math.floor(this.width / 2), Math.floor(this.height / 2));
		this.addPlayer(new Player(this, position, health, colour, radius));
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

		// context.clearRect(0, 0, this.width, this.height);
		// context.fillStyle = "rgba(1, 143, 6, 1)";
		// context.fillRect(0, 0, this.width, this.height);
		// context.setTransform(1, 0, 0, 1, 0, 0)

		let cols = this.width / 10 
		let rows = this.height / 10
		let squareSize = 50

		this.drawCheckeredBoard(context, squareSize, rows, cols)

		for (var i = 0; i < this.actors.length; i++) {
			this.actors[i].draw(context);
		}

	}

	clamp(value, min, max){
		if(value < min) return min;
		else if(value > max) return max;
		return value;
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

class Pair {
	constructor(x, y) {
		this.x = x; this.y = y;
	}

	toString() {
		return "(" + this.x + "," + this.y + ")";
	}

	normalize() {
		var magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
		this.x = this.x / magnitude;
		this.y = this.y / magnitude;
	}

	norm() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	dot(other) {
		return (this.x * other.x) + (this.y * other.y);
	}

	add(other) {
		return new Pair(this.x + other.x, this.y + other.y);
	}

	sub(other) {
		return new Pair(this.x - other.x, this.y - other.y);
	}

	copy() {
		return new Pair(this.x, this.y);
	}
}

class Ray {
	constructor(origin, direction) {
		this.origin = origin;
		this.direction = direction;
		this.direction.normalize();
	}
}

class GameObject {

	/**
	 * @param position Pair
	 * @param health float
	 * @param color RGB string
	 */
	constructor(game, position, health, color = undefined, collison = true) {
		this.game = game;
		this.position = position;
		this.health = health;
		this.color = color !== undefined ? color : `rgb(${randint(255)}, ${randint(255)}, ${randint(255)})`;
		this.isCollidable = collison;
	}

	toString() {
		return `Pos: ${this.position.toString()} | Health: ${this.health}`;
	}
	
	step() {
		return;
	}

	intPosition() {
		x = Math.round(this.position.x);
		y = Math.round(this.position.y);
		return new Pair(x, y);
	}

}

class DynamicObjects extends GameObject {

	/**
	 *  DynamicObjects are those that move in the game
	 */
	constructor(game, position, health, color = undefined) {
		super(game, position, health, color);
		// initally, object is still
		this.velocity = new Pair(0, 0);
	}

	toString() {
		return `${super.toString()} | v ${this.velocity.toString()}`;
	}

	/**
	 * Called on every game tick (every time the game state updates)
	 */
	step() {

		this.position.x = this.position.x + this.velocity.x;
		this.position.y = this.position.y + this.velocity.y;

		// bounce off the walls
		if (this.position.x < 0) {
			this.position.x = 0;
		}
		if (this.position.x > this.game.width - 20) {
			this.position.x = this.game.width - 20;
		}
		if (this.position.y < 0) {
			this.position.y = 0;
		}
		if (this.position.y > this.game.height - 20) {
			this.position.y = this.game.height - 20;
		}
	}

	moveTo(position) {
		this.velocity.x = (position.x - this.position.x);
		this.velocity.y = (position.y - this.position.y);
		this.velocity.normalize();
	}
}

class StaticObjects extends GameObject {

	/**
	 *  StaticObjects are those that don't move in the game
	 */
	constructor(game, position, health, color = undefined, collison = true) {
		super(game, position, health, color, collison);
	}
}

class Wall extends StaticObjects {
	constructor(game, position, health, color = undefined, mousePos) {
		super(game, position, health, color, true);
		this.w = 10;
		this.h = 100;
		this.center = new Pair(this.position.x + (this.w / 2), this.position.y + (this.h / 2));
		this.angle = this.computeWallDirection(mousePos);
	}

	computeWallDirection(mouse) {
		// mousePos - this.position
		const dir = mouse.sub(this.center);
		dir.normalize();
		
		const posX = new Pair(1, 0);
		const theta = Math.acos(posX.dot(dir) / (posX.norm() * dir.norm()));
		return mouse.y < this.position.y ? -theta : theta;
	}

	draw(context) {
		context.save();
		context.fillStyle = this.color;
		context.translate(this.center.x, this.center.y);
		context.rotate(this.angle);
		context.fillRect(-(this.w / 2), -(this.h / 2), this.w, this.h);
		context.restore();
	}
}

class Player extends DynamicObjects {

	constructor(game, position, health, color, radius){
		super(game, position, health, color)
		this.radius = radius
	}

	deployItem(mousePos) {
		var mouse = new Pair(mousePos.x, mousePos.y);
		
		const dir = mouse.sub(this.position);
		dir.normalize();

		const newPos = new Pair(this.position.x + (50 * dir.x), this.position.y - 50 + (50 * dir.y));
		console.log(`old: ${this.position} | new ${newPos}`);
		this.game.addActor(new Wall(this.game, newPos, 50, 'rgb(200, 1, 1)', mouse));
	}

	draw(context) {
		context.fillStyle = this.color;
		context.fillRect(this.position.x, this.position.y, this.radius, this.radius);
		// context.beginPath(); 
		// context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		// context.stroke();   
	}
}


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