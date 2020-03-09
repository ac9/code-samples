#!/usr/bin/env node

"use strict";

/* jshint strict: true */
/* jshint node: true */
/* jshint unused: true */

var sim = require('../');

var reqCount = 0;

var workFunctionFactory = function(userIndex) {

    return function(waitTime) {

        return new sim.Promise(function(res) {

            console.log("User " + userIndex + ": Waited " + waitTime + " (ms)");
            reqCount++;

            res();

        });
    };
};

var nodename = process.argv[0].replace(/^.*[/]/, '');
var procname = process.argv[1].replace(/^.*[/]/, '');
var args = process.argv.slice(2);
if (args.length < 3 || args.length > 6) {
    console.log(`usage: ${nodename} ${procname} numberOfUsers meanArrivalRateEveryNSeconds durationInSeconds`);
    process.exit(1);
}

sim.simulate(parseInt(args[0]), parseFloat(args[1]), parseInt(args[2]), workFunctionFactory).then(function() {
    console.log(`Total work count: ${reqCount}`);
});
