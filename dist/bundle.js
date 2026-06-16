(function(){
  var __modules__ = {};
  var __cache__ = {};
  var __hmr__ = null;
  var __global__ = (typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : global));

  function __require__(id){
    if (__cache__[id]) return __cache__[id].exports;
    if (!__modules__[id]) throw new Error("Module not found: " + id);
    var module = { exports: {} };
    __cache__[id] = module;
    var hot = undefined;
    __modules__[id].call(module.exports, __require__, module, module.exports, hot);
    return module.exports;
  }

  

  __global__.__graphite_bootstrap__ = function(mods, entry){
    __modules__ = mods;
    
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
