(function() {

    'use strict';

    var Base = require('../../layer/core/Base');

    var DOM = Base.extend({

        onAdd: function(map) {
            L.GridLayer.prototype.onAdd.call(this, map);
            map.on('zoomstart', this.clearExtrema, this);
            this.on('tileunload', this.onTileUnload, this);
            this.on('cacheload', this.onCacheLoad, this);
            this.on('cachehit', this.onCacheHit, this);
            this.on('cacheunload', this.onCacheUnload, this);
            this.on('extremachange', this.onExtremaChange, this);
        },

        onRemove: function(map) {
            L.GridLayer.prototype.onRemove.call(this, map);
            map.off('zoomstart', this.clearExtrema, this);
            this.off('tileunload', this.onTileUnload, this);
            this.off('cacheload', this.onCacheLoad, this);
            this.off('cachehit', this.onCacheHit, this);
            this.off('cacheunload', this.onCacheUnload, this);
            this.off('extremachange', this.onExtremaChange, this);
        },

        onCacheHit: function(event) {
            var cached = event.entry;
            var tile = event.tile;
            var coords = event.coords;
            // data exists, render only this tile
            if (cached.data) {
                this.renderTile(tile, cached.data, coords);
            }
        },

        onCacheLoad: function(event) {
            // same extrema, we are good to render the tiles. In
            // the case of a map with wraparound, we may have
            // multiple tiles dependent on the response, so iterate
            // over each tile and draw it.
            var cached = event.entry;
            var coords = event.coords;
            var self = this;
            if (cached.data) {
                _.forIn(cached.tiles, function(tile) {
                    self.renderTile(tile, cached.data, coords);
                });
            }
        },

        onExtremaChange: function() {
            var self = this;
            // redraw all tiles
            _.forIn(this._cache, function(cached) {
                _.forIn(cached.tiles, function(tile, key) {
                    if (cached.data) {
                        self.renderTile(tile, cached.data, self.coordFromCacheKey(key));
                    }
                });
            });
        },

        onCacheUnload: function() {
            // override
        },

        createTile: function() {
            // override
        },

        renderTile: function() {
            // override
        }

    });

    module.exports = DOM;

}());
