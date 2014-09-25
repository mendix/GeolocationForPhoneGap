// Dropdown Select Widget
dojo.provide('MxwxGeolocation.widget.MxwxGeolocation');
dojo.declare('MxwxGeolocation.widget.MxwxGeolocation', mxui.widget._WidgetBase, {

    /* Inputargs
    
    this.buttonLabel : string,
    this.latAttr : float,
    this.longAttr : float,
    this.onchangemf : string

    */

    // Coding guideline, internal variables start with '_'.
    // internal variables.

    // *
    _result : {},
    _button : null,
    _hasStarted : false,
    _obj : null,

    // Externally executed mendix function to create widget.
    startup: function() {
        'use strict';

        if (this._hasStarted)
            return;

        this._hasStarted = true;

        // Load CSS ... automaticly from ui directory

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
                guids    : [this._contextGuid],
                callback : dojo.hitch(this, function(objs) {
                    this._contextObj = objs;
                })
            });
        } else {
            this._contextObj = obj;
        }

        if(obj === null){
            // Sorry no data no show!
            console.log('Whoops... the GEO Location has no data!');
        } else {
            // Attach to data refresh.
            mx.data.subscribe({
                guid : obj.getGuid(),
                callback : dojo.hitch(this, this._refresh)
            });
            // Load data
            this._loadData();
        }


        if(typeof callback !== 'undefined') {
            callback();
        }
    },

    // Internal functions
    _refresh : function(){
        //TODO??
    },

    // Loading data
    _loadData : function(){
        //TODO??
    },

    // Setup
    _setupWX: function() {
        'use strict';

        // MX id.
        this._mxid = this.mxid;
        this._mxid_options = 'wx-mxwxgeolocation-options-' + this._mxid;

        // Set class for domNode
        dojo.addClass(this.domNode, 'wx-mxwxgeolocation-container');

        // Empty domnode of this and appand new input
        dojo.empty(this.domNode);
    },

    _createChildnodes: function() {
        'use strict';

        // Placeholder container
        this._button = mxui.dom.div();
        dojo.addClass(this._button, 'wx-mxwxgeolocation-button btn btn-primary');
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
                {timeout: 20000});
        }));

    },

    _geolocationSuccess : function(position){
        'use strict';

        if(this._result){
            dojo.html.set(this._result, 'GEO Location latitude : ' + position.coords.latitude + ' | longitude : ' +  position.coords.longitude + ' | altitude : ' + position.coords.altitude);
        } else {
            this._result = mxui.dom.div();
            dojo.html.set(this._result, 'GEO Location latitude : ' + position.coords.latitude + ' | longitude : ' +  position.coords.longitude + ' | altitude : ' + position.coords.altitude);
            this.domNode.appendChild(this._result);

            this._obj.set(this.latAttr, position.coords.latitude);
            this._obj.set(this.longAttr, position.coords.longitude);
            this._executeMicroflow();
        }
    },

    _geolocationFailure : function(error){
        'use strict';

        console.log('GEO Location failure!');
        console.log(e);

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
