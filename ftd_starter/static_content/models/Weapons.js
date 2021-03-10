import { StaticObjects, DynamicObjects } from './GameObject';
import { Player } from './CustomGameObjects';
import { Pair, AABB, AABC, getMouseAngle } from './utils';


export class Weapon extends StaticObjects{
	constructor(game, position, health, color, name="Weapon"){
		super(game, position, health, color, false, name);
		this.w = 75;
		this.h = 75;
		this.center = new Pair(this.position.x + (this.w / 2), this.position.y + (this.h / 2));
	}
}

export class Bullet extends DynamicObjects {
    constructor(game, position, damage, maxRange) {
        super(game, position, Infinity, 'rgb(255, 255, 255)');
        this.damage = damage;
        this.radius = 5;
        this.maxRange = maxRange;
        this.dir = this.game.ptrDirection.copy();
        this.boundingVolume = new AABC(this.position, this.radius);
        this.distanceTravelled = 0;
        // this
    }

    toString() {
        return `p: ${this.position.toString()}`;
    }

    step() {
        super.step(true);
        this.distanceTravelled += this.velocity.norm();
        // @todo decrease damage after halfpoint
        if (this.distanceTravelled > this.maxRange){
            this.game.removeActor(this);
            return;
        }
    }

    draw(context) {
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
    constructor(game, position, color, damage, maxAmmo, clipSize, fireRate, maxRange, image=undefined, name="Gun"){
        super(game, position, Infinity, color, name);
        this.maxAmmo = maxAmmo;
        this.damage = damage;
        this.fireRate = fireRate;
        this.clipSize = clipSize;
        this.maxRange = maxRange;
        this.image = image;
        this.velocity = 5;
        // burst or auto?
    }
    
    step() {
        
    }

    fire() {
        const newPos = this.position.add(this.game.ptrDirection.multiply(Player.PLAYER_SIZE + 0.1));
		let bullet = new Bullet(this.game, newPos.copy(), this.damage, this.maxRange);
		bullet.velocity = bullet.dir.multiply(this.velocity);
		this.game.addActor(bullet);
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