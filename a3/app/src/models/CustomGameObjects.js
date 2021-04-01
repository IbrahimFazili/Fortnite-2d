import { DynamicObjects, StaticObjects } from './GameObject';
import { Pair, AABB, AABC, Inventory } from './utils';
import { Stage } from './Game';
import { Bullet, Gun, Weapon } from './Weapons';
import WallImage from '../assets/wall.png';

export class Player extends DynamicObjects {
	/**
	 * @param game {Stage}
	 * @param position {Pair}
	 * @param health {Number}
	 * @param color {string}
	 * @param radius {Number}
	 */
	constructor(game, position, health, color, name, regenEnabled = true) {
		super(game, position, health, color, false, name);
		this.radius = Player.PLAYER_SIZE;
		this.center = this.position;
		this.boundingVolume = new AABC(this.center, Player.PLAYER_SIZE);
		this.inventory = new Inventory(3, 100, 360);
		this.displayLabel = true;
	}

	setCenter() { this.center = this.position; }

	/**
	 * Fire the weapon in hand
	 * @param {boolean} hold wheter to tap fire or auto fire (hold trigger -> hold = true)
	 * @param {Pair} dir unit direction vector along which to fire in
	 * @param {boolean} reloadSound whether to play the reload sound or not
	 * @returns {NodeJS.Timeout} return value of the setInterval call used to simulate auto fire
	 * at weapon's rate of fire
	 */
	fire(hold = false, dir = null, reloadSound = true) {
		if (this.inventory.weapons.length === 0) return;
		const weapon = this.inventory.weapons[this.inventory.equippedWeapon];
		if (hold) {
			return setInterval(() => weapon.fire(dir ? dir : this.game.ptrDirection, reloadSound),
				Math.round((1000 * 60) / weapon.fireRate));
		} else weapon.fire(dir ? dir : this.game.ptrDirection, reloadSound);
	}

	/**
	 * reload the equipped weapon
	 * @param {boolean} playSound whether to play the reload sound or not (default true)
	 */
	reload(playSound = true) {
		if (this.inventory.weapons.length === 0) return;
		const weapon = this.inventory.weapons[this.inventory.equippedWeapon];
		weapon.reload(playSound);
	}

	switchWeapon(i) { this.inventory.switchWeapon(i); }

	draw(context) {
		super.draw(context);
		context.beginPath();
		context.fillStyle = this.color;
		// context.fillRect(this.position.x, this.position.y, this.size, this.size);
		context.arc(this.position.x, this.position.y, Player.PLAYER_SIZE, 0, 2 * Math.PI);
		context.fill();
	}

	unpack(json) {
		super.unpack(json);
		this.inventory.unpack(json['inventory']);

		const getWeapon = (id) => {
			return this.inventory.weapons.find((w) => w.id === id);
		}

		const weapons = [];
		json.inventory.weapons.forEach((w, i) => {
			let oldWeapon = getWeapon(w.id);
			if (oldWeapon) oldWeapon.unpack(w);
			else {
				oldWeapon = Gun.generateAR(this.game, new Pair(w.position), null);
				oldWeapon.unpack(w);
			}

			weapons.push(oldWeapon);
		});

		this.inventory.weapons = weapons;
	}
}

Player.PLAYER_SIZE = 20;

export class AI extends Player {
	/**
	 * @param game {Stage}
	 * @param position {Pair}
	 * @param health {Number}
	 * @param color {string}
	 * @param radius {Number}
	 */
	constructor(game, position, health, color, aimVarianceFactor) {
		super(game, position, health, color, false);
		this.label = "Stupid AI";
		// this.inventory.addWeapon(Gun.generateAR(this.game, this.position));
		this.followPath = true;
		this.timeSinceLastPath = 0;
		this.inventory.ARammo = Infinity;
		this.inventory.SMGammo = Infinity;
		this.aimVarianceFactor = aimVarianceFactor
		this.inventory.addWeapon(Gun.generateAR(this.game, this.position, this));
	}

	onDestroy() { }

	unpack(json) {
		super.unpack(json);
		// this.velocity = new Pair(json['velocity'].x, json['velocity'].y);
	}

	step(delta) {
		this.timeSinceLastPath += delta;
		super.step(delta);
	}
}

export class Wall extends StaticObjects {
	constructor(game, position, health, color = undefined, orientation) {
		super(game, position, health, color, true, "Wall");
		this.w = orientation.y === 0 ? 10 : 100;
		this.h = orientation.y === 0 ? 100 : 10;
		this.center = new Pair(this.position.x + (this.w / 2), this.position.y + (this.h / 2));
		this.boundingVolume = new AABB(this.position, this.position.add(new Pair(this.w, this.h)));
	}

	draw(context) {
		super.draw(context);
		context.fillStyle = this.color;
		context.fillRect(this.position.x, this.position.y, this.w, this.h);
	}

	unpack(json){
		super.unpack(json);
		this.w = json['w'];
		this.h = json['h'];
		this.color = json['color'];
		this.isCollidable = true;
	}
}

export class Obstacles extends StaticObjects {

	constructor(game, position, w, h, health, color, name = 'Obstacle') {
		super(game, position, health, color, true, name = name);
		this.w = w;
		this.h = h;
		this.boundingVolume = new AABB(this.position, this.position.add(new Pair(this.w, this.h)));
		this.image = new Image(300, 300);
		this.image.src = WallImage;
		this.displayHealth = false;
	}

	draw(context) {
		super.draw(context);
		context.drawImage(this.image, this.position.x, this.position.y, this.w, this.h);
	}

	unpack(json) {
		super.unpack(json);
	}
}