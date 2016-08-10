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

var helpers = require('../../utils/helpers');
var logger = require('../../utils/log4js-wrapper').getLogger("Driver");
var Board = require('../board');
var WAMP = require('../wamp');
var JsonConfigsUtils = require('../../utils/json-configs-utils');

var mountDriver = require('./mount-driver');
var driversState = require('./_state');



/**
 * Ensures that all the required drivers are mounted.
 */
module.exports = function () {
    // todo get rid of the isReconnected
    
    return driversState.readGlobalDriversConfig()
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

                if (isReconnected === true
                    && driverConf.status === "unmounted") {  // todo status ?!?!?!
                    logger.debug("[DRIVER] - " + driverName
                        + " --> It is not necessary restart this driver after reconnection!");
                    continue;
                }

                if (driverConf.autostart !== true || driverConf.remote === null) {
                    logger.info("[DRIVER] - " + driverName + " --> Status -> "
                        + driverConf.status + ": this plugin does not have to be started!");
                    continue;
                }


                (function (driverName, driverConf) {
                    mountingDriversPromises.push(
                        Q.delay(2000 * mountingDriversPromises.length)  // todo delay is hardcoded
                            .then(function () {
                                if (driverConf.status !== "mounted") {  // todo status ?!?!?!
                                    return;
                                }

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
                                        // todo why originally it was `1000*i` ?
                                        return Q.delay(1000);
                                    });
                            })
                            .then(function () {
                                return mountDriver(driverName,
                                    driverConf.remote, driverConf.mirror_board);
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
};
