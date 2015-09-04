'use strict';

/**
 * JSON stringifies passed Object.
 * @param {Object} o - Object to be JSON stringified
 * @return {String} JSON String
 */
exports.stringify = function(o) {
    return JSON.stringify(o, null, 4);
};