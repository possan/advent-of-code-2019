var { Instruction, Operators, Modes } = require('./instruction.js');

class Runtime {
    constructor (reader, name) {
        this.onOutput = null;
        this.onHalt = null;
        this.name = name || 'Unnamed';
        this.reader = reader;
        this.programinput = [];
        this.programoutput = [];
        this.verbose = false;
        this.blocking = false;
        this.halted = false;
        this.relative_base = 0;
    }

    addInput(input) {
        if (typeof(input) === 'number') {
            this.programinput.push(input)
        } else if (typeof(input) === 'object') {
            this.programinput = [...this.programinput, ...input];
        }

        if (this.verbose) {
            console.log(`${this.name}: [#${this.pc}] Input queue is now: ${JSON.stringify(this.programinput)}`);
        }
    }

    restart() {
        this.reader.seek(0);
    }

    writeparameteroffset(inst, parameterindex) {
        var p = inst.parameters[parameterindex];

        if (p.mode === Modes.Intermediate) {
            if (this.verbose) {
                console.log(`${this.name}: Write parameter offset intermediate = ${p.value}`);
            }

            return p.value; // invalid?
        }

        if (p.mode === Modes.Relative) {
            var o = this.relative_base + p.value;

            if (this.verbose) {
                console.log(`${this.name}: Write parameter offset relative=${o}`);
            }

            return o;
        }

        if (this.verbose) {
            console.log(`${this.name}: Write parameter offset defaults to = ${p.value}`);
        }

        return p.value;
    }

    readparametervalue(inst, parameterindex) {
        var p = inst.parameters[parameterindex];

        if (p.mode === Modes.Intermediate) {
            if (this.verbose) {
                console.log(`${this.name}: Read parameter intermediate value = ${p.value}`);
            }

            return p.value;
        }

        if (p.mode === Modes.Relative) {
            var o = this.relative_base + p.value;

            if (this.verbose) {
                console.log(`${this.name}: Read parameter offset relative=${o}`);
            }

            return this.reader.readAt(o);
        }

        if (this.verbose) {
            console.log(`${this.name}: Read parameter offset defaults to = ${p.value}`);
        }

        return this.reader.readAt(p.value);
    }

    runInstructionAdd(inst) {
        var p1 = this.readparametervalue(inst, 0);
        var p2 = this.readparametervalue(inst, 1);
        var p3 = this.writeparameteroffset(inst, 2);
        this.reader.writeAt(p3, p1 + p2);
        return true;
    }

    runInstructionMultiply(inst) {
        var p1 = this.readparametervalue(inst, 0);
        var p2 = this.readparametervalue(inst, 1);
        var p3 = this.writeparameteroffset(inst, 2);
        this.reader.writeAt(p3, p1 * p2);
        return true;
    }

    runInstructionEquals(inst) {
        var p1 = this.readparametervalue(inst, 0);
        var p2 = this.readparametervalue(inst, 1);
        var p3 = this.writeparameteroffset(inst, 2);
        this.reader.writeAt(p3, p1 == p2);
        return true;
    }

    runInstructionLessThan(inst) {
        var p1 = this.readparametervalue(inst, 0);
        var p2 = this.readparametervalue(inst, 1);
        var p3 = this.writeparameteroffset(inst, 2);
        this.reader.writeAt(p3, p1 < p2);
        return true;
    }

    runInstructionJumpIfTrue(inst) {
        var p1 = this.readparametervalue(inst, 0);
        var p2 = this.readparametervalue(inst, 1);
        if (p1 != 0) {
            this.reader.seek(p2);
        }
        return true;
    }

    runInstructionJumpIfFalse(inst) {
        var p1 = this.readparametervalue(inst, 0);
        var p2 = this.readparametervalue(inst, 1);
        if (p1 == 0) {
            this.reader.seek(p2);
        }
        return true;
    }

    runInstructionHalt(inst) {
        this.halted = true;
        return true;
    }

    runInstructionReadInput(inst) {
        if (this.programinput.length == 0) {
            // input queue is empty, block.
            return false;
        }

        var value = this.programinput.shift();
        if (this.verbose) {
            console.log(`returning input ${value}`)
        }

        var p1 = this.writeparameteroffset(inst, 0);
        this.reader.writeAt(p1, value);
        return true;
    }

    runInstructionWriteOutput(inst) {
        var value = this.readparametervalue(inst, 0);
        if (this.verbose) {
            console.log(`${this.name}: writing to output: ${value}`);
        }
        this.programoutput.push(value);
        this.onOutput && this.onOutput(value);
        return true;
    }

    runInstructionAddRelativeBase(inst) {
        var p1 = this.readparametervalue(inst, 0);
        this.relative_base += p1;
        if (this.verbose) {
            console.log(`${this.name}: relative base set to ${this.relative_base}`);
        }
        return true;
    }

    runInstruction(inst) {
        console.log(`${this.name}: Run instruction: ${inst.string()} // ${inst.comment()}`);
        switch(inst.op) {
            case Operators.Add:
                return this.runInstructionAdd(inst);
            case Operators.Multiply:
                return this.runInstructionMultiply(inst);
            case Operators.Equals:
                return this.runInstructionEquals(inst);
            case Operators.LessThan:
                return this.runInstructionLessThan(inst);
            case Operators.JumpIfFalse:
                return this.runInstructionJumpIfFalse(inst);
            case Operators.JumpIfTrue:
                return this.runInstructionJumpIfTrue(inst);
            case Operators.Halt:
                return this.runInstructionHalt(inst);
            case Operators.AddRelativeBase:
                return this.runInstructionAddRelativeBase(inst);
            case Operators.ReadInput:
                return this.runInstructionReadInput(inst);
            case Operators.WriteOutput:
                return this.runInstructionWriteOutput(inst);
        }

        return false;
    }

    step() {
        if (this.halted) {
            console.log(`${this.name}: [#${this.pc}] is halted`);
            return false;
        }

        if (this.reader.eof()) {
            this.halted = true;
            console.log(`${this.name}: [#${this.pc}] program out of bounds`);
            return false;
        }

        this.pc_before = this.reader.position();
        var inst = Instruction.parse(this.reader);
        if (inst) {
            // console.log(`${this.name}: memory before command: ${JSON.stringify(this.reader.memory.program)}`);
            if (this.runInstruction(inst)) {
                // console.log(`${this.name}: success.`);
                // console.log(`${this.name}: memory after command: ${JSON.stringify(this.reader.memory.program)}`);
                this.blocking = false;
            } else {
                console.log(`${this.name}: failed/blocking.`);
                this.blocking = true;
                this.reader.seek(this.pc_before); // undo reads.
            }
            return true;
        } else {
            console.log(`${this.name}: Failed to parse instruction`);
            return false;
        }

        return result;
    }
}

module.exports = {
    Runtime
}
