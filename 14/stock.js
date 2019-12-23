var {assert} = require('./utils.js');

class Produce {
    constructor (id, amount) {
        this.id = id;
        this.amount = amount;
        this.consumed = 0;
    }

    static parse(line) {
        var [amount, id] = line.split(' ');
        if (id && amount) {
            id = id.trim();
            amount = ~~amount.trim();
            return new Produce(id, amount);
        }
        return undefined;
    }

    copy() {
        return new Produce(this.id, this.amount);
    }

    string(includeconsumed) {
        if (includeconsumed) {
            return `[${this.consumed}/${this.amount} x ${this.id}]`;
        }
        return `[${this.amount} x ${this.id}]`;
    }
}

class Stock {
    constructor() {
        this._stock = [];
        this._demand = [];
    }

    clear() {
        this._stock = [];
        this._demand = [];
    }

    copy() {
        var c = new Stock();
        this._stock.forEach(i => c.add(i.copy()));
        return c;
    }

    add(item) {
        var matchingitem = this._stock.find(s => s.id === item.id);
        if (matchingitem) {
            matchingitem.amount += item.amount;
        } else {
            this._stock.push(item.copy());
        }
    }

    available(item) {
        if (item.amount == 0) {
            return true;
        }

        var matchingitem = this._stock.find(s => s.id === item.id);
        if (matchingitem) {
            if (matchingitem.amount >= item.amount) {
                return true;
            }
        }

        return false;
    }

    demand(id) {
        var matchingitem = this._demand.find(s => s.id === id);
        if (matchingitem) {
            return matchingitem.amount;
        }
        return 0;
    }

    amount(id) {
        var matchingitem = this._stock.find(s => s.id === id);
        return matchingitem ? matchingitem.amount : 0;
    }

    increaseDemand(item) {
        var matchingitem = this._demand.find(s => s.id === item.id);
        if (matchingitem) {
            matchingitem.amount += item.amount;
        } else {
            var p = new Produce(item.id, item.amount);
            this._demand.push(p);
        }
        this._demand = this._demand.filter(d => d.amount > 0);
    }

    decreaseDemand(item) {
        var matchingitem = this._demand.find(s => s.id === item.id);
        if (matchingitem) {
            matchingitem.amount -= item.amount;
        }
        this._demand = this._demand.filter(d => d.amount > 0);
    }

    consume(item) {
        var matchingitem = this._stock.find(s => s.id === item.id);
        if (matchingitem) {
            // if (matchingitem.amount >= item.amount) {
            matchingitem.amount -= item.amount;
            // }
        } else {
            this._stock.push(new Produce(item.id, -item.amount));
        }
        this._stock = this._stock.filter(d => d.amount > 0);
    }

    string() {
        this._stock.sort((a, b) => {return a.id - b.id});
        return this._stock.map(s => s.string()).join(' ');
    }

    string2() {
        this._demand.sort((a, b) => {return a.id - b.id});
        return this._demand.map(s => s.string()).join(' ');
    }
}

// var s1 = new Stock();
// s1.add(new Produce('A', 3));
// assert('Stock.add test 1', s1.string(), '[3 x A]');
// s1.add(new Produce('A', 5));
// assert('Stock.add test 2', s1.string(), '[8 x A]');;
// assert('Stock.available test 3', s1.available(new Produce('A', 2)).toString(), 'true');
// assert('Stock.available test 4', s1.available(new Produce('B', 1)).toString(), 'false');
// assert('Stock.available test 5', s1.available(new Produce('C', 0)).toString(), 'true');
// s1.consume(new Produce('A', 2));
// assert('Stock.consume test 6', s1.string(), '[6 x A]');
// s1.consume(new Produce('A', 3));
// assert('Stock.consume test 7', s1.string(), '[3 x A]');
// assert('Stock.amount test 7', s1.amount('A'), 3);
// s1.consume(new Produce('A', 2));
// assert('Stock.consume test 8', s1.string(), '[1 x A]');
// assert('Stock.amount test 9', s1.amount('A'), 1);
// s1.consume(new Produce('A', 2));
// assert('Stock.amount test 10', s1.amount('A'), -1);

// assert('Produce.parse test 1', Produce.parse('5 ORE').string(), '[5 x ORE]');
// assert('Produce.parse test 2', Produce.parse('ORE'), undefined);
// assert('Produce.parse test 3', Produce.parse('56'), undefined);

module.exports = {
    Produce,
    Stock,
}
