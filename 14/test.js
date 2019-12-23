var {assert, parselist} = require('./utils.js')
var {Produce, Stock} = require('./stock.js')

// this shit took 2+ days and i failed to figure it out, then someone said topological sort.

class Consumer {
    constructor(id, required) {
        this.id = id
        this.required = required
    }

    string() {
        return `[${this.required} x ${this.id}]`
    }
}

class Producer {
    constructor() {
        this.output = null;
        this.dependencies = [];
    }

    static parse(line) {
        var [inputs, output] = line.split('=>')
        inputs = inputs.split(',').map(i => Produce.parse(i.trim())).filter(t => !!t);
        output = Produce.parse(output.trim())
        if (output && inputs) {
            var p = new Producer();
            p.output = output;
            p.dependencies = inputs.map(i => {
                var c = new Consumer(i.id, i.amount);
                return c;
            });
            return p;
        }
        return undefined;
    }

    name() {
        return `${this.output.id}-Producer`;
    }

    string(includeconsumed) {
        return `${this.dependencies.map(d => d.string(includeconsumed)).join(' + ')} => ${this.output.string()}`
    }
}


class Factory {
    constructor(stock) {
        this.producers = [];
        this.inbox = new Stock();
        this.newdeps = new Stock();
        this.outtotal = new Stock();
        this.leafs = new Stock();
        this.totalreq = new Stock();
        this.depcount = new Stock();
        this.revdepcount = new Stock();
        this.flatorder = [];
        this.request = {};
        this.order = [];
        this.leafids = [];
        this.orderbyid = {};
        this.workorder = [];
        this.reversedeps = [];
    }

    addProducer(producer) {
        this.producers.push(producer);
    }

    findProducer(id) {
        return this.producers.find(p => p.output.id == id);
    }

    presort(targetid, depth=0) {
        var prefix = '';
        for(var i=0; i<depth; i++) prefix += '  ';

        this.order.push([targetid, depth]);

        var p = this.findProducer(targetid);
        if (p) {
            console.log(`${prefix}${targetid}:`);
            p.dependencies.forEach(d => {
                this.depcount.add(new Produce(targetid, 1));
                this.revdepcount.add(new Produce(d.id, 1));
                this.presort(d.id, depth + 1);
            });
            // console.log();
        }
    }

    sort() {
        var deepest = {};
        this.order.forEach(o => {
            var [id, depth] = o;
            deepest[id] = Math.max(deepest[id] || 0, depth);
        });
        console.log('deepest', deepest);
        this.orderbyid = deepest;

        var byindex = [];
        Object.keys(deepest).forEach(k => {
            var v = deepest[k];
            // console.log('k', k, v);
            if (byindex[v] === undefined) {
                byindex[v] = [];
            }
            byindex[v].push(k);
        });
        console.log('byindex', byindex);
        this.workorder = byindex;
        this.order = byindex;
        console.log('depcount', this.depcount.string());

        this.revdepcount._stock = this.revdepcount._stock.filter(t => t.amount > 1);
        console.log('rev. depcount', this.revdepcount.string());

        this.flatorder = [];
        this.workorder.forEach(o => {
            o.forEach(i => {
                this.flatorder.push(i);
            });
        });
        console.log('flatorder', this.flatorder);
    }

    recurse(targetid, targetamount) {
        this.request = {};
        this.request[targetid] = targetamount;

        this.flatorder.forEach(id => {
            var requested = this.request[id];
            // console.log('id', id, 'requested', requested);

            var p = this.findProducer(id);
            if (p) {
                p.dependencies.forEach(d => {
                    var amt = Math.ceil(requested / p.output.amount) * d.required;
                    // console.log('dep', d.id, amt);
                    this.request[d.id] = (this.request[d.id] || 0) + amt;
                });
            }
        });

        return this.request['ORE'];
    }
}



