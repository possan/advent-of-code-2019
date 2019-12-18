var {assert, parselist, parsegrid} = require('./utils.js');

class Grid {
    constructor(input) {
        this.width = 1;
        this.height = 1;
        this.grid = [['.']];
        if (input) {
            this._parse(input);
        }
    }

    _parse(input) {
        this.grid = parsegrid(input);
        this.width = this.grid[0].length;
        this.height = this.grid.length;
        this.results = [];
        for(var j=0; j<this.height; j++) {
            var row = [];
            for(var i=0; i<this.width; i++) {
                row.push(0);
            }
            this.results.push(row);
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
        this.grid[y][x] = v;
    }

    report(x, y, value) {
        this.results[y][x] = value;
    }
}

//
// .........
// .........
// .........
// .........
// ....A....
// .........
// .........
// .........
// .........
//

// 5,3 => undefined
// 6,2 => 3,1,
// 9,3 => 3,1 6,2,
// 10,3 => 3 undefined
// 6,0 => 5,0, 4,0, 3,0, 2,0, 1,0

function notFraction(v) {
    return ~~v === v;
}

function findStepsInbetween(dx, dy) {
    var adx = Math.abs(dx);
    var ady = Math.abs(dy);
    var ret = [];
    var len = Math.max(adx, ady);
    for(var i=len-1; i>0; i--) {
        var tx = dx * i / len;
        var ty = dy * i / len;
        if (notFraction(tx) && notFraction(ty)) {
            ret.push([tx, ty]);
        }
    }
    ret = ret.reverse();
    return (ret.length > 0) ? ret : undefined;
}

assert('findStepsInbetween 1', findStepsInbetween(6,1), undefined);
assert('findStepsInbetween 2', findStepsInbetween(6,0).join(','), '1,0,2,0,3,0,4,0,5,0');
assert('findStepsInbetween 3', findStepsInbetween(0,-5).join(','), '0,-1,0,-2,0,-3,0,-4');
assert('findStepsInbetween 4', findStepsInbetween(6,3).join(','), '2,1,4,2');
assert('findStepsInbetween 5', findStepsInbetween(8,4).join(','), '2,1,4,2,6,3');
assert('findStepsInbetween 6', findStepsInbetween(-6,3).join(','), '-2,1,-4,2');
assert('findStepsInbetween 7', findStepsInbetween(-8,4).join(','), '-2,1,-4,2,-6,3');
assert('findStepsInbetween 8', findStepsInbetween(6,2).join(','), '3,1');
assert('findStepsInbetween 9', findStepsInbetween(6,-2).join(','), '3,-1');
assert('findStepsInbetween 10', findStepsInbetween(9,1), undefined);
assert('findStepsInbetween 11', findStepsInbetween(5,5).join(','), '1,1,2,2,3,3,4,4');
assert('findStepsInbetween 12', findStepsInbetween(0,1), undefined);

function hasCleanLineOfSight(grid, x1, y1, x2, y2) {
    // console.log('hasCleanLineOfSight', x1, y1, x2, y2);
    var dx = x2 - x1;
    var dy = y2 - y1;

    var inbetween = findStepsInbetween(dx, dy);
    if (!inbetween) {
        // console.log('no steps inbetween, clean line.', dx, dy);
        // no steps inbetween us and the asteroid, it must be a clean sight.
        return true;
    }

    // console.log('inbetween list', inbetween);
    for(var i=0; i<inbetween.length; i++) {
        var x = inbetween[i][0] + x1;
        var y = inbetween[i][1] + y1;
        var st = grid.get(x, y);
        // console.log('inbetween step', i, x, y, st);
        if (st == '#') {
            return false;
        }
    }

    return true;
}

function firstObstacle(grid, x1, y1, x2, y2) {
    // console.log('hasCleanLineOfSight', x1, y1, x2, y2);
    var dx = x2 - x1;
    var dy = y2 - y1;

    var inbetween = findStepsInbetween(dx, dy);
    if (!inbetween) {
        // console.log('no steps inbetween, clean line.', dx, dy);
        // no steps inbetween us and the asteroid, it must be a clean sight.
        return undefined;
    }

    // console.log('inbetween list', inbetween);
    for(var i=0; i<inbetween.length; i++) {
        var x = inbetween[i][0] + x1;
        var y = inbetween[i][1] + y1;
        var st = grid.get(x, y);
        // console.log('inbetween step', i, x, y, st);
        if (st == '#') {
            return [x, y];
        }
    }

    return undefined;
}

function scanFromPosition(grid, x, y) {
    console.log('scanFromPosition', x, y);

    var tot = 0;

    for(var j=0; j<grid.height; j++) {
        for(var i=0; i<grid.width; i++) {
            if (i != x || j != y) {
                var c = grid.get(i, j);
                if (c == '#') {
                    var l = hasCleanLineOfSight(grid, x, y, i, j);
                    if (l) {
                        console.log('clean line of sight to', i, j);
                        tot += 1;

                    } else {
                        console.log('no line of sight to', i, j);
                    }
                }
            }
        }
    }

    return tot;
}

function scanFromPosition2(grid, x, y) {
    console.log('scanFromPosition', x, y);

    var ret = [];

    for(var j=0; j<grid.height; j++) {
        for(var i=0; i<grid.width; i++) {
            if (i != x || j != y) {
                var c = grid.get(i, j);
                if (c == '#') {
                    var obst = firstObstacle(grid, x, y, i, j);
                    if (obst) {
                        ret.push(obst);
                    } else {
                        ret.push([i, j]);
                    }
                }
            }
        }
    }

    return ret;
}

function run(input) {
    var grid = new Grid(input);
    console.log('grid', grid.grid);

    var maxposition = 0;
    var maxtot = 0;
    for(var j=0; j<grid.height; j++) {
        for(var i=0; i<grid.width; i++) {
            var c = grid.get(i, j);
            if (c == '#') {
                var tot = scanFromPosition(grid, i, j);
                if (tot > maxtot) {
                    maxposition = [i, j];
                    maxtot = tot;
                }
                grid.report(i, j, tot);
            }
        }
    }

    console.log(grid.results);
    return [maxposition[0], maxposition[1], maxtot];
}



function assertrun(name, input, expected) {
    var actual = run(input).join(',');
    console.log('run result', actual);
    assert(name, actual, expected);
}


// assertrun(
//     'first example',
//         `.#..#
//         .....
//         #####
//         ....#
//         ...##`,
//     '3,4,8'
// );

// assertrun(
//     'first example',
//         `....#
//         .....
//         #.#..
//         ..#..
//         .....`,
//     '3,4,8'
// );


// assertrun(
//     'example 2',
//         `......#.#.
//         #..#.#....
//         ..#######.
//         .#.#.###..
//         .#..#.....
//         ..#....#.#
//         #..#....#.
//         .##.#..###
//         ##...#..#.
//         .#....####`,
//     '5,8,33'
// );

// assertrun(
//     'example 3',
//         `#.#...#.#.
//         .###....#.
//         .#....#...
//         ##.#.#.#.#
//         ....#.#.#.
//         .##..###.#
//         ..#...##..
//         ..##....##
//         ......#...
//         .####.###.`,
//     '1,2,35'
// );

// assertrun(
//     'example 3',
//         `.#..#..###
//         ####.###.#
//         ....###.#.
//         ..###.##.#
//         ##.##.#.#.
//         ....###..#
//         ..#.#..#.#
//         #..#.#.###
//         .##...##.#
//         .....#.#..`,
//     '6,3,41'
// );

// assertrun(
//     'bigger example',
//         `.#..##.###...#######
//         ##.############..##.
//         .#.######.########.#
//         .###.#######.####.#.
//         #####.##.#.##.###.##
//         ..#####..#.#########
//         ####################
//         #.####....###.#.#.##
//         ##.#################
//         #####.##.###..####..
//         ..######..##.#######
//         ####.##.####...##..#
//         .#####..#.######.###
//         ##...#.##########...
//         #.##########.#######
//         .####.#.###.###.#.##
//         ....##.##.###..#####
//         .#.#.###########.###
//         #.#.#.#####.####.###
//         ###.##.####.##.#..##`,
//     '11,13,210'
// );

// assertrun(
//     'Test 1',
//         `.###.#...#.#.##.#.####..
//         .#....#####...#.######..
//         #.#.###.###.#.....#.####
//         ##.###..##..####.#.####.
//         ###########.#######.##.#
//         ##########.#########.##.
//         .#.##.########.##...###.
//         ###.#.##.#####.#.###.###
//         ##.#####.##..###.#.##.#.
//         .#.#.#####.####.#..#####
//         .###.#####.#..#..##.#.##
//         ########.##.#...########
//         .####..##..#.###.###.#.#
//         ....######.##.#.######.#
//         ###.####.######.#....###
//         ############.#.#.##.####
//         ##...##..####.####.#..##
//         .###.#########.###..#.##
//         #.##.#.#...##...#####..#
//         ##.#..###############.##
//         ##.###.#####.##.######..
//         ##.#####.#.#.##..#######
//         ...#######.######...####
//         #....#.#.#.####.#.#.#.##`,
//     '20,18,280'
// );





function printgrid(grid) {
    console.log('grid:');
    for(var j=0; j<grid.height; j++) {
        console.log('  ' + grid.grid[j].join(''));
    }
    console.log();
}

function run2(input, origin) {
    var grid = new Grid(input);
    origin = parselist(origin);
    // console.log('grid', grid.grid);
    console.log('origin', origin);
    printgrid(grid);

    var shotindex = 0;

    for(var rev=0; rev<15; rev++) {
        console.log('revolution', rev);


        var order = scanFromPosition2(grid, origin[0], origin[1]);

        order = order.map(p => {
            var x = p[0];
            var y = p[1];
            var dx = x - origin[0];
            var dy = y - origin[1];
            var a = ((Math.atan2(dy, dx) * 180.0 / Math.PI) + 90 + 360) % 360;
            var d = Math.sqrt(dx * dx + dy * dy);
            var id = y * 1000000 + x;
            return {
                x,
                y,
                a,
                id,
                dx,
                dy,
                d,
            }
        });

        // console.log('order with meta', order);

        order = order.sort((a, b) => {
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            return 0;
        });

        var previousids = [];

        var deduped = [];

        order.forEach(o => {
            if (previousids.indexOf(o.id) === -1) {
                previousids.push(o.id);
                deduped.push(o);
            }
        });

        // console.log('order, without duplicates', deduped);

        deduped = deduped.sort((a, b) => {
            if (a.a < b.a) return -1;
            if (a.a > b.a) return 1;
            return 0;
        });

        console.log('firing order, one 360 round:');

        deduped.forEach(o => {
            shotindex ++;
            console.log(`Shot ${shotindex} at ${o.x}, ${o.y} // ${JSON.stringify(o)}`);
            grid.set(o.x, o.y, '.'); // remove asteroid.
            grid.report(o.x, o.y, shotindex);
        });

        printgrid(grid);
    }

    // var maxposition = 0;
    // var maxtot = 0;
    // for(var j=0; j<grid.height; j++) {
    //     for(var i=0; i<grid.width; i++) {
    //         var c = grid.get(i, j);
    //         if (c == '#') {
    //             var tot = scanFromPosition(grid, i, j);
    //             if (tot > maxtot) {
    //                 maxposition = [i, j];
    //                 maxtot = tot;
    //             }
    //             grid.report(i, j, tot);
    //         }
    //     }
    // }


    // console.log(grid.results);
    // return [maxposition[0], maxposition[1], maxtot];
}

// run2(
//     `.###.#...#.#.##.#.####..
//     .#....#####...#.######..
//     #.#.###.###.#.....#.####
//     ##.###..##..####.#.####.
//     ###########.#######.##.#
//     ##########.#########.##.
//     .#.##.########.##...###.
//     ###.#.##.#####.#.###.###
//     ##.#####.##..###.#.##.#.
//     .#.#.#####.####.#..#####
//     .###.#####.#..#..##.#.##
//     ########.##.#...########
//     .####..##..#.###.###.#.#
//     ....######.##.#.######.#
//     ###.####.######.#....###
//     ############.#.#.##.####
//     ##...##..####.####.#..##
//     .###.#########.###..#.##
//     #.##.#.#...##...#####..#
//     ##.#..###############.##
//     ##.###.#####.##.######..
//     ##.#####.#.#.##..#######
//     ...#######.######...####
//     #....#.#.#.####.#.#.#.##`,
// );

// run2(
//     `.#....#####...#..
//     ##...##.#####..##
//     ##...#...#.#####.
//     ..#.....#...###..
//     ..#.#.....#....##`,
//     '8,3'
// );

// run2(
//     `...#..#
//     ...#...
//     .......
//     ...#.##
//     .#...#.`,
//     '3,3'
// );


// run2(
//     `...#...
//     ...#...
//     #......
//     ...#.##
//     ...#...`,
//     '3,3'
// );


// run2(
//     `.#..##.###...#######
//     ##.############..##.
//     .#.######.########.#
//     .###.#######.####.#.
//     #####.##.#.##.###.##
//     ..#####..#.#########
//     ####################
//     #.####....###.#.#.##
//     ##.#################
//     #####.##.###..####..
//     ..######..##.#######
//     ####.##.####...##..#
//     .#####..#.######.###
//     ##...#.##########...
//     #.##########.#######
//     .####.#.###.###.#.##
//     ....##.##.###..#####
//     .#.#.###########.###
//     #.#.#.#####.####.###
//     ###.##.####.##.#..##`,
//     '11,13');

run2(
        `.###.#...#.#.##.#.####..
        .#....#####...#.######..
        #.#.###.###.#.....#.####
        ##.###..##..####.#.####.
        ###########.#######.##.#
        ##########.#########.##.
        .#.##.########.##...###.
        ###.#.##.#####.#.###.###
        ##.#####.##..###.#.##.#.
        .#.#.#####.####.#..#####
        .###.#####.#..#..##.#.##
        ########.##.#...########
        .####..##..#.###.###.#.#
        ....######.##.#.######.#
        ###.####.######.#....###
        ############.#.#.##.####
        ##...##..####.####.#..##
        .###.#########.###..#.##
        #.##.#.#...##...#####..#
        ##.#..###############.##
        ##.###.#####.##.######..
        ##.#####.#.#.##..#######
        ...#######.######...####
        #....#.#.#.####.#.#.#.##`,
    '20,18'
);


//  Shot 200: {"id":11000012,"x":12,"y":11,"dx":-8,"dy":-9,"d":12.041594578792296,"a":318.3664606634298}
// 200 => 12*100+11 1211
