/*
 * Copyright 2017 Nidium Inc. All rights reserved.
 * Use of this source code is governed by a MIT license
 * that can be found in the LICENSE file.
 */

const Elements = require("Elements");

const __opacity_lo__ = 0.4;
const __opacity_hi__ = 1.0;
const __next_duration__ = 450;
const __back_duration__ = 420;

const { ElementStyle } = require("ElementsStyles");

class Navigator extends Elements.Element {
    constructor(attributes) {
        super(attributes);
        this.routes = {};
        this.history = [];
        this.currentScene = null;

        this.style.flexGrow = 1;
        this.style.overflow = false;

        this.parentWidth = window.innerWidth;

        window.on("back", (e) => {
            if (this.history.length>1) {
                this.back();
                e.preventDefault();
                return false;
            }
        });
    }

    set(routes) {
        this.routes = {};

        for (var url in routes) {
            if (routes.hasOwnProperty(url)) this.routes[url] = routes[url];
        }
    }

    popHistory(url) {
        var pos = -1, len = this.history.length, scene = null;

        /* search for scene in history */
        for (var i = 0; i < len; i++) {
            var s = this.history[i];
            if (s.url == url) {
                scene = s;
                pos = i;
                break;
            }
        }

        /* remove trailing scenes */
        if (pos > -1) {
            for (var i = pos+1; i < len; i++) {
                var s = this.history[i];
                s.emit("destroy", {});
                s.removeFromParent();
            }

            this.history.splice(pos+1, len-(pos+1));
        }

        return scene;
    }

    getCurrentScene() {
        return this.history[this.history.length - 1];
    }

    preload(url, params) {
        var component = this.routes[url];
        if (!component) {
            throw new Error("Undefined routing url " + url);
            return false;
        }

        var scene = new component(params);

        scene.url = url;
        scene.navigator = this;

        return scene;
    }

    /*
     * load without animation
     */
    load(url, params) {
        var scene = this.popHistory(url);

        if (scene) {
            this.showScene(scene);
        } else {
            scene = this.preload(url, params);
            this.push(scene);
        }
    }

    /*
     * load with default animation
     */
    go(url, params) {
        var scene = this.popHistory(url);

        if (scene) {
            this.showScene(scene);
        } else {
            scene = this.preload(url, params);
            this.push(scene, __next_duration__);
        }
    }

    reset() {
        this.empty();
        this.history = [];
    }

    dumpHistory() {
        var len = this.history.length;

        for (var i = 0; i < len; i++) {
            var scene = this.history[i];
        }
    }

    showScene(scene) {
        scene.show();
        scene.style.left = 0;
        scene.opacity = __opacity_hi__;
    }

    hideScene(scene) {
        scene.style.left = -this.parentWidth;
        scene.opacity = __opacity_lo__;
        scene.hide();
    }

    slideToLeft(scene, duration, callback=function(){}) {
        scene.opacity = __opacity_hi__;

        var anim = setAnimation(
            c => {
                c.left = -this.parentWidth;
                c.opacity = __opacity_lo__;
            },
            duration,
            Easing.Exponential.Out,
            scene
        );

        anim.onFinish = () => {
            this.hideScene(scene);
            callback.call(this);
        };
    }

    slideFromRight(scene, duration, callback=function(){}) {
        this.showScene(scene);

        scene.left = this.parentWidth;
        scene.opacity = __opacity_lo__;

        var anim = setAnimation(
            c => {
                c.left = 0;
                c.opacity = __opacity_hi__;
            },
            duration,
            Easing.Exponential.Out,
            scene
        );

        anim.onFinish = () => {
            callback.call(this);
        };
    }

    slideFromLeft(scene, duration, callback=function(){}) {
        this.showScene(scene);

        scene.left = -this.parentWidth;
        scene.opacity = __opacity_lo__;

        var anim = setAnimation(
            c => {
                c.left = 0;
                c.opacity = __opacity_hi__;
            },
            __back_duration__,
            Easing.Exponential.Out,
            scene
        );

        anim.onFinish = () => {
            callback.call(this);
        };
    }

    push(nextScene, duration = 0) {
        if (this.history.length > 0) {
            var currScene = this.getCurrentScene();

            if (duration > 0) {
                this.slideToLeft(currScene, duration);
                this.slideFromRight(nextScene, duration);
            } else {
                this.hideScene(currScene);
                this.showScene(nextScene);
            }
        }

        this.history.push(nextScene);
        this.add(nextScene);
    }

    back(callback) {
        var callback = callback || function() {};

        if (this.history.length <= 1) {
            return false;
        }

        var currScene = this.history.pop();
        currScene.opacity = __opacity_hi__;

        var anim = setAnimation(
            c => {
                c.left = this.parentWidth;
                c.opacity = __opacity_lo__;
            },
            __back_duration__,
            Easing.Exponential.Out,
            currScene
        );

        anim.onFinish = () => {
            currScene.emit("destroy", {});
            currScene.removeFromParent();
            callback.call(this);
        };

        var prevScene = this.history[this.history.length - 1];
        this.slideFromLeft(prevScene, __back_duration__);

        return true;
    }
}

ElementStyle.Inherit(Navigator);

Elements.navigator = class extends Navigator {};
ElementStyle.Inherit(Elements.navigator);

module.exports = Navigator;