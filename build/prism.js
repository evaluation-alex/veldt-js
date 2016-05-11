(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.prism = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {

    'use strict';

    var Texture2D = require('./Texture2D');
    var ImageLoader = require('../util/ImageLoader');
    var Util = require('../util/Util');
    var MAG_FILTERS = {
        NEAREST: true,
        LINEAR: true
    };
    var MIN_FILTERS = {
        NEAREST: true,
        LINEAR: true,
        NEAREST_MIPMAP_NEAREST: true,
        LINEAR_MIPMAP_NEAREST: true,
        NEAREST_MIPMAP_LINEAR: true,
        LINEAR_MIPMAP_LINEAR: true
    };
    var WRAP_MODES = {
        REPEAT: true,
        MIRRORED_REPEAT: true,
        CLAMP_TO_EDGE: true
    };
    var TYPES = {
        UNSIGNED_BYTE: true,
        FLOAT: true
    };
    var FORMATS = {
        RGB: true,
        RGBA: true
    };

    /**
     * The default type for color textures.
     */
    var DEFAULT_TYPE = 'UNSIGNED_BYTE';

    /**
     * The default format for color textures.
     */
    var DEFAULT_FORMAT = 'RGBA';

    /**
     * The default wrap mode for color textures.
     */
    var DEFAULT_WRAP = 'REPEAT';

    /**
     * The default min / mag filter for color textures.
     */
    var DEFAULT_FILTER = 'LINEAR';

    /**
     * The default for whether alpha premultiplying is enabled.
     */
    var DEFAULT_PREMULTIPLY_ALPHA = true;

    /**
     * The default for whether mipmapping is enabled.
     */
    var DEFAULT_MIPMAP = true;

    /**
     * The default for whether invert-y is enabled.
     */
    var DEFAULT_INVERT_Y = true;

    /**
     * Instantiates a ColorTexture2D object.
     * @class ColorTexture2D
     * @classdesc A texture class to represent a 2D color texture.
     * @augments Texture2D
     *
     * @param {Object} spec - The specification arguments.
     * @param {ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} spec.image - The HTMLImageElement to buffer.
     * @param {String} spec.url - The HTMLImageElement URL to load and buffer.
     * @param {Uint8Array|Float32Array} spec.src - The data to buffer.
     * @param {number} width - The width of the texture.
     * @param {number} height - The height of the texture.
     * @param {String} spec.wrap - The wrapping type over both S and T dimension.
     * @param {String} spec.wrapS - The wrapping type over the S dimension.
     * @param {String} spec.wrapT - The wrapping type over the T dimension.
     * @param {String} spec.filter - The min / mag filter used during scaling.
     * @param {String} spec.minFilter - The minification filter used during scaling.
     * @param {String} spec.magFilter - The magnification filter used during scaling.
     * @param {bool} spec.mipMap - Whether or not mip-mapping is enabled.
     * @param {bool} spec.invertY - Whether or not invert-y is enabled.
     * @param {bool} spec.preMultiplyAlpha - Whether or not alpha premultiplying is enabled.
     * @param {String} spec.format - The texture pixel format.
     * @param {String} spec.type - The texture pixel component type.
     * @param {Function} callback - The callback to be executed if the data is loaded asynchronously via a URL.
     */
    function ColorTexture2D( spec, callback ) {
        spec = spec || {};
        // get specific params
        spec.wrapS = spec.wrapS || spec.wrap;
        spec.wrapT = spec.wrapT || spec.wrap;
        spec.minFilter = spec.minFilter || spec.filter;
        spec.magFilter = spec.magFilter || spec.filter;
        // set texture params
        spec.wrapS = WRAP_MODES[ spec.wrapS ] ? spec.wrapS : DEFAULT_WRAP;
        spec.wrapT = WRAP_MODES[ spec.wrapT ] ? spec.wrapT : DEFAULT_WRAP;
        spec.minFilter = MIN_FILTERS[ spec.minFilter ] ? spec.minFilter : DEFAULT_FILTER;
        spec.magFilter = MAG_FILTERS[ spec.magFilter ] ? spec.magFilter : DEFAULT_FILTER;
        // set other properties
        spec.mipMap = spec.mipMap !== undefined ? spec.mipMap : DEFAULT_MIPMAP;
        spec.invertY = spec.invertY !== undefined ? spec.invertY : DEFAULT_INVERT_Y;
        spec.preMultiplyAlpha = spec.preMultiplyAlpha !== undefined ? spec.preMultiplyAlpha : DEFAULT_PREMULTIPLY_ALPHA;
        // set format
        spec.format = FORMATS[ spec.format ] ? spec.format : DEFAULT_FORMAT;
        // buffer the texture based on argument type
        if ( typeof spec.src === 'string' ) {
            // request source from url
            // TODO: put extension handling for arraybuffer / image / video differentiation
            var that = this;
            ImageLoader.load({
                url: spec.src,
                success: function( image ) {
                    // set to unsigned byte type
                    spec.type = 'UNSIGNED_BYTE';
                    spec.src = Util.resizeCanvas( spec, image );
                    Texture2D.call( that, spec );
                    if ( callback ) {
                        callback( null, that );
                    }
                },
                error: function( err ) {
                    if ( callback ) {
                        callback( err, null );
                    }
                }
            });
        } else if ( Util.isCanvasType( spec.src ) ) {
            // is image / canvas / video type
            // set to unsigned byte type
            spec.type = 'UNSIGNED_BYTE';
            spec.src = Util.resizeCanvas( spec, spec.src );
            Texture2D.call( this, spec );
        } else {
            // array, arraybuffer, or null
            if ( spec.src === undefined ) {
                // if no data is provided, assume this texture will be rendered
                // to. In this case disable mipmapping, there is no need and it
                // will only introduce very peculiar and difficult to discern
                // rendering phenomena in which the texture 'transforms' at
                // certain angles / distances to the mipmapped (empty) portions.
                spec.mipMap = false;
            }
            // buffer from arg
            spec.type = TYPES[ spec.type ] ? spec.type : DEFAULT_TYPE;
            Texture2D.call( this, spec );
        }
    }

    ColorTexture2D.prototype = Object.create( Texture2D.prototype );

    module.exports = ColorTexture2D;

}());

},{"../util/ImageLoader":17,"../util/Util":20,"./Texture2D":8}],2:[function(require,module,exports){
(function () {

    'use strict';

    var Texture2D = require('./Texture2D');
    var MAG_FILTERS = {
        NEAREST: true,
        LINEAR: true
    };
    var MIN_FILTERS = {
        NEAREST: true,
        LINEAR: true
    };
    var WRAP_MODES = {
        REPEAT: true,
        CLAMP_TO_EDGE: true,
        MIRRORED_REPEAT: true
    };
    var DEPTH_TYPES = {
        UNSIGNED_BYTE: true,
        UNSIGNED_SHORT: true,
        UNSIGNED_INT: true
    };
    var FORMATS = {
        DEPTH_COMPONENT: true,
        DEPTH_STENCIL: true
    };

    /**
     * The default type for depth textures.
     */
    var DEFAULT_TYPE = 'UNSIGNED_INT';

    /**
     * The default format for depth textures.
     */
    var DEFAULT_FORMAT = 'DEPTH_COMPONENT';

    /**
     * The default wrap mode for depth textures.
     */
    var DEFAULT_WRAP = 'CLAMP_TO_EDGE';

    /**
     * The default min / mag filter for depth textures.
     */
    var DEFAULT_FILTER = 'LINEAR';

    /**
     * Instantiates a DepthTexture2D object.
     * @class DepthTexture2D
     * @classdesc A texture class to represent a 2D depth texture.
     * @augments Texture2D
     *
     * @param {Object} spec - The specification arguments.
     * @param {Uint8Array|Uint16Array|Uint32Array} spec.src - The data to buffer.
     * @param {number} width - The width of the texture.
     * @param {number} height - The height of the texture.
     * @param {String} spec.wrap - The wrapping type over both S and T dimension.
     * @param {String} spec.wrapS - The wrapping type over the S dimension.
     * @param {String} spec.wrapT - The wrapping type over the T dimension.
     * @param {String} spec.filter - The min / mag filter used during scaling.
     * @param {String} spec.minFilter - The minification filter used during scaling.
     * @param {String} spec.magFilter - The magnification filter used during scaling.
     * @param {String} spec.format - The texture pixel format.
     * @param {String} spec.type - The texture pixel component type.
     * @param {Function} callback - The callback to be executed if the data is loaded asynchronously via a URL.
     */
    function DepthTexture2D( spec ) {
        spec = spec || {};
        // get specific params
        spec.wrapS = spec.wrapS || spec.wrap;
        spec.wrapT = spec.wrapT || spec.wrap;
        spec.minFilter = spec.minFilter || spec.filter;
        spec.magFilter = spec.magFilter || spec.filter;
        // set texture params
        spec.wrapS = WRAP_MODES[ spec.wrapS ] ? spec.wrapS : DEFAULT_WRAP;
        spec.wrapT = WRAP_MODES[ spec.wrapT ] ? spec.wrapT : DEFAULT_WRAP;
        spec.minFilter = MIN_FILTERS[ spec.minFilter ] ? spec.minFilter : DEFAULT_FILTER;
        spec.magFilter = MAG_FILTERS[ spec.magFilter ] ? spec.magFilter : DEFAULT_FILTER;
        // set mip-mapping and format
        spec.mipMap = false; // disable mip-mapping
        spec.invertY = false; // no need to invert-y
        spec.preMultiplyAlpha = false; // no alpha to pre-multiply
        spec.format = FORMATS[ spec.format ] ? spec.format : DEFAULT_FORMAT;
        // check if stencil-depth, or just depth
        if ( spec.format === 'DEPTH_STENCIL' ) {
            spec.type = 'UNSIGNED_INT_24_8_WEBGL';
        } else {
            spec.type = DEPTH_TYPES[ spec.type ] ? spec.type : DEFAULT_TYPE;
        }
        Texture2D.call( this, spec );
    }

    DepthTexture2D.prototype = Object.create( Texture2D.prototype );

    module.exports = DepthTexture2D;

}());

},{"./Texture2D":8}],3:[function(require,module,exports){
(function () {

    'use strict';

    var WebGLContext = require('./WebGLContext');
    var WebGLContextState = require('./WebGLContextState');
    var TYPES = {
        UNSIGNED_SHORT: true,
        UNSIGNED_INT: true
    };
    var MODES = {
        POINTS: true,
        LINES: true,
        LINE_STRIP: true,
        LINE_LOOP: true,
        TRIANGLES: true,
        TRIANGLE_STRIP: true,
        TRIANGLE_FAN: true
    };
    var BYTES_PER_TYPE = {
        UNSIGNED_SHORT: 2,
        UNSIGNED_INT: 4
    };

    /**
     * The default component type.
     */
    var DEFAULT_TYPE = 'UNSIGNED_SHORT';

    /**
     * The default render mode (primitive type).
     */
    var DEFAULT_MODE = 'TRIANGLES';

    /**
     * The default byte offset to render from.
     */
    var DEFAULT_BYTE_OFFSET = 0;

    /**
     * The default count of indices to render.
     */
    var DEFAULT_COUNT = 0;

    /**
     * Instantiates an IndexBuffer object.
     * @class IndexBuffer
     * @classdesc An index buffer object.
     *
     * @param {Uint16Array|Uin32Array|Array} arg - The index data to buffer.
     * @param {Object} options - The rendering options.
     * @param {String} options.mode - The draw mode / primitive type.
     * @param {String} options.byteOffset - The byte offset into the drawn buffer.
     * @param {String} options.count - The number of vertices to draw.
     */
    function IndexBuffer( arg, options ) {
        options = options || {};
        var gl = this.gl = WebGLContext.get();
        this.state = WebGLContextState.get( gl );
        this.buffer = gl.createBuffer();
        this.type = TYPES[ options.type ] ? options.type : DEFAULT_TYPE;
        // check if type is supported
        if ( this.type === 'UNSIGNED_INT' && !WebGLContext.checkExtension( 'OES_element_index_uint' ) ) {
            throw 'Cannot create IndexBuffer of type `UNSIGNED_INT` as extension `OES_element_index_uint` is not supported';
        }
        this.mode = MODES[ options.mode ] ? options.mode : DEFAULT_MODE;
        this.count = ( options.count !== undefined ) ? options.count : DEFAULT_COUNT;
        this.byteOffset = ( options.byteOffset !== undefined ) ? options.byteOffset : DEFAULT_BYTE_OFFSET;
        this.byteLength = 0;
        if ( arg ) {
            if ( arg instanceof WebGLBuffer ) {
                // WebGLBuffer argument
                if ( options.byteLength === undefined ) {
                    throw 'Argument of type `WebGLBuffer` must be complimented with a corresponding `options.byteLength`';
                }
                this.byteLength = options.byteLength;
                this.buffer = arg;
            } else if ( typeof arg === 'number' ) {
                // byte length argument
                if ( options.type === undefined ) {
                    throw 'Argument of type `number` must be complimented with a corresponding `options.type`';
                }
                this.bufferData( arg );
            } else if ( arg instanceof ArrayBuffer ) {
                // ArrayBuffer arg
                if ( options.type === undefined ) {
                    throw 'Argument of type `ArrayBuffer` must be complimented with a corresponding `options.type`';
                }
                this.bufferData( arg );
            } else {
                // Array or ArrayBufferView argument
                this.bufferData( arg );
            }
        } else {
            if ( options.type === undefined ) {
                throw 'Empty buffer must be complimented with a corresponding `options.type`';
            }
        }
        // ensure there isn't an overflow
        if ( this.count * BYTES_PER_TYPE[ this.type ] + this.byteOffset > this.byteLength ) {
            throw 'IndexBuffer `count` of ' + this.count + ' and `byteOffset` of ' + this.byteOffset + ' overflows the length of the buffer (' + this.byteLength + ')';
        }
    }

    /**
     * Upload index data to the GPU.
     * @memberof IndexBuffer
     *
     * @param {Array|ArrayBuffer|ArrayBufferView|number} arg - The array of data to buffer.
     *
     * @returns {IndexBuffer} The index buffer object for chaining.
     */
    IndexBuffer.prototype.bufferData = function( arg ) {
        var gl = this.gl;
        // cast array to ArrayBufferView based on provided type
        if ( arg instanceof Array ) {
            // check for type support
            if ( this.type === 'UNSIGNED_INT' ) {
                // uint32 is supported
                arg = new Uint32Array( arg );
            } else {
                // buffer to uint16
                arg = new Uint16Array( arg );
            }
        }
        // set ensure type corresponds to data
        if ( arg instanceof Uint16Array ) {
            this.type = 'UNSIGNED_SHORT';
        } else if ( arg instanceof Uint32Array ) {
            this.type = 'UNSIGNED_INT';
        } else if ( !( arg instanceof ArrayBuffer ) && typeof arg !== 'number' ) {
            throw 'Argument must be of type `Array`, `ArrayBuffer`, `ArrayBufferView`, or `number`';
        }
        // don't overwrite the count if it is already set
        if ( this.count === DEFAULT_COUNT ) {
            if ( typeof arg === 'number' ) {
                this.count = ( arg / BYTES_PER_TYPE[ this.type ] );
            } else {
                this.count = arg.length;
            }
        }
        // set byte length
        if ( typeof arg === 'number' ) {
            if ( arg % BYTES_PER_TYPE[ this.type ] ) {
                throw 'Byte length must be multiple of ' + BYTES_PER_TYPE[ this.type ];
            }
            this.byteLength = arg;
        } else {
            this.byteLength = arg.length * BYTES_PER_TYPE[ this.type ];
        }
        // buffer the data
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.buffer );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, arg, gl.STATIC_DRAW );
        return this;
    };

    /**
     * Upload partial index data to the GPU.
     * @memberof IndexBuffer
     *
     * @param {Array|ArrayBuffer|ArrayBufferView} array - The array of data to buffer.
     * @param {number} byteOffset - The byte offset at which to buffer.
     *
     * @returns {IndexBuffer} The vertex buffer object for chaining.
     */
    IndexBuffer.prototype.bufferSubData = function( array, byteOffset ) {
        var gl = this.gl;
        if ( this.byteLength === 0 ) {
            throw 'Buffer has not been allocated';
        }
        // cast array to ArrayBufferView based on provided type
        if ( array instanceof Array ) {
            // check for type support
            if ( this.type === 'UNSIGNED_INT' ) {
                // uint32 is supported
                array = new Uint32Array( array );
            } else {
                // buffer to uint16
                array = new Uint16Array( array );
            }
        } else if (
            !( array instanceof Uint16Array ) &&
            !( array instanceof Uint32Array ) &&
            !( array instanceof ArrayBuffer ) ) {
            throw 'Argument must be of type `Array`, `ArrayBuffer`, or `ArrayBufferView`';
        }
        byteOffset = ( byteOffset !== undefined ) ? byteOffset : DEFAULT_BYTE_OFFSET;
        // get the total number of attribute components from pointers
        var byteLength = array.length * BYTES_PER_TYPE[ this.type ];
        if ( byteOffset + byteLength > this.byteLength ) {
            throw 'Argument of length ' + byteLength + ' bytes and byte offset of ' + byteOffset + ' bytes overflows the buffer length of ' + this.byteLength + ' bytes';
        }
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.buffer );
        gl.bufferSubData( gl.ELEMENT_ARRAY_BUFFER, byteOffset, array );
        return this;
    };

    /**
     * Execute the draw command for the bound buffer.
     * @memberof IndexBuffer
     *
     * @param {Object} options - The options to pass to 'drawElements'. Optional.
     * @param {String} options.mode - The draw mode / primitive type.
     * @param {String} options.byteOffset - The byteOffset into the drawn buffer.
     * @param {String} options.count - The number of vertices to draw.
     *
     * @returns {IndexBuffer} Returns the index buffer object for chaining.
     */
    IndexBuffer.prototype.draw = function( options ) {
        options = options || {};
        var gl = this.gl;
        var mode = gl[ options.mode || this.mode ];
        var type = gl[ this.type ];
        var byteOffset = ( options.byteOffset !== undefined ) ? options.byteOffset : this.byteOffset;
        var count = ( options.count !== undefined ) ? options.count : this.count;
        if ( count === 0 ) {
            throw 'Attempting to draw with a count of 0';
        }
        if ( byteOffset + count * BYTES_PER_TYPE[ this.type ] > this.byteLength ) {
            throw 'Attempting to draw with `count` of ' + count + ' and `byteOffset` of ' + byteOffset + ' which overflows the total byte length of the buffer (' + this.byteLength + ')';
        }
        // if this buffer is already bound, exit early
        if ( this.state.boundIndexBuffer !== this.buffer ) {
            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.buffer );
            this.state.boundIndexBuffer = this.buffer;
        }
        // draw elements
        gl.drawElements( mode, count, type, byteOffset );
        return this;
    };

    module.exports = IndexBuffer;

}());

},{"./WebGLContext":13,"./WebGLContextState":14}],4:[function(require,module,exports){
(function () {

    'use strict';

    var WebGLContext = require('./WebGLContext');
    var WebGLContextState = require('./WebGLContextState');
    var Util = require('../util/Util');

    var TEXTURE_TARGETS = {
        TEXTURE_2D: true,
        TEXTURE_CUBE_MAP: true
    };

    var DEPTH_FORMATS = {
        DEPTH_COMPONENT: true,
        DEPTH_STENCIL: true
    };

    /**
     * Instantiates a RenderTarget object.
     * @class RenderTarget
     * @classdesc A renderTarget class to allow rendering to textures.
     */
    function RenderTarget() {
        var gl = this.gl = WebGLContext.get();
        this.state = WebGLContextState.get( gl );
        this.framebuffer = gl.createFramebuffer();
        this.textures = {};
    }

    /**
     * Binds the renderTarget object and pushes it to the front of the stack.
     * @memberof RenderTarget
     *
     * @returns {RenderTarget} The renderTarget object, for chaining.
     */
    RenderTarget.prototype.push = function() {
        if ( this.state.renderTargets.top() !== this ) {
            var gl = this.gl;
            gl.bindFramebuffer( gl.FRAMEBUFFER, this.framebuffer );
        }
        this.state.renderTargets.push( this );
        return this;
    };

    /**
     * Unbinds the renderTarget object and binds the renderTarget beneath it on this stack. If there is no underlying renderTarget, bind the backbuffer.
     * @memberof RenderTarget
     *
     * @returns {RenderTarget} The renderTarget object, for chaining.
     */
    RenderTarget.prototype.pop = function() {
        var state = this.state;
        // if there is no render target bound, exit early
        if ( state.renderTargets.top() !== this ) {
            throw 'The current render target is not the top most element on the stack';
        }
        state.renderTargets.pop();
        var top = state.renderTargets.top();
        var gl;
        if ( top ) {
            gl = top.gl;
            gl.bindFramebuffer( gl.FRAMEBUFFER, top.framebuffer );
        } else {
            gl = this.gl;
            gl.bindFramebuffer( gl.FRAMEBUFFER, null );
        }
        return this;
    };

    /**
     * Attaches the provided texture to the provided attachment location.
     * @memberof RenderTarget
     *
     * @param {Texture2D} texture - The texture to attach.
     * @param {number} index - The attachment index. (optional)
     * @param {String} target - The texture target type. (optional)
     *
     * @returns {RenderTarget} The renderTarget object, for chaining.
     */
    RenderTarget.prototype.setColorTarget = function( texture, index, target ) {
        var gl = this.gl;
        if ( !texture ) {
            throw 'Texture argument is missing';
        }
        if ( TEXTURE_TARGETS[ index ] && target === undefined ) {
            target = index;
            index = 0;
        }
        if ( index === undefined ) {
            index = 0;
        } else if ( !Util.isInteger( index ) || index < 0 ) {
            throw 'Texture color attachment index is invalid';
        }
        if ( target && !TEXTURE_TARGETS[ target ] ) {
            throw 'Texture target is invalid';
        }
        this.textures[ 'color' + index ] = texture;
        this.push();
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl[ 'COLOR_ATTACHMENT' + index ],
            gl[ target || 'TEXTURE_2D' ],
            texture.texture,
            0 );
        this.pop();
        return this;
    };

    /**
     * Attaches the provided texture to the provided attachment location.
     * @memberof RenderTarget
     *
     * @param {Texture2D} texture - The texture to attach.
     *
     * @returns {RenderTarget} The renderTarget object, for chaining.
     */
    RenderTarget.prototype.setDepthTarget = function( texture ) {
        if ( !texture ) {
            throw 'Texture argument is missing';
        }
        if ( !DEPTH_FORMATS[ texture.format ] ) {
            throw 'Provided texture is not of format `DEPTH_COMPONENT` or `DEPTH_STENCIL`';
        }
        var gl = this.gl;
        this.textures.depth = texture;
        this.push();
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            texture.texture,
            0 );
        this.pop();
        return this;
    };

    /**
     * Resizes the renderTarget and all attached textures by the provided height and width.
     * @memberof RenderTarget
     *
     * @param {number} width - The new width of the renderTarget.
     * @param {number} height - The new height of the renderTarget.
     *
     * @returns {RenderTarget} The renderTarget object, for chaining.
     */
    RenderTarget.prototype.resize = function( width, height ) {
        if ( typeof width !== 'number' || ( width <= 0 ) ) {
            throw 'Provided `width` of ' + width + ' is invalid';
        }
        if ( typeof height !== 'number' || ( height <= 0 ) ) {
            throw 'Provided `height` of ' + height + ' is invalid';
        }
        var textures = this.textures;
        Object.keys( textures ).forEach( function( key ) {
            textures[ key ].resize( width, height );
        });
        return this;
    };

    module.exports = RenderTarget;

}());

},{"../util/Util":20,"./WebGLContext":13,"./WebGLContextState":14}],5:[function(require,module,exports){
(function () {

    'use strict';

    var VertexPackage = require('../core/VertexPackage');
    var VertexBuffer = require('../core/VertexBuffer');
    var IndexBuffer = require('../core/IndexBuffer');

    /**
     * Iterates over all attribute pointers and throws an exception if an index
     * occurs mroe than once.
     * @private
     *
     * @param {Array} vertexBuffers - The array of vertexBuffers.
     */
    function checkIndexCollisions( vertexBuffers ) {
        var indices = {};
        vertexBuffers.forEach( function( buffer ) {
            Object.keys( buffer.pointers ).forEach( function( index ) {
                indices[ index ] = indices[ index ] || 0;
                indices[ index ]++;
            });
        });
        Object.keys( indices ).forEach( function( index ) {
            if ( indices[ index ] > 1 ) {
                throw 'More than one attribute pointer exists for index ' + index;
            }
        });
    }

    /**
     * Instantiates an Renderable object.
     * @class Renderable
     * @classdesc A container for one or more VertexBuffers and an optional IndexBuffer.
     *
     * @param {Object} spec - The renderable specification object.
     * @param {Array|Float32Array} spec.vertices - The vertices to interleave and buffer.
     * @param {VertexBuffer} spec.vertexBuffer - An existing vertex buffer to use.
     * @param {VertexBuffer[]} spec.vertexBuffers - Multiple vertex buffers to use.
     * @param {Array|Uint16Array|Uint32Array} spec.indices - The indices to buffer.
     * @param {IndexBuffer} spec.indexbuffer - An existing index buffer to use.
     * @param {String} spec.mode - The draw mode / primitive type.
     * @param {String} spec.byteOffset - The byte offset into the drawn buffer.
     * @param {String} spec.count - The number of vertices to draw.
     */
    function Renderable( spec ) {
        spec = spec || {};
        if ( spec.vertexBuffer || spec.vertexBuffers ) {
            // use existing vertex buffer
            this.vertexBuffers = spec.vertexBuffers || [ spec.vertexBuffer ];
        } else if ( spec.vertices ) {
            // create vertex package
            var vertexPackage = new VertexPackage( spec.vertices );
            // create vertex buffer
            this.vertexBuffers = [ new VertexBuffer( vertexPackage ) ];
        } else {
            this.vertexBuffers = [];
        }
        if ( spec.indexBuffer ) {
            // use existing index buffer
            this.indexBuffer = spec.indexBuffer;
        } else if ( spec.indices ) {
            // create index buffer
            this.indexBuffer = new IndexBuffer( spec.indices );
        } else {
            this.indexBuffer = null;
        }
        // check that no attribute indices clash
        checkIndexCollisions( this.vertexBuffers );
        // store rendering options
        this.options = {
            mode: spec.mode,
            byteOffset: spec.byteOffset,
            count: spec.count
        };
    }

    /**
     * Execute the draw command for the underlying buffers.
     * @memberof Renderable
     *
     * @param {Object} options - The options to pass to 'drawElements'. Optional.
     * @param {String} options.mode - The draw mode / primitive type.
     * @param {String} options.byteOffset - The byteOffset into the drawn buffer.
     * @param {String} options.count - The number of vertices to draw.
     *
     * @returns {Renderable} Returns the renderable object for chaining.
     */
    Renderable.prototype.draw = function( options ) {
        var overrides = options || {};
        // override options if provided
        overrides.mode = overrides.mode || this.options.mode;
        overrides.byteOffset = ( overrides.byteOffset !== undefined ) ? overrides.byteOffset : this.options.byteOffset;
        overrides.count = ( overrides.count !== undefined ) ? overrides.count : this.options.count;
        // draw the renderable
        if ( this.indexBuffer ) {
            // use index buffer to draw elements
            // bind vertex buffers and enable attribute pointers
            this.vertexBuffers.forEach( function( vertexBuffer ) {
                vertexBuffer.bind();
            });
            // draw primitives using index buffer
            this.indexBuffer.draw( overrides );
            // disable attribute pointers
            this.vertexBuffers.forEach( function( vertexBuffer ) {
                vertexBuffer.unbind();
            });
            // no advantage to unbinding as there is no stack used
        } else {
            // no index buffer, use draw arrays
            this.vertexBuffers.forEach( function( vertexBuffer ) {
                vertexBuffer.bind();
                vertexBuffer.draw( overrides );
                vertexBuffer.unbind();
            });
        }
        return this;
    };

    module.exports = Renderable;

}());

},{"../core/IndexBuffer":3,"../core/VertexBuffer":10,"../core/VertexPackage":11}],6:[function(require,module,exports){
(function () {

    'use strict';

    var WebGLContext = require('./WebGLContext');
    var ShaderParser = require('./ShaderParser');
    var WebGLContextState = require('./WebGLContextState');
    var Async = require('../util/Async');
    var XHRLoader = require('../util/XHRLoader');
    var UNIFORM_FUNCTIONS = {
        'bool': 'uniform1i',
        'bool[]': 'uniform1iv',
        'float': 'uniform1f',
        'float[]': 'uniform1fv',
        'int': 'uniform1i',
        'int[]': 'uniform1iv',
        'uint': 'uniform1i',
        'uint[]': 'uniform1iv',
        'vec2': 'uniform2fv',
        'vec2[]': 'uniform2fv',
        'ivec2': 'uniform2iv',
        'ivec2[]': 'uniform2iv',
        'vec3': 'uniform3fv',
        'vec3[]': 'uniform3fv',
        'ivec3': 'uniform3iv',
        'ivec3[]': 'uniform3iv',
        'vec4': 'uniform4fv',
        'vec4[]': 'uniform4fv',
        'ivec4': 'uniform4iv',
        'ivec4[]': 'uniform4iv',
        'mat2': 'uniformMatrix2fv',
        'mat2[]': 'uniformMatrix2fv',
        'mat3': 'uniformMatrix3fv',
        'mat3[]': 'uniformMatrix3fv',
        'mat4': 'uniformMatrix4fv',
        'mat4[]': 'uniformMatrix4fv',
        'sampler2D': 'uniform1i',
        'samplerCube': 'uniform1i'
    };

    /**
     * Given a map of existing attributes, find the lowest index that is not
     * already used. If the attribute ordering was already provided, use that
     * instead.
     * @private
     *
     * @param {Object} attributes - The existing attributes object.
     * @param {Object} declaration - The attribute declaration object.
     *
     * @returns {number} The attribute index.
     */
    function getAttributeIndex( attributes, declaration ) {
        // check if attribute is already declared, if so, use that index
        if ( attributes[ declaration.name ] ) {
            return attributes[ declaration.name ].index;
        }
        // return next available index
        return Object.keys( attributes ).length;
    }

    /**
     * Given vertex and fragment shader source, parses the declarations and appends information pertaining to the uniforms and attribtues declared.
     * @private
     *
     * @param {Shader} shader - The shader object.
     * @param {String} vertSource - The vertex shader source.
     * @param {String} fragSource - The fragment shader source.
     *
     * @returns {Object} The attribute and uniform information.
     */
    function setAttributesAndUniforms( shader, vertSource, fragSource ) {
        var declarations = ShaderParser.parseDeclarations(
            [ vertSource, fragSource ],
            [ 'uniform', 'attribute' ]
        );
        // for each declaration in the shader
        declarations.forEach( function( declaration ) {
            // check if its an attribute or uniform
            if ( declaration.qualifier === 'attribute' ) {
                // if attribute, store type and index
                var index = getAttributeIndex( shader.attributes, declaration );
                shader.attributes[ declaration.name ] = {
                    type: declaration.type,
                    index: index
                };
            } else if ( declaration.qualifier === 'uniform' ) {
                // if uniform, store type and buffer function name
                shader.uniforms[ declaration.name ] = {
                    type: declaration.type,
                    func: UNIFORM_FUNCTIONS[ declaration.type + (declaration.count > 1 ? '[]' : '') ]
                };
            }
        });
    }

    /**
     * Given a shader source string and shader type, compiles the shader and returns the resulting WebGLShader object.
     * @private
     *
     * @param {WebGLRenderingContext} gl - The webgl rendering context.
     * @param {String} shaderSource - The shader source.
     * @param {String} type - The shader type.
     *
     * @returns {WebGLShader} The compiled shader object.
     */
    function compileShader( gl, shaderSource, type ) {
        var shader = gl.createShader( gl[ type ] );
        gl.shaderSource( shader, shaderSource );
        gl.compileShader( shader );
        if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
            throw 'An error occurred compiling the shaders:\n' + gl.getShaderInfoLog( shader );
        }
        return shader;
    }

    /**
     * Binds the attribute locations for the Shader object.
     * @private
     *
     * @param {Shader} shader - The Shader object.
     */
    function bindAttributeLocations( shader ) {
        var gl = shader.gl;
        var attributes = shader.attributes;
        Object.keys( attributes ).forEach( function( key ) {
            // bind the attribute location
            gl.bindAttribLocation(
                shader.program,
                attributes[ key ].index,
                key );
        });
    }

    /**
     * Queries the webgl rendering context for the uniform locations.
     * @private
     *
     * @param {Shader} shader - The Shader object.
     */
    function getUniformLocations( shader ) {
        var gl = shader.gl;
        var uniforms = shader.uniforms;
        Object.keys( uniforms ).forEach( function( key ) {
            // get the uniform location
            uniforms[ key ].location = gl.getUniformLocation( shader.program, key );
        });
    }

    /**
     * Returns a function to load shader source from a url.
     * @private
     *
     * @param {String} url - The url to load the resource from.
     *
     * @returns {Function} The function to load the shader source.
     */
    function loadShaderSource( url ) {
        return function( done ) {
            XHRLoader.load({
                url: url,
                responseType: 'text',
                success: function( res ) {
                    done( null, res );
                },
                error: function( err ) {
                    done( err, null );
                }
            });
        };
    }

    /**
     * Returns a function to pass through the shader source.
     * @private
     *
     * @param {String} source - The source of the shader.
     *
     * @returns {Function} The function to pass through the shader source.
     */
    function passThroughSource( source ) {
        return function( done ) {
            done( null, source );
        };
    }

    /**
     * Returns a function that takes an array of GLSL source strings and URLs, and resolves them into and array of GLSL source.
     * @private
     *
     * @param {Array} sources - The shader sources.
     *
     * @returns - A function to resolve the shader sources.
     */
    function resolveSources( sources ) {
        return function( done ) {
            var tasks = [];
            sources = sources || [];
            sources = ( !( sources instanceof Array ) ) ? [ sources ] : sources;
            sources.forEach( function( source ) {
                if ( ShaderParser.isGLSL( source ) ) {
                    tasks.push( passThroughSource( source ) );
                } else {
                    tasks.push( loadShaderSource( source ) );
                }
            });
            Async.parallel( tasks, done );
        };
    }

    /**
     * Creates the shader program object from source strings. This includes:
     *    1) Compiling and linking the shader program.
     *    2) Parsing shader source for attribute and uniform information.
     *    3) Binding attribute locations, by order of delcaration.
     *    4) Querying and storing uniform location.
     * @private
     *
     * @param {Shader} shader - The Shader object.
     * @param {Object} sources - A map containing sources under 'vert' and 'frag' attributes.
     *
     * @returns {Shader} The shader object, for chaining.
     */
    function createProgram( shader, sources ) {
        var gl = shader.gl;
        var common = sources.common.join( '' );
        var vert = sources.vert.join( '' );
        var frag = sources.frag.join( '' );
        // compile shaders
        var vertexShader = compileShader( gl, common + vert, 'VERTEX_SHADER' );
        var fragmentShader = compileShader( gl, common + frag, 'FRAGMENT_SHADER' );
        // parse source for attribute and uniforms
        setAttributesAndUniforms( shader, vert, frag );
        // create the shader program
        shader.program = gl.createProgram();
        // attach vertex and fragment shaders
        gl.attachShader( shader.program, vertexShader );
        gl.attachShader( shader.program, fragmentShader );
        // bind vertex attribute locations BEFORE linking
        bindAttributeLocations( shader );
        // link shader
        gl.linkProgram( shader.program );
        // If creating the shader program failed, alert
        if ( !gl.getProgramParameter( shader.program, gl.LINK_STATUS ) ) {
            throw 'An error occured linking the shader:\n' + gl.getProgramInfoLog( shader.program );
        }
        // get shader uniform locations
        getUniformLocations( shader );
    }

    /**
     * Instantiates a Shader object.
     * @class Shader
     * @classdesc A shader class to assist in compiling and linking webgl
     * shaders, storing attribute and uniform locations, and buffering uniforms.
     *
     * @param {Object} spec - The shader specification object.
     * @param {String|String[]|Object} spec.common - Sources / URLs to be shared by both vvertex and fragment shaders.
     * @param {String|String[]|Object} spec.vert - The vertex shader sources / URLs.
     * @param {String|String[]|Object} spec.frag - The fragment shader sources / URLs.
     * @param {String[]} spec.attributes - The attribute index orderings.
     * @param {Function} callback - The callback function to execute once the shader
     *     has been successfully compiled and linked.
     */
    function Shader( spec, callback ) {
        var that = this;
        spec = spec || {};
        // check source arguments
        if ( !spec.vert ) {
            throw 'Vertex shader argument has not been provided';
        }
        if ( !spec.frag ) {
            throw 'Fragment shader argument has not been provided';
        }
        this.program = 0;
        this.gl = WebGLContext.get();
        this.state = WebGLContextState.get( this.gl );
        this.version = spec.version || '1.00';
        this.attributes = {};
        this.uniforms = {};
        // if attribute ordering is provided, use those indices
        if ( spec.attributes ) {
            spec.attributes.forEach( function( attr, index ) {
                that.attributes[ attr ] = {
                    index: index
                };
            });
        }
        // create the shader
        Async.parallel({
            common: resolveSources( spec.common ),
            vert: resolveSources( spec.vert ),
            frag: resolveSources( spec.frag ),
        }, function( err, sources ) {
            if ( err ) {
                if ( callback ) {
                    callback( err, null );
                }
                return;
            }
            // once all shader sources are loaded
            createProgram( that, sources );
            if ( callback ) {
                callback( null, that );
            }
        });
    }

    /**
     * Binds the shader object and pushes it to the front of the stack.
     * @memberof Shader
     *
     * @returns {Shader} The shader object, for chaining.
     */
    Shader.prototype.push = function() {
        // if this shader is already bound, no need to rebind
        if ( this.state.shaders.top() !== this ) {
            this.gl.useProgram( this.program );
        }
        this.state.shaders.push( this );
        return this;
    };

    /**
     * Unbinds the shader object and binds the shader beneath it on this stack. If there is no underlying shader, bind the backbuffer.
     * @memberof Shader
     *
     * @returns {Shader} The shader object, for chaining.
     */
    Shader.prototype.pop = function() {
        var state = this.state;
        // if there is no shader bound, exit early
        if ( state.shaders.top() !== this ) {
            throw 'Shader is not the top most element on the stack';
        }
        // pop shader off stack
        state.shaders.pop();
        // if there is an underlying shader, bind it
        var top = state.shaders.top();
        if ( top && top !== this ) {
            top.gl.useProgram( top.program );
        } else {
            // unbind the shader
            this.gl.useProgram( null );
        }
        return this;
    };

    /**
     * Buffer a uniform value by name.
     * @memberof Shader
     *
     * @param {String} name - The uniform name in the shader source.
     * @param {*} value - The uniform value to buffer.
     *
     * @returns {Shader} The shader object, for chaining.
     */
    Shader.prototype.setUniform = function( name, value ) {
        // ensure shader is bound
        if ( this !== this.state.shaders.top() ) {
            throw 'Attempting to set uniform `' + name + '` for an unbound shader';
        }
        var uniform = this.uniforms[ name ];
        // ensure that the uniform spec exists for the name
        if ( !uniform ) {
            throw 'No uniform found under name `' + name + '`';
        }
        // check value
        if ( value === undefined || value === null ) {
            // ensure that the uniform argument is defined
            throw 'Argument passed for uniform `' + name + '` is undefined';
        } else if ( value instanceof Array ) {
            // convert Array to Float32Array
            value = new Float32Array( value );
        } else if ( typeof value === 'boolean' ) {
            // convert boolean's to 0 or 1
            value = value ? 1 : 0;
        }
        // pass the arguments depending on the type
        if ( uniform.type === 'mat2' || uniform.type === 'mat3' || uniform.type === 'mat4' ) {
            this.gl[ uniform.func ]( uniform.location, false, value );
        } else {
            this.gl[ uniform.func ]( uniform.location, value );
        }
        return this;
    };

    /**
     * Buffer a map of uniform values.
     * @memberof Shader
     *
     * @param {Object} uniforms - The map of uniforms keyed by name.
     *
     * @returns {Shader} The shader object, for chaining.
     */
    Shader.prototype.setUniforms = function( args ) {
        // ensure shader is bound
        if ( this !== this.state.shaders.top() ) {
            throw 'Attempting to set uniform `' + name + '` for an unbound shader';
        }
        var gl = this.gl;
        var uniforms = this.uniforms;
        Object.keys( args ).forEach( function( name ) {
            var value = args[name];
            var uniform = uniforms[name];
            // ensure that the uniform exists for the name
            if ( !uniform ) {
                throw 'No uniform found under name `' + name + '`';
            }
            if ( value === undefined || value === null ) {
                // ensure that the uniform argument is defined
                throw 'Argument passed for uniform `' + name + '` is undefined';
            } else if ( value instanceof Array ) {
                // convert Array to Float32Array
                value = new Float32Array( value );
            } else if ( typeof value === 'boolean' ) {
                // convert boolean's to 0 or 1
                value = value ? 1 : 0;
            }
            // pass the arguments depending on the type
            if ( uniform.type === 'mat2' || uniform.type === 'mat3' || uniform.type === 'mat4' ) {
                gl[ uniform.func ]( uniform.location, false, value );
            } else {
                gl[ uniform.func ]( uniform.location, value );
            }
        });
        return this;
    };

    module.exports = Shader;

}());

},{"../util/Async":16,"../util/XHRLoader":21,"./ShaderParser":7,"./WebGLContext":13,"./WebGLContextState":14}],7:[function(require,module,exports){
(function () {

    'use strict';

    var PRECISION_QUALIFIERS = {
        highp: true,
        mediump: true,
        lowp: true
    };

    var PRECISION_TYPES = {
        float: 'float',
        vec2: 'float',
        vec3: 'float',
        vec4: 'float',
        ivec2: 'int',
        ivec3: 'int',
        ivec4: 'int',
        int: 'int',
        uint: 'int',
        sampler2D: 'sampler2D',
        samplerCube: 'samplerCube',
    };

    var COMMENTS_REGEXP = /(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm;
    var ENDLINE_REGEXP = /(\r\n|\n|\r)/gm;
    var WHITESPACE_REGEXP = /\s{2,}/g;
    var BRACKET_WHITESPACE_REGEXP = /(\s*)(\[)(\s*)(\d+)(\s*)(\])(\s*)/g;
    var NAME_COUNT_REGEXP = /([a-zA-Z_][a-zA-Z0-9_]*)(?:\[(\d+)\])?/;
    var PRECISION_REGEX = /\b(precision)\s+(\w+)\s+(\w+)/;
    var GLSL_REGEXP =  /void\s+main\s*\(\s*(void)*\s*\)\s*/mi;

    /**
     * Removes standard comments from the provided string.
     * @private
     *
     * @param {String} str - The string to strip comments from.
     *
     * @returns {String} The commentless string.
     */
    function stripComments( str ) {
        // regex source: https://github.com/moagrius/stripcomments
        return str.replace( COMMENTS_REGEXP, '' );
    }

    /**
     * Converts all whitespace into a single ' ' space character.
     * @private
     *
     * @param {String} str - The string to normalize whitespace from.
     *
     * @returns {String} The normalized string.
     */
    function normalizeWhitespace( str ) {
        return str.replace( ENDLINE_REGEXP, ' ' ) // remove line endings
            .replace( WHITESPACE_REGEXP, ' ' ) // normalize whitespace to single ' '
            .replace( BRACKET_WHITESPACE_REGEXP, '$2$4$6' ); // remove whitespace in brackets
    }

    /**
     * Parses the name and count out of a name statement, returning the
     * declaration object.
     * @private
     *
     * @param {String} qualifier - The qualifier string.
     * @param {String} precision - The precision string.
     * @param {String} type - The type string.
     * @param {String} entry - The variable declaration string.
     *
     * @returns {Object} The declaration object.
     */
    function parseNameAndCount( qualifier, precision, type, entry ) {
        // determine name and size of variable
        var matches = entry.match( NAME_COUNT_REGEXP );
        var name = matches[1];
        var count = ( matches[2] === undefined ) ? 1 : parseInt( matches[2], 10 );
        return {
            qualifier: qualifier,
            precision: precision,
            type: type,
            name: name,
            count: count
        };
    }

    /**
     * Parses a single 'statement'. A 'statement' is considered any sequence of
     * characters followed by a semi-colon. Therefore, a single 'statement' in
     * this sense could contain several comma separated declarations. Returns
     * all resulting declarations.
     * @private
     *
     * @param {String} statement - The statement to parse.
     * @param {Object} precisions - The current state of global precisions.
     *
     * @returns {Array} The array of parsed declaration objects.
     */
    function parseStatement( statement, precisions ) {
        // split statement on commas
        //
        // [ 'uniform highp mat4 A[10]', 'B', 'C[2]' ]
        //
        var commaSplit = statement.split(',').map( function( elem ) {
            return elem.trim();
        });

        // split declaration header from statement
        //
        // [ 'uniform', 'highp', 'mat4', 'A[10]' ]
        //
        var header = commaSplit.shift().split(' ');

        // qualifier is always first element
        //
        // 'uniform'
        //
        var qualifier = header.shift();

        // precision may or may not be declared
        //
        // 'highp' || (if it was omited) 'mat4'
        //
        var precision = header.shift();
        var type;
        // if not a precision keyword it is the type instead
        if ( !PRECISION_QUALIFIERS[ precision ] ) {
            type = precision;
            precision = precisions[ PRECISION_TYPES[ type ] ];
        } else {
            type = header.shift();
        }

        // last part of header will be the first, and possible only variable name
        //
        // [ 'A[10]', 'B', 'C[2]' ]
        //
        var names = header.concat( commaSplit );
        // if there are other names after a ',' add them as well
        var results = [];
        names.forEach( function( name ) {
            results.push( parseNameAndCount( qualifier, precision, type, name ) );
        });
        return results;
    }

    /**
     * Splits the source string by semi-colons and constructs an array of
     * declaration objects based on the provided qualifier keywords.
     * @private
     *
     * @param {String} source - The shader source string.
     * @param {String|Array} keywords - The qualifier declaration keywords.
     *
     * @returns {Array} The array of qualifier declaration objects.
     */
    function parseSource( source, keywords ) {
        // remove all comments from source
        var commentlessSource = stripComments( source );
        // normalize all whitespace in the source
        var normalized = normalizeWhitespace( commentlessSource );
        // get individual statements ( any sequence ending in ; )
        var statements = normalized.split(';');
        // build regex for parsing statements with targetted keywords
        var keywordStr = keywords.join('|');
        var keywordRegex = new RegExp( '.*\\b(' + keywordStr + ')\\b.*' );
        // parse and store global precision statements and any declarations
        var precisions = {};
        var matched = [];
        // for each statement
        statements.forEach( function( statement ) {
            // check if precision statement
            //
            // [ 'precision highp float', 'precision', 'highp', 'float' ]
            //
            var pmatch = statement.match( PRECISION_REGEX );
            if ( pmatch ) {
                precisions[ pmatch[3] ] = pmatch[2];
                return;
            }
            // check for keywords
            //
            // [ 'uniform float time' ]
            //
            var kmatch = statement.match( keywordRegex );
            if ( kmatch ) {
                // parse statement and add to array
                matched = matched.concat( parseStatement( kmatch[0], precisions ) );
            }
        });
        return matched;
    }

    /**
     * Filters out duplicate declarations present between shaders.
     * @private
     *
     * @param {Array} declarations - The array of declarations.
     *
     * @returns {Array} The filtered array of declarations.
     */
    function filterDuplicatesByName( declarations ) {
        // in cases where the same declarations are present in multiple
        // sources, this function will remove duplicates from the results
        var seen = {};
        return declarations.filter( function( declaration ) {
            if ( seen[ declaration.name ] ) {
                return false;
            }
            seen[ declaration.name ] = true;
            return true;
        });
    }

    module.exports = {

        /**
         * Parses the provided GLSL source, and returns all declaration statements that contain the provided qualifier type. This can be used to extract all attributes and uniform names and types from a shader.
         *
         * For example, when provided a 'uniform' qualifiers, the declaration:
         *
         *     'uniform highp vec3 uSpecularColor;'
         *
         * Would be parsed to:
         *     {
         *         qualifier: 'uniform',
         *         type: 'vec3',
         *         name: 'uSpecularColor',
         *         count: 1
         *     }
         * @param {String|Array} sources - The shader sources.
         * @param {String|Array} qualifiers - The qualifiers to extract.
         *
         * @returns {Array} The array of qualifier declaration statements.
         */
        parseDeclarations: function( sources, qualifiers ) {
            // if no sources or qualifiers are provided, return empty array
            if ( !qualifiers || qualifiers.length === 0 ||
                !sources || sources.length === 0 ) {
                return [];
            }
            sources = ( sources instanceof Array ) ? sources : [ sources ];
            qualifiers = ( qualifiers instanceof Array ) ? qualifiers : [ qualifiers ];
            // parse out targetted declarations
            var declarations = [];
            sources.forEach( function( source ) {
                declarations = declarations.concat( parseSource( source, qualifiers ) );
            });
            // remove duplicates and return
            return filterDuplicatesByName( declarations );
        },

        /**
         * Detects based on the existence of a 'void main() {' statement, if the string is glsl source code.
         *
         * @param {String} str - The input string to test.
         *
         * @returns {boolean} - True if the string is glsl code.
         */
        isGLSL: function( str ) {
            return GLSL_REGEXP.test( str );
        }

    };

}());

},{}],8:[function(require,module,exports){
(function () {

    'use strict';

    var WebGLContext = require('./WebGLContext');
    var WebGLContextState = require('./WebGLContextState');
    var Util = require('../util/Util');
    var MAG_FILTERS = {
        NEAREST: true,
        LINEAR: true
    };
    var MIN_FILTERS = {
        NEAREST: true,
        LINEAR: true,
        NEAREST_MIPMAP_NEAREST: true,
        LINEAR_MIPMAP_NEAREST: true,
        NEAREST_MIPMAP_LINEAR: true,
        LINEAR_MIPMAP_LINEAR: true
    };
    var NON_MIPMAP_MIN_FILTERS = {
        NEAREST: true,
        LINEAR: true,
    };
    var MIPMAP_MIN_FILTERS = {
        NEAREST_MIPMAP_NEAREST: true,
        LINEAR_MIPMAP_NEAREST: true,
        NEAREST_MIPMAP_LINEAR: true,
        LINEAR_MIPMAP_LINEAR: true
    };
    var WRAP_MODES = {
        REPEAT: true,
        MIRRORED_REPEAT: true,
        CLAMP_TO_EDGE: true
    };
    var DEPTH_TYPES = {
        DEPTH_COMPONENT: true,
        DEPTH_STENCIL: true
    };

    /**
     * The default type for textures.
     */
    var DEFAULT_TYPE = 'UNSIGNED_BYTE';

    /**
     * The default format for textures.
     */
    var DEFAULT_FORMAT = 'RGBA';

    /**
     * The default wrap mode for textures.
     */
    var DEFAULT_WRAP = 'REPEAT';

    /**
     * The default min / mag filter for textures.
     */
    var DEFAULT_FILTER = 'LINEAR';

    /**
     * The default for whether alpha premultiplying is enabled.
     */
    var DEFAULT_PREMULTIPLY_ALPHA = true;

    /**
     * The default for whether mipmapping is enabled.
     */
    var DEFAULT_MIPMAP = true;

    /**
     * The default for whether invert-y is enabled.
     */
    var DEFAULT_INVERT_Y = true;

    /**
     * The default mip-mapping filter suffix.
     */
    var DEFAULT_MIPMAP_MIN_FILTER_SUFFIX = '_MIPMAP_LINEAR';

    /**
     * Instantiates a Texture2D object.
     * @class Texture2D
     * @classdesc A texture class to represent a 2D texture.
     *
     * @param {Uint8Array|Uint16Array|Uint32Array|Float32Array|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} spec.src - The data to buffer.
     * @param {number} width - The width of the texture.
     * @param {number} height - The height of the texture.
     * @param {String} spec.wrap - The wrapping type over both S and T dimension.
     * @param {String} spec.wrapS - The wrapping type over the S dimension.
     * @param {String} spec.wrapT - The wrapping type over the T dimension.
     * @param {String} spec.filter - The min / mag filter used during scaling.
     * @param {String} spec.minFilter - The minification filter used during scaling.
     * @param {String} spec.magFilter - The magnification filter used during scaling.
     * @param {bool} spec.mipMap - Whether or not mip-mapping is enabled.
     * @param {bool} spec.invertY - Whether or not invert-y is enabled.
     * @param {bool} spec.preMultiplyAlpha - Whether or not alpha premultiplying is enabled.
     * @param {String} spec.format - The texture pixel format.
     * @param {String} spec.type - The texture pixel component type.
     */
    function Texture2D( spec ) {
        spec = spec || {};
        // get specific params
        spec.wrapS = spec.wrapS || spec.wrap;
        spec.wrapT = spec.wrapT || spec.wrap;
        spec.minFilter = spec.minFilter || spec.filter;
        spec.magFilter = spec.magFilter || spec.filter;
        // set texture params
        this.wrapS = spec.wrapS || DEFAULT_WRAP;
        this.wrapT = spec.wrapT || DEFAULT_WRAP;
        this.minFilter = spec.minFilter || DEFAULT_FILTER;
        this.magFilter = spec.magFilter || DEFAULT_FILTER;
        // set other properties
        this.mipMap = spec.mipMap !== undefined ? spec.mipMap : DEFAULT_MIPMAP;
        this.invertY = spec.invertY !== undefined ? spec.invertY : DEFAULT_INVERT_Y;
        this.preMultiplyAlpha = spec.preMultiplyAlpha !== undefined ? spec.preMultiplyAlpha : DEFAULT_PREMULTIPLY_ALPHA;
        // set format
        this.format = spec.format || DEFAULT_FORMAT;
        if ( DEPTH_TYPES[ this.format ] && !WebGLContext.checkExtension( 'WEBGL_depth_texture' ) ) {
            throw 'Cannot create Texture2D of format `' + this.format + '` as `WEBGL_depth_texture` extension is unsupported';
        }
        // set type
        this.type = spec.type || DEFAULT_TYPE;
        if ( this.type === 'FLOAT' && !WebGLContext.checkExtension( 'OES_texture_float' ) ) {
            throw 'Cannot create Texture2D of type `FLOAT` as `OES_texture_float` extension is unsupported';
        }
        // check size
        if ( !Util.isCanvasType( spec.src ) ) {
            // if not a canvas type, dimensions MUST be specified
            if ( typeof spec.width !== 'number' || spec.width <= 0 ) {
                throw '`width` argument is missing or invalid';
            }
            if ( typeof spec.height !== 'number' || spec.height <= 0 ) {
                throw '`height` argument is missing or invalid';
            }
            if ( Util.mustBePowerOfTwo( this ) ) {
                if ( !Util.isPowerOfTwo( spec.width ) ) {
                    throw 'Parameters require a power-of-two texture, yet provided width of ' + spec.width + ' is not a power of two';
                }
                if ( !Util.isPowerOfTwo( spec.height ) ) {
                    throw 'Parameters require a power-of-two texture, yet provided height of ' + spec.height + ' is not a power of two';
                }
            }
        }
        var gl = this.gl = WebGLContext.get();
        this.state = WebGLContextState.get( gl );
        // create texture object
        this.texture = gl.createTexture();
        // buffer the data
        this.bufferData( spec.src || null, spec.width, spec.height );
        this.setParameters( this );
    }

    /**
     * Binds the texture object and pushes it onto the stack.
     * @memberof Texture2D
     *
     * @param {number} location - The texture unit location index. Default to 0.
     *
     * @returns {Texture2D} The texture object, for chaining.
     */
    Texture2D.prototype.push = function( location ) {
        if ( location === undefined ) {
            location = 0;
        } else if ( !Util.isInteger( location ) || location < 0 ) {
            throw 'Texture unit location is invalid';
        }
        // if this texture is already bound, no need to rebind
        if ( this.state.texture2Ds.top( location ) !== this ) {
            var gl = this.gl;
            gl.activeTexture( gl[ 'TEXTURE' + location ] );
            gl.bindTexture( gl.TEXTURE_2D, this.texture );
        }
        // add to stack under the texture unit
        this.state.texture2Ds.push( location, this );
        return this;
    };

    /**
     * Unbinds the texture object and binds the texture beneath it on this stack. If there is no underlying texture, unbinds the unit.
     * @memberof Texture2D
     *
     * @param {number} location - The texture unit location index. Default to 0.
     *
     * @returns {Texture2D} The texture object, for chaining.
     */
    Texture2D.prototype.pop = function( location ) {
        if ( location === undefined ) {
            location = 0;
        } else if ( !Util.isInteger( location ) || location < 0 ) {
            throw 'Texture unit location is invalid';
        }
        var state = this.state;
        if ( state.texture2Ds.top( location ) !== this ) {
            throw 'Texture2D is not the top most element on the stack';
        }
        state.texture2Ds.pop( location );
        var gl;
        var top = state.texture2Ds.top( location );
        if ( top ) {
            if ( top !== this ) {
                // bind underlying texture
                gl = top.gl;
                gl.activeTexture( gl[ 'TEXTURE' + location ] );
                gl.bindTexture( gl.TEXTURE_2D, top.texture );
            }
        } else {
            // unbind
            gl = this.gl;
            gl.bindTexture( gl.TEXTURE_2D, null );
        }
    };

    /**
     * Buffer data into the texture.
     * @memberof Texture2D
     *
     * @param {Array|ArrayBufferView|null} data - The data array to buffer.
     * @param {number} width - The width of the data.
     * @param {number} height - The height of the data.
     *
     * @returns {Texture2D} The texture object, for chaining.
     */
    Texture2D.prototype.bufferData = function( data, width, height ) {
        var gl = this.gl;
        this.push();
        // invert y if specified
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, this.invertY );
        // premultiply alpha if specified
        gl.pixelStorei( gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.preMultiplyAlpha );
        // cast array arg
        if ( data instanceof Array ) {
            if ( this.type === 'UNSIGNED_SHORT' ) {
                data = new Uint16Array( data );
            } else if ( this.type === 'UNSIGNED_INT' ) {
                data = new Uint32Array( data );
            } else if ( this.type === 'FLOAT' ) {
                data = new Float32Array( data );
            } else {
                data = new Uint8Array( data );
            }
        }
        // set ensure type corresponds to data
        if ( data instanceof Uint8Array ) {
            this.type = 'UNSIGNED_BYTE';
        } else if ( data instanceof Uint16Array ) {
            this.type = 'UNSIGNED_SHORT';
        } else if ( data instanceof Uint32Array ) {
            this.type = 'UNSIGNED_INT';
        } else if ( data instanceof Float32Array ) {
            this.type = 'FLOAT';
        } else if ( data && !( data instanceof ArrayBuffer ) && !Util.isCanvasType( data ) ) {
            throw 'Argument must be of type `Array`, `ArrayBuffer`, `ArrayBufferView`, `ImageData`, `HTMLImageElement`, `HTMLCanvasElement`, `HTMLVideoElement`, or null';
        }
        if ( Util.isCanvasType( data ) ) {
            // store width and height
            this.width = data.width;
            this.height = data.height;
            // buffer the texture
            gl.texImage2D(
                gl.TEXTURE_2D,
                0, // mip-map level,
                gl[ this.format ], // webgl requires format === internalFormat
                gl[ this.format ],
                gl[ this.type ],
                data );
        } else {
            // store width and height
            this.width = width || this.width;
            this.height = height || this.height;
            // buffer the texture data
            gl.texImage2D(
                gl.TEXTURE_2D,
                0, // mip-map level
                gl[ this.format ], // webgl requires format === internalFormat
                this.width,
                this.height,
                0, // border, must be 0
                gl[ this.format ],
                gl[ this.type ],
                data );
        }
        // generate mip maps
        if ( this.mipMap ) {
            gl.generateMipmap( gl.TEXTURE_2D );
        }
        this.pop();
        return this;
    };

    /**
     * Set the texture parameters.
     * @memberof Texture2D
     *
     * @param {Object} params - The parameters by name.
     * @param {String} params.wrap - The wrapping type over both S and T dimension.
     * @param {String} params.wrapS - The wrapping type over the S dimension.
     * @param {String} params.wrapT - The wrapping type over the T dimension.
     * @param {String} params.filter - The min / mag filter used during scaling.
     * @param {String} params.minFilter - The minification filter used during scaling.
     * @param {String} params.magFilter - The magnification filter used during scaling.
     *
     * @returns {Texture2D} The texture object, for chaining.
     */
    Texture2D.prototype.setParameters = function( params ) {
        var gl = this.gl;
        this.push();
        // set wrap S parameter
        var param = params.wrapS || params.wrap;
        if ( param ) {
            if ( WRAP_MODES[ param ] ) {
                this.wrapS = param;
                gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[ this.wrapS ] );
            } else {
                throw 'Texture parameter `' + param + '` is not a valid value for `TEXTURE_WRAP_S`';
            }
        }
        // set wrap T parameter
        param = params.wrapT || params.wrap;
        if ( param ) {
            if ( WRAP_MODES[ param ] ) {
                this.wrapT = param;
                gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[ this.wrapT ] );
            } else {
                throw 'Texture parameter `' + param + '` is not a valid value for `TEXTURE_WRAP_T`';
            }
        }
        // set mag filter parameter
        param = params.magFilter || params.filter;
        if ( param ) {
            if ( MAG_FILTERS[ param ] ) {
                this.magFilter = param;
                gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[ this.magFilter ] );
            } else {
                throw 'Texture parameter `' + param + '` is not a valid value for `TEXTURE_MAG_FILTER`';
            }
        }
        // set min filter parameter
        param = params.minFilter || params.filter;
        if ( param ) {
            if ( this.mipMap ) {
                if ( NON_MIPMAP_MIN_FILTERS[ param ] ) {
                    // upgrade to mip-map min filter
                    param += DEFAULT_MIPMAP_MIN_FILTER_SUFFIX;
                }
                if ( MIPMAP_MIN_FILTERS[ param ] ) {
                    this.minFilter = param;
                    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[ this.minFilter ] );
                } else  {
                    throw 'Texture parameter `' + param + '` is not a valid value for `TEXTURE_MIN_FILTER`';
                }
            } else {
                if ( MIN_FILTERS[ param ] ) {
                    this.minFilter = param;
                    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[ this.minFilter ] );
                } else {
                    throw 'Texture parameter `' + param + '` is not a valid value for `TEXTURE_MIN_FILTER`';
                }
            }
        }
        this.pop();
        return this;
    };

    /**
     * Resize the underlying texture. This clears the texture data.
     * @memberof Texture2D
     *
     * @param {number} width - The new width of the texture.
     * @param {number} height - The new height of the texture.
     *
     * @returns {Texture2D} The texture object, for chaining.
     */
    Texture2D.prototype.resize = function( width, height ) {
        if ( typeof width !== 'number' || ( width <= 0 ) ) {
            throw 'Provided `width` of ' + width + ' is invalid';
        }
        if ( typeof height !== 'number' || ( height <= 0 ) ) {
            throw 'Provided `height` of ' + height + ' is invalid';
        }
        this.bufferData( null, width, height );
        return this;
    };

    module.exports = Texture2D;

}());

},{"../util/Util":20,"./WebGLContext":13,"./WebGLContextState":14}],9:[function(require,module,exports){
(function () {

    'use strict';

    var WebGLContext = require('./WebGLContext');
    var WebGLContextState = require('./WebGLContextState');
    var Async = require('../util/Async');
    var Util = require('../util/Util');
    var ImageLoader = require('../util/ImageLoader');
    var FACES = [
        '-x', '+x',
        '-y', '+y',
        '-z', '+z'
    ];
    var FACE_TARGETS = {
        '+z': 'TEXTURE_CUBE_MAP_POSITIVE_Z',
        '-z': 'TEXTURE_CUBE_MAP_NEGATIVE_Z',
        '+x': 'TEXTURE_CUBE_MAP_POSITIVE_X',
        '-x': 'TEXTURE_CUBE_MAP_NEGATIVE_X',
        '+y': 'TEXTURE_CUBE_MAP_POSITIVE_Y',
        '-y': 'TEXTURE_CUBE_MAP_NEGATIVE_Y'
    };
    var TARGETS = {
        TEXTURE_CUBE_MAP_POSITIVE_Z: true,
        TEXTURE_CUBE_MAP_NEGATIVE_Z: true,
        TEXTURE_CUBE_MAP_POSITIVE_X: true,
        TEXTURE_CUBE_MAP_NEGATIVE_X: true,
        TEXTURE_CUBE_MAP_POSITIVE_Y: true,
        TEXTURE_CUBE_MAP_NEGATIVE_Y: true
    };
    var MAG_FILTERS = {
        NEAREST: true,
        LINEAR: true
    };
    var MIN_FILTERS = {
        NEAREST: true,
        LINEAR: true,
        NEAREST_MIPMAP_NEAREST: true,
        LINEAR_MIPMAP_NEAREST: true,
        NEAREST_MIPMAP_LINEAR: true,
        LINEAR_MIPMAP_LINEAR: true
    };
    var NON_MIPMAP_MIN_FILTERS = {
        NEAREST: true,
        LINEAR: true,
    };
    var MIPMAP_MIN_FILTERS = {
        NEAREST_MIPMAP_NEAREST: true,
        LINEAR_MIPMAP_NEAREST: true,
        NEAREST_MIPMAP_LINEAR: true,
        LINEAR_MIPMAP_LINEAR: true
    };
    var WRAP_MODES = {
        REPEAT: true,
        MIRRORED_REPEAT: true,
        CLAMP_TO_EDGE: true
    };
    var FORMATS = {
        RGB: true,
        RGBA: true
    };

    /**
     * The default type for textures.
     */
    var DEFAULT_TYPE = 'UNSIGNED_BYTE';

    /**
     * The default format for textures.
     */
    var DEFAULT_FORMAT = 'RGBA';

    /**
     * The default wrap mode for textures.
     */
    var DEFAULT_WRAP = 'CLAMP_TO_EDGE';

    /**
     * The default min / mag filter for textures.
     */
    var DEFAULT_FILTER = 'LINEAR';

    /**
     * The default for whether alpha premultiplying is enabled.
     */
    var DEFAULT_PREMULTIPLY_ALPHA = true;

    /**
     * The default for whether mipmapping is enabled.
     */
    var DEFAULT_MIPMAP = true;

    /**
     * The default for whether invert-y is enabled.
     */
    var DEFAULT_INVERT_Y = true;

    /**
     * The default mip-mapping filter suffix.
     */
    var DEFAULT_MIPMAP_MIN_FILTER_SUFFIX = '_MIPMAP_LINEAR';

    /**
     * Checks the width and height of the cubemap and throws an exception if
     * it does not meet requirements.
     * @private
     *
     * @param {TextureCubeMap} cubeMap - The cube map texture object.
     */
    function checkDimensions( cubeMap ) {
        if ( typeof cubeMap.width !== 'number' || cubeMap.width <= 0 ) {
            throw '`width` argument is missing or invalid';
        }
        if ( typeof cubeMap.height !== 'number' || cubeMap.height <= 0 ) {
            throw '`height` argument is missing or invalid';
        }
        if ( cubeMap.width !== cubeMap.height ) {
            throw 'Provided `width` must be equal to `height`';
        }
        if ( Util.mustBePowerOfTwo( cubeMap ) && !Util.isPowerOfTwo( cubeMap.width ) ) {
            throw 'Parameters require a power-of-two texture, yet provided size of ' + cubeMap.width + ' is not a power of two';
        }
    }

    /**
     * Returns a function to load a face from a url.
     * @private
     *
     * @param {TextureCubeMap} cubeMap - The cube map texture object.
     * @param {string} target - The texture target.
     * @param {string} url - The url to load the face from.
     *
     * @returns {function} The loader function.
     */
    function loadFaceURL( cubeMap, target, url ) {
        return function( done ) {
            // TODO: put extension handling for arraybuffer / image / video differentiation
            ImageLoader.load({
                url: url,
                success: function( image ) {
                    image = Util.resizeCanvas( cubeMap, image );
                    cubeMap.bufferData( target, image );
                    done( null );
                },
                error: function( err ) {
                    done( err, null );
                }
            });
        };
    }

    /**
     * Returns a function to load a face from a canvas type object.
     * @private
     *
     * @param {TextureCubeMap} cubeMap - The cube map texture object.
     * @param {string} target - The texture target.
     * @param {ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} canvas - The canvas type object.
     *
     * @returns {function} The loader function.
     */
    function loadFaceCanvas( cubeMap, target, canvas ) {
        return function( done ) {
            canvas = Util.resizeCanvas( cubeMap, canvas );
            cubeMap.bufferData( target, canvas );
            done( null );
        };
    }

    /**
     * Returns a function to load a face from an array type object.
     * @private
     *
     * @param {TextureCubeMap} cubeMap - The cube map texture object.
     * @param {string} target - The texture target.
     * @param {Array|ArrayBuffer|ArrayBufferView} arr - The array type object.
     *
     * @returns {function} The loader function.
     */
    function loadFaceArray( cubeMap, target, arr ) {
        checkDimensions( cubeMap );
        return function( done ) {
            cubeMap.bufferData( target, arr );
            done( null );
        };
    }

    /**
     * Instantiates a TextureCubeMap object.
     * @class TextureCubeMap
     * @classdesc A texture class to represent a cube map texture.
     *
     * @param {Object} spec - The specification arguments
     * @param {Object} spec.faces - The faces to buffer, under keys '+x', '+y', '+z', '-x', '-y', and '-z'.
     * @param {number} spec.width - The width of the faces.
     * @param {number} spec.height - The height of the faces.
     * @param {String} spec.wrap - The wrapping type over both S and T dimension.
     * @param {String} spec.wrapS - The wrapping type over the S dimension.
     * @param {String} spec.wrapT - The wrapping type over the T dimension.
     * @param {String} spec.filter - The min / mag filter used during scaling.
     * @param {String} spec.minFilter - The minification filter used during scaling.
     * @param {String} spec.magFilter - The magnification filter used during scaling.
     * @param {bool} spec.mipMap - Whether or not mip-mapping is enabled.
     * @param {bool} spec.invertY - Whether or not invert-y is enabled.
     * @param {bool} spec.preMultiplyAlpha - Whether or not alpha premultiplying is enabled.
     * @param {String} spec.format - The texture pixel format.
     * @param {String} spec.type - The texture pixel component type.
     */
    function TextureCubeMap( spec, callback ) {
        var that = this;
        var gl = this.gl = WebGLContext.get();
        this.state = WebGLContextState.get( gl );
        this.texture = gl.createTexture();
        // get specific params
        spec.wrapS = spec.wrapS || spec.wrap;
        spec.wrapT = spec.wrapT || spec.wrap;
        spec.minFilter = spec.minFilter || spec.filter;
        spec.magFilter = spec.magFilter || spec.filter;
        // set texture params
        this.wrapS = WRAP_MODES[ spec.wrapS ] ? spec.wrapS : DEFAULT_WRAP;
        this.wrapT = WRAP_MODES[ spec.wrapT ] ? spec.wrapT : DEFAULT_WRAP;
        this.minFilter = MIN_FILTERS[ spec.minFilter ] ? spec.minFilter : DEFAULT_FILTER;
        this.magFilter = MAG_FILTERS[ spec.magFilter ] ? spec.magFilter : DEFAULT_FILTER;
        // set other properties
        this.mipMap = spec.mipMap !== undefined ? spec.mipMap : DEFAULT_MIPMAP;
        this.invertY = spec.invertY !== undefined ? spec.invertY : DEFAULT_INVERT_Y;
        this.preMultiplyAlpha = spec.preMultiplyAlpha !== undefined ? spec.preMultiplyAlpha : DEFAULT_PREMULTIPLY_ALPHA;
        // set format and type
        this.format = FORMATS[ spec.format ] ? spec.format : DEFAULT_FORMAT;
        this.type = spec.type || DEFAULT_TYPE;
        if ( this.type === 'FLOAT' && !WebGLContext.checkExtension( 'OES_texture_float' ) ) {
            throw 'Cannot create Texture2D of type `FLOAT` as `OES_texture_float` extension is unsupported';
        }
        // set dimensions if provided
        this.width = spec.width;
        this.height = spec.height;
        // set buffered faces
        this.bufferedFaces = [];
        // create cube map based on input
        if ( spec.faces ) {
            var tasks = [];
            FACES.forEach( function( id ) {
                var face = spec.faces[ id ];
                var target = FACE_TARGETS[ id ];
                // load based on type
                if ( typeof face === 'string' ) {
                    // url
                    tasks.push( loadFaceURL( that, target, face ) );
                } else if ( Util.isCanvasType( face ) ) {
                    // canvas
                    tasks.push( loadFaceCanvas( that, target, face ) );
                } else {
                    // array / arraybuffer or null
                    tasks.push( loadFaceArray( that, target, face ) );
                }
            });
            Async.parallel( tasks, function( err ) {
                if ( err ) {
                    if ( callback ) {
                        callback( err, null );
                    }
                    return;
                }
                // set parameters
                that.setParameters( that );
                if ( callback ) {
                    callback( null, that );
                }
            });
        } else {
            // null
            checkDimensions( this );
            FACES.forEach( function( id ) {
                that.bufferData( FACE_TARGETS[ id ], null );
            });
            // set parameters
            this.setParameters( this );
        }
    }

    /**
     * Binds the texture object and pushes it to onto the stack.
     * @memberof TextureCubeMap
     *
     * @param {number} location - The texture unit location index.
     *
     * @returns {TextureCubeMap} The texture object, for chaining.
     */
    TextureCubeMap.prototype.push = function( location ) {
        if ( location === undefined ) {
            location = 0;
        } else if ( !Util.isInteger( location ) || location < 0 ) {
            throw 'Texture unit location is invalid';
        }
        // if this texture is already bound, no need to rebind
        if ( this.state.textureCubeMaps.top( location ) !== this ) {
            var gl = this.gl;
            gl.activeTexture( gl[ 'TEXTURE' + location ] );
            gl.bindTexture( gl.TEXTURE_CUBE_MAP, this.texture );
        }
        // add to stack under the texture unit
        this.state.textureCubeMaps.push( location, this );
        return this;
    };

    /**
     * Unbinds the texture object and binds the texture beneath it on
     * this stack. If there is no underlying texture, unbinds the unit.
     * @memberof TextureCubeMap
     *
     * @param {number} location - The texture unit location index.
     *
     * @returns {TextureCubeMap} The texture object, for chaining.
     */
    TextureCubeMap.prototype.pop = function( location ) {
        if ( location === undefined ) {
            location = 0;
        } else if ( !Util.isInteger( location ) || location < 0 ) {
            throw 'Texture unit location is invalid';
        }
        var state = this.state;
        if ( state.textureCubeMaps.top( location ) !== this ) {
            throw 'The current texture is not the top most element on the stack';
        }
        state.textureCubeMaps.pop( location );
        var gl;
        var top = state.textureCubeMaps.top( location );
        if ( top ) {
            if ( top !== this ) {
                // bind underlying texture
                gl = top.gl;
                gl.activeTexture( gl[ 'TEXTURE' + location ] );
                gl.bindTexture( gl.TEXTURE_CUBE_MAP, top.texture );
            }
        } else {
            // unbind
            gl = this.gl;
            gl.bindTexture( gl.TEXTURE_CUBE_MAP, null );
        }
        return this;
    };

    /**
     * Buffer data into the respective cube map face.
     * @memberof TextureCubeMap
     *
     * @param {string} target - The face target.
     * @param {Object|null} data - The face data.
     *
     * @returns {TextureCubeMap} The texture object, for chaining.
     */
    TextureCubeMap.prototype.bufferData = function( target, data ) {
        if ( !TARGETS[ target ] ) {
            throw 'Provided `target` of ' + target + ' is invalid';
        }
        var gl = this.gl;
        // buffer face texture
        this.push();
        // invert y if specified
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, this.invertY );
        // premultiply alpha if specified
        gl.pixelStorei( gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.preMultiplyAlpha );
        // cast array arg
        if ( data instanceof Array ) {
            if ( this.type === 'UNSIGNED_SHORT' ) {
                data = new Uint16Array( data );
            } else if ( this.type === 'UNSIGNED_INT' ) {
                data = new Uint32Array( data );
            } else if ( this.type === 'FLOAT' ) {
                data = new Float32Array( data );
            } else {
                data = new Uint8Array( data );
            }
        }
        // set ensure type corresponds to data
        if ( data instanceof Uint8Array ) {
            this.type = 'UNSIGNED_BYTE';
        } else if ( data instanceof Uint16Array ) {
            this.type = 'UNSIGNED_SHORT';
        } else if ( data instanceof Uint32Array ) {
            this.type = 'UNSIGNED_INT';
        } else if ( data instanceof Float32Array ) {
            this.type = 'FLOAT';
        } else if ( data && !( data instanceof ArrayBuffer ) && !Util.isCanvasType( data ) ) {
            throw 'Argument must be of type `Array`, `ArrayBuffer`, `ArrayBufferView`, `ImageData`, `HTMLImageElement`, `HTMLCanvasElement`, `HTMLVideoElement`, or null';
        }
        // buffer the data
        if ( Util.isCanvasType( data ) ) {
            // store width and height
            this.width = data.width;
            this.height = data.height;
            // buffer the texture
            gl.texImage2D(
                gl[ target ],
                0, // mip-map level,
                gl[ this.format ], // webgl requires format === internalFormat
                gl[ this.format ],
                gl[ this.type ],
                data );
        } else {
            // buffer the texture data
            gl.texImage2D(
                gl[ target ],
                0, // mip-map level
                gl[ this.format ], // webgl requires format === internalFormat
                this.width,
                this.height,
                0, // border, must be 0
                gl[ this.format ],
                gl[ this.type ],
                data );
        }
        // track that face was buffered
        if ( this.bufferedFaces.indexOf( target ) < 0 ) {
            this.bufferedFaces.push( target );
        }
        // if all faces buffered, generate mipmaps
        if ( this.mipMap && this.bufferedFaces.length === 6 ) {
            // only generate mipmaps if all faces are buffered
            gl.generateMipmap( gl.TEXTURE_CUBE_MAP );
        }
        this.pop();
        return this;
    };

    /**
     * Set the texture parameters.
     * @memberof TextureCubeMap
     *
     * @param {Object} params - The parameters by name.
     * @param {String} params.wrap - The wrapping type over both S and T dimension.
     * @param {String} params.wrapS - The wrapping type over the S dimension.
     * @param {String} params.wrapT - The wrapping type over the T dimension.
     * @param {String} params.filter - The min / mag filter used during scaling.
     * @param {String} params.minFilter - The minification filter used during scaling.
     * @param {String} params.magFilter - The magnification filter used during scaling.
     *
     * @returns {TextureCubeMap} The texture object, for chaining.
     */
    TextureCubeMap.prototype.setParameters = function( params ) {
        var gl = this.gl;
        this.push();
        // set wrap S parameter
        var param = params.wrapS || params.wrap;
        if ( param ) {
            if ( WRAP_MODES[ param ] ) {
                this.wrapS = param;
                gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl[ this.wrapS ] );
            } else {
                throw 'Texture parameter `' + param + '` is not a valid value for `TEXTURE_WRAP_S`';
            }
        }
        // set wrap T parameter
        param = params.wrapT || params.wrap;
        if ( param ) {
            if ( WRAP_MODES[ param ] ) {
                this.wrapT = param;
                gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl[ this.wrapT ] );
            } else {
                throw 'Texture parameter `' + param + '` is not a valid value for `TEXTURE_WRAP_T`';
            }
        }
        // set mag filter parameter
        param = params.magFilter || params.filter;
        if ( param ) {
            if ( MAG_FILTERS[ param ] ) {
                this.magFilter = param;
                gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl[ this.magFilter ] );
            } else {
                throw 'Texture parameter `' + param + '` is not a valid value for `TEXTURE_MAG_FILTER`';
            }
        }
        // set min filter parameter
        param = params.minFilter || params.filter;
        if ( param ) {
            if ( this.mipMap ) {
                if ( NON_MIPMAP_MIN_FILTERS[ param ] ) {
                    // upgrade to mip-map min filter
                    param += DEFAULT_MIPMAP_MIN_FILTER_SUFFIX;
                }
                if ( MIPMAP_MIN_FILTERS[ param ] ) {
                    this.minFilter = param;
                    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl[ this.minFilter ] );
                } else  {
                    throw 'Texture parameter `' + param + '` is not a valid value for `TEXTURE_MIN_FILTER`';
                }
            } else {
                if ( MIN_FILTERS[ param ] ) {
                    this.minFilter = param;
                    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl[ this.minFilter ] );
                } else {
                    throw 'Texture parameter `' + param + '` is not a valid value for `TEXTURE_MIN_FILTER`';
                }
            }
        }
        this.pop();
        return this;
    };

    module.exports = TextureCubeMap;

}());

},{"../util/Async":16,"../util/ImageLoader":17,"../util/Util":20,"./WebGLContext":13,"./WebGLContextState":14}],10:[function(require,module,exports){
(function () {

    'use strict';

    var WebGLContext = require('./WebGLContext');
    var WebGLContextState = require('./WebGLContextState');
    var VertexPackage = require('./VertexPackage');
    var MODES = {
        POINTS: true,
        LINES: true,
        LINE_STRIP: true,
        LINE_LOOP: true,
        TRIANGLES: true,
        TRIANGLE_STRIP: true,
        TRIANGLE_FAN: true
    };
    var TYPES = {
        FLOAT: true
    };
    var BYTES_PER_TYPE = {
        FLOAT: 4
    };
    var BYTES_PER_COMPONENT = BYTES_PER_TYPE.FLOAT;
    var SIZES = {
        1: true,
        2: true,
        3: true,
        4: true
    };

    /**
     * The default render mode (primitive type).
     */
    var DEFAULT_MODE = 'TRIANGLES';

    /**
     * The default byte offset to render from.
     */
    var DEFAULT_BYTE_OFFSET = 0;

    /**
     * The default count of indices to render.
     */
    var DEFAULT_COUNT = 0;

    /**
     * Parse the attribute pointers and determine the byte stride of the buffer.
     * @private
     *
     * @param {Object} attributePointers - The attribute pointer map.
     *
     * @returns {number} - The byte stride of the buffer.
     */
    function getStride( attributePointers ) {
        // if there is only one attribute pointer assigned to this buffer,
        // there is no need for stride, set to default of 0
        var indices = Object.keys( attributePointers );
        if ( indices.length === 1 ) {
            return 0;
        }
        var maxByteOffset = 0;
        var byteSizeSum = 0;
        var byteStride = 0;
        indices.forEach( function( index ) {
            var pointer = attributePointers[ index ];
            var byteOffset = pointer.byteOffset;
            var size = pointer.size;
            var type = pointer.type;
            // track the sum of each attribute size
            byteSizeSum += size * BYTES_PER_TYPE[ type ];
            // track the largest offset to determine the byte stride of the buffer
            if ( byteOffset > maxByteOffset ) {
                maxByteOffset = byteOffset;
                byteStride = byteOffset + ( size * BYTES_PER_TYPE[ type ] );
            }
        });
        // check if the max byte offset is greater than or equal to the the sum of
        // the sizes. If so this buffer is not interleaved and does not need a
        // stride.
        if ( maxByteOffset >= byteSizeSum ) {
            // TODO: test what stride === 0 does for an interleaved buffer of
            // length === 1.
            return 0;
        }
        return byteStride;
    }

    /**
     * Parse the attribute pointers to ensure they are valid.
     * @private
     *
     * @param {Object} attributePointers - The attribute pointer map.
     *
     * @returns {Object} - The validated attribute pointer map.
     */
    function getAttributePointers( attributePointers ) {
        // ensure there are pointers provided
        if ( !attributePointers || Object.keys( attributePointers ).length === 0 ) {
            throw 'VertexBuffer requires attribute pointers to be specified upon instantiation';
        }
        // parse pointers to ensure they are valid
        var pointers = {};
        Object.keys( attributePointers ).forEach( function( key ) {
            var index = parseInt( key, 10 );
            // check that key is an valid integer
            if ( isNaN( index ) ) {
                throw 'Attribute index `' + key + '` does not represent an integer';
            }
            var pointer = attributePointers[key];
            var size = pointer.size;
            var type = pointer.type;
            var byteOffset = pointer.byteOffset;
            // check size
            if ( !SIZES[ size ] ) {
                throw 'Attribute pointer `size` parameter is invalid, must be one of ' +
                    JSON.stringify( Object.keys( SIZES ) );
            }
            // check type
            if ( !TYPES[ type ] ) {
                throw 'Attribute pointer `type` parameter is invalid, must be one of ' +
                    JSON.stringify( Object.keys( TYPES ) );
            }
            pointers[ index ] = {
                size: size,
                type: type,
                byteOffset: ( byteOffset !== undefined ) ? byteOffset : DEFAULT_BYTE_OFFSET
            };
        });
        return pointers;
    }

    /**
     * Return the number of components in the buffer.
     * @private
     *
     * @param {Object} attributePointers - The attribute pointer map.
     *
     * @returns {number} - The number of components in the buffer.
     */
    function getNumComponents( attributePointers ) {
        var size = 0;
        Object.keys( attributePointers ).forEach( function( index ) {
            size += attributePointers[ index ].size;
        });
        return size;
    }

    /**
     * Instantiates an VertexBuffer object.
     * @class VertexBuffer
     * @classdesc A vertex buffer object.
     *
     * @param {Array|Float32Array|VertexPackage|number} arg - The buffer or length of the buffer.
     * @param {Object} attributePointers - The array pointer map, or in the case of a vertex package arg, the options.
     * @param {Object} options - The rendering options.
     * @param {String} options.mode - The draw mode / primitive type.
     * @param {String} options.byteOffset - The byte offset into the drawn buffer.
     * @param {String} options.count - The number of indices to draw.
     */
    function VertexBuffer( arg, attributePointers, options ) {
        options = options || {};
        var gl = this.gl = WebGLContext.get();
        this.state = WebGLContextState.get( gl );
        this.buffer = gl.createBuffer();
        this.mode = MODES[ options.mode ] ? options.mode : DEFAULT_MODE;
        this.count = ( options.count !== undefined ) ? options.count : DEFAULT_COUNT;
        this.byteOffset = ( options.byteOffset !== undefined ) ? options.byteOffset : DEFAULT_BYTE_OFFSET;
        this.byteLength = 0;
        // first, set the attribute pointers
        if ( arg instanceof VertexPackage ) {
            // VertexPackage argument, use its attribute pointers
            this.pointers = arg.pointers;
            // shift options arg since there will be no attrib pointers arg
            options = attributePointers || {};
        } else {
            this.pointers = getAttributePointers( attributePointers );
        }
        // set the byte stride
        this.byteStride = getStride( this.pointers );
        // then buffer the data
        if ( arg ) {
            if ( arg instanceof VertexPackage ) {
                // VertexPackage argument
                this.bufferData( arg.buffer );
            } else if ( arg instanceof WebGLBuffer ) {
                // WebGLBuffer argument
                if ( options.byteLength === undefined ) {
                    throw 'Argument of type `WebGLBuffer` must be complimented with a corresponding `options.byteLength`';
                }
                this.byteLength = options.byteLength;
                this.buffer = arg;
            } else {
                // Array or ArrayBuffer or number argument
                this.bufferData( arg );
            }
        }
        // ensure there isn't an overflow
        var bytesPerCount = BYTES_PER_COMPONENT * getNumComponents( this.pointers );
        if ( this.count * bytesPerCount + this.byteOffset > this.byteLength ) {
            throw 'VertexBuffer `count` of ' + this.count + ' and `byteOffset` of ' + this.byteOffset + ' overflows the total byte length of the buffer (' + this.byteLength + ')';
        }
    }

    /**
     * Upload vertex data to the GPU.
     * @memberof VertexBuffer
     *
     * @param {Array|ArrayBuffer|ArrayBufferView|number} arg - The array of data to buffer, or size of the buffer in bytes.
     *
     * @returns {VertexBuffer} The vertex buffer object for chaining.
     */
    VertexBuffer.prototype.bufferData = function( arg ) {
        var gl = this.gl;
        if ( arg instanceof Array ) {
            // cast array into ArrayBufferView
            arg = new Float32Array( arg );
        } else if (
            !( arg instanceof ArrayBuffer ) &&
            !( arg instanceof Float32Array ) &&
            typeof arg !== 'number' ) {
            // if not arraybuffer or a numeric size
            throw 'Argument must be of type `Array`, `ArrayBuffer`, `ArrayBufferView`, or `number`';
        }
        // don't overwrite the count if it is already set
        if ( this.count === DEFAULT_COUNT ) {
            // get the total number of attribute components from pointers
            var numComponents = getNumComponents( this.pointers );
            // set count based on size of buffer and number of components
            if ( typeof arg === 'number' ) {
                this.count = ( arg / BYTES_PER_COMPONENT ) / numComponents;
            } else {
                this.count = arg.length / numComponents;
            }
        }
        // set byte length
        if ( typeof arg === 'number' ) {
            if ( arg % BYTES_PER_COMPONENT ) {
                throw 'Byte length must be multiple of ' + BYTES_PER_COMPONENT;
            }
            this.byteLength = arg;
        } else {
            this.byteLength = arg.length * BYTES_PER_COMPONENT;
        }
        // buffer the data
        gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
        gl.bufferData( gl.ARRAY_BUFFER, arg, gl.STATIC_DRAW );
    };

    /**
     * Upload partial vertex data to the GPU.
     * @memberof VertexBuffer
     *
     * @param {Array|ArrayBuffer|ArrayBufferView} array - The array of data to buffer.
     * @param {number} byteOffset - The byte offset at which to buffer.
     *
     * @returns {VertexBuffer} The vertex buffer object for chaining.
     */
    VertexBuffer.prototype.bufferSubData = function( array, byteOffset ) {
        var gl = this.gl;
        if ( this.byteLength === 0 ) {
            throw 'Buffer has not yet been allocated';
        }
        if ( array instanceof Array ) {
            array = new Float32Array( array );
        } else if ( !( array instanceof ArrayBuffer ) && !ArrayBuffer.isView( array ) ) {
            throw 'Argument must be of type `Array`, `ArrayBuffer`, or `ArrayBufferView`';
        }
        byteOffset = ( byteOffset !== undefined ) ? byteOffset : DEFAULT_BYTE_OFFSET;
        // get the total number of attribute components from pointers
        var byteLength = array.length * BYTES_PER_COMPONENT;
        if ( byteOffset + byteLength > this.byteLength ) {
            throw 'Argument of length ' + byteLength + ' bytes and offset of ' + byteOffset + ' bytes overflows the buffer length of ' + this.byteLength + ' bytes';
        }
        gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
        gl.bufferSubData( gl.ARRAY_BUFFER, byteOffset, array );
        return this;
    };

    /**
     * Binds the vertex buffer object.
     * @memberof VertexBuffer
     *
     * @returns {VertexBuffer} Returns the vertex buffer object for chaining.
     */
    VertexBuffer.prototype.bind = function() {
        var gl = this.gl;
        var state = this.state;
        // cache this vertex buffer
        if ( state.boundVertexBuffer !== this.buffer ) {
            // bind buffer
            gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
            state.boundVertexBuffer = this.buffer;
        }
        var pointers = this.pointers;
        var byteStride = this.byteStride;
        Object.keys( pointers ).forEach( function( index ) {
            var pointer = pointers[ index ];
            // set attribute pointer
            gl.vertexAttribPointer(
                index,
                pointer.size,
                gl[ pointer.type ],
                false,
                byteStride,
                pointer.byteOffset );
            // enable attribute index
            if ( !state.enabledVertexAttributes[ index ] ) {
                gl.enableVertexAttribArray( index );
                state.enabledVertexAttributes[ index ] = true;
            }
        });
        return this;
    };

    /**
     * Unbinds the vertex buffer object.
     * @memberof VertexBuffer
     *
     * @returns {VertexBuffer} Returns the vertex buffer object for chaining.
     */
    VertexBuffer.prototype.unbind = function() {
        var gl = this.gl;
        var state = this.state;
        // only bind if it already isn't bound
        if ( state.boundVertexBuffer !== this.buffer ) {
            // bind buffer
            gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
            state.boundVertexBuffer = this.buffer;
        }
        Object.keys( this.pointers ).forEach( function( index ) {
            // disable attribute index
            if ( state.enabledVertexAttributes[ index ] ) {
                gl.disableVertexAttribArray( index );
                state.enabledVertexAttributes[ index ] = false;
            }
        });
        return this;
    };

    /**
     * Execute the draw command for the bound buffer.
     * @memberof VertexBuffer
     *
     * @param {Object} options - The options to pass to 'drawArrays'. Optional.
     * @param {String} options.mode - The draw mode / primitive type.
     * @param {String} options.byteOffset - The byte offset into the drawn buffer.
     * @param {String} options.count - The number of indices to draw.
     *
     * @returns {VertexBuffer} Returns the vertex buffer object for chaining.
     */
    VertexBuffer.prototype.draw = function( options ) {
        options = options || {};
        if ( this.state.boundVertexBuffer !== this.buffer ) {
            throw 'Attempting to draw an unbound VertexBuffer';
        }
        var gl = this.gl;
        var mode = gl[ options.mode || this.mode ];
        var byteOffset = ( options.byteOffset !== undefined ) ? options.byteOffset : this.byteOffset;
        var count = ( options.count !== undefined ) ? options.count : this.count;
        if ( count === 0 ) {
            throw 'Attempting to draw with a count of 0';
        }
        var bytesPerCount = BYTES_PER_COMPONENT * getNumComponents( this.pointers );
        if ( count * bytesPerCount + byteOffset > this.byteLength ) {
            throw 'Attempting to draw with `count` of ' + count + ' and `offset` of ' + byteOffset + ' overflows the total byte length of the buffer (' + this.byteLength + ')';
        }
        // draw elements
        gl.drawArrays( mode, byteOffset, count );
        return this;
    };

    module.exports = VertexBuffer;

}());

},{"./VertexPackage":11,"./WebGLContext":13,"./WebGLContextState":14}],11:[function(require,module,exports){
(function () {

    'use strict';

    var Util = require('../util/Util');
    var COMPONENT_TYPE = 'FLOAT';
    var BYTES_PER_COMPONENT = 4;

    /**
     * Removes invalid attribute arguments. A valid argument must be an Array of length > 0 key by a string representing an int.
     * @private
     *
     * @param {Object} attributes - The map of vertex attributes.
     *
     * @returns {Array} The valid array of arguments.
     */
    function parseAttributeMap( attributes ) {
        var goodAttributes = [];
        Object.keys( attributes ).forEach( function( key ) {
            var index = parseFloat( key );
            // check that key is an valid integer
            if ( !Util.isInteger( index ) || index < 0 ) {
                throw 'Attribute index `' + key + '` does not represent a valid integer';
            }
            var vertices = attributes[key];
            // ensure attribute is valid
            if ( vertices &&
                vertices instanceof Array &&
                vertices.length > 0 ) {
                // add attribute data and index
                goodAttributes.push({
                    index: index,
                    data: vertices
                });
            } else {
                throw 'Error parsing attribute of index `' + key + '`';
            }
        });
        // sort attributes ascending by index
        goodAttributes.sort(function(a,b) {
            return a.index - b.index;
        });
        return goodAttributes;
    }

    /**
     * Returns a component's byte size.
     * @private
     *
     * @param {Object|Array} component - The component to measure.
     *
     * @returns {integer} The byte size of the component.
     */
    function getComponentSize( component ) {
        // check if vector
        if ( component.x !== undefined ) {
            // 1 component vector
            if ( component.y !== undefined ) {
                // 2 component vector
                if ( component.z !== undefined ) {
                    // 3 component vector
                    if ( component.w !== undefined ) {
                        // 4 component vector
                        return 4;
                    }
                    return 3;
                }
                return 2;
            }
            return 1;
        }
        // check if array
        if ( component instanceof Array ) {
            return component.length;
        }
        // default to 1 otherwise
        return 1;
    }

    /**
     * Calculates the type, size, and offset for each attribute in the attribute array along with the length and stride of the package.
     * @private
     *
     * @param {VertexPackage} vertexPackage - The VertexPackage object.
     * @param {Array} attributes - The array of vertex attributes.
     */
    function setPointersAndStride( vertexPackage, attributes ) {
        var shortestArray = Number.MAX_VALUE;
        var offset = 0;
        // clear pointers
        vertexPackage.pointers = {};
        // for each attribute
        attributes.forEach( function( vertices ) {
            // set size to number of components in the attribute
            var size = getComponentSize( vertices.data[0] );
            // length of the package will be the shortest attribute array length
            shortestArray = Math.min( shortestArray, vertices.data.length );
            // store pointer under index
            vertexPackage.pointers[ vertices.index ] = {
                type : COMPONENT_TYPE,
                size : size,
                byteOffset : offset * BYTES_PER_COMPONENT
            };
            // accumulate attribute offset
            offset += size;
        });
        // set stride to total offset
        vertexPackage.byteStride = offset * BYTES_PER_COMPONENT;
        // set length of package to the shortest attribute array length
        vertexPackage.length = shortestArray;
    }

    /**
     * Fill the arraybuffer with a single component attribute.
     * @private
     *
     * @param {Float32Array} buffer - The arraybuffer to fill.
     * @param {Array} vertices - The vertex attribute array to copy from.
     * @param {number} length - The length of the buffer to copy from.
     * @param {number} offset - The offset to the attribute.
     * @param {number} stride - The of stride of the buffer.
     */
    function set1ComponentAttr( buffer, vertices, length, offset, stride ) {
        var vertex, i, j;
        for ( i=0; i<length; i++ ) {
            vertex = vertices[i];
            // get the index in the buffer to the particular vertex
            j = offset + ( stride * i );
            if ( vertex.x !== undefined ) {
                buffer[j] = vertex.x;
            } else if ( vertex[0] !== undefined ) {
                buffer[j] = vertex[0];
            } else {
                buffer[j] = vertex;
            }
        }
    }

    /**
     * Fill the arraybuffer with a double component attribute.
     * @private
     *
     * @param {Float32Array} buffer - The arraybuffer to fill.
     * @param {Array} vertices - The vertex attribute array to copy from.
     * @param {number} length - The length of the buffer to copy from.
     * @param {number} offset - The offset to the attribute.
     * @param {number} stride - The of stride of the buffer.
     */
    function set2ComponentAttr( buffer, vertices, length, offset, stride ) {
        var vertex, i, j;
        for ( i=0; i<length; i++ ) {
            vertex = vertices[i];
            // get the index in the buffer to the particular vertex
            j = offset + ( stride * i );
            buffer[j] = ( vertex.x !== undefined ) ? vertex.x : vertex[0];
            buffer[j+1] = ( vertex.y !== undefined ) ? vertex.y : vertex[1];
        }
    }

    /**
     * Fill the arraybuffer with a triple component attribute.
     * @private
     *
     * @param {Float32Array} buffer - The arraybuffer to fill.
     * @param {Array} vertices - The vertex attribute array to copy from.
     * @param {number} length - The length of the buffer to copy from.
     * @param {number} offset - The offset to the attribute.
     * @param {number} stride - The of stride of the buffer.
     */
    function set3ComponentAttr( buffer, vertices, length, offset, stride ) {
        var vertex, i, j;
        for ( i=0; i<length; i++ ) {
            vertex = vertices[i];
            // get the index in the buffer to the particular vertex
            j = offset + ( stride * i );
            buffer[j] = ( vertex.x !== undefined ) ? vertex.x : vertex[0];
            buffer[j+1] = ( vertex.y !== undefined ) ? vertex.y : vertex[1];
            buffer[j+2] = ( vertex.z !== undefined ) ? vertex.z : vertex[2];
        }
    }

    /**
     * Fill the arraybuffer with a quadruple component attribute.
     * @private
     *
     * @param {Float32Array} buffer - The arraybuffer to fill.
     * @param {Array} vertices - The vertex attribute array to copy from.
     * @param {number} length - The length of the buffer to copy from.
     * @param {number} offset - The offset to the attribute.
     * @param {number} stride - The of stride of the buffer.
     */
    function set4ComponentAttr( buffer, vertices, length, offset, stride ) {
        var vertex, i, j;
        for ( i=0; i<length; i++ ) {
            vertex = vertices[i];
            // get the index in the buffer to the particular vertex
            j = offset + ( stride * i );
            buffer[j] = ( vertex.x !== undefined ) ? vertex.x : vertex[0];
            buffer[j+1] = ( vertex.y !== undefined ) ? vertex.y : vertex[1];
            buffer[j+2] = ( vertex.z !== undefined ) ? vertex.z : vertex[2];
            buffer[j+3] = ( vertex.w !== undefined ) ? vertex.w : vertex[3];
        }
    }

    /**
     * Instantiates an VertexPackage object.
     * @class VertexPackage
     * @classdesc A vertex package object.
     *
     * @param {Object} attributes - The attributes to interleave keyed by index.
     */
    function VertexPackage( attributes ) {
        if ( attributes !== undefined ) {
            this.set( attributes );
        } else {
            this.buffer = new Float32Array(0);
            this.pointers = {};
        }
    }

    /**
     * Set the data to be interleaved inside the package. This clears any previously existing data.
     * @memberof VertexPackage
     *
     * @param {Object} attributes - The attributes to interleaved, keyed by index.
     *
     * @returns {VertexPackage} - The vertex package object, for chaining.
     */
    VertexPackage.prototype.set = function( attributes ) {
        // remove bad attributes
        attributes = parseAttributeMap( attributes );
        // set attribute pointers and stride
        setPointersAndStride( this, attributes );
        // set size of data vector
        var length = this.length;
        var stride = this.byteStride / BYTES_PER_COMPONENT;
        var pointers = this.pointers;
        var buffer = this.buffer = new Float32Array( length * stride );
        // for each vertex attribute array
        attributes.forEach( function( vertices ) {
            // get the pointer
            var pointer = pointers[ vertices.index ];
            // get the pointers offset
            var offset = pointer.byteOffset / BYTES_PER_COMPONENT;
            // copy vertex data into arraybuffer
            switch ( pointer.size ) {
                case 2:
                    set2ComponentAttr( buffer, vertices.data, length, offset, stride );
                    break;
                case 3:
                    set3ComponentAttr( buffer, vertices.data, length, offset, stride );
                    break;
                case 4:
                    set4ComponentAttr( buffer, vertices.data, length, offset, stride );
                    break;
                default:
                    set1ComponentAttr( buffer, vertices.data, length, offset, stride );
                    break;
            }
        });
        return this;
    };

    module.exports = VertexPackage;

}());

},{"../util/Util":20}],12:[function(require,module,exports){
(function() {

    'use strict';

    var WebGLContext = require('./WebGLContext');
    var WebGLContextState = require('./WebGLContextState');

    /**
     * Bind the viewport to the rendering context.
     *
     * @param {Viewport} viewport - The viewport object.
     * @param {number} width - The width override.
     * @param {number} height - The height override.
     * @param {number} x - The horizontal offset.
     * @param {number} y - The vertical offset.
     */
    function set( viewport, x, y, width, height ) {
        var gl = viewport.gl;
        x = ( x !== undefined ) ? x : 0;
        y = ( y !== undefined ) ? y : 0;
        width = ( width !== undefined ) ? width : viewport.width;
        height = ( height !== undefined ) ? height : viewport.height;
        gl.viewport( x, y, width, height );
    }

    /**
     * Instantiates an Viewport object.
     * @class Viewport
     * @classdesc A viewport object.
     *
     * @param {Object} spec - The viewport specification object.
     * @param {number} spec.width - The width of the viewport.
     * @param {number} spec.height - The height of the viewport.
     */
    function Viewport( spec ) {
        spec = spec || {};
        this.gl = WebGLContext.get();
        this.state = WebGLContextState.get( this.gl );
        // set size
        this.resize(
            spec.width || this.gl.canvas.width,
            spec.height || this.gl.canvas.height );
    }

    /**
     * Updates the viewports width and height. This resizes the underlying canvas element.
     * @memberof Viewport
     *
     * @param {number} width - The width of the viewport.
     * @param {number} height - The height of the viewport.
     *
     * @returns {Viewport} The viewport object, for chaining.
     */
    Viewport.prototype.resize = function( width, height ) {
        if ( typeof width !== 'number' || ( width <= 0 ) ) {
            throw 'Provided `width` of ' + width + ' is invalid';
        }
        if ( typeof height !== 'number' || ( height <= 0 ) ) {
            throw 'Provided `height` of ' + height + ' is invalid';
        }
        this.width = width;
        this.height = height;
        this.gl.canvas.width = width;
        this.gl.canvas.height = height;
        return this;
    };

    /**
     * Activates the viewport and pushes it onto the stack with the provided arguments. The underlying canvas element is not affected.
     * @memberof Viewport
     *
     * @param {number} width - The width override.
     * @param {number} height - The height override.
     * @param {number} x - The horizontal offset override.
     * @param {number} y - The vertical offset override.
     *
     * @returns {Viewport} The viewport object, for chaining.
     */
    Viewport.prototype.push = function( x, y, width, height ) {
        if ( x !== undefined && typeof x !== 'number' ) {
            throw 'Provided `x` of ' + x + ' is invalid';
        }
        if ( y !== undefined && typeof y !== 'number' ) {
            throw 'Provided `y` of ' + y + ' is invalid';
        }
        if ( width !== undefined && ( typeof width !== 'number' || ( width <= 0 ) ) ) {
            throw 'Provided `width` of ' + width + ' is invalid';
        }
        if ( height !== undefined && ( typeof height !== 'number' || ( height <= 0 ) ) ) {
            throw 'Provided `height` of ' + height + ' is invalid';
        }
        this.state.viewports.push({
            viewport: this,
            x: x,
            y: y,
            width: width,
            height: height
        });
        set( this, x, y, width, height );
        return this;
    };

    /**
     * Pops current the viewport object and activates the viewport beneath it.
     * @memberof Viewport
     *
     * @returns {Viewport} The viewport object, for chaining.
     */
    Viewport.prototype.pop = function() {
        var state = this.state;
        var top = state.viewports.top();
        if ( !top || this !== top.viewport ) {
            throw 'Viewport is not the top most element on the stack';
        }
        state.viewports.pop();
        top = state.viewports.top();
        if ( top ) {
            set( top.viewport, top.x, top.y, top.width, top.height );
        } else {
            set( this );
        }
        return this;
    };

    module.exports = Viewport;

}());

},{"./WebGLContext":13,"./WebGLContextState":14}],13:[function(require,module,exports){
(function() {

    'use strict';

    var EXTENSIONS = [
        // ratified
        'OES_texture_float',
        'OES_texture_half_float',
        'WEBGL_lose_context',
        'OES_standard_derivatives',
        'OES_vertex_array_object',
        'WEBGL_debug_renderer_info',
        'WEBGL_debug_shaders',
        'WEBGL_compressed_texture_s3tc',
        'WEBGL_depth_texture',
        'OES_element_index_uint',
        'EXT_texture_filter_anisotropic',
        'EXT_frag_depth',
        'WEBGL_draw_buffers',
        'ANGLE_instanced_arrays',
        'OES_texture_float_linear',
        'OES_texture_half_float_linear',
        'EXT_blend_minmax',
        'EXT_shader_texture_lod',
        // community
        'WEBGL_compressed_texture_atc',
        'WEBGL_compressed_texture_pvrtc',
        'EXT_color_buffer_half_float',
        'WEBGL_color_buffer_float',
        'EXT_sRGB',
        'WEBGL_compressed_texture_etc1'
    ];
    var _boundContext = null;
    var _contexts = {};

    /**
     * Returns an rfc4122 version 4 compliant UUID.
     * @private
     *
     * @returns {String} The UUID string.
     */
    function getUUID() {
        var replace = function( c ) {
            var r = Math.random() * 16 | 0;
            var v = ( c === 'x' ) ? r : ( r & 0x3 | 0x8 );
            return v.toString( 16 );
        };
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, replace );
    }

    /**
     * Returns the id of the HTMLCanvasElement element. If there is no id, it
     * generates one and appends it.
     * @private
     *
     * @param {HTMLCanvasElement} canvas - The Canvas object.
     *
     * @returns {String} The Canvas id string.
     */
    function getId( canvas ) {
        if ( !canvas.id ) {
            canvas.id = getUUID();
        }
        return canvas.id;
    }

    /**
     * Returns a Canvas element object from either an existing object, or identification string.
     * @private
     *
     * @param {HTMLCanvasElement|String} arg - The Canvas object or Canvas id or selector string.
     *
     * @returns {HTMLCanvasElement} The Canvas element object.
     */
    function getCanvas( arg ) {
        if ( arg instanceof HTMLCanvasElement ) {
            return arg;
        } else if ( typeof arg === 'string' ) {
            return document.getElementById( arg ) ||
                document.querySelector( arg );
        }
        return null;
    }

    /**
     * Attempts to retreive a wrapped WebGLRenderingContext.
     * @private
     *
     * @param {HTMLCanvasElement} The Canvas element object to create the context under.
     *
     * @returns {Object} The context wrapper.
     */
    function getContextWrapper( arg ) {
        if ( arg === undefined ) {
            if ( _boundContext ) {
                // return last bound context
                return _boundContext;
            }
        } else {
            var canvas = getCanvas( arg );
            if ( canvas ) {
                return _contexts[ getId( canvas ) ];
            }
        }
        // no bound context or argument
        return null;
    }

    /**
     * Attempts to load all known extensions for a provided WebGLRenderingContext. Stores the results in the context wrapper for later queries.
     * @private
     *
     * @param {Object} contextWrapper - The context wrapper.
     */
    function loadExtensions( contextWrapper ) {
        var gl = contextWrapper.gl;
        EXTENSIONS.forEach( function( id ) {
            contextWrapper.extensions[ id ] = gl.getExtension( id );
        });
    }

    /**
     * Attempts to create a WebGLRenderingContext wrapped inside an object which will also store the extension query results.
     * @private
     *
     * @param {HTMLCanvasElement} The Canvas element object to create the context under.
     * @param {Object}} options - Parameters to the webgl context, only used during instantiation. Optional.
     *
     * @returns {Object} The context wrapper.
     */
    function createContextWrapper( canvas, options ) {
        var gl = canvas.getContext( 'webgl', options ) || canvas.getContext( 'experimental-webgl', options );
        // wrap context
        var contextWrapper = {
            id: getId( canvas ),
            gl: gl,
            extensions: {}
        };
        // load WebGL extensions
        loadExtensions( contextWrapper );
        // add context wrapper to map
        _contexts[ getId( canvas ) ] = contextWrapper;
        // bind the context
        _boundContext = contextWrapper;
        return contextWrapper;
    }

    module.exports = {

        /**
         * Retrieves an existing WebGL context associated with the provided argument and binds it. While bound, the active context will be used implicitly by any instantiated `esper` constructs.
         *
         * @param {HTMLCanvasElement|String} arg - The Canvas object or Canvas identification string.
         *
         * @returns {WebGLContext} This namespace, used for chaining.
         */
        bind: function( arg ) {
            var wrapper = getContextWrapper( arg );
            if ( wrapper ) {
                _boundContext = wrapper;
                return this;
            }
            throw 'No context exists for provided argument `' + arg + '`';
        },

        /**
         * Retrieves an existing WebGL context associated with the provided argument. If no context exists, one is created.
         * During creation attempts to load all extensions found at: https://www.khronos.org/registry/webgl/extensions/.
         *
         * @param {HTMLCanvasElement|String} arg - The Canvas object or Canvas identification string. Optional.
         * @param {Object}} options - Parameters to the webgl context, only used during instantiation. Optional.
         *
         * @returns {WebGLRenderingContext} The WebGLRenderingContext object.
         */
        get: function( arg, options ) {
            var wrapper = getContextWrapper( arg );
            if ( wrapper ) {
               // return the native WebGLRenderingContext
               return wrapper.gl;
            }
            // get canvas element
            var canvas = getCanvas( arg );
            // try to find or create context
            if ( !canvas ) {
                throw 'Context could not be associated with argument of type `' + ( typeof arg ) + '`';
            }
            // create context
            return createContextWrapper( canvas, options ).gl;
        },

        /**
         * Removes an existing WebGL context object for the provided or currently bound object.
         *
         * @param {HTMLCanvasElement|String} arg - The Canvas object or Canvas identification string. Optional.
         * @param {Object}} options - Parameters to the webgl context, only used during instantiation. Optional.
         *
         * @returns {WebGLRenderingContext} The WebGLRenderingContext object.
         */
        remove: function( arg ) {
            var wrapper = getContextWrapper( arg );
            if ( wrapper ) {
                // delete the context
                delete _contexts[ wrapper.id ];
                // remove if currently bound
                if ( wrapper === _boundContext ) {
                    _boundContext = null;
                }
            } else {
                throw 'Context could not be found or deleted for argument of type `' + ( typeof arg ) + '`';
            }
        },

        /**
         * Returns an array of all supported extensions for the provided or currently bound context object. If no context is bound, it will return an empty array.
         *
         * @param {HTMLCanvasElement|String} arg - The Canvas object or Canvas identification string. Optional.
         *
         * @returns {Array} All supported extensions.
         */
        supportedExtensions: function( arg ) {
            var wrapper = getContextWrapper( arg );
            if ( wrapper ) {
                var extensions = wrapper.extensions;
                var supported = [];
                Object.keys( extensions ).forEach( function( key ) {
                    if ( extensions[ key ] ) {
                        supported.push( key );
                    }
                });
                return supported;
            }
            throw 'No context is currently bound or could be associated with the provided argument';
        },

        /**
         * Returns an array of all unsupported extensions for the provided or currently bound context object. If no context is bound, it will return an empty array.
         * an empty array.
         *
         * @param {HTMLCanvasElement|String} arg - The Canvas object or Canvas identification string. Optional.
         *
         * @returns {Array} All unsupported extensions.
         */
        unsupportedExtensions: function( arg ) {
            var wrapper = getContextWrapper( arg );
            if ( wrapper ) {
                var extensions = wrapper.extensions;
                var unsupported = [];
                Object.keys( extensions ).forEach( function( key ) {
                    if ( !extensions[ key ] ) {
                        unsupported.push( key );
                    }
                });
                return unsupported;
            }
            throw 'No context is currently bound or could be associated with the provided argument';
        },

        /**
         * Checks if an extension has been successfully loaded for the provided or currently bound context object.
         * 'false'.
         *
         * @param {HTMLCanvasElement|String} arg - The Canvas object or Canvas identification string. Optional.
         * @param {String} extension - The extension name.
         *
         * @returns {boolean} Whether or not the provided extension has been loaded successfully.
         */
        checkExtension: function( arg, extension ) {
            if ( !extension ) {
                // shift parameters if no canvas arg is provided
                extension = arg;
                arg = undefined;
            }
            var wrapper = getContextWrapper( arg );
            if ( wrapper ) {
                var extensions = wrapper.extensions;
                return extensions[ extension ] ? true : false;
            }
            throw 'No context is currently bound or could be associated with the provided argument';
        }
    };

}());

},{}],14:[function(require,module,exports){
(function() {

    'use strict';

    var Stack = require('../util/Stack');
    var StackMap = require('../util/StackMap');
    var _states = {};

    function WebGLContextState() {
        /**
         * The currently bound vertex buffer.
         * @private
         */
        this.boundVertexBuffer = null;

        /**
         * The currently enabled vertex attributes.
         * @private
         */
        this.enabledVertexAttributes = {
            '0': false,
            '1': false,
            '2': false,
            '3': false,
            '4': false,
            '5': false
            // ... others will be added as needed
        };

        /**
         * The currently bound index buffer.
         * @private
         */
        this.boundIndexBuffer = null;

        /**
         * The stack of pushed shaders.
         * @private
         */
        this.shaders = new Stack();

        /**
         * The stack of pushed viewports.
         * @private
         */
        this.viewports = new Stack();

        /**
         * The stack of pushed render targets.
         * @private
         */
        this.renderTargets = new Stack();

        /**
         * The map of stacks pushed texture2Ds, keyed by texture unit index.
         * @private
         */
        this.texture2Ds = new StackMap();

        /**
         * The map of pushed texture2Ds,, keyed by texture unit index.
         * @private
         */
        this.textureCubeMaps = new StackMap();
    }

    module.exports = {

        get: function( gl ) {
            var id = gl.canvas.id;
            if ( !_states[ id ] ) {
                _states[ id ] = new WebGLContextState();
            }
            return _states[ id ];
        }

    };

}());

},{"../util/Stack":18,"../util/StackMap":19}],15:[function(require,module,exports){
(function () {

    'use strict';

    module.exports = {
        IndexBuffer: require('./core/IndexBuffer'),
        Renderable: require('./core/Renderable'),
        RenderTarget: require('./core/RenderTarget'),
        Shader: require('./core/Shader'),
        Texture2D: require('./core/Texture2D'),
        ColorTexture2D: require('./core/ColorTexture2D'),
        DepthTexture2D: require('./core/DepthTexture2D'),
        TextureCubeMap: require('./core/TextureCubeMap'),
        VertexBuffer: require('./core/VertexBuffer'),
        VertexPackage: require('./core/VertexPackage'),
        Viewport: require('./core/Viewport'),
        WebGLContext: require('./core/WebGLContext')
    };

}());

},{"./core/ColorTexture2D":1,"./core/DepthTexture2D":2,"./core/IndexBuffer":3,"./core/RenderTarget":4,"./core/Renderable":5,"./core/Shader":6,"./core/Texture2D":8,"./core/TextureCubeMap":9,"./core/VertexBuffer":10,"./core/VertexPackage":11,"./core/Viewport":12,"./core/WebGLContext":13}],16:[function(require,module,exports){
(function () {

    'use strict';

    function getIterator( arg ) {
        var i = -1;
        var len;
        if ( Array.isArray( arg ) ) {
            len = arg.length;
            return function() {
                i++;
                return i < len ? i : null;
            };
        }
        var keys = Object.keys( arg );
        len = keys.length;
        return function() {
            i++;
            return i < len ? keys[i] : null;
        };
    }

    function once( fn ) {
        return function() {
            if ( fn === null ) {
                return;
            }
            fn.apply( this, arguments );
            fn = null;
        };
    }

    function each( object, iterator, callback ) {
        callback = once( callback );
        var key;
        var completed = 0;

        function done( err ) {
            completed--;
            if ( err ) {
                callback( err );
            } else if ( key === null && completed <= 0 ) {
                // check if key is null in case iterator isn't exhausted and done
                // was resolved synchronously.
                callback( null );
            }
        }

        var iter = getIterator(object);
        while ( ( key = iter() ) !== null ) {
            completed += 1;
            iterator( object[ key ], key, done );
        }
        if ( completed === 0 ) {
            callback( null );
        }
    }

    module.exports = {

        /**
         * Execute a set of functions asynchronously, once all have been
         * completed, execute the provided callback function. Jobs may be passed
         * as an array or object. The callback function will be passed the
         * results in the same format as the tasks. All tasks must have accept
         * and execute a callback function upon completion.
         *
         * @param {Array|Object} tasks - The set of functions to execute.
         * @param {Function} callback - The callback function to be executed upon completion.
         */
        parallel: function (tasks, callback) {
            var results = Array.isArray( tasks ) ? [] : {};
            each( tasks, function( task, key, done ) {
                task( function( err, res ) {
                    results[ key ] = res;
                    done( err );
                });
            }, function( err ) {
                callback( err, results );
            });
        }

    };

}());

},{}],17:[function(require,module,exports){
(function() {

    'use strict';

    module.exports = {

        /**
         * Sends an GET request create an Image object.
         *
         * @param {Object} options - The XHR options.
         * @param {String} options.url - The URL for the resource.
         * @param {Function} options.success - The success callback function.
         * @param {Function} options.error - The error callback function.
         */
        load: function ( options ) {
            var image = new Image();
            image.onload = function() {
                if ( options.success ) {
                    options.success( image );
                }
            };
            image.onerror = function( event ) {
                if ( options.error ) {
                    var err = 'Unable to load image from URL: `' + event.path[0].currentSrc + '`';
                    options.error( err );
                }
            };
            image.src = options.url;
        }
    };

}());

},{}],18:[function(require,module,exports){
(function () {

    'use strict';

    /**
     * Instantiates a stack object.
     * @class Stack
     * @classdesc A stack interface.
     */
    function Stack() {
        this.data = [];
    }

    /**
     * Push a value onto the stack.
     *
     * @param {*} value - The value.
     *
     * @returns The stack object for chaining.
     */
    Stack.prototype.push = function( value ) {
        this.data.push( value );
        return this;
    };

    /**
     * Pop a value off the stack. Returns `undefined` if there is no value on
     * the stack.
     *
     * @param {*} value - The value.
     *
     * @returns The value popped off the stack.
     */
    Stack.prototype.pop = function() {
        return this.data.pop();
    };

    /**
     * Returns the current top of the stack, without removing it. Returns
     * `undefined` if there is no value on the stack.
     *
     * @returns The value at the top of the stack.
     */
    Stack.prototype.top = function() {
        var index = this.data.length - 1;
        if ( index < 0 ) {
            return;
        }
        return this.data[ index ];
    };

    module.exports = Stack;

}());

},{}],19:[function(require,module,exports){
(function () {

    'use strict';

    var Stack = require('./Stack');

    /**
     * Instantiates a map of stack objects.
     * @class StackMap
     * @classdesc A hashmap of stacks.
     */
    function StackMap() {
        this.stacks = {};
    }

    /**
     * Push a value onto the stack under a given key.
     *
     * @param {String} key - The key.
     * @param {*} value - The value to push onto the stack.
     *
     * @returns The stack object for chaining.
     */
    StackMap.prototype.push = function( key, value ) {
        if ( !this.stacks[ key ] ) {
            this.stacks[ key ] = new Stack();
        }
        this.stacks[ key ].push( value );
        return this;
    };

    /**
     * Pop a value off the stack. Returns `undefined` if there is no value on
     * the stack, or there is no stack for the key.
     *
     * @param {String} key - The key.
     * @param {*} value - The value to push onto the stack.
     *
     * @returns The value popped off the stack.
     */
    StackMap.prototype.pop = function( key ) {
        if ( !this.stacks[ key ] ) {
            return;
        }
        return this.stacks[ key ].pop();
    };

    /**
     * Returns the current top of the stack, without removing it. Returns
     * `undefined` if there is no value on the stack or no stack for the key.
     *
     * @param {String} key - The key.
     *
     * @returns The value at the top of the stack.
     */
    StackMap.prototype.top = function( key ) {
        if ( !this.stacks[ key ] ) {
            return;
        }
        return this.stacks[ key ].top();
    };

    module.exports = StackMap;

}());

},{"./Stack":18}],20:[function(require,module,exports){
(function () {

    'use strict';

    var Util = {};

    /**
     * Returns true if the argument is an Array, ArrayBuffer, or ArrayBufferView.
     * @private
     *
     * @param {*} arg - The argument to test.
     *
     * @returns {bool} - Whether or not it is a canvas type.
     */
    Util.isArrayType = function( arg ) {
        return arg instanceof Array ||
            arg instanceof ArrayBuffer ||
            ArrayBuffer.isView( arg );
    };

    /**
     * Returns true if the argument is one of the WebGL `texImage2D` overridden
     * canvas types.
     *
     * @param {*} arg - The argument to test.
     *
     * @returns {bool} - Whether or not it is a canvas type.
     */
    Util.isCanvasType = function( arg ) {
        return arg instanceof ImageData ||
            arg instanceof HTMLImageElement ||
            arg instanceof HTMLCanvasElement ||
            arg instanceof HTMLVideoElement;
    };

    /**
     * Returns true if the texture MUST be a power-of-two. Otherwise return false.
     *
     * @param {Object} spec - The texture specification object.
     *
     * @returns {bool} - Whether or not the texture must be a power of two.
     */
    Util.mustBePowerOfTwo = function( spec ) {
        // According to:
        // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL#Non_power-of-two_textures
        // NPOT textures cannot be used with mipmapping and they must not "repeat"
        return spec.mipMap ||
            spec.wrapS === 'REPEAT' ||
            spec.wrapS === 'MIRRORED_REPEAT' ||
            spec.wrapT === 'REPEAT' ||
            spec.wrapT === 'MIRRORED_REPEAT';
    };

    /**
     * Returns true if the value is a number and is an integer.
     *
     * @param {integer} num - The number to test.
     *
     * @returns {boolean} - Whether or not the value is a number.
     */
    Util.isInteger = function( num ) {
        return typeof num === 'number' && ( num % 1 ) === 0;
    };

    /**
     * Returns true if the provided integer is a power of two.
     *
     * @param {integer} num - The number to test.
     *
     * @returns {boolean} - Whether or not the number is a power of two.
     */
    Util.isPowerOfTwo = function( num ) {
        return ( num !== 0 ) ? ( num & ( num - 1 ) ) === 0 : false;
    };

    /**
     * Returns the next highest power of two for a number.
     *
     * Ex.
     *
     *     200 -> 256
     *     256 -> 256
     *     257 -> 512
     *
     * @param {integer} num - The number to modify.
     *
     * @returns {integer} - Next highest power of two.
     */
    Util.nextHighestPowerOfTwo = function( num ) {
        var i;
        if ( num !== 0 ) {
            num = num-1;
        }
        for ( i=1; i<32; i<<=1 ) {
            num = num | num >> i;
        }
        return num + 1;
    };

    /**
     * If the texture must be a POT, resizes and returns the image.
     * @private
     *
     * @param {Object} spec - The texture specification object.
     * @param {HTMLImageElement} img - The image object.
     */
    Util.resizeCanvas = function( spec, img ) {
        if ( !Util.mustBePowerOfTwo( spec ) ||
            ( Util.isPowerOfTwo( img.width ) && Util.isPowerOfTwo( img.height ) ) ) {
            return img;
        }
        // create an empty canvas element
        var canvas = document.createElement( 'canvas' );
        canvas.width = Util.nextHighestPowerOfTwo( img.width );
        canvas.height = Util.nextHighestPowerOfTwo( img.height );
        // copy the image contents to the canvas
        var ctx = canvas.getContext( '2d' );
        ctx.drawImage( img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height );
        return canvas;
    };

    module.exports = Util;

}());

},{}],21:[function(require,module,exports){
(function() {

    'use strict';

    module.exports = {

        /**
         * Sends an XMLHttpRequest GET request to the supplied url.
         *
         * @param {Object} options - The XHR options.
         * @param {String} options.url - The URL for the resource.
         * @param {Function} options.success - The success callback function.
         * @param {Function} options.error - The error callback function.
         * @param {Function} options.responseType - The responseType of the XHR.
         */
        load: function ( options ) {
            var request = new XMLHttpRequest();
            request.open( 'GET', options.url, true );
            request.responseType = options.responseType;
            request.onreadystatechange = function() {
                if ( request.readyState === 4 ) {
                    if ( request.status === 200 ) {
                        if ( options.success ) {
                            options.success( request.response );
                        }
                    } else {
                        if ( options.error ) {
                            options.error( 'GET ' + request.responseURL + ' ' + request.status + ' (' + request.statusText + ')' );
                        }
                    }
                }
            };
            request.send();
        }
    };

}());

},{}],22:[function(require,module,exports){
var json = typeof JSON !== 'undefined' ? JSON : require('jsonify');

module.exports = function (obj, opts) {
    if (!opts) opts = {};
    if (typeof opts === 'function') opts = { cmp: opts };
    var space = opts.space || '';
    if (typeof space === 'number') space = Array(space+1).join(' ');
    var cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;
    var replacer = opts.replacer || function(key, value) { return value; };

    var cmp = opts.cmp && (function (f) {
        return function (node) {
            return function (a, b) {
                var aobj = { key: a, value: node[a] };
                var bobj = { key: b, value: node[b] };
                return f(aobj, bobj);
            };
        };
    })(opts.cmp);

    var seen = [];
    return (function stringify (parent, key, node, level) {
        var indent = space ? ('\n' + new Array(level + 1).join(space)) : '';
        var colonSeparator = space ? ': ' : ':';

        if (node && node.toJSON && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }

        node = replacer.call(parent, key, node);

        if (node === undefined) {
            return;
        }
        if (typeof node !== 'object' || node === null) {
            return json.stringify(node);
        }
        if (isArray(node)) {
            var out = [];
            for (var i = 0; i < node.length; i++) {
                var item = stringify(node, i, node[i], level+1) || json.stringify(null);
                out.push(indent + space + item);
            }
            return '[' + out.join(',') + indent + ']';
        }
        else {
            if (seen.indexOf(node) !== -1) {
                if (cycles) return json.stringify('__cycle__');
                throw new TypeError('Converting circular structure to JSON');
            }
            else seen.push(node);

            var keys = objectKeys(node).sort(cmp && cmp(node));
            var out = [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = stringify(node, key, node[key], level+1);

                if(!value) continue;

                var keyValue = json.stringify(key)
                    + colonSeparator
                    + value;
                ;
                out.push(indent + space + keyValue);
            }
            seen.splice(seen.indexOf(node), 1);
            return '{' + out.join(',') + indent + '}';
        }
    })({ '': obj }, '', obj, 0);
};

var isArray = Array.isArray || function (x) {
    return {}.toString.call(x) === '[object Array]';
};

var objectKeys = Object.keys || function (obj) {
    var has = Object.prototype.hasOwnProperty || function () { return true };
    var keys = [];
    for (var key in obj) {
        if (has.call(obj, key)) keys.push(key);
    }
    return keys;
};

},{"jsonify":23}],23:[function(require,module,exports){
exports.parse = require('./lib/parse');
exports.stringify = require('./lib/stringify');

},{"./lib/parse":24,"./lib/stringify":25}],24:[function(require,module,exports){
var at, // The index of the current character
    ch, // The current character
    escapee = {
        '"':  '"',
        '\\': '\\',
        '/':  '/',
        b:    '\b',
        f:    '\f',
        n:    '\n',
        r:    '\r',
        t:    '\t'
    },
    text,

    error = function (m) {
        // Call error when something is wrong.
        throw {
            name:    'SyntaxError',
            message: m,
            at:      at,
            text:    text
        };
    },
    
    next = function (c) {
        // If a c parameter is provided, verify that it matches the current character.
        if (c && c !== ch) {
            error("Expected '" + c + "' instead of '" + ch + "'");
        }
        
        // Get the next character. When there are no more characters,
        // return the empty string.
        
        ch = text.charAt(at);
        at += 1;
        return ch;
    },
    
    number = function () {
        // Parse a number value.
        var number,
            string = '';
        
        if (ch === '-') {
            string = '-';
            next('-');
        }
        while (ch >= '0' && ch <= '9') {
            string += ch;
            next();
        }
        if (ch === '.') {
            string += '.';
            while (next() && ch >= '0' && ch <= '9') {
                string += ch;
            }
        }
        if (ch === 'e' || ch === 'E') {
            string += ch;
            next();
            if (ch === '-' || ch === '+') {
                string += ch;
                next();
            }
            while (ch >= '0' && ch <= '9') {
                string += ch;
                next();
            }
        }
        number = +string;
        if (!isFinite(number)) {
            error("Bad number");
        } else {
            return number;
        }
    },
    
    string = function () {
        // Parse a string value.
        var hex,
            i,
            string = '',
            uffff;
        
        // When parsing for string values, we must look for " and \ characters.
        if (ch === '"') {
            while (next()) {
                if (ch === '"') {
                    next();
                    return string;
                } else if (ch === '\\') {
                    next();
                    if (ch === 'u') {
                        uffff = 0;
                        for (i = 0; i < 4; i += 1) {
                            hex = parseInt(next(), 16);
                            if (!isFinite(hex)) {
                                break;
                            }
                            uffff = uffff * 16 + hex;
                        }
                        string += String.fromCharCode(uffff);
                    } else if (typeof escapee[ch] === 'string') {
                        string += escapee[ch];
                    } else {
                        break;
                    }
                } else {
                    string += ch;
                }
            }
        }
        error("Bad string");
    },

    white = function () {

// Skip whitespace.

        while (ch && ch <= ' ') {
            next();
        }
    },

    word = function () {

// true, false, or null.

        switch (ch) {
        case 't':
            next('t');
            next('r');
            next('u');
            next('e');
            return true;
        case 'f':
            next('f');
            next('a');
            next('l');
            next('s');
            next('e');
            return false;
        case 'n':
            next('n');
            next('u');
            next('l');
            next('l');
            return null;
        }
        error("Unexpected '" + ch + "'");
    },

    value,  // Place holder for the value function.

    array = function () {

// Parse an array value.

        var array = [];

        if (ch === '[') {
            next('[');
            white();
            if (ch === ']') {
                next(']');
                return array;   // empty array
            }
            while (ch) {
                array.push(value());
                white();
                if (ch === ']') {
                    next(']');
                    return array;
                }
                next(',');
                white();
            }
        }
        error("Bad array");
    },

    object = function () {

// Parse an object value.

        var key,
            object = {};

        if (ch === '{') {
            next('{');
            white();
            if (ch === '}') {
                next('}');
                return object;   // empty object
            }
            while (ch) {
                key = string();
                white();
                next(':');
                if (Object.hasOwnProperty.call(object, key)) {
                    error('Duplicate key "' + key + '"');
                }
                object[key] = value();
                white();
                if (ch === '}') {
                    next('}');
                    return object;
                }
                next(',');
                white();
            }
        }
        error("Bad object");
    };

value = function () {

// Parse a JSON value. It could be an object, an array, a string, a number,
// or a word.

    white();
    switch (ch) {
    case '{':
        return object();
    case '[':
        return array();
    case '"':
        return string();
    case '-':
        return number();
    default:
        return ch >= '0' && ch <= '9' ? number() : word();
    }
};

// Return the json_parse function. It will have access to all of the above
// functions and variables.

module.exports = function (source, reviver) {
    var result;
    
    text = source;
    at = 0;
    ch = ' ';
    result = value();
    white();
    if (ch) {
        error("Syntax error");
    }

    // If there is a reviver function, we recursively walk the new structure,
    // passing each name/value pair to the reviver function for possible
    // transformation, starting with a temporary root object that holds the result
    // in an empty key. If there is not a reviver function, we simply return the
    // result.

    return typeof reviver === 'function' ? (function walk(holder, key) {
        var k, v, value = holder[key];
        if (value && typeof value === 'object') {
            for (k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                    v = walk(value, k);
                    if (v !== undefined) {
                        value[k] = v;
                    } else {
                        delete value[k];
                    }
                }
            }
        }
        return reviver.call(holder, key, value);
    }({'': result}, '')) : result;
};

},{}],25:[function(require,module,exports){
var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    gap,
    indent,
    meta = {    // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    },
    rep;

function quote(string) {
    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    
    escapable.lastIndex = 0;
    return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
        var c = meta[a];
        return typeof c === 'string' ? c :
            '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
}

function str(key, holder) {
    // Produce a string from holder[key].
    var i,          // The loop counter.
        k,          // The member key.
        v,          // The member value.
        length,
        mind = gap,
        partial,
        value = holder[key];
    
    // If the value has a toJSON method, call it to obtain a replacement value.
    if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
        value = value.toJSON(key);
    }
    
    // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.
    if (typeof rep === 'function') {
        value = rep.call(holder, key, value);
    }
    
    // What happens next depends on the value's type.
    switch (typeof value) {
        case 'string':
            return quote(value);
        
        case 'number':
            // JSON numbers must be finite. Encode non-finite numbers as null.
            return isFinite(value) ? String(value) : 'null';
        
        case 'boolean':
        case 'null':
            // If the value is a boolean or null, convert it to a string. Note:
            // typeof null does not produce 'null'. The case is included here in
            // the remote chance that this gets fixed someday.
            return String(value);
            
        case 'object':
            if (!value) return 'null';
            gap += indent;
            partial = [];
            
            // Array.isArray
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                
                // Join all of the elements together, separated with commas, and
                // wrap them in brackets.
                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            
            // If the replacer is an array, use it to select the members to be
            // stringified.
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            else {
                // Otherwise, iterate through all of the keys in the object.
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            
        // Join all of the member texts together, separated with commas,
        // and wrap them in braces.

        v = partial.length === 0 ? '{}' : gap ?
            '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
            '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
}

module.exports = function (value, replacer, space) {
    var i;
    gap = '';
    indent = '';
    
    // If the space parameter is a number, make an indent string containing that
    // many spaces.
    if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
            indent += ' ';
        }
    }
    // If the space parameter is a string, it will be used as the indent string.
    else if (typeof space === 'string') {
        indent = space;
    }

    // If there is a replacer, it must be a function or an array.
    // Otherwise, throw an error.
    rep = replacer;
    if (replacer && typeof replacer !== 'function'
    && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
        throw new Error('JSON.stringify');
    }
    
    // Make a fake root object containing our value under the key of ''.
    // Return the result of stringifying the value.
    return str('', {'': value});
};

},{}],26:[function(require,module,exports){
(function () {

    'use strict';

    module.exports = {
        TileLayer: require('./layer/exports'),
        Renderer: require('./renderer/exports'),
        TileRequestor: require('./request/TileRequestor'),
        MetaRequestor: require('./request/MetaRequestor')
    };

}());

},{"./layer/exports":39,"./renderer/exports":61,"./request/MetaRequestor":75,"./request/TileRequestor":77}],27:[function(require,module,exports){
(function() {

    'use strict';

    var setDateHistogram = function(field, from, to, interval) {
        if (!field) {
            throw 'DateHistogram `field` is missing from argument';
        }
        if (from === undefined) {
            throw 'DateHistogram `from` are missing from argument';
        }
        if (to === undefined) {
            throw 'DateHistogram `to` are missing from argument';
        }
        this._params.date_histogram = {
            field: field,
            from: from,
            to: to,
            interval: interval
        };
        this.clearExtrema();
        return this;
    };

    var getDateHistogram = function() {
        return this._params.date_histogram;
    };

    module.exports = {
        setDateHistogram: setDateHistogram,
        getDateHistogram: getDateHistogram
    };

}());

},{}],28:[function(require,module,exports){
(function() {

    'use strict';

    var checkField = function(meta, field) {
        if (meta) {
            if (!meta.extrema) {
                throw 'Histogram `field` ' + field + ' is not ordinal in meta data';
            }
        } else {
            throw 'Histogram `field` ' + field + ' is not recognized in meta data';
        }
    };

    var setHistogram = function(field, interval) {
        if (!field) {
            throw 'Histogram `field` is missing from argument';
        }
        if (!interval) {
            throw 'Histogram `interval` are missing from argument';
        }
        checkField(this._meta[field], field);
        this._params.histogram = {
            field: field,
            interval: interval
        };
        this.clearExtrema();
        return this;
    };

    var getHistogram = function() {
        return this._params.histogram;
    };

    module.exports = {
        setHistogram: setHistogram,
        getHistogram: getHistogram
    };

}());

},{}],29:[function(require,module,exports){
(function() {

    'use strict';

    var METRICS = {
        'min': true,
        'max': true,
        'sum': true,
        'avg': true
    };

    var checkField = function(meta, field) {
        if (meta) {
            if (!meta.extrema) {
                throw 'Metrix `field` ' + field + ' is not ordinal in meta data';
            }
        } else {
            throw 'Metric `field` ' + field + ' is not recognized in meta data';
        }
    };

    var setMetric = function(field, type) {
        if (!field) {
            throw 'Metric `field` is missing from argument';
        }
        if (!type) {
            throw 'Metric `type` is missing from argument';
        }
        checkField(this._meta[field], field);
        if (!METRICS[type]) {
            throw 'Metric type `' + type + '` is not supported';
        }
        this._params.metric = {
            field: field,
            type: type
        };
        this.clearExtrema();
        return this;
    };

    var getMetric = function() {
        return this._params.metric;
    };

    module.exports = {
        // tiling
        setMetric: setMetric,
        getMetric: getMetric,
    };

}());

},{}],30:[function(require,module,exports){
(function() {

    'use strict';

    var checkField = function(meta, field) {
        if (meta) {
            if (meta.type !== 'string') {
                throw 'Terms `field` ' + field + ' is not of type `string` in meta data';
            }
        } else {
            throw 'Terms `field` ' + field + ' is not recognized in meta data';
        }
    };

    var setTerms = function(field, size) {
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

    var getTerms = function() {
        return this._params.terms;
    };

    module.exports = {
        setTerms: setTerms,
        getTerms: getTerms
    };

}());

},{}],31:[function(require,module,exports){
(function() {

    'use strict';

    var checkField = function(meta, field) {
        if (meta) {
            if (meta.type !== 'string') {
                throw 'Terms `field` ' + field + ' is not of type `string` in meta data';
            }
        } else {
            throw 'Terms `field` ' + field + ' is not recognized in meta data';
        }
    };

    var setTermsFilter = function(field, terms) {
        if (!field) {
            throw 'Terms `field` is missing from argument';
        }
        if (terms === undefined) {
            throw 'Terms `terms` are missing from argument';
        }
        checkField(this._meta[field], field);
        this._params.terms_filter = {
            field: field,
            terms: terms
        };
        this.clearExtrema();
        return this;
    };

    var getTermsFilter = function() {
        return this._params.terms_filter;
    };

    module.exports = {
        setTermsFilter: setTermsFilter,
        getTermsFilter: getTermsFilter
    };

}());

},{}],32:[function(require,module,exports){
// Provides top hits query functionality. 'size' indicates the number of top 
// hits to return, 'include' is the list of fields to include in the returned 
// data, 'sort' is the field to use for sort critera, and 'order' is value of
// 'asc' or 'desc' to indicate sort ordering.
(function() {

    'use strict';

    var setTopHits = function(size, include, sort, order) {
        this._params.top_hits = {
            size: size, 
            include:include,
            sort: sort,
            order: order            
        };
        this.clearExtrema();
        return this;
    };

    var getTopHits = function() {
        return this._params.top_hits;
    };

    // bind point for external controls
    var setSortField = function(sort) {
        this._params.top_hits.sort = sort;
        return this;
    };

    // bind point for external controls
    var getSortField = function() {
        return this._params.top_hits.sort;
    };

    module.exports = {
        setTopHits: setTopHits,
        getTopHits: getTopHits,
        setSortField: setSortField,
        getSortField: getSortField
    };

}());

},{}],33:[function(require,module,exports){
(function() {

    'use strict';

    var checkField = function(meta, field) {
        if (meta) {
            if (meta.type !== 'string') {
                throw 'TopTerms `field` ' + field + ' is not of type `string` in meta data';
            }
        } else {
            throw 'TopTerms `field` ' + field + ' is not recognized in meta data';
        }        
    };

    var setTopTerms = function(field, size) {
        if (!field) {
            throw 'TopTerms `field` is missing from argument';
        }
        checkField(this._meta[field], field);
        this._params.top_terms = {
            field: field,
            size: size
        };
        this.clearExtrema();
        return this;
    };

    var getTopTerms = function() {
        return this._params.top_terms;
    };

    module.exports = {
        setTopTerms: setTopTerms,
        getTopTerms: getTopTerms
    };

}());

},{}],34:[function(require,module,exports){
(function() {

    'use strict';

    var Base = L.GridLayer.extend({

        getOpacity: function() {
            return this.options.opacity;
        },

        show: function() {
            this._hidden = false;
            this._prevMap.addLayer(this);
        },

        hide: function() {
            this._hidden = true;
            this._prevMap = this._map;
            this._map.removeLayer(this);
        },

        isHidden: function() {
            return this._hidden;
        },

        setBrightness: function(brightness) {
            this._brightness = brightness;
            $(this._container).css('-webkit-filter', 'brightness(' + (this._brightness * 100) + '%)');
            $(this._container).css('filter', 'brightness(' + (this._brightness * 100) + '%)');
        },

        getBrightness: function() {
            return (this._brightness !== undefined) ? this._brightness : 1;
        }

    });

    module.exports = Base;

}());

},{}],35:[function(require,module,exports){
(function() {

    'use strict';

    var Base = require('./Base');

    var Debug = Base.extend({

        options: {
            unloadInvisibleTiles: true,
            zIndex: 5000
        },

        initialize: function(options) {
            // set renderer
            if (!options.rendererClass) {
                throw 'No `rendererClass` option found.';
            } else {
                // recursively extend
                $.extend(true, this, options.rendererClass);
            }
            // set options
            L.setOptions(this, options);
        },

        createTile: function(coord) {
            // create a <div> element for drawing
            var tile = L.DomUtil.create('div', 'leaflet-tile');
            // draw to it
            this.renderTile(tile, coord);
            // pass tile to callback
            return tile;
        },

        renderTile: function() {
            // override
        }

    });

    module.exports = Debug;

}());

},{"./Base":34}],36:[function(require,module,exports){
(function() {

    'use strict';

    var Base = require('./Base');

    var Image = L.TileLayer.extend(Base);

    module.exports = Image;

}());

},{"./Base":34}],37:[function(require,module,exports){
(function() {

    'use strict';

    var boolQueryCheck = require('../query/Bool');

    var MIN = Number.MAX_VALUE;
    var MAX = 0;

    function mod(n, m) {
        return ((n % m) + m) % m;
    }

    function getNormalizeCoords(coords) {
        var pow = Math.pow(2, coords.z);
        return {
            x: mod(coords.x, pow),
            y: mod(coords.y, pow),
            z: coords.z
        };
    }

    var Live = L.Class.extend({

        initialize: function(meta, options) {
            // set renderer
            if (!options.rendererClass) {
                throw 'No `rendererClass` option found.';
            } else {
                // recursively extend and initialize
                if (options.rendererClass.prototype) {
                    $.extend(true, this, options.rendererClass.prototype);
                    options.rendererClass.prototype.initialize.apply(this, arguments);
                } else {
                    $.extend(true, this, options.rendererClass);
                    options.rendererClass.initialize.apply(this, arguments);
                }
            }
            // set options
            L.setOptions(this, options);
            // set meta
            this._meta = meta;
            // set params
            this._params = {
                binning: {}
            };
            // set extrema / cache
            this.clearExtrema();
        },

        clearExtrema: function() {
            this._extrema = {
                min: MIN,
                max: MAX
            };
            this._cache = {};
        },

        getExtrema: function() {
            return this._extrema;
        },

        updateExtrema: function(data) {
            var extrema = this.extractExtrema(data);
            var changed = false;
            if (extrema.min < this._extrema.min) {
                changed = true;
                this._extrema.min = extrema.min;
            }
            if (extrema.max > this._extrema.max) {
                changed = true;
                this._extrema.max = extrema.max;
            }
            return changed;
        },

        extractExtrema: function(data) {
            return {
                min: _.min(data),
                max: _.max(data)
            };
        },

        setQuery: function(query) {
            if (!query.must && !query.must_not && !query.should) {
                throw 'Root query must have at least one `must`, `must_not`, or `should` argument.';
            }
            // check that the query is valid
            boolQueryCheck(this._meta, query);
            // set query
            this._params.must = query.must;
            this._params.must_not = query.must_not;
            this._params.should = query.should;
            // cleat extrema
            this.clearExtrema();
        },

        getMeta: function() {
            return this._meta;
        },

        getParams: function() {
            return this._params;
        },

        cacheKeyFromCoord: function(coords, normalize) {
            if (normalize) {
                // leaflet layer x and y may be > n^2, and < 0 in the case
                // of a wraparound. If normalize is true, mod the coords
                coords = getNormalizeCoords(coords);
            }
            return coords.z + ':' + coords.x + ':' + coords.y;
        },

        coordFromCacheKey: function(key) {
            var arr = key.split(':');
            return {
                x: parseInt(arr[1], 10),
                y: parseInt(arr[2], 10),
                z: parseInt(arr[0], 10)
            };
        },

        onTileUnload: function(event) {
            // cache key from coords
            var key = this.cacheKeyFromCoord(event.coords);
            // cache key from normalized coords
            var nkey = this.cacheKeyFromCoord(event.coords, true);
            // get cache entry
            var cached = this._cache[nkey];
            // could the be case where the cache is cleared before tiles are
            // unloaded
            if (!cached) {
                return;
            }
            // remove the tile from the cache
            delete cached.tiles[key];
            // don't remove cache entry unless to tiles use it anymore
            if (_.keys(cached.tiles).length === 0) {
                // no more tiles use this cached data, so delete it
                delete this._cache[key];
            }
        },

        onCacheHit: function(/*tile, cached, coords*/) {
            // this is executed for a tile whose data is already in memory.
            // probably just draw the tile.
        },

        onCacheLoad: function(/*tile, cached, coords*/) {
            // this is executed when the data for a tile is retreived and cached
            // probably just draw the tile.
        },

        onCacheLoadExtremaUpdate: function(/*tile, cached, coords*/) {
            // this is executed when the data for a tile is retreived and is
            // outside the current extrema. probably just redraw all tiles.
        },

        onTileLoad: function(event) {
            var self = this;
            var coords = event.coords;
            var ncoords = getNormalizeCoords(event.coords);
            var tile = event.tile;
            // cache key from coords
            var key = this.cacheKeyFromCoord(event.coords);
            // cache key from normalized coords
            var nkey = this.cacheKeyFromCoord(event.coords, true);
            // check cache
            var cached = this._cache[nkey];
            if (cached) {
                // add tile under normalize coords
                cached.tiles[key] = tile;
                if (!cached.isPending) {
                    // cache entry already exists
                    self.onCacheHit(tile, cached, coords);
                }
            } else {
                // create a cache entry
                this._cache[nkey] = {
                    isPending: true,
                    tiles: {},
                    data: null
                };
                // add tile to the cache entry
                this._cache[nkey].tiles[key] = tile;
                // request the tile
                this.requestTile(ncoords, function(data) {
                    var cached = self._cache[nkey];
                    if (!cached) {
                        // tile is no longer being tracked, ignore
                        return;
                    }
                    cached.isPending = false;
                    cached.data = data;
                    // update the extrema
                    if (data && self.updateExtrema(data)) {
                        // extrema changed
                        self.onCacheLoadExtremaUpdate(tile, cached, coords);
                    } else {
                        // data is loaded into cache
                        self.onCacheLoad(tile, cached, coords);
                    }
                });
            }
        },

    });

    module.exports = Live;

}());

},{"../query/Bool":44}],38:[function(require,module,exports){
(function() {

    'use strict';

    var Base = require('./Base');

    var Pending = Base.extend({

        options: {
            unloadInvisibleTiles: true,
            zIndex: 5000
        },

        initialize: function(options) {
            this._pendingTiles = {};
            // set renderer
            if (!options.rendererClass) {
                throw 'No `rendererClass` option found.';
            } else {
                // recursively extend
                $.extend(true, this, options.rendererClass);
            }
            // set options
            L.setOptions(this, options);
        },

        increment: function(coord) {
            var hash = this._getTileHash(coord);
            if (this._pendingTiles[hash] === undefined) {
                this._pendingTiles[hash] = 1;
                var tiles = this._getTilesWithHash(hash);
                tiles.forEach(function(tile) {
                    this._updateTile(coord, tile);
                }, this);
            } else {
                this._pendingTiles[hash]++;
            }
        },

        decrement: function(coord) {
            var hash = this._getTileHash(coord);
            this._pendingTiles[hash]--;
            if (this._pendingTiles[hash] === 0) {
                delete this._pendingTiles[hash];
                var tiles = this._getTilesWithHash(hash);
                tiles.forEach(function(tile) {
                    this._updateTile(coord, tile);
                }, this);
            }
        },

        _getTileClass: function(hash) {
            return 'leaflet-pending-' + hash;
        },

        _getTileHash: function(coord) {
            return coord.z + '-' + coord.x + '-' + coord.y;
        },

        _getTilesWithHash: function(hash) {
            var className = this._getTileClass(hash);
            var tiles = [];
            $(this._container).find('.' + className).each(function() {
                tiles.push(this);
            });
            return tiles;
        },

        _updateTile: function(coord, tile) {
            // get hash
            var hash = this._getTileHash(coord);
            $(tile).addClass(this._getTileClass(hash));
            if (this._pendingTiles[hash] > 0) {
                this.renderTile(tile, coord);
            } else {
                tile.innerHTML = '';
            }
        },

        createTile: function(coord) {
            // create a <div> element for drawing
            var tile = L.DomUtil.create('div', 'leaflet-tile');
            // get hash
            this._updateTile(coord, tile);
            // pass tile to callback
            return tile;
        },

        renderTile: function() {
            // override
        }

    });

    module.exports = Pending;

}());

},{"./Base":34}],39:[function(require,module,exports){
(function() {

    'use strict';

    // debug tile layer
    var Debug = require('./core/Debug');

    // pending tile layer
    var Pending = require('./core/Pending');

    // image layer
    var Image = require('./core/Image');

    // live tile layers
    var Heatmap = require('./type/Heatmap');
    var TopTrails = require('./type/TopTrails');
    var TopCount = require('./type/TopCount');
    var TopFrequency = require('./type/TopFrequency');
    var TopicCount = require('./type/TopicCount');
    var TopicFrequency = require('./type/TopicFrequency');
    var Preview = require('./type/Preview');

    module.exports = {
        Debug: Debug,
        Pending: Pending,
        Image: Image,
        Heatmap: Heatmap,
        TopCount: TopCount,
        TopTrails: TopTrails,
        TopFrequency: TopFrequency,
        TopicCount: TopicCount,
        TopicFrequency: TopicFrequency,
        Preview: Preview
    };

}());

},{"./core/Debug":35,"./core/Image":36,"./core/Pending":38,"./type/Heatmap":49,"./type/Preview":50,"./type/TopCount":51,"./type/TopFrequency":52,"./type/TopTrails":53,"./type/TopicCount":54,"./type/TopicFrequency":55}],40:[function(require,module,exports){
(function() {

    'use strict';

    function rgb2lab(rgb) {
        var r = rgb[0] > 0.04045 ? Math.pow((rgb[0] + 0.055) / 1.055, 2.4) : rgb[0] / 12.92;
        var g = rgb[1] > 0.04045 ? Math.pow((rgb[1] + 0.055) / 1.055, 2.4) : rgb[1] / 12.92;
        var b = rgb[2] > 0.04045 ? Math.pow((rgb[2] + 0.055) / 1.055, 2.4) : rgb[2] / 12.92;
        //Observer. = 2°, Illuminant = D65
        var x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
        var y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
        var z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
        x = x / 0.95047; // Observer= 2°, Illuminant= D65
        y = y / 1.00000;
        z = z / 1.08883;
        x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787037 * x) + (16 / 116);
        y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787037 * y) + (16 / 116);
        z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787037 * z) + (16 / 116);
        return [(116 * y) - 16,
            500 * (x - y),
            200 * (y - z),
            rgb[3]];
    }

    function lab2rgb(lab) {
        var y = (lab[0] + 16) / 116;
        var x = y + lab[1] / 500;
        var z = y - lab[2] / 200;
        x = x > 0.206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
        y = y > 0.206893034 ? y * y * y : (y - 4 / 29) / 7.787037;
        z = z > 0.206893034 ? z * z * z : (z - 4 / 29) / 7.787037;
        x = x * 0.95047; // Observer= 2°, Illuminant= D65
        y = y * 1.00000;
        z = z * 1.08883;
        var r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
        var g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
        var b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
        r = r > 0.00304 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
        g = g > 0.00304 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
        b = b > 0.00304 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;
        return [Math.max(Math.min(r, 1), 0), Math.max(Math.min(g, 1), 0), Math.max(Math.min(b, 1), 0), lab[3]];
    }

    function distance(c1, c2) {
        return Math.sqrt(
            (c1[0] - c2[0]) * (c1[0] - c2[0]) +
            (c1[1] - c2[1]) * (c1[1] - c2[1]) +
            (c1[2] - c2[2]) * (c1[2] - c2[2]) +
            (c1[3] - c2[3]) * (c1[3] - c2[3])
        );
    }

    var GRADIENT_STEPS = 200;

    // Interpolate between a set of colors using even perceptual distance and interpolation in CIE L*a*b* space
    var buildPerceptualLookupTable = function(baseColors) {
        var outputGradient = [];
        // Calculate perceptual spread in L*a*b* space
        var labs = _.map(baseColors, function(color) {
            return rgb2lab([color[0] / 255, color[1] / 255, color[2] / 255, color[3] / 255]);
        });
        var distances = _.map(labs, function(color, index, colors) {
            return index > 0 ? distance(color, colors[index - 1]) : 0;
        });
        // Calculate cumulative distances in [0,1]
        var totalDistance = _.reduce(distances, function(a, b) {
            return a + b;
        }, 0);
        distances = _.map(distances, function(d) {
            return d / totalDistance;
        });
        var distanceTraversed = 0;
        var key = 0;
        var progress;
        var stepProgress;
        var rgb;
        for (var i = 0; i < GRADIENT_STEPS; i++) {
            progress = i / (GRADIENT_STEPS - 1);
            if (progress > distanceTraversed + distances[key + 1] && key + 1 < labs.length - 1) {
                key += 1;
                distanceTraversed += distances[key];
            }
            stepProgress = (progress - distanceTraversed) / distances[key + 1];
            rgb = lab2rgb([
                labs[key][0] + (labs[key + 1][0] - labs[key][0]) * stepProgress,
                labs[key][1] + (labs[key + 1][1] - labs[key][1]) * stepProgress,
                labs[key][2] + (labs[key + 1][2] - labs[key][2]) * stepProgress,
                labs[key][3] + (labs[key + 1][3] - labs[key][3]) * stepProgress
            ]);
            outputGradient.push([
                Math.round(rgb[0] * 255),
                Math.round(rgb[1] * 255),
                Math.round(rgb[2] * 255),
                Math.round(rgb[3] * 255)
            ]);
        }
        return outputGradient;
    };

    var COOL = buildPerceptualLookupTable([
        [0x04, 0x20, 0x40, 0x50],
        [0x08, 0x40, 0x81, 0x7f],
        [0x08, 0x68, 0xac, 0xff],
        [0x2b, 0x8c, 0xbe, 0xff],
        [0x4e, 0xb3, 0xd3, 0xff],
        [0x7b, 0xcc, 0xc4, 0xff],
        [0xa8, 0xdd, 0xb5, 0xff],
        [0xcc, 0xeb, 0xc5, 0xff],
        [0xe0, 0xf3, 0xdb, 0xff],
        [0xf7, 0xfc, 0xf0, 0xff]
    ]);

    var HOT = buildPerceptualLookupTable([
        [0x40, 0x00, 0x13, 0x50],
        [0x80, 0x00, 0x26, 0x7f],
        [0xbd, 0x00, 0x26, 0xff],
        [0xe3, 0x1a, 0x1c, 0xff],
        [0xfc, 0x4e, 0x2a, 0xff],
        [0xfd, 0x8d, 0x3c, 0xff],
        [0xfe, 0xb2, 0x4c, 0xff],
        [0xfe, 0xd9, 0x76, 0xff],
        [0xff, 0xed, 0xa0, 0xff]
    ]);

    var VERDANT = buildPerceptualLookupTable([
        [0x00, 0x40, 0x26, 0x50],
        [0x00, 0x5a, 0x32, 0x7f],
        [0x23, 0x84, 0x43, 0xff],
        [0x41, 0xab, 0x5d, 0xff],
        [0x78, 0xc6, 0x79, 0xff],
        [0xad, 0xdd, 0x8e, 0xff],
        [0xd9, 0xf0, 0xa3, 0xff],
        [0xf7, 0xfc, 0xb9, 0xff],
        [0xff, 0xff, 0xe5, 0xff]
    ]);

    var SPECTRAL = buildPerceptualLookupTable([
        [0x26, 0x1a, 0x40, 0x50],
        [0x44, 0x2f, 0x72, 0x7f],
        [0xe1, 0x2b, 0x02, 0xff],
        [0x02, 0xdc, 0x01, 0xff],
        [0xff, 0xd2, 0x02, 0xff],
        [0xff, 0xff, 0xff, 0xff]
    ]);

    var TEMPERATURE = buildPerceptualLookupTable([
        [0x00, 0x16, 0x40, 0x50],
        [0x00, 0x39, 0x66, 0x7f], //blue
        [0x31, 0x3d, 0x66, 0xff], //purple
        [0xe1, 0x2b, 0x02, 0xff], //red
        [0xff, 0xd2, 0x02, 0xff], //yellow
        [0xff, 0xff, 0xff, 0xff] //white
    ]);

    var GREYSCALE = buildPerceptualLookupTable([
        [0x00, 0x00, 0x00, 0x7f],
        [0x40, 0x40, 0x40, 0xff],
        [0xff, 0xff, 0xff, 0xff]
    ]);

    var POLAR_HOT = buildPerceptualLookupTable([
        [ 0xff, 0x44, 0x00, 0xff ],
        [ 0xbd, 0xbd, 0xbd, 0xb0 ]
    ]);

    var POLAR_COLD = buildPerceptualLookupTable([
        [ 0xbd, 0xbd, 0xbd, 0xb0 ],
        [ 0x32, 0xa5, 0xf9, 0xff ]
    ]);

    var buildLookupFunction = function(RAMP) {
        return function(scaledValue, inColor) {
            var color = RAMP[Math.floor(scaledValue * (RAMP.length - 1))];
            inColor[0] = color[0];
            inColor[1] = color[1];
            inColor[2] = color[2];
            inColor[3] = color[3];
            return inColor;
        };
    };

    var ColorRamp = {
        cool: buildLookupFunction(COOL),
        hot: buildLookupFunction(HOT),
        verdant: buildLookupFunction(VERDANT),
        spectral: buildLookupFunction(SPECTRAL),
        temperature: buildLookupFunction(TEMPERATURE),
        grey: buildLookupFunction(GREYSCALE),
        polar: buildLookupFunction(POLAR_HOT.concat(POLAR_COLD))
    };

    var setColorRamp = function(type) {
        var func = ColorRamp[type.toLowerCase()];
        if (func) {
            this._colorRamp = func;
        }
        return this;
    };

    var getColorRamp = function() {
        return this._colorRamp;
    };

    var initialize = function() {
        this._colorRamp = ColorRamp.verdant;
    };

    module.exports = {
        initialize: initialize,
        setColorRamp: setColorRamp,
        getColorRamp: getColorRamp
    };

}());

},{}],41:[function(require,module,exports){
(function() {

    'use strict';

    var SIGMOID_SCALE = 0.15;

    // log10

    function log10Transform(val, min, max) {
        var logMin = Math.log10(min || 1);
        var logMax = Math.log10(max || 1);
        var logVal = Math.log10(val || 1);
        return (logVal - logMin) / ((logMax - logMin) || 1);
    }

    function inverseLog10Transform(nval, min, max) {
        var logMin = Math.log10(min || 1);
        var logMax = Math.log10(max || 1);
        return Math.pow(10, (nval * logMax - nval * logMin) + logMin);
    }

    // sigmoid

    function sigmoidTransform(val, min, max) {
        var absMin = Math.abs(min);
        var absMax = Math.abs(max);
        var distance = Math.max(absMin, absMax);
        var scaledVal = val / (SIGMOID_SCALE * distance);
        return 1 / (1 + Math.exp(-scaledVal));
    }

    function inverseSigmoidTransform(nval, min, max) {
        var absMin = Math.abs(min);
        var absMax = Math.abs(max);
        var distance = Math.max(absMin, absMax);
        if (nval === 0) {
            return -distance;
        }
        if (nval === 1) {
            return distance;
        }
        return Math.log((1/nval) - 1) * -(SIGMOID_SCALE * distance);
    }

    // linear

    function linearTransform(val, min, max) {
        var range = max - min;
        return (val - min) / range;
    }

    function inverseLinearTransform(nval, min, max) {
        var range = max - min;
        return min + nval * range;
    }

    var Transform = {
        linear: linearTransform,
        log10: log10Transform,
        sigmoid: sigmoidTransform
    };

    var Inverse = {
        linear: inverseLinearTransform,
        log10: inverseLog10Transform,
        sigmoid: inverseSigmoidTransform
    };

    var initialize = function() {
        this._range = {
            min: 0,
            max: 1
        };
        this._transformFunc = log10Transform;
        this._inverseFunc = inverseLog10Transform;
    };

    var setTransformFunc = function(type) {
        var func = type.toLowerCase();
        this._transformFunc = Transform[func];
        this._inverseFunc = Inverse[func];
    };

    var setValueRange = function(range) {
        this._range.min = range.min;
        this._range.max = range.max;
    };

    var getValueRange = function() {
        return this._range;
    };

    var interpolateToRange = function(nval) {
        // interpolate between the filter range
        var rMin = this._range.min;
        var rMax = this._range.max;
        var rval = (nval - rMin) / (rMax - rMin);
        // ensure output is [0:1]
        return Math.max(0, Math.min(1, rval));
    };

    var transformValue = function(val) {
        // clamp the value between the extreme (shouldn't be necessary)
        var min = this._extrema.min;
        var max = this._extrema.max;
        var clamped = Math.max(Math.min(val, max), min);
        // normalize the value
        return this._transformFunc(clamped, min, max);
    };

    var untransformValue = function(nval) {
        var min = this._extrema.min;
        var max = this._extrema.max;
        // clamp the value between the extreme (shouldn't be necessary)
        var clamped = Math.max(Math.min(nval, 1), 0);
        // unnormalize the value
        return this._inverseFunc(clamped, min, max);
    };

    module.exports = {
        initialize: initialize,
        setTransformFunc: setTransformFunc,
        setValueRange: setValueRange,
        getValueRange: getValueRange,
        transformValue: transformValue,
        untransformValue: untransformValue,
        interpolateToRange: interpolateToRange
    };

}());

},{}],42:[function(require,module,exports){
(function() {

    'use strict';

    var Tiling = require('./Tiling');

    var setResolution = function(resolution) {
        if (resolution !== this._params.binning.resolution) {
            this._params.binning.resolution = resolution;
            this.clearExtrema();
        }
        return this;
    };

    var getResolution = function() {
        return this._params.binning.resolution;
    };

    module.exports = {
        // tiling
        setXField: Tiling.setXField,
        getXField: Tiling.getXField,
        setYField: Tiling.setYField,
        getYField: Tiling.getYField,
        // binning
        setResolution: setResolution,
        getResolution: getResolution
    };

}());

},{"./Tiling":43}],43:[function(require,module,exports){
(function() {

    'use strict';

    var DEFAULT_X_FIELD = 'pixel.x';
    var DEFAULT_Y_FIELD = 'pixel.y';

    var checkField = function(meta, field) {
        if (meta) {
            if (meta.extrema) {
                return true;
            } else {
                throw 'Field `' + field + '` is not ordinal in meta data.';
            }
        } else {
            throw 'Field `' + field + '` is not recognized in meta data.';
        }
        return false;
    };

    var setXField = function(field) {
        if (field !== this._params.binning.x) {
            if (field === DEFAULT_X_FIELD) {
                // reset if default
                this._params.binning.x = undefined;
                this._params.binning.left = undefined;
                this._params.binning.right = undefined;
                this.clearExtrema();
            } else {
                var meta = this._meta[field];
                if (checkField(meta, field)) {
                    this._params.binning.x = field;
                    this._params.binning.left = meta.extrema.min;
                    this._params.binning.right = meta.extrema.max;
                    this.clearExtrema();
                }
            }
        }
        return this;
    };

    var getXField = function() {
        return this._params.binning.x;
    };

    var setYField = function(field) {
        if (field !== this._params.binning.y) {
            if (field === DEFAULT_Y_FIELD) {
                // reset if default
                this._params.binning.y = undefined;
                this._params.binning.bottom = undefined;
                this._params.binning.top = undefined;
                this.clearExtrema();
            } else {
                var meta = this._meta[field];
                if (checkField(meta, field)) {
                    this._params.binning.y = field;
                    this._params.binning.bottom = meta.extrema.min;
                    this._params.binning.top = meta.extrema.max;
                    this.clearExtrema();
                }
            }
        }
        return this;
    };

    var getYField = function() {
        return this._params.binning.y;
    };

    module.exports = {
        setXField: setXField,
        getXField: getXField,
        setYField: setYField,
        getYField: getYField,
        DEFAULT_X_FIELD: DEFAULT_X_FIELD,
        DEFAULT_Y_FIELD: DEFAULT_Y_FIELD
    };

}());

},{}],44:[function(require,module,exports){
(function() {

    'use strict';

    var check;

    function checkQuery(meta, query) {
        var keys = _.keys(query);
        if (keys.length !== 1) {
            throw 'Bool sub-query must only have a single key, query has multiple keys: `' + JSON.stringify(keys) + '`.';
        }
        var type = keys[0];
        var checkFunc = check[type];
        if (!checkFunc) {
            throw 'Query type `' + type + '` is not recognized.';
        }
        // check query by type
        check[type](meta, query[type]);
    }

    function checkQueries(meta, queries) {
        if (_.isArray(queries)) {
            queries.forEach( function(query) {
                checkQuery(meta,query);
            });
            return queries;
        }
        checkQuery(meta, queries);
        return [
            queries
        ];
    }

    function checkBool(meta, query) {
        if (!query.must && !query.must_not && !query.should) {
            throw 'Bool must have at least one `must`, `must_not`, or `should` query argument.';
        }
        if (query.must) {
            checkQueries(meta, query.must);
        }
        if (query.must_not) {
            checkQueries(meta, query.must_not);
        }
        if (query.should) {
            checkQueries(meta, query.should);
        }
    }

    check = {
        bool: checkBool,
        prefix: require('./Prefix'),
        query_string: require('./QueryString'),
        range: require('./Range'),
        terms: require('./Terms'),
    };

    module.exports = checkBool;

}());

},{"./Prefix":45,"./QueryString":46,"./Range":47,"./Terms":48}],45:[function(require,module,exports){
(function() {

    'use strict';

    var checkField = function(meta, field) {
        if (meta) {
            if (meta.type !== 'string') {
                throw 'Prefix `field` ' + field + ' is not of type `string` in meta data.';
            }
        } else {
            throw 'Prefix `field` ' + field + ' is not recognized in meta data.';
        }        
    };

    module.exports = function(meta, query) {
        if (!query.field) {
            throw 'Prefix `field` is missing from argument';
        }
        if (query.prefixes === undefined) {
            throw 'Prefix `prefixes` are missing from argument';
        }
        checkField(meta[query.field], query.field);
    };

}());

},{}],46:[function(require,module,exports){
(function() {

    'use strict';

    var checkField = function(meta, field) {
        if (meta) {
            if (meta.type !== 'string') {
                throw 'QueryString `field` ' + field + ' is not `string` in meta data.';
            }
        } else {
            throw 'QueryString `field` ' + field + ' is not recognized in meta data.';
        }        
    };

    module.exports = function(meta, query) {
        if (!query.field) {
            throw 'QueryString `field` is missing from argument.';
        }
        if (!query.string) {
            throw 'QueryString `string` is missing from argument.';
        }
        checkField(meta[query.field], query.field);
    };

}());

},{}],47:[function(require,module,exports){
(function() {

    'use strict';

    var checkField = function(meta, field) {
        if (meta) {
            if (!meta.extrema) {
                throw 'Range `field` ' + field + ' is not ordinal in meta data.';
            }
        } else {
            throw 'Range `field` ' + field + ' is not recognized in meta data.';
        }        
    };

    module.exports = function(meta, query) {
        if (!query.field) {
            throw 'Range `field` is missing from argument.';
        }
        if (query.from === undefined) {
            throw 'Range `from` is missing from argument.';
        }
        if (query.to === undefined) {
            throw 'Range `to` is missing from argument.';
        }
        checkField(meta[query.field], query.field);
    };

}());

},{}],48:[function(require,module,exports){
(function() {

    'use strict';

    var checkField = function(meta, field) {
        if (meta) {
            if (meta.type !== 'string') {
                throw 'Terms `field` ' + field + ' is not of type `string` in meta data.';
            }
        } else {
            throw 'Terms `field` ' + field + ' is not recognized in meta data.';
        }    
    };

    module.exports = function(meta, query) {
        if (!query.field) {
            throw 'Terms `field` is missing from argument.';
        }
        if (query.terms === undefined) {
            throw 'Terms `terms` are missing from argument.';
        }
        checkField(meta[query.field], query.field);
    };

}());

},{}],49:[function(require,module,exports){
(function() {

    'use strict';

    var Live = require('../core/Live');
    var Binning = require('../param/Binning');
    var Metric = require('../agg/Metric');
    var ColorRamp = require('../mixin/ColorRamp');
    var ValueTransform = require('../mixin/ValueTransform');

    var Heatmap = Live.extend({

        includes: [
            // params
            Binning,
            // aggs
            Metric,
            // mixins
            ColorRamp,
            ValueTransform
        ],

        type: 'heatmap',

        initialize: function() {
            ColorRamp.initialize.apply(this, arguments);
            ValueTransform.initialize.apply(this, arguments);
            // base
            Live.prototype.initialize.apply(this, arguments);
        },

        extractExtrema: function(data) {
            var bins = new Float64Array(data);
            return {
                min: _.min(bins),
                max: _.max(bins)
            };
        }

    });

    module.exports = Heatmap;

}());

},{"../agg/Metric":29,"../core/Live":37,"../mixin/ColorRamp":40,"../mixin/ValueTransform":41,"../param/Binning":42}],50:[function(require,module,exports){
(function() {

    'use strict';

    var Live = require('../core/Live');
    var Binning = require('../param/Binning');
    var TopHits = require('../agg/TopHits');

    var Preview = Live.extend({

        includes: [
            // params
            Binning,
            TopHits 
        ],

        type: 'preview',

        initialize: function() {
            Live.prototype.initialize.apply(this, arguments);
        },

        // extreme not relevant for preview
        extractExtrema: function() {
            return {
                min: 0,
                max: 0
            };
        },
    });

    module.exports = Preview;

}());

},{"../agg/TopHits":32,"../core/Live":37,"../param/Binning":42}],51:[function(require,module,exports){
(function() {

    'use strict';

    var Live = require('../core/Live');
    var Tiling = require('../param/Tiling');
    var TopTerms = require('../agg/TopTerms');
    var Histogram = require('../agg/Histogram');
    var ValueTransform = require('../mixin/ValueTransform');

    var TopCount = Live.extend({

        includes: [
            // params
            Tiling,
            TopTerms,
            // aggs
            Histogram,
            // mixins
            ValueTransform
        ],

        type: 'top_count',

        initialize: function() {
            ValueTransform.initialize.apply(this, arguments);
            // base
            Live.prototype.initialize.apply(this, arguments);
        },

    });

    module.exports = TopCount;

}());

},{"../agg/Histogram":28,"../agg/TopTerms":33,"../core/Live":37,"../mixin/ValueTransform":41,"../param/Tiling":43}],52:[function(require,module,exports){
(function() {

    'use strict';

    var Live = require('../core/Live');
    var Tiling = require('../param/Tiling');
    var TopTerms = require('../agg/TopTerms');
    var DateHistogram = require('../agg/DateHistogram');
    var Histogram = require('../agg/Histogram');
    var ValueTransform = require('../mixin/ValueTransform');

    var TopFrequency = Live.extend({

        includes: [
            // params
            Tiling,
            // aggs
            TopTerms,
            DateHistogram,
            Histogram,
            // mixins
            ValueTransform
        ],

        type: 'top_frequency',

        initialize: function() {
            ValueTransform.initialize.apply(this, arguments);
            // base
            Live.prototype.initialize.apply(this, arguments);
        },

    });

    module.exports = TopFrequency;

}());

},{"../agg/DateHistogram":27,"../agg/Histogram":28,"../agg/TopTerms":33,"../core/Live":37,"../mixin/ValueTransform":41,"../param/Tiling":43}],53:[function(require,module,exports){
(function() {

    'use strict';

    var Live = require('../core/Live');
    var Binning = require('../param/Binning');
    var Terms = require('../agg/Terms');
    var ColorRamp = require('../mixin/ColorRamp');
    var ValueTransform = require('../mixin/ValueTransform');

    var TopTrails = Live.extend({

        includes: [
            // params
            Binning,
            // aggs
            Terms,
            // mixins
            ColorRamp,
            ValueTransform
        ],

        type: 'top_trails',

        initialize: function() {
            ColorRamp.initialize.apply(this, arguments);
            ValueTransform.initialize.apply(this, arguments);
            // base
            Live.prototype.initialize.apply(this, arguments);
        },

        extractExtrema: function() {
            return [ 0, 0 ];
        }

    });

    module.exports = TopTrails;

}());

},{"../agg/Terms":30,"../core/Live":37,"../mixin/ColorRamp":40,"../mixin/ValueTransform":41,"../param/Binning":42}],54:[function(require,module,exports){
(function() {

    'use strict';

    var Live = require('../core/Live');
    var Tiling = require('../param/Tiling');
    var TermsFilter = require('../agg/TermsFilter');
    var Histogram = require('../agg/Histogram');
    var ValueTransform = require('../mixin/ValueTransform');

    var TopicCount = Live.extend({

        includes: [
            // params
            Tiling,
            TermsFilter,
            Histogram,
            // mixins
            ValueTransform
        ],

        type: 'topic_count',

        initialize: function() {
            ValueTransform.initialize.apply(this, arguments);
            // base
            Live.prototype.initialize.apply(this, arguments);
        },

    });

    module.exports = TopicCount;

}());

},{"../agg/Histogram":28,"../agg/TermsFilter":31,"../core/Live":37,"../mixin/ValueTransform":41,"../param/Tiling":43}],55:[function(require,module,exports){
(function() {

    'use strict';

    var Live = require('../core/Live');
    var Tiling = require('../param/Tiling');
    var TermsFilter = require('../agg/TermsFilter');
    var DateHistogram = require('../agg/DateHistogram');
    var Histogram = require('../agg/Histogram');
    var ValueTransform = require('../mixin/ValueTransform');

    var TopicFrequency = Live.extend({

        includes: [
            // params
            Tiling,
            TermsFilter,
            DateHistogram,
            Histogram,
            // mixins
            ValueTransform
        ],

        type: 'topic_frequency',

        initialize: function() {
            ValueTransform.initialize.apply(this, arguments);
            // base
            Live.prototype.initialize.apply(this, arguments);
        },

    });

    module.exports = TopicFrequency;

}());

},{"../agg/DateHistogram":27,"../agg/Histogram":28,"../agg/TermsFilter":31,"../core/Live":37,"../mixin/ValueTransform":41,"../param/Tiling":43}],56:[function(require,module,exports){
(function() {

    'use strict';

    var DOM = require('./DOM');

    var Canvas = DOM.extend({

        options: {
            handlers: {}
        },

        onAdd: function(map) {
            var self = this;
            DOM.prototype.onAdd.call(this, map);
            map.on('click', this.onClick, this);
            $(this._container).on('mousemove', function(e) {
                self.onMouseMove(e);
            });
            $(this._container).on('mouseover', function(e) {
                self.onMouseOver(e);
            });
            $(this._container).on('mouseout', function(e) {
                self.onMouseOut(e);
            });
        },

        onRemove: function(map) {
            map.off('click', this.onClick, this);
            $(this._container).off('mousemove');
            $(this._container).off('mouseover');
            $(this._container).off('mouseout');
            DOM.prototype.onRemove.call(this, map);
        },

        createTile: function() {
            var tile = L.DomUtil.create('canvas', 'leaflet-tile');
            tile.width = this.options.tileSize;
            tile.height = this.options.tileSize;
            return tile;
        },

        clearTiles: function() {
            var tileSize = this.options.tileSize;
            _.forIn(this._tiles, function(tile) {
                var ctx = tile.el.getContext('2d');
                ctx.clearRect(0, 0, tileSize, tileSize);
            });
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

    module.exports = Canvas;

}());

},{"./DOM":57}],57:[function(require,module,exports){
(function() {

    'use strict';

    var Base = require('../../layer/core/Base');

    function mod(n, m) {
        return ((n % m) + m) % m;
    }

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

        _getLayerPointFromEvent: function(e) {
            var lonlat = this._map.mouseEventToLatLng(e);
            var pixel = this._map.project(lonlat);
            var zoom = this._map.getZoom();
            var pow = Math.pow(2, zoom);
            var tileSize = this.options.tileSize;
            return {
                x: mod(pixel.x, pow * tileSize),
                y: mod(pixel.y, pow * tileSize)
            };
        },

        _getTileCoordFromLayerPoint: function(layerPoint) {
            var tileSize = this.options.tileSize;
            return {
                x: Math.floor(layerPoint.x / tileSize),
                y: Math.floor(layerPoint.y / tileSize),
                z: this._map.getZoom()
            };
        },

        _getBinCoordFromLayerPoint: function(layerPoint) {
            var tileSize = this.options.tileSize;
            var resolution = this.getResolution() || tileSize;
            var tx = mod(layerPoint.x, tileSize);
            var ty = mod(layerPoint.y, tileSize);
            var pixelSize = tileSize / resolution;
            var bx = Math.floor(tx / pixelSize);
            var by = Math.floor(ty / pixelSize);
            return {
                x: bx,
                y: by,
                index: bx + (by * resolution),
                size: pixelSize
            };
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

},{"../../layer/core/Base":34}],58:[function(require,module,exports){
(function() {

    'use strict';

    var DOM = require('./DOM');

    var HTML = DOM.extend({

        options: {
            handlers: {}
        },

        onAdd: function(map) {
            var self = this;
            DOM.prototype.onAdd.call(this, map);
            map.on('click', this.onClick, this);
            $(this._container).on('mousemove', function(e) {
                self.onMouseMove(e);
            });
            $(this._container).on('mouseover', function(e) {
                self.onMouseOver(e);
            });
            $(this._container).on('mouseout', function(e) {
                self.onMouseOut(e);
            });
        },

        onRemove: function(map) {
            map.off('click', this.onClick, this);
            $(this._container).off('mousemove');
            $(this._container).off('mouseover');
            $(this._container).off('mouseout');
            DOM.prototype.onRemove.call(this, map);
        },

        createTile: function() {
            var tile = L.DomUtil.create('div', 'leaflet-tile leaflet-html-tile');
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

},{"./DOM":57}],59:[function(require,module,exports){
(function() {

    'use strict';

    var Base = require('../../layer/core/Base');

    var NO_OP = function() {};

    var Overlay = Base.extend({

        options: {
            zIndex: 1
        },

        onAdd: function(map) {
            map.on('zoomend', this.onZoomEnd, this);
            this.on('tileload', this.onTileLoad, this);
            this.on('tileunload', this.onTileUnload, this);
            this._tiles = {};
            this._initContainer();
            this._resetView();
		    this._update();
        },

        onRemove: function(map) {
            map.off('zoomend', this.onZoomEnd, this);
            this.off('tileload', this.onTileLoad, this);
            this.off('tileunload', this.onTileUnload, this);
            this._removeAllTiles();
		    L.DomUtil.remove(this._container);
    		map._removeZoomLimit(this);
    		this._tileZoom = null;
        },

    	// No-op these functions
    	createTile: NO_OP,
    	_updateOpacity: NO_OP,
    	_initTile: NO_OP,
    	_tileReady: NO_OP,
        _updateLevels: NO_OP,
        _removeTilesAtZoom: NO_OP,
    	_setZoomTransforms: NO_OP,

    	_initContainer: function () {
            if (!this._container) {
                this._container = document.createElement('canvas');
                this._container.className += 'leaflet-layer leaflet-zoom-animated';
            }
            this._updateZIndex();
            this.getPane().appendChild(this._container);
    	},

    	_pruneTiles: function () {
    		if (!this._map) {
    			return;
    		}
    		var zoom = this._map.getZoom();
    		if (zoom > this.options.maxZoom ||
    			zoom < this.options.minZoom) {
    			this._removeAllTiles();
    			return;
    		}
            var self = this;
            _.forIn(this._tiles, function(tile) {
                tile.retain = tile.current;
            });
            _.forIn(this._tiles, function(tile) {
    			if (tile.current && !tile.active) {
    				var coords = tile.coords;
    				if (!self._retainParent(coords.x, coords.y, coords.z, coords.z - 5)) {
    					self._retainChildren(coords.x, coords.y, coords.z, coords.z + 2);
    				}
    			}
    		});
    		_.forIn(this._tiles, function(tile, key) {
    			if (!tile.retain) {
    				self._removeTile(key);
    			}
    		});
    	},

    	_removeAllTiles: function () {
            var self = this;
            _.forIn(this._tiles, function(tile, key) {
    			self._removeTile(key);
    		});
    	},

    	_invalidateAll: function () {
    		this._removeAllTiles();
    		this._tileZoom = null;
    	},

    	_setView: function (center, zoom, noPrune, noUpdate) {
    		var tileZoom = Math.round(zoom);
    		if ((this.options.maxZoom !== undefined && tileZoom > this.options.maxZoom) ||
    		    (this.options.minZoom !== undefined && tileZoom < this.options.minZoom)) {
    			tileZoom = undefined;
    		}
    		var tileZoomChanged = this.options.updateWhenZooming && (tileZoom !== this._tileZoom);
    		if (!noUpdate || tileZoomChanged) {
    			this._tileZoom = tileZoom;
    			if (this._abortLoading) {
    				this._abortLoading();
    			}
    			this._resetGrid();
    			if (tileZoom !== undefined) {
    				this._update(center);
    			}
    			if (!noPrune) {
    				this._pruneTiles();
    			}
    		}
            this._setZoomTransform(center, zoom);
    	},

    	_setZoomTransform: function (center, zoom) {
            var currentCenter = this._map.getCenter();
		    var currentZoom = this._map.getZoom();
            var scale = this._map.getZoomScale(zoom, currentZoom);
		    var position = L.DomUtil.getPosition(this._container);
		    var viewHalf = this._map.getSize().multiplyBy(0.5);
		    var currentCenterPoint = this._map.project(currentCenter, zoom);
		    var destCenterPoint = this._map.project(center, zoom);
		    var centerOffset = destCenterPoint.subtract(currentCenterPoint);
		    var topLeftOffset = viewHalf.multiplyBy(-scale).add(position).add(viewHalf).subtract(centerOffset);
    		if (L.Browser.any3d) {
    			L.DomUtil.setTransform(this._container, topLeftOffset, scale);
    		} else {
    			L.DomUtil.setPosition(this._container, topLeftOffset);
    		}
    	},

    	// Private method to load tiles in the grid's active zoom level according to map bounds
    	_update: function (center) {
    		var map = this._map;
    		if (!map) {
                return;
            }
    		var zoom = map.getZoom();
    		if (center === undefined) {
                center = map.getCenter();
            }
    		if (this._tileZoom === undefined) {
                // if out of minzoom/maxzoom
                return;
            }
    		var pixelBounds = this._getTiledPixelBounds(center),
    		    tileRange = this._pxBoundsToTileRange(pixelBounds),
    		    tileCenter = tileRange.getCenter(),
    		    queue = [];

    		_.forIn(this._tiles, function(tile) {
    			tile.current = false;
    		});
    		// _update just loads more tiles. If the tile zoom level differs too much
    		// from the map's, let _setView reset levels and prune old tiles.
    		if (Math.abs(zoom - this._tileZoom) > 1) {
                this._setView(center, zoom);
                return;
            }
    		// create a queue of coordinates to load tiles from
            var i, j;
    		for (j = tileRange.min.y; j <= tileRange.max.y; j++) {
    			for (i = tileRange.min.x; i <= tileRange.max.x; i++) {
    				var coords = new L.Point(i, j);
    				coords.z = this._tileZoom;

    				if (!this._isValidTile(coords)) {
                        continue;
                    }

    				var tile = this._tiles[this._tileCoordsToKey(coords)];
    				if (tile) {
    					tile.current = true;
    				} else {
    					queue.push(coords);
    				}
    			}
    		}
    		// sort tile queue to load tiles in order of their distance to center
    		queue.sort(function (a, b) {
    			return a.distanceTo(tileCenter) - b.distanceTo(tileCenter);
    		});
    		if (queue.length !== 0) {
    			// if its the first batch of tiles to load
    			if (!this._loading) {
    				this._loading = true;
    				// @event loading: Event
    				// Fired when the grid layer starts loading tiles
    				this.fire('loading');
    			}
    			for (i = 0; i < queue.length; i++) {
    				this._addTile(queue[i]);
    			}
    		}
    	},

    	_removeTile: function (key) {
    		var tile = this._tiles[key];
    		if (!tile) {
                return;
            }
    		delete this._tiles[key];
    		// @event tileunload: TileEvent
    		// Fired when a tile is removed (e.g. when a tile goes off the screen).
    		this.fire('tileunload', {
    			coords: this._keyToTileCoords(key)
    		});
    	},

    	_addTile: function (coords) {
    		var key = this._tileCoordsToKey(coords);
    		// save tile in cache
    		var tile = this._tiles[key] = {
    			coords: coords,
    			current: true
    		};
    		// @event tileloadstart: TileEvent
    		// Fired when a tile is requested and starts loading.
    		this.fire('tileloadstart', {
    			coords: coords
    		});

    		tile.loaded = +new Date();
    		tile.active = true;
    		this._pruneTiles();

    		// @event tileload: TileEvent
    		// Fired when a tile loads.
    		this.fire('tileload', {
    			coords: coords
    		});

    		if (this._noTilesToLoad()) {
    			this._loading = false;
    			// @event load: Event
    			// Fired when the grid layer loaded all visible tiles.
    			this.fire('load');

    			if (L.Browser.ielt9 || !this._map._fadeAnimated) {
    				L.Util.requestAnimFrame(this._pruneTiles, this);
    			} else {
    				// Wait a bit more than 0.2 secs (the duration of the tile fade-in)
    				// to trigger a pruning.
    				setTimeout(L.bind(this._pruneTiles, this), 250);
    			}
    		}
    	}

    });

    module.exports = Overlay;

}());

},{"../../layer/core/Base":34}],60:[function(require,module,exports){
(function() {

    'use strict';

    var esper = require('esper');
    var Overlay = require('./Overlay');

    var WebGL = Overlay.extend({

        onAdd: function(map) {
            Overlay.prototype.onAdd.call(this, map);
            map.on('zoomstart', this.onZoomStart, this);
            map.on('zoomend', this.onZoomEnd, this);
        },

        onRemove: function(map) {
            Overlay.prototype.onRemove.call(this, map);
            map.off('zoomstart', this.onZoomStart, this);
            map.off('zoomend', this.onZoomEnd, this);
        },

        onZoomStart: function() {
            this._isZooming = true;
        },

        onZoomEnd: function() {
            this._isZooming = false;
            this._renderFrame();
        },

        onCacheHit: function() {
            // no-op
        },

        onCacheLoad: function(tile, cached, coords) {
            if (cached.data) {
                this._bufferTileTexture(cached, coords);
            }
        },

        onCacheLoadExtremaUpdate: function() {
            var self = this;
            _.forIn(this._cache, function(cached) {
                if (cached.data) {
                    self._bufferTileTexture(cached);
                }
            });
        },

    	_initContainer: function () {
            Overlay.prototype._initContainer.call(this);
            if (!this._gl) {
                this._initGL();
            }
    	},

        _initGL: function() {
            var self = this;
            var gl = this._gl = esper.WebGLContext.get(this._container);
            // handle missing context
            if (!gl) {
                throw 'Unable to acquire a WebGL context';
            }
            // init the webgl state
            gl.clearColor(0, 0, 0, 0);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            gl.disable(gl.DEPTH_TEST);
            // create tile renderable
            self._renderable = new esper.Renderable({
                vertices: {
                    0: [
                        [0, -256],
                        [256, -256],
                        [256, 0],
                        [0, 0]
                    ],
                    1: [
                        [0, 0],
                        [1, 0],
                        [1, 1],
                        [0, 1]
                    ]
                },
                indices: [
                    0, 1, 2,
                    0, 2, 3
                ]
            });
            // load shaders
            new esper.Shader({
                vert: this.options.shaders.vert,
                frag: this.options.shaders.frag
            }, function(err, shader) {
                if (err) {
                    console.error(err);
                    return;
                }
                // execute callback
                var width = self._container.width;
                var height = self._container.height;
                self._viewport = new esper.Viewport({
                    width: width,
                    height: height
                });
                self._initialized = true;
                self._shader = shader;
                self._draw();
            });
        },

        _getTranslationMatrix: function(x, y, z) {
            var mat = new Float32Array(16);
            mat[0] = 1;
            mat[1] = 0;
            mat[2] = 0;
            mat[3] = 0;
            mat[4] = 0;
            mat[5] = 1;
            mat[6] = 0;
            mat[7] = 0;
            mat[8] = 0;
            mat[9] = 0;
            mat[10] = 1;
            mat[11] = 0;
            mat[12] = x;
            mat[13] = y;
            mat[14] = z;
            mat[15] = 1;
            return mat;
        },

        _getOrthoMatrix: function(left, right, bottom, top, near, far) {
            var mat = new Float32Array(16);
            mat[0] = 2 / (right - left);
            mat[1] = 0;
            mat[2] = 0;
            mat[3] = 0;
            mat[4] = 0;
            mat[5] = 2 / (top - bottom);
            mat[6] = 0;
            mat[7] = 0;
            mat[8] = 0;
            mat[9] = 0;
            mat[10] = -2 / (far - near);
            mat[11] = 0;
            mat[12] = -((right + left) / (right - left));
            mat[13] = -((top + bottom) / (top - bottom));
            mat[14] = -((far + near) / (far - near));
            mat[15] = 1;
            return mat;
        },

        _getProjection: function() {
            var bounds = this._map.getPixelBounds();
            var dim = Math.pow(2, this._map.getZoom()) * 256;
            return this._getOrthoMatrix(
                bounds.min.x,
                bounds.max.x,
                (dim - bounds.max.y),
                (dim - bounds.min.y),
                -1, 1);
        },

        _draw: function() {
            if (this._initialized) {
                if (!this.isHidden()) {
                    // re-position canvas
                    if (!this._isZooming) {
                        // dfarw the frame
                        this._renderFrame();
                    }
                }
                requestAnimationFrame(this._draw.bind(this));
            }
        },

        _renderFrame: function() {
            var size = this._map.getSize();
            // set canvas size
            this._container.width = size.x;
            this._container.height = size.y;
            // set viewport size
            this._viewport.resize(size.x, size.y);
            // re-position container
            var topLeft = this._map.containerPointToLayerPoint([0, 0]);
            L.DomUtil.setPosition(this._container, topLeft);
            // setup
            var gl = this._gl;
            this._viewport.push();
            this._shader.push();
            this._shader.setUniform('uProjectionMatrix', this._getProjection());
            this._shader.setUniform('uOpacity', this.getOpacity());
            this._shader.setUniform('uTextureSampler', 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            // draw
            this._renderTiles();
            // teardown
            this._shader.pop();
            this._viewport.pop();
        },

        _renderTiles: function() {
            var self = this;
            var dim = Math.pow(2, this._map.getZoom()) * 256;
            // for each tile
            _.forIn(this._cache, function(cached) {
                if (!cached.texture) {
                    return;
                }
                // bind tile texture to texture unit 0
                cached.texture.push(0);
                _.forIn(cached.tiles, function(tile, key) {
                    // find the tiles position from its key
                    var coord = self.coordFromCacheKey(key);
                    // create model matrix
                    var model = self._getTranslationMatrix(
                        256 * coord.x,
                        dim - (256 * coord.y),
                        0);
                    self._shader.setUniform('uModelMatrix', model);
                    // draw the tile
                    self._renderable.draw();
                });
                // no need to unbind texture
            });
        },

        _bufferTileTexture: function(cached) {
            var data = new Float64Array(cached.data);
            var resolution = Math.sqrt(data.length);
            var buffer = new ArrayBuffer(data.length * 4);
            var bins = new Uint8Array(buffer);
            var color = [0, 0, 0, 0];
            var nval, rval, bin, i;
            var ramp = this.getColorRamp();
            var self = this;
            for (i=0; i<data.length; i++) {
                bin = data[i];
                if (bin === 0) {
                    color[0] = 0;
                    color[1] = 0;
                    color[2] = 0;
                    color[3] = 0;
                } else {
                    nval = self.transformValue(bin);
                    rval = self.interpolateToRange(nval);
                    ramp(rval, color);
                }
                bins[i * 4] = color[0];
                bins[i * 4 + 1] = color[1];
                bins[i * 4 + 2] = color[2];
                bins[i * 4 + 3] = color[3];
            }
            cached.texture = new esper.Texture2D({
                height: resolution,
                width: resolution,
                src: bins,
                format: 'RGBA',
                type: 'UNSIGNED_BYTE',
                wrap: 'CLAMP_TO_EDGE',
                filter: 'NEAREST',
                invertY: true
            });
        }

    });

    module.exports = WebGL;

}());

},{"./Overlay":59,"esper":15}],61:[function(require,module,exports){
(function() {

    'use strict';

    // canvas renderers
    var Canvas = {
        Heatmap: require('./type/canvas/Heatmap'),
        TopTrails: require('./type/canvas/TopTrails'),
        Preview: require('./type/canvas/Preview')
    };

    // html renderers
    var HTML = {
        Heatmap: require('./type/html/Heatmap'),
        Ring: require('./type/html/Ring'),
        WordCloud: require('./type/html/WordCloud'),
        WordHistogram: require('./type/html/WordHistogram')
    };

    // webgl renderers
    var WebGL = {
        Heatmap: require('./type/webgl/Heatmap')
    };

    // pending layer renderers
    var Pending = {
        Blink: require('./type/pending/Blink'),
        Spin: require('./type/pending/Spin'),
        BlinkSpin: require('./type/pending/BlinkSpin')
    };

    // pending layer renderers
    var Debug = {
        Coord: require('./type/debug/Coord')
    };

    module.exports = {
        HTML: HTML,
        Canvas: Canvas,
        WebGL: WebGL,
        Debug: Debug,
        Pending: Pending
    };

}());

},{"./type/canvas/Heatmap":63,"./type/canvas/Preview":64,"./type/canvas/TopTrails":65,"./type/debug/Coord":66,"./type/html/Heatmap":67,"./type/html/Ring":68,"./type/html/WordCloud":69,"./type/html/WordHistogram":70,"./type/pending/Blink":71,"./type/pending/BlinkSpin":72,"./type/pending/Spin":73,"./type/webgl/Heatmap":74}],62:[function(require,module,exports){
(function() {

    'use strict';

    var POSITIVE = '1';
    var NEUTRAL = '0';
    var NEGATIVE = '-1';

    function getClassFunc(min, max) {
        min = min !== undefined ? min : -1;
        max = max !== undefined ? max : 1;
        var positive = [0.25 * max, 0.5 * max, 0.75 * max];
        var negative = [-0.25 * min, -0.5 * min, -0.75 * min];
        return function(sentiment) {
            var prefix;
            var range;
            if (sentiment < 0) {
                prefix = 'neg-';
                range = negative;
            } else {
                prefix = 'pos-';
                range = positive;
            }
            var abs = Math.abs(sentiment);
            if (abs > range[2]) {
                return prefix + '4';
            } else if (abs > range[1]) {
                return prefix + '3';
            } else if (abs > range[0]) {
                return prefix + '2';
            }
            return prefix + '1';
        };
    }

    function getTotal(count) {
        if (!count) {
            return 0;
        }
        var pos = count[POSITIVE] ? count[POSITIVE] : 0;
        var neu = count[NEUTRAL] ? count[NEUTRAL] : 0;
        var neg = count[NEGATIVE] ? count[NEGATIVE] : 0;
        return pos + neu + neg;
    }

    function getAvg(count) {
        if (!count) {
            return 0;
        }
        var pos = count[POSITIVE] ? count[POSITIVE] : 0;
        var neu = count[NEUTRAL] ? count[NEUTRAL] : 0;
        var neg = count[NEGATIVE] ? count[NEGATIVE] : 0;
        var total = pos + neu + neg;
        return (total !== 0) ? (pos - neg) / total : 0;
    }

    module.exports = {
        getClassFunc: getClassFunc,
        getTotal: getTotal,
        getAvg: getAvg
    };

}());

},{}],63:[function(require,module,exports){
(function() {

    'use strict';

    var Canvas = require('../../core/Canvas');

    var Heatmap = Canvas.extend({

        renderCanvas: function(bins, resolution, ramp) {
            var canvas = document.createElement('canvas');
            canvas.height = resolution;
            canvas.width = resolution;
            var ctx = canvas.getContext('2d');
            var imageData = ctx.getImageData(0, 0, resolution, resolution);
            var data = imageData.data;
            var self = this;
            var color = [0, 0, 0, 0];
            var nval, rval, bin, i;
            for (i=0; i<bins.length; i++) {
                bin = bins[i];
                if (bin === 0) {
                    color[0] = 0;
                    color[1] = 0;
                    color[2] = 0;
                    color[3] = 0;
                } else {
                    nval = self.transformValue(bin);
                    rval = self.interpolateToRange(nval);
                    ramp(rval, color);
                }
                data[i * 4] = color[0];
                data[i * 4 + 1] = color[1];
                data[i * 4 + 2] = color[2];
                data[i * 4 + 3] = color[3];
            }
            ctx.putImageData(imageData, 0, 0);
            return canvas;
        },

        renderTile: function(canvas, data) {
            if (!data) {
                return;
            }
            var bins = new Float64Array(data);
            var resolution = Math.sqrt(bins.length);
            var ramp = this.getColorRamp();
            var tileCanvas = this.renderCanvas(bins, resolution, ramp);
            var ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                tileCanvas,
                0, 0,
                resolution, resolution,
                0, 0,
                canvas.width, canvas.height);
        }

    });

    module.exports = Heatmap;

}());

},{"../../core/Canvas":56}],64:[function(require,module,exports){
(function() {

    'use strict';

    var Canvas = require('../../core/Canvas');

    var Preview = Canvas.extend({

        options: {
            lineWidth: 2,
            lineColor: 'lightblue',
            fillColor: 'darkblue',
        },

        highlighted: false,

        _drawHighlight: function(canvas, x, y, size) {
            var sizeOver2 = size / 2;
            var ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.fillStyle = this.options.fillColor;
            ctx.arc(
                x * size + sizeOver2,
                y * size + sizeOver2,
                sizeOver2,
                0,
                2 * Math.PI,
                false);
            ctx.fill();
            ctx.lineWidth = this.options.lineWidth;
            ctx.strokeStyle = this.options.lineColor;
            ctx.stroke();
        },

        onMouseMove: function(e) {
            var target = $(e.originalEvent.target);
            if (this.highlighted) {
                // clear existing highlight
                this.clearTiles();
                // clear highlighted flag
                this.highlighted = false;
            }
            // get layer coord
            var layerPoint = this._getLayerPointFromEvent(e);
            // get tile coord
            var coord = this._getTileCoordFromLayerPoint(layerPoint);
            // get cache key
            var nkey = this.cacheKeyFromCoord(coord, true);
            // get cache entry
            var cached = this._cache[nkey];
            if (cached && cached.data) {
                // get bin coordinate
                var bin = this._getBinCoordFromLayerPoint(layerPoint);
                // get bin data entry
                var data = cached.data[bin.index];
                if (data) {
                    // for each tile relying on that data
                    var self = this;
                    _.forIn(cached.tiles, function(tile) {
                        self._drawHighlight(tile, bin.x, bin.y, bin.size);
                    });
                    // flag as highlighted
                    this.highlighted = true;
                    // execute callback
                    if (this.options.handlers.mousemove) {
                        this.options.handlers.mousemove(target, {
                            value: data,
                            x: coord.x,
                            y: coord.z,
                            z: coord.z,
                            bx: bin.x,
                            by: bin.y,
                            type: 'preview',
                            layer: this
                        });
                    }
                    return;
                }
            }
            if (this.options.handlers.mousemove) {
                this.options.handlers.mousemove(target, null);
            }
        }

    });

    module.exports = Preview;

}());

},{"../../core/Canvas":56}],65:[function(require,module,exports){
(function() {

    'use strict';

    var Canvas = require('../../core/Canvas');

    var TopTrails = Canvas.extend({

        options: {
            color: [255, 0, 255, 255],
            downSampleFactor: 8
        },

        highlighted: false,

        onMouseMove: function(e) {
            var target = $(e.originalEvent.target);
            if (this.highlighted) {
                // clear existing highlights
                this.clearTiles();
                // clear highlighted flag
                this.highlighted = false;
            }
            // get layer coord
            var layerPoint = this._getLayerPointFromEvent(e);
            // get tile coord
            var coord = this._getTileCoordFromLayerPoint(layerPoint);
            // get cache key
            var nkey = this.cacheKeyFromCoord(coord, true);
            // get cache entry
            var cached = this._cache[nkey];
            if (cached && cached.pixels) {
                // get bin coordinate
                var bin = this._getBinCoordFromLayerPoint(layerPoint);
                // downsample the bin res
                var x = Math.floor(bin.x / this.options.downSampleFactor);
                var y = Math.floor(bin.y / this.options.downSampleFactor);
                // if hits a pixel
                if (cached.pixels[x] && cached.pixels[x][y]) {
                    var ids = Object.keys(cached.pixels[x][y]);
                    // take first entry
                    var id = ids[0];
                    // for each cache entry
                    var self = this;
                    _.forIn(this._cache, function(cached) {
                        if (cached.data) {
                            // for each tile relying on that data
                            _.forIn(cached.tiles, function(tile) {
                                var trail = cached.trails[id];
                                if (trail) {
                                    self._highlightTrail(tile, trail);
                                }
                            });
                        }
                    });
                    // execute callback
                    if (this.options.handlers.mousemove) {
                        this.options.handlers.mousemove(target, {
                            value: id,
                            x: coord.x,
                            y: coord.z,
                            z: coord.z,
                            bx: bin.x,
                            by: bin.y,
                            type: 'top-trails',
                            layer: this
                        });
                    }
                    // flag as highlighted
                    this.highlighted = true;
                    return;
                }
            }
            if (this.options.handlers.mousemove) {
                this.options.handlers.mousemove(target, null);
            }
        },

        _highlightTrail: function(canvas, pixels) {
            var resolution = this.getResolution() || this.options.tileSize;
            var highlight = document.createElement('canvas');
            highlight.height = resolution;
            highlight.width = resolution;
            var highlightCtx = highlight.getContext('2d');
            var imageData = highlightCtx.getImageData(0, 0, resolution, resolution);
            var data = imageData.data;
            var pixel, x, y, i, j;
            for (i=0; i<pixels.length; i++) {
                pixel = pixels[i];
                x = pixel[0];
                y = pixel[1];
                j = x + (resolution * y);
                data[j * 4] = this.options.color[0];
                data[j * 4 + 1] = this.options.color[1];
                data[j * 4 + 2] = this.options.color[2];
                data[j * 4 + 3] = this.options.color[3];
            }
            highlightCtx.putImageData(imageData, 0, 0);
            // draw to tile
            var ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                highlight,
                0, 0,
                resolution, resolution,
                0, 0,
                canvas.width, canvas.height);
        },

        renderTile: function(container, data, coord) {
            if (!data) {
                return;
            }
            // ensure tile accepts mouse events
            $(container).css('pointer-events', 'all');
            // modify cache entry
            var nkey = this.cacheKeyFromCoord(coord, true);
            var cached = this._cache[nkey];
            if (cached.trails) {
                // trails already added, exit early
                return;
            }
            var trails = cached.trails = {};
            var pixels = cached.pixels = {};
            var ids  = Object.keys(data);
            var bins, bin;
            var id, i, j;
            var rx, ry, x, y;
            for (i=0; i<ids.length; i++) {
                id = ids[i];
                bins = data[id];
                for (j=0; j<bins.length; j++) {
                    bin = bins[j];
                    // down sample the pixel to make interaction easier
                    rx = Math.floor(bin[0] / this.options.downSampleFactor);
                    ry = Math.floor(bin[1] / this.options.downSampleFactor);
                    pixels[rx] = pixels[rx] || {};
                    pixels[rx][ry] = pixels[rx][ry] || {};
                    pixels[rx][ry][id] = true;
                    // add pixel under the trail at correct resolution
                    x = bin[0];
                    y = bin[1];
                    trails[id] = trails[id] || [];
                    trails[id].push([ x, y ]);
                }
            }
        }

    });

    module.exports = TopTrails;

}());

},{"../../core/Canvas":56}],66:[function(require,module,exports){
(function() {

    'use strict';

    module.exports = {

        renderTile: function(elem, coord) {
            $(elem).empty();
            $(elem).append('<div style="top:0; left:0;">' + coord.z + ', ' + coord.x + ', ' + coord.y + '</div>');
        }

    };

}());

},{}],67:[function(require,module,exports){
(function() {

    'use strict';

    var HTML = require('../../core/HTML');

    var Heatmap = HTML.extend({

        isTargetLayer: function( elem ) {
            return this._container && $.contains(this._container, elem );
        },

        onMouseOver: function(e) {
            var target = $(e.originalEvent.target);
            var value = target.attr('data-value');
            if (value) {
                if (this.options.handlers.mouseover) {
                    var $parent = target.parents('.leaflet-html-tile');
                    this.options.handlers.mouseover(target, {
                        value: parseInt(value, 10),
                        x: parseInt($parent.attr('data-x'), 10),
                        y: parseInt($parent.attr('data-y'), 10),
                        z: this._map.getZoom(),
                        bx: parseInt(target.attr('data-bx'), 10),
                        by: parseInt(target.attr('data-by'), 10),
                        type: 'heatmap',
                        layer: this
                    });
                }
            }
        },

        onMouseOut: function(e) {
            var target = $(e.originalEvent.target);
            var value = target.attr('data-value');
            if (value) {
                if (this.options.handlers.mouseout) {
                    var $parent = target.parents('.leaflet-html-tile');
                    this.options.handlers.mouseout(target, {
                        value: value,
                        x: parseInt($parent.attr('data-x'), 10),
                        y: parseInt($parent.attr('data-y'), 10),
                        z: this._map.getZoom(),
                        bx: parseInt(target.attr('data-bx'), 10),
                        by: parseInt(target.attr('data-by'), 10),
                        type: 'heatmap',
                        layer: this
                    });
                }
            }
        },

        onClick: function(e) {
            // un-select any prev selected pixel
            $('.heatmap-pixel').removeClass('highlight');
            // get target
            var target = $(e.originalEvent.target);
            if (!this.isTargetLayer(e.originalEvent.target)) {
                // this layer is not the target
                return;
            }
            if ( target.hasClass('heatmap-pixel') ) {
                target.addClass('highlight');
            }
            var value = target.attr('data-value');
            if (value) {
                if (this.options.handlers.click) {
                    var $parent = target.parents('.leaflet-html-tile');
                    this.options.handlers.click(target, {
                        value: value,
                        x: parseInt($parent.attr('data-x'), 10),
                        y: parseInt($parent.attr('data-y'), 10),
                        z: this._map.getZoom(),
                        bx: parseInt(target.attr('data-bx'), 10),
                        by: parseInt(target.attr('data-by'), 10),
                        type: 'heatmap',
                        layer: this
                    });
                }
            }
        },

        renderTile: function(container, data) {
            if (!data) {
                return;
            }
            var bins = new Float64Array(data);
            var resolution = Math.sqrt(bins.length);
            var rampFunc = this.getColorRamp();
            var pixelSize = this.options.tileSize / resolution;
            var self = this;
            var color = [0, 0, 0, 0];
            var html = '';
            var nval, rval, bin;
            var left, top;
            var i;
            for (i=0; i<bins.length; i++) {
                bin = bins[i];
                if (bin === 0) {
                    continue;
                } else {
                    left = (i % resolution);
                    top = Math.floor(i / resolution);
                    nval = self.transformValue(bin);
                    rval = self.interpolateToRange(nval);
                    rampFunc(rval, color);
                }
                var rgba = 'rgba(' +
                    color[0] + ',' +
                    color[1] + ',' +
                    color[2] + ',' +
                    (color[3] / 255) + ')';
                html += '<div class="heatmap-pixel" ' +
                    'data-value="' + bin + '" ' +
                    'data-bx="' + left + '" ' +
                    'data-by="' + top + '" ' +
                    'style="' +
                    'height:' + pixelSize + 'px;' +
                    'width:' + pixelSize + 'px;' +
                    'left:' + (left * pixelSize) + 'px;' +
                    'top:' + (top * pixelSize) + 'px;' +
                    'background-color:' + rgba + ';"></div>';
            }
            container.innerHTML = html;
        }

    });

    module.exports = Heatmap;

}());

},{"../../core/HTML":58}],68:[function(require,module,exports){
(function() {

    'use strict';

    var HTML = require('../../core/HTML');

    var Heatmap = HTML.extend({

        onClick: function(e) {
            var target = $(e.originalEvent.target);
            $('.heatmap-ring').removeClass('highlight');
            if ( target.hasClass('heatmap-ring') ) {
                target.addClass('highlight');
            }
        },

        renderTile: function(container, data) {
            if (!data) {
                return;
            }
            var self = this;
            var bins = new Float64Array(data);
            var resolution = Math.sqrt(bins.length);
            var binSize = (this.options.tileSize / resolution);
            var html = '';
            bins.forEach(function(bin, index) {
                if (!bin) {
                    return;
                }
                var percent = self.transformValue(bin);
                var radius = percent * binSize;
                var offset = (binSize - radius) / 2;
                var left = (index % resolution) * binSize;
                var top = Math.floor(index / resolution) * binSize;
                html += '<div class="heatmap-ring" style="' +
                    'left:' + (left + offset) + 'px;' +
                    'top:' + (top + offset) + 'px;' +
                    'width:' + radius + 'px;' +
                    'height:' + radius + 'px;' +
                    '"></div>';
            });
            container.innerHTML = html;
        }

    });

    module.exports = Heatmap;

}());

},{"../../core/HTML":58}],69:[function(require,module,exports){
(function() {

    'use strict';

    var HTML = require('../../core/HTML');
    var sentiment = require('../../sentiment/Sentiment');
    var sentimentFunc = sentiment.getClassFunc(-1, 1);

    var VERTICAL_OFFSET = 24;
    var HORIZONTAL_OFFSET = 10;
    var NUM_ATTEMPTS = 1;

    /**
     * Given an initial position, return a new position, incrementally spiralled
     * outwards.
     */
    var spiralPosition = function(pos) {
        var pi2 = 2 * Math.PI;
        var circ = pi2 * pos.radius;
        var inc = (pos.arcLength > circ / 10) ? circ / 10 : pos.arcLength;
        var da = inc / pos.radius;
        var nt = (pos.t + da);
        if (nt > pi2) {
            nt = nt % pi2;
            pos.radius = pos.radius + pos.radiusInc;
        }
        pos.t = nt;
        pos.x = pos.radius * Math.cos(nt);
        pos.y = pos.radius * Math.sin(nt);
        return pos;
    };

    /**
     *  Returns true if bounding box a intersects bounding box b
     */
    var intersectTest = function(a, b) {
        return (Math.abs(a.x - b.x) * 2 < (a.width + b.width)) &&
            (Math.abs(a.y - b.y) * 2 < (a.height + b.height));
    };

    /**
     *  Returns true if bounding box a is not fully contained inside bounding box b
     */
    var overlapTest = function(a, b) {
        return (a.x + a.width / 2 > b.x + b.width / 2 ||
            a.x - a.width / 2 < b.x - b.width / 2 ||
            a.y + a.height / 2 > b.y + b.height / 2 ||
            a.y - a.height / 2 < b.y - b.height / 2);
    };

    /**
     * Check if a word intersects another word, or is not fully contained in the
     * tile bounding box
     */
    var intersectWord = function(position, word, cloud, bb) {
        var box = {
            x: position.x,
            y: position.y,
            height: word.height,
            width: word.width
        };
        var i;
        for (i = 0; i < cloud.length; i++) {
            if (intersectTest(box, cloud[i])) {
                return true;
            }
        }
        // make sure it doesn't intersect the border;
        if (overlapTest(box, bb)) {
            // if it hits a border, increment collision count
            // and extend arc length
            position.collisions++;
            position.arcLength = position.radius;
            return true;
        }
        return false;
    };

    var WordCloud = HTML.extend({

        options: {
            maxNumWords: 15,
            minFontSize: 10,
            maxFontSize: 20
        },

        isTargetLayer: function( elem ) {
            return this._container && $.contains(this._container, elem );
        },

        clearSelection: function() {
            $(this._container).removeClass('highlight');
            this.highlight = null;
        },

        onMouseOver: function(e) {
            var target = $(e.originalEvent.target);
            $('.word-cloud-label').removeClass('hover');
            var word = target.attr('data-word');
            if (word) {
                $('.word-cloud-label[data-word=' + word + ']').addClass('hover');
                if (this.options.handlers.mouseover) {
                    var $parent = target.parents('.leaflet-html-tile');
                    this.options.handlers.mouseover(target, {
                        value: word,
                        x: parseInt($parent.attr('data-x'), 10),
                        y: parseInt($parent.attr('data-y'), 10),
                        z: this._map.getZoom(),
                        type: 'word-cloud',
                        layer: this
                    });
                }
            }
        },

        onMouseOut: function(e) {
            var target = $(e.originalEvent.target);
            $('.word-cloud-label').removeClass('hover');
            var word = target.attr('data-word');
            if (word) {
                if (this.options.handlers.mouseout) {
                    var $parent = target.parents('.leaflet-html-tile');
                    this.options.handlers.mouseout(target, {
                        value: word,
                        x: parseInt($parent.attr('data-x'), 10),
                        y: parseInt($parent.attr('data-y'), 10),
                        z: this._map.getZoom(),
                        type: 'word-cloud',
                        layer: this
                    });
                }
            }
        },

        onClick: function(e) {
            // un-select any prev selected words
            $('.word-cloud-label').removeClass('highlight');
            $(this._container).removeClass('highlight');
            // get target
            var target = $(e.originalEvent.target);
            if (!this.isTargetLayer(e.originalEvent.target)) {
                // this layer is not the target
                return;
            }
            var word = target.attr('data-word');
            if (word) {
                $(this._container).addClass('highlight');
                $('.word-cloud-label[data-word=' + word + ']').addClass('highlight');
                this.highlight = word;
                if (this.options.handlers.click) {
                    var $parent = target.parents('.leaflet-html-tile');
                    this.options.handlers.click(target, {
                        value: word,
                        x: parseInt($parent.attr('data-x'), 10),
                        y: parseInt($parent.attr('data-y'), 10),
                        z: this._map.getZoom(),
                        type: 'word-cloud',
                        layer: this
                    });
                }
            } else {
                this.clearSelection();
            }
        },

        _measureWords: function(wordCounts) {
            // sort words by frequency
            wordCounts = wordCounts.sort(function(a, b) {
                return b.count - a.count;
            }).slice(0, this.options.maxNumWords);
            // build measurement html
            var html = '<div style="height:256px; width:256px;">';
            var minFontSize = this.options.minFontSize;
            var maxFontSize = this.options.maxFontSize;
            var self = this;
            wordCounts.forEach(function(word) {
                word.percent = self.transformValue(word.count);
                word.fontSize = minFontSize + word.percent * (maxFontSize - minFontSize);
                html += '<div class="word-cloud-label" style="' +
                    'visibility:hidden;' +
                    'font-size:' + word.fontSize + 'px;">' + word.text + '</div>';
            });
            html += '</div>';
            // append measurements
            var $temp = $(html);
            $('body').append($temp);
            $temp.children().each(function(index) {
                wordCounts[index].width = this.offsetWidth;
                wordCounts[index].height = this.offsetHeight;
            });
            $temp.remove();
            return wordCounts;
        },

        _createWordCloud: function(wordCounts) {
            var tileSize = this.options.tileSize;
            var boundingBox = {
                width: tileSize - HORIZONTAL_OFFSET * 2,
                height: tileSize - VERTICAL_OFFSET * 2,
                x: 0,
                y: 0
            };
            var cloud = [];
            // sort words by frequency
            wordCounts = this._measureWords(wordCounts);
            // assemble word cloud
            wordCounts.forEach(function(wordCount) {
                // starting spiral position
                var pos = {
                    radius: 1,
                    radiusInc: 5,
                    arcLength: 10,
                    x: 0,
                    y: 0,
                    t: 0,
                    collisions: 0
                };
                // spiral outwards to find position
                while (pos.collisions < NUM_ATTEMPTS) {
                    // increment position in a spiral
                    pos = spiralPosition(pos);
                    // test for intersection
                    if (!intersectWord(pos, wordCount, cloud, boundingBox)) {
                        cloud.push({
                            text: wordCount.text,
                            fontSize: wordCount.fontSize,
                            percent: Math.round((wordCount.percent * 100) / 10) * 10, // round to nearest 10
                            x: pos.x,
                            y: pos.y,
                            width: wordCount.width,
                            height: wordCount.height,
                            sentiment: wordCount.sentiment,
                            avg: wordCount.avg
                        });
                        break;
                    }
                }
            });
            return cloud;
        },

        extractExtrema: function(data) {
            var sums = _.map(data, function(count) {
                if (_.isNumber(count)) {
                    return count;
                }
                return sentiment.getTotal(count);
            });
            return {
                min: _.min(sums),
                max: _.max(sums),
            };
        },

        renderTile: function(container, data) {
            if (!data || _.isEmpty(data)) {
                return;
            }
            var highlight = this.highlight;
            var wordCounts = _.map(data, function(count, key) {
                if (_.isNumber(count)) {
                    return {
                        count: count,
                        text: key
                    };
                }
                var total = sentiment.getTotal(count);
                var avg = sentiment.getAvg(count);
                return {
                    count: total,
                    text: key,
                    avg: avg,
                    sentiment: sentimentFunc(avg)
                };
            });
            // exit early if no words
            if (wordCounts.length === 0) {
                return;
            }
            // genereate the cloud
            var cloud = this._createWordCloud(wordCounts);
            // build html elements
            var halfSize = this.options.tileSize / 2;
            var html = '';
            cloud.forEach(function(word) {
                // create classes
                var classNames = [
                    'word-cloud-label',
                    'word-cloud-label-' + word.percent,
                    word.text === highlight ? 'highlight' : '',
                    word.sentiment ? word.sentiment : ''
                ].join(' ');
                // create styles
                var styles = [
                    'font-size:' + word.fontSize + 'px',
                    'left:' + (halfSize + word.x - (word.width / 2)) + 'px',
                    'top:' + (halfSize + word.y - (word.height / 2)) + 'px',
                    'width:' + word.width + 'px',
                    'height:' + word.height + 'px',
                ].join(';');
                // create html for entry
                html += '<div class="' + classNames + '"' +
                    'style="' + styles + '"' +
                    'data-sentiment="' + word.avg + '"' +
                    'data-word="' + word.text + '">' +
                    word.text +
                    '</div>';
            });
            container.innerHTML = html;
        }

    });

    module.exports = WordCloud;

}());

},{"../../core/HTML":58,"../../sentiment/Sentiment":62}],70:[function(require,module,exports){
(function() {

    'use strict';

    var HTML = require('../../core/HTML');
    var sentiment = require('../../sentiment/Sentiment');
    var sentimentFunc = sentiment.getClassFunc(-1, 1);

    var isSingleValue = function(count) {
        // single values are never null, and always numbers
        return count !== null && _.isNumber(count);
    };

    var extractCount = function(count) {
        if (isSingleValue(count)) {
            return count;
        }
        return sentiment.getTotal(count);
    };

    var extractSentimentClass = function(avg) {
        if (avg !== undefined) {
            return sentimentFunc(avg);
        }
        return '';
    };

    var extractFrequency = function(count) {
        if (isSingleValue(count)) {
            return {
                count: count
            };
        }
        return {
            count: sentiment.getTotal(count),
            avg: sentiment.getAvg(count)
        };
    };

    var extractAvg = function(frequencies) {
        if (frequencies[0].avg === undefined) {
            return;
        }
        var sum = _.sumBy(frequencies, function(frequency) {
            return frequency.avg;
        });
        return sum / frequencies.length;
    };

    var extractValues = function(data, key) {
        var frequencies = _.map(data, extractFrequency);
        var avg = extractAvg(frequencies);
        var max = _.maxBy(frequencies, function(val) {
            return val.count;
        }).count;
        var total = _.sumBy(frequencies, function(val) {
            return val.count;
        });
        return {
            topic: key,
            frequencies: frequencies,
            max: max,
            total: total,
            avg: avg
        };
    };

    var WordHistogram = HTML.extend({

        options: {
            maxNumWords: 8,
            minFontSize: 16,
            maxFontSize: 22
        },

        isTargetLayer: function( elem ) {
            return this._container && $.contains(this._container, elem );
        },

        clearSelection: function() {
            $(this._container).removeClass('highlight');
            this.highlight = null;
        },

        onMouseOver: function(e) {
            var target = $(e.originalEvent.target);
            $('.word-histogram-entry').removeClass('hover');
            var word = target.attr('data-word');
            if (word) {
                $('.word-histogram-entry[data-word=' + word + ']').addClass('hover');
                if (this.options.handlers.mouseover) {
                    var $parent = target.parents('.leaflet-html-tile');
                    this.options.handlers.mouseover(target, {
                        value: word,
                        x: parseInt($parent.attr('data-x'), 10),
                        y: parseInt($parent.attr('data-y'), 10),
                        z: this._map.getZoom(),
                        type: 'word-histogram',
                        layer: this
                    });
                }
            }
        },

        onMouseOut: function(e) {
            var target = $(e.originalEvent.target);
            $('.word-histogram-entry').removeClass('hover');
            var word = target.attr('data-word');
            if (word) {
                if (this.options.handlers.mouseout) {
                    var $parent = target.parents('.leaflet-html-tile');
                    this.options.handlers.mouseout(target, {
                        value: word,
                        x: parseInt($parent.attr('data-x'), 10),
                        y: parseInt($parent.attr('data-y'), 10),
                        z: this._map.getZoom(),
                        type: 'word-histogram',
                        layer: this
                    });
                }
            }
        },

        onClick: function(e) {
            // un-select and prev selected histogram
            $('.word-histogram-entry').removeClass('highlight');
            $(this._container).removeClass('highlight');
            // get target
            var target = $(e.originalEvent.target);
            if (!this.isTargetLayer(e.originalEvent.target)) {
                // this layer is not the target
                return;
            }
            var word = target.attr('data-word');
            if (word) {
                $(this._container).addClass('highlight');
                $('.word-histogram-entry[data-word=' + word + ']').addClass('highlight');
                this.highlight = word;
                if (this.options.handlers.click) {
                    var $parent = target.parents('.leaflet-html-tile');
                    this.options.handlers.click(target, {
                        value: word,
                        x: parseInt($parent.attr('data-x'), 10),
                        y: parseInt($parent.attr('data-y'), 10),
                        z: this._map.getZoom(),
                        type: 'word-histogram',
                        layer: this
                    });
                }
            } else {
                this.clearSelection();
            }
        },

        extractExtrema: function(data) {
            var sums = _.map(data, function(counts) {
                return _.sumBy(counts, extractCount);
            });
            return {
                min: _.min(sums),
                max: _.max(sums),
            };
        },

        renderTile: function(container, data) {
            if (!data || _.isEmpty(data)) {
                return;
            }
            var highlight = this.highlight;
            // convert object to array
            var values = _.map(data, extractValues).sort(function(a, b) {
                return b.total - a.total;
            });
            // get number of entries
            var numEntries = Math.min(values.length, this.options.maxNumWords);
            var $html = $('<div class="word-histograms" style="display:inline-block;"></div>');
            var totalHeight = 0;
            var minFontSize = this.options.minFontSize;
            var maxFontSize = this.options.maxFontSize;
            var self = this;
            values.slice(0, numEntries).forEach(function(value) {
                var topic = value.topic;
                var frequencies = value.frequencies;
                var max = value.max;
                var total = value.total;
                var avg = value.avg;
                var sentimentClass = extractSentimentClass(avg);
                var highlightClass = (topic === highlight) ? 'highlight' : '';
                // scale the height based on level min / max
                var percent = self.transformValue(total);
                var percentLabel = Math.round((percent * 100) / 10) * 10;
                var height = minFontSize + percent * (maxFontSize - minFontSize);
                totalHeight += height;
                // create container 'entry' for chart and hashtag
                var $entry = $('<div class="word-histogram-entry ' + highlightClass + '" ' +
                    'data-sentiment="' + avg + '"' +
                    'data-word="' + topic + '"' +
                    'style="' +
                    'height:' + height + 'px;"></div>');
                // create chart
                var $chart = $('<div class="word-histogram-left"' +
                    'data-sentiment="' + avg + '"' +
                    'data-word="' + topic + '"' +
                    '></div>');
                var barWidth = 'calc(' + (100 / frequencies.length) + '%)';
                // create bars
                frequencies.forEach(function(frequency) {
                    var count = frequency.count;
                    var avg = frequency.avg;
                    var sentimentClass = extractSentimentClass(avg);
                    // get the percent relative to the highest count in the tile
                    var relativePercent = (max !== 0) ? (count / max) * 100 : 0;
                    // make invisible if zero count
                    var visibility = relativePercent === 0 ? 'hidden' : '';
                    // Get the style class of the bar
                    var percentLabel = Math.round(relativePercent / 10) * 10;
                    var barClasses = [
                        'word-histogram-bar',
                        'word-histogram-bar-' + percentLabel,
                        sentimentClass + '-fill'
                    ].join(' ');
                    var barHeight;
                    var barTop;
                    // ensure there is at least a single pixel of color
                    if ((relativePercent / 100) * height < 3) {
                        barHeight = '3px';
                        barTop = 'calc(100% - 3px)';
                    } else {
                        barHeight = relativePercent + '%';
                        barTop = (100 - relativePercent) + '%';
                    }
                    // create bar
                    $chart.append('<div class="' + barClasses + '"' +
                        'data-word="' + topic + '"' +
                        'style="' +
                        'visibility:' + visibility + ';' +
                        'width:' + barWidth + ';' +
                        'height:' + barHeight + ';' +
                        'top:' + barTop + ';"></div>');
                });
                $entry.append($chart);
                var topicClasses = [
                    'word-histogram-label',
                    'word-histogram-label-' + percentLabel,
                    sentimentClass
                ].join(' ');
                // create tag label
                var $topic = $('<div class="word-histogram-right">' +
                    '<div class="' + topicClasses + '"' +
                    'data-sentiment="' + avg + '"' +
                    'data-word="' + topic + '"' +
                    'style="' +
                    'font-size:' + height + 'px;' +
                    'line-height:' + height + 'px;' +
                    'height:' + height + 'px">' + topic + '</div>' +
                    '</div>');
                $entry.append($topic);
                $html.append($entry);
            });
            $html.css('top', ( this.options.tileSize / 2 ) - (totalHeight / 2));
            container.innerHTML = $html[0].outerHTML;
        }
    });

    module.exports = WordHistogram;

}());

},{"../../core/HTML":58,"../../sentiment/Sentiment":62}],71:[function(require,module,exports){
(function() {

    'use strict';

    var DELAY = 1200;

    module.exports = {

        renderTile: function(elem) {
            var delay = -(Math.random() * DELAY) + 'ms';
            elem.innerHTML = '<div class="blinking blinking-tile" style="animation-delay:' + delay + '"></div>';
        }

    };

}());

},{}],72:[function(require,module,exports){
(function() {

    'use strict';

    var DELAY = 1200;

    module.exports = {

        renderTile: function(elem) {
            var delay = -(Math.random() * DELAY) + 'ms';
            elem.innerHTML =
                '<div class="vertical-centered-box blinking" style="animation-delay:' + delay + '">' +
                    '<div class="content">' +
                        '<div class="loader-circle"></div>' +
                        '<div class="loader-line-mask" style="animation-delay:' + delay + '">' +
                            '<div class="loader-line"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }

    };

}());

},{}],73:[function(require,module,exports){
(function() {

    'use strict';

    var DELAY = 1200;

    module.exports = {

        renderTile: function(elem) {
            var delay = -(Math.random() * DELAY) + 'ms';
            elem.innerHTML =
                '<div class="vertical-centered-box" style="animation-delay:' + delay + '">' +
                    '<div class="content">' +
                        '<div class="loader-circle"></div>' +
                        '<div class="loader-line-mask" style="animation-delay:' + delay + '">' +
                            '<div class="loader-line"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }

    };

}());

},{}],74:[function(require,module,exports){
(function() {

    'use strict';

    var WebGL = require('../../core/WebGL');

    var vert = [
        'precision highp float;',
        'attribute vec2 aPosition;',
        'attribute vec2 aTextureCoord;',
        'uniform mat4 uProjectionMatrix;',
        'uniform mat4 uModelMatrix;',
        'varying vec2 vTextureCoord;',
        'void main() {',
            'vTextureCoord = aTextureCoord;',
            'gl_Position = uProjectionMatrix * uModelMatrix * vec4( aPosition, 0.0, 1.0 );',
        '}'
    ].join('');

    var frag = [
        'precision highp float;',
        'uniform sampler2D uTextureSampler;',
        'uniform float uOpacity;',
        'varying vec2 vTextureCoord;',
        'void main() {',
            'vec4 color = texture2D(uTextureSampler, vTextureCoord);',
            'gl_FragColor = vec4(color.rgb, color.a * uOpacity);',
        '}'
    ].join('');

    var Heatmap = WebGL.extend({

        options: {
            shaders: {
                vert: vert,
                frag: frag,
            }
        }

    });

    module.exports = Heatmap;

}());

},{"../../core/WebGL":60}],75:[function(require,module,exports){
(function() {

    'use strict';

    var Requestor = require('./Requestor');

    function MetaRequestor() {
        Requestor.apply(this, arguments);
    }

    MetaRequestor.prototype = Object.create(Requestor.prototype);

    MetaRequestor.prototype.getHash = function(req) {
        return req.type + '-' +
            req.index + '-' +
            req.store;
    };

    MetaRequestor.prototype.getURL = function(res) {
        return 'meta/' +
            res.type + '/' +
            res.endpoint + '/' +
            res.index + '/' +
            res.store;
    };

    module.exports = MetaRequestor;

}());

},{"./Requestor":76}],76:[function(require,module,exports){
(function() {

    'use strict';

    var RETRY_INTERVAL = 5000;

    function getHost() {
        var loc = window.location;
        var new_uri;
        if (loc.protocol === 'https:') {
            new_uri = 'wss:';
        } else {
            new_uri = 'ws:';
        }
        return new_uri + '//' + loc.host + loc.pathname;
    }

    function establishConnection(requestor, callback) {
        requestor.socket = new WebSocket(getHost() + requestor.url);
        // on open
        requestor.socket.onopen = function() {
            requestor.isOpen = true;
            console.log('Websocket connection established');
            callback.apply(this, arguments);
        };
        // on message
        requestor.socket.onmessage = function(event) {
            var res = JSON.parse(event.data);
            var hash = requestor.getHash(res);
            var request = requestor.requests[hash];
            delete requestor.requests[hash];
            if (res.success) {
                request.resolve(requestor.getURL(res), res);
            } else {
                request.reject(res);
            }
        };
        // on close
        requestor.socket.onclose = function() {
            // log close only if connection was ever open
            if (requestor.isOpen) {
                console.warn('Websocket connection closed, attempting to re-connect in ' + RETRY_INTERVAL);
            }
            requestor.socket = null;
            requestor.isOpen = false;
            // reject all pending requests
            Object.keys(requestor.requests).forEach(function(key) {
                requestor.requests[key].reject();
            });
            // clear request map
            requestor.requests = {};
            // attempt to re-establish connection
            setTimeout(function() {
                establishConnection(requestor, function() {
                    // once connection is re-established, send pending requests
                    requestor.pending.forEach(function(req) {
                        requestor.get(req);
                    });
                    requestor.pending = [];
                });
            }, RETRY_INTERVAL);
        };
    }

    function Requestor(url, callback) {
        this.url = url;
        this.requests = {};
        this.pending = [];
        this.isOpen = false;
        establishConnection(this, callback);
    }

    Requestor.prototype.getHash = function( /*req*/ ) {
        // override
    };

    Requestor.prototype.getURL = function( /*res*/ ) {
        // override
    };

    Requestor.prototype.get = function(req) {
        if (!this.isOpen) {
            // if no connection, add request to pending queue
            this.pending.push(req);
            return;
        }
        var hash = this.getHash(req);
        var request = this.requests[hash];
        if (request) {
            return request.promise();
        }
        request = this.requests[hash] = $.Deferred();
        this.socket.send(JSON.stringify(req));
        return request.promise();
    };

    Requestor.prototype.close = function() {
        this.socket.onclose = null;
        this.socket.close();
        this.socket = null;
    };

    module.exports = Requestor;

}());

},{}],77:[function(require,module,exports){
(function() {

    'use strict';

    var stringify = require('json-stable-stringify');
    var Requestor = require('./Requestor');

    function pruneEmpty(obj) {
        return function prune(current) {
            _.forOwn(current, function(value, key) {
              if (_.isUndefined(value) || _.isNull(value) || _.isNaN(value) ||
                (_.isString(value) && _.isEmpty(value)) ||
                (_.isObject(value) && _.isEmpty(prune(value)))) {
                delete current[key];
              }
            });
            // remove any leftover undefined values from the delete
            // operation on an array
            if (_.isArray(current)) {
                _.pull(current, undefined);
            }
            return current;
        }(_.cloneDeep(obj)); // do not modify the original object, create a clone instead
    }

    function TileRequestor() {
        Requestor.apply(this, arguments);
    }

    TileRequestor.prototype = Object.create(Requestor.prototype);

    TileRequestor.prototype.getHash = function(req) {
        var coord = req.coord;
        var hash = stringify(pruneEmpty(req.params));
        return req.type + '-' +
            req.index + '-' +
            req.store + '-' +
            coord.x + '-' +
            coord.y + '-' +
            coord.z + '-' +
            hash;
    };

    TileRequestor.prototype.getURL = function(res) {
        var coord = res.coord;
        return 'tile/' +
            res.type + '/' +
            res.index + '/' +
            res.store + '/' +
            coord.z + '/' +
            coord.x + '/' +
            coord.y;
    };

    module.exports = TileRequestor;

}());

},{"./Requestor":76,"json-stable-stringify":22}]},{},[26])(26)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXNwZXIvc3JjL2NvcmUvQ29sb3JUZXh0dXJlMkQuanMiLCJub2RlX21vZHVsZXMvZXNwZXIvc3JjL2NvcmUvRGVwdGhUZXh0dXJlMkQuanMiLCJub2RlX21vZHVsZXMvZXNwZXIvc3JjL2NvcmUvSW5kZXhCdWZmZXIuanMiLCJub2RlX21vZHVsZXMvZXNwZXIvc3JjL2NvcmUvUmVuZGVyVGFyZ2V0LmpzIiwibm9kZV9tb2R1bGVzL2VzcGVyL3NyYy9jb3JlL1JlbmRlcmFibGUuanMiLCJub2RlX21vZHVsZXMvZXNwZXIvc3JjL2NvcmUvU2hhZGVyLmpzIiwibm9kZV9tb2R1bGVzL2VzcGVyL3NyYy9jb3JlL1NoYWRlclBhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9lc3Blci9zcmMvY29yZS9UZXh0dXJlMkQuanMiLCJub2RlX21vZHVsZXMvZXNwZXIvc3JjL2NvcmUvVGV4dHVyZUN1YmVNYXAuanMiLCJub2RlX21vZHVsZXMvZXNwZXIvc3JjL2NvcmUvVmVydGV4QnVmZmVyLmpzIiwibm9kZV9tb2R1bGVzL2VzcGVyL3NyYy9jb3JlL1ZlcnRleFBhY2thZ2UuanMiLCJub2RlX21vZHVsZXMvZXNwZXIvc3JjL2NvcmUvVmlld3BvcnQuanMiLCJub2RlX21vZHVsZXMvZXNwZXIvc3JjL2NvcmUvV2ViR0xDb250ZXh0LmpzIiwibm9kZV9tb2R1bGVzL2VzcGVyL3NyYy9jb3JlL1dlYkdMQ29udGV4dFN0YXRlLmpzIiwibm9kZV9tb2R1bGVzL2VzcGVyL3NyYy9leHBvcnRzLmpzIiwibm9kZV9tb2R1bGVzL2VzcGVyL3NyYy91dGlsL0FzeW5jLmpzIiwibm9kZV9tb2R1bGVzL2VzcGVyL3NyYy91dGlsL0ltYWdlTG9hZGVyLmpzIiwibm9kZV9tb2R1bGVzL2VzcGVyL3NyYy91dGlsL1N0YWNrLmpzIiwibm9kZV9tb2R1bGVzL2VzcGVyL3NyYy91dGlsL1N0YWNrTWFwLmpzIiwibm9kZV9tb2R1bGVzL2VzcGVyL3NyYy91dGlsL1V0aWwuanMiLCJub2RlX21vZHVsZXMvZXNwZXIvc3JjL3V0aWwvWEhSTG9hZGVyLmpzIiwibm9kZV9tb2R1bGVzL2pzb24tc3RhYmxlLXN0cmluZ2lmeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9qc29uLXN0YWJsZS1zdHJpbmdpZnkvbm9kZV9tb2R1bGVzL2pzb25pZnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvanNvbi1zdGFibGUtc3RyaW5naWZ5L25vZGVfbW9kdWxlcy9qc29uaWZ5L2xpYi9wYXJzZS5qcyIsIm5vZGVfbW9kdWxlcy9qc29uLXN0YWJsZS1zdHJpbmdpZnkvbm9kZV9tb2R1bGVzL2pzb25pZnkvbGliL3N0cmluZ2lmeS5qcyIsInNjcmlwdHMvZXhwb3J0cy5qcyIsInNjcmlwdHMvbGF5ZXIvYWdnL0RhdGVIaXN0b2dyYW0uanMiLCJzY3JpcHRzL2xheWVyL2FnZy9IaXN0b2dyYW0uanMiLCJzY3JpcHRzL2xheWVyL2FnZy9NZXRyaWMuanMiLCJzY3JpcHRzL2xheWVyL2FnZy9UZXJtcy5qcyIsInNjcmlwdHMvbGF5ZXIvYWdnL1Rlcm1zRmlsdGVyLmpzIiwic2NyaXB0cy9sYXllci9hZ2cvVG9wSGl0cy5qcyIsInNjcmlwdHMvbGF5ZXIvYWdnL1RvcFRlcm1zLmpzIiwic2NyaXB0cy9sYXllci9jb3JlL0Jhc2UuanMiLCJzY3JpcHRzL2xheWVyL2NvcmUvRGVidWcuanMiLCJzY3JpcHRzL2xheWVyL2NvcmUvSW1hZ2UuanMiLCJzY3JpcHRzL2xheWVyL2NvcmUvTGl2ZS5qcyIsInNjcmlwdHMvbGF5ZXIvY29yZS9QZW5kaW5nLmpzIiwic2NyaXB0cy9sYXllci9leHBvcnRzLmpzIiwic2NyaXB0cy9sYXllci9taXhpbi9Db2xvclJhbXAuanMiLCJzY3JpcHRzL2xheWVyL21peGluL1ZhbHVlVHJhbnNmb3JtLmpzIiwic2NyaXB0cy9sYXllci9wYXJhbS9CaW5uaW5nLmpzIiwic2NyaXB0cy9sYXllci9wYXJhbS9UaWxpbmcuanMiLCJzY3JpcHRzL2xheWVyL3F1ZXJ5L0Jvb2wuanMiLCJzY3JpcHRzL2xheWVyL3F1ZXJ5L1ByZWZpeC5qcyIsInNjcmlwdHMvbGF5ZXIvcXVlcnkvUXVlcnlTdHJpbmcuanMiLCJzY3JpcHRzL2xheWVyL3F1ZXJ5L1JhbmdlLmpzIiwic2NyaXB0cy9sYXllci9xdWVyeS9UZXJtcy5qcyIsInNjcmlwdHMvbGF5ZXIvdHlwZS9IZWF0bWFwLmpzIiwic2NyaXB0cy9sYXllci90eXBlL1ByZXZpZXcuanMiLCJzY3JpcHRzL2xheWVyL3R5cGUvVG9wQ291bnQuanMiLCJzY3JpcHRzL2xheWVyL3R5cGUvVG9wRnJlcXVlbmN5LmpzIiwic2NyaXB0cy9sYXllci90eXBlL1RvcFRyYWlscy5qcyIsInNjcmlwdHMvbGF5ZXIvdHlwZS9Ub3BpY0NvdW50LmpzIiwic2NyaXB0cy9sYXllci90eXBlL1RvcGljRnJlcXVlbmN5LmpzIiwic2NyaXB0cy9yZW5kZXJlci9jb3JlL0NhbnZhcy5qcyIsInNjcmlwdHMvcmVuZGVyZXIvY29yZS9ET00uanMiLCJzY3JpcHRzL3JlbmRlcmVyL2NvcmUvSFRNTC5qcyIsInNjcmlwdHMvcmVuZGVyZXIvY29yZS9PdmVybGF5LmpzIiwic2NyaXB0cy9yZW5kZXJlci9jb3JlL1dlYkdMLmpzIiwic2NyaXB0cy9yZW5kZXJlci9leHBvcnRzLmpzIiwic2NyaXB0cy9yZW5kZXJlci9zZW50aW1lbnQvU2VudGltZW50LmpzIiwic2NyaXB0cy9yZW5kZXJlci90eXBlL2NhbnZhcy9IZWF0bWFwLmpzIiwic2NyaXB0cy9yZW5kZXJlci90eXBlL2NhbnZhcy9QcmV2aWV3LmpzIiwic2NyaXB0cy9yZW5kZXJlci90eXBlL2NhbnZhcy9Ub3BUcmFpbHMuanMiLCJzY3JpcHRzL3JlbmRlcmVyL3R5cGUvZGVidWcvQ29vcmQuanMiLCJzY3JpcHRzL3JlbmRlcmVyL3R5cGUvaHRtbC9IZWF0bWFwLmpzIiwic2NyaXB0cy9yZW5kZXJlci90eXBlL2h0bWwvUmluZy5qcyIsInNjcmlwdHMvcmVuZGVyZXIvdHlwZS9odG1sL1dvcmRDbG91ZC5qcyIsInNjcmlwdHMvcmVuZGVyZXIvdHlwZS9odG1sL1dvcmRIaXN0b2dyYW0uanMiLCJzY3JpcHRzL3JlbmRlcmVyL3R5cGUvcGVuZGluZy9CbGluay5qcyIsInNjcmlwdHMvcmVuZGVyZXIvdHlwZS9wZW5kaW5nL0JsaW5rU3Bpbi5qcyIsInNjcmlwdHMvcmVuZGVyZXIvdHlwZS9wZW5kaW5nL1NwaW4uanMiLCJzY3JpcHRzL3JlbmRlcmVyL3R5cGUvd2ViZ2wvSGVhdG1hcC5qcyIsInNjcmlwdHMvcmVxdWVzdC9NZXRhUmVxdWVzdG9yLmpzIiwic2NyaXB0cy9yZXF1ZXN0L1JlcXVlc3Rvci5qcyIsInNjcmlwdHMvcmVxdWVzdC9UaWxlUmVxdWVzdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ROQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIFRleHR1cmUyRCA9IHJlcXVpcmUoJy4vVGV4dHVyZTJEJyk7XHJcbiAgICB2YXIgSW1hZ2VMb2FkZXIgPSByZXF1aXJlKCcuLi91dGlsL0ltYWdlTG9hZGVyJyk7XHJcbiAgICB2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwvVXRpbCcpO1xyXG4gICAgdmFyIE1BR19GSUxURVJTID0ge1xyXG4gICAgICAgIE5FQVJFU1Q6IHRydWUsXHJcbiAgICAgICAgTElORUFSOiB0cnVlXHJcbiAgICB9O1xyXG4gICAgdmFyIE1JTl9GSUxURVJTID0ge1xyXG4gICAgICAgIE5FQVJFU1Q6IHRydWUsXHJcbiAgICAgICAgTElORUFSOiB0cnVlLFxyXG4gICAgICAgIE5FQVJFU1RfTUlQTUFQX05FQVJFU1Q6IHRydWUsXHJcbiAgICAgICAgTElORUFSX01JUE1BUF9ORUFSRVNUOiB0cnVlLFxyXG4gICAgICAgIE5FQVJFU1RfTUlQTUFQX0xJTkVBUjogdHJ1ZSxcclxuICAgICAgICBMSU5FQVJfTUlQTUFQX0xJTkVBUjogdHJ1ZVxyXG4gICAgfTtcclxuICAgIHZhciBXUkFQX01PREVTID0ge1xyXG4gICAgICAgIFJFUEVBVDogdHJ1ZSxcclxuICAgICAgICBNSVJST1JFRF9SRVBFQVQ6IHRydWUsXHJcbiAgICAgICAgQ0xBTVBfVE9fRURHRTogdHJ1ZVxyXG4gICAgfTtcclxuICAgIHZhciBUWVBFUyA9IHtcclxuICAgICAgICBVTlNJR05FRF9CWVRFOiB0cnVlLFxyXG4gICAgICAgIEZMT0FUOiB0cnVlXHJcbiAgICB9O1xyXG4gICAgdmFyIEZPUk1BVFMgPSB7XHJcbiAgICAgICAgUkdCOiB0cnVlLFxyXG4gICAgICAgIFJHQkE6IHRydWVcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGVmYXVsdCB0eXBlIGZvciBjb2xvciB0ZXh0dXJlcy5cclxuICAgICAqL1xyXG4gICAgdmFyIERFRkFVTFRfVFlQRSA9ICdVTlNJR05FRF9CWVRFJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IGZvcm1hdCBmb3IgY29sb3IgdGV4dHVyZXMuXHJcbiAgICAgKi9cclxuICAgIHZhciBERUZBVUxUX0ZPUk1BVCA9ICdSR0JBJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IHdyYXAgbW9kZSBmb3IgY29sb3IgdGV4dHVyZXMuXHJcbiAgICAgKi9cclxuICAgIHZhciBERUZBVUxUX1dSQVAgPSAnUkVQRUFUJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IG1pbiAvIG1hZyBmaWx0ZXIgZm9yIGNvbG9yIHRleHR1cmVzLlxyXG4gICAgICovXHJcbiAgICB2YXIgREVGQVVMVF9GSUxURVIgPSAnTElORUFSJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IGZvciB3aGV0aGVyIGFscGhhIHByZW11bHRpcGx5aW5nIGlzIGVuYWJsZWQuXHJcbiAgICAgKi9cclxuICAgIHZhciBERUZBVUxUX1BSRU1VTFRJUExZX0FMUEhBID0gdHJ1ZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IGZvciB3aGV0aGVyIG1pcG1hcHBpbmcgaXMgZW5hYmxlZC5cclxuICAgICAqL1xyXG4gICAgdmFyIERFRkFVTFRfTUlQTUFQID0gdHJ1ZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IGZvciB3aGV0aGVyIGludmVydC15IGlzIGVuYWJsZWQuXHJcbiAgICAgKi9cclxuICAgIHZhciBERUZBVUxUX0lOVkVSVF9ZID0gdHJ1ZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc3RhbnRpYXRlcyBhIENvbG9yVGV4dHVyZTJEIG9iamVjdC5cclxuICAgICAqIEBjbGFzcyBDb2xvclRleHR1cmUyRFxyXG4gICAgICogQGNsYXNzZGVzYyBBIHRleHR1cmUgY2xhc3MgdG8gcmVwcmVzZW50IGEgMkQgY29sb3IgdGV4dHVyZS5cclxuICAgICAqIEBhdWdtZW50cyBUZXh0dXJlMkRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc3BlYyAtIFRoZSBzcGVjaWZpY2F0aW9uIGFyZ3VtZW50cy5cclxuICAgICAqIEBwYXJhbSB7SW1hZ2VEYXRhfEhUTUxJbWFnZUVsZW1lbnR8SFRNTENhbnZhc0VsZW1lbnR8SFRNTFZpZGVvRWxlbWVudH0gc3BlYy5pbWFnZSAtIFRoZSBIVE1MSW1hZ2VFbGVtZW50IHRvIGJ1ZmZlci5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzcGVjLnVybCAtIFRoZSBIVE1MSW1hZ2VFbGVtZW50IFVSTCB0byBsb2FkIGFuZCBidWZmZXIuXHJcbiAgICAgKiBAcGFyYW0ge1VpbnQ4QXJyYXl8RmxvYXQzMkFycmF5fSBzcGVjLnNyYyAtIFRoZSBkYXRhIHRvIGJ1ZmZlci5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCAtIFRoZSB3aWR0aCBvZiB0aGUgdGV4dHVyZS5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBUaGUgaGVpZ2h0IG9mIHRoZSB0ZXh0dXJlLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNwZWMud3JhcCAtIFRoZSB3cmFwcGluZyB0eXBlIG92ZXIgYm90aCBTIGFuZCBUIGRpbWVuc2lvbi5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzcGVjLndyYXBTIC0gVGhlIHdyYXBwaW5nIHR5cGUgb3ZlciB0aGUgUyBkaW1lbnNpb24uXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3BlYy53cmFwVCAtIFRoZSB3cmFwcGluZyB0eXBlIG92ZXIgdGhlIFQgZGltZW5zaW9uLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNwZWMuZmlsdGVyIC0gVGhlIG1pbiAvIG1hZyBmaWx0ZXIgdXNlZCBkdXJpbmcgc2NhbGluZy5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzcGVjLm1pbkZpbHRlciAtIFRoZSBtaW5pZmljYXRpb24gZmlsdGVyIHVzZWQgZHVyaW5nIHNjYWxpbmcuXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3BlYy5tYWdGaWx0ZXIgLSBUaGUgbWFnbmlmaWNhdGlvbiBmaWx0ZXIgdXNlZCBkdXJpbmcgc2NhbGluZy5cclxuICAgICAqIEBwYXJhbSB7Ym9vbH0gc3BlYy5taXBNYXAgLSBXaGV0aGVyIG9yIG5vdCBtaXAtbWFwcGluZyBpcyBlbmFibGVkLlxyXG4gICAgICogQHBhcmFtIHtib29sfSBzcGVjLmludmVydFkgLSBXaGV0aGVyIG9yIG5vdCBpbnZlcnQteSBpcyBlbmFibGVkLlxyXG4gICAgICogQHBhcmFtIHtib29sfSBzcGVjLnByZU11bHRpcGx5QWxwaGEgLSBXaGV0aGVyIG9yIG5vdCBhbHBoYSBwcmVtdWx0aXBseWluZyBpcyBlbmFibGVkLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNwZWMuZm9ybWF0IC0gVGhlIHRleHR1cmUgcGl4ZWwgZm9ybWF0LlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNwZWMudHlwZSAtIFRoZSB0ZXh0dXJlIHBpeGVsIGNvbXBvbmVudCB0eXBlLlxyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgaWYgdGhlIGRhdGEgaXMgbG9hZGVkIGFzeW5jaHJvbm91c2x5IHZpYSBhIFVSTC5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gQ29sb3JUZXh0dXJlMkQoIHNwZWMsIGNhbGxiYWNrICkge1xyXG4gICAgICAgIHNwZWMgPSBzcGVjIHx8IHt9O1xyXG4gICAgICAgIC8vIGdldCBzcGVjaWZpYyBwYXJhbXNcclxuICAgICAgICBzcGVjLndyYXBTID0gc3BlYy53cmFwUyB8fCBzcGVjLndyYXA7XHJcbiAgICAgICAgc3BlYy53cmFwVCA9IHNwZWMud3JhcFQgfHwgc3BlYy53cmFwO1xyXG4gICAgICAgIHNwZWMubWluRmlsdGVyID0gc3BlYy5taW5GaWx0ZXIgfHwgc3BlYy5maWx0ZXI7XHJcbiAgICAgICAgc3BlYy5tYWdGaWx0ZXIgPSBzcGVjLm1hZ0ZpbHRlciB8fCBzcGVjLmZpbHRlcjtcclxuICAgICAgICAvLyBzZXQgdGV4dHVyZSBwYXJhbXNcclxuICAgICAgICBzcGVjLndyYXBTID0gV1JBUF9NT0RFU1sgc3BlYy53cmFwUyBdID8gc3BlYy53cmFwUyA6IERFRkFVTFRfV1JBUDtcclxuICAgICAgICBzcGVjLndyYXBUID0gV1JBUF9NT0RFU1sgc3BlYy53cmFwVCBdID8gc3BlYy53cmFwVCA6IERFRkFVTFRfV1JBUDtcclxuICAgICAgICBzcGVjLm1pbkZpbHRlciA9IE1JTl9GSUxURVJTWyBzcGVjLm1pbkZpbHRlciBdID8gc3BlYy5taW5GaWx0ZXIgOiBERUZBVUxUX0ZJTFRFUjtcclxuICAgICAgICBzcGVjLm1hZ0ZpbHRlciA9IE1BR19GSUxURVJTWyBzcGVjLm1hZ0ZpbHRlciBdID8gc3BlYy5tYWdGaWx0ZXIgOiBERUZBVUxUX0ZJTFRFUjtcclxuICAgICAgICAvLyBzZXQgb3RoZXIgcHJvcGVydGllc1xyXG4gICAgICAgIHNwZWMubWlwTWFwID0gc3BlYy5taXBNYXAgIT09IHVuZGVmaW5lZCA/IHNwZWMubWlwTWFwIDogREVGQVVMVF9NSVBNQVA7XHJcbiAgICAgICAgc3BlYy5pbnZlcnRZID0gc3BlYy5pbnZlcnRZICE9PSB1bmRlZmluZWQgPyBzcGVjLmludmVydFkgOiBERUZBVUxUX0lOVkVSVF9ZO1xyXG4gICAgICAgIHNwZWMucHJlTXVsdGlwbHlBbHBoYSA9IHNwZWMucHJlTXVsdGlwbHlBbHBoYSAhPT0gdW5kZWZpbmVkID8gc3BlYy5wcmVNdWx0aXBseUFscGhhIDogREVGQVVMVF9QUkVNVUxUSVBMWV9BTFBIQTtcclxuICAgICAgICAvLyBzZXQgZm9ybWF0XHJcbiAgICAgICAgc3BlYy5mb3JtYXQgPSBGT1JNQVRTWyBzcGVjLmZvcm1hdCBdID8gc3BlYy5mb3JtYXQgOiBERUZBVUxUX0ZPUk1BVDtcclxuICAgICAgICAvLyBidWZmZXIgdGhlIHRleHR1cmUgYmFzZWQgb24gYXJndW1lbnQgdHlwZVxyXG4gICAgICAgIGlmICggdHlwZW9mIHNwZWMuc3JjID09PSAnc3RyaW5nJyApIHtcclxuICAgICAgICAgICAgLy8gcmVxdWVzdCBzb3VyY2UgZnJvbSB1cmxcclxuICAgICAgICAgICAgLy8gVE9ETzogcHV0IGV4dGVuc2lvbiBoYW5kbGluZyBmb3IgYXJyYXlidWZmZXIgLyBpbWFnZSAvIHZpZGVvIGRpZmZlcmVudGlhdGlvblxyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIEltYWdlTG9hZGVyLmxvYWQoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiBzcGVjLnNyYyxcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCBpbWFnZSApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBzZXQgdG8gdW5zaWduZWQgYnl0ZSB0eXBlXHJcbiAgICAgICAgICAgICAgICAgICAgc3BlYy50eXBlID0gJ1VOU0lHTkVEX0JZVEUnO1xyXG4gICAgICAgICAgICAgICAgICAgIHNwZWMuc3JjID0gVXRpbC5yZXNpemVDYW52YXMoIHNwZWMsIGltYWdlICk7XHJcbiAgICAgICAgICAgICAgICAgICAgVGV4dHVyZTJELmNhbGwoIHRoYXQsIHNwZWMgKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIGNhbGxiYWNrICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayggbnVsbCwgdGhhdCApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oIGVyciApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIGNhbGxiYWNrICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayggZXJyLCBudWxsICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKCBVdGlsLmlzQ2FudmFzVHlwZSggc3BlYy5zcmMgKSApIHtcclxuICAgICAgICAgICAgLy8gaXMgaW1hZ2UgLyBjYW52YXMgLyB2aWRlbyB0eXBlXHJcbiAgICAgICAgICAgIC8vIHNldCB0byB1bnNpZ25lZCBieXRlIHR5cGVcclxuICAgICAgICAgICAgc3BlYy50eXBlID0gJ1VOU0lHTkVEX0JZVEUnO1xyXG4gICAgICAgICAgICBzcGVjLnNyYyA9IFV0aWwucmVzaXplQ2FudmFzKCBzcGVjLCBzcGVjLnNyYyApO1xyXG4gICAgICAgICAgICBUZXh0dXJlMkQuY2FsbCggdGhpcywgc3BlYyApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGFycmF5LCBhcnJheWJ1ZmZlciwgb3IgbnVsbFxyXG4gICAgICAgICAgICBpZiAoIHNwZWMuc3JjID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiBubyBkYXRhIGlzIHByb3ZpZGVkLCBhc3N1bWUgdGhpcyB0ZXh0dXJlIHdpbGwgYmUgcmVuZGVyZWRcclxuICAgICAgICAgICAgICAgIC8vIHRvLiBJbiB0aGlzIGNhc2UgZGlzYWJsZSBtaXBtYXBwaW5nLCB0aGVyZSBpcyBubyBuZWVkIGFuZCBpdFxyXG4gICAgICAgICAgICAgICAgLy8gd2lsbCBvbmx5IGludHJvZHVjZSB2ZXJ5IHBlY3VsaWFyIGFuZCBkaWZmaWN1bHQgdG8gZGlzY2VyblxyXG4gICAgICAgICAgICAgICAgLy8gcmVuZGVyaW5nIHBoZW5vbWVuYSBpbiB3aGljaCB0aGUgdGV4dHVyZSAndHJhbnNmb3JtcycgYXRcclxuICAgICAgICAgICAgICAgIC8vIGNlcnRhaW4gYW5nbGVzIC8gZGlzdGFuY2VzIHRvIHRoZSBtaXBtYXBwZWQgKGVtcHR5KSBwb3J0aW9ucy5cclxuICAgICAgICAgICAgICAgIHNwZWMubWlwTWFwID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gYnVmZmVyIGZyb20gYXJnXHJcbiAgICAgICAgICAgIHNwZWMudHlwZSA9IFRZUEVTWyBzcGVjLnR5cGUgXSA/IHNwZWMudHlwZSA6IERFRkFVTFRfVFlQRTtcclxuICAgICAgICAgICAgVGV4dHVyZTJELmNhbGwoIHRoaXMsIHNwZWMgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgQ29sb3JUZXh0dXJlMkQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVGV4dHVyZTJELnByb3RvdHlwZSApO1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gQ29sb3JUZXh0dXJlMkQ7XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgVGV4dHVyZTJEID0gcmVxdWlyZSgnLi9UZXh0dXJlMkQnKTtcclxuICAgIHZhciBNQUdfRklMVEVSUyA9IHtcclxuICAgICAgICBORUFSRVNUOiB0cnVlLFxyXG4gICAgICAgIExJTkVBUjogdHJ1ZVxyXG4gICAgfTtcclxuICAgIHZhciBNSU5fRklMVEVSUyA9IHtcclxuICAgICAgICBORUFSRVNUOiB0cnVlLFxyXG4gICAgICAgIExJTkVBUjogdHJ1ZVxyXG4gICAgfTtcclxuICAgIHZhciBXUkFQX01PREVTID0ge1xyXG4gICAgICAgIFJFUEVBVDogdHJ1ZSxcclxuICAgICAgICBDTEFNUF9UT19FREdFOiB0cnVlLFxyXG4gICAgICAgIE1JUlJPUkVEX1JFUEVBVDogdHJ1ZVxyXG4gICAgfTtcclxuICAgIHZhciBERVBUSF9UWVBFUyA9IHtcclxuICAgICAgICBVTlNJR05FRF9CWVRFOiB0cnVlLFxyXG4gICAgICAgIFVOU0lHTkVEX1NIT1JUOiB0cnVlLFxyXG4gICAgICAgIFVOU0lHTkVEX0lOVDogdHJ1ZVxyXG4gICAgfTtcclxuICAgIHZhciBGT1JNQVRTID0ge1xyXG4gICAgICAgIERFUFRIX0NPTVBPTkVOVDogdHJ1ZSxcclxuICAgICAgICBERVBUSF9TVEVOQ0lMOiB0cnVlXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlZmF1bHQgdHlwZSBmb3IgZGVwdGggdGV4dHVyZXMuXHJcbiAgICAgKi9cclxuICAgIHZhciBERUZBVUxUX1RZUEUgPSAnVU5TSUdORURfSU5UJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IGZvcm1hdCBmb3IgZGVwdGggdGV4dHVyZXMuXHJcbiAgICAgKi9cclxuICAgIHZhciBERUZBVUxUX0ZPUk1BVCA9ICdERVBUSF9DT01QT05FTlQnO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlZmF1bHQgd3JhcCBtb2RlIGZvciBkZXB0aCB0ZXh0dXJlcy5cclxuICAgICAqL1xyXG4gICAgdmFyIERFRkFVTFRfV1JBUCA9ICdDTEFNUF9UT19FREdFJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IG1pbiAvIG1hZyBmaWx0ZXIgZm9yIGRlcHRoIHRleHR1cmVzLlxyXG4gICAgICovXHJcbiAgICB2YXIgREVGQVVMVF9GSUxURVIgPSAnTElORUFSJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc3RhbnRpYXRlcyBhIERlcHRoVGV4dHVyZTJEIG9iamVjdC5cclxuICAgICAqIEBjbGFzcyBEZXB0aFRleHR1cmUyRFxyXG4gICAgICogQGNsYXNzZGVzYyBBIHRleHR1cmUgY2xhc3MgdG8gcmVwcmVzZW50IGEgMkQgZGVwdGggdGV4dHVyZS5cclxuICAgICAqIEBhdWdtZW50cyBUZXh0dXJlMkRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc3BlYyAtIFRoZSBzcGVjaWZpY2F0aW9uIGFyZ3VtZW50cy5cclxuICAgICAqIEBwYXJhbSB7VWludDhBcnJheXxVaW50MTZBcnJheXxVaW50MzJBcnJheX0gc3BlYy5zcmMgLSBUaGUgZGF0YSB0byBidWZmZXIuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBUaGUgd2lkdGggb2YgdGhlIHRleHR1cmUuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gVGhlIGhlaWdodCBvZiB0aGUgdGV4dHVyZS5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzcGVjLndyYXAgLSBUaGUgd3JhcHBpbmcgdHlwZSBvdmVyIGJvdGggUyBhbmQgVCBkaW1lbnNpb24uXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3BlYy53cmFwUyAtIFRoZSB3cmFwcGluZyB0eXBlIG92ZXIgdGhlIFMgZGltZW5zaW9uLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNwZWMud3JhcFQgLSBUaGUgd3JhcHBpbmcgdHlwZSBvdmVyIHRoZSBUIGRpbWVuc2lvbi5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzcGVjLmZpbHRlciAtIFRoZSBtaW4gLyBtYWcgZmlsdGVyIHVzZWQgZHVyaW5nIHNjYWxpbmcuXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3BlYy5taW5GaWx0ZXIgLSBUaGUgbWluaWZpY2F0aW9uIGZpbHRlciB1c2VkIGR1cmluZyBzY2FsaW5nLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNwZWMubWFnRmlsdGVyIC0gVGhlIG1hZ25pZmljYXRpb24gZmlsdGVyIHVzZWQgZHVyaW5nIHNjYWxpbmcuXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3BlYy5mb3JtYXQgLSBUaGUgdGV4dHVyZSBwaXhlbCBmb3JtYXQuXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3BlYy50eXBlIC0gVGhlIHRleHR1cmUgcGl4ZWwgY29tcG9uZW50IHR5cGUuXHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIFRoZSBjYWxsYmFjayB0byBiZSBleGVjdXRlZCBpZiB0aGUgZGF0YSBpcyBsb2FkZWQgYXN5bmNocm9ub3VzbHkgdmlhIGEgVVJMLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBEZXB0aFRleHR1cmUyRCggc3BlYyApIHtcclxuICAgICAgICBzcGVjID0gc3BlYyB8fCB7fTtcclxuICAgICAgICAvLyBnZXQgc3BlY2lmaWMgcGFyYW1zXHJcbiAgICAgICAgc3BlYy53cmFwUyA9IHNwZWMud3JhcFMgfHwgc3BlYy53cmFwO1xyXG4gICAgICAgIHNwZWMud3JhcFQgPSBzcGVjLndyYXBUIHx8IHNwZWMud3JhcDtcclxuICAgICAgICBzcGVjLm1pbkZpbHRlciA9IHNwZWMubWluRmlsdGVyIHx8IHNwZWMuZmlsdGVyO1xyXG4gICAgICAgIHNwZWMubWFnRmlsdGVyID0gc3BlYy5tYWdGaWx0ZXIgfHwgc3BlYy5maWx0ZXI7XHJcbiAgICAgICAgLy8gc2V0IHRleHR1cmUgcGFyYW1zXHJcbiAgICAgICAgc3BlYy53cmFwUyA9IFdSQVBfTU9ERVNbIHNwZWMud3JhcFMgXSA/IHNwZWMud3JhcFMgOiBERUZBVUxUX1dSQVA7XHJcbiAgICAgICAgc3BlYy53cmFwVCA9IFdSQVBfTU9ERVNbIHNwZWMud3JhcFQgXSA/IHNwZWMud3JhcFQgOiBERUZBVUxUX1dSQVA7XHJcbiAgICAgICAgc3BlYy5taW5GaWx0ZXIgPSBNSU5fRklMVEVSU1sgc3BlYy5taW5GaWx0ZXIgXSA/IHNwZWMubWluRmlsdGVyIDogREVGQVVMVF9GSUxURVI7XHJcbiAgICAgICAgc3BlYy5tYWdGaWx0ZXIgPSBNQUdfRklMVEVSU1sgc3BlYy5tYWdGaWx0ZXIgXSA/IHNwZWMubWFnRmlsdGVyIDogREVGQVVMVF9GSUxURVI7XHJcbiAgICAgICAgLy8gc2V0IG1pcC1tYXBwaW5nIGFuZCBmb3JtYXRcclxuICAgICAgICBzcGVjLm1pcE1hcCA9IGZhbHNlOyAvLyBkaXNhYmxlIG1pcC1tYXBwaW5nXHJcbiAgICAgICAgc3BlYy5pbnZlcnRZID0gZmFsc2U7IC8vIG5vIG5lZWQgdG8gaW52ZXJ0LXlcclxuICAgICAgICBzcGVjLnByZU11bHRpcGx5QWxwaGEgPSBmYWxzZTsgLy8gbm8gYWxwaGEgdG8gcHJlLW11bHRpcGx5XHJcbiAgICAgICAgc3BlYy5mb3JtYXQgPSBGT1JNQVRTWyBzcGVjLmZvcm1hdCBdID8gc3BlYy5mb3JtYXQgOiBERUZBVUxUX0ZPUk1BVDtcclxuICAgICAgICAvLyBjaGVjayBpZiBzdGVuY2lsLWRlcHRoLCBvciBqdXN0IGRlcHRoXHJcbiAgICAgICAgaWYgKCBzcGVjLmZvcm1hdCA9PT0gJ0RFUFRIX1NURU5DSUwnICkge1xyXG4gICAgICAgICAgICBzcGVjLnR5cGUgPSAnVU5TSUdORURfSU5UXzI0XzhfV0VCR0wnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNwZWMudHlwZSA9IERFUFRIX1RZUEVTWyBzcGVjLnR5cGUgXSA/IHNwZWMudHlwZSA6IERFRkFVTFRfVFlQRTtcclxuICAgICAgICB9XHJcbiAgICAgICAgVGV4dHVyZTJELmNhbGwoIHRoaXMsIHNwZWMgKTtcclxuICAgIH1cclxuXHJcbiAgICBEZXB0aFRleHR1cmUyRC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUZXh0dXJlMkQucHJvdG90eXBlICk7XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBEZXB0aFRleHR1cmUyRDtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBXZWJHTENvbnRleHQgPSByZXF1aXJlKCcuL1dlYkdMQ29udGV4dCcpO1xyXG4gICAgdmFyIFdlYkdMQ29udGV4dFN0YXRlID0gcmVxdWlyZSgnLi9XZWJHTENvbnRleHRTdGF0ZScpO1xyXG4gICAgdmFyIFRZUEVTID0ge1xyXG4gICAgICAgIFVOU0lHTkVEX1NIT1JUOiB0cnVlLFxyXG4gICAgICAgIFVOU0lHTkVEX0lOVDogdHJ1ZVxyXG4gICAgfTtcclxuICAgIHZhciBNT0RFUyA9IHtcclxuICAgICAgICBQT0lOVFM6IHRydWUsXHJcbiAgICAgICAgTElORVM6IHRydWUsXHJcbiAgICAgICAgTElORV9TVFJJUDogdHJ1ZSxcclxuICAgICAgICBMSU5FX0xPT1A6IHRydWUsXHJcbiAgICAgICAgVFJJQU5HTEVTOiB0cnVlLFxyXG4gICAgICAgIFRSSUFOR0xFX1NUUklQOiB0cnVlLFxyXG4gICAgICAgIFRSSUFOR0xFX0ZBTjogdHJ1ZVxyXG4gICAgfTtcclxuICAgIHZhciBCWVRFU19QRVJfVFlQRSA9IHtcclxuICAgICAgICBVTlNJR05FRF9TSE9SVDogMixcclxuICAgICAgICBVTlNJR05FRF9JTlQ6IDRcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGVmYXVsdCBjb21wb25lbnQgdHlwZS5cclxuICAgICAqL1xyXG4gICAgdmFyIERFRkFVTFRfVFlQRSA9ICdVTlNJR05FRF9TSE9SVCc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGVmYXVsdCByZW5kZXIgbW9kZSAocHJpbWl0aXZlIHR5cGUpLlxyXG4gICAgICovXHJcbiAgICB2YXIgREVGQVVMVF9NT0RFID0gJ1RSSUFOR0xFUyc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGVmYXVsdCBieXRlIG9mZnNldCB0byByZW5kZXIgZnJvbS5cclxuICAgICAqL1xyXG4gICAgdmFyIERFRkFVTFRfQllURV9PRkZTRVQgPSAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlZmF1bHQgY291bnQgb2YgaW5kaWNlcyB0byByZW5kZXIuXHJcbiAgICAgKi9cclxuICAgIHZhciBERUZBVUxUX0NPVU5UID0gMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc3RhbnRpYXRlcyBhbiBJbmRleEJ1ZmZlciBvYmplY3QuXHJcbiAgICAgKiBAY2xhc3MgSW5kZXhCdWZmZXJcclxuICAgICAqIEBjbGFzc2Rlc2MgQW4gaW5kZXggYnVmZmVyIG9iamVjdC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1VpbnQxNkFycmF5fFVpbjMyQXJyYXl8QXJyYXl9IGFyZyAtIFRoZSBpbmRleCBkYXRhIHRvIGJ1ZmZlci5cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gVGhlIHJlbmRlcmluZyBvcHRpb25zLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMubW9kZSAtIFRoZSBkcmF3IG1vZGUgLyBwcmltaXRpdmUgdHlwZS5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLmJ5dGVPZmZzZXQgLSBUaGUgYnl0ZSBvZmZzZXQgaW50byB0aGUgZHJhd24gYnVmZmVyLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMuY291bnQgLSBUaGUgbnVtYmVyIG9mIHZlcnRpY2VzIHRvIGRyYXcuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIEluZGV4QnVmZmVyKCBhcmcsIG9wdGlvbnMgKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcbiAgICAgICAgdmFyIGdsID0gdGhpcy5nbCA9IFdlYkdMQ29udGV4dC5nZXQoKTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gV2ViR0xDb250ZXh0U3RhdGUuZ2V0KCBnbCApO1xyXG4gICAgICAgIHRoaXMuYnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gVFlQRVNbIG9wdGlvbnMudHlwZSBdID8gb3B0aW9ucy50eXBlIDogREVGQVVMVF9UWVBFO1xyXG4gICAgICAgIC8vIGNoZWNrIGlmIHR5cGUgaXMgc3VwcG9ydGVkXHJcbiAgICAgICAgaWYgKCB0aGlzLnR5cGUgPT09ICdVTlNJR05FRF9JTlQnICYmICFXZWJHTENvbnRleHQuY2hlY2tFeHRlbnNpb24oICdPRVNfZWxlbWVudF9pbmRleF91aW50JyApICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnQ2Fubm90IGNyZWF0ZSBJbmRleEJ1ZmZlciBvZiB0eXBlIGBVTlNJR05FRF9JTlRgIGFzIGV4dGVuc2lvbiBgT0VTX2VsZW1lbnRfaW5kZXhfdWludGAgaXMgbm90IHN1cHBvcnRlZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubW9kZSA9IE1PREVTWyBvcHRpb25zLm1vZGUgXSA/IG9wdGlvbnMubW9kZSA6IERFRkFVTFRfTU9ERTtcclxuICAgICAgICB0aGlzLmNvdW50ID0gKCBvcHRpb25zLmNvdW50ICE9PSB1bmRlZmluZWQgKSA/IG9wdGlvbnMuY291bnQgOiBERUZBVUxUX0NPVU5UO1xyXG4gICAgICAgIHRoaXMuYnl0ZU9mZnNldCA9ICggb3B0aW9ucy5ieXRlT2Zmc2V0ICE9PSB1bmRlZmluZWQgKSA/IG9wdGlvbnMuYnl0ZU9mZnNldCA6IERFRkFVTFRfQllURV9PRkZTRVQ7XHJcbiAgICAgICAgdGhpcy5ieXRlTGVuZ3RoID0gMDtcclxuICAgICAgICBpZiAoIGFyZyApIHtcclxuICAgICAgICAgICAgaWYgKCBhcmcgaW5zdGFuY2VvZiBXZWJHTEJ1ZmZlciApIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlYkdMQnVmZmVyIGFyZ3VtZW50XHJcbiAgICAgICAgICAgICAgICBpZiAoIG9wdGlvbnMuYnl0ZUxlbmd0aCA9PT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdBcmd1bWVudCBvZiB0eXBlIGBXZWJHTEJ1ZmZlcmAgbXVzdCBiZSBjb21wbGltZW50ZWQgd2l0aCBhIGNvcnJlc3BvbmRpbmcgYG9wdGlvbnMuYnl0ZUxlbmd0aGAnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5ieXRlTGVuZ3RoID0gb3B0aW9ucy5ieXRlTGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXIgPSBhcmc7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZiBhcmcgPT09ICdudW1iZXInICkge1xyXG4gICAgICAgICAgICAgICAgLy8gYnl0ZSBsZW5ndGggYXJndW1lbnRcclxuICAgICAgICAgICAgICAgIGlmICggb3B0aW9ucy50eXBlID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ0FyZ3VtZW50IG9mIHR5cGUgYG51bWJlcmAgbXVzdCBiZSBjb21wbGltZW50ZWQgd2l0aCBhIGNvcnJlc3BvbmRpbmcgYG9wdGlvbnMudHlwZWAnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJEYXRhKCBhcmcgKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICggYXJnIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBBcnJheUJ1ZmZlciBhcmdcclxuICAgICAgICAgICAgICAgIGlmICggb3B0aW9ucy50eXBlID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ0FyZ3VtZW50IG9mIHR5cGUgYEFycmF5QnVmZmVyYCBtdXN0IGJlIGNvbXBsaW1lbnRlZCB3aXRoIGEgY29ycmVzcG9uZGluZyBgb3B0aW9ucy50eXBlYCc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlckRhdGEoIGFyZyApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gQXJyYXkgb3IgQXJyYXlCdWZmZXJWaWV3IGFyZ3VtZW50XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlckRhdGEoIGFyZyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCBvcHRpb25zLnR5cGUgPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgICAgICAgIHRocm93ICdFbXB0eSBidWZmZXIgbXVzdCBiZSBjb21wbGltZW50ZWQgd2l0aCBhIGNvcnJlc3BvbmRpbmcgYG9wdGlvbnMudHlwZWAnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGVuc3VyZSB0aGVyZSBpc24ndCBhbiBvdmVyZmxvd1xyXG4gICAgICAgIGlmICggdGhpcy5jb3VudCAqIEJZVEVTX1BFUl9UWVBFWyB0aGlzLnR5cGUgXSArIHRoaXMuYnl0ZU9mZnNldCA+IHRoaXMuYnl0ZUxlbmd0aCApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ0luZGV4QnVmZmVyIGBjb3VudGAgb2YgJyArIHRoaXMuY291bnQgKyAnIGFuZCBgYnl0ZU9mZnNldGAgb2YgJyArIHRoaXMuYnl0ZU9mZnNldCArICcgb3ZlcmZsb3dzIHRoZSBsZW5ndGggb2YgdGhlIGJ1ZmZlciAoJyArIHRoaXMuYnl0ZUxlbmd0aCArICcpJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGxvYWQgaW5kZXggZGF0YSB0byB0aGUgR1BVLlxyXG4gICAgICogQG1lbWJlcm9mIEluZGV4QnVmZmVyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtBcnJheXxBcnJheUJ1ZmZlcnxBcnJheUJ1ZmZlclZpZXd8bnVtYmVyfSBhcmcgLSBUaGUgYXJyYXkgb2YgZGF0YSB0byBidWZmZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge0luZGV4QnVmZmVyfSBUaGUgaW5kZXggYnVmZmVyIG9iamVjdCBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIEluZGV4QnVmZmVyLnByb3RvdHlwZS5idWZmZXJEYXRhID0gZnVuY3Rpb24oIGFyZyApIHtcclxuICAgICAgICB2YXIgZ2wgPSB0aGlzLmdsO1xyXG4gICAgICAgIC8vIGNhc3QgYXJyYXkgdG8gQXJyYXlCdWZmZXJWaWV3IGJhc2VkIG9uIHByb3ZpZGVkIHR5cGVcclxuICAgICAgICBpZiAoIGFyZyBpbnN0YW5jZW9mIEFycmF5ICkge1xyXG4gICAgICAgICAgICAvLyBjaGVjayBmb3IgdHlwZSBzdXBwb3J0XHJcbiAgICAgICAgICAgIGlmICggdGhpcy50eXBlID09PSAnVU5TSUdORURfSU5UJyApIHtcclxuICAgICAgICAgICAgICAgIC8vIHVpbnQzMiBpcyBzdXBwb3J0ZWRcclxuICAgICAgICAgICAgICAgIGFyZyA9IG5ldyBVaW50MzJBcnJheSggYXJnICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBidWZmZXIgdG8gdWludDE2XHJcbiAgICAgICAgICAgICAgICBhcmcgPSBuZXcgVWludDE2QXJyYXkoIGFyZyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNldCBlbnN1cmUgdHlwZSBjb3JyZXNwb25kcyB0byBkYXRhXHJcbiAgICAgICAgaWYgKCBhcmcgaW5zdGFuY2VvZiBVaW50MTZBcnJheSApIHtcclxuICAgICAgICAgICAgdGhpcy50eXBlID0gJ1VOU0lHTkVEX1NIT1JUJztcclxuICAgICAgICB9IGVsc2UgaWYgKCBhcmcgaW5zdGFuY2VvZiBVaW50MzJBcnJheSApIHtcclxuICAgICAgICAgICAgdGhpcy50eXBlID0gJ1VOU0lHTkVEX0lOVCc7XHJcbiAgICAgICAgfSBlbHNlIGlmICggISggYXJnIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgKSAmJiB0eXBlb2YgYXJnICE9PSAnbnVtYmVyJyApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ0FyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBgQXJyYXlgLCBgQXJyYXlCdWZmZXJgLCBgQXJyYXlCdWZmZXJWaWV3YCwgb3IgYG51bWJlcmAnO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBkb24ndCBvdmVyd3JpdGUgdGhlIGNvdW50IGlmIGl0IGlzIGFscmVhZHkgc2V0XHJcbiAgICAgICAgaWYgKCB0aGlzLmNvdW50ID09PSBERUZBVUxUX0NPVU5UICkge1xyXG4gICAgICAgICAgICBpZiAoIHR5cGVvZiBhcmcgPT09ICdudW1iZXInICkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb3VudCA9ICggYXJnIC8gQllURVNfUEVSX1RZUEVbIHRoaXMudHlwZSBdICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvdW50ID0gYXJnLmxlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzZXQgYnl0ZSBsZW5ndGhcclxuICAgICAgICBpZiAoIHR5cGVvZiBhcmcgPT09ICdudW1iZXInICkge1xyXG4gICAgICAgICAgICBpZiAoIGFyZyAlIEJZVEVTX1BFUl9UWVBFWyB0aGlzLnR5cGUgXSApIHtcclxuICAgICAgICAgICAgICAgIHRocm93ICdCeXRlIGxlbmd0aCBtdXN0IGJlIG11bHRpcGxlIG9mICcgKyBCWVRFU19QRVJfVFlQRVsgdGhpcy50eXBlIF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5ieXRlTGVuZ3RoID0gYXJnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnl0ZUxlbmd0aCA9IGFyZy5sZW5ndGggKiBCWVRFU19QRVJfVFlQRVsgdGhpcy50eXBlIF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGJ1ZmZlciB0aGUgZGF0YVxyXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoIGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlciApO1xyXG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoIGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBhcmcsIGdsLlNUQVRJQ19EUkFXICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBsb2FkIHBhcnRpYWwgaW5kZXggZGF0YSB0byB0aGUgR1BVLlxyXG4gICAgICogQG1lbWJlcm9mIEluZGV4QnVmZmVyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtBcnJheXxBcnJheUJ1ZmZlcnxBcnJheUJ1ZmZlclZpZXd9IGFycmF5IC0gVGhlIGFycmF5IG9mIGRhdGEgdG8gYnVmZmVyLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGJ5dGVPZmZzZXQgLSBUaGUgYnl0ZSBvZmZzZXQgYXQgd2hpY2ggdG8gYnVmZmVyLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtJbmRleEJ1ZmZlcn0gVGhlIHZlcnRleCBidWZmZXIgb2JqZWN0IGZvciBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgSW5kZXhCdWZmZXIucHJvdG90eXBlLmJ1ZmZlclN1YkRhdGEgPSBmdW5jdGlvbiggYXJyYXksIGJ5dGVPZmZzZXQgKSB7XHJcbiAgICAgICAgdmFyIGdsID0gdGhpcy5nbDtcclxuICAgICAgICBpZiAoIHRoaXMuYnl0ZUxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ0J1ZmZlciBoYXMgbm90IGJlZW4gYWxsb2NhdGVkJztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2FzdCBhcnJheSB0byBBcnJheUJ1ZmZlclZpZXcgYmFzZWQgb24gcHJvdmlkZWQgdHlwZVxyXG4gICAgICAgIGlmICggYXJyYXkgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIHR5cGUgc3VwcG9ydFxyXG4gICAgICAgICAgICBpZiAoIHRoaXMudHlwZSA9PT0gJ1VOU0lHTkVEX0lOVCcgKSB7XHJcbiAgICAgICAgICAgICAgICAvLyB1aW50MzIgaXMgc3VwcG9ydGVkXHJcbiAgICAgICAgICAgICAgICBhcnJheSA9IG5ldyBVaW50MzJBcnJheSggYXJyYXkgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIGJ1ZmZlciB0byB1aW50MTZcclxuICAgICAgICAgICAgICAgIGFycmF5ID0gbmV3IFVpbnQxNkFycmF5KCBhcnJheSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAgICAgISggYXJyYXkgaW5zdGFuY2VvZiBVaW50MTZBcnJheSApICYmXHJcbiAgICAgICAgICAgICEoIGFycmF5IGluc3RhbmNlb2YgVWludDMyQXJyYXkgKSAmJlxyXG4gICAgICAgICAgICAhKCBhcnJheSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyICkgKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdBcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgYEFycmF5YCwgYEFycmF5QnVmZmVyYCwgb3IgYEFycmF5QnVmZmVyVmlld2AnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBieXRlT2Zmc2V0ID0gKCBieXRlT2Zmc2V0ICE9PSB1bmRlZmluZWQgKSA/IGJ5dGVPZmZzZXQgOiBERUZBVUxUX0JZVEVfT0ZGU0VUO1xyXG4gICAgICAgIC8vIGdldCB0aGUgdG90YWwgbnVtYmVyIG9mIGF0dHJpYnV0ZSBjb21wb25lbnRzIGZyb20gcG9pbnRlcnNcclxuICAgICAgICB2YXIgYnl0ZUxlbmd0aCA9IGFycmF5Lmxlbmd0aCAqIEJZVEVTX1BFUl9UWVBFWyB0aGlzLnR5cGUgXTtcclxuICAgICAgICBpZiAoIGJ5dGVPZmZzZXQgKyBieXRlTGVuZ3RoID4gdGhpcy5ieXRlTGVuZ3RoICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnQXJndW1lbnQgb2YgbGVuZ3RoICcgKyBieXRlTGVuZ3RoICsgJyBieXRlcyBhbmQgYnl0ZSBvZmZzZXQgb2YgJyArIGJ5dGVPZmZzZXQgKyAnIGJ5dGVzIG92ZXJmbG93cyB0aGUgYnVmZmVyIGxlbmd0aCBvZiAnICsgdGhpcy5ieXRlTGVuZ3RoICsgJyBieXRlcyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoIGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlciApO1xyXG4gICAgICAgIGdsLmJ1ZmZlclN1YkRhdGEoIGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBieXRlT2Zmc2V0LCBhcnJheSApO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEV4ZWN1dGUgdGhlIGRyYXcgY29tbWFuZCBmb3IgdGhlIGJvdW5kIGJ1ZmZlci5cclxuICAgICAqIEBtZW1iZXJvZiBJbmRleEJ1ZmZlclxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gVGhlIG9wdGlvbnMgdG8gcGFzcyB0byAnZHJhd0VsZW1lbnRzJy4gT3B0aW9uYWwuXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5tb2RlIC0gVGhlIGRyYXcgbW9kZSAvIHByaW1pdGl2ZSB0eXBlLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMuYnl0ZU9mZnNldCAtIFRoZSBieXRlT2Zmc2V0IGludG8gdGhlIGRyYXduIGJ1ZmZlci5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLmNvdW50IC0gVGhlIG51bWJlciBvZiB2ZXJ0aWNlcyB0byBkcmF3LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtJbmRleEJ1ZmZlcn0gUmV0dXJucyB0aGUgaW5kZXggYnVmZmVyIG9iamVjdCBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIEluZGV4QnVmZmVyLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oIG9wdGlvbnMgKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcbiAgICAgICAgdmFyIGdsID0gdGhpcy5nbDtcclxuICAgICAgICB2YXIgbW9kZSA9IGdsWyBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIF07XHJcbiAgICAgICAgdmFyIHR5cGUgPSBnbFsgdGhpcy50eXBlIF07XHJcbiAgICAgICAgdmFyIGJ5dGVPZmZzZXQgPSAoIG9wdGlvbnMuYnl0ZU9mZnNldCAhPT0gdW5kZWZpbmVkICkgPyBvcHRpb25zLmJ5dGVPZmZzZXQgOiB0aGlzLmJ5dGVPZmZzZXQ7XHJcbiAgICAgICAgdmFyIGNvdW50ID0gKCBvcHRpb25zLmNvdW50ICE9PSB1bmRlZmluZWQgKSA/IG9wdGlvbnMuY291bnQgOiB0aGlzLmNvdW50O1xyXG4gICAgICAgIGlmICggY291bnQgPT09IDAgKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdBdHRlbXB0aW5nIHRvIGRyYXcgd2l0aCBhIGNvdW50IG9mIDAnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGJ5dGVPZmZzZXQgKyBjb3VudCAqIEJZVEVTX1BFUl9UWVBFWyB0aGlzLnR5cGUgXSA+IHRoaXMuYnl0ZUxlbmd0aCApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ0F0dGVtcHRpbmcgdG8gZHJhdyB3aXRoIGBjb3VudGAgb2YgJyArIGNvdW50ICsgJyBhbmQgYGJ5dGVPZmZzZXRgIG9mICcgKyBieXRlT2Zmc2V0ICsgJyB3aGljaCBvdmVyZmxvd3MgdGhlIHRvdGFsIGJ5dGUgbGVuZ3RoIG9mIHRoZSBidWZmZXIgKCcgKyB0aGlzLmJ5dGVMZW5ndGggKyAnKSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGlmIHRoaXMgYnVmZmVyIGlzIGFscmVhZHkgYm91bmQsIGV4aXQgZWFybHlcclxuICAgICAgICBpZiAoIHRoaXMuc3RhdGUuYm91bmRJbmRleEJ1ZmZlciAhPT0gdGhpcy5idWZmZXIgKSB7XHJcbiAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIoIGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlciApO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmJvdW5kSW5kZXhCdWZmZXIgPSB0aGlzLmJ1ZmZlcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZHJhdyBlbGVtZW50c1xyXG4gICAgICAgIGdsLmRyYXdFbGVtZW50cyggbW9kZSwgY291bnQsIHR5cGUsIGJ5dGVPZmZzZXQgKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBJbmRleEJ1ZmZlcjtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBXZWJHTENvbnRleHQgPSByZXF1aXJlKCcuL1dlYkdMQ29udGV4dCcpO1xyXG4gICAgdmFyIFdlYkdMQ29udGV4dFN0YXRlID0gcmVxdWlyZSgnLi9XZWJHTENvbnRleHRTdGF0ZScpO1xyXG4gICAgdmFyIFV0aWwgPSByZXF1aXJlKCcuLi91dGlsL1V0aWwnKTtcclxuXHJcbiAgICB2YXIgVEVYVFVSRV9UQVJHRVRTID0ge1xyXG4gICAgICAgIFRFWFRVUkVfMkQ6IHRydWUsXHJcbiAgICAgICAgVEVYVFVSRV9DVUJFX01BUDogdHJ1ZVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgREVQVEhfRk9STUFUUyA9IHtcclxuICAgICAgICBERVBUSF9DT01QT05FTlQ6IHRydWUsXHJcbiAgICAgICAgREVQVEhfU1RFTkNJTDogdHJ1ZVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc3RhbnRpYXRlcyBhIFJlbmRlclRhcmdldCBvYmplY3QuXHJcbiAgICAgKiBAY2xhc3MgUmVuZGVyVGFyZ2V0XHJcbiAgICAgKiBAY2xhc3NkZXNjIEEgcmVuZGVyVGFyZ2V0IGNsYXNzIHRvIGFsbG93IHJlbmRlcmluZyB0byB0ZXh0dXJlcy5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gUmVuZGVyVGFyZ2V0KCkge1xyXG4gICAgICAgIHZhciBnbCA9IHRoaXMuZ2wgPSBXZWJHTENvbnRleHQuZ2V0KCk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFdlYkdMQ29udGV4dFN0YXRlLmdldCggZ2wgKTtcclxuICAgICAgICB0aGlzLmZyYW1lYnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcclxuICAgICAgICB0aGlzLnRleHR1cmVzID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCaW5kcyB0aGUgcmVuZGVyVGFyZ2V0IG9iamVjdCBhbmQgcHVzaGVzIGl0IHRvIHRoZSBmcm9udCBvZiB0aGUgc3RhY2suXHJcbiAgICAgKiBAbWVtYmVyb2YgUmVuZGVyVGFyZ2V0XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1JlbmRlclRhcmdldH0gVGhlIHJlbmRlclRhcmdldCBvYmplY3QsIGZvciBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgUmVuZGVyVGFyZ2V0LnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCB0aGlzLnN0YXRlLnJlbmRlclRhcmdldHMudG9wKCkgIT09IHRoaXMgKSB7XHJcbiAgICAgICAgICAgIHZhciBnbCA9IHRoaXMuZ2w7XHJcbiAgICAgICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlciggZ2wuRlJBTUVCVUZGRVIsIHRoaXMuZnJhbWVidWZmZXIgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zdGF0ZS5yZW5kZXJUYXJnZXRzLnB1c2goIHRoaXMgKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbmJpbmRzIHRoZSByZW5kZXJUYXJnZXQgb2JqZWN0IGFuZCBiaW5kcyB0aGUgcmVuZGVyVGFyZ2V0IGJlbmVhdGggaXQgb24gdGhpcyBzdGFjay4gSWYgdGhlcmUgaXMgbm8gdW5kZXJseWluZyByZW5kZXJUYXJnZXQsIGJpbmQgdGhlIGJhY2tidWZmZXIuXHJcbiAgICAgKiBAbWVtYmVyb2YgUmVuZGVyVGFyZ2V0XHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1JlbmRlclRhcmdldH0gVGhlIHJlbmRlclRhcmdldCBvYmplY3QsIGZvciBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgUmVuZGVyVGFyZ2V0LnByb3RvdHlwZS5wb3AgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIHJlbmRlciB0YXJnZXQgYm91bmQsIGV4aXQgZWFybHlcclxuICAgICAgICBpZiAoIHN0YXRlLnJlbmRlclRhcmdldHMudG9wKCkgIT09IHRoaXMgKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdUaGUgY3VycmVudCByZW5kZXIgdGFyZ2V0IGlzIG5vdCB0aGUgdG9wIG1vc3QgZWxlbWVudCBvbiB0aGUgc3RhY2snO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdGF0ZS5yZW5kZXJUYXJnZXRzLnBvcCgpO1xyXG4gICAgICAgIHZhciB0b3AgPSBzdGF0ZS5yZW5kZXJUYXJnZXRzLnRvcCgpO1xyXG4gICAgICAgIHZhciBnbDtcclxuICAgICAgICBpZiAoIHRvcCApIHtcclxuICAgICAgICAgICAgZ2wgPSB0b3AuZ2w7XHJcbiAgICAgICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlciggZ2wuRlJBTUVCVUZGRVIsIHRvcC5mcmFtZWJ1ZmZlciApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdsID0gdGhpcy5nbDtcclxuICAgICAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKCBnbC5GUkFNRUJVRkZFUiwgbnVsbCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyB0aGUgcHJvdmlkZWQgdGV4dHVyZSB0byB0aGUgcHJvdmlkZWQgYXR0YWNobWVudCBsb2NhdGlvbi5cclxuICAgICAqIEBtZW1iZXJvZiBSZW5kZXJUYXJnZXRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1RleHR1cmUyRH0gdGV4dHVyZSAtIFRoZSB0ZXh0dXJlIHRvIGF0dGFjaC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIFRoZSBhdHRhY2htZW50IGluZGV4LiAob3B0aW9uYWwpXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGFyZ2V0IC0gVGhlIHRleHR1cmUgdGFyZ2V0IHR5cGUuIChvcHRpb25hbClcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UmVuZGVyVGFyZ2V0fSBUaGUgcmVuZGVyVGFyZ2V0IG9iamVjdCwgZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBSZW5kZXJUYXJnZXQucHJvdG90eXBlLnNldENvbG9yVGFyZ2V0ID0gZnVuY3Rpb24oIHRleHR1cmUsIGluZGV4LCB0YXJnZXQgKSB7XHJcbiAgICAgICAgdmFyIGdsID0gdGhpcy5nbDtcclxuICAgICAgICBpZiAoICF0ZXh0dXJlICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnVGV4dHVyZSBhcmd1bWVudCBpcyBtaXNzaW5nJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBURVhUVVJFX1RBUkdFVFNbIGluZGV4IF0gJiYgdGFyZ2V0ID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgIHRhcmdldCA9IGluZGV4O1xyXG4gICAgICAgICAgICBpbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggaW5kZXggPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgICAgaW5kZXggPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoICFVdGlsLmlzSW50ZWdlciggaW5kZXggKSB8fCBpbmRleCA8IDAgKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdUZXh0dXJlIGNvbG9yIGF0dGFjaG1lbnQgaW5kZXggaXMgaW52YWxpZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggdGFyZ2V0ICYmICFURVhUVVJFX1RBUkdFVFNbIHRhcmdldCBdICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnVGV4dHVyZSB0YXJnZXQgaXMgaW52YWxpZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudGV4dHVyZXNbICdjb2xvcicgKyBpbmRleCBdID0gdGV4dHVyZTtcclxuICAgICAgICB0aGlzLnB1c2goKTtcclxuICAgICAgICBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRChcclxuICAgICAgICAgICAgZ2wuRlJBTUVCVUZGRVIsXHJcbiAgICAgICAgICAgIGdsWyAnQ09MT1JfQVRUQUNITUVOVCcgKyBpbmRleCBdLFxyXG4gICAgICAgICAgICBnbFsgdGFyZ2V0IHx8ICdURVhUVVJFXzJEJyBdLFxyXG4gICAgICAgICAgICB0ZXh0dXJlLnRleHR1cmUsXHJcbiAgICAgICAgICAgIDAgKTtcclxuICAgICAgICB0aGlzLnBvcCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaGVzIHRoZSBwcm92aWRlZCB0ZXh0dXJlIHRvIHRoZSBwcm92aWRlZCBhdHRhY2htZW50IGxvY2F0aW9uLlxyXG4gICAgICogQG1lbWJlcm9mIFJlbmRlclRhcmdldFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VGV4dHVyZTJEfSB0ZXh0dXJlIC0gVGhlIHRleHR1cmUgdG8gYXR0YWNoLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtSZW5kZXJUYXJnZXR9IFRoZSByZW5kZXJUYXJnZXQgb2JqZWN0LCBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFJlbmRlclRhcmdldC5wcm90b3R5cGUuc2V0RGVwdGhUYXJnZXQgPSBmdW5jdGlvbiggdGV4dHVyZSApIHtcclxuICAgICAgICBpZiAoICF0ZXh0dXJlICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnVGV4dHVyZSBhcmd1bWVudCBpcyBtaXNzaW5nJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCAhREVQVEhfRk9STUFUU1sgdGV4dHVyZS5mb3JtYXQgXSApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ1Byb3ZpZGVkIHRleHR1cmUgaXMgbm90IG9mIGZvcm1hdCBgREVQVEhfQ09NUE9ORU5UYCBvciBgREVQVEhfU1RFTkNJTGAnO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZ2wgPSB0aGlzLmdsO1xyXG4gICAgICAgIHRoaXMudGV4dHVyZXMuZGVwdGggPSB0ZXh0dXJlO1xyXG4gICAgICAgIHRoaXMucHVzaCgpO1xyXG4gICAgICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKFxyXG4gICAgICAgICAgICBnbC5GUkFNRUJVRkZFUixcclxuICAgICAgICAgICAgZ2wuREVQVEhfQVRUQUNITUVOVCxcclxuICAgICAgICAgICAgZ2wuVEVYVFVSRV8yRCxcclxuICAgICAgICAgICAgdGV4dHVyZS50ZXh0dXJlLFxyXG4gICAgICAgICAgICAwICk7XHJcbiAgICAgICAgdGhpcy5wb3AoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXNpemVzIHRoZSByZW5kZXJUYXJnZXQgYW5kIGFsbCBhdHRhY2hlZCB0ZXh0dXJlcyBieSB0aGUgcHJvdmlkZWQgaGVpZ2h0IGFuZCB3aWR0aC5cclxuICAgICAqIEBtZW1iZXJvZiBSZW5kZXJUYXJnZXRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBUaGUgbmV3IHdpZHRoIG9mIHRoZSByZW5kZXJUYXJnZXQuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gVGhlIG5ldyBoZWlnaHQgb2YgdGhlIHJlbmRlclRhcmdldC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UmVuZGVyVGFyZ2V0fSBUaGUgcmVuZGVyVGFyZ2V0IG9iamVjdCwgZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBSZW5kZXJUYXJnZXQucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKCB3aWR0aCwgaGVpZ2h0ICkge1xyXG4gICAgICAgIGlmICggdHlwZW9mIHdpZHRoICE9PSAnbnVtYmVyJyB8fCAoIHdpZHRoIDw9IDAgKSApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ1Byb3ZpZGVkIGB3aWR0aGAgb2YgJyArIHdpZHRoICsgJyBpcyBpbnZhbGlkJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCB0eXBlb2YgaGVpZ2h0ICE9PSAnbnVtYmVyJyB8fCAoIGhlaWdodCA8PSAwICkgKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdQcm92aWRlZCBgaGVpZ2h0YCBvZiAnICsgaGVpZ2h0ICsgJyBpcyBpbnZhbGlkJztcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRleHR1cmVzID0gdGhpcy50ZXh0dXJlcztcclxuICAgICAgICBPYmplY3Qua2V5cyggdGV4dHVyZXMgKS5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xyXG4gICAgICAgICAgICB0ZXh0dXJlc1sga2V5IF0ucmVzaXplKCB3aWR0aCwgaGVpZ2h0ICk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gUmVuZGVyVGFyZ2V0O1xyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIFZlcnRleFBhY2thZ2UgPSByZXF1aXJlKCcuLi9jb3JlL1ZlcnRleFBhY2thZ2UnKTtcclxuICAgIHZhciBWZXJ0ZXhCdWZmZXIgPSByZXF1aXJlKCcuLi9jb3JlL1ZlcnRleEJ1ZmZlcicpO1xyXG4gICAgdmFyIEluZGV4QnVmZmVyID0gcmVxdWlyZSgnLi4vY29yZS9JbmRleEJ1ZmZlcicpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSXRlcmF0ZXMgb3ZlciBhbGwgYXR0cmlidXRlIHBvaW50ZXJzIGFuZCB0aHJvd3MgYW4gZXhjZXB0aW9uIGlmIGFuIGluZGV4XHJcbiAgICAgKiBvY2N1cnMgbXJvZSB0aGFuIG9uY2UuXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHZlcnRleEJ1ZmZlcnMgLSBUaGUgYXJyYXkgb2YgdmVydGV4QnVmZmVycy5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY2hlY2tJbmRleENvbGxpc2lvbnMoIHZlcnRleEJ1ZmZlcnMgKSB7XHJcbiAgICAgICAgdmFyIGluZGljZXMgPSB7fTtcclxuICAgICAgICB2ZXJ0ZXhCdWZmZXJzLmZvckVhY2goIGZ1bmN0aW9uKCBidWZmZXIgKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKCBidWZmZXIucG9pbnRlcnMgKS5mb3JFYWNoKCBmdW5jdGlvbiggaW5kZXggKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRpY2VzWyBpbmRleCBdID0gaW5kaWNlc1sgaW5kZXggXSB8fCAwO1xyXG4gICAgICAgICAgICAgICAgaW5kaWNlc1sgaW5kZXggXSsrO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBPYmplY3Qua2V5cyggaW5kaWNlcyApLmZvckVhY2goIGZ1bmN0aW9uKCBpbmRleCApIHtcclxuICAgICAgICAgICAgaWYgKCBpbmRpY2VzWyBpbmRleCBdID4gMSApIHtcclxuICAgICAgICAgICAgICAgIHRocm93ICdNb3JlIHRoYW4gb25lIGF0dHJpYnV0ZSBwb2ludGVyIGV4aXN0cyBmb3IgaW5kZXggJyArIGluZGV4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW50aWF0ZXMgYW4gUmVuZGVyYWJsZSBvYmplY3QuXHJcbiAgICAgKiBAY2xhc3MgUmVuZGVyYWJsZVxyXG4gICAgICogQGNsYXNzZGVzYyBBIGNvbnRhaW5lciBmb3Igb25lIG9yIG1vcmUgVmVydGV4QnVmZmVycyBhbmQgYW4gb3B0aW9uYWwgSW5kZXhCdWZmZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNwZWMgLSBUaGUgcmVuZGVyYWJsZSBzcGVjaWZpY2F0aW9uIG9iamVjdC5cclxuICAgICAqIEBwYXJhbSB7QXJyYXl8RmxvYXQzMkFycmF5fSBzcGVjLnZlcnRpY2VzIC0gVGhlIHZlcnRpY2VzIHRvIGludGVybGVhdmUgYW5kIGJ1ZmZlci5cclxuICAgICAqIEBwYXJhbSB7VmVydGV4QnVmZmVyfSBzcGVjLnZlcnRleEJ1ZmZlciAtIEFuIGV4aXN0aW5nIHZlcnRleCBidWZmZXIgdG8gdXNlLlxyXG4gICAgICogQHBhcmFtIHtWZXJ0ZXhCdWZmZXJbXX0gc3BlYy52ZXJ0ZXhCdWZmZXJzIC0gTXVsdGlwbGUgdmVydGV4IGJ1ZmZlcnMgdG8gdXNlLlxyXG4gICAgICogQHBhcmFtIHtBcnJheXxVaW50MTZBcnJheXxVaW50MzJBcnJheX0gc3BlYy5pbmRpY2VzIC0gVGhlIGluZGljZXMgdG8gYnVmZmVyLlxyXG4gICAgICogQHBhcmFtIHtJbmRleEJ1ZmZlcn0gc3BlYy5pbmRleGJ1ZmZlciAtIEFuIGV4aXN0aW5nIGluZGV4IGJ1ZmZlciB0byB1c2UuXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3BlYy5tb2RlIC0gVGhlIGRyYXcgbW9kZSAvIHByaW1pdGl2ZSB0eXBlLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNwZWMuYnl0ZU9mZnNldCAtIFRoZSBieXRlIG9mZnNldCBpbnRvIHRoZSBkcmF3biBidWZmZXIuXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3BlYy5jb3VudCAtIFRoZSBudW1iZXIgb2YgdmVydGljZXMgdG8gZHJhdy5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gUmVuZGVyYWJsZSggc3BlYyApIHtcclxuICAgICAgICBzcGVjID0gc3BlYyB8fCB7fTtcclxuICAgICAgICBpZiAoIHNwZWMudmVydGV4QnVmZmVyIHx8IHNwZWMudmVydGV4QnVmZmVycyApIHtcclxuICAgICAgICAgICAgLy8gdXNlIGV4aXN0aW5nIHZlcnRleCBidWZmZXJcclxuICAgICAgICAgICAgdGhpcy52ZXJ0ZXhCdWZmZXJzID0gc3BlYy52ZXJ0ZXhCdWZmZXJzIHx8IFsgc3BlYy52ZXJ0ZXhCdWZmZXIgXTtcclxuICAgICAgICB9IGVsc2UgaWYgKCBzcGVjLnZlcnRpY2VzICkge1xyXG4gICAgICAgICAgICAvLyBjcmVhdGUgdmVydGV4IHBhY2thZ2VcclxuICAgICAgICAgICAgdmFyIHZlcnRleFBhY2thZ2UgPSBuZXcgVmVydGV4UGFja2FnZSggc3BlYy52ZXJ0aWNlcyApO1xyXG4gICAgICAgICAgICAvLyBjcmVhdGUgdmVydGV4IGJ1ZmZlclxyXG4gICAgICAgICAgICB0aGlzLnZlcnRleEJ1ZmZlcnMgPSBbIG5ldyBWZXJ0ZXhCdWZmZXIoIHZlcnRleFBhY2thZ2UgKSBdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudmVydGV4QnVmZmVycyA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHNwZWMuaW5kZXhCdWZmZXIgKSB7XHJcbiAgICAgICAgICAgIC8vIHVzZSBleGlzdGluZyBpbmRleCBidWZmZXJcclxuICAgICAgICAgICAgdGhpcy5pbmRleEJ1ZmZlciA9IHNwZWMuaW5kZXhCdWZmZXI7XHJcbiAgICAgICAgfSBlbHNlIGlmICggc3BlYy5pbmRpY2VzICkge1xyXG4gICAgICAgICAgICAvLyBjcmVhdGUgaW5kZXggYnVmZmVyXHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXhCdWZmZXIgPSBuZXcgSW5kZXhCdWZmZXIoIHNwZWMuaW5kaWNlcyApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXhCdWZmZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjaGVjayB0aGF0IG5vIGF0dHJpYnV0ZSBpbmRpY2VzIGNsYXNoXHJcbiAgICAgICAgY2hlY2tJbmRleENvbGxpc2lvbnMoIHRoaXMudmVydGV4QnVmZmVycyApO1xyXG4gICAgICAgIC8vIHN0b3JlIHJlbmRlcmluZyBvcHRpb25zXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0ge1xyXG4gICAgICAgICAgICBtb2RlOiBzcGVjLm1vZGUsXHJcbiAgICAgICAgICAgIGJ5dGVPZmZzZXQ6IHNwZWMuYnl0ZU9mZnNldCxcclxuICAgICAgICAgICAgY291bnQ6IHNwZWMuY291bnRcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRXhlY3V0ZSB0aGUgZHJhdyBjb21tYW5kIGZvciB0aGUgdW5kZXJseWluZyBidWZmZXJzLlxyXG4gICAgICogQG1lbWJlcm9mIFJlbmRlcmFibGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIFRoZSBvcHRpb25zIHRvIHBhc3MgdG8gJ2RyYXdFbGVtZW50cycuIE9wdGlvbmFsLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMubW9kZSAtIFRoZSBkcmF3IG1vZGUgLyBwcmltaXRpdmUgdHlwZS5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLmJ5dGVPZmZzZXQgLSBUaGUgYnl0ZU9mZnNldCBpbnRvIHRoZSBkcmF3biBidWZmZXIuXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5jb3VudCAtIFRoZSBudW1iZXIgb2YgdmVydGljZXMgdG8gZHJhdy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UmVuZGVyYWJsZX0gUmV0dXJucyB0aGUgcmVuZGVyYWJsZSBvYmplY3QgZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBSZW5kZXJhYmxlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oIG9wdGlvbnMgKSB7XHJcbiAgICAgICAgdmFyIG92ZXJyaWRlcyA9IG9wdGlvbnMgfHwge307XHJcbiAgICAgICAgLy8gb3ZlcnJpZGUgb3B0aW9ucyBpZiBwcm92aWRlZFxyXG4gICAgICAgIG92ZXJyaWRlcy5tb2RlID0gb3ZlcnJpZGVzLm1vZGUgfHwgdGhpcy5vcHRpb25zLm1vZGU7XHJcbiAgICAgICAgb3ZlcnJpZGVzLmJ5dGVPZmZzZXQgPSAoIG92ZXJyaWRlcy5ieXRlT2Zmc2V0ICE9PSB1bmRlZmluZWQgKSA/IG92ZXJyaWRlcy5ieXRlT2Zmc2V0IDogdGhpcy5vcHRpb25zLmJ5dGVPZmZzZXQ7XHJcbiAgICAgICAgb3ZlcnJpZGVzLmNvdW50ID0gKCBvdmVycmlkZXMuY291bnQgIT09IHVuZGVmaW5lZCApID8gb3ZlcnJpZGVzLmNvdW50IDogdGhpcy5vcHRpb25zLmNvdW50O1xyXG4gICAgICAgIC8vIGRyYXcgdGhlIHJlbmRlcmFibGVcclxuICAgICAgICBpZiAoIHRoaXMuaW5kZXhCdWZmZXIgKSB7XHJcbiAgICAgICAgICAgIC8vIHVzZSBpbmRleCBidWZmZXIgdG8gZHJhdyBlbGVtZW50c1xyXG4gICAgICAgICAgICAvLyBiaW5kIHZlcnRleCBidWZmZXJzIGFuZCBlbmFibGUgYXR0cmlidXRlIHBvaW50ZXJzXHJcbiAgICAgICAgICAgIHRoaXMudmVydGV4QnVmZmVycy5mb3JFYWNoKCBmdW5jdGlvbiggdmVydGV4QnVmZmVyICkge1xyXG4gICAgICAgICAgICAgICAgdmVydGV4QnVmZmVyLmJpbmQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIGRyYXcgcHJpbWl0aXZlcyB1c2luZyBpbmRleCBidWZmZXJcclxuICAgICAgICAgICAgdGhpcy5pbmRleEJ1ZmZlci5kcmF3KCBvdmVycmlkZXMgKTtcclxuICAgICAgICAgICAgLy8gZGlzYWJsZSBhdHRyaWJ1dGUgcG9pbnRlcnNcclxuICAgICAgICAgICAgdGhpcy52ZXJ0ZXhCdWZmZXJzLmZvckVhY2goIGZ1bmN0aW9uKCB2ZXJ0ZXhCdWZmZXIgKSB7XHJcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhCdWZmZXIudW5iaW5kKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBubyBhZHZhbnRhZ2UgdG8gdW5iaW5kaW5nIGFzIHRoZXJlIGlzIG5vIHN0YWNrIHVzZWRcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBubyBpbmRleCBidWZmZXIsIHVzZSBkcmF3IGFycmF5c1xyXG4gICAgICAgICAgICB0aGlzLnZlcnRleEJ1ZmZlcnMuZm9yRWFjaCggZnVuY3Rpb24oIHZlcnRleEJ1ZmZlciApIHtcclxuICAgICAgICAgICAgICAgIHZlcnRleEJ1ZmZlci5iaW5kKCk7XHJcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhCdWZmZXIuZHJhdyggb3ZlcnJpZGVzICk7XHJcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhCdWZmZXIudW5iaW5kKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBSZW5kZXJhYmxlO1xyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBXZWJHTENvbnRleHQgPSByZXF1aXJlKCcuL1dlYkdMQ29udGV4dCcpO1xuICAgIHZhciBTaGFkZXJQYXJzZXIgPSByZXF1aXJlKCcuL1NoYWRlclBhcnNlcicpO1xuICAgIHZhciBXZWJHTENvbnRleHRTdGF0ZSA9IHJlcXVpcmUoJy4vV2ViR0xDb250ZXh0U3RhdGUnKTtcbiAgICB2YXIgQXN5bmMgPSByZXF1aXJlKCcuLi91dGlsL0FzeW5jJyk7XG4gICAgdmFyIFhIUkxvYWRlciA9IHJlcXVpcmUoJy4uL3V0aWwvWEhSTG9hZGVyJyk7XG4gICAgdmFyIFVOSUZPUk1fRlVOQ1RJT05TID0ge1xuICAgICAgICAnYm9vbCc6ICd1bmlmb3JtMWknLFxuICAgICAgICAnYm9vbFtdJzogJ3VuaWZvcm0xaXYnLFxuICAgICAgICAnZmxvYXQnOiAndW5pZm9ybTFmJyxcbiAgICAgICAgJ2Zsb2F0W10nOiAndW5pZm9ybTFmdicsXG4gICAgICAgICdpbnQnOiAndW5pZm9ybTFpJyxcbiAgICAgICAgJ2ludFtdJzogJ3VuaWZvcm0xaXYnLFxuICAgICAgICAndWludCc6ICd1bmlmb3JtMWknLFxuICAgICAgICAndWludFtdJzogJ3VuaWZvcm0xaXYnLFxuICAgICAgICAndmVjMic6ICd1bmlmb3JtMmZ2JyxcbiAgICAgICAgJ3ZlYzJbXSc6ICd1bmlmb3JtMmZ2JyxcbiAgICAgICAgJ2l2ZWMyJzogJ3VuaWZvcm0yaXYnLFxuICAgICAgICAnaXZlYzJbXSc6ICd1bmlmb3JtMml2JyxcbiAgICAgICAgJ3ZlYzMnOiAndW5pZm9ybTNmdicsXG4gICAgICAgICd2ZWMzW10nOiAndW5pZm9ybTNmdicsXG4gICAgICAgICdpdmVjMyc6ICd1bmlmb3JtM2l2JyxcbiAgICAgICAgJ2l2ZWMzW10nOiAndW5pZm9ybTNpdicsXG4gICAgICAgICd2ZWM0JzogJ3VuaWZvcm00ZnYnLFxuICAgICAgICAndmVjNFtdJzogJ3VuaWZvcm00ZnYnLFxuICAgICAgICAnaXZlYzQnOiAndW5pZm9ybTRpdicsXG4gICAgICAgICdpdmVjNFtdJzogJ3VuaWZvcm00aXYnLFxuICAgICAgICAnbWF0Mic6ICd1bmlmb3JtTWF0cml4MmZ2JyxcbiAgICAgICAgJ21hdDJbXSc6ICd1bmlmb3JtTWF0cml4MmZ2JyxcbiAgICAgICAgJ21hdDMnOiAndW5pZm9ybU1hdHJpeDNmdicsXG4gICAgICAgICdtYXQzW10nOiAndW5pZm9ybU1hdHJpeDNmdicsXG4gICAgICAgICdtYXQ0JzogJ3VuaWZvcm1NYXRyaXg0ZnYnLFxuICAgICAgICAnbWF0NFtdJzogJ3VuaWZvcm1NYXRyaXg0ZnYnLFxuICAgICAgICAnc2FtcGxlcjJEJzogJ3VuaWZvcm0xaScsXG4gICAgICAgICdzYW1wbGVyQ3ViZSc6ICd1bmlmb3JtMWknXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgbWFwIG9mIGV4aXN0aW5nIGF0dHJpYnV0ZXMsIGZpbmQgdGhlIGxvd2VzdCBpbmRleCB0aGF0IGlzIG5vdFxuICAgICAqIGFscmVhZHkgdXNlZC4gSWYgdGhlIGF0dHJpYnV0ZSBvcmRlcmluZyB3YXMgYWxyZWFkeSBwcm92aWRlZCwgdXNlIHRoYXRcbiAgICAgKiBpbnN0ZWFkLlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlcyAtIFRoZSBleGlzdGluZyBhdHRyaWJ1dGVzIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGVjbGFyYXRpb24gLSBUaGUgYXR0cmlidXRlIGRlY2xhcmF0aW9uIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBhdHRyaWJ1dGUgaW5kZXguXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0QXR0cmlidXRlSW5kZXgoIGF0dHJpYnV0ZXMsIGRlY2xhcmF0aW9uICkge1xuICAgICAgICAvLyBjaGVjayBpZiBhdHRyaWJ1dGUgaXMgYWxyZWFkeSBkZWNsYXJlZCwgaWYgc28sIHVzZSB0aGF0IGluZGV4XG4gICAgICAgIGlmICggYXR0cmlidXRlc1sgZGVjbGFyYXRpb24ubmFtZSBdICkge1xuICAgICAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXNbIGRlY2xhcmF0aW9uLm5hbWUgXS5pbmRleDtcbiAgICAgICAgfVxuICAgICAgICAvLyByZXR1cm4gbmV4dCBhdmFpbGFibGUgaW5kZXhcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKCBhdHRyaWJ1dGVzICkubGVuZ3RoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdpdmVuIHZlcnRleCBhbmQgZnJhZ21lbnQgc2hhZGVyIHNvdXJjZSwgcGFyc2VzIHRoZSBkZWNsYXJhdGlvbnMgYW5kIGFwcGVuZHMgaW5mb3JtYXRpb24gcGVydGFpbmluZyB0byB0aGUgdW5pZm9ybXMgYW5kIGF0dHJpYnR1ZXMgZGVjbGFyZWQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U2hhZGVyfSBzaGFkZXIgLSBUaGUgc2hhZGVyIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmVydFNvdXJjZSAtIFRoZSB2ZXJ0ZXggc2hhZGVyIHNvdXJjZS5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZnJhZ1NvdXJjZSAtIFRoZSBmcmFnbWVudCBzaGFkZXIgc291cmNlLlxuICAgICAqXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIGF0dHJpYnV0ZSBhbmQgdW5pZm9ybSBpbmZvcm1hdGlvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzZXRBdHRyaWJ1dGVzQW5kVW5pZm9ybXMoIHNoYWRlciwgdmVydFNvdXJjZSwgZnJhZ1NvdXJjZSApIHtcbiAgICAgICAgdmFyIGRlY2xhcmF0aW9ucyA9IFNoYWRlclBhcnNlci5wYXJzZURlY2xhcmF0aW9ucyhcbiAgICAgICAgICAgIFsgdmVydFNvdXJjZSwgZnJhZ1NvdXJjZSBdLFxuICAgICAgICAgICAgWyAndW5pZm9ybScsICdhdHRyaWJ1dGUnIF1cbiAgICAgICAgKTtcbiAgICAgICAgLy8gZm9yIGVhY2ggZGVjbGFyYXRpb24gaW4gdGhlIHNoYWRlclxuICAgICAgICBkZWNsYXJhdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24oIGRlY2xhcmF0aW9uICkge1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgaXRzIGFuIGF0dHJpYnV0ZSBvciB1bmlmb3JtXG4gICAgICAgICAgICBpZiAoIGRlY2xhcmF0aW9uLnF1YWxpZmllciA9PT0gJ2F0dHJpYnV0ZScgKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgYXR0cmlidXRlLCBzdG9yZSB0eXBlIGFuZCBpbmRleFxuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGdldEF0dHJpYnV0ZUluZGV4KCBzaGFkZXIuYXR0cmlidXRlcywgZGVjbGFyYXRpb24gKTtcbiAgICAgICAgICAgICAgICBzaGFkZXIuYXR0cmlidXRlc1sgZGVjbGFyYXRpb24ubmFtZSBdID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBkZWNsYXJhdGlvbi50eXBlLFxuICAgICAgICAgICAgICAgICAgICBpbmRleDogaW5kZXhcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIGlmICggZGVjbGFyYXRpb24ucXVhbGlmaWVyID09PSAndW5pZm9ybScgKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdW5pZm9ybSwgc3RvcmUgdHlwZSBhbmQgYnVmZmVyIGZ1bmN0aW9uIG5hbWVcbiAgICAgICAgICAgICAgICBzaGFkZXIudW5pZm9ybXNbIGRlY2xhcmF0aW9uLm5hbWUgXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogZGVjbGFyYXRpb24udHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZnVuYzogVU5JRk9STV9GVU5DVElPTlNbIGRlY2xhcmF0aW9uLnR5cGUgKyAoZGVjbGFyYXRpb24uY291bnQgPiAxID8gJ1tdJyA6ICcnKSBdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYSBzaGFkZXIgc291cmNlIHN0cmluZyBhbmQgc2hhZGVyIHR5cGUsIGNvbXBpbGVzIHRoZSBzaGFkZXIgYW5kIHJldHVybnMgdGhlIHJlc3VsdGluZyBXZWJHTFNoYWRlciBvYmplY3QuXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCAtIFRoZSB3ZWJnbCByZW5kZXJpbmcgY29udGV4dC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc2hhZGVyU291cmNlIC0gVGhlIHNoYWRlciBzb3VyY2UuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgLSBUaGUgc2hhZGVyIHR5cGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7V2ViR0xTaGFkZXJ9IFRoZSBjb21waWxlZCBzaGFkZXIgb2JqZWN0LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbXBpbGVTaGFkZXIoIGdsLCBzaGFkZXJTb3VyY2UsIHR5cGUgKSB7XG4gICAgICAgIHZhciBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoIGdsWyB0eXBlIF0gKTtcbiAgICAgICAgZ2wuc2hhZGVyU291cmNlKCBzaGFkZXIsIHNoYWRlclNvdXJjZSApO1xuICAgICAgICBnbC5jb21waWxlU2hhZGVyKCBzaGFkZXIgKTtcbiAgICAgICAgaWYgKCAhZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKCBzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTICkgKSB7XG4gICAgICAgICAgICB0aHJvdyAnQW4gZXJyb3Igb2NjdXJyZWQgY29tcGlsaW5nIHRoZSBzaGFkZXJzOlxcbicgKyBnbC5nZXRTaGFkZXJJbmZvTG9nKCBzaGFkZXIgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2hhZGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmRzIHRoZSBhdHRyaWJ1dGUgbG9jYXRpb25zIGZvciB0aGUgU2hhZGVyIG9iamVjdC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtTaGFkZXJ9IHNoYWRlciAtIFRoZSBTaGFkZXIgb2JqZWN0LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJpbmRBdHRyaWJ1dGVMb2NhdGlvbnMoIHNoYWRlciApIHtcbiAgICAgICAgdmFyIGdsID0gc2hhZGVyLmdsO1xuICAgICAgICB2YXIgYXR0cmlidXRlcyA9IHNoYWRlci5hdHRyaWJ1dGVzO1xuICAgICAgICBPYmplY3Qua2V5cyggYXR0cmlidXRlcyApLmZvckVhY2goIGZ1bmN0aW9uKCBrZXkgKSB7XG4gICAgICAgICAgICAvLyBiaW5kIHRoZSBhdHRyaWJ1dGUgbG9jYXRpb25cbiAgICAgICAgICAgIGdsLmJpbmRBdHRyaWJMb2NhdGlvbihcbiAgICAgICAgICAgICAgICBzaGFkZXIucHJvZ3JhbSxcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzWyBrZXkgXS5pbmRleCxcbiAgICAgICAgICAgICAgICBrZXkgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUXVlcmllcyB0aGUgd2ViZ2wgcmVuZGVyaW5nIGNvbnRleHQgZm9yIHRoZSB1bmlmb3JtIGxvY2F0aW9ucy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtTaGFkZXJ9IHNoYWRlciAtIFRoZSBTaGFkZXIgb2JqZWN0LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldFVuaWZvcm1Mb2NhdGlvbnMoIHNoYWRlciApIHtcbiAgICAgICAgdmFyIGdsID0gc2hhZGVyLmdsO1xuICAgICAgICB2YXIgdW5pZm9ybXMgPSBzaGFkZXIudW5pZm9ybXM7XG4gICAgICAgIE9iamVjdC5rZXlzKCB1bmlmb3JtcyApLmZvckVhY2goIGZ1bmN0aW9uKCBrZXkgKSB7XG4gICAgICAgICAgICAvLyBnZXQgdGhlIHVuaWZvcm0gbG9jYXRpb25cbiAgICAgICAgICAgIHVuaWZvcm1zWyBrZXkgXS5sb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbiggc2hhZGVyLnByb2dyYW0sIGtleSApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgZnVuY3Rpb24gdG8gbG9hZCBzaGFkZXIgc291cmNlIGZyb20gYSB1cmwuXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgLSBUaGUgdXJsIHRvIGxvYWQgdGhlIHJlc291cmNlIGZyb20uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFRoZSBmdW5jdGlvbiB0byBsb2FkIHRoZSBzaGFkZXIgc291cmNlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGxvYWRTaGFkZXJTb3VyY2UoIHVybCApIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCBkb25lICkge1xuICAgICAgICAgICAgWEhSTG9hZGVyLmxvYWQoe1xuICAgICAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlVHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCByZXMgKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUoIG51bGwsIHJlcyApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUoIGVyciwgbnVsbCApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBmdW5jdGlvbiB0byBwYXNzIHRocm91Z2ggdGhlIHNoYWRlciBzb3VyY2UuXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzb3VyY2UgLSBUaGUgc291cmNlIG9mIHRoZSBzaGFkZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFRoZSBmdW5jdGlvbiB0byBwYXNzIHRocm91Z2ggdGhlIHNoYWRlciBzb3VyY2UuXG4gICAgICovXG4gICAgZnVuY3Rpb24gcGFzc1Rocm91Z2hTb3VyY2UoIHNvdXJjZSApIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCBkb25lICkge1xuICAgICAgICAgICAgZG9uZSggbnVsbCwgc291cmNlICk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYW4gYXJyYXkgb2YgR0xTTCBzb3VyY2Ugc3RyaW5ncyBhbmQgVVJMcywgYW5kIHJlc29sdmVzIHRoZW0gaW50byBhbmQgYXJyYXkgb2YgR0xTTCBzb3VyY2UuXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHNvdXJjZXMgLSBUaGUgc2hhZGVyIHNvdXJjZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyAtIEEgZnVuY3Rpb24gdG8gcmVzb2x2ZSB0aGUgc2hhZGVyIHNvdXJjZXMuXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVzb2x2ZVNvdXJjZXMoIHNvdXJjZXMgKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiggZG9uZSApIHtcbiAgICAgICAgICAgIHZhciB0YXNrcyA9IFtdO1xuICAgICAgICAgICAgc291cmNlcyA9IHNvdXJjZXMgfHwgW107XG4gICAgICAgICAgICBzb3VyY2VzID0gKCAhKCBzb3VyY2VzIGluc3RhbmNlb2YgQXJyYXkgKSApID8gWyBzb3VyY2VzIF0gOiBzb3VyY2VzO1xuICAgICAgICAgICAgc291cmNlcy5mb3JFYWNoKCBmdW5jdGlvbiggc291cmNlICkge1xuICAgICAgICAgICAgICAgIGlmICggU2hhZGVyUGFyc2VyLmlzR0xTTCggc291cmNlICkgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tzLnB1c2goIHBhc3NUaHJvdWdoU291cmNlKCBzb3VyY2UgKSApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tzLnB1c2goIGxvYWRTaGFkZXJTb3VyY2UoIHNvdXJjZSApICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBBc3luYy5wYXJhbGxlbCggdGFza3MsIGRvbmUgKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRoZSBzaGFkZXIgcHJvZ3JhbSBvYmplY3QgZnJvbSBzb3VyY2Ugc3RyaW5ncy4gVGhpcyBpbmNsdWRlczpcbiAgICAgKiAgICAxKSBDb21waWxpbmcgYW5kIGxpbmtpbmcgdGhlIHNoYWRlciBwcm9ncmFtLlxuICAgICAqICAgIDIpIFBhcnNpbmcgc2hhZGVyIHNvdXJjZSBmb3IgYXR0cmlidXRlIGFuZCB1bmlmb3JtIGluZm9ybWF0aW9uLlxuICAgICAqICAgIDMpIEJpbmRpbmcgYXR0cmlidXRlIGxvY2F0aW9ucywgYnkgb3JkZXIgb2YgZGVsY2FyYXRpb24uXG4gICAgICogICAgNCkgUXVlcnlpbmcgYW5kIHN0b3JpbmcgdW5pZm9ybSBsb2NhdGlvbi5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtTaGFkZXJ9IHNoYWRlciAtIFRoZSBTaGFkZXIgb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2VzIC0gQSBtYXAgY29udGFpbmluZyBzb3VyY2VzIHVuZGVyICd2ZXJ0JyBhbmQgJ2ZyYWcnIGF0dHJpYnV0ZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U2hhZGVyfSBUaGUgc2hhZGVyIG9iamVjdCwgZm9yIGNoYWluaW5nLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNyZWF0ZVByb2dyYW0oIHNoYWRlciwgc291cmNlcyApIHtcbiAgICAgICAgdmFyIGdsID0gc2hhZGVyLmdsO1xuICAgICAgICB2YXIgY29tbW9uID0gc291cmNlcy5jb21tb24uam9pbiggJycgKTtcbiAgICAgICAgdmFyIHZlcnQgPSBzb3VyY2VzLnZlcnQuam9pbiggJycgKTtcbiAgICAgICAgdmFyIGZyYWcgPSBzb3VyY2VzLmZyYWcuam9pbiggJycgKTtcbiAgICAgICAgLy8gY29tcGlsZSBzaGFkZXJzXG4gICAgICAgIHZhciB2ZXJ0ZXhTaGFkZXIgPSBjb21waWxlU2hhZGVyKCBnbCwgY29tbW9uICsgdmVydCwgJ1ZFUlRFWF9TSEFERVInICk7XG4gICAgICAgIHZhciBmcmFnbWVudFNoYWRlciA9IGNvbXBpbGVTaGFkZXIoIGdsLCBjb21tb24gKyBmcmFnLCAnRlJBR01FTlRfU0hBREVSJyApO1xuICAgICAgICAvLyBwYXJzZSBzb3VyY2UgZm9yIGF0dHJpYnV0ZSBhbmQgdW5pZm9ybXNcbiAgICAgICAgc2V0QXR0cmlidXRlc0FuZFVuaWZvcm1zKCBzaGFkZXIsIHZlcnQsIGZyYWcgKTtcbiAgICAgICAgLy8gY3JlYXRlIHRoZSBzaGFkZXIgcHJvZ3JhbVxuICAgICAgICBzaGFkZXIucHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICAgICAgLy8gYXR0YWNoIHZlcnRleCBhbmQgZnJhZ21lbnQgc2hhZGVyc1xuICAgICAgICBnbC5hdHRhY2hTaGFkZXIoIHNoYWRlci5wcm9ncmFtLCB2ZXJ0ZXhTaGFkZXIgKTtcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKCBzaGFkZXIucHJvZ3JhbSwgZnJhZ21lbnRTaGFkZXIgKTtcbiAgICAgICAgLy8gYmluZCB2ZXJ0ZXggYXR0cmlidXRlIGxvY2F0aW9ucyBCRUZPUkUgbGlua2luZ1xuICAgICAgICBiaW5kQXR0cmlidXRlTG9jYXRpb25zKCBzaGFkZXIgKTtcbiAgICAgICAgLy8gbGluayBzaGFkZXJcbiAgICAgICAgZ2wubGlua1Byb2dyYW0oIHNoYWRlci5wcm9ncmFtICk7XG4gICAgICAgIC8vIElmIGNyZWF0aW5nIHRoZSBzaGFkZXIgcHJvZ3JhbSBmYWlsZWQsIGFsZXJ0XG4gICAgICAgIGlmICggIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIoIHNoYWRlci5wcm9ncmFtLCBnbC5MSU5LX1NUQVRVUyApICkge1xuICAgICAgICAgICAgdGhyb3cgJ0FuIGVycm9yIG9jY3VyZWQgbGlua2luZyB0aGUgc2hhZGVyOlxcbicgKyBnbC5nZXRQcm9ncmFtSW5mb0xvZyggc2hhZGVyLnByb2dyYW0gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBnZXQgc2hhZGVyIHVuaWZvcm0gbG9jYXRpb25zXG4gICAgICAgIGdldFVuaWZvcm1Mb2NhdGlvbnMoIHNoYWRlciApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluc3RhbnRpYXRlcyBhIFNoYWRlciBvYmplY3QuXG4gICAgICogQGNsYXNzIFNoYWRlclxuICAgICAqIEBjbGFzc2Rlc2MgQSBzaGFkZXIgY2xhc3MgdG8gYXNzaXN0IGluIGNvbXBpbGluZyBhbmQgbGlua2luZyB3ZWJnbFxuICAgICAqIHNoYWRlcnMsIHN0b3JpbmcgYXR0cmlidXRlIGFuZCB1bmlmb3JtIGxvY2F0aW9ucywgYW5kIGJ1ZmZlcmluZyB1bmlmb3Jtcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzcGVjIC0gVGhlIHNoYWRlciBzcGVjaWZpY2F0aW9uIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xTdHJpbmdbXXxPYmplY3R9IHNwZWMuY29tbW9uIC0gU291cmNlcyAvIFVSTHMgdG8gYmUgc2hhcmVkIGJ5IGJvdGggdnZlcnRleCBhbmQgZnJhZ21lbnQgc2hhZGVycy5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xTdHJpbmdbXXxPYmplY3R9IHNwZWMudmVydCAtIFRoZSB2ZXJ0ZXggc2hhZGVyIHNvdXJjZXMgLyBVUkxzLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfFN0cmluZ1tdfE9iamVjdH0gc3BlYy5mcmFnIC0gVGhlIGZyYWdtZW50IHNoYWRlciBzb3VyY2VzIC8gVVJMcy5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ1tdfSBzcGVjLmF0dHJpYnV0ZXMgLSBUaGUgYXR0cmlidXRlIGluZGV4IG9yZGVyaW5ncy5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlIG9uY2UgdGhlIHNoYWRlclxuICAgICAqICAgICBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgY29tcGlsZWQgYW5kIGxpbmtlZC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBTaGFkZXIoIHNwZWMsIGNhbGxiYWNrICkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHNwZWMgPSBzcGVjIHx8IHt9O1xuICAgICAgICAvLyBjaGVjayBzb3VyY2UgYXJndW1lbnRzXG4gICAgICAgIGlmICggIXNwZWMudmVydCApIHtcbiAgICAgICAgICAgIHRocm93ICdWZXJ0ZXggc2hhZGVyIGFyZ3VtZW50IGhhcyBub3QgYmVlbiBwcm92aWRlZCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCAhc3BlYy5mcmFnICkge1xuICAgICAgICAgICAgdGhyb3cgJ0ZyYWdtZW50IHNoYWRlciBhcmd1bWVudCBoYXMgbm90IGJlZW4gcHJvdmlkZWQnO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IDA7XG4gICAgICAgIHRoaXMuZ2wgPSBXZWJHTENvbnRleHQuZ2V0KCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBXZWJHTENvbnRleHRTdGF0ZS5nZXQoIHRoaXMuZ2wgKTtcbiAgICAgICAgdGhpcy52ZXJzaW9uID0gc3BlYy52ZXJzaW9uIHx8ICcxLjAwJztcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgICAgIHRoaXMudW5pZm9ybXMgPSB7fTtcbiAgICAgICAgLy8gaWYgYXR0cmlidXRlIG9yZGVyaW5nIGlzIHByb3ZpZGVkLCB1c2UgdGhvc2UgaW5kaWNlc1xuICAgICAgICBpZiAoIHNwZWMuYXR0cmlidXRlcyApIHtcbiAgICAgICAgICAgIHNwZWMuYXR0cmlidXRlcy5mb3JFYWNoKCBmdW5jdGlvbiggYXR0ciwgaW5kZXggKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hdHRyaWJ1dGVzWyBhdHRyIF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjcmVhdGUgdGhlIHNoYWRlclxuICAgICAgICBBc3luYy5wYXJhbGxlbCh7XG4gICAgICAgICAgICBjb21tb246IHJlc29sdmVTb3VyY2VzKCBzcGVjLmNvbW1vbiApLFxuICAgICAgICAgICAgdmVydDogcmVzb2x2ZVNvdXJjZXMoIHNwZWMudmVydCApLFxuICAgICAgICAgICAgZnJhZzogcmVzb2x2ZVNvdXJjZXMoIHNwZWMuZnJhZyApLFxuICAgICAgICB9LCBmdW5jdGlvbiggZXJyLCBzb3VyY2VzICkge1xuICAgICAgICAgICAgaWYgKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBjYWxsYmFjayApIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soIGVyciwgbnVsbCApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBvbmNlIGFsbCBzaGFkZXIgc291cmNlcyBhcmUgbG9hZGVkXG4gICAgICAgICAgICBjcmVhdGVQcm9ncmFtKCB0aGF0LCBzb3VyY2VzICk7XG4gICAgICAgICAgICBpZiAoIGNhbGxiYWNrICkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCBudWxsLCB0aGF0ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmRzIHRoZSBzaGFkZXIgb2JqZWN0IGFuZCBwdXNoZXMgaXQgdG8gdGhlIGZyb250IG9mIHRoZSBzdGFjay5cbiAgICAgKiBAbWVtYmVyb2YgU2hhZGVyXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U2hhZGVyfSBUaGUgc2hhZGVyIG9iamVjdCwgZm9yIGNoYWluaW5nLlxuICAgICAqL1xuICAgIFNoYWRlci5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBpZiB0aGlzIHNoYWRlciBpcyBhbHJlYWR5IGJvdW5kLCBubyBuZWVkIHRvIHJlYmluZFxuICAgICAgICBpZiAoIHRoaXMuc3RhdGUuc2hhZGVycy50b3AoKSAhPT0gdGhpcyApIHtcbiAgICAgICAgICAgIHRoaXMuZ2wudXNlUHJvZ3JhbSggdGhpcy5wcm9ncmFtICk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdGF0ZS5zaGFkZXJzLnB1c2goIHRoaXMgKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFVuYmluZHMgdGhlIHNoYWRlciBvYmplY3QgYW5kIGJpbmRzIHRoZSBzaGFkZXIgYmVuZWF0aCBpdCBvbiB0aGlzIHN0YWNrLiBJZiB0aGVyZSBpcyBubyB1bmRlcmx5aW5nIHNoYWRlciwgYmluZCB0aGUgYmFja2J1ZmZlci5cbiAgICAgKiBAbWVtYmVyb2YgU2hhZGVyXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U2hhZGVyfSBUaGUgc2hhZGVyIG9iamVjdCwgZm9yIGNoYWluaW5nLlxuICAgICAqL1xuICAgIFNoYWRlci5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIHNoYWRlciBib3VuZCwgZXhpdCBlYXJseVxuICAgICAgICBpZiAoIHN0YXRlLnNoYWRlcnMudG9wKCkgIT09IHRoaXMgKSB7XG4gICAgICAgICAgICB0aHJvdyAnU2hhZGVyIGlzIG5vdCB0aGUgdG9wIG1vc3QgZWxlbWVudCBvbiB0aGUgc3RhY2snO1xuICAgICAgICB9XG4gICAgICAgIC8vIHBvcCBzaGFkZXIgb2ZmIHN0YWNrXG4gICAgICAgIHN0YXRlLnNoYWRlcnMucG9wKCk7XG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIHVuZGVybHlpbmcgc2hhZGVyLCBiaW5kIGl0XG4gICAgICAgIHZhciB0b3AgPSBzdGF0ZS5zaGFkZXJzLnRvcCgpO1xuICAgICAgICBpZiAoIHRvcCAmJiB0b3AgIT09IHRoaXMgKSB7XG4gICAgICAgICAgICB0b3AuZ2wudXNlUHJvZ3JhbSggdG9wLnByb2dyYW0gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHVuYmluZCB0aGUgc2hhZGVyXG4gICAgICAgICAgICB0aGlzLmdsLnVzZVByb2dyYW0oIG51bGwgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQnVmZmVyIGEgdW5pZm9ybSB2YWx1ZSBieSBuYW1lLlxuICAgICAqIEBtZW1iZXJvZiBTaGFkZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gVGhlIHVuaWZvcm0gbmFtZSBpbiB0aGUgc2hhZGVyIHNvdXJjZS5cbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIC0gVGhlIHVuaWZvcm0gdmFsdWUgdG8gYnVmZmVyLlxuICAgICAqXG4gICAgICogQHJldHVybnMge1NoYWRlcn0gVGhlIHNoYWRlciBvYmplY3QsIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBTaGFkZXIucHJvdG90eXBlLnNldFVuaWZvcm0gPSBmdW5jdGlvbiggbmFtZSwgdmFsdWUgKSB7XG4gICAgICAgIC8vIGVuc3VyZSBzaGFkZXIgaXMgYm91bmRcbiAgICAgICAgaWYgKCB0aGlzICE9PSB0aGlzLnN0YXRlLnNoYWRlcnMudG9wKCkgKSB7XG4gICAgICAgICAgICB0aHJvdyAnQXR0ZW1wdGluZyB0byBzZXQgdW5pZm9ybSBgJyArIG5hbWUgKyAnYCBmb3IgYW4gdW5ib3VuZCBzaGFkZXInO1xuICAgICAgICB9XG4gICAgICAgIHZhciB1bmlmb3JtID0gdGhpcy51bmlmb3Jtc1sgbmFtZSBdO1xuICAgICAgICAvLyBlbnN1cmUgdGhhdCB0aGUgdW5pZm9ybSBzcGVjIGV4aXN0cyBmb3IgdGhlIG5hbWVcbiAgICAgICAgaWYgKCAhdW5pZm9ybSApIHtcbiAgICAgICAgICAgIHRocm93ICdObyB1bmlmb3JtIGZvdW5kIHVuZGVyIG5hbWUgYCcgKyBuYW1lICsgJ2AnO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNoZWNrIHZhbHVlXG4gICAgICAgIGlmICggdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCApIHtcbiAgICAgICAgICAgIC8vIGVuc3VyZSB0aGF0IHRoZSB1bmlmb3JtIGFyZ3VtZW50IGlzIGRlZmluZWRcbiAgICAgICAgICAgIHRocm93ICdBcmd1bWVudCBwYXNzZWQgZm9yIHVuaWZvcm0gYCcgKyBuYW1lICsgJ2AgaXMgdW5kZWZpbmVkJztcbiAgICAgICAgfSBlbHNlIGlmICggdmFsdWUgaW5zdGFuY2VvZiBBcnJheSApIHtcbiAgICAgICAgICAgIC8vIGNvbnZlcnQgQXJyYXkgdG8gRmxvYXQzMkFycmF5XG4gICAgICAgICAgICB2YWx1ZSA9IG5ldyBGbG9hdDMyQXJyYXkoIHZhbHVlICk7XG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nICkge1xuICAgICAgICAgICAgLy8gY29udmVydCBib29sZWFuJ3MgdG8gMCBvciAxXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlID8gMSA6IDA7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcGFzcyB0aGUgYXJndW1lbnRzIGRlcGVuZGluZyBvbiB0aGUgdHlwZVxuICAgICAgICBpZiAoIHVuaWZvcm0udHlwZSA9PT0gJ21hdDInIHx8IHVuaWZvcm0udHlwZSA9PT0gJ21hdDMnIHx8IHVuaWZvcm0udHlwZSA9PT0gJ21hdDQnICkge1xuICAgICAgICAgICAgdGhpcy5nbFsgdW5pZm9ybS5mdW5jIF0oIHVuaWZvcm0ubG9jYXRpb24sIGZhbHNlLCB2YWx1ZSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nbFsgdW5pZm9ybS5mdW5jIF0oIHVuaWZvcm0ubG9jYXRpb24sIHZhbHVlICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEJ1ZmZlciBhIG1hcCBvZiB1bmlmb3JtIHZhbHVlcy5cbiAgICAgKiBAbWVtYmVyb2YgU2hhZGVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gdW5pZm9ybXMgLSBUaGUgbWFwIG9mIHVuaWZvcm1zIGtleWVkIGJ5IG5hbWUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U2hhZGVyfSBUaGUgc2hhZGVyIG9iamVjdCwgZm9yIGNoYWluaW5nLlxuICAgICAqL1xuICAgIFNoYWRlci5wcm90b3R5cGUuc2V0VW5pZm9ybXMgPSBmdW5jdGlvbiggYXJncyApIHtcbiAgICAgICAgLy8gZW5zdXJlIHNoYWRlciBpcyBib3VuZFxuICAgICAgICBpZiAoIHRoaXMgIT09IHRoaXMuc3RhdGUuc2hhZGVycy50b3AoKSApIHtcbiAgICAgICAgICAgIHRocm93ICdBdHRlbXB0aW5nIHRvIHNldCB1bmlmb3JtIGAnICsgbmFtZSArICdgIGZvciBhbiB1bmJvdW5kIHNoYWRlcic7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGdsID0gdGhpcy5nbDtcbiAgICAgICAgdmFyIHVuaWZvcm1zID0gdGhpcy51bmlmb3JtcztcbiAgICAgICAgT2JqZWN0LmtleXMoIGFyZ3MgKS5mb3JFYWNoKCBmdW5jdGlvbiggbmFtZSApIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGFyZ3NbbmFtZV07XG4gICAgICAgICAgICB2YXIgdW5pZm9ybSA9IHVuaWZvcm1zW25hbWVdO1xuICAgICAgICAgICAgLy8gZW5zdXJlIHRoYXQgdGhlIHVuaWZvcm0gZXhpc3RzIGZvciB0aGUgbmFtZVxuICAgICAgICAgICAgaWYgKCAhdW5pZm9ybSApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyAnTm8gdW5pZm9ybSBmb3VuZCB1bmRlciBuYW1lIGAnICsgbmFtZSArICdgJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICggdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCApIHtcbiAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCB0aGUgdW5pZm9ybSBhcmd1bWVudCBpcyBkZWZpbmVkXG4gICAgICAgICAgICAgICAgdGhyb3cgJ0FyZ3VtZW50IHBhc3NlZCBmb3IgdW5pZm9ybSBgJyArIG5hbWUgKyAnYCBpcyB1bmRlZmluZWQnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICggdmFsdWUgaW5zdGFuY2VvZiBBcnJheSApIHtcbiAgICAgICAgICAgICAgICAvLyBjb252ZXJ0IEFycmF5IHRvIEZsb2F0MzJBcnJheVxuICAgICAgICAgICAgICAgIHZhbHVlID0gbmV3IEZsb2F0MzJBcnJheSggdmFsdWUgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nICkge1xuICAgICAgICAgICAgICAgIC8vIGNvbnZlcnQgYm9vbGVhbidzIHRvIDAgb3IgMVxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPyAxIDogMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHBhc3MgdGhlIGFyZ3VtZW50cyBkZXBlbmRpbmcgb24gdGhlIHR5cGVcbiAgICAgICAgICAgIGlmICggdW5pZm9ybS50eXBlID09PSAnbWF0MicgfHwgdW5pZm9ybS50eXBlID09PSAnbWF0MycgfHwgdW5pZm9ybS50eXBlID09PSAnbWF0NCcgKSB7XG4gICAgICAgICAgICAgICAgZ2xbIHVuaWZvcm0uZnVuYyBdKCB1bmlmb3JtLmxvY2F0aW9uLCBmYWxzZSwgdmFsdWUgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2xbIHVuaWZvcm0uZnVuYyBdKCB1bmlmb3JtLmxvY2F0aW9uLCB2YWx1ZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gU2hhZGVyO1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIFBSRUNJU0lPTl9RVUFMSUZJRVJTID0ge1xyXG4gICAgICAgIGhpZ2hwOiB0cnVlLFxyXG4gICAgICAgIG1lZGl1bXA6IHRydWUsXHJcbiAgICAgICAgbG93cDogdHJ1ZVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgUFJFQ0lTSU9OX1RZUEVTID0ge1xyXG4gICAgICAgIGZsb2F0OiAnZmxvYXQnLFxyXG4gICAgICAgIHZlYzI6ICdmbG9hdCcsXHJcbiAgICAgICAgdmVjMzogJ2Zsb2F0JyxcclxuICAgICAgICB2ZWM0OiAnZmxvYXQnLFxyXG4gICAgICAgIGl2ZWMyOiAnaW50JyxcclxuICAgICAgICBpdmVjMzogJ2ludCcsXHJcbiAgICAgICAgaXZlYzQ6ICdpbnQnLFxyXG4gICAgICAgIGludDogJ2ludCcsXHJcbiAgICAgICAgdWludDogJ2ludCcsXHJcbiAgICAgICAgc2FtcGxlcjJEOiAnc2FtcGxlcjJEJyxcclxuICAgICAgICBzYW1wbGVyQ3ViZTogJ3NhbXBsZXJDdWJlJyxcclxuICAgIH07XHJcblxyXG4gICAgdmFyIENPTU1FTlRTX1JFR0VYUCA9IC8oXFwvXFwqKFtcXHNcXFNdKj8pXFwqXFwvKXwoXFwvXFwvKC4qKSQpL2dtO1xyXG4gICAgdmFyIEVORExJTkVfUkVHRVhQID0gLyhcXHJcXG58XFxufFxccikvZ207XHJcbiAgICB2YXIgV0hJVEVTUEFDRV9SRUdFWFAgPSAvXFxzezIsfS9nO1xyXG4gICAgdmFyIEJSQUNLRVRfV0hJVEVTUEFDRV9SRUdFWFAgPSAvKFxccyopKFxcWykoXFxzKikoXFxkKykoXFxzKikoXFxdKShcXHMqKS9nO1xyXG4gICAgdmFyIE5BTUVfQ09VTlRfUkVHRVhQID0gLyhbYS16QS1aX11bYS16QS1aMC05X10qKSg/OlxcWyhcXGQrKVxcXSk/LztcclxuICAgIHZhciBQUkVDSVNJT05fUkVHRVggPSAvXFxiKHByZWNpc2lvbilcXHMrKFxcdyspXFxzKyhcXHcrKS87XHJcbiAgICB2YXIgR0xTTF9SRUdFWFAgPSAgL3ZvaWRcXHMrbWFpblxccypcXChcXHMqKHZvaWQpKlxccypcXClcXHMqL21pO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBzdGFuZGFyZCBjb21tZW50cyBmcm9tIHRoZSBwcm92aWRlZCBzdHJpbmcuXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgLSBUaGUgc3RyaW5nIHRvIHN0cmlwIGNvbW1lbnRzIGZyb20uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1N0cmluZ30gVGhlIGNvbW1lbnRsZXNzIHN0cmluZy5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gc3RyaXBDb21tZW50cyggc3RyICkge1xyXG4gICAgICAgIC8vIHJlZ2V4IHNvdXJjZTogaHR0cHM6Ly9naXRodWIuY29tL21vYWdyaXVzL3N0cmlwY29tbWVudHNcclxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoIENPTU1FTlRTX1JFR0VYUCwgJycgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnRzIGFsbCB3aGl0ZXNwYWNlIGludG8gYSBzaW5nbGUgJyAnIHNwYWNlIGNoYXJhY3Rlci5cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0ciAtIFRoZSBzdHJpbmcgdG8gbm9ybWFsaXplIHdoaXRlc3BhY2UgZnJvbS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgbm9ybWFsaXplZCBzdHJpbmcuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZVdoaXRlc3BhY2UoIHN0ciApIHtcclxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoIEVORExJTkVfUkVHRVhQLCAnICcgKSAvLyByZW1vdmUgbGluZSBlbmRpbmdzXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKCBXSElURVNQQUNFX1JFR0VYUCwgJyAnICkgLy8gbm9ybWFsaXplIHdoaXRlc3BhY2UgdG8gc2luZ2xlICcgJ1xyXG4gICAgICAgICAgICAucmVwbGFjZSggQlJBQ0tFVF9XSElURVNQQUNFX1JFR0VYUCwgJyQyJDQkNicgKTsgLy8gcmVtb3ZlIHdoaXRlc3BhY2UgaW4gYnJhY2tldHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlcyB0aGUgbmFtZSBhbmQgY291bnQgb3V0IG9mIGEgbmFtZSBzdGF0ZW1lbnQsIHJldHVybmluZyB0aGVcclxuICAgICAqIGRlY2xhcmF0aW9uIG9iamVjdC5cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHF1YWxpZmllciAtIFRoZSBxdWFsaWZpZXIgc3RyaW5nLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByZWNpc2lvbiAtIFRoZSBwcmVjaXNpb24gc3RyaW5nLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgLSBUaGUgdHlwZSBzdHJpbmcuXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZW50cnkgLSBUaGUgdmFyaWFibGUgZGVjbGFyYXRpb24gc3RyaW5nLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBkZWNsYXJhdGlvbiBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHBhcnNlTmFtZUFuZENvdW50KCBxdWFsaWZpZXIsIHByZWNpc2lvbiwgdHlwZSwgZW50cnkgKSB7XHJcbiAgICAgICAgLy8gZGV0ZXJtaW5lIG5hbWUgYW5kIHNpemUgb2YgdmFyaWFibGVcclxuICAgICAgICB2YXIgbWF0Y2hlcyA9IGVudHJ5Lm1hdGNoKCBOQU1FX0NPVU5UX1JFR0VYUCApO1xyXG4gICAgICAgIHZhciBuYW1lID0gbWF0Y2hlc1sxXTtcclxuICAgICAgICB2YXIgY291bnQgPSAoIG1hdGNoZXNbMl0gPT09IHVuZGVmaW5lZCApID8gMSA6IHBhcnNlSW50KCBtYXRjaGVzWzJdLCAxMCApO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHF1YWxpZmllcjogcXVhbGlmaWVyLFxyXG4gICAgICAgICAgICBwcmVjaXNpb246IHByZWNpc2lvbixcclxuICAgICAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICAgICAgY291bnQ6IGNvdW50XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlcyBhIHNpbmdsZSAnc3RhdGVtZW50Jy4gQSAnc3RhdGVtZW50JyBpcyBjb25zaWRlcmVkIGFueSBzZXF1ZW5jZSBvZlxyXG4gICAgICogY2hhcmFjdGVycyBmb2xsb3dlZCBieSBhIHNlbWktY29sb24uIFRoZXJlZm9yZSwgYSBzaW5nbGUgJ3N0YXRlbWVudCcgaW5cclxuICAgICAqIHRoaXMgc2Vuc2UgY291bGQgY29udGFpbiBzZXZlcmFsIGNvbW1hIHNlcGFyYXRlZCBkZWNsYXJhdGlvbnMuIFJldHVybnNcclxuICAgICAqIGFsbCByZXN1bHRpbmcgZGVjbGFyYXRpb25zLlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RhdGVtZW50IC0gVGhlIHN0YXRlbWVudCB0byBwYXJzZS5cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcmVjaXNpb25zIC0gVGhlIGN1cnJlbnQgc3RhdGUgb2YgZ2xvYmFsIHByZWNpc2lvbnMuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge0FycmF5fSBUaGUgYXJyYXkgb2YgcGFyc2VkIGRlY2xhcmF0aW9uIG9iamVjdHMuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHBhcnNlU3RhdGVtZW50KCBzdGF0ZW1lbnQsIHByZWNpc2lvbnMgKSB7XHJcbiAgICAgICAgLy8gc3BsaXQgc3RhdGVtZW50IG9uIGNvbW1hc1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gWyAndW5pZm9ybSBoaWdocCBtYXQ0IEFbMTBdJywgJ0InLCAnQ1syXScgXVxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgdmFyIGNvbW1hU3BsaXQgPSBzdGF0ZW1lbnQuc3BsaXQoJywnKS5tYXAoIGZ1bmN0aW9uKCBlbGVtICkge1xyXG4gICAgICAgICAgICByZXR1cm4gZWxlbS50cmltKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHNwbGl0IGRlY2xhcmF0aW9uIGhlYWRlciBmcm9tIHN0YXRlbWVudFxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gWyAndW5pZm9ybScsICdoaWdocCcsICdtYXQ0JywgJ0FbMTBdJyBdXHJcbiAgICAgICAgLy9cclxuICAgICAgICB2YXIgaGVhZGVyID0gY29tbWFTcGxpdC5zaGlmdCgpLnNwbGl0KCcgJyk7XHJcblxyXG4gICAgICAgIC8vIHF1YWxpZmllciBpcyBhbHdheXMgZmlyc3QgZWxlbWVudFxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gJ3VuaWZvcm0nXHJcbiAgICAgICAgLy9cclxuICAgICAgICB2YXIgcXVhbGlmaWVyID0gaGVhZGVyLnNoaWZ0KCk7XHJcblxyXG4gICAgICAgIC8vIHByZWNpc2lvbiBtYXkgb3IgbWF5IG5vdCBiZSBkZWNsYXJlZFxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gJ2hpZ2hwJyB8fCAoaWYgaXQgd2FzIG9taXRlZCkgJ21hdDQnXHJcbiAgICAgICAgLy9cclxuICAgICAgICB2YXIgcHJlY2lzaW9uID0gaGVhZGVyLnNoaWZ0KCk7XHJcbiAgICAgICAgdmFyIHR5cGU7XHJcbiAgICAgICAgLy8gaWYgbm90IGEgcHJlY2lzaW9uIGtleXdvcmQgaXQgaXMgdGhlIHR5cGUgaW5zdGVhZFxyXG4gICAgICAgIGlmICggIVBSRUNJU0lPTl9RVUFMSUZJRVJTWyBwcmVjaXNpb24gXSApIHtcclxuICAgICAgICAgICAgdHlwZSA9IHByZWNpc2lvbjtcclxuICAgICAgICAgICAgcHJlY2lzaW9uID0gcHJlY2lzaW9uc1sgUFJFQ0lTSU9OX1RZUEVTWyB0eXBlIF0gXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0eXBlID0gaGVhZGVyLnNoaWZ0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBsYXN0IHBhcnQgb2YgaGVhZGVyIHdpbGwgYmUgdGhlIGZpcnN0LCBhbmQgcG9zc2libGUgb25seSB2YXJpYWJsZSBuYW1lXHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBbICdBWzEwXScsICdCJywgJ0NbMl0nIF1cclxuICAgICAgICAvL1xyXG4gICAgICAgIHZhciBuYW1lcyA9IGhlYWRlci5jb25jYXQoIGNvbW1hU3BsaXQgKTtcclxuICAgICAgICAvLyBpZiB0aGVyZSBhcmUgb3RoZXIgbmFtZXMgYWZ0ZXIgYSAnLCcgYWRkIHRoZW0gYXMgd2VsbFxyXG4gICAgICAgIHZhciByZXN1bHRzID0gW107XHJcbiAgICAgICAgbmFtZXMuZm9yRWFjaCggZnVuY3Rpb24oIG5hbWUgKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCggcGFyc2VOYW1lQW5kQ291bnQoIHF1YWxpZmllciwgcHJlY2lzaW9uLCB0eXBlLCBuYW1lICkgKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNwbGl0cyB0aGUgc291cmNlIHN0cmluZyBieSBzZW1pLWNvbG9ucyBhbmQgY29uc3RydWN0cyBhbiBhcnJheSBvZlxyXG4gICAgICogZGVjbGFyYXRpb24gb2JqZWN0cyBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgcXVhbGlmaWVyIGtleXdvcmRzLlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc291cmNlIC0gVGhlIHNoYWRlciBzb3VyY2Ugc3RyaW5nLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IGtleXdvcmRzIC0gVGhlIHF1YWxpZmllciBkZWNsYXJhdGlvbiBrZXl3b3Jkcy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBhcnJheSBvZiBxdWFsaWZpZXIgZGVjbGFyYXRpb24gb2JqZWN0cy5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcGFyc2VTb3VyY2UoIHNvdXJjZSwga2V5d29yZHMgKSB7XHJcbiAgICAgICAgLy8gcmVtb3ZlIGFsbCBjb21tZW50cyBmcm9tIHNvdXJjZVxyXG4gICAgICAgIHZhciBjb21tZW50bGVzc1NvdXJjZSA9IHN0cmlwQ29tbWVudHMoIHNvdXJjZSApO1xyXG4gICAgICAgIC8vIG5vcm1hbGl6ZSBhbGwgd2hpdGVzcGFjZSBpbiB0aGUgc291cmNlXHJcbiAgICAgICAgdmFyIG5vcm1hbGl6ZWQgPSBub3JtYWxpemVXaGl0ZXNwYWNlKCBjb21tZW50bGVzc1NvdXJjZSApO1xyXG4gICAgICAgIC8vIGdldCBpbmRpdmlkdWFsIHN0YXRlbWVudHMgKCBhbnkgc2VxdWVuY2UgZW5kaW5nIGluIDsgKVxyXG4gICAgICAgIHZhciBzdGF0ZW1lbnRzID0gbm9ybWFsaXplZC5zcGxpdCgnOycpO1xyXG4gICAgICAgIC8vIGJ1aWxkIHJlZ2V4IGZvciBwYXJzaW5nIHN0YXRlbWVudHMgd2l0aCB0YXJnZXR0ZWQga2V5d29yZHNcclxuICAgICAgICB2YXIga2V5d29yZFN0ciA9IGtleXdvcmRzLmpvaW4oJ3wnKTtcclxuICAgICAgICB2YXIga2V5d29yZFJlZ2V4ID0gbmV3IFJlZ0V4cCggJy4qXFxcXGIoJyArIGtleXdvcmRTdHIgKyAnKVxcXFxiLionICk7XHJcbiAgICAgICAgLy8gcGFyc2UgYW5kIHN0b3JlIGdsb2JhbCBwcmVjaXNpb24gc3RhdGVtZW50cyBhbmQgYW55IGRlY2xhcmF0aW9uc1xyXG4gICAgICAgIHZhciBwcmVjaXNpb25zID0ge307XHJcbiAgICAgICAgdmFyIG1hdGNoZWQgPSBbXTtcclxuICAgICAgICAvLyBmb3IgZWFjaCBzdGF0ZW1lbnRcclxuICAgICAgICBzdGF0ZW1lbnRzLmZvckVhY2goIGZ1bmN0aW9uKCBzdGF0ZW1lbnQgKSB7XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHByZWNpc2lvbiBzdGF0ZW1lbnRcclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgLy8gWyAncHJlY2lzaW9uIGhpZ2hwIGZsb2F0JywgJ3ByZWNpc2lvbicsICdoaWdocCcsICdmbG9hdCcgXVxyXG4gICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICB2YXIgcG1hdGNoID0gc3RhdGVtZW50Lm1hdGNoKCBQUkVDSVNJT05fUkVHRVggKTtcclxuICAgICAgICAgICAgaWYgKCBwbWF0Y2ggKSB7XHJcbiAgICAgICAgICAgICAgICBwcmVjaXNpb25zWyBwbWF0Y2hbM10gXSA9IHBtYXRjaFsyXTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBjaGVjayBmb3Iga2V5d29yZHNcclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgLy8gWyAndW5pZm9ybSBmbG9hdCB0aW1lJyBdXHJcbiAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgIHZhciBrbWF0Y2ggPSBzdGF0ZW1lbnQubWF0Y2goIGtleXdvcmRSZWdleCApO1xyXG4gICAgICAgICAgICBpZiAoIGttYXRjaCApIHtcclxuICAgICAgICAgICAgICAgIC8vIHBhcnNlIHN0YXRlbWVudCBhbmQgYWRkIHRvIGFycmF5XHJcbiAgICAgICAgICAgICAgICBtYXRjaGVkID0gbWF0Y2hlZC5jb25jYXQoIHBhcnNlU3RhdGVtZW50KCBrbWF0Y2hbMF0sIHByZWNpc2lvbnMgKSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIG1hdGNoZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaWx0ZXJzIG91dCBkdXBsaWNhdGUgZGVjbGFyYXRpb25zIHByZXNlbnQgYmV0d2VlbiBzaGFkZXJzLlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBkZWNsYXJhdGlvbnMgLSBUaGUgYXJyYXkgb2YgZGVjbGFyYXRpb25zLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gVGhlIGZpbHRlcmVkIGFycmF5IG9mIGRlY2xhcmF0aW9ucy5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZmlsdGVyRHVwbGljYXRlc0J5TmFtZSggZGVjbGFyYXRpb25zICkge1xyXG4gICAgICAgIC8vIGluIGNhc2VzIHdoZXJlIHRoZSBzYW1lIGRlY2xhcmF0aW9ucyBhcmUgcHJlc2VudCBpbiBtdWx0aXBsZVxyXG4gICAgICAgIC8vIHNvdXJjZXMsIHRoaXMgZnVuY3Rpb24gd2lsbCByZW1vdmUgZHVwbGljYXRlcyBmcm9tIHRoZSByZXN1bHRzXHJcbiAgICAgICAgdmFyIHNlZW4gPSB7fTtcclxuICAgICAgICByZXR1cm4gZGVjbGFyYXRpb25zLmZpbHRlciggZnVuY3Rpb24oIGRlY2xhcmF0aW9uICkge1xyXG4gICAgICAgICAgICBpZiAoIHNlZW5bIGRlY2xhcmF0aW9uLm5hbWUgXSApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZWVuWyBkZWNsYXJhdGlvbi5uYW1lIF0gPSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUGFyc2VzIHRoZSBwcm92aWRlZCBHTFNMIHNvdXJjZSwgYW5kIHJldHVybnMgYWxsIGRlY2xhcmF0aW9uIHN0YXRlbWVudHMgdGhhdCBjb250YWluIHRoZSBwcm92aWRlZCBxdWFsaWZpZXIgdHlwZS4gVGhpcyBjYW4gYmUgdXNlZCB0byBleHRyYWN0IGFsbCBhdHRyaWJ1dGVzIGFuZCB1bmlmb3JtIG5hbWVzIGFuZCB0eXBlcyBmcm9tIGEgc2hhZGVyLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogRm9yIGV4YW1wbGUsIHdoZW4gcHJvdmlkZWQgYSAndW5pZm9ybScgcXVhbGlmaWVycywgdGhlIGRlY2xhcmF0aW9uOlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogICAgICd1bmlmb3JtIGhpZ2hwIHZlYzMgdVNwZWN1bGFyQ29sb3I7J1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogV291bGQgYmUgcGFyc2VkIHRvOlxyXG4gICAgICAgICAqICAgICB7XHJcbiAgICAgICAgICogICAgICAgICBxdWFsaWZpZXI6ICd1bmlmb3JtJyxcclxuICAgICAgICAgKiAgICAgICAgIHR5cGU6ICd2ZWMzJyxcclxuICAgICAgICAgKiAgICAgICAgIG5hbWU6ICd1U3BlY3VsYXJDb2xvcicsXHJcbiAgICAgICAgICogICAgICAgICBjb3VudDogMVxyXG4gICAgICAgICAqICAgICB9XHJcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHNvdXJjZXMgLSBUaGUgc2hhZGVyIHNvdXJjZXMuXHJcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHF1YWxpZmllcnMgLSBUaGUgcXVhbGlmaWVycyB0byBleHRyYWN0LlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fSBUaGUgYXJyYXkgb2YgcXVhbGlmaWVyIGRlY2xhcmF0aW9uIHN0YXRlbWVudHMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcGFyc2VEZWNsYXJhdGlvbnM6IGZ1bmN0aW9uKCBzb3VyY2VzLCBxdWFsaWZpZXJzICkge1xyXG4gICAgICAgICAgICAvLyBpZiBubyBzb3VyY2VzIG9yIHF1YWxpZmllcnMgYXJlIHByb3ZpZGVkLCByZXR1cm4gZW1wdHkgYXJyYXlcclxuICAgICAgICAgICAgaWYgKCAhcXVhbGlmaWVycyB8fCBxdWFsaWZpZXJzLmxlbmd0aCA9PT0gMCB8fFxyXG4gICAgICAgICAgICAgICAgIXNvdXJjZXMgfHwgc291cmNlcy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc291cmNlcyA9ICggc291cmNlcyBpbnN0YW5jZW9mIEFycmF5ICkgPyBzb3VyY2VzIDogWyBzb3VyY2VzIF07XHJcbiAgICAgICAgICAgIHF1YWxpZmllcnMgPSAoIHF1YWxpZmllcnMgaW5zdGFuY2VvZiBBcnJheSApID8gcXVhbGlmaWVycyA6IFsgcXVhbGlmaWVycyBdO1xyXG4gICAgICAgICAgICAvLyBwYXJzZSBvdXQgdGFyZ2V0dGVkIGRlY2xhcmF0aW9uc1xyXG4gICAgICAgICAgICB2YXIgZGVjbGFyYXRpb25zID0gW107XHJcbiAgICAgICAgICAgIHNvdXJjZXMuZm9yRWFjaCggZnVuY3Rpb24oIHNvdXJjZSApIHtcclxuICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9ucyA9IGRlY2xhcmF0aW9ucy5jb25jYXQoIHBhcnNlU291cmNlKCBzb3VyY2UsIHF1YWxpZmllcnMgKSApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gcmVtb3ZlIGR1cGxpY2F0ZXMgYW5kIHJldHVyblxyXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyRHVwbGljYXRlc0J5TmFtZSggZGVjbGFyYXRpb25zICk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGV0ZWN0cyBiYXNlZCBvbiB0aGUgZXhpc3RlbmNlIG9mIGEgJ3ZvaWQgbWFpbigpIHsnIHN0YXRlbWVudCwgaWYgdGhlIHN0cmluZyBpcyBnbHNsIHNvdXJjZSBjb2RlLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHN0ciAtIFRoZSBpbnB1dCBzdHJpbmcgdG8gdGVzdC5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIFRydWUgaWYgdGhlIHN0cmluZyBpcyBnbHNsIGNvZGUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaXNHTFNMOiBmdW5jdGlvbiggc3RyICkge1xyXG4gICAgICAgICAgICByZXR1cm4gR0xTTF9SRUdFWFAudGVzdCggc3RyICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgV2ViR0xDb250ZXh0ID0gcmVxdWlyZSgnLi9XZWJHTENvbnRleHQnKTtcclxuICAgIHZhciBXZWJHTENvbnRleHRTdGF0ZSA9IHJlcXVpcmUoJy4vV2ViR0xDb250ZXh0U3RhdGUnKTtcclxuICAgIHZhciBVdGlsID0gcmVxdWlyZSgnLi4vdXRpbC9VdGlsJyk7XHJcbiAgICB2YXIgTUFHX0ZJTFRFUlMgPSB7XHJcbiAgICAgICAgTkVBUkVTVDogdHJ1ZSxcclxuICAgICAgICBMSU5FQVI6IHRydWVcclxuICAgIH07XHJcbiAgICB2YXIgTUlOX0ZJTFRFUlMgPSB7XHJcbiAgICAgICAgTkVBUkVTVDogdHJ1ZSxcclxuICAgICAgICBMSU5FQVI6IHRydWUsXHJcbiAgICAgICAgTkVBUkVTVF9NSVBNQVBfTkVBUkVTVDogdHJ1ZSxcclxuICAgICAgICBMSU5FQVJfTUlQTUFQX05FQVJFU1Q6IHRydWUsXHJcbiAgICAgICAgTkVBUkVTVF9NSVBNQVBfTElORUFSOiB0cnVlLFxyXG4gICAgICAgIExJTkVBUl9NSVBNQVBfTElORUFSOiB0cnVlXHJcbiAgICB9O1xyXG4gICAgdmFyIE5PTl9NSVBNQVBfTUlOX0ZJTFRFUlMgPSB7XHJcbiAgICAgICAgTkVBUkVTVDogdHJ1ZSxcclxuICAgICAgICBMSU5FQVI6IHRydWUsXHJcbiAgICB9O1xyXG4gICAgdmFyIE1JUE1BUF9NSU5fRklMVEVSUyA9IHtcclxuICAgICAgICBORUFSRVNUX01JUE1BUF9ORUFSRVNUOiB0cnVlLFxyXG4gICAgICAgIExJTkVBUl9NSVBNQVBfTkVBUkVTVDogdHJ1ZSxcclxuICAgICAgICBORUFSRVNUX01JUE1BUF9MSU5FQVI6IHRydWUsXHJcbiAgICAgICAgTElORUFSX01JUE1BUF9MSU5FQVI6IHRydWVcclxuICAgIH07XHJcbiAgICB2YXIgV1JBUF9NT0RFUyA9IHtcclxuICAgICAgICBSRVBFQVQ6IHRydWUsXHJcbiAgICAgICAgTUlSUk9SRURfUkVQRUFUOiB0cnVlLFxyXG4gICAgICAgIENMQU1QX1RPX0VER0U6IHRydWVcclxuICAgIH07XHJcbiAgICB2YXIgREVQVEhfVFlQRVMgPSB7XHJcbiAgICAgICAgREVQVEhfQ09NUE9ORU5UOiB0cnVlLFxyXG4gICAgICAgIERFUFRIX1NURU5DSUw6IHRydWVcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGVmYXVsdCB0eXBlIGZvciB0ZXh0dXJlcy5cclxuICAgICAqL1xyXG4gICAgdmFyIERFRkFVTFRfVFlQRSA9ICdVTlNJR05FRF9CWVRFJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IGZvcm1hdCBmb3IgdGV4dHVyZXMuXHJcbiAgICAgKi9cclxuICAgIHZhciBERUZBVUxUX0ZPUk1BVCA9ICdSR0JBJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IHdyYXAgbW9kZSBmb3IgdGV4dHVyZXMuXHJcbiAgICAgKi9cclxuICAgIHZhciBERUZBVUxUX1dSQVAgPSAnUkVQRUFUJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IG1pbiAvIG1hZyBmaWx0ZXIgZm9yIHRleHR1cmVzLlxyXG4gICAgICovXHJcbiAgICB2YXIgREVGQVVMVF9GSUxURVIgPSAnTElORUFSJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IGZvciB3aGV0aGVyIGFscGhhIHByZW11bHRpcGx5aW5nIGlzIGVuYWJsZWQuXHJcbiAgICAgKi9cclxuICAgIHZhciBERUZBVUxUX1BSRU1VTFRJUExZX0FMUEhBID0gdHJ1ZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IGZvciB3aGV0aGVyIG1pcG1hcHBpbmcgaXMgZW5hYmxlZC5cclxuICAgICAqL1xyXG4gICAgdmFyIERFRkFVTFRfTUlQTUFQID0gdHJ1ZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IGZvciB3aGV0aGVyIGludmVydC15IGlzIGVuYWJsZWQuXHJcbiAgICAgKi9cclxuICAgIHZhciBERUZBVUxUX0lOVkVSVF9ZID0gdHJ1ZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IG1pcC1tYXBwaW5nIGZpbHRlciBzdWZmaXguXHJcbiAgICAgKi9cclxuICAgIHZhciBERUZBVUxUX01JUE1BUF9NSU5fRklMVEVSX1NVRkZJWCA9ICdfTUlQTUFQX0xJTkVBUic7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW50aWF0ZXMgYSBUZXh0dXJlMkQgb2JqZWN0LlxyXG4gICAgICogQGNsYXNzIFRleHR1cmUyRFxyXG4gICAgICogQGNsYXNzZGVzYyBBIHRleHR1cmUgY2xhc3MgdG8gcmVwcmVzZW50IGEgMkQgdGV4dHVyZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1VpbnQ4QXJyYXl8VWludDE2QXJyYXl8VWludDMyQXJyYXl8RmxvYXQzMkFycmF5fEltYWdlRGF0YXxIVE1MSW1hZ2VFbGVtZW50fEhUTUxDYW52YXNFbGVtZW50fEhUTUxWaWRlb0VsZW1lbnR9IHNwZWMuc3JjIC0gVGhlIGRhdGEgdG8gYnVmZmVyLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gVGhlIHdpZHRoIG9mIHRoZSB0ZXh0dXJlLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtIFRoZSBoZWlnaHQgb2YgdGhlIHRleHR1cmUuXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3BlYy53cmFwIC0gVGhlIHdyYXBwaW5nIHR5cGUgb3ZlciBib3RoIFMgYW5kIFQgZGltZW5zaW9uLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNwZWMud3JhcFMgLSBUaGUgd3JhcHBpbmcgdHlwZSBvdmVyIHRoZSBTIGRpbWVuc2lvbi5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzcGVjLndyYXBUIC0gVGhlIHdyYXBwaW5nIHR5cGUgb3ZlciB0aGUgVCBkaW1lbnNpb24uXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3BlYy5maWx0ZXIgLSBUaGUgbWluIC8gbWFnIGZpbHRlciB1c2VkIGR1cmluZyBzY2FsaW5nLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNwZWMubWluRmlsdGVyIC0gVGhlIG1pbmlmaWNhdGlvbiBmaWx0ZXIgdXNlZCBkdXJpbmcgc2NhbGluZy5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzcGVjLm1hZ0ZpbHRlciAtIFRoZSBtYWduaWZpY2F0aW9uIGZpbHRlciB1c2VkIGR1cmluZyBzY2FsaW5nLlxyXG4gICAgICogQHBhcmFtIHtib29sfSBzcGVjLm1pcE1hcCAtIFdoZXRoZXIgb3Igbm90IG1pcC1tYXBwaW5nIGlzIGVuYWJsZWQuXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2x9IHNwZWMuaW52ZXJ0WSAtIFdoZXRoZXIgb3Igbm90IGludmVydC15IGlzIGVuYWJsZWQuXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2x9IHNwZWMucHJlTXVsdGlwbHlBbHBoYSAtIFdoZXRoZXIgb3Igbm90IGFscGhhIHByZW11bHRpcGx5aW5nIGlzIGVuYWJsZWQuXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3BlYy5mb3JtYXQgLSBUaGUgdGV4dHVyZSBwaXhlbCBmb3JtYXQuXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3BlYy50eXBlIC0gVGhlIHRleHR1cmUgcGl4ZWwgY29tcG9uZW50IHR5cGUuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFRleHR1cmUyRCggc3BlYyApIHtcclxuICAgICAgICBzcGVjID0gc3BlYyB8fCB7fTtcclxuICAgICAgICAvLyBnZXQgc3BlY2lmaWMgcGFyYW1zXHJcbiAgICAgICAgc3BlYy53cmFwUyA9IHNwZWMud3JhcFMgfHwgc3BlYy53cmFwO1xyXG4gICAgICAgIHNwZWMud3JhcFQgPSBzcGVjLndyYXBUIHx8IHNwZWMud3JhcDtcclxuICAgICAgICBzcGVjLm1pbkZpbHRlciA9IHNwZWMubWluRmlsdGVyIHx8IHNwZWMuZmlsdGVyO1xyXG4gICAgICAgIHNwZWMubWFnRmlsdGVyID0gc3BlYy5tYWdGaWx0ZXIgfHwgc3BlYy5maWx0ZXI7XHJcbiAgICAgICAgLy8gc2V0IHRleHR1cmUgcGFyYW1zXHJcbiAgICAgICAgdGhpcy53cmFwUyA9IHNwZWMud3JhcFMgfHwgREVGQVVMVF9XUkFQO1xyXG4gICAgICAgIHRoaXMud3JhcFQgPSBzcGVjLndyYXBUIHx8IERFRkFVTFRfV1JBUDtcclxuICAgICAgICB0aGlzLm1pbkZpbHRlciA9IHNwZWMubWluRmlsdGVyIHx8IERFRkFVTFRfRklMVEVSO1xyXG4gICAgICAgIHRoaXMubWFnRmlsdGVyID0gc3BlYy5tYWdGaWx0ZXIgfHwgREVGQVVMVF9GSUxURVI7XHJcbiAgICAgICAgLy8gc2V0IG90aGVyIHByb3BlcnRpZXNcclxuICAgICAgICB0aGlzLm1pcE1hcCA9IHNwZWMubWlwTWFwICE9PSB1bmRlZmluZWQgPyBzcGVjLm1pcE1hcCA6IERFRkFVTFRfTUlQTUFQO1xyXG4gICAgICAgIHRoaXMuaW52ZXJ0WSA9IHNwZWMuaW52ZXJ0WSAhPT0gdW5kZWZpbmVkID8gc3BlYy5pbnZlcnRZIDogREVGQVVMVF9JTlZFUlRfWTtcclxuICAgICAgICB0aGlzLnByZU11bHRpcGx5QWxwaGEgPSBzcGVjLnByZU11bHRpcGx5QWxwaGEgIT09IHVuZGVmaW5lZCA/IHNwZWMucHJlTXVsdGlwbHlBbHBoYSA6IERFRkFVTFRfUFJFTVVMVElQTFlfQUxQSEE7XHJcbiAgICAgICAgLy8gc2V0IGZvcm1hdFxyXG4gICAgICAgIHRoaXMuZm9ybWF0ID0gc3BlYy5mb3JtYXQgfHwgREVGQVVMVF9GT1JNQVQ7XHJcbiAgICAgICAgaWYgKCBERVBUSF9UWVBFU1sgdGhpcy5mb3JtYXQgXSAmJiAhV2ViR0xDb250ZXh0LmNoZWNrRXh0ZW5zaW9uKCAnV0VCR0xfZGVwdGhfdGV4dHVyZScgKSApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ0Nhbm5vdCBjcmVhdGUgVGV4dHVyZTJEIG9mIGZvcm1hdCBgJyArIHRoaXMuZm9ybWF0ICsgJ2AgYXMgYFdFQkdMX2RlcHRoX3RleHR1cmVgIGV4dGVuc2lvbiBpcyB1bnN1cHBvcnRlZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNldCB0eXBlXHJcbiAgICAgICAgdGhpcy50eXBlID0gc3BlYy50eXBlIHx8IERFRkFVTFRfVFlQRTtcclxuICAgICAgICBpZiAoIHRoaXMudHlwZSA9PT0gJ0ZMT0FUJyAmJiAhV2ViR0xDb250ZXh0LmNoZWNrRXh0ZW5zaW9uKCAnT0VTX3RleHR1cmVfZmxvYXQnICkgKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdDYW5ub3QgY3JlYXRlIFRleHR1cmUyRCBvZiB0eXBlIGBGTE9BVGAgYXMgYE9FU190ZXh0dXJlX2Zsb2F0YCBleHRlbnNpb24gaXMgdW5zdXBwb3J0ZWQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjaGVjayBzaXplXHJcbiAgICAgICAgaWYgKCAhVXRpbC5pc0NhbnZhc1R5cGUoIHNwZWMuc3JjICkgKSB7XHJcbiAgICAgICAgICAgIC8vIGlmIG5vdCBhIGNhbnZhcyB0eXBlLCBkaW1lbnNpb25zIE1VU1QgYmUgc3BlY2lmaWVkXHJcbiAgICAgICAgICAgIGlmICggdHlwZW9mIHNwZWMud2lkdGggIT09ICdudW1iZXInIHx8IHNwZWMud2lkdGggPD0gMCApIHtcclxuICAgICAgICAgICAgICAgIHRocm93ICdgd2lkdGhgIGFyZ3VtZW50IGlzIG1pc3Npbmcgb3IgaW52YWxpZCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCB0eXBlb2Ygc3BlYy5oZWlnaHQgIT09ICdudW1iZXInIHx8IHNwZWMuaGVpZ2h0IDw9IDAgKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyAnYGhlaWdodGAgYXJndW1lbnQgaXMgbWlzc2luZyBvciBpbnZhbGlkJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIFV0aWwubXVzdEJlUG93ZXJPZlR3byggdGhpcyApICkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCAhVXRpbC5pc1Bvd2VyT2ZUd28oIHNwZWMud2lkdGggKSApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyAnUGFyYW1ldGVycyByZXF1aXJlIGEgcG93ZXItb2YtdHdvIHRleHR1cmUsIHlldCBwcm92aWRlZCB3aWR0aCBvZiAnICsgc3BlYy53aWR0aCArICcgaXMgbm90IGEgcG93ZXIgb2YgdHdvJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICggIVV0aWwuaXNQb3dlck9mVHdvKCBzcGVjLmhlaWdodCApICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdQYXJhbWV0ZXJzIHJlcXVpcmUgYSBwb3dlci1vZi10d28gdGV4dHVyZSwgeWV0IHByb3ZpZGVkIGhlaWdodCBvZiAnICsgc3BlYy5oZWlnaHQgKyAnIGlzIG5vdCBhIHBvd2VyIG9mIHR3byc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGdsID0gdGhpcy5nbCA9IFdlYkdMQ29udGV4dC5nZXQoKTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gV2ViR0xDb250ZXh0U3RhdGUuZ2V0KCBnbCApO1xyXG4gICAgICAgIC8vIGNyZWF0ZSB0ZXh0dXJlIG9iamVjdFxyXG4gICAgICAgIHRoaXMudGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcclxuICAgICAgICAvLyBidWZmZXIgdGhlIGRhdGFcclxuICAgICAgICB0aGlzLmJ1ZmZlckRhdGEoIHNwZWMuc3JjIHx8IG51bGwsIHNwZWMud2lkdGgsIHNwZWMuaGVpZ2h0ICk7XHJcbiAgICAgICAgdGhpcy5zZXRQYXJhbWV0ZXJzKCB0aGlzICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCaW5kcyB0aGUgdGV4dHVyZSBvYmplY3QgYW5kIHB1c2hlcyBpdCBvbnRvIHRoZSBzdGFjay5cclxuICAgICAqIEBtZW1iZXJvZiBUZXh0dXJlMkRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbG9jYXRpb24gLSBUaGUgdGV4dHVyZSB1bml0IGxvY2F0aW9uIGluZGV4LiBEZWZhdWx0IHRvIDAuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RleHR1cmUyRH0gVGhlIHRleHR1cmUgb2JqZWN0LCBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRleHR1cmUyRC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKCBsb2NhdGlvbiApIHtcclxuICAgICAgICBpZiAoIGxvY2F0aW9uID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKCAhVXRpbC5pc0ludGVnZXIoIGxvY2F0aW9uICkgfHwgbG9jYXRpb24gPCAwICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnVGV4dHVyZSB1bml0IGxvY2F0aW9uIGlzIGludmFsaWQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpZiB0aGlzIHRleHR1cmUgaXMgYWxyZWFkeSBib3VuZCwgbm8gbmVlZCB0byByZWJpbmRcclxuICAgICAgICBpZiAoIHRoaXMuc3RhdGUudGV4dHVyZTJEcy50b3AoIGxvY2F0aW9uICkgIT09IHRoaXMgKSB7XHJcbiAgICAgICAgICAgIHZhciBnbCA9IHRoaXMuZ2w7XHJcbiAgICAgICAgICAgIGdsLmFjdGl2ZVRleHR1cmUoIGdsWyAnVEVYVFVSRScgKyBsb2NhdGlvbiBdICk7XHJcbiAgICAgICAgICAgIGdsLmJpbmRUZXh0dXJlKCBnbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gYWRkIHRvIHN0YWNrIHVuZGVyIHRoZSB0ZXh0dXJlIHVuaXRcclxuICAgICAgICB0aGlzLnN0YXRlLnRleHR1cmUyRHMucHVzaCggbG9jYXRpb24sIHRoaXMgKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbmJpbmRzIHRoZSB0ZXh0dXJlIG9iamVjdCBhbmQgYmluZHMgdGhlIHRleHR1cmUgYmVuZWF0aCBpdCBvbiB0aGlzIHN0YWNrLiBJZiB0aGVyZSBpcyBubyB1bmRlcmx5aW5nIHRleHR1cmUsIHVuYmluZHMgdGhlIHVuaXQuXHJcbiAgICAgKiBAbWVtYmVyb2YgVGV4dHVyZTJEXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxvY2F0aW9uIC0gVGhlIHRleHR1cmUgdW5pdCBsb2NhdGlvbiBpbmRleC4gRGVmYXVsdCB0byAwLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtUZXh0dXJlMkR9IFRoZSB0ZXh0dXJlIG9iamVjdCwgZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBUZXh0dXJlMkQucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uKCBsb2NhdGlvbiApIHtcclxuICAgICAgICBpZiAoIGxvY2F0aW9uID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKCAhVXRpbC5pc0ludGVnZXIoIGxvY2F0aW9uICkgfHwgbG9jYXRpb24gPCAwICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnVGV4dHVyZSB1bml0IGxvY2F0aW9uIGlzIGludmFsaWQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgIGlmICggc3RhdGUudGV4dHVyZTJEcy50b3AoIGxvY2F0aW9uICkgIT09IHRoaXMgKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdUZXh0dXJlMkQgaXMgbm90IHRoZSB0b3AgbW9zdCBlbGVtZW50IG9uIHRoZSBzdGFjayc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXRlLnRleHR1cmUyRHMucG9wKCBsb2NhdGlvbiApO1xyXG4gICAgICAgIHZhciBnbDtcclxuICAgICAgICB2YXIgdG9wID0gc3RhdGUudGV4dHVyZTJEcy50b3AoIGxvY2F0aW9uICk7XHJcbiAgICAgICAgaWYgKCB0b3AgKSB7XHJcbiAgICAgICAgICAgIGlmICggdG9wICE9PSB0aGlzICkge1xyXG4gICAgICAgICAgICAgICAgLy8gYmluZCB1bmRlcmx5aW5nIHRleHR1cmVcclxuICAgICAgICAgICAgICAgIGdsID0gdG9wLmdsO1xyXG4gICAgICAgICAgICAgICAgZ2wuYWN0aXZlVGV4dHVyZSggZ2xbICdURVhUVVJFJyArIGxvY2F0aW9uIF0gKTtcclxuICAgICAgICAgICAgICAgIGdsLmJpbmRUZXh0dXJlKCBnbC5URVhUVVJFXzJELCB0b3AudGV4dHVyZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gdW5iaW5kXHJcbiAgICAgICAgICAgIGdsID0gdGhpcy5nbDtcclxuICAgICAgICAgICAgZ2wuYmluZFRleHR1cmUoIGdsLlRFWFRVUkVfMkQsIG51bGwgKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQnVmZmVyIGRhdGEgaW50byB0aGUgdGV4dHVyZS5cclxuICAgICAqIEBtZW1iZXJvZiBUZXh0dXJlMkRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5fEFycmF5QnVmZmVyVmlld3xudWxsfSBkYXRhIC0gVGhlIGRhdGEgYXJyYXkgdG8gYnVmZmVyLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gVGhlIHdpZHRoIG9mIHRoZSBkYXRhLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtIFRoZSBoZWlnaHQgb2YgdGhlIGRhdGEuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RleHR1cmUyRH0gVGhlIHRleHR1cmUgb2JqZWN0LCBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRleHR1cmUyRC5wcm90b3R5cGUuYnVmZmVyRGF0YSA9IGZ1bmN0aW9uKCBkYXRhLCB3aWR0aCwgaGVpZ2h0ICkge1xyXG4gICAgICAgIHZhciBnbCA9IHRoaXMuZ2w7XHJcbiAgICAgICAgdGhpcy5wdXNoKCk7XHJcbiAgICAgICAgLy8gaW52ZXJ0IHkgaWYgc3BlY2lmaWVkXHJcbiAgICAgICAgZ2wucGl4ZWxTdG9yZWkoIGdsLlVOUEFDS19GTElQX1lfV0VCR0wsIHRoaXMuaW52ZXJ0WSApO1xyXG4gICAgICAgIC8vIHByZW11bHRpcGx5IGFscGhhIGlmIHNwZWNpZmllZFxyXG4gICAgICAgIGdsLnBpeGVsU3RvcmVpKCBnbC5VTlBBQ0tfUFJFTVVMVElQTFlfQUxQSEFfV0VCR0wsIHRoaXMucHJlTXVsdGlwbHlBbHBoYSApO1xyXG4gICAgICAgIC8vIGNhc3QgYXJyYXkgYXJnXHJcbiAgICAgICAgaWYgKCBkYXRhIGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIGlmICggdGhpcy50eXBlID09PSAnVU5TSUdORURfU0hPUlQnICkge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IG5ldyBVaW50MTZBcnJheSggZGF0YSApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB0aGlzLnR5cGUgPT09ICdVTlNJR05FRF9JTlQnICkge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IG5ldyBVaW50MzJBcnJheSggZGF0YSApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB0aGlzLnR5cGUgPT09ICdGTE9BVCcgKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gbmV3IEZsb2F0MzJBcnJheSggZGF0YSApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IG5ldyBVaW50OEFycmF5KCBkYXRhICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2V0IGVuc3VyZSB0eXBlIGNvcnJlc3BvbmRzIHRvIGRhdGFcclxuICAgICAgICBpZiAoIGRhdGEgaW5zdGFuY2VvZiBVaW50OEFycmF5ICkge1xyXG4gICAgICAgICAgICB0aGlzLnR5cGUgPSAnVU5TSUdORURfQllURSc7XHJcbiAgICAgICAgfSBlbHNlIGlmICggZGF0YSBpbnN0YW5jZW9mIFVpbnQxNkFycmF5ICkge1xyXG4gICAgICAgICAgICB0aGlzLnR5cGUgPSAnVU5TSUdORURfU0hPUlQnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIGRhdGEgaW5zdGFuY2VvZiBVaW50MzJBcnJheSApIHtcclxuICAgICAgICAgICAgdGhpcy50eXBlID0gJ1VOU0lHTkVEX0lOVCc7XHJcbiAgICAgICAgfSBlbHNlIGlmICggZGF0YSBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSApIHtcclxuICAgICAgICAgICAgdGhpcy50eXBlID0gJ0ZMT0FUJztcclxuICAgICAgICB9IGVsc2UgaWYgKCBkYXRhICYmICEoIGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciApICYmICFVdGlsLmlzQ2FudmFzVHlwZSggZGF0YSApICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnQXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIGBBcnJheWAsIGBBcnJheUJ1ZmZlcmAsIGBBcnJheUJ1ZmZlclZpZXdgLCBgSW1hZ2VEYXRhYCwgYEhUTUxJbWFnZUVsZW1lbnRgLCBgSFRNTENhbnZhc0VsZW1lbnRgLCBgSFRNTFZpZGVvRWxlbWVudGAsIG9yIG51bGwnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIFV0aWwuaXNDYW52YXNUeXBlKCBkYXRhICkgKSB7XHJcbiAgICAgICAgICAgIC8vIHN0b3JlIHdpZHRoIGFuZCBoZWlnaHRcclxuICAgICAgICAgICAgdGhpcy53aWR0aCA9IGRhdGEud2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gZGF0YS5oZWlnaHQ7XHJcbiAgICAgICAgICAgIC8vIGJ1ZmZlciB0aGUgdGV4dHVyZVxyXG4gICAgICAgICAgICBnbC50ZXhJbWFnZTJEKFxyXG4gICAgICAgICAgICAgICAgZ2wuVEVYVFVSRV8yRCxcclxuICAgICAgICAgICAgICAgIDAsIC8vIG1pcC1tYXAgbGV2ZWwsXHJcbiAgICAgICAgICAgICAgICBnbFsgdGhpcy5mb3JtYXQgXSwgLy8gd2ViZ2wgcmVxdWlyZXMgZm9ybWF0ID09PSBpbnRlcm5hbEZvcm1hdFxyXG4gICAgICAgICAgICAgICAgZ2xbIHRoaXMuZm9ybWF0IF0sXHJcbiAgICAgICAgICAgICAgICBnbFsgdGhpcy50eXBlIF0sXHJcbiAgICAgICAgICAgICAgICBkYXRhICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gc3RvcmUgd2lkdGggYW5kIGhlaWdodFxyXG4gICAgICAgICAgICB0aGlzLndpZHRoID0gd2lkdGggfHwgdGhpcy53aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgICAgIC8vIGJ1ZmZlciB0aGUgdGV4dHVyZSBkYXRhXHJcbiAgICAgICAgICAgIGdsLnRleEltYWdlMkQoXHJcbiAgICAgICAgICAgICAgICBnbC5URVhUVVJFXzJELFxyXG4gICAgICAgICAgICAgICAgMCwgLy8gbWlwLW1hcCBsZXZlbFxyXG4gICAgICAgICAgICAgICAgZ2xbIHRoaXMuZm9ybWF0IF0sIC8vIHdlYmdsIHJlcXVpcmVzIGZvcm1hdCA9PT0gaW50ZXJuYWxGb3JtYXRcclxuICAgICAgICAgICAgICAgIHRoaXMud2lkdGgsXHJcbiAgICAgICAgICAgICAgICB0aGlzLmhlaWdodCxcclxuICAgICAgICAgICAgICAgIDAsIC8vIGJvcmRlciwgbXVzdCBiZSAwXHJcbiAgICAgICAgICAgICAgICBnbFsgdGhpcy5mb3JtYXQgXSxcclxuICAgICAgICAgICAgICAgIGdsWyB0aGlzLnR5cGUgXSxcclxuICAgICAgICAgICAgICAgIGRhdGEgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZ2VuZXJhdGUgbWlwIG1hcHNcclxuICAgICAgICBpZiAoIHRoaXMubWlwTWFwICkge1xyXG4gICAgICAgICAgICBnbC5nZW5lcmF0ZU1pcG1hcCggZ2wuVEVYVFVSRV8yRCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBvcCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgdGV4dHVyZSBwYXJhbWV0ZXJzLlxyXG4gICAgICogQG1lbWJlcm9mIFRleHR1cmUyRFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBUaGUgcGFyYW1ldGVycyBieSBuYW1lLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtcy53cmFwIC0gVGhlIHdyYXBwaW5nIHR5cGUgb3ZlciBib3RoIFMgYW5kIFQgZGltZW5zaW9uLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtcy53cmFwUyAtIFRoZSB3cmFwcGluZyB0eXBlIG92ZXIgdGhlIFMgZGltZW5zaW9uLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtcy53cmFwVCAtIFRoZSB3cmFwcGluZyB0eXBlIG92ZXIgdGhlIFQgZGltZW5zaW9uLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtcy5maWx0ZXIgLSBUaGUgbWluIC8gbWFnIGZpbHRlciB1c2VkIGR1cmluZyBzY2FsaW5nLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtcy5taW5GaWx0ZXIgLSBUaGUgbWluaWZpY2F0aW9uIGZpbHRlciB1c2VkIGR1cmluZyBzY2FsaW5nLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtcy5tYWdGaWx0ZXIgLSBUaGUgbWFnbmlmaWNhdGlvbiBmaWx0ZXIgdXNlZCBkdXJpbmcgc2NhbGluZy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VGV4dHVyZTJEfSBUaGUgdGV4dHVyZSBvYmplY3QsIGZvciBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgVGV4dHVyZTJELnByb3RvdHlwZS5zZXRQYXJhbWV0ZXJzID0gZnVuY3Rpb24oIHBhcmFtcyApIHtcclxuICAgICAgICB2YXIgZ2wgPSB0aGlzLmdsO1xyXG4gICAgICAgIHRoaXMucHVzaCgpO1xyXG4gICAgICAgIC8vIHNldCB3cmFwIFMgcGFyYW1ldGVyXHJcbiAgICAgICAgdmFyIHBhcmFtID0gcGFyYW1zLndyYXBTIHx8IHBhcmFtcy53cmFwO1xyXG4gICAgICAgIGlmICggcGFyYW0gKSB7XHJcbiAgICAgICAgICAgIGlmICggV1JBUF9NT0RFU1sgcGFyYW0gXSApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud3JhcFMgPSBwYXJhbTtcclxuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoIGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBnbFsgdGhpcy53cmFwUyBdICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyAnVGV4dHVyZSBwYXJhbWV0ZXIgYCcgKyBwYXJhbSArICdgIGlzIG5vdCBhIHZhbGlkIHZhbHVlIGZvciBgVEVYVFVSRV9XUkFQX1NgJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzZXQgd3JhcCBUIHBhcmFtZXRlclxyXG4gICAgICAgIHBhcmFtID0gcGFyYW1zLndyYXBUIHx8IHBhcmFtcy53cmFwO1xyXG4gICAgICAgIGlmICggcGFyYW0gKSB7XHJcbiAgICAgICAgICAgIGlmICggV1JBUF9NT0RFU1sgcGFyYW0gXSApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud3JhcFQgPSBwYXJhbTtcclxuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoIGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbFsgdGhpcy53cmFwVCBdICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyAnVGV4dHVyZSBwYXJhbWV0ZXIgYCcgKyBwYXJhbSArICdgIGlzIG5vdCBhIHZhbGlkIHZhbHVlIGZvciBgVEVYVFVSRV9XUkFQX1RgJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzZXQgbWFnIGZpbHRlciBwYXJhbWV0ZXJcclxuICAgICAgICBwYXJhbSA9IHBhcmFtcy5tYWdGaWx0ZXIgfHwgcGFyYW1zLmZpbHRlcjtcclxuICAgICAgICBpZiAoIHBhcmFtICkge1xyXG4gICAgICAgICAgICBpZiAoIE1BR19GSUxURVJTWyBwYXJhbSBdICkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYWdGaWx0ZXIgPSBwYXJhbTtcclxuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoIGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2xbIHRoaXMubWFnRmlsdGVyIF0gKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93ICdUZXh0dXJlIHBhcmFtZXRlciBgJyArIHBhcmFtICsgJ2AgaXMgbm90IGEgdmFsaWQgdmFsdWUgZm9yIGBURVhUVVJFX01BR19GSUxURVJgJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzZXQgbWluIGZpbHRlciBwYXJhbWV0ZXJcclxuICAgICAgICBwYXJhbSA9IHBhcmFtcy5taW5GaWx0ZXIgfHwgcGFyYW1zLmZpbHRlcjtcclxuICAgICAgICBpZiAoIHBhcmFtICkge1xyXG4gICAgICAgICAgICBpZiAoIHRoaXMubWlwTWFwICkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCBOT05fTUlQTUFQX01JTl9GSUxURVJTWyBwYXJhbSBdICkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHVwZ3JhZGUgdG8gbWlwLW1hcCBtaW4gZmlsdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW0gKz0gREVGQVVMVF9NSVBNQVBfTUlOX0ZJTFRFUl9TVUZGSVg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIE1JUE1BUF9NSU5fRklMVEVSU1sgcGFyYW0gXSApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1pbkZpbHRlciA9IHBhcmFtO1xyXG4gICAgICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoIGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2xbIHRoaXMubWluRmlsdGVyIF0gKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdUZXh0dXJlIHBhcmFtZXRlciBgJyArIHBhcmFtICsgJ2AgaXMgbm90IGEgdmFsaWQgdmFsdWUgZm9yIGBURVhUVVJFX01JTl9GSUxURVJgJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICggTUlOX0ZJTFRFUlNbIHBhcmFtIF0gKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5GaWx0ZXIgPSBwYXJhbTtcclxuICAgICAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKCBnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsWyB0aGlzLm1pbkZpbHRlciBdICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdUZXh0dXJlIHBhcmFtZXRlciBgJyArIHBhcmFtICsgJ2AgaXMgbm90IGEgdmFsaWQgdmFsdWUgZm9yIGBURVhUVVJFX01JTl9GSUxURVJgJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBvcCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlc2l6ZSB0aGUgdW5kZXJseWluZyB0ZXh0dXJlLiBUaGlzIGNsZWFycyB0aGUgdGV4dHVyZSBkYXRhLlxyXG4gICAgICogQG1lbWJlcm9mIFRleHR1cmUyRFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCAtIFRoZSBuZXcgd2lkdGggb2YgdGhlIHRleHR1cmUuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gVGhlIG5ldyBoZWlnaHQgb2YgdGhlIHRleHR1cmUuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1RleHR1cmUyRH0gVGhlIHRleHR1cmUgb2JqZWN0LCBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRleHR1cmUyRC5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oIHdpZHRoLCBoZWlnaHQgKSB7XHJcbiAgICAgICAgaWYgKCB0eXBlb2Ygd2lkdGggIT09ICdudW1iZXInIHx8ICggd2lkdGggPD0gMCApICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnUHJvdmlkZWQgYHdpZHRoYCBvZiAnICsgd2lkdGggKyAnIGlzIGludmFsaWQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHR5cGVvZiBoZWlnaHQgIT09ICdudW1iZXInIHx8ICggaGVpZ2h0IDw9IDAgKSApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ1Byb3ZpZGVkIGBoZWlnaHRgIG9mICcgKyBoZWlnaHQgKyAnIGlzIGludmFsaWQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJ1ZmZlckRhdGEoIG51bGwsIHdpZHRoLCBoZWlnaHQgKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUZXh0dXJlMkQ7XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgV2ViR0xDb250ZXh0ID0gcmVxdWlyZSgnLi9XZWJHTENvbnRleHQnKTtcclxuICAgIHZhciBXZWJHTENvbnRleHRTdGF0ZSA9IHJlcXVpcmUoJy4vV2ViR0xDb250ZXh0U3RhdGUnKTtcclxuICAgIHZhciBBc3luYyA9IHJlcXVpcmUoJy4uL3V0aWwvQXN5bmMnKTtcclxuICAgIHZhciBVdGlsID0gcmVxdWlyZSgnLi4vdXRpbC9VdGlsJyk7XHJcbiAgICB2YXIgSW1hZ2VMb2FkZXIgPSByZXF1aXJlKCcuLi91dGlsL0ltYWdlTG9hZGVyJyk7XHJcbiAgICB2YXIgRkFDRVMgPSBbXHJcbiAgICAgICAgJy14JywgJyt4JyxcclxuICAgICAgICAnLXknLCAnK3knLFxyXG4gICAgICAgICcteicsICcreidcclxuICAgIF07XHJcbiAgICB2YXIgRkFDRV9UQVJHRVRTID0ge1xyXG4gICAgICAgICcreic6ICdURVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1onLFxyXG4gICAgICAgICcteic6ICdURVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1onLFxyXG4gICAgICAgICcreCc6ICdURVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1gnLFxyXG4gICAgICAgICcteCc6ICdURVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1gnLFxyXG4gICAgICAgICcreSc6ICdURVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1knLFxyXG4gICAgICAgICcteSc6ICdURVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1knXHJcbiAgICB9O1xyXG4gICAgdmFyIFRBUkdFVFMgPSB7XHJcbiAgICAgICAgVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9aOiB0cnVlLFxyXG4gICAgICAgIFRFWFRVUkVfQ1VCRV9NQVBfTkVHQVRJVkVfWjogdHJ1ZSxcclxuICAgICAgICBURVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1g6IHRydWUsXHJcbiAgICAgICAgVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9YOiB0cnVlLFxyXG4gICAgICAgIFRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWTogdHJ1ZSxcclxuICAgICAgICBURVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1k6IHRydWVcclxuICAgIH07XHJcbiAgICB2YXIgTUFHX0ZJTFRFUlMgPSB7XHJcbiAgICAgICAgTkVBUkVTVDogdHJ1ZSxcclxuICAgICAgICBMSU5FQVI6IHRydWVcclxuICAgIH07XHJcbiAgICB2YXIgTUlOX0ZJTFRFUlMgPSB7XHJcbiAgICAgICAgTkVBUkVTVDogdHJ1ZSxcclxuICAgICAgICBMSU5FQVI6IHRydWUsXHJcbiAgICAgICAgTkVBUkVTVF9NSVBNQVBfTkVBUkVTVDogdHJ1ZSxcclxuICAgICAgICBMSU5FQVJfTUlQTUFQX05FQVJFU1Q6IHRydWUsXHJcbiAgICAgICAgTkVBUkVTVF9NSVBNQVBfTElORUFSOiB0cnVlLFxyXG4gICAgICAgIExJTkVBUl9NSVBNQVBfTElORUFSOiB0cnVlXHJcbiAgICB9O1xyXG4gICAgdmFyIE5PTl9NSVBNQVBfTUlOX0ZJTFRFUlMgPSB7XHJcbiAgICAgICAgTkVBUkVTVDogdHJ1ZSxcclxuICAgICAgICBMSU5FQVI6IHRydWUsXHJcbiAgICB9O1xyXG4gICAgdmFyIE1JUE1BUF9NSU5fRklMVEVSUyA9IHtcclxuICAgICAgICBORUFSRVNUX01JUE1BUF9ORUFSRVNUOiB0cnVlLFxyXG4gICAgICAgIExJTkVBUl9NSVBNQVBfTkVBUkVTVDogdHJ1ZSxcclxuICAgICAgICBORUFSRVNUX01JUE1BUF9MSU5FQVI6IHRydWUsXHJcbiAgICAgICAgTElORUFSX01JUE1BUF9MSU5FQVI6IHRydWVcclxuICAgIH07XHJcbiAgICB2YXIgV1JBUF9NT0RFUyA9IHtcclxuICAgICAgICBSRVBFQVQ6IHRydWUsXHJcbiAgICAgICAgTUlSUk9SRURfUkVQRUFUOiB0cnVlLFxyXG4gICAgICAgIENMQU1QX1RPX0VER0U6IHRydWVcclxuICAgIH07XHJcbiAgICB2YXIgRk9STUFUUyA9IHtcclxuICAgICAgICBSR0I6IHRydWUsXHJcbiAgICAgICAgUkdCQTogdHJ1ZVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IHR5cGUgZm9yIHRleHR1cmVzLlxyXG4gICAgICovXHJcbiAgICB2YXIgREVGQVVMVF9UWVBFID0gJ1VOU0lHTkVEX0JZVEUnO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlZmF1bHQgZm9ybWF0IGZvciB0ZXh0dXJlcy5cclxuICAgICAqL1xyXG4gICAgdmFyIERFRkFVTFRfRk9STUFUID0gJ1JHQkEnO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlZmF1bHQgd3JhcCBtb2RlIGZvciB0ZXh0dXJlcy5cclxuICAgICAqL1xyXG4gICAgdmFyIERFRkFVTFRfV1JBUCA9ICdDTEFNUF9UT19FREdFJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IG1pbiAvIG1hZyBmaWx0ZXIgZm9yIHRleHR1cmVzLlxyXG4gICAgICovXHJcbiAgICB2YXIgREVGQVVMVF9GSUxURVIgPSAnTElORUFSJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IGZvciB3aGV0aGVyIGFscGhhIHByZW11bHRpcGx5aW5nIGlzIGVuYWJsZWQuXHJcbiAgICAgKi9cclxuICAgIHZhciBERUZBVUxUX1BSRU1VTFRJUExZX0FMUEhBID0gdHJ1ZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IGZvciB3aGV0aGVyIG1pcG1hcHBpbmcgaXMgZW5hYmxlZC5cclxuICAgICAqL1xyXG4gICAgdmFyIERFRkFVTFRfTUlQTUFQID0gdHJ1ZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IGZvciB3aGV0aGVyIGludmVydC15IGlzIGVuYWJsZWQuXHJcbiAgICAgKi9cclxuICAgIHZhciBERUZBVUxUX0lOVkVSVF9ZID0gdHJ1ZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWZhdWx0IG1pcC1tYXBwaW5nIGZpbHRlciBzdWZmaXguXHJcbiAgICAgKi9cclxuICAgIHZhciBERUZBVUxUX01JUE1BUF9NSU5fRklMVEVSX1NVRkZJWCA9ICdfTUlQTUFQX0xJTkVBUic7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgdGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIGN1YmVtYXAgYW5kIHRocm93cyBhbiBleGNlcHRpb24gaWZcclxuICAgICAqIGl0IGRvZXMgbm90IG1lZXQgcmVxdWlyZW1lbnRzLlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1RleHR1cmVDdWJlTWFwfSBjdWJlTWFwIC0gVGhlIGN1YmUgbWFwIHRleHR1cmUgb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBjaGVja0RpbWVuc2lvbnMoIGN1YmVNYXAgKSB7XHJcbiAgICAgICAgaWYgKCB0eXBlb2YgY3ViZU1hcC53aWR0aCAhPT0gJ251bWJlcicgfHwgY3ViZU1hcC53aWR0aCA8PSAwICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnYHdpZHRoYCBhcmd1bWVudCBpcyBtaXNzaW5nIG9yIGludmFsaWQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHR5cGVvZiBjdWJlTWFwLmhlaWdodCAhPT0gJ251bWJlcicgfHwgY3ViZU1hcC5oZWlnaHQgPD0gMCApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ2BoZWlnaHRgIGFyZ3VtZW50IGlzIG1pc3Npbmcgb3IgaW52YWxpZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggY3ViZU1hcC53aWR0aCAhPT0gY3ViZU1hcC5oZWlnaHQgKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdQcm92aWRlZCBgd2lkdGhgIG11c3QgYmUgZXF1YWwgdG8gYGhlaWdodGAnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIFV0aWwubXVzdEJlUG93ZXJPZlR3byggY3ViZU1hcCApICYmICFVdGlsLmlzUG93ZXJPZlR3byggY3ViZU1hcC53aWR0aCApICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnUGFyYW1ldGVycyByZXF1aXJlIGEgcG93ZXItb2YtdHdvIHRleHR1cmUsIHlldCBwcm92aWRlZCBzaXplIG9mICcgKyBjdWJlTWFwLndpZHRoICsgJyBpcyBub3QgYSBwb3dlciBvZiB0d28nO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBmdW5jdGlvbiB0byBsb2FkIGEgZmFjZSBmcm9tIGEgdXJsLlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1RleHR1cmVDdWJlTWFwfSBjdWJlTWFwIC0gVGhlIGN1YmUgbWFwIHRleHR1cmUgb2JqZWN0LlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldCAtIFRoZSB0ZXh0dXJlIHRhcmdldC5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSBUaGUgdXJsIHRvIGxvYWQgdGhlIGZhY2UgZnJvbS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259IFRoZSBsb2FkZXIgZnVuY3Rpb24uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGxvYWRGYWNlVVJMKCBjdWJlTWFwLCB0YXJnZXQsIHVybCApIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oIGRvbmUgKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHB1dCBleHRlbnNpb24gaGFuZGxpbmcgZm9yIGFycmF5YnVmZmVyIC8gaW1hZ2UgLyB2aWRlbyBkaWZmZXJlbnRpYXRpb25cclxuICAgICAgICAgICAgSW1hZ2VMb2FkZXIubG9hZCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCBpbWFnZSApIHtcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZSA9IFV0aWwucmVzaXplQ2FudmFzKCBjdWJlTWFwLCBpbWFnZSApO1xyXG4gICAgICAgICAgICAgICAgICAgIGN1YmVNYXAuYnVmZmVyRGF0YSggdGFyZ2V0LCBpbWFnZSApO1xyXG4gICAgICAgICAgICAgICAgICAgIGRvbmUoIG51bGwgKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oIGVyciApIHtcclxuICAgICAgICAgICAgICAgICAgICBkb25lKCBlcnIsIG51bGwgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBmdW5jdGlvbiB0byBsb2FkIGEgZmFjZSBmcm9tIGEgY2FudmFzIHR5cGUgb2JqZWN0LlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1RleHR1cmVDdWJlTWFwfSBjdWJlTWFwIC0gVGhlIGN1YmUgbWFwIHRleHR1cmUgb2JqZWN0LlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldCAtIFRoZSB0ZXh0dXJlIHRhcmdldC5cclxuICAgICAqIEBwYXJhbSB7SW1hZ2VEYXRhfEhUTUxJbWFnZUVsZW1lbnR8SFRNTENhbnZhc0VsZW1lbnR8SFRNTFZpZGVvRWxlbWVudH0gY2FudmFzIC0gVGhlIGNhbnZhcyB0eXBlIG9iamVjdC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259IFRoZSBsb2FkZXIgZnVuY3Rpb24uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGxvYWRGYWNlQ2FudmFzKCBjdWJlTWFwLCB0YXJnZXQsIGNhbnZhcyApIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oIGRvbmUgKSB7XHJcbiAgICAgICAgICAgIGNhbnZhcyA9IFV0aWwucmVzaXplQ2FudmFzKCBjdWJlTWFwLCBjYW52YXMgKTtcclxuICAgICAgICAgICAgY3ViZU1hcC5idWZmZXJEYXRhKCB0YXJnZXQsIGNhbnZhcyApO1xyXG4gICAgICAgICAgICBkb25lKCBudWxsICk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBmdW5jdGlvbiB0byBsb2FkIGEgZmFjZSBmcm9tIGFuIGFycmF5IHR5cGUgb2JqZWN0LlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1RleHR1cmVDdWJlTWFwfSBjdWJlTWFwIC0gVGhlIGN1YmUgbWFwIHRleHR1cmUgb2JqZWN0LlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldCAtIFRoZSB0ZXh0dXJlIHRhcmdldC5cclxuICAgICAqIEBwYXJhbSB7QXJyYXl8QXJyYXlCdWZmZXJ8QXJyYXlCdWZmZXJWaWV3fSBhcnIgLSBUaGUgYXJyYXkgdHlwZSBvYmplY3QuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge2Z1bmN0aW9ufSBUaGUgbG9hZGVyIGZ1bmN0aW9uLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBsb2FkRmFjZUFycmF5KCBjdWJlTWFwLCB0YXJnZXQsIGFyciApIHtcclxuICAgICAgICBjaGVja0RpbWVuc2lvbnMoIGN1YmVNYXAgKTtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oIGRvbmUgKSB7XHJcbiAgICAgICAgICAgIGN1YmVNYXAuYnVmZmVyRGF0YSggdGFyZ2V0LCBhcnIgKTtcclxuICAgICAgICAgICAgZG9uZSggbnVsbCApO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW50aWF0ZXMgYSBUZXh0dXJlQ3ViZU1hcCBvYmplY3QuXHJcbiAgICAgKiBAY2xhc3MgVGV4dHVyZUN1YmVNYXBcclxuICAgICAqIEBjbGFzc2Rlc2MgQSB0ZXh0dXJlIGNsYXNzIHRvIHJlcHJlc2VudCBhIGN1YmUgbWFwIHRleHR1cmUuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNwZWMgLSBUaGUgc3BlY2lmaWNhdGlvbiBhcmd1bWVudHNcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzcGVjLmZhY2VzIC0gVGhlIGZhY2VzIHRvIGJ1ZmZlciwgdW5kZXIga2V5cyAnK3gnLCAnK3knLCAnK3onLCAnLXgnLCAnLXknLCBhbmQgJy16Jy5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzcGVjLndpZHRoIC0gVGhlIHdpZHRoIG9mIHRoZSBmYWNlcy5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzcGVjLmhlaWdodCAtIFRoZSBoZWlnaHQgb2YgdGhlIGZhY2VzLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNwZWMud3JhcCAtIFRoZSB3cmFwcGluZyB0eXBlIG92ZXIgYm90aCBTIGFuZCBUIGRpbWVuc2lvbi5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzcGVjLndyYXBTIC0gVGhlIHdyYXBwaW5nIHR5cGUgb3ZlciB0aGUgUyBkaW1lbnNpb24uXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3BlYy53cmFwVCAtIFRoZSB3cmFwcGluZyB0eXBlIG92ZXIgdGhlIFQgZGltZW5zaW9uLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNwZWMuZmlsdGVyIC0gVGhlIG1pbiAvIG1hZyBmaWx0ZXIgdXNlZCBkdXJpbmcgc2NhbGluZy5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzcGVjLm1pbkZpbHRlciAtIFRoZSBtaW5pZmljYXRpb24gZmlsdGVyIHVzZWQgZHVyaW5nIHNjYWxpbmcuXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3BlYy5tYWdGaWx0ZXIgLSBUaGUgbWFnbmlmaWNhdGlvbiBmaWx0ZXIgdXNlZCBkdXJpbmcgc2NhbGluZy5cclxuICAgICAqIEBwYXJhbSB7Ym9vbH0gc3BlYy5taXBNYXAgLSBXaGV0aGVyIG9yIG5vdCBtaXAtbWFwcGluZyBpcyBlbmFibGVkLlxyXG4gICAgICogQHBhcmFtIHtib29sfSBzcGVjLmludmVydFkgLSBXaGV0aGVyIG9yIG5vdCBpbnZlcnQteSBpcyBlbmFibGVkLlxyXG4gICAgICogQHBhcmFtIHtib29sfSBzcGVjLnByZU11bHRpcGx5QWxwaGEgLSBXaGV0aGVyIG9yIG5vdCBhbHBoYSBwcmVtdWx0aXBseWluZyBpcyBlbmFibGVkLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNwZWMuZm9ybWF0IC0gVGhlIHRleHR1cmUgcGl4ZWwgZm9ybWF0LlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHNwZWMudHlwZSAtIFRoZSB0ZXh0dXJlIHBpeGVsIGNvbXBvbmVudCB0eXBlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBUZXh0dXJlQ3ViZU1hcCggc3BlYywgY2FsbGJhY2sgKSB7XHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHZhciBnbCA9IHRoaXMuZ2wgPSBXZWJHTENvbnRleHQuZ2V0KCk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFdlYkdMQ29udGV4dFN0YXRlLmdldCggZ2wgKTtcclxuICAgICAgICB0aGlzLnRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XHJcbiAgICAgICAgLy8gZ2V0IHNwZWNpZmljIHBhcmFtc1xyXG4gICAgICAgIHNwZWMud3JhcFMgPSBzcGVjLndyYXBTIHx8IHNwZWMud3JhcDtcclxuICAgICAgICBzcGVjLndyYXBUID0gc3BlYy53cmFwVCB8fCBzcGVjLndyYXA7XHJcbiAgICAgICAgc3BlYy5taW5GaWx0ZXIgPSBzcGVjLm1pbkZpbHRlciB8fCBzcGVjLmZpbHRlcjtcclxuICAgICAgICBzcGVjLm1hZ0ZpbHRlciA9IHNwZWMubWFnRmlsdGVyIHx8IHNwZWMuZmlsdGVyO1xyXG4gICAgICAgIC8vIHNldCB0ZXh0dXJlIHBhcmFtc1xyXG4gICAgICAgIHRoaXMud3JhcFMgPSBXUkFQX01PREVTWyBzcGVjLndyYXBTIF0gPyBzcGVjLndyYXBTIDogREVGQVVMVF9XUkFQO1xyXG4gICAgICAgIHRoaXMud3JhcFQgPSBXUkFQX01PREVTWyBzcGVjLndyYXBUIF0gPyBzcGVjLndyYXBUIDogREVGQVVMVF9XUkFQO1xyXG4gICAgICAgIHRoaXMubWluRmlsdGVyID0gTUlOX0ZJTFRFUlNbIHNwZWMubWluRmlsdGVyIF0gPyBzcGVjLm1pbkZpbHRlciA6IERFRkFVTFRfRklMVEVSO1xyXG4gICAgICAgIHRoaXMubWFnRmlsdGVyID0gTUFHX0ZJTFRFUlNbIHNwZWMubWFnRmlsdGVyIF0gPyBzcGVjLm1hZ0ZpbHRlciA6IERFRkFVTFRfRklMVEVSO1xyXG4gICAgICAgIC8vIHNldCBvdGhlciBwcm9wZXJ0aWVzXHJcbiAgICAgICAgdGhpcy5taXBNYXAgPSBzcGVjLm1pcE1hcCAhPT0gdW5kZWZpbmVkID8gc3BlYy5taXBNYXAgOiBERUZBVUxUX01JUE1BUDtcclxuICAgICAgICB0aGlzLmludmVydFkgPSBzcGVjLmludmVydFkgIT09IHVuZGVmaW5lZCA/IHNwZWMuaW52ZXJ0WSA6IERFRkFVTFRfSU5WRVJUX1k7XHJcbiAgICAgICAgdGhpcy5wcmVNdWx0aXBseUFscGhhID0gc3BlYy5wcmVNdWx0aXBseUFscGhhICE9PSB1bmRlZmluZWQgPyBzcGVjLnByZU11bHRpcGx5QWxwaGEgOiBERUZBVUxUX1BSRU1VTFRJUExZX0FMUEhBO1xyXG4gICAgICAgIC8vIHNldCBmb3JtYXQgYW5kIHR5cGVcclxuICAgICAgICB0aGlzLmZvcm1hdCA9IEZPUk1BVFNbIHNwZWMuZm9ybWF0IF0gPyBzcGVjLmZvcm1hdCA6IERFRkFVTFRfRk9STUFUO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHNwZWMudHlwZSB8fCBERUZBVUxUX1RZUEU7XHJcbiAgICAgICAgaWYgKCB0aGlzLnR5cGUgPT09ICdGTE9BVCcgJiYgIVdlYkdMQ29udGV4dC5jaGVja0V4dGVuc2lvbiggJ09FU190ZXh0dXJlX2Zsb2F0JyApICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnQ2Fubm90IGNyZWF0ZSBUZXh0dXJlMkQgb2YgdHlwZSBgRkxPQVRgIGFzIGBPRVNfdGV4dHVyZV9mbG9hdGAgZXh0ZW5zaW9uIGlzIHVuc3VwcG9ydGVkJztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2V0IGRpbWVuc2lvbnMgaWYgcHJvdmlkZWRcclxuICAgICAgICB0aGlzLndpZHRoID0gc3BlYy53aWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHNwZWMuaGVpZ2h0O1xyXG4gICAgICAgIC8vIHNldCBidWZmZXJlZCBmYWNlc1xyXG4gICAgICAgIHRoaXMuYnVmZmVyZWRGYWNlcyA9IFtdO1xyXG4gICAgICAgIC8vIGNyZWF0ZSBjdWJlIG1hcCBiYXNlZCBvbiBpbnB1dFxyXG4gICAgICAgIGlmICggc3BlYy5mYWNlcyApIHtcclxuICAgICAgICAgICAgdmFyIHRhc2tzID0gW107XHJcbiAgICAgICAgICAgIEZBQ0VTLmZvckVhY2goIGZ1bmN0aW9uKCBpZCApIHtcclxuICAgICAgICAgICAgICAgIHZhciBmYWNlID0gc3BlYy5mYWNlc1sgaWQgXTtcclxuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSBGQUNFX1RBUkdFVFNbIGlkIF07XHJcbiAgICAgICAgICAgICAgICAvLyBsb2FkIGJhc2VkIG9uIHR5cGVcclxuICAgICAgICAgICAgICAgIGlmICggdHlwZW9mIGZhY2UgPT09ICdzdHJpbmcnICkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHVybFxyXG4gICAgICAgICAgICAgICAgICAgIHRhc2tzLnB1c2goIGxvYWRGYWNlVVJMKCB0aGF0LCB0YXJnZXQsIGZhY2UgKSApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggVXRpbC5pc0NhbnZhc1R5cGUoIGZhY2UgKSApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjYW52YXNcclxuICAgICAgICAgICAgICAgICAgICB0YXNrcy5wdXNoKCBsb2FkRmFjZUNhbnZhcyggdGhhdCwgdGFyZ2V0LCBmYWNlICkgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYXJyYXkgLyBhcnJheWJ1ZmZlciBvciBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgdGFza3MucHVzaCggbG9hZEZhY2VBcnJheSggdGhhdCwgdGFyZ2V0LCBmYWNlICkgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIEFzeW5jLnBhcmFsbGVsKCB0YXNrcywgZnVuY3Rpb24oIGVyciApIHtcclxuICAgICAgICAgICAgICAgIGlmICggZXJyICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICggY2FsbGJhY2sgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCBlcnIsIG51bGwgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gc2V0IHBhcmFtZXRlcnNcclxuICAgICAgICAgICAgICAgIHRoYXQuc2V0UGFyYW1ldGVycyggdGhhdCApO1xyXG4gICAgICAgICAgICAgICAgaWYgKCBjYWxsYmFjayApIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayggbnVsbCwgdGhhdCApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBudWxsXHJcbiAgICAgICAgICAgIGNoZWNrRGltZW5zaW9ucyggdGhpcyApO1xyXG4gICAgICAgICAgICBGQUNFUy5mb3JFYWNoKCBmdW5jdGlvbiggaWQgKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmJ1ZmZlckRhdGEoIEZBQ0VfVEFSR0VUU1sgaWQgXSwgbnVsbCApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gc2V0IHBhcmFtZXRlcnNcclxuICAgICAgICAgICAgdGhpcy5zZXRQYXJhbWV0ZXJzKCB0aGlzICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmluZHMgdGhlIHRleHR1cmUgb2JqZWN0IGFuZCBwdXNoZXMgaXQgdG8gb250byB0aGUgc3RhY2suXHJcbiAgICAgKiBAbWVtYmVyb2YgVGV4dHVyZUN1YmVNYXBcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbG9jYXRpb24gLSBUaGUgdGV4dHVyZSB1bml0IGxvY2F0aW9uIGluZGV4LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtUZXh0dXJlQ3ViZU1hcH0gVGhlIHRleHR1cmUgb2JqZWN0LCBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRleHR1cmVDdWJlTWFwLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oIGxvY2F0aW9uICkge1xyXG4gICAgICAgIGlmICggbG9jYXRpb24gPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgICAgbG9jYXRpb24gPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoICFVdGlsLmlzSW50ZWdlciggbG9jYXRpb24gKSB8fCBsb2NhdGlvbiA8IDAgKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdUZXh0dXJlIHVuaXQgbG9jYXRpb24gaXMgaW52YWxpZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGlmIHRoaXMgdGV4dHVyZSBpcyBhbHJlYWR5IGJvdW5kLCBubyBuZWVkIHRvIHJlYmluZFxyXG4gICAgICAgIGlmICggdGhpcy5zdGF0ZS50ZXh0dXJlQ3ViZU1hcHMudG9wKCBsb2NhdGlvbiApICE9PSB0aGlzICkge1xyXG4gICAgICAgICAgICB2YXIgZ2wgPSB0aGlzLmdsO1xyXG4gICAgICAgICAgICBnbC5hY3RpdmVUZXh0dXJlKCBnbFsgJ1RFWFRVUkUnICsgbG9jYXRpb24gXSApO1xyXG4gICAgICAgICAgICBnbC5iaW5kVGV4dHVyZSggZ2wuVEVYVFVSRV9DVUJFX01BUCwgdGhpcy50ZXh0dXJlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGFkZCB0byBzdGFjayB1bmRlciB0aGUgdGV4dHVyZSB1bml0XHJcbiAgICAgICAgdGhpcy5zdGF0ZS50ZXh0dXJlQ3ViZU1hcHMucHVzaCggbG9jYXRpb24sIHRoaXMgKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbmJpbmRzIHRoZSB0ZXh0dXJlIG9iamVjdCBhbmQgYmluZHMgdGhlIHRleHR1cmUgYmVuZWF0aCBpdCBvblxyXG4gICAgICogdGhpcyBzdGFjay4gSWYgdGhlcmUgaXMgbm8gdW5kZXJseWluZyB0ZXh0dXJlLCB1bmJpbmRzIHRoZSB1bml0LlxyXG4gICAgICogQG1lbWJlcm9mIFRleHR1cmVDdWJlTWFwXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxvY2F0aW9uIC0gVGhlIHRleHR1cmUgdW5pdCBsb2NhdGlvbiBpbmRleC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VGV4dHVyZUN1YmVNYXB9IFRoZSB0ZXh0dXJlIG9iamVjdCwgZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBUZXh0dXJlQ3ViZU1hcC5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24oIGxvY2F0aW9uICkge1xyXG4gICAgICAgIGlmICggbG9jYXRpb24gPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgICAgbG9jYXRpb24gPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoICFVdGlsLmlzSW50ZWdlciggbG9jYXRpb24gKSB8fCBsb2NhdGlvbiA8IDAgKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdUZXh0dXJlIHVuaXQgbG9jYXRpb24gaXMgaW52YWxpZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgaWYgKCBzdGF0ZS50ZXh0dXJlQ3ViZU1hcHMudG9wKCBsb2NhdGlvbiApICE9PSB0aGlzICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnVGhlIGN1cnJlbnQgdGV4dHVyZSBpcyBub3QgdGhlIHRvcCBtb3N0IGVsZW1lbnQgb24gdGhlIHN0YWNrJztcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhdGUudGV4dHVyZUN1YmVNYXBzLnBvcCggbG9jYXRpb24gKTtcclxuICAgICAgICB2YXIgZ2w7XHJcbiAgICAgICAgdmFyIHRvcCA9IHN0YXRlLnRleHR1cmVDdWJlTWFwcy50b3AoIGxvY2F0aW9uICk7XHJcbiAgICAgICAgaWYgKCB0b3AgKSB7XHJcbiAgICAgICAgICAgIGlmICggdG9wICE9PSB0aGlzICkge1xyXG4gICAgICAgICAgICAgICAgLy8gYmluZCB1bmRlcmx5aW5nIHRleHR1cmVcclxuICAgICAgICAgICAgICAgIGdsID0gdG9wLmdsO1xyXG4gICAgICAgICAgICAgICAgZ2wuYWN0aXZlVGV4dHVyZSggZ2xbICdURVhUVVJFJyArIGxvY2F0aW9uIF0gKTtcclxuICAgICAgICAgICAgICAgIGdsLmJpbmRUZXh0dXJlKCBnbC5URVhUVVJFX0NVQkVfTUFQLCB0b3AudGV4dHVyZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gdW5iaW5kXHJcbiAgICAgICAgICAgIGdsID0gdGhpcy5nbDtcclxuICAgICAgICAgICAgZ2wuYmluZFRleHR1cmUoIGdsLlRFWFRVUkVfQ1VCRV9NQVAsIG51bGwgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQnVmZmVyIGRhdGEgaW50byB0aGUgcmVzcGVjdGl2ZSBjdWJlIG1hcCBmYWNlLlxyXG4gICAgICogQG1lbWJlcm9mIFRleHR1cmVDdWJlTWFwXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldCAtIFRoZSBmYWNlIHRhcmdldC5cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fG51bGx9IGRhdGEgLSBUaGUgZmFjZSBkYXRhLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtUZXh0dXJlQ3ViZU1hcH0gVGhlIHRleHR1cmUgb2JqZWN0LCBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFRleHR1cmVDdWJlTWFwLnByb3RvdHlwZS5idWZmZXJEYXRhID0gZnVuY3Rpb24oIHRhcmdldCwgZGF0YSApIHtcclxuICAgICAgICBpZiAoICFUQVJHRVRTWyB0YXJnZXQgXSApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ1Byb3ZpZGVkIGB0YXJnZXRgIG9mICcgKyB0YXJnZXQgKyAnIGlzIGludmFsaWQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZ2wgPSB0aGlzLmdsO1xyXG4gICAgICAgIC8vIGJ1ZmZlciBmYWNlIHRleHR1cmVcclxuICAgICAgICB0aGlzLnB1c2goKTtcclxuICAgICAgICAvLyBpbnZlcnQgeSBpZiBzcGVjaWZpZWRcclxuICAgICAgICBnbC5waXhlbFN0b3JlaSggZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgdGhpcy5pbnZlcnRZICk7XHJcbiAgICAgICAgLy8gcHJlbXVsdGlwbHkgYWxwaGEgaWYgc3BlY2lmaWVkXHJcbiAgICAgICAgZ2wucGl4ZWxTdG9yZWkoIGdsLlVOUEFDS19QUkVNVUxUSVBMWV9BTFBIQV9XRUJHTCwgdGhpcy5wcmVNdWx0aXBseUFscGhhICk7XHJcbiAgICAgICAgLy8gY2FzdCBhcnJheSBhcmdcclxuICAgICAgICBpZiAoIGRhdGEgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgaWYgKCB0aGlzLnR5cGUgPT09ICdVTlNJR05FRF9TSE9SVCcgKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gbmV3IFVpbnQxNkFycmF5KCBkYXRhICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHRoaXMudHlwZSA9PT0gJ1VOU0lHTkVEX0lOVCcgKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gbmV3IFVpbnQzMkFycmF5KCBkYXRhICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHRoaXMudHlwZSA9PT0gJ0ZMT0FUJyApIHtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KCBkYXRhICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoIGRhdGEgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzZXQgZW5zdXJlIHR5cGUgY29ycmVzcG9uZHMgdG8gZGF0YVxyXG4gICAgICAgIGlmICggZGF0YSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHlwZSA9ICdVTlNJR05FRF9CWVRFJztcclxuICAgICAgICB9IGVsc2UgaWYgKCBkYXRhIGluc3RhbmNlb2YgVWludDE2QXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHlwZSA9ICdVTlNJR05FRF9TSE9SVCc7XHJcbiAgICAgICAgfSBlbHNlIGlmICggZGF0YSBpbnN0YW5jZW9mIFVpbnQzMkFycmF5ICkge1xyXG4gICAgICAgICAgICB0aGlzLnR5cGUgPSAnVU5TSUdORURfSU5UJztcclxuICAgICAgICB9IGVsc2UgaWYgKCBkYXRhIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICkge1xyXG4gICAgICAgICAgICB0aGlzLnR5cGUgPSAnRkxPQVQnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIGRhdGEgJiYgISggZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyICkgJiYgIVV0aWwuaXNDYW52YXNUeXBlKCBkYXRhICkgKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdBcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgYEFycmF5YCwgYEFycmF5QnVmZmVyYCwgYEFycmF5QnVmZmVyVmlld2AsIGBJbWFnZURhdGFgLCBgSFRNTEltYWdlRWxlbWVudGAsIGBIVE1MQ2FudmFzRWxlbWVudGAsIGBIVE1MVmlkZW9FbGVtZW50YCwgb3IgbnVsbCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGJ1ZmZlciB0aGUgZGF0YVxyXG4gICAgICAgIGlmICggVXRpbC5pc0NhbnZhc1R5cGUoIGRhdGEgKSApIHtcclxuICAgICAgICAgICAgLy8gc3RvcmUgd2lkdGggYW5kIGhlaWdodFxyXG4gICAgICAgICAgICB0aGlzLndpZHRoID0gZGF0YS53aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBkYXRhLmhlaWdodDtcclxuICAgICAgICAgICAgLy8gYnVmZmVyIHRoZSB0ZXh0dXJlXHJcbiAgICAgICAgICAgIGdsLnRleEltYWdlMkQoXHJcbiAgICAgICAgICAgICAgICBnbFsgdGFyZ2V0IF0sXHJcbiAgICAgICAgICAgICAgICAwLCAvLyBtaXAtbWFwIGxldmVsLFxyXG4gICAgICAgICAgICAgICAgZ2xbIHRoaXMuZm9ybWF0IF0sIC8vIHdlYmdsIHJlcXVpcmVzIGZvcm1hdCA9PT0gaW50ZXJuYWxGb3JtYXRcclxuICAgICAgICAgICAgICAgIGdsWyB0aGlzLmZvcm1hdCBdLFxyXG4gICAgICAgICAgICAgICAgZ2xbIHRoaXMudHlwZSBdLFxyXG4gICAgICAgICAgICAgICAgZGF0YSApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGJ1ZmZlciB0aGUgdGV4dHVyZSBkYXRhXHJcbiAgICAgICAgICAgIGdsLnRleEltYWdlMkQoXHJcbiAgICAgICAgICAgICAgICBnbFsgdGFyZ2V0IF0sXHJcbiAgICAgICAgICAgICAgICAwLCAvLyBtaXAtbWFwIGxldmVsXHJcbiAgICAgICAgICAgICAgICBnbFsgdGhpcy5mb3JtYXQgXSwgLy8gd2ViZ2wgcmVxdWlyZXMgZm9ybWF0ID09PSBpbnRlcm5hbEZvcm1hdFxyXG4gICAgICAgICAgICAgICAgdGhpcy53aWR0aCxcclxuICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgMCwgLy8gYm9yZGVyLCBtdXN0IGJlIDBcclxuICAgICAgICAgICAgICAgIGdsWyB0aGlzLmZvcm1hdCBdLFxyXG4gICAgICAgICAgICAgICAgZ2xbIHRoaXMudHlwZSBdLFxyXG4gICAgICAgICAgICAgICAgZGF0YSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0cmFjayB0aGF0IGZhY2Ugd2FzIGJ1ZmZlcmVkXHJcbiAgICAgICAgaWYgKCB0aGlzLmJ1ZmZlcmVkRmFjZXMuaW5kZXhPZiggdGFyZ2V0ICkgPCAwICkge1xyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlcmVkRmFjZXMucHVzaCggdGFyZ2V0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGlmIGFsbCBmYWNlcyBidWZmZXJlZCwgZ2VuZXJhdGUgbWlwbWFwc1xyXG4gICAgICAgIGlmICggdGhpcy5taXBNYXAgJiYgdGhpcy5idWZmZXJlZEZhY2VzLmxlbmd0aCA9PT0gNiApIHtcclxuICAgICAgICAgICAgLy8gb25seSBnZW5lcmF0ZSBtaXBtYXBzIGlmIGFsbCBmYWNlcyBhcmUgYnVmZmVyZWRcclxuICAgICAgICAgICAgZ2wuZ2VuZXJhdGVNaXBtYXAoIGdsLlRFWFRVUkVfQ1VCRV9NQVAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wb3AoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIHRleHR1cmUgcGFyYW1ldGVycy5cclxuICAgICAqIEBtZW1iZXJvZiBUZXh0dXJlQ3ViZU1hcFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgLSBUaGUgcGFyYW1ldGVycyBieSBuYW1lLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtcy53cmFwIC0gVGhlIHdyYXBwaW5nIHR5cGUgb3ZlciBib3RoIFMgYW5kIFQgZGltZW5zaW9uLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtcy53cmFwUyAtIFRoZSB3cmFwcGluZyB0eXBlIG92ZXIgdGhlIFMgZGltZW5zaW9uLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtcy53cmFwVCAtIFRoZSB3cmFwcGluZyB0eXBlIG92ZXIgdGhlIFQgZGltZW5zaW9uLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtcy5maWx0ZXIgLSBUaGUgbWluIC8gbWFnIGZpbHRlciB1c2VkIGR1cmluZyBzY2FsaW5nLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtcy5taW5GaWx0ZXIgLSBUaGUgbWluaWZpY2F0aW9uIGZpbHRlciB1c2VkIGR1cmluZyBzY2FsaW5nLlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtcy5tYWdGaWx0ZXIgLSBUaGUgbWFnbmlmaWNhdGlvbiBmaWx0ZXIgdXNlZCBkdXJpbmcgc2NhbGluZy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VGV4dHVyZUN1YmVNYXB9IFRoZSB0ZXh0dXJlIG9iamVjdCwgZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBUZXh0dXJlQ3ViZU1hcC5wcm90b3R5cGUuc2V0UGFyYW1ldGVycyA9IGZ1bmN0aW9uKCBwYXJhbXMgKSB7XHJcbiAgICAgICAgdmFyIGdsID0gdGhpcy5nbDtcclxuICAgICAgICB0aGlzLnB1c2goKTtcclxuICAgICAgICAvLyBzZXQgd3JhcCBTIHBhcmFtZXRlclxyXG4gICAgICAgIHZhciBwYXJhbSA9IHBhcmFtcy53cmFwUyB8fCBwYXJhbXMud3JhcDtcclxuICAgICAgICBpZiAoIHBhcmFtICkge1xyXG4gICAgICAgICAgICBpZiAoIFdSQVBfTU9ERVNbIHBhcmFtIF0gKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndyYXBTID0gcGFyYW07XHJcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKCBnbC5URVhUVVJFX0NVQkVfTUFQLCBnbC5URVhUVVJFX1dSQVBfUywgZ2xbIHRoaXMud3JhcFMgXSApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgJ1RleHR1cmUgcGFyYW1ldGVyIGAnICsgcGFyYW0gKyAnYCBpcyBub3QgYSB2YWxpZCB2YWx1ZSBmb3IgYFRFWFRVUkVfV1JBUF9TYCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2V0IHdyYXAgVCBwYXJhbWV0ZXJcclxuICAgICAgICBwYXJhbSA9IHBhcmFtcy53cmFwVCB8fCBwYXJhbXMud3JhcDtcclxuICAgICAgICBpZiAoIHBhcmFtICkge1xyXG4gICAgICAgICAgICBpZiAoIFdSQVBfTU9ERVNbIHBhcmFtIF0gKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndyYXBUID0gcGFyYW07XHJcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKCBnbC5URVhUVVJFX0NVQkVfTUFQLCBnbC5URVhUVVJFX1dSQVBfVCwgZ2xbIHRoaXMud3JhcFQgXSApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgJ1RleHR1cmUgcGFyYW1ldGVyIGAnICsgcGFyYW0gKyAnYCBpcyBub3QgYSB2YWxpZCB2YWx1ZSBmb3IgYFRFWFRVUkVfV1JBUF9UYCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2V0IG1hZyBmaWx0ZXIgcGFyYW1ldGVyXHJcbiAgICAgICAgcGFyYW0gPSBwYXJhbXMubWFnRmlsdGVyIHx8IHBhcmFtcy5maWx0ZXI7XHJcbiAgICAgICAgaWYgKCBwYXJhbSApIHtcclxuICAgICAgICAgICAgaWYgKCBNQUdfRklMVEVSU1sgcGFyYW0gXSApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWFnRmlsdGVyID0gcGFyYW07XHJcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKCBnbC5URVhUVVJFX0NVQkVfTUFQLCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsWyB0aGlzLm1hZ0ZpbHRlciBdICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyAnVGV4dHVyZSBwYXJhbWV0ZXIgYCcgKyBwYXJhbSArICdgIGlzIG5vdCBhIHZhbGlkIHZhbHVlIGZvciBgVEVYVFVSRV9NQUdfRklMVEVSYCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2V0IG1pbiBmaWx0ZXIgcGFyYW1ldGVyXHJcbiAgICAgICAgcGFyYW0gPSBwYXJhbXMubWluRmlsdGVyIHx8IHBhcmFtcy5maWx0ZXI7XHJcbiAgICAgICAgaWYgKCBwYXJhbSApIHtcclxuICAgICAgICAgICAgaWYgKCB0aGlzLm1pcE1hcCApIHtcclxuICAgICAgICAgICAgICAgIGlmICggTk9OX01JUE1BUF9NSU5fRklMVEVSU1sgcGFyYW0gXSApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyB1cGdyYWRlIHRvIG1pcC1tYXAgbWluIGZpbHRlclxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtICs9IERFRkFVTFRfTUlQTUFQX01JTl9GSUxURVJfU1VGRklYO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCBNSVBNQVBfTUlOX0ZJTFRFUlNbIHBhcmFtIF0gKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5GaWx0ZXIgPSBwYXJhbTtcclxuICAgICAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKCBnbC5URVhUVVJFX0NVQkVfTUFQLCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsWyB0aGlzLm1pbkZpbHRlciBdICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyAnVGV4dHVyZSBwYXJhbWV0ZXIgYCcgKyBwYXJhbSArICdgIGlzIG5vdCBhIHZhbGlkIHZhbHVlIGZvciBgVEVYVFVSRV9NSU5fRklMVEVSYCc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIE1JTl9GSUxURVJTWyBwYXJhbSBdICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWluRmlsdGVyID0gcGFyYW07XHJcbiAgICAgICAgICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaSggZ2wuVEVYVFVSRV9DVUJFX01BUCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbFsgdGhpcy5taW5GaWx0ZXIgXSApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyAnVGV4dHVyZSBwYXJhbWV0ZXIgYCcgKyBwYXJhbSArICdgIGlzIG5vdCBhIHZhbGlkIHZhbHVlIGZvciBgVEVYVFVSRV9NSU5fRklMVEVSYCc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wb3AoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUZXh0dXJlQ3ViZU1hcDtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgV2ViR0xDb250ZXh0ID0gcmVxdWlyZSgnLi9XZWJHTENvbnRleHQnKTtcbiAgICB2YXIgV2ViR0xDb250ZXh0U3RhdGUgPSByZXF1aXJlKCcuL1dlYkdMQ29udGV4dFN0YXRlJyk7XG4gICAgdmFyIFZlcnRleFBhY2thZ2UgPSByZXF1aXJlKCcuL1ZlcnRleFBhY2thZ2UnKTtcbiAgICB2YXIgTU9ERVMgPSB7XG4gICAgICAgIFBPSU5UUzogdHJ1ZSxcbiAgICAgICAgTElORVM6IHRydWUsXG4gICAgICAgIExJTkVfU1RSSVA6IHRydWUsXG4gICAgICAgIExJTkVfTE9PUDogdHJ1ZSxcbiAgICAgICAgVFJJQU5HTEVTOiB0cnVlLFxuICAgICAgICBUUklBTkdMRV9TVFJJUDogdHJ1ZSxcbiAgICAgICAgVFJJQU5HTEVfRkFOOiB0cnVlXG4gICAgfTtcbiAgICB2YXIgVFlQRVMgPSB7XG4gICAgICAgIEZMT0FUOiB0cnVlXG4gICAgfTtcbiAgICB2YXIgQllURVNfUEVSX1RZUEUgPSB7XG4gICAgICAgIEZMT0FUOiA0XG4gICAgfTtcbiAgICB2YXIgQllURVNfUEVSX0NPTVBPTkVOVCA9IEJZVEVTX1BFUl9UWVBFLkZMT0FUO1xuICAgIHZhciBTSVpFUyA9IHtcbiAgICAgICAgMTogdHJ1ZSxcbiAgICAgICAgMjogdHJ1ZSxcbiAgICAgICAgMzogdHJ1ZSxcbiAgICAgICAgNDogdHJ1ZVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGVmYXVsdCByZW5kZXIgbW9kZSAocHJpbWl0aXZlIHR5cGUpLlxuICAgICAqL1xuICAgIHZhciBERUZBVUxUX01PREUgPSAnVFJJQU5HTEVTJztcblxuICAgIC8qKlxuICAgICAqIFRoZSBkZWZhdWx0IGJ5dGUgb2Zmc2V0IHRvIHJlbmRlciBmcm9tLlxuICAgICAqL1xuICAgIHZhciBERUZBVUxUX0JZVEVfT0ZGU0VUID0gMDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBkZWZhdWx0IGNvdW50IG9mIGluZGljZXMgdG8gcmVuZGVyLlxuICAgICAqL1xuICAgIHZhciBERUZBVUxUX0NPVU5UID0gMDtcblxuICAgIC8qKlxuICAgICAqIFBhcnNlIHRoZSBhdHRyaWJ1dGUgcG9pbnRlcnMgYW5kIGRldGVybWluZSB0aGUgYnl0ZSBzdHJpZGUgb2YgdGhlIGJ1ZmZlci5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZVBvaW50ZXJzIC0gVGhlIGF0dHJpYnV0ZSBwb2ludGVyIG1hcC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gVGhlIGJ5dGUgc3RyaWRlIG9mIHRoZSBidWZmZXIuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0U3RyaWRlKCBhdHRyaWJ1dGVQb2ludGVycyApIHtcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgb25seSBvbmUgYXR0cmlidXRlIHBvaW50ZXIgYXNzaWduZWQgdG8gdGhpcyBidWZmZXIsXG4gICAgICAgIC8vIHRoZXJlIGlzIG5vIG5lZWQgZm9yIHN0cmlkZSwgc2V0IHRvIGRlZmF1bHQgb2YgMFxuICAgICAgICB2YXIgaW5kaWNlcyA9IE9iamVjdC5rZXlzKCBhdHRyaWJ1dGVQb2ludGVycyApO1xuICAgICAgICBpZiAoIGluZGljZXMubGVuZ3RoID09PSAxICkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1heEJ5dGVPZmZzZXQgPSAwO1xuICAgICAgICB2YXIgYnl0ZVNpemVTdW0gPSAwO1xuICAgICAgICB2YXIgYnl0ZVN0cmlkZSA9IDA7XG4gICAgICAgIGluZGljZXMuZm9yRWFjaCggZnVuY3Rpb24oIGluZGV4ICkge1xuICAgICAgICAgICAgdmFyIHBvaW50ZXIgPSBhdHRyaWJ1dGVQb2ludGVyc1sgaW5kZXggXTtcbiAgICAgICAgICAgIHZhciBieXRlT2Zmc2V0ID0gcG9pbnRlci5ieXRlT2Zmc2V0O1xuICAgICAgICAgICAgdmFyIHNpemUgPSBwb2ludGVyLnNpemU7XG4gICAgICAgICAgICB2YXIgdHlwZSA9IHBvaW50ZXIudHlwZTtcbiAgICAgICAgICAgIC8vIHRyYWNrIHRoZSBzdW0gb2YgZWFjaCBhdHRyaWJ1dGUgc2l6ZVxuICAgICAgICAgICAgYnl0ZVNpemVTdW0gKz0gc2l6ZSAqIEJZVEVTX1BFUl9UWVBFWyB0eXBlIF07XG4gICAgICAgICAgICAvLyB0cmFjayB0aGUgbGFyZ2VzdCBvZmZzZXQgdG8gZGV0ZXJtaW5lIHRoZSBieXRlIHN0cmlkZSBvZiB0aGUgYnVmZmVyXG4gICAgICAgICAgICBpZiAoIGJ5dGVPZmZzZXQgPiBtYXhCeXRlT2Zmc2V0ICkge1xuICAgICAgICAgICAgICAgIG1heEJ5dGVPZmZzZXQgPSBieXRlT2Zmc2V0O1xuICAgICAgICAgICAgICAgIGJ5dGVTdHJpZGUgPSBieXRlT2Zmc2V0ICsgKCBzaXplICogQllURVNfUEVSX1RZUEVbIHR5cGUgXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gY2hlY2sgaWYgdGhlIG1heCBieXRlIG9mZnNldCBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHRoZSBzdW0gb2ZcbiAgICAgICAgLy8gdGhlIHNpemVzLiBJZiBzbyB0aGlzIGJ1ZmZlciBpcyBub3QgaW50ZXJsZWF2ZWQgYW5kIGRvZXMgbm90IG5lZWQgYVxuICAgICAgICAvLyBzdHJpZGUuXG4gICAgICAgIGlmICggbWF4Qnl0ZU9mZnNldCA+PSBieXRlU2l6ZVN1bSApIHtcbiAgICAgICAgICAgIC8vIFRPRE86IHRlc3Qgd2hhdCBzdHJpZGUgPT09IDAgZG9lcyBmb3IgYW4gaW50ZXJsZWF2ZWQgYnVmZmVyIG9mXG4gICAgICAgICAgICAvLyBsZW5ndGggPT09IDEuXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnl0ZVN0cmlkZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYXJzZSB0aGUgYXR0cmlidXRlIHBvaW50ZXJzIHRvIGVuc3VyZSB0aGV5IGFyZSB2YWxpZC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZVBvaW50ZXJzIC0gVGhlIGF0dHJpYnV0ZSBwb2ludGVyIG1hcC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IC0gVGhlIHZhbGlkYXRlZCBhdHRyaWJ1dGUgcG9pbnRlciBtYXAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0QXR0cmlidXRlUG9pbnRlcnMoIGF0dHJpYnV0ZVBvaW50ZXJzICkge1xuICAgICAgICAvLyBlbnN1cmUgdGhlcmUgYXJlIHBvaW50ZXJzIHByb3ZpZGVkXG4gICAgICAgIGlmICggIWF0dHJpYnV0ZVBvaW50ZXJzIHx8IE9iamVjdC5rZXlzKCBhdHRyaWJ1dGVQb2ludGVycyApLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgIHRocm93ICdWZXJ0ZXhCdWZmZXIgcmVxdWlyZXMgYXR0cmlidXRlIHBvaW50ZXJzIHRvIGJlIHNwZWNpZmllZCB1cG9uIGluc3RhbnRpYXRpb24nO1xuICAgICAgICB9XG4gICAgICAgIC8vIHBhcnNlIHBvaW50ZXJzIHRvIGVuc3VyZSB0aGV5IGFyZSB2YWxpZFxuICAgICAgICB2YXIgcG9pbnRlcnMgPSB7fTtcbiAgICAgICAgT2JqZWN0LmtleXMoIGF0dHJpYnV0ZVBvaW50ZXJzICkuZm9yRWFjaCggZnVuY3Rpb24oIGtleSApIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHBhcnNlSW50KCBrZXksIDEwICk7XG4gICAgICAgICAgICAvLyBjaGVjayB0aGF0IGtleSBpcyBhbiB2YWxpZCBpbnRlZ2VyXG4gICAgICAgICAgICBpZiAoIGlzTmFOKCBpbmRleCApICkge1xuICAgICAgICAgICAgICAgIHRocm93ICdBdHRyaWJ1dGUgaW5kZXggYCcgKyBrZXkgKyAnYCBkb2VzIG5vdCByZXByZXNlbnQgYW4gaW50ZWdlcic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcG9pbnRlciA9IGF0dHJpYnV0ZVBvaW50ZXJzW2tleV07XG4gICAgICAgICAgICB2YXIgc2l6ZSA9IHBvaW50ZXIuc2l6ZTtcbiAgICAgICAgICAgIHZhciB0eXBlID0gcG9pbnRlci50eXBlO1xuICAgICAgICAgICAgdmFyIGJ5dGVPZmZzZXQgPSBwb2ludGVyLmJ5dGVPZmZzZXQ7XG4gICAgICAgICAgICAvLyBjaGVjayBzaXplXG4gICAgICAgICAgICBpZiAoICFTSVpFU1sgc2l6ZSBdICkge1xuICAgICAgICAgICAgICAgIHRocm93ICdBdHRyaWJ1dGUgcG9pbnRlciBgc2l6ZWAgcGFyYW1ldGVyIGlzIGludmFsaWQsIG11c3QgYmUgb25lIG9mICcgK1xuICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSggT2JqZWN0LmtleXMoIFNJWkVTICkgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNoZWNrIHR5cGVcbiAgICAgICAgICAgIGlmICggIVRZUEVTWyB0eXBlIF0gKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgJ0F0dHJpYnV0ZSBwb2ludGVyIGB0eXBlYCBwYXJhbWV0ZXIgaXMgaW52YWxpZCwgbXVzdCBiZSBvbmUgb2YgJyArXG4gICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KCBPYmplY3Qua2V5cyggVFlQRVMgKSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9pbnRlcnNbIGluZGV4IF0gPSB7XG4gICAgICAgICAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgICAgIGJ5dGVPZmZzZXQ6ICggYnl0ZU9mZnNldCAhPT0gdW5kZWZpbmVkICkgPyBieXRlT2Zmc2V0IDogREVGQVVMVF9CWVRFX09GRlNFVFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwb2ludGVycztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBjb21wb25lbnRzIGluIHRoZSBidWZmZXIuXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVQb2ludGVycyAtIFRoZSBhdHRyaWJ1dGUgcG9pbnRlciBtYXAuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIFRoZSBudW1iZXIgb2YgY29tcG9uZW50cyBpbiB0aGUgYnVmZmVyLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldE51bUNvbXBvbmVudHMoIGF0dHJpYnV0ZVBvaW50ZXJzICkge1xuICAgICAgICB2YXIgc2l6ZSA9IDA7XG4gICAgICAgIE9iamVjdC5rZXlzKCBhdHRyaWJ1dGVQb2ludGVycyApLmZvckVhY2goIGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgICAgICAgICAgIHNpemUgKz0gYXR0cmlidXRlUG9pbnRlcnNbIGluZGV4IF0uc2l6ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzaXplO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluc3RhbnRpYXRlcyBhbiBWZXJ0ZXhCdWZmZXIgb2JqZWN0LlxuICAgICAqIEBjbGFzcyBWZXJ0ZXhCdWZmZXJcbiAgICAgKiBAY2xhc3NkZXNjIEEgdmVydGV4IGJ1ZmZlciBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0FycmF5fEZsb2F0MzJBcnJheXxWZXJ0ZXhQYWNrYWdlfG51bWJlcn0gYXJnIC0gVGhlIGJ1ZmZlciBvciBsZW5ndGggb2YgdGhlIGJ1ZmZlci5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlUG9pbnRlcnMgLSBUaGUgYXJyYXkgcG9pbnRlciBtYXAsIG9yIGluIHRoZSBjYXNlIG9mIGEgdmVydGV4IHBhY2thZ2UgYXJnLCB0aGUgb3B0aW9ucy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIFRoZSByZW5kZXJpbmcgb3B0aW9ucy5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5tb2RlIC0gVGhlIGRyYXcgbW9kZSAvIHByaW1pdGl2ZSB0eXBlLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLmJ5dGVPZmZzZXQgLSBUaGUgYnl0ZSBvZmZzZXQgaW50byB0aGUgZHJhd24gYnVmZmVyLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLmNvdW50IC0gVGhlIG51bWJlciBvZiBpbmRpY2VzIHRvIGRyYXcuXG4gICAgICovXG4gICAgZnVuY3Rpb24gVmVydGV4QnVmZmVyKCBhcmcsIGF0dHJpYnV0ZVBvaW50ZXJzLCBvcHRpb25zICkge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgdmFyIGdsID0gdGhpcy5nbCA9IFdlYkdMQ29udGV4dC5nZXQoKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFdlYkdMQ29udGV4dFN0YXRlLmdldCggZ2wgKTtcbiAgICAgICAgdGhpcy5idWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgdGhpcy5tb2RlID0gTU9ERVNbIG9wdGlvbnMubW9kZSBdID8gb3B0aW9ucy5tb2RlIDogREVGQVVMVF9NT0RFO1xuICAgICAgICB0aGlzLmNvdW50ID0gKCBvcHRpb25zLmNvdW50ICE9PSB1bmRlZmluZWQgKSA/IG9wdGlvbnMuY291bnQgOiBERUZBVUxUX0NPVU5UO1xuICAgICAgICB0aGlzLmJ5dGVPZmZzZXQgPSAoIG9wdGlvbnMuYnl0ZU9mZnNldCAhPT0gdW5kZWZpbmVkICkgPyBvcHRpb25zLmJ5dGVPZmZzZXQgOiBERUZBVUxUX0JZVEVfT0ZGU0VUO1xuICAgICAgICB0aGlzLmJ5dGVMZW5ndGggPSAwO1xuICAgICAgICAvLyBmaXJzdCwgc2V0IHRoZSBhdHRyaWJ1dGUgcG9pbnRlcnNcbiAgICAgICAgaWYgKCBhcmcgaW5zdGFuY2VvZiBWZXJ0ZXhQYWNrYWdlICkge1xuICAgICAgICAgICAgLy8gVmVydGV4UGFja2FnZSBhcmd1bWVudCwgdXNlIGl0cyBhdHRyaWJ1dGUgcG9pbnRlcnNcbiAgICAgICAgICAgIHRoaXMucG9pbnRlcnMgPSBhcmcucG9pbnRlcnM7XG4gICAgICAgICAgICAvLyBzaGlmdCBvcHRpb25zIGFyZyBzaW5jZSB0aGVyZSB3aWxsIGJlIG5vIGF0dHJpYiBwb2ludGVycyBhcmdcbiAgICAgICAgICAgIG9wdGlvbnMgPSBhdHRyaWJ1dGVQb2ludGVycyB8fCB7fTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucG9pbnRlcnMgPSBnZXRBdHRyaWJ1dGVQb2ludGVycyggYXR0cmlidXRlUG9pbnRlcnMgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzZXQgdGhlIGJ5dGUgc3RyaWRlXG4gICAgICAgIHRoaXMuYnl0ZVN0cmlkZSA9IGdldFN0cmlkZSggdGhpcy5wb2ludGVycyApO1xuICAgICAgICAvLyB0aGVuIGJ1ZmZlciB0aGUgZGF0YVxuICAgICAgICBpZiAoIGFyZyApIHtcbiAgICAgICAgICAgIGlmICggYXJnIGluc3RhbmNlb2YgVmVydGV4UGFja2FnZSApIHtcbiAgICAgICAgICAgICAgICAvLyBWZXJ0ZXhQYWNrYWdlIGFyZ3VtZW50XG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJEYXRhKCBhcmcuYnVmZmVyICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBhcmcgaW5zdGFuY2VvZiBXZWJHTEJ1ZmZlciApIHtcbiAgICAgICAgICAgICAgICAvLyBXZWJHTEJ1ZmZlciBhcmd1bWVudFxuICAgICAgICAgICAgICAgIGlmICggb3B0aW9ucy5ieXRlTGVuZ3RoID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdBcmd1bWVudCBvZiB0eXBlIGBXZWJHTEJ1ZmZlcmAgbXVzdCBiZSBjb21wbGltZW50ZWQgd2l0aCBhIGNvcnJlc3BvbmRpbmcgYG9wdGlvbnMuYnl0ZUxlbmd0aGAnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmJ5dGVMZW5ndGggPSBvcHRpb25zLmJ5dGVMZW5ndGg7XG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXIgPSBhcmc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEFycmF5IG9yIEFycmF5QnVmZmVyIG9yIG51bWJlciBhcmd1bWVudFxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyRGF0YSggYXJnICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gZW5zdXJlIHRoZXJlIGlzbid0IGFuIG92ZXJmbG93XG4gICAgICAgIHZhciBieXRlc1BlckNvdW50ID0gQllURVNfUEVSX0NPTVBPTkVOVCAqIGdldE51bUNvbXBvbmVudHMoIHRoaXMucG9pbnRlcnMgKTtcbiAgICAgICAgaWYgKCB0aGlzLmNvdW50ICogYnl0ZXNQZXJDb3VudCArIHRoaXMuYnl0ZU9mZnNldCA+IHRoaXMuYnl0ZUxlbmd0aCApIHtcbiAgICAgICAgICAgIHRocm93ICdWZXJ0ZXhCdWZmZXIgYGNvdW50YCBvZiAnICsgdGhpcy5jb3VudCArICcgYW5kIGBieXRlT2Zmc2V0YCBvZiAnICsgdGhpcy5ieXRlT2Zmc2V0ICsgJyBvdmVyZmxvd3MgdGhlIHRvdGFsIGJ5dGUgbGVuZ3RoIG9mIHRoZSBidWZmZXIgKCcgKyB0aGlzLmJ5dGVMZW5ndGggKyAnKSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGxvYWQgdmVydGV4IGRhdGEgdG8gdGhlIEdQVS5cbiAgICAgKiBAbWVtYmVyb2YgVmVydGV4QnVmZmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0FycmF5fEFycmF5QnVmZmVyfEFycmF5QnVmZmVyVmlld3xudW1iZXJ9IGFyZyAtIFRoZSBhcnJheSBvZiBkYXRhIHRvIGJ1ZmZlciwgb3Igc2l6ZSBvZiB0aGUgYnVmZmVyIGluIGJ5dGVzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge1ZlcnRleEJ1ZmZlcn0gVGhlIHZlcnRleCBidWZmZXIgb2JqZWN0IGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBWZXJ0ZXhCdWZmZXIucHJvdG90eXBlLmJ1ZmZlckRhdGEgPSBmdW5jdGlvbiggYXJnICkge1xuICAgICAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuICAgICAgICBpZiAoIGFyZyBpbnN0YW5jZW9mIEFycmF5ICkge1xuICAgICAgICAgICAgLy8gY2FzdCBhcnJheSBpbnRvIEFycmF5QnVmZmVyVmlld1xuICAgICAgICAgICAgYXJnID0gbmV3IEZsb2F0MzJBcnJheSggYXJnICk7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAhKCBhcmcgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciApICYmXG4gICAgICAgICAgICAhKCBhcmcgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSAmJlxuICAgICAgICAgICAgdHlwZW9mIGFyZyAhPT0gJ251bWJlcicgKSB7XG4gICAgICAgICAgICAvLyBpZiBub3QgYXJyYXlidWZmZXIgb3IgYSBudW1lcmljIHNpemVcbiAgICAgICAgICAgIHRocm93ICdBcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgYEFycmF5YCwgYEFycmF5QnVmZmVyYCwgYEFycmF5QnVmZmVyVmlld2AsIG9yIGBudW1iZXJgJztcbiAgICAgICAgfVxuICAgICAgICAvLyBkb24ndCBvdmVyd3JpdGUgdGhlIGNvdW50IGlmIGl0IGlzIGFscmVhZHkgc2V0XG4gICAgICAgIGlmICggdGhpcy5jb3VudCA9PT0gREVGQVVMVF9DT1VOVCApIHtcbiAgICAgICAgICAgIC8vIGdldCB0aGUgdG90YWwgbnVtYmVyIG9mIGF0dHJpYnV0ZSBjb21wb25lbnRzIGZyb20gcG9pbnRlcnNcbiAgICAgICAgICAgIHZhciBudW1Db21wb25lbnRzID0gZ2V0TnVtQ29tcG9uZW50cyggdGhpcy5wb2ludGVycyApO1xuICAgICAgICAgICAgLy8gc2V0IGNvdW50IGJhc2VkIG9uIHNpemUgb2YgYnVmZmVyIGFuZCBudW1iZXIgb2YgY29tcG9uZW50c1xuICAgICAgICAgICAgaWYgKCB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvdW50ID0gKCBhcmcgLyBCWVRFU19QRVJfQ09NUE9ORU5UICkgLyBudW1Db21wb25lbnRzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvdW50ID0gYXJnLmxlbmd0aCAvIG51bUNvbXBvbmVudHM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2V0IGJ5dGUgbGVuZ3RoXG4gICAgICAgIGlmICggdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgKSB7XG4gICAgICAgICAgICBpZiAoIGFyZyAlIEJZVEVTX1BFUl9DT01QT05FTlQgKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgJ0J5dGUgbGVuZ3RoIG11c3QgYmUgbXVsdGlwbGUgb2YgJyArIEJZVEVTX1BFUl9DT01QT05FTlQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJ5dGVMZW5ndGggPSBhcmc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmJ5dGVMZW5ndGggPSBhcmcubGVuZ3RoICogQllURVNfUEVSX0NPTVBPTkVOVDtcbiAgICAgICAgfVxuICAgICAgICAvLyBidWZmZXIgdGhlIGRhdGFcbiAgICAgICAgZ2wuYmluZEJ1ZmZlciggZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlciApO1xuICAgICAgICBnbC5idWZmZXJEYXRhKCBnbC5BUlJBWV9CVUZGRVIsIGFyZywgZ2wuU1RBVElDX0RSQVcgKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVXBsb2FkIHBhcnRpYWwgdmVydGV4IGRhdGEgdG8gdGhlIEdQVS5cbiAgICAgKiBAbWVtYmVyb2YgVmVydGV4QnVmZmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0FycmF5fEFycmF5QnVmZmVyfEFycmF5QnVmZmVyVmlld30gYXJyYXkgLSBUaGUgYXJyYXkgb2YgZGF0YSB0byBidWZmZXIuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGJ5dGVPZmZzZXQgLSBUaGUgYnl0ZSBvZmZzZXQgYXQgd2hpY2ggdG8gYnVmZmVyLlxuICAgICAqXG4gICAgICogQHJldHVybnMge1ZlcnRleEJ1ZmZlcn0gVGhlIHZlcnRleCBidWZmZXIgb2JqZWN0IGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBWZXJ0ZXhCdWZmZXIucHJvdG90eXBlLmJ1ZmZlclN1YkRhdGEgPSBmdW5jdGlvbiggYXJyYXksIGJ5dGVPZmZzZXQgKSB7XG4gICAgICAgIHZhciBnbCA9IHRoaXMuZ2w7XG4gICAgICAgIGlmICggdGhpcy5ieXRlTGVuZ3RoID09PSAwICkge1xuICAgICAgICAgICAgdGhyb3cgJ0J1ZmZlciBoYXMgbm90IHlldCBiZWVuIGFsbG9jYXRlZCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBhcnJheSBpbnN0YW5jZW9mIEFycmF5ICkge1xuICAgICAgICAgICAgYXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KCBhcnJheSApO1xuICAgICAgICB9IGVsc2UgaWYgKCAhKCBhcnJheSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyICkgJiYgIUFycmF5QnVmZmVyLmlzVmlldyggYXJyYXkgKSApIHtcbiAgICAgICAgICAgIHRocm93ICdBcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgYEFycmF5YCwgYEFycmF5QnVmZmVyYCwgb3IgYEFycmF5QnVmZmVyVmlld2AnO1xuICAgICAgICB9XG4gICAgICAgIGJ5dGVPZmZzZXQgPSAoIGJ5dGVPZmZzZXQgIT09IHVuZGVmaW5lZCApID8gYnl0ZU9mZnNldCA6IERFRkFVTFRfQllURV9PRkZTRVQ7XG4gICAgICAgIC8vIGdldCB0aGUgdG90YWwgbnVtYmVyIG9mIGF0dHJpYnV0ZSBjb21wb25lbnRzIGZyb20gcG9pbnRlcnNcbiAgICAgICAgdmFyIGJ5dGVMZW5ndGggPSBhcnJheS5sZW5ndGggKiBCWVRFU19QRVJfQ09NUE9ORU5UO1xuICAgICAgICBpZiAoIGJ5dGVPZmZzZXQgKyBieXRlTGVuZ3RoID4gdGhpcy5ieXRlTGVuZ3RoICkge1xuICAgICAgICAgICAgdGhyb3cgJ0FyZ3VtZW50IG9mIGxlbmd0aCAnICsgYnl0ZUxlbmd0aCArICcgYnl0ZXMgYW5kIG9mZnNldCBvZiAnICsgYnl0ZU9mZnNldCArICcgYnl0ZXMgb3ZlcmZsb3dzIHRoZSBidWZmZXIgbGVuZ3RoIG9mICcgKyB0aGlzLmJ5dGVMZW5ndGggKyAnIGJ5dGVzJztcbiAgICAgICAgfVxuICAgICAgICBnbC5iaW5kQnVmZmVyKCBnbC5BUlJBWV9CVUZGRVIsIHRoaXMuYnVmZmVyICk7XG4gICAgICAgIGdsLmJ1ZmZlclN1YkRhdGEoIGdsLkFSUkFZX0JVRkZFUiwgYnl0ZU9mZnNldCwgYXJyYXkgKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEJpbmRzIHRoZSB2ZXJ0ZXggYnVmZmVyIG9iamVjdC5cbiAgICAgKiBAbWVtYmVyb2YgVmVydGV4QnVmZmVyXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7VmVydGV4QnVmZmVyfSBSZXR1cm5zIHRoZSB2ZXJ0ZXggYnVmZmVyIG9iamVjdCBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgVmVydGV4QnVmZmVyLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBnbCA9IHRoaXMuZ2w7XG4gICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIC8vIGNhY2hlIHRoaXMgdmVydGV4IGJ1ZmZlclxuICAgICAgICBpZiAoIHN0YXRlLmJvdW5kVmVydGV4QnVmZmVyICE9PSB0aGlzLmJ1ZmZlciApIHtcbiAgICAgICAgICAgIC8vIGJpbmQgYnVmZmVyXG4gICAgICAgICAgICBnbC5iaW5kQnVmZmVyKCBnbC5BUlJBWV9CVUZGRVIsIHRoaXMuYnVmZmVyICk7XG4gICAgICAgICAgICBzdGF0ZS5ib3VuZFZlcnRleEJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwb2ludGVycyA9IHRoaXMucG9pbnRlcnM7XG4gICAgICAgIHZhciBieXRlU3RyaWRlID0gdGhpcy5ieXRlU3RyaWRlO1xuICAgICAgICBPYmplY3Qua2V5cyggcG9pbnRlcnMgKS5mb3JFYWNoKCBmdW5jdGlvbiggaW5kZXggKSB7XG4gICAgICAgICAgICB2YXIgcG9pbnRlciA9IHBvaW50ZXJzWyBpbmRleCBdO1xuICAgICAgICAgICAgLy8gc2V0IGF0dHJpYnV0ZSBwb2ludGVyXG4gICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKFxuICAgICAgICAgICAgICAgIGluZGV4LFxuICAgICAgICAgICAgICAgIHBvaW50ZXIuc2l6ZSxcbiAgICAgICAgICAgICAgICBnbFsgcG9pbnRlci50eXBlIF0sXG4gICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgYnl0ZVN0cmlkZSxcbiAgICAgICAgICAgICAgICBwb2ludGVyLmJ5dGVPZmZzZXQgKTtcbiAgICAgICAgICAgIC8vIGVuYWJsZSBhdHRyaWJ1dGUgaW5kZXhcbiAgICAgICAgICAgIGlmICggIXN0YXRlLmVuYWJsZWRWZXJ0ZXhBdHRyaWJ1dGVzWyBpbmRleCBdICkge1xuICAgICAgICAgICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KCBpbmRleCApO1xuICAgICAgICAgICAgICAgIHN0YXRlLmVuYWJsZWRWZXJ0ZXhBdHRyaWJ1dGVzWyBpbmRleCBdID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmRzIHRoZSB2ZXJ0ZXggYnVmZmVyIG9iamVjdC5cbiAgICAgKiBAbWVtYmVyb2YgVmVydGV4QnVmZmVyXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7VmVydGV4QnVmZmVyfSBSZXR1cm5zIHRoZSB2ZXJ0ZXggYnVmZmVyIG9iamVjdCBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgVmVydGV4QnVmZmVyLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGdsID0gdGhpcy5nbDtcbiAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgLy8gb25seSBiaW5kIGlmIGl0IGFscmVhZHkgaXNuJ3QgYm91bmRcbiAgICAgICAgaWYgKCBzdGF0ZS5ib3VuZFZlcnRleEJ1ZmZlciAhPT0gdGhpcy5idWZmZXIgKSB7XG4gICAgICAgICAgICAvLyBiaW5kIGJ1ZmZlclxuICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlciggZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlciApO1xuICAgICAgICAgICAgc3RhdGUuYm91bmRWZXJ0ZXhCdWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3Qua2V5cyggdGhpcy5wb2ludGVycyApLmZvckVhY2goIGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgICAgICAgICAgIC8vIGRpc2FibGUgYXR0cmlidXRlIGluZGV4XG4gICAgICAgICAgICBpZiAoIHN0YXRlLmVuYWJsZWRWZXJ0ZXhBdHRyaWJ1dGVzWyBpbmRleCBdICkge1xuICAgICAgICAgICAgICAgIGdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSggaW5kZXggKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5lbmFibGVkVmVydGV4QXR0cmlidXRlc1sgaW5kZXggXSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgdGhlIGRyYXcgY29tbWFuZCBmb3IgdGhlIGJvdW5kIGJ1ZmZlci5cbiAgICAgKiBAbWVtYmVyb2YgVmVydGV4QnVmZmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIFRoZSBvcHRpb25zIHRvIHBhc3MgdG8gJ2RyYXdBcnJheXMnLiBPcHRpb25hbC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5tb2RlIC0gVGhlIGRyYXcgbW9kZSAvIHByaW1pdGl2ZSB0eXBlLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLmJ5dGVPZmZzZXQgLSBUaGUgYnl0ZSBvZmZzZXQgaW50byB0aGUgZHJhd24gYnVmZmVyLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLmNvdW50IC0gVGhlIG51bWJlciBvZiBpbmRpY2VzIHRvIGRyYXcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7VmVydGV4QnVmZmVyfSBSZXR1cm5zIHRoZSB2ZXJ0ZXggYnVmZmVyIG9iamVjdCBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgVmVydGV4QnVmZmVyLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBpZiAoIHRoaXMuc3RhdGUuYm91bmRWZXJ0ZXhCdWZmZXIgIT09IHRoaXMuYnVmZmVyICkge1xuICAgICAgICAgICAgdGhyb3cgJ0F0dGVtcHRpbmcgdG8gZHJhdyBhbiB1bmJvdW5kIFZlcnRleEJ1ZmZlcic7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGdsID0gdGhpcy5nbDtcbiAgICAgICAgdmFyIG1vZGUgPSBnbFsgb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSBdO1xuICAgICAgICB2YXIgYnl0ZU9mZnNldCA9ICggb3B0aW9ucy5ieXRlT2Zmc2V0ICE9PSB1bmRlZmluZWQgKSA/IG9wdGlvbnMuYnl0ZU9mZnNldCA6IHRoaXMuYnl0ZU9mZnNldDtcbiAgICAgICAgdmFyIGNvdW50ID0gKCBvcHRpb25zLmNvdW50ICE9PSB1bmRlZmluZWQgKSA/IG9wdGlvbnMuY291bnQgOiB0aGlzLmNvdW50O1xuICAgICAgICBpZiAoIGNvdW50ID09PSAwICkge1xuICAgICAgICAgICAgdGhyb3cgJ0F0dGVtcHRpbmcgdG8gZHJhdyB3aXRoIGEgY291bnQgb2YgMCc7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJ5dGVzUGVyQ291bnQgPSBCWVRFU19QRVJfQ09NUE9ORU5UICogZ2V0TnVtQ29tcG9uZW50cyggdGhpcy5wb2ludGVycyApO1xuICAgICAgICBpZiAoIGNvdW50ICogYnl0ZXNQZXJDb3VudCArIGJ5dGVPZmZzZXQgPiB0aGlzLmJ5dGVMZW5ndGggKSB7XG4gICAgICAgICAgICB0aHJvdyAnQXR0ZW1wdGluZyB0byBkcmF3IHdpdGggYGNvdW50YCBvZiAnICsgY291bnQgKyAnIGFuZCBgb2Zmc2V0YCBvZiAnICsgYnl0ZU9mZnNldCArICcgb3ZlcmZsb3dzIHRoZSB0b3RhbCBieXRlIGxlbmd0aCBvZiB0aGUgYnVmZmVyICgnICsgdGhpcy5ieXRlTGVuZ3RoICsgJyknO1xuICAgICAgICB9XG4gICAgICAgIC8vIGRyYXcgZWxlbWVudHNcbiAgICAgICAgZ2wuZHJhd0FycmF5cyggbW9kZSwgYnl0ZU9mZnNldCwgY291bnQgKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gVmVydGV4QnVmZmVyO1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIFV0aWwgPSByZXF1aXJlKCcuLi91dGlsL1V0aWwnKTtcclxuICAgIHZhciBDT01QT05FTlRfVFlQRSA9ICdGTE9BVCc7XHJcbiAgICB2YXIgQllURVNfUEVSX0NPTVBPTkVOVCA9IDQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGludmFsaWQgYXR0cmlidXRlIGFyZ3VtZW50cy4gQSB2YWxpZCBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIGxlbmd0aCA+IDAga2V5IGJ5IGEgc3RyaW5nIHJlcHJlc2VudGluZyBhbiBpbnQuXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzIC0gVGhlIG1hcCBvZiB2ZXJ0ZXggYXR0cmlidXRlcy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSB2YWxpZCBhcnJheSBvZiBhcmd1bWVudHMuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHBhcnNlQXR0cmlidXRlTWFwKCBhdHRyaWJ1dGVzICkge1xyXG4gICAgICAgIHZhciBnb29kQXR0cmlidXRlcyA9IFtdO1xyXG4gICAgICAgIE9iamVjdC5rZXlzKCBhdHRyaWJ1dGVzICkuZm9yRWFjaCggZnVuY3Rpb24oIGtleSApIHtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gcGFyc2VGbG9hdCgga2V5ICk7XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIHRoYXQga2V5IGlzIGFuIHZhbGlkIGludGVnZXJcclxuICAgICAgICAgICAgaWYgKCAhVXRpbC5pc0ludGVnZXIoIGluZGV4ICkgfHwgaW5kZXggPCAwICkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgJ0F0dHJpYnV0ZSBpbmRleCBgJyArIGtleSArICdgIGRvZXMgbm90IHJlcHJlc2VudCBhIHZhbGlkIGludGVnZXInO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB2ZXJ0aWNlcyA9IGF0dHJpYnV0ZXNba2V5XTtcclxuICAgICAgICAgICAgLy8gZW5zdXJlIGF0dHJpYnV0ZSBpcyB2YWxpZFxyXG4gICAgICAgICAgICBpZiAoIHZlcnRpY2VzICYmXHJcbiAgICAgICAgICAgICAgICB2ZXJ0aWNlcyBpbnN0YW5jZW9mIEFycmF5ICYmXHJcbiAgICAgICAgICAgICAgICB2ZXJ0aWNlcy5sZW5ndGggPiAwICkge1xyXG4gICAgICAgICAgICAgICAgLy8gYWRkIGF0dHJpYnV0ZSBkYXRhIGFuZCBpbmRleFxyXG4gICAgICAgICAgICAgICAgZ29vZEF0dHJpYnV0ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHZlcnRpY2VzXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93ICdFcnJvciBwYXJzaW5nIGF0dHJpYnV0ZSBvZiBpbmRleCBgJyArIGtleSArICdgJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIHNvcnQgYXR0cmlidXRlcyBhc2NlbmRpbmcgYnkgaW5kZXhcclxuICAgICAgICBnb29kQXR0cmlidXRlcy5zb3J0KGZ1bmN0aW9uKGEsYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGdvb2RBdHRyaWJ1dGVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIGNvbXBvbmVudCdzIGJ5dGUgc2l6ZS5cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IGNvbXBvbmVudCAtIFRoZSBjb21wb25lbnQgdG8gbWVhc3VyZS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7aW50ZWdlcn0gVGhlIGJ5dGUgc2l6ZSBvZiB0aGUgY29tcG9uZW50LlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXRDb21wb25lbnRTaXplKCBjb21wb25lbnQgKSB7XHJcbiAgICAgICAgLy8gY2hlY2sgaWYgdmVjdG9yXHJcbiAgICAgICAgaWYgKCBjb21wb25lbnQueCAhPT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICAvLyAxIGNvbXBvbmVudCB2ZWN0b3JcclxuICAgICAgICAgICAgaWYgKCBjb21wb25lbnQueSAhPT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICAgICAgLy8gMiBjb21wb25lbnQgdmVjdG9yXHJcbiAgICAgICAgICAgICAgICBpZiAoIGNvbXBvbmVudC56ICE9PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gMyBjb21wb25lbnQgdmVjdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBjb21wb25lbnQudyAhPT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyA0IGNvbXBvbmVudCB2ZWN0b3JcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNoZWNrIGlmIGFycmF5XHJcbiAgICAgICAgaWYgKCBjb21wb25lbnQgaW5zdGFuY2VvZiBBcnJheSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGRlZmF1bHQgdG8gMSBvdGhlcndpc2VcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgdGhlIHR5cGUsIHNpemUsIGFuZCBvZmZzZXQgZm9yIGVhY2ggYXR0cmlidXRlIGluIHRoZSBhdHRyaWJ1dGUgYXJyYXkgYWxvbmcgd2l0aCB0aGUgbGVuZ3RoIGFuZCBzdHJpZGUgb2YgdGhlIHBhY2thZ2UuXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7VmVydGV4UGFja2FnZX0gdmVydGV4UGFja2FnZSAtIFRoZSBWZXJ0ZXhQYWNrYWdlIG9iamVjdC5cclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGF0dHJpYnV0ZXMgLSBUaGUgYXJyYXkgb2YgdmVydGV4IGF0dHJpYnV0ZXMuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHNldFBvaW50ZXJzQW5kU3RyaWRlKCB2ZXJ0ZXhQYWNrYWdlLCBhdHRyaWJ1dGVzICkge1xyXG4gICAgICAgIHZhciBzaG9ydGVzdEFycmF5ID0gTnVtYmVyLk1BWF9WQUxVRTtcclxuICAgICAgICB2YXIgb2Zmc2V0ID0gMDtcclxuICAgICAgICAvLyBjbGVhciBwb2ludGVyc1xyXG4gICAgICAgIHZlcnRleFBhY2thZ2UucG9pbnRlcnMgPSB7fTtcclxuICAgICAgICAvLyBmb3IgZWFjaCBhdHRyaWJ1dGVcclxuICAgICAgICBhdHRyaWJ1dGVzLmZvckVhY2goIGZ1bmN0aW9uKCB2ZXJ0aWNlcyApIHtcclxuICAgICAgICAgICAgLy8gc2V0IHNpemUgdG8gbnVtYmVyIG9mIGNvbXBvbmVudHMgaW4gdGhlIGF0dHJpYnV0ZVxyXG4gICAgICAgICAgICB2YXIgc2l6ZSA9IGdldENvbXBvbmVudFNpemUoIHZlcnRpY2VzLmRhdGFbMF0gKTtcclxuICAgICAgICAgICAgLy8gbGVuZ3RoIG9mIHRoZSBwYWNrYWdlIHdpbGwgYmUgdGhlIHNob3J0ZXN0IGF0dHJpYnV0ZSBhcnJheSBsZW5ndGhcclxuICAgICAgICAgICAgc2hvcnRlc3RBcnJheSA9IE1hdGgubWluKCBzaG9ydGVzdEFycmF5LCB2ZXJ0aWNlcy5kYXRhLmxlbmd0aCApO1xyXG4gICAgICAgICAgICAvLyBzdG9yZSBwb2ludGVyIHVuZGVyIGluZGV4XHJcbiAgICAgICAgICAgIHZlcnRleFBhY2thZ2UucG9pbnRlcnNbIHZlcnRpY2VzLmluZGV4IF0gPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlIDogQ09NUE9ORU5UX1RZUEUsXHJcbiAgICAgICAgICAgICAgICBzaXplIDogc2l6ZSxcclxuICAgICAgICAgICAgICAgIGJ5dGVPZmZzZXQgOiBvZmZzZXQgKiBCWVRFU19QRVJfQ09NUE9ORU5UXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8vIGFjY3VtdWxhdGUgYXR0cmlidXRlIG9mZnNldFxyXG4gICAgICAgICAgICBvZmZzZXQgKz0gc2l6ZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBzZXQgc3RyaWRlIHRvIHRvdGFsIG9mZnNldFxyXG4gICAgICAgIHZlcnRleFBhY2thZ2UuYnl0ZVN0cmlkZSA9IG9mZnNldCAqIEJZVEVTX1BFUl9DT01QT05FTlQ7XHJcbiAgICAgICAgLy8gc2V0IGxlbmd0aCBvZiBwYWNrYWdlIHRvIHRoZSBzaG9ydGVzdCBhdHRyaWJ1dGUgYXJyYXkgbGVuZ3RoXHJcbiAgICAgICAgdmVydGV4UGFja2FnZS5sZW5ndGggPSBzaG9ydGVzdEFycmF5O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlsbCB0aGUgYXJyYXlidWZmZXIgd2l0aCBhIHNpbmdsZSBjb21wb25lbnQgYXR0cmlidXRlLlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheX0gYnVmZmVyIC0gVGhlIGFycmF5YnVmZmVyIHRvIGZpbGwuXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSB2ZXJ0aWNlcyAtIFRoZSB2ZXJ0ZXggYXR0cmlidXRlIGFycmF5IHRvIGNvcHkgZnJvbS5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGggLSBUaGUgbGVuZ3RoIG9mIHRoZSBidWZmZXIgdG8gY29weSBmcm9tLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9mZnNldCAtIFRoZSBvZmZzZXQgdG8gdGhlIGF0dHJpYnV0ZS5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdHJpZGUgLSBUaGUgb2Ygc3RyaWRlIG9mIHRoZSBidWZmZXIuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHNldDFDb21wb25lbnRBdHRyKCBidWZmZXIsIHZlcnRpY2VzLCBsZW5ndGgsIG9mZnNldCwgc3RyaWRlICkge1xyXG4gICAgICAgIHZhciB2ZXJ0ZXgsIGksIGo7XHJcbiAgICAgICAgZm9yICggaT0wOyBpPGxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgICB2ZXJ0ZXggPSB2ZXJ0aWNlc1tpXTtcclxuICAgICAgICAgICAgLy8gZ2V0IHRoZSBpbmRleCBpbiB0aGUgYnVmZmVyIHRvIHRoZSBwYXJ0aWN1bGFyIHZlcnRleFxyXG4gICAgICAgICAgICBqID0gb2Zmc2V0ICsgKCBzdHJpZGUgKiBpICk7XHJcbiAgICAgICAgICAgIGlmICggdmVydGV4LnggIT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgICAgICAgIGJ1ZmZlcltqXSA9IHZlcnRleC54O1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB2ZXJ0ZXhbMF0gIT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgICAgICAgIGJ1ZmZlcltqXSA9IHZlcnRleFswXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGJ1ZmZlcltqXSA9IHZlcnRleDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbGwgdGhlIGFycmF5YnVmZmVyIHdpdGggYSBkb3VibGUgY29tcG9uZW50IGF0dHJpYnV0ZS5cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl9IGJ1ZmZlciAtIFRoZSBhcnJheWJ1ZmZlciB0byBmaWxsLlxyXG4gICAgICogQHBhcmFtIHtBcnJheX0gdmVydGljZXMgLSBUaGUgdmVydGV4IGF0dHJpYnV0ZSBhcnJheSB0byBjb3B5IGZyb20uXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIC0gVGhlIGxlbmd0aCBvZiB0aGUgYnVmZmVyIHRvIGNvcHkgZnJvbS5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvZmZzZXQgLSBUaGUgb2Zmc2V0IHRvIHRoZSBhdHRyaWJ1dGUuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RyaWRlIC0gVGhlIG9mIHN0cmlkZSBvZiB0aGUgYnVmZmVyLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzZXQyQ29tcG9uZW50QXR0ciggYnVmZmVyLCB2ZXJ0aWNlcywgbGVuZ3RoLCBvZmZzZXQsIHN0cmlkZSApIHtcclxuICAgICAgICB2YXIgdmVydGV4LCBpLCBqO1xyXG4gICAgICAgIGZvciAoIGk9MDsgaTxsZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgICAgdmVydGV4ID0gdmVydGljZXNbaV07XHJcbiAgICAgICAgICAgIC8vIGdldCB0aGUgaW5kZXggaW4gdGhlIGJ1ZmZlciB0byB0aGUgcGFydGljdWxhciB2ZXJ0ZXhcclxuICAgICAgICAgICAgaiA9IG9mZnNldCArICggc3RyaWRlICogaSApO1xyXG4gICAgICAgICAgICBidWZmZXJbal0gPSAoIHZlcnRleC54ICE9PSB1bmRlZmluZWQgKSA/IHZlcnRleC54IDogdmVydGV4WzBdO1xyXG4gICAgICAgICAgICBidWZmZXJbaisxXSA9ICggdmVydGV4LnkgIT09IHVuZGVmaW5lZCApID8gdmVydGV4LnkgOiB2ZXJ0ZXhbMV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlsbCB0aGUgYXJyYXlidWZmZXIgd2l0aCBhIHRyaXBsZSBjb21wb25lbnQgYXR0cmlidXRlLlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheX0gYnVmZmVyIC0gVGhlIGFycmF5YnVmZmVyIHRvIGZpbGwuXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSB2ZXJ0aWNlcyAtIFRoZSB2ZXJ0ZXggYXR0cmlidXRlIGFycmF5IHRvIGNvcHkgZnJvbS5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGggLSBUaGUgbGVuZ3RoIG9mIHRoZSBidWZmZXIgdG8gY29weSBmcm9tLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9mZnNldCAtIFRoZSBvZmZzZXQgdG8gdGhlIGF0dHJpYnV0ZS5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdHJpZGUgLSBUaGUgb2Ygc3RyaWRlIG9mIHRoZSBidWZmZXIuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHNldDNDb21wb25lbnRBdHRyKCBidWZmZXIsIHZlcnRpY2VzLCBsZW5ndGgsIG9mZnNldCwgc3RyaWRlICkge1xyXG4gICAgICAgIHZhciB2ZXJ0ZXgsIGksIGo7XHJcbiAgICAgICAgZm9yICggaT0wOyBpPGxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgICB2ZXJ0ZXggPSB2ZXJ0aWNlc1tpXTtcclxuICAgICAgICAgICAgLy8gZ2V0IHRoZSBpbmRleCBpbiB0aGUgYnVmZmVyIHRvIHRoZSBwYXJ0aWN1bGFyIHZlcnRleFxyXG4gICAgICAgICAgICBqID0gb2Zmc2V0ICsgKCBzdHJpZGUgKiBpICk7XHJcbiAgICAgICAgICAgIGJ1ZmZlcltqXSA9ICggdmVydGV4LnggIT09IHVuZGVmaW5lZCApID8gdmVydGV4LnggOiB2ZXJ0ZXhbMF07XHJcbiAgICAgICAgICAgIGJ1ZmZlcltqKzFdID0gKCB2ZXJ0ZXgueSAhPT0gdW5kZWZpbmVkICkgPyB2ZXJ0ZXgueSA6IHZlcnRleFsxXTtcclxuICAgICAgICAgICAgYnVmZmVyW2orMl0gPSAoIHZlcnRleC56ICE9PSB1bmRlZmluZWQgKSA/IHZlcnRleC56IDogdmVydGV4WzJdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbGwgdGhlIGFycmF5YnVmZmVyIHdpdGggYSBxdWFkcnVwbGUgY29tcG9uZW50IGF0dHJpYnV0ZS5cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl9IGJ1ZmZlciAtIFRoZSBhcnJheWJ1ZmZlciB0byBmaWxsLlxyXG4gICAgICogQHBhcmFtIHtBcnJheX0gdmVydGljZXMgLSBUaGUgdmVydGV4IGF0dHJpYnV0ZSBhcnJheSB0byBjb3B5IGZyb20uXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIC0gVGhlIGxlbmd0aCBvZiB0aGUgYnVmZmVyIHRvIGNvcHkgZnJvbS5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvZmZzZXQgLSBUaGUgb2Zmc2V0IHRvIHRoZSBhdHRyaWJ1dGUuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RyaWRlIC0gVGhlIG9mIHN0cmlkZSBvZiB0aGUgYnVmZmVyLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzZXQ0Q29tcG9uZW50QXR0ciggYnVmZmVyLCB2ZXJ0aWNlcywgbGVuZ3RoLCBvZmZzZXQsIHN0cmlkZSApIHtcclxuICAgICAgICB2YXIgdmVydGV4LCBpLCBqO1xyXG4gICAgICAgIGZvciAoIGk9MDsgaTxsZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgICAgdmVydGV4ID0gdmVydGljZXNbaV07XHJcbiAgICAgICAgICAgIC8vIGdldCB0aGUgaW5kZXggaW4gdGhlIGJ1ZmZlciB0byB0aGUgcGFydGljdWxhciB2ZXJ0ZXhcclxuICAgICAgICAgICAgaiA9IG9mZnNldCArICggc3RyaWRlICogaSApO1xyXG4gICAgICAgICAgICBidWZmZXJbal0gPSAoIHZlcnRleC54ICE9PSB1bmRlZmluZWQgKSA/IHZlcnRleC54IDogdmVydGV4WzBdO1xyXG4gICAgICAgICAgICBidWZmZXJbaisxXSA9ICggdmVydGV4LnkgIT09IHVuZGVmaW5lZCApID8gdmVydGV4LnkgOiB2ZXJ0ZXhbMV07XHJcbiAgICAgICAgICAgIGJ1ZmZlcltqKzJdID0gKCB2ZXJ0ZXgueiAhPT0gdW5kZWZpbmVkICkgPyB2ZXJ0ZXgueiA6IHZlcnRleFsyXTtcclxuICAgICAgICAgICAgYnVmZmVyW2orM10gPSAoIHZlcnRleC53ICE9PSB1bmRlZmluZWQgKSA/IHZlcnRleC53IDogdmVydGV4WzNdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc3RhbnRpYXRlcyBhbiBWZXJ0ZXhQYWNrYWdlIG9iamVjdC5cclxuICAgICAqIEBjbGFzcyBWZXJ0ZXhQYWNrYWdlXHJcbiAgICAgKiBAY2xhc3NkZXNjIEEgdmVydGV4IHBhY2thZ2Ugb2JqZWN0LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzIC0gVGhlIGF0dHJpYnV0ZXMgdG8gaW50ZXJsZWF2ZSBrZXllZCBieSBpbmRleC5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gVmVydGV4UGFja2FnZSggYXR0cmlidXRlcyApIHtcclxuICAgICAgICBpZiAoIGF0dHJpYnV0ZXMgIT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXQoIGF0dHJpYnV0ZXMgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoMCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlcnMgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIGRhdGEgdG8gYmUgaW50ZXJsZWF2ZWQgaW5zaWRlIHRoZSBwYWNrYWdlLiBUaGlzIGNsZWFycyBhbnkgcHJldmlvdXNseSBleGlzdGluZyBkYXRhLlxyXG4gICAgICogQG1lbWJlcm9mIFZlcnRleFBhY2thZ2VcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlcyAtIFRoZSBhdHRyaWJ1dGVzIHRvIGludGVybGVhdmVkLCBrZXllZCBieSBpbmRleC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7VmVydGV4UGFja2FnZX0gLSBUaGUgdmVydGV4IHBhY2thZ2Ugb2JqZWN0LCBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFZlcnRleFBhY2thZ2UucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzICkge1xyXG4gICAgICAgIC8vIHJlbW92ZSBiYWQgYXR0cmlidXRlc1xyXG4gICAgICAgIGF0dHJpYnV0ZXMgPSBwYXJzZUF0dHJpYnV0ZU1hcCggYXR0cmlidXRlcyApO1xyXG4gICAgICAgIC8vIHNldCBhdHRyaWJ1dGUgcG9pbnRlcnMgYW5kIHN0cmlkZVxyXG4gICAgICAgIHNldFBvaW50ZXJzQW5kU3RyaWRlKCB0aGlzLCBhdHRyaWJ1dGVzICk7XHJcbiAgICAgICAgLy8gc2V0IHNpemUgb2YgZGF0YSB2ZWN0b3JcclxuICAgICAgICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIHN0cmlkZSA9IHRoaXMuYnl0ZVN0cmlkZSAvIEJZVEVTX1BFUl9DT01QT05FTlQ7XHJcbiAgICAgICAgdmFyIHBvaW50ZXJzID0gdGhpcy5wb2ludGVycztcclxuICAgICAgICB2YXIgYnVmZmVyID0gdGhpcy5idWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCBsZW5ndGggKiBzdHJpZGUgKTtcclxuICAgICAgICAvLyBmb3IgZWFjaCB2ZXJ0ZXggYXR0cmlidXRlIGFycmF5XHJcbiAgICAgICAgYXR0cmlidXRlcy5mb3JFYWNoKCBmdW5jdGlvbiggdmVydGljZXMgKSB7XHJcbiAgICAgICAgICAgIC8vIGdldCB0aGUgcG9pbnRlclxyXG4gICAgICAgICAgICB2YXIgcG9pbnRlciA9IHBvaW50ZXJzWyB2ZXJ0aWNlcy5pbmRleCBdO1xyXG4gICAgICAgICAgICAvLyBnZXQgdGhlIHBvaW50ZXJzIG9mZnNldFxyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gcG9pbnRlci5ieXRlT2Zmc2V0IC8gQllURVNfUEVSX0NPTVBPTkVOVDtcclxuICAgICAgICAgICAgLy8gY29weSB2ZXJ0ZXggZGF0YSBpbnRvIGFycmF5YnVmZmVyXHJcbiAgICAgICAgICAgIHN3aXRjaCAoIHBvaW50ZXIuc2l6ZSApIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICBzZXQyQ29tcG9uZW50QXR0ciggYnVmZmVyLCB2ZXJ0aWNlcy5kYXRhLCBsZW5ndGgsIG9mZnNldCwgc3RyaWRlICk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0M0NvbXBvbmVudEF0dHIoIGJ1ZmZlciwgdmVydGljZXMuZGF0YSwgbGVuZ3RoLCBvZmZzZXQsIHN0cmlkZSApO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHNldDRDb21wb25lbnRBdHRyKCBidWZmZXIsIHZlcnRpY2VzLmRhdGEsIGxlbmd0aCwgb2Zmc2V0LCBzdHJpZGUgKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0MUNvbXBvbmVudEF0dHIoIGJ1ZmZlciwgdmVydGljZXMuZGF0YSwgbGVuZ3RoLCBvZmZzZXQsIHN0cmlkZSApO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gVmVydGV4UGFja2FnZTtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIFdlYkdMQ29udGV4dCA9IHJlcXVpcmUoJy4vV2ViR0xDb250ZXh0Jyk7XHJcbiAgICB2YXIgV2ViR0xDb250ZXh0U3RhdGUgPSByZXF1aXJlKCcuL1dlYkdMQ29udGV4dFN0YXRlJyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCaW5kIHRoZSB2aWV3cG9ydCB0byB0aGUgcmVuZGVyaW5nIGNvbnRleHQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gdmlld3BvcnQgLSBUaGUgdmlld3BvcnQgb2JqZWN0LlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gVGhlIHdpZHRoIG92ZXJyaWRlLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtIFRoZSBoZWlnaHQgb3ZlcnJpZGUuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIFRoZSBob3Jpem9udGFsIG9mZnNldC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gVGhlIHZlcnRpY2FsIG9mZnNldC5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gc2V0KCB2aWV3cG9ydCwgeCwgeSwgd2lkdGgsIGhlaWdodCApIHtcclxuICAgICAgICB2YXIgZ2wgPSB2aWV3cG9ydC5nbDtcclxuICAgICAgICB4ID0gKCB4ICE9PSB1bmRlZmluZWQgKSA/IHggOiAwO1xyXG4gICAgICAgIHkgPSAoIHkgIT09IHVuZGVmaW5lZCApID8geSA6IDA7XHJcbiAgICAgICAgd2lkdGggPSAoIHdpZHRoICE9PSB1bmRlZmluZWQgKSA/IHdpZHRoIDogdmlld3BvcnQud2lkdGg7XHJcbiAgICAgICAgaGVpZ2h0ID0gKCBoZWlnaHQgIT09IHVuZGVmaW5lZCApID8gaGVpZ2h0IDogdmlld3BvcnQuaGVpZ2h0O1xyXG4gICAgICAgIGdsLnZpZXdwb3J0KCB4LCB5LCB3aWR0aCwgaGVpZ2h0ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW50aWF0ZXMgYW4gVmlld3BvcnQgb2JqZWN0LlxyXG4gICAgICogQGNsYXNzIFZpZXdwb3J0XHJcbiAgICAgKiBAY2xhc3NkZXNjIEEgdmlld3BvcnQgb2JqZWN0LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzcGVjIC0gVGhlIHZpZXdwb3J0IHNwZWNpZmljYXRpb24gb2JqZWN0LlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNwZWMud2lkdGggLSBUaGUgd2lkdGggb2YgdGhlIHZpZXdwb3J0LlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNwZWMuaGVpZ2h0IC0gVGhlIGhlaWdodCBvZiB0aGUgdmlld3BvcnQuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFZpZXdwb3J0KCBzcGVjICkge1xyXG4gICAgICAgIHNwZWMgPSBzcGVjIHx8IHt9O1xyXG4gICAgICAgIHRoaXMuZ2wgPSBXZWJHTENvbnRleHQuZ2V0KCk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFdlYkdMQ29udGV4dFN0YXRlLmdldCggdGhpcy5nbCApO1xyXG4gICAgICAgIC8vIHNldCBzaXplXHJcbiAgICAgICAgdGhpcy5yZXNpemUoXHJcbiAgICAgICAgICAgIHNwZWMud2lkdGggfHwgdGhpcy5nbC5jYW52YXMud2lkdGgsXHJcbiAgICAgICAgICAgIHNwZWMuaGVpZ2h0IHx8IHRoaXMuZ2wuY2FudmFzLmhlaWdodCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyB0aGUgdmlld3BvcnRzIHdpZHRoIGFuZCBoZWlnaHQuIFRoaXMgcmVzaXplcyB0aGUgdW5kZXJseWluZyBjYW52YXMgZWxlbWVudC5cclxuICAgICAqIEBtZW1iZXJvZiBWaWV3cG9ydFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCAtIFRoZSB3aWR0aCBvZiB0aGUgdmlld3BvcnQuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gVGhlIGhlaWdodCBvZiB0aGUgdmlld3BvcnQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1ZpZXdwb3J0fSBUaGUgdmlld3BvcnQgb2JqZWN0LCBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFZpZXdwb3J0LnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiggd2lkdGgsIGhlaWdodCApIHtcclxuICAgICAgICBpZiAoIHR5cGVvZiB3aWR0aCAhPT0gJ251bWJlcicgfHwgKCB3aWR0aCA8PSAwICkgKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdQcm92aWRlZCBgd2lkdGhgIG9mICcgKyB3aWR0aCArICcgaXMgaW52YWxpZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggdHlwZW9mIGhlaWdodCAhPT0gJ251bWJlcicgfHwgKCBoZWlnaHQgPD0gMCApICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnUHJvdmlkZWQgYGhlaWdodGAgb2YgJyArIGhlaWdodCArICcgaXMgaW52YWxpZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB0aGlzLmdsLmNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuZ2wuY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBY3RpdmF0ZXMgdGhlIHZpZXdwb3J0IGFuZCBwdXNoZXMgaXQgb250byB0aGUgc3RhY2sgd2l0aCB0aGUgcHJvdmlkZWQgYXJndW1lbnRzLiBUaGUgdW5kZXJseWluZyBjYW52YXMgZWxlbWVudCBpcyBub3QgYWZmZWN0ZWQuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmlld3BvcnRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBUaGUgd2lkdGggb3ZlcnJpZGUuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gVGhlIGhlaWdodCBvdmVycmlkZS5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gVGhlIGhvcml6b250YWwgb2Zmc2V0IG92ZXJyaWRlLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBUaGUgdmVydGljYWwgb2Zmc2V0IG92ZXJyaWRlLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtWaWV3cG9ydH0gVGhlIHZpZXdwb3J0IG9iamVjdCwgZm9yIGNoYWluaW5nLlxyXG4gICAgICovXHJcbiAgICBWaWV3cG9ydC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKCB4LCB5LCB3aWR0aCwgaGVpZ2h0ICkge1xyXG4gICAgICAgIGlmICggeCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB4ICE9PSAnbnVtYmVyJyApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ1Byb3ZpZGVkIGB4YCBvZiAnICsgeCArICcgaXMgaW52YWxpZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggeSAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB5ICE9PSAnbnVtYmVyJyApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ1Byb3ZpZGVkIGB5YCBvZiAnICsgeSArICcgaXMgaW52YWxpZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggd2lkdGggIT09IHVuZGVmaW5lZCAmJiAoIHR5cGVvZiB3aWR0aCAhPT0gJ251bWJlcicgfHwgKCB3aWR0aCA8PSAwICkgKSApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ1Byb3ZpZGVkIGB3aWR0aGAgb2YgJyArIHdpZHRoICsgJyBpcyBpbnZhbGlkJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBoZWlnaHQgIT09IHVuZGVmaW5lZCAmJiAoIHR5cGVvZiBoZWlnaHQgIT09ICdudW1iZXInIHx8ICggaGVpZ2h0IDw9IDAgKSApICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnUHJvdmlkZWQgYGhlaWdodGAgb2YgJyArIGhlaWdodCArICcgaXMgaW52YWxpZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3RhdGUudmlld3BvcnRzLnB1c2goe1xyXG4gICAgICAgICAgICB2aWV3cG9ydDogdGhpcyxcclxuICAgICAgICAgICAgeDogeCxcclxuICAgICAgICAgICAgeTogeSxcclxuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNldCggdGhpcywgeCwgeSwgd2lkdGgsIGhlaWdodCApO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFBvcHMgY3VycmVudCB0aGUgdmlld3BvcnQgb2JqZWN0IGFuZCBhY3RpdmF0ZXMgdGhlIHZpZXdwb3J0IGJlbmVhdGggaXQuXHJcbiAgICAgKiBAbWVtYmVyb2YgVmlld3BvcnRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7Vmlld3BvcnR9IFRoZSB2aWV3cG9ydCBvYmplY3QsIGZvciBjaGFpbmluZy5cclxuICAgICAqL1xyXG4gICAgVmlld3BvcnQucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgdmFyIHRvcCA9IHN0YXRlLnZpZXdwb3J0cy50b3AoKTtcclxuICAgICAgICBpZiAoICF0b3AgfHwgdGhpcyAhPT0gdG9wLnZpZXdwb3J0ICkge1xyXG4gICAgICAgICAgICB0aHJvdyAnVmlld3BvcnQgaXMgbm90IHRoZSB0b3AgbW9zdCBlbGVtZW50IG9uIHRoZSBzdGFjayc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXRlLnZpZXdwb3J0cy5wb3AoKTtcclxuICAgICAgICB0b3AgPSBzdGF0ZS52aWV3cG9ydHMudG9wKCk7XHJcbiAgICAgICAgaWYgKCB0b3AgKSB7XHJcbiAgICAgICAgICAgIHNldCggdG9wLnZpZXdwb3J0LCB0b3AueCwgdG9wLnksIHRvcC53aWR0aCwgdG9wLmhlaWdodCApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNldCggdGhpcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBWaWV3cG9ydDtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBFWFRFTlNJT05TID0gW1xuICAgICAgICAvLyByYXRpZmllZFxuICAgICAgICAnT0VTX3RleHR1cmVfZmxvYXQnLFxuICAgICAgICAnT0VTX3RleHR1cmVfaGFsZl9mbG9hdCcsXG4gICAgICAgICdXRUJHTF9sb3NlX2NvbnRleHQnLFxuICAgICAgICAnT0VTX3N0YW5kYXJkX2Rlcml2YXRpdmVzJyxcbiAgICAgICAgJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0JyxcbiAgICAgICAgJ1dFQkdMX2RlYnVnX3JlbmRlcmVyX2luZm8nLFxuICAgICAgICAnV0VCR0xfZGVidWdfc2hhZGVycycsXG4gICAgICAgICdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfczN0YycsXG4gICAgICAgICdXRUJHTF9kZXB0aF90ZXh0dXJlJyxcbiAgICAgICAgJ09FU19lbGVtZW50X2luZGV4X3VpbnQnLFxuICAgICAgICAnRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljJyxcbiAgICAgICAgJ0VYVF9mcmFnX2RlcHRoJyxcbiAgICAgICAgJ1dFQkdMX2RyYXdfYnVmZmVycycsXG4gICAgICAgICdBTkdMRV9pbnN0YW5jZWRfYXJyYXlzJyxcbiAgICAgICAgJ09FU190ZXh0dXJlX2Zsb2F0X2xpbmVhcicsXG4gICAgICAgICdPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0X2xpbmVhcicsXG4gICAgICAgICdFWFRfYmxlbmRfbWlubWF4JyxcbiAgICAgICAgJ0VYVF9zaGFkZXJfdGV4dHVyZV9sb2QnLFxuICAgICAgICAvLyBjb21tdW5pdHlcbiAgICAgICAgJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9hdGMnLFxuICAgICAgICAnV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3B2cnRjJyxcbiAgICAgICAgJ0VYVF9jb2xvcl9idWZmZXJfaGFsZl9mbG9hdCcsXG4gICAgICAgICdXRUJHTF9jb2xvcl9idWZmZXJfZmxvYXQnLFxuICAgICAgICAnRVhUX3NSR0InLFxuICAgICAgICAnV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX2V0YzEnXG4gICAgXTtcbiAgICB2YXIgX2JvdW5kQ29udGV4dCA9IG51bGw7XG4gICAgdmFyIF9jb250ZXh0cyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiByZmM0MTIyIHZlcnNpb24gNCBjb21wbGlhbnQgVVVJRC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHJldHVybnMge1N0cmluZ30gVGhlIFVVSUQgc3RyaW5nLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldFVVSUQoKSB7XG4gICAgICAgIHZhciByZXBsYWNlID0gZnVuY3Rpb24oIGMgKSB7XG4gICAgICAgICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkgKiAxNiB8IDA7XG4gICAgICAgICAgICB2YXIgdiA9ICggYyA9PT0gJ3gnICkgPyByIDogKCByICYgMHgzIHwgMHg4ICk7XG4gICAgICAgICAgICByZXR1cm4gdi50b1N0cmluZyggMTYgKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoIC9beHldL2csIHJlcGxhY2UgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBpZCBvZiB0aGUgSFRNTENhbnZhc0VsZW1lbnQgZWxlbWVudC4gSWYgdGhlcmUgaXMgbm8gaWQsIGl0XG4gICAgICogZ2VuZXJhdGVzIG9uZSBhbmQgYXBwZW5kcyBpdC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzIC0gVGhlIENhbnZhcyBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgQ2FudmFzIGlkIHN0cmluZy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRJZCggY2FudmFzICkge1xuICAgICAgICBpZiAoICFjYW52YXMuaWQgKSB7XG4gICAgICAgICAgICBjYW52YXMuaWQgPSBnZXRVVUlEKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbnZhcy5pZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgQ2FudmFzIGVsZW1lbnQgb2JqZWN0IGZyb20gZWl0aGVyIGFuIGV4aXN0aW5nIG9iamVjdCwgb3IgaWRlbnRpZmljYXRpb24gc3RyaW5nLlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0hUTUxDYW52YXNFbGVtZW50fFN0cmluZ30gYXJnIC0gVGhlIENhbnZhcyBvYmplY3Qgb3IgQ2FudmFzIGlkIG9yIHNlbGVjdG9yIHN0cmluZy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtIVE1MQ2FudmFzRWxlbWVudH0gVGhlIENhbnZhcyBlbGVtZW50IG9iamVjdC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRDYW52YXMoIGFyZyApIHtcbiAgICAgICAgaWYgKCBhcmcgaW5zdGFuY2VvZiBIVE1MQ2FudmFzRWxlbWVudCApIHtcbiAgICAgICAgICAgIHJldHVybiBhcmc7XG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnICkge1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBhcmcgKSB8fFxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGFyZyApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGVtcHRzIHRvIHJldHJlaXZlIGEgd3JhcHBlZCBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnR9IFRoZSBDYW52YXMgZWxlbWVudCBvYmplY3QgdG8gY3JlYXRlIHRoZSBjb250ZXh0IHVuZGVyLlxuICAgICAqXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGhlIGNvbnRleHQgd3JhcHBlci5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRDb250ZXh0V3JhcHBlciggYXJnICkge1xuICAgICAgICBpZiAoIGFyZyA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgaWYgKCBfYm91bmRDb250ZXh0ICkge1xuICAgICAgICAgICAgICAgIC8vIHJldHVybiBsYXN0IGJvdW5kIGNvbnRleHRcbiAgICAgICAgICAgICAgICByZXR1cm4gX2JvdW5kQ29udGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBnZXRDYW52YXMoIGFyZyApO1xuICAgICAgICAgICAgaWYgKCBjYW52YXMgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0c1sgZ2V0SWQoIGNhbnZhcyApIF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gbm8gYm91bmQgY29udGV4dCBvciBhcmd1bWVudFxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdHRlbXB0cyB0byBsb2FkIGFsbCBrbm93biBleHRlbnNpb25zIGZvciBhIHByb3ZpZGVkIFdlYkdMUmVuZGVyaW5nQ29udGV4dC4gU3RvcmVzIHRoZSByZXN1bHRzIGluIHRoZSBjb250ZXh0IHdyYXBwZXIgZm9yIGxhdGVyIHF1ZXJpZXMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0V3JhcHBlciAtIFRoZSBjb250ZXh0IHdyYXBwZXIuXG4gICAgICovXG4gICAgZnVuY3Rpb24gbG9hZEV4dGVuc2lvbnMoIGNvbnRleHRXcmFwcGVyICkge1xuICAgICAgICB2YXIgZ2wgPSBjb250ZXh0V3JhcHBlci5nbDtcbiAgICAgICAgRVhURU5TSU9OUy5mb3JFYWNoKCBmdW5jdGlvbiggaWQgKSB7XG4gICAgICAgICAgICBjb250ZXh0V3JhcHBlci5leHRlbnNpb25zWyBpZCBdID0gZ2wuZ2V0RXh0ZW5zaW9uKCBpZCApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdHRlbXB0cyB0byBjcmVhdGUgYSBXZWJHTFJlbmRlcmluZ0NvbnRleHQgd3JhcHBlZCBpbnNpZGUgYW4gb2JqZWN0IHdoaWNoIHdpbGwgYWxzbyBzdG9yZSB0aGUgZXh0ZW5zaW9uIHF1ZXJ5IHJlc3VsdHMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnR9IFRoZSBDYW52YXMgZWxlbWVudCBvYmplY3QgdG8gY3JlYXRlIHRoZSBjb250ZXh0IHVuZGVyLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fX0gb3B0aW9ucyAtIFBhcmFtZXRlcnMgdG8gdGhlIHdlYmdsIGNvbnRleHQsIG9ubHkgdXNlZCBkdXJpbmcgaW5zdGFudGlhdGlvbi4gT3B0aW9uYWwuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgY29udGV4dCB3cmFwcGVyLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNyZWF0ZUNvbnRleHRXcmFwcGVyKCBjYW52YXMsIG9wdGlvbnMgKSB7XG4gICAgICAgIHZhciBnbCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnd2ViZ2wnLCBvcHRpb25zICkgfHwgY2FudmFzLmdldENvbnRleHQoICdleHBlcmltZW50YWwtd2ViZ2wnLCBvcHRpb25zICk7XG4gICAgICAgIC8vIHdyYXAgY29udGV4dFxuICAgICAgICB2YXIgY29udGV4dFdyYXBwZXIgPSB7XG4gICAgICAgICAgICBpZDogZ2V0SWQoIGNhbnZhcyApLFxuICAgICAgICAgICAgZ2w6IGdsLFxuICAgICAgICAgICAgZXh0ZW5zaW9uczoge31cbiAgICAgICAgfTtcbiAgICAgICAgLy8gbG9hZCBXZWJHTCBleHRlbnNpb25zXG4gICAgICAgIGxvYWRFeHRlbnNpb25zKCBjb250ZXh0V3JhcHBlciApO1xuICAgICAgICAvLyBhZGQgY29udGV4dCB3cmFwcGVyIHRvIG1hcFxuICAgICAgICBfY29udGV4dHNbIGdldElkKCBjYW52YXMgKSBdID0gY29udGV4dFdyYXBwZXI7XG4gICAgICAgIC8vIGJpbmQgdGhlIGNvbnRleHRcbiAgICAgICAgX2JvdW5kQ29udGV4dCA9IGNvbnRleHRXcmFwcGVyO1xuICAgICAgICByZXR1cm4gY29udGV4dFdyYXBwZXI7XG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHJpZXZlcyBhbiBleGlzdGluZyBXZWJHTCBjb250ZXh0IGFzc29jaWF0ZWQgd2l0aCB0aGUgcHJvdmlkZWQgYXJndW1lbnQgYW5kIGJpbmRzIGl0LiBXaGlsZSBib3VuZCwgdGhlIGFjdGl2ZSBjb250ZXh0IHdpbGwgYmUgdXNlZCBpbXBsaWNpdGx5IGJ5IGFueSBpbnN0YW50aWF0ZWQgYGVzcGVyYCBjb25zdHJ1Y3RzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge0hUTUxDYW52YXNFbGVtZW50fFN0cmluZ30gYXJnIC0gVGhlIENhbnZhcyBvYmplY3Qgb3IgQ2FudmFzIGlkZW50aWZpY2F0aW9uIHN0cmluZy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybnMge1dlYkdMQ29udGV4dH0gVGhpcyBuYW1lc3BhY2UsIHVzZWQgZm9yIGNoYWluaW5nLlxuICAgICAgICAgKi9cbiAgICAgICAgYmluZDogZnVuY3Rpb24oIGFyZyApIHtcbiAgICAgICAgICAgIHZhciB3cmFwcGVyID0gZ2V0Q29udGV4dFdyYXBwZXIoIGFyZyApO1xuICAgICAgICAgICAgaWYgKCB3cmFwcGVyICkge1xuICAgICAgICAgICAgICAgIF9ib3VuZENvbnRleHQgPSB3cmFwcGVyO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgJ05vIGNvbnRleHQgZXhpc3RzIGZvciBwcm92aWRlZCBhcmd1bWVudCBgJyArIGFyZyArICdgJztcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0cmlldmVzIGFuIGV4aXN0aW5nIFdlYkdMIGNvbnRleHQgYXNzb2NpYXRlZCB3aXRoIHRoZSBwcm92aWRlZCBhcmd1bWVudC4gSWYgbm8gY29udGV4dCBleGlzdHMsIG9uZSBpcyBjcmVhdGVkLlxuICAgICAgICAgKiBEdXJpbmcgY3JlYXRpb24gYXR0ZW1wdHMgdG8gbG9hZCBhbGwgZXh0ZW5zaW9ucyBmb3VuZCBhdDogaHR0cHM6Ly93d3cua2hyb25vcy5vcmcvcmVnaXN0cnkvd2ViZ2wvZXh0ZW5zaW9ucy8uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnR8U3RyaW5nfSBhcmcgLSBUaGUgQ2FudmFzIG9iamVjdCBvciBDYW52YXMgaWRlbnRpZmljYXRpb24gc3RyaW5nLiBPcHRpb25hbC5cbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9fSBvcHRpb25zIC0gUGFyYW1ldGVycyB0byB0aGUgd2ViZ2wgY29udGV4dCwgb25seSB1c2VkIGR1cmluZyBpbnN0YW50aWF0aW9uLiBPcHRpb25hbC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybnMge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dCBvYmplY3QuXG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCBhcmcsIG9wdGlvbnMgKSB7XG4gICAgICAgICAgICB2YXIgd3JhcHBlciA9IGdldENvbnRleHRXcmFwcGVyKCBhcmcgKTtcbiAgICAgICAgICAgIGlmICggd3JhcHBlciApIHtcbiAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgbmF0aXZlIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgICAgICAgICAgICAgcmV0dXJuIHdyYXBwZXIuZ2w7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBnZXQgY2FudmFzIGVsZW1lbnRcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBnZXRDYW52YXMoIGFyZyApO1xuICAgICAgICAgICAgLy8gdHJ5IHRvIGZpbmQgb3IgY3JlYXRlIGNvbnRleHRcbiAgICAgICAgICAgIGlmICggIWNhbnZhcyApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyAnQ29udGV4dCBjb3VsZCBub3QgYmUgYXNzb2NpYXRlZCB3aXRoIGFyZ3VtZW50IG9mIHR5cGUgYCcgKyAoIHR5cGVvZiBhcmcgKSArICdgJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBjb250ZXh0XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlQ29udGV4dFdyYXBwZXIoIGNhbnZhcywgb3B0aW9ucyApLmdsO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVzIGFuIGV4aXN0aW5nIFdlYkdMIGNvbnRleHQgb2JqZWN0IGZvciB0aGUgcHJvdmlkZWQgb3IgY3VycmVudGx5IGJvdW5kIG9iamVjdC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudHxTdHJpbmd9IGFyZyAtIFRoZSBDYW52YXMgb2JqZWN0IG9yIENhbnZhcyBpZGVudGlmaWNhdGlvbiBzdHJpbmcuIE9wdGlvbmFsLlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH19IG9wdGlvbnMgLSBQYXJhbWV0ZXJzIHRvIHRoZSB3ZWJnbCBjb250ZXh0LCBvbmx5IHVzZWQgZHVyaW5nIGluc3RhbnRpYXRpb24uIE9wdGlvbmFsLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcmV0dXJucyB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0IG9iamVjdC5cbiAgICAgICAgICovXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24oIGFyZyApIHtcbiAgICAgICAgICAgIHZhciB3cmFwcGVyID0gZ2V0Q29udGV4dFdyYXBwZXIoIGFyZyApO1xuICAgICAgICAgICAgaWYgKCB3cmFwcGVyICkge1xuICAgICAgICAgICAgICAgIC8vIGRlbGV0ZSB0aGUgY29udGV4dFxuICAgICAgICAgICAgICAgIGRlbGV0ZSBfY29udGV4dHNbIHdyYXBwZXIuaWQgXTtcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgaWYgY3VycmVudGx5IGJvdW5kXG4gICAgICAgICAgICAgICAgaWYgKCB3cmFwcGVyID09PSBfYm91bmRDb250ZXh0ICkge1xuICAgICAgICAgICAgICAgICAgICBfYm91bmRDb250ZXh0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93ICdDb250ZXh0IGNvdWxkIG5vdCBiZSBmb3VuZCBvciBkZWxldGVkIGZvciBhcmd1bWVudCBvZiB0eXBlIGAnICsgKCB0eXBlb2YgYXJnICkgKyAnYCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIHN1cHBvcnRlZCBleHRlbnNpb25zIGZvciB0aGUgcHJvdmlkZWQgb3IgY3VycmVudGx5IGJvdW5kIGNvbnRleHQgb2JqZWN0LiBJZiBubyBjb250ZXh0IGlzIGJvdW5kLCBpdCB3aWxsIHJldHVybiBhbiBlbXB0eSBhcnJheS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudHxTdHJpbmd9IGFyZyAtIFRoZSBDYW52YXMgb2JqZWN0IG9yIENhbnZhcyBpZGVudGlmaWNhdGlvbiBzdHJpbmcuIE9wdGlvbmFsLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9IEFsbCBzdXBwb3J0ZWQgZXh0ZW5zaW9ucy5cbiAgICAgICAgICovXG4gICAgICAgIHN1cHBvcnRlZEV4dGVuc2lvbnM6IGZ1bmN0aW9uKCBhcmcgKSB7XG4gICAgICAgICAgICB2YXIgd3JhcHBlciA9IGdldENvbnRleHRXcmFwcGVyKCBhcmcgKTtcbiAgICAgICAgICAgIGlmICggd3JhcHBlciApIHtcbiAgICAgICAgICAgICAgICB2YXIgZXh0ZW5zaW9ucyA9IHdyYXBwZXIuZXh0ZW5zaW9ucztcbiAgICAgICAgICAgICAgICB2YXIgc3VwcG9ydGVkID0gW107XG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoIGV4dGVuc2lvbnMgKS5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIGV4dGVuc2lvbnNbIGtleSBdICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VwcG9ydGVkLnB1c2goIGtleSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1cHBvcnRlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93ICdObyBjb250ZXh0IGlzIGN1cnJlbnRseSBib3VuZCBvciBjb3VsZCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIHByb3ZpZGVkIGFyZ3VtZW50JztcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgdW5zdXBwb3J0ZWQgZXh0ZW5zaW9ucyBmb3IgdGhlIHByb3ZpZGVkIG9yIGN1cnJlbnRseSBib3VuZCBjb250ZXh0IG9iamVjdC4gSWYgbm8gY29udGV4dCBpcyBib3VuZCwgaXQgd2lsbCByZXR1cm4gYW4gZW1wdHkgYXJyYXkuXG4gICAgICAgICAqIGFuIGVtcHR5IGFycmF5LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge0hUTUxDYW52YXNFbGVtZW50fFN0cmluZ30gYXJnIC0gVGhlIENhbnZhcyBvYmplY3Qgb3IgQ2FudmFzIGlkZW50aWZpY2F0aW9uIHN0cmluZy4gT3B0aW9uYWwuXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX0gQWxsIHVuc3VwcG9ydGVkIGV4dGVuc2lvbnMuXG4gICAgICAgICAqL1xuICAgICAgICB1bnN1cHBvcnRlZEV4dGVuc2lvbnM6IGZ1bmN0aW9uKCBhcmcgKSB7XG4gICAgICAgICAgICB2YXIgd3JhcHBlciA9IGdldENvbnRleHRXcmFwcGVyKCBhcmcgKTtcbiAgICAgICAgICAgIGlmICggd3JhcHBlciApIHtcbiAgICAgICAgICAgICAgICB2YXIgZXh0ZW5zaW9ucyA9IHdyYXBwZXIuZXh0ZW5zaW9ucztcbiAgICAgICAgICAgICAgICB2YXIgdW5zdXBwb3J0ZWQgPSBbXTtcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyggZXh0ZW5zaW9ucyApLmZvckVhY2goIGZ1bmN0aW9uKCBrZXkgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggIWV4dGVuc2lvbnNbIGtleSBdICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdW5zdXBwb3J0ZWQucHVzaCgga2V5ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5zdXBwb3J0ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyAnTm8gY29udGV4dCBpcyBjdXJyZW50bHkgYm91bmQgb3IgY291bGQgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBwcm92aWRlZCBhcmd1bWVudCc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoZWNrcyBpZiBhbiBleHRlbnNpb24gaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGxvYWRlZCBmb3IgdGhlIHByb3ZpZGVkIG9yIGN1cnJlbnRseSBib3VuZCBjb250ZXh0IG9iamVjdC5cbiAgICAgICAgICogJ2ZhbHNlJy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudHxTdHJpbmd9IGFyZyAtIFRoZSBDYW52YXMgb2JqZWN0IG9yIENhbnZhcyBpZGVudGlmaWNhdGlvbiBzdHJpbmcuIE9wdGlvbmFsLlxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXh0ZW5zaW9uIC0gVGhlIGV4dGVuc2lvbiBuYW1lLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIHByb3ZpZGVkIGV4dGVuc2lvbiBoYXMgYmVlbiBsb2FkZWQgc3VjY2Vzc2Z1bGx5LlxuICAgICAgICAgKi9cbiAgICAgICAgY2hlY2tFeHRlbnNpb246IGZ1bmN0aW9uKCBhcmcsIGV4dGVuc2lvbiApIHtcbiAgICAgICAgICAgIGlmICggIWV4dGVuc2lvbiApIHtcbiAgICAgICAgICAgICAgICAvLyBzaGlmdCBwYXJhbWV0ZXJzIGlmIG5vIGNhbnZhcyBhcmcgaXMgcHJvdmlkZWRcbiAgICAgICAgICAgICAgICBleHRlbnNpb24gPSBhcmc7XG4gICAgICAgICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHdyYXBwZXIgPSBnZXRDb250ZXh0V3JhcHBlciggYXJnICk7XG4gICAgICAgICAgICBpZiAoIHdyYXBwZXIgKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV4dGVuc2lvbnMgPSB3cmFwcGVyLmV4dGVuc2lvbnM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVuc2lvbnNbIGV4dGVuc2lvbiBdID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgJ05vIGNvbnRleHQgaXMgY3VycmVudGx5IGJvdW5kIG9yIGNvdWxkIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgcHJvdmlkZWQgYXJndW1lbnQnO1xuICAgICAgICB9XG4gICAgfTtcblxufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIFN0YWNrID0gcmVxdWlyZSgnLi4vdXRpbC9TdGFjaycpO1xyXG4gICAgdmFyIFN0YWNrTWFwID0gcmVxdWlyZSgnLi4vdXRpbC9TdGFja01hcCcpO1xyXG4gICAgdmFyIF9zdGF0ZXMgPSB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBXZWJHTENvbnRleHRTdGF0ZSgpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgY3VycmVudGx5IGJvdW5kIHZlcnRleCBidWZmZXIuXHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmJvdW5kVmVydGV4QnVmZmVyID0gbnVsbDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIGN1cnJlbnRseSBlbmFibGVkIHZlcnRleCBhdHRyaWJ1dGVzLlxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5lbmFibGVkVmVydGV4QXR0cmlidXRlcyA9IHtcclxuICAgICAgICAgICAgJzAnOiBmYWxzZSxcclxuICAgICAgICAgICAgJzEnOiBmYWxzZSxcclxuICAgICAgICAgICAgJzInOiBmYWxzZSxcclxuICAgICAgICAgICAgJzMnOiBmYWxzZSxcclxuICAgICAgICAgICAgJzQnOiBmYWxzZSxcclxuICAgICAgICAgICAgJzUnOiBmYWxzZVxyXG4gICAgICAgICAgICAvLyAuLi4gb3RoZXJzIHdpbGwgYmUgYWRkZWQgYXMgbmVlZGVkXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIGN1cnJlbnRseSBib3VuZCBpbmRleCBidWZmZXIuXHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmJvdW5kSW5kZXhCdWZmZXIgPSBudWxsO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgc3RhY2sgb2YgcHVzaGVkIHNoYWRlcnMuXHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnNoYWRlcnMgPSBuZXcgU3RhY2soKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIHN0YWNrIG9mIHB1c2hlZCB2aWV3cG9ydHMuXHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnZpZXdwb3J0cyA9IG5ldyBTdGFjaygpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgc3RhY2sgb2YgcHVzaGVkIHJlbmRlciB0YXJnZXRzLlxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yZW5kZXJUYXJnZXRzID0gbmV3IFN0YWNrKCk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoZSBtYXAgb2Ygc3RhY2tzIHB1c2hlZCB0ZXh0dXJlMkRzLCBrZXllZCBieSB0ZXh0dXJlIHVuaXQgaW5kZXguXHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnRleHR1cmUyRHMgPSBuZXcgU3RhY2tNYXAoKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIG1hcCBvZiBwdXNoZWQgdGV4dHVyZTJEcywsIGtleWVkIGJ5IHRleHR1cmUgdW5pdCBpbmRleC5cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMudGV4dHVyZUN1YmVNYXBzID0gbmV3IFN0YWNrTWFwKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XHJcblxyXG4gICAgICAgIGdldDogZnVuY3Rpb24oIGdsICkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSBnbC5jYW52YXMuaWQ7XHJcbiAgICAgICAgICAgIGlmICggIV9zdGF0ZXNbIGlkIF0gKSB7XHJcbiAgICAgICAgICAgICAgICBfc3RhdGVzWyBpZCBdID0gbmV3IFdlYkdMQ29udGV4dFN0YXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIF9zdGF0ZXNbIGlkIF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgICAgICBJbmRleEJ1ZmZlcjogcmVxdWlyZSgnLi9jb3JlL0luZGV4QnVmZmVyJyksXHJcbiAgICAgICAgUmVuZGVyYWJsZTogcmVxdWlyZSgnLi9jb3JlL1JlbmRlcmFibGUnKSxcclxuICAgICAgICBSZW5kZXJUYXJnZXQ6IHJlcXVpcmUoJy4vY29yZS9SZW5kZXJUYXJnZXQnKSxcclxuICAgICAgICBTaGFkZXI6IHJlcXVpcmUoJy4vY29yZS9TaGFkZXInKSxcclxuICAgICAgICBUZXh0dXJlMkQ6IHJlcXVpcmUoJy4vY29yZS9UZXh0dXJlMkQnKSxcclxuICAgICAgICBDb2xvclRleHR1cmUyRDogcmVxdWlyZSgnLi9jb3JlL0NvbG9yVGV4dHVyZTJEJyksXHJcbiAgICAgICAgRGVwdGhUZXh0dXJlMkQ6IHJlcXVpcmUoJy4vY29yZS9EZXB0aFRleHR1cmUyRCcpLFxyXG4gICAgICAgIFRleHR1cmVDdWJlTWFwOiByZXF1aXJlKCcuL2NvcmUvVGV4dHVyZUN1YmVNYXAnKSxcclxuICAgICAgICBWZXJ0ZXhCdWZmZXI6IHJlcXVpcmUoJy4vY29yZS9WZXJ0ZXhCdWZmZXInKSxcclxuICAgICAgICBWZXJ0ZXhQYWNrYWdlOiByZXF1aXJlKCcuL2NvcmUvVmVydGV4UGFja2FnZScpLFxyXG4gICAgICAgIFZpZXdwb3J0OiByZXF1aXJlKCcuL2NvcmUvVmlld3BvcnQnKSxcclxuICAgICAgICBXZWJHTENvbnRleHQ6IHJlcXVpcmUoJy4vY29yZS9XZWJHTENvbnRleHQnKVxyXG4gICAgfTtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldEl0ZXJhdG9yKCBhcmcgKSB7XHJcbiAgICAgICAgdmFyIGkgPSAtMTtcclxuICAgICAgICB2YXIgbGVuO1xyXG4gICAgICAgIGlmICggQXJyYXkuaXNBcnJheSggYXJnICkgKSB7XHJcbiAgICAgICAgICAgIGxlbiA9IGFyZy5sZW5ndGg7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIHJldHVybiBpIDwgbGVuID8gaSA6IG51bGw7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoIGFyZyApO1xyXG4gICAgICAgIGxlbiA9IGtleXMubGVuZ3RoO1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICByZXR1cm4gaSA8IGxlbiA/IGtleXNbaV0gOiBudWxsO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gb25jZSggZm4gKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoIGZuID09PSBudWxsICkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZuLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcclxuICAgICAgICAgICAgZm4gPSBudWxsO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZWFjaCggb2JqZWN0LCBpdGVyYXRvciwgY2FsbGJhY2sgKSB7XHJcbiAgICAgICAgY2FsbGJhY2sgPSBvbmNlKCBjYWxsYmFjayApO1xyXG4gICAgICAgIHZhciBrZXk7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlZCA9IDA7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRvbmUoIGVyciApIHtcclxuICAgICAgICAgICAgY29tcGxldGVkLS07XHJcbiAgICAgICAgICAgIGlmICggZXJyICkge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soIGVyciApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBrZXkgPT09IG51bGwgJiYgY29tcGxldGVkIDw9IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiBrZXkgaXMgbnVsbCBpbiBjYXNlIGl0ZXJhdG9yIGlzbid0IGV4aGF1c3RlZCBhbmQgZG9uZVxyXG4gICAgICAgICAgICAgICAgLy8gd2FzIHJlc29sdmVkIHN5bmNocm9ub3VzbHkuXHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayggbnVsbCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgaXRlciA9IGdldEl0ZXJhdG9yKG9iamVjdCk7XHJcbiAgICAgICAgd2hpbGUgKCAoIGtleSA9IGl0ZXIoKSApICE9PSBudWxsICkge1xyXG4gICAgICAgICAgICBjb21wbGV0ZWQgKz0gMTtcclxuICAgICAgICAgICAgaXRlcmF0b3IoIG9iamVjdFsga2V5IF0sIGtleSwgZG9uZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGNvbXBsZXRlZCA9PT0gMCApIHtcclxuICAgICAgICAgICAgY2FsbGJhY2soIG51bGwgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEV4ZWN1dGUgYSBzZXQgb2YgZnVuY3Rpb25zIGFzeW5jaHJvbm91c2x5LCBvbmNlIGFsbCBoYXZlIGJlZW5cclxuICAgICAgICAgKiBjb21wbGV0ZWQsIGV4ZWN1dGUgdGhlIHByb3ZpZGVkIGNhbGxiYWNrIGZ1bmN0aW9uLiBKb2JzIG1heSBiZSBwYXNzZWRcclxuICAgICAgICAgKiBhcyBhbiBhcnJheSBvciBvYmplY3QuIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB3aWxsIGJlIHBhc3NlZCB0aGVcclxuICAgICAgICAgKiByZXN1bHRzIGluIHRoZSBzYW1lIGZvcm1hdCBhcyB0aGUgdGFza3MuIEFsbCB0YXNrcyBtdXN0IGhhdmUgYWNjZXB0XHJcbiAgICAgICAgICogYW5kIGV4ZWN1dGUgYSBjYWxsYmFjayBmdW5jdGlvbiB1cG9uIGNvbXBsZXRpb24uXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gdGFza3MgLSBUaGUgc2V0IG9mIGZ1bmN0aW9ucyB0byBleGVjdXRlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIHVwb24gY29tcGxldGlvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwYXJhbGxlbDogZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IEFycmF5LmlzQXJyYXkoIHRhc2tzICkgPyBbXSA6IHt9O1xyXG4gICAgICAgICAgICBlYWNoKCB0YXNrcywgZnVuY3Rpb24oIHRhc2ssIGtleSwgZG9uZSApIHtcclxuICAgICAgICAgICAgICAgIHRhc2soIGZ1bmN0aW9uKCBlcnIsIHJlcyApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzWyBrZXkgXSA9IHJlcztcclxuICAgICAgICAgICAgICAgICAgICBkb25lKCBlcnIgKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiggZXJyICkge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soIGVyciwgcmVzdWx0cyApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZW5kcyBhbiBHRVQgcmVxdWVzdCBjcmVhdGUgYW4gSW1hZ2Ugb2JqZWN0LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIFRoZSBYSFIgb3B0aW9ucy5cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMudXJsIC0gVGhlIFVSTCBmb3IgdGhlIHJlc291cmNlLlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLnN1Y2Nlc3MgLSBUaGUgc3VjY2VzcyBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9ucy5lcnJvciAtIFRoZSBlcnJvciBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgICAgICovXG4gICAgICAgIGxvYWQ6IGZ1bmN0aW9uICggb3B0aW9ucyApIHtcbiAgICAgICAgICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBvcHRpb25zLnN1Y2Nlc3MgKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc3VjY2VzcyggaW1hZ2UgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW1hZ2Uub25lcnJvciA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgICAgICAgICBpZiAoIG9wdGlvbnMuZXJyb3IgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlcnIgPSAnVW5hYmxlIHRvIGxvYWQgaW1hZ2UgZnJvbSBVUkw6IGAnICsgZXZlbnQucGF0aFswXS5jdXJyZW50U3JjICsgJ2AnO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmVycm9yKCBlcnIgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gb3B0aW9ucy51cmw7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW50aWF0ZXMgYSBzdGFjayBvYmplY3QuXHJcbiAgICAgKiBAY2xhc3MgU3RhY2tcclxuICAgICAqIEBjbGFzc2Rlc2MgQSBzdGFjayBpbnRlcmZhY2UuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFN0YWNrKCkge1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHVzaCBhIHZhbHVlIG9udG8gdGhlIHN0YWNrLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgLSBUaGUgdmFsdWUuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgVGhlIHN0YWNrIG9iamVjdCBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFN0YWNrLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oIHZhbHVlICkge1xyXG4gICAgICAgIHRoaXMuZGF0YS5wdXNoKCB2YWx1ZSApO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFBvcCBhIHZhbHVlIG9mZiB0aGUgc3RhY2suIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgdGhlcmUgaXMgbm8gdmFsdWUgb25cclxuICAgICAqIHRoZSBzdGFjay5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIC0gVGhlIHZhbHVlLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIFRoZSB2YWx1ZSBwb3BwZWQgb2ZmIHRoZSBzdGFjay5cclxuICAgICAqL1xyXG4gICAgU3RhY2sucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEucG9wKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCB0b3Agb2YgdGhlIHN0YWNrLCB3aXRob3V0IHJlbW92aW5nIGl0LiBSZXR1cm5zXHJcbiAgICAgKiBgdW5kZWZpbmVkYCBpZiB0aGVyZSBpcyBubyB2YWx1ZSBvbiB0aGUgc3RhY2suXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgVGhlIHZhbHVlIGF0IHRoZSB0b3Agb2YgdGhlIHN0YWNrLlxyXG4gICAgICovXHJcbiAgICBTdGFjay5wcm90b3R5cGUudG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5kYXRhLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgaWYgKCBpbmRleCA8IDAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVsgaW5kZXggXTtcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTdGFjaztcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBTdGFjayA9IHJlcXVpcmUoJy4vU3RhY2snKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc3RhbnRpYXRlcyBhIG1hcCBvZiBzdGFjayBvYmplY3RzLlxyXG4gICAgICogQGNsYXNzIFN0YWNrTWFwXHJcbiAgICAgKiBAY2xhc3NkZXNjIEEgaGFzaG1hcCBvZiBzdGFja3MuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFN0YWNrTWFwKCkge1xyXG4gICAgICAgIHRoaXMuc3RhY2tzID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQdXNoIGEgdmFsdWUgb250byB0aGUgc3RhY2sgdW5kZXIgYSBnaXZlbiBrZXkuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGtleSAtIFRoZSBrZXkuXHJcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIC0gVGhlIHZhbHVlIHRvIHB1c2ggb250byB0aGUgc3RhY2suXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgVGhlIHN0YWNrIG9iamVjdCBmb3IgY2hhaW5pbmcuXHJcbiAgICAgKi9cclxuICAgIFN0YWNrTWFwLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XHJcbiAgICAgICAgaWYgKCAhdGhpcy5zdGFja3NbIGtleSBdICkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YWNrc1sga2V5IF0gPSBuZXcgU3RhY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zdGFja3NbIGtleSBdLnB1c2goIHZhbHVlICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUG9wIGEgdmFsdWUgb2ZmIHRoZSBzdGFjay4gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiB0aGVyZSBpcyBubyB2YWx1ZSBvblxyXG4gICAgICogdGhlIHN0YWNrLCBvciB0aGVyZSBpcyBubyBzdGFjayBmb3IgdGhlIGtleS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5IC0gVGhlIGtleS5cclxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgLSBUaGUgdmFsdWUgdG8gcHVzaCBvbnRvIHRoZSBzdGFjay5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgdmFsdWUgcG9wcGVkIG9mZiB0aGUgc3RhY2suXHJcbiAgICAgKi9cclxuICAgIFN0YWNrTWFwLnByb3RvdHlwZS5wb3AgPSBmdW5jdGlvbigga2V5ICkge1xyXG4gICAgICAgIGlmICggIXRoaXMuc3RhY2tzWyBrZXkgXSApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5zdGFja3NbIGtleSBdLnBvcCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgdG9wIG9mIHRoZSBzdGFjaywgd2l0aG91dCByZW1vdmluZyBpdC4gUmV0dXJuc1xyXG4gICAgICogYHVuZGVmaW5lZGAgaWYgdGhlcmUgaXMgbm8gdmFsdWUgb24gdGhlIHN0YWNrIG9yIG5vIHN0YWNrIGZvciB0aGUga2V5LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgLSBUaGUga2V5LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIFRoZSB2YWx1ZSBhdCB0aGUgdG9wIG9mIHRoZSBzdGFjay5cclxuICAgICAqL1xyXG4gICAgU3RhY2tNYXAucHJvdG90eXBlLnRvcCA9IGZ1bmN0aW9uKCBrZXkgKSB7XHJcbiAgICAgICAgaWYgKCAhdGhpcy5zdGFja3NbIGtleSBdICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnN0YWNrc1sga2V5IF0udG9wKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gU3RhY2tNYXA7XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgVXRpbCA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBhcmd1bWVudCBpcyBhbiBBcnJheSwgQXJyYXlCdWZmZXIsIG9yIEFycmF5QnVmZmVyVmlldy5cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHsqfSBhcmcgLSBUaGUgYXJndW1lbnQgdG8gdGVzdC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbH0gLSBXaGV0aGVyIG9yIG5vdCBpdCBpcyBhIGNhbnZhcyB0eXBlLlxyXG4gICAgICovXHJcbiAgICBVdGlsLmlzQXJyYXlUeXBlID0gZnVuY3Rpb24oIGFyZyApIHtcclxuICAgICAgICByZXR1cm4gYXJnIGluc3RhbmNlb2YgQXJyYXkgfHxcclxuICAgICAgICAgICAgYXJnIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgfHxcclxuICAgICAgICAgICAgQXJyYXlCdWZmZXIuaXNWaWV3KCBhcmcgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGFyZ3VtZW50IGlzIG9uZSBvZiB0aGUgV2ViR0wgYHRleEltYWdlMkRgIG92ZXJyaWRkZW5cclxuICAgICAqIGNhbnZhcyB0eXBlcy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0geyp9IGFyZyAtIFRoZSBhcmd1bWVudCB0byB0ZXN0LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sfSAtIFdoZXRoZXIgb3Igbm90IGl0IGlzIGEgY2FudmFzIHR5cGUuXHJcbiAgICAgKi9cclxuICAgIFV0aWwuaXNDYW52YXNUeXBlID0gZnVuY3Rpb24oIGFyZyApIHtcclxuICAgICAgICByZXR1cm4gYXJnIGluc3RhbmNlb2YgSW1hZ2VEYXRhIHx8XHJcbiAgICAgICAgICAgIGFyZyBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQgfHxcclxuICAgICAgICAgICAgYXJnIGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQgfHxcclxuICAgICAgICAgICAgYXJnIGluc3RhbmNlb2YgSFRNTFZpZGVvRWxlbWVudDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHRleHR1cmUgTVVTVCBiZSBhIHBvd2VyLW9mLXR3by4gT3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc3BlYyAtIFRoZSB0ZXh0dXJlIHNwZWNpZmljYXRpb24gb2JqZWN0LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtib29sfSAtIFdoZXRoZXIgb3Igbm90IHRoZSB0ZXh0dXJlIG11c3QgYmUgYSBwb3dlciBvZiB0d28uXHJcbiAgICAgKi9cclxuICAgIFV0aWwubXVzdEJlUG93ZXJPZlR3byA9IGZ1bmN0aW9uKCBzcGVjICkge1xyXG4gICAgICAgIC8vIEFjY29yZGluZyB0bzpcclxuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViR0xfQVBJL1R1dG9yaWFsL1VzaW5nX3RleHR1cmVzX2luX1dlYkdMI05vbl9wb3dlci1vZi10d29fdGV4dHVyZXNcclxuICAgICAgICAvLyBOUE9UIHRleHR1cmVzIGNhbm5vdCBiZSB1c2VkIHdpdGggbWlwbWFwcGluZyBhbmQgdGhleSBtdXN0IG5vdCBcInJlcGVhdFwiXHJcbiAgICAgICAgcmV0dXJuIHNwZWMubWlwTWFwIHx8XHJcbiAgICAgICAgICAgIHNwZWMud3JhcFMgPT09ICdSRVBFQVQnIHx8XHJcbiAgICAgICAgICAgIHNwZWMud3JhcFMgPT09ICdNSVJST1JFRF9SRVBFQVQnIHx8XHJcbiAgICAgICAgICAgIHNwZWMud3JhcFQgPT09ICdSRVBFQVQnIHx8XHJcbiAgICAgICAgICAgIHNwZWMud3JhcFQgPT09ICdNSVJST1JFRF9SRVBFQVQnO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYSBudW1iZXIgYW5kIGlzIGFuIGludGVnZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtpbnRlZ2VyfSBudW0gLSBUaGUgbnVtYmVyIHRvIHRlc3QuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gV2hldGhlciBvciBub3QgdGhlIHZhbHVlIGlzIGEgbnVtYmVyLlxyXG4gICAgICovXHJcbiAgICBVdGlsLmlzSW50ZWdlciA9IGZ1bmN0aW9uKCBudW0gKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBudW0gPT09ICdudW1iZXInICYmICggbnVtICUgMSApID09PSAwO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgcHJvdmlkZWQgaW50ZWdlciBpcyBhIHBvd2VyIG9mIHR3by5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge2ludGVnZXJ9IG51bSAtIFRoZSBudW1iZXIgdG8gdGVzdC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBXaGV0aGVyIG9yIG5vdCB0aGUgbnVtYmVyIGlzIGEgcG93ZXIgb2YgdHdvLlxyXG4gICAgICovXHJcbiAgICBVdGlsLmlzUG93ZXJPZlR3byA9IGZ1bmN0aW9uKCBudW0gKSB7XHJcbiAgICAgICAgcmV0dXJuICggbnVtICE9PSAwICkgPyAoIG51bSAmICggbnVtIC0gMSApICkgPT09IDAgOiBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBuZXh0IGhpZ2hlc3QgcG93ZXIgb2YgdHdvIGZvciBhIG51bWJlci5cclxuICAgICAqXHJcbiAgICAgKiBFeC5cclxuICAgICAqXHJcbiAgICAgKiAgICAgMjAwIC0+IDI1NlxyXG4gICAgICogICAgIDI1NiAtPiAyNTZcclxuICAgICAqICAgICAyNTcgLT4gNTEyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtpbnRlZ2VyfSBudW0gLSBUaGUgbnVtYmVyIHRvIG1vZGlmeS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7aW50ZWdlcn0gLSBOZXh0IGhpZ2hlc3QgcG93ZXIgb2YgdHdvLlxyXG4gICAgICovXHJcbiAgICBVdGlsLm5leHRIaWdoZXN0UG93ZXJPZlR3byA9IGZ1bmN0aW9uKCBudW0gKSB7XHJcbiAgICAgICAgdmFyIGk7XHJcbiAgICAgICAgaWYgKCBudW0gIT09IDAgKSB7XHJcbiAgICAgICAgICAgIG51bSA9IG51bS0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKCBpPTE7IGk8MzI7IGk8PD0xICkge1xyXG4gICAgICAgICAgICBudW0gPSBudW0gfCBudW0gPj4gaTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bSArIDE7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgdGhlIHRleHR1cmUgbXVzdCBiZSBhIFBPVCwgcmVzaXplcyBhbmQgcmV0dXJucyB0aGUgaW1hZ2UuXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzcGVjIC0gVGhlIHRleHR1cmUgc3BlY2lmaWNhdGlvbiBvYmplY3QuXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxJbWFnZUVsZW1lbnR9IGltZyAtIFRoZSBpbWFnZSBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIFV0aWwucmVzaXplQ2FudmFzID0gZnVuY3Rpb24oIHNwZWMsIGltZyApIHtcclxuICAgICAgICBpZiAoICFVdGlsLm11c3RCZVBvd2VyT2ZUd28oIHNwZWMgKSB8fFxyXG4gICAgICAgICAgICAoIFV0aWwuaXNQb3dlck9mVHdvKCBpbWcud2lkdGggKSAmJiBVdGlsLmlzUG93ZXJPZlR3byggaW1nLmhlaWdodCApICkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpbWc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNyZWF0ZSBhbiBlbXB0eSBjYW52YXMgZWxlbWVudFxyXG4gICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IFV0aWwubmV4dEhpZ2hlc3RQb3dlck9mVHdvKCBpbWcud2lkdGggKTtcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gVXRpbC5uZXh0SGlnaGVzdFBvd2VyT2ZUd28oIGltZy5oZWlnaHQgKTtcclxuICAgICAgICAvLyBjb3B5IHRoZSBpbWFnZSBjb250ZW50cyB0byB0aGUgY2FudmFzXHJcbiAgICAgICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XHJcbiAgICAgICAgY3R4LmRyYXdJbWFnZSggaW1nLCAwLCAwLCBpbWcud2lkdGgsIGltZy5oZWlnaHQsIDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCApO1xyXG4gICAgICAgIHJldHVybiBjYW52YXM7XHJcbiAgICB9O1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gVXRpbDtcclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZW5kcyBhbiBYTUxIdHRwUmVxdWVzdCBHRVQgcmVxdWVzdCB0byB0aGUgc3VwcGxpZWQgdXJsLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIFRoZSBYSFIgb3B0aW9ucy5cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMudXJsIC0gVGhlIFVSTCBmb3IgdGhlIHJlc291cmNlLlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLnN1Y2Nlc3MgLSBUaGUgc3VjY2VzcyBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9ucy5lcnJvciAtIFRoZSBlcnJvciBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9ucy5yZXNwb25zZVR5cGUgLSBUaGUgcmVzcG9uc2VUeXBlIG9mIHRoZSBYSFIuXG4gICAgICAgICAqL1xuICAgICAgICBsb2FkOiBmdW5jdGlvbiAoIG9wdGlvbnMgKSB7XG4gICAgICAgICAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgcmVxdWVzdC5vcGVuKCAnR0VUJywgb3B0aW9ucy51cmwsIHRydWUgKTtcbiAgICAgICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gb3B0aW9ucy5yZXNwb25zZVR5cGU7XG4gICAgICAgICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICggcmVxdWVzdC5yZWFkeVN0YXRlID09PSA0ICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHJlcXVlc3Quc3RhdHVzID09PSAyMDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIG9wdGlvbnMuc3VjY2VzcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnN1Y2Nlc3MoIHJlcXVlc3QucmVzcG9uc2UgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggb3B0aW9ucy5lcnJvciApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmVycm9yKCAnR0VUICcgKyByZXF1ZXN0LnJlc3BvbnNlVVJMICsgJyAnICsgcmVxdWVzdC5zdGF0dXMgKyAnICgnICsgcmVxdWVzdC5zdGF0dXNUZXh0ICsgJyknICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KCkpO1xuIiwidmFyIGpzb24gPSB0eXBlb2YgSlNPTiAhPT0gJ3VuZGVmaW5lZCcgPyBKU09OIDogcmVxdWlyZSgnanNvbmlmeScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmosIG9wdHMpIHtcbiAgICBpZiAoIW9wdHMpIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIG9wdHMgPT09ICdmdW5jdGlvbicpIG9wdHMgPSB7IGNtcDogb3B0cyB9O1xuICAgIHZhciBzcGFjZSA9IG9wdHMuc3BhY2UgfHwgJyc7XG4gICAgaWYgKHR5cGVvZiBzcGFjZSA9PT0gJ251bWJlcicpIHNwYWNlID0gQXJyYXkoc3BhY2UrMSkuam9pbignICcpO1xuICAgIHZhciBjeWNsZXMgPSAodHlwZW9mIG9wdHMuY3ljbGVzID09PSAnYm9vbGVhbicpID8gb3B0cy5jeWNsZXMgOiBmYWxzZTtcbiAgICB2YXIgcmVwbGFjZXIgPSBvcHRzLnJlcGxhY2VyIHx8IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuXG4gICAgdmFyIGNtcCA9IG9wdHMuY21wICYmIChmdW5jdGlvbiAoZikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHZhciBhb2JqID0geyBrZXk6IGEsIHZhbHVlOiBub2RlW2FdIH07XG4gICAgICAgICAgICAgICAgdmFyIGJvYmogPSB7IGtleTogYiwgdmFsdWU6IG5vZGVbYl0gfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZihhb2JqLCBib2JqKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgfSkob3B0cy5jbXApO1xuXG4gICAgdmFyIHNlZW4gPSBbXTtcbiAgICByZXR1cm4gKGZ1bmN0aW9uIHN0cmluZ2lmeSAocGFyZW50LCBrZXksIG5vZGUsIGxldmVsKSB7XG4gICAgICAgIHZhciBpbmRlbnQgPSBzcGFjZSA/ICgnXFxuJyArIG5ldyBBcnJheShsZXZlbCArIDEpLmpvaW4oc3BhY2UpKSA6ICcnO1xuICAgICAgICB2YXIgY29sb25TZXBhcmF0b3IgPSBzcGFjZSA/ICc6ICcgOiAnOic7XG5cbiAgICAgICAgaWYgKG5vZGUgJiYgbm9kZS50b0pTT04gJiYgdHlwZW9mIG5vZGUudG9KU09OID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBub2RlID0gbm9kZS50b0pTT04oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5vZGUgPSByZXBsYWNlci5jYWxsKHBhcmVudCwga2V5LCBub2RlKTtcblxuICAgICAgICBpZiAobm9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBub2RlICE9PSAnb2JqZWN0JyB8fCBub2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4ganNvbi5zdHJpbmdpZnkobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQXJyYXkobm9kZSkpIHtcbiAgICAgICAgICAgIHZhciBvdXQgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gc3RyaW5naWZ5KG5vZGUsIGksIG5vZGVbaV0sIGxldmVsKzEpIHx8IGpzb24uc3RyaW5naWZ5KG51bGwpO1xuICAgICAgICAgICAgICAgIG91dC5wdXNoKGluZGVudCArIHNwYWNlICsgaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gJ1snICsgb3V0LmpvaW4oJywnKSArIGluZGVudCArICddJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChzZWVuLmluZGV4T2Yobm9kZSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN5Y2xlcykgcmV0dXJuIGpzb24uc3RyaW5naWZ5KCdfX2N5Y2xlX18nKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDb252ZXJ0aW5nIGNpcmN1bGFyIHN0cnVjdHVyZSB0byBKU09OJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHNlZW4ucHVzaChub2RlKTtcblxuICAgICAgICAgICAgdmFyIGtleXMgPSBvYmplY3RLZXlzKG5vZGUpLnNvcnQoY21wICYmIGNtcChub2RlKSk7XG4gICAgICAgICAgICB2YXIgb3V0ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBzdHJpbmdpZnkobm9kZSwga2V5LCBub2RlW2tleV0sIGxldmVsKzEpO1xuXG4gICAgICAgICAgICAgICAgaWYoIXZhbHVlKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIHZhciBrZXlWYWx1ZSA9IGpzb24uc3RyaW5naWZ5KGtleSlcbiAgICAgICAgICAgICAgICAgICAgKyBjb2xvblNlcGFyYXRvclxuICAgICAgICAgICAgICAgICAgICArIHZhbHVlO1xuICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICBvdXQucHVzaChpbmRlbnQgKyBzcGFjZSArIGtleVZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlZW4uc3BsaWNlKHNlZW4uaW5kZXhPZihub2RlKSwgMSk7XG4gICAgICAgICAgICByZXR1cm4gJ3snICsgb3V0LmpvaW4oJywnKSArIGluZGVudCArICd9JztcbiAgICAgICAgfVxuICAgIH0pKHsgJyc6IG9iaiB9LCAnJywgb2JqLCAwKTtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeCkge1xuICAgIHJldHVybiB7fS50b1N0cmluZy5jYWxsKHgpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkgfHwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdHJ1ZSB9O1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAoaGFzLmNhbGwob2JqLCBrZXkpKSBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59O1xuIiwiZXhwb3J0cy5wYXJzZSA9IHJlcXVpcmUoJy4vbGliL3BhcnNlJyk7XG5leHBvcnRzLnN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vbGliL3N0cmluZ2lmeScpO1xuIiwidmFyIGF0LCAvLyBUaGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgY2hhcmFjdGVyXG4gICAgY2gsIC8vIFRoZSBjdXJyZW50IGNoYXJhY3RlclxuICAgIGVzY2FwZWUgPSB7XG4gICAgICAgICdcIic6ICAnXCInLFxuICAgICAgICAnXFxcXCc6ICdcXFxcJyxcbiAgICAgICAgJy8nOiAgJy8nLFxuICAgICAgICBiOiAgICAnXFxiJyxcbiAgICAgICAgZjogICAgJ1xcZicsXG4gICAgICAgIG46ICAgICdcXG4nLFxuICAgICAgICByOiAgICAnXFxyJyxcbiAgICAgICAgdDogICAgJ1xcdCdcbiAgICB9LFxuICAgIHRleHQsXG5cbiAgICBlcnJvciA9IGZ1bmN0aW9uIChtKSB7XG4gICAgICAgIC8vIENhbGwgZXJyb3Igd2hlbiBzb21ldGhpbmcgaXMgd3JvbmcuXG4gICAgICAgIHRocm93IHtcbiAgICAgICAgICAgIG5hbWU6ICAgICdTeW50YXhFcnJvcicsXG4gICAgICAgICAgICBtZXNzYWdlOiBtLFxuICAgICAgICAgICAgYXQ6ICAgICAgYXQsXG4gICAgICAgICAgICB0ZXh0OiAgICB0ZXh0XG4gICAgICAgIH07XG4gICAgfSxcbiAgICBcbiAgICBuZXh0ID0gZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgLy8gSWYgYSBjIHBhcmFtZXRlciBpcyBwcm92aWRlZCwgdmVyaWZ5IHRoYXQgaXQgbWF0Y2hlcyB0aGUgY3VycmVudCBjaGFyYWN0ZXIuXG4gICAgICAgIGlmIChjICYmIGMgIT09IGNoKSB7XG4gICAgICAgICAgICBlcnJvcihcIkV4cGVjdGVkICdcIiArIGMgKyBcIicgaW5zdGVhZCBvZiAnXCIgKyBjaCArIFwiJ1wiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gR2V0IHRoZSBuZXh0IGNoYXJhY3Rlci4gV2hlbiB0aGVyZSBhcmUgbm8gbW9yZSBjaGFyYWN0ZXJzLFxuICAgICAgICAvLyByZXR1cm4gdGhlIGVtcHR5IHN0cmluZy5cbiAgICAgICAgXG4gICAgICAgIGNoID0gdGV4dC5jaGFyQXQoYXQpO1xuICAgICAgICBhdCArPSAxO1xuICAgICAgICByZXR1cm4gY2g7XG4gICAgfSxcbiAgICBcbiAgICBudW1iZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIFBhcnNlIGEgbnVtYmVyIHZhbHVlLlxuICAgICAgICB2YXIgbnVtYmVyLFxuICAgICAgICAgICAgc3RyaW5nID0gJyc7XG4gICAgICAgIFxuICAgICAgICBpZiAoY2ggPT09ICctJykge1xuICAgICAgICAgICAgc3RyaW5nID0gJy0nO1xuICAgICAgICAgICAgbmV4dCgnLScpO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChjaCA+PSAnMCcgJiYgY2ggPD0gJzknKSB7XG4gICAgICAgICAgICBzdHJpbmcgKz0gY2g7XG4gICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnLicpIHtcbiAgICAgICAgICAgIHN0cmluZyArPSAnLic7XG4gICAgICAgICAgICB3aGlsZSAobmV4dCgpICYmIGNoID49ICcwJyAmJiBjaCA8PSAnOScpIHtcbiAgICAgICAgICAgICAgICBzdHJpbmcgKz0gY2g7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnZScgfHwgY2ggPT09ICdFJykge1xuICAgICAgICAgICAgc3RyaW5nICs9IGNoO1xuICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgaWYgKGNoID09PSAnLScgfHwgY2ggPT09ICcrJykge1xuICAgICAgICAgICAgICAgIHN0cmluZyArPSBjaDtcbiAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGlsZSAoY2ggPj0gJzAnICYmIGNoIDw9ICc5Jykge1xuICAgICAgICAgICAgICAgIHN0cmluZyArPSBjaDtcbiAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbnVtYmVyID0gK3N0cmluZztcbiAgICAgICAgaWYgKCFpc0Zpbml0ZShudW1iZXIpKSB7XG4gICAgICAgICAgICBlcnJvcihcIkJhZCBudW1iZXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVtYmVyO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBzdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIFBhcnNlIGEgc3RyaW5nIHZhbHVlLlxuICAgICAgICB2YXIgaGV4LFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIHN0cmluZyA9ICcnLFxuICAgICAgICAgICAgdWZmZmY7XG4gICAgICAgIFxuICAgICAgICAvLyBXaGVuIHBhcnNpbmcgZm9yIHN0cmluZyB2YWx1ZXMsIHdlIG11c3QgbG9vayBmb3IgXCIgYW5kIFxcIGNoYXJhY3RlcnMuXG4gICAgICAgIGlmIChjaCA9PT0gJ1wiJykge1xuICAgICAgICAgICAgd2hpbGUgKG5leHQoKSkge1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ1wiJykge1xuICAgICAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaCA9PT0gJ1xcXFwnKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoID09PSAndScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVmZmZmID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCA0OyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZXggPSBwYXJzZUludChuZXh0KCksIDE2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRmluaXRlKGhleCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVmZmZmID0gdWZmZmYgKiAxNiArIGhleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHVmZmZmKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZXNjYXBlZVtjaF0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gZXNjYXBlZVtjaF07XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0cmluZyArPSBjaDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZXJyb3IoXCJCYWQgc3RyaW5nXCIpO1xuICAgIH0sXG5cbiAgICB3aGl0ZSA9IGZ1bmN0aW9uICgpIHtcblxuLy8gU2tpcCB3aGl0ZXNwYWNlLlxuXG4gICAgICAgIHdoaWxlIChjaCAmJiBjaCA8PSAnICcpIHtcbiAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICB3b3JkID0gZnVuY3Rpb24gKCkge1xuXG4vLyB0cnVlLCBmYWxzZSwgb3IgbnVsbC5cblxuICAgICAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICAgIGNhc2UgJ3QnOlxuICAgICAgICAgICAgbmV4dCgndCcpO1xuICAgICAgICAgICAgbmV4dCgncicpO1xuICAgICAgICAgICAgbmV4dCgndScpO1xuICAgICAgICAgICAgbmV4dCgnZScpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGNhc2UgJ2YnOlxuICAgICAgICAgICAgbmV4dCgnZicpO1xuICAgICAgICAgICAgbmV4dCgnYScpO1xuICAgICAgICAgICAgbmV4dCgnbCcpO1xuICAgICAgICAgICAgbmV4dCgncycpO1xuICAgICAgICAgICAgbmV4dCgnZScpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjYXNlICduJzpcbiAgICAgICAgICAgIG5leHQoJ24nKTtcbiAgICAgICAgICAgIG5leHQoJ3UnKTtcbiAgICAgICAgICAgIG5leHQoJ2wnKTtcbiAgICAgICAgICAgIG5leHQoJ2wnKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVycm9yKFwiVW5leHBlY3RlZCAnXCIgKyBjaCArIFwiJ1wiKTtcbiAgICB9LFxuXG4gICAgdmFsdWUsICAvLyBQbGFjZSBob2xkZXIgZm9yIHRoZSB2YWx1ZSBmdW5jdGlvbi5cblxuICAgIGFycmF5ID0gZnVuY3Rpb24gKCkge1xuXG4vLyBQYXJzZSBhbiBhcnJheSB2YWx1ZS5cblxuICAgICAgICB2YXIgYXJyYXkgPSBbXTtcblxuICAgICAgICBpZiAoY2ggPT09ICdbJykge1xuICAgICAgICAgICAgbmV4dCgnWycpO1xuICAgICAgICAgICAgd2hpdGUoKTtcbiAgICAgICAgICAgIGlmIChjaCA9PT0gJ10nKSB7XG4gICAgICAgICAgICAgICAgbmV4dCgnXScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhcnJheTsgICAvLyBlbXB0eSBhcnJheVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUgKGNoKSB7XG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaCh2YWx1ZSgpKTtcbiAgICAgICAgICAgICAgICB3aGl0ZSgpO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ10nKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoJ10nKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXh0KCcsJyk7XG4gICAgICAgICAgICAgICAgd2hpdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlcnJvcihcIkJhZCBhcnJheVwiKTtcbiAgICB9LFxuXG4gICAgb2JqZWN0ID0gZnVuY3Rpb24gKCkge1xuXG4vLyBQYXJzZSBhbiBvYmplY3QgdmFsdWUuXG5cbiAgICAgICAgdmFyIGtleSxcbiAgICAgICAgICAgIG9iamVjdCA9IHt9O1xuXG4gICAgICAgIGlmIChjaCA9PT0gJ3snKSB7XG4gICAgICAgICAgICBuZXh0KCd7Jyk7XG4gICAgICAgICAgICB3aGl0ZSgpO1xuICAgICAgICAgICAgaWYgKGNoID09PSAnfScpIHtcbiAgICAgICAgICAgICAgICBuZXh0KCd9Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdDsgICAvLyBlbXB0eSBvYmplY3RcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlIChjaCkge1xuICAgICAgICAgICAgICAgIGtleSA9IHN0cmluZygpO1xuICAgICAgICAgICAgICAgIHdoaXRlKCk7XG4gICAgICAgICAgICAgICAgbmV4dCgnOicpO1xuICAgICAgICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoJ0R1cGxpY2F0ZSBrZXkgXCInICsga2V5ICsgJ1wiJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9iamVjdFtrZXldID0gdmFsdWUoKTtcbiAgICAgICAgICAgICAgICB3aGl0ZSgpO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ30nKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoJ30nKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV4dCgnLCcpO1xuICAgICAgICAgICAgICAgIHdoaXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZXJyb3IoXCJCYWQgb2JqZWN0XCIpO1xuICAgIH07XG5cbnZhbHVlID0gZnVuY3Rpb24gKCkge1xuXG4vLyBQYXJzZSBhIEpTT04gdmFsdWUuIEl0IGNvdWxkIGJlIGFuIG9iamVjdCwgYW4gYXJyYXksIGEgc3RyaW5nLCBhIG51bWJlcixcbi8vIG9yIGEgd29yZC5cblxuICAgIHdoaXRlKCk7XG4gICAgc3dpdGNoIChjaCkge1xuICAgIGNhc2UgJ3snOlxuICAgICAgICByZXR1cm4gb2JqZWN0KCk7XG4gICAgY2FzZSAnWyc6XG4gICAgICAgIHJldHVybiBhcnJheSgpO1xuICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgcmV0dXJuIHN0cmluZygpO1xuICAgIGNhc2UgJy0nOlxuICAgICAgICByZXR1cm4gbnVtYmVyKCk7XG4gICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGNoID49ICcwJyAmJiBjaCA8PSAnOScgPyBudW1iZXIoKSA6IHdvcmQoKTtcbiAgICB9XG59O1xuXG4vLyBSZXR1cm4gdGhlIGpzb25fcGFyc2UgZnVuY3Rpb24uIEl0IHdpbGwgaGF2ZSBhY2Nlc3MgdG8gYWxsIG9mIHRoZSBhYm92ZVxuLy8gZnVuY3Rpb25zIGFuZCB2YXJpYWJsZXMuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHNvdXJjZSwgcmV2aXZlcikge1xuICAgIHZhciByZXN1bHQ7XG4gICAgXG4gICAgdGV4dCA9IHNvdXJjZTtcbiAgICBhdCA9IDA7XG4gICAgY2ggPSAnICc7XG4gICAgcmVzdWx0ID0gdmFsdWUoKTtcbiAgICB3aGl0ZSgpO1xuICAgIGlmIChjaCkge1xuICAgICAgICBlcnJvcihcIlN5bnRheCBlcnJvclwiKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBhIHJldml2ZXIgZnVuY3Rpb24sIHdlIHJlY3Vyc2l2ZWx5IHdhbGsgdGhlIG5ldyBzdHJ1Y3R1cmUsXG4gICAgLy8gcGFzc2luZyBlYWNoIG5hbWUvdmFsdWUgcGFpciB0byB0aGUgcmV2aXZlciBmdW5jdGlvbiBmb3IgcG9zc2libGVcbiAgICAvLyB0cmFuc2Zvcm1hdGlvbiwgc3RhcnRpbmcgd2l0aCBhIHRlbXBvcmFyeSByb290IG9iamVjdCB0aGF0IGhvbGRzIHRoZSByZXN1bHRcbiAgICAvLyBpbiBhbiBlbXB0eSBrZXkuIElmIHRoZXJlIGlzIG5vdCBhIHJldml2ZXIgZnVuY3Rpb24sIHdlIHNpbXBseSByZXR1cm4gdGhlXG4gICAgLy8gcmVzdWx0LlxuXG4gICAgcmV0dXJuIHR5cGVvZiByZXZpdmVyID09PSAnZnVuY3Rpb24nID8gKGZ1bmN0aW9uIHdhbGsoaG9sZGVyLCBrZXkpIHtcbiAgICAgICAgdmFyIGssIHYsIHZhbHVlID0gaG9sZGVyW2tleV07XG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBmb3IgKGsgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrKSkge1xuICAgICAgICAgICAgICAgICAgICB2ID0gd2Fsayh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tdID0gdjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB2YWx1ZVtrXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV2aXZlci5jYWxsKGhvbGRlciwga2V5LCB2YWx1ZSk7XG4gICAgfSh7Jyc6IHJlc3VsdH0sICcnKSkgOiByZXN1bHQ7XG59O1xuIiwidmFyIGN4ID0gL1tcXHUwMDAwXFx1MDBhZFxcdTA2MDAtXFx1MDYwNFxcdTA3MGZcXHUxN2I0XFx1MTdiNVxcdTIwMGMtXFx1MjAwZlxcdTIwMjgtXFx1MjAyZlxcdTIwNjAtXFx1MjA2ZlxcdWZlZmZcXHVmZmYwLVxcdWZmZmZdL2csXG4gICAgZXNjYXBhYmxlID0gL1tcXFxcXFxcIlxceDAwLVxceDFmXFx4N2YtXFx4OWZcXHUwMGFkXFx1MDYwMC1cXHUwNjA0XFx1MDcwZlxcdTE3YjRcXHUxN2I1XFx1MjAwYy1cXHUyMDBmXFx1MjAyOC1cXHUyMDJmXFx1MjA2MC1cXHUyMDZmXFx1ZmVmZlxcdWZmZjAtXFx1ZmZmZl0vZyxcbiAgICBnYXAsXG4gICAgaW5kZW50LFxuICAgIG1ldGEgPSB7ICAgIC8vIHRhYmxlIG9mIGNoYXJhY3RlciBzdWJzdGl0dXRpb25zXG4gICAgICAgICdcXGInOiAnXFxcXGInLFxuICAgICAgICAnXFx0JzogJ1xcXFx0JyxcbiAgICAgICAgJ1xcbic6ICdcXFxcbicsXG4gICAgICAgICdcXGYnOiAnXFxcXGYnLFxuICAgICAgICAnXFxyJzogJ1xcXFxyJyxcbiAgICAgICAgJ1wiJyA6ICdcXFxcXCInLFxuICAgICAgICAnXFxcXCc6ICdcXFxcXFxcXCdcbiAgICB9LFxuICAgIHJlcDtcblxuZnVuY3Rpb24gcXVvdGUoc3RyaW5nKSB7XG4gICAgLy8gSWYgdGhlIHN0cmluZyBjb250YWlucyBubyBjb250cm9sIGNoYXJhY3RlcnMsIG5vIHF1b3RlIGNoYXJhY3RlcnMsIGFuZCBub1xuICAgIC8vIGJhY2tzbGFzaCBjaGFyYWN0ZXJzLCB0aGVuIHdlIGNhbiBzYWZlbHkgc2xhcCBzb21lIHF1b3RlcyBhcm91bmQgaXQuXG4gICAgLy8gT3RoZXJ3aXNlIHdlIG11c3QgYWxzbyByZXBsYWNlIHRoZSBvZmZlbmRpbmcgY2hhcmFjdGVycyB3aXRoIHNhZmUgZXNjYXBlXG4gICAgLy8gc2VxdWVuY2VzLlxuICAgIFxuICAgIGVzY2FwYWJsZS5sYXN0SW5kZXggPSAwO1xuICAgIHJldHVybiBlc2NhcGFibGUudGVzdChzdHJpbmcpID8gJ1wiJyArIHN0cmluZy5yZXBsYWNlKGVzY2FwYWJsZSwgZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgdmFyIGMgPSBtZXRhW2FdO1xuICAgICAgICByZXR1cm4gdHlwZW9mIGMgPT09ICdzdHJpbmcnID8gYyA6XG4gICAgICAgICAgICAnXFxcXHUnICsgKCcwMDAwJyArIGEuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikpLnNsaWNlKC00KTtcbiAgICB9KSArICdcIicgOiAnXCInICsgc3RyaW5nICsgJ1wiJztcbn1cblxuZnVuY3Rpb24gc3RyKGtleSwgaG9sZGVyKSB7XG4gICAgLy8gUHJvZHVjZSBhIHN0cmluZyBmcm9tIGhvbGRlcltrZXldLlxuICAgIHZhciBpLCAgICAgICAgICAvLyBUaGUgbG9vcCBjb3VudGVyLlxuICAgICAgICBrLCAgICAgICAgICAvLyBUaGUgbWVtYmVyIGtleS5cbiAgICAgICAgdiwgICAgICAgICAgLy8gVGhlIG1lbWJlciB2YWx1ZS5cbiAgICAgICAgbGVuZ3RoLFxuICAgICAgICBtaW5kID0gZ2FwLFxuICAgICAgICBwYXJ0aWFsLFxuICAgICAgICB2YWx1ZSA9IGhvbGRlcltrZXldO1xuICAgIFxuICAgIC8vIElmIHRoZSB2YWx1ZSBoYXMgYSB0b0pTT04gbWV0aG9kLCBjYWxsIGl0IHRvIG9idGFpbiBhIHJlcGxhY2VtZW50IHZhbHVlLlxuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICB0eXBlb2YgdmFsdWUudG9KU09OID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUudG9KU09OKGtleSk7XG4gICAgfVxuICAgIFxuICAgIC8vIElmIHdlIHdlcmUgY2FsbGVkIHdpdGggYSByZXBsYWNlciBmdW5jdGlvbiwgdGhlbiBjYWxsIHRoZSByZXBsYWNlciB0b1xuICAgIC8vIG9idGFpbiBhIHJlcGxhY2VtZW50IHZhbHVlLlxuICAgIGlmICh0eXBlb2YgcmVwID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhbHVlID0gcmVwLmNhbGwoaG9sZGVyLCBrZXksIHZhbHVlKTtcbiAgICB9XG4gICAgXG4gICAgLy8gV2hhdCBoYXBwZW5zIG5leHQgZGVwZW5kcyBvbiB0aGUgdmFsdWUncyB0eXBlLlxuICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICByZXR1cm4gcXVvdGUodmFsdWUpO1xuICAgICAgICBcbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICAgIC8vIEpTT04gbnVtYmVycyBtdXN0IGJlIGZpbml0ZS4gRW5jb2RlIG5vbi1maW5pdGUgbnVtYmVycyBhcyBudWxsLlxuICAgICAgICAgICAgcmV0dXJuIGlzRmluaXRlKHZhbHVlKSA/IFN0cmluZyh2YWx1ZSkgOiAnbnVsbCc7XG4gICAgICAgIFxuICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgY2FzZSAnbnVsbCc6XG4gICAgICAgICAgICAvLyBJZiB0aGUgdmFsdWUgaXMgYSBib29sZWFuIG9yIG51bGwsIGNvbnZlcnQgaXQgdG8gYSBzdHJpbmcuIE5vdGU6XG4gICAgICAgICAgICAvLyB0eXBlb2YgbnVsbCBkb2VzIG5vdCBwcm9kdWNlICdudWxsJy4gVGhlIGNhc2UgaXMgaW5jbHVkZWQgaGVyZSBpblxuICAgICAgICAgICAgLy8gdGhlIHJlbW90ZSBjaGFuY2UgdGhhdCB0aGlzIGdldHMgZml4ZWQgc29tZWRheS5cbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICAgICAgICAgICAgXG4gICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm4gJ251bGwnO1xuICAgICAgICAgICAgZ2FwICs9IGluZGVudDtcbiAgICAgICAgICAgIHBhcnRpYWwgPSBbXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQXJyYXkuaXNBcnJheVxuICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuYXBwbHkodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJ0aWFsW2ldID0gc3RyKGksIHZhbHVlKSB8fCAnbnVsbCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIEpvaW4gYWxsIG9mIHRoZSBlbGVtZW50cyB0b2dldGhlciwgc2VwYXJhdGVkIHdpdGggY29tbWFzLCBhbmRcbiAgICAgICAgICAgICAgICAvLyB3cmFwIHRoZW0gaW4gYnJhY2tldHMuXG4gICAgICAgICAgICAgICAgdiA9IHBhcnRpYWwubGVuZ3RoID09PSAwID8gJ1tdJyA6IGdhcCA/XG4gICAgICAgICAgICAgICAgICAgICdbXFxuJyArIGdhcCArIHBhcnRpYWwuam9pbignLFxcbicgKyBnYXApICsgJ1xcbicgKyBtaW5kICsgJ10nIDpcbiAgICAgICAgICAgICAgICAgICAgJ1snICsgcGFydGlhbC5qb2luKCcsJykgKyAnXSc7XG4gICAgICAgICAgICAgICAgZ2FwID0gbWluZDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gSWYgdGhlIHJlcGxhY2VyIGlzIGFuIGFycmF5LCB1c2UgaXQgdG8gc2VsZWN0IHRoZSBtZW1iZXJzIHRvIGJlXG4gICAgICAgICAgICAvLyBzdHJpbmdpZmllZC5cbiAgICAgICAgICAgIGlmIChyZXAgJiYgdHlwZW9mIHJlcCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBsZW5ndGggPSByZXAubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBrID0gcmVwW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGsgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ID0gc3RyKGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGlhbC5wdXNoKHF1b3RlKGspICsgKGdhcCA/ICc6ICcgOiAnOicpICsgdik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UsIGl0ZXJhdGUgdGhyb3VnaCBhbGwgb2YgdGhlIGtleXMgaW4gdGhlIG9iamVjdC5cbiAgICAgICAgICAgICAgICBmb3IgKGsgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgaykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHYgPSBzdHIoaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWFsLnB1c2gocXVvdGUoaykgKyAoZ2FwID8gJzogJyA6ICc6JykgKyB2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAvLyBKb2luIGFsbCBvZiB0aGUgbWVtYmVyIHRleHRzIHRvZ2V0aGVyLCBzZXBhcmF0ZWQgd2l0aCBjb21tYXMsXG4gICAgICAgIC8vIGFuZCB3cmFwIHRoZW0gaW4gYnJhY2VzLlxuXG4gICAgICAgIHYgPSBwYXJ0aWFsLmxlbmd0aCA9PT0gMCA/ICd7fScgOiBnYXAgP1xuICAgICAgICAgICAgJ3tcXG4nICsgZ2FwICsgcGFydGlhbC5qb2luKCcsXFxuJyArIGdhcCkgKyAnXFxuJyArIG1pbmQgKyAnfScgOlxuICAgICAgICAgICAgJ3snICsgcGFydGlhbC5qb2luKCcsJykgKyAnfSc7XG4gICAgICAgIGdhcCA9IG1pbmQ7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodmFsdWUsIHJlcGxhY2VyLCBzcGFjZSkge1xuICAgIHZhciBpO1xuICAgIGdhcCA9ICcnO1xuICAgIGluZGVudCA9ICcnO1xuICAgIFxuICAgIC8vIElmIHRoZSBzcGFjZSBwYXJhbWV0ZXIgaXMgYSBudW1iZXIsIG1ha2UgYW4gaW5kZW50IHN0cmluZyBjb250YWluaW5nIHRoYXRcbiAgICAvLyBtYW55IHNwYWNlcy5cbiAgICBpZiAodHlwZW9mIHNwYWNlID09PSAnbnVtYmVyJykge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc3BhY2U7IGkgKz0gMSkge1xuICAgICAgICAgICAgaW5kZW50ICs9ICcgJztcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBJZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGlzIGEgc3RyaW5nLCBpdCB3aWxsIGJlIHVzZWQgYXMgdGhlIGluZGVudCBzdHJpbmcuXG4gICAgZWxzZSBpZiAodHlwZW9mIHNwYWNlID09PSAnc3RyaW5nJykge1xuICAgICAgICBpbmRlbnQgPSBzcGFjZTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBhIHJlcGxhY2VyLCBpdCBtdXN0IGJlIGEgZnVuY3Rpb24gb3IgYW4gYXJyYXkuXG4gICAgLy8gT3RoZXJ3aXNlLCB0aHJvdyBhbiBlcnJvci5cbiAgICByZXAgPSByZXBsYWNlcjtcbiAgICBpZiAocmVwbGFjZXIgJiYgdHlwZW9mIHJlcGxhY2VyICE9PSAnZnVuY3Rpb24nXG4gICAgJiYgKHR5cGVvZiByZXBsYWNlciAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIHJlcGxhY2VyLmxlbmd0aCAhPT0gJ251bWJlcicpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSlNPTi5zdHJpbmdpZnknKTtcbiAgICB9XG4gICAgXG4gICAgLy8gTWFrZSBhIGZha2Ugcm9vdCBvYmplY3QgY29udGFpbmluZyBvdXIgdmFsdWUgdW5kZXIgdGhlIGtleSBvZiAnJy5cbiAgICAvLyBSZXR1cm4gdGhlIHJlc3VsdCBvZiBzdHJpbmdpZnlpbmcgdGhlIHZhbHVlLlxuICAgIHJldHVybiBzdHIoJycsIHsnJzogdmFsdWV9KTtcbn07XG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICAgIFRpbGVMYXllcjogcmVxdWlyZSgnLi9sYXllci9leHBvcnRzJyksXG4gICAgICAgIFJlbmRlcmVyOiByZXF1aXJlKCcuL3JlbmRlcmVyL2V4cG9ydHMnKSxcbiAgICAgICAgVGlsZVJlcXVlc3RvcjogcmVxdWlyZSgnLi9yZXF1ZXN0L1RpbGVSZXF1ZXN0b3InKSxcbiAgICAgICAgTWV0YVJlcXVlc3RvcjogcmVxdWlyZSgnLi9yZXF1ZXN0L01ldGFSZXF1ZXN0b3InKVxuICAgIH07XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgc2V0RGF0ZUhpc3RvZ3JhbSA9IGZ1bmN0aW9uKGZpZWxkLCBmcm9tLCB0bywgaW50ZXJ2YWwpIHtcbiAgICAgICAgaWYgKCFmaWVsZCkge1xuICAgICAgICAgICAgdGhyb3cgJ0RhdGVIaXN0b2dyYW0gYGZpZWxkYCBpcyBtaXNzaW5nIGZyb20gYXJndW1lbnQnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmcm9tID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93ICdEYXRlSGlzdG9ncmFtIGBmcm9tYCBhcmUgbWlzc2luZyBmcm9tIGFyZ3VtZW50JztcbiAgICAgICAgfVxuICAgICAgICBpZiAodG8gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgJ0RhdGVIaXN0b2dyYW0gYHRvYCBhcmUgbWlzc2luZyBmcm9tIGFyZ3VtZW50JztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wYXJhbXMuZGF0ZV9oaXN0b2dyYW0gPSB7XG4gICAgICAgICAgICBmaWVsZDogZmllbGQsXG4gICAgICAgICAgICBmcm9tOiBmcm9tLFxuICAgICAgICAgICAgdG86IHRvLFxuICAgICAgICAgICAgaW50ZXJ2YWw6IGludGVydmFsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY2xlYXJFeHRyZW1hKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0RGF0ZUhpc3RvZ3JhbSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFyYW1zLmRhdGVfaGlzdG9ncmFtO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgc2V0RGF0ZUhpc3RvZ3JhbTogc2V0RGF0ZUhpc3RvZ3JhbSxcbiAgICAgICAgZ2V0RGF0ZUhpc3RvZ3JhbTogZ2V0RGF0ZUhpc3RvZ3JhbVxuICAgIH07XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgY2hlY2tGaWVsZCA9IGZ1bmN0aW9uKG1ldGEsIGZpZWxkKSB7XG4gICAgICAgIGlmIChtZXRhKSB7XG4gICAgICAgICAgICBpZiAoIW1ldGEuZXh0cmVtYSkge1xuICAgICAgICAgICAgICAgIHRocm93ICdIaXN0b2dyYW0gYGZpZWxkYCAnICsgZmllbGQgKyAnIGlzIG5vdCBvcmRpbmFsIGluIG1ldGEgZGF0YSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyAnSGlzdG9ncmFtIGBmaWVsZGAgJyArIGZpZWxkICsgJyBpcyBub3QgcmVjb2duaXplZCBpbiBtZXRhIGRhdGEnO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzZXRIaXN0b2dyYW0gPSBmdW5jdGlvbihmaWVsZCwgaW50ZXJ2YWwpIHtcbiAgICAgICAgaWYgKCFmaWVsZCkge1xuICAgICAgICAgICAgdGhyb3cgJ0hpc3RvZ3JhbSBgZmllbGRgIGlzIG1pc3NpbmcgZnJvbSBhcmd1bWVudCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpbnRlcnZhbCkge1xuICAgICAgICAgICAgdGhyb3cgJ0hpc3RvZ3JhbSBgaW50ZXJ2YWxgIGFyZSBtaXNzaW5nIGZyb20gYXJndW1lbnQnO1xuICAgICAgICB9XG4gICAgICAgIGNoZWNrRmllbGQodGhpcy5fbWV0YVtmaWVsZF0sIGZpZWxkKTtcbiAgICAgICAgdGhpcy5fcGFyYW1zLmhpc3RvZ3JhbSA9IHtcbiAgICAgICAgICAgIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgICAgIGludGVydmFsOiBpbnRlcnZhbFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNsZWFyRXh0cmVtYSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgdmFyIGdldEhpc3RvZ3JhbSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFyYW1zLmhpc3RvZ3JhbTtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICAgIHNldEhpc3RvZ3JhbTogc2V0SGlzdG9ncmFtLFxuICAgICAgICBnZXRIaXN0b2dyYW06IGdldEhpc3RvZ3JhbVxuICAgIH07XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgTUVUUklDUyA9IHtcbiAgICAgICAgJ21pbic6IHRydWUsXG4gICAgICAgICdtYXgnOiB0cnVlLFxuICAgICAgICAnc3VtJzogdHJ1ZSxcbiAgICAgICAgJ2F2Zyc6IHRydWVcbiAgICB9O1xuXG4gICAgdmFyIGNoZWNrRmllbGQgPSBmdW5jdGlvbihtZXRhLCBmaWVsZCkge1xuICAgICAgICBpZiAobWV0YSkge1xuICAgICAgICAgICAgaWYgKCFtZXRhLmV4dHJlbWEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyAnTWV0cml4IGBmaWVsZGAgJyArIGZpZWxkICsgJyBpcyBub3Qgb3JkaW5hbCBpbiBtZXRhIGRhdGEnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgJ01ldHJpYyBgZmllbGRgICcgKyBmaWVsZCArICcgaXMgbm90IHJlY29nbml6ZWQgaW4gbWV0YSBkYXRhJztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc2V0TWV0cmljID0gZnVuY3Rpb24oZmllbGQsIHR5cGUpIHtcbiAgICAgICAgaWYgKCFmaWVsZCkge1xuICAgICAgICAgICAgdGhyb3cgJ01ldHJpYyBgZmllbGRgIGlzIG1pc3NpbmcgZnJvbSBhcmd1bWVudCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0eXBlKSB7XG4gICAgICAgICAgICB0aHJvdyAnTWV0cmljIGB0eXBlYCBpcyBtaXNzaW5nIGZyb20gYXJndW1lbnQnO1xuICAgICAgICB9XG4gICAgICAgIGNoZWNrRmllbGQodGhpcy5fbWV0YVtmaWVsZF0sIGZpZWxkKTtcbiAgICAgICAgaWYgKCFNRVRSSUNTW3R5cGVdKSB7XG4gICAgICAgICAgICB0aHJvdyAnTWV0cmljIHR5cGUgYCcgKyB0eXBlICsgJ2AgaXMgbm90IHN1cHBvcnRlZCc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcGFyYW1zLm1ldHJpYyA9IHtcbiAgICAgICAgICAgIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgICAgIHR5cGU6IHR5cGVcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jbGVhckV4dHJlbWEoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHZhciBnZXRNZXRyaWMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmFtcy5tZXRyaWM7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICAvLyB0aWxpbmdcbiAgICAgICAgc2V0TWV0cmljOiBzZXRNZXRyaWMsXG4gICAgICAgIGdldE1ldHJpYzogZ2V0TWV0cmljLFxuICAgIH07XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgY2hlY2tGaWVsZCA9IGZ1bmN0aW9uKG1ldGEsIGZpZWxkKSB7XG4gICAgICAgIGlmIChtZXRhKSB7XG4gICAgICAgICAgICBpZiAobWV0YS50eXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRocm93ICdUZXJtcyBgZmllbGRgICcgKyBmaWVsZCArICcgaXMgbm90IG9mIHR5cGUgYHN0cmluZ2AgaW4gbWV0YSBkYXRhJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93ICdUZXJtcyBgZmllbGRgICcgKyBmaWVsZCArICcgaXMgbm90IHJlY29nbml6ZWQgaW4gbWV0YSBkYXRhJztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc2V0VGVybXMgPSBmdW5jdGlvbihmaWVsZCwgc2l6ZSkge1xuICAgICAgICBpZiAoIWZpZWxkKSB7XG4gICAgICAgICAgICB0aHJvdyAnVGVybXMgYGZpZWxkYCBpcyBtaXNzaW5nIGZyb20gYXJndW1lbnQnO1xuICAgICAgICB9XG4gICAgICAgIGNoZWNrRmllbGQodGhpcy5fbWV0YVtmaWVsZF0sIGZpZWxkKTtcbiAgICAgICAgdGhpcy5fcGFyYW1zLnRlcm1zID0ge1xuICAgICAgICAgICAgZmllbGQ6IGZpZWxkLFxuICAgICAgICAgICAgc2l6ZTogc2l6ZVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNsZWFyRXh0cmVtYSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgdmFyIGdldFRlcm1zID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJhbXMudGVybXM7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICBzZXRUZXJtczogc2V0VGVybXMsXG4gICAgICAgIGdldFRlcm1zOiBnZXRUZXJtc1xuICAgIH07XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgY2hlY2tGaWVsZCA9IGZ1bmN0aW9uKG1ldGEsIGZpZWxkKSB7XG4gICAgICAgIGlmIChtZXRhKSB7XG4gICAgICAgICAgICBpZiAobWV0YS50eXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRocm93ICdUZXJtcyBgZmllbGRgICcgKyBmaWVsZCArICcgaXMgbm90IG9mIHR5cGUgYHN0cmluZ2AgaW4gbWV0YSBkYXRhJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93ICdUZXJtcyBgZmllbGRgICcgKyBmaWVsZCArICcgaXMgbm90IHJlY29nbml6ZWQgaW4gbWV0YSBkYXRhJztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc2V0VGVybXNGaWx0ZXIgPSBmdW5jdGlvbihmaWVsZCwgdGVybXMpIHtcbiAgICAgICAgaWYgKCFmaWVsZCkge1xuICAgICAgICAgICAgdGhyb3cgJ1Rlcm1zIGBmaWVsZGAgaXMgbWlzc2luZyBmcm9tIGFyZ3VtZW50JztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGVybXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgJ1Rlcm1zIGB0ZXJtc2AgYXJlIG1pc3NpbmcgZnJvbSBhcmd1bWVudCc7XG4gICAgICAgIH1cbiAgICAgICAgY2hlY2tGaWVsZCh0aGlzLl9tZXRhW2ZpZWxkXSwgZmllbGQpO1xuICAgICAgICB0aGlzLl9wYXJhbXMudGVybXNfZmlsdGVyID0ge1xuICAgICAgICAgICAgZmllbGQ6IGZpZWxkLFxuICAgICAgICAgICAgdGVybXM6IHRlcm1zXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY2xlYXJFeHRyZW1hKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0VGVybXNGaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmFtcy50ZXJtc19maWx0ZXI7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICBzZXRUZXJtc0ZpbHRlcjogc2V0VGVybXNGaWx0ZXIsXG4gICAgICAgIGdldFRlcm1zRmlsdGVyOiBnZXRUZXJtc0ZpbHRlclxuICAgIH07XG5cbn0oKSk7XG4iLCIvLyBQcm92aWRlcyB0b3AgaGl0cyBxdWVyeSBmdW5jdGlvbmFsaXR5LiAnc2l6ZScgaW5kaWNhdGVzIHRoZSBudW1iZXIgb2YgdG9wIFxuLy8gaGl0cyB0byByZXR1cm4sICdpbmNsdWRlJyBpcyB0aGUgbGlzdCBvZiBmaWVsZHMgdG8gaW5jbHVkZSBpbiB0aGUgcmV0dXJuZWQgXG4vLyBkYXRhLCAnc29ydCcgaXMgdGhlIGZpZWxkIHRvIHVzZSBmb3Igc29ydCBjcml0ZXJhLCBhbmQgJ29yZGVyJyBpcyB2YWx1ZSBvZlxuLy8gJ2FzYycgb3IgJ2Rlc2MnIHRvIGluZGljYXRlIHNvcnQgb3JkZXJpbmcuXG4oZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgc2V0VG9wSGl0cyA9IGZ1bmN0aW9uKHNpemUsIGluY2x1ZGUsIHNvcnQsIG9yZGVyKSB7XG4gICAgICAgIHRoaXMuX3BhcmFtcy50b3BfaGl0cyA9IHtcbiAgICAgICAgICAgIHNpemU6IHNpemUsIFxuICAgICAgICAgICAgaW5jbHVkZTppbmNsdWRlLFxuICAgICAgICAgICAgc29ydDogc29ydCxcbiAgICAgICAgICAgIG9yZGVyOiBvcmRlciAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNsZWFyRXh0cmVtYSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgdmFyIGdldFRvcEhpdHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmFtcy50b3BfaGl0cztcbiAgICB9O1xuXG4gICAgLy8gYmluZCBwb2ludCBmb3IgZXh0ZXJuYWwgY29udHJvbHNcbiAgICB2YXIgc2V0U29ydEZpZWxkID0gZnVuY3Rpb24oc29ydCkge1xuICAgICAgICB0aGlzLl9wYXJhbXMudG9wX2hpdHMuc29ydCA9IHNvcnQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvLyBiaW5kIHBvaW50IGZvciBleHRlcm5hbCBjb250cm9sc1xuICAgIHZhciBnZXRTb3J0RmllbGQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmFtcy50b3BfaGl0cy5zb3J0O1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgc2V0VG9wSGl0czogc2V0VG9wSGl0cyxcbiAgICAgICAgZ2V0VG9wSGl0czogZ2V0VG9wSGl0cyxcbiAgICAgICAgc2V0U29ydEZpZWxkOiBzZXRTb3J0RmllbGQsXG4gICAgICAgIGdldFNvcnRGaWVsZDogZ2V0U29ydEZpZWxkXG4gICAgfTtcblxufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBjaGVja0ZpZWxkID0gZnVuY3Rpb24obWV0YSwgZmllbGQpIHtcbiAgICAgICAgaWYgKG1ldGEpIHtcbiAgICAgICAgICAgIGlmIChtZXRhLnR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgJ1RvcFRlcm1zIGBmaWVsZGAgJyArIGZpZWxkICsgJyBpcyBub3Qgb2YgdHlwZSBgc3RyaW5nYCBpbiBtZXRhIGRhdGEnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgJ1RvcFRlcm1zIGBmaWVsZGAgJyArIGZpZWxkICsgJyBpcyBub3QgcmVjb2duaXplZCBpbiBtZXRhIGRhdGEnO1xuICAgICAgICB9ICAgICAgICBcbiAgICB9O1xuXG4gICAgdmFyIHNldFRvcFRlcm1zID0gZnVuY3Rpb24oZmllbGQsIHNpemUpIHtcbiAgICAgICAgaWYgKCFmaWVsZCkge1xuICAgICAgICAgICAgdGhyb3cgJ1RvcFRlcm1zIGBmaWVsZGAgaXMgbWlzc2luZyBmcm9tIGFyZ3VtZW50JztcbiAgICAgICAgfVxuICAgICAgICBjaGVja0ZpZWxkKHRoaXMuX21ldGFbZmllbGRdLCBmaWVsZCk7XG4gICAgICAgIHRoaXMuX3BhcmFtcy50b3BfdGVybXMgPSB7XG4gICAgICAgICAgICBmaWVsZDogZmllbGQsXG4gICAgICAgICAgICBzaXplOiBzaXplXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY2xlYXJFeHRyZW1hKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0VG9wVGVybXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmFtcy50b3BfdGVybXM7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICBzZXRUb3BUZXJtczogc2V0VG9wVGVybXMsXG4gICAgICAgIGdldFRvcFRlcm1zOiBnZXRUb3BUZXJtc1xuICAgIH07XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQmFzZSA9IEwuR3JpZExheWVyLmV4dGVuZCh7XG5cbiAgICAgICAgZ2V0T3BhY2l0eTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLm9wYWNpdHk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl9oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZNYXAuYWRkTGF5ZXIodGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl9oaWRkZW4gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fcHJldk1hcCA9IHRoaXMuX21hcDtcbiAgICAgICAgICAgIHRoaXMuX21hcC5yZW1vdmVMYXllcih0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0hpZGRlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faGlkZGVuO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldEJyaWdodG5lc3M6IGZ1bmN0aW9uKGJyaWdodG5lc3MpIHtcbiAgICAgICAgICAgIHRoaXMuX2JyaWdodG5lc3MgPSBicmlnaHRuZXNzO1xuICAgICAgICAgICAgJCh0aGlzLl9jb250YWluZXIpLmNzcygnLXdlYmtpdC1maWx0ZXInLCAnYnJpZ2h0bmVzcygnICsgKHRoaXMuX2JyaWdodG5lc3MgKiAxMDApICsgJyUpJyk7XG4gICAgICAgICAgICAkKHRoaXMuX2NvbnRhaW5lcikuY3NzKCdmaWx0ZXInLCAnYnJpZ2h0bmVzcygnICsgKHRoaXMuX2JyaWdodG5lc3MgKiAxMDApICsgJyUpJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0QnJpZ2h0bmVzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuX2JyaWdodG5lc3MgIT09IHVuZGVmaW5lZCkgPyB0aGlzLl9icmlnaHRuZXNzIDogMTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IEJhc2U7XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQmFzZSA9IHJlcXVpcmUoJy4vQmFzZScpO1xuXG4gICAgdmFyIERlYnVnID0gQmFzZS5leHRlbmQoe1xuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHVubG9hZEludmlzaWJsZVRpbGVzOiB0cnVlLFxuICAgICAgICAgICAgekluZGV4OiA1MDAwXG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICAgICAgLy8gc2V0IHJlbmRlcmVyXG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMucmVuZGVyZXJDbGFzcykge1xuICAgICAgICAgICAgICAgIHRocm93ICdObyBgcmVuZGVyZXJDbGFzc2Agb3B0aW9uIGZvdW5kLic7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHJlY3Vyc2l2ZWx5IGV4dGVuZFxuICAgICAgICAgICAgICAgICQuZXh0ZW5kKHRydWUsIHRoaXMsIG9wdGlvbnMucmVuZGVyZXJDbGFzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBzZXQgb3B0aW9uc1xuICAgICAgICAgICAgTC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZVRpbGU6IGZ1bmN0aW9uKGNvb3JkKSB7XG4gICAgICAgICAgICAvLyBjcmVhdGUgYSA8ZGl2PiBlbGVtZW50IGZvciBkcmF3aW5nXG4gICAgICAgICAgICB2YXIgdGlsZSA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LXRpbGUnKTtcbiAgICAgICAgICAgIC8vIGRyYXcgdG8gaXRcbiAgICAgICAgICAgIHRoaXMucmVuZGVyVGlsZSh0aWxlLCBjb29yZCk7XG4gICAgICAgICAgICAvLyBwYXNzIHRpbGUgdG8gY2FsbGJhY2tcbiAgICAgICAgICAgIHJldHVybiB0aWxlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbmRlclRpbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gb3ZlcnJpZGVcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IERlYnVnO1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEJhc2UgPSByZXF1aXJlKCcuL0Jhc2UnKTtcblxuICAgIHZhciBJbWFnZSA9IEwuVGlsZUxheWVyLmV4dGVuZChCYXNlKTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gSW1hZ2U7XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgYm9vbFF1ZXJ5Q2hlY2sgPSByZXF1aXJlKCcuLi9xdWVyeS9Cb29sJyk7XG5cbiAgICB2YXIgTUlOID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICB2YXIgTUFYID0gMDtcblxuICAgIGZ1bmN0aW9uIG1vZChuLCBtKSB7XG4gICAgICAgIHJldHVybiAoKG4gJSBtKSArIG0pICUgbTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXROb3JtYWxpemVDb29yZHMoY29vcmRzKSB7XG4gICAgICAgIHZhciBwb3cgPSBNYXRoLnBvdygyLCBjb29yZHMueik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBtb2QoY29vcmRzLngsIHBvdyksXG4gICAgICAgICAgICB5OiBtb2QoY29vcmRzLnksIHBvdyksXG4gICAgICAgICAgICB6OiBjb29yZHMuelxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHZhciBMaXZlID0gTC5DbGFzcy5leHRlbmQoe1xuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKG1ldGEsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIHNldCByZW5kZXJlclxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLnJlbmRlcmVyQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyAnTm8gYHJlbmRlcmVyQ2xhc3NgIG9wdGlvbiBmb3VuZC4nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyByZWN1cnNpdmVseSBleHRlbmQgYW5kIGluaXRpYWxpemVcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5yZW5kZXJlckNsYXNzLnByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAkLmV4dGVuZCh0cnVlLCB0aGlzLCBvcHRpb25zLnJlbmRlcmVyQ2xhc3MucHJvdG90eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5yZW5kZXJlckNsYXNzLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJC5leHRlbmQodHJ1ZSwgdGhpcywgb3B0aW9ucy5yZW5kZXJlckNsYXNzKTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5yZW5kZXJlckNsYXNzLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBzZXQgb3B0aW9uc1xuICAgICAgICAgICAgTC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgLy8gc2V0IG1ldGFcbiAgICAgICAgICAgIHRoaXMuX21ldGEgPSBtZXRhO1xuICAgICAgICAgICAgLy8gc2V0IHBhcmFtc1xuICAgICAgICAgICAgdGhpcy5fcGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIGJpbm5pbmc6IHt9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gc2V0IGV4dHJlbWEgLyBjYWNoZVxuICAgICAgICAgICAgdGhpcy5jbGVhckV4dHJlbWEoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhckV4dHJlbWE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fZXh0cmVtYSA9IHtcbiAgICAgICAgICAgICAgICBtaW46IE1JTixcbiAgICAgICAgICAgICAgICBtYXg6IE1BWFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlID0ge307XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RXh0cmVtYTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZXh0cmVtYTtcbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGVFeHRyZW1hOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgZXh0cmVtYSA9IHRoaXMuZXh0cmFjdEV4dHJlbWEoZGF0YSk7XG4gICAgICAgICAgICB2YXIgY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGV4dHJlbWEubWluIDwgdGhpcy5fZXh0cmVtYS5taW4pIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9leHRyZW1hLm1pbiA9IGV4dHJlbWEubWluO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV4dHJlbWEubWF4ID4gdGhpcy5fZXh0cmVtYS5tYXgpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9leHRyZW1hLm1heCA9IGV4dHJlbWEubWF4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNoYW5nZWQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZXh0cmFjdEV4dHJlbWE6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbWluOiBfLm1pbihkYXRhKSxcbiAgICAgICAgICAgICAgICBtYXg6IF8ubWF4KGRhdGEpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFF1ZXJ5OiBmdW5jdGlvbihxdWVyeSkge1xuICAgICAgICAgICAgaWYgKCFxdWVyeS5tdXN0ICYmICFxdWVyeS5tdXN0X25vdCAmJiAhcXVlcnkuc2hvdWxkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgJ1Jvb3QgcXVlcnkgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBgbXVzdGAsIGBtdXN0X25vdGAsIG9yIGBzaG91bGRgIGFyZ3VtZW50Lic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBjaGVjayB0aGF0IHRoZSBxdWVyeSBpcyB2YWxpZFxuICAgICAgICAgICAgYm9vbFF1ZXJ5Q2hlY2sodGhpcy5fbWV0YSwgcXVlcnkpO1xuICAgICAgICAgICAgLy8gc2V0IHF1ZXJ5XG4gICAgICAgICAgICB0aGlzLl9wYXJhbXMubXVzdCA9IHF1ZXJ5Lm11c3Q7XG4gICAgICAgICAgICB0aGlzLl9wYXJhbXMubXVzdF9ub3QgPSBxdWVyeS5tdXN0X25vdDtcbiAgICAgICAgICAgIHRoaXMuX3BhcmFtcy5zaG91bGQgPSBxdWVyeS5zaG91bGQ7XG4gICAgICAgICAgICAvLyBjbGVhdCBleHRyZW1hXG4gICAgICAgICAgICB0aGlzLmNsZWFyRXh0cmVtYSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldE1ldGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ldGE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UGFyYW1zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXJhbXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FjaGVLZXlGcm9tQ29vcmQ6IGZ1bmN0aW9uKGNvb3Jkcywgbm9ybWFsaXplKSB7XG4gICAgICAgICAgICBpZiAobm9ybWFsaXplKSB7XG4gICAgICAgICAgICAgICAgLy8gbGVhZmxldCBsYXllciB4IGFuZCB5IG1heSBiZSA+IG5eMiwgYW5kIDwgMCBpbiB0aGUgY2FzZVxuICAgICAgICAgICAgICAgIC8vIG9mIGEgd3JhcGFyb3VuZC4gSWYgbm9ybWFsaXplIGlzIHRydWUsIG1vZCB0aGUgY29vcmRzXG4gICAgICAgICAgICAgICAgY29vcmRzID0gZ2V0Tm9ybWFsaXplQ29vcmRzKGNvb3Jkcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29vcmRzLnogKyAnOicgKyBjb29yZHMueCArICc6JyArIGNvb3Jkcy55O1xuICAgICAgICB9LFxuXG4gICAgICAgIGNvb3JkRnJvbUNhY2hlS2V5OiBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHZhciBhcnIgPSBrZXkuc3BsaXQoJzonKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgeDogcGFyc2VJbnQoYXJyWzFdLCAxMCksXG4gICAgICAgICAgICAgICAgeTogcGFyc2VJbnQoYXJyWzJdLCAxMCksXG4gICAgICAgICAgICAgICAgejogcGFyc2VJbnQoYXJyWzBdLCAxMClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25UaWxlVW5sb2FkOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgLy8gY2FjaGUga2V5IGZyb20gY29vcmRzXG4gICAgICAgICAgICB2YXIga2V5ID0gdGhpcy5jYWNoZUtleUZyb21Db29yZChldmVudC5jb29yZHMpO1xuICAgICAgICAgICAgLy8gY2FjaGUga2V5IGZyb20gbm9ybWFsaXplZCBjb29yZHNcbiAgICAgICAgICAgIHZhciBua2V5ID0gdGhpcy5jYWNoZUtleUZyb21Db29yZChldmVudC5jb29yZHMsIHRydWUpO1xuICAgICAgICAgICAgLy8gZ2V0IGNhY2hlIGVudHJ5XG4gICAgICAgICAgICB2YXIgY2FjaGVkID0gdGhpcy5fY2FjaGVbbmtleV07XG4gICAgICAgICAgICAvLyBjb3VsZCB0aGUgYmUgY2FzZSB3aGVyZSB0aGUgY2FjaGUgaXMgY2xlYXJlZCBiZWZvcmUgdGlsZXMgYXJlXG4gICAgICAgICAgICAvLyB1bmxvYWRlZFxuICAgICAgICAgICAgaWYgKCFjYWNoZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZW1vdmUgdGhlIHRpbGUgZnJvbSB0aGUgY2FjaGVcbiAgICAgICAgICAgIGRlbGV0ZSBjYWNoZWQudGlsZXNba2V5XTtcbiAgICAgICAgICAgIC8vIGRvbid0IHJlbW92ZSBjYWNoZSBlbnRyeSB1bmxlc3MgdG8gdGlsZXMgdXNlIGl0IGFueW1vcmVcbiAgICAgICAgICAgIGlmIChfLmtleXMoY2FjaGVkLnRpbGVzKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBubyBtb3JlIHRpbGVzIHVzZSB0aGlzIGNhY2hlZCBkYXRhLCBzbyBkZWxldGUgaXRcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fY2FjaGVba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkNhY2hlSGl0OiBmdW5jdGlvbigvKnRpbGUsIGNhY2hlZCwgY29vcmRzKi8pIHtcbiAgICAgICAgICAgIC8vIHRoaXMgaXMgZXhlY3V0ZWQgZm9yIGEgdGlsZSB3aG9zZSBkYXRhIGlzIGFscmVhZHkgaW4gbWVtb3J5LlxuICAgICAgICAgICAgLy8gcHJvYmFibHkganVzdCBkcmF3IHRoZSB0aWxlLlxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2FjaGVMb2FkOiBmdW5jdGlvbigvKnRpbGUsIGNhY2hlZCwgY29vcmRzKi8pIHtcbiAgICAgICAgICAgIC8vIHRoaXMgaXMgZXhlY3V0ZWQgd2hlbiB0aGUgZGF0YSBmb3IgYSB0aWxlIGlzIHJldHJlaXZlZCBhbmQgY2FjaGVkXG4gICAgICAgICAgICAvLyBwcm9iYWJseSBqdXN0IGRyYXcgdGhlIHRpbGUuXG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DYWNoZUxvYWRFeHRyZW1hVXBkYXRlOiBmdW5jdGlvbigvKnRpbGUsIGNhY2hlZCwgY29vcmRzKi8pIHtcbiAgICAgICAgICAgIC8vIHRoaXMgaXMgZXhlY3V0ZWQgd2hlbiB0aGUgZGF0YSBmb3IgYSB0aWxlIGlzIHJldHJlaXZlZCBhbmQgaXNcbiAgICAgICAgICAgIC8vIG91dHNpZGUgdGhlIGN1cnJlbnQgZXh0cmVtYS4gcHJvYmFibHkganVzdCByZWRyYXcgYWxsIHRpbGVzLlxuICAgICAgICB9LFxuXG4gICAgICAgIG9uVGlsZUxvYWQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgY29vcmRzID0gZXZlbnQuY29vcmRzO1xuICAgICAgICAgICAgdmFyIG5jb29yZHMgPSBnZXROb3JtYWxpemVDb29yZHMoZXZlbnQuY29vcmRzKTtcbiAgICAgICAgICAgIHZhciB0aWxlID0gZXZlbnQudGlsZTtcbiAgICAgICAgICAgIC8vIGNhY2hlIGtleSBmcm9tIGNvb3Jkc1xuICAgICAgICAgICAgdmFyIGtleSA9IHRoaXMuY2FjaGVLZXlGcm9tQ29vcmQoZXZlbnQuY29vcmRzKTtcbiAgICAgICAgICAgIC8vIGNhY2hlIGtleSBmcm9tIG5vcm1hbGl6ZWQgY29vcmRzXG4gICAgICAgICAgICB2YXIgbmtleSA9IHRoaXMuY2FjaGVLZXlGcm9tQ29vcmQoZXZlbnQuY29vcmRzLCB0cnVlKTtcbiAgICAgICAgICAgIC8vIGNoZWNrIGNhY2hlXG4gICAgICAgICAgICB2YXIgY2FjaGVkID0gdGhpcy5fY2FjaGVbbmtleV07XG4gICAgICAgICAgICBpZiAoY2FjaGVkKSB7XG4gICAgICAgICAgICAgICAgLy8gYWRkIHRpbGUgdW5kZXIgbm9ybWFsaXplIGNvb3Jkc1xuICAgICAgICAgICAgICAgIGNhY2hlZC50aWxlc1trZXldID0gdGlsZTtcbiAgICAgICAgICAgICAgICBpZiAoIWNhY2hlZC5pc1BlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2FjaGUgZW50cnkgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vbkNhY2hlSGl0KHRpbGUsIGNhY2hlZCwgY29vcmRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBhIGNhY2hlIGVudHJ5XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVbbmtleV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGlzUGVuZGluZzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgdGlsZXM6IHt9LFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvLyBhZGQgdGlsZSB0byB0aGUgY2FjaGUgZW50cnlcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZVtua2V5XS50aWxlc1trZXldID0gdGlsZTtcbiAgICAgICAgICAgICAgICAvLyByZXF1ZXN0IHRoZSB0aWxlXG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1ZXN0VGlsZShuY29vcmRzLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjYWNoZWQgPSBzZWxmLl9jYWNoZVtua2V5XTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjYWNoZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRpbGUgaXMgbm8gbG9uZ2VyIGJlaW5nIHRyYWNrZWQsIGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlZC5pc1BlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgY2FjaGVkLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGUgdGhlIGV4dHJlbWFcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEgJiYgc2VsZi51cGRhdGVFeHRyZW1hKGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRyZW1hIGNoYW5nZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub25DYWNoZUxvYWRFeHRyZW1hVXBkYXRlKHRpbGUsIGNhY2hlZCwgY29vcmRzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRhdGEgaXMgbG9hZGVkIGludG8gY2FjaGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub25DYWNoZUxvYWQodGlsZSwgY2FjaGVkLCBjb29yZHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICB9KTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gTGl2ZTtcblxufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBCYXNlID0gcmVxdWlyZSgnLi9CYXNlJyk7XG5cbiAgICB2YXIgUGVuZGluZyA9IEJhc2UuZXh0ZW5kKHtcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICB1bmxvYWRJbnZpc2libGVUaWxlczogdHJ1ZSxcbiAgICAgICAgICAgIHpJbmRleDogNTAwMFxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMuX3BlbmRpbmdUaWxlcyA9IHt9O1xuICAgICAgICAgICAgLy8gc2V0IHJlbmRlcmVyXG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMucmVuZGVyZXJDbGFzcykge1xuICAgICAgICAgICAgICAgIHRocm93ICdObyBgcmVuZGVyZXJDbGFzc2Agb3B0aW9uIGZvdW5kLic7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHJlY3Vyc2l2ZWx5IGV4dGVuZFxuICAgICAgICAgICAgICAgICQuZXh0ZW5kKHRydWUsIHRoaXMsIG9wdGlvbnMucmVuZGVyZXJDbGFzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBzZXQgb3B0aW9uc1xuICAgICAgICAgICAgTC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluY3JlbWVudDogZnVuY3Rpb24oY29vcmQpIHtcbiAgICAgICAgICAgIHZhciBoYXNoID0gdGhpcy5fZ2V0VGlsZUhhc2goY29vcmQpO1xuICAgICAgICAgICAgaWYgKHRoaXMuX3BlbmRpbmdUaWxlc1toYXNoXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGVuZGluZ1RpbGVzW2hhc2hdID0gMTtcbiAgICAgICAgICAgICAgICB2YXIgdGlsZXMgPSB0aGlzLl9nZXRUaWxlc1dpdGhIYXNoKGhhc2gpO1xuICAgICAgICAgICAgICAgIHRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVUaWxlKGNvb3JkLCB0aWxlKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGVuZGluZ1RpbGVzW2hhc2hdKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVjcmVtZW50OiBmdW5jdGlvbihjb29yZCkge1xuICAgICAgICAgICAgdmFyIGhhc2ggPSB0aGlzLl9nZXRUaWxlSGFzaChjb29yZCk7XG4gICAgICAgICAgICB0aGlzLl9wZW5kaW5nVGlsZXNbaGFzaF0tLTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9wZW5kaW5nVGlsZXNbaGFzaF0gPT09IDApIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fcGVuZGluZ1RpbGVzW2hhc2hdO1xuICAgICAgICAgICAgICAgIHZhciB0aWxlcyA9IHRoaXMuX2dldFRpbGVzV2l0aEhhc2goaGFzaCk7XG4gICAgICAgICAgICAgICAgdGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVRpbGUoY29vcmQsIHRpbGUpO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRUaWxlQ2xhc3M6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgICAgICAgIHJldHVybiAnbGVhZmxldC1wZW5kaW5nLScgKyBoYXNoO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRUaWxlSGFzaDogZnVuY3Rpb24oY29vcmQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb29yZC56ICsgJy0nICsgY29vcmQueCArICctJyArIGNvb3JkLnk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldFRpbGVzV2l0aEhhc2g6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSB0aGlzLl9nZXRUaWxlQ2xhc3MoaGFzaCk7XG4gICAgICAgICAgICB2YXIgdGlsZXMgPSBbXTtcbiAgICAgICAgICAgICQodGhpcy5fY29udGFpbmVyKS5maW5kKCcuJyArIGNsYXNzTmFtZSkuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdGlsZXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3VwZGF0ZVRpbGU6IGZ1bmN0aW9uKGNvb3JkLCB0aWxlKSB7XG4gICAgICAgICAgICAvLyBnZXQgaGFzaFxuICAgICAgICAgICAgdmFyIGhhc2ggPSB0aGlzLl9nZXRUaWxlSGFzaChjb29yZCk7XG4gICAgICAgICAgICAkKHRpbGUpLmFkZENsYXNzKHRoaXMuX2dldFRpbGVDbGFzcyhoYXNoKSk7XG4gICAgICAgICAgICBpZiAodGhpcy5fcGVuZGluZ1RpbGVzW2hhc2hdID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyVGlsZSh0aWxlLCBjb29yZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRpbGUuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlVGlsZTogZnVuY3Rpb24oY29vcmQpIHtcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIDxkaXY+IGVsZW1lbnQgZm9yIGRyYXdpbmdcbiAgICAgICAgICAgIHZhciB0aWxlID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtdGlsZScpO1xuICAgICAgICAgICAgLy8gZ2V0IGhhc2hcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVRpbGUoY29vcmQsIHRpbGUpO1xuICAgICAgICAgICAgLy8gcGFzcyB0aWxlIHRvIGNhbGxiYWNrXG4gICAgICAgICAgICByZXR1cm4gdGlsZTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXJUaWxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIG92ZXJyaWRlXG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBQZW5kaW5nO1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gZGVidWcgdGlsZSBsYXllclxuICAgIHZhciBEZWJ1ZyA9IHJlcXVpcmUoJy4vY29yZS9EZWJ1ZycpO1xuXG4gICAgLy8gcGVuZGluZyB0aWxlIGxheWVyXG4gICAgdmFyIFBlbmRpbmcgPSByZXF1aXJlKCcuL2NvcmUvUGVuZGluZycpO1xuXG4gICAgLy8gaW1hZ2UgbGF5ZXJcbiAgICB2YXIgSW1hZ2UgPSByZXF1aXJlKCcuL2NvcmUvSW1hZ2UnKTtcblxuICAgIC8vIGxpdmUgdGlsZSBsYXllcnNcbiAgICB2YXIgSGVhdG1hcCA9IHJlcXVpcmUoJy4vdHlwZS9IZWF0bWFwJyk7XG4gICAgdmFyIFRvcFRyYWlscyA9IHJlcXVpcmUoJy4vdHlwZS9Ub3BUcmFpbHMnKTtcbiAgICB2YXIgVG9wQ291bnQgPSByZXF1aXJlKCcuL3R5cGUvVG9wQ291bnQnKTtcbiAgICB2YXIgVG9wRnJlcXVlbmN5ID0gcmVxdWlyZSgnLi90eXBlL1RvcEZyZXF1ZW5jeScpO1xuICAgIHZhciBUb3BpY0NvdW50ID0gcmVxdWlyZSgnLi90eXBlL1RvcGljQ291bnQnKTtcbiAgICB2YXIgVG9waWNGcmVxdWVuY3kgPSByZXF1aXJlKCcuL3R5cGUvVG9waWNGcmVxdWVuY3knKTtcbiAgICB2YXIgUHJldmlldyA9IHJlcXVpcmUoJy4vdHlwZS9QcmV2aWV3Jyk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgRGVidWc6IERlYnVnLFxuICAgICAgICBQZW5kaW5nOiBQZW5kaW5nLFxuICAgICAgICBJbWFnZTogSW1hZ2UsXG4gICAgICAgIEhlYXRtYXA6IEhlYXRtYXAsXG4gICAgICAgIFRvcENvdW50OiBUb3BDb3VudCxcbiAgICAgICAgVG9wVHJhaWxzOiBUb3BUcmFpbHMsXG4gICAgICAgIFRvcEZyZXF1ZW5jeTogVG9wRnJlcXVlbmN5LFxuICAgICAgICBUb3BpY0NvdW50OiBUb3BpY0NvdW50LFxuICAgICAgICBUb3BpY0ZyZXF1ZW5jeTogVG9waWNGcmVxdWVuY3ksXG4gICAgICAgIFByZXZpZXc6IFByZXZpZXdcbiAgICB9O1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgZnVuY3Rpb24gcmdiMmxhYihyZ2IpIHtcbiAgICAgICAgdmFyIHIgPSByZ2JbMF0gPiAwLjA0MDQ1ID8gTWF0aC5wb3coKHJnYlswXSArIDAuMDU1KSAvIDEuMDU1LCAyLjQpIDogcmdiWzBdIC8gMTIuOTI7XG4gICAgICAgIHZhciBnID0gcmdiWzFdID4gMC4wNDA0NSA/IE1hdGgucG93KChyZ2JbMV0gKyAwLjA1NSkgLyAxLjA1NSwgMi40KSA6IHJnYlsxXSAvIDEyLjkyO1xuICAgICAgICB2YXIgYiA9IHJnYlsyXSA+IDAuMDQwNDUgPyBNYXRoLnBvdygocmdiWzJdICsgMC4wNTUpIC8gMS4wNTUsIDIuNCkgOiByZ2JbMl0gLyAxMi45MjtcbiAgICAgICAgLy9PYnNlcnZlci4gPSAywrAsIElsbHVtaW5hbnQgPSBENjVcbiAgICAgICAgdmFyIHggPSByICogMC40MTI0NTY0ICsgZyAqIDAuMzU3NTc2MSArIGIgKiAwLjE4MDQzNzU7XG4gICAgICAgIHZhciB5ID0gciAqIDAuMjEyNjcyOSArIGcgKiAwLjcxNTE1MjIgKyBiICogMC4wNzIxNzUwO1xuICAgICAgICB2YXIgeiA9IHIgKiAwLjAxOTMzMzkgKyBnICogMC4xMTkxOTIwICsgYiAqIDAuOTUwMzA0MTtcbiAgICAgICAgeCA9IHggLyAwLjk1MDQ3OyAvLyBPYnNlcnZlcj0gMsKwLCBJbGx1bWluYW50PSBENjVcbiAgICAgICAgeSA9IHkgLyAxLjAwMDAwO1xuICAgICAgICB6ID0geiAvIDEuMDg4ODM7XG4gICAgICAgIHggPSB4ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh4LCAxIC8gMykgOiAoNy43ODcwMzcgKiB4KSArICgxNiAvIDExNik7XG4gICAgICAgIHkgPSB5ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh5LCAxIC8gMykgOiAoNy43ODcwMzcgKiB5KSArICgxNiAvIDExNik7XG4gICAgICAgIHogPSB6ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh6LCAxIC8gMykgOiAoNy43ODcwMzcgKiB6KSArICgxNiAvIDExNik7XG4gICAgICAgIHJldHVybiBbKDExNiAqIHkpIC0gMTYsXG4gICAgICAgICAgICA1MDAgKiAoeCAtIHkpLFxuICAgICAgICAgICAgMjAwICogKHkgLSB6KSxcbiAgICAgICAgICAgIHJnYlszXV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGFiMnJnYihsYWIpIHtcbiAgICAgICAgdmFyIHkgPSAobGFiWzBdICsgMTYpIC8gMTE2O1xuICAgICAgICB2YXIgeCA9IHkgKyBsYWJbMV0gLyA1MDA7XG4gICAgICAgIHZhciB6ID0geSAtIGxhYlsyXSAvIDIwMDtcbiAgICAgICAgeCA9IHggPiAwLjIwNjg5MzAzNCA/IHggKiB4ICogeCA6ICh4IC0gNCAvIDI5KSAvIDcuNzg3MDM3O1xuICAgICAgICB5ID0geSA+IDAuMjA2ODkzMDM0ID8geSAqIHkgKiB5IDogKHkgLSA0IC8gMjkpIC8gNy43ODcwMzc7XG4gICAgICAgIHogPSB6ID4gMC4yMDY4OTMwMzQgPyB6ICogeiAqIHogOiAoeiAtIDQgLyAyOSkgLyA3Ljc4NzAzNztcbiAgICAgICAgeCA9IHggKiAwLjk1MDQ3OyAvLyBPYnNlcnZlcj0gMsKwLCBJbGx1bWluYW50PSBENjVcbiAgICAgICAgeSA9IHkgKiAxLjAwMDAwO1xuICAgICAgICB6ID0geiAqIDEuMDg4ODM7XG4gICAgICAgIHZhciByID0geCAqIDMuMjQwNDU0MiArIHkgKiAtMS41MzcxMzg1ICsgeiAqIC0wLjQ5ODUzMTQ7XG4gICAgICAgIHZhciBnID0geCAqIC0wLjk2OTI2NjAgKyB5ICogMS44NzYwMTA4ICsgeiAqIDAuMDQxNTU2MDtcbiAgICAgICAgdmFyIGIgPSB4ICogMC4wNTU2NDM0ICsgeSAqIC0wLjIwNDAyNTkgKyB6ICogMS4wNTcyMjUyO1xuICAgICAgICByID0gciA+IDAuMDAzMDQgPyAxLjA1NSAqIE1hdGgucG93KHIsIDEgLyAyLjQpIC0gMC4wNTUgOiAxMi45MiAqIHI7XG4gICAgICAgIGcgPSBnID4gMC4wMDMwNCA/IDEuMDU1ICogTWF0aC5wb3coZywgMSAvIDIuNCkgLSAwLjA1NSA6IDEyLjkyICogZztcbiAgICAgICAgYiA9IGIgPiAwLjAwMzA0ID8gMS4wNTUgKiBNYXRoLnBvdyhiLCAxIC8gMi40KSAtIDAuMDU1IDogMTIuOTIgKiBiO1xuICAgICAgICByZXR1cm4gW01hdGgubWF4KE1hdGgubWluKHIsIDEpLCAwKSwgTWF0aC5tYXgoTWF0aC5taW4oZywgMSksIDApLCBNYXRoLm1heChNYXRoLm1pbihiLCAxKSwgMCksIGxhYlszXV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGlzdGFuY2UoYzEsIGMyKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoXG4gICAgICAgICAgICAoYzFbMF0gLSBjMlswXSkgKiAoYzFbMF0gLSBjMlswXSkgK1xuICAgICAgICAgICAgKGMxWzFdIC0gYzJbMV0pICogKGMxWzFdIC0gYzJbMV0pICtcbiAgICAgICAgICAgIChjMVsyXSAtIGMyWzJdKSAqIChjMVsyXSAtIGMyWzJdKSArXG4gICAgICAgICAgICAoYzFbM10gLSBjMlszXSkgKiAoYzFbM10gLSBjMlszXSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICB2YXIgR1JBRElFTlRfU1RFUFMgPSAyMDA7XG5cbiAgICAvLyBJbnRlcnBvbGF0ZSBiZXR3ZWVuIGEgc2V0IG9mIGNvbG9ycyB1c2luZyBldmVuIHBlcmNlcHR1YWwgZGlzdGFuY2UgYW5kIGludGVycG9sYXRpb24gaW4gQ0lFIEwqYSpiKiBzcGFjZVxuICAgIHZhciBidWlsZFBlcmNlcHR1YWxMb29rdXBUYWJsZSA9IGZ1bmN0aW9uKGJhc2VDb2xvcnMpIHtcbiAgICAgICAgdmFyIG91dHB1dEdyYWRpZW50ID0gW107XG4gICAgICAgIC8vIENhbGN1bGF0ZSBwZXJjZXB0dWFsIHNwcmVhZCBpbiBMKmEqYiogc3BhY2VcbiAgICAgICAgdmFyIGxhYnMgPSBfLm1hcChiYXNlQ29sb3JzLCBmdW5jdGlvbihjb2xvcikge1xuICAgICAgICAgICAgcmV0dXJuIHJnYjJsYWIoW2NvbG9yWzBdIC8gMjU1LCBjb2xvclsxXSAvIDI1NSwgY29sb3JbMl0gLyAyNTUsIGNvbG9yWzNdIC8gMjU1XSk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgZGlzdGFuY2VzID0gXy5tYXAobGFicywgZnVuY3Rpb24oY29sb3IsIGluZGV4LCBjb2xvcnMpIHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleCA+IDAgPyBkaXN0YW5jZShjb2xvciwgY29sb3JzW2luZGV4IC0gMV0pIDogMDtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIENhbGN1bGF0ZSBjdW11bGF0aXZlIGRpc3RhbmNlcyBpbiBbMCwxXVxuICAgICAgICB2YXIgdG90YWxEaXN0YW5jZSA9IF8ucmVkdWNlKGRpc3RhbmNlcywgZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGEgKyBiO1xuICAgICAgICB9LCAwKTtcbiAgICAgICAgZGlzdGFuY2VzID0gXy5tYXAoZGlzdGFuY2VzLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gZCAvIHRvdGFsRGlzdGFuY2U7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgZGlzdGFuY2VUcmF2ZXJzZWQgPSAwO1xuICAgICAgICB2YXIga2V5ID0gMDtcbiAgICAgICAgdmFyIHByb2dyZXNzO1xuICAgICAgICB2YXIgc3RlcFByb2dyZXNzO1xuICAgICAgICB2YXIgcmdiO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IEdSQURJRU5UX1NURVBTOyBpKyspIHtcbiAgICAgICAgICAgIHByb2dyZXNzID0gaSAvIChHUkFESUVOVF9TVEVQUyAtIDEpO1xuICAgICAgICAgICAgaWYgKHByb2dyZXNzID4gZGlzdGFuY2VUcmF2ZXJzZWQgKyBkaXN0YW5jZXNba2V5ICsgMV0gJiYga2V5ICsgMSA8IGxhYnMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIGtleSArPSAxO1xuICAgICAgICAgICAgICAgIGRpc3RhbmNlVHJhdmVyc2VkICs9IGRpc3RhbmNlc1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RlcFByb2dyZXNzID0gKHByb2dyZXNzIC0gZGlzdGFuY2VUcmF2ZXJzZWQpIC8gZGlzdGFuY2VzW2tleSArIDFdO1xuICAgICAgICAgICAgcmdiID0gbGFiMnJnYihbXG4gICAgICAgICAgICAgICAgbGFic1trZXldWzBdICsgKGxhYnNba2V5ICsgMV1bMF0gLSBsYWJzW2tleV1bMF0pICogc3RlcFByb2dyZXNzLFxuICAgICAgICAgICAgICAgIGxhYnNba2V5XVsxXSArIChsYWJzW2tleSArIDFdWzFdIC0gbGFic1trZXldWzFdKSAqIHN0ZXBQcm9ncmVzcyxcbiAgICAgICAgICAgICAgICBsYWJzW2tleV1bMl0gKyAobGFic1trZXkgKyAxXVsyXSAtIGxhYnNba2V5XVsyXSkgKiBzdGVwUHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgbGFic1trZXldWzNdICsgKGxhYnNba2V5ICsgMV1bM10gLSBsYWJzW2tleV1bM10pICogc3RlcFByb2dyZXNzXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIG91dHB1dEdyYWRpZW50LnB1c2goW1xuICAgICAgICAgICAgICAgIE1hdGgucm91bmQocmdiWzBdICogMjU1KSxcbiAgICAgICAgICAgICAgICBNYXRoLnJvdW5kKHJnYlsxXSAqIDI1NSksXG4gICAgICAgICAgICAgICAgTWF0aC5yb3VuZChyZ2JbMl0gKiAyNTUpLFxuICAgICAgICAgICAgICAgIE1hdGgucm91bmQocmdiWzNdICogMjU1KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dEdyYWRpZW50O1xuICAgIH07XG5cbiAgICB2YXIgQ09PTCA9IGJ1aWxkUGVyY2VwdHVhbExvb2t1cFRhYmxlKFtcbiAgICAgICAgWzB4MDQsIDB4MjAsIDB4NDAsIDB4NTBdLFxuICAgICAgICBbMHgwOCwgMHg0MCwgMHg4MSwgMHg3Zl0sXG4gICAgICAgIFsweDA4LCAweDY4LCAweGFjLCAweGZmXSxcbiAgICAgICAgWzB4MmIsIDB4OGMsIDB4YmUsIDB4ZmZdLFxuICAgICAgICBbMHg0ZSwgMHhiMywgMHhkMywgMHhmZl0sXG4gICAgICAgIFsweDdiLCAweGNjLCAweGM0LCAweGZmXSxcbiAgICAgICAgWzB4YTgsIDB4ZGQsIDB4YjUsIDB4ZmZdLFxuICAgICAgICBbMHhjYywgMHhlYiwgMHhjNSwgMHhmZl0sXG4gICAgICAgIFsweGUwLCAweGYzLCAweGRiLCAweGZmXSxcbiAgICAgICAgWzB4ZjcsIDB4ZmMsIDB4ZjAsIDB4ZmZdXG4gICAgXSk7XG5cbiAgICB2YXIgSE9UID0gYnVpbGRQZXJjZXB0dWFsTG9va3VwVGFibGUoW1xuICAgICAgICBbMHg0MCwgMHgwMCwgMHgxMywgMHg1MF0sXG4gICAgICAgIFsweDgwLCAweDAwLCAweDI2LCAweDdmXSxcbiAgICAgICAgWzB4YmQsIDB4MDAsIDB4MjYsIDB4ZmZdLFxuICAgICAgICBbMHhlMywgMHgxYSwgMHgxYywgMHhmZl0sXG4gICAgICAgIFsweGZjLCAweDRlLCAweDJhLCAweGZmXSxcbiAgICAgICAgWzB4ZmQsIDB4OGQsIDB4M2MsIDB4ZmZdLFxuICAgICAgICBbMHhmZSwgMHhiMiwgMHg0YywgMHhmZl0sXG4gICAgICAgIFsweGZlLCAweGQ5LCAweDc2LCAweGZmXSxcbiAgICAgICAgWzB4ZmYsIDB4ZWQsIDB4YTAsIDB4ZmZdXG4gICAgXSk7XG5cbiAgICB2YXIgVkVSREFOVCA9IGJ1aWxkUGVyY2VwdHVhbExvb2t1cFRhYmxlKFtcbiAgICAgICAgWzB4MDAsIDB4NDAsIDB4MjYsIDB4NTBdLFxuICAgICAgICBbMHgwMCwgMHg1YSwgMHgzMiwgMHg3Zl0sXG4gICAgICAgIFsweDIzLCAweDg0LCAweDQzLCAweGZmXSxcbiAgICAgICAgWzB4NDEsIDB4YWIsIDB4NWQsIDB4ZmZdLFxuICAgICAgICBbMHg3OCwgMHhjNiwgMHg3OSwgMHhmZl0sXG4gICAgICAgIFsweGFkLCAweGRkLCAweDhlLCAweGZmXSxcbiAgICAgICAgWzB4ZDksIDB4ZjAsIDB4YTMsIDB4ZmZdLFxuICAgICAgICBbMHhmNywgMHhmYywgMHhiOSwgMHhmZl0sXG4gICAgICAgIFsweGZmLCAweGZmLCAweGU1LCAweGZmXVxuICAgIF0pO1xuXG4gICAgdmFyIFNQRUNUUkFMID0gYnVpbGRQZXJjZXB0dWFsTG9va3VwVGFibGUoW1xuICAgICAgICBbMHgyNiwgMHgxYSwgMHg0MCwgMHg1MF0sXG4gICAgICAgIFsweDQ0LCAweDJmLCAweDcyLCAweDdmXSxcbiAgICAgICAgWzB4ZTEsIDB4MmIsIDB4MDIsIDB4ZmZdLFxuICAgICAgICBbMHgwMiwgMHhkYywgMHgwMSwgMHhmZl0sXG4gICAgICAgIFsweGZmLCAweGQyLCAweDAyLCAweGZmXSxcbiAgICAgICAgWzB4ZmYsIDB4ZmYsIDB4ZmYsIDB4ZmZdXG4gICAgXSk7XG5cbiAgICB2YXIgVEVNUEVSQVRVUkUgPSBidWlsZFBlcmNlcHR1YWxMb29rdXBUYWJsZShbXG4gICAgICAgIFsweDAwLCAweDE2LCAweDQwLCAweDUwXSxcbiAgICAgICAgWzB4MDAsIDB4MzksIDB4NjYsIDB4N2ZdLCAvL2JsdWVcbiAgICAgICAgWzB4MzEsIDB4M2QsIDB4NjYsIDB4ZmZdLCAvL3B1cnBsZVxuICAgICAgICBbMHhlMSwgMHgyYiwgMHgwMiwgMHhmZl0sIC8vcmVkXG4gICAgICAgIFsweGZmLCAweGQyLCAweDAyLCAweGZmXSwgLy95ZWxsb3dcbiAgICAgICAgWzB4ZmYsIDB4ZmYsIDB4ZmYsIDB4ZmZdIC8vd2hpdGVcbiAgICBdKTtcblxuICAgIHZhciBHUkVZU0NBTEUgPSBidWlsZFBlcmNlcHR1YWxMb29rdXBUYWJsZShbXG4gICAgICAgIFsweDAwLCAweDAwLCAweDAwLCAweDdmXSxcbiAgICAgICAgWzB4NDAsIDB4NDAsIDB4NDAsIDB4ZmZdLFxuICAgICAgICBbMHhmZiwgMHhmZiwgMHhmZiwgMHhmZl1cbiAgICBdKTtcblxuICAgIHZhciBQT0xBUl9IT1QgPSBidWlsZFBlcmNlcHR1YWxMb29rdXBUYWJsZShbXG4gICAgICAgIFsgMHhmZiwgMHg0NCwgMHgwMCwgMHhmZiBdLFxuICAgICAgICBbIDB4YmQsIDB4YmQsIDB4YmQsIDB4YjAgXVxuICAgIF0pO1xuXG4gICAgdmFyIFBPTEFSX0NPTEQgPSBidWlsZFBlcmNlcHR1YWxMb29rdXBUYWJsZShbXG4gICAgICAgIFsgMHhiZCwgMHhiZCwgMHhiZCwgMHhiMCBdLFxuICAgICAgICBbIDB4MzIsIDB4YTUsIDB4ZjksIDB4ZmYgXVxuICAgIF0pO1xuXG4gICAgdmFyIGJ1aWxkTG9va3VwRnVuY3Rpb24gPSBmdW5jdGlvbihSQU1QKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihzY2FsZWRWYWx1ZSwgaW5Db2xvcikge1xuICAgICAgICAgICAgdmFyIGNvbG9yID0gUkFNUFtNYXRoLmZsb29yKHNjYWxlZFZhbHVlICogKFJBTVAubGVuZ3RoIC0gMSkpXTtcbiAgICAgICAgICAgIGluQ29sb3JbMF0gPSBjb2xvclswXTtcbiAgICAgICAgICAgIGluQ29sb3JbMV0gPSBjb2xvclsxXTtcbiAgICAgICAgICAgIGluQ29sb3JbMl0gPSBjb2xvclsyXTtcbiAgICAgICAgICAgIGluQ29sb3JbM10gPSBjb2xvclszXTtcbiAgICAgICAgICAgIHJldHVybiBpbkNvbG9yO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICB2YXIgQ29sb3JSYW1wID0ge1xuICAgICAgICBjb29sOiBidWlsZExvb2t1cEZ1bmN0aW9uKENPT0wpLFxuICAgICAgICBob3Q6IGJ1aWxkTG9va3VwRnVuY3Rpb24oSE9UKSxcbiAgICAgICAgdmVyZGFudDogYnVpbGRMb29rdXBGdW5jdGlvbihWRVJEQU5UKSxcbiAgICAgICAgc3BlY3RyYWw6IGJ1aWxkTG9va3VwRnVuY3Rpb24oU1BFQ1RSQUwpLFxuICAgICAgICB0ZW1wZXJhdHVyZTogYnVpbGRMb29rdXBGdW5jdGlvbihURU1QRVJBVFVSRSksXG4gICAgICAgIGdyZXk6IGJ1aWxkTG9va3VwRnVuY3Rpb24oR1JFWVNDQUxFKSxcbiAgICAgICAgcG9sYXI6IGJ1aWxkTG9va3VwRnVuY3Rpb24oUE9MQVJfSE9ULmNvbmNhdChQT0xBUl9DT0xEKSlcbiAgICB9O1xuXG4gICAgdmFyIHNldENvbG9yUmFtcCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIGZ1bmMgPSBDb2xvclJhbXBbdHlwZS50b0xvd2VyQ2FzZSgpXTtcbiAgICAgICAgaWYgKGZ1bmMpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbG9yUmFtcCA9IGZ1bmM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHZhciBnZXRDb2xvclJhbXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbG9yUmFtcDtcbiAgICB9O1xuXG4gICAgdmFyIGluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY29sb3JSYW1wID0gQ29sb3JSYW1wLnZlcmRhbnQ7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICBpbml0aWFsaXplOiBpbml0aWFsaXplLFxuICAgICAgICBzZXRDb2xvclJhbXA6IHNldENvbG9yUmFtcCxcbiAgICAgICAgZ2V0Q29sb3JSYW1wOiBnZXRDb2xvclJhbXBcbiAgICB9O1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIFNJR01PSURfU0NBTEUgPSAwLjE1O1xuXG4gICAgLy8gbG9nMTBcblxuICAgIGZ1bmN0aW9uIGxvZzEwVHJhbnNmb3JtKHZhbCwgbWluLCBtYXgpIHtcbiAgICAgICAgdmFyIGxvZ01pbiA9IE1hdGgubG9nMTAobWluIHx8IDEpO1xuICAgICAgICB2YXIgbG9nTWF4ID0gTWF0aC5sb2cxMChtYXggfHwgMSk7XG4gICAgICAgIHZhciBsb2dWYWwgPSBNYXRoLmxvZzEwKHZhbCB8fCAxKTtcbiAgICAgICAgcmV0dXJuIChsb2dWYWwgLSBsb2dNaW4pIC8gKChsb2dNYXggLSBsb2dNaW4pIHx8IDEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGludmVyc2VMb2cxMFRyYW5zZm9ybShudmFsLCBtaW4sIG1heCkge1xuICAgICAgICB2YXIgbG9nTWluID0gTWF0aC5sb2cxMChtaW4gfHwgMSk7XG4gICAgICAgIHZhciBsb2dNYXggPSBNYXRoLmxvZzEwKG1heCB8fCAxKTtcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KDEwLCAobnZhbCAqIGxvZ01heCAtIG52YWwgKiBsb2dNaW4pICsgbG9nTWluKTtcbiAgICB9XG5cbiAgICAvLyBzaWdtb2lkXG5cbiAgICBmdW5jdGlvbiBzaWdtb2lkVHJhbnNmb3JtKHZhbCwgbWluLCBtYXgpIHtcbiAgICAgICAgdmFyIGFic01pbiA9IE1hdGguYWJzKG1pbik7XG4gICAgICAgIHZhciBhYnNNYXggPSBNYXRoLmFicyhtYXgpO1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSBNYXRoLm1heChhYnNNaW4sIGFic01heCk7XG4gICAgICAgIHZhciBzY2FsZWRWYWwgPSB2YWwgLyAoU0lHTU9JRF9TQ0FMRSAqIGRpc3RhbmNlKTtcbiAgICAgICAgcmV0dXJuIDEgLyAoMSArIE1hdGguZXhwKC1zY2FsZWRWYWwpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnZlcnNlU2lnbW9pZFRyYW5zZm9ybShudmFsLCBtaW4sIG1heCkge1xuICAgICAgICB2YXIgYWJzTWluID0gTWF0aC5hYnMobWluKTtcbiAgICAgICAgdmFyIGFic01heCA9IE1hdGguYWJzKG1heCk7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IE1hdGgubWF4KGFic01pbiwgYWJzTWF4KTtcbiAgICAgICAgaWYgKG52YWwgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAtZGlzdGFuY2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG52YWwgPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXN0YW5jZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5sb2coKDEvbnZhbCkgLSAxKSAqIC0oU0lHTU9JRF9TQ0FMRSAqIGRpc3RhbmNlKTtcbiAgICB9XG5cbiAgICAvLyBsaW5lYXJcblxuICAgIGZ1bmN0aW9uIGxpbmVhclRyYW5zZm9ybSh2YWwsIG1pbiwgbWF4KSB7XG4gICAgICAgIHZhciByYW5nZSA9IG1heCAtIG1pbjtcbiAgICAgICAgcmV0dXJuICh2YWwgLSBtaW4pIC8gcmFuZ2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW52ZXJzZUxpbmVhclRyYW5zZm9ybShudmFsLCBtaW4sIG1heCkge1xuICAgICAgICB2YXIgcmFuZ2UgPSBtYXggLSBtaW47XG4gICAgICAgIHJldHVybiBtaW4gKyBudmFsICogcmFuZ2U7XG4gICAgfVxuXG4gICAgdmFyIFRyYW5zZm9ybSA9IHtcbiAgICAgICAgbGluZWFyOiBsaW5lYXJUcmFuc2Zvcm0sXG4gICAgICAgIGxvZzEwOiBsb2cxMFRyYW5zZm9ybSxcbiAgICAgICAgc2lnbW9pZDogc2lnbW9pZFRyYW5zZm9ybVxuICAgIH07XG5cbiAgICB2YXIgSW52ZXJzZSA9IHtcbiAgICAgICAgbGluZWFyOiBpbnZlcnNlTGluZWFyVHJhbnNmb3JtLFxuICAgICAgICBsb2cxMDogaW52ZXJzZUxvZzEwVHJhbnNmb3JtLFxuICAgICAgICBzaWdtb2lkOiBpbnZlcnNlU2lnbW9pZFRyYW5zZm9ybVxuICAgIH07XG5cbiAgICB2YXIgaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9yYW5nZSA9IHtcbiAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgIG1heDogMVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm1GdW5jID0gbG9nMTBUcmFuc2Zvcm07XG4gICAgICAgIHRoaXMuX2ludmVyc2VGdW5jID0gaW52ZXJzZUxvZzEwVHJhbnNmb3JtO1xuICAgIH07XG5cbiAgICB2YXIgc2V0VHJhbnNmb3JtRnVuYyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIGZ1bmMgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybUZ1bmMgPSBUcmFuc2Zvcm1bZnVuY107XG4gICAgICAgIHRoaXMuX2ludmVyc2VGdW5jID0gSW52ZXJzZVtmdW5jXTtcbiAgICB9O1xuXG4gICAgdmFyIHNldFZhbHVlUmFuZ2UgPSBmdW5jdGlvbihyYW5nZSkge1xuICAgICAgICB0aGlzLl9yYW5nZS5taW4gPSByYW5nZS5taW47XG4gICAgICAgIHRoaXMuX3JhbmdlLm1heCA9IHJhbmdlLm1heDtcbiAgICB9O1xuXG4gICAgdmFyIGdldFZhbHVlUmFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JhbmdlO1xuICAgIH07XG5cbiAgICB2YXIgaW50ZXJwb2xhdGVUb1JhbmdlID0gZnVuY3Rpb24obnZhbCkge1xuICAgICAgICAvLyBpbnRlcnBvbGF0ZSBiZXR3ZWVuIHRoZSBmaWx0ZXIgcmFuZ2VcbiAgICAgICAgdmFyIHJNaW4gPSB0aGlzLl9yYW5nZS5taW47XG4gICAgICAgIHZhciByTWF4ID0gdGhpcy5fcmFuZ2UubWF4O1xuICAgICAgICB2YXIgcnZhbCA9IChudmFsIC0gck1pbikgLyAock1heCAtIHJNaW4pO1xuICAgICAgICAvLyBlbnN1cmUgb3V0cHV0IGlzIFswOjFdXG4gICAgICAgIHJldHVybiBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBydmFsKSk7XG4gICAgfTtcblxuICAgIHZhciB0cmFuc2Zvcm1WYWx1ZSA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAvLyBjbGFtcCB0aGUgdmFsdWUgYmV0d2VlbiB0aGUgZXh0cmVtZSAoc2hvdWxkbid0IGJlIG5lY2Vzc2FyeSlcbiAgICAgICAgdmFyIG1pbiA9IHRoaXMuX2V4dHJlbWEubWluO1xuICAgICAgICB2YXIgbWF4ID0gdGhpcy5fZXh0cmVtYS5tYXg7XG4gICAgICAgIHZhciBjbGFtcGVkID0gTWF0aC5tYXgoTWF0aC5taW4odmFsLCBtYXgpLCBtaW4pO1xuICAgICAgICAvLyBub3JtYWxpemUgdGhlIHZhbHVlXG4gICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm1GdW5jKGNsYW1wZWQsIG1pbiwgbWF4KTtcbiAgICB9O1xuXG4gICAgdmFyIHVudHJhbnNmb3JtVmFsdWUgPSBmdW5jdGlvbihudmFsKSB7XG4gICAgICAgIHZhciBtaW4gPSB0aGlzLl9leHRyZW1hLm1pbjtcbiAgICAgICAgdmFyIG1heCA9IHRoaXMuX2V4dHJlbWEubWF4O1xuICAgICAgICAvLyBjbGFtcCB0aGUgdmFsdWUgYmV0d2VlbiB0aGUgZXh0cmVtZSAoc2hvdWxkbid0IGJlIG5lY2Vzc2FyeSlcbiAgICAgICAgdmFyIGNsYW1wZWQgPSBNYXRoLm1heChNYXRoLm1pbihudmFsLCAxKSwgMCk7XG4gICAgICAgIC8vIHVubm9ybWFsaXplIHRoZSB2YWx1ZVxuICAgICAgICByZXR1cm4gdGhpcy5faW52ZXJzZUZ1bmMoY2xhbXBlZCwgbWluLCBtYXgpO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgaW5pdGlhbGl6ZTogaW5pdGlhbGl6ZSxcbiAgICAgICAgc2V0VHJhbnNmb3JtRnVuYzogc2V0VHJhbnNmb3JtRnVuYyxcbiAgICAgICAgc2V0VmFsdWVSYW5nZTogc2V0VmFsdWVSYW5nZSxcbiAgICAgICAgZ2V0VmFsdWVSYW5nZTogZ2V0VmFsdWVSYW5nZSxcbiAgICAgICAgdHJhbnNmb3JtVmFsdWU6IHRyYW5zZm9ybVZhbHVlLFxuICAgICAgICB1bnRyYW5zZm9ybVZhbHVlOiB1bnRyYW5zZm9ybVZhbHVlLFxuICAgICAgICBpbnRlcnBvbGF0ZVRvUmFuZ2U6IGludGVycG9sYXRlVG9SYW5nZVxuICAgIH07XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgVGlsaW5nID0gcmVxdWlyZSgnLi9UaWxpbmcnKTtcblxuICAgIHZhciBzZXRSZXNvbHV0aW9uID0gZnVuY3Rpb24ocmVzb2x1dGlvbikge1xuICAgICAgICBpZiAocmVzb2x1dGlvbiAhPT0gdGhpcy5fcGFyYW1zLmJpbm5pbmcucmVzb2x1dGlvbikge1xuICAgICAgICAgICAgdGhpcy5fcGFyYW1zLmJpbm5pbmcucmVzb2x1dGlvbiA9IHJlc29sdXRpb247XG4gICAgICAgICAgICB0aGlzLmNsZWFyRXh0cmVtYSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0UmVzb2x1dGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFyYW1zLmJpbm5pbmcucmVzb2x1dGlvbjtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICAgIC8vIHRpbGluZ1xuICAgICAgICBzZXRYRmllbGQ6IFRpbGluZy5zZXRYRmllbGQsXG4gICAgICAgIGdldFhGaWVsZDogVGlsaW5nLmdldFhGaWVsZCxcbiAgICAgICAgc2V0WUZpZWxkOiBUaWxpbmcuc2V0WUZpZWxkLFxuICAgICAgICBnZXRZRmllbGQ6IFRpbGluZy5nZXRZRmllbGQsXG4gICAgICAgIC8vIGJpbm5pbmdcbiAgICAgICAgc2V0UmVzb2x1dGlvbjogc2V0UmVzb2x1dGlvbixcbiAgICAgICAgZ2V0UmVzb2x1dGlvbjogZ2V0UmVzb2x1dGlvblxuICAgIH07XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgREVGQVVMVF9YX0ZJRUxEID0gJ3BpeGVsLngnO1xuICAgIHZhciBERUZBVUxUX1lfRklFTEQgPSAncGl4ZWwueSc7XG5cbiAgICB2YXIgY2hlY2tGaWVsZCA9IGZ1bmN0aW9uKG1ldGEsIGZpZWxkKSB7XG4gICAgICAgIGlmIChtZXRhKSB7XG4gICAgICAgICAgICBpZiAobWV0YS5leHRyZW1hKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93ICdGaWVsZCBgJyArIGZpZWxkICsgJ2AgaXMgbm90IG9yZGluYWwgaW4gbWV0YSBkYXRhLic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyAnRmllbGQgYCcgKyBmaWVsZCArICdgIGlzIG5vdCByZWNvZ25pemVkIGluIG1ldGEgZGF0YS4nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgdmFyIHNldFhGaWVsZCA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgIGlmIChmaWVsZCAhPT0gdGhpcy5fcGFyYW1zLmJpbm5pbmcueCkge1xuICAgICAgICAgICAgaWYgKGZpZWxkID09PSBERUZBVUxUX1hfRklFTEQpIHtcbiAgICAgICAgICAgICAgICAvLyByZXNldCBpZiBkZWZhdWx0XG4gICAgICAgICAgICAgICAgdGhpcy5fcGFyYW1zLmJpbm5pbmcueCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLl9wYXJhbXMuYmlubmluZy5sZWZ0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHRoaXMuX3BhcmFtcy5iaW5uaW5nLnJpZ2h0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJFeHRyZW1hKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBtZXRhID0gdGhpcy5fbWV0YVtmaWVsZF07XG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrRmllbGQobWV0YSwgZmllbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BhcmFtcy5iaW5uaW5nLnggPSBmaWVsZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGFyYW1zLmJpbm5pbmcubGVmdCA9IG1ldGEuZXh0cmVtYS5taW47XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BhcmFtcy5iaW5uaW5nLnJpZ2h0ID0gbWV0YS5leHRyZW1hLm1heDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhckV4dHJlbWEoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHZhciBnZXRYRmllbGQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmFtcy5iaW5uaW5nLng7XG4gICAgfTtcblxuICAgIHZhciBzZXRZRmllbGQgPSBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICBpZiAoZmllbGQgIT09IHRoaXMuX3BhcmFtcy5iaW5uaW5nLnkpIHtcbiAgICAgICAgICAgIGlmIChmaWVsZCA9PT0gREVGQVVMVF9ZX0ZJRUxEKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVzZXQgaWYgZGVmYXVsdFxuICAgICAgICAgICAgICAgIHRoaXMuX3BhcmFtcy5iaW5uaW5nLnkgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGFyYW1zLmJpbm5pbmcuYm90dG9tID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHRoaXMuX3BhcmFtcy5iaW5uaW5nLnRvcCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyRXh0cmVtYSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbWV0YSA9IHRoaXMuX21ldGFbZmllbGRdO1xuICAgICAgICAgICAgICAgIGlmIChjaGVja0ZpZWxkKG1ldGEsIGZpZWxkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wYXJhbXMuYmlubmluZy55ID0gZmllbGQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BhcmFtcy5iaW5uaW5nLmJvdHRvbSA9IG1ldGEuZXh0cmVtYS5taW47XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BhcmFtcy5iaW5uaW5nLnRvcCA9IG1ldGEuZXh0cmVtYS5tYXg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJFeHRyZW1hKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0WUZpZWxkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJhbXMuYmlubmluZy55O1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgc2V0WEZpZWxkOiBzZXRYRmllbGQsXG4gICAgICAgIGdldFhGaWVsZDogZ2V0WEZpZWxkLFxuICAgICAgICBzZXRZRmllbGQ6IHNldFlGaWVsZCxcbiAgICAgICAgZ2V0WUZpZWxkOiBnZXRZRmllbGQsXG4gICAgICAgIERFRkFVTFRfWF9GSUVMRDogREVGQVVMVF9YX0ZJRUxELFxuICAgICAgICBERUZBVUxUX1lfRklFTEQ6IERFRkFVTFRfWV9GSUVMRFxuICAgIH07XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgY2hlY2s7XG5cbiAgICBmdW5jdGlvbiBjaGVja1F1ZXJ5KG1ldGEsIHF1ZXJ5KSB7XG4gICAgICAgIHZhciBrZXlzID0gXy5rZXlzKHF1ZXJ5KTtcbiAgICAgICAgaWYgKGtleXMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICB0aHJvdyAnQm9vbCBzdWItcXVlcnkgbXVzdCBvbmx5IGhhdmUgYSBzaW5nbGUga2V5LCBxdWVyeSBoYXMgbXVsdGlwbGUga2V5czogYCcgKyBKU09OLnN0cmluZ2lmeShrZXlzKSArICdgLic7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHR5cGUgPSBrZXlzWzBdO1xuICAgICAgICB2YXIgY2hlY2tGdW5jID0gY2hlY2tbdHlwZV07XG4gICAgICAgIGlmICghY2hlY2tGdW5jKSB7XG4gICAgICAgICAgICB0aHJvdyAnUXVlcnkgdHlwZSBgJyArIHR5cGUgKyAnYCBpcyBub3QgcmVjb2duaXplZC4nO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNoZWNrIHF1ZXJ5IGJ5IHR5cGVcbiAgICAgICAgY2hlY2tbdHlwZV0obWV0YSwgcXVlcnlbdHlwZV0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrUXVlcmllcyhtZXRhLCBxdWVyaWVzKSB7XG4gICAgICAgIGlmIChfLmlzQXJyYXkocXVlcmllcykpIHtcbiAgICAgICAgICAgIHF1ZXJpZXMuZm9yRWFjaCggZnVuY3Rpb24ocXVlcnkpIHtcbiAgICAgICAgICAgICAgICBjaGVja1F1ZXJ5KG1ldGEscXVlcnkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcXVlcmllcztcbiAgICAgICAgfVxuICAgICAgICBjaGVja1F1ZXJ5KG1ldGEsIHF1ZXJpZXMpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcXVlcmllc1xuICAgICAgICBdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrQm9vbChtZXRhLCBxdWVyeSkge1xuICAgICAgICBpZiAoIXF1ZXJ5Lm11c3QgJiYgIXF1ZXJ5Lm11c3Rfbm90ICYmICFxdWVyeS5zaG91bGQpIHtcbiAgICAgICAgICAgIHRocm93ICdCb29sIG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgYG11c3RgLCBgbXVzdF9ub3RgLCBvciBgc2hvdWxkYCBxdWVyeSBhcmd1bWVudC4nO1xuICAgICAgICB9XG4gICAgICAgIGlmIChxdWVyeS5tdXN0KSB7XG4gICAgICAgICAgICBjaGVja1F1ZXJpZXMobWV0YSwgcXVlcnkubXVzdCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHF1ZXJ5Lm11c3Rfbm90KSB7XG4gICAgICAgICAgICBjaGVja1F1ZXJpZXMobWV0YSwgcXVlcnkubXVzdF9ub3QpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChxdWVyeS5zaG91bGQpIHtcbiAgICAgICAgICAgIGNoZWNrUXVlcmllcyhtZXRhLCBxdWVyeS5zaG91bGQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2hlY2sgPSB7XG4gICAgICAgIGJvb2w6IGNoZWNrQm9vbCxcbiAgICAgICAgcHJlZml4OiByZXF1aXJlKCcuL1ByZWZpeCcpLFxuICAgICAgICBxdWVyeV9zdHJpbmc6IHJlcXVpcmUoJy4vUXVlcnlTdHJpbmcnKSxcbiAgICAgICAgcmFuZ2U6IHJlcXVpcmUoJy4vUmFuZ2UnKSxcbiAgICAgICAgdGVybXM6IHJlcXVpcmUoJy4vVGVybXMnKSxcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBjaGVja0Jvb2w7XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgY2hlY2tGaWVsZCA9IGZ1bmN0aW9uKG1ldGEsIGZpZWxkKSB7XG4gICAgICAgIGlmIChtZXRhKSB7XG4gICAgICAgICAgICBpZiAobWV0YS50eXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRocm93ICdQcmVmaXggYGZpZWxkYCAnICsgZmllbGQgKyAnIGlzIG5vdCBvZiB0eXBlIGBzdHJpbmdgIGluIG1ldGEgZGF0YS4nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgJ1ByZWZpeCBgZmllbGRgICcgKyBmaWVsZCArICcgaXMgbm90IHJlY29nbml6ZWQgaW4gbWV0YSBkYXRhLic7XG4gICAgICAgIH0gICAgICAgIFxuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1ldGEsIHF1ZXJ5KSB7XG4gICAgICAgIGlmICghcXVlcnkuZmllbGQpIHtcbiAgICAgICAgICAgIHRocm93ICdQcmVmaXggYGZpZWxkYCBpcyBtaXNzaW5nIGZyb20gYXJndW1lbnQnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChxdWVyeS5wcmVmaXhlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyAnUHJlZml4IGBwcmVmaXhlc2AgYXJlIG1pc3NpbmcgZnJvbSBhcmd1bWVudCc7XG4gICAgICAgIH1cbiAgICAgICAgY2hlY2tGaWVsZChtZXRhW3F1ZXJ5LmZpZWxkXSwgcXVlcnkuZmllbGQpO1xuICAgIH07XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgY2hlY2tGaWVsZCA9IGZ1bmN0aW9uKG1ldGEsIGZpZWxkKSB7XG4gICAgICAgIGlmIChtZXRhKSB7XG4gICAgICAgICAgICBpZiAobWV0YS50eXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRocm93ICdRdWVyeVN0cmluZyBgZmllbGRgICcgKyBmaWVsZCArICcgaXMgbm90IGBzdHJpbmdgIGluIG1ldGEgZGF0YS4nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgJ1F1ZXJ5U3RyaW5nIGBmaWVsZGAgJyArIGZpZWxkICsgJyBpcyBub3QgcmVjb2duaXplZCBpbiBtZXRhIGRhdGEuJztcbiAgICAgICAgfSAgICAgICAgXG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obWV0YSwgcXVlcnkpIHtcbiAgICAgICAgaWYgKCFxdWVyeS5maWVsZCkge1xuICAgICAgICAgICAgdGhyb3cgJ1F1ZXJ5U3RyaW5nIGBmaWVsZGAgaXMgbWlzc2luZyBmcm9tIGFyZ3VtZW50Lic7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFxdWVyeS5zdHJpbmcpIHtcbiAgICAgICAgICAgIHRocm93ICdRdWVyeVN0cmluZyBgc3RyaW5nYCBpcyBtaXNzaW5nIGZyb20gYXJndW1lbnQuJztcbiAgICAgICAgfVxuICAgICAgICBjaGVja0ZpZWxkKG1ldGFbcXVlcnkuZmllbGRdLCBxdWVyeS5maWVsZCk7XG4gICAgfTtcblxufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBjaGVja0ZpZWxkID0gZnVuY3Rpb24obWV0YSwgZmllbGQpIHtcbiAgICAgICAgaWYgKG1ldGEpIHtcbiAgICAgICAgICAgIGlmICghbWV0YS5leHRyZW1hKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgJ1JhbmdlIGBmaWVsZGAgJyArIGZpZWxkICsgJyBpcyBub3Qgb3JkaW5hbCBpbiBtZXRhIGRhdGEuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93ICdSYW5nZSBgZmllbGRgICcgKyBmaWVsZCArICcgaXMgbm90IHJlY29nbml6ZWQgaW4gbWV0YSBkYXRhLic7XG4gICAgICAgIH0gICAgICAgIFxuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1ldGEsIHF1ZXJ5KSB7XG4gICAgICAgIGlmICghcXVlcnkuZmllbGQpIHtcbiAgICAgICAgICAgIHRocm93ICdSYW5nZSBgZmllbGRgIGlzIG1pc3NpbmcgZnJvbSBhcmd1bWVudC4nO1xuICAgICAgICB9XG4gICAgICAgIGlmIChxdWVyeS5mcm9tID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93ICdSYW5nZSBgZnJvbWAgaXMgbWlzc2luZyBmcm9tIGFyZ3VtZW50Lic7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHF1ZXJ5LnRvID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93ICdSYW5nZSBgdG9gIGlzIG1pc3NpbmcgZnJvbSBhcmd1bWVudC4nO1xuICAgICAgICB9XG4gICAgICAgIGNoZWNrRmllbGQobWV0YVtxdWVyeS5maWVsZF0sIHF1ZXJ5LmZpZWxkKTtcbiAgICB9O1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGNoZWNrRmllbGQgPSBmdW5jdGlvbihtZXRhLCBmaWVsZCkge1xuICAgICAgICBpZiAobWV0YSkge1xuICAgICAgICAgICAgaWYgKG1ldGEudHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyAnVGVybXMgYGZpZWxkYCAnICsgZmllbGQgKyAnIGlzIG5vdCBvZiB0eXBlIGBzdHJpbmdgIGluIG1ldGEgZGF0YS4nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgJ1Rlcm1zIGBmaWVsZGAgJyArIGZpZWxkICsgJyBpcyBub3QgcmVjb2duaXplZCBpbiBtZXRhIGRhdGEuJztcbiAgICAgICAgfSAgICBcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtZXRhLCBxdWVyeSkge1xuICAgICAgICBpZiAoIXF1ZXJ5LmZpZWxkKSB7XG4gICAgICAgICAgICB0aHJvdyAnVGVybXMgYGZpZWxkYCBpcyBtaXNzaW5nIGZyb20gYXJndW1lbnQuJztcbiAgICAgICAgfVxuICAgICAgICBpZiAocXVlcnkudGVybXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgJ1Rlcm1zIGB0ZXJtc2AgYXJlIG1pc3NpbmcgZnJvbSBhcmd1bWVudC4nO1xuICAgICAgICB9XG4gICAgICAgIGNoZWNrRmllbGQobWV0YVtxdWVyeS5maWVsZF0sIHF1ZXJ5LmZpZWxkKTtcbiAgICB9O1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIExpdmUgPSByZXF1aXJlKCcuLi9jb3JlL0xpdmUnKTtcbiAgICB2YXIgQmlubmluZyA9IHJlcXVpcmUoJy4uL3BhcmFtL0Jpbm5pbmcnKTtcbiAgICB2YXIgTWV0cmljID0gcmVxdWlyZSgnLi4vYWdnL01ldHJpYycpO1xuICAgIHZhciBDb2xvclJhbXAgPSByZXF1aXJlKCcuLi9taXhpbi9Db2xvclJhbXAnKTtcbiAgICB2YXIgVmFsdWVUcmFuc2Zvcm0gPSByZXF1aXJlKCcuLi9taXhpbi9WYWx1ZVRyYW5zZm9ybScpO1xuXG4gICAgdmFyIEhlYXRtYXAgPSBMaXZlLmV4dGVuZCh7XG5cbiAgICAgICAgaW5jbHVkZXM6IFtcbiAgICAgICAgICAgIC8vIHBhcmFtc1xuICAgICAgICAgICAgQmlubmluZyxcbiAgICAgICAgICAgIC8vIGFnZ3NcbiAgICAgICAgICAgIE1ldHJpYyxcbiAgICAgICAgICAgIC8vIG1peGluc1xuICAgICAgICAgICAgQ29sb3JSYW1wLFxuICAgICAgICAgICAgVmFsdWVUcmFuc2Zvcm1cbiAgICAgICAgXSxcblxuICAgICAgICB0eXBlOiAnaGVhdG1hcCcsXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBDb2xvclJhbXAuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgVmFsdWVUcmFuc2Zvcm0uaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgLy8gYmFzZVxuICAgICAgICAgICAgTGl2ZS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGV4dHJhY3RFeHRyZW1hOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgYmlucyA9IG5ldyBGbG9hdDY0QXJyYXkoZGF0YSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1pbjogXy5taW4oYmlucyksXG4gICAgICAgICAgICAgICAgbWF4OiBfLm1heChiaW5zKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IEhlYXRtYXA7XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgTGl2ZSA9IHJlcXVpcmUoJy4uL2NvcmUvTGl2ZScpO1xuICAgIHZhciBCaW5uaW5nID0gcmVxdWlyZSgnLi4vcGFyYW0vQmlubmluZycpO1xuICAgIHZhciBUb3BIaXRzID0gcmVxdWlyZSgnLi4vYWdnL1RvcEhpdHMnKTtcblxuICAgIHZhciBQcmV2aWV3ID0gTGl2ZS5leHRlbmQoe1xuXG4gICAgICAgIGluY2x1ZGVzOiBbXG4gICAgICAgICAgICAvLyBwYXJhbXNcbiAgICAgICAgICAgIEJpbm5pbmcsXG4gICAgICAgICAgICBUb3BIaXRzIFxuICAgICAgICBdLFxuXG4gICAgICAgIHR5cGU6ICdwcmV2aWV3JyxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIExpdmUucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBleHRyZW1lIG5vdCByZWxldmFudCBmb3IgcHJldmlld1xuICAgICAgICBleHRyYWN0RXh0cmVtYTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgICAgICBtYXg6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFByZXZpZXc7XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgTGl2ZSA9IHJlcXVpcmUoJy4uL2NvcmUvTGl2ZScpO1xuICAgIHZhciBUaWxpbmcgPSByZXF1aXJlKCcuLi9wYXJhbS9UaWxpbmcnKTtcbiAgICB2YXIgVG9wVGVybXMgPSByZXF1aXJlKCcuLi9hZ2cvVG9wVGVybXMnKTtcbiAgICB2YXIgSGlzdG9ncmFtID0gcmVxdWlyZSgnLi4vYWdnL0hpc3RvZ3JhbScpO1xuICAgIHZhciBWYWx1ZVRyYW5zZm9ybSA9IHJlcXVpcmUoJy4uL21peGluL1ZhbHVlVHJhbnNmb3JtJyk7XG5cbiAgICB2YXIgVG9wQ291bnQgPSBMaXZlLmV4dGVuZCh7XG5cbiAgICAgICAgaW5jbHVkZXM6IFtcbiAgICAgICAgICAgIC8vIHBhcmFtc1xuICAgICAgICAgICAgVGlsaW5nLFxuICAgICAgICAgICAgVG9wVGVybXMsXG4gICAgICAgICAgICAvLyBhZ2dzXG4gICAgICAgICAgICBIaXN0b2dyYW0sXG4gICAgICAgICAgICAvLyBtaXhpbnNcbiAgICAgICAgICAgIFZhbHVlVHJhbnNmb3JtXG4gICAgICAgIF0sXG5cbiAgICAgICAgdHlwZTogJ3RvcF9jb3VudCcsXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBWYWx1ZVRyYW5zZm9ybS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAvLyBiYXNlXG4gICAgICAgICAgICBMaXZlLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sXG5cbiAgICB9KTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gVG9wQ291bnQ7XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgTGl2ZSA9IHJlcXVpcmUoJy4uL2NvcmUvTGl2ZScpO1xuICAgIHZhciBUaWxpbmcgPSByZXF1aXJlKCcuLi9wYXJhbS9UaWxpbmcnKTtcbiAgICB2YXIgVG9wVGVybXMgPSByZXF1aXJlKCcuLi9hZ2cvVG9wVGVybXMnKTtcbiAgICB2YXIgRGF0ZUhpc3RvZ3JhbSA9IHJlcXVpcmUoJy4uL2FnZy9EYXRlSGlzdG9ncmFtJyk7XG4gICAgdmFyIEhpc3RvZ3JhbSA9IHJlcXVpcmUoJy4uL2FnZy9IaXN0b2dyYW0nKTtcbiAgICB2YXIgVmFsdWVUcmFuc2Zvcm0gPSByZXF1aXJlKCcuLi9taXhpbi9WYWx1ZVRyYW5zZm9ybScpO1xuXG4gICAgdmFyIFRvcEZyZXF1ZW5jeSA9IExpdmUuZXh0ZW5kKHtcblxuICAgICAgICBpbmNsdWRlczogW1xuICAgICAgICAgICAgLy8gcGFyYW1zXG4gICAgICAgICAgICBUaWxpbmcsXG4gICAgICAgICAgICAvLyBhZ2dzXG4gICAgICAgICAgICBUb3BUZXJtcyxcbiAgICAgICAgICAgIERhdGVIaXN0b2dyYW0sXG4gICAgICAgICAgICBIaXN0b2dyYW0sXG4gICAgICAgICAgICAvLyBtaXhpbnNcbiAgICAgICAgICAgIFZhbHVlVHJhbnNmb3JtXG4gICAgICAgIF0sXG5cbiAgICAgICAgdHlwZTogJ3RvcF9mcmVxdWVuY3knLFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVmFsdWVUcmFuc2Zvcm0uaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgLy8gYmFzZVxuICAgICAgICAgICAgTGl2ZS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LFxuXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFRvcEZyZXF1ZW5jeTtcblxufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBMaXZlID0gcmVxdWlyZSgnLi4vY29yZS9MaXZlJyk7XG4gICAgdmFyIEJpbm5pbmcgPSByZXF1aXJlKCcuLi9wYXJhbS9CaW5uaW5nJyk7XG4gICAgdmFyIFRlcm1zID0gcmVxdWlyZSgnLi4vYWdnL1Rlcm1zJyk7XG4gICAgdmFyIENvbG9yUmFtcCA9IHJlcXVpcmUoJy4uL21peGluL0NvbG9yUmFtcCcpO1xuICAgIHZhciBWYWx1ZVRyYW5zZm9ybSA9IHJlcXVpcmUoJy4uL21peGluL1ZhbHVlVHJhbnNmb3JtJyk7XG5cbiAgICB2YXIgVG9wVHJhaWxzID0gTGl2ZS5leHRlbmQoe1xuXG4gICAgICAgIGluY2x1ZGVzOiBbXG4gICAgICAgICAgICAvLyBwYXJhbXNcbiAgICAgICAgICAgIEJpbm5pbmcsXG4gICAgICAgICAgICAvLyBhZ2dzXG4gICAgICAgICAgICBUZXJtcyxcbiAgICAgICAgICAgIC8vIG1peGluc1xuICAgICAgICAgICAgQ29sb3JSYW1wLFxuICAgICAgICAgICAgVmFsdWVUcmFuc2Zvcm1cbiAgICAgICAgXSxcblxuICAgICAgICB0eXBlOiAndG9wX3RyYWlscycsXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBDb2xvclJhbXAuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgVmFsdWVUcmFuc2Zvcm0uaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgLy8gYmFzZVxuICAgICAgICAgICAgTGl2ZS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGV4dHJhY3RFeHRyZW1hOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBbIDAsIDAgXTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFRvcFRyYWlscztcblxufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBMaXZlID0gcmVxdWlyZSgnLi4vY29yZS9MaXZlJyk7XG4gICAgdmFyIFRpbGluZyA9IHJlcXVpcmUoJy4uL3BhcmFtL1RpbGluZycpO1xuICAgIHZhciBUZXJtc0ZpbHRlciA9IHJlcXVpcmUoJy4uL2FnZy9UZXJtc0ZpbHRlcicpO1xuICAgIHZhciBIaXN0b2dyYW0gPSByZXF1aXJlKCcuLi9hZ2cvSGlzdG9ncmFtJyk7XG4gICAgdmFyIFZhbHVlVHJhbnNmb3JtID0gcmVxdWlyZSgnLi4vbWl4aW4vVmFsdWVUcmFuc2Zvcm0nKTtcblxuICAgIHZhciBUb3BpY0NvdW50ID0gTGl2ZS5leHRlbmQoe1xuXG4gICAgICAgIGluY2x1ZGVzOiBbXG4gICAgICAgICAgICAvLyBwYXJhbXNcbiAgICAgICAgICAgIFRpbGluZyxcbiAgICAgICAgICAgIFRlcm1zRmlsdGVyLFxuICAgICAgICAgICAgSGlzdG9ncmFtLFxuICAgICAgICAgICAgLy8gbWl4aW5zXG4gICAgICAgICAgICBWYWx1ZVRyYW5zZm9ybVxuICAgICAgICBdLFxuXG4gICAgICAgIHR5cGU6ICd0b3BpY19jb3VudCcsXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBWYWx1ZVRyYW5zZm9ybS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAvLyBiYXNlXG4gICAgICAgICAgICBMaXZlLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sXG5cbiAgICB9KTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gVG9waWNDb3VudDtcblxufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBMaXZlID0gcmVxdWlyZSgnLi4vY29yZS9MaXZlJyk7XG4gICAgdmFyIFRpbGluZyA9IHJlcXVpcmUoJy4uL3BhcmFtL1RpbGluZycpO1xuICAgIHZhciBUZXJtc0ZpbHRlciA9IHJlcXVpcmUoJy4uL2FnZy9UZXJtc0ZpbHRlcicpO1xuICAgIHZhciBEYXRlSGlzdG9ncmFtID0gcmVxdWlyZSgnLi4vYWdnL0RhdGVIaXN0b2dyYW0nKTtcbiAgICB2YXIgSGlzdG9ncmFtID0gcmVxdWlyZSgnLi4vYWdnL0hpc3RvZ3JhbScpO1xuICAgIHZhciBWYWx1ZVRyYW5zZm9ybSA9IHJlcXVpcmUoJy4uL21peGluL1ZhbHVlVHJhbnNmb3JtJyk7XG5cbiAgICB2YXIgVG9waWNGcmVxdWVuY3kgPSBMaXZlLmV4dGVuZCh7XG5cbiAgICAgICAgaW5jbHVkZXM6IFtcbiAgICAgICAgICAgIC8vIHBhcmFtc1xuICAgICAgICAgICAgVGlsaW5nLFxuICAgICAgICAgICAgVGVybXNGaWx0ZXIsXG4gICAgICAgICAgICBEYXRlSGlzdG9ncmFtLFxuICAgICAgICAgICAgSGlzdG9ncmFtLFxuICAgICAgICAgICAgLy8gbWl4aW5zXG4gICAgICAgICAgICBWYWx1ZVRyYW5zZm9ybVxuICAgICAgICBdLFxuXG4gICAgICAgIHR5cGU6ICd0b3BpY19mcmVxdWVuY3knLFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVmFsdWVUcmFuc2Zvcm0uaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgLy8gYmFzZVxuICAgICAgICAgICAgTGl2ZS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LFxuXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFRvcGljRnJlcXVlbmN5O1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIERPTSA9IHJlcXVpcmUoJy4vRE9NJyk7XG5cbiAgICB2YXIgQ2FudmFzID0gRE9NLmV4dGVuZCh7XG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgaGFuZGxlcnM6IHt9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25BZGQ6IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgRE9NLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG4gICAgICAgICAgICBtYXAub24oJ2NsaWNrJywgdGhpcy5vbkNsaWNrLCB0aGlzKTtcbiAgICAgICAgICAgICQodGhpcy5fY29udGFpbmVyKS5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHNlbGYub25Nb3VzZU1vdmUoZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICQodGhpcy5fY29udGFpbmVyKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHNlbGYub25Nb3VzZU92ZXIoZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICQodGhpcy5fY29udGFpbmVyKS5vbignbW91c2VvdXQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5vbk1vdXNlT3V0KGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZW1vdmU6IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICAgICAgbWFwLm9mZignY2xpY2snLCB0aGlzLm9uQ2xpY2ssIHRoaXMpO1xuICAgICAgICAgICAgJCh0aGlzLl9jb250YWluZXIpLm9mZignbW91c2Vtb3ZlJyk7XG4gICAgICAgICAgICAkKHRoaXMuX2NvbnRhaW5lcikub2ZmKCdtb3VzZW92ZXInKTtcbiAgICAgICAgICAgICQodGhpcy5fY29udGFpbmVyKS5vZmYoJ21vdXNlb3V0Jyk7XG4gICAgICAgICAgICBET00ucHJvdG90eXBlLm9uUmVtb3ZlLmNhbGwodGhpcywgbWFwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVUaWxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0aWxlID0gTC5Eb21VdGlsLmNyZWF0ZSgnY2FudmFzJywgJ2xlYWZsZXQtdGlsZScpO1xuICAgICAgICAgICAgdGlsZS53aWR0aCA9IHRoaXMub3B0aW9ucy50aWxlU2l6ZTtcbiAgICAgICAgICAgIHRpbGUuaGVpZ2h0ID0gdGhpcy5vcHRpb25zLnRpbGVTaXplO1xuICAgICAgICAgICAgcmV0dXJuIHRpbGU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xlYXJUaWxlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdGlsZVNpemUgPSB0aGlzLm9wdGlvbnMudGlsZVNpemU7XG4gICAgICAgICAgICBfLmZvckluKHRoaXMuX3RpbGVzLCBmdW5jdGlvbih0aWxlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN0eCA9IHRpbGUuZWwuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRpbGVTaXplLCB0aWxlU2l6ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbk1vdXNlTW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBvdmVycmlkZVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uTW91c2VPdmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIG92ZXJyaWRlXG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Nb3VzZU91dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBvdmVycmlkZVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gb3ZlcnJpZGVcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IENhbnZhcztcblxufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBCYXNlID0gcmVxdWlyZSgnLi4vLi4vbGF5ZXIvY29yZS9CYXNlJyk7XG5cbiAgICBmdW5jdGlvbiBtb2QobiwgbSkge1xuICAgICAgICByZXR1cm4gKChuICUgbSkgKyBtKSAlIG07XG4gICAgfVxuXG4gICAgdmFyIERPTSA9IEJhc2UuZXh0ZW5kKHtcblxuICAgICAgICBvbkFkZDogZnVuY3Rpb24obWFwKSB7XG4gICAgICAgICAgICBMLkdyaWRMYXllci5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuICAgICAgICAgICAgbWFwLm9uKCd6b29tc3RhcnQnLCB0aGlzLmNsZWFyRXh0cmVtYSwgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLm9uKCd0aWxlbG9hZCcsIHRoaXMub25UaWxlTG9hZCwgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLm9uKCd0aWxldW5sb2FkJywgdGhpcy5vblRpbGVVbmxvYWQsIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uUmVtb3ZlOiBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgICAgIG1hcC5vZmYoJ3pvb21zdGFydCcsIHRoaXMuY2xlYXJFeHRyZW1hLCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMub2ZmKCd0aWxlbG9hZCcsIHRoaXMub25UaWxlTG9hZCwgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLm9mZigndGlsZXVubG9hZCcsIHRoaXMub25UaWxlVW5sb2FkLCB0aGlzKTtcbiAgICAgICAgICAgIEwuR3JpZExheWVyLnByb3RvdHlwZS5vblJlbW92ZS5jYWxsKHRoaXMsIG1hcCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldExheWVyUG9pbnRGcm9tRXZlbnQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciBsb25sYXQgPSB0aGlzLl9tYXAubW91c2VFdmVudFRvTGF0TG5nKGUpO1xuICAgICAgICAgICAgdmFyIHBpeGVsID0gdGhpcy5fbWFwLnByb2plY3QobG9ubGF0KTtcbiAgICAgICAgICAgIHZhciB6b29tID0gdGhpcy5fbWFwLmdldFpvb20oKTtcbiAgICAgICAgICAgIHZhciBwb3cgPSBNYXRoLnBvdygyLCB6b29tKTtcbiAgICAgICAgICAgIHZhciB0aWxlU2l6ZSA9IHRoaXMub3B0aW9ucy50aWxlU2l6ZTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgeDogbW9kKHBpeGVsLngsIHBvdyAqIHRpbGVTaXplKSxcbiAgICAgICAgICAgICAgICB5OiBtb2QocGl4ZWwueSwgcG93ICogdGlsZVNpemUpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRUaWxlQ29vcmRGcm9tTGF5ZXJQb2ludDogZnVuY3Rpb24obGF5ZXJQb2ludCkge1xuICAgICAgICAgICAgdmFyIHRpbGVTaXplID0gdGhpcy5vcHRpb25zLnRpbGVTaXplO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB4OiBNYXRoLmZsb29yKGxheWVyUG9pbnQueCAvIHRpbGVTaXplKSxcbiAgICAgICAgICAgICAgICB5OiBNYXRoLmZsb29yKGxheWVyUG9pbnQueSAvIHRpbGVTaXplKSxcbiAgICAgICAgICAgICAgICB6OiB0aGlzLl9tYXAuZ2V0Wm9vbSgpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRCaW5Db29yZEZyb21MYXllclBvaW50OiBmdW5jdGlvbihsYXllclBvaW50KSB7XG4gICAgICAgICAgICB2YXIgdGlsZVNpemUgPSB0aGlzLm9wdGlvbnMudGlsZVNpemU7XG4gICAgICAgICAgICB2YXIgcmVzb2x1dGlvbiA9IHRoaXMuZ2V0UmVzb2x1dGlvbigpIHx8IHRpbGVTaXplO1xuICAgICAgICAgICAgdmFyIHR4ID0gbW9kKGxheWVyUG9pbnQueCwgdGlsZVNpemUpO1xuICAgICAgICAgICAgdmFyIHR5ID0gbW9kKGxheWVyUG9pbnQueSwgdGlsZVNpemUpO1xuICAgICAgICAgICAgdmFyIHBpeGVsU2l6ZSA9IHRpbGVTaXplIC8gcmVzb2x1dGlvbjtcbiAgICAgICAgICAgIHZhciBieCA9IE1hdGguZmxvb3IodHggLyBwaXhlbFNpemUpO1xuICAgICAgICAgICAgdmFyIGJ5ID0gTWF0aC5mbG9vcih0eSAvIHBpeGVsU2l6ZSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHg6IGJ4LFxuICAgICAgICAgICAgICAgIHk6IGJ5LFxuICAgICAgICAgICAgICAgIGluZGV4OiBieCArIChieSAqIHJlc29sdXRpb24pLFxuICAgICAgICAgICAgICAgIHNpemU6IHBpeGVsU2l6ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNhY2hlSGl0OiBmdW5jdGlvbih0aWxlLCBjYWNoZWQsIGNvb3Jkcykge1xuICAgICAgICAgICAgLy8gZGF0YSBleGlzdHMsIHJlbmRlciBvbmx5IHRoaXMgdGlsZVxuICAgICAgICAgICAgaWYgKGNhY2hlZC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJUaWxlKHRpbGUsIGNhY2hlZC5kYXRhLCBjb29yZHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2FjaGVMb2FkOiBmdW5jdGlvbih0aWxlLCBjYWNoZWQsIGNvb3Jkcykge1xuICAgICAgICAgICAgLy8gc2FtZSBleHRyZW1hLCB3ZSBhcmUgZ29vZCB0byByZW5kZXIgdGhlIHRpbGVzLiBJblxuICAgICAgICAgICAgLy8gdGhlIGNhc2Ugb2YgYSBtYXAgd2l0aCB3cmFwYXJvdW5kLCB3ZSBtYXkgaGF2ZVxuICAgICAgICAgICAgLy8gbXVsdGlwbGUgdGlsZXMgZGVwZW5kZW50IG9uIHRoZSByZXNwb25zZSwgc28gaXRlcmF0ZVxuICAgICAgICAgICAgLy8gb3ZlciBlYWNoIHRpbGUgYW5kIGRyYXcgaXQuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoY2FjaGVkLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBfLmZvckluKGNhY2hlZC50aWxlcywgZnVuY3Rpb24odGlsZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnJlbmRlclRpbGUodGlsZSwgY2FjaGVkLmRhdGEsIGNvb3Jkcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DYWNoZUxvYWRFeHRyZW1hVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIHJlZHJhdyBhbGwgdGlsZXNcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIF8uZm9ySW4odGhpcy5fY2FjaGUsIGZ1bmN0aW9uKGNhY2hlZCkge1xuICAgICAgICAgICAgICAgIF8uZm9ySW4oY2FjaGVkLnRpbGVzLCBmdW5jdGlvbih0aWxlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhY2hlZC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJlbmRlclRpbGUodGlsZSwgY2FjaGVkLmRhdGEsIHNlbGYuY29vcmRGcm9tQ2FjaGVLZXkoa2V5KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZVRpbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gb3ZlcnJpZGVcbiAgICAgICAgfSxcblxuICAgICAgICByZXF1ZXN0VGlsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBvdmVycmlkZVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlbmRlclRpbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gb3ZlcnJpZGVcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IERPTTtcblxufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBET00gPSByZXF1aXJlKCcuL0RPTScpO1xuXG4gICAgdmFyIEhUTUwgPSBET00uZXh0ZW5kKHtcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBoYW5kbGVyczoge31cbiAgICAgICAgfSxcblxuICAgICAgICBvbkFkZDogZnVuY3Rpb24obWFwKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBET00ucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcbiAgICAgICAgICAgIG1hcC5vbignY2xpY2snLCB0aGlzLm9uQ2xpY2ssIHRoaXMpO1xuICAgICAgICAgICAgJCh0aGlzLl9jb250YWluZXIpLm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5vbk1vdXNlTW92ZShlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJCh0aGlzLl9jb250YWluZXIpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5vbk1vdXNlT3ZlcihlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJCh0aGlzLl9jb250YWluZXIpLm9uKCdtb3VzZW91dCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm9uTW91c2VPdXQoZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblJlbW92ZTogZnVuY3Rpb24obWFwKSB7XG4gICAgICAgICAgICBtYXAub2ZmKCdjbGljaycsIHRoaXMub25DbGljaywgdGhpcyk7XG4gICAgICAgICAgICAkKHRoaXMuX2NvbnRhaW5lcikub2ZmKCdtb3VzZW1vdmUnKTtcbiAgICAgICAgICAgICQodGhpcy5fY29udGFpbmVyKS5vZmYoJ21vdXNlb3ZlcicpO1xuICAgICAgICAgICAgJCh0aGlzLl9jb250YWluZXIpLm9mZignbW91c2VvdXQnKTtcbiAgICAgICAgICAgIERPTS5wcm90b3R5cGUub25SZW1vdmUuY2FsbCh0aGlzLCBtYXApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZVRpbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC10aWxlIGxlYWZsZXQtaHRtbC10aWxlJyk7XG4gICAgICAgICAgICByZXR1cm4gdGlsZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbk1vdXNlTW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBvdmVycmlkZVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uTW91c2VPdmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIG92ZXJyaWRlXG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Nb3VzZU91dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBvdmVycmlkZVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gb3ZlcnJpZGVcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IEhUTUw7XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQmFzZSA9IHJlcXVpcmUoJy4uLy4uL2xheWVyL2NvcmUvQmFzZScpO1xuXG4gICAgdmFyIE5PX09QID0gZnVuY3Rpb24oKSB7fTtcblxuICAgIHZhciBPdmVybGF5ID0gQmFzZS5leHRlbmQoe1xuXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHpJbmRleDogMVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQWRkOiBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgICAgIG1hcC5vbignem9vbWVuZCcsIHRoaXMub25ab29tRW5kLCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMub24oJ3RpbGVsb2FkJywgdGhpcy5vblRpbGVMb2FkLCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMub24oJ3RpbGV1bmxvYWQnLCB0aGlzLm9uVGlsZVVubG9hZCwgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLl90aWxlcyA9IHt9O1xuICAgICAgICAgICAgdGhpcy5faW5pdENvbnRhaW5lcigpO1xuICAgICAgICAgICAgdGhpcy5fcmVzZXRWaWV3KCk7XG5cdFx0ICAgIHRoaXMuX3VwZGF0ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uUmVtb3ZlOiBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgICAgIG1hcC5vZmYoJ3pvb21lbmQnLCB0aGlzLm9uWm9vbUVuZCwgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLm9mZigndGlsZWxvYWQnLCB0aGlzLm9uVGlsZUxvYWQsIHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5vZmYoJ3RpbGV1bmxvYWQnLCB0aGlzLm9uVGlsZVVubG9hZCwgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVBbGxUaWxlcygpO1xuXHRcdCAgICBMLkRvbVV0aWwucmVtb3ZlKHRoaXMuX2NvbnRhaW5lcik7XG4gICAgXHRcdG1hcC5fcmVtb3ZlWm9vbUxpbWl0KHRoaXMpO1xuICAgIFx0XHR0aGlzLl90aWxlWm9vbSA9IG51bGw7XG4gICAgICAgIH0sXG5cbiAgICBcdC8vIE5vLW9wIHRoZXNlIGZ1bmN0aW9uc1xuICAgIFx0Y3JlYXRlVGlsZTogTk9fT1AsXG4gICAgXHRfdXBkYXRlT3BhY2l0eTogTk9fT1AsXG4gICAgXHRfaW5pdFRpbGU6IE5PX09QLFxuICAgIFx0X3RpbGVSZWFkeTogTk9fT1AsXG4gICAgICAgIF91cGRhdGVMZXZlbHM6IE5PX09QLFxuICAgICAgICBfcmVtb3ZlVGlsZXNBdFpvb206IE5PX09QLFxuICAgIFx0X3NldFpvb21UcmFuc2Zvcm1zOiBOT19PUCxcblxuICAgIFx0X2luaXRDb250YWluZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fY29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyLmNsYXNzTmFtZSArPSAnbGVhZmxldC1sYXllciBsZWFmbGV0LXpvb20tYW5pbWF0ZWQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlWkluZGV4KCk7XG4gICAgICAgICAgICB0aGlzLmdldFBhbmUoKS5hcHBlbmRDaGlsZCh0aGlzLl9jb250YWluZXIpO1xuICAgIFx0fSxcblxuICAgIFx0X3BydW5lVGlsZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBcdFx0aWYgKCF0aGlzLl9tYXApIHtcbiAgICBcdFx0XHRyZXR1cm47XG4gICAgXHRcdH1cbiAgICBcdFx0dmFyIHpvb20gPSB0aGlzLl9tYXAuZ2V0Wm9vbSgpO1xuICAgIFx0XHRpZiAoem9vbSA+IHRoaXMub3B0aW9ucy5tYXhab29tIHx8XG4gICAgXHRcdFx0em9vbSA8IHRoaXMub3B0aW9ucy5taW5ab29tKSB7XG4gICAgXHRcdFx0dGhpcy5fcmVtb3ZlQWxsVGlsZXMoKTtcbiAgICBcdFx0XHRyZXR1cm47XG4gICAgXHRcdH1cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIF8uZm9ySW4odGhpcy5fdGlsZXMsIGZ1bmN0aW9uKHRpbGUpIHtcbiAgICAgICAgICAgICAgICB0aWxlLnJldGFpbiA9IHRpbGUuY3VycmVudDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXy5mb3JJbih0aGlzLl90aWxlcywgZnVuY3Rpb24odGlsZSkge1xuICAgIFx0XHRcdGlmICh0aWxlLmN1cnJlbnQgJiYgIXRpbGUuYWN0aXZlKSB7XG4gICAgXHRcdFx0XHR2YXIgY29vcmRzID0gdGlsZS5jb29yZHM7XG4gICAgXHRcdFx0XHRpZiAoIXNlbGYuX3JldGFpblBhcmVudChjb29yZHMueCwgY29vcmRzLnksIGNvb3Jkcy56LCBjb29yZHMueiAtIDUpKSB7XG4gICAgXHRcdFx0XHRcdHNlbGYuX3JldGFpbkNoaWxkcmVuKGNvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnosIGNvb3Jkcy56ICsgMik7XG4gICAgXHRcdFx0XHR9XG4gICAgXHRcdFx0fVxuICAgIFx0XHR9KTtcbiAgICBcdFx0Xy5mb3JJbih0aGlzLl90aWxlcywgZnVuY3Rpb24odGlsZSwga2V5KSB7XG4gICAgXHRcdFx0aWYgKCF0aWxlLnJldGFpbikge1xuICAgIFx0XHRcdFx0c2VsZi5fcmVtb3ZlVGlsZShrZXkpO1xuICAgIFx0XHRcdH1cbiAgICBcdFx0fSk7XG4gICAgXHR9LFxuXG4gICAgXHRfcmVtb3ZlQWxsVGlsZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIF8uZm9ySW4odGhpcy5fdGlsZXMsIGZ1bmN0aW9uKHRpbGUsIGtleSkge1xuICAgIFx0XHRcdHNlbGYuX3JlbW92ZVRpbGUoa2V5KTtcbiAgICBcdFx0fSk7XG4gICAgXHR9LFxuXG4gICAgXHRfaW52YWxpZGF0ZUFsbDogZnVuY3Rpb24gKCkge1xuICAgIFx0XHR0aGlzLl9yZW1vdmVBbGxUaWxlcygpO1xuICAgIFx0XHR0aGlzLl90aWxlWm9vbSA9IG51bGw7XG4gICAgXHR9LFxuXG4gICAgXHRfc2V0VmlldzogZnVuY3Rpb24gKGNlbnRlciwgem9vbSwgbm9QcnVuZSwgbm9VcGRhdGUpIHtcbiAgICBcdFx0dmFyIHRpbGVab29tID0gTWF0aC5yb3VuZCh6b29tKTtcbiAgICBcdFx0aWYgKCh0aGlzLm9wdGlvbnMubWF4Wm9vbSAhPT0gdW5kZWZpbmVkICYmIHRpbGVab29tID4gdGhpcy5vcHRpb25zLm1heFpvb20pIHx8XG4gICAgXHRcdCAgICAodGhpcy5vcHRpb25zLm1pblpvb20gIT09IHVuZGVmaW5lZCAmJiB0aWxlWm9vbSA8IHRoaXMub3B0aW9ucy5taW5ab29tKSkge1xuICAgIFx0XHRcdHRpbGVab29tID0gdW5kZWZpbmVkO1xuICAgIFx0XHR9XG4gICAgXHRcdHZhciB0aWxlWm9vbUNoYW5nZWQgPSB0aGlzLm9wdGlvbnMudXBkYXRlV2hlblpvb21pbmcgJiYgKHRpbGVab29tICE9PSB0aGlzLl90aWxlWm9vbSk7XG4gICAgXHRcdGlmICghbm9VcGRhdGUgfHwgdGlsZVpvb21DaGFuZ2VkKSB7XG4gICAgXHRcdFx0dGhpcy5fdGlsZVpvb20gPSB0aWxlWm9vbTtcbiAgICBcdFx0XHRpZiAodGhpcy5fYWJvcnRMb2FkaW5nKSB7XG4gICAgXHRcdFx0XHR0aGlzLl9hYm9ydExvYWRpbmcoKTtcbiAgICBcdFx0XHR9XG4gICAgXHRcdFx0dGhpcy5fcmVzZXRHcmlkKCk7XG4gICAgXHRcdFx0aWYgKHRpbGVab29tICE9PSB1bmRlZmluZWQpIHtcbiAgICBcdFx0XHRcdHRoaXMuX3VwZGF0ZShjZW50ZXIpO1xuICAgIFx0XHRcdH1cbiAgICBcdFx0XHRpZiAoIW5vUHJ1bmUpIHtcbiAgICBcdFx0XHRcdHRoaXMuX3BydW5lVGlsZXMoKTtcbiAgICBcdFx0XHR9XG4gICAgXHRcdH1cbiAgICAgICAgICAgIHRoaXMuX3NldFpvb21UcmFuc2Zvcm0oY2VudGVyLCB6b29tKTtcbiAgICBcdH0sXG5cbiAgICBcdF9zZXRab29tVHJhbnNmb3JtOiBmdW5jdGlvbiAoY2VudGVyLCB6b29tKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudENlbnRlciA9IHRoaXMuX21hcC5nZXRDZW50ZXIoKTtcblx0XHQgICAgdmFyIGN1cnJlbnRab29tID0gdGhpcy5fbWFwLmdldFpvb20oKTtcbiAgICAgICAgICAgIHZhciBzY2FsZSA9IHRoaXMuX21hcC5nZXRab29tU2NhbGUoem9vbSwgY3VycmVudFpvb20pO1xuXHRcdCAgICB2YXIgcG9zaXRpb24gPSBMLkRvbVV0aWwuZ2V0UG9zaXRpb24odGhpcy5fY29udGFpbmVyKTtcblx0XHQgICAgdmFyIHZpZXdIYWxmID0gdGhpcy5fbWFwLmdldFNpemUoKS5tdWx0aXBseUJ5KDAuNSk7XG5cdFx0ICAgIHZhciBjdXJyZW50Q2VudGVyUG9pbnQgPSB0aGlzLl9tYXAucHJvamVjdChjdXJyZW50Q2VudGVyLCB6b29tKTtcblx0XHQgICAgdmFyIGRlc3RDZW50ZXJQb2ludCA9IHRoaXMuX21hcC5wcm9qZWN0KGNlbnRlciwgem9vbSk7XG5cdFx0ICAgIHZhciBjZW50ZXJPZmZzZXQgPSBkZXN0Q2VudGVyUG9pbnQuc3VidHJhY3QoY3VycmVudENlbnRlclBvaW50KTtcblx0XHQgICAgdmFyIHRvcExlZnRPZmZzZXQgPSB2aWV3SGFsZi5tdWx0aXBseUJ5KC1zY2FsZSkuYWRkKHBvc2l0aW9uKS5hZGQodmlld0hhbGYpLnN1YnRyYWN0KGNlbnRlck9mZnNldCk7XG4gICAgXHRcdGlmIChMLkJyb3dzZXIuYW55M2QpIHtcbiAgICBcdFx0XHRMLkRvbVV0aWwuc2V0VHJhbnNmb3JtKHRoaXMuX2NvbnRhaW5lciwgdG9wTGVmdE9mZnNldCwgc2NhbGUpO1xuICAgIFx0XHR9IGVsc2Uge1xuICAgIFx0XHRcdEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9jb250YWluZXIsIHRvcExlZnRPZmZzZXQpO1xuICAgIFx0XHR9XG4gICAgXHR9LFxuXG4gICAgXHQvLyBQcml2YXRlIG1ldGhvZCB0byBsb2FkIHRpbGVzIGluIHRoZSBncmlkJ3MgYWN0aXZlIHpvb20gbGV2ZWwgYWNjb3JkaW5nIHRvIG1hcCBib3VuZHNcbiAgICBcdF91cGRhdGU6IGZ1bmN0aW9uIChjZW50ZXIpIHtcbiAgICBcdFx0dmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBcdFx0aWYgKCFtYXApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgXHRcdHZhciB6b29tID0gbWFwLmdldFpvb20oKTtcbiAgICBcdFx0aWYgKGNlbnRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY2VudGVyID0gbWFwLmdldENlbnRlcigpO1xuICAgICAgICAgICAgfVxuICAgIFx0XHRpZiAodGhpcy5fdGlsZVpvb20gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIC8vIGlmIG91dCBvZiBtaW56b29tL21heHpvb21cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgXHRcdHZhciBwaXhlbEJvdW5kcyA9IHRoaXMuX2dldFRpbGVkUGl4ZWxCb3VuZHMoY2VudGVyKSxcbiAgICBcdFx0ICAgIHRpbGVSYW5nZSA9IHRoaXMuX3B4Qm91bmRzVG9UaWxlUmFuZ2UocGl4ZWxCb3VuZHMpLFxuICAgIFx0XHQgICAgdGlsZUNlbnRlciA9IHRpbGVSYW5nZS5nZXRDZW50ZXIoKSxcbiAgICBcdFx0ICAgIHF1ZXVlID0gW107XG5cbiAgICBcdFx0Xy5mb3JJbih0aGlzLl90aWxlcywgZnVuY3Rpb24odGlsZSkge1xuICAgIFx0XHRcdHRpbGUuY3VycmVudCA9IGZhbHNlO1xuICAgIFx0XHR9KTtcbiAgICBcdFx0Ly8gX3VwZGF0ZSBqdXN0IGxvYWRzIG1vcmUgdGlsZXMuIElmIHRoZSB0aWxlIHpvb20gbGV2ZWwgZGlmZmVycyB0b28gbXVjaFxuICAgIFx0XHQvLyBmcm9tIHRoZSBtYXAncywgbGV0IF9zZXRWaWV3IHJlc2V0IGxldmVscyBhbmQgcHJ1bmUgb2xkIHRpbGVzLlxuICAgIFx0XHRpZiAoTWF0aC5hYnMoem9vbSAtIHRoaXMuX3RpbGVab29tKSA+IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRWaWV3KGNlbnRlciwgem9vbSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgIFx0XHQvLyBjcmVhdGUgYSBxdWV1ZSBvZiBjb29yZGluYXRlcyB0byBsb2FkIHRpbGVzIGZyb21cbiAgICAgICAgICAgIHZhciBpLCBqO1xuICAgIFx0XHRmb3IgKGogPSB0aWxlUmFuZ2UubWluLnk7IGogPD0gdGlsZVJhbmdlLm1heC55OyBqKyspIHtcbiAgICBcdFx0XHRmb3IgKGkgPSB0aWxlUmFuZ2UubWluLng7IGkgPD0gdGlsZVJhbmdlLm1heC54OyBpKyspIHtcbiAgICBcdFx0XHRcdHZhciBjb29yZHMgPSBuZXcgTC5Qb2ludChpLCBqKTtcbiAgICBcdFx0XHRcdGNvb3Jkcy56ID0gdGhpcy5fdGlsZVpvb207XG5cbiAgICBcdFx0XHRcdGlmICghdGhpcy5faXNWYWxpZFRpbGUoY29vcmRzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgIFx0XHRcdFx0dmFyIHRpbGUgPSB0aGlzLl90aWxlc1t0aGlzLl90aWxlQ29vcmRzVG9LZXkoY29vcmRzKV07XG4gICAgXHRcdFx0XHRpZiAodGlsZSkge1xuICAgIFx0XHRcdFx0XHR0aWxlLmN1cnJlbnQgPSB0cnVlO1xuICAgIFx0XHRcdFx0fSBlbHNlIHtcbiAgICBcdFx0XHRcdFx0cXVldWUucHVzaChjb29yZHMpO1xuICAgIFx0XHRcdFx0fVxuICAgIFx0XHRcdH1cbiAgICBcdFx0fVxuICAgIFx0XHQvLyBzb3J0IHRpbGUgcXVldWUgdG8gbG9hZCB0aWxlcyBpbiBvcmRlciBvZiB0aGVpciBkaXN0YW5jZSB0byBjZW50ZXJcbiAgICBcdFx0cXVldWUuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgIFx0XHRcdHJldHVybiBhLmRpc3RhbmNlVG8odGlsZUNlbnRlcikgLSBiLmRpc3RhbmNlVG8odGlsZUNlbnRlcik7XG4gICAgXHRcdH0pO1xuICAgIFx0XHRpZiAocXVldWUubGVuZ3RoICE9PSAwKSB7XG4gICAgXHRcdFx0Ly8gaWYgaXRzIHRoZSBmaXJzdCBiYXRjaCBvZiB0aWxlcyB0byBsb2FkXG4gICAgXHRcdFx0aWYgKCF0aGlzLl9sb2FkaW5nKSB7XG4gICAgXHRcdFx0XHR0aGlzLl9sb2FkaW5nID0gdHJ1ZTtcbiAgICBcdFx0XHRcdC8vIEBldmVudCBsb2FkaW5nOiBFdmVudFxuICAgIFx0XHRcdFx0Ly8gRmlyZWQgd2hlbiB0aGUgZ3JpZCBsYXllciBzdGFydHMgbG9hZGluZyB0aWxlc1xuICAgIFx0XHRcdFx0dGhpcy5maXJlKCdsb2FkaW5nJyk7XG4gICAgXHRcdFx0fVxuICAgIFx0XHRcdGZvciAoaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgIFx0XHRcdFx0dGhpcy5fYWRkVGlsZShxdWV1ZVtpXSk7XG4gICAgXHRcdFx0fVxuICAgIFx0XHR9XG4gICAgXHR9LFxuXG4gICAgXHRfcmVtb3ZlVGlsZTogZnVuY3Rpb24gKGtleSkge1xuICAgIFx0XHR2YXIgdGlsZSA9IHRoaXMuX3RpbGVzW2tleV07XG4gICAgXHRcdGlmICghdGlsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICBcdFx0ZGVsZXRlIHRoaXMuX3RpbGVzW2tleV07XG4gICAgXHRcdC8vIEBldmVudCB0aWxldW5sb2FkOiBUaWxlRXZlbnRcbiAgICBcdFx0Ly8gRmlyZWQgd2hlbiBhIHRpbGUgaXMgcmVtb3ZlZCAoZS5nLiB3aGVuIGEgdGlsZSBnb2VzIG9mZiB0aGUgc2NyZWVuKS5cbiAgICBcdFx0dGhpcy5maXJlKCd0aWxldW5sb2FkJywge1xuICAgIFx0XHRcdGNvb3JkczogdGhpcy5fa2V5VG9UaWxlQ29vcmRzKGtleSlcbiAgICBcdFx0fSk7XG4gICAgXHR9LFxuXG4gICAgXHRfYWRkVGlsZTogZnVuY3Rpb24gKGNvb3Jkcykge1xuICAgIFx0XHR2YXIga2V5ID0gdGhpcy5fdGlsZUNvb3Jkc1RvS2V5KGNvb3Jkcyk7XG4gICAgXHRcdC8vIHNhdmUgdGlsZSBpbiBjYWNoZVxuICAgIFx0XHR2YXIgdGlsZSA9IHRoaXMuX3RpbGVzW2tleV0gPSB7XG4gICAgXHRcdFx0Y29vcmRzOiBjb29yZHMsXG4gICAgXHRcdFx0Y3VycmVudDogdHJ1ZVxuICAgIFx0XHR9O1xuICAgIFx0XHQvLyBAZXZlbnQgdGlsZWxvYWRzdGFydDogVGlsZUV2ZW50XG4gICAgXHRcdC8vIEZpcmVkIHdoZW4gYSB0aWxlIGlzIHJlcXVlc3RlZCBhbmQgc3RhcnRzIGxvYWRpbmcuXG4gICAgXHRcdHRoaXMuZmlyZSgndGlsZWxvYWRzdGFydCcsIHtcbiAgICBcdFx0XHRjb29yZHM6IGNvb3Jkc1xuICAgIFx0XHR9KTtcblxuICAgIFx0XHR0aWxlLmxvYWRlZCA9ICtuZXcgRGF0ZSgpO1xuICAgIFx0XHR0aWxlLmFjdGl2ZSA9IHRydWU7XG4gICAgXHRcdHRoaXMuX3BydW5lVGlsZXMoKTtcblxuICAgIFx0XHQvLyBAZXZlbnQgdGlsZWxvYWQ6IFRpbGVFdmVudFxuICAgIFx0XHQvLyBGaXJlZCB3aGVuIGEgdGlsZSBsb2Fkcy5cbiAgICBcdFx0dGhpcy5maXJlKCd0aWxlbG9hZCcsIHtcbiAgICBcdFx0XHRjb29yZHM6IGNvb3Jkc1xuICAgIFx0XHR9KTtcblxuICAgIFx0XHRpZiAodGhpcy5fbm9UaWxlc1RvTG9hZCgpKSB7XG4gICAgXHRcdFx0dGhpcy5fbG9hZGluZyA9IGZhbHNlO1xuICAgIFx0XHRcdC8vIEBldmVudCBsb2FkOiBFdmVudFxuICAgIFx0XHRcdC8vIEZpcmVkIHdoZW4gdGhlIGdyaWQgbGF5ZXIgbG9hZGVkIGFsbCB2aXNpYmxlIHRpbGVzLlxuICAgIFx0XHRcdHRoaXMuZmlyZSgnbG9hZCcpO1xuXG4gICAgXHRcdFx0aWYgKEwuQnJvd3Nlci5pZWx0OSB8fCAhdGhpcy5fbWFwLl9mYWRlQW5pbWF0ZWQpIHtcbiAgICBcdFx0XHRcdEwuVXRpbC5yZXF1ZXN0QW5pbUZyYW1lKHRoaXMuX3BydW5lVGlsZXMsIHRoaXMpO1xuICAgIFx0XHRcdH0gZWxzZSB7XG4gICAgXHRcdFx0XHQvLyBXYWl0IGEgYml0IG1vcmUgdGhhbiAwLjIgc2VjcyAodGhlIGR1cmF0aW9uIG9mIHRoZSB0aWxlIGZhZGUtaW4pXG4gICAgXHRcdFx0XHQvLyB0byB0cmlnZ2VyIGEgcHJ1bmluZy5cbiAgICBcdFx0XHRcdHNldFRpbWVvdXQoTC5iaW5kKHRoaXMuX3BydW5lVGlsZXMsIHRoaXMpLCAyNTApO1xuICAgIFx0XHRcdH1cbiAgICBcdFx0fVxuICAgIFx0fVxuXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IE92ZXJsYXk7XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgZXNwZXIgPSByZXF1aXJlKCdlc3BlcicpO1xuICAgIHZhciBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5Jyk7XG5cbiAgICB2YXIgV2ViR0wgPSBPdmVybGF5LmV4dGVuZCh7XG5cbiAgICAgICAgb25BZGQ6IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICAgICAgT3ZlcmxheS5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuICAgICAgICAgICAgbWFwLm9uKCd6b29tc3RhcnQnLCB0aGlzLm9uWm9vbVN0YXJ0LCB0aGlzKTtcbiAgICAgICAgICAgIG1hcC5vbignem9vbWVuZCcsIHRoaXMub25ab29tRW5kLCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblJlbW92ZTogZnVuY3Rpb24obWFwKSB7XG4gICAgICAgICAgICBPdmVybGF5LnByb3RvdHlwZS5vblJlbW92ZS5jYWxsKHRoaXMsIG1hcCk7XG4gICAgICAgICAgICBtYXAub2ZmKCd6b29tc3RhcnQnLCB0aGlzLm9uWm9vbVN0YXJ0LCB0aGlzKTtcbiAgICAgICAgICAgIG1hcC5vZmYoJ3pvb21lbmQnLCB0aGlzLm9uWm9vbUVuZCwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25ab29tU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5faXNab29taW5nID0gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblpvb21FbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5faXNab29taW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJGcmFtZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2FjaGVIaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gbm8tb3BcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNhY2hlTG9hZDogZnVuY3Rpb24odGlsZSwgY2FjaGVkLCBjb29yZHMpIHtcbiAgICAgICAgICAgIGlmIChjYWNoZWQuZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2J1ZmZlclRpbGVUZXh0dXJlKGNhY2hlZCwgY29vcmRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkNhY2hlTG9hZEV4dHJlbWFVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgXy5mb3JJbih0aGlzLl9jYWNoZSwgZnVuY3Rpb24oY2FjaGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNhY2hlZC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2J1ZmZlclRpbGVUZXh0dXJlKGNhY2hlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICBcdF9pbml0Q29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBPdmVybGF5LnByb3RvdHlwZS5faW5pdENvbnRhaW5lci5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9nbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXRHTCgpO1xuICAgICAgICAgICAgfVxuICAgIFx0fSxcblxuICAgICAgICBfaW5pdEdMOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHZhciBnbCA9IHRoaXMuX2dsID0gZXNwZXIuV2ViR0xDb250ZXh0LmdldCh0aGlzLl9jb250YWluZXIpO1xuICAgICAgICAgICAgLy8gaGFuZGxlIG1pc3NpbmcgY29udGV4dFxuICAgICAgICAgICAgaWYgKCFnbCkge1xuICAgICAgICAgICAgICAgIHRocm93ICdVbmFibGUgdG8gYWNxdWlyZSBhIFdlYkdMIGNvbnRleHQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaW5pdCB0aGUgd2ViZ2wgc3RhdGVcbiAgICAgICAgICAgIGdsLmNsZWFyQ29sb3IoMCwgMCwgMCwgMCk7XG4gICAgICAgICAgICBnbC5lbmFibGUoZ2wuQkxFTkQpO1xuICAgICAgICAgICAgZ2wuYmxlbmRGdW5jKGdsLlNSQ19BTFBIQSwgZ2wuT05FKTtcbiAgICAgICAgICAgIGdsLmRpc2FibGUoZ2wuREVQVEhfVEVTVCk7XG4gICAgICAgICAgICAvLyBjcmVhdGUgdGlsZSByZW5kZXJhYmxlXG4gICAgICAgICAgICBzZWxmLl9yZW5kZXJhYmxlID0gbmV3IGVzcGVyLlJlbmRlcmFibGUoe1xuICAgICAgICAgICAgICAgIHZlcnRpY2VzOiB7XG4gICAgICAgICAgICAgICAgICAgIDA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFswLCAtMjU2XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsyNTYsIC0yNTZdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzI1NiwgMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMCwgMF1cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgMTogW1xuICAgICAgICAgICAgICAgICAgICAgICAgWzAsIDBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzEsIDBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzEsIDFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzAsIDFdXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGluZGljZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgMCwgMSwgMixcbiAgICAgICAgICAgICAgICAgICAgMCwgMiwgM1xuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gbG9hZCBzaGFkZXJzXG4gICAgICAgICAgICBuZXcgZXNwZXIuU2hhZGVyKHtcbiAgICAgICAgICAgICAgICB2ZXJ0OiB0aGlzLm9wdGlvbnMuc2hhZGVycy52ZXJ0LFxuICAgICAgICAgICAgICAgIGZyYWc6IHRoaXMub3B0aW9ucy5zaGFkZXJzLmZyYWdcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVyciwgc2hhZGVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZXhlY3V0ZSBjYWxsYmFja1xuICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9IHNlbGYuX2NvbnRhaW5lci53aWR0aDtcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gc2VsZi5fY29udGFpbmVyLmhlaWdodDtcbiAgICAgICAgICAgICAgICBzZWxmLl92aWV3cG9ydCA9IG5ldyBlc3Blci5WaWV3cG9ydCh7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzZWxmLl9pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgc2VsZi5fc2hhZGVyID0gc2hhZGVyO1xuICAgICAgICAgICAgICAgIHNlbGYuX2RyYXcoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRUcmFuc2xhdGlvbk1hdHJpeDogZnVuY3Rpb24oeCwgeSwgeikge1xuICAgICAgICAgICAgdmFyIG1hdCA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpO1xuICAgICAgICAgICAgbWF0WzBdID0gMTtcbiAgICAgICAgICAgIG1hdFsxXSA9IDA7XG4gICAgICAgICAgICBtYXRbMl0gPSAwO1xuICAgICAgICAgICAgbWF0WzNdID0gMDtcbiAgICAgICAgICAgIG1hdFs0XSA9IDA7XG4gICAgICAgICAgICBtYXRbNV0gPSAxO1xuICAgICAgICAgICAgbWF0WzZdID0gMDtcbiAgICAgICAgICAgIG1hdFs3XSA9IDA7XG4gICAgICAgICAgICBtYXRbOF0gPSAwO1xuICAgICAgICAgICAgbWF0WzldID0gMDtcbiAgICAgICAgICAgIG1hdFsxMF0gPSAxO1xuICAgICAgICAgICAgbWF0WzExXSA9IDA7XG4gICAgICAgICAgICBtYXRbMTJdID0geDtcbiAgICAgICAgICAgIG1hdFsxM10gPSB5O1xuICAgICAgICAgICAgbWF0WzE0XSA9IHo7XG4gICAgICAgICAgICBtYXRbMTVdID0gMTtcbiAgICAgICAgICAgIHJldHVybiBtYXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldE9ydGhvTWF0cml4OiBmdW5jdGlvbihsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xuICAgICAgICAgICAgdmFyIG1hdCA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpO1xuICAgICAgICAgICAgbWF0WzBdID0gMiAvIChyaWdodCAtIGxlZnQpO1xuICAgICAgICAgICAgbWF0WzFdID0gMDtcbiAgICAgICAgICAgIG1hdFsyXSA9IDA7XG4gICAgICAgICAgICBtYXRbM10gPSAwO1xuICAgICAgICAgICAgbWF0WzRdID0gMDtcbiAgICAgICAgICAgIG1hdFs1XSA9IDIgLyAodG9wIC0gYm90dG9tKTtcbiAgICAgICAgICAgIG1hdFs2XSA9IDA7XG4gICAgICAgICAgICBtYXRbN10gPSAwO1xuICAgICAgICAgICAgbWF0WzhdID0gMDtcbiAgICAgICAgICAgIG1hdFs5XSA9IDA7XG4gICAgICAgICAgICBtYXRbMTBdID0gLTIgLyAoZmFyIC0gbmVhcik7XG4gICAgICAgICAgICBtYXRbMTFdID0gMDtcbiAgICAgICAgICAgIG1hdFsxMl0gPSAtKChyaWdodCArIGxlZnQpIC8gKHJpZ2h0IC0gbGVmdCkpO1xuICAgICAgICAgICAgbWF0WzEzXSA9IC0oKHRvcCArIGJvdHRvbSkgLyAodG9wIC0gYm90dG9tKSk7XG4gICAgICAgICAgICBtYXRbMTRdID0gLSgoZmFyICsgbmVhcikgLyAoZmFyIC0gbmVhcikpO1xuICAgICAgICAgICAgbWF0WzE1XSA9IDE7XG4gICAgICAgICAgICByZXR1cm4gbWF0O1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRQcm9qZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBib3VuZHMgPSB0aGlzLl9tYXAuZ2V0UGl4ZWxCb3VuZHMoKTtcbiAgICAgICAgICAgIHZhciBkaW0gPSBNYXRoLnBvdygyLCB0aGlzLl9tYXAuZ2V0Wm9vbSgpKSAqIDI1NjtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRPcnRob01hdHJpeChcbiAgICAgICAgICAgICAgICBib3VuZHMubWluLngsXG4gICAgICAgICAgICAgICAgYm91bmRzLm1heC54LFxuICAgICAgICAgICAgICAgIChkaW0gLSBib3VuZHMubWF4LnkpLFxuICAgICAgICAgICAgICAgIChkaW0gLSBib3VuZHMubWluLnkpLFxuICAgICAgICAgICAgICAgIC0xLCAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZHJhdzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXNIaWRkZW4oKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZS1wb3NpdGlvbiBjYW52YXNcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1pvb21pbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRmYXJ3IHRoZSBmcmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVuZGVyRnJhbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fZHJhdy5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfcmVuZGVyRnJhbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNpemUgPSB0aGlzLl9tYXAuZ2V0U2l6ZSgpO1xuICAgICAgICAgICAgLy8gc2V0IGNhbnZhcyBzaXplXG4gICAgICAgICAgICB0aGlzLl9jb250YWluZXIud2lkdGggPSBzaXplLng7XG4gICAgICAgICAgICB0aGlzLl9jb250YWluZXIuaGVpZ2h0ID0gc2l6ZS55O1xuICAgICAgICAgICAgLy8gc2V0IHZpZXdwb3J0IHNpemVcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdwb3J0LnJlc2l6ZShzaXplLngsIHNpemUueSk7XG4gICAgICAgICAgICAvLyByZS1wb3NpdGlvbiBjb250YWluZXJcbiAgICAgICAgICAgIHZhciB0b3BMZWZ0ID0gdGhpcy5fbWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFswLCAwXSk7XG4gICAgICAgICAgICBMLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fY29udGFpbmVyLCB0b3BMZWZ0KTtcbiAgICAgICAgICAgIC8vIHNldHVwXG4gICAgICAgICAgICB2YXIgZ2wgPSB0aGlzLl9nbDtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdwb3J0LnB1c2goKTtcbiAgICAgICAgICAgIHRoaXMuX3NoYWRlci5wdXNoKCk7XG4gICAgICAgICAgICB0aGlzLl9zaGFkZXIuc2V0VW5pZm9ybSgndVByb2plY3Rpb25NYXRyaXgnLCB0aGlzLl9nZXRQcm9qZWN0aW9uKCkpO1xuICAgICAgICAgICAgdGhpcy5fc2hhZGVyLnNldFVuaWZvcm0oJ3VPcGFjaXR5JywgdGhpcy5nZXRPcGFjaXR5KCkpO1xuICAgICAgICAgICAgdGhpcy5fc2hhZGVyLnNldFVuaWZvcm0oJ3VUZXh0dXJlU2FtcGxlcicsIDApO1xuICAgICAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCk7XG4gICAgICAgICAgICAvLyBkcmF3XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJUaWxlcygpO1xuICAgICAgICAgICAgLy8gdGVhcmRvd25cbiAgICAgICAgICAgIHRoaXMuX3NoYWRlci5wb3AoKTtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdwb3J0LnBvcCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9yZW5kZXJUaWxlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgZGltID0gTWF0aC5wb3coMiwgdGhpcy5fbWFwLmdldFpvb20oKSkgKiAyNTY7XG4gICAgICAgICAgICAvLyBmb3IgZWFjaCB0aWxlXG4gICAgICAgICAgICBfLmZvckluKHRoaXMuX2NhY2hlLCBmdW5jdGlvbihjYWNoZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNhY2hlZC50ZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gYmluZCB0aWxlIHRleHR1cmUgdG8gdGV4dHVyZSB1bml0IDBcbiAgICAgICAgICAgICAgICBjYWNoZWQudGV4dHVyZS5wdXNoKDApO1xuICAgICAgICAgICAgICAgIF8uZm9ySW4oY2FjaGVkLnRpbGVzLCBmdW5jdGlvbih0aWxlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZmluZCB0aGUgdGlsZXMgcG9zaXRpb24gZnJvbSBpdHMga2V5XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb29yZCA9IHNlbGYuY29vcmRGcm9tQ2FjaGVLZXkoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIG1vZGVsIG1hdHJpeFxuICAgICAgICAgICAgICAgICAgICB2YXIgbW9kZWwgPSBzZWxmLl9nZXRUcmFuc2xhdGlvbk1hdHJpeChcbiAgICAgICAgICAgICAgICAgICAgICAgIDI1NiAqIGNvb3JkLngsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaW0gLSAoMjU2ICogY29vcmQueSksXG4gICAgICAgICAgICAgICAgICAgICAgICAwKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc2hhZGVyLnNldFVuaWZvcm0oJ3VNb2RlbE1hdHJpeCcsIG1vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZHJhdyB0aGUgdGlsZVxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9yZW5kZXJhYmxlLmRyYXcoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBubyBuZWVkIHRvIHVuYmluZCB0ZXh0dXJlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYnVmZmVyVGlsZVRleHR1cmU6IGZ1bmN0aW9uKGNhY2hlZCkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBuZXcgRmxvYXQ2NEFycmF5KGNhY2hlZC5kYXRhKTtcbiAgICAgICAgICAgIHZhciByZXNvbHV0aW9uID0gTWF0aC5zcXJ0KGRhdGEubGVuZ3RoKTtcbiAgICAgICAgICAgIHZhciBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoZGF0YS5sZW5ndGggKiA0KTtcbiAgICAgICAgICAgIHZhciBiaW5zID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgICAgIHZhciBjb2xvciA9IFswLCAwLCAwLCAwXTtcbiAgICAgICAgICAgIHZhciBudmFsLCBydmFsLCBiaW4sIGk7XG4gICAgICAgICAgICB2YXIgcmFtcCA9IHRoaXMuZ2V0Q29sb3JSYW1wKCk7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBmb3IgKGk9MDsgaTxkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYmluID0gZGF0YVtpXTtcbiAgICAgICAgICAgICAgICBpZiAoYmluID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yWzBdID0gMDtcbiAgICAgICAgICAgICAgICAgICAgY29sb3JbMV0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBjb2xvclsyXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yWzNdID0gMDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBudmFsID0gc2VsZi50cmFuc2Zvcm1WYWx1ZShiaW4pO1xuICAgICAgICAgICAgICAgICAgICBydmFsID0gc2VsZi5pbnRlcnBvbGF0ZVRvUmFuZ2UobnZhbCk7XG4gICAgICAgICAgICAgICAgICAgIHJhbXAocnZhbCwgY29sb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBiaW5zW2kgKiA0XSA9IGNvbG9yWzBdO1xuICAgICAgICAgICAgICAgIGJpbnNbaSAqIDQgKyAxXSA9IGNvbG9yWzFdO1xuICAgICAgICAgICAgICAgIGJpbnNbaSAqIDQgKyAyXSA9IGNvbG9yWzJdO1xuICAgICAgICAgICAgICAgIGJpbnNbaSAqIDQgKyAzXSA9IGNvbG9yWzNdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FjaGVkLnRleHR1cmUgPSBuZXcgZXNwZXIuVGV4dHVyZTJEKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHJlc29sdXRpb24sXG4gICAgICAgICAgICAgICAgd2lkdGg6IHJlc29sdXRpb24sXG4gICAgICAgICAgICAgICAgc3JjOiBiaW5zLFxuICAgICAgICAgICAgICAgIGZvcm1hdDogJ1JHQkEnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdVTlNJR05FRF9CWVRFJyxcbiAgICAgICAgICAgICAgICB3cmFwOiAnQ0xBTVBfVE9fRURHRScsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiAnTkVBUkVTVCcsXG4gICAgICAgICAgICAgICAgaW52ZXJ0WTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBXZWJHTDtcblxufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIGNhbnZhcyByZW5kZXJlcnNcbiAgICB2YXIgQ2FudmFzID0ge1xuICAgICAgICBIZWF0bWFwOiByZXF1aXJlKCcuL3R5cGUvY2FudmFzL0hlYXRtYXAnKSxcbiAgICAgICAgVG9wVHJhaWxzOiByZXF1aXJlKCcuL3R5cGUvY2FudmFzL1RvcFRyYWlscycpLFxuICAgICAgICBQcmV2aWV3OiByZXF1aXJlKCcuL3R5cGUvY2FudmFzL1ByZXZpZXcnKVxuICAgIH07XG5cbiAgICAvLyBodG1sIHJlbmRlcmVyc1xuICAgIHZhciBIVE1MID0ge1xuICAgICAgICBIZWF0bWFwOiByZXF1aXJlKCcuL3R5cGUvaHRtbC9IZWF0bWFwJyksXG4gICAgICAgIFJpbmc6IHJlcXVpcmUoJy4vdHlwZS9odG1sL1JpbmcnKSxcbiAgICAgICAgV29yZENsb3VkOiByZXF1aXJlKCcuL3R5cGUvaHRtbC9Xb3JkQ2xvdWQnKSxcbiAgICAgICAgV29yZEhpc3RvZ3JhbTogcmVxdWlyZSgnLi90eXBlL2h0bWwvV29yZEhpc3RvZ3JhbScpXG4gICAgfTtcblxuICAgIC8vIHdlYmdsIHJlbmRlcmVyc1xuICAgIHZhciBXZWJHTCA9IHtcbiAgICAgICAgSGVhdG1hcDogcmVxdWlyZSgnLi90eXBlL3dlYmdsL0hlYXRtYXAnKVxuICAgIH07XG5cbiAgICAvLyBwZW5kaW5nIGxheWVyIHJlbmRlcmVyc1xuICAgIHZhciBQZW5kaW5nID0ge1xuICAgICAgICBCbGluazogcmVxdWlyZSgnLi90eXBlL3BlbmRpbmcvQmxpbmsnKSxcbiAgICAgICAgU3BpbjogcmVxdWlyZSgnLi90eXBlL3BlbmRpbmcvU3BpbicpLFxuICAgICAgICBCbGlua1NwaW46IHJlcXVpcmUoJy4vdHlwZS9wZW5kaW5nL0JsaW5rU3BpbicpXG4gICAgfTtcblxuICAgIC8vIHBlbmRpbmcgbGF5ZXIgcmVuZGVyZXJzXG4gICAgdmFyIERlYnVnID0ge1xuICAgICAgICBDb29yZDogcmVxdWlyZSgnLi90eXBlL2RlYnVnL0Nvb3JkJylcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICAgIEhUTUw6IEhUTUwsXG4gICAgICAgIENhbnZhczogQ2FudmFzLFxuICAgICAgICBXZWJHTDogV2ViR0wsXG4gICAgICAgIERlYnVnOiBEZWJ1ZyxcbiAgICAgICAgUGVuZGluZzogUGVuZGluZ1xuICAgIH07XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgUE9TSVRJVkUgPSAnMSc7XG4gICAgdmFyIE5FVVRSQUwgPSAnMCc7XG4gICAgdmFyIE5FR0FUSVZFID0gJy0xJztcblxuICAgIGZ1bmN0aW9uIGdldENsYXNzRnVuYyhtaW4sIG1heCkge1xuICAgICAgICBtaW4gPSBtaW4gIT09IHVuZGVmaW5lZCA/IG1pbiA6IC0xO1xuICAgICAgICBtYXggPSBtYXggIT09IHVuZGVmaW5lZCA/IG1heCA6IDE7XG4gICAgICAgIHZhciBwb3NpdGl2ZSA9IFswLjI1ICogbWF4LCAwLjUgKiBtYXgsIDAuNzUgKiBtYXhdO1xuICAgICAgICB2YXIgbmVnYXRpdmUgPSBbLTAuMjUgKiBtaW4sIC0wLjUgKiBtaW4sIC0wLjc1ICogbWluXTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNlbnRpbWVudCkge1xuICAgICAgICAgICAgdmFyIHByZWZpeDtcbiAgICAgICAgICAgIHZhciByYW5nZTtcbiAgICAgICAgICAgIGlmIChzZW50aW1lbnQgPCAwKSB7XG4gICAgICAgICAgICAgICAgcHJlZml4ID0gJ25lZy0nO1xuICAgICAgICAgICAgICAgIHJhbmdlID0gbmVnYXRpdmU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByZWZpeCA9ICdwb3MtJztcbiAgICAgICAgICAgICAgICByYW5nZSA9IHBvc2l0aXZlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFicyA9IE1hdGguYWJzKHNlbnRpbWVudCk7XG4gICAgICAgICAgICBpZiAoYWJzID4gcmFuZ2VbMl0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJlZml4ICsgJzQnO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhYnMgPiByYW5nZVsxXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyAnMyc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFicyA+IHJhbmdlWzBdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArICcyJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyAnMSc7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VG90YWwoY291bnQpIHtcbiAgICAgICAgaWYgKCFjb3VudCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBvcyA9IGNvdW50W1BPU0lUSVZFXSA/IGNvdW50W1BPU0lUSVZFXSA6IDA7XG4gICAgICAgIHZhciBuZXUgPSBjb3VudFtORVVUUkFMXSA/IGNvdW50W05FVVRSQUxdIDogMDtcbiAgICAgICAgdmFyIG5lZyA9IGNvdW50W05FR0FUSVZFXSA/IGNvdW50W05FR0FUSVZFXSA6IDA7XG4gICAgICAgIHJldHVybiBwb3MgKyBuZXUgKyBuZWc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0QXZnKGNvdW50KSB7XG4gICAgICAgIGlmICghY291bnQpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwb3MgPSBjb3VudFtQT1NJVElWRV0gPyBjb3VudFtQT1NJVElWRV0gOiAwO1xuICAgICAgICB2YXIgbmV1ID0gY291bnRbTkVVVFJBTF0gPyBjb3VudFtORVVUUkFMXSA6IDA7XG4gICAgICAgIHZhciBuZWcgPSBjb3VudFtORUdBVElWRV0gPyBjb3VudFtORUdBVElWRV0gOiAwO1xuICAgICAgICB2YXIgdG90YWwgPSBwb3MgKyBuZXUgKyBuZWc7XG4gICAgICAgIHJldHVybiAodG90YWwgIT09IDApID8gKHBvcyAtIG5lZykgLyB0b3RhbCA6IDA7XG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICAgIGdldENsYXNzRnVuYzogZ2V0Q2xhc3NGdW5jLFxuICAgICAgICBnZXRUb3RhbDogZ2V0VG90YWwsXG4gICAgICAgIGdldEF2ZzogZ2V0QXZnXG4gICAgfTtcblxufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDYW52YXMgPSByZXF1aXJlKCcuLi8uLi9jb3JlL0NhbnZhcycpO1xuXG4gICAgdmFyIEhlYXRtYXAgPSBDYW52YXMuZXh0ZW5kKHtcblxuICAgICAgICByZW5kZXJDYW52YXM6IGZ1bmN0aW9uKGJpbnMsIHJlc29sdXRpb24sIHJhbXApIHtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSByZXNvbHV0aW9uO1xuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gcmVzb2x1dGlvbjtcbiAgICAgICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgIHZhciBpbWFnZURhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHJlc29sdXRpb24sIHJlc29sdXRpb24pO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBpbWFnZURhdGEuZGF0YTtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHZhciBjb2xvciA9IFswLCAwLCAwLCAwXTtcbiAgICAgICAgICAgIHZhciBudmFsLCBydmFsLCBiaW4sIGk7XG4gICAgICAgICAgICBmb3IgKGk9MDsgaTxiaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYmluID0gYmluc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoYmluID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yWzBdID0gMDtcbiAgICAgICAgICAgICAgICAgICAgY29sb3JbMV0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBjb2xvclsyXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yWzNdID0gMDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBudmFsID0gc2VsZi50cmFuc2Zvcm1WYWx1ZShiaW4pO1xuICAgICAgICAgICAgICAgICAgICBydmFsID0gc2VsZi5pbnRlcnBvbGF0ZVRvUmFuZ2UobnZhbCk7XG4gICAgICAgICAgICAgICAgICAgIHJhbXAocnZhbCwgY29sb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkYXRhW2kgKiA0XSA9IGNvbG9yWzBdO1xuICAgICAgICAgICAgICAgIGRhdGFbaSAqIDQgKyAxXSA9IGNvbG9yWzFdO1xuICAgICAgICAgICAgICAgIGRhdGFbaSAqIDQgKyAyXSA9IGNvbG9yWzJdO1xuICAgICAgICAgICAgICAgIGRhdGFbaSAqIDQgKyAzXSA9IGNvbG9yWzNdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3R4LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuICAgICAgICAgICAgcmV0dXJuIGNhbnZhcztcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXJUaWxlOiBmdW5jdGlvbihjYW52YXMsIGRhdGEpIHtcbiAgICAgICAgICAgIGlmICghZGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBiaW5zID0gbmV3IEZsb2F0NjRBcnJheShkYXRhKTtcbiAgICAgICAgICAgIHZhciByZXNvbHV0aW9uID0gTWF0aC5zcXJ0KGJpbnMubGVuZ3RoKTtcbiAgICAgICAgICAgIHZhciByYW1wID0gdGhpcy5nZXRDb2xvclJhbXAoKTtcbiAgICAgICAgICAgIHZhciB0aWxlQ2FudmFzID0gdGhpcy5yZW5kZXJDYW52YXMoYmlucywgcmVzb2x1dGlvbiwgcmFtcCk7XG4gICAgICAgICAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAgICAgICAgIHRpbGVDYW52YXMsXG4gICAgICAgICAgICAgICAgMCwgMCxcbiAgICAgICAgICAgICAgICByZXNvbHV0aW9uLCByZXNvbHV0aW9uLFxuICAgICAgICAgICAgICAgIDAsIDAsXG4gICAgICAgICAgICAgICAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IEhlYXRtYXA7XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQ2FudmFzID0gcmVxdWlyZSgnLi4vLi4vY29yZS9DYW52YXMnKTtcblxuICAgIHZhciBQcmV2aWV3ID0gQ2FudmFzLmV4dGVuZCh7XG5cbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgbGluZVdpZHRoOiAyLFxuICAgICAgICAgICAgbGluZUNvbG9yOiAnbGlnaHRibHVlJyxcbiAgICAgICAgICAgIGZpbGxDb2xvcjogJ2RhcmtibHVlJyxcbiAgICAgICAgfSxcblxuICAgICAgICBoaWdobGlnaHRlZDogZmFsc2UsXG5cbiAgICAgICAgX2RyYXdIaWdobGlnaHQ6IGZ1bmN0aW9uKGNhbnZhcywgeCwgeSwgc2l6ZSkge1xuICAgICAgICAgICAgdmFyIHNpemVPdmVyMiA9IHNpemUgLyAyO1xuICAgICAgICAgICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMub3B0aW9ucy5maWxsQ29sb3I7XG4gICAgICAgICAgICBjdHguYXJjKFxuICAgICAgICAgICAgICAgIHggKiBzaXplICsgc2l6ZU92ZXIyLFxuICAgICAgICAgICAgICAgIHkgKiBzaXplICsgc2l6ZU92ZXIyLFxuICAgICAgICAgICAgICAgIHNpemVPdmVyMixcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDIgKiBNYXRoLlBJLFxuICAgICAgICAgICAgICAgIGZhbHNlKTtcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgICAgICBjdHgubGluZVdpZHRoID0gdGhpcy5vcHRpb25zLmxpbmVXaWR0aDtcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IHRoaXMub3B0aW9ucy5saW5lQ29sb3I7XG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Nb3VzZU1vdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKGUub3JpZ2luYWxFdmVudC50YXJnZXQpO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGlnaGxpZ2h0ZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBjbGVhciBleGlzdGluZyBoaWdobGlnaHRcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyVGlsZXMoKTtcbiAgICAgICAgICAgICAgICAvLyBjbGVhciBoaWdobGlnaHRlZCBmbGFnXG4gICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZ2V0IGxheWVyIGNvb3JkXG4gICAgICAgICAgICB2YXIgbGF5ZXJQb2ludCA9IHRoaXMuX2dldExheWVyUG9pbnRGcm9tRXZlbnQoZSk7XG4gICAgICAgICAgICAvLyBnZXQgdGlsZSBjb29yZFxuICAgICAgICAgICAgdmFyIGNvb3JkID0gdGhpcy5fZ2V0VGlsZUNvb3JkRnJvbUxheWVyUG9pbnQobGF5ZXJQb2ludCk7XG4gICAgICAgICAgICAvLyBnZXQgY2FjaGUga2V5XG4gICAgICAgICAgICB2YXIgbmtleSA9IHRoaXMuY2FjaGVLZXlGcm9tQ29vcmQoY29vcmQsIHRydWUpO1xuICAgICAgICAgICAgLy8gZ2V0IGNhY2hlIGVudHJ5XG4gICAgICAgICAgICB2YXIgY2FjaGVkID0gdGhpcy5fY2FjaGVbbmtleV07XG4gICAgICAgICAgICBpZiAoY2FjaGVkICYmIGNhY2hlZC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gZ2V0IGJpbiBjb29yZGluYXRlXG4gICAgICAgICAgICAgICAgdmFyIGJpbiA9IHRoaXMuX2dldEJpbkNvb3JkRnJvbUxheWVyUG9pbnQobGF5ZXJQb2ludCk7XG4gICAgICAgICAgICAgICAgLy8gZ2V0IGJpbiBkYXRhIGVudHJ5XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBjYWNoZWQuZGF0YVtiaW4uaW5kZXhdO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciBlYWNoIHRpbGUgcmVseWluZyBvbiB0aGF0IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgICAgICAgICBfLmZvckluKGNhY2hlZC50aWxlcywgZnVuY3Rpb24odGlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fZHJhd0hpZ2hsaWdodCh0aWxlLCBiaW4ueCwgYmluLnksIGJpbi5zaXplKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGZsYWcgYXMgaGlnaGxpZ2h0ZWRcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIGV4ZWN1dGUgY2FsbGJhY2tcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5oYW5kbGVycy5tb3VzZW1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5oYW5kbGVycy5tb3VzZW1vdmUodGFyZ2V0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogY29vcmQueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBjb29yZC56LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHo6IGNvb3JkLnosXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYng6IGJpbi54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5OiBiaW4ueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAncHJldmlldycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXI6IHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmhhbmRsZXJzLm1vdXNlbW92ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5oYW5kbGVycy5tb3VzZW1vdmUodGFyZ2V0LCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFByZXZpZXc7XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQ2FudmFzID0gcmVxdWlyZSgnLi4vLi4vY29yZS9DYW52YXMnKTtcblxuICAgIHZhciBUb3BUcmFpbHMgPSBDYW52YXMuZXh0ZW5kKHtcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBjb2xvcjogWzI1NSwgMCwgMjU1LCAyNTVdLFxuICAgICAgICAgICAgZG93blNhbXBsZUZhY3RvcjogOFxuICAgICAgICB9LFxuXG4gICAgICAgIGhpZ2hsaWdodGVkOiBmYWxzZSxcblxuICAgICAgICBvbk1vdXNlTW92ZTogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIHRhcmdldCA9ICQoZS5vcmlnaW5hbEV2ZW50LnRhcmdldCk7XG4gICAgICAgICAgICBpZiAodGhpcy5oaWdobGlnaHRlZCkge1xuICAgICAgICAgICAgICAgIC8vIGNsZWFyIGV4aXN0aW5nIGhpZ2hsaWdodHNcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyVGlsZXMoKTtcbiAgICAgICAgICAgICAgICAvLyBjbGVhciBoaWdobGlnaHRlZCBmbGFnXG4gICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZ2V0IGxheWVyIGNvb3JkXG4gICAgICAgICAgICB2YXIgbGF5ZXJQb2ludCA9IHRoaXMuX2dldExheWVyUG9pbnRGcm9tRXZlbnQoZSk7XG4gICAgICAgICAgICAvLyBnZXQgdGlsZSBjb29yZFxuICAgICAgICAgICAgdmFyIGNvb3JkID0gdGhpcy5fZ2V0VGlsZUNvb3JkRnJvbUxheWVyUG9pbnQobGF5ZXJQb2ludCk7XG4gICAgICAgICAgICAvLyBnZXQgY2FjaGUga2V5XG4gICAgICAgICAgICB2YXIgbmtleSA9IHRoaXMuY2FjaGVLZXlGcm9tQ29vcmQoY29vcmQsIHRydWUpO1xuICAgICAgICAgICAgLy8gZ2V0IGNhY2hlIGVudHJ5XG4gICAgICAgICAgICB2YXIgY2FjaGVkID0gdGhpcy5fY2FjaGVbbmtleV07XG4gICAgICAgICAgICBpZiAoY2FjaGVkICYmIGNhY2hlZC5waXhlbHMpIHtcbiAgICAgICAgICAgICAgICAvLyBnZXQgYmluIGNvb3JkaW5hdGVcbiAgICAgICAgICAgICAgICB2YXIgYmluID0gdGhpcy5fZ2V0QmluQ29vcmRGcm9tTGF5ZXJQb2ludChsYXllclBvaW50KTtcbiAgICAgICAgICAgICAgICAvLyBkb3duc2FtcGxlIHRoZSBiaW4gcmVzXG4gICAgICAgICAgICAgICAgdmFyIHggPSBNYXRoLmZsb29yKGJpbi54IC8gdGhpcy5vcHRpb25zLmRvd25TYW1wbGVGYWN0b3IpO1xuICAgICAgICAgICAgICAgIHZhciB5ID0gTWF0aC5mbG9vcihiaW4ueSAvIHRoaXMub3B0aW9ucy5kb3duU2FtcGxlRmFjdG9yKTtcbiAgICAgICAgICAgICAgICAvLyBpZiBoaXRzIGEgcGl4ZWxcbiAgICAgICAgICAgICAgICBpZiAoY2FjaGVkLnBpeGVsc1t4XSAmJiBjYWNoZWQucGl4ZWxzW3hdW3ldKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpZHMgPSBPYmplY3Qua2V5cyhjYWNoZWQucGl4ZWxzW3hdW3ldKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGFrZSBmaXJzdCBlbnRyeVxuICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSBpZHNbMF07XG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciBlYWNoIGNhY2hlIGVudHJ5XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgICAgICAgICAgXy5mb3JJbih0aGlzLl9jYWNoZSwgZnVuY3Rpb24oY2FjaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGVkLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3IgZWFjaCB0aWxlIHJlbHlpbmcgb24gdGhhdCBkYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JJbihjYWNoZWQudGlsZXMsIGZ1bmN0aW9uKHRpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRyYWlsID0gY2FjaGVkLnRyYWlsc1tpZF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cmFpbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5faGlnaGxpZ2h0VHJhaWwodGlsZSwgdHJhaWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAvLyBleGVjdXRlIGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGFuZGxlcnMubW91c2Vtb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuaGFuZGxlcnMubW91c2Vtb3ZlKHRhcmdldCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBjb29yZC54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGNvb3JkLnosXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgejogY29vcmQueixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBieDogYmluLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnk6IGJpbi55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0b3AtdHJhaWxzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXllcjogdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gZmxhZyBhcyBoaWdobGlnaHRlZFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGFuZGxlcnMubW91c2Vtb3ZlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmhhbmRsZXJzLm1vdXNlbW92ZSh0YXJnZXQsIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9oaWdobGlnaHRUcmFpbDogZnVuY3Rpb24oY2FudmFzLCBwaXhlbHMpIHtcbiAgICAgICAgICAgIHZhciByZXNvbHV0aW9uID0gdGhpcy5nZXRSZXNvbHV0aW9uKCkgfHwgdGhpcy5vcHRpb25zLnRpbGVTaXplO1xuICAgICAgICAgICAgdmFyIGhpZ2hsaWdodCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgICAgaGlnaGxpZ2h0LmhlaWdodCA9IHJlc29sdXRpb247XG4gICAgICAgICAgICBoaWdobGlnaHQud2lkdGggPSByZXNvbHV0aW9uO1xuICAgICAgICAgICAgdmFyIGhpZ2hsaWdodEN0eCA9IGhpZ2hsaWdodC5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgdmFyIGltYWdlRGF0YSA9IGhpZ2hsaWdodEN0eC5nZXRJbWFnZURhdGEoMCwgMCwgcmVzb2x1dGlvbiwgcmVzb2x1dGlvbik7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGltYWdlRGF0YS5kYXRhO1xuICAgICAgICAgICAgdmFyIHBpeGVsLCB4LCB5LCBpLCBqO1xuICAgICAgICAgICAgZm9yIChpPTA7IGk8cGl4ZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcGl4ZWwgPSBwaXhlbHNbaV07XG4gICAgICAgICAgICAgICAgeCA9IHBpeGVsWzBdO1xuICAgICAgICAgICAgICAgIHkgPSBwaXhlbFsxXTtcbiAgICAgICAgICAgICAgICBqID0geCArIChyZXNvbHV0aW9uICogeSk7XG4gICAgICAgICAgICAgICAgZGF0YVtqICogNF0gPSB0aGlzLm9wdGlvbnMuY29sb3JbMF07XG4gICAgICAgICAgICAgICAgZGF0YVtqICogNCArIDFdID0gdGhpcy5vcHRpb25zLmNvbG9yWzFdO1xuICAgICAgICAgICAgICAgIGRhdGFbaiAqIDQgKyAyXSA9IHRoaXMub3B0aW9ucy5jb2xvclsyXTtcbiAgICAgICAgICAgICAgICBkYXRhW2ogKiA0ICsgM10gPSB0aGlzLm9wdGlvbnMuY29sb3JbM107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBoaWdobGlnaHRDdHgucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG4gICAgICAgICAgICAvLyBkcmF3IHRvIHRpbGVcbiAgICAgICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0LFxuICAgICAgICAgICAgICAgIDAsIDAsXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbiwgcmVzb2x1dGlvbixcbiAgICAgICAgICAgICAgICAwLCAwLFxuICAgICAgICAgICAgICAgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVuZGVyVGlsZTogZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBjb29yZCkge1xuICAgICAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZW5zdXJlIHRpbGUgYWNjZXB0cyBtb3VzZSBldmVudHNcbiAgICAgICAgICAgICQoY29udGFpbmVyKS5jc3MoJ3BvaW50ZXItZXZlbnRzJywgJ2FsbCcpO1xuICAgICAgICAgICAgLy8gbW9kaWZ5IGNhY2hlIGVudHJ5XG4gICAgICAgICAgICB2YXIgbmtleSA9IHRoaXMuY2FjaGVLZXlGcm9tQ29vcmQoY29vcmQsIHRydWUpO1xuICAgICAgICAgICAgdmFyIGNhY2hlZCA9IHRoaXMuX2NhY2hlW25rZXldO1xuICAgICAgICAgICAgaWYgKGNhY2hlZC50cmFpbHMpIHtcbiAgICAgICAgICAgICAgICAvLyB0cmFpbHMgYWxyZWFkeSBhZGRlZCwgZXhpdCBlYXJseVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB0cmFpbHMgPSBjYWNoZWQudHJhaWxzID0ge307XG4gICAgICAgICAgICB2YXIgcGl4ZWxzID0gY2FjaGVkLnBpeGVscyA9IHt9O1xuICAgICAgICAgICAgdmFyIGlkcyAgPSBPYmplY3Qua2V5cyhkYXRhKTtcbiAgICAgICAgICAgIHZhciBiaW5zLCBiaW47XG4gICAgICAgICAgICB2YXIgaWQsIGksIGo7XG4gICAgICAgICAgICB2YXIgcngsIHJ5LCB4LCB5O1xuICAgICAgICAgICAgZm9yIChpPTA7IGk8aWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWQgPSBpZHNbaV07XG4gICAgICAgICAgICAgICAgYmlucyA9IGRhdGFbaWRdO1xuICAgICAgICAgICAgICAgIGZvciAoaj0wOyBqPGJpbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYmluID0gYmluc1tqXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZG93biBzYW1wbGUgdGhlIHBpeGVsIHRvIG1ha2UgaW50ZXJhY3Rpb24gZWFzaWVyXG4gICAgICAgICAgICAgICAgICAgIHJ4ID0gTWF0aC5mbG9vcihiaW5bMF0gLyB0aGlzLm9wdGlvbnMuZG93blNhbXBsZUZhY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgIHJ5ID0gTWF0aC5mbG9vcihiaW5bMV0gLyB0aGlzLm9wdGlvbnMuZG93blNhbXBsZUZhY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgIHBpeGVsc1tyeF0gPSBwaXhlbHNbcnhdIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICBwaXhlbHNbcnhdW3J5XSA9IHBpeGVsc1tyeF1bcnldIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICBwaXhlbHNbcnhdW3J5XVtpZF0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgcGl4ZWwgdW5kZXIgdGhlIHRyYWlsIGF0IGNvcnJlY3QgcmVzb2x1dGlvblxuICAgICAgICAgICAgICAgICAgICB4ID0gYmluWzBdO1xuICAgICAgICAgICAgICAgICAgICB5ID0gYmluWzFdO1xuICAgICAgICAgICAgICAgICAgICB0cmFpbHNbaWRdID0gdHJhaWxzW2lkXSB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgdHJhaWxzW2lkXS5wdXNoKFsgeCwgeSBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUb3BUcmFpbHM7XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgICAgICByZW5kZXJUaWxlOiBmdW5jdGlvbihlbGVtLCBjb29yZCkge1xuICAgICAgICAgICAgJChlbGVtKS5lbXB0eSgpO1xuICAgICAgICAgICAgJChlbGVtKS5hcHBlbmQoJzxkaXYgc3R5bGU9XCJ0b3A6MDsgbGVmdDowO1wiPicgKyBjb29yZC56ICsgJywgJyArIGNvb3JkLnggKyAnLCAnICsgY29vcmQueSArICc8L2Rpdj4nKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBIVE1MID0gcmVxdWlyZSgnLi4vLi4vY29yZS9IVE1MJyk7XG5cbiAgICB2YXIgSGVhdG1hcCA9IEhUTUwuZXh0ZW5kKHtcblxuICAgICAgICBpc1RhcmdldExheWVyOiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb250YWluZXIgJiYgJC5jb250YWlucyh0aGlzLl9jb250YWluZXIsIGVsZW0gKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbk1vdXNlT3ZlcjogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIHRhcmdldCA9ICQoZS5vcmlnaW5hbEV2ZW50LnRhcmdldCk7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB0YXJnZXQuYXR0cignZGF0YS12YWx1ZScpO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5oYW5kbGVycy5tb3VzZW92ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyICRwYXJlbnQgPSB0YXJnZXQucGFyZW50cygnLmxlYWZsZXQtaHRtbC10aWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5oYW5kbGVycy5tb3VzZW92ZXIodGFyZ2V0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcGFyc2VJbnQodmFsdWUsIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHBhcnNlSW50KCRwYXJlbnQuYXR0cignZGF0YS14JyksIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHBhcnNlSW50KCRwYXJlbnQuYXR0cignZGF0YS15JyksIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHo6IHRoaXMuX21hcC5nZXRab29tKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBieDogcGFyc2VJbnQodGFyZ2V0LmF0dHIoJ2RhdGEtYngnKSwgMTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnk6IHBhcnNlSW50KHRhcmdldC5hdHRyKCdkYXRhLWJ5JyksIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdoZWF0bWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyOiB0aGlzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbk1vdXNlT3V0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJChlLm9yaWdpbmFsRXZlbnQudGFyZ2V0KTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRhcmdldC5hdHRyKCdkYXRhLXZhbHVlJyk7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmhhbmRsZXJzLm1vdXNlb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciAkcGFyZW50ID0gdGFyZ2V0LnBhcmVudHMoJy5sZWFmbGV0LWh0bWwtdGlsZScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuaGFuZGxlcnMubW91c2VvdXQodGFyZ2V0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBwYXJzZUludCgkcGFyZW50LmF0dHIoJ2RhdGEteCcpLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBwYXJzZUludCgkcGFyZW50LmF0dHIoJ2RhdGEteScpLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICB6OiB0aGlzLl9tYXAuZ2V0Wm9vbSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgYng6IHBhcnNlSW50KHRhcmdldC5hdHRyKCdkYXRhLWJ4JyksIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5OiBwYXJzZUludCh0YXJnZXQuYXR0cignZGF0YS1ieScpLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaGVhdG1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXllcjogdGhpc1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgLy8gdW4tc2VsZWN0IGFueSBwcmV2IHNlbGVjdGVkIHBpeGVsXG4gICAgICAgICAgICAkKCcuaGVhdG1hcC1waXhlbCcpLnJlbW92ZUNsYXNzKCdoaWdobGlnaHQnKTtcbiAgICAgICAgICAgIC8vIGdldCB0YXJnZXRcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKGUub3JpZ2luYWxFdmVudC50YXJnZXQpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVGFyZ2V0TGF5ZXIoZS5vcmlnaW5hbEV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGxheWVyIGlzIG5vdCB0aGUgdGFyZ2V0XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCB0YXJnZXQuaGFzQ2xhc3MoJ2hlYXRtYXAtcGl4ZWwnKSApIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQuYWRkQ2xhc3MoJ2hpZ2hsaWdodCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGFyZ2V0LmF0dHIoJ2RhdGEtdmFsdWUnKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGFuZGxlcnMuY2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyICRwYXJlbnQgPSB0YXJnZXQucGFyZW50cygnLmxlYWZsZXQtaHRtbC10aWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5oYW5kbGVycy5jbGljayh0YXJnZXQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHBhcnNlSW50KCRwYXJlbnQuYXR0cignZGF0YS14JyksIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHBhcnNlSW50KCRwYXJlbnQuYXR0cignZGF0YS15JyksIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHo6IHRoaXMuX21hcC5nZXRab29tKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBieDogcGFyc2VJbnQodGFyZ2V0LmF0dHIoJ2RhdGEtYngnKSwgMTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnk6IHBhcnNlSW50KHRhcmdldC5hdHRyKCdkYXRhLWJ5JyksIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdoZWF0bWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyOiB0aGlzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXJUaWxlOiBmdW5jdGlvbihjb250YWluZXIsIGRhdGEpIHtcbiAgICAgICAgICAgIGlmICghZGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBiaW5zID0gbmV3IEZsb2F0NjRBcnJheShkYXRhKTtcbiAgICAgICAgICAgIHZhciByZXNvbHV0aW9uID0gTWF0aC5zcXJ0KGJpbnMubGVuZ3RoKTtcbiAgICAgICAgICAgIHZhciByYW1wRnVuYyA9IHRoaXMuZ2V0Q29sb3JSYW1wKCk7XG4gICAgICAgICAgICB2YXIgcGl4ZWxTaXplID0gdGhpcy5vcHRpb25zLnRpbGVTaXplIC8gcmVzb2x1dGlvbjtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHZhciBjb2xvciA9IFswLCAwLCAwLCAwXTtcbiAgICAgICAgICAgIHZhciBodG1sID0gJyc7XG4gICAgICAgICAgICB2YXIgbnZhbCwgcnZhbCwgYmluO1xuICAgICAgICAgICAgdmFyIGxlZnQsIHRvcDtcbiAgICAgICAgICAgIHZhciBpO1xuICAgICAgICAgICAgZm9yIChpPTA7IGk8Ymlucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGJpbiA9IGJpbnNbaV07XG4gICAgICAgICAgICAgICAgaWYgKGJpbiA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZWZ0ID0gKGkgJSByZXNvbHV0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gTWF0aC5mbG9vcihpIC8gcmVzb2x1dGlvbik7XG4gICAgICAgICAgICAgICAgICAgIG52YWwgPSBzZWxmLnRyYW5zZm9ybVZhbHVlKGJpbik7XG4gICAgICAgICAgICAgICAgICAgIHJ2YWwgPSBzZWxmLmludGVycG9sYXRlVG9SYW5nZShudmFsKTtcbiAgICAgICAgICAgICAgICAgICAgcmFtcEZ1bmMocnZhbCwgY29sb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgcmdiYSA9ICdyZ2JhKCcgK1xuICAgICAgICAgICAgICAgICAgICBjb2xvclswXSArICcsJyArXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yWzFdICsgJywnICtcbiAgICAgICAgICAgICAgICAgICAgY29sb3JbMl0gKyAnLCcgK1xuICAgICAgICAgICAgICAgICAgICAoY29sb3JbM10gLyAyNTUpICsgJyknO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJoZWF0bWFwLXBpeGVsXCIgJyArXG4gICAgICAgICAgICAgICAgICAgICdkYXRhLXZhbHVlPVwiJyArIGJpbiArICdcIiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtYng9XCInICsgbGVmdCArICdcIiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtYnk9XCInICsgdG9wICsgJ1wiICcgK1xuICAgICAgICAgICAgICAgICAgICAnc3R5bGU9XCInICtcbiAgICAgICAgICAgICAgICAgICAgJ2hlaWdodDonICsgcGl4ZWxTaXplICsgJ3B4OycgK1xuICAgICAgICAgICAgICAgICAgICAnd2lkdGg6JyArIHBpeGVsU2l6ZSArICdweDsnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlZnQ6JyArIChsZWZ0ICogcGl4ZWxTaXplKSArICdweDsnICtcbiAgICAgICAgICAgICAgICAgICAgJ3RvcDonICsgKHRvcCAqIHBpeGVsU2l6ZSkgKyAncHg7JyArXG4gICAgICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yOicgKyByZ2JhICsgJztcIj48L2Rpdj4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBIZWF0bWFwO1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEhUTUwgPSByZXF1aXJlKCcuLi8uLi9jb3JlL0hUTUwnKTtcblxuICAgIHZhciBIZWF0bWFwID0gSFRNTC5leHRlbmQoe1xuXG4gICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKGUub3JpZ2luYWxFdmVudC50YXJnZXQpO1xuICAgICAgICAgICAgJCgnLmhlYXRtYXAtcmluZycpLnJlbW92ZUNsYXNzKCdoaWdobGlnaHQnKTtcbiAgICAgICAgICAgIGlmICggdGFyZ2V0Lmhhc0NsYXNzKCdoZWF0bWFwLXJpbmcnKSApIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQuYWRkQ2xhc3MoJ2hpZ2hsaWdodCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlbmRlclRpbGU6IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSkge1xuICAgICAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIGJpbnMgPSBuZXcgRmxvYXQ2NEFycmF5KGRhdGEpO1xuICAgICAgICAgICAgdmFyIHJlc29sdXRpb24gPSBNYXRoLnNxcnQoYmlucy5sZW5ndGgpO1xuICAgICAgICAgICAgdmFyIGJpblNpemUgPSAodGhpcy5vcHRpb25zLnRpbGVTaXplIC8gcmVzb2x1dGlvbik7XG4gICAgICAgICAgICB2YXIgaHRtbCA9ICcnO1xuICAgICAgICAgICAgYmlucy5mb3JFYWNoKGZ1bmN0aW9uKGJpbiwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWJpbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBwZXJjZW50ID0gc2VsZi50cmFuc2Zvcm1WYWx1ZShiaW4pO1xuICAgICAgICAgICAgICAgIHZhciByYWRpdXMgPSBwZXJjZW50ICogYmluU2l6ZTtcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gKGJpblNpemUgLSByYWRpdXMpIC8gMjtcbiAgICAgICAgICAgICAgICB2YXIgbGVmdCA9IChpbmRleCAlIHJlc29sdXRpb24pICogYmluU2l6ZTtcbiAgICAgICAgICAgICAgICB2YXIgdG9wID0gTWF0aC5mbG9vcihpbmRleCAvIHJlc29sdXRpb24pICogYmluU2l6ZTtcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiaGVhdG1hcC1yaW5nXCIgc3R5bGU9XCInICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlZnQ6JyArIChsZWZ0ICsgb2Zmc2V0KSArICdweDsnICtcbiAgICAgICAgICAgICAgICAgICAgJ3RvcDonICsgKHRvcCArIG9mZnNldCkgKyAncHg7JyArXG4gICAgICAgICAgICAgICAgICAgICd3aWR0aDonICsgcmFkaXVzICsgJ3B4OycgK1xuICAgICAgICAgICAgICAgICAgICAnaGVpZ2h0OicgKyByYWRpdXMgKyAncHg7JyArXG4gICAgICAgICAgICAgICAgICAgICdcIj48L2Rpdj4nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IEhlYXRtYXA7XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgSFRNTCA9IHJlcXVpcmUoJy4uLy4uL2NvcmUvSFRNTCcpO1xuICAgIHZhciBzZW50aW1lbnQgPSByZXF1aXJlKCcuLi8uLi9zZW50aW1lbnQvU2VudGltZW50Jyk7XG4gICAgdmFyIHNlbnRpbWVudEZ1bmMgPSBzZW50aW1lbnQuZ2V0Q2xhc3NGdW5jKC0xLCAxKTtcblxuICAgIHZhciBWRVJUSUNBTF9PRkZTRVQgPSAyNDtcbiAgICB2YXIgSE9SSVpPTlRBTF9PRkZTRVQgPSAxMDtcbiAgICB2YXIgTlVNX0FUVEVNUFRTID0gMTtcblxuICAgIC8qKlxuICAgICAqIEdpdmVuIGFuIGluaXRpYWwgcG9zaXRpb24sIHJldHVybiBhIG5ldyBwb3NpdGlvbiwgaW5jcmVtZW50YWxseSBzcGlyYWxsZWRcbiAgICAgKiBvdXR3YXJkcy5cbiAgICAgKi9cbiAgICB2YXIgc3BpcmFsUG9zaXRpb24gPSBmdW5jdGlvbihwb3MpIHtcbiAgICAgICAgdmFyIHBpMiA9IDIgKiBNYXRoLlBJO1xuICAgICAgICB2YXIgY2lyYyA9IHBpMiAqIHBvcy5yYWRpdXM7XG4gICAgICAgIHZhciBpbmMgPSAocG9zLmFyY0xlbmd0aCA+IGNpcmMgLyAxMCkgPyBjaXJjIC8gMTAgOiBwb3MuYXJjTGVuZ3RoO1xuICAgICAgICB2YXIgZGEgPSBpbmMgLyBwb3MucmFkaXVzO1xuICAgICAgICB2YXIgbnQgPSAocG9zLnQgKyBkYSk7XG4gICAgICAgIGlmIChudCA+IHBpMikge1xuICAgICAgICAgICAgbnQgPSBudCAlIHBpMjtcbiAgICAgICAgICAgIHBvcy5yYWRpdXMgPSBwb3MucmFkaXVzICsgcG9zLnJhZGl1c0luYztcbiAgICAgICAgfVxuICAgICAgICBwb3MudCA9IG50O1xuICAgICAgICBwb3MueCA9IHBvcy5yYWRpdXMgKiBNYXRoLmNvcyhudCk7XG4gICAgICAgIHBvcy55ID0gcG9zLnJhZGl1cyAqIE1hdGguc2luKG50KTtcbiAgICAgICAgcmV0dXJuIHBvcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogIFJldHVybnMgdHJ1ZSBpZiBib3VuZGluZyBib3ggYSBpbnRlcnNlY3RzIGJvdW5kaW5nIGJveCBiXG4gICAgICovXG4gICAgdmFyIGludGVyc2VjdFRlc3QgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiAoTWF0aC5hYnMoYS54IC0gYi54KSAqIDIgPCAoYS53aWR0aCArIGIud2lkdGgpKSAmJlxuICAgICAgICAgICAgKE1hdGguYWJzKGEueSAtIGIueSkgKiAyIDwgKGEuaGVpZ2h0ICsgYi5oZWlnaHQpKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogIFJldHVybnMgdHJ1ZSBpZiBib3VuZGluZyBib3ggYSBpcyBub3QgZnVsbHkgY29udGFpbmVkIGluc2lkZSBib3VuZGluZyBib3ggYlxuICAgICAqL1xuICAgIHZhciBvdmVybGFwVGVzdCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIChhLnggKyBhLndpZHRoIC8gMiA+IGIueCArIGIud2lkdGggLyAyIHx8XG4gICAgICAgICAgICBhLnggLSBhLndpZHRoIC8gMiA8IGIueCAtIGIud2lkdGggLyAyIHx8XG4gICAgICAgICAgICBhLnkgKyBhLmhlaWdodCAvIDIgPiBiLnkgKyBiLmhlaWdodCAvIDIgfHxcbiAgICAgICAgICAgIGEueSAtIGEuaGVpZ2h0IC8gMiA8IGIueSAtIGIuaGVpZ2h0IC8gMik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgd29yZCBpbnRlcnNlY3RzIGFub3RoZXIgd29yZCwgb3IgaXMgbm90IGZ1bGx5IGNvbnRhaW5lZCBpbiB0aGVcbiAgICAgKiB0aWxlIGJvdW5kaW5nIGJveFxuICAgICAqL1xuICAgIHZhciBpbnRlcnNlY3RXb3JkID0gZnVuY3Rpb24ocG9zaXRpb24sIHdvcmQsIGNsb3VkLCBiYikge1xuICAgICAgICB2YXIgYm94ID0ge1xuICAgICAgICAgICAgeDogcG9zaXRpb24ueCxcbiAgICAgICAgICAgIHk6IHBvc2l0aW9uLnksXG4gICAgICAgICAgICBoZWlnaHQ6IHdvcmQuaGVpZ2h0LFxuICAgICAgICAgICAgd2lkdGg6IHdvcmQud2lkdGhcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjbG91ZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGludGVyc2VjdFRlc3QoYm94LCBjbG91ZFtpXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBtYWtlIHN1cmUgaXQgZG9lc24ndCBpbnRlcnNlY3QgdGhlIGJvcmRlcjtcbiAgICAgICAgaWYgKG92ZXJsYXBUZXN0KGJveCwgYmIpKSB7XG4gICAgICAgICAgICAvLyBpZiBpdCBoaXRzIGEgYm9yZGVyLCBpbmNyZW1lbnQgY29sbGlzaW9uIGNvdW50XG4gICAgICAgICAgICAvLyBhbmQgZXh0ZW5kIGFyYyBsZW5ndGhcbiAgICAgICAgICAgIHBvc2l0aW9uLmNvbGxpc2lvbnMrKztcbiAgICAgICAgICAgIHBvc2l0aW9uLmFyY0xlbmd0aCA9IHBvc2l0aW9uLnJhZGl1cztcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgdmFyIFdvcmRDbG91ZCA9IEhUTUwuZXh0ZW5kKHtcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBtYXhOdW1Xb3JkczogMTUsXG4gICAgICAgICAgICBtaW5Gb250U2l6ZTogMTAsXG4gICAgICAgICAgICBtYXhGb250U2l6ZTogMjBcbiAgICAgICAgfSxcblxuICAgICAgICBpc1RhcmdldExheWVyOiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb250YWluZXIgJiYgJC5jb250YWlucyh0aGlzLl9jb250YWluZXIsIGVsZW0gKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhclNlbGVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKHRoaXMuX2NvbnRhaW5lcikucmVtb3ZlQ2xhc3MoJ2hpZ2hsaWdodCcpO1xuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHQgPSBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uTW91c2VPdmVyOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJChlLm9yaWdpbmFsRXZlbnQudGFyZ2V0KTtcbiAgICAgICAgICAgICQoJy53b3JkLWNsb3VkLWxhYmVsJykucmVtb3ZlQ2xhc3MoJ2hvdmVyJyk7XG4gICAgICAgICAgICB2YXIgd29yZCA9IHRhcmdldC5hdHRyKCdkYXRhLXdvcmQnKTtcbiAgICAgICAgICAgIGlmICh3b3JkKSB7XG4gICAgICAgICAgICAgICAgJCgnLndvcmQtY2xvdWQtbGFiZWxbZGF0YS13b3JkPScgKyB3b3JkICsgJ10nKS5hZGRDbGFzcygnaG92ZXInKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmhhbmRsZXJzLm1vdXNlb3Zlcikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHBhcmVudCA9IHRhcmdldC5wYXJlbnRzKCcubGVhZmxldC1odG1sLXRpbGUnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmhhbmRsZXJzLm1vdXNlb3Zlcih0YXJnZXQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB3b3JkLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogcGFyc2VJbnQoJHBhcmVudC5hdHRyKCdkYXRhLXgnKSwgMTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogcGFyc2VJbnQoJHBhcmVudC5hdHRyKCdkYXRhLXknKSwgMTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgejogdGhpcy5fbWFwLmdldFpvb20oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd3b3JkLWNsb3VkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyOiB0aGlzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbk1vdXNlT3V0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJChlLm9yaWdpbmFsRXZlbnQudGFyZ2V0KTtcbiAgICAgICAgICAgICQoJy53b3JkLWNsb3VkLWxhYmVsJykucmVtb3ZlQ2xhc3MoJ2hvdmVyJyk7XG4gICAgICAgICAgICB2YXIgd29yZCA9IHRhcmdldC5hdHRyKCdkYXRhLXdvcmQnKTtcbiAgICAgICAgICAgIGlmICh3b3JkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5oYW5kbGVycy5tb3VzZW91dCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHBhcmVudCA9IHRhcmdldC5wYXJlbnRzKCcubGVhZmxldC1odG1sLXRpbGUnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmhhbmRsZXJzLm1vdXNlb3V0KHRhcmdldCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHdvcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBwYXJzZUludCgkcGFyZW50LmF0dHIoJ2RhdGEteCcpLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBwYXJzZUludCgkcGFyZW50LmF0dHIoJ2RhdGEteScpLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICB6OiB0aGlzLl9tYXAuZ2V0Wm9vbSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3dvcmQtY2xvdWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXI6IHRoaXNcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIC8vIHVuLXNlbGVjdCBhbnkgcHJldiBzZWxlY3RlZCB3b3Jkc1xuICAgICAgICAgICAgJCgnLndvcmQtY2xvdWQtbGFiZWwnKS5yZW1vdmVDbGFzcygnaGlnaGxpZ2h0Jyk7XG4gICAgICAgICAgICAkKHRoaXMuX2NvbnRhaW5lcikucmVtb3ZlQ2xhc3MoJ2hpZ2hsaWdodCcpO1xuICAgICAgICAgICAgLy8gZ2V0IHRhcmdldFxuICAgICAgICAgICAgdmFyIHRhcmdldCA9ICQoZS5vcmlnaW5hbEV2ZW50LnRhcmdldCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNUYXJnZXRMYXllcihlLm9yaWdpbmFsRXZlbnQudGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgbGF5ZXIgaXMgbm90IHRoZSB0YXJnZXRcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgd29yZCA9IHRhcmdldC5hdHRyKCdkYXRhLXdvcmQnKTtcbiAgICAgICAgICAgIGlmICh3b3JkKSB7XG4gICAgICAgICAgICAgICAgJCh0aGlzLl9jb250YWluZXIpLmFkZENsYXNzKCdoaWdobGlnaHQnKTtcbiAgICAgICAgICAgICAgICAkKCcud29yZC1jbG91ZC1sYWJlbFtkYXRhLXdvcmQ9JyArIHdvcmQgKyAnXScpLmFkZENsYXNzKCdoaWdobGlnaHQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodCA9IHdvcmQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5oYW5kbGVycy5jbGljaykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHBhcmVudCA9IHRhcmdldC5wYXJlbnRzKCcubGVhZmxldC1odG1sLXRpbGUnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmhhbmRsZXJzLmNsaWNrKHRhcmdldCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHdvcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBwYXJzZUludCgkcGFyZW50LmF0dHIoJ2RhdGEteCcpLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBwYXJzZUludCgkcGFyZW50LmF0dHIoJ2RhdGEteScpLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICB6OiB0aGlzLl9tYXAuZ2V0Wm9vbSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3dvcmQtY2xvdWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXI6IHRoaXNcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX21lYXN1cmVXb3JkczogZnVuY3Rpb24od29yZENvdW50cykge1xuICAgICAgICAgICAgLy8gc29ydCB3b3JkcyBieSBmcmVxdWVuY3lcbiAgICAgICAgICAgIHdvcmRDb3VudHMgPSB3b3JkQ291bnRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBiLmNvdW50IC0gYS5jb3VudDtcbiAgICAgICAgICAgIH0pLnNsaWNlKDAsIHRoaXMub3B0aW9ucy5tYXhOdW1Xb3Jkcyk7XG4gICAgICAgICAgICAvLyBidWlsZCBtZWFzdXJlbWVudCBodG1sXG4gICAgICAgICAgICB2YXIgaHRtbCA9ICc8ZGl2IHN0eWxlPVwiaGVpZ2h0OjI1NnB4OyB3aWR0aDoyNTZweDtcIj4nO1xuICAgICAgICAgICAgdmFyIG1pbkZvbnRTaXplID0gdGhpcy5vcHRpb25zLm1pbkZvbnRTaXplO1xuICAgICAgICAgICAgdmFyIG1heEZvbnRTaXplID0gdGhpcy5vcHRpb25zLm1heEZvbnRTaXplO1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgd29yZENvdW50cy5mb3JFYWNoKGZ1bmN0aW9uKHdvcmQpIHtcbiAgICAgICAgICAgICAgICB3b3JkLnBlcmNlbnQgPSBzZWxmLnRyYW5zZm9ybVZhbHVlKHdvcmQuY291bnQpO1xuICAgICAgICAgICAgICAgIHdvcmQuZm9udFNpemUgPSBtaW5Gb250U2l6ZSArIHdvcmQucGVyY2VudCAqIChtYXhGb250U2l6ZSAtIG1pbkZvbnRTaXplKTtcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwid29yZC1jbG91ZC1sYWJlbFwiIHN0eWxlPVwiJyArXG4gICAgICAgICAgICAgICAgICAgICd2aXNpYmlsaXR5OmhpZGRlbjsnICtcbiAgICAgICAgICAgICAgICAgICAgJ2ZvbnQtc2l6ZTonICsgd29yZC5mb250U2l6ZSArICdweDtcIj4nICsgd29yZC50ZXh0ICsgJzwvZGl2Pic7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGh0bWwgKz0gJzwvZGl2Pic7XG4gICAgICAgICAgICAvLyBhcHBlbmQgbWVhc3VyZW1lbnRzXG4gICAgICAgICAgICB2YXIgJHRlbXAgPSAkKGh0bWwpO1xuICAgICAgICAgICAgJCgnYm9keScpLmFwcGVuZCgkdGVtcCk7XG4gICAgICAgICAgICAkdGVtcC5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB3b3JkQ291bnRzW2luZGV4XS53aWR0aCA9IHRoaXMub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICAgICAgd29yZENvdW50c1tpbmRleF0uaGVpZ2h0ID0gdGhpcy5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICR0ZW1wLnJlbW92ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIHdvcmRDb3VudHM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2NyZWF0ZVdvcmRDbG91ZDogZnVuY3Rpb24od29yZENvdW50cykge1xuICAgICAgICAgICAgdmFyIHRpbGVTaXplID0gdGhpcy5vcHRpb25zLnRpbGVTaXplO1xuICAgICAgICAgICAgdmFyIGJvdW5kaW5nQm94ID0ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB0aWxlU2l6ZSAtIEhPUklaT05UQUxfT0ZGU0VUICogMixcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHRpbGVTaXplIC0gVkVSVElDQUxfT0ZGU0VUICogMixcbiAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgY2xvdWQgPSBbXTtcbiAgICAgICAgICAgIC8vIHNvcnQgd29yZHMgYnkgZnJlcXVlbmN5XG4gICAgICAgICAgICB3b3JkQ291bnRzID0gdGhpcy5fbWVhc3VyZVdvcmRzKHdvcmRDb3VudHMpO1xuICAgICAgICAgICAgLy8gYXNzZW1ibGUgd29yZCBjbG91ZFxuICAgICAgICAgICAgd29yZENvdW50cy5mb3JFYWNoKGZ1bmN0aW9uKHdvcmRDb3VudCkge1xuICAgICAgICAgICAgICAgIC8vIHN0YXJ0aW5nIHNwaXJhbCBwb3NpdGlvblxuICAgICAgICAgICAgICAgIHZhciBwb3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogMSxcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzSW5jOiA1LFxuICAgICAgICAgICAgICAgICAgICBhcmNMZW5ndGg6IDEwLFxuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgICAgICAgICB0OiAwLFxuICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25zOiAwXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvLyBzcGlyYWwgb3V0d2FyZHMgdG8gZmluZCBwb3NpdGlvblxuICAgICAgICAgICAgICAgIHdoaWxlIChwb3MuY29sbGlzaW9ucyA8IE5VTV9BVFRFTVBUUykge1xuICAgICAgICAgICAgICAgICAgICAvLyBpbmNyZW1lbnQgcG9zaXRpb24gaW4gYSBzcGlyYWxcbiAgICAgICAgICAgICAgICAgICAgcG9zID0gc3BpcmFsUG9zaXRpb24ocG9zKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGVzdCBmb3IgaW50ZXJzZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIGlmICghaW50ZXJzZWN0V29yZChwb3MsIHdvcmRDb3VudCwgY2xvdWQsIGJvdW5kaW5nQm94KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvdWQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogd29yZENvdW50LnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IHdvcmRDb3VudC5mb250U2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJjZW50OiBNYXRoLnJvdW5kKCh3b3JkQ291bnQucGVyY2VudCAqIDEwMCkgLyAxMCkgKiAxMCwgLy8gcm91bmQgdG8gbmVhcmVzdCAxMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IHBvcy54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHBvcy55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiB3b3JkQ291bnQud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB3b3JkQ291bnQuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbnRpbWVudDogd29yZENvdW50LnNlbnRpbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmc6IHdvcmRDb3VudC5hdmdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBjbG91ZDtcbiAgICAgICAgfSxcblxuICAgICAgICBleHRyYWN0RXh0cmVtYTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdmFyIHN1bXMgPSBfLm1hcChkYXRhLCBmdW5jdGlvbihjb3VudCkge1xuICAgICAgICAgICAgICAgIGlmIChfLmlzTnVtYmVyKGNvdW50KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBzZW50aW1lbnQuZ2V0VG90YWwoY291bnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1pbjogXy5taW4oc3VtcyksXG4gICAgICAgICAgICAgICAgbWF4OiBfLm1heChzdW1zKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVuZGVyVGlsZTogZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhKSB7XG4gICAgICAgICAgICBpZiAoIWRhdGEgfHwgXy5pc0VtcHR5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGhpZ2hsaWdodCA9IHRoaXMuaGlnaGxpZ2h0O1xuICAgICAgICAgICAgdmFyIHdvcmRDb3VudHMgPSBfLm1hcChkYXRhLCBmdW5jdGlvbihjb3VudCwga2V5KSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uaXNOdW1iZXIoY291bnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogY291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBrZXlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHRvdGFsID0gc2VudGltZW50LmdldFRvdGFsKGNvdW50KTtcbiAgICAgICAgICAgICAgICB2YXIgYXZnID0gc2VudGltZW50LmdldEF2Zyhjb3VudCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IHRvdGFsLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBrZXksXG4gICAgICAgICAgICAgICAgICAgIGF2ZzogYXZnLFxuICAgICAgICAgICAgICAgICAgICBzZW50aW1lbnQ6IHNlbnRpbWVudEZ1bmMoYXZnKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIGV4aXQgZWFybHkgaWYgbm8gd29yZHNcbiAgICAgICAgICAgIGlmICh3b3JkQ291bnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGdlbmVyZWF0ZSB0aGUgY2xvdWRcbiAgICAgICAgICAgIHZhciBjbG91ZCA9IHRoaXMuX2NyZWF0ZVdvcmRDbG91ZCh3b3JkQ291bnRzKTtcbiAgICAgICAgICAgIC8vIGJ1aWxkIGh0bWwgZWxlbWVudHNcbiAgICAgICAgICAgIHZhciBoYWxmU2l6ZSA9IHRoaXMub3B0aW9ucy50aWxlU2l6ZSAvIDI7XG4gICAgICAgICAgICB2YXIgaHRtbCA9ICcnO1xuICAgICAgICAgICAgY2xvdWQuZm9yRWFjaChmdW5jdGlvbih3b3JkKSB7XG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGNsYXNzZXNcbiAgICAgICAgICAgICAgICB2YXIgY2xhc3NOYW1lcyA9IFtcbiAgICAgICAgICAgICAgICAgICAgJ3dvcmQtY2xvdWQtbGFiZWwnLFxuICAgICAgICAgICAgICAgICAgICAnd29yZC1jbG91ZC1sYWJlbC0nICsgd29yZC5wZXJjZW50LFxuICAgICAgICAgICAgICAgICAgICB3b3JkLnRleHQgPT09IGhpZ2hsaWdodCA/ICdoaWdobGlnaHQnIDogJycsXG4gICAgICAgICAgICAgICAgICAgIHdvcmQuc2VudGltZW50ID8gd29yZC5zZW50aW1lbnQgOiAnJ1xuICAgICAgICAgICAgICAgIF0uam9pbignICcpO1xuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBzdHlsZXNcbiAgICAgICAgICAgICAgICB2YXIgc3R5bGVzID0gW1xuICAgICAgICAgICAgICAgICAgICAnZm9udC1zaXplOicgKyB3b3JkLmZvbnRTaXplICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAgICAgJ2xlZnQ6JyArIChoYWxmU2l6ZSArIHdvcmQueCAtICh3b3JkLndpZHRoIC8gMikpICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAgICAgJ3RvcDonICsgKGhhbGZTaXplICsgd29yZC55IC0gKHdvcmQuaGVpZ2h0IC8gMikpICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAgICAgJ3dpZHRoOicgKyB3b3JkLndpZHRoICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAgICAgJ2hlaWdodDonICsgd29yZC5oZWlnaHQgKyAncHgnLFxuICAgICAgICAgICAgICAgIF0uam9pbignOycpO1xuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBodG1sIGZvciBlbnRyeVxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCInICsgY2xhc3NOYW1lcyArICdcIicgK1xuICAgICAgICAgICAgICAgICAgICAnc3R5bGU9XCInICsgc3R5bGVzICsgJ1wiJyArXG4gICAgICAgICAgICAgICAgICAgICdkYXRhLXNlbnRpbWVudD1cIicgKyB3b3JkLmF2ZyArICdcIicgK1xuICAgICAgICAgICAgICAgICAgICAnZGF0YS13b3JkPVwiJyArIHdvcmQudGV4dCArICdcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgd29yZC50ZXh0ICtcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2Pic7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gV29yZENsb3VkO1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEhUTUwgPSByZXF1aXJlKCcuLi8uLi9jb3JlL0hUTUwnKTtcbiAgICB2YXIgc2VudGltZW50ID0gcmVxdWlyZSgnLi4vLi4vc2VudGltZW50L1NlbnRpbWVudCcpO1xuICAgIHZhciBzZW50aW1lbnRGdW5jID0gc2VudGltZW50LmdldENsYXNzRnVuYygtMSwgMSk7XG5cbiAgICB2YXIgaXNTaW5nbGVWYWx1ZSA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgICAgIC8vIHNpbmdsZSB2YWx1ZXMgYXJlIG5ldmVyIG51bGwsIGFuZCBhbHdheXMgbnVtYmVyc1xuICAgICAgICByZXR1cm4gY291bnQgIT09IG51bGwgJiYgXy5pc051bWJlcihjb3VudCk7XG4gICAgfTtcblxuICAgIHZhciBleHRyYWN0Q291bnQgPSBmdW5jdGlvbihjb3VudCkge1xuICAgICAgICBpZiAoaXNTaW5nbGVWYWx1ZShjb3VudCkpIHtcbiAgICAgICAgICAgIHJldHVybiBjb3VudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VudGltZW50LmdldFRvdGFsKGNvdW50KTtcbiAgICB9O1xuXG4gICAgdmFyIGV4dHJhY3RTZW50aW1lbnRDbGFzcyA9IGZ1bmN0aW9uKGF2Zykge1xuICAgICAgICBpZiAoYXZnICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBzZW50aW1lbnRGdW5jKGF2Zyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH07XG5cbiAgICB2YXIgZXh0cmFjdEZyZXF1ZW5jeSA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgICAgIGlmIChpc1NpbmdsZVZhbHVlKGNvdW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb3VudDogY291bnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvdW50OiBzZW50aW1lbnQuZ2V0VG90YWwoY291bnQpLFxuICAgICAgICAgICAgYXZnOiBzZW50aW1lbnQuZ2V0QXZnKGNvdW50KVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICB2YXIgZXh0cmFjdEF2ZyA9IGZ1bmN0aW9uKGZyZXF1ZW5jaWVzKSB7XG4gICAgICAgIGlmIChmcmVxdWVuY2llc1swXS5hdmcgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdW0gPSBfLnN1bUJ5KGZyZXF1ZW5jaWVzLCBmdW5jdGlvbihmcmVxdWVuY3kpIHtcbiAgICAgICAgICAgIHJldHVybiBmcmVxdWVuY3kuYXZnO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHN1bSAvIGZyZXF1ZW5jaWVzLmxlbmd0aDtcbiAgICB9O1xuXG4gICAgdmFyIGV4dHJhY3RWYWx1ZXMgPSBmdW5jdGlvbihkYXRhLCBrZXkpIHtcbiAgICAgICAgdmFyIGZyZXF1ZW5jaWVzID0gXy5tYXAoZGF0YSwgZXh0cmFjdEZyZXF1ZW5jeSk7XG4gICAgICAgIHZhciBhdmcgPSBleHRyYWN0QXZnKGZyZXF1ZW5jaWVzKTtcbiAgICAgICAgdmFyIG1heCA9IF8ubWF4QnkoZnJlcXVlbmNpZXMsIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbC5jb3VudDtcbiAgICAgICAgfSkuY291bnQ7XG4gICAgICAgIHZhciB0b3RhbCA9IF8uc3VtQnkoZnJlcXVlbmNpZXMsIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbC5jb3VudDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3BpYzoga2V5LFxuICAgICAgICAgICAgZnJlcXVlbmNpZXM6IGZyZXF1ZW5jaWVzLFxuICAgICAgICAgICAgbWF4OiBtYXgsXG4gICAgICAgICAgICB0b3RhbDogdG90YWwsXG4gICAgICAgICAgICBhdmc6IGF2Z1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICB2YXIgV29yZEhpc3RvZ3JhbSA9IEhUTUwuZXh0ZW5kKHtcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBtYXhOdW1Xb3JkczogOCxcbiAgICAgICAgICAgIG1pbkZvbnRTaXplOiAxNixcbiAgICAgICAgICAgIG1heEZvbnRTaXplOiAyMlxuICAgICAgICB9LFxuXG4gICAgICAgIGlzVGFyZ2V0TGF5ZXI6IGZ1bmN0aW9uKCBlbGVtICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnRhaW5lciAmJiAkLmNvbnRhaW5zKHRoaXMuX2NvbnRhaW5lciwgZWxlbSApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyU2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQodGhpcy5fY29udGFpbmVyKS5yZW1vdmVDbGFzcygnaGlnaGxpZ2h0Jyk7XG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodCA9IG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Nb3VzZU92ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKGUub3JpZ2luYWxFdmVudC50YXJnZXQpO1xuICAgICAgICAgICAgJCgnLndvcmQtaGlzdG9ncmFtLWVudHJ5JykucmVtb3ZlQ2xhc3MoJ2hvdmVyJyk7XG4gICAgICAgICAgICB2YXIgd29yZCA9IHRhcmdldC5hdHRyKCdkYXRhLXdvcmQnKTtcbiAgICAgICAgICAgIGlmICh3b3JkKSB7XG4gICAgICAgICAgICAgICAgJCgnLndvcmQtaGlzdG9ncmFtLWVudHJ5W2RhdGEtd29yZD0nICsgd29yZCArICddJykuYWRkQ2xhc3MoJ2hvdmVyJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5oYW5kbGVycy5tb3VzZW92ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyICRwYXJlbnQgPSB0YXJnZXQucGFyZW50cygnLmxlYWZsZXQtaHRtbC10aWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5oYW5kbGVycy5tb3VzZW92ZXIodGFyZ2V0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogd29yZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHBhcnNlSW50KCRwYXJlbnQuYXR0cignZGF0YS14JyksIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHBhcnNlSW50KCRwYXJlbnQuYXR0cignZGF0YS15JyksIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHo6IHRoaXMuX21hcC5nZXRab29tKCksXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnd29yZC1oaXN0b2dyYW0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXI6IHRoaXNcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uTW91c2VPdXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKGUub3JpZ2luYWxFdmVudC50YXJnZXQpO1xuICAgICAgICAgICAgJCgnLndvcmQtaGlzdG9ncmFtLWVudHJ5JykucmVtb3ZlQ2xhc3MoJ2hvdmVyJyk7XG4gICAgICAgICAgICB2YXIgd29yZCA9IHRhcmdldC5hdHRyKCdkYXRhLXdvcmQnKTtcbiAgICAgICAgICAgIGlmICh3b3JkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5oYW5kbGVycy5tb3VzZW91dCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHBhcmVudCA9IHRhcmdldC5wYXJlbnRzKCcubGVhZmxldC1odG1sLXRpbGUnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmhhbmRsZXJzLm1vdXNlb3V0KHRhcmdldCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHdvcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBwYXJzZUludCgkcGFyZW50LmF0dHIoJ2RhdGEteCcpLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBwYXJzZUludCgkcGFyZW50LmF0dHIoJ2RhdGEteScpLCAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICB6OiB0aGlzLl9tYXAuZ2V0Wm9vbSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3dvcmQtaGlzdG9ncmFtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyOiB0aGlzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAvLyB1bi1zZWxlY3QgYW5kIHByZXYgc2VsZWN0ZWQgaGlzdG9ncmFtXG4gICAgICAgICAgICAkKCcud29yZC1oaXN0b2dyYW0tZW50cnknKS5yZW1vdmVDbGFzcygnaGlnaGxpZ2h0Jyk7XG4gICAgICAgICAgICAkKHRoaXMuX2NvbnRhaW5lcikucmVtb3ZlQ2xhc3MoJ2hpZ2hsaWdodCcpO1xuICAgICAgICAgICAgLy8gZ2V0IHRhcmdldFxuICAgICAgICAgICAgdmFyIHRhcmdldCA9ICQoZS5vcmlnaW5hbEV2ZW50LnRhcmdldCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNUYXJnZXRMYXllcihlLm9yaWdpbmFsRXZlbnQudGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgbGF5ZXIgaXMgbm90IHRoZSB0YXJnZXRcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgd29yZCA9IHRhcmdldC5hdHRyKCdkYXRhLXdvcmQnKTtcbiAgICAgICAgICAgIGlmICh3b3JkKSB7XG4gICAgICAgICAgICAgICAgJCh0aGlzLl9jb250YWluZXIpLmFkZENsYXNzKCdoaWdobGlnaHQnKTtcbiAgICAgICAgICAgICAgICAkKCcud29yZC1oaXN0b2dyYW0tZW50cnlbZGF0YS13b3JkPScgKyB3b3JkICsgJ10nKS5hZGRDbGFzcygnaGlnaGxpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHQgPSB3b3JkO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGFuZGxlcnMuY2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyICRwYXJlbnQgPSB0YXJnZXQucGFyZW50cygnLmxlYWZsZXQtaHRtbC10aWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5oYW5kbGVycy5jbGljayh0YXJnZXQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB3b3JkLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogcGFyc2VJbnQoJHBhcmVudC5hdHRyKCdkYXRhLXgnKSwgMTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogcGFyc2VJbnQoJHBhcmVudC5hdHRyKCdkYXRhLXknKSwgMTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgejogdGhpcy5fbWFwLmdldFpvb20oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd3b3JkLWhpc3RvZ3JhbScsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXllcjogdGhpc1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBleHRyYWN0RXh0cmVtYTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdmFyIHN1bXMgPSBfLm1hcChkYXRhLCBmdW5jdGlvbihjb3VudHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5zdW1CeShjb3VudHMsIGV4dHJhY3RDb3VudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbWluOiBfLm1pbihzdW1zKSxcbiAgICAgICAgICAgICAgICBtYXg6IF8ubWF4KHN1bXMpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXJUaWxlOiBmdW5jdGlvbihjb250YWluZXIsIGRhdGEpIHtcbiAgICAgICAgICAgIGlmICghZGF0YSB8fCBfLmlzRW1wdHkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaGlnaGxpZ2h0ID0gdGhpcy5oaWdobGlnaHQ7XG4gICAgICAgICAgICAvLyBjb252ZXJ0IG9iamVjdCB0byBhcnJheVxuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IF8ubWFwKGRhdGEsIGV4dHJhY3RWYWx1ZXMpLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBiLnRvdGFsIC0gYS50b3RhbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gZ2V0IG51bWJlciBvZiBlbnRyaWVzXG4gICAgICAgICAgICB2YXIgbnVtRW50cmllcyA9IE1hdGgubWluKHZhbHVlcy5sZW5ndGgsIHRoaXMub3B0aW9ucy5tYXhOdW1Xb3Jkcyk7XG4gICAgICAgICAgICB2YXIgJGh0bWwgPSAkKCc8ZGl2IGNsYXNzPVwid29yZC1oaXN0b2dyYW1zXCIgc3R5bGU9XCJkaXNwbGF5OmlubGluZS1ibG9jaztcIj48L2Rpdj4nKTtcbiAgICAgICAgICAgIHZhciB0b3RhbEhlaWdodCA9IDA7XG4gICAgICAgICAgICB2YXIgbWluRm9udFNpemUgPSB0aGlzLm9wdGlvbnMubWluRm9udFNpemU7XG4gICAgICAgICAgICB2YXIgbWF4Rm9udFNpemUgPSB0aGlzLm9wdGlvbnMubWF4Rm9udFNpemU7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICB2YWx1ZXMuc2xpY2UoMCwgbnVtRW50cmllcykuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciB0b3BpYyA9IHZhbHVlLnRvcGljO1xuICAgICAgICAgICAgICAgIHZhciBmcmVxdWVuY2llcyA9IHZhbHVlLmZyZXF1ZW5jaWVzO1xuICAgICAgICAgICAgICAgIHZhciBtYXggPSB2YWx1ZS5tYXg7XG4gICAgICAgICAgICAgICAgdmFyIHRvdGFsID0gdmFsdWUudG90YWw7XG4gICAgICAgICAgICAgICAgdmFyIGF2ZyA9IHZhbHVlLmF2ZztcbiAgICAgICAgICAgICAgICB2YXIgc2VudGltZW50Q2xhc3MgPSBleHRyYWN0U2VudGltZW50Q2xhc3MoYXZnKTtcbiAgICAgICAgICAgICAgICB2YXIgaGlnaGxpZ2h0Q2xhc3MgPSAodG9waWMgPT09IGhpZ2hsaWdodCkgPyAnaGlnaGxpZ2h0JyA6ICcnO1xuICAgICAgICAgICAgICAgIC8vIHNjYWxlIHRoZSBoZWlnaHQgYmFzZWQgb24gbGV2ZWwgbWluIC8gbWF4XG4gICAgICAgICAgICAgICAgdmFyIHBlcmNlbnQgPSBzZWxmLnRyYW5zZm9ybVZhbHVlKHRvdGFsKTtcbiAgICAgICAgICAgICAgICB2YXIgcGVyY2VudExhYmVsID0gTWF0aC5yb3VuZCgocGVyY2VudCAqIDEwMCkgLyAxMCkgKiAxMDtcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gbWluRm9udFNpemUgKyBwZXJjZW50ICogKG1heEZvbnRTaXplIC0gbWluRm9udFNpemUpO1xuICAgICAgICAgICAgICAgIHRvdGFsSGVpZ2h0ICs9IGhlaWdodDtcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgY29udGFpbmVyICdlbnRyeScgZm9yIGNoYXJ0IGFuZCBoYXNodGFnXG4gICAgICAgICAgICAgICAgdmFyICRlbnRyeSA9ICQoJzxkaXYgY2xhc3M9XCJ3b3JkLWhpc3RvZ3JhbS1lbnRyeSAnICsgaGlnaGxpZ2h0Q2xhc3MgKyAnXCIgJyArXG4gICAgICAgICAgICAgICAgICAgICdkYXRhLXNlbnRpbWVudD1cIicgKyBhdmcgKyAnXCInICtcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtd29yZD1cIicgKyB0b3BpYyArICdcIicgK1xuICAgICAgICAgICAgICAgICAgICAnc3R5bGU9XCInICtcbiAgICAgICAgICAgICAgICAgICAgJ2hlaWdodDonICsgaGVpZ2h0ICsgJ3B4O1wiPjwvZGl2PicpO1xuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBjaGFydFxuICAgICAgICAgICAgICAgIHZhciAkY2hhcnQgPSAkKCc8ZGl2IGNsYXNzPVwid29yZC1oaXN0b2dyYW0tbGVmdFwiJyArXG4gICAgICAgICAgICAgICAgICAgICdkYXRhLXNlbnRpbWVudD1cIicgKyBhdmcgKyAnXCInICtcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtd29yZD1cIicgKyB0b3BpYyArICdcIicgK1xuICAgICAgICAgICAgICAgICAgICAnPjwvZGl2PicpO1xuICAgICAgICAgICAgICAgIHZhciBiYXJXaWR0aCA9ICdjYWxjKCcgKyAoMTAwIC8gZnJlcXVlbmNpZXMubGVuZ3RoKSArICclKSc7XG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGJhcnNcbiAgICAgICAgICAgICAgICBmcmVxdWVuY2llcy5mb3JFYWNoKGZ1bmN0aW9uKGZyZXF1ZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY291bnQgPSBmcmVxdWVuY3kuY291bnQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhdmcgPSBmcmVxdWVuY3kuYXZnO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VudGltZW50Q2xhc3MgPSBleHRyYWN0U2VudGltZW50Q2xhc3MoYXZnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBwZXJjZW50IHJlbGF0aXZlIHRvIHRoZSBoaWdoZXN0IGNvdW50IGluIHRoZSB0aWxlXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWxhdGl2ZVBlcmNlbnQgPSAobWF4ICE9PSAwKSA/IChjb3VudCAvIG1heCkgKiAxMDAgOiAwO1xuICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIGludmlzaWJsZSBpZiB6ZXJvIGNvdW50XG4gICAgICAgICAgICAgICAgICAgIHZhciB2aXNpYmlsaXR5ID0gcmVsYXRpdmVQZXJjZW50ID09PSAwID8gJ2hpZGRlbicgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBzdHlsZSBjbGFzcyBvZiB0aGUgYmFyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwZXJjZW50TGFiZWwgPSBNYXRoLnJvdW5kKHJlbGF0aXZlUGVyY2VudCAvIDEwKSAqIDEwO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFyQ2xhc3NlcyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICd3b3JkLWhpc3RvZ3JhbS1iYXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3dvcmQtaGlzdG9ncmFtLWJhci0nICsgcGVyY2VudExhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VudGltZW50Q2xhc3MgKyAnLWZpbGwnXG4gICAgICAgICAgICAgICAgICAgIF0uam9pbignICcpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFySGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFyVG9wO1xuICAgICAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhlcmUgaXMgYXQgbGVhc3QgYSBzaW5nbGUgcGl4ZWwgb2YgY29sb3JcbiAgICAgICAgICAgICAgICAgICAgaWYgKChyZWxhdGl2ZVBlcmNlbnQgLyAxMDApICogaGVpZ2h0IDwgMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFySGVpZ2h0ID0gJzNweCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXJUb3AgPSAnY2FsYygxMDAlIC0gM3B4KSc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXJIZWlnaHQgPSByZWxhdGl2ZVBlcmNlbnQgKyAnJSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXJUb3AgPSAoMTAwIC0gcmVsYXRpdmVQZXJjZW50KSArICclJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYmFyXG4gICAgICAgICAgICAgICAgICAgICRjaGFydC5hcHBlbmQoJzxkaXYgY2xhc3M9XCInICsgYmFyQ2xhc3NlcyArICdcIicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEtd29yZD1cIicgKyB0b3BpYyArICdcIicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3N0eWxlPVwiJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAndmlzaWJpbGl0eTonICsgdmlzaWJpbGl0eSArICc7JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnd2lkdGg6JyArIGJhcldpZHRoICsgJzsnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdoZWlnaHQ6JyArIGJhckhlaWdodCArICc7JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAndG9wOicgKyBiYXJUb3AgKyAnO1wiPjwvZGl2PicpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICRlbnRyeS5hcHBlbmQoJGNoYXJ0KTtcbiAgICAgICAgICAgICAgICB2YXIgdG9waWNDbGFzc2VzID0gW1xuICAgICAgICAgICAgICAgICAgICAnd29yZC1oaXN0b2dyYW0tbGFiZWwnLFxuICAgICAgICAgICAgICAgICAgICAnd29yZC1oaXN0b2dyYW0tbGFiZWwtJyArIHBlcmNlbnRMYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgc2VudGltZW50Q2xhc3NcbiAgICAgICAgICAgICAgICBdLmpvaW4oJyAnKTtcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGFnIGxhYmVsXG4gICAgICAgICAgICAgICAgdmFyICR0b3BpYyA9ICQoJzxkaXYgY2xhc3M9XCJ3b3JkLWhpc3RvZ3JhbS1yaWdodFwiPicgK1xuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIicgKyB0b3BpY0NsYXNzZXMgKyAnXCInICtcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtc2VudGltZW50PVwiJyArIGF2ZyArICdcIicgK1xuICAgICAgICAgICAgICAgICAgICAnZGF0YS13b3JkPVwiJyArIHRvcGljICsgJ1wiJyArXG4gICAgICAgICAgICAgICAgICAgICdzdHlsZT1cIicgK1xuICAgICAgICAgICAgICAgICAgICAnZm9udC1zaXplOicgKyBoZWlnaHQgKyAncHg7JyArXG4gICAgICAgICAgICAgICAgICAgICdsaW5lLWhlaWdodDonICsgaGVpZ2h0ICsgJ3B4OycgK1xuICAgICAgICAgICAgICAgICAgICAnaGVpZ2h0OicgKyBoZWlnaHQgKyAncHhcIj4nICsgdG9waWMgKyAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nKTtcbiAgICAgICAgICAgICAgICAkZW50cnkuYXBwZW5kKCR0b3BpYyk7XG4gICAgICAgICAgICAgICAgJGh0bWwuYXBwZW5kKCRlbnRyeSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRodG1sLmNzcygndG9wJywgKCB0aGlzLm9wdGlvbnMudGlsZVNpemUgLyAyICkgLSAodG90YWxIZWlnaHQgLyAyKSk7XG4gICAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJGh0bWxbMF0ub3V0ZXJIVE1MO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFdvcmRIaXN0b2dyYW07XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgREVMQVkgPSAxMjAwO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICAgICAgcmVuZGVyVGlsZTogZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdmFyIGRlbGF5ID0gLShNYXRoLnJhbmRvbSgpICogREVMQVkpICsgJ21zJztcbiAgICAgICAgICAgIGVsZW0uaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJibGlua2luZyBibGlua2luZy10aWxlXCIgc3R5bGU9XCJhbmltYXRpb24tZGVsYXk6JyArIGRlbGF5ICsgJ1wiPjwvZGl2Pic7XG4gICAgICAgIH1cblxuICAgIH07XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgREVMQVkgPSAxMjAwO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICAgICAgcmVuZGVyVGlsZTogZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdmFyIGRlbGF5ID0gLShNYXRoLnJhbmRvbSgpICogREVMQVkpICsgJ21zJztcbiAgICAgICAgICAgIGVsZW0uaW5uZXJIVE1MID1cbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInZlcnRpY2FsLWNlbnRlcmVkLWJveCBibGlua2luZ1wiIHN0eWxlPVwiYW5pbWF0aW9uLWRlbGF5OicgKyBkZWxheSArICdcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb250ZW50XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImxvYWRlci1jaXJjbGVcIj48L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibG9hZGVyLWxpbmUtbWFza1wiIHN0eWxlPVwiYW5pbWF0aW9uLWRlbGF5OicgKyBkZWxheSArICdcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImxvYWRlci1saW5lXCI+PC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcbiAgICAgICAgfVxuXG4gICAgfTtcblxufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBERUxBWSA9IDEyMDA7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgICAgICByZW5kZXJUaWxlOiBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB2YXIgZGVsYXkgPSAtKE1hdGgucmFuZG9tKCkgKiBERUxBWSkgKyAnbXMnO1xuICAgICAgICAgICAgZWxlbS5pbm5lckhUTUwgPVxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwidmVydGljYWwtY2VudGVyZWQtYm94XCIgc3R5bGU9XCJhbmltYXRpb24tZGVsYXk6JyArIGRlbGF5ICsgJ1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbnRlbnRcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibG9hZGVyLWNpcmNsZVwiPjwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJsb2FkZXItbGluZS1tYXNrXCIgc3R5bGU9XCJhbmltYXRpb24tZGVsYXk6JyArIGRlbGF5ICsgJ1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibG9hZGVyLWxpbmVcIj48L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIFdlYkdMID0gcmVxdWlyZSgnLi4vLi4vY29yZS9XZWJHTCcpO1xuXG4gICAgdmFyIHZlcnQgPSBbXG4gICAgICAgICdwcmVjaXNpb24gaGlnaHAgZmxvYXQ7JyxcbiAgICAgICAgJ2F0dHJpYnV0ZSB2ZWMyIGFQb3NpdGlvbjsnLFxuICAgICAgICAnYXR0cmlidXRlIHZlYzIgYVRleHR1cmVDb29yZDsnLFxuICAgICAgICAndW5pZm9ybSBtYXQ0IHVQcm9qZWN0aW9uTWF0cml4OycsXG4gICAgICAgICd1bmlmb3JtIG1hdDQgdU1vZGVsTWF0cml4OycsXG4gICAgICAgICd2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDsnLFxuICAgICAgICAndm9pZCBtYWluKCkgeycsXG4gICAgICAgICAgICAndlRleHR1cmVDb29yZCA9IGFUZXh0dXJlQ29vcmQ7JyxcbiAgICAgICAgICAgICdnbF9Qb3NpdGlvbiA9IHVQcm9qZWN0aW9uTWF0cml4ICogdU1vZGVsTWF0cml4ICogdmVjNCggYVBvc2l0aW9uLCAwLjAsIDEuMCApOycsXG4gICAgICAgICd9J1xuICAgIF0uam9pbignJyk7XG5cbiAgICB2YXIgZnJhZyA9IFtcbiAgICAgICAgJ3ByZWNpc2lvbiBoaWdocCBmbG9hdDsnLFxuICAgICAgICAndW5pZm9ybSBzYW1wbGVyMkQgdVRleHR1cmVTYW1wbGVyOycsXG4gICAgICAgICd1bmlmb3JtIGZsb2F0IHVPcGFjaXR5OycsXG4gICAgICAgICd2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDsnLFxuICAgICAgICAndm9pZCBtYWluKCkgeycsXG4gICAgICAgICAgICAndmVjNCBjb2xvciA9IHRleHR1cmUyRCh1VGV4dHVyZVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQpOycsXG4gICAgICAgICAgICAnZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvci5yZ2IsIGNvbG9yLmEgKiB1T3BhY2l0eSk7JyxcbiAgICAgICAgJ30nXG4gICAgXS5qb2luKCcnKTtcblxuICAgIHZhciBIZWF0bWFwID0gV2ViR0wuZXh0ZW5kKHtcblxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBzaGFkZXJzOiB7XG4gICAgICAgICAgICAgICAgdmVydDogdmVydCxcbiAgICAgICAgICAgICAgICBmcmFnOiBmcmFnLFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gSGVhdG1hcDtcblxufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBSZXF1ZXN0b3IgPSByZXF1aXJlKCcuL1JlcXVlc3RvcicpO1xuXG4gICAgZnVuY3Rpb24gTWV0YVJlcXVlc3RvcigpIHtcbiAgICAgICAgUmVxdWVzdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgTWV0YVJlcXVlc3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFJlcXVlc3Rvci5wcm90b3R5cGUpO1xuXG4gICAgTWV0YVJlcXVlc3Rvci5wcm90b3R5cGUuZ2V0SGFzaCA9IGZ1bmN0aW9uKHJlcSkge1xuICAgICAgICByZXR1cm4gcmVxLnR5cGUgKyAnLScgK1xuICAgICAgICAgICAgcmVxLmluZGV4ICsgJy0nICtcbiAgICAgICAgICAgIHJlcS5zdG9yZTtcbiAgICB9O1xuXG4gICAgTWV0YVJlcXVlc3Rvci5wcm90b3R5cGUuZ2V0VVJMID0gZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHJldHVybiAnbWV0YS8nICtcbiAgICAgICAgICAgIHJlcy50eXBlICsgJy8nICtcbiAgICAgICAgICAgIHJlcy5lbmRwb2ludCArICcvJyArXG4gICAgICAgICAgICByZXMuaW5kZXggKyAnLycgK1xuICAgICAgICAgICAgcmVzLnN0b3JlO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IE1ldGFSZXF1ZXN0b3I7XG5cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgUkVUUllfSU5URVJWQUwgPSA1MDAwO1xuXG4gICAgZnVuY3Rpb24gZ2V0SG9zdCgpIHtcbiAgICAgICAgdmFyIGxvYyA9IHdpbmRvdy5sb2NhdGlvbjtcbiAgICAgICAgdmFyIG5ld191cmk7XG4gICAgICAgIGlmIChsb2MucHJvdG9jb2wgPT09ICdodHRwczonKSB7XG4gICAgICAgICAgICBuZXdfdXJpID0gJ3dzczonO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3X3VyaSA9ICd3czonO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXdfdXJpICsgJy8vJyArIGxvYy5ob3N0ICsgbG9jLnBhdGhuYW1lO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVzdGFibGlzaENvbm5lY3Rpb24ocmVxdWVzdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXF1ZXN0b3Iuc29ja2V0ID0gbmV3IFdlYlNvY2tldChnZXRIb3N0KCkgKyByZXF1ZXN0b3IudXJsKTtcbiAgICAgICAgLy8gb24gb3BlblxuICAgICAgICByZXF1ZXN0b3Iuc29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmVxdWVzdG9yLmlzT3BlbiA9IHRydWU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnV2Vic29ja2V0IGNvbm5lY3Rpb24gZXN0YWJsaXNoZWQnKTtcbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIG9uIG1lc3NhZ2VcbiAgICAgICAgcmVxdWVzdG9yLnNvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIHJlcyA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG4gICAgICAgICAgICB2YXIgaGFzaCA9IHJlcXVlc3Rvci5nZXRIYXNoKHJlcyk7XG4gICAgICAgICAgICB2YXIgcmVxdWVzdCA9IHJlcXVlc3Rvci5yZXF1ZXN0c1toYXNoXTtcbiAgICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0b3IucmVxdWVzdHNbaGFzaF07XG4gICAgICAgICAgICBpZiAocmVzLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LnJlc29sdmUocmVxdWVzdG9yLmdldFVSTChyZXMpLCByZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LnJlamVjdChyZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvLyBvbiBjbG9zZVxuICAgICAgICByZXF1ZXN0b3Iuc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGxvZyBjbG9zZSBvbmx5IGlmIGNvbm5lY3Rpb24gd2FzIGV2ZXIgb3BlblxuICAgICAgICAgICAgaWYgKHJlcXVlc3Rvci5pc09wZW4pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1dlYnNvY2tldCBjb25uZWN0aW9uIGNsb3NlZCwgYXR0ZW1wdGluZyB0byByZS1jb25uZWN0IGluICcgKyBSRVRSWV9JTlRFUlZBTCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXF1ZXN0b3Iuc29ja2V0ID0gbnVsbDtcbiAgICAgICAgICAgIHJlcXVlc3Rvci5pc09wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIHJlamVjdCBhbGwgcGVuZGluZyByZXF1ZXN0c1xuICAgICAgICAgICAgT2JqZWN0LmtleXMocmVxdWVzdG9yLnJlcXVlc3RzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3Rvci5yZXF1ZXN0c1trZXldLnJlamVjdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBjbGVhciByZXF1ZXN0IG1hcFxuICAgICAgICAgICAgcmVxdWVzdG9yLnJlcXVlc3RzID0ge307XG4gICAgICAgICAgICAvLyBhdHRlbXB0IHRvIHJlLWVzdGFibGlzaCBjb25uZWN0aW9uXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGVzdGFibGlzaENvbm5lY3Rpb24ocmVxdWVzdG9yLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gb25jZSBjb25uZWN0aW9uIGlzIHJlLWVzdGFibGlzaGVkLCBzZW5kIHBlbmRpbmcgcmVxdWVzdHNcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdG9yLnBlbmRpbmcuZm9yRWFjaChmdW5jdGlvbihyZXEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3Rvci5nZXQocmVxKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3Rvci5wZW5kaW5nID0gW107XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCBSRVRSWV9JTlRFUlZBTCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gUmVxdWVzdG9yKHVybCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XG4gICAgICAgIHRoaXMucmVxdWVzdHMgPSB7fTtcbiAgICAgICAgdGhpcy5wZW5kaW5nID0gW107XG4gICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XG4gICAgICAgIGVzdGFibGlzaENvbm5lY3Rpb24odGhpcywgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIFJlcXVlc3Rvci5wcm90b3R5cGUuZ2V0SGFzaCA9IGZ1bmN0aW9uKCAvKnJlcSovICkge1xuICAgICAgICAvLyBvdmVycmlkZVxuICAgIH07XG5cbiAgICBSZXF1ZXN0b3IucHJvdG90eXBlLmdldFVSTCA9IGZ1bmN0aW9uKCAvKnJlcyovICkge1xuICAgICAgICAvLyBvdmVycmlkZVxuICAgIH07XG5cbiAgICBSZXF1ZXN0b3IucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHJlcSkge1xuICAgICAgICBpZiAoIXRoaXMuaXNPcGVuKSB7XG4gICAgICAgICAgICAvLyBpZiBubyBjb25uZWN0aW9uLCBhZGQgcmVxdWVzdCB0byBwZW5kaW5nIHF1ZXVlXG4gICAgICAgICAgICB0aGlzLnBlbmRpbmcucHVzaChyZXEpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBoYXNoID0gdGhpcy5nZXRIYXNoKHJlcSk7XG4gICAgICAgIHZhciByZXF1ZXN0ID0gdGhpcy5yZXF1ZXN0c1toYXNoXTtcbiAgICAgICAgaWYgKHJlcXVlc3QpIHtcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0LnByb21pc2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXF1ZXN0ID0gdGhpcy5yZXF1ZXN0c1toYXNoXSA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShyZXEpKTtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3QucHJvbWlzZSgpO1xuICAgIH07XG5cbiAgICBSZXF1ZXN0b3IucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSBudWxsO1xuICAgICAgICB0aGlzLnNvY2tldC5jbG9zZSgpO1xuICAgICAgICB0aGlzLnNvY2tldCA9IG51bGw7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gUmVxdWVzdG9yO1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIHN0cmluZ2lmeSA9IHJlcXVpcmUoJ2pzb24tc3RhYmxlLXN0cmluZ2lmeScpO1xuICAgIHZhciBSZXF1ZXN0b3IgPSByZXF1aXJlKCcuL1JlcXVlc3RvcicpO1xuXG4gICAgZnVuY3Rpb24gcHJ1bmVFbXB0eShvYmopIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHBydW5lKGN1cnJlbnQpIHtcbiAgICAgICAgICAgIF8uZm9yT3duKGN1cnJlbnQsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQodmFsdWUpIHx8IF8uaXNOdWxsKHZhbHVlKSB8fCBfLmlzTmFOKHZhbHVlKSB8fFxuICAgICAgICAgICAgICAgIChfLmlzU3RyaW5nKHZhbHVlKSAmJiBfLmlzRW1wdHkodmFsdWUpKSB8fFxuICAgICAgICAgICAgICAgIChfLmlzT2JqZWN0KHZhbHVlKSAmJiBfLmlzRW1wdHkocHJ1bmUodmFsdWUpKSkpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgY3VycmVudFtrZXldO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIHJlbW92ZSBhbnkgbGVmdG92ZXIgdW5kZWZpbmVkIHZhbHVlcyBmcm9tIHRoZSBkZWxldGVcbiAgICAgICAgICAgIC8vIG9wZXJhdGlvbiBvbiBhbiBhcnJheVxuICAgICAgICAgICAgaWYgKF8uaXNBcnJheShjdXJyZW50KSkge1xuICAgICAgICAgICAgICAgIF8ucHVsbChjdXJyZW50LCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgIH0oXy5jbG9uZURlZXAob2JqKSk7IC8vIGRvIG5vdCBtb2RpZnkgdGhlIG9yaWdpbmFsIG9iamVjdCwgY3JlYXRlIGEgY2xvbmUgaW5zdGVhZFxuICAgIH1cblxuICAgIGZ1bmN0aW9uIFRpbGVSZXF1ZXN0b3IoKSB7XG4gICAgICAgIFJlcXVlc3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIFRpbGVSZXF1ZXN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShSZXF1ZXN0b3IucHJvdG90eXBlKTtcblxuICAgIFRpbGVSZXF1ZXN0b3IucHJvdG90eXBlLmdldEhhc2ggPSBmdW5jdGlvbihyZXEpIHtcbiAgICAgICAgdmFyIGNvb3JkID0gcmVxLmNvb3JkO1xuICAgICAgICB2YXIgaGFzaCA9IHN0cmluZ2lmeShwcnVuZUVtcHR5KHJlcS5wYXJhbXMpKTtcbiAgICAgICAgcmV0dXJuIHJlcS50eXBlICsgJy0nICtcbiAgICAgICAgICAgIHJlcS5pbmRleCArICctJyArXG4gICAgICAgICAgICByZXEuc3RvcmUgKyAnLScgK1xuICAgICAgICAgICAgY29vcmQueCArICctJyArXG4gICAgICAgICAgICBjb29yZC55ICsgJy0nICtcbiAgICAgICAgICAgIGNvb3JkLnogKyAnLScgK1xuICAgICAgICAgICAgaGFzaDtcbiAgICB9O1xuXG4gICAgVGlsZVJlcXVlc3Rvci5wcm90b3R5cGUuZ2V0VVJMID0gZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHZhciBjb29yZCA9IHJlcy5jb29yZDtcbiAgICAgICAgcmV0dXJuICd0aWxlLycgK1xuICAgICAgICAgICAgcmVzLnR5cGUgKyAnLycgK1xuICAgICAgICAgICAgcmVzLmluZGV4ICsgJy8nICtcbiAgICAgICAgICAgIHJlcy5zdG9yZSArICcvJyArXG4gICAgICAgICAgICBjb29yZC56ICsgJy8nICtcbiAgICAgICAgICAgIGNvb3JkLnggKyAnLycgK1xuICAgICAgICAgICAgY29vcmQueTtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUaWxlUmVxdWVzdG9yO1xuXG59KCkpO1xuIl19
