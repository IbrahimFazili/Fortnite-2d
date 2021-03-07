import { randint, Pair } from './utils';

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
		return `Pos: ${this.position.toString()} | Health: ${this.health} | Collidable: ${this.isCollidable}`;
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

export class DynamicObjects extends GameObject {

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

		// stop at the walls
		if (this.position.x < 0) {
			this.position.x = 0;
		}
		if (this.position.x > this.game.worldWidth - 20) {
			this.position.x = this.game.worldWidth - 20;
		}
		if (this.position.y < 0) {
			this.position.y = 0;
		}
		if (this.position.y > this.game.worldHeight - 20) {
			this.position.y = this.game.worldHeight - 20;
		}

		// console.log(`pos: ${this.position.toString()} | max: ${this.game.worldHeight - 20}`);
	}

	moveTo(position) {
		this.velocity.x = (position.x - this.position.x);
		this.velocity.y = (position.y - this.position.y);
		this.velocity.normalize();
	}
}

export class StaticObjects extends GameObject {

	/**
	 *  StaticObjects are those that don't move in the game
	 */
	constructor(game, position, health, color = undefined, collison = true) {
		super(game, position, health, color, collison);
	}
}