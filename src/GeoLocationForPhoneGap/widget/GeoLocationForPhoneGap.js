define([
    "mxui/widget/_WidgetBase", "mxui/dom", "dojo/dom-class", "dojo/dom-construct",
    "dojo/_base/declare"
], function(_WidgetBase, mxuiDom, dojoClass, dojoConstruct, declare) {
    "use strict";

    return declare("GeoLocationForPhoneGap.widget.GeoLocationForPhoneGap", _WidgetBase, {

        buttonLabel: "",
        latAttr: 0.0,
        longAttr: 0.0,
        onchangemf: "",
        onChangeNanoflow: null,

        _result: null,
        _button: null,
        _hasStarted: false,
        _obj: null,

        // Externally executed mendix function to create widget.
        startup: function() {
            if (this._hasStarted) {
                return;
            }

            this._hasStarted = true;

            // Setup widget
            this._setupWX();

            // Create childnodes
            this._createChildnodes();

            // Setup events
            this._setupEvents();

        },

        update: function(obj, callback) {
            this._obj = obj;

            // If configured, automatically update geolocation
            if (this.getPositionOnLoad) {
                this._getCurrentPosition();
            }

            if (callback) {
                callback();
            }
        },

        // Setup
        _setupWX: function() {
            // Set class for domNode
            dojoClass.add(this.domNode, "wx-geolocation-container");

            // Empty domnode of this and appand new input
            dojoConstruct.empty(this.domNode);
        },

        _createChildnodes: function() {
            // Placeholder container
            this._button = mxuiDom.create("div", {
                "class": "wx-mxwxgeolocation-button btn btn-primary"
            });
            if (this.buttonClass) {
                dojoClass.add(this._button, this.buttonClass);
            }

            this._button.textContent = this.buttonLabel || "GEO Location";

            // Add to wxnode
            this.domNode.appendChild(this._button);
        },

        // Internal event setup.
        _setupEvents: function() {
            this.connect(this._button, "click", this._getCurrentPosition);
        },

        _getCurrentPosition: function() {
            console.log("GEO Location start getting location.");

            navigator.geolocation.getCurrentPosition(
                this._geolocationSuccess.bind(this),
                this._geolocationFailure.bind(this), {
                    timeout: 10000,
                    enableHighAccuracy: this.enableHighAccuracy
                });
        },

        _geolocationSuccess: function(position) {
            this._obj.set(this.latAttr, +position.coords.latitude.toFixed(8));
            this._obj.set(this.longAttr, +position.coords.longitude.toFixed(8));
            this._executeAction();
        },

        _geolocationFailure: function(error) {
            console.log("GEO Location failure!");
            console.log(error.message);

            if (this._result) {
                this._result.textContent = "GEO Location failure...";
            } else {
                this._result = mxuiDom.create("div");
                this._result.textContent = "GEO Location failure...";
                this.domNode.appendChild(this._result);
            }
        },

        _executeAction: function() {
            if (this.onchangemf && this._obj) {
                mx.data.action({
                    params: {
                        actionname: this.onchangemf,
                        applyto: "selection",
                        guids: [ this._obj.getGuid() ]
                    },
                    origin: this.mxform,
                    error: function (error) {
                        mx.ui.error("An error occurred while executing the " + this.onchangemf + ": " + error.message);
                    },
                });
            }

            if (this.onChangeNanoflow.nanoflow && this.mxcontext) {
                mx.data.callNanoflow({
                    nanoflow: this.onChangeNanoflow,
                    origin: this.mxform,
                    context: this.mxcontext,
                    error: function (error) {
                        mx.ui.error("An error occurred while executing the on change nanoflow: " + error.message);
                    }
                });
            }
        }
    });
});

// Compatibility with older mendix versions.
require([ "GeoLocationForPhoneGap/widget/GeoLocationForPhoneGap" ], function() {});
