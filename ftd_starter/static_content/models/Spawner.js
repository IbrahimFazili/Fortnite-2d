import { AI, Player } from "./CustomGameObjects";
import { AABC, Pair, randint } from "./utils";

export class Spawner {

    constructor(game, initSpawnRate, initSpawnCount) {
        this.game = game;
        this.spawnRate = initSpawnRate;
        this.maxEnemiestoSpawn = initSpawnCount;

        this.totalEnemiesSpawned = 0;
        this.enemiesSpawnedinRound = 0;
        this.time = 0;
        this.round = 1;
        this.spawnHealth = 100.0;
    }

    toString() {
        return `Round ${this.round}: sr ${this.spawnRate} | maxSp ${this.maxEnemiestoSpawn} | h ${this.spawnHealth}`;
    }

    getRandomColor() {
        return `rgb(${randint(255)}, ${randint(255)}, ${randint(255)})`;
    }

    spawnEnemy() {
        if (this.enemiesSpawnedinRound >= this.maxEnemiestoSpawn) return;
        while (true) {
            const randPos = new Pair(randint(this.game.worldWidth), randint(this.game.worldHeight));
            const tempAABC = new AABC(randPos, Player.PLAYER_SIZE);
            let safeSpawnLoc = true;
            for (let index = 0; index < this.game.actors.length; index++) {
                const actor = this.game.actors[index];
                if (actor.isCollidable && tempAABC.intersect(actor.boundingVolume)) {
                    safeSpawnLoc = false;
                    break;
                }
            }

            if (!safeSpawnLoc) continue;

            this.game.addActor(new AI(this.game, randPos, this.spawnHealth, this.getRandomColor()));
            this.enemiesSpawnedinRound++;
            this.totalEnemiesSpawned++;
            return;
        }
    }

    startNextRound() {
        this.enemiesSpawnedinRound = 0;
        this.round++;
        this.spawnRate = 1 + this.round * 0.15;
        this.spawnHealth = 100 + (this.round * 10);
        this.maxEnemiestoSpawn = 2**this.round;
    }

    step(delta) {
        this.time += delta;
        if (this.time >= 5000 / this.spawnRate) {
            this.time = 0;
            this.spawnEnemy();
        }
    }
}