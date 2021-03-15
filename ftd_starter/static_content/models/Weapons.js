import { StaticObjects, DynamicObjects } from './GameObject';
import { Player } from './CustomGameObjects';
import { Pair, AABB, AABC, getMouseAngle, log } from './utils';

const GUN_IMG_SIZE_MAP = {
    'AR': new Pair(75, 45),
    'SMG': new Pair(55, 35),
};

export class Weapon extends StaticObjects{
	constructor(game, position, health, color, name="Weapon"){
		super(game, position, health, color, false, name);
		this.w = name in GUN_IMG_SIZE_MAP ? GUN_IMG_SIZE_MAP[name].x : 55;
		this.h = name in GUN_IMG_SIZE_MAP ? GUN_IMG_SIZE_MAP[name].y : 35;
		this.center = new Pair(this.position.x + (this.w / 2), this.position.y + (this.h / 2));
	}

    setCenter() {
        this.center = this.position.add((new Pair(this.w / 2, this.h / 2)));
    }

    draw(context) {
        this.setCenter();
        super.draw(context);
    }
}

export class Bullet extends DynamicObjects {
    constructor(game, position, damage, maxRange) {
        super(game, position, Infinity, 'rgb(255, 255, 255)');
        this.damage = damage;
        this.radius = 2.5;
        this.maxRange = maxRange;
        this.dir = this.game.ptrDirection.copy();
        this.boundingVolume = new AABC(this.position, this.radius);
        this.distanceTravelled = 0;
        // this
    }

    _onCollision(object) {
        object.updateHealth(-this.damage);
    }

    toString() {
        return `p: ${this.position.toString()}`;
    }

    step(delta) {
        super.step(delta, true, this._onCollision.bind(this));
        this.distanceTravelled += (this.velocity.norm() * (delta / 1000));
        // @todo decrease damage after halfpoint
        if (this.distanceTravelled > this.maxRange){
            this.game.removeActor(this);
            return;
        }
    }

    draw(context) {
        super.draw(context);
        context.beginPath();
        context.fillStyle = this.color;
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
		context.fill();
    }
}

/**
 * For Gun varieties we have Pistols, SMG, AR
 * */ 
export class Gun extends Weapon {
    constructor(game, position, color, damage, clipSize, fireRate, maxRange, reloadTime, image=undefined, name="Gun"){
        super(game, position, Infinity, color, name);
        this.damage = damage;
        this.fireRate = fireRate;
        this.clipSize = clipSize;
        this.maxRange = maxRange;
        this.currentAmmo = this.clipSize;
        this.image = image ? new Image(this.w, this.h) : undefined;
        if (image) this.image.src = image;
        this.velocity = 750;
        this.reloading = false;
        this.reloadTime = reloadTime;
        this.reloadSound = new Audio('../assets/ar-reload.mp3');
        // burst or auto?
    }

    toString() {
        return `${super.toString()} | Name: ${this.label} | Ammo: ${this.currentAmmo} ${this.reloading ? '(reloading)' : ''}`;
    }
    
    step(delta) {
        super.step(delta);
    }

    fire() {
        if (this.reloading) return;
        if (this.currentAmmo > 0){
            this.currentAmmo -= 1;
            const newPos = this.position.add(this.game.ptrDirection.multiply(Player.PLAYER_SIZE + 0.1));
            let bullet = new Bullet(this.game, newPos.copy(), this.damage, this.maxRange);
            bullet.velocity = bullet.dir.multiply(this.velocity);
            this.game.addActor(bullet);

            this.currentAmmo === 0 && this.reload();
        }
    }

    reload() {
        if (this.reloading) return;
        this.reloading = true;
        this.reloadSound.play();
        // @todo depends how much is in reserves
        setTimeout(() => {
            if (this.currentAmmo < this.clipSize) {
                this.currentAmmo += (this.clipSize - this.currentAmmo);
            }

            this.reloading = false;
        }, this.reloadTime);
    }

    static generateAR(game, position) {
        return new Gun(game, position, 'rgb(0, 0, 0)', 11, 25, 280, 1500, 1500, '../assets/AR.png', 'AR');
    }

    static generateSMG(game, position) {
        return new Gun(game, position, 'rgb(0, 0, 0)', 6, 32, 420, 1100, 1000, '../assets/SMG.png', 'SMG');
    }

    draw(context) {
        super.draw(context);
        if (this.image) {
            context.drawImage(this.image, this.position.x, this.position.y, this.w, this.h);
        } else {
            context.fillStyle = "purple";
            context.fillRect(this.position.x, this.position.y, this.w, this.h);
        }
    }

}

export class Axe extends Weapon{
    constructor(game, position, color, name){
        super(game, position, 100, color, name);
        this.damage = 10;
    }

    step(){
        
    }
}