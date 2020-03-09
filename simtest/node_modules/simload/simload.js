#!/usr/bin/env node

"use strict";

/* jshint strict: true */
/* jshint node: true */
/* jshint unused: true */

var Prom = require('bluebird');

var nextArrivalInSecondsWithRate = function(meanArrivalRate) {

    // meanArrivalRate is measured in the average number of elapsed seconds
    // before the next event.

    return -Math.log(1.0 - Math.random()) / (1.0 / meanArrivalRate);
};

var simUserIter = function(meanArrivalRate, workFunction, stopTime, prevWorkTime, callback) {

    var waitTm = Math.round(nextArrivalInSecondsWithRate(meanArrivalRate) * 1000.0) - prevWorkTime;
    waitTm = (waitTm < 0 || isNaN(waitTm)) ? 0 : waitTm;
    setTimeout(function() {

        var startTime = (new Date().getTime());

        workFunction(waitTm).then(function() {

            var endTime = (new Date().getTime());

            if (endTime < stopTime) {
                var prevWorkElapsedTime = endTime - startTime;
                simUserIter(meanArrivalRate, workFunction, stopTime, prevWorkElapsedTime, callback);
            } else {
                callback();
            }
        });

    }, waitTm);

};

var simUserArrivals = function(meanArrivalRate, workFunction, durationInSeconds, callback) {

    var stopTime = (new Date().getTime()) + durationInSeconds * 1000;
    simUserIter(meanArrivalRate, workFunction, stopTime, 0, callback);
};

var simConcurrentUsers = function(numberOfUsers, meanArrivalRate, durationInSeconds, functionFactory) {

    var simUser = Prom.promisify(simUserArrivals);

    var users = [];

    for (var i = 0; i < numberOfUsers; i++) {
        users.push(simUser(meanArrivalRate, functionFactory(i), durationInSeconds));
    }

    return Prom.all(users);
};

module.exports = {
    'Promise': Prom,
    'simulate': simConcurrentUsers
};
