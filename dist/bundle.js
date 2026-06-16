(function(){
  var __modules__ = {};
  var __cache__ = {};
  var __hmr__ = {};
  var __global__ = (typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : global));

  function __require__(id){
    if (__cache__[id]) return __cache__[id].exports;
    if (!__modules__[id]) throw new Error("Module not found: " + id);
    var module = { exports: {} };
    __cache__[id] = module;
    var hot = { accept: function(cb){ (__hmr__.listeners[id] = __hmr__.listeners[id] || []).push(cb); } };
    __modules__[id].call(module.exports, __require__, module, module.exports, hot);
    return module.exports;
  }

  
  __hmr__.listeners = {};
  __hmr__.applyUpdate = function(id, factorySrc){
    // eslint-disable-next-line no-eval
    var factory = eval("(" + factorySrc + ")");
    __modules__[id] = factory;
    if (__hmr__.listeners[id]) {
      __hmr__.listeners[id].forEach(function(cb){ cb(); });
    }
  };
  

  __global__.__graphite_bootstrap__ = function(mods, entry){
    __modules__ = mods;
    
    try {
      if (typeof WebSocket === "undefined" || typeof window === "undefined") throw new Error("no browser websocket");
      var proto = window.location.protocol === "https:" ? "wss" : "ws";
      var ws = new WebSocket(proto + "://" + window.location.host + "/__hmr");
      ws.onmessage = function(ev){
        var msg = JSON.parse(ev.data);
        if (msg.type === "update") {
          __hmr__.applyUpdate(msg.id, msg.factory);
          if (__cache__[msg.id]) { __cache__[msg.id] = undefined; __require__(msg.id); }
        }
      };
    } catch (e) {
      console.warn("[graphite] HMR disabled", e);
    }
    
    __require__(entry);
  };
})();
__graphite_bootstrap__({
"/Users/hichamelmefeddel/graphite/examples/basic/index.ts": function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const message_1 = require("/Users/hichamelmefeddel/graphite/examples/basic/message.ts");
console.log(message_1.message);

},
"/Users/hichamelmefeddel/graphite/examples/basic/message.ts": function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.message = void 0;
exports.message = "Hello from Graphite (HMR)!";

}
}, "/Users/hichamelmefeddel/graphite/examples/basic/index.ts");
