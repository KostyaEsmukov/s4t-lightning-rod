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

var nconf = require('nconf');

var fspromised = require('../../utils/fspromised');

var JsonConfigsUtils = require('../../utils/json-configs-utils');

var driversState = module.exports = new DriversState();  // eslint-disable-line no-unused-vars


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
DriversState.prototype.readGlobalDriversConfig = function () {
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