function run(input) {
    var producers = input.split('\n').map(l => Producer.parse(l.trim())).filter(e => e);

    var stock = new Stock();
    var factory = new Factory(stock);
    producers.forEach(p => factory.addProducer(p));

    console.log('Rules');
    factory.producers.forEach(p => {
        console.log('  ' + p.string());
    });
    console.log();

    factory.presort('FUEL', 0);
    factory.sort();
    console.log();

    console.log('Order:', factory.order);
    console.log();

    var ores = factory.recurse('FUEL', 1)
    console.log('Ores', ores);

    console.log();

    const tril = 1000000000000;

    for(var i= 2500000; i<4000000; i++) {
        var f = i;
        var ores = factory.recurse('FUEL', f);
        console.log('Fuel', f, 'Ores', ores, 'd', tril - ores);
    }

    console.log();

    return ores;
}


function assertrun(name, program, expected) {
    var actual = run(program);
    assert(name, actual, expected);
}

// assertrun(
//     'Example 2',
//     `9 ORE => 2 A
//     8 ORE => 3 B
//     7 ORE => 5 C
//     3 A, 4 B => 1 AB
//     5 B, 7 C => 1 BC
//     4 C, 1 A => 1 CA
//     2 AB, 3 BC, 4 CA => 1 FUEL`,
//     165
// );

// assertrun(
//     'Example 3',
//     `157 ORE => 5 NZVS
//     165 ORE => 6 DCFZ
//     44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL
//     12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ
//     179 ORE => 7 PSHF
//     177 ORE => 5 HKGWZ
//     7 DCFZ, 7 PSHF => 2 XJWVT
//     165 ORE => 2 GPVTF
//     3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT`,
//     13312
// );

// assertrun(
//     'Example 4',
//     `2 VPVL, 7 FWMGM, 2 CXFTF, 11 MNCFX => 1 STKFG
//     17 NVRVD, 3 JNWZP => 8 VPVL
//     53 STKFG, 6 MNCFX, 46 VJHF, 81 HVMC, 68 CXFTF, 25 GNMV => 1 FUEL
//     22 VJHF, 37 MNCFX => 5 FWMGM
//     139 ORE => 4 NVRVD
//     144 ORE => 7 JNWZP
//     5 MNCFX, 7 RFSQX, 2 FWMGM, 2 VPVL, 19 CXFTF => 3 HVMC
//     5 VJHF, 7 MNCFX, 9 VPVL, 37 CXFTF => 6 GNMV
//     145 ORE => 6 MNCFX
//     1 NVRVD => 8 CXFTF
//     1 VJHF, 6 MNCFX => 4 RFSQX
//     176 ORE => 6 VJHF`,
//     180697
// );

// assertrun(
//     'Example 5',
//     `171 ORE => 8 CNZTR
//     7 ZLQW, 3 BMBT, 9 XCVML, 26 XMNCP, 1 WPTQ, 2 MZWV, 1 RJRHP => 4 PLWSL
//     114 ORE => 4 BHXH
//     14 VRPVC => 6 BMBT
//     6 BHXH, 18 KTJDG, 12 WPTQ, 7 PLWSL, 31 FHTLT, 37 ZDVW => 1 FUEL
//     6 WPTQ, 2 BMBT, 8 ZLQW, 18 KTJDG, 1 XMNCP, 6 MZWV, 1 RJRHP => 6 FHTLT
//     15 XDBXC, 2 LTCX, 1 VRPVC => 6 ZLQW
//     13 WPTQ, 10 LTCX, 3 RJRHP, 14 XMNCP, 2 MZWV, 1 ZLQW => 1 ZDVW
//     5 BMBT => 4 WPTQ
//     189 ORE => 9 KTJDG
//     1 MZWV, 17 XDBXC, 3 XCVML => 2 XMNCP
//     12 VRPVC, 27 CNZTR => 2 XDBXC
//     15 KTJDG, 12 BHXH => 5 XCVML
//     3 BHXH, 2 VRPVC => 7 MZWV
//     121 ORE => 7 VRPVC
//     7 XCVML => 6 RJRHP
//     5 BHXH, 4 VRPVC => 5 LTCX`,
//     2210736
// );

