import { randint, Pair, clamp } from './utils';
// import { Stage } from './Game';

class GameObject {

	/**
	 * @param game {Stage}
	 * @param position {Pair}
	 * @param health {Number}
	 * @param color {string} RGB string
	 */
	constructor(game, position, health, color = undefined, collison = true, name = "") {
		this.game = game;
		this.id = this.game.idCounter++;
		this.position = position;
		this.health = health;
		this.maxHealth = health;
		this.color = color !== undefined ? color : `rgb(${randint(255)}, ${randint(255)}, ${randint(255)})`;
		this.isCollidable = collison;
		this.boundingVolume = null;
		this.label = name;
		this.displayLabel = false;
	}

	toString() {
		return `Pos: ${this.position.toString()} | Health: ${this.health} | Collidable: ${this.isCollidable}`;
	}

	updateHealth(h) {
		this.health = clamp(this.health + h, 0, this.maxHealth);
	}
	
	step(delta) {
		if (this.health === 0) {
			this.game.removeActor(this);
		}
	}

	intersects() {
		if (!this.isCollidable) return null;

		for (let i = 0; i < this.game.actors.length; i++) {
			const object = this.game.actors[i];
			if (object.id === this.id) continue;
			if (object.isCollidable &&
				object.boundingVolume.intersect(this.boundingVolume)) return object;
		}

		return null;
	}

	drawLabel(context){
		// context.globalAlpha = 0.1;
		// context.fillStyle = "rgba(0, 0, 0)";
		// context.fillRect(this.position.x - 50, this.position.y - 50, 100, 20);
		// context.globalAlpha = 1.0;
		context.fillStyle = "white";
		context.font='200 12px sans-serif';
		context.fillText(this.label, this.position.x - 20, this.position.y - 35);
	}

	draw(context) {
		if (this.displayLabel) this.drawLabel(context);
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
	constructor(game, position, health, color = undefined, collison=true, name="") {
		super(game, position, health, color, collison=true, name=name);
		// initally, object is still
		this.velocity = new Pair(0, 0);
	}

	toString() {
		return `${super.toString()} | v ${this.velocity.toString()}`;
	}

	setCenter() {}

	/**
	 * Called on every game tick (every time the game state updates)
	 * @param destroyOnCollision {boolean} Optional argument which if set to true, destroys the obj on collision
	 * @param onCollision {function} Optinal callback which is called with the collided object on collision
	 */
	step(delta, destroyOnCollision=false, onCollision=null) {

		super.step();
		const oldPos = this.position.copy();
		// s = ut
		this.position.x = this.position.x + (this.velocity.x * (delta / 1000));
		this.position.y = this.position.y + (this.velocity.y * (delta / 1000));
		this.setCenter();
		const collision = this.intersects();
		if (collision) {
			// call onCollision callback and pass in the object it collided with
			onCollision && onCollision(collision)
			if (destroyOnCollision) {
				this.game.removeActor(this);
				return;
			}

			this.position.x = oldPos.x;
			this.position.y = oldPos.y;
			this.setCenter();
			return;
		}
		

		// stop at the walls
		if (this.position.x < 0) {
			if (destroyOnCollision) {
				this.game.removeActor(this);
				return;
			}
			this.position.x = 0;
		}
		if (this.position.x > this.game.worldWidth - 20) {
			if (destroyOnCollision) {
				this.game.removeActor(this);
				return;
			}
			this.position.x = this.game.worldWidth - 20;
		}
		if (this.position.y < 0) {
			if (destroyOnCollision) {
				this.game.removeActor(this);
				return;
			}
			this.position.y = 0;
		}
		if (this.position.y > this.game.worldHeight - 20) {
			if (destroyOnCollision) {
				this.game.removeActor(this);
				return;
			}
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
	constructor(game, position, health, color = undefined, collison = true, name = "") {
		super(game, position, health, color, collison, name=name);
	}
}