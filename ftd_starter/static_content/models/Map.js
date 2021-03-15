import { Wall } from './CustomGameObjects';
import { Pair } from './utils';

export class Map {
    constructor(game, rows, cols, squaresize) {
        this.game = game;
        this.rows = rows;
        this.cols = cols;
        this.squaresize = squaresize;

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
                for (var w = 0; w < width; w++) {
                    for (var h = 0; h < height; h++) {
                        this.grid[x + w][y + h] = 'Occupied';
                    }
                }
            }
            this.grid[x][y] = 'Occupied';
        }

        // fix this
        var px = Math.floor(this.game.player.position.x / this.squaresize);
        var py = Math.floor(this.game.player.position.y / this.squaresize);
        this.grid[px][py] = 'Player';

    }

    // Pathfinding source: http://gregtrowbridge.com/a-basic-pathfinding-algorithm/

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

        var queue = [location];

        while (queue.length > 0) {
            var currentLocation = queue.shift();

            //Explore North
            var newLocation = this.exploreInDirection(currentLocation, 'North');
            if (newLocation.status === 'Player') {
                return newLocation.path;
            }
            else if (newLocation.status === 'Valid') {
                queue.push(newLocation);
            }

            //Explore East
            var newLocation = this.exploreInDirection(currentLocation, 'East');
            if (newLocation.status === 'Player') {
                return newLocation.path;
            }
            else if (newLocation.status === 'Valid') {
                queue.push(newLocation);
            }

            //Explore South
            var newLocation = this.exploreInDirection(currentLocation, 'South');
            if (newLocation.status === 'Player') {
                return newLocation.path;
            }
            else if (newLocation.status === 'Valid') {
                queue.push(newLocation);
            }

            //Explore West
            var newLocation = this.exploreInDirection(currentLocation, 'West');
            if (newLocation.status === 'Player') {
                return newLocation.path;
            }
            else if (newLocation.status === 'Valid') {
                queue.push(newLocation);
            }
        }

        return false;
    }

    /**
     * check in a particular direction
    */
    exploreInDirection(currentLocation, direction) {
        var newPath = currentLocation.path.slice();
        newPath.push(direction);

        var dfl = currentLocation.distanceFromLeft;
        var dft = currentLocation.distanceFromTop;

        if (direction === 'North') {
            dft -= 1;
        }
        else if (direction === 'East') {
            dfl += 1;
        }
        else if (direction === 'South') {
            dft += 1;
        }
        else if (direction === 'West') {
            dfl -= 1;
        }


        var newLocation = {
            distanceFromTop: dft,
            distanceFromLeft: dfl,
            path: newPath,
            status: 'Unknown'
        };

        newLocation.status = this.locationStatus(newLocation);

        if (newLocation.status === "Valid") {
            this.grid[newLocation.distanceFromLeft][newLocation.distanceFromTop] = 'Valid';
        }

        return newLocation;
    }

    /**
     * check if a particular position is Empty, Occupied or Visited
    */
    locationStatus(location) {
        var gridSize = this.grid.length;
        var dft = location.distanceFromTop;
        var dfl = location.distanceFromLeft;

        if (location.distanceFromLeft < 0 ||
            location.distanceFromLeft >= gridSize ||
            location.distanceFromTop < 0 ||
            location.distanceFromTop >= gridSize) {
            return 'Invalid';
        }
        else if (this.grid[dfl][dft] === 'Player') {
            return 'Player';
        }
        else if (this.grid[dfl][dft] !== 'Empty') {
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