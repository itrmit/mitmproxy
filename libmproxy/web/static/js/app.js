const PayloadSources = {
  VIEW_ACTION: "VIEW_ACTION",
  SERVER_ACTION: "SERVER_ACTION"
};



  function Dispatcher() {"use strict";
    this.callbacks = [];
  }

  Dispatcher.prototype.register=function(callback){"use strict";
    this.callbacks.push(callback);
  };

  Dispatcher.prototype.unregister=function(callback){"use strict";
    var index = this.callbacks.indexOf(f);
    if (index >= 0) {
      this.callbacks.splice(this.callbacks.indexOf(f), 1);
    }
  };

  Dispatcher.prototype.dispatch=function(payload){"use strict";
    console.debug("dispatch", payload);
    this.callbacks.forEach(function(callback)  {
        callback(payload);
    });
  };



AppDispatcher = new Dispatcher();
AppDispatcher.dispatchViewAction = function(action){
  action.actionSource = PayloadSources.VIEW_ACTION;
  this.dispatch(action);
};
AppDispatcher.dispatchServerAction = function(action){
  action.actionSource = PayloadSources.SERVER_ACTION;
  this.dispatch(action);
};
var ActionTypes = {
  SETTINGS_UPDATE: "SETTINGS_UPDATE",
  EVENTLOG_ADD: "EVENTLOG_ADD"
};

var SettingsActions = {
  update:function(settings) {
  	settings = _.merge({}, SettingsStore.getAll(), settings);
  	//TODO: Update server.

  	//Facebook Flux: We do an optimistic update on the client already.
    AppDispatcher.dispatchViewAction({
      actionType: ActionTypes.SETTINGS_UPDATE,
      settings: settings
    });
  }
};

	function EventEmitter() {"use strict";
		this.listeners = {};
	}
	EventEmitter.prototype.emit=function(event) {"use strict";
		if (!(event in this.listeners)) {
			return;
		}
		this.listeners[event].forEach(function(listener) {
			listener.apply(this, arguments);
		}.bind(this));
	};
	EventEmitter.prototype.addListener=function(event, f) {"use strict";
		this.listeners[event] = this.listeners[event] || [];
		this.listeners[event].push(f);
	};
	EventEmitter.prototype.removeListener=function(event, f) {"use strict";
		if (!(event in this.listeners)) {
			return false;
		}
		var index = this.listeners[event].indexOf(f);
		if (index >= 0) {
			this.listeners[event].splice(index, 1);
		}
	};

for(var EventEmitter____Key in EventEmitter){if(EventEmitter.hasOwnProperty(EventEmitter____Key)){_SettingsStore[EventEmitter____Key]=EventEmitter[EventEmitter____Key];}}var ____SuperProtoOfEventEmitter=EventEmitter===null?null:EventEmitter.prototype;_SettingsStore.prototype=Object.create(____SuperProtoOfEventEmitter);_SettingsStore.prototype.constructor=_SettingsStore;_SettingsStore.__superConstructor__=EventEmitter;
	function _SettingsStore() {"use strict";
		EventEmitter.call(this);
		this.settings = { version: "0.12", showEventLog: true }; //FIXME: Need to get that from somewhere.
	}
	_SettingsStore.prototype.getAll=function() {"use strict";
		return this.settings;
	};
	_SettingsStore.prototype.handle=function(action) {"use strict";
		switch (action.actionType) {
			case ActionTypes.SETTINGS_UPDATE:
				this.settings = action.settings;
				this.emit("change");
				break;
			default:
				return;
		}
	};

var SettingsStore = new _SettingsStore();
AppDispatcher.register(SettingsStore.handle.bind(SettingsStore));

for(var EventEmitter____Key in EventEmitter){if(EventEmitter.hasOwnProperty(EventEmitter____Key)){EventLogView[EventEmitter____Key]=EventEmitter[EventEmitter____Key];}}var ____SuperProtoOfEventEmitter=EventEmitter===null?null:EventEmitter.prototype;EventLogView.prototype=Object.create(____SuperProtoOfEventEmitter);EventLogView.prototype.constructor=EventLogView;EventLogView.__superConstructor__=EventEmitter;
	function EventLogView(store, live){"use strict";
		EventEmitter.call(this);
		this.$EventLogView_store = store;
		this.live = live;
		this.log = [];

		this.add = this.add.bind(this);

		if(live){
			this.$EventLogView_store.addListener("new_entry", this.add);
		}
		
	}
	EventLogView.prototype.close=function() {"use strict";
		this.$EventLogView_store.removeListener("new_entry", this.add);
	};
	EventLogView.prototype.getAll=function() {"use strict";
		return this.log;
	};

	EventLogView.prototype.add=function(entry){"use strict";
		this.log.push(entry);
		this.emit("change");
	};
	EventLogView.prototype.add_bulk=function(messages){"use strict";
		var log = messages;
		var last_id = log[log.length-1].id;
		var to_add = _.filter(this.log, function(entry)  {return entry.id > last_id;});
		this.log = log.concat(to_add);
		this.emit("change");
	};


