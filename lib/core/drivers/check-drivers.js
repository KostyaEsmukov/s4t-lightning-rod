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
var Board = require('../board');
var WAMP = require('../wamp');
var JsonConfigsUtils = require('../../utils/json-configs-utils');

var mountDriver = require('./mount-driver');
var unmountDriver = require('./unmount-driver');
var driversState = require('./_state');


module.exports = function () {

    return driversState.readGlobalDriversConfig()
        .then(function (globalDriversConfigItemList) {
            logger.debug('Number of installed drivers: ' + globalDriversConfigItemList.length);

            if (globalDriversConfigItemList.length <= 0) {
                logger.info('No enabled drivers to be restarted!');
                return;
            }

            logger.info('[DRIVER] |- Restarting enabled drivers on board: ');

            return Q.all(mountingDriversPromisesList(globalDriversConfigItemList));
        })
        .then(function () {
            logger.info('[DRIVER] |- Done');

            // return void
        });
};


function mountingDriversPromisesList(globalDriversConfigItemList) {
    var mountingDriversPromises = [];

    for (var i = 0; i < globalDriversConfigItemList.length; i++) {
        var globalDriversConfigItem = globalDriversConfigItemList[i];
        var driverName = globalDriversConfigItemList[i].driverName;

        globalDriversConfigItem.autostart =
            JsonConfigsUtils.fixBoolFromString(globalDriversConfigItem.autostart);
        // var status = globalDriversConfigItem.status;
        // var remote = globalDriversConfigItem.remote;
        // var mirrorBoard = globalDriversConfigItem.mirror_board;

        logger.info('[DRIVER] |--> ' + driverName + ' - status: ' + globalDriversConfigItem.status
            + ' - autostart: ' + globalDriversConfigItem.autostart
            + ' - remote: { ' + globalDriversConfigItem.remote
            + ' , ' + globalDriversConfigItem.mirror_board + ' }');

        // todo Previously this cond included the 'isReconnected === true' - why?!
        // todo status ?!?!?!
        if (globalDriversConfigItem.status === globalDriversConfigItem.STATUSES.UNMOUNTED) {
            // logger.debug("[DRIVER] - " + driverName
            //     + " --> It is not necessary restart this driver after reconnection!");
            continue;
        }

        if (globalDriversConfigItem.autostart !== true
            || globalDriversConfigItem.remote === null) {
            logger.info("[DRIVER] - " + driverName + " --> Status -> "
                + globalDriversConfigItem.status + ": this plugin does not have to be started!");
            continue;
        }

        mountingDriversPromises.push(
            mountingDriverPromise(driverName,
                globalDriversConfigItem, mountingDriversPromises.length)
        );
    }

    return mountingDriversPromises;
}

function mountingDriverPromise(driverName, globalDriversConfigItem,
                               mountingDriversPromisesLength) {

    return Q.delay(2000 * mountingDriversPromisesLength)  // todo delay is hardcoded
        .then(function () {

            // todo status ?!?!?!
            if (globalDriversConfigItem.status !== globalDriversConfigItem.STATUSES.MOUNTED) {
                return;
            }

            return unmountDriver(driverName)
                .then(function () {
                    return WAMP.getState().getSession().call(
                        's4t.board.driver.updateStatus',
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
                globalDriversConfigItem.remote, globalDriversConfigItem.mirror_board);
        })
        .then(function () {
            return WAMP.getState().getSession().call(
                's4t.board.driver.updateStatus',
                [
                    Board.getState().getBoardCode(),
                    driverName,
                    "mounted"
                ]);
        });
}
