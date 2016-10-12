(function() {

    'use strict';

    let esper = require('esper');
    let WebGL = require('../../core/WebGL');
    let VertexAtlas = require('./VertexAtlas');
    let Shaders = require('./Shaders');
    let Shapes = require('./Shapes');

    let TILE_SIZE = 256;
    let NUM_SLICES = 64;
    let POINT_RADIUS = 2;

    let Cluster = WebGL.extend({

        options: {
            outlineWidth: 1,
            outlineColor: [0.0, 0.0, 0.0, 1.0],
            fillColor: [0.2, 0.15, 0.4, 0.5],
            radius: POINT_RADIUS,
            blending: true
        },

        onWebGLInit: function(done) {
            // ensure we use the correct context
            esper.WebGLContext.bind(this._container);
            // create the circle vertexbuffer
            this._circleFillBuffer = Shapes.circle.fill(NUM_SLICES);
            this._circleOutlineBuffer = Shapes.circle.outline(NUM_SLICES);
            // vertex atlas for all tiles
            this._atlas = new VertexAtlas({
                1: {
                    type: 'FLOAT',
                    size: 2
                }
            });
            // load shader
            this._shader = new esper.Shader({
                vert: Shaders.instancedPoint.vert,
                frag: Shaders.instancedPoint.frag
            }, err => {
                if (err) {
                    done(err);
                }
                done(null);
            });
        },

        onCacheLoad: function(event) {
            const cached = event.entry;
            const coords = event.coords;
            const data = new Float64Array(cached.data);
            const positions = new Float32Array(data.length * 2);
            const resolution = Math.sqrt(data.length);
            const pointWidth = TILE_SIZE / resolution;
            const halfWidth = pointWidth / 2;
            let numPoints = 0;

            for (let i=0; i<data.length; i++) {
                const bin = data[i];
                if (bin > 0) {
                    const x = (i % resolution) * pointWidth + halfWidth;
                    const y = Math.floor(i / resolution) * pointWidth + halfWidth;
                    // add point to buffer
                    positions[numPoints * 2] = x;
                    positions[numPoints * 2 + 1] = (TILE_SIZE - y);
                    // increment point count
                    numPoints++;
                }
            }

            cached.numPoints = numPoints;
            if (numPoints > 0) {
                let ncoords = this.getNormalizedCoords(coords);
                let hash = this.cacheKeyFromCoord(ncoords);
                this._atlas.addTile(hash, positions, numPoints);
            }
        },

        onCacheUnload: function(event) {
            let cached = event.entry;
            let coords = event.coords;
            if (cached.numPoints > 0) {
                cached.numPoints = 0;
                let ncoords = this.getNormalizedCoords(coords);
                let hash = this.cacheKeyFromCoord(ncoords);
                this._atlas.removeTile(hash);
            }
        },

        drawInstanced: function(circle, color, radius) {
            let gl = this._gl;
            let shader = this._shader;
            let cache = this._cache;
            let zoom = this._map.getZoom();
            let atlas = this._atlas;
            if (this.options.blending) {
                // enable blending
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            }
            // use shader
            shader.use();
            // set uniforms
            shader.setUniform('uColor', color);
            shader.setUniform('uProjectionMatrix', this.getProjectionMatrix());
            shader.setUniform('uOpacity', this.getOpacity());
            shader.setUniform('uRadius', radius);
            // calc view offset
            let viewOffset = this.getViewOffset();
            // bind the circle to instance
            circle.bind();
            // bind offsets and enable instancing
            atlas.bind();
            // for each allocated chunk
            atlas.forEach((chunk, hash) => {
                // for each tile referring to the data
                let cached = cache[hash];
                if (cached) {
                    // render for each tile
                    _.keys(cached.tiles).forEach(hash => {
                        let coords = this.coordFromCacheKey(hash);
                        if (coords.z !== zoom) {
                            // NOTE: we have to check here if the tiles are stale or not
                            return;
                        }
                        // get wrap offset
                        let wrapOffset = this.getWrapAroundOffset(coords);
                        // get tile offset
                        let tileOffset = this.getTileOffset(coords);
                        // calculate the total tile offset
                        let totalOffset = [
                            tileOffset[0] + wrapOffset[0] - viewOffset[0],
                            tileOffset[1] + wrapOffset[1] - viewOffset[1]
                        ];
                        shader.setUniform('uTileOffset', totalOffset);
                        // draw the instances
                        atlas.draw(hash, circle.mode, circle.count);
                    });
                }
            });
            // disable instancing
            atlas.unbind();
            // unbind buffer
            circle.unbind();
        },

        renderFrame: function() {
            // setup
            let gl = this._gl;
            let viewport = this._viewport;
            viewport.push();
            // draw instanced fill
            this.drawInstanced(
                this._circleFillBuffer,
                this.options.fillColor,
                this.options.radius);
            // draw instanced outlines
            gl.lineWidth(this.options.outlineWidth);
            this.drawInstanced(
                this._circleOutlineBuffer,
                this.options.outlineColor,
                this.options.radius);
            // teardown
            viewport.pop();
        }

    });

    module.exports = Cluster;

}());
