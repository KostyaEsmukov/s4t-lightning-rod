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

var helpers = require('./helpers');


/**
 * fuse module functions wrapped with promises
 */
var exports = module.exports = {};


// `fuse-bindings` exposes many error-codes. In order to not enumerate
// them all here, we simply copy all of it's props and override
// funcs with callbacks with their promised variants below.
helpers.objectAssign(exports, fuse);


/**
 * fuse.mount
 * @param mnt
 * @param ops
 * @param opts
 * @returns {Q.Promise}
 */
exports.mount = function (mnt, ops, opts) {
    opts = opts || null;

    return Q.Promise(function (resolve, reject) {
        fuse.mount(mnt, ops, opts, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};


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

