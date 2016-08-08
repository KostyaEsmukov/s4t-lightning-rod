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


/**
 * Exports procedures and subscribes to topics for the session
 * @param session {BaseWAMPSession}
 */
module.exports = function (session) {

    var boardCode = Board.getState().getBoardCode();


    // todo
};
