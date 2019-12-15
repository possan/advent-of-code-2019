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
    if (typeof(opcodes) === 'string') {
        opcodes = opcodes.split(',').map(t => ~~t);
    }

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
    if (typeof(input) === 'string') {
        input = input.split(',').map(t => ~~t);
    }
    programinput = input;
    programoutput = [];
    // console.log('input', programinput);
    // console.log();
    // console.log('opcodes', opcode);
    runopcodes(opcodes);
    console.log('output', programoutput);
    // console.log();
    console.log();
    console.log();
}

function assertprogram(name, opcodes, input, expectedoutput) {
    runprogram(opcodes, input);
    var actual = programoutput.join(',');
    assert(name, actual, expectedoutput);
}

// run('1,0,0,3,99');
// run('1,9,10,3,2,3,11,0,99,30,40,50');
// run('1,0,0,0,99');
// run('1,1,1,4,99,5,6,0,99');

// input written to output
// runprogram('3,0,4,0,99', '42')

// multiply with immediate mode parameter, writes 99 to last position
// runprogram('1002,4,3,4,33', '')

// find 100 + -1, store the result in position 4
// runprogram('1101,100,-1,4,0', '')

// Part 1
// runprogram('3,225,1,225,6,6,1100,1,238,225,104,0,1102,40,93,224,1001,224,-3720,224,4,224,102,8,223,223,101,3,224,224,1,224,223,223,1101,56,23,225,1102,64,78,225,1102,14,11,225,1101,84,27,225,1101,7,82,224,1001,224,-89,224,4,224,1002,223,8,223,1001,224,1,224,1,224,223,223,1,35,47,224,1001,224,-140,224,4,224,1002,223,8,223,101,5,224,224,1,224,223,223,1101,75,90,225,101,9,122,224,101,-72,224,224,4,224,1002,223,8,223,101,6,224,224,1,224,223,223,1102,36,63,225,1002,192,29,224,1001,224,-1218,224,4,224,1002,223,8,223,1001,224,7,224,1,223,224,223,102,31,218,224,101,-2046,224,224,4,224,102,8,223,223,101,4,224,224,1,224,223,223,1001,43,38,224,101,-52,224,224,4,224,1002,223,8,223,101,5,224,224,1,223,224,223,1102,33,42,225,2,95,40,224,101,-5850,224,224,4,224,1002,223,8,223,1001,224,7,224,1,224,223,223,1102,37,66,225,4,223,99,0,0,0,677,0,0,0,0,0,0,0,0,0,0,0,1105,0,99999,1105,227,247,1105,1,99999,1005,227,99999,1005,0,256,1105,1,99999,1106,227,99999,1106,0,265,1105,1,99999,1006,0,99999,1006,227,274,1105,1,99999,1105,1,280,1105,1,99999,1,225,225,225,1101,294,0,0,105,1,0,1105,1,99999,1106,0,300,1105,1,99999,1,225,225,225,1101,314,0,0,106,0,0,1105,1,99999,1007,226,677,224,1002,223,2,223,1005,224,329,1001,223,1,223,1007,226,226,224,1002,223,2,223,1006,224,344,101,1,223,223,1107,677,226,224,102,2,223,223,1006,224,359,1001,223,1,223,108,677,677,224,1002,223,2,223,1006,224,374,1001,223,1,223,107,677,677,224,1002,223,2,223,1005,224,389,101,1,223,223,8,677,677,224,1002,223,2,223,1005,224,404,1001,223,1,223,108,226,226,224,1002,223,2,223,1005,224,419,101,1,223,223,1008,677,677,224,1002,223,2,223,1005,224,434,101,1,223,223,1008,226,226,224,1002,223,2,223,1005,224,449,101,1,223,223,7,677,226,224,1002,223,2,223,1006,224,464,1001,223,1,223,7,226,226,224,1002,223,2,223,1005,224,479,1001,223,1,223,1007,677,677,224,102,2,223,223,1005,224,494,101,1,223,223,1108,677,226,224,102,2,223,223,1006,224,509,1001,223,1,223,8,677,226,224,102,2,223,223,1005,224,524,1001,223,1,223,1107,226,226,224,102,2,223,223,1006,224,539,1001,223,1,223,1008,226,677,224,1002,223,2,223,1006,224,554,1001,223,1,223,1107,226,677,224,1002,223,2,223,1006,224,569,1001,223,1,223,1108,677,677,224,102,2,223,223,1005,224,584,101,1,223,223,7,226,677,224,102,2,223,223,1006,224,599,1001,223,1,223,1108,226,677,224,102,2,223,223,1006,224,614,101,1,223,223,107,226,677,224,1002,223,2,223,1005,224,629,101,1,223,223,108,226,677,224,1002,223,2,223,1005,224,644,101,1,223,223,8,226,677,224,1002,223,2,223,1005,224,659,1001,223,1,223,107,226,226,224,1002,223,2,223,1006,224,674,101,1,223,223,4,223,99,226', '1')
// output [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 6745903 ]

assertprogram('I/O', '3,0,4,0,99', '42', '42')

assertprogram('Position mode, Input is equal to 8', '3,9,8,9,10,9,4,9,99,-1,8','8','1');
assertprogram('Position mode, Input is equal to 8', '3,9,8,9,10,9,4,9,99,-1,8','42','0');

