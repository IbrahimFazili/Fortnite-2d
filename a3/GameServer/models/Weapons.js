const { StaticObjects, DynamicObjects } = require('./GameObject');
const { Player } = require('./CustomGameObjects');
const { Pair, AABB, AABC, clamp } = require('./utils');

const GUN_IMG_SIZE_MAP = {
    'AR': new Pair(75, 45),
    'SMG': new Pair(55, 35),
};

class Weapon extends StaticObjects {
    constructor(game, owner, position, health, color, name = "Weapon") {
        super(game, position, health, color, false, name);
        this.w = name in GUN_IMG_SIZE_MAP ? GUN_IMG_SIZE_MAP[name].x : 55;
        this.h = name in GUN_IMG_SIZE_MAP ? GUN_IMG_SIZE_MAP[name].y : 35;
        this.center = new Pair(this.position.x + (this.w / 2), this.position.y + (this.h / 2));
        this.owner = owner;
    }

    setCenter() {
        this.center = this.position.add((new Pair(this.w / 2, this.h / 2)));
    }

    draw(context) {
        this.setCenter();
        super.draw(context);
    }
}

class Bullet extends DynamicObjects {
    constructor(game, position, damage, maxRange, dir) {
        super(game, position, Infinity, 'rgb(255, 255, 255)');
        this.damage = damage;
        this.radius = 2.5;
        this.maxRange = maxRange;
        this.dir = dir.copy();
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
        if (this.distanceTravelled > this.maxRange) {
            this.game.removeActor(this);
            return;
        }
    }

    pack(obj = null) {
        const json = {};
        super.pack(json);
        json['radius'] = this.radius;
        json['color'] = this.color;
        json['damage'] = this.damage;
        json['maxRange'] = this.maxRange;
        json['dir'] = this.dir.pack();
        json['distanceTravelled'] = this.distanceTravelled;
        return json;
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
class Gun extends Weapon {
    constructor(game, owner, position, color, damage, clipSize, fireRate, maxRange,
        reloadTime, image = undefined, reloadSound = null, name = "Gun") {
        super(game, owner, position, Infinity, color, name);
        this.damage = damage;
        this.fireRate = fireRate;
        this.clipSize = clipSize;
        this.maxRange = maxRange;
        this.currentAmmo = this.clipSize;
        this.image = image;
        this.velocity = 750;
        this.reloading = false;
        this.reloadTime = reloadTime;
        this.reloadSound = reloadSound;
    }

    toString() {
        return `${super.toString()} | Name: ${this.label} | Ammo: ${this.currentAmmo} ${this.reloading ? '(reloading)' : ''}`;
    }

    step(delta) {
        super.step(delta);
    }

    fire(dir, playReloadSound) {
        if (this.reloading) return;
        if (this.currentAmmo > 0) {
            this.currentAmmo -= 1;
            const newPos = this.position.add(dir.multiply(this.owner.radius + 0.1));
            let bullet = new Bullet(this.game, newPos.copy(), this.damage, this.maxRange, dir);
            bullet.velocity = bullet.dir.multiply(this.velocity);
            this.game.addActor(bullet);
            this.currentAmmo === 0 && this.reload(playReloadSound);
        }
    }

    reload(sound) {
        if (this.reloading || this.currentAmmo === this.clipSize
            || this.owner.inventory[this.label + 'ammo'] === 0) return;
        this.reloading = true;

        setTimeout(() => {

            const amount = this.clipSize - this.currentAmmo;
            this.currentAmmo += clamp(amount, 0, this.owner.inventory[this.label + 'ammo']);

            var used = null;
            if (amount < this.owner.inventory[this.label + 'ammo']
                && this.owner.inventory[this.label + 'ammo'] - amount > 0) {
                used = this.owner.inventory[this.label + 'ammo'] - amount;
            }
            else used = 0;
            this.owner.inventory[this.label + 'ammo'] = used;

            this.reloading = false;
        }, this.reloadTime);
    }


    static generateAR(game, position, owner) {
        return new Gun(game, owner, position, 'rgb(0, 0, 0)', 11, 25, 280, 1500, 1500, '../assets/AR.png',
            'ar-reload.mp3', 'AR');
    }

    static generateSMG(game, position, owner) {
        return new Gun(game, owner, position, 'rgb(0, 0, 0)', 6, 32, 420, 1100, 1000, '../assets/SMG.png',
            'smg-reload.mp3', 'SMG');
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

    pack(obj = null) {
        const json = {};
        super.pack(json);
        json['image'] = this.image;
        json['w'] = this.w;
        json['h'] = this.h;
        json['currentAmmo'] = this.currentAmmo;
        json['reloading'] = this.reloading;
        json['owner'] = this.owner ? this.owner.id : -1;
        return json;
    }

}

module.exports = {
    Weapon,
    Bullet,
    Gun
}