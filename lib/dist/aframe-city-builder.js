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

	'use strict';
	
	__webpack_require__(1);
	__webpack_require__(2);
	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(42);
	__webpack_require__(43);
	__webpack_require__(44);
	__webpack_require__(45);

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

	/**
	 * TextGeometry component for A-Frame.
	 */
	var debug = AFRAME.utils.debug;
	
	var error = debug('aframe-text-component:error');
	
	var fontLoader = new THREE.FontLoader();
	
	AFRAME.registerComponent('text', {
	  schema: {
	    bevelEnabled: {default: false},
	    bevelSize: {default: 8, min: 0},
	    bevelThickness: {default: 12, min: 0},
	    curveSegments: {default: 12, min: 0},
	    font: {type: 'asset', default: 'https://rawgit.com/ngokevin/kframe/master/components/text/lib/helvetiker_regular.typeface.json'},
	    height: {default: 0.05, min: 0},
	    size: {default: 0.5, min: 0},
	    style: {default: 'normal', oneOf: ['normal', 'italics']},
	    text: {default: ''},
	    weight: {default: 'normal', oneOf: ['normal', 'bold']}
	  },
	
	  /**
	   * Called when component is attached and when component data changes.
	   * Generally modifies the entity based on the data.
	   */
	  update: function (oldData) {
	    var data = this.data;
	    var el = this.el;
	
	    var mesh = el.getOrCreateObject3D('mesh', THREE.Mesh);
	    if (data.font.constructor === String) {
	      // Load typeface.json font.
	      fontLoader.load(data.font, function (response) {
	        var textData = AFRAME.utils.clone(data);
	        textData.font = response;
	        mesh.geometry = new THREE.TextGeometry(data.text, textData);
	      });
	    } else if (data.font.constructor === Object) {
	      // Set font if already have a typeface.json through setAttribute.
	      mesh.geometry = new THREE.TextGeometry(data.text, data);
	    } else {
	      error('Must provide `font` (typeface.json) or `fontPath` (string) to text component.');
	    }
	  }
	});


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* global AFRAME, THREE */
	if (typeof AFRAME === 'undefined') {
	  throw new Error('Component attempted to register before AFRAME was available.');
	}
	
	var createText = __webpack_require__(6);
	var loadFont = __webpack_require__(22);
	var SDFShader = __webpack_require__(40);
	
	__webpack_require__(41); // Register experimental text primitive
	
	/**
	 * bmfont text component for A-Frame.
	 */
	AFRAME.registerComponent('bmfont-text', {
	  schema: {
	    text: {
	      type: 'string'
	    },
	    width: {
	      type: 'number',
	      default: 1000
	    },
	    align: {
	      type: 'string',
	      default: 'left'
	    },
	    letterSpacing: {
	      type: 'number',
	      default: 0
	    },
	    lineHeight: {
	      type: 'number',
	      default: 38
	    },
	    fnt: {
	      type: 'string',
	      default: 'https://cdn.rawgit.com/bryik/aframe-bmfont-text-component/aa0655cf90f646e12c40ab4708ea90b4686cfb45/assets/DejaVu-sdf.fnt'
	    },
	    fntImage: {
	      type: 'string',
	      default: 'https://cdn.rawgit.com/bryik/aframe-bmfont-text-component/aa0655cf90f646e12c40ab4708ea90b4686cfb45/assets/DejaVu-sdf.png'
	    },
	    mode: {
	      type: 'string',
	      default: 'normal'
	    },
	    color: {
	      type: 'color',
	      default: '#000'
	    },
	    opacity: {
	      type: 'number',
	      default: '1.0'
	    }
	  },
	
	  /**
	   * Called when component is attached and when component data changes.
	   * Generally modifies the entity based on the data.
	   */
	  update: function (oldData) {
	    // Entity data
	    var el = this.el;
	    var data = this.data;
	
	    // Use fontLoader utility to load 'fnt' and texture
	    fontLoader({
	      font: data.fnt,
	      image: data.fntImage
	    }, start);
	
	    function start (font, texture) {
	      // Setup texture, should set anisotropy to user maximum...
	      texture.needsUpdate = true;
	      texture.anisotropy = 16;
	
	      var options = {
	        font: font, // the bitmap font definition
	        text: data.text, // the string to render
	        width: data.width,
	        align: data.align,
	        letterSpacing: data.letterSpacing,
	        lineHeight: data.lineHeight,
	        mode: data.mode
	      };
	
	      // Create text geometry
	      var geometry = createText(options);
	
	      // Use './lib/shaders/sdf' to help build a shader material
	      var material = new THREE.RawShaderMaterial(SDFShader({
	        map: texture,
	        side: THREE.DoubleSide,
	        transparent: true,
	        color: data.color,
	        opacity: data.opacity
	      }));
	
	      var text = new THREE.Mesh(geometry, material);
	
	      // Rotate so text faces the camera
	      text.rotation.y = Math.PI;
	
	      // Scale text down
	      text.scale.multiplyScalar(-0.005);
	
	      // Register text mesh under entity's object3DMap
	      el.setObject3D('bmfont-text', text);
	    }
	  },
	
	  /**
	   * Called when a component is removed (e.g., via removeAttribute).
	   * Generally undoes all modifications to the entity.
	   */
	  remove: function () {
	    this.el.removeObject3D('bmfont-text');
	  }
	});
	
	/**
	 * A utility to load a font with bmfont-load
	 * and a texture with Three.TextureLoader()
	 */
	function fontLoader (opt, cb) {
	  loadFont(opt.font, function (err, font) {
	    if (err) {
	      throw err;
	    }
	
	    var textureLoader = new THREE.TextureLoader();
	    textureLoader.load(opt.image, function (texture) {
	      cb(font, texture);
	    });
	  });
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var createLayout = __webpack_require__(7)
	var inherits = __webpack_require__(12)
	var createIndices = __webpack_require__(13)
	var buffer = __webpack_require__(17)
	var assign = __webpack_require__(19)
	
	var vertices = __webpack_require__(20)
	var utils = __webpack_require__(21)
	
	var Base = THREE.BufferGeometry
	
	module.exports = function createTextGeometry (opt) {
	  return new TextGeometry(opt)
	}
	
	function TextGeometry (opt) {
	  Base.call(this)
	
	  if (typeof opt === 'string') {
	    opt = { text: opt }
	  }
	
	  // use these as default values for any subsequent
	  // calls to update()
	  this._opt = assign({}, opt)
	
	  // also do an initial setup...
	  if (opt) this.update(opt)
	}
	
	inherits(TextGeometry, Base)
	
	TextGeometry.prototype.update = function (opt) {
	  if (typeof opt === 'string') {
	    opt = { text: opt }
	  }
	
	  // use constructor defaults
	  opt = assign({}, this._opt, opt)
	
	  if (!opt.font) {
	    throw new TypeError('must specify a { font } in options')
	  }
	
	  this.layout = createLayout(opt)
	
	  // get vec2 texcoords
	  var flipY = opt.flipY !== false
	
	  // the desired BMFont data
	  var font = opt.font
	
	  // determine texture size from font file
	  var texWidth = font.common.scaleW
	  var texHeight = font.common.scaleH
	
	  // get visible glyphs
	  var glyphs = this.layout.glyphs.filter(function (glyph) {
	    var bitmap = glyph.data
	    return bitmap.width * bitmap.height > 0
	  })
	
	  // provide visible glyphs for convenience
	  this.visibleGlyphs = glyphs
	
	  // get common vertex data
	  var positions = vertices.positions(glyphs)
	  var uvs = vertices.uvs(glyphs, texWidth, texHeight, flipY)
	  var indices = createIndices({
	    clockwise: true,
	    type: 'uint16',
	    count: glyphs.length
	  })
	
	  // update vertex data
	  buffer.index(this, indices, 1, 'uint16')
	  buffer.attr(this, 'position', positions, 2)
	  buffer.attr(this, 'uv', uvs, 2)
	
	  // update multipage data
	  if (!opt.multipage && 'page' in this.attributes) {
	    // disable multipage rendering
	    this.removeAttribute('page')
	  } else if (opt.multipage) {
	    var pages = vertices.pages(glyphs)
	    // enable multipage rendering
	    buffer.attr(this, 'page', pages, 1)
	  }
	}
	
	TextGeometry.prototype.computeBoundingSphere = function () {
	  if (this.boundingSphere === null) {
	    this.boundingSphere = new THREE.Sphere()
	  }
	
	  var positions = this.attributes.position.array
	  var itemSize = this.attributes.position.itemSize
	  if (!positions || !itemSize || positions.length < 2) {
	    this.boundingSphere.radius = 0
	    this.boundingSphere.center.set(0, 0, 0)
	    return
	  }
	  utils.computeSphere(positions, this.boundingSphere)
	  if (isNaN(this.boundingSphere.radius)) {
	    console.error('THREE.BufferGeometry.computeBoundingSphere(): ' +
	      'Computed radius is NaN. The ' +
	      '"position" attribute is likely to have NaN values.')
	  }
	}
	
	TextGeometry.prototype.computeBoundingBox = function () {
	  if (this.boundingBox === null) {
	    this.boundingBox = new THREE.Box3()
	  }
	
	  var bbox = this.boundingBox
	  var positions = this.attributes.position.array
	  var itemSize = this.attributes.position.itemSize
	  if (!positions || !itemSize || positions.length < 2) {
	    bbox.makeEmpty()
	    return
	  }
	  utils.computeBox(positions, bbox)
	}


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var wordWrap = __webpack_require__(8)
	var xtend = __webpack_require__(9)
	var findChar = __webpack_require__(10)('id')
	var number = __webpack_require__(11)
	
	var X_HEIGHTS = ['x', 'e', 'a', 'o', 'n', 's', 'r', 'c', 'u', 'm', 'v', 'w', 'z']
	var M_WIDTHS = ['m', 'w']
	var CAP_HEIGHTS = ['H', 'I', 'N', 'E', 'F', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
	
	
	var TAB_ID = '\t'.charCodeAt(0)
	var SPACE_ID = ' '.charCodeAt(0)
	var ALIGN_LEFT = 0, 
	    ALIGN_CENTER = 1, 
	    ALIGN_RIGHT = 2
	
	module.exports = function createLayout(opt) {
	  return new TextLayout(opt)
	}
	
	function TextLayout(opt) {
	  this.glyphs = []
	  this._measure = this.computeMetrics.bind(this)
	  this.update(opt)
	}
	
	TextLayout.prototype.update = function(opt) {
	  opt = xtend({
	    measure: this._measure
	  }, opt)
	  this._opt = opt
	  this._opt.tabSize = number(this._opt.tabSize, 4)
	
	  if (!opt.font)
	    throw new Error('must provide a valid bitmap font')
	
	  var glyphs = this.glyphs
	  var text = opt.text||'' 
	  var font = opt.font
	  this._setupSpaceGlyphs(font)
	  
	  var lines = wordWrap.lines(text, opt)
	  var minWidth = opt.width || 0
	
	  //clear glyphs
	  glyphs.length = 0
	
	  //get max line width
	  var maxLineWidth = lines.reduce(function(prev, line) {
	    return Math.max(prev, line.width, minWidth)
	  }, 0)
	
	  //the pen position
	  var x = 0
	  var y = 0
	  var lineHeight = number(opt.lineHeight, font.common.lineHeight)
	  var baseline = font.common.base
	  var descender = lineHeight-baseline
	  var letterSpacing = opt.letterSpacing || 0
	  var height = lineHeight * lines.length - descender
	  var align = getAlignType(this._opt.align)
	
	  //draw text along baseline
	  y -= height
	  
	  //the metrics for this text layout
	  this._width = maxLineWidth
	  this._height = height
	  this._descender = lineHeight - baseline
	  this._baseline = baseline
	  this._xHeight = getXHeight(font)
	  this._capHeight = getCapHeight(font)
	  this._lineHeight = lineHeight
	  this._ascender = lineHeight - descender - this._xHeight
	    
	  //layout each glyph
	  var self = this
	  lines.forEach(function(line, lineIndex) {
	    var start = line.start
	    var end = line.end
	    var lineWidth = line.width
	    var lastGlyph
	    
	    //for each glyph in that line...
	    for (var i=start; i<end; i++) {
	      var id = text.charCodeAt(i)
	      var glyph = self.getGlyph(font, id)
	      if (glyph) {
	        if (lastGlyph) 
	          x += getKerning(font, lastGlyph.id, glyph.id)
	
	        var tx = x
	        if (align === ALIGN_CENTER) 
	          tx += (maxLineWidth-lineWidth)/2
	        else if (align === ALIGN_RIGHT)
	          tx += (maxLineWidth-lineWidth)
	
	        glyphs.push({
	          position: [tx, y],
	          data: glyph,
	          index: i,
	          line: lineIndex
	        })  
	
	        //move pen forward
	        x += glyph.xadvance + letterSpacing
	        lastGlyph = glyph
	      }
	    }
	
	    //next line down
	    y += lineHeight
	    x = 0
	  })
	  this._linesTotal = lines.length;
	}
	
	TextLayout.prototype._setupSpaceGlyphs = function(font) {
	  //These are fallbacks, when the font doesn't include
	  //' ' or '\t' glyphs
	  this._fallbackSpaceGlyph = null
	  this._fallbackTabGlyph = null
	
	  if (!font.chars || font.chars.length === 0)
	    return
	
	  //try to get space glyph
	  //then fall back to the 'm' or 'w' glyphs
	  //then fall back to the first glyph available
	  var space = getGlyphById(font, SPACE_ID) 
	          || getMGlyph(font) 
	          || font.chars[0]
	
	  //and create a fallback for tab
	  var tabWidth = this._opt.tabSize * space.xadvance
	  this._fallbackSpaceGlyph = space
	  this._fallbackTabGlyph = xtend(space, {
	    x: 0, y: 0, xadvance: tabWidth, id: TAB_ID, 
	    xoffset: 0, yoffset: 0, width: 0, height: 0
	  })
	}
	
	TextLayout.prototype.getGlyph = function(font, id) {
	  var glyph = getGlyphById(font, id)
	  if (glyph)
	    return glyph
	  else if (id === TAB_ID) 
	    return this._fallbackTabGlyph
	  else if (id === SPACE_ID) 
	    return this._fallbackSpaceGlyph
	  return null
	}
	
	TextLayout.prototype.computeMetrics = function(text, start, end, width) {
	  var letterSpacing = this._opt.letterSpacing || 0
	  var font = this._opt.font
	  var curPen = 0
	  var curWidth = 0
	  var count = 0
	  var glyph
	  var lastGlyph
	
	  if (!font.chars || font.chars.length === 0) {
	    return {
	      start: start,
	      end: start,
	      width: 0
	    }
	  }
	
	  end = Math.min(text.length, end)
	  for (var i=start; i < end; i++) {
	    var id = text.charCodeAt(i)
	    var glyph = this.getGlyph(font, id)
	
	    if (glyph) {
	      //move pen forward
	      var xoff = glyph.xoffset
	      var kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0
	      curPen += kern
	
	      var nextPen = curPen + glyph.xadvance + letterSpacing
	      var nextWidth = curPen + glyph.width
	
	      //we've hit our limit; we can't move onto the next glyph
	      if (nextWidth >= width || nextPen >= width)
	        break
	
	      //otherwise continue along our line
	      curPen = nextPen
	      curWidth = nextWidth
	      lastGlyph = glyph
	    }
	    count++
	  }
	  
	  //make sure rightmost edge lines up with rendered glyphs
	  if (lastGlyph)
	    curWidth += lastGlyph.xoffset
	
	  return {
	    start: start,
	    end: start + count,
	    width: curWidth
	  }
	}
	
	//getters for the private vars
	;['width', 'height', 
	  'descender', 'ascender',
	  'xHeight', 'baseline',
	  'capHeight',
	  'lineHeight' ].forEach(addGetter)
	
	function addGetter(name) {
	  Object.defineProperty(TextLayout.prototype, name, {
	    get: wrapper(name),
	    configurable: true
	  })
	}
	
	//create lookups for private vars
	function wrapper(name) {
	  return (new Function([
	    'return function '+name+'() {',
	    '  return this._'+name,
	    '}'
	  ].join('\n')))()
	}
	
	function getGlyphById(font, id) {
	  if (!font.chars || font.chars.length === 0)
	    return null
	
	  var glyphIdx = findChar(font.chars, id)
	  if (glyphIdx >= 0)
	    return font.chars[glyphIdx]
	  return null
	}
	
	function getXHeight(font) {
	  for (var i=0; i<X_HEIGHTS.length; i++) {
	    var id = X_HEIGHTS[i].charCodeAt(0)
	    var idx = findChar(font.chars, id)
	    if (idx >= 0) 
	      return font.chars[idx].height
	  }
	  return 0
	}
	
	function getMGlyph(font) {
	  for (var i=0; i<M_WIDTHS.length; i++) {
	    var id = M_WIDTHS[i].charCodeAt(0)
	    var idx = findChar(font.chars, id)
	    if (idx >= 0) 
	      return font.chars[idx]
	  }
	  return 0
	}
	
	function getCapHeight(font) {
	  for (var i=0; i<CAP_HEIGHTS.length; i++) {
	    var id = CAP_HEIGHTS[i].charCodeAt(0)
	    var idx = findChar(font.chars, id)
	    if (idx >= 0) 
	      return font.chars[idx].height
	  }
	  return 0
	}
	
	function getKerning(font, left, right) {
	  if (!font.kernings || font.kernings.length === 0)
	    return 0
	
	  var table = font.kernings
	  for (var i=0; i<table.length; i++) {
	    var kern = table[i]
	    if (kern.first === left && kern.second === right)
	      return kern.amount
	  }
	  return 0
	}
	
	function getAlignType(align) {
	  if (align === 'center')
	    return ALIGN_CENTER
	  else if (align === 'right')
	    return ALIGN_RIGHT
	  return ALIGN_LEFT
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	var newline = /\n/
	var newlineChar = '\n'
	var whitespace = /\s/
	
	module.exports = function(text, opt) {
	    var lines = module.exports.lines(text, opt)
	    return lines.map(function(line) {
	        return text.substring(line.start, line.end)
	    }).join('\n')
	}
	
	module.exports.lines = function wordwrap(text, opt) {
	    opt = opt||{}
	
	    //zero width results in nothing visible
	    if (opt.width === 0 && opt.mode !== 'nowrap') 
	        return []
	
	    text = text||''
	    var width = typeof opt.width === 'number' ? opt.width : Number.MAX_VALUE
	    var start = Math.max(0, opt.start||0)
	    var end = typeof opt.end === 'number' ? opt.end : text.length
	    var mode = opt.mode
	
	    var measure = opt.measure || monospace
	    if (mode === 'pre')
	        return pre(measure, text, start, end, width)
	    else
	        return greedy(measure, text, start, end, width, mode)
	}
	
	function idxOf(text, chr, start, end) {
	    var idx = text.indexOf(chr, start)
	    if (idx === -1 || idx > end)
	        return end
	    return idx
	}
	
	function isWhitespace(chr) {
	    return whitespace.test(chr)
	}
	
	function pre(measure, text, start, end, width) {
	    var lines = []
	    var lineStart = start
	    for (var i=start; i<end && i<text.length; i++) {
	        var chr = text.charAt(i)
	        var isNewline = newline.test(chr)
	
	        //If we've reached a newline, then step down a line
	        //Or if we've reached the EOF
	        if (isNewline || i===end-1) {
	            var lineEnd = isNewline ? i : i+1
	            var measured = measure(text, lineStart, lineEnd, width)
	            lines.push(measured)
	            
	            lineStart = i+1
	        }
	    }
	    return lines
	}
	
	function greedy(measure, text, start, end, width, mode) {
	    //A greedy word wrapper based on LibGDX algorithm
	    //https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java
	    var lines = []
	
	    var testWidth = width
	    //if 'nowrap' is specified, we only wrap on newline chars
	    if (mode === 'nowrap')
	        testWidth = Number.MAX_VALUE
	
	    while (start < end && start < text.length) {
	        //get next newline position
	        var newLine = idxOf(text, newlineChar, start, end)
	
	        //eat whitespace at start of line
	        while (start < newLine) {
	            if (!isWhitespace( text.charAt(start) ))
	                break
	            start++
	        }
	
	        //determine visible # of glyphs for the available width
	        var measured = measure(text, start, newLine, testWidth)
	
	        var lineEnd = start + (measured.end-measured.start)
	        var nextStart = lineEnd + newlineChar.length
	
	        //if we had to cut the line before the next newline...
	        if (lineEnd < newLine) {
	            //find char to break on
	            while (lineEnd > start) {
	                if (isWhitespace(text.charAt(lineEnd)))
	                    break
	                lineEnd--
	            }
	            if (lineEnd === start) {
	                if (nextStart > start + newlineChar.length) nextStart--
	                lineEnd = nextStart // If no characters to break, show all.
	            } else {
	                nextStart = lineEnd
	                //eat whitespace at end of line
	                while (lineEnd > start) {
	                    if (!isWhitespace(text.charAt(lineEnd - newlineChar.length)))
	                        break
	                    lineEnd--
	                }
	            }
	        }
	        if (lineEnd >= start) {
	            var result = measure(text, start, lineEnd, testWidth)
	            lines.push(result)
	        }
	        start = nextStart
	    }
	    return lines
	}
	
	//determines the visible number of glyphs within a given width
	function monospace(text, start, end, width) {
	    var glyphs = Math.min(width, end-start)
	    return {
	        start: start,
	        end: start+glyphs
	    }
	}

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = extend
	
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	
	function extend() {
	    var target = {}
	
	    for (var i = 0; i < arguments.length; i++) {
	        var source = arguments[i]
	
	        for (var key in source) {
	            if (hasOwnProperty.call(source, key)) {
	                target[key] = source[key]
	            }
	        }
	    }
	
	    return target
	}


/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = function compile(property) {
		if (!property || typeof property !== 'string')
			throw new Error('must specify property for indexof search')
	
		return new Function('array', 'value', 'start', [
			'start = start || 0',
			'for (var i=start; i<array.length; i++)',
			'  if (array[i]["' + property +'"] === value)',
			'      return i',
			'return -1'
		].join('\n'))
	}

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = function numtype(num, def) {
		return typeof num === 'number'
			? num 
			: (typeof def === 'number' ? def : 0)
	}

/***/ },
/* 12 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var dtype = __webpack_require__(14)
	var anArray = __webpack_require__(15)
	var isBuffer = __webpack_require__(16)
	
	var CW = [0, 2, 3]
	var CCW = [2, 1, 3]
	
	module.exports = function createQuadElements(array, opt) {
	    //if user didn't specify an output array
	    if (!array || !(anArray(array) || isBuffer(array))) {
	        opt = array || {}
	        array = null
	    }
	
	    if (typeof opt === 'number') //backwards-compatible
	        opt = { count: opt }
	    else
	        opt = opt || {}
	
	    var type = typeof opt.type === 'string' ? opt.type : 'uint16'
	    var count = typeof opt.count === 'number' ? opt.count : 1
	    var start = (opt.start || 0) 
	
	    var dir = opt.clockwise !== false ? CW : CCW,
	        a = dir[0], 
	        b = dir[1],
	        c = dir[2]
	
	    var numIndices = count * 6
	
	    var indices = array || new (dtype(type))(numIndices)
	    for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
	        var x = i + start
	        indices[x + 0] = j + 0
	        indices[x + 1] = j + 1
	        indices[x + 2] = j + 2
	        indices[x + 3] = j + a
	        indices[x + 4] = j + b
	        indices[x + 5] = j + c
	    }
	    return indices
	}

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = function(dtype) {
	  switch (dtype) {
	    case 'int8':
	      return Int8Array
	    case 'int16':
	      return Int16Array
	    case 'int32':
	      return Int32Array
	    case 'uint8':
	      return Uint8Array
	    case 'uint16':
	      return Uint16Array
	    case 'uint32':
	      return Uint32Array
	    case 'float32':
	      return Float32Array
	    case 'float64':
	      return Float64Array
	    case 'array':
	      return Array
	    case 'uint8_clamped':
	      return Uint8ClampedArray
	  }
	}


/***/ },
/* 15 */
/***/ function(module, exports) {

	var str = Object.prototype.toString
	
	module.exports = anArray
	
	function anArray(arr) {
	  return (
	       arr.BYTES_PER_ELEMENT
	    && str.call(arr.buffer) === '[object ArrayBuffer]'
	    || Array.isArray(arr)
	  )
	}


/***/ },
/* 16 */
/***/ function(module, exports) {

	/*!
	 * Determine if an object is a Buffer
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	
	// The _isBuffer check is for Safari 5-7 support, because it's missing
	// Object.prototype.constructor. Remove this eventually
	module.exports = function (obj) {
	  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
	}
	
	function isBuffer (obj) {
	  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
	}
	
	// For Node v0.10 support. Remove this eventually.
	function isSlowBuffer (obj) {
	  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
	}


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var flatten = __webpack_require__(18)
	var warned = false;
	
	module.exports.attr = setAttribute
	module.exports.index = setIndex
	
	function setIndex (geometry, data, itemSize, dtype) {
	  if (typeof itemSize !== 'number') itemSize = 1
	  if (typeof dtype !== 'string') dtype = 'uint16'
	
	  var isR69 = !geometry.index && typeof geometry.setIndex !== 'function'
	  var attrib = isR69 ? geometry.getAttribute('index') : geometry.index
	  var newAttrib = updateAttribute(attrib, data, itemSize, dtype)
	  if (newAttrib) {
	    if (isR69) geometry.addAttribute('index', newAttrib)
	    else geometry.index = newAttrib
	  }
	}
	
	function setAttribute (geometry, key, data, itemSize, dtype) {
	  if (typeof itemSize !== 'number') itemSize = 3
	  if (typeof dtype !== 'string') dtype = 'float32'
	  if (Array.isArray(data) &&
	    Array.isArray(data[0]) &&
	    data[0].length !== itemSize) {
	    throw new Error('Nested vertex array has unexpected size; expected ' +
	      itemSize + ' but found ' + data[0].length)
	  }
	
	  var attrib = geometry.getAttribute(key)
	  var newAttrib = updateAttribute(attrib, data, itemSize, dtype)
	  if (newAttrib) {
	    geometry.addAttribute(key, newAttrib)
	  }
	}
	
	function updateAttribute (attrib, data, itemSize, dtype) {
	  data = data || []
	  if (!attrib || rebuildAttribute(attrib, data, itemSize)) {
	    // create a new array with desired type
	    data = flatten(data, dtype)
	
	    var needsNewBuffer = attrib && typeof attrib.setArray !== 'function'
	    if (!attrib || needsNewBuffer) {
	      // We are on an old version of ThreeJS which can't
	      // support growing / shrinking buffers, so we need
	      // to build a new buffer
	      if (needsNewBuffer && !warned) {
	        warned = true
	        console.warn([
	          'A WebGL buffer is being updated with a new size or itemSize, ',
	          'however this version of ThreeJS only supports fixed-size buffers.',
	          '\nThe old buffer may still be kept in memory.\n',
	          'To avoid memory leaks, it is recommended that you dispose ',
	          'your geometries and create new ones, or update to ThreeJS r82 or newer.\n',
	          'See here for discussion:\n',
	          'https://github.com/mrdoob/three.js/pull/9631'
	        ].join(''))
	      }
	
	      // Build a new attribute
	      attrib = new THREE.BufferAttribute(data, itemSize);
	    }
	
	    attrib.itemSize = itemSize
	    attrib.needsUpdate = true
	
	    // New versions of ThreeJS suggest using setArray
	    // to change the data. It will use bufferData internally,
	    // so you can change the array size without any issues
	    if (typeof attrib.setArray === 'function') {
	      attrib.setArray(data)
	    }
	
	    return attrib
	  } else {
	    // copy data into the existing array
	    flatten(data, attrib.array)
	    attrib.needsUpdate = true
	    return null
	  }
	}
	
	// Test whether the attribute needs to be re-created,
	// returns false if we can re-use it as-is.
	function rebuildAttribute (attrib, data, itemSize) {
	  if (attrib.itemSize !== itemSize) return true
	  if (!attrib.array) return true
	  var attribLength = attrib.array.length
	  if (Array.isArray(data) && Array.isArray(data[0])) {
	    // [ [ x, y, z ] ]
	    return attribLength !== data.length * itemSize
	  } else {
	    // [ x, y, z ]
	    return attribLength !== data.length
	  }
	  return false
	}


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/*eslint new-cap:0*/
	var dtype = __webpack_require__(14)
	module.exports = flattenVertexData
	function flattenVertexData (data, output, offset) {
	  if (!data) throw new TypeError('must specify data as first parameter')
	  offset = +(offset || 0) | 0
	
	  if (Array.isArray(data) && Array.isArray(data[0])) {
	    var dim = data[0].length
	    var length = data.length * dim
	
	    // no output specified, create a new typed array
	    if (!output || typeof output === 'string') {
	      output = new (dtype(output || 'float32'))(length + offset)
	    }
	
	    var dstLength = output.length - offset
	    if (length !== dstLength) {
	      throw new Error('source length ' + length + ' (' + dim + 'x' + data.length + ')' +
	        ' does not match destination length ' + dstLength)
	    }
	
	    for (var i = 0, k = offset; i < data.length; i++) {
	      for (var j = 0; j < dim; j++) {
	        output[k++] = data[i][j]
	      }
	    }
	  } else {
	    if (!output || typeof output === 'string') {
	      // no output, create a new one
	      var Ctor = dtype(output || 'float32')
	      if (offset === 0) {
	        output = new Ctor(data)
	      } else {
	        output = new Ctor(data.length + offset)
	        output.set(data, offset)
	      }
	    } else {
	      // store output in existing array
	      output.set(data, offset)
	    }
	  }
	
	  return output
	}


/***/ },
/* 19 */
/***/ function(module, exports) {

	/*
	object-assign
	(c) Sindre Sorhus
	@license MIT
	*/
	
	'use strict';
	/* eslint-disable no-unused-vars */
	var getOwnPropertySymbols = Object.getOwnPropertySymbols;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;
	
	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}
	
		return Object(val);
	}
	
	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}
	
			// Detect buggy property enumeration order in older V8 versions.
	
			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}
	
			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}
	
			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}
	
			return true;
		} catch (err) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}
	
	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;
	
		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);
	
			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}
	
			if (getOwnPropertySymbols) {
				symbols = getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}
	
		return to;
	};


/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports.pages = function pages (glyphs) {
	  var pages = new Float32Array(glyphs.length * 4 * 1)
	  var i = 0
	  glyphs.forEach(function (glyph) {
	    var id = glyph.data.page || 0
	    pages[i++] = id
	    pages[i++] = id
	    pages[i++] = id
	    pages[i++] = id
	  })
	  return pages
	}
	
	module.exports.uvs = function uvs (glyphs, texWidth, texHeight, flipY) {
	  var uvs = new Float32Array(glyphs.length * 4 * 2)
	  var i = 0
	  glyphs.forEach(function (glyph) {
	    var bitmap = glyph.data
	    var bw = (bitmap.x + bitmap.width)
	    var bh = (bitmap.y + bitmap.height)
	
	    // top left position
	    var u0 = bitmap.x / texWidth
	    var v1 = bitmap.y / texHeight
	    var u1 = bw / texWidth
	    var v0 = bh / texHeight
	
	    if (flipY) {
	      v1 = (texHeight - bitmap.y) / texHeight
	      v0 = (texHeight - bh) / texHeight
	    }
	
	    // BL
	    uvs[i++] = u0
	    uvs[i++] = v1
	    // TL
	    uvs[i++] = u0
	    uvs[i++] = v0
	    // TR
	    uvs[i++] = u1
	    uvs[i++] = v0
	    // BR
	    uvs[i++] = u1
	    uvs[i++] = v1
	  })
	  return uvs
	}
	
	module.exports.positions = function positions (glyphs) {
	  var positions = new Float32Array(glyphs.length * 4 * 2)
	  var i = 0
	  glyphs.forEach(function (glyph) {
	    var bitmap = glyph.data
	
	    // bottom left position
	    var x = glyph.position[0] + bitmap.xoffset
	    var y = glyph.position[1] + bitmap.yoffset
	
	    // quad size
	    var w = bitmap.width
	    var h = bitmap.height
	
	    // BL
	    positions[i++] = x
	    positions[i++] = y
	    // TL
	    positions[i++] = x
	    positions[i++] = y + h
	    // TR
	    positions[i++] = x + w
	    positions[i++] = y + h
	    // BR
	    positions[i++] = x + w
	    positions[i++] = y
	  })
	  return positions
	}


/***/ },
/* 21 */
/***/ function(module, exports) {

	var itemSize = 2
	var box = { min: [0, 0], max: [0, 0] }
	
	function bounds (positions) {
	  var count = positions.length / itemSize
	  box.min[0] = positions[0]
	  box.min[1] = positions[1]
	  box.max[0] = positions[0]
	  box.max[1] = positions[1]
	
	  for (var i = 0; i < count; i++) {
	    var x = positions[i * itemSize + 0]
	    var y = positions[i * itemSize + 1]
	    box.min[0] = Math.min(x, box.min[0])
	    box.min[1] = Math.min(y, box.min[1])
	    box.max[0] = Math.max(x, box.max[0])
	    box.max[1] = Math.max(y, box.max[1])
	  }
	}
	
	module.exports.computeBox = function (positions, output) {
	  bounds(positions)
	  output.min.set(box.min[0], box.min[1], 0)
	  output.max.set(box.max[0], box.max[1], 0)
	}
	
	module.exports.computeSphere = function (positions, output) {
	  bounds(positions)
	  var minX = box.min[0]
	  var minY = box.min[1]
	  var maxX = box.max[0]
	  var maxY = box.max[1]
	  var width = maxX - minX
	  var height = maxY - minY
	  var length = Math.sqrt(width * width + height * height)
	  output.center.set(minX + width / 2, minY + height / 2, 0)
	  output.radius = length / 2
	}


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var xhr = __webpack_require__(27)
	var noop = function(){}
	var parseASCII = __webpack_require__(33)
	var parseXML = __webpack_require__(34)
	var readBinary = __webpack_require__(37)
	var isBinaryFormat = __webpack_require__(38)
	var xtend = __webpack_require__(9)
	
	var xml2 = (function hasXML2() {
	  return self.XMLHttpRequest && "withCredentials" in new XMLHttpRequest
	})()
	
	module.exports = function(opt, cb) {
	  cb = typeof cb === 'function' ? cb : noop
	
	  if (typeof opt === 'string')
	    opt = { uri: opt }
	  else if (!opt)
	    opt = {}
	
	  var expectBinary = opt.binary
	  if (expectBinary)
	    opt = getBinaryOpts(opt)
	
	  xhr(opt, function(err, res, body) {
	    if (err)
	      return cb(err)
	    if (!/^2/.test(res.statusCode))
	      return cb(new Error('http status code: '+res.statusCode))
	    if (!body)
	      return cb(new Error('no body result'))
	
	    var binary = false 
	
	    //if the response type is an array buffer,
	    //we need to convert it into a regular Buffer object
	    if (isArrayBuffer(body)) {
	      var array = new Uint8Array(body)
	      body = new Buffer(array, 'binary')
	    }
	
	    //now check the string/Buffer response
	    //and see if it has a binary BMF header
	    if (isBinaryFormat(body)) {
	      binary = true
	      //if we have a string, turn it into a Buffer
	      if (typeof body === 'string') 
	        body = new Buffer(body, 'binary')
	    } 
	
	    //we are not parsing a binary format, just ASCII/XML/etc
	    if (!binary) {
	      //might still be a buffer if responseType is 'arraybuffer'
	      if (Buffer.isBuffer(body))
	        body = body.toString(opt.encoding)
	      body = body.trim()
	    }
	
	    var result
	    try {
	      var type = res.headers['content-type']
	      if (binary)
	        result = readBinary(body)
	      else if (/json/.test(type) || body.charAt(0) === '{')
	        result = JSON.parse(body)
	      else if (/xml/.test(type)  || body.charAt(0) === '<')
	        result = parseXML(body)
	      else
	        result = parseASCII(body)
	    } catch (e) {
	      cb(new Error('error parsing font '+e.message))
	      cb = noop
	    }
	    cb(null, result)
	  })
	}
	
	function isArrayBuffer(arr) {
	  var str = Object.prototype.toString
	  return str.call(arr) === '[object ArrayBuffer]'
	}
	
	function getBinaryOpts(opt) {
	  //IE10+ and other modern browsers support array buffers
	  if (xml2)
	    return xtend(opt, { responseType: 'arraybuffer' })
	  
	  if (typeof self.XMLHttpRequest === 'undefined')
	    throw new Error('your browser does not support XHR loading')
	
	  //IE9 and XML1 browsers could still use an override
	  var req = new self.XMLHttpRequest()
	  req.overrideMimeType('text/plain; charset=x-user-defined')
	  return xtend({
	    xhr: req
	  }, opt)
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(23).Buffer))

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */
	
	'use strict'
	
	var base64 = __webpack_require__(24)
	var ieee754 = __webpack_require__(25)
	var isArray = __webpack_require__(26)
	
	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	
	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.
	
	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()
	
	/*
	 * Export kMaxLength after typed array support is determined.
	 */
	exports.kMaxLength = kMaxLength()
	
	function typedArraySupport () {
	  try {
	    var arr = new Uint8Array(1)
	    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
	    return arr.foo() === 42 && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}
	
	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}
	
	function createBuffer (that, length) {
	  if (kMaxLength() < length) {
	    throw new RangeError('Invalid typed array length')
	  }
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = new Uint8Array(length)
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    if (that === null) {
	      that = new Buffer(length)
	    }
	    that.length = length
	  }
	
	  return that
	}
	
	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */
	
	function Buffer (arg, encodingOrOffset, length) {
	  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
	    return new Buffer(arg, encodingOrOffset, length)
	  }
	
	  // Common case.
	  if (typeof arg === 'number') {
	    if (typeof encodingOrOffset === 'string') {
	      throw new Error(
	        'If encoding is specified then the first argument must be a string'
	      )
	    }
	    return allocUnsafe(this, arg)
	  }
	  return from(this, arg, encodingOrOffset, length)
	}
	
	Buffer.poolSize = 8192 // not used by this implementation
	
	// TODO: Legacy, not needed anymore. Remove in next major version.
	Buffer._augment = function (arr) {
	  arr.__proto__ = Buffer.prototype
	  return arr
	}
	
	function from (that, value, encodingOrOffset, length) {
	  if (typeof value === 'number') {
	    throw new TypeError('"value" argument must not be a number')
	  }
	
	  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
	    return fromArrayBuffer(that, value, encodingOrOffset, length)
	  }
	
	  if (typeof value === 'string') {
	    return fromString(that, value, encodingOrOffset)
	  }
	
	  return fromObject(that, value)
	}
	
	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer.from = function (value, encodingOrOffset, length) {
	  return from(null, value, encodingOrOffset, length)
	}
	
	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	  if (typeof Symbol !== 'undefined' && Symbol.species &&
	      Buffer[Symbol.species] === Buffer) {
	    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
	    Object.defineProperty(Buffer, Symbol.species, {
	      value: null,
	      configurable: true
	    })
	  }
	}
	
	function assertSize (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('"size" argument must be a number')
	  } else if (size < 0) {
	    throw new RangeError('"size" argument must not be negative')
	  }
	}
	
	function alloc (that, size, fill, encoding) {
	  assertSize(size)
	  if (size <= 0) {
	    return createBuffer(that, size)
	  }
	  if (fill !== undefined) {
	    // Only pay attention to encoding if it's a string. This
	    // prevents accidentally sending in a number that would
	    // be interpretted as a start offset.
	    return typeof encoding === 'string'
	      ? createBuffer(that, size).fill(fill, encoding)
	      : createBuffer(that, size).fill(fill)
	  }
	  return createBuffer(that, size)
	}
	
	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer.alloc = function (size, fill, encoding) {
	  return alloc(null, size, fill, encoding)
	}
	
	function allocUnsafe (that, size) {
	  assertSize(size)
	  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < size; ++i) {
	      that[i] = 0
	    }
	  }
	  return that
	}
	
	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer.allocUnsafe = function (size) {
	  return allocUnsafe(null, size)
	}
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer.allocUnsafeSlow = function (size) {
	  return allocUnsafe(null, size)
	}
	
	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8'
	  }
	
	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('"encoding" must be a valid string encoding')
	  }
	
	  var length = byteLength(string, encoding) | 0
	  that = createBuffer(that, length)
	
	  var actual = that.write(string, encoding)
	
	  if (actual !== length) {
	    // Writing a hex string, for example, that contains invalid characters will
	    // cause everything after the first invalid character to be ignored. (e.g.
	    // 'abxxcd' will be treated as 'ab')
	    that = that.slice(0, actual)
	  }
	
	  return that
	}
	
	function fromArrayLike (that, array) {
	  var length = array.length < 0 ? 0 : checked(array.length) | 0
	  that = createBuffer(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	function fromArrayBuffer (that, array, byteOffset, length) {
	  array.byteLength // this throws if `array` is not a valid ArrayBuffer
	
	  if (byteOffset < 0 || array.byteLength < byteOffset) {
	    throw new RangeError('\'offset\' is out of bounds')
	  }
	
	  if (array.byteLength < byteOffset + (length || 0)) {
	    throw new RangeError('\'length\' is out of bounds')
	  }
	
	  if (byteOffset === undefined && length === undefined) {
	    array = new Uint8Array(array)
	  } else if (length === undefined) {
	    array = new Uint8Array(array, byteOffset)
	  } else {
	    array = new Uint8Array(array, byteOffset, length)
	  }
	
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = array
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromArrayLike(that, array)
	  }
	  return that
	}
	
	function fromObject (that, obj) {
	  if (Buffer.isBuffer(obj)) {
	    var len = checked(obj.length) | 0
	    that = createBuffer(that, len)
	
	    if (that.length === 0) {
	      return that
	    }
	
	    obj.copy(that, 0, 0, len)
	    return that
	  }
	
	  if (obj) {
	    if ((typeof ArrayBuffer !== 'undefined' &&
	        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
	      if (typeof obj.length !== 'number' || isnan(obj.length)) {
	        return createBuffer(that, 0)
	      }
	      return fromArrayLike(that, obj)
	    }
	
	    if (obj.type === 'Buffer' && isArray(obj.data)) {
	      return fromArrayLike(that, obj.data)
	    }
	  }
	
	  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
	}
	
	function checked (length) {
	  // Note: cannot use `length < kMaxLength()` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}
	
	function SlowBuffer (length) {
	  if (+length != length) { // eslint-disable-line eqeqeq
	    length = 0
	  }
	  return Buffer.alloc(+length)
	}
	
	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}
	
	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }
	
	  if (a === b) return 0
	
	  var x = a.length
	  var y = b.length
	
	  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i]
	      y = b[i]
	      break
	    }
	  }
	
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}
	
	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'latin1':
	    case 'binary':
	    case 'base64':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}
	
	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) {
	    throw new TypeError('"list" argument must be an Array of Buffers')
	  }
	
	  if (list.length === 0) {
	    return Buffer.alloc(0)
	  }
	
	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; ++i) {
	      length += list[i].length
	    }
	  }
	
	  var buffer = Buffer.allocUnsafe(length)
	  var pos = 0
	  for (i = 0; i < list.length; ++i) {
	    var buf = list[i]
	    if (!Buffer.isBuffer(buf)) {
	      throw new TypeError('"list" argument must be an Array of Buffers')
	    }
	    buf.copy(buffer, pos)
	    pos += buf.length
	  }
	  return buffer
	}
	
	function byteLength (string, encoding) {
	  if (Buffer.isBuffer(string)) {
	    return string.length
	  }
	  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
	      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
	    return string.byteLength
	  }
	  if (typeof string !== 'string') {
	    string = '' + string
	  }
	
	  var len = string.length
	  if (len === 0) return 0
	
	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return len
	      case 'utf8':
	      case 'utf-8':
	      case undefined:
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength
	
	function slowToString (encoding, start, end) {
	  var loweredCase = false
	
	  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	  // property of a typed array.
	
	  // This behaves neither like String nor Uint8Array in that we set start/end
	  // to their upper/lower bounds if the value passed is out of range.
	  // undefined is handled specially as per ECMA-262 6th Edition,
	  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	  if (start === undefined || start < 0) {
	    start = 0
	  }
	  // Return early if start > this.length. Done here to prevent potential uint32
	  // coercion fail below.
	  if (start > this.length) {
	    return ''
	  }
	
	  if (end === undefined || end > this.length) {
	    end = this.length
	  }
	
	  if (end <= 0) {
	    return ''
	  }
	
	  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
	  end >>>= 0
	  start >>>= 0
	
	  if (end <= start) {
	    return ''
	  }
	
	  if (!encoding) encoding = 'utf8'
	
	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)
	
	      case 'ascii':
	        return asciiSlice(this, start, end)
	
	      case 'latin1':
	      case 'binary':
	        return latin1Slice(this, start, end)
	
	      case 'base64':
	        return base64Slice(this, start, end)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
	// Buffer instances.
	Buffer.prototype._isBuffer = true
	
	function swap (b, n, m) {
	  var i = b[n]
	  b[n] = b[m]
	  b[m] = i
	}
	
	Buffer.prototype.swap16 = function swap16 () {
	  var len = this.length
	  if (len % 2 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 16-bits')
	  }
	  for (var i = 0; i < len; i += 2) {
	    swap(this, i, i + 1)
	  }
	  return this
	}
	
	Buffer.prototype.swap32 = function swap32 () {
	  var len = this.length
	  if (len % 4 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 32-bits')
	  }
	  for (var i = 0; i < len; i += 4) {
	    swap(this, i, i + 3)
	    swap(this, i + 1, i + 2)
	  }
	  return this
	}
	
	Buffer.prototype.swap64 = function swap64 () {
	  var len = this.length
	  if (len % 8 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 64-bits')
	  }
	  for (var i = 0; i < len; i += 8) {
	    swap(this, i, i + 7)
	    swap(this, i + 1, i + 6)
	    swap(this, i + 2, i + 5)
	    swap(this, i + 3, i + 4)
	  }
	  return this
	}
	
	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}
	
	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}
	
	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}
	
	Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
	  if (!Buffer.isBuffer(target)) {
	    throw new TypeError('Argument must be a Buffer')
	  }
	
	  if (start === undefined) {
	    start = 0
	  }
	  if (end === undefined) {
	    end = target ? target.length : 0
	  }
	  if (thisStart === undefined) {
	    thisStart = 0
	  }
	  if (thisEnd === undefined) {
	    thisEnd = this.length
	  }
	
	  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	    throw new RangeError('out of range index')
	  }
	
	  if (thisStart >= thisEnd && start >= end) {
	    return 0
	  }
	  if (thisStart >= thisEnd) {
	    return -1
	  }
	  if (start >= end) {
	    return 1
	  }
	
	  start >>>= 0
	  end >>>= 0
	  thisStart >>>= 0
	  thisEnd >>>= 0
	
	  if (this === target) return 0
	
	  var x = thisEnd - thisStart
	  var y = end - start
	  var len = Math.min(x, y)
	
	  var thisCopy = this.slice(thisStart, thisEnd)
	  var targetCopy = target.slice(start, end)
	
	  for (var i = 0; i < len; ++i) {
	    if (thisCopy[i] !== targetCopy[i]) {
	      x = thisCopy[i]
	      y = targetCopy[i]
	      break
	    }
	  }
	
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}
	
	// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
	// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
	//
	// Arguments:
	// - buffer - a Buffer to search
	// - val - a string, Buffer, or number
	// - byteOffset - an index into `buffer`; will be clamped to an int32
	// - encoding - an optional encoding, relevant is val is a string
	// - dir - true for indexOf, false for lastIndexOf
	function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
	  // Empty buffer means no match
	  if (buffer.length === 0) return -1
	
	  // Normalize byteOffset
	  if (typeof byteOffset === 'string') {
	    encoding = byteOffset
	    byteOffset = 0
	  } else if (byteOffset > 0x7fffffff) {
	    byteOffset = 0x7fffffff
	  } else if (byteOffset < -0x80000000) {
	    byteOffset = -0x80000000
	  }
	  byteOffset = +byteOffset  // Coerce to Number.
	  if (isNaN(byteOffset)) {
	    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
	    byteOffset = dir ? 0 : (buffer.length - 1)
	  }
	
	  // Normalize byteOffset: negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
	  if (byteOffset >= buffer.length) {
	    if (dir) return -1
	    else byteOffset = buffer.length - 1
	  } else if (byteOffset < 0) {
	    if (dir) byteOffset = 0
	    else return -1
	  }
	
	  // Normalize val
	  if (typeof val === 'string') {
	    val = Buffer.from(val, encoding)
	  }
	
	  // Finally, search either indexOf (if dir is true) or lastIndexOf
	  if (Buffer.isBuffer(val)) {
	    // Special case: looking for empty string/buffer always fails
	    if (val.length === 0) {
	      return -1
	    }
	    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
	  } else if (typeof val === 'number') {
	    val = val & 0xFF // Search for a byte value [0-255]
	    if (Buffer.TYPED_ARRAY_SUPPORT &&
	        typeof Uint8Array.prototype.indexOf === 'function') {
	      if (dir) {
	        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
	      } else {
	        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
	      }
	    }
	    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
	  }
	
	  throw new TypeError('val must be string, number or Buffer')
	}
	
	function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
	  var indexSize = 1
	  var arrLength = arr.length
	  var valLength = val.length
	
	  if (encoding !== undefined) {
	    encoding = String(encoding).toLowerCase()
	    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
	        encoding === 'utf16le' || encoding === 'utf-16le') {
	      if (arr.length < 2 || val.length < 2) {
	        return -1
	      }
	      indexSize = 2
	      arrLength /= 2
	      valLength /= 2
	      byteOffset /= 2
	    }
	  }
	
	  function read (buf, i) {
	    if (indexSize === 1) {
	      return buf[i]
	    } else {
	      return buf.readUInt16BE(i * indexSize)
	    }
	  }
	
	  var i
	  if (dir) {
	    var foundIndex = -1
	    for (i = byteOffset; i < arrLength; i++) {
	      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
	      } else {
	        if (foundIndex !== -1) i -= i - foundIndex
	        foundIndex = -1
	      }
	    }
	  } else {
	    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
	    for (i = byteOffset; i >= 0; i--) {
	      var found = true
	      for (var j = 0; j < valLength; j++) {
	        if (read(arr, i + j) !== read(val, j)) {
	          found = false
	          break
	        }
	      }
	      if (found) return i
	    }
	  }
	
	  return -1
	}
	
	Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
	  return this.indexOf(val, byteOffset, encoding) !== -1
	}
	
	Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
	}
	
	Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
	}
	
	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }
	
	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')
	
	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; ++i) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) return i
	    buf[offset + i] = parsed
	  }
	  return i
	}
	
	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}
	
	function latin1Write (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}
	
	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}
	
	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    throw new Error(
	      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	    )
	  }
	
	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining
	
	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('Attempt to write outside buffer bounds')
	  }
	
	  if (!encoding) encoding = 'utf8'
	
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)
	
	      case 'ascii':
	        return asciiWrite(this, string, offset, length)
	
	      case 'latin1':
	      case 'binary':
	        return latin1Write(this, string, offset, length)
	
	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}
	
	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}
	
	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []
	
	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1
	
	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint
	
	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }
	
	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }
	
	    res.push(codePoint)
	    i += bytesPerSequence
	  }
	
	  return decodeCodePointsArray(res)
	}
	
	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000
	
	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }
	
	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}
	
	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}
	
	function latin1Slice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}
	
	function hexSlice (buf, start, end) {
	  var len = buf.length
	
	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len
	
	  var out = ''
	  for (var i = start; i < end; ++i) {
	    out += toHex(buf[i])
	  }
	  return out
	}
	
	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}
	
	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end
	
	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }
	
	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }
	
	  if (end < start) end = start
	
	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = this.subarray(start, end)
	    newBuf.__proto__ = Buffer.prototype
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; ++i) {
	      newBuf[i] = this[i + start]
	    }
	  }
	
	  return newBuf
	}
	
	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}
	
	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }
	
	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}
	
	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}
	
	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}
	
	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}
	
	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}
	
	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}
	
	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}
	
	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}
	
	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}
	
	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}
	
	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}
	
	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}
	
	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	}
	
	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }
	
	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }
	
	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}
	
	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}
	
	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = 0
	  var mul = 1
	  var sub = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = byteLength - 1
	  var mul = 1
	  var sub = 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	  if (offset < 0) throw new RangeError('Index out of range')
	}
	
	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}
	
	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}
	
	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}
	
	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}
	
	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start
	
	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0
	
	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')
	
	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }
	
	  var len = end - start
	  var i
	
	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; --i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; ++i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, start + len),
	      targetStart
	    )
	  }
	
	  return len
	}
	
	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer.prototype.fill = function fill (val, start, end, encoding) {
	  // Handle string cases:
	  if (typeof val === 'string') {
	    if (typeof start === 'string') {
	      encoding = start
	      start = 0
	      end = this.length
	    } else if (typeof end === 'string') {
	      encoding = end
	      end = this.length
	    }
	    if (val.length === 1) {
	      var code = val.charCodeAt(0)
	      if (code < 256) {
	        val = code
	      }
	    }
	    if (encoding !== undefined && typeof encoding !== 'string') {
	      throw new TypeError('encoding must be a string')
	    }
	    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding)
	    }
	  } else if (typeof val === 'number') {
	    val = val & 255
	  }
	
	  // Invalid ranges are not set to a default, so can range check early.
	  if (start < 0 || this.length < start || this.length < end) {
	    throw new RangeError('Out of range index')
	  }
	
	  if (end <= start) {
	    return this
	  }
	
	  start = start >>> 0
	  end = end === undefined ? this.length : end >>> 0
	
	  if (!val) val = 0
	
	  var i
	  if (typeof val === 'number') {
	    for (i = start; i < end; ++i) {
	      this[i] = val
	    }
	  } else {
	    var bytes = Buffer.isBuffer(val)
	      ? val
	      : utf8ToBytes(new Buffer(val, encoding).toString())
	    var len = bytes.length
	    for (i = 0; i < end - start; ++i) {
	      this[i + start] = bytes[i % len]
	    }
	  }
	
	  return this
	}
	
	// HELPER FUNCTIONS
	// ================
	
	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g
	
	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}
	
	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}
	
	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}
	
	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []
	
	  for (var i = 0; i < length; ++i) {
	    codePoint = string.charCodeAt(i)
	
	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }
	
	        // valid lead
	        leadSurrogate = codePoint
	
	        continue
	      }
	
	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }
	
	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }
	
	    leadSurrogate = null
	
	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }
	
	  return bytes
	}
	
	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}
	
	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    if ((units -= 2) < 0) break
	
	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }
	
	  return byteArray
	}
	
	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}
	
	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; ++i) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}
	
	function isnan (val) {
	  return val !== val // eslint-disable-line no-self-compare
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 24 */
/***/ function(module, exports) {

	'use strict'
	
	exports.byteLength = byteLength
	exports.toByteArray = toByteArray
	exports.fromByteArray = fromByteArray
	
	var lookup = []
	var revLookup = []
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array
	
	var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	for (var i = 0, len = code.length; i < len; ++i) {
	  lookup[i] = code[i]
	  revLookup[code.charCodeAt(i)] = i
	}
	
	revLookup['-'.charCodeAt(0)] = 62
	revLookup['_'.charCodeAt(0)] = 63
	
	function placeHoldersCount (b64) {
	  var len = b64.length
	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }
	
	  // the number of equal signs (place holders)
	  // if there are two placeholders, than the two characters before it
	  // represent one byte
	  // if there is only one, then the three characters before it represent 2 bytes
	  // this is just a cheap hack to not do indexOf twice
	  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
	}
	
	function byteLength (b64) {
	  // base64 is 4/3 + up to two characters of the original data
	  return b64.length * 3 / 4 - placeHoldersCount(b64)
	}
	
	function toByteArray (b64) {
	  var i, j, l, tmp, placeHolders, arr
	  var len = b64.length
	  placeHolders = placeHoldersCount(b64)
	
	  arr = new Arr(len * 3 / 4 - placeHolders)
	
	  // if there are placeholders, only get up to the last complete 4 chars
	  l = placeHolders > 0 ? len - 4 : len
	
	  var L = 0
	
	  for (i = 0, j = 0; i < l; i += 4, j += 3) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
	    arr[L++] = (tmp >> 16) & 0xFF
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }
	
	  if (placeHolders === 2) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
	    arr[L++] = tmp & 0xFF
	  } else if (placeHolders === 1) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }
	
	  return arr
	}
	
	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
	}
	
	function encodeChunk (uint8, start, end) {
	  var tmp
	  var output = []
	  for (var i = start; i < end; i += 3) {
	    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
	    output.push(tripletToBase64(tmp))
	  }
	  return output.join('')
	}
	
	function fromByteArray (uint8) {
	  var tmp
	  var len = uint8.length
	  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
	  var output = ''
	  var parts = []
	  var maxChunkLength = 16383 // must be multiple of 3
	
	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
	  }
	
	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1]
	    output += lookup[tmp >> 2]
	    output += lookup[(tmp << 4) & 0x3F]
	    output += '=='
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
	    output += lookup[tmp >> 10]
	    output += lookup[(tmp >> 4) & 0x3F]
	    output += lookup[(tmp << 2) & 0x3F]
	    output += '='
	  }
	
	  parts.push(output)
	
	  return parts.join('')
	}


/***/ },
/* 25 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]
	
	  i += d
	
	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	
	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	
	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}
	
	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
	
	  value = Math.abs(value)
	
	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }
	
	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }
	
	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
	
	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
	
	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 26 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var window = __webpack_require__(28)
	var isFunction = __webpack_require__(29)
	var parseHeaders = __webpack_require__(30)
	var xtend = __webpack_require__(9)
	
	module.exports = createXHR
	createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
	createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest
	
	forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
	    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
	        options = initParams(uri, options, callback)
	        options.method = method.toUpperCase()
	        return _createXHR(options)
	    }
	})
	
	function forEachArray(array, iterator) {
	    for (var i = 0; i < array.length; i++) {
	        iterator(array[i])
	    }
	}
	
	function isEmpty(obj){
	    for(var i in obj){
	        if(obj.hasOwnProperty(i)) return false
	    }
	    return true
	}
	
	function initParams(uri, options, callback) {
	    var params = uri
	
	    if (isFunction(options)) {
	        callback = options
	        if (typeof uri === "string") {
	            params = {uri:uri}
	        }
	    } else {
	        params = xtend(options, {uri: uri})
	    }
	
	    params.callback = callback
	    return params
	}
	
	function createXHR(uri, options, callback) {
	    options = initParams(uri, options, callback)
	    return _createXHR(options)
	}
	
	function _createXHR(options) {
	    if(typeof options.callback === "undefined"){
	        throw new Error("callback argument missing")
	    }
	
	    var called = false
	    var callback = function cbOnce(err, response, body){
	        if(!called){
	            called = true
	            options.callback(err, response, body)
	        }
	    }
	
	    function readystatechange() {
	        if (xhr.readyState === 4) {
	            loadFunc()
	        }
	    }
	
	    function getBody() {
	        // Chrome with requestType=blob throws errors arround when even testing access to responseText
	        var body = undefined
	
	        if (xhr.response) {
	            body = xhr.response
	        } else {
	            body = xhr.responseText || getXml(xhr)
	        }
	
	        if (isJson) {
	            try {
	                body = JSON.parse(body)
	            } catch (e) {}
	        }
	
	        return body
	    }
	
	    function errorFunc(evt) {
	        clearTimeout(timeoutTimer)
	        if(!(evt instanceof Error)){
	            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
	        }
	        evt.statusCode = 0
	        return callback(evt, failureResponse)
	    }
	
	    // will load the data & process the response in a special response object
	    function loadFunc() {
	        if (aborted) return
	        var status
	        clearTimeout(timeoutTimer)
	        if(options.useXDR && xhr.status===undefined) {
	            //IE8 CORS GET successful response doesn't have a status field, but body is fine
	            status = 200
	        } else {
	            status = (xhr.status === 1223 ? 204 : xhr.status)
	        }
	        var response = failureResponse
	        var err = null
	
	        if (status !== 0){
	            response = {
	                body: getBody(),
	                statusCode: status,
	                method: method,
	                headers: {},
	                url: uri,
	                rawRequest: xhr
	            }
	            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
	                response.headers = parseHeaders(xhr.getAllResponseHeaders())
	            }
	        } else {
	            err = new Error("Internal XMLHttpRequest Error")
	        }
	        return callback(err, response, response.body)
	    }
	
	    var xhr = options.xhr || null
	
	    if (!xhr) {
	        if (options.cors || options.useXDR) {
	            xhr = new createXHR.XDomainRequest()
	        }else{
	            xhr = new createXHR.XMLHttpRequest()
	        }
	    }
	
	    var key
	    var aborted
	    var uri = xhr.url = options.uri || options.url
	    var method = xhr.method = options.method || "GET"
	    var body = options.body || options.data
	    var headers = xhr.headers = options.headers || {}
	    var sync = !!options.sync
	    var isJson = false
	    var timeoutTimer
	    var failureResponse = {
	        body: undefined,
	        headers: {},
	        statusCode: 0,
	        method: method,
	        url: uri,
	        rawRequest: xhr
	    }
	
	    if ("json" in options && options.json !== false) {
	        isJson = true
	        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
	        if (method !== "GET" && method !== "HEAD") {
	            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
	            body = JSON.stringify(options.json === true ? body : options.json)
	        }
	    }
	
	    xhr.onreadystatechange = readystatechange
	    xhr.onload = loadFunc
	    xhr.onerror = errorFunc
	    // IE9 must have onprogress be set to a unique function.
	    xhr.onprogress = function () {
	        // IE must die
	    }
	    xhr.onabort = function(){
	        aborted = true;
	    }
	    xhr.ontimeout = errorFunc
	    xhr.open(method, uri, !sync, options.username, options.password)
	    //has to be after open
	    if(!sync) {
	        xhr.withCredentials = !!options.withCredentials
	    }
	    // Cannot set timeout with sync request
	    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
	    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
	    if (!sync && options.timeout > 0 ) {
	        timeoutTimer = setTimeout(function(){
	            if (aborted) return
	            aborted = true//IE9 may still call readystatechange
	            xhr.abort("timeout")
	            var e = new Error("XMLHttpRequest timeout")
	            e.code = "ETIMEDOUT"
	            errorFunc(e)
	        }, options.timeout )
	    }
	
	    if (xhr.setRequestHeader) {
	        for(key in headers){
	            if(headers.hasOwnProperty(key)){
	                xhr.setRequestHeader(key, headers[key])
	            }
	        }
	    } else if (options.headers && !isEmpty(options.headers)) {
	        throw new Error("Headers cannot be set on an XDomainRequest object")
	    }
	
	    if ("responseType" in options) {
	        xhr.responseType = options.responseType
	    }
	
	    if ("beforeSend" in options &&
	        typeof options.beforeSend === "function"
	    ) {
	        options.beforeSend(xhr)
	    }
	
	    // Microsoft Edge browser sends "undefined" when send is called with undefined value.
	    // XMLHttpRequest spec says to pass null as body to indicate no body
	    // See https://github.com/naugtur/xhr/issues/100.
	    xhr.send(body || null)
	
	    return xhr
	
	
	}
	
	function getXml(xhr) {
	    if (xhr.responseType === "document") {
	        return xhr.responseXML
	    }
	    var firefoxBugTakenEffect = xhr.status === 204 && xhr.responseXML && xhr.responseXML.documentElement.nodeName === "parsererror"
	    if (xhr.responseType === "" && !firefoxBugTakenEffect) {
	        return xhr.responseXML
	    }
	
	    return null
	}
	
	function noop() {}


/***/ },
/* 28 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {if (typeof window !== "undefined") {
	    module.exports = window;
	} else if (typeof global !== "undefined") {
	    module.exports = global;
	} else if (typeof self !== "undefined"){
	    module.exports = self;
	} else {
	    module.exports = {};
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 29 */
/***/ function(module, exports) {

	module.exports = isFunction
	
	var toString = Object.prototype.toString
	
	function isFunction (fn) {
	  var string = toString.call(fn)
	  return string === '[object Function]' ||
	    (typeof fn === 'function' && string !== '[object RegExp]') ||
	    (typeof window !== 'undefined' &&
	     // IE8 and below
	     (fn === window.setTimeout ||
	      fn === window.alert ||
	      fn === window.confirm ||
	      fn === window.prompt))
	};


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var trim = __webpack_require__(31)
	  , forEach = __webpack_require__(32)
	  , isArray = function(arg) {
	      return Object.prototype.toString.call(arg) === '[object Array]';
	    }
	
	module.exports = function (headers) {
	  if (!headers)
	    return {}
	
	  var result = {}
	
	  forEach(
	      trim(headers).split('\n')
	    , function (row) {
	        var index = row.indexOf(':')
	          , key = trim(row.slice(0, index)).toLowerCase()
	          , value = trim(row.slice(index + 1))
	
	        if (typeof(result[key]) === 'undefined') {
	          result[key] = value
	        } else if (isArray(result[key])) {
	          result[key].push(value)
	        } else {
	          result[key] = [ result[key], value ]
	        }
	      }
	  )
	
	  return result
	}

/***/ },
/* 31 */
/***/ function(module, exports) {

	
	exports = module.exports = trim;
	
	function trim(str){
	  return str.replace(/^\s*|\s*$/g, '');
	}
	
	exports.left = function(str){
	  return str.replace(/^\s*/, '');
	};
	
	exports.right = function(str){
	  return str.replace(/\s*$/, '');
	};


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(29)
	
	module.exports = forEach
	
	var toString = Object.prototype.toString
	var hasOwnProperty = Object.prototype.hasOwnProperty
	
	function forEach(list, iterator, context) {
	    if (!isFunction(iterator)) {
	        throw new TypeError('iterator must be a function')
	    }
	
	    if (arguments.length < 3) {
	        context = this
	    }
	    
	    if (toString.call(list) === '[object Array]')
	        forEachArray(list, iterator, context)
	    else if (typeof list === 'string')
	        forEachString(list, iterator, context)
	    else
	        forEachObject(list, iterator, context)
	}
	
	function forEachArray(array, iterator, context) {
	    for (var i = 0, len = array.length; i < len; i++) {
	        if (hasOwnProperty.call(array, i)) {
	            iterator.call(context, array[i], i, array)
	        }
	    }
	}
	
	function forEachString(string, iterator, context) {
	    for (var i = 0, len = string.length; i < len; i++) {
	        // no such thing as a sparse string.
	        iterator.call(context, string.charAt(i), i, string)
	    }
	}
	
	function forEachObject(object, iterator, context) {
	    for (var k in object) {
	        if (hasOwnProperty.call(object, k)) {
	            iterator.call(context, object[k], k, object)
	        }
	    }
	}


/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports = function parseBMFontAscii(data) {
	  if (!data)
	    throw new Error('no data provided')
	  data = data.toString().trim()
	
	  var output = {
	    pages: [],
	    chars: [],
	    kernings: []
	  }
	
	  var lines = data.split(/\r\n?|\n/g)
	
	  if (lines.length === 0)
	    throw new Error('no data in BMFont file')
	
	  for (var i = 0; i < lines.length; i++) {
	    var lineData = splitLine(lines[i], i)
	    if (!lineData) //skip empty lines
	      continue
	
	    if (lineData.key === 'page') {
	      if (typeof lineData.data.id !== 'number')
	        throw new Error('malformed file at line ' + i + ' -- needs page id=N')
	      if (typeof lineData.data.file !== 'string')
	        throw new Error('malformed file at line ' + i + ' -- needs page file="path"')
	      output.pages[lineData.data.id] = lineData.data.file
	    } else if (lineData.key === 'chars' || lineData.key === 'kernings') {
	      //... do nothing for these two ...
	    } else if (lineData.key === 'char') {
	      output.chars.push(lineData.data)
	    } else if (lineData.key === 'kerning') {
	      output.kernings.push(lineData.data)
	    } else {
	      output[lineData.key] = lineData.data
	    }
	  }
	
	  return output
	}
	
	function splitLine(line, idx) {
	  line = line.replace(/\t+/g, ' ').trim()
	  if (!line)
	    return null
	
	  var space = line.indexOf(' ')
	  if (space === -1) 
	    throw new Error("no named row at line " + idx)
	
	  var key = line.substring(0, space)
	
	  line = line.substring(space + 1)
	  //clear "letter" field as it is non-standard and
	  //requires additional complexity to parse " / = symbols
	  line = line.replace(/letter=[\'\"]\S+[\'\"]/gi, '')  
	  line = line.split("=")
	  line = line.map(function(str) {
	    return str.trim().match((/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g))
	  })
	
	  var data = []
	  for (var i = 0; i < line.length; i++) {
	    var dt = line[i]
	    if (i === 0) {
	      data.push({
	        key: dt[0],
	        data: ""
	      })
	    } else if (i === line.length - 1) {
	      data[data.length - 1].data = parseData(dt[0])
	    } else {
	      data[data.length - 1].data = parseData(dt[0])
	      data.push({
	        key: dt[1],
	        data: ""
	      })
	    }
	  }
	
	  var out = {
	    key: key,
	    data: {}
	  }
	
	  data.forEach(function(v) {
	    out.data[v.key] = v.data;
	  })
	
	  return out
	}
	
	function parseData(data) {
	  if (!data || data.length === 0)
	    return ""
	
	  if (data.indexOf('"') === 0 || data.indexOf("'") === 0)
	    return data.substring(1, data.length - 1)
	  if (data.indexOf(',') !== -1)
	    return parseIntList(data)
	  return parseInt(data, 10)
	}
	
	function parseIntList(data) {
	  return data.split(',').map(function(val) {
	    return parseInt(val, 10)
	  })
	}

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var parseAttributes = __webpack_require__(35)
	var parseFromString = __webpack_require__(36)
	
	//In some cases element.attribute.nodeName can return
	//all lowercase values.. so we need to map them to the correct 
	//case
	var NAME_MAP = {
	  scaleh: 'scaleH',
	  scalew: 'scaleW',
	  stretchh: 'stretchH',
	  lineheight: 'lineHeight',
	  alphachnl: 'alphaChnl',
	  redchnl: 'redChnl',
	  greenchnl: 'greenChnl',
	  bluechnl: 'blueChnl'
	}
	
	module.exports = function parse(data) {
	  data = data.toString()
	  
	  var xmlRoot = parseFromString(data)
	  var output = {
	    pages: [],
	    chars: [],
	    kernings: []
	  }
	
	  //get config settings
	  ;['info', 'common'].forEach(function(key) {
	    var element = xmlRoot.getElementsByTagName(key)[0]
	    if (element)
	      output[key] = parseAttributes(getAttribs(element))
	  })
	
	  //get page info
	  var pageRoot = xmlRoot.getElementsByTagName('pages')[0]
	  if (!pageRoot)
	    throw new Error('malformed file -- no <pages> element')
	  var pages = pageRoot.getElementsByTagName('page')
	  for (var i=0; i<pages.length; i++) {
	    var p = pages[i]
	    var id = parseInt(p.getAttribute('id'), 10)
	    var file = p.getAttribute('file')
	    if (isNaN(id))
	      throw new Error('malformed file -- page "id" attribute is NaN')
	    if (!file)
	      throw new Error('malformed file -- needs page "file" attribute')
	    output.pages[parseInt(id, 10)] = file
	  }
	
	  //get kernings / chars
	  ;['chars', 'kernings'].forEach(function(key) {
	    var element = xmlRoot.getElementsByTagName(key)[0]
	    if (!element)
	      return
	    var childTag = key.substring(0, key.length-1)
	    var children = element.getElementsByTagName(childTag)
	    for (var i=0; i<children.length; i++) {      
	      var child = children[i]
	      output[key].push(parseAttributes(getAttribs(child)))
	    }
	  })
	  return output
	}
	
	function getAttribs(element) {
	  var attribs = getAttribList(element)
	  return attribs.reduce(function(dict, attrib) {
	    var key = mapName(attrib.nodeName)
	    dict[key] = attrib.nodeValue
	    return dict
	  }, {})
	}
	
	function getAttribList(element) {
	  //IE8+ and modern browsers
	  var attribs = []
	  for (var i=0; i<element.attributes.length; i++)
	    attribs.push(element.attributes[i])
	  return attribs
	}
	
	function mapName(nodeName) {
	  return NAME_MAP[nodeName.toLowerCase()] || nodeName
	}

/***/ },
/* 35 */
/***/ function(module, exports) {

	//Some versions of GlyphDesigner have a typo
	//that causes some bugs with parsing. 
	//Need to confirm with recent version of the software
	//to see whether this is still an issue or not.
	var GLYPH_DESIGNER_ERROR = 'chasrset'
	
	module.exports = function parseAttributes(obj) {
	  if (GLYPH_DESIGNER_ERROR in obj) {
	    obj['charset'] = obj[GLYPH_DESIGNER_ERROR]
	    delete obj[GLYPH_DESIGNER_ERROR]
	  }
	
	  for (var k in obj) {
	    if (k === 'face' || k === 'charset') 
	      continue
	    else if (k === 'padding' || k === 'spacing')
	      obj[k] = parseIntList(obj[k])
	    else
	      obj[k] = parseInt(obj[k], 10) 
	  }
	  return obj
	}
	
	function parseIntList(data) {
	  return data.split(',').map(function(val) {
	    return parseInt(val, 10)
	  })
	}

/***/ },
/* 36 */
/***/ function(module, exports) {

	module.exports = (function xmlparser() {
	  //common browsers
	  if (typeof window.DOMParser !== 'undefined') {
	    return function(str) {
	      var parser = new window.DOMParser()
	      return parser.parseFromString(str, 'application/xml')
	    }
	  } 
	
	  //IE8 fallback
	  if (typeof window.ActiveXObject !== 'undefined'
	      && new window.ActiveXObject('Microsoft.XMLDOM')) {
	    return function(str) {
	      var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM")
	      xmlDoc.async = "false"
	      xmlDoc.loadXML(str)
	      return xmlDoc
	    }
	  }
	
	  //last resort fallback
	  return function(str) {
	    var div = document.createElement('div')
	    div.innerHTML = str
	    return div
	  }
	})()

/***/ },
/* 37 */
/***/ function(module, exports) {

	var HEADER = [66, 77, 70]
	
	module.exports = function readBMFontBinary(buf) {
	  if (buf.length < 6)
	    throw new Error('invalid buffer length for BMFont')
	
	  var header = HEADER.every(function(byte, i) {
	    return buf.readUInt8(i) === byte
	  })
	
	  if (!header)
	    throw new Error('BMFont missing BMF byte header')
	
	  var i = 3
	  var vers = buf.readUInt8(i++)
	  if (vers > 3)
	    throw new Error('Only supports BMFont Binary v3 (BMFont App v1.10)')
	  
	  var target = { kernings: [], chars: [] }
	  for (var b=0; b<5; b++)
	    i += readBlock(target, buf, i)
	  return target
	}
	
	function readBlock(target, buf, i) {
	  if (i > buf.length-1)
	    return 0
	
	  var blockID = buf.readUInt8(i++)
	  var blockSize = buf.readInt32LE(i)
	  i += 4
	
	  switch(blockID) {
	    case 1: 
	      target.info = readInfo(buf, i)
	      break
	    case 2:
	      target.common = readCommon(buf, i)
	      break
	    case 3:
	      target.pages = readPages(buf, i, blockSize)
	      break
	    case 4:
	      target.chars = readChars(buf, i, blockSize)
	      break
	    case 5:
	      target.kernings = readKernings(buf, i, blockSize)
	      break
	  }
	  return 5 + blockSize
	}
	
	function readInfo(buf, i) {
	  var info = {}
	  info.size = buf.readInt16LE(i)
	
	  var bitField = buf.readUInt8(i+2)
	  info.smooth = (bitField >> 7) & 1
	  info.unicode = (bitField >> 6) & 1
	  info.italic = (bitField >> 5) & 1
	  info.bold = (bitField >> 4) & 1
	  
	  //fixedHeight is only mentioned in binary spec 
	  if ((bitField >> 3) & 1)
	    info.fixedHeight = 1
	  
	  info.charset = buf.readUInt8(i+3) || ''
	  info.stretchH = buf.readUInt16LE(i+4)
	  info.aa = buf.readUInt8(i+6)
	  info.padding = [
	    buf.readInt8(i+7),
	    buf.readInt8(i+8),
	    buf.readInt8(i+9),
	    buf.readInt8(i+10)
	  ]
	  info.spacing = [
	    buf.readInt8(i+11),
	    buf.readInt8(i+12)
	  ]
	  info.outline = buf.readUInt8(i+13)
	  info.face = readStringNT(buf, i+14)
	  return info
	}
	
	function readCommon(buf, i) {
	  var common = {}
	  common.lineHeight = buf.readUInt16LE(i)
	  common.base = buf.readUInt16LE(i+2)
	  common.scaleW = buf.readUInt16LE(i+4)
	  common.scaleH = buf.readUInt16LE(i+6)
	  common.pages = buf.readUInt16LE(i+8)
	  var bitField = buf.readUInt8(i+10)
	  common.packed = 0
	  common.alphaChnl = buf.readUInt8(i+11)
	  common.redChnl = buf.readUInt8(i+12)
	  common.greenChnl = buf.readUInt8(i+13)
	  common.blueChnl = buf.readUInt8(i+14)
	  return common
	}
	
	function readPages(buf, i, size) {
	  var pages = []
	  var text = readNameNT(buf, i)
	  var len = text.length+1
	  var count = size / len
	  for (var c=0; c<count; c++) {
	    pages[c] = buf.slice(i, i+text.length).toString('utf8')
	    i += len
	  }
	  return pages
	}
	
	function readChars(buf, i, blockSize) {
	  var chars = []
	
	  var count = blockSize / 20
	  for (var c=0; c<count; c++) {
	    var char = {}
	    var off = c*20
	    char.id = buf.readUInt32LE(i + 0 + off)
	    char.x = buf.readUInt16LE(i + 4 + off)
	    char.y = buf.readUInt16LE(i + 6 + off)
	    char.width = buf.readUInt16LE(i + 8 + off)
	    char.height = buf.readUInt16LE(i + 10 + off)
	    char.xoffset = buf.readInt16LE(i + 12 + off)
	    char.yoffset = buf.readInt16LE(i + 14 + off)
	    char.xadvance = buf.readInt16LE(i + 16 + off)
	    char.page = buf.readUInt8(i + 18 + off)
	    char.chnl = buf.readUInt8(i + 19 + off)
	    chars[c] = char
	  }
	  return chars
	}
	
	function readKernings(buf, i, blockSize) {
	  var kernings = []
	  var count = blockSize / 10
	  for (var c=0; c<count; c++) {
	    var kern = {}
	    var off = c*10
	    kern.first = buf.readUInt32LE(i + 0 + off)
	    kern.second = buf.readUInt32LE(i + 4 + off)
	    kern.amount = buf.readInt16LE(i + 8 + off)
	    kernings[c] = kern
	  }
	  return kernings
	}
	
	function readNameNT(buf, offset) {
	  var pos=offset
	  for (; pos<buf.length; pos++) {
	    if (buf[pos] === 0x00) 
	      break
	  }
	  return buf.slice(offset, pos)
	}
	
	function readStringNT(buf, offset) {
	  return readNameNT(buf, offset).toString('utf8')
	}

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var equal = __webpack_require__(39)
	var HEADER = new Buffer([66, 77, 70, 3])
	
	module.exports = function(buf) {
	  if (typeof buf === 'string')
	    return buf.substring(0, 3) === 'BMF'
	  return buf.length > 4 && equal(buf.slice(0, 4), HEADER)
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(23).Buffer))

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var Buffer = __webpack_require__(23).Buffer; // for use with browserify
	
	module.exports = function (a, b) {
	    if (!Buffer.isBuffer(a)) return undefined;
	    if (!Buffer.isBuffer(b)) return undefined;
	    if (typeof a.equals === 'function') return a.equals(b);
	    if (a.length !== b.length) return false;
	    
	    for (var i = 0; i < a.length; i++) {
	        if (a[i] !== b[i]) return false;
	    }
	    
	    return true;
	};


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var assign = __webpack_require__(19)
	
	module.exports = function createSDFShader (opt) {
	  opt = opt || {}
	  var opacity = typeof opt.opacity === 'number' ? opt.opacity : 1
	  var alphaTest = typeof opt.alphaTest === 'number' ? opt.alphaTest : 0.0001
	  var precision = opt.precision || 'highp'
	  var color = opt.color
	  var map = opt.map
	
	  // remove to satisfy r73
	  delete opt.map
	  delete opt.color
	  delete opt.precision
	  delete opt.opacity
	
	  return assign({
	    uniforms: {
	      opacity: { type: 'f', value: opacity },
	      map: { type: 't', value: map || new THREE.Texture() },
	      color: { type: 'c', value: new THREE.Color(color) }
	    },
	    vertexShader: [
	      'attribute vec2 uv;',
	      'attribute vec4 position;',
	      'uniform mat4 projectionMatrix;',
	      'uniform mat4 modelViewMatrix;',
	      'varying vec2 vUv;',
	      'void main() {',
	      'vUv = uv;',
	      'gl_Position = projectionMatrix * modelViewMatrix * position;',
	      '}'
	    ].join('\n'),
	    fragmentShader: [
	      '#ifdef GL_OES_standard_derivatives',
	      '#extension GL_OES_standard_derivatives : enable',
	      '#endif',
	      'precision ' + precision + ' float;',
	      'uniform float opacity;',
	      'uniform vec3 color;',
	      'uniform sampler2D map;',
	      'varying vec2 vUv;',
	
	      'float aastep(float value) {',
	      '  #ifdef GL_OES_standard_derivatives',
	      '    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;',
	      '  #else',
	      '    float afwidth = (1.0 / 32.0) * (1.4142135623730951 / (2.0 * gl_FragCoord.w));',
	      '  #endif',
	      '  return smoothstep(0.5 - afwidth, 0.5 + afwidth, value);',
	      '}',
	
	      'void main() {',
	      '  vec4 texColor = texture2D(map, vUv);',
	      '  float alpha = aastep(texColor.a);',
	      '  gl_FragColor = vec4(color, opacity * alpha);',
	      alphaTest === 0
	        ? ''
	        : '  if (gl_FragColor.a < ' + alphaTest + ') discard;',
	      '}'
	    ].join('\n')
	  }, opt)
	}


/***/ },
/* 41 */
/***/ function(module, exports) {

	/* global AFRAME */
	
	/* Experimental text primitive.
	 * Issues: color not changing, removeAttribute() not working, mixing primitive with regular entities fails
	 * Color issue relates to: https://github.com/donmccurdy/aframe-extras/blob/master/src/primitives/a-ocean.js#L44
	 */
	
	var extendDeep = AFRAME.utils.extendDeep;
	var meshMixin = AFRAME.primitives.getMeshMixin();
	
	AFRAME.registerPrimitive('a-text', extendDeep({}, meshMixin, {
	  defaultComponents: {
	    'bmfont-text': {}
	  },
	  mappings: {
	    text: 'bmfont-text.text',
	    width: 'bmfont-text.width',
	    align: 'bmfont-text.align',
	    letterSpacing: 'bmfont-text.letterSpacing',
	    lineHeight: 'bmfont-text.lineHeight',
	    fnt: 'bmfont-text.fnt',
	    fntImage: 'bmfont-text.fntImage',
	    mode: 'bmfont-text.mode',
	    color: 'bmfont-text.color',
	    opacity: 'bmfont-text.opacity'
	  }
	}));


/***/ },
/* 42 */
/***/ function(module, exports) {

	'use strict';
	
	/* aframe-select-bar component -- attempt to pull out select bar code from city builder logic */
	
	/* for testing in console:
	menuEl = document.getElementById("menu");
	menuEl.emit("onOptionNext");
	menuEl.emit("onOptionPrevious");
	*/
	
	// NOTES:
	// at least one optgroup required, at leasy 7 options required per optgroup
	// 5 or 6 options per optgroup may work, needs testing
	// 4 and below should be no scroll
	
	
	if (typeof AFRAME === 'undefined') {
	  throw new Error('Component attempted to register before AFRAME was available.');
	}
	
	// HELPER FUNCTIONS
	// find an element's original index position in an array by searching on an element's value in the array
	function findWithAttr(array, attr, value) {
	  // find a
	  for (var i = 0; i < array.length; i += 1) {
	    if (array[i][attr] === value) {
	      return i;
	    }
	  }
	  return -1;
	}
	
	// for a given array, find the largest value and return the value of the index thereof (0-based index)
	function indexOfMax(arr) {
	  if (arr.length === 0) {
	    return -1;
	  }
	  var max = arr[0];
	  var maxIndex = 0;
	  for (var i = 1; i < arr.length; i++) {
	    if (arr[i] > max) {
	      maxIndex = i;
	      max = arr[i];
	    }
	  }
	  return maxIndex;
	}
	
	// provide a valid Index for an Array if the desiredIndex is greater or less than an array's length by "looping" around
	function loopIndex(desiredIndex, arrayLength) {
	  // expects a 0 based index
	  if (desiredIndex > arrayLength - 1) {
	    return desiredIndex - arrayLength;
	  }
	  if (desiredIndex < 0) {
	    return arrayLength + desiredIndex;
	  }
	  return desiredIndex;
	}
	// Ghetto testing of loopIndex helper function
	function assert(condition, message) {
	  //    console.log(condition.stringify);
	  if (!condition) {
	    message = message || "Assertion failed";
	    if (typeof Error !== "undefined") {
	      throw new Error(message);
	    }
	    throw message; // Fallback
	  }
	}
	var testLoopArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	assert(loopIndex(9, testLoopArray.length) == 9);
	assert(loopIndex(10, testLoopArray.length) == 0);
	assert(loopIndex(11, testLoopArray.length) == 1);
	assert(loopIndex(0, testLoopArray.length) == 0);
	assert(loopIndex(-1, testLoopArray.length) == 9);
	assert(loopIndex(-2, testLoopArray.length) == 8);
	
	AFRAME.registerComponent('select-bar', {
	  schema: {
	    controls: { type: 'boolean', default: true },
	    controllerID: { type: 'string', default: 'rightController' },
	    selectedOptgroupValue: { type: 'string' }, // not intended to be set when defining component, used for tracking state
	    selectedOptgroupIndex: { type: 'int', default: 0 }, // not intended to be set when defining component, used for tracking state
	    selectedOptionValue: { type: 'string' }, // not intended to be set when defining component, used for tracking state
	    selectedOptionIndex: { type: 'int', default: 0 } // not intended to be set when defining component, used for tracking state
	  },
	
	  // for a given optgroup, make the childrens
	  makeSelectOptionsRow: function makeSelectOptionsRow(selectedOptgroupEl, parentEl, index) {
	    var offsetY = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
	
	
	    // make the optgroup label
	    var optgroupLabelEl = document.createElement("a-entity");
	    optgroupLabelEl.id = "optgroupLabel" + index;
	    optgroupLabelEl.setAttribute("position", "-0.18 " + (0.045 + offsetY) + " -0.003");
	    optgroupLabelEl.setAttribute("scale", "0.125 0.125 0.125");
	    optgroupLabelEl.setAttribute("bmfont-text", "text", selectedOptgroupEl.getAttribute('label'));
	    optgroupLabelEl.setAttribute("bmfont-text", "color", "#747474");
	    parentEl.appendChild(optgroupLabelEl);
	
	    // get the options available for this optgroup row
	    var optionsElements = selectedOptgroupEl.getElementsByTagName("option"); // the actual JS children elements
	
	    // convert the NodeList of matching option elements into a Javascript Array
	    var optionsElementsArray = Array.prototype.slice.call(optionsElements);
	
	    var firstArray = optionsElementsArray.slice(0, 4); // get items 0 - 4
	    var previewArray = optionsElementsArray.slice(-3); // get the 3 LAST items of the array
	
	    // Combine into "menuArray", a list of currently visible options where the middle index is the currently selected object
	    var menuArray = previewArray.concat(firstArray);
	
	    var selectOptionsHTML = "";
	    var startPositionX = -0.225;
	    var deltaX = 0.075;
	
	    // For each menu option, create a preview element and its appropriate children
	    menuArray.forEach(function (element, menuArrayIndex) {
	      var visible = menuArrayIndex === 0 || menuArrayIndex === 6 ? false : true;
	      var selected = menuArrayIndex === 3;
	      // index of the optionsElementsArray where optionsElementsArray.element.getattribute("value") = element.getattribute("value")
	      var originalOptionsArrayIndex = findWithAttr(optionsElementsArray, "value", element.getAttribute("value"));
	      selectOptionsHTML += '\n      <a-entity id="menu' + originalOptionsArrayIndex + '" visible="' + visible + '" class="preview' + (selected ? " selected" : "") + '" optionid="' + originalOptionsArrayIndex + '" value="' + element.getAttribute("value") + '" optgroup="' + selectedOptgroupEl.getAttribute("value") + '" position="' + startPositionX + ' ' + offsetY + ' 0">\n        <a-box class="previewFrame" position="0 0 -0.003" scale="0.06 0.06 0.005" material="color: ' + (selected ? "yellow" : "#222222") + '"></a-box>\n        <a-image class="previewImage" scale="0.05 0.05 0.05" src="' + element.getAttribute("src") + '" ></a-image>\n        <a-entity class="objectName" position="-0.025 -0.04 -0.003" scale="0.05 0.05 0.05" bmfont-text="text: ' + element.text + '; color: ' + (selected ? "yellow" : "#747474") + '"></a-entity>\n      </a-entity>';
	      startPositionX += deltaX;
	    });
	
	    // Append these menu options to a new element with id of "selectOptionsRow"
	    var selectOptionsRowEl = document.createElement("a-entity");
	    selectOptionsRowEl.id = "selectOptionsRow" + index;
	    selectOptionsRowEl.innerHTML = selectOptionsHTML;
	    parentEl.appendChild(selectOptionsRowEl);
	  },
	
	  removeSelectOptionsRow: function removeSelectOptionsRow(index) {
	    // find the appropriate select options row
	    var selectOptionsRowEl = document.getElementById("selectOptionsRow" + index);
	    var optgroupLabelEl = document.getElementById("optgroupLabel" + index);
	
	    console.log("try to remove children");
	    // delete all children of selectOptionsRowEl
	    while (selectOptionsRowEl.firstChild) {
	      selectOptionsRowEl.removeChild(selectOptionsRowEl.firstChild);
	    }
	    console.log("children removed");
	
	    // delete selectOptionsRowEl and optgroupLabelEl
	    optgroupLabelEl.parentNode.removeChild(optgroupLabelEl);
	    selectOptionsRowEl.parentNode.removeChild(selectOptionsRowEl);
	  },
	
	  init: function init() {
	    // Create select bar menu from html child `option` elements beneath parent entity inspired by the html5 spec: http://www.w3schools.com/tags/tag_optgroup.asp
	    var selectEl = this.el; // Reference to the component's entity.
	    this.data.lastTime = new Date();
	
	    // Create the "frame" of the select menu bar
	    var selectRenderEl = document.createElement("a-entity");
	    selectRenderEl.id = "selectRender";
	    selectRenderEl.innerHTML = '\n      <a-box id="menuFrame" scale="0.4 0.15 0.005" position="0 0 -0.0075"  material="opacity: 0.5; transparent: true; color: #000000"></a-box>\n      <a-entity id="arrowRight" position="0.225 0 0" rotation="90 180 0" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>\n      <a-entity id="arrowLeft" position="-0.225 0 0" rotation="90 180 0" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity:0.5; transparent:true; color:#000000"></a-entity>\n      <a-entity id="arrowUp" position="0 0.1 0" rotation="0 270 90" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>\n      <a-entity id="arrowDown" position="0 -0.1 0" rotation="0 270 90" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>\n      ';
	    selectEl.appendChild(selectRenderEl);
	
	    var optgroups = selectEl.getElementsByTagName("optgroup"); // Get the optgroups
	    var selectedOptgroupEl = optgroups[this.data.selectedOptgroupIndex]; // fetch the currently selected optgroup
	    this.data.selectedOptgroupValue = selectedOptgroupEl.getAttribute("value"); // set component property to opgroup value
	
	    this.makeSelectOptionsRow(selectedOptgroupEl, selectRenderEl, this.data.selectedOptgroupIndex);
	  },
	
	  addEventListeners: function addEventListeners() {
	    // If controls = true and a controllerID has been provided, then add controller event listeners
	    if (this.data.controls && this.data.controllerID) {
	      var controllerEl = document.getElementById(this.data.controllerID);
	      controllerEl.addEventListener('trackpaddown', this.onTrackpadDown.bind(this));
	      controllerEl.addEventListener('axismove', this.onAxisMove.bind(this));
	    }
	
	    var el = this.el;
	    el.addEventListener('onHoverLeft', this.onHoverLeft.bind(this));
	    el.addEventListener('onHoverRight', this.onHoverRight.bind(this));
	    el.addEventListener('onOptionSwitch', this.onOptionSwitch.bind(this));
	    el.addEventListener('onOptionNext', this.onOptionNext.bind(this));
	    el.addEventListener('onOptionPrevious', this.onOptionPrevious.bind(this));
	    el.addEventListener('onOptgroupNext', this.onOptgroupNext.bind(this));
	    el.addEventListener('onOptgroupPrevious', this.onOptgroupPrevious.bind(this));
	  },
	
	  /**
	   * Remove event listeners.
	   */
	  removeEventListeners: function removeEventListeners() {
	    if (this.data.controls && this.data.controllerID) {
	      var controllerEl = document.getElementById(this.data.controllerID);
	      controllerEl.removeEventListener('trackpaddown', this.onTrackpadDown);
	      controllerEl.removeEventListener('axismove', this.onAxisMove);
	    }
	
	    var el = this.el;
	    el.removeEventListener('onOptionSwitch', this.onOptionSwitch);
	    el.removeEventListener('onHoverRight', this.onHoverRight);
	    el.removeEventListener('onHoverLeft', this.onHoverLeft);
	    el.removeEventListener('onOptionNext', this.onOptionNext);
	    el.removeEventListener('onOptionPrevious', this.onOptionPrevious);
	    el.removeEventListener('onOptgroupNext', this.onOptgroupNext);
	    el.removeEventListener('onOptgroupPrevious', this.onOptgroupPrevious);
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
	
	  onAxisMove: function onAxisMove(evt) {
	    // menu: used for determining current axis of trackpad hover position
	    if (evt.target.id != this.data.controllerID) {
	      //menu: only deal with trackpad events from right controller
	      return;
	    }
	
	    // only run this function if there is some value for at least one axis
	    if (evt.detail.axis[0] === 0 && evt.detail.axis[1] === 0) {
	      return;
	    }
	
	    var isOculus = false;
	    var gamepads = navigator.getGamepads();
	    if (gamepads) {
	      for (var i = 0; i < gamepads.length; i++) {
	        var gamepad = gamepads[i];
	        if (gamepad) {
	          if (gamepad.id.indexOf('Oculus Touch') === 0) {
	            console.log("isOculus");
	            isOculus = true;
	          }
	        }
	      }
	    }
	
	    //    console.log("axis[0]: " + evt.detail.axis[0] + " left -1; right +1");
	    //    console.log("axis[1]: " + evt.detail.axis[1] + " down -1; up +1");
	    //    console.log(evt.target.id);
	
	    // which axis has largest absolute value? then use that axis value to determine hover position
	    //    console.log(evt.detail.axis[0]);
	    if (Math.abs(evt.detail.axis[0]) > Math.abs(evt.detail.axis[1])) {
	      // if x axis absolute value (left/right) is greater than y axis (down/up)
	      if (evt.detail.axis[0] > 0) {
	        // if the right axis is greater than 0 (midpoint)
	        this.onHoverRight();
	      } else {
	        this.onHoverLeft();
	      }
	    } else {
	
	      if (isOculus) {
	        var yAxis = -evt.detail.axis[1];
	      } else {
	        var yAxis = evt.detail.axis[1];
	      }
	
	      if (yAxis > 0) {
	        // if the up axis is greater than 0 (midpoint)
	        this.onHoverUp();
	      } else {
	        this.onHoverDown();
	      }
	    }
	
	    // if using the oculus touch controls, and thumbstick is >85% in any direction then fire ontrackpaddown
	    var gamepads = navigator.getGamepads();
	    if (gamepads) {
	      for (var i = 0; i < gamepads.length; i++) {
	        var gamepad = gamepads[i];
	        if (gamepad) {
	          if (gamepad.id.indexOf('Oculus Touch') === 0) {
	            if (Math.abs(evt.detail.axis[0]) > 0.85 || Math.abs(evt.detail.axis[1]) > 0.85) {
	
	              // debounce (throttle) such that this only runs once every 1/2 second max
	              var thisTime = new Date();
	              if (Math.floor(thisTime - this.data.lastTime) > 500) {
	                this.data.lastTime = thisTime;
	                this.onTrackpadDown(evt);
	              }
	
	              return;
	            }
	          }
	        }
	      }
	    }
	  },
	
	  onHoverRight: function onHoverRight() {
	    this.el.emit("menuHoverRight");
	    var arrow = document.getElementById("arrowRight");
	    var currentArrowColor = new THREE.Color(arrow.getAttribute("material").color);
	    if (currentArrowColor.r === 0) {
	      // if not already some shade of yellow (which indicates recent button press) then animate green hover
	      arrow.removeAttribute('animation__color');
	      arrow.removeAttribute('animation__opacity');
	      arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#00FF00", to: "#000000" });
	      arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
	    }
	  },
	
	  onHoverLeft: function onHoverLeft() {
	    this.el.emit("menuHoverLeft");
	    var arrow = document.getElementById("arrowLeft");
	    var currentArrowColor = new THREE.Color(arrow.getAttribute("material").color);
	    if (currentArrowColor.r === 0) {
	      // if not already some shade of yellow (which indicates recent button press) then animate green hover
	      arrow.removeAttribute('animation__color');
	      arrow.removeAttribute('animation__opacity');
	      arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#00FF00", to: "#000000" });
	      arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
	    }
	  },
	
	  onHoverDown: function onHoverDown() {
	    this.el.emit("menuHoverDown");
	    var selectEl = this.el;
	    var optgroups = selectEl.getElementsByTagName("optgroup"); // Get the optgroups
	
	    var arrow = document.getElementById("arrowDown");
	    var currentArrowColor = new THREE.Color(arrow.getAttribute("material").color);
	    if (!(currentArrowColor.r > 0 && currentArrowColor.g > 0)) {
	      // if not already some shade of yellow (which indicates recent button press) then animate green hover
	      if (this.data.selectedOptgroupIndex + 2 > optgroups.length) {
	        // CAN'T DO - ALREADY AT END OF LIST
	        var arrowColor = "#FF0000";
	      } else {
	        var arrowColor = "#00FF00";
	      }
	      arrow.removeAttribute('animation__color');
	      arrow.removeAttribute('animation__opacity');
	      arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: arrowColor, to: "#000000" });
	      arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
	    }
	  },
	
	  onHoverUp: function onHoverUp() {
	    this.el.emit("menuHoverUp");
	    var selectEl = this.el;
	    var optgroups = selectEl.getElementsByTagName("optgroup"); // Get the optgroups
	
	    var arrow = document.getElementById("arrowUp");
	    var currentArrowColor = new THREE.Color(arrow.getAttribute("material").color);
	    if (!(currentArrowColor.r > 0 && currentArrowColor.g > 0)) {
	      // if not already some shade of yellow (which indicates recent button press) then animate green hover
	      if (this.data.selectedOptgroupIndex - 1 < 0) {
	        // CAN'T DO - ALREADY AT END OF LIST
	        var arrowColor = "#FF0000";
	      } else {
	        var arrowColor = "#00FF00";
	      }
	      arrow.removeAttribute('animation__color');
	      arrow.removeAttribute('animation__opacity');
	      arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: arrowColor, to: "#000000" });
	      arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
	    }
	  },
	
	  onOptionNext: function onOptionNext(evt) {
	    this.onOptionSwitch("next");
	  },
	
	  onOptionPrevious: function onOptionPrevious(evt) {
	    this.onOptionSwitch("previous");
	  },
	
	  onOptgroupNext: function onOptgroupNext(evt) {
	    var selectEl = this.el;
	    var optgroups = selectEl.getElementsByTagName("optgroup"); // Get the optgroups
	    var selectRenderEl = document.getElementById("selectRender");
	
	    if (this.data.selectedOptgroupIndex + 2 > optgroups.length) {
	      // CAN'T DO THIS, show red arrow
	      var arrow = document.getElementById("arrowDown");
	      arrow.removeAttribute('animation__color');
	      arrow.removeAttribute('animation__opacity');
	      arrow.removeAttribute('animation__scale');
	      arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FF0000", to: "#000000" });
	      arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
	      arrow.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "-0.006 0.003 0.006", to: "-0.004 0.002 0.004" });
	    } else {
	      // CAN DO THIS, show next optgroup
	
	      this.removeSelectOptionsRow(this.data.selectedOptgroupIndex); // remove the old optgroup row
	
	      this.data.selectedOptgroupIndex += 1;
	      var selectedOptgroupEl = optgroups[this.data.selectedOptgroupIndex]; // fetch the currently selected optgroup
	      this.data.selectedOptgroupValue = selectedOptgroupEl.getAttribute("value"); // set component property to opgroup value
	
	      this.el.flushToDOM();
	
	      var nextSelectedOptgroupEl = optgroups[this.data.selectedOptgroupIndex]; // fetch the currently selected optgroup
	      // this.makeSelectOptionsRow(nextSelectedOptgroupEl, selectRenderEl, this.data.selectedOptgroupIndex, -0.15);
	      this.makeSelectOptionsRow(nextSelectedOptgroupEl, selectRenderEl, this.data.selectedOptgroupIndex);
	
	      // Change selected option element when optgroup is changed
	      var selectOptionsRowEl = document.getElementById('selectOptionsRow' + this.data.selectedOptgroupIndex);
	      var newlySelectedMenuEl = selectOptionsRowEl.getElementsByClassName('selected')[0];
	
	      // update selectOptionsValue and Index
	      this.data.selectedOptionValue = newlySelectedMenuEl.getAttribute("value");
	      this.data.selectedOptionIndex = newlySelectedMenuEl.getAttribute("optionid");
	
	      this.el.flushToDOM();
	
	      this.el.emit("menuOptgroupNext");
	      this.el.emit("menuChanged");
	
	      var arrow = document.getElementById("arrowDown");
	      arrow.removeAttribute('animation__color');
	      arrow.removeAttribute('animation__opacity');
	      arrow.removeAttribute('animation__scale');
	      arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FFFF00", to: "#000000" });
	      arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
	      arrow.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "-0.006 0.003 0.006", to: "-0.004 0.002 0.004" });
	    }
	  },
	
	  onOptgroupPrevious: function onOptgroupPrevious(evt) {
	    var selectEl = this.el;
	    var optgroups = selectEl.getElementsByTagName("optgroup"); // Get the optgroups
	    var selectRenderEl = document.getElementById("selectRender");
	
	    if (this.data.selectedOptgroupIndex - 1 < 0) {
	      // CAN'T DO THIS, show red arrow
	      var arrow = document.getElementById("arrowUp");
	      arrow.removeAttribute('animation__color');
	      arrow.removeAttribute('animation__opacity');
	      arrow.removeAttribute('animation__scale');
	      arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FF0000", to: "#000000" });
	      arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
	      arrow.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "0.006 0.003 0.006", to: "0.004 0.002 0.004" });
	    } else {
	      // CAN DO THIS, show previous optgroup
	
	      this.removeSelectOptionsRow(this.data.selectedOptgroupIndex); // remove the old optgroup row
	
	      this.data.selectedOptgroupIndex -= 1;
	      var selectedOptgroupEl = optgroups[this.data.selectedOptgroupIndex]; // fetch the currently selected optgroup
	      this.data.selectedOptgroupValue = selectedOptgroupEl.getAttribute("value"); // set component property to opgroup value
	
	      this.el.flushToDOM();
	
	      var nextSelectedOptgroupEl = optgroups[this.data.selectedOptgroupIndex]; // fetch the currently selected optgroup
	      // this.makeSelectOptionsRow(nextSelectedOptgroupEl, selectRenderEl, this.data.selectedOptgroupIndex, -0.15);
	      this.makeSelectOptionsRow(nextSelectedOptgroupEl, selectRenderEl, this.data.selectedOptgroupIndex);
	
	      // Change selected option element when optgroup is changed
	      var selectOptionsRowEl = document.getElementById('selectOptionsRow' + this.data.selectedOptgroupIndex);
	      var newlySelectedMenuEl = selectOptionsRowEl.getElementsByClassName('selected')[0];
	
	      // update selectOptionsValue and Index
	      this.data.selectedOptionValue = newlySelectedMenuEl.getAttribute("value");
	      this.data.selectedOptionIndex = newlySelectedMenuEl.getAttribute("optionid");
	
	      this.el.flushToDOM();
	
	      this.el.emit("menuOptgroupNext");
	      this.el.emit("menuChanged");
	
	      var arrow = document.getElementById("arrowUp");
	      arrow.removeAttribute('animation__color');
	      arrow.removeAttribute('animation__opacity');
	      arrow.removeAttribute('animation__scale');
	      arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FFFF00", to: "#000000" });
	      arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
	      arrow.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "0.006 0.003 0.006", to: "0.004 0.002 0.004" });
	    }
	  },
	
	  onTrackpadDown: function onTrackpadDown(evt) {
	    //menu: only deal with trackpad events from controller specified in component property
	    if (evt.target.id != this.data.controllerID) {
	      return;
	    }
	    // Which direction should the trackpad trigger?
	
	    // Each of the 4 arrow's green intensity is inversely correlated with time elapsed since last hover event on that axis
	    // To determine which direction to move upon button press, move in the direction with the most green color intensity
	
	    // Fetch all 4 green values and place in an array starting with up, right, down, left arrow colors (clockwise from top)
	    var arrowUpColor = new THREE.Color(document.getElementById("arrowUp").getAttribute("material").color);
	    var arrowRightColor = new THREE.Color(document.getElementById("arrowRight").getAttribute("material").color);
	    var arrowDownColor = new THREE.Color(document.getElementById("arrowDown").getAttribute("material").color);
	    var arrowLeftColor = new THREE.Color(document.getElementById("arrowLeft").getAttribute("material").color);
	    //    var arrowColorArray = [arrowUpColor, arrowRightColor, arrowDownColor, arrowLeftColor];
	    var arrowColorArrayGreen = [arrowUpColor.g, arrowRightColor.g, arrowDownColor.g, arrowLeftColor.g];
	
	    if (arrowColorArrayGreen.reduce(function (a, b) {
	      return a + b;
	    }, 0) > 0) {
	      // if at least one value is > 0
	      switch (indexOfMax(arrowColorArrayGreen)) {// Determine which value in the array is the largest
	        case 0:
	          // up
	          this.onOptgroupPrevious();
	          console.log("PRESSup");
	          return; // without this return the other cases are fired - weird!
	        case 1:
	          // right
	          this.onOptionSwitch("next");
	          console.log("PRESSright");
	          return;
	        case 2:
	          // down
	          this.onOptgroupNext();
	          console.log("PRESSdown");
	          return;
	        case 3:
	          // left
	          this.onOptionSwitch("previous");
	          console.log("PRESSleft");
	          return;
	      }
	    }
	  },
	
	  onOptionSwitch: function onOptionSwitch(direction) {
	
	    // Switch to the next option, or switch in the direction of the most recently hovered directional arrow
	    // menu: save the currently selected menu element
	    // console.log("direction?");
	    // console.log(direction);
	    var selectOptionsRowEl = document.getElementById('selectOptionsRow' + this.data.selectedOptgroupIndex);
	
	    var oldMenuEl = selectOptionsRowEl.getElementsByClassName('selected')[0];
	    // console.log(oldMenuEl);
	
	    var oldSelectedOptionIndex = parseInt(oldMenuEl.getAttribute("optionid"));
	    var selectedOptionIndex = oldSelectedOptionIndex;
	    // console.log(selectedOptionIndex);
	
	    var selectEl = this.el; // Reference to the component's entity.
	    var optgroups = selectEl.getElementsByTagName("optgroup"); // Get the optgroups
	    var selectedOptgroupEl = optgroups[this.data.selectedOptgroupIndex]; // fetch the currently selected optgroup
	
	    if (direction == 'previous') {
	      this.el.emit("menuPrevious");
	      // PREVIOUS OPTION MENU START ===============================
	      selectedOptionIndex = loopIndex(selectedOptionIndex -= 1, selectedOptgroupEl.childElementCount);
	      // console.log(selectedOptionIndex);
	
	      // menu: animate arrow LEFT
	      var arrowLeft = document.getElementById("arrowLeft");
	      arrowLeft.removeAttribute('animation__color');
	      arrowLeft.removeAttribute('animation__opacity');
	      arrowLeft.removeAttribute('animation__scale');
	      arrowLeft.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FFFF00", to: "#000000" });
	      arrowLeft.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
	      arrowLeft.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "0.006 0.003 0.006", to: "0.004 0.002 0.004" });
	
	      // menu: get the newly selected menu element
	      var newMenuEl = selectOptionsRowEl.querySelectorAll("[optionid='" + selectedOptionIndex + "']")[0];
	
	      // menu: remove selected class and change colors
	      oldMenuEl.classList.remove("selected");
	      newMenuEl.classList.add("selected");
	      this.data.selectedOptionValue = newMenuEl.getAttribute("value");
	      console.log(this.data.selectedOptionValue);
	      this.data.selectedOptionIndex = selectedOptionIndex;
	      this.el.flushToDOM();
	      this.el.emit("menuChanged");
	      oldMenuEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'color', 'gray');
	      newMenuEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'color', 'yellow');
	      oldMenuEl.getElementsByClassName("previewFrame")[0].setAttribute('material', 'color', '#222222');
	      newMenuEl.getElementsByClassName("previewFrame")[0].setAttribute('material', 'color', 'yellow');
	
	      // menu: slide the menu list row RIGHT by 1
	      //      const selectOptionsRowEl = document.querySelector("#selectOptionsRow");
	      // use the desiredPosition attribute (if exists) instead of object3D position as animation may not be done yet
	      if (selectOptionsRowEl.hasAttribute("desiredPosition")) {
	        var oldPosition = selectOptionsRowEl.getAttribute("desiredPosition");
	        var newX = parseFloat(oldPosition.split(" ")[0]) + 0.075;
	        var newPositionString = newX.toString() + " " + oldPosition.split(" ")[1] + " " + oldPosition.split(" ")[2];
	      } else {
	        var oldPosition = selectOptionsRowEl.object3D.position;
	        var newX = oldPosition.x + 0.075; // this could be a variable at the component level
	        var newPositionString = newX.toString() + " " + oldPosition.y + " " + oldPosition.z;
	      }
	      selectOptionsRowEl.removeAttribute('animation__slide');
	      selectOptionsRowEl.setAttribute('animation__slide', { property: 'position', dur: 500, from: oldPosition, to: newPositionString });
	      selectOptionsRowEl.setAttribute('desiredPosition', newPositionString);
	
	      // menu: make the hidden most LEFTmost object (-3 from oldMenuEl index) visible
	      var newlyVisibleOptionIndex = loopIndex(oldSelectedOptionIndex - 3, selectedOptgroupEl.childElementCount);
	      var newlyVisibleOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyVisibleOptionIndex + "']")[0];
	
	      // make visible and animate
	      newlyVisibleOptionEl.setAttribute('visible', 'true');
	      newlyVisibleOptionEl.removeAttribute('animation');
	      newlyVisibleOptionEl.setAttribute('animation', { property: 'scale', dur: 500, from: '0.5 0.5 0.5', to: '1.0 1.0 1.0' });
	      newlyVisibleOptionEl.flushToDOM();
	
	      // menu: destroy the hidden most RIGHTmost object (+3 from oldMenuEl index)
	      var newlyRemovedOptionIndex = loopIndex(oldSelectedOptionIndex + 3, selectedOptgroupEl.childElementCount);
	      var newlyRemovedOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyRemovedOptionIndex + "']")[0];
	      newlyRemovedOptionEl.flushToDOM();
	      newlyRemovedOptionEl.parentNode.removeChild(newlyRemovedOptionEl);
	
	      // menu: make the second RIGHTmost object (+2 from oldMenuEl index) invisible
	      var newlyInvisibleOptionIndex = loopIndex(oldSelectedOptionIndex + 2, selectedOptgroupEl.childElementCount);
	      var newlyInvisibleOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyInvisibleOptionIndex + "']")[0];
	      newlyInvisibleOptionEl.setAttribute('visible', 'false');
	      newlyInvisibleOptionEl.flushToDOM();
	
	      // menu: Create the next LEFTmost object preview (-4 from oldMenuEl index) but keep it hidden until it's needed
	      var newlyCreatedOptionEl = newlyVisibleOptionEl.cloneNode(true);
	      newlyCreatedOptionEl.setAttribute('visible', 'false');
	      var newlyCreatedOptionIndex = loopIndex(oldSelectedOptionIndex - 4, selectedOptgroupEl.childElementCount);
	
	      // get the actual "option" element that is the source of truth for value, image src and label so that we can populate the new menu option
	      var sourceOptionEl = selectedOptgroupEl.children[newlyCreatedOptionIndex];
	
	      newlyCreatedOptionEl.setAttribute('optionid', newlyCreatedOptionIndex);
	      newlyCreatedOptionEl.setAttribute('id', 'menu' + newlyCreatedOptionIndex);
	      newlyCreatedOptionEl.setAttribute('value', sourceOptionEl.getAttribute("value"));
	
	      var newlyVisibleOptionPosition = newlyVisibleOptionEl.object3D.position;
	      newlyCreatedOptionEl.setAttribute('position', newlyVisibleOptionPosition.x - 0.075 + " " + newlyVisibleOptionPosition.y + " " + newlyVisibleOptionPosition.z);
	      newlyCreatedOptionEl.flushToDOM();
	
	      // menu: add the newly cloned and modified menu object preview to the dom
	      selectOptionsRowEl.insertBefore(newlyCreatedOptionEl, selectOptionsRowEl.firstChild);
	
	      // menu: get child elements for image and name, populate both appropriately
	      var appendedNewlyCreatedOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyCreatedOptionIndex + "']")[0];
	      appendedNewlyCreatedOptionEl.getElementsByClassName("previewImage")[0].setAttribute('src', sourceOptionEl.getAttribute("src"));
	      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'text', sourceOptionEl.text);
	      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'color', '#747474');
	      appendedNewlyCreatedOptionEl.flushToDOM();
	
	      // PREVIOUS OPTION MENU END ===============================
	    } else {
	      this.el.emit("menuNext");
	      // NEXT OPTION MENU START ===============================
	      selectedOptionIndex = loopIndex(selectedOptionIndex += 1, selectedOptgroupEl.childElementCount);
	
	      // menu: animate arrow right
	      var arrowRight = document.getElementById("arrowRight");
	      arrowRight.removeAttribute('animation__color');
	      arrowRight.removeAttribute('animation__opacity');
	      arrowRight.removeAttribute('animation__scale');
	      arrowRight.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FFFF00", to: "#000000" });
	      arrowRight.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
	      arrowRight.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "-0.006 0.003 0.006", to: "-0.004 0.002 0.004" });
	
	      // menu: get the newly selected menu element
	      var _newMenuEl = selectOptionsRowEl.querySelectorAll("[optionid='" + selectedOptionIndex + "']")[0];
	
	      // menu: remove selected class and change colors
	      oldMenuEl.classList.remove("selected");
	      _newMenuEl.classList.add("selected");
	      this.data.selectedOptionValue = _newMenuEl.getAttribute("value");
	      console.log(this.data.selectedOptionValue);
	      this.data.selectedOptionIndex = selectedOptionIndex;
	      this.el.flushToDOM();
	      this.el.emit("menuChanged");
	      oldMenuEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'color', 'gray');
	      _newMenuEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'color', 'yellow');
	      oldMenuEl.getElementsByClassName("previewFrame")[0].setAttribute('material', 'color', '#222222');
	      _newMenuEl.getElementsByClassName("previewFrame")[0].setAttribute('material', 'color', 'yellow');
	
	      // menu: slide the menu list left by 1
	      //      const selectOptionsRowEl = document.querySelector("#selectOptionsRow");
	      // use the desiredPosition attribute (if exists) instead of object3D position as animation may not be done yet
	      // TODO - error with this code when looping through index
	
	      //      console.log("'true' old position");
	      //      console.log(selectOptionsRowEl.object3D.position);
	
	      if (selectOptionsRowEl.hasAttribute("desiredPosition")) {
	        //        console.log('desiredPosition');
	        var oldPosition = selectOptionsRowEl.getAttribute("desiredPosition");
	        //        console.log(oldPosition);
	        var newX = parseFloat(oldPosition.split(" ")[0]) - 0.075;
	        var newPositionString = newX.toString() + " " + oldPosition.split(" ")[1] + " " + oldPosition.split(" ")[2];
	        //        console.log(newPositionString);
	      } else {
	        var oldPosition = selectOptionsRowEl.object3D.position;
	        var newX = oldPosition.x - 0.075; // this could be a variable soon
	        var newPositionString = newX.toString() + " " + oldPosition.y + " " + oldPosition.z;
	        //        console.log(newPositionString);
	      }
	      selectOptionsRowEl.removeAttribute('animation__slide');
	      selectOptionsRowEl.setAttribute('animation__slide', { property: 'position', dur: 500, from: oldPosition, to: newPositionString });
	      selectOptionsRowEl.setAttribute('desiredPosition', newPositionString);
	
	      // menu: make the hidden most rightmost object (+3 from oldMenuEl index) visible
	      var newlyVisibleOptionIndex = loopIndex(oldSelectedOptionIndex + 3, selectedOptgroupEl.childElementCount);
	      var newlyVisibleOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyVisibleOptionIndex + "']")[0];
	
	      // make visible and animate
	      newlyVisibleOptionEl.setAttribute('visible', 'true');
	      newlyVisibleOptionEl.removeAttribute('animation');
	      newlyVisibleOptionEl.setAttribute('animation', { property: 'scale', dur: 500, from: '0.5 0.5 0.5', to: '1.0 1.0 1.0' });
	      newlyVisibleOptionEl.flushToDOM();
	
	      // menu: destroy the hidden most leftmost object (-3 from oldMenuEl index)
	      var newlyRemovedOptionIndex = loopIndex(oldSelectedOptionIndex - 3, selectedOptgroupEl.childElementCount);
	      var newlyRemovedOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyRemovedOptionIndex + "']")[0];
	      newlyRemovedOptionEl.flushToDOM();
	      newlyRemovedOptionEl.parentNode.removeChild(newlyRemovedOptionEl);
	
	      // menu: make the second leftmost object (-2 from oldMenuEl index) invisible
	      var newlyInvisibleOptionIndex = loopIndex(oldSelectedOptionIndex - 2, selectedOptgroupEl.childElementCount);
	      var newlyInvisibleOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyInvisibleOptionIndex + "']")[0];
	      newlyInvisibleOptionEl.setAttribute('visible', 'false');
	      newlyInvisibleOptionEl.flushToDOM();
	
	      // menu: Create the next rightmost object preview (+4 from oldMenuEl index) but keep it hidden until it's needed
	      var newlyCreatedOptionEl = newlyVisibleOptionEl.cloneNode(true);
	      newlyCreatedOptionEl.setAttribute('visible', 'false');
	      var newlyCreatedOptionIndex = loopIndex(oldSelectedOptionIndex + 4, selectedOptgroupEl.childElementCount);
	      //      console.log("newlyCreatedOptionIndex: " + newlyCreatedOptionIndex);
	      // get the actual "option" element that is the source of truth for value, image src and label so that we can populate the new menu option
	      var sourceOptionEl = selectedOptgroupEl.children[newlyCreatedOptionIndex];
	      //      console.log("sourceOptionEl");
	      //      console.log(sourceOptionEl);
	
	      newlyCreatedOptionEl.setAttribute('optionid', newlyCreatedOptionIndex);
	      newlyCreatedOptionEl.setAttribute('id', 'menu' + newlyCreatedOptionIndex);
	      newlyCreatedOptionEl.setAttribute('value', sourceOptionEl.getAttribute("value"));
	
	      var newlyVisibleOptionPosition = newlyVisibleOptionEl.object3D.position;
	      newlyCreatedOptionEl.setAttribute('position', newlyVisibleOptionPosition.x + 0.075 + " " + newlyVisibleOptionPosition.y + " " + newlyVisibleOptionPosition.z);
	      newlyCreatedOptionEl.flushToDOM();
	
	      // menu: add the newly cloned and modified menu object preview
	      selectOptionsRowEl.insertBefore(newlyCreatedOptionEl, selectOptionsRowEl.firstChild);
	
	      // menu: get child elements for image and name, populate both appropriately
	      var appendedNewlyCreatedOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyCreatedOptionIndex + "']")[0];
	
	      appendedNewlyCreatedOptionEl.getElementsByClassName("previewImage")[0].setAttribute('src', sourceOptionEl.getAttribute("src"));
	      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'text', sourceOptionEl.text);
	      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'color', '#747474');
	      appendedNewlyCreatedOptionEl.flushToDOM();
	
	      // NEXT MENU OPTION END ===============================
	    }
	  }
	
	});

/***/ },
/* 43 */
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
	    // Applicable to both Vive and Oculus Touch controls
	    el.addEventListener('triggerdown', this.onPlaceObject.bind(this));
	    el.addEventListener('gripdown', this.onUndo.bind(this));
	
	    var menuEl = document.getElementById(this.data.menuId);
	    menuEl.addEventListener('menuChanged', this.onObjectChange.bind(this));
	  },
	
	  /**
	   * Remove event listeners.
	   */
	  removeEventListeners: function removeEventListeners() {
	    var el = this.el;
	    el.removeEventListener('triggerdown', this.onPlaceObject);
	    el.removeEventListener('gripdown', this.onUndo);
	  },
	
	  init: function init() {
	    // get the list of object group json directories - which json files should we read?
	    // for each group, fetch the json file and populate the optgroup and option elements as children of the appropriate menu element
	    var list = ["kfarr_bases", "mmmm_veh", "mmmm_bld", "mmmm_alien", "mmmm_scene"];
	
	    var groupJSONArray = [];
	
	    // TODO: wrap this in promise and then request aframe-select-bar component to re-init
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
	        var menuEl = document.getElementById("menu");
	
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
	    var objectGroup = menuEl.components['select-bar'].data.selectedOptgroupValue;
	
	    // Get an Array of all the objects of this type
	    var objectArray = this.groupJSONArray[objectGroup];
	
	    // What is the ID of the currently selected item?
	    var newObjectId = parseInt(menuEl.components['select-bar'].data.selectedOptionIndex);
	    var selectedOptionValue = menuEl.components['select-bar'].data.selectedOptionValue;
	
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
/* 44 */
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
/* 45 */
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYTBkZjU2MDU2ZjA5NzgzOGU4NTciLCJ3ZWJwYWNrOi8vLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2FuaW1lanMvYW5pbWUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtdGV4dC1jb21wb25lbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50L2luZGV4LmpzIiwid2VicGFjazovLy8uL34vdGhyZWUtYm1mb250LXRleHQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9sYXlvdXQtYm1mb250LXRleHQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi93b3JkLXdyYXBwZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi94dGVuZC9pbW11dGFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9pbmRleG9mLXByb3BlcnR5L2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYXMtbnVtYmVyL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly8vLi9+L3F1YWQtaW5kaWNlcy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2R0eXBlL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYW4tYXJyYXkvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9pcy1idWZmZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi90aHJlZS1idWZmZXItdmVydGV4LWRhdGEvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9mbGF0dGVuLXZlcnRleC1kYXRhL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vb2JqZWN0LWFzc2lnbi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3RocmVlLWJtZm9udC10ZXh0L2xpYi92ZXJ0aWNlcy5qcyIsIndlYnBhY2s6Ly8vLi9+L3RocmVlLWJtZm9udC10ZXh0L2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvYWQtYm1mb250L2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9idWZmZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYXNlNjQtanMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9pZWVlNzU0L2luZGV4LmpzIiwid2VicGFjazovLy8uL34vaXNhcnJheS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3hoci9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2dsb2JhbC93aW5kb3cuanMiLCJ3ZWJwYWNrOi8vLy4vfi9pcy1mdW5jdGlvbi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIndlYnBhY2s6Ly8vLi9+L3RyaW0vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9mb3ItZWFjaC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3BhcnNlLWJtZm9udC1hc2NpaS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3BhcnNlLWJtZm9udC14bWwvbGliL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wYXJzZS1ibWZvbnQteG1sL2xpYi9wYXJzZS1hdHRyaWJzLmpzIiwid2VicGFjazovLy8uL34veG1sLXBhcnNlLWZyb20tc3RyaW5nL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vcGFyc2UtYm1mb250LWJpbmFyeS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvYWQtYm1mb250L2xpYi9pcy1iaW5hcnkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9idWZmZXItZXF1YWwvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50L2xpYi9zaGFkZXJzL3NkZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2FmcmFtZS1ibWZvbnQtdGV4dC1jb21wb25lbnQvZXh0cmFzL3RleHQtcHJpbWl0aXZlLmpzIiwid2VicGFjazovLy8uL2xpYi9hZnJhbWUtc2VsZWN0LWJhci5qcyIsIndlYnBhY2s6Ly8vLi9saWIvYnVpbGRlci1jb250cm9scy5qcyIsIndlYnBhY2s6Ly8vLi9saWIvZ3JvdW5kLmpzIiwid2VicGFjazovLy8uL2xpYi9za3lHcmFkaWVudC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiQUZSQU1FIiwiRXJyb3IiLCJmaW5kV2l0aEF0dHIiLCJhcnJheSIsImF0dHIiLCJ2YWx1ZSIsImkiLCJsZW5ndGgiLCJpbmRleE9mTWF4IiwiYXJyIiwibWF4IiwibWF4SW5kZXgiLCJsb29wSW5kZXgiLCJkZXNpcmVkSW5kZXgiLCJhcnJheUxlbmd0aCIsImFzc2VydCIsImNvbmRpdGlvbiIsIm1lc3NhZ2UiLCJ0ZXN0TG9vcEFycmF5IiwicmVnaXN0ZXJDb21wb25lbnQiLCJzY2hlbWEiLCJjb250cm9scyIsInR5cGUiLCJkZWZhdWx0IiwiY29udHJvbGxlcklEIiwic2VsZWN0ZWRPcHRncm91cFZhbHVlIiwic2VsZWN0ZWRPcHRncm91cEluZGV4Iiwic2VsZWN0ZWRPcHRpb25WYWx1ZSIsInNlbGVjdGVkT3B0aW9uSW5kZXgiLCJtYWtlU2VsZWN0T3B0aW9uc1JvdyIsInNlbGVjdGVkT3B0Z3JvdXBFbCIsInBhcmVudEVsIiwiaW5kZXgiLCJvZmZzZXRZIiwib3B0Z3JvdXBMYWJlbEVsIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiaWQiLCJzZXRBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJhcHBlbmRDaGlsZCIsIm9wdGlvbnNFbGVtZW50cyIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwib3B0aW9uc0VsZW1lbnRzQXJyYXkiLCJBcnJheSIsInByb3RvdHlwZSIsInNsaWNlIiwiY2FsbCIsImZpcnN0QXJyYXkiLCJwcmV2aWV3QXJyYXkiLCJtZW51QXJyYXkiLCJjb25jYXQiLCJzZWxlY3RPcHRpb25zSFRNTCIsInN0YXJ0UG9zaXRpb25YIiwiZGVsdGFYIiwiZm9yRWFjaCIsImVsZW1lbnQiLCJtZW51QXJyYXlJbmRleCIsInZpc2libGUiLCJzZWxlY3RlZCIsIm9yaWdpbmFsT3B0aW9uc0FycmF5SW5kZXgiLCJ0ZXh0Iiwic2VsZWN0T3B0aW9uc1Jvd0VsIiwiaW5uZXJIVE1MIiwicmVtb3ZlU2VsZWN0T3B0aW9uc1JvdyIsImdldEVsZW1lbnRCeUlkIiwiY29uc29sZSIsImxvZyIsImZpcnN0Q2hpbGQiLCJyZW1vdmVDaGlsZCIsInBhcmVudE5vZGUiLCJpbml0Iiwic2VsZWN0RWwiLCJlbCIsImRhdGEiLCJsYXN0VGltZSIsIkRhdGUiLCJzZWxlY3RSZW5kZXJFbCIsIm9wdGdyb3VwcyIsImFkZEV2ZW50TGlzdGVuZXJzIiwiY29udHJvbGxlckVsIiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uVHJhY2twYWREb3duIiwiYmluZCIsIm9uQXhpc01vdmUiLCJvbkhvdmVyTGVmdCIsIm9uSG92ZXJSaWdodCIsIm9uT3B0aW9uU3dpdGNoIiwib25PcHRpb25OZXh0Iiwib25PcHRpb25QcmV2aW91cyIsIm9uT3B0Z3JvdXBOZXh0Iiwib25PcHRncm91cFByZXZpb3VzIiwicmVtb3ZlRXZlbnRMaXN0ZW5lcnMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicGxheSIsInBhdXNlIiwicmVtb3ZlIiwiZXZ0IiwidGFyZ2V0IiwiZGV0YWlsIiwiYXhpcyIsImlzT2N1bHVzIiwiZ2FtZXBhZHMiLCJuYXZpZ2F0b3IiLCJnZXRHYW1lcGFkcyIsImdhbWVwYWQiLCJpbmRleE9mIiwiTWF0aCIsImFicyIsInlBeGlzIiwib25Ib3ZlclVwIiwib25Ib3ZlckRvd24iLCJ0aGlzVGltZSIsImZsb29yIiwiZW1pdCIsImFycm93IiwiY3VycmVudEFycm93Q29sb3IiLCJUSFJFRSIsIkNvbG9yIiwiY29sb3IiLCJyIiwicmVtb3ZlQXR0cmlidXRlIiwicHJvcGVydHkiLCJkdXIiLCJmcm9tIiwidG8iLCJnIiwiYXJyb3dDb2xvciIsImZsdXNoVG9ET00iLCJuZXh0U2VsZWN0ZWRPcHRncm91cEVsIiwibmV3bHlTZWxlY3RlZE1lbnVFbCIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJhcnJvd1VwQ29sb3IiLCJhcnJvd1JpZ2h0Q29sb3IiLCJhcnJvd0Rvd25Db2xvciIsImFycm93TGVmdENvbG9yIiwiYXJyb3dDb2xvckFycmF5R3JlZW4iLCJyZWR1Y2UiLCJhIiwiYiIsImRpcmVjdGlvbiIsIm9sZE1lbnVFbCIsIm9sZFNlbGVjdGVkT3B0aW9uSW5kZXgiLCJwYXJzZUludCIsImNoaWxkRWxlbWVudENvdW50IiwiYXJyb3dMZWZ0IiwibmV3TWVudUVsIiwicXVlcnlTZWxlY3RvckFsbCIsImNsYXNzTGlzdCIsImFkZCIsImhhc0F0dHJpYnV0ZSIsIm9sZFBvc2l0aW9uIiwibmV3WCIsInBhcnNlRmxvYXQiLCJzcGxpdCIsIm5ld1Bvc2l0aW9uU3RyaW5nIiwidG9TdHJpbmciLCJvYmplY3QzRCIsInBvc2l0aW9uIiwieCIsInkiLCJ6IiwibmV3bHlWaXNpYmxlT3B0aW9uSW5kZXgiLCJuZXdseVZpc2libGVPcHRpb25FbCIsIm5ld2x5UmVtb3ZlZE9wdGlvbkluZGV4IiwibmV3bHlSZW1vdmVkT3B0aW9uRWwiLCJuZXdseUludmlzaWJsZU9wdGlvbkluZGV4IiwibmV3bHlJbnZpc2libGVPcHRpb25FbCIsIm5ld2x5Q3JlYXRlZE9wdGlvbkVsIiwiY2xvbmVOb2RlIiwibmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgiLCJzb3VyY2VPcHRpb25FbCIsImNoaWxkcmVuIiwibmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24iLCJpbnNlcnRCZWZvcmUiLCJhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsIiwiYXJyb3dSaWdodCIsIm9iamVjdENvdW50IiwiaHVtYW5pemUiLCJzdHIiLCJmcmFncyIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwiam9pbiIsIm1lbnVJZCIsIm11bHRpcGxlIiwib25QbGFjZU9iamVjdCIsIm9uVW5kbyIsIm1lbnVFbCIsIm9uT2JqZWN0Q2hhbmdlIiwibGlzdCIsImdyb3VwSlNPTkFycmF5IiwiZ3JvdXBOYW1lIiwicmVxdWVzdFVSTCIsInJlcXVlc3QiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJyZXNwb25zZVR5cGUiLCJzZW5kIiwib25sb2FkIiwicmVzcG9uc2UiLCJuZXdPcHRncm91cEVsIiwib3B0aW9uc0hUTUwiLCJvYmplY3REZWZpbml0aW9uIiwidGhpc0l0ZW1JRCIsInRoaXNJdGVtRWwiLCJxdWVyeVNlbGVjdG9yIiwib2JqZWN0SWQiLCJhdHRyaWJ1dGVzIiwib2JqZWN0R3JvdXAiLCJyb3VuZGluZyIsIm9iamVjdEFycmF5IiwidGhpc0l0ZW1Xb3JsZFBvc2l0aW9uIiwiZ2V0V29ybGRQb3NpdGlvbiIsInRoaXNJdGVtV29ybGRSb3RhdGlvbiIsImdldFdvcmxkUm90YXRpb24iLCJvcmlnaW5hbFBvc2l0aW9uU3RyaW5nIiwicm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWCIsInJvdW5kIiwicm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWSIsInJvdW5kZWRJdGVtV29ybGRQb3NpdGlvbloiLCJyb3VuZGVkUG9zaXRpb25TdHJpbmciLCJ0aGlzSXRlbVdvcmxkUm90YXRpb25YIiwiX3giLCJQSSIsInRoaXNJdGVtV29ybGRSb3RhdGlvblkiLCJfeSIsInRoaXNJdGVtV29ybGRSb3RhdGlvbloiLCJfeiIsIm9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZyIsInJvdW5kZWRUaGlzSXRlbVdvcmxkUm90YXRpb25ZIiwicm91bmRlZEV1bGVyUm90YXRpb25TdHJpbmciLCJuZXdJZCIsIiQiLCJjbGFzcyIsInNjYWxlIiwicm90YXRpb24iLCJmaWxlIiwiYXBwZW5kVG8iLCJuZXdPYmplY3QiLCJjb21wb25lbnRzIiwibmV3T2JqZWN0SWQiLCJvYmoiLCJtdGwiLCJwcmV2aW91c09iamVjdCIsIm9iamVjdExvYWRlciIsIk1PREVMX1VSTCIsIk9iamVjdExvYWRlciIsImNyb3NzT3JpZ2luIiwibG9hZCIsInJlY2VpdmVTaGFkb3ciLCJtYXRlcmlhbCIsInNoYWRpbmciLCJGbGF0U2hhZGluZyIsInJlZ2lzdGVyU2hhZGVyIiwiY29sb3JUb3AiLCJpcyIsImNvbG9yQm90dG9tIiwidmVydGV4U2hhZGVyIiwiZnJhZ21lbnRTaGFkZXIiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7QUN0Q0Esb0JBQUFBLENBQVEsQ0FBUjtBQUNBLG9CQUFBQSxDQUFRLENBQVI7QUFDQSxvQkFBQUEsQ0FBUSxDQUFSO0FBQ0Esb0JBQUFBLENBQVEsQ0FBUjtBQUNBLG9CQUFBQSxDQUFRLEVBQVI7QUFDQSxvQkFBQUEsQ0FBUSxFQUFSO0FBQ0Esb0JBQUFBLENBQVEsRUFBUjtBQUNBLG9CQUFBQSxDQUFRLEVBQVIsRTs7Ozs7O0FDUEE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLGFBQWE7QUFDeEIsaUJBQWdCLGNBQWM7QUFDOUIsdUJBQXNCLGVBQWU7QUFDckMsaUJBQWdCO0FBQ2hCLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7Ozs7Ozs7QUNuQ0Q7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLFdBQVc7QUFDdkIsV0FBVSxZQUFZO0FBQ3RCLFdBQVUsY0FBYztBQUN4QixjQUFhLHNCQUFzQjtBQUNuQyxrQkFBaUIsYUFB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Q0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNEMsMEJBQTBCLEVBQUU7QUFDeEU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWM7QUFDZCxNQUFLO0FBQ0w7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrRUFBaUU7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZO0FBQ1o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQLE1BQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1REFBc0QsdUJBQXVCO0FBQzdFO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBOztB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Q0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFxQixPQUFPO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtB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O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0JBQWU7QUFDZjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLDJCQUEwQixnQkFBZ0I7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRTs7Ozs7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3ZCQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3BCQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOERBQTZEO0FBQzdEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxnQ0FBK0IsaUJBQWlCO0FBQ2hELHNCQUFxQixTQUFTO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxpQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGtCQUFpQixRQUFRO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSCxtQ0FBa0M7QUFDbEM7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGlCQUFnQixzQkFBc0I7QUFDdEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQWtCLG9CQUFvQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTs7Ozs7OztBQzVFQTtBQUNBLFlBQVc7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFpQixXQUFXO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEVBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBLFlBQVc7QUFDWDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwREFBeUQ7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx3QkFBdUIsOEJBQThCOztBQUVyRDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxvQ0FBbUM7QUFDbkM7QUFDQTtBQUNBLElBQUc7QUFDSDs7Ozs7Ozs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxzQkFBcUIsbURBQW1EO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBbUIsVUFBVTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsWUFBWTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMkJBQTBCO0FBQzFCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLHdDQUF1QyxTQUFTO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdCQUFlLGlCQUFpQjtBQUNoQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWEsaUJBQWlCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQixTQUFTO0FBQzFCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFnRCxFQUFFO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLGtCQUFpQixTQUFTO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBeUM7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHlCQUF3QixlQUFlO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBLHlCQUF3QixRQUFRO0FBQ2hDO0FBQ0Esc0JBQXFCLGVBQWU7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0JBQWlCLFlBQVk7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLHNCQUFxQixTQUFTO0FBQzlCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxzQkFBcUIsU0FBUztBQUM5QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxzQkFBcUIsU0FBUztBQUM5QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsa0JBQWtCO0FBQ25DO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQSxvQkFBbUIsY0FBYztBQUNqQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0RBQXVELE9BQU87QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHdEQUF1RCxPQUFPO0FBQzlEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztB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RUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQSwyQ0FBMEM7QUFDMUM7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7O0FDaFBBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7QUFDQSxFQUFDO0FBQ0Q7QUFDQSxFQUFDO0FBQ0Q7QUFDQTs7Ozs7Ozs7QUNSQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxFOzs7Ozs7O0FDN0JBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7O0FDYkE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx3Q0FBdUMsU0FBUztBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EseUNBQXdDLFNBQVM7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLGtCQUFpQixrQkFBa0I7QUFDbkM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBLE1BQUs7QUFDTDtBQUNBLE1BQUs7QUFDTDtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtB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TixDQUFlQyxPQUFmLEdBQXlCdkksTUFBTXdJLFdBQS9CO0FBQ0QsUUFIRDtBQUlBaEcsZ0JBQVNSLEdBQVQsQ0FBYTZGLEdBQWI7QUFDRCxNQU5EO0FBT0Q7QUFoQmdDLEVBQW5DLEU7Ozs7Ozs7O0FDTEE7QUFDQWxQLFFBQU84UCxjQUFQLENBQXNCLGFBQXRCLEVBQXFDO0FBQ25DMU8sV0FBUTtBQUNOMk8sZUFBVSxFQUFFek8sTUFBTSxPQUFSLEVBQWlCQyxTQUFTLE9BQTFCLEVBQW1DeU8sSUFBSSxTQUF2QyxFQURKO0FBRU5DLGtCQUFhLEVBQUUzTyxNQUFNLE9BQVIsRUFBaUJDLFNBQVMsS0FBMUIsRUFBaUN5TyxJQUFJLFNBQXJDO0FBRlAsSUFEMkI7O0FBTW5DRSxpQkFBYyxDQUNaLDhCQURZLEVBR1osZUFIWSxFQUtWLDJEQUxVLEVBTVYscUNBTlUsRUFRViwyRUFSVSxFQVVaLEdBVlksRUFZWjNFLElBWlksQ0FZUCxJQVpPLENBTnFCOztBQW9CbkM0RSxtQkFBZ0IsQ0FDZCx3QkFEYyxFQUVkLDJCQUZjLEVBSWQsOEJBSmMsRUFNZCxhQU5jLEVBUWQsR0FSYyxFQVNaLHFEQVRZLEVBVVosZ0JBVlksRUFXWiw4QkFYWSxFQWFWLGlDQWJVLEVBZVosR0FmWSxFQWdCWiwwREFoQlksRUFrQmQsR0FsQmMsRUFtQmQ1RSxJQW5CYyxDQW1CVCxJQW5CUztBQXBCbUIsRUFBckMsRSIsImZpbGUiOiJhZnJhbWUtY2l0eS1idWlsZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgYTBkZjU2MDU2ZjA5NzgzOGU4NTciLCJyZXF1aXJlKCdhZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQnKTtcclxucmVxdWlyZSgnYWZyYW1lLWFuaW1hdGlvbi1jb21wb25lbnQnKTtcclxucmVxdWlyZSgnYWZyYW1lLXRleHQtY29tcG9uZW50Jyk7XHJcbnJlcXVpcmUoJ2FmcmFtZS1ibWZvbnQtdGV4dC1jb21wb25lbnQnKTtcclxucmVxdWlyZSgnLi9saWIvYWZyYW1lLXNlbGVjdC1iYXIuanMnKTtcclxucmVxdWlyZSgnLi9saWIvYnVpbGRlci1jb250cm9scy5qcycpO1xyXG5yZXF1aXJlKCcuL2xpYi9ncm91bmQuanMnKTtcclxucmVxdWlyZSgnLi9saWIvc2t5R3JhZGllbnQuanMnKTtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vaW5kZXguanMiLCJpZiAodHlwZW9mIEFGUkFNRSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgYXR0ZW1wdGVkIHRvIHJlZ2lzdGVyIGJlZm9yZSBBRlJBTUUgd2FzIGF2YWlsYWJsZS4nKTtcbn1cblxuLyoqXG4gKiBHcmlkSGVscGVyIGNvbXBvbmVudCBmb3IgQS1GcmFtZS5cbiAqL1xuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdncmlkaGVscGVyJywge1xuICBzY2hlbWE6IHtcbiAgICBzaXplOiB7IGRlZmF1bHQ6IDUgfSxcbiAgICBkaXZpc2lvbnM6IHsgZGVmYXVsdDogMTAgfSxcbiAgICBjb2xvckNlbnRlckxpbmU6IHtkZWZhdWx0OiAncmVkJ30sXG4gICAgY29sb3JHcmlkOiB7ZGVmYXVsdDogJ2JsYWNrJ31cbiAgfSxcblxuICAvKipcbiAgICogQ2FsbGVkIG9uY2Ugd2hlbiBjb21wb25lbnQgaXMgYXR0YWNoZWQuIEdlbmVyYWxseSBmb3IgaW5pdGlhbCBzZXR1cC5cbiAgICovXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2NlbmUgPSB0aGlzLmVsLm9iamVjdDNEO1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuXG4gICAgdmFyIHNpemUgPSBkYXRhLnNpemU7XG4gICAgdmFyIGRpdmlzaW9ucyA9IGRhdGEuZGl2aXNpb25zO1xuICAgIHZhciBjb2xvckNlbnRlckxpbmUgPSBkYXRhLmNvbG9yQ2VudGVyTGluZTtcbiAgICB2YXIgY29sb3JHcmlkID0gZGF0YS5jb2xvckdyaWQ7XG5cbiAgICB2YXIgZ3JpZEhlbHBlciA9IG5ldyBUSFJFRS5HcmlkSGVscGVyKCBzaXplLCBkaXZpc2lvbnMsIGNvbG9yQ2VudGVyTGluZSwgY29sb3JHcmlkICk7XG4gICAgZ3JpZEhlbHBlci5uYW1lID0gXCJncmlkSGVscGVyXCI7XG4gICAgc2NlbmUuYWRkKGdyaWRIZWxwZXIpO1xuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2NlbmUgPSB0aGlzLmVsLm9iamVjdDNEO1xuICAgIHNjZW5lLnJlbW92ZShzY2VuZS5nZXRPYmplY3RCeU5hbWUoXCJncmlkSGVscGVyXCIpKTtcbiAgfVxufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYWZyYW1lLWdyaWRoZWxwZXItY29tcG9uZW50L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qIGdsb2JhbCBBRlJBTUUgKi9cblxudmFyIGFuaW1lID0gcmVxdWlyZSgnYW5pbWVqcycpO1xuXG5pZiAodHlwZW9mIEFGUkFNRSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgYXR0ZW1wdGVkIHRvIHJlZ2lzdGVyIGJlZm9yZSBBRlJBTUUgd2FzIGF2YWlsYWJsZS4nKTtcbn1cblxudmFyIHV0aWxzID0gQUZSQU1FLnV0aWxzO1xudmFyIGdldENvbXBvbmVudFByb3BlcnR5ID0gdXRpbHMuZW50aXR5LmdldENvbXBvbmVudFByb3BlcnR5O1xudmFyIHNldENvbXBvbmVudFByb3BlcnR5ID0gdXRpbHMuZW50aXR5LnNldENvbXBvbmVudFByb3BlcnR5O1xudmFyIHN0eWxlUGFyc2VyID0gdXRpbHMuc3R5bGVQYXJzZXIucGFyc2U7XG5cbi8qKlxuICogQW5pbWF0aW9uIGNvbXBvbmVudCBmb3IgQS1GcmFtZS5cbiAqL1xuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdhbmltYXRpb24nLCB7XG4gIHNjaGVtYToge1xuICAgIGRlbGF5OiB7ZGVmYXVsdDogMH0sXG4gICAgZGlyOiB7ZGVmYXVsdDogJyd9LFxuICAgIGR1cjoge2RlZmF1bHQ6IDEwMDB9LFxuICAgIGVhc2luZzoge2RlZmF1bHQ6ICdlYXNlSW5RdWFkJ30sXG4gICAgZWxhc3RpY2l0eToge2RlZmF1bHQ6IDQwMH0sXG4gICAgZnJvbToge2RlZmF1bHQ6ICcnfSxcbiAgICBsb29wOiB7ZGVmYXVsdDogZmFsc2V9LFxuICAgIHByb3BlcnR5OiB7ZGVmYXVsdDogJyd9LFxuICAgIHJlcGVhdDoge2RlZmF1bHQ6IDB9LFxuICAgIHN0YXJ0RXZlbnRzOiB7dHlwZTogJ2FycmF5J30sXG4gICAgcGF1c2VFdmVudHM6IHt0eXBlOiAnYXJyYXknfSxcbiAgICByZXN1bWVFdmVudHM6IHt0eXBlOiAnYXJyYXknfSxcbiAgICByZXN0YXJ0RXZlbnRzOiB7dHlwZTogJ2FycmF5J30sXG4gICAgdG86IHtkZWZhdWx0OiAnJ31cbiAgfSxcblxuICBtdWx0aXBsZTogdHJ1ZSxcblxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hbmltYXRpb24gPSBudWxsO1xuICAgIHRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nID0gZmFsc2U7XG4gICAgdGhpcy5jb25maWcgPSBudWxsO1xuICAgIHRoaXMucGxheUFuaW1hdGlvbkJvdW5kID0gdGhpcy5wbGF5QW5pbWF0aW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5wYXVzZUFuaW1hdGlvbkJvdW5kID0gdGhpcy5wYXVzZUFuaW1hdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmVzdW1lQW5pbWF0aW9uQm91bmQgPSB0aGlzLnJlc3VtZUFuaW1hdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmVzdGFydEFuaW1hdGlvbkJvdW5kID0gdGhpcy5yZXN0YXJ0QW5pbWF0aW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXBlYXQgPSAwO1xuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBhdHRyTmFtZSA9IHRoaXMuYXR0ck5hbWU7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICB2YXIgcHJvcFR5cGUgPSBnZXRQcm9wZXJ0eVR5cGUoZWwsIGRhdGEucHJvcGVydHkpO1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICghZGF0YS5wcm9wZXJ0eSkgeyByZXR1cm47IH1cblxuICAgIC8vIEJhc2UgY29uZmlnLlxuICAgIHRoaXMucmVwZWF0ID0gZGF0YS5yZXBlYXQ7XG4gICAgdmFyIGNvbmZpZyA9IHtcbiAgICAgIGF1dG9wbGF5OiBmYWxzZSxcbiAgICAgIGJlZ2luOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGVsLmVtaXQoJ2FuaW1hdGlvbmJlZ2luJyk7XG4gICAgICAgIGVsLmVtaXQoYXR0ck5hbWUgKyAnLWJlZ2luJyk7XG4gICAgICB9LFxuICAgICAgY29tcGxldGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZWwuZW1pdCgnYW5pbWF0aW9uY29tcGxldGUnKTtcbiAgICAgICAgZWwuZW1pdChhdHRyTmFtZSArICctY29tcGxldGUnKTtcbiAgICAgICAgLy8gUmVwZWF0LlxuICAgICAgICBpZiAoLS1zZWxmLnJlcGVhdCA+IDApIHsgc2VsZi5hbmltYXRpb24ucGxheSgpOyB9XG4gICAgICB9LFxuICAgICAgZGlyZWN0aW9uOiBkYXRhLmRpcixcbiAgICAgIGR1cmF0aW9uOiBkYXRhLmR1cixcbiAgICAgIGVhc2luZzogZGF0YS5lYXNpbmcsXG4gICAgICBlbGFzdGljaXR5OiBkYXRhLmVsYXN0aWNpdHksXG4gICAgICBsb29wOiBkYXRhLmxvb3BcbiAgICB9O1xuXG4gICAgLy8gQ3VzdG9taXplIGNvbmZpZyBiYXNlZCBvbiBwcm9wZXJ0eSB0eXBlLlxuICAgIHZhciB1cGRhdGVDb25maWcgPSBjb25maWdEZWZhdWx0O1xuICAgIGlmIChwcm9wVHlwZSA9PT0gJ3ZlYzInIHx8IHByb3BUeXBlID09PSAndmVjMycgfHwgcHJvcFR5cGUgPT09ICd2ZWM0Jykge1xuICAgICAgdXBkYXRlQ29uZmlnID0gY29uZmlnVmVjdG9yO1xuICAgIH1cblxuICAgIC8vIENvbmZpZy5cbiAgICB0aGlzLmNvbmZpZyA9IHVwZGF0ZUNvbmZpZyhlbCwgZGF0YSwgY29uZmlnKTtcbiAgICB0aGlzLmFuaW1hdGlvbiA9IGFuaW1lKHRoaXMuY29uZmlnKTtcblxuICAgIC8vIFN0b3AgcHJldmlvdXMgYW5pbWF0aW9uLlxuICAgIHRoaXMucGF1c2VBbmltYXRpb24oKTtcblxuICAgIGlmICghdGhpcy5kYXRhLnN0YXJ0RXZlbnRzLmxlbmd0aCkgeyB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IHRydWU7IH1cblxuICAgIC8vIFBsYXkgYW5pbWF0aW9uIGlmIG5vIGhvbGRpbmcgZXZlbnQuXG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcbiAgfSxcblxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnBhdXNlQW5pbWF0aW9uKCk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICB9LFxuXG4gIHBhdXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wYXVzZUFuaW1hdGlvbigpO1xuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgfSxcblxuICAvKipcbiAgICogQ2FsbGVkIGFmdGVyIHVwZGF0ZS5cbiAgICovXG4gIHBsYXk6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXRoaXMuYW5pbWF0aW9uIHx8ICF0aGlzLmFuaW1hdGlvbklzUGxheWluZykgeyByZXR1cm47IH1cblxuICAgIC8vIERlbGF5LlxuICAgIGlmIChkYXRhLmRlbGF5KSB7XG4gICAgICBzZXRUaW1lb3V0KHBsYXksIGRhdGEuZGVsYXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwbGF5KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGxheSAoKSB7XG4gICAgICBzZWxmLnBsYXlBbmltYXRpb24oKTtcbiAgICAgIHNlbGYuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICB9XG4gIH0sXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICBkYXRhLnN0YXJ0RXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5wbGF5QW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucGF1c2VFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnBhdXNlQW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucmVzdW1lRXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5yZXN1bWVBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5yZXN0YXJ0RXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5yZXN0YXJ0QW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICB9LFxuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgZGF0YS5zdGFydEV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucGxheUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnBhdXNlRXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5wYXVzZUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnJlc3VtZUV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucmVzdW1lQW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucmVzdGFydEV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucmVzdGFydEFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgfSxcblxuICBwbGF5QW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hbmltYXRpb24ucGxheSgpO1xuICAgIHRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nID0gdHJ1ZTtcbiAgfSxcblxuICBwYXVzZUFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uLnBhdXNlKCk7XG4gICAgdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcgPSBmYWxzZTtcbiAgfSxcblxuICByZXN1bWVBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbi5wbGF5KCk7XG4gICAgdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcgPSB0cnVlO1xuICB9LFxuXG4gIHJlc3RhcnRBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbi5yZXN0YXJ0KCk7XG4gICAgdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcgPSB0cnVlO1xuICB9XG59KTtcblxuLyoqXG4gKiBTdHVmZiBwcm9wZXJ0eSBpbnRvIGdlbmVyaWMgYHByb3BlcnR5YCBrZXkuXG4gKi9cbmZ1bmN0aW9uIGNvbmZpZ0RlZmF1bHQgKGVsLCBkYXRhLCBjb25maWcpIHtcbiAgdmFyIGZyb20gPSBkYXRhLmZyb20gfHwgZ2V0Q29tcG9uZW50UHJvcGVydHkoZWwsIGRhdGEucHJvcGVydHkpO1xuICByZXR1cm4gQUZSQU1FLnV0aWxzLmV4dGVuZCh7fSwgY29uZmlnLCB7XG4gICAgdGFyZ2V0czogW3thZnJhbWVQcm9wZXJ0eTogZnJvbX1dLFxuICAgIGFmcmFtZVByb3BlcnR5OiBkYXRhLnRvLFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgc2V0Q29tcG9uZW50UHJvcGVydHkoZWwsIGRhdGEucHJvcGVydHksIHRoaXMudGFyZ2V0c1swXS5hZnJhbWVQcm9wZXJ0eSk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBFeHRlbmQgeC95L3ovdyBvbnRvIHRoZSBjb25maWcuXG4gKi9cbmZ1bmN0aW9uIGNvbmZpZ1ZlY3RvciAoZWwsIGRhdGEsIGNvbmZpZykge1xuICB2YXIgZnJvbSA9IGdldENvbXBvbmVudFByb3BlcnR5KGVsLCBkYXRhLnByb3BlcnR5KTtcbiAgaWYgKGRhdGEuZnJvbSkgeyBmcm9tID0gQUZSQU1FLnV0aWxzLmNvb3JkaW5hdGVzLnBhcnNlKGRhdGEuZnJvbSk7IH1cbiAgdmFyIHRvID0gQUZSQU1FLnV0aWxzLmNvb3JkaW5hdGVzLnBhcnNlKGRhdGEudG8pO1xuICByZXR1cm4gQUZSQU1FLnV0aWxzLmV4dGVuZCh7fSwgY29uZmlnLCB7XG4gICAgdGFyZ2V0czogW2Zyb21dLFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgc2V0Q29tcG9uZW50UHJvcGVydHkoZWwsIGRhdGEucHJvcGVydHksIHRoaXMudGFyZ2V0c1swXSk7XG4gICAgfVxuICB9LCB0byk7XG59XG5cbmZ1bmN0aW9uIGdldFByb3BlcnR5VHlwZSAoZWwsIHByb3BlcnR5KSB7XG4gIHZhciBzcGxpdCA9IHByb3BlcnR5LnNwbGl0KCcuJyk7XG4gIHZhciBjb21wb25lbnROYW1lID0gc3BsaXRbMF07XG4gIHZhciBwcm9wZXJ0eU5hbWUgPSBzcGxpdFsxXTtcbiAgdmFyIGNvbXBvbmVudCA9IGVsLmNvbXBvbmVudHNbY29tcG9uZW50TmFtZV0gfHwgQUZSQU1FLmNvbXBvbmVudHNbY29tcG9uZW50TmFtZV07XG5cbiAgLy8gUHJpbWl0aXZlcy5cbiAgaWYgKCFjb21wb25lbnQpIHsgcmV0dXJuIG51bGw7IH1cblxuICBpZiAocHJvcGVydHlOYW1lKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudC5zY2hlbWFbcHJvcGVydHlOYW1lXS50eXBlO1xuICB9XG4gIHJldHVybiBjb21wb25lbnQuc2NoZW1hLnR5cGU7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYWZyYW1lLWFuaW1hdGlvbi1jb21wb25lbnQvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcbiAqIEFuaW1lIHYxLjEuM1xuICogaHR0cDovL2FuaW1lLWpzLmNvbVxuICogSmF2YVNjcmlwdCBhbmltYXRpb24gZW5naW5lXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTYgSnVsaWFuIEdhcm5pZXJcbiAqIGh0dHA6Ly9qdWxpYW5nYXJuaWVyLmNvbVxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cblxuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dFxuICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgIC8vIGxpa2UgTm9kZS5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHMgKHJvb3QgaXMgd2luZG93KVxuICAgIHJvb3QuYW5pbWUgPSBmYWN0b3J5KCk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuXG4gIHZhciB2ZXJzaW9uID0gJzEuMS4zJztcblxuICAvLyBEZWZhdWx0c1xuXG4gIHZhciBkZWZhdWx0U2V0dGluZ3MgPSB7XG4gICAgZHVyYXRpb246IDEwMDAsXG4gICAgZGVsYXk6IDAsXG4gICAgbG9vcDogZmFsc2UsXG4gICAgYXV0b3BsYXk6IHRydWUsXG4gICAgZGlyZWN0aW9uOiAnbm9ybWFsJyxcbiAgICBlYXNpbmc6ICdlYXNlT3V0RWxhc3RpYycsXG4gICAgZWxhc3RpY2l0eTogNDAwLFxuICAgIHJvdW5kOiBmYWxzZSxcbiAgICBiZWdpbjogdW5kZWZpbmVkLFxuICAgIHVwZGF0ZTogdW5kZWZpbmVkLFxuICAgIGNvbXBsZXRlOiB1bmRlZmluZWRcbiAgfVxuXG4gIC8vIFRyYW5zZm9ybXNcblxuICB2YXIgdmFsaWRUcmFuc2Zvcm1zID0gWyd0cmFuc2xhdGVYJywgJ3RyYW5zbGF0ZVknLCAndHJhbnNsYXRlWicsICdyb3RhdGUnLCAncm90YXRlWCcsICdyb3RhdGVZJywgJ3JvdGF0ZVonLCAnc2NhbGUnLCAnc2NhbGVYJywgJ3NjYWxlWScsICdzY2FsZVonLCAnc2tld1gnLCAnc2tld1knXTtcbiAgdmFyIHRyYW5zZm9ybSwgdHJhbnNmb3JtU3RyID0gJ3RyYW5zZm9ybSc7XG5cbiAgLy8gVXRpbHNcblxuICB2YXIgaXMgPSB7XG4gICAgYXJyOiBmdW5jdGlvbihhKSB7IHJldHVybiBBcnJheS5pc0FycmF5KGEpIH0sXG4gICAgb2JqOiBmdW5jdGlvbihhKSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkuaW5kZXhPZignT2JqZWN0JykgPiAtMSB9LFxuICAgIHN2ZzogZnVuY3Rpb24oYSkgeyByZXR1cm4gYSBpbnN0YW5jZW9mIFNWR0VsZW1lbnQgfSxcbiAgICBkb206IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGEubm9kZVR5cGUgfHwgaXMuc3ZnKGEpIH0sXG4gICAgbnVtOiBmdW5jdGlvbihhKSB7IHJldHVybiAhaXNOYU4ocGFyc2VJbnQoYSkpIH0sXG4gICAgc3RyOiBmdW5jdGlvbihhKSB7IHJldHVybiB0eXBlb2YgYSA9PT0gJ3N0cmluZycgfSxcbiAgICBmbmM6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAnZnVuY3Rpb24nIH0sXG4gICAgdW5kOiBmdW5jdGlvbihhKSB7IHJldHVybiB0eXBlb2YgYSA9PT0gJ3VuZGVmaW5lZCcgfSxcbiAgICBudWw6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAnbnVsbCcgfSxcbiAgICBoZXg6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIC8oXiNbMC05QS1GXXs2fSQpfCheI1swLTlBLUZdezN9JCkvaS50ZXN0KGEpIH0sXG4gICAgcmdiOiBmdW5jdGlvbihhKSB7IHJldHVybiAvXnJnYi8udGVzdChhKSB9LFxuICAgIGhzbDogZnVuY3Rpb24oYSkgeyByZXR1cm4gL15oc2wvLnRlc3QoYSkgfSxcbiAgICBjb2w6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIChpcy5oZXgoYSkgfHwgaXMucmdiKGEpIHx8IGlzLmhzbChhKSkgfVxuICB9XG5cbiAgLy8gRWFzaW5ncyBmdW5jdGlvbnMgYWRhcHRlZCBmcm9tIGh0dHA6Ly9qcXVlcnl1aS5jb20vXG5cbiAgdmFyIGVhc2luZ3MgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVhc2VzID0ge307XG4gICAgdmFyIG5hbWVzID0gWydRdWFkJywgJ0N1YmljJywgJ1F1YXJ0JywgJ1F1aW50JywgJ0V4cG8nXTtcbiAgICB2YXIgZnVuY3Rpb25zID0ge1xuICAgICAgU2luZTogZnVuY3Rpb24odCkgeyByZXR1cm4gMSArIE1hdGguc2luKE1hdGguUEkgLyAyICogdCAtIE1hdGguUEkgLyAyKTsgfSxcbiAgICAgIENpcmM6IGZ1bmN0aW9uKHQpIHsgcmV0dXJuIDEgLSBNYXRoLnNxcnQoIDEgLSB0ICogdCApOyB9LFxuICAgICAgRWxhc3RpYzogZnVuY3Rpb24odCwgbSkge1xuICAgICAgICBpZiggdCA9PT0gMCB8fCB0ID09PSAxICkgcmV0dXJuIHQ7XG4gICAgICAgIHZhciBwID0gKDEgLSBNYXRoLm1pbihtLCA5OTgpIC8gMTAwMCksIHN0ID0gdCAvIDEsIHN0MSA9IHN0IC0gMSwgcyA9IHAgLyAoIDIgKiBNYXRoLlBJICkgKiBNYXRoLmFzaW4oIDEgKTtcbiAgICAgICAgcmV0dXJuIC0oIE1hdGgucG93KCAyLCAxMCAqIHN0MSApICogTWF0aC5zaW4oICggc3QxIC0gcyApICogKCAyICogTWF0aC5QSSApIC8gcCApICk7XG4gICAgICB9LFxuICAgICAgQmFjazogZnVuY3Rpb24odCkgeyByZXR1cm4gdCAqIHQgKiAoIDMgKiB0IC0gMiApOyB9LFxuICAgICAgQm91bmNlOiBmdW5jdGlvbih0KSB7XG4gICAgICAgIHZhciBwb3cyLCBib3VuY2UgPSA0O1xuICAgICAgICB3aGlsZSAoIHQgPCAoICggcG93MiA9IE1hdGgucG93KCAyLCAtLWJvdW5jZSApICkgLSAxICkgLyAxMSApIHt9XG4gICAgICAgIHJldHVybiAxIC8gTWF0aC5wb3coIDQsIDMgLSBib3VuY2UgKSAtIDcuNTYyNSAqIE1hdGgucG93KCAoIHBvdzIgKiAzIC0gMiApIC8gMjIgLSB0LCAyICk7XG4gICAgICB9XG4gICAgfVxuICAgIG5hbWVzLmZvckVhY2goZnVuY3Rpb24obmFtZSwgaSkge1xuICAgICAgZnVuY3Rpb25zW25hbWVdID0gZnVuY3Rpb24odCkge1xuICAgICAgICByZXR1cm4gTWF0aC5wb3coIHQsIGkgKyAyICk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmtleXMoZnVuY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBlYXNlSW4gPSBmdW5jdGlvbnNbbmFtZV07XG4gICAgICBlYXNlc1snZWFzZUluJyArIG5hbWVdID0gZWFzZUluO1xuICAgICAgZWFzZXNbJ2Vhc2VPdXQnICsgbmFtZV0gPSBmdW5jdGlvbih0LCBtKSB7IHJldHVybiAxIC0gZWFzZUluKDEgLSB0LCBtKTsgfTtcbiAgICAgIGVhc2VzWydlYXNlSW5PdXQnICsgbmFtZV0gPSBmdW5jdGlvbih0LCBtKSB7IHJldHVybiB0IDwgMC41ID8gZWFzZUluKHQgKiAyLCBtKSAvIDIgOiAxIC0gZWFzZUluKHQgKiAtMiArIDIsIG0pIC8gMjsgfTtcbiAgICAgIGVhc2VzWydlYXNlT3V0SW4nICsgbmFtZV0gPSBmdW5jdGlvbih0LCBtKSB7IHJldHVybiB0IDwgMC41ID8gKDEgLSBlYXNlSW4oMSAtIDIgKiB0LCBtKSkgLyAyIDogKGVhc2VJbih0ICogMiAtIDEsIG0pICsgMSkgLyAyOyB9O1xuICAgIH0pO1xuICAgIGVhc2VzLmxpbmVhciA9IGZ1bmN0aW9uKHQpIHsgcmV0dXJuIHQ7IH07XG4gICAgcmV0dXJuIGVhc2VzO1xuICB9KSgpO1xuXG4gIC8vIFN0cmluZ3NcblxuICB2YXIgbnVtYmVyVG9TdHJpbmcgPSBmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gKGlzLnN0cih2YWwpKSA/IHZhbCA6IHZhbCArICcnO1xuICB9XG5cbiAgdmFyIHN0cmluZ1RvSHlwaGVucyA9IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIHZhciBzZWxlY3RTdHJpbmcgPSBmdW5jdGlvbihzdHIpIHtcbiAgICBpZiAoaXMuY29sKHN0cikpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgdmFyIG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzdHIpO1xuICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8vIE51bWJlcnNcblxuICB2YXIgcmFuZG9tID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcbiAgfVxuXG4gIC8vIEFycmF5c1xuXG4gIHZhciBmbGF0dGVuQXJyYXkgPSBmdW5jdGlvbihhcnIpIHtcbiAgICByZXR1cm4gYXJyLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYS5jb25jYXQoaXMuYXJyKGIpID8gZmxhdHRlbkFycmF5KGIpIDogYik7XG4gICAgfSwgW10pO1xuICB9XG5cbiAgdmFyIHRvQXJyYXkgPSBmdW5jdGlvbihvKSB7XG4gICAgaWYgKGlzLmFycihvKSkgcmV0dXJuIG87XG4gICAgaWYgKGlzLnN0cihvKSkgbyA9IHNlbGVjdFN0cmluZyhvKSB8fCBvO1xuICAgIGlmIChvIGluc3RhbmNlb2YgTm9kZUxpc3QgfHwgbyBpbnN0YW5jZW9mIEhUTUxDb2xsZWN0aW9uKSByZXR1cm4gW10uc2xpY2UuY2FsbChvKTtcbiAgICByZXR1cm4gW29dO1xuICB9XG5cbiAgdmFyIGFycmF5Q29udGFpbnMgPSBmdW5jdGlvbihhcnIsIHZhbCkge1xuICAgIHJldHVybiBhcnIuc29tZShmdW5jdGlvbihhKSB7IHJldHVybiBhID09PSB2YWw7IH0pO1xuICB9XG5cbiAgdmFyIGdyb3VwQXJyYXlCeVByb3BzID0gZnVuY3Rpb24oYXJyLCBwcm9wc0Fycikge1xuICAgIHZhciBncm91cHMgPSB7fTtcbiAgICBhcnIuZm9yRWFjaChmdW5jdGlvbihvKSB7XG4gICAgICB2YXIgZ3JvdXAgPSBKU09OLnN0cmluZ2lmeShwcm9wc0Fyci5tYXAoZnVuY3Rpb24ocCkgeyByZXR1cm4gb1twXTsgfSkpO1xuICAgICAgZ3JvdXBzW2dyb3VwXSA9IGdyb3Vwc1tncm91cF0gfHwgW107XG4gICAgICBncm91cHNbZ3JvdXBdLnB1c2gobyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGdyb3VwcykubWFwKGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICByZXR1cm4gZ3JvdXBzW2dyb3VwXTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZW1vdmVBcnJheUR1cGxpY2F0ZXMgPSBmdW5jdGlvbihhcnIpIHtcbiAgICByZXR1cm4gYXJyLmZpbHRlcihmdW5jdGlvbihpdGVtLCBwb3MsIHNlbGYpIHtcbiAgICAgIHJldHVybiBzZWxmLmluZGV4T2YoaXRlbSkgPT09IHBvcztcbiAgICB9KTtcbiAgfVxuXG4gIC8vIE9iamVjdHNcblxuICB2YXIgY2xvbmVPYmplY3QgPSBmdW5jdGlvbihvKSB7XG4gICAgdmFyIG5ld09iamVjdCA9IHt9O1xuICAgIGZvciAodmFyIHAgaW4gbykgbmV3T2JqZWN0W3BdID0gb1twXTtcbiAgICByZXR1cm4gbmV3T2JqZWN0O1xuICB9XG5cbiAgdmFyIG1lcmdlT2JqZWN0cyA9IGZ1bmN0aW9uKG8xLCBvMikge1xuICAgIGZvciAodmFyIHAgaW4gbzIpIG8xW3BdID0gIWlzLnVuZChvMVtwXSkgPyBvMVtwXSA6IG8yW3BdO1xuICAgIHJldHVybiBvMTtcbiAgfVxuXG4gIC8vIENvbG9yc1xuXG4gIHZhciBoZXhUb1JnYiA9IGZ1bmN0aW9uKGhleCkge1xuICAgIHZhciByZ3ggPSAvXiM/KFthLWZcXGRdKShbYS1mXFxkXSkoW2EtZlxcZF0pJC9pO1xuICAgIHZhciBoZXggPSBoZXgucmVwbGFjZShyZ3gsIGZ1bmN0aW9uKG0sIHIsIGcsIGIpIHsgcmV0dXJuIHIgKyByICsgZyArIGcgKyBiICsgYjsgfSk7XG4gICAgdmFyIHJnYiA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpO1xuICAgIHZhciByID0gcGFyc2VJbnQocmdiWzFdLCAxNik7XG4gICAgdmFyIGcgPSBwYXJzZUludChyZ2JbMl0sIDE2KTtcbiAgICB2YXIgYiA9IHBhcnNlSW50KHJnYlszXSwgMTYpO1xuICAgIHJldHVybiAncmdiKCcgKyByICsgJywnICsgZyArICcsJyArIGIgKyAnKSc7XG4gIH1cblxuICB2YXIgaHNsVG9SZ2IgPSBmdW5jdGlvbihoc2wpIHtcbiAgICB2YXIgaHNsID0gL2hzbFxcKChcXGQrKSxcXHMqKFtcXGQuXSspJSxcXHMqKFtcXGQuXSspJVxcKS9nLmV4ZWMoaHNsKTtcbiAgICB2YXIgaCA9IHBhcnNlSW50KGhzbFsxXSkgLyAzNjA7XG4gICAgdmFyIHMgPSBwYXJzZUludChoc2xbMl0pIC8gMTAwO1xuICAgIHZhciBsID0gcGFyc2VJbnQoaHNsWzNdKSAvIDEwMDtcbiAgICB2YXIgaHVlMnJnYiA9IGZ1bmN0aW9uKHAsIHEsIHQpIHtcbiAgICAgIGlmICh0IDwgMCkgdCArPSAxO1xuICAgICAgaWYgKHQgPiAxKSB0IC09IDE7XG4gICAgICBpZiAodCA8IDEvNikgcmV0dXJuIHAgKyAocSAtIHApICogNiAqIHQ7XG4gICAgICBpZiAodCA8IDEvMikgcmV0dXJuIHE7XG4gICAgICBpZiAodCA8IDIvMykgcmV0dXJuIHAgKyAocSAtIHApICogKDIvMyAtIHQpICogNjtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICB2YXIgciwgZywgYjtcbiAgICBpZiAocyA9PSAwKSB7XG4gICAgICByID0gZyA9IGIgPSBsO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcSA9IGwgPCAwLjUgPyBsICogKDEgKyBzKSA6IGwgKyBzIC0gbCAqIHM7XG4gICAgICB2YXIgcCA9IDIgKiBsIC0gcTtcbiAgICAgIHIgPSBodWUycmdiKHAsIHEsIGggKyAxLzMpO1xuICAgICAgZyA9IGh1ZTJyZ2IocCwgcSwgaCk7XG4gICAgICBiID0gaHVlMnJnYihwLCBxLCBoIC0gMS8zKTtcbiAgICB9XG4gICAgcmV0dXJuICdyZ2IoJyArIHIgKiAyNTUgKyAnLCcgKyBnICogMjU1ICsgJywnICsgYiAqIDI1NSArICcpJztcbiAgfVxuXG4gIHZhciBjb2xvclRvUmdiID0gZnVuY3Rpb24odmFsKSB7XG4gICAgaWYgKGlzLnJnYih2YWwpKSByZXR1cm4gdmFsO1xuICAgIGlmIChpcy5oZXgodmFsKSkgcmV0dXJuIGhleFRvUmdiKHZhbCk7XG4gICAgaWYgKGlzLmhzbCh2YWwpKSByZXR1cm4gaHNsVG9SZ2IodmFsKTtcbiAgfVxuXG4gIC8vIFVuaXRzXG5cbiAgdmFyIGdldFVuaXQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gLyhbXFwrXFwtXT9bMC05fGF1dG9cXC5dKykoJXxweHxwdHxlbXxyZW18aW58Y218bW18ZXh8cGN8dnd8dmh8ZGVnKT8vLmV4ZWModmFsKVsyXTtcbiAgfVxuXG4gIHZhciBhZGREZWZhdWx0VHJhbnNmb3JtVW5pdCA9IGZ1bmN0aW9uKHByb3AsIHZhbCwgaW50aWFsVmFsKSB7XG4gICAgaWYgKGdldFVuaXQodmFsKSkgcmV0dXJuIHZhbDtcbiAgICBpZiAocHJvcC5pbmRleE9mKCd0cmFuc2xhdGUnKSA+IC0xKSByZXR1cm4gZ2V0VW5pdChpbnRpYWxWYWwpID8gdmFsICsgZ2V0VW5pdChpbnRpYWxWYWwpIDogdmFsICsgJ3B4JztcbiAgICBpZiAocHJvcC5pbmRleE9mKCdyb3RhdGUnKSA+IC0xIHx8IHByb3AuaW5kZXhPZignc2tldycpID4gLTEpIHJldHVybiB2YWwgKyAnZGVnJztcbiAgICByZXR1cm4gdmFsO1xuICB9XG5cbiAgLy8gVmFsdWVzXG5cbiAgdmFyIGdldENTU1ZhbHVlID0gZnVuY3Rpb24oZWwsIHByb3ApIHtcbiAgICAvLyBGaXJzdCBjaGVjayBpZiBwcm9wIGlzIGEgdmFsaWQgQ1NTIHByb3BlcnR5XG4gICAgaWYgKHByb3AgaW4gZWwuc3R5bGUpIHtcbiAgICAgIC8vIFRoZW4gcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvciBmYWxsYmFjayB0byAnMCcgd2hlbiBnZXRQcm9wZXJ0eVZhbHVlIGZhaWxzXG4gICAgICByZXR1cm4gZ2V0Q29tcHV0ZWRTdHlsZShlbCkuZ2V0UHJvcGVydHlWYWx1ZShzdHJpbmdUb0h5cGhlbnMocHJvcCkpIHx8ICcwJztcbiAgICB9XG4gIH1cblxuICB2YXIgZ2V0VHJhbnNmb3JtVmFsdWUgPSBmdW5jdGlvbihlbCwgcHJvcCkge1xuICAgIHZhciBkZWZhdWx0VmFsID0gcHJvcC5pbmRleE9mKCdzY2FsZScpID4gLTEgPyAxIDogMDtcbiAgICB2YXIgc3RyID0gZWwuc3R5bGUudHJhbnNmb3JtO1xuICAgIGlmICghc3RyKSByZXR1cm4gZGVmYXVsdFZhbDtcbiAgICB2YXIgcmd4ID0gLyhcXHcrKVxcKCguKz8pXFwpL2c7XG4gICAgdmFyIG1hdGNoID0gW107XG4gICAgdmFyIHByb3BzID0gW107XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgIHdoaWxlIChtYXRjaCA9IHJneC5leGVjKHN0cikpIHtcbiAgICAgIHByb3BzLnB1c2gobWF0Y2hbMV0pO1xuICAgICAgdmFsdWVzLnB1c2gobWF0Y2hbMl0pO1xuICAgIH1cbiAgICB2YXIgdmFsID0gdmFsdWVzLmZpbHRlcihmdW5jdGlvbihmLCBpKSB7IHJldHVybiBwcm9wc1tpXSA9PT0gcHJvcDsgfSk7XG4gICAgcmV0dXJuIHZhbC5sZW5ndGggPyB2YWxbMF0gOiBkZWZhdWx0VmFsO1xuICB9XG5cbiAgdmFyIGdldEFuaW1hdGlvblR5cGUgPSBmdW5jdGlvbihlbCwgcHJvcCkge1xuICAgIGlmICggaXMuZG9tKGVsKSAmJiBhcnJheUNvbnRhaW5zKHZhbGlkVHJhbnNmb3JtcywgcHJvcCkpIHJldHVybiAndHJhbnNmb3JtJztcbiAgICBpZiAoIGlzLmRvbShlbCkgJiYgKGVsLmdldEF0dHJpYnV0ZShwcm9wKSB8fCAoaXMuc3ZnKGVsKSAmJiBlbFtwcm9wXSkpKSByZXR1cm4gJ2F0dHJpYnV0ZSc7XG4gICAgaWYgKCBpcy5kb20oZWwpICYmIChwcm9wICE9PSAndHJhbnNmb3JtJyAmJiBnZXRDU1NWYWx1ZShlbCwgcHJvcCkpKSByZXR1cm4gJ2Nzcyc7XG4gICAgaWYgKCFpcy5udWwoZWxbcHJvcF0pICYmICFpcy51bmQoZWxbcHJvcF0pKSByZXR1cm4gJ29iamVjdCc7XG4gIH1cblxuICB2YXIgZ2V0SW5pdGlhbFRhcmdldFZhbHVlID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wKSB7XG4gICAgc3dpdGNoIChnZXRBbmltYXRpb25UeXBlKHRhcmdldCwgcHJvcCkpIHtcbiAgICAgIGNhc2UgJ3RyYW5zZm9ybSc6IHJldHVybiBnZXRUcmFuc2Zvcm1WYWx1ZSh0YXJnZXQsIHByb3ApO1xuICAgICAgY2FzZSAnY3NzJzogcmV0dXJuIGdldENTU1ZhbHVlKHRhcmdldCwgcHJvcCk7XG4gICAgICBjYXNlICdhdHRyaWJ1dGUnOiByZXR1cm4gdGFyZ2V0LmdldEF0dHJpYnV0ZShwcm9wKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldFtwcm9wXSB8fCAwO1xuICB9XG5cbiAgdmFyIGdldFZhbGlkVmFsdWUgPSBmdW5jdGlvbih2YWx1ZXMsIHZhbCwgb3JpZ2luYWxDU1MpIHtcbiAgICBpZiAoaXMuY29sKHZhbCkpIHJldHVybiBjb2xvclRvUmdiKHZhbCk7XG4gICAgaWYgKGdldFVuaXQodmFsKSkgcmV0dXJuIHZhbDtcbiAgICB2YXIgdW5pdCA9IGdldFVuaXQodmFsdWVzLnRvKSA/IGdldFVuaXQodmFsdWVzLnRvKSA6IGdldFVuaXQodmFsdWVzLmZyb20pO1xuICAgIGlmICghdW5pdCAmJiBvcmlnaW5hbENTUykgdW5pdCA9IGdldFVuaXQob3JpZ2luYWxDU1MpO1xuICAgIHJldHVybiB1bml0ID8gdmFsICsgdW5pdCA6IHZhbDtcbiAgfVxuXG4gIHZhciBkZWNvbXBvc2VWYWx1ZSA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHZhciByZ3ggPSAvLT9cXGQqXFwuP1xcZCsvZztcbiAgICByZXR1cm4ge1xuICAgICAgb3JpZ2luYWw6IHZhbCxcbiAgICAgIG51bWJlcnM6IG51bWJlclRvU3RyaW5nKHZhbCkubWF0Y2gocmd4KSA/IG51bWJlclRvU3RyaW5nKHZhbCkubWF0Y2gocmd4KS5tYXAoTnVtYmVyKSA6IFswXSxcbiAgICAgIHN0cmluZ3M6IG51bWJlclRvU3RyaW5nKHZhbCkuc3BsaXQocmd4KVxuICAgIH1cbiAgfVxuXG4gIHZhciByZWNvbXBvc2VWYWx1ZSA9IGZ1bmN0aW9uKG51bWJlcnMsIHN0cmluZ3MsIGluaXRpYWxTdHJpbmdzKSB7XG4gICAgcmV0dXJuIHN0cmluZ3MucmVkdWNlKGZ1bmN0aW9uKGEsIGIsIGkpIHtcbiAgICAgIHZhciBiID0gKGIgPyBiIDogaW5pdGlhbFN0cmluZ3NbaSAtIDFdKTtcbiAgICAgIHJldHVybiBhICsgbnVtYmVyc1tpIC0gMV0gKyBiO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gQW5pbWF0YWJsZXNcblxuICB2YXIgZ2V0QW5pbWF0YWJsZXMgPSBmdW5jdGlvbih0YXJnZXRzKSB7XG4gICAgdmFyIHRhcmdldHMgPSB0YXJnZXRzID8gKGZsYXR0ZW5BcnJheShpcy5hcnIodGFyZ2V0cykgPyB0YXJnZXRzLm1hcCh0b0FycmF5KSA6IHRvQXJyYXkodGFyZ2V0cykpKSA6IFtdO1xuICAgIHJldHVybiB0YXJnZXRzLm1hcChmdW5jdGlvbih0LCBpKSB7XG4gICAgICByZXR1cm4geyB0YXJnZXQ6IHQsIGlkOiBpIH07XG4gICAgfSk7XG4gIH1cblxuICAvLyBQcm9wZXJ0aWVzXG5cbiAgdmFyIGdldFByb3BlcnRpZXMgPSBmdW5jdGlvbihwYXJhbXMsIHNldHRpbmdzKSB7XG4gICAgdmFyIHByb3BzID0gW107XG4gICAgZm9yICh2YXIgcCBpbiBwYXJhbXMpIHtcbiAgICAgIGlmICghZGVmYXVsdFNldHRpbmdzLmhhc093blByb3BlcnR5KHApICYmIHAgIT09ICd0YXJnZXRzJykge1xuICAgICAgICB2YXIgcHJvcCA9IGlzLm9iaihwYXJhbXNbcF0pID8gY2xvbmVPYmplY3QocGFyYW1zW3BdKSA6IHt2YWx1ZTogcGFyYW1zW3BdfTtcbiAgICAgICAgcHJvcC5uYW1lID0gcDtcbiAgICAgICAgcHJvcHMucHVzaChtZXJnZU9iamVjdHMocHJvcCwgc2V0dGluZ3MpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHByb3BzO1xuICB9XG5cbiAgdmFyIGdldFByb3BlcnRpZXNWYWx1ZXMgPSBmdW5jdGlvbih0YXJnZXQsIHByb3AsIHZhbHVlLCBpKSB7XG4gICAgdmFyIHZhbHVlcyA9IHRvQXJyYXkoIGlzLmZuYyh2YWx1ZSkgPyB2YWx1ZSh0YXJnZXQsIGkpIDogdmFsdWUpO1xuICAgIHJldHVybiB7XG4gICAgICBmcm9tOiAodmFsdWVzLmxlbmd0aCA+IDEpID8gdmFsdWVzWzBdIDogZ2V0SW5pdGlhbFRhcmdldFZhbHVlKHRhcmdldCwgcHJvcCksXG4gICAgICB0bzogKHZhbHVlcy5sZW5ndGggPiAxKSA/IHZhbHVlc1sxXSA6IHZhbHVlc1swXVxuICAgIH1cbiAgfVxuXG4gIC8vIFR3ZWVuc1xuXG4gIHZhciBnZXRUd2VlblZhbHVlcyA9IGZ1bmN0aW9uKHByb3AsIHZhbHVlcywgdHlwZSwgdGFyZ2V0KSB7XG4gICAgdmFyIHZhbGlkID0ge307XG4gICAgaWYgKHR5cGUgPT09ICd0cmFuc2Zvcm0nKSB7XG4gICAgICB2YWxpZC5mcm9tID0gcHJvcCArICcoJyArIGFkZERlZmF1bHRUcmFuc2Zvcm1Vbml0KHByb3AsIHZhbHVlcy5mcm9tLCB2YWx1ZXMudG8pICsgJyknO1xuICAgICAgdmFsaWQudG8gPSBwcm9wICsgJygnICsgYWRkRGVmYXVsdFRyYW5zZm9ybVVuaXQocHJvcCwgdmFsdWVzLnRvKSArICcpJztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG9yaWdpbmFsQ1NTID0gKHR5cGUgPT09ICdjc3MnKSA/IGdldENTU1ZhbHVlKHRhcmdldCwgcHJvcCkgOiB1bmRlZmluZWQ7XG4gICAgICB2YWxpZC5mcm9tID0gZ2V0VmFsaWRWYWx1ZSh2YWx1ZXMsIHZhbHVlcy5mcm9tLCBvcmlnaW5hbENTUyk7XG4gICAgICB2YWxpZC50byA9IGdldFZhbGlkVmFsdWUodmFsdWVzLCB2YWx1ZXMudG8sIG9yaWdpbmFsQ1NTKTtcbiAgICB9XG4gICAgcmV0dXJuIHsgZnJvbTogZGVjb21wb3NlVmFsdWUodmFsaWQuZnJvbSksIHRvOiBkZWNvbXBvc2VWYWx1ZSh2YWxpZC50bykgfTtcbiAgfVxuXG4gIHZhciBnZXRUd2VlbnNQcm9wcyA9IGZ1bmN0aW9uKGFuaW1hdGFibGVzLCBwcm9wcykge1xuICAgIHZhciB0d2VlbnNQcm9wcyA9IFtdO1xuICAgIGFuaW1hdGFibGVzLmZvckVhY2goZnVuY3Rpb24oYW5pbWF0YWJsZSwgaSkge1xuICAgICAgdmFyIHRhcmdldCA9IGFuaW1hdGFibGUudGFyZ2V0O1xuICAgICAgcmV0dXJuIHByb3BzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgICB2YXIgYW5pbVR5cGUgPSBnZXRBbmltYXRpb25UeXBlKHRhcmdldCwgcHJvcC5uYW1lKTtcbiAgICAgICAgaWYgKGFuaW1UeXBlKSB7XG4gICAgICAgICAgdmFyIHZhbHVlcyA9IGdldFByb3BlcnRpZXNWYWx1ZXModGFyZ2V0LCBwcm9wLm5hbWUsIHByb3AudmFsdWUsIGkpO1xuICAgICAgICAgIHZhciB0d2VlbiA9IGNsb25lT2JqZWN0KHByb3ApO1xuICAgICAgICAgIHR3ZWVuLmFuaW1hdGFibGVzID0gYW5pbWF0YWJsZTtcbiAgICAgICAgICB0d2Vlbi50eXBlID0gYW5pbVR5cGU7XG4gICAgICAgICAgdHdlZW4uZnJvbSA9IGdldFR3ZWVuVmFsdWVzKHByb3AubmFtZSwgdmFsdWVzLCB0d2Vlbi50eXBlLCB0YXJnZXQpLmZyb207XG4gICAgICAgICAgdHdlZW4udG8gPSBnZXRUd2VlblZhbHVlcyhwcm9wLm5hbWUsIHZhbHVlcywgdHdlZW4udHlwZSwgdGFyZ2V0KS50bztcbiAgICAgICAgICB0d2Vlbi5yb3VuZCA9IChpcy5jb2wodmFsdWVzLmZyb20pIHx8IHR3ZWVuLnJvdW5kKSA/IDEgOiAwO1xuICAgICAgICAgIHR3ZWVuLmRlbGF5ID0gKGlzLmZuYyh0d2Vlbi5kZWxheSkgPyB0d2Vlbi5kZWxheSh0YXJnZXQsIGksIGFuaW1hdGFibGVzLmxlbmd0aCkgOiB0d2Vlbi5kZWxheSkgLyBhbmltYXRpb24uc3BlZWQ7XG4gICAgICAgICAgdHdlZW4uZHVyYXRpb24gPSAoaXMuZm5jKHR3ZWVuLmR1cmF0aW9uKSA/IHR3ZWVuLmR1cmF0aW9uKHRhcmdldCwgaSwgYW5pbWF0YWJsZXMubGVuZ3RoKSA6IHR3ZWVuLmR1cmF0aW9uKSAvIGFuaW1hdGlvbi5zcGVlZDtcbiAgICAgICAgICB0d2VlbnNQcm9wcy5wdXNoKHR3ZWVuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHR3ZWVuc1Byb3BzO1xuICB9XG5cbiAgdmFyIGdldFR3ZWVucyA9IGZ1bmN0aW9uKGFuaW1hdGFibGVzLCBwcm9wcykge1xuICAgIHZhciB0d2VlbnNQcm9wcyA9IGdldFR3ZWVuc1Byb3BzKGFuaW1hdGFibGVzLCBwcm9wcyk7XG4gICAgdmFyIHNwbGl0dGVkUHJvcHMgPSBncm91cEFycmF5QnlQcm9wcyh0d2VlbnNQcm9wcywgWyduYW1lJywgJ2Zyb20nLCAndG8nLCAnZGVsYXknLCAnZHVyYXRpb24nXSk7XG4gICAgcmV0dXJuIHNwbGl0dGVkUHJvcHMubWFwKGZ1bmN0aW9uKHR3ZWVuUHJvcHMpIHtcbiAgICAgIHZhciB0d2VlbiA9IGNsb25lT2JqZWN0KHR3ZWVuUHJvcHNbMF0pO1xuICAgICAgdHdlZW4uYW5pbWF0YWJsZXMgPSB0d2VlblByb3BzLm1hcChmdW5jdGlvbihwKSB7IHJldHVybiBwLmFuaW1hdGFibGVzIH0pO1xuICAgICAgdHdlZW4udG90YWxEdXJhdGlvbiA9IHR3ZWVuLmRlbGF5ICsgdHdlZW4uZHVyYXRpb247XG4gICAgICByZXR1cm4gdHdlZW47XG4gICAgfSk7XG4gIH1cblxuICB2YXIgcmV2ZXJzZVR3ZWVucyA9IGZ1bmN0aW9uKGFuaW0sIGRlbGF5cykge1xuICAgIGFuaW0udHdlZW5zLmZvckVhY2goZnVuY3Rpb24odHdlZW4pIHtcbiAgICAgIHZhciB0b1ZhbCA9IHR3ZWVuLnRvO1xuICAgICAgdmFyIGZyb21WYWwgPSB0d2Vlbi5mcm9tO1xuICAgICAgdmFyIGRlbGF5VmFsID0gYW5pbS5kdXJhdGlvbiAtICh0d2Vlbi5kZWxheSArIHR3ZWVuLmR1cmF0aW9uKTtcbiAgICAgIHR3ZWVuLmZyb20gPSB0b1ZhbDtcbiAgICAgIHR3ZWVuLnRvID0gZnJvbVZhbDtcbiAgICAgIGlmIChkZWxheXMpIHR3ZWVuLmRlbGF5ID0gZGVsYXlWYWw7XG4gICAgfSk7XG4gICAgYW5pbS5yZXZlcnNlZCA9IGFuaW0ucmV2ZXJzZWQgPyBmYWxzZSA6IHRydWU7XG4gIH1cblxuICB2YXIgZ2V0VHdlZW5zRHVyYXRpb24gPSBmdW5jdGlvbih0d2VlbnMpIHtcbiAgICByZXR1cm4gTWF0aC5tYXguYXBwbHkoTWF0aCwgdHdlZW5zLm1hcChmdW5jdGlvbih0d2Vlbil7IHJldHVybiB0d2Vlbi50b3RhbER1cmF0aW9uOyB9KSk7XG4gIH1cblxuICB2YXIgZ2V0VHdlZW5zRGVsYXkgPSBmdW5jdGlvbih0d2VlbnMpIHtcbiAgICByZXR1cm4gTWF0aC5taW4uYXBwbHkoTWF0aCwgdHdlZW5zLm1hcChmdW5jdGlvbih0d2Vlbil7IHJldHVybiB0d2Vlbi5kZWxheTsgfSkpO1xuICB9XG5cbiAgLy8gd2lsbC1jaGFuZ2VcblxuICB2YXIgZ2V0V2lsbENoYW5nZSA9IGZ1bmN0aW9uKGFuaW0pIHtcbiAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICB2YXIgZWxzID0gW107XG4gICAgYW5pbS50d2VlbnMuZm9yRWFjaChmdW5jdGlvbih0d2Vlbikge1xuICAgICAgaWYgKHR3ZWVuLnR5cGUgPT09ICdjc3MnIHx8IHR3ZWVuLnR5cGUgPT09ICd0cmFuc2Zvcm0nICkge1xuICAgICAgICBwcm9wcy5wdXNoKHR3ZWVuLnR5cGUgPT09ICdjc3MnID8gc3RyaW5nVG9IeXBoZW5zKHR3ZWVuLm5hbWUpIDogJ3RyYW5zZm9ybScpO1xuICAgICAgICB0d2Vlbi5hbmltYXRhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uKGFuaW1hdGFibGUpIHsgZWxzLnB1c2goYW5pbWF0YWJsZS50YXJnZXQpOyB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvcGVydGllczogcmVtb3ZlQXJyYXlEdXBsaWNhdGVzKHByb3BzKS5qb2luKCcsICcpLFxuICAgICAgZWxlbWVudHM6IHJlbW92ZUFycmF5RHVwbGljYXRlcyhlbHMpXG4gICAgfVxuICB9XG5cbiAgdmFyIHNldFdpbGxDaGFuZ2UgPSBmdW5jdGlvbihhbmltKSB7XG4gICAgdmFyIHdpbGxDaGFuZ2UgPSBnZXRXaWxsQ2hhbmdlKGFuaW0pO1xuICAgIHdpbGxDaGFuZ2UuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICBlbGVtZW50LnN0eWxlLndpbGxDaGFuZ2UgPSB3aWxsQ2hhbmdlLnByb3BlcnRpZXM7XG4gICAgfSk7XG4gIH1cblxuICB2YXIgcmVtb3ZlV2lsbENoYW5nZSA9IGZ1bmN0aW9uKGFuaW0pIHtcbiAgICB2YXIgd2lsbENoYW5nZSA9IGdldFdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgd2lsbENoYW5nZS5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIGVsZW1lbnQuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ3dpbGwtY2hhbmdlJyk7XG4gICAgfSk7XG4gIH1cblxuICAvKiBTdmcgcGF0aCAqL1xuXG4gIHZhciBnZXRQYXRoUHJvcHMgPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgdmFyIGVsID0gaXMuc3RyKHBhdGgpID8gc2VsZWN0U3RyaW5nKHBhdGgpWzBdIDogcGF0aDtcbiAgICByZXR1cm4ge1xuICAgICAgcGF0aDogZWwsXG4gICAgICB2YWx1ZTogZWwuZ2V0VG90YWxMZW5ndGgoKVxuICAgIH1cbiAgfVxuXG4gIHZhciBzbmFwUHJvZ3Jlc3NUb1BhdGggPSBmdW5jdGlvbih0d2VlbiwgcHJvZ3Jlc3MpIHtcbiAgICB2YXIgcGF0aEVsID0gdHdlZW4ucGF0aDtcbiAgICB2YXIgcGF0aFByb2dyZXNzID0gdHdlZW4udmFsdWUgKiBwcm9ncmVzcztcbiAgICB2YXIgcG9pbnQgPSBmdW5jdGlvbihvZmZzZXQpIHtcbiAgICAgIHZhciBvID0gb2Zmc2V0IHx8IDA7XG4gICAgICB2YXIgcCA9IHByb2dyZXNzID4gMSA/IHR3ZWVuLnZhbHVlICsgbyA6IHBhdGhQcm9ncmVzcyArIG87XG4gICAgICByZXR1cm4gcGF0aEVsLmdldFBvaW50QXRMZW5ndGgocCk7XG4gICAgfVxuICAgIHZhciBwID0gcG9pbnQoKTtcbiAgICB2YXIgcDAgPSBwb2ludCgtMSk7XG4gICAgdmFyIHAxID0gcG9pbnQoKzEpO1xuICAgIHN3aXRjaCAodHdlZW4ubmFtZSkge1xuICAgICAgY2FzZSAndHJhbnNsYXRlWCc6IHJldHVybiBwLng7XG4gICAgICBjYXNlICd0cmFuc2xhdGVZJzogcmV0dXJuIHAueTtcbiAgICAgIGNhc2UgJ3JvdGF0ZSc6IHJldHVybiBNYXRoLmF0YW4yKHAxLnkgLSBwMC55LCBwMS54IC0gcDAueCkgKiAxODAgLyBNYXRoLlBJO1xuICAgIH1cbiAgfVxuXG4gIC8vIFByb2dyZXNzXG5cbiAgdmFyIGdldFR3ZWVuUHJvZ3Jlc3MgPSBmdW5jdGlvbih0d2VlbiwgdGltZSkge1xuICAgIHZhciBlbGFwc2VkID0gTWF0aC5taW4oTWF0aC5tYXgodGltZSAtIHR3ZWVuLmRlbGF5LCAwKSwgdHdlZW4uZHVyYXRpb24pO1xuICAgIHZhciBwZXJjZW50ID0gZWxhcHNlZCAvIHR3ZWVuLmR1cmF0aW9uO1xuICAgIHZhciBwcm9ncmVzcyA9IHR3ZWVuLnRvLm51bWJlcnMubWFwKGZ1bmN0aW9uKG51bWJlciwgcCkge1xuICAgICAgdmFyIHN0YXJ0ID0gdHdlZW4uZnJvbS5udW1iZXJzW3BdO1xuICAgICAgdmFyIGVhc2VkID0gZWFzaW5nc1t0d2Vlbi5lYXNpbmddKHBlcmNlbnQsIHR3ZWVuLmVsYXN0aWNpdHkpO1xuICAgICAgdmFyIHZhbCA9IHR3ZWVuLnBhdGggPyBzbmFwUHJvZ3Jlc3NUb1BhdGgodHdlZW4sIGVhc2VkKSA6IHN0YXJ0ICsgZWFzZWQgKiAobnVtYmVyIC0gc3RhcnQpO1xuICAgICAgdmFsID0gdHdlZW4ucm91bmQgPyBNYXRoLnJvdW5kKHZhbCAqIHR3ZWVuLnJvdW5kKSAvIHR3ZWVuLnJvdW5kIDogdmFsO1xuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVjb21wb3NlVmFsdWUocHJvZ3Jlc3MsIHR3ZWVuLnRvLnN0cmluZ3MsIHR3ZWVuLmZyb20uc3RyaW5ncyk7XG4gIH1cblxuICB2YXIgc2V0QW5pbWF0aW9uUHJvZ3Jlc3MgPSBmdW5jdGlvbihhbmltLCB0aW1lKSB7XG4gICAgdmFyIHRyYW5zZm9ybXM7XG4gICAgYW5pbS5jdXJyZW50VGltZSA9IHRpbWU7XG4gICAgYW5pbS5wcm9ncmVzcyA9ICh0aW1lIC8gYW5pbS5kdXJhdGlvbikgKiAxMDA7XG4gICAgZm9yICh2YXIgdCA9IDA7IHQgPCBhbmltLnR3ZWVucy5sZW5ndGg7IHQrKykge1xuICAgICAgdmFyIHR3ZWVuID0gYW5pbS50d2VlbnNbdF07XG4gICAgICB0d2Vlbi5jdXJyZW50VmFsdWUgPSBnZXRUd2VlblByb2dyZXNzKHR3ZWVuLCB0aW1lKTtcbiAgICAgIHZhciBwcm9ncmVzcyA9IHR3ZWVuLmN1cnJlbnRWYWx1ZTtcbiAgICAgIGZvciAodmFyIGEgPSAwOyBhIDwgdHdlZW4uYW5pbWF0YWJsZXMubGVuZ3RoOyBhKyspIHtcbiAgICAgICAgdmFyIGFuaW1hdGFibGUgPSB0d2Vlbi5hbmltYXRhYmxlc1thXTtcbiAgICAgICAgdmFyIGlkID0gYW5pbWF0YWJsZS5pZDtcbiAgICAgICAgdmFyIHRhcmdldCA9IGFuaW1hdGFibGUudGFyZ2V0O1xuICAgICAgICB2YXIgbmFtZSA9IHR3ZWVuLm5hbWU7XG4gICAgICAgIHN3aXRjaCAodHdlZW4udHlwZSkge1xuICAgICAgICAgIGNhc2UgJ2Nzcyc6IHRhcmdldC5zdHlsZVtuYW1lXSA9IHByb2dyZXNzOyBicmVhaztcbiAgICAgICAgICBjYXNlICdhdHRyaWJ1dGUnOiB0YXJnZXQuc2V0QXR0cmlidXRlKG5hbWUsIHByb2dyZXNzKTsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnb2JqZWN0JzogdGFyZ2V0W25hbWVdID0gcHJvZ3Jlc3M7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3RyYW5zZm9ybSc6XG4gICAgICAgICAgaWYgKCF0cmFuc2Zvcm1zKSB0cmFuc2Zvcm1zID0ge307XG4gICAgICAgICAgaWYgKCF0cmFuc2Zvcm1zW2lkXSkgdHJhbnNmb3Jtc1tpZF0gPSBbXTtcbiAgICAgICAgICB0cmFuc2Zvcm1zW2lkXS5wdXNoKHByb2dyZXNzKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHJhbnNmb3Jtcykge1xuICAgICAgaWYgKCF0cmFuc2Zvcm0pIHRyYW5zZm9ybSA9IChnZXRDU1NWYWx1ZShkb2N1bWVudC5ib2R5LCB0cmFuc2Zvcm1TdHIpID8gJycgOiAnLXdlYmtpdC0nKSArIHRyYW5zZm9ybVN0cjtcbiAgICAgIGZvciAodmFyIHQgaW4gdHJhbnNmb3Jtcykge1xuICAgICAgICBhbmltLmFuaW1hdGFibGVzW3RdLnRhcmdldC5zdHlsZVt0cmFuc2Zvcm1dID0gdHJhbnNmb3Jtc1t0XS5qb2luKCcgJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQW5pbWF0aW9uXG5cbiAgdmFyIGNyZWF0ZUFuaW1hdGlvbiA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgIHZhciBhbmltID0ge307XG4gICAgYW5pbS5hbmltYXRhYmxlcyA9IGdldEFuaW1hdGFibGVzKHBhcmFtcy50YXJnZXRzKTtcbiAgICBhbmltLnNldHRpbmdzID0gbWVyZ2VPYmplY3RzKHBhcmFtcywgZGVmYXVsdFNldHRpbmdzKTtcbiAgICBhbmltLnByb3BlcnRpZXMgPSBnZXRQcm9wZXJ0aWVzKHBhcmFtcywgYW5pbS5zZXR0aW5ncyk7XG4gICAgYW5pbS50d2VlbnMgPSBnZXRUd2VlbnMoYW5pbS5hbmltYXRhYmxlcywgYW5pbS5wcm9wZXJ0aWVzKTtcbiAgICBhbmltLmR1cmF0aW9uID0gYW5pbS50d2VlbnMubGVuZ3RoID8gZ2V0VHdlZW5zRHVyYXRpb24oYW5pbS50d2VlbnMpIDogcGFyYW1zLmR1cmF0aW9uO1xuICAgIGFuaW0uZGVsYXkgPSBhbmltLnR3ZWVucy5sZW5ndGggPyBnZXRUd2VlbnNEZWxheShhbmltLnR3ZWVucykgOiBwYXJhbXMuZGVsYXk7XG4gICAgYW5pbS5jdXJyZW50VGltZSA9IDA7XG4gICAgYW5pbS5wcm9ncmVzcyA9IDA7XG4gICAgYW5pbS5lbmRlZCA9IGZhbHNlO1xuICAgIHJldHVybiBhbmltO1xuICB9XG5cbiAgLy8gUHVibGljXG5cbiAgdmFyIGFuaW1hdGlvbnMgPSBbXTtcbiAgdmFyIHJhZiA9IDA7XG5cbiAgdmFyIGVuZ2luZSA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgcGxheSA9IGZ1bmN0aW9uKCkgeyByYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RlcCk7IH07XG4gICAgdmFyIHN0ZXAgPSBmdW5jdGlvbih0KSB7XG4gICAgICBpZiAoYW5pbWF0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbmltYXRpb25zLmxlbmd0aDsgaSsrKSBhbmltYXRpb25zW2ldLnRpY2sodCk7XG4gICAgICAgIHBsYXkoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHJhZik7XG4gICAgICAgIHJhZiA9IDA7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwbGF5O1xuICB9KSgpO1xuXG4gIHZhciBhbmltYXRpb24gPSBmdW5jdGlvbihwYXJhbXMpIHtcblxuICAgIHZhciBhbmltID0gY3JlYXRlQW5pbWF0aW9uKHBhcmFtcyk7XG4gICAgdmFyIHRpbWUgPSB7fTtcblxuICAgIGFuaW0udGljayA9IGZ1bmN0aW9uKG5vdykge1xuICAgICAgYW5pbS5lbmRlZCA9IGZhbHNlO1xuICAgICAgaWYgKCF0aW1lLnN0YXJ0KSB0aW1lLnN0YXJ0ID0gbm93O1xuICAgICAgdGltZS5jdXJyZW50ID0gTWF0aC5taW4oTWF0aC5tYXgodGltZS5sYXN0ICsgbm93IC0gdGltZS5zdGFydCwgMCksIGFuaW0uZHVyYXRpb24pO1xuICAgICAgc2V0QW5pbWF0aW9uUHJvZ3Jlc3MoYW5pbSwgdGltZS5jdXJyZW50KTtcbiAgICAgIHZhciBzID0gYW5pbS5zZXR0aW5ncztcbiAgICAgIGlmICh0aW1lLmN1cnJlbnQgPj0gYW5pbS5kZWxheSkge1xuICAgICAgICBpZiAocy5iZWdpbikgcy5iZWdpbihhbmltKTsgcy5iZWdpbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHMudXBkYXRlKSBzLnVwZGF0ZShhbmltKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aW1lLmN1cnJlbnQgPj0gYW5pbS5kdXJhdGlvbikge1xuICAgICAgICBpZiAocy5sb29wKSB7XG4gICAgICAgICAgdGltZS5zdGFydCA9IG5vdztcbiAgICAgICAgICBpZiAocy5kaXJlY3Rpb24gPT09ICdhbHRlcm5hdGUnKSByZXZlcnNlVHdlZW5zKGFuaW0sIHRydWUpO1xuICAgICAgICAgIGlmIChpcy5udW0ocy5sb29wKSkgcy5sb29wLS07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYW5pbS5lbmRlZCA9IHRydWU7XG4gICAgICAgICAgYW5pbS5wYXVzZSgpO1xuICAgICAgICAgIGlmIChzLmNvbXBsZXRlKSBzLmNvbXBsZXRlKGFuaW0pO1xuICAgICAgICB9XG4gICAgICAgIHRpbWUubGFzdCA9IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYW5pbS5zZWVrID0gZnVuY3Rpb24ocHJvZ3Jlc3MpIHtcbiAgICAgIHNldEFuaW1hdGlvblByb2dyZXNzKGFuaW0sIChwcm9ncmVzcyAvIDEwMCkgKiBhbmltLmR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBhbmltLnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZW1vdmVXaWxsQ2hhbmdlKGFuaW0pO1xuICAgICAgdmFyIGkgPSBhbmltYXRpb25zLmluZGV4T2YoYW5pbSk7XG4gICAgICBpZiAoaSA+IC0xKSBhbmltYXRpb25zLnNwbGljZShpLCAxKTtcbiAgICB9XG5cbiAgICBhbmltLnBsYXkgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgIGFuaW0ucGF1c2UoKTtcbiAgICAgIGlmIChwYXJhbXMpIGFuaW0gPSBtZXJnZU9iamVjdHMoY3JlYXRlQW5pbWF0aW9uKG1lcmdlT2JqZWN0cyhwYXJhbXMsIGFuaW0uc2V0dGluZ3MpKSwgYW5pbSk7XG4gICAgICB0aW1lLnN0YXJ0ID0gMDtcbiAgICAgIHRpbWUubGFzdCA9IGFuaW0uZW5kZWQgPyAwIDogYW5pbS5jdXJyZW50VGltZTtcbiAgICAgIHZhciBzID0gYW5pbS5zZXR0aW5ncztcbiAgICAgIGlmIChzLmRpcmVjdGlvbiA9PT0gJ3JldmVyc2UnKSByZXZlcnNlVHdlZW5zKGFuaW0pO1xuICAgICAgaWYgKHMuZGlyZWN0aW9uID09PSAnYWx0ZXJuYXRlJyAmJiAhcy5sb29wKSBzLmxvb3AgPSAxO1xuICAgICAgc2V0V2lsbENoYW5nZShhbmltKTtcbiAgICAgIGFuaW1hdGlvbnMucHVzaChhbmltKTtcbiAgICAgIGlmICghcmFmKSBlbmdpbmUoKTtcbiAgICB9XG5cbiAgICBhbmltLnJlc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChhbmltLnJldmVyc2VkKSByZXZlcnNlVHdlZW5zKGFuaW0pO1xuICAgICAgYW5pbS5wYXVzZSgpO1xuICAgICAgYW5pbS5zZWVrKDApO1xuICAgICAgYW5pbS5wbGF5KCk7XG4gICAgfVxuXG4gICAgaWYgKGFuaW0uc2V0dGluZ3MuYXV0b3BsYXkpIGFuaW0ucGxheSgpO1xuXG4gICAgcmV0dXJuIGFuaW07XG5cbiAgfVxuXG4gIC8vIFJlbW92ZSBvbmUgb3IgbXVsdGlwbGUgdGFyZ2V0cyBmcm9tIGFsbCBhY3RpdmUgYW5pbWF0aW9ucy5cblxuICB2YXIgcmVtb3ZlID0gZnVuY3Rpb24oZWxlbWVudHMpIHtcbiAgICB2YXIgdGFyZ2V0cyA9IGZsYXR0ZW5BcnJheShpcy5hcnIoZWxlbWVudHMpID8gZWxlbWVudHMubWFwKHRvQXJyYXkpIDogdG9BcnJheShlbGVtZW50cykpO1xuICAgIGZvciAodmFyIGkgPSBhbmltYXRpb25zLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIGFuaW1hdGlvbiA9IGFuaW1hdGlvbnNbaV07XG4gICAgICB2YXIgdHdlZW5zID0gYW5pbWF0aW9uLnR3ZWVucztcbiAgICAgIGZvciAodmFyIHQgPSB0d2VlbnMubGVuZ3RoLTE7IHQgPj0gMDsgdC0tKSB7XG4gICAgICAgIHZhciBhbmltYXRhYmxlcyA9IHR3ZWVuc1t0XS5hbmltYXRhYmxlcztcbiAgICAgICAgZm9yICh2YXIgYSA9IGFuaW1hdGFibGVzLmxlbmd0aC0xOyBhID49IDA7IGEtLSkge1xuICAgICAgICAgIGlmIChhcnJheUNvbnRhaW5zKHRhcmdldHMsIGFuaW1hdGFibGVzW2FdLnRhcmdldCkpIHtcbiAgICAgICAgICAgIGFuaW1hdGFibGVzLnNwbGljZShhLCAxKTtcbiAgICAgICAgICAgIGlmICghYW5pbWF0YWJsZXMubGVuZ3RoKSB0d2VlbnMuc3BsaWNlKHQsIDEpO1xuICAgICAgICAgICAgaWYgKCF0d2VlbnMubGVuZ3RoKSBhbmltYXRpb24ucGF1c2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhbmltYXRpb24udmVyc2lvbiA9IHZlcnNpb247XG4gIGFuaW1hdGlvbi5zcGVlZCA9IDE7XG4gIGFuaW1hdGlvbi5saXN0ID0gYW5pbWF0aW9ucztcbiAgYW5pbWF0aW9uLnJlbW92ZSA9IHJlbW92ZTtcbiAgYW5pbWF0aW9uLmVhc2luZ3MgPSBlYXNpbmdzO1xuICBhbmltYXRpb24uZ2V0VmFsdWUgPSBnZXRJbml0aWFsVGFyZ2V0VmFsdWU7XG4gIGFuaW1hdGlvbi5wYXRoID0gZ2V0UGF0aFByb3BzO1xuICBhbmltYXRpb24ucmFuZG9tID0gcmFuZG9tO1xuXG4gIHJldHVybiBhbmltYXRpb247XG5cbn0pKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hbmltZWpzL2FuaW1lLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogVGV4dEdlb21ldHJ5IGNvbXBvbmVudCBmb3IgQS1GcmFtZS5cbiAqL1xudmFyIGRlYnVnID0gQUZSQU1FLnV0aWxzLmRlYnVnO1xuXG52YXIgZXJyb3IgPSBkZWJ1ZygnYWZyYW1lLXRleHQtY29tcG9uZW50OmVycm9yJyk7XG5cbnZhciBmb250TG9hZGVyID0gbmV3IFRIUkVFLkZvbnRMb2FkZXIoKTtcblxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCd0ZXh0Jywge1xuICBzY2hlbWE6IHtcbiAgICBiZXZlbEVuYWJsZWQ6IHtkZWZhdWx0OiBmYWxzZX0sXG4gICAgYmV2ZWxTaXplOiB7ZGVmYXVsdDogOCwgbWluOiAwfSxcbiAgICBiZXZlbFRoaWNrbmVzczoge2RlZmF1bHQ6IDEyLCBtaW46IDB9LFxuICAgIGN1cnZlU2VnbWVudHM6IHtkZWZhdWx0OiAxMiwgbWluOiAwfSxcbiAgICBmb250OiB7dHlwZTogJ2Fzc2V0JywgZGVmYXVsdDogJ2h0dHBzOi8vcmF3Z2l0LmNvbS9uZ29rZXZpbi9rZnJhbWUvbWFzdGVyL2NvbXBvbmVudHMvdGV4dC9saWIvaGVsdmV0aWtlcl9yZWd1bGFyLnR5cGVmYWNlLmpzb24nfSxcbiAgICBoZWlnaHQ6IHtkZWZhdWx0OiAwLjA1LCBtaW46IDB9LFxuICAgIHNpemU6IHtkZWZhdWx0OiAwLjUsIG1pbjogMH0sXG4gICAgc3R5bGU6IHtkZWZhdWx0OiAnbm9ybWFsJywgb25lT2Y6IFsnbm9ybWFsJywgJ2l0YWxpY3MnXX0sXG4gICAgdGV4dDoge2RlZmF1bHQ6ICcnfSxcbiAgICB3ZWlnaHQ6IHtkZWZhdWx0OiAnbm9ybWFsJywgb25lT2Y6IFsnbm9ybWFsJywgJ2JvbGQnXX1cbiAgfSxcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gY29tcG9uZW50IGlzIGF0dGFjaGVkIGFuZCB3aGVuIGNvbXBvbmVudCBkYXRhIGNoYW5nZXMuXG4gICAqIEdlbmVyYWxseSBtb2RpZmllcyB0aGUgZW50aXR5IGJhc2VkIG9uIHRoZSBkYXRhLlxuICAgKi9cbiAgdXBkYXRlOiBmdW5jdGlvbiAob2xkRGF0YSkge1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG5cbiAgICB2YXIgbWVzaCA9IGVsLmdldE9yQ3JlYXRlT2JqZWN0M0QoJ21lc2gnLCBUSFJFRS5NZXNoKTtcbiAgICBpZiAoZGF0YS5mb250LmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHtcbiAgICAgIC8vIExvYWQgdHlwZWZhY2UuanNvbiBmb250LlxuICAgICAgZm9udExvYWRlci5sb2FkKGRhdGEuZm9udCwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIHZhciB0ZXh0RGF0YSA9IEFGUkFNRS51dGlscy5jbG9uZShkYXRhKTtcbiAgICAgICAgdGV4dERhdGEuZm9udCA9IHJlc3BvbnNlO1xuICAgICAgICBtZXNoLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlRleHRHZW9tZXRyeShkYXRhLnRleHQsIHRleHREYXRhKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoZGF0YS5mb250LmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgIC8vIFNldCBmb250IGlmIGFscmVhZHkgaGF2ZSBhIHR5cGVmYWNlLmpzb24gdGhyb3VnaCBzZXRBdHRyaWJ1dGUuXG4gICAgICBtZXNoLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlRleHRHZW9tZXRyeShkYXRhLnRleHQsIGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlcnJvcignTXVzdCBwcm92aWRlIGBmb250YCAodHlwZWZhY2UuanNvbikgb3IgYGZvbnRQYXRoYCAoc3RyaW5nKSB0byB0ZXh0IGNvbXBvbmVudC4nKTtcbiAgICB9XG4gIH1cbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FmcmFtZS10ZXh0LWNvbXBvbmVudC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiBnbG9iYWwgQUZSQU1FLCBUSFJFRSAqL1xyXG5pZiAodHlwZW9mIEFGUkFNRSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xyXG59XHJcblxyXG52YXIgY3JlYXRlVGV4dCA9IHJlcXVpcmUoJ3RocmVlLWJtZm9udC10ZXh0Jyk7XHJcbnZhciBsb2FkRm9udCA9IHJlcXVpcmUoJ2xvYWQtYm1mb250Jyk7XHJcbnZhciBTREZTaGFkZXIgPSByZXF1aXJlKCcuL2xpYi9zaGFkZXJzL3NkZicpO1xyXG5cclxucmVxdWlyZSgnLi9leHRyYXMvdGV4dC1wcmltaXRpdmUuanMnKTsgLy8gUmVnaXN0ZXIgZXhwZXJpbWVudGFsIHRleHQgcHJpbWl0aXZlXHJcblxyXG4vKipcclxuICogYm1mb250IHRleHQgY29tcG9uZW50IGZvciBBLUZyYW1lLlxyXG4gKi9cclxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdibWZvbnQtdGV4dCcsIHtcclxuICBzY2hlbWE6IHtcclxuICAgIHRleHQ6IHtcclxuICAgICAgdHlwZTogJ3N0cmluZydcclxuICAgIH0sXHJcbiAgICB3aWR0aDoge1xyXG4gICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgZGVmYXVsdDogMTAwMFxyXG4gICAgfSxcclxuICAgIGFsaWduOiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICBkZWZhdWx0OiAnbGVmdCdcclxuICAgIH0sXHJcbiAgICBsZXR0ZXJTcGFjaW5nOiB7XHJcbiAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICBkZWZhdWx0OiAwXHJcbiAgICB9LFxyXG4gICAgbGluZUhlaWdodDoge1xyXG4gICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgZGVmYXVsdDogMzhcclxuICAgIH0sXHJcbiAgICBmbnQ6IHtcclxuICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgIGRlZmF1bHQ6ICdodHRwczovL2Nkbi5yYXdnaXQuY29tL2JyeWlrL2FmcmFtZS1ibWZvbnQtdGV4dC1jb21wb25lbnQvYWEwNjU1Y2Y5MGY2NDZlMTJjNDBhYjQ3MDhlYTkwYjQ2ODZjZmI0NS9hc3NldHMvRGVqYVZ1LXNkZi5mbnQnXHJcbiAgICB9LFxyXG4gICAgZm50SW1hZ2U6IHtcclxuICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgIGRlZmF1bHQ6ICdodHRwczovL2Nkbi5yYXdnaXQuY29tL2JyeWlrL2FmcmFtZS1ibWZvbnQtdGV4dC1jb21wb25lbnQvYWEwNjU1Y2Y5MGY2NDZlMTJjNDBhYjQ3MDhlYTkwYjQ2ODZjZmI0NS9hc3NldHMvRGVqYVZ1LXNkZi5wbmcnXHJcbiAgICB9LFxyXG4gICAgbW9kZToge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgZGVmYXVsdDogJ25vcm1hbCdcclxuICAgIH0sXHJcbiAgICBjb2xvcjoge1xyXG4gICAgICB0eXBlOiAnY29sb3InLFxyXG4gICAgICBkZWZhdWx0OiAnIzAwMCdcclxuICAgIH0sXHJcbiAgICBvcGFjaXR5OiB7XHJcbiAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICBkZWZhdWx0OiAnMS4wJ1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGNvbXBvbmVudCBpcyBhdHRhY2hlZCBhbmQgd2hlbiBjb21wb25lbnQgZGF0YSBjaGFuZ2VzLlxyXG4gICAqIEdlbmVyYWxseSBtb2RpZmllcyB0aGUgZW50aXR5IGJhc2VkIG9uIHRoZSBkYXRhLlxyXG4gICAqL1xyXG4gIHVwZGF0ZTogZnVuY3Rpb24gKG9sZERhdGEpIHtcclxuICAgIC8vIEVudGl0eSBkYXRhXHJcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xyXG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XHJcblxyXG4gICAgLy8gVXNlIGZvbnRMb2FkZXIgdXRpbGl0eSB0byBsb2FkICdmbnQnIGFuZCB0ZXh0dXJlXHJcbiAgICBmb250TG9hZGVyKHtcclxuICAgICAgZm9udDogZGF0YS5mbnQsXHJcbiAgICAgIGltYWdlOiBkYXRhLmZudEltYWdlXHJcbiAgICB9LCBzdGFydCk7XHJcblxyXG4gICAgZnVuY3Rpb24gc3RhcnQgKGZvbnQsIHRleHR1cmUpIHtcclxuICAgICAgLy8gU2V0dXAgdGV4dHVyZSwgc2hvdWxkIHNldCBhbmlzb3Ryb3B5IHRvIHVzZXIgbWF4aW11bS4uLlxyXG4gICAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgdGV4dHVyZS5hbmlzb3Ryb3B5ID0gMTY7XHJcblxyXG4gICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICBmb250OiBmb250LCAvLyB0aGUgYml0bWFwIGZvbnQgZGVmaW5pdGlvblxyXG4gICAgICAgIHRleHQ6IGRhdGEudGV4dCwgLy8gdGhlIHN0cmluZyB0byByZW5kZXJcclxuICAgICAgICB3aWR0aDogZGF0YS53aWR0aCxcclxuICAgICAgICBhbGlnbjogZGF0YS5hbGlnbixcclxuICAgICAgICBsZXR0ZXJTcGFjaW5nOiBkYXRhLmxldHRlclNwYWNpbmcsXHJcbiAgICAgICAgbGluZUhlaWdodDogZGF0YS5saW5lSGVpZ2h0LFxyXG4gICAgICAgIG1vZGU6IGRhdGEubW9kZVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIHRleHQgZ2VvbWV0cnlcclxuICAgICAgdmFyIGdlb21ldHJ5ID0gY3JlYXRlVGV4dChvcHRpb25zKTtcclxuXHJcbiAgICAgIC8vIFVzZSAnLi9saWIvc2hhZGVycy9zZGYnIHRvIGhlbHAgYnVpbGQgYSBzaGFkZXIgbWF0ZXJpYWxcclxuICAgICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlJhd1NoYWRlck1hdGVyaWFsKFNERlNoYWRlcih7XHJcbiAgICAgICAgbWFwOiB0ZXh0dXJlLFxyXG4gICAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXHJcbiAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXHJcbiAgICAgICAgY29sb3I6IGRhdGEuY29sb3IsXHJcbiAgICAgICAgb3BhY2l0eTogZGF0YS5vcGFjaXR5XHJcbiAgICAgIH0pKTtcclxuXHJcbiAgICAgIHZhciB0ZXh0ID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuXHJcbiAgICAgIC8vIFJvdGF0ZSBzbyB0ZXh0IGZhY2VzIHRoZSBjYW1lcmFcclxuICAgICAgdGV4dC5yb3RhdGlvbi55ID0gTWF0aC5QSTtcclxuXHJcbiAgICAgIC8vIFNjYWxlIHRleHQgZG93blxyXG4gICAgICB0ZXh0LnNjYWxlLm11bHRpcGx5U2NhbGFyKC0wLjAwNSk7XHJcblxyXG4gICAgICAvLyBSZWdpc3RlciB0ZXh0IG1lc2ggdW5kZXIgZW50aXR5J3Mgb2JqZWN0M0RNYXBcclxuICAgICAgZWwuc2V0T2JqZWN0M0QoJ2JtZm9udC10ZXh0JywgdGV4dCk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gYSBjb21wb25lbnQgaXMgcmVtb3ZlZCAoZS5nLiwgdmlhIHJlbW92ZUF0dHJpYnV0ZSkuXHJcbiAgICogR2VuZXJhbGx5IHVuZG9lcyBhbGwgbW9kaWZpY2F0aW9ucyB0byB0aGUgZW50aXR5LlxyXG4gICAqL1xyXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5lbC5yZW1vdmVPYmplY3QzRCgnYm1mb250LXRleHQnKTtcclxuICB9XHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIEEgdXRpbGl0eSB0byBsb2FkIGEgZm9udCB3aXRoIGJtZm9udC1sb2FkXHJcbiAqIGFuZCBhIHRleHR1cmUgd2l0aCBUaHJlZS5UZXh0dXJlTG9hZGVyKClcclxuICovXHJcbmZ1bmN0aW9uIGZvbnRMb2FkZXIgKG9wdCwgY2IpIHtcclxuICBsb2FkRm9udChvcHQuZm9udCwgZnVuY3Rpb24gKGVyciwgZm9udCkge1xyXG4gICAgaWYgKGVycikge1xyXG4gICAgICB0aHJvdyBlcnI7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRleHR1cmVMb2FkZXIgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpO1xyXG4gICAgdGV4dHVyZUxvYWRlci5sb2FkKG9wdC5pbWFnZSwgZnVuY3Rpb24gKHRleHR1cmUpIHtcclxuICAgICAgY2IoZm9udCwgdGV4dHVyZSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYWZyYW1lLWJtZm9udC10ZXh0LWNvbXBvbmVudC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgY3JlYXRlTGF5b3V0ID0gcmVxdWlyZSgnbGF5b3V0LWJtZm9udC10ZXh0JylcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcbnZhciBjcmVhdGVJbmRpY2VzID0gcmVxdWlyZSgncXVhZC1pbmRpY2VzJylcbnZhciBidWZmZXIgPSByZXF1aXJlKCd0aHJlZS1idWZmZXItdmVydGV4LWRhdGEnKVxudmFyIGFzc2lnbiA9IHJlcXVpcmUoJ29iamVjdC1hc3NpZ24nKVxuXG52YXIgdmVydGljZXMgPSByZXF1aXJlKCcuL2xpYi92ZXJ0aWNlcycpXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL2xpYi91dGlscycpXG5cbnZhciBCYXNlID0gVEhSRUUuQnVmZmVyR2VvbWV0cnlcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVUZXh0R2VvbWV0cnkgKG9wdCkge1xuICByZXR1cm4gbmV3IFRleHRHZW9tZXRyeShvcHQpXG59XG5cbmZ1bmN0aW9uIFRleHRHZW9tZXRyeSAob3B0KSB7XG4gIEJhc2UuY2FsbCh0aGlzKVxuXG4gIGlmICh0eXBlb2Ygb3B0ID09PSAnc3RyaW5nJykge1xuICAgIG9wdCA9IHsgdGV4dDogb3B0IH1cbiAgfVxuXG4gIC8vIHVzZSB0aGVzZSBhcyBkZWZhdWx0IHZhbHVlcyBmb3IgYW55IHN1YnNlcXVlbnRcbiAgLy8gY2FsbHMgdG8gdXBkYXRlKClcbiAgdGhpcy5fb3B0ID0gYXNzaWduKHt9LCBvcHQpXG5cbiAgLy8gYWxzbyBkbyBhbiBpbml0aWFsIHNldHVwLi4uXG4gIGlmIChvcHQpIHRoaXMudXBkYXRlKG9wdClcbn1cblxuaW5oZXJpdHMoVGV4dEdlb21ldHJ5LCBCYXNlKVxuXG5UZXh0R2VvbWV0cnkucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChvcHQpIHtcbiAgaWYgKHR5cGVvZiBvcHQgPT09ICdzdHJpbmcnKSB7XG4gICAgb3B0ID0geyB0ZXh0OiBvcHQgfVxuICB9XG5cbiAgLy8gdXNlIGNvbnN0cnVjdG9yIGRlZmF1bHRzXG4gIG9wdCA9IGFzc2lnbih7fSwgdGhpcy5fb3B0LCBvcHQpXG5cbiAgaWYgKCFvcHQuZm9udCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ211c3Qgc3BlY2lmeSBhIHsgZm9udCB9IGluIG9wdGlvbnMnKVxuICB9XG5cbiAgdGhpcy5sYXlvdXQgPSBjcmVhdGVMYXlvdXQob3B0KVxuXG4gIC8vIGdldCB2ZWMyIHRleGNvb3Jkc1xuICB2YXIgZmxpcFkgPSBvcHQuZmxpcFkgIT09IGZhbHNlXG5cbiAgLy8gdGhlIGRlc2lyZWQgQk1Gb250IGRhdGFcbiAgdmFyIGZvbnQgPSBvcHQuZm9udFxuXG4gIC8vIGRldGVybWluZSB0ZXh0dXJlIHNpemUgZnJvbSBmb250IGZpbGVcbiAgdmFyIHRleFdpZHRoID0gZm9udC5jb21tb24uc2NhbGVXXG4gIHZhciB0ZXhIZWlnaHQgPSBmb250LmNvbW1vbi5zY2FsZUhcblxuICAvLyBnZXQgdmlzaWJsZSBnbHlwaHNcbiAgdmFyIGdseXBocyA9IHRoaXMubGF5b3V0LmdseXBocy5maWx0ZXIoZnVuY3Rpb24gKGdseXBoKSB7XG4gICAgdmFyIGJpdG1hcCA9IGdseXBoLmRhdGFcbiAgICByZXR1cm4gYml0bWFwLndpZHRoICogYml0bWFwLmhlaWdodCA+IDBcbiAgfSlcblxuICAvLyBwcm92aWRlIHZpc2libGUgZ2x5cGhzIGZvciBjb252ZW5pZW5jZVxuICB0aGlzLnZpc2libGVHbHlwaHMgPSBnbHlwaHNcblxuICAvLyBnZXQgY29tbW9uIHZlcnRleCBkYXRhXG4gIHZhciBwb3NpdGlvbnMgPSB2ZXJ0aWNlcy5wb3NpdGlvbnMoZ2x5cGhzKVxuICB2YXIgdXZzID0gdmVydGljZXMudXZzKGdseXBocywgdGV4V2lkdGgsIHRleEhlaWdodCwgZmxpcFkpXG4gIHZhciBpbmRpY2VzID0gY3JlYXRlSW5kaWNlcyh7XG4gICAgY2xvY2t3aXNlOiB0cnVlLFxuICAgIHR5cGU6ICd1aW50MTYnLFxuICAgIGNvdW50OiBnbHlwaHMubGVuZ3RoXG4gIH0pXG5cbiAgLy8gdXBkYXRlIHZlcnRleCBkYXRhXG4gIGJ1ZmZlci5pbmRleCh0aGlzLCBpbmRpY2VzLCAxLCAndWludDE2JylcbiAgYnVmZmVyLmF0dHIodGhpcywgJ3Bvc2l0aW9uJywgcG9zaXRpb25zLCAyKVxuICBidWZmZXIuYXR0cih0aGlzLCAndXYnLCB1dnMsIDIpXG5cbiAgLy8gdXBkYXRlIG11bHRpcGFnZSBkYXRhXG4gIGlmICghb3B0Lm11bHRpcGFnZSAmJiAncGFnZScgaW4gdGhpcy5hdHRyaWJ1dGVzKSB7XG4gICAgLy8gZGlzYWJsZSBtdWx0aXBhZ2UgcmVuZGVyaW5nXG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ3BhZ2UnKVxuICB9IGVsc2UgaWYgKG9wdC5tdWx0aXBhZ2UpIHtcbiAgICB2YXIgcGFnZXMgPSB2ZXJ0aWNlcy5wYWdlcyhnbHlwaHMpXG4gICAgLy8gZW5hYmxlIG11bHRpcGFnZSByZW5kZXJpbmdcbiAgICBidWZmZXIuYXR0cih0aGlzLCAncGFnZScsIHBhZ2VzLCAxKVxuICB9XG59XG5cblRleHRHZW9tZXRyeS5wcm90b3R5cGUuY29tcHV0ZUJvdW5kaW5nU3BoZXJlID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5ib3VuZGluZ1NwaGVyZSA9PT0gbnVsbCkge1xuICAgIHRoaXMuYm91bmRpbmdTcGhlcmUgPSBuZXcgVEhSRUUuU3BoZXJlKClcbiAgfVxuXG4gIHZhciBwb3NpdGlvbnMgPSB0aGlzLmF0dHJpYnV0ZXMucG9zaXRpb24uYXJyYXlcbiAgdmFyIGl0ZW1TaXplID0gdGhpcy5hdHRyaWJ1dGVzLnBvc2l0aW9uLml0ZW1TaXplXG4gIGlmICghcG9zaXRpb25zIHx8ICFpdGVtU2l6ZSB8fCBwb3NpdGlvbnMubGVuZ3RoIDwgMikge1xuICAgIHRoaXMuYm91bmRpbmdTcGhlcmUucmFkaXVzID0gMFxuICAgIHRoaXMuYm91bmRpbmdTcGhlcmUuY2VudGVyLnNldCgwLCAwLCAwKVxuICAgIHJldHVyblxuICB9XG4gIHV0aWxzLmNvbXB1dGVTcGhlcmUocG9zaXRpb25zLCB0aGlzLmJvdW5kaW5nU3BoZXJlKVxuICBpZiAoaXNOYU4odGhpcy5ib3VuZGluZ1NwaGVyZS5yYWRpdXMpKSB7XG4gICAgY29uc29sZS5lcnJvcignVEhSRUUuQnVmZmVyR2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nU3BoZXJlKCk6ICcgK1xuICAgICAgJ0NvbXB1dGVkIHJhZGl1cyBpcyBOYU4uIFRoZSAnICtcbiAgICAgICdcInBvc2l0aW9uXCIgYXR0cmlidXRlIGlzIGxpa2VseSB0byBoYXZlIE5hTiB2YWx1ZXMuJylcbiAgfVxufVxuXG5UZXh0R2VvbWV0cnkucHJvdG90eXBlLmNvbXB1dGVCb3VuZGluZ0JveCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYm91bmRpbmdCb3ggPT09IG51bGwpIHtcbiAgICB0aGlzLmJvdW5kaW5nQm94ID0gbmV3IFRIUkVFLkJveDMoKVxuICB9XG5cbiAgdmFyIGJib3ggPSB0aGlzLmJvdW5kaW5nQm94XG4gIHZhciBwb3NpdGlvbnMgPSB0aGlzLmF0dHJpYnV0ZXMucG9zaXRpb24uYXJyYXlcbiAgdmFyIGl0ZW1TaXplID0gdGhpcy5hdHRyaWJ1dGVzLnBvc2l0aW9uLml0ZW1TaXplXG4gIGlmICghcG9zaXRpb25zIHx8ICFpdGVtU2l6ZSB8fCBwb3NpdGlvbnMubGVuZ3RoIDwgMikge1xuICAgIGJib3gubWFrZUVtcHR5KClcbiAgICByZXR1cm5cbiAgfVxuICB1dGlscy5jb21wdXRlQm94KHBvc2l0aW9ucywgYmJveClcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi90aHJlZS1ibWZvbnQtdGV4dC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgd29yZFdyYXAgPSByZXF1aXJlKCd3b3JkLXdyYXBwZXInKVxudmFyIHh0ZW5kID0gcmVxdWlyZSgneHRlbmQnKVxudmFyIGZpbmRDaGFyID0gcmVxdWlyZSgnaW5kZXhvZi1wcm9wZXJ0eScpKCdpZCcpXG52YXIgbnVtYmVyID0gcmVxdWlyZSgnYXMtbnVtYmVyJylcblxudmFyIFhfSEVJR0hUUyA9IFsneCcsICdlJywgJ2EnLCAnbycsICduJywgJ3MnLCAncicsICdjJywgJ3UnLCAnbScsICd2JywgJ3cnLCAneiddXG52YXIgTV9XSURUSFMgPSBbJ20nLCAndyddXG52YXIgQ0FQX0hFSUdIVFMgPSBbJ0gnLCAnSScsICdOJywgJ0UnLCAnRicsICdLJywgJ0wnLCAnVCcsICdVJywgJ1YnLCAnVycsICdYJywgJ1knLCAnWiddXG5cblxudmFyIFRBQl9JRCA9ICdcXHQnLmNoYXJDb2RlQXQoMClcbnZhciBTUEFDRV9JRCA9ICcgJy5jaGFyQ29kZUF0KDApXG52YXIgQUxJR05fTEVGVCA9IDAsIFxuICAgIEFMSUdOX0NFTlRFUiA9IDEsIFxuICAgIEFMSUdOX1JJR0hUID0gMlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUxheW91dChvcHQpIHtcbiAgcmV0dXJuIG5ldyBUZXh0TGF5b3V0KG9wdClcbn1cblxuZnVuY3Rpb24gVGV4dExheW91dChvcHQpIHtcbiAgdGhpcy5nbHlwaHMgPSBbXVxuICB0aGlzLl9tZWFzdXJlID0gdGhpcy5jb21wdXRlTWV0cmljcy5iaW5kKHRoaXMpXG4gIHRoaXMudXBkYXRlKG9wdClcbn1cblxuVGV4dExheW91dC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24ob3B0KSB7XG4gIG9wdCA9IHh0ZW5kKHtcbiAgICBtZWFzdXJlOiB0aGlzLl9tZWFzdXJlXG4gIH0sIG9wdClcbiAgdGhpcy5fb3B0ID0gb3B0XG4gIHRoaXMuX29wdC50YWJTaXplID0gbnVtYmVyKHRoaXMuX29wdC50YWJTaXplLCA0KVxuXG4gIGlmICghb3B0LmZvbnQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdtdXN0IHByb3ZpZGUgYSB2YWxpZCBiaXRtYXAgZm9udCcpXG5cbiAgdmFyIGdseXBocyA9IHRoaXMuZ2x5cGhzXG4gIHZhciB0ZXh0ID0gb3B0LnRleHR8fCcnIFxuICB2YXIgZm9udCA9IG9wdC5mb250XG4gIHRoaXMuX3NldHVwU3BhY2VHbHlwaHMoZm9udClcbiAgXG4gIHZhciBsaW5lcyA9IHdvcmRXcmFwLmxpbmVzKHRleHQsIG9wdClcbiAgdmFyIG1pbldpZHRoID0gb3B0LndpZHRoIHx8IDBcblxuICAvL2NsZWFyIGdseXBoc1xuICBnbHlwaHMubGVuZ3RoID0gMFxuXG4gIC8vZ2V0IG1heCBsaW5lIHdpZHRoXG4gIHZhciBtYXhMaW5lV2lkdGggPSBsaW5lcy5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgbGluZSkge1xuICAgIHJldHVybiBNYXRoLm1heChwcmV2LCBsaW5lLndpZHRoLCBtaW5XaWR0aClcbiAgfSwgMClcblxuICAvL3RoZSBwZW4gcG9zaXRpb25cbiAgdmFyIHggPSAwXG4gIHZhciB5ID0gMFxuICB2YXIgbGluZUhlaWdodCA9IG51bWJlcihvcHQubGluZUhlaWdodCwgZm9udC5jb21tb24ubGluZUhlaWdodClcbiAgdmFyIGJhc2VsaW5lID0gZm9udC5jb21tb24uYmFzZVxuICB2YXIgZGVzY2VuZGVyID0gbGluZUhlaWdodC1iYXNlbGluZVxuICB2YXIgbGV0dGVyU3BhY2luZyA9IG9wdC5sZXR0ZXJTcGFjaW5nIHx8IDBcbiAgdmFyIGhlaWdodCA9IGxpbmVIZWlnaHQgKiBsaW5lcy5sZW5ndGggLSBkZXNjZW5kZXJcbiAgdmFyIGFsaWduID0gZ2V0QWxpZ25UeXBlKHRoaXMuX29wdC5hbGlnbilcblxuICAvL2RyYXcgdGV4dCBhbG9uZyBiYXNlbGluZVxuICB5IC09IGhlaWdodFxuICBcbiAgLy90aGUgbWV0cmljcyBmb3IgdGhpcyB0ZXh0IGxheW91dFxuICB0aGlzLl93aWR0aCA9IG1heExpbmVXaWR0aFxuICB0aGlzLl9oZWlnaHQgPSBoZWlnaHRcbiAgdGhpcy5fZGVzY2VuZGVyID0gbGluZUhlaWdodCAtIGJhc2VsaW5lXG4gIHRoaXMuX2Jhc2VsaW5lID0gYmFzZWxpbmVcbiAgdGhpcy5feEhlaWdodCA9IGdldFhIZWlnaHQoZm9udClcbiAgdGhpcy5fY2FwSGVpZ2h0ID0gZ2V0Q2FwSGVpZ2h0KGZvbnQpXG4gIHRoaXMuX2xpbmVIZWlnaHQgPSBsaW5lSGVpZ2h0XG4gIHRoaXMuX2FzY2VuZGVyID0gbGluZUhlaWdodCAtIGRlc2NlbmRlciAtIHRoaXMuX3hIZWlnaHRcbiAgICBcbiAgLy9sYXlvdXQgZWFjaCBnbHlwaFxuICB2YXIgc2VsZiA9IHRoaXNcbiAgbGluZXMuZm9yRWFjaChmdW5jdGlvbihsaW5lLCBsaW5lSW5kZXgpIHtcbiAgICB2YXIgc3RhcnQgPSBsaW5lLnN0YXJ0XG4gICAgdmFyIGVuZCA9IGxpbmUuZW5kXG4gICAgdmFyIGxpbmVXaWR0aCA9IGxpbmUud2lkdGhcbiAgICB2YXIgbGFzdEdseXBoXG4gICAgXG4gICAgLy9mb3IgZWFjaCBnbHlwaCBpbiB0aGF0IGxpbmUuLi5cbiAgICBmb3IgKHZhciBpPXN0YXJ0OyBpPGVuZDsgaSsrKSB7XG4gICAgICB2YXIgaWQgPSB0ZXh0LmNoYXJDb2RlQXQoaSlcbiAgICAgIHZhciBnbHlwaCA9IHNlbGYuZ2V0R2x5cGgoZm9udCwgaWQpXG4gICAgICBpZiAoZ2x5cGgpIHtcbiAgICAgICAgaWYgKGxhc3RHbHlwaCkgXG4gICAgICAgICAgeCArPSBnZXRLZXJuaW5nKGZvbnQsIGxhc3RHbHlwaC5pZCwgZ2x5cGguaWQpXG5cbiAgICAgICAgdmFyIHR4ID0geFxuICAgICAgICBpZiAoYWxpZ24gPT09IEFMSUdOX0NFTlRFUikgXG4gICAgICAgICAgdHggKz0gKG1heExpbmVXaWR0aC1saW5lV2lkdGgpLzJcbiAgICAgICAgZWxzZSBpZiAoYWxpZ24gPT09IEFMSUdOX1JJR0hUKVxuICAgICAgICAgIHR4ICs9IChtYXhMaW5lV2lkdGgtbGluZVdpZHRoKVxuXG4gICAgICAgIGdseXBocy5wdXNoKHtcbiAgICAgICAgICBwb3NpdGlvbjogW3R4LCB5XSxcbiAgICAgICAgICBkYXRhOiBnbHlwaCxcbiAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICBsaW5lOiBsaW5lSW5kZXhcbiAgICAgICAgfSkgIFxuXG4gICAgICAgIC8vbW92ZSBwZW4gZm9yd2FyZFxuICAgICAgICB4ICs9IGdseXBoLnhhZHZhbmNlICsgbGV0dGVyU3BhY2luZ1xuICAgICAgICBsYXN0R2x5cGggPSBnbHlwaFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vbmV4dCBsaW5lIGRvd25cbiAgICB5ICs9IGxpbmVIZWlnaHRcbiAgICB4ID0gMFxuICB9KVxuICB0aGlzLl9saW5lc1RvdGFsID0gbGluZXMubGVuZ3RoO1xufVxuXG5UZXh0TGF5b3V0LnByb3RvdHlwZS5fc2V0dXBTcGFjZUdseXBocyA9IGZ1bmN0aW9uKGZvbnQpIHtcbiAgLy9UaGVzZSBhcmUgZmFsbGJhY2tzLCB3aGVuIHRoZSBmb250IGRvZXNuJ3QgaW5jbHVkZVxuICAvLycgJyBvciAnXFx0JyBnbHlwaHNcbiAgdGhpcy5fZmFsbGJhY2tTcGFjZUdseXBoID0gbnVsbFxuICB0aGlzLl9mYWxsYmFja1RhYkdseXBoID0gbnVsbFxuXG4gIGlmICghZm9udC5jaGFycyB8fCBmb250LmNoYXJzLmxlbmd0aCA9PT0gMClcbiAgICByZXR1cm5cblxuICAvL3RyeSB0byBnZXQgc3BhY2UgZ2x5cGhcbiAgLy90aGVuIGZhbGwgYmFjayB0byB0aGUgJ20nIG9yICd3JyBnbHlwaHNcbiAgLy90aGVuIGZhbGwgYmFjayB0byB0aGUgZmlyc3QgZ2x5cGggYXZhaWxhYmxlXG4gIHZhciBzcGFjZSA9IGdldEdseXBoQnlJZChmb250LCBTUEFDRV9JRCkgXG4gICAgICAgICAgfHwgZ2V0TUdseXBoKGZvbnQpIFxuICAgICAgICAgIHx8IGZvbnQuY2hhcnNbMF1cblxuICAvL2FuZCBjcmVhdGUgYSBmYWxsYmFjayBmb3IgdGFiXG4gIHZhciB0YWJXaWR0aCA9IHRoaXMuX29wdC50YWJTaXplICogc3BhY2UueGFkdmFuY2VcbiAgdGhpcy5fZmFsbGJhY2tTcGFjZUdseXBoID0gc3BhY2VcbiAgdGhpcy5fZmFsbGJhY2tUYWJHbHlwaCA9IHh0ZW5kKHNwYWNlLCB7XG4gICAgeDogMCwgeTogMCwgeGFkdmFuY2U6IHRhYldpZHRoLCBpZDogVEFCX0lELCBcbiAgICB4b2Zmc2V0OiAwLCB5b2Zmc2V0OiAwLCB3aWR0aDogMCwgaGVpZ2h0OiAwXG4gIH0pXG59XG5cblRleHRMYXlvdXQucHJvdG90eXBlLmdldEdseXBoID0gZnVuY3Rpb24oZm9udCwgaWQpIHtcbiAgdmFyIGdseXBoID0gZ2V0R2x5cGhCeUlkKGZvbnQsIGlkKVxuICBpZiAoZ2x5cGgpXG4gICAgcmV0dXJuIGdseXBoXG4gIGVsc2UgaWYgKGlkID09PSBUQUJfSUQpIFxuICAgIHJldHVybiB0aGlzLl9mYWxsYmFja1RhYkdseXBoXG4gIGVsc2UgaWYgKGlkID09PSBTUEFDRV9JRCkgXG4gICAgcmV0dXJuIHRoaXMuX2ZhbGxiYWNrU3BhY2VHbHlwaFxuICByZXR1cm4gbnVsbFxufVxuXG5UZXh0TGF5b3V0LnByb3RvdHlwZS5jb21wdXRlTWV0cmljcyA9IGZ1bmN0aW9uKHRleHQsIHN0YXJ0LCBlbmQsIHdpZHRoKSB7XG4gIHZhciBsZXR0ZXJTcGFjaW5nID0gdGhpcy5fb3B0LmxldHRlclNwYWNpbmcgfHwgMFxuICB2YXIgZm9udCA9IHRoaXMuX29wdC5mb250XG4gIHZhciBjdXJQZW4gPSAwXG4gIHZhciBjdXJXaWR0aCA9IDBcbiAgdmFyIGNvdW50ID0gMFxuICB2YXIgZ2x5cGhcbiAgdmFyIGxhc3RHbHlwaFxuXG4gIGlmICghZm9udC5jaGFycyB8fCBmb250LmNoYXJzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGFydDogc3RhcnQsXG4gICAgICBlbmQ6IHN0YXJ0LFxuICAgICAgd2lkdGg6IDBcbiAgICB9XG4gIH1cblxuICBlbmQgPSBNYXRoLm1pbih0ZXh0Lmxlbmd0aCwgZW5kKVxuICBmb3IgKHZhciBpPXN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB2YXIgaWQgPSB0ZXh0LmNoYXJDb2RlQXQoaSlcbiAgICB2YXIgZ2x5cGggPSB0aGlzLmdldEdseXBoKGZvbnQsIGlkKVxuXG4gICAgaWYgKGdseXBoKSB7XG4gICAgICAvL21vdmUgcGVuIGZvcndhcmRcbiAgICAgIHZhciB4b2ZmID0gZ2x5cGgueG9mZnNldFxuICAgICAgdmFyIGtlcm4gPSBsYXN0R2x5cGggPyBnZXRLZXJuaW5nKGZvbnQsIGxhc3RHbHlwaC5pZCwgZ2x5cGguaWQpIDogMFxuICAgICAgY3VyUGVuICs9IGtlcm5cblxuICAgICAgdmFyIG5leHRQZW4gPSBjdXJQZW4gKyBnbHlwaC54YWR2YW5jZSArIGxldHRlclNwYWNpbmdcbiAgICAgIHZhciBuZXh0V2lkdGggPSBjdXJQZW4gKyBnbHlwaC53aWR0aFxuXG4gICAgICAvL3dlJ3ZlIGhpdCBvdXIgbGltaXQ7IHdlIGNhbid0IG1vdmUgb250byB0aGUgbmV4dCBnbHlwaFxuICAgICAgaWYgKG5leHRXaWR0aCA+PSB3aWR0aCB8fCBuZXh0UGVuID49IHdpZHRoKVxuICAgICAgICBicmVha1xuXG4gICAgICAvL290aGVyd2lzZSBjb250aW51ZSBhbG9uZyBvdXIgbGluZVxuICAgICAgY3VyUGVuID0gbmV4dFBlblxuICAgICAgY3VyV2lkdGggPSBuZXh0V2lkdGhcbiAgICAgIGxhc3RHbHlwaCA9IGdseXBoXG4gICAgfVxuICAgIGNvdW50KytcbiAgfVxuICBcbiAgLy9tYWtlIHN1cmUgcmlnaHRtb3N0IGVkZ2UgbGluZXMgdXAgd2l0aCByZW5kZXJlZCBnbHlwaHNcbiAgaWYgKGxhc3RHbHlwaClcbiAgICBjdXJXaWR0aCArPSBsYXN0R2x5cGgueG9mZnNldFxuXG4gIHJldHVybiB7XG4gICAgc3RhcnQ6IHN0YXJ0LFxuICAgIGVuZDogc3RhcnQgKyBjb3VudCxcbiAgICB3aWR0aDogY3VyV2lkdGhcbiAgfVxufVxuXG4vL2dldHRlcnMgZm9yIHRoZSBwcml2YXRlIHZhcnNcbjtbJ3dpZHRoJywgJ2hlaWdodCcsIFxuICAnZGVzY2VuZGVyJywgJ2FzY2VuZGVyJyxcbiAgJ3hIZWlnaHQnLCAnYmFzZWxpbmUnLFxuICAnY2FwSGVpZ2h0JyxcbiAgJ2xpbmVIZWlnaHQnIF0uZm9yRWFjaChhZGRHZXR0ZXIpXG5cbmZ1bmN0aW9uIGFkZEdldHRlcihuYW1lKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUZXh0TGF5b3V0LnByb3RvdHlwZSwgbmFtZSwge1xuICAgIGdldDogd3JhcHBlcihuYW1lKSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSlcbn1cblxuLy9jcmVhdGUgbG9va3VwcyBmb3IgcHJpdmF0ZSB2YXJzXG5mdW5jdGlvbiB3cmFwcGVyKG5hbWUpIHtcbiAgcmV0dXJuIChuZXcgRnVuY3Rpb24oW1xuICAgICdyZXR1cm4gZnVuY3Rpb24gJytuYW1lKycoKSB7JyxcbiAgICAnICByZXR1cm4gdGhpcy5fJytuYW1lLFxuICAgICd9J1xuICBdLmpvaW4oJ1xcbicpKSkoKVxufVxuXG5mdW5jdGlvbiBnZXRHbHlwaEJ5SWQoZm9udCwgaWQpIHtcbiAgaWYgKCFmb250LmNoYXJzIHx8IGZvbnQuY2hhcnMubGVuZ3RoID09PSAwKVxuICAgIHJldHVybiBudWxsXG5cbiAgdmFyIGdseXBoSWR4ID0gZmluZENoYXIoZm9udC5jaGFycywgaWQpXG4gIGlmIChnbHlwaElkeCA+PSAwKVxuICAgIHJldHVybiBmb250LmNoYXJzW2dseXBoSWR4XVxuICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBnZXRYSGVpZ2h0KGZvbnQpIHtcbiAgZm9yICh2YXIgaT0wOyBpPFhfSEVJR0hUUy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpZCA9IFhfSEVJR0hUU1tpXS5jaGFyQ29kZUF0KDApXG4gICAgdmFyIGlkeCA9IGZpbmRDaGFyKGZvbnQuY2hhcnMsIGlkKVxuICAgIGlmIChpZHggPj0gMCkgXG4gICAgICByZXR1cm4gZm9udC5jaGFyc1tpZHhdLmhlaWdodFxuICB9XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGdldE1HbHlwaChmb250KSB7XG4gIGZvciAodmFyIGk9MDsgaTxNX1dJRFRIUy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpZCA9IE1fV0lEVEhTW2ldLmNoYXJDb2RlQXQoMClcbiAgICB2YXIgaWR4ID0gZmluZENoYXIoZm9udC5jaGFycywgaWQpXG4gICAgaWYgKGlkeCA+PSAwKSBcbiAgICAgIHJldHVybiBmb250LmNoYXJzW2lkeF1cbiAgfVxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBnZXRDYXBIZWlnaHQoZm9udCkge1xuICBmb3IgKHZhciBpPTA7IGk8Q0FQX0hFSUdIVFMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaWQgPSBDQVBfSEVJR0hUU1tpXS5jaGFyQ29kZUF0KDApXG4gICAgdmFyIGlkeCA9IGZpbmRDaGFyKGZvbnQuY2hhcnMsIGlkKVxuICAgIGlmIChpZHggPj0gMCkgXG4gICAgICByZXR1cm4gZm9udC5jaGFyc1tpZHhdLmhlaWdodFxuICB9XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGdldEtlcm5pbmcoZm9udCwgbGVmdCwgcmlnaHQpIHtcbiAgaWYgKCFmb250Lmtlcm5pbmdzIHx8IGZvbnQua2VybmluZ3MubGVuZ3RoID09PSAwKVxuICAgIHJldHVybiAwXG5cbiAgdmFyIHRhYmxlID0gZm9udC5rZXJuaW5nc1xuICBmb3IgKHZhciBpPTA7IGk8dGFibGUubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2VybiA9IHRhYmxlW2ldXG4gICAgaWYgKGtlcm4uZmlyc3QgPT09IGxlZnQgJiYga2Vybi5zZWNvbmQgPT09IHJpZ2h0KVxuICAgICAgcmV0dXJuIGtlcm4uYW1vdW50XG4gIH1cbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gZ2V0QWxpZ25UeXBlKGFsaWduKSB7XG4gIGlmIChhbGlnbiA9PT0gJ2NlbnRlcicpXG4gICAgcmV0dXJuIEFMSUdOX0NFTlRFUlxuICBlbHNlIGlmIChhbGlnbiA9PT0gJ3JpZ2h0JylcbiAgICByZXR1cm4gQUxJR05fUklHSFRcbiAgcmV0dXJuIEFMSUdOX0xFRlRcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbGF5b3V0LWJtZm9udC10ZXh0L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBuZXdsaW5lID0gL1xcbi9cbnZhciBuZXdsaW5lQ2hhciA9ICdcXG4nXG52YXIgd2hpdGVzcGFjZSA9IC9cXHMvXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGV4dCwgb3B0KSB7XG4gICAgdmFyIGxpbmVzID0gbW9kdWxlLmV4cG9ydHMubGluZXModGV4dCwgb3B0KVxuICAgIHJldHVybiBsaW5lcy5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICByZXR1cm4gdGV4dC5zdWJzdHJpbmcobGluZS5zdGFydCwgbGluZS5lbmQpXG4gICAgfSkuam9pbignXFxuJylcbn1cblxubW9kdWxlLmV4cG9ydHMubGluZXMgPSBmdW5jdGlvbiB3b3Jkd3JhcCh0ZXh0LCBvcHQpIHtcbiAgICBvcHQgPSBvcHR8fHt9XG5cbiAgICAvL3plcm8gd2lkdGggcmVzdWx0cyBpbiBub3RoaW5nIHZpc2libGVcbiAgICBpZiAob3B0LndpZHRoID09PSAwICYmIG9wdC5tb2RlICE9PSAnbm93cmFwJykgXG4gICAgICAgIHJldHVybiBbXVxuXG4gICAgdGV4dCA9IHRleHR8fCcnXG4gICAgdmFyIHdpZHRoID0gdHlwZW9mIG9wdC53aWR0aCA9PT0gJ251bWJlcicgPyBvcHQud2lkdGggOiBOdW1iZXIuTUFYX1ZBTFVFXG4gICAgdmFyIHN0YXJ0ID0gTWF0aC5tYXgoMCwgb3B0LnN0YXJ0fHwwKVxuICAgIHZhciBlbmQgPSB0eXBlb2Ygb3B0LmVuZCA9PT0gJ251bWJlcicgPyBvcHQuZW5kIDogdGV4dC5sZW5ndGhcbiAgICB2YXIgbW9kZSA9IG9wdC5tb2RlXG5cbiAgICB2YXIgbWVhc3VyZSA9IG9wdC5tZWFzdXJlIHx8IG1vbm9zcGFjZVxuICAgIGlmIChtb2RlID09PSAncHJlJylcbiAgICAgICAgcmV0dXJuIHByZShtZWFzdXJlLCB0ZXh0LCBzdGFydCwgZW5kLCB3aWR0aClcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBncmVlZHkobWVhc3VyZSwgdGV4dCwgc3RhcnQsIGVuZCwgd2lkdGgsIG1vZGUpXG59XG5cbmZ1bmN0aW9uIGlkeE9mKHRleHQsIGNociwgc3RhcnQsIGVuZCkge1xuICAgIHZhciBpZHggPSB0ZXh0LmluZGV4T2YoY2hyLCBzdGFydClcbiAgICBpZiAoaWR4ID09PSAtMSB8fCBpZHggPiBlbmQpXG4gICAgICAgIHJldHVybiBlbmRcbiAgICByZXR1cm4gaWR4XG59XG5cbmZ1bmN0aW9uIGlzV2hpdGVzcGFjZShjaHIpIHtcbiAgICByZXR1cm4gd2hpdGVzcGFjZS50ZXN0KGNocilcbn1cblxuZnVuY3Rpb24gcHJlKG1lYXN1cmUsIHRleHQsIHN0YXJ0LCBlbmQsIHdpZHRoKSB7XG4gICAgdmFyIGxpbmVzID0gW11cbiAgICB2YXIgbGluZVN0YXJ0ID0gc3RhcnRcbiAgICBmb3IgKHZhciBpPXN0YXJ0OyBpPGVuZCAmJiBpPHRleHQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNociA9IHRleHQuY2hhckF0KGkpXG4gICAgICAgIHZhciBpc05ld2xpbmUgPSBuZXdsaW5lLnRlc3QoY2hyKVxuXG4gICAgICAgIC8vSWYgd2UndmUgcmVhY2hlZCBhIG5ld2xpbmUsIHRoZW4gc3RlcCBkb3duIGEgbGluZVxuICAgICAgICAvL09yIGlmIHdlJ3ZlIHJlYWNoZWQgdGhlIEVPRlxuICAgICAgICBpZiAoaXNOZXdsaW5lIHx8IGk9PT1lbmQtMSkge1xuICAgICAgICAgICAgdmFyIGxpbmVFbmQgPSBpc05ld2xpbmUgPyBpIDogaSsxXG4gICAgICAgICAgICB2YXIgbWVhc3VyZWQgPSBtZWFzdXJlKHRleHQsIGxpbmVTdGFydCwgbGluZUVuZCwgd2lkdGgpXG4gICAgICAgICAgICBsaW5lcy5wdXNoKG1lYXN1cmVkKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBsaW5lU3RhcnQgPSBpKzFcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGluZXNcbn1cblxuZnVuY3Rpb24gZ3JlZWR5KG1lYXN1cmUsIHRleHQsIHN0YXJ0LCBlbmQsIHdpZHRoLCBtb2RlKSB7XG4gICAgLy9BIGdyZWVkeSB3b3JkIHdyYXBwZXIgYmFzZWQgb24gTGliR0RYIGFsZ29yaXRobVxuICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL2xpYmdkeC9saWJnZHgvYmxvYi9tYXN0ZXIvZ2R4L3NyYy9jb20vYmFkbG9naWMvZ2R4L2dyYXBoaWNzL2cyZC9CaXRtYXBGb250Q2FjaGUuamF2YVxuICAgIHZhciBsaW5lcyA9IFtdXG5cbiAgICB2YXIgdGVzdFdpZHRoID0gd2lkdGhcbiAgICAvL2lmICdub3dyYXAnIGlzIHNwZWNpZmllZCwgd2Ugb25seSB3cmFwIG9uIG5ld2xpbmUgY2hhcnNcbiAgICBpZiAobW9kZSA9PT0gJ25vd3JhcCcpXG4gICAgICAgIHRlc3RXaWR0aCA9IE51bWJlci5NQVhfVkFMVUVcblxuICAgIHdoaWxlIChzdGFydCA8IGVuZCAmJiBzdGFydCA8IHRleHQubGVuZ3RoKSB7XG4gICAgICAgIC8vZ2V0IG5leHQgbmV3bGluZSBwb3NpdGlvblxuICAgICAgICB2YXIgbmV3TGluZSA9IGlkeE9mKHRleHQsIG5ld2xpbmVDaGFyLCBzdGFydCwgZW5kKVxuXG4gICAgICAgIC8vZWF0IHdoaXRlc3BhY2UgYXQgc3RhcnQgb2YgbGluZVxuICAgICAgICB3aGlsZSAoc3RhcnQgPCBuZXdMaW5lKSB7XG4gICAgICAgICAgICBpZiAoIWlzV2hpdGVzcGFjZSggdGV4dC5jaGFyQXQoc3RhcnQpICkpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIHN0YXJ0KytcbiAgICAgICAgfVxuXG4gICAgICAgIC8vZGV0ZXJtaW5lIHZpc2libGUgIyBvZiBnbHlwaHMgZm9yIHRoZSBhdmFpbGFibGUgd2lkdGhcbiAgICAgICAgdmFyIG1lYXN1cmVkID0gbWVhc3VyZSh0ZXh0LCBzdGFydCwgbmV3TGluZSwgdGVzdFdpZHRoKVxuXG4gICAgICAgIHZhciBsaW5lRW5kID0gc3RhcnQgKyAobWVhc3VyZWQuZW5kLW1lYXN1cmVkLnN0YXJ0KVxuICAgICAgICB2YXIgbmV4dFN0YXJ0ID0gbGluZUVuZCArIG5ld2xpbmVDaGFyLmxlbmd0aFxuXG4gICAgICAgIC8vaWYgd2UgaGFkIHRvIGN1dCB0aGUgbGluZSBiZWZvcmUgdGhlIG5leHQgbmV3bGluZS4uLlxuICAgICAgICBpZiAobGluZUVuZCA8IG5ld0xpbmUpIHtcbiAgICAgICAgICAgIC8vZmluZCBjaGFyIHRvIGJyZWFrIG9uXG4gICAgICAgICAgICB3aGlsZSAobGluZUVuZCA+IHN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzV2hpdGVzcGFjZSh0ZXh0LmNoYXJBdChsaW5lRW5kKSkpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgbGluZUVuZC0tXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGluZUVuZCA9PT0gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICBpZiAobmV4dFN0YXJ0ID4gc3RhcnQgKyBuZXdsaW5lQ2hhci5sZW5ndGgpIG5leHRTdGFydC0tXG4gICAgICAgICAgICAgICAgbGluZUVuZCA9IG5leHRTdGFydCAvLyBJZiBubyBjaGFyYWN0ZXJzIHRvIGJyZWFrLCBzaG93IGFsbC5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV4dFN0YXJ0ID0gbGluZUVuZFxuICAgICAgICAgICAgICAgIC8vZWF0IHdoaXRlc3BhY2UgYXQgZW5kIG9mIGxpbmVcbiAgICAgICAgICAgICAgICB3aGlsZSAobGluZUVuZCA+IHN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNXaGl0ZXNwYWNlKHRleHQuY2hhckF0KGxpbmVFbmQgLSBuZXdsaW5lQ2hhci5sZW5ndGgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGxpbmVFbmQtLVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobGluZUVuZCA+PSBzdGFydCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG1lYXN1cmUodGV4dCwgc3RhcnQsIGxpbmVFbmQsIHRlc3RXaWR0aClcbiAgICAgICAgICAgIGxpbmVzLnB1c2gocmVzdWx0KVxuICAgICAgICB9XG4gICAgICAgIHN0YXJ0ID0gbmV4dFN0YXJ0XG4gICAgfVxuICAgIHJldHVybiBsaW5lc1xufVxuXG4vL2RldGVybWluZXMgdGhlIHZpc2libGUgbnVtYmVyIG9mIGdseXBocyB3aXRoaW4gYSBnaXZlbiB3aWR0aFxuZnVuY3Rpb24gbW9ub3NwYWNlKHRleHQsIHN0YXJ0LCBlbmQsIHdpZHRoKSB7XG4gICAgdmFyIGdseXBocyA9IE1hdGgubWluKHdpZHRoLCBlbmQtc3RhcnQpXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICBlbmQ6IHN0YXJ0K2dseXBoc1xuICAgIH1cbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vd29yZC13cmFwcGVyL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZXh0ZW5kXG5cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbmZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgICB2YXIgdGFyZ2V0ID0ge31cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV1cblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34veHRlbmQvaW1tdXRhYmxlLmpzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tcGlsZShwcm9wZXJ0eSkge1xuXHRpZiAoIXByb3BlcnR5IHx8IHR5cGVvZiBwcm9wZXJ0eSAhPT0gJ3N0cmluZycpXG5cdFx0dGhyb3cgbmV3IEVycm9yKCdtdXN0IHNwZWNpZnkgcHJvcGVydHkgZm9yIGluZGV4b2Ygc2VhcmNoJylcblxuXHRyZXR1cm4gbmV3IEZ1bmN0aW9uKCdhcnJheScsICd2YWx1ZScsICdzdGFydCcsIFtcblx0XHQnc3RhcnQgPSBzdGFydCB8fCAwJyxcblx0XHQnZm9yICh2YXIgaT1zdGFydDsgaTxhcnJheS5sZW5ndGg7IGkrKyknLFxuXHRcdCcgIGlmIChhcnJheVtpXVtcIicgKyBwcm9wZXJ0eSArJ1wiXSA9PT0gdmFsdWUpJyxcblx0XHQnICAgICAgcmV0dXJuIGknLFxuXHRcdCdyZXR1cm4gLTEnXG5cdF0uam9pbignXFxuJykpXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2luZGV4b2YtcHJvcGVydHkvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbnVtdHlwZShudW0sIGRlZikge1xuXHRyZXR1cm4gdHlwZW9mIG51bSA9PT0gJ251bWJlcidcblx0XHQ/IG51bSBcblx0XHQ6ICh0eXBlb2YgZGVmID09PSAnbnVtYmVyJyA/IGRlZiA6IDApXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FzLW51bWJlci9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qc1xuLy8gbW9kdWxlIGlkID0gMTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGR0eXBlID0gcmVxdWlyZSgnZHR5cGUnKVxudmFyIGFuQXJyYXkgPSByZXF1aXJlKCdhbi1hcnJheScpXG52YXIgaXNCdWZmZXIgPSByZXF1aXJlKCdpcy1idWZmZXInKVxuXG52YXIgQ1cgPSBbMCwgMiwgM11cbnZhciBDQ1cgPSBbMiwgMSwgM11cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVRdWFkRWxlbWVudHMoYXJyYXksIG9wdCkge1xuICAgIC8vaWYgdXNlciBkaWRuJ3Qgc3BlY2lmeSBhbiBvdXRwdXQgYXJyYXlcbiAgICBpZiAoIWFycmF5IHx8ICEoYW5BcnJheShhcnJheSkgfHwgaXNCdWZmZXIoYXJyYXkpKSkge1xuICAgICAgICBvcHQgPSBhcnJheSB8fCB7fVxuICAgICAgICBhcnJheSA9IG51bGxcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9wdCA9PT0gJ251bWJlcicpIC8vYmFja3dhcmRzLWNvbXBhdGlibGVcbiAgICAgICAgb3B0ID0geyBjb3VudDogb3B0IH1cbiAgICBlbHNlXG4gICAgICAgIG9wdCA9IG9wdCB8fCB7fVxuXG4gICAgdmFyIHR5cGUgPSB0eXBlb2Ygb3B0LnR5cGUgPT09ICdzdHJpbmcnID8gb3B0LnR5cGUgOiAndWludDE2J1xuICAgIHZhciBjb3VudCA9IHR5cGVvZiBvcHQuY291bnQgPT09ICdudW1iZXInID8gb3B0LmNvdW50IDogMVxuICAgIHZhciBzdGFydCA9IChvcHQuc3RhcnQgfHwgMCkgXG5cbiAgICB2YXIgZGlyID0gb3B0LmNsb2Nrd2lzZSAhPT0gZmFsc2UgPyBDVyA6IENDVyxcbiAgICAgICAgYSA9IGRpclswXSwgXG4gICAgICAgIGIgPSBkaXJbMV0sXG4gICAgICAgIGMgPSBkaXJbMl1cblxuICAgIHZhciBudW1JbmRpY2VzID0gY291bnQgKiA2XG5cbiAgICB2YXIgaW5kaWNlcyA9IGFycmF5IHx8IG5ldyAoZHR5cGUodHlwZSkpKG51bUluZGljZXMpXG4gICAgZm9yICh2YXIgaSA9IDAsIGogPSAwOyBpIDwgbnVtSW5kaWNlczsgaSArPSA2LCBqICs9IDQpIHtcbiAgICAgICAgdmFyIHggPSBpICsgc3RhcnRcbiAgICAgICAgaW5kaWNlc1t4ICsgMF0gPSBqICsgMFxuICAgICAgICBpbmRpY2VzW3ggKyAxXSA9IGogKyAxXG4gICAgICAgIGluZGljZXNbeCArIDJdID0gaiArIDJcbiAgICAgICAgaW5kaWNlc1t4ICsgM10gPSBqICsgYVxuICAgICAgICBpbmRpY2VzW3ggKyA0XSA9IGogKyBiXG4gICAgICAgIGluZGljZXNbeCArIDVdID0gaiArIGNcbiAgICB9XG4gICAgcmV0dXJuIGluZGljZXNcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcXVhZC1pbmRpY2VzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGR0eXBlKSB7XG4gIHN3aXRjaCAoZHR5cGUpIHtcbiAgICBjYXNlICdpbnQ4JzpcbiAgICAgIHJldHVybiBJbnQ4QXJyYXlcbiAgICBjYXNlICdpbnQxNic6XG4gICAgICByZXR1cm4gSW50MTZBcnJheVxuICAgIGNhc2UgJ2ludDMyJzpcbiAgICAgIHJldHVybiBJbnQzMkFycmF5XG4gICAgY2FzZSAndWludDgnOlxuICAgICAgcmV0dXJuIFVpbnQ4QXJyYXlcbiAgICBjYXNlICd1aW50MTYnOlxuICAgICAgcmV0dXJuIFVpbnQxNkFycmF5XG4gICAgY2FzZSAndWludDMyJzpcbiAgICAgIHJldHVybiBVaW50MzJBcnJheVxuICAgIGNhc2UgJ2Zsb2F0MzInOlxuICAgICAgcmV0dXJuIEZsb2F0MzJBcnJheVxuICAgIGNhc2UgJ2Zsb2F0NjQnOlxuICAgICAgcmV0dXJuIEZsb2F0NjRBcnJheVxuICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgIHJldHVybiBBcnJheVxuICAgIGNhc2UgJ3VpbnQ4X2NsYW1wZWQnOlxuICAgICAgcmV0dXJuIFVpbnQ4Q2xhbXBlZEFycmF5XG4gIH1cbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9kdHlwZS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHN0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdcblxubW9kdWxlLmV4cG9ydHMgPSBhbkFycmF5XG5cbmZ1bmN0aW9uIGFuQXJyYXkoYXJyKSB7XG4gIHJldHVybiAoXG4gICAgICAgYXJyLkJZVEVTX1BFUl9FTEVNRU5UXG4gICAgJiYgc3RyLmNhbGwoYXJyLmJ1ZmZlcikgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSdcbiAgICB8fCBBcnJheS5pc0FycmF5KGFycilcbiAgKVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FuLWFycmF5L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiFcbiAqIERldGVybWluZSBpZiBhbiBvYmplY3QgaXMgYSBCdWZmZXJcbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG4vLyBUaGUgX2lzQnVmZmVyIGNoZWNrIGlzIGZvciBTYWZhcmkgNS03IHN1cHBvcnQsIGJlY2F1c2UgaXQncyBtaXNzaW5nXG4vLyBPYmplY3QucHJvdG90eXBlLmNvbnN0cnVjdG9yLiBSZW1vdmUgdGhpcyBldmVudHVhbGx5XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAhPSBudWxsICYmIChpc0J1ZmZlcihvYmopIHx8IGlzU2xvd0J1ZmZlcihvYmopIHx8ICEhb2JqLl9pc0J1ZmZlcilcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXIgKG9iaikge1xuICByZXR1cm4gISFvYmouY29uc3RydWN0b3IgJiYgdHlwZW9mIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIob2JqKVxufVxuXG4vLyBGb3IgTm9kZSB2MC4xMCBzdXBwb3J0LiBSZW1vdmUgdGhpcyBldmVudHVhbGx5LlxuZnVuY3Rpb24gaXNTbG93QnVmZmVyIChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmoucmVhZEZsb2F0TEUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIG9iai5zbGljZSA9PT0gJ2Z1bmN0aW9uJyAmJiBpc0J1ZmZlcihvYmouc2xpY2UoMCwgMCkpXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vaXMtYnVmZmVyL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZmxhdHRlbiA9IHJlcXVpcmUoJ2ZsYXR0ZW4tdmVydGV4LWRhdGEnKVxudmFyIHdhcm5lZCA9IGZhbHNlO1xuXG5tb2R1bGUuZXhwb3J0cy5hdHRyID0gc2V0QXR0cmlidXRlXG5tb2R1bGUuZXhwb3J0cy5pbmRleCA9IHNldEluZGV4XG5cbmZ1bmN0aW9uIHNldEluZGV4IChnZW9tZXRyeSwgZGF0YSwgaXRlbVNpemUsIGR0eXBlKSB7XG4gIGlmICh0eXBlb2YgaXRlbVNpemUgIT09ICdudW1iZXInKSBpdGVtU2l6ZSA9IDFcbiAgaWYgKHR5cGVvZiBkdHlwZSAhPT0gJ3N0cmluZycpIGR0eXBlID0gJ3VpbnQxNidcblxuICB2YXIgaXNSNjkgPSAhZ2VvbWV0cnkuaW5kZXggJiYgdHlwZW9mIGdlb21ldHJ5LnNldEluZGV4ICE9PSAnZnVuY3Rpb24nXG4gIHZhciBhdHRyaWIgPSBpc1I2OSA/IGdlb21ldHJ5LmdldEF0dHJpYnV0ZSgnaW5kZXgnKSA6IGdlb21ldHJ5LmluZGV4XG4gIHZhciBuZXdBdHRyaWIgPSB1cGRhdGVBdHRyaWJ1dGUoYXR0cmliLCBkYXRhLCBpdGVtU2l6ZSwgZHR5cGUpXG4gIGlmIChuZXdBdHRyaWIpIHtcbiAgICBpZiAoaXNSNjkpIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnaW5kZXgnLCBuZXdBdHRyaWIpXG4gICAgZWxzZSBnZW9tZXRyeS5pbmRleCA9IG5ld0F0dHJpYlxuICB9XG59XG5cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZSAoZ2VvbWV0cnksIGtleSwgZGF0YSwgaXRlbVNpemUsIGR0eXBlKSB7XG4gIGlmICh0eXBlb2YgaXRlbVNpemUgIT09ICdudW1iZXInKSBpdGVtU2l6ZSA9IDNcbiAgaWYgKHR5cGVvZiBkdHlwZSAhPT0gJ3N0cmluZycpIGR0eXBlID0gJ2Zsb2F0MzInXG4gIGlmIChBcnJheS5pc0FycmF5KGRhdGEpICYmXG4gICAgQXJyYXkuaXNBcnJheShkYXRhWzBdKSAmJlxuICAgIGRhdGFbMF0ubGVuZ3RoICE9PSBpdGVtU2l6ZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignTmVzdGVkIHZlcnRleCBhcnJheSBoYXMgdW5leHBlY3RlZCBzaXplOyBleHBlY3RlZCAnICtcbiAgICAgIGl0ZW1TaXplICsgJyBidXQgZm91bmQgJyArIGRhdGFbMF0ubGVuZ3RoKVxuICB9XG5cbiAgdmFyIGF0dHJpYiA9IGdlb21ldHJ5LmdldEF0dHJpYnV0ZShrZXkpXG4gIHZhciBuZXdBdHRyaWIgPSB1cGRhdGVBdHRyaWJ1dGUoYXR0cmliLCBkYXRhLCBpdGVtU2l6ZSwgZHR5cGUpXG4gIGlmIChuZXdBdHRyaWIpIHtcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoa2V5LCBuZXdBdHRyaWIpXG4gIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlQXR0cmlidXRlIChhdHRyaWIsIGRhdGEsIGl0ZW1TaXplLCBkdHlwZSkge1xuICBkYXRhID0gZGF0YSB8fCBbXVxuICBpZiAoIWF0dHJpYiB8fCByZWJ1aWxkQXR0cmlidXRlKGF0dHJpYiwgZGF0YSwgaXRlbVNpemUpKSB7XG4gICAgLy8gY3JlYXRlIGEgbmV3IGFycmF5IHdpdGggZGVzaXJlZCB0eXBlXG4gICAgZGF0YSA9IGZsYXR0ZW4oZGF0YSwgZHR5cGUpXG5cbiAgICB2YXIgbmVlZHNOZXdCdWZmZXIgPSBhdHRyaWIgJiYgdHlwZW9mIGF0dHJpYi5zZXRBcnJheSAhPT0gJ2Z1bmN0aW9uJ1xuICAgIGlmICghYXR0cmliIHx8IG5lZWRzTmV3QnVmZmVyKSB7XG4gICAgICAvLyBXZSBhcmUgb24gYW4gb2xkIHZlcnNpb24gb2YgVGhyZWVKUyB3aGljaCBjYW4ndFxuICAgICAgLy8gc3VwcG9ydCBncm93aW5nIC8gc2hyaW5raW5nIGJ1ZmZlcnMsIHNvIHdlIG5lZWRcbiAgICAgIC8vIHRvIGJ1aWxkIGEgbmV3IGJ1ZmZlclxuICAgICAgaWYgKG5lZWRzTmV3QnVmZmVyICYmICF3YXJuZWQpIHtcbiAgICAgICAgd2FybmVkID0gdHJ1ZVxuICAgICAgICBjb25zb2xlLndhcm4oW1xuICAgICAgICAgICdBIFdlYkdMIGJ1ZmZlciBpcyBiZWluZyB1cGRhdGVkIHdpdGggYSBuZXcgc2l6ZSBvciBpdGVtU2l6ZSwgJyxcbiAgICAgICAgICAnaG93ZXZlciB0aGlzIHZlcnNpb24gb2YgVGhyZWVKUyBvbmx5IHN1cHBvcnRzIGZpeGVkLXNpemUgYnVmZmVycy4nLFxuICAgICAgICAgICdcXG5UaGUgb2xkIGJ1ZmZlciBtYXkgc3RpbGwgYmUga2VwdCBpbiBtZW1vcnkuXFxuJyxcbiAgICAgICAgICAnVG8gYXZvaWQgbWVtb3J5IGxlYWtzLCBpdCBpcyByZWNvbW1lbmRlZCB0aGF0IHlvdSBkaXNwb3NlICcsXG4gICAgICAgICAgJ3lvdXIgZ2VvbWV0cmllcyBhbmQgY3JlYXRlIG5ldyBvbmVzLCBvciB1cGRhdGUgdG8gVGhyZWVKUyByODIgb3IgbmV3ZXIuXFxuJyxcbiAgICAgICAgICAnU2VlIGhlcmUgZm9yIGRpc2N1c3Npb246XFxuJyxcbiAgICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9wdWxsLzk2MzEnXG4gICAgICAgIF0uam9pbignJykpXG4gICAgICB9XG5cbiAgICAgIC8vIEJ1aWxkIGEgbmV3IGF0dHJpYnV0ZVxuICAgICAgYXR0cmliID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShkYXRhLCBpdGVtU2l6ZSk7XG4gICAgfVxuXG4gICAgYXR0cmliLml0ZW1TaXplID0gaXRlbVNpemVcbiAgICBhdHRyaWIubmVlZHNVcGRhdGUgPSB0cnVlXG5cbiAgICAvLyBOZXcgdmVyc2lvbnMgb2YgVGhyZWVKUyBzdWdnZXN0IHVzaW5nIHNldEFycmF5XG4gICAgLy8gdG8gY2hhbmdlIHRoZSBkYXRhLiBJdCB3aWxsIHVzZSBidWZmZXJEYXRhIGludGVybmFsbHksXG4gICAgLy8gc28geW91IGNhbiBjaGFuZ2UgdGhlIGFycmF5IHNpemUgd2l0aG91dCBhbnkgaXNzdWVzXG4gICAgaWYgKHR5cGVvZiBhdHRyaWIuc2V0QXJyYXkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGF0dHJpYi5zZXRBcnJheShkYXRhKVxuICAgIH1cblxuICAgIHJldHVybiBhdHRyaWJcbiAgfSBlbHNlIHtcbiAgICAvLyBjb3B5IGRhdGEgaW50byB0aGUgZXhpc3RpbmcgYXJyYXlcbiAgICBmbGF0dGVuKGRhdGEsIGF0dHJpYi5hcnJheSlcbiAgICBhdHRyaWIubmVlZHNVcGRhdGUgPSB0cnVlXG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuXG4vLyBUZXN0IHdoZXRoZXIgdGhlIGF0dHJpYnV0ZSBuZWVkcyB0byBiZSByZS1jcmVhdGVkLFxuLy8gcmV0dXJucyBmYWxzZSBpZiB3ZSBjYW4gcmUtdXNlIGl0IGFzLWlzLlxuZnVuY3Rpb24gcmVidWlsZEF0dHJpYnV0ZSAoYXR0cmliLCBkYXRhLCBpdGVtU2l6ZSkge1xuICBpZiAoYXR0cmliLml0ZW1TaXplICE9PSBpdGVtU2l6ZSkgcmV0dXJuIHRydWVcbiAgaWYgKCFhdHRyaWIuYXJyYXkpIHJldHVybiB0cnVlXG4gIHZhciBhdHRyaWJMZW5ndGggPSBhdHRyaWIuYXJyYXkubGVuZ3RoXG4gIGlmIChBcnJheS5pc0FycmF5KGRhdGEpICYmIEFycmF5LmlzQXJyYXkoZGF0YVswXSkpIHtcbiAgICAvLyBbIFsgeCwgeSwgeiBdIF1cbiAgICByZXR1cm4gYXR0cmliTGVuZ3RoICE9PSBkYXRhLmxlbmd0aCAqIGl0ZW1TaXplXG4gIH0gZWxzZSB7XG4gICAgLy8gWyB4LCB5LCB6IF1cbiAgICByZXR1cm4gYXR0cmliTGVuZ3RoICE9PSBkYXRhLmxlbmd0aFxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3RocmVlLWJ1ZmZlci12ZXJ0ZXgtZGF0YS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyplc2xpbnQgbmV3LWNhcDowKi9cbnZhciBkdHlwZSA9IHJlcXVpcmUoJ2R0eXBlJylcbm1vZHVsZS5leHBvcnRzID0gZmxhdHRlblZlcnRleERhdGFcbmZ1bmN0aW9uIGZsYXR0ZW5WZXJ0ZXhEYXRhIChkYXRhLCBvdXRwdXQsIG9mZnNldCkge1xuICBpZiAoIWRhdGEpIHRocm93IG5ldyBUeXBlRXJyb3IoJ211c3Qgc3BlY2lmeSBkYXRhIGFzIGZpcnN0IHBhcmFtZXRlcicpXG4gIG9mZnNldCA9ICsob2Zmc2V0IHx8IDApIHwgMFxuXG4gIGlmIChBcnJheS5pc0FycmF5KGRhdGEpICYmIEFycmF5LmlzQXJyYXkoZGF0YVswXSkpIHtcbiAgICB2YXIgZGltID0gZGF0YVswXS5sZW5ndGhcbiAgICB2YXIgbGVuZ3RoID0gZGF0YS5sZW5ndGggKiBkaW1cblxuICAgIC8vIG5vIG91dHB1dCBzcGVjaWZpZWQsIGNyZWF0ZSBhIG5ldyB0eXBlZCBhcnJheVxuICAgIGlmICghb3V0cHV0IHx8IHR5cGVvZiBvdXRwdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBvdXRwdXQgPSBuZXcgKGR0eXBlKG91dHB1dCB8fCAnZmxvYXQzMicpKShsZW5ndGggKyBvZmZzZXQpXG4gICAgfVxuXG4gICAgdmFyIGRzdExlbmd0aCA9IG91dHB1dC5sZW5ndGggLSBvZmZzZXRcbiAgICBpZiAobGVuZ3RoICE9PSBkc3RMZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignc291cmNlIGxlbmd0aCAnICsgbGVuZ3RoICsgJyAoJyArIGRpbSArICd4JyArIGRhdGEubGVuZ3RoICsgJyknICtcbiAgICAgICAgJyBkb2VzIG5vdCBtYXRjaCBkZXN0aW5hdGlvbiBsZW5ndGggJyArIGRzdExlbmd0aClcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMCwgayA9IG9mZnNldDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZGltOyBqKyspIHtcbiAgICAgICAgb3V0cHV0W2srK10gPSBkYXRhW2ldW2pdXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmICghb3V0cHV0IHx8IHR5cGVvZiBvdXRwdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBubyBvdXRwdXQsIGNyZWF0ZSBhIG5ldyBvbmVcbiAgICAgIHZhciBDdG9yID0gZHR5cGUob3V0cHV0IHx8ICdmbG9hdDMyJylcbiAgICAgIGlmIChvZmZzZXQgPT09IDApIHtcbiAgICAgICAgb3V0cHV0ID0gbmV3IEN0b3IoZGF0YSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dHB1dCA9IG5ldyBDdG9yKGRhdGEubGVuZ3RoICsgb2Zmc2V0KVxuICAgICAgICBvdXRwdXQuc2V0KGRhdGEsIG9mZnNldClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gc3RvcmUgb3V0cHV0IGluIGV4aXN0aW5nIGFycmF5XG4gICAgICBvdXRwdXQuc2V0KGRhdGEsIG9mZnNldClcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3V0cHV0XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vZmxhdHRlbi12ZXJ0ZXgtZGF0YS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcbm9iamVjdC1hc3NpZ25cbihjKSBTaW5kcmUgU29yaHVzXG5AbGljZW5zZSBNSVRcbiovXG5cbid1c2Ugc3RyaWN0Jztcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG52YXIgZ2V0T3duUHJvcGVydHlTeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgcHJvcElzRW51bWVyYWJsZSA9IE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbmZ1bmN0aW9uIHRvT2JqZWN0KHZhbCkge1xuXHRpZiAodmFsID09PSBudWxsIHx8IHZhbCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmFzc2lnbiBjYW5ub3QgYmUgY2FsbGVkIHdpdGggbnVsbCBvciB1bmRlZmluZWQnKTtcblx0fVxuXG5cdHJldHVybiBPYmplY3QodmFsKTtcbn1cblxuZnVuY3Rpb24gc2hvdWxkVXNlTmF0aXZlKCkge1xuXHR0cnkge1xuXHRcdGlmICghT2JqZWN0LmFzc2lnbikge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIERldGVjdCBidWdneSBwcm9wZXJ0eSBlbnVtZXJhdGlvbiBvcmRlciBpbiBvbGRlciBWOCB2ZXJzaW9ucy5cblxuXHRcdC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTQxMThcblx0XHR2YXIgdGVzdDEgPSBuZXcgU3RyaW5nKCdhYmMnKTsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbmV3LXdyYXBwZXJzXG5cdFx0dGVzdDFbNV0gPSAnZGUnO1xuXHRcdGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0ZXN0MSlbMF0gPT09ICc1Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTMwNTZcblx0XHR2YXIgdGVzdDIgPSB7fTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDEwOyBpKyspIHtcblx0XHRcdHRlc3QyWydfJyArIFN0cmluZy5mcm9tQ2hhckNvZGUoaSldID0gaTtcblx0XHR9XG5cdFx0dmFyIG9yZGVyMiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRlc3QyKS5tYXAoZnVuY3Rpb24gKG4pIHtcblx0XHRcdHJldHVybiB0ZXN0MltuXTtcblx0XHR9KTtcblx0XHRpZiAob3JkZXIyLmpvaW4oJycpICE9PSAnMDEyMzQ1Njc4OScpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0zMDU2XG5cdFx0dmFyIHRlc3QzID0ge307XG5cdFx0J2FiY2RlZmdoaWprbG1ub3BxcnN0Jy5zcGxpdCgnJykuZm9yRWFjaChmdW5jdGlvbiAobGV0dGVyKSB7XG5cdFx0XHR0ZXN0M1tsZXR0ZXJdID0gbGV0dGVyO1xuXHRcdH0pO1xuXHRcdGlmIChPYmplY3Qua2V5cyhPYmplY3QuYXNzaWduKHt9LCB0ZXN0MykpLmpvaW4oJycpICE9PVxuXHRcdFx0XHQnYWJjZGVmZ2hpamtsbW5vcHFyc3QnKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdC8vIFdlIGRvbid0IGV4cGVjdCBhbnkgb2YgdGhlIGFib3ZlIHRvIHRocm93LCBidXQgYmV0dGVyIHRvIGJlIHNhZmUuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2hvdWxkVXNlTmF0aXZlKCkgPyBPYmplY3QuYXNzaWduIDogZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG5cdHZhciBmcm9tO1xuXHR2YXIgdG8gPSB0b09iamVjdCh0YXJnZXQpO1xuXHR2YXIgc3ltYm9scztcblxuXHRmb3IgKHZhciBzID0gMTsgcyA8IGFyZ3VtZW50cy5sZW5ndGg7IHMrKykge1xuXHRcdGZyb20gPSBPYmplY3QoYXJndW1lbnRzW3NdKTtcblxuXHRcdGZvciAodmFyIGtleSBpbiBmcm9tKSB7XG5cdFx0XHRpZiAoaGFzT3duUHJvcGVydHkuY2FsbChmcm9tLCBrZXkpKSB7XG5cdFx0XHRcdHRvW2tleV0gPSBmcm9tW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGdldE93blByb3BlcnR5U3ltYm9scykge1xuXHRcdFx0c3ltYm9scyA9IGdldE93blByb3BlcnR5U3ltYm9scyhmcm9tKTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3ltYm9scy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAocHJvcElzRW51bWVyYWJsZS5jYWxsKGZyb20sIHN5bWJvbHNbaV0pKSB7XG5cdFx0XHRcdFx0dG9bc3ltYm9sc1tpXV0gPSBmcm9tW3N5bWJvbHNbaV1dO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRvO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9vYmplY3QtYXNzaWduL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cy5wYWdlcyA9IGZ1bmN0aW9uIHBhZ2VzIChnbHlwaHMpIHtcbiAgdmFyIHBhZ2VzID0gbmV3IEZsb2F0MzJBcnJheShnbHlwaHMubGVuZ3RoICogNCAqIDEpXG4gIHZhciBpID0gMFxuICBnbHlwaHMuZm9yRWFjaChmdW5jdGlvbiAoZ2x5cGgpIHtcbiAgICB2YXIgaWQgPSBnbHlwaC5kYXRhLnBhZ2UgfHwgMFxuICAgIHBhZ2VzW2krK10gPSBpZFxuICAgIHBhZ2VzW2krK10gPSBpZFxuICAgIHBhZ2VzW2krK10gPSBpZFxuICAgIHBhZ2VzW2krK10gPSBpZFxuICB9KVxuICByZXR1cm4gcGFnZXNcbn1cblxubW9kdWxlLmV4cG9ydHMudXZzID0gZnVuY3Rpb24gdXZzIChnbHlwaHMsIHRleFdpZHRoLCB0ZXhIZWlnaHQsIGZsaXBZKSB7XG4gIHZhciB1dnMgPSBuZXcgRmxvYXQzMkFycmF5KGdseXBocy5sZW5ndGggKiA0ICogMilcbiAgdmFyIGkgPSAwXG4gIGdseXBocy5mb3JFYWNoKGZ1bmN0aW9uIChnbHlwaCkge1xuICAgIHZhciBiaXRtYXAgPSBnbHlwaC5kYXRhXG4gICAgdmFyIGJ3ID0gKGJpdG1hcC54ICsgYml0bWFwLndpZHRoKVxuICAgIHZhciBiaCA9IChiaXRtYXAueSArIGJpdG1hcC5oZWlnaHQpXG5cbiAgICAvLyB0b3AgbGVmdCBwb3NpdGlvblxuICAgIHZhciB1MCA9IGJpdG1hcC54IC8gdGV4V2lkdGhcbiAgICB2YXIgdjEgPSBiaXRtYXAueSAvIHRleEhlaWdodFxuICAgIHZhciB1MSA9IGJ3IC8gdGV4V2lkdGhcbiAgICB2YXIgdjAgPSBiaCAvIHRleEhlaWdodFxuXG4gICAgaWYgKGZsaXBZKSB7XG4gICAgICB2MSA9ICh0ZXhIZWlnaHQgLSBiaXRtYXAueSkgLyB0ZXhIZWlnaHRcbiAgICAgIHYwID0gKHRleEhlaWdodCAtIGJoKSAvIHRleEhlaWdodFxuICAgIH1cblxuICAgIC8vIEJMXG4gICAgdXZzW2krK10gPSB1MFxuICAgIHV2c1tpKytdID0gdjFcbiAgICAvLyBUTFxuICAgIHV2c1tpKytdID0gdTBcbiAgICB1dnNbaSsrXSA9IHYwXG4gICAgLy8gVFJcbiAgICB1dnNbaSsrXSA9IHUxXG4gICAgdXZzW2krK10gPSB2MFxuICAgIC8vIEJSXG4gICAgdXZzW2krK10gPSB1MVxuICAgIHV2c1tpKytdID0gdjFcbiAgfSlcbiAgcmV0dXJuIHV2c1xufVxuXG5tb2R1bGUuZXhwb3J0cy5wb3NpdGlvbnMgPSBmdW5jdGlvbiBwb3NpdGlvbnMgKGdseXBocykge1xuICB2YXIgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShnbHlwaHMubGVuZ3RoICogNCAqIDIpXG4gIHZhciBpID0gMFxuICBnbHlwaHMuZm9yRWFjaChmdW5jdGlvbiAoZ2x5cGgpIHtcbiAgICB2YXIgYml0bWFwID0gZ2x5cGguZGF0YVxuXG4gICAgLy8gYm90dG9tIGxlZnQgcG9zaXRpb25cbiAgICB2YXIgeCA9IGdseXBoLnBvc2l0aW9uWzBdICsgYml0bWFwLnhvZmZzZXRcbiAgICB2YXIgeSA9IGdseXBoLnBvc2l0aW9uWzFdICsgYml0bWFwLnlvZmZzZXRcblxuICAgIC8vIHF1YWQgc2l6ZVxuICAgIHZhciB3ID0gYml0bWFwLndpZHRoXG4gICAgdmFyIGggPSBiaXRtYXAuaGVpZ2h0XG5cbiAgICAvLyBCTFxuICAgIHBvc2l0aW9uc1tpKytdID0geFxuICAgIHBvc2l0aW9uc1tpKytdID0geVxuICAgIC8vIFRMXG4gICAgcG9zaXRpb25zW2krK10gPSB4XG4gICAgcG9zaXRpb25zW2krK10gPSB5ICsgaFxuICAgIC8vIFRSXG4gICAgcG9zaXRpb25zW2krK10gPSB4ICsgd1xuICAgIHBvc2l0aW9uc1tpKytdID0geSArIGhcbiAgICAvLyBCUlxuICAgIHBvc2l0aW9uc1tpKytdID0geCArIHdcbiAgICBwb3NpdGlvbnNbaSsrXSA9IHlcbiAgfSlcbiAgcmV0dXJuIHBvc2l0aW9uc1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3RocmVlLWJtZm9udC10ZXh0L2xpYi92ZXJ0aWNlcy5qc1xuLy8gbW9kdWxlIGlkID0gMjBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGl0ZW1TaXplID0gMlxudmFyIGJveCA9IHsgbWluOiBbMCwgMF0sIG1heDogWzAsIDBdIH1cblxuZnVuY3Rpb24gYm91bmRzIChwb3NpdGlvbnMpIHtcbiAgdmFyIGNvdW50ID0gcG9zaXRpb25zLmxlbmd0aCAvIGl0ZW1TaXplXG4gIGJveC5taW5bMF0gPSBwb3NpdGlvbnNbMF1cbiAgYm94Lm1pblsxXSA9IHBvc2l0aW9uc1sxXVxuICBib3gubWF4WzBdID0gcG9zaXRpb25zWzBdXG4gIGJveC5tYXhbMV0gPSBwb3NpdGlvbnNbMV1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICB2YXIgeCA9IHBvc2l0aW9uc1tpICogaXRlbVNpemUgKyAwXVxuICAgIHZhciB5ID0gcG9zaXRpb25zW2kgKiBpdGVtU2l6ZSArIDFdXG4gICAgYm94Lm1pblswXSA9IE1hdGgubWluKHgsIGJveC5taW5bMF0pXG4gICAgYm94Lm1pblsxXSA9IE1hdGgubWluKHksIGJveC5taW5bMV0pXG4gICAgYm94Lm1heFswXSA9IE1hdGgubWF4KHgsIGJveC5tYXhbMF0pXG4gICAgYm94Lm1heFsxXSA9IE1hdGgubWF4KHksIGJveC5tYXhbMV0pXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMuY29tcHV0ZUJveCA9IGZ1bmN0aW9uIChwb3NpdGlvbnMsIG91dHB1dCkge1xuICBib3VuZHMocG9zaXRpb25zKVxuICBvdXRwdXQubWluLnNldChib3gubWluWzBdLCBib3gubWluWzFdLCAwKVxuICBvdXRwdXQubWF4LnNldChib3gubWF4WzBdLCBib3gubWF4WzFdLCAwKVxufVxuXG5tb2R1bGUuZXhwb3J0cy5jb21wdXRlU3BoZXJlID0gZnVuY3Rpb24gKHBvc2l0aW9ucywgb3V0cHV0KSB7XG4gIGJvdW5kcyhwb3NpdGlvbnMpXG4gIHZhciBtaW5YID0gYm94Lm1pblswXVxuICB2YXIgbWluWSA9IGJveC5taW5bMV1cbiAgdmFyIG1heFggPSBib3gubWF4WzBdXG4gIHZhciBtYXhZID0gYm94Lm1heFsxXVxuICB2YXIgd2lkdGggPSBtYXhYIC0gbWluWFxuICB2YXIgaGVpZ2h0ID0gbWF4WSAtIG1pbllcbiAgdmFyIGxlbmd0aCA9IE1hdGguc3FydCh3aWR0aCAqIHdpZHRoICsgaGVpZ2h0ICogaGVpZ2h0KVxuICBvdXRwdXQuY2VudGVyLnNldChtaW5YICsgd2lkdGggLyAyLCBtaW5ZICsgaGVpZ2h0IC8gMiwgMClcbiAgb3V0cHV0LnJhZGl1cyA9IGxlbmd0aCAvIDJcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi90aHJlZS1ibWZvbnQtdGV4dC9saWIvdXRpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDIxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciB4aHIgPSByZXF1aXJlKCd4aHInKVxudmFyIG5vb3AgPSBmdW5jdGlvbigpe31cbnZhciBwYXJzZUFTQ0lJID0gcmVxdWlyZSgncGFyc2UtYm1mb250LWFzY2lpJylcbnZhciBwYXJzZVhNTCA9IHJlcXVpcmUoJ3BhcnNlLWJtZm9udC14bWwnKVxudmFyIHJlYWRCaW5hcnkgPSByZXF1aXJlKCdwYXJzZS1ibWZvbnQtYmluYXJ5JylcbnZhciBpc0JpbmFyeUZvcm1hdCA9IHJlcXVpcmUoJy4vbGliL2lzLWJpbmFyeScpXG52YXIgeHRlbmQgPSByZXF1aXJlKCd4dGVuZCcpXG5cbnZhciB4bWwyID0gKGZ1bmN0aW9uIGhhc1hNTDIoKSB7XG4gIHJldHVybiBzZWxmLlhNTEh0dHBSZXF1ZXN0ICYmIFwid2l0aENyZWRlbnRpYWxzXCIgaW4gbmV3IFhNTEh0dHBSZXF1ZXN0XG59KSgpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0LCBjYikge1xuICBjYiA9IHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJyA/IGNiIDogbm9vcFxuXG4gIGlmICh0eXBlb2Ygb3B0ID09PSAnc3RyaW5nJylcbiAgICBvcHQgPSB7IHVyaTogb3B0IH1cbiAgZWxzZSBpZiAoIW9wdClcbiAgICBvcHQgPSB7fVxuXG4gIHZhciBleHBlY3RCaW5hcnkgPSBvcHQuYmluYXJ5XG4gIGlmIChleHBlY3RCaW5hcnkpXG4gICAgb3B0ID0gZ2V0QmluYXJ5T3B0cyhvcHQpXG5cbiAgeGhyKG9wdCwgZnVuY3Rpb24oZXJyLCByZXMsIGJvZHkpIHtcbiAgICBpZiAoZXJyKVxuICAgICAgcmV0dXJuIGNiKGVycilcbiAgICBpZiAoIS9eMi8udGVzdChyZXMuc3RhdHVzQ29kZSkpXG4gICAgICByZXR1cm4gY2IobmV3IEVycm9yKCdodHRwIHN0YXR1cyBjb2RlOiAnK3Jlcy5zdGF0dXNDb2RlKSlcbiAgICBpZiAoIWJvZHkpXG4gICAgICByZXR1cm4gY2IobmV3IEVycm9yKCdubyBib2R5IHJlc3VsdCcpKVxuXG4gICAgdmFyIGJpbmFyeSA9IGZhbHNlIFxuXG4gICAgLy9pZiB0aGUgcmVzcG9uc2UgdHlwZSBpcyBhbiBhcnJheSBidWZmZXIsXG4gICAgLy93ZSBuZWVkIHRvIGNvbnZlcnQgaXQgaW50byBhIHJlZ3VsYXIgQnVmZmVyIG9iamVjdFxuICAgIGlmIChpc0FycmF5QnVmZmVyKGJvZHkpKSB7XG4gICAgICB2YXIgYXJyYXkgPSBuZXcgVWludDhBcnJheShib2R5KVxuICAgICAgYm9keSA9IG5ldyBCdWZmZXIoYXJyYXksICdiaW5hcnknKVxuICAgIH1cblxuICAgIC8vbm93IGNoZWNrIHRoZSBzdHJpbmcvQnVmZmVyIHJlc3BvbnNlXG4gICAgLy9hbmQgc2VlIGlmIGl0IGhhcyBhIGJpbmFyeSBCTUYgaGVhZGVyXG4gICAgaWYgKGlzQmluYXJ5Rm9ybWF0KGJvZHkpKSB7XG4gICAgICBiaW5hcnkgPSB0cnVlXG4gICAgICAvL2lmIHdlIGhhdmUgYSBzdHJpbmcsIHR1cm4gaXQgaW50byBhIEJ1ZmZlclxuICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykgXG4gICAgICAgIGJvZHkgPSBuZXcgQnVmZmVyKGJvZHksICdiaW5hcnknKVxuICAgIH0gXG5cbiAgICAvL3dlIGFyZSBub3QgcGFyc2luZyBhIGJpbmFyeSBmb3JtYXQsIGp1c3QgQVNDSUkvWE1ML2V0Y1xuICAgIGlmICghYmluYXJ5KSB7XG4gICAgICAvL21pZ2h0IHN0aWxsIGJlIGEgYnVmZmVyIGlmIHJlc3BvbnNlVHlwZSBpcyAnYXJyYXlidWZmZXInXG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKGJvZHkpKVxuICAgICAgICBib2R5ID0gYm9keS50b1N0cmluZyhvcHQuZW5jb2RpbmcpXG4gICAgICBib2R5ID0gYm9keS50cmltKClcbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0XG4gICAgdHJ5IHtcbiAgICAgIHZhciB0eXBlID0gcmVzLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddXG4gICAgICBpZiAoYmluYXJ5KVxuICAgICAgICByZXN1bHQgPSByZWFkQmluYXJ5KGJvZHkpXG4gICAgICBlbHNlIGlmICgvanNvbi8udGVzdCh0eXBlKSB8fCBib2R5LmNoYXJBdCgwKSA9PT0gJ3snKVxuICAgICAgICByZXN1bHQgPSBKU09OLnBhcnNlKGJvZHkpXG4gICAgICBlbHNlIGlmICgveG1sLy50ZXN0KHR5cGUpICB8fCBib2R5LmNoYXJBdCgwKSA9PT0gJzwnKVxuICAgICAgICByZXN1bHQgPSBwYXJzZVhNTChib2R5KVxuICAgICAgZWxzZVxuICAgICAgICByZXN1bHQgPSBwYXJzZUFTQ0lJKGJvZHkpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY2IobmV3IEVycm9yKCdlcnJvciBwYXJzaW5nIGZvbnQgJytlLm1lc3NhZ2UpKVxuICAgICAgY2IgPSBub29wXG4gICAgfVxuICAgIGNiKG51bGwsIHJlc3VsdClcbiAgfSlcbn1cblxuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcihhcnIpIHtcbiAgdmFyIHN0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdcbiAgcmV0dXJuIHN0ci5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSdcbn1cblxuZnVuY3Rpb24gZ2V0QmluYXJ5T3B0cyhvcHQpIHtcbiAgLy9JRTEwKyBhbmQgb3RoZXIgbW9kZXJuIGJyb3dzZXJzIHN1cHBvcnQgYXJyYXkgYnVmZmVyc1xuICBpZiAoeG1sMilcbiAgICByZXR1cm4geHRlbmQob3B0LCB7IHJlc3BvbnNlVHlwZTogJ2FycmF5YnVmZmVyJyB9KVxuICBcbiAgaWYgKHR5cGVvZiBzZWxmLlhNTEh0dHBSZXF1ZXN0ID09PSAndW5kZWZpbmVkJylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3lvdXIgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IFhIUiBsb2FkaW5nJylcblxuICAvL0lFOSBhbmQgWE1MMSBicm93c2VycyBjb3VsZCBzdGlsbCB1c2UgYW4gb3ZlcnJpZGVcbiAgdmFyIHJlcSA9IG5ldyBzZWxmLlhNTEh0dHBSZXF1ZXN0KClcbiAgcmVxLm92ZXJyaWRlTWltZVR5cGUoJ3RleHQvcGxhaW47IGNoYXJzZXQ9eC11c2VyLWRlZmluZWQnKVxuICByZXR1cm4geHRlbmQoe1xuICAgIHhocjogcmVxXG4gIH0sIG9wdClcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2FkLWJtZm9udC9icm93c2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAyMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCdpc2FycmF5JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IFNsb3dCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuXG4vKipcbiAqIElmIGBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVGA6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChtb3N0IGNvbXBhdGlibGUsIGV2ZW4gSUU2KVxuICpcbiAqIEJyb3dzZXJzIHRoYXQgc3VwcG9ydCB0eXBlZCBhcnJheXMgYXJlIElFIDEwKywgRmlyZWZveCA0KywgQ2hyb21lIDcrLCBTYWZhcmkgNS4xKyxcbiAqIE9wZXJhIDExLjYrLCBpT1MgNC4yKy5cbiAqXG4gKiBEdWUgdG8gdmFyaW91cyBicm93c2VyIGJ1Z3MsIHNvbWV0aW1lcyB0aGUgT2JqZWN0IGltcGxlbWVudGF0aW9uIHdpbGwgYmUgdXNlZCBldmVuXG4gKiB3aGVuIHRoZSBicm93c2VyIHN1cHBvcnRzIHR5cGVkIGFycmF5cy5cbiAqXG4gKiBOb3RlOlxuICpcbiAqICAgLSBGaXJlZm94IDQtMjkgbGFja3Mgc3VwcG9ydCBmb3IgYWRkaW5nIG5ldyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsXG4gKiAgICAgU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzguXG4gKlxuICogICAtIENocm9tZSA5LTEwIGlzIG1pc3NpbmcgdGhlIGBUeXBlZEFycmF5LnByb3RvdHlwZS5zdWJhcnJheWAgZnVuY3Rpb24uXG4gKlxuICogICAtIElFMTAgaGFzIGEgYnJva2VuIGBUeXBlZEFycmF5LnByb3RvdHlwZS5zdWJhcnJheWAgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhcnJheXMgb2ZcbiAqICAgICBpbmNvcnJlY3QgbGVuZ3RoIGluIHNvbWUgc2l0dWF0aW9ucy5cblxuICogV2UgZGV0ZWN0IHRoZXNlIGJ1Z2d5IGJyb3dzZXJzIGFuZCBzZXQgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYCB0byBgZmFsc2VgIHNvIHRoZXlcbiAqIGdldCB0aGUgT2JqZWN0IGltcGxlbWVudGF0aW9uLCB3aGljaCBpcyBzbG93ZXIgYnV0IGJlaGF2ZXMgY29ycmVjdGx5LlxuICovXG5CdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCA9IGdsb2JhbC5UWVBFRF9BUlJBWV9TVVBQT1JUICE9PSB1bmRlZmluZWRcbiAgPyBnbG9iYWwuVFlQRURfQVJSQVlfU1VQUE9SVFxuICA6IHR5cGVkQXJyYXlTdXBwb3J0KClcblxuLypcbiAqIEV4cG9ydCBrTWF4TGVuZ3RoIGFmdGVyIHR5cGVkIGFycmF5IHN1cHBvcnQgaXMgZGV0ZXJtaW5lZC5cbiAqL1xuZXhwb3J0cy5rTWF4TGVuZ3RoID0ga01heExlbmd0aCgpXG5cbmZ1bmN0aW9uIHR5cGVkQXJyYXlTdXBwb3J0ICgpIHtcbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoMSlcbiAgICBhcnIuX19wcm90b19fID0ge19fcHJvdG9fXzogVWludDhBcnJheS5wcm90b3R5cGUsIGZvbzogZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfX1cbiAgICByZXR1cm4gYXJyLmZvbygpID09PSA0MiAmJiAvLyB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZFxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nICYmIC8vIGNocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICAgICAgICBhcnIuc3ViYXJyYXkoMSwgMSkuYnl0ZUxlbmd0aCA9PT0gMCAvLyBpZTEwIGhhcyBicm9rZW4gYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24ga01heExlbmd0aCAoKSB7XG4gIHJldHVybiBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVFxuICAgID8gMHg3ZmZmZmZmZlxuICAgIDogMHgzZmZmZmZmZlxufVxuXG5mdW5jdGlvbiBjcmVhdGVCdWZmZXIgKHRoYXQsIGxlbmd0aCkge1xuICBpZiAoa01heExlbmd0aCgpIDwgbGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgdHlwZWQgYXJyYXkgbGVuZ3RoJylcbiAgfVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSwgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICB0aGF0ID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKVxuICAgIHRoYXQuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gYW4gb2JqZWN0IGluc3RhbmNlIG9mIHRoZSBCdWZmZXIgY2xhc3NcbiAgICBpZiAodGhhdCA9PT0gbnVsbCkge1xuICAgICAgdGhhdCA9IG5ldyBCdWZmZXIobGVuZ3RoKVxuICAgIH1cbiAgICB0aGF0Lmxlbmd0aCA9IGxlbmd0aFxuICB9XG5cbiAgcmV0dXJuIHRoYXRcbn1cblxuLyoqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGhhdmUgdGhlaXJcbiAqIHByb3RvdHlwZSBjaGFuZ2VkIHRvIGBCdWZmZXIucHJvdG90eXBlYC4gRnVydGhlcm1vcmUsIGBCdWZmZXJgIGlzIGEgc3ViY2xhc3Mgb2ZcbiAqIGBVaW50OEFycmF5YCwgc28gdGhlIHJldHVybmVkIGluc3RhbmNlcyB3aWxsIGhhdmUgYWxsIHRoZSBub2RlIGBCdWZmZXJgIG1ldGhvZHNcbiAqIGFuZCB0aGUgYFVpbnQ4QXJyYXlgIG1ldGhvZHMuIFNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0XG4gKiByZXR1cm5zIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIFRoZSBgVWludDhBcnJheWAgcHJvdG90eXBlIHJlbWFpbnMgdW5tb2RpZmllZC5cbiAqL1xuXG5mdW5jdGlvbiBCdWZmZXIgKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgLy8gQ29tbW9uIGNhc2UuXG4gIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmdPck9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0lmIGVuY29kaW5nIGlzIHNwZWNpZmllZCB0aGVuIHRoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nJ1xuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gYWxsb2NVbnNhZmUodGhpcywgYXJnKVxuICB9XG4gIHJldHVybiBmcm9tKHRoaXMsIGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxuLy8gVE9ETzogTGVnYWN5LCBub3QgbmVlZGVkIGFueW1vcmUuIFJlbW92ZSBpbiBuZXh0IG1ham9yIHZlcnNpb24uXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBhcnJcbn1cblxuZnVuY3Rpb24gZnJvbSAodGhhdCwgdmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBhIG51bWJlcicpXG4gIH1cblxuICBpZiAodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUJ1ZmZlcih0aGF0LCB2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh0aGF0LCB2YWx1ZSwgZW5jb2RpbmdPck9mZnNldClcbiAgfVxuXG4gIHJldHVybiBmcm9tT2JqZWN0KHRoYXQsIHZhbHVlKVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uYWxseSBlcXVpdmFsZW50IHRvIEJ1ZmZlcihhcmcsIGVuY29kaW5nKSBidXQgdGhyb3dzIGEgVHlwZUVycm9yXG4gKiBpZiB2YWx1ZSBpcyBhIG51bWJlci5cbiAqIEJ1ZmZlci5mcm9tKHN0clssIGVuY29kaW5nXSlcbiAqIEJ1ZmZlci5mcm9tKGFycmF5KVxuICogQnVmZmVyLmZyb20oYnVmZmVyKVxuICogQnVmZmVyLmZyb20oYXJyYXlCdWZmZXJbLCBieXRlT2Zmc2V0WywgbGVuZ3RoXV0pXG4gKiovXG5CdWZmZXIuZnJvbSA9IGZ1bmN0aW9uICh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBmcm9tKG51bGwsIHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbmlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICBCdWZmZXIucHJvdG90eXBlLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXkucHJvdG90eXBlXG4gIEJ1ZmZlci5fX3Byb3RvX18gPSBVaW50OEFycmF5XG4gIGlmICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wuc3BlY2llcyAmJlxuICAgICAgQnVmZmVyW1N5bWJvbC5zcGVjaWVzXSA9PT0gQnVmZmVyKSB7XG4gICAgLy8gRml4IHN1YmFycmF5KCkgaW4gRVMyMDE2LiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL3B1bGwvOTdcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQnVmZmVyLCBTeW1ib2wuc3BlY2llcywge1xuICAgICAgdmFsdWU6IG51bGwsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFNpemUgKHNpemUpIHtcbiAgaWYgKHR5cGVvZiBzaXplICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wic2l6ZVwiIGFyZ3VtZW50IG11c3QgYmUgYSBudW1iZXInKVxuICB9IGVsc2UgaWYgKHNpemUgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1wic2l6ZVwiIGFyZ3VtZW50IG11c3Qgbm90IGJlIG5lZ2F0aXZlJylcbiAgfVxufVxuXG5mdW5jdGlvbiBhbGxvYyAodGhhdCwgc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICBpZiAoc2l6ZSA8PSAwKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplKVxuICB9XG4gIGlmIChmaWxsICE9PSB1bmRlZmluZWQpIHtcbiAgICAvLyBPbmx5IHBheSBhdHRlbnRpb24gdG8gZW5jb2RpbmcgaWYgaXQncyBhIHN0cmluZy4gVGhpc1xuICAgIC8vIHByZXZlbnRzIGFjY2lkZW50YWxseSBzZW5kaW5nIGluIGEgbnVtYmVyIHRoYXQgd291bGRcbiAgICAvLyBiZSBpbnRlcnByZXR0ZWQgYXMgYSBzdGFydCBvZmZzZXQuXG4gICAgcmV0dXJuIHR5cGVvZiBlbmNvZGluZyA9PT0gJ3N0cmluZydcbiAgICAgID8gY3JlYXRlQnVmZmVyKHRoYXQsIHNpemUpLmZpbGwoZmlsbCwgZW5jb2RpbmcpXG4gICAgICA6IGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplKS5maWxsKGZpbGwpXG4gIH1cbiAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplKVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqIGFsbG9jKHNpemVbLCBmaWxsWywgZW5jb2RpbmddXSlcbiAqKi9cbkJ1ZmZlci5hbGxvYyA9IGZ1bmN0aW9uIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICByZXR1cm4gYWxsb2MobnVsbCwgc2l6ZSwgZmlsbCwgZW5jb2RpbmcpXG59XG5cbmZ1bmN0aW9uIGFsbG9jVW5zYWZlICh0aGF0LCBzaXplKSB7XG4gIGFzc2VydFNpemUoc2l6ZSlcbiAgdGhhdCA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplIDwgMCA/IDAgOiBjaGVja2VkKHNpemUpIHwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2l6ZTsgKytpKSB7XG4gICAgICB0aGF0W2ldID0gMFxuICAgIH1cbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gQnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKG51bGwsIHNpemUpXG59XG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gU2xvd0J1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICovXG5CdWZmZXIuYWxsb2NVbnNhZmVTbG93ID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKG51bGwsIHNpemUpXG59XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHRoYXQsIHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycgfHwgZW5jb2RpbmcgPT09ICcnKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgfVxuXG4gIGlmICghQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJlbmNvZGluZ1wiIG11c3QgYmUgYSB2YWxpZCBzdHJpbmcgZW5jb2RpbmcnKVxuICB9XG5cbiAgdmFyIGxlbmd0aCA9IGJ5dGVMZW5ndGgoc3RyaW5nLCBlbmNvZGluZykgfCAwXG4gIHRoYXQgPSBjcmVhdGVCdWZmZXIodGhhdCwgbGVuZ3RoKVxuXG4gIHZhciBhY3R1YWwgPSB0aGF0LndyaXRlKHN0cmluZywgZW5jb2RpbmcpXG5cbiAgaWYgKGFjdHVhbCAhPT0gbGVuZ3RoKSB7XG4gICAgLy8gV3JpdGluZyBhIGhleCBzdHJpbmcsIGZvciBleGFtcGxlLCB0aGF0IGNvbnRhaW5zIGludmFsaWQgY2hhcmFjdGVycyB3aWxsXG4gICAgLy8gY2F1c2UgZXZlcnl0aGluZyBhZnRlciB0aGUgZmlyc3QgaW52YWxpZCBjaGFyYWN0ZXIgdG8gYmUgaWdub3JlZC4gKGUuZy5cbiAgICAvLyAnYWJ4eGNkJyB3aWxsIGJlIHRyZWF0ZWQgYXMgJ2FiJylcbiAgICB0aGF0ID0gdGhhdC5zbGljZSgwLCBhY3R1YWwpXG4gIH1cblxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlMaWtlICh0aGF0LCBhcnJheSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoIDwgMCA/IDAgOiBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIHRoYXQgPSBjcmVhdGVCdWZmZXIodGhhdCwgbGVuZ3RoKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgdGhhdFtpXSA9IGFycmF5W2ldICYgMjU1XG4gIH1cbiAgcmV0dXJuIHRoYXRcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5QnVmZmVyICh0aGF0LCBhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKSB7XG4gIGFycmF5LmJ5dGVMZW5ndGggLy8gdGhpcyB0aHJvd3MgaWYgYGFycmF5YCBpcyBub3QgYSB2YWxpZCBBcnJheUJ1ZmZlclxuXG4gIGlmIChieXRlT2Zmc2V0IDwgMCB8fCBhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdvZmZzZXRcXCcgaXMgb3V0IG9mIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQgKyAobGVuZ3RoIHx8IDApKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ2xlbmd0aFxcJyBpcyBvdXQgb2YgYm91bmRzJylcbiAgfVxuXG4gIGlmIChieXRlT2Zmc2V0ID09PSB1bmRlZmluZWQgJiYgbGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBhcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5KVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheSwgYnl0ZU9mZnNldClcbiAgfSBlbHNlIHtcbiAgICBhcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSwgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICB0aGF0ID0gYXJyYXlcbiAgICB0aGF0Ll9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIGFuIG9iamVjdCBpbnN0YW5jZSBvZiB0aGUgQnVmZmVyIGNsYXNzXG4gICAgdGhhdCA9IGZyb21BcnJheUxpa2UodGhhdCwgYXJyYXkpXG4gIH1cbiAgcmV0dXJuIHRoYXRcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAodGhhdCwgb2JqKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqKSkge1xuICAgIHZhciBsZW4gPSBjaGVja2VkKG9iai5sZW5ndGgpIHwgMFxuICAgIHRoYXQgPSBjcmVhdGVCdWZmZXIodGhhdCwgbGVuKVxuXG4gICAgaWYgKHRoYXQubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhhdFxuICAgIH1cblxuICAgIG9iai5jb3B5KHRoYXQsIDAsIDAsIGxlbilcbiAgICByZXR1cm4gdGhhdFxuICB9XG5cbiAgaWYgKG9iaikge1xuICAgIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICBvYmouYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHx8ICdsZW5ndGgnIGluIG9iaikge1xuICAgICAgaWYgKHR5cGVvZiBvYmoubGVuZ3RoICE9PSAnbnVtYmVyJyB8fCBpc25hbihvYmoubGVuZ3RoKSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHRoYXQsIDApXG4gICAgICB9XG4gICAgICByZXR1cm4gZnJvbUFycmF5TGlrZSh0aGF0LCBvYmopXG4gICAgfVxuXG4gICAgaWYgKG9iai50eXBlID09PSAnQnVmZmVyJyAmJiBpc0FycmF5KG9iai5kYXRhKSkge1xuICAgICAgcmV0dXJuIGZyb21BcnJheUxpa2UodGhhdCwgb2JqLmRhdGEpXG4gICAgfVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksIG9yIGFycmF5LWxpa2Ugb2JqZWN0LicpXG59XG5cbmZ1bmN0aW9uIGNoZWNrZWQgKGxlbmd0aCkge1xuICAvLyBOb3RlOiBjYW5ub3QgdXNlIGBsZW5ndGggPCBrTWF4TGVuZ3RoKClgIGhlcmUgYmVjYXVzZSB0aGF0IGZhaWxzIHdoZW5cbiAgLy8gbGVuZ3RoIGlzIE5hTiAod2hpY2ggaXMgb3RoZXJ3aXNlIGNvZXJjZWQgdG8gemVyby4pXG4gIGlmIChsZW5ndGggPj0ga01heExlbmd0aCgpKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gYWxsb2NhdGUgQnVmZmVyIGxhcmdlciB0aGFuIG1heGltdW0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemU6IDB4JyArIGtNYXhMZW5ndGgoKS50b1N0cmluZygxNikgKyAnIGJ5dGVzJylcbiAgfVxuICByZXR1cm4gbGVuZ3RoIHwgMFxufVxuXG5mdW5jdGlvbiBTbG93QnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKCtsZW5ndGggIT0gbGVuZ3RoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZXFlcWVxXG4gICAgbGVuZ3RoID0gMFxuICB9XG4gIHJldHVybiBCdWZmZXIuYWxsb2MoK2xlbmd0aClcbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIgKGIpIHtcbiAgcmV0dXJuICEhKGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlIChhLCBiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGEpIHx8ICFCdWZmZXIuaXNCdWZmZXIoYikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgbXVzdCBiZSBCdWZmZXJzJylcbiAgfVxuXG4gIGlmIChhID09PSBiKSByZXR1cm4gMFxuXG4gIHZhciB4ID0gYS5sZW5ndGhcbiAgdmFyIHkgPSBiLmxlbmd0aFxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBNYXRoLm1pbih4LCB5KTsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKGFbaV0gIT09IGJbaV0pIHtcbiAgICAgIHggPSBhW2ldXG4gICAgICB5ID0gYltpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gaXNFbmNvZGluZyAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnbGF0aW4xJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiBjb25jYXQgKGxpc3QsIGxlbmd0aCkge1xuICBpZiAoIWlzQXJyYXkobGlzdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5hbGxvYygwKVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICBsZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmZmVyID0gQnVmZmVyLmFsbG9jVW5zYWZlKGxlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgYnVmID0gbGlzdFtpXVxuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gICAgfVxuICAgIGJ1Zi5jb3B5KGJ1ZmZlciwgcG9zKVxuICAgIHBvcyArPSBidWYubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZmZlclxufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIoc3RyaW5nKSkge1xuICAgIHJldHVybiBzdHJpbmcubGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIEFycmF5QnVmZmVyLmlzVmlldyA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgKEFycmF5QnVmZmVyLmlzVmlldyhzdHJpbmcpIHx8IHN0cmluZyBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSkge1xuICAgIHJldHVybiBzdHJpbmcuYnl0ZUxlbmd0aFxuICB9XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuICAgIHN0cmluZyA9ICcnICsgc3RyaW5nXG4gIH1cblxuICB2YXIgbGVuID0gc3RyaW5nLmxlbmd0aFxuICBpZiAobGVuID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIFVzZSBhIGZvciBsb29wIHRvIGF2b2lkIHJlY3Vyc2lvblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsZW5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICAgIHJldHVybiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIGxlbiAqIDJcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBsZW4gPj4+IDFcbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHJldHVybiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aCAvLyBhc3N1bWUgdXRmOFxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuQnVmZmVyLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5cbmZ1bmN0aW9uIHNsb3dUb1N0cmluZyAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICAvLyBObyBuZWVkIHRvIHZlcmlmeSB0aGF0IFwidGhpcy5sZW5ndGggPD0gTUFYX1VJTlQzMlwiIHNpbmNlIGl0J3MgYSByZWFkLW9ubHlcbiAgLy8gcHJvcGVydHkgb2YgYSB0eXBlZCBhcnJheS5cblxuICAvLyBUaGlzIGJlaGF2ZXMgbmVpdGhlciBsaWtlIFN0cmluZyBub3IgVWludDhBcnJheSBpbiB0aGF0IHdlIHNldCBzdGFydC9lbmRcbiAgLy8gdG8gdGhlaXIgdXBwZXIvbG93ZXIgYm91bmRzIGlmIHRoZSB2YWx1ZSBwYXNzZWQgaXMgb3V0IG9mIHJhbmdlLlxuICAvLyB1bmRlZmluZWQgaXMgaGFuZGxlZCBzcGVjaWFsbHkgYXMgcGVyIEVDTUEtMjYyIDZ0aCBFZGl0aW9uLFxuICAvLyBTZWN0aW9uIDEzLjMuMy43IFJ1bnRpbWUgU2VtYW50aWNzOiBLZXllZEJpbmRpbmdJbml0aWFsaXphdGlvbi5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQgfHwgc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgLy8gUmV0dXJuIGVhcmx5IGlmIHN0YXJ0ID4gdGhpcy5sZW5ndGguIERvbmUgaGVyZSB0byBwcmV2ZW50IHBvdGVudGlhbCB1aW50MzJcbiAgLy8gY29lcmNpb24gZmFpbCBiZWxvdy5cbiAgaWYgKHN0YXJ0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCB8fCBlbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoZW5kIDw9IDApIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIC8vIEZvcmNlIGNvZXJzaW9uIHRvIHVpbnQzMi4gVGhpcyB3aWxsIGFsc28gY29lcmNlIGZhbHNleS9OYU4gdmFsdWVzIHRvIDAuXG4gIGVuZCA+Pj49IDBcbiAgc3RhcnQgPj4+PSAwXG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1dGYxNmxlU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbi8vIFRoZSBwcm9wZXJ0eSBpcyB1c2VkIGJ5IGBCdWZmZXIuaXNCdWZmZXJgIGFuZCBgaXMtYnVmZmVyYCAoaW4gU2FmYXJpIDUtNykgdG8gZGV0ZWN0XG4vLyBCdWZmZXIgaW5zdGFuY2VzLlxuQnVmZmVyLnByb3RvdHlwZS5faXNCdWZmZXIgPSB0cnVlXG5cbmZ1bmN0aW9uIHN3YXAgKGIsIG4sIG0pIHtcbiAgdmFyIGkgPSBiW25dXG4gIGJbbl0gPSBiW21dXG4gIGJbbV0gPSBpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDE2ID0gZnVuY3Rpb24gc3dhcDE2ICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSAyICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAxNi1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSAyKSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgMSlcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAzMiA9IGZ1bmN0aW9uIHN3YXAzMiAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgNCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMzItYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDMpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDIpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwNjQgPSBmdW5jdGlvbiBzd2FwNjQgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDggIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDY0LWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDgpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyA3KVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyA2KVxuICAgIHN3YXAodGhpcywgaSArIDIsIGkgKyA1KVxuICAgIHN3YXAodGhpcywgaSArIDMsIGkgKyA0KVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAoKSB7XG4gIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aCB8IDBcbiAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIDAsIGxlbmd0aClcbiAgcmV0dXJuIHNsb3dUb1N0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBtYXggPSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTXG4gIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICBzdHIgPSB0aGlzLnRvU3RyaW5nKCdoZXgnLCAwLCBtYXgpLm1hdGNoKC8uezJ9L2cpLmpvaW4oJyAnKVxuICAgIGlmICh0aGlzLmxlbmd0aCA+IG1heCkgc3RyICs9ICcgLi4uICdcbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIHN0ciArICc+J1xufVxuXG5CdWZmZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlICh0YXJnZXQsIHN0YXJ0LCBlbmQsIHRoaXNTdGFydCwgdGhpc0VuZCkge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0YXJnZXQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIH1cblxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuZCA9IHRhcmdldCA/IHRhcmdldC5sZW5ndGggOiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc1N0YXJ0ID0gMFxuICB9XG4gIGlmICh0aGlzRW5kID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzRW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChzdGFydCA8IDAgfHwgZW5kID4gdGFyZ2V0Lmxlbmd0aCB8fCB0aGlzU3RhcnQgPCAwIHx8IHRoaXNFbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdvdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kICYmIHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kKSB7XG4gICAgcmV0dXJuIC0xXG4gIH1cbiAgaWYgKHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAxXG4gIH1cblxuICBzdGFydCA+Pj49IDBcbiAgZW5kID4+Pj0gMFxuICB0aGlzU3RhcnQgPj4+PSAwXG4gIHRoaXNFbmQgPj4+PSAwXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCkgcmV0dXJuIDBcblxuICB2YXIgeCA9IHRoaXNFbmQgLSB0aGlzU3RhcnRcbiAgdmFyIHkgPSBlbmQgLSBzdGFydFxuICB2YXIgbGVuID0gTWF0aC5taW4oeCwgeSlcblxuICB2YXIgdGhpc0NvcHkgPSB0aGlzLnNsaWNlKHRoaXNTdGFydCwgdGhpc0VuZClcbiAgdmFyIHRhcmdldENvcHkgPSB0YXJnZXQuc2xpY2Uoc3RhcnQsIGVuZClcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKHRoaXNDb3B5W2ldICE9PSB0YXJnZXRDb3B5W2ldKSB7XG4gICAgICB4ID0gdGhpc0NvcHlbaV1cbiAgICAgIHkgPSB0YXJnZXRDb3B5W2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuLy8gRmluZHMgZWl0aGVyIHRoZSBmaXJzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPj0gYGJ5dGVPZmZzZXRgLFxuLy8gT1IgdGhlIGxhc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0IDw9IGBieXRlT2Zmc2V0YC5cbi8vXG4vLyBBcmd1bWVudHM6XG4vLyAtIGJ1ZmZlciAtIGEgQnVmZmVyIHRvIHNlYXJjaFxuLy8gLSB2YWwgLSBhIHN0cmluZywgQnVmZmVyLCBvciBudW1iZXJcbi8vIC0gYnl0ZU9mZnNldCAtIGFuIGluZGV4IGludG8gYGJ1ZmZlcmA7IHdpbGwgYmUgY2xhbXBlZCB0byBhbiBpbnQzMlxuLy8gLSBlbmNvZGluZyAtIGFuIG9wdGlvbmFsIGVuY29kaW5nLCByZWxldmFudCBpcyB2YWwgaXMgYSBzdHJpbmdcbi8vIC0gZGlyIC0gdHJ1ZSBmb3IgaW5kZXhPZiwgZmFsc2UgZm9yIGxhc3RJbmRleE9mXG5mdW5jdGlvbiBiaWRpcmVjdGlvbmFsSW5kZXhPZiAoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgLy8gRW1wdHkgYnVmZmVyIG1lYW5zIG5vIG1hdGNoXG4gIGlmIChidWZmZXIubGVuZ3RoID09PSAwKSByZXR1cm4gLTFcblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldFxuICBpZiAodHlwZW9mIGJ5dGVPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBieXRlT2Zmc2V0XG4gICAgYnl0ZU9mZnNldCA9IDBcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0ID4gMHg3ZmZmZmZmZikge1xuICAgIGJ5dGVPZmZzZXQgPSAweDdmZmZmZmZmXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IC0weDgwMDAwMDAwKSB7XG4gICAgYnl0ZU9mZnNldCA9IC0weDgwMDAwMDAwXG4gIH1cbiAgYnl0ZU9mZnNldCA9ICtieXRlT2Zmc2V0ICAvLyBDb2VyY2UgdG8gTnVtYmVyLlxuICBpZiAoaXNOYU4oYnl0ZU9mZnNldCkpIHtcbiAgICAvLyBieXRlT2Zmc2V0OiBpdCBpdCdzIHVuZGVmaW5lZCwgbnVsbCwgTmFOLCBcImZvb1wiLCBldGMsIHNlYXJjaCB3aG9sZSBidWZmZXJcbiAgICBieXRlT2Zmc2V0ID0gZGlyID8gMCA6IChidWZmZXIubGVuZ3RoIC0gMSlcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0OiBuZWdhdGl2ZSBvZmZzZXRzIHN0YXJ0IGZyb20gdGhlIGVuZCBvZiB0aGUgYnVmZmVyXG4gIGlmIChieXRlT2Zmc2V0IDwgMCkgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggKyBieXRlT2Zmc2V0XG4gIGlmIChieXRlT2Zmc2V0ID49IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICBpZiAoZGlyKSByZXR1cm4gLTFcbiAgICBlbHNlIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoIC0gMVxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAwKSB7XG4gICAgaWYgKGRpcikgYnl0ZU9mZnNldCA9IDBcbiAgICBlbHNlIHJldHVybiAtMVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIHZhbFxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWwgPSBCdWZmZXIuZnJvbSh2YWwsIGVuY29kaW5nKVxuICB9XG5cbiAgLy8gRmluYWxseSwgc2VhcmNoIGVpdGhlciBpbmRleE9mIChpZiBkaXIgaXMgdHJ1ZSkgb3IgbGFzdEluZGV4T2ZcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcih2YWwpKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlOiBsb29raW5nIGZvciBlbXB0eSBzdHJpbmcvYnVmZmVyIGFsd2F5cyBmYWlsc1xuICAgIGlmICh2YWwubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDB4RkYgLy8gU2VhcmNoIGZvciBhIGJ5dGUgdmFsdWUgWzAtMjU1XVxuICAgIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCAmJlxuICAgICAgICB0eXBlb2YgVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKGRpcikge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCBbIHZhbCBdLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsIG11c3QgYmUgc3RyaW5nLCBudW1iZXIgb3IgQnVmZmVyJylcbn1cblxuZnVuY3Rpb24gYXJyYXlJbmRleE9mIChhcnIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICB2YXIgaW5kZXhTaXplID0gMVxuICB2YXIgYXJyTGVuZ3RoID0gYXJyLmxlbmd0aFxuICB2YXIgdmFsTGVuZ3RoID0gdmFsLmxlbmd0aFxuXG4gIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICBpZiAoZW5jb2RpbmcgPT09ICd1Y3MyJyB8fCBlbmNvZGluZyA9PT0gJ3Vjcy0yJyB8fFxuICAgICAgICBlbmNvZGluZyA9PT0gJ3V0ZjE2bGUnIHx8IGVuY29kaW5nID09PSAndXRmLTE2bGUnKSB7XG4gICAgICBpZiAoYXJyLmxlbmd0aCA8IDIgfHwgdmFsLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICB9XG4gICAgICBpbmRleFNpemUgPSAyXG4gICAgICBhcnJMZW5ndGggLz0gMlxuICAgICAgdmFsTGVuZ3RoIC89IDJcbiAgICAgIGJ5dGVPZmZzZXQgLz0gMlxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWQgKGJ1ZiwgaSkge1xuICAgIGlmIChpbmRleFNpemUgPT09IDEpIHtcbiAgICAgIHJldHVybiBidWZbaV1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGJ1Zi5yZWFkVUludDE2QkUoaSAqIGluZGV4U2l6ZSlcbiAgICB9XG4gIH1cblxuICB2YXIgaVxuICBpZiAoZGlyKSB7XG4gICAgdmFyIGZvdW5kSW5kZXggPSAtMVxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPCBhcnJMZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJlYWQoYXJyLCBpKSA9PT0gcmVhZCh2YWwsIGZvdW5kSW5kZXggPT09IC0xID8gMCA6IGkgLSBmb3VuZEluZGV4KSkge1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGZvdW5kSW5kZXggPSBpXG4gICAgICAgIGlmIChpIC0gZm91bmRJbmRleCArIDEgPT09IHZhbExlbmd0aCkgcmV0dXJuIGZvdW5kSW5kZXggKiBpbmRleFNpemVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ICE9PSAtMSkgaSAtPSBpIC0gZm91bmRJbmRleFxuICAgICAgICBmb3VuZEluZGV4ID0gLTFcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGJ5dGVPZmZzZXQgKyB2YWxMZW5ndGggPiBhcnJMZW5ndGgpIGJ5dGVPZmZzZXQgPSBhcnJMZW5ndGggLSB2YWxMZW5ndGhcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIGZvdW5kID0gdHJ1ZVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWxMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAocmVhZChhcnIsIGkgKyBqKSAhPT0gcmVhZCh2YWwsIGopKSB7XG4gICAgICAgICAgZm91bmQgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiB0aGlzLmluZGV4T2YodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykgIT09IC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIGluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIHRydWUpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUubGFzdEluZGV4T2YgPSBmdW5jdGlvbiBsYXN0SW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIGhleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKHN0ckxlbiAlIDIgIT09IDApIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIHZhciBwYXJzZWQgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgaWYgKGlzTmFOKHBhcnNlZCkpIHJldHVybiBpXG4gICAgYnVmW29mZnNldCArIGldID0gcGFyc2VkXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBsYXRpbjFXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBhc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIHVjczJXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiB3cml0ZSAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZylcbiAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBvZmZzZXRbLCBsZW5ndGhdWywgZW5jb2RpbmddKVxuICB9IGVsc2UgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gICAgaWYgKGlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGxlbmd0aCA9IGxlbmd0aCB8IDBcbiAgICAgIGlmIChlbmNvZGluZyA9PT0gdW5kZWZpbmVkKSBlbmNvZGluZyA9ICd1dGY4J1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICAvLyBsZWdhY3kgd3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpIC0gcmVtb3ZlIGluIHYwLjEzXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0J1ZmZlci53cml0ZShzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXRbLCBsZW5ndGhdKSBpcyBubyBsb25nZXIgc3VwcG9ydGVkJ1xuICAgIClcbiAgfVxuXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbGVuZ3RoID4gcmVtYWluaW5nKSBsZW5ndGggPSByZW1haW5pbmdcblxuICBpZiAoKHN0cmluZy5sZW5ndGggPiAwICYmIChsZW5ndGggPCAwIHx8IG9mZnNldCA8IDApKSB8fCBvZmZzZXQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIHdyaXRlIG91dHNpZGUgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIC8vIFdhcm5pbmc6IG1heExlbmd0aCBub3QgdGFrZW4gaW50byBhY2NvdW50IGluIGJhc2U2NFdyaXRlXG4gICAgICAgIHJldHVybiBiYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdWNzMldyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuZnVuY3Rpb24gYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHV0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcbiAgdmFyIHJlcyA9IFtdXG5cbiAgdmFyIGkgPSBzdGFydFxuICB3aGlsZSAoaSA8IGVuZCkge1xuICAgIHZhciBmaXJzdEJ5dGUgPSBidWZbaV1cbiAgICB2YXIgY29kZVBvaW50ID0gbnVsbFxuICAgIHZhciBieXRlc1BlclNlcXVlbmNlID0gKGZpcnN0Qnl0ZSA+IDB4RUYpID8gNFxuICAgICAgOiAoZmlyc3RCeXRlID4gMHhERikgPyAzXG4gICAgICA6IChmaXJzdEJ5dGUgPiAweEJGKSA/IDJcbiAgICAgIDogMVxuXG4gICAgaWYgKGkgKyBieXRlc1BlclNlcXVlbmNlIDw9IGVuZCkge1xuICAgICAgdmFyIHNlY29uZEJ5dGUsIHRoaXJkQnl0ZSwgZm91cnRoQnl0ZSwgdGVtcENvZGVQb2ludFxuXG4gICAgICBzd2l0Y2ggKGJ5dGVzUGVyU2VxdWVuY2UpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlmIChmaXJzdEJ5dGUgPCAweDgwKSB7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSBmaXJzdEJ5dGVcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHgxRikgPDwgMHg2IHwgKHNlY29uZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4QyB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKHRoaXJkQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0ZGICYmICh0ZW1wQ29kZVBvaW50IDwgMHhEODAwIHx8IHRlbXBDb2RlUG9pbnQgPiAweERGRkYpKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGZvdXJ0aEJ5dGUgPSBidWZbaSArIDNdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwICYmIChmb3VydGhCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweDEyIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweEMgfCAodGhpcmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKGZvdXJ0aEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweEZGRkYgJiYgdGVtcENvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvZGVQb2ludCA9PT0gbnVsbCkge1xuICAgICAgLy8gd2UgZGlkIG5vdCBnZW5lcmF0ZSBhIHZhbGlkIGNvZGVQb2ludCBzbyBpbnNlcnQgYVxuICAgICAgLy8gcmVwbGFjZW1lbnQgY2hhciAoVStGRkZEKSBhbmQgYWR2YW5jZSBvbmx5IDEgYnl0ZVxuICAgICAgY29kZVBvaW50ID0gMHhGRkZEXG4gICAgICBieXRlc1BlclNlcXVlbmNlID0gMVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50ID4gMHhGRkZGKSB7XG4gICAgICAvLyBlbmNvZGUgdG8gdXRmMTYgKHN1cnJvZ2F0ZSBwYWlyIGRhbmNlKVxuICAgICAgY29kZVBvaW50IC09IDB4MTAwMDBcbiAgICAgIHJlcy5wdXNoKGNvZGVQb2ludCA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMClcbiAgICAgIGNvZGVQb2ludCA9IDB4REMwMCB8IGNvZGVQb2ludCAmIDB4M0ZGXG4gICAgfVxuXG4gICAgcmVzLnB1c2goY29kZVBvaW50KVxuICAgIGkgKz0gYnl0ZXNQZXJTZXF1ZW5jZVxuICB9XG5cbiAgcmV0dXJuIGRlY29kZUNvZGVQb2ludHNBcnJheShyZXMpXG59XG5cbi8vIEJhc2VkIG9uIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyNzQ3MjcyLzY4MDc0MiwgdGhlIGJyb3dzZXIgd2l0aFxuLy8gdGhlIGxvd2VzdCBsaW1pdCBpcyBDaHJvbWUsIHdpdGggMHgxMDAwMCBhcmdzLlxuLy8gV2UgZ28gMSBtYWduaXR1ZGUgbGVzcywgZm9yIHNhZmV0eVxudmFyIE1BWF9BUkdVTUVOVFNfTEVOR1RIID0gMHgxMDAwXG5cbmZ1bmN0aW9uIGRlY29kZUNvZGVQb2ludHNBcnJheSAoY29kZVBvaW50cykge1xuICB2YXIgbGVuID0gY29kZVBvaW50cy5sZW5ndGhcbiAgaWYgKGxlbiA8PSBNQVhfQVJHVU1FTlRTX0xFTkdUSCkge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFN0cmluZywgY29kZVBvaW50cykgLy8gYXZvaWQgZXh0cmEgc2xpY2UoKVxuICB9XG5cbiAgLy8gRGVjb2RlIGluIGNodW5rcyB0byBhdm9pZCBcImNhbGwgc3RhY2sgc2l6ZSBleGNlZWRlZFwiLlxuICB2YXIgcmVzID0gJydcbiAgdmFyIGkgPSAwXG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoXG4gICAgICBTdHJpbmcsXG4gICAgICBjb2RlUG9pbnRzLnNsaWNlKGksIGkgKz0gTUFYX0FSR1VNRU5UU19MRU5HVEgpXG4gICAgKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0gJiAweDdGKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gbGF0aW4xU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2kgKyAxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiBzbGljZSAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICB2YXIgbmV3QnVmXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIG5ld0J1ZiA9IHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZClcbiAgICBuZXdCdWYuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47ICsraSkge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG4vKlxuICogTmVlZCB0byBtYWtlIHN1cmUgdGhhdCBidWZmZXIgaXNuJ3QgdHJ5aW5nIHRvIHdyaXRlIG91dCBvZiBib3VuZHMuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChvZmZzZXQsIGV4dCwgbGVuZ3RoKSB7XG4gIGlmICgob2Zmc2V0ICUgMSkgIT09IDAgfHwgb2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludExFID0gZnVuY3Rpb24gcmVhZFVJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludEJFID0gZnVuY3Rpb24gcmVhZFVJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcbiAgfVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF1cbiAgdmFyIG11bCA9IDFcbiAgd2hpbGUgKGJ5dGVMZW5ndGggPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIHJlYWRVSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCA4KSB8IHRoaXNbb2Zmc2V0ICsgMV1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiByZWFkVUludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKCh0aGlzW29mZnNldF0pIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSkgK1xuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gKiAweDEwMDAwMDApXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAoKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50TEUgPSBmdW5jdGlvbiByZWFkSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50QkUgPSBmdW5jdGlvbiByZWFkSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgaSA9IGJ5dGVMZW5ndGhcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1pXVxuICB3aGlsZSAoaSA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIHJlYWRJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIGlmICghKHRoaXNbb2Zmc2V0XSAmIDB4ODApKSByZXR1cm4gKHRoaXNbb2Zmc2V0XSlcbiAgcmV0dXJuICgoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTEpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiByZWFkSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gcmVhZEludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgMV0gfCAodGhpc1tvZmZzZXRdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0pIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSA8PCAyNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdExFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdEJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gcmVhZERvdWJsZUxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiByZWFkRG91YmxlQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImJ1ZmZlclwiIGFyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXIgaW5zdGFuY2UnKVxuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlVUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlVUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVVSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweGZmLCAwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbmZ1bmN0aW9uIG9iamVjdFdyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbikge1xuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZiArIHZhbHVlICsgMVxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGJ1Zi5sZW5ndGggLSBvZmZzZXQsIDIpOyBpIDwgajsgKytpKSB7XG4gICAgYnVmW29mZnNldCArIGldID0gKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbmZ1bmN0aW9uIG9iamVjdFdyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbikge1xuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCA0KTsgaSA8IGo7ICsraSkge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBsaW1pdCA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgdmFyIGkgPSAwXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSAtIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBsaW1pdCA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gMFxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSArIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5mdW5jdGlvbiBjaGVja0lFRUU3NTQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG4gIGlmIChvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA0LCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA4LCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxuICByZXR1cm4gb2Zmc2V0ICsgOFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uIGNvcHkgKHRhcmdldCwgdGFyZ2V0U3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldFN0YXJ0ID49IHRhcmdldC5sZW5ndGgpIHRhcmdldFN0YXJ0ID0gdGFyZ2V0Lmxlbmd0aFxuICBpZiAoIXRhcmdldFN0YXJ0KSB0YXJnZXRTdGFydCA9IDBcbiAgaWYgKGVuZCA+IDAgJiYgZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm4gMFxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCB0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGlmICh0YXJnZXRTdGFydCA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcigndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIH1cbiAgaWYgKHN0YXJ0IDwgMCB8fCBzdGFydCA+PSB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoZW5kIDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgPCBlbmQgLSBzdGFydCkge1xuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCArIHN0YXJ0XG4gIH1cblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcbiAgdmFyIGlcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0ICYmIHN0YXJ0IDwgdGFyZ2V0U3RhcnQgJiYgdGFyZ2V0U3RhcnQgPCBlbmQpIHtcbiAgICAvLyBkZXNjZW5kaW5nIGNvcHkgZnJvbSBlbmRcbiAgICBmb3IgKGkgPSBsZW4gLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSBpZiAobGVuIDwgMTAwMCB8fCAhQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAvLyBhc2NlbmRpbmcgY29weSBmcm9tIHN0YXJ0XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBVaW50OEFycmF5LnByb3RvdHlwZS5zZXQuY2FsbChcbiAgICAgIHRhcmdldCxcbiAgICAgIHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSxcbiAgICAgIHRhcmdldFN0YXJ0XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIGxlblxufVxuXG4vLyBVc2FnZTpcbi8vICAgIGJ1ZmZlci5maWxsKG51bWJlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoYnVmZmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChzdHJpbmdbLCBvZmZzZXRbLCBlbmRdXVssIGVuY29kaW5nXSlcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwgKHZhbCwgc3RhcnQsIGVuZCwgZW5jb2RpbmcpIHtcbiAgLy8gSGFuZGxlIHN0cmluZyBjYXNlczpcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gc3RhcnRcbiAgICAgIHN0YXJ0ID0gMFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IGVuZFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9XG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDEpIHtcbiAgICAgIHZhciBjb2RlID0gdmFsLmNoYXJDb2RlQXQoMClcbiAgICAgIGlmIChjb2RlIDwgMjU2KSB7XG4gICAgICAgIHZhbCA9IGNvZGVcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZW5jb2RpbmcgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnICYmICFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAyNTVcbiAgfVxuXG4gIC8vIEludmFsaWQgcmFuZ2VzIGFyZSBub3Qgc2V0IHRvIGEgZGVmYXVsdCwgc28gY2FuIHJhbmdlIGNoZWNrIGVhcmx5LlxuICBpZiAoc3RhcnQgPCAwIHx8IHRoaXMubGVuZ3RoIDwgc3RhcnQgfHwgdGhpcy5sZW5ndGggPCBlbmQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignT3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc3RhcnQgPSBzdGFydCA+Pj4gMFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IHRoaXMubGVuZ3RoIDogZW5kID4+PiAwXG5cbiAgaWYgKCF2YWwpIHZhbCA9IDBcblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgICB0aGlzW2ldID0gdmFsXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciBieXRlcyA9IEJ1ZmZlci5pc0J1ZmZlcih2YWwpXG4gICAgICA/IHZhbFxuICAgICAgOiB1dGY4VG9CeXRlcyhuZXcgQnVmZmVyKHZhbCwgZW5jb2RpbmcpLnRvU3RyaW5nKCkpXG4gICAgdmFyIGxlbiA9IGJ5dGVzLmxlbmd0aFxuICAgIGZvciAoaSA9IDA7IGkgPCBlbmQgLSBzdGFydDsgKytpKSB7XG4gICAgICB0aGlzW2kgKyBzdGFydF0gPSBieXRlc1tpICUgbGVuXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIElOVkFMSURfQkFTRTY0X1JFID0gL1teK1xcLzAtOUEtWmEtei1fXS9nXG5cbmZ1bmN0aW9uIGJhc2U2NGNsZWFuIChzdHIpIHtcbiAgLy8gTm9kZSBzdHJpcHMgb3V0IGludmFsaWQgY2hhcmFjdGVycyBsaWtlIFxcbiBhbmQgXFx0IGZyb20gdGhlIHN0cmluZywgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHN0ciA9IHN0cmluZ3RyaW0oc3RyKS5yZXBsYWNlKElOVkFMSURfQkFTRTY0X1JFLCAnJylcbiAgLy8gTm9kZSBjb252ZXJ0cyBzdHJpbmdzIHdpdGggbGVuZ3RoIDwgMiB0byAnJ1xuICBpZiAoc3RyLmxlbmd0aCA8IDIpIHJldHVybiAnJ1xuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgdmFyIGNvZGVQb2ludFxuICB2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aFxuICB2YXIgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcbiAgdmFyIGJ5dGVzID0gW11cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgY29kZVBvaW50ID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcblxuICAgIC8vIGlzIHN1cnJvZ2F0ZSBjb21wb25lbnRcbiAgICBpZiAoY29kZVBvaW50ID4gMHhEN0ZGICYmIGNvZGVQb2ludCA8IDB4RTAwMCkge1xuICAgICAgLy8gbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICghbGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgICAvLyBubyBsZWFkIHlldFxuICAgICAgICBpZiAoY29kZVBvaW50ID4gMHhEQkZGKSB7XG4gICAgICAgICAgLy8gdW5leHBlY3RlZCB0cmFpbFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSBpZiAoaSArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgIC8vIHVucGFpcmVkIGxlYWRcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFsaWQgbGVhZFxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gMiBsZWFkcyBpbiBhIHJvd1xuICAgICAgaWYgKGNvZGVQb2ludCA8IDB4REMwMCkge1xuICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyB2YWxpZCBzdXJyb2dhdGUgcGFpclxuICAgICAgY29kZVBvaW50ID0gKGxlYWRTdXJyb2dhdGUgLSAweEQ4MDAgPDwgMTAgfCBjb2RlUG9pbnQgLSAweERDMDApICsgMHgxMDAwMFxuICAgIH0gZWxzZSBpZiAobGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgLy8gdmFsaWQgYm1wIGNoYXIsIGJ1dCBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgfVxuXG4gICAgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcblxuICAgIC8vIGVuY29kZSB1dGY4XG4gICAgaWYgKGNvZGVQb2ludCA8IDB4ODApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMSkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChjb2RlUG9pbnQpXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDgwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2IHwgMHhDMCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyB8IDB4RTAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDQpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDEyIHwgMHhGMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb2RlIHBvaW50JylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnl0ZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0ciwgdW5pdHMpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcblxuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KGJhc2U2NGNsZWFuKHN0cikpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKSBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIGlzbmFuICh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gdmFsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1jb21wYXJlXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYnVmZmVyL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCdcblxuZXhwb3J0cy5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuZXhwb3J0cy50b0J5dGVBcnJheSA9IHRvQnl0ZUFycmF5XG5leHBvcnRzLmZyb21CeXRlQXJyYXkgPSBmcm9tQnl0ZUFycmF5XG5cbnZhciBsb29rdXAgPSBbXVxudmFyIHJldkxvb2t1cCA9IFtdXG52YXIgQXJyID0gdHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnID8gVWludDhBcnJheSA6IEFycmF5XG5cbnZhciBjb2RlID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nXG5mb3IgKHZhciBpID0gMCwgbGVuID0gY29kZS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICBsb29rdXBbaV0gPSBjb2RlW2ldXG4gIHJldkxvb2t1cFtjb2RlLmNoYXJDb2RlQXQoaSldID0gaVxufVxuXG5yZXZMb29rdXBbJy0nLmNoYXJDb2RlQXQoMCldID0gNjJcbnJldkxvb2t1cFsnXycuY2hhckNvZGVBdCgwKV0gPSA2M1xuXG5mdW5jdGlvbiBwbGFjZUhvbGRlcnNDb3VudCAoYjY0KSB7XG4gIHZhciBsZW4gPSBiNjQubGVuZ3RoXG4gIGlmIChsZW4gJSA0ID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG4gIH1cblxuICAvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuICAvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG4gIC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuICAvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcbiAgLy8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuICByZXR1cm4gYjY0W2xlbiAtIDJdID09PSAnPScgPyAyIDogYjY0W2xlbiAtIDFdID09PSAnPScgPyAxIDogMFxufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChiNjQpIHtcbiAgLy8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG4gIHJldHVybiBiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnNDb3VudChiNjQpXG59XG5cbmZ1bmN0aW9uIHRvQnl0ZUFycmF5IChiNjQpIHtcbiAgdmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcbiAgdmFyIGxlbiA9IGI2NC5sZW5ndGhcbiAgcGxhY2VIb2xkZXJzID0gcGxhY2VIb2xkZXJzQ291bnQoYjY0KVxuXG4gIGFyciA9IG5ldyBBcnIobGVuICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cbiAgLy8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuICBsID0gcGxhY2VIb2xkZXJzID4gMCA/IGxlbiAtIDQgOiBsZW5cblxuICB2YXIgTCA9IDBcblxuICBmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTgpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDEyKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA8PCA2KSB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMyldXG4gICAgYXJyW0wrK10gPSAodG1wID4+IDE2KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMikgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPj4gNClcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxMCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgNCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPj4gMilcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG4gIHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDYgJiAweDNGXSArIGxvb2t1cFtudW0gJiAweDNGXVxufVxuXG5mdW5jdGlvbiBlbmNvZGVDaHVuayAodWludDgsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHRtcFxuICB2YXIgb3V0cHV0ID0gW11cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IDMpIHtcbiAgICB0bXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG4gICAgb3V0cHV0LnB1c2godHJpcGxldFRvQmFzZTY0KHRtcCkpXG4gIH1cbiAgcmV0dXJuIG91dHB1dC5qb2luKCcnKVxufVxuXG5mdW5jdGlvbiBmcm9tQnl0ZUFycmF5ICh1aW50OCkge1xuICB2YXIgdG1wXG4gIHZhciBsZW4gPSB1aW50OC5sZW5ndGhcbiAgdmFyIGV4dHJhQnl0ZXMgPSBsZW4gJSAzIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG4gIHZhciBvdXRwdXQgPSAnJ1xuICB2YXIgcGFydHMgPSBbXVxuICB2YXIgbWF4Q2h1bmtMZW5ndGggPSAxNjM4MyAvLyBtdXN0IGJlIG11bHRpcGxlIG9mIDNcblxuICAvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG4gIGZvciAodmFyIGkgPSAwLCBsZW4yID0gbGVuIC0gZXh0cmFCeXRlczsgaSA8IGxlbjI7IGkgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcbiAgICBwYXJ0cy5wdXNoKGVuY29kZUNodW5rKHVpbnQ4LCBpLCAoaSArIG1heENodW5rTGVuZ3RoKSA+IGxlbjIgPyBsZW4yIDogKGkgKyBtYXhDaHVua0xlbmd0aCkpKVxuICB9XG5cbiAgLy8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuICBpZiAoZXh0cmFCeXRlcyA9PT0gMSkge1xuICAgIHRtcCA9IHVpbnQ4W2xlbiAtIDFdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFt0bXAgPj4gMl1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPDwgNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSAnPT0nXG4gIH0gZWxzZSBpZiAoZXh0cmFCeXRlcyA9PT0gMikge1xuICAgIHRtcCA9ICh1aW50OFtsZW4gLSAyXSA8PCA4KSArICh1aW50OFtsZW4gLSAxXSlcbiAgICBvdXRwdXQgKz0gbG9va3VwW3RtcCA+PiAxMF1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPj4gNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA8PCAyKSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9ICc9J1xuICB9XG5cbiAgcGFydHMucHVzaChvdXRwdXQpXG5cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJycpXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYmFzZTY0LWpzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9pZWVlNzU0L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChhcnIpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoYXJyKSA9PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9pc2FycmF5L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciB3aW5kb3cgPSByZXF1aXJlKFwiZ2xvYmFsL3dpbmRvd1wiKVxudmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKFwiaXMtZnVuY3Rpb25cIilcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKFwicGFyc2UtaGVhZGVyc1wiKVxudmFyIHh0ZW5kID0gcmVxdWlyZShcInh0ZW5kXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlWEhSXG5jcmVhdGVYSFIuWE1MSHR0cFJlcXVlc3QgPSB3aW5kb3cuWE1MSHR0cFJlcXVlc3QgfHwgbm9vcFxuY3JlYXRlWEhSLlhEb21haW5SZXF1ZXN0ID0gXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiAobmV3IGNyZWF0ZVhIUi5YTUxIdHRwUmVxdWVzdCgpKSA/IGNyZWF0ZVhIUi5YTUxIdHRwUmVxdWVzdCA6IHdpbmRvdy5YRG9tYWluUmVxdWVzdFxuXG5mb3JFYWNoQXJyYXkoW1wiZ2V0XCIsIFwicHV0XCIsIFwicG9zdFwiLCBcInBhdGNoXCIsIFwiaGVhZFwiLCBcImRlbGV0ZVwiXSwgZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgY3JlYXRlWEhSW21ldGhvZCA9PT0gXCJkZWxldGVcIiA/IFwiZGVsXCIgOiBtZXRob2RdID0gZnVuY3Rpb24odXJpLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgICAgICBvcHRpb25zID0gaW5pdFBhcmFtcyh1cmksIG9wdGlvbnMsIGNhbGxiYWNrKVxuICAgICAgICBvcHRpb25zLm1ldGhvZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgICAgIHJldHVybiBfY3JlYXRlWEhSKG9wdGlvbnMpXG4gICAgfVxufSlcblxuZnVuY3Rpb24gZm9yRWFjaEFycmF5KGFycmF5LCBpdGVyYXRvcikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0b3IoYXJyYXlbaV0pXG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc0VtcHR5KG9iail7XG4gICAgZm9yKHZhciBpIGluIG9iail7XG4gICAgICAgIGlmKG9iai5oYXNPd25Qcm9wZXJ0eShpKSkgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIGluaXRQYXJhbXModXJpLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIHZhciBwYXJhbXMgPSB1cmlcblxuICAgIGlmIChpc0Z1bmN0aW9uKG9wdGlvbnMpKSB7XG4gICAgICAgIGNhbGxiYWNrID0gb3B0aW9uc1xuICAgICAgICBpZiAodHlwZW9mIHVyaSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcGFyYW1zID0ge3VyaTp1cml9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBwYXJhbXMgPSB4dGVuZChvcHRpb25zLCB7dXJpOiB1cml9KVxuICAgIH1cblxuICAgIHBhcmFtcy5jYWxsYmFjayA9IGNhbGxiYWNrXG4gICAgcmV0dXJuIHBhcmFtc1xufVxuXG5mdW5jdGlvbiBjcmVhdGVYSFIodXJpLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIG9wdGlvbnMgPSBpbml0UGFyYW1zKHVyaSwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgcmV0dXJuIF9jcmVhdGVYSFIob3B0aW9ucylcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZVhIUihvcHRpb25zKSB7XG4gICAgaWYodHlwZW9mIG9wdGlvbnMuY2FsbGJhY2sgPT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYWxsYmFjayBhcmd1bWVudCBtaXNzaW5nXCIpXG4gICAgfVxuXG4gICAgdmFyIGNhbGxlZCA9IGZhbHNlXG4gICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24gY2JPbmNlKGVyciwgcmVzcG9uc2UsIGJvZHkpe1xuICAgICAgICBpZighY2FsbGVkKXtcbiAgICAgICAgICAgIGNhbGxlZCA9IHRydWVcbiAgICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2soZXJyLCByZXNwb25zZSwgYm9keSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWR5c3RhdGVjaGFuZ2UoKSB7XG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgbG9hZEZ1bmMoKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Qm9keSgpIHtcbiAgICAgICAgLy8gQ2hyb21lIHdpdGggcmVxdWVzdFR5cGU9YmxvYiB0aHJvd3MgZXJyb3JzIGFycm91bmQgd2hlbiBldmVuIHRlc3RpbmcgYWNjZXNzIHRvIHJlc3BvbnNlVGV4dFxuICAgICAgICB2YXIgYm9keSA9IHVuZGVmaW5lZFxuXG4gICAgICAgIGlmICh4aHIucmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGJvZHkgPSB4aHIucmVzcG9uc2VcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkgPSB4aHIucmVzcG9uc2VUZXh0IHx8IGdldFhtbCh4aHIpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNKc29uKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnBhcnNlKGJvZHkpXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJvZHlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlcnJvckZ1bmMoZXZ0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0VGltZXIpXG4gICAgICAgIGlmKCEoZXZ0IGluc3RhbmNlb2YgRXJyb3IpKXtcbiAgICAgICAgICAgIGV2dCA9IG5ldyBFcnJvcihcIlwiICsgKGV2dCB8fCBcIlVua25vd24gWE1MSHR0cFJlcXVlc3QgRXJyb3JcIikgKVxuICAgICAgICB9XG4gICAgICAgIGV2dC5zdGF0dXNDb2RlID0gMFxuICAgICAgICByZXR1cm4gY2FsbGJhY2soZXZ0LCBmYWlsdXJlUmVzcG9uc2UpXG4gICAgfVxuXG4gICAgLy8gd2lsbCBsb2FkIHRoZSBkYXRhICYgcHJvY2VzcyB0aGUgcmVzcG9uc2UgaW4gYSBzcGVjaWFsIHJlc3BvbnNlIG9iamVjdFxuICAgIGZ1bmN0aW9uIGxvYWRGdW5jKCkge1xuICAgICAgICBpZiAoYWJvcnRlZCkgcmV0dXJuXG4gICAgICAgIHZhciBzdGF0dXNcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRUaW1lcilcbiAgICAgICAgaWYob3B0aW9ucy51c2VYRFIgJiYgeGhyLnN0YXR1cz09PXVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy9JRTggQ09SUyBHRVQgc3VjY2Vzc2Z1bCByZXNwb25zZSBkb2Vzbid0IGhhdmUgYSBzdGF0dXMgZmllbGQsIGJ1dCBib2R5IGlzIGZpbmVcbiAgICAgICAgICAgIHN0YXR1cyA9IDIwMFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdHVzID0gKHhoci5zdGF0dXMgPT09IDEyMjMgPyAyMDQgOiB4aHIuc3RhdHVzKVxuICAgICAgICB9XG4gICAgICAgIHZhciByZXNwb25zZSA9IGZhaWx1cmVSZXNwb25zZVxuICAgICAgICB2YXIgZXJyID0gbnVsbFxuXG4gICAgICAgIGlmIChzdGF0dXMgIT09IDApe1xuICAgICAgICAgICAgcmVzcG9uc2UgPSB7XG4gICAgICAgICAgICAgICAgYm9keTogZ2V0Qm9keSgpLFxuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IHN0YXR1cyxcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICAgICAgICAgICAgICB1cmw6IHVyaSxcbiAgICAgICAgICAgICAgICByYXdSZXF1ZXN0OiB4aHJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMpeyAvL3JlbWVtYmVyIHhociBjYW4gaW4gZmFjdCBiZSBYRFIgZm9yIENPUlMgaW4gSUVcbiAgICAgICAgICAgICAgICByZXNwb25zZS5oZWFkZXJzID0gcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVyciA9IG5ldyBFcnJvcihcIkludGVybmFsIFhNTEh0dHBSZXF1ZXN0IEVycm9yXCIpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVyciwgcmVzcG9uc2UsIHJlc3BvbnNlLmJvZHkpXG4gICAgfVxuXG4gICAgdmFyIHhociA9IG9wdGlvbnMueGhyIHx8IG51bGxcblxuICAgIGlmICgheGhyKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmNvcnMgfHwgb3B0aW9ucy51c2VYRFIpIHtcbiAgICAgICAgICAgIHhociA9IG5ldyBjcmVhdGVYSFIuWERvbWFpblJlcXVlc3QoKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHhociA9IG5ldyBjcmVhdGVYSFIuWE1MSHR0cFJlcXVlc3QoKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGtleVxuICAgIHZhciBhYm9ydGVkXG4gICAgdmFyIHVyaSA9IHhoci51cmwgPSBvcHRpb25zLnVyaSB8fCBvcHRpb25zLnVybFxuICAgIHZhciBtZXRob2QgPSB4aHIubWV0aG9kID0gb3B0aW9ucy5tZXRob2QgfHwgXCJHRVRcIlxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5IHx8IG9wdGlvbnMuZGF0YVxuICAgIHZhciBoZWFkZXJzID0geGhyLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgfHwge31cbiAgICB2YXIgc3luYyA9ICEhb3B0aW9ucy5zeW5jXG4gICAgdmFyIGlzSnNvbiA9IGZhbHNlXG4gICAgdmFyIHRpbWVvdXRUaW1lclxuICAgIHZhciBmYWlsdXJlUmVzcG9uc2UgPSB7XG4gICAgICAgIGJvZHk6IHVuZGVmaW5lZCxcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgICAgIHN0YXR1c0NvZGU6IDAsXG4gICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICB1cmw6IHVyaSxcbiAgICAgICAgcmF3UmVxdWVzdDogeGhyXG4gICAgfVxuXG4gICAgaWYgKFwianNvblwiIGluIG9wdGlvbnMgJiYgb3B0aW9ucy5qc29uICE9PSBmYWxzZSkge1xuICAgICAgICBpc0pzb24gPSB0cnVlXG4gICAgICAgIGhlYWRlcnNbXCJhY2NlcHRcIl0gfHwgaGVhZGVyc1tcIkFjY2VwdFwiXSB8fCAoaGVhZGVyc1tcIkFjY2VwdFwiXSA9IFwiYXBwbGljYXRpb24vanNvblwiKSAvL0Rvbid0IG92ZXJyaWRlIGV4aXN0aW5nIGFjY2VwdCBoZWFkZXIgZGVjbGFyZWQgYnkgdXNlclxuICAgICAgICBpZiAobWV0aG9kICE9PSBcIkdFVFwiICYmIG1ldGhvZCAhPT0gXCJIRUFEXCIpIHtcbiAgICAgICAgICAgIGhlYWRlcnNbXCJjb250ZW50LXR5cGVcIl0gfHwgaGVhZGVyc1tcIkNvbnRlbnQtVHlwZVwiXSB8fCAoaGVhZGVyc1tcIkNvbnRlbnQtVHlwZVwiXSA9IFwiYXBwbGljYXRpb24vanNvblwiKSAvL0Rvbid0IG92ZXJyaWRlIGV4aXN0aW5nIGFjY2VwdCBoZWFkZXIgZGVjbGFyZWQgYnkgdXNlclxuICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuanNvbiA9PT0gdHJ1ZSA/IGJvZHkgOiBvcHRpb25zLmpzb24pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gcmVhZHlzdGF0ZWNoYW5nZVxuICAgIHhoci5vbmxvYWQgPSBsb2FkRnVuY1xuICAgIHhoci5vbmVycm9yID0gZXJyb3JGdW5jXG4gICAgLy8gSUU5IG11c3QgaGF2ZSBvbnByb2dyZXNzIGJlIHNldCB0byBhIHVuaXF1ZSBmdW5jdGlvbi5cbiAgICB4aHIub25wcm9ncmVzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gSUUgbXVzdCBkaWVcbiAgICB9XG4gICAgeGhyLm9uYWJvcnQgPSBmdW5jdGlvbigpe1xuICAgICAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgeGhyLm9udGltZW91dCA9IGVycm9yRnVuY1xuICAgIHhoci5vcGVuKG1ldGhvZCwgdXJpLCAhc3luYywgb3B0aW9ucy51c2VybmFtZSwgb3B0aW9ucy5wYXNzd29yZClcbiAgICAvL2hhcyB0byBiZSBhZnRlciBvcGVuXG4gICAgaWYoIXN5bmMpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9ICEhb3B0aW9ucy53aXRoQ3JlZGVudGlhbHNcbiAgICB9XG4gICAgLy8gQ2Fubm90IHNldCB0aW1lb3V0IHdpdGggc3luYyByZXF1ZXN0XG4gICAgLy8gbm90IHNldHRpbmcgdGltZW91dCBvbiB0aGUgeGhyIG9iamVjdCwgYmVjYXVzZSBvZiBvbGQgd2Via2l0cyBldGMuIG5vdCBoYW5kbGluZyB0aGF0IGNvcnJlY3RseVxuICAgIC8vIGJvdGggbnBtJ3MgcmVxdWVzdCBhbmQganF1ZXJ5IDEueCB1c2UgdGhpcyBraW5kIG9mIHRpbWVvdXQsIHNvIHRoaXMgaXMgYmVpbmcgY29uc2lzdGVudFxuICAgIGlmICghc3luYyAmJiBvcHRpb25zLnRpbWVvdXQgPiAwICkge1xuICAgICAgICB0aW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAoYWJvcnRlZCkgcmV0dXJuXG4gICAgICAgICAgICBhYm9ydGVkID0gdHJ1ZS8vSUU5IG1heSBzdGlsbCBjYWxsIHJlYWR5c3RhdGVjaGFuZ2VcbiAgICAgICAgICAgIHhoci5hYm9ydChcInRpbWVvdXRcIilcbiAgICAgICAgICAgIHZhciBlID0gbmV3IEVycm9yKFwiWE1MSHR0cFJlcXVlc3QgdGltZW91dFwiKVxuICAgICAgICAgICAgZS5jb2RlID0gXCJFVElNRURPVVRcIlxuICAgICAgICAgICAgZXJyb3JGdW5jKGUpXG4gICAgICAgIH0sIG9wdGlvbnMudGltZW91dCApXG4gICAgfVxuXG4gICAgaWYgKHhoci5zZXRSZXF1ZXN0SGVhZGVyKSB7XG4gICAgICAgIGZvcihrZXkgaW4gaGVhZGVycyl7XG4gICAgICAgICAgICBpZihoZWFkZXJzLmhhc093blByb3BlcnR5KGtleSkpe1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgaGVhZGVyc1trZXldKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmhlYWRlcnMgJiYgIWlzRW1wdHkob3B0aW9ucy5oZWFkZXJzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJIZWFkZXJzIGNhbm5vdCBiZSBzZXQgb24gYW4gWERvbWFpblJlcXVlc3Qgb2JqZWN0XCIpXG4gICAgfVxuXG4gICAgaWYgKFwicmVzcG9uc2VUeXBlXCIgaW4gb3B0aW9ucykge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gb3B0aW9ucy5yZXNwb25zZVR5cGVcbiAgICB9XG5cbiAgICBpZiAoXCJiZWZvcmVTZW5kXCIgaW4gb3B0aW9ucyAmJlxuICAgICAgICB0eXBlb2Ygb3B0aW9ucy5iZWZvcmVTZW5kID09PSBcImZ1bmN0aW9uXCJcbiAgICApIHtcbiAgICAgICAgb3B0aW9ucy5iZWZvcmVTZW5kKHhocilcbiAgICB9XG5cbiAgICAvLyBNaWNyb3NvZnQgRWRnZSBicm93c2VyIHNlbmRzIFwidW5kZWZpbmVkXCIgd2hlbiBzZW5kIGlzIGNhbGxlZCB3aXRoIHVuZGVmaW5lZCB2YWx1ZS5cbiAgICAvLyBYTUxIdHRwUmVxdWVzdCBzcGVjIHNheXMgdG8gcGFzcyBudWxsIGFzIGJvZHkgdG8gaW5kaWNhdGUgbm8gYm9keVxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbmF1Z3R1ci94aHIvaXNzdWVzLzEwMC5cbiAgICB4aHIuc2VuZChib2R5IHx8IG51bGwpXG5cbiAgICByZXR1cm4geGhyXG5cblxufVxuXG5mdW5jdGlvbiBnZXRYbWwoeGhyKSB7XG4gICAgaWYgKHhoci5yZXNwb25zZVR5cGUgPT09IFwiZG9jdW1lbnRcIikge1xuICAgICAgICByZXR1cm4geGhyLnJlc3BvbnNlWE1MXG4gICAgfVxuICAgIHZhciBmaXJlZm94QnVnVGFrZW5FZmZlY3QgPSB4aHIuc3RhdHVzID09PSAyMDQgJiYgeGhyLnJlc3BvbnNlWE1MICYmIHhoci5yZXNwb25zZVhNTC5kb2N1bWVudEVsZW1lbnQubm9kZU5hbWUgPT09IFwicGFyc2VyZXJyb3JcIlxuICAgIGlmICh4aHIucmVzcG9uc2VUeXBlID09PSBcIlwiICYmICFmaXJlZm94QnVnVGFrZW5FZmZlY3QpIHtcbiAgICAgICAgcmV0dXJuIHhoci5yZXNwb25zZVhNTFxuICAgIH1cblxuICAgIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3hoci9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzZWxmO1xufSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHt9O1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2dsb2JhbC93aW5kb3cuanNcbi8vIG1vZHVsZSBpZCA9IDI4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvblxuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24gKGZuKSB7XG4gIHZhciBzdHJpbmcgPSB0b1N0cmluZy5jYWxsKGZuKVxuICByZXR1cm4gc3RyaW5nID09PSAnW29iamVjdCBGdW5jdGlvbl0nIHx8XG4gICAgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJyAmJiBzdHJpbmcgIT09ICdbb2JqZWN0IFJlZ0V4cF0nKSB8fFxuICAgICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAvLyBJRTggYW5kIGJlbG93XG4gICAgIChmbiA9PT0gd2luZG93LnNldFRpbWVvdXQgfHxcbiAgICAgIGZuID09PSB3aW5kb3cuYWxlcnQgfHxcbiAgICAgIGZuID09PSB3aW5kb3cuY29uZmlybSB8fFxuICAgICAgZm4gPT09IHdpbmRvdy5wcm9tcHQpKVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9pcy1mdW5jdGlvbi9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHRyaW0gPSByZXF1aXJlKCd0cmltJylcbiAgLCBmb3JFYWNoID0gcmVxdWlyZSgnZm9yLWVhY2gnKVxuICAsIGlzQXJyYXkgPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGhlYWRlcnMpIHtcbiAgaWYgKCFoZWFkZXJzKVxuICAgIHJldHVybiB7fVxuXG4gIHZhciByZXN1bHQgPSB7fVxuXG4gIGZvckVhY2goXG4gICAgICB0cmltKGhlYWRlcnMpLnNwbGl0KCdcXG4nKVxuICAgICwgZnVuY3Rpb24gKHJvdykge1xuICAgICAgICB2YXIgaW5kZXggPSByb3cuaW5kZXhPZignOicpXG4gICAgICAgICAgLCBrZXkgPSB0cmltKHJvdy5zbGljZSgwLCBpbmRleCkpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAsIHZhbHVlID0gdHJpbShyb3cuc2xpY2UoaW5kZXggKyAxKSlcblxuICAgICAgICBpZiAodHlwZW9mKHJlc3VsdFtrZXldKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlXG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShyZXN1bHRba2V5XSkpIHtcbiAgICAgICAgICByZXN1bHRba2V5XS5wdXNoKHZhbHVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gWyByZXN1bHRba2V5XSwgdmFsdWUgXVxuICAgICAgICB9XG4gICAgICB9XG4gIClcblxuICByZXR1cm4gcmVzdWx0XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qc1xuLy8gbW9kdWxlIGlkID0gMzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB0cmltO1xuXG5mdW5jdGlvbiB0cmltKHN0cil7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyp8XFxzKiQvZywgJycpO1xufVxuXG5leHBvcnRzLmxlZnQgPSBmdW5jdGlvbihzdHIpe1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqLywgJycpO1xufTtcblxuZXhwb3J0cy5yaWdodCA9IGZ1bmN0aW9uKHN0cil7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3RyaW0vaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDMxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnaXMtZnVuY3Rpb24nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZvckVhY2hcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuXG5mdW5jdGlvbiBmb3JFYWNoKGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFpc0Z1bmN0aW9uKGl0ZXJhdG9yKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpdGVyYXRvciBtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIH1cblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xuICAgICAgICBjb250ZXh0ID0gdGhpc1xuICAgIH1cbiAgICBcbiAgICBpZiAodG9TdHJpbmcuY2FsbChsaXN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJylcbiAgICAgICAgZm9yRWFjaEFycmF5KGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KVxuICAgIGVsc2UgaWYgKHR5cGVvZiBsaXN0ID09PSAnc3RyaW5nJylcbiAgICAgICAgZm9yRWFjaFN0cmluZyhsaXN0LCBpdGVyYXRvciwgY29udGV4dClcbiAgICBlbHNlXG4gICAgICAgIGZvckVhY2hPYmplY3QobGlzdCwgaXRlcmF0b3IsIGNvbnRleHQpXG59XG5cbmZ1bmN0aW9uIGZvckVhY2hBcnJheShhcnJheSwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoYXJyYXksIGkpKSB7XG4gICAgICAgICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSlcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZm9yRWFjaFN0cmluZyhzdHJpbmcsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHN0cmluZy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAvLyBubyBzdWNoIHRoaW5nIGFzIGEgc3BhcnNlIHN0cmluZy5cbiAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBzdHJpbmcuY2hhckF0KGkpLCBpLCBzdHJpbmcpXG4gICAgfVxufVxuXG5mdW5jdGlvbiBmb3JFYWNoT2JqZWN0KG9iamVjdCwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBmb3IgKHZhciBrIGluIG9iamVjdCkge1xuICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGspKSB7XG4gICAgICAgICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9iamVjdFtrXSwgaywgb2JqZWN0KVxuICAgICAgICB9XG4gICAgfVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2Zvci1lYWNoL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlQk1Gb250QXNjaWkoZGF0YSkge1xuICBpZiAoIWRhdGEpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdubyBkYXRhIHByb3ZpZGVkJylcbiAgZGF0YSA9IGRhdGEudG9TdHJpbmcoKS50cmltKClcblxuICB2YXIgb3V0cHV0ID0ge1xuICAgIHBhZ2VzOiBbXSxcbiAgICBjaGFyczogW10sXG4gICAga2VybmluZ3M6IFtdXG4gIH1cblxuICB2YXIgbGluZXMgPSBkYXRhLnNwbGl0KC9cXHJcXG4/fFxcbi9nKVxuXG4gIGlmIChsaW5lcy5sZW5ndGggPT09IDApXG4gICAgdGhyb3cgbmV3IEVycm9yKCdubyBkYXRhIGluIEJNRm9udCBmaWxlJylcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGxpbmVEYXRhID0gc3BsaXRMaW5lKGxpbmVzW2ldLCBpKVxuICAgIGlmICghbGluZURhdGEpIC8vc2tpcCBlbXB0eSBsaW5lc1xuICAgICAgY29udGludWVcblxuICAgIGlmIChsaW5lRGF0YS5rZXkgPT09ICdwYWdlJykge1xuICAgICAgaWYgKHR5cGVvZiBsaW5lRGF0YS5kYXRhLmlkICE9PSAnbnVtYmVyJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdtYWxmb3JtZWQgZmlsZSBhdCBsaW5lICcgKyBpICsgJyAtLSBuZWVkcyBwYWdlIGlkPU4nKVxuICAgICAgaWYgKHR5cGVvZiBsaW5lRGF0YS5kYXRhLmZpbGUgIT09ICdzdHJpbmcnKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ21hbGZvcm1lZCBmaWxlIGF0IGxpbmUgJyArIGkgKyAnIC0tIG5lZWRzIHBhZ2UgZmlsZT1cInBhdGhcIicpXG4gICAgICBvdXRwdXQucGFnZXNbbGluZURhdGEuZGF0YS5pZF0gPSBsaW5lRGF0YS5kYXRhLmZpbGVcbiAgICB9IGVsc2UgaWYgKGxpbmVEYXRhLmtleSA9PT0gJ2NoYXJzJyB8fCBsaW5lRGF0YS5rZXkgPT09ICdrZXJuaW5ncycpIHtcbiAgICAgIC8vLi4uIGRvIG5vdGhpbmcgZm9yIHRoZXNlIHR3byAuLi5cbiAgICB9IGVsc2UgaWYgKGxpbmVEYXRhLmtleSA9PT0gJ2NoYXInKSB7XG4gICAgICBvdXRwdXQuY2hhcnMucHVzaChsaW5lRGF0YS5kYXRhKVxuICAgIH0gZWxzZSBpZiAobGluZURhdGEua2V5ID09PSAna2VybmluZycpIHtcbiAgICAgIG91dHB1dC5rZXJuaW5ncy5wdXNoKGxpbmVEYXRhLmRhdGEpXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dFtsaW5lRGF0YS5rZXldID0gbGluZURhdGEuZGF0YVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvdXRwdXRcbn1cblxuZnVuY3Rpb24gc3BsaXRMaW5lKGxpbmUsIGlkeCkge1xuICBsaW5lID0gbGluZS5yZXBsYWNlKC9cXHQrL2csICcgJykudHJpbSgpXG4gIGlmICghbGluZSlcbiAgICByZXR1cm4gbnVsbFxuXG4gIHZhciBzcGFjZSA9IGxpbmUuaW5kZXhPZignICcpXG4gIGlmIChzcGFjZSA9PT0gLTEpIFxuICAgIHRocm93IG5ldyBFcnJvcihcIm5vIG5hbWVkIHJvdyBhdCBsaW5lIFwiICsgaWR4KVxuXG4gIHZhciBrZXkgPSBsaW5lLnN1YnN0cmluZygwLCBzcGFjZSlcblxuICBsaW5lID0gbGluZS5zdWJzdHJpbmcoc3BhY2UgKyAxKVxuICAvL2NsZWFyIFwibGV0dGVyXCIgZmllbGQgYXMgaXQgaXMgbm9uLXN0YW5kYXJkIGFuZFxuICAvL3JlcXVpcmVzIGFkZGl0aW9uYWwgY29tcGxleGl0eSB0byBwYXJzZSBcIiAvID0gc3ltYm9sc1xuICBsaW5lID0gbGluZS5yZXBsYWNlKC9sZXR0ZXI9W1xcJ1xcXCJdXFxTK1tcXCdcXFwiXS9naSwgJycpICBcbiAgbGluZSA9IGxpbmUuc3BsaXQoXCI9XCIpXG4gIGxpbmUgPSBsaW5lLm1hcChmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gc3RyLnRyaW0oKS5tYXRjaCgoLyhcIi4qP1wifFteXCJcXHNdKykrKD89XFxzKnxcXHMqJCkvZykpXG4gIH0pXG5cbiAgdmFyIGRhdGEgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmUubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZHQgPSBsaW5lW2ldXG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIGRhdGEucHVzaCh7XG4gICAgICAgIGtleTogZHRbMF0sXG4gICAgICAgIGRhdGE6IFwiXCJcbiAgICAgIH0pXG4gICAgfSBlbHNlIGlmIChpID09PSBsaW5lLmxlbmd0aCAtIDEpIHtcbiAgICAgIGRhdGFbZGF0YS5sZW5ndGggLSAxXS5kYXRhID0gcGFyc2VEYXRhKGR0WzBdKVxuICAgIH0gZWxzZSB7XG4gICAgICBkYXRhW2RhdGEubGVuZ3RoIC0gMV0uZGF0YSA9IHBhcnNlRGF0YShkdFswXSlcbiAgICAgIGRhdGEucHVzaCh7XG4gICAgICAgIGtleTogZHRbMV0sXG4gICAgICAgIGRhdGE6IFwiXCJcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgdmFyIG91dCA9IHtcbiAgICBrZXk6IGtleSxcbiAgICBkYXRhOiB7fVxuICB9XG5cbiAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKHYpIHtcbiAgICBvdXQuZGF0YVt2LmtleV0gPSB2LmRhdGE7XG4gIH0pXG5cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBwYXJzZURhdGEoZGF0YSkge1xuICBpZiAoIWRhdGEgfHwgZGF0YS5sZW5ndGggPT09IDApXG4gICAgcmV0dXJuIFwiXCJcblxuICBpZiAoZGF0YS5pbmRleE9mKCdcIicpID09PSAwIHx8IGRhdGEuaW5kZXhPZihcIidcIikgPT09IDApXG4gICAgcmV0dXJuIGRhdGEuc3Vic3RyaW5nKDEsIGRhdGEubGVuZ3RoIC0gMSlcbiAgaWYgKGRhdGEuaW5kZXhPZignLCcpICE9PSAtMSlcbiAgICByZXR1cm4gcGFyc2VJbnRMaXN0KGRhdGEpXG4gIHJldHVybiBwYXJzZUludChkYXRhLCAxMClcbn1cblxuZnVuY3Rpb24gcGFyc2VJbnRMaXN0KGRhdGEpIHtcbiAgcmV0dXJuIGRhdGEuc3BsaXQoJywnKS5tYXAoZnVuY3Rpb24odmFsKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KHZhbCwgMTApXG4gIH0pXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3BhcnNlLWJtZm9udC1hc2NpaS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMzNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHBhcnNlQXR0cmlidXRlcyA9IHJlcXVpcmUoJy4vcGFyc2UtYXR0cmlicycpXG52YXIgcGFyc2VGcm9tU3RyaW5nID0gcmVxdWlyZSgneG1sLXBhcnNlLWZyb20tc3RyaW5nJylcblxuLy9JbiBzb21lIGNhc2VzIGVsZW1lbnQuYXR0cmlidXRlLm5vZGVOYW1lIGNhbiByZXR1cm5cbi8vYWxsIGxvd2VyY2FzZSB2YWx1ZXMuLiBzbyB3ZSBuZWVkIHRvIG1hcCB0aGVtIHRvIHRoZSBjb3JyZWN0IFxuLy9jYXNlXG52YXIgTkFNRV9NQVAgPSB7XG4gIHNjYWxlaDogJ3NjYWxlSCcsXG4gIHNjYWxldzogJ3NjYWxlVycsXG4gIHN0cmV0Y2hoOiAnc3RyZXRjaEgnLFxuICBsaW5laGVpZ2h0OiAnbGluZUhlaWdodCcsXG4gIGFscGhhY2hubDogJ2FscGhhQ2hubCcsXG4gIHJlZGNobmw6ICdyZWRDaG5sJyxcbiAgZ3JlZW5jaG5sOiAnZ3JlZW5DaG5sJyxcbiAgYmx1ZWNobmw6ICdibHVlQ2hubCdcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZShkYXRhKSB7XG4gIGRhdGEgPSBkYXRhLnRvU3RyaW5nKClcbiAgXG4gIHZhciB4bWxSb290ID0gcGFyc2VGcm9tU3RyaW5nKGRhdGEpXG4gIHZhciBvdXRwdXQgPSB7XG4gICAgcGFnZXM6IFtdLFxuICAgIGNoYXJzOiBbXSxcbiAgICBrZXJuaW5nczogW11cbiAgfVxuXG4gIC8vZ2V0IGNvbmZpZyBzZXR0aW5nc1xuICA7WydpbmZvJywgJ2NvbW1vbiddLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIGVsZW1lbnQgPSB4bWxSb290LmdldEVsZW1lbnRzQnlUYWdOYW1lKGtleSlbMF1cbiAgICBpZiAoZWxlbWVudClcbiAgICAgIG91dHB1dFtrZXldID0gcGFyc2VBdHRyaWJ1dGVzKGdldEF0dHJpYnMoZWxlbWVudCkpXG4gIH0pXG5cbiAgLy9nZXQgcGFnZSBpbmZvXG4gIHZhciBwYWdlUm9vdCA9IHhtbFJvb3QuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3BhZ2VzJylbMF1cbiAgaWYgKCFwYWdlUm9vdClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21hbGZvcm1lZCBmaWxlIC0tIG5vIDxwYWdlcz4gZWxlbWVudCcpXG4gIHZhciBwYWdlcyA9IHBhZ2VSb290LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwYWdlJylcbiAgZm9yICh2YXIgaT0wOyBpPHBhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHAgPSBwYWdlc1tpXVxuICAgIHZhciBpZCA9IHBhcnNlSW50KHAuZ2V0QXR0cmlidXRlKCdpZCcpLCAxMClcbiAgICB2YXIgZmlsZSA9IHAuZ2V0QXR0cmlidXRlKCdmaWxlJylcbiAgICBpZiAoaXNOYU4oaWQpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtYWxmb3JtZWQgZmlsZSAtLSBwYWdlIFwiaWRcIiBhdHRyaWJ1dGUgaXMgTmFOJylcbiAgICBpZiAoIWZpbGUpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21hbGZvcm1lZCBmaWxlIC0tIG5lZWRzIHBhZ2UgXCJmaWxlXCIgYXR0cmlidXRlJylcbiAgICBvdXRwdXQucGFnZXNbcGFyc2VJbnQoaWQsIDEwKV0gPSBmaWxlXG4gIH1cblxuICAvL2dldCBrZXJuaW5ncyAvIGNoYXJzXG4gIDtbJ2NoYXJzJywgJ2tlcm5pbmdzJ10uZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgZWxlbWVudCA9IHhtbFJvb3QuZ2V0RWxlbWVudHNCeVRhZ05hbWUoa2V5KVswXVxuICAgIGlmICghZWxlbWVudClcbiAgICAgIHJldHVyblxuICAgIHZhciBjaGlsZFRhZyA9IGtleS5zdWJzdHJpbmcoMCwga2V5Lmxlbmd0aC0xKVxuICAgIHZhciBjaGlsZHJlbiA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoY2hpbGRUYWcpXG4gICAgZm9yICh2YXIgaT0wOyBpPGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7ICAgICAgXG4gICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgb3V0cHV0W2tleV0ucHVzaChwYXJzZUF0dHJpYnV0ZXMoZ2V0QXR0cmlicyhjaGlsZCkpKVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIG91dHB1dFxufVxuXG5mdW5jdGlvbiBnZXRBdHRyaWJzKGVsZW1lbnQpIHtcbiAgdmFyIGF0dHJpYnMgPSBnZXRBdHRyaWJMaXN0KGVsZW1lbnQpXG4gIHJldHVybiBhdHRyaWJzLnJlZHVjZShmdW5jdGlvbihkaWN0LCBhdHRyaWIpIHtcbiAgICB2YXIga2V5ID0gbWFwTmFtZShhdHRyaWIubm9kZU5hbWUpXG4gICAgZGljdFtrZXldID0gYXR0cmliLm5vZGVWYWx1ZVxuICAgIHJldHVybiBkaWN0XG4gIH0sIHt9KVxufVxuXG5mdW5jdGlvbiBnZXRBdHRyaWJMaXN0KGVsZW1lbnQpIHtcbiAgLy9JRTgrIGFuZCBtb2Rlcm4gYnJvd3NlcnNcbiAgdmFyIGF0dHJpYnMgPSBbXVxuICBmb3IgKHZhciBpPTA7IGk8ZWxlbWVudC5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKVxuICAgIGF0dHJpYnMucHVzaChlbGVtZW50LmF0dHJpYnV0ZXNbaV0pXG4gIHJldHVybiBhdHRyaWJzXG59XG5cbmZ1bmN0aW9uIG1hcE5hbWUobm9kZU5hbWUpIHtcbiAgcmV0dXJuIE5BTUVfTUFQW25vZGVOYW1lLnRvTG93ZXJDYXNlKCldIHx8IG5vZGVOYW1lXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3BhcnNlLWJtZm9udC14bWwvbGliL2Jyb3dzZXIuanNcbi8vIG1vZHVsZSBpZCA9IDM0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vU29tZSB2ZXJzaW9ucyBvZiBHbHlwaERlc2lnbmVyIGhhdmUgYSB0eXBvXG4vL3RoYXQgY2F1c2VzIHNvbWUgYnVncyB3aXRoIHBhcnNpbmcuIFxuLy9OZWVkIHRvIGNvbmZpcm0gd2l0aCByZWNlbnQgdmVyc2lvbiBvZiB0aGUgc29mdHdhcmVcbi8vdG8gc2VlIHdoZXRoZXIgdGhpcyBpcyBzdGlsbCBhbiBpc3N1ZSBvciBub3QuXG52YXIgR0xZUEhfREVTSUdORVJfRVJST1IgPSAnY2hhc3JzZXQnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VBdHRyaWJ1dGVzKG9iaikge1xuICBpZiAoR0xZUEhfREVTSUdORVJfRVJST1IgaW4gb2JqKSB7XG4gICAgb2JqWydjaGFyc2V0J10gPSBvYmpbR0xZUEhfREVTSUdORVJfRVJST1JdXG4gICAgZGVsZXRlIG9ialtHTFlQSF9ERVNJR05FUl9FUlJPUl1cbiAgfVxuXG4gIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgaWYgKGsgPT09ICdmYWNlJyB8fCBrID09PSAnY2hhcnNldCcpIFxuICAgICAgY29udGludWVcbiAgICBlbHNlIGlmIChrID09PSAncGFkZGluZycgfHwgayA9PT0gJ3NwYWNpbmcnKVxuICAgICAgb2JqW2tdID0gcGFyc2VJbnRMaXN0KG9ialtrXSlcbiAgICBlbHNlXG4gICAgICBvYmpba10gPSBwYXJzZUludChvYmpba10sIDEwKSBcbiAgfVxuICByZXR1cm4gb2JqXG59XG5cbmZ1bmN0aW9uIHBhcnNlSW50TGlzdChkYXRhKSB7XG4gIHJldHVybiBkYXRhLnNwbGl0KCcsJykubWFwKGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiBwYXJzZUludCh2YWwsIDEwKVxuICB9KVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9wYXJzZS1ibWZvbnQteG1sL2xpYi9wYXJzZS1hdHRyaWJzLmpzXG4vLyBtb2R1bGUgaWQgPSAzNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiB4bWxwYXJzZXIoKSB7XG4gIC8vY29tbW9uIGJyb3dzZXJzXG4gIGlmICh0eXBlb2Ygd2luZG93LkRPTVBhcnNlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyKSB7XG4gICAgICB2YXIgcGFyc2VyID0gbmV3IHdpbmRvdy5ET01QYXJzZXIoKVxuICAgICAgcmV0dXJuIHBhcnNlci5wYXJzZUZyb21TdHJpbmcoc3RyLCAnYXBwbGljYXRpb24veG1sJylcbiAgICB9XG4gIH0gXG5cbiAgLy9JRTggZmFsbGJhY2tcbiAgaWYgKHR5cGVvZiB3aW5kb3cuQWN0aXZlWE9iamVjdCAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICYmIG5ldyB3aW5kb3cuQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTERPTScpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cikge1xuICAgICAgdmFyIHhtbERvYyA9IG5ldyB3aW5kb3cuQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxET01cIilcbiAgICAgIHhtbERvYy5hc3luYyA9IFwiZmFsc2VcIlxuICAgICAgeG1sRG9jLmxvYWRYTUwoc3RyKVxuICAgICAgcmV0dXJuIHhtbERvY1xuICAgIH1cbiAgfVxuXG4gIC8vbGFzdCByZXNvcnQgZmFsbGJhY2tcbiAgcmV0dXJuIGZ1bmN0aW9uKHN0cikge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRpdi5pbm5lckhUTUwgPSBzdHJcbiAgICByZXR1cm4gZGl2XG4gIH1cbn0pKClcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34veG1sLXBhcnNlLWZyb20tc3RyaW5nL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgSEVBREVSID0gWzY2LCA3NywgNzBdXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmVhZEJNRm9udEJpbmFyeShidWYpIHtcbiAgaWYgKGJ1Zi5sZW5ndGggPCA2KVxuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBidWZmZXIgbGVuZ3RoIGZvciBCTUZvbnQnKVxuXG4gIHZhciBoZWFkZXIgPSBIRUFERVIuZXZlcnkoZnVuY3Rpb24oYnl0ZSwgaSkge1xuICAgIHJldHVybiBidWYucmVhZFVJbnQ4KGkpID09PSBieXRlXG4gIH0pXG5cbiAgaWYgKCFoZWFkZXIpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdCTUZvbnQgbWlzc2luZyBCTUYgYnl0ZSBoZWFkZXInKVxuXG4gIHZhciBpID0gM1xuICB2YXIgdmVycyA9IGJ1Zi5yZWFkVUludDgoaSsrKVxuICBpZiAodmVycyA+IDMpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdPbmx5IHN1cHBvcnRzIEJNRm9udCBCaW5hcnkgdjMgKEJNRm9udCBBcHAgdjEuMTApJylcbiAgXG4gIHZhciB0YXJnZXQgPSB7IGtlcm5pbmdzOiBbXSwgY2hhcnM6IFtdIH1cbiAgZm9yICh2YXIgYj0wOyBiPDU7IGIrKylcbiAgICBpICs9IHJlYWRCbG9jayh0YXJnZXQsIGJ1ZiwgaSlcbiAgcmV0dXJuIHRhcmdldFxufVxuXG5mdW5jdGlvbiByZWFkQmxvY2sodGFyZ2V0LCBidWYsIGkpIHtcbiAgaWYgKGkgPiBidWYubGVuZ3RoLTEpXG4gICAgcmV0dXJuIDBcblxuICB2YXIgYmxvY2tJRCA9IGJ1Zi5yZWFkVUludDgoaSsrKVxuICB2YXIgYmxvY2tTaXplID0gYnVmLnJlYWRJbnQzMkxFKGkpXG4gIGkgKz0gNFxuXG4gIHN3aXRjaChibG9ja0lEKSB7XG4gICAgY2FzZSAxOiBcbiAgICAgIHRhcmdldC5pbmZvID0gcmVhZEluZm8oYnVmLCBpKVxuICAgICAgYnJlYWtcbiAgICBjYXNlIDI6XG4gICAgICB0YXJnZXQuY29tbW9uID0gcmVhZENvbW1vbihidWYsIGkpXG4gICAgICBicmVha1xuICAgIGNhc2UgMzpcbiAgICAgIHRhcmdldC5wYWdlcyA9IHJlYWRQYWdlcyhidWYsIGksIGJsb2NrU2l6ZSlcbiAgICAgIGJyZWFrXG4gICAgY2FzZSA0OlxuICAgICAgdGFyZ2V0LmNoYXJzID0gcmVhZENoYXJzKGJ1ZiwgaSwgYmxvY2tTaXplKVxuICAgICAgYnJlYWtcbiAgICBjYXNlIDU6XG4gICAgICB0YXJnZXQua2VybmluZ3MgPSByZWFkS2VybmluZ3MoYnVmLCBpLCBibG9ja1NpemUpXG4gICAgICBicmVha1xuICB9XG4gIHJldHVybiA1ICsgYmxvY2tTaXplXG59XG5cbmZ1bmN0aW9uIHJlYWRJbmZvKGJ1ZiwgaSkge1xuICB2YXIgaW5mbyA9IHt9XG4gIGluZm8uc2l6ZSA9IGJ1Zi5yZWFkSW50MTZMRShpKVxuXG4gIHZhciBiaXRGaWVsZCA9IGJ1Zi5yZWFkVUludDgoaSsyKVxuICBpbmZvLnNtb290aCA9IChiaXRGaWVsZCA+PiA3KSAmIDFcbiAgaW5mby51bmljb2RlID0gKGJpdEZpZWxkID4+IDYpICYgMVxuICBpbmZvLml0YWxpYyA9IChiaXRGaWVsZCA+PiA1KSAmIDFcbiAgaW5mby5ib2xkID0gKGJpdEZpZWxkID4+IDQpICYgMVxuICBcbiAgLy9maXhlZEhlaWdodCBpcyBvbmx5IG1lbnRpb25lZCBpbiBiaW5hcnkgc3BlYyBcbiAgaWYgKChiaXRGaWVsZCA+PiAzKSAmIDEpXG4gICAgaW5mby5maXhlZEhlaWdodCA9IDFcbiAgXG4gIGluZm8uY2hhcnNldCA9IGJ1Zi5yZWFkVUludDgoaSszKSB8fCAnJ1xuICBpbmZvLnN0cmV0Y2hIID0gYnVmLnJlYWRVSW50MTZMRShpKzQpXG4gIGluZm8uYWEgPSBidWYucmVhZFVJbnQ4KGkrNilcbiAgaW5mby5wYWRkaW5nID0gW1xuICAgIGJ1Zi5yZWFkSW50OChpKzcpLFxuICAgIGJ1Zi5yZWFkSW50OChpKzgpLFxuICAgIGJ1Zi5yZWFkSW50OChpKzkpLFxuICAgIGJ1Zi5yZWFkSW50OChpKzEwKVxuICBdXG4gIGluZm8uc3BhY2luZyA9IFtcbiAgICBidWYucmVhZEludDgoaSsxMSksXG4gICAgYnVmLnJlYWRJbnQ4KGkrMTIpXG4gIF1cbiAgaW5mby5vdXRsaW5lID0gYnVmLnJlYWRVSW50OChpKzEzKVxuICBpbmZvLmZhY2UgPSByZWFkU3RyaW5nTlQoYnVmLCBpKzE0KVxuICByZXR1cm4gaW5mb1xufVxuXG5mdW5jdGlvbiByZWFkQ29tbW9uKGJ1ZiwgaSkge1xuICB2YXIgY29tbW9uID0ge31cbiAgY29tbW9uLmxpbmVIZWlnaHQgPSBidWYucmVhZFVJbnQxNkxFKGkpXG4gIGNvbW1vbi5iYXNlID0gYnVmLnJlYWRVSW50MTZMRShpKzIpXG4gIGNvbW1vbi5zY2FsZVcgPSBidWYucmVhZFVJbnQxNkxFKGkrNClcbiAgY29tbW9uLnNjYWxlSCA9IGJ1Zi5yZWFkVUludDE2TEUoaSs2KVxuICBjb21tb24ucGFnZXMgPSBidWYucmVhZFVJbnQxNkxFKGkrOClcbiAgdmFyIGJpdEZpZWxkID0gYnVmLnJlYWRVSW50OChpKzEwKVxuICBjb21tb24ucGFja2VkID0gMFxuICBjb21tb24uYWxwaGFDaG5sID0gYnVmLnJlYWRVSW50OChpKzExKVxuICBjb21tb24ucmVkQ2hubCA9IGJ1Zi5yZWFkVUludDgoaSsxMilcbiAgY29tbW9uLmdyZWVuQ2hubCA9IGJ1Zi5yZWFkVUludDgoaSsxMylcbiAgY29tbW9uLmJsdWVDaG5sID0gYnVmLnJlYWRVSW50OChpKzE0KVxuICByZXR1cm4gY29tbW9uXG59XG5cbmZ1bmN0aW9uIHJlYWRQYWdlcyhidWYsIGksIHNpemUpIHtcbiAgdmFyIHBhZ2VzID0gW11cbiAgdmFyIHRleHQgPSByZWFkTmFtZU5UKGJ1ZiwgaSlcbiAgdmFyIGxlbiA9IHRleHQubGVuZ3RoKzFcbiAgdmFyIGNvdW50ID0gc2l6ZSAvIGxlblxuICBmb3IgKHZhciBjPTA7IGM8Y291bnQ7IGMrKykge1xuICAgIHBhZ2VzW2NdID0gYnVmLnNsaWNlKGksIGkrdGV4dC5sZW5ndGgpLnRvU3RyaW5nKCd1dGY4JylcbiAgICBpICs9IGxlblxuICB9XG4gIHJldHVybiBwYWdlc1xufVxuXG5mdW5jdGlvbiByZWFkQ2hhcnMoYnVmLCBpLCBibG9ja1NpemUpIHtcbiAgdmFyIGNoYXJzID0gW11cblxuICB2YXIgY291bnQgPSBibG9ja1NpemUgLyAyMFxuICBmb3IgKHZhciBjPTA7IGM8Y291bnQ7IGMrKykge1xuICAgIHZhciBjaGFyID0ge31cbiAgICB2YXIgb2ZmID0gYyoyMFxuICAgIGNoYXIuaWQgPSBidWYucmVhZFVJbnQzMkxFKGkgKyAwICsgb2ZmKVxuICAgIGNoYXIueCA9IGJ1Zi5yZWFkVUludDE2TEUoaSArIDQgKyBvZmYpXG4gICAgY2hhci55ID0gYnVmLnJlYWRVSW50MTZMRShpICsgNiArIG9mZilcbiAgICBjaGFyLndpZHRoID0gYnVmLnJlYWRVSW50MTZMRShpICsgOCArIG9mZilcbiAgICBjaGFyLmhlaWdodCA9IGJ1Zi5yZWFkVUludDE2TEUoaSArIDEwICsgb2ZmKVxuICAgIGNoYXIueG9mZnNldCA9IGJ1Zi5yZWFkSW50MTZMRShpICsgMTIgKyBvZmYpXG4gICAgY2hhci55b2Zmc2V0ID0gYnVmLnJlYWRJbnQxNkxFKGkgKyAxNCArIG9mZilcbiAgICBjaGFyLnhhZHZhbmNlID0gYnVmLnJlYWRJbnQxNkxFKGkgKyAxNiArIG9mZilcbiAgICBjaGFyLnBhZ2UgPSBidWYucmVhZFVJbnQ4KGkgKyAxOCArIG9mZilcbiAgICBjaGFyLmNobmwgPSBidWYucmVhZFVJbnQ4KGkgKyAxOSArIG9mZilcbiAgICBjaGFyc1tjXSA9IGNoYXJcbiAgfVxuICByZXR1cm4gY2hhcnNcbn1cblxuZnVuY3Rpb24gcmVhZEtlcm5pbmdzKGJ1ZiwgaSwgYmxvY2tTaXplKSB7XG4gIHZhciBrZXJuaW5ncyA9IFtdXG4gIHZhciBjb3VudCA9IGJsb2NrU2l6ZSAvIDEwXG4gIGZvciAodmFyIGM9MDsgYzxjb3VudDsgYysrKSB7XG4gICAgdmFyIGtlcm4gPSB7fVxuICAgIHZhciBvZmYgPSBjKjEwXG4gICAga2Vybi5maXJzdCA9IGJ1Zi5yZWFkVUludDMyTEUoaSArIDAgKyBvZmYpXG4gICAga2Vybi5zZWNvbmQgPSBidWYucmVhZFVJbnQzMkxFKGkgKyA0ICsgb2ZmKVxuICAgIGtlcm4uYW1vdW50ID0gYnVmLnJlYWRJbnQxNkxFKGkgKyA4ICsgb2ZmKVxuICAgIGtlcm5pbmdzW2NdID0ga2VyblxuICB9XG4gIHJldHVybiBrZXJuaW5nc1xufVxuXG5mdW5jdGlvbiByZWFkTmFtZU5UKGJ1Ziwgb2Zmc2V0KSB7XG4gIHZhciBwb3M9b2Zmc2V0XG4gIGZvciAoOyBwb3M8YnVmLmxlbmd0aDsgcG9zKyspIHtcbiAgICBpZiAoYnVmW3Bvc10gPT09IDB4MDApIFxuICAgICAgYnJlYWtcbiAgfVxuICByZXR1cm4gYnVmLnNsaWNlKG9mZnNldCwgcG9zKVxufVxuXG5mdW5jdGlvbiByZWFkU3RyaW5nTlQoYnVmLCBvZmZzZXQpIHtcbiAgcmV0dXJuIHJlYWROYW1lTlQoYnVmLCBvZmZzZXQpLnRvU3RyaW5nKCd1dGY4Jylcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcGFyc2UtYm1mb250LWJpbmFyeS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMzdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGVxdWFsID0gcmVxdWlyZSgnYnVmZmVyLWVxdWFsJylcbnZhciBIRUFERVIgPSBuZXcgQnVmZmVyKFs2NiwgNzcsIDcwLCAzXSlcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihidWYpIHtcbiAgaWYgKHR5cGVvZiBidWYgPT09ICdzdHJpbmcnKVxuICAgIHJldHVybiBidWYuc3Vic3RyaW5nKDAsIDMpID09PSAnQk1GJ1xuICByZXR1cm4gYnVmLmxlbmd0aCA+IDQgJiYgZXF1YWwoYnVmLnNsaWNlKDAsIDQpLCBIRUFERVIpXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvYWQtYm1mb250L2xpYi9pcy1iaW5hcnkuanNcbi8vIG1vZHVsZSBpZCA9IDM4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7IC8vIGZvciB1c2Ugd2l0aCBicm93c2VyaWZ5XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihhKSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICBpZiAodHlwZW9mIGEuZXF1YWxzID09PSAnZnVuY3Rpb24nKSByZXR1cm4gYS5lcXVhbHMoYik7XG4gICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYnVmZmVyLWVxdWFsL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYXNzaWduID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZVNERlNoYWRlciAob3B0KSB7XHJcbiAgb3B0ID0gb3B0IHx8IHt9XHJcbiAgdmFyIG9wYWNpdHkgPSB0eXBlb2Ygb3B0Lm9wYWNpdHkgPT09ICdudW1iZXInID8gb3B0Lm9wYWNpdHkgOiAxXHJcbiAgdmFyIGFscGhhVGVzdCA9IHR5cGVvZiBvcHQuYWxwaGFUZXN0ID09PSAnbnVtYmVyJyA/IG9wdC5hbHBoYVRlc3QgOiAwLjAwMDFcclxuICB2YXIgcHJlY2lzaW9uID0gb3B0LnByZWNpc2lvbiB8fCAnaGlnaHAnXHJcbiAgdmFyIGNvbG9yID0gb3B0LmNvbG9yXHJcbiAgdmFyIG1hcCA9IG9wdC5tYXBcclxuXHJcbiAgLy8gcmVtb3ZlIHRvIHNhdGlzZnkgcjczXHJcbiAgZGVsZXRlIG9wdC5tYXBcclxuICBkZWxldGUgb3B0LmNvbG9yXHJcbiAgZGVsZXRlIG9wdC5wcmVjaXNpb25cclxuICBkZWxldGUgb3B0Lm9wYWNpdHlcclxuXHJcbiAgcmV0dXJuIGFzc2lnbih7XHJcbiAgICB1bmlmb3Jtczoge1xyXG4gICAgICBvcGFjaXR5OiB7IHR5cGU6ICdmJywgdmFsdWU6IG9wYWNpdHkgfSxcclxuICAgICAgbWFwOiB7IHR5cGU6ICd0JywgdmFsdWU6IG1hcCB8fCBuZXcgVEhSRUUuVGV4dHVyZSgpIH0sXHJcbiAgICAgIGNvbG9yOiB7IHR5cGU6ICdjJywgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcihjb2xvcikgfVxyXG4gICAgfSxcclxuICAgIHZlcnRleFNoYWRlcjogW1xyXG4gICAgICAnYXR0cmlidXRlIHZlYzIgdXY7JyxcclxuICAgICAgJ2F0dHJpYnV0ZSB2ZWM0IHBvc2l0aW9uOycsXHJcbiAgICAgICd1bmlmb3JtIG1hdDQgcHJvamVjdGlvbk1hdHJpeDsnLFxyXG4gICAgICAndW5pZm9ybSBtYXQ0IG1vZGVsVmlld01hdHJpeDsnLFxyXG4gICAgICAndmFyeWluZyB2ZWMyIHZVdjsnLFxyXG4gICAgICAndm9pZCBtYWluKCkgeycsXHJcbiAgICAgICd2VXYgPSB1djsnLFxyXG4gICAgICAnZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogcG9zaXRpb247JyxcclxuICAgICAgJ30nXHJcbiAgICBdLmpvaW4oJ1xcbicpLFxyXG4gICAgZnJhZ21lbnRTaGFkZXI6IFtcclxuICAgICAgJyNpZmRlZiBHTF9PRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMnLFxyXG4gICAgICAnI2V4dGVuc2lvbiBHTF9PRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMgOiBlbmFibGUnLFxyXG4gICAgICAnI2VuZGlmJyxcclxuICAgICAgJ3ByZWNpc2lvbiAnICsgcHJlY2lzaW9uICsgJyBmbG9hdDsnLFxyXG4gICAgICAndW5pZm9ybSBmbG9hdCBvcGFjaXR5OycsXHJcbiAgICAgICd1bmlmb3JtIHZlYzMgY29sb3I7JyxcclxuICAgICAgJ3VuaWZvcm0gc2FtcGxlcjJEIG1hcDsnLFxyXG4gICAgICAndmFyeWluZyB2ZWMyIHZVdjsnLFxyXG5cclxuICAgICAgJ2Zsb2F0IGFhc3RlcChmbG9hdCB2YWx1ZSkgeycsXHJcbiAgICAgICcgICNpZmRlZiBHTF9PRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMnLFxyXG4gICAgICAnICAgIGZsb2F0IGFmd2lkdGggPSBsZW5ndGgodmVjMihkRmR4KHZhbHVlKSwgZEZkeSh2YWx1ZSkpKSAqIDAuNzA3MTA2NzgxMTg2NTQ3NTc7JyxcclxuICAgICAgJyAgI2Vsc2UnLFxyXG4gICAgICAnICAgIGZsb2F0IGFmd2lkdGggPSAoMS4wIC8gMzIuMCkgKiAoMS40MTQyMTM1NjIzNzMwOTUxIC8gKDIuMCAqIGdsX0ZyYWdDb29yZC53KSk7JyxcclxuICAgICAgJyAgI2VuZGlmJyxcclxuICAgICAgJyAgcmV0dXJuIHNtb290aHN0ZXAoMC41IC0gYWZ3aWR0aCwgMC41ICsgYWZ3aWR0aCwgdmFsdWUpOycsXHJcbiAgICAgICd9JyxcclxuXHJcbiAgICAgICd2b2lkIG1haW4oKSB7JyxcclxuICAgICAgJyAgdmVjNCB0ZXhDb2xvciA9IHRleHR1cmUyRChtYXAsIHZVdik7JyxcclxuICAgICAgJyAgZmxvYXQgYWxwaGEgPSBhYXN0ZXAodGV4Q29sb3IuYSk7JyxcclxuICAgICAgJyAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciwgb3BhY2l0eSAqIGFscGhhKTsnLFxyXG4gICAgICBhbHBoYVRlc3QgPT09IDBcclxuICAgICAgICA/ICcnXHJcbiAgICAgICAgOiAnICBpZiAoZ2xfRnJhZ0NvbG9yLmEgPCAnICsgYWxwaGFUZXN0ICsgJykgZGlzY2FyZDsnLFxyXG4gICAgICAnfSdcclxuICAgIF0uam9pbignXFxuJylcclxuICB9LCBvcHQpXHJcbn1cclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FmcmFtZS1ibWZvbnQtdGV4dC1jb21wb25lbnQvbGliL3NoYWRlcnMvc2RmLmpzXG4vLyBtb2R1bGUgaWQgPSA0MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiBnbG9iYWwgQUZSQU1FICovXHJcblxyXG4vKiBFeHBlcmltZW50YWwgdGV4dCBwcmltaXRpdmUuXHJcbiAqIElzc3VlczogY29sb3Igbm90IGNoYW5naW5nLCByZW1vdmVBdHRyaWJ1dGUoKSBub3Qgd29ya2luZywgbWl4aW5nIHByaW1pdGl2ZSB3aXRoIHJlZ3VsYXIgZW50aXRpZXMgZmFpbHNcclxuICogQ29sb3IgaXNzdWUgcmVsYXRlcyB0bzogaHR0cHM6Ly9naXRodWIuY29tL2Rvbm1jY3VyZHkvYWZyYW1lLWV4dHJhcy9ibG9iL21hc3Rlci9zcmMvcHJpbWl0aXZlcy9hLW9jZWFuLmpzI0w0NFxyXG4gKi9cclxuXHJcbnZhciBleHRlbmREZWVwID0gQUZSQU1FLnV0aWxzLmV4dGVuZERlZXA7XHJcbnZhciBtZXNoTWl4aW4gPSBBRlJBTUUucHJpbWl0aXZlcy5nZXRNZXNoTWl4aW4oKTtcclxuXHJcbkFGUkFNRS5yZWdpc3RlclByaW1pdGl2ZSgnYS10ZXh0JywgZXh0ZW5kRGVlcCh7fSwgbWVzaE1peGluLCB7XHJcbiAgZGVmYXVsdENvbXBvbmVudHM6IHtcclxuICAgICdibWZvbnQtdGV4dCc6IHt9XHJcbiAgfSxcclxuICBtYXBwaW5nczoge1xyXG4gICAgdGV4dDogJ2JtZm9udC10ZXh0LnRleHQnLFxyXG4gICAgd2lkdGg6ICdibWZvbnQtdGV4dC53aWR0aCcsXHJcbiAgICBhbGlnbjogJ2JtZm9udC10ZXh0LmFsaWduJyxcclxuICAgIGxldHRlclNwYWNpbmc6ICdibWZvbnQtdGV4dC5sZXR0ZXJTcGFjaW5nJyxcclxuICAgIGxpbmVIZWlnaHQ6ICdibWZvbnQtdGV4dC5saW5lSGVpZ2h0JyxcclxuICAgIGZudDogJ2JtZm9udC10ZXh0LmZudCcsXHJcbiAgICBmbnRJbWFnZTogJ2JtZm9udC10ZXh0LmZudEltYWdlJyxcclxuICAgIG1vZGU6ICdibWZvbnQtdGV4dC5tb2RlJyxcclxuICAgIGNvbG9yOiAnYm1mb250LXRleHQuY29sb3InLFxyXG4gICAgb3BhY2l0eTogJ2JtZm9udC10ZXh0Lm9wYWNpdHknXHJcbiAgfVxyXG59KSk7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50L2V4dHJhcy90ZXh0LXByaW1pdGl2ZS5qc1xuLy8gbW9kdWxlIGlkID0gNDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyogYWZyYW1lLXNlbGVjdC1iYXIgY29tcG9uZW50IC0tIGF0dGVtcHQgdG8gcHVsbCBvdXQgc2VsZWN0IGJhciBjb2RlIGZyb20gY2l0eSBidWlsZGVyIGxvZ2ljICovXHJcblxyXG4vKiBmb3IgdGVzdGluZyBpbiBjb25zb2xlOlxyXG5tZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lbnVcIik7XHJcbm1lbnVFbC5lbWl0KFwib25PcHRpb25OZXh0XCIpO1xyXG5tZW51RWwuZW1pdChcIm9uT3B0aW9uUHJldmlvdXNcIik7XHJcbiovXHJcblxyXG4vLyBOT1RFUzpcclxuLy8gYXQgbGVhc3Qgb25lIG9wdGdyb3VwIHJlcXVpcmVkLCBhdCBsZWFzeSA3IG9wdGlvbnMgcmVxdWlyZWQgcGVyIG9wdGdyb3VwXHJcbi8vIDUgb3IgNiBvcHRpb25zIHBlciBvcHRncm91cCBtYXkgd29yaywgbmVlZHMgdGVzdGluZ1xyXG4vLyA0IGFuZCBiZWxvdyBzaG91bGQgYmUgbm8gc2Nyb2xsXHJcblxyXG5cclxuaWYgKHR5cGVvZiBBRlJBTUUgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgYXR0ZW1wdGVkIHRvIHJlZ2lzdGVyIGJlZm9yZSBBRlJBTUUgd2FzIGF2YWlsYWJsZS4nKTtcclxufVxyXG5cclxuLy8gSEVMUEVSIEZVTkNUSU9OU1xyXG4vLyBmaW5kIGFuIGVsZW1lbnQncyBvcmlnaW5hbCBpbmRleCBwb3NpdGlvbiBpbiBhbiBhcnJheSBieSBzZWFyY2hpbmcgb24gYW4gZWxlbWVudCdzIHZhbHVlIGluIHRoZSBhcnJheVxyXG5mdW5jdGlvbiBmaW5kV2l0aEF0dHIoYXJyYXksIGF0dHIsIHZhbHVlKSB7ICAvLyBmaW5kIGFcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZihhcnJheVtpXVthdHRyXSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIC0xO1xyXG59XHJcblxyXG4vLyBmb3IgYSBnaXZlbiBhcnJheSwgZmluZCB0aGUgbGFyZ2VzdCB2YWx1ZSBhbmQgcmV0dXJuIHRoZSB2YWx1ZSBvZiB0aGUgaW5kZXggdGhlcmVvZiAoMC1iYXNlZCBpbmRleClcclxuZnVuY3Rpb24gaW5kZXhPZk1heChhcnIpIHtcclxuICAgIGlmIChhcnIubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG4gICAgdmFyIG1heCA9IGFyclswXTtcclxuICAgIHZhciBtYXhJbmRleCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChhcnJbaV0gPiBtYXgpIHtcclxuICAgICAgICAgICAgbWF4SW5kZXggPSBpO1xyXG4gICAgICAgICAgICBtYXggPSBhcnJbaV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1heEluZGV4O1xyXG59XHJcblxyXG4vLyBwcm92aWRlIGEgdmFsaWQgSW5kZXggZm9yIGFuIEFycmF5IGlmIHRoZSBkZXNpcmVkSW5kZXggaXMgZ3JlYXRlciBvciBsZXNzIHRoYW4gYW4gYXJyYXkncyBsZW5ndGggYnkgXCJsb29waW5nXCIgYXJvdW5kXHJcbmZ1bmN0aW9uIGxvb3BJbmRleChkZXNpcmVkSW5kZXgsIGFycmF5TGVuZ3RoKSB7ICAgLy8gZXhwZWN0cyBhIDAgYmFzZWQgaW5kZXhcclxuICBpZiAoZGVzaXJlZEluZGV4ID4gKGFycmF5TGVuZ3RoIC0gMSkpIHtcclxuICAgIHJldHVybiBkZXNpcmVkSW5kZXggLSBhcnJheUxlbmd0aDtcclxuICB9XHJcbiAgaWYgKGRlc2lyZWRJbmRleCA8IDApIHtcclxuICAgIHJldHVybiBhcnJheUxlbmd0aCArIGRlc2lyZWRJbmRleDtcclxuICB9XHJcbiAgcmV0dXJuIGRlc2lyZWRJbmRleDtcclxufVxyXG4vLyBHaGV0dG8gdGVzdGluZyBvZiBsb29wSW5kZXggaGVscGVyIGZ1bmN0aW9uXHJcbmZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIG1lc3NhZ2UpIHtcclxuLy8gICAgY29uc29sZS5sb2coY29uZGl0aW9uLnN0cmluZ2lmeSk7XHJcbiAgICBpZiAoIWNvbmRpdGlvbikge1xyXG4gICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlIHx8IFwiQXNzZXJ0aW9uIGZhaWxlZFwiO1xyXG4gICAgICAgIGlmICh0eXBlb2YgRXJyb3IgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBtZXNzYWdlOyAvLyBGYWxsYmFja1xyXG4gICAgfVxyXG59XHJcbnZhciB0ZXN0TG9vcEFycmF5ID0gWzAsMSwyLDMsNCw1LDYsNyw4LDldO1xyXG5hc3NlcnQobG9vcEluZGV4KDksIHRlc3RMb29wQXJyYXkubGVuZ3RoKSA9PSA5KTtcclxuYXNzZXJ0KGxvb3BJbmRleCgxMCwgdGVzdExvb3BBcnJheS5sZW5ndGgpID09IDApO1xyXG5hc3NlcnQobG9vcEluZGV4KDExLCB0ZXN0TG9vcEFycmF5Lmxlbmd0aCkgPT0gMSk7XHJcbmFzc2VydChsb29wSW5kZXgoMCwgdGVzdExvb3BBcnJheS5sZW5ndGgpID09IDApO1xyXG5hc3NlcnQobG9vcEluZGV4KC0xLCB0ZXN0TG9vcEFycmF5Lmxlbmd0aCkgPT0gOSk7XHJcbmFzc2VydChsb29wSW5kZXgoLTIsIHRlc3RMb29wQXJyYXkubGVuZ3RoKSA9PSA4KTtcclxuXHJcbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnc2VsZWN0LWJhcicsIHtcclxuICBzY2hlbWE6IHtcclxuICAgIGNvbnRyb2xzOiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OiB0cnVlfSxcclxuICAgIGNvbnRyb2xsZXJJRDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0OiAncmlnaHRDb250cm9sbGVyJ30sXHJcbiAgICBzZWxlY3RlZE9wdGdyb3VwVmFsdWU6IHt0eXBlOiAnc3RyaW5nJ30sICAgICAgICAgICAgLy8gbm90IGludGVuZGVkIHRvIGJlIHNldCB3aGVuIGRlZmluaW5nIGNvbXBvbmVudCwgdXNlZCBmb3IgdHJhY2tpbmcgc3RhdGVcclxuICAgIHNlbGVjdGVkT3B0Z3JvdXBJbmRleDoge3R5cGU6ICdpbnQnLCBkZWZhdWx0OiAwfSwgICAvLyBub3QgaW50ZW5kZWQgdG8gYmUgc2V0IHdoZW4gZGVmaW5pbmcgY29tcG9uZW50LCB1c2VkIGZvciB0cmFja2luZyBzdGF0ZVxyXG4gICAgc2VsZWN0ZWRPcHRpb25WYWx1ZToge3R5cGU6ICdzdHJpbmcnfSwgICAgICAgICAgICAgIC8vIG5vdCBpbnRlbmRlZCB0byBiZSBzZXQgd2hlbiBkZWZpbmluZyBjb21wb25lbnQsIHVzZWQgZm9yIHRyYWNraW5nIHN0YXRlXHJcbiAgICBzZWxlY3RlZE9wdGlvbkluZGV4OiB7dHlwZTogJ2ludCcsIGRlZmF1bHQ6IDB9ICAgICAgLy8gbm90IGludGVuZGVkIHRvIGJlIHNldCB3aGVuIGRlZmluaW5nIGNvbXBvbmVudCwgdXNlZCBmb3IgdHJhY2tpbmcgc3RhdGVcclxuICB9LFxyXG5cclxuICAvLyBmb3IgYSBnaXZlbiBvcHRncm91cCwgbWFrZSB0aGUgY2hpbGRyZW5zXHJcbiAgbWFrZVNlbGVjdE9wdGlvbnNSb3c6IGZ1bmN0aW9uKHNlbGVjdGVkT3B0Z3JvdXBFbCwgcGFyZW50RWwsIGluZGV4LCBvZmZzZXRZID0gMCkge1xyXG5cclxuICAgIC8vIG1ha2UgdGhlIG9wdGdyb3VwIGxhYmVsXHJcbiAgICB2YXIgb3B0Z3JvdXBMYWJlbEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImEtZW50aXR5XCIpO1xyXG4gICAgb3B0Z3JvdXBMYWJlbEVsLmlkID0gXCJvcHRncm91cExhYmVsXCIgKyBpbmRleDtcclxuICAgIG9wdGdyb3VwTGFiZWxFbC5zZXRBdHRyaWJ1dGUoXCJwb3NpdGlvblwiLCBcIi0wLjE4IFwiICsgKDAuMDQ1ICsgb2Zmc2V0WSkgKyBcIiAtMC4wMDNcIik7XHJcbiAgICBvcHRncm91cExhYmVsRWwuc2V0QXR0cmlidXRlKFwic2NhbGVcIiwgXCIwLjEyNSAwLjEyNSAwLjEyNVwiKTtcclxuICAgIG9wdGdyb3VwTGFiZWxFbC5zZXRBdHRyaWJ1dGUoXCJibWZvbnQtdGV4dFwiLCBcInRleHRcIiwgc2VsZWN0ZWRPcHRncm91cEVsLmdldEF0dHJpYnV0ZSgnbGFiZWwnKSk7XHJcbiAgICBvcHRncm91cExhYmVsRWwuc2V0QXR0cmlidXRlKFwiYm1mb250LXRleHRcIiwgXCJjb2xvclwiLCBcIiM3NDc0NzRcIik7XHJcbiAgICBwYXJlbnRFbC5hcHBlbmRDaGlsZChvcHRncm91cExhYmVsRWwpO1xyXG5cclxuICAgIC8vIGdldCB0aGUgb3B0aW9ucyBhdmFpbGFibGUgZm9yIHRoaXMgb3B0Z3JvdXAgcm93XHJcbiAgICB2YXIgb3B0aW9uc0VsZW1lbnRzID0gc2VsZWN0ZWRPcHRncm91cEVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwib3B0aW9uXCIpOyAgLy8gdGhlIGFjdHVhbCBKUyBjaGlsZHJlbiBlbGVtZW50c1xyXG5cclxuICAgIC8vIGNvbnZlcnQgdGhlIE5vZGVMaXN0IG9mIG1hdGNoaW5nIG9wdGlvbiBlbGVtZW50cyBpbnRvIGEgSmF2YXNjcmlwdCBBcnJheVxyXG4gICAgdmFyIG9wdGlvbnNFbGVtZW50c0FycmF5ID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwob3B0aW9uc0VsZW1lbnRzKTtcclxuXHJcbiAgICB2YXIgZmlyc3RBcnJheSA9IG9wdGlvbnNFbGVtZW50c0FycmF5LnNsaWNlKDAsNCk7IC8vIGdldCBpdGVtcyAwIC0gNFxyXG4gICAgdmFyIHByZXZpZXdBcnJheSA9IG9wdGlvbnNFbGVtZW50c0FycmF5LnNsaWNlKC0zKTsgLy8gZ2V0IHRoZSAzIExBU1QgaXRlbXMgb2YgdGhlIGFycmF5XHJcblxyXG4gICAgLy8gQ29tYmluZSBpbnRvIFwibWVudUFycmF5XCIsIGEgbGlzdCBvZiBjdXJyZW50bHkgdmlzaWJsZSBvcHRpb25zIHdoZXJlIHRoZSBtaWRkbGUgaW5kZXggaXMgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBvYmplY3RcclxuICAgIHZhciBtZW51QXJyYXkgPSBwcmV2aWV3QXJyYXkuY29uY2F0KGZpcnN0QXJyYXkpO1xyXG5cclxuICAgIHZhciBzZWxlY3RPcHRpb25zSFRNTCA9IFwiXCI7XHJcbiAgICB2YXIgc3RhcnRQb3NpdGlvblggPSAtMC4yMjU7XHJcbiAgICB2YXIgZGVsdGFYID0gMC4wNzU7XHJcblxyXG4gICAgLy8gRm9yIGVhY2ggbWVudSBvcHRpb24sIGNyZWF0ZSBhIHByZXZpZXcgZWxlbWVudCBhbmQgaXRzIGFwcHJvcHJpYXRlIGNoaWxkcmVuXHJcbiAgICBtZW51QXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCwgbWVudUFycmF5SW5kZXgpIHtcclxuICAgICAgdmFyIHZpc2libGUgPSAobWVudUFycmF5SW5kZXggPT09IDAgfHwgbWVudUFycmF5SW5kZXggPT09IDYpID8gKGZhbHNlKSA6ICh0cnVlKTtcclxuICAgICAgdmFyIHNlbGVjdGVkID0gKG1lbnVBcnJheUluZGV4ID09PSAzKTtcclxuICAgICAgLy8gaW5kZXggb2YgdGhlIG9wdGlvbnNFbGVtZW50c0FycmF5IHdoZXJlIG9wdGlvbnNFbGVtZW50c0FycmF5LmVsZW1lbnQuZ2V0YXR0cmlidXRlKFwidmFsdWVcIikgPSBlbGVtZW50LmdldGF0dHJpYnV0ZShcInZhbHVlXCIpXHJcbiAgICAgIHZhciBvcmlnaW5hbE9wdGlvbnNBcnJheUluZGV4ID0gZmluZFdpdGhBdHRyKG9wdGlvbnNFbGVtZW50c0FycmF5LCBcInZhbHVlXCIsIGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwidmFsdWVcIikpO1xyXG4gICAgICBzZWxlY3RPcHRpb25zSFRNTCArPSBgXHJcbiAgICAgIDxhLWVudGl0eSBpZD1cIm1lbnUke29yaWdpbmFsT3B0aW9uc0FycmF5SW5kZXh9XCIgdmlzaWJsZT1cIiR7dmlzaWJsZX1cIiBjbGFzcz1cInByZXZpZXckeyAoc2VsZWN0ZWQpID8gXCIgc2VsZWN0ZWRcIiA6IFwiXCJ9XCIgb3B0aW9uaWQ9XCIke29yaWdpbmFsT3B0aW9uc0FycmF5SW5kZXh9XCIgdmFsdWU9XCIke2VsZW1lbnQuZ2V0QXR0cmlidXRlKFwidmFsdWVcIil9XCIgb3B0Z3JvdXA9XCIke3NlbGVjdGVkT3B0Z3JvdXBFbC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKX1cIiBwb3NpdGlvbj1cIiR7c3RhcnRQb3NpdGlvblh9ICR7b2Zmc2V0WX0gMFwiPlxyXG4gICAgICAgIDxhLWJveCBjbGFzcz1cInByZXZpZXdGcmFtZVwiIHBvc2l0aW9uPVwiMCAwIC0wLjAwM1wiIHNjYWxlPVwiMC4wNiAwLjA2IDAuMDA1XCIgbWF0ZXJpYWw9XCJjb2xvcjogJHsoc2VsZWN0ZWQpID8gKFwieWVsbG93XCIpIDogKFwiIzIyMjIyMlwiKX1cIj48L2EtYm94PlxyXG4gICAgICAgIDxhLWltYWdlIGNsYXNzPVwicHJldmlld0ltYWdlXCIgc2NhbGU9XCIwLjA1IDAuMDUgMC4wNVwiIHNyYz1cIiR7ZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJzcmNcIil9XCIgPjwvYS1pbWFnZT5cclxuICAgICAgICA8YS1lbnRpdHkgY2xhc3M9XCJvYmplY3ROYW1lXCIgcG9zaXRpb249XCItMC4wMjUgLTAuMDQgLTAuMDAzXCIgc2NhbGU9XCIwLjA1IDAuMDUgMC4wNVwiIGJtZm9udC10ZXh0PVwidGV4dDogJHtlbGVtZW50LnRleHR9OyBjb2xvcjogJHsoc2VsZWN0ZWQpID8gKFwieWVsbG93XCIpIDogKFwiIzc0NzQ3NFwiKX1cIj48L2EtZW50aXR5PlxyXG4gICAgICA8L2EtZW50aXR5PmBcclxuICAgICAgc3RhcnRQb3NpdGlvblggKz0gZGVsdGFYO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQXBwZW5kIHRoZXNlIG1lbnUgb3B0aW9ucyB0byBhIG5ldyBlbGVtZW50IHdpdGggaWQgb2YgXCJzZWxlY3RPcHRpb25zUm93XCJcclxuICAgIHZhciBzZWxlY3RPcHRpb25zUm93RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYS1lbnRpdHlcIik7XHJcbiAgICBzZWxlY3RPcHRpb25zUm93RWwuaWQgPSBcInNlbGVjdE9wdGlvbnNSb3dcIiArIGluZGV4O1xyXG4gICAgc2VsZWN0T3B0aW9uc1Jvd0VsLmlubmVySFRNTCA9IHNlbGVjdE9wdGlvbnNIVE1MO1xyXG4gICAgcGFyZW50RWwuYXBwZW5kQ2hpbGQoc2VsZWN0T3B0aW9uc1Jvd0VsKTtcclxuXHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlU2VsZWN0T3B0aW9uc1JvdzogZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICAvLyBmaW5kIHRoZSBhcHByb3ByaWF0ZSBzZWxlY3Qgb3B0aW9ucyByb3dcclxuICAgIHZhciBzZWxlY3RPcHRpb25zUm93RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlbGVjdE9wdGlvbnNSb3dcIiArIGluZGV4KTtcclxuICAgIHZhciBvcHRncm91cExhYmVsRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm9wdGdyb3VwTGFiZWxcIiArIGluZGV4KTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhcInRyeSB0byByZW1vdmUgY2hpbGRyZW5cIik7XHJcbiAgICAvLyBkZWxldGUgYWxsIGNoaWxkcmVuIG9mIHNlbGVjdE9wdGlvbnNSb3dFbFxyXG4gICAgd2hpbGUgKHNlbGVjdE9wdGlvbnNSb3dFbC5maXJzdENoaWxkKSB7XHJcbiAgICAgICAgc2VsZWN0T3B0aW9uc1Jvd0VsLnJlbW92ZUNoaWxkKHNlbGVjdE9wdGlvbnNSb3dFbC5maXJzdENoaWxkKTtcclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKFwiY2hpbGRyZW4gcmVtb3ZlZFwiKTtcclxuXHJcbiAgICAvLyBkZWxldGUgc2VsZWN0T3B0aW9uc1Jvd0VsIGFuZCBvcHRncm91cExhYmVsRWxcclxuICAgIG9wdGdyb3VwTGFiZWxFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG9wdGdyb3VwTGFiZWxFbCk7XHJcbiAgICBzZWxlY3RPcHRpb25zUm93RWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzZWxlY3RPcHRpb25zUm93RWwpO1xyXG4gIH0sXHJcblxyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIENyZWF0ZSBzZWxlY3QgYmFyIG1lbnUgZnJvbSBodG1sIGNoaWxkIGBvcHRpb25gIGVsZW1lbnRzIGJlbmVhdGggcGFyZW50IGVudGl0eSBpbnNwaXJlZCBieSB0aGUgaHRtbDUgc3BlYzogaHR0cDovL3d3dy53M3NjaG9vbHMuY29tL3RhZ3MvdGFnX29wdGdyb3VwLmFzcFxyXG4gICAgdmFyIHNlbGVjdEVsID0gdGhpcy5lbDsgIC8vIFJlZmVyZW5jZSB0byB0aGUgY29tcG9uZW50J3MgZW50aXR5LlxyXG4gICAgdGhpcy5kYXRhLmxhc3RUaW1lID0gbmV3IERhdGUoKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIFwiZnJhbWVcIiBvZiB0aGUgc2VsZWN0IG1lbnUgYmFyXHJcbiAgICB2YXIgc2VsZWN0UmVuZGVyRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYS1lbnRpdHlcIik7XHJcbiAgICBzZWxlY3RSZW5kZXJFbC5pZCA9IFwic2VsZWN0UmVuZGVyXCI7XHJcbiAgICBzZWxlY3RSZW5kZXJFbC5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxhLWJveCBpZD1cIm1lbnVGcmFtZVwiIHNjYWxlPVwiMC40IDAuMTUgMC4wMDVcIiBwb3NpdGlvbj1cIjAgMCAtMC4wMDc1XCIgIG1hdGVyaWFsPVwib3BhY2l0eTogMC41OyB0cmFuc3BhcmVudDogdHJ1ZTsgY29sb3I6ICMwMDAwMDBcIj48L2EtYm94PlxyXG4gICAgICA8YS1lbnRpdHkgaWQ9XCJhcnJvd1JpZ2h0XCIgcG9zaXRpb249XCIwLjIyNSAwIDBcIiByb3RhdGlvbj1cIjkwIDE4MCAwXCIgc2NhbGU9XCItMC4wMDQgMC4wMDIgMC4wMDRcIiBvYmotbW9kZWw9XCJvYmo6I2Vudl9hcnJvd1wiIG1hdGVyaWFsPVwib3BhY2l0eTogMC41OyB0cmFuc3BhcmVudDogdHJ1ZTsgY29sb3I6ICMwMDAwMDBcIj48L2EtZW50aXR5PlxyXG4gICAgICA8YS1lbnRpdHkgaWQ9XCJhcnJvd0xlZnRcIiBwb3NpdGlvbj1cIi0wLjIyNSAwIDBcIiByb3RhdGlvbj1cIjkwIDE4MCAwXCIgc2NhbGU9XCIwLjAwNCAwLjAwMiAwLjAwNFwiIG9iai1tb2RlbD1cIm9iajojZW52X2Fycm93XCIgbWF0ZXJpYWw9XCJvcGFjaXR5OjAuNTsgdHJhbnNwYXJlbnQ6dHJ1ZTsgY29sb3I6IzAwMDAwMFwiPjwvYS1lbnRpdHk+XHJcbiAgICAgIDxhLWVudGl0eSBpZD1cImFycm93VXBcIiBwb3NpdGlvbj1cIjAgMC4xIDBcIiByb3RhdGlvbj1cIjAgMjcwIDkwXCIgc2NhbGU9XCIwLjAwNCAwLjAwMiAwLjAwNFwiIG9iai1tb2RlbD1cIm9iajojZW52X2Fycm93XCIgbWF0ZXJpYWw9XCJvcGFjaXR5OiAwLjU7IHRyYW5zcGFyZW50OiB0cnVlOyBjb2xvcjogIzAwMDAwMFwiPjwvYS1lbnRpdHk+XHJcbiAgICAgIDxhLWVudGl0eSBpZD1cImFycm93RG93blwiIHBvc2l0aW9uPVwiMCAtMC4xIDBcIiByb3RhdGlvbj1cIjAgMjcwIDkwXCIgc2NhbGU9XCItMC4wMDQgMC4wMDIgMC4wMDRcIiBvYmotbW9kZWw9XCJvYmo6I2Vudl9hcnJvd1wiIG1hdGVyaWFsPVwib3BhY2l0eTogMC41OyB0cmFuc3BhcmVudDogdHJ1ZTsgY29sb3I6ICMwMDAwMDBcIj48L2EtZW50aXR5PlxyXG4gICAgICBgO1xyXG4gICAgc2VsZWN0RWwuYXBwZW5kQ2hpbGQoc2VsZWN0UmVuZGVyRWwpO1xyXG5cclxuXHJcbiAgICB2YXIgb3B0Z3JvdXBzID0gc2VsZWN0RWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRncm91cFwiKTsgIC8vIEdldCB0aGUgb3B0Z3JvdXBzXHJcbiAgICB2YXIgc2VsZWN0ZWRPcHRncm91cEVsID0gb3B0Z3JvdXBzW3RoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXhdOyAgLy8gZmV0Y2ggdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBvcHRncm91cFxyXG4gICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBWYWx1ZSA9IHNlbGVjdGVkT3B0Z3JvdXBFbC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKTsgLy8gc2V0IGNvbXBvbmVudCBwcm9wZXJ0eSB0byBvcGdyb3VwIHZhbHVlXHJcblxyXG4gICAgdGhpcy5tYWtlU2VsZWN0T3B0aW9uc1JvdyhzZWxlY3RlZE9wdGdyb3VwRWwsIHNlbGVjdFJlbmRlckVsLCB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4KTtcclxuXHJcbiAgfSxcclxuXHJcbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIElmIGNvbnRyb2xzID0gdHJ1ZSBhbmQgYSBjb250cm9sbGVySUQgaGFzIGJlZW4gcHJvdmlkZWQsIHRoZW4gYWRkIGNvbnRyb2xsZXIgZXZlbnQgbGlzdGVuZXJzXHJcbiAgICBpZiAodGhpcy5kYXRhLmNvbnRyb2xzICYmIHRoaXMuZGF0YS5jb250cm9sbGVySUQpIHtcclxuICAgICAgdmFyIGNvbnRyb2xsZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5jb250cm9sbGVySUQpO1xyXG4gICAgICBjb250cm9sbGVyRWwuYWRkRXZlbnRMaXN0ZW5lcigndHJhY2twYWRkb3duJywgdGhpcy5vblRyYWNrcGFkRG93bi5iaW5kKHRoaXMpKTtcclxuICAgICAgY29udHJvbGxlckVsLmFkZEV2ZW50TGlzdGVuZXIoJ2F4aXNtb3ZlJywgdGhpcy5vbkF4aXNNb3ZlLmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBlbCA9IHRoaXMuZWw7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdvbkhvdmVyTGVmdCcsIHRoaXMub25Ib3ZlckxlZnQuYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdvbkhvdmVyUmlnaHQnLCB0aGlzLm9uSG92ZXJSaWdodC5iaW5kKHRoaXMpKTtcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ29uT3B0aW9uU3dpdGNoJywgdGhpcy5vbk9wdGlvblN3aXRjaC5iaW5kKHRoaXMpKTtcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ29uT3B0aW9uTmV4dCcsIHRoaXMub25PcHRpb25OZXh0LmJpbmQodGhpcykpO1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignb25PcHRpb25QcmV2aW91cycsIHRoaXMub25PcHRpb25QcmV2aW91cy5iaW5kKHRoaXMpKTtcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ29uT3B0Z3JvdXBOZXh0JywgdGhpcy5vbk9wdGdyb3VwTmV4dC5iaW5kKHRoaXMpKTtcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ29uT3B0Z3JvdXBQcmV2aW91cycsIHRoaXMub25PcHRncm91cFByZXZpb3VzLmJpbmQodGhpcykpO1xyXG5cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxyXG4gICAqL1xyXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5kYXRhLmNvbnRyb2xzICYmIHRoaXMuZGF0YS5jb250cm9sbGVySUQpIHtcclxuICAgICAgdmFyIGNvbnRyb2xsZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5jb250cm9sbGVySUQpO1xyXG4gICAgICBjb250cm9sbGVyRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhY2twYWRkb3duJywgdGhpcy5vblRyYWNrcGFkRG93bik7XHJcbiAgICAgIGNvbnRyb2xsZXJFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdheGlzbW92ZScsIHRoaXMub25BeGlzTW92ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGVsID0gdGhpcy5lbDtcclxuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ29uT3B0aW9uU3dpdGNoJywgdGhpcy5vbk9wdGlvblN3aXRjaCk7XHJcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdvbkhvdmVyUmlnaHQnLCB0aGlzLm9uSG92ZXJSaWdodCk7XHJcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdvbkhvdmVyTGVmdCcsIHRoaXMub25Ib3ZlckxlZnQpO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignb25PcHRpb25OZXh0JywgdGhpcy5vbk9wdGlvbk5leHQpO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignb25PcHRpb25QcmV2aW91cycsIHRoaXMub25PcHRpb25QcmV2aW91cyk7XHJcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdvbk9wdGdyb3VwTmV4dCcsIHRoaXMub25PcHRncm91cE5leHQpO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignb25PcHRncm91cFByZXZpb3VzJywgdGhpcy5vbk9wdGdyb3VwUHJldmlvdXMpO1xyXG5cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBlbnRpdHkgcmVzdW1lcy5cclxuICAgKiBVc2UgdG8gY29udGludWUgb3IgYWRkIGFueSBkeW5hbWljIG9yIGJhY2tncm91bmQgYmVoYXZpb3Igc3VjaCBhcyBldmVudHMuXHJcbiAgICovXHJcbiAgcGxheTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGVudGl0eSBwYXVzZXMuXHJcbiAgICogVXNlIHRvIHN0b3Agb3IgcmVtb3ZlIGFueSBkeW5hbWljIG9yIGJhY2tncm91bmQgYmVoYXZpb3Igc3VjaCBhcyBldmVudHMuXHJcbiAgICovXHJcbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGNvbXBvbmVudCBpcyByZW1vdmVkIChlLmcuLCB2aWEgcmVtb3ZlQXR0cmlidXRlKS5cclxuICAgKiBHZW5lcmFsbHkgdW5kb2VzIGFsbCBtb2RpZmljYXRpb25zIHRvIHRoZSBlbnRpdHkuXHJcbiAgICovXHJcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgb25BeGlzTW92ZTogZnVuY3Rpb24gKGV2dCkgeyAgICAgICAvLyBtZW51OiB1c2VkIGZvciBkZXRlcm1pbmluZyBjdXJyZW50IGF4aXMgb2YgdHJhY2twYWQgaG92ZXIgcG9zaXRpb25cclxuICAgIGlmIChldnQudGFyZ2V0LmlkICE9IHRoaXMuZGF0YS5jb250cm9sbGVySUQpIHsgICAvL21lbnU6IG9ubHkgZGVhbCB3aXRoIHRyYWNrcGFkIGV2ZW50cyBmcm9tIHJpZ2h0IGNvbnRyb2xsZXJcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG9ubHkgcnVuIHRoaXMgZnVuY3Rpb24gaWYgdGhlcmUgaXMgc29tZSB2YWx1ZSBmb3IgYXQgbGVhc3Qgb25lIGF4aXNcclxuICAgIGlmIChldnQuZGV0YWlsLmF4aXNbMF0gPT09IDAgJiYgZXZ0LmRldGFpbC5heGlzWzFdID09PSAwKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaXNPY3VsdXMgPSBmYWxzZTtcclxuICAgIHZhciBnYW1lcGFkcyA9IG5hdmlnYXRvci5nZXRHYW1lcGFkcygpO1xyXG4gICAgaWYgKGdhbWVwYWRzKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2FtZXBhZHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgZ2FtZXBhZCA9IGdhbWVwYWRzW2ldO1xyXG4gICAgICAgIGlmIChnYW1lcGFkKSB7XHJcbiAgICAgICAgICBpZiAoZ2FtZXBhZC5pZC5pbmRleE9mKCdPY3VsdXMgVG91Y2gnKSA9PT0gMCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImlzT2N1bHVzXCIpO1xyXG4gICAgICAgICAgICBpc09jdWx1cyA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4vLyAgICBjb25zb2xlLmxvZyhcImF4aXNbMF06IFwiICsgZXZ0LmRldGFpbC5heGlzWzBdICsgXCIgbGVmdCAtMTsgcmlnaHQgKzFcIik7XHJcbi8vICAgIGNvbnNvbGUubG9nKFwiYXhpc1sxXTogXCIgKyBldnQuZGV0YWlsLmF4aXNbMV0gKyBcIiBkb3duIC0xOyB1cCArMVwiKTtcclxuLy8gICAgY29uc29sZS5sb2coZXZ0LnRhcmdldC5pZCk7XHJcblxyXG4gICAgLy8gd2hpY2ggYXhpcyBoYXMgbGFyZ2VzdCBhYnNvbHV0ZSB2YWx1ZT8gdGhlbiB1c2UgdGhhdCBheGlzIHZhbHVlIHRvIGRldGVybWluZSBob3ZlciBwb3NpdGlvblxyXG4vLyAgICBjb25zb2xlLmxvZyhldnQuZGV0YWlsLmF4aXNbMF0pO1xyXG4gICAgaWYgKE1hdGguYWJzKGV2dC5kZXRhaWwuYXhpc1swXSkgPiBNYXRoLmFicyhldnQuZGV0YWlsLmF4aXNbMV0pKSB7IC8vIGlmIHggYXhpcyBhYnNvbHV0ZSB2YWx1ZSAobGVmdC9yaWdodCkgaXMgZ3JlYXRlciB0aGFuIHkgYXhpcyAoZG93bi91cClcclxuICAgICAgaWYgKGV2dC5kZXRhaWwuYXhpc1swXSA+IDApIHsgLy8gaWYgdGhlIHJpZ2h0IGF4aXMgaXMgZ3JlYXRlciB0aGFuIDAgKG1pZHBvaW50KVxyXG4gICAgICAgIHRoaXMub25Ib3ZlclJpZ2h0KCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5vbkhvdmVyTGVmdCgpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgaWYgKGlzT2N1bHVzKSB7XHJcbiAgICAgICAgdmFyIHlBeGlzID0gLWV2dC5kZXRhaWwuYXhpc1sxXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgeUF4aXMgPSBldnQuZGV0YWlsLmF4aXNbMV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh5QXhpcyA+IDApIHsgLy8gaWYgdGhlIHVwIGF4aXMgaXMgZ3JlYXRlciB0aGFuIDAgKG1pZHBvaW50KVxyXG4gICAgICAgIHRoaXMub25Ib3ZlclVwKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5vbkhvdmVyRG93bigpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgdXNpbmcgdGhlIG9jdWx1cyB0b3VjaCBjb250cm9scywgYW5kIHRodW1ic3RpY2sgaXMgPjg1JSBpbiBhbnkgZGlyZWN0aW9uIHRoZW4gZmlyZSBvbnRyYWNrcGFkZG93blxyXG4gICAgdmFyIGdhbWVwYWRzID0gbmF2aWdhdG9yLmdldEdhbWVwYWRzKCk7XHJcbiAgICBpZiAoZ2FtZXBhZHMpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lcGFkcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBnYW1lcGFkID0gZ2FtZXBhZHNbaV07XHJcbiAgICAgICAgaWYgKGdhbWVwYWQpIHtcclxuICAgICAgICAgIGlmIChnYW1lcGFkLmlkLmluZGV4T2YoJ09jdWx1cyBUb3VjaCcpID09PSAwKSB7XHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhldnQuZGV0YWlsLmF4aXNbMF0pID4gMC44NSB8fCBNYXRoLmFicyhldnQuZGV0YWlsLmF4aXNbMV0pID4gMC44NSkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBkZWJvdW5jZSAodGhyb3R0bGUpIHN1Y2ggdGhhdCB0aGlzIG9ubHkgcnVucyBvbmNlIGV2ZXJ5IDEvMiBzZWNvbmQgbWF4XHJcbiAgICAgICAgICAgICAgdmFyIHRoaXNUaW1lID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgICBpZiAoIE1hdGguZmxvb3IodGhpc1RpbWUgLSB0aGlzLmRhdGEubGFzdFRpbWUpID4gNTAwICkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhLmxhc3RUaW1lID0gdGhpc1RpbWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uVHJhY2twYWREb3duKGV2dCk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgb25Ib3ZlclJpZ2h0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVsLmVtaXQoXCJtZW51SG92ZXJSaWdodFwiKTtcclxuICAgIHZhciBhcnJvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dSaWdodFwiKTtcclxuICAgIHZhciBjdXJyZW50QXJyb3dDb2xvciA9IG5ldyBUSFJFRS5Db2xvcihhcnJvdy5nZXRBdHRyaWJ1dGUoXCJtYXRlcmlhbFwiKS5jb2xvcik7XHJcbiAgICBpZiAoY3VycmVudEFycm93Q29sb3IuciA9PT0gMCkgeyAvLyBpZiBub3QgYWxyZWFkeSBzb21lIHNoYWRlIG9mIHllbGxvdyAod2hpY2ggaW5kaWNhdGVzIHJlY2VudCBidXR0b24gcHJlc3MpIHRoZW4gYW5pbWF0ZSBncmVlbiBob3ZlclxyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknKTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiIzAwRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG9uSG92ZXJMZWZ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVsLmVtaXQoXCJtZW51SG92ZXJMZWZ0XCIpO1xyXG4gICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0xlZnRcIik7XHJcbiAgICB2YXIgY3VycmVudEFycm93Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoYXJyb3cuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpO1xyXG4gICAgaWYgKGN1cnJlbnRBcnJvd0NvbG9yLnIgPT09IDApIHsgLy8gaWYgbm90IGFscmVhZHkgc29tZSBzaGFkZSBvZiB5ZWxsb3cgKHdoaWNoIGluZGljYXRlcyByZWNlbnQgYnV0dG9uIHByZXNzKSB0aGVuIGFuaW1hdGUgZ3JlZW4gaG92ZXJcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJyk7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5jb2xvcicsIGR1cjogNTAwLCBmcm9tOiBcIiMwMEZGMDBcIiwgdG86IFwiIzAwMDAwMFwiIH0pO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5vcGFjaXR5JywgZHVyOiA1MDAsIGZyb206IFwiMVwiLCB0bzogXCIwLjVcIiB9KTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBvbkhvdmVyRG93bjogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5lbC5lbWl0KFwibWVudUhvdmVyRG93blwiKTtcclxuICAgIHZhciBzZWxlY3RFbCA9IHRoaXMuZWw7XHJcbiAgICB2YXIgb3B0Z3JvdXBzID0gc2VsZWN0RWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRncm91cFwiKTsgIC8vIEdldCB0aGUgb3B0Z3JvdXBzXHJcblxyXG4gICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0Rvd25cIik7XHJcbiAgICB2YXIgY3VycmVudEFycm93Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoYXJyb3cuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpO1xyXG4gICAgaWYgKCAhKGN1cnJlbnRBcnJvd0NvbG9yLnIgPiAwICYmIGN1cnJlbnRBcnJvd0NvbG9yLmcgPiAwKSApIHsgLy8gaWYgbm90IGFscmVhZHkgc29tZSBzaGFkZSBvZiB5ZWxsb3cgKHdoaWNoIGluZGljYXRlcyByZWNlbnQgYnV0dG9uIHByZXNzKSB0aGVuIGFuaW1hdGUgZ3JlZW4gaG92ZXJcclxuICAgICAgaWYgKHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXggKyAyID4gb3B0Z3JvdXBzLmxlbmd0aCkge1xyXG4gICAgICAgIC8vIENBTidUIERPIC0gQUxSRUFEWSBBVCBFTkQgT0YgTElTVFxyXG4gICAgICAgIHZhciBhcnJvd0NvbG9yID0gXCIjRkYwMDAwXCI7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGFycm93Q29sb3IgPSBcIiMwMEZGMDBcIjtcclxuICAgICAgfVxyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknKTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IGFycm93Q29sb3IsIHRvOiBcIiMwMDAwMDBcIiB9KTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgb25Ib3ZlclVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVsLmVtaXQoXCJtZW51SG92ZXJVcFwiKTtcclxuICAgIHZhciBzZWxlY3RFbCA9IHRoaXMuZWw7XHJcbiAgICB2YXIgb3B0Z3JvdXBzID0gc2VsZWN0RWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRncm91cFwiKTsgIC8vIEdldCB0aGUgb3B0Z3JvdXBzXHJcblxyXG4gICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1VwXCIpO1xyXG4gICAgdmFyIGN1cnJlbnRBcnJvd0NvbG9yID0gbmV3IFRIUkVFLkNvbG9yKGFycm93LmdldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIpLmNvbG9yKTtcclxuICAgIGlmICggIShjdXJyZW50QXJyb3dDb2xvci5yID4gMCAmJiBjdXJyZW50QXJyb3dDb2xvci5nID4gMCkgKSB7IC8vIGlmIG5vdCBhbHJlYWR5IHNvbWUgc2hhZGUgb2YgeWVsbG93ICh3aGljaCBpbmRpY2F0ZXMgcmVjZW50IGJ1dHRvbiBwcmVzcykgdGhlbiBhbmltYXRlIGdyZWVuIGhvdmVyXHJcbiAgICAgIGlmICh0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4IC0gMSA8IDApIHtcclxuICAgICAgICAgLy8gQ0FOJ1QgRE8gLSBBTFJFQURZIEFUIEVORCBPRiBMSVNUXHJcbiAgICAgICAgIHZhciBhcnJvd0NvbG9yID0gXCIjRkYwMDAwXCI7XHJcbiAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICB2YXIgYXJyb3dDb2xvciA9IFwiIzAwRkYwMFwiO1xyXG4gICAgICAgfVxyXG4gICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJyk7XHJcbiAgICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScpO1xyXG4gICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IGFycm93Q29sb3IsIHRvOiBcIiMwMDAwMDBcIiB9KTtcclxuICAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG9uT3B0aW9uTmV4dDogZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgdGhpcy5vbk9wdGlvblN3aXRjaChcIm5leHRcIik7XHJcbiAgfSxcclxuXHJcbiAgb25PcHRpb25QcmV2aW91czogZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgdGhpcy5vbk9wdGlvblN3aXRjaChcInByZXZpb3VzXCIpO1xyXG4gIH0sXHJcblxyXG4gIG9uT3B0Z3JvdXBOZXh0OiBmdW5jdGlvbihldnQpIHtcclxuICAgIHZhciBzZWxlY3RFbCA9IHRoaXMuZWw7XHJcbiAgICB2YXIgb3B0Z3JvdXBzID0gc2VsZWN0RWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRncm91cFwiKTsgIC8vIEdldCB0aGUgb3B0Z3JvdXBzXHJcbiAgICB2YXIgc2VsZWN0UmVuZGVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlbGVjdFJlbmRlclwiKTtcclxuXHJcbiAgICBpZiAodGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCArIDIgPiBvcHRncm91cHMubGVuZ3RoKSB7XHJcbiAgICAgIC8vIENBTidUIERPIFRISVMsIHNob3cgcmVkIGFycm93XHJcbiAgICAgIHZhciBhcnJvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dEb3duXCIpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJyk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5jb2xvcicsIGR1cjogNTAwLCBmcm9tOiBcIiNGRjAwMDBcIiwgdG86IFwiIzAwMDAwMFwiIH0pO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5vcGFjaXR5JywgZHVyOiA1MDAsIGZyb206IFwiMVwiLCB0bzogXCIwLjVcIiB9KTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJywgeyBwcm9wZXJ0eTogJ3NjYWxlJywgZHVyOiA1MDAsIGZyb206IFwiLTAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIi0wLjAwNCAwLjAwMiAwLjAwNFwiIH0pO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIENBTiBETyBUSElTLCBzaG93IG5leHQgb3B0Z3JvdXBcclxuXHJcbiAgICAgIHRoaXMucmVtb3ZlU2VsZWN0T3B0aW9uc1Jvdyh0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4KTsgLy8gcmVtb3ZlIHRoZSBvbGQgb3B0Z3JvdXAgcm93XHJcblxyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4ICs9IDE7XHJcbiAgICAgIHZhciBzZWxlY3RlZE9wdGdyb3VwRWwgPSBvcHRncm91cHNbdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleF07ICAvLyBmZXRjaCB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9wdGdyb3VwXHJcbiAgICAgIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwVmFsdWUgPSBzZWxlY3RlZE9wdGdyb3VwRWwuZ2V0QXR0cmlidXRlKFwidmFsdWVcIik7IC8vIHNldCBjb21wb25lbnQgcHJvcGVydHkgdG8gb3Bncm91cCB2YWx1ZVxyXG5cclxuICAgICAgdGhpcy5lbC5mbHVzaFRvRE9NKCk7XHJcblxyXG4gICAgICB2YXIgbmV4dFNlbGVjdGVkT3B0Z3JvdXBFbCA9IG9wdGdyb3Vwc1t0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4XTsgIC8vIGZldGNoIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgb3B0Z3JvdXBcclxuICAgICAgLy8gdGhpcy5tYWtlU2VsZWN0T3B0aW9uc1JvdyhuZXh0U2VsZWN0ZWRPcHRncm91cEVsLCBzZWxlY3RSZW5kZXJFbCwgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCwgLTAuMTUpO1xyXG4gICAgICB0aGlzLm1ha2VTZWxlY3RPcHRpb25zUm93KG5leHRTZWxlY3RlZE9wdGdyb3VwRWwsIHNlbGVjdFJlbmRlckVsLCB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4KTtcclxuXHJcbiAgICAgIC8vIENoYW5nZSBzZWxlY3RlZCBvcHRpb24gZWxlbWVudCB3aGVuIG9wdGdyb3VwIGlzIGNoYW5nZWRcclxuICAgICAgdmFyIHNlbGVjdE9wdGlvbnNSb3dFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWxlY3RPcHRpb25zUm93JyArIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXgpO1xyXG4gICAgICB2YXIgbmV3bHlTZWxlY3RlZE1lbnVFbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzZWxlY3RlZCcpWzBdO1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHNlbGVjdE9wdGlvbnNWYWx1ZSBhbmQgSW5kZXhcclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uVmFsdWUgPSBuZXdseVNlbGVjdGVkTWVudUVsLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpO1xyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRpb25JbmRleCA9IG5ld2x5U2VsZWN0ZWRNZW51RWwuZ2V0QXR0cmlidXRlKFwib3B0aW9uaWRcIik7XHJcblxyXG4gICAgICB0aGlzLmVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuZW1pdChcIm1lbnVPcHRncm91cE5leHRcIik7XHJcbiAgICAgIHRoaXMuZWwuZW1pdChcIm1lbnVDaGFuZ2VkXCIpO1xyXG5cclxuICAgICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0Rvd25cIik7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnKTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnLCB7IHByb3BlcnR5OiAnc2NhbGUnLCBkdXI6IDUwMCwgZnJvbTogXCItMC4wMDYgMC4wMDMgMC4wMDZcIiwgdG86IFwiLTAuMDA0IDAuMDAyIDAuMDA0XCIgfSk7XHJcbiAgICB9XHJcblxyXG4gIH0sXHJcblxyXG4gIG9uT3B0Z3JvdXBQcmV2aW91czogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICB2YXIgc2VsZWN0RWwgPSB0aGlzLmVsO1xyXG4gICAgdmFyIG9wdGdyb3VwcyA9IHNlbGVjdEVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwib3B0Z3JvdXBcIik7ICAvLyBHZXQgdGhlIG9wdGdyb3Vwc1xyXG4gICAgdmFyIHNlbGVjdFJlbmRlckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWxlY3RSZW5kZXJcIik7XHJcblxyXG4gICAgaWYgKHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXggLSAxIDwgMCkge1xyXG4gICAgICAvLyBDQU4nVCBETyBUSElTLCBzaG93IHJlZCBhcnJvd1xyXG4gICAgICB2YXIgYXJyb3cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93VXBcIik7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnKTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGMDAwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnLCB7IHByb3BlcnR5OiAnc2NhbGUnLCBkdXI6IDUwMCwgZnJvbTogXCIwLjAwNiAwLjAwMyAwLjAwNlwiLCB0bzogXCIwLjAwNCAwLjAwMiAwLjAwNFwiIH0pO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIENBTiBETyBUSElTLCBzaG93IHByZXZpb3VzIG9wdGdyb3VwXHJcblxyXG4gICAgICB0aGlzLnJlbW92ZVNlbGVjdE9wdGlvbnNSb3codGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCk7IC8vIHJlbW92ZSB0aGUgb2xkIG9wdGdyb3VwIHJvd1xyXG5cclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCAtPSAxO1xyXG4gICAgICB2YXIgc2VsZWN0ZWRPcHRncm91cEVsID0gb3B0Z3JvdXBzW3RoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXhdOyAgLy8gZmV0Y2ggdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBvcHRncm91cFxyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cFZhbHVlID0gc2VsZWN0ZWRPcHRncm91cEVsLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpOyAvLyBzZXQgY29tcG9uZW50IHByb3BlcnR5IHRvIG9wZ3JvdXAgdmFsdWVcclxuXHJcbiAgICAgIHRoaXMuZWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgdmFyIG5leHRTZWxlY3RlZE9wdGdyb3VwRWwgPSBvcHRncm91cHNbdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleF07ICAvLyBmZXRjaCB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9wdGdyb3VwXHJcbiAgICAgIC8vIHRoaXMubWFrZVNlbGVjdE9wdGlvbnNSb3cobmV4dFNlbGVjdGVkT3B0Z3JvdXBFbCwgc2VsZWN0UmVuZGVyRWwsIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXgsIC0wLjE1KTtcclxuICAgICAgdGhpcy5tYWtlU2VsZWN0T3B0aW9uc1JvdyhuZXh0U2VsZWN0ZWRPcHRncm91cEVsLCBzZWxlY3RSZW5kZXJFbCwgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCk7XHJcblxyXG4gICAgICAvLyBDaGFuZ2Ugc2VsZWN0ZWQgb3B0aW9uIGVsZW1lbnQgd2hlbiBvcHRncm91cCBpcyBjaGFuZ2VkXHJcbiAgICAgIHZhciBzZWxlY3RPcHRpb25zUm93RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VsZWN0T3B0aW9uc1JvdycgKyB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4KTtcclxuICAgICAgdmFyIG5ld2x5U2VsZWN0ZWRNZW51RWwgPSBzZWxlY3RPcHRpb25zUm93RWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2VsZWN0ZWQnKVswXTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSBzZWxlY3RPcHRpb25zVmFsdWUgYW5kIEluZGV4XHJcbiAgICAgIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGlvblZhbHVlID0gbmV3bHlTZWxlY3RlZE1lbnVFbC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKTtcclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uSW5kZXggPSBuZXdseVNlbGVjdGVkTWVudUVsLmdldEF0dHJpYnV0ZShcIm9wdGlvbmlkXCIpO1xyXG5cclxuICAgICAgdGhpcy5lbC5mbHVzaFRvRE9NKCk7XHJcblxyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51T3B0Z3JvdXBOZXh0XCIpO1xyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51Q2hhbmdlZFwiKTtcclxuXHJcbiAgICAgIHZhciBhcnJvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dVcFwiKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJyk7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScpO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwuY29sb3InLCBkdXI6IDUwMCwgZnJvbTogXCIjRkZGRjAwXCIsIHRvOiBcIiMwMDAwMDBcIiB9KTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiBcIjAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIjAuMDA0IDAuMDAyIDAuMDA0XCIgfSk7XHJcbiAgICB9XHJcblxyXG4gIH0sXHJcblxyXG4gIG9uVHJhY2twYWREb3duOiBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICAvL21lbnU6IG9ubHkgZGVhbCB3aXRoIHRyYWNrcGFkIGV2ZW50cyBmcm9tIGNvbnRyb2xsZXIgc3BlY2lmaWVkIGluIGNvbXBvbmVudCBwcm9wZXJ0eVxyXG4gICAgaWYgKGV2dC50YXJnZXQuaWQgIT0gdGhpcy5kYXRhLmNvbnRyb2xsZXJJRCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAvLyBXaGljaCBkaXJlY3Rpb24gc2hvdWxkIHRoZSB0cmFja3BhZCB0cmlnZ2VyP1xyXG5cclxuICAgIC8vIEVhY2ggb2YgdGhlIDQgYXJyb3cncyBncmVlbiBpbnRlbnNpdHkgaXMgaW52ZXJzZWx5IGNvcnJlbGF0ZWQgd2l0aCB0aW1lIGVsYXBzZWQgc2luY2UgbGFzdCBob3ZlciBldmVudCBvbiB0aGF0IGF4aXNcclxuICAgIC8vIFRvIGRldGVybWluZSB3aGljaCBkaXJlY3Rpb24gdG8gbW92ZSB1cG9uIGJ1dHRvbiBwcmVzcywgbW92ZSBpbiB0aGUgZGlyZWN0aW9uIHdpdGggdGhlIG1vc3QgZ3JlZW4gY29sb3IgaW50ZW5zaXR5XHJcblxyXG4gICAgLy8gRmV0Y2ggYWxsIDQgZ3JlZW4gdmFsdWVzIGFuZCBwbGFjZSBpbiBhbiBhcnJheSBzdGFydGluZyB3aXRoIHVwLCByaWdodCwgZG93biwgbGVmdCBhcnJvdyBjb2xvcnMgKGNsb2Nrd2lzZSBmcm9tIHRvcClcclxuICAgIHZhciBhcnJvd1VwQ29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1VwXCIpLmdldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIpLmNvbG9yKTtcclxuICAgIHZhciBhcnJvd1JpZ2h0Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1JpZ2h0XCIpLmdldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIpLmNvbG9yKTtcclxuICAgIHZhciBhcnJvd0Rvd25Db2xvciA9IG5ldyBUSFJFRS5Db2xvcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93RG93blwiKS5nZXRBdHRyaWJ1dGUoXCJtYXRlcmlhbFwiKS5jb2xvcik7XHJcbiAgICB2YXIgYXJyb3dMZWZ0Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0xlZnRcIikuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpO1xyXG4vLyAgICB2YXIgYXJyb3dDb2xvckFycmF5ID0gW2Fycm93VXBDb2xvciwgYXJyb3dSaWdodENvbG9yLCBhcnJvd0Rvd25Db2xvciwgYXJyb3dMZWZ0Q29sb3JdO1xyXG4gICAgdmFyIGFycm93Q29sb3JBcnJheUdyZWVuID0gW2Fycm93VXBDb2xvci5nLCBhcnJvd1JpZ2h0Q29sb3IuZywgYXJyb3dEb3duQ29sb3IuZywgYXJyb3dMZWZ0Q29sb3IuZ107XHJcblxyXG4gICAgaWYgKCBhcnJvd0NvbG9yQXJyYXlHcmVlbi5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSA+IDApIHsgLy8gaWYgYXQgbGVhc3Qgb25lIHZhbHVlIGlzID4gMFxyXG4gICAgICBzd2l0Y2ggKGluZGV4T2ZNYXgoYXJyb3dDb2xvckFycmF5R3JlZW4pKSB7ICAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIHZhbHVlIGluIHRoZSBhcnJheSBpcyB0aGUgbGFyZ2VzdFxyXG4gICAgICAgIGNhc2UgMDogICAgICAgIC8vIHVwXHJcbiAgICAgICAgICB0aGlzLm9uT3B0Z3JvdXBQcmV2aW91cygpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJQUkVTU3VwXCIpO1xyXG4gICAgICAgICAgcmV0dXJuOyAvLyB3aXRob3V0IHRoaXMgcmV0dXJuIHRoZSBvdGhlciBjYXNlcyBhcmUgZmlyZWQgLSB3ZWlyZCFcclxuICAgICAgICBjYXNlIDE6ICAgICAgICAvLyByaWdodFxyXG4gICAgICAgICAgdGhpcy5vbk9wdGlvblN3aXRjaChcIm5leHRcIik7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlBSRVNTcmlnaHRcIik7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY2FzZSAyOiAgICAgICAgLy8gZG93blxyXG4gICAgICAgICAgdGhpcy5vbk9wdGdyb3VwTmV4dCgpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJQUkVTU2Rvd25cIik7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY2FzZSAzOiAgICAgICAgLy8gbGVmdFxyXG4gICAgICAgICAgdGhpcy5vbk9wdGlvblN3aXRjaChcInByZXZpb3VzXCIpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJQUkVTU2xlZnRcIik7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfSxcclxuXHJcbiAgb25PcHRpb25Td2l0Y2g6IGZ1bmN0aW9uIChkaXJlY3Rpb24pIHtcclxuXHJcbiAgICAvLyBTd2l0Y2ggdG8gdGhlIG5leHQgb3B0aW9uLCBvciBzd2l0Y2ggaW4gdGhlIGRpcmVjdGlvbiBvZiB0aGUgbW9zdCByZWNlbnRseSBob3ZlcmVkIGRpcmVjdGlvbmFsIGFycm93XHJcbiAgICAvLyBtZW51OiBzYXZlIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgbWVudSBlbGVtZW50XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImRpcmVjdGlvbj9cIik7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhkaXJlY3Rpb24pO1xyXG4gICAgdmFyIHNlbGVjdE9wdGlvbnNSb3dFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWxlY3RPcHRpb25zUm93JyArIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXgpO1xyXG5cclxuICAgIGNvbnN0IG9sZE1lbnVFbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzZWxlY3RlZCcpWzBdO1xyXG4gICAgLy8gY29uc29sZS5sb2cob2xkTWVudUVsKTtcclxuXHJcbiAgICB2YXIgb2xkU2VsZWN0ZWRPcHRpb25JbmRleCA9IHBhcnNlSW50KG9sZE1lbnVFbC5nZXRBdHRyaWJ1dGUoXCJvcHRpb25pZFwiKSk7XHJcbiAgICB2YXIgc2VsZWN0ZWRPcHRpb25JbmRleCA9IG9sZFNlbGVjdGVkT3B0aW9uSW5kZXg7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhzZWxlY3RlZE9wdGlvbkluZGV4KTtcclxuXHJcbiAgICB2YXIgc2VsZWN0RWwgPSB0aGlzLmVsOyAgLy8gUmVmZXJlbmNlIHRvIHRoZSBjb21wb25lbnQncyBlbnRpdHkuXHJcbiAgICB2YXIgb3B0Z3JvdXBzID0gc2VsZWN0RWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRncm91cFwiKTsgIC8vIEdldCB0aGUgb3B0Z3JvdXBzXHJcbiAgICB2YXIgc2VsZWN0ZWRPcHRncm91cEVsID0gb3B0Z3JvdXBzW3RoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXhdOyAgLy8gZmV0Y2ggdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBvcHRncm91cFxyXG5cclxuICAgIGlmIChkaXJlY3Rpb24gPT0gJ3ByZXZpb3VzJykge1xyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51UHJldmlvdXNcIik7XHJcbiAgICAgIC8vIFBSRVZJT1VTIE9QVElPTiBNRU5VIFNUQVJUID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgICAgc2VsZWN0ZWRPcHRpb25JbmRleCA9IGxvb3BJbmRleChzZWxlY3RlZE9wdGlvbkluZGV4IC09IDEsIHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZEVsZW1lbnRDb3VudCk7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKHNlbGVjdGVkT3B0aW9uSW5kZXgpO1xyXG5cclxuICAgICAgLy8gbWVudTogYW5pbWF0ZSBhcnJvdyBMRUZUXHJcbiAgICAgIHZhciBhcnJvd0xlZnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93TGVmdFwiKTtcclxuICAgICAgYXJyb3dMZWZ0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvd0xlZnQucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknKTtcclxuICAgICAgYXJyb3dMZWZ0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScpO1xyXG4gICAgICBhcnJvd0xlZnQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93TGVmdC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5vcGFjaXR5JywgZHVyOiA1MDAsIGZyb206IFwiMVwiLCB0bzogXCIwLjVcIiB9KTtcclxuICAgICAgYXJyb3dMZWZ0LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiBcIjAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIjAuMDA0IDAuMDAyIDAuMDA0XCIgfSk7XHJcblxyXG4gICAgICAvLyBtZW51OiBnZXQgdGhlIG5ld2x5IHNlbGVjdGVkIG1lbnUgZWxlbWVudFxyXG4gICAgICBjb25zdCBuZXdNZW51RWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBzZWxlY3RlZE9wdGlvbkluZGV4ICsgXCInXVwiKVswXTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IHJlbW92ZSBzZWxlY3RlZCBjbGFzcyBhbmQgY2hhbmdlIGNvbG9yc1xyXG4gICAgICBvbGRNZW51RWwuY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkXCIpO1xyXG4gICAgICBuZXdNZW51RWwuY2xhc3NMaXN0LmFkZChcInNlbGVjdGVkXCIpO1xyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRpb25WYWx1ZSA9IG5ld01lbnVFbC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKTtcclxuICAgICAgY29uc29sZS5sb2codGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uVmFsdWUpO1xyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRpb25JbmRleCA9IHNlbGVjdGVkT3B0aW9uSW5kZXg7XHJcbiAgICAgIHRoaXMuZWwuZmx1c2hUb0RPTSgpO1xyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51Q2hhbmdlZFwiKTtcclxuICAgICAgb2xkTWVudUVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAnZ3JheScpO1xyXG4gICAgICBuZXdNZW51RWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm9iamVjdE5hbWVcIilbMF0uc2V0QXR0cmlidXRlKCdibWZvbnQtdGV4dCcsICdjb2xvcicsICd5ZWxsb3cnKTtcclxuICAgICAgb2xkTWVudUVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJwcmV2aWV3RnJhbWVcIilbMF0uc2V0QXR0cmlidXRlKCdtYXRlcmlhbCcsICdjb2xvcicsICcjMjIyMjIyJyk7XHJcbiAgICAgIG5ld01lbnVFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJldmlld0ZyYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCAnY29sb3InLCAneWVsbG93Jyk7XHJcblxyXG4gICAgICAvLyBtZW51OiBzbGlkZSB0aGUgbWVudSBsaXN0IHJvdyBSSUdIVCBieSAxXHJcbi8vICAgICAgY29uc3Qgc2VsZWN0T3B0aW9uc1Jvd0VsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZWxlY3RPcHRpb25zUm93XCIpO1xyXG4gICAgICAvLyB1c2UgdGhlIGRlc2lyZWRQb3NpdGlvbiBhdHRyaWJ1dGUgKGlmIGV4aXN0cykgaW5zdGVhZCBvZiBvYmplY3QzRCBwb3NpdGlvbiBhcyBhbmltYXRpb24gbWF5IG5vdCBiZSBkb25lIHlldFxyXG4gICAgICBpZiAoc2VsZWN0T3B0aW9uc1Jvd0VsLmhhc0F0dHJpYnV0ZShcImRlc2lyZWRQb3NpdGlvblwiKSkge1xyXG4gICAgICAgIHZhciBvbGRQb3NpdGlvbiA9IHNlbGVjdE9wdGlvbnNSb3dFbC5nZXRBdHRyaWJ1dGUoXCJkZXNpcmVkUG9zaXRpb25cIik7XHJcbiAgICAgICAgdmFyIG5ld1ggPSBwYXJzZUZsb2F0KG9sZFBvc2l0aW9uLnNwbGl0KFwiIFwiKVswXSkgKyAwLjA3NTtcclxuICAgICAgICB2YXIgbmV3UG9zaXRpb25TdHJpbmcgPSBuZXdYLnRvU3RyaW5nKCkgKyBcIiBcIiArIG9sZFBvc2l0aW9uLnNwbGl0KFwiIFwiKVsxXSArIFwiIFwiICsgb2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzJdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBvbGRQb3NpdGlvbiA9IHNlbGVjdE9wdGlvbnNSb3dFbC5vYmplY3QzRC5wb3NpdGlvbjtcclxuICAgICAgICB2YXIgbmV3WCA9IG9sZFBvc2l0aW9uLnggKyAwLjA3NTsgLy8gdGhpcyBjb3VsZCBiZSBhIHZhcmlhYmxlIGF0IHRoZSBjb21wb25lbnQgbGV2ZWxcclxuICAgICAgICB2YXIgbmV3UG9zaXRpb25TdHJpbmcgPSBuZXdYLnRvU3RyaW5nKCkgKyBcIiBcIiArIG9sZFBvc2l0aW9uLnkgKyBcIiBcIiArIG9sZFBvc2l0aW9uLno7XHJcbiAgICAgIH1cclxuICAgICAgc2VsZWN0T3B0aW9uc1Jvd0VsLnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zbGlkZScpO1xyXG4gICAgICBzZWxlY3RPcHRpb25zUm93RWwuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX3NsaWRlJywgeyBwcm9wZXJ0eTogJ3Bvc2l0aW9uJywgZHVyOiA1MDAsIGZyb206IG9sZFBvc2l0aW9uLCB0bzogbmV3UG9zaXRpb25TdHJpbmcgfSk7XHJcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5zZXRBdHRyaWJ1dGUoJ2Rlc2lyZWRQb3NpdGlvbicsIG5ld1Bvc2l0aW9uU3RyaW5nKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IG1ha2UgdGhlIGhpZGRlbiBtb3N0IExFRlRtb3N0IG9iamVjdCAoLTMgZnJvbSBvbGRNZW51RWwgaW5kZXgpIHZpc2libGVcclxuICAgICAgdmFyIG5ld2x5VmlzaWJsZU9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggLSAzLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlWaXNpYmxlT3B0aW9uRWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBuZXdseVZpc2libGVPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcblxyXG4gICAgICAvLyBtYWtlIHZpc2libGUgYW5kIGFuaW1hdGVcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywndHJ1ZScpO1xyXG4gICAgICBuZXdseVZpc2libGVPcHRpb25FbC5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbicpO1xyXG4gICAgICBuZXdseVZpc2libGVPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbicsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiAnMC41IDAuNSAwLjUnLCB0bzogJzEuMCAxLjAgMS4wJyB9KTtcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgLy8gbWVudTogZGVzdHJveSB0aGUgaGlkZGVuIG1vc3QgUklHSFRtb3N0IG9iamVjdCAoKzMgZnJvbSBvbGRNZW51RWwgaW5kZXgpXHJcbiAgICAgIHZhciBuZXdseVJlbW92ZWRPcHRpb25JbmRleCA9IGxvb3BJbmRleChvbGRTZWxlY3RlZE9wdGlvbkluZGV4ICsgMywgc2VsZWN0ZWRPcHRncm91cEVsLmNoaWxkRWxlbWVudENvdW50KTtcclxuICAgICAgdmFyIG5ld2x5UmVtb3ZlZE9wdGlvbkVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbb3B0aW9uaWQ9J1wiICsgbmV3bHlSZW1vdmVkT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xyXG4gICAgICBuZXdseVJlbW92ZWRPcHRpb25FbC5mbHVzaFRvRE9NKCk7XHJcbiAgICAgIG5ld2x5UmVtb3ZlZE9wdGlvbkVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobmV3bHlSZW1vdmVkT3B0aW9uRWwpO1xyXG5cclxuICAgICAgLy8gbWVudTogbWFrZSB0aGUgc2Vjb25kIFJJR0hUbW9zdCBvYmplY3QgKCsyIGZyb20gb2xkTWVudUVsIGluZGV4KSBpbnZpc2libGVcclxuICAgICAgdmFyIG5ld2x5SW52aXNpYmxlT3B0aW9uSW5kZXggPSBsb29wSW5kZXgob2xkU2VsZWN0ZWRPcHRpb25JbmRleCArIDIsIHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZEVsZW1lbnRDb3VudCk7XHJcbiAgICAgIHZhciBuZXdseUludmlzaWJsZU9wdGlvbkVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbb3B0aW9uaWQ9J1wiICsgbmV3bHlJbnZpc2libGVPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcbiAgICAgIG5ld2x5SW52aXNpYmxlT3B0aW9uRWwuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywgJ2ZhbHNlJyk7XHJcbiAgICAgIG5ld2x5SW52aXNpYmxlT3B0aW9uRWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgLy8gbWVudTogQ3JlYXRlIHRoZSBuZXh0IExFRlRtb3N0IG9iamVjdCBwcmV2aWV3ICgtNCBmcm9tIG9sZE1lbnVFbCBpbmRleCkgYnV0IGtlZXAgaXQgaGlkZGVuIHVudGlsIGl0J3MgbmVlZGVkXHJcbiAgICAgIHZhciBuZXdseUNyZWF0ZWRPcHRpb25FbCA9IG5ld2x5VmlzaWJsZU9wdGlvbkVsLmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgbmV3bHlDcmVhdGVkT3B0aW9uRWwuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywgJ2ZhbHNlJyk7XHJcbiAgICAgIHZhciBuZXdseUNyZWF0ZWRPcHRpb25JbmRleCA9IGxvb3BJbmRleChvbGRTZWxlY3RlZE9wdGlvbkluZGV4IC0gNCwgc2VsZWN0ZWRPcHRncm91cEVsLmNoaWxkRWxlbWVudENvdW50KTtcclxuXHJcbiAgICAgIC8vIGdldCB0aGUgYWN0dWFsIFwib3B0aW9uXCIgZWxlbWVudCB0aGF0IGlzIHRoZSBzb3VyY2Ugb2YgdHJ1dGggZm9yIHZhbHVlLCBpbWFnZSBzcmMgYW5kIGxhYmVsIHNvIHRoYXQgd2UgY2FuIHBvcHVsYXRlIHRoZSBuZXcgbWVudSBvcHRpb25cclxuICAgICAgdmFyIHNvdXJjZU9wdGlvbkVsID0gc2VsZWN0ZWRPcHRncm91cEVsLmNoaWxkcmVuW25ld2x5Q3JlYXRlZE9wdGlvbkluZGV4XTtcclxuXHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLnNldEF0dHJpYnV0ZSgnb3B0aW9uaWQnLCBuZXdseUNyZWF0ZWRPcHRpb25JbmRleCk7XHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLnNldEF0dHJpYnV0ZSgnaWQnLCAnbWVudScgKyBuZXdseUNyZWF0ZWRPcHRpb25JbmRleCk7XHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLnNldEF0dHJpYnV0ZSgndmFsdWUnLCBzb3VyY2VPcHRpb25FbC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKSk7XHJcblxyXG4gICAgICB2YXIgbmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24gPSBuZXdseVZpc2libGVPcHRpb25FbC5vYmplY3QzRC5wb3NpdGlvbjtcclxuICAgICAgbmV3bHlDcmVhdGVkT3B0aW9uRWwuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIChuZXdseVZpc2libGVPcHRpb25Qb3NpdGlvbi54IC0gMC4wNzUpICsgXCIgXCIgKyBuZXdseVZpc2libGVPcHRpb25Qb3NpdGlvbi55ICsgXCIgXCIgKyBuZXdseVZpc2libGVPcHRpb25Qb3NpdGlvbi56KTtcclxuICAgICAgbmV3bHlDcmVhdGVkT3B0aW9uRWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgLy8gbWVudTogYWRkIHRoZSBuZXdseSBjbG9uZWQgYW5kIG1vZGlmaWVkIG1lbnUgb2JqZWN0IHByZXZpZXcgdG8gdGhlIGRvbVxyXG4gICAgICBzZWxlY3RPcHRpb25zUm93RWwuaW5zZXJ0QmVmb3JlKCBuZXdseUNyZWF0ZWRPcHRpb25FbCwgc2VsZWN0T3B0aW9uc1Jvd0VsLmZpcnN0Q2hpbGQgKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IGdldCBjaGlsZCBlbGVtZW50cyBmb3IgaW1hZ2UgYW5kIG5hbWUsIHBvcHVsYXRlIGJvdGggYXBwcm9wcmlhdGVseVxyXG4gICAgICB2YXIgYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5xdWVyeVNlbGVjdG9yQWxsKFwiW29wdGlvbmlkPSdcIiArIG5ld2x5Q3JlYXRlZE9wdGlvbkluZGV4ICsgXCInXVwiKVswXTtcclxuICAgICAgYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJldmlld0ltYWdlXCIpWzBdLnNldEF0dHJpYnV0ZSgnc3JjJywgc291cmNlT3B0aW9uRWwuZ2V0QXR0cmlidXRlKFwic3JjXCIpKVxyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAndGV4dCcsIHNvdXJjZU9wdGlvbkVsLnRleHQpO1xyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAnIzc0NzQ3NCcpO1xyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAvLyBQUkVWSU9VUyBPUFRJT04gTUVOVSBFTkQgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZWwuZW1pdChcIm1lbnVOZXh0XCIpO1xyXG4gICAgICAvLyBORVhUIE9QVElPTiBNRU5VIFNUQVJUID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgICAgc2VsZWN0ZWRPcHRpb25JbmRleCA9IGxvb3BJbmRleChzZWxlY3RlZE9wdGlvbkluZGV4ICs9IDEsIHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZEVsZW1lbnRDb3VudCk7XHJcblxyXG4gICAgICAvLyBtZW51OiBhbmltYXRlIGFycm93IHJpZ2h0XHJcbiAgICAgIHZhciBhcnJvd1JpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1JpZ2h0XCIpO1xyXG4gICAgICBhcnJvd1JpZ2h0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvd1JpZ2h0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XHJcbiAgICAgIGFycm93UmlnaHQucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJyk7XHJcbiAgICAgIGFycm93UmlnaHQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93UmlnaHQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XHJcbiAgICAgIGFycm93UmlnaHQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJywgeyBwcm9wZXJ0eTogJ3NjYWxlJywgZHVyOiA1MDAsIGZyb206IFwiLTAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIi0wLjAwNCAwLjAwMiAwLjAwNFwiIH0pO1xyXG5cclxuICAgICAgLy8gbWVudTogZ2V0IHRoZSBuZXdseSBzZWxlY3RlZCBtZW51IGVsZW1lbnRcclxuICAgICAgY29uc3QgbmV3TWVudUVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbb3B0aW9uaWQ9J1wiICsgc2VsZWN0ZWRPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcblxyXG4gICAgICAvLyBtZW51OiByZW1vdmUgc2VsZWN0ZWQgY2xhc3MgYW5kIGNoYW5nZSBjb2xvcnNcclxuICAgICAgb2xkTWVudUVsLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgbmV3TWVudUVsLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uVmFsdWUgPSBuZXdNZW51RWwuZ2V0QXR0cmlidXRlKFwidmFsdWVcIik7XHJcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZGF0YS5zZWxlY3RlZE9wdGlvblZhbHVlKTtcclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uSW5kZXggPSBzZWxlY3RlZE9wdGlvbkluZGV4O1xyXG4gICAgICB0aGlzLmVsLmZsdXNoVG9ET00oKTtcclxuICAgICAgdGhpcy5lbC5lbWl0KFwibWVudUNoYW5nZWRcIik7XHJcbiAgICAgIG9sZE1lbnVFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwib2JqZWN0TmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ2JtZm9udC10ZXh0JywgJ2NvbG9yJywgJ2dyYXknKTtcclxuICAgICAgbmV3TWVudUVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAneWVsbG93Jyk7XHJcbiAgICAgIG9sZE1lbnVFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJldmlld0ZyYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCAnY29sb3InLCAnIzIyMjIyMicpO1xyXG4gICAgICBuZXdNZW51RWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInByZXZpZXdGcmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ21hdGVyaWFsJywgJ2NvbG9yJywgJ3llbGxvdycpO1xyXG5cclxuICAgICAgLy8gbWVudTogc2xpZGUgdGhlIG1lbnUgbGlzdCBsZWZ0IGJ5IDFcclxuLy8gICAgICBjb25zdCBzZWxlY3RPcHRpb25zUm93RWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NlbGVjdE9wdGlvbnNSb3dcIik7XHJcbiAgICAgIC8vIHVzZSB0aGUgZGVzaXJlZFBvc2l0aW9uIGF0dHJpYnV0ZSAoaWYgZXhpc3RzKSBpbnN0ZWFkIG9mIG9iamVjdDNEIHBvc2l0aW9uIGFzIGFuaW1hdGlvbiBtYXkgbm90IGJlIGRvbmUgeWV0XHJcbiAgICAgIC8vIFRPRE8gLSBlcnJvciB3aXRoIHRoaXMgY29kZSB3aGVuIGxvb3BpbmcgdGhyb3VnaCBpbmRleFxyXG5cclxuLy8gICAgICBjb25zb2xlLmxvZyhcIid0cnVlJyBvbGQgcG9zaXRpb25cIik7XHJcbi8vICAgICAgY29uc29sZS5sb2coc2VsZWN0T3B0aW9uc1Jvd0VsLm9iamVjdDNELnBvc2l0aW9uKTtcclxuXHJcbiAgICAgIGlmIChzZWxlY3RPcHRpb25zUm93RWwuaGFzQXR0cmlidXRlKFwiZGVzaXJlZFBvc2l0aW9uXCIpKSB7XHJcbi8vICAgICAgICBjb25zb2xlLmxvZygnZGVzaXJlZFBvc2l0aW9uJyk7XHJcbiAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0gc2VsZWN0T3B0aW9uc1Jvd0VsLmdldEF0dHJpYnV0ZShcImRlc2lyZWRQb3NpdGlvblwiKTtcclxuLy8gICAgICAgIGNvbnNvbGUubG9nKG9sZFBvc2l0aW9uKTtcclxuICAgICAgICB2YXIgbmV3WCA9IHBhcnNlRmxvYXQob2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzBdKSAtIDAuMDc1O1xyXG4gICAgICAgIHZhciBuZXdQb3NpdGlvblN0cmluZyA9IG5ld1gudG9TdHJpbmcoKSArIFwiIFwiICsgb2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzFdICsgXCIgXCIgKyBvbGRQb3NpdGlvbi5zcGxpdChcIiBcIilbMl07XHJcbi8vICAgICAgICBjb25zb2xlLmxvZyhuZXdQb3NpdGlvblN0cmluZyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0gc2VsZWN0T3B0aW9uc1Jvd0VsLm9iamVjdDNELnBvc2l0aW9uO1xyXG4gICAgICAgIHZhciBuZXdYID0gb2xkUG9zaXRpb24ueCAtIDAuMDc1OyAvLyB0aGlzIGNvdWxkIGJlIGEgdmFyaWFibGUgc29vblxyXG4gICAgICAgIHZhciBuZXdQb3NpdGlvblN0cmluZyA9IG5ld1gudG9TdHJpbmcoKSArIFwiIFwiICsgb2xkUG9zaXRpb24ueSArIFwiIFwiICsgb2xkUG9zaXRpb24uejtcclxuLy8gICAgICAgIGNvbnNvbGUubG9nKG5ld1Bvc2l0aW9uU3RyaW5nKTtcclxuICAgICAgfVxyXG4gICAgICBzZWxlY3RPcHRpb25zUm93RWwucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX3NsaWRlJyk7XHJcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2xpZGUnLCB7IHByb3BlcnR5OiAncG9zaXRpb24nLCBkdXI6IDUwMCwgZnJvbTogb2xkUG9zaXRpb24sIHRvOiBuZXdQb3NpdGlvblN0cmluZyB9KTtcclxuICAgICAgc2VsZWN0T3B0aW9uc1Jvd0VsLnNldEF0dHJpYnV0ZSgnZGVzaXJlZFBvc2l0aW9uJywgbmV3UG9zaXRpb25TdHJpbmcpO1xyXG5cclxuICAgICAgLy8gbWVudTogbWFrZSB0aGUgaGlkZGVuIG1vc3QgcmlnaHRtb3N0IG9iamVjdCAoKzMgZnJvbSBvbGRNZW51RWwgaW5kZXgpIHZpc2libGVcclxuICAgICAgdmFyIG5ld2x5VmlzaWJsZU9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggKyAzLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlWaXNpYmxlT3B0aW9uRWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBuZXdseVZpc2libGVPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcblxyXG4gICAgICAvLyBtYWtlIHZpc2libGUgYW5kIGFuaW1hdGVcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywndHJ1ZScpO1xyXG4gICAgICBuZXdseVZpc2libGVPcHRpb25FbC5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbicpO1xyXG4gICAgICBuZXdseVZpc2libGVPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbicsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiAnMC41IDAuNSAwLjUnLCB0bzogJzEuMCAxLjAgMS4wJyB9KTtcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgLy8gbWVudTogZGVzdHJveSB0aGUgaGlkZGVuIG1vc3QgbGVmdG1vc3Qgb2JqZWN0ICgtMyBmcm9tIG9sZE1lbnVFbCBpbmRleClcclxuICAgICAgdmFyIG5ld2x5UmVtb3ZlZE9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggLSAzLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlSZW1vdmVkT3B0aW9uRWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBuZXdseVJlbW92ZWRPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcbiAgICAgIG5ld2x5UmVtb3ZlZE9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuICAgICAgbmV3bHlSZW1vdmVkT3B0aW9uRWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuZXdseVJlbW92ZWRPcHRpb25FbCk7XHJcblxyXG4gICAgICAvLyBtZW51OiBtYWtlIHRoZSBzZWNvbmQgbGVmdG1vc3Qgb2JqZWN0ICgtMiBmcm9tIG9sZE1lbnVFbCBpbmRleCkgaW52aXNpYmxlXHJcbiAgICAgIHZhciBuZXdseUludmlzaWJsZU9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggLSAyLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlJbnZpc2libGVPcHRpb25FbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5xdWVyeVNlbGVjdG9yQWxsKFwiW29wdGlvbmlkPSdcIiArIG5ld2x5SW52aXNpYmxlT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xyXG4gICAgICBuZXdseUludmlzaWJsZU9wdGlvbkVsLnNldEF0dHJpYnV0ZSgndmlzaWJsZScsICdmYWxzZScpO1xyXG4gICAgICBuZXdseUludmlzaWJsZU9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IENyZWF0ZSB0aGUgbmV4dCByaWdodG1vc3Qgb2JqZWN0IHByZXZpZXcgKCs0IGZyb20gb2xkTWVudUVsIGluZGV4KSBidXQga2VlcCBpdCBoaWRkZW4gdW50aWwgaXQncyBuZWVkZWRcclxuICAgICAgdmFyIG5ld2x5Q3JlYXRlZE9wdGlvbkVsID0gbmV3bHlWaXNpYmxlT3B0aW9uRWwuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ3Zpc2libGUnLCAnZmFsc2UnKTtcclxuICAgICAgdmFyIG5ld2x5Q3JlYXRlZE9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggKyA0LCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4vLyAgICAgIGNvbnNvbGUubG9nKFwibmV3bHlDcmVhdGVkT3B0aW9uSW5kZXg6IFwiICsgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgpO1xyXG4gICAgICAvLyBnZXQgdGhlIGFjdHVhbCBcIm9wdGlvblwiIGVsZW1lbnQgdGhhdCBpcyB0aGUgc291cmNlIG9mIHRydXRoIGZvciB2YWx1ZSwgaW1hZ2Ugc3JjIGFuZCBsYWJlbCBzbyB0aGF0IHdlIGNhbiBwb3B1bGF0ZSB0aGUgbmV3IG1lbnUgb3B0aW9uXHJcbiAgICAgIHZhciBzb3VyY2VPcHRpb25FbCA9IHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZHJlbltuZXdseUNyZWF0ZWRPcHRpb25JbmRleF07XHJcbi8vICAgICAgY29uc29sZS5sb2coXCJzb3VyY2VPcHRpb25FbFwiKTtcclxuLy8gICAgICBjb25zb2xlLmxvZyhzb3VyY2VPcHRpb25FbCk7XHJcblxyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ29wdGlvbmlkJywgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgpO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21lbnUnICsgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgpO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgc291cmNlT3B0aW9uRWwuZ2V0QXR0cmlidXRlKFwidmFsdWVcIikpO1xyXG5cclxuICAgICAgdmFyIG5ld2x5VmlzaWJsZU9wdGlvblBvc2l0aW9uID0gbmV3bHlWaXNpYmxlT3B0aW9uRWwub2JqZWN0M0QucG9zaXRpb247XHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCAobmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24ueCArIDAuMDc1KSArIFwiIFwiICsgbmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24ueSArIFwiIFwiICsgbmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24ueik7XHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IGFkZCB0aGUgbmV3bHkgY2xvbmVkIGFuZCBtb2RpZmllZCBtZW51IG9iamVjdCBwcmV2aWV3XHJcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5pbnNlcnRCZWZvcmUoIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLCBzZWxlY3RPcHRpb25zUm93RWwuZmlyc3RDaGlsZCApO1xyXG5cclxuICAgICAgLy8gbWVudTogZ2V0IGNoaWxkIGVsZW1lbnRzIGZvciBpbWFnZSBhbmQgbmFtZSwgcG9wdWxhdGUgYm90aCBhcHByb3ByaWF0ZWx5XHJcbiAgICAgIHZhciBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbb3B0aW9uaWQ9J1wiICsgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xyXG5cclxuICAgICAgYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJldmlld0ltYWdlXCIpWzBdLnNldEF0dHJpYnV0ZSgnc3JjJywgc291cmNlT3B0aW9uRWwuZ2V0QXR0cmlidXRlKFwic3JjXCIpKVxyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAndGV4dCcsIHNvdXJjZU9wdGlvbkVsLnRleHQpO1xyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAnIzc0NzQ3NCcpO1xyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIC8vIE5FWFQgTUVOVSBPUFRJT04gRU5EID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIH1cclxuXHJcblxyXG4gIH1cclxuXHJcbn0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvYWZyYW1lLXNlbGVjdC1iYXIuanMiLCIvKiBnbG9iYWwgQUZSQU1FICovXHJcblxyXG5pZiAodHlwZW9mIEFGUkFNRSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xyXG59XHJcblxyXG52YXIgb2JqZWN0Q291bnQgPSAwOyAvLyBzY2VuZSBzdGFydHMgd2l0aCAwIGl0ZW1zXHJcblxyXG5mdW5jdGlvbiBodW1hbml6ZShzdHIpIHtcclxuICB2YXIgZnJhZ3MgPSBzdHIuc3BsaXQoJ18nKTtcclxuICB2YXIgaT0wO1xyXG4gIGZvciAoaT0wOyBpPGZyYWdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBmcmFnc1tpXSA9IGZyYWdzW2ldLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZnJhZ3NbaV0uc2xpY2UoMSk7XHJcbiAgfVxyXG4gIHJldHVybiBmcmFncy5qb2luKCcgJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWaXZlIENvbnRyb2xsZXIgVGVtcGxhdGUgY29tcG9uZW50IGZvciBBLUZyYW1lLlxyXG4gKiBNb2RpZmVkIGZyb20gQS1GcmFtZSBEb21pbm9lcy5cclxuICovXHJcbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnYnVpbGRlci1jb250cm9scycsIHtcclxuICBzY2hlbWE6IHtcclxuICAgIG1lbnVJZDoge3R5cGU6IFwic3RyaW5nXCIsIGRlZmF1bHQ6IFwibWVudVwifVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBpZiBjb21wb25lbnQgbmVlZHMgbXVsdGlwbGUgaW5zdGFuY2luZy5cclxuICAgKi9cclxuICBtdWx0aXBsZTogZmFsc2UsXHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBldmVudCBsaXN0ZW5lcnMuXHJcbiAgICovXHJcbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBlbCA9IHRoaXMuZWw7XHJcbiAgICAvLyBBcHBsaWNhYmxlIHRvIGJvdGggVml2ZSBhbmQgT2N1bHVzIFRvdWNoIGNvbnRyb2xzXHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCd0cmlnZ2VyZG93bicsIHRoaXMub25QbGFjZU9iamVjdC5iaW5kKHRoaXMpKTtcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2dyaXBkb3duJywgdGhpcy5vblVuZG8uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5tZW51SWQpO1xyXG4gICAgbWVudUVsLmFkZEV2ZW50TGlzdGVuZXIoJ21lbnVDaGFuZ2VkJywgdGhpcy5vbk9iamVjdENoYW5nZS5iaW5kKHRoaXMpKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxyXG4gICAqL1xyXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJpZ2dlcmRvd24nLCB0aGlzLm9uUGxhY2VPYmplY3QpO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignZ3JpcGRvd24nLCB0aGlzLm9uVW5kbyk7XHJcbiAgfSxcclxuXHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyBnZXQgdGhlIGxpc3Qgb2Ygb2JqZWN0IGdyb3VwIGpzb24gZGlyZWN0b3JpZXMgLSB3aGljaCBqc29uIGZpbGVzIHNob3VsZCB3ZSByZWFkP1xyXG4gICAgICAvLyBmb3IgZWFjaCBncm91cCwgZmV0Y2ggdGhlIGpzb24gZmlsZSBhbmQgcG9wdWxhdGUgdGhlIG9wdGdyb3VwIGFuZCBvcHRpb24gZWxlbWVudHMgYXMgY2hpbGRyZW4gb2YgdGhlIGFwcHJvcHJpYXRlIG1lbnUgZWxlbWVudFxyXG4gICAgICB2YXIgbGlzdCA9IFtcImtmYXJyX2Jhc2VzXCIsXHJcbiAgICAgICAgICAgICAgXCJtbW1tX3ZlaFwiLFxyXG4gICAgICAgICAgICAgIFwibW1tbV9ibGRcIixcclxuICAgICAgICAgICAgICBcIm1tbW1fYWxpZW5cIixcclxuICAgICAgICAgICAgICBcIm1tbW1fc2NlbmVcIixcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgIHZhciBncm91cEpTT05BcnJheSA9IFtdO1xyXG5cclxuICAgICAgLy8gVE9ETzogd3JhcCB0aGlzIGluIHByb21pc2UgYW5kIHRoZW4gcmVxdWVzdCBhZnJhbWUtc2VsZWN0LWJhciBjb21wb25lbnQgdG8gcmUtaW5pdFxyXG4gICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24gKGdyb3VwTmFtZSwgaW5kZXgpIHtcclxuICAgICAgICAvLyBleGNlbGxlbnQgcmVmZXJlbmNlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0phdmFTY3JpcHQvT2JqZWN0cy9KU09OXHJcbiAgICAgICAgdmFyIHJlcXVlc3RVUkwgPSAnYXNzZXRzLycgKyBncm91cE5hbWUgKyBcIi5qc29uXCI7XHJcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHJlcXVlc3RVUkwpO1xyXG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xyXG4gICAgICAgIHJlcXVlc3Quc2VuZCgpO1xyXG5cclxuICAgICAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyAvLyBmb3IgZWFjaCBncm91cGxpc3QganNvbiBmaWxlIHdoZW4gbG9hZGVkXHJcbiAgICAgICAgICBncm91cEpTT05BcnJheVtncm91cE5hbWVdID0gcmVxdWVzdC5yZXNwb25zZTtcclxuICAgICAgICAgIC8vIGxpdGVyYWxseSBhZGQgdGhpcyBzaGl0IHRvIHRoZSBkb20gZHVkZVxyXG4gICAgICAgICAgLy8gY29uc29sZS5sb2coZ3JvdXBKU09OQXJyYXlbZ3JvdXBOYW1lXSk7XHJcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImdyb3VwTmFtZTogXCIgKyBncm91cE5hbWUpO1xyXG5cclxuICAgICAgICAgIC8vIGZpbmQgdGhlIG9wdGdyb3VwIHBhcmVudCBlbGVtZW50IC0gdGhlIG1lbnUgb3B0aW9uP1xyXG4gICAgICAgICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVudVwiKTtcclxuXHJcbiAgICAgICAgICAvLyBhZGQgdGhlIHBhcmVudCBvcHRncm91cCBub2RlIGxpa2U6IDxvcHRncm91cCBsYWJlbD1cIkFsaWVuc1wiIHZhbHVlPVwibW1tbV9hbGllblwiPlxyXG4gICAgICAgICAgdmFyIG5ld09wdGdyb3VwRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0Z3JvdXBcIik7XHJcbiAgICAgICAgICBuZXdPcHRncm91cEVsLnNldEF0dHJpYnV0ZShcImxhYmVsXCIsIGh1bWFuaXplKGdyb3VwTmFtZSkpOyAvLyBUT0RPOiB0aGlzIHNob3VsZCBiZSBhIHByZXR0aWVyIGxhYmVsLCBub3QgdGhlIGZpbGVuYW1lXHJcbiAgICAgICAgICBuZXdPcHRncm91cEVsLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIGdyb3VwTmFtZSk7XHJcblxyXG4gICAgICAgICAgLy8gY3JlYXRlIGVhY2ggY2hpbGRcclxuICAgICAgICAgIHZhciBvcHRpb25zSFRNTCA9IFwiXCI7XHJcbiAgICAgICAgICBncm91cEpTT05BcnJheVtncm91cE5hbWVdLmZvckVhY2goIGZ1bmN0aW9uKG9iamVjdERlZmluaXRpb24sIGluZGV4KSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKG9iamVjdERlZmluaXRpb25bXCJmaWxlXCJdKTtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2cob2JqZWN0RGVmaW5pdGlvbik7XHJcbiAgICAgICAgICAgIG9wdGlvbnNIVE1MICs9IGA8b3B0aW9uIHZhbHVlPVwiJHtvYmplY3REZWZpbml0aW9uW1wiZmlsZVwiXX1cIiBzcmM9XCJhc3NldHMvcHJldmlldy8ke29iamVjdERlZmluaXRpb25bXCJmaWxlXCJdfS5qcGdcIj4ke2h1bWFuaXplKG9iamVjdERlZmluaXRpb25bXCJmaWxlXCJdKX08L29wdGlvbj5gXHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBuZXdPcHRncm91cEVsLmlubmVySFRNTCA9IG9wdGlvbnNIVE1MO1xyXG4gICAgICAgICAgLy8gVE9ETzogQkFEIFdPUktBUk9VTkQgVE8gTk9UIFJFTE9BRCBCQVNFUyBzaW5jZSBpdCdzIGRlZmluZWQgaW4gSFRNTC4gSW5zdGVhZCwgbm8gb2JqZWN0cyBzaG91bGQgYmUgbGlzdGVkIGluIEhUTUwuIFRoaXMgc2hvdWxkIHVzZSBhIHByb21pc2UgYW5kIHRoZW4gaW5pdCB0aGUgc2VsZWN0LWJhciBjb21wb25lbnQgb25jZSBhbGwgb2JqZWN0cyBhcmUgbGlzdGVkLlxyXG4gICAgICAgICAgaWYgKGdyb3VwTmFtZSA9PSBcImtmYXJyX2Jhc2VzXCIpIHtcclxuICAgICAgICAgICAgLy8gZG8gbm90aGluZyAtIGRvbid0IGFwcGVuZCB0aGlzIHRvIHRoZSBET00gYmVjYXVzZSBvbmUgaXMgYWxyZWFkeSB0aGVyZVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbWVudUVsLmFwcGVuZENoaWxkKG5ld09wdGdyb3VwRWwpO1xyXG4gICAgICAgICAgfVxyXG4vLyAgICAgICAgICByZXNvbHZlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLmdyb3VwSlNPTkFycmF5ID0gZ3JvdXBKU09OQXJyYXk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gZW50aXR5IHJlc3VtZXMuXHJcbiAgICogVXNlIHRvIGNvbnRpbnVlIG9yIGFkZCBhbnkgZHluYW1pYyBvciBiYWNrZ3JvdW5kIGJlaGF2aW9yIHN1Y2ggYXMgZXZlbnRzLlxyXG4gICAqL1xyXG4gIHBsYXk6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBlbnRpdHkgcGF1c2VzLlxyXG4gICAqIFVzZSB0byBzdG9wIG9yIHJlbW92ZSBhbnkgZHluYW1pYyBvciBiYWNrZ3JvdW5kIGJlaGF2aW9yIHN1Y2ggYXMgZXZlbnRzLlxyXG4gICAqL1xyXG4gIHBhdXNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gYSBjb21wb25lbnQgaXMgcmVtb3ZlZCAoZS5nLiwgdmlhIHJlbW92ZUF0dHJpYnV0ZSkuXHJcbiAgICogR2VuZXJhbGx5IHVuZG9lcyBhbGwgbW9kaWZpY2F0aW9ucyB0byB0aGUgZW50aXR5LlxyXG4gICAqL1xyXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFNwYXducyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9iamVjdCBhdCB0aGUgY29udHJvbGxlciBsb2NhdGlvbiB3aGVuIHRyaWdnZXIgcHJlc3NlZFxyXG4gICAqL1xyXG4gIG9uUGxhY2VPYmplY3Q6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAvLyBGZXRjaCB0aGUgSXRlbSBlbGVtZW50ICh0aGUgcGxhY2VhYmxlIGNpdHkgb2JqZWN0KSBzZWxlY3RlZCBvbiB0aGlzIGNvbnRyb2xsZXJcclxuICAgIHZhciB0aGlzSXRlbUlEID0gKHRoaXMuZWwuaWQgPT09ICdsZWZ0Q29udHJvbGxlcicpID8gJyNsZWZ0SXRlbSc6JyNyaWdodEl0ZW0nO1xyXG4gICAgdmFyIHRoaXNJdGVtRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXNJdGVtSUQpO1xyXG5cclxuICAgIC8vIFdoaWNoIG9iamVjdCBzaG91bGQgYmUgcGxhY2VkIGhlcmU/IFRoaXMgSUQgaXMgXCJzdG9yZWRcIiBpbiB0aGUgRE9NIGVsZW1lbnQgb2YgdGhlIGN1cnJlbnQgSXRlbVxyXG5cdFx0dmFyIG9iamVjdElkID0gcGFyc2VJbnQodGhpc0l0ZW1FbC5hdHRyaWJ1dGVzLm9iamVjdElkLnZhbHVlKTtcclxuXHJcbiAgICAvLyBXaGF0J3MgdGhlIHR5cGUgb2Ygb2JqZWN0PyBGb3IgZXhhbXBsZSwgXCJtbW1tX2FsaWVuXCIgb3IgXCJiYXNlc1wiXHJcblx0XHR2YXIgb2JqZWN0R3JvdXAgPSB0aGlzSXRlbUVsLmF0dHJpYnV0ZXMub2JqZWN0R3JvdXAudmFsdWU7XHJcblxyXG4gICAgLy8gcm91bmRpbmcgdHJ1ZSBvciBmYWxzZT8gV2Ugd2FudCB0byByb3VuZCBwb3NpdGlvbiBhbmQgcm90YXRpb24gb25seSBmb3IgXCJiYXNlc1wiIHR5cGUgb2JqZWN0c1xyXG4gICAgdmFyIHJvdW5kaW5nID0gKG9iamVjdEdyb3VwID09ICdrZmFycl9iYXNlcycpO1xyXG5cclxuICAgIC8vIEdldCBhbiBBcnJheSBvZiBhbGwgdGhlIG9iamVjdHMgb2YgdGhpcyB0eXBlXHJcbiAgICB2YXIgb2JqZWN0QXJyYXkgPSB0aGlzLmdyb3VwSlNPTkFycmF5W29iamVjdEdyb3VwXTtcclxuXHJcbiAgICAvLyBHZXQgdGhlIEl0ZW0ncyBjdXJyZW50IHdvcmxkIGNvb3JkaW5hdGVzIC0gd2UncmUgZ29pbmcgdG8gcGxhY2UgaXQgcmlnaHQgd2hlcmUgaXQgaXMhXHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFBvc2l0aW9uID0gdGhpc0l0ZW1FbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKCk7XHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uID0gdGhpc0l0ZW1FbC5vYmplY3QzRC5nZXRXb3JsZFJvdGF0aW9uKCk7XHJcblx0XHR2YXIgb3JpZ2luYWxQb3NpdGlvblN0cmluZyA9IHRoaXNJdGVtV29ybGRQb3NpdGlvbi54ICsgJyAnICsgdGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLnkgKyAnICcgKyB0aGlzSXRlbVdvcmxkUG9zaXRpb24uejtcclxuXHJcbiAgICAvLyBSb3VuZCB0aGUgSXRlbSdzIHBvc2l0aW9uIHRvIHRoZSBuZWFyZXN0IDAuNTAgZm9yIGEgYmFzaWMgXCJncmlkIHNuYXBwaW5nXCIgZWZmZWN0XHJcblx0XHR2YXIgcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWCA9IE1hdGgucm91bmQodGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLnggKiAyKSAvIDI7IC8vcm91bmQgdG8gbmVhcmVzdCAwLjUgZm9yIGdoZXR0byBcInNuYXBwaW5nXCJcclxuXHRcdHZhciByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25ZID0gTWF0aC5yb3VuZCh0aGlzSXRlbVdvcmxkUG9zaXRpb24ueSAqIDIpIC8gMjsgLy9yb3VuZCB0byBuZWFyZXN0IDAuNSBmb3IgZ2hldHRvIFwic25hcHBpbmdcIlxyXG5cdFx0dmFyIHJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblogPSBNYXRoLnJvdW5kKHRoaXNJdGVtV29ybGRQb3NpdGlvbi56ICogMikgLyAyOyAvL3JvdW5kIHRvIG5lYXJlc3QgMC41IGZvciBnaGV0dG8gXCJzbmFwcGluZ1wiXHJcblx0XHR2YXIgcm91bmRlZFBvc2l0aW9uU3RyaW5nID0gcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWCArICcgMC41MCAnICsgcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWjtcclxuXHJcbiAgICAvLyBGZXRjaCB0aGUgY3VycmVudCBJdGVtJ3Mgcm90YXRpb24gYW5kIGNvbnZlcnQgaXQgdG8gYSBFdWxlciBzdHJpbmdcclxuXHRcdHZhciB0aGlzSXRlbVdvcmxkUm90YXRpb25YID0gdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uLl94IC8gKE1hdGguUEkgLyAxODApO1xyXG5cdFx0dmFyIHRoaXNJdGVtV29ybGRSb3RhdGlvblkgPSB0aGlzSXRlbVdvcmxkUm90YXRpb24uX3kgLyAoTWF0aC5QSSAvIDE4MCk7XHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWiA9IHRoaXNJdGVtV29ybGRSb3RhdGlvbi5feiAvIChNYXRoLlBJIC8gMTgwKTtcclxuXHRcdHZhciBvcmlnaW5hbEV1bGVyUm90YXRpb25TdHJpbmcgPSB0aGlzSXRlbVdvcmxkUm90YXRpb25YICsgJyAnICsgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSArICcgJyArIHRoaXNJdGVtV29ybGRSb3RhdGlvblo7XHJcblxyXG4gICAgLy8gUm91bmQgdGhlIEl0ZW0ncyByb3RhdGlvbiB0byB0aGUgbmVhcmVzdCA5MCBkZWdyZWVzIGZvciBiYXNlIHR5cGUgb2JqZWN0c1xyXG5cdFx0dmFyIHJvdW5kZWRUaGlzSXRlbVdvcmxkUm90YXRpb25ZID0gTWF0aC5yb3VuZCh0aGlzSXRlbVdvcmxkUm90YXRpb25ZIC8gOTApICogOTA7IC8vIHJvdW5kIHRvIDkwIGRlZ3JlZXNcclxuXHRcdHZhciByb3VuZGVkRXVsZXJSb3RhdGlvblN0cmluZyA9IDAgKyAnICcgKyByb3VuZGVkVGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSArICcgJyArIDA7IC8vIGlnbm9yZSByb2xsIGFuZCBwaXRjaFxyXG5cclxuICAgIHZhciBuZXdJZCA9ICdvYmplY3QnICsgb2JqZWN0Q291bnQ7XHJcblxyXG4gICAgJCgnPGEtZW50aXR5IC8+Jywge1xyXG4gICAgICBpZDogbmV3SWQsXHJcbiAgICAgIGNsYXNzOiAnY2l0eSBvYmplY3QgY2hpbGRyZW4nLFxyXG4gICAgICBzY2FsZTogb2JqZWN0QXJyYXlbb2JqZWN0SWRdLnNjYWxlLFxyXG4gICAgICByb3RhdGlvbjogcm91bmRpbmcgPyByb3VuZGVkRXVsZXJSb3RhdGlvblN0cmluZyA6IG9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZyxcclxuICAgICAgZmlsZTogb2JqZWN0QXJyYXlbb2JqZWN0SWRdLmZpbGUsXHJcbiAgICAgIC8vIFwicGx5LW1vZGVsXCI6IFwic3JjOiB1cmwobmV3X2Fzc2V0cy9cIiArIG9iamVjdEFycmF5W29iamVjdElkXS5maWxlICsgXCIucGx5KVwiLFxyXG4gICAgICBcIm9iai1tb2RlbFwiOiBcIm9iajogdXJsKGFzc2V0cy9vYmovXCIgKyBvYmplY3RBcnJheVtvYmplY3RJZF0uZmlsZSArIFwiLm9iaik7IG10bDogdXJsKGFzc2V0cy9vYmovXCIgKyBvYmplY3RBcnJheVtvYmplY3RJZF0uZmlsZSArIFwiLm10bClcIixcclxuICAgICAgYXBwZW5kVG8gOiAkKCcjY2l0eScpXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgbmV3T2JqZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobmV3SWQpO1xyXG4gICAgbmV3T2JqZWN0LnNldEF0dHJpYnV0ZShcInBvc2l0aW9uXCIsIHJvdW5kaW5nID8gcm91bmRlZFBvc2l0aW9uU3RyaW5nIDogb3JpZ2luYWxQb3NpdGlvblN0cmluZyk7IC8vIHRoaXMgZG9lcyBzZXQgcG9zaXRpb25cclxuXHJcbiAgICAvLyBJZiB0aGlzIGlzIGEgXCJiYXNlc1wiIHR5cGUgb2JqZWN0LCBhbmltYXRlIHRoZSB0cmFuc2l0aW9uIHRvIHRoZSBzbmFwcGVkIChyb3VuZGVkKSBwb3NpdGlvbiBhbmQgcm90YXRpb25cclxuICAgIGlmIChyb3VuZGluZykge1xyXG4gICAgICBuZXdPYmplY3Quc2V0QXR0cmlidXRlKCdhbmltYXRpb24nLCB7IHByb3BlcnR5OiAncm90YXRpb24nLCBkdXI6IDUwMCwgZnJvbTogb3JpZ2luYWxFdWxlclJvdGF0aW9uU3RyaW5nLCB0bzogcm91bmRlZEV1bGVyUm90YXRpb25TdHJpbmcgfSlcclxuICAgIH07XHJcblxyXG4gICAgbmV3T2JqZWN0LnNldEF0dHJpYnV0ZShcImZpcmViYXNlLWJyb2FkY2FzdFwiLCBcImNvbXBvbmVudHM6IHBvc2l0aW9uLCBzY2FsZSwgcm90YXRpb24sIGZpbGUsIG9iai1tb2RlbCwgY2xhc3M7IHBlcnNpc3Q6IHRydWVcIik7XHJcblxyXG5cclxuICAgIC8vIEluY3JlbWVudCB0aGUgb2JqZWN0IGNvdW50ZXIgc28gc3Vic2VxdWVudCBvYmplY3RzIGhhdmUgdGhlIGNvcnJlY3QgaW5kZXhcclxuXHRcdG9iamVjdENvdW50ICs9IDE7XHJcbiAgfSxcclxuXHJcblx0b25PYmplY3RDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnNvbGUubG9nKFwib25PYmplY3RDaGFuZ2UgdHJpZ2dlcmVkXCIpO1xyXG5cclxuICAgIC8vIEZldGNoIHRoZSBJdGVtIGVsZW1lbnQgKHRoZSBwbGFjZWFibGUgY2l0eSBvYmplY3QpIHNlbGVjdGVkIG9uIHRoaXMgY29udHJvbGxlclxyXG4gICAgdmFyIHRoaXNJdGVtSUQgPSAodGhpcy5lbC5pZCA9PT0gJ2xlZnRDb250cm9sbGVyJykgPyAnI2xlZnRJdGVtJzonI3JpZ2h0SXRlbSc7XHJcbiAgICB2YXIgdGhpc0l0ZW1FbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpc0l0ZW1JRCk7XHJcblxyXG4gICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5tZW51SWQpO1xyXG5cclxuICAgIC8vIFdoYXQncyB0aGUgdHlwZSBvZiBvYmplY3QgY3VycmVudGx5IHNlbGVjdGVkPyBGb3IgZXhhbXBsZSwgXCJtbW1tX2FsaWVuXCIgb3IgXCJiYXNlc1wiXHJcbiAgICB2YXIgb2JqZWN0R3JvdXAgPSBtZW51RWwuY29tcG9uZW50c1snc2VsZWN0LWJhciddLmRhdGEuc2VsZWN0ZWRPcHRncm91cFZhbHVlO1xyXG5cclxuICAgIC8vIEdldCBhbiBBcnJheSBvZiBhbGwgdGhlIG9iamVjdHMgb2YgdGhpcyB0eXBlXHJcbiAgICB2YXIgb2JqZWN0QXJyYXkgPSB0aGlzLmdyb3VwSlNPTkFycmF5W29iamVjdEdyb3VwXTtcclxuXHJcbiAgICAvLyBXaGF0IGlzIHRoZSBJRCBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGl0ZW0/XHJcbiAgICB2YXIgbmV3T2JqZWN0SWQgPSBwYXJzZUludChtZW51RWwuY29tcG9uZW50c1snc2VsZWN0LWJhciddLmRhdGEuc2VsZWN0ZWRPcHRpb25JbmRleCk7XHJcbiAgICB2YXIgc2VsZWN0ZWRPcHRpb25WYWx1ZSA9IG1lbnVFbC5jb21wb25lbnRzWydzZWxlY3QtYmFyJ10uZGF0YS5zZWxlY3RlZE9wdGlvblZhbHVlO1xyXG5cclxuXHRcdC8vIFNldCB0aGUgcHJldmlldyBvYmplY3QgdG8gYmUgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBcInByZXZpZXdcIiBpdGVtXHJcbiAgICB0aGlzSXRlbUVsLnNldEF0dHJpYnV0ZSgnb2JqLW1vZGVsJywgeyBvYmo6IFwidXJsKGFzc2V0cy9vYmovXCIgKyBvYmplY3RBcnJheVtuZXdPYmplY3RJZF0uZmlsZSArIFwiLm9iailcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXRsOiBcInVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbbmV3T2JqZWN0SWRdLmZpbGUgKyBcIi5tdGwpXCJ9KTtcclxuXHRcdHRoaXNJdGVtRWwuc2V0QXR0cmlidXRlKCdzY2FsZScsIG9iamVjdEFycmF5W25ld09iamVjdElkXS5zY2FsZSk7XHJcblx0XHR0aGlzSXRlbUVsLnNldEF0dHJpYnV0ZSgnb2JqZWN0SWQnLCBuZXdPYmplY3RJZCk7XHJcbiAgICB0aGlzSXRlbUVsLnNldEF0dHJpYnV0ZSgnb2JqZWN0R3JvdXAnLCBvYmplY3RHcm91cCk7XHJcbiAgICB0aGlzSXRlbUVsLmZsdXNoVG9ET00oKTtcclxuXHR9LFxyXG5cclxuICAvKipcclxuICAgKiBVbmRvIC0gZGVsZXRlcyB0aGUgbW9zdCByZWNlbnRseSBwbGFjZWQgb2JqZWN0XHJcbiAgICovXHJcbiAgb25VbmRvOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcHJldmlvdXNPYmplY3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI29iamVjdFwiICsgKG9iamVjdENvdW50IC0gMSkpO1xyXG5cdFx0cHJldmlvdXNPYmplY3QucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwcmV2aW91c09iamVjdCk7XHJcblx0XHRvYmplY3RDb3VudCAtPSAxO1xyXG5cdFx0aWYob2JqZWN0Q291bnQgPT0gLTEpIHtvYmplY3RDb3VudCA9IDB9O1xyXG4gIH1cclxuXHJcbn0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvYnVpbGRlci1jb250cm9scy5qcyIsIi8qIGdsb2JhbCBBRlJBTUUsIFRIUkVFICovXHJcblxyXG4vKipcclxuICogTG9hZHMgYW5kIHNldHVwIGdyb3VuZCBtb2RlbC5cclxuICovXHJcbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnZ3JvdW5kJywge1xyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvYmplY3RMb2FkZXI7XHJcbiAgICB2YXIgb2JqZWN0M0QgPSB0aGlzLmVsLm9iamVjdDNEO1xyXG4gICAgLy8gdmFyIE1PREVMX1VSTCA9ICdodHRwczovL2Nkbi5hZnJhbWUuaW8vbGluay10cmF2ZXJzYWwvbW9kZWxzL2dyb3VuZC5qc29uJztcclxuICAgIHZhciBNT0RFTF9VUkwgPSAnYXNzZXRzL2Vudmlyb25tZW50L2dyb3VuZC5qc29uJztcclxuICAgIGlmICh0aGlzLm9iamVjdExvYWRlcikgeyByZXR1cm47IH1cclxuICAgIG9iamVjdExvYWRlciA9IHRoaXMub2JqZWN0TG9hZGVyID0gbmV3IFRIUkVFLk9iamVjdExvYWRlcigpO1xyXG4gICAgb2JqZWN0TG9hZGVyLmNyb3NzT3JpZ2luID0gJyc7XHJcbiAgICBvYmplY3RMb2FkZXIubG9hZChNT0RFTF9VUkwsIGZ1bmN0aW9uIChvYmopIHtcclxuICAgICAgb2JqLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdmFsdWUucmVjZWl2ZVNoYWRvdyA9IHRydWU7XHJcbiAgICAgICAgdmFsdWUubWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xyXG4gICAgICB9KTtcclxuICAgICAgb2JqZWN0M0QuYWRkKG9iaik7XHJcbiAgICB9KTtcclxuICB9XHJcbn0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvZ3JvdW5kLmpzIiwiLyogZ2xvYmFsIEFGUkFNRSAqL1xyXG5BRlJBTUUucmVnaXN0ZXJTaGFkZXIoJ3NreUdyYWRpZW50Jywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgY29sb3JUb3A6IHsgdHlwZTogJ2NvbG9yJywgZGVmYXVsdDogJ2JsYWNrJywgaXM6ICd1bmlmb3JtJyB9LFxyXG4gICAgY29sb3JCb3R0b206IHsgdHlwZTogJ2NvbG9yJywgZGVmYXVsdDogJ3JlZCcsIGlzOiAndW5pZm9ybScgfVxyXG4gIH0sXHJcblxyXG4gIHZlcnRleFNoYWRlcjogW1xyXG4gICAgJ3ZhcnlpbmcgdmVjMyB2V29ybGRQb3NpdGlvbjsnLFxyXG5cclxuICAgICd2b2lkIG1haW4oKSB7JyxcclxuXHJcbiAgICAgICd2ZWM0IHdvcmxkUG9zaXRpb24gPSBtb2RlbE1hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTsnLFxyXG4gICAgICAndldvcmxkUG9zaXRpb24gPSB3b3JsZFBvc2l0aW9uLnh5ejsnLFxyXG5cclxuICAgICAgJ2dsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTsnLFxyXG5cclxuICAgICd9J1xyXG5cclxuICBdLmpvaW4oJ1xcbicpLFxyXG5cclxuICBmcmFnbWVudFNoYWRlcjogW1xyXG4gICAgJ3VuaWZvcm0gdmVjMyBjb2xvclRvcDsnLFxyXG4gICAgJ3VuaWZvcm0gdmVjMyBjb2xvckJvdHRvbTsnLFxyXG5cclxuICAgICd2YXJ5aW5nIHZlYzMgdldvcmxkUG9zaXRpb247JyxcclxuXHJcbiAgICAndm9pZCBtYWluKCknLFxyXG5cclxuICAgICd7JyxcclxuICAgICAgJ3ZlYzMgcG9pbnRPblNwaGVyZSA9IG5vcm1hbGl6ZSh2V29ybGRQb3NpdGlvbi54eXopOycsXHJcbiAgICAgICdmbG9hdCBmID0gMS4wOycsXHJcbiAgICAgICdpZihwb2ludE9uU3BoZXJlLnkgPiAtIDAuMil7JyxcclxuXHJcbiAgICAgICAgJ2YgPSBzaW4ocG9pbnRPblNwaGVyZS55ICogMi4wKTsnLFxyXG5cclxuICAgICAgJ30nLFxyXG4gICAgICAnZ2xfRnJhZ0NvbG9yID0gdmVjNChtaXgoY29sb3JCb3R0b20sY29sb3JUb3AsIGYgKSwgMS4wKTsnLFxyXG5cclxuICAgICd9J1xyXG4gIF0uam9pbignXFxuJylcclxufSk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2xpYi9za3lHcmFkaWVudC5qcyJdLCJzb3VyY2VSb290IjoiIn0=