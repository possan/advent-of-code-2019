var {Canvas} = require('./canvas.js');
var fs = require('fs');

const DISPLAYMAP = {
    0: ' ',
    1: '\x1b[2m#\x1b[0m',
    2: '\x1b[93mG\x1b[0m',
    3: '\x1b[96mD\x1b[0m',
    4: '\x1b[36m.\x1b[0m'
}

var canvas = new Canvas(100, 100);
var tmpcanvas = new Canvas(100, 100);
let start = [0, 0];
let current = [0, 0];
let goal = [0, 0];

const INPUT = fs.readFileSync('map.txt', 'UTF-8');
INPUT.split('\n').map(l => l.split('')).forEach((r, j) => {
    r.forEach((c, i) => {
        if (c == 'D') {
            start = [i, j];
            c = '.'
        }
        if (c == 'G') {
            goal = [i, j];
            c = '.'
        }
        if (c != '#') c = ' ';
        canvas.set(i, j, c == '#' ? 1 : 0)
    });
});

tmpcanvas.mergeFrom(canvas);;

var alltraversals = JSON.parse(fs.readFileSync('alltraversals.json', 'UTF-8'));

alltraversals = alltraversals.map(t => {
    return {
        fromid: t[1] * 1000 + t[0],
        toid: t[3] * 1000 + t[2],
        from: [t[0],t[1]],
        to: [t[2],t[3]],
    };
});

var allsources = [...new Set(alltraversals.map(a => a.fromid))].sort();

alltraversals = alltraversals.sort((a, b) => {
    return a.fromid - b.fromid;
});

var graph = allsources.map(s => {
    var at = alltraversals.filter(t => t.fromid === s);
    return {
        id: s,
        x: at[0].from[0],
        y: at[0].from[1],
        next: at.map(t => t.toid),
    };
});

console.log('\x1b[2J');

const goalid = goal[1] * 1000 + goal[0];
console.log('goal', goal, goalid);
console.log();

console.log(alltraversals);
console.log();

console.log(allsources);
console.log();

// console.log(JSON.stringify(graph, null, 2));
// console.log();

var queue = [];

function recurse(input) {
    console.log('Recurse', input.id, input.x, input.y, input.history.length);
    var node = graph.find(n => n.id === input.id);
    var stat = stats[input.id];

    if (input.id === goalid) {
        console.log('reached goal!');
        stat = {
            id: input.id,
            reachedgoal: true,
            history: [
                ...input.history
            ],
        };

        stats[input.id] = stat;

        return;
    };

    console.log('Node', node, stat);
    if (node && !stat) {
        stats[input.id] = {
            id: input.id,
            reachedgoal: false,
            history: [...input.history],
        };

        tmpcanvas.set(node.x, node.y, 4);

        node.next.forEach(n => {
            queue.push({
                id: n,
                depth: input.depth + 1,
                history: [
                    ...input.history,
                    input.id
                ],
            });
        });
    } else {
        console.log('Cant find node', input.id);
    }
}

var stats = {};

console.log('start', start);
console.log('goal', goal);
var startobj = graph.find(n => n.x === start[0] && n.y === start[1]);
console.log('startobj', startobj);
console.log();

// recurse(startobj.id)
queue.push({
    id: startobj.id,
    depth: 0,
    history: [],
});

var iter = 0;
while(queue.length > 0) {
    console.log('---------------------------------------------');
    console.log('iter', iter);
    console.log('---------------------------------------------');
    console.log();

    tmpcanvas.set(current[0], current[1], 3);
    tmpcanvas.set(goal[0], goal[1], 2);
    tmpcanvas.print(DISPLAYMAP);
    console.log();

    var tmp = queue.shift();
    if (tmp) {
        recurse(tmp);
    }
    console.log();
    iter ++;
}

console.log('paths to goal:');
Object.keys(stats).forEach(s => {
    var o = stats[s];
    if (o.reachedgoal) {
        console.log(o.id, o.history.length, JSON.stringify(o));
        console.log('Answer part 1:', o.history.length);
        console.log();
    }
});
console.log();
