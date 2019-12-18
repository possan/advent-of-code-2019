var {Runtime} = require('./runtime.js');
var {Program, ProgramMemory, ProgramReader, Disassembler} = require('./program.js');
var {assert, parselist} = require('./utils.js');


const PAINTER = '3,8,1005,8,310,1106,0,11,0,0,0,104,1,104,0,3,8,102,-1,8,10,1001,10,1,10,4,10,108,1,8,10,4,10,1002,8,1,28,1,105,11,10,3,8,102,-1,8,10,1001,10,1,10,4,10,1008,8,0,10,4,10,102,1,8,55,3,8,102,-1,8,10,1001,10,1,10,4,10,108,0,8,10,4,10,1001,8,0,76,3,8,1002,8,-1,10,101,1,10,10,4,10,108,0,8,10,4,10,102,1,8,98,1,1004,7,10,1006,0,60,3,8,102,-1,8,10,1001,10,1,10,4,10,108,0,8,10,4,10,1002,8,1,127,2,1102,4,10,1,1108,7,10,2,1102,4,10,2,101,18,10,3,8,1002,8,-1,10,1001,10,1,10,4,10,1008,8,0,10,4,10,102,1,8,166,1006,0,28,3,8,1002,8,-1,10,101,1,10,10,4,10,108,1,8,10,4,10,101,0,8,190,1006,0,91,1,1108,5,10,3,8,1002,8,-1,10,101,1,10,10,4,10,1008,8,1,10,4,10,1002,8,1,220,1,1009,14,10,2,1103,19,10,2,1102,9,10,2,1007,4,10,3,8,1002,8,-1,10,101,1,10,10,4,10,1008,8,1,10,4,10,101,0,8,258,2,3,0,10,1006,0,4,3,8,102,-1,8,10,1001,10,1,10,4,10,108,1,8,10,4,10,1001,8,0,286,1006,0,82,101,1,9,9,1007,9,1057,10,1005,10,15,99,109,632,104,0,104,1,21102,1,838479487636,1,21102,327,1,0,1106,0,431,21102,1,932813579156,1,21102,1,338,0,1106,0,431,3,10,104,0,104,1,3,10,104,0,104,0,3,10,104,0,104,1,3,10,104,0,104,1,3,10,104,0,104,0,3,10,104,0,104,1,21101,0,179318033447,1,21101,385,0,0,1105,1,431,21101,248037678275,0,1,21101,0,396,0,1105,1,431,3,10,104,0,104,0,3,10,104,0,104,0,21101,0,709496558348,1,21102,419,1,0,1105,1,431,21101,825544561408,0,1,21101,0,430,0,1106,0,431,99,109,2,22101,0,-1,1,21101,40,0,2,21102,462,1,3,21101,0,452,0,1106,0,495,109,-2,2105,1,0,0,1,0,0,1,109,2,3,10,204,-1,1001,457,458,473,4,0,1001,457,1,457,108,4,457,10,1006,10,489,1101,0,0,457,109,-2,2106,0,0,0,109,4,2101,0,-1,494,1207,-3,0,10,1006,10,512,21101,0,0,-3,22101,0,-3,1,22101,0,-2,2,21101,1,0,3,21102,531,1,0,1105,1,536,109,-4,2105,1,0,109,5,1207,-3,1,10,1006,10,559,2207,-4,-2,10,1006,10,559,22101,0,-4,-4,1106,0,627,21202,-4,1,1,21201,-3,-1,2,21202,-2,2,3,21102,578,1,0,1105,1,536,22101,0,1,-4,21101,1,0,-1,2207,-4,-2,10,1006,10,597,21102,0,1,-1,22202,-2,-1,-2,2107,0,-3,10,1006,10,619,21201,-1,0,1,21102,1,619,0,105,1,494,21202,-2,-1,-2,22201,-4,-2,-4,109,-5,2106,0,0';


