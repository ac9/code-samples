# simload

This is an npm module used to simulate a load profile of a general work defined through a function.

##Introduction

At pVelocity Inc. we have a need to simulate load profiles against certain services. We needed to generate a load profile based on the following model:

<img src="https://s3-us-west-2.amazonaws.com/pvmarketing/Images/simload.svg.xml.svg"/>

##Get Started

```js
var sim = require('../');

var reqCount = 0;

var workFunctionFactory = function(userIndex) {

    return function(waitTime) {

        return new sim.Promise(function(res) {

            /* Do work here */

            console.log("User " + userIndex + ": Waited " + waitTime + " (ms)");
            reqCount++;

            res();

        });
    };
};

sim.simulate(2, 0.5, 5, workFunctionFactory).then(function() {
    console.log(`Total work count: ${reqCount}`);
});

```

The main call is ``` sim.simulate ```. The first three arguments respectively specifies:

* The number of ``` N ``` concurrent users to simulate
* The average period (``` p ```) in seconds in between the trigger of successive work loads. This time includes the elapsed time of the work load itself. Therefore, if this time is shorter than the work load time, then the next work load will be immediately executed. This argument is a floating point number.
* The third parameter indicates how many seconds (an integer ``` t ```) should the simulation run. The simulation will run for at least this time frame. Note that since p is a random interval, it is highly likely that the actual simulation duration will be longer than ``` t ```.

The last argument is a function that will return the actual work load function for a specific simulated user. The work load function returned must be able to accept an optional argument indicating the amount of time waited by the simulated user prior to the triggering of the work. In this example, we have ``` workFunctionFactory ``` that simply creates a Promise that resolves into displaying the amount of time the simulated user waited before triggering the work load.

The ``` simulate ``` function returns a Promise.

If you want each user to do something different, you can use the ``` userIndex ``` to decide on which work load function to return.

###Sample Output

```js

User 0: Waited 1130 (ms)
User 0: Waited 177 (ms)
User 1: Waited 1392 (ms)
User 1: Waited 459 (ms)
User 1: Waited 27 (ms)
User 1: Waited 220 (ms)
User 1: Waited 62 (ms)
User 1: Waited 150 (ms)
User 0: Waited 1048 (ms)
User 0: Waited 52 (ms)
User 0: Waited 498 (ms)
User 1: Waited 1293 (ms)
User 1: Waited 458 (ms)
User 0: Waited 1710 (ms)
User 0: Waited 148 (ms)
User 0: Waited 123 (ms)
User 1: Waited 1152 (ms)
User 0: Waited 944 (ms)
Total work count: 18

```

Each run will provide different results due to the random variables introduced in the algorithm. However, one should expect that the ```Total work count``` should be close to 20. Two concurrent users performing a work load every 0.5 seconds, and the duration of the simulation is 5 seconds (2 * 1 / ~0.5 * 5 = ~20)

##License

Copyright (c) 2016, pVelocity Inc

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.