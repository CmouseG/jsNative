/**
*@description wrap native methods and offer the method to let native call js.
**/
(function() {

	function Events(type,target){
		this.type = type;
		this.target = target;
	}
	function NativeBridge(){
		this.methods = {};
		this.events = {
			before:[],
			after:[],
			error:[]
		};
	}
	NativeBridge.BEFORE = "before";
	NativeBridge.AFTER = "after";
	NativeBridge.ERROR = "error";
	NativeBridge.triggerEvents=function(bridge,type,e){
		var events = bridge.events[type];
		if( Array.isArray(events)){
			for(var i=0;i<events.length;i++){
				try{
					events[i].call(window,e);
				}catch(e){
					//do nothing
				}
			}
		}
	}
	NativeBridge.prototype={
		call:function(name){

			//trigger the before event
			NativeBridge.triggerEvents(this,NativeBridge.BEFORE,new Events(
				NativeBridge.BEFORE,{
					name:name
				}));

			var args = Array.prototype.slice.call(arguments,1);

			try{
				this.methods[name].apply(window,args);
			}catch(e){
				//trigger the error event
				NativeBridge.triggerEvents(this,NativeBridge.ERROR,new Events(
				NativeBridge.ERROR,{
					name:name,
					error:e
				}));
				return;
			}
			//trigger the after event
			NativeBridge.triggerEvents(this,NativeBridge.AFTER,new Events(
				NativeBridge.AFTER,{
					name:name
				}));
			
		},
		/**
		*@description add a event
		* event types: before,after,error
		* when NativeBridge.call be call,it will trigger the "before" event first,
		* if any error occurs when calling the medthod,the "error" event will be triggered,
		* or else it will trigger the "after" event
		**/
		on:function(type,func){
			if(typeof name !=="string" || typeof func !== "function"){
				throw new Error("arguments error");
			}

			if(Array.isArray(this.events[type])){
				this.events[type].push(func);
			}
		},
		remove:function(type,func){
			if(typeof name !=="string" || typeof func !== "function"){
				throw new Error("arguments error");
			}

			var events = this.events[type];
			this.events[type] = [];
			if(Array.isArray(events)){
				for(var i = 0;i<events.length;i++){
					if(func!==events[i]){
						this.events[type].push(func);
					}
				}
			}

		},
		register:function(name,func){
			if(typeof name !=="string" || typeof func !== "function"){
				throw new Error("arguments error");
			}
			this.methods[name]=func;
		},
		unRegister:function(name){
			if(typeof name !=="string"){
				throw new Error("arguments error");
			}
			if(this.methods[name]){
				delete this.methods[name];
			}
		}
	}
	function factory(){
		var jsNative = {
			platform:"undefined"
		};
		return jsNative;
	}

	/**
	*@description obey the specifications
	**/
	if(typeof define === "function" && define.amd){
		define(factory);
	}else if(typeof exports !== 'undefined'){
		exports.jsNative = factory();
	}else{
		window.jsNative = factory();
	}
})()