var {Runtime} = require('./runtime.js');
var {ProgramMemory, ProgramReader} = require('./program.js');
var {Canvas} = require('./canvas.js');

const PROGRAM = '109,424,203,1,21102,1,11,0,1106,0,282,21101,0,18,0,1105,1,259,2102,1,1,221,203,1,21102,31,1,0,1106,0,282,21101,38,0,0,1106,0,259,21002,23,1,2,21202,1,1,3,21102,1,1,1,21102,57,1,0,1106,0,303,2102,1,1,222,21001,221,0,3,21002,221,1,2,21101,0,259,1,21102,1,80,0,1106,0,225,21102,1,93,2,21102,1,91,0,1106,0,303,2101,0,1,223,21001,222,0,4,21102,1,259,3,21101,225,0,2,21101,225,0,1,21101,118,0,0,1106,0,225,20101,0,222,3,21102,1,120,2,21102,1,133,0,1106,0,303,21202,1,-1,1,22001,223,1,1,21101,0,148,0,1106,0,259,2102,1,1,223,21001,221,0,4,20102,1,222,3,21102,1,23,2,1001,132,-2,224,1002,224,2,224,1001,224,3,224,1002,132,-1,132,1,224,132,224,21001,224,1,1,21102,195,1,0,106,0,108,20207,1,223,2,20101,0,23,1,21101,-1,0,3,21102,1,214,0,1106,0,303,22101,1,1,1,204,1,99,0,0,0,0,109,5,2101,0,-4,249,21201,-3,0,1,21201,-2,0,2,21202,-1,1,3,21101,0,250,0,1105,1,225,21202,1,1,-4,109,-5,2106,0,0,109,3,22107,0,-2,-1,21202,-1,2,-1,21201,-1,-1,-1,22202,-1,-2,-2,109,-3,2106,0,0,109,3,21207,-2,0,-1,1206,-1,294,104,0,99,22102,1,-2,-2,109,-3,2106,0,0,109,5,22207,-3,-4,-1,1206,-1,346,22201,-4,-3,-4,21202,-3,-1,-1,22201,-4,-1,2,21202,2,-1,-1,22201,-4,-1,1,21201,-2,0,3,21102,343,1,0,1106,0,303,1106,0,415,22207,-2,-3,-1,1206,-1,387,22201,-3,-2,-3,21202,-2,-1,-1,22201,-3,-1,3,21202,3,-1,-1,22201,-3,-1,2,21201,-4,0,1,21101,0,384,0,1106,0,303,1105,1,415,21202,-4,-1,-4,22201,-4,-3,-4,22202,-3,-2,-2,22202,-2,-4,-4,22202,-3,-2,-3,21202,-4,-1,-2,22201,-3,-2,1,21202,1,1,-4,109,-5,2106,0,0';


var memory = new ProgramMemory(PROGRAM, 'Game');
var reader = new ProgramReader(memory);
var runtime = new Runtime(reader, 'Game');
var canvas = new Canvas(160, 70);


function reset() {
    memory.reload(PROGRAM);
    runtime.restart();
}


function runUntilBlocked() {
    do {
        runtime.step();
    } while (!runtime.blocking && !runtime.halted);
}

// reset();


const DISPLAYMAP = {
    0: '\x1b[2m.\x1b[0m',
    1: '\x1b[96m#\x1b[0m',
};

function testPoint(x, y) {
    reset();
    runtime.addInput(x);
    runtime.addInput(y);
    runUntilBlocked();
    // console.log(runtime.programoutput);
    // canvas.set(i, j, runtime.programoutput[0]);
    // str += DISPLAYMAP[runtime.programoutput[0]];
    return runtime.programoutput[0];
}

reset();

var leastx = 100000;
var leasty = 100000;
var exit = false;

for(var j=100; j<500 && !exit; j++) {
    // var str = '';
    console.log('Scanning', j);
    for(var i=20; i<500 && !exit; i++) {
        var x = i * 3 + j * 1;
        var y = j * 3;

        var v0 = testPoint(x, y);
        if (v0) {
            var v1 = testPoint(x + 99, y);
            var v2 = testPoint(x, y + 99);
            var v3 = testPoint(x + 99, y + 99);

            console.log('v', v0, v1, v2, v3);

            if (v1 && v2 && v3) {
                console.log('corners fits at:', x, y);

                for(var j2=-100; j2<100; j2++) {
                    for(var i2=-100; i2<100; i2++) {
                        var x2 = x - i2;
                        var y2 = y - j2;
                        v0 = testPoint(x2, y2);
                        v1 = testPoint(x2 + 99, y2);
                        v2 = testPoint(x2, y2 + 99);
                        v3 = testPoint(x2 + 99, y2 + 99);
                        if (v0 && v1 && v2 && v3) {
                            console.log('fits in:', x2, y2, 'closest', leastx, leasty);
                            if (x2 < leastx) leastx = x2;
                            if (y2 < leasty) leasty = y2;
                        }
                    }
                }

                exit = true;
            }
        }
        // reset();
        // runtime.addInput(i);
        // runtime.addInput(j);
        // runUntilBlocked();
        // console.log(runtime.programoutput);
        // canvas.set(i, j, runtime.programoutput[0]);
        // str += DISPLAYMAP[runtime.programoutput[0]];
    }
    // console.log(str);
}

// canvas.print(DISPLAYMAP);
// console.log('Part 1', canvas.stats);
console.log('least x', leastx);
console.log('least y', leasty);
console.log('least', leastx * 10000 + leasty);
console.log();

