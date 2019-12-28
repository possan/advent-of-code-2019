var {Canvas} = require('./canvas.js');

const MAP =
`............###########..........................
............#.........#..........................
............#.........#..........................
............#.........#..........................
............#.........#..........................
............#.........#..........................
............#.........#########..................
............#.................#..................
......#########...............#..................
......#.....#.#...............#..................
......#.....#.#...............#..................
......#.......#...............#..................
......#.......#...............#..................
......#.......#...............#..................
......#.......#########.......#########..........
......#...............#...............#..........
^######...........#######.............#..........
..................#...#.#.............#..........
..................#...#.#.............#..........
..................#...#.#.............#..........
..................#.#####.............###########
..................#.#.#.........................#
..................#####.........................#
....................#...........................#
....................#...........................#
....................#...........................#
....................#...........................#
....................#...........................#
..............#######...........................#
..............#.................................#
..............#...........................#######
..............#...........................#......
..............#...........................#......
..............#...........................#......
..............#...........................#......
..............#...........................#......
..............#...#####.................#####....
..............#...#...#.................#.#.#....
..............###########.............#####.#....
..................#...#.#.............#.#...#....
..................#...#########.......#.#...#....
..................#.....#.....#.......#.#...#....
..................#######.....#.......#######....
..............................#.........#........
..............................#.........#........
..............................#.........#........
..............................###########........`;




const UP = 1;
const DOWN = 2;
const LEFT = 3;
const RIGHT = 4;

const WALL = 2;
const PATH = 1;

const DIRNAMES = {
    [UP]: 'UP',
    [DOWN]: 'DOWN',
    [LEFT]: 'LEFT',
    [RIGHT]: 'RIGHT'
};

const DISPLAYMAP = {
    0: ' ',
    1: '\x1b[2m.\x1b[0m',
    2: '\x1b[2m#\x1b[0m',
    3: '\x1b[93mG\x1b[0m',
    4: '\x1b[96mD\x1b[0m',
    6: '\x1b[36m.\x1b[0m'
};

function rotate(dir, delta) {
    var dir2 = dir;

    if (delta == -1) {
        if (dir == UP) dir2 = LEFT;
        if (dir == RIGHT) dir2 = UP;
        if (dir == DOWN) dir2 = RIGHT;
        if (dir == LEFT) dir2 = DOWN;
    }

    if (delta == 1) {
        if (dir == UP) dir2 = RIGHT;
        if (dir == RIGHT) dir2 = DOWN;
        if (dir == DOWN) dir2 = LEFT;
        if (dir == LEFT) dir2 = UP;
    }

    return dir2;
}

function getnewposition(dir, x, y) {
    var nx = x;
    var ny = y;

    if (dir === LEFT) nx = x - 1;
    if (dir === RIGHT) nx = x + 1;
    if (dir === UP) ny = y - 1;
    if (dir === DOWN) ny = y + 1;

    return [nx, ny];
}

var canvas = new Canvas(200, 100);
var tmpcanvas = new Canvas(200, 100);

var px = 0;
var py = 0;
var direction = 0;

MAP.split('\n').map((l, j) => {
    l.split('').forEach((c, i) => {
        if (c == '^') {
            px = i;
            py = j;
            direction = UP;
            canvas.set(i, j, PATH);
        } else if (c == 'v') {
            px = i;
            py = j;
            direction = DOWN;
            canvas.set(i, j, PATH);
        } else if (c == '<') {
            px = i;
            py = j;
            direction = LEFT;
            canvas.set(i, j, PATH);
        } else if (c == '>') {
            px = i;
            py = j;
            direction = RIGHT;
            canvas.set(i, j, PATH);
        } else if (c == '#') {
            canvas.set(i, j, PATH);
        } else {
            canvas.set(i, j, WALL);
        }
    })
})

tmpcanvas.mergeFrom(canvas);
tmpcanvas.set(px, py, 4);
tmpcanvas.print(DISPLAYMAP);

console.log('Drone:', px, py, DIRNAMES[direction]);

var history = [];
var commands = [];
var exit = false;
var forward = 0;
while(!exit) {
    history.push([px, py]);

    // can we go forward?
    var np = getnewposition(direction, px, py);
    var v0 = canvas.get(np[0], np[1]);
    if (v0 == PATH) {
        console.log('Going forward to', np);
        forward ++;
        px = np[0];
        py = np[1];
    } else {
        console.log('Can\'t go forward');
        if (forward > 0) {
           commands.push(`${forward}`);
        }
        forward = 0;
        console.log('Command stack:', commands);
        // We can't go forward

        var leftdir = rotate(direction, -1);
        var leftpos = getnewposition(leftdir, px, py);
        var leftvalue = canvas.get(leftpos[0], leftpos[1]);

        var rightdir = rotate(direction, 1);
        var rightpos = getnewposition(rightdir, px, py);
        var rightvalue = canvas.get(rightpos[0], rightpos[1]);

        if (leftvalue == PATH) {
            console.log('Turning left', np);
            commands.push('L');
            console.log('Command stack:', commands);
            direction = leftdir;
        } else if (rightvalue == PATH) {
            console.log('Turning right', np);
            commands.push('R');
            console.log('Command stack:', commands);
            direction = rightdir;
        } else {
            console.log('Dead end.');
            exit = true;
        }
    }
}

tmpcanvas.mergeFrom(canvas);
history.forEach(h => {
    tmpcanvas.set(h[0], h[1], 6);
});
tmpcanvas.set(px, py, 4);
tmpcanvas.print(DISPLAYMAP);

console.log('Solved command queue:');
console.log(commands.join(','));
