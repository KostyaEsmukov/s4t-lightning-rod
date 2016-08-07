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


var Q = require('q');
var nconf = require('nconf');

var fspromised = require('./../utils/fspromised');
var helpers = require('./../utils/helpers');
var logger = require('./../utils/log4js-wrapper').getLogger("Driver");
var Board = require('./board');
var WAMP = require('./wamp');
var JsonConfigsUtils = require('./../utils/json-configs-utils');

var Mount = require('./drivers/Mount');

var driversState = new DriversState();

/**
 * Drivers subsystem state
 * Don't ever cache it's results, because they might be changed at any time.
 *
 * @constructor
 */
function DriversState() {
    this._driversConfigFilepath = null;
    this._driversMountpointRoot = null;
    this._driversModuleUploadDir = null;
    this._driversModuleConfDir = null;
}


/**
 * Returns false if DriversState is not loaded yet
 *
 * @returns {boolean}
 */
DriversState.prototype.isLoaded = function () {
    return this._driversConfigFilepath !== null;
};


/**
 * Reloads Drivers subsystem state
 *
 * @throws {ConfigError}
 * @param nconf_ might be omitted
 */
DriversState.prototype.reload = function (nconf_) {  // eslint-disable-line no-unused-vars
    nconf_ = nconf_ || nconf;

    // todo
    this._driversConfigFilepath = './drivers.json';
    this._driversMountpointRoot = '../drivers';
    this._driversModuleUploadDir = './drivers';
    this._driversModuleConfDir = './drivers';
};


/**
 * Reads drivers config file
 *
 * @returns {Q.Promise}
 */
DriversState.prototype.readDriversConfig = function () {
    return fspromised.readFile(this._driversConfigFilepath)
        .then(function (data) {
            return JSON.parse(data);
        });
};


/**
 * Returns mountpoint path
 *
 * @param driverName
 * @returns {string}
 */
DriversState.prototype.getMountpointPathByDriverName = function (driverName) {
    return this._driversMountpointRoot + '/' + driverName;
};


/**
 * Returns target path to the driverName module
 *
 * @param driverName
 * @returns {string}
 */
DriversState.prototype.getModulePathByName = function (driverName) {
    return this._driversModuleUploadDir + '/' + driverName + '/' + driverName + '.js';
};


/**
 * Returns target path to the driverName's module config
 *
 * @param driverName
 * @returns {string}
 */
DriversState.prototype.getModuleConfPathByName = function (driverName) {
    return this._driversModuleConfDir + '/' + driverName + '/' + driverName + '.json';
};


/**
 * Reads driverName's module config file
 *
 * @param driverName
 * @returns {Q.Promise}
 */
DriversState.prototype.readModuleConfig = function (driverName) {
    return fspromised.readFile(this.getModuleConfPathByName(driverName))
        .then(function (data) {
            return JSON.parse(data);
        });
};

/**
 * Saves driverName's module config file
 *
 * @param driverName
 * @param driverConf
 * @returns {Q.Promise}
 */
DriversState.prototype.writeModuleConfig = function (driverName, driverConf) {
    return fspromised.writeFile(this.getModuleConfPathByName(driverName),
        JsonConfigsUtils.prettyJsonStringify(driverConf));
};


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
 */
