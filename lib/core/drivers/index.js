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


var checkDrivers = require('./check-drivers');
var mountDriver = require('./mount-driver');
var unmountDriver = require('./unmount-driver');
var injectDriver = require('./inject-driver');
var removeDriver = require('./remove-driver');


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
 * @returns {Q.Promise}
 */
Drivers.checkDrivers = function () {
    return checkDrivers();
};


/**
 * Mounts a driver todo ????
 *
 * @param driverName
 * @param remote todo ?????????
 * @param mirrorBoard todo ?????????
 * @returns {Q.Promise}
 */
Drivers.mountDriver = function (driverName, remote, mirrorBoard) {
    return mountDriver(driverName, remote, mirrorBoard);
};


/**
 * Unmounts a driver todo ???????
 *
 * @param driverName
 */
Drivers.unmountDriver = function (driverName) {
    return unmountDriver(driverName);
};


/**
 * Injects a driver - saves it's sourcecode and config.
 *
 * @param driverName
 * @param driverJsCodeString
 * @param driverConf
 * @param autostart
 */
Drivers.injectDriver = function (driverName, driverJsCodeString, driverConf, autostart) {
    return injectDriver(driverName, driverJsCodeString, driverConf, autostart);
};


/**
 * Removes a driver from the board - it's sourcecode and config.
 *
 * @param driverName
 */
Drivers.removeDriver = function (driverName) {
    // todo should this check that the driverName is unmounted?

    return removeDriver(driverName);
};