assertprogram('Position mode, Input is less than 8', '3,9,7,9,10,9,4,9,99,-1,8','4','1');
assertprogram('Position mode, Input is less than 8', '3,9,7,9,10,9,4,9,99,-1,8','8','0');

assertprogram('Immediate mode, Input is equal to 8', '3,3,1108,-1,8,3,4,3,99','8','1');
assertprogram('Immediate mode, Input is equal to 8', '3,3,1108,-1,8,3,4,3,99','42','0');

assertprogram('Immediate mode, Input is less than 8', '3,3,1107,-1,8,3,4,3,99','4','1');
assertprogram('Immediate mode, Input is less than 8', '3,3,1107,-1,8,3,4,3,99','8','0');

assertprogram('Example 1, Position mode, 1 if non-zero', '3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9','0','0');
assertprogram('Example 1, Position mode, 1 if non-zero', '3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9','42','1');
assertprogram('Example 1, Immediate mode, 1 if non-zero', '3,3,1105,-1,9,1101,0,0,12,4,12,99,1','0','0');
assertprogram('Example 1, Immediate mode, 1 if non-zero', '3,3,1105,-1,9,1101,0,0,12,4,12,99,1','42','1');

assertprogram('Example 2, Below 8', '3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99','5','999');
assertprogram('Example 2, Equal 8', '3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99','8','1000');
assertprogram('Example 2, Above 8', '3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99','15','1001');

// Part 2
// runprogram('3,225,1,225,6,6,1100,1,238,225,104,0,1102,40,93,224,1001,224,-3720,224,4,224,102,8,223,223,101,3,224,224,1,224,223,223,1101,56,23,225,1102,64,78,225,1102,14,11,225,1101,84,27,225,1101,7,82,224,1001,224,-89,224,4,224,1002,223,8,223,1001,224,1,224,1,224,223,223,1,35,47,224,1001,224,-140,224,4,224,1002,223,8,223,101,5,224,224,1,224,223,223,1101,75,90,225,101,9,122,224,101,-72,224,224,4,224,1002,223,8,223,101,6,224,224,1,224,223,223,1102,36,63,225,1002,192,29,224,1001,224,-1218,224,4,224,1002,223,8,223,1001,224,7,224,1,223,224,223,102,31,218,224,101,-2046,224,224,4,224,102,8,223,223,101,4,224,224,1,224,223,223,1001,43,38,224,101,-52,224,224,4,224,1002,223,8,223,101,5,224,224,1,223,224,223,1102,33,42,225,2,95,40,224,101,-5850,224,224,4,224,1002,223,8,223,1001,224,7,224,1,224,223,223,1102,37,66,225,4,223,99,0,0,0,677,0,0,0,0,0,0,0,0,0,0,0,1105,0,99999,1105,227,247,1105,1,99999,1005,227,99999,1005,0,256,1105,1,99999,1106,227,99999,1106,0,265,1105,1,99999,1006,0,99999,1006,227,274,1105,1,99999,1105,1,280,1105,1,99999,1,225,225,225,1101,294,0,0,105,1,0,1105,1,99999,1106,0,300,1105,1,99999,1,225,225,225,1101,314,0,0,106,0,0,1105,1,99999,1007,226,677,224,1002,223,2,223,1005,224,329,1001,223,1,223,1007,226,226,224,1002,223,2,223,1006,224,344,101,1,223,223,1107,677,226,224,102,2,223,223,1006,224,359,1001,223,1,223,108,677,677,224,1002,223,2,223,1006,224,374,1001,223,1,223,107,677,677,224,1002,223,2,223,1005,224,389,101,1,223,223,8,677,677,224,1002,223,2,223,1005,224,404,1001,223,1,223,108,226,226,224,1002,223,2,223,1005,224,419,101,1,223,223,1008,677,677,224,1002,223,2,223,1005,224,434,101,1,223,223,1008,226,226,224,1002,223,2,223,1005,224,449,101,1,223,223,7,677,226,224,1002,223,2,223,1006,224,464,1001,223,1,223,7,226,226,224,1002,223,2,223,1005,224,479,1001,223,1,223,1007,677,677,224,102,2,223,223,1005,224,494,101,1,223,223,1108,677,226,224,102,2,223,223,1006,224,509,1001,223,1,223,8,677,226,224,102,2,223,223,1005,224,524,1001,223,1,223,1107,226,226,224,102,2,223,223,1006,224,539,1001,223,1,223,1008,226,677,224,1002,223,2,223,1006,224,554,1001,223,1,223,1107,226,677,224,1002,223,2,223,1006,224,569,1001,223,1,223,1108,677,677,224,102,2,223,223,1005,224,584,101,1,223,223,7,226,677,224,102,2,223,223,1006,224,599,1001,223,1,223,1108,226,677,224,102,2,223,223,1006,224,614,101,1,223,223,107,226,677,224,1002,223,2,223,1005,224,629,101,1,223,223,108,226,677,224,1002,223,2,223,1005,224,644,101,1,223,223,8,226,677,224,1002,223,2,223,1005,224,659,1001,223,1,223,107,226,226,224,1002,223,2,223,1006,224,674,101,1,223,223,4,223,99,226', '5')
// output [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 6745903 ]
