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
	// require('aframe-text-component');
	// require('aframe-bmfont-text-component');
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
	
	  // for a given optgroup, make the children
	  makeSelectOptionsRow: function makeSelectOptionsRow(selectedOptgroupEl, parentEl, index, offsetY, idPrefix) {
	
	    // make the optgroup label
	    var optgroupLabelEl = document.createElement("a-entity");
	    console.log(idPrefix);
	    console.log("this.attrName" + this.attrName);
	    console.log("this.id" + this.id);
	
	    optgroupLabelEl.id = idPrefix + "optgroupLabel" + index;
	    optgroupLabelEl.setAttribute("position", "0.07 " + (0.045 + offsetY) + " -0.003");
	    optgroupLabelEl.setAttribute("scale", "0.5 0.5 0.5");
	    optgroupLabelEl.setAttribute("text", "value", selectedOptgroupEl.getAttribute('label'));
	    optgroupLabelEl.setAttribute("text", "color", "#747474");
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
	      selectOptionsHTML += '\n      <a-entity id="' + idPrefix + originalOptionsArrayIndex + '" visible="' + visible + '" class="preview' + (selected ? " selected" : "") + '" optionid="' + originalOptionsArrayIndex + '" value="' + element.getAttribute("value") + '" optgroup="' + selectedOptgroupEl.getAttribute("value") + '" position="' + startPositionX + ' ' + offsetY + ' 0">\n        <a-box class="previewFrame" position="0 0 -0.003" scale="0.06 0.06 0.005" material="color: ' + (selected ? "yellow" : "#222222") + '"></a-box>\n        <a-image class="previewImage" scale="0.05 0.05 0.05" src="' + element.getAttribute("src") + '" ></a-image>\n        <a-entity class="objectName" position="0.065 -0.04 -0.003" scale="0.18 0.18 0.18" text="value: ' + element.text + '; color: ' + (selected ? "yellow" : "#747474") + '"></a-entity>\n      </a-entity>';
	      startPositionX += deltaX;
	    });
	
	    // Append these menu options to a new element with id of "selectOptionsRow"
	    var selectOptionsRowEl = document.createElement("a-entity");
	    selectOptionsRowEl.id = idPrefix + "selectOptionsRow" + index;
	    selectOptionsRowEl.innerHTML = selectOptionsHTML;
	    parentEl.appendChild(selectOptionsRowEl);
	  },
	
	  init: function init() {
	    // Create select bar menu from html child `option` elements beneath parent entity inspired by the html5 spec: http://www.w3schools.com/tags/tag_optgroup.asp
	    var selectEl = this.el; // Reference to the component's element.
	    this.data.lastTime = new Date();
	
	    // we want a consistent prefix when creating IDs
	    // if the parent has an id, use that; otherwise, use the string "menu"
	    this.idPrefix = selectEl.id ? selectEl.id : "menu";
	
	    // Create the "frame" of the select menu bar
	    var selectRenderEl = document.createElement("a-entity");
	    selectRenderEl.id = this.idPrefix + "selectRender";
	    selectRenderEl.innerHTML = '\n      <a-box id="' + this.idPrefix + 'Frame" scale="0.4 0.15 0.005" position="0 0 -0.0075"  material="opacity: 0.5; transparent: true; color: #000000"></a-box>\n      <a-entity id="' + this.idPrefix + 'arrowRight" position="0.225 0 0" rotation="90 180 0" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>\n      <a-entity id="' + this.idPrefix + 'arrowLeft" position="-0.225 0 0" rotation="90 180 0" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity:0.5; transparent:true; color:#000000"></a-entity>\n      <a-entity id="' + this.idPrefix + 'arrowUp" position="0 0.1 0" rotation="0 270 90" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>\n      <a-entity id="' + this.idPrefix + 'arrowDown" position="0 -0.1 0" rotation="0 270 90" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>\n      ';
	    selectEl.appendChild(selectRenderEl);
	
	    var optgroups = selectEl.getElementsByTagName("optgroup"); // Get the optgroups
	    var selectedOptgroupEl = optgroups[this.data.selectedOptgroupIndex]; // fetch the currently selected optgroup
	    this.data.selectedOptgroupValue = selectedOptgroupEl.getAttribute("value"); // set component property to opgroup value
	
	    // this.idPrefix
	    console.log(this.idPrefix);
	    console.log("this.attrName: " + this.attrName);
	    console.log("this.id: " + this.id);
	
	    this.makeSelectOptionsRow(selectedOptgroupEl, selectRenderEl, this.data.selectedOptgroupIndex, 0, this.idPrefix);
	  },
	
	  removeSelectOptionsRow: function removeSelectOptionsRow(index) {
	    // find the appropriate select options row
	    var selectOptionsRowEl = document.getElementById(this.idPrefix + "selectOptionsRow" + index);
	    var optgroupLabelEl = document.getElementById(this.idPrefix + "optgroupLabel" + index);
	
	    //    console.log("try to remove children");
	    // delete all children of selectOptionsRowEl
	    while (selectOptionsRowEl.firstChild) {
	      selectOptionsRowEl.removeChild(selectOptionsRowEl.firstChild);
	    }
	    //    console.log("children removed");
	
	    // delete selectOptionsRowEl and optgroupLabelEl
	    optgroupLabelEl.parentNode.removeChild(optgroupLabelEl);
	    selectOptionsRowEl.parentNode.removeChild(selectOptionsRowEl);
	  },
	
	  addEventListeners: function addEventListeners() {
	    // If controls = true and a controllerID has been provided, then add controller event listeners
	    if (this.data.controls && this.data.controllerID) {
	      var controllerEl = document.getElementById(this.data.controllerID);
	      controllerEl.addEventListener('trackpaddown', this.onTrackpadDown.bind(this));
	      controllerEl.addEventListener('axismove', this.onAxisMove.bind(this));
	      controllerEl.addEventListener('triggerdown', this.onTriggerDown.bind(this));
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
	      controllerEl.removeEventListener('triggerdown', this.onTriggerDown);
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
	
	  onTriggerDown: function onTriggerDown(evt) {
	    if (evt.target.id != this.data.controllerID) {
	      //menu: only deal with trigger down events from correct controller
	      return;
	    }
	    this.el.emit("menuSelected");
	  },
	
	  onAxisMove: function onAxisMove(evt) {
	    // menu: used for determining current axis of trackpad hover position
	    if (evt.target.id != this.data.controllerID) {
	      //menu: only deal with trackpad events from correct controller
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
	            //            console.log("isOculus");
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
	    var arrow = document.getElementById(this.idPrefix + "arrowRight");
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
	    var arrow = document.getElementById(this.idPrefix + "arrowLeft");
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
	
	    console.log(this.idPrefix + "arrowDown");
	    var arrow = document.getElementById(this.idPrefix + "arrowDown");
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
	
	    var arrow = document.getElementById(this.idPrefix + "arrowUp");
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
	    var selectRenderEl = document.getElementById(this.idPrefix + "selectRender");
	
	    if (this.data.selectedOptgroupIndex + 2 > optgroups.length) {
	      // CAN'T DO THIS, show red arrow
	      var arrow = document.getElementById(this.idPrefix + "arrowDown");
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
	      this.makeSelectOptionsRow(nextSelectedOptgroupEl, selectRenderEl, this.data.selectedOptgroupIndex, 0, this.idPrefix);
	
	      // Change selected option element when optgroup is changed
	      var selectOptionsRowEl = document.getElementById(this.idPrefix + 'selectOptionsRow' + this.data.selectedOptgroupIndex);
	      var newlySelectedMenuEl = selectOptionsRowEl.getElementsByClassName('selected')[0];
	
	      // update selectOptionsValue and Index
	      this.data.selectedOptionValue = newlySelectedMenuEl.getAttribute("value");
	      this.data.selectedOptionIndex = newlySelectedMenuEl.getAttribute("optionid");
	
	      this.el.flushToDOM();
	
	      this.el.emit("menuOptgroupNext");
	      this.el.emit("menuChanged");
	
	      var arrow = document.getElementById(this.idPrefix + "arrowDown");
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
	    var selectRenderEl = document.getElementById(this.idPrefix + "selectRender");
	
	    if (this.data.selectedOptgroupIndex - 1 < 0) {
	      // CAN'T DO THIS, show red arrow
	      var arrow = document.getElementById(this.idPrefix + "arrowUp");
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
	      this.makeSelectOptionsRow(nextSelectedOptgroupEl, selectRenderEl, this.data.selectedOptgroupIndex, 0, this.idPrefix);
	
	      // Change selected option element when optgroup is changed
	      var selectOptionsRowEl = document.getElementById(this.idPrefix + 'selectOptionsRow' + this.data.selectedOptgroupIndex);
	      var newlySelectedMenuEl = selectOptionsRowEl.getElementsByClassName('selected')[0];
	
	      // update selectOptionsValue and Index
	      this.data.selectedOptionValue = newlySelectedMenuEl.getAttribute("value");
	      this.data.selectedOptionIndex = newlySelectedMenuEl.getAttribute("optionid");
	
	      this.el.flushToDOM();
	
	      this.el.emit("menuOptgroupNext");
	      this.el.emit("menuChanged");
	
	      var arrow = document.getElementById(this.idPrefix + "arrowUp");
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
	    var arrowUpColor = new THREE.Color(document.getElementById(this.idPrefix + "arrowUp").getAttribute("material").color);
	    var arrowRightColor = new THREE.Color(document.getElementById(this.idPrefix + "arrowRight").getAttribute("material").color);
	    var arrowDownColor = new THREE.Color(document.getElementById(this.idPrefix + "arrowDown").getAttribute("material").color);
	    var arrowLeftColor = new THREE.Color(document.getElementById(this.idPrefix + "arrowLeft").getAttribute("material").color);
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
	    console.log(this);
	    console.log(this.data);
	    // Switch to the next option, or switch in the direction of the most recently hovered directional arrow
	    // menu: save the currently selected menu element
	    // console.log("direction?");
	    // console.log(direction);
	    console.log(this.idPrefix + 'selectOptionsRow' + this.data.selectedOptgroupIndex);
	    var selectOptionsRowEl = document.getElementById(this.idPrefix + 'selectOptionsRow' + this.data.selectedOptgroupIndex);
	
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
	      var arrowLeft = document.getElementById(this.idPrefix + "arrowLeft");
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
	      oldMenuEl.getElementsByClassName("objectName")[0].setAttribute('text', 'color', 'gray');
	      newMenuEl.getElementsByClassName("objectName")[0].setAttribute('text', 'color', 'yellow');
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
	      newlyCreatedOptionEl.setAttribute('id', this.idPrefix + newlyCreatedOptionIndex);
	      newlyCreatedOptionEl.setAttribute('value', sourceOptionEl.getAttribute("value"));
	
	      var newlyVisibleOptionPosition = newlyVisibleOptionEl.object3D.position;
	      newlyCreatedOptionEl.setAttribute('position', newlyVisibleOptionPosition.x - 0.075 + " " + newlyVisibleOptionPosition.y + " " + newlyVisibleOptionPosition.z);
	      newlyCreatedOptionEl.flushToDOM();
	
	      // menu: add the newly cloned and modified menu object preview to the dom
	      selectOptionsRowEl.insertBefore(newlyCreatedOptionEl, selectOptionsRowEl.firstChild);
	
	      // menu: get child elements for image and name, populate both appropriately
	      var appendedNewlyCreatedOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyCreatedOptionIndex + "']")[0];
	      appendedNewlyCreatedOptionEl.getElementsByClassName("previewImage")[0].setAttribute('src', sourceOptionEl.getAttribute("src"));
	      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('text', 'value', sourceOptionEl.text);
	      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('text', 'color', '#747474');
	      appendedNewlyCreatedOptionEl.flushToDOM();
	
	      // PREVIOUS OPTION MENU END ===============================
	    } else {
	      this.el.emit("menuNext");
	      // NEXT OPTION MENU START ===============================
	      selectedOptionIndex = loopIndex(selectedOptionIndex += 1, selectedOptgroupEl.childElementCount);
	
	      // menu: animate arrow right
	      var arrowRight = document.getElementById(this.idPrefix + "arrowRight");
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
	      oldMenuEl.getElementsByClassName("objectName")[0].setAttribute('text', 'color', 'gray');
	      _newMenuEl.getElementsByClassName("objectName")[0].setAttribute('text', 'color', 'yellow');
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
	      newlyCreatedOptionEl.setAttribute('id', this.idPrefix + newlyCreatedOptionIndex);
	      newlyCreatedOptionEl.setAttribute('value', sourceOptionEl.getAttribute("value"));
	
	      var newlyVisibleOptionPosition = newlyVisibleOptionEl.object3D.position;
	      newlyCreatedOptionEl.setAttribute('position', newlyVisibleOptionPosition.x + 0.075 + " " + newlyVisibleOptionPosition.y + " " + newlyVisibleOptionPosition.z);
	      newlyCreatedOptionEl.flushToDOM();
	
	      // menu: add the newly cloned and modified menu object preview
	      selectOptionsRowEl.insertBefore(newlyCreatedOptionEl, selectOptionsRowEl.firstChild);
	
	      // menu: get child elements for image and name, populate both appropriately
	      var appendedNewlyCreatedOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyCreatedOptionIndex + "']")[0];
	
	      appendedNewlyCreatedOptionEl.getElementsByClassName("previewImage")[0].setAttribute('src', sourceOptionEl.getAttribute("src"));
	      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('text', 'value', sourceOptionEl.text);
	      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('text', 'color', '#747474');
	      appendedNewlyCreatedOptionEl.flushToDOM();
	
	      // NEXT MENU OPTION END ===============================
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
	    var list = ["kfarr_bases", "mmmm_veh", "mmmm_bld", "mmmm_alien", "mmmm_scene"];
	
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgOTc0NTEyOGNjNjhhMTY3NzgwM2UiLCJ3ZWJwYWNrOi8vLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2FuaW1lanMvYW5pbWUuanMiLCJ3ZWJwYWNrOi8vLy4vbGliL2FmcmFtZS1zZWxlY3QtYmFyLmpzIiwid2VicGFjazovLy8uL2xpYi9idWlsZGVyLWNvbnRyb2xzLmpzIiwid2VicGFjazovLy8uL2xpYi9ncm91bmQuanMiLCJ3ZWJwYWNrOi8vLy4vbGliL3NreUdyYWRpZW50LmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJBRlJBTUUiLCJFcnJvciIsImZpbmRXaXRoQXR0ciIsImFycmF5IiwiYXR0ciIsInZhbHVlIiwiaSIsImxlbmd0aCIsImluZGV4T2ZNYXgiLCJhcnIiLCJtYXgiLCJtYXhJbmRleCIsImxvb3BJbmRleCIsImRlc2lyZWRJbmRleCIsImFycmF5TGVuZ3RoIiwiYXNzZXJ0IiwiY29uZGl0aW9uIiwibWVzc2FnZSIsInRlc3RMb29wQXJyYXkiLCJyZWdpc3RlckNvbXBvbmVudCIsInNjaGVtYSIsImNvbnRyb2xzIiwidHlwZSIsImRlZmF1bHQiLCJjb250cm9sbGVySUQiLCJzZWxlY3RlZE9wdGdyb3VwVmFsdWUiLCJzZWxlY3RlZE9wdGdyb3VwSW5kZXgiLCJzZWxlY3RlZE9wdGlvblZhbHVlIiwic2VsZWN0ZWRPcHRpb25JbmRleCIsIm1ha2VTZWxlY3RPcHRpb25zUm93Iiwic2VsZWN0ZWRPcHRncm91cEVsIiwicGFyZW50RWwiLCJpbmRleCIsIm9mZnNldFkiLCJpZFByZWZpeCIsIm9wdGdyb3VwTGFiZWxFbCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImNvbnNvbGUiLCJsb2ciLCJhdHRyTmFtZSIsImlkIiwic2V0QXR0cmlidXRlIiwiZ2V0QXR0cmlidXRlIiwiYXBwZW5kQ2hpbGQiLCJvcHRpb25zRWxlbWVudHMiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsIm9wdGlvbnNFbGVtZW50c0FycmF5IiwiQXJyYXkiLCJwcm90b3R5cGUiLCJzbGljZSIsImNhbGwiLCJmaXJzdEFycmF5IiwicHJldmlld0FycmF5IiwibWVudUFycmF5IiwiY29uY2F0Iiwic2VsZWN0T3B0aW9uc0hUTUwiLCJzdGFydFBvc2l0aW9uWCIsImRlbHRhWCIsImZvckVhY2giLCJlbGVtZW50IiwibWVudUFycmF5SW5kZXgiLCJ2aXNpYmxlIiwic2VsZWN0ZWQiLCJvcmlnaW5hbE9wdGlvbnNBcnJheUluZGV4IiwidGV4dCIsInNlbGVjdE9wdGlvbnNSb3dFbCIsImlubmVySFRNTCIsImluaXQiLCJzZWxlY3RFbCIsImVsIiwiZGF0YSIsImxhc3RUaW1lIiwiRGF0ZSIsInNlbGVjdFJlbmRlckVsIiwib3B0Z3JvdXBzIiwicmVtb3ZlU2VsZWN0T3B0aW9uc1JvdyIsImdldEVsZW1lbnRCeUlkIiwiZmlyc3RDaGlsZCIsInJlbW92ZUNoaWxkIiwicGFyZW50Tm9kZSIsImFkZEV2ZW50TGlzdGVuZXJzIiwiY29udHJvbGxlckVsIiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uVHJhY2twYWREb3duIiwiYmluZCIsIm9uQXhpc01vdmUiLCJvblRyaWdnZXJEb3duIiwib25Ib3ZlckxlZnQiLCJvbkhvdmVyUmlnaHQiLCJvbk9wdGlvblN3aXRjaCIsIm9uT3B0aW9uTmV4dCIsIm9uT3B0aW9uUHJldmlvdXMiLCJvbk9wdGdyb3VwTmV4dCIsIm9uT3B0Z3JvdXBQcmV2aW91cyIsInJlbW92ZUV2ZW50TGlzdGVuZXJzIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInBsYXkiLCJwYXVzZSIsInJlbW92ZSIsImV2dCIsInRhcmdldCIsImVtaXQiLCJkZXRhaWwiLCJheGlzIiwiaXNPY3VsdXMiLCJnYW1lcGFkcyIsIm5hdmlnYXRvciIsImdldEdhbWVwYWRzIiwiZ2FtZXBhZCIsImluZGV4T2YiLCJNYXRoIiwiYWJzIiwieUF4aXMiLCJvbkhvdmVyVXAiLCJvbkhvdmVyRG93biIsInRoaXNUaW1lIiwiZmxvb3IiLCJhcnJvdyIsImN1cnJlbnRBcnJvd0NvbG9yIiwiVEhSRUUiLCJDb2xvciIsImNvbG9yIiwiciIsInJlbW92ZUF0dHJpYnV0ZSIsInByb3BlcnR5IiwiZHVyIiwiZnJvbSIsInRvIiwiZyIsImFycm93Q29sb3IiLCJmbHVzaFRvRE9NIiwibmV4dFNlbGVjdGVkT3B0Z3JvdXBFbCIsIm5ld2x5U2VsZWN0ZWRNZW51RWwiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwiYXJyb3dVcENvbG9yIiwiYXJyb3dSaWdodENvbG9yIiwiYXJyb3dEb3duQ29sb3IiLCJhcnJvd0xlZnRDb2xvciIsImFycm93Q29sb3JBcnJheUdyZWVuIiwicmVkdWNlIiwiYSIsImIiLCJkaXJlY3Rpb24iLCJvbGRNZW51RWwiLCJvbGRTZWxlY3RlZE9wdGlvbkluZGV4IiwicGFyc2VJbnQiLCJjaGlsZEVsZW1lbnRDb3VudCIsImFycm93TGVmdCIsIm5ld01lbnVFbCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJjbGFzc0xpc3QiLCJhZGQiLCJoYXNBdHRyaWJ1dGUiLCJvbGRQb3NpdGlvbiIsIm5ld1giLCJwYXJzZUZsb2F0Iiwic3BsaXQiLCJuZXdQb3NpdGlvblN0cmluZyIsInRvU3RyaW5nIiwib2JqZWN0M0QiLCJwb3NpdGlvbiIsIngiLCJ5IiwieiIsIm5ld2x5VmlzaWJsZU9wdGlvbkluZGV4IiwibmV3bHlWaXNpYmxlT3B0aW9uRWwiLCJuZXdseVJlbW92ZWRPcHRpb25JbmRleCIsIm5ld2x5UmVtb3ZlZE9wdGlvbkVsIiwibmV3bHlJbnZpc2libGVPcHRpb25JbmRleCIsIm5ld2x5SW52aXNpYmxlT3B0aW9uRWwiLCJuZXdseUNyZWF0ZWRPcHRpb25FbCIsImNsb25lTm9kZSIsIm5ld2x5Q3JlYXRlZE9wdGlvbkluZGV4Iiwic291cmNlT3B0aW9uRWwiLCJjaGlsZHJlbiIsIm5ld2x5VmlzaWJsZU9wdGlvblBvc2l0aW9uIiwiaW5zZXJ0QmVmb3JlIiwiYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbCIsImFycm93UmlnaHQiLCJvYmplY3RDb3VudCIsImh1bWFuaXplIiwic3RyIiwiZnJhZ3MiLCJjaGFyQXQiLCJ0b1VwcGVyQ2FzZSIsImpvaW4iLCJtZW51SWQiLCJtdWx0aXBsZSIsIm9uVW5kbyIsIm1lbnVFbCIsIm9uT2JqZWN0Q2hhbmdlIiwib25QbGFjZU9iamVjdCIsImxpc3QiLCJncm91cEpTT05BcnJheSIsImdyb3VwTmFtZSIsInJlcXVlc3RVUkwiLCJyZXF1ZXN0IiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwicmVzcG9uc2VUeXBlIiwic2VuZCIsIm9ubG9hZCIsInJlc3BvbnNlIiwibmV3T3B0Z3JvdXBFbCIsIm9wdGlvbnNIVE1MIiwib2JqZWN0RGVmaW5pdGlvbiIsInRoaXNJdGVtSUQiLCJ0aGlzSXRlbUVsIiwicXVlcnlTZWxlY3RvciIsIm9iamVjdElkIiwiYXR0cmlidXRlcyIsIm9iamVjdEdyb3VwIiwicm91bmRpbmciLCJvYmplY3RBcnJheSIsInRoaXNJdGVtV29ybGRQb3NpdGlvbiIsImdldFdvcmxkUG9zaXRpb24iLCJ0aGlzSXRlbVdvcmxkUm90YXRpb24iLCJnZXRXb3JsZFJvdGF0aW9uIiwib3JpZ2luYWxQb3NpdGlvblN0cmluZyIsInJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblgiLCJyb3VuZCIsInJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblkiLCJyb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25aIiwicm91bmRlZFBvc2l0aW9uU3RyaW5nIiwidGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWCIsIl94IiwiUEkiLCJ0aGlzSXRlbVdvcmxkUm90YXRpb25ZIiwiX3kiLCJ0aGlzSXRlbVdvcmxkUm90YXRpb25aIiwiX3oiLCJvcmlnaW5hbEV1bGVyUm90YXRpb25TdHJpbmciLCJyb3VuZGVkVGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSIsInJvdW5kZWRFdWxlclJvdGF0aW9uU3RyaW5nIiwibmV3SWQiLCIkIiwiY2xhc3MiLCJzY2FsZSIsInJvdGF0aW9uIiwiZmlsZSIsImFwcGVuZFRvIiwibmV3T2JqZWN0IiwiY29tcG9uZW50cyIsIm5ld09iamVjdElkIiwib2JqIiwibXRsIiwicHJldmlvdXNPYmplY3QiLCJvYmplY3RMb2FkZXIiLCJNT0RFTF9VUkwiLCJPYmplY3RMb2FkZXIiLCJjcm9zc09yaWdpbiIsImxvYWQiLCJyZWNlaXZlU2hhZG93IiwibWF0ZXJpYWwiLCJzaGFkaW5nIiwiRmxhdFNoYWRpbmciLCJyZWdpc3RlclNoYWRlciIsImNvbG9yVG9wIiwiaXMiLCJjb2xvckJvdHRvbSIsInZlcnRleFNoYWRlciIsImZyYWdtZW50U2hhZGVyIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7O0FDdENBLG9CQUFBQSxDQUFRLENBQVI7QUFDQSxvQkFBQUEsQ0FBUSxDQUFSO0FBQ0E7QUFDQTtBQUNBLG9CQUFBQSxDQUFRLENBQVI7QUFDQSxvQkFBQUEsQ0FBUSxDQUFSO0FBQ0Esb0JBQUFBLENBQVEsQ0FBUjtBQUNBLG9CQUFBQSxDQUFRLENBQVIsRTs7Ozs7O0FDUEE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLGFBQWE7QUFDeEIsaUJBQWdCLGNBQWM7QUFDOUIsdUJBQXNCLGVBQWU7QUFDckMsaUJBQWdCO0FBQ2hCLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7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LDRCQUEyQixFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUU7QUFDckQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNEMsMEJBQTBCLEVBQUU7QUFDeEU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWM7QUFDZCxNQUFLO0FBQ0w7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrRUFBaUU7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZO0FBQ1o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QzRFLG1CQUFnQixDQUNkLHdCQURjLEVBRWQsMkJBRmMsRUFJZCw4QkFKYyxFQU1kLGFBTmMsRUFRZCxHQVJjLEVBU1oscURBVFksRUFVWixnQkFWWSxFQVdaLDhCQVhZLEVBYVYsaUNBYlUsRUFlWixHQWZZLEVBZ0JaLDBEQWhCWSxFQWtCZCxHQWxCYyxFQW1CZDVFLElBbkJjLENBbUJULElBbkJTO0FBcEJtQixFQUFyQyxFIiwiZmlsZSI6ImFmcmFtZS1jaXR5LWJ1aWxkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA5NzQ1MTI4Y2M2OGExNjc3ODAzZSIsInJlcXVpcmUoJ2FmcmFtZS1ncmlkaGVscGVyLWNvbXBvbmVudCcpO1xyXG5yZXF1aXJlKCdhZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudCcpO1xyXG4vLyByZXF1aXJlKCdhZnJhbWUtdGV4dC1jb21wb25lbnQnKTtcclxuLy8gcmVxdWlyZSgnYWZyYW1lLWJtZm9udC10ZXh0LWNvbXBvbmVudCcpO1xyXG5yZXF1aXJlKCcuL2xpYi9hZnJhbWUtc2VsZWN0LWJhci5qcycpO1xyXG5yZXF1aXJlKCcuL2xpYi9idWlsZGVyLWNvbnRyb2xzLmpzJyk7XHJcbnJlcXVpcmUoJy4vbGliL2dyb3VuZC5qcycpO1xyXG5yZXF1aXJlKCcuL2xpYi9za3lHcmFkaWVudC5qcycpO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9pbmRleC5qcyIsImlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xufVxuXG4vKipcbiAqIEdyaWRIZWxwZXIgY29tcG9uZW50IGZvciBBLUZyYW1lLlxuICovXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2dyaWRoZWxwZXInLCB7XG4gIHNjaGVtYToge1xuICAgIHNpemU6IHsgZGVmYXVsdDogNSB9LFxuICAgIGRpdmlzaW9uczogeyBkZWZhdWx0OiAxMCB9LFxuICAgIGNvbG9yQ2VudGVyTGluZToge2RlZmF1bHQ6ICdyZWQnfSxcbiAgICBjb2xvckdyaWQ6IHtkZWZhdWx0OiAnYmxhY2snfVxuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxsZWQgb25jZSB3aGVuIGNvbXBvbmVudCBpcyBhdHRhY2hlZC4gR2VuZXJhbGx5IGZvciBpbml0aWFsIHNldHVwLlxuICAgKi9cbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzY2VuZSA9IHRoaXMuZWwub2JqZWN0M0Q7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG5cbiAgICB2YXIgc2l6ZSA9IGRhdGEuc2l6ZTtcbiAgICB2YXIgZGl2aXNpb25zID0gZGF0YS5kaXZpc2lvbnM7XG4gICAgdmFyIGNvbG9yQ2VudGVyTGluZSA9IGRhdGEuY29sb3JDZW50ZXJMaW5lO1xuICAgIHZhciBjb2xvckdyaWQgPSBkYXRhLmNvbG9yR3JpZDtcblxuICAgIHZhciBncmlkSGVscGVyID0gbmV3IFRIUkVFLkdyaWRIZWxwZXIoIHNpemUsIGRpdmlzaW9ucywgY29sb3JDZW50ZXJMaW5lLCBjb2xvckdyaWQgKTtcbiAgICBncmlkSGVscGVyLm5hbWUgPSBcImdyaWRIZWxwZXJcIjtcbiAgICBzY2VuZS5hZGQoZ3JpZEhlbHBlcik7XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzY2VuZSA9IHRoaXMuZWwub2JqZWN0M0Q7XG4gICAgc2NlbmUucmVtb3ZlKHNjZW5lLmdldE9iamVjdEJ5TmFtZShcImdyaWRIZWxwZXJcIikpO1xuICB9XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyogZ2xvYmFsIEFGUkFNRSAqL1xuXG52YXIgYW5pbWUgPSByZXF1aXJlKCdhbmltZWpzJyk7XG5cbmlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xufVxuXG52YXIgdXRpbHMgPSBBRlJBTUUudXRpbHM7XG52YXIgZ2V0Q29tcG9uZW50UHJvcGVydHkgPSB1dGlscy5lbnRpdHkuZ2V0Q29tcG9uZW50UHJvcGVydHk7XG52YXIgc2V0Q29tcG9uZW50UHJvcGVydHkgPSB1dGlscy5lbnRpdHkuc2V0Q29tcG9uZW50UHJvcGVydHk7XG52YXIgc3R5bGVQYXJzZXIgPSB1dGlscy5zdHlsZVBhcnNlci5wYXJzZTtcblxuLyoqXG4gKiBBbmltYXRpb24gY29tcG9uZW50IGZvciBBLUZyYW1lLlxuICovXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2FuaW1hdGlvbicsIHtcbiAgc2NoZW1hOiB7XG4gICAgZGVsYXk6IHtkZWZhdWx0OiAwfSxcbiAgICBkaXI6IHtkZWZhdWx0OiAnJ30sXG4gICAgZHVyOiB7ZGVmYXVsdDogMTAwMH0sXG4gICAgZWFzaW5nOiB7ZGVmYXVsdDogJ2Vhc2VJblF1YWQnfSxcbiAgICBlbGFzdGljaXR5OiB7ZGVmYXVsdDogNDAwfSxcbiAgICBmcm9tOiB7ZGVmYXVsdDogJyd9LFxuICAgIGxvb3A6IHtkZWZhdWx0OiBmYWxzZX0sXG4gICAgcHJvcGVydHk6IHtkZWZhdWx0OiAnJ30sXG4gICAgcmVwZWF0OiB7ZGVmYXVsdDogMH0sXG4gICAgc3RhcnRFdmVudHM6IHt0eXBlOiAnYXJyYXknfSxcbiAgICBwYXVzZUV2ZW50czoge3R5cGU6ICdhcnJheSd9LFxuICAgIHJlc3VtZUV2ZW50czoge3R5cGU6ICdhcnJheSd9LFxuICAgIHJlc3RhcnRFdmVudHM6IHt0eXBlOiAnYXJyYXknfSxcbiAgICB0bzoge2RlZmF1bHQ6ICcnfVxuICB9LFxuXG4gIG11bHRpcGxlOiB0cnVlLFxuXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbiA9IG51bGw7XG4gICAgdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmNvbmZpZyA9IG51bGw7XG4gICAgdGhpcy5wbGF5QW5pbWF0aW9uQm91bmQgPSB0aGlzLnBsYXlBbmltYXRpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnBhdXNlQW5pbWF0aW9uQm91bmQgPSB0aGlzLnBhdXNlQW5pbWF0aW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXN1bWVBbmltYXRpb25Cb3VuZCA9IHRoaXMucmVzdW1lQW5pbWF0aW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXN0YXJ0QW5pbWF0aW9uQm91bmQgPSB0aGlzLnJlc3RhcnRBbmltYXRpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlcGVhdCA9IDA7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGF0dHJOYW1lID0gdGhpcy5hdHRyTmFtZTtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIHZhciBwcm9wVHlwZSA9IGdldFByb3BlcnR5VHlwZShlbCwgZGF0YS5wcm9wZXJ0eSk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFkYXRhLnByb3BlcnR5KSB7IHJldHVybjsgfVxuXG4gICAgLy8gQmFzZSBjb25maWcuXG4gICAgdGhpcy5yZXBlYXQgPSBkYXRhLnJlcGVhdDtcbiAgICB2YXIgY29uZmlnID0ge1xuICAgICAgYXV0b3BsYXk6IGZhbHNlLFxuICAgICAgYmVnaW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZWwuZW1pdCgnYW5pbWF0aW9uYmVnaW4nKTtcbiAgICAgICAgZWwuZW1pdChhdHRyTmFtZSArICctYmVnaW4nKTtcbiAgICAgIH0sXG4gICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBlbC5lbWl0KCdhbmltYXRpb25jb21wbGV0ZScpO1xuICAgICAgICBlbC5lbWl0KGF0dHJOYW1lICsgJy1jb21wbGV0ZScpO1xuICAgICAgICAvLyBSZXBlYXQuXG4gICAgICAgIGlmICgtLXNlbGYucmVwZWF0ID4gMCkgeyBzZWxmLmFuaW1hdGlvbi5wbGF5KCk7IH1cbiAgICAgIH0sXG4gICAgICBkaXJlY3Rpb246IGRhdGEuZGlyLFxuICAgICAgZHVyYXRpb246IGRhdGEuZHVyLFxuICAgICAgZWFzaW5nOiBkYXRhLmVhc2luZyxcbiAgICAgIGVsYXN0aWNpdHk6IGRhdGEuZWxhc3RpY2l0eSxcbiAgICAgIGxvb3A6IGRhdGEubG9vcFxuICAgIH07XG5cbiAgICAvLyBDdXN0b21pemUgY29uZmlnIGJhc2VkIG9uIHByb3BlcnR5IHR5cGUuXG4gICAgdmFyIHVwZGF0ZUNvbmZpZyA9IGNvbmZpZ0RlZmF1bHQ7XG4gICAgaWYgKHByb3BUeXBlID09PSAndmVjMicgfHwgcHJvcFR5cGUgPT09ICd2ZWMzJyB8fCBwcm9wVHlwZSA9PT0gJ3ZlYzQnKSB7XG4gICAgICB1cGRhdGVDb25maWcgPSBjb25maWdWZWN0b3I7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlnLlxuICAgIHRoaXMuY29uZmlnID0gdXBkYXRlQ29uZmlnKGVsLCBkYXRhLCBjb25maWcpO1xuICAgIHRoaXMuYW5pbWF0aW9uID0gYW5pbWUodGhpcy5jb25maWcpO1xuXG4gICAgLy8gU3RvcCBwcmV2aW91cyBhbmltYXRpb24uXG4gICAgdGhpcy5wYXVzZUFuaW1hdGlvbigpO1xuXG4gICAgaWYgKCF0aGlzLmRhdGEuc3RhcnRFdmVudHMubGVuZ3RoKSB7IHRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nID0gdHJ1ZTsgfVxuXG4gICAgLy8gUGxheSBhbmltYXRpb24gaWYgbm8gaG9sZGluZyBldmVudC5cbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucGF1c2VBbmltYXRpb24oKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gIH0sXG5cbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnBhdXNlQW5pbWF0aW9uKCk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYWZ0ZXIgdXBkYXRlLlxuICAgKi9cbiAgcGxheTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICghdGhpcy5hbmltYXRpb24gfHwgIXRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nKSB7IHJldHVybjsgfVxuXG4gICAgLy8gRGVsYXkuXG4gICAgaWYgKGRhdGEuZGVsYXkpIHtcbiAgICAgIHNldFRpbWVvdXQocGxheSwgZGF0YS5kZWxheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBsYXkoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwbGF5ICgpIHtcbiAgICAgIHNlbGYucGxheUFuaW1hdGlvbigpO1xuICAgICAgc2VsZi5hZGRFdmVudExpc3RlbmVycygpO1xuICAgIH1cbiAgfSxcblxuICBhZGRFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIGRhdGEuc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnBsYXlBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5wYXVzZUV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucGF1c2VBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5yZXN1bWVFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3VtZUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnJlc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3RhcnRBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICBkYXRhLnN0YXJ0RXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5wbGF5QW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucGF1c2VFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnBhdXNlQW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucmVzdW1lRXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5yZXN1bWVBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5yZXN0YXJ0RXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5yZXN0YXJ0QW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICB9LFxuXG4gIHBsYXlBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbi5wbGF5KCk7XG4gICAgdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcgPSB0cnVlO1xuICB9LFxuXG4gIHBhdXNlQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hbmltYXRpb24ucGF1c2UoKTtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IGZhbHNlO1xuICB9LFxuXG4gIHJlc3VtZUFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uLnBsYXkoKTtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IHRydWU7XG4gIH0sXG5cbiAgcmVzdGFydEFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uLnJlc3RhcnQoKTtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IHRydWU7XG4gIH1cbn0pO1xuXG4vKipcbiAqIFN0dWZmIHByb3BlcnR5IGludG8gZ2VuZXJpYyBgcHJvcGVydHlgIGtleS5cbiAqL1xuZnVuY3Rpb24gY29uZmlnRGVmYXVsdCAoZWwsIGRhdGEsIGNvbmZpZykge1xuICB2YXIgZnJvbSA9IGRhdGEuZnJvbSB8fCBnZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSk7XG4gIHJldHVybiBBRlJBTUUudXRpbHMuZXh0ZW5kKHt9LCBjb25maWcsIHtcbiAgICB0YXJnZXRzOiBbe2FmcmFtZVByb3BlcnR5OiBmcm9tfV0sXG4gICAgYWZyYW1lUHJvcGVydHk6IGRhdGEudG8sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSwgdGhpcy50YXJnZXRzWzBdLmFmcmFtZVByb3BlcnR5KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIEV4dGVuZCB4L3kvei93IG9udG8gdGhlIGNvbmZpZy5cbiAqL1xuZnVuY3Rpb24gY29uZmlnVmVjdG9yIChlbCwgZGF0YSwgY29uZmlnKSB7XG4gIHZhciBmcm9tID0gZ2V0Q29tcG9uZW50UHJvcGVydHkoZWwsIGRhdGEucHJvcGVydHkpO1xuICBpZiAoZGF0YS5mcm9tKSB7IGZyb20gPSBBRlJBTUUudXRpbHMuY29vcmRpbmF0ZXMucGFyc2UoZGF0YS5mcm9tKTsgfVxuICB2YXIgdG8gPSBBRlJBTUUudXRpbHMuY29vcmRpbmF0ZXMucGFyc2UoZGF0YS50byk7XG4gIHJldHVybiBBRlJBTUUudXRpbHMuZXh0ZW5kKHt9LCBjb25maWcsIHtcbiAgICB0YXJnZXRzOiBbZnJvbV0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSwgdGhpcy50YXJnZXRzWzBdKTtcbiAgICB9XG4gIH0sIHRvKTtcbn1cblxuZnVuY3Rpb24gZ2V0UHJvcGVydHlUeXBlIChlbCwgcHJvcGVydHkpIHtcbiAgdmFyIHNwbGl0ID0gcHJvcGVydHkuc3BsaXQoJy4nKTtcbiAgdmFyIGNvbXBvbmVudE5hbWUgPSBzcGxpdFswXTtcbiAgdmFyIHByb3BlcnR5TmFtZSA9IHNwbGl0WzFdO1xuICB2YXIgY29tcG9uZW50ID0gZWwuY29tcG9uZW50c1tjb21wb25lbnROYW1lXSB8fCBBRlJBTUUuY29tcG9uZW50c1tjb21wb25lbnROYW1lXTtcblxuICAvLyBQcmltaXRpdmVzLlxuICBpZiAoIWNvbXBvbmVudCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIGlmIChwcm9wZXJ0eU5hbWUpIHtcbiAgICByZXR1cm4gY29tcG9uZW50LnNjaGVtYVtwcm9wZXJ0eU5hbWVdLnR5cGU7XG4gIH1cbiAgcmV0dXJuIGNvbXBvbmVudC5zY2hlbWEudHlwZTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuICogQW5pbWUgdjEuMS4zXG4gKiBodHRwOi8vYW5pbWUtanMuY29tXG4gKiBKYXZhU2NyaXB0IGFuaW1hdGlvbiBlbmdpbmVcbiAqIENvcHlyaWdodCAoYykgMjAxNiBKdWxpYW4gR2FybmllclxuICogaHR0cDovL2p1bGlhbmdhcm5pZXIuY29tXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG4gICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgLy8gbGlrZSBOb2RlLlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5hbmltZSA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHZlcnNpb24gPSAnMS4xLjMnO1xuXG4gIC8vIERlZmF1bHRzXG5cbiAgdmFyIGRlZmF1bHRTZXR0aW5ncyA9IHtcbiAgICBkdXJhdGlvbjogMTAwMCxcbiAgICBkZWxheTogMCxcbiAgICBsb29wOiBmYWxzZSxcbiAgICBhdXRvcGxheTogdHJ1ZSxcbiAgICBkaXJlY3Rpb246ICdub3JtYWwnLFxuICAgIGVhc2luZzogJ2Vhc2VPdXRFbGFzdGljJyxcbiAgICBlbGFzdGljaXR5OiA0MDAsXG4gICAgcm91bmQ6IGZhbHNlLFxuICAgIGJlZ2luOiB1bmRlZmluZWQsXG4gICAgdXBkYXRlOiB1bmRlZmluZWQsXG4gICAgY29tcGxldGU6IHVuZGVmaW5lZFxuICB9XG5cbiAgLy8gVHJhbnNmb3Jtc1xuXG4gIHZhciB2YWxpZFRyYW5zZm9ybXMgPSBbJ3RyYW5zbGF0ZVgnLCAndHJhbnNsYXRlWScsICd0cmFuc2xhdGVaJywgJ3JvdGF0ZScsICdyb3RhdGVYJywgJ3JvdGF0ZVknLCAncm90YXRlWicsICdzY2FsZScsICdzY2FsZVgnLCAnc2NhbGVZJywgJ3NjYWxlWicsICdza2V3WCcsICdza2V3WSddO1xuICB2YXIgdHJhbnNmb3JtLCB0cmFuc2Zvcm1TdHIgPSAndHJhbnNmb3JtJztcblxuICAvLyBVdGlsc1xuXG4gIHZhciBpcyA9IHtcbiAgICBhcnI6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIEFycmF5LmlzQXJyYXkoYSkgfSxcbiAgICBvYmo6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKS5pbmRleE9mKCdPYmplY3QnKSA+IC0xIH0sXG4gICAgc3ZnOiBmdW5jdGlvbihhKSB7IHJldHVybiBhIGluc3RhbmNlb2YgU1ZHRWxlbWVudCB9LFxuICAgIGRvbTogZnVuY3Rpb24oYSkgeyByZXR1cm4gYS5ub2RlVHlwZSB8fCBpcy5zdmcoYSkgfSxcbiAgICBudW06IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICFpc05hTihwYXJzZUludChhKSkgfSxcbiAgICBzdHI6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAnc3RyaW5nJyB9LFxuICAgIGZuYzogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICdmdW5jdGlvbicgfSxcbiAgICB1bmQ6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAndW5kZWZpbmVkJyB9LFxuICAgIG51bDogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICdudWxsJyB9LFxuICAgIGhleDogZnVuY3Rpb24oYSkgeyByZXR1cm4gLyheI1swLTlBLUZdezZ9JCl8KF4jWzAtOUEtRl17M30kKS9pLnRlc3QoYSkgfSxcbiAgICByZ2I6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIC9ecmdiLy50ZXN0KGEpIH0sXG4gICAgaHNsOiBmdW5jdGlvbihhKSB7IHJldHVybiAvXmhzbC8udGVzdChhKSB9LFxuICAgIGNvbDogZnVuY3Rpb24oYSkgeyByZXR1cm4gKGlzLmhleChhKSB8fCBpcy5yZ2IoYSkgfHwgaXMuaHNsKGEpKSB9XG4gIH1cblxuICAvLyBFYXNpbmdzIGZ1bmN0aW9ucyBhZGFwdGVkIGZyb20gaHR0cDovL2pxdWVyeXVpLmNvbS9cblxuICB2YXIgZWFzaW5ncyA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgZWFzZXMgPSB7fTtcbiAgICB2YXIgbmFtZXMgPSBbJ1F1YWQnLCAnQ3ViaWMnLCAnUXVhcnQnLCAnUXVpbnQnLCAnRXhwbyddO1xuICAgIHZhciBmdW5jdGlvbnMgPSB7XG4gICAgICBTaW5lOiBmdW5jdGlvbih0KSB7IHJldHVybiAxICsgTWF0aC5zaW4oTWF0aC5QSSAvIDIgKiB0IC0gTWF0aC5QSSAvIDIpOyB9LFxuICAgICAgQ2lyYzogZnVuY3Rpb24odCkgeyByZXR1cm4gMSAtIE1hdGguc3FydCggMSAtIHQgKiB0ICk7IH0sXG4gICAgICBFbGFzdGljOiBmdW5jdGlvbih0LCBtKSB7XG4gICAgICAgIGlmKCB0ID09PSAwIHx8IHQgPT09IDEgKSByZXR1cm4gdDtcbiAgICAgICAgdmFyIHAgPSAoMSAtIE1hdGgubWluKG0sIDk5OCkgLyAxMDAwKSwgc3QgPSB0IC8gMSwgc3QxID0gc3QgLSAxLCBzID0gcCAvICggMiAqIE1hdGguUEkgKSAqIE1hdGguYXNpbiggMSApO1xuICAgICAgICByZXR1cm4gLSggTWF0aC5wb3coIDIsIDEwICogc3QxICkgKiBNYXRoLnNpbiggKCBzdDEgLSBzICkgKiAoIDIgKiBNYXRoLlBJICkgLyBwICkgKTtcbiAgICAgIH0sXG4gICAgICBCYWNrOiBmdW5jdGlvbih0KSB7IHJldHVybiB0ICogdCAqICggMyAqIHQgLSAyICk7IH0sXG4gICAgICBCb3VuY2U6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgdmFyIHBvdzIsIGJvdW5jZSA9IDQ7XG4gICAgICAgIHdoaWxlICggdCA8ICggKCBwb3cyID0gTWF0aC5wb3coIDIsIC0tYm91bmNlICkgKSAtIDEgKSAvIDExICkge31cbiAgICAgICAgcmV0dXJuIDEgLyBNYXRoLnBvdyggNCwgMyAtIGJvdW5jZSApIC0gNy41NjI1ICogTWF0aC5wb3coICggcG93MiAqIDMgLSAyICkgLyAyMiAtIHQsIDIgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbmFtZXMuZm9yRWFjaChmdW5jdGlvbihuYW1lLCBpKSB7XG4gICAgICBmdW5jdGlvbnNbbmFtZV0gPSBmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdyggdCwgaSArIDIgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhmdW5jdGlvbnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGVhc2VJbiA9IGZ1bmN0aW9uc1tuYW1lXTtcbiAgICAgIGVhc2VzWydlYXNlSW4nICsgbmFtZV0gPSBlYXNlSW47XG4gICAgICBlYXNlc1snZWFzZU91dCcgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIDEgLSBlYXNlSW4oMSAtIHQsIG0pOyB9O1xuICAgICAgZWFzZXNbJ2Vhc2VJbk91dCcgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIHQgPCAwLjUgPyBlYXNlSW4odCAqIDIsIG0pIC8gMiA6IDEgLSBlYXNlSW4odCAqIC0yICsgMiwgbSkgLyAyOyB9O1xuICAgICAgZWFzZXNbJ2Vhc2VPdXRJbicgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIHQgPCAwLjUgPyAoMSAtIGVhc2VJbigxIC0gMiAqIHQsIG0pKSAvIDIgOiAoZWFzZUluKHQgKiAyIC0gMSwgbSkgKyAxKSAvIDI7IH07XG4gICAgfSk7XG4gICAgZWFzZXMubGluZWFyID0gZnVuY3Rpb24odCkgeyByZXR1cm4gdDsgfTtcbiAgICByZXR1cm4gZWFzZXM7XG4gIH0pKCk7XG5cbiAgLy8gU3RyaW5nc1xuXG4gIHZhciBudW1iZXJUb1N0cmluZyA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiAoaXMuc3RyKHZhbCkpID8gdmFsIDogdmFsICsgJyc7XG4gIH1cblxuICB2YXIgc3RyaW5nVG9IeXBoZW5zID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgdmFyIHNlbGVjdFN0cmluZyA9IGZ1bmN0aW9uKHN0cikge1xuICAgIGlmIChpcy5jb2woc3RyKSkgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICB2YXIgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHN0cik7XG4gICAgICByZXR1cm4gbm9kZXM7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLy8gTnVtYmVyc1xuXG4gIHZhciByYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuICB9XG5cbiAgLy8gQXJyYXlzXG5cbiAgdmFyIGZsYXR0ZW5BcnJheSA9IGZ1bmN0aW9uKGFycikge1xuICAgIHJldHVybiBhcnIucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmNvbmNhdChpcy5hcnIoYikgPyBmbGF0dGVuQXJyYXkoYikgOiBiKTtcbiAgICB9LCBbXSk7XG4gIH1cblxuICB2YXIgdG9BcnJheSA9IGZ1bmN0aW9uKG8pIHtcbiAgICBpZiAoaXMuYXJyKG8pKSByZXR1cm4gbztcbiAgICBpZiAoaXMuc3RyKG8pKSBvID0gc2VsZWN0U3RyaW5nKG8pIHx8IG87XG4gICAgaWYgKG8gaW5zdGFuY2VvZiBOb2RlTGlzdCB8fCBvIGluc3RhbmNlb2YgSFRNTENvbGxlY3Rpb24pIHJldHVybiBbXS5zbGljZS5jYWxsKG8pO1xuICAgIHJldHVybiBbb107XG4gIH1cblxuICB2YXIgYXJyYXlDb250YWlucyA9IGZ1bmN0aW9uKGFyciwgdmFsKSB7XG4gICAgcmV0dXJuIGFyci5zb21lKGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGEgPT09IHZhbDsgfSk7XG4gIH1cblxuICB2YXIgZ3JvdXBBcnJheUJ5UHJvcHMgPSBmdW5jdGlvbihhcnIsIHByb3BzQXJyKSB7XG4gICAgdmFyIGdyb3VwcyA9IHt9O1xuICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uKG8pIHtcbiAgICAgIHZhciBncm91cCA9IEpTT04uc3RyaW5naWZ5KHByb3BzQXJyLm1hcChmdW5jdGlvbihwKSB7IHJldHVybiBvW3BdOyB9KSk7XG4gICAgICBncm91cHNbZ3JvdXBdID0gZ3JvdXBzW2dyb3VwXSB8fCBbXTtcbiAgICAgIGdyb3Vwc1tncm91cF0ucHVzaChvKTtcbiAgICB9KTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZ3JvdXBzKS5tYXAoZnVuY3Rpb24oZ3JvdXApIHtcbiAgICAgIHJldHVybiBncm91cHNbZ3JvdXBdO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIHJlbW92ZUFycmF5RHVwbGljYXRlcyA9IGZ1bmN0aW9uKGFycikge1xuICAgIHJldHVybiBhcnIuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0sIHBvcywgc2VsZikge1xuICAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZihpdGVtKSA9PT0gcG9zO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gT2JqZWN0c1xuXG4gIHZhciBjbG9uZU9iamVjdCA9IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgbmV3T2JqZWN0ID0ge307XG4gICAgZm9yICh2YXIgcCBpbiBvKSBuZXdPYmplY3RbcF0gPSBvW3BdO1xuICAgIHJldHVybiBuZXdPYmplY3Q7XG4gIH1cblxuICB2YXIgbWVyZ2VPYmplY3RzID0gZnVuY3Rpb24obzEsIG8yKSB7XG4gICAgZm9yICh2YXIgcCBpbiBvMikgbzFbcF0gPSAhaXMudW5kKG8xW3BdKSA/IG8xW3BdIDogbzJbcF07XG4gICAgcmV0dXJuIG8xO1xuICB9XG5cbiAgLy8gQ29sb3JzXG5cbiAgdmFyIGhleFRvUmdiID0gZnVuY3Rpb24oaGV4KSB7XG4gICAgdmFyIHJneCA9IC9eIz8oW2EtZlxcZF0pKFthLWZcXGRdKShbYS1mXFxkXSkkL2k7XG4gICAgdmFyIGhleCA9IGhleC5yZXBsYWNlKHJneCwgZnVuY3Rpb24obSwgciwgZywgYikgeyByZXR1cm4gciArIHIgKyBnICsgZyArIGIgKyBiOyB9KTtcbiAgICB2YXIgcmdiID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgdmFyIHIgPSBwYXJzZUludChyZ2JbMV0sIDE2KTtcbiAgICB2YXIgZyA9IHBhcnNlSW50KHJnYlsyXSwgMTYpO1xuICAgIHZhciBiID0gcGFyc2VJbnQocmdiWzNdLCAxNik7XG4gICAgcmV0dXJuICdyZ2IoJyArIHIgKyAnLCcgKyBnICsgJywnICsgYiArICcpJztcbiAgfVxuXG4gIHZhciBoc2xUb1JnYiA9IGZ1bmN0aW9uKGhzbCkge1xuICAgIHZhciBoc2wgPSAvaHNsXFwoKFxcZCspLFxccyooW1xcZC5dKyklLFxccyooW1xcZC5dKyklXFwpL2cuZXhlYyhoc2wpO1xuICAgIHZhciBoID0gcGFyc2VJbnQoaHNsWzFdKSAvIDM2MDtcbiAgICB2YXIgcyA9IHBhcnNlSW50KGhzbFsyXSkgLyAxMDA7XG4gICAgdmFyIGwgPSBwYXJzZUludChoc2xbM10pIC8gMTAwO1xuICAgIHZhciBodWUycmdiID0gZnVuY3Rpb24ocCwgcSwgdCkge1xuICAgICAgaWYgKHQgPCAwKSB0ICs9IDE7XG4gICAgICBpZiAodCA+IDEpIHQgLT0gMTtcbiAgICAgIGlmICh0IDwgMS82KSByZXR1cm4gcCArIChxIC0gcCkgKiA2ICogdDtcbiAgICAgIGlmICh0IDwgMS8yKSByZXR1cm4gcTtcbiAgICAgIGlmICh0IDwgMi8zKSByZXR1cm4gcCArIChxIC0gcCkgKiAoMi8zIC0gdCkgKiA2O1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIHZhciByLCBnLCBiO1xuICAgIGlmIChzID09IDApIHtcbiAgICAgIHIgPSBnID0gYiA9IGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBxID0gbCA8IDAuNSA/IGwgKiAoMSArIHMpIDogbCArIHMgLSBsICogcztcbiAgICAgIHZhciBwID0gMiAqIGwgLSBxO1xuICAgICAgciA9IGh1ZTJyZ2IocCwgcSwgaCArIDEvMyk7XG4gICAgICBnID0gaHVlMnJnYihwLCBxLCBoKTtcbiAgICAgIGIgPSBodWUycmdiKHAsIHEsIGggLSAxLzMpO1xuICAgIH1cbiAgICByZXR1cm4gJ3JnYignICsgciAqIDI1NSArICcsJyArIGcgKiAyNTUgKyAnLCcgKyBiICogMjU1ICsgJyknO1xuICB9XG5cbiAgdmFyIGNvbG9yVG9SZ2IgPSBmdW5jdGlvbih2YWwpIHtcbiAgICBpZiAoaXMucmdiKHZhbCkpIHJldHVybiB2YWw7XG4gICAgaWYgKGlzLmhleCh2YWwpKSByZXR1cm4gaGV4VG9SZ2IodmFsKTtcbiAgICBpZiAoaXMuaHNsKHZhbCkpIHJldHVybiBoc2xUb1JnYih2YWwpO1xuICB9XG5cbiAgLy8gVW5pdHNcblxuICB2YXIgZ2V0VW5pdCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiAvKFtcXCtcXC1dP1swLTl8YXV0b1xcLl0rKSglfHB4fHB0fGVtfHJlbXxpbnxjbXxtbXxleHxwY3x2d3x2aHxkZWcpPy8uZXhlYyh2YWwpWzJdO1xuICB9XG5cbiAgdmFyIGFkZERlZmF1bHRUcmFuc2Zvcm1Vbml0ID0gZnVuY3Rpb24ocHJvcCwgdmFsLCBpbnRpYWxWYWwpIHtcbiAgICBpZiAoZ2V0VW5pdCh2YWwpKSByZXR1cm4gdmFsO1xuICAgIGlmIChwcm9wLmluZGV4T2YoJ3RyYW5zbGF0ZScpID4gLTEpIHJldHVybiBnZXRVbml0KGludGlhbFZhbCkgPyB2YWwgKyBnZXRVbml0KGludGlhbFZhbCkgOiB2YWwgKyAncHgnO1xuICAgIGlmIChwcm9wLmluZGV4T2YoJ3JvdGF0ZScpID4gLTEgfHwgcHJvcC5pbmRleE9mKCdza2V3JykgPiAtMSkgcmV0dXJuIHZhbCArICdkZWcnO1xuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICAvLyBWYWx1ZXNcblxuICB2YXIgZ2V0Q1NTVmFsdWUgPSBmdW5jdGlvbihlbCwgcHJvcCkge1xuICAgIC8vIEZpcnN0IGNoZWNrIGlmIHByb3AgaXMgYSB2YWxpZCBDU1MgcHJvcGVydHlcbiAgICBpZiAocHJvcCBpbiBlbC5zdHlsZSkge1xuICAgICAgLy8gVGhlbiByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9yIGZhbGxiYWNrIHRvICcwJyB3aGVuIGdldFByb3BlcnR5VmFsdWUgZmFpbHNcbiAgICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKGVsKS5nZXRQcm9wZXJ0eVZhbHVlKHN0cmluZ1RvSHlwaGVucyhwcm9wKSkgfHwgJzAnO1xuICAgIH1cbiAgfVxuXG4gIHZhciBnZXRUcmFuc2Zvcm1WYWx1ZSA9IGZ1bmN0aW9uKGVsLCBwcm9wKSB7XG4gICAgdmFyIGRlZmF1bHRWYWwgPSBwcm9wLmluZGV4T2YoJ3NjYWxlJykgPiAtMSA/IDEgOiAwO1xuICAgIHZhciBzdHIgPSBlbC5zdHlsZS50cmFuc2Zvcm07XG4gICAgaWYgKCFzdHIpIHJldHVybiBkZWZhdWx0VmFsO1xuICAgIHZhciByZ3ggPSAvKFxcdyspXFwoKC4rPylcXCkvZztcbiAgICB2YXIgbWF0Y2ggPSBbXTtcbiAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgd2hpbGUgKG1hdGNoID0gcmd4LmV4ZWMoc3RyKSkge1xuICAgICAgcHJvcHMucHVzaChtYXRjaFsxXSk7XG4gICAgICB2YWx1ZXMucHVzaChtYXRjaFsyXSk7XG4gICAgfVxuICAgIHZhciB2YWwgPSB2YWx1ZXMuZmlsdGVyKGZ1bmN0aW9uKGYsIGkpIHsgcmV0dXJuIHByb3BzW2ldID09PSBwcm9wOyB9KTtcbiAgICByZXR1cm4gdmFsLmxlbmd0aCA/IHZhbFswXSA6IGRlZmF1bHRWYWw7XG4gIH1cblxuICB2YXIgZ2V0QW5pbWF0aW9uVHlwZSA9IGZ1bmN0aW9uKGVsLCBwcm9wKSB7XG4gICAgaWYgKCBpcy5kb20oZWwpICYmIGFycmF5Q29udGFpbnModmFsaWRUcmFuc2Zvcm1zLCBwcm9wKSkgcmV0dXJuICd0cmFuc2Zvcm0nO1xuICAgIGlmICggaXMuZG9tKGVsKSAmJiAoZWwuZ2V0QXR0cmlidXRlKHByb3ApIHx8IChpcy5zdmcoZWwpICYmIGVsW3Byb3BdKSkpIHJldHVybiAnYXR0cmlidXRlJztcbiAgICBpZiAoIGlzLmRvbShlbCkgJiYgKHByb3AgIT09ICd0cmFuc2Zvcm0nICYmIGdldENTU1ZhbHVlKGVsLCBwcm9wKSkpIHJldHVybiAnY3NzJztcbiAgICBpZiAoIWlzLm51bChlbFtwcm9wXSkgJiYgIWlzLnVuZChlbFtwcm9wXSkpIHJldHVybiAnb2JqZWN0JztcbiAgfVxuXG4gIHZhciBnZXRJbml0aWFsVGFyZ2V0VmFsdWUgPSBmdW5jdGlvbih0YXJnZXQsIHByb3ApIHtcbiAgICBzd2l0Y2ggKGdldEFuaW1hdGlvblR5cGUodGFyZ2V0LCBwcm9wKSkge1xuICAgICAgY2FzZSAndHJhbnNmb3JtJzogcmV0dXJuIGdldFRyYW5zZm9ybVZhbHVlKHRhcmdldCwgcHJvcCk7XG4gICAgICBjYXNlICdjc3MnOiByZXR1cm4gZ2V0Q1NTVmFsdWUodGFyZ2V0LCBwcm9wKTtcbiAgICAgIGNhc2UgJ2F0dHJpYnV0ZSc6IHJldHVybiB0YXJnZXQuZ2V0QXR0cmlidXRlKHByb3ApO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0W3Byb3BdIHx8IDA7XG4gIH1cblxuICB2YXIgZ2V0VmFsaWRWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlcywgdmFsLCBvcmlnaW5hbENTUykge1xuICAgIGlmIChpcy5jb2wodmFsKSkgcmV0dXJuIGNvbG9yVG9SZ2IodmFsKTtcbiAgICBpZiAoZ2V0VW5pdCh2YWwpKSByZXR1cm4gdmFsO1xuICAgIHZhciB1bml0ID0gZ2V0VW5pdCh2YWx1ZXMudG8pID8gZ2V0VW5pdCh2YWx1ZXMudG8pIDogZ2V0VW5pdCh2YWx1ZXMuZnJvbSk7XG4gICAgaWYgKCF1bml0ICYmIG9yaWdpbmFsQ1NTKSB1bml0ID0gZ2V0VW5pdChvcmlnaW5hbENTUyk7XG4gICAgcmV0dXJuIHVuaXQgPyB2YWwgKyB1bml0IDogdmFsO1xuICB9XG5cbiAgdmFyIGRlY29tcG9zZVZhbHVlID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIHJneCA9IC8tP1xcZCpcXC4/XFxkKy9nO1xuICAgIHJldHVybiB7XG4gICAgICBvcmlnaW5hbDogdmFsLFxuICAgICAgbnVtYmVyczogbnVtYmVyVG9TdHJpbmcodmFsKS5tYXRjaChyZ3gpID8gbnVtYmVyVG9TdHJpbmcodmFsKS5tYXRjaChyZ3gpLm1hcChOdW1iZXIpIDogWzBdLFxuICAgICAgc3RyaW5nczogbnVtYmVyVG9TdHJpbmcodmFsKS5zcGxpdChyZ3gpXG4gICAgfVxuICB9XG5cbiAgdmFyIHJlY29tcG9zZVZhbHVlID0gZnVuY3Rpb24obnVtYmVycywgc3RyaW5ncywgaW5pdGlhbFN0cmluZ3MpIHtcbiAgICByZXR1cm4gc3RyaW5ncy5yZWR1Y2UoZnVuY3Rpb24oYSwgYiwgaSkge1xuICAgICAgdmFyIGIgPSAoYiA/IGIgOiBpbml0aWFsU3RyaW5nc1tpIC0gMV0pO1xuICAgICAgcmV0dXJuIGEgKyBudW1iZXJzW2kgLSAxXSArIGI7XG4gICAgfSk7XG4gIH1cblxuICAvLyBBbmltYXRhYmxlc1xuXG4gIHZhciBnZXRBbmltYXRhYmxlcyA9IGZ1bmN0aW9uKHRhcmdldHMpIHtcbiAgICB2YXIgdGFyZ2V0cyA9IHRhcmdldHMgPyAoZmxhdHRlbkFycmF5KGlzLmFycih0YXJnZXRzKSA/IHRhcmdldHMubWFwKHRvQXJyYXkpIDogdG9BcnJheSh0YXJnZXRzKSkpIDogW107XG4gICAgcmV0dXJuIHRhcmdldHMubWFwKGZ1bmN0aW9uKHQsIGkpIHtcbiAgICAgIHJldHVybiB7IHRhcmdldDogdCwgaWQ6IGkgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFByb3BlcnRpZXNcblxuICB2YXIgZ2V0UHJvcGVydGllcyA9IGZ1bmN0aW9uKHBhcmFtcywgc2V0dGluZ3MpIHtcbiAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICBmb3IgKHZhciBwIGluIHBhcmFtcykge1xuICAgICAgaWYgKCFkZWZhdWx0U2V0dGluZ3MuaGFzT3duUHJvcGVydHkocCkgJiYgcCAhPT0gJ3RhcmdldHMnKSB7XG4gICAgICAgIHZhciBwcm9wID0gaXMub2JqKHBhcmFtc1twXSkgPyBjbG9uZU9iamVjdChwYXJhbXNbcF0pIDoge3ZhbHVlOiBwYXJhbXNbcF19O1xuICAgICAgICBwcm9wLm5hbWUgPSBwO1xuICAgICAgICBwcm9wcy5wdXNoKG1lcmdlT2JqZWN0cyhwcm9wLCBzZXR0aW5ncykpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvcHM7XG4gIH1cblxuICB2YXIgZ2V0UHJvcGVydGllc1ZhbHVlcyA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCwgdmFsdWUsIGkpIHtcbiAgICB2YXIgdmFsdWVzID0gdG9BcnJheSggaXMuZm5jKHZhbHVlKSA/IHZhbHVlKHRhcmdldCwgaSkgOiB2YWx1ZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZyb206ICh2YWx1ZXMubGVuZ3RoID4gMSkgPyB2YWx1ZXNbMF0gOiBnZXRJbml0aWFsVGFyZ2V0VmFsdWUodGFyZ2V0LCBwcm9wKSxcbiAgICAgIHRvOiAodmFsdWVzLmxlbmd0aCA+IDEpID8gdmFsdWVzWzFdIDogdmFsdWVzWzBdXG4gICAgfVxuICB9XG5cbiAgLy8gVHdlZW5zXG5cbiAgdmFyIGdldFR3ZWVuVmFsdWVzID0gZnVuY3Rpb24ocHJvcCwgdmFsdWVzLCB0eXBlLCB0YXJnZXQpIHtcbiAgICB2YXIgdmFsaWQgPSB7fTtcbiAgICBpZiAodHlwZSA9PT0gJ3RyYW5zZm9ybScpIHtcbiAgICAgIHZhbGlkLmZyb20gPSBwcm9wICsgJygnICsgYWRkRGVmYXVsdFRyYW5zZm9ybVVuaXQocHJvcCwgdmFsdWVzLmZyb20sIHZhbHVlcy50bykgKyAnKSc7XG4gICAgICB2YWxpZC50byA9IHByb3AgKyAnKCcgKyBhZGREZWZhdWx0VHJhbnNmb3JtVW5pdChwcm9wLCB2YWx1ZXMudG8pICsgJyknO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgb3JpZ2luYWxDU1MgPSAodHlwZSA9PT0gJ2NzcycpID8gZ2V0Q1NTVmFsdWUodGFyZ2V0LCBwcm9wKSA6IHVuZGVmaW5lZDtcbiAgICAgIHZhbGlkLmZyb20gPSBnZXRWYWxpZFZhbHVlKHZhbHVlcywgdmFsdWVzLmZyb20sIG9yaWdpbmFsQ1NTKTtcbiAgICAgIHZhbGlkLnRvID0gZ2V0VmFsaWRWYWx1ZSh2YWx1ZXMsIHZhbHVlcy50bywgb3JpZ2luYWxDU1MpO1xuICAgIH1cbiAgICByZXR1cm4geyBmcm9tOiBkZWNvbXBvc2VWYWx1ZSh2YWxpZC5mcm9tKSwgdG86IGRlY29tcG9zZVZhbHVlKHZhbGlkLnRvKSB9O1xuICB9XG5cbiAgdmFyIGdldFR3ZWVuc1Byb3BzID0gZnVuY3Rpb24oYW5pbWF0YWJsZXMsIHByb3BzKSB7XG4gICAgdmFyIHR3ZWVuc1Byb3BzID0gW107XG4gICAgYW5pbWF0YWJsZXMuZm9yRWFjaChmdW5jdGlvbihhbmltYXRhYmxlLCBpKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gYW5pbWF0YWJsZS50YXJnZXQ7XG4gICAgICByZXR1cm4gcHJvcHMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgIHZhciBhbmltVHlwZSA9IGdldEFuaW1hdGlvblR5cGUodGFyZ2V0LCBwcm9wLm5hbWUpO1xuICAgICAgICBpZiAoYW5pbVR5cGUpIHtcbiAgICAgICAgICB2YXIgdmFsdWVzID0gZ2V0UHJvcGVydGllc1ZhbHVlcyh0YXJnZXQsIHByb3AubmFtZSwgcHJvcC52YWx1ZSwgaSk7XG4gICAgICAgICAgdmFyIHR3ZWVuID0gY2xvbmVPYmplY3QocHJvcCk7XG4gICAgICAgICAgdHdlZW4uYW5pbWF0YWJsZXMgPSBhbmltYXRhYmxlO1xuICAgICAgICAgIHR3ZWVuLnR5cGUgPSBhbmltVHlwZTtcbiAgICAgICAgICB0d2Vlbi5mcm9tID0gZ2V0VHdlZW5WYWx1ZXMocHJvcC5uYW1lLCB2YWx1ZXMsIHR3ZWVuLnR5cGUsIHRhcmdldCkuZnJvbTtcbiAgICAgICAgICB0d2Vlbi50byA9IGdldFR3ZWVuVmFsdWVzKHByb3AubmFtZSwgdmFsdWVzLCB0d2Vlbi50eXBlLCB0YXJnZXQpLnRvO1xuICAgICAgICAgIHR3ZWVuLnJvdW5kID0gKGlzLmNvbCh2YWx1ZXMuZnJvbSkgfHwgdHdlZW4ucm91bmQpID8gMSA6IDA7XG4gICAgICAgICAgdHdlZW4uZGVsYXkgPSAoaXMuZm5jKHR3ZWVuLmRlbGF5KSA/IHR3ZWVuLmRlbGF5KHRhcmdldCwgaSwgYW5pbWF0YWJsZXMubGVuZ3RoKSA6IHR3ZWVuLmRlbGF5KSAvIGFuaW1hdGlvbi5zcGVlZDtcbiAgICAgICAgICB0d2Vlbi5kdXJhdGlvbiA9IChpcy5mbmModHdlZW4uZHVyYXRpb24pID8gdHdlZW4uZHVyYXRpb24odGFyZ2V0LCBpLCBhbmltYXRhYmxlcy5sZW5ndGgpIDogdHdlZW4uZHVyYXRpb24pIC8gYW5pbWF0aW9uLnNwZWVkO1xuICAgICAgICAgIHR3ZWVuc1Byb3BzLnB1c2godHdlZW4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdHdlZW5zUHJvcHM7XG4gIH1cblxuICB2YXIgZ2V0VHdlZW5zID0gZnVuY3Rpb24oYW5pbWF0YWJsZXMsIHByb3BzKSB7XG4gICAgdmFyIHR3ZWVuc1Byb3BzID0gZ2V0VHdlZW5zUHJvcHMoYW5pbWF0YWJsZXMsIHByb3BzKTtcbiAgICB2YXIgc3BsaXR0ZWRQcm9wcyA9IGdyb3VwQXJyYXlCeVByb3BzKHR3ZWVuc1Byb3BzLCBbJ25hbWUnLCAnZnJvbScsICd0bycsICdkZWxheScsICdkdXJhdGlvbiddKTtcbiAgICByZXR1cm4gc3BsaXR0ZWRQcm9wcy5tYXAoZnVuY3Rpb24odHdlZW5Qcm9wcykge1xuICAgICAgdmFyIHR3ZWVuID0gY2xvbmVPYmplY3QodHdlZW5Qcm9wc1swXSk7XG4gICAgICB0d2Vlbi5hbmltYXRhYmxlcyA9IHR3ZWVuUHJvcHMubWFwKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAuYW5pbWF0YWJsZXMgfSk7XG4gICAgICB0d2Vlbi50b3RhbER1cmF0aW9uID0gdHdlZW4uZGVsYXkgKyB0d2Vlbi5kdXJhdGlvbjtcbiAgICAgIHJldHVybiB0d2VlbjtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZXZlcnNlVHdlZW5zID0gZnVuY3Rpb24oYW5pbSwgZGVsYXlzKSB7XG4gICAgYW5pbS50d2VlbnMuZm9yRWFjaChmdW5jdGlvbih0d2Vlbikge1xuICAgICAgdmFyIHRvVmFsID0gdHdlZW4udG87XG4gICAgICB2YXIgZnJvbVZhbCA9IHR3ZWVuLmZyb207XG4gICAgICB2YXIgZGVsYXlWYWwgPSBhbmltLmR1cmF0aW9uIC0gKHR3ZWVuLmRlbGF5ICsgdHdlZW4uZHVyYXRpb24pO1xuICAgICAgdHdlZW4uZnJvbSA9IHRvVmFsO1xuICAgICAgdHdlZW4udG8gPSBmcm9tVmFsO1xuICAgICAgaWYgKGRlbGF5cykgdHdlZW4uZGVsYXkgPSBkZWxheVZhbDtcbiAgICB9KTtcbiAgICBhbmltLnJldmVyc2VkID0gYW5pbS5yZXZlcnNlZCA/IGZhbHNlIDogdHJ1ZTtcbiAgfVxuXG4gIHZhciBnZXRUd2VlbnNEdXJhdGlvbiA9IGZ1bmN0aW9uKHR3ZWVucykge1xuICAgIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCB0d2VlbnMubWFwKGZ1bmN0aW9uKHR3ZWVuKXsgcmV0dXJuIHR3ZWVuLnRvdGFsRHVyYXRpb247IH0pKTtcbiAgfVxuXG4gIHZhciBnZXRUd2VlbnNEZWxheSA9IGZ1bmN0aW9uKHR3ZWVucykge1xuICAgIHJldHVybiBNYXRoLm1pbi5hcHBseShNYXRoLCB0d2VlbnMubWFwKGZ1bmN0aW9uKHR3ZWVuKXsgcmV0dXJuIHR3ZWVuLmRlbGF5OyB9KSk7XG4gIH1cblxuICAvLyB3aWxsLWNoYW5nZVxuXG4gIHZhciBnZXRXaWxsQ2hhbmdlID0gZnVuY3Rpb24oYW5pbSkge1xuICAgIHZhciBwcm9wcyA9IFtdO1xuICAgIHZhciBlbHMgPSBbXTtcbiAgICBhbmltLnR3ZWVucy5mb3JFYWNoKGZ1bmN0aW9uKHR3ZWVuKSB7XG4gICAgICBpZiAodHdlZW4udHlwZSA9PT0gJ2NzcycgfHwgdHdlZW4udHlwZSA9PT0gJ3RyYW5zZm9ybScgKSB7XG4gICAgICAgIHByb3BzLnB1c2godHdlZW4udHlwZSA9PT0gJ2NzcycgPyBzdHJpbmdUb0h5cGhlbnModHdlZW4ubmFtZSkgOiAndHJhbnNmb3JtJyk7XG4gICAgICAgIHR3ZWVuLmFuaW1hdGFibGVzLmZvckVhY2goZnVuY3Rpb24oYW5pbWF0YWJsZSkgeyBlbHMucHVzaChhbmltYXRhYmxlLnRhcmdldCk7IH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBwcm9wZXJ0aWVzOiByZW1vdmVBcnJheUR1cGxpY2F0ZXMocHJvcHMpLmpvaW4oJywgJyksXG4gICAgICBlbGVtZW50czogcmVtb3ZlQXJyYXlEdXBsaWNhdGVzKGVscylcbiAgICB9XG4gIH1cblxuICB2YXIgc2V0V2lsbENoYW5nZSA9IGZ1bmN0aW9uKGFuaW0pIHtcbiAgICB2YXIgd2lsbENoYW5nZSA9IGdldFdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgd2lsbENoYW5nZS5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIGVsZW1lbnQuc3R5bGUud2lsbENoYW5nZSA9IHdpbGxDaGFuZ2UucHJvcGVydGllcztcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZW1vdmVXaWxsQ2hhbmdlID0gZnVuY3Rpb24oYW5pbSkge1xuICAgIHZhciB3aWxsQ2hhbmdlID0gZ2V0V2lsbENoYW5nZShhbmltKTtcbiAgICB3aWxsQ2hhbmdlLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgZWxlbWVudC5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnd2lsbC1jaGFuZ2UnKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIFN2ZyBwYXRoICovXG5cbiAgdmFyIGdldFBhdGhQcm9wcyA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICB2YXIgZWwgPSBpcy5zdHIocGF0aCkgPyBzZWxlY3RTdHJpbmcocGF0aClbMF0gOiBwYXRoO1xuICAgIHJldHVybiB7XG4gICAgICBwYXRoOiBlbCxcbiAgICAgIHZhbHVlOiBlbC5nZXRUb3RhbExlbmd0aCgpXG4gICAgfVxuICB9XG5cbiAgdmFyIHNuYXBQcm9ncmVzc1RvUGF0aCA9IGZ1bmN0aW9uKHR3ZWVuLCBwcm9ncmVzcykge1xuICAgIHZhciBwYXRoRWwgPSB0d2Vlbi5wYXRoO1xuICAgIHZhciBwYXRoUHJvZ3Jlc3MgPSB0d2Vlbi52YWx1ZSAqIHByb2dyZXNzO1xuICAgIHZhciBwb2ludCA9IGZ1bmN0aW9uKG9mZnNldCkge1xuICAgICAgdmFyIG8gPSBvZmZzZXQgfHwgMDtcbiAgICAgIHZhciBwID0gcHJvZ3Jlc3MgPiAxID8gdHdlZW4udmFsdWUgKyBvIDogcGF0aFByb2dyZXNzICsgbztcbiAgICAgIHJldHVybiBwYXRoRWwuZ2V0UG9pbnRBdExlbmd0aChwKTtcbiAgICB9XG4gICAgdmFyIHAgPSBwb2ludCgpO1xuICAgIHZhciBwMCA9IHBvaW50KC0xKTtcbiAgICB2YXIgcDEgPSBwb2ludCgrMSk7XG4gICAgc3dpdGNoICh0d2Vlbi5uYW1lKSB7XG4gICAgICBjYXNlICd0cmFuc2xhdGVYJzogcmV0dXJuIHAueDtcbiAgICAgIGNhc2UgJ3RyYW5zbGF0ZVknOiByZXR1cm4gcC55O1xuICAgICAgY2FzZSAncm90YXRlJzogcmV0dXJuIE1hdGguYXRhbjIocDEueSAtIHAwLnksIHAxLnggLSBwMC54KSAqIDE4MCAvIE1hdGguUEk7XG4gICAgfVxuICB9XG5cbiAgLy8gUHJvZ3Jlc3NcblxuICB2YXIgZ2V0VHdlZW5Qcm9ncmVzcyA9IGZ1bmN0aW9uKHR3ZWVuLCB0aW1lKSB7XG4gICAgdmFyIGVsYXBzZWQgPSBNYXRoLm1pbihNYXRoLm1heCh0aW1lIC0gdHdlZW4uZGVsYXksIDApLCB0d2Vlbi5kdXJhdGlvbik7XG4gICAgdmFyIHBlcmNlbnQgPSBlbGFwc2VkIC8gdHdlZW4uZHVyYXRpb247XG4gICAgdmFyIHByb2dyZXNzID0gdHdlZW4udG8ubnVtYmVycy5tYXAoZnVuY3Rpb24obnVtYmVyLCBwKSB7XG4gICAgICB2YXIgc3RhcnQgPSB0d2Vlbi5mcm9tLm51bWJlcnNbcF07XG4gICAgICB2YXIgZWFzZWQgPSBlYXNpbmdzW3R3ZWVuLmVhc2luZ10ocGVyY2VudCwgdHdlZW4uZWxhc3RpY2l0eSk7XG4gICAgICB2YXIgdmFsID0gdHdlZW4ucGF0aCA/IHNuYXBQcm9ncmVzc1RvUGF0aCh0d2VlbiwgZWFzZWQpIDogc3RhcnQgKyBlYXNlZCAqIChudW1iZXIgLSBzdGFydCk7XG4gICAgICB2YWwgPSB0d2Vlbi5yb3VuZCA/IE1hdGgucm91bmQodmFsICogdHdlZW4ucm91bmQpIC8gdHdlZW4ucm91bmQgOiB2YWw7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH0pO1xuICAgIHJldHVybiByZWNvbXBvc2VWYWx1ZShwcm9ncmVzcywgdHdlZW4udG8uc3RyaW5ncywgdHdlZW4uZnJvbS5zdHJpbmdzKTtcbiAgfVxuXG4gIHZhciBzZXRBbmltYXRpb25Qcm9ncmVzcyA9IGZ1bmN0aW9uKGFuaW0sIHRpbWUpIHtcbiAgICB2YXIgdHJhbnNmb3JtcztcbiAgICBhbmltLmN1cnJlbnRUaW1lID0gdGltZTtcbiAgICBhbmltLnByb2dyZXNzID0gKHRpbWUgLyBhbmltLmR1cmF0aW9uKSAqIDEwMDtcbiAgICBmb3IgKHZhciB0ID0gMDsgdCA8IGFuaW0udHdlZW5zLmxlbmd0aDsgdCsrKSB7XG4gICAgICB2YXIgdHdlZW4gPSBhbmltLnR3ZWVuc1t0XTtcbiAgICAgIHR3ZWVuLmN1cnJlbnRWYWx1ZSA9IGdldFR3ZWVuUHJvZ3Jlc3ModHdlZW4sIHRpbWUpO1xuICAgICAgdmFyIHByb2dyZXNzID0gdHdlZW4uY3VycmVudFZhbHVlO1xuICAgICAgZm9yICh2YXIgYSA9IDA7IGEgPCB0d2Vlbi5hbmltYXRhYmxlcy5sZW5ndGg7IGErKykge1xuICAgICAgICB2YXIgYW5pbWF0YWJsZSA9IHR3ZWVuLmFuaW1hdGFibGVzW2FdO1xuICAgICAgICB2YXIgaWQgPSBhbmltYXRhYmxlLmlkO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gYW5pbWF0YWJsZS50YXJnZXQ7XG4gICAgICAgIHZhciBuYW1lID0gdHdlZW4ubmFtZTtcbiAgICAgICAgc3dpdGNoICh0d2Vlbi50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnY3NzJzogdGFyZ2V0LnN0eWxlW25hbWVdID0gcHJvZ3Jlc3M7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2F0dHJpYnV0ZSc6IHRhcmdldC5zZXRBdHRyaWJ1dGUobmFtZSwgcHJvZ3Jlc3MpOyBicmVhaztcbiAgICAgICAgICBjYXNlICdvYmplY3QnOiB0YXJnZXRbbmFtZV0gPSBwcm9ncmVzczsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndHJhbnNmb3JtJzpcbiAgICAgICAgICBpZiAoIXRyYW5zZm9ybXMpIHRyYW5zZm9ybXMgPSB7fTtcbiAgICAgICAgICBpZiAoIXRyYW5zZm9ybXNbaWRdKSB0cmFuc2Zvcm1zW2lkXSA9IFtdO1xuICAgICAgICAgIHRyYW5zZm9ybXNbaWRdLnB1c2gocHJvZ3Jlc3MpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0cmFuc2Zvcm1zKSB7XG4gICAgICBpZiAoIXRyYW5zZm9ybSkgdHJhbnNmb3JtID0gKGdldENTU1ZhbHVlKGRvY3VtZW50LmJvZHksIHRyYW5zZm9ybVN0cikgPyAnJyA6ICctd2Via2l0LScpICsgdHJhbnNmb3JtU3RyO1xuICAgICAgZm9yICh2YXIgdCBpbiB0cmFuc2Zvcm1zKSB7XG4gICAgICAgIGFuaW0uYW5pbWF0YWJsZXNbdF0udGFyZ2V0LnN0eWxlW3RyYW5zZm9ybV0gPSB0cmFuc2Zvcm1zW3RdLmpvaW4oJyAnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBBbmltYXRpb25cblxuICB2YXIgY3JlYXRlQW5pbWF0aW9uID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgdmFyIGFuaW0gPSB7fTtcbiAgICBhbmltLmFuaW1hdGFibGVzID0gZ2V0QW5pbWF0YWJsZXMocGFyYW1zLnRhcmdldHMpO1xuICAgIGFuaW0uc2V0dGluZ3MgPSBtZXJnZU9iamVjdHMocGFyYW1zLCBkZWZhdWx0U2V0dGluZ3MpO1xuICAgIGFuaW0ucHJvcGVydGllcyA9IGdldFByb3BlcnRpZXMocGFyYW1zLCBhbmltLnNldHRpbmdzKTtcbiAgICBhbmltLnR3ZWVucyA9IGdldFR3ZWVucyhhbmltLmFuaW1hdGFibGVzLCBhbmltLnByb3BlcnRpZXMpO1xuICAgIGFuaW0uZHVyYXRpb24gPSBhbmltLnR3ZWVucy5sZW5ndGggPyBnZXRUd2VlbnNEdXJhdGlvbihhbmltLnR3ZWVucykgOiBwYXJhbXMuZHVyYXRpb247XG4gICAgYW5pbS5kZWxheSA9IGFuaW0udHdlZW5zLmxlbmd0aCA/IGdldFR3ZWVuc0RlbGF5KGFuaW0udHdlZW5zKSA6IHBhcmFtcy5kZWxheTtcbiAgICBhbmltLmN1cnJlbnRUaW1lID0gMDtcbiAgICBhbmltLnByb2dyZXNzID0gMDtcbiAgICBhbmltLmVuZGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIGFuaW07XG4gIH1cblxuICAvLyBQdWJsaWNcblxuICB2YXIgYW5pbWF0aW9ucyA9IFtdO1xuICB2YXIgcmFmID0gMDtcblxuICB2YXIgZW5naW5lID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBwbGF5ID0gZnVuY3Rpb24oKSB7IHJhZiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTsgfTtcbiAgICB2YXIgc3RlcCA9IGZ1bmN0aW9uKHQpIHtcbiAgICAgIGlmIChhbmltYXRpb25zLmxlbmd0aCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuaW1hdGlvbnMubGVuZ3RoOyBpKyspIGFuaW1hdGlvbnNbaV0udGljayh0KTtcbiAgICAgICAgcGxheSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUocmFmKTtcbiAgICAgICAgcmFmID0gMDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBsYXk7XG4gIH0pKCk7XG5cbiAgdmFyIGFuaW1hdGlvbiA9IGZ1bmN0aW9uKHBhcmFtcykge1xuXG4gICAgdmFyIGFuaW0gPSBjcmVhdGVBbmltYXRpb24ocGFyYW1zKTtcbiAgICB2YXIgdGltZSA9IHt9O1xuXG4gICAgYW5pbS50aWNrID0gZnVuY3Rpb24obm93KSB7XG4gICAgICBhbmltLmVuZGVkID0gZmFsc2U7XG4gICAgICBpZiAoIXRpbWUuc3RhcnQpIHRpbWUuc3RhcnQgPSBub3c7XG4gICAgICB0aW1lLmN1cnJlbnQgPSBNYXRoLm1pbihNYXRoLm1heCh0aW1lLmxhc3QgKyBub3cgLSB0aW1lLnN0YXJ0LCAwKSwgYW5pbS5kdXJhdGlvbik7XG4gICAgICBzZXRBbmltYXRpb25Qcm9ncmVzcyhhbmltLCB0aW1lLmN1cnJlbnQpO1xuICAgICAgdmFyIHMgPSBhbmltLnNldHRpbmdzO1xuICAgICAgaWYgKHRpbWUuY3VycmVudCA+PSBhbmltLmRlbGF5KSB7XG4gICAgICAgIGlmIChzLmJlZ2luKSBzLmJlZ2luKGFuaW0pOyBzLmJlZ2luID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAocy51cGRhdGUpIHMudXBkYXRlKGFuaW0pO1xuICAgICAgfVxuICAgICAgaWYgKHRpbWUuY3VycmVudCA+PSBhbmltLmR1cmF0aW9uKSB7XG4gICAgICAgIGlmIChzLmxvb3ApIHtcbiAgICAgICAgICB0aW1lLnN0YXJ0ID0gbm93O1xuICAgICAgICAgIGlmIChzLmRpcmVjdGlvbiA9PT0gJ2FsdGVybmF0ZScpIHJldmVyc2VUd2VlbnMoYW5pbSwgdHJ1ZSk7XG4gICAgICAgICAgaWYgKGlzLm51bShzLmxvb3ApKSBzLmxvb3AtLTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhbmltLmVuZGVkID0gdHJ1ZTtcbiAgICAgICAgICBhbmltLnBhdXNlKCk7XG4gICAgICAgICAgaWYgKHMuY29tcGxldGUpIHMuY29tcGxldGUoYW5pbSk7XG4gICAgICAgIH1cbiAgICAgICAgdGltZS5sYXN0ID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhbmltLnNlZWsgPSBmdW5jdGlvbihwcm9ncmVzcykge1xuICAgICAgc2V0QW5pbWF0aW9uUHJvZ3Jlc3MoYW5pbSwgKHByb2dyZXNzIC8gMTAwKSAqIGFuaW0uZHVyYXRpb24pO1xuICAgIH1cblxuICAgIGFuaW0ucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlbW92ZVdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgICB2YXIgaSA9IGFuaW1hdGlvbnMuaW5kZXhPZihhbmltKTtcbiAgICAgIGlmIChpID4gLTEpIGFuaW1hdGlvbnMuc3BsaWNlKGksIDEpO1xuICAgIH1cblxuICAgIGFuaW0ucGxheSA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgYW5pbS5wYXVzZSgpO1xuICAgICAgaWYgKHBhcmFtcykgYW5pbSA9IG1lcmdlT2JqZWN0cyhjcmVhdGVBbmltYXRpb24obWVyZ2VPYmplY3RzKHBhcmFtcywgYW5pbS5zZXR0aW5ncykpLCBhbmltKTtcbiAgICAgIHRpbWUuc3RhcnQgPSAwO1xuICAgICAgdGltZS5sYXN0ID0gYW5pbS5lbmRlZCA/IDAgOiBhbmltLmN1cnJlbnRUaW1lO1xuICAgICAgdmFyIHMgPSBhbmltLnNldHRpbmdzO1xuICAgICAgaWYgKHMuZGlyZWN0aW9uID09PSAncmV2ZXJzZScpIHJldmVyc2VUd2VlbnMoYW5pbSk7XG4gICAgICBpZiAocy5kaXJlY3Rpb24gPT09ICdhbHRlcm5hdGUnICYmICFzLmxvb3ApIHMubG9vcCA9IDE7XG4gICAgICBzZXRXaWxsQ2hhbmdlKGFuaW0pO1xuICAgICAgYW5pbWF0aW9ucy5wdXNoKGFuaW0pO1xuICAgICAgaWYgKCFyYWYpIGVuZ2luZSgpO1xuICAgIH1cblxuICAgIGFuaW0ucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGFuaW0ucmV2ZXJzZWQpIHJldmVyc2VUd2VlbnMoYW5pbSk7XG4gICAgICBhbmltLnBhdXNlKCk7XG4gICAgICBhbmltLnNlZWsoMCk7XG4gICAgICBhbmltLnBsYXkoKTtcbiAgICB9XG5cbiAgICBpZiAoYW5pbS5zZXR0aW5ncy5hdXRvcGxheSkgYW5pbS5wbGF5KCk7XG5cbiAgICByZXR1cm4gYW5pbTtcblxuICB9XG5cbiAgLy8gUmVtb3ZlIG9uZSBvciBtdWx0aXBsZSB0YXJnZXRzIGZyb20gYWxsIGFjdGl2ZSBhbmltYXRpb25zLlxuXG4gIHZhciByZW1vdmUgPSBmdW5jdGlvbihlbGVtZW50cykge1xuICAgIHZhciB0YXJnZXRzID0gZmxhdHRlbkFycmF5KGlzLmFycihlbGVtZW50cykgPyBlbGVtZW50cy5tYXAodG9BcnJheSkgOiB0b0FycmF5KGVsZW1lbnRzKSk7XG4gICAgZm9yICh2YXIgaSA9IGFuaW1hdGlvbnMubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgYW5pbWF0aW9uID0gYW5pbWF0aW9uc1tpXTtcbiAgICAgIHZhciB0d2VlbnMgPSBhbmltYXRpb24udHdlZW5zO1xuICAgICAgZm9yICh2YXIgdCA9IHR3ZWVucy5sZW5ndGgtMTsgdCA+PSAwOyB0LS0pIHtcbiAgICAgICAgdmFyIGFuaW1hdGFibGVzID0gdHdlZW5zW3RdLmFuaW1hdGFibGVzO1xuICAgICAgICBmb3IgKHZhciBhID0gYW5pbWF0YWJsZXMubGVuZ3RoLTE7IGEgPj0gMDsgYS0tKSB7XG4gICAgICAgICAgaWYgKGFycmF5Q29udGFpbnModGFyZ2V0cywgYW5pbWF0YWJsZXNbYV0udGFyZ2V0KSkge1xuICAgICAgICAgICAgYW5pbWF0YWJsZXMuc3BsaWNlKGEsIDEpO1xuICAgICAgICAgICAgaWYgKCFhbmltYXRhYmxlcy5sZW5ndGgpIHR3ZWVucy5zcGxpY2UodCwgMSk7XG4gICAgICAgICAgICBpZiAoIXR3ZWVucy5sZW5ndGgpIGFuaW1hdGlvbi5wYXVzZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFuaW1hdGlvbi52ZXJzaW9uID0gdmVyc2lvbjtcbiAgYW5pbWF0aW9uLnNwZWVkID0gMTtcbiAgYW5pbWF0aW9uLmxpc3QgPSBhbmltYXRpb25zO1xuICBhbmltYXRpb24ucmVtb3ZlID0gcmVtb3ZlO1xuICBhbmltYXRpb24uZWFzaW5ncyA9IGVhc2luZ3M7XG4gIGFuaW1hdGlvbi5nZXRWYWx1ZSA9IGdldEluaXRpYWxUYXJnZXRWYWx1ZTtcbiAgYW5pbWF0aW9uLnBhdGggPSBnZXRQYXRoUHJvcHM7XG4gIGFuaW1hdGlvbi5yYW5kb20gPSByYW5kb207XG5cbiAgcmV0dXJuIGFuaW1hdGlvbjtcblxufSkpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FuaW1lanMvYW5pbWUuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyogYWZyYW1lLXNlbGVjdC1iYXIgY29tcG9uZW50IC0tIGF0dGVtcHQgdG8gcHVsbCBvdXQgc2VsZWN0IGJhciBjb2RlIGZyb20gY2l0eSBidWlsZGVyIGxvZ2ljICovXHJcblxyXG4vKiBmb3IgdGVzdGluZyBpbiBjb25zb2xlOlxyXG5tZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lbnVcIik7XHJcbm1lbnVFbC5lbWl0KFwib25PcHRpb25OZXh0XCIpO1xyXG5tZW51RWwuZW1pdChcIm9uT3B0aW9uUHJldmlvdXNcIik7XHJcbiovXHJcblxyXG4vLyBOT1RFUzpcclxuLy8gYXQgbGVhc3Qgb25lIG9wdGdyb3VwIHJlcXVpcmVkLCBhdCBsZWFzeSA3IG9wdGlvbnMgcmVxdWlyZWQgcGVyIG9wdGdyb3VwXHJcbi8vIDUgb3IgNiBvcHRpb25zIHBlciBvcHRncm91cCBtYXkgd29yaywgbmVlZHMgdGVzdGluZ1xyXG4vLyA0IGFuZCBiZWxvdyBzaG91bGQgYmUgbm8gc2Nyb2xsXHJcblxyXG5cclxuaWYgKHR5cGVvZiBBRlJBTUUgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgYXR0ZW1wdGVkIHRvIHJlZ2lzdGVyIGJlZm9yZSBBRlJBTUUgd2FzIGF2YWlsYWJsZS4nKTtcclxufVxyXG5cclxuLy8gSEVMUEVSIEZVTkNUSU9OU1xyXG4vLyBmaW5kIGFuIGVsZW1lbnQncyBvcmlnaW5hbCBpbmRleCBwb3NpdGlvbiBpbiBhbiBhcnJheSBieSBzZWFyY2hpbmcgb24gYW4gZWxlbWVudCdzIHZhbHVlIGluIHRoZSBhcnJheVxyXG5mdW5jdGlvbiBmaW5kV2l0aEF0dHIoYXJyYXksIGF0dHIsIHZhbHVlKSB7ICAvLyBmaW5kIGFcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZihhcnJheVtpXVthdHRyXSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIC0xO1xyXG59XHJcblxyXG4vLyBmb3IgYSBnaXZlbiBhcnJheSwgZmluZCB0aGUgbGFyZ2VzdCB2YWx1ZSBhbmQgcmV0dXJuIHRoZSB2YWx1ZSBvZiB0aGUgaW5kZXggdGhlcmVvZiAoMC1iYXNlZCBpbmRleClcclxuZnVuY3Rpb24gaW5kZXhPZk1heChhcnIpIHtcclxuICAgIGlmIChhcnIubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG4gICAgdmFyIG1heCA9IGFyclswXTtcclxuICAgIHZhciBtYXhJbmRleCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChhcnJbaV0gPiBtYXgpIHtcclxuICAgICAgICAgICAgbWF4SW5kZXggPSBpO1xyXG4gICAgICAgICAgICBtYXggPSBhcnJbaV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1heEluZGV4O1xyXG59XHJcblxyXG4vLyBwcm92aWRlIGEgdmFsaWQgSW5kZXggZm9yIGFuIEFycmF5IGlmIHRoZSBkZXNpcmVkSW5kZXggaXMgZ3JlYXRlciBvciBsZXNzIHRoYW4gYW4gYXJyYXkncyBsZW5ndGggYnkgXCJsb29waW5nXCIgYXJvdW5kXHJcbmZ1bmN0aW9uIGxvb3BJbmRleChkZXNpcmVkSW5kZXgsIGFycmF5TGVuZ3RoKSB7ICAgLy8gZXhwZWN0cyBhIDAgYmFzZWQgaW5kZXhcclxuICBpZiAoZGVzaXJlZEluZGV4ID4gKGFycmF5TGVuZ3RoIC0gMSkpIHtcclxuICAgIHJldHVybiBkZXNpcmVkSW5kZXggLSBhcnJheUxlbmd0aDtcclxuICB9XHJcbiAgaWYgKGRlc2lyZWRJbmRleCA8IDApIHtcclxuICAgIHJldHVybiBhcnJheUxlbmd0aCArIGRlc2lyZWRJbmRleDtcclxuICB9XHJcbiAgcmV0dXJuIGRlc2lyZWRJbmRleDtcclxufVxyXG4vLyBHaGV0dG8gdGVzdGluZyBvZiBsb29wSW5kZXggaGVscGVyIGZ1bmN0aW9uXHJcbmZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIG1lc3NhZ2UpIHtcclxuLy8gICAgY29uc29sZS5sb2coY29uZGl0aW9uLnN0cmluZ2lmeSk7XHJcbiAgICBpZiAoIWNvbmRpdGlvbikge1xyXG4gICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlIHx8IFwiQXNzZXJ0aW9uIGZhaWxlZFwiO1xyXG4gICAgICAgIGlmICh0eXBlb2YgRXJyb3IgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBtZXNzYWdlOyAvLyBGYWxsYmFja1xyXG4gICAgfVxyXG59XHJcbnZhciB0ZXN0TG9vcEFycmF5ID0gWzAsMSwyLDMsNCw1LDYsNyw4LDldO1xyXG5hc3NlcnQobG9vcEluZGV4KDksIHRlc3RMb29wQXJyYXkubGVuZ3RoKSA9PSA5KTtcclxuYXNzZXJ0KGxvb3BJbmRleCgxMCwgdGVzdExvb3BBcnJheS5sZW5ndGgpID09IDApO1xyXG5hc3NlcnQobG9vcEluZGV4KDExLCB0ZXN0TG9vcEFycmF5Lmxlbmd0aCkgPT0gMSk7XHJcbmFzc2VydChsb29wSW5kZXgoMCwgdGVzdExvb3BBcnJheS5sZW5ndGgpID09IDApO1xyXG5hc3NlcnQobG9vcEluZGV4KC0xLCB0ZXN0TG9vcEFycmF5Lmxlbmd0aCkgPT0gOSk7XHJcbmFzc2VydChsb29wSW5kZXgoLTIsIHRlc3RMb29wQXJyYXkubGVuZ3RoKSA9PSA4KTtcclxuXHJcbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnc2VsZWN0LWJhcicsIHtcclxuICBzY2hlbWE6IHtcclxuICAgIGNvbnRyb2xzOiB7dHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OiB0cnVlfSxcclxuICAgIGNvbnRyb2xsZXJJRDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0OiAncmlnaHRDb250cm9sbGVyJ30sXHJcbiAgICBzZWxlY3RlZE9wdGdyb3VwVmFsdWU6IHt0eXBlOiAnc3RyaW5nJ30sICAgICAgICAgICAgLy8gbm90IGludGVuZGVkIHRvIGJlIHNldCB3aGVuIGRlZmluaW5nIGNvbXBvbmVudCwgdXNlZCBmb3IgdHJhY2tpbmcgc3RhdGVcclxuICAgIHNlbGVjdGVkT3B0Z3JvdXBJbmRleDoge3R5cGU6ICdpbnQnLCBkZWZhdWx0OiAwfSwgICAvLyBub3QgaW50ZW5kZWQgdG8gYmUgc2V0IHdoZW4gZGVmaW5pbmcgY29tcG9uZW50LCB1c2VkIGZvciB0cmFja2luZyBzdGF0ZVxyXG4gICAgc2VsZWN0ZWRPcHRpb25WYWx1ZToge3R5cGU6ICdzdHJpbmcnfSwgICAgICAgICAgICAgIC8vIG5vdCBpbnRlbmRlZCB0byBiZSBzZXQgd2hlbiBkZWZpbmluZyBjb21wb25lbnQsIHVzZWQgZm9yIHRyYWNraW5nIHN0YXRlXHJcbiAgICBzZWxlY3RlZE9wdGlvbkluZGV4OiB7dHlwZTogJ2ludCcsIGRlZmF1bHQ6IDB9ICAgICAgLy8gbm90IGludGVuZGVkIHRvIGJlIHNldCB3aGVuIGRlZmluaW5nIGNvbXBvbmVudCwgdXNlZCBmb3IgdHJhY2tpbmcgc3RhdGVcclxuICB9LFxyXG5cclxuICAvLyBmb3IgYSBnaXZlbiBvcHRncm91cCwgbWFrZSB0aGUgY2hpbGRyZW5cclxuICBtYWtlU2VsZWN0T3B0aW9uc1JvdzogZnVuY3Rpb24oc2VsZWN0ZWRPcHRncm91cEVsLCBwYXJlbnRFbCwgaW5kZXgsIG9mZnNldFksIGlkUHJlZml4KSB7XHJcblxyXG4gICAgLy8gbWFrZSB0aGUgb3B0Z3JvdXAgbGFiZWxcclxuICAgIHZhciBvcHRncm91cExhYmVsRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYS1lbnRpdHlcIik7XHJcbiAgICBjb25zb2xlLmxvZyhpZFByZWZpeCk7XHJcbiAgICBjb25zb2xlLmxvZyhcInRoaXMuYXR0ck5hbWVcIiArIHRoaXMuYXR0ck5hbWUpO1xyXG4gICAgY29uc29sZS5sb2coXCJ0aGlzLmlkXCIgKyB0aGlzLmlkKTtcclxuXHJcbiAgICBvcHRncm91cExhYmVsRWwuaWQgPSBpZFByZWZpeCArIFwib3B0Z3JvdXBMYWJlbFwiICsgaW5kZXg7XHJcbiAgICBvcHRncm91cExhYmVsRWwuc2V0QXR0cmlidXRlKFwicG9zaXRpb25cIiwgXCIwLjA3IFwiICsgKDAuMDQ1ICsgb2Zmc2V0WSkgKyBcIiAtMC4wMDNcIik7XHJcbiAgICBvcHRncm91cExhYmVsRWwuc2V0QXR0cmlidXRlKFwic2NhbGVcIiwgXCIwLjUgMC41IDAuNVwiKTtcclxuICAgIG9wdGdyb3VwTGFiZWxFbC5zZXRBdHRyaWJ1dGUoXCJ0ZXh0XCIsIFwidmFsdWVcIiwgc2VsZWN0ZWRPcHRncm91cEVsLmdldEF0dHJpYnV0ZSgnbGFiZWwnKSk7XHJcbiAgICBvcHRncm91cExhYmVsRWwuc2V0QXR0cmlidXRlKFwidGV4dFwiLCBcImNvbG9yXCIsIFwiIzc0NzQ3NFwiKTtcclxuICAgIHBhcmVudEVsLmFwcGVuZENoaWxkKG9wdGdyb3VwTGFiZWxFbCk7XHJcblxyXG4gICAgLy8gZ2V0IHRoZSBvcHRpb25zIGF2YWlsYWJsZSBmb3IgdGhpcyBvcHRncm91cCByb3dcclxuICAgIHZhciBvcHRpb25zRWxlbWVudHMgPSBzZWxlY3RlZE9wdGdyb3VwRWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRpb25cIik7ICAvLyB0aGUgYWN0dWFsIEpTIGNoaWxkcmVuIGVsZW1lbnRzXHJcblxyXG4gICAgLy8gY29udmVydCB0aGUgTm9kZUxpc3Qgb2YgbWF0Y2hpbmcgb3B0aW9uIGVsZW1lbnRzIGludG8gYSBKYXZhc2NyaXB0IEFycmF5XHJcbiAgICB2YXIgb3B0aW9uc0VsZW1lbnRzQXJyYXkgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChvcHRpb25zRWxlbWVudHMpO1xyXG5cclxuICAgIHZhciBmaXJzdEFycmF5ID0gb3B0aW9uc0VsZW1lbnRzQXJyYXkuc2xpY2UoMCw0KTsgLy8gZ2V0IGl0ZW1zIDAgLSA0XHJcbiAgICB2YXIgcHJldmlld0FycmF5ID0gb3B0aW9uc0VsZW1lbnRzQXJyYXkuc2xpY2UoLTMpOyAvLyBnZXQgdGhlIDMgTEFTVCBpdGVtcyBvZiB0aGUgYXJyYXlcclxuXHJcbiAgICAvLyBDb21iaW5lIGludG8gXCJtZW51QXJyYXlcIiwgYSBsaXN0IG9mIGN1cnJlbnRseSB2aXNpYmxlIG9wdGlvbnMgd2hlcmUgdGhlIG1pZGRsZSBpbmRleCBpcyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9iamVjdFxyXG4gICAgdmFyIG1lbnVBcnJheSA9IHByZXZpZXdBcnJheS5jb25jYXQoZmlyc3RBcnJheSk7XHJcblxyXG4gICAgdmFyIHNlbGVjdE9wdGlvbnNIVE1MID0gXCJcIjtcclxuICAgIHZhciBzdGFydFBvc2l0aW9uWCA9IC0wLjIyNTtcclxuICAgIHZhciBkZWx0YVggPSAwLjA3NTtcclxuXHJcbiAgICAvLyBGb3IgZWFjaCBtZW51IG9wdGlvbiwgY3JlYXRlIGEgcHJldmlldyBlbGVtZW50IGFuZCBpdHMgYXBwcm9wcmlhdGUgY2hpbGRyZW5cclxuICAgIG1lbnVBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50LCBtZW51QXJyYXlJbmRleCkge1xyXG4gICAgICB2YXIgdmlzaWJsZSA9IChtZW51QXJyYXlJbmRleCA9PT0gMCB8fCBtZW51QXJyYXlJbmRleCA9PT0gNikgPyAoZmFsc2UpIDogKHRydWUpO1xyXG4gICAgICB2YXIgc2VsZWN0ZWQgPSAobWVudUFycmF5SW5kZXggPT09IDMpO1xyXG4gICAgICAvLyBpbmRleCBvZiB0aGUgb3B0aW9uc0VsZW1lbnRzQXJyYXkgd2hlcmUgb3B0aW9uc0VsZW1lbnRzQXJyYXkuZWxlbWVudC5nZXRhdHRyaWJ1dGUoXCJ2YWx1ZVwiKSA9IGVsZW1lbnQuZ2V0YXR0cmlidXRlKFwidmFsdWVcIilcclxuICAgICAgdmFyIG9yaWdpbmFsT3B0aW9uc0FycmF5SW5kZXggPSBmaW5kV2l0aEF0dHIob3B0aW9uc0VsZW1lbnRzQXJyYXksIFwidmFsdWVcIiwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKSk7XHJcbiAgICAgIHNlbGVjdE9wdGlvbnNIVE1MICs9IGBcclxuICAgICAgPGEtZW50aXR5IGlkPVwiJHtpZFByZWZpeH0ke29yaWdpbmFsT3B0aW9uc0FycmF5SW5kZXh9XCIgdmlzaWJsZT1cIiR7dmlzaWJsZX1cIiBjbGFzcz1cInByZXZpZXckeyAoc2VsZWN0ZWQpID8gXCIgc2VsZWN0ZWRcIiA6IFwiXCJ9XCIgb3B0aW9uaWQ9XCIke29yaWdpbmFsT3B0aW9uc0FycmF5SW5kZXh9XCIgdmFsdWU9XCIke2VsZW1lbnQuZ2V0QXR0cmlidXRlKFwidmFsdWVcIil9XCIgb3B0Z3JvdXA9XCIke3NlbGVjdGVkT3B0Z3JvdXBFbC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKX1cIiBwb3NpdGlvbj1cIiR7c3RhcnRQb3NpdGlvblh9ICR7b2Zmc2V0WX0gMFwiPlxyXG4gICAgICAgIDxhLWJveCBjbGFzcz1cInByZXZpZXdGcmFtZVwiIHBvc2l0aW9uPVwiMCAwIC0wLjAwM1wiIHNjYWxlPVwiMC4wNiAwLjA2IDAuMDA1XCIgbWF0ZXJpYWw9XCJjb2xvcjogJHsoc2VsZWN0ZWQpID8gKFwieWVsbG93XCIpIDogKFwiIzIyMjIyMlwiKX1cIj48L2EtYm94PlxyXG4gICAgICAgIDxhLWltYWdlIGNsYXNzPVwicHJldmlld0ltYWdlXCIgc2NhbGU9XCIwLjA1IDAuMDUgMC4wNVwiIHNyYz1cIiR7ZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJzcmNcIil9XCIgPjwvYS1pbWFnZT5cclxuICAgICAgICA8YS1lbnRpdHkgY2xhc3M9XCJvYmplY3ROYW1lXCIgcG9zaXRpb249XCIwLjA2NSAtMC4wNCAtMC4wMDNcIiBzY2FsZT1cIjAuMTggMC4xOCAwLjE4XCIgdGV4dD1cInZhbHVlOiAke2VsZW1lbnQudGV4dH07IGNvbG9yOiAkeyhzZWxlY3RlZCkgPyAoXCJ5ZWxsb3dcIikgOiAoXCIjNzQ3NDc0XCIpfVwiPjwvYS1lbnRpdHk+XHJcbiAgICAgIDwvYS1lbnRpdHk+YFxyXG4gICAgICBzdGFydFBvc2l0aW9uWCArPSBkZWx0YVg7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBcHBlbmQgdGhlc2UgbWVudSBvcHRpb25zIHRvIGEgbmV3IGVsZW1lbnQgd2l0aCBpZCBvZiBcInNlbGVjdE9wdGlvbnNSb3dcIlxyXG4gICAgdmFyIHNlbGVjdE9wdGlvbnNSb3dFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhLWVudGl0eVwiKTtcclxuICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5pZCA9IGlkUHJlZml4ICsgXCJzZWxlY3RPcHRpb25zUm93XCIgKyBpbmRleDtcclxuICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5pbm5lckhUTUwgPSBzZWxlY3RPcHRpb25zSFRNTDtcclxuICAgIHBhcmVudEVsLmFwcGVuZENoaWxkKHNlbGVjdE9wdGlvbnNSb3dFbCk7XHJcblxyXG4gIH0sXHJcblxyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIENyZWF0ZSBzZWxlY3QgYmFyIG1lbnUgZnJvbSBodG1sIGNoaWxkIGBvcHRpb25gIGVsZW1lbnRzIGJlbmVhdGggcGFyZW50IGVudGl0eSBpbnNwaXJlZCBieSB0aGUgaHRtbDUgc3BlYzogaHR0cDovL3d3dy53M3NjaG9vbHMuY29tL3RhZ3MvdGFnX29wdGdyb3VwLmFzcFxyXG4gICAgdmFyIHNlbGVjdEVsID0gdGhpcy5lbDsgIC8vIFJlZmVyZW5jZSB0byB0aGUgY29tcG9uZW50J3MgZWxlbWVudC5cclxuICAgIHRoaXMuZGF0YS5sYXN0VGltZSA9IG5ldyBEYXRlKCk7XHJcblxyXG4gICAgLy8gd2Ugd2FudCBhIGNvbnNpc3RlbnQgcHJlZml4IHdoZW4gY3JlYXRpbmcgSURzXHJcbiAgICAvLyBpZiB0aGUgcGFyZW50IGhhcyBhbiBpZCwgdXNlIHRoYXQ7IG90aGVyd2lzZSwgdXNlIHRoZSBzdHJpbmcgXCJtZW51XCJcclxuICAgIHRoaXMuaWRQcmVmaXggPSBzZWxlY3RFbC5pZCA/IHNlbGVjdEVsLmlkIDogXCJtZW51XCI7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBcImZyYW1lXCIgb2YgdGhlIHNlbGVjdCBtZW51IGJhclxyXG4gICAgdmFyIHNlbGVjdFJlbmRlckVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImEtZW50aXR5XCIpO1xyXG4gICAgc2VsZWN0UmVuZGVyRWwuaWQgPSB0aGlzLmlkUHJlZml4ICsgXCJzZWxlY3RSZW5kZXJcIjtcclxuICAgIHNlbGVjdFJlbmRlckVsLmlubmVySFRNTCA9IGBcclxuICAgICAgPGEtYm94IGlkPVwiJHt0aGlzLmlkUHJlZml4fUZyYW1lXCIgc2NhbGU9XCIwLjQgMC4xNSAwLjAwNVwiIHBvc2l0aW9uPVwiMCAwIC0wLjAwNzVcIiAgbWF0ZXJpYWw9XCJvcGFjaXR5OiAwLjU7IHRyYW5zcGFyZW50OiB0cnVlOyBjb2xvcjogIzAwMDAwMFwiPjwvYS1ib3g+XHJcbiAgICAgIDxhLWVudGl0eSBpZD1cIiR7dGhpcy5pZFByZWZpeH1hcnJvd1JpZ2h0XCIgcG9zaXRpb249XCIwLjIyNSAwIDBcIiByb3RhdGlvbj1cIjkwIDE4MCAwXCIgc2NhbGU9XCItMC4wMDQgMC4wMDIgMC4wMDRcIiBvYmotbW9kZWw9XCJvYmo6I2Vudl9hcnJvd1wiIG1hdGVyaWFsPVwib3BhY2l0eTogMC41OyB0cmFuc3BhcmVudDogdHJ1ZTsgY29sb3I6ICMwMDAwMDBcIj48L2EtZW50aXR5PlxyXG4gICAgICA8YS1lbnRpdHkgaWQ9XCIke3RoaXMuaWRQcmVmaXh9YXJyb3dMZWZ0XCIgcG9zaXRpb249XCItMC4yMjUgMCAwXCIgcm90YXRpb249XCI5MCAxODAgMFwiIHNjYWxlPVwiMC4wMDQgMC4wMDIgMC4wMDRcIiBvYmotbW9kZWw9XCJvYmo6I2Vudl9hcnJvd1wiIG1hdGVyaWFsPVwib3BhY2l0eTowLjU7IHRyYW5zcGFyZW50OnRydWU7IGNvbG9yOiMwMDAwMDBcIj48L2EtZW50aXR5PlxyXG4gICAgICA8YS1lbnRpdHkgaWQ9XCIke3RoaXMuaWRQcmVmaXh9YXJyb3dVcFwiIHBvc2l0aW9uPVwiMCAwLjEgMFwiIHJvdGF0aW9uPVwiMCAyNzAgOTBcIiBzY2FsZT1cIjAuMDA0IDAuMDAyIDAuMDA0XCIgb2JqLW1vZGVsPVwib2JqOiNlbnZfYXJyb3dcIiBtYXRlcmlhbD1cIm9wYWNpdHk6IDAuNTsgdHJhbnNwYXJlbnQ6IHRydWU7IGNvbG9yOiAjMDAwMDAwXCI+PC9hLWVudGl0eT5cclxuICAgICAgPGEtZW50aXR5IGlkPVwiJHt0aGlzLmlkUHJlZml4fWFycm93RG93blwiIHBvc2l0aW9uPVwiMCAtMC4xIDBcIiByb3RhdGlvbj1cIjAgMjcwIDkwXCIgc2NhbGU9XCItMC4wMDQgMC4wMDIgMC4wMDRcIiBvYmotbW9kZWw9XCJvYmo6I2Vudl9hcnJvd1wiIG1hdGVyaWFsPVwib3BhY2l0eTogMC41OyB0cmFuc3BhcmVudDogdHJ1ZTsgY29sb3I6ICMwMDAwMDBcIj48L2EtZW50aXR5PlxyXG4gICAgICBgO1xyXG4gICAgc2VsZWN0RWwuYXBwZW5kQ2hpbGQoc2VsZWN0UmVuZGVyRWwpO1xyXG5cclxuICAgIHZhciBvcHRncm91cHMgPSBzZWxlY3RFbC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm9wdGdyb3VwXCIpOyAgLy8gR2V0IHRoZSBvcHRncm91cHNcclxuICAgIHZhciBzZWxlY3RlZE9wdGdyb3VwRWwgPSBvcHRncm91cHNbdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleF07ICAvLyBmZXRjaCB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9wdGdyb3VwXHJcbiAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cFZhbHVlID0gc2VsZWN0ZWRPcHRncm91cEVsLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpOyAvLyBzZXQgY29tcG9uZW50IHByb3BlcnR5IHRvIG9wZ3JvdXAgdmFsdWVcclxuXHJcbiAgICAvLyB0aGlzLmlkUHJlZml4XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLmlkUHJlZml4KTtcclxuICAgIGNvbnNvbGUubG9nKFwidGhpcy5hdHRyTmFtZTogXCIgKyB0aGlzLmF0dHJOYW1lKTtcclxuICAgIGNvbnNvbGUubG9nKFwidGhpcy5pZDogXCIgKyB0aGlzLmlkKTtcclxuXHJcbiAgICB0aGlzLm1ha2VTZWxlY3RPcHRpb25zUm93KHNlbGVjdGVkT3B0Z3JvdXBFbCwgc2VsZWN0UmVuZGVyRWwsIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXgsIDAsIHRoaXMuaWRQcmVmaXgpO1xyXG5cclxuICB9LFxyXG5cclxuXHJcbiAgcmVtb3ZlU2VsZWN0T3B0aW9uc1JvdzogZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICAvLyBmaW5kIHRoZSBhcHByb3ByaWF0ZSBzZWxlY3Qgb3B0aW9ucyByb3dcclxuICAgIHZhciBzZWxlY3RPcHRpb25zUm93RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkUHJlZml4ICsgXCJzZWxlY3RPcHRpb25zUm93XCIgKyBpbmRleCk7XHJcbiAgICB2YXIgb3B0Z3JvdXBMYWJlbEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZFByZWZpeCArIFwib3B0Z3JvdXBMYWJlbFwiICsgaW5kZXgpO1xyXG5cclxuLy8gICAgY29uc29sZS5sb2coXCJ0cnkgdG8gcmVtb3ZlIGNoaWxkcmVuXCIpO1xyXG4gICAgLy8gZGVsZXRlIGFsbCBjaGlsZHJlbiBvZiBzZWxlY3RPcHRpb25zUm93RWxcclxuICAgIHdoaWxlIChzZWxlY3RPcHRpb25zUm93RWwuZmlyc3RDaGlsZCkge1xyXG4gICAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5yZW1vdmVDaGlsZChzZWxlY3RPcHRpb25zUm93RWwuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbi8vICAgIGNvbnNvbGUubG9nKFwiY2hpbGRyZW4gcmVtb3ZlZFwiKTtcclxuXHJcbiAgICAvLyBkZWxldGUgc2VsZWN0T3B0aW9uc1Jvd0VsIGFuZCBvcHRncm91cExhYmVsRWxcclxuICAgIG9wdGdyb3VwTGFiZWxFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG9wdGdyb3VwTGFiZWxFbCk7XHJcbiAgICBzZWxlY3RPcHRpb25zUm93RWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzZWxlY3RPcHRpb25zUm93RWwpO1xyXG4gIH0sXHJcblxyXG5cclxuICBhZGRFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gSWYgY29udHJvbHMgPSB0cnVlIGFuZCBhIGNvbnRyb2xsZXJJRCBoYXMgYmVlbiBwcm92aWRlZCwgdGhlbiBhZGQgY29udHJvbGxlciBldmVudCBsaXN0ZW5lcnNcclxuICAgIGlmICh0aGlzLmRhdGEuY29udHJvbHMgJiYgdGhpcy5kYXRhLmNvbnRyb2xsZXJJRCkge1xyXG4gICAgICB2YXIgY29udHJvbGxlckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLmNvbnRyb2xsZXJJRCk7XHJcbiAgICAgIGNvbnRyb2xsZXJFbC5hZGRFdmVudExpc3RlbmVyKCd0cmFja3BhZGRvd24nLCB0aGlzLm9uVHJhY2twYWREb3duLmJpbmQodGhpcykpO1xyXG4gICAgICBjb250cm9sbGVyRWwuYWRkRXZlbnRMaXN0ZW5lcignYXhpc21vdmUnLCB0aGlzLm9uQXhpc01vdmUuYmluZCh0aGlzKSk7XHJcbiAgICAgIGNvbnRyb2xsZXJFbC5hZGRFdmVudExpc3RlbmVyKCd0cmlnZ2VyZG93bicsIHRoaXMub25UcmlnZ2VyRG93bi5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignb25Ib3ZlckxlZnQnLCB0aGlzLm9uSG92ZXJMZWZ0LmJpbmQodGhpcykpO1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignb25Ib3ZlclJpZ2h0JywgdGhpcy5vbkhvdmVyUmlnaHQuYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdvbk9wdGlvblN3aXRjaCcsIHRoaXMub25PcHRpb25Td2l0Y2guYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdvbk9wdGlvbk5leHQnLCB0aGlzLm9uT3B0aW9uTmV4dC5iaW5kKHRoaXMpKTtcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ29uT3B0aW9uUHJldmlvdXMnLCB0aGlzLm9uT3B0aW9uUHJldmlvdXMuYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdvbk9wdGdyb3VwTmV4dCcsIHRoaXMub25PcHRncm91cE5leHQuYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdvbk9wdGdyb3VwUHJldmlvdXMnLCB0aGlzLm9uT3B0Z3JvdXBQcmV2aW91cy5iaW5kKHRoaXMpKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxyXG4gICAqL1xyXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5kYXRhLmNvbnRyb2xzICYmIHRoaXMuZGF0YS5jb250cm9sbGVySUQpIHtcclxuICAgICAgdmFyIGNvbnRyb2xsZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5jb250cm9sbGVySUQpO1xyXG4gICAgICBjb250cm9sbGVyRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhY2twYWRkb3duJywgdGhpcy5vblRyYWNrcGFkRG93bik7XHJcbiAgICAgIGNvbnRyb2xsZXJFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdheGlzbW92ZScsIHRoaXMub25BeGlzTW92ZSk7XHJcbiAgICAgIGNvbnRyb2xsZXJFbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmlnZ2VyZG93bicsIHRoaXMub25UcmlnZ2VyRG93bik7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGVsID0gdGhpcy5lbDtcclxuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ29uT3B0aW9uU3dpdGNoJywgdGhpcy5vbk9wdGlvblN3aXRjaCk7XHJcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdvbkhvdmVyUmlnaHQnLCB0aGlzLm9uSG92ZXJSaWdodCk7XHJcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdvbkhvdmVyTGVmdCcsIHRoaXMub25Ib3ZlckxlZnQpO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignb25PcHRpb25OZXh0JywgdGhpcy5vbk9wdGlvbk5leHQpO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignb25PcHRpb25QcmV2aW91cycsIHRoaXMub25PcHRpb25QcmV2aW91cyk7XHJcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdvbk9wdGdyb3VwTmV4dCcsIHRoaXMub25PcHRncm91cE5leHQpO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignb25PcHRncm91cFByZXZpb3VzJywgdGhpcy5vbk9wdGdyb3VwUHJldmlvdXMpO1xyXG5cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBlbnRpdHkgcmVzdW1lcy5cclxuICAgKiBVc2UgdG8gY29udGludWUgb3IgYWRkIGFueSBkeW5hbWljIG9yIGJhY2tncm91bmQgYmVoYXZpb3Igc3VjaCBhcyBldmVudHMuXHJcbiAgICovXHJcbiAgcGxheTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGVudGl0eSBwYXVzZXMuXHJcbiAgICogVXNlIHRvIHN0b3Agb3IgcmVtb3ZlIGFueSBkeW5hbWljIG9yIGJhY2tncm91bmQgYmVoYXZpb3Igc3VjaCBhcyBldmVudHMuXHJcbiAgICovXHJcbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGNvbXBvbmVudCBpcyByZW1vdmVkIChlLmcuLCB2aWEgcmVtb3ZlQXR0cmlidXRlKS5cclxuICAgKiBHZW5lcmFsbHkgdW5kb2VzIGFsbCBtb2RpZmljYXRpb25zIHRvIHRoZSBlbnRpdHkuXHJcbiAgICovXHJcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgb25UcmlnZ2VyRG93bjogZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgaWYgKGV2dC50YXJnZXQuaWQgIT0gdGhpcy5kYXRhLmNvbnRyb2xsZXJJRCkgeyAgIC8vbWVudTogb25seSBkZWFsIHdpdGggdHJpZ2dlciBkb3duIGV2ZW50cyBmcm9tIGNvcnJlY3QgY29udHJvbGxlclxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLmVsLmVtaXQoXCJtZW51U2VsZWN0ZWRcIik7XHJcbiAgfSxcclxuXHJcbiAgb25BeGlzTW92ZTogZnVuY3Rpb24gKGV2dCkgeyAgICAgICAvLyBtZW51OiB1c2VkIGZvciBkZXRlcm1pbmluZyBjdXJyZW50IGF4aXMgb2YgdHJhY2twYWQgaG92ZXIgcG9zaXRpb25cclxuICAgIGlmIChldnQudGFyZ2V0LmlkICE9IHRoaXMuZGF0YS5jb250cm9sbGVySUQpIHsgICAvL21lbnU6IG9ubHkgZGVhbCB3aXRoIHRyYWNrcGFkIGV2ZW50cyBmcm9tIGNvcnJlY3QgY29udHJvbGxlclxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gb25seSBydW4gdGhpcyBmdW5jdGlvbiBpZiB0aGVyZSBpcyBzb21lIHZhbHVlIGZvciBhdCBsZWFzdCBvbmUgYXhpc1xyXG4gICAgaWYgKGV2dC5kZXRhaWwuYXhpc1swXSA9PT0gMCAmJiBldnQuZGV0YWlsLmF4aXNbMV0gPT09IDApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBpc09jdWx1cyA9IGZhbHNlO1xyXG4gICAgdmFyIGdhbWVwYWRzID0gbmF2aWdhdG9yLmdldEdhbWVwYWRzKCk7XHJcbiAgICBpZiAoZ2FtZXBhZHMpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lcGFkcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBnYW1lcGFkID0gZ2FtZXBhZHNbaV07XHJcbiAgICAgICAgaWYgKGdhbWVwYWQpIHtcclxuICAgICAgICAgIGlmIChnYW1lcGFkLmlkLmluZGV4T2YoJ09jdWx1cyBUb3VjaCcpID09PSAwKSB7XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coXCJpc09jdWx1c1wiKTtcclxuICAgICAgICAgICAgaXNPY3VsdXMgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuLy8gICAgY29uc29sZS5sb2coXCJheGlzWzBdOiBcIiArIGV2dC5kZXRhaWwuYXhpc1swXSArIFwiIGxlZnQgLTE7IHJpZ2h0ICsxXCIpO1xyXG4vLyAgICBjb25zb2xlLmxvZyhcImF4aXNbMV06IFwiICsgZXZ0LmRldGFpbC5heGlzWzFdICsgXCIgZG93biAtMTsgdXAgKzFcIik7XHJcbi8vICAgIGNvbnNvbGUubG9nKGV2dC50YXJnZXQuaWQpO1xyXG5cclxuICAgIC8vIHdoaWNoIGF4aXMgaGFzIGxhcmdlc3QgYWJzb2x1dGUgdmFsdWU/IHRoZW4gdXNlIHRoYXQgYXhpcyB2YWx1ZSB0byBkZXRlcm1pbmUgaG92ZXIgcG9zaXRpb25cclxuLy8gICAgY29uc29sZS5sb2coZXZ0LmRldGFpbC5heGlzWzBdKTtcclxuICAgIGlmIChNYXRoLmFicyhldnQuZGV0YWlsLmF4aXNbMF0pID4gTWF0aC5hYnMoZXZ0LmRldGFpbC5heGlzWzFdKSkgeyAvLyBpZiB4IGF4aXMgYWJzb2x1dGUgdmFsdWUgKGxlZnQvcmlnaHQpIGlzIGdyZWF0ZXIgdGhhbiB5IGF4aXMgKGRvd24vdXApXHJcbiAgICAgIGlmIChldnQuZGV0YWlsLmF4aXNbMF0gPiAwKSB7IC8vIGlmIHRoZSByaWdodCBheGlzIGlzIGdyZWF0ZXIgdGhhbiAwIChtaWRwb2ludClcclxuICAgICAgICB0aGlzLm9uSG92ZXJSaWdodCgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMub25Ib3ZlckxlZnQoKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIGlmIChpc09jdWx1cykge1xyXG4gICAgICAgIHZhciB5QXhpcyA9IC1ldnQuZGV0YWlsLmF4aXNbMV07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIHlBeGlzID0gZXZ0LmRldGFpbC5heGlzWzFdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoeUF4aXMgPiAwKSB7IC8vIGlmIHRoZSB1cCBheGlzIGlzIGdyZWF0ZXIgdGhhbiAwIChtaWRwb2ludClcclxuICAgICAgICB0aGlzLm9uSG92ZXJVcCgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMub25Ib3ZlckRvd24oKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIHVzaW5nIHRoZSBvY3VsdXMgdG91Y2ggY29udHJvbHMsIGFuZCB0aHVtYnN0aWNrIGlzID44NSUgaW4gYW55IGRpcmVjdGlvbiB0aGVuIGZpcmUgb250cmFja3BhZGRvd25cclxuICAgIHZhciBnYW1lcGFkcyA9IG5hdmlnYXRvci5nZXRHYW1lcGFkcygpO1xyXG4gICAgaWYgKGdhbWVwYWRzKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2FtZXBhZHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgZ2FtZXBhZCA9IGdhbWVwYWRzW2ldO1xyXG4gICAgICAgIGlmIChnYW1lcGFkKSB7XHJcbiAgICAgICAgICBpZiAoZ2FtZXBhZC5pZC5pbmRleE9mKCdPY3VsdXMgVG91Y2gnKSA9PT0gMCkge1xyXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoZXZ0LmRldGFpbC5heGlzWzBdKSA+IDAuODUgfHwgTWF0aC5hYnMoZXZ0LmRldGFpbC5heGlzWzFdKSA+IDAuODUpIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gZGVib3VuY2UgKHRocm90dGxlKSBzdWNoIHRoYXQgdGhpcyBvbmx5IHJ1bnMgb25jZSBldmVyeSAxLzIgc2Vjb25kIG1heFxyXG4gICAgICAgICAgICAgIHZhciB0aGlzVGltZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgICAgaWYgKCBNYXRoLmZsb29yKHRoaXNUaW1lIC0gdGhpcy5kYXRhLmxhc3RUaW1lKSA+IDUwMCApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5sYXN0VGltZSA9IHRoaXNUaW1lO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vblRyYWNrcGFkRG93bihldnQpO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG9uSG92ZXJSaWdodDogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5lbC5lbWl0KFwibWVudUhvdmVyUmlnaHRcIik7XHJcbiAgICB2YXIgYXJyb3cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkUHJlZml4ICsgXCJhcnJvd1JpZ2h0XCIpO1xyXG4gICAgdmFyIGN1cnJlbnRBcnJvd0NvbG9yID0gbmV3IFRIUkVFLkNvbG9yKGFycm93LmdldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIpLmNvbG9yKTtcclxuICAgIGlmIChjdXJyZW50QXJyb3dDb2xvci5yID09PSAwKSB7IC8vIGlmIG5vdCBhbHJlYWR5IHNvbWUgc2hhZGUgb2YgeWVsbG93ICh3aGljaCBpbmRpY2F0ZXMgcmVjZW50IGJ1dHRvbiBwcmVzcykgdGhlbiBhbmltYXRlIGdyZWVuIGhvdmVyXHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScpO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwuY29sb3InLCBkdXI6IDUwMCwgZnJvbTogXCIjMDBGRjAwXCIsIHRvOiBcIiMwMDAwMDBcIiB9KTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgb25Ib3ZlckxlZnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZWwuZW1pdChcIm1lbnVIb3ZlckxlZnRcIik7XHJcbiAgICB2YXIgYXJyb3cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkUHJlZml4ICsgXCJhcnJvd0xlZnRcIik7XHJcbiAgICB2YXIgY3VycmVudEFycm93Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoYXJyb3cuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpO1xyXG4gICAgaWYgKGN1cnJlbnRBcnJvd0NvbG9yLnIgPT09IDApIHsgLy8gaWYgbm90IGFscmVhZHkgc29tZSBzaGFkZSBvZiB5ZWxsb3cgKHdoaWNoIGluZGljYXRlcyByZWNlbnQgYnV0dG9uIHByZXNzKSB0aGVuIGFuaW1hdGUgZ3JlZW4gaG92ZXJcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJyk7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5jb2xvcicsIGR1cjogNTAwLCBmcm9tOiBcIiMwMEZGMDBcIiwgdG86IFwiIzAwMDAwMFwiIH0pO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5vcGFjaXR5JywgZHVyOiA1MDAsIGZyb206IFwiMVwiLCB0bzogXCIwLjVcIiB9KTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBvbkhvdmVyRG93bjogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5lbC5lbWl0KFwibWVudUhvdmVyRG93blwiKTtcclxuICAgIHZhciBzZWxlY3RFbCA9IHRoaXMuZWw7XHJcbiAgICB2YXIgb3B0Z3JvdXBzID0gc2VsZWN0RWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRncm91cFwiKTsgIC8vIEdldCB0aGUgb3B0Z3JvdXBzXHJcblxyXG4gICAgY29uc29sZS5sb2codGhpcy5pZFByZWZpeCArIFwiYXJyb3dEb3duXCIpO1xyXG4gICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZFByZWZpeCArIFwiYXJyb3dEb3duXCIpO1xyXG4gICAgdmFyIGN1cnJlbnRBcnJvd0NvbG9yID0gbmV3IFRIUkVFLkNvbG9yKGFycm93LmdldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIpLmNvbG9yKTtcclxuICAgIGlmICggIShjdXJyZW50QXJyb3dDb2xvci5yID4gMCAmJiBjdXJyZW50QXJyb3dDb2xvci5nID4gMCkgKSB7IC8vIGlmIG5vdCBhbHJlYWR5IHNvbWUgc2hhZGUgb2YgeWVsbG93ICh3aGljaCBpbmRpY2F0ZXMgcmVjZW50IGJ1dHRvbiBwcmVzcykgdGhlbiBhbmltYXRlIGdyZWVuIGhvdmVyXHJcbiAgICAgIGlmICh0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4ICsgMiA+IG9wdGdyb3Vwcy5sZW5ndGgpIHtcclxuICAgICAgICAvLyBDQU4nVCBETyAtIEFMUkVBRFkgQVQgRU5EIE9GIExJU1RcclxuICAgICAgICB2YXIgYXJyb3dDb2xvciA9IFwiI0ZGMDAwMFwiO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBhcnJvd0NvbG9yID0gXCIjMDBGRjAwXCI7XHJcbiAgICAgIH1cclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJyk7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5jb2xvcicsIGR1cjogNTAwLCBmcm9tOiBhcnJvd0NvbG9yLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG9uSG92ZXJVcDogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5lbC5lbWl0KFwibWVudUhvdmVyVXBcIik7XHJcbiAgICB2YXIgc2VsZWN0RWwgPSB0aGlzLmVsO1xyXG4gICAgdmFyIG9wdGdyb3VwcyA9IHNlbGVjdEVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwib3B0Z3JvdXBcIik7ICAvLyBHZXQgdGhlIG9wdGdyb3Vwc1xyXG5cclxuICAgIHZhciBhcnJvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWRQcmVmaXggKyBcImFycm93VXBcIik7XHJcbiAgICB2YXIgY3VycmVudEFycm93Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoYXJyb3cuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpO1xyXG4gICAgaWYgKCAhKGN1cnJlbnRBcnJvd0NvbG9yLnIgPiAwICYmIGN1cnJlbnRBcnJvd0NvbG9yLmcgPiAwKSApIHsgLy8gaWYgbm90IGFscmVhZHkgc29tZSBzaGFkZSBvZiB5ZWxsb3cgKHdoaWNoIGluZGljYXRlcyByZWNlbnQgYnV0dG9uIHByZXNzKSB0aGVuIGFuaW1hdGUgZ3JlZW4gaG92ZXJcclxuICAgICAgaWYgKHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXggLSAxIDwgMCkge1xyXG4gICAgICAgICAvLyBDQU4nVCBETyAtIEFMUkVBRFkgQVQgRU5EIE9GIExJU1RcclxuICAgICAgICAgdmFyIGFycm93Q29sb3IgPSBcIiNGRjAwMDBcIjtcclxuICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgIHZhciBhcnJvd0NvbG9yID0gXCIjMDBGRjAwXCI7XHJcbiAgICAgICB9XHJcbiAgICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InKTtcclxuICAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XHJcbiAgICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwuY29sb3InLCBkdXI6IDUwMCwgZnJvbTogYXJyb3dDb2xvciwgdG86IFwiIzAwMDAwMFwiIH0pO1xyXG4gICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgb25PcHRpb25OZXh0OiBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICB0aGlzLm9uT3B0aW9uU3dpdGNoKFwibmV4dFwiKTtcclxuICB9LFxyXG5cclxuICBvbk9wdGlvblByZXZpb3VzOiBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICB0aGlzLm9uT3B0aW9uU3dpdGNoKFwicHJldmlvdXNcIik7XHJcbiAgfSxcclxuXHJcbiAgb25PcHRncm91cE5leHQ6IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgdmFyIHNlbGVjdEVsID0gdGhpcy5lbDtcclxuICAgIHZhciBvcHRncm91cHMgPSBzZWxlY3RFbC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm9wdGdyb3VwXCIpOyAgLy8gR2V0IHRoZSBvcHRncm91cHNcclxuICAgIHZhciBzZWxlY3RSZW5kZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWRQcmVmaXggKyBcInNlbGVjdFJlbmRlclwiKTtcclxuXHJcbiAgICBpZiAodGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCArIDIgPiBvcHRncm91cHMubGVuZ3RoKSB7XHJcbiAgICAgIC8vIENBTidUIERPIFRISVMsIHNob3cgcmVkIGFycm93XHJcbiAgICAgIHZhciBhcnJvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWRQcmVmaXggKyBcImFycm93RG93blwiKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJyk7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScpO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwuY29sb3InLCBkdXI6IDUwMCwgZnJvbTogXCIjRkYwMDAwXCIsIHRvOiBcIiMwMDAwMDBcIiB9KTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiBcIi0wLjAwNiAwLjAwMyAwLjAwNlwiLCB0bzogXCItMC4wMDQgMC4wMDIgMC4wMDRcIiB9KTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBDQU4gRE8gVEhJUywgc2hvdyBuZXh0IG9wdGdyb3VwXHJcblxyXG4gICAgICB0aGlzLnJlbW92ZVNlbGVjdE9wdGlvbnNSb3codGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCk7IC8vIHJlbW92ZSB0aGUgb2xkIG9wdGdyb3VwIHJvd1xyXG5cclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCArPSAxO1xyXG4gICAgICB2YXIgc2VsZWN0ZWRPcHRncm91cEVsID0gb3B0Z3JvdXBzW3RoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXhdOyAgLy8gZmV0Y2ggdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBvcHRncm91cFxyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cFZhbHVlID0gc2VsZWN0ZWRPcHRncm91cEVsLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpOyAvLyBzZXQgY29tcG9uZW50IHByb3BlcnR5IHRvIG9wZ3JvdXAgdmFsdWVcclxuXHJcbiAgICAgIHRoaXMuZWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgdmFyIG5leHRTZWxlY3RlZE9wdGdyb3VwRWwgPSBvcHRncm91cHNbdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleF07ICAvLyBmZXRjaCB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9wdGdyb3VwXHJcbiAgICAgIC8vIHRoaXMubWFrZVNlbGVjdE9wdGlvbnNSb3cobmV4dFNlbGVjdGVkT3B0Z3JvdXBFbCwgc2VsZWN0UmVuZGVyRWwsIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXgsIC0wLjE1KTtcclxuICAgICAgdGhpcy5tYWtlU2VsZWN0T3B0aW9uc1JvdyhuZXh0U2VsZWN0ZWRPcHRncm91cEVsLCBzZWxlY3RSZW5kZXJFbCwgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCwgMCwgdGhpcy5pZFByZWZpeCk7XHJcblxyXG4gICAgICAvLyBDaGFuZ2Ugc2VsZWN0ZWQgb3B0aW9uIGVsZW1lbnQgd2hlbiBvcHRncm91cCBpcyBjaGFuZ2VkXHJcbiAgICAgIHZhciBzZWxlY3RPcHRpb25zUm93RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkUHJlZml4ICsgJ3NlbGVjdE9wdGlvbnNSb3cnICsgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCk7XHJcbiAgICAgIHZhciBuZXdseVNlbGVjdGVkTWVudUVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NlbGVjdGVkJylbMF07XHJcblxyXG4gICAgICAvLyB1cGRhdGUgc2VsZWN0T3B0aW9uc1ZhbHVlIGFuZCBJbmRleFxyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRpb25WYWx1ZSA9IG5ld2x5U2VsZWN0ZWRNZW51RWwuZ2V0QXR0cmlidXRlKFwidmFsdWVcIik7XHJcbiAgICAgIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGlvbkluZGV4ID0gbmV3bHlTZWxlY3RlZE1lbnVFbC5nZXRBdHRyaWJ1dGUoXCJvcHRpb25pZFwiKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgdGhpcy5lbC5lbWl0KFwibWVudU9wdGdyb3VwTmV4dFwiKTtcclxuICAgICAgdGhpcy5lbC5lbWl0KFwibWVudUNoYW5nZWRcIik7XHJcblxyXG4gICAgICB2YXIgYXJyb3cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkUHJlZml4ICsgXCJhcnJvd0Rvd25cIik7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnKTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnLCB7IHByb3BlcnR5OiAnc2NhbGUnLCBkdXI6IDUwMCwgZnJvbTogXCItMC4wMDYgMC4wMDMgMC4wMDZcIiwgdG86IFwiLTAuMDA0IDAuMDAyIDAuMDA0XCIgfSk7XHJcbiAgICB9XHJcblxyXG4gIH0sXHJcblxyXG4gIG9uT3B0Z3JvdXBQcmV2aW91czogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICB2YXIgc2VsZWN0RWwgPSB0aGlzLmVsO1xyXG4gICAgdmFyIG9wdGdyb3VwcyA9IHNlbGVjdEVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwib3B0Z3JvdXBcIik7ICAvLyBHZXQgdGhlIG9wdGdyb3Vwc1xyXG4gICAgdmFyIHNlbGVjdFJlbmRlckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZFByZWZpeCArIFwic2VsZWN0UmVuZGVyXCIpO1xyXG5cclxuICAgIGlmICh0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4IC0gMSA8IDApIHtcclxuICAgICAgLy8gQ0FOJ1QgRE8gVEhJUywgc2hvdyByZWQgYXJyb3dcclxuICAgICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZFByZWZpeCArIFwiYXJyb3dVcFwiKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJyk7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScpO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwuY29sb3InLCBkdXI6IDUwMCwgZnJvbTogXCIjRkYwMDAwXCIsIHRvOiBcIiMwMDAwMDBcIiB9KTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiBcIjAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIjAuMDA0IDAuMDAyIDAuMDA0XCIgfSk7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gQ0FOIERPIFRISVMsIHNob3cgcHJldmlvdXMgb3B0Z3JvdXBcclxuXHJcbiAgICAgIHRoaXMucmVtb3ZlU2VsZWN0T3B0aW9uc1Jvdyh0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4KTsgLy8gcmVtb3ZlIHRoZSBvbGQgb3B0Z3JvdXAgcm93XHJcblxyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4IC09IDE7XHJcbiAgICAgIHZhciBzZWxlY3RlZE9wdGdyb3VwRWwgPSBvcHRncm91cHNbdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleF07ICAvLyBmZXRjaCB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9wdGdyb3VwXHJcbiAgICAgIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwVmFsdWUgPSBzZWxlY3RlZE9wdGdyb3VwRWwuZ2V0QXR0cmlidXRlKFwidmFsdWVcIik7IC8vIHNldCBjb21wb25lbnQgcHJvcGVydHkgdG8gb3Bncm91cCB2YWx1ZVxyXG5cclxuICAgICAgdGhpcy5lbC5mbHVzaFRvRE9NKCk7XHJcblxyXG4gICAgICB2YXIgbmV4dFNlbGVjdGVkT3B0Z3JvdXBFbCA9IG9wdGdyb3Vwc1t0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4XTsgIC8vIGZldGNoIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgb3B0Z3JvdXBcclxuICAgICAgLy8gdGhpcy5tYWtlU2VsZWN0T3B0aW9uc1JvdyhuZXh0U2VsZWN0ZWRPcHRncm91cEVsLCBzZWxlY3RSZW5kZXJFbCwgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCwgLTAuMTUpO1xyXG4gICAgICB0aGlzLm1ha2VTZWxlY3RPcHRpb25zUm93KG5leHRTZWxlY3RlZE9wdGdyb3VwRWwsIHNlbGVjdFJlbmRlckVsLCB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4LCAwLCB0aGlzLmlkUHJlZml4KTtcclxuXHJcbiAgICAgIC8vIENoYW5nZSBzZWxlY3RlZCBvcHRpb24gZWxlbWVudCB3aGVuIG9wdGdyb3VwIGlzIGNoYW5nZWRcclxuICAgICAgdmFyIHNlbGVjdE9wdGlvbnNSb3dFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWRQcmVmaXggKyAnc2VsZWN0T3B0aW9uc1JvdycgKyB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4KTtcclxuICAgICAgdmFyIG5ld2x5U2VsZWN0ZWRNZW51RWwgPSBzZWxlY3RPcHRpb25zUm93RWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2VsZWN0ZWQnKVswXTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSBzZWxlY3RPcHRpb25zVmFsdWUgYW5kIEluZGV4XHJcbiAgICAgIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGlvblZhbHVlID0gbmV3bHlTZWxlY3RlZE1lbnVFbC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKTtcclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uSW5kZXggPSBuZXdseVNlbGVjdGVkTWVudUVsLmdldEF0dHJpYnV0ZShcIm9wdGlvbmlkXCIpO1xyXG5cclxuICAgICAgdGhpcy5lbC5mbHVzaFRvRE9NKCk7XHJcblxyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51T3B0Z3JvdXBOZXh0XCIpO1xyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51Q2hhbmdlZFwiKTtcclxuXHJcbiAgICAgIHZhciBhcnJvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWRQcmVmaXggKyBcImFycm93VXBcIik7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnKTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnLCB7IHByb3BlcnR5OiAnc2NhbGUnLCBkdXI6IDUwMCwgZnJvbTogXCIwLjAwNiAwLjAwMyAwLjAwNlwiLCB0bzogXCIwLjAwNCAwLjAwMiAwLjAwNFwiIH0pO1xyXG4gICAgfVxyXG5cclxuICB9LFxyXG5cclxuICBvblRyYWNrcGFkRG93bjogZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgLy9tZW51OiBvbmx5IGRlYWwgd2l0aCB0cmFja3BhZCBldmVudHMgZnJvbSBjb250cm9sbGVyIHNwZWNpZmllZCBpbiBjb21wb25lbnQgcHJvcGVydHlcclxuICAgIGlmIChldnQudGFyZ2V0LmlkICE9IHRoaXMuZGF0YS5jb250cm9sbGVySUQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgLy8gV2hpY2ggZGlyZWN0aW9uIHNob3VsZCB0aGUgdHJhY2twYWQgdHJpZ2dlcj9cclxuXHJcbiAgICAvLyBFYWNoIG9mIHRoZSA0IGFycm93J3MgZ3JlZW4gaW50ZW5zaXR5IGlzIGludmVyc2VseSBjb3JyZWxhdGVkIHdpdGggdGltZSBlbGFwc2VkIHNpbmNlIGxhc3QgaG92ZXIgZXZlbnQgb24gdGhhdCBheGlzXHJcbiAgICAvLyBUbyBkZXRlcm1pbmUgd2hpY2ggZGlyZWN0aW9uIHRvIG1vdmUgdXBvbiBidXR0b24gcHJlc3MsIG1vdmUgaW4gdGhlIGRpcmVjdGlvbiB3aXRoIHRoZSBtb3N0IGdyZWVuIGNvbG9yIGludGVuc2l0eVxyXG5cclxuICAgIC8vIEZldGNoIGFsbCA0IGdyZWVuIHZhbHVlcyBhbmQgcGxhY2UgaW4gYW4gYXJyYXkgc3RhcnRpbmcgd2l0aCB1cCwgcmlnaHQsIGRvd24sIGxlZnQgYXJyb3cgY29sb3JzIChjbG9ja3dpc2UgZnJvbSB0b3ApXHJcbiAgICB2YXIgYXJyb3dVcENvbG9yID0gbmV3IFRIUkVFLkNvbG9yKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWRQcmVmaXggKyBcImFycm93VXBcIikuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpO1xyXG4gICAgdmFyIGFycm93UmlnaHRDb2xvciA9IG5ldyBUSFJFRS5Db2xvcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkUHJlZml4ICsgXCJhcnJvd1JpZ2h0XCIpLmdldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIpLmNvbG9yKTtcclxuICAgIHZhciBhcnJvd0Rvd25Db2xvciA9IG5ldyBUSFJFRS5Db2xvcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkUHJlZml4ICsgXCJhcnJvd0Rvd25cIikuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpO1xyXG4gICAgdmFyIGFycm93TGVmdENvbG9yID0gbmV3IFRIUkVFLkNvbG9yKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWRQcmVmaXggKyBcImFycm93TGVmdFwiKS5nZXRBdHRyaWJ1dGUoXCJtYXRlcmlhbFwiKS5jb2xvcik7XHJcbi8vICAgIHZhciBhcnJvd0NvbG9yQXJyYXkgPSBbYXJyb3dVcENvbG9yLCBhcnJvd1JpZ2h0Q29sb3IsIGFycm93RG93bkNvbG9yLCBhcnJvd0xlZnRDb2xvcl07XHJcbiAgICB2YXIgYXJyb3dDb2xvckFycmF5R3JlZW4gPSBbYXJyb3dVcENvbG9yLmcsIGFycm93UmlnaHRDb2xvci5nLCBhcnJvd0Rvd25Db2xvci5nLCBhcnJvd0xlZnRDb2xvci5nXTtcclxuXHJcbiAgICBpZiAoIGFycm93Q29sb3JBcnJheUdyZWVuLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApID4gMCkgeyAvLyBpZiBhdCBsZWFzdCBvbmUgdmFsdWUgaXMgPiAwXHJcbiAgICAgIHN3aXRjaCAoaW5kZXhPZk1heChhcnJvd0NvbG9yQXJyYXlHcmVlbikpIHsgICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggdmFsdWUgaW4gdGhlIGFycmF5IGlzIHRoZSBsYXJnZXN0XHJcbiAgICAgICAgY2FzZSAwOiAgICAgICAgLy8gdXBcclxuICAgICAgICAgIHRoaXMub25PcHRncm91cFByZXZpb3VzKCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlBSRVNTdXBcIik7XHJcbiAgICAgICAgICByZXR1cm47IC8vIHdpdGhvdXQgdGhpcyByZXR1cm4gdGhlIG90aGVyIGNhc2VzIGFyZSBmaXJlZCAtIHdlaXJkIVxyXG4gICAgICAgIGNhc2UgMTogICAgICAgIC8vIHJpZ2h0XHJcbiAgICAgICAgICB0aGlzLm9uT3B0aW9uU3dpdGNoKFwibmV4dFwiKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiUFJFU1NyaWdodFwiKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjYXNlIDI6ICAgICAgICAvLyBkb3duXHJcbiAgICAgICAgICB0aGlzLm9uT3B0Z3JvdXBOZXh0KCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlBSRVNTZG93blwiKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjYXNlIDM6ICAgICAgICAvLyBsZWZ0XHJcbiAgICAgICAgICB0aGlzLm9uT3B0aW9uU3dpdGNoKFwicHJldmlvdXNcIik7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlBSRVNTbGVmdFwiKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICB9LFxyXG5cclxuICBvbk9wdGlvblN3aXRjaDogZnVuY3Rpb24gKGRpcmVjdGlvbikge1xyXG4gICAgY29uc29sZS5sb2codGhpcyk7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLmRhdGEpO1xyXG4gICAgLy8gU3dpdGNoIHRvIHRoZSBuZXh0IG9wdGlvbiwgb3Igc3dpdGNoIGluIHRoZSBkaXJlY3Rpb24gb2YgdGhlIG1vc3QgcmVjZW50bHkgaG92ZXJlZCBkaXJlY3Rpb25hbCBhcnJvd1xyXG4gICAgLy8gbWVudTogc2F2ZSB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG1lbnUgZWxlbWVudFxyXG4gICAgLy8gY29uc29sZS5sb2coXCJkaXJlY3Rpb24/XCIpO1xyXG4gICAgLy8gY29uc29sZS5sb2coZGlyZWN0aW9uKTtcclxuICAgIGNvbnNvbGUubG9nKHRoaXMuaWRQcmVmaXggKyAnc2VsZWN0T3B0aW9uc1JvdycgKyB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4KTtcclxuICAgIHZhciBzZWxlY3RPcHRpb25zUm93RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkUHJlZml4ICsgJ3NlbGVjdE9wdGlvbnNSb3cnICsgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCk7XHJcblxyXG4gICAgY29uc3Qgb2xkTWVudUVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NlbGVjdGVkJylbMF07XHJcbiAgICAvLyBjb25zb2xlLmxvZyhvbGRNZW51RWwpO1xyXG5cclxuICAgIHZhciBvbGRTZWxlY3RlZE9wdGlvbkluZGV4ID0gcGFyc2VJbnQob2xkTWVudUVsLmdldEF0dHJpYnV0ZShcIm9wdGlvbmlkXCIpKTtcclxuICAgIHZhciBzZWxlY3RlZE9wdGlvbkluZGV4ID0gb2xkU2VsZWN0ZWRPcHRpb25JbmRleDtcclxuICAgIC8vIGNvbnNvbGUubG9nKHNlbGVjdGVkT3B0aW9uSW5kZXgpO1xyXG5cclxuICAgIHZhciBzZWxlY3RFbCA9IHRoaXMuZWw7ICAvLyBSZWZlcmVuY2UgdG8gdGhlIGNvbXBvbmVudCdzIGVudGl0eS5cclxuICAgIHZhciBvcHRncm91cHMgPSBzZWxlY3RFbC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm9wdGdyb3VwXCIpOyAgLy8gR2V0IHRoZSBvcHRncm91cHNcclxuICAgIHZhciBzZWxlY3RlZE9wdGdyb3VwRWwgPSBvcHRncm91cHNbdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleF07ICAvLyBmZXRjaCB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9wdGdyb3VwXHJcblxyXG4gICAgaWYgKGRpcmVjdGlvbiA9PSAncHJldmlvdXMnKSB7XHJcbiAgICAgIHRoaXMuZWwuZW1pdChcIm1lbnVQcmV2aW91c1wiKTtcclxuICAgICAgLy8gUFJFVklPVVMgT1BUSU9OIE1FTlUgU1RBUlQgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgICBzZWxlY3RlZE9wdGlvbkluZGV4ID0gbG9vcEluZGV4KHNlbGVjdGVkT3B0aW9uSW5kZXggLT0gMSwgc2VsZWN0ZWRPcHRncm91cEVsLmNoaWxkRWxlbWVudENvdW50KTtcclxuICAgICAgLy8gY29uc29sZS5sb2coc2VsZWN0ZWRPcHRpb25JbmRleCk7XHJcblxyXG4gICAgICAvLyBtZW51OiBhbmltYXRlIGFycm93IExFRlRcclxuICAgICAgdmFyIGFycm93TGVmdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWRQcmVmaXggKyBcImFycm93TGVmdFwiKTtcclxuICAgICAgYXJyb3dMZWZ0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvd0xlZnQucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknKTtcclxuICAgICAgYXJyb3dMZWZ0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScpO1xyXG4gICAgICBhcnJvd0xlZnQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93TGVmdC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5vcGFjaXR5JywgZHVyOiA1MDAsIGZyb206IFwiMVwiLCB0bzogXCIwLjVcIiB9KTtcclxuICAgICAgYXJyb3dMZWZ0LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiBcIjAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIjAuMDA0IDAuMDAyIDAuMDA0XCIgfSk7XHJcblxyXG4gICAgICAvLyBtZW51OiBnZXQgdGhlIG5ld2x5IHNlbGVjdGVkIG1lbnUgZWxlbWVudFxyXG4gICAgICBjb25zdCBuZXdNZW51RWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBzZWxlY3RlZE9wdGlvbkluZGV4ICsgXCInXVwiKVswXTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IHJlbW92ZSBzZWxlY3RlZCBjbGFzcyBhbmQgY2hhbmdlIGNvbG9yc1xyXG4gICAgICBvbGRNZW51RWwuY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkXCIpO1xyXG4gICAgICBuZXdNZW51RWwuY2xhc3NMaXN0LmFkZChcInNlbGVjdGVkXCIpO1xyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRpb25WYWx1ZSA9IG5ld01lbnVFbC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKTtcclxuICAgICAgY29uc29sZS5sb2codGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uVmFsdWUpO1xyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRpb25JbmRleCA9IHNlbGVjdGVkT3B0aW9uSW5kZXg7XHJcbiAgICAgIHRoaXMuZWwuZmx1c2hUb0RPTSgpO1xyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51Q2hhbmdlZFwiKTtcclxuICAgICAgb2xkTWVudUVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgndGV4dCcsICdjb2xvcicsICdncmF5Jyk7XHJcbiAgICAgIG5ld01lbnVFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwib2JqZWN0TmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ3RleHQnLCAnY29sb3InLCAneWVsbG93Jyk7XHJcbiAgICAgIG9sZE1lbnVFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJldmlld0ZyYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCAnY29sb3InLCAnIzIyMjIyMicpO1xyXG4gICAgICBuZXdNZW51RWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInByZXZpZXdGcmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ21hdGVyaWFsJywgJ2NvbG9yJywgJ3llbGxvdycpO1xyXG5cclxuICAgICAgLy8gbWVudTogc2xpZGUgdGhlIG1lbnUgbGlzdCByb3cgUklHSFQgYnkgMVxyXG4vLyAgICAgIGNvbnN0IHNlbGVjdE9wdGlvbnNSb3dFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2VsZWN0T3B0aW9uc1Jvd1wiKTtcclxuICAgICAgLy8gdXNlIHRoZSBkZXNpcmVkUG9zaXRpb24gYXR0cmlidXRlIChpZiBleGlzdHMpIGluc3RlYWQgb2Ygb2JqZWN0M0QgcG9zaXRpb24gYXMgYW5pbWF0aW9uIG1heSBub3QgYmUgZG9uZSB5ZXRcclxuICAgICAgaWYgKHNlbGVjdE9wdGlvbnNSb3dFbC5oYXNBdHRyaWJ1dGUoXCJkZXNpcmVkUG9zaXRpb25cIikpIHtcclxuICAgICAgICB2YXIgb2xkUG9zaXRpb24gPSBzZWxlY3RPcHRpb25zUm93RWwuZ2V0QXR0cmlidXRlKFwiZGVzaXJlZFBvc2l0aW9uXCIpO1xyXG4gICAgICAgIHZhciBuZXdYID0gcGFyc2VGbG9hdChvbGRQb3NpdGlvbi5zcGxpdChcIiBcIilbMF0pICsgMC4wNzU7XHJcbiAgICAgICAgdmFyIG5ld1Bvc2l0aW9uU3RyaW5nID0gbmV3WC50b1N0cmluZygpICsgXCIgXCIgKyBvbGRQb3NpdGlvbi5zcGxpdChcIiBcIilbMV0gKyBcIiBcIiArIG9sZFBvc2l0aW9uLnNwbGl0KFwiIFwiKVsyXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgb2xkUG9zaXRpb24gPSBzZWxlY3RPcHRpb25zUm93RWwub2JqZWN0M0QucG9zaXRpb247XHJcbiAgICAgICAgdmFyIG5ld1ggPSBvbGRQb3NpdGlvbi54ICsgMC4wNzU7IC8vIHRoaXMgY291bGQgYmUgYSB2YXJpYWJsZSBhdCB0aGUgY29tcG9uZW50IGxldmVsXHJcbiAgICAgICAgdmFyIG5ld1Bvc2l0aW9uU3RyaW5nID0gbmV3WC50b1N0cmluZygpICsgXCIgXCIgKyBvbGRQb3NpdGlvbi55ICsgXCIgXCIgKyBvbGRQb3NpdGlvbi56O1xyXG4gICAgICB9XHJcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2xpZGUnKTtcclxuICAgICAgc2VsZWN0T3B0aW9uc1Jvd0VsLnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zbGlkZScsIHsgcHJvcGVydHk6ICdwb3NpdGlvbicsIGR1cjogNTAwLCBmcm9tOiBvbGRQb3NpdGlvbiwgdG86IG5ld1Bvc2l0aW9uU3RyaW5nIH0pO1xyXG4gICAgICBzZWxlY3RPcHRpb25zUm93RWwuc2V0QXR0cmlidXRlKCdkZXNpcmVkUG9zaXRpb24nLCBuZXdQb3NpdGlvblN0cmluZyk7XHJcblxyXG4gICAgICAvLyBtZW51OiBtYWtlIHRoZSBoaWRkZW4gbW9zdCBMRUZUbW9zdCBvYmplY3QgKC0zIGZyb20gb2xkTWVudUVsIGluZGV4KSB2aXNpYmxlXHJcbiAgICAgIHZhciBuZXdseVZpc2libGVPcHRpb25JbmRleCA9IGxvb3BJbmRleChvbGRTZWxlY3RlZE9wdGlvbkluZGV4IC0gMywgc2VsZWN0ZWRPcHRncm91cEVsLmNoaWxkRWxlbWVudENvdW50KTtcclxuICAgICAgdmFyIG5ld2x5VmlzaWJsZU9wdGlvbkVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbb3B0aW9uaWQ9J1wiICsgbmV3bHlWaXNpYmxlT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xyXG5cclxuICAgICAgLy8gbWFrZSB2aXNpYmxlIGFuZCBhbmltYXRlXHJcbiAgICAgIG5ld2x5VmlzaWJsZU9wdGlvbkVsLnNldEF0dHJpYnV0ZSgndmlzaWJsZScsJ3RydWUnKTtcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb24nKTtcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwuc2V0QXR0cmlidXRlKCdhbmltYXRpb24nLCB7IHByb3BlcnR5OiAnc2NhbGUnLCBkdXI6IDUwMCwgZnJvbTogJzAuNSAwLjUgMC41JywgdG86ICcxLjAgMS4wIDEuMCcgfSk7XHJcbiAgICAgIG5ld2x5VmlzaWJsZU9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IGRlc3Ryb3kgdGhlIGhpZGRlbiBtb3N0IFJJR0hUbW9zdCBvYmplY3QgKCszIGZyb20gb2xkTWVudUVsIGluZGV4KVxyXG4gICAgICB2YXIgbmV3bHlSZW1vdmVkT3B0aW9uSW5kZXggPSBsb29wSW5kZXgob2xkU2VsZWN0ZWRPcHRpb25JbmRleCArIDMsIHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZEVsZW1lbnRDb3VudCk7XHJcbiAgICAgIHZhciBuZXdseVJlbW92ZWRPcHRpb25FbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5xdWVyeVNlbGVjdG9yQWxsKFwiW29wdGlvbmlkPSdcIiArIG5ld2x5UmVtb3ZlZE9wdGlvbkluZGV4ICsgXCInXVwiKVswXTtcclxuICAgICAgbmV3bHlSZW1vdmVkT3B0aW9uRWwuZmx1c2hUb0RPTSgpO1xyXG4gICAgICBuZXdseVJlbW92ZWRPcHRpb25FbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5ld2x5UmVtb3ZlZE9wdGlvbkVsKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IG1ha2UgdGhlIHNlY29uZCBSSUdIVG1vc3Qgb2JqZWN0ICgrMiBmcm9tIG9sZE1lbnVFbCBpbmRleCkgaW52aXNpYmxlXHJcbiAgICAgIHZhciBuZXdseUludmlzaWJsZU9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggKyAyLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlJbnZpc2libGVPcHRpb25FbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5xdWVyeVNlbGVjdG9yQWxsKFwiW29wdGlvbmlkPSdcIiArIG5ld2x5SW52aXNpYmxlT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xyXG4gICAgICBuZXdseUludmlzaWJsZU9wdGlvbkVsLnNldEF0dHJpYnV0ZSgndmlzaWJsZScsICdmYWxzZScpO1xyXG4gICAgICBuZXdseUludmlzaWJsZU9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IENyZWF0ZSB0aGUgbmV4dCBMRUZUbW9zdCBvYmplY3QgcHJldmlldyAoLTQgZnJvbSBvbGRNZW51RWwgaW5kZXgpIGJ1dCBrZWVwIGl0IGhpZGRlbiB1bnRpbCBpdCdzIG5lZWRlZFxyXG4gICAgICB2YXIgbmV3bHlDcmVhdGVkT3B0aW9uRWwgPSBuZXdseVZpc2libGVPcHRpb25FbC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLnNldEF0dHJpYnV0ZSgndmlzaWJsZScsICdmYWxzZScpO1xyXG4gICAgICB2YXIgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXggPSBsb29wSW5kZXgob2xkU2VsZWN0ZWRPcHRpb25JbmRleCAtIDQsIHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZEVsZW1lbnRDb3VudCk7XHJcblxyXG4gICAgICAvLyBnZXQgdGhlIGFjdHVhbCBcIm9wdGlvblwiIGVsZW1lbnQgdGhhdCBpcyB0aGUgc291cmNlIG9mIHRydXRoIGZvciB2YWx1ZSwgaW1hZ2Ugc3JjIGFuZCBsYWJlbCBzbyB0aGF0IHdlIGNhbiBwb3B1bGF0ZSB0aGUgbmV3IG1lbnUgb3B0aW9uXHJcbiAgICAgIHZhciBzb3VyY2VPcHRpb25FbCA9IHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZHJlbltuZXdseUNyZWF0ZWRPcHRpb25JbmRleF07XHJcblxyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ29wdGlvbmlkJywgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgpO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ2lkJywgdGhpcy5pZFByZWZpeCArIG5ld2x5Q3JlYXRlZE9wdGlvbkluZGV4KTtcclxuICAgICAgbmV3bHlDcmVhdGVkT3B0aW9uRWwuc2V0QXR0cmlidXRlKCd2YWx1ZScsIHNvdXJjZU9wdGlvbkVsLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpKTtcclxuXHJcbiAgICAgIHZhciBuZXdseVZpc2libGVPcHRpb25Qb3NpdGlvbiA9IG5ld2x5VmlzaWJsZU9wdGlvbkVsLm9iamVjdDNELnBvc2l0aW9uO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgKG5ld2x5VmlzaWJsZU9wdGlvblBvc2l0aW9uLnggLSAwLjA3NSkgKyBcIiBcIiArIG5ld2x5VmlzaWJsZU9wdGlvblBvc2l0aW9uLnkgKyBcIiBcIiArIG5ld2x5VmlzaWJsZU9wdGlvblBvc2l0aW9uLnopO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5mbHVzaFRvRE9NKCk7XHJcblxyXG4gICAgICAvLyBtZW51OiBhZGQgdGhlIG5ld2x5IGNsb25lZCBhbmQgbW9kaWZpZWQgbWVudSBvYmplY3QgcHJldmlldyB0byB0aGUgZG9tXHJcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5pbnNlcnRCZWZvcmUoIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLCBzZWxlY3RPcHRpb25zUm93RWwuZmlyc3RDaGlsZCApO1xyXG5cclxuICAgICAgLy8gbWVudTogZ2V0IGNoaWxkIGVsZW1lbnRzIGZvciBpbWFnZSBhbmQgbmFtZSwgcG9wdWxhdGUgYm90aCBhcHByb3ByaWF0ZWx5XHJcbiAgICAgIHZhciBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbb3B0aW9uaWQ9J1wiICsgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJwcmV2aWV3SW1hZ2VcIilbMF0uc2V0QXR0cmlidXRlKCdzcmMnLCBzb3VyY2VPcHRpb25FbC5nZXRBdHRyaWJ1dGUoXCJzcmNcIikpXHJcbiAgICAgIGFwcGVuZGVkTmV3bHlDcmVhdGVkT3B0aW9uRWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm9iamVjdE5hbWVcIilbMF0uc2V0QXR0cmlidXRlKCd0ZXh0JywgJ3ZhbHVlJywgc291cmNlT3B0aW9uRWwudGV4dCk7XHJcbiAgICAgIGFwcGVuZGVkTmV3bHlDcmVhdGVkT3B0aW9uRWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm9iamVjdE5hbWVcIilbMF0uc2V0QXR0cmlidXRlKCd0ZXh0JywgJ2NvbG9yJywgJyM3NDc0NzQnKTtcclxuICAgICAgYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbC5mbHVzaFRvRE9NKCk7XHJcblxyXG4gICAgLy8gUFJFVklPVVMgT1BUSU9OIE1FTlUgRU5EID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51TmV4dFwiKTtcclxuICAgICAgLy8gTkVYVCBPUFRJT04gTUVOVSBTVEFSVCA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAgIHNlbGVjdGVkT3B0aW9uSW5kZXggPSBsb29wSW5kZXgoc2VsZWN0ZWRPcHRpb25JbmRleCArPSAxLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG5cclxuICAgICAgLy8gbWVudTogYW5pbWF0ZSBhcnJvdyByaWdodFxyXG4gICAgICB2YXIgYXJyb3dSaWdodCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWRQcmVmaXggKyBcImFycm93UmlnaHRcIik7XHJcbiAgICAgIGFycm93UmlnaHQucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJyk7XHJcbiAgICAgIGFycm93UmlnaHQucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknKTtcclxuICAgICAgYXJyb3dSaWdodC5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnKTtcclxuICAgICAgYXJyb3dSaWdodC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwuY29sb3InLCBkdXI6IDUwMCwgZnJvbTogXCIjRkZGRjAwXCIsIHRvOiBcIiMwMDAwMDBcIiB9KTtcclxuICAgICAgYXJyb3dSaWdodC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5vcGFjaXR5JywgZHVyOiA1MDAsIGZyb206IFwiMVwiLCB0bzogXCIwLjVcIiB9KTtcclxuICAgICAgYXJyb3dSaWdodC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnLCB7IHByb3BlcnR5OiAnc2NhbGUnLCBkdXI6IDUwMCwgZnJvbTogXCItMC4wMDYgMC4wMDMgMC4wMDZcIiwgdG86IFwiLTAuMDA0IDAuMDAyIDAuMDA0XCIgfSk7XHJcblxyXG4gICAgICAvLyBtZW51OiBnZXQgdGhlIG5ld2x5IHNlbGVjdGVkIG1lbnUgZWxlbWVudFxyXG4gICAgICBjb25zdCBuZXdNZW51RWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBzZWxlY3RlZE9wdGlvbkluZGV4ICsgXCInXVwiKVswXTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IHJlbW92ZSBzZWxlY3RlZCBjbGFzcyBhbmQgY2hhbmdlIGNvbG9yc1xyXG4gICAgICBvbGRNZW51RWwuY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkXCIpO1xyXG4gICAgICBuZXdNZW51RWwuY2xhc3NMaXN0LmFkZChcInNlbGVjdGVkXCIpO1xyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRpb25WYWx1ZSA9IG5ld01lbnVFbC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKTtcclxuICAgICAgY29uc29sZS5sb2codGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uVmFsdWUpO1xyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRpb25JbmRleCA9IHNlbGVjdGVkT3B0aW9uSW5kZXg7XHJcbiAgICAgIHRoaXMuZWwuZmx1c2hUb0RPTSgpO1xyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51Q2hhbmdlZFwiKTtcclxuICAgICAgb2xkTWVudUVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgndGV4dCcsICdjb2xvcicsICdncmF5Jyk7XHJcbiAgICAgIG5ld01lbnVFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwib2JqZWN0TmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ3RleHQnLCAnY29sb3InLCAneWVsbG93Jyk7XHJcbiAgICAgIG9sZE1lbnVFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJldmlld0ZyYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCAnY29sb3InLCAnIzIyMjIyMicpO1xyXG4gICAgICBuZXdNZW51RWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInByZXZpZXdGcmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ21hdGVyaWFsJywgJ2NvbG9yJywgJ3llbGxvdycpO1xyXG5cclxuICAgICAgLy8gbWVudTogc2xpZGUgdGhlIG1lbnUgbGlzdCBsZWZ0IGJ5IDFcclxuLy8gICAgICBjb25zdCBzZWxlY3RPcHRpb25zUm93RWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NlbGVjdE9wdGlvbnNSb3dcIik7XHJcbiAgICAgIC8vIHVzZSB0aGUgZGVzaXJlZFBvc2l0aW9uIGF0dHJpYnV0ZSAoaWYgZXhpc3RzKSBpbnN0ZWFkIG9mIG9iamVjdDNEIHBvc2l0aW9uIGFzIGFuaW1hdGlvbiBtYXkgbm90IGJlIGRvbmUgeWV0XHJcbiAgICAgIC8vIFRPRE8gLSBlcnJvciB3aXRoIHRoaXMgY29kZSB3aGVuIGxvb3BpbmcgdGhyb3VnaCBpbmRleFxyXG5cclxuLy8gICAgICBjb25zb2xlLmxvZyhcIid0cnVlJyBvbGQgcG9zaXRpb25cIik7XHJcbi8vICAgICAgY29uc29sZS5sb2coc2VsZWN0T3B0aW9uc1Jvd0VsLm9iamVjdDNELnBvc2l0aW9uKTtcclxuXHJcbiAgICAgIGlmIChzZWxlY3RPcHRpb25zUm93RWwuaGFzQXR0cmlidXRlKFwiZGVzaXJlZFBvc2l0aW9uXCIpKSB7XHJcbi8vICAgICAgICBjb25zb2xlLmxvZygnZGVzaXJlZFBvc2l0aW9uJyk7XHJcbiAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0gc2VsZWN0T3B0aW9uc1Jvd0VsLmdldEF0dHJpYnV0ZShcImRlc2lyZWRQb3NpdGlvblwiKTtcclxuLy8gICAgICAgIGNvbnNvbGUubG9nKG9sZFBvc2l0aW9uKTtcclxuICAgICAgICB2YXIgbmV3WCA9IHBhcnNlRmxvYXQob2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzBdKSAtIDAuMDc1O1xyXG4gICAgICAgIHZhciBuZXdQb3NpdGlvblN0cmluZyA9IG5ld1gudG9TdHJpbmcoKSArIFwiIFwiICsgb2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzFdICsgXCIgXCIgKyBvbGRQb3NpdGlvbi5zcGxpdChcIiBcIilbMl07XHJcbi8vICAgICAgICBjb25zb2xlLmxvZyhuZXdQb3NpdGlvblN0cmluZyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0gc2VsZWN0T3B0aW9uc1Jvd0VsLm9iamVjdDNELnBvc2l0aW9uO1xyXG4gICAgICAgIHZhciBuZXdYID0gb2xkUG9zaXRpb24ueCAtIDAuMDc1OyAvLyB0aGlzIGNvdWxkIGJlIGEgdmFyaWFibGUgc29vblxyXG4gICAgICAgIHZhciBuZXdQb3NpdGlvblN0cmluZyA9IG5ld1gudG9TdHJpbmcoKSArIFwiIFwiICsgb2xkUG9zaXRpb24ueSArIFwiIFwiICsgb2xkUG9zaXRpb24uejtcclxuLy8gICAgICAgIGNvbnNvbGUubG9nKG5ld1Bvc2l0aW9uU3RyaW5nKTtcclxuICAgICAgfVxyXG4gICAgICBzZWxlY3RPcHRpb25zUm93RWwucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX3NsaWRlJyk7XHJcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2xpZGUnLCB7IHByb3BlcnR5OiAncG9zaXRpb24nLCBkdXI6IDUwMCwgZnJvbTogb2xkUG9zaXRpb24sIHRvOiBuZXdQb3NpdGlvblN0cmluZyB9KTtcclxuICAgICAgc2VsZWN0T3B0aW9uc1Jvd0VsLnNldEF0dHJpYnV0ZSgnZGVzaXJlZFBvc2l0aW9uJywgbmV3UG9zaXRpb25TdHJpbmcpO1xyXG5cclxuICAgICAgLy8gbWVudTogbWFrZSB0aGUgaGlkZGVuIG1vc3QgcmlnaHRtb3N0IG9iamVjdCAoKzMgZnJvbSBvbGRNZW51RWwgaW5kZXgpIHZpc2libGVcclxuICAgICAgdmFyIG5ld2x5VmlzaWJsZU9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggKyAzLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlWaXNpYmxlT3B0aW9uRWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBuZXdseVZpc2libGVPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcblxyXG4gICAgICAvLyBtYWtlIHZpc2libGUgYW5kIGFuaW1hdGVcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywndHJ1ZScpO1xyXG4gICAgICBuZXdseVZpc2libGVPcHRpb25FbC5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbicpO1xyXG4gICAgICBuZXdseVZpc2libGVPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbicsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiAnMC41IDAuNSAwLjUnLCB0bzogJzEuMCAxLjAgMS4wJyB9KTtcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgLy8gbWVudTogZGVzdHJveSB0aGUgaGlkZGVuIG1vc3QgbGVmdG1vc3Qgb2JqZWN0ICgtMyBmcm9tIG9sZE1lbnVFbCBpbmRleClcclxuICAgICAgdmFyIG5ld2x5UmVtb3ZlZE9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggLSAzLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlSZW1vdmVkT3B0aW9uRWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBuZXdseVJlbW92ZWRPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcbiAgICAgIG5ld2x5UmVtb3ZlZE9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuICAgICAgbmV3bHlSZW1vdmVkT3B0aW9uRWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuZXdseVJlbW92ZWRPcHRpb25FbCk7XHJcblxyXG4gICAgICAvLyBtZW51OiBtYWtlIHRoZSBzZWNvbmQgbGVmdG1vc3Qgb2JqZWN0ICgtMiBmcm9tIG9sZE1lbnVFbCBpbmRleCkgaW52aXNpYmxlXHJcbiAgICAgIHZhciBuZXdseUludmlzaWJsZU9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggLSAyLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlJbnZpc2libGVPcHRpb25FbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5xdWVyeVNlbGVjdG9yQWxsKFwiW29wdGlvbmlkPSdcIiArIG5ld2x5SW52aXNpYmxlT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xyXG4gICAgICBuZXdseUludmlzaWJsZU9wdGlvbkVsLnNldEF0dHJpYnV0ZSgndmlzaWJsZScsICdmYWxzZScpO1xyXG4gICAgICBuZXdseUludmlzaWJsZU9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IENyZWF0ZSB0aGUgbmV4dCByaWdodG1vc3Qgb2JqZWN0IHByZXZpZXcgKCs0IGZyb20gb2xkTWVudUVsIGluZGV4KSBidXQga2VlcCBpdCBoaWRkZW4gdW50aWwgaXQncyBuZWVkZWRcclxuICAgICAgdmFyIG5ld2x5Q3JlYXRlZE9wdGlvbkVsID0gbmV3bHlWaXNpYmxlT3B0aW9uRWwuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ3Zpc2libGUnLCAnZmFsc2UnKTtcclxuICAgICAgdmFyIG5ld2x5Q3JlYXRlZE9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggKyA0LCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4vLyAgICAgIGNvbnNvbGUubG9nKFwibmV3bHlDcmVhdGVkT3B0aW9uSW5kZXg6IFwiICsgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgpO1xyXG4gICAgICAvLyBnZXQgdGhlIGFjdHVhbCBcIm9wdGlvblwiIGVsZW1lbnQgdGhhdCBpcyB0aGUgc291cmNlIG9mIHRydXRoIGZvciB2YWx1ZSwgaW1hZ2Ugc3JjIGFuZCBsYWJlbCBzbyB0aGF0IHdlIGNhbiBwb3B1bGF0ZSB0aGUgbmV3IG1lbnUgb3B0aW9uXHJcbiAgICAgIHZhciBzb3VyY2VPcHRpb25FbCA9IHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZHJlbltuZXdseUNyZWF0ZWRPcHRpb25JbmRleF07XHJcbi8vICAgICAgY29uc29sZS5sb2coXCJzb3VyY2VPcHRpb25FbFwiKTtcclxuLy8gICAgICBjb25zb2xlLmxvZyhzb3VyY2VPcHRpb25FbCk7XHJcblxyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ29wdGlvbmlkJywgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgpO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ2lkJywgdGhpcy5pZFByZWZpeCArIG5ld2x5Q3JlYXRlZE9wdGlvbkluZGV4KTtcclxuICAgICAgbmV3bHlDcmVhdGVkT3B0aW9uRWwuc2V0QXR0cmlidXRlKCd2YWx1ZScsIHNvdXJjZU9wdGlvbkVsLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpKTtcclxuXHJcbiAgICAgIHZhciBuZXdseVZpc2libGVPcHRpb25Qb3NpdGlvbiA9IG5ld2x5VmlzaWJsZU9wdGlvbkVsLm9iamVjdDNELnBvc2l0aW9uO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgKG5ld2x5VmlzaWJsZU9wdGlvblBvc2l0aW9uLnggKyAwLjA3NSkgKyBcIiBcIiArIG5ld2x5VmlzaWJsZU9wdGlvblBvc2l0aW9uLnkgKyBcIiBcIiArIG5ld2x5VmlzaWJsZU9wdGlvblBvc2l0aW9uLnopO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5mbHVzaFRvRE9NKCk7XHJcblxyXG4gICAgICAvLyBtZW51OiBhZGQgdGhlIG5ld2x5IGNsb25lZCBhbmQgbW9kaWZpZWQgbWVudSBvYmplY3QgcHJldmlld1xyXG4gICAgICBzZWxlY3RPcHRpb25zUm93RWwuaW5zZXJ0QmVmb3JlKCBuZXdseUNyZWF0ZWRPcHRpb25FbCwgc2VsZWN0T3B0aW9uc1Jvd0VsLmZpcnN0Q2hpbGQgKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IGdldCBjaGlsZCBlbGVtZW50cyBmb3IgaW1hZ2UgYW5kIG5hbWUsIHBvcHVsYXRlIGJvdGggYXBwcm9wcmlhdGVseVxyXG4gICAgICB2YXIgYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5xdWVyeVNlbGVjdG9yQWxsKFwiW29wdGlvbmlkPSdcIiArIG5ld2x5Q3JlYXRlZE9wdGlvbkluZGV4ICsgXCInXVwiKVswXTtcclxuXHJcbiAgICAgIGFwcGVuZGVkTmV3bHlDcmVhdGVkT3B0aW9uRWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInByZXZpZXdJbWFnZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ3NyYycsIHNvdXJjZU9wdGlvbkVsLmdldEF0dHJpYnV0ZShcInNyY1wiKSlcclxuICAgICAgYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwib2JqZWN0TmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ3RleHQnLCAndmFsdWUnLCBzb3VyY2VPcHRpb25FbC50ZXh0KTtcclxuICAgICAgYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwib2JqZWN0TmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ3RleHQnLCAnY29sb3InLCAnIzc0NzQ3NCcpO1xyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIC8vIE5FWFQgTUVOVSBPUFRJT04gRU5EID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxufSk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2xpYi9hZnJhbWUtc2VsZWN0LWJhci5qcyIsIi8qIGdsb2JhbCBBRlJBTUUgKi9cclxuXHJcbmlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xyXG4gIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGF0dGVtcHRlZCB0byByZWdpc3RlciBiZWZvcmUgQUZSQU1FIHdhcyBhdmFpbGFibGUuJyk7XHJcbn1cclxuXHJcbnZhciBvYmplY3RDb3VudCA9IDA7IC8vIHNjZW5lIHN0YXJ0cyB3aXRoIDAgaXRlbXNcclxuXHJcbmZ1bmN0aW9uIGh1bWFuaXplKHN0cikge1xyXG4gIHZhciBmcmFncyA9IHN0ci5zcGxpdCgnXycpO1xyXG4gIHZhciBpPTA7XHJcbiAgZm9yIChpPTA7IGk8ZnJhZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgIGZyYWdzW2ldID0gZnJhZ3NbaV0uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBmcmFnc1tpXS5zbGljZSgxKTtcclxuICB9XHJcbiAgcmV0dXJuIGZyYWdzLmpvaW4oJyAnKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZpdmUgQ29udHJvbGxlciBUZW1wbGF0ZSBjb21wb25lbnQgZm9yIEEtRnJhbWUuXHJcbiAqIE1vZGlmZWQgZnJvbSBBLUZyYW1lIERvbWlub2VzLlxyXG4gKi9cclxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdidWlsZGVyLWNvbnRyb2xzJywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgbWVudUlkOiB7dHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdDogXCJtZW51XCJ9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGlmIGNvbXBvbmVudCBuZWVkcyBtdWx0aXBsZSBpbnN0YW5jaW5nLlxyXG4gICAqL1xyXG4gIG11bHRpcGxlOiBmYWxzZSxcclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGV2ZW50IGxpc3RlbmVycy5cclxuICAgKi9cclxuICBhZGRFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGVsID0gdGhpcy5lbDtcclxuICAgIC8vIHRoaXMgaXMgdGhlIG9ubHkgY29udHJvbGxlciBmdW50aW9uIG5vdCBjb3ZlcmVkIGJ5IHNlbGVjdCBtZW51IGNvbXBvbmVudFxyXG4gICAgLy8gQXBwbGljYWJsZSB0byBib3RoIFZpdmUgYW5kIE9jdWx1cyBUb3VjaCBjb250cm9sc1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignZ3JpcGRvd24nLCB0aGlzLm9uVW5kby5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyB0aGUgcmVzdCBvZiB0aGUgY29udHJvbHMgYXJlIGhhbmRsZWQgYnkgdGhlIG1lbnUgZWxlbWVudFxyXG4gICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5tZW51SWQpO1xyXG4gICAgbWVudUVsLmFkZEV2ZW50TGlzdGVuZXIoJ21lbnVDaGFuZ2VkJywgdGhpcy5vbk9iamVjdENoYW5nZS5iaW5kKHRoaXMpKTtcclxuICAgIG1lbnVFbC5hZGRFdmVudExpc3RlbmVyKCdtZW51U2VsZWN0ZWQnLCB0aGlzLm9uUGxhY2VPYmplY3QuYmluZCh0aGlzKSk7XHJcblxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXHJcbiAgICovXHJcbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBlbCA9IHRoaXMuZWw7XHJcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdncmlwZG93bicsIHRoaXMub25VbmRvKTtcclxuXHJcbiAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLm1lbnVJZCk7XHJcbiAgICBtZW51RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVudUNoYW5nZWQnLCB0aGlzLm9uT2JqZWN0Q2hhbmdlKTtcclxuICAgIG1lbnVFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtZW51U2VsZWN0ZWQnLCB0aGlzLm9uUGxhY2VPYmplY3QpO1xyXG5cclxuICB9LFxyXG5cclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vIGdldCB0aGUgbGlzdCBvZiBvYmplY3QgZ3JvdXAganNvbiBkaXJlY3RvcmllcyAtIHdoaWNoIGpzb24gZmlsZXMgc2hvdWxkIHdlIHJlYWQ/XHJcbiAgICAgIC8vIGZvciBlYWNoIGdyb3VwLCBmZXRjaCB0aGUganNvbiBmaWxlIGFuZCBwb3B1bGF0ZSB0aGUgb3B0Z3JvdXAgYW5kIG9wdGlvbiBlbGVtZW50cyBhcyBjaGlsZHJlbiBvZiB0aGUgYXBwcm9wcmlhdGUgbWVudSBlbGVtZW50XHJcbiAgICAgIHZhciBsaXN0ID0gW1wia2ZhcnJfYmFzZXNcIixcclxuICAgICAgICAgICAgICBcIm1tbW1fdmVoXCIsXHJcbiAgICAgICAgICAgICAgXCJtbW1tX2JsZFwiLFxyXG4gICAgICAgICAgICAgIFwibW1tbV9hbGllblwiLFxyXG4gICAgICAgICAgICAgIFwibW1tbV9zY2VuZVwiLFxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgdmFyIGdyb3VwSlNPTkFycmF5ID0gW107XHJcbiAgICAgIGNvbnN0IG1lbnVJZCA9IHRoaXMuZGF0YS5tZW51SWQ7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiYnVpbGRlci1jb250cm9scyBtZW51SWQ6IFwiICsgbWVudUlkKTtcclxuXHJcbiAgICAgIC8vIFRPRE86IHdyYXAgdGhpcyBpbiBwcm9taXNlIGFuZCB0aGVuIHJlcXVlc3QgYWZyYW1lLXNlbGVjdC1iYXIgY29tcG9uZW50IHRvIHJlLWluaXQgd2hlbiBkb25lIGxvYWRpbmdcclxuICAgICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChncm91cE5hbWUsIGluZGV4KSB7XHJcbiAgICAgICAgLy8gZXhjZWxsZW50IHJlZmVyZW5jZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9MZWFybi9KYXZhU2NyaXB0L09iamVjdHMvSlNPTlxyXG4gICAgICAgIHZhciByZXF1ZXN0VVJMID0gJ2Fzc2V0cy8nICsgZ3JvdXBOYW1lICsgXCIuanNvblwiO1xyXG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgcmVxdWVzdC5vcGVuKCdHRVQnLCByZXF1ZXN0VVJMKTtcclxuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICdqc29uJztcclxuICAgICAgICByZXF1ZXN0LnNlbmQoKTtcclxuXHJcbiAgICAgICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHsgLy8gZm9yIGVhY2ggZ3JvdXBsaXN0IGpzb24gZmlsZSB3aGVuIGxvYWRlZFxyXG4gICAgICAgICAgZ3JvdXBKU09OQXJyYXlbZ3JvdXBOYW1lXSA9IHJlcXVlc3QucmVzcG9uc2U7XHJcbiAgICAgICAgICAvLyBsaXRlcmFsbHkgYWRkIHRoaXMgc2hpdCB0byB0aGUgZG9tIGR1ZGVcclxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGdyb3VwSlNPTkFycmF5W2dyb3VwTmFtZV0pO1xyXG4gICAgICAgICAgLy8gY29uc29sZS5sb2coXCJncm91cE5hbWU6IFwiICsgZ3JvdXBOYW1lKTtcclxuXHJcbiAgICAgICAgICAvLyBmaW5kIHRoZSBvcHRncm91cCBwYXJlbnQgZWxlbWVudCAtIHRoZSBtZW51IG9wdGlvbj9cclxuICAgICAgICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChtZW51SWQpO1xyXG5cclxuICAgICAgICAgIC8vIGFkZCB0aGUgcGFyZW50IG9wdGdyb3VwIG5vZGUgbGlrZTogPG9wdGdyb3VwIGxhYmVsPVwiQWxpZW5zXCIgdmFsdWU9XCJtbW1tX2FsaWVuXCI+XHJcbiAgICAgICAgICB2YXIgbmV3T3B0Z3JvdXBFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRncm91cFwiKTtcclxuICAgICAgICAgIG5ld09wdGdyb3VwRWwuc2V0QXR0cmlidXRlKFwibGFiZWxcIiwgaHVtYW5pemUoZ3JvdXBOYW1lKSk7IC8vIFRPRE86IHRoaXMgc2hvdWxkIGJlIGEgcHJldHRpZXIgbGFiZWwsIG5vdCB0aGUgZmlsZW5hbWVcclxuICAgICAgICAgIG5ld09wdGdyb3VwRWwuc2V0QXR0cmlidXRlKFwidmFsdWVcIiwgZ3JvdXBOYW1lKTtcclxuXHJcbiAgICAgICAgICAvLyBjcmVhdGUgZWFjaCBjaGlsZFxyXG4gICAgICAgICAgdmFyIG9wdGlvbnNIVE1MID0gXCJcIjtcclxuICAgICAgICAgIGdyb3VwSlNPTkFycmF5W2dyb3VwTmFtZV0uZm9yRWFjaCggZnVuY3Rpb24ob2JqZWN0RGVmaW5pdGlvbiwgaW5kZXgpIHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2cob2JqZWN0RGVmaW5pdGlvbltcImZpbGVcIl0pO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhvYmplY3REZWZpbml0aW9uKTtcclxuICAgICAgICAgICAgb3B0aW9uc0hUTUwgKz0gYDxvcHRpb24gdmFsdWU9XCIke29iamVjdERlZmluaXRpb25bXCJmaWxlXCJdfVwiIHNyYz1cImFzc2V0cy9wcmV2aWV3LyR7b2JqZWN0RGVmaW5pdGlvbltcImZpbGVcIl19LmpwZ1wiPiR7aHVtYW5pemUob2JqZWN0RGVmaW5pdGlvbltcImZpbGVcIl0pfTwvb3B0aW9uPmBcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIG5ld09wdGdyb3VwRWwuaW5uZXJIVE1MID0gb3B0aW9uc0hUTUw7XHJcbiAgICAgICAgICAvLyBUT0RPOiBCQUQgV09SS0FST1VORCBUTyBOT1QgUkVMT0FEIEJBU0VTIHNpbmNlIGl0J3MgZGVmaW5lZCBpbiBIVE1MLiBJbnN0ZWFkLCBubyBvYmplY3RzIHNob3VsZCBiZSBsaXN0ZWQgaW4gSFRNTC4gVGhpcyBzaG91bGQgdXNlIGEgcHJvbWlzZSBhbmQgdGhlbiBpbml0IHRoZSBzZWxlY3QtYmFyIGNvbXBvbmVudCBvbmNlIGFsbCBvYmplY3RzIGFyZSBsaXN0ZWQuXHJcbiAgICAgICAgICBpZiAoZ3JvdXBOYW1lID09IFwia2ZhcnJfYmFzZXNcIikge1xyXG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nIC0gZG9uJ3QgYXBwZW5kIHRoaXMgdG8gdGhlIERPTSBiZWNhdXNlIG9uZSBpcyBhbHJlYWR5IHRoZXJlXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBtZW51RWwuYXBwZW5kQ2hpbGQobmV3T3B0Z3JvdXBFbCk7XHJcbiAgICAgICAgICB9XHJcbi8vICAgICAgICAgIHJlc29sdmU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuZ3JvdXBKU09OQXJyYXkgPSBncm91cEpTT05BcnJheTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBlbnRpdHkgcmVzdW1lcy5cclxuICAgKiBVc2UgdG8gY29udGludWUgb3IgYWRkIGFueSBkeW5hbWljIG9yIGJhY2tncm91bmQgYmVoYXZpb3Igc3VjaCBhcyBldmVudHMuXHJcbiAgICovXHJcbiAgcGxheTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGVudGl0eSBwYXVzZXMuXHJcbiAgICogVXNlIHRvIHN0b3Agb3IgcmVtb3ZlIGFueSBkeW5hbWljIG9yIGJhY2tncm91bmQgYmVoYXZpb3Igc3VjaCBhcyBldmVudHMuXHJcbiAgICovXHJcbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGNvbXBvbmVudCBpcyByZW1vdmVkIChlLmcuLCB2aWEgcmVtb3ZlQXR0cmlidXRlKS5cclxuICAgKiBHZW5lcmFsbHkgdW5kb2VzIGFsbCBtb2RpZmljYXRpb25zIHRvIHRoZSBlbnRpdHkuXHJcbiAgICovXHJcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogU3Bhd25zIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgb2JqZWN0IGF0IHRoZSBjb250cm9sbGVyIGxvY2F0aW9uIHdoZW4gdHJpZ2dlciBwcmVzc2VkXHJcbiAgICovXHJcbiAgb25QbGFjZU9iamVjdDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIC8vIEZldGNoIHRoZSBJdGVtIGVsZW1lbnQgKHRoZSBwbGFjZWFibGUgY2l0eSBvYmplY3QpIHNlbGVjdGVkIG9uIHRoaXMgY29udHJvbGxlclxyXG4gICAgdmFyIHRoaXNJdGVtSUQgPSAodGhpcy5lbC5pZCA9PT0gJ2xlZnRDb250cm9sbGVyJykgPyAnI2xlZnRJdGVtJzonI3JpZ2h0SXRlbSc7XHJcbiAgICB2YXIgdGhpc0l0ZW1FbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpc0l0ZW1JRCk7XHJcblxyXG4gICAgLy8gV2hpY2ggb2JqZWN0IHNob3VsZCBiZSBwbGFjZWQgaGVyZT8gVGhpcyBJRCBpcyBcInN0b3JlZFwiIGluIHRoZSBET00gZWxlbWVudCBvZiB0aGUgY3VycmVudCBJdGVtXHJcblx0XHR2YXIgb2JqZWN0SWQgPSBwYXJzZUludCh0aGlzSXRlbUVsLmF0dHJpYnV0ZXMub2JqZWN0SWQudmFsdWUpO1xyXG5cclxuICAgIC8vIFdoYXQncyB0aGUgdHlwZSBvZiBvYmplY3Q/IEZvciBleGFtcGxlLCBcIm1tbW1fYWxpZW5cIiBvciBcImJhc2VzXCJcclxuXHRcdHZhciBvYmplY3RHcm91cCA9IHRoaXNJdGVtRWwuYXR0cmlidXRlcy5vYmplY3RHcm91cC52YWx1ZTtcclxuXHJcbiAgICAvLyByb3VuZGluZyB0cnVlIG9yIGZhbHNlPyBXZSB3YW50IHRvIHJvdW5kIHBvc2l0aW9uIGFuZCByb3RhdGlvbiBvbmx5IGZvciBcImJhc2VzXCIgdHlwZSBvYmplY3RzXHJcbiAgICB2YXIgcm91bmRpbmcgPSAob2JqZWN0R3JvdXAgPT0gJ2tmYXJyX2Jhc2VzJyk7XHJcblxyXG4gICAgLy8gR2V0IGFuIEFycmF5IG9mIGFsbCB0aGUgb2JqZWN0cyBvZiB0aGlzIHR5cGVcclxuICAgIHZhciBvYmplY3RBcnJheSA9IHRoaXMuZ3JvdXBKU09OQXJyYXlbb2JqZWN0R3JvdXBdO1xyXG5cclxuICAgIC8vIEdldCB0aGUgSXRlbSdzIGN1cnJlbnQgd29ybGQgY29vcmRpbmF0ZXMgLSB3ZSdyZSBnb2luZyB0byBwbGFjZSBpdCByaWdodCB3aGVyZSBpdCBpcyFcclxuXHRcdHZhciB0aGlzSXRlbVdvcmxkUG9zaXRpb24gPSB0aGlzSXRlbUVsLm9iamVjdDNELmdldFdvcmxkUG9zaXRpb24oKTtcclxuXHRcdHZhciB0aGlzSXRlbVdvcmxkUm90YXRpb24gPSB0aGlzSXRlbUVsLm9iamVjdDNELmdldFdvcmxkUm90YXRpb24oKTtcclxuXHRcdHZhciBvcmlnaW5hbFBvc2l0aW9uU3RyaW5nID0gdGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLnggKyAnICcgKyB0aGlzSXRlbVdvcmxkUG9zaXRpb24ueSArICcgJyArIHRoaXNJdGVtV29ybGRQb3NpdGlvbi56O1xyXG5cclxuICAgIC8vIFJvdW5kIHRoZSBJdGVtJ3MgcG9zaXRpb24gdG8gdGhlIG5lYXJlc3QgMC41MCBmb3IgYSBiYXNpYyBcImdyaWQgc25hcHBpbmdcIiBlZmZlY3RcclxuXHRcdHZhciByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25YID0gTWF0aC5yb3VuZCh0aGlzSXRlbVdvcmxkUG9zaXRpb24ueCAqIDIpIC8gMjsgLy9yb3VuZCB0byBuZWFyZXN0IDAuNSBmb3IgZ2hldHRvIFwic25hcHBpbmdcIlxyXG5cdFx0dmFyIHJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblkgPSBNYXRoLnJvdW5kKHRoaXNJdGVtV29ybGRQb3NpdGlvbi55ICogMikgLyAyOyAvL3JvdW5kIHRvIG5lYXJlc3QgMC41IGZvciBnaGV0dG8gXCJzbmFwcGluZ1wiXHJcblx0XHR2YXIgcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWiA9IE1hdGgucm91bmQodGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLnogKiAyKSAvIDI7IC8vcm91bmQgdG8gbmVhcmVzdCAwLjUgZm9yIGdoZXR0byBcInNuYXBwaW5nXCJcclxuXHRcdHZhciByb3VuZGVkUG9zaXRpb25TdHJpbmcgPSByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25YICsgJyAwLjUwICcgKyByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25aO1xyXG5cclxuICAgIC8vIEZldGNoIHRoZSBjdXJyZW50IEl0ZW0ncyByb3RhdGlvbiBhbmQgY29udmVydCBpdCB0byBhIEV1bGVyIHN0cmluZ1xyXG5cdFx0dmFyIHRoaXNJdGVtV29ybGRSb3RhdGlvblggPSB0aGlzSXRlbVdvcmxkUm90YXRpb24uX3ggLyAoTWF0aC5QSSAvIDE4MCk7XHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSA9IHRoaXNJdGVtV29ybGRSb3RhdGlvbi5feSAvIChNYXRoLlBJIC8gMTgwKTtcclxuXHRcdHZhciB0aGlzSXRlbVdvcmxkUm90YXRpb25aID0gdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uLl96IC8gKE1hdGguUEkgLyAxODApO1xyXG5cdFx0dmFyIG9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZyA9IHRoaXNJdGVtV29ybGRSb3RhdGlvblggKyAnICcgKyB0aGlzSXRlbVdvcmxkUm90YXRpb25ZICsgJyAnICsgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWjtcclxuXHJcbiAgICAvLyBSb3VuZCB0aGUgSXRlbSdzIHJvdGF0aW9uIHRvIHRoZSBuZWFyZXN0IDkwIGRlZ3JlZXMgZm9yIGJhc2UgdHlwZSBvYmplY3RzXHJcblx0XHR2YXIgcm91bmRlZFRoaXNJdGVtV29ybGRSb3RhdGlvblkgPSBNYXRoLnJvdW5kKHRoaXNJdGVtV29ybGRSb3RhdGlvblkgLyA5MCkgKiA5MDsgLy8gcm91bmQgdG8gOTAgZGVncmVlc1xyXG5cdFx0dmFyIHJvdW5kZWRFdWxlclJvdGF0aW9uU3RyaW5nID0gMCArICcgJyArIHJvdW5kZWRUaGlzSXRlbVdvcmxkUm90YXRpb25ZICsgJyAnICsgMDsgLy8gaWdub3JlIHJvbGwgYW5kIHBpdGNoXHJcblxyXG4gICAgdmFyIG5ld0lkID0gJ29iamVjdCcgKyBvYmplY3RDb3VudDtcclxuXHJcbiAgICAkKCc8YS1lbnRpdHkgLz4nLCB7XHJcbiAgICAgIGlkOiBuZXdJZCxcclxuICAgICAgY2xhc3M6ICdjaXR5IG9iamVjdCBjaGlsZHJlbicsXHJcbiAgICAgIHNjYWxlOiBvYmplY3RBcnJheVtvYmplY3RJZF0uc2NhbGUsXHJcbiAgICAgIHJvdGF0aW9uOiByb3VuZGluZyA/IHJvdW5kZWRFdWxlclJvdGF0aW9uU3RyaW5nIDogb3JpZ2luYWxFdWxlclJvdGF0aW9uU3RyaW5nLFxyXG4gICAgICBmaWxlOiBvYmplY3RBcnJheVtvYmplY3RJZF0uZmlsZSxcclxuICAgICAgLy8gXCJwbHktbW9kZWxcIjogXCJzcmM6IHVybChuZXdfYXNzZXRzL1wiICsgb2JqZWN0QXJyYXlbb2JqZWN0SWRdLmZpbGUgKyBcIi5wbHkpXCIsXHJcbiAgICAgIFwib2JqLW1vZGVsXCI6IFwib2JqOiB1cmwoYXNzZXRzL29iai9cIiArIG9iamVjdEFycmF5W29iamVjdElkXS5maWxlICsgXCIub2JqKTsgbXRsOiB1cmwoYXNzZXRzL29iai9cIiArIG9iamVjdEFycmF5W29iamVjdElkXS5maWxlICsgXCIubXRsKVwiLFxyXG4gICAgICBhcHBlbmRUbyA6ICQoJyNjaXR5JylcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBuZXdPYmplY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChuZXdJZCk7XHJcbiAgICBuZXdPYmplY3Quc2V0QXR0cmlidXRlKFwicG9zaXRpb25cIiwgcm91bmRpbmcgPyByb3VuZGVkUG9zaXRpb25TdHJpbmcgOiBvcmlnaW5hbFBvc2l0aW9uU3RyaW5nKTsgLy8gdGhpcyBkb2VzIHNldCBwb3NpdGlvblxyXG5cclxuICAgIC8vIElmIHRoaXMgaXMgYSBcImJhc2VzXCIgdHlwZSBvYmplY3QsIGFuaW1hdGUgdGhlIHRyYW5zaXRpb24gdG8gdGhlIHNuYXBwZWQgKHJvdW5kZWQpIHBvc2l0aW9uIGFuZCByb3RhdGlvblxyXG4gICAgaWYgKHJvdW5kaW5nKSB7XHJcbiAgICAgIG5ld09iamVjdC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbicsIHsgcHJvcGVydHk6ICdyb3RhdGlvbicsIGR1cjogNTAwLCBmcm9tOiBvcmlnaW5hbEV1bGVyUm90YXRpb25TdHJpbmcsIHRvOiByb3VuZGVkRXVsZXJSb3RhdGlvblN0cmluZyB9KVxyXG4gICAgfTtcclxuXHJcbiAgICBuZXdPYmplY3Quc2V0QXR0cmlidXRlKFwiZmlyZWJhc2UtYnJvYWRjYXN0XCIsIFwiY29tcG9uZW50czogcG9zaXRpb24sIHNjYWxlLCByb3RhdGlvbiwgZmlsZSwgb2JqLW1vZGVsLCBjbGFzczsgcGVyc2lzdDogdHJ1ZVwiKTtcclxuXHJcblxyXG4gICAgLy8gSW5jcmVtZW50IHRoZSBvYmplY3QgY291bnRlciBzbyBzdWJzZXF1ZW50IG9iamVjdHMgaGF2ZSB0aGUgY29ycmVjdCBpbmRleFxyXG5cdFx0b2JqZWN0Q291bnQgKz0gMTtcclxuICB9LFxyXG5cclxuXHRvbk9iamVjdENoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc29sZS5sb2coXCJvbk9iamVjdENoYW5nZSB0cmlnZ2VyZWRcIik7XHJcblxyXG4gICAgLy8gRmV0Y2ggdGhlIEl0ZW0gZWxlbWVudCAodGhlIHBsYWNlYWJsZSBjaXR5IG9iamVjdCkgc2VsZWN0ZWQgb24gdGhpcyBjb250cm9sbGVyXHJcbiAgICB2YXIgdGhpc0l0ZW1JRCA9ICh0aGlzLmVsLmlkID09PSAnbGVmdENvbnRyb2xsZXInKSA/ICcjbGVmdEl0ZW0nOicjcmlnaHRJdGVtJztcclxuICAgIHZhciB0aGlzSXRlbUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzSXRlbUlEKTtcclxuXHJcbiAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLm1lbnVJZCk7XHJcblxyXG4gICAgLy8gV2hhdCdzIHRoZSB0eXBlIG9mIG9iamVjdCBjdXJyZW50bHkgc2VsZWN0ZWQ/IEZvciBleGFtcGxlLCBcIm1tbW1fYWxpZW5cIiBvciBcImJhc2VzXCJcclxuICAgIHZhciBvYmplY3RHcm91cCA9IG1lbnVFbC5jb21wb25lbnRzWydzZWxlY3QtYmFyJ10uZGF0YS5zZWxlY3RlZE9wdGdyb3VwVmFsdWU7XHJcblxyXG4gICAgLy8gR2V0IGFuIEFycmF5IG9mIGFsbCB0aGUgb2JqZWN0cyBvZiB0aGlzIHR5cGVcclxuICAgIHZhciBvYmplY3RBcnJheSA9IHRoaXMuZ3JvdXBKU09OQXJyYXlbb2JqZWN0R3JvdXBdO1xyXG5cclxuICAgIC8vIFdoYXQgaXMgdGhlIElEIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgaXRlbT9cclxuICAgIHZhciBuZXdPYmplY3RJZCA9IHBhcnNlSW50KG1lbnVFbC5jb21wb25lbnRzWydzZWxlY3QtYmFyJ10uZGF0YS5zZWxlY3RlZE9wdGlvbkluZGV4KTtcclxuICAgIHZhciBzZWxlY3RlZE9wdGlvblZhbHVlID0gbWVudUVsLmNvbXBvbmVudHNbJ3NlbGVjdC1iYXInXS5kYXRhLnNlbGVjdGVkT3B0aW9uVmFsdWU7XHJcblxyXG5cdFx0Ly8gU2V0IHRoZSBwcmV2aWV3IG9iamVjdCB0byBiZSB0aGUgY3VycmVudGx5IHNlbGVjdGVkIFwicHJldmlld1wiIGl0ZW1cclxuICAgIHRoaXNJdGVtRWwuc2V0QXR0cmlidXRlKCdvYmotbW9kZWwnLCB7IG9iajogXCJ1cmwoYXNzZXRzL29iai9cIiArIG9iamVjdEFycmF5W25ld09iamVjdElkXS5maWxlICsgXCIub2JqKVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdGw6IFwidXJsKGFzc2V0cy9vYmovXCIgKyBvYmplY3RBcnJheVtuZXdPYmplY3RJZF0uZmlsZSArIFwiLm10bClcIn0pO1xyXG5cdFx0dGhpc0l0ZW1FbC5zZXRBdHRyaWJ1dGUoJ3NjYWxlJywgb2JqZWN0QXJyYXlbbmV3T2JqZWN0SWRdLnNjYWxlKTtcclxuXHRcdHRoaXNJdGVtRWwuc2V0QXR0cmlidXRlKCdvYmplY3RJZCcsIG5ld09iamVjdElkKTtcclxuICAgIHRoaXNJdGVtRWwuc2V0QXR0cmlidXRlKCdvYmplY3RHcm91cCcsIG9iamVjdEdyb3VwKTtcclxuICAgIHRoaXNJdGVtRWwuZmx1c2hUb0RPTSgpO1xyXG5cdH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFVuZG8gLSBkZWxldGVzIHRoZSBtb3N0IHJlY2VudGx5IHBsYWNlZCBvYmplY3RcclxuICAgKi9cclxuICBvblVuZG86IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwcmV2aW91c09iamVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjb2JqZWN0XCIgKyAob2JqZWN0Q291bnQgLSAxKSk7XHJcblx0XHRwcmV2aW91c09iamVjdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHByZXZpb3VzT2JqZWN0KTtcclxuXHRcdG9iamVjdENvdW50IC09IDE7XHJcblx0XHRpZihvYmplY3RDb3VudCA9PSAtMSkge29iamVjdENvdW50ID0gMH07XHJcbiAgfVxyXG5cclxufSk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2xpYi9idWlsZGVyLWNvbnRyb2xzLmpzIiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUgKi9cclxuXHJcbi8qKlxyXG4gKiBMb2FkcyBhbmQgc2V0dXAgZ3JvdW5kIG1vZGVsLlxyXG4gKi9cclxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdncm91bmQnLCB7XHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG9iamVjdExvYWRlcjtcclxuICAgIHZhciBvYmplY3QzRCA9IHRoaXMuZWwub2JqZWN0M0Q7XHJcbiAgICAvLyB2YXIgTU9ERUxfVVJMID0gJ2h0dHBzOi8vY2RuLmFmcmFtZS5pby9saW5rLXRyYXZlcnNhbC9tb2RlbHMvZ3JvdW5kLmpzb24nO1xyXG4gICAgdmFyIE1PREVMX1VSTCA9ICdhc3NldHMvZW52aXJvbm1lbnQvZ3JvdW5kLmpzb24nO1xyXG4gICAgaWYgKHRoaXMub2JqZWN0TG9hZGVyKSB7IHJldHVybjsgfVxyXG4gICAgb2JqZWN0TG9hZGVyID0gdGhpcy5vYmplY3RMb2FkZXIgPSBuZXcgVEhSRUUuT2JqZWN0TG9hZGVyKCk7XHJcbiAgICBvYmplY3RMb2FkZXIuY3Jvc3NPcmlnaW4gPSAnJztcclxuICAgIG9iamVjdExvYWRlci5sb2FkKE1PREVMX1VSTCwgZnVuY3Rpb24gKG9iaikge1xyXG4gICAgICBvYmouY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB2YWx1ZS5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcclxuICAgICAgICB2YWx1ZS5tYXRlcmlhbC5zaGFkaW5nID0gVEhSRUUuRmxhdFNoYWRpbmc7XHJcbiAgICAgIH0pO1xyXG4gICAgICBvYmplY3QzRC5hZGQob2JqKTtcclxuICAgIH0pO1xyXG4gIH1cclxufSk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2xpYi9ncm91bmQuanMiLCIvKiBnbG9iYWwgQUZSQU1FICovXHJcbkFGUkFNRS5yZWdpc3RlclNoYWRlcignc2t5R3JhZGllbnQnLCB7XHJcbiAgc2NoZW1hOiB7XHJcbiAgICBjb2xvclRvcDogeyB0eXBlOiAnY29sb3InLCBkZWZhdWx0OiAnYmxhY2snLCBpczogJ3VuaWZvcm0nIH0sXHJcbiAgICBjb2xvckJvdHRvbTogeyB0eXBlOiAnY29sb3InLCBkZWZhdWx0OiAncmVkJywgaXM6ICd1bmlmb3JtJyB9XHJcbiAgfSxcclxuXHJcbiAgdmVydGV4U2hhZGVyOiBbXHJcbiAgICAndmFyeWluZyB2ZWMzIHZXb3JsZFBvc2l0aW9uOycsXHJcblxyXG4gICAgJ3ZvaWQgbWFpbigpIHsnLFxyXG5cclxuICAgICAgJ3ZlYzQgd29ybGRQb3NpdGlvbiA9IG1vZGVsTWF0cml4ICogdmVjNCggcG9zaXRpb24sIDEuMCApOycsXHJcbiAgICAgICd2V29ybGRQb3NpdGlvbiA9IHdvcmxkUG9zaXRpb24ueHl6OycsXHJcblxyXG4gICAgICAnZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNCggcG9zaXRpb24sIDEuMCApOycsXHJcblxyXG4gICAgJ30nXHJcblxyXG4gIF0uam9pbignXFxuJyksXHJcblxyXG4gIGZyYWdtZW50U2hhZGVyOiBbXHJcbiAgICAndW5pZm9ybSB2ZWMzIGNvbG9yVG9wOycsXHJcbiAgICAndW5pZm9ybSB2ZWMzIGNvbG9yQm90dG9tOycsXHJcblxyXG4gICAgJ3ZhcnlpbmcgdmVjMyB2V29ybGRQb3NpdGlvbjsnLFxyXG5cclxuICAgICd2b2lkIG1haW4oKScsXHJcblxyXG4gICAgJ3snLFxyXG4gICAgICAndmVjMyBwb2ludE9uU3BoZXJlID0gbm9ybWFsaXplKHZXb3JsZFBvc2l0aW9uLnh5eik7JyxcclxuICAgICAgJ2Zsb2F0IGYgPSAxLjA7JyxcclxuICAgICAgJ2lmKHBvaW50T25TcGhlcmUueSA+IC0gMC4yKXsnLFxyXG5cclxuICAgICAgICAnZiA9IHNpbihwb2ludE9uU3BoZXJlLnkgKiAyLjApOycsXHJcblxyXG4gICAgICAnfScsXHJcbiAgICAgICdnbF9GcmFnQ29sb3IgPSB2ZWM0KG1peChjb2xvckJvdHRvbSxjb2xvclRvcCwgZiApLCAxLjApOycsXHJcblxyXG4gICAgJ30nXHJcbiAgXS5qb2luKCdcXG4nKVxyXG59KTtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL3NreUdyYWRpZW50LmpzIl0sInNvdXJjZVJvb3QiOiIifQ==