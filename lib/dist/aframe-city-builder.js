/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	__webpack_require__(1);
	__webpack_require__(2);
	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(7);

/***/ },
/* 1 */
/***/ function(module, exports) {

	if (typeof AFRAME === 'undefined') {
	  throw new Error('Component attempted to register before AFRAME was available.');
	}
	
	/**
	 * GridHelper component for A-Frame.
	 */
	AFRAME.registerComponent('gridhelper', {
	  schema: {
	    size: { default: 5 },
	    divisions: { default: 10 },
	    colorCenterLine: {default: 'red'},
	    colorGrid: {default: 'black'}
	  },
	
	  /**
	   * Called once when component is attached. Generally for initial setup.
	   */
	  init: function () {
	    var scene = this.el.object3D;
	    var data = this.data;
	
	    var size = data.size;
	    var divisions = data.divisions;
	    var colorCenterLine = data.colorCenterLine;
	    var colorGrid = data.colorGrid;
	
	    var gridHelper = new THREE.GridHelper( size, divisions, colorCenterLine, colorGrid );
	    gridHelper.name = "gridHelper";
	    scene.add(gridHelper);
	  },
	  remove: function () {
	    var scene = this.el.object3D;
	    scene.remove(scene.getObjectByName("gridHelper"));
	  }
	});


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* global AFRAME */
	
	var anime = __webpack_require__(3);
	
	if (typeof AFRAME === 'undefined') {
	  throw new Error('Component attempted to register before AFRAME was available.');
	}
	
	var utils = AFRAME.utils;
	var getComponentProperty = utils.entity.getComponentProperty;
	var setComponentProperty = utils.entity.setComponentProperty;
	var styleParser = utils.styleParser.parse;
	
	/**
	 * Animation component for A-Frame.
	 */
	AFRAME.registerComponent('animation', {
	  schema: {
	    delay: {default: 0},
	    dir: {default: ''},
	    dur: {default: 1000},
	    easing: {default: 'easeInQuad'},
	    elasticity: {default: 400},
	    from: {default: ''},
	    loop: {default: false},
	    property: {default: ''},
	    repeat: {default: 0},
	    startEvents: {type: 'array'},
	    pauseEvents: {type: 'array'},
	    resumeEvents: {type: 'array'},
	    restartEvents: {type: 'array'},
	    to: {default: ''}
	  },
	
	  multiple: true,
	
	  init: function () {
	    this.animation = null;
	    this.animationIsPlaying = false;
	    this.config = null;
	    this.playAnimationBound = this.playAnimation.bind(this);
	    this.pauseAnimationBound = this.pauseAnimation.bind(this);
	    this.resumeAnimationBound = this.resumeAnimation.bind(this);
	    this.restartAnimationBound = this.restartAnimation.bind(this);
	    this.repeat = 0;
	  },
	
	  update: function () {
	    var attrName = this.attrName;
	    var data = this.data;
	    var el = this.el;
	    var propType = getPropertyType(el, data.property);
	    var self = this;
	
	    if (!data.property) { return; }
	
	    // Base config.
	    this.repeat = data.repeat;
	    var config = {
	      autoplay: false,
	      begin: function () {
	        el.emit('animationbegin');
	        el.emit(attrName + '-begin');
	      },
	      complete: function () {
	        el.emit('animationcomplete');
	        el.emit(attrName + '-complete');
	        // Repeat.
	        if (--self.repeat > 0) { self.animation.play(); }
	      },
	      direction: data.dir,
	      duration: data.dur,
	      easing: data.easing,
	      elasticity: data.elasticity,
	      loop: data.loop
	    };
	
	    // Customize config based on property type.
	    var updateConfig = configDefault;
	    if (propType === 'vec2' || propType === 'vec3' || propType === 'vec4') {
	      updateConfig = configVector;
	    }
	
	    // Config.
	    this.config = updateConfig(el, data, config);
	    this.animation = anime(this.config);
	
	    // Stop previous animation.
	    this.pauseAnimation();
	
	    if (!this.data.startEvents.length) { this.animationIsPlaying = true; }
	
	    // Play animation if no holding event.
	    this.removeEventListeners();
	    this.addEventListeners();
	  },
	
	  remove: function () {
	    this.pauseAnimation();
	    this.removeEventListeners();
	  },
	
	  pause: function () {
	    this.pauseAnimation();
	    this.removeEventListeners();
	  },
	
	  /**
	   * Called after update.
	   */
	  play: function () {
	    var data = this.data;
	    var self = this;
	
	    if (!this.animation || !this.animationIsPlaying) { return; }
	
	    // Delay.
	    if (data.delay) {
	      setTimeout(play, data.delay);
	    } else {
	      play();
	    }
	
	    function play () {
	      self.playAnimation();
	      self.addEventListeners();
	    }
	  },
	
	  addEventListeners: function () {
	    var self = this;
	    var data = this.data;
	    var el = this.el;
	    data.startEvents.map(function (eventName) {
	      el.addEventListener(eventName, self.playAnimationBound);
	    });
	    data.pauseEvents.map(function (eventName) {
	      el.addEventListener(eventName, self.pauseAnimationBound);
	    });
	    data.resumeEvents.map(function (eventName) {
	      el.addEventListener(eventName, self.resumeAnimationBound);
	    });
	    data.restartEvents.map(function (eventName) {
	      el.addEventListener(eventName, self.restartAnimationBound);
	    });
	  },
	
	  removeEventListeners: function () {
	    var self = this;
	    var data = this.data;
	    var el = this.el;
	    data.startEvents.map(function (eventName) {
	      el.removeEventListener(eventName, self.playAnimationBound);
	    });
	    data.pauseEvents.map(function (eventName) {
	      el.removeEventListener(eventName, self.pauseAnimationBound);
	    });
	    data.resumeEvents.map(function (eventName) {
	      el.removeEventListener(eventName, self.resumeAnimationBound);
	    });
	    data.restartEvents.map(function (eventName) {
	      el.removeEventListener(eventName, self.restartAnimationBound);
	    });
	  },
	
	  playAnimation: function () {
	    this.animation.play();
	    this.animationIsPlaying = true;
	  },
	
	  pauseAnimation: function () {
	    this.animation.pause();
	    this.animationIsPlaying = false;
	  },
	
	  resumeAnimation: function () {
	    this.animation.play();
	    this.animationIsPlaying = true;
	  },
	
	  restartAnimation: function () {
	    this.animation.restart();
	    this.animationIsPlaying = true;
	  }
	});
	
	/**
	 * Stuff property into generic `property` key.
	 */
	function configDefault (el, data, config) {
	  var from = data.from || getComponentProperty(el, data.property);
	  return AFRAME.utils.extend({}, config, {
	    targets: [{aframeProperty: from}],
	    aframeProperty: data.to,
	    update: function () {
	      setComponentProperty(el, data.property, this.targets[0].aframeProperty);
	    }
	  });
	}
	
	/**
	 * Extend x/y/z/w onto the config.
	 */
	function configVector (el, data, config) {
	  var from = getComponentProperty(el, data.property);
	  if (data.from) { from = AFRAME.utils.coordinates.parse(data.from); }
	  var to = AFRAME.utils.coordinates.parse(data.to);
	  return AFRAME.utils.extend({}, config, {
	    targets: [from],
	    update: function () {
	      setComponentProperty(el, data.property, this.targets[0]);
	    }
	  }, to);
	}
	
	function getPropertyType (el, property) {
	  var split = property.split('.');
	  var componentName = split[0];
	  var propertyName = split[1];
	  var component = el.components[componentName] || AFRAME.components[componentName];
	
	  // Primitives.
	  if (!component) { return null; }
	
	  if (propertyName) {
	    return component.schema[propertyName].type;
	  }
	  return component.schema.type;
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	 * Anime v1.1.3
	 * http://anime-js.com
	 * JavaScript animation engine
	 * Copyright (c) 2016 Julian Garnier
	 * http://juliangarnier.com
	 * Released under the MIT license
	 */
	
	(function (root, factory) {
	  if (true) {
	    // AMD. Register as an anonymous module.
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof module === 'object' && module.exports) {
	    // Node. Does not work with strict CommonJS, but
	    // only CommonJS-like environments that support module.exports,
	    // like Node.
	    module.exports = factory();
	  } else {
	    // Browser globals (root is window)
	    root.anime = factory();
	  }
	}(this, function () {
	
	  var version = '1.1.3';
	
	  // Defaults
	
	  var defaultSettings = {
	    duration: 1000,
	    delay: 0,
	    loop: false,
	    autoplay: true,
	    direction: 'normal',
	    easing: 'easeOutElastic',
	    elasticity: 400,
	    round: false,
	    begin: undefined,
	    update: undefined,
	    complete: undefined
	  }
	
	  // Transforms
	
	  var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skewX', 'skewY'];
	  var transform, transformStr = 'transform';
	
	  // Utils
	
	  var is = {
	    arr: function(a) { return Array.isArray(a) },
	    obj: function(a) { return Object.prototype.toString.call(a).indexOf('Object') > -1 },
	    svg: function(a) { return a instanceof SVGElement },
	    dom: function(a) { return a.nodeType || is.svg(a) },
	    num: function(a) { return !isNaN(parseInt(a)) },
	    str: function(a) { return typeof a === 'string' },
	    fnc: function(a) { return typeof a === 'function' },
	    und: function(a) { return typeof a === 'undefined' },
	    nul: function(a) { return typeof a === 'null' },
	    hex: function(a) { return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a) },
	    rgb: function(a) { return /^rgb/.test(a) },
	    hsl: function(a) { return /^hsl/.test(a) },
	    col: function(a) { return (is.hex(a) || is.rgb(a) || is.hsl(a)) }
	  }
	
	  // Easings functions adapted from http://jqueryui.com/
	
	  var easings = (function() {
	    var eases = {};
	    var names = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];
	    var functions = {
	      Sine: function(t) { return 1 + Math.sin(Math.PI / 2 * t - Math.PI / 2); },
	      Circ: function(t) { return 1 - Math.sqrt( 1 - t * t ); },
	      Elastic: function(t, m) {
	        if( t === 0 || t === 1 ) return t;
	        var p = (1 - Math.min(m, 998) / 1000), st = t / 1, st1 = st - 1, s = p / ( 2 * Math.PI ) * Math.asin( 1 );
	        return -( Math.pow( 2, 10 * st1 ) * Math.sin( ( st1 - s ) * ( 2 * Math.PI ) / p ) );
	      },
	      Back: function(t) { return t * t * ( 3 * t - 2 ); },
	      Bounce: function(t) {
	        var pow2, bounce = 4;
	        while ( t < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}
	        return 1 / Math.pow( 4, 3 - bounce ) - 7.5625 * Math.pow( ( pow2 * 3 - 2 ) / 22 - t, 2 );
	      }
	    }
	    names.forEach(function(name, i) {
	      functions[name] = function(t) {
	        return Math.pow( t, i + 2 );
	      }
	    });
	    Object.keys(functions).forEach(function(name) {
	      var easeIn = functions[name];
	      eases['easeIn' + name] = easeIn;
	      eases['easeOut' + name] = function(t, m) { return 1 - easeIn(1 - t, m); };
	      eases['easeInOut' + name] = function(t, m) { return t < 0.5 ? easeIn(t * 2, m) / 2 : 1 - easeIn(t * -2 + 2, m) / 2; };
	      eases['easeOutIn' + name] = function(t, m) { return t < 0.5 ? (1 - easeIn(1 - 2 * t, m)) / 2 : (easeIn(t * 2 - 1, m) + 1) / 2; };
	    });
	    eases.linear = function(t) { return t; };
	    return eases;
	  })();
	
	  // Strings
	
	  var numberToString = function(val) {
	    return (is.str(val)) ? val : val + '';
	  }
	
	  var stringToHyphens = function(str) {
	    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
	  }
	
	  var selectString = function(str) {
	    if (is.col(str)) return false;
	    try {
	      var nodes = document.querySelectorAll(str);
	      return nodes;
	    } catch(e) {
	      return false;
	    }
	  }
	
	  // Numbers
	
	  var random = function(min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	  }
	
	  // Arrays
	
	  var flattenArray = function(arr) {
	    return arr.reduce(function(a, b) {
	      return a.concat(is.arr(b) ? flattenArray(b) : b);
	    }, []);
	  }
	
	  var toArray = function(o) {
	    if (is.arr(o)) return o;
	    if (is.str(o)) o = selectString(o) || o;
	    if (o instanceof NodeList || o instanceof HTMLCollection) return [].slice.call(o);
	    return [o];
	  }
	
	  var arrayContains = function(arr, val) {
	    return arr.some(function(a) { return a === val; });
	  }
	
	  var groupArrayByProps = function(arr, propsArr) {
	    var groups = {};
	    arr.forEach(function(o) {
	      var group = JSON.stringify(propsArr.map(function(p) { return o[p]; }));
	      groups[group] = groups[group] || [];
	      groups[group].push(o);
	    });
	    return Object.keys(groups).map(function(group) {
	      return groups[group];
	    });
	  }
	
	  var removeArrayDuplicates = function(arr) {
	    return arr.filter(function(item, pos, self) {
	      return self.indexOf(item) === pos;
	    });
	  }
	
	  // Objects
	
	  var cloneObject = function(o) {
	    var newObject = {};
	    for (var p in o) newObject[p] = o[p];
	    return newObject;
	  }
	
	  var mergeObjects = function(o1, o2) {
	    for (var p in o2) o1[p] = !is.und(o1[p]) ? o1[p] : o2[p];
	    return o1;
	  }
	
	  // Colors
	
	  var hexToRgb = function(hex) {
	    var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	    var hex = hex.replace(rgx, function(m, r, g, b) { return r + r + g + g + b + b; });
	    var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    var r = parseInt(rgb[1], 16);
	    var g = parseInt(rgb[2], 16);
	    var b = parseInt(rgb[3], 16);
	    return 'rgb(' + r + ',' + g + ',' + b + ')';
	  }
	
	  var hslToRgb = function(hsl) {
	    var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hsl);
	    var h = parseInt(hsl[1]) / 360;
	    var s = parseInt(hsl[2]) / 100;
	    var l = parseInt(hsl[3]) / 100;
	    var hue2rgb = function(p, q, t) {
	      if (t < 0) t += 1;
	      if (t > 1) t -= 1;
	      if (t < 1/6) return p + (q - p) * 6 * t;
	      if (t < 1/2) return q;
	      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	      return p;
	    }
	    var r, g, b;
	    if (s == 0) {
	      r = g = b = l;
	    } else {
	      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	      var p = 2 * l - q;
	      r = hue2rgb(p, q, h + 1/3);
	      g = hue2rgb(p, q, h);
	      b = hue2rgb(p, q, h - 1/3);
	    }
	    return 'rgb(' + r * 255 + ',' + g * 255 + ',' + b * 255 + ')';
	  }
	
	  var colorToRgb = function(val) {
	    if (is.rgb(val)) return val;
	    if (is.hex(val)) return hexToRgb(val);
	    if (is.hsl(val)) return hslToRgb(val);
	  }
	
	  // Units
	
	  var getUnit = function(val) {
	    return /([\+\-]?[0-9|auto\.]+)(%|px|pt|em|rem|in|cm|mm|ex|pc|vw|vh|deg)?/.exec(val)[2];
	  }
	
	  var addDefaultTransformUnit = function(prop, val, intialVal) {
	    if (getUnit(val)) return val;
	    if (prop.indexOf('translate') > -1) return getUnit(intialVal) ? val + getUnit(intialVal) : val + 'px';
	    if (prop.indexOf('rotate') > -1 || prop.indexOf('skew') > -1) return val + 'deg';
	    return val;
	  }
	
	  // Values
	
	  var getCSSValue = function(el, prop) {
	    // First check if prop is a valid CSS property
	    if (prop in el.style) {
	      // Then return the property value or fallback to '0' when getPropertyValue fails
	      return getComputedStyle(el).getPropertyValue(stringToHyphens(prop)) || '0';
	    }
	  }
	
	  var getTransformValue = function(el, prop) {
	    var defaultVal = prop.indexOf('scale') > -1 ? 1 : 0;
	    var str = el.style.transform;
	    if (!str) return defaultVal;
	    var rgx = /(\w+)\((.+?)\)/g;
	    var match = [];
	    var props = [];
	    var values = [];
	    while (match = rgx.exec(str)) {
	      props.push(match[1]);
	      values.push(match[2]);
	    }
	    var val = values.filter(function(f, i) { return props[i] === prop; });
	    return val.length ? val[0] : defaultVal;
	  }
	
	  var getAnimationType = function(el, prop) {
	    if ( is.dom(el) && arrayContains(validTransforms, prop)) return 'transform';
	    if ( is.dom(el) && (el.getAttribute(prop) || (is.svg(el) && el[prop]))) return 'attribute';
	    if ( is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) return 'css';
	    if (!is.nul(el[prop]) && !is.und(el[prop])) return 'object';
	  }
	
	  var getInitialTargetValue = function(target, prop) {
	    switch (getAnimationType(target, prop)) {
	      case 'transform': return getTransformValue(target, prop);
	      case 'css': return getCSSValue(target, prop);
	      case 'attribute': return target.getAttribute(prop);
	    }
	    return target[prop] || 0;
	  }
	
	  var getValidValue = function(values, val, originalCSS) {
	    if (is.col(val)) return colorToRgb(val);
	    if (getUnit(val)) return val;
	    var unit = getUnit(values.to) ? getUnit(values.to) : getUnit(values.from);
	    if (!unit && originalCSS) unit = getUnit(originalCSS);
	    return unit ? val + unit : val;
	  }
	
	  var decomposeValue = function(val) {
	    var rgx = /-?\d*\.?\d+/g;
	    return {
	      original: val,
	      numbers: numberToString(val).match(rgx) ? numberToString(val).match(rgx).map(Number) : [0],
	      strings: numberToString(val).split(rgx)
	    }
	  }
	
	  var recomposeValue = function(numbers, strings, initialStrings) {
	    return strings.reduce(function(a, b, i) {
	      var b = (b ? b : initialStrings[i - 1]);
	      return a + numbers[i - 1] + b;
	    });
	  }
	
	  // Animatables
	
	  var getAnimatables = function(targets) {
	    var targets = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
	    return targets.map(function(t, i) {
	      return { target: t, id: i };
	    });
	  }
	
	  // Properties
	
	  var getProperties = function(params, settings) {
	    var props = [];
	    for (var p in params) {
	      if (!defaultSettings.hasOwnProperty(p) && p !== 'targets') {
	        var prop = is.obj(params[p]) ? cloneObject(params[p]) : {value: params[p]};
	        prop.name = p;
	        props.push(mergeObjects(prop, settings));
	      }
	    }
	    return props;
	  }
	
	  var getPropertiesValues = function(target, prop, value, i) {
	    var values = toArray( is.fnc(value) ? value(target, i) : value);
	    return {
	      from: (values.length > 1) ? values[0] : getInitialTargetValue(target, prop),
	      to: (values.length > 1) ? values[1] : values[0]
	    }
	  }
	
	  // Tweens
	
	  var getTweenValues = function(prop, values, type, target) {
	    var valid = {};
	    if (type === 'transform') {
	      valid.from = prop + '(' + addDefaultTransformUnit(prop, values.from, values.to) + ')';
	      valid.to = prop + '(' + addDefaultTransformUnit(prop, values.to) + ')';
	    } else {
	      var originalCSS = (type === 'css') ? getCSSValue(target, prop) : undefined;
	      valid.from = getValidValue(values, values.from, originalCSS);
	      valid.to = getValidValue(values, values.to, originalCSS);
	    }
	    return { from: decomposeValue(valid.from), to: decomposeValue(valid.to) };
	  }
	
	  var getTweensProps = function(animatables, props) {
	    var tweensProps = [];
	    animatables.forEach(function(animatable, i) {
	      var target = animatable.target;
	      return props.forEach(function(prop) {
	        var animType = getAnimationType(target, prop.name);
	        if (animType) {
	          var values = getPropertiesValues(target, prop.name, prop.value, i);
	          var tween = cloneObject(prop);
	          tween.animatables = animatable;
	          tween.type = animType;
	          tween.from = getTweenValues(prop.name, values, tween.type, target).from;
	          tween.to = getTweenValues(prop.name, values, tween.type, target).to;
	          tween.round = (is.col(values.from) || tween.round) ? 1 : 0;
	          tween.delay = (is.fnc(tween.delay) ? tween.delay(target, i, animatables.length) : tween.delay) / animation.speed;
	          tween.duration = (is.fnc(tween.duration) ? tween.duration(target, i, animatables.length) : tween.duration) / animation.speed;
	          tweensProps.push(tween);
	        }
	      });
	    });
	    return tweensProps;
	  }
	
	  var getTweens = function(animatables, props) {
	    var tweensProps = getTweensProps(animatables, props);
	    var splittedProps = groupArrayByProps(tweensProps, ['name', 'from', 'to', 'delay', 'duration']);
	    return splittedProps.map(function(tweenProps) {
	      var tween = cloneObject(tweenProps[0]);
	      tween.animatables = tweenProps.map(function(p) { return p.animatables });
	      tween.totalDuration = tween.delay + tween.duration;
	      return tween;
	    });
	  }
	
	  var reverseTweens = function(anim, delays) {
	    anim.tweens.forEach(function(tween) {
	      var toVal = tween.to;
	      var fromVal = tween.from;
	      var delayVal = anim.duration - (tween.delay + tween.duration);
	      tween.from = toVal;
	      tween.to = fromVal;
	      if (delays) tween.delay = delayVal;
	    });
	    anim.reversed = anim.reversed ? false : true;
	  }
	
	  var getTweensDuration = function(tweens) {
	    return Math.max.apply(Math, tweens.map(function(tween){ return tween.totalDuration; }));
	  }
	
	  var getTweensDelay = function(tweens) {
	    return Math.min.apply(Math, tweens.map(function(tween){ return tween.delay; }));
	  }
	
	  // will-change
	
	  var getWillChange = function(anim) {
	    var props = [];
	    var els = [];
	    anim.tweens.forEach(function(tween) {
	      if (tween.type === 'css' || tween.type === 'transform' ) {
	        props.push(tween.type === 'css' ? stringToHyphens(tween.name) : 'transform');
	        tween.animatables.forEach(function(animatable) { els.push(animatable.target); });
	      }
	    });
	    return {
	      properties: removeArrayDuplicates(props).join(', '),
	      elements: removeArrayDuplicates(els)
	    }
	  }
	
	  var setWillChange = function(anim) {
	    var willChange = getWillChange(anim);
	    willChange.elements.forEach(function(element) {
	      element.style.willChange = willChange.properties;
	    });
	  }
	
	  var removeWillChange = function(anim) {
	    var willChange = getWillChange(anim);
	    willChange.elements.forEach(function(element) {
	      element.style.removeProperty('will-change');
	    });
	  }
	
	  /* Svg path */
	
	  var getPathProps = function(path) {
	    var el = is.str(path) ? selectString(path)[0] : path;
	    return {
	      path: el,
	      value: el.getTotalLength()
	    }
	  }
	
	  var snapProgressToPath = function(tween, progress) {
	    var pathEl = tween.path;
	    var pathProgress = tween.value * progress;
	    var point = function(offset) {
	      var o = offset || 0;
	      var p = progress > 1 ? tween.value + o : pathProgress + o;
	      return pathEl.getPointAtLength(p);
	    }
	    var p = point();
	    var p0 = point(-1);
	    var p1 = point(+1);
	    switch (tween.name) {
	      case 'translateX': return p.x;
	      case 'translateY': return p.y;
	      case 'rotate': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
	    }
	  }
	
	  // Progress
	
	  var getTweenProgress = function(tween, time) {
	    var elapsed = Math.min(Math.max(time - tween.delay, 0), tween.duration);
	    var percent = elapsed / tween.duration;
	    var progress = tween.to.numbers.map(function(number, p) {
	      var start = tween.from.numbers[p];
	      var eased = easings[tween.easing](percent, tween.elasticity);
	      var val = tween.path ? snapProgressToPath(tween, eased) : start + eased * (number - start);
	      val = tween.round ? Math.round(val * tween.round) / tween.round : val;
	      return val;
	    });
	    return recomposeValue(progress, tween.to.strings, tween.from.strings);
	  }
	
	  var setAnimationProgress = function(anim, time) {
	    var transforms;
	    anim.currentTime = time;
	    anim.progress = (time / anim.duration) * 100;
	    for (var t = 0; t < anim.tweens.length; t++) {
	      var tween = anim.tweens[t];
	      tween.currentValue = getTweenProgress(tween, time);
	      var progress = tween.currentValue;
	      for (var a = 0; a < tween.animatables.length; a++) {
	        var animatable = tween.animatables[a];
	        var id = animatable.id;
	        var target = animatable.target;
	        var name = tween.name;
	        switch (tween.type) {
	          case 'css': target.style[name] = progress; break;
	          case 'attribute': target.setAttribute(name, progress); break;
	          case 'object': target[name] = progress; break;
	          case 'transform':
	          if (!transforms) transforms = {};
	          if (!transforms[id]) transforms[id] = [];
	          transforms[id].push(progress);
	          break;
	        }
	      }
	    }
	    if (transforms) {
	      if (!transform) transform = (getCSSValue(document.body, transformStr) ? '' : '-webkit-') + transformStr;
	      for (var t in transforms) {
	        anim.animatables[t].target.style[transform] = transforms[t].join(' ');
	      }
	    }
	  }
	
	  // Animation
	
	  var createAnimation = function(params) {
	    var anim = {};
	    anim.animatables = getAnimatables(params.targets);
	    anim.settings = mergeObjects(params, defaultSettings);
	    anim.properties = getProperties(params, anim.settings);
	    anim.tweens = getTweens(anim.animatables, anim.properties);
	    anim.duration = anim.tweens.length ? getTweensDuration(anim.tweens) : params.duration;
	    anim.delay = anim.tweens.length ? getTweensDelay(anim.tweens) : params.delay;
	    anim.currentTime = 0;
	    anim.progress = 0;
	    anim.ended = false;
	    return anim;
	  }
	
	  // Public
	
	  var animations = [];
	  var raf = 0;
	
	  var engine = (function() {
	    var play = function() { raf = requestAnimationFrame(step); };
	    var step = function(t) {
	      if (animations.length) {
	        for (var i = 0; i < animations.length; i++) animations[i].tick(t);
	        play();
	      } else {
	        cancelAnimationFrame(raf);
	        raf = 0;
	      }
	    }
	    return play;
	  })();
	
	  var animation = function(params) {
	
	    var anim = createAnimation(params);
	    var time = {};
	
	    anim.tick = function(now) {
	      anim.ended = false;
	      if (!time.start) time.start = now;
	      time.current = Math.min(Math.max(time.last + now - time.start, 0), anim.duration);
	      setAnimationProgress(anim, time.current);
	      var s = anim.settings;
	      if (time.current >= anim.delay) {
	        if (s.begin) s.begin(anim); s.begin = undefined;
	        if (s.update) s.update(anim);
	      }
	      if (time.current >= anim.duration) {
	        if (s.loop) {
	          time.start = now;
	          if (s.direction === 'alternate') reverseTweens(anim, true);
	          if (is.num(s.loop)) s.loop--;
	        } else {
	          anim.ended = true;
	          anim.pause();
	          if (s.complete) s.complete(anim);
	        }
	        time.last = 0;
	      }
	    }
	
	    anim.seek = function(progress) {
	      setAnimationProgress(anim, (progress / 100) * anim.duration);
	    }
	
	    anim.pause = function() {
	      removeWillChange(anim);
	      var i = animations.indexOf(anim);
	      if (i > -1) animations.splice(i, 1);
	    }
	
	    anim.play = function(params) {
	      anim.pause();
	      if (params) anim = mergeObjects(createAnimation(mergeObjects(params, anim.settings)), anim);
	      time.start = 0;
	      time.last = anim.ended ? 0 : anim.currentTime;
	      var s = anim.settings;
	      if (s.direction === 'reverse') reverseTweens(anim);
	      if (s.direction === 'alternate' && !s.loop) s.loop = 1;
	      setWillChange(anim);
	      animations.push(anim);
	      if (!raf) engine();
	    }
	
	    anim.restart = function() {
	      if (anim.reversed) reverseTweens(anim);
	      anim.pause();
	      anim.seek(0);
	      anim.play();
	    }
	
	    if (anim.settings.autoplay) anim.play();
	
	    return anim;
	
	  }
	
	  // Remove one or multiple targets from all active animations.
	
	  var remove = function(elements) {
	    var targets = flattenArray(is.arr(elements) ? elements.map(toArray) : toArray(elements));
	    for (var i = animations.length-1; i >= 0; i--) {
	      var animation = animations[i];
	      var tweens = animation.tweens;
	      for (var t = tweens.length-1; t >= 0; t--) {
	        var animatables = tweens[t].animatables;
	        for (var a = animatables.length-1; a >= 0; a--) {
	          if (arrayContains(targets, animatables[a].target)) {
	            animatables.splice(a, 1);
	            if (!animatables.length) tweens.splice(t, 1);
	            if (!tweens.length) animation.pause();
	          }
	        }
	      }
	    }
	  }
	
	  animation.version = version;
	  animation.speed = 1;
	  animation.list = animations;
	  animation.remove = remove;
	  animation.easings = easings;
	  animation.getValue = getInitialTargetValue;
	  animation.path = getPathProps;
	  animation.random = random;
	
	  return animation;
	
	}));


