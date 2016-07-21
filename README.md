superify
========

[![build status](https://secure.travis-ci.org/WebReflection/superify.svg)](http://travis-ci.org/WebReflection/superify)

A simple migration friendly library to bring `this.super()` or `this.super.method()` on older software.

It could be used once like `superify(Object.prototype)` to have it available everywhere or it can be used to make it `super` capable the class at the root of some inheritance.

# Example
```js
function A() {
  console.log('A');
}

A.prototype = withSuperContext({
  constructor: A,
  method: function () {
    console.log('method from A');
  },
  get runtime() {
    console.log('runtime A getter');
  }
});

function B() {
  this.super();
  console.log('B');
}

B.prototype = Object.create(A.prototype, {
  constructor: {value: B},
  method: {value: function () {
    this.super.method();
    console.log('method from B');
  }}
});

function C() {
  this.super();
  console.log('C');
}

C.prototype = Object.create(B.prototype, {
  constructor: {value: C},
  runtime: {get: function () {
    this.super.runtime;
    console.log('runtime C getter');
  }}
});


// test
var c = new C();
// A, B, C

c.method();
c.runtime;
```