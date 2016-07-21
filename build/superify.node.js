/*!
Copyright (C) 2015 by WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
var
  has = Object.hasOwnProperty,
  defineProperty = Object.defineProperty,
  getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
  getOwnPropertyNames = Object.getOwnPropertyNames,
  getPrototypeOf = Object.getPrototypeOf,
  setPrototypeOf = Object.setPrototypeOf ||
                   function (o, p) { o.__proto__ = p; },
  wm = typeof WeakMap === 'function' ?
    new WeakMap() :
    (function (k, v) {
      function reset() {
        k = [];
        v = [];
      }
      reset();
      setInterval(reset, 1000);
      return {
        get: function (K) {
          return v[k.indexOf(K)];
        },
        set: function (K, V) {
          v[k.push(K) - 1] = V;
        }
      };
    }()),
  descriptor = {
    configurable: true,
    get: function get() {
      return wm.get(this) || superable(this);
    }
  }
;

function crawl(self) {
  var
    Super = function () {
      return constructor.apply(this, arguments);
    },
    constructor = trap(Super, 'constructor', 'value'),
    proto = self,
    i, desc, name, names, tobeDefined
  ;
  while ((proto = getPrototypeOf(proto))) {
    names = getOwnPropertyNames(proto);
    i = names.length;
    while (i--) {
      name = names[i];
      if (!has.call(Super, name)) {
        tobeDefined = false;
        desc = getOwnPropertyDescriptor(proto, name);
        if (has.call(desc, 'value')) {
          if (typeof desc.value === 'function') {
            tobeDefined = true;
            desc.value = trap(Super, name, 'value');
          }
        } else {
          if (has.call(desc, 'get')) {
            tobeDefined = true;
            desc.get = trap(Super, name, 'get');
          }
          if (has.call(desc, 'set')) {
            tobeDefined = true;
            desc.set = trap(Super, name, 'set');
          }
        }
        if (tobeDefined) {
          defineProperty(Super, name, desc);
        }
      }
    }
  }
  wm.set(Super, self);
  return Super;
}

function superable(self) {
  var Super = crawl(self);
  wm.set(self, Super);
  return Super;
}

function trap(Super, property, key) {
  return function () {
    var
      self = wm.get(Super),
      proto = getPrototypeOf(self),
      parent = self,
      desc,
      parentDesc
    ;
    do {
      desc = getOwnPropertyDescriptor(parent, property);
    } while (
      !desc && (parent = getPrototypeOf(parent))
    );
    while ((parent = getPrototypeOf(parent))) {
      parentDesc = getOwnPropertyDescriptor(parent, property);
      if (parentDesc && parentDesc[key] !== desc[key]) {
        setPrototypeOf(self, parent);
        try {
          result = parentDesc[key].apply(self, arguments);
          setPrototypeOf(self, proto);
        } catch(e) {
          setPrototypeOf(self, proto);
          throw e;
        }
        return result;
      }
    }
  };
}

function superify(object) {
  defineProperty(
    typeof object === 'function' ?
      object.prototype : object,
    'super',
    descriptor
  );
  return object;
}

/* faster way for methods only
function trapMethod(Super, property) {
  return function () {
    var
      self = wm.get(Super),
      method = self[property],
      proto = getPrototypeOf(self),
      parent = proto,
      result
    ;
    while (method === parent[property]) {
      parent = getPrototypeOf(parent);
    }
    setPrototypeOf(self, parent);
    try {
      result = parent[property].apply(self, arguments);
      setPrototypeOf(self, proto);
    } catch(e) {
      setPrototypeOf(self, proto);
      throw e;
    }
    return result;
  };
}
// */
module.exports = superify;