/***/ },
/* 4 */
/***/ function(module, exports) {

	/* global AFRAME */
	"use strict";
	
	if (typeof AFRAME === 'undefined') {
	  throw new Error('Component attempted to register before AFRAME was available.');
	}
	
	/**
	 * Game logic for controlling a-frame actions such as teleport and save
	 */
	AFRAME.registerComponent('action-controls', {
	  schema: {
	    menuID: { type: "string", default: "menu" }
	  },
	
	  /**
	   * Set if component needs multiple instancing.
	   */
	  multiple: false,
	
	  /**
	   * Add event listeners.
	   */
	  addEventListeners: function addEventListeners() {
	    // get menu element associated with these controls
	    var menuEl = document.getElementById(this.data.menuID);
	    menuEl.addEventListener('menuChanged', this.onActionChange.bind(this));
	    menuEl.addEventListener('menuSelected', this.onActionSelect.bind(this));
	  },
	
	  /**
	   * Remove event listeners.
	   */
	  removeEventListeners: function removeEventListeners() {
	    var menuEl = document.getElementById(this.data.menuID);
	    menuEl.removeEventListener('menuChanged', this.onActionChange);
	    // menuEl.removeEventListener('menuSelected', this.onPlaceObject);
	  },
	
	  init: function init() {
	    console.log(this.data.menuID);
	    var menuEl = document.getElementById(this.data.menuID);
	
	    console.log("action-controls: menu element: " + menuEl);
	    // get currently selected action
	    var optionValue = menuEl.components['select-bar'].selectedOptionValue;
	    console.log("optionValue" + optionValue);
	    console.log(optionValue);
	
	    // do the thing associated with the action
	    this.handleActionStart(optionValue);
	  },
	
	  onActionSelect: function onActionSelect() {
	    // what is the action
	    var menuEl = document.getElementById(this.data.menuID);
	
	    // get currently selected action
	    var optionValue = menuEl.components['select-bar'].selectedOptionValue;
	    console.log("onActionSelect triggered\ncurrent optionValue:\n");
	    console.log(optionValue);
	    // call the thing that does it
	  },
	
	  onActionChange: function onActionChange() {
	    // undo old one
	    this.handleActionEnd(this.previousAction);
	
	    var menuEl = document.getElementById(this.data.menuID);
	    // get currently selected action
	    var optionValue = menuEl.components['select-bar'].selectedOptionValue;
	    console.log("new optionValue: " + optionValue);
	    console.log(optionValue);
	    // do new one
	    this.handleActionStart(optionValue);
	  },
	
	  /**
	   * Called when entity resumes.
	   * Use to continue or add any dynamic or background behavior such as events.
	   */
	  play: function play() {
	    this.addEventListeners();
	  },
	
	  /**
	   * Called when entity pauses.
	   * Use to stop or remove any dynamic or background behavior such as events.
	   */
	  pause: function pause() {
	    this.removeEventListeners();
	  },
	
	  /**
	   * Called when a component is removed (e.g., via removeAttribute).
	   * Generally undoes all modifications to the entity.
	   */
	  remove: function remove() {
	    this.removeEventListeners();
	  },
	
	  handleActionStart: function handleActionStart(optionValue) {
	    this.previousAction = optionValue;
	
	    // for given optionValue, do something
	    switch (optionValue) {
	      case "teleport":
	        // add teleport component to the control element that is the parent of this menu
	        console.log("teleportStart");
	        var controlEl = this.el;
	        console.log("controlEl:");
	        console.log(controlEl);
	        // Add attribute from this html: teleport-controls="button: trigger; collisionEntities: #ground"
	        controlEl.setAttribute("teleport-controls", "button: trigger; collisionEntities: #ground");
	        return; // without this return the other cases are fired - weird!
	      case "save":
	        console.log("saveStart");
	        return;
	      case "saveAs":
	        console.log("saveAsStart");
	        return;
	      case "new":
	        console.log("newStart");
	        return;
	    }
	  },
	
	  handleActionEnd: function handleActionEnd(optionValue) {
	    // for given optionValue, do something
	    switch (optionValue) {
	      case "teleport":
	        // add teleport component to the control element that is the parent of this menu
	        console.log("teleportEnd");
	        controlEl = this.el;
	        console.log("controlEl:");
	        console.log(controlEl);
	        // Add attribute from this html: teleport-controls="button: trigger; collisionEntities: #ground"
	        controlEl.removeAttribute("teleport-controls");
	        return; // without this return the other cases are fired - weird!
	      case "save":
	        console.log("saveStart");
	        return;
	      case "saveAs":
	        console.log("saveAsStart");
	        return;
	      case "new":
	        console.log("newStart");
	        return;
	    }
	  }
	});

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';
	
	/* global AFRAME */
	
	if (typeof AFRAME === 'undefined') {
	  throw new Error('Component attempted to register before AFRAME was available.');
	}
	
	var objectCount = 0; // scene starts with 0 items
	
	function humanize(str) {
	  var frags = str.split('_');
	  var i = 0;
	  for (i = 0; i < frags.length; i++) {
	    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
	  }
	  return frags.join(' ');
	}
	
	/**
	 * Vive Controller Template component for A-Frame.
	 * Modifed from A-Frame Dominoes.
	 */
	AFRAME.registerComponent('builder-controls', {
	  schema: {
	    menuId: { type: "string", default: "menu" }
	  },
	
	  /**
	   * Set if component needs multiple instancing.
	   */
	  multiple: false,
	
	  /**
	   * Add event listeners.
	   */
	  addEventListeners: function addEventListeners() {
	    var el = this.el;
	    // this is the only controller funtion not covered by select menu component
	    // Applicable to both Vive and Oculus Touch controls
	    el.addEventListener('gripdown', this.onUndo.bind(this));
	
	    // the rest of the controls are handled by the menu element
	    var menuEl = document.getElementById(this.data.menuId);
	    menuEl.addEventListener('menuChanged', this.onObjectChange.bind(this));
	    menuEl.addEventListener('menuSelected', this.onPlaceObject.bind(this));
	  },
	
	  /**
	   * Remove event listeners.
	   */
	  removeEventListeners: function removeEventListeners() {
	    var el = this.el;
	    el.removeEventListener('gripdown', this.onUndo);
	
	    var menuEl = document.getElementById(this.data.menuId);
	    menuEl.removeEventListener('menuChanged', this.onObjectChange);
	    menuEl.removeEventListener('menuSelected', this.onPlaceObject);
	  },
	
	  init: function init() {
	    // get the list of object group json directories - which json files should we read?
	    // for each group, fetch the json file and populate the optgroup and option elements as children of the appropriate menu element
	    var list = ["kfarr_bases", "mmmm_veh", "mmmm_bld", "mmmm_chr", "mmmm_alien", "mmmm_scene"];
	
	    var groupJSONArray = [];
	    var menuId = this.data.menuId;
	    console.log("builder-controls menuId: " + menuId);
	
	    // TODO: wrap this in promise and then request aframe-select-bar component to re-init when done loading
	    list.forEach(function (groupName, index) {
	      // excellent reference: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON
	      var requestURL = 'assets/' + groupName + ".json";
	      var request = new XMLHttpRequest();
	      request.open('GET', requestURL);
	      request.responseType = 'json';
	      request.send();
	
	      request.onload = function () {
	        // for each grouplist json file when loaded
	        groupJSONArray[groupName] = request.response;
	        // literally add this shit to the dom dude
	        // console.log(groupJSONArray[groupName]);
	        // console.log("groupName: " + groupName);
	
	        // find the optgroup parent element - the menu option?
	        var menuEl = document.getElementById(menuId);
	
	        // add the parent optgroup node like: <optgroup label="Aliens" value="mmmm_alien">
	        var newOptgroupEl = document.createElement("optgroup");
	        newOptgroupEl.setAttribute("label", humanize(groupName)); // TODO: this should be a prettier label, not the filename
	        newOptgroupEl.setAttribute("value", groupName);
	
	        // create each child
	        var optionsHTML = "";
	        groupJSONArray[groupName].forEach(function (objectDefinition, index) {
	          // console.log(objectDefinition["file"]);
	          // console.log(objectDefinition);
	          optionsHTML += '<option value="' + objectDefinition["file"] + '" src="assets/preview/' + objectDefinition["file"] + '.jpg">' + humanize(objectDefinition["file"]) + '</option>';
	        });
	
	        newOptgroupEl.innerHTML = optionsHTML;
	        // TODO: BAD WORKAROUND TO NOT RELOAD BASES since it's defined in HTML. Instead, no objects should be listed in HTML. This should use a promise and then init the select-bar component once all objects are listed.
	        if (groupName == "kfarr_bases") {
	          // do nothing - don't append this to the DOM because one is already there
	        } else {
	          menuEl.appendChild(newOptgroupEl);
	        }
	        //          resolve;
	      };
	    });
	
	    this.groupJSONArray = groupJSONArray;
	  },
	
	  /**
	   * Called when entity resumes.
	   * Use to continue or add any dynamic or background behavior such as events.
	   */
	  play: function play() {
	    this.addEventListeners();
	  },
	
	  /**
	   * Called when entity pauses.
	   * Use to stop or remove any dynamic or background behavior such as events.
	   */
	  pause: function pause() {
	    this.removeEventListeners();
	  },
	
	  /**
	   * Called when a component is removed (e.g., via removeAttribute).
	   * Generally undoes all modifications to the entity.
	   */
	  remove: function remove() {
	    this.removeEventListeners();
	  },
	
	  /**
	   * Spawns the currently selected object at the controller location when trigger pressed
	   */
	  onPlaceObject: function onPlaceObject() {
	
	    // Fetch the Item element (the placeable city object) selected on this controller
	    var thisItemID = this.el.id === 'leftController' ? '#leftItem' : '#rightItem';
	    var thisItemEl = document.querySelector(thisItemID);
	
	    // Which object should be placed here? This ID is "stored" in the DOM element of the current Item
	    var objectId = parseInt(thisItemEl.attributes.objectId.value);
	
	    // What's the type of object? For example, "mmmm_alien" or "bases"
	    var objectGroup = thisItemEl.attributes.objectGroup.value;
	
	    // rounding true or false? We want to round position and rotation only for "bases" type objects
	    var rounding = objectGroup == 'kfarr_bases';
	
	    // Get an Array of all the objects of this type
	    var objectArray = this.groupJSONArray[objectGroup];
	
	    // Get the Item's current world coordinates - we're going to place it right where it is!
	    var thisItemWorldPosition = thisItemEl.object3D.getWorldPosition();
	    var thisItemWorldRotation = thisItemEl.object3D.getWorldRotation();
	    var originalPositionString = thisItemWorldPosition.x + ' ' + thisItemWorldPosition.y + ' ' + thisItemWorldPosition.z;
	
	    // Round the Item's position to the nearest 0.50 for a basic "grid snapping" effect
	    var roundedItemWorldPositionX = Math.round(thisItemWorldPosition.x * 2) / 2; //round to nearest 0.5 for ghetto "snapping"
	    var roundedItemWorldPositionY = Math.round(thisItemWorldPosition.y * 2) / 2; //round to nearest 0.5 for ghetto "snapping"
	    var roundedItemWorldPositionZ = Math.round(thisItemWorldPosition.z * 2) / 2; //round to nearest 0.5 for ghetto "snapping"
	    var roundedPositionString = roundedItemWorldPositionX + ' 0.50 ' + roundedItemWorldPositionZ;
	
	    // Fetch the current Item's rotation and convert it to a Euler string
	    var thisItemWorldRotationX = thisItemWorldRotation._x / (Math.PI / 180);
	    var thisItemWorldRotationY = thisItemWorldRotation._y / (Math.PI / 180);
	    var thisItemWorldRotationZ = thisItemWorldRotation._z / (Math.PI / 180);
	    var originalEulerRotationString = thisItemWorldRotationX + ' ' + thisItemWorldRotationY + ' ' + thisItemWorldRotationZ;
	
	    // Round the Item's rotation to the nearest 90 degrees for base type objects
	    var roundedThisItemWorldRotationY = Math.round(thisItemWorldRotationY / 90) * 90; // round to 90 degrees
	    var roundedEulerRotationString = 0 + ' ' + roundedThisItemWorldRotationY + ' ' + 0; // ignore roll and pitch
	
	    var newId = 'object' + objectCount;
	
	    $('<a-entity />', {
	      id: newId,
	      class: 'city object children',
	      scale: objectArray[objectId].scale,
	      rotation: rounding ? roundedEulerRotationString : originalEulerRotationString,
	      file: objectArray[objectId].file,
	      // "ply-model": "src: url(new_assets/" + objectArray[objectId].file + ".ply)",
	      "obj-model": "obj: url(assets/obj/" + objectArray[objectId].file + ".obj); mtl: url(assets/obj/" + objectArray[objectId].file + ".mtl)",
	      appendTo: $('#city')
	    });
	
	    var newObject = document.getElementById(newId);
	    newObject.setAttribute("position", rounding ? roundedPositionString : originalPositionString); // this does set position
	
	    // If this is a "bases" type object, animate the transition to the snapped (rounded) position and rotation
	    if (rounding) {
	      newObject.setAttribute('animation', { property: 'rotation', dur: 500, from: originalEulerRotationString, to: roundedEulerRotationString });
	    };
	
	    newObject.setAttribute("firebase-broadcast", "components: position, scale, rotation, file, obj-model, class; persist: true");
	
	    // Increment the object counter so subsequent objects have the correct index
	    objectCount += 1;
	  },
	
	  onObjectChange: function onObjectChange() {
	    console.log("onObjectChange triggered");
	
	    // Fetch the Item element (the placeable city object) selected on this controller
	    var thisItemID = this.el.id === 'leftController' ? '#leftItem' : '#rightItem';
	    var thisItemEl = document.querySelector(thisItemID);
	
	    var menuEl = document.getElementById(this.data.menuId);
	
	    // What's the type of object currently selected? For example, "mmmm_alien" or "bases"
	    var objectGroup = menuEl.components['select-bar'].selectedOptgroupValue;
	
	    // Get an Array of all the objects of this type
	    var objectArray = this.groupJSONArray[objectGroup];
	
	    // What is the ID of the currently selected item?
	    var newObjectId = parseInt(menuEl.components['select-bar'].selectedOptionIndex);
	    var selectedOptionValue = menuEl.components['select-bar'].selectedOptionValue;
	
	    // Set the preview object to be the currently selected "preview" item
	    thisItemEl.setAttribute('obj-model', { obj: "url(assets/obj/" + objectArray[newObjectId].file + ".obj)",
	      mtl: "url(assets/obj/" + objectArray[newObjectId].file + ".mtl)" });
	    thisItemEl.setAttribute('scale', objectArray[newObjectId].scale);
	    thisItemEl.setAttribute('objectId', newObjectId);
	    thisItemEl.setAttribute('objectGroup', objectGroup);
	    thisItemEl.flushToDOM();
	  },
	
	  /**
	   * Undo - deletes the most recently placed object
	   */
	  onUndo: function onUndo() {
	    var previousObject = document.querySelector("#object" + (objectCount - 1));
	    previousObject.parentNode.removeChild(previousObject);
	    objectCount -= 1;
	    if (objectCount == -1) {
	      objectCount = 0;
	    };
	  }
	
	});

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';
	
	/* global AFRAME, THREE */
	
	/**
	 * Loads and setup ground model.
	 */
	AFRAME.registerComponent('ground', {
	  init: function init() {
	    var objectLoader;
	    var object3D = this.el.object3D;
	    // var MODEL_URL = 'https://cdn.aframe.io/link-traversal/models/ground.json';
	    var MODEL_URL = 'assets/environment/ground.json';
	    if (this.objectLoader) {
	      return;
	    }
	    objectLoader = this.objectLoader = new THREE.ObjectLoader();
	    objectLoader.crossOrigin = '';
	    objectLoader.load(MODEL_URL, function (obj) {
	      obj.children.forEach(function (value) {
	        value.receiveShadow = true;
	        value.material.shading = THREE.FlatShading;
	      });
	      object3D.add(obj);
	    });
	  }
	});

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	/* global AFRAME */
	AFRAME.registerShader('skyGradient', {
	  schema: {
	    colorTop: { type: 'color', default: 'black', is: 'uniform' },
	    colorBottom: { type: 'color', default: 'red', is: 'uniform' }
	  },
	
	  vertexShader: ['varying vec3 vWorldPosition;', 'void main() {', 'vec4 worldPosition = modelMatrix * vec4( position, 1.0 );', 'vWorldPosition = worldPosition.xyz;', 'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );', '}'].join('\n'),
	
	  fragmentShader: ['uniform vec3 colorTop;', 'uniform vec3 colorBottom;', 'varying vec3 vWorldPosition;', 'void main()', '{', 'vec3 pointOnSphere = normalize(vWorldPosition.xyz);', 'float f = 1.0;', 'if(pointOnSphere.y > - 0.2){', 'f = sin(pointOnSphere.y * 2.0);', '}', 'gl_FragColor = vec4(mix(colorBottom,colorTop, f ), 1.0);', '}'].join('\n')
	});

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMzY2ZTA5ZjM4ZDZkODQ4OTY0ZTEiLCJ3ZWJwYWNrOi8vLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2FuaW1lanMvYW5pbWUuanMiLCJ3ZWJwYWNrOi8vLy4vbGliL2FjdGlvbi1jb250cm9scy5qcyIsIndlYnBhY2s6Ly8vLi9saWIvYnVpbGRlci1jb250cm9scy5qcyIsIndlYnBhY2s6Ly8vLi9saWIvZ3JvdW5kLmpzIiwid2VicGFjazovLy8uL2xpYi9za3lHcmFkaWVudC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiQUZSQU1FIiwiRXJyb3IiLCJyZWdpc3RlckNvbXBvbmVudCIsInNjaGVtYSIsIm1lbnVJRCIsInR5cGUiLCJkZWZhdWx0IiwibXVsdGlwbGUiLCJhZGRFdmVudExpc3RlbmVycyIsIm1lbnVFbCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJkYXRhIiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uQWN0aW9uQ2hhbmdlIiwiYmluZCIsIm9uQWN0aW9uU2VsZWN0IiwicmVtb3ZlRXZlbnRMaXN0ZW5lcnMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiaW5pdCIsImNvbnNvbGUiLCJsb2ciLCJvcHRpb25WYWx1ZSIsImNvbXBvbmVudHMiLCJzZWxlY3RlZE9wdGlvblZhbHVlIiwiaGFuZGxlQWN0aW9uU3RhcnQiLCJoYW5kbGVBY3Rpb25FbmQiLCJwcmV2aW91c0FjdGlvbiIsInBsYXkiLCJwYXVzZSIsInJlbW92ZSIsImNvbnRyb2xFbCIsImVsIiwic2V0QXR0cmlidXRlIiwicmVtb3ZlQXR0cmlidXRlIiwib2JqZWN0Q291bnQiLCJodW1hbml6ZSIsInN0ciIsImZyYWdzIiwic3BsaXQiLCJpIiwibGVuZ3RoIiwiY2hhckF0IiwidG9VcHBlckNhc2UiLCJzbGljZSIsImpvaW4iLCJtZW51SWQiLCJvblVuZG8iLCJvbk9iamVjdENoYW5nZSIsIm9uUGxhY2VPYmplY3QiLCJsaXN0IiwiZ3JvdXBKU09OQXJyYXkiLCJmb3JFYWNoIiwiZ3JvdXBOYW1lIiwiaW5kZXgiLCJyZXF1ZXN0VVJMIiwicmVxdWVzdCIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNlbmQiLCJvbmxvYWQiLCJyZXNwb25zZSIsIm5ld09wdGdyb3VwRWwiLCJjcmVhdGVFbGVtZW50Iiwib3B0aW9uc0hUTUwiLCJvYmplY3REZWZpbml0aW9uIiwiaW5uZXJIVE1MIiwiYXBwZW5kQ2hpbGQiLCJ0aGlzSXRlbUlEIiwiaWQiLCJ0aGlzSXRlbUVsIiwicXVlcnlTZWxlY3RvciIsIm9iamVjdElkIiwicGFyc2VJbnQiLCJhdHRyaWJ1dGVzIiwidmFsdWUiLCJvYmplY3RHcm91cCIsInJvdW5kaW5nIiwib2JqZWN0QXJyYXkiLCJ0aGlzSXRlbVdvcmxkUG9zaXRpb24iLCJvYmplY3QzRCIsImdldFdvcmxkUG9zaXRpb24iLCJ0aGlzSXRlbVdvcmxkUm90YXRpb24iLCJnZXRXb3JsZFJvdGF0aW9uIiwib3JpZ2luYWxQb3NpdGlvblN0cmluZyIsIngiLCJ5IiwieiIsInJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblgiLCJNYXRoIiwicm91bmQiLCJyb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25ZIiwicm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWiIsInJvdW5kZWRQb3NpdGlvblN0cmluZyIsInRoaXNJdGVtV29ybGRSb3RhdGlvblgiLCJfeCIsIlBJIiwidGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSIsIl95IiwidGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWiIsIl96Iiwib3JpZ2luYWxFdWxlclJvdGF0aW9uU3RyaW5nIiwicm91bmRlZFRoaXNJdGVtV29ybGRSb3RhdGlvblkiLCJyb3VuZGVkRXVsZXJSb3RhdGlvblN0cmluZyIsIm5ld0lkIiwiJCIsImNsYXNzIiwic2NhbGUiLCJyb3RhdGlvbiIsImZpbGUiLCJhcHBlbmRUbyIsIm5ld09iamVjdCIsInByb3BlcnR5IiwiZHVyIiwiZnJvbSIsInRvIiwic2VsZWN0ZWRPcHRncm91cFZhbHVlIiwibmV3T2JqZWN0SWQiLCJzZWxlY3RlZE9wdGlvbkluZGV4Iiwib2JqIiwibXRsIiwiZmx1c2hUb0RPTSIsInByZXZpb3VzT2JqZWN0IiwicGFyZW50Tm9kZSIsInJlbW92ZUNoaWxkIiwib2JqZWN0TG9hZGVyIiwiTU9ERUxfVVJMIiwiVEhSRUUiLCJPYmplY3RMb2FkZXIiLCJjcm9zc09yaWdpbiIsImxvYWQiLCJjaGlsZHJlbiIsInJlY2VpdmVTaGFkb3ciLCJtYXRlcmlhbCIsInNoYWRpbmciLCJGbGF0U2hhZGluZyIsImFkZCIsInJlZ2lzdGVyU2hhZGVyIiwiY29sb3JUb3AiLCJpcyIsImNvbG9yQm90dG9tIiwidmVydGV4U2hhZGVyIiwiZnJhZ21lbnRTaGFkZXIiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7O0FDdENBOztBQUNBLG9CQUFBQSxDQUFRLENBQVI7QUFDQSxvQkFBQUEsQ0FBUSxDQUFSO0FBQ0Esb0JBQUFBLENBQVEsQ0FBUjtBQUNBLG9CQUFBQSxDQUFRLENBQVI7QUFDQSxvQkFBQUEsQ0FBUSxDQUFSO0FBQ0Esb0JBQUFBLENBQVEsQ0FBUixFOzs7Ozs7QUNOQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsYUFBYTtBQUN4QixpQkFBZ0IsY0FBYztBQUM5Qix1QkFBc0IsZUFBZTtBQUNyQyxpQkFBZ0I7QUFDaEIsSUFBRzs7QUFFSDtB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QUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxzREFBcUQsOEJBQThCLEVBQUU7QUFDckYsNEJBQTJCLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRTtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE0QywwQkFBMEIsRUFBRTtBQUN4RTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZUFBYztBQUNkLE1BQUs7QUFDTDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtFQUFpRTtBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFB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Z0IsQ0FDZCx3QkFEYyxFQUVkLDJCQUZjLEVBSWQsOEJBSmMsRUFNZCxhQU5jLEVBUWQsR0FSYyxFQVNaLHFEQVRZLEVBVVosZ0JBVlksRUFXWiw4QkFYWSxFQWFWLGlDQWJVLEVBZVosR0FmWSxFQWdCWiwwREFoQlksRUFrQmQsR0FsQmMsRUFtQmRsRyxJQW5CYyxDQW1CVCxJQW5CUztBQXBCbUIsRUFBckMsRSIsImZpbGUiOiJhZnJhbWUtY2l0eS1idWlsZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMzY2ZTA5ZjM4ZDZkODQ4OTY0ZTEiLCJcInVzZSBzdHJpY3RcIjtcclxucmVxdWlyZSgnYWZyYW1lLWdyaWRoZWxwZXItY29tcG9uZW50Jyk7XHJcbnJlcXVpcmUoJ2FmcmFtZS1hbmltYXRpb24tY29tcG9uZW50Jyk7XHJcbnJlcXVpcmUoJy4vbGliL2FjdGlvbi1jb250cm9scy5qcycpO1xyXG5yZXF1aXJlKCcuL2xpYi9idWlsZGVyLWNvbnRyb2xzLmpzJyk7XHJcbnJlcXVpcmUoJy4vbGliL2dyb3VuZC5qcycpO1xyXG5yZXF1aXJlKCcuL2xpYi9za3lHcmFkaWVudC5qcycpO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9pbmRleC5qcyIsImlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xufVxuXG4vKipcbiAqIEdyaWRIZWxwZXIgY29tcG9uZW50IGZvciBBLUZyYW1lLlxuICovXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2dyaWRoZWxwZXInLCB7XG4gIHNjaGVtYToge1xuICAgIHNpemU6IHsgZGVmYXVsdDogNSB9LFxuICAgIGRpdmlzaW9uczogeyBkZWZhdWx0OiAxMCB9LFxuICAgIGNvbG9yQ2VudGVyTGluZToge2RlZmF1bHQ6ICdyZWQnfSxcbiAgICBjb2xvckdyaWQ6IHtkZWZhdWx0OiAnYmxhY2snfVxuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxsZWQgb25jZSB3aGVuIGNvbXBvbmVudCBpcyBhdHRhY2hlZC4gR2VuZXJhbGx5IGZvciBpbml0aWFsIHNldHVwLlxuICAgKi9cbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzY2VuZSA9IHRoaXMuZWwub2JqZWN0M0Q7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG5cbiAgICB2YXIgc2l6ZSA9IGRhdGEuc2l6ZTtcbiAgICB2YXIgZGl2aXNpb25zID0gZGF0YS5kaXZpc2lvbnM7XG4gICAgdmFyIGNvbG9yQ2VudGVyTGluZSA9IGRhdGEuY29sb3JDZW50ZXJMaW5lO1xuICAgIHZhciBjb2xvckdyaWQgPSBkYXRhLmNvbG9yR3JpZDtcblxuICAgIHZhciBncmlkSGVscGVyID0gbmV3IFRIUkVFLkdyaWRIZWxwZXIoIHNpemUsIGRpdmlzaW9ucywgY29sb3JDZW50ZXJMaW5lLCBjb2xvckdyaWQgKTtcbiAgICBncmlkSGVscGVyLm5hbWUgPSBcImdyaWRIZWxwZXJcIjtcbiAgICBzY2VuZS5hZGQoZ3JpZEhlbHBlcik7XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzY2VuZSA9IHRoaXMuZWwub2JqZWN0M0Q7XG4gICAgc2NlbmUucmVtb3ZlKHNjZW5lLmdldE9iamVjdEJ5TmFtZShcImdyaWRIZWxwZXJcIikpO1xuICB9XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyogZ2xvYmFsIEFGUkFNRSAqL1xuXG52YXIgYW5pbWUgPSByZXF1aXJlKCdhbmltZWpzJyk7XG5cbmlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xufVxuXG52YXIgdXRpbHMgPSBBRlJBTUUudXRpbHM7XG52YXIgZ2V0Q29tcG9uZW50UHJvcGVydHkgPSB1dGlscy5lbnRpdHkuZ2V0Q29tcG9uZW50UHJvcGVydHk7XG52YXIgc2V0Q29tcG9uZW50UHJvcGVydHkgPSB1dGlscy5lbnRpdHkuc2V0Q29tcG9uZW50UHJvcGVydHk7XG52YXIgc3R5bGVQYXJzZXIgPSB1dGlscy5zdHlsZVBhcnNlci5wYXJzZTtcblxuLyoqXG4gKiBBbmltYXRpb24gY29tcG9uZW50IGZvciBBLUZyYW1lLlxuICovXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2FuaW1hdGlvbicsIHtcbiAgc2NoZW1hOiB7XG4gICAgZGVsYXk6IHtkZWZhdWx0OiAwfSxcbiAgICBkaXI6IHtkZWZhdWx0OiAnJ30sXG4gICAgZHVyOiB7ZGVmYXVsdDogMTAwMH0sXG4gICAgZWFzaW5nOiB7ZGVmYXVsdDogJ2Vhc2VJblF1YWQnfSxcbiAgICBlbGFzdGljaXR5OiB7ZGVmYXVsdDogNDAwfSxcbiAgICBmcm9tOiB7ZGVmYXVsdDogJyd9LFxuICAgIGxvb3A6IHtkZWZhdWx0OiBmYWxzZX0sXG4gICAgcHJvcGVydHk6IHtkZWZhdWx0OiAnJ30sXG4gICAgcmVwZWF0OiB7ZGVmYXVsdDogMH0sXG4gICAgc3RhcnRFdmVudHM6IHt0eXBlOiAnYXJyYXknfSxcbiAgICBwYXVzZUV2ZW50czoge3R5cGU6ICdhcnJheSd9LFxuICAgIHJlc3VtZUV2ZW50czoge3R5cGU6ICdhcnJheSd9LFxuICAgIHJlc3RhcnRFdmVudHM6IHt0eXBlOiAnYXJyYXknfSxcbiAgICB0bzoge2RlZmF1bHQ6ICcnfVxuICB9LFxuXG4gIG11bHRpcGxlOiB0cnVlLFxuXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbiA9IG51bGw7XG4gICAgdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmNvbmZpZyA9IG51bGw7XG4gICAgdGhpcy5wbGF5QW5pbWF0aW9uQm91bmQgPSB0aGlzLnBsYXlBbmltYXRpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnBhdXNlQW5pbWF0aW9uQm91bmQgPSB0aGlzLnBhdXNlQW5pbWF0aW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXN1bWVBbmltYXRpb25Cb3VuZCA9IHRoaXMucmVzdW1lQW5pbWF0aW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXN0YXJ0QW5pbWF0aW9uQm91bmQgPSB0aGlzLnJlc3RhcnRBbmltYXRpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlcGVhdCA9IDA7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGF0dHJOYW1lID0gdGhpcy5hdHRyTmFtZTtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIHZhciBwcm9wVHlwZSA9IGdldFByb3BlcnR5VHlwZShlbCwgZGF0YS5wcm9wZXJ0eSk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFkYXRhLnByb3BlcnR5KSB7IHJldHVybjsgfVxuXG4gICAgLy8gQmFzZSBjb25maWcuXG4gICAgdGhpcy5yZXBlYXQgPSBkYXRhLnJlcGVhdDtcbiAgICB2YXIgY29uZmlnID0ge1xuICAgICAgYXV0b3BsYXk6IGZhbHNlLFxuICAgICAgYmVnaW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZWwuZW1pdCgnYW5pbWF0aW9uYmVnaW4nKTtcbiAgICAgICAgZWwuZW1pdChhdHRyTmFtZSArICctYmVnaW4nKTtcbiAgICAgIH0sXG4gICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBlbC5lbWl0KCdhbmltYXRpb25jb21wbGV0ZScpO1xuICAgICAgICBlbC5lbWl0KGF0dHJOYW1lICsgJy1jb21wbGV0ZScpO1xuICAgICAgICAvLyBSZXBlYXQuXG4gICAgICAgIGlmICgtLXNlbGYucmVwZWF0ID4gMCkgeyBzZWxmLmFuaW1hdGlvbi5wbGF5KCk7IH1cbiAgICAgIH0sXG4gICAgICBkaXJlY3Rpb246IGRhdGEuZGlyLFxuICAgICAgZHVyYXRpb246IGRhdGEuZHVyLFxuICAgICAgZWFzaW5nOiBkYXRhLmVhc2luZyxcbiAgICAgIGVsYXN0aWNpdHk6IGRhdGEuZWxhc3RpY2l0eSxcbiAgICAgIGxvb3A6IGRhdGEubG9vcFxuICAgIH07XG5cbiAgICAvLyBDdXN0b21pemUgY29uZmlnIGJhc2VkIG9uIHByb3BlcnR5IHR5cGUuXG4gICAgdmFyIHVwZGF0ZUNvbmZpZyA9IGNvbmZpZ0RlZmF1bHQ7XG4gICAgaWYgKHByb3BUeXBlID09PSAndmVjMicgfHwgcHJvcFR5cGUgPT09ICd2ZWMzJyB8fCBwcm9wVHlwZSA9PT0gJ3ZlYzQnKSB7XG4gICAgICB1cGRhdGVDb25maWcgPSBjb25maWdWZWN0b3I7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlnLlxuICAgIHRoaXMuY29uZmlnID0gdXBkYXRlQ29uZmlnKGVsLCBkYXRhLCBjb25maWcpO1xuICAgIHRoaXMuYW5pbWF0aW9uID0gYW5pbWUodGhpcy5jb25maWcpO1xuXG4gICAgLy8gU3RvcCBwcmV2aW91cyBhbmltYXRpb24uXG4gICAgdGhpcy5wYXVzZUFuaW1hdGlvbigpO1xuXG4gICAgaWYgKCF0aGlzLmRhdGEuc3RhcnRFdmVudHMubGVuZ3RoKSB7IHRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nID0gdHJ1ZTsgfVxuXG4gICAgLy8gUGxheSBhbmltYXRpb24gaWYgbm8gaG9sZGluZyBldmVudC5cbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucGF1c2VBbmltYXRpb24oKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gIH0sXG5cbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnBhdXNlQW5pbWF0aW9uKCk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYWZ0ZXIgdXBkYXRlLlxuICAgKi9cbiAgcGxheTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICghdGhpcy5hbmltYXRpb24gfHwgIXRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nKSB7IHJldHVybjsgfVxuXG4gICAgLy8gRGVsYXkuXG4gICAgaWYgKGRhdGEuZGVsYXkpIHtcbiAgICAgIHNldFRpbWVvdXQocGxheSwgZGF0YS5kZWxheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBsYXkoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwbGF5ICgpIHtcbiAgICAgIHNlbGYucGxheUFuaW1hdGlvbigpO1xuICAgICAgc2VsZi5hZGRFdmVudExpc3RlbmVycygpO1xuICAgIH1cbiAgfSxcblxuICBhZGRFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIGRhdGEuc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnBsYXlBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5wYXVzZUV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucGF1c2VBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5yZXN1bWVFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3VtZUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnJlc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3RhcnRBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICBkYXRhLnN0YXJ0RXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5wbGF5QW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucGF1c2VFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnBhdXNlQW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucmVzdW1lRXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5yZXN1bWVBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5yZXN0YXJ0RXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5yZXN0YXJ0QW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICB9LFxuXG4gIHBsYXlBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbi5wbGF5KCk7XG4gICAgdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcgPSB0cnVlO1xuICB9LFxuXG4gIHBhdXNlQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hbmltYXRpb24ucGF1c2UoKTtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IGZhbHNlO1xuICB9LFxuXG4gIHJlc3VtZUFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uLnBsYXkoKTtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IHRydWU7XG4gIH0sXG5cbiAgcmVzdGFydEFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uLnJlc3RhcnQoKTtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IHRydWU7XG4gIH1cbn0pO1xuXG4vKipcbiAqIFN0dWZmIHByb3BlcnR5IGludG8gZ2VuZXJpYyBgcHJvcGVydHlgIGtleS5cbiAqL1xuZnVuY3Rpb24gY29uZmlnRGVmYXVsdCAoZWwsIGRhdGEsIGNvbmZpZykge1xuICB2YXIgZnJvbSA9IGRhdGEuZnJvbSB8fCBnZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSk7XG4gIHJldHVybiBBRlJBTUUudXRpbHMuZXh0ZW5kKHt9LCBjb25maWcsIHtcbiAgICB0YXJnZXRzOiBbe2FmcmFtZVByb3BlcnR5OiBmcm9tfV0sXG4gICAgYWZyYW1lUHJvcGVydHk6IGRhdGEudG8sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSwgdGhpcy50YXJnZXRzWzBdLmFmcmFtZVByb3BlcnR5KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIEV4dGVuZCB4L3kvei93IG9udG8gdGhlIGNvbmZpZy5cbiAqL1xuZnVuY3Rpb24gY29uZmlnVmVjdG9yIChlbCwgZGF0YSwgY29uZmlnKSB7XG4gIHZhciBmcm9tID0gZ2V0Q29tcG9uZW50UHJvcGVydHkoZWwsIGRhdGEucHJvcGVydHkpO1xuICBpZiAoZGF0YS5mcm9tKSB7IGZyb20gPSBBRlJBTUUudXRpbHMuY29vcmRpbmF0ZXMucGFyc2UoZGF0YS5mcm9tKTsgfVxuICB2YXIgdG8gPSBBRlJBTUUudXRpbHMuY29vcmRpbmF0ZXMucGFyc2UoZGF0YS50byk7XG4gIHJldHVybiBBRlJBTUUudXRpbHMuZXh0ZW5kKHt9LCBjb25maWcsIHtcbiAgICB0YXJnZXRzOiBbZnJvbV0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSwgdGhpcy50YXJnZXRzWzBdKTtcbiAgICB9XG4gIH0sIHRvKTtcbn1cblxuZnVuY3Rpb24gZ2V0UHJvcGVydHlUeXBlIChlbCwgcHJvcGVydHkpIHtcbiAgdmFyIHNwbGl0ID0gcHJvcGVydHkuc3BsaXQoJy4nKTtcbiAgdmFyIGNvbXBvbmVudE5hbWUgPSBzcGxpdFswXTtcbiAgdmFyIHByb3BlcnR5TmFtZSA9IHNwbGl0WzFdO1xuICB2YXIgY29tcG9uZW50ID0gZWwuY29tcG9uZW50c1tjb21wb25lbnROYW1lXSB8fCBBRlJBTUUuY29tcG9uZW50c1tjb21wb25lbnROYW1lXTtcblxuICAvLyBQcmltaXRpdmVzLlxuICBpZiAoIWNvbXBvbmVudCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIGlmIChwcm9wZXJ0eU5hbWUpIHtcbiAgICByZXR1cm4gY29tcG9uZW50LnNjaGVtYVtwcm9wZXJ0eU5hbWVdLnR5cGU7XG4gIH1cbiAgcmV0dXJuIGNvbXBvbmVudC5zY2hlbWEudHlwZTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuICogQW5pbWUgdjEuMS4zXG4gKiBodHRwOi8vYW5pbWUtanMuY29tXG4gKiBKYXZhU2NyaXB0IGFuaW1hdGlvbiBlbmdpbmVcbiAqIENvcHlyaWdodCAoYykgMjAxNiBKdWxpYW4gR2FybmllclxuICogaHR0cDovL2p1bGlhbmdhcm5pZXIuY29tXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG4gICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgLy8gbGlrZSBOb2RlLlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5hbmltZSA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHZlcnNpb24gPSAnMS4xLjMnO1xuXG4gIC8vIERlZmF1bHRzXG5cbiAgdmFyIGRlZmF1bHRTZXR0aW5ncyA9IHtcbiAgICBkdXJhdGlvbjogMTAwMCxcbiAgICBkZWxheTogMCxcbiAgICBsb29wOiBmYWxzZSxcbiAgICBhdXRvcGxheTogdHJ1ZSxcbiAgICBkaXJlY3Rpb246ICdub3JtYWwnLFxuICAgIGVhc2luZzogJ2Vhc2VPdXRFbGFzdGljJyxcbiAgICBlbGFzdGljaXR5OiA0MDAsXG4gICAgcm91bmQ6IGZhbHNlLFxuICAgIGJlZ2luOiB1bmRlZmluZWQsXG4gICAgdXBkYXRlOiB1bmRlZmluZWQsXG4gICAgY29tcGxldGU6IHVuZGVmaW5lZFxuICB9XG5cbiAgLy8gVHJhbnNmb3Jtc1xuXG4gIHZhciB2YWxpZFRyYW5zZm9ybXMgPSBbJ3RyYW5zbGF0ZVgnLCAndHJhbnNsYXRlWScsICd0cmFuc2xhdGVaJywgJ3JvdGF0ZScsICdyb3RhdGVYJywgJ3JvdGF0ZVknLCAncm90YXRlWicsICdzY2FsZScsICdzY2FsZVgnLCAnc2NhbGVZJywgJ3NjYWxlWicsICdza2V3WCcsICdza2V3WSddO1xuICB2YXIgdHJhbnNmb3JtLCB0cmFuc2Zvcm1TdHIgPSAndHJhbnNmb3JtJztcblxuICAvLyBVdGlsc1xuXG4gIHZhciBpcyA9IHtcbiAgICBhcnI6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIEFycmF5LmlzQXJyYXkoYSkgfSxcbiAgICBvYmo6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKS5pbmRleE9mKCdPYmplY3QnKSA+IC0xIH0sXG4gICAgc3ZnOiBmdW5jdGlvbihhKSB7IHJldHVybiBhIGluc3RhbmNlb2YgU1ZHRWxlbWVudCB9LFxuICAgIGRvbTogZnVuY3Rpb24oYSkgeyByZXR1cm4gYS5ub2RlVHlwZSB8fCBpcy5zdmcoYSkgfSxcbiAgICBudW06IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICFpc05hTihwYXJzZUludChhKSkgfSxcbiAgICBzdHI6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAnc3RyaW5nJyB9LFxuICAgIGZuYzogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICdmdW5jdGlvbicgfSxcbiAgICB1bmQ6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAndW5kZWZpbmVkJyB9LFxuICAgIG51bDogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICdudWxsJyB9LFxuICAgIGhleDogZnVuY3Rpb24oYSkgeyByZXR1cm4gLyheI1swLTlBLUZdezZ9JCl8KF4jWzAtOUEtRl17M30kKS9pLnRlc3QoYSkgfSxcbiAgICByZ2I6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIC9ecmdiLy50ZXN0KGEpIH0sXG4gICAgaHNsOiBmdW5jdGlvbihhKSB7IHJldHVybiAvXmhzbC8udGVzdChhKSB9LFxuICAgIGNvbDogZnVuY3Rpb24oYSkgeyByZXR1cm4gKGlzLmhleChhKSB8fCBpcy5yZ2IoYSkgfHwgaXMuaHNsKGEpKSB9XG4gIH1cblxuICAvLyBFYXNpbmdzIGZ1bmN0aW9ucyBhZGFwdGVkIGZyb20gaHR0cDovL2pxdWVyeXVpLmNvbS9cblxuICB2YXIgZWFzaW5ncyA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgZWFzZXMgPSB7fTtcbiAgICB2YXIgbmFtZXMgPSBbJ1F1YWQnLCAnQ3ViaWMnLCAnUXVhcnQnLCAnUXVpbnQnLCAnRXhwbyddO1xuICAgIHZhciBmdW5jdGlvbnMgPSB7XG4gICAgICBTaW5lOiBmdW5jdGlvbih0KSB7IHJldHVybiAxICsgTWF0aC5zaW4oTWF0aC5QSSAvIDIgKiB0IC0gTWF0aC5QSSAvIDIpOyB9LFxuICAgICAgQ2lyYzogZnVuY3Rpb24odCkgeyByZXR1cm4gMSAtIE1hdGguc3FydCggMSAtIHQgKiB0ICk7IH0sXG4gICAgICBFbGFzdGljOiBmdW5jdGlvbih0LCBtKSB7XG4gICAgICAgIGlmKCB0ID09PSAwIHx8IHQgPT09IDEgKSByZXR1cm4gdDtcbiAgICAgICAgdmFyIHAgPSAoMSAtIE1hdGgubWluKG0sIDk5OCkgLyAxMDAwKSwgc3QgPSB0IC8gMSwgc3QxID0gc3QgLSAxLCBzID0gcCAvICggMiAqIE1hdGguUEkgKSAqIE1hdGguYXNpbiggMSApO1xuICAgICAgICByZXR1cm4gLSggTWF0aC5wb3coIDIsIDEwICogc3QxICkgKiBNYXRoLnNpbiggKCBzdDEgLSBzICkgKiAoIDIgKiBNYXRoLlBJICkgLyBwICkgKTtcbiAgICAgIH0sXG4gICAgICBCYWNrOiBmdW5jdGlvbih0KSB7IHJldHVybiB0ICogdCAqICggMyAqIHQgLSAyICk7IH0sXG4gICAgICBCb3VuY2U6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgdmFyIHBvdzIsIGJvdW5jZSA9IDQ7XG4gICAgICAgIHdoaWxlICggdCA8ICggKCBwb3cyID0gTWF0aC5wb3coIDIsIC0tYm91bmNlICkgKSAtIDEgKSAvIDExICkge31cbiAgICAgICAgcmV0dXJuIDEgLyBNYXRoLnBvdyggNCwgMyAtIGJvdW5jZSApIC0gNy41NjI1ICogTWF0aC5wb3coICggcG93MiAqIDMgLSAyICkgLyAyMiAtIHQsIDIgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbmFtZXMuZm9yRWFjaChmdW5jdGlvbihuYW1lLCBpKSB7XG4gICAgICBmdW5jdGlvbnNbbmFtZV0gPSBmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdyggdCwgaSArIDIgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhmdW5jdGlvbnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGVhc2VJbiA9IGZ1bmN0aW9uc1tuYW1lXTtcbiAgICAgIGVhc2VzWydlYXNlSW4nICsgbmFtZV0gPSBlYXNlSW47XG4gICAgICBlYXNlc1snZWFzZU91dCcgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIDEgLSBlYXNlSW4oMSAtIHQsIG0pOyB9O1xuICAgICAgZWFzZXNbJ2Vhc2VJbk91dCcgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIHQgPCAwLjUgPyBlYXNlSW4odCAqIDIsIG0pIC8gMiA6IDEgLSBlYXNlSW4odCAqIC0yICsgMiwgbSkgLyAyOyB9O1xuICAgICAgZWFzZXNbJ2Vhc2VPdXRJbicgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIHQgPCAwLjUgPyAoMSAtIGVhc2VJbigxIC0gMiAqIHQsIG0pKSAvIDIgOiAoZWFzZUluKHQgKiAyIC0gMSwgbSkgKyAxKSAvIDI7IH07XG4gICAgfSk7XG4gICAgZWFzZXMubGluZWFyID0gZnVuY3Rpb24odCkgeyByZXR1cm4gdDsgfTtcbiAgICByZXR1cm4gZWFzZXM7XG4gIH0pKCk7XG5cbiAgLy8gU3RyaW5nc1xuXG4gIHZhciBudW1iZXJUb1N0cmluZyA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiAoaXMuc3RyKHZhbCkpID8gdmFsIDogdmFsICsgJyc7XG4gIH1cblxuICB2YXIgc3RyaW5nVG9IeXBoZW5zID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgdmFyIHNlbGVjdFN0cmluZyA9IGZ1bmN0aW9uKHN0cikge1xuICAgIGlmIChpcy5jb2woc3RyKSkgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICB2YXIgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHN0cik7XG4gICAgICByZXR1cm4gbm9kZXM7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLy8gTnVtYmVyc1xuXG4gIHZhciByYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuICB9XG5cbiAgLy8gQXJyYXlzXG5cbiAgdmFyIGZsYXR0ZW5BcnJheSA9IGZ1bmN0aW9uKGFycikge1xuICAgIHJldHVybiBhcnIucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmNvbmNhdChpcy5hcnIoYikgPyBmbGF0dGVuQXJyYXkoYikgOiBiKTtcbiAgICB9LCBbXSk7XG4gIH1cblxuICB2YXIgdG9BcnJheSA9IGZ1bmN0aW9uKG8pIHtcbiAgICBpZiAoaXMuYXJyKG8pKSByZXR1cm4gbztcbiAgICBpZiAoaXMuc3RyKG8pKSBvID0gc2VsZWN0U3RyaW5nKG8pIHx8IG87XG4gICAgaWYgKG8gaW5zdGFuY2VvZiBOb2RlTGlzdCB8fCBvIGluc3RhbmNlb2YgSFRNTENvbGxlY3Rpb24pIHJldHVybiBbXS5zbGljZS5jYWxsKG8pO1xuICAgIHJldHVybiBbb107XG4gIH1cblxuICB2YXIgYXJyYXlDb250YWlucyA9IGZ1bmN0aW9uKGFyciwgdmFsKSB7XG4gICAgcmV0dXJuIGFyci5zb21lKGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGEgPT09IHZhbDsgfSk7XG4gIH1cblxuICB2YXIgZ3JvdXBBcnJheUJ5UHJvcHMgPSBmdW5jdGlvbihhcnIsIHByb3BzQXJyKSB7XG4gICAgdmFyIGdyb3VwcyA9IHt9O1xuICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uKG8pIHtcbiAgICAgIHZhciBncm91cCA9IEpTT04uc3RyaW5naWZ5KHByb3BzQXJyLm1hcChmdW5jdGlvbihwKSB7IHJldHVybiBvW3BdOyB9KSk7XG4gICAgICBncm91cHNbZ3JvdXBdID0gZ3JvdXBzW2dyb3VwXSB8fCBbXTtcbiAgICAgIGdyb3Vwc1tncm91cF0ucHVzaChvKTtcbiAgICB9KTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZ3JvdXBzKS5tYXAoZnVuY3Rpb24oZ3JvdXApIHtcbiAgICAgIHJldHVybiBncm91cHNbZ3JvdXBdO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIHJlbW92ZUFycmF5RHVwbGljYXRlcyA9IGZ1bmN0aW9uKGFycikge1xuICAgIHJldHVybiBhcnIuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0sIHBvcywgc2VsZikge1xuICAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZihpdGVtKSA9PT0gcG9zO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gT2JqZWN0c1xuXG4gIHZhciBjbG9uZU9iamVjdCA9IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgbmV3T2JqZWN0ID0ge307XG4gICAgZm9yICh2YXIgcCBpbiBvKSBuZXdPYmplY3RbcF0gPSBvW3BdO1xuICAgIHJldHVybiBuZXdPYmplY3Q7XG4gIH1cblxuICB2YXIgbWVyZ2VPYmplY3RzID0gZnVuY3Rpb24obzEsIG8yKSB7XG4gICAgZm9yICh2YXIgcCBpbiBvMikgbzFbcF0gPSAhaXMudW5kKG8xW3BdKSA/IG8xW3BdIDogbzJbcF07XG4gICAgcmV0dXJuIG8xO1xuICB9XG5cbiAgLy8gQ29sb3JzXG5cbiAgdmFyIGhleFRvUmdiID0gZnVuY3Rpb24oaGV4KSB7XG4gICAgdmFyIHJneCA9IC9eIz8oW2EtZlxcZF0pKFthLWZcXGRdKShbYS1mXFxkXSkkL2k7XG4gICAgdmFyIGhleCA9IGhleC5yZXBsYWNlKHJneCwgZnVuY3Rpb24obSwgciwgZywgYikgeyByZXR1cm4gciArIHIgKyBnICsgZyArIGIgKyBiOyB9KTtcbiAgICB2YXIgcmdiID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgdmFyIHIgPSBwYXJzZUludChyZ2JbMV0sIDE2KTtcbiAgICB2YXIgZyA9IHBhcnNlSW50KHJnYlsyXSwgMTYpO1xuICAgIHZhciBiID0gcGFyc2VJbnQocmdiWzNdLCAxNik7XG4gICAgcmV0dXJuICdyZ2IoJyArIHIgKyAnLCcgKyBnICsgJywnICsgYiArICcpJztcbiAgfVxuXG4gIHZhciBoc2xUb1JnYiA9IGZ1bmN0aW9uKGhzbCkge1xuICAgIHZhciBoc2wgPSAvaHNsXFwoKFxcZCspLFxccyooW1xcZC5dKyklLFxccyooW1xcZC5dKyklXFwpL2cuZXhlYyhoc2wpO1xuICAgIHZhciBoID0gcGFyc2VJbnQoaHNsWzFdKSAvIDM2MDtcbiAgICB2YXIgcyA9IHBhcnNlSW50KGhzbFsyXSkgLyAxMDA7XG4gICAgdmFyIGwgPSBwYXJzZUludChoc2xbM10pIC8gMTAwO1xuICAgIHZhciBodWUycmdiID0gZnVuY3Rpb24ocCwgcSwgdCkge1xuICAgICAgaWYgKHQgPCAwKSB0ICs9IDE7XG4gICAgICBpZiAodCA+IDEpIHQgLT0gMTtcbiAgICAgIGlmICh0IDwgMS82KSByZXR1cm4gcCArIChxIC0gcCkgKiA2ICogdDtcbiAgICAgIGlmICh0IDwgMS8yKSByZXR1cm4gcTtcbiAgICAgIGlmICh0IDwgMi8zKSByZXR1cm4gcCArIChxIC0gcCkgKiAoMi8zIC0gdCkgKiA2O1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIHZhciByLCBnLCBiO1xuICAgIGlmIChzID09IDApIHtcbiAgICAgIHIgPSBnID0gYiA9IGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBxID0gbCA8IDAuNSA/IGwgKiAoMSArIHMpIDogbCArIHMgLSBsICogcztcbiAgICAgIHZhciBwID0gMiAqIGwgLSBxO1xuICAgICAgciA9IGh1ZTJyZ2IocCwgcSwgaCArIDEvMyk7XG4gICAgICBnID0gaHVlMnJnYihwLCBxLCBoKTtcbiAgICAgIGIgPSBodWUycmdiKHAsIHEsIGggLSAxLzMpO1xuICAgIH1cbiAgICByZXR1cm4gJ3JnYignICsgciAqIDI1NSArICcsJyArIGcgKiAyNTUgKyAnLCcgKyBiICogMjU1ICsgJyknO1xuICB9XG5cbiAgdmFyIGNvbG9yVG9SZ2IgPSBmdW5jdGlvbih2YWwpIHtcbiAgICBpZiAoaXMucmdiKHZhbCkpIHJldHVybiB2YWw7XG4gICAgaWYgKGlzLmhleCh2YWwpKSByZXR1cm4gaGV4VG9SZ2IodmFsKTtcbiAgICBpZiAoaXMuaHNsKHZhbCkpIHJldHVybiBoc2xUb1JnYih2YWwpO1xuICB9XG5cbiAgLy8gVW5pdHNcblxuICB2YXIgZ2V0VW5pdCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiAvKFtcXCtcXC1dP1swLTl8YXV0b1xcLl0rKSglfHB4fHB0fGVtfHJlbXxpbnxjbXxtbXxleHxwY3x2d3x2aHxkZWcpPy8uZXhlYyh2YWwpWzJdO1xuICB9XG5cbiAgdmFyIGFkZERlZmF1bHRUcmFuc2Zvcm1Vbml0ID0gZnVuY3Rpb24ocHJvcCwgdmFsLCBpbnRpYWxWYWwpIHtcbiAgICBpZiAoZ2V0VW5pdCh2YWwpKSByZXR1cm4gdmFsO1xuICAgIGlmIChwcm9wLmluZGV4T2YoJ3RyYW5zbGF0ZScpID4gLTEpIHJldHVybiBnZXRVbml0KGludGlhbFZhbCkgPyB2YWwgKyBnZXRVbml0KGludGlhbFZhbCkgOiB2YWwgKyAncHgnO1xuICAgIGlmIChwcm9wLmluZGV4T2YoJ3JvdGF0ZScpID4gLTEgfHwgcHJvcC5pbmRleE9mKCdza2V3JykgPiAtMSkgcmV0dXJuIHZhbCArICdkZWcnO1xuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICAvLyBWYWx1ZXNcblxuICB2YXIgZ2V0Q1NTVmFsdWUgPSBmdW5jdGlvbihlbCwgcHJvcCkge1xuICAgIC8vIEZpcnN0IGNoZWNrIGlmIHByb3AgaXMgYSB2YWxpZCBDU1MgcHJvcGVydHlcbiAgICBpZiAocHJvcCBpbiBlbC5zdHlsZSkge1xuICAgICAgLy8gVGhlbiByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9yIGZhbGxiYWNrIHRvICcwJyB3aGVuIGdldFByb3BlcnR5VmFsdWUgZmFpbHNcbiAgICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKGVsKS5nZXRQcm9wZXJ0eVZhbHVlKHN0cmluZ1RvSHlwaGVucyhwcm9wKSkgfHwgJzAnO1xuICAgIH1cbiAgfVxuXG4gIHZhciBnZXRUcmFuc2Zvcm1WYWx1ZSA9IGZ1bmN0aW9uKGVsLCBwcm9wKSB7XG4gICAgdmFyIGRlZmF1bHRWYWwgPSBwcm9wLmluZGV4T2YoJ3NjYWxlJykgPiAtMSA/IDEgOiAwO1xuICAgIHZhciBzdHIgPSBlbC5zdHlsZS50cmFuc2Zvcm07XG4gICAgaWYgKCFzdHIpIHJldHVybiBkZWZhdWx0VmFsO1xuICAgIHZhciByZ3ggPSAvKFxcdyspXFwoKC4rPylcXCkvZztcbiAgICB2YXIgbWF0Y2ggPSBbXTtcbiAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgd2hpbGUgKG1hdGNoID0gcmd4LmV4ZWMoc3RyKSkge1xuICAgICAgcHJvcHMucHVzaChtYXRjaFsxXSk7XG4gICAgICB2YWx1ZXMucHVzaChtYXRjaFsyXSk7XG4gICAgfVxuICAgIHZhciB2YWwgPSB2YWx1ZXMuZmlsdGVyKGZ1bmN0aW9uKGYsIGkpIHsgcmV0dXJuIHByb3BzW2ldID09PSBwcm9wOyB9KTtcbiAgICByZXR1cm4gdmFsLmxlbmd0aCA/IHZhbFswXSA6IGRlZmF1bHRWYWw7XG4gIH1cblxuICB2YXIgZ2V0QW5pbWF0aW9uVHlwZSA9IGZ1bmN0aW9uKGVsLCBwcm9wKSB7XG4gICAgaWYgKCBpcy5kb20oZWwpICYmIGFycmF5Q29udGFpbnModmFsaWRUcmFuc2Zvcm1zLCBwcm9wKSkgcmV0dXJuICd0cmFuc2Zvcm0nO1xuICAgIGlmICggaXMuZG9tKGVsKSAmJiAoZWwuZ2V0QXR0cmlidXRlKHByb3ApIHx8IChpcy5zdmcoZWwpICYmIGVsW3Byb3BdKSkpIHJldHVybiAnYXR0cmlidXRlJztcbiAgICBpZiAoIGlzLmRvbShlbCkgJiYgKHByb3AgIT09ICd0cmFuc2Zvcm0nICYmIGdldENTU1ZhbHVlKGVsLCBwcm9wKSkpIHJldHVybiAnY3NzJztcbiAgICBpZiAoIWlzLm51bChlbFtwcm9wXSkgJiYgIWlzLnVuZChlbFtwcm9wXSkpIHJldHVybiAnb2JqZWN0JztcbiAgfVxuXG4gIHZhciBnZXRJbml0aWFsVGFyZ2V0VmFsdWUgPSBmdW5jdGlvbih0YXJnZXQsIHByb3ApIHtcbiAgICBzd2l0Y2ggKGdldEFuaW1hdGlvblR5cGUodGFyZ2V0LCBwcm9wKSkge1xuICAgICAgY2FzZSAndHJhbnNmb3JtJzogcmV0dXJuIGdldFRyYW5zZm9ybVZhbHVlKHRhcmdldCwgcHJvcCk7XG4gICAgICBjYXNlICdjc3MnOiByZXR1cm4gZ2V0Q1NTVmFsdWUodGFyZ2V0LCBwcm9wKTtcbiAgICAgIGNhc2UgJ2F0dHJpYnV0ZSc6IHJldHVybiB0YXJnZXQuZ2V0QXR0cmlidXRlKHByb3ApO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0W3Byb3BdIHx8IDA7XG4gIH1cblxuICB2YXIgZ2V0VmFsaWRWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlcywgdmFsLCBvcmlnaW5hbENTUykge1xuICAgIGlmIChpcy5jb2wodmFsKSkgcmV0dXJuIGNvbG9yVG9SZ2IodmFsKTtcbiAgICBpZiAoZ2V0VW5pdCh2YWwpKSByZXR1cm4gdmFsO1xuICAgIHZhciB1bml0ID0gZ2V0VW5pdCh2YWx1ZXMudG8pID8gZ2V0VW5pdCh2YWx1ZXMudG8pIDogZ2V0VW5pdCh2YWx1ZXMuZnJvbSk7XG4gICAgaWYgKCF1bml0ICYmIG9yaWdpbmFsQ1NTKSB1bml0ID0gZ2V0VW5pdChvcmlnaW5hbENTUyk7XG4gICAgcmV0dXJuIHVuaXQgPyB2YWwgKyB1bml0IDogdmFsO1xuICB9XG5cbiAgdmFyIGRlY29tcG9zZVZhbHVlID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIHJneCA9IC8tP1xcZCpcXC4/XFxkKy9nO1xuICAgIHJldHVybiB7XG4gICAgICBvcmlnaW5hbDogdmFsLFxuICAgICAgbnVtYmVyczogbnVtYmVyVG9TdHJpbmcodmFsKS5tYXRjaChyZ3gpID8gbnVtYmVyVG9TdHJpbmcodmFsKS5tYXRjaChyZ3gpLm1hcChOdW1iZXIpIDogWzBdLFxuICAgICAgc3RyaW5nczogbnVtYmVyVG9TdHJpbmcodmFsKS5zcGxpdChyZ3gpXG4gICAgfVxuICB9XG5cbiAgdmFyIHJlY29tcG9zZVZhbHVlID0gZnVuY3Rpb24obnVtYmVycywgc3RyaW5ncywgaW5pdGlhbFN0cmluZ3MpIHtcbiAgICByZXR1cm4gc3RyaW5ncy5yZWR1Y2UoZnVuY3Rpb24oYSwgYiwgaSkge1xuICAgICAgdmFyIGIgPSAoYiA/IGIgOiBpbml0aWFsU3RyaW5nc1tpIC0gMV0pO1xuICAgICAgcmV0dXJuIGEgKyBudW1iZXJzW2kgLSAxXSArIGI7XG4gICAgfSk7XG4gIH1cblxuICAvLyBBbmltYXRhYmxlc1xuXG4gIHZhciBnZXRBbmltYXRhYmxlcyA9IGZ1bmN0aW9uKHRhcmdldHMpIHtcbiAgICB2YXIgdGFyZ2V0cyA9IHRhcmdldHMgPyAoZmxhdHRlbkFycmF5KGlzLmFycih0YXJnZXRzKSA/IHRhcmdldHMubWFwKHRvQXJyYXkpIDogdG9BcnJheSh0YXJnZXRzKSkpIDogW107XG4gICAgcmV0dXJuIHRhcmdldHMubWFwKGZ1bmN0aW9uKHQsIGkpIHtcbiAgICAgIHJldHVybiB7IHRhcmdldDogdCwgaWQ6IGkgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFByb3BlcnRpZXNcblxuICB2YXIgZ2V0UHJvcGVydGllcyA9IGZ1bmN0aW9uKHBhcmFtcywgc2V0dGluZ3MpIHtcbiAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICBmb3IgKHZhciBwIGluIHBhcmFtcykge1xuICAgICAgaWYgKCFkZWZhdWx0U2V0dGluZ3MuaGFzT3duUHJvcGVydHkocCkgJiYgcCAhPT0gJ3RhcmdldHMnKSB7XG4gICAgICAgIHZhciBwcm9wID0gaXMub2JqKHBhcmFtc1twXSkgPyBjbG9uZU9iamVjdChwYXJhbXNbcF0pIDoge3ZhbHVlOiBwYXJhbXNbcF19O1xuICAgICAgICBwcm9wLm5hbWUgPSBwO1xuICAgICAgICBwcm9wcy5wdXNoKG1lcmdlT2JqZWN0cyhwcm9wLCBzZXR0aW5ncykpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvcHM7XG4gIH1cblxuICB2YXIgZ2V0UHJvcGVydGllc1ZhbHVlcyA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCwgdmFsdWUsIGkpIHtcbiAgICB2YXIgdmFsdWVzID0gdG9BcnJheSggaXMuZm5jKHZhbHVlKSA/IHZhbHVlKHRhcmdldCwgaSkgOiB2YWx1ZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZyb206ICh2YWx1ZXMubGVuZ3RoID4gMSkgPyB2YWx1ZXNbMF0gOiBnZXRJbml0aWFsVGFyZ2V0VmFsdWUodGFyZ2V0LCBwcm9wKSxcbiAgICAgIHRvOiAodmFsdWVzLmxlbmd0aCA+IDEpID8gdmFsdWVzWzFdIDogdmFsdWVzWzBdXG4gICAgfVxuICB9XG5cbiAgLy8gVHdlZW5zXG5cbiAgdmFyIGdldFR3ZWVuVmFsdWVzID0gZnVuY3Rpb24ocHJvcCwgdmFsdWVzLCB0eXBlLCB0YXJnZXQpIHtcbiAgICB2YXIgdmFsaWQgPSB7fTtcbiAgICBpZiAodHlwZSA9PT0gJ3RyYW5zZm9ybScpIHtcbiAgICAgIHZhbGlkLmZyb20gPSBwcm9wICsgJygnICsgYWRkRGVmYXVsdFRyYW5zZm9ybVVuaXQocHJvcCwgdmFsdWVzLmZyb20sIHZhbHVlcy50bykgKyAnKSc7XG4gICAgICB2YWxpZC50byA9IHByb3AgKyAnKCcgKyBhZGREZWZhdWx0VHJhbnNmb3JtVW5pdChwcm9wLCB2YWx1ZXMudG8pICsgJyknO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgb3JpZ2luYWxDU1MgPSAodHlwZSA9PT0gJ2NzcycpID8gZ2V0Q1NTVmFsdWUodGFyZ2V0LCBwcm9wKSA6IHVuZGVmaW5lZDtcbiAgICAgIHZhbGlkLmZyb20gPSBnZXRWYWxpZFZhbHVlKHZhbHVlcywgdmFsdWVzLmZyb20sIG9yaWdpbmFsQ1NTKTtcbiAgICAgIHZhbGlkLnRvID0gZ2V0VmFsaWRWYWx1ZSh2YWx1ZXMsIHZhbHVlcy50bywgb3JpZ2luYWxDU1MpO1xuICAgIH1cbiAgICByZXR1cm4geyBmcm9tOiBkZWNvbXBvc2VWYWx1ZSh2YWxpZC5mcm9tKSwgdG86IGRlY29tcG9zZVZhbHVlKHZhbGlkLnRvKSB9O1xuICB9XG5cbiAgdmFyIGdldFR3ZWVuc1Byb3BzID0gZnVuY3Rpb24oYW5pbWF0YWJsZXMsIHByb3BzKSB7XG4gICAgdmFyIHR3ZWVuc1Byb3BzID0gW107XG4gICAgYW5pbWF0YWJsZXMuZm9yRWFjaChmdW5jdGlvbihhbmltYXRhYmxlLCBpKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gYW5pbWF0YWJsZS50YXJnZXQ7XG4gICAgICByZXR1cm4gcHJvcHMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgIHZhciBhbmltVHlwZSA9IGdldEFuaW1hdGlvblR5cGUodGFyZ2V0LCBwcm9wLm5hbWUpO1xuICAgICAgICBpZiAoYW5pbVR5cGUpIHtcbiAgICAgICAgICB2YXIgdmFsdWVzID0gZ2V0UHJvcGVydGllc1ZhbHVlcyh0YXJnZXQsIHByb3AubmFtZSwgcHJvcC52YWx1ZSwgaSk7XG4gICAgICAgICAgdmFyIHR3ZWVuID0gY2xvbmVPYmplY3QocHJvcCk7XG4gICAgICAgICAgdHdlZW4uYW5pbWF0YWJsZXMgPSBhbmltYXRhYmxlO1xuICAgICAgICAgIHR3ZWVuLnR5cGUgPSBhbmltVHlwZTtcbiAgICAgICAgICB0d2Vlbi5mcm9tID0gZ2V0VHdlZW5WYWx1ZXMocHJvcC5uYW1lLCB2YWx1ZXMsIHR3ZWVuLnR5cGUsIHRhcmdldCkuZnJvbTtcbiAgICAgICAgICB0d2Vlbi50byA9IGdldFR3ZWVuVmFsdWVzKHByb3AubmFtZSwgdmFsdWVzLCB0d2Vlbi50eXBlLCB0YXJnZXQpLnRvO1xuICAgICAgICAgIHR3ZWVuLnJvdW5kID0gKGlzLmNvbCh2YWx1ZXMuZnJvbSkgfHwgdHdlZW4ucm91bmQpID8gMSA6IDA7XG4gICAgICAgICAgdHdlZW4uZGVsYXkgPSAoaXMuZm5jKHR3ZWVuLmRlbGF5KSA/IHR3ZWVuLmRlbGF5KHRhcmdldCwgaSwgYW5pbWF0YWJsZXMubGVuZ3RoKSA6IHR3ZWVuLmRlbGF5KSAvIGFuaW1hdGlvbi5zcGVlZDtcbiAgICAgICAgICB0d2Vlbi5kdXJhdGlvbiA9IChpcy5mbmModHdlZW4uZHVyYXRpb24pID8gdHdlZW4uZHVyYXRpb24odGFyZ2V0LCBpLCBhbmltYXRhYmxlcy5sZW5ndGgpIDogdHdlZW4uZHVyYXRpb24pIC8gYW5pbWF0aW9uLnNwZWVkO1xuICAgICAgICAgIHR3ZWVuc1Byb3BzLnB1c2godHdlZW4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdHdlZW5zUHJvcHM7XG4gIH1cblxuICB2YXIgZ2V0VHdlZW5zID0gZnVuY3Rpb24oYW5pbWF0YWJsZXMsIHByb3BzKSB7XG4gICAgdmFyIHR3ZWVuc1Byb3BzID0gZ2V0VHdlZW5zUHJvcHMoYW5pbWF0YWJsZXMsIHByb3BzKTtcbiAgICB2YXIgc3BsaXR0ZWRQcm9wcyA9IGdyb3VwQXJyYXlCeVByb3BzKHR3ZWVuc1Byb3BzLCBbJ25hbWUnLCAnZnJvbScsICd0bycsICdkZWxheScsICdkdXJhdGlvbiddKTtcbiAgICByZXR1cm4gc3BsaXR0ZWRQcm9wcy5tYXAoZnVuY3Rpb24odHdlZW5Qcm9wcykge1xuICAgICAgdmFyIHR3ZWVuID0gY2xvbmVPYmplY3QodHdlZW5Qcm9wc1swXSk7XG4gICAgICB0d2Vlbi5hbmltYXRhYmxlcyA9IHR3ZWVuUHJvcHMubWFwKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAuYW5pbWF0YWJsZXMgfSk7XG4gICAgICB0d2Vlbi50b3RhbER1cmF0aW9uID0gdHdlZW4uZGVsYXkgKyB0d2Vlbi5kdXJhdGlvbjtcbiAgICAgIHJldHVybiB0d2VlbjtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZXZlcnNlVHdlZW5zID0gZnVuY3Rpb24oYW5pbSwgZGVsYXlzKSB7XG4gICAgYW5pbS50d2VlbnMuZm9yRWFjaChmdW5jdGlvbih0d2Vlbikge1xuICAgICAgdmFyIHRvVmFsID0gdHdlZW4udG87XG4gICAgICB2YXIgZnJvbVZhbCA9IHR3ZWVuLmZyb207XG4gICAgICB2YXIgZGVsYXlWYWwgPSBhbmltLmR1cmF0aW9uIC0gKHR3ZWVuLmRlbGF5ICsgdHdlZW4uZHVyYXRpb24pO1xuICAgICAgdHdlZW4uZnJvbSA9IHRvVmFsO1xuICAgICAgdHdlZW4udG8gPSBmcm9tVmFsO1xuICAgICAgaWYgKGRlbGF5cykgdHdlZW4uZGVsYXkgPSBkZWxheVZhbDtcbiAgICB9KTtcbiAgICBhbmltLnJldmVyc2VkID0gYW5pbS5yZXZlcnNlZCA/IGZhbHNlIDogdHJ1ZTtcbiAgfVxuXG4gIHZhciBnZXRUd2VlbnNEdXJhdGlvbiA9IGZ1bmN0aW9uKHR3ZWVucykge1xuICAgIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCB0d2VlbnMubWFwKGZ1bmN0aW9uKHR3ZWVuKXsgcmV0dXJuIHR3ZWVuLnRvdGFsRHVyYXRpb247IH0pKTtcbiAgfVxuXG4gIHZhciBnZXRUd2VlbnNEZWxheSA9IGZ1bmN0aW9uKHR3ZWVucykge1xuICAgIHJldHVybiBNYXRoLm1pbi5hcHBseShNYXRoLCB0d2VlbnMubWFwKGZ1bmN0aW9uKHR3ZWVuKXsgcmV0dXJuIHR3ZWVuLmRlbGF5OyB9KSk7XG4gIH1cblxuICAvLyB3aWxsLWNoYW5nZVxuXG4gIHZhciBnZXRXaWxsQ2hhbmdlID0gZnVuY3Rpb24oYW5pbSkge1xuICAgIHZhciBwcm9wcyA9IFtdO1xuICAgIHZhciBlbHMgPSBbXTtcbiAgICBhbmltLnR3ZWVucy5mb3JFYWNoKGZ1bmN0aW9uKHR3ZWVuKSB7XG4gICAgICBpZiAodHdlZW4udHlwZSA9PT0gJ2NzcycgfHwgdHdlZW4udHlwZSA9PT0gJ3RyYW5zZm9ybScgKSB7XG4gICAgICAgIHByb3BzLnB1c2godHdlZW4udHlwZSA9PT0gJ2NzcycgPyBzdHJpbmdUb0h5cGhlbnModHdlZW4ubmFtZSkgOiAndHJhbnNmb3JtJyk7XG4gICAgICAgIHR3ZWVuLmFuaW1hdGFibGVzLmZvckVhY2goZnVuY3Rpb24oYW5pbWF0YWJsZSkgeyBlbHMucHVzaChhbmltYXRhYmxlLnRhcmdldCk7IH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBwcm9wZXJ0aWVzOiByZW1vdmVBcnJheUR1cGxpY2F0ZXMocHJvcHMpLmpvaW4oJywgJyksXG4gICAgICBlbGVtZW50czogcmVtb3ZlQXJyYXlEdXBsaWNhdGVzKGVscylcbiAgICB9XG4gIH1cblxuICB2YXIgc2V0V2lsbENoYW5nZSA9IGZ1bmN0aW9uKGFuaW0pIHtcbiAgICB2YXIgd2lsbENoYW5nZSA9IGdldFdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgd2lsbENoYW5nZS5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIGVsZW1lbnQuc3R5bGUud2lsbENoYW5nZSA9IHdpbGxDaGFuZ2UucHJvcGVydGllcztcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZW1vdmVXaWxsQ2hhbmdlID0gZnVuY3Rpb24oYW5pbSkge1xuICAgIHZhciB3aWxsQ2hhbmdlID0gZ2V0V2lsbENoYW5nZShhbmltKTtcbiAgICB3aWxsQ2hhbmdlLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgZWxlbWVudC5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnd2lsbC1jaGFuZ2UnKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIFN2ZyBwYXRoICovXG5cbiAgdmFyIGdldFBhdGhQcm9wcyA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICB2YXIgZWwgPSBpcy5zdHIocGF0aCkgPyBzZWxlY3RTdHJpbmcocGF0aClbMF0gOiBwYXRoO1xuICAgIHJldHVybiB7XG4gICAgICBwYXRoOiBlbCxcbiAgICAgIHZhbHVlOiBlbC5nZXRUb3RhbExlbmd0aCgpXG4gICAgfVxuICB9XG5cbiAgdmFyIHNuYXBQcm9ncmVzc1RvUGF0aCA9IGZ1bmN0aW9uKHR3ZWVuLCBwcm9ncmVzcykge1xuICAgIHZhciBwYXRoRWwgPSB0d2Vlbi5wYXRoO1xuICAgIHZhciBwYXRoUHJvZ3Jlc3MgPSB0d2Vlbi52YWx1ZSAqIHByb2dyZXNzO1xuICAgIHZhciBwb2ludCA9IGZ1bmN0aW9uKG9mZnNldCkge1xuICAgICAgdmFyIG8gPSBvZmZzZXQgfHwgMDtcbiAgICAgIHZhciBwID0gcHJvZ3Jlc3MgPiAxID8gdHdlZW4udmFsdWUgKyBvIDogcGF0aFByb2dyZXNzICsgbztcbiAgICAgIHJldHVybiBwYXRoRWwuZ2V0UG9pbnRBdExlbmd0aChwKTtcbiAgICB9XG4gICAgdmFyIHAgPSBwb2ludCgpO1xuICAgIHZhciBwMCA9IHBvaW50KC0xKTtcbiAgICB2YXIgcDEgPSBwb2ludCgrMSk7XG4gICAgc3dpdGNoICh0d2Vlbi5uYW1lKSB7XG4gICAgICBjYXNlICd0cmFuc2xhdGVYJzogcmV0dXJuIHAueDtcbiAgICAgIGNhc2UgJ3RyYW5zbGF0ZVknOiByZXR1cm4gcC55O1xuICAgICAgY2FzZSAncm90YXRlJzogcmV0dXJuIE1hdGguYXRhbjIocDEueSAtIHAwLnksIHAxLnggLSBwMC54KSAqIDE4MCAvIE1hdGguUEk7XG4gICAgfVxuICB9XG5cbiAgLy8gUHJvZ3Jlc3NcblxuICB2YXIgZ2V0VHdlZW5Qcm9ncmVzcyA9IGZ1bmN0aW9uKHR3ZWVuLCB0aW1lKSB7XG4gICAgdmFyIGVsYXBzZWQgPSBNYXRoLm1pbihNYXRoLm1heCh0aW1lIC0gdHdlZW4uZGVsYXksIDApLCB0d2Vlbi5kdXJhdGlvbik7XG4gICAgdmFyIHBlcmNlbnQgPSBlbGFwc2VkIC8gdHdlZW4uZHVyYXRpb247XG4gICAgdmFyIHByb2dyZXNzID0gdHdlZW4udG8ubnVtYmVycy5tYXAoZnVuY3Rpb24obnVtYmVyLCBwKSB7XG4gICAgICB2YXIgc3RhcnQgPSB0d2Vlbi5mcm9tLm51bWJlcnNbcF07XG4gICAgICB2YXIgZWFzZWQgPSBlYXNpbmdzW3R3ZWVuLmVhc2luZ10ocGVyY2VudCwgdHdlZW4uZWxhc3RpY2l0eSk7XG4gICAgICB2YXIgdmFsID0gdHdlZW4ucGF0aCA/IHNuYXBQcm9ncmVzc1RvUGF0aCh0d2VlbiwgZWFzZWQpIDogc3RhcnQgKyBlYXNlZCAqIChudW1iZXIgLSBzdGFydCk7XG4gICAgICB2YWwgPSB0d2Vlbi5yb3VuZCA/IE1hdGgucm91bmQodmFsICogdHdlZW4ucm91bmQpIC8gdHdlZW4ucm91bmQgOiB2YWw7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH0pO1xuICAgIHJldHVybiByZWNvbXBvc2VWYWx1ZShwcm9ncmVzcywgdHdlZW4udG8uc3RyaW5ncywgdHdlZW4uZnJvbS5zdHJpbmdzKTtcbiAgfVxuXG4gIHZhciBzZXRBbmltYXRpb25Qcm9ncmVzcyA9IGZ1bmN0aW9uKGFuaW0sIHRpbWUpIHtcbiAgICB2YXIgdHJhbnNmb3JtcztcbiAgICBhbmltLmN1cnJlbnRUaW1lID0gdGltZTtcbiAgICBhbmltLnByb2dyZXNzID0gKHRpbWUgLyBhbmltLmR1cmF0aW9uKSAqIDEwMDtcbiAgICBmb3IgKHZhciB0ID0gMDsgdCA8IGFuaW0udHdlZW5zLmxlbmd0aDsgdCsrKSB7XG4gICAgICB2YXIgdHdlZW4gPSBhbmltLnR3ZWVuc1t0XTtcbiAgICAgIHR3ZWVuLmN1cnJlbnRWYWx1ZSA9IGdldFR3ZWVuUHJvZ3Jlc3ModHdlZW4sIHRpbWUpO1xuICAgICAgdmFyIHByb2dyZXNzID0gdHdlZW4uY3VycmVudFZhbHVlO1xuICAgICAgZm9yICh2YXIgYSA9IDA7IGEgPCB0d2Vlbi5hbmltYXRhYmxlcy5sZW5ndGg7IGErKykge1xuICAgICAgICB2YXIgYW5pbWF0YWJsZSA9IHR3ZWVuLmFuaW1hdGFibGVzW2FdO1xuICAgICAgICB2YXIgaWQgPSBhbmltYXRhYmxlLmlkO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gYW5pbWF0YWJsZS50YXJnZXQ7XG4gICAgICAgIHZhciBuYW1lID0gdHdlZW4ubmFtZTtcbiAgICAgICAgc3dpdGNoICh0d2Vlbi50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnY3NzJzogdGFyZ2V0LnN0eWxlW25hbWVdID0gcHJvZ3Jlc3M7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2F0dHJpYnV0ZSc6IHRhcmdldC5zZXRBdHRyaWJ1dGUobmFtZSwgcHJvZ3Jlc3MpOyBicmVhaztcbiAgICAgICAgICBjYXNlICdvYmplY3QnOiB0YXJnZXRbbmFtZV0gPSBwcm9ncmVzczsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndHJhbnNmb3JtJzpcbiAgICAgICAgICBpZiAoIXRyYW5zZm9ybXMpIHRyYW5zZm9ybXMgPSB7fTtcbiAgICAgICAgICBpZiAoIXRyYW5zZm9ybXNbaWRdKSB0cmFuc2Zvcm1zW2lkXSA9IFtdO1xuICAgICAgICAgIHRyYW5zZm9ybXNbaWRdLnB1c2gocHJvZ3Jlc3MpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0cmFuc2Zvcm1zKSB7XG4gICAgICBpZiAoIXRyYW5zZm9ybSkgdHJhbnNmb3JtID0gKGdldENTU1ZhbHVlKGRvY3VtZW50LmJvZHksIHRyYW5zZm9ybVN0cikgPyAnJyA6ICctd2Via2l0LScpICsgdHJhbnNmb3JtU3RyO1xuICAgICAgZm9yICh2YXIgdCBpbiB0cmFuc2Zvcm1zKSB7XG4gICAgICAgIGFuaW0uYW5pbWF0YWJsZXNbdF0udGFyZ2V0LnN0eWxlW3RyYW5zZm9ybV0gPSB0cmFuc2Zvcm1zW3RdLmpvaW4oJyAnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBBbmltYXRpb25cblxuICB2YXIgY3JlYXRlQW5pbWF0aW9uID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgdmFyIGFuaW0gPSB7fTtcbiAgICBhbmltLmFuaW1hdGFibGVzID0gZ2V0QW5pbWF0YWJsZXMocGFyYW1zLnRhcmdldHMpO1xuICAgIGFuaW0uc2V0dGluZ3MgPSBtZXJnZU9iamVjdHMocGFyYW1zLCBkZWZhdWx0U2V0dGluZ3MpO1xuICAgIGFuaW0ucHJvcGVydGllcyA9IGdldFByb3BlcnRpZXMocGFyYW1zLCBhbmltLnNldHRpbmdzKTtcbiAgICBhbmltLnR3ZWVucyA9IGdldFR3ZWVucyhhbmltLmFuaW1hdGFibGVzLCBhbmltLnByb3BlcnRpZXMpO1xuICAgIGFuaW0uZHVyYXRpb24gPSBhbmltLnR3ZWVucy5sZW5ndGggPyBnZXRUd2VlbnNEdXJhdGlvbihhbmltLnR3ZWVucykgOiBwYXJhbXMuZHVyYXRpb247XG4gICAgYW5pbS5kZWxheSA9IGFuaW0udHdlZW5zLmxlbmd0aCA/IGdldFR3ZWVuc0RlbGF5KGFuaW0udHdlZW5zKSA6IHBhcmFtcy5kZWxheTtcbiAgICBhbmltLmN1cnJlbnRUaW1lID0gMDtcbiAgICBhbmltLnByb2dyZXNzID0gMDtcbiAgICBhbmltLmVuZGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIGFuaW07XG4gIH1cblxuICAvLyBQdWJsaWNcblxuICB2YXIgYW5pbWF0aW9ucyA9IFtdO1xuICB2YXIgcmFmID0gMDtcblxuICB2YXIgZW5naW5lID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBwbGF5ID0gZnVuY3Rpb24oKSB7IHJhZiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTsgfTtcbiAgICB2YXIgc3RlcCA9IGZ1bmN0aW9uKHQpIHtcbiAgICAgIGlmIChhbmltYXRpb25zLmxlbmd0aCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuaW1hdGlvbnMubGVuZ3RoOyBpKyspIGFuaW1hdGlvbnNbaV0udGljayh0KTtcbiAgICAgICAgcGxheSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUocmFmKTtcbiAgICAgICAgcmFmID0gMDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBsYXk7XG4gIH0pKCk7XG5cbiAgdmFyIGFuaW1hdGlvbiA9IGZ1bmN0aW9uKHBhcmFtcykge1xuXG4gICAgdmFyIGFuaW0gPSBjcmVhdGVBbmltYXRpb24ocGFyYW1zKTtcbiAgICB2YXIgdGltZSA9IHt9O1xuXG4gICAgYW5pbS50aWNrID0gZnVuY3Rpb24obm93KSB7XG4gICAgICBhbmltLmVuZGVkID0gZmFsc2U7XG4gICAgICBpZiAoIXRpbWUuc3RhcnQpIHRpbWUuc3RhcnQgPSBub3c7XG4gICAgICB0aW1lLmN1cnJlbnQgPSBNYXRoLm1pbihNYXRoLm1heCh0aW1lLmxhc3QgKyBub3cgLSB0aW1lLnN0YXJ0LCAwKSwgYW5pbS5kdXJhdGlvbik7XG4gICAgICBzZXRBbmltYXRpb25Qcm9ncmVzcyhhbmltLCB0aW1lLmN1cnJlbnQpO1xuICAgICAgdmFyIHMgPSBhbmltLnNldHRpbmdzO1xuICAgICAgaWYgKHRpbWUuY3VycmVudCA+PSBhbmltLmRlbGF5KSB7XG4gICAgICAgIGlmIChzLmJlZ2luKSBzLmJlZ2luKGFuaW0pOyBzLmJlZ2luID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAocy51cGRhdGUpIHMudXBkYXRlKGFuaW0pO1xuICAgICAgfVxuICAgICAgaWYgKHRpbWUuY3VycmVudCA+PSBhbmltLmR1cmF0aW9uKSB7XG4gICAgICAgIGlmIChzLmxvb3ApIHtcbiAgICAgICAgICB0aW1lLnN0YXJ0ID0gbm93O1xuICAgICAgICAgIGlmIChzLmRpcmVjdGlvbiA9PT0gJ2FsdGVybmF0ZScpIHJldmVyc2VUd2VlbnMoYW5pbSwgdHJ1ZSk7XG4gICAgICAgICAgaWYgKGlzLm51bShzLmxvb3ApKSBzLmxvb3AtLTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhbmltLmVuZGVkID0gdHJ1ZTtcbiAgICAgICAgICBhbmltLnBhdXNlKCk7XG4gICAgICAgICAgaWYgKHMuY29tcGxldGUpIHMuY29tcGxldGUoYW5pbSk7XG4gICAgICAgIH1cbiAgICAgICAgdGltZS5sYXN0ID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhbmltLnNlZWsgPSBmdW5jdGlvbihwcm9ncmVzcykge1xuICAgICAgc2V0QW5pbWF0aW9uUHJvZ3Jlc3MoYW5pbSwgKHByb2dyZXNzIC8gMTAwKSAqIGFuaW0uZHVyYXRpb24pO1xuICAgIH1cblxuICAgIGFuaW0ucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlbW92ZVdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgICB2YXIgaSA9IGFuaW1hdGlvbnMuaW5kZXhPZihhbmltKTtcbiAgICAgIGlmIChpID4gLTEpIGFuaW1hdGlvbnMuc3BsaWNlKGksIDEpO1xuICAgIH1cblxuICAgIGFuaW0ucGxheSA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgYW5pbS5wYXVzZSgpO1xuICAgICAgaWYgKHBhcmFtcykgYW5pbSA9IG1lcmdlT2JqZWN0cyhjcmVhdGVBbmltYXRpb24obWVyZ2VPYmplY3RzKHBhcmFtcywgYW5pbS5zZXR0aW5ncykpLCBhbmltKTtcbiAgICAgIHRpbWUuc3RhcnQgPSAwO1xuICAgICAgdGltZS5sYXN0ID0gYW5pbS5lbmRlZCA/IDAgOiBhbmltLmN1cnJlbnRUaW1lO1xuICAgICAgdmFyIHMgPSBhbmltLnNldHRpbmdzO1xuICAgICAgaWYgKHMuZGlyZWN0aW9uID09PSAncmV2ZXJzZScpIHJldmVyc2VUd2VlbnMoYW5pbSk7XG4gICAgICBpZiAocy5kaXJlY3Rpb24gPT09ICdhbHRlcm5hdGUnICYmICFzLmxvb3ApIHMubG9vcCA9IDE7XG4gICAgICBzZXRXaWxsQ2hhbmdlKGFuaW0pO1xuICAgICAgYW5pbWF0aW9ucy5wdXNoKGFuaW0pO1xuICAgICAgaWYgKCFyYWYpIGVuZ2luZSgpO1xuICAgIH1cblxuICAgIGFuaW0ucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGFuaW0ucmV2ZXJzZWQpIHJldmVyc2VUd2VlbnMoYW5pbSk7XG4gICAgICBhbmltLnBhdXNlKCk7XG4gICAgICBhbmltLnNlZWsoMCk7XG4gICAgICBhbmltLnBsYXkoKTtcbiAgICB9XG5cbiAgICBpZiAoYW5pbS5zZXR0aW5ncy5hdXRvcGxheSkgYW5pbS5wbGF5KCk7XG5cbiAgICByZXR1cm4gYW5pbTtcblxuICB9XG5cbiAgLy8gUmVtb3ZlIG9uZSBvciBtdWx0aXBsZSB0YXJnZXRzIGZyb20gYWxsIGFjdGl2ZSBhbmltYXRpb25zLlxuXG4gIHZhciByZW1vdmUgPSBmdW5jdGlvbihlbGVtZW50cykge1xuICAgIHZhciB0YXJnZXRzID0gZmxhdHRlbkFycmF5KGlzLmFycihlbGVtZW50cykgPyBlbGVtZW50cy5tYXAodG9BcnJheSkgOiB0b0FycmF5KGVsZW1lbnRzKSk7XG4gICAgZm9yICh2YXIgaSA9IGFuaW1hdGlvbnMubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgYW5pbWF0aW9uID0gYW5pbWF0aW9uc1tpXTtcbiAgICAgIHZhciB0d2VlbnMgPSBhbmltYXRpb24udHdlZW5zO1xuICAgICAgZm9yICh2YXIgdCA9IHR3ZWVucy5sZW5ndGgtMTsgdCA+PSAwOyB0LS0pIHtcbiAgICAgICAgdmFyIGFuaW1hdGFibGVzID0gdHdlZW5zW3RdLmFuaW1hdGFibGVzO1xuICAgICAgICBmb3IgKHZhciBhID0gYW5pbWF0YWJsZXMubGVuZ3RoLTE7IGEgPj0gMDsgYS0tKSB7XG4gICAgICAgICAgaWYgKGFycmF5Q29udGFpbnModGFyZ2V0cywgYW5pbWF0YWJsZXNbYV0udGFyZ2V0KSkge1xuICAgICAgICAgICAgYW5pbWF0YWJsZXMuc3BsaWNlKGEsIDEpO1xuICAgICAgICAgICAgaWYgKCFhbmltYXRhYmxlcy5sZW5ndGgpIHR3ZWVucy5zcGxpY2UodCwgMSk7XG4gICAgICAgICAgICBpZiAoIXR3ZWVucy5sZW5ndGgpIGFuaW1hdGlvbi5wYXVzZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFuaW1hdGlvbi52ZXJzaW9uID0gdmVyc2lvbjtcbiAgYW5pbWF0aW9uLnNwZWVkID0gMTtcbiAgYW5pbWF0aW9uLmxpc3QgPSBhbmltYXRpb25zO1xuICBhbmltYXRpb24ucmVtb3ZlID0gcmVtb3ZlO1xuICBhbmltYXRpb24uZWFzaW5ncyA9IGVhc2luZ3M7XG4gIGFuaW1hdGlvbi5nZXRWYWx1ZSA9IGdldEluaXRpYWxUYXJnZXRWYWx1ZTtcbiAgYW5pbWF0aW9uLnBhdGggPSBnZXRQYXRoUHJvcHM7XG4gIGFuaW1hdGlvbi5yYW5kb20gPSByYW5kb207XG5cbiAgcmV0dXJuIGFuaW1hdGlvbjtcblxufSkpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FuaW1lanMvYW5pbWUuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyogZ2xvYmFsIEFGUkFNRSAqL1xyXG5cInVzZSBzdHJpY3RcIjtcblxyXG5pZiAodHlwZW9mIEFGUkFNRSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xyXG59XHJcblxyXG4vKipcclxuICogR2FtZSBsb2dpYyBmb3IgY29udHJvbGxpbmcgYS1mcmFtZSBhY3Rpb25zIHN1Y2ggYXMgdGVsZXBvcnQgYW5kIHNhdmVcclxuICovXHJcbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnYWN0aW9uLWNvbnRyb2xzJywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgbWVudUlEOiB7dHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdDogXCJtZW51XCJ9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGlmIGNvbXBvbmVudCBuZWVkcyBtdWx0aXBsZSBpbnN0YW5jaW5nLlxyXG4gICAqL1xyXG4gIG11bHRpcGxlOiBmYWxzZSxcclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGV2ZW50IGxpc3RlbmVycy5cclxuICAgKi9cclxuICBhZGRFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gZ2V0IG1lbnUgZWxlbWVudCBhc3NvY2lhdGVkIHdpdGggdGhlc2UgY29udHJvbHNcclxuICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEubWVudUlEKTtcclxuICAgIG1lbnVFbC5hZGRFdmVudExpc3RlbmVyKCdtZW51Q2hhbmdlZCcsIHRoaXMub25BY3Rpb25DaGFuZ2UuYmluZCh0aGlzKSk7XHJcbiAgICBtZW51RWwuYWRkRXZlbnRMaXN0ZW5lcignbWVudVNlbGVjdGVkJywgdGhpcy5vbkFjdGlvblNlbGVjdC5iaW5kKHRoaXMpKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxyXG4gICAqL1xyXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLm1lbnVJRCk7XHJcbiAgICBtZW51RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVudUNoYW5nZWQnLCB0aGlzLm9uQWN0aW9uQ2hhbmdlKTtcclxuICAgIC8vIG1lbnVFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtZW51U2VsZWN0ZWQnLCB0aGlzLm9uUGxhY2VPYmplY3QpO1xyXG4gIH0sXHJcblxyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnNvbGUubG9nKHRoaXMuZGF0YS5tZW51SUQpO1xyXG4gICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5tZW51SUQpO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiYWN0aW9uLWNvbnRyb2xzOiBtZW51IGVsZW1lbnQ6IFwiICsgbWVudUVsKTtcclxuICAgIC8vIGdldCBjdXJyZW50bHkgc2VsZWN0ZWQgYWN0aW9uXHJcbiAgICB2YXIgb3B0aW9uVmFsdWUgPSBtZW51RWwuY29tcG9uZW50c1snc2VsZWN0LWJhciddLnNlbGVjdGVkT3B0aW9uVmFsdWU7XHJcbiAgICBjb25zb2xlLmxvZyhcIm9wdGlvblZhbHVlXCIgKyBvcHRpb25WYWx1ZSk7XHJcbiAgICBjb25zb2xlLmxvZyhvcHRpb25WYWx1ZSk7XHJcblxyXG4gICAgLy8gZG8gdGhlIHRoaW5nIGFzc29jaWF0ZWQgd2l0aCB0aGUgYWN0aW9uXHJcbiAgICB0aGlzLmhhbmRsZUFjdGlvblN0YXJ0KG9wdGlvblZhbHVlKTtcclxuICB9LFxyXG5cclxuICBvbkFjdGlvblNlbGVjdDogZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gd2hhdCBpcyB0aGUgYWN0aW9uXHJcbiAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLm1lbnVJRCk7XHJcblxyXG4gICAgLy8gZ2V0IGN1cnJlbnRseSBzZWxlY3RlZCBhY3Rpb25cclxuICAgIHZhciBvcHRpb25WYWx1ZSA9IG1lbnVFbC5jb21wb25lbnRzWydzZWxlY3QtYmFyJ10uc2VsZWN0ZWRPcHRpb25WYWx1ZTtcclxuICAgIGNvbnNvbGUubG9nKFwib25BY3Rpb25TZWxlY3QgdHJpZ2dlcmVkXFxuY3VycmVudCBvcHRpb25WYWx1ZTpcXG5cIik7XHJcbiAgICBjb25zb2xlLmxvZyhvcHRpb25WYWx1ZSk7XHJcbiAgICAvLyBjYWxsIHRoZSB0aGluZyB0aGF0IGRvZXMgaXRcclxuICB9LFxyXG5cclxuICBvbkFjdGlvbkNoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gdW5kbyBvbGQgb25lXHJcbiAgICB0aGlzLmhhbmRsZUFjdGlvbkVuZCh0aGlzLnByZXZpb3VzQWN0aW9uKTtcclxuXHJcbiAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLm1lbnVJRCk7XHJcbiAgICAvLyBnZXQgY3VycmVudGx5IHNlbGVjdGVkIGFjdGlvblxyXG4gICAgdmFyIG9wdGlvblZhbHVlID0gbWVudUVsLmNvbXBvbmVudHNbJ3NlbGVjdC1iYXInXS5zZWxlY3RlZE9wdGlvblZhbHVlO1xyXG4gICAgY29uc29sZS5sb2coXCJuZXcgb3B0aW9uVmFsdWU6IFwiICsgb3B0aW9uVmFsdWUpO1xyXG4gICAgY29uc29sZS5sb2cob3B0aW9uVmFsdWUpO1xyXG4gICAgLy8gZG8gbmV3IG9uZVxyXG4gICAgdGhpcy5oYW5kbGVBY3Rpb25TdGFydChvcHRpb25WYWx1ZSk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gZW50aXR5IHJlc3VtZXMuXHJcbiAgICogVXNlIHRvIGNvbnRpbnVlIG9yIGFkZCBhbnkgZHluYW1pYyBvciBiYWNrZ3JvdW5kIGJlaGF2aW9yIHN1Y2ggYXMgZXZlbnRzLlxyXG4gICAqL1xyXG4gIHBsYXk6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBlbnRpdHkgcGF1c2VzLlxyXG4gICAqIFVzZSB0byBzdG9wIG9yIHJlbW92ZSBhbnkgZHluYW1pYyBvciBiYWNrZ3JvdW5kIGJlaGF2aW9yIHN1Y2ggYXMgZXZlbnRzLlxyXG4gICAqL1xyXG4gIHBhdXNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gYSBjb21wb25lbnQgaXMgcmVtb3ZlZCAoZS5nLiwgdmlhIHJlbW92ZUF0dHJpYnV0ZSkuXHJcbiAgICogR2VuZXJhbGx5IHVuZG9lcyBhbGwgbW9kaWZpY2F0aW9ucyB0byB0aGUgZW50aXR5LlxyXG4gICAqL1xyXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIGhhbmRsZUFjdGlvblN0YXJ0OiBmdW5jdGlvbihvcHRpb25WYWx1ZSkge1xyXG4gICAgdGhpcy5wcmV2aW91c0FjdGlvbiA9IG9wdGlvblZhbHVlO1xyXG5cclxuICAgIC8vIGZvciBnaXZlbiBvcHRpb25WYWx1ZSwgZG8gc29tZXRoaW5nXHJcbiAgICBzd2l0Y2ggKG9wdGlvblZhbHVlKSB7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOiAgICAgICAgLy8gYWRkIHRlbGVwb3J0IGNvbXBvbmVudCB0byB0aGUgY29udHJvbCBlbGVtZW50IHRoYXQgaXMgdGhlIHBhcmVudCBvZiB0aGlzIG1lbnVcclxuICAgICAgICBjb25zb2xlLmxvZyhcInRlbGVwb3J0U3RhcnRcIik7XHJcbiAgICAgICAgdmFyIGNvbnRyb2xFbCA9IHRoaXMuZWw7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJjb250cm9sRWw6XCIpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGNvbnRyb2xFbCk7XHJcbiAgICAgICAgLy8gQWRkIGF0dHJpYnV0ZSBmcm9tIHRoaXMgaHRtbDogdGVsZXBvcnQtY29udHJvbHM9XCJidXR0b246IHRyaWdnZXI7IGNvbGxpc2lvbkVudGl0aWVzOiAjZ3JvdW5kXCJcclxuICAgICAgICBjb250cm9sRWwuc2V0QXR0cmlidXRlKFwidGVsZXBvcnQtY29udHJvbHNcIiwgXCJidXR0b246IHRyaWdnZXI7IGNvbGxpc2lvbkVudGl0aWVzOiAjZ3JvdW5kXCIpO1xyXG4gICAgICAgIHJldHVybjsgLy8gd2l0aG91dCB0aGlzIHJldHVybiB0aGUgb3RoZXIgY2FzZXMgYXJlIGZpcmVkIC0gd2VpcmQhXHJcbiAgICAgIGNhc2UgXCJzYXZlXCI6XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzYXZlU3RhcnRcIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICBjYXNlIFwic2F2ZUFzXCI6XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzYXZlQXNTdGFydFwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIGNhc2UgXCJuZXdcIjpcclxuICAgICAgICBjb25zb2xlLmxvZyhcIm5ld1N0YXJ0XCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBoYW5kbGVBY3Rpb25FbmQ6IGZ1bmN0aW9uKG9wdGlvblZhbHVlKSB7XHJcbiAgICAvLyBmb3IgZ2l2ZW4gb3B0aW9uVmFsdWUsIGRvIHNvbWV0aGluZ1xyXG4gICAgc3dpdGNoIChvcHRpb25WYWx1ZSkge1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjogICAgICAgIC8vIGFkZCB0ZWxlcG9ydCBjb21wb25lbnQgdG8gdGhlIGNvbnRyb2wgZWxlbWVudCB0aGF0IGlzIHRoZSBwYXJlbnQgb2YgdGhpcyBtZW51XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ0ZWxlcG9ydEVuZFwiKTtcclxuICAgICAgICBjb250cm9sRWwgPSB0aGlzLmVsO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiY29udHJvbEVsOlwiKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhjb250cm9sRWwpO1xyXG4gICAgICAgIC8vIEFkZCBhdHRyaWJ1dGUgZnJvbSB0aGlzIGh0bWw6IHRlbGVwb3J0LWNvbnRyb2xzPVwiYnV0dG9uOiB0cmlnZ2VyOyBjb2xsaXNpb25FbnRpdGllczogI2dyb3VuZFwiXHJcbiAgICAgICAgY29udHJvbEVsLnJlbW92ZUF0dHJpYnV0ZShcInRlbGVwb3J0LWNvbnRyb2xzXCIpO1xyXG4gICAgICAgIHJldHVybjsgLy8gd2l0aG91dCB0aGlzIHJldHVybiB0aGUgb3RoZXIgY2FzZXMgYXJlIGZpcmVkIC0gd2VpcmQhXHJcbiAgICAgIGNhc2UgXCJzYXZlXCI6XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzYXZlU3RhcnRcIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICBjYXNlIFwic2F2ZUFzXCI6XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzYXZlQXNTdGFydFwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIGNhc2UgXCJuZXdcIjpcclxuICAgICAgICBjb25zb2xlLmxvZyhcIm5ld1N0YXJ0XCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvYWN0aW9uLWNvbnRyb2xzLmpzIiwiLyogZ2xvYmFsIEFGUkFNRSAqL1xyXG5cclxuaWYgKHR5cGVvZiBBRlJBTUUgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgYXR0ZW1wdGVkIHRvIHJlZ2lzdGVyIGJlZm9yZSBBRlJBTUUgd2FzIGF2YWlsYWJsZS4nKTtcclxufVxyXG5cclxudmFyIG9iamVjdENvdW50ID0gMDsgLy8gc2NlbmUgc3RhcnRzIHdpdGggMCBpdGVtc1xyXG5cclxuZnVuY3Rpb24gaHVtYW5pemUoc3RyKSB7XHJcbiAgdmFyIGZyYWdzID0gc3RyLnNwbGl0KCdfJyk7XHJcbiAgdmFyIGk9MDtcclxuICBmb3IgKGk9MDsgaTxmcmFncy5sZW5ndGg7IGkrKykge1xyXG4gICAgZnJhZ3NbaV0gPSBmcmFnc1tpXS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGZyYWdzW2ldLnNsaWNlKDEpO1xyXG4gIH1cclxuICByZXR1cm4gZnJhZ3Muam9pbignICcpO1xyXG59XHJcblxyXG4vKipcclxuICogVml2ZSBDb250cm9sbGVyIFRlbXBsYXRlIGNvbXBvbmVudCBmb3IgQS1GcmFtZS5cclxuICogTW9kaWZlZCBmcm9tIEEtRnJhbWUgRG9taW5vZXMuXHJcbiAqL1xyXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2J1aWxkZXItY29udHJvbHMnLCB7XHJcbiAgc2NoZW1hOiB7XHJcbiAgICBtZW51SWQ6IHt0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0OiBcIm1lbnVcIn1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBTZXQgaWYgY29tcG9uZW50IG5lZWRzIG11bHRpcGxlIGluc3RhbmNpbmcuXHJcbiAgICovXHJcbiAgbXVsdGlwbGU6IGZhbHNlLFxyXG5cclxuICAvKipcclxuICAgKiBBZGQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gICAqL1xyXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xyXG4gICAgLy8gdGhpcyBpcyB0aGUgb25seSBjb250cm9sbGVyIGZ1bnRpb24gbm90IGNvdmVyZWQgYnkgc2VsZWN0IG1lbnUgY29tcG9uZW50XHJcbiAgICAvLyBBcHBsaWNhYmxlIHRvIGJvdGggVml2ZSBhbmQgT2N1bHVzIFRvdWNoIGNvbnRyb2xzXHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdncmlwZG93bicsIHRoaXMub25VbmRvLmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIHRoZSByZXN0IG9mIHRoZSBjb250cm9scyBhcmUgaGFuZGxlZCBieSB0aGUgbWVudSBlbGVtZW50XHJcbiAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLm1lbnVJZCk7XHJcbiAgICBtZW51RWwuYWRkRXZlbnRMaXN0ZW5lcignbWVudUNoYW5nZWQnLCB0aGlzLm9uT2JqZWN0Q2hhbmdlLmJpbmQodGhpcykpO1xyXG4gICAgbWVudUVsLmFkZEV2ZW50TGlzdGVuZXIoJ21lbnVTZWxlY3RlZCcsIHRoaXMub25QbGFjZU9iamVjdC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cclxuICAgKi9cclxuICByZW1vdmVFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGVsID0gdGhpcy5lbDtcclxuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2dyaXBkb3duJywgdGhpcy5vblVuZG8pO1xyXG5cclxuICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEubWVudUlkKTtcclxuICAgIG1lbnVFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtZW51Q2hhbmdlZCcsIHRoaXMub25PYmplY3RDaGFuZ2UpO1xyXG4gICAgbWVudUVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lbnVTZWxlY3RlZCcsIHRoaXMub25QbGFjZU9iamVjdCk7XHJcblxyXG4gIH0sXHJcblxyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gZ2V0IHRoZSBsaXN0IG9mIG9iamVjdCBncm91cCBqc29uIGRpcmVjdG9yaWVzIC0gd2hpY2gganNvbiBmaWxlcyBzaG91bGQgd2UgcmVhZD9cclxuICAgICAgLy8gZm9yIGVhY2ggZ3JvdXAsIGZldGNoIHRoZSBqc29uIGZpbGUgYW5kIHBvcHVsYXRlIHRoZSBvcHRncm91cCBhbmQgb3B0aW9uIGVsZW1lbnRzIGFzIGNoaWxkcmVuIG9mIHRoZSBhcHByb3ByaWF0ZSBtZW51IGVsZW1lbnRcclxuICAgICAgdmFyIGxpc3QgPSBbXCJrZmFycl9iYXNlc1wiLFxyXG4gICAgICAgICAgICAgIFwibW1tbV92ZWhcIixcclxuICAgICAgICAgICAgICBcIm1tbW1fYmxkXCIsXHJcbiAgICAgICAgICAgICAgXCJtbW1tX2NoclwiLFxyXG4gICAgICAgICAgICAgIFwibW1tbV9hbGllblwiLFxyXG4gICAgICAgICAgICAgIFwibW1tbV9zY2VuZVwiXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICB2YXIgZ3JvdXBKU09OQXJyYXkgPSBbXTtcclxuICAgICAgY29uc3QgbWVudUlkID0gdGhpcy5kYXRhLm1lbnVJZDtcclxuICAgICAgY29uc29sZS5sb2coXCJidWlsZGVyLWNvbnRyb2xzIG1lbnVJZDogXCIgKyBtZW51SWQpO1xyXG5cclxuICAgICAgLy8gVE9ETzogd3JhcCB0aGlzIGluIHByb21pc2UgYW5kIHRoZW4gcmVxdWVzdCBhZnJhbWUtc2VsZWN0LWJhciBjb21wb25lbnQgdG8gcmUtaW5pdCB3aGVuIGRvbmUgbG9hZGluZ1xyXG4gICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24gKGdyb3VwTmFtZSwgaW5kZXgpIHtcclxuICAgICAgICAvLyBleGNlbGxlbnQgcmVmZXJlbmNlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0phdmFTY3JpcHQvT2JqZWN0cy9KU09OXHJcbiAgICAgICAgdmFyIHJlcXVlc3RVUkwgPSAnYXNzZXRzLycgKyBncm91cE5hbWUgKyBcIi5qc29uXCI7XHJcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHJlcXVlc3RVUkwpO1xyXG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xyXG4gICAgICAgIHJlcXVlc3Quc2VuZCgpO1xyXG5cclxuICAgICAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyAvLyBmb3IgZWFjaCBncm91cGxpc3QganNvbiBmaWxlIHdoZW4gbG9hZGVkXHJcbiAgICAgICAgICBncm91cEpTT05BcnJheVtncm91cE5hbWVdID0gcmVxdWVzdC5yZXNwb25zZTtcclxuICAgICAgICAgIC8vIGxpdGVyYWxseSBhZGQgdGhpcyBzaGl0IHRvIHRoZSBkb20gZHVkZVxyXG4gICAgICAgICAgLy8gY29uc29sZS5sb2coZ3JvdXBKU09OQXJyYXlbZ3JvdXBOYW1lXSk7XHJcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImdyb3VwTmFtZTogXCIgKyBncm91cE5hbWUpO1xyXG5cclxuICAgICAgICAgIC8vIGZpbmQgdGhlIG9wdGdyb3VwIHBhcmVudCBlbGVtZW50IC0gdGhlIG1lbnUgb3B0aW9uP1xyXG4gICAgICAgICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG1lbnVJZCk7XHJcblxyXG4gICAgICAgICAgLy8gYWRkIHRoZSBwYXJlbnQgb3B0Z3JvdXAgbm9kZSBsaWtlOiA8b3B0Z3JvdXAgbGFiZWw9XCJBbGllbnNcIiB2YWx1ZT1cIm1tbW1fYWxpZW5cIj5cclxuICAgICAgICAgIHZhciBuZXdPcHRncm91cEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGdyb3VwXCIpO1xyXG4gICAgICAgICAgbmV3T3B0Z3JvdXBFbC5zZXRBdHRyaWJ1dGUoXCJsYWJlbFwiLCBodW1hbml6ZShncm91cE5hbWUpKTsgLy8gVE9ETzogdGhpcyBzaG91bGQgYmUgYSBwcmV0dGllciBsYWJlbCwgbm90IHRoZSBmaWxlbmFtZVxyXG4gICAgICAgICAgbmV3T3B0Z3JvdXBFbC5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBncm91cE5hbWUpO1xyXG5cclxuICAgICAgICAgIC8vIGNyZWF0ZSBlYWNoIGNoaWxkXHJcbiAgICAgICAgICB2YXIgb3B0aW9uc0hUTUwgPSBcIlwiO1xyXG4gICAgICAgICAgZ3JvdXBKU09OQXJyYXlbZ3JvdXBOYW1lXS5mb3JFYWNoKCBmdW5jdGlvbihvYmplY3REZWZpbml0aW9uLCBpbmRleCkge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhvYmplY3REZWZpbml0aW9uW1wiZmlsZVwiXSk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKG9iamVjdERlZmluaXRpb24pO1xyXG4gICAgICAgICAgICBvcHRpb25zSFRNTCArPSBgPG9wdGlvbiB2YWx1ZT1cIiR7b2JqZWN0RGVmaW5pdGlvbltcImZpbGVcIl19XCIgc3JjPVwiYXNzZXRzL3ByZXZpZXcvJHtvYmplY3REZWZpbml0aW9uW1wiZmlsZVwiXX0uanBnXCI+JHtodW1hbml6ZShvYmplY3REZWZpbml0aW9uW1wiZmlsZVwiXSl9PC9vcHRpb24+YFxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgbmV3T3B0Z3JvdXBFbC5pbm5lckhUTUwgPSBvcHRpb25zSFRNTDtcclxuICAgICAgICAgIC8vIFRPRE86IEJBRCBXT1JLQVJPVU5EIFRPIE5PVCBSRUxPQUQgQkFTRVMgc2luY2UgaXQncyBkZWZpbmVkIGluIEhUTUwuIEluc3RlYWQsIG5vIG9iamVjdHMgc2hvdWxkIGJlIGxpc3RlZCBpbiBIVE1MLiBUaGlzIHNob3VsZCB1c2UgYSBwcm9taXNlIGFuZCB0aGVuIGluaXQgdGhlIHNlbGVjdC1iYXIgY29tcG9uZW50IG9uY2UgYWxsIG9iamVjdHMgYXJlIGxpc3RlZC5cclxuICAgICAgICAgIGlmIChncm91cE5hbWUgPT0gXCJrZmFycl9iYXNlc1wiKSB7XHJcbiAgICAgICAgICAgIC8vIGRvIG5vdGhpbmcgLSBkb24ndCBhcHBlbmQgdGhpcyB0byB0aGUgRE9NIGJlY2F1c2Ugb25lIGlzIGFscmVhZHkgdGhlcmVcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG1lbnVFbC5hcHBlbmRDaGlsZChuZXdPcHRncm91cEVsKTtcclxuICAgICAgICAgIH1cclxuLy8gICAgICAgICAgcmVzb2x2ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5ncm91cEpTT05BcnJheSA9IGdyb3VwSlNPTkFycmF5O1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGVudGl0eSByZXN1bWVzLlxyXG4gICAqIFVzZSB0byBjb250aW51ZSBvciBhZGQgYW55IGR5bmFtaWMgb3IgYmFja2dyb3VuZCBiZWhhdmlvciBzdWNoIGFzIGV2ZW50cy5cclxuICAgKi9cclxuICBwbGF5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gZW50aXR5IHBhdXNlcy5cclxuICAgKiBVc2UgdG8gc3RvcCBvciByZW1vdmUgYW55IGR5bmFtaWMgb3IgYmFja2dyb3VuZCBiZWhhdmlvciBzdWNoIGFzIGV2ZW50cy5cclxuICAgKi9cclxuICBwYXVzZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGEgY29tcG9uZW50IGlzIHJlbW92ZWQgKGUuZy4sIHZpYSByZW1vdmVBdHRyaWJ1dGUpLlxyXG4gICAqIEdlbmVyYWxseSB1bmRvZXMgYWxsIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGVudGl0eS5cclxuICAgKi9cclxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBTcGF3bnMgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBvYmplY3QgYXQgdGhlIGNvbnRyb2xsZXIgbG9jYXRpb24gd2hlbiB0cmlnZ2VyIHByZXNzZWRcclxuICAgKi9cclxuICBvblBsYWNlT2JqZWN0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgLy8gRmV0Y2ggdGhlIEl0ZW0gZWxlbWVudCAodGhlIHBsYWNlYWJsZSBjaXR5IG9iamVjdCkgc2VsZWN0ZWQgb24gdGhpcyBjb250cm9sbGVyXHJcbiAgICB2YXIgdGhpc0l0ZW1JRCA9ICh0aGlzLmVsLmlkID09PSAnbGVmdENvbnRyb2xsZXInKSA/ICcjbGVmdEl0ZW0nOicjcmlnaHRJdGVtJztcclxuICAgIHZhciB0aGlzSXRlbUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzSXRlbUlEKTtcclxuXHJcbiAgICAvLyBXaGljaCBvYmplY3Qgc2hvdWxkIGJlIHBsYWNlZCBoZXJlPyBUaGlzIElEIGlzIFwic3RvcmVkXCIgaW4gdGhlIERPTSBlbGVtZW50IG9mIHRoZSBjdXJyZW50IEl0ZW1cclxuXHRcdHZhciBvYmplY3RJZCA9IHBhcnNlSW50KHRoaXNJdGVtRWwuYXR0cmlidXRlcy5vYmplY3RJZC52YWx1ZSk7XHJcblxyXG4gICAgLy8gV2hhdCdzIHRoZSB0eXBlIG9mIG9iamVjdD8gRm9yIGV4YW1wbGUsIFwibW1tbV9hbGllblwiIG9yIFwiYmFzZXNcIlxyXG5cdFx0dmFyIG9iamVjdEdyb3VwID0gdGhpc0l0ZW1FbC5hdHRyaWJ1dGVzLm9iamVjdEdyb3VwLnZhbHVlO1xyXG5cclxuICAgIC8vIHJvdW5kaW5nIHRydWUgb3IgZmFsc2U/IFdlIHdhbnQgdG8gcm91bmQgcG9zaXRpb24gYW5kIHJvdGF0aW9uIG9ubHkgZm9yIFwiYmFzZXNcIiB0eXBlIG9iamVjdHNcclxuICAgIHZhciByb3VuZGluZyA9IChvYmplY3RHcm91cCA9PSAna2ZhcnJfYmFzZXMnKTtcclxuXHJcbiAgICAvLyBHZXQgYW4gQXJyYXkgb2YgYWxsIHRoZSBvYmplY3RzIG9mIHRoaXMgdHlwZVxyXG4gICAgdmFyIG9iamVjdEFycmF5ID0gdGhpcy5ncm91cEpTT05BcnJheVtvYmplY3RHcm91cF07XHJcblxyXG4gICAgLy8gR2V0IHRoZSBJdGVtJ3MgY3VycmVudCB3b3JsZCBjb29yZGluYXRlcyAtIHdlJ3JlIGdvaW5nIHRvIHBsYWNlIGl0IHJpZ2h0IHdoZXJlIGl0IGlzIVxyXG5cdFx0dmFyIHRoaXNJdGVtV29ybGRQb3NpdGlvbiA9IHRoaXNJdGVtRWwub2JqZWN0M0QuZ2V0V29ybGRQb3NpdGlvbigpO1xyXG5cdFx0dmFyIHRoaXNJdGVtV29ybGRSb3RhdGlvbiA9IHRoaXNJdGVtRWwub2JqZWN0M0QuZ2V0V29ybGRSb3RhdGlvbigpO1xyXG5cdFx0dmFyIG9yaWdpbmFsUG9zaXRpb25TdHJpbmcgPSB0aGlzSXRlbVdvcmxkUG9zaXRpb24ueCArICcgJyArIHRoaXNJdGVtV29ybGRQb3NpdGlvbi55ICsgJyAnICsgdGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLno7XHJcblxyXG4gICAgLy8gUm91bmQgdGhlIEl0ZW0ncyBwb3NpdGlvbiB0byB0aGUgbmVhcmVzdCAwLjUwIGZvciBhIGJhc2ljIFwiZ3JpZCBzbmFwcGluZ1wiIGVmZmVjdFxyXG5cdFx0dmFyIHJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblggPSBNYXRoLnJvdW5kKHRoaXNJdGVtV29ybGRQb3NpdGlvbi54ICogMikgLyAyOyAvL3JvdW5kIHRvIG5lYXJlc3QgMC41IGZvciBnaGV0dG8gXCJzbmFwcGluZ1wiXHJcblx0XHR2YXIgcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWSA9IE1hdGgucm91bmQodGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLnkgKiAyKSAvIDI7IC8vcm91bmQgdG8gbmVhcmVzdCAwLjUgZm9yIGdoZXR0byBcInNuYXBwaW5nXCJcclxuXHRcdHZhciByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25aID0gTWF0aC5yb3VuZCh0aGlzSXRlbVdvcmxkUG9zaXRpb24ueiAqIDIpIC8gMjsgLy9yb3VuZCB0byBuZWFyZXN0IDAuNSBmb3IgZ2hldHRvIFwic25hcHBpbmdcIlxyXG5cdFx0dmFyIHJvdW5kZWRQb3NpdGlvblN0cmluZyA9IHJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblggKyAnIDAuNTAgJyArIHJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblo7XHJcblxyXG4gICAgLy8gRmV0Y2ggdGhlIGN1cnJlbnQgSXRlbSdzIHJvdGF0aW9uIGFuZCBjb252ZXJ0IGl0IHRvIGEgRXVsZXIgc3RyaW5nXHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWCA9IHRoaXNJdGVtV29ybGRSb3RhdGlvbi5feCAvIChNYXRoLlBJIC8gMTgwKTtcclxuXHRcdHZhciB0aGlzSXRlbVdvcmxkUm90YXRpb25ZID0gdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uLl95IC8gKE1hdGguUEkgLyAxODApO1xyXG5cdFx0dmFyIHRoaXNJdGVtV29ybGRSb3RhdGlvblogPSB0aGlzSXRlbVdvcmxkUm90YXRpb24uX3ogLyAoTWF0aC5QSSAvIDE4MCk7XHJcblx0XHR2YXIgb3JpZ2luYWxFdWxlclJvdGF0aW9uU3RyaW5nID0gdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWCArICcgJyArIHRoaXNJdGVtV29ybGRSb3RhdGlvblkgKyAnICcgKyB0aGlzSXRlbVdvcmxkUm90YXRpb25aO1xyXG5cclxuICAgIC8vIFJvdW5kIHRoZSBJdGVtJ3Mgcm90YXRpb24gdG8gdGhlIG5lYXJlc3QgOTAgZGVncmVlcyBmb3IgYmFzZSB0eXBlIG9iamVjdHNcclxuXHRcdHZhciByb3VuZGVkVGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSA9IE1hdGgucm91bmQodGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSAvIDkwKSAqIDkwOyAvLyByb3VuZCB0byA5MCBkZWdyZWVzXHJcblx0XHR2YXIgcm91bmRlZEV1bGVyUm90YXRpb25TdHJpbmcgPSAwICsgJyAnICsgcm91bmRlZFRoaXNJdGVtV29ybGRSb3RhdGlvblkgKyAnICcgKyAwOyAvLyBpZ25vcmUgcm9sbCBhbmQgcGl0Y2hcclxuXHJcbiAgICB2YXIgbmV3SWQgPSAnb2JqZWN0JyArIG9iamVjdENvdW50O1xyXG5cclxuICAgICQoJzxhLWVudGl0eSAvPicsIHtcclxuICAgICAgaWQ6IG5ld0lkLFxyXG4gICAgICBjbGFzczogJ2NpdHkgb2JqZWN0IGNoaWxkcmVuJyxcclxuICAgICAgc2NhbGU6IG9iamVjdEFycmF5W29iamVjdElkXS5zY2FsZSxcclxuICAgICAgcm90YXRpb246IHJvdW5kaW5nID8gcm91bmRlZEV1bGVyUm90YXRpb25TdHJpbmcgOiBvcmlnaW5hbEV1bGVyUm90YXRpb25TdHJpbmcsXHJcbiAgICAgIGZpbGU6IG9iamVjdEFycmF5W29iamVjdElkXS5maWxlLFxyXG4gICAgICAvLyBcInBseS1tb2RlbFwiOiBcInNyYzogdXJsKG5ld19hc3NldHMvXCIgKyBvYmplY3RBcnJheVtvYmplY3RJZF0uZmlsZSArIFwiLnBseSlcIixcclxuICAgICAgXCJvYmotbW9kZWxcIjogXCJvYmo6IHVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbb2JqZWN0SWRdLmZpbGUgKyBcIi5vYmopOyBtdGw6IHVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbb2JqZWN0SWRdLmZpbGUgKyBcIi5tdGwpXCIsXHJcbiAgICAgIGFwcGVuZFRvIDogJCgnI2NpdHknKVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIG5ld09iamVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG5ld0lkKTtcclxuICAgIG5ld09iamVjdC5zZXRBdHRyaWJ1dGUoXCJwb3NpdGlvblwiLCByb3VuZGluZyA/IHJvdW5kZWRQb3NpdGlvblN0cmluZyA6IG9yaWdpbmFsUG9zaXRpb25TdHJpbmcpOyAvLyB0aGlzIGRvZXMgc2V0IHBvc2l0aW9uXHJcblxyXG4gICAgLy8gSWYgdGhpcyBpcyBhIFwiYmFzZXNcIiB0eXBlIG9iamVjdCwgYW5pbWF0ZSB0aGUgdHJhbnNpdGlvbiB0byB0aGUgc25hcHBlZCAocm91bmRlZCkgcG9zaXRpb24gYW5kIHJvdGF0aW9uXHJcbiAgICBpZiAocm91bmRpbmcpIHtcclxuICAgICAgbmV3T2JqZWN0LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uJywgeyBwcm9wZXJ0eTogJ3JvdGF0aW9uJywgZHVyOiA1MDAsIGZyb206IG9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZywgdG86IHJvdW5kZWRFdWxlclJvdGF0aW9uU3RyaW5nIH0pXHJcbiAgICB9O1xyXG5cclxuICAgIG5ld09iamVjdC5zZXRBdHRyaWJ1dGUoXCJmaXJlYmFzZS1icm9hZGNhc3RcIiwgXCJjb21wb25lbnRzOiBwb3NpdGlvbiwgc2NhbGUsIHJvdGF0aW9uLCBmaWxlLCBvYmotbW9kZWwsIGNsYXNzOyBwZXJzaXN0OiB0cnVlXCIpO1xyXG5cclxuXHJcbiAgICAvLyBJbmNyZW1lbnQgdGhlIG9iamVjdCBjb3VudGVyIHNvIHN1YnNlcXVlbnQgb2JqZWN0cyBoYXZlIHRoZSBjb3JyZWN0IGluZGV4XHJcblx0XHRvYmplY3RDb3VudCArPSAxO1xyXG4gIH0sXHJcblxyXG5cdG9uT2JqZWN0Q2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIm9uT2JqZWN0Q2hhbmdlIHRyaWdnZXJlZFwiKTtcclxuXHJcbiAgICAvLyBGZXRjaCB0aGUgSXRlbSBlbGVtZW50ICh0aGUgcGxhY2VhYmxlIGNpdHkgb2JqZWN0KSBzZWxlY3RlZCBvbiB0aGlzIGNvbnRyb2xsZXJcclxuICAgIHZhciB0aGlzSXRlbUlEID0gKHRoaXMuZWwuaWQgPT09ICdsZWZ0Q29udHJvbGxlcicpID8gJyNsZWZ0SXRlbSc6JyNyaWdodEl0ZW0nO1xyXG4gICAgdmFyIHRoaXNJdGVtRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXNJdGVtSUQpO1xyXG5cclxuICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEubWVudUlkKTtcclxuXHJcbiAgICAvLyBXaGF0J3MgdGhlIHR5cGUgb2Ygb2JqZWN0IGN1cnJlbnRseSBzZWxlY3RlZD8gRm9yIGV4YW1wbGUsIFwibW1tbV9hbGllblwiIG9yIFwiYmFzZXNcIlxyXG4gICAgdmFyIG9iamVjdEdyb3VwID0gbWVudUVsLmNvbXBvbmVudHNbJ3NlbGVjdC1iYXInXS5zZWxlY3RlZE9wdGdyb3VwVmFsdWU7XHJcblxyXG4gICAgLy8gR2V0IGFuIEFycmF5IG9mIGFsbCB0aGUgb2JqZWN0cyBvZiB0aGlzIHR5cGVcclxuICAgIHZhciBvYmplY3RBcnJheSA9IHRoaXMuZ3JvdXBKU09OQXJyYXlbb2JqZWN0R3JvdXBdO1xyXG5cclxuICAgIC8vIFdoYXQgaXMgdGhlIElEIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgaXRlbT9cclxuICAgIHZhciBuZXdPYmplY3RJZCA9IHBhcnNlSW50KG1lbnVFbC5jb21wb25lbnRzWydzZWxlY3QtYmFyJ10uc2VsZWN0ZWRPcHRpb25JbmRleCk7XHJcbiAgICB2YXIgc2VsZWN0ZWRPcHRpb25WYWx1ZSA9IG1lbnVFbC5jb21wb25lbnRzWydzZWxlY3QtYmFyJ10uc2VsZWN0ZWRPcHRpb25WYWx1ZTtcclxuXHJcblx0XHQvLyBTZXQgdGhlIHByZXZpZXcgb2JqZWN0IHRvIGJlIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgXCJwcmV2aWV3XCIgaXRlbVxyXG4gICAgdGhpc0l0ZW1FbC5zZXRBdHRyaWJ1dGUoJ29iai1tb2RlbCcsIHsgb2JqOiBcInVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbbmV3T2JqZWN0SWRdLmZpbGUgKyBcIi5vYmopXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG10bDogXCJ1cmwoYXNzZXRzL29iai9cIiArIG9iamVjdEFycmF5W25ld09iamVjdElkXS5maWxlICsgXCIubXRsKVwifSk7XHJcblx0XHR0aGlzSXRlbUVsLnNldEF0dHJpYnV0ZSgnc2NhbGUnLCBvYmplY3RBcnJheVtuZXdPYmplY3RJZF0uc2NhbGUpO1xyXG5cdFx0dGhpc0l0ZW1FbC5zZXRBdHRyaWJ1dGUoJ29iamVjdElkJywgbmV3T2JqZWN0SWQpO1xyXG4gICAgdGhpc0l0ZW1FbC5zZXRBdHRyaWJ1dGUoJ29iamVjdEdyb3VwJywgb2JqZWN0R3JvdXApO1xyXG4gICAgdGhpc0l0ZW1FbC5mbHVzaFRvRE9NKCk7XHJcblx0fSxcclxuXHJcbiAgLyoqXHJcbiAgICogVW5kbyAtIGRlbGV0ZXMgdGhlIG1vc3QgcmVjZW50bHkgcGxhY2VkIG9iamVjdFxyXG4gICAqL1xyXG4gIG9uVW5kbzogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHByZXZpb3VzT2JqZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNvYmplY3RcIiArIChvYmplY3RDb3VudCAtIDEpKTtcclxuXHRcdHByZXZpb3VzT2JqZWN0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocHJldmlvdXNPYmplY3QpO1xyXG5cdFx0b2JqZWN0Q291bnQgLT0gMTtcclxuXHRcdGlmKG9iamVjdENvdW50ID09IC0xKSB7b2JqZWN0Q291bnQgPSAwfTtcclxuICB9XHJcblxyXG59KTtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL2J1aWxkZXItY29udHJvbHMuanMiLCIvKiBnbG9iYWwgQUZSQU1FLCBUSFJFRSAqL1xyXG5cclxuLyoqXHJcbiAqIExvYWRzIGFuZCBzZXR1cCBncm91bmQgbW9kZWwuXHJcbiAqL1xyXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2dyb3VuZCcsIHtcclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgb2JqZWN0TG9hZGVyO1xyXG4gICAgdmFyIG9iamVjdDNEID0gdGhpcy5lbC5vYmplY3QzRDtcclxuICAgIC8vIHZhciBNT0RFTF9VUkwgPSAnaHR0cHM6Ly9jZG4uYWZyYW1lLmlvL2xpbmstdHJhdmVyc2FsL21vZGVscy9ncm91bmQuanNvbic7XHJcbiAgICB2YXIgTU9ERUxfVVJMID0gJ2Fzc2V0cy9lbnZpcm9ubWVudC9ncm91bmQuanNvbic7XHJcbiAgICBpZiAodGhpcy5vYmplY3RMb2FkZXIpIHsgcmV0dXJuOyB9XHJcbiAgICBvYmplY3RMb2FkZXIgPSB0aGlzLm9iamVjdExvYWRlciA9IG5ldyBUSFJFRS5PYmplY3RMb2FkZXIoKTtcclxuICAgIG9iamVjdExvYWRlci5jcm9zc09yaWdpbiA9ICcnO1xyXG4gICAgb2JqZWN0TG9hZGVyLmxvYWQoTU9ERUxfVVJMLCBmdW5jdGlvbiAob2JqKSB7XHJcbiAgICAgIG9iai5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHZhbHVlLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xyXG4gICAgICAgIHZhbHVlLm1hdGVyaWFsLnNoYWRpbmcgPSBUSFJFRS5GbGF0U2hhZGluZztcclxuICAgICAgfSk7XHJcbiAgICAgIG9iamVjdDNELmFkZChvYmopO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59KTtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL2dyb3VuZC5qcyIsIi8qIGdsb2JhbCBBRlJBTUUgKi9cclxuQUZSQU1FLnJlZ2lzdGVyU2hhZGVyKCdza3lHcmFkaWVudCcsIHtcclxuICBzY2hlbWE6IHtcclxuICAgIGNvbG9yVG9wOiB7IHR5cGU6ICdjb2xvcicsIGRlZmF1bHQ6ICdibGFjaycsIGlzOiAndW5pZm9ybScgfSxcclxuICAgIGNvbG9yQm90dG9tOiB7IHR5cGU6ICdjb2xvcicsIGRlZmF1bHQ6ICdyZWQnLCBpczogJ3VuaWZvcm0nIH1cclxuICB9LFxyXG5cclxuICB2ZXJ0ZXhTaGFkZXI6IFtcclxuICAgICd2YXJ5aW5nIHZlYzMgdldvcmxkUG9zaXRpb247JyxcclxuXHJcbiAgICAndm9pZCBtYWluKCkgeycsXHJcblxyXG4gICAgICAndmVjNCB3b3JsZFBvc2l0aW9uID0gbW9kZWxNYXRyaXggKiB2ZWM0KCBwb3NpdGlvbiwgMS4wICk7JyxcclxuICAgICAgJ3ZXb3JsZFBvc2l0aW9uID0gd29ybGRQb3NpdGlvbi54eXo7JyxcclxuXHJcbiAgICAgICdnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KCBwb3NpdGlvbiwgMS4wICk7JyxcclxuXHJcbiAgICAnfSdcclxuXHJcbiAgXS5qb2luKCdcXG4nKSxcclxuXHJcbiAgZnJhZ21lbnRTaGFkZXI6IFtcclxuICAgICd1bmlmb3JtIHZlYzMgY29sb3JUb3A7JyxcclxuICAgICd1bmlmb3JtIHZlYzMgY29sb3JCb3R0b207JyxcclxuXHJcbiAgICAndmFyeWluZyB2ZWMzIHZXb3JsZFBvc2l0aW9uOycsXHJcblxyXG4gICAgJ3ZvaWQgbWFpbigpJyxcclxuXHJcbiAgICAneycsXHJcbiAgICAgICd2ZWMzIHBvaW50T25TcGhlcmUgPSBub3JtYWxpemUodldvcmxkUG9zaXRpb24ueHl6KTsnLFxyXG4gICAgICAnZmxvYXQgZiA9IDEuMDsnLFxyXG4gICAgICAnaWYocG9pbnRPblNwaGVyZS55ID4gLSAwLjIpeycsXHJcblxyXG4gICAgICAgICdmID0gc2luKHBvaW50T25TcGhlcmUueSAqIDIuMCk7JyxcclxuXHJcbiAgICAgICd9JyxcclxuICAgICAgJ2dsX0ZyYWdDb2xvciA9IHZlYzQobWl4KGNvbG9yQm90dG9tLGNvbG9yVG9wLCBmICksIDEuMCk7JyxcclxuXHJcbiAgICAnfSdcclxuICBdLmpvaW4oJ1xcbicpXHJcbn0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvc2t5R3JhZGllbnQuanMiXSwic291cmNlUm9vdCI6IiJ9