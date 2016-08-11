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

var logger = require('../../utils/log4js-wrapper').getLogger("Driver");


function DriverModule(driverName, moduleFilePath) {

    this.driverName = driverName;

    // todo validation?
    this.module = require(moduleFilePath);  // eslint-disable-line global-require

}

DriverModule.prototype.finalize = function () {
    return Q.Promise(function (resolve) {
        this.module.finalize(function (endResult) {
            logger.info("[DRIVER] - " + this.driverName + " --> " + endResult);

            // todo endResult - can it contain and error?

            resolve();

        }.bind(this));
    }.bind(this));
};



module.exports = DriverModule;
