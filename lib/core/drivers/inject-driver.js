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


// var logger = require('../../utils/log4js-wrapper').getLogger("Driver");

var driversState = require('./_state');


module.exports = function (  // eslint-disable-line max-params
    driverName, driverJsCodeString, driverConf, autostart) {

    return driversState.allocateDriverDirectory(driverName)
        .then(function () {
            return [
                driversState.writeDriverSourcecode(driverName, driverJsCodeString),
                driversState.writeDriverConfig(driverName, driverConf)
            ];
        })
        .spread(function () {
            // todo

            // return updateDriverConf(driverName, autostart);

            /*
             manageDriversConf("update", driver_name, autostart, "injected",
             null, null, function (mng_result)

             */
        })
        .then(function () {
            // return void
        });
};
