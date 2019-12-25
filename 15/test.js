var {Runtime} = require('./runtime.js');
var {Program, ProgramMemory, ProgramReader, Disassembler} = require('./program.js');
var {assert, parselist} = require('./utils.js');
var {Canvas} = require('./canvas.js');
var fs = require('fs');

const GAME = '3,1033,1008,1033,1,1032,1005,1032,31,1008,1033,2,1032,1005,1032,58,1008,1033,3,1032,1005,1032,81,1008,1033,4,1032,1005,1032,104,99,102,1,1034,1039,1002,1036,1,1041,1001,1035,-1,1040,1008,1038,0,1043,102,-1,1043,1032,1,1037,1032,1042,1105,1,124,102,1,1034,1039,101,0,1036,1041,1001,1035,1,1040,1008,1038,0,1043,1,1037,1038,1042,1105,1,124,1001,1034,-1,1039,1008,1036,0,1041,101,0,1035,1040,1001,1038,0,1043,101,0,1037,1042,1105,1,124,1001,1034,1,1039,1008,1036,0,1041,101,0,1035,1040,101,0,1038,1043,101,0,1037,1042,1006,1039,217,1006,1040,217,1008,1039,40,1032,1005,1032,217,1008,1040,40,1032,1005,1032,217,1008,1039,5,1032,1006,1032,165,1008,1040,9,1032,1006,1032,165,1102,1,2,1044,1105,1,224,2,1041,1043,1032,1006,1032,179,1102,1,1,1044,1105,1,224,1,1041,1043,1032,1006,1032,217,1,1042,1043,1032,1001,1032,-1,1032,1002,1032,39,1032,1,1032,1039,1032,101,-1,1032,1032,101,252,1032,211,1007,0,73,1044,1106,0,224,1101,0,0,1044,1106,0,224,1006,1044,247,101,0,1039,1034,1002,1040,1,1035,1002,1041,1,1036,1002,1043,1,1038,101,0,1042,1037,4,1044,1105,1,0,43,57,94,36,95,30,10,40,88,72,99,97,53,21,87,48,77,40,75,69,46,98,78,22,21,38,17,12,96,34,94,81,18,49,92,1,26,67,48,15,80,51,60,92,9,77,89,64,15,85,53,94,84,99,70,7,8,69,79,79,41,62,98,22,94,92,69,97,65,96,47,99,71,4,75,10,89,85,13,89,93,93,33,46,80,61,80,75,47,99,54,63,54,57,99,80,97,77,48,33,97,95,92,20,75,3,90,84,1,50,15,94,80,95,93,70,22,3,74,69,27,99,91,66,99,1,67,12,94,31,78,83,51,97,25,4,92,85,3,96,60,5,98,69,23,95,70,92,99,1,5,84,51,87,60,67,56,98,44,80,71,81,59,58,97,82,48,87,4,76,87,45,23,75,62,89,29,37,83,22,89,81,48,64,92,30,13,90,89,83,50,49,14,89,2,34,39,84,88,21,1,81,41,74,95,89,37,82,30,87,11,93,78,67,99,8,95,84,26,93,9,95,7,18,93,94,55,96,50,92,97,43,88,53,22,91,91,35,5,79,34,66,56,24,95,49,86,72,98,52,19,81,10,90,78,12,76,8,37,87,62,80,98,52,19,40,97,83,70,18,94,77,62,87,13,35,90,35,78,68,84,89,77,13,71,19,81,54,96,88,22,40,99,24,62,85,37,95,97,89,64,30,18,98,95,9,27,76,85,49,99,31,55,71,89,95,86,94,69,24,98,32,84,99,72,82,89,61,75,30,90,74,10,71,14,80,55,68,61,99,54,84,49,17,74,83,79,38,25,90,38,99,36,89,14,38,80,71,92,10,4,65,35,78,95,40,36,78,13,39,83,76,82,64,16,96,95,31,75,95,79,2,89,38,36,87,36,76,81,38,42,92,38,7,83,87,83,87,54,96,99,78,50,43,94,96,41,87,77,8,90,78,72,79,49,82,82,56,13,94,34,90,44,82,22,60,96,48,97,2,88,87,47,92,40,91,4,58,93,29,61,83,98,99,7,8,91,30,15,88,20,90,79,10,93,31,41,95,94,56,94,95,70,93,50,94,40,37,42,84,45,35,59,27,75,80,52,90,93,15,21,92,18,52,96,83,1,90,86,12,79,21,38,98,13,74,99,40,85,41,60,94,54,44,98,83,35,57,76,66,94,94,59,82,62,77,76,22,87,39,95,98,5,90,60,88,46,91,23,58,16,83,79,7,99,11,53,76,12,88,96,88,35,58,63,81,12,26,79,89,79,26,28,23,5,90,1,76,85,55,74,44,42,88,78,36,83,61,86,92,37,62,82,80,60,46,78,32,76,20,56,77,81,9,40,45,81,85,46,7,65,96,90,19,83,16,78,66,25,24,87,80,55,93,71,84,21,86,38,79,80,94,11,42,81,89,56,18,81,33,86,72,48,86,90,59,10,92,35,77,39,94,58,97,36,5,90,96,87,40,21,22,74,80,42,32,59,60,96,25,26,95,54,90,54,15,18,98,61,91,58,84,2,19,83,36,87,60,99,63,34,79,84,92,25,74,62,6,76,84,33,80,54,91,84,3,83,95,34,22,92,88,6,88,93,17,87,59,95,17,98,65,24,20,90,95,31,74,93,30,66,80,79,72,98,7,74,34,87,77,3,24,4,82,93,42,53,90,47,82,65,65,16,75,91,79,20,93,77,54,71,81,47,82,18,78,94,92,63,75,36,87,34,87,31,92,29,98,22,80,95,91,17,97,35,79,87,87,61,93,93,99,63,95,36,90,78,77,61,83,0,0,21,21,1,10,1,0,0,0,0,0,0';

