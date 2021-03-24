const { StaticObjects } = require("./GameObject");
const { AABB, Pair } = require('./utils');

const RESOURCE_IMG_SIZE = {
    'Rock': new Pair(75, 45),
    'Steel': new Pair(55, 35),
    'AR Ammo': new Pair(60, 60,)
};

class Resource extends StaticObjects {
    constructor(game, position, health, harvestCount, image = null, name = "") {
        super(game, position, health, 'rgb(0,0,0)', false, name);
        this.image = image;
        this.w = name in RESOURCE_IMG_SIZE ? RESOURCE_IMG_SIZE[name].x : 55;
        this.h = name in RESOURCE_IMG_SIZE ? RESOURCE_IMG_SIZE[name].y : 35;
        this.center = new Pair(this.position.x + (this.w / 2), this.position.y + (this.h / 2));
        this.boundingVolume = new AABB(this.position, this.position.add(new Pair(this.w, this.h)));
        this.harvestCount = harvestCount;
    }

    /**
     * Transfer resource to player
     */
    harvest() {
        this.updateHealth(-this.harvestCount);
        return this.harvestCount;
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

    pack(obj = null){
        const json = {};
        super.pack(json);
        json['image'] = this.image;
        json['w'] = this.w;
        json['h'] = this.h;

        return json;
    }

    static generateRock(game, position) {
        let res = new Resource(game, position, 100, 10, '../assets/brick.png', 'Rock');
        res.isCollidable = true;
        return res;
    }

    static generateSteel(game, position){
        let res = new Resource(game, position, 100, 10, '../assets/iron.png', 'Steel');
        res.isCollidable = true;
        return res;
    }

    static generateARAmmo(game, position, amount){
        return new Resource(game, position, amount, amount, '../assets/ar-ammo.png', 'AR Ammo');
    }

    static generateSMGAmmo(game, position, amount){
        return new Resource(game, position, amount, amount, '../assets/smg-ammo.png', 'SMG Ammo');
    }
}

module.exports = {
    Resource
};