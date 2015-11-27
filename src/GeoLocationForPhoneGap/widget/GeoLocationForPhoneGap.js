define([
    "mxui/widget/_WidgetBase", "mxui/dom", "dojo/dom-class", "dojo/dom-construct",
    "dojo/_base/declare"
], function(_WidgetBase, mxuiDom, dojoClass, dojoConstruct, declare) {

    return declare('GeoLocationForPhoneGap.widget.GeoLocationForPhoneGap', _WidgetBase, {

        buttonLabel: "",
        latAttr: 0.0,
        longAttr: 0.0,
        onchangemf: "",

        _result : null,
        _button : null,
        _hasStarted : false,
        _obj : null,
        _objSub : null,

        // Externally executed mendix function to create widget.
        startup: function() {
            'use strict';

            if (this._hasStarted)
                return;

            this._hasStarted = true;

            // Setup widget
            this._setupWX();

            // Create childnodes
            this._createChildnodes();

            // Setup events
            this._setupEvents();

        },

        update : function (obj, callback) {
            'use strict';

            if(typeof obj === 'string'){
                this._contextGuid = obj;
                mx.data.get({
                    guids    : [obj],
                    callback : function (objArr) {
                        if (objArr.length === 1)
                            this._loadData(objArr[0]);
                        else
                            console.log('Could not find the object corresponding to the received object ID.');
                    }
                }, this);
            } else if(obj === null){
                // Sorry no data no show!
                console.log('Whoops... the GEO Location has no data!');
            } else {
                // Attach to data refresh.
                if (this._objSub)
                    this.unsubscribe(this._objSub);

                this._objSub = mx.data.subscribe({
                    guid: obj.getGuid(),
                    callback: this.update
                }, this);
                // Load data
                this._loadData(obj);
            }

            if(typeof callback !== 'undefined') {
                callback();
            }
        },

        // Loading data
        _loadData : function(obj){
            this._obj = obj;
        },

        // Setup
        _setupWX: function() {
            'use strict';

            // Set class for domNode
            dojoClass.add(this.domNode, 'wx-geolocation-container');

            // Empty domnode of this and appand new input
            dojoConstruct.empty(this.domNode);
        },

        _createChildnodes: function() {
            'use strict';

            // Placeholder container
            this._button = mxuiDom.create("div", {
                'class': 'wx-mxwxgeolocation-button btn btn-primary'
            });
            if (this.buttonClass)
                dojoClass.add(this._button, this.buttonClass);

            this._button.textContent = this.buttonLabel || 'GEO Location';

            // Add to wxnode
            this.domNode.appendChild(this._button);
        },

        // Internal event setup.
        _setupEvents : function() {
            'use strict';

            this.connect(this._button, "click", function(evt) {
                console.log('GEO Location start getting location.');

                navigator.geolocation.getCurrentPosition(
                    this._geolocationSuccess.bind(this),
                    this._geolocationFailure.bind(this), {
                        timeout: 10000,
                        enableHighAccuracy: true
                    });
            });
        },

        _geolocationSuccess : function(position){
            'use strict';

            this._obj.set(this.latAttr, position.coords.latitude);
            this._obj.set(this.longAttr, position.coords.longitude);
            this._executeMicroflow();
        },

        _geolocationFailure : function(error){
            'use strict';

            console.log('GEO Location failure!');
            console.log(error.message);

            if(this._result){
                this._result.textContent = 'GEO Location failure...';
            } else {
                this._result = mxuiDom.create("div");
                this._result.textContent = 'GEO Location failure...';
                this.domNode.appendChild(this._result);
            }
        },

        _executeMicroflow : function () {
            'use strict';

            if (this.onchangemf && this._obj) {
                mx.data.action({
                    params: {
                        actionname: this.onchangemf,
                        applyto: 'selection',
                        guids: [this._obj.getGuid()]
                    },
                    error: function() {},
                });
            }
        }
    });
});

// Compatibility with older mendix versions.
require([ "GeoLocationForPhoneGap/widget/GeoLocationForPhoneGap" ], function() {});
