var DateFns = (function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var O = 'object';

	var check = function (it) {
	  return it && it.Math == Math && it;
	}; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


	var global_1 = // eslint-disable-next-line no-undef
	check(typeof globalThis == O && globalThis) || check(typeof window == O && window) || check(typeof self == O && self) || check(typeof commonjsGlobal == O && commonjsGlobal) || // eslint-disable-next-line no-new-func
	Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 'a', {
	    get: function () {
	      return 7;
	    }
	  }).a != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
	  1: 2
	}, 1); // `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;
	var objectPropertyIsEnumerable = {
	  f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var split = ''.split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

	var indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	// https://tc39.github.io/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string

	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var document = global_1.document; // typeof document.createElement is 'object' in old IE

	var EXISTS = isObject(document) && isObject(document.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document.createElement(it) : {};
	};

	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () {
	      return 7;
	    }
	  }).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) {
	    /* empty */
	  }
	  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
	};
	var objectGetOwnPropertyDescriptor = {
	  f: f$1
	};

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  }

	  return it;
	};

	var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty

	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (ie8DomDefine) try {
	    return nativeDefineProperty(O, P, Attributes);
	  } catch (error) {
	    /* empty */
	  }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};
	var objectDefineProperty = {
	  f: f$2
	};

	var hide = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var setGlobal = function (key, value) {
	  try {
	    hide(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  }

	  return value;
	};

	var shared = createCommonjsModule(function (module) {
	  var SHARED = '__core-js_shared__';
	  var store = global_1[SHARED] || setGlobal(SHARED, {});
	  (module.exports = function (key, value) {
	    return store[key] || (store[key] = value !== undefined ? value : {});
	  })('versions', []).push({
	    version: '3.1.3',
	    mode: 'global',
	    copyright: '?? 2019 Denis Pushkarev (zloirock.ru)'
	  });
	});

	var functionToString = shared('native-function-to-string', Function.toString);

	var WeakMap = global_1.WeakMap;
	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(functionToString.call(WeakMap));

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var keys = shared('keys');

	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$1 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;

	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    }

	    return state;
	  };
	};

	if (nativeWeakMap) {
	  var store = new WeakMap$1();
	  var wmget = store.get;
	  var wmhas = store.has;
	  var wmset = store.set;

	  set = function (it, metadata) {
	    wmset.call(store, it, metadata);
	    return metadata;
	  };

	  get = function (it) {
	    return wmget.call(store, it) || {};
	  };

	  has$1 = function (it) {
	    return wmhas.call(store, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;

	  set = function (it, metadata) {
	    hide(it, STATE, metadata);
	    return metadata;
	  };

	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };

	  has$1 = function (it) {
	    return has(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var redefine = createCommonjsModule(function (module) {
	  var getInternalState = internalState.get;
	  var enforceInternalState = internalState.enforce;
	  var TEMPLATE = String(functionToString).split('toString');
	  shared('inspectSource', function (it) {
	    return functionToString.call(it);
	  });
	  (module.exports = function (O, key, value, options) {
	    var unsafe = options ? !!options.unsafe : false;
	    var simple = options ? !!options.enumerable : false;
	    var noTargetGet = options ? !!options.noTargetGet : false;

	    if (typeof value == 'function') {
	      if (typeof key == 'string' && !has(value, 'name')) hide(value, 'name', key);
	      enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
	    }

	    if (O === global_1) {
	      if (simple) O[key] = value;else setGlobal(key, value);
	      return;
	    } else if (!unsafe) {
	      delete O[key];
	    } else if (!noTargetGet && O[key]) {
	      simple = true;
	    }

	    if (simple) O[key] = value;else hide(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	  })(Function.prototype, 'toString', function toString() {
	    return typeof this == 'function' && getInternalState(this).source || functionToString.call(this);
	  });
	});

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace]) : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor; // `ToInteger` abstract operation
	// https://tc39.github.io/ecma262/#sec-tointeger

	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min; // `ToLength` abstract operation
	// https://tc39.github.io/ecma262/#sec-tolength

	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min; // Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(length, length).

	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value; // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare

	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++]; // eslint-disable-next-line no-self-compare

	      if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
	    } else for (; length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    }
	    return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var indexOf = arrayIncludes.indexOf;

	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;

	  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys


	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }

	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype'); // `Object.getOwnPropertyNames` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames

	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys$1);
	};

	var objectGetOwnPropertyNames = {
	  f: f$3
	};

	var f$4 = Object.getOwnPropertySymbols;
	var objectGetOwnPropertySymbols = {
	  f: f$4
	};

	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == 'function' ? fails(detection) : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';
	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/

	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;

	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }

	  if (target) for (key in source) {
	    sourceProperty = source[key];

	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];

	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contained in target

	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    } // add a flag to not completely full polyfills


	    if (options.sham || targetProperty && targetProperty.sham) {
	      hide(sourceProperty, 'sham', true);
	    } // extend global


	    redefine(target, key, sourceProperty, options);
	  }
	};

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  }

	  return it;
	};

	var bindContext = function (fn, that, length) {
	  aFunction$1(fn);
	  if (that === undefined) return fn;

	  switch (length) {
	    case 0:
	      return function () {
	        return fn.call(that);
	      };

	    case 1:
	      return function (a) {
	        return fn.call(that, a);
	      };

	    case 2:
	      return function (a, b) {
	        return fn.call(that, a, b);
	      };

	    case 3:
	      return function (a, b, c) {
	        return fn.call(that, a, b, c);
	      };
	  }

	  return function ()
	  /* ...args */
	  {
	    return fn.apply(that, arguments);
	  };
	};

	// https://tc39.github.io/ecma262/#sec-toobject

	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	// https://tc39.github.io/ecma262/#sec-isarray

	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  // Chrome 38 Symbol has incorrect toString conversion
	  // eslint-disable-next-line no-undef
	  return !String(Symbol());
	});

	var Symbol$1 = global_1.Symbol;
	var store$1 = shared('wks');

	var wellKnownSymbol = function (name) {
	  return store$1[name] || (store$1[name] = nativeSymbol && Symbol$1[name] || (nativeSymbol ? Symbol$1 : uid)('Symbol.' + name));
	};

	var SPECIES = wellKnownSymbol('species'); // `ArraySpeciesCreate` abstract operation
	// https://tc39.github.io/ecma262/#sec-arrayspeciescreate

	var arraySpeciesCreate = function (originalArray, length) {
	  var C;

	  if (isArray(originalArray)) {
	    C = originalArray.constructor; // cross-realm fallback

	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;else if (isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) C = undefined;
	    }
	  }

	  return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var push = [].push; // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation

	var createMethod$1 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = bindContext(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var value, result;

	    for (; length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);

	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	            case 3:
	              return true;
	            // some

	            case 5:
	              return value;
	            // find

	            case 6:
	              return index;
	            // findIndex

	            case 2:
	              push.call(target, value);
	            // filter
	          } else if (IS_EVERY) return false; // every
	      }
	    }

	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$1(0),
	  // `Array.prototype.map` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.map
	  map: createMethod$1(1),
	  // `Array.prototype.filter` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
	  filter: createMethod$1(2),
	  // `Array.prototype.some` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.some
	  some: createMethod$1(3),
	  // `Array.prototype.every` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.every
	  every: createMethod$1(4),
	  // `Array.prototype.find` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.find
	  find: createMethod$1(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$1(6)
	};

	// https://tc39.github.io/ecma262/#sec-object.keys

	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// https://tc39.github.io/ecma262/#sec-object.defineproperties

	var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;

	  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);

	  return O;
	};

	var html = getBuiltIn('document', 'documentElement');

	var IE_PROTO = sharedKey('IE_PROTO');
	var PROTOTYPE = 'prototype';

	var Empty = function () {
	  /* empty */
	}; // Create object with fake `null` prototype: use iframe Object with cleared prototype


	var createDict = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var length = enumBugKeys.length;
	  var lt = '<';
	  var script = 'script';
	  var gt = '>';
	  var js = 'java' + script + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  iframe.src = String(js);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + script + gt + 'document.F=Object' + lt + '/' + script + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;

	  while (length--) delete createDict[PROTOTYPE][enumBugKeys[length]];

	  return createDict();
	}; // `Object.create` method
	// https://tc39.github.io/ecma262/#sec-object.create


	var objectCreate = Object.create || function create(O, Properties) {
	  var result;

	  if (O !== null) {
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty();
	    Empty[PROTOTYPE] = null; // add "__proto__" for Object.getPrototypeOf polyfill

	    result[IE_PROTO] = O;
	  } else result = createDict();

	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	hiddenKeys[IE_PROTO] = true;

	var UNSCOPABLES = wellKnownSymbol('unscopables');
	var ArrayPrototype = Array.prototype; // Array.prototype[@@unscopables]
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

	if (ArrayPrototype[UNSCOPABLES] == undefined) {
	  hide(ArrayPrototype, UNSCOPABLES, objectCreate(null));
	} // add a key to Array.prototype[@@unscopables]


	var addToUnscopables = function (key) {
	  ArrayPrototype[UNSCOPABLES][key] = true;
	};

	var $findIndex = arrayIteration.findIndex;
	var FIND_INDEX = 'findIndex';
	var SKIPS_HOLES = true; // Shouldn't skip holes

	if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () {
	  SKIPS_HOLES = false;
	}); // `Array.prototype.findIndex` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.findindex

	_export({
	  target: 'Array',
	  proto: true,
	  forced: SKIPS_HOLES
	}, {
	  findIndex: function findIndex(callbackfn
	  /* , that = undefined */
	  ) {
	    return $findIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	}); // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

	addToUnscopables(FIND_INDEX);

	/**
	 * @name toDate
	 * @category Common Helpers
	 * @summary Convert the given argument to an instance of Date.
	 *
	 * @description
	 * Convert the given argument to an instance of Date.
	 *
	 * If the argument is an instance of Date, the function returns its clone.
	 *
	 * If the argument is a number, it is treated as a timestamp.
	 *
	 * If the argument is none of the above, the function returns Invalid Date.
	 *
	 * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
	 *
	 * @param {Date|Number} argument - the value to convert
	 * @returns {Date} the parsed date in the local time zone
	 * @throws {TypeError} 1 argument required
	 *
	 * @example
	 * // Clone the date:
	 * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
	 * //=> Tue Feb 11 2014 11:30:30
	 *
	 * @example
	 * // Convert the timestamp to date:
	 * const result = toDate(1392098430000)
	 * //=> Tue Feb 11 2014 11:30:30
	 */
	function toDate(argument) {
	  if (arguments.length < 1) {
	    throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
	  }

	  var argStr = Object.prototype.toString.call(argument); // Clone the date

	  if (argument instanceof Date || typeof argument === 'object' && argStr === '[object Date]') {
	    // Prevent the date to lose the milliseconds when passed to new Date() in IE10
	    return new Date(argument.getTime());
	  } else if (typeof argument === 'number' || argStr === '[object Number]') {
	    return new Date(argument);
	  } else {
	    if ((typeof argument === 'string' || argStr === '[object String]') && typeof console !== 'undefined') {
	      // eslint-disable-next-line no-console
	      console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule"); // eslint-disable-next-line no-console

	      console.warn(new Error().stack);
	    }

	    return new Date(NaN);
	  }
	}

	function toInteger$1(dirtyNumber) {
	  if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
	    return NaN;
	  }

	  var number = Number(dirtyNumber);

	  if (isNaN(number)) {
	    return number;
	  }

	  return number < 0 ? Math.ceil(number) : Math.floor(number);
	}

	/**
	 * @name addMilliseconds
	 * @category Millisecond Helpers
	 * @summary Add the specified number of milliseconds to the given date.
	 *
	 * @description
	 * Add the specified number of milliseconds to the given date.
	 *
	 * ### v2.0.0 breaking changes:
	 *
	 * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
	 *
	 * @param {Date|Number} date - the date to be changed
	 * @param {Number} amount - the amount of milliseconds to be added
	 * @returns {Date} the new date with the milliseconds added
	 * @throws {TypeError} 2 arguments required
	 *
	 * @example
	 * // Add 750 milliseconds to 10 July 2014 12:45:30.000:
	 * var result = addMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
	 * //=> Thu Jul 10 2014 12:45:30.750
	 */

	function addMilliseconds(dirtyDate, dirtyAmount) {
	  if (arguments.length < 2) {
	    throw new TypeError('2 arguments required, but only ' + arguments.length + ' present');
	  }

	  var timestamp = toDate(dirtyDate).getTime();
	  var amount = toInteger$1(dirtyAmount);
	  return new Date(timestamp + amount);
	}

	var MILLISECONDS_IN_MINUTE = 60000;
	/**
	 * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
	 * They usually appear for dates that denote time before the timezones were introduced
	 * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
	 * and GMT+01:00:00 after that date)
	 *
	 * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
	 * which would lead to incorrect calculations.
	 *
	 * This function returns the timezone offset in milliseconds that takes seconds in account.
	 */

	function getTimezoneOffsetInMilliseconds(dirtyDate) {
	  var date = new Date(dirtyDate.getTime());
	  var baseTimezoneOffset = date.getTimezoneOffset();
	  date.setSeconds(0, 0);
	  var millisecondsPartOfTimezoneOffset = date.getTime() % MILLISECONDS_IN_MINUTE;
	  return baseTimezoneOffset * MILLISECONDS_IN_MINUTE + millisecondsPartOfTimezoneOffset;
	}

	/**
	 * @name isValid
	 * @category Common Helpers
	 * @summary Is the given date valid?
	 *
	 * @description
	 * Returns false if argument is Invalid Date and true otherwise.
	 * Argument is converted to Date using `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
	 * Invalid Date is a Date, whose time value is NaN.
	 *
	 * Time value of Date: http://es5.github.io/#x15.9.1.1
	 *
	 * ### v2.0.0 breaking changes:
	 *
	 * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
	 *
	 * - Now `isValid` doesn't throw an exception
	 *   if the first argument is not an instance of Date.
	 *   Instead, argument is converted beforehand using `toDate`.
	 *
	 *   Examples:
	 *
	 *   | `isValid` argument        | Before v2.0.0 | v2.0.0 onward |
	 *   |---------------------------|---------------|---------------|
	 *   | `new Date()`              | `true`        | `true`        |
	 *   | `new Date('2016-01-01')`  | `true`        | `true`        |
	 *   | `new Date('')`            | `false`       | `false`       |
	 *   | `new Date(1488370835081)` | `true`        | `true`        |
	 *   | `new Date(NaN)`           | `false`       | `false`       |
	 *   | `'2016-01-01'`            | `TypeError`   | `true`        |
	 *   | `''`                      | `TypeError`   | `false`       |
	 *   | `1488370835081`           | `TypeError`   | `true`        |
	 *   | `NaN`                     | `TypeError`   | `false`       |
	 *
	 *   We introduce this change to make *date-fns* consistent with ECMAScript behavior
	 *   that try to coerce arguments to the expected type
	 *   (which is also the case with other *date-fns* functions).
	 *
	 * @param {*} date - the date to check
	 * @returns {Boolean} the date is valid
	 * @throws {TypeError} 1 argument required
	 *
	 * @example
	 * // For the valid date:
	 * var result = isValid(new Date(2014, 1, 31))
	 * //=> true
	 *
	 * @example
	 * // For the value, convertable into a date:
	 * var result = isValid(1393804800000)
	 * //=> true
	 *
	 * @example
	 * // For the invalid date:
	 * var result = isValid(new Date(''))
	 * //=> false
	 */

	function isValid(dirtyDate) {
	  if (arguments.length < 1) {
	    throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
	  }

	  var date = toDate(dirtyDate);
	  return !isNaN(date);
	}

	/**
	 * @name endOfTomorrow
	 * @category Day Helpers
	 * @summary Return the end of tomorrow.
	 * @pure false
	 *
	 * @description
	 * Return the end of tomorrow.
	 *
	 * > ?????? Please note that this function is not present in the FP submodule as
	 * > it uses `Date.now()` internally hence impure and can't be safely curried.
	 *
	 * ### v2.0.0 breaking changes:
	 *
	 * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
	 *
	 * @returns {Date} the end of tomorrow
	 *
	 * @example
	 * // If today is 6 October 2014:
	 * var result = endOfTomorrow()
	 * //=> Tue Oct 7 2014 23:59:59.999
	 */

	/**
	 * @name endOfYesterday
	 * @category Day Helpers
	 * @summary Return the end of yesterday.
	 * @pure false
	 *
	 * @description
	 * Return the end of yesterday.
	 *
	 * > ?????? Please note that this function is not present in the FP submodule as
	 * > it uses `Date.now()` internally hence impure and can't be safely curried.
	 *
	 * ### v2.0.0 breaking changes:
	 *
	 * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
	 *
	 * @returns {Date} the end of yesterday
	 *
	 * @example
	 * // If today is 6 October 2014:
	 * var result = endOfYesterday()
	 * //=> Sun Oct 5 2014 23:59:59.999
	 */

	var formatDistanceLocale = {
	  lessThanXSeconds: {
	    one: 'less than a second',
	    other: 'less than {{count}} seconds'
	  },
	  xSeconds: {
	    one: '1 second',
	    other: '{{count}} seconds'
	  },
	  halfAMinute: 'half a minute',
	  lessThanXMinutes: {
	    one: 'less than a minute',
	    other: 'less than {{count}} minutes'
	  },
	  xMinutes: {
	    one: '1 minute',
	    other: '{{count}} minutes'
	  },
	  aboutXHours: {
	    one: 'about 1 hour',
	    other: 'about {{count}} hours'
	  },
	  xHours: {
	    one: '1 hour',
	    other: '{{count}} hours'
	  },
	  xDays: {
	    one: '1 day',
	    other: '{{count}} days'
	  },
	  aboutXMonths: {
	    one: 'about 1 month',
	    other: 'about {{count}} months'
	  },
	  xMonths: {
	    one: '1 month',
	    other: '{{count}} months'
	  },
	  aboutXYears: {
	    one: 'about 1 year',
	    other: 'about {{count}} years'
	  },
	  xYears: {
	    one: '1 year',
	    other: '{{count}} years'
	  },
	  overXYears: {
	    one: 'over 1 year',
	    other: 'over {{count}} years'
	  },
	  almostXYears: {
	    one: 'almost 1 year',
	    other: 'almost {{count}} years'
	  }
	};
	function formatDistance(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale[token] === 'string') {
	    result = formatDistanceLocale[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale[token].one;
	  } else {
	    result = formatDistanceLocale[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'in ' + result;
	    } else {
	      return result + ' ago';
	    }
	  }

	  return result;
	}

	function buildFormatLongFn(args) {
	  return function (dirtyOptions) {
	    var options = dirtyOptions || {};
	    var width = options.width ? String(options.width) : args.defaultWidth;
	    var format = args.formats[width] || args.formats[args.defaultWidth];
	    return format;
	  };
	}

	var dateFormats = {
	  full: 'EEEE, MMMM do, y',
	  long: 'MMMM do, y',
	  medium: 'MMM d, y',
	  short: 'MM/dd/yyyy'
	};
	var timeFormats = {
	  full: 'h:mm:ss a zzzz',
	  long: 'h:mm:ss a z',
	  medium: 'h:mm:ss a',
	  short: 'h:mm a'
	};
	var dateTimeFormats = {
	  full: "{{date}} 'at' {{time}}",
	  long: "{{date}} 'at' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong = {
	  date: buildFormatLongFn({
	    formats: dateFormats,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale = {
	  lastWeek: "'last' eeee 'at' p",
	  yesterday: "'yesterday at' p",
	  today: "'today at' p",
	  tomorrow: "'tomorrow at' p",
	  nextWeek: "eeee 'at' p",
	  other: 'P'
	};
	function formatRelative(token, _date, _baseDate, _options) {
	  return formatRelativeLocale[token];
	}

	function buildLocalizeFn(args) {
	  return function (dirtyIndex, dirtyOptions) {
	    var options = dirtyOptions || {};
	    var context = options.context ? String(options.context) : 'standalone';
	    var valuesArray;

	    if (context === 'formatting' && args.formattingValues) {
	      var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
	      var width = options.width ? String(options.width) : defaultWidth;
	      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
	    } else {
	      var _defaultWidth = args.defaultWidth;

	      var _width = options.width ? String(options.width) : args.defaultWidth;

	      valuesArray = args.values[_width] || args.values[_defaultWidth];
	    }

	    var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex;
	    return valuesArray[index];
	  };
	}

	var eraValues = {
	  narrow: ['B', 'A'],
	  abbreviated: ['BC', 'AD'],
	  wide: ['Before Christ', 'Anno Domini']
	};
	var quarterValues = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
	  wide: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'] // Note: in English, the names of days of the week and months are capitalized.
	  // If you are making a new locale based on this one, check if the same is true for the language you're working on.
	  // Generally, formatted dates should look like they are in the middle of a sentence,
	  // e.g. in Spanish language the weekdays and months should be in the lowercase.

	};
	var monthValues = {
	  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	  wide: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	};
	var dayValues = {
	  narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
	  short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
	  abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	  wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	};
	var dayPeriodValues = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'mi',
	    noon: 'n',
	    morning: 'morning',
	    afternoon: 'afternoon',
	    evening: 'evening',
	    night: 'night'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'midnight',
	    noon: 'noon',
	    morning: 'morning',
	    afternoon: 'afternoon',
	    evening: 'evening',
	    night: 'night'
	  },
	  wide: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'midnight',
	    noon: 'noon',
	    morning: 'morning',
	    afternoon: 'afternoon',
	    evening: 'evening',
	    night: 'night'
	  }
	};
	var formattingDayPeriodValues = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'mi',
	    noon: 'n',
	    morning: 'in the morning',
	    afternoon: 'in the afternoon',
	    evening: 'in the evening',
	    night: 'at night'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'midnight',
	    noon: 'noon',
	    morning: 'in the morning',
	    afternoon: 'in the afternoon',
	    evening: 'in the evening',
	    night: 'at night'
	  },
	  wide: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'midnight',
	    noon: 'noon',
	    morning: 'in the morning',
	    afternoon: 'in the afternoon',
	    evening: 'in the evening',
	    night: 'at night'
	  }
	};

	function ordinalNumber(dirtyNumber, _dirtyOptions) {
	  var number = Number(dirtyNumber); // If ordinal numbers depend on context, for example,
	  // if they are different for different grammatical genders,
	  // use `options.unit`:
	  //
	  //   var options = dirtyOptions || {}
	  //   var unit = String(options.unit)
	  //
	  // where `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
	  // 'day', 'hour', 'minute', 'second'

	  var rem100 = number % 100;

	  if (rem100 > 20 || rem100 < 10) {
	    switch (rem100 % 10) {
	      case 1:
	        return number + 'st';

	      case 2:
	        return number + 'nd';

	      case 3:
	        return number + 'rd';
	    }
	  }

	  return number + 'th';
	}

	var localize = {
	  ordinalNumber: ordinalNumber,
	  era: buildLocalizeFn({
	    values: eraValues,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues,
	    defaultFormattingWidth: 'wide'
	  })
	};

	function buildMatchPatternFn(args) {
	  return function (dirtyString, dirtyOptions) {
	    var string = String(dirtyString);
	    var options = dirtyOptions || {};
	    var matchResult = string.match(args.matchPattern);

	    if (!matchResult) {
	      return null;
	    }

	    var matchedString = matchResult[0];
	    var parseResult = string.match(args.parsePattern);

	    if (!parseResult) {
	      return null;
	    }

	    var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
	    value = options.valueCallback ? options.valueCallback(value) : value;
	    return {
	      value: value,
	      rest: string.slice(matchedString.length)
	    };
	  };
	}

	function buildMatchFn(args) {
	  return function (dirtyString, dirtyOptions) {
	    var string = String(dirtyString);
	    var options = dirtyOptions || {};
	    var width = options.width;
	    var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
	    var matchResult = string.match(matchPattern);

	    if (!matchResult) {
	      return null;
	    }

	    var matchedString = matchResult[0];
	    var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
	    var value;

	    if (Object.prototype.toString.call(parsePatterns) === '[object Array]') {
	      value = parsePatterns.findIndex(function (pattern) {
	        return pattern.test(string);
	      });
	    } else {
	      value = findKey(parsePatterns, function (pattern) {
	        return pattern.test(string);
	      });
	    }

	    value = args.valueCallback ? args.valueCallback(value) : value;
	    value = options.valueCallback ? options.valueCallback(value) : value;
	    return {
	      value: value,
	      rest: string.slice(matchedString.length)
	    };
	  };
	}

	function findKey(object, predicate) {
	  for (var key in object) {
	    if (object.hasOwnProperty(key) && predicate(object[key])) {
	      return key;
	    }
	  }
	}

	var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
	var parseOrdinalNumberPattern = /\d+/i;
	var matchEraPatterns = {
	  narrow: /^(b|a)/i,
	  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
	  wide: /^(before christ|before common era|anno domini|common era)/i
	};
	var parseEraPatterns = {
	  any: [/^b/i, /^(a|c)/i]
	};
	var matchQuarterPatterns = {
	  narrow: /^[1234]/i,
	  abbreviated: /^q[1234]/i,
	  wide: /^[1234](th|st|nd|rd)? quarter/i
	};
	var parseQuarterPatterns = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
	  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
	};
	var parseMonthPatterns = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns = {
	  narrow: /^[smtwf]/i,
	  short: /^(su|mo|tu|we|th|fr|sa)/i,
	  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
	  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
	};
	var parseDayPatterns = {
	  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
	  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
	};
	var matchDayPeriodPatterns = {
	  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
	  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
	};
	var parseDayPeriodPatterns = {
	  any: {
	    am: /^a/i,
	    pm: /^p/i,
	    midnight: /^mi/i,
	    noon: /^no/i,
	    morning: /morning/i,
	    afternoon: /afternoon/i,
	    evening: /evening/i,
	    night: /night/i
	  }
	};
	var match = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern,
	    parsePattern: parseOrdinalNumberPattern,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary English locale (United States).
	 * @language English
	 * @iso-639-2 eng
	 * @author Sasha Koss [@kossnocorp]{@link https://github.com/kossnocorp}
	 * @author Lesha Koss [@leshakoss]{@link https://github.com/leshakoss}
	 */

	var locale = {
	  formatDistance: formatDistance,
	  formatLong: formatLong,
	  formatRelative: formatRelative,
	  localize: localize,
	  match: match,
	  options: {
	    weekStartsOn: 0
	    /* Sunday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	/**
	 * @name subMilliseconds
	 * @category Millisecond Helpers
	 * @summary Subtract the specified number of milliseconds from the given date.
	 *
	 * @description
	 * Subtract the specified number of milliseconds from the given date.
	 *
	 * ### v2.0.0 breaking changes:
	 *
	 * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
	 *
	 * @param {Date|Number} date - the date to be changed
	 * @param {Number} amount - the amount of milliseconds to be subtracted
	 * @returns {Date} the new date with the milliseconds subtracted
	 * @throws {TypeError} 2 arguments required
	 *
	 * @example
	 * // Subtract 750 milliseconds from 10 July 2014 12:45:30.000:
	 * var result = subMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
	 * //=> Thu Jul 10 2014 12:45:29.250
	 */

	function subMilliseconds(dirtyDate, dirtyAmount) {
	  if (arguments.length < 2) {
	    throw new TypeError('2 arguments required, but only ' + arguments.length + ' present');
	  }

	  var amount = toInteger$1(dirtyAmount);
	  return addMilliseconds(dirtyDate, -amount);
	}

	function addLeadingZeros(number, targetLength) {
	  var sign = number < 0 ? '-' : '';
	  var output = Math.abs(number).toString();

	  while (output.length < targetLength) {
	    output = '0' + output;
	  }

	  return sign + output;
	}

	/*
	 * |     | Unit                           |     | Unit                           |
	 * |-----|--------------------------------|-----|--------------------------------|
	 * |  a  | AM, PM                         |  A* |                                |
	 * |  d  | Day of month                   |  D  |                                |
	 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
	 * |  m  | Minute                         |  M  | Month                          |
	 * |  s  | Second                         |  S  | Fraction of second             |
	 * |  y  | Year (abs)                     |  Y  |                                |
	 *
	 * Letters marked by * are not implemented but reserved by Unicode standard.
	 */

	var formatters = {
	  // Year
	  y: function (date, token) {
	    // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
	    // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
	    // |----------|-------|----|-------|-------|-------|
	    // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
	    // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
	    // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
	    // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
	    // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |
	    var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

	    var year = signedYear > 0 ? signedYear : 1 - signedYear;
	    return addLeadingZeros(token === 'yy' ? year % 100 : year, token.length);
	  },
	  // Month
	  M: function (date, token) {
	    var month = date.getUTCMonth();
	    return token === 'M' ? String(month + 1) : addLeadingZeros(month + 1, 2);
	  },
	  // Day of the month
	  d: function (date, token) {
	    return addLeadingZeros(date.getUTCDate(), token.length);
	  },
	  // AM or PM
	  a: function (date, token) {
	    var dayPeriodEnumValue = date.getUTCHours() / 12 >= 1 ? 'pm' : 'am';

	    switch (token) {
	      case 'a':
	      case 'aa':
	      case 'aaa':
	        return dayPeriodEnumValue.toUpperCase();

	      case 'aaaaa':
	        return dayPeriodEnumValue[0];

	      case 'aaaa':
	      default:
	        return dayPeriodEnumValue === 'am' ? 'a.m.' : 'p.m.';
	    }
	  },
	  // Hour [1-12]
	  h: function (date, token) {
	    return addLeadingZeros(date.getUTCHours() % 12 || 12, token.length);
	  },
	  // Hour [0-23]
	  H: function (date, token) {
	    return addLeadingZeros(date.getUTCHours(), token.length);
	  },
	  // Minute
	  m: function (date, token) {
	    return addLeadingZeros(date.getUTCMinutes(), token.length);
	  },
	  // Second
	  s: function (date, token) {
	    return addLeadingZeros(date.getUTCSeconds(), token.length);
	  },
	  // Fraction of second
	  S: function (date, token) {
	    var numberOfDigits = token.length;
	    var milliseconds = date.getUTCMilliseconds();
	    var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
	    return addLeadingZeros(fractionalSeconds, token.length);
	  }
	};

	var MILLISECONDS_IN_DAY$1 = 86400000; // This function will be a part of public API when UTC function will be implemented.
	// See issue: https://github.com/date-fns/date-fns/issues/376

	function getUTCDayOfYear(dirtyDate) {
	  if (arguments.length < 1) {
	    throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
	  }

	  var date = toDate(dirtyDate);
	  var timestamp = date.getTime();
	  date.setUTCMonth(0, 1);
	  date.setUTCHours(0, 0, 0, 0);
	  var startOfYearTimestamp = date.getTime();
	  var difference = timestamp - startOfYearTimestamp;
	  return Math.floor(difference / MILLISECONDS_IN_DAY$1) + 1;
	}

	// See issue: https://github.com/date-fns/date-fns/issues/376

	function startOfUTCISOWeek(dirtyDate) {
	  if (arguments.length < 1) {
	    throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
	  }

	  var weekStartsOn = 1;
	  var date = toDate(dirtyDate);
	  var day = date.getUTCDay();
	  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
	  date.setUTCDate(date.getUTCDate() - diff);
	  date.setUTCHours(0, 0, 0, 0);
	  return date;
	}

	// See issue: https://github.com/date-fns/date-fns/issues/376

	function getUTCISOWeekYear(dirtyDate) {
	  if (arguments.length < 1) {
	    throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
	  }

	  var date = toDate(dirtyDate);
	  var year = date.getUTCFullYear();
	  var fourthOfJanuaryOfNextYear = new Date(0);
	  fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
	  fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
	  var startOfNextYear = startOfUTCISOWeek(fourthOfJanuaryOfNextYear);
	  var fourthOfJanuaryOfThisYear = new Date(0);
	  fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
	  fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
	  var startOfThisYear = startOfUTCISOWeek(fourthOfJanuaryOfThisYear);

	  if (date.getTime() >= startOfNextYear.getTime()) {
	    return year + 1;
	  } else if (date.getTime() >= startOfThisYear.getTime()) {
	    return year;
	  } else {
	    return year - 1;
	  }
	}

	// See issue: https://github.com/date-fns/date-fns/issues/376

	function startOfUTCISOWeekYear(dirtyDate) {
	  if (arguments.length < 1) {
	    throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
	  }

	  var year = getUTCISOWeekYear(dirtyDate);
	  var fourthOfJanuary = new Date(0);
	  fourthOfJanuary.setUTCFullYear(year, 0, 4);
	  fourthOfJanuary.setUTCHours(0, 0, 0, 0);
	  var date = startOfUTCISOWeek(fourthOfJanuary);
	  return date;
	}

	var MILLISECONDS_IN_WEEK$2 = 604800000; // This function will be a part of public API when UTC function will be implemented.
	// See issue: https://github.com/date-fns/date-fns/issues/376

	function getUTCISOWeek(dirtyDate) {
	  if (arguments.length < 1) {
	    throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
	  }

	  var date = toDate(dirtyDate);
	  var diff = startOfUTCISOWeek(date).getTime() - startOfUTCISOWeekYear(date).getTime(); // Round the number of days to the nearest integer
	  // because the number of milliseconds in a week is not constant
	  // (e.g. it's different in the week of the daylight saving time clock shift)

	  return Math.round(diff / MILLISECONDS_IN_WEEK$2) + 1;
	}

	// See issue: https://github.com/date-fns/date-fns/issues/376

	function startOfUTCWeek(dirtyDate, dirtyOptions) {
	  if (arguments.length < 1) {
	    throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
	  }

	  var options = dirtyOptions || {};
	  var locale = options.locale;
	  var localeWeekStartsOn = locale && locale.options && locale.options.weekStartsOn;
	  var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger$1(localeWeekStartsOn);
	  var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger$1(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

	  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
	    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
	  }

	  var date = toDate(dirtyDate);
	  var day = date.getUTCDay();
	  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
	  date.setUTCDate(date.getUTCDate() - diff);
	  date.setUTCHours(0, 0, 0, 0);
	  return date;
	}

	// See issue: https://github.com/date-fns/date-fns/issues/376

	function getUTCWeekYear(dirtyDate, dirtyOptions) {
	  if (arguments.length < 1) {
	    throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
	  }

	  var date = toDate(dirtyDate, dirtyOptions);
	  var year = date.getUTCFullYear();
	  var options = dirtyOptions || {};
	  var locale = options.locale;
	  var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
	  var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger$1(localeFirstWeekContainsDate);
	  var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger$1(options.firstWeekContainsDate); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

	  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
	    throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
	  }

	  var firstWeekOfNextYear = new Date(0);
	  firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
	  firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
	  var startOfNextYear = startOfUTCWeek(firstWeekOfNextYear, dirtyOptions);
	  var firstWeekOfThisYear = new Date(0);
	  firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
	  firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
	  var startOfThisYear = startOfUTCWeek(firstWeekOfThisYear, dirtyOptions);

	  if (date.getTime() >= startOfNextYear.getTime()) {
	    return year + 1;
	  } else if (date.getTime() >= startOfThisYear.getTime()) {
	    return year;
	  } else {
	    return year - 1;
	  }
	}

	// See issue: https://github.com/date-fns/date-fns/issues/376

	function startOfUTCWeekYear(dirtyDate, dirtyOptions) {
	  if (arguments.length < 1) {
	    throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
	  }

	  var options = dirtyOptions || {};
	  var locale = options.locale;
	  var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
	  var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger$1(localeFirstWeekContainsDate);
	  var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger$1(options.firstWeekContainsDate);
	  var year = getUTCWeekYear(dirtyDate, dirtyOptions);
	  var firstWeek = new Date(0);
	  firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
	  firstWeek.setUTCHours(0, 0, 0, 0);
	  var date = startOfUTCWeek(firstWeek, dirtyOptions);
	  return date;
	}

	var MILLISECONDS_IN_WEEK$3 = 604800000; // This function will be a part of public API when UTC function will be implemented.
	// See issue: https://github.com/date-fns/date-fns/issues/376

	function getUTCWeek(dirtyDate, options) {
	  if (arguments.length < 1) {
	    throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
	  }

	  var date = toDate(dirtyDate);
	  var diff = startOfUTCWeek(date, options).getTime() - startOfUTCWeekYear(date, options).getTime(); // Round the number of days to the nearest integer
	  // because the number of milliseconds in a week is not constant
	  // (e.g. it's different in the week of the daylight saving time clock shift)

	  return Math.round(diff / MILLISECONDS_IN_WEEK$3) + 1;
	}

	var dayPeriodEnum = {
	  am: 'am',
	  pm: 'pm',
	  midnight: 'midnight',
	  noon: 'noon',
	  morning: 'morning',
	  afternoon: 'afternoon',
	  evening: 'evening',
	  night: 'night'
	  /*
	   * |     | Unit                           |     | Unit                           |
	   * |-----|--------------------------------|-----|--------------------------------|
	   * |  a  | AM, PM                         |  A* | Milliseconds in day            |
	   * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
	   * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
	   * |  d  | Day of month                   |  D  | Day of year                    |
	   * |  e  | Local day of week              |  E  | Day of week                    |
	   * |  f  |                                |  F* | Day of week in month           |
	   * |  g* | Modified Julian day            |  G  | Era                            |
	   * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
	   * |  i! | ISO day of week                |  I! | ISO week of year               |
	   * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
	   * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
	   * |  l* | (deprecated)                   |  L  | Stand-alone month              |
	   * |  m  | Minute                         |  M  | Month                          |
	   * |  n  |                                |  N  |                                |
	   * |  o! | Ordinal number modifier        |  O  | Timezone (GMT)                 |
	   * |  p! | Long localized time            |  P! | Long localized date            |
	   * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
	   * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
	   * |  s  | Second                         |  S  | Fraction of second             |
	   * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
	   * |  u  | Extended year                  |  U* | Cyclic year                    |
	   * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
	   * |  w  | Local week of year             |  W* | Week of month                  |
	   * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
	   * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
	   * |  z  | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
	   *
	   * Letters marked by * are not implemented but reserved by Unicode standard.
	   *
	   * Letters marked by ! are non-standard, but implemented by date-fns:
	   * - `o` modifies the previous token to turn it into an ordinal (see `format` docs)
	   * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
	   *   i.e. 7 for Sunday, 1 for Monday, etc.
	   * - `I` is ISO week of year, as opposed to `w` which is local week of year.
	   * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
	   *   `R` is supposed to be used in conjunction with `I` and `i`
	   *   for universal ISO week-numbering date, whereas
	   *   `Y` is supposed to be used in conjunction with `w` and `e`
	   *   for week-numbering date specific to the locale.
	   * - `P` is long localized date format
	   * - `p` is long localized time format
	   */

	};
	var formatters$1 = {
	  // Era
	  G: function (date, token, localize) {
	    var era = date.getUTCFullYear() > 0 ? 1 : 0;

	    switch (token) {
	      // AD, BC
	      case 'G':
	      case 'GG':
	      case 'GGG':
	        return localize.era(era, {
	          width: 'abbreviated'
	        });
	      // A, B

	      case 'GGGGG':
	        return localize.era(era, {
	          width: 'narrow'
	        });
	      // Anno Domini, Before Christ

	      case 'GGGG':
	      default:
	        return localize.era(era, {
	          width: 'wide'
	        });
	    }
	  },
	  // Year
	  y: function (date, token, localize) {
	    // Ordinal number
	    if (token === 'yo') {
	      var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

	      var year = signedYear > 0 ? signedYear : 1 - signedYear;
	      return localize.ordinalNumber(year, {
	        unit: 'year'
	      });
	    }

	    return formatters.y(date, token);
	  },
	  // Local week-numbering year
	  Y: function (date, token, localize, options) {
	    var signedWeekYear = getUTCWeekYear(date, options); // Returns 1 for 1 BC (which is year 0 in JavaScript)

	    var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear; // Two digit year

	    if (token === 'YY') {
	      var twoDigitYear = weekYear % 100;
	      return addLeadingZeros(twoDigitYear, 2);
	    } // Ordinal number


	    if (token === 'Yo') {
	      return localize.ordinalNumber(weekYear, {
	        unit: 'year'
	      });
	    } // Padding


	    return addLeadingZeros(weekYear, token.length);
	  },
	  // ISO week-numbering year
	  R: function (date, token) {
	    var isoWeekYear = getUTCISOWeekYear(date); // Padding

	    return addLeadingZeros(isoWeekYear, token.length);
	  },
	  // Extended year. This is a single number designating the year of this calendar system.
	  // The main difference between `y` and `u` localizers are B.C. years:
	  // | Year | `y` | `u` |
	  // |------|-----|-----|
	  // | AC 1 |   1 |   1 |
	  // | BC 1 |   1 |   0 |
	  // | BC 2 |   2 |  -1 |
	  // Also `yy` always returns the last two digits of a year,
	  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
	  u: function (date, token) {
	    var year = date.getUTCFullYear();
	    return addLeadingZeros(year, token.length);
	  },
	  // Quarter
	  Q: function (date, token, localize) {
	    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

	    switch (token) {
	      // 1, 2, 3, 4
	      case 'Q':
	        return String(quarter);
	      // 01, 02, 03, 04

	      case 'QQ':
	        return addLeadingZeros(quarter, 2);
	      // 1st, 2nd, 3rd, 4th

	      case 'Qo':
	        return localize.ordinalNumber(quarter, {
	          unit: 'quarter'
	        });
	      // Q1, Q2, Q3, Q4

	      case 'QQQ':
	        return localize.quarter(quarter, {
	          width: 'abbreviated',
	          context: 'formatting'
	        });
	      // 1, 2, 3, 4 (narrow quarter; could be not numerical)

	      case 'QQQQQ':
	        return localize.quarter(quarter, {
	          width: 'narrow',
	          context: 'formatting'
	        });
	      // 1st quarter, 2nd quarter, ...

	      case 'QQQQ':
	      default:
	        return localize.quarter(quarter, {
	          width: 'wide',
	          context: 'formatting'
	        });
	    }
	  },
	  // Stand-alone quarter
	  q: function (date, token, localize) {
	    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

	    switch (token) {
	      // 1, 2, 3, 4
	      case 'q':
	        return String(quarter);
	      // 01, 02, 03, 04

	      case 'qq':
	        return addLeadingZeros(quarter, 2);
	      // 1st, 2nd, 3rd, 4th

	      case 'qo':
	        return localize.ordinalNumber(quarter, {
	          unit: 'quarter'
	        });
	      // Q1, Q2, Q3, Q4

	      case 'qqq':
	        return localize.quarter(quarter, {
	          width: 'abbreviated',
	          context: 'standalone'
	        });
	      // 1, 2, 3, 4 (narrow quarter; could be not numerical)

	      case 'qqqqq':
	        return localize.quarter(quarter, {
	          width: 'narrow',
	          context: 'standalone'
	        });
	      // 1st quarter, 2nd quarter, ...

	      case 'qqqq':
	      default:
	        return localize.quarter(quarter, {
	          width: 'wide',
	          context: 'standalone'
	        });
	    }
	  },
	  // Month
	  M: function (date, token, localize) {
	    var month = date.getUTCMonth();

	    switch (token) {
	      case 'M':
	      case 'MM':
	        return formatters.M(date, token);
	      // 1st, 2nd, ..., 12th

	      case 'Mo':
	        return localize.ordinalNumber(month + 1, {
	          unit: 'month'
	        });
	      // Jan, Feb, ..., Dec

	      case 'MMM':
	        return localize.month(month, {
	          width: 'abbreviated',
	          context: 'formatting'
	        });
	      // J, F, ..., D

	      case 'MMMMM':
	        return localize.month(month, {
	          width: 'narrow',
	          context: 'formatting'
	        });
	      // January, February, ..., December

	      case 'MMMM':
	      default:
	        return localize.month(month, {
	          width: 'wide',
	          context: 'formatting'
	        });
	    }
	  },
	  // Stand-alone month
	  L: function (date, token, localize) {
	    var month = date.getUTCMonth();

	    switch (token) {
	      // 1, 2, ..., 12
	      case 'L':
	        return String(month + 1);
	      // 01, 02, ..., 12

	      case 'LL':
	        return addLeadingZeros(month + 1, 2);
	      // 1st, 2nd, ..., 12th

	      case 'Lo':
	        return localize.ordinalNumber(month + 1, {
	          unit: 'month'
	        });
	      // Jan, Feb, ..., Dec

	      case 'LLL':
	        return localize.month(month, {
	          width: 'abbreviated',
	          context: 'standalone'
	        });
	      // J, F, ..., D

	      case 'LLLLL':
	        return localize.month(month, {
	          width: 'narrow',
	          context: 'standalone'
	        });
	      // January, February, ..., December

	      case 'LLLL':
	      default:
	        return localize.month(month, {
	          width: 'wide',
	          context: 'standalone'
	        });
	    }
	  },
	  // Local week of year
	  w: function (date, token, localize, options) {
	    var week = getUTCWeek(date, options);

	    if (token === 'wo') {
	      return localize.ordinalNumber(week, {
	        unit: 'week'
	      });
	    }

	    return addLeadingZeros(week, token.length);
	  },
	  // ISO week of year
	  I: function (date, token, localize) {
	    var isoWeek = getUTCISOWeek(date);

	    if (token === 'Io') {
	      return localize.ordinalNumber(isoWeek, {
	        unit: 'week'
	      });
	    }

	    return addLeadingZeros(isoWeek, token.length);
	  },
	  // Day of the month
	  d: function (date, token, localize) {
	    if (token === 'do') {
	      return localize.ordinalNumber(date.getUTCDate(), {
	        unit: 'date'
	      });
	    }

	    return formatters.d(date, token);
	  },
	  // Day of year
	  D: function (date, token, localize) {
	    var dayOfYear = getUTCDayOfYear(date);

	    if (token === 'Do') {
	      return localize.ordinalNumber(dayOfYear, {
	        unit: 'dayOfYear'
	      });
	    }

	    return addLeadingZeros(dayOfYear, token.length);
	  },
	  // Day of week
	  E: function (date, token, localize) {
	    var dayOfWeek = date.getUTCDay();

	    switch (token) {
	      // Tue
	      case 'E':
	      case 'EE':
	      case 'EEE':
	        return localize.day(dayOfWeek, {
	          width: 'abbreviated',
	          context: 'formatting'
	        });
	      // T

	      case 'EEEEE':
	        return localize.day(dayOfWeek, {
	          width: 'narrow',
	          context: 'formatting'
	        });
	      // Tu

	      case 'EEEEEE':
	        return localize.day(dayOfWeek, {
	          width: 'short',
	          context: 'formatting'
	        });
	      // Tuesday

	      case 'EEEE':
	      default:
	        return localize.day(dayOfWeek, {
	          width: 'wide',
	          context: 'formatting'
	        });
	    }
	  },
	  // Local day of week
	  e: function (date, token, localize, options) {
	    var dayOfWeek = date.getUTCDay();
	    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

	    switch (token) {
	      // Numerical value (Nth day of week with current locale or weekStartsOn)
	      case 'e':
	        return String(localDayOfWeek);
	      // Padded numerical value

	      case 'ee':
	        return addLeadingZeros(localDayOfWeek, 2);
	      // 1st, 2nd, ..., 7th

	      case 'eo':
	        return localize.ordinalNumber(localDayOfWeek, {
	          unit: 'day'
	        });

	      case 'eee':
	        return localize.day(dayOfWeek, {
	          width: 'abbreviated',
	          context: 'formatting'
	        });
	      // T

	      case 'eeeee':
	        return localize.day(dayOfWeek, {
	          width: 'narrow',
	          context: 'formatting'
	        });
	      // Tu

	      case 'eeeeee':
	        return localize.day(dayOfWeek, {
	          width: 'short',
	          context: 'formatting'
	        });
	      // Tuesday

	      case 'eeee':
	      default:
	        return localize.day(dayOfWeek, {
	          width: 'wide',
	          context: 'formatting'
	        });
	    }
	  },
	  // Stand-alone local day of week
	  c: function (date, token, localize, options) {
	    var dayOfWeek = date.getUTCDay();
	    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

	    switch (token) {
	      // Numerical value (same as in `e`)
	      case 'c':
	        return String(localDayOfWeek);
	      // Padded numerical value

	      case 'cc':
	        return addLeadingZeros(localDayOfWeek, token.length);
	      // 1st, 2nd, ..., 7th

	      case 'co':
	        return localize.ordinalNumber(localDayOfWeek, {
	          unit: 'day'
	        });

	      case 'ccc':
	        return localize.day(dayOfWeek, {
	          width: 'abbreviated',
	          context: 'standalone'
	        });
	      // T

	      case 'ccccc':
	        return localize.day(dayOfWeek, {
	          width: 'narrow',
	          context: 'standalone'
	        });
	      // Tu

	      case 'cccccc':
	        return localize.day(dayOfWeek, {
	          width: 'short',
	          context: 'standalone'
	        });
	      // Tuesday

	      case 'cccc':
	      default:
	        return localize.day(dayOfWeek, {
	          width: 'wide',
	          context: 'standalone'
	        });
	    }
	  },
	  // ISO day of week
	  i: function (date, token, localize) {
	    var dayOfWeek = date.getUTCDay();
	    var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

	    switch (token) {
	      // 2
	      case 'i':
	        return String(isoDayOfWeek);
	      // 02

	      case 'ii':
	        return addLeadingZeros(isoDayOfWeek, token.length);
	      // 2nd

	      case 'io':
	        return localize.ordinalNumber(isoDayOfWeek, {
	          unit: 'day'
	        });
	      // Tue

	      case 'iii':
	        return localize.day(dayOfWeek, {
	          width: 'abbreviated',
	          context: 'formatting'
	        });
	      // T

	      case 'iiiii':
	        return localize.day(dayOfWeek, {
	          width: 'narrow',
	          context: 'formatting'
	        });
	      // Tu

	      case 'iiiiii':
	        return localize.day(dayOfWeek, {
	          width: 'short',
	          context: 'formatting'
	        });
	      // Tuesday

	      case 'iiii':
	      default:
	        return localize.day(dayOfWeek, {
	          width: 'wide',
	          context: 'formatting'
	        });
	    }
	  },
	  // AM or PM
	  a: function (date, token, localize) {
	    var hours = date.getUTCHours();
	    var dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';

	    switch (token) {
	      case 'a':
	      case 'aa':
	      case 'aaa':
	        return localize.dayPeriod(dayPeriodEnumValue, {
	          width: 'abbreviated',
	          context: 'formatting'
	        });

	      case 'aaaaa':
	        return localize.dayPeriod(dayPeriodEnumValue, {
	          width: 'narrow',
	          context: 'formatting'
	        });

	      case 'aaaa':
	      default:
	        return localize.dayPeriod(dayPeriodEnumValue, {
	          width: 'wide',
	          context: 'formatting'
	        });
	    }
	  },
	  // AM, PM, midnight, noon
	  b: function (date, token, localize) {
	    var hours = date.getUTCHours();
	    var dayPeriodEnumValue;

	    if (hours === 12) {
	      dayPeriodEnumValue = dayPeriodEnum.noon;
	    } else if (hours === 0) {
	      dayPeriodEnumValue = dayPeriodEnum.midnight;
	    } else {
	      dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';
	    }

	    switch (token) {
	      case 'b':
	      case 'bb':
	      case 'bbb':
	        return localize.dayPeriod(dayPeriodEnumValue, {
	          width: 'abbreviated',
	          context: 'formatting'
	        });

	      case 'bbbbb':
	        return localize.dayPeriod(dayPeriodEnumValue, {
	          width: 'narrow',
	          context: 'formatting'
	        });

	      case 'bbbb':
	      default:
	        return localize.dayPeriod(dayPeriodEnumValue, {
	          width: 'wide',
	          context: 'formatting'
	        });
	    }
	  },
	  // in the morning, in the afternoon, in the evening, at night
	  B: function (date, token, localize) {
	    var hours = date.getUTCHours();
	    var dayPeriodEnumValue;

	    if (hours >= 17) {
	      dayPeriodEnumValue = dayPeriodEnum.evening;
	    } else if (hours >= 12) {
	      dayPeriodEnumValue = dayPeriodEnum.afternoon;
	    } else if (hours >= 4) {
	      dayPeriodEnumValue = dayPeriodEnum.morning;
	    } else {
	      dayPeriodEnumValue = dayPeriodEnum.night;
	    }

	    switch (token) {
	      case 'B':
	      case 'BB':
	      case 'BBB':
	        return localize.dayPeriod(dayPeriodEnumValue, {
	          width: 'abbreviated',
	          context: 'formatting'
	        });

	      case 'BBBBB':
	        return localize.dayPeriod(dayPeriodEnumValue, {
	          width: 'narrow',
	          context: 'formatting'
	        });

	      case 'BBBB':
	      default:
	        return localize.dayPeriod(dayPeriodEnumValue, {
	          width: 'wide',
	          context: 'formatting'
	        });
	    }
	  },
	  // Hour [1-12]
	  h: function (date, token, localize) {
	    if (token === 'ho') {
	      var hours = date.getUTCHours() % 12;
	      if (hours === 0) hours = 12;
	      return localize.ordinalNumber(hours, {
	        unit: 'hour'
	      });
	    }

	    return formatters.h(date, token);
	  },
	  // Hour [0-23]
	  H: function (date, token, localize) {
	    if (token === 'Ho') {
	      return localize.ordinalNumber(date.getUTCHours(), {
	        unit: 'hour'
	      });
	    }

	    return formatters.H(date, token);
	  },
	  // Hour [0-11]
	  K: function (date, token, localize) {
	    var hours = date.getUTCHours() % 12;

	    if (token === 'Ko') {
	      return localize.ordinalNumber(hours, {
	        unit: 'hour'
	      });
	    }

	    return addLeadingZeros(hours, token.length);
	  },
	  // Hour [1-24]
	  k: function (date, token, localize) {
	    var hours = date.getUTCHours();
	    if (hours === 0) hours = 24;

	    if (token === 'ko') {
	      return localize.ordinalNumber(hours, {
	        unit: 'hour'
	      });
	    }

	    return addLeadingZeros(hours, token.length);
	  },
	  // Minute
	  m: function (date, token, localize) {
	    if (token === 'mo') {
	      return localize.ordinalNumber(date.getUTCMinutes(), {
	        unit: 'minute'
	      });
	    }

	    return formatters.m(date, token);
	  },
	  // Second
	  s: function (date, token, localize) {
	    if (token === 'so') {
	      return localize.ordinalNumber(date.getUTCSeconds(), {
	        unit: 'second'
	      });
	    }

	    return formatters.s(date, token);
	  },
	  // Fraction of second
	  S: function (date, token) {
	    return formatters.S(date, token);
	  },
	  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
	  X: function (date, token, _localize, options) {
	    var originalDate = options._originalDate || date;
	    var timezoneOffset = originalDate.getTimezoneOffset();

	    if (timezoneOffset === 0) {
	      return 'Z';
	    }

	    switch (token) {
	      // Hours and optional minutes
	      case 'X':
	        return formatTimezoneWithOptionalMinutes(timezoneOffset);
	      // Hours, minutes and optional seconds without `:` delimiter
	      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
	      // so this token always has the same output as `XX`

	      case 'XXXX':
	      case 'XX':
	        // Hours and minutes without `:` delimiter
	        return formatTimezone(timezoneOffset);
	      // Hours, minutes and optional seconds with `:` delimiter
	      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
	      // so this token always has the same output as `XXX`

	      case 'XXXXX':
	      case 'XXX': // Hours and minutes with `:` delimiter

	      default:
	        return formatTimezone(timezoneOffset, ':');
	    }
	  },
	  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
	  x: function (date, token, _localize, options) {
	    var originalDate = options._originalDate || date;
	    var timezoneOffset = originalDate.getTimezoneOffset();

	    switch (token) {
	      // Hours and optional minutes
	      case 'x':
	        return formatTimezoneWithOptionalMinutes(timezoneOffset);
	      // Hours, minutes and optional seconds without `:` delimiter
	      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
	      // so this token always has the same output as `xx`

	      case 'xxxx':
	      case 'xx':
	        // Hours and minutes without `:` delimiter
	        return formatTimezone(timezoneOffset);
	      // Hours, minutes and optional seconds with `:` delimiter
	      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
	      // so this token always has the same output as `xxx`

	      case 'xxxxx':
	      case 'xxx': // Hours and minutes with `:` delimiter

	      default:
	        return formatTimezone(timezoneOffset, ':');
	    }
	  },
	  // Timezone (GMT)
	  O: function (date, token, _localize, options) {
	    var originalDate = options._originalDate || date;
	    var timezoneOffset = originalDate.getTimezoneOffset();

	    switch (token) {
	      // Short
	      case 'O':
	      case 'OO':
	      case 'OOO':
	        return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
	      // Long

	      case 'OOOO':
	      default:
	        return 'GMT' + formatTimezone(timezoneOffset, ':');
	    }
	  },
	  // Timezone (specific non-location)
	  z: function (date, token, _localize, options) {
	    var originalDate = options._originalDate || date;
	    var timezoneOffset = originalDate.getTimezoneOffset();

	    switch (token) {
	      // Short
	      case 'z':
	      case 'zz':
	      case 'zzz':
	        return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
	      // Long

	      case 'zzzz':
	      default:
	        return 'GMT' + formatTimezone(timezoneOffset, ':');
	    }
	  },
	  // Seconds timestamp
	  t: function (date, token, _localize, options) {
	    var originalDate = options._originalDate || date;
	    var timestamp = Math.floor(originalDate.getTime() / 1000);
	    return addLeadingZeros(timestamp, token.length);
	  },
	  // Milliseconds timestamp
	  T: function (date, token, _localize, options) {
	    var originalDate = options._originalDate || date;
	    var timestamp = originalDate.getTime();
	    return addLeadingZeros(timestamp, token.length);
	  }
	};

	function formatTimezoneShort(offset, dirtyDelimiter) {
	  var sign = offset > 0 ? '-' : '+';
	  var absOffset = Math.abs(offset);
	  var hours = Math.floor(absOffset / 60);
	  var minutes = absOffset % 60;

	  if (minutes === 0) {
	    return sign + String(hours);
	  }

	  var delimiter = dirtyDelimiter || '';
	  return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
	}

	function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
	  if (offset % 60 === 0) {
	    var sign = offset > 0 ? '-' : '+';
	    return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
	  }

	  return formatTimezone(offset, dirtyDelimiter);
	}

	function formatTimezone(offset, dirtyDelimiter) {
	  var delimiter = dirtyDelimiter || '';
	  var sign = offset > 0 ? '-' : '+';
	  var absOffset = Math.abs(offset);
	  var hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
	  var minutes = addLeadingZeros(absOffset % 60, 2);
	  return sign + hours + delimiter + minutes;
	}

	function dateLongFormatter(pattern, formatLong) {
	  switch (pattern) {
	    case 'P':
	      return formatLong.date({
	        width: 'short'
	      });

	    case 'PP':
	      return formatLong.date({
	        width: 'medium'
	      });

	    case 'PPP':
	      return formatLong.date({
	        width: 'long'
	      });

	    case 'PPPP':
	    default:
	      return formatLong.date({
	        width: 'full'
	      });
	  }
	}

	function timeLongFormatter(pattern, formatLong) {
	  switch (pattern) {
	    case 'p':
	      return formatLong.time({
	        width: 'short'
	      });

	    case 'pp':
	      return formatLong.time({
	        width: 'medium'
	      });

	    case 'ppp':
	      return formatLong.time({
	        width: 'long'
	      });

	    case 'pppp':
	    default:
	      return formatLong.time({
	        width: 'full'
	      });
	  }
	}

	function dateTimeLongFormatter(pattern, formatLong) {
	  var matchResult = pattern.match(/(P+)(p+)?/);
	  var datePattern = matchResult[1];
	  var timePattern = matchResult[2];

	  if (!timePattern) {
	    return dateLongFormatter(pattern, formatLong);
	  }

	  var dateTimeFormat;

	  switch (datePattern) {
	    case 'P':
	      dateTimeFormat = formatLong.dateTime({
	        width: 'short'
	      });
	      break;

	    case 'PP':
	      dateTimeFormat = formatLong.dateTime({
	        width: 'medium'
	      });
	      break;

	    case 'PPP':
	      dateTimeFormat = formatLong.dateTime({
	        width: 'long'
	      });
	      break;

	    case 'PPPP':
	    default:
	      dateTimeFormat = formatLong.dateTime({
	        width: 'full'
	      });
	      break;
	  }

	  return dateTimeFormat.replace('{{date}}', dateLongFormatter(datePattern, formatLong)).replace('{{time}}', timeLongFormatter(timePattern, formatLong));
	}

	var longFormatters = {
	  p: timeLongFormatter,
	  P: dateTimeLongFormatter
	};

	var protectedDayOfYearTokens = ['D', 'DD'];
	var protectedWeekYearTokens = ['YY', 'YYYY'];
	function isProtectedDayOfYearToken(token) {
	  return protectedDayOfYearTokens.indexOf(token) !== -1;
	}
	function isProtectedWeekYearToken(token) {
	  return protectedWeekYearTokens.indexOf(token) !== -1;
	}
	function throwProtectedError(token) {
	  if (token === 'YYYY') {
	    throw new RangeError('Use `yyyy` instead of `YYYY` for formatting years; see: https://git.io/fxCyr');
	  } else if (token === 'YY') {
	    throw new RangeError('Use `yy` instead of `YY` for formatting years; see: https://git.io/fxCyr');
	  } else if (token === 'D') {
	    throw new RangeError('Use `d` instead of `D` for formatting days of the month; see: https://git.io/fxCyr');
	  } else if (token === 'DD') {
	    throw new RangeError('Use `dd` instead of `DD` for formatting days of the month; see: https://git.io/fxCyr');
	  }
	}

	// - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
	//   (one of the certain letters followed by `o`)
	// - (\w)\1* matches any sequences of the same letter
	// - '' matches two quote characters in a row
	// - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
	//   except a single quote symbol, which ends the sequence.
	//   Two quote characters do not end the sequence.
	//   If there is no matching single quote
	//   then the sequence will continue until the end of the string.
	// - . matches any single character unmatched by previous parts of the RegExps

	var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g; // This RegExp catches symbols escaped by quotes, and also
	// sequences of symbols P, p, and the combinations like `PPPPPPPppppp`

	var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
	var escapedStringRegExp = /^'(.*?)'?$/;
	var doubleQuoteRegExp = /''/g;
	var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
	/**
	 * @name format
	 * @category Common Helpers
	 * @summary Format the date.
	 *
	 * @description
	 * Return the formatted date string in the given format. The result may vary by locale.
	 *
	 * > ?????? Please note that the `format` tokens differ from Moment.js and other libraries.
	 * > See: https://git.io/fxCyr
	 *
	 * The characters wrapped between two single quotes characters (') are escaped.
	 * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
	 * (see the last example)
	 *
	 * Format of the string is based on Unicode Technical Standard #35:
	 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
	 * with a few additions (see note 7 below the table).
	 *
	 * Accepted patterns:
	 * | Unit                            | Pattern | Result examples                   | Notes |
	 * |---------------------------------|---------|-----------------------------------|-------|
	 * | Era                             | G..GGG  | AD, BC                            |       |
	 * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
	 * |                                 | GGGGG   | A, B                              |       |
	 * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
	 * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
	 * |                                 | yy      | 44, 01, 00, 17                    | 5     |
	 * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
	 * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
	 * |                                 | yyyyy   | ...                               | 3,5   |
	 * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
	 * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
	 * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
	 * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
	 * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
	 * |                                 | YYYYY   | ...                               | 3,5   |
	 * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
	 * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
	 * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
	 * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
	 * |                                 | RRRRR   | ...                               | 3,5,7 |
	 * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
	 * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
	 * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
	 * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
	 * |                                 | uuuuu   | ...                               | 3,5   |
	 * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
	 * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
	 * |                                 | QQ      | 01, 02, 03, 04                    |       |
	 * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
	 * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
	 * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
	 * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
	 * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
	 * |                                 | qq      | 01, 02, 03, 04                    |       |
	 * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
	 * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
	 * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
	 * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
	 * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
	 * |                                 | MM      | 01, 02, ..., 12                   |       |
	 * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
	 * |                                 | MMMM    | January, February, ..., December  | 2     |
	 * |                                 | MMMMM   | J, F, ..., D                      |       |
	 * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
	 * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
	 * |                                 | LL      | 01, 02, ..., 12                   |       |
	 * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
	 * |                                 | LLLL    | January, February, ..., December  | 2     |
	 * |                                 | LLLLL   | J, F, ..., D                      |       |
	 * | Local week of year              | w       | 1, 2, ..., 53                     |       |
	 * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
	 * |                                 | ww      | 01, 02, ..., 53                   |       |
	 * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
	 * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
	 * |                                 | II      | 01, 02, ..., 53                   | 7     |
	 * | Day of month                    | d       | 1, 2, ..., 31                     |       |
	 * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
	 * |                                 | dd      | 01, 02, ..., 31                   |       |
	 * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
	 * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
	 * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
	 * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
	 * |                                 | DDDD    | ...                               | 3     |
	 * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Su            |       |
	 * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
	 * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
	 * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
	 * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
	 * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
	 * |                                 | ii      | 01, 02, ..., 07                   | 7     |
	 * |                                 | iii     | Mon, Tue, Wed, ..., Su            | 7     |
	 * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
	 * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
	 * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Su, Sa        | 7     |
	 * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
	 * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
	 * |                                 | ee      | 02, 03, ..., 01                   |       |
	 * |                                 | eee     | Mon, Tue, Wed, ..., Su            |       |
	 * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
	 * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
	 * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
	 * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
	 * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
	 * |                                 | cc      | 02, 03, ..., 01                   |       |
	 * |                                 | ccc     | Mon, Tue, Wed, ..., Su            |       |
	 * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
	 * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
	 * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
	 * | AM, PM                          | a..aaa  | AM, PM                            |       |
	 * |                                 | aaaa    | a.m., p.m.                        | 2     |
	 * |                                 | aaaaa   | a, p                              |       |
	 * | AM, PM, noon, midnight          | b..bbb  | AM, PM, noon, midnight            |       |
	 * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
	 * |                                 | bbbbb   | a, p, n, mi                       |       |
	 * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
	 * |                                 | BBBB    | at night, in the morning, ...     | 2     |
	 * |                                 | BBBBB   | at night, in the morning, ...     |       |
	 * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
	 * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
	 * |                                 | hh      | 01, 02, ..., 11, 12               |       |
	 * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
	 * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
	 * |                                 | HH      | 00, 01, 02, ..., 23               |       |
	 * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
	 * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
	 * |                                 | KK      | 1, 2, ..., 11, 0                  |       |
	 * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
	 * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
	 * |                                 | kk      | 24, 01, 02, ..., 23               |       |
	 * | Minute                          | m       | 0, 1, ..., 59                     |       |
	 * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
	 * |                                 | mm      | 00, 01, ..., 59                   |       |
	 * | Second                          | s       | 0, 1, ..., 59                     |       |
	 * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
	 * |                                 | ss      | 00, 01, ..., 59                   |       |
	 * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
	 * |                                 | SS      | 00, 01, ..., 99                   |       |
	 * |                                 | SSS     | 000, 0001, ..., 999               |       |
	 * |                                 | SSSS    | ...                               | 3     |
	 * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
	 * |                                 | XX      | -0800, +0530, Z                   |       |
	 * |                                 | XXX     | -08:00, +05:30, Z                 |       |
	 * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
	 * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
	 * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
	 * |                                 | xx      | -0800, +0530, +0000               |       |
	 * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
	 * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
	 * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
	 * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
	 * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
	 * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
	 * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
	 * | Seconds timestamp               | t       | 512969520                         | 7     |
	 * |                                 | tt      | ...                               | 3,7   |
	 * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
	 * |                                 | TT      | ...                               | 3,7   |
	 * | Long localized date             | P       | 05/29/1453                        | 7     |
	 * |                                 | PP      | May 29, 1453                      | 7     |
	 * |                                 | PPP     | May 29th, 1453                    | 7     |
	 * |                                 | PPPP    | Sunday, May 29th, 1453            | 2,7   |
	 * | Long localized time             | p       | 12:00 AM                          | 7     |
	 * |                                 | pp      | 12:00:00 AM                       | 7     |
	 * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
	 * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
	 * | Combination of date and time    | Pp      | 05/29/1453, 12:00 AM              | 7     |
	 * |                                 | PPpp    | May 29, 1453, 12:00:00 AM         | 7     |
	 * |                                 | PPPppp  | May 29th, 1453 at ...             | 7     |
	 * |                                 | PPPPpppp| Sunday, May 29th, 1453 at ...     | 2,7   |
	 * Notes:
	 * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
	 *    are the same as "stand-alone" units, but are different in some languages.
	 *    "Formatting" units are declined according to the rules of the language
	 *    in the context of a date. "Stand-alone" units are always nominative singular:
	 *
	 *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
	 *
	 *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
	 *
	 * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
	 *    the single quote characters (see below).
	 *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
	 *    the output will be the same as default pattern for this unit, usually
	 *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
	 *    are marked with "2" in the last column of the table.
	 *
	 *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
	 *
	 *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
	 *
	 *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
	 *
	 *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
	 *
	 *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
	 *
	 * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
	 *    The output will be padded with zeros to match the length of the pattern.
	 *
	 *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
	 *
	 * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
	 *    These tokens represent the shortest form of the quarter.
	 *
	 * 5. The main difference between `y` and `u` patterns are B.C. years:
	 *
	 *    | Year | `y` | `u` |
	 *    |------|-----|-----|
	 *    | AC 1 |   1 |   1 |
	 *    | BC 1 |   1 |   0 |
	 *    | BC 2 |   2 |  -1 |
	 *
	 *    Also `yy` always returns the last two digits of a year,
	 *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
	 *
	 *    | Year | `yy` | `uu` |
	 *    |------|------|------|
	 *    | 1    |   01 |   01 |
	 *    | 14   |   14 |   14 |
	 *    | 376  |   76 |  376 |
	 *    | 1453 |   53 | 1453 |
	 *
	 *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
	 *    except local week-numbering years are dependent on `options.weekStartsOn`
	 *    and `options.firstWeekContainsDate` (compare [getISOWeekYear]{@link https://date-fns.org/docs/getISOWeekYear}
	 *    and [getWeekYear]{@link https://date-fns.org/docs/getWeekYear}).
	 *
	 * 6. Specific non-location timezones are currently unavailable in `date-fns`,
	 *    so right now these tokens fall back to GMT timezones.
	 *
	 * 7. These patterns are not in the Unicode Technical Standard #35:
	 *    - `i`: ISO day of week
	 *    - `I`: ISO week of year
	 *    - `R`: ISO week-numbering year
	 *    - `t`: seconds timestamp
	 *    - `T`: milliseconds timestamp
	 *    - `o`: ordinal number modifier
	 *    - `P`: long localized date
	 *    - `p`: long localized time
	 *
	 * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
	 *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://git.io/fxCyr
	 *
	 * 9. `D` and `DD` tokens represent days of the year but they are ofthen confused with days of the month.
	 *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://git.io/fxCyr
	 *
	 * ### v2.0.0 breaking changes:
	 *
	 * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
	 *
	 * - The second argument is now required for the sake of explicitness.
	 *
	 *   ```javascript
	 *   // Before v2.0.0
	 *   format(new Date(2016, 0, 1))
	 *
	 *   // v2.0.0 onward
	 *   format(new Date(2016, 0, 1), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
	 *   ```
	 *
	 * - New format string API for `format` function
	 *   which is based on [Unicode Technical Standard #35](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).
	 *   See [this post](https://blog.date-fns.org/post/unicode-tokens-in-date-fns-v2-sreatyki91jg) for more details.
	 *
	 * - Characters are now escaped using single quote symbols (`'`) instead of square brackets.
	 *
	 * @param {Date|Number} date - the original date
	 * @param {String} format - the string of tokens
	 * @param {Object} [options] - an object with options.
	 * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
	 * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
	 * @param {Number} [options.firstWeekContainsDate=1] - the day of January, which is
	 * @param {Boolean} [options.useAdditionalWeekYearTokens=false] - if true, allows usage of the week-numbering year tokens `YY` and `YYYY`;
	 *   see: https://git.io/fxCyr
	 * @param {Boolean} [options.useAdditionalDayOfYearTokens=false] - if true, allows usage of the day of year tokens `D` and `DD`;
	 *   see: https://git.io/fxCyr
	 * @returns {String} the formatted date string
	 * @throws {TypeError} 2 arguments required
	 * @throws {RangeError} `options.locale` must contain `localize` property
	 * @throws {RangeError} `options.locale` must contain `formatLong` property
	 * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
	 * @throws {RangeError} `options.firstWeekContainsDate` must be between 1 and 7
	 * @throws {RangeError} use `yyyy` instead of `YYYY` for formatting years; see: https://git.io/fxCyr
	 * @throws {RangeError} use `yy` instead of `YY` for formatting years; see: https://git.io/fxCyr
	 * @throws {RangeError} use `d` instead of `D` for formatting days of the month; see: https://git.io/fxCyr
	 * @throws {RangeError} use `dd` instead of `DD` for formatting days of the month; see: https://git.io/fxCyr
	 * @throws {RangeError} format string contains an unescaped latin alphabet character
	 *
	 * @example
	 * // Represent 11 February 2014 in middle-endian format:
	 * var result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
	 * //=> '02/11/2014'
	 *
	 * @example
	 * // Represent 2 July 2014 in Esperanto:
	 * import { eoLocale } from 'date-fns/locale/eo'
	 * var result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
	 *   locale: eoLocale
	 * })
	 * //=> '2-a de julio 2014'
	 *
	 * @example
	 * // Escape string by single quote characters:
	 * var result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
	 * //=> "3 o'clock"
	 */

	function format(dirtyDate, dirtyFormatStr, dirtyOptions) {
	  if (arguments.length < 2) {
	    throw new TypeError('2 arguments required, but only ' + arguments.length + ' present');
	  }

	  var formatStr = String(dirtyFormatStr);
	  var options = dirtyOptions || {};
	  var locale$$1 = options.locale || locale;
	  var localeFirstWeekContainsDate = locale$$1.options && locale$$1.options.firstWeekContainsDate;
	  var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger$1(localeFirstWeekContainsDate);
	  var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger$1(options.firstWeekContainsDate); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

	  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
	    throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
	  }

	  var localeWeekStartsOn = locale$$1.options && locale$$1.options.weekStartsOn;
	  var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger$1(localeWeekStartsOn);
	  var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger$1(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

	  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
	    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
	  }

	  if (!locale$$1.localize) {
	    throw new RangeError('locale must contain localize property');
	  }

	  if (!locale$$1.formatLong) {
	    throw new RangeError('locale must contain formatLong property');
	  }

	  var originalDate = toDate(dirtyDate);

	  if (!isValid(originalDate)) {
	    throw new RangeError('Invalid time value');
	  } // Convert the date in system timezone to the same date in UTC+00:00 timezone.
	  // This ensures that when UTC functions will be implemented, locales will be compatible with them.
	  // See an issue about UTC functions: https://github.com/date-fns/date-fns/issues/376


	  var timezoneOffset = getTimezoneOffsetInMilliseconds(originalDate);
	  var utcDate = subMilliseconds(originalDate, timezoneOffset);
	  var formatterOptions = {
	    firstWeekContainsDate: firstWeekContainsDate,
	    weekStartsOn: weekStartsOn,
	    locale: locale$$1,
	    _originalDate: originalDate
	  };
	  var result = formatStr.match(longFormattingTokensRegExp).map(function (substring) {
	    var firstCharacter = substring[0];

	    if (firstCharacter === 'p' || firstCharacter === 'P') {
	      var longFormatter = longFormatters[firstCharacter];
	      return longFormatter(substring, locale$$1.formatLong, formatterOptions);
	    }

	    return substring;
	  }).join('').match(formattingTokensRegExp).map(function (substring) {
	    // Replace two single quote characters with one single quote character
	    if (substring === "''") {
	      return "'";
	    }

	    var firstCharacter = substring[0];

	    if (firstCharacter === "'") {
	      return cleanEscapedString(substring);
	    }

	    var formatter = formatters$1[firstCharacter];

	    if (formatter) {
	      if (!options.useAdditionalWeekYearTokens && isProtectedWeekYearToken(substring)) {
	        throwProtectedError(substring);
	      }

	      if (!options.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(substring)) {
	        throwProtectedError(substring);
	      }

	      return formatter(utcDate, substring, locale$$1.localize, formatterOptions);
	    }

	    if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
	      throw new RangeError('Format string contains an unescaped latin alphabet character `' + firstCharacter + '`');
	    }

	    return substring;
	  }).join('');
	  return result;
	}

	function cleanEscapedString(input) {
	  return input.match(escapedStringRegExp)[1].replace(doubleQuoteRegExp, "'");
	}

	function assign(target, dirtyObject) {
	  if (target == null) {
	    throw new TypeError('assign requires that input parameter not be null or undefined');
	  }

	  dirtyObject = dirtyObject || {};

	  for (var property in dirtyObject) {
	    if (dirtyObject.hasOwnProperty(property)) {
	      target[property] = dirtyObject[property];
	    }
	  }

	  return target;
	}

	/**
	 * @name isDate
	 * @category Common Helpers
	 * @summary Is the given value a date?
	 *
	 * @description
	 * Returns true if the given value is an instance of Date. The function works for dates transferred across iframes.
	 *
	 * ### v2.0.0 breaking changes:
	 *
	 * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
	 *
	 * @param {*} value - the value to check
	 * @returns {boolean} true if the given value is a date
	 * @throws {TypeError} 1 arguments required
	 *
	 * @example
	 * // For a valid date:
	 * var result = isDate(new Date())
	 * //=> true
	 *
	 * @example
	 * // For an invalid date:
	 * var result = isDate(new Date(NaN))
	 * //=> true
	 *
	 * @example
	 * // For some value:
	 * var result = isDate('2014-02-31')
	 * //=> false
	 *
	 * @example
	 * // For an object:
	 * var result = isDate({})
	 * //=> false
	 */

	// See issue: https://github.com/date-fns/date-fns/issues/376

	function setUTCDay(dirtyDate, dirtyDay, dirtyOptions) {
	  if (arguments.length < 2) {
	    throw new TypeError('2 arguments required, but only ' + arguments.length + ' present');
	  }

	  var options = dirtyOptions || {};
	  var locale = options.locale;
	  var localeWeekStartsOn = locale && locale.options && locale.options.weekStartsOn;
	  var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger$1(localeWeekStartsOn);
	  var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger$1(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

	  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
	    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
	  }

	  var date = toDate(dirtyDate);
	  var day = toInteger$1(dirtyDay);
	  var currentDay = date.getUTCDay();
	  var remainder = day % 7;
	  var dayIndex = (remainder + 7) % 7;
	  var diff = (dayIndex < weekStartsOn ? 7 : 0) + day - currentDay;
	  date.setUTCDate(date.getUTCDate() + diff);
	  return date;
	}

	// See issue: https://github.com/date-fns/date-fns/issues/376

	function setUTCISODay(dirtyDate, dirtyDay) {
	  if (arguments.length < 2) {
	    throw new TypeError('2 arguments required, but only ' + arguments.length + ' present');
	  }

	  var day = toInteger$1(dirtyDay);

	  if (day % 7 === 0) {
	    day = day - 7;
	  }

	  var weekStartsOn = 1;
	  var date = toDate(dirtyDate);
	  var currentDay = date.getUTCDay();
	  var remainder = day % 7;
	  var dayIndex = (remainder + 7) % 7;
	  var diff = (dayIndex < weekStartsOn ? 7 : 0) + day - currentDay;
	  date.setUTCDate(date.getUTCDate() + diff);
	  return date;
	}

	// See issue: https://github.com/date-fns/date-fns/issues/376

	function setUTCISOWeek(dirtyDate, dirtyISOWeek) {
	  if (arguments.length < 2) {
	    throw new TypeError('2 arguments required, but only ' + arguments.length + ' present');
	  }

	  var date = toDate(dirtyDate);
	  var isoWeek = toInteger$1(dirtyISOWeek);
	  var diff = getUTCISOWeek(date) - isoWeek;
	  date.setUTCDate(date.getUTCDate() - diff * 7);
	  return date;
	}

	// See issue: https://github.com/date-fns/date-fns/issues/376

	function setUTCWeek(dirtyDate, dirtyWeek, options) {
	  if (arguments.length < 2) {
	    throw new TypeError('2 arguments required, but only ' + arguments.length + ' present');
	  }

	  var date = toDate(dirtyDate);
	  var week = toInteger$1(dirtyWeek);
	  var diff = getUTCWeek(date, options) - week;
	  date.setUTCDate(date.getUTCDate() - diff * 7);
	  return date;
	}

	var MILLISECONDS_IN_HOUR$2 = 3600000;
	var MILLISECONDS_IN_MINUTE$3 = 60000;
	var MILLISECONDS_IN_SECOND = 1000;
	var numericPatterns = {
	  month: /^(1[0-2]|0?\d)/,
	  // 0 to 12
	  date: /^(3[0-1]|[0-2]?\d)/,
	  // 0 to 31
	  dayOfYear: /^(36[0-6]|3[0-5]\d|[0-2]?\d?\d)/,
	  // 0 to 366
	  week: /^(5[0-3]|[0-4]?\d)/,
	  // 0 to 53
	  hour23h: /^(2[0-3]|[0-1]?\d)/,
	  // 0 to 23
	  hour24h: /^(2[0-4]|[0-1]?\d)/,
	  // 0 to 24
	  hour11h: /^(1[0-1]|0?\d)/,
	  // 0 to 11
	  hour12h: /^(1[0-2]|0?\d)/,
	  // 0 to 12
	  minute: /^[0-5]?\d/,
	  // 0 to 59
	  second: /^[0-5]?\d/,
	  // 0 to 59
	  singleDigit: /^\d/,
	  // 0 to 9
	  twoDigits: /^\d{1,2}/,
	  // 0 to 99
	  threeDigits: /^\d{1,3}/,
	  // 0 to 999
	  fourDigits: /^\d{1,4}/,
	  // 0 to 9999
	  anyDigitsSigned: /^-?\d+/,
	  singleDigitSigned: /^-?\d/,
	  // 0 to 9, -0 to -9
	  twoDigitsSigned: /^-?\d{1,2}/,
	  // 0 to 99, -0 to -99
	  threeDigitsSigned: /^-?\d{1,3}/,
	  // 0 to 999, -0 to -999
	  fourDigitsSigned: /^-?\d{1,4}/ // 0 to 9999, -0 to -9999

	};
	var timezonePatterns = {
	  basicOptionalMinutes: /^([+-])(\d{2})(\d{2})?|Z/,
	  basic: /^([+-])(\d{2})(\d{2})|Z/,
	  basicOptionalSeconds: /^([+-])(\d{2})(\d{2})((\d{2}))?|Z/,
	  extended: /^([+-])(\d{2}):(\d{2})|Z/,
	  extendedOptionalSeconds: /^([+-])(\d{2}):(\d{2})(:(\d{2}))?|Z/
	};

	function parseNumericPattern(pattern, string, valueCallback) {
	  var matchResult = string.match(pattern);

	  if (!matchResult) {
	    return null;
	  }

	  var value = parseInt(matchResult[0], 10);
	  return {
	    value: valueCallback ? valueCallback(value) : value,
	    rest: string.slice(matchResult[0].length)
	  };
	}

	function parseTimezonePattern(pattern, string) {
	  var matchResult = string.match(pattern);

	  if (!matchResult) {
	    return null;
	  } // Input is 'Z'


	  if (matchResult[0] === 'Z') {
	    return {
	      value: 0,
	      rest: string.slice(1)
	    };
	  }

	  var sign = matchResult[1] === '+' ? 1 : -1;
	  var hours = matchResult[2] ? parseInt(matchResult[2], 10) : 0;
	  var minutes = matchResult[3] ? parseInt(matchResult[3], 10) : 0;
	  var seconds = matchResult[5] ? parseInt(matchResult[5], 10) : 0;
	  return {
	    value: sign * (hours * MILLISECONDS_IN_HOUR$2 + minutes * MILLISECONDS_IN_MINUTE$3 + seconds * MILLISECONDS_IN_SECOND),
	    rest: string.slice(matchResult[0].length)
	  };
	}

	function parseAnyDigitsSigned(string, valueCallback) {
	  return parseNumericPattern(numericPatterns.anyDigitsSigned, string, valueCallback);
	}

	function parseNDigits(n, string, valueCallback) {
	  switch (n) {
	    case 1:
	      return parseNumericPattern(numericPatterns.singleDigit, string, valueCallback);

	    case 2:
	      return parseNumericPattern(numericPatterns.twoDigits, string, valueCallback);

	    case 3:
	      return parseNumericPattern(numericPatterns.threeDigits, string, valueCallback);

	    case 4:
	      return parseNumericPattern(numericPatterns.fourDigits, string, valueCallback);

	    default:
	      return parseNumericPattern(new RegExp('^\\d{1,' + n + '}'), string, valueCallback);
	  }
	}

	function parseNDigitsSigned(n, string, valueCallback) {
	  switch (n) {
	    case 1:
	      return parseNumericPattern(numericPatterns.singleDigitSigned, string, valueCallback);

	    case 2:
	      return parseNumericPattern(numericPatterns.twoDigitsSigned, string, valueCallback);

	    case 3:
	      return parseNumericPattern(numericPatterns.threeDigitsSigned, string, valueCallback);

	    case 4:
	      return parseNumericPattern(numericPatterns.fourDigitsSigned, string, valueCallback);

	    default:
	      return parseNumericPattern(new RegExp('^-?\\d{1,' + n + '}'), string, valueCallback);
	  }
	}

	function dayPeriodEnumToHours(enumValue) {
	  switch (enumValue) {
	    case 'morning':
	      return 4;

	    case 'evening':
	      return 17;

	    case 'pm':
	    case 'noon':
	    case 'afternoon':
	      return 12;

	    case 'am':
	    case 'midnight':
	    case 'night':
	    default:
	      return 0;
	  }
	}

	function normalizeTwoDigitYear(twoDigitYear, currentYear) {
	  var isCommonEra = currentYear > 0; // Absolute number of the current year:
	  // 1 -> 1 AC
	  // 0 -> 1 BC
	  // -1 -> 2 BC

	  var absCurrentYear = isCommonEra ? currentYear : 1 - currentYear;
	  var result;

	  if (absCurrentYear <= 50) {
	    result = twoDigitYear || 100;
	  } else {
	    var rangeEnd = absCurrentYear + 50;
	    var rangeEndCentury = Math.floor(rangeEnd / 100) * 100;
	    var isPreviousCentury = twoDigitYear >= rangeEnd % 100;
	    result = twoDigitYear + rangeEndCentury - (isPreviousCentury ? 100 : 0);
	  }

	  return isCommonEra ? result : 1 - result;
	}

	var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var DAYS_IN_MONTH_LEAP_YEAR = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // User for validation

	function isLeapYearIndex(year) {
	  return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
	}
	/*
	 * |     | Unit                           |     | Unit                           |
	 * |-----|--------------------------------|-----|--------------------------------|
	 * |  a  | AM, PM                         |  A* | Milliseconds in day            |
	 * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
	 * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
	 * |  d  | Day of month                   |  D  | Day of year                    |
	 * |  e  | Local day of week              |  E  | Day of week                    |
	 * |  f  |                                |  F* | Day of week in month           |
	 * |  g* | Modified Julian day            |  G  | Era                            |
	 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
	 * |  i! | ISO day of week                |  I! | ISO week of year               |
	 * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
	 * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
	 * |  l* | (deprecated)                   |  L  | Stand-alone month              |
	 * |  m  | Minute                         |  M  | Month                          |
	 * |  n  |                                |  N  |                                |
	 * |  o! | Ordinal number modifier        |  O* | Timezone (GMT)                 |
	 * |  p  |                                |  P  |                                |
	 * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
	 * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
	 * |  s  | Second                         |  S  | Fraction of second             |
	 * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
	 * |  u  | Extended year                  |  U* | Cyclic year                    |
	 * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
	 * |  w  | Local week of year             |  W* | Week of month                  |
	 * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
	 * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
	 * |  z* | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
	 *
	 * Letters marked by * are not implemented but reserved by Unicode standard.
	 *
	 * Letters marked by ! are non-standard, but implemented by date-fns:
	 * - `o` modifies the previous token to turn it into an ordinal (see `parse` docs)
	 * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
	 *   i.e. 7 for Sunday, 1 for Monday, etc.
	 * - `I` is ISO week of year, as opposed to `w` which is local week of year.
	 * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
	 *   `R` is supposed to be used in conjunction with `I` and `i`
	 *   for universal ISO week-numbering date, whereas
	 *   `Y` is supposed to be used in conjunction with `w` and `e`
	 *   for week-numbering date specific to the locale.
	 */


	var parsers = {
	  // Era
	  G: {
	    priority: 140,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        // AD, BC
	        case 'G':
	        case 'GG':
	        case 'GGG':
	          return match.era(string, {
	            width: 'abbreviated'
	          }) || match.era(string, {
	            width: 'narrow'
	          });
	        // A, B

	        case 'GGGGG':
	          return match.era(string, {
	            width: 'narrow'
	          });
	        // Anno Domini, Before Christ

	        case 'GGGG':
	        default:
	          return match.era(string, {
	            width: 'wide'
	          }) || match.era(string, {
	            width: 'abbreviated'
	          }) || match.era(string, {
	            width: 'narrow'
	          });
	      }
	    },
	    set: function (date, flags, value, _options) {
	      flags.era = value;
	      date.setUTCFullYear(value, 0, 1);
	      date.setUTCHours(0, 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['R', 'u', 't', 'T']
	  },
	  // Year
	  y: {
	    // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_Patterns
	    // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
	    // |----------|-------|----|-------|-------|-------|
	    // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
	    // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
	    // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
	    // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
	    // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |
	    priority: 130,
	    parse: function (string, token, match, _options) {
	      var valueCallback = function (year) {
	        return {
	          year: year,
	          isTwoDigitYear: token === 'yy'
	        };
	      };

	      switch (token) {
	        case 'y':
	          return parseNDigits(4, string, valueCallback);

	        case 'yo':
	          return match.ordinalNumber(string, {
	            unit: 'year',
	            valueCallback: valueCallback
	          });

	        default:
	          return parseNDigits(token.length, string, valueCallback);
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value.isTwoDigitYear || value.year > 0;
	    },
	    set: function (date, flags, value, _options) {
	      var currentYear = date.getUTCFullYear();

	      if (value.isTwoDigitYear) {
	        var normalizedTwoDigitYear = normalizeTwoDigitYear(value.year, currentYear);
	        date.setUTCFullYear(normalizedTwoDigitYear, 0, 1);
	        date.setUTCHours(0, 0, 0, 0);
	        return date;
	      }

	      var year = !('era' in flags) || flags.era === 1 ? value.year : 1 - value.year;
	      date.setUTCFullYear(year, 0, 1);
	      date.setUTCHours(0, 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['Y', 'R', 'u', 'w', 'I', 'i', 'e', 'c', 't', 'T']
	  },
	  // Local week-numbering year
	  Y: {
	    priority: 130,
	    parse: function (string, token, match, _options) {
	      var valueCallback = function (year) {
	        return {
	          year: year,
	          isTwoDigitYear: token === 'YY'
	        };
	      };

	      switch (token) {
	        case 'Y':
	          return parseNDigits(4, string, valueCallback);

	        case 'Yo':
	          return match.ordinalNumber(string, {
	            unit: 'year',
	            valueCallback: valueCallback
	          });

	        default:
	          return parseNDigits(token.length, string, valueCallback);
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value.isTwoDigitYear || value.year > 0;
	    },
	    set: function (date, flags, value, options) {
	      var currentYear = getUTCWeekYear(date, options);

	      if (value.isTwoDigitYear) {
	        var normalizedTwoDigitYear = normalizeTwoDigitYear(value.year, currentYear);
	        date.setUTCFullYear(normalizedTwoDigitYear, 0, options.firstWeekContainsDate);
	        date.setUTCHours(0, 0, 0, 0);
	        return startOfUTCWeek(date, options);
	      }

	      var year = !('era' in flags) || flags.era === 1 ? value.year : 1 - value.year;
	      date.setUTCFullYear(year, 0, options.firstWeekContainsDate);
	      date.setUTCHours(0, 0, 0, 0);
	      return startOfUTCWeek(date, options);
	    },
	    incompatibleTokens: ['y', 'R', 'u', 'Q', 'q', 'M', 'L', 'I', 'd', 'D', 'i', 't', 'T']
	  },
	  // ISO week-numbering year
	  R: {
	    priority: 130,
	    parse: function (string, token, _match, _options) {
	      if (token === 'R') {
	        return parseNDigitsSigned(4, string);
	      }

	      return parseNDigitsSigned(token.length, string);
	    },
	    set: function (_date, _flags, value, _options) {
	      var firstWeekOfYear = new Date(0);
	      firstWeekOfYear.setUTCFullYear(value, 0, 4);
	      firstWeekOfYear.setUTCHours(0, 0, 0, 0);
	      return startOfUTCISOWeek(firstWeekOfYear);
	    },
	    incompatibleTokens: ['G', 'y', 'Y', 'u', 'Q', 'q', 'M', 'L', 'w', 'd', 'D', 'e', 'c', 't', 'T']
	  },
	  // Extended year
	  u: {
	    priority: 130,
	    parse: function (string, token, _match, _options) {
	      if (token === 'u') {
	        return parseNDigitsSigned(4, string);
	      }

	      return parseNDigitsSigned(token.length, string);
	    },
	    set: function (date, _flags, value, _options) {
	      date.setUTCFullYear(value, 0, 1);
	      date.setUTCHours(0, 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['G', 'y', 'Y', 'R', 'w', 'I', 'i', 'e', 'c', 't', 'T']
	  },
	  // Quarter
	  Q: {
	    priority: 120,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        // 1, 2, 3, 4
	        case 'Q':
	        case 'QQ':
	          // 01, 02, 03, 04
	          return parseNDigits(token.length, string);
	        // 1st, 2nd, 3rd, 4th

	        case 'Qo':
	          return match.ordinalNumber(string, {
	            unit: 'quarter'
	          });
	        // Q1, Q2, Q3, Q4

	        case 'QQQ':
	          return match.quarter(string, {
	            width: 'abbreviated',
	            context: 'formatting'
	          }) || match.quarter(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	        // 1, 2, 3, 4 (narrow quarter; could be not numerical)

	        case 'QQQQQ':
	          return match.quarter(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	        // 1st quarter, 2nd quarter, ...

	        case 'QQQQ':
	        default:
	          return match.quarter(string, {
	            width: 'wide',
	            context: 'formatting'
	          }) || match.quarter(string, {
	            width: 'abbreviated',
	            context: 'formatting'
	          }) || match.quarter(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 1 && value <= 4;
	    },
	    set: function (date, _flags, value, _options) {
	      date.setUTCMonth((value - 1) * 3, 1);
	      date.setUTCHours(0, 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['Y', 'R', 'q', 'M', 'L', 'w', 'I', 'd', 'D', 'i', 'e', 'c', 't', 'T']
	  },
	  // Stand-alone quarter
	  q: {
	    priority: 120,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        // 1, 2, 3, 4
	        case 'q':
	        case 'qq':
	          // 01, 02, 03, 04
	          return parseNDigits(token.length, string);
	        // 1st, 2nd, 3rd, 4th

	        case 'qo':
	          return match.ordinalNumber(string, {
	            unit: 'quarter'
	          });
	        // Q1, Q2, Q3, Q4

	        case 'qqq':
	          return match.quarter(string, {
	            width: 'abbreviated',
	            context: 'standalone'
	          }) || match.quarter(string, {
	            width: 'narrow',
	            context: 'standalone'
	          });
	        // 1, 2, 3, 4 (narrow quarter; could be not numerical)

	        case 'qqqqq':
	          return match.quarter(string, {
	            width: 'narrow',
	            context: 'standalone'
	          });
	        // 1st quarter, 2nd quarter, ...

	        case 'qqqq':
	        default:
	          return match.quarter(string, {
	            width: 'wide',
	            context: 'standalone'
	          }) || match.quarter(string, {
	            width: 'abbreviated',
	            context: 'standalone'
	          }) || match.quarter(string, {
	            width: 'narrow',
	            context: 'standalone'
	          });
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 1 && value <= 4;
	    },
	    set: function (date, _flags, value, _options) {
	      date.setUTCMonth((value - 1) * 3, 1);
	      date.setUTCHours(0, 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['Y', 'R', 'Q', 'M', 'L', 'w', 'I', 'd', 'D', 'i', 'e', 'c', 't', 'T']
	  },
	  // Month
	  M: {
	    priority: 110,
	    parse: function (string, token, match, _options) {
	      var valueCallback = function (value) {
	        return value - 1;
	      };

	      switch (token) {
	        // 1, 2, ..., 12
	        case 'M':
	          return parseNumericPattern(numericPatterns.month, string, valueCallback);
	        // 01, 02, ..., 12

	        case 'MM':
	          return parseNDigits(2, string, valueCallback);
	        // 1st, 2nd, ..., 12th

	        case 'Mo':
	          return match.ordinalNumber(string, {
	            unit: 'month',
	            valueCallback: valueCallback
	          });
	        // Jan, Feb, ..., Dec

	        case 'MMM':
	          return match.month(string, {
	            width: 'abbreviated',
	            context: 'formatting'
	          }) || match.month(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	        // J, F, ..., D

	        case 'MMMMM':
	          return match.month(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	        // January, February, ..., December

	        case 'MMMM':
	        default:
	          return match.month(string, {
	            width: 'wide',
	            context: 'formatting'
	          }) || match.month(string, {
	            width: 'abbreviated',
	            context: 'formatting'
	          }) || match.month(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 0 && value <= 11;
	    },
	    set: function (date, _flags, value, _options) {
	      date.setUTCMonth(value, 1);
	      date.setUTCHours(0, 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['Y', 'R', 'q', 'Q', 'L', 'w', 'I', 'D', 'i', 'e', 'c', 't', 'T']
	  },
	  // Stand-alone month
	  L: {
	    priority: 110,
	    parse: function (string, token, match, _options) {
	      var valueCallback = function (value) {
	        return value - 1;
	      };

	      switch (token) {
	        // 1, 2, ..., 12
	        case 'L':
	          return parseNumericPattern(numericPatterns.month, string, valueCallback);
	        // 01, 02, ..., 12

	        case 'LL':
	          return parseNDigits(2, string, valueCallback);
	        // 1st, 2nd, ..., 12th

	        case 'Lo':
	          return match.ordinalNumber(string, {
	            unit: 'month',
	            valueCallback: valueCallback
	          });
	        // Jan, Feb, ..., Dec

	        case 'LLL':
	          return match.month(string, {
	            width: 'abbreviated',
	            context: 'standalone'
	          }) || match.month(string, {
	            width: 'narrow',
	            context: 'standalone'
	          });
	        // J, F, ..., D

	        case 'LLLLL':
	          return match.month(string, {
	            width: 'narrow',
	            context: 'standalone'
	          });
	        // January, February, ..., December

	        case 'LLLL':
	        default:
	          return match.month(string, {
	            width: 'wide',
	            context: 'standalone'
	          }) || match.month(string, {
	            width: 'abbreviated',
	            context: 'standalone'
	          }) || match.month(string, {
	            width: 'narrow',
	            context: 'standalone'
	          });
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 0 && value <= 11;
	    },
	    set: function (date, _flags, value, _options) {
	      date.setUTCMonth(value, 1);
	      date.setUTCHours(0, 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['Y', 'R', 'q', 'Q', 'M', 'w', 'I', 'D', 'i', 'e', 'c', 't', 'T']
	  },
	  // Local week of year
	  w: {
	    priority: 100,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        case 'w':
	          return parseNumericPattern(numericPatterns.week, string);

	        case 'wo':
	          return match.ordinalNumber(string, {
	            unit: 'week'
	          });

	        default:
	          return parseNDigits(token.length, string);
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 1 && value <= 53;
	    },
	    set: function (date, _flags, value, options) {
	      return startOfUTCWeek(setUTCWeek(date, value, options), options);
	    },
	    incompatibleTokens: ['y', 'R', 'u', 'q', 'Q', 'M', 'L', 'I', 'd', 'D', 'i', 't', 'T']
	  },
	  // ISO week of year
	  I: {
	    priority: 100,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        case 'I':
	          return parseNumericPattern(numericPatterns.week, string);

	        case 'Io':
	          return match.ordinalNumber(string, {
	            unit: 'week'
	          });

	        default:
	          return parseNDigits(token.length, string);
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 1 && value <= 53;
	    },
	    set: function (date, _flags, value, options) {
	      return startOfUTCISOWeek(setUTCISOWeek(date, value, options), options);
	    },
	    incompatibleTokens: ['y', 'Y', 'u', 'q', 'Q', 'M', 'L', 'w', 'd', 'D', 'e', 'c', 't', 'T']
	  },
	  // Day of the month
	  d: {
	    priority: 90,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        case 'd':
	          return parseNumericPattern(numericPatterns.date, string);

	        case 'do':
	          return match.ordinalNumber(string, {
	            unit: 'date'
	          });

	        default:
	          return parseNDigits(token.length, string);
	      }
	    },
	    validate: function (date, value, _options) {
	      var year = date.getUTCFullYear();
	      var isLeapYear = isLeapYearIndex(year);
	      var month = date.getUTCMonth();

	      if (isLeapYear) {
	        return value >= 1 && value <= DAYS_IN_MONTH_LEAP_YEAR[month];
	      } else {
	        return value >= 1 && value <= DAYS_IN_MONTH[month];
	      }
	    },
	    set: function (date, _flags, value, _options) {
	      date.setUTCDate(value);
	      date.setUTCHours(0, 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['Y', 'R', 'q', 'Q', 'w', 'I', 'D', 'i', 'e', 'c', 't', 'T']
	  },
	  // Day of year
	  D: {
	    priority: 90,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        case 'D':
	        case 'DD':
	          return parseNumericPattern(numericPatterns.dayOfYear, string);

	        case 'Do':
	          return match.ordinalNumber(string, {
	            unit: 'date'
	          });

	        default:
	          return parseNDigits(token.length, string);
	      }
	    },
	    validate: function (date, value, _options) {
	      var year = date.getUTCFullYear();
	      var isLeapYear = isLeapYearIndex(year);

	      if (isLeapYear) {
	        return value >= 1 && value <= 366;
	      } else {
	        return value >= 1 && value <= 365;
	      }
	    },
	    set: function (date, _flags, value, _options) {
	      date.setUTCMonth(0, value);
	      date.setUTCHours(0, 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['Y', 'R', 'q', 'Q', 'M', 'L', 'w', 'I', 'd', 'E', 'i', 'e', 'c', 't', 'T']
	  },
	  // Day of week
	  E: {
	    priority: 90,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        // Tue
	        case 'E':
	        case 'EE':
	        case 'EEE':
	          return match.day(string, {
	            width: 'abbreviated',
	            context: 'formatting'
	          }) || match.day(string, {
	            width: 'short',
	            context: 'formatting'
	          }) || match.day(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	        // T

	        case 'EEEEE':
	          return match.day(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	        // Tu

	        case 'EEEEEE':
	          return match.day(string, {
	            width: 'short',
	            context: 'formatting'
	          }) || match.day(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	        // Tuesday

	        case 'EEEE':
	        default:
	          return match.day(string, {
	            width: 'wide',
	            context: 'formatting'
	          }) || match.day(string, {
	            width: 'abbreviated',
	            context: 'formatting'
	          }) || match.day(string, {
	            width: 'short',
	            context: 'formatting'
	          }) || match.day(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 0 && value <= 6;
	    },
	    set: function (date, _flags, value, options) {
	      date = setUTCDay(date, value, options);
	      date.setUTCHours(0, 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['D', 'i', 'e', 'c', 't', 'T']
	  },
	  // Local day of week
	  e: {
	    priority: 90,
	    parse: function (string, token, match, options) {
	      var valueCallback = function (value) {
	        var wholeWeekDays = Math.floor((value - 1) / 7) * 7;
	        return (value + options.weekStartsOn + 6) % 7 + wholeWeekDays;
	      };

	      switch (token) {
	        // 3
	        case 'e':
	        case 'ee':
	          // 03
	          return parseNDigits(token.length, string, valueCallback);
	        // 3rd

	        case 'eo':
	          return match.ordinalNumber(string, {
	            unit: 'day',
	            valueCallback: valueCallback
	          });
	        // Tue

	        case 'eee':
	          return match.day(string, {
	            width: 'abbreviated',
	            context: 'formatting'
	          }) || match.day(string, {
	            width: 'short',
	            context: 'formatting'
	          }) || match.day(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	        // T

	        case 'eeeee':
	          return match.day(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	        // Tu

	        case 'eeeeee':
	          return match.day(string, {
	            width: 'short',
	            context: 'formatting'
	          }) || match.day(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	        // Tuesday

	        case 'eeee':
	        default:
	          return match.day(string, {
	            width: 'wide',
	            context: 'formatting'
	          }) || match.day(string, {
	            width: 'abbreviated',
	            context: 'formatting'
	          }) || match.day(string, {
	            width: 'short',
	            context: 'formatting'
	          }) || match.day(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 0 && value <= 6;
	    },
	    set: function (date, _flags, value, options) {
	      date = setUTCDay(date, value, options);
	      date.setUTCHours(0, 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['y', 'R', 'u', 'q', 'Q', 'M', 'L', 'I', 'd', 'D', 'E', 'i', 'c', 't', 'T']
	  },
	  // Stand-alone local day of week
	  c: {
	    priority: 90,
	    parse: function (string, token, match, options) {
	      var valueCallback = function (value) {
	        var wholeWeekDays = Math.floor((value - 1) / 7) * 7;
	        return (value + options.weekStartsOn + 6) % 7 + wholeWeekDays;
	      };

	      switch (token) {
	        // 3
	        case 'c':
	        case 'cc':
	          // 03
	          return parseNDigits(token.length, string, valueCallback);
	        // 3rd

	        case 'co':
	          return match.ordinalNumber(string, {
	            unit: 'day',
	            valueCallback: valueCallback
	          });
	        // Tue

	        case 'ccc':
	          return match.day(string, {
	            width: 'abbreviated',
	            context: 'standalone'
	          }) || match.day(string, {
	            width: 'short',
	            context: 'standalone'
	          }) || match.day(string, {
	            width: 'narrow',
	            context: 'standalone'
	          });
	        // T

	        case 'ccccc':
	          return match.day(string, {
	            width: 'narrow',
	            context: 'standalone'
	          });
	        // Tu

	        case 'cccccc':
	          return match.day(string, {
	            width: 'short',
	            context: 'standalone'
	          }) || match.day(string, {
	            width: 'narrow',
	            context: 'standalone'
	          });
	        // Tuesday

	        case 'cccc':
	        default:
	          return match.day(string, {
	            width: 'wide',
	            context: 'standalone'
	          }) || match.day(string, {
	            width: 'abbreviated',
	            context: 'standalone'
	          }) || match.day(string, {
	            width: 'short',
	            context: 'standalone'
	          }) || match.day(string, {
	            width: 'narrow',
	            context: 'standalone'
	          });
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 0 && value <= 6;
	    },
	    set: function (date, _flags, value, options) {
	      date = setUTCDay(date, value, options);
	      date.setUTCHours(0, 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['y', 'R', 'u', 'q', 'Q', 'M', 'L', 'I', 'd', 'D', 'E', 'i', 'e', 't', 'T']
	  },
	  // ISO day of week
	  i: {
	    priority: 90,
	    parse: function (string, token, match, _options) {
	      var valueCallback = function (value) {
	        if (value === 0) {
	          return 7;
	        }

	        return value;
	      };

	      switch (token) {
	        // 2
	        case 'i':
	        case 'ii':
	          // 02
	          return parseNDigits(token.length, string);
	        // 2nd

	        case 'io':
	          return match.ordinalNumber(string, {
	            unit: 'day'
	          });
	        // Tue

	        case 'iii':
	          return match.day(string, {
	            width: 'abbreviated',
	            context: 'formatting',
	            valueCallback: valueCallback
	          }) || match.day(string, {
	            width: 'short',
	            context: 'formatting',
	            valueCallback: valueCallback
	          }) || match.day(string, {
	            width: 'narrow',
	            context: 'formatting',
	            valueCallback: valueCallback
	          });
	        // T

	        case 'iiiii':
	          return match.day(string, {
	            width: 'narrow',
	            context: 'formatting',
	            valueCallback: valueCallback
	          });
	        // Tu

	        case 'iiiiii':
	          return match.day(string, {
	            width: 'short',
	            context: 'formatting',
	            valueCallback: valueCallback
	          }) || match.day(string, {
	            width: 'narrow',
	            context: 'formatting',
	            valueCallback: valueCallback
	          });
	        // Tuesday

	        case 'iiii':
	        default:
	          return match.day(string, {
	            width: 'wide',
	            context: 'formatting',
	            valueCallback: valueCallback
	          }) || match.day(string, {
	            width: 'abbreviated',
	            context: 'formatting',
	            valueCallback: valueCallback
	          }) || match.day(string, {
	            width: 'short',
	            context: 'formatting',
	            valueCallback: valueCallback
	          }) || match.day(string, {
	            width: 'narrow',
	            context: 'formatting',
	            valueCallback: valueCallback
	          });
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 1 && value <= 7;
	    },
	    set: function (date, _flags, value, options) {
	      date = setUTCISODay(date, value, options);
	      date.setUTCHours(0, 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['y', 'Y', 'u', 'q', 'Q', 'M', 'L', 'w', 'd', 'D', 'E', 'e', 'c', 't', 'T']
	  },
	  // AM or PM
	  a: {
	    priority: 80,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        case 'a':
	        case 'aa':
	        case 'aaa':
	          return match.dayPeriod(string, {
	            width: 'abbreviated',
	            context: 'formatting'
	          }) || match.dayPeriod(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });

	        case 'aaaaa':
	          return match.dayPeriod(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });

	        case 'aaaa':
	        default:
	          return match.dayPeriod(string, {
	            width: 'wide',
	            context: 'formatting'
	          }) || match.dayPeriod(string, {
	            width: 'abbreviated',
	            context: 'formatting'
	          }) || match.dayPeriod(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	      }
	    },
	    set: function (date, _flags, value, _options) {
	      date.setUTCHours(dayPeriodEnumToHours(value), 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['b', 'B', 'H', 'K', 'k', 't', 'T']
	  },
	  // AM, PM, midnight
	  b: {
	    priority: 80,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        case 'b':
	        case 'bb':
	        case 'bbb':
	          return match.dayPeriod(string, {
	            width: 'abbreviated',
	            context: 'formatting'
	          }) || match.dayPeriod(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });

	        case 'bbbbb':
	          return match.dayPeriod(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });

	        case 'bbbb':
	        default:
	          return match.dayPeriod(string, {
	            width: 'wide',
	            context: 'formatting'
	          }) || match.dayPeriod(string, {
	            width: 'abbreviated',
	            context: 'formatting'
	          }) || match.dayPeriod(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	      }
	    },
	    set: function (date, _flags, value, _options) {
	      date.setUTCHours(dayPeriodEnumToHours(value), 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['a', 'B', 'H', 'K', 'k', 't', 'T']
	  },
	  // in the morning, in the afternoon, in the evening, at night
	  B: {
	    priority: 80,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        case 'B':
	        case 'BB':
	        case 'BBB':
	          return match.dayPeriod(string, {
	            width: 'abbreviated',
	            context: 'formatting'
	          }) || match.dayPeriod(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });

	        case 'BBBBB':
	          return match.dayPeriod(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });

	        case 'BBBB':
	        default:
	          return match.dayPeriod(string, {
	            width: 'wide',
	            context: 'formatting'
	          }) || match.dayPeriod(string, {
	            width: 'abbreviated',
	            context: 'formatting'
	          }) || match.dayPeriod(string, {
	            width: 'narrow',
	            context: 'formatting'
	          });
	      }
	    },
	    set: function (date, _flags, value, _options) {
	      date.setUTCHours(dayPeriodEnumToHours(value), 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['a', 'b', 't', 'T']
	  },
	  // Hour [1-12]
	  h: {
	    priority: 70,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        case 'h':
	          return parseNumericPattern(numericPatterns.hour12h, string);

	        case 'ho':
	          return match.ordinalNumber(string, {
	            unit: 'hour'
	          });

	        default:
	          return parseNDigits(token.length, string);
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 1 && value <= 12;
	    },
	    set: function (date, _flags, value, _options) {
	      var isPM = date.getUTCHours() >= 12;

	      if (isPM && value < 12) {
	        date.setUTCHours(value + 12, 0, 0, 0);
	      } else if (!isPM && value === 12) {
	        date.setUTCHours(0, 0, 0, 0);
	      } else {
	        date.setUTCHours(value, 0, 0, 0);
	      }

	      return date;
	    },
	    incompatibleTokens: ['H', 'K', 'k', 't', 'T']
	  },
	  // Hour [0-23]
	  H: {
	    priority: 70,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        case 'H':
	          return parseNumericPattern(numericPatterns.hour23h, string);

	        case 'Ho':
	          return match.ordinalNumber(string, {
	            unit: 'hour'
	          });

	        default:
	          return parseNDigits(token.length, string);
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 0 && value <= 23;
	    },
	    set: function (date, _flags, value, _options) {
	      date.setUTCHours(value, 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['a', 'b', 'h', 'K', 'k', 't', 'T']
	  },
	  // Hour [0-11]
	  K: {
	    priority: 70,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        case 'K':
	          return parseNumericPattern(numericPatterns.hour11h, string);

	        case 'Ko':
	          return match.ordinalNumber(string, {
	            unit: 'hour'
	          });

	        default:
	          return parseNDigits(token.length, string);
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 0 && value <= 11;
	    },
	    set: function (date, _flags, value, _options) {
	      var isPM = date.getUTCHours() >= 12;

	      if (isPM && value < 12) {
	        date.setUTCHours(value + 12, 0, 0, 0);
	      } else {
	        date.setUTCHours(value, 0, 0, 0);
	      }

	      return date;
	    },
	    incompatibleTokens: ['a', 'b', 'h', 'H', 'k', 't', 'T']
	  },
	  // Hour [1-24]
	  k: {
	    priority: 70,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        case 'k':
	          return parseNumericPattern(numericPatterns.hour24h, string);

	        case 'ko':
	          return match.ordinalNumber(string, {
	            unit: 'hour'
	          });

	        default:
	          return parseNDigits(token.length, string);
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 1 && value <= 24;
	    },
	    set: function (date, _flags, value, _options) {
	      var hours = value <= 24 ? value % 24 : value;
	      date.setUTCHours(hours, 0, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['a', 'b', 'h', 'H', 'K', 't', 'T']
	  },
	  // Minute
	  m: {
	    priority: 60,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        case 'm':
	          return parseNumericPattern(numericPatterns.minute, string);

	        case 'mo':
	          return match.ordinalNumber(string, {
	            unit: 'minute'
	          });

	        default:
	          return parseNDigits(token.length, string);
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 0 && value <= 59;
	    },
	    set: function (date, _flags, value, _options) {
	      date.setUTCMinutes(value, 0, 0);
	      return date;
	    },
	    incompatibleTokens: ['t', 'T']
	  },
	  // Second
	  s: {
	    priority: 50,
	    parse: function (string, token, match, _options) {
	      switch (token) {
	        case 's':
	          return parseNumericPattern(numericPatterns.second, string);

	        case 'so':
	          return match.ordinalNumber(string, {
	            unit: 'second'
	          });

	        default:
	          return parseNDigits(token.length, string);
	      }
	    },
	    validate: function (_date, value, _options) {
	      return value >= 0 && value <= 59;
	    },
	    set: function (date, _flags, value, _options) {
	      date.setUTCSeconds(value, 0);
	      return date;
	    },
	    incompatibleTokens: ['t', 'T']
	  },
	  // Fraction of second
	  S: {
	    priority: 30,
	    parse: function (string, token, _match, _options) {
	      var valueCallback = function (value) {
	        return Math.floor(value * Math.pow(10, -token.length + 3));
	      };

	      return parseNDigits(token.length, string, valueCallback);
	    },
	    set: function (date, _flags, value, _options) {
	      date.setUTCMilliseconds(value);
	      return date;
	    },
	    incompatibleTokens: ['t', 'T']
	  },
	  // Timezone (ISO-8601. +00:00 is `'Z'`)
	  X: {
	    priority: 10,
	    parse: function (string, token, _match, _options) {
	      switch (token) {
	        case 'X':
	          return parseTimezonePattern(timezonePatterns.basicOptionalMinutes, string);

	        case 'XX':
	          return parseTimezonePattern(timezonePatterns.basic, string);

	        case 'XXXX':
	          return parseTimezonePattern(timezonePatterns.basicOptionalSeconds, string);

	        case 'XXXXX':
	          return parseTimezonePattern(timezonePatterns.extendedOptionalSeconds, string);

	        case 'XXX':
	        default:
	          return parseTimezonePattern(timezonePatterns.extended, string);
	      }
	    },
	    set: function (date, flags, value, _options) {
	      if (flags.timestampIsSet) {
	        return date;
	      }

	      return new Date(date.getTime() - value);
	    },
	    incompatibleTokens: ['t', 'T', 'x']
	  },
	  // Timezone (ISO-8601)
	  x: {
	    priority: 10,
	    parse: function (string, token, _match, _options) {
	      switch (token) {
	        case 'x':
	          return parseTimezonePattern(timezonePatterns.basicOptionalMinutes, string);

	        case 'xx':
	          return parseTimezonePattern(timezonePatterns.basic, string);

	        case 'xxxx':
	          return parseTimezonePattern(timezonePatterns.basicOptionalSeconds, string);

	        case 'xxxxx':
	          return parseTimezonePattern(timezonePatterns.extendedOptionalSeconds, string);

	        case 'xxx':
	        default:
	          return parseTimezonePattern(timezonePatterns.extended, string);
	      }
	    },
	    set: function (date, flags, value, _options) {
	      if (flags.timestampIsSet) {
	        return date;
	      }

	      return new Date(date.getTime() - value);
	    },
	    incompatibleTokens: ['t', 'T', 'X']
	  },
	  // Seconds timestamp
	  t: {
	    priority: 40,
	    parse: function (string, _token, _match, _options) {
	      return parseAnyDigitsSigned(string);
	    },
	    set: function (_date, _flags, value, _options) {
	      return [new Date(value * 1000), {
	        timestampIsSet: true
	      }];
	    },
	    incompatibleTokens: '*'
	  },
	  // Milliseconds timestamp
	  T: {
	    priority: 20,
	    parse: function (string, _token, _match, _options) {
	      return parseAnyDigitsSigned(string);
	    },
	    set: function (_date, _flags, value, _options) {
	      return [new Date(value), {
	        timestampIsSet: true
	      }];
	    },
	    incompatibleTokens: '*'
	  }
	};

	var TIMEZONE_UNIT_PRIORITY = 10; // This RegExp consists of three parts separated by `|`:
	// - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
	//   (one of the certain letters followed by `o`)
	// - (\w)\1* matches any sequences of the same letter
	// - '' matches two quote characters in a row
	// - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
	//   except a single quote symbol, which ends the sequence.
	//   Two quote characters do not end the sequence.
	//   If there is no matching single quote
	//   then the sequence will continue until the end of the string.
	// - . matches any single character unmatched by previous parts of the RegExps

	var formattingTokensRegExp$2 = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g; // This RegExp catches symbols escaped by quotes, and also
	// sequences of symbols P, p, and the combinations like `PPPPPPPppppp`

	var longFormattingTokensRegExp$1 = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
	var escapedStringRegExp$2 = /^'(.*?)'?$/;
	var doubleQuoteRegExp$2 = /''/g;
	var notWhitespaceRegExp = /\S/;
	var unescapedLatinCharacterRegExp$2 = /[a-zA-Z]/;
	/**
	 * @name parse
	 * @category Common Helpers
	 * @summary Parse the date.
	 *
	 * @description
	 * Return the date parsed from string using the given format string.
	 *
	 * > ?????? Please note that the `format` tokens differ from Moment.js and other libraries.
	 * > See: https://git.io/fxCyr
	 *
	 * The characters in the format string wrapped between two single quotes characters (') are escaped.
	 * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
	 *
	 * Format of the format string is based on Unicode Technical Standard #35:
	 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
	 * with a few additions (see note 5 below the table).
	 *
	 * Not all tokens are compatible. Combinations that don't make sense or could lead to bugs are prohibited
	 * and will throw `RangeError`. For example usage of 24-hour format token with AM/PM token will throw an exception:
	 *
	 * ```javascript
	 * parse('23 AM', 'HH a', new Date())
	 * //=> RangeError: The format string mustn't contain `HH` and `a` at the same time
	 * ```
	 *
	 * See the compatibility table: https://docs.google.com/spreadsheets/d/e/2PACX-1vQOPU3xUhplll6dyoMmVUXHKl_8CRDs6_ueLmex3SoqwhuolkuN3O05l4rqx5h1dKX8eb46Ul-CCSrq/pubhtml?gid=0&single=true
	 *
	 * Accepted format string patterns:
	 * | Unit                            |Prior| Pattern | Result examples                   | Notes |
	 * |---------------------------------|-----|---------|-----------------------------------|-------|
	 * | Era                             | 140 | G..GGG  | AD, BC                            |       |
	 * |                                 |     | GGGG    | Anno Domini, Before Christ        | 2     |
	 * |                                 |     | GGGGG   | A, B                              |       |
	 * | Calendar year                   | 130 | y       | 44, 1, 1900, 2017, 9999           | 4     |
	 * |                                 |     | yo      | 44th, 1st, 1900th, 9999999th      | 4,5   |
	 * |                                 |     | yy      | 44, 01, 00, 17                    | 4     |
	 * |                                 |     | yyy     | 044, 001, 123, 999                | 4     |
	 * |                                 |     | yyyy    | 0044, 0001, 1900, 2017            | 4     |
	 * |                                 |     | yyyyy   | ...                               | 2,4   |
	 * | Local week-numbering year       | 130 | Y       | 44, 1, 1900, 2017, 9000           | 4     |
	 * |                                 |     | Yo      | 44th, 1st, 1900th, 9999999th      | 4,5   |
	 * |                                 |     | YY      | 44, 01, 00, 17                    | 4,6   |
	 * |                                 |     | YYY     | 044, 001, 123, 999                | 4     |
	 * |                                 |     | YYYY    | 0044, 0001, 1900, 2017            | 4,6   |
	 * |                                 |     | YYYYY   | ...                               | 2,4   |
	 * | ISO week-numbering year         | 130 | R       | -43, 1, 1900, 2017, 9999, -9999   | 4,5   |
	 * |                                 |     | RR      | -43, 01, 00, 17                   | 4,5   |
	 * |                                 |     | RRR     | -043, 001, 123, 999, -999         | 4,5   |
	 * |                                 |     | RRRR    | -0043, 0001, 2017, 9999, -9999    | 4,5   |
	 * |                                 |     | RRRRR   | ...                               | 2,4,5 |
	 * | Extended year                   | 130 | u       | -43, 1, 1900, 2017, 9999, -999    | 4     |
	 * |                                 |     | uu      | -43, 01, 99, -99                  | 4     |
	 * |                                 |     | uuu     | -043, 001, 123, 999, -999         | 4     |
	 * |                                 |     | uuuu    | -0043, 0001, 2017, 9999, -9999    | 4     |
	 * |                                 |     | uuuuu   | ...                               | 2,4   |
	 * | Quarter (formatting)            | 120 | Q       | 1, 2, 3, 4                        |       |
	 * |                                 |     | Qo      | 1st, 2nd, 3rd, 4th                | 5     |
	 * |                                 |     | QQ      | 01, 02, 03, 04                    |       |
	 * |                                 |     | QQQ     | Q1, Q2, Q3, Q4                    |       |
	 * |                                 |     | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
	 * |                                 |     | QQQQQ   | 1, 2, 3, 4                        | 4     |
	 * | Quarter (stand-alone)           | 120 | q       | 1, 2, 3, 4                        |       |
	 * |                                 |     | qo      | 1st, 2nd, 3rd, 4th                | 5     |
	 * |                                 |     | qq      | 01, 02, 03, 04                    |       |
	 * |                                 |     | qqq     | Q1, Q2, Q3, Q4                    |       |
	 * |                                 |     | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
	 * |                                 |     | qqqqq   | 1, 2, 3, 4                        | 3     |
	 * | Month (formatting)              | 110 | M       | 1, 2, ..., 12                     |       |
	 * |                                 |     | Mo      | 1st, 2nd, ..., 12th               | 5     |
	 * |                                 |     | MM      | 01, 02, ..., 12                   |       |
	 * |                                 |     | MMM     | Jan, Feb, ..., Dec                |       |
	 * |                                 |     | MMMM    | January, February, ..., December  | 2     |
	 * |                                 |     | MMMMM   | J, F, ..., D                      |       |
	 * | Month (stand-alone)             | 110 | L       | 1, 2, ..., 12                     |       |
	 * |                                 |     | Lo      | 1st, 2nd, ..., 12th               | 5     |
	 * |                                 |     | LL      | 01, 02, ..., 12                   |       |
	 * |                                 |     | LLL     | Jan, Feb, ..., Dec                |       |
	 * |                                 |     | LLLL    | January, February, ..., December  | 2     |
	 * |                                 |     | LLLLL   | J, F, ..., D                      |       |
	 * | Local week of year              | 100 | w       | 1, 2, ..., 53                     |       |
	 * |                                 |     | wo      | 1st, 2nd, ..., 53th               | 5     |
	 * |                                 |     | ww      | 01, 02, ..., 53                   |       |
	 * | ISO week of year                | 100 | I       | 1, 2, ..., 53                     | 5     |
	 * |                                 |     | Io      | 1st, 2nd, ..., 53th               | 5     |
	 * |                                 |     | II      | 01, 02, ..., 53                   | 5     |
	 * | Day of month                    |  90 | d       | 1, 2, ..., 31                     |       |
	 * |                                 |     | do      | 1st, 2nd, ..., 31st               | 5     |
	 * |                                 |     | dd      | 01, 02, ..., 31                   |       |
	 * | Day of year                     |  90 | D       | 1, 2, ..., 365, 366               | 7     |
	 * |                                 |     | Do      | 1st, 2nd, ..., 365th, 366th       | 5     |
	 * |                                 |     | DD      | 01, 02, ..., 365, 366             | 7     |
	 * |                                 |     | DDD     | 001, 002, ..., 365, 366           |       |
	 * |                                 |     | DDDD    | ...                               | 2     |
	 * | Day of week (formatting)        |  90 | E..EEE  | Mon, Tue, Wed, ..., Su            |       |
	 * |                                 |     | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
	 * |                                 |     | EEEEE   | M, T, W, T, F, S, S               |       |
	 * |                                 |     | EEEEEE  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
	 * | ISO day of week (formatting)    |  90 | i       | 1, 2, 3, ..., 7                   | 5     |
	 * |                                 |     | io      | 1st, 2nd, ..., 7th                | 5     |
	 * |                                 |     | ii      | 01, 02, ..., 07                   | 5     |
	 * |                                 |     | iii     | Mon, Tue, Wed, ..., Su            | 5     |
	 * |                                 |     | iiii    | Monday, Tuesday, ..., Sunday      | 2,5   |
	 * |                                 |     | iiiii   | M, T, W, T, F, S, S               | 5     |
	 * |                                 |     | iiiiii  | Mo, Tu, We, Th, Fr, Su, Sa        | 5     |
	 * | Local day of week (formatting)  |  90 | e       | 2, 3, 4, ..., 1                   |       |
	 * |                                 |     | eo      | 2nd, 3rd, ..., 1st                | 5     |
	 * |                                 |     | ee      | 02, 03, ..., 01                   |       |
	 * |                                 |     | eee     | Mon, Tue, Wed, ..., Su            |       |
	 * |                                 |     | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
	 * |                                 |     | eeeee   | M, T, W, T, F, S, S               |       |
	 * |                                 |     | eeeeee  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
	 * | Local day of week (stand-alone) |  90 | c       | 2, 3, 4, ..., 1                   |       |
	 * |                                 |     | co      | 2nd, 3rd, ..., 1st                | 5     |
	 * |                                 |     | cc      | 02, 03, ..., 01                   |       |
	 * |                                 |     | ccc     | Mon, Tue, Wed, ..., Su            |       |
	 * |                                 |     | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
	 * |                                 |     | ccccc   | M, T, W, T, F, S, S               |       |
	 * |                                 |     | cccccc  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
	 * | AM, PM                          |  80 | a..aaa  | AM, PM                            |       |
	 * |                                 |     | aaaa    | a.m., p.m.                        | 2     |
	 * |                                 |     | aaaaa   | a, p                              |       |
	 * | AM, PM, noon, midnight          |  80 | b..bbb  | AM, PM, noon, midnight            |       |
	 * |                                 |     | bbbb    | a.m., p.m., noon, midnight        | 2     |
	 * |                                 |     | bbbbb   | a, p, n, mi                       |       |
	 * | Flexible day period             |  80 | B..BBB  | at night, in the morning, ...     |       |
	 * |                                 |     | BBBB    | at night, in the morning, ...     | 2     |
	 * |                                 |     | BBBBB   | at night, in the morning, ...     |       |
	 * | Hour [1-12]                     |  70 | h       | 1, 2, ..., 11, 12                 |       |
	 * |                                 |     | ho      | 1st, 2nd, ..., 11th, 12th         | 5     |
	 * |                                 |     | hh      | 01, 02, ..., 11, 12               |       |
	 * | Hour [0-23]                     |  70 | H       | 0, 1, 2, ..., 23                  |       |
	 * |                                 |     | Ho      | 0th, 1st, 2nd, ..., 23rd          | 5     |
	 * |                                 |     | HH      | 00, 01, 02, ..., 23               |       |
	 * | Hour [0-11]                     |  70 | K       | 1, 2, ..., 11, 0                  |       |
	 * |                                 |     | Ko      | 1st, 2nd, ..., 11th, 0th          | 5     |
	 * |                                 |     | KK      | 1, 2, ..., 11, 0                  |       |
	 * | Hour [1-24]                     |  70 | k       | 24, 1, 2, ..., 23                 |       |
	 * |                                 |     | ko      | 24th, 1st, 2nd, ..., 23rd         | 5     |
	 * |                                 |     | kk      | 24, 01, 02, ..., 23               |       |
	 * | Minute                          |  60 | m       | 0, 1, ..., 59                     |       |
	 * |                                 |     | mo      | 0th, 1st, ..., 59th               | 5     |
	 * |                                 |     | mm      | 00, 01, ..., 59                   |       |
	 * | Second                          |  50 | s       | 0, 1, ..., 59                     |       |
	 * |                                 |     | so      | 0th, 1st, ..., 59th               | 5     |
	 * |                                 |     | ss      | 00, 01, ..., 59                   |       |
	 * | Seconds timestamp               |  40 | t       | 512969520                         |       |
	 * |                                 |     | tt      | ...                               | 2     |
	 * | Fraction of second              |  30 | S       | 0, 1, ..., 9                      |       |
	 * |                                 |     | SS      | 00, 01, ..., 99                   |       |
	 * |                                 |     | SSS     | 000, 0001, ..., 999               |       |
	 * |                                 |     | SSSS    | ...                               | 2     |
	 * | Milliseconds timestamp          |  20 | T       | 512969520900                      |       |
	 * |                                 |     | TT      | ...                               | 2     |
	 * | Timezone (ISO-8601 w/ Z)        |  10 | X       | -08, +0530, Z                     |       |
	 * |                                 |     | XX      | -0800, +0530, Z                   |       |
	 * |                                 |     | XXX     | -08:00, +05:30, Z                 |       |
	 * |                                 |     | XXXX    | -0800, +0530, Z, +123456          | 2     |
	 * |                                 |     | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
	 * | Timezone (ISO-8601 w/o Z)       |  10 | x       | -08, +0530, +00                   |       |
	 * |                                 |     | xx      | -0800, +0530, +0000               |       |
	 * |                                 |     | xxx     | -08:00, +05:30, +00:00            | 2     |
	 * |                                 |     | xxxx    | -0800, +0530, +0000, +123456      |       |
	 * |                                 |     | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
	 * | Long localized date             |  NA | P       | 05/29/1453                        | 5,8   |
	 * |                                 |     | PP      | May 29, 1453                      |       |
	 * |                                 |     | PPP     | May 29th, 1453                    |       |
	 * |                                 |     | PPPP    | Sunday, May 29th, 1453            | 2,5,8 |
	 * | Long localized time             |  NA | p       | 12:00 AM                          | 5,8   |
	 * |                                 |     | pp      | 12:00:00 AM                       |       |
	 * | Combination of date and time    |  NA | Pp      | 05/29/1453, 12:00 AM              |       |
	 * |                                 |     | PPpp    | May 29, 1453, 12:00:00 AM         |       |
	 * |                                 |     | PPPpp   | May 29th, 1453 at ...             |       |
	 * |                                 |     | PPPPpp  | Sunday, May 29th, 1453 at ...     | 2,5,8 |
	 * Notes:
	 * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
	 *    are the same as "stand-alone" units, but are different in some languages.
	 *    "Formatting" units are declined according to the rules of the language
	 *    in the context of a date. "Stand-alone" units are always nominative singular.
	 *    In `format` function, they will produce different result:
	 *
	 *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
	 *
	 *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
	 *
	 *    `parse` will try to match both formatting and stand-alone units interchangably.
	 *
	 * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
	 *    the single quote characters (see below).
	 *    If the sequence is longer than listed in table:
	 *    - for numerical units (`yyyyyyyy`) `parse` will try to match a number
	 *      as wide as the sequence
	 *    - for text units (`MMMMMMMM`) `parse` will try to match the widest variation of the unit.
	 *      These variations are marked with "2" in the last column of the table.
	 *
	 * 3. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
	 *    These tokens represent the shortest form of the quarter.
	 *
	 * 4. The main difference between `y` and `u` patterns are B.C. years:
	 *
	 *    | Year | `y` | `u` |
	 *    |------|-----|-----|
	 *    | AC 1 |   1 |   1 |
	 *    | BC 1 |   1 |   0 |
	 *    | BC 2 |   2 |  -1 |
	 *
	 *    Also `yy` will try to guess the century of two digit year by proximity with `backupDate`:
	 *
	 *    `parse('50', 'yy', new Date(2018, 0, 1)) //=> Sat Jan 01 2050 00:00:00`
	 *
	 *    `parse('75', 'yy', new Date(2018, 0, 1)) //=> Wed Jan 01 1975 00:00:00`
	 *
	 *    while `uu` will just assign the year as is:
	 *
	 *    `parse('50', 'uu', new Date(2018, 0, 1)) //=> Sat Jan 01 0050 00:00:00`
	 *
	 *    `parse('75', 'uu', new Date(2018, 0, 1)) //=> Tue Jan 01 0075 00:00:00`
	 *
	 *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
	 *    except local week-numbering years are dependent on `options.weekStartsOn`
	 *    and `options.firstWeekContainsDate` (compare [setISOWeekYear]{@link https://date-fns.org/docs/setISOWeekYear}
	 *    and [setWeekYear]{@link https://date-fns.org/docs/setWeekYear}).
	 *
	 * 5. These patterns are not in the Unicode Technical Standard #35:
	 *    - `i`: ISO day of week
	 *    - `I`: ISO week of year
	 *    - `R`: ISO week-numbering year
	 *    - `o`: ordinal number modifier
	 *    - `P`: long localized date
	 *    - `p`: long localized time
	 *
	 * 6. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
	 *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://git.io/fxCyr
	 *
	 * 7. `D` and `DD` tokens represent days of the year but they are ofthen confused with days of the month.
	 *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://git.io/fxCyr
	 *
	 * 8. `P+` tokens do not have a defined priority since they are merely aliases to other tokens based
	 *    on the given locale.
	 *
	 *    using `en-US` locale: `P` => `MM/dd/yyyy`
	 *    using `en-US` locale: `p` => `hh:mm a`
	 *    using `pt-BR` locale: `P` => `dd/MM/yyyy`
	 *    using `pt-BR` locale: `p` => `HH:mm`
	 *
	 * Values will be assigned to the date in the descending order of its unit's priority.
	 * Units of an equal priority overwrite each other in the order of appearance.
	 *
	 * If no values of higher priority are parsed (e.g. when parsing string 'January 1st' without a year),
	 * the values will be taken from 3rd argument `backupDate` which works as a context of parsing.
	 *
	 * `backupDate` must be passed for correct work of the function.
	 * If you're not sure which `backupDate` to supply, create a new instance of Date:
	 * `parse('02/11/2014', 'MM/dd/yyyy', new Date())`
	 * In this case parsing will be done in the context of the current date.
	 * If `backupDate` is `Invalid Date` or a value not convertible to valid `Date`,
	 * then `Invalid Date` will be returned.
	 *
	 * The result may vary by locale.
	 *
	 * If `formatString` matches with `dateString` but does not provides tokens, `backupDate` will be returned.
	 *
	 * If parsing failed, `Invalid Date` will be returned.
	 * Invalid Date is a Date, whose time value is NaN.
	 * Time value of Date: http://es5.github.io/#x15.9.1.1
	 *
	 * ### v2.0.0 breaking changes:
	 *
	 * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
	 *
	 * - Old `parse` was renamed to `toDate`.
	 *   Now `parse` is a new function which parses a string using a provided format.
	 *
	 *   ```javascript
	 *   // Before v2.0.0
	 *   parse('2016-01-01')
	 *
	 *   // v2.0.0 onward
	 *   toDate('2016-01-01')
	 *   parse('2016-01-01', 'yyyy-MM-dd', new Date())
	 *   ```
	 *
	 * @param {String} dateString - the string to parse
	 * @param {String} formatString - the string of tokens
	 * @param {Date|Number} backupDate - defines values missing from the parsed dateString
	 * @param {Object} [options] - an object with options.
	 * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
	 * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
	 * @param {1|2|3|4|5|6|7} [options.firstWeekContainsDate=1] - the day of January, which is always in the first week of the year
	 * @param {Boolean} [options.useAdditionalWeekYearTokens=false] - if true, allows usage of the week-numbering year tokens `YY` and `YYYY`;
	 *   see: https://git.io/fxCyr
	 * @param {Boolean} [options.useAdditionalDayOfYearTokens=false] - if true, allows usage of the day of year tokens `D` and `DD`;
	 *   see: https://git.io/fxCyr
	 * @returns {Date} the parsed date
	 * @throws {TypeError} 3 arguments required
	 * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
	 * @throws {RangeError} `options.firstWeekContainsDate` must be between 1 and 7
	 * @throws {RangeError} `options.locale` must contain `match` property
	 * @throws {RangeError} use `yyyy` instead of `YYYY` for formatting years; see: https://git.io/fxCyr
	 * @throws {RangeError} use `yy` instead of `YY` for formatting years; see: https://git.io/fxCyr
	 * @throws {RangeError} use `d` instead of `D` for formatting days of the month; see: https://git.io/fxCyr
	 * @throws {RangeError} use `dd` instead of `DD` for formatting days of the month; see: https://git.io/fxCyr
	 * @throws {RangeError} format string contains an unescaped latin alphabet character
	 *
	 * @example
	 * // Parse 11 February 2014 from middle-endian format:
	 * var result = parse('02/11/2014', 'MM/dd/yyyy', new Date())
	 * //=> Tue Feb 11 2014 00:00:00
	 *
	 * @example
	 * // Parse 28th of February in Esperanto locale in the context of 2010 year:
	 * import eo from 'date-fns/locale/eo'
	 * var result = parse('28-a de februaro', "do 'de' MMMM", new Date(2010, 0, 1), {
	 *   locale: eo
	 * })
	 * //=> Sun Feb 28 2010 00:00:00
	 */

	function parse(dirtyDateString, dirtyFormatString, dirtyBackupDate, dirtyOptions) {
	  if (arguments.length < 3) {
	    throw new TypeError('3 arguments required, but only ' + arguments.length + ' present');
	  }

	  var dateString = String(dirtyDateString);
	  var formatString = String(dirtyFormatString);
	  var options = dirtyOptions || {};
	  var locale$$1 = options.locale || locale;

	  if (!locale$$1.match) {
	    throw new RangeError('locale must contain match property');
	  }

	  var localeFirstWeekContainsDate = locale$$1.options && locale$$1.options.firstWeekContainsDate;
	  var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger$1(localeFirstWeekContainsDate);
	  var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger$1(options.firstWeekContainsDate); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

	  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
	    throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
	  }

	  var localeWeekStartsOn = locale$$1.options && locale$$1.options.weekStartsOn;
	  var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger$1(localeWeekStartsOn);
	  var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger$1(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

	  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
	    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
	  }

	  if (formatString === '') {
	    if (dateString === '') {
	      return toDate(dirtyBackupDate);
	    } else {
	      return new Date(NaN);
	    }
	  }

	  var subFnOptions = {
	    firstWeekContainsDate: firstWeekContainsDate,
	    weekStartsOn: weekStartsOn,
	    locale: locale$$1 // If timezone isn't specified, it will be set to the system timezone

	  };
	  var setters = [{
	    priority: TIMEZONE_UNIT_PRIORITY,
	    set: dateToSystemTimezone,
	    index: 0
	  }];
	  var i;
	  var tokens = formatString.match(longFormattingTokensRegExp$1).map(function (substring) {
	    var firstCharacter = substring[0];

	    if (firstCharacter === 'p' || firstCharacter === 'P') {
	      var longFormatter = longFormatters[firstCharacter];
	      return longFormatter(substring, locale$$1.formatLong, subFnOptions);
	    }

	    return substring;
	  }).join('').match(formattingTokensRegExp$2);
	  var usedTokens = [];

	  for (i = 0; i < tokens.length; i++) {
	    var token = tokens[i];

	    if (!options.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token)) {
	      throwProtectedError(token);
	    }

	    if (!options.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) {
	      throwProtectedError(token);
	    }

	    var firstCharacter = token[0];
	    var parser = parsers[firstCharacter];

	    if (parser) {
	      var incompatibleTokens = parser.incompatibleTokens;

	      if (Array.isArray(incompatibleTokens)) {
	        var incompatibleToken = void 0;

	        for (var _i = 0; _i < usedTokens.length; _i++) {
	          var usedToken = usedTokens[_i].token;

	          if (incompatibleTokens.indexOf(usedToken) !== -1 || usedToken === firstCharacter) {
	            incompatibleToken = usedTokens[_i];
	            break;
	          }
	        }

	        if (incompatibleToken) {
	          throw new RangeError("The format string mustn't contain `".concat(incompatibleToken.fullToken, "` and `").concat(token, "` at the same time"));
	        }
	      } else if (parser.incompatibleTokens === '*' && usedTokens.length) {
	        throw new RangeError("The format string mustn't contain `".concat(token, "` and any other token at the same time"));
	      }

	      usedTokens.push({
	        token: firstCharacter,
	        fullToken: token
	      });
	      var parseResult = parser.parse(dateString, token, locale$$1.match, subFnOptions);

	      if (!parseResult) {
	        return new Date(NaN);
	      }

	      setters.push({
	        priority: parser.priority,
	        set: parser.set,
	        validate: parser.validate,
	        value: parseResult.value,
	        index: setters.length
	      });
	      dateString = parseResult.rest;
	    } else {
	      if (firstCharacter.match(unescapedLatinCharacterRegExp$2)) {
	        throw new RangeError('Format string contains an unescaped latin alphabet character `' + firstCharacter + '`');
	      } // Replace two single quote characters with one single quote character


	      if (token === "''") {
	        token = "'";
	      } else if (firstCharacter === "'") {
	        token = cleanEscapedString$2(token);
	      } // Cut token from string, or, if string doesn't match the token, return Invalid Date


	      if (dateString.indexOf(token) === 0) {
	        dateString = dateString.slice(token.length);
	      } else {
	        return new Date(NaN);
	      }
	    }
	  } // Check if the remaining input contains something other than whitespace


	  if (dateString.length > 0 && notWhitespaceRegExp.test(dateString)) {
	    return new Date(NaN);
	  }

	  var uniquePrioritySetters = setters.map(function (setter) {
	    return setter.priority;
	  }).sort(function (a, b) {
	    return b - a;
	  }).filter(function (priority, index, array) {
	    return array.indexOf(priority) === index;
	  }).map(function (priority) {
	    return setters.filter(function (setter) {
	      return setter.priority === priority;
	    }).reverse();
	  }).map(function (setterArray) {
	    return setterArray[0];
	  });
	  var date = toDate(dirtyBackupDate);

	  if (isNaN(date)) {
	    return new Date(NaN);
	  } // Convert the date in system timezone to the same date in UTC+00:00 timezone.
	  // This ensures that when UTC functions will be implemented, locales will be compatible with them.
	  // See an issue about UTC functions: https://github.com/date-fns/date-fns/issues/37


	  var utcDate = subMilliseconds(date, getTimezoneOffsetInMilliseconds(date));
	  var flags = {};

	  for (i = 0; i < uniquePrioritySetters.length; i++) {
	    var setter = uniquePrioritySetters[i];

	    if (setter.validate && !setter.validate(utcDate, setter.value, subFnOptions)) {
	      return new Date(NaN);
	    }

	    var result = setter.set(utcDate, flags, setter.value, subFnOptions); // Result is tuple (date, flags)

	    if (result[0]) {
	      utcDate = result[0];
	      assign(flags, result[1]); // Result is date
	    } else {
	      utcDate = result;
	    }
	  }

	  return utcDate;
	}

	function dateToSystemTimezone(date, flags) {
	  if (flags.timestampIsSet) {
	    return date;
	  }

	  var convertedDate = new Date(0);
	  convertedDate.setFullYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
	  convertedDate.setHours(date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
	  return convertedDate;
	}

	function cleanEscapedString$2(input) {
	  return input.match(escapedStringRegExp$2)[1].replace(doubleQuoteRegExp$2, "'");
	}

	/**
	 * @name startOfTomorrow
	 * @category Day Helpers
	 * @summary Return the start of tomorrow.
	 * @pure false
	 *
	 * @description
	 * Return the start of tomorrow.
	 *
	 * > ?????? Please note that this function is not present in the FP submodule as
	 * > it uses `Date.now()` internally hence impure and can't be safely curried.
	 *
	 * ### v2.0.0 breaking changes:
	 *
	 * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
	 *
	 * @returns {Date} the start of tomorrow
	 *
	 * @example
	 * // If today is 6 October 2014:
	 * var result = startOfTomorrow()
	 * //=> Tue Oct 7 2014 00:00:00
	 */

	/**
	 * @name startOfYesterday
	 * @category Day Helpers
	 * @summary Return the start of yesterday.
	 * @pure false
	 *
	 * @description
	 * Return the start of yesterday.
	 *
	 * > ?????? Please note that this function is not present in the FP submodule as
	 * > it uses `Date.now()` internally hence impure and can't be safely curried.
	 *
	 * ### v2.0.0 breaking changes:
	 *
	 * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
	 *
	 * @returns {Date} the start of yesterday
	 *
	 * @example
	 * // If today is 6 October 2014:
	 * var result = startOfYesterday()
	 * //=> Sun Oct 5 2014 00:00:00
	 */

	/**
	 *  Maximum allowed time.
	 *  @constant
	 *  @type {number}
	 *  @default
	 */

	// This file is generated automatically by `scripts/build/indices.js`. Please, don't change it.

	var formatDistanceLocale$1 = {
	  lessThanXSeconds: {
	    one: 'minder as \'n sekonde',
	    other: 'minder as {{count}} sekondes'
	  },
	  xSeconds: {
	    one: '1 sekonde',
	    other: '{{count}} sekondes'
	  },
	  halfAMinute: '\'n halwe minuut',
	  lessThanXMinutes: {
	    one: 'minder as \'n minuut',
	    other: 'minder as {{count}} minute'
	  },
	  xMinutes: {
	    one: '\'n minuut',
	    other: '{{count}} minute'
	  },
	  aboutXHours: {
	    one: 'ongeveer 1 uur',
	    other: 'ongeveer {{count}} ure'
	  },
	  xHours: {
	    one: '1 uur',
	    other: '{{count}} ure'
	  },
	  xDays: {
	    one: '1 dag',
	    other: '{{count}} dae'
	  },
	  aboutXMonths: {
	    one: 'ongeveer 1 maand',
	    other: 'ongeveer {{count}} maande'
	  },
	  xMonths: {
	    one: '1 maand',
	    other: '{{count}} maande'
	  },
	  aboutXYears: {
	    one: 'ongeveer 1 jaar',
	    other: 'ongeveer {{count}} jaar'
	  },
	  xYears: {
	    one: '1 jaar',
	    other: '{{count}} jaar'
	  },
	  overXYears: {
	    one: 'meer as 1 jaar',
	    other: 'meer as {{count}} jaar'
	  },
	  almostXYears: {
	    one: 'byna 1 jaar',
	    other: 'byna {{count}} jaar'
	  }
	};
	function formatDistance$2(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$1[token] === 'string') {
	    result = formatDistanceLocale$1[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$1[token].one;
	  } else {
	    result = formatDistanceLocale$1[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'oor ' + result;
	    } else {
	      return result + ' gelede';
	    }
	  }

	  return result;
	}

	var dateFormats$1 = {
	  full: 'EEEE, d MMMM yyyy',
	  long: 'd MMMM yyyy',
	  medium: 'd MMM yyyy',
	  short: 'yyyy/MM/dd'
	};
	var timeFormats$1 = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$1 = {
	  full: "{{date}} 'om' {{time}}",
	  long: "{{date}} 'om' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$1 = {
	  date: buildFormatLongFn({
	    formats: dateFormats$1,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$1,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$1,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$1 = {
	  lastWeek: "'verlede' eeee 'om' p",
	  yesterday: "'gister om' p",
	  today: "'vandag om' p",
	  tomorrow: "'m??re om' p",
	  nextWeek: "eeee 'om' p",
	  other: 'P'
	};
	function formatRelative$2(token) {
	  return formatRelativeLocale$1[token];
	}

	var eraValues$1 = {
	  narrow: ['vC', 'nC'],
	  abbreviated: ['vC', 'nC'],
	  wide: ['voor Christus', 'na Christus']
	};
	var quarterValues$1 = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['K1', 'K2', 'K3', 'K4'],
	  wide: ['1ste kwartaal', '2de kwartaal', '3de kwartaal', '4de kwartaal']
	};
	var monthValues$1 = {
	  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
	  wide: ['Januarie', 'Februarie', 'Maart', 'April', 'Mei', 'Junie', 'Julie', 'Augustus', 'September', 'Oktober', 'November', 'Desember']
	};
	var dayValues$1 = {
	  narrow: ['S', 'M', 'D', 'W', 'D', 'V', 'S'],
	  short: ['So', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Sa'],
	  abbreviated: ['Son', 'Maa', 'Din', 'Woe', 'Don', 'Vry', 'Sat'],
	  wide: ['Sondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrydag', 'Saterdag']
	};
	var dayPeriodValues$1 = {
	  narrow: {
	    am: 'vm',
	    pm: 'nm',
	    midnight: 'middernag',
	    noon: 'middaguur',
	    morning: 'oggend',
	    afternoon: 'middag',
	    evening: 'laat middag',
	    night: 'aand'
	  },
	  abbreviated: {
	    am: 'vm',
	    pm: 'nm',
	    midnight: 'middernag',
	    noon: 'middaguur',
	    morning: 'oggend',
	    afternoon: 'middag',
	    evening: 'laat middag',
	    night: 'aand'
	  },
	  wide: {
	    am: 'vm',
	    pm: 'nm',
	    midnight: 'middernag',
	    noon: 'middaguur',
	    morning: 'oggend',
	    afternoon: 'middag',
	    evening: 'laat middag',
	    night: 'aand'
	  }
	};
	var formattingDayPeriodValues$1 = {
	  narrow: {
	    am: 'vm',
	    pm: 'nm',
	    midnight: 'middernag',
	    noon: 'uur die middag',
	    morning: 'uur die oggend',
	    afternoon: 'uur die middag',
	    evening: 'uur die aand',
	    night: 'uur die aand'
	  },
	  abbreviated: {
	    am: 'vm',
	    pm: 'nm',
	    midnight: 'middernag',
	    noon: 'uur die middag',
	    morning: 'uur die oggend',
	    afternoon: 'uur die middag',
	    evening: 'uur die aand',
	    night: 'uur die aand'
	  },
	  wide: {
	    am: 'vm',
	    pm: 'nm',
	    midnight: 'middernag',
	    noon: 'uur die middag',
	    morning: 'uur die oggend',
	    afternoon: 'uur die middag',
	    evening: 'uur die aand',
	    night: 'uur die aand'
	  }
	};

	function ordinalNumber$1(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  var rem100 = number % 100;

	  if (rem100 < 20) {
	    switch (rem100) {
	      case 1:
	      case 8:
	        return number + 'ste';

	      default:
	        return number + 'de';
	    }
	  }

	  return number + 'ste';
	}

	var localize$1 = {
	  ordinalNumber: ordinalNumber$1,
	  era: buildLocalizeFn({
	    values: eraValues$1,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$1,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$1,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$1,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$1,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$1,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$1 = /^(\d+)(ste|de)?/i;
	var parseOrdinalNumberPattern$1 = /\d+/i;
	var matchEraPatterns$1 = {
	  narrow: /^([vn]\.? ?C\.?)/,
	  abbreviated: /^([vn]\. ?C\.?)/,
	  wide: /^((voor|na) Christus)/
	};
	var parseEraPatterns$1 = {
	  any: [/^v/, /^n/]
	};
	var matchQuarterPatterns$1 = {
	  narrow: /^[1234]/i,
	  abbreviated: /^K[1234]/i,
	  wide: /^[1234](st|d)e kwartaal/i
	};
	var parseQuarterPatterns$1 = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$1 = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(Jan|Feb|Mrt|Apr|Mei|Jun|Jul|Aug|Sep|Okt|Nov|Dec)\.?/i,
	  wide: /^(Januarie|Februarie|Maart|April|Mei|Junie|Julie|Augustus|September|Oktober|November|Desember)/i
	};
	var parseMonthPatterns$1 = {
	  narrow: [/^J/i, /^F/i, /^M/i, /^A/i, /^M/i, /^J/i, /^J/i, /^A/i, /^S/i, /^O/i, /^N/i, /^D/i],
	  any: [/^Jan/i, /^Feb/i, /^Mrt/i, /^Apr/i, /^Mei/i, /^Jun/i, /^Jul/i, /^Aug/i, /^Sep/i, /^Okt/i, /^Nov/i, /^Dec/i]
	};
	var matchDayPatterns$1 = {
	  narrow: /^[smdwv]/i,
	  short: /^(So|Ma|Di|Wo|Do|Vr|Sa)/i,
	  abbreviated: /^(Son|Maa|Din|Woe|Don|Vry|Sat)/i,
	  wide: /^(Sondag|Maandag|Dinsdag|Woensdag|Donderdag|Vrydag|Saterdag)/i
	};
	var parseDayPatterns$1 = {
	  narrow: [/^S/i, /^M/i, /^D/i, /^W/i, /^D/i, /^V/i, /^S/i],
	  any: [/^So/i, /^Ma/i, /^Di/i, /^Wo/i, /^Do/i, /^Vr/i, /^Sa/i]
	};
	var matchDayPeriodPatterns$1 = {
	  any: /^(vm|nm|middernag|(?:uur )?die (oggend|middag|aand))/i
	};
	var parseDayPeriodPatterns$1 = {
	  any: {
	    am: /^vm/i,
	    pm: /^nm/i,
	    midnight: /^middernag/i,
	    noon: /^middaguur/i,
	    morning: /oggend/i,
	    afternoon: /middag/i,
	    evening: /laat middag/i,
	    night: /aand/i
	  }
	};
	var match$1 = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$1,
	    parsePattern: parseOrdinalNumberPattern$1,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$1,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$1,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$1,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$1,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$1,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$1,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$1,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$1,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$1,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$1,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Afrikaans locale.
	 * @language Afrikaans
	 * @iso-639-2 afr
	 * @author Marnus Weststrate [@marnusw]{@link https://github.com/marnusw}
	 */

	var locale$1 = {
	  formatDistance: formatDistance$2,
	  formatLong: formatLong$1,
	  formatRelative: formatRelative$2,
	  localize: localize$1,
	  match: match$1,
	  options: {
	    weekStartsOn: 0
	    /* Sunday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	var formatDistanceLocale$2 = {
	  lessThanXSeconds: {
	    one: '?????? ???? ?????????? ??????????',
	    two: '?????? ???? ????????????',
	    threeToTen: '?????? ???? {{count}} ??????????',
	    other: '?????? ???? {{count}} ??????????'
	  },
	  xSeconds: {
	    one: '?????????? ??????????',
	    two: '????????????',
	    threeToTen: '{{count}} ??????????',
	    other: '{{count}} ??????????'
	  },
	  halfAMinute: '?????? ??????????',
	  lessThanXMinutes: {
	    one: '?????? ???? ??????????',
	    two: '?????? ???? ??????????????',
	    threeToTen: '?????? ???? {{count}} ??????????',
	    other: '?????? ???? {{count}} ??????????'
	  },
	  xMinutes: {
	    one: '?????????? ??????????',
	    two: '??????????????',
	    threeToTen: '{{count}} ??????????',
	    other: '{{count}} ??????????'
	  },
	  aboutXHours: {
	    one: '???????? ?????????? ??????????????',
	    two: '???????????? ??????????????',
	    threeToTen: '{{count}} ?????????? ??????????????',
	    other: '{{count}} ???????? ??????????????'
	  },
	  xHours: {
	    one: '???????? ??????????',
	    two: '????????????',
	    threeToTen: '{{count}} ??????????',
	    other: '{{count}} ????????'
	  },
	  xDays: {
	    one: '?????? ????????',
	    two: '??????????',
	    threeToTen: '{{count}} ????????',
	    other: '{{count}} ??????'
	  },
	  aboutXMonths: {
	    one: '?????? ???????? ??????????????',
	    two: '?????????? ??????????????',
	    threeToTen: '{{count}} ???????? ??????????????',
	    other: '{{count}} ?????? ??????????????'
	  },
	  xMonths: {
	    one: '?????? ????????',
	    two: '??????????',
	    threeToTen: '{{count}} ????????',
	    other: '{{count}} ??????'
	  },
	  aboutXYears: {
	    one: '?????? ???????? ??????????????',
	    two: '?????????? ??????????????',
	    threeToTen: '{{count}} ?????????? ??????????????',
	    other: '{{count}} ?????? ??????????????'
	  },
	  xYears: {
	    one: '?????? ????????',
	    two: '??????????',
	    threeToTen: '{{count}} ??????????',
	    other: '{{count}} ??????'
	  },
	  overXYears: {
	    one: '???????? ???? ??????',
	    two: '???????? ???? ??????????',
	    threeToTen: '???????? ???? {{count}} ??????????',
	    other: '???????? ???? {{count}} ??????'
	  },
	  almostXYears: {
	    one: '?????? ???????? ??????????????',
	    two: '?????????? ??????????????',
	    threeToTen: '{{count}} ?????????? ??????????????',
	    other: '{{count}} ?????? ??????????????'
	  }
	};
	function formatDistance$3(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$2[token] === 'string') {
	    result = formatDistanceLocale$2[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$2[token].one;
	  } else if (count === 2) {
	    result = formatDistanceLocale$2[token].two;
	  } else if (count <= 10) {
	    result = formatDistanceLocale$2[token].threeToTen.replace('{{count}}', count);
	  } else {
	    result = formatDistanceLocale$2[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return '???? ???????? ' + result;
	    } else {
	      return '?????? ' + result;
	    }
	  }

	  return result;
	}

	var dateFormats$2 = {
	  full: 'EEEE, MMMM do, y',
	  long: 'MMMM do, y',
	  medium: 'MMM d, y',
	  short: 'MM/dd/yyyy'
	};
	var timeFormats$2 = {
	  full: 'h:mm:ss a zzzz',
	  long: 'h:mm:ss a z',
	  medium: 'h:mm:ss a',
	  short: 'h:mm a'
	};
	var dateTimeFormats$2 = {
	  full: "{{date}} '??????' {{time}}",
	  long: "{{date}} '??????' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$2 = {
	  date: buildFormatLongFn({
	    formats: dateFormats$2,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$2,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$2,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$2 = {
	  lastWeek: "'??????' eeee '??????' p",
	  yesterday: "'?????? ??????' p",
	  today: "'?????????? ??????' p",
	  tomorrow: "'???????? ??????' p",
	  nextWeek: "eeee '??????' p",
	  other: 'P'
	};
	function formatRelative$3(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$2[token];
	}

	var eraValues$2 = {
	  narrow: ['??', '??'],
	  abbreviated: ['??.??.', '??.??.'],
	  wide: ['?????? ??????????????', '?????? ??????????????']
	};
	var quarterValues$2 = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['??1', '??2', '??3', '??4'],
	  wide: ['?????????? ??????????', '?????????? ????????????', '?????????? ????????????', '?????????? ????????????']
	};
	var monthValues$2 = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'],
	  abbreviated: ['????????', '????????', '????????', '??????????', '????????', '??????????', '????????', '??????', '????????', '????????', '????????', '????????'],
	  wide: ['??????????', '??????????', '????????', '??????????', '??????', '????????', '????????????', '??????', '????????????', '????????????', '????????????', '????????????']
	};
	var dayValues$2 = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??'],
	  short: ['??????', '??????????', '????????????', '????????????', '????????', '????????', '??????'],
	  abbreviated: ['??????', '????????', '??????', '????????', '????????', '????????', '??????'],
	  wide: ['??????????', '??????????????', '????????????????', '????????????????', '????????????', '????????????', '??????????']
	};
	var dayPeriodValues$2 = {
	  narrow: {
	    am: '??',
	    pm: '??',
	    midnight: '??',
	    noon: '??',
	    morning: '????????????',
	    afternoon: '?????? ??????????',
	    evening: '????????????',
	    night: '??????????'
	  },
	  abbreviated: {
	    am: '??',
	    pm: '??',
	    midnight: '?????? ??????????',
	    noon: '??????',
	    morning: '????????????',
	    afternoon: '?????? ??????????',
	    evening: '????????????',
	    night: '??????????'
	  },
	  wide: {
	    am: '??',
	    pm: '??',
	    midnight: '?????? ??????????',
	    noon: '??????',
	    morning: '????????????',
	    afternoon: '?????? ??????????',
	    evening: '????????????',
	    night: '??????????'
	  }
	};
	var formattingDayPeriodValues$2 = {
	  narrow: {
	    am: '??',
	    pm: '??',
	    midnight: '??',
	    noon: '??',
	    morning: '???? ????????????',
	    afternoon: '?????? ????????????',
	    evening: '???? ????????????',
	    night: '???? ??????????'
	  },
	  abbreviated: {
	    am: '??',
	    pm: '??',
	    midnight: '?????? ??????????',
	    noon: '??????',
	    morning: '???? ????????????',
	    evening: '???? ????????????',
	    night: '???? ??????????'
	  },
	  wide: {
	    am: '??',
	    pm: '??',
	    midnight: '?????? ??????????',
	    noon: '??????',
	    afternoon: '?????? ????????????',
	    evening: '???? ????????????',
	    night: '???? ??????????'
	  }
	};

	function ordinalNumber$2(dirtyNumber) {
	  return String(dirtyNumber);
	}

	var localize$2 = {
	  ordinalNumber: ordinalNumber$2,
	  era: buildLocalizeFn({
	    values: eraValues$2,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$2,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$2,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$2,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$2,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$2,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$2 = /^(\d+)(th|st|nd|rd)?/i;
	var parseOrdinalNumberPattern$2 = /\d+/i;
	var matchEraPatterns$2 = {
	  narrow: /^(??|??)/i,
	  abbreviated: /^(??\.?\s???\.?|??\.?\s???\.?\s?|a\.?\s?d\.?|c\.?\s?)/i,
	  wide: /^(?????? ??????????????|?????? ??????????????|?????? ??????????????|?????? ??????????????)/i
	};
	var parseEraPatterns$2 = {
	  any: [/^??????/i, /^??????/i]
	};
	var matchQuarterPatterns$2 = {
	  narrow: /^[1234]/i,
	  abbreviated: /^??[1234]/i,
	  wide: /^?????????? [1234]/i
	};
	var parseQuarterPatterns$2 = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$2 = {
	  narrow: /^[??????????????]/i,
	  abbreviated: /^(??????|??????|??????|??????|??????|??????|??????|??????|??????|??????|??????|??????)/i,
	  wide: /^(??????????|??????????|????????|??????????|??????|????????|????????????|??????|????????????|????????????|????????????|????????????)/i
	};
	var parseMonthPatterns$2 = {
	  narrow: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  any: [/^??????/i, /^??????/i, /^??????/i, /^??????/i, /^??????/i, /^??????/i, /^??????/i, /^??????/i, /^??????/i, /^??????/i, /^??????/i, /^??????/i]
	};
	var matchDayPatterns$2 = {
	  narrow: /^[??????????????]/i,
	  short: /^(??????|??????????|????????????|????????????|????????|????????|??????)/i,
	  abbreviated: /^(??????|??????|??????|??????|??????|????????|??????)/i,
	  wide: /^(??????????|??????????????|????????????????|????????????????|????????????|????????????|??????????)/i
	};
	var parseDayPatterns$2 = {
	  narrow: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  wide: [/^??????????/i, /^??????????????/i, /^????????????????/i, /^????????????????/i, /^????????????/i, /^????????????/i, /^??????????/i],
	  any: [/^????/i, /^????/i, /^??/i, /^????/i, /^??/i, /^??/i, /^??/i]
	};
	var matchDayPeriodPatterns$2 = {
	  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
	  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
	};
	var parseDayPeriodPatterns$2 = {
	  any: {
	    am: /^a/i,
	    pm: /^p/i,
	    midnight: /^mi/i,
	    noon: /^no/i,
	    morning: /morning/i,
	    afternoon: /afternoon/i,
	    evening: /evening/i,
	    night: /night/i
	  }
	};
	var match$2 = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$2,
	    parsePattern: parseOrdinalNumberPattern$2,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$2,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$2,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$2,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$2,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$2,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$2,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$2,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$2,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$2,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$2,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Arabic locale (Modern Standard Arabic ).
	 * @language Modern Standard Arabic (Algeria) [ar-dz]
	 * @iso-639-2 ara
	 * @author Badreddine Boumaza [@badre429]{@link https://github.com/badre429}
	 * @author Ahmed ElShahat [@elshahat]{@link https://github.com/elshahat}
	 */

	var locale$2 = {
	  formatDistance: formatDistance$3,
	  formatLong: formatLong$2,
	  formatRelative: formatRelative$3,
	  localize: localize$2,
	  match: match$2,
	  options: {
	    weekStartsOn: 0
	    /* Sunday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	var formatDistanceLocale$3 = {
	  lessThanXSeconds: {
	    one: '?????? ???? ?????????? ??????????',
	    two: '?????? ???? ????????????',
	    threeToTen: '?????? ???? {{count}} ??????????',
	    other: '?????? ???? {{count}} ??????????'
	  },
	  xSeconds: {
	    one: '?????????? ??????????',
	    two: '????????????',
	    threeToTen: '{{count}} ??????????',
	    other: '{{count}} ??????????'
	  },
	  halfAMinute: '?????? ??????????',
	  lessThanXMinutes: {
	    one: '?????? ???? ??????????',
	    two: '?????? ???? ??????????????',
	    threeToTen: '?????? ???? {{count}} ??????????',
	    other: '?????? ???? {{count}} ??????????'
	  },
	  xMinutes: {
	    one: '?????????? ??????????',
	    two: '??????????????',
	    threeToTen: '{{count}} ??????????',
	    other: '{{count}} ??????????'
	  },
	  aboutXHours: {
	    one: '???????? ?????????? ??????????????',
	    two: '???????????? ??????????????',
	    threeToTen: '{{count}} ?????????? ??????????????',
	    other: '{{count}} ???????? ??????????????'
	  },
	  xHours: {
	    one: '???????? ??????????',
	    two: '????????????',
	    threeToTen: '{{count}} ??????????',
	    other: '{{count}} ????????'
	  },
	  xDays: {
	    one: '?????? ????????',
	    two: '??????????',
	    threeToTen: '{{count}} ????????',
	    other: '{{count}} ??????'
	  },
	  aboutXMonths: {
	    one: '?????? ???????? ??????????????',
	    two: '?????????? ??????????????',
	    threeToTen: '{{count}} ???????? ??????????????',
	    other: '{{count}} ?????? ??????????????'
	  },
	  xMonths: {
	    one: '?????? ????????',
	    two: '??????????',
	    threeToTen: '{{count}} ????????',
	    other: '{{count}} ??????'
	  },
	  aboutXYears: {
	    one: '?????? ???????? ??????????????',
	    two: '?????????? ??????????????',
	    threeToTen: '{{count}} ?????????? ??????????????',
	    other: '{{count}} ?????? ??????????????'
	  },
	  xYears: {
	    one: '?????? ????????',
	    two: '??????????',
	    threeToTen: '{{count}} ??????????',
	    other: '{{count}} ??????'
	  },
	  overXYears: {
	    one: '???????? ???? ??????',
	    two: '???????? ???? ??????????',
	    threeToTen: '???????? ???? {{count}} ??????????',
	    other: '???????? ???? {{count}} ??????'
	  },
	  almostXYears: {
	    one: '?????? ???????? ??????????????',
	    two: '?????????? ??????????????',
	    threeToTen: '{{count}} ?????????? ??????????????',
	    other: '{{count}} ?????? ??????????????'
	  }
	};
	function formatDistance$4(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$3[token] === 'string') {
	    result = formatDistanceLocale$3[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$3[token].one;
	  } else if (count === 2) {
	    result = formatDistanceLocale$3[token].two;
	  } else if (count <= 10) {
	    result = formatDistanceLocale$3[token].threeToTen.replace('{{count}}', count);
	  } else {
	    result = formatDistanceLocale$3[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return '???? ???????? ' + result;
	    } else {
	      return '?????? ' + result;
	    }
	  }

	  return result;
	}

	var dateFormats$3 = {
	  full: 'EEEE, MMMM do, y',
	  long: 'MMMM do, y',
	  medium: 'MMM d, y',
	  short: 'MM/dd/yyyy'
	};
	var timeFormats$3 = {
	  full: 'h:mm:ss a zzzz',
	  long: 'h:mm:ss a z',
	  medium: 'h:mm:ss a',
	  short: 'h:mm a'
	};
	var dateTimeFormats$3 = {
	  full: "{{date}} '??????' {{time}}",
	  long: "{{date}} '??????' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$3 = {
	  date: buildFormatLongFn({
	    formats: dateFormats$3,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$3,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$3,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$3 = {
	  lastWeek: "'??????' eeee '??????' p",
	  yesterday: "'?????? ??????' p",
	  today: "'?????????? ??????' p",
	  tomorrow: "'???????? ??????' p",
	  nextWeek: "eeee '??????' p",
	  other: 'P'
	};
	function formatRelative$4(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$3[token];
	}

	var eraValues$3 = {
	  narrow: ['??', '??'],
	  abbreviated: ['??.??.', '??.??.'],
	  wide: ['?????? ??????????????', '?????? ??????????????']
	};
	var quarterValues$3 = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['??1', '??2', '??3', '??4'],
	  wide: ['?????????? ??????????', '?????????? ????????????', '?????????? ????????????', '?????????? ????????????']
	};
	var monthValues$3 = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'],
	  abbreviated: ['??????', '??????', '????????', '??????????', '????????', '????????', '????????', '????????', '????????', '????????', '????????', '????????'],
	  wide: ['??????????', '????????????', '????????', '??????????', '????????', '??????????', '??????????', '??????????', '????????????', '????????????', '????????????', '????????????']
	};
	var dayValues$3 = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??'],
	  short: ['??????', '??????????', '????????????', '????????????', '????????', '????????', '??????'],
	  abbreviated: ['??????', '????????', '??????', '????????', '????????', '????????', '??????'],
	  wide: ['??????????', '??????????????', '????????????????', '????????????????', '????????????', '????????????', '??????????']
	};
	var dayPeriodValues$3 = {
	  narrow: {
	    am: '??',
	    pm: '??',
	    midnight: '??',
	    noon: '??',
	    morning: '????????????',
	    afternoon: '?????? ??????????',
	    evening: '????????????',
	    night: '??????????'
	  },
	  abbreviated: {
	    am: '??',
	    pm: '??',
	    midnight: '?????? ??????????',
	    noon: '??????',
	    morning: '????????????',
	    afternoon: '?????? ??????????',
	    evening: '????????????',
	    night: '??????????'
	  },
	  wide: {
	    am: '??',
	    pm: '??',
	    midnight: '?????? ??????????',
	    noon: '??????',
	    morning: '????????????',
	    afternoon: '?????? ??????????',
	    evening: '????????????',
	    night: '??????????'
	  }
	};
	var formattingDayPeriodValues$3 = {
	  narrow: {
	    am: '??',
	    pm: '??',
	    midnight: '??',
	    noon: '??',
	    morning: '???? ????????????',
	    afternoon: '?????? ????????????',
	    evening: '???? ????????????',
	    night: '???? ??????????'
	  },
	  abbreviated: {
	    am: '??',
	    pm: '??',
	    midnight: '?????? ??????????',
	    noon: '??????',
	    morning: '???? ????????????',
	    evening: '???? ????????????',
	    night: '???? ??????????'
	  },
	  wide: {
	    am: '??',
	    pm: '??',
	    midnight: '?????? ??????????',
	    noon: '??????',
	    afternoon: '?????? ????????????',
	    evening: '???? ????????????',
	    night: '???? ??????????'
	  }
	};

	function ordinalNumber$3(dirtyNumber) {
	  return String(dirtyNumber);
	}

	var localize$3 = {
	  ordinalNumber: ordinalNumber$3,
	  era: buildLocalizeFn({
	    values: eraValues$3,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$3,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$3,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$3,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$3,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$3,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$3 = /^(\d+)(th|st|nd|rd)?/i;
	var parseOrdinalNumberPattern$3 = /\d+/i;
	var matchEraPatterns$3 = {
	  narrow: /^(??|??)/i,
	  abbreviated: /^(??\.?\s???\.?|??\.?\s???\.?\s?|a\.?\s?d\.?|c\.?\s?)/i,
	  wide: /^(?????? ??????????????|?????? ??????????????|?????? ??????????????|?????? ??????????????)/i
	};
	var parseEraPatterns$3 = {
	  any: [/^??????/i, /^??????/i]
	};
	var matchQuarterPatterns$3 = {
	  narrow: /^[1234]/i,
	  abbreviated: /^??[1234]/i,
	  wide: /^?????????? [1234]/i
	};
	var parseQuarterPatterns$3 = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$3 = {
	  narrow: /^[????????????????]/i,
	  abbreviated: /^(????|??|??????|????|??????|??????|??????|????|??|????|??|??)/i,
	  wide: /^(????|??|??????|????|??????|??????|??????|????|??|????|??|??)/i
	};
	var parseMonthPatterns$3 = {
	  narrow: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  any: [/^????/i, /^??/i, /^??????/i, /^????/i, /^??????/i, /^??????/i, /^??????/i, /^????/i, /^??/i, /^????/i, /^??/i, /^??/i]
	};
	var matchDayPatterns$3 = {
	  narrow: /^[??????????????]/i,
	  short: /^(??????|??????????|????????????|????????????|????????|????????|??????)/i,
	  abbreviated: /^(??????|??????|??????|??????|??????|????????|??????)/i,
	  wide: /^(??????????|??????????????|????????????????|????????????????|????????????|????????????|??????????)/i
	};
	var parseDayPatterns$3 = {
	  narrow: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  wide: [/^??????????/i, /^??????????????/i, /^????????????????/i, /^????????????????/i, /^????????????/i, /^????????????/i, /^??????????/i],
	  any: [/^????/i, /^????/i, /^??/i, /^????/i, /^??/i, /^??/i, /^??/i]
	};
	var matchDayPeriodPatterns$3 = {
	  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
	  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
	};
	var parseDayPeriodPatterns$3 = {
	  any: {
	    am: /^a/i,
	    pm: /^p/i,
	    midnight: /^mi/i,
	    noon: /^no/i,
	    morning: /morning/i,
	    afternoon: /afternoon/i,
	    evening: /evening/i,
	    night: /night/i
	  }
	};
	var match$3 = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$3,
	    parsePattern: parseOrdinalNumberPattern$3,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$3,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$3,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$3,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$3,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$3,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$3,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$3,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$3,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$3,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$3,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Arabic locale (Sauid Arabic).
	 * @language Arabic
	 * @iso-639-2 ara
	 * @author Dhaifallah Alwadani [@dalwadani]{@link https://github.com/dalwadani}
	 */

	var locale$3 = {
	  formatDistance: formatDistance$4,
	  formatLong: formatLong$3,
	  formatRelative: formatRelative$4,
	  localize: localize$3,
	  match: match$3,
	  options: {
	    weekStartsOn: 0
	    /* Sunday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	function declension(scheme, count) {
	  // scheme for count=1 exists
	  if (scheme.one !== undefined && count === 1) {
	    return scheme.one;
	  }

	  var rem10 = count % 10;
	  var rem100 = count % 100; // 1, 21, 31, ...

	  if (rem10 === 1 && rem100 !== 11) {
	    return scheme.singularNominative.replace('{{count}}', count); // 2, 3, 4, 22, 23, 24, 32 ...
	  } else if (rem10 >= 2 && rem10 <= 4 && (rem100 < 10 || rem100 > 20)) {
	    return scheme.singularGenitive.replace('{{count}}', count); // 5, 6, 7, 8, 9, 10, 11, ...
	  } else {
	    return scheme.pluralGenitive.replace('{{count}}', count);
	  }
	}

	function buildLocalizeTokenFn(scheme) {
	  return function (count, options) {
	    if (options.addSuffix) {
	      if (options.comparison > 0) {
	        if (scheme.future) {
	          return declension(scheme.future, count);
	        } else {
	          return '???????? ' + declension(scheme.regular, count);
	        }
	      } else {
	        if (scheme.past) {
	          return declension(scheme.past, count);
	        } else {
	          return declension(scheme.regular, count) + ' ????????';
	        }
	      }
	    } else {
	      return declension(scheme.regular, count);
	    }
	  };
	}

	var formatDistanceLocale$4 = {
	  lessThanXSeconds: buildLocalizeTokenFn({
	    regular: {
	      one: '???????? ???? ??????????????',
	      singularNominative: '???????? ???? {{count}} ??????????????',
	      singularGenitive: '???????? ???? {{count}} ??????????????',
	      pluralGenitive: '???????? ???? {{count}} ????????????'
	    },
	    future: {
	      one: '????????, ?????? ???????? ??????????????',
	      singularNominative: '????????, ?????? ???????? {{count}} ??????????????',
	      singularGenitive: '????????, ?????? ???????? {{count}} ??????????????',
	      pluralGenitive: '????????, ?????? ???????? {{count}} ????????????'
	    }
	  }),
	  xSeconds: buildLocalizeTokenFn({
	    regular: {
	      singularNominative: '{{count}} ??????????????',
	      singularGenitive: '{{count}} ??????????????',
	      pluralGenitive: '{{count}} ????????????'
	    },
	    past: {
	      singularNominative: '{{count}} ?????????????? ????????',
	      singularGenitive: '{{count}} ?????????????? ????????',
	      pluralGenitive: '{{count}} ???????????? ????????'
	    },
	    future: {
	      singularNominative: '???????? {{count}} ??????????????',
	      singularGenitive: '???????? {{count}} ??????????????',
	      pluralGenitive: '???????? {{count}} ????????????'
	    }
	  }),
	  halfAMinute: function (_, options) {
	    if (options.addSuffix) {
	      if (options.comparison > 0) {
	        return '???????? ????????????????????';
	      } else {
	        return '???????????????????? ????????';
	      }
	    }

	    return '????????????????????';
	  },
	  lessThanXMinutes: buildLocalizeTokenFn({
	    regular: {
	      one: '???????? ???? ??????????????',
	      singularNominative: '???????? ???? {{count}} ??????????????',
	      singularGenitive: '???????? ???? {{count}} ??????????????',
	      pluralGenitive: '???????? ???? {{count}} ????????????'
	    },
	    future: {
	      one: '????????, ?????? ???????? ??????????????',
	      singularNominative: '????????, ?????? ???????? {{count}} ??????????????',
	      singularGenitive: '????????, ?????? ???????? {{count}} ??????????????',
	      pluralGenitive: '????????, ?????? ???????? {{count}} ????????????'
	    }
	  }),
	  xMinutes: buildLocalizeTokenFn({
	    regular: {
	      singularNominative: '{{count}} ??????????????',
	      singularGenitive: '{{count}} ??????????????',
	      pluralGenitive: '{{count}} ????????????'
	    },
	    past: {
	      singularNominative: '{{count}} ?????????????? ????????',
	      singularGenitive: '{{count}} ?????????????? ????????',
	      pluralGenitive: '{{count}} ???????????? ????????'
	    },
	    future: {
	      singularNominative: '???????? {{count}} ??????????????',
	      singularGenitive: '???????? {{count}} ??????????????',
	      pluralGenitive: '???????? {{count}} ????????????'
	    }
	  }),
	  aboutXHours: buildLocalizeTokenFn({
	    regular: {
	      singularNominative: '???????? {{count}} ??????????????',
	      singularGenitive: '???????? {{count}} ????????????',
	      pluralGenitive: '???????? {{count}} ????????????'
	    },
	    future: {
	      singularNominative: '?????????????????? ???????? {{count}} ??????????????',
	      singularGenitive: '?????????????????? ???????? {{count}} ??????????????',
	      pluralGenitive: '?????????????????? ???????? {{count}} ????????????'
	    }
	  }),
	  xHours: buildLocalizeTokenFn({
	    regular: {
	      singularNominative: '{{count}} ??????????????',
	      singularGenitive: '{{count}} ??????????????',
	      pluralGenitive: '{{count}} ????????????'
	    },
	    past: {
	      singularNominative: '{{count}} ?????????????? ????????',
	      singularGenitive: '{{count}} ?????????????? ????????',
	      pluralGenitive: '{{count}} ???????????? ????????'
	    },
	    future: {
	      singularNominative: '???????? {{count}} ??????????????',
	      singularGenitive: '???????? {{count}} ??????????????',
	      pluralGenitive: '???????? {{count}} ????????????'
	    }
	  }),
	  xDays: buildLocalizeTokenFn({
	    regular: {
	      singularNominative: '{{count}} ??????????',
	      singularGenitive: '{{count}} ??????',
	      pluralGenitive: '{{count}} ????????'
	    }
	  }),
	  aboutXMonths: buildLocalizeTokenFn({
	    regular: {
	      singularNominative: '???????? {{count}} ????????????',
	      singularGenitive: '???????? {{count}} ??????????????',
	      pluralGenitive: '???????? {{count}} ??????????????'
	    },
	    future: {
	      singularNominative: '?????????????????? ???????? {{count}} ??????????',
	      singularGenitive: '?????????????????? ???????? {{count}} ????????????',
	      pluralGenitive: '?????????????????? ???????? {{count}} ??????????????'
	    }
	  }),
	  xMonths: buildLocalizeTokenFn({
	    regular: {
	      singularNominative: '{{count}} ??????????',
	      singularGenitive: '{{count}} ????????????',
	      pluralGenitive: '{{count}} ??????????????'
	    }
	  }),
	  aboutXYears: buildLocalizeTokenFn({
	    regular: {
	      singularNominative: '???????? {{count}} ????????',
	      singularGenitive: '???????? {{count}} ??????????',
	      pluralGenitive: '???????? {{count}} ??????????'
	    },
	    future: {
	      singularNominative: '?????????????????? ???????? {{count}} ??????',
	      singularGenitive: '?????????????????? ???????? {{count}} ????????',
	      pluralGenitive: '?????????????????? ???????? {{count}} ??????????'
	    }
	  }),
	  xYears: buildLocalizeTokenFn({
	    regular: {
	      singularNominative: '{{count}} ??????',
	      singularGenitive: '{{count}} ????????',
	      pluralGenitive: '{{count}} ??????????'
	    }
	  }),
	  overXYears: buildLocalizeTokenFn({
	    regular: {
	      singularNominative: '?????????? ???? {{count}} ??????',
	      singularGenitive: '?????????? ???? {{count}} ????????',
	      pluralGenitive: '?????????? ???? {{count}} ??????????'
	    },
	    future: {
	      singularNominative: '??????????, ?????? ???????? {{count}} ??????',
	      singularGenitive: '??????????, ?????? ???????? {{count}} ????????',
	      pluralGenitive: '??????????, ?????? ???????? {{count}} ??????????'
	    }
	  }),
	  almostXYears: buildLocalizeTokenFn({
	    regular: {
	      singularNominative: '?????????? {{count}} ??????',
	      singularGenitive: '?????????? {{count}} ????????',
	      pluralGenitive: '?????????? {{count}} ??????????'
	    },
	    future: {
	      singularNominative: '?????????? ???????? {{count}} ??????',
	      singularGenitive: '?????????? ???????? {{count}} ????????',
	      pluralGenitive: '?????????? ???????? {{count}} ??????????'
	    }
	  })
	};
	function formatDistance$5(token, count, options) {
	  options = options || {};
	  return formatDistanceLocale$4[token](count, options);
	}

	var dateFormats$4 = {
	  full: "EEEE, d MMMM y '??.'",
	  long: "d MMMM y '??.'",
	  medium: "d MMM y '??.'",
	  short: 'dd.MM.y'
	};
	var timeFormats$4 = {
	  full: 'H:mm:ss zzzz',
	  long: 'H:mm:ss z',
	  medium: 'H:mm:ss',
	  short: 'H:mm'
	};
	var dateTimeFormats$4 = {
	  any: '{{date}}, {{time}}'
	};
	var formatLong$4 = {
	  date: buildFormatLongFn({
	    formats: dateFormats$4,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$4,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$4,
	    defaultWidth: 'any'
	  })
	};

	// See issue: https://github.com/date-fns/date-fns/issues/376

	function isSameUTCWeek(dirtyDateLeft, dirtyDateRight, options) {
	  if (arguments.length < 2) {
	    throw new TypeError('2 argument required, but only ' + arguments.length + ' present');
	  }

	  var dateLeftStartOfWeek = startOfUTCWeek(dirtyDateLeft, options);
	  var dateRightStartOfWeek = startOfUTCWeek(dirtyDateRight, options);
	  return dateLeftStartOfWeek.getTime() === dateRightStartOfWeek.getTime();
	}

	var accusativeWeekdays = ['??????????????', '????????????????????', '??????????????', '????????????', '????????????', '??????????????', '????????????'];

	function lastWeek(day) {
	  var weekday = accusativeWeekdays[day];

	  switch (day) {
	    case 0:
	    case 3:
	    case 5:
	    case 6:
	      return "'?? ?????????????? " + weekday + " ??' p";

	    case 1:
	    case 2:
	    case 4:
	      return "'?? ???????????? " + weekday + " ??' p";
	  }
	}

	function thisWeek(day) {
	  var weekday = accusativeWeekdays[day];
	  return "'?? " + weekday + " ??' p";
	}

	function nextWeek(day) {
	  var weekday = accusativeWeekdays[day];

	  switch (day) {
	    case 0:
	    case 3:
	    case 5:
	    case 6:
	      return "'?? ?????????????????? " + weekday + " ??' p";

	    case 1:
	    case 2:
	    case 4:
	      return "'?? ???????????????? " + weekday + " ??' p";
	  }
	}

	var formatRelativeLocale$4 = {
	  lastWeek: function (date, baseDate, options) {
	    var day = date.getUTCDay();

	    if (isSameUTCWeek(date, baseDate, options)) {
	      return thisWeek(day);
	    } else {
	      return lastWeek(day);
	    }
	  },
	  yesterday: "'?????????? ??' p",
	  today: "'?????????? ??' p",
	  tomorrow: "'???????????? ??' p",
	  nextWeek: function (date, baseDate, options) {
	    var day = date.getUTCDay();

	    if (isSameUTCWeek(date, baseDate, options)) {
	      return thisWeek(day);
	    } else {
	      return nextWeek(day);
	    }
	  },
	  other: 'P'
	};
	function formatRelative$5(token, date, baseDate, options) {
	  var format = formatRelativeLocale$4[token];

	  if (typeof format === 'function') {
	    return format(date, baseDate, options);
	  }

	  return format;
	}

	var eraValues$4 = {
	  narrow: ['???? ??.??.', '??.??.'],
	  abbreviated: ['???? ??. ??.', '??. ??.'],
	  wide: ['???? ?????????? ??????', '?????????? ??????']
	};
	var quarterValues$4 = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['1-?? ????.', '2-?? ????.', '3-?? ????.', '4-?? ????.'],
	  wide: ['1-?? ??????????????', '2-?? ??????????????', '3-?? ??????????????', '4-?? ??????????????']
	};
	var monthValues$4 = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'],
	  abbreviated: ['??????????.', '??????.', '??????.', '????????.', '??????', '????????.', '??????.', '????.', '??????.', '??????????.', '????????.', '????????.'],
	  wide: ['????????????????', '????????', '??????????????', '????????????????', '??????', '??????????????', '????????????', '??????????????', '????????????????', '????????????????????', '????????????????', '??????????????']
	};
	var formattingMonthValues = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'],
	  abbreviated: ['??????????.', '??????.', '??????.', '????????.', '??????', '????????.', '??????.', '????.', '??????.', '??????????.', '????????.', '????????.'],
	  wide: ['????????????????', '????????????', '????????????????', '??????????????????', '??????', '??????????????', '????????????', '????????????', '??????????????', '??????????????????????', '??????????????????', '????????????']
	};
	var dayValues$4 = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??'],
	  short: ['????', '????', '????', '????', '????', '????', '????'],
	  abbreviated: ['????????', '??????', '??????', '??????', '??????', '??????', '??????'],
	  wide: ['??????????????', '????????????????????', '??????????????', '????????????', '????????????', '??????????????', '????????????']
	};
	var dayPeriodValues$4 = {
	  narrow: {
	    am: '????',
	    pm: '????',
	    midnight: '????????.',
	    noon: '????????.',
	    morning: '??????.',
	    afternoon: '??????????',
	    evening: '??????.',
	    night: '??????'
	  },
	  abbreviated: {
	    am: '????',
	    pm: '????',
	    midnight: '????????.',
	    noon: '????????.',
	    morning: '??????.',
	    afternoon: '??????????',
	    evening: '??????.',
	    night: '??????'
	  },
	  wide: {
	    am: '????',
	    pm: '????',
	    midnight: '????????????',
	    noon: '????????????????',
	    morning: '????????????',
	    afternoon: '??????????',
	    evening: '??????????',
	    night: '??????'
	  }
	};
	var formattingDayPeriodValues$4 = {
	  narrow: {
	    am: '????',
	    pm: '????',
	    midnight: '????????.',
	    noon: '????????.',
	    morning: '??????.',
	    afternoon: '??????',
	    evening: '??????.',
	    night: '????????'
	  },
	  abbreviated: {
	    am: '????',
	    pm: '????',
	    midnight: '????????.',
	    noon: '????????.',
	    morning: '??????.',
	    afternoon: '??????',
	    evening: '??????.',
	    night: '????????'
	  },
	  wide: {
	    am: '????',
	    pm: '????',
	    midnight: '????????????',
	    noon: '????????????????',
	    morning: '????????????',
	    afternoon: '??????',
	    evening: '????????????',
	    night: '????????'
	  }
	};

	function ordinalNumber$4(dirtyNumber, dirtyOptions) {
	  var options = dirtyOptions || {};
	  var unit = String(options.unit);
	  var number = Number(dirtyNumber);
	  var suffix;
	  /** Though it's an incorrect ordinal form of a date we use it here for consistency with other similar locales (ru, uk)
	   *  For date-month combinations should be used `d` formatter.
	   *  Correct:   `d MMMM` (4 ??????????????)
	   *  Incorrect: `do MMMM` (4-???? ??????????????)
	   *
	   *  But following the consistency leads to mistakes for literal uses of `do` formatter (ordinal day of month).
	   *  So for phrase "5th day of month" (`do ?????????? ????????????`)
	   *  library will produce:            `5-???? ?????????? ????????????`
	   *  but correct spelling should be:  `5-?? ?????????? ????????????`
	   *
	   *  So I guess there should be a stand-alone and a formatting version of "day of month" formatters
	   */

	  if (unit === 'date') {
	    suffix = '-????';
	  } else if (unit === 'hour' || unit === 'minute' || unit === 'second') {
	    suffix = '-??';
	  } else {
	    suffix = (number % 10 === 2 || number % 10 === 3) && number % 100 !== 12 && number % 100 !== 13 ? '-??' : '-??';
	  }

	  return number + suffix;
	}

	var localize$4 = {
	  ordinalNumber: ordinalNumber$4,
	  era: buildLocalizeFn({
	    values: eraValues$4,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$4,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$4,
	    defaultWidth: 'wide',
	    formattingValues: formattingMonthValues,
	    defaultFormattingWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$4,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$4,
	    defaultWidth: 'any',
	    formattingValues: formattingDayPeriodValues$4,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$4 = /^(\d+)(-?(??|??|????|??|??|????|????|????|????|????|????|????|????))?/i;
	var parseOrdinalNumberPattern$4 = /\d+/i;
	var matchEraPatterns$4 = {
	  narrow: /^((???? )???\.?\s???\.?)/i,
	  abbreviated: /^((???? )???\.?\s???\.?)/i,
	  wide: /^(???? ?????????? ??????|?????????? ??????|???????? ??????)/i
	};
	var parseEraPatterns$4 = {
	  any: [/^??/i, /^??/i]
	};
	var matchQuarterPatterns$4 = {
	  narrow: /^[1234]/i,
	  abbreviated: /^[1234](-?[????]?)? ????.?/i,
	  wide: /^[1234](-?[????]?)? ??????????????/i
	};
	var parseQuarterPatterns$4 = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$4 = {
	  narrow: /^[??????????????]/i,
	  abbreviated: /^(??????????|??????|??????|????????|????[????]|????????|??????|????|??????|??????????|????????|????????)\.?/i,
	  wide: /^(??????????????[????]|??????(??|??????)|?????????????????|???????????????????|????[????]|????????????[????]|??????????[????]|??????(????????|??????)|??????????(??????|????)|???????????????????????|???????????????????|????????(??????|????))/i
	};
	var parseMonthPatterns$4 = {
	  narrow: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  any: [/^????/i, /^????/i, /^????/i, /^????/i, /^????/i, /^??/i, /^??????/i, /^??/i, /^??/i, /^????/i, /^??????/i, /^????/i]
	};
	var matchDayPatterns$4 = {
	  narrow: /^[??????????]/i,
	  short: /^(????|????|????|????|????|????|????|????|????|????|????|????|????|????)\.?/i,
	  abbreviated: /^(?????????|??????|??????|??????|??????|??????|??????|??????|??????|??????|??????|??????).?/i,
	  wide: /^(????????????[????]|????????????????(????|????)|??????????(????|????)|??????????[????]|????????(????|????????)|????????????[????]|??????????[????])/i
	};
	var parseDayPatterns$4 = {
	  narrow: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  any: [/^??/i, /^??[????]/i, /^??/i, /^??[????]/i, /^??/i, /^??[????]/i, /^??[????]/i]
	};
	var matchDayPeriodPatterns$4 = {
	  narrow: /^([????]??|????????\.?|????????\.?|??????\.?|??????????|??????|??????\.?|?????????)/i,
	  abbreviated: /^([????]??|????????\.?|????????\.?|??????\.?|??????????|??????|??????\.?|?????????)/i,
	  wide: /^([????]??|????????????|????????????????|??????????[????]|??????????|??????|?????????????|?????????)/i
	};
	var parseDayPeriodPatterns$4 = {
	  any: {
	    am: /^????/i,
	    pm: /^????/i,
	    midnight: /^????????/i,
	    noon: /^????????/i,
	    morning: /^??/i,
	    afternoon: /^??[????]/i,
	    evening: /^??/i,
	    night: /^??/i
	  }
	};
	var match$4 = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$4,
	    parsePattern: parseOrdinalNumberPattern$4,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$4,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$4,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$4,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$4,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$4,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$4,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$4,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$4,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$4,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPeriodPatterns$4,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Belarusian locale.
	 * @language Belarusian
	 * @iso-639-2 bel
	 * @author Kiryl Anokhin [@alyrik]{@link https://github.com/alyrik}
	 * @author Martin Wind [@arvigeus]{@link https://github.com/mawi12345}
	 */

	var locale$4 = {
	  formatDistance: formatDistance$5,
	  formatLong: formatLong$4,
	  formatRelative: formatRelative$5,
	  localize: localize$4,
	  match: match$4,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	var numberValues = {
	  locale: {
	    '1': '???',
	    '2': '???',
	    '3': '???',
	    '4': '???',
	    '5': '???',
	    '6': '???',
	    '7': '???',
	    '8': '???',
	    '9': '???',
	    '0': '???'
	  },
	  number: {
	    '???': '1',
	    '???': '2',
	    '???': '3',
	    '???': '4',
	    '???': '5',
	    '???': '6',
	    '???': '7',
	    '???': '8',
	    '???': '9',
	    '???': '0'
	  }
	};
	var eraValues$5 = {
	  narrow: ['????????????????????????', '???????????????'],
	  abbreviated: ['??????????????????????????????', '???????????????'],
	  wide: ['????????????????????????????????????', '?????????????????????????????????']
	};
	var quarterValues$5 = {
	  narrow: ['???', '???', '???', '???'],
	  abbreviated: ['???????????????', '???????????????', '???????????????', '???????????????'],
	  wide: ['?????? ???????????????????????????', '?????? ???????????????????????????', '?????? ???????????????????????????', '???????????? ???????????????????????????']
	};
	var monthValues$5 = {
	  narrow: ['????????????', '??????????????????', '???????????????', '??????????????????', '??????', '?????????', '???????????????', '???????????????', '???????????????', '???????????????', '?????????', '????????????'],
	  abbreviated: ['????????????', '??????????????????', '???????????????', '??????????????????', '??????', '?????????', '???????????????', '???????????????', '???????????????', '???????????????', '?????????', '????????????'],
	  wide: ['????????????????????????', '??????????????????????????????', '???????????????', '??????????????????', '??????', '?????????', '???????????????', '???????????????', '??????????????????????????????', '?????????????????????', '?????????????????????', '????????????????????????']
	};
	var dayValues$5 = {
	  narrow: ['???', '??????', '???', '??????', '??????', '??????', '???'],
	  short: ['?????????', '?????????', '???????????????', '?????????', '?????????', '???????????????', '?????????'],
	  abbreviated: ['?????????', '?????????', '???????????????', '?????????', '?????????', '???????????????', '?????????'],
	  wide: ['??????????????????', '??????????????????', '????????????????????????', '??????????????????', '????????????????????????????????? ', '????????????????????????', '??????????????????']
	};
	var dayPeriodValues$5 = {
	  narrow: {
	    am: '??????',
	    pm: '??????',
	    midnight: '?????????????????????',
	    noon: '????????????????????????',
	    morning: '????????????',
	    afternoon: '???????????????',
	    evening: '?????????????????????',
	    night: '?????????'
	  },
	  abbreviated: {
	    am: '???????????????????????????',
	    pm: '?????????????????????',
	    midnight: '?????????????????????',
	    noon: '????????????????????????',
	    morning: '????????????',
	    afternoon: '???????????????',
	    evening: '?????????????????????',
	    night: '?????????'
	  },
	  wide: {
	    am: '???????????????????????????',
	    pm: '?????????????????????',
	    midnight: '?????????????????????',
	    noon: '????????????????????????',
	    morning: '????????????',
	    afternoon: '???????????????',
	    evening: '?????????????????????',
	    night: '?????????'
	  }
	};
	var formattingDayPeriodValues$5 = {
	  narrow: {
	    am: '??????',
	    pm: '??????',
	    midnight: '?????????????????????',
	    noon: '????????????????????????',
	    morning: '????????????',
	    afternoon: '???????????????',
	    evening: '?????????????????????',
	    night: '?????????'
	  },
	  abbreviated: {
	    am: '???????????????????????????',
	    pm: '?????????????????????',
	    midnight: '?????????????????????',
	    noon: '????????????????????????',
	    morning: '????????????',
	    afternoon: '???????????????',
	    evening: '?????????????????????',
	    night: '?????????'
	  },
	  wide: {
	    am: '???????????????????????????',
	    pm: '?????????????????????',
	    midnight: '?????????????????????',
	    noon: '????????????????????????',
	    morning: '????????????',
	    afternoon: '???????????????',
	    evening: '?????????????????????',
	    night: '?????????'
	  }
	};

	function dateOrdinalNumber(number, localeNumber) {
	  if (number > 18 && number <= 31) {
	    return localeNumber + '??????';
	  } else {
	    switch (number) {
	      case 1:
	        return localeNumber + '??????';

	      case 2:
	      case 3:
	        return localeNumber + '??????';

	      case 4:
	        return localeNumber + '??????';

	      default:
	        return localeNumber + '???';
	    }
	  }
	}

	function ordinalNumber$5(dirtyNumber, dirtyOptions) {
	  var number = localize$5.localeToNumber(dirtyNumber);
	  var localeNumber = localize$5.numberToLocale(number);
	  var unit = dirtyOptions.unit;

	  if (unit === 'date') {
	    return dateOrdinalNumber(number, localeNumber);
	  }

	  if (number > 10 || number === 0) return localeNumber + '??????';
	  var rem10 = number % 10;

	  switch (rem10) {
	    case 2:
	    case 3:
	      return localeNumber + '???';

	    case 4:
	      return localeNumber + '?????????';

	    case 6:
	      return localeNumber + '?????????';

	    case 1:
	    case 5:
	    case 7:
	    case 8:
	    case 9:
	    case 0:
	      return localeNumber + '???';
	  }
	}

	function localeToNumber(locale) {
	  var number = locale.toString().replace(/[??????????????????????????????]/g, function (match) {
	    return numberValues.number[match];
	  });
	  return Number(number);
	}

	function numberToLocale(number) {
	  return number.toString().replace(/\d/g, function (match) {
	    return numberValues.locale[match];
	  });
	}

	var localize$5 = {
	  localeToNumber: localeToNumber,
	  numberToLocale: numberToLocale,
	  ordinalNumber: ordinalNumber$5,
	  era: buildLocalizeFn({
	    values: eraValues$5,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$5,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$5,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$5,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$5,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$5,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var formatDistanceLocale$5 = {
	  lessThanXSeconds: {
	    one: '??????????????? ??? ?????????????????????',
	    other: '??????????????? {{count}} ?????????????????????'
	  },
	  xSeconds: {
	    one: '??? ?????????????????????',
	    other: '{{count}} ?????????????????????'
	  },
	  halfAMinute: '?????? ???????????????',
	  lessThanXMinutes: {
	    one: '??????????????? ??? ???????????????',
	    other: '??????????????? {{count}} ???????????????'
	  },
	  xMinutes: {
	    one: '??? ???????????????',
	    other: '{{count}} ???????????????'
	  },
	  aboutXHours: {
	    one: '??????????????? ??? ???????????????',
	    other: '??????????????? {{count}} ???????????????'
	  },
	  xHours: {
	    one: '??? ???????????????',
	    other: '{{count}} ???????????????'
	  },
	  xDays: {
	    one: '??? ?????????',
	    other: '{{count}} ?????????'
	  },
	  aboutXMonths: {
	    one: '??????????????? ??? ?????????',
	    other: '??????????????? {{count}} ?????????'
	  },
	  xMonths: {
	    one: '??? ?????????',
	    other: '{{count}} ?????????'
	  },
	  aboutXYears: {
	    one: '??????????????? ??? ?????????',
	    other: '??????????????? {{count}} ?????????'
	  },
	  xYears: {
	    one: '??? ?????????',
	    other: '{{count}} ?????????'
	  },
	  overXYears: {
	    one: '??? ??????????????? ????????????',
	    other: '{{count}} ??????????????? ????????????'
	  },
	  almostXYears: {
	    one: '??????????????? ??? ?????????',
	    other: '??????????????? {{count}} ?????????'
	  }
	};
	function formatDistance$6(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$5[token] === 'string') {
	    result = formatDistanceLocale$5[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$5[token].one;
	  } else {
	    result = formatDistanceLocale$5[token].other.replace('{{count}}', localize$5.numberToLocale(count));
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return result + ' ?????? ???????????????';
	    } else {
	      return result + ' ?????????';
	    }
	  }

	  return result;
	}

	var dateFormats$5 = {
	  full: 'EEEE, MMMM do, y',
	  long: 'MMMM do, y',
	  medium: 'MMM d, y',
	  short: 'MM/dd/yyyy'
	};
	var timeFormats$5 = {
	  full: 'h:mm:ss a zzzz',
	  long: 'h:mm:ss a z',
	  medium: 'h:mm:ss a',
	  short: 'h:mm a'
	};
	var dateTimeFormats$5 = {
	  full: "{{date}} {{time}} '?????????'",
	  long: "{{date}} {{time}} '?????????'",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$5 = {
	  date: buildFormatLongFn({
	    formats: dateFormats$5,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$5,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$5,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$5 = {
	  lastWeek: "'??????' eeee '?????????' p",
	  yesterday: "'???????????????' '?????????' p",
	  today: "'??????' '?????????' p",
	  tomorrow: "'????????????????????????' '?????????' p",
	  nextWeek: "eeee '?????????' p",
	  other: 'P'
	};
	function formatRelative$6(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$5[token];
	}

	var matchOrdinalNumberPattern$5 = /^(\d+)(???|???|?????????|?????????|??????|???|??????)?/i;
	var parseOrdinalNumberPattern$5 = /\d+/i;
	var matchEraPatterns$5 = {
	  narrow: /^(????????????????????????|???????????????)/i,
	  abbreviated: /^(??????????????????????????????|???????????????)/i,
	  wide: /^(????????????????????????????????????|?????????????????????????????????)/i
	};
	var parseEraPatterns$5 = {
	  narrow: [/^????????????????????????/i, /^???????????????/i],
	  abbreviated: [/^??????????????????????????????/i, /^???????????????/i],
	  wide: [/^????????????????????????????????????/i, /^?????????????????????????????????/i]
	};
	var matchQuarterPatterns$5 = {
	  narrow: /^[????????????]/i,
	  abbreviated: /^[????????????]????????????/i,
	  wide: /^[????????????](???|???|?????????)? ???????????????????????????/i
	};
	var parseQuarterPatterns$5 = {
	  any: [/???/i, /???/i, /???/i, /???/i]
	};
	var matchMonthPatterns$5 = {
	  narrow: /^(????????????|??????????????????|???????????????|??????????????????|??????|?????????|???????????????|???????????????|???????????????|???????????????|?????????|????????????)/i,
	  abbreviated: /^(????????????|??????????????????|???????????????|??????????????????|??????|?????????|???????????????|???????????????|???????????????|???????????????|?????????|????????????)/i,
	  wide: /^(????????????????????????|??????????????????????????????|???????????????|??????????????????|??????|?????????|???????????????|???????????????|??????????????????????????????|?????????????????????|?????????????????????|????????????????????????)/i
	};
	var parseMonthPatterns$5 = {
	  any: [/^????????????/i, /^??????????????????/i, /^???????????????/i, /^??????????????????/i, /^??????/i, /^?????????/i, /^???????????????/i, /^???????????????/i, /^???????????????/i, /^???????????????/i, /^?????????/i, /^????????????/i]
	};
	var matchDayPatterns$5 = {
	  narrow: /^(???|??????|???|??????|??????|??????|???)+/i,
	  short: /^(?????????|?????????|???????????????|?????????|?????????|???????????????|?????????)+/i,
	  abbreviated: /^(?????????|?????????|???????????????|?????????|?????????|???????????????|?????????)+/i,
	  wide: /^(??????????????????|??????????????????|????????????????????????|??????????????????|????????????????????????????????? |????????????????????????|??????????????????)+/i
	};
	var parseDayPatterns$5 = {
	  narrow: [/^???/i, /^??????/i, /^???/i, /^??????/i, /^??????/i, /^??????/i, /^???/i],
	  short: [/^?????????/i, /^?????????/i, /^???????????????/i, /^?????????/i, /^?????????/i, /^???????????????/i, /^?????????/i],
	  abbreviated: [/^?????????/i, /^?????????/i, /^???????????????/i, /^?????????/i, /^?????????/i, /^???????????????/i, /^?????????/i],
	  wide: [/^??????????????????/i, /^??????????????????/i, /^????????????????????????/i, /^??????????????????/i, /^????????????????????????????????? /i, /^????????????????????????/i, /^??????????????????/i]
	};
	var matchDayPeriodPatterns$5 = {
	  narrow: /^(??????|??????|?????????????????????|????????????????????????|????????????|???????????????|?????????????????????|?????????)/i,
	  abbreviated: /^(???????????????????????????|?????????????????????|?????????????????????|????????????????????????|????????????|???????????????|?????????????????????|?????????)/i,
	  wide: /^(???????????????????????????|?????????????????????|?????????????????????|????????????????????????|????????????|???????????????|?????????????????????|?????????)/i
	};
	var parseDayPeriodPatterns$5 = {
	  any: {
	    am: /^??????/i,
	    pm: /^??????/i,
	    midnight: /^?????????????????????/i,
	    noon: /^????????????????????????/i,
	    morning: /????????????/i,
	    afternoon: /???????????????/i,
	    evening: /?????????????????????/i,
	    night: /?????????/i
	  }
	};
	var match$5 = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$5,
	    parsePattern: parseOrdinalNumberPattern$5,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$5,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$5,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$5,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$5,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$5,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$5,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$5,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$5,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$5,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$5,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Bengali locale.
	 * @language Bengali
	 * @iso-639-2 ben
	 * @author Touhidur Rahman [@touhidrahman]{@link https://github.com/touhidrahman}
	 * @author Farhad Yasir [@nutboltu]{@link https://github.com/nutboltu}
	 */

	var locale$5 = {
	  formatDistance: formatDistance$6,
	  formatLong: formatLong$5,
	  formatRelative: formatRelative$6,
	  localize: localize$5,
	  match: match$5,
	  options: {
	    weekStartsOn: 0
	    /* Sunday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	var formatDistanceLocale$6 = {
	  lessThanXSeconds: {
	    one: {
	      regular: 'm??n?? ne?? vte??ina',
	      past: 'p??ed m??n?? ne?? vte??inou',
	      future: 'za m??n?? ne?? vte??inu'
	    },
	    few: {
	      regular: 'm??n?? ne?? {{count}} vte??iny',
	      past: 'p??ed m??n?? ne?? {{count}} vte??inami',
	      future: 'za m??n?? ne?? {{count}} vte??iny'
	    },
	    many: {
	      regular: 'm??n?? ne?? {{count}} vte??in',
	      past: 'p??ed m??n?? ne?? {{count}} vte??inami',
	      future: 'za m??n?? ne?? {{count}} vte??in'
	    }
	  },
	  xSeconds: {
	    one: {
	      regular: 'vte??ina',
	      past: 'p??ed vte??inou',
	      future: 'za vte??inu'
	    },
	    few: {
	      regular: '{{count}} vte??iny',
	      past: 'p??ed {{count}} vte??inami',
	      future: 'za {{count}} vte??iny'
	    },
	    many: {
	      regular: '{{count}} vte??in',
	      past: 'p??ed {{count}} vte??inami',
	      future: 'za {{count}} vte??in'
	    }
	  },
	  halfAMinute: {
	    other: {
	      regular: 'p??l minuty',
	      past: 'p??ed p??l minutou',
	      future: 'za p??l minuty'
	    }
	  },
	  lessThanXMinutes: {
	    one: {
	      regular: 'm??n?? ne?? minuta',
	      past: 'p??ed m??n?? ne?? minutou',
	      future: 'za m??n?? ne?? minutu'
	    },
	    few: {
	      regular: 'm??n?? ne?? {{count}} minuty',
	      past: 'p??ed m??n?? ne?? {{count}} minutami',
	      future: 'za m??n?? ne?? {{count}} minuty'
	    },
	    many: {
	      regular: 'm??n?? ne?? {{count}} minut',
	      past: 'p??ed m??n?? ne?? {{count}} minutami',
	      future: 'za m??n?? ne?? {{count}} minut'
	    }
	  },
	  xMinutes: {
	    one: {
	      regular: 'minuta',
	      past: 'p??ed minutou',
	      future: 'za minutu'
	    },
	    few: {
	      regular: '{{count}} minuty',
	      past: 'p??ed {{count}} minutami',
	      future: 'za {{count}} minuty'
	    },
	    many: {
	      regular: '{{count}} minut',
	      past: 'p??ed {{count}} minutami',
	      future: 'za {{count}} minut'
	    }
	  },
	  aboutXHours: {
	    one: {
	      regular: 'p??ibli??n?? hodina',
	      past: 'p??ibli??n?? p??ed hodinou',
	      future: 'p??ibli??n?? za hodinu'
	    },
	    few: {
	      regular: 'p??ibli??n?? {{count}} hodiny',
	      past: 'p??ibli??n?? p??ed {{count}} hodinami',
	      future: 'p??ibli??n?? za {{count}} hodiny'
	    },
	    many: {
	      regular: 'p??ibli??n?? {{count}} hodin',
	      past: 'p??ibli??n?? p??ed {{count}} hodinami',
	      future: 'p??ibli??n?? za {{count}} hodin'
	    }
	  },
	  xHours: {
	    one: {
	      regular: 'hodina',
	      past: 'p??ed hodinou',
	      future: 'za hodinu'
	    },
	    few: {
	      regular: '{{count}} hodiny',
	      past: 'p??ed {{count}} hodinami',
	      future: 'za {{count}} hodiny'
	    },
	    many: {
	      regular: '{{count}} hodin',
	      past: 'p??ed {{count}} hodinami',
	      future: 'za {{count}} hodin'
	    }
	  },
	  xDays: {
	    one: {
	      regular: 'den',
	      past: 'p??ed dnem',
	      future: 'za den'
	    },
	    few: {
	      regular: '{{count}} dni',
	      past: 'p??ed {{count}} dny',
	      future: 'za {{count}} dny'
	    },
	    many: {
	      regular: '{{count}} dn??',
	      past: 'p??ed {{count}} dny',
	      future: 'za {{count}} dn??'
	    }
	  },
	  aboutXMonths: {
	    one: {
	      regular: 'p??ibli??n?? m??s??c',
	      past: 'p??ibli??n?? p??ed m??s??cem',
	      future: 'p??ibli??n?? za m??s??c'
	    },
	    few: {
	      regular: 'p??ibli??n?? {{count}} m??s??ce',
	      past: 'p??ibli??n?? p??ed {{count}} m??s??ci',
	      future: 'p??ibli??n?? za {{count}} m??s??ce'
	    },
	    many: {
	      regular: 'p??ibli??n?? {{count}} m??s??c??',
	      past: 'p??ibli??n?? p??ed {{count}} m??s??ci',
	      future: 'p??ibli??n?? za {{count}} m??s??c??'
	    }
	  },
	  xMonths: {
	    one: {
	      regular: 'm??s??c',
	      past: 'p??ed m??s??cem',
	      future: 'za m??s??c'
	    },
	    few: {
	      regular: '{{count}} m??s??ce',
	      past: 'p??ed {{count}} m??s??ci',
	      future: 'za {{count}} m??s??ce'
	    },
	    many: {
	      regular: '{{count}} m??s??c??',
	      past: 'p??ed {{count}} m??s??ci',
	      future: 'za {{count}} m??s??c??'
	    }
	  },
	  aboutXYears: {
	    one: {
	      regular: 'p??ibli??n?? rok',
	      past: 'p??ibli??n?? p??ed rokem',
	      future: 'p??ibli??n?? za rok'
	    },
	    few: {
	      regular: 'p??ibli??n?? {{count}} roky',
	      past: 'p??ibli??n?? p??ed {{count}} roky',
	      future: 'p??ibli??n?? za {{count}} roky'
	    },
	    many: {
	      regular: 'p??ibli??n?? {{count}} rok??',
	      past: 'p??ibli??n?? p??ed {{count}} roky',
	      future: 'p??ibli??n?? za {{count}} rok??'
	    }
	  },
	  xYears: {
	    one: {
	      regular: 'rok',
	      past: 'p??ed rokem',
	      future: 'za rok'
	    },
	    few: {
	      regular: '{{count}} roky',
	      past: 'p??ed {{count}} roky',
	      future: 'za {{count}} roky'
	    },
	    many: {
	      regular: '{{count}} rok??',
	      past: 'p??ed {{count}} roky',
	      future: 'za {{count}} rok??'
	    }
	  },
	  overXYears: {
	    one: {
	      regular: 'v??ce ne?? rok',
	      past: 'p??ed v??ce ne?? rokem',
	      future: 'za v??ce ne?? rok'
	    },
	    few: {
	      regular: 'v??ce ne?? {{count}} roky',
	      past: 'p??ed v??ce ne?? {{count}} roky',
	      future: 'za v??ce ne?? {{count}} roky'
	    },
	    many: {
	      regular: 'v??ce ne?? {{count}} rok??',
	      past: 'p??ed v??ce ne?? {{count}} roky',
	      future: 'za v??ce ne?? {{count}} rok??'
	    }
	  },
	  almostXYears: {
	    one: {
	      regular: 'skoro rok',
	      past: 'skoro p??ed rokem',
	      future: 'skoro za rok'
	    },
	    few: {
	      regular: 'skoro {{count}} roky',
	      past: 'skoro p??ed {{count}} roky',
	      future: 'skoro za {{count}} roky'
	    },
	    many: {
	      regular: 'skoro {{count}} rok??',
	      past: 'skoro p??ed {{count}} roky',
	      future: 'skoro za {{count}} rok??'
	    }
	  }
	};
	function formatDistance$7(token, count, options) {
	  options = options || {};
	  var scheme = formatDistanceLocale$6[token]; // cs pluralization

	  var pluralToken;

	  if (typeof scheme.other === 'object') {
	    pluralToken = 'other';
	  } else if (count === 1) {
	    pluralToken = 'one';
	  } else if (count > 1 && count < 5 || count === 0) {
	    pluralToken = 'few';
	  } else {
	    pluralToken = 'many';
	  } // times


	  var suffixExist = options.addSuffix === true;
	  var comparison = options.comparison;
	  var timeToken;

	  if (suffixExist && comparison === -1) {
	    timeToken = 'past';
	  } else if (suffixExist && comparison === 1) {
	    timeToken = 'future';
	  } else {
	    timeToken = 'regular';
	  }

	  return scheme[pluralToken][timeToken].replace('{{count}}', count);
	}

	var dateFormats$6 = {
	  full: 'EEEE, d. MMMM yyyy',
	  long: 'd. MMMM yyyy',
	  medium: 'd.M.yyyy',
	  short: 'd.M.yy'
	};
	var timeFormats$6 = {
	  full: 'h:mm:ss a zzzz',
	  long: 'h:mm:ss a z',
	  medium: 'h:mm:ss a',
	  short: 'h:mm a'
	};
	var dateTimeFormats$6 = {
	  full: "{{date}} 'v' {{time}}",
	  long: "{{date}} 'v' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$6 = {
	  date: buildFormatLongFn({
	    formats: dateFormats$6,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$6,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$6,
	    defaultWidth: 'full'
	  })
	};

	var accusativeWeekdays$1 = ['ned??li', 'pond??l??', '??ter??', 'st??edu', '??tvrtek', 'p??tek', 'sobotu'];
	var formatRelativeLocale$6 = {
	  lastWeek: "'posledn??' eeee 've' p",
	  yesterday: "'v??era v' p",
	  today: "'dnes v' p",
	  tomorrow: "'z??tra v' p",
	  nextWeek: function (date, _baseDate, _options) {
	    var day = date.getUTCDay();
	    return "'v " + accusativeWeekdays$1[day] + " o' p";
	  },
	  other: 'P'
	};
	function formatRelative$7(token, date, baseDate, options) {
	  var format = formatRelativeLocale$6[token];

	  if (typeof format === 'function') {
	    return format(date, baseDate, options);
	  }

	  return format;
	}

	var eraValues$6 = {
	  narrow: ['p??. n. l.', 'n. l.'],
	  abbreviated: ['p??. n. l.', 'n. l.'],
	  wide: ['p??ed na????m letopo??tem', 'na??eho letopo??tu']
	};
	var quarterValues$6 = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['1. ??tvrtlet??', '2. ??tvrtlet??', '3. ??tvrtlet??', '4. ??tvrtlet??'],
	  wide: ['1. ??tvrtlet??', '2. ??tvrtlet??', '3. ??tvrtlet??', '4. ??tvrtlet??']
	};
	var monthValues$6 = {
	  narrow: ['L', '??', 'B', 'D', 'K', '??', '??', 'S', 'Z', '??', 'L', 'P'],
	  abbreviated: ['led', '??no', 'b??e', 'dub', 'kv??', '??vn', '??vc', 'srp', 'z????', '????j', 'lis', 'pro'],
	  wide: ['leden', '??nor', 'b??ezen', 'duben', 'kv??ten', '??erven', '??ervenec', 'srpen', 'z??????', '????jen', 'listopad', 'prosinec']
	};
	var formattingMonthValues$1 = {
	  narrow: ['L', '??', 'B', 'D', 'K', '??', '??', 'S', 'Z', '??', 'L', 'P'],
	  abbreviated: ['led', '??no', 'b??e', 'dub', 'kv??', '??vn', '??vc', 'srp', 'z????', '????j', 'lis', 'pro'],
	  wide: ['ledna', '??nora', 'b??ezna', 'dubna', 'kv??tna', '??ervna', '??ervence', 'srpna', 'z??????', '????jna', 'listopadu', 'prosince']
	};
	var dayValues$6 = {
	  narrow: ['ne', 'po', '??t', 'st', '??t', 'p??', 'so'],
	  short: ['ne', 'po', '??t', 'st', '??t', 'p??', 'so'],
	  abbreviated: ['ned', 'pon', '??te', 'st??', '??tv', 'p??t', 'sob'],
	  wide: ['ned??le', 'pond??l??', '??ter??', 'st??eda', '??tvrtek', 'p??tek', 'sobota']
	};
	var dayPeriodValues$6 = {
	  narrow: {
	    am: 'odp.',
	    pm: 'dop.',
	    midnight: 'p??lnoc',
	    noon: 'poledne',
	    morning: 'r??no',
	    afternoon: 'odpoledne',
	    evening: 've??er',
	    night: 'noc'
	  },
	  abbreviated: {
	    am: 'odp.',
	    pm: 'dop.',
	    midnight: 'p??lnoc',
	    noon: 'poledne',
	    morning: 'r??no',
	    afternoon: 'odpoledne',
	    evening: 've??er',
	    night: 'noc'
	  },
	  wide: {
	    am: 'odpoledne',
	    pm: 'dopoledne',
	    midnight: 'p??lnoc',
	    noon: 'poledne',
	    morning: 'r??no',
	    afternoon: 'odpoledne',
	    evening: 've??er',
	    night: 'noc'
	  }
	};
	var formattingDayPeriodValues$6 = {
	  narrow: {
	    am: 'odp.',
	    pm: 'dop.',
	    midnight: 'p??lnoc',
	    noon: 'poledne',
	    morning: 'r??no',
	    afternoon: 'odpoledne',
	    evening: 've??er',
	    night: 'noc'
	  },
	  abbreviated: {
	    am: 'odp.',
	    pm: 'dop.',
	    midnight: 'p??lnoc',
	    noon: 'poledne',
	    morning: 'r??no',
	    afternoon: 'odpoledne',
	    evening: 've??er',
	    night: 'noc'
	  },
	  wide: {
	    am: 'odpoledne',
	    pm: 'dopoledne',
	    midnight: 'p??lnoc',
	    noon: 'poledne',
	    morning: 'r??no',
	    afternoon: 'odpoledne',
	    evening: 've??er',
	    night: 'noc'
	  }
	};

	function ordinalNumber$6(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return number + '.';
	}

	var localize$6 = {
	  ordinalNumber: ordinalNumber$6,
	  era: buildLocalizeFn({
	    values: eraValues$6,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$6,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$6,
	    defaultWidth: 'wide',
	    formattingValues: formattingMonthValues$1,
	    defaultFormattingWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$6,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$6,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$6,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$6 = /^(\d+)\.?/i;
	var parseOrdinalNumberPattern$6 = /\d+/i;
	var matchEraPatterns$6 = {
	  narrow: /^(p[??r]ed Kr\.|pred n\. l\.|po Kr\.|n\. l\.)/i,
	  abbreviated: /^(pe[??r]ed Kr\.|pe[??r]ed n\. l\.|po Kr\.|n\. l\.)/i,
	  wide: /^(p[??r]ed Kristem|pred na[??s][??i]m letopo[??c]tem|po Kristu|na[??s]eho letopo[??c]tu)/i
	};
	var parseEraPatterns$6 = {
	  any: [/^p[??r]/i, /^(po|n)/i]
	};
	var matchQuarterPatterns$6 = {
	  narrow: /^[1234]/i,
	  abbreviated: /^[1234]\. [??c]tvrtlet[??i]/i,
	  wide: /^[1234]\. [??c]tvrtlet[??i]/i
	};
	var parseQuarterPatterns$6 = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$6 = {
	  narrow: /^[l??ubdk??csz??rlp]/i,
	  abbreviated: /^(led|[??u]no|b[??r]e|dub|kv[??e]|[??c]vn|[??c]vc|srp|z[??a][??r]|[??r][??i]j|lis|pro)/i,
	  wide: /^(leden|ledna|[??u]nora?|b[??r]ezen|b[??r]ezna|duben|dubna|kv[??e]ten|kv[??e]tna|[??c]erven|[??c]ervna|[??c]ervenec|[??c]ervence|srpen|srpna|z[??a][??r][??i]|[??r][??i]jen|[??r][??i]jna|listopada?|prosinec|prosince)/i
	};
	var parseMonthPatterns$6 = {
	  narrow: [/^l/i, /^[??u]/i, /^b/i, /^d/i, /^k/i, /^[??c]/i, /^[??c]/i, /^s/i, /^z/i, /^[??r]/i, /^l/i, /^p/i],
	  any: [/^led/i, /^[??u]n/i, /^brez/i, /^dub/i, /^kvet/i, /^[??c]erv/i, /^[??c]erven/i, /^srp/i, /^z[??a]r/i, /^[??r][??i]j/i, /^list/i, /^pros/i]
	};
	var matchDayPatterns$6 = {
	  narrow: /^[npu??s??ps]/i,
	  short: /^(ne|po|[??u]t|st|[??c]t|p[??a]|so)/i,
	  abbreviated: /^(ne|po|[??u]t|st|[??c]t|p[??a]|so)/i,
	  wide: /^(ned[??e]le|pond[??e]l[??i]|[??u]ter[??y]|st[??r]eda|[??c]tvrtek|p[??a]tek|sobota)/i
	};
	var parseDayPatterns$6 = {
	  narrow: [/^n/i, /^p/i, /^[??u]/i, /^s/i, /^[??c]/i, /^p/i, /^s/i],
	  any: [/^ne/i, /^po/i, /^ut/i, /^st/i, /^[??c]t/i, /^p/i, /^so/i]
	};
	var matchDayPeriodPatterns$6 = {
	  narrow: /^((dopoledne|odpoledne)|p??lnoc|poledne|(r[??a]no|odpoledne|ve[??c]er|(v )?noci))/i,
	  any: /^((dopoledne|odpoledne)|p??lnoc|poledne|(r[??a]no|odpoledne|ve[??c]er|(v )?noci))/i
	};
	var parseDayPeriodPatterns$6 = {
	  any: {
	    am: /^dopoledne/i,
	    pm: /^odpoledne/i,
	    midnight: /^p[??u]lnoc/i,
	    noon: /^poledne/i,
	    morning: /r[??a]no/i,
	    afternoon: /odpoledne/i,
	    evening: /ve[??c]er/i,
	    night: /noc/i
	  }
	};
	var match$6 = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$6,
	    parsePattern: parseOrdinalNumberPattern$6,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$6,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$6,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$6,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$6,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$6,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$6,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$6,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$6,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$6,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$6,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Czech locale.
	 * @language Czech
	 * @iso-639-2 ces
	 * @author David Rus [@davidrus]{@link https://github.com/davidrus}
	 * @author Pavel Hr??ch [@SilenY]{@link https://github.com/SilenY}
	 * @author Jozef B??ro?? [@JozefBiros]{@link https://github.com/JozefBiros}
	 */

	var locale$6 = {
	  formatDistance: formatDistance$7,
	  formatLong: formatLong$6,
	  formatRelative: formatRelative$7,
	  localize: localize$6,
	  match: match$6,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$7 = {
	  lessThanXSeconds: {
	    one: 'mindre end ??t sekund',
	    other: 'mindre end {{count}} sekunder'
	  },
	  xSeconds: {
	    one: '1 sekund',
	    other: '{{count}} sekunder'
	  },
	  halfAMinute: '??t halvt minut',
	  lessThanXMinutes: {
	    one: 'mindre end ??t minut',
	    other: 'mindre end {{count}} minutter'
	  },
	  xMinutes: {
	    one: '1 minut',
	    other: '{{count}} minutter'
	  },
	  aboutXHours: {
	    one: 'cirka 1 time',
	    other: 'cirka {{count}} timer'
	  },
	  xHours: {
	    one: '1 time',
	    other: '{{count}} timer'
	  },
	  xDays: {
	    one: '1 dag',
	    other: '{{count}} dage'
	  },
	  aboutXMonths: {
	    one: 'cirka 1 m??ned',
	    other: 'cirka {{count}} m??neder'
	  },
	  xMonths: {
	    one: '1 m??ned',
	    other: '{{count}} m??neder'
	  },
	  aboutXYears: {
	    one: 'cirka 1 ??r',
	    other: 'cirka {{count}} ??r'
	  },
	  xYears: {
	    one: '1 ??r',
	    other: '{{count}} ??r'
	  },
	  overXYears: {
	    one: 'over 1 ??r',
	    other: 'over {{count}} ??r'
	  },
	  almostXYears: {
	    one: 'n??sten 1 ??r',
	    other: 'n??sten {{count}} ??r'
	  }
	};
	function formatDistance$8(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$7[token] === 'string') {
	    result = formatDistanceLocale$7[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$7[token].one;
	  } else {
	    result = formatDistanceLocale$7[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'om ' + result;
	    } else {
	      return result + ' siden';
	    }
	  }

	  return result;
	}

	var dateFormats$7 = {
	  full: "EEEE 'den' d. MMMM y",
	  long: 'd. MMMM y',
	  medium: 'd. MMM y',
	  short: 'dd/MM/y'
	};
	var timeFormats$7 = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$7 = {
	  full: "{{date}} 'kl'. {{time}}",
	  long: "{{date}} 'kl'. {{time}}",
	  medium: '{{date}} {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$7 = {
	  date: buildFormatLongFn({
	    formats: dateFormats$7,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$7,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$7,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$7 = {
	  lastWeek: "'sidste' eeee 'kl.' p",
	  yesterday: "'i g??r kl.' p",
	  today: "'i dag kl.' p",
	  tomorrow: "'i morgen kl.' p",
	  nextWeek: "'p??' eeee 'kl.' p",
	  other: 'P'
	};
	function formatRelative$8(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$7[token];
	}

	var eraValues$7 = {
	  narrow: ['fvt', 'vt'],
	  abbreviated: ['f.v.t.', 'v.t.'],
	  wide: ['f??r vesterlandsk tidsregning', 'vesterlandsk tidsregning']
	};
	var quarterValues$7 = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['1. kvt.', '2. kvt.', '3. kvt.', '4. kvt.'],
	  wide: ['1. kvartal', '2. kvartal', '3. kvartal', '4. kvartal']
	};
	var monthValues$7 = {
	  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
	  wide: ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'] // Note that 'Days - abbreviated - Formatting' has periods at the end.
	  // https://www.unicode.org/cldr/charts/32/summary/da.html#1760
	  // This makes grammatical sense in danish, as most abbreviations have periods.

	};
	var dayValues$7 = {
	  narrow: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
	  short: ['s??', 'ma', 'ti', 'on', 'to', 'fr', 'l??'],
	  abbreviated: ['s??n.', 'man.', 'tir.', 'ons.', 'tor.', 'fre.', 'l??r.'],
	  wide: ['s??ndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'l??rdag']
	};
	var dayPeriodValues$7 = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'midnat',
	    noon: 'middag',
	    morning: 'morgen',
	    afternoon: 'eftermiddag',
	    evening: 'aften',
	    night: 'nat'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'midnat',
	    noon: 'middag',
	    morning: 'morgen',
	    afternoon: 'eftermiddag',
	    evening: 'aften',
	    night: 'nat'
	  },
	  wide: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'midnat',
	    noon: 'middag',
	    morning: 'morgen',
	    afternoon: 'eftermiddag',
	    evening: 'aften',
	    night: 'nat'
	  }
	};
	var formattingDayPeriodValues$7 = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'midnat',
	    noon: 'middag',
	    morning: 'om morgenen',
	    afternoon: 'om eftermiddagen',
	    evening: 'om aftenen',
	    night: 'om natten'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'midnat',
	    noon: 'middag',
	    morning: 'om morgenen',
	    afternoon: 'om eftermiddagen',
	    evening: 'om aftenen',
	    night: 'om natten'
	  },
	  wide: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'midnat',
	    noon: 'middag',
	    morning: 'om morgenen',
	    afternoon: 'om eftermiddagen',
	    evening: 'om aftenen',
	    night: 'om natten'
	  }
	};

	function ordinalNumber$7(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return number + '.';
	}

	var localize$7 = {
	  ordinalNumber: ordinalNumber$7,
	  era: buildLocalizeFn({
	    values: eraValues$7,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$7,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$7,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$7,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$7,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$7,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$7 = /^(\d+)(\.)?/i;
	var parseOrdinalNumberPattern$7 = /\d+/i;
	var matchEraPatterns$7 = {
	  narrow: /^(fKr|fvt|eKr|vt)/i,
	  abbreviated: /^(f\.Kr\.?|f\.v\.t\.?|e\.Kr\.?|v\.t\.)/i,
	  wide: /^(f.Kr.|f??r vesterlandsk tidsregning|e.Kr.|vesterlandsk tidsregning)/i
	};
	var parseEraPatterns$7 = {
	  any: [/^f/i, /^(v|e)/i]
	};
	var matchQuarterPatterns$7 = {
	  narrow: /^[1234]/i,
	  abbreviated: /^[1234]. kvt\./i,
	  wide: /^[1234]\.? kvartal/i
	};
	var parseQuarterPatterns$7 = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$7 = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)/i,
	  wide: /^(januar|februar|marts|april|maj|juni|juli|august|september|oktober|november|december)/i
	};
	var parseMonthPatterns$7 = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^maj/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$7 = {
	  narrow: /^[smtofl]/i,
	  short: /^(s??n.|man.|tir.|ons.|tor.|fre.|l??r.)/i,
	  abbreviated: /^(s??n|man|tir|ons|tor|fre|l??r)/i,
	  wide: /^(s??ndag|mandag|tirsdag|onsdag|torsdag|fredag|l??rdag)/i
	};
	var parseDayPatterns$7 = {
	  narrow: [/^s/i, /^m/i, /^t/i, /^o/i, /^t/i, /^f/i, /^l/i],
	  any: [/^s/i, /^m/i, /^ti/i, /^o/i, /^to/i, /^f/i, /^l/i]
	};
	var matchDayPeriodPatterns$7 = {
	  narrow: /^(a|p|midnat|middag|(om) (morgenen|eftermiddagen|aftenen|natten))/i,
	  any: /^([ap]\.?\s?m\.?|midnat|middag|(om) (morgenen|eftermiddagen|aftenen|natten))/i
	};
	var parseDayPeriodPatterns$7 = {
	  any: {
	    am: /^a/i,
	    pm: /^p/i,
	    midnight: /midnat/i,
	    noon: /middag/i,
	    morning: /morgen/i,
	    afternoon: /eftermiddag/i,
	    evening: /aften/i,
	    night: /nat/i
	  }
	};
	var match$7 = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$7,
	    parsePattern: parseOrdinalNumberPattern$7,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$7,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$7,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$7,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$7,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$7,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$7,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$7,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$7,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$7,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$7,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Danish locale.
	 * @language Danish
	 * @iso-639-2 dan
	 * @author Mathias W??bbe [@MathiasKandelborg]{@link https://github.com/MathiasKandelborg}
	 * @author Anders B. Hansen [@Andersbiha]{@link https://github.com/Andersbiha}
	 * @author [@kgram]{@link https://github.com/kgram}
	 * @author [@stefanbugge]{@link https://github.com/stefanbugge}
	 */

	var locale$7 = {
	  formatDistance: formatDistance$8,
	  formatLong: formatLong$7,
	  formatRelative: formatRelative$8,
	  localize: localize$7,
	  match: match$7,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$8 = {
	  lessThanXSeconds: {
	    standalone: {
	      one: 'weniger als eine Sekunde',
	      other: 'weniger als {{count}} Sekunden'
	    },
	    withPreposition: {
	      one: 'weniger als einer Sekunde',
	      other: 'weniger als {{count}} Sekunden'
	    }
	  },
	  xSeconds: {
	    standalone: {
	      one: 'eine Sekunde',
	      other: '{{count}} Sekunden'
	    },
	    withPreposition: {
	      one: 'einer Sekunde',
	      other: '{{count}} Sekunden'
	    }
	  },
	  halfAMinute: {
	    standalone: 'eine halbe Minute',
	    withPreposition: 'einer halben Minute'
	  },
	  lessThanXMinutes: {
	    standalone: {
	      one: 'weniger als eine Minute',
	      other: 'weniger als {{count}} Minuten'
	    },
	    withPreposition: {
	      one: 'weniger als einer Minute',
	      other: 'weniger als {{count}} Minuten'
	    }
	  },
	  xMinutes: {
	    standalone: {
	      one: 'eine Minute',
	      other: '{{count}} Minuten'
	    },
	    withPreposition: {
	      one: 'einer Minute',
	      other: '{{count}} Minuten'
	    }
	  },
	  aboutXHours: {
	    standalone: {
	      one: 'etwa eine Stunde',
	      other: 'etwa {{count}} Stunden'
	    },
	    withPreposition: {
	      one: 'etwa einer Stunde',
	      other: 'etwa {{count}} Stunden'
	    }
	  },
	  xHours: {
	    standalone: {
	      one: 'eine Stunde',
	      other: '{{count}} Stunden'
	    },
	    withPreposition: {
	      one: 'einer Stunde',
	      other: '{{count}} Stunden'
	    }
	  },
	  xDays: {
	    standalone: {
	      one: 'ein Tag',
	      other: '{{count}} Tage'
	    },
	    withPreposition: {
	      one: 'einem Tag',
	      other: '{{count}} Tagen'
	    }
	  },
	  aboutXMonths: {
	    standalone: {
	      one: 'etwa ein Monat',
	      other: 'etwa {{count}} Monate'
	    },
	    withPreposition: {
	      one: 'etwa einem Monat',
	      other: 'etwa {{count}} Monaten'
	    }
	  },
	  xMonths: {
	    standalone: {
	      one: 'ein Monat',
	      other: '{{count}} Monate'
	    },
	    withPreposition: {
	      one: 'einem Monat',
	      other: '{{count}} Monaten'
	    }
	  },
	  aboutXYears: {
	    standalone: {
	      one: 'etwa ein Jahr',
	      other: 'etwa {{count}} Jahre'
	    },
	    withPreposition: {
	      one: 'etwa einem Jahr',
	      other: 'etwa {{count}} Jahren'
	    }
	  },
	  xYears: {
	    standalone: {
	      one: 'ein Jahr',
	      other: '{{count}} Jahre'
	    },
	    withPreposition: {
	      one: 'einem Jahr',
	      other: '{{count}} Jahren'
	    }
	  },
	  overXYears: {
	    standalone: {
	      one: 'mehr als ein Jahr',
	      other: 'mehr als {{count}} Jahre'
	    },
	    withPreposition: {
	      one: 'mehr als einem Jahr',
	      other: 'mehr als {{count}} Jahren'
	    }
	  },
	  almostXYears: {
	    standalone: {
	      one: 'fast ein Jahr',
	      other: 'fast {{count}} Jahre'
	    },
	    withPreposition: {
	      one: 'fast einem Jahr',
	      other: 'fast {{count}} Jahren'
	    }
	  }
	};
	function formatDistance$9(token, count, options) {
	  options = options || {};
	  var usageGroup = options.addSuffix ? formatDistanceLocale$8[token].withPreposition : formatDistanceLocale$8[token].standalone;
	  var result;

	  if (typeof usageGroup === 'string') {
	    result = usageGroup;
	  } else if (count === 1) {
	    result = usageGroup.one;
	  } else {
	    result = usageGroup.other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'in ' + result;
	    } else {
	      return 'vor ' + result;
	    }
	  }

	  return result;
	}

	var dateFormats$8 = {
	  full: 'EEEE, do MMMM y',
	  // Montag, 7. Januar 2018
	  long: 'do MMMM y',
	  // 7. Januar 2018
	  medium: 'do MMM. y',
	  // 7. Jan. 2018
	  short: 'dd.MM.y' // 07.01.2018

	};
	var timeFormats$8 = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$8 = {
	  full: "{{date}} 'um' {{time}}",
	  long: "{{date}} 'um' {{time}}",
	  medium: '{{date}} {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$8 = {
	  date: buildFormatLongFn({
	    formats: dateFormats$8,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$8,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$8,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$8 = {
	  lastWeek: "'letzten' eeee 'um' p",
	  yesterday: "'gestern um' p",
	  today: "'heute um' p",
	  tomorrow: "'morgen um' p",
	  nextWeek: "eeee 'um' p",
	  other: 'P'
	};
	function formatRelative$9(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$8[token];
	}

	var eraValues$8 = {
	  narrow: ['v.Chr.', 'n.Chr.'],
	  abbreviated: ['v.Chr.', 'n.Chr.'],
	  wide: ['vor Christus', 'nach Christus']
	};
	var quarterValues$8 = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
	  wide: ['1. Quartal', '2. Quartal', '3. Quartal', '4. Quartal'] // Note: in German, the names of days of the week and months are capitalized.
	  // If you are making a new locale based on this one, check if the same is true for the language you're working on.
	  // Generally, formatted dates should look like they are in the middle of a sentence,
	  // e.g. in Spanish language the weekdays and months should be in the lowercase.

	};
	var monthValues$8 = {
	  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['Jan', 'Feb', 'M??r', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
	  wide: ['Januar', 'Februar', 'M??rz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
	};
	var dayValues$8 = {
	  narrow: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
	  short: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
	  abbreviated: ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'],
	  wide: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'] // https://www.unicode.org/cldr/charts/32/summary/de.html#1881

	};
	var dayPeriodValues$8 = {
	  narrow: {
	    am: 'vm.',
	    pm: 'nm.',
	    midnight: 'Mitternacht',
	    noon: 'Mittag',
	    morning: 'Morgen',
	    afternoon: 'Nachm.',
	    evening: 'Abend',
	    night: 'Nacht'
	  },
	  abbreviated: {
	    am: 'vorm.',
	    pm: 'nachm.',
	    midnight: 'Mitternacht',
	    noon: 'Mittag',
	    morning: 'Morgen',
	    afternoon: 'Nachmittag',
	    evening: 'Abend',
	    night: 'Nacht'
	  },
	  wide: {
	    am: 'vormittags',
	    pm: 'nachmittags',
	    midnight: 'Mitternacht',
	    noon: 'Mittag',
	    morning: 'Morgen',
	    afternoon: 'Nachmittag',
	    evening: 'Abend',
	    night: 'Nacht'
	  }
	};
	var formattingDayPeriodValues$8 = {
	  narrow: {
	    am: 'vm.',
	    pm: 'nm.',
	    midnight: 'Mitternacht',
	    noon: 'Mittag',
	    morning: 'morgens',
	    afternoon: 'nachm.',
	    evening: 'abends',
	    night: 'nachts'
	  },
	  abbreviated: {
	    am: 'vorm.',
	    pm: 'nachm.',
	    midnight: 'Mitternacht',
	    noon: 'Mittag',
	    morning: 'morgens',
	    afternoon: 'nachmittags',
	    evening: 'abends',
	    night: 'nachts'
	  },
	  wide: {
	    am: 'vormittags',
	    pm: 'nachmittags',
	    midnight: 'Mitternacht',
	    noon: 'Mittag',
	    morning: 'morgens',
	    afternoon: 'nachmittags',
	    evening: 'abends',
	    night: 'nachts'
	  }
	};

	function ordinalNumber$8(dirtyNumber, _dirtyOptions) {
	  var number = Number(dirtyNumber);
	  return number + '.';
	}

	var localize$8 = {
	  ordinalNumber: ordinalNumber$8,
	  era: buildLocalizeFn({
	    values: eraValues$8,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$8,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$8,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$8,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$8,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$8,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$8 = /^(\d+)(\.)?/i;
	var parseOrdinalNumberPattern$8 = /\d+/i;
	var matchEraPatterns$8 = {
	  narrow: /^(v\.? ?Chr\.?|n\.? ?Chr\.?)/i,
	  abbreviated: /^(v\.? ?Chr\.?|n\.? ?Chr\.?)/i,
	  wide: /^(vor Christus|vor unserer Zeitrechnung|nach Christus|unserer Zeitrechnung)/i
	};
	var parseEraPatterns$8 = {
	  any: [/^v/i, /^n/i]
	};
	var matchQuarterPatterns$8 = {
	  narrow: /^[1234]/i,
	  abbreviated: /^q[1234]/i,
	  wide: /^[1234](\.)? Quartal/i
	};
	var parseQuarterPatterns$8 = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$8 = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(jan|feb|m??r|apr|mai|jun|jul|aug|sep|okt|nov|dez)/i,
	  wide: /^(januar|februar|m??rz|april|mai|juni|juli|august|september|oktober|november|dezember)/i
	};
	var parseMonthPatterns$8 = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^f/i, /^m??r/i, /^ap/i, /^mai/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$8 = {
	  narrow: /^[smdmf]/i,
	  short: /^(so|mo|di|mi|do|fr|sa)/i,
	  abbreviated: /^(son?|mon?|die?|mit?|don?|fre?|sam?)\.?/i,
	  wide: /^(sonntag|montag|dienstag|mittwoch|donnerstag|freitag|samstag)/i
	};
	var parseDayPatterns$8 = {
	  any: [/^so/i, /^mo/i, /^di/i, /^mi/i, /^do/i, /^f/i, /^sa/i]
	};
	var matchDayPeriodPatterns$8 = {
	  narrow: /^(vm\.?|nm\.?|Mitternacht|Mittag|morgens|nachm\.?|abends|nachts)/i,
	  abbreviated: /^(vorm\.?|nachm\.?|Mitternacht|Mittag|morgens|nachm\.?|abends|nachts)/i,
	  wide: /^(vormittags|nachmittags|Mitternacht|Mittag|morgens|nachmittags|abends|nachts)/i
	};
	var parseDayPeriodPatterns$8 = {
	  any: {
	    am: /^v/i,
	    pm: /^n/i,
	    midnight: /^Mitte/i,
	    noon: /^Mitta/i,
	    morning: /morgens/i,
	    afternoon: /nachmittags/i,
	    // will never be matched. Afternoon is matched by `pm`
	    evening: /abends/i,
	    night: /nachts/i // will never be matched. Night is matched by `pm`

	  }
	};
	var match$8 = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$8,
	    parsePattern: parseOrdinalNumberPattern$8,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$8,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$8,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$8,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$8,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$8,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$8,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$8,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$8,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$8,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPeriodPatterns$8,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary German locale.
	 * @language German
	 * @iso-639-2 deu
	 * @author Thomas Eilmsteiner [@DeMuu]{@link https://github.com/DeMuu}
	 * @author Asia [@asia-t]{@link https://github.com/asia-t}
	 * @author Van Vuong Ngo [@vanvuongngo]{@link https://github.com/vanvuongngo}
	 * @author RomanErnst [@pex]{@link https://github.com/pex}
	 * @author Philipp Keck [@Philipp91]{@link https://github.com/Philipp91}
	 */

	var locale$8 = {
	  formatDistance: formatDistance$9,
	  formatLong: formatLong$8,
	  formatRelative: formatRelative$9,
	  localize: localize$8,
	  match: match$8,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$9 = {
	  lessThanXSeconds: {
	    one: '???????????????? ?????? ?????? ????????????????????????',
	    other: '???????????????? ?????? {{count}} ????????????????????????'
	  },
	  xSeconds: {
	    one: '1 ????????????????????????',
	    other: '{{count}} ????????????????????????'
	  },
	  halfAMinute: '???????? ??????????',
	  lessThanXMinutes: {
	    one: '???????????????? ?????? ?????? ??????????',
	    other: '???????????????? ?????? {{count}} ??????????'
	  },
	  xMinutes: {
	    one: '1 ??????????',
	    other: '{{count}} ??????????'
	  },
	  aboutXHours: {
	    one: '?????????????? 1 ??????',
	    other: '?????????????? {{count}} ????????'
	  },
	  xHours: {
	    one: '1 ??????',
	    other: '{{count}} ????????'
	  },
	  xDays: {
	    one: '1 ??????????',
	    other: '{{count}} ????????????'
	  },
	  aboutXMonths: {
	    one: '?????????????? 1 ??????????',
	    other: '?????????????? {{count}} ??????????'
	  },
	  xMonths: {
	    one: '1 ??????????',
	    other: '{{count}} ??????????'
	  },
	  aboutXYears: {
	    one: '?????????????? 1 ??????????',
	    other: '?????????????? {{count}} ????????????'
	  },
	  xYears: {
	    one: '1 ??????????',
	    other: '{{count}} ????????????'
	  },
	  overXYears: {
	    one: '???????? ?????? 1 ??????????',
	    other: '???????? ?????? {{count}} ????????????'
	  },
	  almostXYears: {
	    one: '?????????????? 1 ??????????',
	    other: '?????????????? {{count}} ????????????'
	  }
	};
	function formatDistance$a(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$9[token] === 'string') {
	    result = formatDistanceLocale$9[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$9[token].one;
	  } else {
	    result = formatDistanceLocale$9[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return '???? ' + result;
	    } else {
	      return result + ' ????????';
	    }
	  }

	  return result;
	}

	var dateFormats$9 = {
	  full: 'EEEE, d MMMM y',
	  long: 'd MMMM y',
	  medium: 'd MMM y',
	  short: 'd/M/yy'
	};
	var timeFormats$9 = {
	  full: 'h:mm:ss a zzzz',
	  long: 'h:mm:ss a z',
	  medium: 'h:mm:ss a',
	  short: 'h:mm a'
	};
	var dateTimeFormats$9 = {
	  full: '{{date}} - {{time}}',
	  long: '{{date}} - {{time}}',
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$9 = {
	  date: buildFormatLongFn({
	    formats: dateFormats$9,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$9,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$9,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$9 = {
	  lastWeek: "'?????? ??????????????????????' eeee '????????' p",
	  yesterday: "'???????? ????????' p",
	  today: "'???????????? ????????' p",
	  tomorrow: "'?????????? ????????' p",
	  nextWeek: "eeee '????????' p",
	  other: 'P'
	};
	function formatRelative$a(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$9[token];
	}

	var eraValues$9 = {
	  narrow: ['????', '????'],
	  abbreviated: ['??.??.', '??.??.'],
	  wide: ['?????? ??????????????', '???????? ??????????????']
	};
	var quarterValues$9 = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['??1', '??2', '??3', '??4'],
	  wide: ['1?? ??????????????', '2?? ??????????????', '3?? ??????????????', '4?? ??????????????']
	};
	var monthValues$9 = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'],
	  abbreviated: ['??????', '??????', '??????', '??????', '??????', '????????', '????????', '??????', '??????', '??????', '??????', '??????'],
	  wide: ['????????????????????', '??????????????????????', '??????????????', '????????????????', '??????????', '??????????????', '??????????????', '??????????????????', '??????????????????????', '??????????????????', '??????????????????', '????????????????????']
	};
	var formattingMonthValues$2 = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'],
	  abbreviated: ['??????', '??????', '??????', '??????', '??????', '????????', '????????', '??????', '??????', '??????', '??????', '??????'],
	  wide: ['????????????????????', '??????????????????????', '??????????????', '????????????????', '??????????', '??????????????', '??????????????', '??????????????????', '??????????????????????', '??????????????????', '??????????????????', '????????????????????']
	};
	var dayValues$9 = {
	  narrow: ['??', '??', 'T', '??', '??', '??', '??'],
	  short: ['????', '????', '????', '????', '????', '????', '????'],
	  abbreviated: ['??????', '??????', '??????', '??????', '??????', '??????', '??????'],
	  wide: ['??????????????', '??????????????', '??????????', '??????????????', '????????????', '??????????????????', '??????????????']
	};
	var dayPeriodValues$9 = {
	  narrow: {
	    am: '????',
	    pm: '????',
	    midnight: '??????????????????',
	    noon: '????????????????',
	    morning: '????????',
	    afternoon: '????????????????',
	    evening: '??????????',
	    night: '??????????'
	  },
	  abbreviated: {
	    am: '??.??.',
	    pm: '??.??.',
	    midnight: '??????????????????',
	    noon: '????????????????',
	    morning: '????????',
	    afternoon: '????????????????',
	    evening: '??????????',
	    night: '??????????'
	  },
	  wide: {
	    am: '??.??.',
	    pm: '??.??.',
	    midnight: '??????????????????',
	    noon: '????????????????',
	    morning: '????????',
	    afternoon: '????????????????',
	    evening: '??????????',
	    night: '??????????'
	  }
	};

	function ordinalNumber$9(dirtyNumber, dirtyOptions) {
	  var options = dirtyOptions || {};
	  var unit = String(options.unit);
	  var suffix;

	  if (unit === 'year' || unit === 'month') {
	    suffix = '????';
	  } else if (unit === 'week' || unit === 'dayOfYear' || unit === 'day' || unit === 'hour' || unit === 'date') {
	    suffix = '??';
	  } else {
	    suffix = '??';
	  }

	  return dirtyNumber + suffix;
	}

	var localize$9 = {
	  ordinalNumber: ordinalNumber$9,
	  era: buildLocalizeFn({
	    values: eraValues$9,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$9,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$9,
	    defaultWidth: 'wide',
	    formattingValues: formattingMonthValues$2,
	    defaultFormattingWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$9,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$9,
	    defaultWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$9 = /^(\d+)(????|??|??)?/i;
	var parseOrdinalNumberPattern$9 = /\d+/i;
	var matchEraPatterns$9 = {
	  narrow: /^(????|????)/i,
	  abbreviated: /^(??\.?\s???\.?|??\.?\s???\.?\s???\.?|??\.?\s???\.?|??\.?\s???\.?)/i,
	  wide: /^(?????? ????????????(??|??)|???????? ????(??|??) ?????? ????????(??|??) ????????????????(??|??)??|??????(??|??) ??????????(??|??)??|????????(??|??) ????????????????(??|??)??)/i
	};
	var parseEraPatterns$9 = {
	  any: [/^??/i, /^(??|??)/i]
	};
	var matchQuarterPatterns$9 = {
	  narrow: /^[1234]/i,
	  abbreviated: /^??[1234]/i,
	  wide: /^[1234]??? ????(??|??)????????/i
	};
	var parseQuarterPatterns$9 = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$9 = {
	  narrow: /^[????????????????????????]/i,
	  abbreviated: /^(??????|??????|??????|??????|??????|????????|????????|??????|??????|??????|??????|??????)/i,
	  wide: /^(??????????(??|??)????????|????????????(??|??)????????|??(??|??)??????????|??????(??|??)????????|??(??|??)??????|????(??|??)????????|????(??|??)????????|??(??|??)??????????????|????????(??|??)????????????|??????(??|??)??????????|????(??|??)????????????|??????(??|??)????????????)/i
	};
	var parseMonthPatterns$9 = {
	  narrow: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  any: [/^????/i, /^??/i, /^??????/i, /^????/i, /^??????/i, /^????????/i, /^????????/i, /^????/i, /^??/i, /^??/i, /^??/i, /^??/i]
	};
	var matchDayPatterns$9 = {
	  narrow: /^[????????]/i,
	  short: /^(????|????|????|????|????|????|????)/i,
	  abbreviated: /^(??????|??????|??????|??????|??????|??????|??????)/i,
	  wide: /^(????????????(??|??)|????????(??|??)????|????(??|??)????|??????(??|??)??????|??(??|??)????????|????????????????(??|??)|??(??|??)??????????)/i
	};
	var parseDayPatterns$9 = {
	  narrow: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  any: [/^??/i, /^??/i, /^????/i, /^????/i, /^????/i, /^????/i, /^??/i]
	};
	var matchDayPeriodPatterns$9 = {
	  narrow: /^(????|????|??????(??|??)??????????|??????????(??|??)????|(????|????) (??????(??|??)|????(??|??)??????????|????(??|??)????|??(??|??)??????))/i,
	  any: /^([????]\.?\s???\.?|??????(??|??)??????????|??????????(??|??)????|(????|????) (??????(??|??)|????(??|??)??????????|????(??|??)????|??(??|??)??????))/i
	};
	var parseDayPeriodPatterns$9 = {
	  any: {
	    am: /^????/i,
	    pm: /^????/i,
	    midnight: /^??????????/i,
	    noon: /^??????????(??|??)/i,
	    morning: /??????(??|??)/i,
	    afternoon: /????(??|??)??????????/i,
	    evening: /????(??|??)????/i,
	    night: /??(??|??)??????/i
	  }
	};
	var match$9 = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$9,
	    parsePattern: parseOrdinalNumberPattern$9,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$9,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$9,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$9,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$9,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$9,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$9,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$9,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$9,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$9,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$9,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Greek locale.
	 * @language Greek
	 * @iso-639-2 ell
	 * @author Fanis Katsimpas [@fanixk]{@link https://github.com/fanixk}
	 * @author Theodoros Orfanidis [@teoulas]{@link https://github.com/teoulas}
	 */

	var locale$9 = {
	  formatDistance: formatDistance$a,
	  formatLong: formatLong$9,
	  formatRelative: formatRelative$a,
	  localize: localize$9,
	  match: match$9,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$a = {
	  lessThanXSeconds: {
	    one: 'less than a second',
	    other: 'less than {{count}} seconds'
	  },
	  xSeconds: {
	    one: 'a second',
	    other: '{{count}} seconds'
	  },
	  halfAMinute: 'half a minute',
	  lessThanXMinutes: {
	    one: 'less than a minute',
	    other: 'less than {{count}} minutes'
	  },
	  xMinutes: {
	    one: 'a minute',
	    other: '{{count}} minutes'
	  },
	  aboutXHours: {
	    one: 'about an hour',
	    other: 'about {{count}} hours'
	  },
	  xHours: {
	    one: 'an hour',
	    other: '{{count}} hours'
	  },
	  xDays: {
	    one: 'a day',
	    other: '{{count}} days'
	  },
	  aboutXMonths: {
	    one: 'about a month',
	    other: 'about {{count}} months'
	  },
	  xMonths: {
	    one: 'a month',
	    other: '{{count}} months'
	  },
	  aboutXYears: {
	    one: 'about a year',
	    other: 'about {{count}} years'
	  },
	  xYears: {
	    one: 'a year',
	    other: '{{count}} years'
	  },
	  overXYears: {
	    one: 'over a year',
	    other: 'over {{count}} years'
	  },
	  almostXYears: {
	    one: 'almost a year',
	    other: 'almost {{count}} years'
	  }
	};
	function formatDistance$b(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$a[token] === 'string') {
	    result = formatDistanceLocale$a[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$a[token].one;
	  } else {
	    result = formatDistanceLocale$a[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'in ' + result;
	    } else {
	      return result + ' ago';
	    }
	  }

	  return result;
	}

	var dateFormats$a = {
	  full: 'EEEE, MMMM do, yyyy',
	  long: 'MMMM do, yyyy',
	  medium: 'MMM d, yyyy',
	  short: 'yyyy-MM-dd'
	};
	var timeFormats$a = {
	  full: 'h:mm:ss a zzzz',
	  long: 'h:mm:ss a z',
	  medium: 'h:mm:ss a',
	  short: 'h:mm a'
	};
	var dateTimeFormats$a = {
	  full: "{{date}} 'at' {{time}}",
	  long: "{{date}} 'at' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$a = {
	  date: buildFormatLongFn({
	    formats: dateFormats$a,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$a,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$a,
	    defaultWidth: 'full'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary English locale (Canada).
	 * @language English
	 * @iso-639-2 eng
	 * @author Mark Owsiak [@markowsiak]{@link https://github.com/markowsiak}
	 * @author Marco Imperatore [@mimperatore]{@link https://github.com/mimperatore}
	 */

	var locale$a = {
	  formatDistance: formatDistance$b,
	  formatLong: formatLong$a,
	  formatRelative: formatRelative,
	  localize: localize,
	  match: match,
	  options: {
	    weekStartsOn: 0
	    /* Sunday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	var dateFormats$b = {
	  full: 'EEEE, d MMMM yyyy',
	  long: 'd MMMM yyyy',
	  medium: 'd MMM yyyy',
	  short: 'dd/MM/yyyy'
	};
	var timeFormats$b = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$b = {
	  full: "{{date}} 'at' {{time}}",
	  long: "{{date}} 'at' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$b = {
	  date: buildFormatLongFn({
	    formats: dateFormats$b,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$b,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$b,
	    defaultWidth: 'full'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary English locale (United Kingdom).
	 * @language English
	 * @iso-639-2 eng
	 * @author Alex [@glintik]{@link https://github.com/glintik}
	 */

	var locale$b = {
	  formatDistance: formatDistance,
	  formatLong: formatLong$b,
	  formatRelative: formatRelative,
	  localize: localize,
	  match: match,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$b = {
	  lessThanXSeconds: {
	    one: 'malpli ol sekundo',
	    other: 'malpli ol {{count}} sekundoj'
	  },
	  xSeconds: {
	    one: '1 sekundo',
	    other: '{{count}} sekundoj'
	  },
	  halfAMinute: 'duonminuto',
	  lessThanXMinutes: {
	    one: 'malpli ol minuto',
	    other: 'malpli ol {{count}} minutoj'
	  },
	  xMinutes: {
	    one: '1 minuto',
	    other: '{{count}} minutoj'
	  },
	  aboutXHours: {
	    one: 'proksimume 1 horo',
	    other: 'proksimume {{count}} horoj'
	  },
	  xHours: {
	    one: '1 horo',
	    other: '{{count}} horoj'
	  },
	  xDays: {
	    one: '1 tago',
	    other: '{{count}} tagoj'
	  },
	  aboutXMonths: {
	    one: 'proksimume 1 monato',
	    other: 'proksimume {{count}} monatoj'
	  },
	  xMonths: {
	    one: '1 monato',
	    other: '{{count}} monatoj'
	  },
	  aboutXYears: {
	    one: 'proksimume 1 jaro',
	    other: 'proksimume {{count}} jaroj'
	  },
	  xYears: {
	    one: '1 jaro',
	    other: '{{count}} jaroj'
	  },
	  overXYears: {
	    one: 'pli ol 1 jaro',
	    other: 'pli ol {{count}} jaroj'
	  },
	  almostXYears: {
	    one: 'preska?? 1 jaro',
	    other: 'preska?? {{count}} jaroj'
	  }
	};
	function formatDistance$c(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$b[token] === 'string') {
	    result = formatDistanceLocale$b[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$b[token].one;
	  } else {
	    result = formatDistanceLocale$b[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'post ' + result;
	    } else {
	      return 'anta?? ' + result;
	    }
	  }

	  return result;
	}

	var dateFormats$c = {
	  full: "EEEE, do 'de' MMMM y",
	  long: 'y-MMMM-dd',
	  medium: 'y-MMM-dd',
	  short: 'yyyy-MM-dd'
	};
	var timeFormats$c = {
	  full: "Ho 'horo kaj' m:ss zzzz",
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$c = {
	  any: '{{date}} {{time}}'
	};
	var formatLong$c = {
	  date: buildFormatLongFn({
	    formats: dateFormats$c,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$c,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$c,
	    defaultWidth: 'any'
	  })
	};

	var formatRelativeLocale$a = {
	  lastWeek: "'pasinta' eeee 'je' p",
	  yesterday: "'hiera?? je' p",
	  today: "'hodia?? je' p",
	  tomorrow: "'morga?? je' p",
	  nextWeek: "eeee 'je' p",
	  other: 'P'
	};
	function formatRelative$b(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$a[token];
	}

	var eraValues$a = {
	  narrow: ['aK', 'pK'],
	  abbreviated: ['a.K.E.', 'p.K.E.'],
	  wide: ['anta?? Komuna Erao', 'Komuna Erao']
	};
	var quarterValues$a = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['K1', 'K2', 'K3', 'K4'],
	  wide: ['1-a kvaronjaro', '2-a kvaronjaro', '3-a kvaronjaro', '4-a kvaronjaro']
	};
	var monthValues$a = {
	  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'a??g', 'sep', 'okt', 'nov', 'dec'],
	  wide: ['januaro', 'februaro', 'marto', 'aprilo', 'majo', 'junio', 'julio', 'a??gusto', 'septembro', 'oktobro', 'novembro', 'decembro']
	};
	var dayValues$a = {
	  narrow: ['D', 'L', 'M', 'M', '??', 'V', 'S'],
	  short: ['di', 'lu', 'ma', 'me', '??a', 've', 'sa'],
	  abbreviated: ['dim', 'lun', 'mar', 'mer', '??a??', 'ven', 'sab'],
	  wide: ['diman??o', 'lundo', 'mardo', 'merkredo', '??a??do', 'vendredo', 'sabato']
	};
	var dayPeriodValues$a = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'noktomezo',
	    noon: 'tagmezo',
	    morning: 'matene',
	    afternoon: 'posttagmeze',
	    evening: 'vespere',
	    night: 'nokte'
	  },
	  abbreviated: {
	    am: 'a.t.m.',
	    pm: 'p.t.m.',
	    midnight: 'noktomezo',
	    noon: 'tagmezo',
	    morning: 'matene',
	    afternoon: 'posttagmeze',
	    evening: 'vespere',
	    night: 'nokte'
	  },
	  wide: {
	    am: 'anta??tagmeze',
	    pm: 'posttagmeze',
	    midnight: 'noktomezo',
	    noon: 'tagmezo',
	    morning: 'matene',
	    afternoon: 'posttagmeze',
	    evening: 'vespere',
	    night: 'nokte'
	  }
	};

	function ordinalNumber$a(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return number + '-a';
	}

	var localize$a = {
	  ordinalNumber: ordinalNumber$a,
	  era: buildLocalizeFn({
	    values: eraValues$a,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$a,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$a,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$a,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$a,
	    defaultWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$a = /^(\d+)(-?a)?/i;
	var parseOrdinalNumberPattern$a = /\d+/i;
	var matchEraPatterns$a = {
	  narrow: /^([ap]k)/i,
	  abbreviated: /^([ap]\.?\s?k\.?\s?e\.?)/i,
	  wide: /^((anta?? |post )?komuna erao)/i
	};
	var parseEraPatterns$a = {
	  any: [/^a/i, /^[kp]/i]
	};
	var matchQuarterPatterns$a = {
	  narrow: /^[1234]/i,
	  abbreviated: /^k[1234]/i,
	  wide: /^[1234](-?a)? kvaronjaro/i
	};
	var parseQuarterPatterns$a = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$a = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(jan|feb|mar|apr|maj|jun|jul|a(??|ux|uh|u)g|sep|okt|nov|dec)/i,
	  wide: /^(januaro|februaro|marto|aprilo|majo|junio|julio|a(??|ux|uh|u)gusto|septembro|oktobro|novembro|decembro)/i
	};
	var parseMonthPatterns$a = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^maj/i, /^jun/i, /^jul/i, /^a(u|??)/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$a = {
	  narrow: /^[dlm??jvs]/i,
	  short: /^(di|lu|ma|me|(??|jx|jh|j)a|ve|sa)/i,
	  abbreviated: /^(dim|lun|mar|mer|(??|jx|jh|j)a(??|ux|uh|u)|ven|sab)/i,
	  wide: /^(diman(??|cx|ch|c)o|lundo|mardo|merkredo|(??|jx|jh|j)a(??|ux|uh|u)do|vendredo|sabato)/i
	};
	var parseDayPatterns$a = {
	  narrow: [/^d/i, /^l/i, /^m/i, /^m/i, /^(j|??)/i, /^v/i, /^s/i],
	  any: [/^d/i, /^l/i, /^ma/i, /^me/i, /^(j|??)/i, /^v/i, /^s/i]
	};
	var matchDayPeriodPatterns$a = {
	  narrow: /^([ap]|(posttagmez|noktomez|tagmez|maten|vesper|nokt)[eo])/i,
	  abbreviated: /^([ap][.\s]?t[.\s]?m[.\s]?|(posttagmez|noktomez|tagmez|maten|vesper|nokt)[eo])/i,
	  wide: /^(anta(??|ux)tagmez|posttagmez|noktomez|tagmez|maten|vesper|nokt)[eo]/i
	};
	var parseDayPeriodPatterns$a = {
	  any: {
	    am: /^a/i,
	    pm: /^p/i,
	    midnight: /^noktom/i,
	    noon: /^t/i,
	    morning: /^m/i,
	    afternoon: /^posttagmeze/i,
	    evening: /^v/i,
	    night: /^n/i
	  }
	};
	var match$a = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$a,
	    parsePattern: parseOrdinalNumberPattern$a,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$a,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$a,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$a,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$a,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$a,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$a,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$a,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$a,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$a,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPeriodPatterns$a,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Esperanto locale.
	 * @language Esperanto
	 * @iso-639-2 epo
	 * @author Lesha Koss [@leshakoss]{@link https://github.com/leshakoss}
	 */

	var locale$c = {
	  formatDistance: formatDistance$c,
	  formatLong: formatLong$c,
	  formatRelative: formatRelative$b,
	  localize: localize$a,
	  match: match$a,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$c = {
	  lessThanXSeconds: {
	    one: 'menos de un segundo',
	    other: 'menos de {{count}} segundos'
	  },
	  xSeconds: {
	    one: '1 segundo',
	    other: '{{count}} segundos'
	  },
	  halfAMinute: 'medio minuto',
	  lessThanXMinutes: {
	    one: 'menos de un minuto',
	    other: 'menos de {{count}} minutos'
	  },
	  xMinutes: {
	    one: '1 minuto',
	    other: '{{count}} minutos'
	  },
	  aboutXHours: {
	    one: 'alrededor de 1 hora',
	    other: 'alrededor de {{count}} horas'
	  },
	  xHours: {
	    one: '1 hora',
	    other: '{{count}} horas'
	  },
	  xDays: {
	    one: '1 d??a',
	    other: '{{count}} d??as'
	  },
	  aboutXMonths: {
	    one: 'alrededor de 1 mes',
	    other: 'alrededor de {{count}} meses'
	  },
	  xMonths: {
	    one: '1 mes',
	    other: '{{count}} meses'
	  },
	  aboutXYears: {
	    one: 'alrededor de 1 a??o',
	    other: 'alrededor de {{count}} a??os'
	  },
	  xYears: {
	    one: '1 a??o',
	    other: '{{count}} a??os'
	  },
	  overXYears: {
	    one: 'm??s de 1 a??o',
	    other: 'm??s de {{count}} a??os'
	  },
	  almostXYears: {
	    one: 'casi 1 a??o',
	    other: 'casi {{count}} a??os'
	  }
	};
	function formatDistance$d(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$c[token] === 'string') {
	    result = formatDistanceLocale$c[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$c[token].one;
	  } else {
	    result = formatDistanceLocale$c[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'en ' + result;
	    } else {
	      return 'hace ' + result;
	    }
	  }

	  return result;
	}

	var dateFormats$d = {
	  full: "EEEE, d 'de' MMMM y",
	  long: "d 'de' MMMM y",
	  medium: 'd MMM y',
	  short: 'dd/MM/y'
	};
	var timeFormats$d = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$d = {
	  full: "{{date}} 'a las' {{time}}",
	  long: "{{date}} 'a las' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$d = {
	  date: buildFormatLongFn({
	    formats: dateFormats$d,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$d,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$d,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$b = {
	  lastWeek: "'el' eeee 'pasado a la' LT",
	  yesterday: "'ayer a la' p",
	  today: "'hoy a la' p",
	  tomorrow: "'ma??ana a la' p",
	  nextWeek: "eeee 'a la' p",
	  other: 'P'
	};
	var formatRelativeLocalePlural = {
	  lastWeek: "'el' eeee 'pasado a las' p",
	  yesterday: "'ayer a las' p",
	  today: "'hoy a las' p",
	  tomorrow: "'ma??ana a las' p",
	  nextWeek: "eeee 'a las' p",
	  other: 'P'
	};
	function formatRelative$c(token, date, _baseDate, _options) {
	  if (date.getUTCHours() !== 1) {
	    return formatRelativeLocalePlural[token];
	  }

	  return formatRelativeLocale$b[token];
	}

	var eraValues$b = {
	  narrow: ['AC', 'DC'],
	  abbreviated: ['AC', 'DC'],
	  wide: ['antes de cristo', 'despu??s de cristo']
	};
	var quarterValues$b = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['T1', 'T2', 'T3', 'T4'],
	  wide: ['1?? trimestre', '2?? trimestre', '3?? trimestre', '4?? trimestre']
	};
	var monthValues$b = {
	  narrow: ['e', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
	  abbreviated: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
	  wide: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
	};
	var dayValues$b = {
	  narrow: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
	  short: ['do', 'lu', 'ma', 'mi', 'ju', 'vi', 'sa'],
	  abbreviated: ['dom', 'lun', 'mar', 'mi??', 'jue', 'vie', 'sab'],
	  wide: ['domingo', 'lunes', 'martes', 'mi??rcoles', 'jueves', 'viernes', 's??bado']
	};
	var dayPeriodValues$b = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'mn',
	    noon: 'md',
	    morning: 'ma??ana',
	    afternoon: 'tarde',
	    evening: 'tarde',
	    night: 'noche'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'medianoche',
	    noon: 'mediodia',
	    morning: 'ma??ana',
	    afternoon: 'tarde',
	    evening: 'tarde',
	    night: 'noche'
	  },
	  wide: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'medianoche',
	    noon: 'mediodia',
	    morning: 'ma??ana',
	    afternoon: 'tarde',
	    evening: 'tarde',
	    night: 'noche'
	  }
	};
	var formattingDayPeriodValues$9 = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'mn',
	    noon: 'md',
	    morning: 'de la ma??ana',
	    afternoon: 'de la tarde',
	    evening: 'de la tarde',
	    night: 'de la noche'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'medianoche',
	    noon: 'mediodia',
	    morning: 'de la ma??ana',
	    afternoon: 'de la tarde',
	    evening: 'de la tarde',
	    night: 'de la noche'
	  },
	  wide: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'medianoche',
	    noon: 'mediodia',
	    morning: 'de la ma??ana',
	    afternoon: 'de la tarde',
	    evening: 'de la tarde',
	    night: 'de la noche'
	  }
	};

	function ordinalNumber$b(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return number + '??';
	}

	var localize$b = {
	  ordinalNumber: ordinalNumber$b,
	  era: buildLocalizeFn({
	    values: eraValues$b,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$b,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$b,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$b,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$b,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$9,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$b = /^(\d+)(??)?/i;
	var parseOrdinalNumberPattern$b = /\d+/i;
	var matchEraPatterns$b = {
	  narrow: /^(ac|dc|a|d)/i,
	  abbreviated: /^(a\.?\s?c\.?|a\.?\s?e\.?\s?c\.?|d\.?\s?c\.?|e\.?\s?c\.?)/i,
	  wide: /^(antes de cristo|antes de la era com[u??]n|despu[e??]s de cristo|era com[u??]n)/i
	};
	var parseEraPatterns$b = {
	  any: [/^ac/i, /^dc/i],
	  wide: [/^(antes de cristo|antes de la era com[u??]n)/i, /^(despu[e??]s de cristo|era com[u??]n)/i]
	};
	var matchQuarterPatterns$b = {
	  narrow: /^[1234]/i,
	  abbreviated: /^T[1234]/i,
	  wide: /^[1234](??)? trimestre/i
	};
	var parseQuarterPatterns$b = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$b = {
	  narrow: /^[efmajsond]/i,
	  abbreviated: /^(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/i,
	  wide: /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i
	};
	var parseMonthPatterns$b = {
	  narrow: [/^e/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^en/i, /^feb/i, /^mar/i, /^abr/i, /^may/i, /^jun/i, /^jul/i, /^ago/i, /^sep/i, /^oct/i, /^nov/i, /^dic/i]
	};
	var matchDayPatterns$b = {
	  narrow: /^[dlmjvs]/i,
	  short: /^(do|lu|ma|mi|ju|vi|sa)/i,
	  abbreviated: /^(dom|lun|mar|mie|jue|vie|sab)/i,
	  wide: /^(domingo|lunes|martes|miercoles|jueves|viernes|s[??a]bado)/i
	};
	var parseDayPatterns$b = {
	  narrow: [/^d/i, /^l/i, /^m/i, /^m/i, /^j/i, /^v/i, /^s/i],
	  any: [/^do/i, /^lu/i, /^ma/i, /^mi/i, /^ju/i, /^vi/i, /^sa/i]
	};
	var matchDayPeriodPatterns$b = {
	  narrow: /^(a|p|mn|md|(de la|a las) (ma??ana|tarde|noche))/i,
	  any: /^([ap]\.?\s?m\.?|medianoche|mediodia|(de la|a las) (ma??ana|tarde|noche))/i
	};
	var parseDayPeriodPatterns$b = {
	  any: {
	    am: /^a/i,
	    pm: /^p/i,
	    midnight: /^mn/i,
	    noon: /^md/i,
	    morning: /ma??ana/i,
	    afternoon: /tarde/i,
	    evening: /tarde/i,
	    night: /noche/i
	  }
	};
	var match$b = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$b,
	    parsePattern: parseOrdinalNumberPattern$b,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$b,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$b,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$b,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$b,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$b,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$b,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$b,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$b,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$b,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$b,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Spanish locale.
	 * @language Spanish
	 * @iso-639-2 spa
	 * @author Juan Angosto [@juanangosto]{@link https://github.com/juanangosto}
	 * @author Guillermo Grau [@guigrpa]{@link https://github.com/guigrpa}
	 * @author Fernando Ag??ero [@fjaguero]{@link https://github.com/fjaguero}
	 * @author Gast??n Haro [@harogaston]{@link https://github.com/harogaston}
	 * @author Yago Carballo [@YagoCarballo]{@link https://github.com/YagoCarballo}
	 */

	var locale$d = {
	  formatDistance: formatDistance$d,
	  formatLong: formatLong$d,
	  formatRelative: formatRelative$c,
	  localize: localize$b,
	  match: match$b,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	var formatDistanceLocale$d = {
	  lessThanXSeconds: {
	    standalone: {
	      one: 'v??hem kui ??ks sekund',
	      other: 'v??hem kui {{count}} sekundit'
	    },
	    withPreposition: {
	      one: 'v??hem kui ??he sekundi',
	      other: 'v??hem kui {{count}} sekundi'
	    }
	  },
	  xSeconds: {
	    standalone: {
	      one: '??ks sekund',
	      other: '{{count}} sekundit'
	    },
	    withPreposition: {
	      one: '??he sekundi',
	      other: '{{count}} sekundi'
	    }
	  },
	  halfAMinute: {
	    standalone: 'pool minutit',
	    withPreposition: 'poole minuti'
	  },
	  lessThanXMinutes: {
	    standalone: {
	      one: 'v??hem kui ??ks minut',
	      other: 'v??hem kui {{count}} minutit'
	    },
	    withPreposition: {
	      one: 'v??hem kui ??he minuti',
	      other: 'v??hem kui {{count}} minuti'
	    }
	  },
	  xMinutes: {
	    standalone: {
	      one: '??ks minut',
	      other: '{{count}} minutit'
	    },
	    withPreposition: {
	      one: '??he minuti',
	      other: '{{count}} minuti'
	    }
	  },
	  aboutXHours: {
	    standalone: {
	      one: 'umbes ??ks tund',
	      other: 'umbes {{count}} tundi'
	    },
	    withPreposition: {
	      one: 'umbes ??he tunni',
	      other: 'umbes {{count}} tunni'
	    }
	  },
	  xHours: {
	    standalone: {
	      one: '??ks tund',
	      other: '{{count}} tundi'
	    },
	    withPreposition: {
	      one: '??he tunni',
	      other: '{{count}} tunni'
	    }
	  },
	  xDays: {
	    standalone: {
	      one: '??ks p??ev',
	      other: '{{count}} p??eva'
	    },
	    withPreposition: {
	      one: '??he p??eva',
	      other: '{{count}} p??eva'
	    }
	  },
	  aboutXMonths: {
	    standalone: {
	      one: 'umbes ??ks kuu',
	      other: 'umbes {{count}} kuud'
	    },
	    withPreposition: {
	      one: 'umbes ??he kuu',
	      other: 'umbes {{count}} kuu'
	    }
	  },
	  xMonths: {
	    standalone: {
	      one: '??ks kuu',
	      other: '{{count}} kuud'
	    },
	    withPreposition: {
	      one: '??he kuu',
	      other: '{{count}} kuu'
	    }
	  },
	  aboutXYears: {
	    standalone: {
	      one: 'umbes ??ks aasta',
	      other: 'umbes {{count}} aastat'
	    },
	    withPreposition: {
	      one: 'umbes ??he aasta',
	      other: 'umbes {{count}} aasta'
	    }
	  },
	  xYears: {
	    standalone: {
	      one: '??ks aasta',
	      other: '{{count}} aastat'
	    },
	    withPreposition: {
	      one: '??he aasta',
	      other: '{{count}} aasta'
	    }
	  },
	  overXYears: {
	    standalone: {
	      one: 'rohkem kui ??ks aasta',
	      other: 'rohkem kui {{count}} aastat'
	    },
	    withPreposition: {
	      one: 'rohkem kui ??he aasta',
	      other: 'rohkem kui {{count}} aasta'
	    }
	  },
	  almostXYears: {
	    standalone: {
	      one: 'peaaegu ??ks aasta',
	      other: 'peaaegu {{count}} aastat'
	    },
	    withPreposition: {
	      one: 'peaaegu ??he aasta',
	      other: 'peaaegu {{count}} aasta'
	    }
	  }
	};
	function formatDistance$e(token, count, options) {
	  options = options || {};
	  var usageGroup = options.addSuffix ? formatDistanceLocale$d[token].withPreposition : formatDistanceLocale$d[token].standalone;
	  var result;

	  if (typeof usageGroup === 'string') {
	    result = usageGroup;
	  } else if (count === 1) {
	    result = usageGroup.one;
	  } else {
	    result = usageGroup.other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return result + ' p??rast';
	    } else {
	      return result + ' eest';
	    }
	  }

	  return result;
	}

	var dateFormats$e = {
	  full: 'eeee, d. MMMM y',
	  long: 'd. MMMM y',
	  medium: 'd. MMM y',
	  short: 'dd.MM.y'
	};
	var timeFormats$e = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$e = {
	  full: "{{date}} 'kell' {{time}}",
	  long: "{{date}} 'kell' {{time}}",
	  medium: '{{date}}. {{time}}',
	  short: '{{date}}. {{time}}'
	};
	var formatLong$e = {
	  date: buildFormatLongFn({
	    formats: dateFormats$e,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$e,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$e,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$c = {
	  lastWeek: "'eelmine' eeee 'kell' p",
	  yesterday: "'eile kell' p",
	  today: "'t??na kell' p",
	  tomorrow: "'homme kell' p",
	  nextWeek: "'j??rgmine' eeee 'kell' p",
	  other: 'P'
	};
	function formatRelative$d(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$c[token];
	}

	var eraValues$c = {
	  narrow: ['e.m.a', 'm.a.j'],
	  abbreviated: ['e.m.a', 'm.a.j'],
	  wide: ['enne meie ajaarvamist', 'meie ajaarvamise j??rgi']
	};
	var quarterValues$c = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['K1', 'K2', 'K3', 'K4'],
	  wide: ['1. kvartal', '2. kvartal', '3. kvartal', '4. kvartal']
	};
	var monthValues$c = {
	  narrow: ['J', 'V', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['jaan', 'veebr', 'm??rts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov', 'dets'],
	  wide: ['jaanuar', 'veebruar', 'm??rts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember']
	};
	var dayValues$c = {
	  narrow: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
	  short: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
	  abbreviated: ['p??hap.', 'esmasp.', 'teisip.', 'kolmap.', 'neljap.', 'reede.', 'laup.'],
	  wide: ['p??hap??ev', 'esmasp??ev', 'teisip??ev', 'kolmap??ev', 'neljap??ev', 'reede', 'laup??ev']
	};
	var dayPeriodValues$c = {
	  narrow: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'kesk????',
	    noon: 'keskp??ev',
	    morning: 'hommik',
	    afternoon: 'p??rastl??una',
	    evening: '??htu',
	    night: '????'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'kesk????',
	    noon: 'keskp??ev',
	    morning: 'hommik',
	    afternoon: 'p??rastl??una',
	    evening: '??htu',
	    night: '????'
	  },
	  wide: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'kesk????',
	    noon: 'keskp??ev',
	    morning: 'hommik',
	    afternoon: 'p??rastl??una',
	    evening: '??htu',
	    night: '????'
	  }
	};
	var formattingDayPeriodValues$a = {
	  narrow: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'kesk????l',
	    noon: 'keskp??eval',
	    morning: 'hommikul',
	    afternoon: 'p??rastl??unal',
	    evening: '??htul',
	    night: '????sel'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'kesk????l',
	    noon: 'keskp??eval',
	    morning: 'hommikul',
	    afternoon: 'p??rastl??unal',
	    evening: '??htul',
	    night: '????sel'
	  },
	  wide: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'kesk????l',
	    noon: 'keskp??eval',
	    morning: 'hommikul',
	    afternoon: 'p??rastl??unal',
	    evening: '??htul',
	    night: '????sel'
	  }
	};

	function ordinalNumber$c(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return number + '.';
	}

	var localize$c = {
	  ordinalNumber: ordinalNumber$c,
	  era: buildLocalizeFn({
	    values: eraValues$c,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$c,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$c,
	    formattingValues: monthValues$c,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$c,
	    formattingValues: dayValues$c,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$c,
	    formattingValues: formattingDayPeriodValues$a,
	    defaultWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$c = /^\d+\./i;
	var parseOrdinalNumberPattern$c = /\d+/i;
	var matchEraPatterns$c = {
	  narrow: /^(e\.m\.a|m\.a\.j|eKr|pKr)/i,
	  abbreviated: /^(e\.m\.a|m\.a\.j|eKr|pKr)/i,
	  wide: /^(enne meie ajaarvamist|meie ajaarvamise j??rgi|enne Kristust|p??rast Kristust)/i
	};
	var parseEraPatterns$c = {
	  any: [/^e/i, /^(m|p)/i]
	};
	var matchQuarterPatterns$c = {
	  narrow: /^[1234]/i,
	  abbreviated: /^K[1234]/i,
	  wide: /^[1234](\.)? kvartal/i
	};
	var parseQuarterPatterns$c = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$c = {
	  narrow: /^[jvmasond]/i,
	  abbreviated: /^('jaan|veebr|m??rts|apr|mai|juuni|juuli|aug|sept|okt|nov|dets')/i,
	  wide: /^('jaanuar|veebruar|m??rts|aprill|mai|juuni|juuli|august|september|oktoober|november|detsember')/i
	};
	var parseMonthPatterns$c = {
	  narrow: [/^j/i, /^v/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^v/i, /^m??r/i, /^ap/i, /^mai/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$c = {
	  narrow: /^[petknrl]/i,
	  short: /^[petknrl]/i,
	  abbreviated: /^(p??h?|esm?|tei?|kolm?|nel?|ree?|laup?)\.?/i,
	  wide: /^('p??hap??ev|esmasp??ev|teisip??ev|kolmap??ev|neljap??ev|reede|laup??ev')/i
	};
	var parseDayPatterns$c = {
	  any: [/^p/i, /^e/i, /^t/i, /^k/i, /^n/i, /^r/i, /^l/i]
	};
	var matchDayPeriodPatterns$c = {
	  any: /^(am|pm|kesk????|keskp??ev|hommik|p??rastl??una|??htu|????)/i
	};
	var parseDayPeriodPatterns$c = {
	  any: {
	    am: /^a/i,
	    pm: /^p/i,
	    midnight: /^kesk??/i,
	    noon: /^keskp/i,
	    morning: /hommik/i,
	    afternoon: /p??rastl??una/i,
	    evening: /??htu/i,
	    night: /????/i
	  }
	};
	var match$c = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$c,
	    parsePattern: parseOrdinalNumberPattern$c,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$c,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$c,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$c,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$c,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$c,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$c,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$c,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$c,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$c,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$c,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Estonian locale.
	 * @language Estonian
	 * @iso-639-2 est
	 * @author Priit Hansen [@HansenPriit]{@link https://github.com/priithansen}
	 */

	var locale$e = {
	  formatDistance: formatDistance$e,
	  formatLong: formatLong$e,
	  formatRelative: formatRelative$d,
	  localize: localize$c,
	  match: match$c,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$e = {
	  lessThanXSeconds: {
	    one: '???????? ???? ???? ??????????',
	    other: '???????? ???? {{count}} ??????????'
	  },
	  xSeconds: {
	    one: '1 ??????????',
	    other: '{{count}} ??????????'
	  },
	  halfAMinute: '?????? ??????????',
	  lessThanXMinutes: {
	    one: '???????? ???? ???? ??????????',
	    other: '???????? ???? {{count}} ??????????'
	  },
	  xMinutes: {
	    one: '1 ??????????',
	    other: '{{count}} ??????????'
	  },
	  aboutXHours: {
	    one: '???????? 1 ????????',
	    other: '???????? {{count}} ????????'
	  },
	  xHours: {
	    one: '1 ????????',
	    other: '{{count}} ????????'
	  },
	  xDays: {
	    one: '1 ??????',
	    other: '{{count}} ??????'
	  },
	  aboutXMonths: {
	    one: '???????? 1 ??????',
	    other: '???????? {{count}} ??????'
	  },
	  xMonths: {
	    one: '1 ??????',
	    other: '{{count}} ??????'
	  },
	  aboutXYears: {
	    one: '???????? 1 ??????',
	    other: '???????? {{count}} ??????'
	  },
	  xYears: {
	    one: '1 ??????',
	    other: '{{count}} ??????'
	  },
	  overXYears: {
	    one: '?????????? ???? 1 ??????',
	    other: '?????????? ???? {{count}} ??????'
	  },
	  almostXYears: {
	    one: '?????????? 1 ??????',
	    other: '?????????? {{count}} ??????'
	  }
	};
	function formatDistance$f(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$e[token] === 'string') {
	    result = formatDistanceLocale$e[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$e[token].one;
	  } else {
	    result = formatDistanceLocale$e[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return '???? ' + result;
	    } else {
	      return result + ' ??????';
	    }
	  }

	  return result;
	}

	var dateFormats$f = {
	  full: 'EEEE do MMMM y',
	  long: 'do MMMM y',
	  medium: 'd MMM y',
	  short: 'yyyy/MM/dd'
	};
	var timeFormats$f = {
	  full: 'h:mm:ss a zzzz',
	  long: 'h:mm:ss a z',
	  medium: 'h:mm:ss a',
	  short: 'h:mm a'
	};
	var dateTimeFormats$f = {
	  full: "{{date}} '????' {{time}}",
	  long: "{{date}} '????' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$f = {
	  date: buildFormatLongFn({
	    formats: dateFormats$f,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$f,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$f,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$d = {
	  lastWeek: "eeee '?????????? ????' p",
	  yesterday: "'?????????? ????' p",
	  today: "'?????????? ????' p",
	  tomorrow: "'???????? ????' p",
	  nextWeek: "eeee '????' p",
	  other: 'P'
	};
	function formatRelative$e(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$d[token];
	}

	var eraValues$d = {
	  narrow: ['??', '??'],
	  abbreviated: ['??.??.', '??.??.'],
	  wide: ['?????? ???? ??????????', '?????? ???? ??????????']
	};
	var quarterValues$d = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['???????1', '???????2', '???????3', '???????4'],
	  wide: ['??????????????? 1', '??????????????? 2', '??????????????? 3', '??????????????? 4'] // Note: in English, the names of days of the week and months are capitalized.
	  // If you are making a new locale based on this one, check if the same is true for the language you're working on.
	  // Generally, formatted dates should look like they are in the middle of a sentence,
	  // e.g. in Spanish language the weekdays and months should be in the lowercase.

	};
	var monthValues$d = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'],
	  abbreviated: ['????????', '??????', '????????', '??????', '????', '??????', '????????', '??????', '????????', '????????', '??????????', '??????????'],
	  wide: ['????????????', '??????????', '????????', '??????????', '????', '??????', '??????????', '??????????', '??????????????', '??????????', '????????????', '????????????']
	};
	var dayValues$d = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??'],
	  short: ['1??', '2??', '3??', '4??', '5??', '??', '??'],
	  abbreviated: ['????????????', '????????????', '???????????????', '????????????????', '??????????????', '????????', '????????'],
	  wide: ['????????????', '????????????', '???????????????', '????????????????', '??????????????', '????????', '????????']
	};
	var dayPeriodValues$d = {
	  narrow: {
	    am: '??',
	    pm: '??',
	    midnight: '??',
	    noon: '??',
	    morning: '??',
	    afternoon: '??.??.',
	    evening: '??',
	    night: '??'
	  },
	  abbreviated: {
	    am: '??.??.',
	    pm: '??.??.',
	    midnight: '???????????????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '????????????????',
	    evening: '??????',
	    night: '????'
	  },
	  wide: {
	    am: '???????????????????',
	    pm: '????????????????',
	    midnight: '???????????????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '????????????????',
	    evening: '??????',
	    night: '????'
	  }
	};
	var formattingDayPeriodValues$b = {
	  narrow: {
	    am: '??',
	    pm: '??',
	    midnight: '??',
	    noon: '??',
	    morning: '??',
	    afternoon: '??.??.',
	    evening: '??',
	    night: '??'
	  },
	  abbreviated: {
	    am: '??.??.',
	    pm: '??.??.',
	    midnight: '???????????????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '????????????????',
	    evening: '??????',
	    night: '????'
	  },
	  wide: {
	    am: '???????????????????',
	    pm: '????????????????',
	    midnight: '???????????????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '????????????????',
	    evening: '??????',
	    night: '????'
	  }
	};

	function ordinalNumber$d(dirtyNumber) {
	  return String(dirtyNumber);
	}

	var localize$d = {
	  ordinalNumber: ordinalNumber$d,
	  era: buildLocalizeFn({
	    values: eraValues$d,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$d,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$d,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$d,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$d,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$b,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$d = /^(\d+)(th|st|nd|rd)?/i;
	var parseOrdinalNumberPattern$d = /\d+/i;
	var matchEraPatterns$d = {
	  narrow: /^(??|??)/i,
	  abbreviated: /^(??\.?\s???\.?|??\.?\s???\.?\s???\.?|??\.?\s?|??\.?\s???\.?)/i,
	  wide: /^(?????? ???? ??????????|?????? ???? ?????????? ??????????|????????????|?????????? ??????????|?????? ???? ??????????)/i
	};
	var parseEraPatterns$d = {
	  any: [/^??????/i, /^??????/i]
	};
	var matchQuarterPatterns$d = {
	  narrow: /^[1234]/i,
	  abbreviated: /^???????[1234]/i,
	  wide: /^??????????????? [1234]/i
	};
	var parseQuarterPatterns$d = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$d = {
	  narrow: /^[??????????????????????]/i,
	  abbreviated: /^(??????|????????|????????????|??????????|??????|????????|??????????|??????|????|????|????????|??????|??????|????????|??????????|??????|??????|????????????|??????????????|??????????|????????????|????????????|??????????|????????????|??????????|??????)/i,
	  wide: /^(????????????|??????????|????????????|??????????|????????|????????|??????????|??????????|????????????|??????????|????|????|????????|??????|??????????|??????????|????????|????????|??????????|??????|????????????|??????????????|??????????|????????????|????????????|??????????|????????????|??????????)/i
	};
	var parseMonthPatterns$d = {
	  narrow: [/^(??|??)/i, /^??/i, /^??/i, /^(??|??)/i, /^??/i, /^(??|??)/i, /^(??|??)/i, /^(??|??)/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  any: [/^????/i, /^??/i, /^????/i, /^????/i, /^(????|????)/i, /^(????????|??????)/i, /^(????????|??????)/i, /^(??????|????)/i, /^??/i, /^(??????|????)/i, /^??/i, /^??/i]
	};
	var matchDayPatterns$d = {
	  narrow: /^[??????????????]/i,
	  short: /^(??|??|1??|2??|3??|4??|5??)/i,
	  abbreviated: /^(????????????|????????????|???????????????|????????????????|?????????????????|????????|????????)/i,
	  wide: /^(????????????|????????????|???????????????|????????????????|?????????????????|????????|????????)/i
	};
	var parseDayPatterns$d = {
	  narrow: [/^??/i, /^????/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  any: [/^(??|1??|????????????)/i, /^(??|2??|????????????)/i, /^(??|3??|???????????????)/i, /^(??|4??|????????????????)/i, /^(??|5??|??????????????)/i, /^(??|????????)/i, /^(??|????????)/i]
	};
	var matchDayPeriodPatterns$d = {
	  narrow: /^(??|??|??|??|??|??.??.|??|??)/i,
	  abbreviated: /^(??.??.|??.??.|???????????????|??????|??????|????????????????|??????|????)/i,
	  wide: /^(???????????????????|???????????????|??????|??????|????????????????|??????|????)/i
	};
	var parseDayPeriodPatterns$d = {
	  any: {
	    am: /^(??|??.??.|???????????????????)/i,
	    pm: /^(??|??.??.|????????????????)/i,
	    midnight: /^(??????????????????|??)/i,
	    noon: /^(??|??????)/i,
	    morning: /(??|??????)/i,
	    afternoon: /(??|??.??.|????????????????)/i,
	    evening: /(??|??????)/i,
	    night: /(??|????)/i
	  }
	};
	var match$d = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$d,
	    parsePattern: parseOrdinalNumberPattern$d,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$d,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$d,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$d,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$d,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$d,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$d,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$d,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$d,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$d,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$d,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Persian/Farsi locale (Iran).
	 * @language Persian
	 * @iso-639-2 ira
	 * @author Morteza Ziyae [@mort3za]{@link https://github.com/mort3za}
	 */

	var locale$f = {
	  formatDistance: formatDistance$f,
	  formatLong: formatLong$f,
	  formatRelative: formatRelative$e,
	  localize: localize$d,
	  match: match$d,
	  options: {
	    weekStartsOn: 0
	    /* Sunday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	function futureSeconds(text) {
	  return text.replace(/sekuntia?/, 'sekunnin');
	}

	function futureMinutes(text) {
	  return text.replace(/minuuttia?/, 'minuutin');
	}

	function futureHours(text) {
	  return text.replace(/tuntia?/, 'tunnin');
	}

	function futureDays(text) {
	  return text.replace(/p??iv?????/, 'p??iv??n');
	}

	function futureMonths(text) {
	  return text.replace(/(kuukausi|kuukautta)/, 'kuukauden');
	}

	function futureYears(text) {
	  return text.replace(/(vuosi|vuotta)/, 'vuoden');
	}

	var formatDistanceLocale$f = {
	  lessThanXSeconds: {
	    one: 'alle sekunti',
	    other: 'alle {{count}} sekuntia',
	    futureTense: futureSeconds
	  },
	  xSeconds: {
	    one: 'sekunti',
	    other: '{{count}} sekuntia',
	    futureTense: futureSeconds
	  },
	  halfAMinute: {
	    one: 'puoli minuuttia',
	    other: 'puoli minuuttia',
	    futureTense: function (_text) {
	      return 'puolen minuutin';
	    }
	  },
	  lessThanXMinutes: {
	    one: 'alle minuutti',
	    other: 'alle {{count}} minuuttia',
	    futureTense: futureMinutes
	  },
	  xMinutes: {
	    one: 'minuutti',
	    other: '{{count}} minuuttia',
	    futureTense: futureMinutes
	  },
	  aboutXHours: {
	    one: 'noin tunti',
	    other: 'noin {{count}} tuntia',
	    futureTense: futureHours
	  },
	  xHours: {
	    one: 'tunti',
	    other: '{{count}} tuntia',
	    futureTense: futureHours
	  },
	  xDays: {
	    one: 'p??iv??',
	    other: '{{count}} p??iv????',
	    futureTense: futureDays
	  },
	  aboutXMonths: {
	    one: 'noin kuukausi',
	    other: 'noin {{count}} kuukautta',
	    futureTense: futureMonths
	  },
	  xMonths: {
	    one: 'kuukausi',
	    other: '{{count}} kuukautta',
	    futureTense: futureMonths
	  },
	  aboutXYears: {
	    one: 'noin vuosi',
	    other: 'noin {{count}} vuotta',
	    futureTense: futureYears
	  },
	  xYears: {
	    one: 'vuosi',
	    other: '{{count}} vuotta',
	    futureTense: futureYears
	  },
	  overXYears: {
	    one: 'yli vuosi',
	    other: 'yli {{count}} vuotta',
	    futureTense: futureYears
	  },
	  almostXYears: {
	    one: 'l??hes vuosi',
	    other: 'l??hes {{count}} vuotta',
	    futureTense: futureYears
	  }
	};
	function formatDistance$g(token, count, options) {
	  options = options || {};
	  var distance = formatDistanceLocale$f[token];
	  var result = count === 1 ? distance.one : distance.other.replace('{{count}}', count);

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return distance.futureTense(result) + ' kuluttua';
	    } else {
	      return result + ' sitten';
	    }
	  }

	  return result;
	}

	var dateFormats$g = {
	  full: 'eeee d. MMMM y',
	  long: 'd. MMMM y',
	  medium: 'd. MMM y',
	  short: 'd.M.y'
	};
	var timeFormats$g = {
	  full: 'HH.mm.ss zzzz',
	  long: 'HH.mm.ss z',
	  medium: 'HH.mm.ss',
	  short: 'HH.mm'
	};
	var dateTimeFormats$g = {
	  full: "{{date}} 'klo' {{time}}",
	  long: "{{date}} 'klo' {{time}}",
	  medium: '{{date}} {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$g = {
	  date: buildFormatLongFn({
	    formats: dateFormats$g,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$g,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$g,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$e = {
	  lastWeek: "'viime' eeee 'klo' p",
	  yesterday: "'eilen klo' p",
	  today: "'t??n????n klo' p",
	  tomorrow: "'huomenna klo' p",
	  nextWeek: "'ensi' eeee 'klo' p",
	  other: 'P'
	};
	function formatRelative$f(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$e[token];
	}

	var eraValues$e = {
	  narrow: ['eaa.', 'jaa.'],
	  abbreviated: ['eaa.', 'jaa.'],
	  wide: ['ennen ajanlaskun alkua', 'j??lkeen ajanlaskun alun']
	};
	var quarterValues$e = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
	  wide: ['1. kvartaali', '2. kvartaali', '3. kvartaali', '4. kvartaali']
	};
	var monthValues$e = {
	  narrow: ['T', 'H', 'M', 'H', 'T', 'K', 'H', 'E', 'S', 'L', 'M', 'J'],
	  abbreviated: ['tammi', 'helmi', 'maalis', 'huhti', 'touko', 'kes??', 'hein??', 'elo', 'syys', 'loka', 'marras', 'joulu'],
	  wide: ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kes??kuu', 'hein??kuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu']
	};
	var formattingMonthValues$3 = {
	  narrow: monthValues$e.narrow,
	  abbreviated: monthValues$e.abbreviated,
	  wide: monthValues$e.wide.map(function (name) {
	    return name + 'ta';
	  })
	};
	var dayValues$e = {
	  narrow: ['S', 'M', 'T', 'K', 'T', 'P', 'L'],
	  short: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
	  abbreviated: ['sunn.', 'maan.', 'tiis.', 'kesk.', 'torst.', 'perj.', 'la'],
	  wide: ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai']
	};
	var formattingDayValues = {
	  narrow: dayValues$e.narrow,
	  short: dayValues$e.short,
	  abbreviated: dayValues$e.abbreviated,
	  wide: dayValues$e.wide.map(function (name) {
	    return name + 'na';
	  })
	};
	var dayPeriodValues$e = {
	  narrow: {
	    am: 'ap',
	    pm: 'ip',
	    midnight: 'keskiy??',
	    noon: 'keskip??iv??',
	    morning: 'ap',
	    afternoon: 'ip',
	    evening: 'illalla',
	    night: 'y??ll??'
	  },
	  abbreviated: {
	    am: 'ap',
	    pm: 'ip',
	    midnight: 'keskiy??',
	    noon: 'keskip??iv??',
	    morning: 'ap',
	    afternoon: 'ip',
	    evening: 'illalla',
	    night: 'y??ll??'
	  },
	  wide: {
	    am: 'ap',
	    pm: 'ip',
	    midnight: 'keskiy??ll??',
	    noon: 'keskip??iv??ll??',
	    morning: 'aamup??iv??ll??',
	    afternoon: 'iltap??iv??ll??',
	    evening: 'illalla',
	    night: 'y??ll??'
	  }
	};

	function ordinalNumber$e(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return number + '.';
	}

	var localize$e = {
	  ordinalNumber: ordinalNumber$e,
	  era: buildLocalizeFn({
	    values: eraValues$e,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$e,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$e,
	    formattingValues: formattingMonthValues$3,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$e,
	    formattingValues: formattingDayValues,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$e,
	    defaultWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$e = /^(\d+)(th|st|nd|rd)?/i;
	var parseOrdinalNumberPattern$e = /\d+/i;
	var matchEraPatterns$e = {
	  narrow: /^(b|a)/i,
	  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
	  wide: /^(before christ|before common era|anno domini|common era)/i
	};
	var parseEraPatterns$e = {
	  any: [/^b/i, /^(a|c)/i]
	};
	var matchQuarterPatterns$e = {
	  narrow: /^[1234]/i,
	  abbreviated: /^q[1234]/i,
	  wide: /^[1234](th|st|nd|rd)? quarter/i
	};
	var parseQuarterPatterns$e = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$e = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
	  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
	};
	var parseMonthPatterns$e = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$e = {
	  narrow: /^[smtwf]/i,
	  short: /^(su|mo|tu|we|th|fr|sa)/i,
	  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
	  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
	};
	var parseDayPatterns$e = {
	  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
	  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
	};
	var matchDayPeriodPatterns$e = {
	  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
	  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
	};
	var parseDayPeriodPatterns$e = {
	  any: {
	    am: /^a/i,
	    pm: /^p/i,
	    midnight: /^mi/i,
	    noon: /^no/i,
	    morning: /morning/i,
	    afternoon: /afternoon/i,
	    evening: /evening/i,
	    night: /night/i
	  }
	};
	var match$e = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$e,
	    parsePattern: parseOrdinalNumberPattern$e,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$e,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$e,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$e,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$e,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$e,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$e,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$e,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$e,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$e,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$e,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Finnish locale.
	 * @language Finnish
	 * @iso-639-2 fin
	 * @author Pyry-Samuli Lahti [@Pyppe]{@link https://github.com/Pyppe}
	 * @author Edo Rivai [@mikolajgrzyb]{@link https://github.com/mikolajgrzyb}
	 * @author Samu Juvonen [@sjuvonen]{@link https://github.com/sjuvonen}
	 */

	var locale$g = {
	  formatDistance: formatDistance$g,
	  formatLong: formatLong$g,
	  formatRelative: formatRelative$f,
	  localize: localize$e,
	  match: match$e,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$g = {
	  lessThanXSeconds: {
	    one: 'moins d???une seconde',
	    other: 'moins de {{count}} secondes'
	  },
	  xSeconds: {
	    one: '1 seconde',
	    other: '{{count}} secondes'
	  },
	  halfAMinute: '30 secondes',
	  lessThanXMinutes: {
	    one: 'moins d???une minute',
	    other: 'moins de {{count}} minutes'
	  },
	  xMinutes: {
	    one: '1 minute',
	    other: '{{count}} minutes'
	  },
	  aboutXHours: {
	    one: 'environ 1 heure',
	    other: 'environ {{count}} heures'
	  },
	  xHours: {
	    one: '1 heure',
	    other: '{{count}} heures'
	  },
	  xDays: {
	    one: '1 jour',
	    other: '{{count}} jours'
	  },
	  aboutXMonths: {
	    one: 'environ 1 mois',
	    other: 'environ {{count}} mois'
	  },
	  xMonths: {
	    one: '1 mois',
	    other: '{{count}} mois'
	  },
	  aboutXYears: {
	    one: 'environ 1 an',
	    other: 'environ {{count}} ans'
	  },
	  xYears: {
	    one: '1 an',
	    other: '{{count}} ans'
	  },
	  overXYears: {
	    one: 'plus d???un an',
	    other: 'plus de {{count}} ans'
	  },
	  almostXYears: {
	    one: 'presqu???un an',
	    other: 'presque {{count}} ans'
	  }
	};
	function formatDistance$h(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$g[token] === 'string') {
	    result = formatDistanceLocale$g[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$g[token].one;
	  } else {
	    result = formatDistanceLocale$g[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'dans ' + result;
	    } else {
	      return 'il y a ' + result;
	    }
	  }

	  return result;
	}

	var dateFormats$h = {
	  full: 'EEEE d MMMM y',
	  long: 'd MMMM y',
	  medium: 'd MMM y',
	  short: 'dd/MM/y'
	};
	var timeFormats$h = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$h = {
	  full: "{{date}} '??' {{time}}",
	  long: "{{date}} '??' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$h = {
	  date: buildFormatLongFn({
	    formats: dateFormats$h,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$h,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$h,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$f = {
	  lastWeek: "eeee 'dernier ??' p",
	  yesterday: "'hier ??' p",
	  today: "'aujourd???hui ??' p",
	  tomorrow: "'demain ??' p'",
	  nextWeek: "eeee 'prochain ??' p",
	  other: 'P'
	};
	function formatRelative$g(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$f[token];
	}

	var eraValues$f = {
	  narrow: ['av. J.-C', 'ap. J.-C'],
	  abbreviated: ['av. J.-C', 'ap. J.-C'],
	  wide: ['avant J??sus-Christ', 'apr??s J??sus-Christ']
	};
	var quarterValues$f = {
	  narrow: ['T1', 'T2', 'T3', 'T4'],
	  abbreviated: ['1er trim.', '2??me trim.', '3??me trim.', '4??me trim.'],
	  wide: ['1er trimestre', '2??me trimestre', '3??me trimestre', '4??me trimestre']
	};
	var monthValues$f = {
	  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['janv.', 'f??vr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'ao??t', 'sept.', 'oct.', 'nov.', 'd??c.'],
	  wide: ['janvier', 'f??vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao??t', 'septembre', 'octobre', 'novembre', 'd??cembre']
	};
	var dayValues$f = {
	  narrow: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
	  short: ['di', 'lu', 'ma', 'me', 'je', 've', 'sa'],
	  abbreviated: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
	  wide: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
	};
	var dayPeriodValues$f = {
	  narrow: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'minuit',
	    noon: 'midi',
	    morning: 'mat.',
	    afternoon: 'ap.m.',
	    evening: 'soir',
	    night: 'mat.'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'minuit',
	    noon: 'midi',
	    morning: 'matin',
	    afternoon: 'apr??s-midi',
	    evening: 'soir',
	    night: 'matin'
	  },
	  wide: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'minuit',
	    noon: 'midi',
	    morning: 'du matin',
	    afternoon: 'de l???apr??s-midi',
	    evening: 'du soir',
	    night: 'du matin'
	  }
	};

	function ordinalNumber$f(dirtyNumber, dirtyOptions) {
	  var number = Number(dirtyNumber);
	  var options = dirtyOptions || {};
	  var unit = String(options.unit);
	  var suffix;

	  if (number === 0) {
	    return number;
	  }

	  if (unit === 'year' || unit === 'hour' || unit === 'week') {
	    if (number === 1) {
	      suffix = '??re';
	    } else {
	      suffix = '??me';
	    }
	  } else {
	    if (number === 1) {
	      suffix = 'er';
	    } else {
	      suffix = '??me';
	    }
	  }

	  return number + suffix;
	}

	var localize$f = {
	  ordinalNumber: ordinalNumber$f,
	  era: buildLocalizeFn({
	    values: eraValues$f,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$f,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$f,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$f,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$f,
	    defaultWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$f = /^(\d+)(i??me|??re|??me|er|e)?/i;
	var parseOrdinalNumberPattern$f = /\d+/i;
	var matchEraPatterns$f = {
	  narrow: /^(av\.J\.C|ap\.J\.C|ap\.J\.-C)/i,
	  abbreviated: /^(av\.J\.-C|av\.J-C|apr\.J\.-C|apr\.J-C|ap\.J-C)/i,
	  wide: /^(avant J??sus-Christ|apr??s J??sus-Christ)/i
	};
	var parseEraPatterns$f = {
	  any: [/^av/i, /^ap/i]
	};
	var matchQuarterPatterns$f = {
	  narrow: /^[1234]/i,
	  abbreviated: /^t[1234]/i,
	  wide: /^[1234](er|??me|e)? trimestre/i
	};
	var parseQuarterPatterns$f = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$f = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(janv|f??vr|mars|avr|mai|juin|juill|juil|ao??t|sept|oct|nov|d??c)\.?/i,
	  wide: /^(janvier|f??vrier|mars|avril|mai|juin|juillet|ao??t|septembre|octobre|novembre|d??cembre)/i
	};
	var parseMonthPatterns$f = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^f/i, /^mar/i, /^av/i, /^ma/i, /^jui/i, /^juil/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$f = {
	  narrow: /^[lmjvsd]/i,
	  short: /^(di|lu|ma|me|je|ve|sa)/i,
	  abbreviated: /^(dim|lun|mar|mer|jeu|ven|sam)\.?/i,
	  wide: /^(dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi)/i
	};
	var parseDayPatterns$f = {
	  narrow: [/^d/i, /^l/i, /^m/i, /^m/i, /^j/i, /^v/i, /^s/i],
	  any: [/^di/i, /^lu/i, /^ma/i, /^me/i, /^je/i, /^ve/i, /^sa/i]
	};
	var matchDayPeriodPatterns$f = {
	  narrow: /^(a|p|minuit|midi|mat\.?|ap\.?m\.?|soir|nuit)/i,
	  any: /^([ap]\.?\s?m\.?|du matin|de l'apr??s[-\s]midi|du soir|de la nuit)/i
	};
	var parseDayPeriodPatterns$f = {
	  any: {
	    am: /^a/i,
	    pm: /^p/i,
	    midnight: /^min/i,
	    noon: /^mid/i,
	    morning: /mat/i,
	    afternoon: /ap/i,
	    evening: /soir/i,
	    night: /nuit/i
	  }
	};
	var match$f = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$f,
	    parsePattern: parseOrdinalNumberPattern$f,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$f,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$f,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$f,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$f,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$f,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$f,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$f,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$f,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$f,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$f,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary French locale.
	 * @language French
	 * @iso-639-2 fra
	 * @author Jean Dupouy [@izeau]{@link https://github.com/izeau}
	 * @author Fran??ois B [@fbonzon]{@link https://github.com/fbonzon}
	 */

	var locale$h = {
	  formatDistance: formatDistance$h,
	  formatLong: formatLong$h,
	  formatRelative: formatRelative$g,
	  localize: localize$f,
	  match: match$f,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	var formatDistanceLocale$h = {
	  lessThanXSeconds: {
	    one: 'menos dun segundo',
	    other: 'menos de {{count}} segundos'
	  },
	  xSeconds: {
	    one: '1 segundo',
	    other: '{{count}} segundos'
	  },
	  halfAMinute: 'medio minuto',
	  lessThanXMinutes: {
	    one: 'menos dun minuto',
	    other: 'menos de {{count}} minutos'
	  },
	  xMinutes: {
	    one: '1 minuto',
	    other: '{{count}} minutos'
	  },
	  aboutXHours: {
	    one: 'arredor de 1 hora',
	    other: 'arredor de {{count}} horas'
	  },
	  xHours: {
	    one: '1 hora',
	    other: '{{count}} horas'
	  },
	  xDays: {
	    one: '1 d??a',
	    other: '{{count}} d??as'
	  },
	  aboutXMonths: {
	    one: 'arredor de 1 mes',
	    other: 'arredor de {{count}} meses'
	  },
	  xMonths: {
	    one: '1 mes',
	    other: '{{count}} meses'
	  },
	  aboutXYears: {
	    one: 'arredor de 1 ano',
	    other: 'arredor de {{count}} anos'
	  },
	  xYears: {
	    one: '1 ano',
	    other: '{{count}} anos'
	  },
	  overXYears: {
	    one: 'mais de 1 ano',
	    other: 'mais de {{count}} anos'
	  },
	  almostXYears: {
	    one: 'casi 1 ano',
	    other: 'casi {{count}} anos'
	  }
	};
	function formatDistance$i(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$h[token] === 'string') {
	    result = formatDistanceLocale$h[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$h[token].one;
	  } else {
	    result = formatDistanceLocale$h[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'en ' + result;
	    } else {
	      return 'hai ' + result;
	    }
	  }

	  return result;
	}

	var dateFormats$i = {
	  full: "EEEE, d 'de' MMMM y",
	  long: "d 'de' MMMM y",
	  medium: 'd MMM y',
	  short: 'dd/MM/y'
	};
	var timeFormats$i = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$i = {
	  full: "{{date}} '??s' {{time}}",
	  long: "{{date}} '??s' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$i = {
	  date: buildFormatLongFn({
	    formats: dateFormats$i,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$i,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$i,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$g = {
	  lastWeek: "'o' eeee 'pasado ??' LT",
	  yesterday: "'onte ??' p",
	  today: "'hoxe ??' p",
	  tomorrow: "'ma???? ??' p",
	  nextWeek: "eeee '??' p",
	  other: 'P'
	};
	var formatRelativeLocalePlural$1 = {
	  lastWeek: "'o' eeee 'pasado ??s' p",
	  yesterday: "'onte ??s' p",
	  today: "'hoxe ??s' p",
	  tomorrow: "'ma???? ??s' p",
	  nextWeek: "eeee '??s' p",
	  other: 'P'
	};
	function formatRelative$h(token, date, _baseDate, _options) {
	  if (date.getUTCHours() !== 1) {
	    return formatRelativeLocalePlural$1[token];
	  }

	  return formatRelativeLocale$g[token];
	}

	var eraValues$g = {
	  narrow: ['AC', 'DC'],
	  abbreviated: ['AC', 'DC'],
	  wide: ['antes de cristo', 'despois de cristo']
	};
	var quarterValues$g = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['T1', 'T2', 'T3', 'T4'],
	  wide: ['1?? trimestre', '2?? trimestre', '3?? trimestre', '4?? trimestre']
	};
	var monthValues$g = {
	  narrow: ['e', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
	  abbreviated: ['xan', 'feb', 'mar', 'abr', 'mai', 'xun', 'xul', 'ago', 'set', 'out', 'nov', 'dec'],
	  wide: ['xaneiro', 'febreiro', 'marzo', 'abril', 'maio', 'xu??o', 'xullo', 'agosto', 'setembro', 'outubro', 'novembro', 'decembro']
	};
	var dayValues$g = {
	  narrow: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
	  short: ['do', 'lu', 'ma', 'me', 'xo', 've', 'sa'],
	  abbreviated: ['dom', 'lun', 'mar', 'mer', 'xov', 'ven', 'sab'],
	  wide: ['domingo', 'luns', 'martes', 'm??rcores', 'xoves', 'venres', 's??bado']
	};
	var dayPeriodValues$g = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'mn',
	    noon: 'md',
	    morning: 'ma????',
	    afternoon: 'tarde',
	    evening: 'tarde',
	    night: 'noite'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'medianoite',
	    noon: 'mediod??a',
	    morning: 'ma????',
	    afternoon: 'tarde',
	    evening: 'tardi??a',
	    night: 'noite'
	  },
	  wide: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'medianoite',
	    noon: 'mediod??a',
	    morning: 'ma????',
	    afternoon: 'tarde',
	    evening: 'tardi??a',
	    night: 'noite'
	  }
	};
	var formattingDayPeriodValues$c = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'mn',
	    noon: 'md',
	    morning: 'da ma????',
	    afternoon: 'da tarde',
	    evening: 'da tardi??a',
	    night: 'da noite'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'medianoite',
	    noon: 'mediod??a',
	    morning: 'da ma????',
	    afternoon: 'da tarde',
	    evening: 'da tardi??a',
	    night: 'da noite'
	  },
	  wide: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'medianoite',
	    noon: 'mediod??a',
	    morning: 'da ma????',
	    afternoon: 'da tarde',
	    evening: 'da tardi??a',
	    night: 'da noite'
	  }
	};

	function ordinalNumber$g(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return number + '??';
	}

	var localize$g = {
	  ordinalNumber: ordinalNumber$g,
	  era: buildLocalizeFn({
	    values: eraValues$g,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$g,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$g,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$g,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$g,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$c,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$g = /^(\d+)(??)?/i;
	var parseOrdinalNumberPattern$g = /\d+/i;
	var matchEraPatterns$g = {
	  narrow: /^(ac|dc|a|d)/i,
	  abbreviated: /^(a\.?\s?c\.?|a\.?\s?e\.?\s?c\.?|d\.?\s?c\.?|e\.?\s?c\.?)/i,
	  wide: /^(antes de cristo|antes da era com[u??]n|despois de cristo|era com[u??]n)/i
	};
	var parseEraPatterns$g = {
	  any: [/^ac/i, /^dc/i],
	  wide: [/^(antes de cristo|antes da era com[u??]n)/i, /^(despois de cristo|era com[u??]n)/i]
	};
	var matchQuarterPatterns$g = {
	  narrow: /^[1234]/i,
	  abbreviated: /^T[1234]/i,
	  wide: /^[1234](??)? trimestre/i
	};
	var parseQuarterPatterns$g = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$g = {
	  narrow: /^[xfmasond]/i,
	  abbreviated: /^(xan|feb|mar|abr|mai|xun|xul|ago|set|out|nov|dec)/i,
	  wide: /^(xaneiro|febreiro|marzo|abril|maio|xu??o|xullo|agosto|setembro|outubro|novembro|decembro)/i
	};
	var parseMonthPatterns$g = {
	  narrow: [/^x/i, /^f/i, /^m/i, /^a/i, /^m/i, /^x/i, /^x/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^xan/i, /^feb/i, /^mar/i, /^abr/i, /^mai/i, /^xun/i, /^xul/i, /^ago/i, /^set/i, /^out/i, /^nov/i, /^dec/i]
	};
	var matchDayPatterns$g = {
	  narrow: /^[dlmxvs]/i,
	  short: /^(do|lu|ma|me|xo|ve|sa)/i,
	  abbreviated: /^(dom|lun|mar|mer|xov|ven|sab)/i,
	  wide: /^(domingo|luns|martes|m[e??]rcores|xoves|venres|s[??a]bado)/i
	};
	var parseDayPatterns$g = {
	  narrow: [/^d/i, /^l/i, /^m/i, /^m/i, /^x/i, /^v/i, /^s/i],
	  any: [/^do/i, /^lu/i, /^ma/i, /^me/i, /^xo/i, /^ve/i, /^sa/i]
	};
	var matchDayPeriodPatterns$g = {
	  narrow: /^(a|p|mn|md|(da|[a??]s) (ma??[a??]|tarde|noite))/i,
	  any: /^([ap]\.?\s?m\.?|medianoite|mediod[i??]a|(da|[a??]s) (ma??[a??]|tarde|noite))/i
	};
	var parseDayPeriodPatterns$g = {
	  any: {
	    am: /^a/i,
	    pm: /^p/i,
	    midnight: /^mn/i,
	    noon: /^md/i,
	    morning: /ma??[a??]/i,
	    afternoon: /tarde/i,
	    evening: /tardi??a/i,
	    night: /noite/i
	  }
	};
	var match$g = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$g,
	    parsePattern: parseOrdinalNumberPattern$g,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$g,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$g,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$g,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$g,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$g,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$g,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$g,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$g,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$g,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$g,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Galician locale.
	 * @language Galician
	 * @iso-639-2 glg
	 * @author Alberto Doval - Cocodin Technology[@cocodinTech]{@link https://github.com/cocodinTech}
	 * @author Fidel Pita [@fidelpita]{@link https://github.com/fidelpita}
	 */

	var locale$i = {
	  formatDistance: formatDistance$i,
	  formatLong: formatLong$i,
	  formatRelative: formatRelative$h,
	  localize: localize$g,
	  match: match$g,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	var formatDistanceLocale$i = {
	  lessThanXSeconds: {
	    one: '???????? ????????????',
	    two: '???????? ???????? ??????????',
	    other: '???????? ????{{count}} ??????????'
	  },
	  xSeconds: {
	    one: '??????????',
	    two: '?????? ??????????',
	    other: '{{count}} ??????????'
	  },
	  halfAMinute: '?????? ??????',
	  lessThanXMinutes: {
	    one: '???????? ????????',
	    two: '???????? ???????? ????????',
	    other: '???????? ????{{count}} ????????'
	  },
	  xMinutes: {
	    one: '??????',
	    two: '?????? ????????',
	    other: '{{count}} ????????'
	  },
	  aboutXHours: {
	    one: '???????? ??????',
	    two: '???????? ????????????',
	    other: '???????? {{count}} ????????'
	  },
	  xHours: {
	    one: '??????',
	    two: '????????????',
	    other: '{{count}} ????????'
	  },
	  xDays: {
	    one: '??????',
	    two: '????????????',
	    other: '{{count}} ????????'
	  },
	  aboutXMonths: {
	    one: '???????? ????????',
	    two: '???????? ??????????????',
	    other: '???????? {{count}} ????????????'
	  },
	  xMonths: {
	    one: '????????',
	    two: '??????????????',
	    other: '{{count}} ????????????'
	  },
	  aboutXYears: {
	    one: '???????? ??????',
	    two: '???????? ????????????',
	    other: '???????? {{count}} ????????'
	  },
	  xYears: {
	    one: '??????',
	    two: '????????????',
	    other: '{{count}} ????????'
	  },
	  overXYears: {
	    one: '???????? ????????',
	    two: '???????? ??????????????',
	    other: '???????? ????{{count}} ????????'
	  },
	  almostXYears: {
	    one: '???????? ??????',
	    two: '???????? ????????????',
	    other: '???????? {{count}} ????????'
	  }
	};
	function formatDistance$j(token, count, options) {
	  options = options || {}; // Return word instead of `in one day` or `one day ago`

	  if (token === 'xDays' && options.addSuffix && count <= 2) {
	    var past = {
	      1: '??????????',
	      2: '??????????'
	    };
	    var future = {
	      1: '??????',
	      2: '??????????????'
	    };
	    return options.comparison > 0 ? future[count] : past[count];
	  }

	  var result;

	  if (typeof formatDistanceLocale$i[token] === 'string') {
	    result = formatDistanceLocale$i[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$i[token].one;
	  } else if (count === 2) {
	    result = formatDistanceLocale$i[token].two;
	  } else {
	    result = formatDistanceLocale$i[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return '???????? ' + result;
	    } else {
	      return '???????? ' + result;
	    }
	  }

	  return result;
	}

	var dateFormats$j = {
	  full: 'EEEE, d ??MMMM y',
	  long: 'd ??MMMM y',
	  medium: 'd ??MMM y',
	  short: 'd.M.y'
	};
	var timeFormats$j = {
	  full: 'H:mm:ss zzzz',
	  long: 'H:mm:ss z',
	  medium: 'H:mm:ss',
	  short: 'H:mm'
	};
	var dateTimeFormats$j = {
	  full: "{{date}} '????????' {{time}}",
	  long: "{{date}} '????????' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$j = {
	  date: buildFormatLongFn({
	    formats: dateFormats$j,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$j,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$j,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$h = {
	  lastWeek: "eeee '???????? ????????' p",
	  yesterday: "'?????????? ????????' p",
	  today: "'???????? ????????' p",
	  tomorrow: "'?????? ????????' p",
	  nextWeek: "eeee '????????' p",
	  other: 'P'
	};
	function formatRelative$i(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$h[token];
	}

	var eraValues$h = {
	  narrow: ['????????????', '????????????'],
	  abbreviated: ['????????????', '????????????'],
	  wide: ['???????? ????????????', '????????????']
	};
	var quarterValues$h = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
	  wide: ['?????????? 1', '?????????? 2', '?????????? 3', '?????????? 4']
	};
	var monthValues$h = {
	  narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
	  abbreviated: ['????????', '????????', '??????', '????????', '??????', '????????', '????????', '????????', '????????', '????????', '????????', '????????'],
	  wide: ['??????????', '????????????', '??????', '??????????', '??????', '????????', '????????', '????????????', '????????????', '??????????????', '????????????', '??????????']
	};
	var dayValues$h = {
	  narrow: ['????', '????', '????', '????', '????', '????', '????'],
	  short: ['????', '????', '????', '????', '????', '????', '????'],
	  abbreviated: ['?????? ????', '?????? ????', '?????? ????', '?????? ????', '?????? ????', '?????? ????', '??????'],
	  wide: ['?????? ??????????', '?????? ??????', '?????? ??????????', '?????? ??????????', '?????? ??????????', '?????? ????????', '?????? ??????']
	};
	var dayPeriodValues$h = {
	  narrow: {
	    am: '????????????',
	    pm: '??????????',
	    midnight: '????????',
	    noon: '????????????',
	    morning: '????????',
	    afternoon: '?????? ??????????????',
	    evening: '??????',
	    night: '????????'
	  },
	  abbreviated: {
	    am: '????????????',
	    pm: '??????????',
	    midnight: '????????',
	    noon: '????????????',
	    morning: '????????',
	    afternoon: '?????? ??????????????',
	    evening: '??????',
	    night: '????????'
	  },
	  wide: {
	    am: '????????????',
	    pm: '??????????',
	    midnight: '????????',
	    noon: '????????????',
	    morning: '????????',
	    afternoon: '?????? ??????????????',
	    evening: '??????',
	    night: '????????'
	  }
	};
	var formattingDayPeriodValues$d = {
	  narrow: {
	    am: '????????????',
	    pm: '??????????',
	    midnight: '????????',
	    noon: '????????????',
	    morning: '??????????',
	    afternoon: '??????????????',
	    evening: '????????',
	    night: '??????????'
	  },
	  abbreviated: {
	    am: '????????????',
	    pm: '??????????',
	    midnight: '????????',
	    noon: '????????????',
	    morning: '??????????',
	    afternoon: '?????? ??????????????',
	    evening: '????????',
	    night: '??????????'
	  },
	  wide: {
	    am: '????????????',
	    pm: '??????????',
	    midnight: '????????',
	    noon: '????????????',
	    morning: '??????????',
	    afternoon: '?????? ??????????????',
	    evening: '????????',
	    night: '??????????'
	  }
	};

	function ordinalNumber$h(dirtyNumber, dirtyOptions) {
	  var number = Number(dirtyNumber); // We only show words till 10

	  if (number <= 0 || number > 10) return number;
	  var options = dirtyOptions || {};
	  var unit = String(options.unit);
	  var isFemale = ['year', 'hour', 'minute', 'second'].indexOf(unit) >= 0;
	  var male = ['??????????', '??????', '??????????', '??????????', '??????????', '????????', '??????????', '??????????', '??????????', '??????????'];
	  var female = ['????????????', '??????????', '????????????', '????????????', '????????????', '??????????', '????????????', '????????????', '????????????', '????????????'];
	  var index = number - 1;
	  return isFemale ? female[index] : male[index];
	}

	var localize$h = {
	  ordinalNumber: ordinalNumber$h,
	  era: buildLocalizeFn({
	    values: eraValues$h,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$h,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$h,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$h,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$h,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$d,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$h = /^(\d+|(??????????|??????|??????????|??????????|??????????|????????|??????????|??????????|??????????|??????????|????????????|??????????|????????????|????????????|????????????|??????????|????????????|????????????|????????????|????????????))/i;
	var parseOrdinalNumberPattern$h = /^(\d+|????|????|????|????|??|????|????|????|??|??)/i;
	var matchEraPatterns$h = {
	  narrow: /^??(??????????|??????????)/i,
	  abbreviated: /^??(??????????|??????????)/i,
	  wide: /^??(?????? ??)???????????/i
	};
	var parseEraPatterns$h = {
	  any: [/^????/i, /^????/i]
	};
	var matchQuarterPatterns$h = {
	  narrow: /^[1234]/i,
	  abbreviated: /^q[1234]/i,
	  wide: /^?????????? [1234]/i
	};
	var parseQuarterPatterns$h = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$h = {
	  narrow: /^\d+/i,
	  abbreviated: /^(??????|??????|??????|??????|??????|????????|????????|??????|??????|??????|??????|??????)???/i,
	  wide: /^(??????????|????????????|??????|??????????|??????|????????|????????|????????????|????????????|??????????????|????????????|??????????)/i
	};
	var parseMonthPatterns$h = {
	  narrow: [/^1$/i, /^2/i, /^3/i, /^4/i, /^5/i, /^6/i, /^7/i, /^8/i, /^9/i, /^10/i, /^11/i, /^12/i],
	  any: [/^????/i, /^??/i, /^????/i, /^????/i, /^????/i, /^??????/i, /^??????/i, /^??????/i, /^??/i, /^??????/i, /^??/i, /^??/i]
	};
	var matchDayPatterns$h = {
	  narrow: /^[??????????????]??/i,
	  short: /^[??????????????]??/i,
	  abbreviated: /^(??????|?????? (??|??|??|??|??|??)??)/i,
	  wide: /^?????? (??????????|??????|??????????|??????????|??????????|????????|??????)/i
	};
	var parseDayPatterns$h = {
	  abbreviated: [/????$/i, /????$/i, /????$/i, /????$/i, /????$/i, /????$/i, /^??/i],
	  wide: [/??$/i, /????$/i, /????????$/i, /????$/i, /????????$/i, /????????$/i, /??$/i],
	  any: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i]
	};
	var matchDayPeriodPatterns$h = {
	  any: /^(?????? ??|??)?(????????|????????????|????????|??????|????????|??????????|????????????)/i
	};
	var parseDayPeriodPatterns$h = {
	  any: {
	    am: /^????/i,
	    pm: /^??????/i,
	    midnight: /^??/i,
	    noon: /^??/i,
	    morning: /????????/i,
	    afternoon: /????|??????/i,
	    evening: /??????/i,
	    night: /????????/i
	  }
	};
	var ordinalName = ['????', '????', '????', '????', '??', '????', '????', '????', '??', '??'];
	var match$h = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$h,
	    parsePattern: parseOrdinalNumberPattern$h,
	    valueCallback: function (value) {
	      var number = parseInt(value, 10);
	      return isNaN(number) ? ordinalName.indexOf(value) + 1 : number;
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$h,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$h,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$h,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$h,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$h,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$h,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$h,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$h,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$h,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$h,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Hebrew locale.
	 * @language Hebrew
	 * @iso-639-2 heb
	 * @author Nir Lahad [@nirlah]{@link https://github.com/nirlah}
	 */

	var locale$j = {
	  formatDistance: formatDistance$j,
	  formatLong: formatLong$j,
	  formatRelative: formatRelative$i,
	  localize: localize$h,
	  match: match$h,
	  options: {
	    weekStartsOn: 0
	    /* Sunday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	var translations = {
	  about: 'k??r??lbel??l',
	  over: 't??bb mint',
	  almost: 'majdnem',
	  lessthan: 'kevesebb mint'
	};

	function translate(number, addSuffix, key, comparison) {
	  var num = number;

	  switch (key) {
	    case 'xseconds':
	      if (comparison === -1 && addSuffix) return num + ' m??sodperccel ezel??tt';
	      if (comparison === -1 && !addSuffix) return num + ' m??sodperce';
	      if (comparison === 1) return num + ' m??sodperc m??lva';
	      return num + ' m??sodperc';

	    case 'halfaminute':
	      if (comparison === -1 && addSuffix) return 'f??l perccel ezel??tt';
	      if (comparison === -1 && !addSuffix) return 'f??l perce';
	      if (comparison === 1) return 'f??l perc m??lva';
	      return 'f??l perc';

	    case 'xminutes':
	      if (comparison === -1 && addSuffix) return num + ' perccel ezel??tt';
	      if (comparison === -1 && !addSuffix) return num + ' perce';
	      if (comparison === 1) return num + ' perc m??lva';
	      return num + ' perc';

	    case 'xhours':
	      if (comparison === -1 && addSuffix) return num + ' ??r??val ezel??tt';
	      if (comparison === -1 && !addSuffix) return num + ' ??r??ja';
	      if (comparison === 1) return num + ' ??ra m??lva';
	      return num + ' ??ra';

	    case 'xdays':
	      if (comparison === -1 && addSuffix) return num + ' nappal ezel??tt';
	      if (comparison === -1 && !addSuffix) return num + ' napja';
	      if (comparison === 1) return num + ' nap m??lva';
	      return num + ' nap';

	    case 'xmonths':
	      if (comparison === -1 && addSuffix) return num + ' h??nappal ezel??tt';
	      if (comparison === -1 && !addSuffix) return num + ' h??napja';
	      if (comparison === 1) return num + ' h??nap m??lva';
	      return num + ' h??nap';

	    case 'xyears':
	      if (comparison === -1 && addSuffix) return num + ' ??vvel ezel??tt';
	      if (comparison === -1 && !addSuffix) return num + ' ??ve';
	      if (comparison === 1) return num + ' ??v m??lva';
	      return num + ' ??v';
	  }

	  return '';
	}

	function formatDistance$k(token, count, options) {
	  options = options || {};
	  var adverb = token.match(/about|over|almost|lessthan/i);
	  var unit = token.replace(adverb, '');
	  var result;
	  result = translate(count, options.addSuffix, unit.toLowerCase(), options.comparison);

	  if (adverb) {
	    result = translations[adverb[0].toLowerCase()] + ' ' + result;
	  }

	  return result;
	}

	var dateFormats$k = {
	  full: 'y. MMMM d., EEEE',
	  long: 'y. MMMM d.',
	  medium: 'y. MMM d.',
	  short: 'y. MM. dd.'
	};
	var timeFormats$k = {
	  full: 'H:mm:ss zzzz',
	  long: 'H:mm:ss z',
	  medium: 'H:mm:ss',
	  short: 'H:mm'
	};
	var dateTimeFormats$k = {
	  full: '{{date}} {{time}}',
	  long: '{{date}} {{time}}',
	  medium: '{{date}} {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$k = {
	  date: buildFormatLongFn({
	    formats: dateFormats$k,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$k,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$k,
	    defaultWidth: 'full'
	  })
	};

	var accusativeWeekdays$2 = ['vas??rnap', 'h??tf??n', 'kedden', 'szerd??n', 'cs??t??rt??k??n', 'p??nteken', 'szombaton'];

	function week(isFuture) {
	  return function (date, _baseDate, _options) {
	    var day = date.getUTCDay();
	    return (isFuture ? '' : "'m??lt' ") + "'" + accusativeWeekdays$2[day] + "'" + " p'-kor'";
	  };
	}

	var formatRelativeLocale$i = {
	  lastWeek: week(false),
	  yesterday: "'tegnap' p'-kor'",
	  today: "'ma' p'-kor'",
	  tomorrow: "'holnap' p'-kor'",
	  nextWeek: week(true),
	  other: 'P'
	};
	function formatRelative$j(token, date, baseDate, options) {
	  var format = formatRelativeLocale$i[token];

	  if (typeof format === 'function') {
	    return format(date, baseDate, options);
	  }

	  return format;
	}

	var eraValues$i = {
	  narrow: ['ie.', 'isz.'],
	  abbreviated: ['i. e.', 'i. sz.'],
	  wide: ['Krisztus el??tt', 'id??sz??m??t??sunk szerint']
	};
	var quarterValues$i = {
	  narrow: ['1.', '2.', '3.', '4.'],
	  abbreviated: ['1. n.??v', '2. n.??v', '3. n.??v', '4. n.??v'],
	  wide: ['1. negyed??v', '2. negyed??v', '3. negyed??v', '4. negyed??v']
	};
	var formattingQuarterValues = {
	  narrow: ['I.', 'II.', 'III.', 'IV.'],
	  abbreviated: ['I. n.??v', 'II. n.??v', 'III. n.??v', 'IV. n.??v'],
	  wide: ['I. negyed??v', 'II. negyed??v', 'III. negyed??v', 'IV. negyed??v']
	};
	var monthValues$i = {
	  narrow: ['J', 'F', 'M', '??', 'M', 'J', 'J', 'A', 'Sz', 'O', 'N', 'D'],
	  abbreviated: ['jan.', 'febr.', 'm??rc.', '??pr.', 'm??j.', 'j??n.', 'j??l.', 'aug.', 'szept.', 'okt.', 'nov.', 'dec.'],
	  wide: ['janu??r', 'febru??r', 'm??rcius', '??prilis', 'm??jus', 'j??nius', 'j??lius', 'augusztus', 'szeptember', 'okt??ber', 'november', 'december']
	};
	var dayValues$i = {
	  narrow: ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'],
	  short: ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'],
	  abbreviated: ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'],
	  wide: ['vas??rnap', 'h??tf??', 'kedd', 'szerda', 'cs??t??rt??k', 'p??ntek', 'szombat']
	};
	var dayPeriodValues$i = {
	  narrow: {
	    am: 'de.',
	    pm: 'du.',
	    midnight: '??jf??l',
	    noon: 'd??l',
	    morning: 'reggel',
	    afternoon: 'du.',
	    evening: 'este',
	    night: '??jjel'
	  },
	  abbreviated: {
	    am: 'de.',
	    pm: 'du.',
	    midnight: '??jf??l',
	    noon: 'd??l',
	    morning: 'reggel',
	    afternoon: 'du.',
	    evening: 'este',
	    night: '??jjel'
	  },
	  wide: {
	    am: 'de.',
	    pm: 'du.',
	    midnight: '??jf??l',
	    noon: 'd??l',
	    morning: 'reggel',
	    afternoon: 'd??lut??n',
	    evening: 'este',
	    night: '??jjel'
	  }
	};

	function ordinalNumber$i(dirtyNumber, _dirtyOptions) {
	  var number = Number(dirtyNumber);
	  return number + '.';
	}

	var localize$i = {
	  ordinalNumber: ordinalNumber$i,
	  era: buildLocalizeFn({
	    values: eraValues$i,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$i,
	    defaultWidth: 'wide',
	    formattingValues: formattingQuarterValues,
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$i,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$i,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$i,
	    defaultWidth: 'wide',
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$i = /^(\d+)\.?/i;
	var parseOrdinalNumberPattern$i = /\d+/i;
	var matchEraPatterns$i = {
	  narrow: /^(ie\.|isz\.)/i,
	  abbreviated: /^(i\.\s?e\.?|b?\s?c\s?e|i\.\s?sz\.?)/i,
	  wide: /^(Krisztus el??tt|id??sz??m??t??sunk el??tt|id??sz??m??t??sunk szerint|i\. sz\.)/i
	};
	var parseEraPatterns$i = {
	  narrow: [/ie/i, /isz/i],
	  abbreviated: [/^(i\.?\s?e\.?|b\s?ce)/i, /^(i\.?\s?sz\.?|c\s?e)/i],
	  any: [/el??tt/i, /(szerint|i. sz.)/i]
	};
	var matchQuarterPatterns$i = {
	  narrow: /^[1234]\.?/i,
	  abbreviated: /^[1234]?\.?\s?n\.??v/i,
	  wide: /^([1234]|I|II|III|IV)?\.?\s?negyed??v/i
	};
	var parseQuarterPatterns$i = {
	  any: [/1|I$/i, /2|II$/i, /3|III/i, /4|IV/i]
	};
	var matchMonthPatterns$i = {
	  narrow: /^[jfma??sond]|sz/i,
	  abbreviated: /^(jan\.?|febr\.?|m??rc\.?|??pr\.?|m??j\.?|j??n\.?|j??l\.?|aug\.?|szept\.?|okt\.?|nov\.?|dec\.?)/i,
	  wide: /^(janu??r|febru??r|m??rcius|??prilis|m??jus|j??nius|j??lius|augusztus|szeptember|okt??ber|november|december)/i
	};
	var parseMonthPatterns$i = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a|??/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s|sz/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^f/i, /^m??r/i, /^??p/i, /^m??j/i, /^j??n/i, /^j??l/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$i = {
	  narrow: /^([vhkpc]|sz|cs|sz)/i,
	  short: /^([vhkp]|sze|cs|szo)/i,
	  abbreviated: /^([vhkp]|sze|cs|szo)/i,
	  wide: /^(vas??rnap|h??tf??|kedd|szerda|cs??t??rt??k|p??ntek|szombat)/i
	};
	var parseDayPatterns$i = {
	  narrow: [/^v/i, /^h/i, /^k/i, /^sz/i, /^c/i, /^p/i, /^sz/i],
	  any: [/^v/i, /^h/i, /^k/i, /^sze/i, /^c/i, /^p/i, /^szo/i]
	};
	var matchDayPeriodPatterns$i = {
	  any: /^((de|du)\.?|??jf??l|d??lut??n|d??l|reggel|este|??jjel)/i
	};
	var parseDayPeriodPatterns$i = {
	  any: {
	    am: /^de\.?/i,
	    pm: /^du\.?/i,
	    midnight: /^??jf/i,
	    noon: /^d??/i,
	    morning: /reg/i,
	    afternoon: /^d??lu\.?/i,
	    evening: /es/i,
	    night: /??jj/i
	  }
	};
	var match$i = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$i,
	    parsePattern: parseOrdinalNumberPattern$i,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$i,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$i,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$i,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$i,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$i,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$i,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$i,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$i,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$i,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$i,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 *
	 * @summary Hungarian locale.
	 * @language Hungarian
	 *
	 * @iso-639-2 hun
	 *
	 * @author Pavlo Shpak [@pshpak]{@link https://github.com/pshpak}
	 * @author Eduardo Pardo [@eduardopsll]{@link https://github.com/eduardopsll}
	 * @author Zoltan Szepesi [@twodcube]{@link https://github.com/twodcube}
	 */

	var locale$k = {
	  formatDistance: formatDistance$k,
	  formatLong: formatLong$k,
	  formatRelative: formatRelative$j,
	  localize: localize$i,
	  match: match$i,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$j = {
	  lessThanXSeconds: {
	    one: 'kurang dari 1 detik',
	    other: 'kurang dari {{count}} detik'
	  },
	  xSeconds: {
	    one: '1 detik',
	    other: '{{count}} detik'
	  },
	  halfAMinute: 'setengah menit',
	  lessThanXMinutes: {
	    one: 'kurang dari 1 menit',
	    other: 'kurang dari {{count}} menit'
	  },
	  xMinutes: {
	    one: '1 menit',
	    other: '{{count}} menit'
	  },
	  aboutXHours: {
	    one: 'sekitar 1 jam',
	    other: 'sekitar {{count}} jam'
	  },
	  xHours: {
	    one: '1 jam',
	    other: '{{count}} jam'
	  },
	  xDays: {
	    one: '1 hari',
	    other: '{{count}} hari'
	  },
	  aboutXMonths: {
	    one: 'sekitar 1 bulan',
	    other: 'sekitar {{count}} bulan'
	  },
	  xMonths: {
	    one: '1 bulan',
	    other: '{{count}} bulan'
	  },
	  aboutXYears: {
	    one: 'sekitar 1 tahun',
	    other: 'sekitar {{count}} tahun'
	  },
	  xYears: {
	    one: '1 tahun',
	    other: '{{count}} tahun'
	  },
	  overXYears: {
	    one: 'lebih dari 1 tahun',
	    other: 'lebih dari {{count}} tahun'
	  },
	  almostXYears: {
	    one: 'hampir 1 tahun',
	    other: 'hampir {{count}} tahun'
	  }
	};
	function formatDistance$l(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$j[token] === 'string') {
	    result = formatDistanceLocale$j[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$j[token].one;
	  } else {
	    result = formatDistanceLocale$j[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'dalam waktu ' + result;
	    } else {
	      return result + ' yang lalu';
	    }
	  }

	  return result;
	}

	var dateFormats$l = {
	  full: 'EEEE, d MMMM yyyy',
	  long: 'd MMMM yyyy',
	  medium: 'd MMM yyyy',
	  short: 'd/M/yyyy'
	};
	var timeFormats$l = {
	  full: 'HH.mm.ss',
	  long: 'HH.mm.ss',
	  medium: 'HH.mm',
	  short: 'HH.mm'
	};
	var dateTimeFormats$l = {
	  full: "{{date}} 'pukul' {{time}}",
	  long: "{{date}} 'pukul' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$l = {
	  date: buildFormatLongFn({
	    formats: dateFormats$l,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$l,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$l,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$j = {
	  lastWeek: "eeee 'lalu pukul' p",
	  yesterday: "'Kemarin pukul' p",
	  today: "'Hari ini pukul' p",
	  tomorrow: "'Besok pukul' p",
	  nextWeek: "eeee 'pukul' p",
	  other: 'P'
	};
	function formatRelative$k(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$j[token];
	}

	// https://www.unicode.org/cldr/charts/32/summary/id.html

	var eraValues$j = {
	  narrow: ['SM', 'M'],
	  abbreviated: ['SM', 'M'],
	  wide: ['Sebelum Masehi', 'Masehi']
	};
	var quarterValues$j = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['K1', 'K2', 'K3', 'K4'],
	  wide: ['Kuartal ke-1', 'Kuartal ke-2', 'Kuartal ke-3', 'Kuartal ke-4'] // Note: in Indonesian, the names of days of the week and months are capitalized.
	  // If you are making a new locale based on this one, check if the same is true for the language you're working on.
	  // Generally, formatted dates should look like they are in the middle of a sentence,
	  // e.g. in Spanish language the weekdays and months should be in the lowercase.

	};
	var monthValues$j = {
	  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
	  wide: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
	};
	var dayValues$j = {
	  narrow: ['M', 'S', 'S', 'R', 'K', 'J', 'S'],
	  short: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
	  abbreviated: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
	  wide: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
	};
	var dayPeriodValues$j = {
	  narrow: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'tengah malam',
	    noon: 'tengah hari',
	    morning: 'pagi',
	    afternoon: 'siang',
	    evening: 'sore',
	    night: 'malam'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'tengah malam',
	    noon: 'tengah hari',
	    morning: 'pagi',
	    afternoon: 'siang',
	    evening: 'sore',
	    night: 'malam'
	  },
	  wide: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'tengah malam',
	    noon: 'tengah hari',
	    morning: 'pagi',
	    afternoon: 'siang',
	    evening: 'sore',
	    night: 'malam'
	  }
	};
	var formattingDayPeriodValues$e = {
	  narrow: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'tengah malam',
	    noon: 'tengah hari',
	    morning: 'pagi',
	    afternoon: 'siang',
	    evening: 'sore',
	    night: 'malam'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'tengah malam',
	    noon: 'tengah hari',
	    morning: 'pagi',
	    afternoon: 'siang',
	    evening: 'sore',
	    night: 'malam'
	  },
	  wide: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'tengah malam',
	    noon: 'tengah hari',
	    morning: 'pagi',
	    afternoon: 'siang',
	    evening: 'sore',
	    night: 'malam'
	  }
	};

	function ordinalNumber$j(dirtyNumber, _dirtyOptions) {
	  var number = Number(dirtyNumber); // Can't use "pertama", "kedua" because can't be parsed

	  switch (number) {
	    default:
	      return 'ke-' + number;
	  }
	}

	var localize$j = {
	  ordinalNumber: ordinalNumber$j,
	  era: buildLocalizeFn({
	    values: eraValues$j,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$j,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$j,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$j,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$j,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$e,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$j = /^ke-(\d+)?/i;
	var parseOrdinalNumberPattern$j = /\d+/i;
	var matchEraPatterns$j = {
	  narrow: /^(sm|m)/i,
	  abbreviated: /^(s\.?\s?m\.?|s\.?\s?e\.?\s?u\.?|m\.?|e\.?\s?u\.?)/i,
	  wide: /^(sebelum masehi|sebelum era umum|masehi|era umum)/i
	};
	var parseEraPatterns$j = {
	  any: [/^s/i, /^(m|e)/i]
	};
	var matchQuarterPatterns$j = {
	  narrow: /^[1234]/i,
	  abbreviated: /^K-?\s[1234]/i,
	  wide: /^Kuartal ke-?\s?[1234]/i
	};
	var parseQuarterPatterns$j = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$j = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(jan|feb|mar|apr|mei|jun|jul|agt|sep|okt|nov|des)/i,
	  wide: /^(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)/i
	};
	var parseMonthPatterns$j = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^f/i, /^ma/i, /^ap/i, /^me/i, /^jun/i, /^jul/i, /^ag/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$j = {
	  narrow: /^[srkjm]/i,
	  short: /^(min|sen|sel|rab|kam|jum|sab)/i,
	  abbreviated: /^(min|sen|sel|rab|kam|jum|sab)/i,
	  wide: /^(minggu|senin|selasa|rabu|kamis|jumat|sabtu)/i
	};
	var parseDayPatterns$j = {
	  narrow: [/^m/i, /^s/i, /^s/i, /^r/i, /^k/i, /^j/i, /^s/i],
	  any: [/^m/i, /^sen/i, /^sel/i, /^r/i, /^k/i, /^j/i, /^sa/i]
	};
	var matchDayPeriodPatterns$j = {
	  narrow: /^(a|p|tengah m|tengah h|(di(\swaktu)?) (pagi|siang|sore|malam))/i,
	  any: /^([ap]\.?\s?m\.?|tengah malam|tengah hari|(di(\swaktu)?) (pagi|siang|sore|malam))/i
	};
	var parseDayPeriodPatterns$j = {
	  any: {
	    am: /^a/i,
	    pm: /^pm/i,
	    midnight: /^tengah m/i,
	    noon: /^tengah h/i,
	    morning: /pagi/i,
	    afternoon: /siang/i,
	    evening: /sore/i,
	    night: /malam/i
	  }
	};
	var match$j = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$j,
	    parsePattern: parseOrdinalNumberPattern$j,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$j,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$j,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$j,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$j,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$j,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$j,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$j,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$j,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$j,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$j,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Indonesian locale.
	 * @language Indonesian
	 * @iso-639-2 ind
	 * @author Rahmat Budiharso [@rbudiharso]{@link https://github.com/rbudiharso}
	 * @author Benget Nata [@bentinata]{@link https://github.com/bentinata}
	 * @author Budi Irawan [@deerawan]{@link https://github.com/deerawan}
	 * @author Try Ajitiono [@imballinst]{@link https://github.com/imballinst}
	 */

	var locale$l = {
	  formatDistance: formatDistance$l,
	  formatLong: formatLong$l,
	  formatRelative: formatRelative$k,
	  localize: localize$j,
	  match: match$j,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	var formatDistanceLocale$k = {
	  lessThanXSeconds: {
	    one: 'minna en 1 sek??nda',
	    other: 'minna en {{count}} sek??ndur'
	  },
	  xSeconds: {
	    one: '1 sek??nda',
	    other: '{{count}} sek??ndur'
	  },
	  halfAMinute: 'h??lf m??n??ta',
	  lessThanXMinutes: {
	    one: 'minna en 1 m??n??ta',
	    other: 'minna en {{count}} m??n??tur'
	  },
	  xMinutes: {
	    one: '1 m??n??ta',
	    other: '{{count}} m??n??tur'
	  },
	  aboutXHours: {
	    one: 'u.??.b. 1 klukkustund',
	    other: 'u.??.b. {{count}} klukkustundir'
	  },
	  xHours: {
	    one: '1 klukkustund',
	    other: '{{count}} klukkustundir'
	  },
	  xDays: {
	    one: '1 dagur',
	    other: '{{count}} dagar'
	  },
	  aboutXMonths: {
	    one: 'u.??.b. 1 m??nu??ur',
	    other: 'u.??.b. {{count}} m??nu??ir'
	  },
	  xMonths: {
	    one: '1 m??nu??ur',
	    other: '{{count}} m??nu??ir'
	  },
	  aboutXYears: {
	    one: 'u.??.b. 1 ??r',
	    other: 'u.??.b. {{count}} ??r'
	  },
	  xYears: {
	    one: '1 ??r',
	    other: '{{count}} ??r'
	  },
	  overXYears: {
	    one: 'meira en 1 ??r',
	    other: 'meira en {{count}} ??r'
	  },
	  almostXYears: {
	    one: 'n??stum 1 ??r',
	    other: 'n??stum {{count}} ??r'
	  }
	};
	function formatDistance$m(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$k[token] === 'string') {
	    result = formatDistanceLocale$k[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$k[token].one;
	  } else {
	    result = formatDistanceLocale$k[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return '?? ' + result;
	    } else {
	      return result + ' s????an';
	    }
	  }

	  return result;
	}

	var dateFormats$m = {
	  full: 'EEEE, do MMMM y',
	  long: 'do MMMM y',
	  medium: 'do MMM y',
	  short: 'd.MM.y'
	};
	var timeFormats$m = {
	  full: "'kl'. HH:mm:ss zzzz",
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$m = {
	  full: "{{date}} 'kl.' {{time}}",
	  long: "{{date}} 'kl.' {{time}}",
	  medium: '{{date}} {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$m = {
	  date: buildFormatLongFn({
	    formats: dateFormats$m,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$m,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$m,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$k = {
	  lastWeek: "'s????asta' dddd 'kl.' p",
	  yesterday: "'?? g??r kl.' p",
	  today: "'?? dag kl.' p",
	  tomorrow: "'?? morgun kl.' p",
	  nextWeek: "dddd 'kl.' p",
	  other: 'L'
	};
	function formatRelative$l(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$k[token];
	}

	var eraValues$k = {
	  narrow: ['f.Kr.', 'e.Kr.'],
	  abbreviated: ['f.Kr.', 'e.Kr.'],
	  wide: ['fyrir Krist', 'eftir Krist']
	};
	var quarterValues$k = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['1F', '2F', '3F', '4F'],
	  wide: ['1. fj??r??ungur', '2. fj??r??ungur', '3. fj??r??ungur', '4. fj??r??ungur']
	};
	var monthValues$k = {
	  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', '??', 'S', '??', 'N', 'D'],
	  abbreviated: ['jan.', 'feb.', 'mars', 'apr??l', 'ma??', 'j??n??', 'j??l??', '??g??st', 'sept.', 'okt.', 'n??v.', 'des.'],
	  wide: ['jan??ar', 'febr??ar', 'mars', 'apr??l', 'ma??', 'j??n??', 'j??l??', '??g??st', 'september', 'okt??ber', 'n??vember', 'desember']
	};
	var dayValues$k = {
	  narrow: ['S', 'M', '??', 'M', 'F', 'F', 'L'],
	  short: ['Su', 'M??', '??r', 'Mi', 'Fi', 'F??', 'La'],
	  abbreviated: ['sun.', 'm??n.', '??ri.', 'mi??.', 'fim.', 'f??s.', 'lau'],
	  wide: ['sunnudagur', 'm??nudagur', '??ri??judagur', 'mi??vikudagur', 'fimmtudagur', 'f??studagur', 'laugardagur']
	};
	var dayPeriodValues$k = {
	  narrow: {
	    am: 'f',
	    pm: 'e',
	    midnight: 'mi??n??tti',
	    noon: 'h??degi',
	    morning: 'morgunn',
	    afternoon: 's????degi',
	    evening: 'kv??ld',
	    night: 'n??tt'
	  },
	  abbreviated: {
	    am: 'f.h.',
	    pm: 'e.h.',
	    midnight: 'mi??n??tti',
	    noon: 'h??degi',
	    morning: 'morgunn',
	    afternoon: 's????degi',
	    evening: 'kv??ld',
	    night: 'n??tt'
	  },
	  wide: {
	    am: 'fyrir h??degi',
	    pm: 'eftir h??degi',
	    midnight: 'mi??n??tti',
	    noon: 'h??degi',
	    morning: 'morgunn',
	    afternoon: 's????degi',
	    evening: 'kv??ld',
	    night: 'n??tt'
	  }
	};
	var formattingDayPeriodValues$f = {
	  narrow: {
	    am: 'f',
	    pm: 'e',
	    midnight: '?? mi??n??tti',
	    noon: '?? h??degi',
	    morning: 'a?? morgni',
	    afternoon: 's????degis',
	    evening: 'um kv??ld',
	    night: 'um n??tt'
	  },
	  abbreviated: {
	    am: 'f.h.',
	    pm: 'e.h.',
	    midnight: '?? mi??n??tti',
	    noon: '?? h??degi',
	    morning: 'a?? morgni',
	    afternoon: 's????degis',
	    evening: 'um kv??ld',
	    night: 'um n??tt'
	  },
	  wide: {
	    am: 'fyrir h??degi',
	    pm: 'eftir h??degi',
	    midnight: '?? mi??n??tti',
	    noon: '?? h??degi',
	    morning: 'a?? morgni',
	    afternoon: 's????degis',
	    evening: 'um kv??ld',
	    night: 'um n??tt'
	  }
	};

	function ordinalNumber$k(dirtyNumber, _dirtyOptions) {
	  var number = Number(dirtyNumber);
	  return number + '.';
	}

	var localize$k = {
	  ordinalNumber: ordinalNumber$k,
	  era: buildLocalizeFn({
	    values: eraValues$k,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$k,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$k,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$k,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$k,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$f,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$k = /^(\d+)(th|st|nd|rd)?/i;
	var parseOrdinalNumberPattern$k = /\d+/i;
	var matchEraPatterns$k = {
	  narrow: /^(f\.Kr\.|e\.Kr\.)/i,
	  abbreviated: /^(f\.Kr\.|e\.Kr\.)/i,
	  wide: /^(fyrir Krist|eftir Krist)/i
	};
	var parseEraPatterns$k = {
	  any: [/^(f\.Kr\.|e\.Kr\.)/i]
	};
	var matchQuarterPatterns$k = {
	  narrow: /^[1234]/i,
	  abbreviated: /^q[1234]/i,
	  wide: /^[1234] fj??r??ungur/i
	};
	var parseQuarterPatterns$k = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$k = {
	  narrow: /^[jfm??s??nd]/i,
	  abbreviated: /^(jan\.|feb\.|mars\.|apr??l\.|ma??|j??n??|j??l??|??gust|sep\.|oct\.|nov\.|dec\.)/i,
	  wide: /^(januar|februar|mars|apr??l|ma??|j??n??|j??l??|??gust|september|okt??ber|n??vember|desember)/i
	};
	var parseMonthPatterns$k = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^??/i, /^s/i, /^??/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^ma??/i, /^j??n/i, /^j??l/i, /^??u/i, /^s/i, /^??/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$k = {
	  narrow: /^[smtwf]/i,
	  short: /^(su|m??|??r|mi|fi|f??|la)/i,
	  abbreviated: /^(sun|m??n|??ri|mi??|fim|f??s|lau)\.?/i,
	  wide: /^(sunnudagur|m??nudagur|??ri??judagur|mi??vikudagur|fimmtudagur|f??studagur|laugardagur)/i
	};
	var parseDayPatterns$k = {
	  narrow: [/^s/i, /^m/i, /^??/i, /^m/i, /^f/i, /^f/i, /^l/i],
	  any: [/^su/i, /^m??/i, /^??r/i, /^mi/i, /^fi/i, /^f??/i, /^la/i]
	};
	var matchDayPeriodPatterns$k = {
	  narrow: /^(f|e|s????degis|(??|a??|um) (morgni|kv??ld|n??tt|mi??n??tti))/i,
	  any: /^(fyrir h??degi|eftir h??degi|[ef]\.?h\.?|s????degis|morgunn|(??|a??|um) (morgni|kv??ld|n??tt|mi??n??tti))/i
	};
	var parseDayPeriodPatterns$k = {
	  any: {
	    am: /^f/i,
	    pm: /^e/i,
	    midnight: /^mi/i,
	    noon: /^h??/i,
	    morning: /morgunn/i,
	    afternoon: /s????degi/i,
	    evening: /kv??ld/i,
	    night: /n??tt/i
	  }
	};
	var match$k = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$k,
	    parsePattern: parseOrdinalNumberPattern$k,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$k,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$k,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$k,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$k,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$k,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$k,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$k,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$k,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$k,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$k,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Icelandic locale.
	 * @language Icelandic
	 * @iso-639-2 isl
	 * @author Derek Blank [@derekblank]{@link https://github.com/derekblank}
	 * @author Arn??r ??mir [@lamayg]{@link https://github.com/lamayg}
	 */

	var locale$m = {
	  formatDistance: formatDistance$m,
	  formatLong: formatLong$m,
	  formatRelative: formatRelative$l,
	  localize: localize$k,
	  match: match$k,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$l = {
	  lessThanXSeconds: {
	    one: 'meno di un secondo',
	    other: 'meno di {{count}} secondi'
	  },
	  xSeconds: {
	    one: 'un secondo',
	    other: '{{count}} secondi'
	  },
	  halfAMinute: 'alcuni secondi',
	  lessThanXMinutes: {
	    one: 'meno di un minuto',
	    other: 'meno di {{count}} minuti'
	  },
	  xMinutes: {
	    one: 'un minuto',
	    other: '{{count}} minuti'
	  },
	  aboutXHours: {
	    one: 'circa un\'ora',
	    other: 'circa {{count}} ore'
	  },
	  xHours: {
	    one: 'un\'ora',
	    other: '{{count}} ore'
	  },
	  xDays: {
	    one: 'un giorno',
	    other: '{{count}} giorni'
	  },
	  aboutXMonths: {
	    one: 'circa un mese',
	    other: 'circa {{count}} mesi'
	  },
	  xMonths: {
	    one: 'un mese',
	    other: '{{count}} mesi'
	  },
	  aboutXYears: {
	    one: 'circa un anno',
	    other: 'circa {{count}} anni'
	  },
	  xYears: {
	    one: 'un anno',
	    other: '{{count}} anni'
	  },
	  overXYears: {
	    one: 'pi?? di un anno',
	    other: 'pi?? di {{count}} anni'
	  },
	  almostXYears: {
	    one: 'quasi un anno',
	    other: 'quasi {{count}} anni'
	  }
	};
	function formatDistance$n(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$l[token] === 'string') {
	    result = formatDistanceLocale$l[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$l[token].one;
	  } else {
	    result = formatDistanceLocale$l[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'tra ' + result;
	    } else {
	      return result + ' fa';
	    }
	  }

	  return result;
	}

	var dateFormats$n = {
	  full: 'EEEE d MMMM y',
	  long: 'd MMMM y',
	  medium: 'd MMM y',
	  short: 'dd/MM/y'
	};
	var timeFormats$n = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$n = {
	  full: '{{date}} {{time}}',
	  long: '{{date}} {{time}}',
	  medium: '{{date}} {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$n = {
	  date: buildFormatLongFn({
	    formats: dateFormats$n,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$n,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$n,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$l = {
	  lastWeek: "eeee 'scorso alle' p",
	  yesterday: "'ieri alle' p",
	  today: "'oggi alle' p",
	  tomorrow: "'domani alle' p",
	  nextWeek: "eeee 'alle' p",
	  other: 'P'
	};
	function formatRelative$m(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$l[token];
	}

	var eraValues$l = {
	  narrow: ['aC', 'dC'],
	  abbreviated: ['a.C.', 'd.C.'],
	  wide: ['avanti Cristo', 'dopo Cristo']
	};
	var quarterValues$l = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['T1', 'T2', 'T3', 'T4'],
	  wide: ['1?? trimestre', '2?? trimestre', '3?? trimestre', '4?? trimestre']
	};
	var monthValues$l = {
	  narrow: ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
	  wide: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
	};
	var dayValues$l = {
	  narrow: ['D', 'L', 'M', 'M', 'G', 'V', 'S'],
	  short: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
	  abbreviated: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
	  wide: ['domenica', 'luned??', 'marted??', 'mercoled??', 'gioved??', 'venerd??', 'sabato']
	};
	var dayPeriodValues$l = {
	  narrow: {
	    am: 'm.',
	    pm: 'p.',
	    midnight: 'mezzanotte',
	    noon: 'mezzogiorno',
	    morning: 'mattina',
	    afternoon: 'pomeriggio',
	    evening: 'sera',
	    night: 'notte'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'mezzanotte',
	    noon: 'mezzogiorno',
	    morning: 'mattina',
	    afternoon: 'pomeriggio',
	    evening: 'sera',
	    night: 'notte'
	  },
	  wide: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'mezzanotte',
	    noon: 'mezzogiorno',
	    morning: 'mattina',
	    afternoon: 'pomeriggio',
	    evening: 'sera',
	    night: 'notte'
	  }
	};
	var formattingDayPeriodValues$g = {
	  narrow: {
	    am: 'm.',
	    pm: 'p.',
	    midnight: 'mezzanotte',
	    noon: 'mezzogiorno',
	    morning: 'di mattina',
	    afternoon: 'del pomeriggio',
	    evening: 'di sera',
	    night: 'di notte'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'mezzanotte',
	    noon: 'mezzogiorno',
	    morning: 'di mattina',
	    afternoon: 'del pomeriggio',
	    evening: 'di sera',
	    night: 'di notte'
	  },
	  wide: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'mezzanotte',
	    noon: 'mezzogiorno',
	    morning: 'di mattina',
	    afternoon: 'del pomeriggio',
	    evening: 'di sera',
	    night: 'di notte'
	  }
	};

	function ordinalNumber$l(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return number + '??';
	}

	var localize$l = {
	  ordinalNumber: ordinalNumber$l,
	  era: buildLocalizeFn({
	    values: eraValues$l,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$l,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$l,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$l,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$l,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$g,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$l = /^(\d+)(??)?/i;
	var parseOrdinalNumberPattern$l = /\d+/i;
	var matchEraPatterns$l = {
	  narrow: /^(aC|dC)/i,
	  abbreviated: /^(a\.?\s?C\.?|a\.?\s?e\.?\s?v\.?|d\.?\s?C\.?|e\.?\s?v\.?)/i,
	  wide: /^(avanti Cristo|avanti Era Volgare|dopo Cristo|Era Volgare)/i
	};
	var parseEraPatterns$l = {
	  any: [/^a/i, /^(d|e)/i]
	};
	var matchQuarterPatterns$l = {
	  narrow: /^[1234]/i,
	  abbreviated: /^t[1234]/i,
	  wide: /^[1234](??)? trimestre/i
	};
	var parseQuarterPatterns$l = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$l = {
	  narrow: /^[gfmalsond]/i,
	  abbreviated: /^(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)/i,
	  wide: /^(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i
	};
	var parseMonthPatterns$l = {
	  narrow: [/^g/i, /^f/i, /^m/i, /^a/i, /^m/i, /^g/i, /^l/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ge/i, /^f/i, /^mar/i, /^ap/i, /^mag/i, /^gi/i, /^l/i, /^ag/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$l = {
	  narrow: /^[dlmgvs]/i,
	  short: /^(do|lu|ma|me|gi|ve|sa)/i,
	  abbreviated: /^(dom|lun|mar|mer|gio|ven|sab)/i,
	  wide: /^(domenica|luned[i|??]|marted[i|??]|mercoled[i|??]|gioved[i|??]|venerd[i|??]|sabato)/i
	};
	var parseDayPatterns$l = {
	  narrow: [/^d/i, /^l/i, /^m/i, /^m/i, /^g/i, /^v/i, /^s/i],
	  any: [/^d/i, /^l/i, /^ma/i, /^me/i, /^g/i, /^v/i, /^s/i]
	};
	var matchDayPeriodPatterns$l = {
	  narrow: /^(a|m\.|p|mezzanotte|mezzogiorno|(di|del) (mattina|pomeriggio|sera|notte))/i,
	  any: /^([ap]\.?\s?m\.?|mezzanotte|mezzogiorno|(di|del) (mattina|pomeriggio|sera|notte))/i
	};
	var parseDayPeriodPatterns$l = {
	  any: {
	    am: /^a/i,
	    pm: /^p/i,
	    midnight: /^mezza/i,
	    noon: /^mezzo/i,
	    morning: /mattina/i,
	    afternoon: /pomeriggio/i,
	    evening: /sera/i,
	    night: /notte/i
	  }
	};
	var match$l = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$l,
	    parsePattern: parseOrdinalNumberPattern$l,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$l,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$l,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$l,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$l,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$l,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$l,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$l,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$l,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$l,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$l,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Italian locale.
	 * @language Italian
	 * @iso-639-2 ita
	 * @author Alberto Restifo [@albertorestifo]{@link https://github.com/albertorestifo}
	 * @author Giovanni Polimeni [@giofilo]{@link https://github.com/giofilo}
	 * @author Vincenzo Carrese [@vin-car]{@link https://github.com/vin-car}
	 */

	var locale$n = {
	  formatDistance: formatDistance$n,
	  formatLong: formatLong$n,
	  formatRelative: formatRelative$m,
	  localize: localize$l,
	  match: match$l,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$m = {
	  lessThanXSeconds: {
	    one: '1?????????',
	    other: '{{count}}?????????',
	    oneWithSuffix: '???1???',
	    otherWithSuffix: '???{{count}}???'
	  },
	  xSeconds: {
	    one: '1???',
	    other: '{{count}}???'
	  },
	  halfAMinute: '30???',
	  lessThanXMinutes: {
	    one: '1?????????',
	    other: '{{count}}?????????',
	    oneWithSuffix: '???1???',
	    otherWithSuffix: '???{{count}}???'
	  },
	  xMinutes: {
	    one: '1???',
	    other: '{{count}}???'
	  },
	  aboutXHours: {
	    one: '???1??????',
	    other: '???{{count}}??????'
	  },
	  xHours: {
	    one: '1??????',
	    other: '{{count}}??????'
	  },
	  xDays: {
	    one: '1???',
	    other: '{{count}}???'
	  },
	  aboutXMonths: {
	    one: '???1??????',
	    other: '???{{count}}??????'
	  },
	  xMonths: {
	    one: '1??????',
	    other: '{{count}}??????'
	  },
	  aboutXYears: {
	    one: '???1???',
	    other: '???{{count}}???'
	  },
	  xYears: {
	    one: '1???',
	    other: '{{count}}???'
	  },
	  overXYears: {
	    one: '1?????????',
	    other: '{{count}}?????????'
	  },
	  almostXYears: {
	    one: '1?????????',
	    other: '{{count}}?????????'
	  }
	};
	function formatDistance$o(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$m[token] === 'string') {
	    result = formatDistanceLocale$m[token];
	  } else if (count === 1) {
	    if (options.addSuffix && formatDistanceLocale$m[token].oneWithSuffix) {
	      result = formatDistanceLocale$m[token].oneWithSuffix;
	    } else {
	      result = formatDistanceLocale$m[token].one;
	    }
	  } else {
	    if (options.addSuffix && formatDistanceLocale$m[token].otherWithSuffix) {
	      result = formatDistanceLocale$m[token].otherWithSuffix.replace('{{count}}', count);
	    } else {
	      result = formatDistanceLocale$m[token].other.replace('{{count}}', count);
	    }
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return result + '???';
	    } else {
	      return result + '???';
	    }
	  }

	  return result;
	}

	var dateFormats$o = {
	  full: 'y???M???d???EEEE',
	  long: 'y???M???d???',
	  medium: 'y/MM/dd',
	  short: 'y/MM/dd'
	};
	var timeFormats$o = {
	  full: 'H???mm???ss??? zzzz',
	  long: 'H:mm:ss z',
	  medium: 'H:mm:ss',
	  short: 'H:mm'
	};
	var dateTimeFormats$o = {
	  full: '{{date}} {{time}}',
	  long: '{{date}} {{time}}',
	  medium: '{{date}} {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$o = {
	  date: buildFormatLongFn({
	    formats: dateFormats$o,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$o,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$o,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$m = {
	  lastWeek: '?????????eeee???p',
	  yesterday: '?????????p',
	  today: '?????????p',
	  tomorrow: '?????????p',
	  nextWeek: '?????????eeee???p',
	  other: 'P'
	};
	function formatRelative$n(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$m[token];
	}

	var eraValues$m = {
	  narrow: ['BC', 'AC'],
	  abbreviated: ['?????????', '??????'],
	  wide: ['?????????', '??????']
	};
	var quarterValues$m = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
	  wide: ['???1?????????', '???2?????????', '???3?????????', '???4?????????']
	};
	var monthValues$m = {
	  narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
	  abbreviated: ['1???', '2???', '3???', '4???', '5???', '6???', '7???', '8???', '9???', '10???', '11???', '12???'],
	  wide: ['1???', '2???', '3???', '4???', '5???', '6???', '7???', '8???', '9???', '10???', '11???', '12???']
	};
	var dayValues$m = {
	  narrow: ['???', '???', '???', '???', '???', '???', '???'],
	  short: ['???', '???', '???', '???', '???', '???', '???'],
	  abbreviated: ['???', '???', '???', '???', '???', '???', '???'],
	  wide: ['?????????', '?????????', '?????????', '?????????', '?????????', '?????????', '?????????']
	};
	var dayPeriodValues$m = {
	  narrow: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '???',
	    afternoon: '??????',
	    evening: '???',
	    night: '??????'
	  },
	  abbreviated: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '???',
	    afternoon: '??????',
	    evening: '???',
	    night: '??????'
	  },
	  wide: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '???',
	    afternoon: '??????',
	    evening: '???',
	    night: '??????'
	  }
	};
	var formattingDayPeriodValues$h = {
	  narrow: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '???',
	    afternoon: '??????',
	    evening: '???',
	    night: '??????'
	  },
	  abbreviated: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '???',
	    afternoon: '??????',
	    evening: '???',
	    night: '??????'
	  },
	  wide: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '???',
	    afternoon: '??????',
	    evening: '???',
	    night: '??????'
	  }
	};

	function ordinalNumber$m(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return number;
	}

	var localize$m = {
	  ordinalNumber: ordinalNumber$m,
	  era: buildLocalizeFn({
	    values: eraValues$m,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$m,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$m,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$m,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$m,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$h,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$m = /^????\d+/i;
	var parseOrdinalNumberPattern$m = /\d+/i;
	var matchEraPatterns$m = {
	  narrow: /^(B\.?C\.?|A\.?D\.?)/i,
	  abbreviated: /^(??????[??????]|??????)/i,
	  wide: /^(??????[??????]|??????)/i
	};
	var parseEraPatterns$m = {
	  narrow: [/^B/i, /^A/i],
	  any: [/^(?????????)/i, /^(??????|?????????)/i]
	};
	var matchQuarterPatterns$m = {
	  narrow: /^[1234]/i,
	  abbreviated: /^Q[1234]/i,
	  wide: /^???[1234????????????????????????]?????????/i
	};
	var parseQuarterPatterns$m = {
	  any: [/(1|???|???)/i, /(2|???|???)/i, /(3|???|???)/i, /(4|???|???)/i]
	};
	var matchMonthPatterns$m = {
	  narrow: /^([123456789]|1[012])/,
	  abbreviated: /^([123456789]|1[012])???/i,
	  wide: /^([123456789]|1[012])???/i
	};
	var parseMonthPatterns$m = {
	  any: [/^1/, /^2/, /^3/, /^4/, /^5/, /^6/, /^7/, /^8/, /^9/, /^10/, /^11/, /^12/]
	};
	var matchDayPatterns$m = {
	  narrow: /^[?????????????????????]/,
	  short: /^[?????????????????????]/,
	  abbreviated: /^[?????????????????????]/,
	  wide: /^[?????????????????????]??????/
	};
	var parseDayPatterns$m = {
	  any: [/^???/, /^???/, /^???/, /^???/, /^???/, /^???/, /^???/]
	};
	var matchDayPeriodPatterns$m = {
	  any: /^(AM|PM|??????|??????|??????|??????|?????????|???|???)/i
	};
	var parseDayPeriodPatterns$m = {
	  any: {
	    am: /^(A|??????)/i,
	    pm: /^(P|??????)/i,
	    midnight: /^??????|?????????/i,
	    noon: /^??????/i,
	    morning: /^???/i,
	    afternoon: /^??????/i,
	    evening: /^???/i,
	    night: /^??????/i
	  }
	};
	var match$m = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$m,
	    parsePattern: parseOrdinalNumberPattern$m,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$m,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$m,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$m,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$m,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$m,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$m,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$m,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$m,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$m,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$m,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Japanese locale.
	 * @language Japanese
	 * @iso-639-2 jpn
	 * @author Thomas Eilmsteiner [@DeMuu]{@link https://github.com/DeMuu}
	 * @author Yamagishi Kazutoshi [@ykzts]{@link https://github.com/ykzts}
	 * @author Luca Ban [@mesqueeb]{@link https://github.com/mesqueeb}
	 */

	var locale$o = {
	  formatDistance: formatDistance$o,
	  formatLong: formatLong$o,
	  formatRelative: formatRelative$n,
	  localize: localize$m,
	  match: match$m,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};
	 // throw new Error('ja locale is currently unavailable. Please check the progress of converting this locale to v2.0.0 in this issue on Github: TBA')

	var formatDistanceLocale$n = {
	  lessThanXSeconds: {
	    one: '1??? ??????',
	    other: '{{count}}??? ??????'
	  },
	  xSeconds: {
	    one: '1???',
	    other: '{{count}}???'
	  },
	  halfAMinute: '30???',
	  lessThanXMinutes: {
	    one: '1??? ??????',
	    other: '{{count}}??? ??????'
	  },
	  xMinutes: {
	    one: '1???',
	    other: '{{count}}???'
	  },
	  aboutXHours: {
	    one: '??? 1??????',
	    other: '??? {{count}}??????'
	  },
	  xHours: {
	    one: '1??????',
	    other: '{{count}}??????'
	  },
	  xDays: {
	    one: '1???',
	    other: '{{count}}???'
	  },
	  aboutXMonths: {
	    one: '??? 1??????',
	    other: '??? {{count}}??????'
	  },
	  xMonths: {
	    one: '1??????',
	    other: '{{count}}??????'
	  },
	  aboutXYears: {
	    one: '??? 1???',
	    other: '??? {{count}}???'
	  },
	  xYears: {
	    one: '1???',
	    other: '{{count}}???'
	  },
	  overXYears: {
	    one: '1??? ??????',
	    other: '{{count}}??? ??????'
	  },
	  almostXYears: {
	    one: '?????? 1???',
	    other: '?????? {{count}}???'
	  }
	};
	function formatDistance$p(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$n[token] === 'string') {
	    result = formatDistanceLocale$n[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$n[token].one;
	  } else {
	    result = formatDistanceLocale$n[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return result + ' ???';
	    } else {
	      return result + ' ???';
	    }
	  }

	  return result;
	}

	var dateFormats$p = {
	  full: 'y??? M??? d??? EEEE',
	  long: 'y??? M??? d???',
	  medium: 'y.MM.dd',
	  short: 'y.MM.dd'
	};
	var timeFormats$p = {
	  full: 'a H??? mm??? ss??? zzzz',
	  long: 'a H:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$p = {
	  full: '{{date}} {{time}}',
	  long: '{{date}} {{time}}',
	  medium: '{{date}} {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$p = {
	  date: buildFormatLongFn({
	    formats: dateFormats$p,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$p,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$p,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$n = {
	  lastWeek: "'??????' eeee p",
	  yesterday: "'??????' p",
	  today: "'??????' p",
	  tomorrow: "'??????' p",
	  nextWeek: "'??????' eeee p",
	  other: 'P'
	};
	function formatRelative$o(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$n[token];
	}

	var eraValues$n = {
	  narrow: ['BC', 'AD'],
	  abbreviated: ['BC', 'AD'],
	  wide: ['?????????', '??????']
	};
	var quarterValues$n = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
	  wide: ['1??????', '2??????', '3??????', '4??????']
	};
	var monthValues$n = {
	  narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
	  abbreviated: ['1???', '2???', '3???', '4???', '5???', '6???', '7???', '8???', '9???', '10???', '11???', '12???'],
	  wide: ['1???', '2???', '3???', '4???', '5???', '6???', '7???', '8???', '9???', '10???', '11???', '12???']
	};
	var dayValues$n = {
	  narrow: ['???', '???', '???', '???', '???', '???', '???'],
	  short: ['???', '???', '???', '???', '???', '???', '???'],
	  abbreviated: ['???', '???', '???', '???', '???', '???', '???'],
	  wide: ['?????????', '?????????', '?????????', '?????????', '?????????', '?????????', '?????????']
	};
	var dayPeriodValues$n = {
	  narrow: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '??????',
	    evening: '??????',
	    night: '???'
	  },
	  abbreviated: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '??????',
	    evening: '??????',
	    night: '???'
	  },
	  wide: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '??????',
	    evening: '??????',
	    night: '???'
	  }
	};
	var formattingDayPeriodValues$i = {
	  narrow: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '??????',
	    evening: '??????',
	    night: '???'
	  },
	  abbreviated: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '??????',
	    evening: '??????',
	    night: '???'
	  },
	  wide: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '??????',
	    evening: '??????',
	    night: '???'
	  }
	};

	function ordinalNumber$n(dirtyNumber, dirtyOptions) {
	  var number = Number(dirtyNumber);
	  return dirtyOptions && (dirtyOptions.unit === 'minute' || dirtyOptions.unit === 'second') ? number.toString() : number + '??????';
	}

	var localize$n = {
	  ordinalNumber: ordinalNumber$n,
	  era: buildLocalizeFn({
	    values: eraValues$n,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$n,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$n,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$n,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$n,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$i,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$n = /^(\d+)(??????)?/i;
	var parseOrdinalNumberPattern$n = /\d+/i;
	var matchEraPatterns$n = {
	  narrow: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
	  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
	  wide: /^(?????????|??????)/i
	};
	var parseEraPatterns$n = {
	  any: [/^(bc|?????????)/i, /^(ad|??????)/i]
	};
	var matchQuarterPatterns$n = {
	  narrow: /^[1234]/i,
	  abbreviated: /^q[1234]/i,
	  wide: /^[1234]??????????/i
	};
	var parseQuarterPatterns$n = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$n = {
	  narrow: /^(1[012]|[123456789])/,
	  abbreviated: /^(1[012]|[123456789])???/i,
	  wide: /^(1[012]|[123456789])???/i
	};
	var parseMonthPatterns$n = {
	  any: [/^1????$/, /^2/, /^3/, /^4/, /^5/, /^6/, /^7/, /^8/, /^9/, /^10/, /^11/, /^12/]
	};
	var matchDayPatterns$n = {
	  narrow: /^[?????????????????????]/,
	  short: /^[?????????????????????]/,
	  abbreviated: /^[?????????????????????]/,
	  wide: /^[?????????????????????]??????/
	};
	var parseDayPatterns$n = {
	  any: [/^???/, /^???/, /^???/, /^???/, /^???/, /^???/, /^???/]
	};
	var matchDayPeriodPatterns$n = {
	  any: /^(am|pm|??????|??????|??????|??????|??????|??????|???)/i
	};
	var parseDayPeriodPatterns$n = {
	  any: {
	    am: /^(am|??????)/i,
	    pm: /^(pm|??????)/i,
	    midnight: /^??????/i,
	    noon: /^??????/i,
	    morning: /^??????/i,
	    afternoon: /^??????/i,
	    evening: /^??????/i,
	    night: /^???/i
	  }
	};
	var match$n = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$n,
	    parsePattern: parseOrdinalNumberPattern$n,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$n,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$n,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$n,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$n,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$n,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$n,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$n,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$n,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$n,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$n,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Korean locale.
	 * @language Korean
	 * @iso-639-2 kor
	 * @author Hong Chulju [@angdev]{@link https://github.com/angdev}
	 * @author Lee Seoyoen [@iamssen]{@link https://github.com/iamssen}
	 */

	var locale$p = {
	  formatDistance: formatDistance$p,
	  formatLong: formatLong$p,
	  formatRelative: formatRelative$o,
	  localize: localize$n,
	  match: match$n,
	  options: {
	    weekStartsOn: 0
	    /* Sunday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	var formatDistanceLocale$o = {
	  lessThanXSeconds: {
	    one: translateSeconds,
	    other: translate$1
	  },
	  xSeconds: {
	    one: translateSeconds,
	    other: translate$1
	  },
	  halfAMinute: 'pus?? minut??s',
	  lessThanXMinutes: {
	    one: translateSingular,
	    other: translate$1
	  },
	  xMinutes: {
	    one: translateSingular,
	    other: translate$1
	  },
	  aboutXHours: {
	    one: translateSingular,
	    other: translate$1
	  },
	  xHours: {
	    one: translateSingular,
	    other: translate$1
	  },
	  xDays: {
	    one: translateSingular,
	    other: translate$1
	  },
	  aboutXMonths: {
	    one: translateSingular,
	    other: translate$1
	  },
	  xMonths: {
	    one: translateSingular,
	    other: translate$1
	  },
	  aboutXYears: {
	    one: translateSingular,
	    other: translate$1
	  },
	  xYears: {
	    one: translateSingular,
	    other: translate$1
	  },
	  overXYears: {
	    one: translateSingular,
	    other: translate$1
	  },
	  almostXYears: {
	    one: translateSingular,
	    other: translate$1
	  }
	};
	var translations$1 = {
	  'xseconds_other': 'sekund??_sekund??i??_sekundes',
	  'xminutes_one': 'minut??_minut??s_minut??',
	  'xminutes_other': 'minut??s_minu??i??_minutes',
	  'xhours_one': 'valanda_valandos_valand??',
	  'xhours_other': 'valandos_valand??_valandas',
	  'xdays_one': 'diena_dienos_dien??',
	  'xdays_other': 'dienos_dien??_dienas',
	  'xmonths_one': 'm??nuo_m??nesio_m??nes??',
	  'xmonths_other': 'm??nesiai_m??nesi??_m??nesius',
	  'xyears_one': 'metai_met??_metus',
	  'xyears_other': 'metai_met??_metus',
	  'about': 'apie',
	  'over': 'daugiau nei',
	  'almost': 'beveik',
	  'lessthan': 'ma??iau nei'
	};

	function translateSeconds(number, addSuffix, key, isFuture) {
	  if (!addSuffix) {
	    return 'kelios sekund??s';
	  } else {
	    return isFuture ? 'keli?? sekund??i??' : 'kelias sekundes';
	  }
	}

	function translateSingular(number, addSuffix, key, isFuture) {
	  return !addSuffix ? forms(key)[0] : isFuture ? forms(key)[1] : forms(key)[2];
	}

	function special(number) {
	  return number % 10 === 0 || number > 10 && number < 20;
	}

	function forms(key) {
	  return translations$1[key].split('_');
	}

	function translate$1(number, addSuffix, key, isFuture) {
	  var result = number + ' ';

	  if (number === 1) {
	    return result + translateSingular(number, addSuffix, key[0], isFuture);
	  } else if (!addSuffix) {
	    return result + (special(number) ? forms(key)[1] : forms(key)[0]);
	  } else {
	    if (isFuture) {
	      return result + forms(key)[1];
	    } else {
	      return result + (special(number) ? forms(key)[1] : forms(key)[2]);
	    }
	  }
	}

	function formatDistance$q(token, count, options) {
	  options = options || {};
	  var adverb = token.match(/about|over|almost|lessthan/i);
	  var unit = token.replace(adverb, '');
	  var result;

	  if (typeof formatDistanceLocale$o[token] === 'string') {
	    result = formatDistanceLocale$o[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$o[token].one(count, options.addSuffix, unit.toLowerCase() + '_one');
	  } else {
	    result = formatDistanceLocale$o[token].other(count, options.addSuffix, unit.toLowerCase() + '_other');
	  }

	  if (adverb) {
	    result = translations$1[adverb[0].toLowerCase()] + ' ' + result;
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'po ' + result;
	    } else {
	      return 'prie?? ' + result;
	    }
	  }

	  return result;
	}

	var dateFormats$q = {
	  full: "y 'm'. MMMM d 'd'., EEEE",
	  long: "y 'm'. MMMM d 'd'.",
	  medium: 'y-MM-dd',
	  short: 'y-MM-dd'
	};
	var timeFormats$q = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$q = {
	  full: '{{date}} {{time}}',
	  long: '{{date}} {{time}}',
	  medium: '{{date}} {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$q = {
	  date: buildFormatLongFn({
	    formats: dateFormats$q,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$q,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$q,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$o = {
	  lastWeek: "'Pra??jus??' eeee p",
	  yesterday: "'Vakar' p",
	  today: "'??iandien' p",
	  tomorrow: "'Rytoj' p",
	  nextWeek: 'eeee p',
	  other: 'P'
	};
	function formatRelative$p(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$o[token];
	}

	var eraValues$o = {
	  narrow: ['pr. Kr.', 'po Kr.'],
	  abbreviated: ['pr. Kr.', 'po Kr.'],
	  wide: ['prie?? Krist??', 'po Kristaus']
	};
	var quarterValues$o = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['I ketv.', 'II ketv.', 'III ketv.', 'IV ketv.'],
	  wide: ['I ketvirtis', 'II ketvirtis', 'III ketvirtis', 'IV ketvirtis']
	};
	var formattingQuarterValues$1 = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['I k.', 'II k.', 'III k.', 'IV k.'],
	  wide: ['I ketvirtis', 'II ketvirtis', 'III ketvirtis', 'IV ketvirtis']
	};
	var monthValues$o = {
	  narrow: ['S', 'V', 'K', 'B', 'G', 'B', 'L', 'R', 'R', 'S', 'L', 'G'],
	  abbreviated: ['saus.', 'vas.', 'kov.', 'bal.', 'geg.', 'bir??.', 'liep.', 'rugp.', 'rugs.', 'spal.', 'lapkr.', 'gruod.'],
	  wide: ['sausis', 'vasaris', 'kovas', 'balandis', 'gegu????', 'bir??elis', 'liepa', 'rugpj??tis', 'rugs??jis', 'spalis', 'lapkritis', 'gruodis']
	};
	var formattingMonthValues$4 = {
	  narrow: ['S', 'V', 'K', 'B', 'G', 'B', 'L', 'R', 'R', 'S', 'L', 'G'],
	  abbreviated: ['saus.', 'vas.', 'kov.', 'bal.', 'geg.', 'bir??.', 'liep.', 'rugp.', 'rugs.', 'spal.', 'lapkr.', 'gruod.'],
	  wide: ['sausio', 'vasario', 'kovo', 'baland??io', 'gegu????s', 'bir??elio', 'liepos', 'rugpj????io', 'rugs??jo', 'spalio', 'lapkri??io', 'gruod??io']
	};
	var dayValues$o = {
	  narrow: ['S', 'P', 'A', 'T', 'K', 'P', '??'],
	  short: ['Sk', 'Pr', 'An', 'Tr', 'Kt', 'Pn', '??t'],
	  abbreviated: ['sk', 'pr', 'an', 'tr', 'kt', 'pn', '??t'],
	  wide: ['sekmadienis', 'pirmadienis', 'antradienis', 'tre??iadienis', 'ketvirtadienis', 'penktadienis', '??e??tadienis']
	};
	var formattingDayValues$1 = {
	  narrow: ['S', 'P', 'A', 'T', 'K', 'P', '??'],
	  short: ['Sk', 'Pr', 'An', 'Tr', 'Kt', 'Pn', '??t'],
	  abbreviated: ['sk', 'pr', 'an', 'tr', 'kt', 'pn', '??t'],
	  wide: ['sekmadien??', 'pirmadien??', 'antradien??', 'tre??iadien??', 'ketvirtadien??', 'penktadien??', '??e??tadien??']
	};
	var dayPeriodValues$o = {
	  narrow: {
	    am: 'pr. p.',
	    pm: 'pop.',
	    midnight: 'vidurnaktis',
	    noon: 'vidurdienis',
	    morning: 'rytas',
	    afternoon: 'diena',
	    evening: 'vakaras',
	    night: 'naktis'
	  },
	  abbreviated: {
	    am: 'prie??piet',
	    pm: 'popiet',
	    midnight: 'vidurnaktis',
	    noon: 'vidurdienis',
	    morning: 'rytas',
	    afternoon: 'diena',
	    evening: 'vakaras',
	    night: 'naktis'
	  },
	  wide: {
	    am: 'prie??piet',
	    pm: 'popiet',
	    midnight: 'vidurnaktis',
	    noon: 'vidurdienis',
	    morning: 'rytas',
	    afternoon: 'diena',
	    evening: 'vakaras',
	    night: 'naktis'
	  }
	};
	var formattingDayPeriodValues$j = {
	  narrow: {
	    am: 'pr. p.',
	    pm: 'pop.',
	    midnight: 'vidurnaktis',
	    noon: 'perpiet',
	    morning: 'rytas',
	    afternoon: 'popiet??',
	    evening: 'vakaras',
	    night: 'naktis'
	  },
	  abbreviated: {
	    am: 'prie??piet',
	    pm: 'popiet',
	    midnight: 'vidurnaktis',
	    noon: 'perpiet',
	    morning: 'rytas',
	    afternoon: 'popiet??',
	    evening: 'vakaras',
	    night: 'naktis'
	  },
	  wide: {
	    am: 'prie??piet',
	    pm: 'popiet',
	    midnight: 'vidurnaktis',
	    noon: 'perpiet',
	    morning: 'rytas',
	    afternoon: 'popiet??',
	    evening: 'vakaras',
	    night: 'naktis'
	  }
	};

	function ordinalNumber$o(dirtyNumber, _dirtyOptions) {
	  var number = Number(dirtyNumber);
	  return number + '-oji';
	}

	var localize$o = {
	  ordinalNumber: ordinalNumber$o,
	  era: buildLocalizeFn({
	    values: eraValues$o,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$o,
	    defaultWidth: 'wide',
	    formattingValues: formattingQuarterValues$1,
	    defaultFormattingWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$o,
	    defaultWidth: 'wide',
	    formattingValues: formattingMonthValues$4,
	    defaultFormattingWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$o,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayValues$1,
	    defaultFormattingWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$o,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$j,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$o = /^(\d+)(-oji)?/i;
	var parseOrdinalNumberPattern$o = /\d+/i;
	var matchEraPatterns$o = {
	  narrow: /^p(r|o)\.?\s?(kr\.?|me)/i,
	  abbreviated: /^(pr\.\s?(kr\.|m\.\s?e\.)|po\s?kr\.|m??s?? eroje)/i,
	  wide: /^(prie?? Krist??|prie?? m??s?? er??|po Kristaus|m??s?? eroje)/i
	};
	var parseEraPatterns$o = {
	  wide: [/prie??/i, /(po|m??s??)/i],
	  any: [/^pr/i, /^(po|m)/i]
	};
	var matchQuarterPatterns$o = {
	  narrow: /^([1234])/i,
	  abbreviated: /^(I|II|III|IV)\s?ketv?\.?/i,
	  wide: /^(I|II|III|IV)\s?ketvirtis/i
	};
	var parseQuarterPatterns$o = {
	  narrow: [/1/i, /2/i, /3/i, /4/i],
	  any: [/I$/i, /II$/i, /III/i, /IV/i]
	};
	var matchMonthPatterns$o = {
	  narrow: /^[svkbglr]/i,
	  abbreviated: /^(saus\.|vas\.|kov\.|bal\.|geg\.|bir??\.|liep\.|rugp\.|rugs\.|spal\.|lapkr\.|gruod\.)/i,
	  wide: /^(sausi(s|o)|vasari(s|o)|kov(a|o)s|baland???i(s|o)|gegu????s?|bir??eli(s|o)|liep(a|os)|rugpj??(t|??)i(s|o)|rugs??j(is|o)|spali(s|o)|lapkri(t|??)i(s|o)|gruod???i(s|o))/i
	};
	var parseMonthPatterns$o = {
	  narrow: [/^s/i, /^v/i, /^k/i, /^b/i, /^g/i, /^b/i, /^l/i, /^r/i, /^r/i, /^s/i, /^l/i, /^g/i],
	  any: [/^saus/i, /^vas/i, /^kov/i, /^bal/i, /^geg/i, /^bir??/i, /^liep/i, /^rugp/i, /^rugs/i, /^spal/i, /^lapkr/i, /^gruod/i]
	};
	var matchDayPatterns$o = {
	  narrow: /^[spatk??]/i,
	  short: /^(sk|pr|an|tr|kt|pn|??t)/i,
	  abbreviated: /^(sk|pr|an|tr|kt|pn|??t)/i,
	  wide: /^(sekmadien(is|??)|pirmadien(is|??)|antradien(is|??)|tre??iadien(is|??)|ketvirtadien(is|??)|penktadien(is|??)|??e??tadien(is|??))/i
	};
	var parseDayPatterns$o = {
	  narrow: [/^s/i, /^p/i, /^a/i, /^t/i, /^k/i, /^p/i, /^??/i],
	  wide: [/^se/i, /^pi/i, /^an/i, /^tr/i, /^ke/i, /^pe/i, /^??e/i],
	  any: [/^sk/i, /^pr/i, /^an/i, /^tr/i, /^kt/i, /^pn/i, /^??t/i]
	};
	var matchDayPeriodPatterns$o = {
	  narrow: /^(pr.\s?p.|pop.|vidurnaktis|(vidurdienis|perpiet)|rytas|(diena|popiet??)|vakaras|naktis)/i,
	  any: /^(prie??piet|popiet$|vidurnaktis|(vidurdienis|perpiet)|rytas|(diena|popiet??)|vakaras|naktis)/i
	};
	var parseDayPeriodPatterns$o = {
	  narrow: {
	    am: /^pr/i,
	    pm: /^pop./i,
	    midnight: /^vidurnaktis/i,
	    noon: /^(vidurdienis|perp)/i,
	    morning: /rytas/i,
	    afternoon: /(die|popiet??)/i,
	    evening: /vakaras/i,
	    night: /naktis/i
	  },
	  any: {
	    am: /^pr/i,
	    pm: /^popiet$/i,
	    midnight: /^vidurnaktis/i,
	    noon: /^(vidurdienis|perp)/i,
	    morning: /rytas/i,
	    afternoon: /(die|popiet??)/i,
	    evening: /vakaras/i,
	    night: /naktis/i
	  }
	};
	var match$o = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$o,
	    parsePattern: parseOrdinalNumberPattern$o,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$o,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$o,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$o,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$o,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$o,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$o,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$o,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$o,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$o,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$o,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 *
	 * @summary Lithuanian locale.
	 * @language Lithuanian
	 *
	 * @iso-639-2 lit
	 *
	 * @author Pavlo Shpak [@pshpak]{@link https://github.com/pshpak}
	 * @author Eduardo Pardo [@eduardopsll]{@link https://github.com/eduardopsll}
	 */

	var locale$q = {
	  formatDistance: formatDistance$q,
	  formatLong: formatLong$q,
	  formatRelative: formatRelative$p,
	  localize: localize$o,
	  match: match$o,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	function buildLocalizeTokenFn$1(schema) {
	  return function (count, options) {
	    if (count === 1) {
	      if (options.addSuffix) {
	        return schema.one[0].replace('{{time}}', schema.one[2]);
	      } else {
	        return schema.one[0].replace('{{time}}', schema.one[1]);
	      }
	    } else {
	      var rem = count % 10 === 1 && count % 100 !== 11;

	      if (options.addSuffix) {
	        return schema.other[0].replace('{{time}}', rem ? schema.other[3] : schema.other[4]).replace('{{count}}', count);
	      } else {
	        return schema.other[0].replace('{{time}}', rem ? schema.other[1] : schema.other[2]).replace('{{count}}', count);
	      }
	    }
	  };
	}

	var formatDistanceLocale$p = {
	  lessThanXSeconds: buildLocalizeTokenFn$1({
	    one: ['maz??k par {{time}}', 'sekundi', 'sekundi'],
	    other: ['maz??k nek?? {{count}} {{time}}', 'sekunde', 'sekundes', 'sekundes', 'sekund??m']
	  }),
	  xSeconds: buildLocalizeTokenFn$1({
	    one: ['1 {{time}}', 'sekunde', 'sekundes'],
	    other: ['{{count}} {{time}}', 'sekunde', 'sekundes', 'sekundes', 'sekund??m']
	  }),
	  halfAMinute: function (count, options) {
	    if (options.addSuffix) {
	      return 'pusmin??tes';
	    } else {
	      return 'pusmin??te';
	    }
	  },
	  lessThanXMinutes: buildLocalizeTokenFn$1({
	    one: ['maz??k par {{time}}', 'min??ti', 'min??ti'],
	    other: ['maz??k nek?? {{count}} {{time}}', 'min??te', 'min??tes', 'min??tes', 'min??t??m']
	  }),
	  xMinutes: buildLocalizeTokenFn$1({
	    one: ['1 {{time}}', 'min??te', 'min??tes'],
	    other: ['{{count}} {{time}}', 'min??te', 'min??tes', 'min??tes', 'min??t??m']
	  }),
	  aboutXHours: buildLocalizeTokenFn$1({
	    one: ['apm??ram 1 {{time}}', 'stunda', 'stundas'],
	    other: ['apm??ram {{count}} {{time}}', 'stunda', 'stundas', 'stundas', 'stund??m']
	  }),
	  xHours: buildLocalizeTokenFn$1({
	    one: ['1 {{time}}', 'stunda', 'stundas'],
	    other: ['{{count}} {{time}}', 'stunda', 'stundas', 'stundas', 'stund??m']
	  }),
	  xDays: buildLocalizeTokenFn$1({
	    one: ['1 {{time}}', 'diena', 'dienas'],
	    other: ['{{count}} {{time}}', 'diena', 'dienas', 'dienas', 'dien??m']
	  }),
	  aboutXMonths: buildLocalizeTokenFn$1({
	    one: ['apm??ram 1 {{time}}', 'm??nesis', 'm??ne??a'],
	    other: ['apm??ram {{count}} {{time}}', 'm??nesis', 'm??ne??i', 'm??ne??a', 'm??ne??iem']
	  }),
	  xMonths: buildLocalizeTokenFn$1({
	    one: ['1 {{time}}', 'm??nesis', 'm??ne??a'],
	    other: ['{{count}} {{time}}', 'm??nesis', 'm??ne??i', 'm??ne??a', 'm??ne??iem']
	  }),
	  aboutXYears: buildLocalizeTokenFn$1({
	    one: ['apm??ram 1 {{time}}', 'gads', 'gada'],
	    other: ['apm??ram {{count}} {{time}}', 'gads', 'gadi', 'gada', 'gadiem']
	  }),
	  xYears: buildLocalizeTokenFn$1({
	    one: ['1 {{time}}', 'gads', 'gada'],
	    other: ['{{count}} {{time}}', 'gads', 'gadi', 'gada', 'gadiem']
	  }),
	  overXYears: buildLocalizeTokenFn$1({
	    one: ['ilg??k par 1 {{time}}', 'gadu', 'gadu'],
	    other: ['vair??k nek?? {{count}} {{time}}', 'gads', 'gadi', 'gada', 'gadiem']
	  }),
	  almostXYears: buildLocalizeTokenFn$1({
	    one: ['gandr??z 1 {{time}}', 'gads', 'gada'],
	    other: ['vair??k nek?? {{count}} {{time}}', 'gads', 'gadi', 'gada', 'gadiem']
	  })
	};
	function formatDistance$r(token, count, options) {
	  options = options || {};
	  var result = formatDistanceLocale$p[token](count, options);

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'p??c ' + result;
	    } else {
	      return 'pirms ' + result;
	    }
	  }

	  return result;
	}

	var dateFormats$r = {
	  full: "y. 'gada' M. MMMM., EEEE",
	  long: "y. 'gada' M. MMMM",
	  medium: 'dd.MM.y.',
	  short: 'dd.MM.y.'
	};
	var timeFormats$r = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$r = {
	  full: "{{date}} 'plkst.' {{time}}",
	  long: "{{date}} 'plkst.' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$r = {
	  date: buildFormatLongFn({
	    formats: dateFormats$r,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$r,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$r,
	    defaultWidth: 'full'
	  })
	};

	var weekdays = ['sv??tdien??', 'pirmdien??', 'otrdien??', 'tre??dien??', 'ceturtdien??', 'piektdien??', 'sestdien??'];
	var formatRelativeLocale$p = {
	  lastWeek: function (date, baseDate, options) {
	    if (isSameUTCWeek(date, baseDate, options)) {
	      return "eeee 'plkst.' p";
	    }

	    var weekday = weekdays[date.getUTCDay()];
	    return "'Pag??ju???? " + weekday + " plkst.' p";
	  },
	  yesterday: "'Vakar plkst.' p",
	  today: "'??odien plkst.' p",
	  tomorrow: "'R??t plkst.' p",
	  nextWeek: function (date, baseDate, options) {
	    if (isSameUTCWeek(date, baseDate, options)) {
	      return "eeee 'plkst.' p";
	    }

	    var weekday = weekdays[date.getUTCDay()];
	    return "'N??kamaj?? " + weekday + " plkst.' p";
	  },
	  other: 'P'
	};
	function formatRelative$q(token, date, baseDate, options) {
	  var format = formatRelativeLocale$p[token];

	  if (typeof format === 'function') {
	    return format(date, baseDate, options);
	  }

	  return format;
	}

	var eraValues$p = {
	  narrow: ['p.m.??', 'm.??'],
	  abbreviated: ['p. m. ??.', 'm. ??.'],
	  wide: ['pirms m??su ??ras', 'm??su ??r??']
	};
	var quarterValues$p = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['1. cet.', '2. cet.', '3. cet.', '4. cet.'],
	  wide: ['pirmais ceturksnis', 'otrais ceturksnis', 'tre??ais ceturksnis', 'ceturtais ceturksnis']
	};
	var formattingQuarterValues$2 = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['1. cet.', '2. cet.', '3. cet.', '4. cet.'],
	  wide: ['pirmaj?? ceturksn??', 'otraj?? ceturksn??', 'tre??aj?? ceturksn??', 'ceturtaj?? ceturksn??']
	};
	var monthValues$p = {
	  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['janv.', 'febr.', 'marts', 'apr.', 'maijs', 'j??n.', 'j??l.', 'aug.', 'sept.', 'okt.', 'nov.', 'dec.'],
	  wide: ['janv??ris', 'febru??ris', 'marts', 'apr??lis', 'maijs', 'j??nijs', 'j??lijs', 'augusts', 'septembris', 'oktobris', 'novembris', 'decembris']
	};
	var formattingMonthValues$5 = {
	  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['janv.', 'febr.', 'mart??', 'apr.', 'maijs', 'j??n.', 'j??l.', 'aug.', 'sept.', 'okt.', 'nov.', 'dec.'],
	  wide: ['janv??r??', 'febru??r??', 'mart??', 'apr??l??', 'maij??', 'j??nij??', 'j??lij??', 'august??', 'septembr??', 'oktobr??', 'novembr??', 'decembr??']
	};
	var dayValues$p = {
	  narrow: ['S', 'P', 'O', 'T', 'C', 'P', 'S'],
	  short: ['Sv', 'P', 'O', 'T', 'C', 'Pk', 'S'],
	  abbreviated: ['sv??td.', 'pirmd.', 'otrd.', 'tre??d.', 'ceturtd.', 'piektd.', 'sestd.'],
	  wide: ['sv??tdiena', 'pirmdiena', 'otrdiena', 'tre??diena', 'ceturtdiena', 'piektdiena', 'sestdiena']
	};
	var formattingDayValues$2 = {
	  narrow: ['S', 'P', 'O', 'T', 'C', 'P', 'S'],
	  short: ['Sv', 'P', 'O', 'T', 'C', 'Pk', 'S'],
	  abbreviated: ['sv??td.', 'pirmd.', 'otrd.', 'tre??d.', 'ceturtd.', 'piektd.', 'sestd.'],
	  wide: ['sv??tdien??', 'pirmdien??', 'otrdien??', 'tre??dien??', 'ceturtdien??', 'piektdien??', 'sestdien??']
	};
	var dayPeriodValues$p = {
	  narrow: {
	    am: 'am',
	    pm: 'pm',
	    midnight: 'pusn.',
	    noon: 'pusd.',
	    morning: 'r??ts',
	    afternoon: 'diena',
	    evening: 'vakars',
	    night: 'nakts'
	  },
	  abbreviated: {
	    am: 'am',
	    pm: 'pm',
	    midnight: 'pusn.',
	    noon: 'pusd.',
	    morning: 'r??ts',
	    afternoon: 'p??cpusd.',
	    evening: 'vakars',
	    night: 'nakts'
	  },
	  wide: {
	    am: 'am',
	    pm: 'pm',
	    midnight: 'pusnakts',
	    noon: 'pusdienlaiks',
	    morning: 'r??ts',
	    afternoon: 'p??cpusdiena',
	    evening: 'vakars',
	    night: 'nakts'
	  }
	};
	var formattingDayPeriodValues$k = {
	  narrow: {
	    am: 'am',
	    pm: 'pm',
	    midnight: 'pusn.',
	    noon: 'pusd.',
	    morning: 'r??t??',
	    afternoon: 'dien??',
	    evening: 'vakar??',
	    night: 'nakt??'
	  },
	  abbreviated: {
	    am: 'am',
	    pm: 'pm',
	    midnight: 'pusn.',
	    noon: 'pusd.',
	    morning: 'r??t??',
	    afternoon: 'p??cpusd.',
	    evening: 'vakar??',
	    night: 'nakt??'
	  },
	  wide: {
	    am: 'am',
	    pm: 'pm',
	    midnight: 'pusnakt??',
	    noon: 'pusdienlaik??',
	    morning: 'r??t??',
	    afternoon: 'p??cpusdien??',
	    evening: 'vakar??',
	    night: 'nakt??'
	  }
	};

	function ordinalNumber$p(number, _options) {
	  return number + '.';
	}

	var localize$p = {
	  ordinalNumber: ordinalNumber$p,
	  era: buildLocalizeFn({
	    values: eraValues$p,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$p,
	    defaultWidth: 'wide',
	    formattingValues: formattingQuarterValues$2,
	    defaultFormattingWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$p,
	    defaultWidth: 'wide',
	    formattingValues: formattingMonthValues$5,
	    defaultFormattingWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$p,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayValues$2,
	    defaultFormattingWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$p,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$k,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$p = /^(\d+)\./i;
	var parseOrdinalNumberPattern$p = /\d+/i;
	var matchEraPatterns$p = {
	  narrow: /^(p\.m\.??|m\.??)/i,
	  abbreviated: /^(p\. m\. ??\.|m\. ??\.)/i,
	  wide: /^(pirms m??su ??ras|m??su ??r??)/i
	};
	var parseEraPatterns$p = {
	  any: [/^p/i, /^m/i]
	};
	var matchQuarterPatterns$p = {
	  narrow: /^[1234]/i,
	  abbreviated: /^[1234](\. cet\.)/i,
	  wide: /^(pirma(is|j??)|otra(is|j??)|tre??a(is|j??)|ceturta(is|j??)) ceturksn(is|??)/i
	};
	var parseQuarterPatterns$p = {
	  narrow: [/^1/i, /^2/i, /^3/i, /^4/i],
	  abbreviated: [/^1/i, /^2/i, /^3/i, /^4/i],
	  wide: [/^p/i, /^o/i, /^t/i, /^c/i]
	};
	var matchMonthPatterns$p = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(janv\.|febr\.|marts|apr\.|maijs|j??n\.|j??l\.|aug\.|sept\.|okt\.|nov\.|dec\.)/i,
	  wide: /^(janv??r(is|??)|febru??r(is|??)|mart[s??]|apr??l(is|??)|maij[s??]|j??nij[s??]|j??lij[s??]|august[s??]|septembr(is|??)|oktobr(is|??)|novembr(is|??)|decembr(is|??))/i
	};
	var parseMonthPatterns$p = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^mai/i, /^j??n/i, /^j??l/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$p = {
	  narrow: /^[spotc]/i,
	  short: /^(sv|pi|o|t|c|pk|s)/i,
	  abbreviated: /^(sv??td\.|pirmd\.|otrd.\|tre??d\.|ceturtd\.|piektd\.|sestd\.)/i,
	  wide: /^(sv??tdien(a|??)|pirmdien(a|??)|otrdien(a|??)|tre??dien(a|??)|ceturtdien(a|??)|piektdien(a|??)|sestdien(a|??))/i
	};
	var parseDayPatterns$p = {
	  narrow: [/^s/i, /^p/i, /^o/i, /^t/i, /^c/i, /^p/i, /^s/i],
	  any: [/^sv/i, /^pi/i, /^o/i, /^t/i, /^c/i, /^p/i, /^se/i]
	};
	var matchDayPeriodPatterns$p = {
	  narrow: /^(am|pm|pusn\.|pusd\.|r??t(s|??)|dien(a|??)|vakar(s|??)|nakt(s|??))/,
	  abbreviated: /^(am|pm|pusn\.|pusd\.|r??t(s|??)|p??cpusd\.|vakar(s|??)|nakt(s|??))/,
	  wide: /^(am|pm|pusnakt(s|??)|pusdienlaik(s|??)|r??t(s|??)|p??cpusdien(a|??)|vakar(s|??)|nakt(s|??))/i
	};
	var parseDayPeriodPatterns$p = {
	  any: {
	    am: /^am/i,
	    pm: /^pm/i,
	    midnight: /^pusn/i,
	    noon: /^pusd/i,
	    morning: /^r/i,
	    afternoon: /^(d|p??c)/i,
	    evening: /^v/i,
	    night: /^n/i
	  }
	};
	var match$p = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$p,
	    parsePattern: parseOrdinalNumberPattern$p,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$p,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$p,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$p,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$p,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$p,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$p,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$p,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$p,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$p,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$p,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Latvian locale (Latvia).
	 * @language Latvian
	 * @iso-639-2 lav
	 * @author R??dolfs Pu????tis [@prudolfs]{@link https://github.com/prudolfs}
	 */

	var locale$r = {
	  formatDistance: formatDistance$r,
	  formatLong: formatLong$r,
	  formatRelative: formatRelative$q,
	  localize: localize$p,
	  match: match$p,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$q = {
	  lessThanXSeconds: {
	    singular: 'mindre enn ett sekund',
	    plural: 'mindre enn {{count}} sekunder'
	  },
	  xSeconds: {
	    singular: 'ett sekund',
	    plural: '{{count}} sekunder'
	  },
	  halfAMinute: 'et halvt minutt',
	  lessThanXMinutes: {
	    singular: 'mindre enn ett minutt',
	    plural: 'mindre enn {{count}} minutter'
	  },
	  xMinutes: {
	    singular: 'ett minutt',
	    plural: '{{count}} minutter'
	  },
	  aboutXHours: {
	    singular: 'omtrent en time',
	    plural: 'omtrent {{count}} timer'
	  },
	  xHours: {
	    singular: 'en time',
	    plural: '{{count}} timer'
	  },
	  xDays: {
	    singular: 'en dag',
	    plural: '{{count}} dager'
	  },
	  aboutXMonths: {
	    singular: 'omtrent en m??ned',
	    plural: 'omtrent {{count}} m??neder'
	  },
	  xMonths: {
	    singular: 'en m??ned',
	    plural: '{{count}} m??neder'
	  },
	  aboutXYears: {
	    singular: 'omtrent ett ??r',
	    plural: 'omtrent {{count}} ??r'
	  },
	  xYears: {
	    singular: 'ett ??r',
	    plural: '{{count}} ??r'
	  },
	  overXYears: {
	    singular: 'over ett ??r',
	    plural: 'over {{count}} ??r'
	  },
	  almostXYears: {
	    singular: 'nesten ett ??r',
	    plural: 'nesten {{count}} ??r'
	  }
	};
	var wordMapping = ['null', 'en', 'to', 'tre', 'fire', 'fem', 'seks', 'sju', '??tte', 'ni', 'ti', 'elleve', 'tolv'];
	function formatDistance$s(token, count, options) {
	  options = options || {
	    onlyNumeric: false
	  };
	  var translation = formatDistanceLocale$q[token];
	  var result;

	  if (typeof translation === 'string') {
	    result = translation;
	  } else if (count === 0 || count > 1) {
	    if (options.onlyNumeric) {
	      result = translation.plural.replace('{{count}}', count);
	    } else {
	      result = translation.plural.replace('{{count}}', count < 13 ? wordMapping[count] : count);
	    }
	  } else {
	    result = translation.singular;
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'om ' + result;
	    } else {
	      return result + ' siden';
	    }
	  }

	  return result;
	}

	var dateFormats$s = {
	  full: 'EEEE d. MMMM y',
	  long: 'd. MMMM y',
	  medium: 'd. MMM y',
	  short: 'dd.MM.y'
	};
	var timeFormats$s = {
	  full: "'kl'. HH:mm:ss zzzz",
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$s = {
	  full: "{{date}} 'kl.' {{time}}",
	  long: "{{date}} 'kl.' {{time}}",
	  medium: '{{date}} {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$s = {
	  date: buildFormatLongFn({
	    formats: dateFormats$s,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$s,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$s,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$q = {
	  lastWeek: "'forrige' eeee 'kl.' p",
	  yesterday: "'i g??r kl.' p",
	  today: "'i dag kl.' p",
	  tomorrow: "'i morgen kl.' p",
	  nextWeek: "EEEE 'kl.' p",
	  other: 'P'
	};
	function formatRelative$r(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$q[token];
	}

	var eraValues$q = {
	  narrow: ['f.Kr.', 'e.Kr.'],
	  abbreviated: ['f.Kr.', 'e.Kr.'],
	  wide: ['f??r Kristus', 'etter Kristus']
	};
	var quarterValues$q = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
	  wide: ['1. kvartal', '2. kvartal', '3. kvartal', '4. kvartal']
	};
	var monthValues$q = {
	  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['jan.', 'feb.', 'mars', 'apr.', 'mai', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'des.'],
	  wide: ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember']
	};
	var dayValues$q = {
	  narrow: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
	  short: ['s??', 'ma', 'ti', 'on', 'to', 'fr', 'l??'],
	  abbreviated: ['s??n', 'man', 'tir', 'ons', 'tor', 'fre', 'l??r'],
	  wide: ['s??ndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'l??rdag']
	};
	var dayPeriodValues$q = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'midnatt',
	    noon: 'middag',
	    morning: 'p?? morg.',
	    afternoon: 'p?? etterm.',
	    evening: 'p?? kvelden',
	    night: 'p?? natten'
	  },
	  abbreviated: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'midnatt',
	    noon: 'middag',
	    morning: 'p?? morg.',
	    afternoon: 'p?? etterm.',
	    evening: 'p?? kvelden',
	    night: 'p?? natten'
	  },
	  wide: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'midnatt',
	    noon: 'middag',
	    morning: 'p?? morgenen',
	    afternoon: 'p?? ettermiddagen',
	    evening: 'p?? kvelden',
	    night: 'p?? natten'
	  }
	};

	function ordinalNumber$q(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return number + '.';
	}

	var localize$q = {
	  ordinalNumber: ordinalNumber$q,
	  era: buildLocalizeFn({
	    values: eraValues$q,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$q,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$q,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$q,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$q,
	    defaultWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$q = /^(\d+)\.?/i;
	var parseOrdinalNumberPattern$q = /\d+/i;
	var matchEraPatterns$q = {
	  narrow: /^(f\.? ?Kr\.?|fvt\.?|e\.? ?Kr\.?|evt\.?)/i,
	  abbreviated: /^(f\.? ?Kr\.?|fvt\.?|e\.? ?Kr\.?|evt\.?)/i,
	  wide: /^(f??r Kristus|f??r v??r tid|etter Kristus|v??r tid)/i
	};
	var parseEraPatterns$q = {
	  any: [/^f/i, /^e/i]
	};
	var matchQuarterPatterns$q = {
	  narrow: /^[1234]/i,
	  abbreviated: /^q[1234]/i,
	  wide: /^[1234](\.)? kvartal/i
	};
	var parseQuarterPatterns$q = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$q = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(jan|feb|mar|apr|mai|jun|jul|aug|sep|okt|nov|des)\.?/i,
	  wide: /^(januar|februar|mars|april|mai|juni|juli|august|september|oktober|november|desember)/i
	};
	var parseMonthPatterns$q = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^mai/i, /^jun/i, /^jul/i, /^aug/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$q = {
	  narrow: /^[smtofl]/i,
	  short: /^(s??|ma|ti|on|to|fr|l??)/i,
	  abbreviated: /^(s??n|man|tir|ons|tor|fre|l??r)/i,
	  wide: /^(s??ndag|mandag|tirsdag|onsdag|torsdag|fredag|l??rdag)/i
	};
	var parseDayPatterns$q = {
	  any: [/^s/i, /^m/i, /^ti/i, /^o/i, /^to/i, /^f/i, /^l/i]
	};
	var matchDayPeriodPatterns$q = {
	  narrow: /^(midnatt|middag|(p??) (morgenen|ettermiddagen|kvelden|natten)|[ap])/i,
	  any: /^([ap]\.?\s?m\.?|midnatt|middag|(p??) (morgenen|ettermiddagen|kvelden|natten))/i
	};
	var parseDayPeriodPatterns$q = {
	  any: {
	    am: /^a(\.?\s?m\.?)?$/i,
	    pm: /^p(\.?\s?m\.?)?$/i,
	    midnight: /^midn/i,
	    noon: /^midd/i,
	    morning: /morgen/i,
	    afternoon: /ettermiddag/i,
	    evening: /kveld/i,
	    night: /natt/i
	  }
	};
	var match$q = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$q,
	    parsePattern: parseOrdinalNumberPattern$q,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$q,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$q,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$q,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$q,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$q,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$q,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$q,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$q,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$q,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$q,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Norwegian Bokm??l locale.
	 * @language Norwegian Bokm??l
	 * @iso-639-2 nob
	 * @author Hans-Kristian Koren [@Hanse]{@link https://github.com/Hanse}
	 * @author Mikolaj Grzyb [@mikolajgrzyb]{@link https://github.com/mikolajgrzyb}
	 * @author Dag Stuan [@dagstuan]{@link https://github.com/dagstuan}
	 */

	var locale$s = {
	  formatDistance: formatDistance$s,
	  formatLong: formatLong$s,
	  formatRelative: formatRelative$r,
	  localize: localize$q,
	  match: match$q,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$r = {
	  lessThanXSeconds: {
	    one: 'minder dan een seconde',
	    other: 'minder dan {{count}} seconden'
	  },
	  xSeconds: {
	    one: '1 seconde',
	    other: '{{count}} seconden'
	  },
	  halfAMinute: 'een halve minuut',
	  lessThanXMinutes: {
	    one: 'minder dan een minuut',
	    other: 'minder dan {{count}} minuten'
	  },
	  xMinutes: {
	    one: 'een minuut',
	    other: '{{count}} minuten'
	  },
	  aboutXHours: {
	    one: 'ongeveer 1 uur',
	    other: 'ongeveer {{count}} uur'
	  },
	  xHours: {
	    one: '1 uur',
	    other: '{{count}} uur'
	  },
	  xDays: {
	    one: '1 dag',
	    other: '{{count}} dagen'
	  },
	  aboutXMonths: {
	    one: 'ongeveer 1 maand',
	    other: 'ongeveer {{count}} maanden'
	  },
	  xMonths: {
	    one: '1 maand',
	    other: '{{count}} maanden'
	  },
	  aboutXYears: {
	    one: 'ongeveer 1 jaar',
	    other: 'ongeveer {{count}} jaar'
	  },
	  xYears: {
	    one: '1 jaar',
	    other: '{{count}} jaar'
	  },
	  overXYears: {
	    one: 'meer dan 1 jaar',
	    other: 'meer dan {{count}} jaar'
	  },
	  almostXYears: {
	    one: 'bijna 1 jaar',
	    other: 'bijna {{count}} jaar'
	  }
	};
	function formatDistance$t(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$r[token] === 'string') {
	    result = formatDistanceLocale$r[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$r[token].one;
	  } else {
	    result = formatDistanceLocale$r[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'over ' + result;
	    } else {
	      return result + ' geleden';
	    }
	  }

	  return result;
	}

	var dateFormats$t = {
	  full: 'EEEE d MMMM y',
	  long: 'd MMMM y',
	  medium: 'd MMM y',
	  short: 'dd-MM-y'
	};
	var timeFormats$t = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$t = {
	  full: "{{date}} 'om' {{time}}",
	  long: "{{date}} 'om' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$t = {
	  date: buildFormatLongFn({
	    formats: dateFormats$t,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$t,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$t,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$r = {
	  lastWeek: "'afgelopen' eeee 'om' p",
	  yesterday: "'gisteren om' p",
	  today: "'vandaag om' p",
	  tomorrow: "'morgen om' p",
	  nextWeek: "eeee 'om' p",
	  other: 'P'
	};
	function formatRelative$s(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$r[token];
	}

	var eraValues$r = {
	  narrow: ['v.C.', 'n.C.'],
	  abbreviated: ['v.Chr.', 'n.Chr.'],
	  wide: ['voor Christus', 'na Christus']
	};
	var quarterValues$r = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['K1', 'K2', 'K3', 'K4'],
	  wide: ['1e kwartaal', '2e kwartaal', '3e kwartaal', '4e kwartaal']
	};
	var monthValues$r = {
	  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['jan.', 'feb.', 'mrt.', 'apr.', 'mei.', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
	  wide: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
	};
	var dayValues$r = {
	  narrow: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
	  short: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
	  abbreviated: ['zon', 'maa', 'din', 'woe', 'don', 'vri', 'zat'],
	  wide: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
	};
	var dayPeriodValues$r = {
	  narrow: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'middernacht',
	    noon: 'het middaguur',
	    morning: '\'s ochtends',
	    afternoon: '\'s middags',
	    evening: '\'s avonds',
	    night: '\'s nachts'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'middernacht',
	    noon: 'het middaguur',
	    morning: '\'s ochtends',
	    afternoon: '\'s middags',
	    evening: '\'s avonds',
	    night: '\'s nachts'
	  },
	  wide: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'middernacht',
	    noon: 'het middaguur',
	    morning: '\'s ochtends',
	    afternoon: '\'s middags',
	    evening: '\'s avonds',
	    night: '\'s nachts'
	  }
	};

	function ordinalNumber$r(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return number + 'e';
	}

	var localize$r = {
	  ordinalNumber: ordinalNumber$r,
	  era: buildLocalizeFn({
	    values: eraValues$r,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$r,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$r,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$r,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$r,
	    defaultWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$r = /^(\d+)e?/i;
	var parseOrdinalNumberPattern$r = /\d+/i;
	var matchEraPatterns$r = {
	  narrow: /^([vn]\.? ?C\.?)/,
	  abbreviated: /^([vn]\. ?Chr\.?)/,
	  wide: /^((voor|na) Christus)/
	};
	var parseEraPatterns$r = {
	  any: [/^v/, /^n/]
	};
	var matchQuarterPatterns$r = {
	  narrow: /^[1234]/i,
	  abbreviated: /^K[1234]/i,
	  wide: /^[1234]e kwartaal/i
	};
	var parseQuarterPatterns$r = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$r = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)\.?/i,
	  wide: /^(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)/i
	};
	var parseMonthPatterns$r = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^jan/i, /^feb/i, /^mrt/i, /^apr/i, /^mei/i, /^jun/i, /^jul/i, /^aug/i, /^sep/i, /^okt/i, /^nov/i, /^dec/i]
	};
	var matchDayPatterns$r = {
	  narrow: /^[zmdwv]/i,
	  short: /^(zo|ma|di|wo|do|vr|za)/i,
	  abbreviated: /^(zon|maa|din|woe|don|vri|zat)/i,
	  wide: /^(zondag|maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag)/i
	};
	var parseDayPatterns$r = {
	  narrow: [/^z/i, /^m/i, /^d/i, /^w/i, /^d/i, /^v/i, /^z/i],
	  any: [/^zo/i, /^ma/i, /^di/i, /^wo/i, /^do/i, /^vr/i, /^za/i]
	};
	var matchDayPeriodPatterns$r = {
	  any: /^(am|pm|middernacht|het middaguur|'s (ochtends|middags|avonds|nachts))/i
	};
	var parseDayPeriodPatterns$r = {
	  any: {
	    am: /^am/i,
	    pm: /^pm/i,
	    midnight: /^middernacht/i,
	    noon: /^het middaguur/i,
	    morning: /ochtend/i,
	    afternoon: /middag/i,
	    evening: /avond/i,
	    night: /nacht/i
	  }
	};
	var match$r = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$r,
	    parsePattern: parseOrdinalNumberPattern$r,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$r,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$r,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$r,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$r,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$r,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$r,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$r,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$r,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$r,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$r,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Dutch locale.
	 * @language Dutch
	 * @iso-639-2 nld
	 * @author Jorik Tangelder [@jtangelder]{@link https://github.com/jtangelder}
	 * @author Ruben Stolk [@rubenstolk]{@link https://github.com/rubenstolk}
	 * @author Lode Vanhove [@bitcrumb]{@link https://github.com/bitcrumb}
	 * @author Edo Rivai [@edorivai]{@link https://github.com/edorivai}
	 * @author Niels Keurentjes [@curry684]{@link https://github.com/curry684}
	 * @author Stefan Vermaas [@stefanvermaas]{@link https://github.com/stefanvermaas}
	 */

	var locale$t = {
	  formatDistance: formatDistance$t,
	  formatLong: formatLong$t,
	  formatRelative: formatRelative$s,
	  localize: localize$r,
	  match: match$r,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$s = {
	  lessThanXSeconds: {
	    singular: 'mindre enn eitt sekund',
	    plural: 'mindre enn {{count}} sekund'
	  },
	  xSeconds: {
	    singular: 'eitt sekund',
	    plural: '{{count}} sekund'
	  },
	  halfAMinute: 'eit halvt minutt',
	  lessThanXMinutes: {
	    singular: 'mindre enn eitt minutt',
	    plural: 'mindre enn {{count}} minutt'
	  },
	  xMinutes: {
	    singular: 'eitt minutt',
	    plural: '{{count}} minutt'
	  },
	  aboutXHours: {
	    singular: 'omtrent ein time',
	    plural: 'omtrent {{count}} timar'
	  },
	  xHours: {
	    singular: 'ein time',
	    plural: '{{count}} timar'
	  },
	  xDays: {
	    singular: 'ein dag',
	    plural: '{{count}} dagar'
	  },
	  aboutXMonths: {
	    singular: 'omtrent ein m??nad',
	    plural: 'omtrent {{count}} m??nader'
	  },
	  xMonths: {
	    singular: 'ein m??nad',
	    plural: '{{count}} m??nader'
	  },
	  aboutXYears: {
	    singular: 'omtrent eitt ??r',
	    plural: 'omtrent {{count}} ??r'
	  },
	  xYears: {
	    singular: 'eitt ??r',
	    plural: '{{count}} ??r'
	  },
	  overXYears: {
	    singular: 'over eitt ??r',
	    plural: 'over {{count}} ??r'
	  },
	  almostXYears: {
	    singular: 'nesten eitt ??r',
	    plural: 'nesten {{count}} ??r'
	  }
	};
	var wordMapping$1 = ['null', 'ein', 'to', 'tre', 'fire', 'fem', 'seks', 'sju', '??tte', 'ni', 'ti', 'elleve', 'tolv'];
	function formatDistance$u(token, count, options) {
	  options = options || {
	    onlyNumeric: false
	  };
	  var translation = formatDistanceLocale$s[token];
	  var result;

	  if (typeof translation === 'string') {
	    result = translation;
	  } else if (count === 0 || count > 1) {
	    if (options.onlyNumeric) {
	      result = translation.plural.replace('{{count}}', count);
	    } else {
	      result = translation.plural.replace('{{count}}', count < 13 ? wordMapping$1[count] : count);
	    }
	  } else {
	    result = translation.singular;
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'om ' + result;
	    } else {
	      return result + ' sidan';
	    }
	  }

	  return result;
	}

	var dateFormats$u = {
	  full: 'EEEE d. MMMM y',
	  long: 'd. MMMM y',
	  medium: 'd. MMM y',
	  short: 'dd.MM.y'
	};
	var timeFormats$u = {
	  full: "'kl'. HH:mm:ss zzzz",
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$u = {
	  full: "{{date}} 'kl.' {{time}}",
	  long: "{{date}} 'kl.' {{time}}",
	  medium: '{{date}} {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$u = {
	  date: buildFormatLongFn({
	    formats: dateFormats$u,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$u,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$u,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$s = {
	  lastWeek: "'f??rre' eeee 'kl.' p",
	  yesterday: "'i g??r kl.' p",
	  today: "'i dag kl.' p",
	  tomorrow: "'i morgon kl.' p",
	  nextWeek: "EEEE 'kl.' p",
	  other: 'P'
	};
	function formatRelative$t(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$s[token];
	}

	var eraValues$s = {
	  narrow: ['f.Kr.', 'e.Kr.'],
	  abbreviated: ['f.Kr.', 'e.Kr.'],
	  wide: ['f??r Kristus', 'etter Kristus']
	};
	var quarterValues$s = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
	  wide: ['1. kvartal', '2. kvartal', '3. kvartal', '4. kvartal']
	};
	var monthValues$s = {
	  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['jan.', 'feb.', 'mars', 'apr.', 'mai', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'des.'],
	  wide: ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember']
	};
	var dayValues$s = {
	  narrow: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
	  short: ['su', 'm??', 'ty', 'on', 'to', 'fr', 'lau'],
	  abbreviated: ['sun', 'm??n', 'tys', 'ons', 'tor', 'fre', 'laur'],
	  wide: ['sundag', 'm??ndag', 'tysdag', 'onsdag', 'torsdag', 'fredag', 'laurdag']
	};
	var dayPeriodValues$s = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'midnatt',
	    noon: 'middag',
	    morning: 'p?? morg.',
	    afternoon: 'p?? etterm.',
	    evening: 'p?? kvelden',
	    night: 'p?? natta'
	  },
	  abbreviated: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'midnatt',
	    noon: 'middag',
	    morning: 'p?? morg.',
	    afternoon: 'p?? etterm.',
	    evening: 'p?? kvelden',
	    night: 'p?? natta'
	  },
	  wide: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'midnatt',
	    noon: 'middag',
	    morning: 'p?? morgonen',
	    afternoon: 'p?? ettermiddagen',
	    evening: 'p?? kvelden',
	    night: 'p?? natta'
	  }
	};

	function ordinalNumber$s(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return number + '.';
	}

	var localize$s = {
	  ordinalNumber: ordinalNumber$s,
	  era: buildLocalizeFn({
	    values: eraValues$s,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$s,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$s,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$s,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$s,
	    defaultWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$s = /^(\d+)\.?/i;
	var parseOrdinalNumberPattern$s = /\d+/i;
	var matchEraPatterns$s = {
	  narrow: /^(f\.? ?Kr\.?|fvt\.?|e\.? ?Kr\.?|evt\.?)/i,
	  abbreviated: /^(f\.? ?Kr\.?|fvt\.?|e\.? ?Kr\.?|evt\.?)/i,
	  wide: /^(f??r Kristus|f??r v??r tid|etter Kristus|v??r tid)/i
	};
	var parseEraPatterns$s = {
	  any: [/^f/i, /^e/i]
	};
	var matchQuarterPatterns$s = {
	  narrow: /^[1234]/i,
	  abbreviated: /^q[1234]/i,
	  wide: /^[1234](\.)? kvartal/i
	};
	var parseQuarterPatterns$s = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$s = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(jan|feb|mar|apr|mai|jun|jul|aug|sep|okt|nov|des)\.?/i,
	  wide: /^(januar|februar|mars|april|mai|juni|juli|august|september|oktober|november|desember)/i
	};
	var parseMonthPatterns$s = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^mai/i, /^jun/i, /^jul/i, /^aug/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$s = {
	  narrow: /^[smtofl]/i,
	  short: /^(su|m??|ty|on|to|fr|la)/i,
	  abbreviated: /^(sun|m??n|tys|ons|tor|fre|laur)/i,
	  wide: /^(sundag|m??ndag|tysdag|onsdag|torsdag|fredag|laurdag)/i
	};
	var parseDayPatterns$s = {
	  any: [/^s/i, /^m/i, /^ty/i, /^o/i, /^to/i, /^f/i, /^l/i]
	};
	var matchDayPeriodPatterns$s = {
	  narrow: /^(midnatt|middag|(p??) (morgonen|ettermiddagen|kvelden|natta)|[ap])/i,
	  any: /^([ap]\.?\s?m\.?|midnatt|middag|(p??) (morgonen|ettermiddagen|kvelden|natta))/i
	};
	var parseDayPeriodPatterns$s = {
	  any: {
	    am: /^a(\.?\s?m\.?)?$/i,
	    pm: /^p(\.?\s?m\.?)?$/i,
	    midnight: /^midn/i,
	    noon: /^midd/i,
	    morning: /morgon/i,
	    afternoon: /ettermiddag/i,
	    evening: /kveld/i,
	    night: /natt/i
	  }
	};
	var match$s = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$s,
	    parsePattern: parseOrdinalNumberPattern$s,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$s,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$s,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$s,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$s,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$s,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$s,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$s,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$s,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$s,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$s,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Norwegian Nynorsk locale.
	 * @language Norwegian Nynorsk
	 * @iso-639-2 nno
	 * @author Mats Byrkjeland [@draperunner]{@link https://github.com/draperunner}
	 */

	var locale$u = {
	  formatDistance: formatDistance$u,
	  formatLong: formatLong$u,
	  formatRelative: formatRelative$t,
	  localize: localize$s,
	  match: match$s,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	function declensionGroup(scheme, count) {
	  if (count === 1) {
	    return scheme.one;
	  }

	  var rem100 = count % 100; // ends with 11-20

	  if (rem100 <= 20 && rem100 > 10) {
	    return scheme.other;
	  }

	  var rem10 = rem100 % 10; // ends with 2, 3, 4

	  if (rem10 >= 2 && rem10 <= 4) {
	    return scheme.twoFour;
	  }

	  return scheme.other;
	}

	function declension$1(scheme, count, time) {
	  time = time || 'regular';
	  var group = declensionGroup(scheme, count);
	  var finalText = group[time] || group;
	  return finalText.replace('{{count}}', count);
	}

	var formatDistanceLocale$t = {
	  lessThanXSeconds: {
	    one: {
	      regular: 'mniej ni?? sekunda',
	      past: 'mniej ni?? sekund??',
	      future: 'mniej ni?? sekund??'
	    },
	    twoFour: 'mniej ni?? {{count}} sekundy',
	    other: 'mniej ni?? {{count}} sekund'
	  },
	  xSeconds: {
	    one: {
	      regular: 'sekunda',
	      past: 'sekund??',
	      future: 'sekund??'
	    },
	    twoFour: '{{count}} sekundy',
	    other: '{{count}} sekund'
	  },
	  halfAMinute: {
	    one: 'p???? minuty',
	    twoFour: 'p???? minuty',
	    other: 'p???? minuty'
	  },
	  lessThanXMinutes: {
	    one: {
	      regular: 'mniej ni?? minuta',
	      past: 'mniej ni?? minut??',
	      future: 'mniej ni?? minut??'
	    },
	    twoFour: 'mniej ni?? {{count}} minuty',
	    other: 'mniej ni?? {{count}} minut'
	  },
	  xMinutes: {
	    one: {
	      regular: 'minuta',
	      past: 'minut??',
	      future: 'minut??'
	    },
	    twoFour: '{{count}} minuty',
	    other: '{{count}} minut'
	  },
	  aboutXHours: {
	    one: {
	      regular: 'oko??o godzina',
	      past: 'oko??o godziny',
	      future: 'oko??o godzin??'
	    },
	    twoFour: 'oko??o {{count}} godziny',
	    other: 'oko??o {{count}} godzin'
	  },
	  xHours: {
	    one: {
	      regular: 'godzina',
	      past: 'godzin??',
	      future: 'godzin??'
	    },
	    twoFour: '{{count}} godziny',
	    other: '{{count}} godzin'
	  },
	  xDays: {
	    one: {
	      regular: 'dzie??',
	      past: 'dzie??',
	      future: '1 dzie??'
	    },
	    twoFour: '{{count}} dni',
	    other: '{{count}} dni'
	  },
	  aboutXMonths: {
	    one: 'oko??o miesi??c',
	    twoFour: 'oko??o {{count}} miesi??ce',
	    other: 'oko??o {{count}} miesi??cy'
	  },
	  xMonths: {
	    one: 'miesi??c',
	    twoFour: '{{count}} miesi??ce',
	    other: '{{count}} miesi??cy'
	  },
	  aboutXYears: {
	    one: 'oko??o rok',
	    twoFour: 'oko??o {{count}} lata',
	    other: 'oko??o {{count}} lat'
	  },
	  xYears: {
	    one: 'rok',
	    twoFour: '{{count}} lata',
	    other: '{{count}} lat'
	  },
	  overXYears: {
	    one: 'ponad rok',
	    twoFour: 'ponad {{count}} lata',
	    other: 'ponad {{count}} lat'
	  },
	  almostXYears: {
	    one: 'prawie rok',
	    twoFour: 'prawie {{count}} lata',
	    other: 'prawie {{count}} lat'
	  }
	};
	function formatDistance$v(token, count, options) {
	  options = options || {};
	  var scheme = formatDistanceLocale$t[token];

	  if (!options.addSuffix) {
	    return declension$1(scheme, count);
	  }

	  if (options.comparison > 0) {
	    return 'za ' + declension$1(scheme, count, 'future');
	  } else {
	    return declension$1(scheme, count, 'past') + ' temu';
	  }
	}

	var dateFormats$v = {
	  full: 'EEEE, do MMMM y',
	  long: 'do MMMM y',
	  medium: 'do MMM y',
	  short: 'dd.MM.y'
	};
	var timeFormats$v = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$v = {
	  full: '{{date}} {{time}}',
	  long: '{{date}} {{time}}',
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$v = {
	  date: buildFormatLongFn({
	    formats: dateFormats$v,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$v,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$v,
	    defaultWidth: 'full'
	  })
	};

	var adjectivesLastWeek = {
	  masculine: 'ostatni',
	  feminine: 'ostatnia'
	};
	var adjectivesThisWeek = {
	  masculine: 'ten',
	  feminine: 'ta'
	};
	var adjectivesNextWeek = {
	  masculine: 'nast??pny',
	  feminine: 'nast??pna'
	};
	var dayGrammaticalGender = {
	  0: 'feminine',
	  1: 'masculine',
	  2: 'masculine',
	  3: 'feminine',
	  4: 'masculine',
	  5: 'masculine',
	  6: 'feminine'
	};

	function getAdjectives(token, date, baseDate, options) {
	  if (isSameUTCWeek(date, baseDate, options)) {
	    return adjectivesThisWeek;
	  } else if (token === 'lastWeek') {
	    return adjectivesLastWeek;
	  } else if (token === 'nextWeek') {
	    return adjectivesNextWeek;
	  } else {
	    throw new Error("Cannot determine adjectives for token ".concat(token));
	  }
	}

	function getAdjective(token, date, baseDate, options) {
	  var day = date.getUTCDay();
	  var adjectives = getAdjectives(token, date, baseDate, options);
	  var grammaticalGender = dayGrammaticalGender[day];
	  return adjectives[grammaticalGender];
	}

	function dayAndTimeWithAdjective(token, date, baseDate, options) {
	  var adjective = getAdjective(token, date, baseDate, options);
	  return "'".concat(adjective, "' eeee 'o' p");
	}

	var formatRelativeLocale$t = {
	  lastWeek: dayAndTimeWithAdjective,
	  yesterday: "'wczoraj o' p",
	  today: "'dzisiaj o' p",
	  tomorrow: "'jutro o' p",
	  nextWeek: dayAndTimeWithAdjective,
	  other: 'P'
	};
	function formatRelative$u(token, date, baseDate, options) {
	  var format = formatRelativeLocale$t[token];

	  if (typeof format === 'function') {
	    return format(token, date, baseDate, options);
	  }

	  return format;
	}

	function ordinalNumber$t(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return String(number);
	}

	var eraValues$t = {
	  narrow: ['p.n.e.', 'n.e.'],
	  abbreviated: ['p.n.e.', 'n.e.'],
	  wide: ['przed nasz?? er??', 'naszej ery']
	};
	var quarterValues$t = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['I kw.', 'II kw.', 'III kw.', 'IV kw.'],
	  wide: ['I kwarta??', 'II kwarta??', 'III kwarta??', 'IV kwarta??']
	};
	var monthValues$t = {
	  narrow: ['S', 'L', 'M', 'K', 'M', 'C', 'L', 'S', 'W', 'P', 'L', 'G'],
	  abbreviated: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'pa??', 'lis', 'gru'],
	  wide: ['stycze??', 'luty', 'marzec', 'kwiecie??', 'maj', 'czerwiec', 'lipiec', 'sierpie??', 'wrzesie??', 'pa??dziernik', 'listopad', 'grudzie??']
	};
	var monthFormattingValues = {
	  narrow: ['s', 'l', 'm', 'k', 'm', 'c', 'l', 's', 'w', 'p', 'l', 'g'],
	  abbreviated: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'pa??', 'lis', 'gru'],
	  wide: ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'wrze??nia', 'pa??dziernika', 'listopada', 'grudnia']
	};
	var dayValues$t = {
	  narrow: ['N', 'P', 'W', '??', 'C', 'P', 'S'],
	  short: ['nie', 'pon', 'wto', '??ro', 'czw', 'pi??', 'sob'],
	  abbreviated: ['niedz.', 'pon.', 'wt.', '??r.', 'czw.', 'pt.', 'sob.'],
	  wide: ['niedziela', 'poniedzia??ek', 'wtorek', '??roda', 'czwartek', 'pi??tek', 'sobota']
	};
	var dayFormattingValues = {
	  narrow: ['n', 'p', 'w', '??', 'c', 'p', 's'],
	  short: ['nie', 'pon', 'wto', '??ro', 'czw', 'pi??', 'sob'],
	  abbreviated: ['niedz.', 'pon.', 'wt.', '??r.', 'czw.', 'pt.', 'sob.'],
	  wide: ['niedziela', 'poniedzia??ek', 'wtorek', '??roda', 'czwartek', 'pi??tek', 'sobota']
	};
	var dayPeriodValues$t = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'p????n.',
	    noon: 'po??',
	    morning: 'rano',
	    afternoon: 'popo??.',
	    evening: 'wiecz.',
	    night: 'noc'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'p????noc',
	    noon: 'po??udnie',
	    morning: 'rano',
	    afternoon: 'popo??udnie',
	    evening: 'wiecz??r',
	    night: 'noc'
	  },
	  wide: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'p????noc',
	    noon: 'po??udnie',
	    morning: 'rano',
	    afternoon: 'popo??udnie',
	    evening: 'wiecz??r',
	    night: 'noc'
	  }
	};
	var dayPeriodFormattingValues = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'o p????n.',
	    noon: 'w po??.',
	    morning: 'rano',
	    afternoon: 'po po??.',
	    evening: 'wiecz.',
	    night: 'w nocy'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'o p????nocy',
	    noon: 'w po??udnie',
	    morning: 'rano',
	    afternoon: 'po po??udniu',
	    evening: 'wieczorem',
	    night: 'w nocy'
	  },
	  wide: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'o p????nocy',
	    noon: 'w po??udnie',
	    morning: 'rano',
	    afternoon: 'po po??udniu',
	    evening: 'wieczorem',
	    night: 'w nocy'
	  }
	};
	var localize$t = {
	  ordinalNumber: ordinalNumber$t,
	  era: buildLocalizeFn({
	    values: eraValues$t,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$t,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$t,
	    defaultWidth: 'wide',
	    formattingValues: monthFormattingValues,
	    defaultFormattingWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$t,
	    defaultWidth: 'wide',
	    formattingValues: dayFormattingValues,
	    defaultFormattingWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$t,
	    defaultWidth: 'wide',
	    formattingValues: dayPeriodFormattingValues,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$t = /^(\d+)?/i;
	var parseOrdinalNumberPattern$t = /\d+/i;
	var matchEraPatterns$t = {
	  narrow: /^(p\.?\s*n\.?\s*e\.?\s*|n\.?\s*e\.?\s*)/i,
	  abbreviated: /^(p\.?\s*n\.?\s*e\.?\s*|n\.?\s*e\.?\s*)/i,
	  wide: /^(przed\s*nasz(??|a)\s*er(??|a)|naszej\s*ery)/i
	};
	var parseEraPatterns$t = {
	  any: [/^p/i, /^n/i]
	};
	var matchQuarterPatterns$t = {
	  narrow: /^[1234]/i,
	  abbreviated: /^(I|II|III|IV)\s*kw\.?/i,
	  wide: /^(I|II|III|IV)\s*kwarta(??|l)/i
	};
	var parseQuarterPatterns$t = {
	  narrow: [/1/i, /2/i, /3/i, /4/i],
	  any: [/^I kw/i, /^II kw/i, /^III kw/i, /^IV kw/i]
	};
	var matchMonthPatterns$t = {
	  narrow: /^[slmkcwpg]/i,
	  abbreviated: /^(sty|lut|mar|kwi|maj|cze|lip|sie|wrz|pa(??|z)|lis|gru)/i,
	  wide: /^(stycze(??|n)|stycznia|luty|lutego|marzec|marca|kwiecie(??|n)|kwietnia|maj|maja|czerwiec|czerwca|lipiec|lipca|sierpie(??|n)|sierpnia|wrzesie(??|n)|wrze(??|s)nia|pa(??|z)dziernik|pa(??|z)dziernika|listopad|listopada|grudzie(??|n)|grudnia)/i
	};
	var parseMonthPatterns$t = {
	  narrow: [/^s/i, /^l/i, /^m/i, /^k/i, /^m/i, /^c/i, /^l/i, /^s/i, /^w/i, /^p/i, /^l/i, /^g/i],
	  any: [/^st/i, /^lu/i, /^mar/i, /^k/i, /^maj/i, /^c/i, /^lip/i, /^si/i, /^w/i, /^p/i, /^lis/i, /^g/i]
	};
	var matchDayPatterns$t = {
	  narrow: /^[npw??cs]/i,
	  short: /^(nie|pon|wto|(??|s)ro|czw|pi(??|a)|sob)/i,
	  abbreviated: /^(niedz|pon|wt|(??|s)r|czw|pt|sob)\.?/i,
	  wide: /^(niedziela|poniedzia(??|l)ek|wtorek|(??|s)roda|czwartek|pi(??|a)tek|sobota)/i
	};
	var parseDayPatterns$t = {
	  narrow: [/^n/i, /^p/i, /^w/i, /^??/i, /^c/i, /^p/i, /^s/i],
	  abbreviated: [/^n/i, /^po/i, /^w/i, /^(??|s)r/i, /^c/i, /^pt/i, /^so/i],
	  any: [/^n/i, /^po/i, /^w/i, /^(??|s)r/i, /^c/i, /^pi/i, /^so/i]
	};
	var matchDayPeriodPatterns$t = {
	  narrow: /^(^a$|^p$|p??(??|l)n\.?|o\s*p??(??|l)n\.?|po(??|l)\.?|w\s*po(??|l)\.?|po\s*po(??|l)\.?|rano|wiecz\.?|noc|w\s*nocy)/i,
	  any: /^(am|pm|p??(??|l)noc|o\s*p??(??|l)nocy|po(??|l)udnie|w\s*po(??|l)udnie|popo(??|l)udnie|po\s*po(??|l)udniu|rano|wiecz??r|wieczorem|noc|w\s*nocy)/i
	};
	var parseDayPeriodPatterns$t = {
	  narrow: {
	    am: /^a$/i,
	    pm: /^p$/i,
	    midnight: /p??(??|l)n/i,
	    noon: /po(??|l)/i,
	    morning: /rano/i,
	    afternoon: /po\s*po(??|l)/i,
	    evening: /wiecz/i,
	    night: /noc/i
	  },
	  any: {
	    am: /^am/i,
	    pm: /^pm/i,
	    midnight: /p??(??|l)n/i,
	    noon: /po(??|l)/i,
	    morning: /rano/i,
	    afternoon: /po\s*po(??|l)/i,
	    evening: /wiecz/i,
	    night: /noc/i
	  }
	};
	var match$t = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$t,
	    parsePattern: parseOrdinalNumberPattern$t,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$t,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$t,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$t,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$t,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$t,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$t,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$t,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$t,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$t,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$t,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Polish locale.
	 * @language Polish
	 * @iso-639-2 pol
	 * @author Mateusz Derks [@ertrzyiks]{@link https://github.com/ertrzyiks}
	 * @author Just RAG [@justrag]{@link https://github.com/justrag}
	 * @author Mikolaj Grzyb [@mikolajgrzyb]{@link https://github.com/mikolajgrzyb}
	 * @author Mateusz Tokarski [@mutisz]{@link https://github.com/mutisz}
	 */

	var locale$v = {
	  formatDistance: formatDistance$v,
	  formatLong: formatLong$v,
	  formatRelative: formatRelative$u,
	  localize: localize$t,
	  match: match$t,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$u = {
	  lessThanXSeconds: {
	    one: 'menos de um segundo',
	    other: 'menos de {{count}} segundos'
	  },
	  xSeconds: {
	    one: '1 segundo',
	    other: '{{count}} segundos'
	  },
	  halfAMinute: 'meio minuto',
	  lessThanXMinutes: {
	    one: 'menos de um minuto',
	    other: 'menos de {{count}} minutos'
	  },
	  xMinutes: {
	    one: '1 minuto',
	    other: '{{count}} minutos'
	  },
	  aboutXHours: {
	    one: 'aproximadamente 1 hora',
	    other: 'aproximadamente {{count}} horas'
	  },
	  xHours: {
	    one: '1 hora',
	    other: '{{count}} horas'
	  },
	  xDays: {
	    one: '1 dia',
	    other: '{{count}} dias'
	  },
	  aboutXMonths: {
	    one: 'aproximadamente 1 m??s',
	    other: 'aproximadamente {{count}} meses'
	  },
	  xMonths: {
	    one: '1 m??s',
	    other: '{{count}} meses'
	  },
	  aboutXYears: {
	    one: 'aproximadamente 1 ano',
	    other: 'aproximadamente {{count}} anos'
	  },
	  xYears: {
	    one: '1 ano',
	    other: '{{count}} anos'
	  },
	  overXYears: {
	    one: 'mais de 1 ano',
	    other: 'mais de {{count}} anos'
	  },
	  almostXYears: {
	    one: 'quase 1 ano',
	    other: 'quase {{count}} anos'
	  }
	};
	function formatDistance$w(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$u[token] === 'string') {
	    result = formatDistanceLocale$u[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$u[token].one;
	  } else {
	    result = formatDistanceLocale$u[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'daqui a ' + result;
	    } else {
	      return 'h?? ' + result;
	    }
	  }

	  return result;
	}

	var dateFormats$w = {
	  full: "EEEE, d 'de' MMMM 'de' y",
	  long: "d 'de' MMMM 'de' y",
	  medium: "d 'de' MMM 'de' y",
	  short: 'dd/MM/y'
	};
	var timeFormats$w = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$w = {
	  full: "{{date}} '??s' {{time}}",
	  long: "{{date}} '??s' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$w = {
	  date: buildFormatLongFn({
	    formats: dateFormats$w,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$w,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$w,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$u = {
	  lastWeek: "'na ??ltima' eeee '??s' p",
	  yesterday: "'ontem ??s' p",
	  today: "'hoje ??s' p",
	  tomorrow: "'amanh?? ??s' p",
	  nextWeek: "eeee '??s' p",
	  other: 'P'
	};
	function formatRelative$v(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$u[token];
	}

	function ordinalNumber$u(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return number + '??';
	}

	var eraValues$u = {
	  narrow: ['aC', 'dC'],
	  abbreviated: ['a.C.', 'd.C.'],
	  wide: ['antes de Cristo', 'depois de Cristo']
	};
	var quarterValues$u = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['T1', 'T2', 'T3', 'T4'],
	  wide: ['1?? trimestre', '2?? trimestre', '3?? trimestre', '4?? trimestre']
	};
	var monthValues$u = {
	  narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
	  abbreviated: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
	  wide: ['janeiro', 'fevereiro', 'mar??o', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
	};
	var dayValues$u = {
	  narrow: ['d', 's', 't', 'q', 'q', 's', 's'],
	  short: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 's??b'],
	  abbreviated: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 's??b'],
	  wide: ['domingo', 'segunda-feira', 'ter??a-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 's??bado']
	};
	var dayPeriodValues$u = {
	  narrow: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'meia-noite',
	    noon: 'meio-dia',
	    morning: 'manh??',
	    afternoon: 'tarde',
	    evening: 'noite',
	    night: 'madrugada'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'meia-noite',
	    noon: 'meio-dia',
	    morning: 'manh??',
	    afternoon: 'tarde',
	    evening: 'noite',
	    night: 'madrugada'
	  },
	  wide: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'meia-noite',
	    noon: 'meio-dia',
	    morning: 'manh??',
	    afternoon: 'tarde',
	    evening: 'noite',
	    night: 'madrugada'
	  }
	};
	var formattingDayPeriodValues$l = {
	  narrow: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'meia-noite',
	    noon: 'meio-dia',
	    morning: 'da manh??',
	    afternoon: 'da tarde',
	    evening: 'da noite',
	    night: 'da madrugada'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'meia-noite',
	    noon: 'meio-dia',
	    morning: 'da manh??',
	    afternoon: 'da tarde',
	    evening: 'da noite',
	    night: 'da madrugada'
	  },
	  wide: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'meia-noite',
	    noon: 'meio-dia',
	    morning: 'da manh??',
	    afternoon: 'da tarde',
	    evening: 'da noite',
	    night: 'da madrugada'
	  }
	};
	var localize$u = {
	  ordinalNumber: ordinalNumber$u,
	  era: buildLocalizeFn({
	    values: eraValues$u,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$u,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$u,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$u,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$u,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$l,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$u = /^(\d+)(??|??)?/i;
	var parseOrdinalNumberPattern$u = /\d+/i;
	var matchEraPatterns$u = {
	  narrow: /^(ac|dc|a|d)/i,
	  abbreviated: /^(a\.?\s?c\.?|a\.?\s?e\.?\s?c\.?|d\.?\s?c\.?|e\.?\s?c\.?)/i,
	  wide: /^(antes de cristo|antes da era comum|depois de cristo|era comum)/i
	};
	var parseEraPatterns$u = {
	  any: [/^ac/i, /^dc/i],
	  wide: [/^(antes de cristo|antes da era comum)/i, /^(depois de cristo|era comum)/i]
	};
	var matchQuarterPatterns$u = {
	  narrow: /^[1234]/i,
	  abbreviated: /^T[1234]/i,
	  wide: /^[1234](??|??)? trimestre/i
	};
	var parseQuarterPatterns$u = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$u = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/i,
	  wide: /^(janeiro|fevereiro|mar??o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/i
	};
	var parseMonthPatterns$u = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^f/i, /^mar/i, /^ab/i, /^may/i, /^jun/i, /^jul/i, /^ag/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$u = {
	  narrow: /^[dstq]/i,
	  short: /^(dom|seg|ter|qua|qui|sex|s[??a]b)/i,
	  abbreviated: /^(dom|seg|ter|qua|qui|sex|s[??a]b)/i,
	  wide: /^(domingo|segunda-?\s?feira|ter??a-?\s?feira|quarta-?\s?feira|quinta-?\s?feira|sexta-?\s?feira|s[??a]bado)/i
	};
	var parseDayPatterns$u = {
	  narrow: [/^d/i, /^s/i, /^t/i, /^q/i, /^q/i, /^s/i, /^s/i],
	  any: [/^d/i, /^seg/i, /^t/i, /^qua/i, /^qui/i, /^sex/i, /^s[??a]/i]
	};
	var matchDayPeriodPatterns$u = {
	  narrow: /^(a|p|meia-?\s?noite|meio-?\s?dia|(da) (manh[??a]|tarde|noite|madrugada))/i,
	  any: /^([ap]\.?\s?m\.?|meia-?\s?noite|meio-?\s?dia|(da) (manh[??a]|tarde|noite|madrugada))/i
	};
	var parseDayPeriodPatterns$u = {
	  any: {
	    am: /^a/i,
	    pm: /^p/i,
	    midnight: /^meia/i,
	    noon: /^meio/i,
	    morning: /manh[??a]/i,
	    afternoon: /tarde/i,
	    evening: /noite/i,
	    night: /madrugada/i
	  }
	};
	var match$u = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$u,
	    parsePattern: parseOrdinalNumberPattern$u,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$u,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$u,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$u,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$u,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$u,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$u,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$u,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$u,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$u,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$u,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Portuguese locale.
	 * @language Portuguese
	 * @iso-639-2 por
	 * @author D??rio Freire [@dfreire]{@link https://github.com/dfreire}
	 * @author Adri??n de la Rosa [@adrm]{@link https://github.com/adrm}
	 */

	var locale$w = {
	  formatDistance: formatDistance$w,
	  formatLong: formatLong$w,
	  formatRelative: formatRelative$v,
	  localize: localize$u,
	  match: match$u,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$v = {
	  lessThanXSeconds: {
	    one: 'menos de um segundo',
	    other: 'menos de {{count}} segundos'
	  },
	  xSeconds: {
	    one: '1 segundo',
	    other: '{{count}} segundos'
	  },
	  halfAMinute: 'meio minuto',
	  lessThanXMinutes: {
	    one: 'menos de um minuto',
	    other: 'menos de {{count}} minutos'
	  },
	  xMinutes: {
	    one: '1 minuto',
	    other: '{{count}} minutos'
	  },
	  aboutXHours: {
	    one: 'cerca de 1 hora',
	    other: 'cerca de {{count}} horas'
	  },
	  xHours: {
	    one: '1 hora',
	    other: '{{count}} horas'
	  },
	  xDays: {
	    one: '1 dia',
	    other: '{{count}} dias'
	  },
	  aboutXMonths: {
	    one: 'cerca de 1 m??s',
	    other: 'cerca de {{count}} meses'
	  },
	  xMonths: {
	    one: '1 m??s',
	    other: '{{count}} meses'
	  },
	  aboutXYears: {
	    one: 'cerca de 1 ano',
	    other: 'cerca de {{count}} anos'
	  },
	  xYears: {
	    one: '1 ano',
	    other: '{{count}} anos'
	  },
	  overXYears: {
	    one: 'mais de 1 ano',
	    other: 'mais de {{count}} anos'
	  },
	  almostXYears: {
	    one: 'quase 1 ano',
	    other: 'quase {{count}} anos'
	  }
	};
	function formatDistance$x(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$v[token] === 'string') {
	    result = formatDistanceLocale$v[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$v[token].one;
	  } else {
	    result = formatDistanceLocale$v[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'em ' + result;
	    } else {
	      return 'h?? ' + result;
	    }
	  }

	  return result;
	}

	var dateFormats$x = {
	  full: "EEEE, d 'de' MMMM 'de' y",
	  long: "d 'de' MMMM 'de' y",
	  medium: 'd MMM y',
	  short: 'dd/MM/yyyy'
	};
	var timeFormats$x = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$x = {
	  full: "{{date}} '??s' {{time}}",
	  long: "{{date}} '??s' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$x = {
	  date: buildFormatLongFn({
	    formats: dateFormats$x,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$x,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$x,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$v = {
	  lastWeek: function (date, _baseDate, _options) {
	    var weekday = date.getUTCDay();
	    var last = weekday === 0 || weekday === 6 ? '??ltimo' : '??ltima';
	    return "'" + last + "' eeee '??s' p";
	  },
	  yesterday: "'ontem ??s' p",
	  today: "'hoje ??s' p",
	  tomorrow: "'amanh?? ??s' p",
	  nextWeek: "eeee '??s' p",
	  other: 'P'
	};
	function formatRelative$w(token, date, baseDate, options) {
	  var format = formatRelativeLocale$v[token];

	  if (typeof format === 'function') {
	    return format(date, baseDate, options);
	  }

	  return format;
	}

	var eraValues$v = {
	  narrow: ['AC', 'DC'],
	  abbreviated: ['AC', 'DC'],
	  wide: ['antes de cristo', 'depois de cristo']
	};
	var quarterValues$v = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['T1', 'T2', 'T3', 'T4'],
	  wide: ['1?? trimestre', '2?? trimestre', '3?? trimestre', '4?? trimestre']
	};
	var monthValues$v = {
	  narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
	  abbreviated: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
	  wide: ['janeiro', 'fevereiro', 'mar??o', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
	};
	var dayValues$v = {
	  narrow: ['do', '2??', '3??', '4??', '5??', '6??', 's??'],
	  short: ['do', '2??', '3??', '4??', '5??', '6??', 's??'],
	  abbreviated: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 's??b'],
	  wide: ['domingo', 'segunda', 'ter??a', 'quarta', 'quinta', 'sexta', 's??bado']
	};
	var dayPeriodValues$v = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'mn',
	    noon: 'md',
	    morning: 'manh??',
	    afternoon: 'tarde',
	    evening: 'tarde',
	    night: 'noite'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'meia-noite',
	    noon: 'meio-dia',
	    morning: 'manh??',
	    afternoon: 'tarde',
	    evening: 'tarde',
	    night: 'noite'
	  },
	  wide: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'meia-noite',
	    noon: 'meio-dia',
	    morning: 'manh??',
	    afternoon: 'tarde',
	    evening: 'tarde',
	    night: 'noite'
	  }
	};
	var formattingDayPeriodValues$m = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'mn',
	    noon: 'md',
	    morning: 'da manh??',
	    afternoon: 'da tarde',
	    evening: 'da tarde',
	    night: 'da noite'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'meia-noite',
	    noon: 'meio-dia',
	    morning: 'da manh??',
	    afternoon: 'da tarde',
	    evening: 'da tarde',
	    night: 'da noite'
	  },
	  wide: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'meia-noite',
	    noon: 'meio-dia',
	    morning: 'da manh??',
	    afternoon: 'da tarde',
	    evening: 'da tarde',
	    night: 'da noite'
	  }
	};

	function ordinalNumber$v(dirtyNumber, dirtyOptions) {
	  var number = Number(dirtyNumber);
	  var options = dirtyOptions || {};
	  var unit = String(options.unit);

	  if (unit === 'week' || unit === 'isoWeek') {
	    return number + '??';
	  }

	  return number + '??';
	}

	var localize$v = {
	  ordinalNumber: ordinalNumber$v,
	  era: buildLocalizeFn({
	    values: eraValues$v,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$v,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$v,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$v,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$v,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$m,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$v = /^(\d+)[????o]?/i;
	var parseOrdinalNumberPattern$v = /\d+/i;
	var matchEraPatterns$v = {
	  narrow: /^(ac|dc|a|d)/i,
	  abbreviated: /^(a\.?\s?c\.?|d\.?\s?c\.?)/i,
	  wide: /^(antes de cristo|depois de cristo)/i
	};
	var parseEraPatterns$v = {
	  any: [/^ac/i, /^dc/i],
	  wide: [/^antes de cristo/i, /^depois de cristo/i]
	};
	var matchQuarterPatterns$v = {
	  narrow: /^[1234]/i,
	  abbreviated: /^T[1234]/i,
	  wide: /^[1234](??)? trimestre/i
	};
	var parseQuarterPatterns$v = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$v = {
	  narrow: /^[jfmajsond]/i,
	  abbreviated: /^(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/i,
	  wide: /^(janeiro|fevereiro|mar??o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/i
	};
	var parseMonthPatterns$v = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^fev/i, /^mar/i, /^abr/i, /^mai/i, /^jun/i, /^jul/i, /^ago/i, /^set/i, /^out/i, /^nov/i, /^dez/i]
	};
	var matchDayPatterns$v = {
	  narrow: /^(dom|[23456]???|s[a??]b)/i,
	  short: /^(dom|[23456]???|s[a??]b)/i,
	  abbreviated: /^(dom|seg|ter|qua|qui|sex|s[a??]b)/i,
	  wide: /^(domingo|(segunda|ter[c??]a|quarta|quinta|sexta)([- ]feira)?|s[a??]bado)/i
	};
	var parseDayPatterns$v = {
	  short: [/^d/i, /^2/i, /^3/i, /^4/i, /^5/i, /^6/i, /^s[a??]/i],
	  narrow: [/^d/i, /^2/i, /^3/i, /^4/i, /^5/i, /^6/i, /^s[a??]/i],
	  any: [/^d/i, /^seg/i, /^t/i, /^qua/i, /^qui/i, /^sex/i, /^s[a??]b/i]
	};
	var matchDayPeriodPatterns$v = {
	  narrow: /^(a|p|mn|md|(da) (manh??|tarde|noite))/i,
	  any: /^([ap]\.?\s?m\.?|meia[-\s]noite|meio[-\s]dia|(da) (manh??|tarde|noite))/i
	};
	var parseDayPeriodPatterns$v = {
	  any: {
	    am: /^a/i,
	    pm: /^p/i,
	    midnight: /^mn|^meia[-\s]noite/i,
	    noon: /^md|^meio[-\s]dia/i,
	    morning: /manh??/i,
	    afternoon: /tarde/i,
	    evening: /tarde/i,
	    night: /noite/i
	  }
	};
	var match$v = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$v,
	    parsePattern: parseOrdinalNumberPattern$v,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$v,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$v,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$v,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$v,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$v,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$v,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$v,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$v,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$v,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$v,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Portuguese locale (Brazil).
	 * @language Portuguese
	 * @iso-639-2 por
	 * @author Lucas Duailibe [@duailibe]{@link https://github.com/duailibe}
	 * @author Yago Carballo [@yagocarballo]{@link https://github.com/YagoCarballo}
	 */

	var locale$x = {
	  formatDistance: formatDistance$x,
	  formatLong: formatLong$x,
	  formatRelative: formatRelative$w,
	  localize: localize$v,
	  match: match$v,
	  options: {
	    weekStartsOn: 0
	    /* Sunday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	var formatDistanceLocale$w = {
	  lessThanXSeconds: {
	    one: 'mai pu??in de o secund??',
	    other: 'mai pu??in de {{count}} secunde'
	  },
	  xSeconds: {
	    one: '1 secund??',
	    other: '{{count}} secunde'
	  },
	  halfAMinute: 'jum??tate de minut',
	  lessThanXMinutes: {
	    one: 'mai pu??in de un minut',
	    other: 'mai pu??in de {{count}} minute'
	  },
	  xMinutes: {
	    one: '1 minut',
	    other: '{{count}} minute'
	  },
	  aboutXHours: {
	    one: 'circa 1 or??',
	    other: 'circa {{count}} ore'
	  },
	  xHours: {
	    one: '1 or??',
	    other: '{{count}} ore'
	  },
	  xDays: {
	    one: '1 zi',
	    other: '{{count}} zile'
	  },
	  aboutXMonths: {
	    one: 'circa 1 lun??',
	    other: 'circa {{count}} luni'
	  },
	  xMonths: {
	    one: '1 lun??',
	    other: '{{count}} luni'
	  },
	  aboutXYears: {
	    one: 'circa 1 an',
	    other: 'circa {{count}} ani'
	  },
	  xYears: {
	    one: '1 an',
	    other: '{{count}} ani'
	  },
	  overXYears: {
	    one: 'peste 1 an',
	    other: 'peste {{count}} ani'
	  },
	  almostXYears: {
	    one: 'aproape 1 an',
	    other: 'aproape {{count}} ani'
	  }
	};
	function formatDistance$y(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$w[token] === 'string') {
	    result = formatDistanceLocale$w[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$w[token].one;
	  } else {
	    result = formatDistanceLocale$w[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return '??n ' + result;
	    } else {
	      return result + ' ??n urm??';
	    }
	  }

	  return result;
	}

	var dateFormats$y = {
	  full: 'EEEE, d MMMM yyyy',
	  long: 'd MMMM yyyy',
	  medium: 'd MMM yyyy',
	  short: 'dd/MM/yyyy'
	};
	var timeFormats$y = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$y = {
	  full: "{{date}} 'la' {{time}}",
	  long: "{{date}} 'la' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$y = {
	  date: buildFormatLongFn({
	    formats: dateFormats$y,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$y,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$y,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$w = {
	  lastWeek: "eeee 'trecut?? la' p",
	  yesterday: "'ieri la' p",
	  today: "'ast??zi la' p",
	  tomorrow: "'m??ine la' p",
	  nextWeek: "eeee 'viitoare la' p",
	  other: 'P'
	};
	function formatRelative$x(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$w[token];
	}

	var eraValues$w = {
	  narrow: ['??', 'D'],
	  abbreviated: ['??.d.C.', 'D.C.'],
	  wide: ['??nainte de Cristos', 'Dup?? Cristos']
	};
	var quarterValues$w = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['T1', 'T2', 'T3', 'T4'],
	  wide: ['primul trimestru', 'al doilea trimestru', 'al treilea trimestru', 'al patrulea trimestru']
	};
	var monthValues$w = {
	  narrow: ['I', 'F', 'M', 'A', 'M', 'I', 'I', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'noi', 'dec'],
	  wide: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
	};
	var dayValues$w = {
	  narrow: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
	  short: ['du', 'lu', 'ma', 'mi', 'jo', 'vi', 's??'],
	  abbreviated: ['dum', 'lun', 'mar', 'mie', 'joi', 'vin', 's??m'],
	  wide: ['duminic??', 'luni', 'mar??i', 'miercuri', 'joi', 'vineri', 's??mb??t??']
	};
	var dayPeriodValues$w = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'mn',
	    noon: 'ami',
	    morning: 'dim',
	    afternoon: 'da',
	    evening: 's',
	    night: 'n'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'miezul nop??ii',
	    noon: 'amiaz??',
	    morning: 'diminea????',
	    afternoon: 'dup??-amiaz??',
	    evening: 'sear??',
	    night: 'noapte'
	  },
	  wide: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'miezul nop??ii',
	    noon: 'amiaz??',
	    morning: 'diminea????',
	    afternoon: 'dup??-amiaz??',
	    evening: 'sear??',
	    night: 'noapte'
	  }
	};
	var formattingDayPeriodValues$n = {
	  narrow: {
	    am: 'a',
	    pm: 'p',
	    midnight: 'mn',
	    noon: 'amiaz??',
	    morning: 'diminea????',
	    afternoon: 'dup??-amiaz??',
	    evening: 'sear??',
	    night: 'noapte'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'miezul nop??ii',
	    noon: 'amiaz??',
	    morning: 'diminea????',
	    afternoon: 'dup??-amiaz??',
	    evening: 'sear??',
	    night: 'noapte'
	  },
	  wide: {
	    am: 'a.m.',
	    pm: 'p.m.',
	    midnight: 'miezul nop??ii',
	    noon: 'amiaz??',
	    morning: 'diminea????',
	    afternoon: 'dup??-amiaz??',
	    evening: 'sear??',
	    night: 'noapte'
	  }
	};

	function ordinalNumber$w(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return String(number);
	}

	var localize$w = {
	  ordinalNumber: ordinalNumber$w,
	  era: buildLocalizeFn({
	    values: eraValues$w,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$w,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$w,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$w,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$w,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$n,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$w = /^(\d+)?/i;
	var parseOrdinalNumberPattern$w = /\d+/i;
	var matchEraPatterns$w = {
	  narrow: /^(??|D)/i,
	  abbreviated: /^(??\.?\s?d\.?\s?C\.?|??\.?\s?e\.?\s?n\.?|D\.?\s?C\.?|e\.?\s?n\.?)/i,
	  wide: /^(??nainte de Cristos|??naintea erei noastre|Dup?? Cristos|Era noastr??)/i
	};
	var parseEraPatterns$w = {
	  any: [/^??C/i, /^DC/i],
	  wide: [/^(??nainte de Cristos|??naintea erei noastre)/i, /^(Dup?? Cristos|Era noastr??)/i]
	};
	var matchQuarterPatterns$w = {
	  narrow: /^[1234]/i,
	  abbreviated: /^T[1234]/i,
	  wide: /^trimestrul [1234]/i
	};
	var parseQuarterPatterns$w = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$w = {
	  narrow: /^[ifmaasond]/i,
	  abbreviated: /^(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|noi|dec)/i,
	  wide: /^(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)/i
	};
	var parseMonthPatterns$w = {
	  narrow: [/^i/i, /^f/i, /^m/i, /^a/i, /^m/i, /^i/i, /^i/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ia/i, /^f/i, /^mar/i, /^ap/i, /^mai/i, /^iun/i, /^iul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$w = {
	  narrow: /^[dlmjvs]/i,
	  short: /^(d|l|ma|mi|j|v|s)/i,
	  abbreviated: /^(dum|lun|mar|mie|jo|vi|s??)/i,
	  wide: /^(duminica|luni|mar??i|miercuri|joi|vineri|s??mb??t??)/i
	};
	var parseDayPatterns$w = {
	  narrow: [/^d/i, /^l/i, /^m/i, /^m/i, /^j/i, /^v/i, /^s/i],
	  any: [/^d/i, /^l/i, /^ma/i, /^mi/i, /^j/i, /^v/i, /^s/i]
	};
	var matchDayPeriodPatterns$w = {
	  narrow: /^(a|p|mn|a|(diminea??a|dup??-amiaza|seara|noaptea))/i,
	  any: /^([ap]\.?\s?m\.?|miezul nop??ii|amiaza|(diminea??a|dup??-amiaza|seara|noaptea))/i
	};
	var parseDayPeriodPatterns$w = {
	  any: {
	    am: /^a/i,
	    pm: /^p/i,
	    midnight: /^mn/i,
	    noon: /amiaza/i,
	    morning: /diminea??a/i,
	    afternoon: /dup??-amiaza/i,
	    evening: /seara/i,
	    night: /noaptea/i
	  }
	};
	var match$w = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$w,
	    parsePattern: parseOrdinalNumberPattern$w,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$w,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$w,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$w,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$w,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$w,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$w,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$w,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$w,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$w,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$w,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Romanian locale.
	 * @language Romanian
	 * @iso-639-2 ron
	 * @author Sergiu Munteanu [@jsergiu]{@link https://github.com/jsergiu}
	 * @author Adrian Ocneanu [@aocneanu]{@link https://github.com/aocneanu}
	 * @author Mihai Ocneanu [@gandesc]{@link https://github.com/gandesc}
	 */

	var locale$y = {
	  formatDistance: formatDistance$y,
	  formatLong: formatLong$y,
	  formatRelative: formatRelative$x,
	  localize: localize$w,
	  match: match$w,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	function declension$2(scheme, count) {
	  // scheme for count=1 exists
	  if (scheme.one !== undefined && count === 1) {
	    return scheme.one;
	  }

	  var rem10 = count % 10;
	  var rem100 = count % 100; // 1, 21, 31, ...

	  if (rem10 === 1 && rem100 !== 11) {
	    return scheme.singularNominative.replace('{{count}}', count); // 2, 3, 4, 22, 23, 24, 32 ...
	  } else if (rem10 >= 2 && rem10 <= 4 && (rem100 < 10 || rem100 > 20)) {
	    return scheme.singularGenitive.replace('{{count}}', count); // 5, 6, 7, 8, 9, 10, 11, ...
	  } else {
	    return scheme.pluralGenitive.replace('{{count}}', count);
	  }
	}

	function buildLocalizeTokenFn$2(scheme) {
	  return function (count, options) {
	    if (options.addSuffix) {
	      if (options.comparison > 0) {
	        if (scheme.future) {
	          return declension$2(scheme.future, count);
	        } else {
	          return '?????????? ' + declension$2(scheme.regular, count);
	        }
	      } else {
	        if (scheme.past) {
	          return declension$2(scheme.past, count);
	        } else {
	          return declension$2(scheme.regular, count) + ' ??????????';
	        }
	      }
	    } else {
	      return declension$2(scheme.regular, count);
	    }
	  };
	}

	var formatDistanceLocale$x = {
	  lessThanXSeconds: buildLocalizeTokenFn$2({
	    regular: {
	      one: '???????????? ??????????????',
	      singularNominative: '???????????? {{count}} ??????????????',
	      singularGenitive: '???????????? {{count}} ????????????',
	      pluralGenitive: '???????????? {{count}} ????????????'
	    },
	    future: {
	      one: '????????????, ?????? ?????????? ??????????????',
	      singularNominative: '????????????, ?????? ?????????? {{count}} ??????????????',
	      singularGenitive: '????????????, ?????? ?????????? {{count}} ??????????????',
	      pluralGenitive: '????????????, ?????? ?????????? {{count}} ????????????'
	    }
	  }),
	  xSeconds: buildLocalizeTokenFn$2({
	    regular: {
	      singularNominative: '{{count}} ??????????????',
	      singularGenitive: '{{count}} ??????????????',
	      pluralGenitive: '{{count}} ????????????'
	    },
	    past: {
	      singularNominative: '{{count}} ?????????????? ??????????',
	      singularGenitive: '{{count}} ?????????????? ??????????',
	      pluralGenitive: '{{count}} ???????????? ??????????'
	    },
	    future: {
	      singularNominative: '?????????? {{count}} ??????????????',
	      singularGenitive: '?????????? {{count}} ??????????????',
	      pluralGenitive: '?????????? {{count}} ????????????'
	    }
	  }),
	  halfAMinute: function (_, options) {
	    if (options.addSuffix) {
	      if (options.comparison > 0) {
	        return '?????????? ??????????????????';
	      } else {
	        return '?????????????????? ??????????';
	      }
	    }

	    return '??????????????????';
	  },
	  lessThanXMinutes: buildLocalizeTokenFn$2({
	    regular: {
	      one: '???????????? ????????????',
	      singularNominative: '???????????? {{count}} ????????????',
	      singularGenitive: '???????????? {{count}} ??????????',
	      pluralGenitive: '???????????? {{count}} ??????????'
	    },
	    future: {
	      one: '????????????, ?????? ?????????? ????????????',
	      singularNominative: '????????????, ?????? ?????????? {{count}} ????????????',
	      singularGenitive: '????????????, ?????? ?????????? {{count}} ????????????',
	      pluralGenitive: '????????????, ?????? ?????????? {{count}} ??????????'
	    }
	  }),
	  xMinutes: buildLocalizeTokenFn$2({
	    regular: {
	      singularNominative: '{{count}} ????????????',
	      singularGenitive: '{{count}} ????????????',
	      pluralGenitive: '{{count}} ??????????'
	    },
	    past: {
	      singularNominative: '{{count}} ???????????? ??????????',
	      singularGenitive: '{{count}} ???????????? ??????????',
	      pluralGenitive: '{{count}} ?????????? ??????????'
	    },
	    future: {
	      singularNominative: '?????????? {{count}} ????????????',
	      singularGenitive: '?????????? {{count}} ????????????',
	      pluralGenitive: '?????????? {{count}} ??????????'
	    }
	  }),
	  aboutXHours: buildLocalizeTokenFn$2({
	    regular: {
	      singularNominative: '?????????? {{count}} ????????',
	      singularGenitive: '?????????? {{count}} ??????????',
	      pluralGenitive: '?????????? {{count}} ??????????'
	    },
	    future: {
	      singularNominative: '???????????????????????????? ?????????? {{count}} ??????',
	      singularGenitive: '???????????????????????????? ?????????? {{count}} ????????',
	      pluralGenitive: '???????????????????????????? ?????????? {{count}} ??????????'
	    }
	  }),
	  xHours: buildLocalizeTokenFn$2({
	    regular: {
	      singularNominative: '{{count}} ??????',
	      singularGenitive: '{{count}} ????????',
	      pluralGenitive: '{{count}} ??????????'
	    }
	  }),
	  xDays: buildLocalizeTokenFn$2({
	    regular: {
	      singularNominative: '{{count}} ????????',
	      singularGenitive: '{{count}} ??????',
	      pluralGenitive: '{{count}} ????????'
	    }
	  }),
	  aboutXMonths: buildLocalizeTokenFn$2({
	    regular: {
	      singularNominative: '?????????? {{count}} ????????????',
	      singularGenitive: '?????????? {{count}} ??????????????',
	      pluralGenitive: '?????????? {{count}} ??????????????'
	    },
	    future: {
	      singularNominative: '???????????????????????????? ?????????? {{count}} ??????????',
	      singularGenitive: '???????????????????????????? ?????????? {{count}} ????????????',
	      pluralGenitive: '???????????????????????????? ?????????? {{count}} ??????????????'
	    }
	  }),
	  xMonths: buildLocalizeTokenFn$2({
	    regular: {
	      singularNominative: '{{count}} ??????????',
	      singularGenitive: '{{count}} ????????????',
	      pluralGenitive: '{{count}} ??????????????'
	    }
	  }),
	  aboutXYears: buildLocalizeTokenFn$2({
	    regular: {
	      singularNominative: '?????????? {{count}} ????????',
	      singularGenitive: '?????????? {{count}} ??????',
	      pluralGenitive: '?????????? {{count}} ??????'
	    },
	    future: {
	      singularNominative: '???????????????????????????? ?????????? {{count}} ??????',
	      singularGenitive: '???????????????????????????? ?????????? {{count}} ????????',
	      pluralGenitive: '???????????????????????????? ?????????? {{count}} ??????'
	    }
	  }),
	  xYears: buildLocalizeTokenFn$2({
	    regular: {
	      singularNominative: '{{count}} ??????',
	      singularGenitive: '{{count}} ????????',
	      pluralGenitive: '{{count}} ??????'
	    }
	  }),
	  overXYears: buildLocalizeTokenFn$2({
	    regular: {
	      singularNominative: '???????????? {{count}} ????????',
	      singularGenitive: '???????????? {{count}} ??????',
	      pluralGenitive: '???????????? {{count}} ??????'
	    },
	    future: {
	      singularNominative: '????????????, ?????? ?????????? {{count}} ??????',
	      singularGenitive: '????????????, ?????? ?????????? {{count}} ????????',
	      pluralGenitive: '????????????, ?????? ?????????? {{count}} ??????'
	    }
	  }),
	  almostXYears: buildLocalizeTokenFn$2({
	    regular: {
	      singularNominative: '?????????? {{count}} ??????',
	      singularGenitive: '?????????? {{count}} ????????',
	      pluralGenitive: '?????????? {{count}} ??????'
	    },
	    future: {
	      singularNominative: '?????????? ?????????? {{count}} ??????',
	      singularGenitive: '?????????? ?????????? {{count}} ????????',
	      pluralGenitive: '?????????? ?????????? {{count}} ??????'
	    }
	  })
	};
	function formatDistance$z(token, count, options) {
	  options = options || {};
	  return formatDistanceLocale$x[token](count, options);
	}

	var dateFormats$z = {
	  full: "EEEE, do MMMM y '??.'",
	  long: "do MMMM y '??.'",
	  medium: "d MMM y '??.'",
	  short: 'dd.MM.y'
	};
	var timeFormats$z = {
	  full: 'H:mm:ss zzzz',
	  long: 'H:mm:ss z',
	  medium: 'H:mm:ss',
	  short: 'H:mm'
	};
	var dateTimeFormats$z = {
	  any: '{{date}}, {{time}}'
	};
	var formatLong$z = {
	  date: buildFormatLongFn({
	    formats: dateFormats$z,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$z,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$z,
	    defaultWidth: 'any'
	  })
	};

	var accusativeWeekdays$3 = ['??????????????????????', '??????????????????????', '??????????????', '??????????', '??????????????', '??????????????', '??????????????'];

	function lastWeek$1(day) {
	  var weekday = accusativeWeekdays$3[day];

	  switch (day) {
	    case 0:
	      return "'?? ?????????????? " + weekday + " ??' p";

	    case 1:
	    case 2:
	    case 4:
	      return "'?? ?????????????? " + weekday + " ??' p";

	    case 3:
	    case 5:
	    case 6:
	      return "'?? ?????????????? " + weekday + " ??' p";
	  }
	}

	function thisWeek$1(day) {
	  var weekday = accusativeWeekdays$3[day];

	  if (day === 2
	  /* Tue */
	  ) {
	      return "'???? " + weekday + " ??' p";
	    } else {
	    return "'?? " + weekday + " ??' p";
	  }
	}

	function nextWeek$1(day) {
	  var weekday = accusativeWeekdays$3[day];

	  switch (day) {
	    case 0:
	      return "'?? ?????????????????? " + weekday + " ??' p";

	    case 1:
	    case 2:
	    case 4:
	      return "'?? ?????????????????? " + weekday + " ??' p";

	    case 3:
	    case 5:
	    case 6:
	      return "'?? ?????????????????? " + weekday + " ??' p";
	  }
	}

	var formatRelativeLocale$x = {
	  lastWeek: function (date, baseDate, options) {
	    var day = date.getUTCDay();

	    if (isSameUTCWeek(date, baseDate, options)) {
	      return thisWeek$1(day);
	    } else {
	      return lastWeek$1(day);
	    }
	  },
	  yesterday: "'?????????? ??' p",
	  today: "'?????????????? ??' p",
	  tomorrow: "'???????????? ??' p",
	  nextWeek: function (date, baseDate, options) {
	    var day = date.getUTCDay();

	    if (isSameUTCWeek(date, baseDate, options)) {
	      return thisWeek$1(day);
	    } else {
	      return nextWeek$1(day);
	    }
	  },
	  other: 'P'
	};
	function formatRelative$y(token, date, baseDate, options) {
	  var format = formatRelativeLocale$x[token];

	  if (typeof format === 'function') {
	    return format(date, baseDate, options);
	  }

	  return format;
	}

	var eraValues$x = {
	  narrow: ['???? ??.??.', '??.??.'],
	  abbreviated: ['???? ??. ??.', '??. ??.'],
	  wide: ['???? ?????????? ??????', '?????????? ??????']
	};
	var quarterValues$x = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['1-?? ????.', '2-?? ????.', '3-?? ????.', '4-?? ????.'],
	  wide: ['1-?? ??????????????', '2-?? ??????????????', '3-?? ??????????????', '4-?? ??????????????']
	};
	var monthValues$x = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'],
	  abbreviated: ['??????.', '??????.', '????????', '??????.', '??????', '????????', '????????', '??????.', '????????.', '??????.', '????????.', '??????.'],
	  wide: ['????????????', '??????????????', '????????', '????????????', '??????', '????????', '????????', '????????????', '????????????????', '??????????????', '????????????', '??????????????']
	};
	var formattingMonthValues$6 = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'],
	  abbreviated: ['??????.', '??????.', '??????.', '??????.', '??????', '??????.', '??????.', '??????.', '????????.', '??????.', '????????.', '??????.'],
	  wide: ['????????????', '??????????????', '??????????', '????????????', '??????', '????????', '????????', '??????????????', '????????????????', '??????????????', '????????????', '??????????????']
	};
	var dayValues$x = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??'],
	  short: ['????', '????', '????', '????', '????', '????', '????'],
	  abbreviated: ['??????', '??????', '??????', '??????', '??????', '??????', '??????'],
	  wide: ['??????????????????????', '??????????????????????', '??????????????', '??????????', '??????????????', '??????????????', '??????????????']
	};
	var dayPeriodValues$x = {
	  narrow: {
	    am: '????',
	    pm: '????',
	    midnight: '????????.',
	    noon: '????????.',
	    morning: '????????',
	    afternoon: '????????',
	    evening: '??????.',
	    night: '????????'
	  },
	  abbreviated: {
	    am: '????',
	    pm: '????',
	    midnight: '????????.',
	    noon: '????????.',
	    morning: '????????',
	    afternoon: '????????',
	    evening: '??????.',
	    night: '????????'
	  },
	  wide: {
	    am: '????',
	    pm: '????',
	    midnight: '??????????????',
	    noon: '??????????????',
	    morning: '????????',
	    afternoon: '????????',
	    evening: '??????????',
	    night: '????????'
	  }
	};
	var formattingDayPeriodValues$o = {
	  narrow: {
	    am: '????',
	    pm: '????',
	    midnight: '????????.',
	    noon: '????????.',
	    morning: '????????',
	    afternoon: '??????',
	    evening: '??????.',
	    night: '????????'
	  },
	  abbreviated: {
	    am: '????',
	    pm: '????',
	    midnight: '????????.',
	    noon: '????????.',
	    morning: '????????',
	    afternoon: '??????',
	    evening: '??????.',
	    night: '????????'
	  },
	  wide: {
	    am: '????',
	    pm: '????',
	    midnight: '??????????????',
	    noon: '??????????????',
	    morning: '????????',
	    afternoon: '??????',
	    evening: '????????????',
	    night: '????????'
	  }
	};

	function ordinalNumber$x(dirtyNumber, dirtyOptions) {
	  var options = dirtyOptions || {};
	  var unit = String(options.unit);
	  var suffix;

	  if (unit === 'date') {
	    suffix = '-??';
	  } else if (unit === 'week' || unit === 'minute' || unit === 'second') {
	    suffix = '-??';
	  } else {
	    suffix = '-??';
	  }

	  return dirtyNumber + suffix;
	}

	var localize$x = {
	  ordinalNumber: ordinalNumber$x,
	  era: buildLocalizeFn({
	    values: eraValues$x,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$x,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$x,
	    defaultWidth: 'wide',
	    formattingValues: formattingMonthValues$6,
	    defaultFormattingWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$x,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$x,
	    defaultWidth: 'any',
	    formattingValues: formattingDayPeriodValues$o,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$x = /^(\d+)(-?(??|??|??|????|????|????|????|????|????|????|????))?/i;
	var parseOrdinalNumberPattern$x = /\d+/i;
	var matchEraPatterns$x = {
	  narrow: /^((???? )???\.?\s???\.?)/i,
	  abbreviated: /^((???? )???\.?\s???\.?)/i,
	  wide: /^(???? ?????????? ??????|?????????? ??????|???????? ??????)/i
	};
	var parseEraPatterns$x = {
	  any: [/^??/i, /^??/i]
	};
	var matchQuarterPatterns$x = {
	  narrow: /^[1234]/i,
	  abbreviated: /^[1234](-?[??????]????)? ????.?/i,
	  wide: /^[1234](-?[??????]????)? ??????????????/i
	};
	var parseQuarterPatterns$x = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$x = {
	  narrow: /^[??????????????????]/i,
	  abbreviated: /^(??????|??????|?????????|??????|????[????]|??????[????]?|??????[????]?|??????|?????????|??????|?????????|??????)/i,
	  wide: /^(??????????[????]|????????????[????]|???????????|??????????[????]|????[????]|??????[????]|??????[????]|???????????????|??????????????[????]|????????????[????]|????????????[????]|??????????[????]|????????????[????])/i
	};
	var parseMonthPatterns$x = {
	  narrow: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  any: [/^??/i, /^??/i, /^??????/i, /^????/i, /^????[????]/i, /^??????/i, /^??????/i, /^????/i, /^??/i, /^??/i, /^??/i, /^??/i]
	};
	var matchDayPatterns$x = {
	  narrow: /^[????????]/i,
	  short: /^(????|????|????|????|????|????|????|????|????|????|????|????)\.?/i,
	  abbreviated: /^(??????|??????|??????|??????|??????|??????|??????|??????|??????|??????|??????|??????|??????).?/i,
	  wide: /^(????????????????????[????]|?????????????????????????|?????????????????|????????[????]|?????????????????|????????????[????]|????????????[????])/i
	};
	var parseDayPatterns$x = {
	  narrow: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  any: [/^??[????]/i, /^??[????]/i, /^??/i, /^????/i, /^??/i, /^??[????]/i, /^??[????]/i]
	};
	var matchDayPeriodPatterns$x = {
	  narrow: /^([????]??|????????\.?|????????\.?|??????[????]|????????|??????|??????\.?|??????[????])/i,
	  abbreviated: /^([????]??|????????\.?|????????\.?|??????[????]|????????|??????|??????\.?|??????[????])/i,
	  wide: /^([????]??|??????????????|??????????????|??????[????]|????????|??????|?????????????|??????[????])/i
	};
	var parseDayPeriodPatterns$x = {
	  any: {
	    am: /^????/i,
	    pm: /^????/i,
	    midnight: /^????????/i,
	    noon: /^????????/i,
	    morning: /^??/i,
	    afternoon: /^??[????]/i,
	    evening: /^??/i,
	    night: /^??/i
	  }
	};
	var match$x = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$x,
	    parsePattern: parseOrdinalNumberPattern$x,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$x,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$x,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$x,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$x,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$x,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$x,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$x,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$x,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$x,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPeriodPatterns$x,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Russian locale.
	 * @language Russian
	 * @iso-639-2 rus
	 * @author Sasha Koss [@kossnocorp]{@link https://github.com/kossnocorp}
	 * @author Lesha Koss [@leshakoss]{@link https://github.com/leshakoss}
	 */

	var locale$z = {
	  formatDistance: formatDistance$z,
	  formatLong: formatLong$z,
	  formatRelative: formatRelative$y,
	  localize: localize$x,
	  match: match$x,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	// NOTE: should prolly be improved
	// https://www.unicode.org/cldr/charts/32/summary/sk.html?hide#1308
	function declensionGroup$1(scheme, count) {
	  if (count === 1) {
	    return scheme.one;
	  }

	  if (count >= 2 && count <= 4) {
	    return scheme.twoFour;
	  } // if count === null || count === 0 || count >= 5


	  return scheme.other;
	}

	function declension$3(scheme, count, time) {
	  var group = declensionGroup$1(scheme, count);
	  var finalText = group[time] || group;
	  return finalText.replace('{{count}}', count);
	}

	function extractPreposition(token) {
	  var result = ['lessThan', 'about', 'over', 'almost'].filter(function (preposition) {
	    return !!token.match(new RegExp('^' + preposition));
	  });
	  return result[0];
	}

	function prefixPreposition(preposition) {
	  var translation = '';

	  if (preposition === 'almost') {
	    translation = 'takmer';
	  }

	  if (preposition === 'about') {
	    translation = 'pribli??ne';
	  }

	  return translation.length > 0 ? translation + ' ' : '';
	}

	function suffixPreposition(preposition) {
	  var translation = '';

	  if (preposition === 'lessThan') {
	    translation = 'menej ne??';
	  }

	  if (preposition === 'over') {
	    translation = 'viac ne??';
	  }

	  return translation.length > 0 ? translation + ' ' : '';
	}

	function lowercaseFirstLetter(string) {
	  return string.charAt(0).toLowerCase() + string.slice(1);
	}

	var formatDistanceLocale$y = {
	  xSeconds: {
	    one: {
	      regular: 'sekunda',
	      past: 'sekundou',
	      future: 'sekundu'
	    },
	    twoFour: {
	      regular: '{{count}} sekundy',
	      past: '{{count}} sekundami',
	      future: '{{count}} sekundy'
	    },
	    other: {
	      regular: '{{count}} sek??nd',
	      past: '{{count}} sekundami',
	      future: '{{count}} sek??nd'
	    }
	  },
	  halfAMinute: {
	    other: {
	      regular: 'pol min??ty',
	      past: 'pol min??tou',
	      future: 'pol min??ty'
	    }
	  },
	  xMinutes: {
	    one: {
	      regular: 'min??ta',
	      past: 'min??tou',
	      future: 'min??tu'
	    },
	    twoFour: {
	      regular: '{{count}} min??ty',
	      past: '{{count}} min??tami',
	      future: '{{count}} min??ty'
	    },
	    other: {
	      regular: '{{count}} min??t',
	      past: '{{count}} min??tami',
	      future: '{{count}} min??t'
	    }
	  },
	  xHours: {
	    one: {
	      regular: 'hodina',
	      past: 'hodinou',
	      future: 'hodinu'
	    },
	    twoFour: {
	      regular: '{{count}} hodiny',
	      past: '{{count}} hodinami',
	      future: '{{count}} hodiny'
	    },
	    other: {
	      regular: '{{count}} hod??n',
	      past: '{{count}} hodinami',
	      future: '{{count}} hod??n'
	    }
	  },
	  xDays: {
	    one: {
	      regular: 'de??',
	      past: 'd??om',
	      future: 'de??'
	    },
	    twoFour: {
	      regular: '{{count}} dni',
	      past: '{{count}} d??ami',
	      future: '{{count}} dni'
	    },
	    other: {
	      regular: '{{count}} dn??',
	      past: '{{count}} d??ami',
	      future: '{{count}} dn??'
	    }
	  },
	  xMonths: {
	    one: {
	      regular: 'mesiac',
	      past: 'mesiacom',
	      future: 'mesiac'
	    },
	    twoFour: {
	      regular: '{{count}} mesiace',
	      past: '{{count}} mesiacmi',
	      future: '{{count}} mesiace'
	    },
	    other: {
	      regular: '{{count}} mesiacov',
	      past: '{{count}} mesiacmi',
	      future: '{{count}} mesiacov'
	    }
	  },
	  xYears: {
	    one: {
	      regular: 'rok',
	      past: 'rokom',
	      future: 'rok'
	    },
	    twoFour: {
	      regular: '{{count}} roky',
	      past: '{{count}} rokmi',
	      future: '{{count}} roky'
	    },
	    other: {
	      regular: '{{count}} rokov',
	      past: '{{count}} rokmi',
	      future: '{{count}} rokov'
	    }
	  }
	};
	function formatDistance$A(token, count, options) {
	  options = options || {};
	  var preposition = extractPreposition(token) || '';
	  var key = lowercaseFirstLetter(token.substring(preposition.length));
	  var scheme = formatDistanceLocale$y[key];

	  if (!options.addSuffix) {
	    return prefixPreposition(preposition) + suffixPreposition(preposition) + declension$3(scheme, count, 'regular');
	  }

	  if (options.comparison > 0) {
	    return prefixPreposition(preposition) + 'o ' + suffixPreposition(preposition) + declension$3(scheme, count, 'future');
	  } else {
	    return prefixPreposition(preposition) + 'pred ' + suffixPreposition(preposition) + declension$3(scheme, count, 'past');
	  }
	}

	var dateFormats$A = {
	  full: 'EEEE d. MMMM y',
	  long: 'd. MMMM y',
	  medium: 'd. M. y',
	  short: 'd. M. y' // https://www.unicode.org/cldr/charts/32/summary/sk.html?hide#2149

	};
	var timeFormats$A = {
	  full: 'H:mm:ss zzzz',
	  long: 'H:mm:ss z',
	  medium: 'H:mm:ss',
	  short: 'H:mm' // https://www.unicode.org/cldr/charts/32/summary/sk.html?hide#1994

	};
	var dateTimeFormats$A = {
	  full: '{{date}}, {{time}}',
	  long: '{{date}}, {{time}}',
	  medium: '{{date}}, {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$A = {
	  date: buildFormatLongFn({
	    formats: dateFormats$A,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$A,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$A,
	    defaultWidth: 'full'
	  })
	};

	var accusativeWeekdays$4 = ['nede??u', 'pondelok', 'utorok', 'stredu', '??tvrtok', 'piatok', 'sobotu'];

	function lastWeek$2(day) {
	  var weekday = accusativeWeekdays$4[day];

	  switch (day) {
	    case 0:
	    /* Sun */

	    case 4:
	    /* Wed */

	    case 6
	    /* Sat */
	    :
	      return "'minul?? " + weekday + " o' p";

	    default:
	      return "'minul??' eeee 'o' p";
	  }
	}

	function thisWeek$2(day) {
	  var weekday = accusativeWeekdays$4[day];

	  if (day === 4
	  /* Thu */
	  ) {
	      return "'vo' eeee 'o' p";
	    } else {
	    return "'v " + weekday + " o' p";
	  }
	}

	function nextWeek$2(day) {
	  var weekday = accusativeWeekdays$4[day];

	  switch (day) {
	    case 0:
	    /* Sun */

	    case 4:
	    /* Wed */

	    case 6
	    /* Sat */
	    :
	      return "'bud??cu' " + weekday + " 'o' p";

	    default:
	      return "'bud??ci' eeee 'o' p";
	  }
	}

	var formatRelativeLocale$y = {
	  lastWeek: function (date, baseDate, options) {
	    var day = date.getUTCDay();

	    if (isSameUTCWeek(date, baseDate, options)) {
	      return thisWeek$2(day);
	    } else {
	      return lastWeek$2(day);
	    }
	  },
	  yesterday: "'v??era o' p",
	  today: "'dnes o' p",
	  tomorrow: "'zajtra o' p",
	  nextWeek: function (date, baseDate, options) {
	    var day = date.getUTCDay();

	    if (isSameUTCWeek(date, baseDate, options)) {
	      return thisWeek$2(day);
	    } else {
	      return nextWeek$2(day);
	    }
	  },
	  other: 'P'
	};
	function formatRelative$z(token, date, baseDate, options) {
	  var format = formatRelativeLocale$y[token];

	  if (typeof format === 'function') {
	    return format(date, baseDate, options);
	  }

	  return format;
	}

	var eraValues$y = {
	  narrow: ['pred Kr.', 'po Kr.'],
	  abbreviated: ['pred Kr.', 'po Kr.'],
	  wide: ['pred Kristom', 'po Kristovi'] // https://www.unicode.org/cldr/charts/32/summary/sk.html#1780

	};
	var quarterValues$y = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
	  wide: ['1. ??tvr??rok', '2. ??tvr??rok', '3. ??tvr??rok', '4. ??tvr??rok'] // https://www.unicode.org/cldr/charts/32/summary/sk.html#1804

	};
	var monthValues$y = {
	  narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
	  abbreviated: ['jan', 'feb', 'mar', 'apr', 'm??j', 'j??n', 'j??l', 'aug', 'sep', 'okt', 'nov', 'dec'],
	  wide: ['janu??r', 'febru??r', 'marec', 'apr??l', 'm??j', 'j??n', 'j??l', 'august', 'september', 'okt??ber', 'november', 'december']
	};
	var formattingMonthValues$7 = {
	  narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
	  abbreviated: ['jan', 'feb', 'mar', 'apr', 'm??j', 'j??n', 'j??l', 'aug', 'sep', 'okt', 'nov', 'dec'],
	  wide: ['janu??ra', 'febru??ra', 'marca', 'apr??la', 'm??ja', 'j??na', 'j??la', 'augusta', 'septembra', 'okt??bra', 'novembra', 'decembra'] // https://www.unicode.org/cldr/charts/32/summary/sk.html#1876

	};
	var dayValues$y = {
	  narrow: ['n', 'p', 'u', 's', '??', 'p', 's'],
	  short: ['ne', 'po', 'ut', 'st', '??t', 'pi', 'so'],
	  abbreviated: ['ne', 'po', 'ut', 'st', '??t', 'pi', 'so'],
	  wide: ['nede??a', 'pondelok', 'utorok', 'streda', '??tvrtok', 'piatok', 'sobota'] // https://www.unicode.org/cldr/charts/32/summary/sk.html#1932

	};
	var dayPeriodValues$y = {
	  narrow: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'poln.',
	    noon: 'pol.',
	    morning: 'r??no',
	    afternoon: 'pop.',
	    evening: 've??.',
	    night: 'noc'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'poln.',
	    noon: 'pol.',
	    morning: 'r??no',
	    afternoon: 'popol.',
	    evening: 've??er',
	    night: 'noc'
	  },
	  wide: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'polnoc',
	    noon: 'poludnie',
	    morning: 'r??no',
	    afternoon: 'popoludnie',
	    evening: 've??er',
	    night: 'noc'
	  }
	};
	var formattingDayPeriodValues$p = {
	  narrow: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'o poln.',
	    noon: 'nap.',
	    morning: 'r??no',
	    afternoon: 'pop.',
	    evening: 've??.',
	    night: 'v n.'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'o poln.',
	    noon: 'napol.',
	    morning: 'r??no',
	    afternoon: 'popol.',
	    evening: 've??er',
	    night: 'v noci'
	  },
	  wide: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'o polnoci',
	    noon: 'napoludnie',
	    morning: 'r??no',
	    afternoon: 'popoludn??',
	    evening: 've??er',
	    night: 'v noci'
	  }
	};

	function ordinalNumber$y(dirtyNumber, _dirtyOptions) {
	  var number = Number(dirtyNumber);
	  return number + '.';
	}

	var localize$y = {
	  ordinalNumber: ordinalNumber$y,
	  era: buildLocalizeFn({
	    values: eraValues$y // defaultWidth: 'wide'

	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$y,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$y,
	    defaultWidth: 'wide',
	    formattingValues: formattingMonthValues$7,
	    defaultFormattingWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$y,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$y,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$p,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$y = /^(\d+)\.?/i;
	var parseOrdinalNumberPattern$y = /\d+/i;
	var matchEraPatterns$y = {
	  narrow: /^(pred Kr\.|pred n\. l\.|po Kr\.|n\. l\.)/i,
	  abbreviated: /^(pred Kr\.|pred n\. l\.|po Kr\.|n\. l\.)/i,
	  wide: /^(pred Kristom|pred na[??s][??i]m letopo[??c]tom|po Kristovi|n[??a][??s]ho letopo[??c]tu)/i
	};
	var parseEraPatterns$y = {
	  any: [/^pr/i, /^(po|n)/i]
	};
	var matchQuarterPatterns$y = {
	  narrow: /^[1234]/i,
	  abbreviated: /^q[1234]/i,
	  wide: /^[1234]\. [??s]tvr[??t]rok/i
	};
	var parseQuarterPatterns$y = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$y = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(jan|feb|mar|apr|m[??a]j|j[??u]n|j[??u]l|aug|sep|okt|nov|dec)/i,
	  wide: /^(janu[??a]ra?|febru[??a]ra?|(marec|marca)|apr[??i]la?|m[??a]ja?|j[??u]na?|j[??u]la?|augusta?|(september|septembra)|(okt[??o]ber|okt[??o]bra)|(november|novembra)|(december|decembra))/i
	};
	var parseMonthPatterns$y = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^m[??a]j/i, /^j[??u]n/i, /^j[??u]l/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$y = {
	  narrow: /^[npus??p]/i,
	  short: /^(ne|po|ut|st|??t|pi|so)/i,
	  abbreviated: /^(ne|po|ut|st|??t|pi|so)/i,
	  wide: /^(nede[??l]a|pondelok|utorok|streda|[??s]tvrtok|piatok|sobota])/i
	};
	var parseDayPatterns$y = {
	  narrow: [/^n/i, /^p/i, /^u/i, /^s/i, /^??/i, /^p/i, /^s/i],
	  any: [/^n/i, /^po/i, /^u/i, /^st/i, /^(??t|stv)/i, /^pi/i, /^so/i]
	};
	var matchDayPeriodPatterns$y = {
	  narrow: /^(am|pm|(o )?poln\.?|(nap\.?|pol\.?)|r[??a]no|pop\.?|ve[??c]\.?|(v n\.?|noc))/i,
	  abbreviated: /^(am|pm|(o )?poln\.?|(napol\.?|pol\.?)|r[??a]no|pop\.?|ve[??c]er|(v )?noci?)/i,
	  any: /^(am|pm|(o )?polnoci?|(na)?poludnie|r[??a]no|popoludn(ie|??|i)|ve[??c]er|(v )?noci?)/i
	};
	var parseDayPeriodPatterns$y = {
	  any: {
	    am: /^am/i,
	    pm: /^pm/i,
	    midnight: /poln/i,
	    noon: /^(nap|(na)?pol(\.|u))/i,
	    morning: /^r[??a]no/i,
	    afternoon: /^pop/i,
	    evening: /^ve[??c]/i,
	    night: /^(noc|v n\.)/i
	  }
	};
	var match$y = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$y,
	    parsePattern: parseOrdinalNumberPattern$y,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$y,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$y,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$y,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$y,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$y,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$y,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$y,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$y,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$y,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$y,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Slovak locale.
	 * @language Slovak
	 * @iso-639-2 slk
	 * @author Marek Suscak [@mareksuscak]{@link https://github.com/mareksuscak}
	 */

	var locale$A = {
	  formatDistance: formatDistance$A,
	  formatLong: formatLong$A,
	  formatRelative: formatRelative$z,
	  localize: localize$y,
	  match: match$y,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$z = {
	  lessThanXSeconds: {
	    singular: 'mindre ??n en sekund',
	    plural: 'mindre ??n {{count}} sekunder'
	  },
	  xSeconds: {
	    singular: 'en sekund',
	    plural: '{{count}} sekunder'
	  },
	  halfAMinute: 'en halv minut',
	  lessThanXMinutes: {
	    singular: 'mindre ??n en minut',
	    plural: 'mindre ??n {{count}} minuter'
	  },
	  xMinutes: {
	    singular: 'en minut',
	    plural: '{{count}} minuter'
	  },
	  aboutXHours: {
	    singular: 'ungef??r en timme',
	    plural: 'ungef??r {{count}} timmar'
	  },
	  xHours: {
	    singular: 'en timme',
	    plural: '{{count}} timmar'
	  },
	  xDays: {
	    singular: 'en dag',
	    plural: '{{count}} dagar'
	  },
	  aboutXMonths: {
	    singular: 'ungef??r en m??nad',
	    plural: 'ungef??r {{count}} m??nader'
	  },
	  xMonths: {
	    singular: 'en m??nad',
	    plural: '{{count}} m??nader'
	  },
	  aboutXYears: {
	    singular: 'ungef??r ett ??r',
	    plural: 'ungef??r {{count}} ??r'
	  },
	  xYears: {
	    singular: 'ett ??r',
	    plural: '{{count}} ??r'
	  },
	  overXYears: {
	    singular: '??ver ett ??r',
	    plural: '??ver {{count}} ??r'
	  },
	  almostXYears: {
	    singular: 'n??stan ett ??r',
	    plural: 'n??stan {{count}} ??r'
	  }
	};
	var wordMapping$2 = ['noll', 'en', 'tv??', 'tre', 'fyra', 'fem', 'sex', 'sju', '??tta', 'nio', 'tio', 'elva', 'tolv'];
	function formatDistance$B(token, count, options) {
	  options = options || {
	    onlyNumeric: false
	  };
	  var translation = formatDistanceLocale$z[token];
	  var result;

	  if (typeof translation === 'string') {
	    result = translation;
	  } else if (count === 0 || count > 1) {
	    if (options.onlyNumeric) {
	      result = translation.plural.replace('{{count}}', count);
	    } else {
	      result = translation.plural.replace('{{count}}', count < 13 ? wordMapping$2[count] : count);
	    }
	  } else {
	    result = translation.singular;
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return 'om ' + result;
	    } else {
	      return result + ' sedan';
	    }
	  }

	  return result;
	}

	var dateFormats$B = {
	  full: 'EEEE d MMMM y',
	  long: 'd MMMM y',
	  medium: 'd MMM y',
	  short: 'y-MM-dd'
	};
	var timeFormats$B = {
	  full: "'kl'. HH:mm:ss zzzz",
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$B = {
	  full: "{{date}} 'kl.' {{time}}",
	  long: "{{date}} 'kl.' {{time}}",
	  medium: '{{date}} {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$B = {
	  date: buildFormatLongFn({
	    formats: dateFormats$B,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$B,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$B,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$z = {
	  lastWeek: "'i' EEEE's kl.' p",
	  yesterday: "'ig??r kl.' p",
	  today: "'idag kl.' p",
	  tomorrow: "'imorgon kl.' p",
	  nextWeek: "'p??' EEEE 'kl.' p",
	  other: 'P'
	};
	function formatRelative$A(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$z[token];
	}

	var eraValues$z = {
	  narrow: ['f.Kr.', 'e.Kr.'],
	  abbreviated: ['f.Kr.', 'e.Kr.'],
	  wide: ['f??re Kristus', 'efter Kristus']
	};
	var quarterValues$z = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
	  wide: ['1:a kvartalet', '2:a kvartalet', '3:e kvartalet', '4:e kvartalet']
	};
	var monthValues$z = {
	  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	  abbreviated: ['jan.', 'feb.', 'mars', 'apr.', 'maj', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
	  wide: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december']
	};
	var dayValues$z = {
	  narrow: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
	  short: ['s??', 'm??', 'ti', 'on', 'to', 'fr', 'l??'],
	  abbreviated: ['s??n', 'm??n', 'tis', 'ons', 'tor', 'fre', 'l??r'],
	  wide: ['s??ndag', 'm??ndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'l??rdag'] // https://www.unicode.org/cldr/charts/32/summary/sv.html#1888

	};
	var dayPeriodValues$z = {
	  narrow: {
	    am: 'fm',
	    pm: 'em',
	    midnight: 'midnatt',
	    noon: 'middag',
	    morning: 'morg.',
	    afternoon: 'efterm.',
	    evening: 'kv??ll',
	    night: 'natt'
	  },
	  abbreviated: {
	    am: 'f.m.',
	    pm: 'e.m.',
	    midnight: 'midnatt',
	    noon: 'middag',
	    morning: 'morgon',
	    afternoon: 'efterm.',
	    evening: 'kv??ll',
	    night: 'natt'
	  },
	  wide: {
	    am: 'f??rmiddag',
	    pm: 'eftermiddag',
	    midnight: 'midnatt',
	    noon: 'middag',
	    morning: 'morgon',
	    afternoon: 'eftermiddag',
	    evening: 'kv??ll',
	    night: 'natt'
	  }
	};
	var formattingDayPeriodValues$q = {
	  narrow: {
	    am: 'fm',
	    pm: 'em',
	    midnight: 'midnatt',
	    noon: 'middag',
	    morning: 'p?? morg.',
	    afternoon: 'p?? efterm.',
	    evening: 'p?? kv??llen',
	    night: 'p?? natten'
	  },
	  abbreviated: {
	    am: 'fm',
	    pm: 'em',
	    midnight: 'midnatt',
	    noon: 'middag',
	    morning: 'p?? morg.',
	    afternoon: 'p?? efterm.',
	    evening: 'p?? kv??llen',
	    night: 'p?? natten'
	  },
	  wide: {
	    am: 'fm',
	    pm: 'em',
	    midnight: 'midnatt',
	    noon: 'middag',
	    morning: 'p?? morgonen',
	    afternoon: 'p?? eftermiddagen',
	    evening: 'p?? kv??llen',
	    night: 'p?? natten'
	  }
	};

	function ordinalNumber$z(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  var rem100 = number % 100;

	  if (rem100 > 20 || rem100 < 10) {
	    switch (rem100 % 10) {
	      case 1:
	      case 2:
	        return number + ':a';
	    }
	  }

	  return number + ':e';
	}

	var localize$z = {
	  ordinalNumber: ordinalNumber$z,
	  era: buildLocalizeFn({
	    values: eraValues$z,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$z,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$z,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$z,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$z,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$q,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$z = /^(\d+)(:a|:e)?/i;
	var parseOrdinalNumberPattern$z = /\d+/i;
	var matchEraPatterns$z = {
	  narrow: /^(f\.? ?Kr\.?|f\.? ?v\.? ?t\.?|e\.? ?Kr\.?|v\.? ?t\.?)/i,
	  abbreviated: /^(f\.? ?Kr\.?|f\.? ?v\.? ?t\.?|e\.? ?Kr\.?|v\.? ?t\.?)/i,
	  wide: /^(f??re Kristus|f??re v??r tid|efter Kristus|v??r tid)/i
	};
	var parseEraPatterns$z = {
	  any: [/^f/i, /^[ev]/i]
	};
	var matchQuarterPatterns$z = {
	  narrow: /^[1234]/i,
	  abbreviated: /^q[1234]/i,
	  wide: /^[1234](:a|:e)? kvartalet/i
	};
	var parseQuarterPatterns$z = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$z = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)\.?/i,
	  wide: /^(januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december)/i
	};
	var parseMonthPatterns$z = {
	  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
	  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^maj/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
	};
	var matchDayPatterns$z = {
	  narrow: /^[smtofl]/i,
	  short: /^(s??|m??|ti|on|to|fr|l??)/i,
	  abbreviated: /^(s??n|m??n|tis|ons|tor|fre|l??r)/i,
	  wide: /^(s??ndag|m??ndag|tisdag|onsdag|torsdag|fredag|l??rdag)/i
	};
	var parseDayPatterns$z = {
	  any: [/^s/i, /^m/i, /^ti/i, /^o/i, /^to/i, /^f/i, /^l/i]
	};
	var matchDayPeriodPatterns$z = {
	  any: /^([fe]\.?\s?m\.?|midn(att)?|midd(ag)?|(p??) (morgonen|eftermiddagen|kv??llen|natten))/i
	};
	var parseDayPeriodPatterns$z = {
	  any: {
	    am: /^f/i,
	    pm: /^e/i,
	    midnight: /^midn/i,
	    noon: /^midd/i,
	    morning: /morgon/i,
	    afternoon: /eftermiddag/i,
	    evening: /kv??ll/i,
	    night: /natt/i
	  }
	};
	var match$z = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$z,
	    parsePattern: parseOrdinalNumberPattern$z,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$z,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$z,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$z,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$z,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$z,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$z,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$z,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$z,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$z,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$z,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Swedish locale.
	 * @language Swedish
	 * @iso-639-2 swe
	 * @author Johannes Ul??n [@ejulen]{@link https://github.com/ejulen}
	 * @author Alexander Nanberg [@alexandernanberg]{@link https://github.com/alexandernanberg}
	 * @author Henrik Andersson [@limelights]{@link https://github.com/limelights}
	 */

	var locale$B = {
	  formatDistance: formatDistance$B,
	  formatLong: formatLong$B,
	  formatRelative: formatRelative$A,
	  localize: localize$z,
	  match: match$z,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$A = {
	  lessThanXSeconds: {
	    one: '???????????????????????? 1 ??????????????????',
	    other: '???????????????????????? {{count}} ??????????????????'
	  },
	  xSeconds: {
	    one: '1 ??????????????????',
	    other: '{{count}} ??????????????????'
	  },
	  halfAMinute: '???????????????????????????',
	  lessThanXMinutes: {
	    one: '???????????????????????? 1 ????????????',
	    other: '???????????????????????? {{count}} ????????????'
	  },
	  xMinutes: {
	    one: '1 ????????????',
	    other: '{{count}} ????????????'
	  },
	  aboutXHours: {
	    one: '?????????????????? 1 ?????????????????????',
	    other: '?????????????????? {{count}} ?????????????????????'
	  },
	  xHours: {
	    one: '1 ?????????????????????',
	    other: '{{count}} ?????????????????????'
	  },
	  xDays: {
	    one: '1 ?????????',
	    other: '{{count}} ?????????'
	  },
	  aboutXMonths: {
	    one: '?????????????????? 1 ???????????????',
	    other: '?????????????????? {{count}} ???????????????'
	  },
	  xMonths: {
	    one: '1 ???????????????',
	    other: '{{count}} ???????????????'
	  },
	  aboutXYears: {
	    one: '?????????????????? 1 ??????',
	    other: '?????????????????? {{count}} ??????'
	  },
	  xYears: {
	    one: '1 ??????',
	    other: '{{count}} ??????'
	  },
	  overXYears: {
	    one: '????????????????????? 1 ??????',
	    other: '????????????????????? {{count}} ??????'
	  },
	  almostXYears: {
	    one: '??????????????? 1 ??????',
	    other: '??????????????? {{count}} ??????'
	  }
	};
	function formatDistance$C(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$A[token] === 'string') {
	    result = formatDistanceLocale$A[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$A[token].one;
	  } else {
	    result = formatDistanceLocale$A[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      if (token === 'halfAMinute') {
	        return '??????' + result;
	      } else {
	        return '?????? ' + result;
	      }
	    } else {
	      return result + '???????????????????????????';
	    }
	  }

	  return result;
	}

	var dateFormats$C = {
	  full: '?????????EEEE????????? do MMMM y',
	  long: 'do MMMM y',
	  medium: 'd MMM y',
	  short: 'dd/MM/yyyy'
	};
	var timeFormats$C = {
	  full: 'H:mm:ss ???. zzzz',
	  long: 'H:mm:ss ???. z',
	  medium: 'H:mm:ss ???.',
	  short: 'H:mm ???.'
	};
	var dateTimeFormats$C = {
	  full: "{{date}} '????????????' {{time}}",
	  long: "{{date}} '????????????' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$C = {
	  date: buildFormatLongFn({
	    formats: dateFormats$C,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$C,
	    defaultWidth: 'medium'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$C,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$A = {
	  lastWeek: "eeee'?????????????????????????????????' p",
	  yesterday: "'?????????????????????????????????????????????' p",
	  today: "'??????????????????????????????' p",
	  tomorrow: "'????????????????????????????????????' p",
	  nextWeek: "eeee '????????????' p",
	  other: 'P'
	};
	function formatRelative$B(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$A[token];
	}

	var eraValues$A = {
	  narrow: ['B', '??????'],
	  abbreviated: ['BC', '???.???.'],
	  wide: ['??????????????????????????????????????????', '????????????????????????????????????']
	};
	var quarterValues$A = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
	  wide: ['???????????????????????????', '????????????????????????????????????', '????????????????????????????????????', '????????????????????????????????????']
	};
	var dayValues$A = {
	  narrow: ['??????.', '???.', '???.', '???.', '??????.', '???.', '???.'],
	  short: ['??????.', '???.', '???.', '???.', '??????.', '???.', '???.'],
	  abbreviated: ['??????.', '???.', '???.', '???.', '??????.', '???.', '???.'],
	  wide: ['?????????????????????', '??????????????????', '??????????????????', '?????????', '????????????????????????', '???????????????', '???????????????']
	};
	var monthValues$A = {
	  narrow: ['???.???.', '???.???.', '??????.???.', '??????.???.', '???.???.', '??????.???.', '???.???.', '???.???.', '???.???.', '???.???.', '???.???.', '???.???.'],
	  abbreviated: ['???.???.', '???.???.', '??????.???.', '??????.???.', '???.???.', '??????.???.', '???.???.', '???.???.', '???.???.', '???.???.', '???.???.', '???.???.'],
	  wide: ['??????????????????', '??????????????????????????????', '??????????????????', '??????????????????', '?????????????????????', '????????????????????????', '?????????????????????', '?????????????????????', '?????????????????????', '??????????????????', '???????????????????????????', '?????????????????????']
	};
	var dayPeriodValues$A = {
	  narrow: {
	    am: '??????????????????????????????',
	    pm: '??????????????????????????????',
	    midnight: '???????????????????????????',
	    noon: '??????????????????',
	    morning: '????????????',
	    afternoon: '????????????',
	    evening: '????????????',
	    night: '?????????????????????'
	  },
	  abbreviated: {
	    am: '??????????????????????????????',
	    pm: '??????????????????????????????',
	    midnight: '???????????????????????????',
	    noon: '??????????????????',
	    morning: '????????????',
	    afternoon: '????????????',
	    evening: '????????????',
	    night: '?????????????????????'
	  },
	  wide: {
	    am: '??????????????????????????????',
	    pm: '??????????????????????????????',
	    midnight: '???????????????????????????',
	    noon: '??????????????????',
	    morning: '????????????',
	    afternoon: '????????????',
	    evening: '????????????',
	    night: '?????????????????????'
	  }
	};
	var formattingDayPeriodValues$r = {
	  narrow: {
	    am: '??????????????????????????????',
	    pm: '??????????????????????????????',
	    midnight: '???????????????????????????',
	    noon: '??????????????????',
	    morning: '?????????????????????',
	    afternoon: '??????????????????????????????',
	    evening: '?????????????????????',
	    night: '??????????????????????????????'
	  },
	  abbreviated: {
	    am: '??????????????????????????????',
	    pm: '??????????????????????????????',
	    midnight: '???????????????????????????',
	    noon: '??????????????????',
	    morning: '?????????????????????',
	    afternoon: '??????????????????????????????',
	    evening: '?????????????????????',
	    night: '??????????????????????????????'
	  },
	  wide: {
	    am: '??????????????????????????????',
	    pm: '??????????????????????????????',
	    midnight: '???????????????????????????',
	    noon: '??????????????????',
	    morning: '?????????????????????',
	    afternoon: '??????????????????????????????',
	    evening: '?????????????????????',
	    night: '??????????????????????????????'
	  }
	};

	function ordinalNumber$A(dirtyNumber) {
	  var number = Number(dirtyNumber);
	  return number;
	}

	var localize$A = {
	  ordinalNumber: ordinalNumber$A,
	  era: buildLocalizeFn({
	    values: eraValues$A,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$A,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$A,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$A,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$A,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$r,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$A = /^\d+/i;
	var parseOrdinalNumberPattern$A = /\d+/i;
	var matchEraPatterns$A = {
	  narrow: /^([bB]|[aA]|??????)/i,
	  abbreviated: /^([bB]\.?\s?[cC]\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?|???\.????\.?)/i,
	  wide: /^(????????????????????????????????????|????????????????????????????????????|????????????????????????)/i
	};
	var parseEraPatterns$A = {
	  any: [/^[bB]/i, /^(^[aA]|???\.????\.?|????????????????????????|????????????????????????????????????|)/i]
	};
	var matchQuarterPatterns$A = {
	  narrow: /^[1234]/i,
	  abbreviated: /^q[1234]/i,
	  wide: /^??????????????????(?????????)? ?[1234]/i
	};
	var parseQuarterPatterns$A = {
	  any: [/(1|?????????|???????????????)/i, /(2|?????????)/i, /(3|?????????)/i, /(4|?????????)/i]
	};
	var matchMonthPatterns$A = {
	  narrow: /^(???\.????\.?|???\.????\.?|??????\.????\.?|??????\.????\.?|???\.????\.?|??????\.????\.?|???\.????\.?|???\.????\.?|???\.????\.?|???\.????\.?|???\.????\.?|???\.????\.?)/i,
	  abbreviated: /^(???\.????\.?|???\.????\.?|??????\.????\.?|??????\.????\.?|???\.????\.?|??????\.????\.?|???\.????\.?|???\.????\.?|???\.????\.?|???\.????\.?|???\.????\.?|???\.????\.?')/i,
	  wide: /^(??????????????????|??????????????????????????????|??????????????????|??????????????????|?????????????????????|????????????????????????|?????????????????????|?????????????????????|?????????????????????|??????????????????|???????????????????????????|?????????????????????)/i
	};
	var parseMonthPatterns$A = {
	  wide: [/^??????/i, /^?????????/i, /^??????/i, /^??????/i, /^?????????/i, /^??????/i, /^?????????/i, /^???/i, /^?????????/i, /^???/i, /^?????????/i, /^???/i],
	  any: [/^???\.????\.?/i, /^???\.????\.?/i, /^??????\.????\.?/i, /^??????\.????\.?/i, /^???\.????\.?/i, /^??????\.????\.?/i, /^???\.????\.?/i, /^???\.????\.?/i, /^???\.????\.?/i, /^???\.????\.?/i, /^???\.????\.?/i, /^???\.????\.?/i]
	};
	var matchDayPatterns$A = {
	  narrow: /^(??????\.?|???\.?|???\.?|??????\.?|???\.?|???\.?|???\.?)/i,
	  short: /^(??????\.?|???\.?|???\.?|??????\.?|???\.?|???\.?|???\.?)/i,
	  abbreviated: /^(??????\.?|???\.?|???\.?|??????\.?|???\.?|???\.?|???\.?)/i,
	  wide: /^(?????????????????????|??????????????????|??????????????????|?????????|????????????????????????|???????????????|???????????????)/i
	};
	var parseDayPatterns$A = {
	  wide: [/^??????/i, /^??????/i, /^??????/i, /^?????????/i, /^??????/i, /^???/i, /^??????/i],
	  any: [/^??????/i, /^???/i, /^???/i, /^???(?!???)/i, /^??????/i, /^???/i, /^???/i]
	};
	var matchDayPeriodPatterns$A = {
	  any: /^(??????????????????????????????|??????????????????????????????|???????????????????????????|??????????????????|(?????????.*?)?.*(??????????????????|????????????|????????????|????????????|?????????????????????))/i
	};
	var parseDayPeriodPatterns$A = {
	  any: {
	    am: /^??????????????????????????????/i,
	    pm: /^??????????????????????????????/i,
	    midnight: /^???????????????????????????/i,
	    noon: /^??????????????????/i,
	    morning: /????????????/i,
	    afternoon: /????????????/i,
	    evening: /????????????/i,
	    night: /?????????????????????/i
	  }
	};
	var match$A = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$A,
	    parsePattern: parseOrdinalNumberPattern$A,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$A,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$A,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$A,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$A,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$A,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$A,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$A,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$A,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$A,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$A,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Thai locale.
	 * @language Thai
	 * @iso-639-2 tha
	 * @author Athiwat Hirunworawongkun [@athivvat]{@link https://github.com/athivvat}
	 * @author [@hawkup]{@link https://github.com/hawkup}
	 * @author  Jirawat I. [@nodtem66]{@link https://github.com/nodtem66}
	 */

	var locale$C = {
	  formatDistance: formatDistance$C,
	  formatLong: formatLong$C,
	  formatRelative: formatRelative$B,
	  localize: localize$A,
	  match: match$A,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	var formatDistanceLocale$B = {
	  lessThanXSeconds: {
	    one: 'bir saniyeden az',
	    other: '{{count}} saniyeden az'
	  },
	  xSeconds: {
	    one: '1 saniye',
	    other: '{{count}} saniye'
	  },
	  halfAMinute: 'yar??m dakika',
	  lessThanXMinutes: {
	    one: 'bir dakikadan az',
	    other: '{{count}} dakikadan az'
	  },
	  xMinutes: {
	    one: '1 dakika',
	    other: '{{count}} dakika'
	  },
	  aboutXHours: {
	    one: 'yakla????k 1 saat',
	    other: 'yakla????k {{count}} saat'
	  },
	  xHours: {
	    one: '1 saat',
	    other: '{{count}} saat'
	  },
	  xDays: {
	    one: '1 g??n',
	    other: '{{count}} g??n'
	  },
	  aboutXMonths: {
	    one: 'yakla????k 1 ay',
	    other: 'yakla????k {{count}} ay'
	  },
	  xMonths: {
	    one: '1 ay',
	    other: '{{count}} ay'
	  },
	  aboutXYears: {
	    one: 'yakla????k 1 y??l',
	    other: 'yakla????k {{count}} y??l'
	  },
	  xYears: {
	    one: '1 y??l',
	    other: '{{count}} y??l'
	  },
	  overXYears: {
	    one: '1 y??ldan fazla',
	    other: '{{count}} y??ldan fazla'
	  },
	  almostXYears: {
	    one: 'neredeyse 1 y??l',
	    other: 'neredeyse {{count}} y??l'
	  }
	};
	function formatDistance$D(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$B[token] === 'string') {
	    result = formatDistanceLocale$B[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$B[token].one;
	  } else {
	    result = formatDistanceLocale$B[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return result + ' sonra';
	    } else {
	      return result + ' ??nce';
	    }
	  }

	  return result;
	}

	var dateFormats$D = {
	  full: 'd MMMM y EEEE',
	  long: 'd MMMM y',
	  medium: 'd MMM y',
	  short: 'dd.MM.yyyy'
	};
	var timeFormats$D = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$D = {
	  full: "{{date}} 'saat' {{time}}",
	  long: "{{date}} 'saat' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$D = {
	  date: buildFormatLongFn({
	    formats: dateFormats$D,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$D,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$D,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$B = {
	  lastWeek: "'ge??en hafta' eeee 'saat' p",
	  yesterday: "'d??n saat' p",
	  today: "'bug??n saat' p",
	  tomorrow: "'yar??n saat' p",
	  nextWeek: "eeee 'saat' p",
	  other: 'P'
	};
	function formatRelative$C(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$B[token];
	}

	var eraValues$B = {
	  abbreviated: ['M??', 'MS'],
	  narrow: ['M??', 'MS'],
	  wide: ['Milattan ??nce', 'Milattan Sonra']
	};
	var quarterValues$B = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['1??', '2??', '3??', '4??'],
	  wide: ['??lk ??eyrek', '??kinci ??eyrek', '??????nc?? ??eyrek', 'Son ??eyrek']
	};
	var monthValues$B = {
	  narrow: ['O', '??', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'],
	  abbreviated: ['Oca', '??ub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'A??u', 'Eyl', 'Eki', 'Kas', 'Ara'],
	  wide: ['Ocak', '??ubat', 'Mart', 'Nisan', 'May??s', 'Haziran', 'Temmuz', 'A??ustos', 'Eyl??l', 'Ekim', 'Kas??m', 'Aral??k']
	};
	var dayValues$B = {
	  narrow: ['P', 'P', 'S', '??', 'P', 'C', 'C'],
	  short: ['Pz', 'Pt', 'Sa', '??a', 'Pe', 'Cu', 'Ct'],
	  abbreviated: ['Paz', 'Pts', 'Sal', '??ar', 'Per', 'Cum', 'Cts'],
	  wide: ['Pazar', 'Pazartesi', 'Sal??', '??ar??amba', 'Per??embe', 'Cuma', 'Cumartesi']
	};
	var dayPeriodValues$B = {
	  narrow: {
	    am: '????',
	    pm: '??s',
	    midnight: 'gy',
	    noon: '??',
	    morning: 'sa',
	    afternoon: '??s',
	    evening: 'ak',
	    night: 'ge'
	  },
	  abbreviated: {
	    am: '????',
	    pm: '??S',
	    midnight: 'gece yar??s??',
	    noon: '????le',
	    morning: 'sabah',
	    afternoon: '????leden sonra',
	    evening: 'ak??am',
	    night: 'gece'
	  },
	  wide: {
	    am: '??.??.',
	    pm: '??.S.',
	    midnight: 'gece yar??s??',
	    noon: '????le',
	    morning: 'sabah',
	    afternoon: '????leden sonra',
	    evening: 'ak??am',
	    night: 'gece'
	  }
	};
	var formattingDayPeriodValues$s = {
	  narrow: {
	    am: '????',
	    pm: '??s',
	    midnight: 'gy',
	    noon: '??',
	    morning: 'sa',
	    afternoon: '??s',
	    evening: 'ak',
	    night: 'ge'
	  },
	  abbreviated: {
	    am: '????',
	    pm: '??S',
	    midnight: 'gece yar??s??',
	    noon: '????len',
	    morning: 'sabahleyin',
	    afternoon: '????leden sonra',
	    evening: 'ak??amleyin',
	    night: 'geceleyin'
	  },
	  wide: {
	    am: '??.??.',
	    pm: '??.s.',
	    midnight: 'gece yar??s??',
	    noon: '????len',
	    morning: 'sabahleyin',
	    afternoon: '????leden sonra',
	    evening: 'ak??amleyin',
	    night: 'geceleyin'
	  }
	};

	function ordinalNumber$B(dirtyNumber, _dirtyOptions) {
	  var number = Number(dirtyNumber);
	  return number + '.';
	}

	var localize$B = {
	  ordinalNumber: ordinalNumber$B,
	  era: buildLocalizeFn({
	    values: eraValues$B,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$B,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$B,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$B,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$B,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$s,
	    defaulFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$B = /^(\d+)(\.)?/i;
	var parseOrdinalNumberPattern$B = /\d+/i;
	var matchEraPatterns$B = {
	  narrow: /^(m??|ms)/i,
	  abbreviated: /^(m??|ms)/i,
	  wide: /^(milattan ??nce|milattan sonra)/i
	};
	var parseEraPatterns$B = {
	  any: [/(^m??|^milattan ??nce)/i, /(^ms|^milattan sonra)/i]
	};
	var matchQuarterPatterns$B = {
	  narrow: /^[1234]/i,
	  abbreviated: /^[1234]??/i,
	  wide: /^((i|??)lk|(i|??)kinci|??????nc??|son) ??eyrek/i
	};
	var parseQuarterPatterns$B = {
	  any: [/1/i, /2/i, /3/i, /4/i],
	  abbreviated: [/1??/i, /2??/i, /3??/i, /4??/i],
	  wide: [/^(i|??)lk ??eyrek/i, /(i|??)kinci ??eyrek/i, /??????nc?? ??eyrek/i, /son ??eyrek/i]
	};
	var matchMonthPatterns$B = {
	  narrow: /^[jfmasond]/i,
	  abbreviated: /^(oca|??ub|mar|nis|may|haz|tem|a??u|eyl|eki|kas|ara)/i,
	  wide: /^(ocak|??ubat|mart|nisan|may??s|haziran|temmuz|a??ustos|eyl??l|ekim|kas??m|aral??k)/i
	};
	var parseMonthPatterns$B = {
	  narrow: [/^o/i, /^??/i, /^m/i, /^n/i, /^m/i, /^h/i, /^t/i, /^a/i, /^e/i, /^e/i, /^k/i, /^a/i],
	  any: [/^o/i, /^??/i, /^ma/i, /^n/i, /^ma/i, /^h/i, /^t/i, /^a/i, /^ey/i, /^ek/i, /^k/i, /^a/i]
	};
	var matchDayPatterns$B = {
	  narrow: /^[ps??c]/i,
	  short: /^(pz|pt|sa|??a|pe|cu|ct)/i,
	  abbreviated: /^(paz|pts|sal|??ar|per|cum|cts)/i,
	  wide: /^(pazar|pazartesi|sal??|??ar??amba|per??embe|cuma|cumartesi)/i
	};
	var parseDayPatterns$B = {
	  narrow: [/^p/i, /^p/i, /^s/i, /^??/i, /^p/i, /^c/i, /^c/i],
	  any: [/^pz/i, /^pt/i, /^sa/i, /^??a/i, /^pe/i, /^cu/i, /^ct/i],
	  wide: [/^pazar/i, /^pazartesi/i, /^sal??/i, /^??ar??amba/i, /^per??embe/i, /^cuma/i, /cumartesi/i]
	};
	var matchDayPeriodPatterns$B = {
	  narrow: /^(????|??s|gy|??|sa|??s|ak|ge)/i,
	  any: /^(??\.?\s?[??s]\.?|????leden sonra|gece yar??s??|????le|(sabah|????|ak??am|gece)(leyin))/i
	};
	var parseDayPeriodPatterns$B = {
	  any: {
	    am: /^??\.???\.?/i,
	    pm: /^??\.?s\.?/i,
	    midnight: /^(gy|gece yar??s??)/i,
	    noon: /^????/i,
	    morning: /^sa/i,
	    afternoon: /^????leden sonra/i,
	    evening: /^ak/i,
	    night: /^ge/i
	  }
	};
	var match$B = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$B,
	    parsePattern: parseOrdinalNumberPattern$B,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$B,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$B,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$B,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$B,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$B,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$B,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$B,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$B,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$B,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$B,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Turkish locale.
	 * @language Turkish
	 * @iso-639-2 tur
	 * @author Alpcan Ayd??n [@alpcanaydin]{@link https://github.com/alpcanaydin}
	 * @author Berkay Sarg??n [@berkaey]{@link https://github.com/berkaey}
	 * @author Ismail Demirbilek [@dbtek]{@link https://github.com/dbtek}
	 * @author ??smail Kayar [@ikayar]{@link https://github.com/ikayar}
	 *
	 *
	 */

	var locale$D = {
	  formatDistance: formatDistance$D,
	  formatLong: formatLong$D,
	  formatRelative: formatRelative$C,
	  localize: localize$B,
	  match: match$B,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	var formatDistanceLocale$C = {
	  lessThanXSeconds: {
	    one: '?????? ???????????? ????????????',
	    other: '???????????? ???????????? {{count}}'
	  },
	  xSeconds: {
	    one: '?????? ????????????',
	    other: '???????????? {{count}}'
	  },
	  halfAMinute: '?????????? ??????????',
	  lessThanXMinutes: {
	    one: '?????? ?????????? ????????????',
	    other: '?????????? ???????????? {{count}}'
	  },
	  xMinutes: {
	    one: '?????? ??????????',
	    other: '?????????? {{count}}'
	  },
	  aboutXHours: {
	    one: '???????????????? ?????? ??????????',
	    other: '?????????? {{count}} ????????????????'
	  },
	  xHours: {
	    one: '?????? ??????????',
	    other: '?????????? {{count}}'
	  },
	  xDays: {
	    one: '?????? ??????',
	    other: '?????? {{count}}'
	  },
	  aboutXMonths: {
	    one: '???????????????? ?????? ??????',
	    other: '?????? {{count}} ????????????????'
	  },
	  xMonths: {
	    one: '?????? ??????',
	    other: '?????? {{count}}'
	  },
	  aboutXYears: {
	    one: '???????????????? ?????? ??????',
	    other: '?????? {{count}} ????????????????'
	  },
	  xYears: {
	    one: '?????? ??????',
	    other: '?????? {{count}}'
	  },
	  overXYears: {
	    one: '?????? ???????????? ????????????',
	    other: '???????????? ???????????? {{count}}'
	  },
	  almostXYears: {
	    one: '?????????????? ?????? ??????',
	    other: '?????? {{count}} ??????????????'
	  }
	};
	function formatDistance$E(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$C[token] === 'string') {
	    result = formatDistanceLocale$C[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$C[token].one;
	  } else {
	    result = formatDistanceLocale$C[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return result;
	    } else {
	      return result + ' ??????????';
	    }
	  }

	  return result;
	}

	var dateFormats$E = {
	  full: 'EEEE, MMMM do, y',
	  long: 'MMMM do, y',
	  medium: 'MMM d, y',
	  short: 'MM/dd/yyyy'
	};
	var timeFormats$E = {
	  full: 'h:mm:ss a zzzz',
	  long: 'h:mm:ss a z',
	  medium: 'h:mm:ss a',
	  short: 'h:mm a'
	};
	var dateTimeFormats$E = {
	  full: "{{date}} '????' {{time}}",
	  long: "{{date}} '????' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$E = {
	  date: buildFormatLongFn({
	    formats: dateFormats$E,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$E,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$E,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$C = {
	  lastWeek: "'???????????????' eeee '????' p",
	  yesterday: "'?????????????? ????' p",
	  today: "'?????????? ????' p",
	  tomorrow: "'???????? ????' p",
	  nextWeek: "eeee '????' p",
	  other: 'P'
	};
	function formatRelative$D(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$C[token];
	}

	var eraValues$C = {
	  narrow: ['??', '??'],
	  abbreviated: ['??', '??'],
	  wide: ['???????????????????? ??????????', '???????????????????? ??????????']
	};
	var quarterValues$C = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['1', '2', '3', '4'],
	  wide: ['?????????????? ??????????', '???????????????? ??????????', '?????????????? ??????????', '?????????????? ??????????'] // Note: in English, the names of days of the week and months are capitalized.
	  // If you are making a new locale based on this one, check if the same is true for the language you're working on.
	  // Generally, formatted dates should look like they are in the middle of a sentence,
	  // e.g. in Spanish language the weekdays and months should be in the lowercase.

	};
	var monthValues$C = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'],
	  abbreviated: ['????????????', '??????????????', '????????', '????????????', '??????', '??????????', '??????????', '??????????????', '????????????????', '????????????????', '??????????????', '??????????????'],
	  wide: ['????????????', '??????????????', '????????', '????????????', '??????', '??????????', '??????????', '??????????????', '????????????????', '????????????????', '??????????????', '??????????????']
	};
	var dayValues$C = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??'],
	  short: ['??', '??', '??', '??', '??', '??', '??'],
	  abbreviated: ['????????????????', '??????????????', '????????????????', '????????????????', '????????????????', '????????', '??????????'],
	  wide: ['????????????????', '??????????????', '????????????????', '????????????????', '????????????????', '????????', '??????????']
	};
	var dayPeriodValues$C = {
	  narrow: {
	    am: '????',
	    pm: '??',
	    midnight: '??',
	    noon: '??',
	    morning: '??????????????',
	    afternoon: '???????????? ??????????',
	    evening: '????????????',
	    night: '????????'
	  },
	  abbreviated: {
	    am: '????',
	    pm: '??',
	    midnight: '??',
	    noon: '??',
	    morning: '??????????????',
	    afternoon: '???????????? ??????????',
	    evening: '????????????',
	    night: '????????'
	  },
	  wide: {
	    am: '????',
	    pm: '??',
	    midnight: '??',
	    noon: '??',
	    morning: '??????????????',
	    afternoon: '???????????? ??????????',
	    evening: '????????????',
	    night: '????????'
	  }
	};
	var formattingDayPeriodValues$t = {
	  narrow: {
	    am: '????',
	    pm: '??',
	    midnight: '??',
	    noon: '??',
	    morning: '??????????????????',
	    afternoon: '???????????? ??????????',
	    evening: '????????????????',
	    night: '????????????'
	  },
	  abbreviated: {
	    am: '????',
	    pm: '??',
	    midnight: '??',
	    noon: '??',
	    morning: '??????????????????',
	    afternoon: '???????????? ??????????',
	    evening: '????????????????',
	    night: '????????????'
	  },
	  wide: {
	    am: '????',
	    pm: '??',
	    midnight: '??',
	    noon: '??',
	    morning: '??????????????????',
	    afternoon: '???????????? ??????????',
	    evening: '????????????????',
	    night: '????????????'
	  }
	};

	function ordinalNumber$C(dirtyNumber, _dirtyOptions) {
	  return String(dirtyNumber);
	}

	var localize$C = {
	  ordinalNumber: ordinalNumber$C,
	  era: buildLocalizeFn({
	    values: eraValues$C,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$C,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$C,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$C,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$C,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$t,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$C = /^(\d+)(th|st|nd|rd)?/i;
	var parseOrdinalNumberPattern$C = /\d+/i;
	var matchEraPatterns$C = {
	  narrow: /^(??|??)/i,
	  wide: /^(???????????????????? ??????????|???????????????????? ??????????)/i
	};
	var parseEraPatterns$C = {
	  any: [/^??????????/i, /^??????????/i]
	};
	var matchQuarterPatterns$C = {
	  narrow: /^[1234]/i,
	  abbreviated: /^??[1234]/i,
	  wide: /^?????????? [1234]/i
	};
	var parseQuarterPatterns$C = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$C = {
	  narrow: /^[?????????????????????????????]/i,
	  abbreviated: /^(????????????|??????????????|????????|????????????|??????|??????????|??????????|??????????????|????????????????|????????????????|??????????????|??????????????)/i,
	  wide: /^(????????????|??????????????|????????|????????????|??????|??????????|??????????|??????????????|????????????????|????????????????|??????????????|??????????????)/i
	};
	var parseMonthPatterns$C = {
	  narrow: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^?????/i, /^?????/i, /^?????/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  any: [/^??????/i, /^??????/i, /^??????/i, /^??????/i, /^??????/i, /^??????????/i, /^??????????/i, /^??????/i, /^??????/i, /^??????/i, /^??????/i, /^??????/i]
	};
	var matchDayPatterns$C = {
	  narrow: /^[??????????????]/i,
	  short: /^(????|????|????|????|????|????|????)/i,
	  abbreviated: /^(????|????|????|????|????|????|????)/i,
	  wide: /^(????????????????|??????????????|????????????????|????????????????|????????????????|????????|??????????)/i
	};
	var parseDayPatterns$C = {
	  narrow: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  any: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i]
	};
	var matchDayPeriodPatterns$C = {
	  narrow: /^(????|??|??|??|(????|??????????????) ( ???????|???????????? ??????????|????????????|????????))/i,
	  any: /^(????|??|??|??|(????|??????????????) ( ???????|???????????? ??????????|????????????|????????))/i
	};
	var parseDayPeriodPatterns$C = {
	  any: {
	    am: /^????/i,
	    pm: /^??/i,
	    midnight: /^??/i,
	    noon: /^??/i,
	    morning: /??????????????/i,
	    afternoon: /???????????? ??????????/i,
	    evening: /????????????/i,
	    night: /????????/i
	  }
	};
	var match$C = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$C,
	    parsePattern: parseOrdinalNumberPattern$C,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$C,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$C,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$C,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$C,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$C,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$C,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$C,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$C,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$C,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$C,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Uighur locale
	 * @language Uighur
	 * @iso-639-2 uig
	 * @author Abduwaly M. [@abduwaly]{@link https://github.com/abduwaly}
	 */

	var locale$E = {
	  formatDistance: formatDistance$E,
	  formatLong: formatLong$E,
	  formatRelative: formatRelative$D,
	  localize: localize$C,
	  match: match$C,
	  options: {
	    weekStartsOn: 0
	    /* Sunday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	function declension$4(scheme, count) {
	  // scheme for count=1 exists
	  if (scheme.one !== undefined && count === 1) {
	    return scheme.one;
	  }

	  var rem10 = count % 10;
	  var rem100 = count % 100; // 1, 21, 31, ...

	  if (rem10 === 1 && rem100 !== 11) {
	    return scheme.singularNominative.replace('{{count}}', count); // 2, 3, 4, 22, 23, 24, 32 ...
	  } else if (rem10 >= 2 && rem10 <= 4 && (rem100 < 10 || rem100 > 20)) {
	    return scheme.singularGenitive.replace('{{count}}', count); // 5, 6, 7, 8, 9, 10, 11, ...
	  } else {
	    return scheme.pluralGenitive.replace('{{count}}', count);
	  }
	}

	function buildLocalizeTokenFn$3(scheme) {
	  return function (count, options) {
	    if (options.addSuffix) {
	      if (options.comparison > 0) {
	        if (scheme.future) {
	          return declension$4(scheme.future, count);
	        } else {
	          return '???? ' + declension$4(scheme.regular, count);
	        }
	      } else {
	        if (scheme.past) {
	          return declension$4(scheme.past, count);
	        } else {
	          return declension$4(scheme.regular, count) + ' ????????';
	        }
	      }
	    } else {
	      return declension$4(scheme.regular, count);
	    }
	  };
	}

	var formatDistanceLocale$D = {
	  lessThanXSeconds: buildLocalizeTokenFn$3({
	    regular: {
	      one: '?????????? ??????????????',
	      singularNominative: '?????????? {{count}} ??????????????',
	      singularGenitive: '?????????? {{count}} ????????????',
	      pluralGenitive: '?????????? {{count}} ????????????'
	    },
	    future: {
	      one: '??????????, ?????? ???? ??????????????',
	      singularNominative: '??????????, ?????? ???? {{count}} ??????????????',
	      singularGenitive: '??????????, ?????? ???? {{count}} ??????????????',
	      pluralGenitive: '??????????, ?????? ???? {{count}} ????????????'
	    }
	  }),
	  xSeconds: buildLocalizeTokenFn$3({
	    regular: {
	      singularNominative: '{{count}} ??????????????',
	      singularGenitive: '{{count}} ??????????????',
	      pluralGenitive: '{{count}} ????????????'
	    },
	    past: {
	      singularNominative: '{{count}} ?????????????? ????????',
	      singularGenitive: '{{count}} ?????????????? ????????',
	      pluralGenitive: '{{count}} ???????????? ????????'
	    },
	    future: {
	      singularNominative: '???? {{count}} ??????????????',
	      singularGenitive: '???? {{count}} ??????????????',
	      pluralGenitive: '???? {{count}} ????????????'
	    }
	  }),
	  halfAMinute: function (_, options) {
	    if (options.addSuffix) {
	      if (options.comparison > 0) {
	        return '???? ????????????????????';
	      } else {
	        return '???????????????????? ????????';
	      }
	    }

	    return '????????????????????';
	  },
	  lessThanXMinutes: buildLocalizeTokenFn$3({
	    regular: {
	      one: '?????????? ??????????????',
	      singularNominative: '?????????? {{count}} ??????????????',
	      singularGenitive: '?????????? {{count}} ????????????',
	      pluralGenitive: '?????????? {{count}} ????????????'
	    },
	    future: {
	      one: '??????????, ?????? ???? ??????????????',
	      singularNominative: '??????????, ?????? ???? {{count}} ??????????????',
	      singularGenitive: '??????????, ?????? ???? {{count}} ??????????????',
	      pluralGenitive: '??????????, ?????? ???? {{count}} ????????????'
	    }
	  }),
	  xMinutes: buildLocalizeTokenFn$3({
	    regular: {
	      singularNominative: '{{count}} ??????????????',
	      singularGenitive: '{{count}} ??????????????',
	      pluralGenitive: '{{count}} ????????????'
	    },
	    past: {
	      singularNominative: '{{count}} ?????????????? ????????',
	      singularGenitive: '{{count}} ?????????????? ????????',
	      pluralGenitive: '{{count}} ???????????? ????????'
	    },
	    future: {
	      singularNominative: '???? {{count}} ??????????????',
	      singularGenitive: '???? {{count}} ??????????????',
	      pluralGenitive: '???? {{count}} ????????????'
	    }
	  }),
	  aboutXHours: buildLocalizeTokenFn$3({
	    regular: {
	      singularNominative: '?????????????? {{count}} ????????????',
	      singularGenitive: '?????????????? {{count}} ??????????',
	      pluralGenitive: '?????????????? {{count}} ??????????'
	    },
	    future: {
	      singularNominative: '?????????????????? ???? {{count}} ????????????',
	      singularGenitive: '?????????????????? ???? {{count}} ????????????',
	      pluralGenitive: '?????????????????? ???? {{count}} ??????????'
	    }
	  }),
	  xHours: buildLocalizeTokenFn$3({
	    regular: {
	      singularNominative: '{{count}} ????????????',
	      singularGenitive: '{{count}} ????????????',
	      pluralGenitive: '{{count}} ??????????'
	    }
	  }),
	  xDays: buildLocalizeTokenFn$3({
	    regular: {
	      singularNominative: '{{count}} ????????',
	      singularGenitive: '{{count}} ??????',
	      pluralGenitive: '{{count}} ????????'
	    }
	  }),
	  aboutXMonths: buildLocalizeTokenFn$3({
	    regular: {
	      singularNominative: '?????????????? {{count}} ????????????',
	      singularGenitive: '?????????????? {{count}} ??????????????',
	      pluralGenitive: '?????????????? {{count}} ??????????????'
	    },
	    future: {
	      singularNominative: '?????????????????? ???? {{count}} ????????????',
	      singularGenitive: '?????????????????? ???? {{count}} ????????????',
	      pluralGenitive: '?????????????????? ???? {{count}} ??????????????'
	    }
	  }),
	  xMonths: buildLocalizeTokenFn$3({
	    regular: {
	      singularNominative: '{{count}} ????????????',
	      singularGenitive: '{{count}} ????????????',
	      pluralGenitive: '{{count}} ??????????????'
	    }
	  }),
	  aboutXYears: buildLocalizeTokenFn$3({
	    regular: {
	      singularNominative: '?????????????? {{count}} ????????',
	      singularGenitive: '?????????????? {{count}} ??????????',
	      pluralGenitive: '?????????????? {{count}} ??????????'
	    },
	    future: {
	      singularNominative: '?????????????????? ???? {{count}} ??????',
	      singularGenitive: '?????????????????? ???? {{count}} ????????',
	      pluralGenitive: '?????????????????? ???? {{count}} ??????????'
	    }
	  }),
	  xYears: buildLocalizeTokenFn$3({
	    regular: {
	      singularNominative: '{{count}} ??????',
	      singularGenitive: '{{count}} ????????',
	      pluralGenitive: '{{count}} ??????????'
	    }
	  }),
	  overXYears: buildLocalizeTokenFn$3({
	    regular: {
	      singularNominative: '???????????? {{count}} ????????',
	      singularGenitive: '???????????? {{count}} ??????????',
	      pluralGenitive: '???????????? {{count}} ??????????'
	    },
	    future: {
	      singularNominative: '????????????, ?????? ???? {{count}} ??????',
	      singularGenitive: '????????????, ?????? ???? {{count}} ????????',
	      pluralGenitive: '????????????, ?????? ???? {{count}} ??????????'
	    }
	  }),
	  almostXYears: buildLocalizeTokenFn$3({
	    regular: {
	      singularNominative: '?????????? {{count}} ??????',
	      singularGenitive: '?????????? {{count}} ????????',
	      pluralGenitive: '?????????? {{count}} ??????????'
	    },
	    future: {
	      singularNominative: '?????????? ???? {{count}} ??????',
	      singularGenitive: '?????????? ???? {{count}} ????????',
	      pluralGenitive: '?????????? ???? {{count}} ??????????'
	    }
	  })
	};
	function formatDistance$F(token, count, options) {
	  options = options || {};
	  return formatDistanceLocale$D[token](count, options);
	}

	var dateFormats$F = {
	  full: "EEEE, do MMMM y '??.'",
	  long: "do MMMM y '??.'",
	  medium: "d MMM y '??.'",
	  short: 'dd.MM.y'
	};
	var timeFormats$F = {
	  full: 'H:mm:ss zzzz',
	  long: 'H:mm:ss z',
	  medium: 'H:mm:ss',
	  short: 'H:mm'
	};
	var dateTimeFormats$F = {
	  full: "{{date}} '??' {{time}}",
	  long: "{{date}} '??' {{time}}",
	  medium: '{{date}}, {{time}}',
	  short: '{{date}}, {{time}}'
	};
	var formatLong$F = {
	  date: buildFormatLongFn({
	    formats: dateFormats$F,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$F,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$F,
	    defaultWidth: 'full'
	  })
	};

	var accusativeWeekdays$5 = ['????????????', '??????????????????', '????????????????', '????????????', '????????????', '?????????????????', '????????????'];

	function lastWeek$3(day) {
	  var weekday = accusativeWeekdays$5[day];

	  switch (day) {
	    case 0:
	    case 3:
	    case 5:
	    case 6:
	      return "'?? ???????????? " + weekday + " ??' p";

	    case 1:
	    case 2:
	    case 4:
	      return "'?? ?????????????? " + weekday + " ??' p";
	  }
	}

	function thisWeek$3(day) {
	  var weekday = accusativeWeekdays$5[day];
	  return "'?? " + weekday + " ??' p";
	}

	function nextWeek$3(day) {
	  var weekday = accusativeWeekdays$5[day];

	  switch (day) {
	    case 0:
	    case 3:
	    case 5:
	    case 6:
	      return "'?? ???????????????? " + weekday + " ??' p";

	    case 1:
	    case 2:
	    case 4:
	      return "'?? ?????????????????? " + weekday + " ??' p";
	  }
	}

	var formatRelativeLocale$D = {
	  lastWeek: function (date, baseDate, options) {
	    var day = date.getUTCDay();

	    if (isSameUTCWeek(date, baseDate, options)) {
	      return thisWeek$3(day);
	    } else {
	      return lastWeek$3(day);
	    }
	  },
	  yesterday: "'?????????? ??' p",
	  today: "'???????????????? ??' p",
	  tomorrow: "'???????????? ??' p",
	  nextWeek: function (date, baseDate, options) {
	    var day = date.getUTCDay();

	    if (isSameUTCWeek(date, baseDate, options)) {
	      return thisWeek$3(day);
	    } else {
	      return nextWeek$3(day);
	    }
	  },
	  other: 'P'
	};
	function formatRelative$E(token, date, baseDate, options) {
	  var format = formatRelativeLocale$D[token];

	  if (typeof format === 'function') {
	    return format(date, baseDate, options);
	  }

	  return format;
	}

	var eraValues$D = {
	  narrow: ['???? ??.??.', '??.??.'],
	  abbreviated: ['???? ??. ??.', '??. ??.'],
	  wide: ['???? ?????????? ??????', '?????????? ??????']
	};
	var quarterValues$D = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['1-?? ????.', '2-?? ????.', '3-?? ????.', '4-?? ????.'],
	  wide: ['1-?? ??????????????', '2-?? ??????????????', '3-?? ??????????????', '4-?? ??????????????']
	};
	var monthValues$D = {
	  // ???????? 3582:2013
	  narrow: ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'],
	  abbreviated: ['??????.', '??????.', '??????????.', '????????.', '????????.', '????????.', '??????.', '????????.', '??????????.', '????????.', '????????????.', '????????.'],
	  wide: ['????????????', '??????????', '????????????????', '??????????????', '??????????????', '??????????????', '????????????', '??????????????', '????????????????', '??????????????', '????????????????', '??????????????']
	};
	var formattingMonthValues$8 = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'],
	  abbreviated: ['??????.', '??????.', '??????????.', '????????.', '????????.', '????????.', '??????.', '????????.', '??????????.', '????????.', '????????????.', '????????.'],
	  wide: ['??????????', '????????????', '??????????????', '????????????', '????????????', '????????????', '??????????', '????????????', '??????????????', '????????????', '??????????????????', '????????????']
	};
	var dayValues$D = {
	  narrow: ['??', '??', '??', '??', '??', '??', '??'],
	  short: ['????', '????', '????', '????', '????', '????', '????'],
	  abbreviated: ['??????', '??????', '??????', '??????', '??????', '??????', '??????'],
	  wide: ['????????????', '??????????????????', '????????????????', '????????????', '????????????', '?????????????????', '????????????']
	};
	var dayPeriodValues$D = {
	  narrow: {
	    am: '????',
	    pm: '????',
	    midnight: '????????.',
	    noon: '??????.',
	    morning: '??????????',
	    afternoon: '????????',
	    evening: '??????.',
	    night: '??????'
	  },
	  abbreviated: {
	    am: '????',
	    pm: '????',
	    midnight: '????????.',
	    noon: '??????.',
	    morning: '??????????',
	    afternoon: '????????',
	    evening: '??????.',
	    night: '??????'
	  },
	  wide: {
	    am: '????',
	    pm: '????',
	    midnight: '????????????',
	    noon: '????????????????',
	    morning: '??????????',
	    afternoon: '????????',
	    evening: '??????????',
	    night: '??????'
	  }
	};
	var formattingDayPeriodValues$u = {
	  narrow: {
	    am: '????',
	    pm: '????',
	    midnight: '????????.',
	    noon: '??????.',
	    morning: '??????????',
	    afternoon: '??????',
	    evening: '??????.',
	    night: '????????'
	  },
	  abbreviated: {
	    am: '????',
	    pm: '????',
	    midnight: '????????.',
	    noon: '??????.',
	    morning: '??????????',
	    afternoon: '??????',
	    evening: '??????.',
	    night: '????????'
	  },
	  wide: {
	    am: '????',
	    pm: '????',
	    midnight: '????????????',
	    noon: '????????????????',
	    morning: '??????????',
	    afternoon: '??????',
	    evening: '??????.',
	    night: '????????'
	  }
	};

	function ordinalNumber$D(dirtyNumber, dirtyOptions) {
	  var options = dirtyOptions || {};
	  var unit = String(options.unit);
	  var suffix;

	  if (unit === 'date') {
	    if (dirtyNumber === 3 || dirtyNumber === 23) {
	      suffix = '-??';
	    } else {
	      suffix = '-??';
	    }
	  } else if (unit === 'minute' || unit === 'second' || unit === 'hour') {
	    suffix = '-??';
	  } else {
	    suffix = '-??';
	  }

	  return dirtyNumber + suffix;
	}

	var localize$D = {
	  ordinalNumber: ordinalNumber$D,
	  era: buildLocalizeFn({
	    values: eraValues$D,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$D,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$D,
	    defaultWidth: 'wide',
	    formattingValues: formattingMonthValues$8,
	    defaultFormattingWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$D,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$D,
	    defaultWidth: 'any',
	    formattingValues: formattingDayPeriodValues$u,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$D = /^(\d+)(-?(??|??|??|??|??))?/i;
	var parseOrdinalNumberPattern$D = /\d+/i;
	var matchEraPatterns$D = {
	  narrow: /^((???? )???\.?\s???\.?)/i,
	  abbreviated: /^((???? )???\.?\s???\.?)/i,
	  wide: /^(???? ?????????? ??????|?????????? ??????|???????? ??????)/i
	};
	var parseEraPatterns$D = {
	  any: [/^??/i, /^??/i]
	};
	var matchQuarterPatterns$D = {
	  narrow: /^[1234]/i,
	  abbreviated: /^[1234](-?[????]????)? ????.?/i,
	  wide: /^[1234](-?[????]????)? ??????????????/i
	};
	var parseQuarterPatterns$D = {
	  any: [/1/i, /2/i, /3/i, /4/i]
	};
	var matchMonthPatterns$D = {
	  narrow: /^[??????????????????]/i,
	  abbreviated: /^(??????|??????|??????|??????????|??????|?????????|??????|??????|??????|??????|??????|??????(??????)?|????????)\.?/i,
	  wide: /^(????????????|??????????|??????????|????????????|????????????????|??????????????|??????????????|????????????|??????????????|????????????|????????????|??????????|??????????????|????????????|????????????????|??????????????|??????????????|????????????|???????????????????|??????????????|????????????)/i
	};
	var parseMonthPatterns$D = {
	  narrow: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  any: [/^????/i, /^????/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??????/i, /^????/i, /^??/i, /^??/i, /^??????/i, /^??/i]
	};
	var matchDayPatterns$D = {
	  narrow: /^[??????????]/i,
	  short: /^(????|????|????|????|????|????|????)\.?/i,
	  abbreviated: /^(??????|??????|??????|??????|?????????|???????|??????)\.?/i,
	  wide: /^(??????????[????]|??????????????[????][????]|????????????[????][????]|??????????[????]|????????????(????)?|??\W*???????????[????]|??????????[????])/i
	};
	var parseDayPatterns$D = {
	  narrow: [/^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i, /^??/i],
	  any: [/^??/i, /^??[????]/i, /^??/i, /^??[????]/i, /^??/i, /^??\W*?[????]/i, /^??[????]/i]
	};
	var matchDayPeriodPatterns$D = {
	  narrow: /^([????]??|????????\.?|??????\.?|??????????|??????????|????????|??????|??????\.?|??????|????????)/i,
	  abbreviated: /^([????]??|????????\.?|??????\.?|??????????|??????????|????????|??????|??????\.?|??????|????????)/i,
	  wide: /^([????]??|????????????|????????????????|??????????|??????????|????????|??????|??????????|????????????|??????|????????)/i
	};
	var parseDayPeriodPatterns$D = {
	  any: {
	    am: /^????/i,
	    pm: /^????/i,
	    midnight: /^????????/i,
	    noon: /^??????/i,
	    morning: /^??/i,
	    afternoon: /^??[????]/i,
	    evening: /^??/i,
	    night: /^??/i
	  }
	};
	var match$D = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$D,
	    parsePattern: parseOrdinalNumberPattern$D,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$D,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$D,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$D,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$D,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$D,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$D,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$D,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$D,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$D,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPeriodPatterns$D,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Ukrainian locale.
	 * @language Ukrainian
	 * @iso-639-2 ukr
	 * @author Andrii Korzh [@korzhyk]{@link https://github.com/korzhyk}
	 * @author Andriy Shcherbyak [@shcherbyakdev]{@link https://github.com/shcherbyakdev}
	 */

	var locale$F = {
	  formatDistance: formatDistance$F,
	  formatLong: formatLong$F,
	  formatRelative: formatRelative$E,
	  localize: localize$D,
	  match: match$D,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 1
	  }
	};

	var formatDistanceLocale$E = {
	  lessThanXSeconds: {
	    one: 'd?????i 1 gi??y',
	    other: 'd?????i {{count}} gi??y'
	  },
	  xSeconds: {
	    one: '1 gi??y',
	    other: '{{count}} gi??y'
	  },
	  halfAMinute: 'n???a ph??t',
	  lessThanXMinutes: {
	    one: 'd?????i 1 ph??t',
	    other: 'd?????i {{count}} ph??t'
	  },
	  xMinutes: {
	    one: '1 ph??t',
	    other: '{{count}} ph??t'
	  },
	  aboutXHours: {
	    one: 'kho???ng 1 gi???',
	    other: 'kho???ng {{count}} gi???'
	  },
	  xHours: {
	    one: '1 gi???',
	    other: '{{count}} gi???'
	  },
	  xDays: {
	    one: '1 ng??y',
	    other: '{{count}} ng??y'
	  },
	  aboutXMonths: {
	    one: 'kho???ng 1 th??ng',
	    other: 'kho???ng {{count}} th??ng'
	  },
	  xMonths: {
	    one: '1 th??ng',
	    other: '{{count}} th??ng'
	  },
	  aboutXYears: {
	    one: 'kho???ng 1 n??m',
	    other: 'kho???ng {{count}} n??m'
	  },
	  xYears: {
	    one: '1 n??m',
	    other: '{{count}} n??m'
	  },
	  overXYears: {
	    one: 'h??n 1 n??m',
	    other: 'h??n {{count}} n??m'
	  },
	  almostXYears: {
	    one: 'g???n 1 n??m',
	    other: 'g???n {{count}} n??m'
	  }
	};
	function formatDistance$G(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$E[token] === 'string') {
	    result = formatDistanceLocale$E[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$E[token].one;
	  } else {
	    result = formatDistanceLocale$E[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return result + ' n???a';
	    } else {
	      return result + ' tr?????c';
	    }
	  }

	  return result;
	}

	var dateFormats$G = {
	  // th??? S??u, ng??y 25 th??ng 08 n??m 2017
	  full: "EEEE, 'ng??y' d MMMM 'n??m' y",
	  // ng??y 25 th??ng 08 n??m 2017
	  long: "'ng??y' d MMMM 'n??m' y",
	  // 25 thg 08 n??m 2017
	  medium: "d MMM 'n??m' y",
	  // 25/08/2017
	  short: 'dd/MM/y'
	};
	var timeFormats$G = {
	  full: 'HH:mm:ss zzzz',
	  long: 'HH:mm:ss z',
	  medium: 'HH:mm:ss',
	  short: 'HH:mm'
	};
	var dateTimeFormats$G = {
	  // th??? S??u, ng??y 25 th??ng 08 n??m 2017 23:25:59
	  full: '{{date}} {{time}}',
	  // ng??y 25 th??ng 08 n??m 2017 23:25
	  long: '{{date}} {{time}}',
	  medium: '{{date}} {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$G = {
	  date: buildFormatLongFn({
	    formats: dateFormats$G,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$G,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$G,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$E = {
	  lastWeek: "eeee 'tu???n tr?????c v??o l??c' p",
	  yesterday: "'h??m qua v??o l??c' p",
	  today: "'h??m nay v??o l??c' p",
	  tomorrow: "'ng??y mai v??o l??c' p",
	  nextWeek: "eeee 't???i v??o l??c' p",
	  other: 'P'
	};
	function formatRelative$F(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$E[token];
	}

	// Capitalization reference: http://hcmup.edu.vn/index.php?option=com_content&view=article&id=4106%3Avit-hoa-trong-vn-bn-hanh-chinh&catid=2345%3Atham-kho&Itemid=4103&lang=vi&site=134

	var eraValues$E = {
	  narrow: ['TCN', 'SCN'],
	  abbreviated: ['tr?????c CN', 'sau CN'],
	  wide: ['tr?????c C??ng Nguy??n', 'sau C??ng Nguy??n']
	};
	var quarterValues$E = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
	  wide: ['Qu?? 1', 'Qu?? 2', 'Qu?? 3', 'Qu?? 4']
	};
	var formattingQuarterValues$3 = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
	  // I notice many news outlet use this "qu?? II/2018"
	  wide: ['qu?? I', 'qu?? II', 'qu?? III', 'qu?? IV'] // Note: in English, the names of days of the week and months are capitalized.
	  // If you are making a new locale based on this one, check if the same is true for the language you're working on.
	  // Generally, formatted dates should look like they are in the middle of a sentence,
	  // e.g. in Spanish language the weekdays and months should be in the lowercase.

	};
	var monthValues$E = {
	  narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
	  abbreviated: ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'],
	  wide: ['Th??ng M???t', 'Th??ng Hai', 'Th??ng Ba', 'Th??ng T??', 'Th??ng N??m', 'Th??ng S??u', 'Th??ng B???y', 'Th??ng T??m', 'Th??ng Ch??n', 'Th??ng M?????i', 'Th??ng M?????i M???t', 'Th??ng M?????i Hai'] // In Vietnamese date formatting, month number less than 10 expected to have leading zero

	};
	var formattingMonthValues$9 = {
	  narrow: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
	  abbreviated: ['thg 1', 'thg 2', 'thg 3', 'thg 4', 'thg 5', 'thg 6', 'thg 7', 'thg 8', 'thg 9', 'thg 10', 'thg 11', 'thg 12'],
	  wide: ['th??ng 01', 'th??ng 02', 'th??ng 03', 'th??ng 04', 'th??ng 05', 'th??ng 06', 'th??ng 07', 'th??ng 08', 'th??ng 09', 'th??ng 10', 'th??ng 11', 'th??ng 12']
	};
	var dayValues$E = {
	  narrow: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
	  short: ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'],
	  abbreviated: ['CN', 'Th??? 2', 'Th??? 3', 'Th??? 4', 'Th??? 5', 'Th??? 6', 'Th??? 7'],
	  wide: ['Ch??? Nh???t', 'Th??? Hai', 'Th??? Ba', 'Th??? T??', 'Th??? N??m', 'Th??? S??u', 'Th??? B???y'] // Vietnamese are used to AM/PM borrowing from English, hence `narrow` and
	  // `abbreviated` are just like English but I'm leaving the `wide`
	  // format being localized with abbreviations found in some systems (S??ng / CHi???u);
	  // however, personally, I don't think `Chi???u` sounds appropriate for `PM`

	};
	var dayPeriodValues$E = {
	  // narrow date period is extremely rare in Vietnamese
	  // I used abbreviated form for noon, morning and afternoon
	  // which are regconizable by Vietnamese, others cannot be any shorter
	  narrow: {
	    am: 'am',
	    pm: 'pm',
	    midnight: 'n???a ????m',
	    noon: 'tr',
	    morning: 'sg',
	    afternoon: 'ch',
	    evening: 't???i',
	    night: '????m'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'n???a ????m',
	    noon: 'tr??a',
	    morning: 's??ng',
	    afternoon: 'chi???u',
	    evening: 't???i',
	    night: '????m'
	  },
	  wide: {
	    am: 'SA',
	    pm: 'CH',
	    midnight: 'n???a ????m',
	    noon: 'tr??a',
	    morning: 's??ng',
	    afternoon: 'chi???u',
	    evening: 't???i',
	    night: '????m'
	  }
	};
	var formattingDayPeriodValues$v = {
	  narrow: {
	    am: 'am',
	    pm: 'pm',
	    midnight: 'n???a ????m',
	    noon: 'tr',
	    morning: 'sg',
	    afternoon: 'ch',
	    evening: 't???i',
	    night: '????m'
	  },
	  abbreviated: {
	    am: 'AM',
	    pm: 'PM',
	    midnight: 'n???a ????m',
	    noon: 'tr??a',
	    morning: 's??ng',
	    afternoon: 'chi???u',
	    evening: 't???i',
	    night: '????m'
	  },
	  wide: {
	    am: 'SA',
	    pm: 'CH',
	    midnight: 'n???a ????m',
	    noon: 'gi???a tr??a',
	    morning: 'v??o bu???i s??ng',
	    afternoon: 'v??o bu???i chi???u',
	    evening: 'v??o bu???i t???i',
	    night: 'v??o ban ????m' // If ordinal numbers depend on context, for example,
	    // if they are different for different grammatical genders,
	    // use `options.unit`:
	    //
	    //   var options = dirtyOptions || {}
	    //   var unit = String(options.unit)
	    //
	    // where `unit` can be 'month', 'quarter', 'week', 'isoWeek', 'dayOfYear',
	    // 'dayOfMonth' or 'dayOfWeek'

	  }
	};

	function ordinalNumber$E(dirtyNumber, dirtyOptions) {
	  var options = dirtyOptions || {};
	  var unit = String(options.unit);
	  var number = parseInt(dirtyNumber, 10);

	  if (unit === 'quarter') {
	    // many news outlets use "qu?? I"...
	    switch (number) {
	      case 1:
	        return 'I';

	      case 2:
	        return 'II';

	      case 3:
	        return 'III';

	      case 4:
	        return 'IV';
	    }
	  } else if (unit === 'day') {
	    // day of week in Vietnamese has ordinal number meaning,
	    // so we should use them, else it'll sound weird
	    switch (number) {
	      case 1:
	        return 'th??? 2';
	      // meaning 2nd day but it's the first day of the week :D

	      case 2:
	        return 'th??? 3';
	      // meaning 3rd day

	      case 3:
	        return 'th??? 4';
	      // meaning 4th day and so on

	      case 4:
	        return 'th??? 5';

	      case 5:
	        return 'th??? 6';

	      case 6:
	        return 'th??? 7';

	      case 7:
	        return 'ch??? nh???t';
	      // meaning Sunday, there's no 8th day :D
	    }
	  } else if (unit === 'week') {
	    if (number === 1) {
	      return 'th??? nh???t';
	    } else {
	      return 'th??? ' + number;
	    }
	  } else if (unit === 'dayOfYear') {
	    if (number === 1) {
	      return '?????u ti??n';
	    } else {
	      return 'th??? ' + number;
	    }
	  } // there are no different forms of ordinal numbers in Vietnamese


	  return number;
	}

	var localize$E = {
	  ordinalNumber: ordinalNumber$E,
	  era: buildLocalizeFn({
	    values: eraValues$E,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$E,
	    defaultWidth: 'wide',
	    formattingValues: formattingQuarterValues$3,
	    defaultFormattingWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$E,
	    defaultWidth: 'wide',
	    formattingValues: formattingMonthValues$9,
	    defaultFormattingWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$E,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$E,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$v,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$E = /^(\d+)/i;
	var parseOrdinalNumberPattern$E = /\d+/i;
	var matchEraPatterns$E = {
	  narrow: /^(tcn|scn)/i,
	  abbreviated: /^(tr?????c CN|sau CN)/i,
	  wide: /^(tr?????c C??ng Nguy??n|sau C??ng Nguy??n)/i
	};
	var parseEraPatterns$E = {
	  any: [/^t/i, /^s/i]
	};
	var matchQuarterPatterns$E = {
	  narrow: /^([1234]|i{1,3}v?)/i,
	  abbreviated: /^q([1234]|i{1,3}v?)/i,
	  wide: /^qu?? ([1234]|i{1,3}v?)/i
	};
	var parseQuarterPatterns$E = {
	  any: [/(1|i)$/i, /(2|ii)$/i, /(3|iii)$/i, /(4|iv)$/i]
	};
	var matchMonthPatterns$E = {
	  // month number may contain leading 0, 'thg' prefix may have space, underscore or empty before number
	  // note the order of '1' since it is a sub-string of '10', so must be lower priority
	  narrow: /^(0?2|0?3|0?4|0?5|0?6|0?7|0?8|0?9|10|11|12|0?1)/i,
	  // note the order of 'thg 1' since it is sub-string of 'thg 10', so must be lower priority
	  short: /^(thg[ _]?0?2|thg[ _]?0?3|thg[ _]?0?4|thg[ _]?0?5|thg[ _]?0?6|thg[ _]?0?7|thg[ _]?0?8|thg[ _]?0?9|thg[ _]?10|thg[ _]?11|thg[ _]?12|thg[ _]?0?1)/i,
	  // note the order of 'th??ng 1' since it is sub-string of 'th??ng 10', so must be lower priority
	  abbreviated: /^(th??ng[ _]?0?2|th??ng[ _]?0?3|th??ng[ _]?0?4|th??ng[ _]?0?5|th??ng[ _]?0?6|th??ng[ _]?0?7|th??ng[ _]?0?8|th??ng[ _]?0?9|th??ng[ _]?10|th??ng[ _]?11|th??ng[ _]?12|th??ng[ _]?0?1)/i,
	  // note the order of 'M?????i' since it is sub-string of M?????i M???t, so must be lower priority
	  wide: /^(th??ng ?M???t|th??ng ?Hai|th??ng ?Ba|th??ng ?T??|th??ng ?N??m|th??ng ?S??u|th??ng ?B???y|th??ng ?T??m|th??ng ?Ch??n|th??ng ?M?????i ?M???t|th??ng ?M?????i ?Hai|th??ng ?M?????i)/i
	};
	var parseMonthPatterns$E = {
	  narrow: [/0?1$/i, /0?2/i, /3/, /4/, /5/, /6/, /7/, /8/, /9/, /10/, /11/, /12/],
	  short: [/thg[ _]?0?1$/i, /thg[ _]?0?2/i, /3/, /4/, /5/, /6/, /7/, /8/, /9/, /10/, /11/, /12/],
	  abbreviated: [/th??ng[ _]?0?1$/i, /th??ng[ _]?0?2/i, /3/, /4/, /5/, /6/, /7/, /8/, /9/, /10/, /11/, /12/],
	  wide: [/th??ng ?M???t$/i, /th??ng ?Hai$/i, /Ba/i, /T??/i, /N??m/i, /S??u/i, /B???y/i, /T??m/i, /Ch??n/i, /M?????i$/i, /M?????i ?M???t$/i, /M?????i ?Hai$/i]
	};
	var matchDayPatterns$E = {
	  narrow: /^(CN|T2|T3|T4|T5|T6|T7)/i,
	  short: /^(CN|Th ?2|Th ?3|Th ?4|Th ?5|Th ?6|Th ?7)/i,
	  abbreviated: /^(CN|Th ?2|Th ?3|Th ?4|Th ?5|Th ?6|Th ?7)/i,
	  wide: /^(Ch??? ?Nh???t|Ch??a ?Nh???t|th??? ?Hai|th??? ?Ba|th??? ?T??|th??? ?N??m|th??? ?S??u|th??? ?B???y)/i
	};
	var parseDayPatterns$E = {
	  narrow: [/CN/i, /2/i, /3/i, /4/i, /5/i, /6/i, /7/i],
	  short: [/CN/i, /2/i, /3/i, /4/i, /5/i, /6/i, /7/i],
	  abbreviated: [/CN/i, /2/i, /3/i, /4/i, /5/i, /6/i, /7/i],
	  wide: [/(Ch???|Ch??a) ?Nh???t/i, /Hai/i, /Ba/i, /T??/i, /N??m/i, /S??u/i, /B???y/i]
	};
	var matchDayPeriodPatterns$E = {
	  narrow: /^(a|p|n???a ????m|tr??a|(gi???) (s??ng|chi???u|t???i|????m))/i,
	  abbreviated: /^(am|pm|n???a ????m|tr??a|(gi???) (s??ng|chi???u|t???i|????m))/i,
	  wide: /^(ch[^i]*|sa|n???a ????m|tr??a|(gi???) (s??ng|chi???u|t???i|????m))/i
	};
	var parseDayPeriodPatterns$E = {
	  any: {
	    am: /^(a|sa)/i,
	    pm: /^(p|ch[^i]*)/i,
	    midnight: /n???a ????m/i,
	    noon: /tr??a/i,
	    morning: /s??ng/i,
	    afternoon: /chi???u/i,
	    evening: /t???i/i,
	    night: /^????m/i
	  }
	};
	var match$E = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$E,
	    parsePattern: parseOrdinalNumberPattern$E,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$E,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$E,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$E,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$E,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$E,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$E,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$E,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$E,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$E,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$E,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Vietnamese locale (Vietnam).
	 * @language Vietnamese
	 * @iso-639-2 vie
	 * @author Thanh Tran [@trongthanh]{@link https://github.com/trongthanh}
	 * @author Leroy Hopson [@lihop]{@link https://github.com/lihop}
	 */

	var locale$G = {
	  formatDistance: formatDistance$G,
	  formatLong: formatLong$G,
	  formatRelative: formatRelative$F,
	  localize: localize$E,
	  match: match$E,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 1
	    /* First week of new year contains Jan 1st  */

	  }
	};

	var formatDistanceLocale$F = {
	  lessThanXSeconds: {
	    one: '?????? 1 ???',
	    other: '?????? {{count}} ???'
	  },
	  xSeconds: {
	    one: '1 ???',
	    other: '{{count}} ???'
	  },
	  halfAMinute: '?????????',
	  lessThanXMinutes: {
	    one: '?????? 1 ??????',
	    other: '?????? {{count}} ??????'
	  },
	  xMinutes: {
	    one: '1 ??????',
	    other: '{{count}} ??????'
	  },
	  xHours: {
	    one: '1 ??????',
	    other: '{{count}} ??????'
	  },
	  aboutXHours: {
	    one: '?????? 1 ??????',
	    other: '?????? {{count}} ??????'
	  },
	  xDays: {
	    one: '1 ???',
	    other: '{{count}} ???'
	  },
	  aboutXMonths: {
	    one: '?????? 1 ??????',
	    other: '?????? {{count}} ??????'
	  },
	  xMonths: {
	    one: '1 ??????',
	    other: '{{count}} ??????'
	  },
	  aboutXYears: {
	    one: '?????? 1 ???',
	    other: '?????? {{count}} ???'
	  },
	  xYears: {
	    one: '1 ???',
	    other: '{{count}} ???'
	  },
	  overXYears: {
	    one: '?????? 1 ???',
	    other: '?????? {{count}} ???'
	  },
	  almostXYears: {
	    one: '?????? 1 ???',
	    other: '?????? {{count}} ???'
	  }
	};
	function formatDistance$H(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$F[token] === 'string') {
	    result = formatDistanceLocale$F[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$F[token].one;
	  } else {
	    result = formatDistanceLocale$F[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return result + '???';
	    } else {
	      return result + '???';
	    }
	  }

	  return result;
	}

	var dateFormats$H = {
	  full: "y'???'M'???'d'???' EEEE",
	  long: "y'???'M'???'d'???'",
	  medium: 'yyyy-MM-dd',
	  short: 'yy-MM-dd'
	};
	var timeFormats$H = {
	  full: 'zzzz a h:mm:ss',
	  long: 'z a h:mm:ss',
	  medium: 'a h:mm:ss',
	  short: 'a h:mm'
	};
	var dateTimeFormats$H = {
	  full: '{{date}} {{time}}',
	  long: '{{date}} {{time}}',
	  medium: '{{date}} {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$H = {
	  date: buildFormatLongFn({
	    formats: dateFormats$H,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$H,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$H,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$F = {
	  lastWeek: "'??????' eeee p",
	  yesterday: "'??????' p",
	  today: "'??????' p",
	  tomorrow: "'??????' p",
	  nextWeek: "'??????' eeee p",
	  other: 'P'
	};
	function formatRelative$G(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$F[token];
	}

	var eraValues$F = {
	  narrow: ['???', '??????'],
	  abbreviated: ['???', '??????'],
	  wide: ['?????????', '??????']
	};
	var quarterValues$F = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['?????????', '?????????', '?????????', '?????????'],
	  wide: ['????????????', '????????????', '????????????', '????????????']
	};
	var monthValues$F = {
	  narrow: ['???', '???', '???', '???', '???', '???', '???', '???', '???', '???', '??????', '??????'],
	  abbreviated: ['1???', '2???', '3???', '4???', '5???', '6???', '7???', '8???', '9???', '10???', '11???', '12???'],
	  wide: ['??????', '??????', '??????', '??????', '??????', '??????', '??????', '??????', '??????', '??????', '?????????', '?????????']
	};
	var dayValues$F = {
	  narrow: ['???', '???', '???', '???', '???', '???', '???'],
	  short: ['???', '???', '???', '???', '???', '???', '???'],
	  abbreviated: ['??????', '??????', '??????', '??????', '??????', '??????', '??????'],
	  wide: ['?????????', '?????????', '?????????', '?????????', '?????????', '?????????', '?????????']
	};
	var dayPeriodValues$F = {
	  narrow: {
	    am: '???',
	    pm: '???',
	    midnight: '??????',
	    noon: '???',
	    morning: '???',
	    afternoon: '??????',
	    evening: '???',
	    night: '???'
	  },
	  abbreviated: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '??????',
	    evening: '??????',
	    night: '??????'
	  },
	  wide: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '??????',
	    evening: '??????',
	    night: '??????'
	  }
	};
	var formattingDayPeriodValues$w = {
	  narrow: {
	    am: '???',
	    pm: '???',
	    midnight: '??????',
	    noon: '???',
	    morning: '???',
	    afternoon: '??????',
	    evening: '???',
	    night: '???'
	  },
	  abbreviated: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '??????',
	    evening: '??????',
	    night: '??????'
	  },
	  wide: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '??????',
	    evening: '??????',
	    night: '??????'
	  }
	};

	function ordinalNumber$F(dirtyNumber, dirtyOptions) {
	  // If ordinal numbers depend on context, for example,
	  // if they are different for different grammatical genders,
	  // use `options.unit`:
	  //
	  //   var options = dirtyOptions || {}
	  //   var unit = String(options.unit)
	  //
	  // where `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
	  // 'day', 'hour', 'minute', 'second'
	  var number = Number(dirtyNumber);
	  var options = dirtyOptions || {};
	  var unit = String(options.unit);

	  if (unit === 'date' || unit === 'hour' || unit === 'minute' || unit === 'second') {
	    return number.toString();
	  }

	  return '??? ' + number.toString();
	}

	var localize$F = {
	  ordinalNumber: ordinalNumber$F,
	  era: buildLocalizeFn({
	    values: eraValues$F,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$F,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$F,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$F,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$F,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$w,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$F = /^(???\s*)?\d+/i;
	var parseOrdinalNumberPattern$F = /\d+/i;
	var matchEraPatterns$F = {
	  narrow: /^(???)/i,
	  abbreviated: /^(???)/i,
	  wide: /^(?????????|??????)/i
	};
	var parseEraPatterns$F = {
	  any: [/^(???)/i, /^(??????)/i]
	};
	var matchQuarterPatterns$F = {
	  narrow: /^[1234]/i,
	  abbreviated: /^???[????????????]???/i,
	  wide: /^???[????????????]??????/i
	};
	var parseQuarterPatterns$F = {
	  any: [/(1|???)/i, /(2|???)/i, /(3|???)/i, /(4|???)/i]
	};
	var matchMonthPatterns$F = {
	  narrow: /^(???|???|???|???|???|???|???|???|???|???[??????])/i,
	  abbreviated: /^(???|???|???|???|???|???|???|???|???|???[??????]|\d|1[12])???/i,
	  wide: /^(???|???|???|???|???|???|???|???|???|???[??????])???/i
	};
	var parseMonthPatterns$F = {
	  narrow: [/^???/i, /^???/i, /^???/i, /^???/i, /^???/i, /^???/i, /^???/i, /^???/i, /^???/i, /^???(?!(???|???))/i, /^??????/i, /^??????/i],
	  any: [/^???|[!\d]1[!\d]/i, /^???|[!\d]2[!\d]/i, /^???|3/i, /^???|4/i, /^???|5/i, /^???|6/i, /^???|7/i, /^???|8/i, /^???|9/i, /^???(?!(???|???))|10/i, /^??????|11/i, /^??????|12/i]
	};
	var matchDayPatterns$F = {
	  narrow: /^[?????????????????????]/i,
	  short: /^[?????????????????????]/i,
	  abbreviated: /^???[?????????????????????]/i,
	  wide: /^??????[?????????????????????]/i
	};
	var parseDayPatterns$F = {
	  any: [/???/i, /???/i, /???/i, /???/i, /???/i, /???/i, /???/i]
	};
	var matchDayPeriodPatterns$F = {
	  any: /^(??????|??????|??????|[??????]???|??????|??????|???????|??????)/i
	};
	var parseDayPeriodPatterns$F = {
	  any: {
	    am: /^??????/i,
	    pm: /^??????/i,
	    midnight: /^??????/i,
	    noon: /^[??????]???/i,
	    morning: /^??????/i,
	    afternoon: /^??????/i,
	    evening: /^???/i,
	    night: /^??????/i
	  }
	};
	var match$F = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$F,
	    parsePattern: parseOrdinalNumberPattern$F,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$F,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$F,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$F,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$F,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$F,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$F,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$F,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$F,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$F,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$F,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Chinese Simplified locale.
	 * @language Chinese Simplified
	 * @iso-639-2 zho
	 * @author Changyu Geng [@KingMario]{@link https://github.com/KingMario}
	 * @author Song Shuoyun [@fnlctrl]{@link https://github.com/fnlctrl}
	 * @author sabrinaM [@sabrinamiao]{@link https://github.com/sabrinamiao}
	 * @author Carney Wu [@cubicwork]{@link https://github.com/cubicwork}
	 */

	var locale$H = {
	  formatDistance: formatDistance$H,
	  formatLong: formatLong$H,
	  formatRelative: formatRelative$G,
	  localize: localize$F,
	  match: match$F,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	var formatDistanceLocale$G = {
	  lessThanXSeconds: {
	    one: '?????? 1 ???',
	    other: '?????? {{count}} ???'
	  },
	  xSeconds: {
	    one: '1 ???',
	    other: '{{count}} ???'
	  },
	  halfAMinute: '?????????',
	  lessThanXMinutes: {
	    one: '?????? 1 ??????',
	    other: '?????? {{count}} ??????'
	  },
	  xMinutes: {
	    one: '1 ??????',
	    other: '{{count}} ??????'
	  },
	  xHours: {
	    one: '1 ??????',
	    other: '{{count}} ??????'
	  },
	  aboutXHours: {
	    one: '?????? 1 ??????',
	    other: '?????? {{count}} ??????'
	  },
	  xDays: {
	    one: '1 ???',
	    other: '{{count}} ???'
	  },
	  aboutXMonths: {
	    one: '?????? 1 ??????',
	    other: '?????? {{count}} ??????'
	  },
	  xMonths: {
	    one: '1 ??????',
	    other: '{{count}} ??????'
	  },
	  aboutXYears: {
	    one: '?????? 1 ???',
	    other: '?????? {{count}} ???'
	  },
	  xYears: {
	    one: '1 ???',
	    other: '{{count}} ???'
	  },
	  overXYears: {
	    one: '?????? 1 ???',
	    other: '?????? {{count}} ???'
	  },
	  almostXYears: {
	    one: '?????? 1 ???',
	    other: '?????? {{count}} ???'
	  }
	};
	function formatDistance$I(token, count, options) {
	  options = options || {};
	  var result;

	  if (typeof formatDistanceLocale$G[token] === 'string') {
	    result = formatDistanceLocale$G[token];
	  } else if (count === 1) {
	    result = formatDistanceLocale$G[token].one;
	  } else {
	    result = formatDistanceLocale$G[token].other.replace('{{count}}', count);
	  }

	  if (options.addSuffix) {
	    if (options.comparison > 0) {
	      return result + '???';
	    } else {
	      return result + '???';
	    }
	  }

	  return result;
	}

	var dateFormats$I = {
	  full: "y'???'M'???'d'???' EEEE",
	  long: "y'???'M'???'d'???'",
	  medium: 'yyyy-MM-dd',
	  short: 'yy-MM-dd'
	};
	var timeFormats$I = {
	  full: 'zzzz a h:mm:ss',
	  long: 'z a h:mm:ss',
	  medium: 'a h:mm:ss',
	  short: 'a h:mm'
	};
	var dateTimeFormats$I = {
	  full: '{{date}} {{time}}',
	  long: '{{date}} {{time}}',
	  medium: '{{date}} {{time}}',
	  short: '{{date}} {{time}}'
	};
	var formatLong$I = {
	  date: buildFormatLongFn({
	    formats: dateFormats$I,
	    defaultWidth: 'full'
	  }),
	  time: buildFormatLongFn({
	    formats: timeFormats$I,
	    defaultWidth: 'full'
	  }),
	  dateTime: buildFormatLongFn({
	    formats: dateTimeFormats$I,
	    defaultWidth: 'full'
	  })
	};

	var formatRelativeLocale$G = {
	  lastWeek: "'??????' eeee p",
	  yesterday: "'??????' p",
	  today: "'??????' p",
	  tomorrow: "'??????' p",
	  nextWeek: "'??????' eeee p",
	  other: 'P'
	};
	function formatRelative$H(token, _date, _baseDate, _options) {
	  return formatRelativeLocale$G[token];
	}

	var eraValues$G = {
	  narrow: ['???', '??????'],
	  abbreviated: ['???', '??????'],
	  wide: ['?????????', '??????']
	};
	var quarterValues$G = {
	  narrow: ['1', '2', '3', '4'],
	  abbreviated: ['?????????', '?????????', '?????????', '?????????'],
	  wide: ['????????????', '????????????', '????????????', '????????????']
	};
	var monthValues$G = {
	  narrow: ['???', '???', '???', '???', '???', '???', '???', '???', '???', '???', '??????', '??????'],
	  abbreviated: ['1???', '2???', '3???', '4???', '5???', '6???', '7???', '8???', '9???', '10???', '11???', '12???'],
	  wide: ['??????', '??????', '??????', '??????', '??????', '??????', '??????', '??????', '??????', '??????', '?????????', '?????????']
	};
	var dayValues$G = {
	  narrow: ['???', '???', '???', '???', '???', '???', '???'],
	  short: ['???', '???', '???', '???', '???', '???', '???'],
	  abbreviated: ['??????', '??????', '??????', '??????', '??????', '??????', '??????'],
	  wide: ['?????????', '?????????', '?????????', '?????????', '?????????', '?????????', '?????????']
	};
	var dayPeriodValues$G = {
	  narrow: {
	    am: '???',
	    pm: '???',
	    midnight: '??????',
	    noon: '???',
	    morning: '???',
	    afternoon: '??????',
	    evening: '???',
	    night: '???'
	  },
	  abbreviated: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '??????',
	    evening: '??????',
	    night: '??????'
	  },
	  wide: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '??????',
	    evening: '??????',
	    night: '??????'
	  }
	};
	var formattingDayPeriodValues$x = {
	  narrow: {
	    am: '???',
	    pm: '???',
	    midnight: '??????',
	    noon: '???',
	    morning: '???',
	    afternoon: '??????',
	    evening: '???',
	    night: '???'
	  },
	  abbreviated: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '??????',
	    evening: '??????',
	    night: '??????'
	  },
	  wide: {
	    am: '??????',
	    pm: '??????',
	    midnight: '??????',
	    noon: '??????',
	    morning: '??????',
	    afternoon: '??????',
	    evening: '??????',
	    night: '??????'
	  }
	};

	function ordinalNumber$G(dirtyNumber, _options) {
	  var number = Number(dirtyNumber);
	  return '??? ' + number.toString();
	}

	var localize$G = {
	  ordinalNumber: ordinalNumber$G,
	  era: buildLocalizeFn({
	    values: eraValues$G,
	    defaultWidth: 'wide'
	  }),
	  quarter: buildLocalizeFn({
	    values: quarterValues$G,
	    defaultWidth: 'wide',
	    argumentCallback: function (quarter) {
	      return Number(quarter) - 1;
	    }
	  }),
	  month: buildLocalizeFn({
	    values: monthValues$G,
	    defaultWidth: 'wide'
	  }),
	  day: buildLocalizeFn({
	    values: dayValues$G,
	    defaultWidth: 'wide'
	  }),
	  dayPeriod: buildLocalizeFn({
	    values: dayPeriodValues$G,
	    defaultWidth: 'wide',
	    formattingValues: formattingDayPeriodValues$x,
	    defaultFormattingWidth: 'wide'
	  })
	};

	var matchOrdinalNumberPattern$G = /^(???\s*)?\d+/i;
	var parseOrdinalNumberPattern$G = /\d+/i;
	var matchEraPatterns$G = {
	  narrow: /^(???)/i,
	  abbreviated: /^(???)/i,
	  wide: /^(?????????|??????)/i
	};
	var parseEraPatterns$G = {
	  any: [/^(???)/i, /^(??????)/i]
	};
	var matchQuarterPatterns$G = {
	  narrow: /^[1234]/i,
	  abbreviated: /^???[????????????]???/i,
	  wide: /^???[????????????]??????/i
	};
	var parseQuarterPatterns$G = {
	  any: [/(1|???)/i, /(2|???)/i, /(3|???)/i, /(4|???)/i]
	};
	var matchMonthPatterns$G = {
	  narrow: /^(???|???|???|???|???|???|???|???|???|???[??????])/i,
	  abbreviated: /^(???|???|???|???|???|???|???|???|???|???[??????]|\d|1[12])???/i,
	  wide: /^(???|???|???|???|???|???|???|???|???|???[??????])???/i
	};
	var parseMonthPatterns$G = {
	  narrow: [/^???/i, /^???/i, /^???/i, /^???/i, /^???/i, /^???/i, /^???/i, /^???/i, /^???/i, /^???(?!(???|???))/i, /^??????/i, /^??????/i],
	  any: [/^???|[!\d]1[!\d]/i, /^???|[!\d]2[!\d]/i, /^???|3/i, /^???|4/i, /^???|5/i, /^???|6/i, /^???|7/i, /^???|8/i, /^???|9/i, /^???(?!(???|???))|10/i, /^??????|11/i, /^??????|12/i]
	};
	var matchDayPatterns$G = {
	  narrow: /^[?????????????????????]/i,
	  short: /^[?????????????????????]/i,
	  abbreviated: /^???[?????????????????????]/i,
	  wide: /^??????[?????????????????????]/i
	};
	var parseDayPatterns$G = {
	  any: [/???/i, /???/i, /???/i, /???/i, /???/i, /???/i, /???/i]
	};
	var matchDayPeriodPatterns$G = {
	  any: /^(??????|??????|??????|[??????]???|??????|??????|???????|??????)/i
	};
	var parseDayPeriodPatterns$G = {
	  any: {
	    am: /^??????/i,
	    pm: /^??????/i,
	    midnight: /^??????/i,
	    noon: /^[??????]???/i,
	    morning: /^??????/i,
	    afternoon: /^??????/i,
	    evening: /^???/i,
	    night: /^??????/i
	  }
	};
	var match$G = {
	  ordinalNumber: buildMatchPatternFn({
	    matchPattern: matchOrdinalNumberPattern$G,
	    parsePattern: parseOrdinalNumberPattern$G,
	    valueCallback: function (value) {
	      return parseInt(value, 10);
	    }
	  }),
	  era: buildMatchFn({
	    matchPatterns: matchEraPatterns$G,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseEraPatterns$G,
	    defaultParseWidth: 'any'
	  }),
	  quarter: buildMatchFn({
	    matchPatterns: matchQuarterPatterns$G,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseQuarterPatterns$G,
	    defaultParseWidth: 'any',
	    valueCallback: function (index) {
	      return index + 1;
	    }
	  }),
	  month: buildMatchFn({
	    matchPatterns: matchMonthPatterns$G,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseMonthPatterns$G,
	    defaultParseWidth: 'any'
	  }),
	  day: buildMatchFn({
	    matchPatterns: matchDayPatterns$G,
	    defaultMatchWidth: 'wide',
	    parsePatterns: parseDayPatterns$G,
	    defaultParseWidth: 'any'
	  }),
	  dayPeriod: buildMatchFn({
	    matchPatterns: matchDayPeriodPatterns$G,
	    defaultMatchWidth: 'any',
	    parsePatterns: parseDayPeriodPatterns$G,
	    defaultParseWidth: 'any'
	  })
	};

	/**
	 * @type {Locale}
	 * @category Locales
	 * @summary Chinese Traditional locale.
	 * @language Chinese Traditional
	 * @iso-639-2 zho
	 * @author tonypai [@tpai]{@link https://github.com/tpai}
	 * @author Jack Hsu [@jackhsu978]{@link https://github.com/jackhsu978}
	 */

	var locale$I = {
	  formatDistance: formatDistance$I,
	  formatLong: formatLong$I,
	  formatRelative: formatRelative$H,
	  localize: localize$G,
	  match: match$G,
	  options: {
	    weekStartsOn: 1
	    /* Monday */
	    ,
	    firstWeekContainsDate: 4
	  }
	};

	// This file is generated automatically by `scripts/build/indices.js`. Please, don't change it.

	var locales = /*#__PURE__*/Object.freeze({
		af: locale$1,
		arDZ: locale$2,
		arSA: locale$3,
		be: locale$4,
		bn: locale$5,
		cs: locale$6,
		da: locale$7,
		de: locale$8,
		el: locale$9,
		enCA: locale$a,
		enGB: locale$b,
		enUS: locale,
		eo: locale$c,
		es: locale$d,
		et: locale$e,
		faIR: locale$f,
		fi: locale$g,
		fr: locale$h,
		gl: locale$i,
		he: locale$j,
		hu: locale$k,
		id: locale$l,
		is: locale$m,
		it: locale$n,
		ja: locale$o,
		ko: locale$p,
		lt: locale$q,
		lv: locale$r,
		nb: locale$s,
		nl: locale$t,
		nn: locale$u,
		pl: locale$v,
		pt: locale$w,
		ptBR: locale$x,
		ro: locale$y,
		ru: locale$z,
		sk: locale$A,
		sv: locale$B,
		th: locale$C,
		tr: locale$D,
		ug: locale$E,
		uk: locale$F,
		vi: locale$G,
		zhCN: locale$H,
		zhTW: locale$I
	});

	var DateFns = {
	  format: format,
	  parse: parse,
	  locales: locales
	};
	window['DateFns'] = DateFns;

	return DateFns;

}());
//# sourceMappingURL=date-fns-limited.js.map
