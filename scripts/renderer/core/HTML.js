(function() {

    'use strict';

    const DOM = require('./DOM');

    const HTML = DOM.extend({

        options: {
            zoomAnimation: false
        },

        onAdd: function(map) {
            DOM.prototype.onAdd.call(this, map);
            // handlers
            map.on('click', this.onClick, this);
            map.on('zoomstart', this.clearTiles, this);
            $(this._container).on('mousemove', event => {
                this.onMouseMove(event);
            });
            $(this._container).on('mouseover', event => {
                this.onMouseOver(event);
            });
            $(this._container).on('mouseout', event => {
                this.onMouseOut(event);
            });
        },

        onRemove: function(map) {
            // handlers
            map.off('click', this.onClick, this);
            map.off('zoomstart', this.clearTiles, this);
            $(this._container).off('mousemove');
            $(this._container).off('mouseover');
            $(this._container).off('mouseout');
            DOM.prototype.onRemove.call(this, map);
        },

        clearTiles: function() {
            if (!this.options.zoomAnimation) {
                // remove scaled level
                this._invalidateAll();
            }
        },

        createTile: function(coords, done) {
            const tile = L.DomUtil.create('div', 'leaflet-tile leaflet-html-tile');
            tile.width = this.options.tileSize;
            tile.height = this.options.tileSize;
            this._requestTile(coords, tile, () => {
                done(null, tile);
            });
            return tile;
        },

        onMouseMove: function() {
            // override
        },

        onMouseOver: function() {
            // override
        },

        onMouseOut: function() {
            // override
        },

        onClick: function() {
            // override
        }

    });

    module.exports = HTML;

}());
