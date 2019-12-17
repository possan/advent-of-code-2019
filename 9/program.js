var { Instruction } = require('./instruction.js');
var { parselist } = require('./utils.js');

class ProgramMemory {
    constructor(program) {
        this.program = [];
        if (program) {
            this.program = parselist(program);
        }
    }
}

class ProgramReader {
    constructor(memory) {
        this.pc = 0;
        this.memory = memory;
    }

    seek(offset) {
        this.pc = offset;
    }

    position() {
        return this.pc;
    }

    writeAt(offset, value) {
        this.memory.program[offset] = value
    }

    readAt(offset) {
        return this.memory.program[offset] || 0;
    }

    eof() {
        return this.pc >= this.memory.program.length;
    }

    read() {
        if (this.eof()) {
            return undefined;
        }

        var value = this.memory.program[this.pc] || 0;
        this.pc ++;
        return value;
    }
}

class Disassembler {
    constructor (memory, name) {
        this.name = name || 'Unnamed';
        this.pc = 0;
        this.memory = memory;
        this.reader = new ProgramReader(memory);
        this.instructions = [];
        this.parse();
    }

    print() {
        console.log(`begin "${this.name}";`);
        console.log();
        this.instructions.forEach(inst => {
            console.log('  // ' + inst.comment());
            console.log('  ' + inst.string());
            console.log();
        });
        console.log('end;');
        console.log();
    }

    parseOne() {
        if (this.reader.eof()) {
            return false;
        }

        var result = Instruction.parse(this.reader);
        if (result) {
            // console.log('Parsed: ' + result.string());
            this.instructions.push(result);
            return true;
        } else {
            return false;
        }
    }

    parse() {
        var alive = true;
        while (alive) {
            if (!this.parseOne()) {
                alive = false;
            }
        }
        return true;
    }
}

module.exports = {
    ProgramReader,
    ProgramMemory,
    Disassembler,
}
