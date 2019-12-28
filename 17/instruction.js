const Operators = {
    Invalid: 0,
    Add: 1,
    Multiply: 2,
    ReadInput: 3,
    WriteOutput: 4,
    JumpIfTrue: 5,
    JumpIfFalse: 6,
    LessThan: 7,
    Equals: 8,
    AddRelativeBase: 9,
    Halt: 99,
}

const OperatorNames = {
    [Operators.Invalid]: 'Invalid',
    [Operators.Add]: 'Add',
    [Operators.Multiply]: 'Multiply',
    [Operators.ReadInput]: 'ReadInput',
    [Operators.WriteOutput]: 'WriteOutput',
    [Operators.JumpIfTrue]: 'JumpIfTrue',
    [Operators.JumpIfFalse]: 'JumpIfFalse',
    [Operators.LessThan]: 'LessThan',
    [Operators.Equals]: 'Equals',
    [Operators.AddRelativeBase]: 'AddRelativeBase',
    [Operators.Halt]: 'Halt',
}

const Modes = {
    Default: 0,
    Intermediate: 1,
    Relative: 2,
}

class Parameter {
    constructor(value, mode) {
        this.value = value || 0;
        this.mode = mode || 0;
    }

    string() {
        if (this.mode === Modes.Default) {
            return `MEM[${this.value}]`;
        }
        if (this.mode === Modes.Relative) {
            return `MEM[PC+${this.value}]`;
        }
        return `${this.value}`;
    }
}

class Instruction {
    constructor(op) {
        this.pc = 0;
        this.op = op || 0;
        this.raw = [];
        this.parameters = [];
        this.reader = null;
    }

    parsereadparametervalue(parameterindex) {
        var value = this.reader.read();
        var mode = this.parameter_modes[parameterindex] || 0;
        return new Parameter(value, mode);
    }

    parseOperator1() {
        var p1 = this.parsereadparametervalue(0);
        var p2 = this.parsereadparametervalue(1);
        var p3 = this.parsereadparametervalue(2);
        var inst = new Instruction(Operators.Add);
        inst.parameters.push(p1);
        inst.parameters.push(p2);
        inst.parameters.push(p3);
        return inst;
    }

    parseOperator2() {
        var p1 = this.parsereadparametervalue(0);
        var p2 = this.parsereadparametervalue(1);
        var p3 = this.parsereadparametervalue(2);
        var inst = new Instruction(Operators.Multiply);
        inst.parameters.push(p1);
        inst.parameters.push(p2);
        inst.parameters.push(p3);
        return inst;
    }

    parseOperator3() {
        var p1 = this.parsereadparametervalue(0);
        var inst = new Instruction(Operators.ReadInput);
        inst.parameters.push(p1);
        return inst;
    }

    parseOperator4() {
        var p1 = this.parsereadparametervalue(0);
        var inst = new Instruction(Operators.WriteOutput);
        inst.parameters.push(p1);
        return inst;
    }

    parseOperator5() {
        var p1 = this.parsereadparametervalue(0);
        var p2 = this.parsereadparametervalue(1);
        var inst = new Instruction(Operators.JumpIfTrue);
        inst.parameters.push(p1);
        inst.parameters.push(p2);
        return inst;
    }

    parseOperator6() {
        var p1 = this.parsereadparametervalue(0);
        var p2 = this.parsereadparametervalue(1);
        var inst = new Instruction(Operators.JumpIfFalse);
        inst.parameters.push(p1);
        inst.parameters.push(p2);
        return inst;
    }

    parseOperator7() {
        var p1 = this.parsereadparametervalue(0);
        var p2 = this.parsereadparametervalue(1);
        var p3 = this.parsereadparametervalue(2);
        var inst = new Instruction(Operators.LessThan);
        inst.parameters.push(p1);
        inst.parameters.push(p2);
        inst.parameters.push(p3);
        return inst;
    }

    parseOperator8() {
        var p1 = this.parsereadparametervalue(0);
        var p2 = this.parsereadparametervalue(1);
        var p3 = this.parsereadparametervalue(2);
        var inst = new Instruction(Operators.Equals);
        inst.parameters.push(p1);
        inst.parameters.push(p2);
        inst.parameters.push(p3);
        return inst;
    }

    parseOperator9() {
        var p1 = this.parsereadparametervalue(0);
        var inst = new Instruction(Operators.AddRelativeBase);
        inst.parameters.push(p1);
        return inst;
    }

    parseOperator99() {
        var inst = new Instruction(Operators.Halt);
        return inst;
    }

    parseOne() {
        var pc_before = this.reader.pc;

        if (this.reader.eof()) {
            // console.log(`${this.name}: [#${this.pc}] program out of bounds`);
            return undefined;
        }

        var op_and_mode = this.reader.read();
        var op = op_and_mode % 100;
        // console.log(`op=${op}`);
        this.op = op;
        this.parameter_modes = `${Math.floor(op_and_mode / 100)}`.split('').reverse().map(t => ~~t);
        // console.log(`parameter_modes=${JSON.stringify(parameter_modes)}`);
        // console.log(`${this.name}: [#${this.pc}] step pc=${pc_before} op=${op} mode=${JSON.stringify(this.parameter_modes)}`);

        var result = undefined;
        if (op == 1) { result = this.parseOperator1(); }
        if (op == 2) { result = this.parseOperator2(); }
        if (op == 3) { result = this.parseOperator3(); }
        if (op == 4) { result = this.parseOperator4(); }
        if (op == 5) { result = this.parseOperator5(); }
        if (op == 6) { result = this.parseOperator6(); }
        if (op == 7) { result = this.parseOperator7(); }
        if (op == 8) { result = this.parseOperator8(); }
        if (op == 9) { result = this.parseOperator9(); }
        if (op == 99) { result = this.parseOperator99(); }

        if (result) {
            result.op = op;
            result.pc = pc_before;
            result.raw = this.reader.memory.program.slice(pc_before, this.reader.position());
            // console.log('Parsed: ' + result.string());
            // this.instructions.push(result);
            return result;
        } else {
            return undefined;
        }
    }

    static parse(reader) {
        var dummy = new Instruction();
        dummy.reader = reader;
        // dummy.reader = new ProgramReader(memory);
        // dummy.reader.seek(offset);
        var result = dummy.parseOne();
        return result;
    }

    comment() {
        return `pc=${this.pc} op=${this.op} raw=[ ${this.raw.join(', ')} ]`;
    }

    string() {
        var ps = this.parameters.map(p => p.string()).join(' ');
        return `${OperatorNames[this.op]}${ps?` ${ps}`:''};`;
    }
}

module.exports = {
    Modes,
    Parameter,
    Instruction,
    Operators,
}
