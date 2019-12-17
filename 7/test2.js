var program = [];
var programinput = [];
var programoutput = [];
var pc = 0;
var parameter_modes = [];

function assert(name, actual, expected) {
    if (actual === expected) {
        console.log(`✅ ${name} Ok`)
    } else {
        console.log(`❌ ${name} Failed, expected ${expected} but got ${actual}`)
    }
}

function parselist(input) {
    if (typeof(input) === 'string') {
        input = input.split(',').map(t => parseInt(t, 10));
    }
    return input;
}

class Runtime {
    constructor (opcodes, name) {
        this.onOutput = null;
        this.onHalt = null;
        this.name = name || 'Unnamed';
        this.program = parselist(opcodes);
        this.programinput = [];
        this.programoutput = [];
        this.pc = 0;
        this.blocking = false;
        this.halted = false;
        this.parameter_modes = [];
    }

    addInput (input) {
        if (typeof(input) === 'number') {
            this.programinput.push(input)
        } else if (typeof(input) === 'object') {
            this.programinput = [...this.programinput, ...input];
        }
        console.log(`${this.name}: [#${this.pc}] Input queue is now: ${JSON.stringify(this.programinput)}`);
    }

    addInputs (inputs) {
        this.addInput(inputs);
    }

    restart() {
        this.pc = 0;
    }

    readinput() {
        if (this.programinput.length < 1) {
            return undefined;
        }

        var value = this.programinput.shift();
        // console.log(`returning input ${value}`)
        return value;
    }

    writeoutput(value) {
        console.log(`${this.name}: [#${this.pc}] Writing ${value} to output`);
        this.programoutput.push(value);
        this.onOutput && this.onOutput(value);
    }

    read() {
        var value = this.program[this.pc];
        this.pc ++;
        console.log(`${this.name}: [#${this.pc}] Read program value=${value}`);
        return value;
    }

    readparametervalue(parameterindex) {
        var x = this.read();
        var mode = this.parameter_modes[parameterindex] || 0;
        // console.log(`readparameter, index=${parameterindex}, mode=${mode}, value=${x}`);
        if (mode == 1) {
            return x;
        }
        return this.program[x];
    }

    step_op1() {
        // Addition
        var v1 = this.readparametervalue(0);
        var v2 = this.readparametervalue(1);
        var p3 = this.read(); // parameter(2);
        // console.log(`ADDR ${p1} + ${p2} -> ${p3}`);
        var o = v1 + v2;
        // console.log(`VAL ${v1} + ${v2} -> ${o}`);
        this.program[p3] = o;
        // console.log('new program', program);
        return true;
    }

    step_op2() {
        // Multiply
        var v1 = this.readparametervalue(0);
        var v2 = this.readparametervalue(1);
        var p3 = this.read(); // parameter(2);
        // console.log(`ADDR ${p1} * ${p2} -> ${p3}`);
        var o = v1 * v2;
        // console.log(`VAL ${v1} * ${v2} -> ${o}`);
        this.program[p3] = o;
        // console.log('new program', program);
        return true;
    }

    step_op3() {
        // Input
        var p1 = this.read();
        var v1 = this.readinput();
        if (v1 === undefined) {
            // blocking on no input...
            return false;
        }
        this.program[p1] = v1;
        return true;
    }

    step_op4() {
        // Output
        var v1 = this.readparametervalue(0);
        this.writeoutput(v1);
        return true;
    }

    step_op5() {
        // Jump if true
        var v1 = this.readparametervalue(0);
        var v2 = this.readparametervalue(1);
        if (v1 != 0) {
            this.pc = v2;
        }
        return true;
    }

    step_op6() {
        // Jump if false
        var v1 = this.readparametervalue(0);
        var v2 = this.readparametervalue(1);
        if (v1 == 0) {
            this.pc = v2;
        }
        return true;
    }

    step_op7() {
        // Less than
        var v1 = this.readparametervalue(0);
        var v2 = this.readparametervalue(1);
        var p3 = this.read();
        this.program[p3] = v1 < v2 ? 1 : 0;
        return true;
    }

    step_op8() {
        // Equals
        var v1 = this.readparametervalue(0);
        var v2 = this.readparametervalue(1);
        var p3 = this.read();
        this.program[p3] = v1 == v2 ? 1 : 0;
        return true;
    }

