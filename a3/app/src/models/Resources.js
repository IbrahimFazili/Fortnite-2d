import { StaticObjects } from "./GameObject";
import { AABB, Pair } from './utils';
import BrickImage from '../assets/brick.png';
import IronImage from '../assets/iron.png';
import AR_Ammo_Image from '../assets/ar-ammo.png';
import SMG_Ammo_Image from '../assets/smg-ammo.png';

const RESOURCE_IMG_SIZE = {
    'Rock': new Pair(75, 45),
    'Steel': new Pair(55, 35),
    'AR Ammo': new Pair(60, 60,)
};

export class Resource extends StaticObjects {
    constructor(game, position, health, harvestCount, image = null, name = "") {
        super(game, position, health, 'rgb(0,0,0)', false, name);
        this.image = image ? new Image(this.w, this.h) : undefined;
        if (image) this.image.src = image;
        this.w = name in RESOURCE_IMG_SIZE ? RESOURCE_IMG_SIZE[name].x : 55;
        this.h = name in RESOURCE_IMG_SIZE ? RESOURCE_IMG_SIZE[name].y : 35;
        this.center = new Pair(this.position.x + (this.w / 2), this.position.y + (this.h / 2));
        this.boundingVolume = new AABB(this.position, this.position.add(new Pair(this.w, this.h)));
        this.harvestCount = harvestCount;
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

    static generateRock(game, position) {
        let res = new Resource(game, position, 100, 10, BrickImage, 'Rock');
        res.isCollidable = true;
        return res;
    }

    static generateSteel(game, position){
        let res = new Resource(game, position, 100, 10, IronImage, 'Steel');
        res.isCollidable = true;
        return res;
    }

    static generateARAmmo(game, position, amount){
        return new Resource(game, position, amount, amount, AR_Ammo_Image, 'AR Ammo');
    }

    static generateSMGAmmo(game, position, amount){
        return new Resource(game, position, amount, amount, SMG_Ammo_Image, 'SMG Ammo');
    }

    unpack(json) {
        super.unpack(json);
        this.harvestCount = json['harvestCount'];
    }
}

