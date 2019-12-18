class Canvas {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = [];
        // this.uniquepixels = [];
        for(var j=0; j<this.height; j++) {
            var row = [];
            for(var i=0; i<this.width; i++) {
                row.push(0);
            }
            this.grid.push(row);
        }
    }

    get(x, y) {
        if (x < 0 || y <0 || x >= this.width || y >= this.height) {
            return ' ';
        }
        var c = this.grid[y][x];
        return c;
    }

    set(x, y, v) {
        if (x < 0 || y <0 || x >= this.width || y >= this.height) {
            return;
        }
        this.grid[y][x] = v;
    }

    print(displaymap) {
        const stats = {};
        for(var j=0; j<this.height; j++) {
            var row = '  ';
            this.grid[j].forEach(c => {
                if (stats[c] === undefined) {
                    stats[c] = 1;
                } else {
                    stats[c] ++;
                }
                if (displaymap) {
                    row += displaymap[c];
                } else {
                    row += c;
                }
            });
            console.log(row);
        }
        console.log('stats', stats)
        console.log();
    }

    find(what) {
        var found = [0, 0];
        for(var j=0; j<this.height; j++) {
            for(var i=0; i<this.width; i++) {
                if(this.grid[j][i] === what) {
                    found = [i, j];
                }
            }
        }
        return found;
    }
}

module.exports = {Canvas};
