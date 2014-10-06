// Dropdown Select Widget
dojo.provide('GeoLocationForPhoneGap.widget.GeoLocationForPhoneGap');
dojo.declare('GeoLocationForPhoneGap.widget.GeoLocationForPhoneGap', mxui.widget._WidgetBase, {

    /* Inputargs
    
    this.buttonLabel : string,
    this.latAttr : float,
    this.longAttr : float,
    this.onchangemf : string

    */

    // Coding guideline, internal variables start with '_'.
    // internal variables.

    // *
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
                callback : dojo.hitch(this, function (objArr) {
                    if (objArr.length === 1)
                        this._loadData(objArr[0]);
                    else
                        console.log('Could not find the object corresponding to the received object ID.')
                })
            });
        } else if(obj === null){
            // Sorry no data no show!
            console.log('Whoops... the GEO Location has no data!');
        } else {
            // Attach to data refresh.
            if (this._objSub)
                this.unsubscribe(this._objSub);

            this._objSub = mx.data.subscribe({
                guid : obj.getGuid(),
                callback : dojo.hitch(this, this.update)
            });
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
        dojo.addClass(this.domNode, 'wx-geolocation-container');

        // Empty domnode of this and appand new input
        dojo.empty(this.domNode);
    },

    _createChildnodes: function() {
        'use strict';

        // Placeholder container
        this._button = mxui.dom.div();
        dojo.addClass(this._button, 'wx-mxwxgeolocation-button btn btn-primary');
        if (this.buttonClass)
            dojo.addClass(this._button, this.buttonClass);
        
        dojo.html.set(this._button, this.buttonLabel || 'GEO Location');

        // Add to wxnode
        this.domNode.appendChild(this._button);
    },

    // Internal event setup.
    _setupEvents : function() {
        'use strict';

        // Scope is now inside me variable.
        var me = this;
       
        // Attach only one event to dropdown list.
        dojo.connect( this._button, "touchstart", dojo.hitch(this, function(evt){
            console.log('GEO Location start getting location.');

            // The camera function has a success, failure and a reference to this.
            navigator.geolocation.getCurrentPosition(
                dojo.hitch(this, this._geolocationSuccess),
                dojo.hitch(this, this._geolocationFailure),
                {timeout: 10000, enableHighAccuracy: true});
        }));

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
            dojo.html.set(this._result, 'GEO Location failure...' );
        } else {
            this._result = mxui.dom.div();
            dojo.html.set(this._result, 'GEO Location failure...' );
            this.domNode.appendChild(this._result);
        }
    },

    _executeMicroflow : function () {
        'use strict';

        if (this.onchangemf && this._obj) {
            mx.processor.xasAction({
                error       : function() {},
                actionname  : this.onchangemf,
                applyto     : 'selection',
                guids       : [this._obj.getGuid()]
            });
        }
    }
});
