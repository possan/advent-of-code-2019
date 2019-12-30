class Canvas {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.stats = {};
        this.grid = [];
        for(var j=0; j<this.height; j++) {
            var row = [];
            for(var i=0; i<this.width; i++) {
                row.push(0);
            }
            this.grid.push(row);
        }
    }

    clear(v = 0) {
        for(var j=0; j<this.height; j++) {
            for(var i=0; i<this.width; i++) {
                this.grid[j][i] = v;
            }
        }
    }

    mergeFrom(other) {
        for(var j=0; j<this.height; j++) {
            for(var i=0; i<this.width; i++) {
                var v = other.grid[j][i];
                if (v) {
                    this.grid[j][i] = v;
                }
            }
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
        var br = 0;
        var bl = this.width;
        var bt = this.height;
        var bb = 0;

        this.stats = {};

        for(var j=0; j<this.height; j++) {
            for(var i=0; i<this.width; i++) {
                var c = this.grid[j][i];
                if (c) {
                    if (i < bl) bl = i;
                    if (i > br) br = i;
                    if (j < bt) bt = j;
                    if (j > bb) bb = j;
                }
            }
        }

        if (br > bl && bb > bt) {
            for(var j=bt; j<=bb; j++) {
                var row = '';
                for(var i=bl; i<=br; i++) {
                    var c = this.grid[j][i];

                    this.stats[c] = (this.stats[c] || 0) + 1;

                    if (displaymap) {
                        row += displaymap[c];
                    } else {
                        row += c;
                    }
                }
                row += '             ';
                console.log(row);
            }
            console.log();
        }

        this.origin = [bl, bt];
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
