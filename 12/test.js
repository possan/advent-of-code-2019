var crypto = require('crypto');

class BodySnapshot {
    constructor(x, y, z, vx, vy, vz) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.hash = JSON.stringify(this);
        //     this.x * 109 +
        //     this.y * 10007 +
        //     this.z * 1000005 +
        //     this.vx * 100000003 +
        //     this.vy * 10000000001 +
        //     this.vz * 1;
    }
}

class Snapshot {
    constructor(bodies) {
        this.bodies = bodies;
        this.hash = JSON.stringify(bodies.map(b => b.hash));
        // this.bodies.forEach(b => this.hash += b.hash);
    }
}

class Body {
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
    }

    potentialenergy() {
        var pot = Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
        return pot;
    }

    kineticenergy() {
        var kin = Math.abs(this.vx) + Math.abs(this.vy) + Math.abs(this.vz);
        return kin;
    }

    totalenergy() {
        return this.potentialenergy() * this.kineticenergy();
    }

    print() {
        console.log(`  pos=<${this.x} ${this.y} ${this.z}> vel=<${this.vx} ${this.vy} ${this.vz}> pot=${this.potentialenergy()} kin=${this.kineticenergy()} tot=${this.totalenergy()}`);
    }

    gravity(otherbody) {
        if (this.x < otherbody.x) {
            this.vx += 1;
            otherbody.vx -= 1;
        }
        if (this.x > otherbody.x) {
            this.vx -= 1;
            otherbody.vx += 1;
        }
        if (this.y < otherbody.y) {
            this.vy += 1;
            otherbody.vy -= 1;
        }
        if (this.y > otherbody.y) {
            this.vy -= 1;
            otherbody.vy += 1;
        }
        if (this.z < otherbody.z) {
            this.vz += 1;
            otherbody.vz -= 1;
        }
        if (this.z > otherbody.z) {
            this.vz -= 1;
            otherbody.vz += 1;
        }
    }

    applyVelocity() {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
    }

    hash() {
        return [this.x,this.vx].join(',');
    }

    hash2() {
        return [this.y,this.vy].join(',');
    }

    hash3() {
        return [this.z,this.vz].join(',');
    }
}

function run() {
    // Example 1
    // <x=-1, y=0, z=2>
    // <x=2, y=-10, z=-7>
    // <x=4, y=-8, z=8>
    // <x=3, y=5, z=-1>
    // var b0 = new Body(-1, 0, 2);
    // var b1 = new Body(2, -10, -7);
    // var b2 = new Body(4, -8, 8);
    // var b3 = new Body(3, 5, -1);

    // Example 2
    // <x=-8, y=-10, z=0>
    // <x=5, y=5, z=10>
    // <x=2, y=-7, z=3>
    // <x=9, y=-8, z=-3>
    // var b0 = new Body(-8, -10, 0);
    // var b1 = new Body(5, 5, 10);
    // var b2 = new Body(2, -7, 3);
    // var b3 = new Body(9, -8, -3);

    // Test 1
    // <x=0, y=4, z=0>
    // <x=-10, y=-6, z=-14>
    // <x=9, y=-16, z=-3>
    // <x=6, y=-1, z=2>
    var b0 = new Body(0, 4, 0);
    var b1 = new Body(-10, -6, -14);
    var b2 = new Body(9, -16, -3);
    var b3 = new Body(6, -1, 2);

    var bodies = [b0, b1, b2, b3];

    var pairs = [
        [b0, b1],
        [b0, b2],
        [b0, b3],
        [b1, b2],
        [b1, b3],
        [b2, b3]
    ];

    var snapshots = [];
    var snapshots2 = [];
    var snapshots3 = [];
    var snapshotset = new Set();

    var step = 0;

    // while(true) {
    // }

    for(var step=0; step<=10000000; step++) {
        var snapshot = bodies.map(b => b.hash()).join(',');
        var snapshot2 = bodies.map(b => b.hash2()).join(',');
        var snapshot3 = bodies.map(b => b.hash3()).join(',');

        // snapshot = crypto.createHash('md5').update(snapshot).digest("hex")
        if (step % 10000 === 0) {
            // console.log('step #' + step);
            // bodies.forEach(b => b.print());
            // var sum = 0;
            // bodies.forEach(b => sum += b.totalenergy());
            // console.log('total energy ' + sum);
            // console.log(`snapshot ${snapshot} ${snapshot2} ${snapshot3}`);
            // console.log();
        }

        // if (snapshotset.has(snapshot)) {
        //     console.log(`Found snapshot ${snapshot} in set`);
        var previousindex = snapshots.indexOf(snapshot);
        if (previousindex != -1) {
            console.log(`Step (X) repeats at ${step}`);
            // return;
        }
        previousindex = snapshots2.indexOf(snapshot2);
        if (previousindex != -1) {
            console.log(`Step (Y) repeats at ${step}`);
            // return;
        }
        previousindex = snapshots3.indexOf(snapshot3);
        if (previousindex != -1) {
            console.log(`Step (Z) repeats at ${step}`);
            // return;
        }
        // }
        if (snapshots.length < 1) {
            snapshots.push(snapshot);
            snapshots2.push(snapshot2);
            snapshots3.push(snapshot3);
            // snapshotset.add(snapshot);
        }

        pairs.forEach(p => p[0].gravity(p[1]));
        bodies.forEach(b => b.applyVelocity());
        // step ++;
    }



}

run();
