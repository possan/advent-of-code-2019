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

function parsegrid(input) {
    var grid = input.split('\n').map(l => l.trim().split(''));
    return grid;
}

function isunique(sequence) {
    return [...new Set(sequence)].length == 5;
}

module.exports = {
    isunique,
    parselist,
    parsegrid,
    assert
}

