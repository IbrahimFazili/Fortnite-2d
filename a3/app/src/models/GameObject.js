import { randint, Pair, clamp, AABC } from './utils';
// import { Stage } from './Game';

class GameObject {

	/**
	 * @param {Stage} game
	 * @param {Pair} position
	 * @param {Number} health
	 * @param {string} color RGB string
	 */
	constructor(game, position, health, color = undefined, collison = true, name = "") {
		this.game = game;
		// this.id = this.game.idCounter++;
		this.id = randint(10000);
		this.position = position;
		this.health = health;
		this.maxHealth = health;
		this.color = color !== undefined ? color : `rgb(${randint(255)}, ${randint(255)}, ${randint(255)})`;
		this.isCollidable = collison;
		this.boundingVolume = null;
		this.label = name;
		this.displayLabel = false;
		this.displayHealth = true;
	}

	toString() {
		return `Pos: ${this.position.toString()} | Health: ${this.health} | Collidable: ${this.isCollidable}`;
	}

	/**
	 * Update the object's properties with the properties inside the provided JSON
	 * @param {Object} json JSON object containing properties about this object
	 */
	unpack(json) {
		this.displayLabel = json['displayLabel'];
		this.health = json['displayHealth'] !== null ? json['displayHealth'] : Infinity;
		this.maxHealth = json['maxHealth'] !== null ? json['maxHealth'] : Infinity;
		if (this.label !== this.game.username) this.position = new Pair(json['position']);
		this.color = json['color'];
		this.label = json['label'];
		this.id = json['id'];
		if (this.boundingVolume && this.boundingVolume instanceof AABC){
			this.boundingVolume.update(this.position);
		}
	}

	/**
	 * Callback to execute on destruction of this object from the game world
	 */
	onDestroy() {}

	notifyCollision(actor) {}

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

	drawLabel(context) {
		context.fillStyle = "white";
		context.font='200 12px sans-serif';
		context.fillText(this.label, this.position.x - 20, this.position.y - 35);
	}

	draw(context) {
		if (this.displayLabel) this.drawLabel(context);
		if (this.displayHealth && this.maxHealth < Infinity) {
			context.strokeStyle = "white";
			context.strokeRect(this.position.x - 24, this.position.y - 30, 52, 7);

			context.fillStyle = "red";
			context.fillRect(this.position.x - 23, this.position.y - 28, 50 * (this.health / this.maxHealth), 5);
		}
	}

	intPosition() {
		let x = Math.round(this.position.x);
		let y = Math.round(this.position.y);
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

	unpack(json) {
		super.unpack(json);
		if (json['name'] !== 'Player' && json['name'] !== 'AI') this.velocity = new Pair(json['velocity']);
	}

	toString() {
		return `${super.toString()} | v ${this.velocity.toString()}`;
	}

	/**
	 * Update the object's center position based on its current position
	 */
	setCenter() {}

	/**
	 * Called on every game tick (every time the game state updates)
	 * @param {Number} delta time (in ms) since the last call to step
	 * @param {boolean} destroyOnCollision Optional argument which if set to true, destroys the obj on collision
	 * @param {CallableFunction} onCollision Optinal callback which is called with the collided object on collision
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
			// let the other object know that this bullet collided with them
			collision.notifyCollision(this);
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

	unpack(json){
		super.unpack(json);
	}
}