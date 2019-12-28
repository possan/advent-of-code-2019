const PATH = 'R,6,L,8,R,8,R,6,L,8,R,8,R,4,R,6,R,6,R,4,R,4,L,8,R,6,L,10,L,10,R,4,R,6,R,6,R,4,R,4,L,8,R,6,L,10,L,10,R,4,R,6,R,6,R,4,R,4,L,8,R,6,L,10,L,10,R,6,L,8,R,8,L,8,R,6,L,10,L,10'.split(',');
// const PATH = 'X,1,X,2,X,1,X,2'.split(',');

console.log('PATH', PATH.join(','));

var A = '';
var B = '';
var C = '';

var alldupes = [];

// pass 1 - find all duplicates

var previous = '';
for(var j=Math.min(PATH.length, 10); j>=4; j--) {
    console.log('finding duplicates of length', j);

    for(var o=0; o<=PATH.length - j; o+=2) {
        var s1 = PATH.slice(o, o + j).join(',');
        var any = 0;

        for(var o2=0; o2<=PATH.length - j; o2+=2) {
            var s2 = PATH.slice(o2, o2 + j).join(',');
            // console.log(`compare offset ${o} (${s1}) to ${o2} (${s2})`);

            if (o != o2) {
                // if (s1.indexOf('A'))
                if (s1 == s2 && o2 >= o + j) {
                    console.log(`match: offset ${o} to ${o2} (${PATH.length - j} outside)`, s1);
                    any ++;
                }
            }
        }

        if (s1 != previous) {
            if (!alldupes.find(d => d.pattern == s1)) {
                alldupes.push({
                    pattern: s1,
                    offset: o,
                    length: j,
                    dupes: any,
                });
                previous = s1;
            }
        }
    }

    console.log();
}

console.log(`All duplicates: (${alldupes.length})`);
alldupes.forEach(d => {
    console.log(d);
});
console.log();

// pass 2 find all triplets

var alltriplets = [];
var tot = 0;
console.log('Estimation', alldupes.length*alldupes.length*alldupes.length)
alldupes.forEach((d3, i3) => {
    // console.log('i3', i3);
    alldupes.forEach((d2, i2) => {
        alldupes.forEach((d1, i1) => {
            if (i1 < i2 && i2 < i3) {
                if (i1 != i2 && i2 != i3 && i3 != i1) {
                    alltriplets.push([i1, i2, i3]);
                    tot ++;
                }
            }
        });
    });
});
console.log('Actual', tot);

function replaceAll(input, thing, replacement, replacement2) {
    var copy = [...input];
    for(var i=0; i<=copy.length - thing.length; i++) {
        var matching = 0;
        for(var j=0; j<thing.length; j++) {
            if (copy[i + j] == thing[j]) {
                matching ++;
            }
        }
        if (matching == thing.length) {
            for(var j=0; j<thing.length; j++) {
                copy[i + j] = j == 0 ? replacement : replacement2;
            }
        }
    }
    return copy;
}

console.log(`All triplets: (${alltriplets.length})`);
var workingtriplets = [];
alltriplets.forEach((d, i) => {
    if (i % 1000 == 0) {
        console.log(`Trying ${i} / ${alltriplets.length}`);
    }

    var i1 = d[0];
    var i2 = d[1];
    var i3 = d[2];

    var d1 = alldupes[i1];
    var d2 = alldupes[i2];
    var d3 = alldupes[i3];
    // console.log('Trying 1', JSON.stringify(d1));
    // console.log('Trying 2', JSON.stringify(d2));
    // console.log('Trying 3', JSON.stringify(d3));

    var P = [...PATH];
    P = replaceAll(P, d1.pattern.split(','), 'a', '.');
    P = replaceAll(P, d2.pattern.split(','), 'b', '.');
    P = replaceAll(P, d3.pattern.split(','), 'c', '.');
    // console.log('After', P.join(','));
    // console.log();

    if (P.filter(i => i != 'a' && i != 'b' && i != 'c' && i != '.').length == 0) {
        console.log('Match ', d);
        console.log('Before', PATH.join(','));
        console.log('Clean ', JSON.stringify(d1), JSON.stringify(d2), JSON.stringify(d3));
        console.log('A:', JSON.stringify(d1));
        console.log('B:', JSON.stringify(d2));
        console.log('C:', JSON.stringify(d3));
        console.log('After', P.join(','));
        console.log();
    }
});

// console.log();