var memory = new ProgramMemory(GAME, 'Game');
var reader = new ProgramReader(memory);
var runtime = new Runtime(reader, 'Game');
var canvas = new Canvas(160, 70);
var tempcanvas = new Canvas(160, 70);
var x = 80;
var y = 35;
var nx = x;
var ny = y;
var lastdir = 2;
var history = [];
var goal = null;
var shortest_length = 99999;
var exit = false;
var iter = 0;
var forward = true;
var alltraversals = [];


const UP = 1;
const DOWN = 2;
const LEFT = 3;
const RIGHT = 4;

const DISPLAYMAP = {
    0: ' ',
    1: '\x1b[2m.\x1b[0m',
    2: '\x1b[2m#\x1b[0m',
    3: '\x1b[93mG\x1b[0m',
    4: '\x1b[96mD\x1b[0m',
    6: '\x1b[36m.\x1b[0m'
};

const DIRNAMES = {
    [UP]: 'UP',
    [DOWN]: 'DOWN',
    [LEFT]: 'LEFT',
    [RIGHT]: 'RIGHT'
};

function reset() {
    memory.reload(GAME);
    runtime.restart();
}

reset();

runtime.onOutput = function(output) {
    // console.log('Got output', output);
    laststatus = output;

    if (output == 0) {
        // console.log(`Wall at ${nx},${ny}`);
        // canvas.set(x, y, '4');
        canvas.set(nx, ny, '2');
    } else if (output == 1) {
        // console.log(`Floor at ${nx},${ny}`);
        // canvas.set(x, y, '1');
        canvas.set(nx, ny, '1');
        if (forward) {
            alltraversals.push([x,y,nx,ny]);
            var newhistoryitem = [nx, ny, lastdir, iter];
            // console.log('New history log', newhistoryitem);
            history.push(newhistoryitem);
            // console.log('New history depth', history.length);
            // console.log(`History:`, history);
        }
        x = nx;
        y = ny;
    } else if (output == 2) {
        // console.log(`Goal at ${nx},${ny}`);
        canvas.set(nx, ny, '1');
        // canvas.set(nx, ny, '3');
        if (forward) {
            alltraversals.push([x,y,nx,ny]);
            var newhistoryitem = [nx, ny, lastdir, iter];
            // console.log('New history log', newhistoryitem);
            history.push(newhistoryitem);
            // console.log('New history depth', history.length);
            // console.log(`History:`, history);
        }
        x = nx;
        y = ny;
        goal = [nx, ny];
    }
}