    step() {
        if (this.halted) {
            console.log(`${this.name}: [#${this.pc}] halted`);
            return false;
        }

        var pc_before = this.pc;

        var op_and_mode = this.read();
        if (pc > this.program.length) {
            console.log(`${this.name}: [#${this.pc}] program out of bounds`);
            op_and_mode = 99;
        }
        var op = op_and_mode % 100;
        // console.log(`op=${op}`);
        this.parameter_modes = `${Math.floor(op_and_mode / 100)}`.split('').reverse().map(t => ~~t);
        // console.log(`parameter_modes=${JSON.stringify(parameter_modes)}`);
        console.log(`${this.name}: [#${this.pc}] step pc=${pc_before} op=${op} mode=${JSON.stringify(this.parameter_modes)}`);

        var result = false;
        if (op == 1) { result = this.step_op1(); }
        if (op == 2) { result = this.step_op2(); }
        if (op == 3) { result = this.step_op3(); }
        if (op == 4) { result = this.step_op4(); }
        if (op == 5) { result = this.step_op5(); }
        if (op == 6) { result = this.step_op6(); }
        if (op == 7) { result = this.step_op7(); }
        if (op == 8) { result = this.step_op8(); }

        if (op == 99) {
            console.log(`${this.name}: [#${this.pc}] explicit halt`);
            result = true;
            this.halted = true;
            this.onHalt && this.onHalt();
        }

        if (!result) {
            console.log(`${this.name}: [#${this.pc}] opcode failed, waiting for input?`);
            this.blocking = true;
            this.pc = pc_before;
        } else {
            this.blocking = false;
        }

        return result;
    }

}

function runopcodes(opcodes) {
    opcodes = parselist(opcodes);
    program = opcodes;
    pc = 0;

    // console.log('program', program);
    var alive = true;
    while (alive) {
        alive = step();
        // console.log();
    }

    // console.log('FINAL program', program);
    // console.log('RESULT', program[0]);
    // console.log();
    // console.log();

    return program[0];
}

function runprogram(opcodes, input) {
    input = parselist(input);
    programinput = input;
    programoutput = [];
    // console.log('input', programinput);
    // console.log();
    // console.log('opcodes', opcode);
    runopcodes(opcodes);
    // console.log('output', programoutput);
    // console.log();
    // console.log();
    // console.log();
    return programoutput;
}

function assertprogram(name, opcodes, input, expectedoutput) {
    runprogram(opcodes, input);
    var actual = programoutput.join(',');
    assert(name, actual, expectedoutput);
}

// assertprogram('I/O', '3,0,4,0,99', '42', '42')

// assertprogram('Position mode, Input is equal to 8', '3,9,8,9,10,9,4,9,99,-1,8','8','1');
// assertprogram('Position mode, Input is equal to 8', '3,9,8,9,10,9,4,9,99,-1,8','42','0');

// assertprogram('Position mode, Input is less than 8', '3,9,7,9,10,9,4,9,99,-1,8','4','1');
// assertprogram('Position mode, Input is less than 8', '3,9,7,9,10,9,4,9,99,-1,8','8','0');

// assertprogram('Immediate mode, Input is equal to 8', '3,3,1108,-1,8,3,4,3,99','8','1');
// assertprogram('Immediate mode, Input is equal to 8', '3,3,1108,-1,8,3,4,3,99','42','0');

// assertprogram('Immediate mode, Input is less than 8', '3,3,1107,-1,8,3,4,3,99','4','1');
// assertprogram('Immediate mode, Input is less than 8', '3,3,1107,-1,8,3,4,3,99','8','0');

// assertprogram('Example 1, Position mode, 1 if non-zero', '3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9','0','0');
// assertprogram('Example 1, Position mode, 1 if non-zero', '3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9','42','1');
// assertprogram('Example 1, Immediate mode, 1 if non-zero', '3,3,1105,-1,9,1101,0,0,12,4,12,99,1','0','0');
// assertprogram('Example 1, Immediate mode, 1 if non-zero', '3,3,1105,-1,9,1101,0,0,12,4,12,99,1','42','1');

// assertprogram('Example 2, Below 8', '3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99','5','999');
// assertprogram('Example 2, Equal 8', '3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99','8','1000');
// assertprogram('Example 2, Above 8', '3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99','15','1001');

