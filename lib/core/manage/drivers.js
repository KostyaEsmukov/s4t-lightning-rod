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

var logger = require('../../utils/log4js-wrapper').getLogger("manage drivers");
var Board = require('../board');
var Drivers = require('../drivers');


function mountDriver(args) {
    var driverName = "" + args[0];
    var remote = "" + args[1];
    var mirrorBoard = "" + args[2];

    return Drivers.mountDriver(driverName, remote, mirrorBoard)
        .then(function () {
            return {
                message: "Driver '" + driverName + "' successfully mounted!",
                result: "SUCCESS"
            };
        })
        .catch(function (error) {
            var res = {
                message: "Error: " + error,
                result: "ERROR"
            };

            logger.error("[DRIVER] - " + driverName + " --> " + res.message);

            return res;
        });
}

function unmountDriver(args) {
    var driverName = "" + args[0];

    return Drivers.unmountDriver(driverName)
        .then(function () {
            return {
                message: "Driver '" + driverName + "' successfully unmounted!",
                result: "SUCCESS"
            };
        })
        .catch(function (error) {
            var res = {
                message: "Error: " + error,
                result: "ERROR"
            };

            logger.error("[DRIVER] - " + driverName + " --> " + res.message);

            return res;
        });
}

function injectDriver(args) {
    var driverName = "" + args[0];
    var driverJsCodeString = "" + args[1];
    var driverConf = "" + args[2];
    var autostart = "" + args[3];

    return Drivers.injectDriver(driverName, driverJsCodeString, driverConf, autostart)
        .then(function () {
            return "Driver " + driverName + " successfully injected!";
        })
        .catch(function (error) {
            var res = 'Error: ' + error;

            logger.error("[DRIVER] - " + driverName + " --> " + res);

            return res;
        });
}

function removeDriver(args) {
    var driverName = "" + args[0];

    return Drivers.removeDriver(driverName)
        .then(function () {
            return "Driver " + driverName + " successfully removed!";
        })
        .catch(function (error) {
            var res = 'Error: ' + error;

            logger.error("[DRIVER] - " + driverName + " --> " + res);

            return res;
        });
}


/**
 * Exports procedures and subscribes to topics for the session
 * @param session {BaseWAMPSession}
 */
module.exports = function (session) {

    var boardCode = Board.getState().getBoardCode();

    session.register('s4t.' + boardCode + '.driver.mountDriver', mountDriver);
    session.register('s4t.' + boardCode + '.driver.unmountDriver', unmountDriver);
    session.register('s4t.' + boardCode + '.driver.injectDriver', injectDriver);
    session.register('s4t.' + boardCode + '.driver.removeDriver', removeDriver);

};
