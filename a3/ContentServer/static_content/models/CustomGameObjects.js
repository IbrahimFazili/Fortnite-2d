import { DynamicObjects, StaticObjects } from './GameObject';
import { Pair, getOrientation, getMouseAngle, AABB, AABC, Inventory, randint, clamp } from './utils';
import { Stage } from './Game';
import { Bullet, Gun, Weapon } from './Weapons';
import { Resource } from './Resources';

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
		this.regenEnabled = regenEnabled;
		this.regenTimeout = -1;
		this.regenInterval = -1;
		// this.maxHealth = 1000;
	}
 
	setCenter() { this.center = this.position; }

	onDestroy() {
		this.game.resetGame();
	}

	// 1 Wall = 10 bricks
	deployItem() {
		if (this.game.player.inventory.brick < 10) return;
		this.game.player.inventory.brick -= 10;
		const orientation = getOrientation(getMouseAngle(this.game.ptrDirection));
		const newPos = new Pair(this.position.x + (50 * orientation.x) + (Math.abs(orientation.y) * -50),
			this.position.y + (50 * orientation.y) + (Math.abs(orientation.x) * -50));
		
		const wall = new Wall(this.game, newPos, 50, 'rgb(200, 1, 1)', orientation);
		if (!this.game.spawner._check_collision_with_world(wall.boundingVolume))
		{
			this.game.addActor(wall);
		}
	}

	// 1 Wall = 35 steel
	deploySteelWall() {
		if (this.game.player.inventory.steel < 35) return;
		this.game.player.inventory.steel -= 35;
		const orientation = getOrientation(getMouseAngle(this.game.ptrDirection));
		const newPos = new Pair(this.position.x + (50 * orientation.x) + (Math.abs(orientation.y) * -50),
			this.position.y + (50 * orientation.y) + (Math.abs(orientation.x) * -50));
		const wall = new Wall(this.game, newPos, 100, 'rgb(67, 70, 75)', orientation);
		if (!this.game.spawner._check_collision_with_world(wall.boundingVolume))
		{
			this.game.addActor(wall);
		}
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
		weapon.owner = this;
		const dropped = this.inventory.addWeapon(weapon);
		if (dropped) {
			dropped.owner = null;
			dropped.position = dropped.position.copy();
			this.game.addActor(dropped)
		};
		this.game.removeActor(weapon);
	}

	pickupResource(item) {
		switch (item.label) {
			case 'Rock':
				this.inventory.brick += item.harvest();
				break;
			case 'Steel':
				this.inventory.steel += item.harvest();
				break;
			case 'AR Ammo':
				const pickupAmount = clamp(item.harvestCount, 0, this.inventory.maxAmmoCount - this.inventory.ARammo);
				this.inventory.ARammo += Math.min(pickupAmount, item.harvest());
				break;
			case 'SMG Ammo':
				const pickSMGAmmo = clamp(item.harvestCount, 0, this.inventory.maxAmmoCount - this.inventory.SMGammo);
				this.inventory.SMGammo += Math.min(pickSMGAmmo, item.harvest());
				break;
		}
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
		else this.pickupResource(item);
	}

	switchWeapon(i) { this.inventory.switchWeapon(i); }

	notifyCollision(actor) {
		if (!(actor instanceof Bullet)) return;

		clearInterval(this.regenInterval);
		clearTimeout(this.regenTimeout);

		if (this.regenEnabled) {
			this.regenTimeout = setTimeout(() => {
				this.regenInterval = setInterval(() => {
					this.updateHealth(10)
				}, 250);
			}, 4000);
		}
	}

	step(delta) {
		super.step(delta);
		if (this.health >= this.maxHealth) {
			clearTimeout(this.regenTimeout);
			clearInterval(this.regenInterval);
		}
	}

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
				const randDir = randint(2);
				let perpVec = null;
				if (randDir < 1) perpVec = new Pair(playerDir.y, -playerDir.x);
				else perpVec = new Pair(-playerDir.y, playerDir.x);
				playerDir = playerDir.add(perpVec.multiply(this.aimVarianceFactor / 100));
				playerDir.normalize();
				// playerdir + (perpVec * (factor / 100))
				super.fire(false, playerDir, false);
				this.timeSinceLastPath = 0;
			} else super.reload(false);
		}


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
}

export class Obstacles extends StaticObjects {

	constructor(game, position, health, color, name='Obstacle'){
		super(game, position, health, color, true, name=name);
		this.w = Math.floor(Math.random() * (400 - 201)) + 201;
		this.h = Math.floor(Math.random() * (400 - 201)) + 201;
		this.boundingVolume = new AABB(this.position, this.position.add(new Pair(this.w, this.h)));
		this.image = new Image(300, 300);
		this.image.src = '../assets/wall.png';
	}

	draw(context){
		super.draw(context);
		context.drawImage(this.image, this.position.x, this.position.y, this.w, this.h);
	}
}