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


/**
 * A wrapper around the raw driverConfig item of the ./drivers.json
 *
 * @param driverConfig
 * @param driverName
 * @constructor
 */
function GlobalDriversConfigItem(driverConfig, driverName) {
    this.driverName = driverName;

    if (!driverConfig) {
        driverConfig = {};
    }

    this.status = undefinedToNull(driverConfig.status);
    this.remote = undefinedToNull(driverConfig.remote);
    this.autostart = undefinedToNull(driverConfig.autostart);
    // eslint-disable-next-line camelcase
    this.mirror_board = undefinedToNull(driverConfig.mirror_board);
}

function undefinedToNull(a) {
    if (a === undefined) {
        return null;
    }
    return a;
}

GlobalDriversConfigItem.prototype.STATUSES = {
    INJECTED: 'injected',
    UNMOUNTED: 'unmounted',
    MOUNTED: 'mounted'
};

/**
 * Returns raw driverConfig
 * @return {{status, remote, autostart, mirror_board}}
 */
GlobalDriversConfigItem.prototype.toObject = function () {
    switch (this.status) {
        case this.STATUSES.INJECTED:
        case this.STATUSES.UNMOUNTED:
        case this.STATUSES.MOUNTED:
            return this._toObject();
        default:
            throw new Error("Unknown driverConfig status");
    }
};

GlobalDriversConfigItem.prototype._toObject = function () {
    return {
        status: undefinedToNull(this.status),
        remote: undefinedToNull(this.remote),
        autostart: undefinedToNull(this.autostart),
        // eslint-disable-next-line camelcase
        mirror_board: undefinedToNull(this.mirror_board)
    };
};


module.exports = GlobalDriversConfigItem;
