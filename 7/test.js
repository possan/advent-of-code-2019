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
        input = input.split(',').map(t => ~~t);
    }
    return input;
}

function readinput() {
    if (programinput.length < 1) {
        return 0;
    }

    var v = programinput.shift();
    // console.log(`returning input ${v}`)
    return v;
}

function writeoutput(value) {
    programoutput.push(value);
}

function read() {
    var x = program[pc];
    pc ++;
    // console.log(`read, value=${x}`);
    return x;
}

function readparametervalue(parameterindex) {
    var x = read();
    var mode = parameter_modes[parameterindex] || 0;
    // console.log(`readparameter, index=${parameterindex}, mode=${mode}, value=${x}`);
    if (mode == 1) {
        return x;
    }
    return program[x];
}

function step_op1() {
    // Addition
    var v1 = readparametervalue(0);
    var v2 = readparametervalue(1);
    var p3 = read(); // parameter(2);
    // console.log(`ADDR ${p1} + ${p2} -> ${p3}`);
    var o = v1 + v2;
    // console.log(`VAL ${v1} + ${v2} -> ${o}`);
    program[p3] = o;
    // console.log('new program', program);
}

function step_op2() {
    // Multiply
    var v1 = readparametervalue(0);
    var v2 = readparametervalue(1);
    var p3 = read(); // parameter(2);
    // console.log(`ADDR ${p1} * ${p2} -> ${p3}`);
    var o = v1 * v2;
    // console.log(`VAL ${v1} * ${v2} -> ${o}`);
    program[p3] = o;
    // console.log('new program', program);
}

function step_op3() {
    // Input
    var p1 = read();
    var v1 = readinput();
    program[p1] = v1;
}

function step_op4() {
    // Output
    var v1 = readparametervalue(0);
    writeoutput(v1);
}

function step_op5() {
    // Jump if true
    var v1 = readparametervalue(0);
    var v2 = readparametervalue(1);
    if (v1 != 0) {
        pc = v2;
    }
}

function step_op6() {
    // Jump if false
    var v1 = readparametervalue(0);
    var v2 = readparametervalue(1);
    if (v1 == 0) {
        pc = v2;
    }
}

function step_op7() {
    // Less than
    var v1 = readparametervalue(0);
    var v2 = readparametervalue(1);
    var p3 = read();
    program[p3] = v1 < v2 ? 1 : 0;
}

function step_op8() {
    // Equals
    var v1 = readparametervalue(0);
    var v2 = readparametervalue(1);
    var p3 = read();
    program[p3] = v1 == v2 ? 1 : 0;
}

function step() {
    // console.log(`step pc=${pc}`);
    var op_and_mode = read();
    if (pc > program.length) {
        console.log('program out of bounds');
        op_and_mode = 99;
    }
    // console.log(`op_and_mode=${op_and_mode}`);
    var op = op_and_mode % 100;
    // console.log(`op=${op}`);
    parameter_modes = `${Math.floor(op_and_mode / 100)}`.split('').reverse().map(t => ~~t);
    // console.log(`parameter_modes=${JSON.stringify(parameter_modes)}`);
    if (op == 1) step_op1();
    if (op == 2) step_op2();
    // Part 1
    if (op == 3) step_op3();
    if (op == 4) step_op4();
    // Part 2
    if (op == 5) step_op5();
    if (op == 6) step_op6();
    if (op == 7) step_op7();
    if (op == 8) step_op8();
    return (op != 99);
}

function runopcodes(opcodes) {
    opcodes = parselist(opcodes);
    program = opcodes;
    pc = 0;

    var alive = true;
    while (alive) {
        // console.log('program', program);
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
    var result = 0;
    sequence.forEach(input => {
        // console.log('input', input);
        var output = runprogram(program, [input, result]);
        // console.log('output', output);
        result = output[0];
    });
    console.log('sequence', JSON.stringify(sequence), result);
    return result;
}

function assertamps(name, program, sequence, expected) {
    sequence = parselist(sequence);
    var result = runamp(program, sequence);
    assert(name, result, expected);
}

assertamps('Example 1', '3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0', '4,3,2,1,0', 43210);
assertamps('Example 2', '3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0', '0,1,2,3,4', 54321);
assertamps('Example 3', '3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0', '1,0,4,3,2', 65210);

function unique(sequence) {
    // console.log('sequence', (new Set(sequence)), );
    return [...new Set(sequence)].length == 5;
}

function findbest(opcodes) {
    var bestsequence = [];
    var bestresult = 0;
    for(var e=0; e<=4; e++) {
        for(var d=0; d<=4; d++) {
            for(var c=0; c<=4; c++) {
                for(var b=0; b<=4; b++) {
                    for(var a=0; a<=4; a++) {
                        var sequence = [a,b,c,d,e];
                        if (unique(sequence)) {
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
// findbest('3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0');
// findbest('3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0');

var TESTPROGRAM = '3,8,1001,8,10,8,105,1,0,0,21,30,47,60,81,102,183,264,345,426,99999,3,9,1002,9,5,9,4,9,99,3,9,1002,9,5,9,1001,9,4,9,1002,9,4,9,4,9,99,3,9,101,2,9,9,1002,9,4,9,4,9,99,3,9,1001,9,3,9,1002,9,2,9,101,5,9,9,1002,9,2,9,4,9,99,3,9,102,4,9,9,101,4,9,9,1002,9,3,9,101,2,9,9,4,9,99,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,99,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,101,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,99,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,99';
findbest(TESTPROGRAM);
