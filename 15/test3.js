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

const INPUT = fs.readFileSync('map.txt', 'UTF-8');
INPUT.split('\n').map(l => l.split('')).forEach((r, j) => {
    r.forEach((c, i) => {
        if (c == 'D') {
            // start = [i, j];
            c = '.'
        }
        if (c == 'G') {
            start = [i, j];
            c = '.'
        }
        if (c != '#') c = ' ';
        canvas.set(i, j, c == '#' ? 1 : 0)
    });
});

tmpcanvas.mergeFrom(canvas);

var alltraversals = JSON.parse(fs.readFileSync('alltraversals.json', 'UTF-8'));
var alllocations = {};

alltraversals = alltraversals.map(t => {
    var id1 = t[1] * 1000 + t[0];
    var id2 = t[3] * 1000 + t[2];
    alllocations[id1] = { x: t[0], y: t[1] };
    alllocations[id2] = { x: t[2], y: t[3] };
    return {
        fromid: id1,
        toid: id2,
    };
}).sort((a, b) => {
    return a.toid - b.toid;
}).sort((a, b) => {
    return a.fromid - b.fromid;
});

console.log('alltraversals:');
alltraversals.forEach(t => {
    console.log('  ', t);
});
console.log();

// var allsources = [
//     ...new Set([
//         ...alltraversals.map(a => a.fromid),
//         ...alltraversals.map(a => a.toid)
//     ])
// ].sort();

// alltraversals = alltraversals.sort((a, b) => {
//     return a.toid - b.toid;
// });

// var graph = allsources.map(s => {
//     var at = alltraversals.filter(a => a.toid === s);
//     return {
//         id: s,
//         next: at.map(a => a.fromid),
//     };
// }).sort((a, b) => {
//     return a.id - b.id;
// });

// var graph2 = allsources.map(s => {
//     var at = alltraversals.filter(a => a.fromid === s);
//     return {
//         id: s,
//         next: at.map(a => a.toid),
//     };
// }).sort((a, b) => {
//     return a.id - b.id;
// });

// console.log('\x1b[2J');
// console.log('graph', JSON.stringify(graph, null, 2));
// console.log('graph2', JSON.stringify(graph2, null, 2));
// console.log();
// graph.forEach(n => {
//     console.log(n);
// })
// console.log();

const startid = start[1] * 1000 + start[0];
console.log('start', start, startid);
console.log();
// console.log(alltraversals);
// console.log();

var queue = [];

function recurse(input) {
    console.log('Recurse', input.id, input.x, input.y, input.history.length);
    // var node = graph.find(n => n.id === input.id);
    var loc = alllocations[input.id]
    var next = alltraversals.filter(t => t.toid == input.id).map(t => t.fromid);
    var next2 = alltraversals.filter(t => t.fromid == input.id).map(t => t.toid);
    var stat = stats[input.id];
    console.log('Next', next, next2, stat, loc);

    if (loc) {
        tmpcanvas.set(loc.x, loc.y, 4);
    }

    if (!stat) {
        stats[input.id] = {
            id: input.id,
            history: [...input.history],
        };

        if (next) {
            next.forEach(n => {
                queue.push({
                    id: n,
                    depth: input.depth + 1,
                    history: [...input.history, input.id],
                });
            });
        }
        if (next2) {
            next2.forEach(n => {
                queue.push({
                    id: n,
                    depth: input.depth + 1,
                    history: [...input.history, input.id],
                });
            });
        }
    }
}

var stats = {};

// console.log('start', start);
// console.log('goal', goal);
// var startobj = graph.find(n => n.x === start[0] && n.y === start[1]);
// console.log('startobj', startobj);
// console.log();

// recurse(startobj.id)
queue.push({
    id: startid,
    depth: 0,
    history: [],
});

var iter = 0;
while(queue.length > 0) {
    console.log('---------------------------------------------');
    console.log('iter', iter, queue.length);
    console.log('---------------------------------------------');
    console.log();

    var tmp = queue.shift();
    if (tmp) {
        recurse(tmp);
    }
    console.log('Queue size:', queue.length);
    console.log();

    tmpcanvas.set(start[0], start[1], 2);
    tmpcanvas.print(DISPLAYMAP);
    console.log();

    iter ++;
}

// console.log('stats:');
// console.log(JSON.stringify(stats, null, 2));
// console.log();

var longestpath = 0;
Object.keys(stats).forEach(s => {
    var o = stats[s];
    if (o.history.length > longestpath) {
        longestpath = o.history.length;
        console.log('Found a long path:', o.history.length);
    }
        // console.log(o.id, o.history.length, JSON.stringify(o));
        // console.log('Answer:', o.history.length);
        // console.log();
});
console.log();