function runUntilBlocked() {
    do {
        runtime.step();
    } while (!runtime.blocking && !runtime.halted);
}

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

function getnewposition(dir) {
    var nx = x;
    var ny = y;

    if (dir === LEFT) nx = x - 1;
    if (dir === RIGHT) nx = x + 1;
    if (dir === UP) ny = y - 1;
    if (dir === DOWN) ny = y + 1;

    return [nx, ny];
}

function getback(dir) {
    if (dir === LEFT) return RIGHT;
    if (dir === RIGHT) return LEFT;
    if (dir === UP) return DOWN;
    return UP;
}

x = 80;
y = 35;
nx = x;
ny = y;
lx = 0;
ly = 0;
lastdir = 1 + (att % 4);
laststatus = 0;
start = [x, y];
reset();


console.log('\x1b[2J');

for(var att=0; att<10000 && !exit; att++) {
    console.log('\x1b[H');

    var v0 = canvas.get(x, y-1);
    var v1 = canvas.get(x+1, y);
    var v2 = canvas.get(x, y+1);
    var v3 = canvas.get(x-1, y);
    // console.log('around me', v0, v1, v2, v3);

    if (v0 == 0) {
        // console.log('Try up (looks unexplored)                                      ');
        lastdir = UP;
        forward = true;
    } else if (v1 == 0) {
        // console.log('Try right (looks unexplored)                                      ');
        lastdir = RIGHT;
        forward = true;
    } else if (v2 == 0) {
        // console.log('Try down (looks unexplored)                                      ');
        lastdir = DOWN;
        forward = true;
    } else if (v3 == 0) {
        // console.log('Try left (looks unexplored)                                      ');
        lastdir = LEFT;
        forward = true;
    } else {
        // console.log('\x1b[1mBacktrack\x1b[0m                                      ');
        // all explored already, back up.
        forward = false;
    }

    if (forward) {
        [nx, ny] = getnewposition(lastdir);
        // console.log('Trying to move to', nx, ny);
        // store last position
        runtime.addInput(lastdir);
        // path.push(lastdir);
    } else {
        // console.log('History depth', history.length);
        var last = history.pop();
        if (last) {
            // console.log('Trying to move back from', last);
            // console.log(`Last successful history position: ${last[0]},${last[1]}`)
            var backdir = getback(last[2]);
            lastdir = backdir;
            [nx, ny] = getnewposition(lastdir);
            // console.log(`Back up to position: ${nx},${ny}`)
            runtime.addInput(lastdir);
        } else {
            // console.log('Nothing to back up to. Are we done?');
            exit = true;
        }
    }

    runUntilBlocked();

    tempcanvas.clear(0);
    tempcanvas.mergeFrom(canvas);
    history.forEach(h => {
        tempcanvas.set(h[0], h[1], '6');
    });
    if (goal) {
        tempcanvas.set(goal[0], goal[1], '3');
    }
    tempcanvas.set(x, y, '4');
    tempcanvas.print(DISPLAYMAP);

    console.log('alltraversals', alltraversals.length);
    var statlist = [];
    var ids = new Set();
    alltraversals.forEach(o => {
        var id1 = o[1] * 1000 + o[0];
        var id2 = o[3] * 1000 + o[2];
        ids.add(id1);
        ids.add(id2);
        statlist.push([id1, id2]);
    });

    var stats = {};
    [...ids].forEach(id => {
        stats[id] = [...new Set([
            ...statlist.filter(o => o[0] === id).map(o => o[1]),
            ...statlist.filter(o => o[1] === id).map(o => o[0]),
        ])];
    });
}

console.log();
console.log();
console.log();
console.log();
console.log();
console.log();
console.log();
console.log();
console.log();

alltraversals = alltraversals.map(o => ([
    o[0] - tempcanvas.origin[0],
    o[1] - tempcanvas.origin[1],
    o[2] - tempcanvas.origin[0],
    o[3] - tempcanvas.origin[1]
]));

console.log(JSON.stringify(alltraversals))
fs.writeFileSync('alltraversals.json', JSON.stringify(alltraversals));
console.log();

console.log();
console.log();
