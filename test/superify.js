//remove:
var superify = require('../build/superify.node.js');
//:remove

wru.test([
  {
    name: "main",
    test: function () {
      wru.assert(typeof superify == "function");
    }
  }, {
    name: 'basic',
    test: function () {

      var result = [];

      function A() {
        result.push('A');
      }

      A.prototype = superify({
        constructor: A,
        method: function () {
          result.push('method from A');
        },
        get runtime() {
          result.push('runtime A getter');
        }
      });

      function B() {
        this.super();
        result.push('B');
      }

      B.prototype = Object.create(A.prototype, {
        constructor: {value: B},
        method: {value: function () {
          this.super.method();
          result.push('method from B');
        }}
      });

      function C() {
        this.super();
        result.push('C');
      }

      C.prototype = Object.create(B.prototype, {
        constructor: {value: C},
        runtime: {get: function () {
          this.super.runtime;
          result.push('runtime C getter');
        }}
      });

      var c = new C;
      wru.assert(result.splice(0, result.length).join(',') === 'A,B,C');

      c.method();
      wru.assert(result.splice(0, result.length).join(',') === 'method from A,method from B');

      c.runtime;
      wru.assert(result.splice(0, result.length).join(',') === 'runtime A getter,runtime C getter');

    }
  }
]);