for(EventEmitter____Key in EventEmitter){if(EventEmitter.hasOwnProperty(EventEmitter____Key)){_EventLogStore[EventEmitter____Key]=EventEmitter[EventEmitter____Key];}}_EventLogStore.prototype=Object.create(____SuperProtoOfEventEmitter);_EventLogStore.prototype.constructor=_EventLogStore;_EventLogStore.__superConstructor__=EventEmitter;function _EventLogStore(){"use strict";if(EventEmitter!==null){EventEmitter.apply(this,arguments);}}
	_EventLogStore.prototype.getView=function(since){"use strict";
		var view = new EventLogView(this, !since);

		//TODO: Really do bulk retrieval of last messages.

		window.setTimeout(function(){
			view.add_bulk([
				{ id:1, message: "Hello World"},
				{ id:2, message: "I was already transmitted as an event."}
				]);
		}, 100);

		var id = 2;
		view.add({id:id++, message: "I was already transmitted as an event."});
		view.add({id:id++, message: "I was only transmitted as an event before the bulk was added.."});
		window.setInterval(function(){
			view.add({id: id++, message: "."});
		}, 1000);
		return view;
	};
	_EventLogStore.prototype.handle=function(action) {"use strict";
		switch (action.actionType) {
			case ActionTypes.EVENTLOG_ADD:
				this.emit("new_message", action.message);
				break;
			default:
				return;
		}
	};

var EventLogStore = new _EventLogStore();
AppDispatcher.register(EventLogStore.handle.bind(EventLogStore));

    function _Connection(root) {"use strict";
        if (!root) {
            root = location.origin + "/api/v1";
        }
        this.root = root;
    }

    _Connection.prototype.init=function() {"use strict";
        this.openWebSocketConnection();
    };

    _Connection.prototype.openWebSocketConnection=function() {"use strict";
        this.ws = new WebSocket(this.root.replace("http", "ws") + "/ws");
        var ws = this.ws;

        ws.onopen = this.onopen.bind(this);
        ws.onmessage = this.onmessage.bind(this);
        ws.onerror = this.onerror.bind(this);
        ws.onclose = this.onclose.bind(this);
    };

    _Connection.prototype.onopen=function(open) {"use strict";
        console.log("onopen", this, arguments);
    };
    _Connection.prototype.onmessage=function(message) {"use strict";
        //AppDispatcher.dispatchServerAction(...);
        console.log("onmessage", this, arguments);
    };
    _Connection.prototype.onerror=function(error) {"use strict";
        console.log("onerror", this, arguments);
    };
    _Connection.prototype.onclose=function(close) {"use strict";
        console.log("onclose", this, arguments);
    };


var Connection = new _Connection();
/** @jsx React.DOM */

var MainMenu = React.createClass({displayName: 'MainMenu',
    toggleEventLog:function() {
        SettingsActions.update({
            showEventLog: !this.props.settings.showEventLog
        });
    },
    render:function(){
        return React.DOM.div(null, 
            React.DOM.button({className: "btn " + (this.props.settings.showEventLog ? "btn-primary" : "btn-default"), onClick: this.toggleEventLog}, 
                React.DOM.i({className: "fa fa-database"}), " Display Event Log"
            )
            );
    }
});
var ToolsMenu = React.createClass({displayName: 'ToolsMenu',
    render:function(){
        return (React.DOM.div(null, "Tools Menu"));
    }
});
var ReportsMenu = React.createClass({displayName: 'ReportsMenu',
    render:function(){
        return (React.DOM.div(null, "Reports Menu"));
    }
});


var _Header_Entries = {
    main: {
        title: "Traffic",
        route: "main",
        menu: MainMenu
    },
    tools: {
        title: "Tools",
        route: "main",
        menu: ToolsMenu
    },
    reports: {
        title: "Visualization",
        route: "reports",
        menu: ReportsMenu
    }
};

