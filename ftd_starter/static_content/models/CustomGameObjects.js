import { DynamicObjects, StaticObjects } from './GameObject';
import { Pair, getOrientation, getMouseAngle } from './utils';

export class Player extends DynamicObjects {

	constructor(game, position, health, color, radius){
		super(game, position, health, color);
		// keeping it rectangle for now. need to change it to circle
		this.size = radius;
	}

	deployItem(mousePos) {
		var mouse = new Pair(mousePos.x, mousePos.y);
		
		const dir = mouse.sub(this.position);
		dir.normalize();

		const orientation = getOrientation(getMouseAngle(mouse, this.position));
		const newPos = new Pair(this.position.x + (50 * orientation.x) + (Math.abs(orientation.y) * -50),
			this.position.y + (50 * orientation.y) + (Math.abs(orientation.x) * -50));
		this.game.addActor(new Wall(this.game, newPos, 50, 'rgb(200, 1, 1)', orientation));
	}

	draw(context) {
		context.fillStyle = this.color;
		context.fillRect(this.position.x, this.position.y, this.size, this.size);
	}
}

export class Wall extends StaticObjects {
	constructor(game, position, health, color = undefined, orientation) {
		super(game, position, health, color, true);
		this.w = orientation.y === 0 ? 10 : 100;
		this.h = orientation.y === 0 ? 100 : 10;
		this.center = new Pair(this.position.x + (this.w / 2), this.position.y + (this.h / 2));
	}

	draw(context) {
		context.fillStyle = this.color;
		context.fillRect(this.position.x, this.position.y, this.w, this.h);
	}
}

