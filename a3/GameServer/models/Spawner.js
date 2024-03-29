const { AI, Player, Obstacles } = require("./CustomGameObjects");
const { Resource } = require("./Resources");
const { AABC, clamp, Pair, randint } = require("./utils");
const { Gun } = require("./Weapons");

class Spawner {

    constructor(game, initSpawnRate, initSpawnCount) {
        this.game = game;
        this.spawnRate = initSpawnRate;
        this.maxEnemiestoSpawn = initSpawnCount;

        this.totalEnemiesSpawned = 0;
        this.enemiesSpawnedinRound = 0;
        this.time = 0;
        this.round = 1;
        this.spawnHealth = 100.0;
        this.AIaimVariance = 20;
        this.maxAmmoToSpawn = this.round * 80;
        this.maxResourcesToSpawn = this.round * 2;

        // this.generateObstacles();
        this.spawnAmmo();
        this.spawnResources();
    }

    toString() {
        return `Round ${this.round}: sr ${this.spawnRate} | maxSp ${this.maxEnemiestoSpawn} | h ${this.spawnHealth}`;
    }

    getRandomColor() {
        return `rgb(${randint(255)}, ${randint(255)}, ${randint(255)})`;
    }

    getScorePerKill() {
        return this.round * 10;
    }

    _check_collision_with_world(actorBoundingVol) {
        for (let index = 0; index < this.game.actors.length; index++) {
            const actor = this.game.actors[index];
            if (actor.isCollidable && actorBoundingVol.intersect(actor.boundingVolume)) {
                return true;
            }
        }

        return false;
    }

    spawnPlayer(username) {
        let col = true;
        let newUser = null;
        while (col) {
            let newPos = new Pair(randint(this.game.worldWidth), randint(this.game.worldHeight));

            newUser = new Player(this.game, newPos, 100, this.getRandomColor(), username, true);
            if (!this._check_collision_with_world(newUser.boundingVolume)) {
                col = false;
                this.game.addActor(newUser);
                this.game.addActor(Gun.generateAR(this.game, newPos.add(new Pair(100, 100)), null));
                this.game.addActor(Gun.generateSMG(this.game, newPos.add(new Pair(-100, -100)), null))
            }
        }
    }

    generateObstacles() {
        var i = 0;
        while (i < 8) {
            var position = new Pair(randint(this.game.worldWidth), randint(this.game.worldHeight));
            var obj = new Obstacles(this.game, position, Infinity, 'rgb(0,0,0)', 'Obstacle');
            if (!this._check_collision_with_world(obj.boundingVolume)) {
                i++;
                this.game.addActor(obj);
            }
        }
    }

    spawnAmmo() {
        const splitFactor = Math.random();
        const split1 = Math.round(splitFactor * this.maxAmmoToSpawn);
        const split2 = this.maxAmmoToSpawn - split1;
        let pos1 = null, pos2 = null;

        while (true) {
            pos1 = new Pair(randint(this.game.worldWidth), randint(this.game.worldHeight));
            if (!this._check_collision_with_world(new AABC(pos1, 30))) break;
        }

        let ammo = Resource.generateARAmmo(this.game, pos1, split1);
        ammo.displayHealth = false;
        this.game.addActor(ammo);

        if (split2 > 0) {
            while (true) {
                pos2 = new Pair(randint(this.game.worldWidth), randint(this.game.worldHeight));
                if (!this._check_collision_with_world(new AABC(pos2, 30))) break;
            }
            ammo = Resource.generateSMGAmmo(this.game,
                pos2, split2);
            ammo.displayHealth = false;
            this.game.addActor(ammo);
        }
    }

    spawnEnemy() {
        if (this.enemiesSpawnedinRound >= this.maxEnemiestoSpawn) return;
        while (true) {
            const randPos = new Pair(randint(this.game.worldWidth), randint(this.game.worldHeight));
            const tempAABC = new AABC(randPos, Player.PLAYER_SIZE);
            let safeSpawnLoc = !this._check_collision_with_world(tempAABC);

            if (!safeSpawnLoc) continue;

            this.game.addActor(new AI(this.game, randPos, this.spawnHealth, this.getRandomColor(), this.AIaimVariance));
            this.enemiesSpawnedinRound++;
            this.totalEnemiesSpawned++;
            return;
        }
    }

    spawnResources() {
        const splitFactor = Math.random();
        let split1 = Math.round(splitFactor * this.maxResourcesToSpawn);
        let split2 = this.maxResourcesToSpawn - split1;
        let brickCount = Math.max(split1, split2);
        let steelCount = Math.min(split1, split2);
        const safeDeploy = (count, genFunc) => {
            for (let i = 0; i < count; i++) {
                while (true) {
                    const spawnPos = new Pair(randint(this.game.worldWidth), randint(this.game.worldHeight));
                    const resource = genFunc(this.game, spawnPos);
                    if (!this._check_collision_with_world(resource.boundingVolume)) {
                        this.game.addActor(resource);
                        break;
                    }
                }

            }
        }

        safeDeploy(brickCount, Resource.generateRock);
        safeDeploy(steelCount, Resource.generateSteel);
    }

    startNextRound() {
        this.enemiesSpawnedinRound = 0;
        this.round++;
        this.spawnRate = 1 + this.round * 0.15;
        this.spawnHealth = 100 + (this.round * 10);
        this.maxEnemiestoSpawn = 2 ** this.round;
        this.AIaimVariance = clamp(Math.round(20 - (1.5 * this.round)), 5, 20);
        this.maxAmmoToSpawn = this.round * 40;
        this.maxResourcesToSpawn = this.round * 2;

        this.spawnAmmo();
        this.spawnResources();
    }

    step(delta) {
        const playerCount = this.game.getPlayerCount();
        if (playerCount === 0) return;
        this.time += delta;
        if (this.time >= 60 * 1000 / playerCount) {
            this.time = 0;
            this.spawnAmmo();
            this.spawnResources();
        }
    }
}

module.exports = {
    Spawner
};