(function() {

    'use strict';

    var Base = require('../../layer/core/Base');

    var DOM = Base.extend({

        onAdd: function(map) {
            L.GridLayer.prototype.onAdd.call(this, map);
            map.on('zoomstart', this.clearExtrema, this);
            this.on('tileload', this.onTileLoad, this);
            this.on('tileunload', this.onTileUnload, this);
        },

        onRemove: function(map) {
            map.off('zoomstart', this.clearExtrema, this);
            this.off('tileload', this.onTileLoad, this);
            this.off('tileunload', this.onTileUnload, this);
            L.GridLayer.prototype.onRemove.call(this, map);
        },

 
        onCacheHit: function(tile, cached, coords) {
            // data exists, render only this tile
            if (cached.data) {
                this.renderTile(tile, cached.data, coords);
            }
        },

        onCacheLoad: function(tile, cached, coords) {
            // same extrema, we are good to render the tiles. In
            // the case of a map with wraparound, we may have
            // multiple tiles dependent on the response, so iterate
            // over each tile and draw it.
            var self = this;
            if (cached.data) {
                _.forIn(cached.tiles, function(tile) {
                    self.renderTile(tile, cached.data, coords);
                });
            }
        },

        onCacheLoadExtremaUpdate: function() {
            // redraw all tiles
            var self = this;
            _.forIn(this._cache, function(cached) {
                _.forIn(cached.tiles, function(tile, key) {
                    if (cached.data) {
                        self.renderTile(tile, cached.data, self.coordFromCacheKey(key));
                    }
                });
            });
        },

        createTile: function() {
            // override
        },

        requestTile: function() {
            // override
        },

        renderTile: function() {
            // override
        }

    });

    module.exports = DOM;

}());
