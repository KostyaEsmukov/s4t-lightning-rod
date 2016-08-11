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

var fuse = require('fuse-bindings');
var Q = require('q');


/**
 * fuse module functions wrapped with promises
 */
var exports = module.exports = {};


/**
 * fuse.unmount
 * @param mnt
 * @returns {Q.Promise}
 */
exports.unmount = function (mnt) {
    return Q.Promise(function (resolve, reject) {
        fuse.unmount(mnt, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

