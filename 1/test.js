function launch(mass) {
    return Math.floor(mass / 3.0) - 2;
}

function test(mass) {
    let fuel = launch(mass);
    // console.log(`To launch with mass ${mass}, ${fuel} fuel is required.`);
    // console.log(`${fuel}`);
    return fuel;
}

function test2(mass) {
    let total = 0;
    let fuel = 0;
    fuel = test(mass);
    total += fuel;
    // console.log('fuel', fuel);
    while (fuel > 0) {
        fuel = test(fuel);
        if (fuel > 0) {
            // console.log('.fuel', fuel);
            total += fuel;
        }
    }
    // console.log('total', total);
    return total;
}

// test(12);
// test(14);
// test(1969);
// test(100756);

const tests = [
    56583,
    83363,
    127502,
    138143,
    113987,
    147407,
    111181,
    92655,
    79802,
    64636,
    108805,
    148885,
    51022,
    120002,
    52283,
    53573,
    142374,
    143523,
    121158,
    63332,
    63203,
    142400,
    105515,
    140150,
    89910,
    93081,
    129752,
    86731,
    128755,
    134756,
    131066,
    77990,
    77081,
    85779,
    137271,
    72889,
    117608,
    132442,
    115294,
    59414,
    75495,
    79459,
    107669,
    81496,
    144432,
    69138,
    53410,
    71199,
    141799,
    63964,
    110945,
    102174,
    87697,
    88838,
    93552,
    145531,
    54602,
    65080,
    66865,
    139693,
    98048,
    60409,
    88384,
    138807,
    130854,
    75997,
    130900,
    125974,
    129123,
    93480,
    86042,
    128187,
    74981,
    88144,
    96629,
    148836,
    124473,
    57616,
    93477,
    104174,
    97407,
    123017,
    85408,
    64862,
    85298,
    88142,
    62182,
    128983,
    62981,
    124580,
    56339,
    94335,
    125521,
    121373,
    78777,
    125132,
    94411,
    57789,
    97384,
    79900
];

let sum = 0;
tests.forEach(t => {
    sum += test(t);
});

console.log('star 1', sum);



test2(100756);


sum = 0;
tests.forEach(t => {
    sum += test2(t);
});

console.log('star 2', sum);