function restartDrivers(isReconnected) {
    return driversState.readDriversConfig()
        .then(function (driversConf) {
            var driversKeys = helpers.objectKeys(driversConf.drivers);
            logger.debug('Number of installed drivers: ' + driversKeys.length);

            if (driversKeys.length <= 0) {
                logger.info('No enabled drivers to be restarted!');
                return;
            }

            logger.info('Restarting enabled drivers on board: ');

            var mountingDriversPromises = [];

            for (var i = 0; i < driversKeys.length; i++) {
                var driverName = driversKeys[i];
                var driverConf = driversConf.drivers[driverName];

                driverConf.autostart = JsonConfigsUtils.fixBoolFromString(driverConf.autostart);
                // var status = driverConf.status;
                // var remote = driverConf.remote;
                // var mirrorBoard = driverConf.mirror_board;

                logger.info('[DRIVER] |--> ' + driverName + ' - status: ' + driverConf.status
                    + ' - autostart: ' + driverConf.autostart
                    + ' - remote: { ' + driverConf.remote + ' , ' + driverConf.mirror_board + ' }');

                if (isReconnected === true && driverConf.status === "unmounted") {  // todo status ?!?!?!
                    logger.debug("[DRIVER] - " + driverName
                        + " --> It is not necessary restart this driver after reconnection!");
                    continue;
                }

                if (driverConf.autostart !== true || driverConf.remote == null) {
                    logger.info("[DRIVER] - " + driverName + " --> Status -> "
                        + driverConf.status + ": this plugin does not have to be started!");
                    continue;
                }


                (function (driverName, driverConf) {
                    mountingDriversPromises.push(
                        Q.delay(2000 * mountingDriversPromises.length)  // todo delay is hardcoded
                            .then(function () {
                                if (driverConf.status !== "mounted")  // todo status ?!?!?!
                                    return;

                                return exports.unmountDriver([driverName, true]) // todo
                                    .then(function () {
                                        return WAMP.getState().getSession().call(
                                            's4t.board.driver.updateStatus',  // todo constant?
                                            [
                                                Board.getState().getBoardCode(),
                                                driverName,
                                                "unmounted"
                                            ]);
                                    })
                                    .then(function () {
                                        return Q.delay(1000); // todo why originally it was `1000*i` ?
                                    });
                            })
                            .then(function () {
                                return Drivers.mountDriver(driverName, driverConf.remote, driverConf.mirror_board);
                            })
                            .then(function () {
                                return WAMP.getState().getSession().call(
                                    's4t.board.driver.updateStatus',  // todo constant?
                                    [
                                        Board.getState().getBoardCode(),
                                        driverName,
                                        "mounted"
                                    ]);
                            })
                    );

                })(driverName, driverConf);
            }

            return Q.all(mountingDriversPromises);
        })
        .then(function() {
            // return void
        });
}


/**
 * Ensures that all the required drivers are mounted.
 *
 * Should be called on LR process initialization.
 *
 * Ex-exports.restartDrivers , with reconnected == false
 *
 * @returns {Q.Promise}
 */
Drivers.automountDrivers = function () {
    return restartDrivers(false);
};


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

    logger.info("[DRIVER] - MOUNTING driver '" + driverName + "'...");
    logger.debug("[DRIVER] - " + driverName + " --> Parameters:\n - remote: " + remote + "\n - mirror_board: " + mirrorBoard);

    var mountpoint = driversState.getMountpointPathByDriverName(driverName);

    logger.debug("[DRIVER] - " + driverName + " --> Driver folder (" + mountpoint + ") checking...");

    return fspromised.stat(mountpoint)
        .then(function (stats) {  // eslint-disable-line no-unused-vars
            logger.debug("[DRIVER] - " + driverName + " ----> folder " + mountpoint + " exists!");
            //logger.debug("[DRIVER] - " + driverName + " --> Mountpoint details:\n" + util.inspect(stats));
        })
        .catch(function (error) {
            if (error.code !== 'ENOENT')
                throw error;

            logger.debug("[DRIVER] - " + driverName + " ----> folder " + mountpoint + " does not exist!");
            logger.debug("[DRIVER] - " + driverName + " --> First driver mounting");
            return fspromised.mkdir(mountpoint, parseInt('0755', 8))  // todo mode is hardcoded
                .then(function () {
                    logger.debug("[DRIVER] - " + driverName + " ----> folder " + mountpoint + " CREATED!");
                });
        })
        .then(function () {
            return (new Mount(driversState, driverName, mountpoint, remote, mirrorBoard)).mount();
        });
};


Drivers.unmountDriver = function (driverName, restarting) {
    restarting = restarting || false; // todo ?!

    var mountpoint = driversState.getMountpointPathByDriverName(driverName);


    logger.info("[DRIVER] - UNMOUNTING driver '" + driverName + "'...");

    // var driver_path = "./drivers/" + driver_name;
    // var driver_conf = driver_path + "/" + driver_name + ".json";
    // var driver_module = driver_path + "/" + driver_name + ".js";

};


