/*
--- Day 4: Secure Container ---
You arrive at the Venus fuel depot only to discover it's protected by a password. The Elves had written the password on a sticky note, but someone threw it out.

However, they do remember a few key facts about the password:

It is a six-digit number.
The value is within the range given in your puzzle input.
Two adjacent digits are the same (like 22 in 122345).
Going from left to right, the digits never decrease; they only ever increase or stay the same (like 111123 or 135679).
Other than the range rule, the following are true:

111111 meets these criteria (double 11, never decreases).
223450 does not meet these criteria (decreasing pair of digits 50).
123789 does not meet these criteria (no double).
How many different passwords within the range given in your puzzle input meet these criteria?

Your puzzle input is 130254-678275.
*/

function assert(name, actual, expected) {
    if (actual === expected) {
        console.log(`✅ ${name} Ok`)
    } else {
        console.log(`❌ ${name} Failed, expected ${expected} but got ${actual}`)
    }
}

function test(input, testpart2) {
    // console.log('input', input);

    if (input.length != 6) {
        // console.log('wrong length');
        return false;
    }

    var digits = {};
    var pairs = []
    for (var i=0; i<5; i++) {
        const a = input[i];
        const b = input[i + 1];
        pairs.push([a, b]);
    }
    for (var i=0; i<6; i++) {
        digits[input[i]] = (~~digits[input[i]]) + 1;
    }
    // console.log('pairs', pairs);
    // console.log('digits', digits);

    // Two adjacent digits are the same (like 22 in 122345).
    var adjacents = pairs.filter(x => x[0] == x[1]).length;
    // console.log('num adjacents', adjacents);
    if (adjacents == 0) {
        // console.log('no adjacents');
        return false;
    }

    // Going from left to right, the digits never decrease; they only ever increase or stay the same (like 111123 or 135679).
    var decreasing = pairs.filter(x => x[1] < x[0]).length;
    // console.log('num decreasing', decreasing);
    if (decreasing > 0) {
        // console.log('decreasing numbers');
        return false;
    }

    if (testpart2) {
        // part 2
        var singlepairs = pairs.filter(x => (x[0] == x[1]) && (digits[x[0]] == 2)).length;
        // console.log('singlepairs', singlepairs);
        if (singlepairs == 0) {
            // console.log('not only one pair');
            return false;
        }
    }

    console.log(`valid: ${input}`);
    return true;
}

console.log('part 1:');
// part 1
assert('111111', test('111111', false), true);
assert('223450', test('223450', false), false);
assert('123768', test('123768', false), false);
assert('123444', test('123444', false), true);
console.log();

// part 2
console.log('part 2:');
assert('112233', test('112233', true), true);
assert('123444', test('123444', true), false);
assert('111122', test('111122', true), true);
console.log();

var count1 = 0;
var count2 = 0;
for(var i=130254; i<=678275; i++) {
    if (i % 1000 === 0) console.log(`${i} ...`);
    if (test(`${i}`, false)) count1 ++;
    if (test(`${i}`, true)) count2 ++;
}
console.log('count1 = ' + count1);
console.log('count2 = ' + count2);

