/*
 *				 Apache License
 *                           Version 2.0, January 2004
 *                        http://www.apache.org/licenses/
 *
 *      Copyright (c) 2014 2015 2016 Dario Bruneo, Francesco Longo, Giovanni Merlino,
 *      Andrea Rocco Lotronto, Arthur Warnier, Nicola Peditto, Kostya Esmukov
 *
 */
"use strict";


var restartDrivers = require('./restart-drivers');
var mountDriver = require('./mount-driver');
var unmountDriver = require('./unmount-driver');

var driversState = require('./_state');

/**
 * Drivers subsystem singleton
 */
var Drivers = module.exports = {};


/**
 * Returns DriversState
 *
 * @returns {DriversState}
 */
Drivers.getState = function () {
    return driversState;
};




/**
 * Ensures that all the required drivers are mounted.
 *
 * Should be called on LR process initialization.
 *
 * Ex-exports.restartDrivers , with reconnected == false
 *
 * @returns {Q.Promise}
 */
// Drivers.automountDrivers = function () {
//     return restartDrivers(false);
// };


// todo
/**
 * Ensures that all the required drivers are mounted.
 *
 * Should be called on WAMP connection restoration.
 *
 * Ex-exports.restartDrivers , with reconnected == true
 *
 * @returns {Q.Promise}
 */
Drivers.checkDrivers = function () {
    // todo
    return restartDrivers(true);
};


/**
 * Mounts a driver
 *
 * @param driverName
 * @param remote todo ?????????
 * @param mirrorBoard todo ?????????
 * @returns {Q.Promise}
 */
Drivers.mountDriver = function (driverName, remote, mirrorBoard) {
    return mountDriver(driverName, remote, mirrorBoard);
};


// todo
Drivers.unmountDriver = function (driverName) {
    // todo

    return unmountDriver(driverName, restarting);
};


Drivers.injectDriver = function (driverName, driverJsCodeString, driverConf, autostart) {
    // todo
};


Drivers.removeDriver = function (driverName) {
    // todo
};