function runamp(program, sequence) {
    sequence = parselist(sequence);

    var amps = [
        new Runtime(program, 'amp0'),
        new Runtime(program, 'amp1'),
        new Runtime(program, 'amp2'),
        new Runtime(program, 'amp3'),
        new Runtime(program, 'amp4'),
    ]

    var result = 0;

    amps[0].onOutput = function(output) {
        console.log(`amp 0 wrote ${output}`);
        amps[1].addInput(output);
    }

    amps[1].onOutput = function(output) {
        console.log(`amp 1 wrote ${output}`);
        amps[2].addInput(output);
    }

    amps[2].onOutput = function(output) {
        console.log(`amp 2 wrote ${output}`);
        amps[3].addInput(output);
    }

    amps[3].onOutput = function(output) {
        console.log(`amp 3 wrote ${output}`);
        amps[4].addInput(output);
    }

    amps[4].onOutput = function(output) {
        // feedback...
        console.log(`amp 4 wrote ${output}`);
        result = output;
        amps[0].addInput(output);
    }

    // initial phase setting
    amps[0].addInput(sequence[0]);
    amps[1].addInput(sequence[1]);
    amps[2].addInput(sequence[2]);
    amps[3].addInput(sequence[3]);
    amps[4].addInput(sequence[4]);

    // initial trigger
    amps[0].addInput(0);

    var alive = true;
    while(alive) {
        amps[0].step();
        amps[1].step();
        amps[2].step();
        amps[3].step();
        amps[4].step();

        if (amps[0].halted &&
            amps[1].halted &&
            amps[2].halted &&
            amps[3].halted &&
            amps[4].halted) alive = false;
    }


    /*
    var inputs = ['x', 0];
        console.log('>loop')
        sequence.forEach(input => {
            inputs[0] = input;
            console.log('inputs', inputs);
            var output = runprogram(program, inputs);
            console.log('output', output);
            inputs = ['x', ...output];
            result = output[0];
        });
        console.log('<loop')
    }
    */
    console.log('sequence', JSON.stringify(sequence), result);
    return result;
}

function assertamps(name, program, sequence, expected) {
    sequence = parselist(sequence);
    var result = runamp(program, sequence);
    assert(name, result, expected);
}

// assertamps('Example 1', '3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0', '4,3,2,1,0', 43210);
// assertamps('Example 2', '3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0', '0,1,2,3,4', 54321);

function isunique(sequence) {
    return [...new Set(sequence)].length == 5;
}

function findbest(opcodes) {
    var bestsequence = [];
    var bestresult = 0;
    for(var e=5; e<=9; e++) {
        for(var d=5; d<=9; d++) {
            for(var c=5; c<=9; c++) {
                for(var b=5; b<=9; b++) {
                    for(var a=5; a<=9; a++) {
                        var sequence = [a,b,c,d,e];
                        if (isunique(sequence)) {
                            var result = runamp(opcodes, sequence);
                            if (result > bestresult) {
                                bestresult = result;
                                bestsequence = sequence;
                            }
                        }
                    }
                }
            }
        }
    }
    console.log('bestresult', bestresult);
    console.log('bestsequence', bestsequence);
    return bestresult;
}

// findbest('3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0');
// findbest('3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5');
// findbest('3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,-5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10');
// assertamps('Example 3', '3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0', '1,0,4,3,2', 65210);

// riunam
// assertamps('Example 4', '3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5', '9,8,7,6,5', 139629729);
// assertamps('Example 5', '3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,-5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10', '9,7,8,5,6', 18216);

var TESTPROGRAM = '3,8,1001,8,10,8,105,1,0,0,21,30,47,60,81,102,183,264,345,426,99999,3,9,1002,9,5,9,4,9,99,3,9,1002,9,5,9,1001,9,4,9,1002,9,4,9,4,9,99,3,9,101,2,9,9,1002,9,4,9,4,9,99,3,9,1001,9,3,9,1002,9,2,9,101,5,9,9,1002,9,2,9,4,9,99,3,9,102,4,9,9,101,4,9,9,1002,9,3,9,101,2,9,9,4,9,99,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,99,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,101,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,99,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,99';
findbest(TESTPROGRAM);
