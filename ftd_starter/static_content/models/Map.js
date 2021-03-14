
export class Map {
    constructor(game, rows, cols, squaresize){
        this.game = game;
        this.rows = rows * 10;
        this.cols = cols * 10;
        this.squaresize = squaresize;
        
        //initialize grid
        this.grid = null;
    }

    clearGrid(){
        this.grid = new Array(this.rows);
        for (var i = 0; i < this.cols; i++){
            this.grid[i] = new Array(this.cols).fill('Empty');
        }
    }

    updateGrid(){
        // build 2d grid that updates in real time if a block is 'Empty', 'Occupied', or 'Player'
        for (var i = 0; i < this.game.actors.length; i++){
            // fix this @todo not neccessary int
            var x = this.game.actors[i].position.x;
            var y = this.game.actors[i].position.y;
            this.grid[x][y] = 'Occupied';
        }

        // fix this
        var px = this.game.player.position.x;
        var py = this.game.player.position.y;
        this.grid[px][py] = 'Player';
    }

    shortestPath(startCoordinates){
        var distanceFromTop = startCoordinates.y;
        var distanceFromLeft = startCoordinates.x;

        var location = {
            distanceFromTop: distanceFromTop,
            distanceFromLeft: distanceFromLeft,
            path: [],
            status: 'Start'
        };

        var queue = [location];

        while (queue.length > 0){
            var currentLocation = queue.shift();

            //Explore North
            var newLocation = this.exploreInDirection(currentLocation, 'North');
            if (newLocation.status === 'Player'){
                return newLocation.path;
            }
            else if (newLocation.status === 'Valid'){
                queue.push(newLocation);
            }

            //Explore East
            var newLocation = this.exploreInDirection(currentLocation, 'East');
            if (newLocation.status === 'Player'){
                return newLocation.path;
            }
            else if (newLocation.status === 'Valid'){
                queue.push(newLocation);
            }

            //Explore South
            var newLocation = this.exploreInDirection(currentLocation, 'South');
            if (newLocation.status === 'Player'){
                return newLocation.path;
            }
            else if (newLocation.status === 'Valid'){
                queue.push(newLocation);
            }

            //Explore West
            var newLocation = this.exploreInDirection(currentLocation, 'West');
            if (newLocation.status === 'Player'){
                return newLocation.path;
            }
            else if (newLocation.status === 'Valid'){
                queue.push(newLocation);
            }
        }

        return false;
    }

    exploreInDirection(currentLocation, direction){
        var newPath = currentLocation.path.slice();
        newPath.push(direction);

        var dfl = currentLocation.distanceFromLeft;
        var dft = currentLocation.distanceFromTop;

        if (direction === 'North'){
            dft -= 1;
        }
        else if (direction === 'East'){
            dfl += 1;
        }
        else if (direction === 'South'){
            dft += 1;
        }
        else if (direction === 'West'){
            dfl -= 1;
        }


        var newLocation = {
            distanceFromTop: dft,
            distanceFromLeft: dfl,
            path: newPath,
            status: 'Unknown'
        };

        newLocation.status = this.locationStatus(newLocation);

        if (newLocation.status === "Valid"){
            this.grid[newLocation.distanceFromLeft][newLocation.distanceFromTop] = 'Valid';
        }

        return newLocation;
    }

    locationStatus(location){
        var gridSize = this.grid.length;
        var dft = location.distanceFromTop;
        var dfl = location.distanceFromLeft;

        if (location.distanceFromLeft < 0 || 
            location.distanceFromLeft >= gridSize ||
            location.distanceFromTop < 0 ||
            location.distanceFromTop >= gridSize){
                return 'Invalid';
            } 
        else if (this.grid[dfl][dft] === 'Player'){
            return 'Player';
        }
        else if (this.grid[dfl][dft] !== 'Empty'){
            return 'Blocked';
        }
        else{
            return 'Valid';
        }
    };

    findPlayer(){
        var enemy = null;
        for (var i = 0; i < this.game.actors.length; i++){
            if (this.game.actors[i].label === 'Enemy'){
                enemy = this.game.actors[i];
            }
        }

        console.log(this.shortestPath(enemy.position));
    }
}