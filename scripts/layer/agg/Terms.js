(function() {

    'use strict';

    const checkField = function(meta, field) {
        if (meta) {
            if (meta.type !== 'string') {
                throw 'Terms `field` ' + field + ' is not of type `string` in meta data';
            }
        } else {
            throw 'Terms `field` ' + field + ' is not recognized in meta data';
        }
    };

    const setTerms = function(field, size) {
        if (!field) {
            throw 'Terms `field` is missing from argument';
        }
        checkField(this._meta[field], field);
        this._params.terms = {
            field: field,
            size: size
        };
        this.clearExtrema();
        return this;
    };

    const getTerms = function() {
        return this._params.terms;
    };

    module.exports = {
        setTerms: setTerms,
        getTerms: getTerms
    };

}());