class Canvas {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.uniquepixels = [];
        for(var j=0; j<this.height; j++) {
            var row = [];
            for(var i=0; i<this.width; i++) {
                row.push('.');
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
        var id = y * 100000000 + x;
        if (this.uniquepixels.indexOf(id) === -1) {
            this.uniquepixels.push(id);
        }
        this.grid[y][x] = v;
    }

    print() {
        for(var j=0; j<this.height; j++) {
            console.log('  ' + this.grid[j].join(''));
        }
        console.log('touched pixels: ' + this.uniquepixels.length);
        console.log();
    }
}



class Turtle {
    constructor (canvas) {
        this.canvas = canvas;
        this.x = 50;
        this.y = 15;
        this.direction = 0; // up=0, clockwise
    }

    colorUnder() {
        return this.canvas.get(this.x, this.y) == '#' ? 1 : 0;
    }

    paint(color) {
        this.canvas.set(this.x, this.y, color ? '#' : '_');
    }

    turn(right) {
        if (right) {
            this.direction ++;
            if (this.direction > 3) {
                this.direction = 0;
            }
        } else {
            this.direction --;
            if (this.direction < 0) {
                this.direction = 3;
            }
        }
    }

    move() {

        if (this.direction == 0) {
            this.y --;
        }
        if (this.direction == 1) {
            this.x ++;
        }
        if (this.direction == 2) {
            this.y ++;
        }
        if (this.direction == 3) {
            this.x --;
        }
    }
}



function run() {
    var canvas = new Canvas(200, 120);
    var memory = new ProgramMemory(PAINTER, 'Painter');
    var reader = new ProgramReader(memory);
    var runtime = new Runtime(reader, 'Painter');
    var turtle = new Turtle(canvas);
    turtle.x = 100;
    turtle.y = 70;
    canvas.set(turtle.x, turtle.y, '#'); // Test 2

    var turtle_paint = 0;
    var turtle_turn = 0;
    var turtle_writeoffset = 0;

    function moveturtle() {
        console.log(`Got command, paint=${turtle_paint}, turn=${turtle_turn}`);
        turtle.paint(turtle_paint);
        turtle.turn(turtle_turn);
        turtle.move();
        console.log('')
        // canvas.print();
        triggermove(); // trigger next move...
    }

    function triggermove() {
        var c = turtle.colorUnder();
        console.log(`Turtle, at ${turtle.x},${turtle.y}, facing ${turtle.direction}, on color ${c}`);
        runtime.addInput(c);
    }

    triggermove();

    runtime.onOutput = function(value) {
        console.log('wrote ' + value);
        if (turtle_writeoffset == 0) {
            turtle_paint = value;
        }
        if (turtle_writeoffset == 1) {
            turtle_turn = value;
            // step robot.
            moveturtle();
        }
        turtle_writeoffset ++;
        if (turtle_writeoffset == 2) {
            turtle_writeoffset = 0;
        }
    }

    while (!runtime.halted) {
        runtime.step();
    }

    canvas.print();
}


run();


function testa() {
    var canvas = new Canvas(5, 5);

    var turtle = new Turtle(canvas);
    turtle.x = 2;
    turtle.y = 2;

    canvas.print();

    turtle.paint(1);
    turtle.turn(0);
    turtle.move();

    canvas.print();

    turtle.paint(0);
    turtle.turn(0);
    turtle.move();

    canvas.print();


    turtle.paint(1);
    turtle.turn(0);
    turtle.move();

    canvas.print();


    turtle.paint(1);
    turtle.turn(0);
    turtle.move();

    canvas.print();

    turtle.paint(0);
    turtle.turn(1);
    turtle.move();

    canvas.print();

    turtle.paint(1);
    turtle.turn(0);
    turtle.move();

    canvas.print();

    turtle.paint(1);
    turtle.turn(0);
    turtle.move();

    canvas.print();
}

// testa();
