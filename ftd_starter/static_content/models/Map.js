import { Wall } from './CustomGameObjects';
import { Pair } from './utils';

export class Map {
    constructor(game, rows, cols, squaresize) {
        this.game = game;
        this.rows = rows / 4;
        this.cols = cols / 4;
        this.squaresize = squaresize * 4;

        //initialize grid
        this.grid = null;
    }

    /**
    * clears the grid to be reused
    */
    clearGrid() {
        this.grid = new Array(this.rows);
        for (var i = 0; i < this.cols; i++) {
            this.grid[i] = new Array(this.cols).fill('Empty');
        }
    }

    /**
     * loops through all actors and players to mark points on grid as Occupied
    */
    updateGrid() {
        // build 2d grid that updates in real time if a block is 'Empty', 'Occupied', or 'Player'
        for (var i = 0; i < this.game.actors.length; i++) {
            // fix this @todo not neccessary int
            var x = Math.floor(this.game.actors[i].position.x / this.squaresize);
            var y = Math.floor(this.game.actors[i].position.y / this.squaresize);

            if (this.game.actors[i] instanceof Wall) {
                var width = (this.game.actors[i].w / this.squaresize);
                var height = (this.game.actors[i].h / this.squaresize);
                // width 100 height 10
                for (var w = -1; w < width + 1; w++) {
                    for (var h = -1; h < height + 1; h++) {
                        if (x + w < 0 || y + h < 0) continue;
                        if (x + w >= this.grid.length || y + h >= this.grid[0].length) continue;
                        this.grid[x + w][y + h] = 'Occupied';
                    }
                }
            }
            this.grid[x][y] = 'Occupied';

        }

        // fix this
        var px = Math.floor(this.game.player.position.x / this.squaresize);
        var py = Math.floor(this.game.player.position.y / this.squaresize);
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (px + i < 0 || py + j < 0) continue;
                if (px + i >= this.grid.length || py + j >= this.grid[0].length) continue;
                this.grid[px + i][py + j] = 'Player';
            }
            
        }
        this.grid[px][py] = 'Player';

    }

    // Pathfinding source: http://gregtrowbridge.com/a-basic-pathfinding-algorithm/

    copy_grid() {
        let copy = new Array(this.rows);
        for (let index = 0; index < copy.length; index++) copy[index] = new Array(this.cols);

        for (let i = 0; i < copy.length; i++) {
            for (let j = 0; j < copy[i].length; j++) {
                copy[i][j] = this.grid[i][j];
            }
        }

        return copy;
    }
    /**
     * computes the shortest distance to the player given starting points
    */
    shortestPath(startCoordinates) {
        var distanceFromTop = Math.floor(startCoordinates.y / this.squaresize);
        var distanceFromLeft = Math.floor(startCoordinates.x / this.squaresize);

        var location = {
            distanceFromTop: distanceFromTop,
            distanceFromLeft: distanceFromLeft,
            path: [],
            status: 'Start'
        };

        const dirs = ['North', 'South', 'East', 'West'];

        var queue = [location];
        let grid = this.copy_grid();

        while (queue.length > 0) {
            var currentLocation = queue.shift();

            for (let i = 0; i < dirs.length; i++) {
                let newLocation = this.exploreInDirection(currentLocation, dirs[i], grid);
                if (newLocation.status === 'Player') return newLocation.path;
                else if (newLocation.status === 'Valid') queue.push(newLocation);
            }
        }

        return false;
    }

    /**
     * check in a particular direction
    */
    exploreInDirection(currentLocation, direction, grid) {
        var newPath = currentLocation.path.slice();
        newPath.push(direction);

        var dfl = currentLocation.distanceFromLeft;
        var dft = currentLocation.distanceFromTop;

        const dirMap = {
            'North': () => dft -= 1,
            'East': () => dfl += 1,
            'South': () => dft += 1,
            'West': () => dfl -= 1
        };

        dirMap[direction]();


        var newLocation = {
            distanceFromTop: dft,
            distanceFromLeft: dfl,
            path: newPath,
            status: 'Unknown'
        };

        newLocation.status = this.locationStatus(newLocation, grid);

        if (newLocation.status === "Valid") {
            grid[newLocation.distanceFromLeft][newLocation.distanceFromTop] = 'Valid';
        }

        return newLocation;
    }

    /**
     * check if a particular position is Empty, Occupied or Visited
    */
    locationStatus(location, grid) {
        var gridSize = grid.length;
        var dft = location.distanceFromTop;
        var dfl = location.distanceFromLeft;

        if (location.distanceFromLeft < 0 ||
            location.distanceFromLeft >= gridSize ||
            location.distanceFromTop < 0 ||
            location.distanceFromTop >= gridSize) {
            return 'Invalid';
        }
        else if (grid[dfl][dft] === 'Player') {
            return 'Player';
        }
        else if (grid[dfl][dft] !== 'Empty') {
            return 'Blocked';
        }
        else {
            return 'Valid';
        }
    };

    /**
     * converts a list of directions to a list of Pair vectors
    */
    convertToVectors(directions){
        var vectors = [];

        for (var i = 0; i < directions.length; i++){

            switch (directions[i]) {
                case 'North':
                    vectors.push(new Pair(0, -1))
                    break;
                
                case 'East':
                    vectors.push(new Pair(1, 0));
                    break;
                
                case 'South':
                    vectors.push(new Pair(0, 1));
                    break;

                case 'West':
                    vectors.push(new Pair(-1, 0));
                    break;
            }
        }

        return vectors;
    }

    /**
     * the main function for path finding
    */
    findPlayer(source) {
        var direction = this.shortestPath(source.position);
        var vectors = this.convertToVectors(direction);

        return vectors;
    }
}