var Header = React.createClass({displayName: 'Header',
    getInitialState:function(){
        return {
            active: "main"
        };
    },
    handleClick:function(active){
        this.setState({active: active});
        ReactRouter.transitionTo(_Header_Entries[active].route);
        return false;
    },
    handleFileClick:function(){
        console.log("File click");
    },

    render:function(){
        var header = [];
        for(var item in _Header_Entries){
            var classes = this.state.active == item ? "active" : "";
            header.push(React.DOM.a({key: item, href: "#", className: classes, 
                onClick: this.handleClick.bind(this, item)},  _Header_Entries[item].title));
        }

        var menu = _Header_Entries[this.state.active].menu({
            settings: this.props.settings
        });
        return (
            React.DOM.header(null, 
                React.DOM.div({className: "title-bar"}, 
                    "mitmproxy ",  this.props.settings.version
                ), 
                React.DOM.nav(null, 
                    React.DOM.a({href: "#", className: "special", onClick: this.handleFileClick}, " File "), 
                    header
                ), 
                React.DOM.div({className: "menu"}, 
                    menu 
                )
            ));
    }
});
/** @jsx React.DOM */

var TrafficTable = React.createClass({displayName: 'TrafficTable',
    getInitialState: function(){
        return {
            flows: []
        };
    },
    componentDidMount:function(){
        //this.flowStore = FlowStore.getView();
        //this.flowStore.addListener("change",this.onFlowChange);
    },
    componentWillUnmount:function(){
        //this.flowStore.removeListener("change",this.onFlowChange);
        //this.flowStore.close();
    },
    onFlowChange:function(){
        this.setState({
            //flows: this.flowStore.getAll()
        });
    },
    render: function () {
       /*var flows = this.state.flows.map(function(flow){
           return <div>{flow.request.method} {flow.request.scheme}://{flow.request.host}{flow.request.path}</div>;
       }); *//**/
       x = "Flow";
       i = 12;
       while(i--) x += x;
       return React.DOM.div(null, React.DOM.pre(null, x));
   }
});
/** @jsx React.DOM */

var EventLog = React.createClass({displayName: 'EventLog',
	getInitialState:function(){
		return {
			log: []
		};
	},
	componentDidMount:function(){
		this.log = EventLogStore.getView();
		this.log.addListener("change",this.onEventLogChange);
	},
	componentWillUnmount:function(){
		this.log.removeListener("change",this.onEventLogChange);
		this.log.close();
	},
	onEventLogChange:function(){
		this.setState({
			log: this.log.getAll()
		});
	},
	close:function(){
		SettingsActions.update({
			showEventLog: false
		});
	},
    render:function(){
    	var messages = this.state.log.map(function(row)  {return React.DOM.div({key: row.id}, row.message);});
        return (
            React.DOM.div({className: "eventlog"}, 
            React.DOM.pre(null, 
            React.DOM.i({className: "fa fa-close close-button", onClick: this.close}), 
            messages
            )
            )
        );
    }
});
/** @jsx React.DOM */

var Footer = React.createClass({displayName: 'Footer',
    render:function(){
        return (
            React.DOM.footer(null, 
                React.DOM.span({className: "label label-success"}, "transparent mode")
            )
        );
    }
});
/** @jsx React.DOM */

//TODO: Move out of here, just a stub.
var Reports = React.createClass({displayName: 'Reports',
   render:function(){
       return (React.DOM.div(null, "Report Editor"));
   }
});



var ProxyAppMain = React.createClass({displayName: 'ProxyAppMain',
    getInitialState:function(){
      return { settings: SettingsStore.getAll() };
    },
    componentDidMount:function(){
      SettingsStore.addListener("change", this.onSettingsChange);
    },
    componentWillUnmount:function(){
      SettingsStore.removeListener("change", this.onSettingsChange);
    },
    onSettingsChange:function(){
      console.log("onSettingsChange");
      this.setState({settings: SettingsStore.getAll()});
    },
    render:function() {
      return (
        React.DOM.div({id: "container"}, 
          Header({settings: this.state.settings}), 
          React.DOM.div({id: "main"}, this.props.activeRouteHandler(null)), 
          this.state.settings.showEventLog ? EventLog(null) : null, 
          Footer(null)
        )
      );
    }
});


var ProxyApp = (
  ReactRouter.Routes({location: "hash"}, 
    ReactRouter.Route({name: "app", path: "/", handler: ProxyAppMain}, 
        ReactRouter.Route({name: "main", handler: TrafficTable}), 
        ReactRouter.Route({name: "reports", handler: Reports}), 
        ReactRouter.Redirect({to: "main"})
    )
  )
);

$(function(){

  Connection.init();
  app = React.renderComponent(ProxyApp, document.body);

});
//# sourceMappingURL=app.js.map