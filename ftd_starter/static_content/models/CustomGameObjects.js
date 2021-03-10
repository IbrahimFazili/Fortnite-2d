import { DynamicObjects, StaticObjects } from './GameObject';
import { Pair, getOrientation, getMouseAngle, AABB, AABC, Inventory } from './utils';
import { Stage } from './Game';
import { Gun } from './Weapons';

export class Player extends DynamicObjects {
	/**
	 * @param game {Stage}
	 * @param position {Pair}
	 * @param health {Number}
	 * @param color {string}
	 * @param radius {Number}
	 */
	constructor(game, position, health, color){
		super(game, position, health, color, "Player 1");
		// keeping it rectangle for now. need to change it to circle
		this.radius = Player.PL;
		this.center = this.position;
		this.boundingVolume = new AABC(this.center, Player.PLAYER_SIZE);
		this.inventory = new Inventory(3, 100, 360);
		this.inventory.addWeapon(new Gun(this.game, this.position, 'rgb(0, 0, 0)', 7, 180, 30, 500, 500, undefined, 'AR'));
	}

	setCenter() {this.center = this.position;}

	deployItem() {
		const orientation = getOrientation(getMouseAngle(this.game.ptrDirection));
		const newPos = new Pair(this.position.x + (50 * orientation.x) + (Math.abs(orientation.y) * -50),
			this.position.y + (50 * orientation.y) + (Math.abs(orientation.x) * -50));
		this.game.addActor(new Wall(this.game, newPos, 50, 'rgb(200, 1, 1)', orientation));
	}

	fire(hold=false) {
		const weapon = this.inventory.weapons[this.inventory.equippedWeapon];
		if (hold) {
			return setInterval(() => weapon.fire(), Math.round((1000 * 60) / weapon.fireRate));
		} else weapon.fire();
	}

	draw(context) {
		context.beginPath();

		context.fillStyle = this.color;
		// context.fillRect(this.position.x, this.position.y, this.size, this.size);
		context.arc(this.position.x, this.position.y, Player.PLAYER_SIZE, 0, 2 * Math.PI);
		context.fill();
	}
}

Player.PLAYER_SIZE = 20;

export class Wall extends StaticObjects {
	constructor(game, position, health, color = undefined, orientation) {
		super(game, position, health, color, true, "Wall");
		this.w = orientation.y === 0 ? 10 : 100;
		this.h = orientation.y === 0 ? 100 : 10;
		this.center = new Pair(this.position.x + (this.w / 2), this.position.y + (this.h / 2));
		this.boundingVolume = new AABB(this.position, this.position.add(new Pair(this.w, this.h))); 
	}

	draw(context) {
		context.fillStyle = this.color;
		context.fillRect(this.position.x, this.position.y, this.w, this.h);
	}
}

export class Resources extends StaticObjects {
	constructor(game, position, health, color, name){
		super(game, position, health, color, true, name);
		this.w = 75;
		this.h = 75;
		this.center = new Pair(this.position.x + (this.w / 2), this.position.y + (this.h / 2));
		const value = [10, 20, 30];
		this.quantity = value[randint(2)];
	}
}

