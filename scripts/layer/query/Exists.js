(function() {

    'use strict';

    const checkField = function(meta, field) {
        if (!meta) {
            throw 'Exists `field` ' + field + ' is not recognized in meta data.';
        }
    };

    module.exports = function(meta, query) {
        if (!query.field) {
            throw 'Exists `field` is missing from argument.';
        }
        checkField(meta[query.field], query.field);
    };

}());
