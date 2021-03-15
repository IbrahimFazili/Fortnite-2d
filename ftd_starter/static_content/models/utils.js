export function randint(n) { return Math.round(Math.random() * n); }
export function rand(n) { return Math.random() * n; }

export function clamp(value, min, max) {
	if (value < min) return min;
	else if (value > max) return max;
	return value;
}

export function getOrientation(theta) {
	if (theta <= Math.PI / 4 && theta > -Math.PI / 4) return new Pair(1, 0);
	if (theta <= 3 * Math.PI / 4 && theta > Math.PI / 4) return new Pair(0, 1);
	if (theta <= 5 * Math.PI / 4 && theta > 3 * Math.PI / 4) return new Pair(-1, 0);
	return new Pair(0, -1);
}

export function getMouseAngle(dir) {
	// const posX = new Pair(1, 0);
	// const det = dir.y;
	// const theta = Math.acos(posX.dot(dir) / (posX.norm() * dir.norm()));
	return Math.atan2(dir.y, dir.x);
}

function isBetween(smaller, bigger, x) {
	return x >= smaller && x <= bigger;
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

	squared() {
		return new Pair(this.x ** 2, this.y ** 2);
	}

	multiply(value) {
		return new Pair(this.x * value, this.y * value);
	}
}

// export class Ray {

// 	/**
// 	 * @param origin Pair
// 	 * @param direction Pair
// 	 * @param max_t Int
// 	*/
// 	constructor(origin, direction, max_t) {
// 		this.origin = origin;
// 		this.direction = direction;
// 		this.max_t = max_t;
// 		this.hit_t = Infinity;
// 	}
// }

class BoundingVolume {
	/**
	 * Intersect the given ray with this bounding box. Return true if it intersects
	 * @param ray The ray being shot
	 * @returns True if successful intersection, false otherwise
	 */
	intersect(other) { }
}

export class AABB extends BoundingVolume {
	/**
	 * @param topLeft top left of the rectangle Pair
	 * @param bottomRight bottom right point of the rectangle Pair
	 */
	constructor(topLeft, bottomRight) {
		super();
		this.topLeft = topLeft;
		this.bottomRight = bottomRight;
	}

	intersectAABB(other) {
		if (this.topLeft.x > other.bottomRight.x || other.topLeft.x > this.bottomRight.x) {
			return false;
		}
		else if (this.topLeft.y < other.bottomRight.y || other.topLeft.y < this.bottomRight.y) {
			return false;
		}
		return true;
	}

	intersectCorners(edge1, edge2, other) {
		let d = edge2.sub(edge1);
		let f = edge1.sub(other.center);

		let a = d.dot(d);
		let b = f.dot(d) * 2;
		let c = f.dot(f) - other.radius ** 2;

		let discriminant = b ** 2 - 4 * a * c;
		if (discriminant < 0) {
			return false;
		}

		discriminant = Math.sqrt(discriminant);
		let t1 = (-b - discriminant) / (2 * a);
		let t2 = (-b + discriminant) / (2 * a);

		// t1 is closer
		if (t1 >= 0 && t1 <= 1) {
			return true;
		}

		if (t2 >= 0 && t2 <= 1) {
			return true;
		}

		return false;
	}


	interesctAABC(other) {

		// check if the circle is in rectange
		if (this.topLeft.x <= other.center.x && other.center.x <= this.bottomRight.x &&
			this.topLeft.y <= other.center.y && other.center.y <= this.bottomRight.y) {
			return true;
		}

		// now check if the circle intersect with any point of rectangle
		let topRight = new Pair(this.bottomRight.x, this.topLeft.y);
		let bottomLeft = new Pair(this.topLeft.x, this.bottomRight.y);

		return this.intersectCorners(this.topLeft, topRight, other) || this.intersectCorners(this.topLeft, bottomLeft, other) ||
			this.intersectCorners(bottomLeft, this.bottomRight, other) || this.intersectCorners(this.bottomRight, topRight, other)
	}

	intersect(other) {
		if (other instanceof AABB) {
			// do rect-rect intersection
			return this.intersectAABB(other);
		} else {
			// do rect-circle intersection
			return this.interesctAABC(other);
		}
	}
}

export class AABC extends BoundingVolume {

	/**
	 * @param center is a Pair
	 * @param radius is a Float
	*/
	constructor(center, radius) {
		super();
		this.center = center;
		this.radius = radius;
	}

	intersectAABC(other) {
		return this.center.sub(other.center).norm() <= this.radius + other.radius;
	}

	intersect(other) {
		if (other instanceof AABB) {
			// do rect-circle intersection
			return other.interesctAABC(this);
		} else {
			// do circle-circle intersection
			return this.intersectAABC(other);
		}
	}

}

export class Line {
	constructor(start, end) {
		this.start = start;
		this.end = end;
	}

	intersectLine(line) {
		let b = this.end.sub(this.start);
		let d = line.end.sub(line.start);

		let bDotDPerp = (b.x * d.y) - (b.y * d.x);
		if (bDotDPerp === 0) return null;

		let c = line.start.sub(this.start);
		let t = ((c.x * d.y) - (c.y * d.x)) / bDotDPerp;
		if (t < 0 || t > 1) return false;

		let u = ((c.x * b.y) - (c.y * b.x)) / bDotDPerp;
		if (u < 0 || u > 1) return false;

		return this.start.add(b.multiply(t));
	}
}

export class Inventory {
	constructor(maxWeaponSlots, maxResourceCount, maxAmmoCount) {
		this.maxWeaponSlots = maxWeaponSlots;
		this.maxResourceCount = maxResourceCount;
		this.maxAmmoCount = maxAmmoCount;
		this.equippedWeapon = 0;

		this.weapons = [];
		this.wood = 0;
		this.brick = 0;
		this.metal = 0;
		this.ammo = 0;
	}

	/**
	 * add weapon to the inventory if there's space, otherwise drop
	 * the equipped weapon
	 * 
	 */
	addWeapon(weapon) {
		if (this.weapons.length < this.maxWeaponSlots) {
			this.weapons.push(weapon);
			return null;
		}

		const oldWeapon = this.weapons[this.equippedWeapon];
		this.weapons[this.equippedWeapon] = weapon;
		return oldWeapon;
	}

	switchWeapon(i) {
		if (i > this.weapons.length - 1) return;
		this.equippedWeapon = i;
	}
}

export var LOG_QUEUE = [];
export let log = (msg) => {
	LOG_QUEUE.push({ text: msg, timestamp: Date.now() });
}