assertrun(
    'Test 1',
    `8 SPJN, 2 LJRB, 1 QMDTJ => 1 TFPRF
    111 ORE => 5 GCFP
    5 NGCKP => 6 QXQZ
    21 RGRLZ => 7 DKVN
    2 DCKF => 9 FCMVJ
    7 SGHSV, 4 LZPCS => 9 DQRCZ
    4 QNRH => 8 WGKHJ
    135 ORE => 6 BPLFB
    4 SPJN, 1 DCKF, 9 KJVZ, 1 DKVN, 4 ZKVPL, 11 TFPRF, 1 CWPVT => 8 BVMK
    8 TGPV, 4 MQPLD => 2 SPFZ
    11 QMDTJ, 15 LVPK, 5 LZPCS => 3 KJVZ
    2 RNXF, 3 MKMQ => 6 LJRB
    11 RKCXJ, 4 BJHW, 2 DKDST => 3 QNRH
    3 NZHP, 1 QMDTJ => 9 BCMKN
    10 DQRCZ, 1 GBJF => 7 RGRLZ
    2 WLKC, 1 GBJF, 7 SPJN => 5 GBWQT
    4 TGPV, 1 LTSB => 2 LZPCS
    6 LJRB => 4 LQHB
    3 LZPCS, 3 MDTZL, 12 DLHS => 2 CBTK
    1 TGPV, 1 CQPR => 9 XQZFV
    26 FSQBL => 8 HQPG
    9 LQHB => 1 GBJF
    7 NGCKP => 5 WLKC
    9 DKDST, 1 XQZFV => 9 TPZBM
    144 ORE => 9 RNXF
    1 LJRB => 6 CQPR
    9 MKMQ, 12 RNXF => 9 JWPLZ
    5 LZPCS, 28 QMDTJ, 1 QNRH => 5 LVPK
    5 TGPV, 1 HQPG => 6 FCBLK
    8 LVPK, 9 DQRCZ, 1 MDTZL => 6 DCKF
    1 RKCXJ, 2 LZPCS, 13 LJNJ => 1 QWFG
    4 DKDST, 1 XQZFV, 10 NSXFK => 4 JRDXQ
    7 QWFG, 1 BVMK, 4 BJHW, 21 QNSWJ, 3 FBTW, 3 FCBLK, 59 SPFZ, 4 GBWQT => 1 FUEL
    28 LZPCS, 17 NGCKP, 1 MQPLD => 5 MDTZL
    1 FCBLK, 5 WGKHJ => 7 ZKVPL
    7 LJNJ => 9 BLDJP
    11 FSQBL, 2 BCMKN, 1 CBTK => 9 CWPVT
    1 BJHW => 1 MQPLD
    11 SGHSV, 3 LJNJ => 1 NGCKP
    2 FSQBL, 7 FCBLK, 1 CQPR => 4 RKCXJ
    1 JRDXQ => 4 SGHSV
    107 ORE => 6 MKMQ
    1 DQRCZ, 3 QMDTJ, 9 XQZFV => 4 FZVH
    6 NSXFK, 1 MKMQ => 6 DLHS
    4 CQPR, 1 RNXF, 1 HQPG => 5 DKDST
    9 RNXF => 8 LTZTR
    1 LTSB, 8 BLDJP => 4 SPJN
    1 FCBLK => 4 LJNJ
    1 NGCKP => 3 NZHP
    11 LZPCS, 22 DQRCZ, 1 QWFG, 1 QXQZ, 6 DKVN, 16 FZVH, 3 MQPLD, 23 HQPG => 3 QNSWJ
    26 DLHS, 1 NSXFK => 9 BJHW
    3 FCBLK, 10 HQPG => 3 LTSB
    10 LTZTR, 13 JWPLZ, 16 FSQBL => 4 TGPV
    11 LTSB, 1 XQZFV, 3 DQRCZ => 4 CZCJ
    1 HQPG, 12 XQZFV, 17 TPZBM => 6 QMDTJ
    2 LTZTR => 7 FSQBL
    1 GCFP, 5 BPLFB => 1 NSXFK
    3 KJVZ, 1 QXQZ, 6 DKDST, 1 FCMVJ, 2 CZCJ, 1 QNRH, 7 WLKC => 4 FBTW`,
    502491
);