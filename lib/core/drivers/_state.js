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
var rimraf = require('rimraf');

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
    this._driversModulesPath = null;
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
    this._driversModulesPath = './drivers';
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
 * Returns driverName directory path
 *
 * @param driverName
 * @return {string}
 */
DriversState.prototype.getDriverPathByName = function (driverName) {
    return this._driversModulesPath + '/' + driverName;
};

/**
 * Returns target path to the driverName's sourcecode
 *
 * @param driverName
 * @returns {string}
 */
DriversState.prototype.getDriverSourcecodePathByName = function (driverName) {
    return this.getDriverPathByName(driverName) + '/' + driverName + '.js';
};


/**
 * Returns target path to the driverName's config
 *
 * @param driverName
 * @returns {string}
 */
DriversState.prototype.getDriverConfPathByName = function (driverName) {
    return this.getDriverPathByName(driverName) + '/' + driverName + '.json';
};


/**
 * Reads driverName's config file
 *
 * @param driverName
 * @returns {Q.Promise}
 */
DriversState.prototype.readDriverConfig = function (driverName) {
    return fspromised.readFile(this.getDriverConfPathByName(driverName))
        .then(function (data) {
            return JSON.parse(data);
        });
};

/**
 * Saves driverName's config file
 *
 * @param driverName
 * @param driverConf
 * @returns {Q.Promise}
 */
DriversState.prototype.writeDriverConfig = function (driverName, driverConf) {
    return fspromised.writeFile(this.getDriverConfPathByName(driverName),
        JsonConfigsUtils.prettyJsonStringify(driverConf));
};


/**
 * Creates driverName directory if it does not exists
 *
 * @param driverName
 * @return {Q.Promise}
 */
DriversState.prototype.allocateDriverDirectory = function (driverName) {
    return fspromised.mkdir(this.getDriverPathByName(driverName))  // todo mode??
        .catch(function (error) {
            if (error.code === 'EEXIST') {
                throw new Error('This driver is already exists');
            }
            throw error;
        });
};


/**
 * Removes driverName directory, including its' sourcecode and config.
 *
 * @param driverName
 * @return {Q.Promise}
 */
DriversState.prototype.removeDriverDirectory = function (driverName) {
    return Q.Promise(function (resolve, reject) {
        rimraf(this.getDriverPathByName(driverName), { glob: false },
            function (error) {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
    });
};


/**
 * Saves driverName's sourcecode
 *
 * @param driverName
 * @param driverJsSourcecode
 * @return {Q.Promise}
 */
DriversState.prototype.writeDriverSourcecode = function (driverName, driverJsSourcecode) {
    return fspromised.writeFile(this.getDriverSourcecodePathByName(driverName), driverJsSourcecode);
};
