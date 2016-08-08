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




var fspromised = require('../../utils/fspromised');

var logger = require('../../utils/log4js-wrapper').getLogger("Driver");

var Mount = require('./Mount');
var driversState = require('./_state');


module.exports = function (driverName, remote, mirrorBoard) {

    logger.info("[DRIVER] - MOUNTING driver '" + driverName + "'...");
    logger.debug("[DRIVER] - " + driverName + " --> Parameters:\n - remote: "
        + remote + "\n - mirror_board: " + mirrorBoard);

    var mountpoint = driversState.getMountpointPathByDriverName(driverName);

    logger.debug("[DRIVER] - " + driverName + " --> Driver folder (" + mountpoint
        + ") checking...");

    return fspromised.stat(mountpoint)
        .then(function (stats) {  // eslint-disable-line no-unused-vars
            logger.debug("[DRIVER] - " + driverName + " ----> folder " + mountpoint + " exists!");
            //logger.debug("[DRIVER] - " + driverName + " --> Mountpoint details:\n"
            // + util.inspect(stats));
        })
        .catch(function (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }

            logger.debug("[DRIVER] - " + driverName + " ----> folder " + mountpoint
                + " does not exist!");
            logger.debug("[DRIVER] - " + driverName + " --> First driver mounting");
            return fspromised.mkdir(mountpoint, parseInt('0755', 8))  // todo mode is hardcoded
                .then(function () {
                    logger.debug("[DRIVER] - " + driverName + " ----> folder " + mountpoint
                        + " CREATED!");
                });
        })
        .then(function () {
            return (new Mount(driverName, mountpoint, remote, mirrorBoard)).mount();
        });
};
