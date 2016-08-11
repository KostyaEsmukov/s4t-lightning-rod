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


var fusepromised = require('../../utils/fusepromised');

var logger = require('../../utils/log4js-wrapper').getLogger("Driver");


var driversState = require('./_state');


module.exports = function (driverName) {
    // restarting = restarting || false; // todo ?!

    logger.info("[DRIVER] - UNMOUNTING driver '" + driverName + "'...");

    var driverModule = driversState.getDriverModuleByName(driverName);

    return driverModule.finalize()
        .then(function () {
            return fusepromised.unmount(driversState.getMountpointPathByDriverName(driverName));
        })
        .then(function () {
            return driversState.readDriverConfig(driverName);
        })
        .then(function (driverConfig) {
            var children = driverConfig.children;

            // var driver_mp_node = mp_list[driver_name];

            // todo

        });
};
