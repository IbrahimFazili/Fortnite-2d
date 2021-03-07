export function randint(n) { return Math.round(Math.random() * n); }
export function rand(n) { return Math.random() * n; }

export function clamp(value, min, max){
	if(value < min) return min;
	else if(value > max) return max;
	return value;
}

export function getOrientation(theta) {
	if (theta <= Math.PI / 4 && theta > -Math.PI / 4) return new Pair(1, 0);
	if (theta <= 3 * Math.PI / 4 && theta > Math.PI / 4) return new Pair(0, 1);
	if (theta <= 5 * Math.PI / 4 && theta > 3 * Math.PI / 4) return new Pair(-1, 0);
	return new Pair(0, -1);
}

export function getMouseAngle(mouse, position) {
	const dir = mouse.sub(position);
	dir.normalize();
	
	// const posX = new Pair(1, 0);
	// const det = dir.y;
	// const theta = Math.acos(posX.dot(dir) / (posX.norm() * dir.norm()));
	return Math.atan2(dir.y, dir.x);
}

export class Pair {
	constructor(x, y) {
		this.x = x; this.y = y;
	}

	toString() {
		return "(" + this.x.toFixed(3) + "," + this.y.toFixed(3) + ")";
	}

	normalize() {
		var magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
		this.x = this.x / magnitude;
		this.y = this.y / magnitude;
	}

	norm() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	dot(other) {
		return (this.x * other.x) + (this.y * other.y);
	}

	add(other) {
		return new Pair(this.x + other.x, this.y + other.y);
	}

	sub(other) {
		return new Pair(this.x - other.x, this.y - other.y);
	}

	copy() {
		return new Pair(this.x, this.y);
	}
}

export class Ray {
	constructor(origin, direction) {
		this.origin = origin;
		this.direction = direction;
		this.direction.normalize();
	}
}
