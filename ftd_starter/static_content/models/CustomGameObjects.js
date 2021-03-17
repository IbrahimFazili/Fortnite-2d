import { DynamicObjects, StaticObjects } from './GameObject';
import { Pair, getOrientation, getMouseAngle, AABB, AABC, Inventory, randint } from './utils';
import { Stage } from './Game';
import { Gun, Weapon } from './Weapons';
import { Resource } from './Resources';

export class Player extends DynamicObjects {
	/**
	 * @param game {Stage}
	 * @param position {Pair}
	 * @param health {Number}
	 * @param color {string}
	 * @param radius {Number}
	 */
	constructor(game, position, health, color) {
		super(game, position, health, color, false, "Player 1");
		// keeping it rectangle for now. need to change it to circle
		this.radius = Player.PLAYER_SIZE;
		this.center = this.position;
		this.boundingVolume = new AABC(this.center, Player.PLAYER_SIZE);
		this.inventory = new Inventory(3, 100, 360);
		// this.inventory.addWeapon(Gun.generateAR(this.game, this.position));
		this.displayLabel = true;
	}

	setCenter() { this.center = this.position; }

	onDestroy() {
		this.game.resetGame();
	}

	// 1 Wall = 5 bricks
	deployItem() {
		if (this.game.player.inventory.brick < 5) return;
		this.game.player.inventory.brick -= 5;
		const orientation = getOrientation(getMouseAngle(this.game.ptrDirection));
		const newPos = new Pair(this.position.x + (50 * orientation.x) + (Math.abs(orientation.y) * -50),
			this.position.y + (50 * orientation.y) + (Math.abs(orientation.x) * -50));
		this.game.addActor(new Wall(this.game, newPos, 50, 'rgb(200, 1, 1)', orientation));
	}

	// 1 Wall = 10 steel
	deploySteelWall(){
		if (this.game.player.inventory.steel < 10) return;
		this.game.player.inventory.steel -= 10;
		const orientation = getOrientation(getMouseAngle(this.game.ptrDirection));
		const newPos = new Pair(this.position.x + (50 * orientation.x) + (Math.abs(orientation.y) * -50),
			this.position.y + (50 * orientation.y) + (Math.abs(orientation.x) * -50));
		this.game.addActor(new Wall(this.game, newPos, 100, 'rgb(67, 70, 75)', orientation));
	}

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

	pickupWeapon(weapon) {
		weapon.position = this.position;
		const dropped = this.inventory.addWeapon(weapon);
		if (dropped) {
			dropped.position = dropped.position.copy();
			this.game.addActor(dropped)
		};
		this.game.removeActor(weapon);
	}

	/**
	 * Try to pickup the nearest item we can find within a certain range
	 */
	pickupItem() {
		let minIndex = -1;
		let minDist = Infinity;
		for (let index = 0; index < this.game.actors.length; index++) {
			const item = this.game.actors[index];
			if (!(item instanceof Weapon) && !(item instanceof Resource)) continue;

			const dist = item.center.sub(this.position).norm();
			if (dist < minDist && dist < 60) {
				minDist = dist;
				minIndex = index;
			}
		}

		if (minIndex === -1) return;

		const item = this.game.actors[minIndex];
		if (item instanceof Weapon) this.pickupWeapon(item);
		else {
			switch (item.label){
				case 'Rock':
					this.inventory.brick += item.harvest();
					break;
				case 'Steel':
					this.inventory.steel += item.harvest();
					break;
				case 'AR Ammo':
					if (this.inventory.ARammo + item.harvest() < 320){
						this.inventory.ARammo += item.harvest();
						break;
					}
				case 'SMG Ammo':
					if (this.inventory.SMGammo + item.harvest() < 320){
						this.inventory.SMGammo += item.harvest();
						break;
					}
			}
		}
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
	constructor(game, position, health, color) {
		super(game, position, health, color);
		this.label = "Stupid AI";
		// this.inventory.addWeapon(Gun.generateAR(this.game, this.position));
		this.followPath = false;
		this.timeSinceLastPath = 0;
		this.inventory.addWeapon(Gun.generateAR(this.game, this.position));
	}

	onDestroy() {}

	step(delta) {
		this.timeSinceLastPath += delta;
		// if (this.timeSinceLastPath >= 0) {
		if (this.followPath) {
			const path = this.game.internal_map_grid.findPlayer(this);
			if (path.length > 0) {
				const randVelocity = new Pair(randint(60) - 30, randint(60) - 30);
				this.velocity = path[0].multiply(120).add(randVelocity);
			}
			else this.velocity = new Pair(0, 0);
		}
		// this.timeSinceLastPath = 0;
		// }

		if (this.game.player) {
			let playerDir = this.game.player.position.sub(this.position);
			const dist = playerDir.norm();
			if (dist <= 400 && this.timeSinceLastPath >= 500) {
				playerDir.normalize();
				super.fire(false, playerDir, false);
				this.timeSinceLastPath = 0;
			} else super.reload(false);
		}


		super.step(delta);
	}

	// draw(context) {
	// 	super.draw(context);
	// 	context.beginPath();
	// 	context.fillStyle = this.color;
	// 	// context.fillRect(this.position.x, this.position.y, this.size, this.size);
	// 	context.arc(this.position.x, this.position.y, Player.PLAYER_SIZE, 0, 2 * Math.PI);
	// 	context.fill();
	// }
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
}
