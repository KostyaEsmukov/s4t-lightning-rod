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


var logger = require('../../utils/log4js-wrapper').getLogger("Driver");

var driversState = require('./_state');


function Mount(driverName, mountpoint, remote, mirrorBoard) {
    this.driverName = driverName;
    this.mountpoint = mountpoint;
    this.remote = remote;
    this.mirrorBoard = mirrorBoard;
}

Mount.prototype.mount = function () {
    // todo
};

Mount.prototype._loadDriver = function () {
    return driversState.readDriverConfig(this.driverName)
        .then(function(driverConf) {

            // eslint-disable-next-line global-require
            var driver = require(driversState.getModulePathByName(this.driverName));


            var driverName = driverConf.name;

            var type = driverConf.type;
            var permissions = base10To8(driverConf.permissions);
            // var root_permissions = MaskConversion(driverConf.root_permissions);
            var children = driverConf.children;

            logger.debug("[DRIVER] - " + this.driverName + " --> driver configuration loaded!");

            // todo


        }.bind(this));
};



function base10To8(number) {
    return parseInt(number.toString(10), 8);
}


module.exports = Mount;
