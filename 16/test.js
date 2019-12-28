var {assert, parselist} = require('./utils.js');

function iterOnce(input) {
    var numbers = input.split('').map(t => ~~t);
    // console.log('numbers', numbers);
    var num = numbers.length;
    var outdigits = new Array(num);
    for(var j=0; j<num; j++) {
        if (j % 10 == 0) console.log(`digit ${j} / ${num}`);
        var pattern = patternForIteration(j);
        var sum = 0;
        // var line = '  ';
        for(var i=0; i<num; i++) {
            var v = numbers[i];
            var p = pattern[(i + 1) % pattern.length];
            if (p != 0) sum += v * p;
            // if (i > 0) {
            //     line += ' + ';
            // }
            // line += `${v}*${p}`;
            // if (i % 1000 == 999) sum %= 10;
        }
        sum %= 10;
        // line += `   = ${sum} = ${sumdigit}`;
        // console.log(line);
        outdigits[j] = sum;
        delete pattern;
    }
    // console.log();
    return outdigits.join('');
}


// var pattern_cache = {};

function patternForIteration(iteration) {
    // if (pattern_cache[iteration]) {
    //     return pattern_cache[iteration];
    // }

    var base_pattern = [0, 1, 0, -1];
    var divider = 1 + iteration;
    var pattern = [];
    for(var j=0; j<4; j++) {
        for(var r=0; r<divider; r++) {
            pattern.push(base_pattern[j]);
        }
    }
    // pattern_cache[iteration] = pattern;
    return pattern;
}

function run(input, iterations) {
    var value = input;

    // console.log('input value', value);
    for(var i=0; i<iterations; i++) {
        console.log('iter', i);
        value = iterOnce(value);
        console.log('value', value);
    }
    return value;
}

function assertrun(name, input, iterations, expected) {
    var actual = run(input, iterations);
    var actual2 = actual.substring(0, 8);
    console.log('Actual', actual, actual2);
    assert(name, actual2, expected);
}

// assertrun('Small 1', '12345', 1, '48226158');

// assertrun('Test 1', '12345678', 1, '48226158');
// assertrun('Test 2', '12345678', 2, '34040438');
// assertrun('Test 3', '12345678', 3, '03415518');
// assertrun('Test 4', '12345678', 4, '01029498');

// assertrun('Large 1', '80871224585914546619083218645595', 100, '24176176');
// assertrun('Large 2', '19617804207202209144916044189917', 100, '73745418');
// assertrun('Large 3', '69317163492948606335995924319873', 100, '52432133');

var TESTSIGNAL = '59719896749391372935980241840868095901909650477974922926863874668817926756504816327136638260644919270589305499504699701736406883012172909202912675166762841246709052187371758225695359676410279518694947094323466110604412184843328145082858383186144864220867912457193726817225273989002642178918584132902751560672461100948770988856677526693132615515437829437045916042287792937505148994701494994595404345537543400830028374701775936185956190469052693669806665481610052844626982468241111349622754998877546914382626821708059755592288986918651172943415960912020715327234415148476336205299713749014282618817141515873262264265988745414393060010837408970796104077';
// assertrun('Test 1', TESTSIGNAL, 100, '32002835');
console.log('signal length', TESTSIGNAL.length);

var FULLSIGNAL = '';
for(var j=0; j<10000; j++) { FULLSIGNAL += TESTSIGNAL; }
console.log('signal length', FULLSIGNAL.length);

assertrun('Test 2', FULLSIGNAL, 1, '73745418');
