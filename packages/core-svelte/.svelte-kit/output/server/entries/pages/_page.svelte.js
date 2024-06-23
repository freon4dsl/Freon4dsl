import { c as create_ssr_component, e as escape, d as add_attribute, v as validate_component } from "../../chunks/ssr.js";
class FreLogger {
  static mute(t) {
    if (!this.mutedLogs.includes(t)) {
      this.mutedLogs.push(t);
    }
  }
  static unmute(t) {
    const index = this.mutedLogs.indexOf(t);
    if (index >= 0) {
      this.mutedLogs.splice(index, 1);
    }
  }
  static muteAllLogs() {
    FreLogger.muteAll = true;
  }
  static unmuteAllLogs() {
    FreLogger.muteAll = false;
    this.mutedLogs = [];
  }
  static showString(s) {
    FreLogger.filter = s;
  }
  get active() {
    return !FreLogger.mutedLogs.includes(this.category);
  }
  set active(value) {
    if (value) {
      FreLogger.unmute(this.category);
    } else {
      FreLogger.mute(this.category);
    }
  }
  constructor(cat) {
    this.category = cat;
  }
  info(msg) {
    if (!FreLogger.muteAll && this.active) {
      this.logToConsole(FreLogger.FG_BLUE, this.category + ": " + this.message(msg));
    }
  }
  log(msg, tagOrTags) {
    if (!FreLogger.muteAll && this.active) {
      this.logToConsole(FreLogger.FG_BLACK, this.category + ": " + this.message(msg));
    } else if (tagOrTags !== void 0 && tagOrTags !== null) {
      const tags = typeof tagOrTags === "string" ? [tagOrTags] : tagOrTags;
      for (const tag of tags) {
        if (!FreLogger.mutedLogs.includes(tag)) {
          this.logToConsole(FreLogger.FG_BLACK, this.category + "." + tag + ": " + this.message(msg));
          return;
        }
      }
    }
  }
  error(msg) {
    console.log(FreLogger.FG_RED, "ERROR: " + this.category + ": " + this.message(msg));
  }
  mute() {
    this.active = false;
    return this;
  }
  show() {
    this.active = true;
    return this;
  }
  message(msg) {
    return typeof msg === "string" ? msg : msg();
  }
  logToConsole(color, message) {
    if (FreLogger.filter === null) {
      console.log(color, message, FreLogger.FG_BLACK, "");
    } else {
      if (message.includes(FreLogger.filter)) {
        console.log(color, message, FreLogger.FG_BLACK, "");
      }
    }
  }
  colorMyText() {
    const text = "some text with some {special} formatting on this {keyword} and this {keyword}";
    const splitText = text.split(" ");
    const cssRules = [];
    let styledText = "";
    for (const split of splitText) {
      if (/^\{/.test(split)) {
        cssRules.push(FreLogger.FG_BLUE);
      } else {
        cssRules.push("color:inherit");
      }
      styledText += `%c${split} `;
    }
    console.log(styledText, ...cssRules);
  }
}
FreLogger.muteAll = false;
FreLogger.FG_RED = "\x1B[31m";
FreLogger.FG_BLACK = "\x1B[30m";
FreLogger.FG_BLUE = "\x1B[34m";
FreLogger.mutedLogs = [];
FreLogger.filter = null;
var niceErrors = {
  0: "Invalid value for configuration 'enforceActions', expected 'never', 'always' or 'observed'",
  1: function _(annotationType, key) {
    return "Cannot apply '" + annotationType + "' to '" + key.toString() + "': Field not found.";
  },
  /*
  2(prop) {
      return `invalid decorator for '${prop.toString()}'`
  },
  3(prop) {
      return `Cannot decorate '${prop.toString()}': action can only be used on properties with a function value.`
  },
  4(prop) {
      return `Cannot decorate '${prop.toString()}': computed can only be used on getter properties.`
  },
  */
  5: "'keys()' can only be used on observable objects, arrays, sets and maps",
  6: "'values()' can only be used on observable objects, arrays, sets and maps",
  7: "'entries()' can only be used on observable objects, arrays and maps",
  8: "'set()' can only be used on observable objects, arrays and maps",
  9: "'remove()' can only be used on observable objects, arrays and maps",
  10: "'has()' can only be used on observable objects, arrays and maps",
  11: "'get()' can only be used on observable objects, arrays and maps",
  12: "Invalid annotation",
  13: "Dynamic observable objects cannot be frozen. If you're passing observables to 3rd party component/function that calls Object.freeze, pass copy instead: toJS(observable)",
  14: "Intercept handlers should return nothing or a change object",
  15: "Observable arrays cannot be frozen. If you're passing observables to 3rd party component/function that calls Object.freeze, pass copy instead: toJS(observable)",
  16: "Modification exception: the internal structure of an observable array was changed.",
  17: function _2(index, length) {
    return "[mobx.array] Index out of bounds, " + index + " is larger than " + length;
  },
  18: "mobx.map requires Map polyfill for the current browser. Check babel-polyfill or core-js/es6/map.js",
  19: function _3(other) {
    return "Cannot initialize from classes that inherit from Map: " + other.constructor.name;
  },
  20: function _4(other) {
    return "Cannot initialize map from " + other;
  },
  21: function _5(dataStructure) {
    return "Cannot convert to map from '" + dataStructure + "'";
  },
  22: "mobx.set requires Set polyfill for the current browser. Check babel-polyfill or core-js/es6/set.js",
  23: "It is not possible to get index atoms from arrays",
  24: function _6(thing) {
    return "Cannot obtain administration from " + thing;
  },
  25: function _7(property, name) {
    return "the entry '" + property + "' does not exist in the observable map '" + name + "'";
  },
  26: "please specify a property",
  27: function _8(property, name) {
    return "no observable property '" + property.toString() + "' found on the observable object '" + name + "'";
  },
  28: function _9(thing) {
    return "Cannot obtain atom from " + thing;
  },
  29: "Expecting some object",
  30: "invalid action stack. did you forget to finish an action?",
  31: "missing option for computed: get",
  32: function _10(name, derivation) {
    return "Cycle detected in computation " + name + ": " + derivation;
  },
  33: function _11(name) {
    return "The setter of computed value '" + name + "' is trying to update itself. Did you intend to update an _observable_ value, instead of the computed property?";
  },
  34: function _12(name) {
    return "[ComputedValue '" + name + "'] It is not possible to assign a new value to a computed value.";
  },
  35: "There are multiple, different versions of MobX active. Make sure MobX is loaded only once or use `configure({ isolateGlobalState: true })`",
  36: "isolateGlobalState should be called before MobX is running any reactions",
  37: function _13(method) {
    return "[mobx] `observableArray." + method + "()` mutates the array in-place, which is not allowed inside a derivation. Use `array.slice()." + method + "()` instead";
  },
  38: "'ownKeys()' can only be used on observable objects",
  39: "'defineProperty()' can only be used on observable objects"
};
var errors = process.env.NODE_ENV !== "production" ? niceErrors : {};
function die(error) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }
  if (process.env.NODE_ENV !== "production") {
    var e = typeof error === "string" ? error : errors[error];
    if (typeof e === "function") e = e.apply(null, args);
    throw new Error("[MobX] " + e);
  }
  throw new Error(typeof error === "number" ? "[MobX] minified error nr: " + error + (args.length ? " " + args.map(String).join(",") : "") + ". Find the full error at: https://github.com/mobxjs/mobx/blob/main/packages/mobx/src/errors.ts" : "[MobX] " + error);
}
var mockGlobal = {};
function getGlobal() {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  return mockGlobal;
}
var assign = Object.assign;
var getDescriptor = Object.getOwnPropertyDescriptor;
var defineProperty = Object.defineProperty;
var objectPrototype = Object.prototype;
var EMPTY_ARRAY = [];
Object.freeze(EMPTY_ARRAY);
var EMPTY_OBJECT = {};
Object.freeze(EMPTY_OBJECT);
var hasProxy = typeof Proxy !== "undefined";
var plainObjectString = /* @__PURE__ */ Object.toString();
function assertProxies() {
  if (!hasProxy) {
    die(process.env.NODE_ENV !== "production" ? "`Proxy` objects are not available in the current environment. Please configure MobX to enable a fallback implementation.`" : "Proxy not available");
  }
}
function warnAboutProxyRequirement(msg) {
  if (process.env.NODE_ENV !== "production" && globalState.verifyProxies) {
    die("MobX is currently configured to be able to run in ES5 mode, but in ES5 MobX won't be able to " + msg);
  }
}
function getNextId() {
  return ++globalState.mobxGuid;
}
function once$1(func) {
  var invoked = false;
  return function() {
    if (invoked) {
      return;
    }
    invoked = true;
    return func.apply(this, arguments);
  };
}
var noop$1 = function noop() {
};
function isFunction(fn) {
  return typeof fn === "function";
}
function isStringish(value) {
  var t = typeof value;
  switch (t) {
    case "string":
    case "symbol":
    case "number":
      return true;
  }
  return false;
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
function isPlainObject(value) {
  if (!isObject(value)) {
    return false;
  }
  var proto = Object.getPrototypeOf(value);
  if (proto == null) {
    return true;
  }
  var protoConstructor = Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return typeof protoConstructor === "function" && protoConstructor.toString() === plainObjectString;
}
function isGenerator(obj) {
  var constructor = obj == null ? void 0 : obj.constructor;
  if (!constructor) {
    return false;
  }
  if ("GeneratorFunction" === constructor.name || "GeneratorFunction" === constructor.displayName) {
    return true;
  }
  return false;
}
function addHiddenProp(object2, propName, value) {
  defineProperty(object2, propName, {
    enumerable: false,
    writable: true,
    configurable: true,
    value
  });
}
function addHiddenFinalProp(object2, propName, value) {
  defineProperty(object2, propName, {
    enumerable: false,
    writable: false,
    configurable: true,
    value
  });
}
function createInstanceofPredicate(name, theClass) {
  var propName = "isMobX" + name;
  theClass.prototype[propName] = true;
  return function(x) {
    return isObject(x) && x[propName] === true;
  };
}
function isES6Map(thing) {
  return thing instanceof Map;
}
function isES6Set(thing) {
  return thing instanceof Set;
}
var hasGetOwnPropertySymbols = typeof Object.getOwnPropertySymbols !== "undefined";
function getPlainObjectKeys(object2) {
  var keys = Object.keys(object2);
  if (!hasGetOwnPropertySymbols) {
    return keys;
  }
  var symbols = Object.getOwnPropertySymbols(object2);
  if (!symbols.length) {
    return keys;
  }
  return [].concat(keys, symbols.filter(function(s) {
    return objectPrototype.propertyIsEnumerable.call(object2, s);
  }));
}
var ownKeys = typeof Reflect !== "undefined" && Reflect.ownKeys ? Reflect.ownKeys : hasGetOwnPropertySymbols ? function(obj) {
  return Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj));
} : (
  /* istanbul ignore next */
  Object.getOwnPropertyNames
);
function stringifyKey(key) {
  if (typeof key === "string") {
    return key;
  }
  if (typeof key === "symbol") {
    return key.toString();
  }
  return new String(key).toString();
}
function toPrimitive(value) {
  return value === null ? null : typeof value === "object" ? "" + value : value;
}
function hasProp(target, prop) {
  return objectPrototype.hasOwnProperty.call(target, prop);
}
var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function getOwnPropertyDescriptors2(target) {
  var res = {};
  ownKeys(target).forEach(function(key) {
    res[key] = getDescriptor(target, key);
  });
  return res;
};
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  _setPrototypeOf(subClass, superClass);
}
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf(o, p);
}
function _assertThisInitialized(self2) {
  if (self2 === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self2;
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it) return (it = it.call(o)).next.bind(it);
  if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike) {
    if (it) o = it;
    var i = 0;
    return function() {
      if (i >= o.length) return {
        done: true
      };
      return {
        done: false,
        value: o[i++]
      };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint);
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}
var storedAnnotationsSymbol = /* @__PURE__ */ Symbol("mobx-stored-annotations");
function createDecoratorAnnotation(annotation) {
  function decorator(target, property) {
    if (is20223Decorator(property)) {
      return annotation.decorate_20223_(target, property);
    } else {
      storeAnnotation(target, property, annotation);
    }
  }
  return Object.assign(decorator, annotation);
}
function storeAnnotation(prototype, key, annotation) {
  if (!hasProp(prototype, storedAnnotationsSymbol)) {
    addHiddenProp(prototype, storedAnnotationsSymbol, _extends({}, prototype[storedAnnotationsSymbol]));
  }
  if (process.env.NODE_ENV !== "production" && isOverride(annotation) && !hasProp(prototype[storedAnnotationsSymbol], key)) {
    var fieldName = prototype.constructor.name + ".prototype." + key.toString();
    die("'" + fieldName + "' is decorated with 'override', but no such decorated member was found on prototype.");
  }
  assertNotDecorated(prototype, annotation, key);
  if (!isOverride(annotation)) {
    prototype[storedAnnotationsSymbol][key] = annotation;
  }
}
function assertNotDecorated(prototype, annotation, key) {
  if (process.env.NODE_ENV !== "production" && !isOverride(annotation) && hasProp(prototype[storedAnnotationsSymbol], key)) {
    var fieldName = prototype.constructor.name + ".prototype." + key.toString();
    var currentAnnotationType = prototype[storedAnnotationsSymbol][key].annotationType_;
    var requestedAnnotationType = annotation.annotationType_;
    die("Cannot apply '@" + requestedAnnotationType + "' to '" + fieldName + "':" + ("\nThe field is already decorated with '@" + currentAnnotationType + "'.") + "\nRe-decorating fields is not allowed.\nUse '@override' decorator for methods overridden by subclass.");
  }
}
function collectStoredAnnotations(target) {
  if (!hasProp(target, storedAnnotationsSymbol)) {
    addHiddenProp(target, storedAnnotationsSymbol, _extends({}, target[storedAnnotationsSymbol]));
  }
  return target[storedAnnotationsSymbol];
}
function is20223Decorator(context) {
  return typeof context == "object" && typeof context["kind"] == "string";
}
function assert20223DecoratorType(context, types) {
  if (process.env.NODE_ENV !== "production" && !types.includes(context.kind)) {
    die("The decorator applied to '" + String(context.name) + "' cannot be used on a " + context.kind + " element");
  }
}
var $mobx = /* @__PURE__ */ Symbol("mobx administration");
var Atom = /* @__PURE__ */ function() {
  function Atom2(name_) {
    if (name_ === void 0) {
      name_ = process.env.NODE_ENV !== "production" ? "Atom@" + getNextId() : "Atom";
    }
    this.name_ = void 0;
    this.isPendingUnobservation = false;
    this.isBeingObserved = false;
    this.observers_ = /* @__PURE__ */ new Set();
    this.diffValue_ = 0;
    this.lastAccessedBy_ = 0;
    this.lowestObserverState_ = IDerivationState_.NOT_TRACKING_;
    this.onBOL = void 0;
    this.onBUOL = void 0;
    this.name_ = name_;
  }
  var _proto = Atom2.prototype;
  _proto.onBO = function onBO() {
    if (this.onBOL) {
      this.onBOL.forEach(function(listener) {
        return listener();
      });
    }
  };
  _proto.onBUO = function onBUO() {
    if (this.onBUOL) {
      this.onBUOL.forEach(function(listener) {
        return listener();
      });
    }
  };
  _proto.reportObserved = function reportObserved$1() {
    return reportObserved(this);
  };
  _proto.reportChanged = function reportChanged() {
    startBatch();
    propagateChanged(this);
    endBatch();
  };
  _proto.toString = function toString2() {
    return this.name_;
  };
  return Atom2;
}();
var isAtom = /* @__PURE__ */ createInstanceofPredicate("Atom", Atom);
function createAtom(name, onBecomeObservedHandler, onBecomeUnobservedHandler) {
  if (onBecomeObservedHandler === void 0) {
    onBecomeObservedHandler = noop$1;
  }
  if (onBecomeUnobservedHandler === void 0) {
    onBecomeUnobservedHandler = noop$1;
  }
  var atom = new Atom(name);
  if (onBecomeObservedHandler !== noop$1) {
    onBecomeObserved(atom, onBecomeObservedHandler);
  }
  if (onBecomeUnobservedHandler !== noop$1) {
    onBecomeUnobserved(atom, onBecomeUnobservedHandler);
  }
  return atom;
}
function identityComparer(a, b) {
  return a === b;
}
function structuralComparer(a, b) {
  return deepEqual(a, b);
}
function shallowComparer(a, b) {
  return deepEqual(a, b, 1);
}
function defaultComparer(a, b) {
  if (Object.is) {
    return Object.is(a, b);
  }
  return a === b ? a !== 0 || 1 / a === 1 / b : a !== a && b !== b;
}
var comparer = {
  identity: identityComparer,
  structural: structuralComparer,
  "default": defaultComparer,
  shallow: shallowComparer
};
function deepEnhancer(v, _14, name) {
  if (isObservable(v)) {
    return v;
  }
  if (Array.isArray(v)) {
    return observable.array(v, {
      name
    });
  }
  if (isPlainObject(v)) {
    return observable.object(v, void 0, {
      name
    });
  }
  if (isES6Map(v)) {
    return observable.map(v, {
      name
    });
  }
  if (isES6Set(v)) {
    return observable.set(v, {
      name
    });
  }
  if (typeof v === "function" && !isAction(v) && !isFlow(v)) {
    if (isGenerator(v)) {
      return flow(v);
    } else {
      return autoAction(name, v);
    }
  }
  return v;
}
function shallowEnhancer(v, _14, name) {
  if (v === void 0 || v === null) {
    return v;
  }
  if (isObservableObject(v) || isObservableArray(v) || isObservableMap(v) || isObservableSet(v)) {
    return v;
  }
  if (Array.isArray(v)) {
    return observable.array(v, {
      name,
      deep: false
    });
  }
  if (isPlainObject(v)) {
    return observable.object(v, void 0, {
      name,
      deep: false
    });
  }
  if (isES6Map(v)) {
    return observable.map(v, {
      name,
      deep: false
    });
  }
  if (isES6Set(v)) {
    return observable.set(v, {
      name,
      deep: false
    });
  }
  if (process.env.NODE_ENV !== "production") {
    die("The shallow modifier / decorator can only used in combination with arrays, objects, maps and sets");
  }
}
function referenceEnhancer(newValue) {
  return newValue;
}
function refStructEnhancer(v, oldValue) {
  if (process.env.NODE_ENV !== "production" && isObservable(v)) {
    die("observable.struct should not be used with observable values");
  }
  if (deepEqual(v, oldValue)) {
    return oldValue;
  }
  return v;
}
var OVERRIDE = "override";
function isOverride(annotation) {
  return annotation.annotationType_ === OVERRIDE;
}
function createActionAnnotation(name, options) {
  return {
    annotationType_: name,
    options_: options,
    make_: make_$1,
    extend_: extend_$1,
    decorate_20223_: decorate_20223_$1
  };
}
function make_$1(adm, key, descriptor, source) {
  var _this$options_;
  if ((_this$options_ = this.options_) != null && _this$options_.bound) {
    return this.extend_(adm, key, descriptor, false) === null ? 0 : 1;
  }
  if (source === adm.target_) {
    return this.extend_(adm, key, descriptor, false) === null ? 0 : 2;
  }
  if (isAction(descriptor.value)) {
    return 1;
  }
  var actionDescriptor = createActionDescriptor(adm, this, key, descriptor, false);
  defineProperty(source, key, actionDescriptor);
  return 2;
}
function extend_$1(adm, key, descriptor, proxyTrap) {
  var actionDescriptor = createActionDescriptor(adm, this, key, descriptor);
  return adm.defineProperty_(key, actionDescriptor, proxyTrap);
}
function decorate_20223_$1(mthd, context) {
  if (process.env.NODE_ENV !== "production") {
    assert20223DecoratorType(context, ["method", "field"]);
  }
  var kind = context.kind, name = context.name, addInitializer = context.addInitializer;
  var ann = this;
  var _createAction = function _createAction2(m) {
    var _ann$options_$name, _ann$options_, _ann$options_$autoAct, _ann$options_2;
    return createAction((_ann$options_$name = (_ann$options_ = ann.options_) == null ? void 0 : _ann$options_.name) != null ? _ann$options_$name : name.toString(), m, (_ann$options_$autoAct = (_ann$options_2 = ann.options_) == null ? void 0 : _ann$options_2.autoAction) != null ? _ann$options_$autoAct : false);
  };
  if (kind == "field") {
    addInitializer(function() {
      storeAnnotation(this, name, ann);
    });
    return;
  }
  if (kind == "method") {
    var _this$options_2;
    if (!isAction(mthd)) {
      mthd = _createAction(mthd);
    }
    if ((_this$options_2 = this.options_) != null && _this$options_2.bound) {
      addInitializer(function() {
        var self2 = this;
        var bound = self2[name].bind(self2);
        bound.isMobxAction = true;
        self2[name] = bound;
      });
    }
    return mthd;
  }
  die("Cannot apply '" + ann.annotationType_ + "' to '" + String(name) + "' (kind: " + kind + "):" + ("\n'" + ann.annotationType_ + "' can only be used on properties with a function value."));
}
function assertActionDescriptor(adm, _ref, key, _ref2) {
  var annotationType_ = _ref.annotationType_;
  var value = _ref2.value;
  if (process.env.NODE_ENV !== "production" && !isFunction(value)) {
    die("Cannot apply '" + annotationType_ + "' to '" + adm.name_ + "." + key.toString() + "':" + ("\n'" + annotationType_ + "' can only be used on properties with a function value."));
  }
}
function createActionDescriptor(adm, annotation, key, descriptor, safeDescriptors) {
  var _annotation$options_, _annotation$options_$, _annotation$options_2, _annotation$options_$2, _annotation$options_3, _annotation$options_4, _adm$proxy_2;
  if (safeDescriptors === void 0) {
    safeDescriptors = globalState.safeDescriptors;
  }
  assertActionDescriptor(adm, annotation, key, descriptor);
  var value = descriptor.value;
  if ((_annotation$options_ = annotation.options_) != null && _annotation$options_.bound) {
    var _adm$proxy_;
    value = value.bind((_adm$proxy_ = adm.proxy_) != null ? _adm$proxy_ : adm.target_);
  }
  return {
    value: createAction(
      (_annotation$options_$ = (_annotation$options_2 = annotation.options_) == null ? void 0 : _annotation$options_2.name) != null ? _annotation$options_$ : key.toString(),
      value,
      (_annotation$options_$2 = (_annotation$options_3 = annotation.options_) == null ? void 0 : _annotation$options_3.autoAction) != null ? _annotation$options_$2 : false,
      // https://github.com/mobxjs/mobx/discussions/3140
      (_annotation$options_4 = annotation.options_) != null && _annotation$options_4.bound ? (_adm$proxy_2 = adm.proxy_) != null ? _adm$proxy_2 : adm.target_ : void 0
    ),
    // Non-configurable for classes
    // prevents accidental field redefinition in subclass
    configurable: safeDescriptors ? adm.isPlainObject_ : true,
    // https://github.com/mobxjs/mobx/pull/2641#issuecomment-737292058
    enumerable: false,
    // Non-obsevable, therefore non-writable
    // Also prevents rewriting in subclass constructor
    writable: safeDescriptors ? false : true
  };
}
function createFlowAnnotation(name, options) {
  return {
    annotationType_: name,
    options_: options,
    make_: make_$2,
    extend_: extend_$2,
    decorate_20223_: decorate_20223_$2
  };
}
function make_$2(adm, key, descriptor, source) {
  var _this$options_;
  if (source === adm.target_) {
    return this.extend_(adm, key, descriptor, false) === null ? 0 : 2;
  }
  if ((_this$options_ = this.options_) != null && _this$options_.bound && (!hasProp(adm.target_, key) || !isFlow(adm.target_[key]))) {
    if (this.extend_(adm, key, descriptor, false) === null) {
      return 0;
    }
  }
  if (isFlow(descriptor.value)) {
    return 1;
  }
  var flowDescriptor = createFlowDescriptor(adm, this, key, descriptor, false, false);
  defineProperty(source, key, flowDescriptor);
  return 2;
}
function extend_$2(adm, key, descriptor, proxyTrap) {
  var _this$options_2;
  var flowDescriptor = createFlowDescriptor(adm, this, key, descriptor, (_this$options_2 = this.options_) == null ? void 0 : _this$options_2.bound);
  return adm.defineProperty_(key, flowDescriptor, proxyTrap);
}
function decorate_20223_$2(mthd, context) {
  var _this$options_3;
  if (process.env.NODE_ENV !== "production") {
    assert20223DecoratorType(context, ["method"]);
  }
  var name = context.name, addInitializer = context.addInitializer;
  if (!isFlow(mthd)) {
    mthd = flow(mthd);
  }
  if ((_this$options_3 = this.options_) != null && _this$options_3.bound) {
    addInitializer(function() {
      var self2 = this;
      var bound = self2[name].bind(self2);
      bound.isMobXFlow = true;
      self2[name] = bound;
    });
  }
  return mthd;
}
function assertFlowDescriptor(adm, _ref, key, _ref2) {
  var annotationType_ = _ref.annotationType_;
  var value = _ref2.value;
  if (process.env.NODE_ENV !== "production" && !isFunction(value)) {
    die("Cannot apply '" + annotationType_ + "' to '" + adm.name_ + "." + key.toString() + "':" + ("\n'" + annotationType_ + "' can only be used on properties with a generator function value."));
  }
}
function createFlowDescriptor(adm, annotation, key, descriptor, bound, safeDescriptors) {
  if (safeDescriptors === void 0) {
    safeDescriptors = globalState.safeDescriptors;
  }
  assertFlowDescriptor(adm, annotation, key, descriptor);
  var value = descriptor.value;
  if (!isFlow(value)) {
    value = flow(value);
  }
  if (bound) {
    var _adm$proxy_;
    value = value.bind((_adm$proxy_ = adm.proxy_) != null ? _adm$proxy_ : adm.target_);
    value.isMobXFlow = true;
  }
  return {
    value,
    // Non-configurable for classes
    // prevents accidental field redefinition in subclass
    configurable: safeDescriptors ? adm.isPlainObject_ : true,
    // https://github.com/mobxjs/mobx/pull/2641#issuecomment-737292058
    enumerable: false,
    // Non-obsevable, therefore non-writable
    // Also prevents rewriting in subclass constructor
    writable: safeDescriptors ? false : true
  };
}
function createComputedAnnotation(name, options) {
  return {
    annotationType_: name,
    options_: options,
    make_: make_$3,
    extend_: extend_$3,
    decorate_20223_: decorate_20223_$3
  };
}
function make_$3(adm, key, descriptor) {
  return this.extend_(adm, key, descriptor, false) === null ? 0 : 1;
}
function extend_$3(adm, key, descriptor, proxyTrap) {
  assertComputedDescriptor(adm, this, key, descriptor);
  return adm.defineComputedProperty_(key, _extends({}, this.options_, {
    get: descriptor.get,
    set: descriptor.set
  }), proxyTrap);
}
function decorate_20223_$3(get3, context) {
  if (process.env.NODE_ENV !== "production") {
    assert20223DecoratorType(context, ["getter"]);
  }
  var ann = this;
  var key = context.name, addInitializer = context.addInitializer;
  addInitializer(function() {
    var adm = asObservableObject(this)[$mobx];
    var options = _extends({}, ann.options_, {
      get: get3,
      context: this
    });
    options.name || (options.name = process.env.NODE_ENV !== "production" ? adm.name_ + "." + key.toString() : "ObservableObject." + key.toString());
    adm.values_.set(key, new ComputedValue(options));
  });
  return function() {
    return this[$mobx].getObservablePropValue_(key);
  };
}
function assertComputedDescriptor(adm, _ref, key, _ref2) {
  var annotationType_ = _ref.annotationType_;
  var get3 = _ref2.get;
  if (process.env.NODE_ENV !== "production" && !get3) {
    die("Cannot apply '" + annotationType_ + "' to '" + adm.name_ + "." + key.toString() + "':" + ("\n'" + annotationType_ + "' can only be used on getter(+setter) properties."));
  }
}
function createObservableAnnotation(name, options) {
  return {
    annotationType_: name,
    options_: options,
    make_: make_$4,
    extend_: extend_$4,
    decorate_20223_: decorate_20223_$4
  };
}
function make_$4(adm, key, descriptor) {
  return this.extend_(adm, key, descriptor, false) === null ? 0 : 1;
}
function extend_$4(adm, key, descriptor, proxyTrap) {
  var _this$options_$enhanc, _this$options_;
  assertObservableDescriptor(adm, this, key, descriptor);
  return adm.defineObservableProperty_(key, descriptor.value, (_this$options_$enhanc = (_this$options_ = this.options_) == null ? void 0 : _this$options_.enhancer) != null ? _this$options_$enhanc : deepEnhancer, proxyTrap);
}
function decorate_20223_$4(desc, context) {
  if (process.env.NODE_ENV !== "production") {
    if (context.kind === "field") {
      throw die("Please use `@observable accessor " + String(context.name) + "` instead of `@observable " + String(context.name) + "`");
    }
    assert20223DecoratorType(context, ["accessor"]);
  }
  var ann = this;
  var kind = context.kind, name = context.name;
  var initializedObjects = /* @__PURE__ */ new WeakSet();
  function initializeObservable(target, value) {
    var _ann$options_$enhance, _ann$options_;
    var adm = asObservableObject(target)[$mobx];
    var observable2 = new ObservableValue(value, (_ann$options_$enhance = (_ann$options_ = ann.options_) == null ? void 0 : _ann$options_.enhancer) != null ? _ann$options_$enhance : deepEnhancer, process.env.NODE_ENV !== "production" ? adm.name_ + "." + name.toString() : "ObservableObject." + name.toString(), false);
    adm.values_.set(name, observable2);
    initializedObjects.add(target);
  }
  if (kind == "accessor") {
    return {
      get: function get3() {
        if (!initializedObjects.has(this)) {
          initializeObservable(this, desc.get.call(this));
        }
        return this[$mobx].getObservablePropValue_(name);
      },
      set: function set4(value) {
        if (!initializedObjects.has(this)) {
          initializeObservable(this, value);
        }
        return this[$mobx].setObservablePropValue_(name, value);
      },
      init: function init(value) {
        if (!initializedObjects.has(this)) {
          initializeObservable(this, value);
        }
        return value;
      }
    };
  }
  return;
}
function assertObservableDescriptor(adm, _ref, key, descriptor) {
  var annotationType_ = _ref.annotationType_;
  if (process.env.NODE_ENV !== "production" && !("value" in descriptor)) {
    die("Cannot apply '" + annotationType_ + "' to '" + adm.name_ + "." + key.toString() + "':" + ("\n'" + annotationType_ + "' cannot be used on getter/setter properties"));
  }
}
var AUTO = "true";
var autoAnnotation = /* @__PURE__ */ createAutoAnnotation();
function createAutoAnnotation(options) {
  return {
    annotationType_: AUTO,
    options_: options,
    make_: make_$5,
    extend_: extend_$5,
    decorate_20223_: decorate_20223_$5
  };
}
function make_$5(adm, key, descriptor, source) {
  var _this$options_3, _this$options_4;
  if (descriptor.get) {
    return computed.make_(adm, key, descriptor, source);
  }
  if (descriptor.set) {
    var set4 = createAction(key.toString(), descriptor.set);
    if (source === adm.target_) {
      return adm.defineProperty_(key, {
        configurable: globalState.safeDescriptors ? adm.isPlainObject_ : true,
        set: set4
      }) === null ? 0 : 2;
    }
    defineProperty(source, key, {
      configurable: true,
      set: set4
    });
    return 2;
  }
  if (source !== adm.target_ && typeof descriptor.value === "function") {
    var _this$options_2;
    if (isGenerator(descriptor.value)) {
      var _this$options_;
      var flowAnnotation2 = (_this$options_ = this.options_) != null && _this$options_.autoBind ? flow.bound : flow;
      return flowAnnotation2.make_(adm, key, descriptor, source);
    }
    var actionAnnotation2 = (_this$options_2 = this.options_) != null && _this$options_2.autoBind ? autoAction.bound : autoAction;
    return actionAnnotation2.make_(adm, key, descriptor, source);
  }
  var observableAnnotation2 = ((_this$options_3 = this.options_) == null ? void 0 : _this$options_3.deep) === false ? observable.ref : observable;
  if (typeof descriptor.value === "function" && (_this$options_4 = this.options_) != null && _this$options_4.autoBind) {
    var _adm$proxy_;
    descriptor.value = descriptor.value.bind((_adm$proxy_ = adm.proxy_) != null ? _adm$proxy_ : adm.target_);
  }
  return observableAnnotation2.make_(adm, key, descriptor, source);
}
function extend_$5(adm, key, descriptor, proxyTrap) {
  var _this$options_5, _this$options_6;
  if (descriptor.get) {
    return computed.extend_(adm, key, descriptor, proxyTrap);
  }
  if (descriptor.set) {
    return adm.defineProperty_(key, {
      configurable: globalState.safeDescriptors ? adm.isPlainObject_ : true,
      set: createAction(key.toString(), descriptor.set)
    }, proxyTrap);
  }
  if (typeof descriptor.value === "function" && (_this$options_5 = this.options_) != null && _this$options_5.autoBind) {
    var _adm$proxy_2;
    descriptor.value = descriptor.value.bind((_adm$proxy_2 = adm.proxy_) != null ? _adm$proxy_2 : adm.target_);
  }
  var observableAnnotation2 = ((_this$options_6 = this.options_) == null ? void 0 : _this$options_6.deep) === false ? observable.ref : observable;
  return observableAnnotation2.extend_(adm, key, descriptor, proxyTrap);
}
function decorate_20223_$5(desc, context) {
  die("'" + this.annotationType_ + "' cannot be used as a decorator");
}
var OBSERVABLE = "observable";
var OBSERVABLE_REF = "observable.ref";
var OBSERVABLE_SHALLOW = "observable.shallow";
var OBSERVABLE_STRUCT = "observable.struct";
var defaultCreateObservableOptions = {
  deep: true,
  name: void 0,
  defaultDecorator: void 0,
  proxy: true
};
Object.freeze(defaultCreateObservableOptions);
function asCreateObservableOptions(thing) {
  return thing || defaultCreateObservableOptions;
}
var observableAnnotation = /* @__PURE__ */ createObservableAnnotation(OBSERVABLE);
var observableRefAnnotation = /* @__PURE__ */ createObservableAnnotation(OBSERVABLE_REF, {
  enhancer: referenceEnhancer
});
var observableShallowAnnotation = /* @__PURE__ */ createObservableAnnotation(OBSERVABLE_SHALLOW, {
  enhancer: shallowEnhancer
});
var observableStructAnnotation = /* @__PURE__ */ createObservableAnnotation(OBSERVABLE_STRUCT, {
  enhancer: refStructEnhancer
});
var observableDecoratorAnnotation = /* @__PURE__ */ createDecoratorAnnotation(observableAnnotation);
function getEnhancerFromOptions(options) {
  return options.deep === true ? deepEnhancer : options.deep === false ? referenceEnhancer : getEnhancerFromAnnotation(options.defaultDecorator);
}
function getAnnotationFromOptions(options) {
  var _options$defaultDecor;
  return options ? (_options$defaultDecor = options.defaultDecorator) != null ? _options$defaultDecor : createAutoAnnotation(options) : void 0;
}
function getEnhancerFromAnnotation(annotation) {
  var _annotation$options_$, _annotation$options_;
  return !annotation ? deepEnhancer : (_annotation$options_$ = (_annotation$options_ = annotation.options_) == null ? void 0 : _annotation$options_.enhancer) != null ? _annotation$options_$ : deepEnhancer;
}
function createObservable(v, arg2, arg3) {
  if (is20223Decorator(arg2)) {
    return observableAnnotation.decorate_20223_(v, arg2);
  }
  if (isStringish(arg2)) {
    storeAnnotation(v, arg2, observableAnnotation);
    return;
  }
  if (isObservable(v)) {
    return v;
  }
  if (isPlainObject(v)) {
    return observable.object(v, arg2, arg3);
  }
  if (Array.isArray(v)) {
    return observable.array(v, arg2);
  }
  if (isES6Map(v)) {
    return observable.map(v, arg2);
  }
  if (isES6Set(v)) {
    return observable.set(v, arg2);
  }
  if (typeof v === "object" && v !== null) {
    return v;
  }
  return observable.box(v, arg2);
}
assign(createObservable, observableDecoratorAnnotation);
var observableFactories = {
  box: function box(value, options) {
    var o = asCreateObservableOptions(options);
    return new ObservableValue(value, getEnhancerFromOptions(o), o.name, true, o.equals);
  },
  array: function array(initialValues, options) {
    var o = asCreateObservableOptions(options);
    return (globalState.useProxies === false || o.proxy === false ? createLegacyArray : createObservableArray)(initialValues, getEnhancerFromOptions(o), o.name);
  },
  map: function map(initialValues, options) {
    var o = asCreateObservableOptions(options);
    return new ObservableMap(initialValues, getEnhancerFromOptions(o), o.name);
  },
  set: function set(initialValues, options) {
    var o = asCreateObservableOptions(options);
    return new ObservableSet(initialValues, getEnhancerFromOptions(o), o.name);
  },
  object: function object(props, decorators, options) {
    return initObservable(function() {
      return extendObservable(globalState.useProxies === false || (options == null ? void 0 : options.proxy) === false ? asObservableObject({}, options) : asDynamicObservableObject({}, options), props, decorators);
    });
  },
  ref: /* @__PURE__ */ createDecoratorAnnotation(observableRefAnnotation),
  shallow: /* @__PURE__ */ createDecoratorAnnotation(observableShallowAnnotation),
  deep: observableDecoratorAnnotation,
  struct: /* @__PURE__ */ createDecoratorAnnotation(observableStructAnnotation)
};
var observable = /* @__PURE__ */ assign(createObservable, observableFactories);
var COMPUTED = "computed";
var COMPUTED_STRUCT = "computed.struct";
var computedAnnotation = /* @__PURE__ */ createComputedAnnotation(COMPUTED);
var computedStructAnnotation = /* @__PURE__ */ createComputedAnnotation(COMPUTED_STRUCT, {
  equals: comparer.structural
});
var computed = function computed2(arg1, arg2) {
  if (is20223Decorator(arg2)) {
    return computedAnnotation.decorate_20223_(arg1, arg2);
  }
  if (isStringish(arg2)) {
    return storeAnnotation(arg1, arg2, computedAnnotation);
  }
  if (isPlainObject(arg1)) {
    return createDecoratorAnnotation(createComputedAnnotation(COMPUTED, arg1));
  }
  if (process.env.NODE_ENV !== "production") {
    if (!isFunction(arg1)) {
      die("First argument to `computed` should be an expression.");
    }
    if (isFunction(arg2)) {
      die("A setter as second argument is no longer supported, use `{ set: fn }` option instead");
    }
  }
  var opts = isPlainObject(arg2) ? arg2 : {};
  opts.get = arg1;
  opts.name || (opts.name = arg1.name || "");
  return new ComputedValue(opts);
};
Object.assign(computed, computedAnnotation);
computed.struct = /* @__PURE__ */ createDecoratorAnnotation(computedStructAnnotation);
var _getDescriptor$config, _getDescriptor;
var currentActionId = 0;
var nextActionId = 1;
var isFunctionNameConfigurable = (_getDescriptor$config = (_getDescriptor = /* @__PURE__ */ getDescriptor(function() {
}, "name")) == null ? void 0 : _getDescriptor.configurable) != null ? _getDescriptor$config : false;
var tmpNameDescriptor = {
  value: "action",
  configurable: true,
  writable: false,
  enumerable: false
};
function createAction(actionName, fn, autoAction2, ref) {
  if (autoAction2 === void 0) {
    autoAction2 = false;
  }
  if (process.env.NODE_ENV !== "production") {
    if (!isFunction(fn)) {
      die("`action` can only be invoked on functions");
    }
    if (typeof actionName !== "string" || !actionName) {
      die("actions should have valid names, got: '" + actionName + "'");
    }
  }
  function res() {
    return executeAction(actionName, autoAction2, fn, ref || this, arguments);
  }
  res.isMobxAction = true;
  res.toString = function() {
    return fn.toString();
  };
  if (isFunctionNameConfigurable) {
    tmpNameDescriptor.value = actionName;
    defineProperty(res, "name", tmpNameDescriptor);
  }
  return res;
}
function executeAction(actionName, canRunAsDerivation, fn, scope, args) {
  var runInfo = _startAction(actionName, canRunAsDerivation, scope, args);
  try {
    return fn.apply(scope, args);
  } catch (err) {
    runInfo.error_ = err;
    throw err;
  } finally {
    _endAction(runInfo);
  }
}
function _startAction(actionName, canRunAsDerivation, scope, args) {
  var notifySpy_ = process.env.NODE_ENV !== "production" && isSpyEnabled() && !!actionName;
  var startTime_ = 0;
  if (process.env.NODE_ENV !== "production" && notifySpy_) {
    startTime_ = Date.now();
    var flattenedArgs = args ? Array.from(args) : EMPTY_ARRAY;
    spyReportStart({
      type: ACTION,
      name: actionName,
      object: scope,
      arguments: flattenedArgs
    });
  }
  var prevDerivation_ = globalState.trackingDerivation;
  var runAsAction = !canRunAsDerivation || !prevDerivation_;
  startBatch();
  var prevAllowStateChanges_ = globalState.allowStateChanges;
  if (runAsAction) {
    untrackedStart();
    prevAllowStateChanges_ = allowStateChangesStart(true);
  }
  var prevAllowStateReads_ = allowStateReadsStart(true);
  var runInfo = {
    runAsAction_: runAsAction,
    prevDerivation_,
    prevAllowStateChanges_,
    prevAllowStateReads_,
    notifySpy_,
    startTime_,
    actionId_: nextActionId++,
    parentActionId_: currentActionId
  };
  currentActionId = runInfo.actionId_;
  return runInfo;
}
function _endAction(runInfo) {
  if (currentActionId !== runInfo.actionId_) {
    die(30);
  }
  currentActionId = runInfo.parentActionId_;
  if (runInfo.error_ !== void 0) {
    globalState.suppressReactionErrors = true;
  }
  allowStateChangesEnd(runInfo.prevAllowStateChanges_);
  allowStateReadsEnd(runInfo.prevAllowStateReads_);
  endBatch();
  if (runInfo.runAsAction_) {
    untrackedEnd(runInfo.prevDerivation_);
  }
  if (process.env.NODE_ENV !== "production" && runInfo.notifySpy_) {
    spyReportEnd({
      time: Date.now() - runInfo.startTime_
    });
  }
  globalState.suppressReactionErrors = false;
}
function allowStateChangesStart(allowStateChanges) {
  var prev = globalState.allowStateChanges;
  globalState.allowStateChanges = allowStateChanges;
  return prev;
}
function allowStateChangesEnd(prev) {
  globalState.allowStateChanges = prev;
}
var _Symbol$toPrimitive;
var CREATE = "create";
_Symbol$toPrimitive = Symbol.toPrimitive;
var ObservableValue = /* @__PURE__ */ function(_Atom) {
  _inheritsLoose(ObservableValue2, _Atom);
  function ObservableValue2(value, enhancer, name_, notifySpy, equals2) {
    var _this;
    if (name_ === void 0) {
      name_ = process.env.NODE_ENV !== "production" ? "ObservableValue@" + getNextId() : "ObservableValue";
    }
    if (notifySpy === void 0) {
      notifySpy = true;
    }
    if (equals2 === void 0) {
      equals2 = comparer["default"];
    }
    _this = _Atom.call(this, name_) || this;
    _this.enhancer = void 0;
    _this.name_ = void 0;
    _this.equals = void 0;
    _this.hasUnreportedChange_ = false;
    _this.interceptors_ = void 0;
    _this.changeListeners_ = void 0;
    _this.value_ = void 0;
    _this.dehancer = void 0;
    _this.enhancer = enhancer;
    _this.name_ = name_;
    _this.equals = equals2;
    _this.value_ = enhancer(value, void 0, name_);
    if (process.env.NODE_ENV !== "production" && notifySpy && isSpyEnabled()) {
      spyReport({
        type: CREATE,
        object: _assertThisInitialized(_this),
        observableKind: "value",
        debugObjectName: _this.name_,
        newValue: "" + _this.value_
      });
    }
    return _this;
  }
  var _proto = ObservableValue2.prototype;
  _proto.dehanceValue = function dehanceValue(value) {
    if (this.dehancer !== void 0) {
      return this.dehancer(value);
    }
    return value;
  };
  _proto.set = function set4(newValue) {
    var oldValue = this.value_;
    newValue = this.prepareNewValue_(newValue);
    if (newValue !== globalState.UNCHANGED) {
      var notifySpy = isSpyEnabled();
      if (process.env.NODE_ENV !== "production" && notifySpy) {
        spyReportStart({
          type: UPDATE,
          object: this,
          observableKind: "value",
          debugObjectName: this.name_,
          newValue,
          oldValue
        });
      }
      this.setNewValue_(newValue);
      if (process.env.NODE_ENV !== "production" && notifySpy) {
        spyReportEnd();
      }
    }
  };
  _proto.prepareNewValue_ = function prepareNewValue_(newValue) {
    checkIfStateModificationsAreAllowed(this);
    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        object: this,
        type: UPDATE,
        newValue
      });
      if (!change) {
        return globalState.UNCHANGED;
      }
      newValue = change.newValue;
    }
    newValue = this.enhancer(newValue, this.value_, this.name_);
    return this.equals(this.value_, newValue) ? globalState.UNCHANGED : newValue;
  };
  _proto.setNewValue_ = function setNewValue_(newValue) {
    var oldValue = this.value_;
    this.value_ = newValue;
    this.reportChanged();
    if (hasListeners(this)) {
      notifyListeners(this, {
        type: UPDATE,
        object: this,
        newValue,
        oldValue
      });
    }
  };
  _proto.get = function get3() {
    this.reportObserved();
    return this.dehanceValue(this.value_);
  };
  _proto.intercept_ = function intercept_(handler) {
    return registerInterceptor(this, handler);
  };
  _proto.observe_ = function observe_(listener, fireImmediately) {
    if (fireImmediately) {
      listener({
        observableKind: "value",
        debugObjectName: this.name_,
        object: this,
        type: UPDATE,
        newValue: this.value_,
        oldValue: void 0
      });
    }
    return registerListener(this, listener);
  };
  _proto.raw = function raw() {
    return this.value_;
  };
  _proto.toJSON = function toJSON2() {
    return this.get();
  };
  _proto.toString = function toString2() {
    return this.name_ + "[" + this.value_ + "]";
  };
  _proto.valueOf = function valueOf() {
    return toPrimitive(this.get());
  };
  _proto[_Symbol$toPrimitive] = function() {
    return this.valueOf();
  };
  return ObservableValue2;
}(Atom);
var _Symbol$toPrimitive$1;
function getFlag(flags, mask) {
  return !!(flags & mask);
}
function setFlag(flags, mask, newValue) {
  if (newValue) {
    flags |= mask;
  } else {
    flags &= ~mask;
  }
  return flags;
}
_Symbol$toPrimitive$1 = Symbol.toPrimitive;
var ComputedValue = /* @__PURE__ */ function() {
  function ComputedValue2(options) {
    this.dependenciesState_ = IDerivationState_.NOT_TRACKING_;
    this.observing_ = [];
    this.newObserving_ = null;
    this.observers_ = /* @__PURE__ */ new Set();
    this.diffValue_ = 0;
    this.runId_ = 0;
    this.lastAccessedBy_ = 0;
    this.lowestObserverState_ = IDerivationState_.UP_TO_DATE_;
    this.unboundDepsCount_ = 0;
    this.value_ = new CaughtException(null);
    this.name_ = void 0;
    this.triggeredBy_ = void 0;
    this.flags_ = 0;
    this.derivation = void 0;
    this.setter_ = void 0;
    this.isTracing_ = TraceMode.NONE;
    this.scope_ = void 0;
    this.equals_ = void 0;
    this.requiresReaction_ = void 0;
    this.keepAlive_ = void 0;
    this.onBOL = void 0;
    this.onBUOL = void 0;
    if (!options.get) {
      die(31);
    }
    this.derivation = options.get;
    this.name_ = options.name || (process.env.NODE_ENV !== "production" ? "ComputedValue@" + getNextId() : "ComputedValue");
    if (options.set) {
      this.setter_ = createAction(process.env.NODE_ENV !== "production" ? this.name_ + "-setter" : "ComputedValue-setter", options.set);
    }
    this.equals_ = options.equals || (options.compareStructural || options.struct ? comparer.structural : comparer["default"]);
    this.scope_ = options.context;
    this.requiresReaction_ = options.requiresReaction;
    this.keepAlive_ = !!options.keepAlive;
  }
  var _proto = ComputedValue2.prototype;
  _proto.onBecomeStale_ = function onBecomeStale_() {
    propagateMaybeChanged(this);
  };
  _proto.onBO = function onBO() {
    if (this.onBOL) {
      this.onBOL.forEach(function(listener) {
        return listener();
      });
    }
  };
  _proto.onBUO = function onBUO() {
    if (this.onBUOL) {
      this.onBUOL.forEach(function(listener) {
        return listener();
      });
    }
  };
  _proto.get = function get3() {
    if (this.isComputing) {
      die(32, this.name_, this.derivation);
    }
    if (globalState.inBatch === 0 && // !globalState.trackingDerivatpion &&
    this.observers_.size === 0 && !this.keepAlive_) {
      if (shouldCompute(this)) {
        this.warnAboutUntrackedRead_();
        startBatch();
        this.value_ = this.computeValue_(false);
        endBatch();
      }
    } else {
      reportObserved(this);
      if (shouldCompute(this)) {
        var prevTrackingContext = globalState.trackingContext;
        if (this.keepAlive_ && !prevTrackingContext) {
          globalState.trackingContext = this;
        }
        if (this.trackAndCompute()) {
          propagateChangeConfirmed(this);
        }
        globalState.trackingContext = prevTrackingContext;
      }
    }
    var result = this.value_;
    if (isCaughtException(result)) {
      throw result.cause;
    }
    return result;
  };
  _proto.set = function set4(value) {
    if (this.setter_) {
      if (this.isRunningSetter) {
        die(33, this.name_);
      }
      this.isRunningSetter = true;
      try {
        this.setter_.call(this.scope_, value);
      } finally {
        this.isRunningSetter = false;
      }
    } else {
      die(34, this.name_);
    }
  };
  _proto.trackAndCompute = function trackAndCompute() {
    var oldValue = this.value_;
    var wasSuspended = (
      /* see #1208 */
      this.dependenciesState_ === IDerivationState_.NOT_TRACKING_
    );
    var newValue = this.computeValue_(true);
    var changed = wasSuspended || isCaughtException(oldValue) || isCaughtException(newValue) || !this.equals_(oldValue, newValue);
    if (changed) {
      this.value_ = newValue;
      if (process.env.NODE_ENV !== "production" && isSpyEnabled()) {
        spyReport({
          observableKind: "computed",
          debugObjectName: this.name_,
          object: this.scope_,
          type: "update",
          oldValue,
          newValue
        });
      }
    }
    return changed;
  };
  _proto.computeValue_ = function computeValue_(track) {
    this.isComputing = true;
    var prev = allowStateChangesStart(false);
    var res;
    if (track) {
      res = trackDerivedFunction(this, this.derivation, this.scope_);
    } else {
      if (globalState.disableErrorBoundaries === true) {
        res = this.derivation.call(this.scope_);
      } else {
        try {
          res = this.derivation.call(this.scope_);
        } catch (e) {
          res = new CaughtException(e);
        }
      }
    }
    allowStateChangesEnd(prev);
    this.isComputing = false;
    return res;
  };
  _proto.suspend_ = function suspend_() {
    if (!this.keepAlive_) {
      clearObserving(this);
      this.value_ = void 0;
      if (process.env.NODE_ENV !== "production" && this.isTracing_ !== TraceMode.NONE) {
        console.log("[mobx.trace] Computed value '" + this.name_ + "' was suspended and it will recompute on the next access.");
      }
    }
  };
  _proto.observe_ = function observe_(listener, fireImmediately) {
    var _this = this;
    var firstTime = true;
    var prevValue = void 0;
    return autorun(function() {
      var newValue = _this.get();
      if (!firstTime || fireImmediately) {
        var prevU = untrackedStart();
        listener({
          observableKind: "computed",
          debugObjectName: _this.name_,
          type: UPDATE,
          object: _this,
          newValue,
          oldValue: prevValue
        });
        untrackedEnd(prevU);
      }
      firstTime = false;
      prevValue = newValue;
    });
  };
  _proto.warnAboutUntrackedRead_ = function warnAboutUntrackedRead_() {
    if (!(process.env.NODE_ENV !== "production")) {
      return;
    }
    if (this.isTracing_ !== TraceMode.NONE) {
      console.log("[mobx.trace] Computed value '" + this.name_ + "' is being read outside a reactive context. Doing a full recompute.");
    }
    if (typeof this.requiresReaction_ === "boolean" ? this.requiresReaction_ : globalState.computedRequiresReaction) {
      console.warn("[mobx] Computed value '" + this.name_ + "' is being read outside a reactive context. Doing a full recompute.");
    }
  };
  _proto.toString = function toString2() {
    return this.name_ + "[" + this.derivation.toString() + "]";
  };
  _proto.valueOf = function valueOf() {
    return toPrimitive(this.get());
  };
  _proto[_Symbol$toPrimitive$1] = function() {
    return this.valueOf();
  };
  _createClass(ComputedValue2, [{
    key: "isComputing",
    get: function get3() {
      return getFlag(this.flags_, ComputedValue2.isComputingMask_);
    },
    set: function set4(newValue) {
      this.flags_ = setFlag(this.flags_, ComputedValue2.isComputingMask_, newValue);
    }
  }, {
    key: "isRunningSetter",
    get: function get3() {
      return getFlag(this.flags_, ComputedValue2.isRunningSetterMask_);
    },
    set: function set4(newValue) {
      this.flags_ = setFlag(this.flags_, ComputedValue2.isRunningSetterMask_, newValue);
    }
  }, {
    key: "isBeingObserved",
    get: function get3() {
      return getFlag(this.flags_, ComputedValue2.isBeingObservedMask_);
    },
    set: function set4(newValue) {
      this.flags_ = setFlag(this.flags_, ComputedValue2.isBeingObservedMask_, newValue);
    }
  }, {
    key: "isPendingUnobservation",
    get: function get3() {
      return getFlag(this.flags_, ComputedValue2.isPendingUnobservationMask_);
    },
    set: function set4(newValue) {
      this.flags_ = setFlag(this.flags_, ComputedValue2.isPendingUnobservationMask_, newValue);
    }
  }]);
  return ComputedValue2;
}();
ComputedValue.isComputingMask_ = 1;
ComputedValue.isRunningSetterMask_ = 2;
ComputedValue.isBeingObservedMask_ = 4;
ComputedValue.isPendingUnobservationMask_ = 8;
var isComputedValue = /* @__PURE__ */ createInstanceofPredicate("ComputedValue", ComputedValue);
var IDerivationState_;
(function(IDerivationState_2) {
  IDerivationState_2[IDerivationState_2["NOT_TRACKING_"] = -1] = "NOT_TRACKING_";
  IDerivationState_2[IDerivationState_2["UP_TO_DATE_"] = 0] = "UP_TO_DATE_";
  IDerivationState_2[IDerivationState_2["POSSIBLY_STALE_"] = 1] = "POSSIBLY_STALE_";
  IDerivationState_2[IDerivationState_2["STALE_"] = 2] = "STALE_";
})(IDerivationState_ || (IDerivationState_ = {}));
var TraceMode;
(function(TraceMode2) {
  TraceMode2[TraceMode2["NONE"] = 0] = "NONE";
  TraceMode2[TraceMode2["LOG"] = 1] = "LOG";
  TraceMode2[TraceMode2["BREAK"] = 2] = "BREAK";
})(TraceMode || (TraceMode = {}));
var CaughtException = function CaughtException2(cause) {
  this.cause = void 0;
  this.cause = cause;
};
function isCaughtException(e) {
  return e instanceof CaughtException;
}
function shouldCompute(derivation) {
  switch (derivation.dependenciesState_) {
    case IDerivationState_.UP_TO_DATE_:
      return false;
    case IDerivationState_.NOT_TRACKING_:
    case IDerivationState_.STALE_:
      return true;
    case IDerivationState_.POSSIBLY_STALE_: {
      var prevAllowStateReads = allowStateReadsStart(true);
      var prevUntracked = untrackedStart();
      var obs = derivation.observing_, l = obs.length;
      for (var i = 0; i < l; i++) {
        var obj = obs[i];
        if (isComputedValue(obj)) {
          if (globalState.disableErrorBoundaries) {
            obj.get();
          } else {
            try {
              obj.get();
            } catch (e) {
              untrackedEnd(prevUntracked);
              allowStateReadsEnd(prevAllowStateReads);
              return true;
            }
          }
          if (derivation.dependenciesState_ === IDerivationState_.STALE_) {
            untrackedEnd(prevUntracked);
            allowStateReadsEnd(prevAllowStateReads);
            return true;
          }
        }
      }
      changeDependenciesStateTo0(derivation);
      untrackedEnd(prevUntracked);
      allowStateReadsEnd(prevAllowStateReads);
      return false;
    }
  }
}
function checkIfStateModificationsAreAllowed(atom) {
  if (!(process.env.NODE_ENV !== "production")) {
    return;
  }
  var hasObservers = atom.observers_.size > 0;
  if (!globalState.allowStateChanges && (hasObservers || globalState.enforceActions === "always")) {
    console.warn("[MobX] " + (globalState.enforceActions ? "Since strict-mode is enabled, changing (observed) observable values without using an action is not allowed. Tried to modify: " : "Side effects like changing state are not allowed at this point. Are you trying to modify state from, for example, a computed value or the render function of a React component? You can wrap side effects in 'runInAction' (or decorate functions with 'action') if needed. Tried to modify: ") + atom.name_);
  }
}
function checkIfStateReadsAreAllowed(observable2) {
  if (process.env.NODE_ENV !== "production" && !globalState.allowStateReads && globalState.observableRequiresReaction) {
    console.warn("[mobx] Observable '" + observable2.name_ + "' being read outside a reactive context.");
  }
}
function trackDerivedFunction(derivation, f, context) {
  var prevAllowStateReads = allowStateReadsStart(true);
  changeDependenciesStateTo0(derivation);
  derivation.newObserving_ = new Array(
    // Reserve constant space for initial dependencies, dynamic space otherwise.
    // See https://github.com/mobxjs/mobx/pull/3833
    derivation.runId_ === 0 ? 100 : derivation.observing_.length
  );
  derivation.unboundDepsCount_ = 0;
  derivation.runId_ = ++globalState.runId;
  var prevTracking = globalState.trackingDerivation;
  globalState.trackingDerivation = derivation;
  globalState.inBatch++;
  var result;
  if (globalState.disableErrorBoundaries === true) {
    result = f.call(context);
  } else {
    try {
      result = f.call(context);
    } catch (e) {
      result = new CaughtException(e);
    }
  }
  globalState.inBatch--;
  globalState.trackingDerivation = prevTracking;
  bindDependencies(derivation);
  warnAboutDerivationWithoutDependencies(derivation);
  allowStateReadsEnd(prevAllowStateReads);
  return result;
}
function warnAboutDerivationWithoutDependencies(derivation) {
  if (!(process.env.NODE_ENV !== "production")) {
    return;
  }
  if (derivation.observing_.length !== 0) {
    return;
  }
  if (typeof derivation.requiresObservable_ === "boolean" ? derivation.requiresObservable_ : globalState.reactionRequiresObservable) {
    console.warn("[mobx] Derivation '" + derivation.name_ + "' is created/updated without reading any observable value.");
  }
}
function bindDependencies(derivation) {
  var prevObserving = derivation.observing_;
  var observing = derivation.observing_ = derivation.newObserving_;
  var lowestNewObservingDerivationState = IDerivationState_.UP_TO_DATE_;
  var i0 = 0, l = derivation.unboundDepsCount_;
  for (var i = 0; i < l; i++) {
    var dep = observing[i];
    if (dep.diffValue_ === 0) {
      dep.diffValue_ = 1;
      if (i0 !== i) {
        observing[i0] = dep;
      }
      i0++;
    }
    if (dep.dependenciesState_ > lowestNewObservingDerivationState) {
      lowestNewObservingDerivationState = dep.dependenciesState_;
    }
  }
  observing.length = i0;
  derivation.newObserving_ = null;
  l = prevObserving.length;
  while (l--) {
    var _dep = prevObserving[l];
    if (_dep.diffValue_ === 0) {
      removeObserver(_dep, derivation);
    }
    _dep.diffValue_ = 0;
  }
  while (i0--) {
    var _dep2 = observing[i0];
    if (_dep2.diffValue_ === 1) {
      _dep2.diffValue_ = 0;
      addObserver(_dep2, derivation);
    }
  }
  if (lowestNewObservingDerivationState !== IDerivationState_.UP_TO_DATE_) {
    derivation.dependenciesState_ = lowestNewObservingDerivationState;
    derivation.onBecomeStale_();
  }
}
function clearObserving(derivation) {
  var obs = derivation.observing_;
  derivation.observing_ = [];
  var i = obs.length;
  while (i--) {
    removeObserver(obs[i], derivation);
  }
  derivation.dependenciesState_ = IDerivationState_.NOT_TRACKING_;
}
function untracked(action2) {
  var prev = untrackedStart();
  try {
    return action2();
  } finally {
    untrackedEnd(prev);
  }
}
function untrackedStart() {
  var prev = globalState.trackingDerivation;
  globalState.trackingDerivation = null;
  return prev;
}
function untrackedEnd(prev) {
  globalState.trackingDerivation = prev;
}
function allowStateReadsStart(allowStateReads) {
  var prev = globalState.allowStateReads;
  globalState.allowStateReads = allowStateReads;
  return prev;
}
function allowStateReadsEnd(prev) {
  globalState.allowStateReads = prev;
}
function changeDependenciesStateTo0(derivation) {
  if (derivation.dependenciesState_ === IDerivationState_.UP_TO_DATE_) {
    return;
  }
  derivation.dependenciesState_ = IDerivationState_.UP_TO_DATE_;
  var obs = derivation.observing_;
  var i = obs.length;
  while (i--) {
    obs[i].lowestObserverState_ = IDerivationState_.UP_TO_DATE_;
  }
}
var MobXGlobals = function MobXGlobals2() {
  this.version = 6;
  this.UNCHANGED = {};
  this.trackingDerivation = null;
  this.trackingContext = null;
  this.runId = 0;
  this.mobxGuid = 0;
  this.inBatch = 0;
  this.pendingUnobservations = [];
  this.pendingReactions = [];
  this.isRunningReactions = false;
  this.allowStateChanges = false;
  this.allowStateReads = true;
  this.enforceActions = true;
  this.spyListeners = [];
  this.globalReactionErrorHandlers = [];
  this.computedRequiresReaction = false;
  this.reactionRequiresObservable = false;
  this.observableRequiresReaction = false;
  this.disableErrorBoundaries = false;
  this.suppressReactionErrors = false;
  this.useProxies = true;
  this.verifyProxies = false;
  this.safeDescriptors = true;
};
var canMergeGlobalState = true;
var globalState = /* @__PURE__ */ function() {
  var global2 = /* @__PURE__ */ getGlobal();
  if (global2.__mobxInstanceCount > 0 && !global2.__mobxGlobals) {
    canMergeGlobalState = false;
  }
  if (global2.__mobxGlobals && global2.__mobxGlobals.version !== new MobXGlobals().version) {
    canMergeGlobalState = false;
  }
  if (!canMergeGlobalState) {
    setTimeout(function() {
      {
        die(35);
      }
    }, 1);
    return new MobXGlobals();
  } else if (global2.__mobxGlobals) {
    global2.__mobxInstanceCount += 1;
    if (!global2.__mobxGlobals.UNCHANGED) {
      global2.__mobxGlobals.UNCHANGED = {};
    }
    return global2.__mobxGlobals;
  } else {
    global2.__mobxInstanceCount = 1;
    return global2.__mobxGlobals = /* @__PURE__ */ new MobXGlobals();
  }
}();
function addObserver(observable2, node) {
  observable2.observers_.add(node);
  if (observable2.lowestObserverState_ > node.dependenciesState_) {
    observable2.lowestObserverState_ = node.dependenciesState_;
  }
}
function removeObserver(observable2, node) {
  observable2.observers_["delete"](node);
  if (observable2.observers_.size === 0) {
    queueForUnobservation(observable2);
  }
}
function queueForUnobservation(observable2) {
  if (observable2.isPendingUnobservation === false) {
    observable2.isPendingUnobservation = true;
    globalState.pendingUnobservations.push(observable2);
  }
}
function startBatch() {
  globalState.inBatch++;
}
function endBatch() {
  if (--globalState.inBatch === 0) {
    runReactions();
    var list = globalState.pendingUnobservations;
    for (var i = 0; i < list.length; i++) {
      var observable2 = list[i];
      observable2.isPendingUnobservation = false;
      if (observable2.observers_.size === 0) {
        if (observable2.isBeingObserved) {
          observable2.isBeingObserved = false;
          observable2.onBUO();
        }
        if (observable2 instanceof ComputedValue) {
          observable2.suspend_();
        }
      }
    }
    globalState.pendingUnobservations = [];
  }
}
function reportObserved(observable2) {
  checkIfStateReadsAreAllowed(observable2);
  var derivation = globalState.trackingDerivation;
  if (derivation !== null) {
    if (derivation.runId_ !== observable2.lastAccessedBy_) {
      observable2.lastAccessedBy_ = derivation.runId_;
      derivation.newObserving_[derivation.unboundDepsCount_++] = observable2;
      if (!observable2.isBeingObserved && globalState.trackingContext) {
        observable2.isBeingObserved = true;
        observable2.onBO();
      }
    }
    return observable2.isBeingObserved;
  } else if (observable2.observers_.size === 0 && globalState.inBatch > 0) {
    queueForUnobservation(observable2);
  }
  return false;
}
function propagateChanged(observable2) {
  if (observable2.lowestObserverState_ === IDerivationState_.STALE_) {
    return;
  }
  observable2.lowestObserverState_ = IDerivationState_.STALE_;
  observable2.observers_.forEach(function(d) {
    if (d.dependenciesState_ === IDerivationState_.UP_TO_DATE_) {
      if (process.env.NODE_ENV !== "production" && d.isTracing_ !== TraceMode.NONE) {
        logTraceInfo(d, observable2);
      }
      d.onBecomeStale_();
    }
    d.dependenciesState_ = IDerivationState_.STALE_;
  });
}
function propagateChangeConfirmed(observable2) {
  if (observable2.lowestObserverState_ === IDerivationState_.STALE_) {
    return;
  }
  observable2.lowestObserverState_ = IDerivationState_.STALE_;
  observable2.observers_.forEach(function(d) {
    if (d.dependenciesState_ === IDerivationState_.POSSIBLY_STALE_) {
      d.dependenciesState_ = IDerivationState_.STALE_;
      if (process.env.NODE_ENV !== "production" && d.isTracing_ !== TraceMode.NONE) {
        logTraceInfo(d, observable2);
      }
    } else if (d.dependenciesState_ === IDerivationState_.UP_TO_DATE_) {
      observable2.lowestObserverState_ = IDerivationState_.UP_TO_DATE_;
    }
  });
}
function propagateMaybeChanged(observable2) {
  if (observable2.lowestObserverState_ !== IDerivationState_.UP_TO_DATE_) {
    return;
  }
  observable2.lowestObserverState_ = IDerivationState_.POSSIBLY_STALE_;
  observable2.observers_.forEach(function(d) {
    if (d.dependenciesState_ === IDerivationState_.UP_TO_DATE_) {
      d.dependenciesState_ = IDerivationState_.POSSIBLY_STALE_;
      d.onBecomeStale_();
    }
  });
}
function logTraceInfo(derivation, observable2) {
  console.log("[mobx.trace] '" + derivation.name_ + "' is invalidated due to a change in: '" + observable2.name_ + "'");
  if (derivation.isTracing_ === TraceMode.BREAK) {
    var lines = [];
    printDepTree(getDependencyTree(derivation), lines, 1);
    new Function("debugger;\n/*\nTracing '" + derivation.name_ + "'\n\nYou are entering this break point because derivation '" + derivation.name_ + "' is being traced and '" + observable2.name_ + "' is now forcing it to update.\nJust follow the stacktrace you should now see in the devtools to see precisely what piece of your code is causing this update\nThe stackframe you are looking for is at least ~6-8 stack-frames up.\n\n" + (derivation instanceof ComputedValue ? derivation.derivation.toString().replace(/[*]\//g, "/") : "") + "\n\nThe dependencies for this derivation are:\n\n" + lines.join("\n") + "\n*/\n    ")();
  }
}
function printDepTree(tree, lines, depth) {
  if (lines.length >= 1e3) {
    lines.push("(and many more)");
    return;
  }
  lines.push("" + "	".repeat(depth - 1) + tree.name);
  if (tree.dependencies) {
    tree.dependencies.forEach(function(child) {
      return printDepTree(child, lines, depth + 1);
    });
  }
}
var Reaction = /* @__PURE__ */ function() {
  function Reaction2(name_, onInvalidate_, errorHandler_, requiresObservable_) {
    if (name_ === void 0) {
      name_ = process.env.NODE_ENV !== "production" ? "Reaction@" + getNextId() : "Reaction";
    }
    this.name_ = void 0;
    this.onInvalidate_ = void 0;
    this.errorHandler_ = void 0;
    this.requiresObservable_ = void 0;
    this.observing_ = [];
    this.newObserving_ = [];
    this.dependenciesState_ = IDerivationState_.NOT_TRACKING_;
    this.diffValue_ = 0;
    this.runId_ = 0;
    this.unboundDepsCount_ = 0;
    this.isDisposed_ = false;
    this.isScheduled_ = false;
    this.isTrackPending_ = false;
    this.isRunning_ = false;
    this.isTracing_ = TraceMode.NONE;
    this.name_ = name_;
    this.onInvalidate_ = onInvalidate_;
    this.errorHandler_ = errorHandler_;
    this.requiresObservable_ = requiresObservable_;
  }
  var _proto = Reaction2.prototype;
  _proto.onBecomeStale_ = function onBecomeStale_() {
    this.schedule_();
  };
  _proto.schedule_ = function schedule_() {
    if (!this.isScheduled_) {
      this.isScheduled_ = true;
      globalState.pendingReactions.push(this);
      runReactions();
    }
  };
  _proto.isScheduled = function isScheduled() {
    return this.isScheduled_;
  };
  _proto.runReaction_ = function runReaction_() {
    if (!this.isDisposed_) {
      startBatch();
      this.isScheduled_ = false;
      var prev = globalState.trackingContext;
      globalState.trackingContext = this;
      if (shouldCompute(this)) {
        this.isTrackPending_ = true;
        try {
          this.onInvalidate_();
          if (process.env.NODE_ENV !== "production" && this.isTrackPending_ && isSpyEnabled()) {
            spyReport({
              name: this.name_,
              type: "scheduled-reaction"
            });
          }
        } catch (e) {
          this.reportExceptionInDerivation_(e);
        }
      }
      globalState.trackingContext = prev;
      endBatch();
    }
  };
  _proto.track = function track(fn) {
    if (this.isDisposed_) {
      return;
    }
    startBatch();
    var notify = isSpyEnabled();
    var startTime;
    if (process.env.NODE_ENV !== "production" && notify) {
      startTime = Date.now();
      spyReportStart({
        name: this.name_,
        type: "reaction"
      });
    }
    this.isRunning_ = true;
    var prevReaction = globalState.trackingContext;
    globalState.trackingContext = this;
    var result = trackDerivedFunction(this, fn, void 0);
    globalState.trackingContext = prevReaction;
    this.isRunning_ = false;
    this.isTrackPending_ = false;
    if (this.isDisposed_) {
      clearObserving(this);
    }
    if (isCaughtException(result)) {
      this.reportExceptionInDerivation_(result.cause);
    }
    if (process.env.NODE_ENV !== "production" && notify) {
      spyReportEnd({
        time: Date.now() - startTime
      });
    }
    endBatch();
  };
  _proto.reportExceptionInDerivation_ = function reportExceptionInDerivation_(error) {
    var _this = this;
    if (this.errorHandler_) {
      this.errorHandler_(error, this);
      return;
    }
    if (globalState.disableErrorBoundaries) {
      throw error;
    }
    var message = process.env.NODE_ENV !== "production" ? "[mobx] Encountered an uncaught exception that was thrown by a reaction or observer component, in: '" + this + "'" : "[mobx] uncaught error in '" + this + "'";
    if (!globalState.suppressReactionErrors) {
      console.error(message, error);
    } else if (process.env.NODE_ENV !== "production") {
      console.warn("[mobx] (error in reaction '" + this.name_ + "' suppressed, fix error of causing action below)");
    }
    if (process.env.NODE_ENV !== "production" && isSpyEnabled()) {
      spyReport({
        type: "error",
        name: this.name_,
        message,
        error: "" + error
      });
    }
    globalState.globalReactionErrorHandlers.forEach(function(f) {
      return f(error, _this);
    });
  };
  _proto.dispose = function dispose() {
    if (!this.isDisposed_) {
      this.isDisposed_ = true;
      if (!this.isRunning_) {
        startBatch();
        clearObserving(this);
        endBatch();
      }
    }
  };
  _proto.getDisposer_ = function getDisposer_(abortSignal) {
    var _this2 = this;
    var dispose = function dispose2() {
      _this2.dispose();
      abortSignal == null ? void 0 : abortSignal.removeEventListener == null ? void 0 : abortSignal.removeEventListener("abort", dispose2);
    };
    abortSignal == null ? void 0 : abortSignal.addEventListener == null ? void 0 : abortSignal.addEventListener("abort", dispose);
    dispose[$mobx] = this;
    return dispose;
  };
  _proto.toString = function toString2() {
    return "Reaction[" + this.name_ + "]";
  };
  _proto.trace = function trace$1(enterBreakPoint) {
    if (enterBreakPoint === void 0) {
      enterBreakPoint = false;
    }
    trace(this, enterBreakPoint);
  };
  return Reaction2;
}();
var MAX_REACTION_ITERATIONS = 100;
var reactionScheduler = function reactionScheduler2(f) {
  return f();
};
function runReactions() {
  if (globalState.inBatch > 0 || globalState.isRunningReactions) {
    return;
  }
  reactionScheduler(runReactionsHelper);
}
function runReactionsHelper() {
  globalState.isRunningReactions = true;
  var allReactions = globalState.pendingReactions;
  var iterations = 0;
  while (allReactions.length > 0) {
    if (++iterations === MAX_REACTION_ITERATIONS) {
      console.error(process.env.NODE_ENV !== "production" ? "Reaction doesn't converge to a stable state after " + MAX_REACTION_ITERATIONS + " iterations." + (" Probably there is a cycle in the reactive function: " + allReactions[0]) : "[mobx] cycle in reaction: " + allReactions[0]);
      allReactions.splice(0);
    }
    var remainingReactions = allReactions.splice(0);
    for (var i = 0, l = remainingReactions.length; i < l; i++) {
      remainingReactions[i].runReaction_();
    }
  }
  globalState.isRunningReactions = false;
}
var isReaction = /* @__PURE__ */ createInstanceofPredicate("Reaction", Reaction);
function isSpyEnabled() {
  return process.env.NODE_ENV !== "production" && !!globalState.spyListeners.length;
}
function spyReport(event) {
  if (!(process.env.NODE_ENV !== "production")) {
    return;
  }
  if (!globalState.spyListeners.length) {
    return;
  }
  var listeners = globalState.spyListeners;
  for (var i = 0, l = listeners.length; i < l; i++) {
    listeners[i](event);
  }
}
function spyReportStart(event) {
  if (!(process.env.NODE_ENV !== "production")) {
    return;
  }
  var change = _extends({}, event, {
    spyReportStart: true
  });
  spyReport(change);
}
var END_EVENT = {
  type: "report-end",
  spyReportEnd: true
};
function spyReportEnd(change) {
  if (!(process.env.NODE_ENV !== "production")) {
    return;
  }
  if (change) {
    spyReport(_extends({}, change, {
      type: "report-end",
      spyReportEnd: true
    }));
  } else {
    spyReport(END_EVENT);
  }
}
function spy(listener) {
  if (!(process.env.NODE_ENV !== "production")) {
    console.warn("[mobx.spy] Is a no-op in production builds");
    return function() {
    };
  } else {
    globalState.spyListeners.push(listener);
    return once$1(function() {
      globalState.spyListeners = globalState.spyListeners.filter(function(l) {
        return l !== listener;
      });
    });
  }
}
var ACTION = "action";
var ACTION_BOUND = "action.bound";
var AUTOACTION = "autoAction";
var AUTOACTION_BOUND = "autoAction.bound";
var DEFAULT_ACTION_NAME = "<unnamed action>";
var actionAnnotation = /* @__PURE__ */ createActionAnnotation(ACTION);
var actionBoundAnnotation = /* @__PURE__ */ createActionAnnotation(ACTION_BOUND, {
  bound: true
});
var autoActionAnnotation = /* @__PURE__ */ createActionAnnotation(AUTOACTION, {
  autoAction: true
});
var autoActionBoundAnnotation = /* @__PURE__ */ createActionAnnotation(AUTOACTION_BOUND, {
  autoAction: true,
  bound: true
});
function createActionFactory(autoAction2) {
  var res = function action2(arg1, arg2) {
    if (isFunction(arg1)) {
      return createAction(arg1.name || DEFAULT_ACTION_NAME, arg1, autoAction2);
    }
    if (isFunction(arg2)) {
      return createAction(arg1, arg2, autoAction2);
    }
    if (is20223Decorator(arg2)) {
      return (autoAction2 ? autoActionAnnotation : actionAnnotation).decorate_20223_(arg1, arg2);
    }
    if (isStringish(arg2)) {
      return storeAnnotation(arg1, arg2, autoAction2 ? autoActionAnnotation : actionAnnotation);
    }
    if (isStringish(arg1)) {
      return createDecoratorAnnotation(createActionAnnotation(autoAction2 ? AUTOACTION : ACTION, {
        name: arg1,
        autoAction: autoAction2
      }));
    }
    if (process.env.NODE_ENV !== "production") {
      die("Invalid arguments for `action`");
    }
  };
  return res;
}
var action = /* @__PURE__ */ createActionFactory(false);
Object.assign(action, actionAnnotation);
var autoAction = /* @__PURE__ */ createActionFactory(true);
Object.assign(autoAction, autoActionAnnotation);
action.bound = /* @__PURE__ */ createDecoratorAnnotation(actionBoundAnnotation);
autoAction.bound = /* @__PURE__ */ createDecoratorAnnotation(autoActionBoundAnnotation);
function runInAction(fn) {
  return executeAction(fn.name || DEFAULT_ACTION_NAME, false, fn, this, void 0);
}
function isAction(thing) {
  return isFunction(thing) && thing.isMobxAction === true;
}
function autorun(view, opts) {
  var _opts$name, _opts, _opts2, _opts2$signal, _opts3;
  if (opts === void 0) {
    opts = EMPTY_OBJECT;
  }
  if (process.env.NODE_ENV !== "production") {
    if (!isFunction(view)) {
      die("Autorun expects a function as first argument");
    }
    if (isAction(view)) {
      die("Autorun does not accept actions since actions are untrackable");
    }
  }
  var name = (_opts$name = (_opts = opts) == null ? void 0 : _opts.name) != null ? _opts$name : process.env.NODE_ENV !== "production" ? view.name || "Autorun@" + getNextId() : "Autorun";
  var runSync = !opts.scheduler && !opts.delay;
  var reaction;
  if (runSync) {
    reaction = new Reaction(name, function() {
      this.track(reactionRunner);
    }, opts.onError, opts.requiresObservable);
  } else {
    var scheduler = createSchedulerFromOptions(opts);
    var isScheduled = false;
    reaction = new Reaction(name, function() {
      if (!isScheduled) {
        isScheduled = true;
        scheduler(function() {
          isScheduled = false;
          if (!reaction.isDisposed_) {
            reaction.track(reactionRunner);
          }
        });
      }
    }, opts.onError, opts.requiresObservable);
  }
  function reactionRunner() {
    view(reaction);
  }
  if (!((_opts2 = opts) != null && (_opts2$signal = _opts2.signal) != null && _opts2$signal.aborted)) {
    reaction.schedule_();
  }
  return reaction.getDisposer_((_opts3 = opts) == null ? void 0 : _opts3.signal);
}
var run = function run2(f) {
  return f();
};
function createSchedulerFromOptions(opts) {
  return opts.scheduler ? opts.scheduler : opts.delay ? function(f) {
    return setTimeout(f, opts.delay);
  } : run;
}
var ON_BECOME_OBSERVED = "onBO";
var ON_BECOME_UNOBSERVED = "onBUO";
function onBecomeObserved(thing, arg2, arg3) {
  return interceptHook(ON_BECOME_OBSERVED, thing, arg2, arg3);
}
function onBecomeUnobserved(thing, arg2, arg3) {
  return interceptHook(ON_BECOME_UNOBSERVED, thing, arg2, arg3);
}
function interceptHook(hook, thing, arg2, arg3) {
  var atom = getAtom(thing);
  var cb = isFunction(arg3) ? arg3 : arg2;
  var listenersKey = hook + "L";
  if (atom[listenersKey]) {
    atom[listenersKey].add(cb);
  } else {
    atom[listenersKey] = /* @__PURE__ */ new Set([cb]);
  }
  return function() {
    var hookListeners = atom[listenersKey];
    if (hookListeners) {
      hookListeners["delete"](cb);
      if (hookListeners.size === 0) {
        delete atom[listenersKey];
      }
    }
  };
}
function extendObservable(target, properties, annotations, options) {
  if (process.env.NODE_ENV !== "production") {
    if (arguments.length > 4) {
      die("'extendObservable' expected 2-4 arguments");
    }
    if (typeof target !== "object") {
      die("'extendObservable' expects an object as first argument");
    }
    if (isObservableMap(target)) {
      die("'extendObservable' should not be used on maps, use map.merge instead");
    }
    if (!isPlainObject(properties)) {
      die("'extendObservable' only accepts plain objects as second argument");
    }
    if (isObservable(properties) || isObservable(annotations)) {
      die("Extending an object with another observable (object) is not supported");
    }
  }
  var descriptors = getOwnPropertyDescriptors(properties);
  initObservable(function() {
    var adm = asObservableObject(target, options)[$mobx];
    ownKeys(descriptors).forEach(function(key) {
      adm.extend_(
        key,
        descriptors[key],
        // must pass "undefined" for { key: undefined }
        !annotations ? true : key in annotations ? annotations[key] : true
      );
    });
  });
  return target;
}
function getDependencyTree(thing, property) {
  return nodeToDependencyTree(getAtom(thing, property));
}
function nodeToDependencyTree(node) {
  var result = {
    name: node.name_
  };
  if (node.observing_ && node.observing_.length > 0) {
    result.dependencies = unique(node.observing_).map(nodeToDependencyTree);
  }
  return result;
}
function unique(list) {
  return Array.from(new Set(list));
}
var generatorId = 0;
function FlowCancellationError() {
  this.message = "FLOW_CANCELLED";
}
FlowCancellationError.prototype = /* @__PURE__ */ Object.create(Error.prototype);
var flowAnnotation = /* @__PURE__ */ createFlowAnnotation("flow");
var flowBoundAnnotation = /* @__PURE__ */ createFlowAnnotation("flow.bound", {
  bound: true
});
var flow = /* @__PURE__ */ Object.assign(function flow2(arg1, arg2) {
  if (is20223Decorator(arg2)) {
    return flowAnnotation.decorate_20223_(arg1, arg2);
  }
  if (isStringish(arg2)) {
    return storeAnnotation(arg1, arg2, flowAnnotation);
  }
  if (process.env.NODE_ENV !== "production" && arguments.length !== 1) {
    die("Flow expects single argument with generator function");
  }
  var generator = arg1;
  var name = generator.name || "<unnamed flow>";
  var res = function res2() {
    var ctx = this;
    var args = arguments;
    var runId = ++generatorId;
    var gen = action(name + " - runid: " + runId + " - init", generator).apply(ctx, args);
    var rejector;
    var pendingPromise = void 0;
    var promise = new Promise(function(resolve, reject) {
      var stepId = 0;
      rejector = reject;
      function onFulfilled(res3) {
        pendingPromise = void 0;
        var ret;
        try {
          ret = action(name + " - runid: " + runId + " - yield " + stepId++, gen.next).call(gen, res3);
        } catch (e) {
          return reject(e);
        }
        next(ret);
      }
      function onRejected(err) {
        pendingPromise = void 0;
        var ret;
        try {
          ret = action(name + " - runid: " + runId + " - yield " + stepId++, gen["throw"]).call(gen, err);
        } catch (e) {
          return reject(e);
        }
        next(ret);
      }
      function next(ret) {
        if (isFunction(ret == null ? void 0 : ret.then)) {
          ret.then(next, reject);
          return;
        }
        if (ret.done) {
          return resolve(ret.value);
        }
        pendingPromise = Promise.resolve(ret.value);
        return pendingPromise.then(onFulfilled, onRejected);
      }
      onFulfilled(void 0);
    });
    promise.cancel = action(name + " - runid: " + runId + " - cancel", function() {
      try {
        if (pendingPromise) {
          cancelPromise(pendingPromise);
        }
        var _res = gen["return"](void 0);
        var yieldedPromise = Promise.resolve(_res.value);
        yieldedPromise.then(noop$1, noop$1);
        cancelPromise(yieldedPromise);
        rejector(new FlowCancellationError());
      } catch (e) {
        rejector(e);
      }
    });
    return promise;
  };
  res.isMobXFlow = true;
  return res;
}, flowAnnotation);
flow.bound = /* @__PURE__ */ createDecoratorAnnotation(flowBoundAnnotation);
function cancelPromise(promise) {
  if (isFunction(promise.cancel)) {
    promise.cancel();
  }
}
function isFlow(fn) {
  return (fn == null ? void 0 : fn.isMobXFlow) === true;
}
function intercept(thing, propOrHandler, handler) {
  if (isFunction(handler)) {
    return interceptProperty(thing, propOrHandler, handler);
  } else {
    return interceptInterceptable(thing, propOrHandler);
  }
}
function interceptInterceptable(thing, handler) {
  return getAdministration(thing).intercept_(handler);
}
function interceptProperty(thing, property, handler) {
  return getAdministration(thing, property).intercept_(handler);
}
function _isObservable(value, property) {
  if (!value) {
    return false;
  }
  return isObservableObject(value) || !!value[$mobx] || isAtom(value) || isReaction(value) || isComputedValue(value);
}
function isObservable(value) {
  if (process.env.NODE_ENV !== "production" && arguments.length !== 1) {
    die("isObservable expects only 1 argument. Use isObservableProp to inspect the observability of a property");
  }
  return _isObservable(value);
}
function trace() {
  if (!(process.env.NODE_ENV !== "production")) {
    return;
  }
  var enterBreakPoint = false;
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  if (typeof args[args.length - 1] === "boolean") {
    enterBreakPoint = args.pop();
  }
  var derivation = getAtomFromArgs(args);
  if (!derivation) {
    return die("'trace(break?)' can only be used inside a tracked computed value or a Reaction. Consider passing in the computed value or reaction explicitly");
  }
  if (derivation.isTracing_ === TraceMode.NONE) {
    console.log("[mobx.trace] '" + derivation.name_ + "' tracing enabled");
  }
  derivation.isTracing_ = enterBreakPoint ? TraceMode.BREAK : TraceMode.LOG;
}
function getAtomFromArgs(args) {
  switch (args.length) {
    case 0:
      return globalState.trackingDerivation;
    case 1:
      return getAtom(args[0]);
    case 2:
      return getAtom(args[0], args[1]);
  }
}
function transaction(action2, thisArg) {
  if (thisArg === void 0) {
    thisArg = void 0;
  }
  startBatch();
  try {
    return action2.apply(thisArg);
  } finally {
    endBatch();
  }
}
function getAdm(target) {
  return target[$mobx];
}
var objectProxyTraps = {
  has: function has(target, name) {
    if (process.env.NODE_ENV !== "production" && globalState.trackingDerivation) {
      warnAboutProxyRequirement("detect new properties using the 'in' operator. Use 'has' from 'mobx' instead.");
    }
    return getAdm(target).has_(name);
  },
  get: function get(target, name) {
    return getAdm(target).get_(name);
  },
  set: function set2(target, name, value) {
    var _getAdm$set_;
    if (!isStringish(name)) {
      return false;
    }
    if (process.env.NODE_ENV !== "production" && !getAdm(target).values_.has(name)) {
      warnAboutProxyRequirement("add a new observable property through direct assignment. Use 'set' from 'mobx' instead.");
    }
    return (_getAdm$set_ = getAdm(target).set_(name, value, true)) != null ? _getAdm$set_ : true;
  },
  deleteProperty: function deleteProperty(target, name) {
    var _getAdm$delete_;
    if (process.env.NODE_ENV !== "production") {
      warnAboutProxyRequirement("delete properties from an observable object. Use 'remove' from 'mobx' instead.");
    }
    if (!isStringish(name)) {
      return false;
    }
    return (_getAdm$delete_ = getAdm(target).delete_(name, true)) != null ? _getAdm$delete_ : true;
  },
  defineProperty: function defineProperty2(target, name, descriptor) {
    var _getAdm$definePropert;
    if (process.env.NODE_ENV !== "production") {
      warnAboutProxyRequirement("define property on an observable object. Use 'defineProperty' from 'mobx' instead.");
    }
    return (_getAdm$definePropert = getAdm(target).defineProperty_(name, descriptor)) != null ? _getAdm$definePropert : true;
  },
  ownKeys: function ownKeys2(target) {
    if (process.env.NODE_ENV !== "production" && globalState.trackingDerivation) {
      warnAboutProxyRequirement("iterate keys to detect added / removed properties. Use 'keys' from 'mobx' instead.");
    }
    return getAdm(target).ownKeys_();
  },
  preventExtensions: function preventExtensions(target) {
    die(13);
  }
};
function asDynamicObservableObject(target, options) {
  var _target$$mobx, _target$$mobx$proxy_;
  assertProxies();
  target = asObservableObject(target, options);
  return (_target$$mobx$proxy_ = (_target$$mobx = target[$mobx]).proxy_) != null ? _target$$mobx$proxy_ : _target$$mobx.proxy_ = new Proxy(target, objectProxyTraps);
}
function hasInterceptors(interceptable) {
  return interceptable.interceptors_ !== void 0 && interceptable.interceptors_.length > 0;
}
function registerInterceptor(interceptable, handler) {
  var interceptors = interceptable.interceptors_ || (interceptable.interceptors_ = []);
  interceptors.push(handler);
  return once$1(function() {
    var idx = interceptors.indexOf(handler);
    if (idx !== -1) {
      interceptors.splice(idx, 1);
    }
  });
}
function interceptChange(interceptable, change) {
  var prevU = untrackedStart();
  try {
    var interceptors = [].concat(interceptable.interceptors_ || []);
    for (var i = 0, l = interceptors.length; i < l; i++) {
      change = interceptors[i](change);
      if (change && !change.type) {
        die(14);
      }
      if (!change) {
        break;
      }
    }
    return change;
  } finally {
    untrackedEnd(prevU);
  }
}
function hasListeners(listenable) {
  return listenable.changeListeners_ !== void 0 && listenable.changeListeners_.length > 0;
}
function registerListener(listenable, handler) {
  var listeners = listenable.changeListeners_ || (listenable.changeListeners_ = []);
  listeners.push(handler);
  return once$1(function() {
    var idx = listeners.indexOf(handler);
    if (idx !== -1) {
      listeners.splice(idx, 1);
    }
  });
}
function notifyListeners(listenable, change) {
  var prevU = untrackedStart();
  var listeners = listenable.changeListeners_;
  if (!listeners) {
    return;
  }
  listeners = listeners.slice();
  for (var i = 0, l = listeners.length; i < l; i++) {
    listeners[i](change);
  }
  untrackedEnd(prevU);
}
function makeObservable(target, annotations, options) {
  initObservable(function() {
    var _annotations;
    var adm = asObservableObject(target, options)[$mobx];
    if (process.env.NODE_ENV !== "production" && annotations && target[storedAnnotationsSymbol]) {
      die("makeObservable second arg must be nullish when using decorators. Mixing @decorator syntax with annotations is not supported.");
    }
    (_annotations = annotations) != null ? _annotations : annotations = collectStoredAnnotations(target);
    ownKeys(annotations).forEach(function(key) {
      return adm.make_(key, annotations[key]);
    });
  });
  return target;
}
var SPLICE = "splice";
var UPDATE = "update";
var MAX_SPLICE_SIZE = 1e4;
var arrayTraps = {
  get: function get2(target, name) {
    var adm = target[$mobx];
    if (name === $mobx) {
      return adm;
    }
    if (name === "length") {
      return adm.getArrayLength_();
    }
    if (typeof name === "string" && !isNaN(name)) {
      return adm.get_(parseInt(name));
    }
    if (hasProp(arrayExtensions, name)) {
      return arrayExtensions[name];
    }
    return target[name];
  },
  set: function set3(target, name, value) {
    var adm = target[$mobx];
    if (name === "length") {
      adm.setArrayLength_(value);
    }
    if (typeof name === "symbol" || isNaN(name)) {
      target[name] = value;
    } else {
      adm.set_(parseInt(name), value);
    }
    return true;
  },
  preventExtensions: function preventExtensions2() {
    die(15);
  }
};
var ObservableArrayAdministration = /* @__PURE__ */ function() {
  function ObservableArrayAdministration2(name, enhancer, owned_, legacyMode_) {
    if (name === void 0) {
      name = process.env.NODE_ENV !== "production" ? "ObservableArray@" + getNextId() : "ObservableArray";
    }
    this.owned_ = void 0;
    this.legacyMode_ = void 0;
    this.atom_ = void 0;
    this.values_ = [];
    this.interceptors_ = void 0;
    this.changeListeners_ = void 0;
    this.enhancer_ = void 0;
    this.dehancer = void 0;
    this.proxy_ = void 0;
    this.lastKnownLength_ = 0;
    this.owned_ = owned_;
    this.legacyMode_ = legacyMode_;
    this.atom_ = new Atom(name);
    this.enhancer_ = function(newV, oldV) {
      return enhancer(newV, oldV, process.env.NODE_ENV !== "production" ? name + "[..]" : "ObservableArray[..]");
    };
  }
  var _proto = ObservableArrayAdministration2.prototype;
  _proto.dehanceValue_ = function dehanceValue_(value) {
    if (this.dehancer !== void 0) {
      return this.dehancer(value);
    }
    return value;
  };
  _proto.dehanceValues_ = function dehanceValues_(values) {
    if (this.dehancer !== void 0 && values.length > 0) {
      return values.map(this.dehancer);
    }
    return values;
  };
  _proto.intercept_ = function intercept_(handler) {
    return registerInterceptor(this, handler);
  };
  _proto.observe_ = function observe_(listener, fireImmediately) {
    if (fireImmediately === void 0) {
      fireImmediately = false;
    }
    if (fireImmediately) {
      listener({
        observableKind: "array",
        object: this.proxy_,
        debugObjectName: this.atom_.name_,
        type: "splice",
        index: 0,
        added: this.values_.slice(),
        addedCount: this.values_.length,
        removed: [],
        removedCount: 0
      });
    }
    return registerListener(this, listener);
  };
  _proto.getArrayLength_ = function getArrayLength_() {
    this.atom_.reportObserved();
    return this.values_.length;
  };
  _proto.setArrayLength_ = function setArrayLength_(newLength) {
    if (typeof newLength !== "number" || isNaN(newLength) || newLength < 0) {
      die("Out of range: " + newLength);
    }
    var currentLength = this.values_.length;
    if (newLength === currentLength) {
      return;
    } else if (newLength > currentLength) {
      var newItems = new Array(newLength - currentLength);
      for (var i = 0; i < newLength - currentLength; i++) {
        newItems[i] = void 0;
      }
      this.spliceWithArray_(currentLength, 0, newItems);
    } else {
      this.spliceWithArray_(newLength, currentLength - newLength);
    }
  };
  _proto.updateArrayLength_ = function updateArrayLength_(oldLength, delta) {
    if (oldLength !== this.lastKnownLength_) {
      die(16);
    }
    this.lastKnownLength_ += delta;
    if (this.legacyMode_ && delta > 0) {
      reserveArrayBuffer(oldLength + delta + 1);
    }
  };
  _proto.spliceWithArray_ = function spliceWithArray_(index, deleteCount, newItems) {
    var _this = this;
    checkIfStateModificationsAreAllowed(this.atom_);
    var length = this.values_.length;
    if (index === void 0) {
      index = 0;
    } else if (index > length) {
      index = length;
    } else if (index < 0) {
      index = Math.max(0, length + index);
    }
    if (arguments.length === 1) {
      deleteCount = length - index;
    } else if (deleteCount === void 0 || deleteCount === null) {
      deleteCount = 0;
    } else {
      deleteCount = Math.max(0, Math.min(deleteCount, length - index));
    }
    if (newItems === void 0) {
      newItems = EMPTY_ARRAY;
    }
    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        object: this.proxy_,
        type: SPLICE,
        index,
        removedCount: deleteCount,
        added: newItems
      });
      if (!change) {
        return EMPTY_ARRAY;
      }
      deleteCount = change.removedCount;
      newItems = change.added;
    }
    newItems = newItems.length === 0 ? newItems : newItems.map(function(v) {
      return _this.enhancer_(v, void 0);
    });
    if (this.legacyMode_ || process.env.NODE_ENV !== "production") {
      var lengthDelta = newItems.length - deleteCount;
      this.updateArrayLength_(length, lengthDelta);
    }
    var res = this.spliceItemsIntoValues_(index, deleteCount, newItems);
    if (deleteCount !== 0 || newItems.length !== 0) {
      this.notifyArraySplice_(index, newItems, res);
    }
    return this.dehanceValues_(res);
  };
  _proto.spliceItemsIntoValues_ = function spliceItemsIntoValues_(index, deleteCount, newItems) {
    if (newItems.length < MAX_SPLICE_SIZE) {
      var _this$values_;
      return (_this$values_ = this.values_).splice.apply(_this$values_, [index, deleteCount].concat(newItems));
    } else {
      var res = this.values_.slice(index, index + deleteCount);
      var oldItems = this.values_.slice(index + deleteCount);
      this.values_.length += newItems.length - deleteCount;
      for (var i = 0; i < newItems.length; i++) {
        this.values_[index + i] = newItems[i];
      }
      for (var _i = 0; _i < oldItems.length; _i++) {
        this.values_[index + newItems.length + _i] = oldItems[_i];
      }
      return res;
    }
  };
  _proto.notifyArrayChildUpdate_ = function notifyArrayChildUpdate_(index, newValue, oldValue) {
    var notifySpy = !this.owned_ && isSpyEnabled();
    var notify = hasListeners(this);
    var change = notify || notifySpy ? {
      observableKind: "array",
      object: this.proxy_,
      type: UPDATE,
      debugObjectName: this.atom_.name_,
      index,
      newValue,
      oldValue
    } : null;
    if (process.env.NODE_ENV !== "production" && notifySpy) {
      spyReportStart(change);
    }
    this.atom_.reportChanged();
    if (notify) {
      notifyListeners(this, change);
    }
    if (process.env.NODE_ENV !== "production" && notifySpy) {
      spyReportEnd();
    }
  };
  _proto.notifyArraySplice_ = function notifyArraySplice_(index, added, removed) {
    var notifySpy = !this.owned_ && isSpyEnabled();
    var notify = hasListeners(this);
    var change = notify || notifySpy ? {
      observableKind: "array",
      object: this.proxy_,
      debugObjectName: this.atom_.name_,
      type: SPLICE,
      index,
      removed,
      added,
      removedCount: removed.length,
      addedCount: added.length
    } : null;
    if (process.env.NODE_ENV !== "production" && notifySpy) {
      spyReportStart(change);
    }
    this.atom_.reportChanged();
    if (notify) {
      notifyListeners(this, change);
    }
    if (process.env.NODE_ENV !== "production" && notifySpy) {
      spyReportEnd();
    }
  };
  _proto.get_ = function get_(index) {
    if (this.legacyMode_ && index >= this.values_.length) {
      console.warn(process.env.NODE_ENV !== "production" ? "[mobx.array] Attempt to read an array index (" + index + ") that is out of bounds (" + this.values_.length + "). Please check length first. Out of bound indices will not be tracked by MobX" : "[mobx] Out of bounds read: " + index);
      return void 0;
    }
    this.atom_.reportObserved();
    return this.dehanceValue_(this.values_[index]);
  };
  _proto.set_ = function set_(index, newValue) {
    var values = this.values_;
    if (this.legacyMode_ && index > values.length) {
      die(17, index, values.length);
    }
    if (index < values.length) {
      checkIfStateModificationsAreAllowed(this.atom_);
      var oldValue = values[index];
      if (hasInterceptors(this)) {
        var change = interceptChange(this, {
          type: UPDATE,
          object: this.proxy_,
          index,
          newValue
        });
        if (!change) {
          return;
        }
        newValue = change.newValue;
      }
      newValue = this.enhancer_(newValue, oldValue);
      var changed = newValue !== oldValue;
      if (changed) {
        values[index] = newValue;
        this.notifyArrayChildUpdate_(index, newValue, oldValue);
      }
    } else {
      var newItems = new Array(index + 1 - values.length);
      for (var i = 0; i < newItems.length - 1; i++) {
        newItems[i] = void 0;
      }
      newItems[newItems.length - 1] = newValue;
      this.spliceWithArray_(values.length, 0, newItems);
    }
  };
  return ObservableArrayAdministration2;
}();
function createObservableArray(initialValues, enhancer, name, owned) {
  if (name === void 0) {
    name = process.env.NODE_ENV !== "production" ? "ObservableArray@" + getNextId() : "ObservableArray";
  }
  if (owned === void 0) {
    owned = false;
  }
  assertProxies();
  return initObservable(function() {
    var adm = new ObservableArrayAdministration(name, enhancer, owned, false);
    addHiddenFinalProp(adm.values_, $mobx, adm);
    var proxy = new Proxy(adm.values_, arrayTraps);
    adm.proxy_ = proxy;
    if (initialValues && initialValues.length) {
      adm.spliceWithArray_(0, 0, initialValues);
    }
    return proxy;
  });
}
var arrayExtensions = {
  clear: function clear() {
    return this.splice(0);
  },
  replace: function replace(newItems) {
    var adm = this[$mobx];
    return adm.spliceWithArray_(0, adm.values_.length, newItems);
  },
  // Used by JSON.stringify
  toJSON: function toJSON() {
    return this.slice();
  },
  /*
   * functions that do alter the internal structure of the array, (based on lib.es6.d.ts)
   * since these functions alter the inner structure of the array, the have side effects.
   * Because the have side effects, they should not be used in computed function,
   * and for that reason the do not call dependencyState.notifyObserved
   */
  splice: function splice(index, deleteCount) {
    for (var _len = arguments.length, newItems = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      newItems[_key - 2] = arguments[_key];
    }
    var adm = this[$mobx];
    switch (arguments.length) {
      case 0:
        return [];
      case 1:
        return adm.spliceWithArray_(index);
      case 2:
        return adm.spliceWithArray_(index, deleteCount);
    }
    return adm.spliceWithArray_(index, deleteCount, newItems);
  },
  spliceWithArray: function spliceWithArray(index, deleteCount, newItems) {
    return this[$mobx].spliceWithArray_(index, deleteCount, newItems);
  },
  push: function push() {
    var adm = this[$mobx];
    for (var _len2 = arguments.length, items = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      items[_key2] = arguments[_key2];
    }
    adm.spliceWithArray_(adm.values_.length, 0, items);
    return adm.values_.length;
  },
  pop: function pop() {
    return this.splice(Math.max(this[$mobx].values_.length - 1, 0), 1)[0];
  },
  shift: function shift() {
    return this.splice(0, 1)[0];
  },
  unshift: function unshift() {
    var adm = this[$mobx];
    for (var _len3 = arguments.length, items = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      items[_key3] = arguments[_key3];
    }
    adm.spliceWithArray_(0, 0, items);
    return adm.values_.length;
  },
  reverse: function reverse() {
    if (globalState.trackingDerivation) {
      die(37, "reverse");
    }
    this.replace(this.slice().reverse());
    return this;
  },
  sort: function sort() {
    if (globalState.trackingDerivation) {
      die(37, "sort");
    }
    var copy = this.slice();
    copy.sort.apply(copy, arguments);
    this.replace(copy);
    return this;
  },
  remove: function remove(value) {
    var adm = this[$mobx];
    var idx = adm.dehanceValues_(adm.values_).indexOf(value);
    if (idx > -1) {
      this.splice(idx, 1);
      return true;
    }
    return false;
  }
};
addArrayExtension("at", simpleFunc);
addArrayExtension("concat", simpleFunc);
addArrayExtension("flat", simpleFunc);
addArrayExtension("includes", simpleFunc);
addArrayExtension("indexOf", simpleFunc);
addArrayExtension("join", simpleFunc);
addArrayExtension("lastIndexOf", simpleFunc);
addArrayExtension("slice", simpleFunc);
addArrayExtension("toString", simpleFunc);
addArrayExtension("toLocaleString", simpleFunc);
addArrayExtension("toSorted", simpleFunc);
addArrayExtension("toSpliced", simpleFunc);
addArrayExtension("with", simpleFunc);
addArrayExtension("every", mapLikeFunc);
addArrayExtension("filter", mapLikeFunc);
addArrayExtension("find", mapLikeFunc);
addArrayExtension("findIndex", mapLikeFunc);
addArrayExtension("findLast", mapLikeFunc);
addArrayExtension("findLastIndex", mapLikeFunc);
addArrayExtension("flatMap", mapLikeFunc);
addArrayExtension("forEach", mapLikeFunc);
addArrayExtension("map", mapLikeFunc);
addArrayExtension("some", mapLikeFunc);
addArrayExtension("toReversed", mapLikeFunc);
addArrayExtension("reduce", reduceLikeFunc);
addArrayExtension("reduceRight", reduceLikeFunc);
function addArrayExtension(funcName, funcFactory) {
  if (typeof Array.prototype[funcName] === "function") {
    arrayExtensions[funcName] = funcFactory(funcName);
  }
}
function simpleFunc(funcName) {
  return function() {
    var adm = this[$mobx];
    adm.atom_.reportObserved();
    var dehancedValues = adm.dehanceValues_(adm.values_);
    return dehancedValues[funcName].apply(dehancedValues, arguments);
  };
}
function mapLikeFunc(funcName) {
  return function(callback, thisArg) {
    var _this2 = this;
    var adm = this[$mobx];
    adm.atom_.reportObserved();
    var dehancedValues = adm.dehanceValues_(adm.values_);
    return dehancedValues[funcName](function(element, index) {
      return callback.call(thisArg, element, index, _this2);
    });
  };
}
function reduceLikeFunc(funcName) {
  return function() {
    var _this3 = this;
    var adm = this[$mobx];
    adm.atom_.reportObserved();
    var dehancedValues = adm.dehanceValues_(adm.values_);
    var callback = arguments[0];
    arguments[0] = function(accumulator, currentValue, index) {
      return callback(accumulator, currentValue, index, _this3);
    };
    return dehancedValues[funcName].apply(dehancedValues, arguments);
  };
}
var isObservableArrayAdministration = /* @__PURE__ */ createInstanceofPredicate("ObservableArrayAdministration", ObservableArrayAdministration);
function isObservableArray(thing) {
  return isObject(thing) && isObservableArrayAdministration(thing[$mobx]);
}
var _Symbol$iterator, _Symbol$toStringTag;
var ObservableMapMarker = {};
var ADD = "add";
var DELETE$1 = "delete";
_Symbol$iterator = Symbol.iterator;
_Symbol$toStringTag = Symbol.toStringTag;
var ObservableMap = /* @__PURE__ */ function() {
  function ObservableMap2(initialData, enhancer_, name_) {
    var _this = this;
    if (enhancer_ === void 0) {
      enhancer_ = deepEnhancer;
    }
    if (name_ === void 0) {
      name_ = process.env.NODE_ENV !== "production" ? "ObservableMap@" + getNextId() : "ObservableMap";
    }
    this.enhancer_ = void 0;
    this.name_ = void 0;
    this[$mobx] = ObservableMapMarker;
    this.data_ = void 0;
    this.hasMap_ = void 0;
    this.keysAtom_ = void 0;
    this.interceptors_ = void 0;
    this.changeListeners_ = void 0;
    this.dehancer = void 0;
    this.enhancer_ = enhancer_;
    this.name_ = name_;
    if (!isFunction(Map)) {
      die(18);
    }
    initObservable(function() {
      _this.keysAtom_ = createAtom(process.env.NODE_ENV !== "production" ? _this.name_ + ".keys()" : "ObservableMap.keys()");
      _this.data_ = /* @__PURE__ */ new Map();
      _this.hasMap_ = /* @__PURE__ */ new Map();
      if (initialData) {
        _this.merge(initialData);
      }
    });
  }
  var _proto = ObservableMap2.prototype;
  _proto.has_ = function has_(key) {
    return this.data_.has(key);
  };
  _proto.has = function has2(key) {
    var _this2 = this;
    if (!globalState.trackingDerivation) {
      return this.has_(key);
    }
    var entry = this.hasMap_.get(key);
    if (!entry) {
      var newEntry = entry = new ObservableValue(this.has_(key), referenceEnhancer, process.env.NODE_ENV !== "production" ? this.name_ + "." + stringifyKey(key) + "?" : "ObservableMap.key?", false);
      this.hasMap_.set(key, newEntry);
      onBecomeUnobserved(newEntry, function() {
        return _this2.hasMap_["delete"](key);
      });
    }
    return entry.get();
  };
  _proto.set = function set4(key, value) {
    var hasKey = this.has_(key);
    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        type: hasKey ? UPDATE : ADD,
        object: this,
        newValue: value,
        name: key
      });
      if (!change) {
        return this;
      }
      value = change.newValue;
    }
    if (hasKey) {
      this.updateValue_(key, value);
    } else {
      this.addValue_(key, value);
    }
    return this;
  };
  _proto["delete"] = function _delete(key) {
    var _this3 = this;
    checkIfStateModificationsAreAllowed(this.keysAtom_);
    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        type: DELETE$1,
        object: this,
        name: key
      });
      if (!change) {
        return false;
      }
    }
    if (this.has_(key)) {
      var notifySpy = isSpyEnabled();
      var notify = hasListeners(this);
      var _change = notify || notifySpy ? {
        observableKind: "map",
        debugObjectName: this.name_,
        type: DELETE$1,
        object: this,
        oldValue: this.data_.get(key).value_,
        name: key
      } : null;
      if (process.env.NODE_ENV !== "production" && notifySpy) {
        spyReportStart(_change);
      }
      transaction(function() {
        var _this3$hasMap_$get;
        _this3.keysAtom_.reportChanged();
        (_this3$hasMap_$get = _this3.hasMap_.get(key)) == null ? void 0 : _this3$hasMap_$get.setNewValue_(false);
        var observable2 = _this3.data_.get(key);
        observable2.setNewValue_(void 0);
        _this3.data_["delete"](key);
      });
      if (notify) {
        notifyListeners(this, _change);
      }
      if (process.env.NODE_ENV !== "production" && notifySpy) {
        spyReportEnd();
      }
      return true;
    }
    return false;
  };
  _proto.updateValue_ = function updateValue_(key, newValue) {
    var observable2 = this.data_.get(key);
    newValue = observable2.prepareNewValue_(newValue);
    if (newValue !== globalState.UNCHANGED) {
      var notifySpy = isSpyEnabled();
      var notify = hasListeners(this);
      var change = notify || notifySpy ? {
        observableKind: "map",
        debugObjectName: this.name_,
        type: UPDATE,
        object: this,
        oldValue: observable2.value_,
        name: key,
        newValue
      } : null;
      if (process.env.NODE_ENV !== "production" && notifySpy) {
        spyReportStart(change);
      }
      observable2.setNewValue_(newValue);
      if (notify) {
        notifyListeners(this, change);
      }
      if (process.env.NODE_ENV !== "production" && notifySpy) {
        spyReportEnd();
      }
    }
  };
  _proto.addValue_ = function addValue_(key, newValue) {
    var _this4 = this;
    checkIfStateModificationsAreAllowed(this.keysAtom_);
    transaction(function() {
      var _this4$hasMap_$get;
      var observable2 = new ObservableValue(newValue, _this4.enhancer_, process.env.NODE_ENV !== "production" ? _this4.name_ + "." + stringifyKey(key) : "ObservableMap.key", false);
      _this4.data_.set(key, observable2);
      newValue = observable2.value_;
      (_this4$hasMap_$get = _this4.hasMap_.get(key)) == null ? void 0 : _this4$hasMap_$get.setNewValue_(true);
      _this4.keysAtom_.reportChanged();
    });
    var notifySpy = isSpyEnabled();
    var notify = hasListeners(this);
    var change = notify || notifySpy ? {
      observableKind: "map",
      debugObjectName: this.name_,
      type: ADD,
      object: this,
      name: key,
      newValue
    } : null;
    if (process.env.NODE_ENV !== "production" && notifySpy) {
      spyReportStart(change);
    }
    if (notify) {
      notifyListeners(this, change);
    }
    if (process.env.NODE_ENV !== "production" && notifySpy) {
      spyReportEnd();
    }
  };
  _proto.get = function get3(key) {
    if (this.has(key)) {
      return this.dehanceValue_(this.data_.get(key).get());
    }
    return this.dehanceValue_(void 0);
  };
  _proto.dehanceValue_ = function dehanceValue_(value) {
    if (this.dehancer !== void 0) {
      return this.dehancer(value);
    }
    return value;
  };
  _proto.keys = function keys() {
    this.keysAtom_.reportObserved();
    return this.data_.keys();
  };
  _proto.values = function values() {
    var self2 = this;
    var keys = this.keys();
    return makeIterable({
      next: function next() {
        var _keys$next = keys.next(), done = _keys$next.done, value = _keys$next.value;
        return {
          done,
          value: done ? void 0 : self2.get(value)
        };
      }
    });
  };
  _proto.entries = function entries() {
    var self2 = this;
    var keys = this.keys();
    return makeIterable({
      next: function next() {
        var _keys$next2 = keys.next(), done = _keys$next2.done, value = _keys$next2.value;
        return {
          done,
          value: done ? void 0 : [value, self2.get(value)]
        };
      }
    });
  };
  _proto[_Symbol$iterator] = function() {
    return this.entries();
  };
  _proto.forEach = function forEach(callback, thisArg) {
    for (var _iterator = _createForOfIteratorHelperLoose(this), _step; !(_step = _iterator()).done; ) {
      var _step$value = _step.value, key = _step$value[0], value = _step$value[1];
      callback.call(thisArg, value, key, this);
    }
  };
  _proto.merge = function merge(other) {
    var _this5 = this;
    if (isObservableMap(other)) {
      other = new Map(other);
    }
    transaction(function() {
      if (isPlainObject(other)) {
        getPlainObjectKeys(other).forEach(function(key) {
          return _this5.set(key, other[key]);
        });
      } else if (Array.isArray(other)) {
        other.forEach(function(_ref) {
          var key = _ref[0], value = _ref[1];
          return _this5.set(key, value);
        });
      } else if (isES6Map(other)) {
        if (other.constructor !== Map) {
          die(19, other);
        }
        other.forEach(function(value, key) {
          return _this5.set(key, value);
        });
      } else if (other !== null && other !== void 0) {
        die(20, other);
      }
    });
    return this;
  };
  _proto.clear = function clear2() {
    var _this6 = this;
    transaction(function() {
      untracked(function() {
        for (var _iterator2 = _createForOfIteratorHelperLoose(_this6.keys()), _step2; !(_step2 = _iterator2()).done; ) {
          var key = _step2.value;
          _this6["delete"](key);
        }
      });
    });
  };
  _proto.replace = function replace2(values) {
    var _this7 = this;
    transaction(function() {
      var replacementMap = convertToMap(values);
      var orderedData = /* @__PURE__ */ new Map();
      var keysReportChangedCalled = false;
      for (var _iterator3 = _createForOfIteratorHelperLoose(_this7.data_.keys()), _step3; !(_step3 = _iterator3()).done; ) {
        var key = _step3.value;
        if (!replacementMap.has(key)) {
          var deleted = _this7["delete"](key);
          if (deleted) {
            keysReportChangedCalled = true;
          } else {
            var value = _this7.data_.get(key);
            orderedData.set(key, value);
          }
        }
      }
      for (var _iterator4 = _createForOfIteratorHelperLoose(replacementMap.entries()), _step4; !(_step4 = _iterator4()).done; ) {
        var _step4$value = _step4.value, _key = _step4$value[0], _value = _step4$value[1];
        var keyExisted = _this7.data_.has(_key);
        _this7.set(_key, _value);
        if (_this7.data_.has(_key)) {
          var _value2 = _this7.data_.get(_key);
          orderedData.set(_key, _value2);
          if (!keyExisted) {
            keysReportChangedCalled = true;
          }
        }
      }
      if (!keysReportChangedCalled) {
        if (_this7.data_.size !== orderedData.size) {
          _this7.keysAtom_.reportChanged();
        } else {
          var iter1 = _this7.data_.keys();
          var iter2 = orderedData.keys();
          var next1 = iter1.next();
          var next2 = iter2.next();
          while (!next1.done) {
            if (next1.value !== next2.value) {
              _this7.keysAtom_.reportChanged();
              break;
            }
            next1 = iter1.next();
            next2 = iter2.next();
          }
        }
      }
      _this7.data_ = orderedData;
    });
    return this;
  };
  _proto.toString = function toString2() {
    return "[object ObservableMap]";
  };
  _proto.toJSON = function toJSON2() {
    return Array.from(this);
  };
  _proto.observe_ = function observe_(listener, fireImmediately) {
    if (process.env.NODE_ENV !== "production" && fireImmediately === true) {
      die("`observe` doesn't support fireImmediately=true in combination with maps.");
    }
    return registerListener(this, listener);
  };
  _proto.intercept_ = function intercept_(handler) {
    return registerInterceptor(this, handler);
  };
  _createClass(ObservableMap2, [{
    key: "size",
    get: function get3() {
      this.keysAtom_.reportObserved();
      return this.data_.size;
    }
  }, {
    key: _Symbol$toStringTag,
    get: function get3() {
      return "Map";
    }
  }]);
  return ObservableMap2;
}();
var isObservableMap = /* @__PURE__ */ createInstanceofPredicate("ObservableMap", ObservableMap);
function convertToMap(dataStructure) {
  if (isES6Map(dataStructure) || isObservableMap(dataStructure)) {
    return dataStructure;
  } else if (Array.isArray(dataStructure)) {
    return new Map(dataStructure);
  } else if (isPlainObject(dataStructure)) {
    var map2 = /* @__PURE__ */ new Map();
    for (var key in dataStructure) {
      map2.set(key, dataStructure[key]);
    }
    return map2;
  } else {
    return die(21, dataStructure);
  }
}
var _Symbol$iterator$1, _Symbol$toStringTag$1;
var ObservableSetMarker = {};
_Symbol$iterator$1 = Symbol.iterator;
_Symbol$toStringTag$1 = Symbol.toStringTag;
var ObservableSet = /* @__PURE__ */ function() {
  function ObservableSet2(initialData, enhancer, name_) {
    var _this = this;
    if (enhancer === void 0) {
      enhancer = deepEnhancer;
    }
    if (name_ === void 0) {
      name_ = process.env.NODE_ENV !== "production" ? "ObservableSet@" + getNextId() : "ObservableSet";
    }
    this.name_ = void 0;
    this[$mobx] = ObservableSetMarker;
    this.data_ = /* @__PURE__ */ new Set();
    this.atom_ = void 0;
    this.changeListeners_ = void 0;
    this.interceptors_ = void 0;
    this.dehancer = void 0;
    this.enhancer_ = void 0;
    this.name_ = name_;
    if (!isFunction(Set)) {
      die(22);
    }
    this.enhancer_ = function(newV, oldV) {
      return enhancer(newV, oldV, name_);
    };
    initObservable(function() {
      _this.atom_ = createAtom(_this.name_);
      if (initialData) {
        _this.replace(initialData);
      }
    });
  }
  var _proto = ObservableSet2.prototype;
  _proto.dehanceValue_ = function dehanceValue_(value) {
    if (this.dehancer !== void 0) {
      return this.dehancer(value);
    }
    return value;
  };
  _proto.clear = function clear2() {
    var _this2 = this;
    transaction(function() {
      untracked(function() {
        for (var _iterator = _createForOfIteratorHelperLoose(_this2.data_.values()), _step; !(_step = _iterator()).done; ) {
          var value = _step.value;
          _this2["delete"](value);
        }
      });
    });
  };
  _proto.forEach = function forEach(callbackFn, thisArg) {
    for (var _iterator2 = _createForOfIteratorHelperLoose(this), _step2; !(_step2 = _iterator2()).done; ) {
      var value = _step2.value;
      callbackFn.call(thisArg, value, value, this);
    }
  };
  _proto.add = function add(value) {
    var _this3 = this;
    checkIfStateModificationsAreAllowed(this.atom_);
    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        type: ADD,
        object: this,
        newValue: value
      });
      if (!change) {
        return this;
      }
    }
    if (!this.has(value)) {
      transaction(function() {
        _this3.data_.add(_this3.enhancer_(value, void 0));
        _this3.atom_.reportChanged();
      });
      var notifySpy = process.env.NODE_ENV !== "production" && isSpyEnabled();
      var notify = hasListeners(this);
      var _change = notify || notifySpy ? {
        observableKind: "set",
        debugObjectName: this.name_,
        type: ADD,
        object: this,
        newValue: value
      } : null;
      if (notifySpy && process.env.NODE_ENV !== "production") {
        spyReportStart(_change);
      }
      if (notify) {
        notifyListeners(this, _change);
      }
      if (notifySpy && process.env.NODE_ENV !== "production") {
        spyReportEnd();
      }
    }
    return this;
  };
  _proto["delete"] = function _delete(value) {
    var _this4 = this;
    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        type: DELETE$1,
        object: this,
        oldValue: value
      });
      if (!change) {
        return false;
      }
    }
    if (this.has(value)) {
      var notifySpy = process.env.NODE_ENV !== "production" && isSpyEnabled();
      var notify = hasListeners(this);
      var _change2 = notify || notifySpy ? {
        observableKind: "set",
        debugObjectName: this.name_,
        type: DELETE$1,
        object: this,
        oldValue: value
      } : null;
      if (notifySpy && process.env.NODE_ENV !== "production") {
        spyReportStart(_change2);
      }
      transaction(function() {
        _this4.atom_.reportChanged();
        _this4.data_["delete"](value);
      });
      if (notify) {
        notifyListeners(this, _change2);
      }
      if (notifySpy && process.env.NODE_ENV !== "production") {
        spyReportEnd();
      }
      return true;
    }
    return false;
  };
  _proto.has = function has2(value) {
    this.atom_.reportObserved();
    return this.data_.has(this.dehanceValue_(value));
  };
  _proto.entries = function entries() {
    var nextIndex = 0;
    var keys = Array.from(this.keys());
    var values = Array.from(this.values());
    return makeIterable({
      next: function next() {
        var index = nextIndex;
        nextIndex += 1;
        return index < values.length ? {
          value: [keys[index], values[index]],
          done: false
        } : {
          done: true
        };
      }
    });
  };
  _proto.keys = function keys() {
    return this.values();
  };
  _proto.values = function values() {
    this.atom_.reportObserved();
    var self2 = this;
    var nextIndex = 0;
    var observableValues = Array.from(this.data_.values());
    return makeIterable({
      next: function next() {
        return nextIndex < observableValues.length ? {
          value: self2.dehanceValue_(observableValues[nextIndex++]),
          done: false
        } : {
          done: true
        };
      }
    });
  };
  _proto.replace = function replace2(other) {
    var _this5 = this;
    if (isObservableSet(other)) {
      other = new Set(other);
    }
    transaction(function() {
      if (Array.isArray(other)) {
        _this5.clear();
        other.forEach(function(value) {
          return _this5.add(value);
        });
      } else if (isES6Set(other)) {
        _this5.clear();
        other.forEach(function(value) {
          return _this5.add(value);
        });
      } else if (other !== null && other !== void 0) {
        die("Cannot initialize set from " + other);
      }
    });
    return this;
  };
  _proto.observe_ = function observe_(listener, fireImmediately) {
    if (process.env.NODE_ENV !== "production" && fireImmediately === true) {
      die("`observe` doesn't support fireImmediately=true in combination with sets.");
    }
    return registerListener(this, listener);
  };
  _proto.intercept_ = function intercept_(handler) {
    return registerInterceptor(this, handler);
  };
  _proto.toJSON = function toJSON2() {
    return Array.from(this);
  };
  _proto.toString = function toString2() {
    return "[object ObservableSet]";
  };
  _proto[_Symbol$iterator$1] = function() {
    return this.values();
  };
  _createClass(ObservableSet2, [{
    key: "size",
    get: function get3() {
      this.atom_.reportObserved();
      return this.data_.size;
    }
  }, {
    key: _Symbol$toStringTag$1,
    get: function get3() {
      return "Set";
    }
  }]);
  return ObservableSet2;
}();
var isObservableSet = /* @__PURE__ */ createInstanceofPredicate("ObservableSet", ObservableSet);
var descriptorCache = /* @__PURE__ */ Object.create(null);
var REMOVE = "remove";
var ObservableObjectAdministration = /* @__PURE__ */ function() {
  function ObservableObjectAdministration2(target_, values_, name_, defaultAnnotation_) {
    if (values_ === void 0) {
      values_ = /* @__PURE__ */ new Map();
    }
    if (defaultAnnotation_ === void 0) {
      defaultAnnotation_ = autoAnnotation;
    }
    this.target_ = void 0;
    this.values_ = void 0;
    this.name_ = void 0;
    this.defaultAnnotation_ = void 0;
    this.keysAtom_ = void 0;
    this.changeListeners_ = void 0;
    this.interceptors_ = void 0;
    this.proxy_ = void 0;
    this.isPlainObject_ = void 0;
    this.appliedAnnotations_ = void 0;
    this.pendingKeys_ = void 0;
    this.target_ = target_;
    this.values_ = values_;
    this.name_ = name_;
    this.defaultAnnotation_ = defaultAnnotation_;
    this.keysAtom_ = new Atom(process.env.NODE_ENV !== "production" ? this.name_ + ".keys" : "ObservableObject.keys");
    this.isPlainObject_ = isPlainObject(this.target_);
    if (process.env.NODE_ENV !== "production" && !isAnnotation(this.defaultAnnotation_)) {
      die("defaultAnnotation must be valid annotation");
    }
    if (process.env.NODE_ENV !== "production") {
      this.appliedAnnotations_ = {};
    }
  }
  var _proto = ObservableObjectAdministration2.prototype;
  _proto.getObservablePropValue_ = function getObservablePropValue_(key) {
    return this.values_.get(key).get();
  };
  _proto.setObservablePropValue_ = function setObservablePropValue_(key, newValue) {
    var observable2 = this.values_.get(key);
    if (observable2 instanceof ComputedValue) {
      observable2.set(newValue);
      return true;
    }
    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        type: UPDATE,
        object: this.proxy_ || this.target_,
        name: key,
        newValue
      });
      if (!change) {
        return null;
      }
      newValue = change.newValue;
    }
    newValue = observable2.prepareNewValue_(newValue);
    if (newValue !== globalState.UNCHANGED) {
      var notify = hasListeners(this);
      var notifySpy = process.env.NODE_ENV !== "production" && isSpyEnabled();
      var _change = notify || notifySpy ? {
        type: UPDATE,
        observableKind: "object",
        debugObjectName: this.name_,
        object: this.proxy_ || this.target_,
        oldValue: observable2.value_,
        name: key,
        newValue
      } : null;
      if (process.env.NODE_ENV !== "production" && notifySpy) {
        spyReportStart(_change);
      }
      observable2.setNewValue_(newValue);
      if (notify) {
        notifyListeners(this, _change);
      }
      if (process.env.NODE_ENV !== "production" && notifySpy) {
        spyReportEnd();
      }
    }
    return true;
  };
  _proto.get_ = function get_(key) {
    if (globalState.trackingDerivation && !hasProp(this.target_, key)) {
      this.has_(key);
    }
    return this.target_[key];
  };
  _proto.set_ = function set_(key, value, proxyTrap) {
    if (proxyTrap === void 0) {
      proxyTrap = false;
    }
    if (hasProp(this.target_, key)) {
      if (this.values_.has(key)) {
        return this.setObservablePropValue_(key, value);
      } else if (proxyTrap) {
        return Reflect.set(this.target_, key, value);
      } else {
        this.target_[key] = value;
        return true;
      }
    } else {
      return this.extend_(key, {
        value,
        enumerable: true,
        writable: true,
        configurable: true
      }, this.defaultAnnotation_, proxyTrap);
    }
  };
  _proto.has_ = function has_(key) {
    if (!globalState.trackingDerivation) {
      return key in this.target_;
    }
    this.pendingKeys_ || (this.pendingKeys_ = /* @__PURE__ */ new Map());
    var entry = this.pendingKeys_.get(key);
    if (!entry) {
      entry = new ObservableValue(key in this.target_, referenceEnhancer, process.env.NODE_ENV !== "production" ? this.name_ + "." + stringifyKey(key) + "?" : "ObservableObject.key?", false);
      this.pendingKeys_.set(key, entry);
    }
    return entry.get();
  };
  _proto.make_ = function make_(key, annotation) {
    if (annotation === true) {
      annotation = this.defaultAnnotation_;
    }
    if (annotation === false) {
      return;
    }
    assertAnnotable(this, annotation, key);
    if (!(key in this.target_)) {
      var _this$target_$storedA;
      if ((_this$target_$storedA = this.target_[storedAnnotationsSymbol]) != null && _this$target_$storedA[key]) {
        return;
      } else {
        die(1, annotation.annotationType_, this.name_ + "." + key.toString());
      }
    }
    var source = this.target_;
    while (source && source !== objectPrototype) {
      var descriptor = getDescriptor(source, key);
      if (descriptor) {
        var outcome = annotation.make_(this, key, descriptor, source);
        if (outcome === 0) {
          return;
        }
        if (outcome === 1) {
          break;
        }
      }
      source = Object.getPrototypeOf(source);
    }
    recordAnnotationApplied(this, annotation, key);
  };
  _proto.extend_ = function extend_(key, descriptor, annotation, proxyTrap) {
    if (proxyTrap === void 0) {
      proxyTrap = false;
    }
    if (annotation === true) {
      annotation = this.defaultAnnotation_;
    }
    if (annotation === false) {
      return this.defineProperty_(key, descriptor, proxyTrap);
    }
    assertAnnotable(this, annotation, key);
    var outcome = annotation.extend_(this, key, descriptor, proxyTrap);
    if (outcome) {
      recordAnnotationApplied(this, annotation, key);
    }
    return outcome;
  };
  _proto.defineProperty_ = function defineProperty_(key, descriptor, proxyTrap) {
    if (proxyTrap === void 0) {
      proxyTrap = false;
    }
    checkIfStateModificationsAreAllowed(this.keysAtom_);
    try {
      startBatch();
      var deleteOutcome = this.delete_(key);
      if (!deleteOutcome) {
        return deleteOutcome;
      }
      if (hasInterceptors(this)) {
        var change = interceptChange(this, {
          object: this.proxy_ || this.target_,
          name: key,
          type: ADD,
          newValue: descriptor.value
        });
        if (!change) {
          return null;
        }
        var newValue = change.newValue;
        if (descriptor.value !== newValue) {
          descriptor = _extends({}, descriptor, {
            value: newValue
          });
        }
      }
      if (proxyTrap) {
        if (!Reflect.defineProperty(this.target_, key, descriptor)) {
          return false;
        }
      } else {
        defineProperty(this.target_, key, descriptor);
      }
      this.notifyPropertyAddition_(key, descriptor.value);
    } finally {
      endBatch();
    }
    return true;
  };
  _proto.defineObservableProperty_ = function defineObservableProperty_(key, value, enhancer, proxyTrap) {
    if (proxyTrap === void 0) {
      proxyTrap = false;
    }
    checkIfStateModificationsAreAllowed(this.keysAtom_);
    try {
      startBatch();
      var deleteOutcome = this.delete_(key);
      if (!deleteOutcome) {
        return deleteOutcome;
      }
      if (hasInterceptors(this)) {
        var change = interceptChange(this, {
          object: this.proxy_ || this.target_,
          name: key,
          type: ADD,
          newValue: value
        });
        if (!change) {
          return null;
        }
        value = change.newValue;
      }
      var cachedDescriptor = getCachedObservablePropDescriptor(key);
      var descriptor = {
        configurable: globalState.safeDescriptors ? this.isPlainObject_ : true,
        enumerable: true,
        get: cachedDescriptor.get,
        set: cachedDescriptor.set
      };
      if (proxyTrap) {
        if (!Reflect.defineProperty(this.target_, key, descriptor)) {
          return false;
        }
      } else {
        defineProperty(this.target_, key, descriptor);
      }
      var observable2 = new ObservableValue(value, enhancer, process.env.NODE_ENV !== "production" ? this.name_ + "." + key.toString() : "ObservableObject.key", false);
      this.values_.set(key, observable2);
      this.notifyPropertyAddition_(key, observable2.value_);
    } finally {
      endBatch();
    }
    return true;
  };
  _proto.defineComputedProperty_ = function defineComputedProperty_(key, options, proxyTrap) {
    if (proxyTrap === void 0) {
      proxyTrap = false;
    }
    checkIfStateModificationsAreAllowed(this.keysAtom_);
    try {
      startBatch();
      var deleteOutcome = this.delete_(key);
      if (!deleteOutcome) {
        return deleteOutcome;
      }
      if (hasInterceptors(this)) {
        var change = interceptChange(this, {
          object: this.proxy_ || this.target_,
          name: key,
          type: ADD,
          newValue: void 0
        });
        if (!change) {
          return null;
        }
      }
      options.name || (options.name = process.env.NODE_ENV !== "production" ? this.name_ + "." + key.toString() : "ObservableObject.key");
      options.context = this.proxy_ || this.target_;
      var cachedDescriptor = getCachedObservablePropDescriptor(key);
      var descriptor = {
        configurable: globalState.safeDescriptors ? this.isPlainObject_ : true,
        enumerable: false,
        get: cachedDescriptor.get,
        set: cachedDescriptor.set
      };
      if (proxyTrap) {
        if (!Reflect.defineProperty(this.target_, key, descriptor)) {
          return false;
        }
      } else {
        defineProperty(this.target_, key, descriptor);
      }
      this.values_.set(key, new ComputedValue(options));
      this.notifyPropertyAddition_(key, void 0);
    } finally {
      endBatch();
    }
    return true;
  };
  _proto.delete_ = function delete_(key, proxyTrap) {
    if (proxyTrap === void 0) {
      proxyTrap = false;
    }
    checkIfStateModificationsAreAllowed(this.keysAtom_);
    if (!hasProp(this.target_, key)) {
      return true;
    }
    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        object: this.proxy_ || this.target_,
        name: key,
        type: REMOVE
      });
      if (!change) {
        return null;
      }
    }
    try {
      var _this$pendingKeys_, _this$pendingKeys_$ge;
      startBatch();
      var notify = hasListeners(this);
      var notifySpy = process.env.NODE_ENV !== "production" && isSpyEnabled();
      var observable2 = this.values_.get(key);
      var value = void 0;
      if (!observable2 && (notify || notifySpy)) {
        var _getDescriptor2;
        value = (_getDescriptor2 = getDescriptor(this.target_, key)) == null ? void 0 : _getDescriptor2.value;
      }
      if (proxyTrap) {
        if (!Reflect.deleteProperty(this.target_, key)) {
          return false;
        }
      } else {
        delete this.target_[key];
      }
      if (process.env.NODE_ENV !== "production") {
        delete this.appliedAnnotations_[key];
      }
      if (observable2) {
        this.values_["delete"](key);
        if (observable2 instanceof ObservableValue) {
          value = observable2.value_;
        }
        propagateChanged(observable2);
      }
      this.keysAtom_.reportChanged();
      (_this$pendingKeys_ = this.pendingKeys_) == null ? void 0 : (_this$pendingKeys_$ge = _this$pendingKeys_.get(key)) == null ? void 0 : _this$pendingKeys_$ge.set(key in this.target_);
      if (notify || notifySpy) {
        var _change2 = {
          type: REMOVE,
          observableKind: "object",
          object: this.proxy_ || this.target_,
          debugObjectName: this.name_,
          oldValue: value,
          name: key
        };
        if (process.env.NODE_ENV !== "production" && notifySpy) {
          spyReportStart(_change2);
        }
        if (notify) {
          notifyListeners(this, _change2);
        }
        if (process.env.NODE_ENV !== "production" && notifySpy) {
          spyReportEnd();
        }
      }
    } finally {
      endBatch();
    }
    return true;
  };
  _proto.observe_ = function observe_(callback, fireImmediately) {
    if (process.env.NODE_ENV !== "production" && fireImmediately === true) {
      die("`observe` doesn't support the fire immediately property for observable objects.");
    }
    return registerListener(this, callback);
  };
  _proto.intercept_ = function intercept_(handler) {
    return registerInterceptor(this, handler);
  };
  _proto.notifyPropertyAddition_ = function notifyPropertyAddition_(key, value) {
    var _this$pendingKeys_2, _this$pendingKeys_2$g;
    var notify = hasListeners(this);
    var notifySpy = process.env.NODE_ENV !== "production" && isSpyEnabled();
    if (notify || notifySpy) {
      var change = notify || notifySpy ? {
        type: ADD,
        observableKind: "object",
        debugObjectName: this.name_,
        object: this.proxy_ || this.target_,
        name: key,
        newValue: value
      } : null;
      if (process.env.NODE_ENV !== "production" && notifySpy) {
        spyReportStart(change);
      }
      if (notify) {
        notifyListeners(this, change);
      }
      if (process.env.NODE_ENV !== "production" && notifySpy) {
        spyReportEnd();
      }
    }
    (_this$pendingKeys_2 = this.pendingKeys_) == null ? void 0 : (_this$pendingKeys_2$g = _this$pendingKeys_2.get(key)) == null ? void 0 : _this$pendingKeys_2$g.set(true);
    this.keysAtom_.reportChanged();
  };
  _proto.ownKeys_ = function ownKeys_() {
    this.keysAtom_.reportObserved();
    return ownKeys(this.target_);
  };
  _proto.keys_ = function keys_() {
    this.keysAtom_.reportObserved();
    return Object.keys(this.target_);
  };
  return ObservableObjectAdministration2;
}();
function asObservableObject(target, options) {
  var _options$name;
  if (process.env.NODE_ENV !== "production" && options && isObservableObject(target)) {
    die("Options can't be provided for already observable objects.");
  }
  if (hasProp(target, $mobx)) {
    if (process.env.NODE_ENV !== "production" && !(getAdministration(target) instanceof ObservableObjectAdministration)) {
      die("Cannot convert '" + getDebugName(target) + "' into observable object:\nThe target is already observable of different type.\nExtending builtins is not supported.");
    }
    return target;
  }
  if (process.env.NODE_ENV !== "production" && !Object.isExtensible(target)) {
    die("Cannot make the designated object observable; it is not extensible");
  }
  var name = (_options$name = options == null ? void 0 : options.name) != null ? _options$name : process.env.NODE_ENV !== "production" ? (isPlainObject(target) ? "ObservableObject" : target.constructor.name) + "@" + getNextId() : "ObservableObject";
  var adm = new ObservableObjectAdministration(target, /* @__PURE__ */ new Map(), String(name), getAnnotationFromOptions(options));
  addHiddenProp(target, $mobx, adm);
  return target;
}
var isObservableObjectAdministration = /* @__PURE__ */ createInstanceofPredicate("ObservableObjectAdministration", ObservableObjectAdministration);
function getCachedObservablePropDescriptor(key) {
  return descriptorCache[key] || (descriptorCache[key] = {
    get: function get3() {
      return this[$mobx].getObservablePropValue_(key);
    },
    set: function set4(value) {
      return this[$mobx].setObservablePropValue_(key, value);
    }
  });
}
function isObservableObject(thing) {
  if (isObject(thing)) {
    return isObservableObjectAdministration(thing[$mobx]);
  }
  return false;
}
function recordAnnotationApplied(adm, annotation, key) {
  var _adm$target_$storedAn;
  if (process.env.NODE_ENV !== "production") {
    adm.appliedAnnotations_[key] = annotation;
  }
  (_adm$target_$storedAn = adm.target_[storedAnnotationsSymbol]) == null ? true : delete _adm$target_$storedAn[key];
}
function assertAnnotable(adm, annotation, key) {
  if (process.env.NODE_ENV !== "production" && !isAnnotation(annotation)) {
    die("Cannot annotate '" + adm.name_ + "." + key.toString() + "': Invalid annotation.");
  }
  if (process.env.NODE_ENV !== "production" && !isOverride(annotation) && hasProp(adm.appliedAnnotations_, key)) {
    var fieldName = adm.name_ + "." + key.toString();
    var currentAnnotationType = adm.appliedAnnotations_[key].annotationType_;
    var requestedAnnotationType = annotation.annotationType_;
    die("Cannot apply '" + requestedAnnotationType + "' to '" + fieldName + "':" + ("\nThe field is already annotated with '" + currentAnnotationType + "'.") + "\nRe-annotating fields is not allowed.\nUse 'override' annotation for methods overridden by subclass.");
  }
}
var ENTRY_0 = /* @__PURE__ */ createArrayEntryDescriptor(0);
var safariPrototypeSetterInheritanceBug = /* @__PURE__ */ function() {
  var v = false;
  var p = {};
  Object.defineProperty(p, "0", {
    set: function set4() {
      v = true;
    }
  });
  Object.create(p)["0"] = 1;
  return v === false;
}();
var OBSERVABLE_ARRAY_BUFFER_SIZE = 0;
var StubArray = function StubArray2() {
};
function inherit(ctor, proto) {
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ctor.prototype, proto);
  } else if (ctor.prototype.__proto__ !== void 0) {
    ctor.prototype.__proto__ = proto;
  } else {
    ctor.prototype = proto;
  }
}
inherit(StubArray, Array.prototype);
var LegacyObservableArray = /* @__PURE__ */ function(_StubArray, _Symbol$toStringTag2, _Symbol$iterator2) {
  _inheritsLoose(LegacyObservableArray2, _StubArray);
  function LegacyObservableArray2(initialValues, enhancer, name, owned) {
    var _this;
    if (name === void 0) {
      name = process.env.NODE_ENV !== "production" ? "ObservableArray@" + getNextId() : "ObservableArray";
    }
    if (owned === void 0) {
      owned = false;
    }
    _this = _StubArray.call(this) || this;
    initObservable(function() {
      var adm = new ObservableArrayAdministration(name, enhancer, owned, true);
      adm.proxy_ = _assertThisInitialized(_this);
      addHiddenFinalProp(_assertThisInitialized(_this), $mobx, adm);
      if (initialValues && initialValues.length) {
        _this.spliceWithArray(0, 0, initialValues);
      }
      if (safariPrototypeSetterInheritanceBug) {
        Object.defineProperty(_assertThisInitialized(_this), "0", ENTRY_0);
      }
    });
    return _this;
  }
  var _proto = LegacyObservableArray2.prototype;
  _proto.concat = function concat() {
    this[$mobx].atom_.reportObserved();
    for (var _len = arguments.length, arrays = new Array(_len), _key = 0; _key < _len; _key++) {
      arrays[_key] = arguments[_key];
    }
    return Array.prototype.concat.apply(
      this.slice(),
      //@ts-ignore
      arrays.map(function(a) {
        return isObservableArray(a) ? a.slice() : a;
      })
    );
  };
  _proto[_Symbol$iterator2] = function() {
    var self2 = this;
    var nextIndex = 0;
    return makeIterable({
      next: function next() {
        return nextIndex < self2.length ? {
          value: self2[nextIndex++],
          done: false
        } : {
          done: true,
          value: void 0
        };
      }
    });
  };
  _createClass(LegacyObservableArray2, [{
    key: "length",
    get: function get3() {
      return this[$mobx].getArrayLength_();
    },
    set: function set4(newLength) {
      this[$mobx].setArrayLength_(newLength);
    }
  }, {
    key: _Symbol$toStringTag2,
    get: function get3() {
      return "Array";
    }
  }]);
  return LegacyObservableArray2;
}(StubArray, Symbol.toStringTag, Symbol.iterator);
Object.entries(arrayExtensions).forEach(function(_ref) {
  var prop = _ref[0], fn = _ref[1];
  if (prop !== "concat") {
    addHiddenProp(LegacyObservableArray.prototype, prop, fn);
  }
});
function createArrayEntryDescriptor(index) {
  return {
    enumerable: false,
    configurable: true,
    get: function get3() {
      return this[$mobx].get_(index);
    },
    set: function set4(value) {
      this[$mobx].set_(index, value);
    }
  };
}
function createArrayBufferItem(index) {
  defineProperty(LegacyObservableArray.prototype, "" + index, createArrayEntryDescriptor(index));
}
function reserveArrayBuffer(max) {
  if (max > OBSERVABLE_ARRAY_BUFFER_SIZE) {
    for (var index = OBSERVABLE_ARRAY_BUFFER_SIZE; index < max + 100; index++) {
      createArrayBufferItem(index);
    }
    OBSERVABLE_ARRAY_BUFFER_SIZE = max;
  }
}
reserveArrayBuffer(1e3);
function createLegacyArray(initialValues, enhancer, name) {
  return new LegacyObservableArray(initialValues, enhancer, name);
}
function getAtom(thing, property) {
  if (typeof thing === "object" && thing !== null) {
    if (isObservableArray(thing)) {
      if (property !== void 0) {
        die(23);
      }
      return thing[$mobx].atom_;
    }
    if (isObservableSet(thing)) {
      return thing.atom_;
    }
    if (isObservableMap(thing)) {
      if (property === void 0) {
        return thing.keysAtom_;
      }
      var observable2 = thing.data_.get(property) || thing.hasMap_.get(property);
      if (!observable2) {
        die(25, property, getDebugName(thing));
      }
      return observable2;
    }
    if (isObservableObject(thing)) {
      if (!property) {
        return die(26);
      }
      var _observable = thing[$mobx].values_.get(property);
      if (!_observable) {
        die(27, property, getDebugName(thing));
      }
      return _observable;
    }
    if (isAtom(thing) || isComputedValue(thing) || isReaction(thing)) {
      return thing;
    }
  } else if (isFunction(thing)) {
    if (isReaction(thing[$mobx])) {
      return thing[$mobx];
    }
  }
  die(28);
}
function getAdministration(thing, property) {
  if (!thing) {
    die(29);
  }
  if (property !== void 0) {
    return getAdministration(getAtom(thing, property));
  }
  if (isAtom(thing) || isComputedValue(thing) || isReaction(thing)) {
    return thing;
  }
  if (isObservableMap(thing) || isObservableSet(thing)) {
    return thing;
  }
  if (thing[$mobx]) {
    return thing[$mobx];
  }
  die(24, thing);
}
function getDebugName(thing, property) {
  var named;
  if (property !== void 0) {
    named = getAtom(thing, property);
  } else if (isAction(thing)) {
    return thing.name;
  } else if (isObservableObject(thing) || isObservableMap(thing) || isObservableSet(thing)) {
    named = getAdministration(thing);
  } else {
    named = getAtom(thing);
  }
  return named.name_;
}
function initObservable(cb) {
  var derivation = untrackedStart();
  var allowStateChanges = allowStateChangesStart(true);
  startBatch();
  try {
    return cb();
  } finally {
    endBatch();
    allowStateChangesEnd(allowStateChanges);
    untrackedEnd(derivation);
  }
}
var toString = objectPrototype.toString;
function deepEqual(a, b, depth) {
  if (depth === void 0) {
    depth = -1;
  }
  return eq(a, b, depth);
}
function eq(a, b, depth, aStack, bStack) {
  if (a === b) {
    return a !== 0 || 1 / a === 1 / b;
  }
  if (a == null || b == null) {
    return false;
  }
  if (a !== a) {
    return b !== b;
  }
  var type = typeof a;
  if (type !== "function" && type !== "object" && typeof b != "object") {
    return false;
  }
  var className = toString.call(a);
  if (className !== toString.call(b)) {
    return false;
  }
  switch (className) {
    case "[object RegExp]":
    case "[object String]":
      return "" + a === "" + b;
    case "[object Number]":
      if (+a !== +a) {
        return +b !== +b;
      }
      return +a === 0 ? 1 / +a === 1 / b : +a === +b;
    case "[object Date]":
    case "[object Boolean]":
      return +a === +b;
    case "[object Symbol]":
      return typeof Symbol !== "undefined" && Symbol.valueOf.call(a) === Symbol.valueOf.call(b);
    case "[object Map]":
    case "[object Set]":
      if (depth >= 0) {
        depth++;
      }
      break;
  }
  a = unwrap(a);
  b = unwrap(b);
  var areArrays = className === "[object Array]";
  if (!areArrays) {
    if (typeof a != "object" || typeof b != "object") {
      return false;
    }
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor && isFunction(bCtor) && bCtor instanceof bCtor) && "constructor" in a && "constructor" in b) {
      return false;
    }
  }
  if (depth === 0) {
    return false;
  } else if (depth < 0) {
    depth = -1;
  }
  aStack = aStack || [];
  bStack = bStack || [];
  var length = aStack.length;
  while (length--) {
    if (aStack[length] === a) {
      return bStack[length] === b;
    }
  }
  aStack.push(a);
  bStack.push(b);
  if (areArrays) {
    length = a.length;
    if (length !== b.length) {
      return false;
    }
    while (length--) {
      if (!eq(a[length], b[length], depth - 1, aStack, bStack)) {
        return false;
      }
    }
  } else {
    var keys = Object.keys(a);
    var key;
    length = keys.length;
    if (Object.keys(b).length !== length) {
      return false;
    }
    while (length--) {
      key = keys[length];
      if (!(hasProp(b, key) && eq(a[key], b[key], depth - 1, aStack, bStack))) {
        return false;
      }
    }
  }
  aStack.pop();
  bStack.pop();
  return true;
}
function unwrap(a) {
  if (isObservableArray(a)) {
    return a.slice();
  }
  if (isES6Map(a) || isObservableMap(a)) {
    return Array.from(a.entries());
  }
  if (isES6Set(a) || isObservableSet(a)) {
    return Array.from(a.entries());
  }
  return a;
}
function makeIterable(iterator) {
  iterator[Symbol.iterator] = getSelf;
  return iterator;
}
function getSelf() {
  return this;
}
function isAnnotation(thing) {
  return (
    // Can be function
    thing instanceof Object && typeof thing.annotationType_ === "string" && isFunction(thing.make_) && isFunction(thing.extend_)
  );
}
["Symbol", "Map", "Set"].forEach(function(m) {
  var g = getGlobal();
  if (typeof g[m] === "undefined") {
    die("MobX requires global '" + m + "' to be available or polyfilled");
  }
});
if (typeof __MOBX_DEVTOOLS_GLOBAL_HOOK__ === "object") {
  __MOBX_DEVTOOLS_GLOBAL_HOOK__.injectMobx({
    spy,
    extras: {
      getDebugName
    },
    $mobx
  });
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var Reflect$1;
(function(Reflect2) {
  (function(factory) {
    var root = typeof globalThis === "object" ? globalThis : typeof commonjsGlobal === "object" ? commonjsGlobal : typeof self === "object" ? self : typeof this === "object" ? this : sloppyModeThis();
    var exporter = makeExporter(Reflect2);
    if (typeof root.Reflect !== "undefined") {
      exporter = makeExporter(root.Reflect, exporter);
    }
    factory(exporter, root);
    if (typeof root.Reflect === "undefined") {
      root.Reflect = Reflect2;
    }
    function makeExporter(target, previous) {
      return function(key, value) {
        Object.defineProperty(target, key, { configurable: true, writable: true, value });
        if (previous)
          previous(key, value);
      };
    }
    function functionThis() {
      try {
        return Function("return this;")();
      } catch (_14) {
      }
    }
    function indirectEvalThis() {
      try {
        return (void 0, eval)("(function() { return this; })()");
      } catch (_14) {
      }
    }
    function sloppyModeThis() {
      return functionThis() || indirectEvalThis();
    }
  })(function(exporter, root) {
    var hasOwn = Object.prototype.hasOwnProperty;
    var supportsSymbol = typeof Symbol === "function";
    var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
    var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
    var supportsCreate = typeof Object.create === "function";
    var supportsProto = { __proto__: [] } instanceof Array;
    var downLevel = !supportsCreate && !supportsProto;
    var HashMap = {
      // create an object in dictionary mode (a.k.a. "slow" mode in v8)
      create: supportsCreate ? function() {
        return MakeDictionary(/* @__PURE__ */ Object.create(null));
      } : supportsProto ? function() {
        return MakeDictionary({ __proto__: null });
      } : function() {
        return MakeDictionary({});
      },
      has: downLevel ? function(map2, key) {
        return hasOwn.call(map2, key);
      } : function(map2, key) {
        return key in map2;
      },
      get: downLevel ? function(map2, key) {
        return hasOwn.call(map2, key) ? map2[key] : void 0;
      } : function(map2, key) {
        return map2[key];
      }
    };
    var functionPrototype = Object.getPrototypeOf(Function);
    var _Map = typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
    var _Set = typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
    var _WeakMap = typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
    var registrySymbol = supportsSymbol ? Symbol.for("@reflect-metadata:registry") : void 0;
    var metadataRegistry = GetOrCreateMetadataRegistry();
    var metadataProvider = CreateMetadataProvider(metadataRegistry);
    function decorate(decorators, target, propertyKey, attributes) {
      if (!IsUndefined(propertyKey)) {
        if (!IsArray(decorators))
          throw new TypeError();
        if (!IsObject(target))
          throw new TypeError();
        if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
          throw new TypeError();
        if (IsNull(attributes))
          attributes = void 0;
        propertyKey = ToPropertyKey(propertyKey);
        return DecorateProperty(decorators, target, propertyKey, attributes);
      } else {
        if (!IsArray(decorators))
          throw new TypeError();
        if (!IsConstructor(target))
          throw new TypeError();
        return DecorateConstructor(decorators, target);
      }
    }
    exporter("decorate", decorate);
    function metadata(metadataKey, metadataValue) {
      function decorator(target, propertyKey) {
        if (!IsObject(target))
          throw new TypeError();
        if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
          throw new TypeError();
        OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
      }
      return decorator;
    }
    exporter("metadata", metadata);
    function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
    }
    exporter("defineMetadata", defineMetadata);
    function hasMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryHasMetadata(metadataKey, target, propertyKey);
    }
    exporter("hasMetadata", hasMetadata);
    function hasOwnMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
    }
    exporter("hasOwnMetadata", hasOwnMetadata);
    function getMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryGetMetadata(metadataKey, target, propertyKey);
    }
    exporter("getMetadata", getMetadata);
    function getOwnMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
    }
    exporter("getOwnMetadata", getOwnMetadata);
    function getMetadataKeys(target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryMetadataKeys(target, propertyKey);
    }
    exporter("getMetadataKeys", getMetadataKeys);
    function getOwnMetadataKeys(target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryOwnMetadataKeys(target, propertyKey);
    }
    exporter("getOwnMetadataKeys", getOwnMetadataKeys);
    function deleteMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      var provider = GetMetadataProvider(
        target,
        propertyKey,
        /*Create*/
        false
      );
      if (IsUndefined(provider))
        return false;
      return provider.OrdinaryDeleteMetadata(metadataKey, target, propertyKey);
    }
    exporter("deleteMetadata", deleteMetadata);
    function DecorateConstructor(decorators, target) {
      for (var i = decorators.length - 1; i >= 0; --i) {
        var decorator = decorators[i];
        var decorated = decorator(target);
        if (!IsUndefined(decorated) && !IsNull(decorated)) {
          if (!IsConstructor(decorated))
            throw new TypeError();
          target = decorated;
        }
      }
      return target;
    }
    function DecorateProperty(decorators, target, propertyKey, descriptor) {
      for (var i = decorators.length - 1; i >= 0; --i) {
        var decorator = decorators[i];
        var decorated = decorator(target, propertyKey, descriptor);
        if (!IsUndefined(decorated) && !IsNull(decorated)) {
          if (!IsObject(decorated))
            throw new TypeError();
          descriptor = decorated;
        }
      }
      return descriptor;
    }
    function OrdinaryHasMetadata(MetadataKey, O, P) {
      var hasOwn2 = OrdinaryHasOwnMetadata(MetadataKey, O, P);
      if (hasOwn2)
        return true;
      var parent = OrdinaryGetPrototypeOf(O);
      if (!IsNull(parent))
        return OrdinaryHasMetadata(MetadataKey, parent, P);
      return false;
    }
    function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
      var provider = GetMetadataProvider(
        O,
        P,
        /*Create*/
        false
      );
      if (IsUndefined(provider))
        return false;
      return ToBoolean(provider.OrdinaryHasOwnMetadata(MetadataKey, O, P));
    }
    function OrdinaryGetMetadata(MetadataKey, O, P) {
      var hasOwn2 = OrdinaryHasOwnMetadata(MetadataKey, O, P);
      if (hasOwn2)
        return OrdinaryGetOwnMetadata(MetadataKey, O, P);
      var parent = OrdinaryGetPrototypeOf(O);
      if (!IsNull(parent))
        return OrdinaryGetMetadata(MetadataKey, parent, P);
      return void 0;
    }
    function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
      var provider = GetMetadataProvider(
        O,
        P,
        /*Create*/
        false
      );
      if (IsUndefined(provider))
        return;
      return provider.OrdinaryGetOwnMetadata(MetadataKey, O, P);
    }
    function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
      var provider = GetMetadataProvider(
        O,
        P,
        /*Create*/
        true
      );
      provider.OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P);
    }
    function OrdinaryMetadataKeys(O, P) {
      var ownKeys3 = OrdinaryOwnMetadataKeys(O, P);
      var parent = OrdinaryGetPrototypeOf(O);
      if (parent === null)
        return ownKeys3;
      var parentKeys = OrdinaryMetadataKeys(parent, P);
      if (parentKeys.length <= 0)
        return ownKeys3;
      if (ownKeys3.length <= 0)
        return parentKeys;
      var set4 = new _Set();
      var keys = [];
      for (var _i = 0, ownKeys_1 = ownKeys3; _i < ownKeys_1.length; _i++) {
        var key = ownKeys_1[_i];
        var hasKey = set4.has(key);
        if (!hasKey) {
          set4.add(key);
          keys.push(key);
        }
      }
      for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
        var key = parentKeys_1[_a];
        var hasKey = set4.has(key);
        if (!hasKey) {
          set4.add(key);
          keys.push(key);
        }
      }
      return keys;
    }
    function OrdinaryOwnMetadataKeys(O, P) {
      var provider = GetMetadataProvider(
        O,
        P,
        /*create*/
        false
      );
      if (!provider) {
        return [];
      }
      return provider.OrdinaryOwnMetadataKeys(O, P);
    }
    function Type(x) {
      if (x === null)
        return 1;
      switch (typeof x) {
        case "undefined":
          return 0;
        case "boolean":
          return 2;
        case "string":
          return 3;
        case "symbol":
          return 4;
        case "number":
          return 5;
        case "object":
          return x === null ? 1 : 6;
        default:
          return 6;
      }
    }
    function IsUndefined(x) {
      return x === void 0;
    }
    function IsNull(x) {
      return x === null;
    }
    function IsSymbol(x) {
      return typeof x === "symbol";
    }
    function IsObject(x) {
      return typeof x === "object" ? x !== null : typeof x === "function";
    }
    function ToPrimitive(input, PreferredType) {
      switch (Type(input)) {
        case 0:
          return input;
        case 1:
          return input;
        case 2:
          return input;
        case 3:
          return input;
        case 4:
          return input;
        case 5:
          return input;
      }
      var hint = "string";
      var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
      if (exoticToPrim !== void 0) {
        var result = exoticToPrim.call(input, hint);
        if (IsObject(result))
          throw new TypeError();
        return result;
      }
      return OrdinaryToPrimitive(input);
    }
    function OrdinaryToPrimitive(O, hint) {
      var valueOf, result;
      {
        var toString_1 = O.toString;
        if (IsCallable(toString_1)) {
          var result = toString_1.call(O);
          if (!IsObject(result))
            return result;
        }
        var valueOf = O.valueOf;
        if (IsCallable(valueOf)) {
          var result = valueOf.call(O);
          if (!IsObject(result))
            return result;
        }
      }
      throw new TypeError();
    }
    function ToBoolean(argument) {
      return !!argument;
    }
    function ToString(argument) {
      return "" + argument;
    }
    function ToPropertyKey(argument) {
      var key = ToPrimitive(argument);
      if (IsSymbol(key))
        return key;
      return ToString(key);
    }
    function IsArray(argument) {
      return Array.isArray ? Array.isArray(argument) : argument instanceof Object ? argument instanceof Array : Object.prototype.toString.call(argument) === "[object Array]";
    }
    function IsCallable(argument) {
      return typeof argument === "function";
    }
    function IsConstructor(argument) {
      return typeof argument === "function";
    }
    function IsPropertyKey(argument) {
      switch (Type(argument)) {
        case 3:
          return true;
        case 4:
          return true;
        default:
          return false;
      }
    }
    function SameValueZero(x, y) {
      return x === y || x !== x && y !== y;
    }
    function GetMethod(V, P) {
      var func = V[P];
      if (func === void 0 || func === null)
        return void 0;
      if (!IsCallable(func))
        throw new TypeError();
      return func;
    }
    function GetIterator(obj) {
      var method = GetMethod(obj, iteratorSymbol);
      if (!IsCallable(method))
        throw new TypeError();
      var iterator = method.call(obj);
      if (!IsObject(iterator))
        throw new TypeError();
      return iterator;
    }
    function IteratorValue(iterResult) {
      return iterResult.value;
    }
    function IteratorStep(iterator) {
      var result = iterator.next();
      return result.done ? false : result;
    }
    function IteratorClose(iterator) {
      var f = iterator["return"];
      if (f)
        f.call(iterator);
    }
    function OrdinaryGetPrototypeOf(O) {
      var proto = Object.getPrototypeOf(O);
      if (typeof O !== "function" || O === functionPrototype)
        return proto;
      if (proto !== functionPrototype)
        return proto;
      var prototype = O.prototype;
      var prototypeProto = prototype && Object.getPrototypeOf(prototype);
      if (prototypeProto == null || prototypeProto === Object.prototype)
        return proto;
      var constructor = prototypeProto.constructor;
      if (typeof constructor !== "function")
        return proto;
      if (constructor === O)
        return proto;
      return constructor;
    }
    function CreateMetadataRegistry() {
      var fallback;
      if (!IsUndefined(registrySymbol) && typeof root.Reflect !== "undefined" && !(registrySymbol in root.Reflect) && typeof root.Reflect.defineMetadata === "function") {
        fallback = CreateFallbackProvider(root.Reflect);
      }
      var first;
      var second;
      var rest;
      var targetProviderMap = new _WeakMap();
      var registry = {
        registerProvider,
        getProvider,
        setProvider
      };
      return registry;
      function registerProvider(provider) {
        if (!Object.isExtensible(registry)) {
          throw new Error("Cannot add provider to a frozen registry.");
        }
        switch (true) {
          case fallback === provider:
            break;
          case IsUndefined(first):
            first = provider;
            break;
          case first === provider:
            break;
          case IsUndefined(second):
            second = provider;
            break;
          case second === provider:
            break;
          default:
            if (rest === void 0)
              rest = new _Set();
            rest.add(provider);
            break;
        }
      }
      function getProviderNoCache(O, P) {
        if (!IsUndefined(first)) {
          if (first.isProviderFor(O, P))
            return first;
          if (!IsUndefined(second)) {
            if (second.isProviderFor(O, P))
              return first;
            if (!IsUndefined(rest)) {
              var iterator = GetIterator(rest);
              while (true) {
                var next = IteratorStep(iterator);
                if (!next) {
                  return void 0;
                }
                var provider = IteratorValue(next);
                if (provider.isProviderFor(O, P)) {
                  IteratorClose(iterator);
                  return provider;
                }
              }
            }
          }
        }
        if (!IsUndefined(fallback) && fallback.isProviderFor(O, P)) {
          return fallback;
        }
        return void 0;
      }
      function getProvider(O, P) {
        var providerMap = targetProviderMap.get(O);
        var provider;
        if (!IsUndefined(providerMap)) {
          provider = providerMap.get(P);
        }
        if (!IsUndefined(provider)) {
          return provider;
        }
        provider = getProviderNoCache(O, P);
        if (!IsUndefined(provider)) {
          if (IsUndefined(providerMap)) {
            providerMap = new _Map();
            targetProviderMap.set(O, providerMap);
          }
          providerMap.set(P, provider);
        }
        return provider;
      }
      function hasProvider(provider) {
        if (IsUndefined(provider))
          throw new TypeError();
        return first === provider || second === provider || !IsUndefined(rest) && rest.has(provider);
      }
      function setProvider(O, P, provider) {
        if (!hasProvider(provider)) {
          throw new Error("Metadata provider not registered.");
        }
        var existingProvider = getProvider(O, P);
        if (existingProvider !== provider) {
          if (!IsUndefined(existingProvider)) {
            return false;
          }
          var providerMap = targetProviderMap.get(O);
          if (IsUndefined(providerMap)) {
            providerMap = new _Map();
            targetProviderMap.set(O, providerMap);
          }
          providerMap.set(P, provider);
        }
        return true;
      }
    }
    function GetOrCreateMetadataRegistry() {
      var metadataRegistry2;
      if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
        metadataRegistry2 = root.Reflect[registrySymbol];
      }
      if (IsUndefined(metadataRegistry2)) {
        metadataRegistry2 = CreateMetadataRegistry();
      }
      if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
        Object.defineProperty(root.Reflect, registrySymbol, {
          enumerable: false,
          configurable: false,
          writable: false,
          value: metadataRegistry2
        });
      }
      return metadataRegistry2;
    }
    function CreateMetadataProvider(registry) {
      var metadata2 = new _WeakMap();
      var provider = {
        isProviderFor: function(O, P) {
          var targetMetadata = metadata2.get(O);
          if (IsUndefined(targetMetadata))
            return false;
          return targetMetadata.has(P);
        },
        OrdinaryDefineOwnMetadata: OrdinaryDefineOwnMetadata2,
        OrdinaryHasOwnMetadata: OrdinaryHasOwnMetadata2,
        OrdinaryGetOwnMetadata: OrdinaryGetOwnMetadata2,
        OrdinaryOwnMetadataKeys: OrdinaryOwnMetadataKeys2,
        OrdinaryDeleteMetadata
      };
      metadataRegistry.registerProvider(provider);
      return provider;
      function GetOrCreateMetadataMap(O, P, Create) {
        var targetMetadata = metadata2.get(O);
        var createdTargetMetadata = false;
        if (IsUndefined(targetMetadata)) {
          if (!Create)
            return void 0;
          targetMetadata = new _Map();
          metadata2.set(O, targetMetadata);
          createdTargetMetadata = true;
        }
        var metadataMap = targetMetadata.get(P);
        if (IsUndefined(metadataMap)) {
          if (!Create)
            return void 0;
          metadataMap = new _Map();
          targetMetadata.set(P, metadataMap);
          if (!registry.setProvider(O, P, provider)) {
            targetMetadata.delete(P);
            if (createdTargetMetadata) {
              metadata2.delete(O);
            }
            throw new Error("Wrong provider for target.");
          }
        }
        return metadataMap;
      }
      function OrdinaryHasOwnMetadata2(MetadataKey, O, P) {
        var metadataMap = GetOrCreateMetadataMap(
          O,
          P,
          /*Create*/
          false
        );
        if (IsUndefined(metadataMap))
          return false;
        return ToBoolean(metadataMap.has(MetadataKey));
      }
      function OrdinaryGetOwnMetadata2(MetadataKey, O, P) {
        var metadataMap = GetOrCreateMetadataMap(
          O,
          P,
          /*Create*/
          false
        );
        if (IsUndefined(metadataMap))
          return void 0;
        return metadataMap.get(MetadataKey);
      }
      function OrdinaryDefineOwnMetadata2(MetadataKey, MetadataValue, O, P) {
        var metadataMap = GetOrCreateMetadataMap(
          O,
          P,
          /*Create*/
          true
        );
        metadataMap.set(MetadataKey, MetadataValue);
      }
      function OrdinaryOwnMetadataKeys2(O, P) {
        var keys = [];
        var metadataMap = GetOrCreateMetadataMap(
          O,
          P,
          /*Create*/
          false
        );
        if (IsUndefined(metadataMap))
          return keys;
        var keysObj = metadataMap.keys();
        var iterator = GetIterator(keysObj);
        var k = 0;
        while (true) {
          var next = IteratorStep(iterator);
          if (!next) {
            keys.length = k;
            return keys;
          }
          var nextValue = IteratorValue(next);
          try {
            keys[k] = nextValue;
          } catch (e) {
            try {
              IteratorClose(iterator);
            } finally {
              throw e;
            }
          }
          k++;
        }
      }
      function OrdinaryDeleteMetadata(MetadataKey, O, P) {
        var metadataMap = GetOrCreateMetadataMap(
          O,
          P,
          /*Create*/
          false
        );
        if (IsUndefined(metadataMap))
          return false;
        if (!metadataMap.delete(MetadataKey))
          return false;
        if (metadataMap.size === 0) {
          var targetMetadata = metadata2.get(O);
          if (!IsUndefined(targetMetadata)) {
            targetMetadata.delete(P);
            if (targetMetadata.size === 0) {
              metadata2.delete(targetMetadata);
            }
          }
        }
        return true;
      }
    }
    function CreateFallbackProvider(reflect) {
      var defineMetadata2 = reflect.defineMetadata, hasOwnMetadata2 = reflect.hasOwnMetadata, getOwnMetadata2 = reflect.getOwnMetadata, getOwnMetadataKeys2 = reflect.getOwnMetadataKeys, deleteMetadata2 = reflect.deleteMetadata;
      var metadataOwner = new _WeakMap();
      var provider = {
        isProviderFor: function(O, P) {
          var metadataPropertySet = metadataOwner.get(O);
          if (!IsUndefined(metadataPropertySet) && metadataPropertySet.has(P)) {
            return true;
          }
          if (getOwnMetadataKeys2(O, P).length) {
            if (IsUndefined(metadataPropertySet)) {
              metadataPropertySet = new _Set();
              metadataOwner.set(O, metadataPropertySet);
            }
            metadataPropertySet.add(P);
            return true;
          }
          return false;
        },
        OrdinaryDefineOwnMetadata: defineMetadata2,
        OrdinaryHasOwnMetadata: hasOwnMetadata2,
        OrdinaryGetOwnMetadata: getOwnMetadata2,
        OrdinaryOwnMetadataKeys: getOwnMetadataKeys2,
        OrdinaryDeleteMetadata: deleteMetadata2
      };
      return provider;
    }
    function GetMetadataProvider(O, P, Create) {
      var registeredProvider = metadataRegistry.getProvider(O, P);
      if (!IsUndefined(registeredProvider)) {
        return registeredProvider;
      }
      if (Create) {
        if (metadataRegistry.setProvider(O, P, metadataProvider)) {
          return metadataProvider;
        }
        throw new Error("Illegal state.");
      }
      return void 0;
    }
    function CreateMapPolyfill() {
      var cacheSentinel = {};
      var arraySentinel = [];
      var MapIterator = (
        /** @class */
        function() {
          function MapIterator2(keys, values, selector) {
            this._index = 0;
            this._keys = keys;
            this._values = values;
            this._selector = selector;
          }
          MapIterator2.prototype["@@iterator"] = function() {
            return this;
          };
          MapIterator2.prototype[iteratorSymbol] = function() {
            return this;
          };
          MapIterator2.prototype.next = function() {
            var index = this._index;
            if (index >= 0 && index < this._keys.length) {
              var result = this._selector(this._keys[index], this._values[index]);
              if (index + 1 >= this._keys.length) {
                this._index = -1;
                this._keys = arraySentinel;
                this._values = arraySentinel;
              } else {
                this._index++;
              }
              return { value: result, done: false };
            }
            return { value: void 0, done: true };
          };
          MapIterator2.prototype.throw = function(error) {
            if (this._index >= 0) {
              this._index = -1;
              this._keys = arraySentinel;
              this._values = arraySentinel;
            }
            throw error;
          };
          MapIterator2.prototype.return = function(value) {
            if (this._index >= 0) {
              this._index = -1;
              this._keys = arraySentinel;
              this._values = arraySentinel;
            }
            return { value, done: true };
          };
          return MapIterator2;
        }()
      );
      var Map2 = (
        /** @class */
        function() {
          function Map3() {
            this._keys = [];
            this._values = [];
            this._cacheKey = cacheSentinel;
            this._cacheIndex = -2;
          }
          Object.defineProperty(Map3.prototype, "size", {
            get: function() {
              return this._keys.length;
            },
            enumerable: true,
            configurable: true
          });
          Map3.prototype.has = function(key) {
            return this._find(
              key,
              /*insert*/
              false
            ) >= 0;
          };
          Map3.prototype.get = function(key) {
            var index = this._find(
              key,
              /*insert*/
              false
            );
            return index >= 0 ? this._values[index] : void 0;
          };
          Map3.prototype.set = function(key, value) {
            var index = this._find(
              key,
              /*insert*/
              true
            );
            this._values[index] = value;
            return this;
          };
          Map3.prototype.delete = function(key) {
            var index = this._find(
              key,
              /*insert*/
              false
            );
            if (index >= 0) {
              var size = this._keys.length;
              for (var i = index + 1; i < size; i++) {
                this._keys[i - 1] = this._keys[i];
                this._values[i - 1] = this._values[i];
              }
              this._keys.length--;
              this._values.length--;
              if (SameValueZero(key, this._cacheKey)) {
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
              }
              return true;
            }
            return false;
          };
          Map3.prototype.clear = function() {
            this._keys.length = 0;
            this._values.length = 0;
            this._cacheKey = cacheSentinel;
            this._cacheIndex = -2;
          };
          Map3.prototype.keys = function() {
            return new MapIterator(this._keys, this._values, getKey);
          };
          Map3.prototype.values = function() {
            return new MapIterator(this._keys, this._values, getValue);
          };
          Map3.prototype.entries = function() {
            return new MapIterator(this._keys, this._values, getEntry);
          };
          Map3.prototype["@@iterator"] = function() {
            return this.entries();
          };
          Map3.prototype[iteratorSymbol] = function() {
            return this.entries();
          };
          Map3.prototype._find = function(key, insert) {
            if (!SameValueZero(this._cacheKey, key)) {
              this._cacheIndex = -1;
              for (var i = 0; i < this._keys.length; i++) {
                if (SameValueZero(this._keys[i], key)) {
                  this._cacheIndex = i;
                  break;
                }
              }
            }
            if (this._cacheIndex < 0 && insert) {
              this._cacheIndex = this._keys.length;
              this._keys.push(key);
              this._values.push(void 0);
            }
            return this._cacheIndex;
          };
          return Map3;
        }()
      );
      return Map2;
      function getKey(key, _14) {
        return key;
      }
      function getValue(_14, value) {
        return value;
      }
      function getEntry(key, value) {
        return [key, value];
      }
    }
    function CreateSetPolyfill() {
      var Set2 = (
        /** @class */
        function() {
          function Set3() {
            this._map = new _Map();
          }
          Object.defineProperty(Set3.prototype, "size", {
            get: function() {
              return this._map.size;
            },
            enumerable: true,
            configurable: true
          });
          Set3.prototype.has = function(value) {
            return this._map.has(value);
          };
          Set3.prototype.add = function(value) {
            return this._map.set(value, value), this;
          };
          Set3.prototype.delete = function(value) {
            return this._map.delete(value);
          };
          Set3.prototype.clear = function() {
            this._map.clear();
          };
          Set3.prototype.keys = function() {
            return this._map.keys();
          };
          Set3.prototype.values = function() {
            return this._map.keys();
          };
          Set3.prototype.entries = function() {
            return this._map.entries();
          };
          Set3.prototype["@@iterator"] = function() {
            return this.keys();
          };
          Set3.prototype[iteratorSymbol] = function() {
            return this.keys();
          };
          return Set3;
        }()
      );
      return Set2;
    }
    function CreateWeakMapPolyfill() {
      var UUID_SIZE = 16;
      var keys = HashMap.create();
      var rootKey = CreateUniqueKey();
      return (
        /** @class */
        function() {
          function WeakMap2() {
            this._key = CreateUniqueKey();
          }
          WeakMap2.prototype.has = function(target) {
            var table = GetOrCreateWeakMapTable(
              target,
              /*create*/
              false
            );
            return table !== void 0 ? HashMap.has(table, this._key) : false;
          };
          WeakMap2.prototype.get = function(target) {
            var table = GetOrCreateWeakMapTable(
              target,
              /*create*/
              false
            );
            return table !== void 0 ? HashMap.get(table, this._key) : void 0;
          };
          WeakMap2.prototype.set = function(target, value) {
            var table = GetOrCreateWeakMapTable(
              target,
              /*create*/
              true
            );
            table[this._key] = value;
            return this;
          };
          WeakMap2.prototype.delete = function(target) {
            var table = GetOrCreateWeakMapTable(
              target,
              /*create*/
              false
            );
            return table !== void 0 ? delete table[this._key] : false;
          };
          WeakMap2.prototype.clear = function() {
            this._key = CreateUniqueKey();
          };
          return WeakMap2;
        }()
      );
      function CreateUniqueKey() {
        var key;
        do
          key = "@@WeakMap@@" + CreateUUID();
        while (HashMap.has(keys, key));
        keys[key] = true;
        return key;
      }
      function GetOrCreateWeakMapTable(target, create) {
        if (!hasOwn.call(target, rootKey)) {
          if (!create)
            return void 0;
          Object.defineProperty(target, rootKey, { value: HashMap.create() });
        }
        return target[rootKey];
      }
      function FillRandomBytes(buffer, size) {
        for (var i = 0; i < size; ++i)
          buffer[i] = Math.random() * 255 | 0;
        return buffer;
      }
      function GenRandomBytes(size) {
        if (typeof Uint8Array === "function") {
          var array2 = new Uint8Array(size);
          if (typeof crypto !== "undefined") {
            crypto.getRandomValues(array2);
          } else if (typeof msCrypto !== "undefined") {
            msCrypto.getRandomValues(array2);
          } else {
            FillRandomBytes(array2, size);
          }
          return array2;
        }
        return FillRandomBytes(new Array(size), size);
      }
      function CreateUUID() {
        var data = GenRandomBytes(UUID_SIZE);
        data[6] = data[6] & 79 | 64;
        data[8] = data[8] & 191 | 128;
        var result = "";
        for (var offset = 0; offset < UUID_SIZE; ++offset) {
          var byte = data[offset];
          if (offset === 4 || offset === 6 || offset === 8)
            result += "-";
          if (byte < 16)
            result += "0";
          result += byte.toString(16).toLowerCase();
        }
        return result;
      }
    }
    function MakeDictionary(obj) {
      obj.__ = void 0;
      delete obj.__;
      return obj;
    }
  });
})(Reflect$1 || (Reflect$1 = {}));
class MobxModelElementImpl {
  constructor() {
    this.$$owner = null;
    this.$$propertyName = "";
    this.$$propertyIndex = void 0;
    makeObservable(this, {
      $$owner: observable,
      $$propertyName: observable,
      $$propertyIndex: observable
    });
  }
  freOwner() {
    return this.$$owner;
  }
  freOwnerDescriptor() {
    const owner = this.$$owner;
    return this.$$owner ? {
      owner,
      propertyName: this.$$propertyName,
      propertyIndex: this.$$propertyIndex
    } : null;
  }
}
function allOwners(dec) {
  const result = [];
  let owner = dec === null || dec === void 0 ? void 0 : dec.freOwner();
  while (!!owner) {
    result.push(owner);
    owner = owner.freOwner();
  }
  return result;
}
class FreDelta {
  constructor(unit, owner, propertyName, index) {
    this.owner = owner;
    this.propertyName = propertyName;
    if (index !== null && index !== void 0) {
      this.index = index;
    }
    this.unit = unit;
  }
  toString() {
    var _a;
    return "Delta<" + ((_a = this.owner) === null || _a === void 0 ? void 0 : _a.freLanguageConcept()) + "[" + this.propertyName + "]>";
  }
}
class FrePrimDelta extends FreDelta {
  constructor(unit, owner, propertyName, oldValue, newValue, index) {
    super(unit, owner, propertyName, index);
    this.oldValue = oldValue;
    this.newValue = newValue;
  }
  toString() {
    let indexStr = "";
    if (this.index > 0) {
      indexStr = "[" + this.index + "]";
    }
    return "set " + DeltaUtil.getElemName(this.owner) + "." + this.propertyName + indexStr + " to " + this.newValue;
  }
}
class FrePartDelta extends FreDelta {
  constructor(unit, owner, propertyName, oldValue, newValue, index) {
    super(unit, owner, propertyName, index);
    if (oldValue instanceof MobxModelElementImpl) {
      this.oldValue = oldValue;
    }
    if (newValue instanceof MobxModelElementImpl) {
      this.newValue = newValue;
    }
  }
  toString() {
    return "set " + DeltaUtil.getElemName(this.owner) + "." + this.propertyName + " to " + DeltaUtil.getElemName(this.newValue);
  }
}
class FrePartListDelta extends FreDelta {
  constructor(unit, owner, propertyName, index, removed, added) {
    super(unit, owner, propertyName, index);
    this.removed = [];
    this.added = [];
    for (const r of removed) {
      if (r instanceof MobxModelElementImpl) {
        this.removed.push(r);
      }
    }
    for (const a of added) {
      if (a instanceof MobxModelElementImpl) {
        this.added.push(a);
      }
    }
  }
  toString() {
    const ownerName = DeltaUtil.getElemName(this.owner);
    if (this.removed.length > 0) {
      return `remove [${this.removed.map((r) => DeltaUtil.getElemName(r))}] from ${ownerName}.${this.propertyName}`;
    } else if (this.added.length > 0) {
      return `add [${this.added.map((r) => DeltaUtil.getElemName(r))}] to ${ownerName}.${this.propertyName}`;
    }
    return `change list ${ownerName}.${this.propertyName} from index ${this.index}: removed [${this.removed.map((r) => DeltaUtil.getElemName(r))}], added [${this.added.map((r) => DeltaUtil.getElemName(r))}]`;
  }
}
class FrePrimListDelta extends FreDelta {
  constructor(unit, owner, propertyName, index, removed, added) {
    super(unit, owner, propertyName, index);
    this.removed = [];
    this.added = [];
    if (!!removed) {
      this.removed = removed;
    }
    if (!!added) {
      this.added = added;
    }
  }
  toString() {
    const ownerName = DeltaUtil.getElemName(this.owner);
    if (this.removed.length > 0) {
      return `removed [${this.removed}] from ${ownerName}.${this.propertyName} from index ${this.index}`;
    } else if (this.added.length > 0) {
      return `added [${this.added}] to ${ownerName}.${this.propertyName}`;
    }
    return "FrePrimListDelta<" + ownerName + "[" + this.propertyName + "]>";
  }
}
class DeltaUtil {
  static getElemName(node) {
    let ownerName = node["name"];
    if (!ownerName) {
      ownerName = node === null || node === void 0 ? void 0 : node.freLanguageConcept();
    }
    return ownerName;
  }
}
class EmptyStdLib {
  constructor() {
    this.elements = [];
  }
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, [])).next());
  });
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
const LOGGER$q = new FreLogger("Box");
class Box {
  isDirty() {
    if (this.refreshComponent !== void 0 && this.refreshComponent !== null) {
      this.refreshComponent("Called by Box " + this.kind + " " + this.id);
    } else {
      LOGGER$q.log("No refreshComponent() for " + this.role);
    }
  }
  constructor(node, role) {
    this.kind = "";
    this.role = "";
    this.element = null;
    this.cssClass = "";
    this.cssStyle = "";
    this.selectable = true;
    this.parent = null;
    this.actualX = -1;
    this.actualY = -1;
    this.actualWidth = -1;
    this.actualHeight = -1;
    this.setFocus = () => __awaiter(this, void 0, void 0, function* () {
      console.error(this.kind + ":setFocus not implemented for " + this.id + " id " + this.$id);
    });
    FreUtils.CHECK(!!node, "Element cannot be empty in Box constructor");
    this.element = node;
    this.role = role;
    this.$id = FreUtils.BOX_ID();
  }
  get id() {
    if (!!this.element) {
      return this.element.freId() + (this.role === null ? "" : "-" + this.role);
    } else {
      return "unknown-element-" + this.role;
    }
  }
  get root() {
    let result = this;
    while (result.parent) {
      result = result.parent;
    }
    return result;
  }
  get children() {
    return [];
  }
  get firstLeaf() {
    if (this.isLeaf() && this.selectable) {
      return this;
    }
    for (const child of this.children) {
      const leafChild = child.firstLeaf;
      if (!!leafChild) {
        return leafChild;
      }
    }
    return null;
  }
  isLeaf() {
    return this.children.length === 0;
  }
  get lastLeaf() {
    if (this.isLeaf() && this.selectable) {
      return this;
    }
    const childrenReversed = this.children.concat().reverse();
    for (const child of childrenReversed) {
      const leafChild = child.lastLeaf;
      if (!!leafChild) {
        return leafChild;
      }
    }
    return null;
  }
  get nextLeafRight() {
    if (!this.parent) {
      return null;
    }
    const thisIndex = this.parent.children.indexOf(this);
    const rightSiblings = this.parent.children.slice(thisIndex + 1, this.parent.children.length);
    for (const sibling of rightSiblings) {
      const siblingChild = sibling.firstLeaf;
      if (!!siblingChild) {
        return siblingChild;
      }
      if (sibling.isLeaf() && sibling.selectable) {
        return sibling;
      }
    }
    return this.parent.nextLeafRight;
  }
  get nextLeafLeft() {
    if (this.parent === null || this.parent === void 0) {
      return null;
    }
    const thisIndex = this.parent.children.indexOf(this);
    const leftSiblings = this.parent.children.slice(0, thisIndex).reverse();
    for (const sibling of leftSiblings) {
      const siblingChild = sibling.lastLeaf;
      if (!!siblingChild) {
        return siblingChild;
      }
      if (sibling.isLeaf() && sibling.selectable) {
        return sibling;
      }
    }
    return this.parent.nextLeafLeft;
  }
  toString() {
    return "[[" + this.id + "]]";
  }
  find(id) {
    if (this.id === id) {
      return this;
    }
    for (const b of this.children) {
      const result = b.find(id);
      if (result !== null) {
        return result;
      }
    }
    return null;
  }
  findBoxWithRole(role) {
    if (this.role === role) {
      return this;
    }
    for (const b of this.children) {
      const result = b.findBoxWithRole(role);
      if (result !== null) {
        return result;
      }
    }
    return null;
  }
  findChildBoxForProperty(propertyName, propertyIndex) {
    console.log("findChildBoxForProperty " + this.role + "[" + propertyName + ", " + propertyIndex + "]");
    for (const child of this.children) {
      if (!isNullOrUndefined(propertyName)) {
        if (!isNullOrUndefined(propertyIndex)) {
          if (child.propertyName === propertyName && child.propertyIndex === propertyIndex) {
            return child;
          }
        } else {
          if (child.propertyName === propertyName) {
            return child;
          }
        }
      } else {
        return child;
      }
      const result = child.findChildBoxForProperty(propertyName, propertyIndex);
      if (!isNullOrUndefined(result) && result.element === this.element) {
        return result;
      }
    }
    return null;
  }
  get firstEditableChild() {
    const editableChildren = [];
    this.getEditableChildrenRecursive(editableChildren);
    if (editableChildren.length > 0) {
      const binaryPlaceHolders = editableChildren.filter((box2) => box2.role === FRE_BINARY_EXPRESSION_LEFT || box2.role === FRE_BINARY_EXPRESSION_RIGHT);
      return binaryPlaceHolders.length > 0 ? binaryPlaceHolders[0] : editableChildren[0];
    } else {
      return this;
    }
  }
  getEditableChildrenRecursive(result) {
    LOGGER$q.info("getEditableChildrenRecursive for " + this.kind);
    if (this.isEditable()) {
      LOGGER$q.info("Found editable: " + this.role);
      result.push(this);
      return;
    }
    this.children.forEach((c) => {
      LOGGER$q.info("child: " + c.kind);
      c.getEditableChildrenRecursive(result);
    });
  }
  isEditable() {
    return false;
  }
}
class EmptyLineBox extends Box {
  constructor(element, role) {
    super(element, role);
    this.kind = "EmptyLineBox";
    this.selectable = false;
  }
}
var MetaKey;
(function(MetaKey2) {
  MetaKey2[MetaKey2["None"] = 0] = "None";
  MetaKey2[MetaKey2["Ctrl"] = 1] = "Ctrl";
  MetaKey2[MetaKey2["Alt"] = 2] = "Alt";
  MetaKey2[MetaKey2["Shift"] = 3] = "Shift";
  MetaKey2[MetaKey2["CtrlAlt"] = 4] = "CtrlAlt";
  MetaKey2[MetaKey2["CtrlShift"] = 5] = "CtrlShift";
  MetaKey2[MetaKey2["AltShift"] = 6] = "AltShift";
  MetaKey2[MetaKey2["CtrlAltShift"] = 7] = "CtrlAltShift";
})(MetaKey || (MetaKey = {}));
const LOGGER$p = new FreLogger("BehaviorUtils");
var BehaviorExecutionResult;
(function(BehaviorExecutionResult2) {
  BehaviorExecutionResult2[BehaviorExecutionResult2["NULL"] = 0] = "NULL";
  BehaviorExecutionResult2[BehaviorExecutionResult2["EXECUTED"] = 1] = "EXECUTED";
  BehaviorExecutionResult2[BehaviorExecutionResult2["PARTIAL_MATCH"] = 2] = "PARTIAL_MATCH";
  BehaviorExecutionResult2[BehaviorExecutionResult2["NO_MATCH"] = 3] = "NO_MATCH";
})(BehaviorExecutionResult || (BehaviorExecutionResult = {}));
function executeBehavior(box2, text, label, editor) {
  LOGGER$p.log("Enter executeBehavior text [" + text + "] label [" + label + "] box role [" + box2.role + "]");
  let partialMatch = false;
  const index = -1;
  for (const action2 of editor.newFreActions) {
    const trigger = action2.trigger;
    LOGGER$p.log("  executeBehavior trigger " + trigger + "  roles " + action2.activeInBoxRoles);
    if (action2.activeInBoxRoles.includes(box2.role)) {
      if (isRegExp(trigger)) {
        const matchArray = label.match(trigger);
        LOGGER$p.log("executeBehavior: MATCH " + label + " against " + trigger + "  results in " + (!!matchArray ? matchArray.length : "null"));
        let execresult = null;
        if (matchArray !== null && label === matchArray[0]) {
          runInAction(() => {
            const command = action2.command();
            execresult = command.execute(box2, label, editor, index);
          });
          if (!!execresult) {
            execresult();
          }
          return BehaviorExecutionResult.EXECUTED;
        }
      } else if (isString(trigger)) {
        if (trigger === text) {
          LOGGER$p.log("executeBehavior: MATCH FULL TEXT label [" + label + "] refShortcut [" + action2.referenceShortcut + "]");
          let postAction;
          runInAction(() => {
            const command = action2.command();
            postAction = command.execute(box2, label, editor, index);
          });
          postAction();
          return BehaviorExecutionResult.EXECUTED;
        } else if (trigger.startsWith(label)) {
          LOGGER$p.log("executeBehavior: MATCH PARTIAL TEXT");
          partialMatch = true;
        }
      }
    }
  }
  LOGGER$p.log("executeBehavior: no action match, ;partial is " + partialMatch);
  if (partialMatch) {
    return BehaviorExecutionResult.PARTIAL_MATCH;
  } else {
    return BehaviorExecutionResult.NO_MATCH;
  }
}
function executeSingleBehavior(action2, box2, text, label, editor) {
  LOGGER$p.log("Enter executeSingleBehavior text [" + text + "] label [" + label + "] refshortcut [" + action2.referenceShortcut + "]");
  let execresult;
  const index = -1;
  runInAction(() => {
    const command = action2.command();
    execresult = command.execute(box2, label, editor, index);
  });
  if (!!execresult) {
    execresult();
  }
  return BehaviorExecutionResult.EXECUTED;
}
var lodash = { exports: {} };
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
lodash.exports;
(function(module, exports) {
  (function() {
    var undefined$1;
    var VERSION = "4.17.21";
    var LARGE_ARRAY_SIZE = 200;
    var CORE_ERROR_TEXT = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", FUNC_ERROR_TEXT = "Expected a function", INVALID_TEMPL_VAR_ERROR_TEXT = "Invalid `variable` option passed into `_.template`";
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var MAX_MEMOIZE_SIZE = 500;
    var PLACEHOLDER = "__lodash_placeholder__";
    var CLONE_DEEP_FLAG = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG = 4;
    var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
    var WRAP_BIND_FLAG = 1, WRAP_BIND_KEY_FLAG = 2, WRAP_CURRY_BOUND_FLAG = 4, WRAP_CURRY_FLAG = 8, WRAP_CURRY_RIGHT_FLAG = 16, WRAP_PARTIAL_FLAG = 32, WRAP_PARTIAL_RIGHT_FLAG = 64, WRAP_ARY_FLAG = 128, WRAP_REARG_FLAG = 256, WRAP_FLIP_FLAG = 512;
    var DEFAULT_TRUNC_LENGTH = 30, DEFAULT_TRUNC_OMISSION = "...";
    var HOT_COUNT = 800, HOT_SPAN = 16;
    var LAZY_FILTER_FLAG = 1, LAZY_MAP_FLAG = 2, LAZY_WHILE_FLAG = 3;
    var INFINITY = 1 / 0, MAX_SAFE_INTEGER = 9007199254740991, MAX_INTEGER = 17976931348623157e292, NAN = 0 / 0;
    var MAX_ARRAY_LENGTH = 4294967295, MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1, HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;
    var wrapFlags = [
      ["ary", WRAP_ARY_FLAG],
      ["bind", WRAP_BIND_FLAG],
      ["bindKey", WRAP_BIND_KEY_FLAG],
      ["curry", WRAP_CURRY_FLAG],
      ["curryRight", WRAP_CURRY_RIGHT_FLAG],
      ["flip", WRAP_FLIP_FLAG],
      ["partial", WRAP_PARTIAL_FLAG],
      ["partialRight", WRAP_PARTIAL_RIGHT_FLAG],
      ["rearg", WRAP_REARG_FLAG]
    ];
    var argsTag = "[object Arguments]", arrayTag = "[object Array]", asyncTag = "[object AsyncFunction]", boolTag = "[object Boolean]", dateTag = "[object Date]", domExcTag = "[object DOMException]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", nullTag = "[object Null]", objectTag = "[object Object]", promiseTag = "[object Promise]", proxyTag = "[object Proxy]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", undefinedTag = "[object Undefined]", weakMapTag = "[object WeakMap]", weakSetTag = "[object WeakSet]";
    var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
    var reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
    var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g, reUnescapedHtml = /[&<>"']/g, reHasEscapedHtml = RegExp(reEscapedHtml.source), reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
    var reEscape = /<%-([\s\S]+?)%>/g, reEvaluate = /<%([\s\S]+?)%>/g, reInterpolate = /<%=([\s\S]+?)%>/g;
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/, rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g, reHasRegExpChar = RegExp(reRegExpChar.source);
    var reTrimStart = /^\s+/;
    var reWhitespace = /\s/;
    var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/, reSplitDetails = /,? & /;
    var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
    var reForbiddenIdentifierChars = /[()=,{}\[\]\/\s]/;
    var reEscapeChar = /\\(\\)?/g;
    var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
    var reFlags = /\w*$/;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsOctal = /^0o[0-7]+$/i;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
    var reNoMatch = /($^)/;
    var reUnescapedString = /['\n\r\u2028\u2029\\]/g;
    var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f", reComboHalfMarksRange = "\\ufe20-\\ufe2f", rsComboSymbolsRange = "\\u20d0-\\u20ff", rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange, rsDingbatRange = "\\u2700-\\u27bf", rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff", rsMathOpRange = "\\xac\\xb1\\xd7\\xf7", rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", rsPunctuationRange = "\\u2000-\\u206f", rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde", rsVarRange = "\\ufe0e\\ufe0f", rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
    var rsApos = "['’]", rsAstral = "[" + rsAstralRange + "]", rsBreak = "[" + rsBreakRange + "]", rsCombo = "[" + rsComboRange + "]", rsDigits = "\\d+", rsDingbat = "[" + rsDingbatRange + "]", rsLower = "[" + rsLowerRange + "]", rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsUpper = "[" + rsUpperRange + "]", rsZWJ = "\\u200d";
    var rsMiscLower = "(?:" + rsLower + "|" + rsMisc + ")", rsMiscUpper = "(?:" + rsUpper + "|" + rsMisc + ")", rsOptContrLower = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?", rsOptContrUpper = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?", reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*", rsOrdLower = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", rsOrdUpper = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsEmoji = "(?:" + [rsDingbat, rsRegional, rsSurrPair].join("|") + ")" + rsSeq, rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
    var reApos = RegExp(rsApos, "g");
    var reComboMark = RegExp(rsCombo, "g");
    var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
    var reUnicodeWord = RegExp([
      rsUpper + "?" + rsLower + "+" + rsOptContrLower + "(?=" + [rsBreak, rsUpper, "$"].join("|") + ")",
      rsMiscUpper + "+" + rsOptContrUpper + "(?=" + [rsBreak, rsUpper + rsMiscLower, "$"].join("|") + ")",
      rsUpper + "?" + rsMiscLower + "+" + rsOptContrLower,
      rsUpper + "+" + rsOptContrUpper,
      rsOrdUpper,
      rsOrdLower,
      rsDigits,
      rsEmoji
    ].join("|"), "g");
    var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]");
    var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
    var contextProps = [
      "Array",
      "Buffer",
      "DataView",
      "Date",
      "Error",
      "Float32Array",
      "Float64Array",
      "Function",
      "Int8Array",
      "Int16Array",
      "Int32Array",
      "Map",
      "Math",
      "Object",
      "Promise",
      "RegExp",
      "Set",
      "String",
      "Symbol",
      "TypeError",
      "Uint8Array",
      "Uint8ClampedArray",
      "Uint16Array",
      "Uint32Array",
      "WeakMap",
      "_",
      "clearTimeout",
      "isFinite",
      "parseInt",
      "setTimeout"
    ];
    var templateCounter = -1;
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
    var deburredLetters = {
      // Latin-1 Supplement block.
      "À": "A",
      "Á": "A",
      "Â": "A",
      "Ã": "A",
      "Ä": "A",
      "Å": "A",
      "à": "a",
      "á": "a",
      "â": "a",
      "ã": "a",
      "ä": "a",
      "å": "a",
      "Ç": "C",
      "ç": "c",
      "Ð": "D",
      "ð": "d",
      "È": "E",
      "É": "E",
      "Ê": "E",
      "Ë": "E",
      "è": "e",
      "é": "e",
      "ê": "e",
      "ë": "e",
      "Ì": "I",
      "Í": "I",
      "Î": "I",
      "Ï": "I",
      "ì": "i",
      "í": "i",
      "î": "i",
      "ï": "i",
      "Ñ": "N",
      "ñ": "n",
      "Ò": "O",
      "Ó": "O",
      "Ô": "O",
      "Õ": "O",
      "Ö": "O",
      "Ø": "O",
      "ò": "o",
      "ó": "o",
      "ô": "o",
      "õ": "o",
      "ö": "o",
      "ø": "o",
      "Ù": "U",
      "Ú": "U",
      "Û": "U",
      "Ü": "U",
      "ù": "u",
      "ú": "u",
      "û": "u",
      "ü": "u",
      "Ý": "Y",
      "ý": "y",
      "ÿ": "y",
      "Æ": "Ae",
      "æ": "ae",
      "Þ": "Th",
      "þ": "th",
      "ß": "ss",
      // Latin Extended-A block.
      "Ā": "A",
      "Ă": "A",
      "Ą": "A",
      "ā": "a",
      "ă": "a",
      "ą": "a",
      "Ć": "C",
      "Ĉ": "C",
      "Ċ": "C",
      "Č": "C",
      "ć": "c",
      "ĉ": "c",
      "ċ": "c",
      "č": "c",
      "Ď": "D",
      "Đ": "D",
      "ď": "d",
      "đ": "d",
      "Ē": "E",
      "Ĕ": "E",
      "Ė": "E",
      "Ę": "E",
      "Ě": "E",
      "ē": "e",
      "ĕ": "e",
      "ė": "e",
      "ę": "e",
      "ě": "e",
      "Ĝ": "G",
      "Ğ": "G",
      "Ġ": "G",
      "Ģ": "G",
      "ĝ": "g",
      "ğ": "g",
      "ġ": "g",
      "ģ": "g",
      "Ĥ": "H",
      "Ħ": "H",
      "ĥ": "h",
      "ħ": "h",
      "Ĩ": "I",
      "Ī": "I",
      "Ĭ": "I",
      "Į": "I",
      "İ": "I",
      "ĩ": "i",
      "ī": "i",
      "ĭ": "i",
      "į": "i",
      "ı": "i",
      "Ĵ": "J",
      "ĵ": "j",
      "Ķ": "K",
      "ķ": "k",
      "ĸ": "k",
      "Ĺ": "L",
      "Ļ": "L",
      "Ľ": "L",
      "Ŀ": "L",
      "Ł": "L",
      "ĺ": "l",
      "ļ": "l",
      "ľ": "l",
      "ŀ": "l",
      "ł": "l",
      "Ń": "N",
      "Ņ": "N",
      "Ň": "N",
      "Ŋ": "N",
      "ń": "n",
      "ņ": "n",
      "ň": "n",
      "ŋ": "n",
      "Ō": "O",
      "Ŏ": "O",
      "Ő": "O",
      "ō": "o",
      "ŏ": "o",
      "ő": "o",
      "Ŕ": "R",
      "Ŗ": "R",
      "Ř": "R",
      "ŕ": "r",
      "ŗ": "r",
      "ř": "r",
      "Ś": "S",
      "Ŝ": "S",
      "Ş": "S",
      "Š": "S",
      "ś": "s",
      "ŝ": "s",
      "ş": "s",
      "š": "s",
      "Ţ": "T",
      "Ť": "T",
      "Ŧ": "T",
      "ţ": "t",
      "ť": "t",
      "ŧ": "t",
      "Ũ": "U",
      "Ū": "U",
      "Ŭ": "U",
      "Ů": "U",
      "Ű": "U",
      "Ų": "U",
      "ũ": "u",
      "ū": "u",
      "ŭ": "u",
      "ů": "u",
      "ű": "u",
      "ų": "u",
      "Ŵ": "W",
      "ŵ": "w",
      "Ŷ": "Y",
      "ŷ": "y",
      "Ÿ": "Y",
      "Ź": "Z",
      "Ż": "Z",
      "Ž": "Z",
      "ź": "z",
      "ż": "z",
      "ž": "z",
      "Ĳ": "IJ",
      "ĳ": "ij",
      "Œ": "Oe",
      "œ": "oe",
      "ŉ": "'n",
      "ſ": "s"
    };
    var htmlEscapes = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    var htmlUnescapes = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'"
    };
    var stringEscapes = {
      "\\": "\\",
      "'": "'",
      "\n": "n",
      "\r": "r",
      "\u2028": "u2028",
      "\u2029": "u2029"
    };
    var freeParseFloat = parseFloat, freeParseInt = parseInt;
    var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var freeExports = exports && !exports.nodeType && exports;
    var freeModule = freeExports && true && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = function() {
      try {
        var types = freeModule && freeModule.require && freeModule.require("util").types;
        if (types) {
          return types;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e) {
      }
    }();
    var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer, nodeIsDate = nodeUtil && nodeUtil.isDate, nodeIsMap = nodeUtil && nodeUtil.isMap, nodeIsRegExp = nodeUtil && nodeUtil.isRegExp, nodeIsSet = nodeUtil && nodeUtil.isSet, nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }
    function arrayAggregator(array2, setter, iteratee, accumulator) {
      var index = -1, length = array2 == null ? 0 : array2.length;
      while (++index < length) {
        var value = array2[index];
        setter(accumulator, value, iteratee(value), array2);
      }
      return accumulator;
    }
    function arrayEach(array2, iteratee) {
      var index = -1, length = array2 == null ? 0 : array2.length;
      while (++index < length) {
        if (iteratee(array2[index], index, array2) === false) {
          break;
        }
      }
      return array2;
    }
    function arrayEachRight(array2, iteratee) {
      var length = array2 == null ? 0 : array2.length;
      while (length--) {
        if (iteratee(array2[length], length, array2) === false) {
          break;
        }
      }
      return array2;
    }
    function arrayEvery(array2, predicate) {
      var index = -1, length = array2 == null ? 0 : array2.length;
      while (++index < length) {
        if (!predicate(array2[index], index, array2)) {
          return false;
        }
      }
      return true;
    }
    function arrayFilter(array2, predicate) {
      var index = -1, length = array2 == null ? 0 : array2.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array2[index];
        if (predicate(value, index, array2)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    function arrayIncludes(array2, value) {
      var length = array2 == null ? 0 : array2.length;
      return !!length && baseIndexOf(array2, value, 0) > -1;
    }
    function arrayIncludesWith(array2, value, comparator) {
      var index = -1, length = array2 == null ? 0 : array2.length;
      while (++index < length) {
        if (comparator(value, array2[index])) {
          return true;
        }
      }
      return false;
    }
    function arrayMap(array2, iteratee) {
      var index = -1, length = array2 == null ? 0 : array2.length, result = Array(length);
      while (++index < length) {
        result[index] = iteratee(array2[index], index, array2);
      }
      return result;
    }
    function arrayPush(array2, values) {
      var index = -1, length = values.length, offset = array2.length;
      while (++index < length) {
        array2[offset + index] = values[index];
      }
      return array2;
    }
    function arrayReduce(array2, iteratee, accumulator, initAccum) {
      var index = -1, length = array2 == null ? 0 : array2.length;
      if (initAccum && length) {
        accumulator = array2[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array2[index], index, array2);
      }
      return accumulator;
    }
    function arrayReduceRight(array2, iteratee, accumulator, initAccum) {
      var length = array2 == null ? 0 : array2.length;
      if (initAccum && length) {
        accumulator = array2[--length];
      }
      while (length--) {
        accumulator = iteratee(accumulator, array2[length], length, array2);
      }
      return accumulator;
    }
    function arraySome(array2, predicate) {
      var index = -1, length = array2 == null ? 0 : array2.length;
      while (++index < length) {
        if (predicate(array2[index], index, array2)) {
          return true;
        }
      }
      return false;
    }
    var asciiSize = baseProperty("length");
    function asciiToArray(string) {
      return string.split("");
    }
    function asciiWords(string) {
      return string.match(reAsciiWord) || [];
    }
    function baseFindKey(collection, predicate, eachFunc) {
      var result;
      eachFunc(collection, function(value, key, collection2) {
        if (predicate(value, key, collection2)) {
          result = key;
          return false;
        }
      });
      return result;
    }
    function baseFindIndex(array2, predicate, fromIndex, fromRight) {
      var length = array2.length, index = fromIndex + (fromRight ? 1 : -1);
      while (fromRight ? index-- : ++index < length) {
        if (predicate(array2[index], index, array2)) {
          return index;
        }
      }
      return -1;
    }
    function baseIndexOf(array2, value, fromIndex) {
      return value === value ? strictIndexOf(array2, value, fromIndex) : baseFindIndex(array2, baseIsNaN, fromIndex);
    }
    function baseIndexOfWith(array2, value, fromIndex, comparator) {
      var index = fromIndex - 1, length = array2.length;
      while (++index < length) {
        if (comparator(array2[index], value)) {
          return index;
        }
      }
      return -1;
    }
    function baseIsNaN(value) {
      return value !== value;
    }
    function baseMean(array2, iteratee) {
      var length = array2 == null ? 0 : array2.length;
      return length ? baseSum(array2, iteratee) / length : NAN;
    }
    function baseProperty(key) {
      return function(object2) {
        return object2 == null ? undefined$1 : object2[key];
      };
    }
    function basePropertyOf(object2) {
      return function(key) {
        return object2 == null ? undefined$1 : object2[key];
      };
    }
    function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
      eachFunc(collection, function(value, index, collection2) {
        accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection2);
      });
      return accumulator;
    }
    function baseSortBy(array2, comparer2) {
      var length = array2.length;
      array2.sort(comparer2);
      while (length--) {
        array2[length] = array2[length].value;
      }
      return array2;
    }
    function baseSum(array2, iteratee) {
      var result, index = -1, length = array2.length;
      while (++index < length) {
        var current = iteratee(array2[index]);
        if (current !== undefined$1) {
          result = result === undefined$1 ? current : result + current;
        }
      }
      return result;
    }
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    function baseToPairs(object2, props) {
      return arrayMap(props, function(key) {
        return [key, object2[key]];
      });
    }
    function baseTrim(string) {
      return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
    }
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    function baseValues(object2, props) {
      return arrayMap(props, function(key) {
        return object2[key];
      });
    }
    function cacheHas(cache, key) {
      return cache.has(key);
    }
    function charsStartIndex(strSymbols, chrSymbols) {
      var index = -1, length = strSymbols.length;
      while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {
      }
      return index;
    }
    function charsEndIndex(strSymbols, chrSymbols) {
      var index = strSymbols.length;
      while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {
      }
      return index;
    }
    function countHolders(array2, placeholder) {
      var length = array2.length, result = 0;
      while (length--) {
        if (array2[length] === placeholder) {
          ++result;
        }
      }
      return result;
    }
    var deburrLetter = basePropertyOf(deburredLetters);
    var escapeHtmlChar = basePropertyOf(htmlEscapes);
    function escapeStringChar(chr) {
      return "\\" + stringEscapes[chr];
    }
    function getValue(object2, key) {
      return object2 == null ? undefined$1 : object2[key];
    }
    function hasUnicode(string) {
      return reHasUnicode.test(string);
    }
    function hasUnicodeWord(string) {
      return reHasUnicodeWord.test(string);
    }
    function iteratorToArray(iterator) {
      var data, result = [];
      while (!(data = iterator.next()).done) {
        result.push(data.value);
      }
      return result;
    }
    function mapToArray(map2) {
      var index = -1, result = Array(map2.size);
      map2.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    function replaceHolders(array2, placeholder) {
      var index = -1, length = array2.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array2[index];
        if (value === placeholder || value === PLACEHOLDER) {
          array2[index] = PLACEHOLDER;
          result[resIndex++] = index;
        }
      }
      return result;
    }
    function setToArray(set4) {
      var index = -1, result = Array(set4.size);
      set4.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }
    function setToPairs(set4) {
      var index = -1, result = Array(set4.size);
      set4.forEach(function(value) {
        result[++index] = [value, value];
      });
      return result;
    }
    function strictIndexOf(array2, value, fromIndex) {
      var index = fromIndex - 1, length = array2.length;
      while (++index < length) {
        if (array2[index] === value) {
          return index;
        }
      }
      return -1;
    }
    function strictLastIndexOf(array2, value, fromIndex) {
      var index = fromIndex + 1;
      while (index--) {
        if (array2[index] === value) {
          return index;
        }
      }
      return index;
    }
    function stringSize(string) {
      return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
    }
    function stringToArray(string) {
      return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
    }
    function trimmedEndIndex(string) {
      var index = string.length;
      while (index-- && reWhitespace.test(string.charAt(index))) {
      }
      return index;
    }
    var unescapeHtmlChar = basePropertyOf(htmlUnescapes);
    function unicodeSize(string) {
      var result = reUnicode.lastIndex = 0;
      while (reUnicode.test(string)) {
        ++result;
      }
      return result;
    }
    function unicodeToArray(string) {
      return string.match(reUnicode) || [];
    }
    function unicodeWords(string) {
      return string.match(reUnicodeWord) || [];
    }
    var runInContext = function runInContext2(context) {
      context = context == null ? root : _14.defaults(root.Object(), context, _14.pick(root, contextProps));
      var Array2 = context.Array, Date2 = context.Date, Error2 = context.Error, Function2 = context.Function, Math2 = context.Math, Object2 = context.Object, RegExp2 = context.RegExp, String2 = context.String, TypeError2 = context.TypeError;
      var arrayProto = Array2.prototype, funcProto = Function2.prototype, objectProto = Object2.prototype;
      var coreJsData = context["__core-js_shared__"];
      var funcToString = funcProto.toString;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var idCounter = 0;
      var maskSrcKey = function() {
        var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
        return uid ? "Symbol(src)_1." + uid : "";
      }();
      var nativeObjectToString = objectProto.toString;
      var objectCtorString = funcToString.call(Object2);
      var oldDash = root._;
      var reIsNative = RegExp2(
        "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
      );
      var Buffer = moduleExports ? context.Buffer : undefined$1, Symbol2 = context.Symbol, Uint8Array2 = context.Uint8Array, allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined$1, getPrototype = overArg(Object2.getPrototypeOf, Object2), objectCreate = Object2.create, propertyIsEnumerable = objectProto.propertyIsEnumerable, splice2 = arrayProto.splice, spreadableSymbol = Symbol2 ? Symbol2.isConcatSpreadable : undefined$1, symIterator = Symbol2 ? Symbol2.iterator : undefined$1, symToStringTag = Symbol2 ? Symbol2.toStringTag : undefined$1;
      var defineProperty3 = function() {
        try {
          var func = getNative(Object2, "defineProperty");
          func({}, "", {});
          return func;
        } catch (e) {
        }
      }();
      var ctxClearTimeout = context.clearTimeout !== root.clearTimeout && context.clearTimeout, ctxNow = Date2 && Date2.now !== root.Date.now && Date2.now, ctxSetTimeout = context.setTimeout !== root.setTimeout && context.setTimeout;
      var nativeCeil = Math2.ceil, nativeFloor = Math2.floor, nativeGetSymbols = Object2.getOwnPropertySymbols, nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined$1, nativeIsFinite = context.isFinite, nativeJoin = arrayProto.join, nativeKeys = overArg(Object2.keys, Object2), nativeMax = Math2.max, nativeMin = Math2.min, nativeNow = Date2.now, nativeParseInt = context.parseInt, nativeRandom = Math2.random, nativeReverse = arrayProto.reverse;
      var DataView = getNative(context, "DataView"), Map2 = getNative(context, "Map"), Promise2 = getNative(context, "Promise"), Set2 = getNative(context, "Set"), WeakMap2 = getNative(context, "WeakMap"), nativeCreate = getNative(Object2, "create");
      var metaMap = WeakMap2 && new WeakMap2();
      var realNames = {};
      var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map2), promiseCtorString = toSource(Promise2), setCtorString = toSource(Set2), weakMapCtorString = toSource(WeakMap2);
      var symbolProto = Symbol2 ? Symbol2.prototype : undefined$1, symbolValueOf = symbolProto ? symbolProto.valueOf : undefined$1, symbolToString = symbolProto ? symbolProto.toString : undefined$1;
      function lodash2(value) {
        if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
          if (value instanceof LodashWrapper) {
            return value;
          }
          if (hasOwnProperty.call(value, "__wrapped__")) {
            return wrapperClone(value);
          }
        }
        return new LodashWrapper(value);
      }
      var baseCreate = /* @__PURE__ */ function() {
        function object2() {
        }
        return function(proto) {
          if (!isObject2(proto)) {
            return {};
          }
          if (objectCreate) {
            return objectCreate(proto);
          }
          object2.prototype = proto;
          var result2 = new object2();
          object2.prototype = undefined$1;
          return result2;
        };
      }();
      function baseLodash() {
      }
      function LodashWrapper(value, chainAll) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__chain__ = !!chainAll;
        this.__index__ = 0;
        this.__values__ = undefined$1;
      }
      lodash2.templateSettings = {
        /**
         * Used to detect `data` property values to be HTML-escaped.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        "escape": reEscape,
        /**
         * Used to detect code to be evaluated.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        "evaluate": reEvaluate,
        /**
         * Used to detect `data` property values to inject.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        "interpolate": reInterpolate,
        /**
         * Used to reference the data object in the template text.
         *
         * @memberOf _.templateSettings
         * @type {string}
         */
        "variable": "",
        /**
         * Used to import variables into the compiled template.
         *
         * @memberOf _.templateSettings
         * @type {Object}
         */
        "imports": {
          /**
           * A reference to the `lodash` function.
           *
           * @memberOf _.templateSettings.imports
           * @type {Function}
           */
          "_": lodash2
        }
      };
      lodash2.prototype = baseLodash.prototype;
      lodash2.prototype.constructor = lodash2;
      LodashWrapper.prototype = baseCreate(baseLodash.prototype);
      LodashWrapper.prototype.constructor = LodashWrapper;
      function LazyWrapper(value) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__dir__ = 1;
        this.__filtered__ = false;
        this.__iteratees__ = [];
        this.__takeCount__ = MAX_ARRAY_LENGTH;
        this.__views__ = [];
      }
      function lazyClone() {
        var result2 = new LazyWrapper(this.__wrapped__);
        result2.__actions__ = copyArray(this.__actions__);
        result2.__dir__ = this.__dir__;
        result2.__filtered__ = this.__filtered__;
        result2.__iteratees__ = copyArray(this.__iteratees__);
        result2.__takeCount__ = this.__takeCount__;
        result2.__views__ = copyArray(this.__views__);
        return result2;
      }
      function lazyReverse() {
        if (this.__filtered__) {
          var result2 = new LazyWrapper(this);
          result2.__dir__ = -1;
          result2.__filtered__ = true;
        } else {
          result2 = this.clone();
          result2.__dir__ *= -1;
        }
        return result2;
      }
      function lazyValue() {
        var array2 = this.__wrapped__.value(), dir = this.__dir__, isArr = isArray(array2), isRight = dir < 0, arrLength = isArr ? array2.length : 0, view = getView(0, arrLength, this.__views__), start = view.start, end = view.end, length = end - start, index = isRight ? end : start - 1, iteratees = this.__iteratees__, iterLength = iteratees.length, resIndex = 0, takeCount = nativeMin(length, this.__takeCount__);
        if (!isArr || !isRight && arrLength == length && takeCount == length) {
          return baseWrapperValue(array2, this.__actions__);
        }
        var result2 = [];
        outer:
          while (length-- && resIndex < takeCount) {
            index += dir;
            var iterIndex = -1, value = array2[index];
            while (++iterIndex < iterLength) {
              var data = iteratees[iterIndex], iteratee2 = data.iteratee, type = data.type, computed3 = iteratee2(value);
              if (type == LAZY_MAP_FLAG) {
                value = computed3;
              } else if (!computed3) {
                if (type == LAZY_FILTER_FLAG) {
                  continue outer;
                } else {
                  break outer;
                }
              }
            }
            result2[resIndex++] = value;
          }
        return result2;
      }
      LazyWrapper.prototype = baseCreate(baseLodash.prototype);
      LazyWrapper.prototype.constructor = LazyWrapper;
      function Hash(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function hashClear() {
        this.__data__ = nativeCreate ? nativeCreate(null) : {};
        this.size = 0;
      }
      function hashDelete(key) {
        var result2 = this.has(key) && delete this.__data__[key];
        this.size -= result2 ? 1 : 0;
        return result2;
      }
      function hashGet(key) {
        var data = this.__data__;
        if (nativeCreate) {
          var result2 = data[key];
          return result2 === HASH_UNDEFINED ? undefined$1 : result2;
        }
        return hasOwnProperty.call(data, key) ? data[key] : undefined$1;
      }
      function hashHas(key) {
        var data = this.__data__;
        return nativeCreate ? data[key] !== undefined$1 : hasOwnProperty.call(data, key);
      }
      function hashSet(key, value) {
        var data = this.__data__;
        this.size += this.has(key) ? 0 : 1;
        data[key] = nativeCreate && value === undefined$1 ? HASH_UNDEFINED : value;
        return this;
      }
      Hash.prototype.clear = hashClear;
      Hash.prototype["delete"] = hashDelete;
      Hash.prototype.get = hashGet;
      Hash.prototype.has = hashHas;
      Hash.prototype.set = hashSet;
      function ListCache(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function listCacheClear() {
        this.__data__ = [];
        this.size = 0;
      }
      function listCacheDelete(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          return false;
        }
        var lastIndex = data.length - 1;
        if (index == lastIndex) {
          data.pop();
        } else {
          splice2.call(data, index, 1);
        }
        --this.size;
        return true;
      }
      function listCacheGet(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        return index < 0 ? undefined$1 : data[index][1];
      }
      function listCacheHas(key) {
        return assocIndexOf(this.__data__, key) > -1;
      }
      function listCacheSet(key, value) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          ++this.size;
          data.push([key, value]);
        } else {
          data[index][1] = value;
        }
        return this;
      }
      ListCache.prototype.clear = listCacheClear;
      ListCache.prototype["delete"] = listCacheDelete;
      ListCache.prototype.get = listCacheGet;
      ListCache.prototype.has = listCacheHas;
      ListCache.prototype.set = listCacheSet;
      function MapCache(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function mapCacheClear() {
        this.size = 0;
        this.__data__ = {
          "hash": new Hash(),
          "map": new (Map2 || ListCache)(),
          "string": new Hash()
        };
      }
      function mapCacheDelete(key) {
        var result2 = getMapData(this, key)["delete"](key);
        this.size -= result2 ? 1 : 0;
        return result2;
      }
      function mapCacheGet(key) {
        return getMapData(this, key).get(key);
      }
      function mapCacheHas(key) {
        return getMapData(this, key).has(key);
      }
      function mapCacheSet(key, value) {
        var data = getMapData(this, key), size2 = data.size;
        data.set(key, value);
        this.size += data.size == size2 ? 0 : 1;
        return this;
      }
      MapCache.prototype.clear = mapCacheClear;
      MapCache.prototype["delete"] = mapCacheDelete;
      MapCache.prototype.get = mapCacheGet;
      MapCache.prototype.has = mapCacheHas;
      MapCache.prototype.set = mapCacheSet;
      function SetCache(values2) {
        var index = -1, length = values2 == null ? 0 : values2.length;
        this.__data__ = new MapCache();
        while (++index < length) {
          this.add(values2[index]);
        }
      }
      function setCacheAdd(value) {
        this.__data__.set(value, HASH_UNDEFINED);
        return this;
      }
      function setCacheHas(value) {
        return this.__data__.has(value);
      }
      SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
      SetCache.prototype.has = setCacheHas;
      function Stack(entries) {
        var data = this.__data__ = new ListCache(entries);
        this.size = data.size;
      }
      function stackClear() {
        this.__data__ = new ListCache();
        this.size = 0;
      }
      function stackDelete(key) {
        var data = this.__data__, result2 = data["delete"](key);
        this.size = data.size;
        return result2;
      }
      function stackGet(key) {
        return this.__data__.get(key);
      }
      function stackHas(key) {
        return this.__data__.has(key);
      }
      function stackSet(key, value) {
        var data = this.__data__;
        if (data instanceof ListCache) {
          var pairs = data.__data__;
          if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
            pairs.push([key, value]);
            this.size = ++data.size;
            return this;
          }
          data = this.__data__ = new MapCache(pairs);
        }
        data.set(key, value);
        this.size = data.size;
        return this;
      }
      Stack.prototype.clear = stackClear;
      Stack.prototype["delete"] = stackDelete;
      Stack.prototype.get = stackGet;
      Stack.prototype.has = stackHas;
      Stack.prototype.set = stackSet;
      function arrayLikeKeys(value, inherited) {
        var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result2 = skipIndexes ? baseTimes(value.length, String2) : [], length = result2.length;
        for (var key in value) {
          if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
          (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
          isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
          isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
          isIndex(key, length)))) {
            result2.push(key);
          }
        }
        return result2;
      }
      function arraySample(array2) {
        var length = array2.length;
        return length ? array2[baseRandom(0, length - 1)] : undefined$1;
      }
      function arraySampleSize(array2, n) {
        return shuffleSelf(copyArray(array2), baseClamp(n, 0, array2.length));
      }
      function arrayShuffle(array2) {
        return shuffleSelf(copyArray(array2));
      }
      function assignMergeValue(object2, key, value) {
        if (value !== undefined$1 && !eq2(object2[key], value) || value === undefined$1 && !(key in object2)) {
          baseAssignValue(object2, key, value);
        }
      }
      function assignValue(object2, key, value) {
        var objValue = object2[key];
        if (!(hasOwnProperty.call(object2, key) && eq2(objValue, value)) || value === undefined$1 && !(key in object2)) {
          baseAssignValue(object2, key, value);
        }
      }
      function assocIndexOf(array2, key) {
        var length = array2.length;
        while (length--) {
          if (eq2(array2[length][0], key)) {
            return length;
          }
        }
        return -1;
      }
      function baseAggregator(collection, setter, iteratee2, accumulator) {
        baseEach(collection, function(value, key, collection2) {
          setter(accumulator, value, iteratee2(value), collection2);
        });
        return accumulator;
      }
      function baseAssign(object2, source) {
        return object2 && copyObject(source, keys(source), object2);
      }
      function baseAssignIn(object2, source) {
        return object2 && copyObject(source, keysIn(source), object2);
      }
      function baseAssignValue(object2, key, value) {
        if (key == "__proto__" && defineProperty3) {
          defineProperty3(object2, key, {
            "configurable": true,
            "enumerable": true,
            "value": value,
            "writable": true
          });
        } else {
          object2[key] = value;
        }
      }
      function baseAt(object2, paths) {
        var index = -1, length = paths.length, result2 = Array2(length), skip = object2 == null;
        while (++index < length) {
          result2[index] = skip ? undefined$1 : get3(object2, paths[index]);
        }
        return result2;
      }
      function baseClamp(number, lower, upper) {
        if (number === number) {
          if (upper !== undefined$1) {
            number = number <= upper ? number : upper;
          }
          if (lower !== undefined$1) {
            number = number >= lower ? number : lower;
          }
        }
        return number;
      }
      function baseClone(value, bitmask, customizer, key, object2, stack) {
        var result2, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
        if (customizer) {
          result2 = object2 ? customizer(value, key, object2, stack) : customizer(value);
        }
        if (result2 !== undefined$1) {
          return result2;
        }
        if (!isObject2(value)) {
          return value;
        }
        var isArr = isArray(value);
        if (isArr) {
          result2 = initCloneArray(value);
          if (!isDeep) {
            return copyArray(value, result2);
          }
        } else {
          var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
          if (isBuffer(value)) {
            return cloneBuffer(value, isDeep);
          }
          if (tag == objectTag || tag == argsTag || isFunc && !object2) {
            result2 = isFlat || isFunc ? {} : initCloneObject(value);
            if (!isDeep) {
              return isFlat ? copySymbolsIn(value, baseAssignIn(result2, value)) : copySymbols(value, baseAssign(result2, value));
            }
          } else {
            if (!cloneableTags[tag]) {
              return object2 ? value : {};
            }
            result2 = initCloneByTag(value, tag, isDeep);
          }
        }
        stack || (stack = new Stack());
        var stacked = stack.get(value);
        if (stacked) {
          return stacked;
        }
        stack.set(value, result2);
        if (isSet(value)) {
          value.forEach(function(subValue) {
            result2.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
          });
        } else if (isMap(value)) {
          value.forEach(function(subValue, key2) {
            result2.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
          });
        }
        var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
        var props = isArr ? undefined$1 : keysFunc(value);
        arrayEach(props || value, function(subValue, key2) {
          if (props) {
            key2 = subValue;
            subValue = value[key2];
          }
          assignValue(result2, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
        });
        return result2;
      }
      function baseConforms(source) {
        var props = keys(source);
        return function(object2) {
          return baseConformsTo(object2, source, props);
        };
      }
      function baseConformsTo(object2, source, props) {
        var length = props.length;
        if (object2 == null) {
          return !length;
        }
        object2 = Object2(object2);
        while (length--) {
          var key = props[length], predicate = source[key], value = object2[key];
          if (value === undefined$1 && !(key in object2) || !predicate(value)) {
            return false;
          }
        }
        return true;
      }
      function baseDelay(func, wait, args) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        return setTimeout2(function() {
          func.apply(undefined$1, args);
        }, wait);
      }
      function baseDifference(array2, values2, iteratee2, comparator) {
        var index = -1, includes2 = arrayIncludes, isCommon = true, length = array2.length, result2 = [], valuesLength = values2.length;
        if (!length) {
          return result2;
        }
        if (iteratee2) {
          values2 = arrayMap(values2, baseUnary(iteratee2));
        }
        if (comparator) {
          includes2 = arrayIncludesWith;
          isCommon = false;
        } else if (values2.length >= LARGE_ARRAY_SIZE) {
          includes2 = cacheHas;
          isCommon = false;
          values2 = new SetCache(values2);
        }
        outer:
          while (++index < length) {
            var value = array2[index], computed3 = iteratee2 == null ? value : iteratee2(value);
            value = comparator || value !== 0 ? value : 0;
            if (isCommon && computed3 === computed3) {
              var valuesIndex = valuesLength;
              while (valuesIndex--) {
                if (values2[valuesIndex] === computed3) {
                  continue outer;
                }
              }
              result2.push(value);
            } else if (!includes2(values2, computed3, comparator)) {
              result2.push(value);
            }
          }
        return result2;
      }
      var baseEach = createBaseEach(baseForOwn);
      var baseEachRight = createBaseEach(baseForOwnRight, true);
      function baseEvery(collection, predicate) {
        var result2 = true;
        baseEach(collection, function(value, index, collection2) {
          result2 = !!predicate(value, index, collection2);
          return result2;
        });
        return result2;
      }
      function baseExtremum(array2, iteratee2, comparator) {
        var index = -1, length = array2.length;
        while (++index < length) {
          var value = array2[index], current = iteratee2(value);
          if (current != null && (computed3 === undefined$1 ? current === current && !isSymbol(current) : comparator(current, computed3))) {
            var computed3 = current, result2 = value;
          }
        }
        return result2;
      }
      function baseFill(array2, value, start, end) {
        var length = array2.length;
        start = toInteger(start);
        if (start < 0) {
          start = -start > length ? 0 : length + start;
        }
        end = end === undefined$1 || end > length ? length : toInteger(end);
        if (end < 0) {
          end += length;
        }
        end = start > end ? 0 : toLength(end);
        while (start < end) {
          array2[start++] = value;
        }
        return array2;
      }
      function baseFilter(collection, predicate) {
        var result2 = [];
        baseEach(collection, function(value, index, collection2) {
          if (predicate(value, index, collection2)) {
            result2.push(value);
          }
        });
        return result2;
      }
      function baseFlatten(array2, depth, predicate, isStrict, result2) {
        var index = -1, length = array2.length;
        predicate || (predicate = isFlattenable);
        result2 || (result2 = []);
        while (++index < length) {
          var value = array2[index];
          if (depth > 0 && predicate(value)) {
            if (depth > 1) {
              baseFlatten(value, depth - 1, predicate, isStrict, result2);
            } else {
              arrayPush(result2, value);
            }
          } else if (!isStrict) {
            result2[result2.length] = value;
          }
        }
        return result2;
      }
      var baseFor = createBaseFor();
      var baseForRight = createBaseFor(true);
      function baseForOwn(object2, iteratee2) {
        return object2 && baseFor(object2, iteratee2, keys);
      }
      function baseForOwnRight(object2, iteratee2) {
        return object2 && baseForRight(object2, iteratee2, keys);
      }
      function baseFunctions(object2, props) {
        return arrayFilter(props, function(key) {
          return isFunction2(object2[key]);
        });
      }
      function baseGet(object2, path) {
        path = castPath(path, object2);
        var index = 0, length = path.length;
        while (object2 != null && index < length) {
          object2 = object2[toKey(path[index++])];
        }
        return index && index == length ? object2 : undefined$1;
      }
      function baseGetAllKeys(object2, keysFunc, symbolsFunc) {
        var result2 = keysFunc(object2);
        return isArray(object2) ? result2 : arrayPush(result2, symbolsFunc(object2));
      }
      function baseGetTag(value) {
        if (value == null) {
          return value === undefined$1 ? undefinedTag : nullTag;
        }
        return symToStringTag && symToStringTag in Object2(value) ? getRawTag(value) : objectToString(value);
      }
      function baseGt(value, other) {
        return value > other;
      }
      function baseHas(object2, key) {
        return object2 != null && hasOwnProperty.call(object2, key);
      }
      function baseHasIn(object2, key) {
        return object2 != null && key in Object2(object2);
      }
      function baseInRange(number, start, end) {
        return number >= nativeMin(start, end) && number < nativeMax(start, end);
      }
      function baseIntersection(arrays, iteratee2, comparator) {
        var includes2 = comparator ? arrayIncludesWith : arrayIncludes, length = arrays[0].length, othLength = arrays.length, othIndex = othLength, caches = Array2(othLength), maxLength = Infinity, result2 = [];
        while (othIndex--) {
          var array2 = arrays[othIndex];
          if (othIndex && iteratee2) {
            array2 = arrayMap(array2, baseUnary(iteratee2));
          }
          maxLength = nativeMin(array2.length, maxLength);
          caches[othIndex] = !comparator && (iteratee2 || length >= 120 && array2.length >= 120) ? new SetCache(othIndex && array2) : undefined$1;
        }
        array2 = arrays[0];
        var index = -1, seen = caches[0];
        outer:
          while (++index < length && result2.length < maxLength) {
            var value = array2[index], computed3 = iteratee2 ? iteratee2(value) : value;
            value = comparator || value !== 0 ? value : 0;
            if (!(seen ? cacheHas(seen, computed3) : includes2(result2, computed3, comparator))) {
              othIndex = othLength;
              while (--othIndex) {
                var cache = caches[othIndex];
                if (!(cache ? cacheHas(cache, computed3) : includes2(arrays[othIndex], computed3, comparator))) {
                  continue outer;
                }
              }
              if (seen) {
                seen.push(computed3);
              }
              result2.push(value);
            }
          }
        return result2;
      }
      function baseInverter(object2, setter, iteratee2, accumulator) {
        baseForOwn(object2, function(value, key, object3) {
          setter(accumulator, iteratee2(value), key, object3);
        });
        return accumulator;
      }
      function baseInvoke(object2, path, args) {
        path = castPath(path, object2);
        object2 = parent(object2, path);
        var func = object2 == null ? object2 : object2[toKey(last(path))];
        return func == null ? undefined$1 : apply(func, object2, args);
      }
      function baseIsArguments(value) {
        return isObjectLike(value) && baseGetTag(value) == argsTag;
      }
      function baseIsArrayBuffer(value) {
        return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
      }
      function baseIsDate(value) {
        return isObjectLike(value) && baseGetTag(value) == dateTag;
      }
      function baseIsEqual(value, other, bitmask, customizer, stack) {
        if (value === other) {
          return true;
        }
        if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
          return value !== value && other !== other;
        }
        return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
      }
      function baseIsEqualDeep(object2, other, bitmask, customizer, equalFunc, stack) {
        var objIsArr = isArray(object2), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object2), othTag = othIsArr ? arrayTag : getTag(other);
        objTag = objTag == argsTag ? objectTag : objTag;
        othTag = othTag == argsTag ? objectTag : othTag;
        var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
        if (isSameTag && isBuffer(object2)) {
          if (!isBuffer(other)) {
            return false;
          }
          objIsArr = true;
          objIsObj = false;
        }
        if (isSameTag && !objIsObj) {
          stack || (stack = new Stack());
          return objIsArr || isTypedArray(object2) ? equalArrays(object2, other, bitmask, customizer, equalFunc, stack) : equalByTag(object2, other, objTag, bitmask, customizer, equalFunc, stack);
        }
        if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
          var objIsWrapped = objIsObj && hasOwnProperty.call(object2, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
          if (objIsWrapped || othIsWrapped) {
            var objUnwrapped = objIsWrapped ? object2.value() : object2, othUnwrapped = othIsWrapped ? other.value() : other;
            stack || (stack = new Stack());
            return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
          }
        }
        if (!isSameTag) {
          return false;
        }
        stack || (stack = new Stack());
        return equalObjects(object2, other, bitmask, customizer, equalFunc, stack);
      }
      function baseIsMap(value) {
        return isObjectLike(value) && getTag(value) == mapTag;
      }
      function baseIsMatch(object2, source, matchData, customizer) {
        var index = matchData.length, length = index, noCustomizer = !customizer;
        if (object2 == null) {
          return !length;
        }
        object2 = Object2(object2);
        while (index--) {
          var data = matchData[index];
          if (noCustomizer && data[2] ? data[1] !== object2[data[0]] : !(data[0] in object2)) {
            return false;
          }
        }
        while (++index < length) {
          data = matchData[index];
          var key = data[0], objValue = object2[key], srcValue = data[1];
          if (noCustomizer && data[2]) {
            if (objValue === undefined$1 && !(key in object2)) {
              return false;
            }
          } else {
            var stack = new Stack();
            if (customizer) {
              var result2 = customizer(objValue, srcValue, key, object2, source, stack);
            }
            if (!(result2 === undefined$1 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result2)) {
              return false;
            }
          }
        }
        return true;
      }
      function baseIsNative(value) {
        if (!isObject2(value) || isMasked(value)) {
          return false;
        }
        var pattern = isFunction2(value) ? reIsNative : reIsHostCtor;
        return pattern.test(toSource(value));
      }
      function baseIsRegExp(value) {
        return isObjectLike(value) && baseGetTag(value) == regexpTag;
      }
      function baseIsSet(value) {
        return isObjectLike(value) && getTag(value) == setTag;
      }
      function baseIsTypedArray(value) {
        return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
      }
      function baseIteratee(value) {
        if (typeof value == "function") {
          return value;
        }
        if (value == null) {
          return identity;
        }
        if (typeof value == "object") {
          return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
        }
        return property(value);
      }
      function baseKeys(object2) {
        if (!isPrototype(object2)) {
          return nativeKeys(object2);
        }
        var result2 = [];
        for (var key in Object2(object2)) {
          if (hasOwnProperty.call(object2, key) && key != "constructor") {
            result2.push(key);
          }
        }
        return result2;
      }
      function baseKeysIn(object2) {
        if (!isObject2(object2)) {
          return nativeKeysIn(object2);
        }
        var isProto = isPrototype(object2), result2 = [];
        for (var key in object2) {
          if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object2, key)))) {
            result2.push(key);
          }
        }
        return result2;
      }
      function baseLt(value, other) {
        return value < other;
      }
      function baseMap(collection, iteratee2) {
        var index = -1, result2 = isArrayLike(collection) ? Array2(collection.length) : [];
        baseEach(collection, function(value, key, collection2) {
          result2[++index] = iteratee2(value, key, collection2);
        });
        return result2;
      }
      function baseMatches(source) {
        var matchData = getMatchData(source);
        if (matchData.length == 1 && matchData[0][2]) {
          return matchesStrictComparable(matchData[0][0], matchData[0][1]);
        }
        return function(object2) {
          return object2 === source || baseIsMatch(object2, source, matchData);
        };
      }
      function baseMatchesProperty(path, srcValue) {
        if (isKey(path) && isStrictComparable(srcValue)) {
          return matchesStrictComparable(toKey(path), srcValue);
        }
        return function(object2) {
          var objValue = get3(object2, path);
          return objValue === undefined$1 && objValue === srcValue ? hasIn(object2, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
        };
      }
      function baseMerge(object2, source, srcIndex, customizer, stack) {
        if (object2 === source) {
          return;
        }
        baseFor(source, function(srcValue, key) {
          stack || (stack = new Stack());
          if (isObject2(srcValue)) {
            baseMergeDeep(object2, source, key, srcIndex, baseMerge, customizer, stack);
          } else {
            var newValue = customizer ? customizer(safeGet(object2, key), srcValue, key + "", object2, source, stack) : undefined$1;
            if (newValue === undefined$1) {
              newValue = srcValue;
            }
            assignMergeValue(object2, key, newValue);
          }
        }, keysIn);
      }
      function baseMergeDeep(object2, source, key, srcIndex, mergeFunc, customizer, stack) {
        var objValue = safeGet(object2, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
        if (stacked) {
          assignMergeValue(object2, key, stacked);
          return;
        }
        var newValue = customizer ? customizer(objValue, srcValue, key + "", object2, source, stack) : undefined$1;
        var isCommon = newValue === undefined$1;
        if (isCommon) {
          var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
          newValue = srcValue;
          if (isArr || isBuff || isTyped) {
            if (isArray(objValue)) {
              newValue = objValue;
            } else if (isArrayLikeObject(objValue)) {
              newValue = copyArray(objValue);
            } else if (isBuff) {
              isCommon = false;
              newValue = cloneBuffer(srcValue, true);
            } else if (isTyped) {
              isCommon = false;
              newValue = cloneTypedArray(srcValue, true);
            } else {
              newValue = [];
            }
          } else if (isPlainObject2(srcValue) || isArguments(srcValue)) {
            newValue = objValue;
            if (isArguments(objValue)) {
              newValue = toPlainObject(objValue);
            } else if (!isObject2(objValue) || isFunction2(objValue)) {
              newValue = initCloneObject(srcValue);
            }
          } else {
            isCommon = false;
          }
        }
        if (isCommon) {
          stack.set(srcValue, newValue);
          mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
          stack["delete"](srcValue);
        }
        assignMergeValue(object2, key, newValue);
      }
      function baseNth(array2, n) {
        var length = array2.length;
        if (!length) {
          return;
        }
        n += n < 0 ? length : 0;
        return isIndex(n, length) ? array2[n] : undefined$1;
      }
      function baseOrderBy(collection, iteratees, orders) {
        if (iteratees.length) {
          iteratees = arrayMap(iteratees, function(iteratee2) {
            if (isArray(iteratee2)) {
              return function(value) {
                return baseGet(value, iteratee2.length === 1 ? iteratee2[0] : iteratee2);
              };
            }
            return iteratee2;
          });
        } else {
          iteratees = [identity];
        }
        var index = -1;
        iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
        var result2 = baseMap(collection, function(value, key, collection2) {
          var criteria = arrayMap(iteratees, function(iteratee2) {
            return iteratee2(value);
          });
          return { "criteria": criteria, "index": ++index, "value": value };
        });
        return baseSortBy(result2, function(object2, other) {
          return compareMultiple(object2, other, orders);
        });
      }
      function basePick(object2, paths) {
        return basePickBy(object2, paths, function(value, path) {
          return hasIn(object2, path);
        });
      }
      function basePickBy(object2, paths, predicate) {
        var index = -1, length = paths.length, result2 = {};
        while (++index < length) {
          var path = paths[index], value = baseGet(object2, path);
          if (predicate(value, path)) {
            baseSet(result2, castPath(path, object2), value);
          }
        }
        return result2;
      }
      function basePropertyDeep(path) {
        return function(object2) {
          return baseGet(object2, path);
        };
      }
      function basePullAll(array2, values2, iteratee2, comparator) {
        var indexOf2 = comparator ? baseIndexOfWith : baseIndexOf, index = -1, length = values2.length, seen = array2;
        if (array2 === values2) {
          values2 = copyArray(values2);
        }
        if (iteratee2) {
          seen = arrayMap(array2, baseUnary(iteratee2));
        }
        while (++index < length) {
          var fromIndex = 0, value = values2[index], computed3 = iteratee2 ? iteratee2(value) : value;
          while ((fromIndex = indexOf2(seen, computed3, fromIndex, comparator)) > -1) {
            if (seen !== array2) {
              splice2.call(seen, fromIndex, 1);
            }
            splice2.call(array2, fromIndex, 1);
          }
        }
        return array2;
      }
      function basePullAt(array2, indexes) {
        var length = array2 ? indexes.length : 0, lastIndex = length - 1;
        while (length--) {
          var index = indexes[length];
          if (length == lastIndex || index !== previous) {
            var previous = index;
            if (isIndex(index)) {
              splice2.call(array2, index, 1);
            } else {
              baseUnset(array2, index);
            }
          }
        }
        return array2;
      }
      function baseRandom(lower, upper) {
        return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
      }
      function baseRange(start, end, step, fromRight) {
        var index = -1, length = nativeMax(nativeCeil((end - start) / (step || 1)), 0), result2 = Array2(length);
        while (length--) {
          result2[fromRight ? length : ++index] = start;
          start += step;
        }
        return result2;
      }
      function baseRepeat(string, n) {
        var result2 = "";
        if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
          return result2;
        }
        do {
          if (n % 2) {
            result2 += string;
          }
          n = nativeFloor(n / 2);
          if (n) {
            string += string;
          }
        } while (n);
        return result2;
      }
      function baseRest(func, start) {
        return setToString(overRest(func, start, identity), func + "");
      }
      function baseSample(collection) {
        return arraySample(values(collection));
      }
      function baseSampleSize(collection, n) {
        var array2 = values(collection);
        return shuffleSelf(array2, baseClamp(n, 0, array2.length));
      }
      function baseSet(object2, path, value, customizer) {
        if (!isObject2(object2)) {
          return object2;
        }
        path = castPath(path, object2);
        var index = -1, length = path.length, lastIndex = length - 1, nested = object2;
        while (nested != null && ++index < length) {
          var key = toKey(path[index]), newValue = value;
          if (key === "__proto__" || key === "constructor" || key === "prototype") {
            return object2;
          }
          if (index != lastIndex) {
            var objValue = nested[key];
            newValue = customizer ? customizer(objValue, key, nested) : undefined$1;
            if (newValue === undefined$1) {
              newValue = isObject2(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
            }
          }
          assignValue(nested, key, newValue);
          nested = nested[key];
        }
        return object2;
      }
      var baseSetData = !metaMap ? identity : function(func, data) {
        metaMap.set(func, data);
        return func;
      };
      var baseSetToString = !defineProperty3 ? identity : function(func, string) {
        return defineProperty3(func, "toString", {
          "configurable": true,
          "enumerable": false,
          "value": constant(string),
          "writable": true
        });
      };
      function baseShuffle(collection) {
        return shuffleSelf(values(collection));
      }
      function baseSlice(array2, start, end) {
        var index = -1, length = array2.length;
        if (start < 0) {
          start = -start > length ? 0 : length + start;
        }
        end = end > length ? length : end;
        if (end < 0) {
          end += length;
        }
        length = start > end ? 0 : end - start >>> 0;
        start >>>= 0;
        var result2 = Array2(length);
        while (++index < length) {
          result2[index] = array2[index + start];
        }
        return result2;
      }
      function baseSome(collection, predicate) {
        var result2;
        baseEach(collection, function(value, index, collection2) {
          result2 = predicate(value, index, collection2);
          return !result2;
        });
        return !!result2;
      }
      function baseSortedIndex(array2, value, retHighest) {
        var low = 0, high = array2 == null ? low : array2.length;
        if (typeof value == "number" && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
          while (low < high) {
            var mid = low + high >>> 1, computed3 = array2[mid];
            if (computed3 !== null && !isSymbol(computed3) && (retHighest ? computed3 <= value : computed3 < value)) {
              low = mid + 1;
            } else {
              high = mid;
            }
          }
          return high;
        }
        return baseSortedIndexBy(array2, value, identity, retHighest);
      }
      function baseSortedIndexBy(array2, value, iteratee2, retHighest) {
        var low = 0, high = array2 == null ? 0 : array2.length;
        if (high === 0) {
          return 0;
        }
        value = iteratee2(value);
        var valIsNaN = value !== value, valIsNull = value === null, valIsSymbol = isSymbol(value), valIsUndefined = value === undefined$1;
        while (low < high) {
          var mid = nativeFloor((low + high) / 2), computed3 = iteratee2(array2[mid]), othIsDefined = computed3 !== undefined$1, othIsNull = computed3 === null, othIsReflexive = computed3 === computed3, othIsSymbol = isSymbol(computed3);
          if (valIsNaN) {
            var setLow = retHighest || othIsReflexive;
          } else if (valIsUndefined) {
            setLow = othIsReflexive && (retHighest || othIsDefined);
          } else if (valIsNull) {
            setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
          } else if (valIsSymbol) {
            setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
          } else if (othIsNull || othIsSymbol) {
            setLow = false;
          } else {
            setLow = retHighest ? computed3 <= value : computed3 < value;
          }
          if (setLow) {
            low = mid + 1;
          } else {
            high = mid;
          }
        }
        return nativeMin(high, MAX_ARRAY_INDEX);
      }
      function baseSortedUniq(array2, iteratee2) {
        var index = -1, length = array2.length, resIndex = 0, result2 = [];
        while (++index < length) {
          var value = array2[index], computed3 = iteratee2 ? iteratee2(value) : value;
          if (!index || !eq2(computed3, seen)) {
            var seen = computed3;
            result2[resIndex++] = value === 0 ? 0 : value;
          }
        }
        return result2;
      }
      function baseToNumber(value) {
        if (typeof value == "number") {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        return +value;
      }
      function baseToString(value) {
        if (typeof value == "string") {
          return value;
        }
        if (isArray(value)) {
          return arrayMap(value, baseToString) + "";
        }
        if (isSymbol(value)) {
          return symbolToString ? symbolToString.call(value) : "";
        }
        var result2 = value + "";
        return result2 == "0" && 1 / value == -INFINITY ? "-0" : result2;
      }
      function baseUniq(array2, iteratee2, comparator) {
        var index = -1, includes2 = arrayIncludes, length = array2.length, isCommon = true, result2 = [], seen = result2;
        if (comparator) {
          isCommon = false;
          includes2 = arrayIncludesWith;
        } else if (length >= LARGE_ARRAY_SIZE) {
          var set5 = iteratee2 ? null : createSet(array2);
          if (set5) {
            return setToArray(set5);
          }
          isCommon = false;
          includes2 = cacheHas;
          seen = new SetCache();
        } else {
          seen = iteratee2 ? [] : result2;
        }
        outer:
          while (++index < length) {
            var value = array2[index], computed3 = iteratee2 ? iteratee2(value) : value;
            value = comparator || value !== 0 ? value : 0;
            if (isCommon && computed3 === computed3) {
              var seenIndex = seen.length;
              while (seenIndex--) {
                if (seen[seenIndex] === computed3) {
                  continue outer;
                }
              }
              if (iteratee2) {
                seen.push(computed3);
              }
              result2.push(value);
            } else if (!includes2(seen, computed3, comparator)) {
              if (seen !== result2) {
                seen.push(computed3);
              }
              result2.push(value);
            }
          }
        return result2;
      }
      function baseUnset(object2, path) {
        path = castPath(path, object2);
        object2 = parent(object2, path);
        return object2 == null || delete object2[toKey(last(path))];
      }
      function baseUpdate(object2, path, updater, customizer) {
        return baseSet(object2, path, updater(baseGet(object2, path)), customizer);
      }
      function baseWhile(array2, predicate, isDrop, fromRight) {
        var length = array2.length, index = fromRight ? length : -1;
        while ((fromRight ? index-- : ++index < length) && predicate(array2[index], index, array2)) {
        }
        return isDrop ? baseSlice(array2, fromRight ? 0 : index, fromRight ? index + 1 : length) : baseSlice(array2, fromRight ? index + 1 : 0, fromRight ? length : index);
      }
      function baseWrapperValue(value, actions) {
        var result2 = value;
        if (result2 instanceof LazyWrapper) {
          result2 = result2.value();
        }
        return arrayReduce(actions, function(result3, action2) {
          return action2.func.apply(action2.thisArg, arrayPush([result3], action2.args));
        }, result2);
      }
      function baseXor(arrays, iteratee2, comparator) {
        var length = arrays.length;
        if (length < 2) {
          return length ? baseUniq(arrays[0]) : [];
        }
        var index = -1, result2 = Array2(length);
        while (++index < length) {
          var array2 = arrays[index], othIndex = -1;
          while (++othIndex < length) {
            if (othIndex != index) {
              result2[index] = baseDifference(result2[index] || array2, arrays[othIndex], iteratee2, comparator);
            }
          }
        }
        return baseUniq(baseFlatten(result2, 1), iteratee2, comparator);
      }
      function baseZipObject(props, values2, assignFunc) {
        var index = -1, length = props.length, valsLength = values2.length, result2 = {};
        while (++index < length) {
          var value = index < valsLength ? values2[index] : undefined$1;
          assignFunc(result2, props[index], value);
        }
        return result2;
      }
      function castArrayLikeObject(value) {
        return isArrayLikeObject(value) ? value : [];
      }
      function castFunction(value) {
        return typeof value == "function" ? value : identity;
      }
      function castPath(value, object2) {
        if (isArray(value)) {
          return value;
        }
        return isKey(value, object2) ? [value] : stringToPath(toString2(value));
      }
      var castRest = baseRest;
      function castSlice(array2, start, end) {
        var length = array2.length;
        end = end === undefined$1 ? length : end;
        return !start && end >= length ? array2 : baseSlice(array2, start, end);
      }
      var clearTimeout = ctxClearTimeout || function(id) {
        return root.clearTimeout(id);
      };
      function cloneBuffer(buffer, isDeep) {
        if (isDeep) {
          return buffer.slice();
        }
        var length = buffer.length, result2 = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
        buffer.copy(result2);
        return result2;
      }
      function cloneArrayBuffer(arrayBuffer) {
        var result2 = new arrayBuffer.constructor(arrayBuffer.byteLength);
        new Uint8Array2(result2).set(new Uint8Array2(arrayBuffer));
        return result2;
      }
      function cloneDataView(dataView, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
        return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
      }
      function cloneRegExp(regexp) {
        var result2 = new regexp.constructor(regexp.source, reFlags.exec(regexp));
        result2.lastIndex = regexp.lastIndex;
        return result2;
      }
      function cloneSymbol(symbol) {
        return symbolValueOf ? Object2(symbolValueOf.call(symbol)) : {};
      }
      function cloneTypedArray(typedArray, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
        return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
      }
      function compareAscending(value, other) {
        if (value !== other) {
          var valIsDefined = value !== undefined$1, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
          var othIsDefined = other !== undefined$1, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
          if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
            return 1;
          }
          if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
            return -1;
          }
        }
        return 0;
      }
      function compareMultiple(object2, other, orders) {
        var index = -1, objCriteria = object2.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
        while (++index < length) {
          var result2 = compareAscending(objCriteria[index], othCriteria[index]);
          if (result2) {
            if (index >= ordersLength) {
              return result2;
            }
            var order = orders[index];
            return result2 * (order == "desc" ? -1 : 1);
          }
        }
        return object2.index - other.index;
      }
      function composeArgs(args, partials, holders, isCurried) {
        var argsIndex = -1, argsLength = args.length, holdersLength = holders.length, leftIndex = -1, leftLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result2 = Array2(leftLength + rangeLength), isUncurried = !isCurried;
        while (++leftIndex < leftLength) {
          result2[leftIndex] = partials[leftIndex];
        }
        while (++argsIndex < holdersLength) {
          if (isUncurried || argsIndex < argsLength) {
            result2[holders[argsIndex]] = args[argsIndex];
          }
        }
        while (rangeLength--) {
          result2[leftIndex++] = args[argsIndex++];
        }
        return result2;
      }
      function composeArgsRight(args, partials, holders, isCurried) {
        var argsIndex = -1, argsLength = args.length, holdersIndex = -1, holdersLength = holders.length, rightIndex = -1, rightLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result2 = Array2(rangeLength + rightLength), isUncurried = !isCurried;
        while (++argsIndex < rangeLength) {
          result2[argsIndex] = args[argsIndex];
        }
        var offset = argsIndex;
        while (++rightIndex < rightLength) {
          result2[offset + rightIndex] = partials[rightIndex];
        }
        while (++holdersIndex < holdersLength) {
          if (isUncurried || argsIndex < argsLength) {
            result2[offset + holders[holdersIndex]] = args[argsIndex++];
          }
        }
        return result2;
      }
      function copyArray(source, array2) {
        var index = -1, length = source.length;
        array2 || (array2 = Array2(length));
        while (++index < length) {
          array2[index] = source[index];
        }
        return array2;
      }
      function copyObject(source, props, object2, customizer) {
        var isNew = !object2;
        object2 || (object2 = {});
        var index = -1, length = props.length;
        while (++index < length) {
          var key = props[index];
          var newValue = customizer ? customizer(object2[key], source[key], key, object2, source) : undefined$1;
          if (newValue === undefined$1) {
            newValue = source[key];
          }
          if (isNew) {
            baseAssignValue(object2, key, newValue);
          } else {
            assignValue(object2, key, newValue);
          }
        }
        return object2;
      }
      function copySymbols(source, object2) {
        return copyObject(source, getSymbols(source), object2);
      }
      function copySymbolsIn(source, object2) {
        return copyObject(source, getSymbolsIn(source), object2);
      }
      function createAggregator(setter, initializer) {
        return function(collection, iteratee2) {
          var func = isArray(collection) ? arrayAggregator : baseAggregator, accumulator = initializer ? initializer() : {};
          return func(collection, setter, getIteratee(iteratee2, 2), accumulator);
        };
      }
      function createAssigner(assigner) {
        return baseRest(function(object2, sources) {
          var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : undefined$1, guard = length > 2 ? sources[2] : undefined$1;
          customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : undefined$1;
          if (guard && isIterateeCall(sources[0], sources[1], guard)) {
            customizer = length < 3 ? undefined$1 : customizer;
            length = 1;
          }
          object2 = Object2(object2);
          while (++index < length) {
            var source = sources[index];
            if (source) {
              assigner(object2, source, index, customizer);
            }
          }
          return object2;
        });
      }
      function createBaseEach(eachFunc, fromRight) {
        return function(collection, iteratee2) {
          if (collection == null) {
            return collection;
          }
          if (!isArrayLike(collection)) {
            return eachFunc(collection, iteratee2);
          }
          var length = collection.length, index = fromRight ? length : -1, iterable = Object2(collection);
          while (fromRight ? index-- : ++index < length) {
            if (iteratee2(iterable[index], index, iterable) === false) {
              break;
            }
          }
          return collection;
        };
      }
      function createBaseFor(fromRight) {
        return function(object2, iteratee2, keysFunc) {
          var index = -1, iterable = Object2(object2), props = keysFunc(object2), length = props.length;
          while (length--) {
            var key = props[fromRight ? length : ++index];
            if (iteratee2(iterable[key], key, iterable) === false) {
              break;
            }
          }
          return object2;
        };
      }
      function createBind(func, bitmask, thisArg) {
        var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
        function wrapper() {
          var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
          return fn.apply(isBind ? thisArg : this, arguments);
        }
        return wrapper;
      }
      function createCaseFirst(methodName) {
        return function(string) {
          string = toString2(string);
          var strSymbols = hasUnicode(string) ? stringToArray(string) : undefined$1;
          var chr = strSymbols ? strSymbols[0] : string.charAt(0);
          var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
          return chr[methodName]() + trailing;
        };
      }
      function createCompounder(callback) {
        return function(string) {
          return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
        };
      }
      function createCtor(Ctor) {
        return function() {
          var args = arguments;
          switch (args.length) {
            case 0:
              return new Ctor();
            case 1:
              return new Ctor(args[0]);
            case 2:
              return new Ctor(args[0], args[1]);
            case 3:
              return new Ctor(args[0], args[1], args[2]);
            case 4:
              return new Ctor(args[0], args[1], args[2], args[3]);
            case 5:
              return new Ctor(args[0], args[1], args[2], args[3], args[4]);
            case 6:
              return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
            case 7:
              return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
          }
          var thisBinding = baseCreate(Ctor.prototype), result2 = Ctor.apply(thisBinding, args);
          return isObject2(result2) ? result2 : thisBinding;
        };
      }
      function createCurry(func, bitmask, arity) {
        var Ctor = createCtor(func);
        function wrapper() {
          var length = arguments.length, args = Array2(length), index = length, placeholder = getHolder(wrapper);
          while (index--) {
            args[index] = arguments[index];
          }
          var holders = length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder ? [] : replaceHolders(args, placeholder);
          length -= holders.length;
          if (length < arity) {
            return createRecurry(
              func,
              bitmask,
              createHybrid,
              wrapper.placeholder,
              undefined$1,
              args,
              holders,
              undefined$1,
              undefined$1,
              arity - length
            );
          }
          var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
          return apply(fn, this, args);
        }
        return wrapper;
      }
      function createFind(findIndexFunc) {
        return function(collection, predicate, fromIndex) {
          var iterable = Object2(collection);
          if (!isArrayLike(collection)) {
            var iteratee2 = getIteratee(predicate, 3);
            collection = keys(collection);
            predicate = function(key) {
              return iteratee2(iterable[key], key, iterable);
            };
          }
          var index = findIndexFunc(collection, predicate, fromIndex);
          return index > -1 ? iterable[iteratee2 ? collection[index] : index] : undefined$1;
        };
      }
      function createFlow(fromRight) {
        return flatRest(function(funcs) {
          var length = funcs.length, index = length, prereq = LodashWrapper.prototype.thru;
          if (fromRight) {
            funcs.reverse();
          }
          while (index--) {
            var func = funcs[index];
            if (typeof func != "function") {
              throw new TypeError2(FUNC_ERROR_TEXT);
            }
            if (prereq && !wrapper && getFuncName(func) == "wrapper") {
              var wrapper = new LodashWrapper([], true);
            }
          }
          index = wrapper ? index : length;
          while (++index < length) {
            func = funcs[index];
            var funcName = getFuncName(func), data = funcName == "wrapper" ? getData(func) : undefined$1;
            if (data && isLaziable(data[0]) && data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) && !data[4].length && data[9] == 1) {
              wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
            } else {
              wrapper = func.length == 1 && isLaziable(func) ? wrapper[funcName]() : wrapper.thru(func);
            }
          }
          return function() {
            var args = arguments, value = args[0];
            if (wrapper && args.length == 1 && isArray(value)) {
              return wrapper.plant(value).value();
            }
            var index2 = 0, result2 = length ? funcs[index2].apply(this, args) : value;
            while (++index2 < length) {
              result2 = funcs[index2].call(this, result2);
            }
            return result2;
          };
        });
      }
      function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary2, arity) {
        var isAry = bitmask & WRAP_ARY_FLAG, isBind = bitmask & WRAP_BIND_FLAG, isBindKey = bitmask & WRAP_BIND_KEY_FLAG, isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG), isFlip = bitmask & WRAP_FLIP_FLAG, Ctor = isBindKey ? undefined$1 : createCtor(func);
        function wrapper() {
          var length = arguments.length, args = Array2(length), index = length;
          while (index--) {
            args[index] = arguments[index];
          }
          if (isCurried) {
            var placeholder = getHolder(wrapper), holdersCount = countHolders(args, placeholder);
          }
          if (partials) {
            args = composeArgs(args, partials, holders, isCurried);
          }
          if (partialsRight) {
            args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
          }
          length -= holdersCount;
          if (isCurried && length < arity) {
            var newHolders = replaceHolders(args, placeholder);
            return createRecurry(
              func,
              bitmask,
              createHybrid,
              wrapper.placeholder,
              thisArg,
              args,
              newHolders,
              argPos,
              ary2,
              arity - length
            );
          }
          var thisBinding = isBind ? thisArg : this, fn = isBindKey ? thisBinding[func] : func;
          length = args.length;
          if (argPos) {
            args = reorder(args, argPos);
          } else if (isFlip && length > 1) {
            args.reverse();
          }
          if (isAry && ary2 < length) {
            args.length = ary2;
          }
          if (this && this !== root && this instanceof wrapper) {
            fn = Ctor || createCtor(fn);
          }
          return fn.apply(thisBinding, args);
        }
        return wrapper;
      }
      function createInverter(setter, toIteratee) {
        return function(object2, iteratee2) {
          return baseInverter(object2, setter, toIteratee(iteratee2), {});
        };
      }
      function createMathOperation(operator, defaultValue) {
        return function(value, other) {
          var result2;
          if (value === undefined$1 && other === undefined$1) {
            return defaultValue;
          }
          if (value !== undefined$1) {
            result2 = value;
          }
          if (other !== undefined$1) {
            if (result2 === undefined$1) {
              return other;
            }
            if (typeof value == "string" || typeof other == "string") {
              value = baseToString(value);
              other = baseToString(other);
            } else {
              value = baseToNumber(value);
              other = baseToNumber(other);
            }
            result2 = operator(value, other);
          }
          return result2;
        };
      }
      function createOver(arrayFunc) {
        return flatRest(function(iteratees) {
          iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
          return baseRest(function(args) {
            var thisArg = this;
            return arrayFunc(iteratees, function(iteratee2) {
              return apply(iteratee2, thisArg, args);
            });
          });
        });
      }
      function createPadding(length, chars) {
        chars = chars === undefined$1 ? " " : baseToString(chars);
        var charsLength = chars.length;
        if (charsLength < 2) {
          return charsLength ? baseRepeat(chars, length) : chars;
        }
        var result2 = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
        return hasUnicode(chars) ? castSlice(stringToArray(result2), 0, length).join("") : result2.slice(0, length);
      }
      function createPartial(func, bitmask, thisArg, partials) {
        var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
        function wrapper() {
          var argsIndex = -1, argsLength = arguments.length, leftIndex = -1, leftLength = partials.length, args = Array2(leftLength + argsLength), fn = this && this !== root && this instanceof wrapper ? Ctor : func;
          while (++leftIndex < leftLength) {
            args[leftIndex] = partials[leftIndex];
          }
          while (argsLength--) {
            args[leftIndex++] = arguments[++argsIndex];
          }
          return apply(fn, isBind ? thisArg : this, args);
        }
        return wrapper;
      }
      function createRange(fromRight) {
        return function(start, end, step) {
          if (step && typeof step != "number" && isIterateeCall(start, end, step)) {
            end = step = undefined$1;
          }
          start = toFinite(start);
          if (end === undefined$1) {
            end = start;
            start = 0;
          } else {
            end = toFinite(end);
          }
          step = step === undefined$1 ? start < end ? 1 : -1 : toFinite(step);
          return baseRange(start, end, step, fromRight);
        };
      }
      function createRelationalOperation(operator) {
        return function(value, other) {
          if (!(typeof value == "string" && typeof other == "string")) {
            value = toNumber(value);
            other = toNumber(other);
          }
          return operator(value, other);
        };
      }
      function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary2, arity) {
        var isCurry = bitmask & WRAP_CURRY_FLAG, newHolders = isCurry ? holders : undefined$1, newHoldersRight = isCurry ? undefined$1 : holders, newPartials = isCurry ? partials : undefined$1, newPartialsRight = isCurry ? undefined$1 : partials;
        bitmask |= isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG;
        bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);
        if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) {
          bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
        }
        var newData = [
          func,
          bitmask,
          thisArg,
          newPartials,
          newHolders,
          newPartialsRight,
          newHoldersRight,
          argPos,
          ary2,
          arity
        ];
        var result2 = wrapFunc.apply(undefined$1, newData);
        if (isLaziable(func)) {
          setData(result2, newData);
        }
        result2.placeholder = placeholder;
        return setWrapToString(result2, func, bitmask);
      }
      function createRound(methodName) {
        var func = Math2[methodName];
        return function(number, precision) {
          number = toNumber(number);
          precision = precision == null ? 0 : nativeMin(toInteger(precision), 292);
          if (precision && nativeIsFinite(number)) {
            var pair = (toString2(number) + "e").split("e"), value = func(pair[0] + "e" + (+pair[1] + precision));
            pair = (toString2(value) + "e").split("e");
            return +(pair[0] + "e" + (+pair[1] - precision));
          }
          return func(number);
        };
      }
      var createSet = !(Set2 && 1 / setToArray(new Set2([, -0]))[1] == INFINITY) ? noop2 : function(values2) {
        return new Set2(values2);
      };
      function createToPairs(keysFunc) {
        return function(object2) {
          var tag = getTag(object2);
          if (tag == mapTag) {
            return mapToArray(object2);
          }
          if (tag == setTag) {
            return setToPairs(object2);
          }
          return baseToPairs(object2, keysFunc(object2));
        };
      }
      function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary2, arity) {
        var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
        if (!isBindKey && typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        var length = partials ? partials.length : 0;
        if (!length) {
          bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
          partials = holders = undefined$1;
        }
        ary2 = ary2 === undefined$1 ? ary2 : nativeMax(toInteger(ary2), 0);
        arity = arity === undefined$1 ? arity : toInteger(arity);
        length -= holders ? holders.length : 0;
        if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
          var partialsRight = partials, holdersRight = holders;
          partials = holders = undefined$1;
        }
        var data = isBindKey ? undefined$1 : getData(func);
        var newData = [
          func,
          bitmask,
          thisArg,
          partials,
          holders,
          partialsRight,
          holdersRight,
          argPos,
          ary2,
          arity
        ];
        if (data) {
          mergeData(newData, data);
        }
        func = newData[0];
        bitmask = newData[1];
        thisArg = newData[2];
        partials = newData[3];
        holders = newData[4];
        arity = newData[9] = newData[9] === undefined$1 ? isBindKey ? 0 : func.length : nativeMax(newData[9] - length, 0);
        if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
          bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
        }
        if (!bitmask || bitmask == WRAP_BIND_FLAG) {
          var result2 = createBind(func, bitmask, thisArg);
        } else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
          result2 = createCurry(func, bitmask, arity);
        } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
          result2 = createPartial(func, bitmask, thisArg, partials);
        } else {
          result2 = createHybrid.apply(undefined$1, newData);
        }
        var setter = data ? baseSetData : setData;
        return setWrapToString(setter(result2, newData), func, bitmask);
      }
      function customDefaultsAssignIn(objValue, srcValue, key, object2) {
        if (objValue === undefined$1 || eq2(objValue, objectProto[key]) && !hasOwnProperty.call(object2, key)) {
          return srcValue;
        }
        return objValue;
      }
      function customDefaultsMerge(objValue, srcValue, key, object2, source, stack) {
        if (isObject2(objValue) && isObject2(srcValue)) {
          stack.set(srcValue, objValue);
          baseMerge(objValue, srcValue, undefined$1, customDefaultsMerge, stack);
          stack["delete"](srcValue);
        }
        return objValue;
      }
      function customOmitClone(value) {
        return isPlainObject2(value) ? undefined$1 : value;
      }
      function equalArrays(array2, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array2.length, othLength = other.length;
        if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
          return false;
        }
        var arrStacked = stack.get(array2);
        var othStacked = stack.get(other);
        if (arrStacked && othStacked) {
          return arrStacked == other && othStacked == array2;
        }
        var index = -1, result2 = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined$1;
        stack.set(array2, other);
        stack.set(other, array2);
        while (++index < arrLength) {
          var arrValue = array2[index], othValue = other[index];
          if (customizer) {
            var compared = isPartial ? customizer(othValue, arrValue, index, other, array2, stack) : customizer(arrValue, othValue, index, array2, other, stack);
          }
          if (compared !== undefined$1) {
            if (compared) {
              continue;
            }
            result2 = false;
            break;
          }
          if (seen) {
            if (!arraySome(other, function(othValue2, othIndex) {
              if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
                return seen.push(othIndex);
              }
            })) {
              result2 = false;
              break;
            }
          } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
            result2 = false;
            break;
          }
        }
        stack["delete"](array2);
        stack["delete"](other);
        return result2;
      }
      function equalByTag(object2, other, tag, bitmask, customizer, equalFunc, stack) {
        switch (tag) {
          case dataViewTag:
            if (object2.byteLength != other.byteLength || object2.byteOffset != other.byteOffset) {
              return false;
            }
            object2 = object2.buffer;
            other = other.buffer;
          case arrayBufferTag:
            if (object2.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object2), new Uint8Array2(other))) {
              return false;
            }
            return true;
          case boolTag:
          case dateTag:
          case numberTag:
            return eq2(+object2, +other);
          case errorTag:
            return object2.name == other.name && object2.message == other.message;
          case regexpTag:
          case stringTag:
            return object2 == other + "";
          case mapTag:
            var convert = mapToArray;
          case setTag:
            var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
            convert || (convert = setToArray);
            if (object2.size != other.size && !isPartial) {
              return false;
            }
            var stacked = stack.get(object2);
            if (stacked) {
              return stacked == other;
            }
            bitmask |= COMPARE_UNORDERED_FLAG;
            stack.set(object2, other);
            var result2 = equalArrays(convert(object2), convert(other), bitmask, customizer, equalFunc, stack);
            stack["delete"](object2);
            return result2;
          case symbolTag:
            if (symbolValueOf) {
              return symbolValueOf.call(object2) == symbolValueOf.call(other);
            }
        }
        return false;
      }
      function equalObjects(object2, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object2), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
        if (objLength != othLength && !isPartial) {
          return false;
        }
        var index = objLength;
        while (index--) {
          var key = objProps[index];
          if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
            return false;
          }
        }
        var objStacked = stack.get(object2);
        var othStacked = stack.get(other);
        if (objStacked && othStacked) {
          return objStacked == other && othStacked == object2;
        }
        var result2 = true;
        stack.set(object2, other);
        stack.set(other, object2);
        var skipCtor = isPartial;
        while (++index < objLength) {
          key = objProps[index];
          var objValue = object2[key], othValue = other[key];
          if (customizer) {
            var compared = isPartial ? customizer(othValue, objValue, key, other, object2, stack) : customizer(objValue, othValue, key, object2, other, stack);
          }
          if (!(compared === undefined$1 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
            result2 = false;
            break;
          }
          skipCtor || (skipCtor = key == "constructor");
        }
        if (result2 && !skipCtor) {
          var objCtor = object2.constructor, othCtor = other.constructor;
          if (objCtor != othCtor && ("constructor" in object2 && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
            result2 = false;
          }
        }
        stack["delete"](object2);
        stack["delete"](other);
        return result2;
      }
      function flatRest(func) {
        return setToString(overRest(func, undefined$1, flatten), func + "");
      }
      function getAllKeys(object2) {
        return baseGetAllKeys(object2, keys, getSymbols);
      }
      function getAllKeysIn(object2) {
        return baseGetAllKeys(object2, keysIn, getSymbolsIn);
      }
      var getData = !metaMap ? noop2 : function(func) {
        return metaMap.get(func);
      };
      function getFuncName(func) {
        var result2 = func.name + "", array2 = realNames[result2], length = hasOwnProperty.call(realNames, result2) ? array2.length : 0;
        while (length--) {
          var data = array2[length], otherFunc = data.func;
          if (otherFunc == null || otherFunc == func) {
            return data.name;
          }
        }
        return result2;
      }
      function getHolder(func) {
        var object2 = hasOwnProperty.call(lodash2, "placeholder") ? lodash2 : func;
        return object2.placeholder;
      }
      function getIteratee() {
        var result2 = lodash2.iteratee || iteratee;
        result2 = result2 === iteratee ? baseIteratee : result2;
        return arguments.length ? result2(arguments[0], arguments[1]) : result2;
      }
      function getMapData(map3, key) {
        var data = map3.__data__;
        return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
      }
      function getMatchData(object2) {
        var result2 = keys(object2), length = result2.length;
        while (length--) {
          var key = result2[length], value = object2[key];
          result2[length] = [key, value, isStrictComparable(value)];
        }
        return result2;
      }
      function getNative(object2, key) {
        var value = getValue(object2, key);
        return baseIsNative(value) ? value : undefined$1;
      }
      function getRawTag(value) {
        var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
        try {
          value[symToStringTag] = undefined$1;
          var unmasked = true;
        } catch (e) {
        }
        var result2 = nativeObjectToString.call(value);
        if (unmasked) {
          if (isOwn) {
            value[symToStringTag] = tag;
          } else {
            delete value[symToStringTag];
          }
        }
        return result2;
      }
      var getSymbols = !nativeGetSymbols ? stubArray : function(object2) {
        if (object2 == null) {
          return [];
        }
        object2 = Object2(object2);
        return arrayFilter(nativeGetSymbols(object2), function(symbol) {
          return propertyIsEnumerable.call(object2, symbol);
        });
      };
      var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object2) {
        var result2 = [];
        while (object2) {
          arrayPush(result2, getSymbols(object2));
          object2 = getPrototype(object2);
        }
        return result2;
      };
      var getTag = baseGetTag;
      if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap2 && getTag(new WeakMap2()) != weakMapTag) {
        getTag = function(value) {
          var result2 = baseGetTag(value), Ctor = result2 == objectTag ? value.constructor : undefined$1, ctorString = Ctor ? toSource(Ctor) : "";
          if (ctorString) {
            switch (ctorString) {
              case dataViewCtorString:
                return dataViewTag;
              case mapCtorString:
                return mapTag;
              case promiseCtorString:
                return promiseTag;
              case setCtorString:
                return setTag;
              case weakMapCtorString:
                return weakMapTag;
            }
          }
          return result2;
        };
      }
      function getView(start, end, transforms) {
        var index = -1, length = transforms.length;
        while (++index < length) {
          var data = transforms[index], size2 = data.size;
          switch (data.type) {
            case "drop":
              start += size2;
              break;
            case "dropRight":
              end -= size2;
              break;
            case "take":
              end = nativeMin(end, start + size2);
              break;
            case "takeRight":
              start = nativeMax(start, end - size2);
              break;
          }
        }
        return { "start": start, "end": end };
      }
      function getWrapDetails(source) {
        var match = source.match(reWrapDetails);
        return match ? match[1].split(reSplitDetails) : [];
      }
      function hasPath(object2, path, hasFunc) {
        path = castPath(path, object2);
        var index = -1, length = path.length, result2 = false;
        while (++index < length) {
          var key = toKey(path[index]);
          if (!(result2 = object2 != null && hasFunc(object2, key))) {
            break;
          }
          object2 = object2[key];
        }
        if (result2 || ++index != length) {
          return result2;
        }
        length = object2 == null ? 0 : object2.length;
        return !!length && isLength(length) && isIndex(key, length) && (isArray(object2) || isArguments(object2));
      }
      function initCloneArray(array2) {
        var length = array2.length, result2 = new array2.constructor(length);
        if (length && typeof array2[0] == "string" && hasOwnProperty.call(array2, "index")) {
          result2.index = array2.index;
          result2.input = array2.input;
        }
        return result2;
      }
      function initCloneObject(object2) {
        return typeof object2.constructor == "function" && !isPrototype(object2) ? baseCreate(getPrototype(object2)) : {};
      }
      function initCloneByTag(object2, tag, isDeep) {
        var Ctor = object2.constructor;
        switch (tag) {
          case arrayBufferTag:
            return cloneArrayBuffer(object2);
          case boolTag:
          case dateTag:
            return new Ctor(+object2);
          case dataViewTag:
            return cloneDataView(object2, isDeep);
          case float32Tag:
          case float64Tag:
          case int8Tag:
          case int16Tag:
          case int32Tag:
          case uint8Tag:
          case uint8ClampedTag:
          case uint16Tag:
          case uint32Tag:
            return cloneTypedArray(object2, isDeep);
          case mapTag:
            return new Ctor();
          case numberTag:
          case stringTag:
            return new Ctor(object2);
          case regexpTag:
            return cloneRegExp(object2);
          case setTag:
            return new Ctor();
          case symbolTag:
            return cloneSymbol(object2);
        }
      }
      function insertWrapDetails(source, details) {
        var length = details.length;
        if (!length) {
          return source;
        }
        var lastIndex = length - 1;
        details[lastIndex] = (length > 1 ? "& " : "") + details[lastIndex];
        details = details.join(length > 2 ? ", " : " ");
        return source.replace(reWrapComment, "{\n/* [wrapped with " + details + "] */\n");
      }
      function isFlattenable(value) {
        return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
      }
      function isIndex(value, length) {
        var type = typeof value;
        length = length == null ? MAX_SAFE_INTEGER : length;
        return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
      }
      function isIterateeCall(value, index, object2) {
        if (!isObject2(object2)) {
          return false;
        }
        var type = typeof index;
        if (type == "number" ? isArrayLike(object2) && isIndex(index, object2.length) : type == "string" && index in object2) {
          return eq2(object2[index], value);
        }
        return false;
      }
      function isKey(value, object2) {
        if (isArray(value)) {
          return false;
        }
        var type = typeof value;
        if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
          return true;
        }
        return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object2 != null && value in Object2(object2);
      }
      function isKeyable(value) {
        var type = typeof value;
        return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
      }
      function isLaziable(func) {
        var funcName = getFuncName(func), other = lodash2[funcName];
        if (typeof other != "function" || !(funcName in LazyWrapper.prototype)) {
          return false;
        }
        if (func === other) {
          return true;
        }
        var data = getData(other);
        return !!data && func === data[0];
      }
      function isMasked(func) {
        return !!maskSrcKey && maskSrcKey in func;
      }
      var isMaskable = coreJsData ? isFunction2 : stubFalse;
      function isPrototype(value) {
        var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
        return value === proto;
      }
      function isStrictComparable(value) {
        return value === value && !isObject2(value);
      }
      function matchesStrictComparable(key, srcValue) {
        return function(object2) {
          if (object2 == null) {
            return false;
          }
          return object2[key] === srcValue && (srcValue !== undefined$1 || key in Object2(object2));
        };
      }
      function memoizeCapped(func) {
        var result2 = memoize(func, function(key) {
          if (cache.size === MAX_MEMOIZE_SIZE) {
            cache.clear();
          }
          return key;
        });
        var cache = result2.cache;
        return result2;
      }
      function mergeData(data, source) {
        var bitmask = data[1], srcBitmask = source[1], newBitmask = bitmask | srcBitmask, isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);
        var isCombo = srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_CURRY_FLAG || srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_REARG_FLAG && data[7].length <= source[8] || srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG) && source[7].length <= source[8] && bitmask == WRAP_CURRY_FLAG;
        if (!(isCommon || isCombo)) {
          return data;
        }
        if (srcBitmask & WRAP_BIND_FLAG) {
          data[2] = source[2];
          newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
        }
        var value = source[3];
        if (value) {
          var partials = data[3];
          data[3] = partials ? composeArgs(partials, value, source[4]) : value;
          data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
        }
        value = source[5];
        if (value) {
          partials = data[5];
          data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
          data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
        }
        value = source[7];
        if (value) {
          data[7] = value;
        }
        if (srcBitmask & WRAP_ARY_FLAG) {
          data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
        }
        if (data[9] == null) {
          data[9] = source[9];
        }
        data[0] = source[0];
        data[1] = newBitmask;
        return data;
      }
      function nativeKeysIn(object2) {
        var result2 = [];
        if (object2 != null) {
          for (var key in Object2(object2)) {
            result2.push(key);
          }
        }
        return result2;
      }
      function objectToString(value) {
        return nativeObjectToString.call(value);
      }
      function overRest(func, start, transform2) {
        start = nativeMax(start === undefined$1 ? func.length - 1 : start, 0);
        return function() {
          var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array2 = Array2(length);
          while (++index < length) {
            array2[index] = args[start + index];
          }
          index = -1;
          var otherArgs = Array2(start + 1);
          while (++index < start) {
            otherArgs[index] = args[index];
          }
          otherArgs[start] = transform2(array2);
          return apply(func, this, otherArgs);
        };
      }
      function parent(object2, path) {
        return path.length < 2 ? object2 : baseGet(object2, baseSlice(path, 0, -1));
      }
      function reorder(array2, indexes) {
        var arrLength = array2.length, length = nativeMin(indexes.length, arrLength), oldArray = copyArray(array2);
        while (length--) {
          var index = indexes[length];
          array2[length] = isIndex(index, arrLength) ? oldArray[index] : undefined$1;
        }
        return array2;
      }
      function safeGet(object2, key) {
        if (key === "constructor" && typeof object2[key] === "function") {
          return;
        }
        if (key == "__proto__") {
          return;
        }
        return object2[key];
      }
      var setData = shortOut(baseSetData);
      var setTimeout2 = ctxSetTimeout || function(func, wait) {
        return root.setTimeout(func, wait);
      };
      var setToString = shortOut(baseSetToString);
      function setWrapToString(wrapper, reference, bitmask) {
        var source = reference + "";
        return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
      }
      function shortOut(func) {
        var count = 0, lastCalled = 0;
        return function() {
          var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
          lastCalled = stamp;
          if (remaining > 0) {
            if (++count >= HOT_COUNT) {
              return arguments[0];
            }
          } else {
            count = 0;
          }
          return func.apply(undefined$1, arguments);
        };
      }
      function shuffleSelf(array2, size2) {
        var index = -1, length = array2.length, lastIndex = length - 1;
        size2 = size2 === undefined$1 ? length : size2;
        while (++index < size2) {
          var rand = baseRandom(index, lastIndex), value = array2[rand];
          array2[rand] = array2[index];
          array2[index] = value;
        }
        array2.length = size2;
        return array2;
      }
      var stringToPath = memoizeCapped(function(string) {
        var result2 = [];
        if (string.charCodeAt(0) === 46) {
          result2.push("");
        }
        string.replace(rePropName, function(match, number, quote, subString) {
          result2.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
        });
        return result2;
      });
      function toKey(value) {
        if (typeof value == "string" || isSymbol(value)) {
          return value;
        }
        var result2 = value + "";
        return result2 == "0" && 1 / value == -INFINITY ? "-0" : result2;
      }
      function toSource(func) {
        if (func != null) {
          try {
            return funcToString.call(func);
          } catch (e) {
          }
          try {
            return func + "";
          } catch (e) {
          }
        }
        return "";
      }
      function updateWrapDetails(details, bitmask) {
        arrayEach(wrapFlags, function(pair) {
          var value = "_." + pair[0];
          if (bitmask & pair[1] && !arrayIncludes(details, value)) {
            details.push(value);
          }
        });
        return details.sort();
      }
      function wrapperClone(wrapper) {
        if (wrapper instanceof LazyWrapper) {
          return wrapper.clone();
        }
        var result2 = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
        result2.__actions__ = copyArray(wrapper.__actions__);
        result2.__index__ = wrapper.__index__;
        result2.__values__ = wrapper.__values__;
        return result2;
      }
      function chunk(array2, size2, guard) {
        if (guard ? isIterateeCall(array2, size2, guard) : size2 === undefined$1) {
          size2 = 1;
        } else {
          size2 = nativeMax(toInteger(size2), 0);
        }
        var length = array2 == null ? 0 : array2.length;
        if (!length || size2 < 1) {
          return [];
        }
        var index = 0, resIndex = 0, result2 = Array2(nativeCeil(length / size2));
        while (index < length) {
          result2[resIndex++] = baseSlice(array2, index, index += size2);
        }
        return result2;
      }
      function compact(array2) {
        var index = -1, length = array2 == null ? 0 : array2.length, resIndex = 0, result2 = [];
        while (++index < length) {
          var value = array2[index];
          if (value) {
            result2[resIndex++] = value;
          }
        }
        return result2;
      }
      function concat() {
        var length = arguments.length;
        if (!length) {
          return [];
        }
        var args = Array2(length - 1), array2 = arguments[0], index = length;
        while (index--) {
          args[index - 1] = arguments[index];
        }
        return arrayPush(isArray(array2) ? copyArray(array2) : [array2], baseFlatten(args, 1));
      }
      var difference = baseRest(function(array2, values2) {
        return isArrayLikeObject(array2) ? baseDifference(array2, baseFlatten(values2, 1, isArrayLikeObject, true)) : [];
      });
      var differenceBy = baseRest(function(array2, values2) {
        var iteratee2 = last(values2);
        if (isArrayLikeObject(iteratee2)) {
          iteratee2 = undefined$1;
        }
        return isArrayLikeObject(array2) ? baseDifference(array2, baseFlatten(values2, 1, isArrayLikeObject, true), getIteratee(iteratee2, 2)) : [];
      });
      var differenceWith = baseRest(function(array2, values2) {
        var comparator = last(values2);
        if (isArrayLikeObject(comparator)) {
          comparator = undefined$1;
        }
        return isArrayLikeObject(array2) ? baseDifference(array2, baseFlatten(values2, 1, isArrayLikeObject, true), undefined$1, comparator) : [];
      });
      function drop(array2, n, guard) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        return baseSlice(array2, n < 0 ? 0 : n, length);
      }
      function dropRight(array2, n, guard) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        n = length - n;
        return baseSlice(array2, 0, n < 0 ? 0 : n);
      }
      function dropRightWhile(array2, predicate) {
        return array2 && array2.length ? baseWhile(array2, getIteratee(predicate, 3), true, true) : [];
      }
      function dropWhile(array2, predicate) {
        return array2 && array2.length ? baseWhile(array2, getIteratee(predicate, 3), true) : [];
      }
      function fill(array2, value, start, end) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return [];
        }
        if (start && typeof start != "number" && isIterateeCall(array2, value, start)) {
          start = 0;
          end = length;
        }
        return baseFill(array2, value, start, end);
      }
      function findIndex(array2, predicate, fromIndex) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return -1;
        }
        var index = fromIndex == null ? 0 : toInteger(fromIndex);
        if (index < 0) {
          index = nativeMax(length + index, 0);
        }
        return baseFindIndex(array2, getIteratee(predicate, 3), index);
      }
      function findLastIndex(array2, predicate, fromIndex) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return -1;
        }
        var index = length - 1;
        if (fromIndex !== undefined$1) {
          index = toInteger(fromIndex);
          index = fromIndex < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
        }
        return baseFindIndex(array2, getIteratee(predicate, 3), index, true);
      }
      function flatten(array2) {
        var length = array2 == null ? 0 : array2.length;
        return length ? baseFlatten(array2, 1) : [];
      }
      function flattenDeep(array2) {
        var length = array2 == null ? 0 : array2.length;
        return length ? baseFlatten(array2, INFINITY) : [];
      }
      function flattenDepth(array2, depth) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return [];
        }
        depth = depth === undefined$1 ? 1 : toInteger(depth);
        return baseFlatten(array2, depth);
      }
      function fromPairs(pairs) {
        var index = -1, length = pairs == null ? 0 : pairs.length, result2 = {};
        while (++index < length) {
          var pair = pairs[index];
          result2[pair[0]] = pair[1];
        }
        return result2;
      }
      function head(array2) {
        return array2 && array2.length ? array2[0] : undefined$1;
      }
      function indexOf(array2, value, fromIndex) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return -1;
        }
        var index = fromIndex == null ? 0 : toInteger(fromIndex);
        if (index < 0) {
          index = nativeMax(length + index, 0);
        }
        return baseIndexOf(array2, value, index);
      }
      function initial(array2) {
        var length = array2 == null ? 0 : array2.length;
        return length ? baseSlice(array2, 0, -1) : [];
      }
      var intersection = baseRest(function(arrays) {
        var mapped = arrayMap(arrays, castArrayLikeObject);
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped) : [];
      });
      var intersectionBy = baseRest(function(arrays) {
        var iteratee2 = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
        if (iteratee2 === last(mapped)) {
          iteratee2 = undefined$1;
        } else {
          mapped.pop();
        }
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, getIteratee(iteratee2, 2)) : [];
      });
      var intersectionWith = baseRest(function(arrays) {
        var comparator = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        if (comparator) {
          mapped.pop();
        }
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, undefined$1, comparator) : [];
      });
      function join(array2, separator) {
        return array2 == null ? "" : nativeJoin.call(array2, separator);
      }
      function last(array2) {
        var length = array2 == null ? 0 : array2.length;
        return length ? array2[length - 1] : undefined$1;
      }
      function lastIndexOf(array2, value, fromIndex) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return -1;
        }
        var index = length;
        if (fromIndex !== undefined$1) {
          index = toInteger(fromIndex);
          index = index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
        }
        return value === value ? strictLastIndexOf(array2, value, index) : baseFindIndex(array2, baseIsNaN, index, true);
      }
      function nth(array2, n) {
        return array2 && array2.length ? baseNth(array2, toInteger(n)) : undefined$1;
      }
      var pull = baseRest(pullAll);
      function pullAll(array2, values2) {
        return array2 && array2.length && values2 && values2.length ? basePullAll(array2, values2) : array2;
      }
      function pullAllBy(array2, values2, iteratee2) {
        return array2 && array2.length && values2 && values2.length ? basePullAll(array2, values2, getIteratee(iteratee2, 2)) : array2;
      }
      function pullAllWith(array2, values2, comparator) {
        return array2 && array2.length && values2 && values2.length ? basePullAll(array2, values2, undefined$1, comparator) : array2;
      }
      var pullAt = flatRest(function(array2, indexes) {
        var length = array2 == null ? 0 : array2.length, result2 = baseAt(array2, indexes);
        basePullAt(array2, arrayMap(indexes, function(index) {
          return isIndex(index, length) ? +index : index;
        }).sort(compareAscending));
        return result2;
      });
      function remove2(array2, predicate) {
        var result2 = [];
        if (!(array2 && array2.length)) {
          return result2;
        }
        var index = -1, indexes = [], length = array2.length;
        predicate = getIteratee(predicate, 3);
        while (++index < length) {
          var value = array2[index];
          if (predicate(value, index, array2)) {
            result2.push(value);
            indexes.push(index);
          }
        }
        basePullAt(array2, indexes);
        return result2;
      }
      function reverse2(array2) {
        return array2 == null ? array2 : nativeReverse.call(array2);
      }
      function slice(array2, start, end) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return [];
        }
        if (end && typeof end != "number" && isIterateeCall(array2, start, end)) {
          start = 0;
          end = length;
        } else {
          start = start == null ? 0 : toInteger(start);
          end = end === undefined$1 ? length : toInteger(end);
        }
        return baseSlice(array2, start, end);
      }
      function sortedIndex(array2, value) {
        return baseSortedIndex(array2, value);
      }
      function sortedIndexBy(array2, value, iteratee2) {
        return baseSortedIndexBy(array2, value, getIteratee(iteratee2, 2));
      }
      function sortedIndexOf(array2, value) {
        var length = array2 == null ? 0 : array2.length;
        if (length) {
          var index = baseSortedIndex(array2, value);
          if (index < length && eq2(array2[index], value)) {
            return index;
          }
        }
        return -1;
      }
      function sortedLastIndex(array2, value) {
        return baseSortedIndex(array2, value, true);
      }
      function sortedLastIndexBy(array2, value, iteratee2) {
        return baseSortedIndexBy(array2, value, getIteratee(iteratee2, 2), true);
      }
      function sortedLastIndexOf(array2, value) {
        var length = array2 == null ? 0 : array2.length;
        if (length) {
          var index = baseSortedIndex(array2, value, true) - 1;
          if (eq2(array2[index], value)) {
            return index;
          }
        }
        return -1;
      }
      function sortedUniq(array2) {
        return array2 && array2.length ? baseSortedUniq(array2) : [];
      }
      function sortedUniqBy(array2, iteratee2) {
        return array2 && array2.length ? baseSortedUniq(array2, getIteratee(iteratee2, 2)) : [];
      }
      function tail(array2) {
        var length = array2 == null ? 0 : array2.length;
        return length ? baseSlice(array2, 1, length) : [];
      }
      function take(array2, n, guard) {
        if (!(array2 && array2.length)) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        return baseSlice(array2, 0, n < 0 ? 0 : n);
      }
      function takeRight(array2, n, guard) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        n = length - n;
        return baseSlice(array2, n < 0 ? 0 : n, length);
      }
      function takeRightWhile(array2, predicate) {
        return array2 && array2.length ? baseWhile(array2, getIteratee(predicate, 3), false, true) : [];
      }
      function takeWhile(array2, predicate) {
        return array2 && array2.length ? baseWhile(array2, getIteratee(predicate, 3)) : [];
      }
      var union = baseRest(function(arrays) {
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
      });
      var unionBy = baseRest(function(arrays) {
        var iteratee2 = last(arrays);
        if (isArrayLikeObject(iteratee2)) {
          iteratee2 = undefined$1;
        }
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee2, 2));
      });
      var unionWith = baseRest(function(arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined$1, comparator);
      });
      function uniq(array2) {
        return array2 && array2.length ? baseUniq(array2) : [];
      }
      function uniqBy(array2, iteratee2) {
        return array2 && array2.length ? baseUniq(array2, getIteratee(iteratee2, 2)) : [];
      }
      function uniqWith(array2, comparator) {
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        return array2 && array2.length ? baseUniq(array2, undefined$1, comparator) : [];
      }
      function unzip(array2) {
        if (!(array2 && array2.length)) {
          return [];
        }
        var length = 0;
        array2 = arrayFilter(array2, function(group) {
          if (isArrayLikeObject(group)) {
            length = nativeMax(group.length, length);
            return true;
          }
        });
        return baseTimes(length, function(index) {
          return arrayMap(array2, baseProperty(index));
        });
      }
      function unzipWith(array2, iteratee2) {
        if (!(array2 && array2.length)) {
          return [];
        }
        var result2 = unzip(array2);
        if (iteratee2 == null) {
          return result2;
        }
        return arrayMap(result2, function(group) {
          return apply(iteratee2, undefined$1, group);
        });
      }
      var without = baseRest(function(array2, values2) {
        return isArrayLikeObject(array2) ? baseDifference(array2, values2) : [];
      });
      var xor = baseRest(function(arrays) {
        return baseXor(arrayFilter(arrays, isArrayLikeObject));
      });
      var xorBy = baseRest(function(arrays) {
        var iteratee2 = last(arrays);
        if (isArrayLikeObject(iteratee2)) {
          iteratee2 = undefined$1;
        }
        return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee2, 2));
      });
      var xorWith = baseRest(function(arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined$1, comparator);
      });
      var zip = baseRest(unzip);
      function zipObject(props, values2) {
        return baseZipObject(props || [], values2 || [], assignValue);
      }
      function zipObjectDeep(props, values2) {
        return baseZipObject(props || [], values2 || [], baseSet);
      }
      var zipWith = baseRest(function(arrays) {
        var length = arrays.length, iteratee2 = length > 1 ? arrays[length - 1] : undefined$1;
        iteratee2 = typeof iteratee2 == "function" ? (arrays.pop(), iteratee2) : undefined$1;
        return unzipWith(arrays, iteratee2);
      });
      function chain(value) {
        var result2 = lodash2(value);
        result2.__chain__ = true;
        return result2;
      }
      function tap(value, interceptor) {
        interceptor(value);
        return value;
      }
      function thru(value, interceptor) {
        return interceptor(value);
      }
      var wrapperAt = flatRest(function(paths) {
        var length = paths.length, start = length ? paths[0] : 0, value = this.__wrapped__, interceptor = function(object2) {
          return baseAt(object2, paths);
        };
        if (length > 1 || this.__actions__.length || !(value instanceof LazyWrapper) || !isIndex(start)) {
          return this.thru(interceptor);
        }
        value = value.slice(start, +start + (length ? 1 : 0));
        value.__actions__.push({
          "func": thru,
          "args": [interceptor],
          "thisArg": undefined$1
        });
        return new LodashWrapper(value, this.__chain__).thru(function(array2) {
          if (length && !array2.length) {
            array2.push(undefined$1);
          }
          return array2;
        });
      });
      function wrapperChain() {
        return chain(this);
      }
      function wrapperCommit() {
        return new LodashWrapper(this.value(), this.__chain__);
      }
      function wrapperNext() {
        if (this.__values__ === undefined$1) {
          this.__values__ = toArray(this.value());
        }
        var done = this.__index__ >= this.__values__.length, value = done ? undefined$1 : this.__values__[this.__index__++];
        return { "done": done, "value": value };
      }
      function wrapperToIterator() {
        return this;
      }
      function wrapperPlant(value) {
        var result2, parent2 = this;
        while (parent2 instanceof baseLodash) {
          var clone2 = wrapperClone(parent2);
          clone2.__index__ = 0;
          clone2.__values__ = undefined$1;
          if (result2) {
            previous.__wrapped__ = clone2;
          } else {
            result2 = clone2;
          }
          var previous = clone2;
          parent2 = parent2.__wrapped__;
        }
        previous.__wrapped__ = value;
        return result2;
      }
      function wrapperReverse() {
        var value = this.__wrapped__;
        if (value instanceof LazyWrapper) {
          var wrapped = value;
          if (this.__actions__.length) {
            wrapped = new LazyWrapper(this);
          }
          wrapped = wrapped.reverse();
          wrapped.__actions__.push({
            "func": thru,
            "args": [reverse2],
            "thisArg": undefined$1
          });
          return new LodashWrapper(wrapped, this.__chain__);
        }
        return this.thru(reverse2);
      }
      function wrapperValue() {
        return baseWrapperValue(this.__wrapped__, this.__actions__);
      }
      var countBy = createAggregator(function(result2, value, key) {
        if (hasOwnProperty.call(result2, key)) {
          ++result2[key];
        } else {
          baseAssignValue(result2, key, 1);
        }
      });
      function every(collection, predicate, guard) {
        var func = isArray(collection) ? arrayEvery : baseEvery;
        if (guard && isIterateeCall(collection, predicate, guard)) {
          predicate = undefined$1;
        }
        return func(collection, getIteratee(predicate, 3));
      }
      function filter(collection, predicate) {
        var func = isArray(collection) ? arrayFilter : baseFilter;
        return func(collection, getIteratee(predicate, 3));
      }
      var find = createFind(findIndex);
      var findLast = createFind(findLastIndex);
      function flatMap(collection, iteratee2) {
        return baseFlatten(map2(collection, iteratee2), 1);
      }
      function flatMapDeep(collection, iteratee2) {
        return baseFlatten(map2(collection, iteratee2), INFINITY);
      }
      function flatMapDepth(collection, iteratee2, depth) {
        depth = depth === undefined$1 ? 1 : toInteger(depth);
        return baseFlatten(map2(collection, iteratee2), depth);
      }
      function forEach(collection, iteratee2) {
        var func = isArray(collection) ? arrayEach : baseEach;
        return func(collection, getIteratee(iteratee2, 3));
      }
      function forEachRight(collection, iteratee2) {
        var func = isArray(collection) ? arrayEachRight : baseEachRight;
        return func(collection, getIteratee(iteratee2, 3));
      }
      var groupBy = createAggregator(function(result2, value, key) {
        if (hasOwnProperty.call(result2, key)) {
          result2[key].push(value);
        } else {
          baseAssignValue(result2, key, [value]);
        }
      });
      function includes(collection, value, fromIndex, guard) {
        collection = isArrayLike(collection) ? collection : values(collection);
        fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
        var length = collection.length;
        if (fromIndex < 0) {
          fromIndex = nativeMax(length + fromIndex, 0);
        }
        return isString2(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
      }
      var invokeMap = baseRest(function(collection, path, args) {
        var index = -1, isFunc = typeof path == "function", result2 = isArrayLike(collection) ? Array2(collection.length) : [];
        baseEach(collection, function(value) {
          result2[++index] = isFunc ? apply(path, value, args) : baseInvoke(value, path, args);
        });
        return result2;
      });
      var keyBy = createAggregator(function(result2, value, key) {
        baseAssignValue(result2, key, value);
      });
      function map2(collection, iteratee2) {
        var func = isArray(collection) ? arrayMap : baseMap;
        return func(collection, getIteratee(iteratee2, 3));
      }
      function orderBy(collection, iteratees, orders, guard) {
        if (collection == null) {
          return [];
        }
        if (!isArray(iteratees)) {
          iteratees = iteratees == null ? [] : [iteratees];
        }
        orders = guard ? undefined$1 : orders;
        if (!isArray(orders)) {
          orders = orders == null ? [] : [orders];
        }
        return baseOrderBy(collection, iteratees, orders);
      }
      var partition = createAggregator(function(result2, value, key) {
        result2[key ? 0 : 1].push(value);
      }, function() {
        return [[], []];
      });
      function reduce(collection, iteratee2, accumulator) {
        var func = isArray(collection) ? arrayReduce : baseReduce, initAccum = arguments.length < 3;
        return func(collection, getIteratee(iteratee2, 4), accumulator, initAccum, baseEach);
      }
      function reduceRight(collection, iteratee2, accumulator) {
        var func = isArray(collection) ? arrayReduceRight : baseReduce, initAccum = arguments.length < 3;
        return func(collection, getIteratee(iteratee2, 4), accumulator, initAccum, baseEachRight);
      }
      function reject(collection, predicate) {
        var func = isArray(collection) ? arrayFilter : baseFilter;
        return func(collection, negate(getIteratee(predicate, 3)));
      }
      function sample(collection) {
        var func = isArray(collection) ? arraySample : baseSample;
        return func(collection);
      }
      function sampleSize(collection, n, guard) {
        if (guard ? isIterateeCall(collection, n, guard) : n === undefined$1) {
          n = 1;
        } else {
          n = toInteger(n);
        }
        var func = isArray(collection) ? arraySampleSize : baseSampleSize;
        return func(collection, n);
      }
      function shuffle(collection) {
        var func = isArray(collection) ? arrayShuffle : baseShuffle;
        return func(collection);
      }
      function size(collection) {
        if (collection == null) {
          return 0;
        }
        if (isArrayLike(collection)) {
          return isString2(collection) ? stringSize(collection) : collection.length;
        }
        var tag = getTag(collection);
        if (tag == mapTag || tag == setTag) {
          return collection.size;
        }
        return baseKeys(collection).length;
      }
      function some(collection, predicate, guard) {
        var func = isArray(collection) ? arraySome : baseSome;
        if (guard && isIterateeCall(collection, predicate, guard)) {
          predicate = undefined$1;
        }
        return func(collection, getIteratee(predicate, 3));
      }
      var sortBy = baseRest(function(collection, iteratees) {
        if (collection == null) {
          return [];
        }
        var length = iteratees.length;
        if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
          iteratees = [];
        } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
          iteratees = [iteratees[0]];
        }
        return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
      });
      var now = ctxNow || function() {
        return root.Date.now();
      };
      function after(n, func) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        n = toInteger(n);
        return function() {
          if (--n < 1) {
            return func.apply(this, arguments);
          }
        };
      }
      function ary(func, n, guard) {
        n = guard ? undefined$1 : n;
        n = func && n == null ? func.length : n;
        return createWrap(func, WRAP_ARY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, n);
      }
      function before(n, func) {
        var result2;
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        n = toInteger(n);
        return function() {
          if (--n > 0) {
            result2 = func.apply(this, arguments);
          }
          if (n <= 1) {
            func = undefined$1;
          }
          return result2;
        };
      }
      var bind = baseRest(function(func, thisArg, partials) {
        var bitmask = WRAP_BIND_FLAG;
        if (partials.length) {
          var holders = replaceHolders(partials, getHolder(bind));
          bitmask |= WRAP_PARTIAL_FLAG;
        }
        return createWrap(func, bitmask, thisArg, partials, holders);
      });
      var bindKey = baseRest(function(object2, key, partials) {
        var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG;
        if (partials.length) {
          var holders = replaceHolders(partials, getHolder(bindKey));
          bitmask |= WRAP_PARTIAL_FLAG;
        }
        return createWrap(key, bitmask, object2, partials, holders);
      });
      function curry(func, arity, guard) {
        arity = guard ? undefined$1 : arity;
        var result2 = createWrap(func, WRAP_CURRY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
        result2.placeholder = curry.placeholder;
        return result2;
      }
      function curryRight(func, arity, guard) {
        arity = guard ? undefined$1 : arity;
        var result2 = createWrap(func, WRAP_CURRY_RIGHT_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
        result2.placeholder = curryRight.placeholder;
        return result2;
      }
      function debounce(func, wait, options) {
        var lastArgs, lastThis, maxWait, result2, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        wait = toNumber(wait) || 0;
        if (isObject2(options)) {
          leading = !!options.leading;
          maxing = "maxWait" in options;
          maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
          trailing = "trailing" in options ? !!options.trailing : trailing;
        }
        function invokeFunc(time) {
          var args = lastArgs, thisArg = lastThis;
          lastArgs = lastThis = undefined$1;
          lastInvokeTime = time;
          result2 = func.apply(thisArg, args);
          return result2;
        }
        function leadingEdge(time) {
          lastInvokeTime = time;
          timerId = setTimeout2(timerExpired, wait);
          return leading ? invokeFunc(time) : result2;
        }
        function remainingWait(time) {
          var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
          return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
        }
        function shouldInvoke(time) {
          var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
          return lastCallTime === undefined$1 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
        }
        function timerExpired() {
          var time = now();
          if (shouldInvoke(time)) {
            return trailingEdge(time);
          }
          timerId = setTimeout2(timerExpired, remainingWait(time));
        }
        function trailingEdge(time) {
          timerId = undefined$1;
          if (trailing && lastArgs) {
            return invokeFunc(time);
          }
          lastArgs = lastThis = undefined$1;
          return result2;
        }
        function cancel() {
          if (timerId !== undefined$1) {
            clearTimeout(timerId);
          }
          lastInvokeTime = 0;
          lastArgs = lastCallTime = lastThis = timerId = undefined$1;
        }
        function flush() {
          return timerId === undefined$1 ? result2 : trailingEdge(now());
        }
        function debounced() {
          var time = now(), isInvoking = shouldInvoke(time);
          lastArgs = arguments;
          lastThis = this;
          lastCallTime = time;
          if (isInvoking) {
            if (timerId === undefined$1) {
              return leadingEdge(lastCallTime);
            }
            if (maxing) {
              clearTimeout(timerId);
              timerId = setTimeout2(timerExpired, wait);
              return invokeFunc(lastCallTime);
            }
          }
          if (timerId === undefined$1) {
            timerId = setTimeout2(timerExpired, wait);
          }
          return result2;
        }
        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
      }
      var defer = baseRest(function(func, args) {
        return baseDelay(func, 1, args);
      });
      var delay = baseRest(function(func, wait, args) {
        return baseDelay(func, toNumber(wait) || 0, args);
      });
      function flip(func) {
        return createWrap(func, WRAP_FLIP_FLAG);
      }
      function memoize(func, resolver) {
        if (typeof func != "function" || resolver != null && typeof resolver != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        var memoized = function() {
          var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
          if (cache.has(key)) {
            return cache.get(key);
          }
          var result2 = func.apply(this, args);
          memoized.cache = cache.set(key, result2) || cache;
          return result2;
        };
        memoized.cache = new (memoize.Cache || MapCache)();
        return memoized;
      }
      memoize.Cache = MapCache;
      function negate(predicate) {
        if (typeof predicate != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        return function() {
          var args = arguments;
          switch (args.length) {
            case 0:
              return !predicate.call(this);
            case 1:
              return !predicate.call(this, args[0]);
            case 2:
              return !predicate.call(this, args[0], args[1]);
            case 3:
              return !predicate.call(this, args[0], args[1], args[2]);
          }
          return !predicate.apply(this, args);
        };
      }
      function once(func) {
        return before(2, func);
      }
      var overArgs = castRest(function(func, transforms) {
        transforms = transforms.length == 1 && isArray(transforms[0]) ? arrayMap(transforms[0], baseUnary(getIteratee())) : arrayMap(baseFlatten(transforms, 1), baseUnary(getIteratee()));
        var funcsLength = transforms.length;
        return baseRest(function(args) {
          var index = -1, length = nativeMin(args.length, funcsLength);
          while (++index < length) {
            args[index] = transforms[index].call(this, args[index]);
          }
          return apply(func, this, args);
        });
      });
      var partial = baseRest(function(func, partials) {
        var holders = replaceHolders(partials, getHolder(partial));
        return createWrap(func, WRAP_PARTIAL_FLAG, undefined$1, partials, holders);
      });
      var partialRight = baseRest(function(func, partials) {
        var holders = replaceHolders(partials, getHolder(partialRight));
        return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined$1, partials, holders);
      });
      var rearg = flatRest(function(func, indexes) {
        return createWrap(func, WRAP_REARG_FLAG, undefined$1, undefined$1, undefined$1, indexes);
      });
      function rest(func, start) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        start = start === undefined$1 ? start : toInteger(start);
        return baseRest(func, start);
      }
      function spread(func, start) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        start = start == null ? 0 : nativeMax(toInteger(start), 0);
        return baseRest(function(args) {
          var array2 = args[start], otherArgs = castSlice(args, 0, start);
          if (array2) {
            arrayPush(otherArgs, array2);
          }
          return apply(func, this, otherArgs);
        });
      }
      function throttle(func, wait, options) {
        var leading = true, trailing = true;
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        if (isObject2(options)) {
          leading = "leading" in options ? !!options.leading : leading;
          trailing = "trailing" in options ? !!options.trailing : trailing;
        }
        return debounce(func, wait, {
          "leading": leading,
          "maxWait": wait,
          "trailing": trailing
        });
      }
      function unary(func) {
        return ary(func, 1);
      }
      function wrap(value, wrapper) {
        return partial(castFunction(wrapper), value);
      }
      function castArray() {
        if (!arguments.length) {
          return [];
        }
        var value = arguments[0];
        return isArray(value) ? value : [value];
      }
      function clone(value) {
        return baseClone(value, CLONE_SYMBOLS_FLAG);
      }
      function cloneWith(value, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return baseClone(value, CLONE_SYMBOLS_FLAG, customizer);
      }
      function cloneDeep(value) {
        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
      }
      function cloneDeepWith(value, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG, customizer);
      }
      function conformsTo(object2, source) {
        return source == null || baseConformsTo(object2, source, keys(source));
      }
      function eq2(value, other) {
        return value === other || value !== value && other !== other;
      }
      var gt = createRelationalOperation(baseGt);
      var gte = createRelationalOperation(function(value, other) {
        return value >= other;
      });
      var isArguments = baseIsArguments(/* @__PURE__ */ function() {
        return arguments;
      }()) ? baseIsArguments : function(value) {
        return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
      };
      var isArray = Array2.isArray;
      var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;
      function isArrayLike(value) {
        return value != null && isLength(value.length) && !isFunction2(value);
      }
      function isArrayLikeObject(value) {
        return isObjectLike(value) && isArrayLike(value);
      }
      function isBoolean(value) {
        return value === true || value === false || isObjectLike(value) && baseGetTag(value) == boolTag;
      }
      var isBuffer = nativeIsBuffer || stubFalse;
      var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;
      function isElement(value) {
        return isObjectLike(value) && value.nodeType === 1 && !isPlainObject2(value);
      }
      function isEmpty(value) {
        if (value == null) {
          return true;
        }
        if (isArrayLike(value) && (isArray(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer(value) || isTypedArray(value) || isArguments(value))) {
          return !value.length;
        }
        var tag = getTag(value);
        if (tag == mapTag || tag == setTag) {
          return !value.size;
        }
        if (isPrototype(value)) {
          return !baseKeys(value).length;
        }
        for (var key in value) {
          if (hasOwnProperty.call(value, key)) {
            return false;
          }
        }
        return true;
      }
      function isEqual(value, other) {
        return baseIsEqual(value, other);
      }
      function isEqualWith(value, other, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        var result2 = customizer ? customizer(value, other) : undefined$1;
        return result2 === undefined$1 ? baseIsEqual(value, other, undefined$1, customizer) : !!result2;
      }
      function isError(value) {
        if (!isObjectLike(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == errorTag || tag == domExcTag || typeof value.message == "string" && typeof value.name == "string" && !isPlainObject2(value);
      }
      function isFinite(value) {
        return typeof value == "number" && nativeIsFinite(value);
      }
      function isFunction2(value) {
        if (!isObject2(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
      }
      function isInteger(value) {
        return typeof value == "number" && value == toInteger(value);
      }
      function isLength(value) {
        return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
      }
      function isObject2(value) {
        var type = typeof value;
        return value != null && (type == "object" || type == "function");
      }
      function isObjectLike(value) {
        return value != null && typeof value == "object";
      }
      var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
      function isMatch(object2, source) {
        return object2 === source || baseIsMatch(object2, source, getMatchData(source));
      }
      function isMatchWith(object2, source, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return baseIsMatch(object2, source, getMatchData(source), customizer);
      }
      function isNaN2(value) {
        return isNumber2(value) && value != +value;
      }
      function isNative(value) {
        if (isMaskable(value)) {
          throw new Error2(CORE_ERROR_TEXT);
        }
        return baseIsNative(value);
      }
      function isNull(value) {
        return value === null;
      }
      function isNil(value) {
        return value == null;
      }
      function isNumber2(value) {
        return typeof value == "number" || isObjectLike(value) && baseGetTag(value) == numberTag;
      }
      function isPlainObject2(value) {
        if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
          return false;
        }
        var proto = getPrototype(value);
        if (proto === null) {
          return true;
        }
        var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
        return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
      }
      var isRegExp2 = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;
      function isSafeInteger(value) {
        return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
      }
      var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
      function isString2(value) {
        return typeof value == "string" || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
      }
      function isSymbol(value) {
        return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
      }
      var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
      function isUndefined(value) {
        return value === undefined$1;
      }
      function isWeakMap(value) {
        return isObjectLike(value) && getTag(value) == weakMapTag;
      }
      function isWeakSet(value) {
        return isObjectLike(value) && baseGetTag(value) == weakSetTag;
      }
      var lt = createRelationalOperation(baseLt);
      var lte = createRelationalOperation(function(value, other) {
        return value <= other;
      });
      function toArray(value) {
        if (!value) {
          return [];
        }
        if (isArrayLike(value)) {
          return isString2(value) ? stringToArray(value) : copyArray(value);
        }
        if (symIterator && value[symIterator]) {
          return iteratorToArray(value[symIterator]());
        }
        var tag = getTag(value), func = tag == mapTag ? mapToArray : tag == setTag ? setToArray : values;
        return func(value);
      }
      function toFinite(value) {
        if (!value) {
          return value === 0 ? value : 0;
        }
        value = toNumber(value);
        if (value === INFINITY || value === -INFINITY) {
          var sign = value < 0 ? -1 : 1;
          return sign * MAX_INTEGER;
        }
        return value === value ? value : 0;
      }
      function toInteger(value) {
        var result2 = toFinite(value), remainder = result2 % 1;
        return result2 === result2 ? remainder ? result2 - remainder : result2 : 0;
      }
      function toLength(value) {
        return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
      }
      function toNumber(value) {
        if (typeof value == "number") {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        if (isObject2(value)) {
          var other = typeof value.valueOf == "function" ? value.valueOf() : value;
          value = isObject2(other) ? other + "" : other;
        }
        if (typeof value != "string") {
          return value === 0 ? value : +value;
        }
        value = baseTrim(value);
        var isBinary = reIsBinary.test(value);
        return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
      }
      function toPlainObject(value) {
        return copyObject(value, keysIn(value));
      }
      function toSafeInteger(value) {
        return value ? baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER) : value === 0 ? value : 0;
      }
      function toString2(value) {
        return value == null ? "" : baseToString(value);
      }
      var assign2 = createAssigner(function(object2, source) {
        if (isPrototype(source) || isArrayLike(source)) {
          copyObject(source, keys(source), object2);
          return;
        }
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            assignValue(object2, key, source[key]);
          }
        }
      });
      var assignIn = createAssigner(function(object2, source) {
        copyObject(source, keysIn(source), object2);
      });
      var assignInWith = createAssigner(function(object2, source, srcIndex, customizer) {
        copyObject(source, keysIn(source), object2, customizer);
      });
      var assignWith = createAssigner(function(object2, source, srcIndex, customizer) {
        copyObject(source, keys(source), object2, customizer);
      });
      var at = flatRest(baseAt);
      function create(prototype, properties) {
        var result2 = baseCreate(prototype);
        return properties == null ? result2 : baseAssign(result2, properties);
      }
      var defaults = baseRest(function(object2, sources) {
        object2 = Object2(object2);
        var index = -1;
        var length = sources.length;
        var guard = length > 2 ? sources[2] : undefined$1;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          length = 1;
        }
        while (++index < length) {
          var source = sources[index];
          var props = keysIn(source);
          var propsIndex = -1;
          var propsLength = props.length;
          while (++propsIndex < propsLength) {
            var key = props[propsIndex];
            var value = object2[key];
            if (value === undefined$1 || eq2(value, objectProto[key]) && !hasOwnProperty.call(object2, key)) {
              object2[key] = source[key];
            }
          }
        }
        return object2;
      });
      var defaultsDeep = baseRest(function(args) {
        args.push(undefined$1, customDefaultsMerge);
        return apply(mergeWith, undefined$1, args);
      });
      function findKey(object2, predicate) {
        return baseFindKey(object2, getIteratee(predicate, 3), baseForOwn);
      }
      function findLastKey(object2, predicate) {
        return baseFindKey(object2, getIteratee(predicate, 3), baseForOwnRight);
      }
      function forIn(object2, iteratee2) {
        return object2 == null ? object2 : baseFor(object2, getIteratee(iteratee2, 3), keysIn);
      }
      function forInRight(object2, iteratee2) {
        return object2 == null ? object2 : baseForRight(object2, getIteratee(iteratee2, 3), keysIn);
      }
      function forOwn(object2, iteratee2) {
        return object2 && baseForOwn(object2, getIteratee(iteratee2, 3));
      }
      function forOwnRight(object2, iteratee2) {
        return object2 && baseForOwnRight(object2, getIteratee(iteratee2, 3));
      }
      function functions(object2) {
        return object2 == null ? [] : baseFunctions(object2, keys(object2));
      }
      function functionsIn(object2) {
        return object2 == null ? [] : baseFunctions(object2, keysIn(object2));
      }
      function get3(object2, path, defaultValue) {
        var result2 = object2 == null ? undefined$1 : baseGet(object2, path);
        return result2 === undefined$1 ? defaultValue : result2;
      }
      function has2(object2, path) {
        return object2 != null && hasPath(object2, path, baseHas);
      }
      function hasIn(object2, path) {
        return object2 != null && hasPath(object2, path, baseHasIn);
      }
      var invert = createInverter(function(result2, value, key) {
        if (value != null && typeof value.toString != "function") {
          value = nativeObjectToString.call(value);
        }
        result2[value] = key;
      }, constant(identity));
      var invertBy = createInverter(function(result2, value, key) {
        if (value != null && typeof value.toString != "function") {
          value = nativeObjectToString.call(value);
        }
        if (hasOwnProperty.call(result2, value)) {
          result2[value].push(key);
        } else {
          result2[value] = [key];
        }
      }, getIteratee);
      var invoke = baseRest(baseInvoke);
      function keys(object2) {
        return isArrayLike(object2) ? arrayLikeKeys(object2) : baseKeys(object2);
      }
      function keysIn(object2) {
        return isArrayLike(object2) ? arrayLikeKeys(object2, true) : baseKeysIn(object2);
      }
      function mapKeys(object2, iteratee2) {
        var result2 = {};
        iteratee2 = getIteratee(iteratee2, 3);
        baseForOwn(object2, function(value, key, object3) {
          baseAssignValue(result2, iteratee2(value, key, object3), value);
        });
        return result2;
      }
      function mapValues(object2, iteratee2) {
        var result2 = {};
        iteratee2 = getIteratee(iteratee2, 3);
        baseForOwn(object2, function(value, key, object3) {
          baseAssignValue(result2, key, iteratee2(value, key, object3));
        });
        return result2;
      }
      var merge = createAssigner(function(object2, source, srcIndex) {
        baseMerge(object2, source, srcIndex);
      });
      var mergeWith = createAssigner(function(object2, source, srcIndex, customizer) {
        baseMerge(object2, source, srcIndex, customizer);
      });
      var omit = flatRest(function(object2, paths) {
        var result2 = {};
        if (object2 == null) {
          return result2;
        }
        var isDeep = false;
        paths = arrayMap(paths, function(path) {
          path = castPath(path, object2);
          isDeep || (isDeep = path.length > 1);
          return path;
        });
        copyObject(object2, getAllKeysIn(object2), result2);
        if (isDeep) {
          result2 = baseClone(result2, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
        }
        var length = paths.length;
        while (length--) {
          baseUnset(result2, paths[length]);
        }
        return result2;
      });
      function omitBy(object2, predicate) {
        return pickBy(object2, negate(getIteratee(predicate)));
      }
      var pick = flatRest(function(object2, paths) {
        return object2 == null ? {} : basePick(object2, paths);
      });
      function pickBy(object2, predicate) {
        if (object2 == null) {
          return {};
        }
        var props = arrayMap(getAllKeysIn(object2), function(prop) {
          return [prop];
        });
        predicate = getIteratee(predicate);
        return basePickBy(object2, props, function(value, path) {
          return predicate(value, path[0]);
        });
      }
      function result(object2, path, defaultValue) {
        path = castPath(path, object2);
        var index = -1, length = path.length;
        if (!length) {
          length = 1;
          object2 = undefined$1;
        }
        while (++index < length) {
          var value = object2 == null ? undefined$1 : object2[toKey(path[index])];
          if (value === undefined$1) {
            index = length;
            value = defaultValue;
          }
          object2 = isFunction2(value) ? value.call(object2) : value;
        }
        return object2;
      }
      function set4(object2, path, value) {
        return object2 == null ? object2 : baseSet(object2, path, value);
      }
      function setWith(object2, path, value, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return object2 == null ? object2 : baseSet(object2, path, value, customizer);
      }
      var toPairs = createToPairs(keys);
      var toPairsIn = createToPairs(keysIn);
      function transform(object2, iteratee2, accumulator) {
        var isArr = isArray(object2), isArrLike = isArr || isBuffer(object2) || isTypedArray(object2);
        iteratee2 = getIteratee(iteratee2, 4);
        if (accumulator == null) {
          var Ctor = object2 && object2.constructor;
          if (isArrLike) {
            accumulator = isArr ? new Ctor() : [];
          } else if (isObject2(object2)) {
            accumulator = isFunction2(Ctor) ? baseCreate(getPrototype(object2)) : {};
          } else {
            accumulator = {};
          }
        }
        (isArrLike ? arrayEach : baseForOwn)(object2, function(value, index, object3) {
          return iteratee2(accumulator, value, index, object3);
        });
        return accumulator;
      }
      function unset(object2, path) {
        return object2 == null ? true : baseUnset(object2, path);
      }
      function update(object2, path, updater) {
        return object2 == null ? object2 : baseUpdate(object2, path, castFunction(updater));
      }
      function updateWith(object2, path, updater, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return object2 == null ? object2 : baseUpdate(object2, path, castFunction(updater), customizer);
      }
      function values(object2) {
        return object2 == null ? [] : baseValues(object2, keys(object2));
      }
      function valuesIn(object2) {
        return object2 == null ? [] : baseValues(object2, keysIn(object2));
      }
      function clamp(number, lower, upper) {
        if (upper === undefined$1) {
          upper = lower;
          lower = undefined$1;
        }
        if (upper !== undefined$1) {
          upper = toNumber(upper);
          upper = upper === upper ? upper : 0;
        }
        if (lower !== undefined$1) {
          lower = toNumber(lower);
          lower = lower === lower ? lower : 0;
        }
        return baseClamp(toNumber(number), lower, upper);
      }
      function inRange(number, start, end) {
        start = toFinite(start);
        if (end === undefined$1) {
          end = start;
          start = 0;
        } else {
          end = toFinite(end);
        }
        number = toNumber(number);
        return baseInRange(number, start, end);
      }
      function random(lower, upper, floating) {
        if (floating && typeof floating != "boolean" && isIterateeCall(lower, upper, floating)) {
          upper = floating = undefined$1;
        }
        if (floating === undefined$1) {
          if (typeof upper == "boolean") {
            floating = upper;
            upper = undefined$1;
          } else if (typeof lower == "boolean") {
            floating = lower;
            lower = undefined$1;
          }
        }
        if (lower === undefined$1 && upper === undefined$1) {
          lower = 0;
          upper = 1;
        } else {
          lower = toFinite(lower);
          if (upper === undefined$1) {
            upper = lower;
            lower = 0;
          } else {
            upper = toFinite(upper);
          }
        }
        if (lower > upper) {
          var temp = lower;
          lower = upper;
          upper = temp;
        }
        if (floating || lower % 1 || upper % 1) {
          var rand = nativeRandom();
          return nativeMin(lower + rand * (upper - lower + freeParseFloat("1e-" + ((rand + "").length - 1))), upper);
        }
        return baseRandom(lower, upper);
      }
      var camelCase = createCompounder(function(result2, word, index) {
        word = word.toLowerCase();
        return result2 + (index ? capitalize(word) : word);
      });
      function capitalize(string) {
        return upperFirst(toString2(string).toLowerCase());
      }
      function deburr(string) {
        string = toString2(string);
        return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
      }
      function endsWith(string, target, position) {
        string = toString2(string);
        target = baseToString(target);
        var length = string.length;
        position = position === undefined$1 ? length : baseClamp(toInteger(position), 0, length);
        var end = position;
        position -= target.length;
        return position >= 0 && string.slice(position, end) == target;
      }
      function escape2(string) {
        string = toString2(string);
        return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
      }
      function escapeRegExp(string) {
        string = toString2(string);
        return string && reHasRegExpChar.test(string) ? string.replace(reRegExpChar, "\\$&") : string;
      }
      var kebabCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? "-" : "") + word.toLowerCase();
      });
      var lowerCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? " " : "") + word.toLowerCase();
      });
      var lowerFirst = createCaseFirst("toLowerCase");
      function pad(string, length, chars) {
        string = toString2(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        if (!length || strLength >= length) {
          return string;
        }
        var mid = (length - strLength) / 2;
        return createPadding(nativeFloor(mid), chars) + string + createPadding(nativeCeil(mid), chars);
      }
      function padEnd(string, length, chars) {
        string = toString2(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        return length && strLength < length ? string + createPadding(length - strLength, chars) : string;
      }
      function padStart(string, length, chars) {
        string = toString2(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        return length && strLength < length ? createPadding(length - strLength, chars) + string : string;
      }
      function parseInt2(string, radix, guard) {
        if (guard || radix == null) {
          radix = 0;
        } else if (radix) {
          radix = +radix;
        }
        return nativeParseInt(toString2(string).replace(reTrimStart, ""), radix || 0);
      }
      function repeat(string, n, guard) {
        if (guard ? isIterateeCall(string, n, guard) : n === undefined$1) {
          n = 1;
        } else {
          n = toInteger(n);
        }
        return baseRepeat(toString2(string), n);
      }
      function replace2() {
        var args = arguments, string = toString2(args[0]);
        return args.length < 3 ? string : string.replace(args[1], args[2]);
      }
      var snakeCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? "_" : "") + word.toLowerCase();
      });
      function split(string, separator, limit) {
        if (limit && typeof limit != "number" && isIterateeCall(string, separator, limit)) {
          separator = limit = undefined$1;
        }
        limit = limit === undefined$1 ? MAX_ARRAY_LENGTH : limit >>> 0;
        if (!limit) {
          return [];
        }
        string = toString2(string);
        if (string && (typeof separator == "string" || separator != null && !isRegExp2(separator))) {
          separator = baseToString(separator);
          if (!separator && hasUnicode(string)) {
            return castSlice(stringToArray(string), 0, limit);
          }
        }
        return string.split(separator, limit);
      }
      var startCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? " " : "") + upperFirst(word);
      });
      function startsWith(string, target, position) {
        string = toString2(string);
        position = position == null ? 0 : baseClamp(toInteger(position), 0, string.length);
        target = baseToString(target);
        return string.slice(position, position + target.length) == target;
      }
      function template(string, options, guard) {
        var settings = lodash2.templateSettings;
        if (guard && isIterateeCall(string, options, guard)) {
          options = undefined$1;
        }
        string = toString2(string);
        options = assignInWith({}, options, settings, customDefaultsAssignIn);
        var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn), importsKeys = keys(imports), importsValues = baseValues(imports, importsKeys);
        var isEscaping, isEvaluating, index = 0, interpolate = options.interpolate || reNoMatch, source = "__p += '";
        var reDelimiters = RegExp2(
          (options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$",
          "g"
        );
        var sourceURL = "//# sourceURL=" + (hasOwnProperty.call(options, "sourceURL") ? (options.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++templateCounter + "]") + "\n";
        string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
          interpolateValue || (interpolateValue = esTemplateValue);
          source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);
          if (escapeValue) {
            isEscaping = true;
            source += "' +\n__e(" + escapeValue + ") +\n'";
          }
          if (evaluateValue) {
            isEvaluating = true;
            source += "';\n" + evaluateValue + ";\n__p += '";
          }
          if (interpolateValue) {
            source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
          }
          index = offset + match.length;
          return match;
        });
        source += "';\n";
        var variable = hasOwnProperty.call(options, "variable") && options.variable;
        if (!variable) {
          source = "with (obj) {\n" + source + "\n}\n";
        } else if (reForbiddenIdentifierChars.test(variable)) {
          throw new Error2(INVALID_TEMPL_VAR_ERROR_TEXT);
        }
        source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");
        source = "function(" + (variable || "obj") + ") {\n" + (variable ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (isEscaping ? ", __e = _.escape" : "") + (isEvaluating ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";
        var result2 = attempt(function() {
          return Function2(importsKeys, sourceURL + "return " + source).apply(undefined$1, importsValues);
        });
        result2.source = source;
        if (isError(result2)) {
          throw result2;
        }
        return result2;
      }
      function toLower(value) {
        return toString2(value).toLowerCase();
      }
      function toUpper(value) {
        return toString2(value).toUpperCase();
      }
      function trim(string, chars, guard) {
        string = toString2(string);
        if (string && (guard || chars === undefined$1)) {
          return baseTrim(string);
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string), chrSymbols = stringToArray(chars), start = charsStartIndex(strSymbols, chrSymbols), end = charsEndIndex(strSymbols, chrSymbols) + 1;
        return castSlice(strSymbols, start, end).join("");
      }
      function trimEnd(string, chars, guard) {
        string = toString2(string);
        if (string && (guard || chars === undefined$1)) {
          return string.slice(0, trimmedEndIndex(string) + 1);
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string), end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;
        return castSlice(strSymbols, 0, end).join("");
      }
      function trimStart(string, chars, guard) {
        string = toString2(string);
        if (string && (guard || chars === undefined$1)) {
          return string.replace(reTrimStart, "");
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string), start = charsStartIndex(strSymbols, stringToArray(chars));
        return castSlice(strSymbols, start).join("");
      }
      function truncate(string, options) {
        var length = DEFAULT_TRUNC_LENGTH, omission = DEFAULT_TRUNC_OMISSION;
        if (isObject2(options)) {
          var separator = "separator" in options ? options.separator : separator;
          length = "length" in options ? toInteger(options.length) : length;
          omission = "omission" in options ? baseToString(options.omission) : omission;
        }
        string = toString2(string);
        var strLength = string.length;
        if (hasUnicode(string)) {
          var strSymbols = stringToArray(string);
          strLength = strSymbols.length;
        }
        if (length >= strLength) {
          return string;
        }
        var end = length - stringSize(omission);
        if (end < 1) {
          return omission;
        }
        var result2 = strSymbols ? castSlice(strSymbols, 0, end).join("") : string.slice(0, end);
        if (separator === undefined$1) {
          return result2 + omission;
        }
        if (strSymbols) {
          end += result2.length - end;
        }
        if (isRegExp2(separator)) {
          if (string.slice(end).search(separator)) {
            var match, substring = result2;
            if (!separator.global) {
              separator = RegExp2(separator.source, toString2(reFlags.exec(separator)) + "g");
            }
            separator.lastIndex = 0;
            while (match = separator.exec(substring)) {
              var newEnd = match.index;
            }
            result2 = result2.slice(0, newEnd === undefined$1 ? end : newEnd);
          }
        } else if (string.indexOf(baseToString(separator), end) != end) {
          var index = result2.lastIndexOf(separator);
          if (index > -1) {
            result2 = result2.slice(0, index);
          }
        }
        return result2 + omission;
      }
      function unescape(string) {
        string = toString2(string);
        return string && reHasEscapedHtml.test(string) ? string.replace(reEscapedHtml, unescapeHtmlChar) : string;
      }
      var upperCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? " " : "") + word.toUpperCase();
      });
      var upperFirst = createCaseFirst("toUpperCase");
      function words(string, pattern, guard) {
        string = toString2(string);
        pattern = guard ? undefined$1 : pattern;
        if (pattern === undefined$1) {
          return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
        }
        return string.match(pattern) || [];
      }
      var attempt = baseRest(function(func, args) {
        try {
          return apply(func, undefined$1, args);
        } catch (e) {
          return isError(e) ? e : new Error2(e);
        }
      });
      var bindAll = flatRest(function(object2, methodNames) {
        arrayEach(methodNames, function(key) {
          key = toKey(key);
          baseAssignValue(object2, key, bind(object2[key], object2));
        });
        return object2;
      });
      function cond(pairs) {
        var length = pairs == null ? 0 : pairs.length, toIteratee = getIteratee();
        pairs = !length ? [] : arrayMap(pairs, function(pair) {
          if (typeof pair[1] != "function") {
            throw new TypeError2(FUNC_ERROR_TEXT);
          }
          return [toIteratee(pair[0]), pair[1]];
        });
        return baseRest(function(args) {
          var index = -1;
          while (++index < length) {
            var pair = pairs[index];
            if (apply(pair[0], this, args)) {
              return apply(pair[1], this, args);
            }
          }
        });
      }
      function conforms(source) {
        return baseConforms(baseClone(source, CLONE_DEEP_FLAG));
      }
      function constant(value) {
        return function() {
          return value;
        };
      }
      function defaultTo(value, defaultValue) {
        return value == null || value !== value ? defaultValue : value;
      }
      var flow3 = createFlow();
      var flowRight = createFlow(true);
      function identity(value) {
        return value;
      }
      function iteratee(func) {
        return baseIteratee(typeof func == "function" ? func : baseClone(func, CLONE_DEEP_FLAG));
      }
      function matches(source) {
        return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
      }
      function matchesProperty(path, srcValue) {
        return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG));
      }
      var method = baseRest(function(path, args) {
        return function(object2) {
          return baseInvoke(object2, path, args);
        };
      });
      var methodOf = baseRest(function(object2, args) {
        return function(path) {
          return baseInvoke(object2, path, args);
        };
      });
      function mixin(object2, source, options) {
        var props = keys(source), methodNames = baseFunctions(source, props);
        if (options == null && !(isObject2(source) && (methodNames.length || !props.length))) {
          options = source;
          source = object2;
          object2 = this;
          methodNames = baseFunctions(source, keys(source));
        }
        var chain2 = !(isObject2(options) && "chain" in options) || !!options.chain, isFunc = isFunction2(object2);
        arrayEach(methodNames, function(methodName) {
          var func = source[methodName];
          object2[methodName] = func;
          if (isFunc) {
            object2.prototype[methodName] = function() {
              var chainAll = this.__chain__;
              if (chain2 || chainAll) {
                var result2 = object2(this.__wrapped__), actions = result2.__actions__ = copyArray(this.__actions__);
                actions.push({ "func": func, "args": arguments, "thisArg": object2 });
                result2.__chain__ = chainAll;
                return result2;
              }
              return func.apply(object2, arrayPush([this.value()], arguments));
            };
          }
        });
        return object2;
      }
      function noConflict() {
        if (root._ === this) {
          root._ = oldDash;
        }
        return this;
      }
      function noop2() {
      }
      function nthArg(n) {
        n = toInteger(n);
        return baseRest(function(args) {
          return baseNth(args, n);
        });
      }
      var over = createOver(arrayMap);
      var overEvery = createOver(arrayEvery);
      var overSome = createOver(arraySome);
      function property(path) {
        return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
      }
      function propertyOf(object2) {
        return function(path) {
          return object2 == null ? undefined$1 : baseGet(object2, path);
        };
      }
      var range = createRange();
      var rangeRight = createRange(true);
      function stubArray() {
        return [];
      }
      function stubFalse() {
        return false;
      }
      function stubObject() {
        return {};
      }
      function stubString() {
        return "";
      }
      function stubTrue() {
        return true;
      }
      function times(n, iteratee2) {
        n = toInteger(n);
        if (n < 1 || n > MAX_SAFE_INTEGER) {
          return [];
        }
        var index = MAX_ARRAY_LENGTH, length = nativeMin(n, MAX_ARRAY_LENGTH);
        iteratee2 = getIteratee(iteratee2);
        n -= MAX_ARRAY_LENGTH;
        var result2 = baseTimes(length, iteratee2);
        while (++index < n) {
          iteratee2(index);
        }
        return result2;
      }
      function toPath(value) {
        if (isArray(value)) {
          return arrayMap(value, toKey);
        }
        return isSymbol(value) ? [value] : copyArray(stringToPath(toString2(value)));
      }
      function uniqueId(prefix) {
        var id = ++idCounter;
        return toString2(prefix) + id;
      }
      var add = createMathOperation(function(augend, addend) {
        return augend + addend;
      }, 0);
      var ceil = createRound("ceil");
      var divide = createMathOperation(function(dividend, divisor) {
        return dividend / divisor;
      }, 1);
      var floor = createRound("floor");
      function max(array2) {
        return array2 && array2.length ? baseExtremum(array2, identity, baseGt) : undefined$1;
      }
      function maxBy(array2, iteratee2) {
        return array2 && array2.length ? baseExtremum(array2, getIteratee(iteratee2, 2), baseGt) : undefined$1;
      }
      function mean(array2) {
        return baseMean(array2, identity);
      }
      function meanBy(array2, iteratee2) {
        return baseMean(array2, getIteratee(iteratee2, 2));
      }
      function min(array2) {
        return array2 && array2.length ? baseExtremum(array2, identity, baseLt) : undefined$1;
      }
      function minBy(array2, iteratee2) {
        return array2 && array2.length ? baseExtremum(array2, getIteratee(iteratee2, 2), baseLt) : undefined$1;
      }
      var multiply = createMathOperation(function(multiplier, multiplicand) {
        return multiplier * multiplicand;
      }, 1);
      var round = createRound("round");
      var subtract = createMathOperation(function(minuend, subtrahend) {
        return minuend - subtrahend;
      }, 0);
      function sum(array2) {
        return array2 && array2.length ? baseSum(array2, identity) : 0;
      }
      function sumBy(array2, iteratee2) {
        return array2 && array2.length ? baseSum(array2, getIteratee(iteratee2, 2)) : 0;
      }
      lodash2.after = after;
      lodash2.ary = ary;
      lodash2.assign = assign2;
      lodash2.assignIn = assignIn;
      lodash2.assignInWith = assignInWith;
      lodash2.assignWith = assignWith;
      lodash2.at = at;
      lodash2.before = before;
      lodash2.bind = bind;
      lodash2.bindAll = bindAll;
      lodash2.bindKey = bindKey;
      lodash2.castArray = castArray;
      lodash2.chain = chain;
      lodash2.chunk = chunk;
      lodash2.compact = compact;
      lodash2.concat = concat;
      lodash2.cond = cond;
      lodash2.conforms = conforms;
      lodash2.constant = constant;
      lodash2.countBy = countBy;
      lodash2.create = create;
      lodash2.curry = curry;
      lodash2.curryRight = curryRight;
      lodash2.debounce = debounce;
      lodash2.defaults = defaults;
      lodash2.defaultsDeep = defaultsDeep;
      lodash2.defer = defer;
      lodash2.delay = delay;
      lodash2.difference = difference;
      lodash2.differenceBy = differenceBy;
      lodash2.differenceWith = differenceWith;
      lodash2.drop = drop;
      lodash2.dropRight = dropRight;
      lodash2.dropRightWhile = dropRightWhile;
      lodash2.dropWhile = dropWhile;
      lodash2.fill = fill;
      lodash2.filter = filter;
      lodash2.flatMap = flatMap;
      lodash2.flatMapDeep = flatMapDeep;
      lodash2.flatMapDepth = flatMapDepth;
      lodash2.flatten = flatten;
      lodash2.flattenDeep = flattenDeep;
      lodash2.flattenDepth = flattenDepth;
      lodash2.flip = flip;
      lodash2.flow = flow3;
      lodash2.flowRight = flowRight;
      lodash2.fromPairs = fromPairs;
      lodash2.functions = functions;
      lodash2.functionsIn = functionsIn;
      lodash2.groupBy = groupBy;
      lodash2.initial = initial;
      lodash2.intersection = intersection;
      lodash2.intersectionBy = intersectionBy;
      lodash2.intersectionWith = intersectionWith;
      lodash2.invert = invert;
      lodash2.invertBy = invertBy;
      lodash2.invokeMap = invokeMap;
      lodash2.iteratee = iteratee;
      lodash2.keyBy = keyBy;
      lodash2.keys = keys;
      lodash2.keysIn = keysIn;
      lodash2.map = map2;
      lodash2.mapKeys = mapKeys;
      lodash2.mapValues = mapValues;
      lodash2.matches = matches;
      lodash2.matchesProperty = matchesProperty;
      lodash2.memoize = memoize;
      lodash2.merge = merge;
      lodash2.mergeWith = mergeWith;
      lodash2.method = method;
      lodash2.methodOf = methodOf;
      lodash2.mixin = mixin;
      lodash2.negate = negate;
      lodash2.nthArg = nthArg;
      lodash2.omit = omit;
      lodash2.omitBy = omitBy;
      lodash2.once = once;
      lodash2.orderBy = orderBy;
      lodash2.over = over;
      lodash2.overArgs = overArgs;
      lodash2.overEvery = overEvery;
      lodash2.overSome = overSome;
      lodash2.partial = partial;
      lodash2.partialRight = partialRight;
      lodash2.partition = partition;
      lodash2.pick = pick;
      lodash2.pickBy = pickBy;
      lodash2.property = property;
      lodash2.propertyOf = propertyOf;
      lodash2.pull = pull;
      lodash2.pullAll = pullAll;
      lodash2.pullAllBy = pullAllBy;
      lodash2.pullAllWith = pullAllWith;
      lodash2.pullAt = pullAt;
      lodash2.range = range;
      lodash2.rangeRight = rangeRight;
      lodash2.rearg = rearg;
      lodash2.reject = reject;
      lodash2.remove = remove2;
      lodash2.rest = rest;
      lodash2.reverse = reverse2;
      lodash2.sampleSize = sampleSize;
      lodash2.set = set4;
      lodash2.setWith = setWith;
      lodash2.shuffle = shuffle;
      lodash2.slice = slice;
      lodash2.sortBy = sortBy;
      lodash2.sortedUniq = sortedUniq;
      lodash2.sortedUniqBy = sortedUniqBy;
      lodash2.split = split;
      lodash2.spread = spread;
      lodash2.tail = tail;
      lodash2.take = take;
      lodash2.takeRight = takeRight;
      lodash2.takeRightWhile = takeRightWhile;
      lodash2.takeWhile = takeWhile;
      lodash2.tap = tap;
      lodash2.throttle = throttle;
      lodash2.thru = thru;
      lodash2.toArray = toArray;
      lodash2.toPairs = toPairs;
      lodash2.toPairsIn = toPairsIn;
      lodash2.toPath = toPath;
      lodash2.toPlainObject = toPlainObject;
      lodash2.transform = transform;
      lodash2.unary = unary;
      lodash2.union = union;
      lodash2.unionBy = unionBy;
      lodash2.unionWith = unionWith;
      lodash2.uniq = uniq;
      lodash2.uniqBy = uniqBy;
      lodash2.uniqWith = uniqWith;
      lodash2.unset = unset;
      lodash2.unzip = unzip;
      lodash2.unzipWith = unzipWith;
      lodash2.update = update;
      lodash2.updateWith = updateWith;
      lodash2.values = values;
      lodash2.valuesIn = valuesIn;
      lodash2.without = without;
      lodash2.words = words;
      lodash2.wrap = wrap;
      lodash2.xor = xor;
      lodash2.xorBy = xorBy;
      lodash2.xorWith = xorWith;
      lodash2.zip = zip;
      lodash2.zipObject = zipObject;
      lodash2.zipObjectDeep = zipObjectDeep;
      lodash2.zipWith = zipWith;
      lodash2.entries = toPairs;
      lodash2.entriesIn = toPairsIn;
      lodash2.extend = assignIn;
      lodash2.extendWith = assignInWith;
      mixin(lodash2, lodash2);
      lodash2.add = add;
      lodash2.attempt = attempt;
      lodash2.camelCase = camelCase;
      lodash2.capitalize = capitalize;
      lodash2.ceil = ceil;
      lodash2.clamp = clamp;
      lodash2.clone = clone;
      lodash2.cloneDeep = cloneDeep;
      lodash2.cloneDeepWith = cloneDeepWith;
      lodash2.cloneWith = cloneWith;
      lodash2.conformsTo = conformsTo;
      lodash2.deburr = deburr;
      lodash2.defaultTo = defaultTo;
      lodash2.divide = divide;
      lodash2.endsWith = endsWith;
      lodash2.eq = eq2;
      lodash2.escape = escape2;
      lodash2.escapeRegExp = escapeRegExp;
      lodash2.every = every;
      lodash2.find = find;
      lodash2.findIndex = findIndex;
      lodash2.findKey = findKey;
      lodash2.findLast = findLast;
      lodash2.findLastIndex = findLastIndex;
      lodash2.findLastKey = findLastKey;
      lodash2.floor = floor;
      lodash2.forEach = forEach;
      lodash2.forEachRight = forEachRight;
      lodash2.forIn = forIn;
      lodash2.forInRight = forInRight;
      lodash2.forOwn = forOwn;
      lodash2.forOwnRight = forOwnRight;
      lodash2.get = get3;
      lodash2.gt = gt;
      lodash2.gte = gte;
      lodash2.has = has2;
      lodash2.hasIn = hasIn;
      lodash2.head = head;
      lodash2.identity = identity;
      lodash2.includes = includes;
      lodash2.indexOf = indexOf;
      lodash2.inRange = inRange;
      lodash2.invoke = invoke;
      lodash2.isArguments = isArguments;
      lodash2.isArray = isArray;
      lodash2.isArrayBuffer = isArrayBuffer;
      lodash2.isArrayLike = isArrayLike;
      lodash2.isArrayLikeObject = isArrayLikeObject;
      lodash2.isBoolean = isBoolean;
      lodash2.isBuffer = isBuffer;
      lodash2.isDate = isDate;
      lodash2.isElement = isElement;
      lodash2.isEmpty = isEmpty;
      lodash2.isEqual = isEqual;
      lodash2.isEqualWith = isEqualWith;
      lodash2.isError = isError;
      lodash2.isFinite = isFinite;
      lodash2.isFunction = isFunction2;
      lodash2.isInteger = isInteger;
      lodash2.isLength = isLength;
      lodash2.isMap = isMap;
      lodash2.isMatch = isMatch;
      lodash2.isMatchWith = isMatchWith;
      lodash2.isNaN = isNaN2;
      lodash2.isNative = isNative;
      lodash2.isNil = isNil;
      lodash2.isNull = isNull;
      lodash2.isNumber = isNumber2;
      lodash2.isObject = isObject2;
      lodash2.isObjectLike = isObjectLike;
      lodash2.isPlainObject = isPlainObject2;
      lodash2.isRegExp = isRegExp2;
      lodash2.isSafeInteger = isSafeInteger;
      lodash2.isSet = isSet;
      lodash2.isString = isString2;
      lodash2.isSymbol = isSymbol;
      lodash2.isTypedArray = isTypedArray;
      lodash2.isUndefined = isUndefined;
      lodash2.isWeakMap = isWeakMap;
      lodash2.isWeakSet = isWeakSet;
      lodash2.join = join;
      lodash2.kebabCase = kebabCase;
      lodash2.last = last;
      lodash2.lastIndexOf = lastIndexOf;
      lodash2.lowerCase = lowerCase;
      lodash2.lowerFirst = lowerFirst;
      lodash2.lt = lt;
      lodash2.lte = lte;
      lodash2.max = max;
      lodash2.maxBy = maxBy;
      lodash2.mean = mean;
      lodash2.meanBy = meanBy;
      lodash2.min = min;
      lodash2.minBy = minBy;
      lodash2.stubArray = stubArray;
      lodash2.stubFalse = stubFalse;
      lodash2.stubObject = stubObject;
      lodash2.stubString = stubString;
      lodash2.stubTrue = stubTrue;
      lodash2.multiply = multiply;
      lodash2.nth = nth;
      lodash2.noConflict = noConflict;
      lodash2.noop = noop2;
      lodash2.now = now;
      lodash2.pad = pad;
      lodash2.padEnd = padEnd;
      lodash2.padStart = padStart;
      lodash2.parseInt = parseInt2;
      lodash2.random = random;
      lodash2.reduce = reduce;
      lodash2.reduceRight = reduceRight;
      lodash2.repeat = repeat;
      lodash2.replace = replace2;
      lodash2.result = result;
      lodash2.round = round;
      lodash2.runInContext = runInContext2;
      lodash2.sample = sample;
      lodash2.size = size;
      lodash2.snakeCase = snakeCase;
      lodash2.some = some;
      lodash2.sortedIndex = sortedIndex;
      lodash2.sortedIndexBy = sortedIndexBy;
      lodash2.sortedIndexOf = sortedIndexOf;
      lodash2.sortedLastIndex = sortedLastIndex;
      lodash2.sortedLastIndexBy = sortedLastIndexBy;
      lodash2.sortedLastIndexOf = sortedLastIndexOf;
      lodash2.startCase = startCase;
      lodash2.startsWith = startsWith;
      lodash2.subtract = subtract;
      lodash2.sum = sum;
      lodash2.sumBy = sumBy;
      lodash2.template = template;
      lodash2.times = times;
      lodash2.toFinite = toFinite;
      lodash2.toInteger = toInteger;
      lodash2.toLength = toLength;
      lodash2.toLower = toLower;
      lodash2.toNumber = toNumber;
      lodash2.toSafeInteger = toSafeInteger;
      lodash2.toString = toString2;
      lodash2.toUpper = toUpper;
      lodash2.trim = trim;
      lodash2.trimEnd = trimEnd;
      lodash2.trimStart = trimStart;
      lodash2.truncate = truncate;
      lodash2.unescape = unescape;
      lodash2.uniqueId = uniqueId;
      lodash2.upperCase = upperCase;
      lodash2.upperFirst = upperFirst;
      lodash2.each = forEach;
      lodash2.eachRight = forEachRight;
      lodash2.first = head;
      mixin(lodash2, function() {
        var source = {};
        baseForOwn(lodash2, function(func, methodName) {
          if (!hasOwnProperty.call(lodash2.prototype, methodName)) {
            source[methodName] = func;
          }
        });
        return source;
      }(), { "chain": false });
      lodash2.VERSION = VERSION;
      arrayEach(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(methodName) {
        lodash2[methodName].placeholder = lodash2;
      });
      arrayEach(["drop", "take"], function(methodName, index) {
        LazyWrapper.prototype[methodName] = function(n) {
          n = n === undefined$1 ? 1 : nativeMax(toInteger(n), 0);
          var result2 = this.__filtered__ && !index ? new LazyWrapper(this) : this.clone();
          if (result2.__filtered__) {
            result2.__takeCount__ = nativeMin(n, result2.__takeCount__);
          } else {
            result2.__views__.push({
              "size": nativeMin(n, MAX_ARRAY_LENGTH),
              "type": methodName + (result2.__dir__ < 0 ? "Right" : "")
            });
          }
          return result2;
        };
        LazyWrapper.prototype[methodName + "Right"] = function(n) {
          return this.reverse()[methodName](n).reverse();
        };
      });
      arrayEach(["filter", "map", "takeWhile"], function(methodName, index) {
        var type = index + 1, isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;
        LazyWrapper.prototype[methodName] = function(iteratee2) {
          var result2 = this.clone();
          result2.__iteratees__.push({
            "iteratee": getIteratee(iteratee2, 3),
            "type": type
          });
          result2.__filtered__ = result2.__filtered__ || isFilter;
          return result2;
        };
      });
      arrayEach(["head", "last"], function(methodName, index) {
        var takeName = "take" + (index ? "Right" : "");
        LazyWrapper.prototype[methodName] = function() {
          return this[takeName](1).value()[0];
        };
      });
      arrayEach(["initial", "tail"], function(methodName, index) {
        var dropName = "drop" + (index ? "" : "Right");
        LazyWrapper.prototype[methodName] = function() {
          return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
        };
      });
      LazyWrapper.prototype.compact = function() {
        return this.filter(identity);
      };
      LazyWrapper.prototype.find = function(predicate) {
        return this.filter(predicate).head();
      };
      LazyWrapper.prototype.findLast = function(predicate) {
        return this.reverse().find(predicate);
      };
      LazyWrapper.prototype.invokeMap = baseRest(function(path, args) {
        if (typeof path == "function") {
          return new LazyWrapper(this);
        }
        return this.map(function(value) {
          return baseInvoke(value, path, args);
        });
      });
      LazyWrapper.prototype.reject = function(predicate) {
        return this.filter(negate(getIteratee(predicate)));
      };
      LazyWrapper.prototype.slice = function(start, end) {
        start = toInteger(start);
        var result2 = this;
        if (result2.__filtered__ && (start > 0 || end < 0)) {
          return new LazyWrapper(result2);
        }
        if (start < 0) {
          result2 = result2.takeRight(-start);
        } else if (start) {
          result2 = result2.drop(start);
        }
        if (end !== undefined$1) {
          end = toInteger(end);
          result2 = end < 0 ? result2.dropRight(-end) : result2.take(end - start);
        }
        return result2;
      };
      LazyWrapper.prototype.takeRightWhile = function(predicate) {
        return this.reverse().takeWhile(predicate).reverse();
      };
      LazyWrapper.prototype.toArray = function() {
        return this.take(MAX_ARRAY_LENGTH);
      };
      baseForOwn(LazyWrapper.prototype, function(func, methodName) {
        var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName), isTaker = /^(?:head|last)$/.test(methodName), lodashFunc = lodash2[isTaker ? "take" + (methodName == "last" ? "Right" : "") : methodName], retUnwrapped = isTaker || /^find/.test(methodName);
        if (!lodashFunc) {
          return;
        }
        lodash2.prototype[methodName] = function() {
          var value = this.__wrapped__, args = isTaker ? [1] : arguments, isLazy = value instanceof LazyWrapper, iteratee2 = args[0], useLazy = isLazy || isArray(value);
          var interceptor = function(value2) {
            var result3 = lodashFunc.apply(lodash2, arrayPush([value2], args));
            return isTaker && chainAll ? result3[0] : result3;
          };
          if (useLazy && checkIteratee && typeof iteratee2 == "function" && iteratee2.length != 1) {
            isLazy = useLazy = false;
          }
          var chainAll = this.__chain__, isHybrid = !!this.__actions__.length, isUnwrapped = retUnwrapped && !chainAll, onlyLazy = isLazy && !isHybrid;
          if (!retUnwrapped && useLazy) {
            value = onlyLazy ? value : new LazyWrapper(this);
            var result2 = func.apply(value, args);
            result2.__actions__.push({ "func": thru, "args": [interceptor], "thisArg": undefined$1 });
            return new LodashWrapper(result2, chainAll);
          }
          if (isUnwrapped && onlyLazy) {
            return func.apply(this, args);
          }
          result2 = this.thru(interceptor);
          return isUnwrapped ? isTaker ? result2.value()[0] : result2.value() : result2;
        };
      });
      arrayEach(["pop", "push", "shift", "sort", "splice", "unshift"], function(methodName) {
        var func = arrayProto[methodName], chainName = /^(?:push|sort|unshift)$/.test(methodName) ? "tap" : "thru", retUnwrapped = /^(?:pop|shift)$/.test(methodName);
        lodash2.prototype[methodName] = function() {
          var args = arguments;
          if (retUnwrapped && !this.__chain__) {
            var value = this.value();
            return func.apply(isArray(value) ? value : [], args);
          }
          return this[chainName](function(value2) {
            return func.apply(isArray(value2) ? value2 : [], args);
          });
        };
      });
      baseForOwn(LazyWrapper.prototype, function(func, methodName) {
        var lodashFunc = lodash2[methodName];
        if (lodashFunc) {
          var key = lodashFunc.name + "";
          if (!hasOwnProperty.call(realNames, key)) {
            realNames[key] = [];
          }
          realNames[key].push({ "name": methodName, "func": lodashFunc });
        }
      });
      realNames[createHybrid(undefined$1, WRAP_BIND_KEY_FLAG).name] = [{
        "name": "wrapper",
        "func": undefined$1
      }];
      LazyWrapper.prototype.clone = lazyClone;
      LazyWrapper.prototype.reverse = lazyReverse;
      LazyWrapper.prototype.value = lazyValue;
      lodash2.prototype.at = wrapperAt;
      lodash2.prototype.chain = wrapperChain;
      lodash2.prototype.commit = wrapperCommit;
      lodash2.prototype.next = wrapperNext;
      lodash2.prototype.plant = wrapperPlant;
      lodash2.prototype.reverse = wrapperReverse;
      lodash2.prototype.toJSON = lodash2.prototype.valueOf = lodash2.prototype.value = wrapperValue;
      lodash2.prototype.first = lodash2.prototype.head;
      if (symIterator) {
        lodash2.prototype[symIterator] = wrapperToIterator;
      }
      return lodash2;
    };
    var _14 = runInContext();
    if (freeModule) {
      (freeModule.exports = _14)._ = _14;
      freeExports._ = _14;
    } else {
      root._ = _14;
    }
  }).call(commonjsGlobal);
})(lodash, lodash.exports);
lodash.exports;
const EMPTY_POST_ACTION = function() {
};
class FreAction {
}
function isRegExp(a) {
  if (a === void 0) {
    return false;
  }
  return a.exec !== void 0;
}
function isProKey(a) {
  return a.meta !== void 0;
}
function isString(a) {
  return !isRegExp(a) && typeof a === "string";
}
function triggerTypeToString(trigger) {
  if (isString(trigger)) {
    return trigger;
  } else if (isProKey(trigger)) {
    return "'" + trigger.meta.toString() + "-" + trigger.key + "'";
  } else if (isRegExp(trigger)) {
    return "/" + trigger.source + "/";
  } else {
    console.error("triggerToString() argument is not of FreTriggerType: " + typeof trigger);
    return "";
  }
}
class FreCommand {
}
class FreCustomCommand extends FreCommand {
  constructor(action2, boxRoleToSelect, caretPosition) {
    super();
    this.action = action2;
    this.boxRoleToSelect = boxRoleToSelect;
    this.caretPosition = caretPosition;
  }
  execute(box2, trigger, editor) {
    const self2 = this;
    const selected = self2.action(box2, triggerTypeToString(trigger), editor);
    if (!!selected) {
      if (!!self2.boxRoleToSelect) {
        return function() {
          editor.selectElementBox(selected, self2.boxRoleToSelect, self2.caretPosition);
        };
      } else {
        return function() {
          editor.selectFirstEditableChildBox(selected);
        };
      }
    }
    return EMPTY_POST_ACTION;
  }
  undo() {
  }
}
class FreCustomAction extends FreAction {
  static create(initializer) {
    const result = new FreCustomAction();
    FreUtils.initializeObject(result, initializer);
    return result;
  }
  constructor() {
    super();
  }
  command() {
    return new FreCustomCommand(this.action, this.boxRoleToSelect, this.caretPosition);
  }
}
const LOGGER$n = new FreLogger("FreCommand");
class FreCreatePartCommand extends FreCommand {
  constructor(propertyName, conceptName, referenceShortcut) {
    super();
    this.propertyName = propertyName;
    this.conceptName = conceptName;
    this.referenceShortcut = referenceShortcut;
    LOGGER$n.log("+++++++++++++++ Create part command " + propertyName + ", " + conceptName);
  }
  execute(box2, trigger, editor, index) {
    var _a, _b;
    LOGGER$n.log("CreatePartCommand: trigger [" + triggerTypeToString(trigger) + "] part: " + this.conceptName + " in " + this.propertyName + " refshort " + this.referenceShortcut + " parentbox " + ((_a = box2 === null || box2 === void 0 ? void 0 : box2.element) === null || _a === void 0 ? void 0 : _a.freLanguageConcept()));
    const ownerConcept = box2.element.freLanguageConcept();
    const propName = this.propertyName;
    const theModelElement = box2.element[propName];
    const newElement = (_b = FreLanguage.getInstance().classifier(this.conceptName)) === null || _b === void 0 ? void 0 : _b.constructor();
    if (newElement === void 0 || newElement === null) {
      console.error("ActionBox action: Unexpected new element undefined");
      return EMPTY_POST_ACTION;
    }
    LOGGER$n.log(`FreCreatePartCommand: setting/adding to ${propName} of ${box2.element.freId()} (${box2.element.freLanguageConcept()}) to ${newElement.freId()} (${newElement.freLanguageConcept()})`);
    if (FreLanguage.getInstance().classifierProperty(ownerConcept, propName).isList) {
      if (index >= 0) {
        theModelElement.splice(index, 0, newElement);
      } else {
        theModelElement.push(newElement);
      }
    } else {
      box2.element[propName] = newElement;
    }
    if (!!trigger && isString(trigger) && !!this.referenceShortcut) {
      newElement[this.referenceShortcut.propertyName] = FreLanguage.getInstance().referenceCreator(trigger, this.referenceShortcut.conceptName);
    }
    if (newElement.freIsBinaryExpression()) {
      BTREE.balanceTree(newElement, editor);
    }
    return function() {
      LOGGER$n.log("CreatePartCommand: newElement:" + newElement.freId() + " " + newElement.freLanguageConcept() + ", selected element: " + editor.selectedBox.element.freId() + " of kind " + editor.selectedBox.kind);
      editor.selectFirstEditableChildBox(newElement);
    };
  }
  undo(box2, editor) {
  }
}
class FreCreatePartAction extends FreAction {
  constructor(initializer) {
    super();
    FreUtils.initializeObject(this, initializer);
  }
  command() {
    return new FreCreatePartCommand(this.propertyName, this.conceptName, this.referenceShortcut);
  }
}
new FreLogger("FreEditorUtils").mute();
var FreCaretPosition;
(function(FreCaretPosition2) {
  FreCaretPosition2[FreCaretPosition2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  FreCaretPosition2[FreCaretPosition2["LEFT_MOST"] = 1] = "LEFT_MOST";
  FreCaretPosition2[FreCaretPosition2["RIGHT_MOST"] = 2] = "RIGHT_MOST";
  FreCaretPosition2[FreCaretPosition2["INDEX"] = 3] = "INDEX";
})(FreCaretPosition || (FreCaretPosition = {}));
class FreCaret {
  static IndexPosition(from, to) {
    return new FreCaret(FreCaretPosition.INDEX, from, to);
  }
  constructor(p, from, to) {
    this.position = p;
    this.from = from;
    if (to !== null && to !== void 0 && to > 0) {
      this.to = to;
    } else {
      this.to = from;
    }
  }
  toString() {
    return "" + this.position;
  }
}
FreCaret.RIGHT_MOST = new FreCaret(FreCaretPosition.RIGHT_MOST, 0);
FreCaret.LEFT_MOST = new FreCaret(FreCaretPosition.LEFT_MOST, 0);
FreCaret.UNSPECIFIED = new FreCaret(FreCaretPosition.UNSPECIFIED, 0);
var FreErrorSeverity;
(function(FreErrorSeverity2) {
  FreErrorSeverity2["Error"] = "Error";
  FreErrorSeverity2["Warning"] = "Warning";
  FreErrorSeverity2["Hint"] = "Hint";
  FreErrorSeverity2["Improvement"] = "Improvement";
  FreErrorSeverity2["ToDo"] = "TODO";
  FreErrorSeverity2["Info"] = "Info";
  FreErrorSeverity2["NONE"] = "NONE";
})(FreErrorSeverity || (FreErrorSeverity = {}));
const LOGGER$l = new FreLogger("ListUtil");
var MenuOptionsType;
(function(MenuOptionsType2) {
  MenuOptionsType2[MenuOptionsType2["normal"] = 0] = "normal";
  MenuOptionsType2[MenuOptionsType2["placeholder"] = 1] = "placeholder";
  MenuOptionsType2[MenuOptionsType2["header"] = 2] = "header";
})(MenuOptionsType || (MenuOptionsType = {}));
function getContextMenuOptions(conceptName, listParent, propertyName, optionsType) {
  LOGGER$l.log(`getContextMenuOptions
    conceptname: ${conceptName}
    listparent: ${listParent.freId()}=${listParent.freLanguageConcept()}
    propertyName: ${propertyName}
    optionsType ${optionsType}`);
  const clsOtIntf = FreLanguage.getInstance().classifier(conceptName);
  const errorItem = new MenuItem("No options available", "", (element, index, editor) => {
  });
  if (clsOtIntf === void 0 || clsOtIntf === null) {
    console.log("Unexpected: Cannot find class or interface for [" + conceptName + "]");
    return [errorItem];
  }
  let items;
  let addBefore;
  let addAfter;
  const contextMsg = "";
  if (clsOtIntf.subConceptNames.length > 0) {
    const submenuItemsBefore = [];
    const submenuItemsAfter = [];
    clsOtIntf.subConceptNames.filter((subName) => !FreLanguage.getInstance().classifier(subName).isAbstract).forEach((creatableConceptname) => {
      submenuItemsBefore.push(new MenuItem(creatableConceptname, "", (element, index, editor) => addListElement(editor, listParent, propertyName, index, creatableConceptname, true)));
      submenuItemsAfter.push(new MenuItem(creatableConceptname, "", (element, index, editor) => addListElement(editor, listParent, propertyName, index, creatableConceptname, false)));
    });
    addBefore = new MenuItem(`Add before ${contextMsg}`, "Ctrl+A", (element, index, editor) => {
    }, submenuItemsBefore);
    addAfter = new MenuItem(`Add after ${contextMsg}`, "Ctrl+I", (element, index, editor) => {
    }, submenuItemsAfter);
  } else {
    addBefore = new MenuItem(`Add before ${contextMsg}`, "Ctrl+A", (element, index, editor) => addListElement(editor, listParent, propertyName, index, conceptName, true));
    addAfter = new MenuItem(`Add after ${contextMsg}`, "Ctrl+I", (element, index, editor) => addListElement(editor, listParent, propertyName, index, conceptName, false));
  }
  const pasteBefore = new MenuItem("Paste before", "", (element, index, editor) => pasteListElement(listParent, propertyName, index, editor, true));
  const pasteAfter = new MenuItem("Paste after", "", (element, index, editor) => pasteListElement(listParent, propertyName, index, editor, false));
  if (optionsType === MenuOptionsType.placeholder) {
    items = [addBefore, pasteBefore];
  } else if (optionsType === MenuOptionsType.header) {
    items = [addAfter, pasteAfter];
  } else {
    items = [
      addBefore,
      addAfter,
      new MenuItem("Delete", "", (element, index, editor) => deleteListElement(listParent, propertyName, index, element)),
      new MenuItem("---", "", (element, index, editor) => console.log("this is not an option")),
      new MenuItem("Cut", "", (element, index, editor) => cutListElement(listParent, propertyName, element, editor)),
      new MenuItem("Copy", "", (element, index, editor) => copyListElement(element, editor)),
      pasteBefore,
      pasteAfter
    ];
  }
  return items;
}
function addListElement(editor, listParent, propertyName, index, typeOfAdded, before) {
  var _a;
  LOGGER$l.log(`addListElement of type: ${typeOfAdded} index: ${index}`);
  const { property, isList, type } = getPropertyInfo(listParent, propertyName);
  if (!before) {
    index++;
  }
  const newElement = (_a = FreLanguage.getInstance().classifier(typeOfAdded)) === null || _a === void 0 ? void 0 : _a.constructor();
  if (newElement === void 0 || newElement === null) {
    console.error("New element undefined");
    return;
  } else if (isList && FreLanguage.getInstance().metaConformsToType(newElement, type)) {
    runInAction(() => {
      property.splice(index, 0, newElement);
    });
    editor.selectElement(newElement);
    editor.selectFirstEditableChildBox(newElement);
  }
}
function deleteListElement(listParent, propertyName, index, element) {
  LOGGER$l.log("Delete list element in property: " + propertyName + "[" + index + "]");
  const targetIndex = index;
  LOGGER$l.log("   index of element " + element.freLanguageConcept() + "." + element.freId() + " is " + targetIndex);
  LOGGER$l.log(jsonAsString(element, 2));
  const { property, isList } = getPropertyInfo(listParent, propertyName);
  if (isList) {
    runInAction(() => {
      if (targetIndex < property.length) {
        property.splice(targetIndex, 1);
      }
    });
  }
}
function cutListElement(listParent, propertyName, element, editor) {
  deleteListElement(listParent, propertyName, 0, element);
  editor.copiedElement = element;
}
function copyListElement(element, editor) {
  editor.copiedElement = element.copy();
}
function pasteListElement(listParent, propertyName, index, editor, before) {
  LOGGER$l.log(`pasteListElement index: ${index}`);
  if (editor.copiedElement === null || editor.copiedElement === void 0) {
    editor.setUserMessage("Nothing to paste", FreErrorSeverity.Warning);
    return;
  }
  const { property, isList, type } = getPropertyInfo(listParent, propertyName);
  let targetIndex = index;
  if (!before || index === -1) {
    targetIndex++;
  }
  if (!FreLanguage.getInstance().metaConformsToType(editor.copiedElement, type)) {
    editor.setUserMessage("Types do not conform (" + editor.copiedElement.freLanguageConcept() + " does not conform to " + type + ").", FreErrorSeverity.Error);
    return;
  }
  if (isList) {
    LOGGER$l.log("List before: [" + property.map((x) => x.freId()).join(", ") + "]");
    let insertedElement = editor.copiedElement;
    runInAction(() => {
      if (targetIndex <= property.length) {
        property.splice(targetIndex, 0, editor.copiedElement);
      }
      insertedElement = editor.copiedElement;
      editor.copiedElement = insertedElement.copy();
    });
    editor.selectElement(insertedElement);
    editor.selectFirstEditableChildBox(insertedElement);
    LOGGER$l.log("List after: [" + property.map((x) => x.freId()).join(", ") + "]");
  }
}
function getPropertyInfo(element, propertyName) {
  const property = element[propertyName];
  const propInfo = FreLanguage.getInstance().classifierProperty(element.freLanguageConcept(), propertyName);
  const isList = propInfo.isList;
  const isPart = propInfo.propertyKind;
  const type = propInfo.type;
  return { property, isList, isPart, type };
}
class MenuItem {
  constructor(label, shortcut, handler, subItems) {
    this.subItems = [];
    this.label = label;
    this.shortcut = shortcut;
    this.handler = handler;
    if (subItems !== void 0 && subItems !== null) {
      this.subItems = subItems;
    }
  }
  hasSubItems() {
    return this.subItems.length > 0;
  }
}
class AbstractChoiceBox extends Box {
  constructor(node, role, placeHolder, initializer) {
    super(node, role);
    this.kind = "AbstractChoiceBox";
    this.caretPosition = -1;
    this.setCaret = (caret) => {
      if (!!this.textBox) {
        this.textBox.setCaret(caret);
      }
    };
    this.update = () => {
    };
    this.triggerKeyPressEvent = () => {
    };
    this.triggerKeyDownEvent = () => {
    };
    this.placeholder = placeHolder;
    this.textHelper = new ChoiceTextHelper();
    FreUtils.initializeObject(this, initializer);
    this._textBox = BoxFactory.text(node, "action-" + role + "-textbox", () => {
      return this.textHelper.getText();
    }, (value) => {
      this.textHelper.setText(value);
    }, {
      parent: this,
      selectable: true,
      placeHolder
    });
  }
  get textBox() {
    this._textBox.propertyName = this.propertyName;
    this._textBox.propertyIndex = this.propertyIndex;
    return this._textBox;
  }
  getSelectedOption() {
    return null;
  }
  getOptions(editor) {
    return [];
  }
  selectOption(editor, option) {
    console.error("AbstractChoiceBox.selectOption");
    return BehaviorExecutionResult.NULL;
  }
  deleteWhenEmpty1() {
    return false;
  }
  isEditable() {
    return true;
  }
}
class IndentBox extends Box {
  get child() {
    return this.$child;
  }
  set child(v) {
    this.$child = v;
    this.$child.parent = this;
    this.isDirty();
  }
  constructor(node, role, indent, child) {
    super(node, role);
    this.kind = "IndentBox";
    this.$child = null;
    this.indent = 4;
    this.indent = indent;
    this.child = child;
    this.selectable = false;
  }
  get firstLeaf() {
    return this.child.firstLeaf;
  }
  get lastLeaf() {
    return this.child.lastLeaf;
  }
  get firstEditableChild() {
    return this.child.firstEditableChild;
  }
  get children() {
    return [this.child];
  }
}
class LabelBox extends Box {
  constructor(node, role, getLabel, initializer) {
    super(node, role);
    this.kind = "LabelBox";
    this.$label = "";
    this.selectable = false;
    FreUtils.initializeObject(this, initializer);
    this.setLabel(getLabel);
  }
  setLabel(getLabel) {
    if (typeof getLabel === "function") {
      if (this.getLabel !== getLabel) {
        this.getLabel = getLabel;
        this.isDirty();
      }
    } else if (typeof getLabel === "string") {
      if (this.$label !== getLabel) {
        this.$label = getLabel;
        this.isDirty();
      }
    } else {
      throw new Error("LabelBox: incorrect label type");
    }
  }
  getLabel() {
    return this.$label;
  }
}
const LOGGER$k = new FreLogger("LayoutBox");
var ListDirection;
(function(ListDirection2) {
  ListDirection2["HORIZONTAL"] = "Horizontal";
  ListDirection2["VERTICAL"] = "Vertical";
})(ListDirection || (ListDirection = {}));
class LayoutBox extends Box {
  constructor(node, role, children, initializer) {
    super(node, role);
    this.kind = "LayoutBox";
    this.direction = ListDirection.HORIZONTAL;
    this._children = [];
    FreUtils.initializeObject(this, initializer);
    if (!!children) {
      children.forEach((b) => this.addChildNoDirty(b));
    }
    this.selectable = false;
  }
  addChildNoDirty(child) {
    if (!!child) {
      this._children.push(child);
      child.parent = this;
    }
    return this;
  }
  get children() {
    return this._children;
  }
  replaceChildren(children) {
    this._children.forEach((ch) => ch.parent = null);
    this._children.splice(0, this._children.length);
    if (!!children) {
      children.forEach((child) => {
        if (!!child) {
          this._children.push(child);
          child.parent = this;
        }
      });
    }
    LOGGER$k.log("Layout replaceChildren dirty " + this.role);
    this.isDirty();
    return this;
  }
  clearChildren() {
    const dirty = this._children.length !== 0;
    this._children.splice(0, this._children.length);
    if (dirty) {
      LOGGER$k.log("Layout clearChildren dirty " + this.role);
      this.isDirty();
    }
  }
  addChild(child) {
    if (!!child) {
      this._children.push(child);
      child.parent = this;
      LOGGER$k.log("Layout addChild dirty " + this.role + " child added " + child.id);
      this.isDirty();
    }
    return this;
  }
  insertChild(child) {
    if (!!child) {
      this._children.splice(0, 0, child);
      child.parent = this;
      LOGGER$k.log("Layout insertChild dirty " + this.role + " child inserted " + child.id);
      this.isDirty();
    }
    return this;
  }
  addChildren(children) {
    if (!!children) {
      children.forEach((child) => this.addChild(child));
      this.isDirty();
    }
    return this;
  }
  nextSibling(box2) {
    const index = this.children.indexOf(box2);
    if (index !== -1) {
      if (index + 1 < this.children.length) {
        return this.children[index + 1];
      }
    }
    return null;
  }
  previousSibling(box2) {
    const index = this.children.indexOf(box2);
    if (index > 0) {
      return this.children[index - 1];
    }
    return null;
  }
  getDirection() {
    return this.direction;
  }
  toString() {
    let result = "Layout: " + this.role + " " + this.direction.toString() + "<";
    for (const child of this.children) {
      result += "\n    " + child.toString();
    }
    result += ">";
    return result;
  }
}
class HorizontalLayoutBox extends LayoutBox {
  constructor(element, role, children, initializer) {
    super(element, role, children, initializer);
    this.kind = "HorizontalLayoutBox";
    this.direction = ListDirection.HORIZONTAL;
  }
}
class VerticalLayoutBox extends LayoutBox {
  constructor(element, role, children, initializer) {
    super(element, role, children, initializer);
    this.kind = "VerticalLayoutBox";
    this.direction = ListDirection.VERTICAL;
  }
}
class ListBox extends LayoutBox {
  constructor(node, propertyName, role, children, initializer) {
    var _a;
    super(node, role, children, initializer);
    this.conceptName = "unknown-type";
    this.kind = "ListBox";
    this.propertyName = propertyName;
    this.conceptName = (_a = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName)) === null || _a === void 0 ? void 0 : _a.type;
  }
  options(type) {
    return getContextMenuOptions(this.conceptName, this.element, this.propertyName, type);
  }
}
class HorizontalListBox extends ListBox {
  constructor(element, propertyName, role, children, initializer) {
    super(element, role, propertyName, children, initializer);
    this.kind = "HorizontalListBox";
    this.direction = ListDirection.HORIZONTAL;
  }
}
class VerticalListBox extends ListBox {
  constructor(node, propertyName, role, children, initializer) {
    super(node, role, propertyName, children, initializer);
    this.kind = "VerticalListBox";
    this.direction = ListDirection.VERTICAL;
  }
}
const LOGGER$j = new FreLogger("ActionBox");
class ActionBox extends AbstractChoiceBox {
  constructor(element, role, placeHolder, initializer) {
    super(element, role, placeHolder, initializer);
    this.kind = "ActionBox";
    this.triggerKeyPressEvent = (key) => {
      console.error("ActionBox " + this.role + " has empty triggerKeyPressEvent " + key);
    };
  }
  selectOption(editor, option) {
    LOGGER$j.log("ActionBox selectOption " + JSON.stringify(option));
    if (!!option.action) {
      return executeSingleBehavior(option.action, this, option.id, option.label, editor);
    } else {
      const result = executeBehavior(this, option.id, option.label, editor);
      if (result === BehaviorExecutionResult.EXECUTED) {
        return result;
      }
      const allOptions = this.getOptions(editor);
      const selectedOptions = allOptions.filter((o) => option.label === o.label);
      if (selectedOptions.length === 1) {
        LOGGER$j.log("ActionBox.selectOption dynamic " + JSON.stringify(selectedOptions));
        return executeBehavior(this, selectedOptions[0].id, selectedOptions[0].label, editor);
      } else {
        LOGGER$j.log("ActionBox.selectOption : " + JSON.stringify(selectedOptions));
        return BehaviorExecutionResult.NO_MATCH;
      }
    }
  }
  getOptions(editor) {
    LOGGER$j.log("getOptions for " + this.$id + "- " + this.conceptName + "." + this.propertyName);
    const result = [];
    if (!!this.propertyName && !!this.conceptName) {
      LOGGER$j.log(`  has property ${this.propertyName} and concept ${this.conceptName}`);
      const clsOtIntf = FreLanguage.getInstance().classifier(this.conceptName);
      const propDef = FreLanguage.getInstance().classifierProperty(this.conceptName, this.propertyName);
      LOGGER$j.log(`clsIntf: ${clsOtIntf} prop kind: ${propDef === null || propDef === void 0 ? void 0 : propDef.propertyKind}`);
      clsOtIntf.subConceptNames.concat(this.conceptName).forEach((creatableConceptname) => {
        const creatableConcept = FreLanguage.getInstance().classifier(creatableConceptname);
        LOGGER$j.log(`creatableConcept: ${creatableConcept}`);
        if (!!creatableConcept && !creatableConcept.isAbstract) {
          if (!!creatableConcept.referenceShortcut) {
            this.addReferenceShortcuts(creatableConcept, result, editor);
          }
          result.push(this.getCreateElementOption(this.propertyName, creatableConceptname, creatableConcept));
        }
      });
    } else if (!!this.propertyName) {
      const propDef = FreLanguage.getInstance().classifierProperty(this.element.freLanguageConcept(), this.propertyName);
      LOGGER$j.log(`parent: ${this.element.freLanguageConcept()} prop ${propDef.name} kind: ${propDef === null || propDef === void 0 ? void 0 : propDef.propertyKind}`);
      this.addReferences(this.element, propDef, result, editor);
    } else {
      LOGGER$j.log("No property and concept defined for action box " + this.role);
    }
    editor.newFreActions.filter((action2) => !isProKey(action2.trigger) && action2.activeInBoxRoles.includes(this.role)).forEach((action2) => {
      const options = [];
      options.push({
        id: triggerTypeToString(action2.trigger),
        label: triggerTypeToString(action2.trigger),
        action: action2,
        description: "action " + triggerTypeToString(action2.trigger)
      });
      result.push(...options);
    });
    return result;
  }
  getCreateElementOption(propertyName, conceptName, concept) {
    LOGGER$j.log("ActionBox.createElementAction property: " + propertyName + " concept " + conceptName);
    return {
      id: conceptName,
      label: concept.trigger,
      action: new FreCreatePartAction({
        propertyName,
        conceptName
      }),
      description: "action auto"
    };
  }
  addReferenceShortcuts(concept, result, editor) {
    const self2 = this;
    runInAction(() => {
      const newElement = concept.constructor();
      newElement["$$owner"] = this.element;
      result.push(...editor.environment.scoper.getVisibleNames(newElement, concept.referenceShortcut.conceptName).filter((name) => !!name && name !== "").map((name) => ({
        id: concept.trigger + "-" + name,
        label: name,
        description: "create " + concept.referenceShortcut.conceptName,
        action: new FreCreatePartAction({
          referenceShortcut: {
            propertyName: concept.referenceShortcut.propertyName,
            conceptName: concept.referenceShortcut.conceptName
          },
          propertyName: self2.propertyName,
          conceptName: concept.typeName
        })
      })));
    });
  }
  addReferences(parentNode, property, result, editor) {
    LOGGER$j.log("addReferences: " + parentNode.freLanguageConcept() + " property " + property.name);
    const propType = property.type;
    runInAction(() => {
      result.push(...editor.environment.scoper.getVisibleNames(parentNode, propType).filter((name) => !!name && name !== "").map((name) => ({
        id: parentNode.freLanguageConcept() + "-" + name,
        label: name,
        description: "create ref to " + propType,
        action: FreCustomAction.create({
          activeInBoxRoles: [],
          action: (box2, trigger, ed) => {
            parentNode[property.name].push(FreNodeReference.create(name, null));
            return null;
          }
        })
      })));
    });
  }
}
class OptionalBox extends Box {
  get mustShow() {
    return this._mustShow;
  }
  set mustShow(v) {
    this._mustShow = v;
    this.isDirty();
  }
  constructor(element, role, condition, box2, mustShow, actionText) {
    super(element, role);
    this.kind = "OptionalBox";
    this.content = null;
    this.placeholder = null;
    this._mustShow = false;
    this.conditionChanged = () => {
      console.log("AUTORUN showByCondition");
      this.condition();
      this.isDirty();
    };
    this.content = box2;
    box2.parent = this;
    this.placeholder = BoxFactory.action(element, role, actionText);
    this.placeholder.parent = this;
    this.mustShow = mustShow;
    this.condition = condition;
    autorun(this.conditionChanged);
  }
  get showByCondition() {
    return this.condition();
  }
  get firstLeaf() {
    if (this.condition() || this.mustShow) {
      return this.content.firstLeaf;
    } else {
      return this.placeholder;
    }
  }
  get lastLeaf() {
    if (this.condition() || this.mustShow) {
      return this.content.lastLeaf;
    } else {
      return this.placeholder;
    }
  }
  get firstEditableChild() {
    if (this.condition() || this.mustShow) {
      return this.content.firstEditableChild;
    } else {
      return this.placeholder;
    }
  }
  get children() {
    if (this.condition() || this.mustShow) {
      return [this.content];
    } else {
      return [this.placeholder];
    }
  }
}
class OptionalBox2 extends Box {
  get mustShow() {
    return this._mustShow;
  }
  set mustShow(v) {
    this._mustShow = v;
    this.isDirty();
  }
  constructor(node, role, condition, box2, mustShow, placeholder) {
    super(node, role);
    this.kind = "OptionalBox2";
    this.content = null;
    this.placeholder = null;
    this._mustShow = false;
    this.conditionChanged = () => {
      this.condition();
      this.isDirty();
    };
    this.content = box2;
    box2.parent = this;
    this.placeholder = placeholder;
    this.placeholder.parent = this;
    this.mustShow = mustShow;
    this.condition = condition;
    autorun(this.conditionChanged);
  }
  get showByCondition() {
    return this.condition();
  }
  get firstLeaf() {
    if (this.condition() || this.mustShow) {
      return this.content.firstLeaf;
    } else {
      return this.placeholder;
    }
  }
  get lastLeaf() {
    if (this.condition() || this.mustShow) {
      return this.content.lastLeaf;
    } else {
      return this.placeholder;
    }
  }
  get firstEditableChild() {
    if (this.condition() || this.mustShow) {
      return this.content.firstEditableChild;
    } else {
      return this.placeholder;
    }
  }
  get children() {
    if (this.condition() || this.mustShow) {
      return [this.content];
    } else {
      return [this.placeholder];
    }
  }
}
const LOGGER$i = new FreLogger("TextBox");
var CharAllowed;
(function(CharAllowed2) {
  CharAllowed2[CharAllowed2["OK"] = 0] = "OK";
  CharAllowed2[CharAllowed2["GOTO_NEXT"] = 1] = "GOTO_NEXT";
  CharAllowed2[CharAllowed2["GOTO_PREVIOUS"] = 2] = "GOTO_PREVIOUS";
  CharAllowed2[CharAllowed2["NOT_OK"] = 3] = "NOT_OK";
})(CharAllowed || (CharAllowed = {}));
class TextBox extends Box {
  setText(newValue) {
    LOGGER$i.log("setText to " + newValue);
    this.$setText(newValue);
    this.isDirty();
  }
  getText() {
    return this.$getText();
  }
  constructor(node, role, getText, setText, initializer) {
    super(node, role);
    this.kind = "TextBox";
    this.deleteWhenEmpty = false;
    this.deleteWhenEmptyAndErase = false;
    this.placeHolder = "";
    this.caretPosition = -1;
    this.isCharAllowed = () => {
      return CharAllowed.OK;
    };
    this.setCaret = (caret) => {
      LOGGER$i.log("setCaret: " + caret.position);
      switch (caret.position) {
        case FreCaretPosition.RIGHT_MOST:
          this.caretPosition = this.getText().length;
          break;
        case FreCaretPosition.LEFT_MOST:
          this.caretPosition = 0;
          break;
        case FreCaretPosition.INDEX:
          this.caretPosition = caret.position;
          break;
        case FreCaretPosition.UNSPECIFIED:
          break;
      }
    };
    this.update = () => {
    };
    FreUtils.initializeObject(this, initializer);
    this.$getText = getText;
    this.$setText = setText;
  }
  deleteWhenEmpty1() {
    return this.deleteWhenEmpty;
  }
  isEditable() {
    return true;
  }
}
class SelectBox extends AbstractChoiceBox {
  constructor(node, role, placeHolder, getOptions, getSelectedOption, selectOption, initializer) {
    super(node, role, placeHolder, initializer);
    this.kind = "SelectBox";
    this.deleteWhenEmpty = false;
    this.getAllOptions = getOptions;
    this.getSelectedOption = getSelectedOption;
    this.selectOption = selectOption;
  }
  getOptions(editor) {
    let matchingOptions;
    matchingOptions = this.getAllOptions(editor);
    return matchingOptions;
  }
  deleteWhenEmpty1() {
    return this.deleteWhenEmpty;
  }
}
const LOGGER$g = new FreLogger("BoxFactory").mute();
let actionCache = {};
let labelCache = {};
let textCache = {};
let selectCache = {};
let optionalCache = {};
let optionalCache2 = {};
let horizontalLayoutCache = {};
let verticalLayoutCache = {};
let horizontalListCache = {};
let verticalListCache = {};
let cacheActionOff = false;
let cacheLabelOff = false;
let cacheTextOff = false;
let cacheSelectOff = false;
let cacheHorizontalLayoutOff = false;
let cacheVerticalLayoutOff = false;
let cacheHorizontalListOff = false;
let cacheVerticalListOff = false;
class BoxFactory {
  static clearCaches() {
    actionCache = {};
    labelCache = {};
    textCache = {};
    selectCache = {};
    optionalCache = {};
    optionalCache2 = {};
    horizontalLayoutCache = {};
    verticalLayoutCache = {};
    horizontalListCache = {};
    verticalListCache = {};
  }
  static cachesOff() {
    cacheActionOff = true;
    cacheLabelOff = true;
    cacheTextOff = true;
    cacheSelectOff = true;
    cacheHorizontalLayoutOff = true;
    cacheVerticalLayoutOff = true;
    cacheHorizontalListOff = true;
    cacheVerticalListOff = true;
  }
  static cachesOn() {
    cacheActionOff = false;
    cacheLabelOff = false;
    cacheTextOff = false;
    cacheSelectOff = false;
    cacheHorizontalLayoutOff = false;
    cacheVerticalLayoutOff = false;
    cacheHorizontalListOff = false;
    cacheVerticalListOff = false;
  }
  static find(element, role, creator, cache) {
    const elementId = element.freId();
    if (!!cache[elementId]) {
      const box2 = cache[elementId][role];
      if (!!box2) {
        LOGGER$g.log(":: EXISTS " + box2.kind + " for entity " + elementId + " role " + role + " already exists");
        return box2;
      } else {
        const newBox = creator();
        LOGGER$g.log(":: new " + newBox.kind + " for entity " + elementId + " role " + role + "            CREATED");
        cache[elementId][role] = newBox;
        return newBox;
      }
    } else {
      const newBox = creator();
      LOGGER$g.log(":: new " + newBox.kind + " for entity " + elementId + " role " + role + "               CREATED");
      cache[elementId] = {};
      cache[elementId][role] = newBox;
      return newBox;
    }
  }
  static action(element, role, placeHolder, initializer) {
    if (cacheActionOff) {
      return new ActionBox(element, role, placeHolder, initializer);
    }
    const creator = () => new ActionBox(element, role, placeHolder, initializer);
    const result = this.find(element, role, creator, actionCache);
    result.placeholder = placeHolder;
    result.textHelper.setText("");
    FreUtils.initializeObject(result, initializer);
    return result;
  }
  static label(element, role, getLabel, initializer) {
    if (cacheLabelOff) {
      return new LabelBox(element, role, getLabel, initializer);
    }
    const creator = () => new LabelBox(element, role, getLabel, initializer);
    const result = this.find(element, role, creator, labelCache);
    result.setLabel(getLabel);
    FreUtils.initializeObject(result, initializer);
    return result;
  }
  static text(element, role, getText, setText, initializer) {
    if (cacheTextOff) {
      return new TextBox(element, role, getText, setText, initializer);
    }
    const creator = () => new TextBox(element, role, getText, setText, initializer);
    const result = this.find(element, role, creator, textCache);
    result.$getText = getText;
    result.$setText = setText;
    FreUtils.initializeObject(result, initializer);
    return result;
  }
  static indent(element, role, indent, childBox) {
    return new IndentBox(element, role, indent, childBox);
  }
  static sameChildren(one, two) {
    const oneOk = one.every((o) => two.includes(o));
    const twoOk = two.every((o) => one.includes(o));
    return oneOk && twoOk;
  }
  static horizontalLayout(element, role, propertyName, children, initializer) {
    if (cacheHorizontalLayoutOff) {
      return new HorizontalLayoutBox(element, role, children, initializer);
    }
    const creator = () => new HorizontalLayoutBox(element, role, children, initializer);
    const result = this.find(element, role, creator, horizontalLayoutCache);
    if (!equals(result.children, children)) {
      result.replaceChildren(children);
    }
    FreUtils.initializeObject(result, initializer);
    return result;
  }
  static verticalLayout(element, role, propertyName, children, initializer) {
    if (cacheVerticalLayoutOff) {
      return new VerticalLayoutBox(element, role, children, initializer);
    }
    const creator = () => new VerticalLayoutBox(element, role, children, initializer);
    const result = this.find(element, role, creator, verticalLayoutCache);
    if (!equals(result.children, children)) {
      result.replaceChildren(children);
    }
    FreUtils.initializeObject(result, initializer);
    return result;
  }
  static horizontalList(element, role, propertyName, children, initializer) {
    if (cacheHorizontalListOff) {
      return new HorizontalListBox(element, role, propertyName, children, initializer);
    }
    const creator = () => new HorizontalListBox(element, role, propertyName, children, initializer);
    const result = this.find(element, role, creator, horizontalListCache);
    if (!equals(result.children, children)) {
      result.replaceChildren(children);
    }
    FreUtils.initializeObject(result, initializer);
    return result;
  }
  static verticalList(element, role, propertyName, children, initializer) {
    if (cacheVerticalListOff) {
      return new VerticalListBox(element, role, propertyName, children, initializer);
    }
    const creator = () => new VerticalListBox(element, role, propertyName, children, initializer);
    const result = this.find(element, role, creator, verticalListCache);
    if (!equals(result.children, children)) {
      result.replaceChildren(children);
    }
    FreUtils.initializeObject(result, initializer);
    return result;
  }
  static select(element, role, placeHolder, getOptions, getSelectedOption, selectOption, initializer) {
    if (cacheSelectOff) {
      return new SelectBox(element, role, placeHolder, getOptions, getSelectedOption, selectOption, initializer);
    }
    const creator = () => new SelectBox(element, role, placeHolder, getOptions, getSelectedOption, selectOption, initializer);
    const result = this.find(element, role, creator, selectCache);
    result.placeholder = placeHolder;
    result.getOptions = getOptions;
    result.getSelectedOption = getSelectedOption;
    result.selectOption = selectOption;
    FreUtils.initializeObject(result, initializer);
    return result;
  }
  static optional(element, role, condition, box2, mustShow, actionText, initializer) {
    const creator = () => new OptionalBox(element, role, condition, box2, mustShow, actionText);
    const result = this.find(element, role, creator, optionalCache);
    FreUtils.initializeObject(result, initializer);
    return result;
  }
  static optional2(element, role, condition, box2, mustShow, optional, initializer) {
    const creator = () => new OptionalBox2(element, role, condition, box2, mustShow, optional);
    const result = this.find(element, role, creator, optionalCache2);
    FreUtils.initializeObject(result, initializer);
    return result;
  }
  static gridcell(element, propertyName, role, row, column, box2, initializer) {
    {
      return new GridCellBox(element, role, row, column, box2, initializer);
    }
  }
  static tablecell(element, propertyName, propertyIndex, conceptName, role, row, column, box2, initializer) {
    {
      return new TableCellBox(element, propertyName, propertyIndex, conceptName, role, row, column, box2, initializer);
    }
  }
}
const equals = (a, b) => {
  if (isNullOrUndefined(a) && !isNullOrUndefined(b) || !isNullOrUndefined(a) && isNullOrUndefined(b)) {
    return false;
  }
  if (isNullOrUndefined(a) && isNullOrUndefined(b)) {
    return true;
  }
  return a.length === b.length && a.every((v, i) => v === b[i]);
};
class GridCellBox extends Box {
  constructor(node, role, row, column, box2, initializer) {
    super(node, role);
    this.row = 1;
    this.column = 1;
    this.$content = null;
    this.isHeader = false;
    this.kind = "GridCellBox";
    this.row = row;
    this.column = column;
    this.content = box2;
    if (!!box2) {
      box2.parent = this;
    }
    FreUtils.initializeObject(this, initializer);
    this.selectable = false;
  }
  get content() {
    return this.$content;
  }
  set content(b) {
    if (!!this.$content) {
      this.$content.parent = null;
    }
    this.$content = b;
    if (!!b) {
      b.parent = this;
    }
    this.isDirty();
  }
  get children() {
    return [this.$content];
  }
}
var TableDirection;
(function(TableDirection2) {
  TableDirection2["HORIZONTAL"] = "Row";
  TableDirection2["VERTICAL"] = "Column";
})(TableDirection || (TableDirection = {}));
class TableCellBox extends GridCellBox {
  constructor(node, propertyName, propertyIndex, conceptName, role, row, column, box2, initializer) {
    super(node, role, row, column, box2, initializer);
    this.kind = "TableCellBox";
    this.conceptName = "unknown-type";
    this.propertyName = propertyName;
    this.propertyIndex = propertyIndex;
    this.conceptName = conceptName;
  }
  options(type) {
    let listParent;
    if (type === MenuOptionsType.placeholder || type === MenuOptionsType.header) {
      listParent = this.element;
    } else {
      listParent = this.element.freOwner();
    }
    return getContextMenuOptions(this.conceptName, listParent, this.propertyName, type);
  }
}
class ChoiceTextHelper {
  constructor() {
    this.$text = "";
  }
  getText() {
    return this.$text;
  }
  setText(v) {
    this.$text = v;
  }
}
class RoleProvider {
  static classifier(concept) {
    return RoleProvider.startWithUpperCase(concept.typeName);
  }
  static property(owningConceptName, propertyName, boxType, index) {
    let roleName = RoleProvider.startWithUpperCase(owningConceptName) + "-" + propertyName;
    if (index !== null && index !== void 0 && index >= 0) {
      roleName += "-" + index;
    }
    if (boxType !== null && boxType !== void 0 && boxType.length >= 0) {
      roleName += "-" + boxType;
    }
    return roleName;
  }
  static startWithUpperCase(word) {
    if (!!word) {
      return word[0].toUpperCase() + word.substring(1);
    }
    return "";
  }
  static label(element, uid) {
    return RoleProvider.startWithUpperCase(element.freLanguageConcept()) + element.freId() + "-label-" + uid;
  }
  static indent(element, uid) {
    return RoleProvider.startWithUpperCase(element.freLanguageConcept()) + element.freId() + "-indent-" + uid;
  }
  static cell(owningConceptName, propertyName, rowIndex, columnIndex) {
    let roleName = RoleProvider.startWithUpperCase(owningConceptName) + "-" + propertyName;
    roleName += "-row-" + rowIndex + "-column-" + columnIndex;
    return roleName;
  }
  static row(owningConceptName, propertyName, index) {
    return RoleProvider.startWithUpperCase(owningConceptName) + "-" + propertyName + "-row-" + index;
  }
}
class BoxUtil {
  static emptyLineBox(node, role) {
    return new EmptyLineBox(node, role);
  }
  static textBox(node, propertyName, index) {
    let result = null;
    const propInfo = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName);
    const isList = propInfo.isList;
    const property = node[propertyName];
    if (property !== void 0 && property !== null && typeof property === "string") {
      const roleName = RoleProvider.property(node.freLanguageConcept(), propertyName, "textbox", index);
      if (isList && this.checkList(isList, index, propertyName)) {
        result = BoxFactory.text(node, roleName, () => node[propertyName][index], (v) => runInAction(() => {
          node[propertyName][index] = v;
        }), { placeHolder: `<${propertyName}>` });
      } else {
        result = BoxFactory.text(node, roleName, () => node[propertyName], (v) => runInAction(() => {
          node[propertyName] = v;
        }), { placeHolder: `<${propertyName}>` });
      }
      result.propertyName = propertyName;
      result.propertyIndex = index;
    } else {
      FreUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a string: " + property + '"');
    }
    return result;
  }
  static numberBox(node, propertyName, index) {
    let result = null;
    const propInfo = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName);
    const property = node[propertyName];
    const isList = propInfo.isList;
    if (property !== void 0 && property !== null && typeof property === "number") {
      const roleName = RoleProvider.property(node.freLanguageConcept(), propertyName, "numberbox", index);
      if (isList && this.checkList(isList, index, propertyName)) {
        result = BoxFactory.text(node, roleName, () => node[propertyName][index].toString(), (v) => runInAction(() => {
          node[propertyName][index] = Number.parseInt(v, 10);
        }), {
          placeHolder: `<${propertyName}>`,
          isCharAllowed: (currentText, key, innerIndex) => {
            return isNumber(currentText, key, innerIndex);
          }
        });
      } else {
        result = BoxFactory.text(node, roleName, () => node[propertyName].toString(), (v) => runInAction(() => {
          node[propertyName] = Number.parseInt(v, 10);
        }), {
          placeHolder: `<${propertyName}>`,
          isCharAllowed: (currentText, key, innerIndex) => {
            return isNumber(currentText, key, innerIndex);
          }
        });
      }
      result.propertyName = propertyName;
      result.propertyIndex = index;
    } else {
      FreUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a number: " + property + '"');
    }
    return result;
  }
  static booleanBox(node, propertyName, labels = {
    yes: "yes",
    no: "no"
  }, index) {
    const propInfo = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName);
    const isList = propInfo.isList;
    const property = node[propertyName];
    if (!(property !== void 0 && property !== null)) {
      FreUtils.CHECK(false, "Property " + propertyName + " does not exist:" + property + '"');
    }
    if (!(typeof property === "boolean" || typeof property === "string")) {
      FreUtils.CHECK(false, "Property " + propertyName + " is not a boolean:" + property.freLanguageConcept() + '"');
    }
    const roleName = RoleProvider.property(node.freLanguageConcept(), propertyName, "booleanbox", index);
    let result;
    if (isList && this.checkList(isList, index, propertyName)) {
      result = BoxFactory.select(node, roleName, "<optional>", () => [{ id: labels.yes, label: labels.yes }, { id: labels.no, label: labels.no }], () => {
        if (node[propertyName][index]) {
          return { id: labels.yes, label: labels.yes };
        } else {
          return { id: labels.no, label: labels.no };
        }
      }, (editor, option) => {
        runInAction(() => {
          if (option.id === labels.yes) {
            node[propertyName][index] = true;
          } else if (option.id === labels.no) {
            node[propertyName][index] = false;
          }
        });
        return BehaviorExecutionResult.NULL;
      });
    } else {
      result = BoxFactory.select(node, roleName, "<optional>", () => [{ id: labels.yes, label: labels.yes }, { id: labels.no, label: labels.no }], () => {
        if (node[propertyName] === true) {
          return { id: labels.yes, label: labels.yes };
        } else {
          return { id: labels.no, label: labels.no };
        }
      }, (editor, option) => {
        runInAction(() => {
          if (option.id === labels.yes) {
            node[propertyName] = true;
          } else if (option.id === labels.no) {
            node[propertyName] = false;
          }
        });
        return BehaviorExecutionResult.NULL;
      });
    }
    result.propertyName = propertyName;
    result.propertyIndex = index;
    return result;
  }
  static referenceBox(node, propertyName, setFunc, scoper, index) {
    var _a;
    const propType = (_a = FreLanguage.getInstance().classifierProperty(node.freLanguageConcept(), propertyName)) === null || _a === void 0 ? void 0 : _a.type;
    if (!propType) {
      throw new Error("Cannot find property type '" + propertyName + "'");
    }
    let property = node[propertyName];
    const roleName = RoleProvider.property(node.freLanguageConcept(), propertyName, "referencebox", index);
    if (index !== null && index !== void 0 && index >= 0) {
      property = property[index];
    }
    let result;
    result = BoxFactory.select(node, roleName, `<${propertyName}>`, () => {
      return scoper.getVisibleNames(node, propType).filter((name) => !!name && name !== "").map((name) => ({
        id: name,
        label: name
      }));
    }, () => {
      if (!!property) {
        return { id: property.name, label: property.name };
      } else {
        return null;
      }
    }, (editor, option) => {
      if (!!option) {
        runInAction(() => {
          setFunc(option.label);
        });
      } else {
        runInAction(() => {
          node[propertyName] = null;
        });
      }
      return BehaviorExecutionResult.EXECUTED;
    }, {});
    result.propertyName = propertyName;
    result.propertyIndex = index;
    return result;
  }
  static labelBox(node, content, uid, selectable) {
    let _selectable = false;
    if (selectable !== void 0 && selectable !== null && selectable) {
      _selectable = true;
    }
    const roleName = RoleProvider.label(node, uid) + "-" + content;
    return BoxFactory.label(node, roleName, content, {
      selectable: _selectable
    });
  }
  static indentBox(element, indent, uid, childBox) {
    return BoxFactory.indent(element, RoleProvider.indent(element, uid), indent, childBox);
  }
  static verticalPartListBox(element, list, propertyName, listJoin, boxProviderCache) {
    let children = this.findPartItems(list, element, propertyName, listJoin, boxProviderCache);
    children = this.addPlaceholder(children, element, propertyName);
    const role = RoleProvider.property(element.freLanguageConcept(), propertyName, "vpartlist");
    const result = BoxFactory.verticalList(element, role, propertyName, children);
    result.propertyName = propertyName;
    return result;
  }
  static verticalReferenceListBox(element, propertyName, scoper, listInfo) {
    const { property, isList, isPart } = this.getPropertyInfo(element, propertyName);
    if (property !== void 0 && propertyName !== null && isList && isPart === "reference") {
      let children = this.makeRefItems(property, element, propertyName, scoper, listInfo);
      children = this.addReferencePlaceholder(children, element, propertyName);
      let result;
      result = BoxFactory.verticalList(element, RoleProvider.property(element.freLanguageConcept(), propertyName, "vreflist"), propertyName, children);
      result.propertyName = propertyName;
      return result;
    } else {
      FreUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a list or not a reference: " + property + '"');
      return null;
    }
  }
  static horizontalPartListBox(element, list, propertyName, listJoin, boxProviderCache) {
    let children = this.findPartItems(list, element, propertyName, listJoin, boxProviderCache);
    children = this.addPlaceholder(children, element, propertyName);
    const role = RoleProvider.property(element.freLanguageConcept(), propertyName, "vpartlist");
    const result = BoxFactory.horizontalList(element, role, propertyName, children);
    result.propertyName = propertyName;
    return result;
  }
  static horizontalReferenceListBox(element, propertyName, scoper, listJoin) {
    const { property, isList, isPart } = this.getPropertyInfo(element, propertyName);
    if (property !== void 0 && propertyName !== null && isList && isPart === "reference") {
      let children = this.makeRefItems(property, element, propertyName, scoper, listJoin);
      children = this.addReferencePlaceholder(children, element, propertyName);
      let result;
      result = BoxFactory.horizontalList(element, RoleProvider.property(element.freLanguageConcept(), propertyName, "hlist"), propertyName, children);
      result.propertyName = propertyName;
      return result;
    } else {
      FreUtils.CHECK(false, "Property " + propertyName + " does not exist or is not a list or not a reference: " + property + '"');
      return null;
    }
  }
  static getBoxOrAction(element, propertyName, conceptName, boxProviderCache) {
    const property = element[propertyName];
    const roleName = RoleProvider.property(element.freLanguageConcept(), propertyName);
    let result;
    result = !!property ? boxProviderCache.getBoxProvider(property).box : BoxFactory.action(element, roleName, "[add]", { propertyName, conceptName });
    result.propertyName = propertyName;
    return result;
  }
  static checkList(isList, index, propertyName) {
    let res = true;
    if (index !== null && index !== void 0 && !isList) {
      FreUtils.CHECK(false, "Property " + propertyName + " is not a list: " + index + '"');
      res = false;
    }
    if (isList && (index === null || index === void 0 || index < 0)) {
      FreUtils.CHECK(false, "Property " + propertyName + " is a list, index should be provided.");
      res = false;
    }
    return res;
  }
  static addPlaceholder(children, element, propertyName) {
    return children.concat(BoxFactory.action(element, RoleProvider.property(element.freLanguageConcept(), propertyName, "new-list-item"), `<+ ${propertyName}>`, {
      propertyName: `${propertyName}`,
      conceptName: FreLanguage.getInstance().classifierProperty(element.freLanguageConcept(), propertyName).type
    }));
  }
  static addReferencePlaceholder(children, element, propertyName) {
    return children.concat(BoxFactory.action(element, RoleProvider.property(element.freLanguageConcept(), propertyName, "new-list-item"), `<+ ${propertyName}>`, {
      propertyName: `${propertyName}`
    }));
  }
  static findPartItems(property, element, propertyName, listJoin, boxProviderCache) {
    const numberOfItems = property.length;
    return property.map((listElem, index) => {
      const myProvider = boxProviderCache.getBoxProvider(listElem);
      const roleName = RoleProvider.property(element.freLanguageConcept(), propertyName, "list-item", index);
      if (listJoin !== null && listJoin !== void 0) {
        if (listJoin.type === this.separatorName) {
          if (index < numberOfItems - 1) {
            return BoxFactory.horizontalLayout(element, roleName, propertyName, [
              myProvider.box,
              BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
            ]);
          } else {
            return myProvider.box;
          }
        } else if (listJoin.type === this.terminatorName) {
          return BoxFactory.horizontalLayout(element, roleName, propertyName, [
            myProvider.box,
            BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
          ]);
        } else if (listJoin.type === this.initiatorName) {
          return BoxFactory.horizontalLayout(element, roleName, propertyName, [
            BoxFactory.label(element, roleName + "list-item-label", listJoin.text),
            myProvider.box
          ]);
        }
      } else {
        return myProvider.box;
      }
      return null;
    });
  }
  static makeRefItems(properties, element, propertyName, scoper, listJoin) {
    const result = [];
    const numberOfItems = properties.length;
    properties.forEach((listElem, index) => {
      const roleName = RoleProvider.property(element.freLanguageConcept(), propertyName, "list-item", index);
      const setFunc = (selected) => {
        listElem.name = selected;
        return BehaviorExecutionResult.EXECUTED;
      };
      if (listJoin !== null && listJoin !== void 0) {
        if (listJoin.type === this.separatorName) {
          if (index < numberOfItems - 1) {
            result.push(BoxFactory.horizontalList(element, roleName, propertyName, [
              BoxUtil.referenceBox(element, propertyName, setFunc, scoper, index),
              BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
            ]));
          } else {
            result.push(BoxUtil.referenceBox(element, propertyName, setFunc, scoper, index));
          }
        } else if (listJoin.type === this.terminatorName) {
          result.push(BoxFactory.horizontalList(element, roleName, propertyName, [
            BoxUtil.referenceBox(element, propertyName, setFunc, scoper, index),
            BoxFactory.label(element, roleName + "list-item-label", listJoin.text)
          ]));
        } else if (listJoin.type === this.initiatorName) {
          result.push(BoxFactory.horizontalList(element, roleName, propertyName, [
            BoxFactory.label(element, roleName + "list-item-label", listJoin.text),
            BoxUtil.referenceBox(element, propertyName, setFunc, scoper, index)
          ]));
        }
      } else {
        result.push(BoxUtil.referenceBox(element, propertyName, setFunc, scoper, index));
      }
    });
    return result;
  }
  static getPropertyInfo(element, propertyName) {
    const property = element[propertyName];
    const propInfo = FreLanguage.getInstance().classifierProperty(element.freLanguageConcept(), propertyName);
    const isList = propInfo.isList;
    const isPart = propInfo.propertyKind;
    return { property, isList, isPart };
  }
}
BoxUtil.separatorName = "Separator";
BoxUtil.terminatorName = "Terminator";
BoxUtil.initiatorName = "Initiator";
function isNumber(currentText, key, index) {
  if (isNaN(Number(key))) {
    if (index === currentText.length) {
      return CharAllowed.GOTO_NEXT;
    } else if (index === 0) {
      return CharAllowed.GOTO_PREVIOUS;
    } else {
      return CharAllowed.NOT_OK;
    }
  } else {
    return CharAllowed.OK;
  }
}
class SimpleIdProvider {
  constructor(prefix) {
    this.latest = 0;
    this.usedIds = [];
    this.prefix = prefix;
  }
  newId() {
    this.latest++;
    let result = this.prefix + this.latest;
    while (this.usedIds.includes(result)) {
      this.latest++;
      result = this.prefix + this.latest;
    }
    this.usedIds.push(result);
    return result;
  }
  usedId(id) {
    this.usedIds.push(id);
  }
}
class FreUtils {
  static resetId() {
    this.nodeIdProvider = new SimpleIdProvider("ID-");
    this.boxIdProvider = new SimpleIdProvider("BOX-");
  }
  static ID() {
    return this.nodeIdProvider.newId();
  }
  static BOX_ID() {
    return this.boxIdProvider.newId();
  }
  static initializeObject(target, source) {
    if (!(target && source)) {
      return;
    }
    Object.keys(source).forEach((key) => {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    });
  }
  static CHECK(b, msg) {
    if (!b) {
      throw new Error(msg ? "FAILED Check: " + msg : "check error");
    }
  }
  static setContainer(exp, freOwnerDescriptor, editor) {
    runInAction(() => {
      if (typeof freOwnerDescriptor !== "undefined") {
        if (freOwnerDescriptor.propertyIndex === void 0) {
          freOwnerDescriptor.owner[freOwnerDescriptor.propertyName] = exp;
        } else {
          freOwnerDescriptor.owner[freOwnerDescriptor.propertyName][freOwnerDescriptor.propertyIndex] = exp;
        }
      } else {
        editor.rootElement = exp;
      }
    });
  }
  static replaceExpression(oldExpression, newExpression, editor) {
    FreUtils.CHECK(isFreExpression(oldExpression), "replaceExpression: old element should be a FreExpressionNode, but it isn't");
    FreUtils.CHECK(isFreExpression(newExpression), "replaceExpression: new element should be a FreExpressionNode, but it isn't");
    runInAction(() => {
      FreUtils.setContainer(newExpression, oldExpression.freOwnerDescriptor(), editor);
    });
  }
}
FreUtils.nodeIdProvider = new SimpleIdProvider("ID-");
FreUtils.resetId();
function isNullOrUndefined(obj) {
  return obj === void 0 || obj === null;
}
const FRE_BINARY_EXPRESSION_LEFT = "FreBinaryExpression-left";
const FRE_BINARY_EXPRESSION_RIGHT = "FreBinaryExpression-right";
const BEFORE_BINARY_OPERATOR = "binary-pre";
const AFTER_BINARY_OPERATOR = "binary-post";
const LEFT_MOST = "exp-left";
const RIGHT_MOST = "exp-right";
const LOGGER$d = new FreLogger("BalanceTree");
class BTree {
  constructor() {
    makeObservable(this, {
      balanceTree: action,
      setLeftExpression: action,
      setRightExpression: action,
      insertBinaryExpression: action
    });
  }
  isRightMostChild(exp) {
    FreUtils.CHECK(!exp.freIsBinaryExpression(), "isRightMostChild expects a non-binary expression");
    let currentExp = exp;
    let ownerDescriptor = currentExp.freOwnerDescriptor();
    while (ownerDescriptor && isFreBinaryExpression(ownerDescriptor.owner)) {
      if (ownerDescriptor.owner.freRight() === currentExp) {
        currentExp = ownerDescriptor.owner;
        ownerDescriptor = ownerDescriptor.owner.freOwnerDescriptor();
      } else {
        return false;
      }
    }
    return true;
  }
  isLeftMostChild(exp) {
    FreUtils.CHECK(!exp.freIsBinaryExpression(), "isLeftMostChild expects a non-binary expression");
    let currentExp = exp;
    let ownerDescriptor = currentExp.freOwnerDescriptor();
    while (ownerDescriptor && isFreBinaryExpression(ownerDescriptor.owner)) {
      if (ownerDescriptor.owner.freLeft() === currentExp) {
        currentExp = ownerDescriptor.owner;
        ownerDescriptor = ownerDescriptor.owner.freOwnerDescriptor();
      } else {
        return false;
      }
    }
    return true;
  }
  setRightExpression(binaryExp, newExp, editor) {
    const right = binaryExp.freRight();
    binaryExp.freSetRight(newExp);
    newExp.freSetRight(right);
    this.balanceTree(newExp, editor);
  }
  setLeftExpression(binaryExp, newExp, editor) {
    const left = binaryExp.freLeft();
    binaryExp.freSetLeft(newExp);
    newExp.freSetLeft(left);
    this.balanceTree(newExp, editor);
  }
  insertBinaryExpression(newBinExp, box2, editor) {
    LOGGER$d.log("insertBinaryExpression for " + box2.element);
    let selectedElement = null;
    FreUtils.CHECK(isFreExpression(box2.element), "insertBinaryExpression: current element should be a FreExpressionNode, but it isn't");
    const exp = box2.element;
    switch (box2.role) {
      case LEFT_MOST:
        selectedElement = { element: newBinExp, boxRoleToSelect: FRE_BINARY_EXPRESSION_LEFT };
        FreUtils.replaceExpression(exp, newBinExp, editor);
        newBinExp.freSetRight(exp);
        this.balanceTree(newBinExp, editor);
        break;
      case RIGHT_MOST:
        selectedElement = { element: newBinExp, boxRoleToSelect: FRE_BINARY_EXPRESSION_RIGHT };
        FreUtils.replaceExpression(exp, newBinExp, editor);
        newBinExp.freSetLeft(exp);
        this.balanceTree(newBinExp, editor);
        break;
      case BEFORE_BINARY_OPERATOR:
        FreUtils.CHECK(isFreBinaryExpression(exp), "Operator action only allowed in binary operator");
        selectedElement = { element: newBinExp, boxRoleToSelect: FRE_BINARY_EXPRESSION_RIGHT };
        const left = exp.freLeft();
        exp.freSetLeft(newBinExp);
        newBinExp.freSetLeft(left);
        this.balanceTree(newBinExp, editor);
        break;
      case AFTER_BINARY_OPERATOR:
        FreUtils.CHECK(isFreBinaryExpression(exp), "Operator action only allowed in binary operator");
        selectedElement = { element: newBinExp, boxRoleToSelect: FRE_BINARY_EXPRESSION_LEFT };
        const right = exp.freRight();
        exp.freSetRight(newBinExp);
        newBinExp.freSetRight(right);
        this.balanceTree(newBinExp, editor);
        break;
      default:
        throw Error("Cannot insert binary expression");
    }
    return selectedElement;
  }
  balanceTree(binaryExp, editor) {
    const ownerDescriptor = binaryExp.freOwnerDescriptor();
    const left = binaryExp.freLeft();
    if (isFreBinaryExpression(left)) {
      LOGGER$d.log("Rule 1: prio parent <= prio left");
      if (binaryExp.frePriority() > left.frePriority()) {
        const leftRight = left.freRight();
        FreUtils.setContainer(left, ownerDescriptor, editor);
        left.freSetRight(binaryExp);
        binaryExp.freSetLeft(leftRight);
        this.balanceTree(binaryExp, editor);
        return;
      }
    }
    const right = binaryExp.freRight();
    if (isFreBinaryExpression(right)) {
      LOGGER$d.log("Rule 2: prio parent < prio right");
      if (binaryExp.frePriority() >= right.frePriority()) {
        const rightLeft = right.freLeft();
        FreUtils.setContainer(right, ownerDescriptor, editor);
        right.freSetLeft(binaryExp);
        binaryExp.freSetRight(rightLeft);
        this.balanceTree(binaryExp, editor);
        return;
      }
    }
    if (ownerDescriptor && isFreBinaryExpression(ownerDescriptor.owner)) {
      const parent = ownerDescriptor.owner;
      if (parent.freLeft() === binaryExp) {
        LOGGER$d.log("Rule 3: exp is a left child");
        if (binaryExp.frePriority() < parent.frePriority()) {
          const parentProContainer = parent.freOwnerDescriptor();
          const expRight = binaryExp.freRight();
          FreUtils.setContainer(binaryExp, parentProContainer, editor);
          binaryExp.freSetRight(parent);
          parent.freSetLeft(expRight);
          this.balanceTree(binaryExp, editor);
          return;
        }
      } else {
        FreUtils.CHECK(parent.freRight() === binaryExp, "should be the right child");
        LOGGER$d.log("Rule 4: exp is a right child, parent is " + parent);
        if (binaryExp.frePriority() <= parent.frePriority()) {
          const parentProContainer = parent.freOwnerDescriptor();
          const expLeft = binaryExp.freLeft();
          FreUtils.setContainer(binaryExp, parentProContainer, editor);
          binaryExp.freSetLeft(parent);
          parent.freSetRight(expLeft);
          this.balanceTree(binaryExp, editor);
          return;
        }
      }
    }
  }
}
const BTREE = new BTree();
function runtimeReplacer(key, value) {
  var _a;
  if (key === "declaration") {
    return "REF-" + ((_a = value === null || value === void 0 ? void 0 : value.declaration) === null || _a === void 0 ? void 0 : _a.name);
  }
  if (value instanceof Map) {
    return Array.from(value.entries());
  }
  return value;
}
const getCircularReplacer = () => {
  const seen = /* @__PURE__ */ new WeakSet();
  return (key, value) => {
    if (key === "$$owner" || key === "$$propertyName" || key === "$$propertyIndex") {
      return void 0;
    }
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "SELF";
      }
      seen.add(value);
    }
    return runtimeReplacer(key, value);
  };
};
function jsonAsString(object2, indent) {
  return JSON.stringify(object2, getCircularReplacer(), indent);
}
class FreLanguage {
  static getInstance() {
    if (FreLanguage.theInstance === void 0) {
      FreLanguage.theInstance = new FreLanguage();
    }
    return FreLanguage.theInstance;
  }
  set stdLib(lib) {
    this._stdLib = lib;
  }
  get stdLib() {
    return this._stdLib;
  }
  constructor() {
    this.units = /* @__PURE__ */ new Map();
    this.concepts = /* @__PURE__ */ new Map();
    this.interfaces = /* @__PURE__ */ new Map();
    this._stdLib = new EmptyStdLib();
  }
  model() {
    return this.pmodel;
  }
  modelOfType(typeName) {
    if (!!this.pmodel && this.pmodel.typeName === typeName) {
      return this.pmodel;
    } else {
      return null;
    }
  }
  unit(typeName) {
    return this.units.get(typeName);
  }
  unitByKey(key) {
    return this.helperByKey(this.units, key);
  }
  concept(typeName) {
    return this.concepts.get(typeName);
  }
  conceptByKey(conceptKey) {
    return this.helperByKey(this.concepts, conceptKey);
  }
  helperByKey(map2, conceptKey) {
    for (const concept of map2.values()) {
      if (concept.key === conceptKey) {
        return concept;
      }
    }
    return null;
  }
  interface(typeName) {
    return this.interfaces.get(typeName);
  }
  interfaceByKey(key) {
    return this.helperByKey(this.interfaces, key);
  }
  classifier(typeName) {
    const concept1 = this.concepts.get(typeName);
    if (!!concept1) {
      return concept1;
    } else {
      const intf = this.interfaces.get(typeName);
      if (!!intf) {
        return intf;
      } else {
        const unit1 = this.units.get(typeName);
        if (!!unit1) {
          return unit1;
        } else {
          const model = this.modelOfType(typeName);
          if (!!model) {
            return model;
          }
        }
      }
    }
    return void 0;
  }
  classifierByKey(key) {
    const concept1 = this.conceptByKey(key);
    if (!!concept1) {
      return concept1;
    } else {
      const intf = this.interfaceByKey(key);
      if (!!intf) {
        return intf;
      } else {
        const unit1 = this.unitByKey(key);
        if (!!unit1) {
          return unit1;
        } else {
          const model = this.modelOfType(key);
          if (!!model) {
            return model;
          }
        }
      }
    }
    return void 0;
  }
  helperPropByKey(map2, key) {
    for (const prop of map2.values()) {
      if (prop.key === key) {
        return prop;
      }
    }
    return void 0;
  }
  unitPropertyByKey(unitKey, propertyKey) {
    return this.helperPropByKey(this.unitByKey(unitKey).properties, propertyKey);
  }
  interfacePropertyByKey(interfaceKey, propertyKey) {
    return this.helperPropByKey(this.interfaceByKey(interfaceKey).properties, propertyKey);
  }
  classifierProperty(typeName, propertyName) {
    const concept1 = this.concepts.get(typeName);
    if (!!concept1) {
      return concept1.properties.get(propertyName);
    } else {
      const intf = this.interfaces.get(typeName);
      if (!!intf) {
        return intf.properties.get(propertyName);
      } else {
        const unit1 = this.units.get(typeName);
        if (!!unit1) {
          return unit1.properties.get(propertyName);
        } else {
          const model = this.modelOfType(typeName);
          if (!!model) {
            return model.properties.get(propertyName);
          }
        }
      }
    }
    return void 0;
  }
  classifierPropertyByKey(classifierKey, propertyKey) {
    const concept1 = this.classifierByKey(classifierKey);
    return this.helperPropByKey(concept1.properties, propertyKey);
  }
  allConceptProperties(typeName) {
    let myType = this.concept(typeName);
    if (isNullOrUndefined(myType)) {
      myType = this.unit(typeName);
    }
    if (myType === void 0) {
      return [];
    }
    return [...myType.properties.values()];
  }
  getPropertiesOfKind(typename, ptype) {
    const classifier = FreLanguage.getInstance().classifier(typename);
    const foundProperties = [];
    if (!!classifier) {
      for (const prop of classifier.properties.values()) {
        if (prop.propertyKind === ptype) {
          foundProperties.push(prop);
        }
      }
    }
    return foundProperties;
  }
  getPropertyValue(element, prop) {
    if (prop.isList) {
      return element[prop.name];
    } else {
      const value = element[prop.name];
      if (!!value) {
        return [value];
      } else {
        return [];
      }
    }
  }
  getNamedConcepts() {
    return Array.from(this.concepts.values()).filter((concept) => concept.isNamedElement).map((concept) => concept.typeName);
  }
  getNamedInterfaces() {
    return Array.from(this.interfaces.values()).filter((intfc) => intfc.isNamedElement).map((intfc) => intfc.typeName);
  }
  getNamedElements() {
    return this.getNamedConcepts().concat(this.getNamedInterfaces());
  }
  getUnitNames() {
    return Array.from(this.units.values()).map((unit) => unit.typeName);
  }
  createModel(id) {
    var _a;
    return (_a = this.pmodel) === null || _a === void 0 ? void 0 : _a.constructor(id);
  }
  createUnit(typeName, id) {
    var _a;
    return (_a = this.units.get(typeName)) === null || _a === void 0 ? void 0 : _a.constructor(id);
  }
  createConceptOrUnit(typeName, id) {
    let myType = this.concept(typeName);
    if (isNullOrUndefined(myType)) {
      myType = this.unit(typeName);
    }
    return myType === null || myType === void 0 ? void 0 : myType.constructor(id);
  }
  addModel(model) {
    if (!!this.pmodel) {
      console.error("Language: adding model of type " + (model === null || model === void 0 ? void 0 : model.typeName) + " while there is already a model of type " + this.pmodel.typeName);
    }
    this.pmodel = model;
  }
  addUnit(unit) {
    this.units.set(unit.typeName, unit);
    unit.subConceptNames = [];
  }
  addConcept(concept) {
    this.concepts.set(concept.typeName, concept);
  }
  addInterface(intface) {
    this.interfaces.set(intface.typeName, intface);
  }
  set name(name) {
    this.languageName = name;
  }
  get name() {
    return this.languageName;
  }
  set id(id) {
    this.languageId = id;
  }
  get id() {
    return this.languageId;
  }
  subConcepts(typeName) {
    const concept = this.concept(typeName);
    if (!!concept) {
      return concept.subConceptNames;
    }
    const intface = this.interface(typeName);
    if (!!intface) {
      return intface.subConceptNames;
    }
    return [];
  }
  addReferenceCreator(creator) {
    this.referenceCreator = creator;
  }
  metaConformsToType(element, requestedType) {
    const metatype = element.freLanguageConcept();
    return metatype === requestedType || FreLanguage.getInstance().subConcepts(requestedType).includes(metatype);
  }
}
function isFreExpression(node) {
  return !!node && node.freIsExpression && node.freIsExpression();
}
function isFreBinaryExpression(node) {
  return !!node && node.freIsExpression && node.freIsExpression() && node.freIsBinaryExpression && node.freIsBinaryExpression();
}
function modelUnit(node) {
  var _a;
  let current = node;
  while (!!current) {
    if (current.freIsUnit()) {
      return current;
    } else {
      current = (_a = current.freOwnerDescriptor()) === null || _a === void 0 ? void 0 : _a.owner;
    }
  }
  return null;
}
const LOGGER$b = new FreLogger("FreChangeManager").mute();
class FreChangeManager {
  static getInstance() {
    if (this.theInstance === void 0 || this.theInstance === null) {
      this.theInstance = new FreChangeManager();
    }
    return this.theInstance;
  }
  constructor() {
    this.changePrimCallbacks = [];
    this.changePartCallbacks = [];
    this.changeListElemCallbacks = [];
    this.changeListCallbacks = [];
  }
  setPart(nodeToChange, propertyName, newValue, oldValue) {
    LOGGER$b.log("ChangeManager: set PART value for " + nodeToChange.freLanguageConcept() + "[" + propertyName + "] := " + newValue);
    if (!!this.changePartCallbacks) {
      const unit = modelUnit(nodeToChange);
      if (!!(unit === null || unit === void 0 ? void 0 : unit.freOwner()) || nodeToChange.freIsModel()) {
        const delta = new FrePartDelta(unit, nodeToChange, propertyName, oldValue, newValue);
        for (const cb of this.changePartCallbacks) {
          cb(delta);
        }
      }
    }
  }
  setPrimitive(nodeToChange, propertyName, value) {
    LOGGER$b.log("ChangeManager: set PRIMITIVE value for " + nodeToChange.freLanguageConcept() + "[" + propertyName + "] := " + value);
    if (!!this.changePrimCallbacks) {
      const unit = modelUnit(nodeToChange);
      if (!!(unit === null || unit === void 0 ? void 0 : unit.freOwner()) || nodeToChange.freIsModel()) {
        const delta = new FrePrimDelta(unit, nodeToChange, propertyName, nodeToChange[propertyName], value);
        for (const cb of this.changePrimCallbacks) {
          cb(delta);
        }
      }
    }
  }
  updatePartListElement(newValue, oldValue, index) {
    const owner = oldValue.$$owner;
    const propertyName = oldValue.$$propertyName;
    LOGGER$b.log("ChangeManager: UPDATE LIST ELEMENT for " + owner.freLanguageConcept() + "[" + propertyName + "][ " + index + "] := " + newValue);
    if (!!this.changeListElemCallbacks) {
      const unit = modelUnit(owner);
      if (!!(unit === null || unit === void 0 ? void 0 : unit.freOwner()) || owner.freIsModel()) {
        const delta = new FrePartDelta(unit, owner, propertyName, oldValue, newValue, index);
        if (delta !== null && delta !== void 0) {
          for (const cb of this.changeListElemCallbacks) {
            cb(delta);
          }
        }
      }
    }
  }
  updatePartList(listOwner, propertyName, index, removed, added) {
    LOGGER$b.log("ChangeManager: UPDATE PART LIST for " + listOwner.freLanguageConcept() + "[" + propertyName + "]");
    if (!!this.changeListCallbacks) {
      const unit = modelUnit(listOwner);
      if (!!(unit === null || unit === void 0 ? void 0 : unit.freOwner()) || listOwner.freIsModel()) {
        const delta = new FrePartListDelta(unit, listOwner, propertyName, index, removed, added);
        for (const cb of this.changeListCallbacks) {
          cb(delta);
        }
      }
    }
  }
  updatePrimList(listOwner, propertyName, index, removed, added) {
    LOGGER$b.log("ChangeManager: UPDATE PRIMITIVE LIST for " + listOwner.freLanguageConcept() + "[" + propertyName + "]");
    if (!!this.changeListCallbacks) {
      const unit = modelUnit(listOwner);
      if (!!(unit === null || unit === void 0 ? void 0 : unit.freOwner()) || listOwner.freIsModel()) {
        const delta = new FrePrimListDelta(unit, listOwner, propertyName, index, removed, added);
        for (const cb of this.changeListCallbacks) {
          cb(delta);
        }
      }
    }
  }
  updatePrimListElement(listOwner, propertyName, newValue, oldValue, index) {
    LOGGER$b.log("ChangeManager: UPDATE LIST ELEMENT for " + listOwner.freLanguageConcept() + "[" + propertyName + "][" + index + "] := " + newValue);
    if (!!this.changeListElemCallbacks) {
      const unit = modelUnit(listOwner);
      if (!!(unit === null || unit === void 0 ? void 0 : unit.freOwner()) || listOwner.freIsModel()) {
        const delta = new FrePrimDelta(unit, listOwner, propertyName, oldValue, newValue, index);
        if (delta !== null && delta !== void 0) {
          for (const cb of this.changeListElemCallbacks) {
            cb(delta);
          }
        }
      }
    }
  }
}
const LOGGER$9 = new FreLogger("MobxDecorators").mute();
const MODEL_PREFIX = "_FRE_";
const MODEL_CONTAINER = MODEL_PREFIX + "Container";
const MODEL_NAME = MODEL_PREFIX + "Name";
function observablepart(target, propertyKey) {
  const privatePropertyKey = MODEL_PREFIX + propertyKey.toString();
  const getter = function() {
    const storedObserver = this[privatePropertyKey];
    if (!!storedObserver) {
      return storedObserver.get();
    } else {
      this[privatePropertyKey] = observable.box(null);
      return this[privatePropertyKey].get();
    }
  };
  const setter = function(newValue) {
    let storedObserver = this[privatePropertyKey];
    const storedValue = !!storedObserver ? storedObserver.get() : null;
    if (allOwners(this).includes(newValue)) {
      throw Error("CYCLE IN AST");
    }
    FreChangeManager.getInstance().setPart(this, propertyKey, newValue, storedValue);
    if (!!storedValue) {
      storedValue.$$owner = null;
      storedValue.$$propertyName = "";
      storedValue.$$propertyIndex = void 0;
    }
    if (!!storedObserver) {
      runInAction(() => {
        storedObserver.set(newValue);
      });
    } else {
      this[privatePropertyKey] = observable.box(newValue);
      storedObserver = this[privatePropertyKey];
    }
    if (newValue !== null && newValue !== void 0) {
      if (newValue.$$owner !== void 0 && newValue.$$owner !== null) {
        if (newValue.$$propertyIndex !== void 0) {
          newValue.$$owner[newValue.$$propertyName].splice(newValue.$$propertyIndex, 1);
        } else {
          newValue.$$owner[MODEL_PREFIX + newValue.$$propertyName] = null;
        }
      }
      newValue.$$owner = this;
      newValue.$$propertyName = propertyKey.toString();
      newValue.$$propertyIndex = void 0;
    }
  };
  Reflect.deleteProperty(target, propertyKey);
  Reflect.defineProperty(target, propertyKey, {
    get: getter,
    set: setter,
    configurable: true
  });
}
function observablepartlist(target, propertyKey) {
  observablelist(target, propertyKey, false);
}
function observableprim(target, propertyKey) {
  const privatePropertyKey = MODEL_PREFIX + propertyKey.toString();
  const getter = function() {
    const storedObserver = this[privatePropertyKey];
    if (!!storedObserver) {
      return storedObserver.get();
    } else {
      this[privatePropertyKey] = observable.box(null);
      return this[privatePropertyKey].get();
    }
  };
  const setter = function(newValue) {
    FreChangeManager.getInstance().setPrimitive(this, propertyKey, newValue);
    let storedObserver = this[privatePropertyKey];
    if (!!storedObserver) {
      runInAction(() => {
        storedObserver.set(newValue);
      });
    } else {
      storedObserver = observable.box(newValue);
      this[privatePropertyKey] = storedObserver;
    }
  };
  Reflect.deleteProperty(target, propertyKey);
  Reflect.defineProperty(target, propertyKey, {
    get: getter,
    set: setter,
    configurable: true
  });
}
function observableprimlist(target, propertyKey) {
  observablelist(target, propertyKey, true);
}
function observablelist(target, propertyKey, isPrimitive) {
  const privatePropertyKey = MODEL_PREFIX + propertyKey;
  const getter = function() {
    return this[privatePropertyKey];
  };
  const array2 = observable.array([], { deep: false });
  target[privatePropertyKey] = array2;
  array2[MODEL_CONTAINER] = target;
  array2[MODEL_NAME] = propertyKey.toString();
  if (!isPrimitive) {
    intercept(array2, (change) => objectWillChange(change, propertyKey));
  } else {
    intercept(array2, (change) => primWillChange(change, target, propertyKey));
  }
  Reflect.deleteProperty(target, propertyKey);
  Reflect.defineProperty(target, propertyKey, {
    get: getter
  });
}
function resetOwner(element, listOwner, propertyName, index) {
  if (!!element) {
    if (!!element.$$owner) {
      if (element.$$propertyIndex !== void 0) {
        element.$$owner[element.$$propertyName].splice(element.$$propertyIndex, 1);
      } else {
        element.$$owner[element.$$propertyName] = null;
      }
    }
    element.$$owner = listOwner;
    element.$$propertyName = propertyName;
    element.$$propertyIndex = index;
  }
}
function cleanOwner(oldValue) {
  oldValue.$$owner = null;
  oldValue.$$propertyName = "";
  oldValue.$$propertyIndex = void 0;
}
function objectWillChange(change, propertyKey) {
  switch (change.type) {
    case "update":
      const newValue = change.newValue;
      if (newValue !== null && newValue !== void 0) {
        const oldValue = change.object[change.index];
        FreChangeManager.getInstance().updatePartListElement(newValue, oldValue, change.index);
        if (newValue !== oldValue) {
          resetOwner(newValue, oldValue.$$owner, oldValue.$$propertyName, oldValue.$$propertyIndex);
          cleanOwner(oldValue);
        }
      } else {
        change.object.splice(change.index, 1);
        LOGGER$9.info(`Attempt to assign null to element of observable list '${propertyKey}': element is removed.`);
        return null;
      }
      break;
    case "splice":
      const index = change.index;
      const removedCount = change.removedCount;
      const removed = [];
      for (let num = 0; num < removedCount; num++) {
        removed.push(change.object[index + num]);
      }
      const added = change.added;
      let addedCount = added.length;
      const listOwner = change.object[MODEL_CONTAINER];
      const propertyName = change.object[MODEL_NAME];
      let i = 0;
      added.forEach((element) => {
        if (element !== null && element !== void 0) {
          resetOwner(element, listOwner, propertyName, index + Number(i++));
        } else {
          change.added.splice(i, 1);
          addedCount--;
          LOGGER$9.info(`Ignored attempt to add null or undefined to observable list '${propertyKey}'.`);
        }
      });
      for (const rem of removed) {
        cleanOwner(rem);
      }
      for (let above = index; above < change.object.length; above++) {
        const aboveElement = change.object[above];
        if (aboveElement.$$propertyIndex !== void 0) {
          aboveElement.$$propertyIndex += addedCount - removedCount;
        }
      }
      FreChangeManager.getInstance().updatePartList(listOwner, propertyName, index, removed, change.added);
      break;
  }
  return change;
}
function primWillChange(change, target, propertyKey) {
  switch (change.type) {
    case "update":
      const newValue = change.newValue;
      const oldValue = change.object[change.index];
      if (newValue !== null && newValue !== void 0) {
        FreChangeManager.getInstance().updatePrimListElement(target, propertyKey, newValue, oldValue, change.index);
      } else {
        change.object.splice(change.index, 1);
        LOGGER$9.info(`Attempt to assign null to element of observable list '${propertyKey}': element is removed.`);
        return null;
      }
      break;
    case "splice":
      const index = change.index;
      const removedCount = change.removedCount;
      const removed = [];
      for (let num = 0; num < removedCount; num++) {
        removed.push(change.object[index + num]);
      }
      const added = change.added;
      const listOwner = change.object[MODEL_CONTAINER];
      const propertyName = change.object[MODEL_NAME];
      added.forEach((element, i) => {
        if (element === null || element === void 0) {
          change.added.splice(i, 1);
          LOGGER$9.info(`Ignored attempt to add null or undefined to observable list '${propertyKey}'.`);
        }
      });
      FreChangeManager.getInstance().updatePrimList(listOwner, propertyName, index, removed, change.added);
      break;
  }
  return change;
}
class FreNodeBaseImpl extends MobxModelElementImpl {
  copy() {
    throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
  }
  match(toBeMatched) {
    throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
  }
  freId() {
    throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
  }
  freIsBinaryExpression() {
    throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
  }
  freIsExpression() {
    throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
  }
  freIsModel() {
    throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
  }
  freIsUnit() {
    throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
  }
  freLanguageConcept() {
    throw new Error("Method should be implemented by subclasses of FreElementBaseImpl.");
  }
}
class FreLanguageEnvironment {
  constructor() {
    this.scoper = null;
    this.typer = null;
    this.projection = null;
  }
  static setInstance(env) {
    FreLanguageEnvironment.theInstance = env;
  }
  static getInstance() {
    if (FreLanguageEnvironment.theInstance === null) {
      FreLanguageEnvironment.theInstance = new FreLanguageEnvironment();
    }
    return FreLanguageEnvironment.theInstance;
  }
  newModel(modelName) {
    return void 0;
  }
}
FreLanguageEnvironment.theInstance = null;
const LOGGER$8 = new FreLogger("FreElementReference").mute();
class FreNodeReference extends MobxModelElementImpl {
  static create(name, typeName) {
    const result = new FreNodeReference(null, typeName);
    if (Array.isArray(name)) {
      result.pathname = name;
    } else if (typeof name === "string") {
      result.name = name;
    } else if (typeof name === "object") {
      result.referred = name;
    }
    result.typeName = typeName;
    return result;
  }
  copy() {
    return FreNodeReference.create(this._FRE_pathname, this.typeName);
  }
  constructor(referredElement, typeName) {
    super();
    this._FRE_pathname = [];
    this._FRE_referred = null;
    this.typeName = "";
    this.referred = referredElement;
    this.typeName = typeName;
    makeObservable(this, {
      _FRE_referred: observable,
      _FRE_pathname: observable,
      referred: computed
    });
  }
  set name(value) {
    this._FRE_pathname = [value];
    this._FRE_referred = null;
  }
  get name() {
    return this._FRE_pathname[this._FRE_pathname.length - 1];
  }
  set pathname(value) {
    this._FRE_pathname = value;
    this._FRE_referred = null;
  }
  get pathname() {
    const result = [];
    for (const elem of this._FRE_pathname) {
      result.push(elem);
    }
    return result;
  }
  pathnameToString(separator) {
    let result = "";
    for (let index = 0; index < this._FRE_pathname.length; index++) {
      const str = this._FRE_pathname[index];
      if (index === this._FRE_pathname.length - 1) {
        result += str;
      } else {
        result += str + separator;
      }
    }
    return result;
  }
  get referred() {
    LOGGER$8.log("FreElementReference " + this._FRE_pathname + " property " + this.freOwnerDescriptor().propertyName + " owner " + this.freOwnerDescriptor().owner.freLanguageConcept());
    if (!!this._FRE_referred) {
      return this._FRE_referred;
    } else {
      return FreLanguageEnvironment.getInstance().scoper.resolvePathName(this.freOwnerDescriptor().owner, this.freOwnerDescriptor().propertyName, this._FRE_pathname, this.typeName);
    }
  }
  set referred(referredElement) {
    if (!!referredElement) {
      this._FRE_pathname.push(referredElement.name);
    }
    this._FRE_referred = referredElement;
  }
  match(toBeMatched) {
    return toBeMatched.name === this.name;
  }
}
new FreLogger("CollectNamesWorker").mute();
new FreLogger("FreonNamespace").mute();
new FreLogger("FreScoperComposite").mute();
class FreModelSerializer {
  constructor() {
    this.language = FreLanguage.getInstance();
  }
  toTypeScriptInstance(jsonObject) {
    return this.toTypeScriptInstanceInternal(jsonObject);
  }
  toTypeScriptInstanceInternal(jsonObject) {
    if (jsonObject === null) {
      throw new Error("Cannot read json: jsonObject is null.");
    }
    const type = jsonObject["$typename"];
    if (isNullOrUndefined(type)) {
      throw new Error(`Cannot read json: not a Freon structure, typename missing: ${JSON.stringify(jsonObject)}.`);
    }
    const result = this.language.createConceptOrUnit(type);
    if (isNullOrUndefined(result)) {
      throw new Error(`Cannot read json: ${type} unknown.`);
    }
    for (const property of this.language.allConceptProperties(type)) {
      const value = jsonObject[property.name];
      if (isNullOrUndefined(value)) {
        continue;
      }
      this.convertProperties(result, property, value);
    }
    return result;
  }
  convertProperties(result, property, value) {
    switch (property.propertyKind) {
      case "primitive":
        if (property.isList) {
          result[property.name] = [];
          for (const item in value) {
            result[property.name].push(value[item]);
          }
        } else {
          if (property.type === "string" || property.type === "identifier") {
            this.checkValueToType(value, "string", property);
          } else if (property.type === "number") {
            this.checkValueToType(value, "number", property);
          } else if (property.type === "boolean") {
            this.checkValueToType(value, "boolean", property);
          }
          result[property.name] = value;
        }
        break;
      case "part":
        if (property.isList) {
          for (const item in value) {
            if (!isNullOrUndefined(value[item])) {
              result[property.name].push(this.toTypeScriptInstance(value[item]));
            }
          }
        } else {
          if (!isNullOrUndefined(value)) {
            result[property.name] = this.toTypeScriptInstance(value);
          }
        }
        break;
      case "reference":
        if (property.isList) {
          for (const item in value) {
            if (!isNullOrUndefined(value[item])) {
              result[property.name].push(this.language.referenceCreator(value[item], property.type));
            }
          }
        } else {
          if (!isNullOrUndefined(value)) {
            result[property.name] = this.language.referenceCreator(value, property.type);
          }
        }
        break;
    }
  }
  checkValueToType(value, shouldBeType, property) {
    if (typeof value !== shouldBeType) {
      throw new Error(`Value of property '${property.name}' is not of type '${shouldBeType}'.`);
    }
  }
  convertToJSON(tsObject, publicOnly) {
    var _a;
    const typename = tsObject.freLanguageConcept();
    let result;
    if (publicOnly !== void 0 && publicOnly) {
      if (((_a = this.language.concept(typename)) === null || _a === void 0 ? void 0 : _a.isPublic) || !!this.language.unit(typename)) {
        result = this.convertToJSONinternal(tsObject, true, typename);
      }
    } else {
      result = this.convertToJSONinternal(tsObject, false, typename);
    }
    return result;
  }
  convertToJSONinternal(tsObject, publicOnly, typename) {
    const result = { $typename: typename };
    for (const p of this.language.allConceptProperties(typename)) {
      if (publicOnly) {
        if (p.isPublic) {
          this.convertPropertyToJSON(p, tsObject, publicOnly, result);
        }
      } else {
        this.convertPropertyToJSON(p, tsObject, publicOnly, result);
      }
    }
    return result;
  }
  convertPropertyToJSON(p, tsObject, publicOnly, result) {
    switch (p.propertyKind) {
      case "part":
        const value = tsObject[p.name];
        if (p.isList) {
          const parts = tsObject[p.name];
          result[p.name] = [];
          for (let i = 0; i < parts.length; i++) {
            result[p.name][i] = this.convertToJSON(parts[i], publicOnly);
          }
        } else {
          result[p.name] = !!value ? this.convertToJSON(value, publicOnly) : null;
        }
        break;
      case "reference":
        if (p.isList) {
          const references = tsObject[p.name];
          result[p.name] = [];
          for (let i = 0; i < references.length; i++) {
            result[p.name][i] = references[i]["name"];
          }
        } else {
          const value1 = tsObject[p.name];
          result[p.name] = !!value1 ? tsObject[p.name]["name"] : null;
        }
        break;
      case "primitive":
        const value2 = tsObject[p.name];
        result[p.name] = value2;
        break;
    }
  }
}
function isLionWebJsonChunk(object2) {
  const cnk = object2;
  return cnk.serializationFormatVersion !== void 0 && cnk.languages !== void 0 && cnk.nodes !== void 0;
}
function createLionWebJsonNode() {
  return {
    id: null,
    classifier: null,
    properties: [],
    containments: [],
    references: [],
    annotations: [],
    parent: null
  };
}
const LOGGER$3 = new FreLogger("FreLionwebSerializer");
class FreLionwebSerializer {
  constructor() {
    this.nodesfromJson = /* @__PURE__ */ new Map();
    this.language = FreLanguage.getInstance();
  }
  toTypeScriptInstance(jsonObject) {
    LOGGER$3.log("toTypeScriptInstance");
    this.nodesfromJson.clear();
    FreLanguage.getInstance().stdLib.elements.forEach((elem) => this.nodesfromJson.set(elem.freId(), { freNode: elem, children: [], references: [] }));
    LOGGER$3.log("Starting ...");
    if (!isLionWebJsonChunk(jsonObject)) {
      LOGGER$3.log(`Cannot read json: jsonObject is not a LionWeb chunk:`);
    }
    const chunk = jsonObject;
    const serVersion = chunk.serializationFormatVersion;
    LOGGER$3.log("SerializationFormatVersion: " + serVersion);
    const nodes = chunk.nodes;
    for (const object2 of nodes) {
      const parsedNode = this.toTypeScriptInstanceInternal(object2);
      if (parsedNode !== null) {
        this.nodesfromJson.set(parsedNode.freNode.freId(), parsedNode);
      }
    }
    this.resolveChildrenAndReferences();
    return this.findRoot();
  }
  findRoot() {
    const mapEntries = this.nodesfromJson.values();
    for (const parsedNode of mapEntries) {
      if (parsedNode.freNode.freIsUnit()) {
        return parsedNode.freNode;
      }
    }
    return null;
  }
  resolveChildrenAndReferences() {
    const mapEntries = this.nodesfromJson.values();
    for (const parsedNode of mapEntries) {
      for (const child of parsedNode.children) {
        const resolvedChild = this.nodesfromJson.get(child.referredId);
        if (isNullOrUndefined(resolvedChild)) {
          LOGGER$3.error("Child cannot be resolved: " + child.referredId);
          continue;
        }
        if (child.isList) {
          parsedNode.freNode[child.featureName].push(resolvedChild.freNode);
        } else {
          parsedNode.freNode[child.featureName] = resolvedChild.freNode;
        }
      }
      for (const reference of parsedNode.references) {
        const freonRef = FreNodeReference.create(reference.resolveInfo, reference.typeName);
        if (reference.isList) {
          parsedNode.freNode[reference.featureName].push(freonRef);
        } else {
          parsedNode.freNode[reference.featureName] = freonRef;
        }
      }
    }
  }
  toTypeScriptInstanceInternal(node) {
    if (node === null) {
      throw new Error("Cannot read json 1: jsonObject is null.");
    }
    const jsonMetaPointer = node.classifier;
    const id = node.id;
    if (isNullOrUndefined(jsonMetaPointer)) {
      throw new Error(`Cannot read json 2: not a Freon structure, classifier name missing: ${JSON.stringify(node)}.`);
    }
    const conceptMetaPointer = this.convertMetaPointer(jsonMetaPointer, node);
    const classifier = this.language.classifierByKey(conceptMetaPointer.key);
    if (isNullOrUndefined(classifier)) {
      LOGGER$3.log(`1 Cannot read json 3: ${conceptMetaPointer.key} unknown.`);
      return null;
    }
    const tsObject = this.language.createConceptOrUnit(classifier.typeName, id);
    if (isNullOrUndefined(tsObject)) {
      LOGGER$3.log(`2 Cannot read json 4: ${conceptMetaPointer.key} unknown.`);
      return null;
    }
    FreUtils.nodeIdProvider.usedId(tsObject.freId());
    this.convertPrimitiveProperties(tsObject, conceptMetaPointer.key, node);
    const parsedChildren = this.convertChildProperties(conceptMetaPointer.key, node);
    const parsedReferences = this.convertReferenceProperties(conceptMetaPointer.key, node);
    return { freNode: tsObject, children: parsedChildren, references: parsedReferences };
  }
  convertPrimitiveProperties(freNode, concept, jsonObject) {
    const jsonProperties = jsonObject.properties;
    FreUtils.CHECK(Array.isArray(jsonProperties), "Found properties value which is not a Array for node: " + jsonObject.id);
    for (const jsonProperty of Object.values(jsonProperties)) {
      const jsonMetaPointer = jsonProperty.property;
      const propertyMetaPointer = this.convertMetaPointer(jsonMetaPointer, jsonObject);
      const property = this.language.classifierPropertyByKey(concept, propertyMetaPointer.key);
      if (property === void 0 || property === null) {
        LOGGER$3.error("NULL PROPERTY for key " + propertyMetaPointer.key);
      }
      if (isNullOrUndefined(property)) {
        if (propertyMetaPointer.key !== "qualifiedName")
          LOGGER$3.log("Unknown property: " + propertyMetaPointer.key + " for concept " + concept);
        continue;
      }
      FreUtils.CHECK(!property.isList, "Lionweb does not support list properties: " + property.name);
      FreUtils.CHECK(property.propertyKind === "primitive", "Primitive value found for non primitive property: " + property.name);
      const value = jsonProperty.value;
      if (isNullOrUndefined(value)) {
        throw new Error(`Cannot read json 5: ${JSON.stringify(property, null, 2)} value unset.`);
      }
      if (property.type === "string" || property.type === "identifier") {
        freNode[property.name] = value;
      } else if (property.type === "number") {
        freNode[property.name] = Number.parseInt(value);
      } else if (property.type === "boolean") {
        freNode[property.name] = value === "true";
      }
    }
  }
  convertMetaPointer(jsonObject, parent) {
    if (isNullOrUndefined(jsonObject)) {
      throw new Error(`Cannot read json 6: not a MetaPointer: ${JSON.stringify(parent)}.`);
    }
    const language = jsonObject.language;
    if (isNullOrUndefined(language)) {
      throw new Error(`MetaPointer misses metamodel: ${JSON.stringify(jsonObject)}`);
    }
    const version = jsonObject.version;
    if (isNullOrUndefined(version)) {
      throw new Error(`MetaPointer misses version: ${JSON.stringify(jsonObject)}`);
    }
    const key = jsonObject.key;
    if (isNullOrUndefined(version)) {
      throw new Error(`MetaPointer misses key: ${JSON.stringify(jsonObject)}`);
    }
    return {
      language,
      version,
      key
    };
  }
  convertChildProperties(concept, jsonObject) {
    const jsonChildren = jsonObject.containments;
    FreUtils.CHECK(Array.isArray(jsonChildren), "Found children value which is not a Array for node: " + jsonObject.id);
    const parsedChildren = [];
    for (const jsonChild of Object.values(jsonChildren)) {
      const jsonMetaPointer = jsonChild.containment;
      const propertyMetaPointer = this.convertMetaPointer(jsonMetaPointer, jsonObject);
      const property = this.language.classifierPropertyByKey(concept, propertyMetaPointer.key);
      if (isNullOrUndefined(property)) {
        LOGGER$3.log("Unknown child property: " + propertyMetaPointer.key + " for concept " + concept);
        continue;
      }
      FreUtils.CHECK(property.propertyKind === "part", "Part value found for non part property: " + property.name);
      const jsonValue = jsonChild.children;
      FreUtils.CHECK(Array.isArray(jsonValue), "Found child value which is not a Array for property: " + property.name);
      for (const item of jsonValue) {
        if (!isNullOrUndefined(item)) {
          parsedChildren.push({ featureName: property.name, isList: property.isList, referredId: item });
        }
      }
    }
    return parsedChildren;
  }
  convertReferenceProperties(concept, jsonObject) {
    const jsonReferences = jsonObject.references;
    FreUtils.CHECK(Array.isArray(jsonReferences), "Found references value which is not a Array for node: " + jsonObject.id);
    const parsedReferences = [];
    for (const jsonReference of Object.values(jsonReferences)) {
      const jsonMetaPointer = jsonReference.reference;
      const propertyMetaPointer = this.convertMetaPointer(jsonMetaPointer, jsonObject);
      const property = this.language.classifierPropertyByKey(concept, propertyMetaPointer.key);
      if (isNullOrUndefined(property)) {
        LOGGER$3.error("Unknown reference property: " + propertyMetaPointer.key + " for concept " + concept);
        continue;
      }
      FreUtils.CHECK(property.propertyKind === "reference", "Reference value found for non reference property: " + property.name);
      const jsonValue = jsonReference.targets;
      FreUtils.CHECK(Array.isArray(jsonValue), "Found targets value which is not a Array for property: " + property.name);
      for (const item of jsonValue) {
        if (!isNullOrUndefined(item)) {
          if (typeof item === "object") {
            parsedReferences.push({
              featureName: property.name,
              isList: property.isList,
              typeName: property.type,
              referredId: item.reference,
              resolveInfo: item.resolveInfo
            });
          } else if (typeof item === "string") {
            parsedReferences.push({
              featureName: property.name,
              isList: property.isList,
              typeName: property.type,
              referredId: item,
              resolveInfo: ""
            });
          } else {
            LOGGER$3.log("Incorrect reference format: " + JSON.stringify(item));
          }
        }
      }
    }
    return parsedReferences;
  }
  convertToJSON(freNode, publicOnly) {
    var _a;
    const typename = freNode.freLanguageConcept();
    LOGGER$3.log("start converting concept name " + typename + ", publicOnly: " + publicOnly);
    const idMap = /* @__PURE__ */ new Map();
    if (publicOnly !== void 0 && publicOnly) {
      if (((_a = this.language.concept(typename)) === null || _a === void 0 ? void 0 : _a.isPublic) || !!this.language.unit(typename)) {
        this.convertToJSONinternal(freNode, true, idMap);
      }
    } else {
      this.convertToJSONinternal(freNode, false, idMap);
    }
    LOGGER$3.log("end converting concept name " + JSON.stringify(Object.values(idMap)));
    return Object.values(idMap);
  }
  convertToJSONinternal(freNode, publicOnly, idMap) {
    var _a;
    let result = idMap.get(freNode.freId());
    if (result !== void 0) {
      LOGGER$3.error("already found: " + freNode.freId());
      return result;
    }
    const typename = freNode.freLanguageConcept();
    result = createLionWebJsonNode();
    idMap[freNode.freId()] = result;
    result.id = freNode.freId();
    result.parent = (_a = freNode === null || freNode === void 0 ? void 0 : freNode.freOwner()) === null || _a === void 0 ? void 0 : _a.freId();
    if (result.parent === void 0 || freNode.freIsUnit()) {
      result.parent = null;
    }
    let conceptKey;
    let language;
    const concept = this.language.concept(typename);
    if (concept !== void 0) {
      conceptKey = concept.key;
      language = concept.language;
    } else {
      const unit = this.language.unit(typename);
      conceptKey = unit === null || unit === void 0 ? void 0 : unit.key;
      language = unit === null || unit === void 0 ? void 0 : unit.language;
    }
    if (conceptKey === void 0) {
      LOGGER$3.error(`Unknown concept key: ${typename}`);
      return void 0;
    }
    result.classifier = this.createMetaPointer(conceptKey, language);
    for (const p of this.language.allConceptProperties(typename)) {
      if (publicOnly) {
        if (p.isPublic) {
          this.convertPropertyToJSON(p, freNode, publicOnly, result, idMap);
        }
      } else {
        this.convertPropertyToJSON(p, freNode, publicOnly, result, idMap);
      }
    }
    return result;
  }
  createMetaPointer(key, language) {
    return {
      language,
      version: "2023.1",
      key
    };
  }
  convertPropertyToJSON(p, parentNode, publicOnly, result, idMap) {
    var _a, _b, _c;
    if (p.id === void 0) {
      LOGGER$3.log(`no id defined for property ${p.name}`);
      return;
    }
    switch (p.propertyKind) {
      case "part":
        const value = parentNode[p.name];
        if (value === null || value === void 0) {
          LOGGER$3.log("PART is null: " + +parentNode["name"] + "." + p.name);
          break;
        }
        const child = {
          containment: this.createMetaPointer(p.key, p.language),
          children: []
        };
        if (p.isList) {
          const parts = parentNode[p.name];
          for (const part of parts) {
            child.children.push(this.convertToJSONinternal(part, publicOnly, idMap).id);
          }
        } else {
          child.children.push((!!value ? this.convertToJSONinternal(value, publicOnly, idMap) : null).id);
        }
        result.containments.push(child);
        break;
      case "reference":
        const lwReference = {
          reference: this.createMetaPointer(p.key, p.language),
          targets: []
        };
        if (p.isList) {
          const references = parentNode[p.name];
          LOGGER$3.log("References for " + p.name + ": " + references);
          for (const ref of references) {
            if (ref === null || ref === void 0) {
              LOGGER$3.log("REF NULL for " + p.name);
              break;
            }
            const referredId = (_a = ref === null || ref === void 0 ? void 0 : ref.referred) === null || _a === void 0 ? void 0 : _a.freId();
            if (!!ref.name || !!referredId) {
              lwReference.targets.push({
                resolveInfo: ref.name,
                reference: referredId
              });
            }
          }
        } else {
          const ref = parentNode[p.name];
          if (ref === null || ref === void 0) {
            LOGGER$3.log("REF NULL for " + p.name + " parant " + parentNode["name"]);
            break;
          }
          const referredId = (_b = ref === null || ref === void 0 ? void 0 : ref.referred) === null || _b === void 0 ? void 0 : _b.freId();
          if (!!ref.name || !!referredId) {
            lwReference.targets.push({
              resolveInfo: !!ref ? ref["name"] : null,
              reference: (_c = ref === null || ref === void 0 ? void 0 : ref.referred) === null || _c === void 0 ? void 0 : _c.freId()
            });
          }
        }
        result.references.push(lwReference);
        break;
      case "primitive":
        const value2 = parentNode[p.name];
        result.properties.push({
          property: this.createMetaPointer(p.key, p.language),
          value: propertyValueToString(value2)
        });
        break;
    }
  }
}
function propertyValueToString(value) {
  switch (typeof value) {
    case "string":
      return value;
    case "boolean":
      return value === true ? "true" : "false";
    case "number":
      return "" + value;
    default:
      return value;
  }
}
var global$1 = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};
var performance = global$1.performance || {};
performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function() {
  return (/* @__PURE__ */ new Date()).getTime();
};
new FreModelSerializer();
new FreLionwebSerializer();
var HttpInfoCodes;
(function(HttpInfoCodes2) {
  HttpInfoCodes2[HttpInfoCodes2["Continue"] = 100] = "Continue";
  HttpInfoCodes2[HttpInfoCodes2["SwitchingProtocols"] = 101] = "SwitchingProtocols";
  HttpInfoCodes2[HttpInfoCodes2["Processing"] = 102] = "Processing";
})(HttpInfoCodes || (HttpInfoCodes = {}));
var HttpSuccessCodes;
(function(HttpSuccessCodes2) {
  HttpSuccessCodes2[HttpSuccessCodes2["Ok"] = 200] = "Ok";
  HttpSuccessCodes2[HttpSuccessCodes2["Created"] = 201] = "Created";
  HttpSuccessCodes2[HttpSuccessCodes2["Accepted"] = 202] = "Accepted";
  HttpSuccessCodes2[HttpSuccessCodes2["NonAuthoritativeInformation"] = 203] = "NonAuthoritativeInformation";
  HttpSuccessCodes2[HttpSuccessCodes2["NoContent"] = 204] = "NoContent";
  HttpSuccessCodes2[HttpSuccessCodes2["ResetContent"] = 205] = "ResetContent";
  HttpSuccessCodes2[HttpSuccessCodes2["PartialContent"] = 206] = "PartialContent";
  HttpSuccessCodes2[HttpSuccessCodes2["MultiStatus"] = 207] = "MultiStatus";
  HttpSuccessCodes2[HttpSuccessCodes2["AlreadyReported"] = 208] = "AlreadyReported";
  HttpSuccessCodes2[HttpSuccessCodes2["ImUsed"] = 226] = "ImUsed";
})(HttpSuccessCodes || (HttpSuccessCodes = {}));
var HttpRedirectionCodes;
(function(HttpRedirectionCodes2) {
  HttpRedirectionCodes2[HttpRedirectionCodes2["MultipleChoices"] = 300] = "MultipleChoices";
  HttpRedirectionCodes2[HttpRedirectionCodes2["MovedPermanently"] = 301] = "MovedPermanently";
  HttpRedirectionCodes2[HttpRedirectionCodes2["Found"] = 302] = "Found";
  HttpRedirectionCodes2[HttpRedirectionCodes2["SeeOther"] = 303] = "SeeOther";
  HttpRedirectionCodes2[HttpRedirectionCodes2["NotModified"] = 304] = "NotModified";
  HttpRedirectionCodes2[HttpRedirectionCodes2["UseProxy"] = 305] = "UseProxy";
  HttpRedirectionCodes2[HttpRedirectionCodes2["SwitchProxy"] = 306] = "SwitchProxy";
  HttpRedirectionCodes2[HttpRedirectionCodes2["TemporaryRedirect"] = 307] = "TemporaryRedirect";
  HttpRedirectionCodes2[HttpRedirectionCodes2["PermanentRedirect"] = 308] = "PermanentRedirect";
})(HttpRedirectionCodes || (HttpRedirectionCodes = {}));
var HttpClientErrors;
(function(HttpClientErrors2) {
  HttpClientErrors2[HttpClientErrors2["BadRequest"] = 400] = "BadRequest";
  HttpClientErrors2[HttpClientErrors2["Unauthorized"] = 401] = "Unauthorized";
  HttpClientErrors2[HttpClientErrors2["PaymentRequired"] = 402] = "PaymentRequired";
  HttpClientErrors2[HttpClientErrors2["Forbidden"] = 403] = "Forbidden";
  HttpClientErrors2[HttpClientErrors2["NotFound"] = 404] = "NotFound";
  HttpClientErrors2[HttpClientErrors2["MethodNotAllowed"] = 405] = "MethodNotAllowed";
  HttpClientErrors2[HttpClientErrors2["NotAcceptable"] = 406] = "NotAcceptable";
  HttpClientErrors2[HttpClientErrors2["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
  HttpClientErrors2[HttpClientErrors2["RequestTimeout"] = 408] = "RequestTimeout";
  HttpClientErrors2[HttpClientErrors2["Conflict"] = 409] = "Conflict";
  HttpClientErrors2[HttpClientErrors2["Gone"] = 410] = "Gone";
  HttpClientErrors2[HttpClientErrors2["LengthRequired"] = 411] = "LengthRequired";
  HttpClientErrors2[HttpClientErrors2["PreconditionFailed"] = 412] = "PreconditionFailed";
  HttpClientErrors2[HttpClientErrors2["PayloadTooLarge"] = 413] = "PayloadTooLarge";
  HttpClientErrors2[HttpClientErrors2["UriTooLong"] = 414] = "UriTooLong";
  HttpClientErrors2[HttpClientErrors2["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
  HttpClientErrors2[HttpClientErrors2["RangeNotSatisfiable"] = 416] = "RangeNotSatisfiable";
  HttpClientErrors2[HttpClientErrors2["ExpectationFailed"] = 417] = "ExpectationFailed";
  HttpClientErrors2[HttpClientErrors2["IAmATeapot"] = 418] = "IAmATeapot";
  HttpClientErrors2[HttpClientErrors2["MisdirectedRequest"] = 421] = "MisdirectedRequest";
  HttpClientErrors2[HttpClientErrors2["UnprocessableEntity"] = 422] = "UnprocessableEntity";
  HttpClientErrors2[HttpClientErrors2["Locked"] = 423] = "Locked";
  HttpClientErrors2[HttpClientErrors2["FailedDependency"] = 424] = "FailedDependency";
  HttpClientErrors2[HttpClientErrors2["UpgradeRequired"] = 426] = "UpgradeRequired";
  HttpClientErrors2[HttpClientErrors2["PreconditionRequired"] = 428] = "PreconditionRequired";
  HttpClientErrors2[HttpClientErrors2["TooManyRequests"] = 429] = "TooManyRequests";
  HttpClientErrors2[HttpClientErrors2["RequestHeaderFieldsTooLarge"] = 431] = "RequestHeaderFieldsTooLarge";
  HttpClientErrors2[HttpClientErrors2["UnavailableForLegalReasons"] = 451] = "UnavailableForLegalReasons";
})(HttpClientErrors || (HttpClientErrors = {}));
var HttpServerErrors;
(function(HttpServerErrors2) {
  HttpServerErrors2[HttpServerErrors2["InternalServerError"] = 500] = "InternalServerError";
  HttpServerErrors2[HttpServerErrors2["NotImplemented"] = 501] = "NotImplemented";
  HttpServerErrors2[HttpServerErrors2["BadGateway"] = 502] = "BadGateway";
  HttpServerErrors2[HttpServerErrors2["ServiceUnavailable"] = 503] = "ServiceUnavailable";
  HttpServerErrors2[HttpServerErrors2["GatewayTimeout"] = 504] = "GatewayTimeout";
  HttpServerErrors2[HttpServerErrors2["HttpVersionNotSupported"] = 505] = "HttpVersionNotSupported";
  HttpServerErrors2[HttpServerErrors2["VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
  HttpServerErrors2[HttpServerErrors2["InsufficientStorage"] = 507] = "InsufficientStorage";
  HttpServerErrors2[HttpServerErrors2["LoopDetected"] = 508] = "LoopDetected";
  HttpServerErrors2[HttpServerErrors2["NotExtended"] = 510] = "NotExtended";
  HttpServerErrors2[HttpServerErrors2["NetworkAuthenticationRequired"] = 511] = "NetworkAuthenticationRequired";
})(HttpServerErrors || (HttpServerErrors = {}));
class NamedNode {
  static getInstance() {
    if (this.environment === void 0 || this.environment === null) {
      this.environment = new NamedNode();
    }
    return this.environment;
  }
  constructor() {
    this.name = "ANY";
  }
  freOwner() {
    return void 0;
  }
  freOwnerDescriptor() {
    return void 0;
  }
  freId() {
    return "";
  }
  freIsBinaryExpression() {
    return false;
  }
  freIsExpression() {
    return false;
  }
  freIsModel() {
    return false;
  }
  freIsUnit() {
    return false;
  }
  freLanguageConcept() {
    return "NamedElement";
  }
  copy() {
    return this;
  }
  match(toBeMatched) {
    return toBeMatched.name === this.name;
  }
}
class AstType {
  constructor() {
    this.$typename = "AstType";
  }
  static create(data) {
    const result = new AstType();
    if (data.astElement) {
      result.astElement = data.astElement;
    }
    return result;
  }
  toFreString(writer) {
    if (!!this.astElement) {
      if (this.astElement === AstType.ANY) {
        return "ANY";
      } else {
        return writer.writeToString(this.astElement);
      }
    }
    return "AstType[ unknown ]";
  }
  toAstElement() {
    return this.astElement;
  }
  copy() {
    const result = new AstType();
    if (this.astElement) {
      result.astElement = this.astElement;
    }
    return result;
  }
}
AstType.ANY = NamedNode.getInstance();
AstType.ANY_TYPE = AstType.create({ astElement: AstType.ANY });
class RtObject {
  constructor() {
    this._type = "RtObject";
  }
  get rtType() {
    return this._type;
  }
}
class RtBoolean extends RtObject {
  static of(bool) {
    return bool ? RtBoolean.TRUE : RtBoolean.FALSE;
  }
  constructor(value) {
    super();
    this._type = "RtBoolean";
    this._value = value;
  }
  asBoolean() {
    return this._value;
  }
  and(other) {
    return RtBoolean.of(this._value && other.asBoolean());
  }
  or(other) {
    return RtBoolean.of(this._value || other.asBoolean());
  }
  not() {
    return RtBoolean.of(!this._value);
  }
  equals(other) {
    if (isRtBoolean(other)) {
      return RtBoolean.of(this._value === other.asBoolean());
    } else {
      return RtBoolean.FALSE;
    }
  }
  toString() {
    return "" + this._value;
  }
}
RtBoolean.TRUE = new RtBoolean(true);
RtBoolean.FALSE = new RtBoolean(false);
function isRtBoolean(object2) {
  const _type = object2 === null || object2 === void 0 ? void 0 : object2._type;
  return !!_type && _type === "RtBoolean";
}
class RtError extends RtObject {
  constructor(message) {
    super();
    this._type = "RtError";
    this._message = "Error";
    this._message = message;
  }
  get message() {
    return this._message;
  }
  equals(other) {
    return RtBoolean.FALSE;
  }
  toString() {
    return "Error: " + this._message;
  }
}
function isRtError(obj) {
  const _type = obj === null || obj === void 0 ? void 0 : obj._type;
  return !!_type && _type === "RtError";
}
class RtString extends RtObject {
  constructor(value) {
    super();
    this._type = "RtString";
    this.value = value;
  }
  equals(other) {
    if (isRtString(other)) {
      return RtBoolean.of(this.value === other.asString());
    } else {
      return RtBoolean.FALSE;
    }
  }
  asString() {
    return this.value;
  }
  startsWith(other) {
    return RtBoolean.of(this.asString().startsWith(other.asString()));
  }
  endsWith(other) {
    return RtBoolean.of(this.asString().endsWith(other.asString()));
  }
  length() {
    return new RtNumber(this.asString().length);
  }
}
RtString.EMPTY_STRING = new RtString("");
function isRtString(object2) {
  const _type = object2 === null || object2 === void 0 ? void 0 : object2._type;
  return !!_type && _type === "RtString";
}
class RtEmpty extends RtObject {
  constructor() {
    super(...arguments);
    this._type = "RtEmpty";
  }
  toString() {
    return "RtNix";
  }
  equals(other) {
    if (isRtBoolean(other)) {
      if (!other.asBoolean()) {
        return RtBoolean.TRUE;
      }
    } else if (isRtEmpty(other)) {
      return RtBoolean.TRUE;
    }
    return RtBoolean.FALSE;
  }
}
RtEmpty.NIX_VALUE = new RtEmpty();
function isRtEmpty(object2) {
  return object2 !== void 0 && object2 !== null && object2["_type"] === "RtEmpty";
}
class RtNumber extends RtObject {
  constructor(value) {
    super();
    this._type = "RtNumber";
    this._value = value;
  }
  get value() {
    return this._value;
  }
  plus(other) {
    if (isRtNumber(other)) {
      return new RtNumber(this._value + other.value);
    }
    if (isRtString(other)) {
      return new RtNumber(this._value + Number.parseFloat(other.asString()));
    } else if (isRtEmpty(other)) {
      return this;
    } else if (isRtError(other)) {
      return other;
    }
    return new RtError("RtNumber.divide: no divide found for " + other.rtType);
  }
  multiply(other) {
    if (isRtNumber(other)) {
      return new RtNumber(this._value * other.value);
    } else if (isRtString(other)) {
      return new RtNumber(this._value * Number.parseFloat(other.asString()));
    } else if (isRtEmpty(other)) {
      return this;
    } else if (isRtError(other)) {
      return other;
    }
    return new RtError("RtNumber.divide: no divide found for " + this + " * " + other.rtType);
  }
  minus(other) {
    if (isRtNumber(other)) {
      return new RtNumber(this._value - other.value);
    }
    if (isRtString(other)) {
      return new RtNumber(this._value - Number.parseFloat(other.asString()));
    } else if (isRtEmpty(other)) {
      return other;
    } else if (isRtError(other)) {
      return other;
    }
    return new RtError("No minus found for " + other.rtType);
  }
  divide(other) {
    if (isRtNumber(other)) {
      return new RtNumber(this._value / other.value);
    } else if (isRtString(other)) {
      return new RtNumber(this._value / Number.parseFloat(other.asString()));
    } else if (isRtEmpty(other)) {
      return other;
    } else if (isRtError(other)) {
      return other;
    }
    return new RtError("RtNumber.divide: no divide found for " + other.rtType);
  }
  equals(other) {
    if (isRtNumber(other)) {
      return RtBoolean.of(this.value === other.value);
    } else {
      return RtBoolean.FALSE;
    }
  }
  toString() {
    return "" + this._value;
  }
}
function isRtNumber(obj) {
  return obj instanceof RtNumber;
}
function componentId(box2) {
  return `${box2?.element?.freId()}-${box2?.role}`;
}
const css = {
  code: '.label.svelte-ip1ros:empty:before{content:attr(data-placeholdertext);margin:var(--freon-label-component-margin, 1px);padding:var(--freon-label-component-padding, 1px);background-color:var(--freon-label-component-background-color, inherit)}.label.svelte-ip1ros{color:var(--freon-label-component-color, inherit);background-color:var(--freon-label-component-background-color, inherit);font-style:var(--freon-label-component-font-style, inherit);font-weight:var(--freon-label-component-font-weight, normal);font-size:var(--freon-label-component-font-size, inherit);font-family:var(--freon-label-component-font-family, "inherit");padding:var(--freon-label-component-padding, 1px);margin:var(--freon-label-component-margin, 1px);white-space:normal;display:inline-block}',
  map: '{"version":3,"file":"LabelComponent.svelte","sources":["LabelComponent.svelte"],"sourcesContent":["<svelte:options immutable={true}/>\\n<script lang=\\"ts\\">import { onMount, afterUpdate } from \\"svelte\\";\\nimport { FreLogger, LabelBox } from \\"@freon4dsl/core\\";\\nimport { componentId } from \\"./svelte-utils/index.js\\";\\nexport let box;\\nconst LOGGER = new FreLogger(\\"LabelComponent\\");\\nlet id = !!box ? componentId(box) : \\"label-for-unknown-box\\";\\nlet element = null;\\nlet style;\\nlet cssClass;\\nlet text;\\nonMount(() => {\\n  if (!!box) {\\n    box.refreshComponent = refresh;\\n  }\\n});\\nafterUpdate(() => {\\n  if (!!box) {\\n    box.refreshComponent = refresh;\\n  }\\n});\\nconst refresh = (why) => {\\n  LOGGER.log(\\"REFRESH LabelComponent (\\" + why + \\")\\");\\n  if (!!box) {\\n    text = box.getLabel();\\n    style = box.cssStyle;\\n    cssClass = box.cssClass;\\n  }\\n};\\n$: {\\n  refresh(\\"FROM component \\" + box?.id);\\n}\\n<\/script>\\n\\n<span class=\\"label {text} {cssClass}\\"\\n      style=\\"{style}\\"\\n      bind:this={element}\\n      id=\\"{id}\\"\\n>\\n    {text}\\n</span>\\n\\n<style>\\n    .label:empty:before {\\n        content: attr(data-placeholdertext);\\n        margin: var(--freon-label-component-margin, 1px);\\n        padding: var(--freon-label-component-padding, 1px);\\n        background-color: var(--freon-label-component-background-color, inherit);\\n    }\\n\\n    .label {\\n        color: var(--freon-label-component-color, inherit);\\n        background-color: var(--freon-label-component-background-color, inherit);\\n        font-style: var(--freon-label-component-font-style, inherit);\\n        font-weight: var(--freon-label-component-font-weight, normal);\\n        font-size: var(--freon-label-component-font-size, inherit);\\n        font-family: var(--freon-label-component-font-family, \\"inherit\\");\\n        padding: var(--freon-label-component-padding, 1px);\\n        margin: var(--freon-label-component-margin, 1px);\\n        white-space: normal;\\n        display: inline-block;\\n    }\\n</style>\\n"],"names":[],"mappings":"AA2CI,oBAAM,MAAM,OAAQ,CAChB,OAAO,CAAE,KAAK,oBAAoB,CAAC,CACnC,MAAM,CAAE,IAAI,8BAA8B,CAAC,IAAI,CAAC,CAChD,OAAO,CAAE,IAAI,+BAA+B,CAAC,IAAI,CAAC,CAClD,gBAAgB,CAAE,IAAI,wCAAwC,CAAC,QAAQ,CAC3E,CAEA,oBAAO,CACH,KAAK,CAAE,IAAI,6BAA6B,CAAC,QAAQ,CAAC,CAClD,gBAAgB,CAAE,IAAI,wCAAwC,CAAC,QAAQ,CAAC,CACxE,UAAU,CAAE,IAAI,kCAAkC,CAAC,QAAQ,CAAC,CAC5D,WAAW,CAAE,IAAI,mCAAmC,CAAC,OAAO,CAAC,CAC7D,SAAS,CAAE,IAAI,iCAAiC,CAAC,QAAQ,CAAC,CAC1D,WAAW,CAAE,IAAI,mCAAmC,CAAC,UAAU,CAAC,CAChE,OAAO,CAAE,IAAI,+BAA+B,CAAC,IAAI,CAAC,CAClD,MAAM,CAAE,IAAI,8BAA8B,CAAC,IAAI,CAAC,CAChD,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,YACb"}'
};
const LabelComponent = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { box: box2 } = $$props;
  const LOGGER = new FreLogger("LabelComponent");
  let id = !!box2 ? componentId(box2) : "label-for-unknown-box";
  let element = null;
  let style;
  let cssClass;
  let text;
  const refresh = (why) => {
    LOGGER.log("REFRESH LabelComponent (" + why + ")");
    if (!!box2) {
      text = box2.getLabel();
      style = box2.cssStyle;
      cssClass = box2.cssClass;
    }
  };
  if ($$props.box === void 0 && $$bindings.box && box2 !== void 0) $$bindings.box(box2);
  $$result.css.add(css);
  {
    {
      refresh("FROM component " + box2?.id);
    }
  }
  return `  <span class="${"label " + escape(text, true) + " " + escape(cssClass, true) + " svelte-ip1ros"}"${add_attribute("style", style, 0)}${add_attribute("id", id, 0)}${add_attribute("this", element, 0)}>${escape(text)} </span>`;
});
class ShowCasePart extends FreNodeBaseImpl {
  /**
   * A convenience method that creates an instance of this class
   * based on the properties defined in 'data'.
   * @param data
   */
  static create(data) {
    const result = new ShowCasePart();
    if (!!data.name) {
      result.name = data.name;
    }
    if (!!data.parseLocation) {
      result.parseLocation = data.parseLocation;
    }
    return result;
  }
  $typename = "ShowCasePart";
  // holds the metatype in the form of a string
  $id;
  // a unique identifier
  name;
  // implementation of name
  constructor(id) {
    super();
    if (!!id) {
      this.$id = id;
    } else {
      this.$id = FreUtils.ID();
    }
    observableprim(this, "name");
    this.name = "";
  }
  /**
   * Returns the metatype of this instance in the form of a string.
   */
  freLanguageConcept() {
    return this.$typename;
  }
  /**
   * Returns the unique identifier of this instance.
   */
  freId() {
    return this.$id;
  }
  /**
   * Returns true if this instance is a model concept.
   */
  freIsModel() {
    return false;
  }
  /**
   * Returns true if this instance is a model unit.
   */
  freIsUnit() {
    return false;
  }
  /**
   * Returns true if this instance is an expression concept.
   */
  freIsExpression() {
    return false;
  }
  /**
   * Returns true if this instance is a binary expression concept.
   */
  freIsBinaryExpression() {
    return false;
  }
  /**
   * A convenience method that copies this instance into a new object.
   */
  copy() {
    const result = new ShowCasePart();
    if (!!this.name) {
      result.name = this.name;
    }
    return result;
  }
  /**
   * Matches a partial instance of this class to this object
   * based on the properties defined in the partial.
   * @param toBeMatched
   */
  match(toBeMatched) {
    let result = true;
    if (result && toBeMatched.name !== null && toBeMatched.name !== void 0 && toBeMatched.name.length > 0) {
      result = result && this.name === toBeMatched.name;
    }
    return result;
  }
}
class ShowCaseUnit extends FreNodeBaseImpl {
  /**
   * A convenience method that creates an instance of this class
   * based on the properties defined in 'data'.
   * @param data
   */
  static create(data) {
    const result = new ShowCaseUnit();
    if (!!data.prim) {
      result.prim = data.prim;
    }
    if (!!data.numlist) {
      data.numlist.forEach((x) => result.numlist.push(x));
    }
    if (!!data.name) {
      result.name = data.name;
    }
    if (!!data.part) {
      result.part = data.part;
    }
    if (!!data.partlist) {
      data.partlist.forEach((x) => result.partlist.push(x));
    }
    if (!!data.parseLocation) {
      result.parseLocation = data.parseLocation;
    }
    return result;
  }
  fileExtension;
  $typename = "ShowCaseUnit";
  // holds the metatype in the form of a string
  $id;
  // a unique identifier
  prim;
  // implementation of prim
  numlist;
  // implementation of numlist
  name;
  // implementation of name
  part;
  // implementation of part 'part'
  partlist;
  // implementation of part 'partlist'
  constructor(id) {
    super();
    if (!!id) {
      this.$id = id;
    } else {
      this.$id = FreUtils.ID();
    }
    observableprim(this, "prim");
    this.prim = "";
    observableprimlist(this, "numlist");
    observableprim(this, "name");
    this.name = "";
    observablepart(this, "part");
    observablepartlist(this, "partlist");
  }
  /**
   * Returns the metatype of this instance in the form of a string.
   */
  freLanguageConcept() {
    return this.$typename;
  }
  /**
   * Returns the unique identifier of this instance.
   */
  freId() {
    return this.$id;
  }
  /**
   * Returns true if this instance is a model concept.
   */
  freIsModel() {
    return false;
  }
  /**
   * Returns true if this instance is a model unit.
   */
  freIsUnit() {
    return true;
  }
  /**
   * Returns true if this instance is an expression concept.
   */
  freIsExpression() {
    return false;
  }
  /**
   * Returns true if this instance is a binary expression concept.
   */
  freIsBinaryExpression() {
    return false;
  }
  /**
   * A convenience method that copies this instance into a new object.
   */
  copy() {
    const result = new ShowCaseUnit();
    if (!!this.prim) {
      result.prim = this.prim;
    }
    if (!!this.numlist) {
      this.numlist.forEach((x) => result.numlist.push(x));
    }
    if (!!this.name) {
      result.name = this.name;
    }
    if (!!this.part) {
      result.part = this.part.copy();
    }
    if (!!this.partlist) {
      this.partlist.forEach((x) => result.partlist.push(x.copy()));
    }
    return result;
  }
  /**
   * Matches a partial instance of this class to this object
   * based on the properties defined in the partial.
   * @param toBeMatched
   */
  match(toBeMatched) {
    return true;
  }
}
class ShowCaseModel extends FreNodeBaseImpl {
  /**
   * A convenience method that creates an instance of this class
   * based on the properties defined in 'data'.
   * @param data
   */
  static create(data) {
    const result = new ShowCaseModel();
    if (!!data.name) {
      result.name = data.name;
    }
    if (!!data.unit) {
      result.unit = data.unit;
    }
    if (!!data.parseLocation) {
      result.parseLocation = data.parseLocation;
    }
    return result;
  }
  $typename = "ShowCaseModel";
  // holds the metatype in the form of a string
  $id;
  // a unique identifier
  name;
  // implementation of name
  unit;
  // implementation of part 'unit'
  constructor(id) {
    super();
    if (!!id) {
      this.$id = id;
    } else {
      this.$id = FreUtils.ID();
    }
    observablepart(this, "unit");
  }
  /**
   * Returns the metatype of this instance in the form of a string.
   */
  freLanguageConcept() {
    return this.$typename;
  }
  /**
   * Returns the unique identifier of this instance.
   */
  freId() {
    return this.$id;
  }
  /**
   * Returns true if this instance is a model concept.
   */
  freIsModel() {
    return true;
  }
  /**
   * Returns true if this instance is a model unit.
   */
  freIsUnit() {
    return false;
  }
  /**
   * Returns true if this instance is an expression concept.
   */
  freIsExpression() {
    return false;
  }
  /**
   * Returns true if this instance is a binary expression concept.
   */
  freIsBinaryExpression() {
    return false;
  }
  /**
   * A convenience method that copies this instance into a new object.
   */
  copy() {
    const result = new ShowCaseModel();
    if (!!this.name) {
      result.name = this.name;
    }
    if (!!this.unit) {
      result.unit = this.unit.copy();
    }
    return result;
  }
  /**
   * Matches a partial instance of this class to this object
   * based on the properties defined in the partial.
   * @param toBeMatched
   */
  match(toBeMatched) {
    let result = true;
    if (result && toBeMatched.name !== null && toBeMatched.name !== void 0 && toBeMatched.name.length > 0) {
      result = result && this.name === toBeMatched.name;
    }
    if (result && !!toBeMatched.unit) {
      result = result && this.unit.match(toBeMatched.unit);
    }
    return result;
  }
  /**
   * A convenience method that finds a unit of this model based on its name and 'metatype'.
   * @param name
   * @param metatype
   */
  findUnit(name, metatype) {
    let result = null;
    if (this.unit.name === name) {
      result = this.unit;
    }
    if (!!result && !!metatype) {
      if (FreLanguage.getInstance().metaConformsToType(result, metatype)) {
        return result;
      }
    } else {
      return result;
    }
    return null;
  }
  /**
   * Replaces a model unit by a new one. Used for swapping between complete units and unit public interfaces.
   * Returns false if the replacement could not be done, e.g. because 'oldUnit' is not a child of this object.
   * @param oldUnit
   * @param newUnit
   */
  replaceUnit(oldUnit, newUnit) {
    if (oldUnit.freLanguageConcept() !== newUnit.freLanguageConcept()) {
      return false;
    }
    if (oldUnit.freOwnerDescriptor().owner !== this) {
      return false;
    }
    if (oldUnit.freLanguageConcept() === "UndoUnit" && oldUnit.freOwnerDescriptor().propertyName === "unit") {
      this.unit = newUnit;
    } else {
      return false;
    }
    return true;
  }
  /**
   * Adds a model unit. Returns false if anything goes wrong.
   *
   * @param newUnit
   */
  addUnit(newUnit) {
    if (!!newUnit) {
      const myMetatype = newUnit.freLanguageConcept();
      switch (myMetatype) {
        case "UndoUnit": {
          this.unit = newUnit;
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Removes a model unit. Returns false if anything goes wrong.
   *
   * @param oldUnit
   */
  removeUnit(oldUnit) {
    if (!!oldUnit) {
      const myMetatype = oldUnit.freLanguageConcept();
      switch (myMetatype) {
        case "UndoUnit": {
          this.unit = null;
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Returns an empty model unit of type 'unitTypeName' within 'model'.
   *
   * @param typename
   */
  newUnit(typename) {
    switch (typename) {
      case "UndoUnit": {
        const unit = new ShowCaseUnit();
        this.unit = unit;
        return unit;
      }
    }
    return null;
  }
  /**
   * Returns a list of model units.
   */
  getUnits() {
    const result = [];
    if (!!this.unit) {
      result.push(this.unit);
    }
    return result;
  }
  /**
   * Returns a list of model units of type 'type'.
   */
  getUnitsForType(type) {
    switch (type) {
      case "UndoUnit": {
        const result = [];
        result.push(this.unit);
        return result;
      }
    }
    return [];
  }
}
class ModelInstantiator {
  createModel() {
    let part1 = ShowCasePart.create({ name: "part1" });
    let part2 = ShowCasePart.create({ name: "part2" });
    let part3 = ShowCasePart.create({ name: "part3" });
    let part4 = ShowCasePart.create({ name: "part4" });
    let part5 = ShowCasePart.create({ name: "part5" });
    let part6 = ShowCasePart.create({ name: "part6" });
    let unit = ShowCaseUnit.create({
      name: "firstUnit",
      prim: "myPrimText",
      numlist: [100, 200, 300],
      part: part1,
      partlist: [part2, part3, part4, part5, part6]
    });
    let model = ShowCaseModel.create({ name: "ShowCaseModel", unit });
    return model;
  }
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const model = new ModelInstantiator().createModel();
  console.log("model name: " + model.name);
  const box2 = BoxUtil.labelBox(model, model.name, "bracket-open", true);
  return `<h1 data-svelte-h="svelte-pdwy1d">Welcome to Freon Svelte Library</h1> <p data-svelte-h="svelte-zlwu7j">Here you can preview/showcase the components available in this library.</p> <p data-svelte-h="svelte-1ecdlqj">The library was build using SvelteKit. Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p> <h2 data-svelte-h="svelte-1clveg">Our components</h2> <div>A LabelComponent showing the name of a model: ${validate_component(LabelComponent, "LabelComponent").$$render($$result, { box: box2 }, {}, {})}</div>`;
});
export {
  Page as default
};
