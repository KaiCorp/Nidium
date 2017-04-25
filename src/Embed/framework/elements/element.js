/**
 * Copyright 2017 Nidium Inc. All rights reserved.
 * Use of this source code is governed by a MIT license
 * that can be found in the LICENSE file.
 */

{
    const { StyleContainer, ElementStyle } = require("ElementsStyles");
    const { setAnimation, Easing } = require("AnimationBlock");
    const Elements = require("Elements");
    const drawer = require("../core/drawer.js");
    const VM = require("VM");

    const defineStyleProperty = function(target, property, descriptor){
        let styler = new ElementStyle(property, descriptor);
        ElementStyle.Implement(target, styler);
    };
    const s_ShadowRoot  = require("../../Symbols.js").ElementShadowRoot;

    Elements.Element = class extends Elements.Node {
        constructor(attributes = {}) {
            super(attributes);

            if (attributes.opacity !== undefined) {
                this.opacity = attributes.opacity;
            }

            this.style = new (StyleContainer.Create(Object.getPrototypeOf(this)))(this);

            this.style.fontFamily = "Roboto Regular";
            this.style.fontSize = 15;

            const classes = attributes.class;
            if (classes) {
                let nss;
                if (this.shadowRoot) {
                    // If element is a ShadowRoot, we need to get the styling
                    // information from the parent ShadowRoot
                    nss = this.getParent()[s_ShadowRoot].getNSS();
                } else {
                    nss = this[s_ShadowRoot].getNSS();
                }

                let tmp = [];

                // Add all NSS style defined by every classes
                for (let c of classes.split(" ")) {
                    tmp.push(nss[c]);
                }

                // Merge all style into |this.style|
                this._mergeStyle(tmp);
            }

            if (attributes.style) {
                var style = VM.run("(" + attributes.style + ")", {
                    scope: this[s_ShadowRoot].getJSScope()
                });
                Object.assign(this.style, style);
            }
        }

        oncontextlost() {
            this._ctx = undefined;
        }

        onload() {
            this._ctx = this.getContext("2d");
        }

        onpaint() {
            if (!this._ctx) {
                return;
            }

            let dimensions = this.getDimensions();

            this._ctx.save();
            this.clear();
            this.paint(this._ctx, dimensions.width, dimensions.height);
            this._ctx.restore();
        }

        paint(ctx, w, h) {
            let s = this.style;

            if (s.fontSize) {
                ctx.fontSize = s.fontSize;
            }

            if (s.fontFamily) {
                ctx.fontFamily = s.fontFamily;
            }

            if (s.backgroundColor) {
                s.shadowBlur && drawer.setShadow(ctx, s);
                ctx.fillStyle = s.backgroundColor;
                ctx.fillRect(0, 0, w, h, s.radius);
                s.shadowBlur && drawer.disableShadow(ctx);
            }

            if (s.borderColor && s.borderWidth) {
                let x = 0;
                let y = 0;

                ctx.lineWidth = s.borderWidth;
                ctx.strokeStyle = s.borderColor;

                ctx.strokeRect(
                    x - s.borderWidth*0.5,
                    y - s.borderWidth*0.5,
                    w + s.borderWidth,
                    h + s.borderWidth,
                    s.radius + s.borderWidth*0.5
                );
            }
        }

        shader(file) {
            var ctx = this.ctx2d();
            return ctx.setShaderFile(file);
        }

        fadein(duration, callback) {
            var callback = callback || function(){};

            setAnimation((style) => {
                style.opacity = 1;
            }, duration, Easing.Sinusoidal.Out, this.style)(callback);

            return this;
        }

        fadeout(duration, callback) {
            var callback = callback || function(){};

            setAnimation((style) => {
                style.opacity = 0;
            }, duration, Easing.Sinusoidal.In, this.style)(callback);

            return this;
        }

        isVisible() {
            return this.__visible && !this.__outofbound;
        }

        getDrawingBounds() {
            var {width, height} = this.getDimensions();

            return {
                x : 0,
                y : 0,
                w : width,
                h : height
            };
        }

        ctx2d() {
            return this.getContext("2d");
        }

        /* This is needed because Elements.Node forbids getContext() */
        getContext(type="2d") {
            return Canvas.prototype.getContext.call(this, type);
        }
    }

    Object.defineProperty(Elements.Element.prototype, "_mergeStyle", {
        value: function(stylesArray) {
            for (let styles of stylesArray) {
                for (let prop in styles) {
                    if (styles[prop] != undefined) {
                        this.style[prop] = styles[prop]
                    }
                }
            }
        }
    });

    Elements.element = class extends Elements.Element { }
    Elements.none = Elements.Element;

    [
        "opacity",
        "overflow",
        "scrollLeft",
        "scrollTop",
        "allowNegativeScroll",
        "width",
        "coating",
        "height",
        "maxWidth",
        "maxHeight",
        "minWidth",
        "minHeight",
        "position",
        "display",
        "top",
        "left",
        "right",
        "bottom",
        "visible",
        "marginLeft",
        "marginRight",
        "marginTop",
        "marginBottom",
        "paddingLeft",
        "paddingRight",
        "paddingTop",
        "paddingBottom",
        "cursor",
        "flexDirection",
        "flexWrap",
        "justifyContent",
        "alignItems",
        "alignContent",
        "flexGrow",
        "flexShrink",
        "flexBasis",
        "alignSelf",
        "aspectRatio"
    ].forEach(native => {
        defineStyleProperty(Elements.Element, native, { isNative: true });
    });

    const properties = {
        backgroundColor :   { inherit:false,    repaint:true},
        color :             { inherit:true,     repaint:true},
        lineHeight :        { inherit:true,     repaint:true},
        fontFamily :        { inherit:true,     repaint:true},
        fontSize :          { inherit:true,     repaint:true},
        fontWeight :        { inherit:true,     repaint:true},
        textAlign :         { inherit:true,     repaint:true},
    };

    for (var k in properties) {
        defineStyleProperty(Elements.Element, k, properties[k]);
    }

    ElementStyle.Inherit(Elements.element);
}
