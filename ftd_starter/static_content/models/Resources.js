import { StaticObjects } from "./GameObject";
import {AABB, Pair} from './utils';

const RESOURCE_IMG_SIZE = {
    'Rock': new Pair(75, 45),
    'Ammo': new Pair(55, 35),
};

export class Resources extends StaticObjects{
    constructor(game, position, health, color, image=null, name=""){
        super(game, position, health, color, true, name);
        this.image = image ? new Image(this.w, this.h) : undefined;
        if (image) this.image.src = image;
        this.w = name in RESOURCE_IMG_SIZE ? RESOURCE_IMG_SIZE[name].x : 55;
		this.h = name in RESOURCE_IMG_SIZE ? RESOURCE_IMG_SIZE[name].y : 35;
		this.center = new Pair(this.position.x + (this.w / 2), this.position.y + (this.h / 2));
		this.boundingVolume = new AABB(this.position, this.position.add(new Pair(this.w, this.h)));
    }

    draw(context){
        super.draw(context);
        if (this.image) {
            context.drawImage(this.image, this.position.x, this.position.y, this.w, this.h);
        } else {
            context.fillStyle = "purple";
            context.fillRect(this.position.x, this.position.y, this.w, this.h);
        }
    }

    static generateRock(game, position){
        return new Resources(game, position, 100, 'rgb(0,0,0)', '../assets/rock.png', 'Rock');
    }
}

