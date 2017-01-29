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
	  return window.XMLHttpRequest && "withCredentials" in new XMLHttpRequest
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
	  
	  if (typeof window.XMLHttpRequest === 'undefined')
	    throw new Error('your browser does not support XHR loading')
	
	  //IE9 and XML1 browsers could still use an override
	  var req = new window.XMLHttpRequest()
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
	
	if (typeof AFRAME === 'undefined') {
	  throw new Error('Component attempted to register before AFRAME was available.');
	}
	
	var optionJSON = []; // ghetto way to declare global var for available options and option groups
	
	
	AFRAME.registerComponent('select-bar', {
	  schema: {
	    controls: { type: 'boolean', default: true },
	    controllerID: { type: 'string', default: "rightController" }
	  },
	
	  fetchOptionGroups: function fetchOptionGroups() {
	    var selectEl = this.el; // Reference to the component's entity.
	    var optgroups = selectEl.getElementsByTagName("optgroup"); // Get the optgroups
	    console.log(optgroups);
	    var selectedOptgroup = optgroups[0]; // TODO: for now, just get the first optgroup, eventually iterate through them
	
	    Array.from(optgroups).forEach(function (element, index) {
	      optionJSON[element.getAttribute("value")] = element; // this populates optionJSON with optgroup elements stored as keys of the "value" attribute
	    });
	
	    return optionJSON;
	  },
	
	  init: function init() {
	    // Create select bar menu from html child `option` elements beneath parent entity per html5 spec: http://www.w3schools.com/tags/tag_optgroup.asp
	
	    var selectEl = this.el; // Reference to the component's entity.
	    // var optgroups = selectEl.getElementsByTagName("optgroup");  // Get the optgroups
	    // var selectedOptgroup = optgroups[0];    // TODO: for now, just get the first optgroup, eventually iterate through them
	
	    selectedOptgroup = this.fetchOptionGroups()['mmmm_alien'];
	
	    // Create the "frame" of the select menu bar
	    var selectRenderEl = document.createElement("a-entity");
	    selectRenderEl.id = "selectRender";
	    selectRenderEl.innerHTML = '\n      <a-box id="menuFrame" scale="0.4 0.15 0.005" position="0 0 -0.0075"  material="opacity: 0.5; transparent: true; color: #000000"></a-box>\n      <a-entity id="groupText" position="-0.18 0.045 -0.003" scale="0.125 0.125 0.125" bmfont-text="text: ' + selectedOptgroup.getAttribute('label') + '; color: #747474"></a-entity>\n      <a-entity id="arrowRight" position="0.225 0 0" rotation="90 180 0" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>\n      <a-entity id="arrowLeft" position="-0.225 0 0" rotation="90 180 0" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity:0.5; transparent:true; color:#000000"></a-entity>\n      <a-entity id="arrowUp" position="0 0.1 0" rotation="0 270 90" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>\n      <a-entity id="arrowDown" position="0 -0.1 0" rotation="0 270 90" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>\n      <a-entity id="menuObjectList"></a-entity>\n      ';
	    selectEl.appendChild(selectRenderEl);
	
	    // What are the select menu options provided in the html? Assumes lists of 7 or greater!
	    // 5 or 6 may work, needs testing
	    // 4 and below should be no scroll
	    var optionsElements = selectedOptgroup.getElementsByTagName("option"); // the actual JS children elements
	    // console.log(optionsElements);
	    // var optionsElements = [0,1,2,3,4,5,6,7,8,9,10];
	
	    // convert the NodeList of matching option elements into a Javascript Array
	    var optionsElementsArray = Array.prototype.slice.call(selectedOptgroup.getElementsByTagName("option"));
	
	    var firstArray = optionsElementsArray.slice(0, 4); // get items 0 - 4
	    var previewArray = optionsElementsArray.slice(-3); // get the 3 LAST items of the array
	
	    // Combine into "menuArray", a list of currently visible options where the middle index is the currently selected object
	    var menuArray = previewArray.concat(firstArray);
	
	    var selectOptionsHTML = "";
	    var startPositionX = -0.225;
	    var deltaX = 0.075;
	
	    // For each menu option, create a preview element and its appropriate children
	    menuArray.forEach(function (element, menuArrayIndex) {
	      //      console.log(menuArrayIndex);
	      //      console.log(element.getAttribute("value"));
	      var visible = menuArrayIndex === 0 || menuArrayIndex === 6 ? false : true;
	      var selected = menuArrayIndex === 3;
	      selectOptionsHTML += '\n      <a-entity id="menu' + element.getAttribute("index") + '" visible="' + visible + '" class="preview' + (selected ? " selected" : "") + '" optionid="' + element.getAttribute("index") + '" value="' + element.getAttribute("value") + '" optgroup="' + selectedOptgroup.getAttribute("value") + '" position="' + startPositionX + ' 0 0">\n        <a-box class="previewFrame" position="0 0 -0.003" scale="0.06 0.06 0.005" material="color: ' + (selected ? "yellow" : "#222222") + '"></a-box>\n        <a-image class="previewImage" scale="0.05 0.05 0.05" src="' + element.getAttribute("src") + '" ></a-image>\n        <a-entity class="objectName" position="-0.025 -0.04 -0.003" scale="0.05 0.05 0.05" bmfont-text="text: ' + element.text + '; color: ' + (selected ? "yellow" : "#747474") + '"></a-entity>\n      </a-entity>';
	      startPositionX += deltaX;
	    });
	
	    // Append these menu options to a new element with id of "selectOptionsRow"
	    var selectOptionsRowEl = document.createElement("a-entity");
	    selectOptionsRowEl.id = "selectOptionsRow";
	    selectOptionsRowEl.innerHTML = selectOptionsHTML;
	    selectRenderEl.appendChild(selectOptionsRowEl);
	  },
	
	  addEventListeners: function addEventListeners() {
	    // If controls = true and a controllerID has been provided, then add controller event listeners
	    if (this.data.controls && this.data.controllerID) {
	      controllerEl = document.getElementById(this.data.controllerID);
	      controllerEl.addEventListener('trackpaddown', this.onOptionSwitch.bind(this));
	      controllerEl.addEventListener('axismove', this.onAxisMove.bind(this));
	    }
	
	    var el = this.el;
	    el.addEventListener('onHoverLeft', this.onHoverLeft.bind(this));
	    el.addEventListener('onHoverRight', this.onHoverRight.bind(this));
	    el.addEventListener('onOptionSwitch', this.onOptionSwitch.bind(this));
	    // el.addEventListener('onOptionNext', function(){this.onOptionSwitch("next").bind(this)}.bind(this) );
	    // el.addEventListener('onOptionPrevious', this.onOptionSwitch("previous").bind(this));
	  },
	
	  /**
	   * Remove event listeners.
	   */
	  removeEventListeners: function removeEventListeners() {
	    if (this.data.controls && this.data.controllerID) {
	      controllerEl = document.getElementById(this.data.controllerID);
	      controllerEl.removeEventListener('trackpaddown', this.onOptionSwitch);
	      controllerEl.removeEventListener('axismove', this.onAxisMove);
	    }
	
	    var el = this.el;
	    el.removeEventListener('onOptionSwitch', this.onOptionSwitch);
	    el.removeEventListener('onHoverRight', this.onHoverRight);
	    el.removeEventListener('onHoverLeft', this.onHoverLeft);
	    // el.removeEventListener('onOptionNext', this.onOptionSwitch);
	    // el.removeEventListener('onOptionPrevious', this.onOptionSwitch);
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
	    if (evt.detail.axis[0] === 0 && evt.detail.axis[1] === 0) {
	      return;
	    }
	    // console.log("axis[0]: " + evt.detail.axis[0]); // left -1; right +1
	    // console.log("axis[1]: " + evt.detail.axis[1]); // down -1; up +1
	    // console.log(evt.target.id);
	
	    // TODO: this should reflect the parent element //menu: only deal with trackpad events from right controller
	    if (evt.target.id === 'leftController') {
	      return;
	    }
	
	    if (evt.detail.axis[0] > 0) {
	      this.onHoverRight();
	    } else {
	      this.onHoverLeft();
	    }
	  },
	
	  onHoverRight: function onHoverRight() {
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
	
	  onOptionSwitch: function onOptionSwitch(evt, direction) {
	    // Switch to the next option, or switch in the direction of the most recently hovered directional arrow
	    // menu: save the currently selected menu element
	    var oldMenuEl = document.getElementById('selectOptionsRow').getElementsByClassName('selected')[0];
	    console.log(oldMenuEl);
	
	    var oldSelectedOptionIndex = parseInt(oldMenuEl.getAttribute("optionid"));
	    console.log(selectedOptionIndex);
	    var selectedOptionIndex = oldSelectedOptionIndex;
	
	    if (typeof direction === 'undefined') {
	      // should we switch to next or previous option?
	      var leftButton = new THREE.Color(document.getElementById("arrowRight").getAttribute("material").color).g < new THREE.Color(document.getElementById("arrowLeft").getAttribute("material").color).g;
	      direction = leftButton ? "previous" : "next";
	      console.log("leftButton? " + leftButton);
	      console.log("direction? " + direction);
	    }
	
	    // TODO: this should reflect the parent element //menu: only deal with trackpad events from right controller
	    if (evt.target.id === 'leftController') {
	      return;
	    }
	
	    var selectEl = this.el; // Reference to the component's entity.
	    var selectedOptgroupEl = this.fetchOptionGroups()['mmmm_alien']; // TODO selected Optgroup should be dynamic
	
	    //optgroup is an element
	    console.log(selectedOptgroupEl);
	    console.log(selectedOptgroupEl.childElementCount);
	
	    if (direction == 'previous') {
	      // LEFT BUTTON MENU START ===============================
	      selectedOptionIndex -= 1;
	      if (selectedOptionIndex == -1) {
	        selectedOptionIndex = selectedOptgroupEl.childElementCount - 1;
	      }
	
	      // menu: animate arrow LEFT
	      var arrowLeft = document.getElementById("arrowLeft");
	      arrowLeft.removeAttribute('animation__color');
	      arrowLeft.removeAttribute('animation__opacity');
	      arrowLeft.removeAttribute('animation__scale');
	      arrowLeft.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FFFF00", to: "#000000" });
	      arrowLeft.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
	      arrowLeft.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "0.006 0.003 0.006", to: "0.004 0.002 0.004" });
	
	      // menu: get the newly selected menu element
	      console.log(selectedOptionIndex);
	      var newMenuEl = document.getElementById('selectOptionsRow').querySelectorAll("[optionid='" + selectedOptionIndex + "']")[0];
	      console.log(newMenuEl);
	
	      // menu: remove selected class and change colors
	      oldMenuEl.classList.remove("selected");
	      newMenuEl.classList.add("selected");
	      oldMenuEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'color', 'gray');
	      newMenuEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'color', 'yellow');
	      oldMenuEl.getElementsByClassName("previewFrame")[0].setAttribute('material', 'color', '#222222');
	      newMenuEl.getElementsByClassName("previewFrame")[0].setAttribute('material', 'color', 'yellow');
	
	      // menu: slide the menu list row RIGHT by 1
	      var selectOptionsRowEl = document.querySelector("#selectOptionsRow");
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
	      var newlyVisibleOptionIndex = oldSelectedOptionIndex - 3;
	      if (newlyVisibleOptionIndex < 0) {
	        newlyVisibleOptionIndex = selectedOptgroupEl.childElementCount - 3 + oldSelectedOptionIndex;
	      };
	      var newlyVisibleOptionEl = document.getElementById('selectOptionsRow').querySelectorAll("[optionid='" + newlyVisibleOptionIndex + "']")[0];
	
	      // make visible and animate
	      newlyVisibleOptionEl.setAttribute('visible', 'true');
	      newlyVisibleOptionEl.removeAttribute('animation');
	      newlyVisibleOptionEl.setAttribute('animation', { property: 'scale', dur: 500, from: '0.5 0.5 0.5', to: '1.0 1.0 1.0' });
	
	      // menu: destroy the hidden most RIGHTmost object (+3 from oldMenuEl index)
	      var newlyRemovedOptionIndex = oldSelectedOptionIndex + 3;
	      if (newlyRemovedOptionIndex > selectedOptgroupEl.childElementCount) {
	        newlyRemovedOptionIndex = oldSelectedOptionIndex + 3 - selectedOptgroupEl.childElementCount;
	      };
	      var newlyRemovedOptionEl = document.getElementById('selectOptionsRow').querySelectorAll("[optionid='" + newlyRemovedOptionIndex + "']")[0];
	      newlyRemovedOptionEl.parentNode.removeChild(newlyRemovedOptionEl);
	
	      // menu: make the second RIGHTmost object (+2 from oldMenuEl index) invisible
	      var newlyInvisibleOptionIndex = oldSelectedOptionIndex + 2;
	      if (newlyInvisibleOptionIndex > selectedOptgroupEl.childElementCount) {
	        newlyInvisibleOptionIndex = oldSelectedOptionIndex + 2 - selectedOptgroupEl.childElementCount;
	      };
	      var newlyInvisibleOptionEl = document.getElementById('selectOptionsRow').querySelectorAll("[optionid='" + newlyInvisibleOptionIndex + "']")[0];
	      newlyInvisibleOptionEl.setAttribute('visible', 'false');
	
	      // menu: Create the next LEFTmost object preview (-4 from oldMenuEl index) but keep it hidden until it's needed
	      var newlyCreatedOptionEl = newlyVisibleOptionEl.cloneNode(true);
	      newlyCreatedOptionEl.setAttribute('visible', 'false');
	
	      var newlyCreatedOptionIndex = oldSelectedOptionIndex - 4;
	      if (newlyCreatedOptionIndex < 0) {
	        newlyCreatedOptionIndex = selectedOptgroupEl.childElementCount - 4 + oldSelectedOptionIndex;
	      };
	
	      // get the actual "option" element that is the source of truth for value, image src and label so that we can populate the new menu option
	      var sourceOptionEl = selectedOptgroupEl.querySelectorAll("[index='" + newlyCreatedOptionIndex + "']")[0];
	
	      newlyCreatedOptionEl.setAttribute('optionid', newlyCreatedOptionIndex);
	      newlyCreatedOptionEl.setAttribute('id', 'menu' + newlyCreatedOptionIndex);
	      newlyCreatedOptionEl.setAttribute('value', sourceOptionEl.getAttribute("value"));
	
	      var newlyVisibleOptionPosition = newlyVisibleOptionEl.object3D.position;
	      newlyCreatedOptionEl.setAttribute('position', newlyVisibleOptionPosition.x - 0.075 + " " + newlyVisibleOptionPosition.y + " " + newlyVisibleOptionPosition.z);
	
	      // menu: add the newly cloned and modified menu object preview to the dom
	      selectOptionsRowEl.insertBefore(newlyCreatedOptionEl, selectOptionsRowEl.firstChild); /// TODO YO IS THIS NOT WORKING?
	
	      // menu: get child elements for image and name, populate both appropriately
	      console.log(newlyCreatedOptionIndex);
	      var appendedNewlyCreatedOptionEl = document.getElementById("menu" + newlyCreatedOptionIndex);
	      console.log(appendedNewlyCreatedOptionEl);
	
	      appendedNewlyCreatedOptionEl.getElementsByClassName("previewImage")[0].setAttribute('src', sourceOptionEl.getAttribute("src"));
	      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'text', sourceOptionEl.text);
	      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'color', '#747474');
	
	      // LEFT MENU END ===============================
	    } else {
	      // Increment by 1 and start over at 0 if reached the end
	      objectId += 1;
	      if (objectId == objectArray.length) {
	        objectId = 0;
	      }
	
	      // RIGHT BUTTON MENU START ===============================
	      // menu: animate arrow right
	      var arrowRight = document.getElementById("arrowRight");
	      arrowRight.removeAttribute('animation__color');
	      arrowRight.removeAttribute('animation__opacity');
	      arrowRight.removeAttribute('animation__scale');
	      arrowRight.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FFFF00", to: "#000000" });
	      arrowRight.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
	      arrowRight.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "-0.006 0.003 0.006", to: "-0.004 0.002 0.004" });
	
	      // menu: get the newly selected menu element
	      var _newMenuEl = $("a-entity#menuObjectList").find("a-entity[objectId=" + objectId + "]");
	
	      // menu: remove selected class and change colors
	      oldMenuEl.removeClass("selected");
	      _newMenuEl.addClass("selected");
	      oldMenuEl.children(".objectName")[0].setAttribute('bmfont-text', 'color', 'gray');
	      _newMenuEl.children(".objectName")[0].setAttribute('bmfont-text', 'color', 'yellow');
	      oldMenuEl.children(".previewFrame")[0].setAttribute('material', 'color', '#222222');
	      _newMenuEl.children(".previewFrame")[0].setAttribute('material', 'color', 'yellow');
	
	      // menu: slide the menu list left by 1
	      var _selectOptionsRowEl = document.querySelector("#menuObjectList");
	      // use the desiredPosition attribute (if exists) instead of object3D position as animation may not be done yet
	      if (_selectOptionsRowEl.hasAttribute("desiredPosition")) {
	        var oldPosition = _selectOptionsRowEl.getAttribute("desiredPosition");
	        var newX = parseFloat(oldPosition.split(" ")[0]) - 0.075;
	        var newPositionString = newX.toString() + " " + oldPosition.split(" ")[1] + " " + oldPosition.split(" ")[2];
	      } else {
	        var oldPosition = _selectOptionsRowEl.object3D.position;
	        var newX = oldPosition.x - 0.075; // this should be a variable soon
	        var newPositionString = newX.toString() + " " + oldPosition.y + " " + oldPosition.z;
	      }
	      _selectOptionsRowEl.removeAttribute('animation__slide');
	      _selectOptionsRowEl.setAttribute('animation__slide', { property: 'position', dur: 500, from: oldPosition, to: newPositionString });
	      _selectOptionsRowEl.setAttribute('desiredPosition', newPositionString);
	
	      // menu: make the hidden most rightmost object (+3 from oldMenuEl index) visible
	      var thirdMenuEl = oldMenuEl[0].nextElementSibling.nextElementSibling.nextElementSibling;
	
	      thirdMenuEl.setAttribute('visible', 'true');
	
	      // TODO NOT WORKING AFTER FIRST ITERATION
	      // thirdMenuEl.removeAttribute('animation');
	      thirdMenuEl.setAttribute('animation', { property: 'scale', dur: 500, from: '0.5 0.5 0.5', to: '1.0 1.0 1.0' });
	
	      // menu: destroy the hidden most leftmost object (-3 from oldMenuEl index)
	      var negThirdMenuEl = oldMenuEl[0].previousElementSibling.previousElementSibling.previousElementSibling;
	      negThirdMenuEl.parentNode.removeChild(negThirdMenuEl);
	
	      // menu: make the second leftmost object (-2 from oldMenuEl index) invisible
	      var negSecondMenuEl = oldMenuEl[0].previousElementSibling.previousElementSibling;
	      negSecondMenuEl.setAttribute('visible', 'false');
	
	      // menu: Create the next rightmost object preview (+4 from oldMenuEl index) but keep it hidden until it's needed
	      var fourthMenuEl = thirdMenuEl.cloneNode(true);
	      fourthMenuEl.setAttribute('visible', 'false');
	      // if objectId + 3 < length then use this number
	      // if objectId + 3 > length, then use this requested number minus the length of the object array
	      var fourthMenuObjectID = objectId + 3 < objectArray.length ? objectId + 3 : objectId + 3 - objectArray.length;
	      fourthMenuEl.setAttribute('objectId', fourthMenuObjectID);
	      fourthMenuEl.setAttribute('id', 'menu' + fourthMenuObjectID);
	      fourthMenuEl.setAttribute('file', objectArray[fourthMenuObjectID].file);
	      thirdMenuElPosition = thirdMenuEl.object3D.position;
	      fourthMenuEl.setAttribute('position', thirdMenuElPosition.x + 0.075 + " " + thirdMenuElPosition.y + " " + thirdMenuElPosition.z);
	
	      // menu: add the newly cloned and modified menu object preview
	      _selectOptionsRowEl.appendChild(fourthMenuEl);
	
	      // menu: get child elements for image and name, populate both appropriately
	      var appendedFourthMenuEl = $('#menu' + fourthMenuObjectID);
	
	      appendedFourthMenuEl.children(".previewImage")[0].setAttribute('src', 'assets/preview/' + objectArray[fourthMenuObjectID].file + '.jpg');
	      appendedFourthMenuEl.children(".objectName")[0].setAttribute('bmfont-text', 'text', humanize(objectArray[fourthMenuObjectID].file));
	      appendedFourthMenuEl.children(".objectName")[0].setAttribute('bmfont-text', 'color', '#747474');
	      // RIGHT BUTTON MENU END ===============================
	    }
	  }
	
	});
	
	/*
	
	Original Menu html

	<a-entity id="menu" scale="0.7 0.7 0.7" position="0 0.05 0.08" rotation="-85 0 0">
	     <a-box id="menuFrame" scale="0.4 0.15 0.005" position="0 0 -0.0075"  material="opacity: 0.5; transparent: true; color: #000000"></a-box>
	     <a-entity id="groupText" position="-0.18 0.045 -0.003" scale="0.125 0.125 0.125" bmfont-text="text: ALIENS; color: #747474"></a-entity>

	     <a-entity id="arrowRight" position="0.225 0 0" rotation="90 180 0" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>
	     <a-entity id="arrowLeft" position="-0.225 0 0" rotation="90 180 0" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity:0.5; transparent:true; color:#000000"></a-entity>
	     <a-entity id="arrowUp" position="0 0.1 0" rotation="0 270 90" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>
	     <a-entity id="arrowDown" position="0 -0.1 0" rotation="0 270 90" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>

	     <a-entity id="menuObjectList">
	       <a-entity id="menu32" visible="false" class="preview" objectId="32" file="alien_tool1" objectGroup="mmmm_alien" position="-0.225 0 0">
	         <a-box class="previewFrame" position="0 0 -0.003" scale="0.06 0.06 0.005" material="color: #222222"></a-box>
	         <a-image class="previewImage" scale="0.05 0.05 0.05" src="assets/preview/alien_tool1.jpg" ></a-image>
	         <a-entity class="objectName" position="-0.025 -0.04 -0.003" scale="0.05 0.05 0.05" bmfont-text="text: Alien Tool1; color: #747474"></a-entity>
	       </a-entity>

	       <a-entity id="menu33" class="preview" objectId="33" file="alien_tool2" objectGroup="mmmm_alien" position="-0.15 0 0">
	         <a-box class="previewFrame" position="0 0 -0.003" scale="0.06 0.06 0.005" material="color: #222222"></a-box>
	         <a-image class="previewImage" scale="0.05 0.05 0.05" src="assets/preview/alien_tool2.jpg" ></a-image>
	         <a-entity class="objectName" position="-0.025 -0.04 -0.003" scale="0.05 0.05 0.05" bmfont-text="text: Alien Tool2; color: #747474"></a-entity>
	       </a-entity>

	       <a-entity id="menu34" class="preview" objectId="34" file="alien_tool3" objectGroup="mmmm_alien" position="-0.075 0 0">
	         <a-box class="previewFrame" position="0 0 -0.003" scale="0.06 0.06 0.005" material="color: #222222"></a-box>
	         <a-image class="previewImage" scale="0.05 0.05 0.05" src="assets/preview/alien_tool3.jpg" ></a-image>
	         <a-entity class="objectName" position="-0.025 -0.04 -0.003" scale="0.05 0.05 0.05" bmfont-text="text: Alien Tool3; color: #747474"></a-entity>
	       </a-entity>

	       <a-entity id="menu0" class="preview selected" objectId="0" file="alien_bot1" objectGroup="mmmm_alien" position="0 0 0">
	         <a-box class="previewFrame" position="0 0 -0.003" scale="0.06 0.06 0.005" material="color: yellow"></a-box>
	         <a-image class="previewImage" scale="0.05 0.05 0.05" src="assets/preview/alien_bot1.jpg" ></a-image>
	         <a-entity class="objectName" position="-0.025 -0.04 -0.003" scale="0.05 0.05 0.05" bmfont-text="text: Alien Bot1; color: yellow; opacity: 2"></a-entity>
	       </a-entity>

	       <a-entity id="menu1" class="preview" objectId="1" file="alien_bot2" objectGroup="mmmm_alien" position="0.075 0 0">
	         <a-box class="previewFrame" position="0 0 -0.003" scale="0.06 0.06 0.005" material="color: #222222"></a-box>
	         <a-image class="previewImage" scale="0.05 0.05 0.05" src="assets/preview/alien_bot2.jpg" ></a-image>
	         <a-entity class="objectName" position="-0.025 -0.04 -0.003" scale="0.05 0.05 0.05" bmfont-text="text: Alien Bot2; color: #747474"></a-entity>
	       </a-entity>

	       <a-entity id="menu2" class="preview" objectId="2" file="alien_bot3" objectGroup="mmmm_alien" position="0.15 0 0">
	         <a-box class="previewFrame" position="0 0 -0.003" scale="0.06 0.06 0.005" material="color: #222222"></a-box>
	         <a-image class="previewImage" scale="0.05 0.05 0.05" src="assets/preview/alien_bot3.jpg" ></a-image>
	         <a-entity class="objectName" position="-0.025 -0.04 -0.003" scale="0.05 0.05 0.05" bmfont-text="text: Alien Bot3; color: #747474"></a-entity>
	       </a-entity>

	       <a-entity id="menu3" visible="false" class="preview" objectId="3" file="alien_crawl1" objectGroup="mmmm_alien" position="0.225 0 0">
	         <a-box class="previewFrame" position="0 0 -0.003" scale="0.06 0.06 0.005" material="color: #222222"></a-box>
	         <a-image class="previewImage" scale="0.05 0.05 0.05" src="assets/preview/alien_crawl1.jpg" ></a-image>
	         <a-entity class="objectName" position="-0.025 -0.04 -0.003" scale="0.05 0.05 0.05" bmfont-text="text: Alien Crawl1; color: #747474"></a-entity>
	       </a-entity>
	     </a-entity>

	 </a-entity>

	</a-entity>



	*/

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
	  for (i = 0; i < frags.length; i++) {
	    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
	  }
	  return frags.join(' ');
	}
	
	var objectDataStore = function () {
	  var objectJSON = [];
	  console.log("objectJSON var initialized");
	
	  $.ajax({
	    type: "GET",
	    url: "assets/mmmm_alien.json",
	    dataType: "json",
	    success: function success(data) {
	      objectJSON['mmmm_alien'] = data;
	      console.log("objectJSON loaded:");
	      console.log("objectJSON = " + objectJSON);
	      console.log(objectJSON);
	    }
	  });
	
	  $.ajax({
	    type: "GET",
	    url: "assets/mmmm_veh.json",
	    dataType: "json",
	    success: function success(data) {
	      objectJSON['mmmm_veh'] = data;
	      console.log("objectJSON loaded:");
	      console.log("objectJSON = " + objectJSON);
	      console.log(objectJSON);
	    }
	  });
	
	  $.ajax({
	    type: "GET",
	    url: "assets/kfarr_bases.json",
	    dataType: "json",
	    success: function success(data) {
	      objectJSON['kfarr_bases'] = data;
	      console.log("objectJSON loaded:");
	      console.log("objectJSON = " + objectJSON);
	      console.log(objectJSON);
	    }
	  });
	
	  return { fetchJSON: function fetchJSON(objectGroup) {
	      console.log("fetchJSON fired");
	      if (objectJSON) return objectJSON[objectGroup];
	      return false; // else show some error that it isn't loaded yet;
	    } };
	}();
	
	/**
	 * Vive Controller Template component for A-Frame.
	 * Modifed from A-Frame Dominoes.
	 */
	AFRAME.registerComponent('builder-controls', {
	  schema: {},
	
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
	    el.addEventListener('menudown', this.onObjectPrevious.bind(this));
	    // Vive specific controls
	    //		el.addEventListener('trackpaddown', this.onObjectNext.bind(this));
	    // Oculus Touch specific controls
	    el.addEventListener('Xdown', this.onObjectNext.bind(this));
	    // el.addEventListener('Adown', this.onObjectNext.bind(this));
	
	    // menu: used for determining current axis of trackpad hover position
	    // this.el.addEventListener('axismove', function (evt) {
	    //   if (evt.detail.axis[0] === 0 && evt.detail.axis[1] === 0) {
	    //     return;
	    //   }
	    //
	    //   // menu: only deal with trackpad events from right controller
	    //   // if (evt.target.id === 'leftController') {
	    //   //   return;
	    //   // }
	    //
	    //   if (evt.detail.axis[0] > 0) {
	    //     var arrow = document.getElementById("arrowRight");
	    //   } else {
	    //     var arrow = document.getElementById("arrowLeft");
	    //   }
	    //
	    //   var currentArrowColor = new THREE.Color(arrow.getAttribute("material").color);
	    //
	    //   if (currentArrowColor.r === 0) { // if not already some shade of yellow (which indicates recent button press) then animate green hover
	    //
	    //     // if using the oculus rift and the thumbstick is >85% in either right/left direction then fire a trackpaddown event
	    //     var gamepads = navigator.getGamepads();
	    //     // here check if oculus controller, emit trackpaddown
	    //     if (gamepads) {
	    //       for (var i = 0; i < gamepads.length; i++) {
	    //         var gamepad = gamepads[i];
	    //         if (gamepad) {
	    //           if (gamepad.id.indexOf('Oculus Touch') === 0) {
	    //             if (Math.abs(evt.detail.axis[0]) > 0.85) {
	    //               this.emit('trackpaddown');
	    //               return;   // only fire on first touch controller match, as there are 2
	    //             }
	    //           }
	    //         }
	    //       }
	    //     }
	    //
	    //   }
	    //
	    // });
	  },
	
	  /**
	   * Remove event listeners.
	   */
	  removeEventListeners: function removeEventListeners() {
	    var el = this.el;
	    el.removeEventListener('triggerdown', this.onPlaceObject);
	    el.removeEventListener('gripdown', this.onUndo);
	    el.removeEventListener('menudown', this.onObjectPrevious);
	    el.removeEventListener('trackpaddown', this.onObjectNext);
	    el.removeEventListener('Xdown', this.onObjectNext);
	    // el.removeEventListener('Adown', this.onObjectNext);
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
	    var objectArray = objectDataStore.fetchJSON(objectGroup);
	
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
	
	    newObject = document.getElementById(newId);
	    newObject.setAttribute("position", rounding ? roundedPositionString : originalPositionString); // this does set position
	
	    // If this is a "bases" type object, animate the transition to the snapped (rounded) position and rotation
	    if (rounding) {
	      newObject.setAttribute('animation', { property: 'rotation', dur: 500, from: originalEulerRotationString, to: roundedEulerRotationString });
	    };
	
	    // Increment the object counter so subsequent objects have the correct index
	    objectCount += 1;
	  },
	
	  onObjectNext: function onObjectNext() {
	    return;
	    // switch between the available object or bases
	
	    // Fetch the Item element (the placeable city object) selected on this controller
	    var thisItemID = this.el.id === 'leftController' ? '#leftItem' : '#rightItem';
	    var thisItemEl = document.querySelector(thisItemID);
	
	    // What's the type of object currently selected? For example, "mmmm_alien" or "bases"
	    var objectGroup = thisItemEl.attributes.objectGroup.value;
	
	    // Get an Array of all the objects of this type
	    var objectArray = objectDataStore.fetchJSON(objectGroup);
	
	    // What is the ID of the currently selected item?
	    var objectId = parseInt(thisItemEl.attributes.objectId.value);
	
	    // menu: save the currently selected menu element
	    var oldMenuEl = $("a-entity#menuObjectList").find("a-entity[objectId=" + objectId + "]");
	
	    // should we switch left or right?
	    var leftButton = new THREE.Color(document.getElementById("arrowRight").getAttribute("material").color).g < new THREE.Color(document.getElementById("arrowLeft").getAttribute("material").color).g;
	    console.log("leftButton? " + leftButton);
	
	    // IF RIGHT CONTROLLER
	    if (this.el.id === 'rightController') {
	      // TEST FOR LEFT OR RIGHT BUTTON PRESS
	      if (leftButton) {
	
	        // LEFT BUTTON MENU START ===============================
	        objectId -= 1;
	        if (objectId == -1) {
	          objectId = objectArray.length - 1;
	        }
	
	        // menu: animate arrow LEFT
	        var arrowLeft = document.getElementById("arrowLeft");
	        arrowLeft.removeAttribute('animation__color');
	        arrowLeft.removeAttribute('animation__opacity');
	        arrowLeft.removeAttribute('animation__scale');
	        arrowLeft.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FFFF00", to: "#000000" });
	        arrowLeft.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
	        arrowLeft.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "0.006 0.003 0.006", to: "0.004 0.002 0.004" });
	
	        // menu: get the newly selected menu element
	        var newMenuEl = $("a-entity#menuObjectList").find("a-entity[objectId=" + objectId + "]");
	
	        // menu: remove selected class and change colors
	        oldMenuEl.removeClass("selected");
	        newMenuEl.addClass("selected");
	        oldMenuEl.children(".objectName")[0].setAttribute('bmfont-text', 'color', 'gray');
	        newMenuEl.children(".objectName")[0].setAttribute('bmfont-text', 'color', 'yellow');
	        oldMenuEl.children(".previewFrame")[0].setAttribute('material', 'color', '#222222');
	        newMenuEl.children(".previewFrame")[0].setAttribute('material', 'color', 'yellow');
	
	        // menu: slide the menu list RIGHT by 1
	        var menuObjectListEl = document.querySelector("#menuObjectList");
	        // use the desiredPosition attribute (if exists) instead of object3D position as animation may not be done yet
	        if (menuObjectListEl.hasAttribute("desiredPosition")) {
	          var oldPosition = menuObjectListEl.getAttribute("desiredPosition");
	          var newX = parseFloat(oldPosition.split(" ")[0]) + 0.075;
	          var newPositionString = newX.toString() + " " + oldPosition.split(" ")[1] + " " + oldPosition.split(" ")[2];
	        } else {
	          var oldPosition = menuObjectListEl.object3D.position;
	          var newX = oldPosition.x + 0.075; // this should be a variable soon
	          var newPositionString = newX.toString() + " " + oldPosition.y + " " + oldPosition.z;
	        }
	        menuObjectListEl.removeAttribute('animation__slide');
	        menuObjectListEl.setAttribute('animation__slide', { property: 'position', dur: 500, from: oldPosition, to: newPositionString });
	        menuObjectListEl.setAttribute('desiredPosition', newPositionString);
	
	        // menu: make the hidden most LEFTmost object (-3 from oldMenuEl index) visible
	        //OLD      var thirdMenuEl = oldMenuEl[0].nextElementSibling.nextElementSibling.nextElementSibling;
	        var negThirdMenuEl = oldMenuEl[0].previousElementSibling.previousElementSibling.previousElementSibling;
	
	        negThirdMenuEl.setAttribute('visible', 'true');
	
	        // TODO NOT WORKING AFTER FIRST ITERATION
	        // thirdMenuEl.removeAttribute('animation');
	        negThirdMenuEl.setAttribute('animation', { property: 'scale', dur: 500, from: '0.5 0.5 0.5', to: '1.0 1.0 1.0' });
	
	        // menu: destroy the hidden most RIGHTmost object (+3 from oldMenuEl index)
	        //OLD     var negThirdMenuEl = oldMenuEl[0].previousElementSibling.previousElementSibling.previousElementSibling;
	        var thirdMenuEl = oldMenuEl[0].nextElementSibling.nextElementSibling.nextElementSibling;
	        thirdMenuEl.parentNode.removeChild(thirdMenuEl);
	
	        // menu: make the second RIGHTmost object (+2 from oldMenuEl index) invisible
	        //OLD      var negSecondMenuEl = oldMenuEl[0].previousElementSibling.previousElementSibling;
	        var secondMenuEl = oldMenuEl[0].nextElementSibling.nextElementSibling;
	        secondMenuEl.setAttribute('visible', 'false');
	
	        // menu: Create the next LEFTmost object preview (-4 from oldMenuEl index) but keep it hidden until it's needed
	        var negFourthMenuEl = negThirdMenuEl.cloneNode(true);
	        negFourthMenuEl.setAttribute('visible', 'false');
	        // if objectId - 3 > -1 then use this number
	        // if objectId - 3 <= -1, then use this requested number plus the length of array
	        //OLD      var fourthMenuObjectID = (objectId + 3 < objectArray.length) ? (objectId + 3) : (objectId + 3 - objectArray.length);
	        var negFourthMenuObjectID = objectId - 3 > -1 ? objectId - 3 : objectId - 3 + objectArray.length;
	        negFourthMenuEl.setAttribute('objectId', negFourthMenuObjectID);
	        negFourthMenuEl.setAttribute('id', 'menu' + negFourthMenuObjectID);
	        negFourthMenuEl.setAttribute('file', objectArray[negFourthMenuObjectID].file);
	        negThirdMenuElPosition = negThirdMenuEl.object3D.position;
	        negFourthMenuEl.setAttribute('position', negThirdMenuElPosition.x - 0.075 + " " + negThirdMenuElPosition.y + " " + negThirdMenuElPosition.z);
	
	        // menu: add the newly cloned and modified menu object preview
	        //      menuObjectListEl.appendChild(negFourthMenuEl);
	        menuObjectListEl.insertBefore(negFourthMenuEl, menuObjectListEl.firstChild);
	
	        // menu: get child elements for image and name, populate both appropriately
	        var appendedNegFourthMenuEl = $('#menu' + negFourthMenuObjectID);
	        appendedNegFourthMenuEl.children(".previewImage")[0].setAttribute('src', 'assets/preview/' + objectArray[negFourthMenuObjectID].file + '.jpg');
	        appendedNegFourthMenuEl.children(".objectName")[0].setAttribute('bmfont-text', 'text', humanize(objectArray[negFourthMenuObjectID].file));
	        appendedNegFourthMenuEl.children(".objectName")[0].setAttribute('bmfont-text', 'color', '#747474');
	        // LEFT MENU END ===============================
	      } else {
	        // Increment by 1 and start over at 0 if reached the end
	        objectId += 1;
	        if (objectId == objectArray.length) {
	          objectId = 0;
	        }
	
	        // RIGHT BUTTON MENU START ===============================
	        // menu: animate arrow right
	        var arrowRight = document.getElementById("arrowRight");
	        arrowRight.removeAttribute('animation__color');
	        arrowRight.removeAttribute('animation__opacity');
	        arrowRight.removeAttribute('animation__scale');
	        arrowRight.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FFFF00", to: "#000000" });
	        arrowRight.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
	        arrowRight.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "-0.006 0.003 0.006", to: "-0.004 0.002 0.004" });
	
	        // menu: get the newly selected menu element
	        var _newMenuEl = $("a-entity#menuObjectList").find("a-entity[objectId=" + objectId + "]");
	
	        // menu: remove selected class and change colors
	        oldMenuEl.removeClass("selected");
	        _newMenuEl.addClass("selected");
	        oldMenuEl.children(".objectName")[0].setAttribute('bmfont-text', 'color', 'gray');
	        _newMenuEl.children(".objectName")[0].setAttribute('bmfont-text', 'color', 'yellow');
	        oldMenuEl.children(".previewFrame")[0].setAttribute('material', 'color', '#222222');
	        _newMenuEl.children(".previewFrame")[0].setAttribute('material', 'color', 'yellow');
	
	        // menu: slide the menu list left by 1
	        var _menuObjectListEl = document.querySelector("#menuObjectList");
	        // use the desiredPosition attribute (if exists) instead of object3D position as animation may not be done yet
	        if (_menuObjectListEl.hasAttribute("desiredPosition")) {
	          var oldPosition = _menuObjectListEl.getAttribute("desiredPosition");
	          var newX = parseFloat(oldPosition.split(" ")[0]) - 0.075;
	          var newPositionString = newX.toString() + " " + oldPosition.split(" ")[1] + " " + oldPosition.split(" ")[2];
	        } else {
	          var oldPosition = _menuObjectListEl.object3D.position;
	          var newX = oldPosition.x - 0.075; // this should be a variable soon
	          var newPositionString = newX.toString() + " " + oldPosition.y + " " + oldPosition.z;
	        }
	        _menuObjectListEl.removeAttribute('animation__slide');
	        _menuObjectListEl.setAttribute('animation__slide', { property: 'position', dur: 500, from: oldPosition, to: newPositionString });
	        _menuObjectListEl.setAttribute('desiredPosition', newPositionString);
	
	        // menu: make the hidden most rightmost object (+3 from oldMenuEl index) visible
	        var thirdMenuEl = oldMenuEl[0].nextElementSibling.nextElementSibling.nextElementSibling;
	
	        thirdMenuEl.setAttribute('visible', 'true');
	
	        // TODO NOT WORKING AFTER FIRST ITERATION
	        // thirdMenuEl.removeAttribute('animation');
	        thirdMenuEl.setAttribute('animation', { property: 'scale', dur: 500, from: '0.5 0.5 0.5', to: '1.0 1.0 1.0' });
	
	        // menu: destroy the hidden most leftmost object (-3 from oldMenuEl index)
	        var negThirdMenuEl = oldMenuEl[0].previousElementSibling.previousElementSibling.previousElementSibling;
	        negThirdMenuEl.parentNode.removeChild(negThirdMenuEl);
	
	        // menu: make the second leftmost object (-2 from oldMenuEl index) invisible
	        var negSecondMenuEl = oldMenuEl[0].previousElementSibling.previousElementSibling;
	        negSecondMenuEl.setAttribute('visible', 'false');
	
	        // menu: Create the next rightmost object preview (+4 from oldMenuEl index) but keep it hidden until it's needed
	        var fourthMenuEl = thirdMenuEl.cloneNode(true);
	        fourthMenuEl.setAttribute('visible', 'false');
	        // if objectId + 3 < length then use this number
	        // if objectId + 3 > length, then use this requested number minus the length of the object array
	        var fourthMenuObjectID = objectId + 3 < objectArray.length ? objectId + 3 : objectId + 3 - objectArray.length;
	        fourthMenuEl.setAttribute('objectId', fourthMenuObjectID);
	        fourthMenuEl.setAttribute('id', 'menu' + fourthMenuObjectID);
	        fourthMenuEl.setAttribute('file', objectArray[fourthMenuObjectID].file);
	        thirdMenuElPosition = thirdMenuEl.object3D.position;
	        fourthMenuEl.setAttribute('position', thirdMenuElPosition.x + 0.075 + " " + thirdMenuElPosition.y + " " + thirdMenuElPosition.z);
	
	        // menu: add the newly cloned and modified menu object preview
	        _menuObjectListEl.appendChild(fourthMenuEl);
	
	        // menu: get child elements for image and name, populate both appropriately
	        var appendedFourthMenuEl = $('#menu' + fourthMenuObjectID);
	        appendedFourthMenuEl.children(".previewImage")[0].setAttribute('src', 'assets/preview/' + objectArray[fourthMenuObjectID].file + '.jpg');
	        appendedFourthMenuEl.children(".objectName")[0].setAttribute('bmfont-text', 'text', humanize(objectArray[fourthMenuObjectID].file));
	        appendedFourthMenuEl.children(".objectName")[0].setAttribute('bmfont-text', 'color', '#747474');
	        // RIGHT BUTTON MENU END ===============================
	      }
	    } else {
	      // IF LEFT CONTROLLER
	      objectId += 1;
	      if (objectId == objectArray.length) {
	        objectId = 0;
	      }
	    }
	
	    // Set the preview object to be the currently selected "preview" item
	    thisItemEl.setAttribute('obj-model', { obj: "url(assets/obj/" + objectArray[objectId].file + ".obj)",
	      mtl: "url(assets/obj/" + objectArray[objectId].file + ".mtl)" });
	    thisItemEl.setAttribute('scale', objectArray[objectId].scale);
	    thisItemEl.setAttribute('objectId', objectId);
	  },
	
	  onObjectPrevious: function onObjectPrevious() {
	    // switch between the available object or bases
	
	    // Fetch the Item element (the placeable city object) selected on this controller
	    var thisItemID = this.el.id === 'leftController' ? '#leftItem' : '#rightItem';
	    var thisItemEl = document.querySelector(thisItemID);
	
	    // What's the type of object currently selected? For example, "mmmm_alien" or "bases"
	    var objectGroup = thisItemEl.attributes.objectGroup.value;
	
	    // Get an Array of all the objects of this type
	    var objectArray = objectDataStore.fetchJSON(objectGroup);
	
	    // What is the ID of the currently selected item?
	    var objectId = parseInt(thisItemEl.attributes.objectId.value);
	
	    // menu: save the currently selected menu element
	    var oldMenuEl = $("a-entity#menuObjectList").find("a-entity[objectId=" + objectId + "]");
	
	    // Decrement by 1 and start over at last object if reached the beginning
	    objectId -= 1;
	    if (objectId == -1) {
	      objectId = objectArray.length - 1;
	    }
	
	    // Set the next object to be the currently selected "preview" item
	    thisItemEl.setAttribute('obj-model', { obj: "url(assets/obj/" + objectArray[objectId].file + ".obj)",
	      mtl: "url(assets/obj/" + objectArray[objectId].file + ".mtl)" });
	    thisItemEl.setAttribute('scale', objectArray[objectId].scale);
	    thisItemEl.setAttribute('objectId', objectId);
	  },
	
	  /**
	   * Undo - deletes the most recently placed object
	   */
	  onUndo: function onUndo() {
	    previousObject = document.querySelector("#object" + (objectCount - 1));
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
	    var MODEL_URL = 'https://cdn.aframe.io/link-traversal/models/ground.json';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMWVlYmM0NzI3ZWNmNjY3YzZiNTAiLCJ3ZWJwYWNrOi8vLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2FuaW1lanMvYW5pbWUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtdGV4dC1jb21wb25lbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50L2luZGV4LmpzIiwid2VicGFjazovLy8uL34vdGhyZWUtYm1mb250LXRleHQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9sYXlvdXQtYm1mb250LXRleHQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi93b3JkLXdyYXBwZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi94dGVuZC9pbW11dGFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9pbmRleG9mLXByb3BlcnR5L2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYXMtbnVtYmVyL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly8vLi9+L3F1YWQtaW5kaWNlcy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2R0eXBlL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYW4tYXJyYXkvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9pcy1idWZmZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi90aHJlZS1idWZmZXItdmVydGV4LWRhdGEvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9mbGF0dGVuLXZlcnRleC1kYXRhL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vb2JqZWN0LWFzc2lnbi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3RocmVlLWJtZm9udC10ZXh0L2xpYi92ZXJ0aWNlcy5qcyIsIndlYnBhY2s6Ly8vLi9+L3RocmVlLWJtZm9udC10ZXh0L2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvYWQtYm1mb250L2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9idWZmZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYXNlNjQtanMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9pZWVlNzU0L2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYnVmZmVyL34vaXNhcnJheS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3hoci9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2dsb2JhbC93aW5kb3cuanMiLCJ3ZWJwYWNrOi8vLy4vfi9pcy1mdW5jdGlvbi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIndlYnBhY2s6Ly8vLi9+L3RyaW0vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9mb3ItZWFjaC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3BhcnNlLWJtZm9udC1hc2NpaS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3BhcnNlLWJtZm9udC14bWwvbGliL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wYXJzZS1ibWZvbnQteG1sL2xpYi9wYXJzZS1hdHRyaWJzLmpzIiwid2VicGFjazovLy8uL34veG1sLXBhcnNlLWZyb20tc3RyaW5nL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vcGFyc2UtYm1mb250LWJpbmFyeS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvYWQtYm1mb250L2xpYi9pcy1iaW5hcnkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9idWZmZXItZXF1YWwvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50L2xpYi9zaGFkZXJzL3NkZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2FmcmFtZS1ibWZvbnQtdGV4dC1jb21wb25lbnQvZXh0cmFzL3RleHQtcHJpbWl0aXZlLmpzIiwid2VicGFjazovLy8uL2xpYi9hZnJhbWUtc2VsZWN0LWJhci5qcyIsIndlYnBhY2s6Ly8vLi9saWIvYnVpbGRlci1jb250cm9scy5qcyIsIndlYnBhY2s6Ly8vLi9saWIvZ3JvdW5kLmpzIiwid2VicGFjazovLy8uL2xpYi9za3lHcmFkaWVudC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiQUZSQU1FIiwiRXJyb3IiLCJvcHRpb25KU09OIiwicmVnaXN0ZXJDb21wb25lbnQiLCJzY2hlbWEiLCJjb250cm9scyIsInR5cGUiLCJkZWZhdWx0IiwiY29udHJvbGxlcklEIiwiZmV0Y2hPcHRpb25Hcm91cHMiLCJzZWxlY3RFbCIsImVsIiwib3B0Z3JvdXBzIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJjb25zb2xlIiwibG9nIiwic2VsZWN0ZWRPcHRncm91cCIsIkFycmF5IiwiZnJvbSIsImZvckVhY2giLCJlbGVtZW50IiwiaW5kZXgiLCJnZXRBdHRyaWJ1dGUiLCJpbml0Iiwic2VsZWN0UmVuZGVyRWwiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJpZCIsImlubmVySFRNTCIsImFwcGVuZENoaWxkIiwib3B0aW9uc0VsZW1lbnRzIiwib3B0aW9uc0VsZW1lbnRzQXJyYXkiLCJwcm90b3R5cGUiLCJzbGljZSIsImNhbGwiLCJmaXJzdEFycmF5IiwicHJldmlld0FycmF5IiwibWVudUFycmF5IiwiY29uY2F0Iiwic2VsZWN0T3B0aW9uc0hUTUwiLCJzdGFydFBvc2l0aW9uWCIsImRlbHRhWCIsIm1lbnVBcnJheUluZGV4IiwidmlzaWJsZSIsInNlbGVjdGVkIiwidGV4dCIsInNlbGVjdE9wdGlvbnNSb3dFbCIsImFkZEV2ZW50TGlzdGVuZXJzIiwiZGF0YSIsImNvbnRyb2xsZXJFbCIsImdldEVsZW1lbnRCeUlkIiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uT3B0aW9uU3dpdGNoIiwiYmluZCIsIm9uQXhpc01vdmUiLCJvbkhvdmVyTGVmdCIsIm9uSG92ZXJSaWdodCIsInJlbW92ZUV2ZW50TGlzdGVuZXJzIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInBsYXkiLCJwYXVzZSIsInJlbW92ZSIsImV2dCIsImRldGFpbCIsImF4aXMiLCJ0YXJnZXQiLCJhcnJvdyIsImN1cnJlbnRBcnJvd0NvbG9yIiwiVEhSRUUiLCJDb2xvciIsImNvbG9yIiwiciIsInJlbW92ZUF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsInByb3BlcnR5IiwiZHVyIiwidG8iLCJkaXJlY3Rpb24iLCJvbGRNZW51RWwiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwib2xkU2VsZWN0ZWRPcHRpb25JbmRleCIsInBhcnNlSW50Iiwic2VsZWN0ZWRPcHRpb25JbmRleCIsImxlZnRCdXR0b24iLCJnIiwic2VsZWN0ZWRPcHRncm91cEVsIiwiY2hpbGRFbGVtZW50Q291bnQiLCJhcnJvd0xlZnQiLCJuZXdNZW51RWwiLCJxdWVyeVNlbGVjdG9yQWxsIiwiY2xhc3NMaXN0IiwiYWRkIiwicXVlcnlTZWxlY3RvciIsImhhc0F0dHJpYnV0ZSIsIm9sZFBvc2l0aW9uIiwibmV3WCIsInBhcnNlRmxvYXQiLCJzcGxpdCIsIm5ld1Bvc2l0aW9uU3RyaW5nIiwidG9TdHJpbmciLCJvYmplY3QzRCIsInBvc2l0aW9uIiwieCIsInkiLCJ6IiwibmV3bHlWaXNpYmxlT3B0aW9uSW5kZXgiLCJuZXdseVZpc2libGVPcHRpb25FbCIsIm5ld2x5UmVtb3ZlZE9wdGlvbkluZGV4IiwibmV3bHlSZW1vdmVkT3B0aW9uRWwiLCJwYXJlbnROb2RlIiwicmVtb3ZlQ2hpbGQiLCJuZXdseUludmlzaWJsZU9wdGlvbkluZGV4IiwibmV3bHlJbnZpc2libGVPcHRpb25FbCIsIm5ld2x5Q3JlYXRlZE9wdGlvbkVsIiwiY2xvbmVOb2RlIiwibmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgiLCJzb3VyY2VPcHRpb25FbCIsIm5ld2x5VmlzaWJsZU9wdGlvblBvc2l0aW9uIiwiaW5zZXJ0QmVmb3JlIiwiZmlyc3RDaGlsZCIsImFwcGVuZGVkTmV3bHlDcmVhdGVkT3B0aW9uRWwiLCJvYmplY3RJZCIsIm9iamVjdEFycmF5IiwibGVuZ3RoIiwiYXJyb3dSaWdodCIsIiQiLCJmaW5kIiwicmVtb3ZlQ2xhc3MiLCJhZGRDbGFzcyIsImNoaWxkcmVuIiwidGhpcmRNZW51RWwiLCJuZXh0RWxlbWVudFNpYmxpbmciLCJuZWdUaGlyZE1lbnVFbCIsInByZXZpb3VzRWxlbWVudFNpYmxpbmciLCJuZWdTZWNvbmRNZW51RWwiLCJmb3VydGhNZW51RWwiLCJmb3VydGhNZW51T2JqZWN0SUQiLCJmaWxlIiwidGhpcmRNZW51RWxQb3NpdGlvbiIsImFwcGVuZGVkRm91cnRoTWVudUVsIiwiaHVtYW5pemUiLCJvYmplY3RDb3VudCIsInN0ciIsImZyYWdzIiwiaSIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwiam9pbiIsIm9iamVjdERhdGFTdG9yZSIsIm9iamVjdEpTT04iLCJhamF4IiwidXJsIiwiZGF0YVR5cGUiLCJzdWNjZXNzIiwiZmV0Y2hKU09OIiwib2JqZWN0R3JvdXAiLCJtdWx0aXBsZSIsIm9uUGxhY2VPYmplY3QiLCJvblVuZG8iLCJvbk9iamVjdFByZXZpb3VzIiwib25PYmplY3ROZXh0IiwidGhpc0l0ZW1JRCIsInRoaXNJdGVtRWwiLCJhdHRyaWJ1dGVzIiwidmFsdWUiLCJyb3VuZGluZyIsInRoaXNJdGVtV29ybGRQb3NpdGlvbiIsImdldFdvcmxkUG9zaXRpb24iLCJ0aGlzSXRlbVdvcmxkUm90YXRpb24iLCJnZXRXb3JsZFJvdGF0aW9uIiwib3JpZ2luYWxQb3NpdGlvblN0cmluZyIsInJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblgiLCJNYXRoIiwicm91bmQiLCJyb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25ZIiwicm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWiIsInJvdW5kZWRQb3NpdGlvblN0cmluZyIsInRoaXNJdGVtV29ybGRSb3RhdGlvblgiLCJfeCIsIlBJIiwidGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSIsIl95IiwidGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWiIsIl96Iiwib3JpZ2luYWxFdWxlclJvdGF0aW9uU3RyaW5nIiwicm91bmRlZFRoaXNJdGVtV29ybGRSb3RhdGlvblkiLCJyb3VuZGVkRXVsZXJSb3RhdGlvblN0cmluZyIsIm5ld0lkIiwiY2xhc3MiLCJzY2FsZSIsInJvdGF0aW9uIiwiYXBwZW5kVG8iLCJuZXdPYmplY3QiLCJtZW51T2JqZWN0TGlzdEVsIiwic2Vjb25kTWVudUVsIiwibmVnRm91cnRoTWVudUVsIiwibmVnRm91cnRoTWVudU9iamVjdElEIiwibmVnVGhpcmRNZW51RWxQb3NpdGlvbiIsImFwcGVuZGVkTmVnRm91cnRoTWVudUVsIiwib2JqIiwibXRsIiwicHJldmlvdXNPYmplY3QiLCJvYmplY3RMb2FkZXIiLCJNT0RFTF9VUkwiLCJPYmplY3RMb2FkZXIiLCJjcm9zc09yaWdpbiIsImxvYWQiLCJyZWNlaXZlU2hhZG93IiwibWF0ZXJpYWwiLCJzaGFkaW5nIiwiRmxhdFNoYWRpbmciLCJyZWdpc3RlclNoYWRlciIsImNvbG9yVG9wIiwiaXMiLCJjb2xvckJvdHRvbSIsInZlcnRleFNoYWRlciIsImZyYWdtZW50U2hhZGVyIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7O0FDdENBLG9CQUFBQSxDQUFRLENBQVI7QUFDQSxvQkFBQUEsQ0FBUSxDQUFSO0FBQ0Esb0JBQUFBLENBQVEsQ0FBUjtBQUNBLG9CQUFBQSxDQUFRLENBQVI7QUFDQSxvQkFBQUEsQ0FBUSxFQUFSO0FBQ0Esb0JBQUFBLENBQVEsRUFBUjtBQUNBLG9CQUFBQSxDQUFRLEVBQVI7QUFDQSxvQkFBQUEsQ0FBUSxFQUFSLEU7Ozs7OztBQ1BBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxhQUFhO0FBQ3hCLGlCQUFnQixjQUFjO0FBQzlCLHVCQUFzQixlQUFlO0FBQ3JDLGlCQUFnQjtBQUNoQixJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOzs7Ozs7O0FDbkNEOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWSxXQUFXO0FBQ3ZCLFdBQVUsWUFBWTtBQUN0QixXQUFVLGNBQWM7QUFDeEIsY0FBYSxzQkFBc0I7QUFDbkMsa0JBQWlCLGFBQWE7QUFDOUIsWUFBVyxZQUFZO0FBQ3ZCLFlBQVcsZUFBZTtBQUMxQixnQkFBZSxZQUFZO0FBQzNCLGNBQWEsV0FBVztBQUN4QixtQkFBa0IsY0FBYztBQUNoQyxtQkFBa0IsY0FBYztBQUNoQyxvQkFBbUIsY0FBYztBQUNqQyxxQkFBb0IsY0FBYztBQUNsQyxVQUFTO0FBQ1QsSUFBRzs7QUFFSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwwQkFBeUIsUUFBUTs7QUFFakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBZ0MsdUJBQXVCO0FBQ3ZELFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSx5Q0FBd0MsZ0NBQWdDOztBQUV4RTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsdURBQXNELFFBQVE7O0FBRTlEO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSxNQUFLO0FBQ0wsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSxNQUFLO0FBQ0wsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUErQjtBQUMvQixnQkFBZSxxQkFBcUI7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFrQixrREFBa0Q7QUFDcEU7QUFDQSxnQ0FBK0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG9CQUFtQixhQUFhOztBQUVoQztBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDcE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7QUFFRDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsdUJBQXNCLDBCQUEwQjtBQUNoRCx1QkFBc0Isa0VBQWtFO0FBQ3hGLHVCQUFzQixpQ0FBaUM7QUFDdkQsdUJBQXNCLGlDQUFpQztBQUN2RCx1QkFBc0IsNkJBQTZCO0FBQ25ELHVCQUFzQiwrQkFBK0I7QUFDckQsdUJBQXNCLGlDQUFpQztBQUN2RCx1QkFBc0Isa0NBQWtDO0FBQ3hELHVCQUFzQiw2QkFBNkI7QUFDbkQsdUJBQXNCLHFCQUFxQixFQUFFLGVBQWUsRUFBRSxjQUFjO0FBQzVFLHVCQUFzQix3QkFBd0I7QUFDOUMsdUJBQXNCLHdCQUF3QjtBQUM5Qyx1QkFBc0I7QUFDdEI7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBeUIsb0RBQW9ELEVBQUU7QUFDL0UsMEJBQXlCLG1DQUFtQyxFQUFFO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQLDBCQUF5Qiw4QkFBOEIsRUFBRTtBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxpREFBZ0QsNkJBQTZCO0FBQzdFLG1EQUFrRCx1RUFBdUU7QUFDekgsbURBQWtELGtGQUFrRjtBQUNwSSxNQUFLO0FBQ0wsaUNBQWdDLFVBQVU7QUFDMUM7QUFDQSxJQUFHOztBQUVIOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrQ0FBaUMsa0JBQWtCLEVBQUU7QUFDckQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNERBQTJELGFBQWEsRUFBRTtBQUMxRTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLHNEQUFxRCw4QkFBOEIsRUFBRTtBQUNyRiw0QkFBMkIsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTRDLDBCQUEwQixFQUFFO0FBQ3hFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFjO0FBQ2QsTUFBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0VBQWlFO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWTtBQUNaOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUCxNQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdURBQXNELHVCQUF1QjtBQUM3RTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBLDREQUEyRCw0QkFBNEIsRUFBRTtBQUN6Rjs7QUFFQTtBQUNBLDREQUEyRCxvQkFBb0IsRUFBRTtBQUNqRjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5REFBd0QsNkJBQTZCLEVBQUU7QUFDdkY7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW1CLHdCQUF3QjtBQUMzQztBQUNBO0FBQ0E7QUFDQSxzQkFBcUIsOEJBQThCO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxREFBb0Q7QUFDcEQsaUVBQWdFO0FBQ2hFLGtEQUFpRDtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLDRCQUEyQixtQ0FBbUM7QUFDOUQ7QUFDQTtBQUNBLHdCQUF1Qix1QkFBdUI7QUFDOUM7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7O0FBRUg7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFtQztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxzQ0FBcUMsUUFBUTtBQUM3QztBQUNBO0FBQ0Esb0NBQW1DLFFBQVE7QUFDM0M7QUFDQSwyQ0FBMEMsUUFBUTtBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxFQUFDOzs7Ozs7O0FDOW5CRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0Esb0JBQW1CLGVBQWU7QUFDbEMsaUJBQWdCLG1CQUFtQjtBQUNuQyxzQkFBcUIsb0JBQW9CO0FBQ3pDLHFCQUFvQixvQkFBb0I7QUFDeEMsWUFBVyx5SEFBeUg7QUFDcEksY0FBYSxzQkFBc0I7QUFDbkMsWUFBVyxxQkFBcUI7QUFDaEMsYUFBWSxnREFBZ0Q7QUFDNUQsWUFBVyxZQUFZO0FBQ3ZCLGNBQWE7QUFDYixJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQLE1BQUs7QUFDTDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEVBQUM7Ozs7Ozs7QUM5Q0Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLHlCQUFzQzs7QUFFdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPOztBQUVQOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMLElBQUc7QUFDSDs7Ozs7OztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxZQUFXO0FBQ1g7O0FBRUE7QUFDQTtBQUNBLHdCQUF1Qjs7QUFFdkI7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxZQUFXO0FBQ1g7O0FBRUE7QUFDQSxrQkFBaUI7O0FBRWpCO0FBQ0EsMENBQXlDLE9BQU87QUFDaEQ7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQzNIQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxzQkFBcUIsT0FBTztBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esb0JBQW1CLFNBQVM7QUFDNUI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsNkJBQTRCO0FBQzVCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEVBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBaUM7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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFtQixVQUFVO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQixZQUFZO0FBQzdCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwyQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUEsd0NBQXVDLFNBQVM7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0JBQWUsaUJBQWlCO0FBQ2hDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsY0FBYSxpQkFBaUI7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWlCLFNBQVM7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQixTQUFTO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQixTQUFTO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQWdELEVBQUU7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsa0JBQWlCLFNBQVM7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUF5QztBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EseUJBQXdCLGVBQWU7QUFDdkM7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0EseUJBQXdCLFFBQVE7QUFDaEM7QUFDQSxzQkFBcUIsZUFBZTtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsWUFBWTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsc0JBQXFCLFNBQVM7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLHNCQUFxQixTQUFTO0FBQzlCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLHNCQUFxQixTQUFTO0FBQzlCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQixrQkFBa0I7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBLG9CQUFtQixjQUFjO0FBQ2pDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx3REFBdUQsT0FBTztBQUM5RDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0RBQXVELE9BQU87QUFDOUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsbUJBQWtCO0FBQ2xCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esc0JBQXFCLFFBQVE7QUFDN0I7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBLGdCQUFlLFNBQVM7QUFDeEI7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxvQkFBbUIsU0FBUztBQUM1QjtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWUsaUJBQWlCO0FBQ2hDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWlCLFlBQVk7QUFDN0I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGtCQUFpQixnQkFBZ0I7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsZ0JBQWdCO0FBQ2pDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtCQUFpQixZQUFZO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7OztBQzV2REE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1DQUFrQyxTQUFTO0FBQzNDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQSxxQkFBb0IsT0FBTztBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxzQkFBcUIsU0FBUztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMkNBQTBDLFVBQVU7QUFDcEQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7Ozs7Ozs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVEsV0FBVzs7QUFFbkI7QUFDQTtBQUNBO0FBQ0EsU0FBUSxXQUFXOztBQUVuQjtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUSxXQUFXOztBQUVuQjtBQUNBO0FBQ0EsU0FBUSxVQUFVOztBQUVsQjtBQUNBOzs7Ozs7O0FDbkZBLGtCQUFpQjs7QUFFakI7QUFDQTtBQUNBOzs7Ozs7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7QUFFRDtBQUNBLG9CQUFtQixrQkFBa0I7QUFDckM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHVCQUFzQjtBQUN0QjtBQUNBLE1BQUs7QUFDTCxrQ0FBaUMsU0FBUztBQUMxQzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTJCO0FBQzNCO0FBQ0E7QUFDQTtBQUNBLDJDQUEwQztBQUMxQztBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNoUEE7QUFDQTtBQUNBLEVBQUM7QUFDRDtBQUNBLEVBQUM7QUFDRDtBQUNBLEVBQUM7QUFDRDtBQUNBOzs7Ozs7OztBQ1JBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEU7Ozs7Ozs7QUM3QkE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNiQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FB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R0FSYyxFQVNaLHFEQVRZLEVBVVosZ0JBVlksRUFXWiw4QkFYWSxFQWFWLGlDQWJVLEVBZVosR0FmWSxFQWdCWiwwREFoQlksRUFrQmQsR0FsQmMsRUFtQmRyRSxJQW5CYyxDQW1CVCxJQW5CUztBQXBCbUIsRUFBckMsRSIsImZpbGUiOiJhZnJhbWUtY2l0eS1idWlsZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMWVlYmM0NzI3ZWNmNjY3YzZiNTAiLCJyZXF1aXJlKCdhZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQnKTtcbnJlcXVpcmUoJ2FmcmFtZS1hbmltYXRpb24tY29tcG9uZW50Jyk7XG5yZXF1aXJlKCdhZnJhbWUtdGV4dC1jb21wb25lbnQnKTtcbnJlcXVpcmUoJ2FmcmFtZS1ibWZvbnQtdGV4dC1jb21wb25lbnQnKTtcbnJlcXVpcmUoJy4vbGliL2FmcmFtZS1zZWxlY3QtYmFyLmpzJyk7XG5yZXF1aXJlKCcuL2xpYi9idWlsZGVyLWNvbnRyb2xzLmpzJyk7XG5yZXF1aXJlKCcuL2xpYi9ncm91bmQuanMnKTtcbnJlcXVpcmUoJy4vbGliL3NreUdyYWRpZW50LmpzJyk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9pbmRleC5qcyIsImlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xufVxuXG4vKipcbiAqIEdyaWRIZWxwZXIgY29tcG9uZW50IGZvciBBLUZyYW1lLlxuICovXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2dyaWRoZWxwZXInLCB7XG4gIHNjaGVtYToge1xuICAgIHNpemU6IHsgZGVmYXVsdDogNSB9LFxuICAgIGRpdmlzaW9uczogeyBkZWZhdWx0OiAxMCB9LFxuICAgIGNvbG9yQ2VudGVyTGluZToge2RlZmF1bHQ6ICdyZWQnfSxcbiAgICBjb2xvckdyaWQ6IHtkZWZhdWx0OiAnYmxhY2snfVxuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxsZWQgb25jZSB3aGVuIGNvbXBvbmVudCBpcyBhdHRhY2hlZC4gR2VuZXJhbGx5IGZvciBpbml0aWFsIHNldHVwLlxuICAgKi9cbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzY2VuZSA9IHRoaXMuZWwub2JqZWN0M0Q7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG5cbiAgICB2YXIgc2l6ZSA9IGRhdGEuc2l6ZTtcbiAgICB2YXIgZGl2aXNpb25zID0gZGF0YS5kaXZpc2lvbnM7XG4gICAgdmFyIGNvbG9yQ2VudGVyTGluZSA9IGRhdGEuY29sb3JDZW50ZXJMaW5lO1xuICAgIHZhciBjb2xvckdyaWQgPSBkYXRhLmNvbG9yR3JpZDtcblxuICAgIHZhciBncmlkSGVscGVyID0gbmV3IFRIUkVFLkdyaWRIZWxwZXIoIHNpemUsIGRpdmlzaW9ucywgY29sb3JDZW50ZXJMaW5lLCBjb2xvckdyaWQgKTtcbiAgICBncmlkSGVscGVyLm5hbWUgPSBcImdyaWRIZWxwZXJcIjtcbiAgICBzY2VuZS5hZGQoZ3JpZEhlbHBlcik7XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzY2VuZSA9IHRoaXMuZWwub2JqZWN0M0Q7XG4gICAgc2NlbmUucmVtb3ZlKHNjZW5lLmdldE9iamVjdEJ5TmFtZShcImdyaWRIZWxwZXJcIikpO1xuICB9XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyogZ2xvYmFsIEFGUkFNRSAqL1xuXG52YXIgYW5pbWUgPSByZXF1aXJlKCdhbmltZWpzJyk7XG5cbmlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xufVxuXG52YXIgdXRpbHMgPSBBRlJBTUUudXRpbHM7XG52YXIgZ2V0Q29tcG9uZW50UHJvcGVydHkgPSB1dGlscy5lbnRpdHkuZ2V0Q29tcG9uZW50UHJvcGVydHk7XG52YXIgc2V0Q29tcG9uZW50UHJvcGVydHkgPSB1dGlscy5lbnRpdHkuc2V0Q29tcG9uZW50UHJvcGVydHk7XG52YXIgc3R5bGVQYXJzZXIgPSB1dGlscy5zdHlsZVBhcnNlci5wYXJzZTtcblxuLyoqXG4gKiBBbmltYXRpb24gY29tcG9uZW50IGZvciBBLUZyYW1lLlxuICovXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2FuaW1hdGlvbicsIHtcbiAgc2NoZW1hOiB7XG4gICAgZGVsYXk6IHtkZWZhdWx0OiAwfSxcbiAgICBkaXI6IHtkZWZhdWx0OiAnJ30sXG4gICAgZHVyOiB7ZGVmYXVsdDogMTAwMH0sXG4gICAgZWFzaW5nOiB7ZGVmYXVsdDogJ2Vhc2VJblF1YWQnfSxcbiAgICBlbGFzdGljaXR5OiB7ZGVmYXVsdDogNDAwfSxcbiAgICBmcm9tOiB7ZGVmYXVsdDogJyd9LFxuICAgIGxvb3A6IHtkZWZhdWx0OiBmYWxzZX0sXG4gICAgcHJvcGVydHk6IHtkZWZhdWx0OiAnJ30sXG4gICAgcmVwZWF0OiB7ZGVmYXVsdDogMH0sXG4gICAgc3RhcnRFdmVudHM6IHt0eXBlOiAnYXJyYXknfSxcbiAgICBwYXVzZUV2ZW50czoge3R5cGU6ICdhcnJheSd9LFxuICAgIHJlc3VtZUV2ZW50czoge3R5cGU6ICdhcnJheSd9LFxuICAgIHJlc3RhcnRFdmVudHM6IHt0eXBlOiAnYXJyYXknfSxcbiAgICB0bzoge2RlZmF1bHQ6ICcnfVxuICB9LFxuXG4gIG11bHRpcGxlOiB0cnVlLFxuXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbiA9IG51bGw7XG4gICAgdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmNvbmZpZyA9IG51bGw7XG4gICAgdGhpcy5wbGF5QW5pbWF0aW9uQm91bmQgPSB0aGlzLnBsYXlBbmltYXRpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnBhdXNlQW5pbWF0aW9uQm91bmQgPSB0aGlzLnBhdXNlQW5pbWF0aW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXN1bWVBbmltYXRpb25Cb3VuZCA9IHRoaXMucmVzdW1lQW5pbWF0aW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXN0YXJ0QW5pbWF0aW9uQm91bmQgPSB0aGlzLnJlc3RhcnRBbmltYXRpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlcGVhdCA9IDA7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGF0dHJOYW1lID0gdGhpcy5hdHRyTmFtZTtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIHZhciBwcm9wVHlwZSA9IGdldFByb3BlcnR5VHlwZShlbCwgZGF0YS5wcm9wZXJ0eSk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFkYXRhLnByb3BlcnR5KSB7IHJldHVybjsgfVxuXG4gICAgLy8gQmFzZSBjb25maWcuXG4gICAgdGhpcy5yZXBlYXQgPSBkYXRhLnJlcGVhdDtcbiAgICB2YXIgY29uZmlnID0ge1xuICAgICAgYXV0b3BsYXk6IGZhbHNlLFxuICAgICAgYmVnaW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZWwuZW1pdCgnYW5pbWF0aW9uYmVnaW4nKTtcbiAgICAgICAgZWwuZW1pdChhdHRyTmFtZSArICctYmVnaW4nKTtcbiAgICAgIH0sXG4gICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBlbC5lbWl0KCdhbmltYXRpb25jb21wbGV0ZScpO1xuICAgICAgICBlbC5lbWl0KGF0dHJOYW1lICsgJy1jb21wbGV0ZScpO1xuICAgICAgICAvLyBSZXBlYXQuXG4gICAgICAgIGlmICgtLXNlbGYucmVwZWF0ID4gMCkgeyBzZWxmLmFuaW1hdGlvbi5wbGF5KCk7IH1cbiAgICAgIH0sXG4gICAgICBkaXJlY3Rpb246IGRhdGEuZGlyLFxuICAgICAgZHVyYXRpb246IGRhdGEuZHVyLFxuICAgICAgZWFzaW5nOiBkYXRhLmVhc2luZyxcbiAgICAgIGVsYXN0aWNpdHk6IGRhdGEuZWxhc3RpY2l0eSxcbiAgICAgIGxvb3A6IGRhdGEubG9vcFxuICAgIH07XG5cbiAgICAvLyBDdXN0b21pemUgY29uZmlnIGJhc2VkIG9uIHByb3BlcnR5IHR5cGUuXG4gICAgdmFyIHVwZGF0ZUNvbmZpZyA9IGNvbmZpZ0RlZmF1bHQ7XG4gICAgaWYgKHByb3BUeXBlID09PSAndmVjMicgfHwgcHJvcFR5cGUgPT09ICd2ZWMzJyB8fCBwcm9wVHlwZSA9PT0gJ3ZlYzQnKSB7XG4gICAgICB1cGRhdGVDb25maWcgPSBjb25maWdWZWN0b3I7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlnLlxuICAgIHRoaXMuY29uZmlnID0gdXBkYXRlQ29uZmlnKGVsLCBkYXRhLCBjb25maWcpO1xuICAgIHRoaXMuYW5pbWF0aW9uID0gYW5pbWUodGhpcy5jb25maWcpO1xuXG4gICAgLy8gU3RvcCBwcmV2aW91cyBhbmltYXRpb24uXG4gICAgdGhpcy5wYXVzZUFuaW1hdGlvbigpO1xuXG4gICAgaWYgKCF0aGlzLmRhdGEuc3RhcnRFdmVudHMubGVuZ3RoKSB7IHRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nID0gdHJ1ZTsgfVxuXG4gICAgLy8gUGxheSBhbmltYXRpb24gaWYgbm8gaG9sZGluZyBldmVudC5cbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucGF1c2VBbmltYXRpb24oKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gIH0sXG5cbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnBhdXNlQW5pbWF0aW9uKCk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYWZ0ZXIgdXBkYXRlLlxuICAgKi9cbiAgcGxheTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICghdGhpcy5hbmltYXRpb24gfHwgIXRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nKSB7IHJldHVybjsgfVxuXG4gICAgLy8gRGVsYXkuXG4gICAgaWYgKGRhdGEuZGVsYXkpIHtcbiAgICAgIHNldFRpbWVvdXQocGxheSwgZGF0YS5kZWxheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBsYXkoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwbGF5ICgpIHtcbiAgICAgIHNlbGYucGxheUFuaW1hdGlvbigpO1xuICAgICAgc2VsZi5hZGRFdmVudExpc3RlbmVycygpO1xuICAgIH1cbiAgfSxcblxuICBhZGRFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIGRhdGEuc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnBsYXlBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5wYXVzZUV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucGF1c2VBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5yZXN1bWVFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3VtZUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnJlc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3RhcnRBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICBkYXRhLnN0YXJ0RXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5wbGF5QW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucGF1c2VFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnBhdXNlQW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucmVzdW1lRXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5yZXN1bWVBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5yZXN0YXJ0RXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5yZXN0YXJ0QW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICB9LFxuXG4gIHBsYXlBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbi5wbGF5KCk7XG4gICAgdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcgPSB0cnVlO1xuICB9LFxuXG4gIHBhdXNlQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hbmltYXRpb24ucGF1c2UoKTtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IGZhbHNlO1xuICB9LFxuXG4gIHJlc3VtZUFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uLnBsYXkoKTtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IHRydWU7XG4gIH0sXG5cbiAgcmVzdGFydEFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uLnJlc3RhcnQoKTtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IHRydWU7XG4gIH1cbn0pO1xuXG4vKipcbiAqIFN0dWZmIHByb3BlcnR5IGludG8gZ2VuZXJpYyBgcHJvcGVydHlgIGtleS5cbiAqL1xuZnVuY3Rpb24gY29uZmlnRGVmYXVsdCAoZWwsIGRhdGEsIGNvbmZpZykge1xuICB2YXIgZnJvbSA9IGRhdGEuZnJvbSB8fCBnZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSk7XG4gIHJldHVybiBBRlJBTUUudXRpbHMuZXh0ZW5kKHt9LCBjb25maWcsIHtcbiAgICB0YXJnZXRzOiBbe2FmcmFtZVByb3BlcnR5OiBmcm9tfV0sXG4gICAgYWZyYW1lUHJvcGVydHk6IGRhdGEudG8sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSwgdGhpcy50YXJnZXRzWzBdLmFmcmFtZVByb3BlcnR5KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIEV4dGVuZCB4L3kvei93IG9udG8gdGhlIGNvbmZpZy5cbiAqL1xuZnVuY3Rpb24gY29uZmlnVmVjdG9yIChlbCwgZGF0YSwgY29uZmlnKSB7XG4gIHZhciBmcm9tID0gZ2V0Q29tcG9uZW50UHJvcGVydHkoZWwsIGRhdGEucHJvcGVydHkpO1xuICBpZiAoZGF0YS5mcm9tKSB7IGZyb20gPSBBRlJBTUUudXRpbHMuY29vcmRpbmF0ZXMucGFyc2UoZGF0YS5mcm9tKTsgfVxuICB2YXIgdG8gPSBBRlJBTUUudXRpbHMuY29vcmRpbmF0ZXMucGFyc2UoZGF0YS50byk7XG4gIHJldHVybiBBRlJBTUUudXRpbHMuZXh0ZW5kKHt9LCBjb25maWcsIHtcbiAgICB0YXJnZXRzOiBbZnJvbV0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSwgdGhpcy50YXJnZXRzWzBdKTtcbiAgICB9XG4gIH0sIHRvKTtcbn1cblxuZnVuY3Rpb24gZ2V0UHJvcGVydHlUeXBlIChlbCwgcHJvcGVydHkpIHtcbiAgdmFyIHNwbGl0ID0gcHJvcGVydHkuc3BsaXQoJy4nKTtcbiAgdmFyIGNvbXBvbmVudE5hbWUgPSBzcGxpdFswXTtcbiAgdmFyIHByb3BlcnR5TmFtZSA9IHNwbGl0WzFdO1xuICB2YXIgY29tcG9uZW50ID0gZWwuY29tcG9uZW50c1tjb21wb25lbnROYW1lXSB8fCBBRlJBTUUuY29tcG9uZW50c1tjb21wb25lbnROYW1lXTtcblxuICAvLyBQcmltaXRpdmVzLlxuICBpZiAoIWNvbXBvbmVudCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIGlmIChwcm9wZXJ0eU5hbWUpIHtcbiAgICByZXR1cm4gY29tcG9uZW50LnNjaGVtYVtwcm9wZXJ0eU5hbWVdLnR5cGU7XG4gIH1cbiAgcmV0dXJuIGNvbXBvbmVudC5zY2hlbWEudHlwZTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuICogQW5pbWUgdjEuMS4zXG4gKiBodHRwOi8vYW5pbWUtanMuY29tXG4gKiBKYXZhU2NyaXB0IGFuaW1hdGlvbiBlbmdpbmVcbiAqIENvcHlyaWdodCAoYykgMjAxNiBKdWxpYW4gR2FybmllclxuICogaHR0cDovL2p1bGlhbmdhcm5pZXIuY29tXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG4gICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgLy8gbGlrZSBOb2RlLlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5hbmltZSA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHZlcnNpb24gPSAnMS4xLjMnO1xuXG4gIC8vIERlZmF1bHRzXG5cbiAgdmFyIGRlZmF1bHRTZXR0aW5ncyA9IHtcbiAgICBkdXJhdGlvbjogMTAwMCxcbiAgICBkZWxheTogMCxcbiAgICBsb29wOiBmYWxzZSxcbiAgICBhdXRvcGxheTogdHJ1ZSxcbiAgICBkaXJlY3Rpb246ICdub3JtYWwnLFxuICAgIGVhc2luZzogJ2Vhc2VPdXRFbGFzdGljJyxcbiAgICBlbGFzdGljaXR5OiA0MDAsXG4gICAgcm91bmQ6IGZhbHNlLFxuICAgIGJlZ2luOiB1bmRlZmluZWQsXG4gICAgdXBkYXRlOiB1bmRlZmluZWQsXG4gICAgY29tcGxldGU6IHVuZGVmaW5lZFxuICB9XG5cbiAgLy8gVHJhbnNmb3Jtc1xuXG4gIHZhciB2YWxpZFRyYW5zZm9ybXMgPSBbJ3RyYW5zbGF0ZVgnLCAndHJhbnNsYXRlWScsICd0cmFuc2xhdGVaJywgJ3JvdGF0ZScsICdyb3RhdGVYJywgJ3JvdGF0ZVknLCAncm90YXRlWicsICdzY2FsZScsICdzY2FsZVgnLCAnc2NhbGVZJywgJ3NjYWxlWicsICdza2V3WCcsICdza2V3WSddO1xuICB2YXIgdHJhbnNmb3JtLCB0cmFuc2Zvcm1TdHIgPSAndHJhbnNmb3JtJztcblxuICAvLyBVdGlsc1xuXG4gIHZhciBpcyA9IHtcbiAgICBhcnI6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIEFycmF5LmlzQXJyYXkoYSkgfSxcbiAgICBvYmo6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKS5pbmRleE9mKCdPYmplY3QnKSA+IC0xIH0sXG4gICAgc3ZnOiBmdW5jdGlvbihhKSB7IHJldHVybiBhIGluc3RhbmNlb2YgU1ZHRWxlbWVudCB9LFxuICAgIGRvbTogZnVuY3Rpb24oYSkgeyByZXR1cm4gYS5ub2RlVHlwZSB8fCBpcy5zdmcoYSkgfSxcbiAgICBudW06IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICFpc05hTihwYXJzZUludChhKSkgfSxcbiAgICBzdHI6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAnc3RyaW5nJyB9LFxuICAgIGZuYzogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICdmdW5jdGlvbicgfSxcbiAgICB1bmQ6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAndW5kZWZpbmVkJyB9LFxuICAgIG51bDogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICdudWxsJyB9LFxuICAgIGhleDogZnVuY3Rpb24oYSkgeyByZXR1cm4gLyheI1swLTlBLUZdezZ9JCl8KF4jWzAtOUEtRl17M30kKS9pLnRlc3QoYSkgfSxcbiAgICByZ2I6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIC9ecmdiLy50ZXN0KGEpIH0sXG4gICAgaHNsOiBmdW5jdGlvbihhKSB7IHJldHVybiAvXmhzbC8udGVzdChhKSB9LFxuICAgIGNvbDogZnVuY3Rpb24oYSkgeyByZXR1cm4gKGlzLmhleChhKSB8fCBpcy5yZ2IoYSkgfHwgaXMuaHNsKGEpKSB9XG4gIH1cblxuICAvLyBFYXNpbmdzIGZ1bmN0aW9ucyBhZGFwdGVkIGZyb20gaHR0cDovL2pxdWVyeXVpLmNvbS9cblxuICB2YXIgZWFzaW5ncyA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgZWFzZXMgPSB7fTtcbiAgICB2YXIgbmFtZXMgPSBbJ1F1YWQnLCAnQ3ViaWMnLCAnUXVhcnQnLCAnUXVpbnQnLCAnRXhwbyddO1xuICAgIHZhciBmdW5jdGlvbnMgPSB7XG4gICAgICBTaW5lOiBmdW5jdGlvbih0KSB7IHJldHVybiAxICsgTWF0aC5zaW4oTWF0aC5QSSAvIDIgKiB0IC0gTWF0aC5QSSAvIDIpOyB9LFxuICAgICAgQ2lyYzogZnVuY3Rpb24odCkgeyByZXR1cm4gMSAtIE1hdGguc3FydCggMSAtIHQgKiB0ICk7IH0sXG4gICAgICBFbGFzdGljOiBmdW5jdGlvbih0LCBtKSB7XG4gICAgICAgIGlmKCB0ID09PSAwIHx8IHQgPT09IDEgKSByZXR1cm4gdDtcbiAgICAgICAgdmFyIHAgPSAoMSAtIE1hdGgubWluKG0sIDk5OCkgLyAxMDAwKSwgc3QgPSB0IC8gMSwgc3QxID0gc3QgLSAxLCBzID0gcCAvICggMiAqIE1hdGguUEkgKSAqIE1hdGguYXNpbiggMSApO1xuICAgICAgICByZXR1cm4gLSggTWF0aC5wb3coIDIsIDEwICogc3QxICkgKiBNYXRoLnNpbiggKCBzdDEgLSBzICkgKiAoIDIgKiBNYXRoLlBJICkgLyBwICkgKTtcbiAgICAgIH0sXG4gICAgICBCYWNrOiBmdW5jdGlvbih0KSB7IHJldHVybiB0ICogdCAqICggMyAqIHQgLSAyICk7IH0sXG4gICAgICBCb3VuY2U6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgdmFyIHBvdzIsIGJvdW5jZSA9IDQ7XG4gICAgICAgIHdoaWxlICggdCA8ICggKCBwb3cyID0gTWF0aC5wb3coIDIsIC0tYm91bmNlICkgKSAtIDEgKSAvIDExICkge31cbiAgICAgICAgcmV0dXJuIDEgLyBNYXRoLnBvdyggNCwgMyAtIGJvdW5jZSApIC0gNy41NjI1ICogTWF0aC5wb3coICggcG93MiAqIDMgLSAyICkgLyAyMiAtIHQsIDIgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbmFtZXMuZm9yRWFjaChmdW5jdGlvbihuYW1lLCBpKSB7XG4gICAgICBmdW5jdGlvbnNbbmFtZV0gPSBmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdyggdCwgaSArIDIgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhmdW5jdGlvbnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGVhc2VJbiA9IGZ1bmN0aW9uc1tuYW1lXTtcbiAgICAgIGVhc2VzWydlYXNlSW4nICsgbmFtZV0gPSBlYXNlSW47XG4gICAgICBlYXNlc1snZWFzZU91dCcgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIDEgLSBlYXNlSW4oMSAtIHQsIG0pOyB9O1xuICAgICAgZWFzZXNbJ2Vhc2VJbk91dCcgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIHQgPCAwLjUgPyBlYXNlSW4odCAqIDIsIG0pIC8gMiA6IDEgLSBlYXNlSW4odCAqIC0yICsgMiwgbSkgLyAyOyB9O1xuICAgICAgZWFzZXNbJ2Vhc2VPdXRJbicgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIHQgPCAwLjUgPyAoMSAtIGVhc2VJbigxIC0gMiAqIHQsIG0pKSAvIDIgOiAoZWFzZUluKHQgKiAyIC0gMSwgbSkgKyAxKSAvIDI7IH07XG4gICAgfSk7XG4gICAgZWFzZXMubGluZWFyID0gZnVuY3Rpb24odCkgeyByZXR1cm4gdDsgfTtcbiAgICByZXR1cm4gZWFzZXM7XG4gIH0pKCk7XG5cbiAgLy8gU3RyaW5nc1xuXG4gIHZhciBudW1iZXJUb1N0cmluZyA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiAoaXMuc3RyKHZhbCkpID8gdmFsIDogdmFsICsgJyc7XG4gIH1cblxuICB2YXIgc3RyaW5nVG9IeXBoZW5zID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgdmFyIHNlbGVjdFN0cmluZyA9IGZ1bmN0aW9uKHN0cikge1xuICAgIGlmIChpcy5jb2woc3RyKSkgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICB2YXIgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHN0cik7XG4gICAgICByZXR1cm4gbm9kZXM7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLy8gTnVtYmVyc1xuXG4gIHZhciByYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuICB9XG5cbiAgLy8gQXJyYXlzXG5cbiAgdmFyIGZsYXR0ZW5BcnJheSA9IGZ1bmN0aW9uKGFycikge1xuICAgIHJldHVybiBhcnIucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmNvbmNhdChpcy5hcnIoYikgPyBmbGF0dGVuQXJyYXkoYikgOiBiKTtcbiAgICB9LCBbXSk7XG4gIH1cblxuICB2YXIgdG9BcnJheSA9IGZ1bmN0aW9uKG8pIHtcbiAgICBpZiAoaXMuYXJyKG8pKSByZXR1cm4gbztcbiAgICBpZiAoaXMuc3RyKG8pKSBvID0gc2VsZWN0U3RyaW5nKG8pIHx8IG87XG4gICAgaWYgKG8gaW5zdGFuY2VvZiBOb2RlTGlzdCB8fCBvIGluc3RhbmNlb2YgSFRNTENvbGxlY3Rpb24pIHJldHVybiBbXS5zbGljZS5jYWxsKG8pO1xuICAgIHJldHVybiBbb107XG4gIH1cblxuICB2YXIgYXJyYXlDb250YWlucyA9IGZ1bmN0aW9uKGFyciwgdmFsKSB7XG4gICAgcmV0dXJuIGFyci5zb21lKGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGEgPT09IHZhbDsgfSk7XG4gIH1cblxuICB2YXIgZ3JvdXBBcnJheUJ5UHJvcHMgPSBmdW5jdGlvbihhcnIsIHByb3BzQXJyKSB7XG4gICAgdmFyIGdyb3VwcyA9IHt9O1xuICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uKG8pIHtcbiAgICAgIHZhciBncm91cCA9IEpTT04uc3RyaW5naWZ5KHByb3BzQXJyLm1hcChmdW5jdGlvbihwKSB7IHJldHVybiBvW3BdOyB9KSk7XG4gICAgICBncm91cHNbZ3JvdXBdID0gZ3JvdXBzW2dyb3VwXSB8fCBbXTtcbiAgICAgIGdyb3Vwc1tncm91cF0ucHVzaChvKTtcbiAgICB9KTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZ3JvdXBzKS5tYXAoZnVuY3Rpb24oZ3JvdXApIHtcbiAgICAgIHJldHVybiBncm91cHNbZ3JvdXBdO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIHJlbW92ZUFycmF5RHVwbGljYXRlcyA9IGZ1bmN0aW9uKGFycikge1xuICAgIHJldHVybiBhcnIuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0sIHBvcywgc2VsZikge1xuICAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZihpdGVtKSA9PT0gcG9zO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gT2JqZWN0c1xuXG4gIHZhciBjbG9uZU9iamVjdCA9IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgbmV3T2JqZWN0ID0ge307XG4gICAgZm9yICh2YXIgcCBpbiBvKSBuZXdPYmplY3RbcF0gPSBvW3BdO1xuICAgIHJldHVybiBuZXdPYmplY3Q7XG4gIH1cblxuICB2YXIgbWVyZ2VPYmplY3RzID0gZnVuY3Rpb24obzEsIG8yKSB7XG4gICAgZm9yICh2YXIgcCBpbiBvMikgbzFbcF0gPSAhaXMudW5kKG8xW3BdKSA/IG8xW3BdIDogbzJbcF07XG4gICAgcmV0dXJuIG8xO1xuICB9XG5cbiAgLy8gQ29sb3JzXG5cbiAgdmFyIGhleFRvUmdiID0gZnVuY3Rpb24oaGV4KSB7XG4gICAgdmFyIHJneCA9IC9eIz8oW2EtZlxcZF0pKFthLWZcXGRdKShbYS1mXFxkXSkkL2k7XG4gICAgdmFyIGhleCA9IGhleC5yZXBsYWNlKHJneCwgZnVuY3Rpb24obSwgciwgZywgYikgeyByZXR1cm4gciArIHIgKyBnICsgZyArIGIgKyBiOyB9KTtcbiAgICB2YXIgcmdiID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgdmFyIHIgPSBwYXJzZUludChyZ2JbMV0sIDE2KTtcbiAgICB2YXIgZyA9IHBhcnNlSW50KHJnYlsyXSwgMTYpO1xuICAgIHZhciBiID0gcGFyc2VJbnQocmdiWzNdLCAxNik7XG4gICAgcmV0dXJuICdyZ2IoJyArIHIgKyAnLCcgKyBnICsgJywnICsgYiArICcpJztcbiAgfVxuXG4gIHZhciBoc2xUb1JnYiA9IGZ1bmN0aW9uKGhzbCkge1xuICAgIHZhciBoc2wgPSAvaHNsXFwoKFxcZCspLFxccyooW1xcZC5dKyklLFxccyooW1xcZC5dKyklXFwpL2cuZXhlYyhoc2wpO1xuICAgIHZhciBoID0gcGFyc2VJbnQoaHNsWzFdKSAvIDM2MDtcbiAgICB2YXIgcyA9IHBhcnNlSW50KGhzbFsyXSkgLyAxMDA7XG4gICAgdmFyIGwgPSBwYXJzZUludChoc2xbM10pIC8gMTAwO1xuICAgIHZhciBodWUycmdiID0gZnVuY3Rpb24ocCwgcSwgdCkge1xuICAgICAgaWYgKHQgPCAwKSB0ICs9IDE7XG4gICAgICBpZiAodCA+IDEpIHQgLT0gMTtcbiAgICAgIGlmICh0IDwgMS82KSByZXR1cm4gcCArIChxIC0gcCkgKiA2ICogdDtcbiAgICAgIGlmICh0IDwgMS8yKSByZXR1cm4gcTtcbiAgICAgIGlmICh0IDwgMi8zKSByZXR1cm4gcCArIChxIC0gcCkgKiAoMi8zIC0gdCkgKiA2O1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIHZhciByLCBnLCBiO1xuICAgIGlmIChzID09IDApIHtcbiAgICAgIHIgPSBnID0gYiA9IGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBxID0gbCA8IDAuNSA/IGwgKiAoMSArIHMpIDogbCArIHMgLSBsICogcztcbiAgICAgIHZhciBwID0gMiAqIGwgLSBxO1xuICAgICAgciA9IGh1ZTJyZ2IocCwgcSwgaCArIDEvMyk7XG4gICAgICBnID0gaHVlMnJnYihwLCBxLCBoKTtcbiAgICAgIGIgPSBodWUycmdiKHAsIHEsIGggLSAxLzMpO1xuICAgIH1cbiAgICByZXR1cm4gJ3JnYignICsgciAqIDI1NSArICcsJyArIGcgKiAyNTUgKyAnLCcgKyBiICogMjU1ICsgJyknO1xuICB9XG5cbiAgdmFyIGNvbG9yVG9SZ2IgPSBmdW5jdGlvbih2YWwpIHtcbiAgICBpZiAoaXMucmdiKHZhbCkpIHJldHVybiB2YWw7XG4gICAgaWYgKGlzLmhleCh2YWwpKSByZXR1cm4gaGV4VG9SZ2IodmFsKTtcbiAgICBpZiAoaXMuaHNsKHZhbCkpIHJldHVybiBoc2xUb1JnYih2YWwpO1xuICB9XG5cbiAgLy8gVW5pdHNcblxuICB2YXIgZ2V0VW5pdCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiAvKFtcXCtcXC1dP1swLTl8YXV0b1xcLl0rKSglfHB4fHB0fGVtfHJlbXxpbnxjbXxtbXxleHxwY3x2d3x2aHxkZWcpPy8uZXhlYyh2YWwpWzJdO1xuICB9XG5cbiAgdmFyIGFkZERlZmF1bHRUcmFuc2Zvcm1Vbml0ID0gZnVuY3Rpb24ocHJvcCwgdmFsLCBpbnRpYWxWYWwpIHtcbiAgICBpZiAoZ2V0VW5pdCh2YWwpKSByZXR1cm4gdmFsO1xuICAgIGlmIChwcm9wLmluZGV4T2YoJ3RyYW5zbGF0ZScpID4gLTEpIHJldHVybiBnZXRVbml0KGludGlhbFZhbCkgPyB2YWwgKyBnZXRVbml0KGludGlhbFZhbCkgOiB2YWwgKyAncHgnO1xuICAgIGlmIChwcm9wLmluZGV4T2YoJ3JvdGF0ZScpID4gLTEgfHwgcHJvcC5pbmRleE9mKCdza2V3JykgPiAtMSkgcmV0dXJuIHZhbCArICdkZWcnO1xuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICAvLyBWYWx1ZXNcblxuICB2YXIgZ2V0Q1NTVmFsdWUgPSBmdW5jdGlvbihlbCwgcHJvcCkge1xuICAgIC8vIEZpcnN0IGNoZWNrIGlmIHByb3AgaXMgYSB2YWxpZCBDU1MgcHJvcGVydHlcbiAgICBpZiAocHJvcCBpbiBlbC5zdHlsZSkge1xuICAgICAgLy8gVGhlbiByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9yIGZhbGxiYWNrIHRvICcwJyB3aGVuIGdldFByb3BlcnR5VmFsdWUgZmFpbHNcbiAgICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKGVsKS5nZXRQcm9wZXJ0eVZhbHVlKHN0cmluZ1RvSHlwaGVucyhwcm9wKSkgfHwgJzAnO1xuICAgIH1cbiAgfVxuXG4gIHZhciBnZXRUcmFuc2Zvcm1WYWx1ZSA9IGZ1bmN0aW9uKGVsLCBwcm9wKSB7XG4gICAgdmFyIGRlZmF1bHRWYWwgPSBwcm9wLmluZGV4T2YoJ3NjYWxlJykgPiAtMSA/IDEgOiAwO1xuICAgIHZhciBzdHIgPSBlbC5zdHlsZS50cmFuc2Zvcm07XG4gICAgaWYgKCFzdHIpIHJldHVybiBkZWZhdWx0VmFsO1xuICAgIHZhciByZ3ggPSAvKFxcdyspXFwoKC4rPylcXCkvZztcbiAgICB2YXIgbWF0Y2ggPSBbXTtcbiAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgd2hpbGUgKG1hdGNoID0gcmd4LmV4ZWMoc3RyKSkge1xuICAgICAgcHJvcHMucHVzaChtYXRjaFsxXSk7XG4gICAgICB2YWx1ZXMucHVzaChtYXRjaFsyXSk7XG4gICAgfVxuICAgIHZhciB2YWwgPSB2YWx1ZXMuZmlsdGVyKGZ1bmN0aW9uKGYsIGkpIHsgcmV0dXJuIHByb3BzW2ldID09PSBwcm9wOyB9KTtcbiAgICByZXR1cm4gdmFsLmxlbmd0aCA/IHZhbFswXSA6IGRlZmF1bHRWYWw7XG4gIH1cblxuICB2YXIgZ2V0QW5pbWF0aW9uVHlwZSA9IGZ1bmN0aW9uKGVsLCBwcm9wKSB7XG4gICAgaWYgKCBpcy5kb20oZWwpICYmIGFycmF5Q29udGFpbnModmFsaWRUcmFuc2Zvcm1zLCBwcm9wKSkgcmV0dXJuICd0cmFuc2Zvcm0nO1xuICAgIGlmICggaXMuZG9tKGVsKSAmJiAoZWwuZ2V0QXR0cmlidXRlKHByb3ApIHx8IChpcy5zdmcoZWwpICYmIGVsW3Byb3BdKSkpIHJldHVybiAnYXR0cmlidXRlJztcbiAgICBpZiAoIGlzLmRvbShlbCkgJiYgKHByb3AgIT09ICd0cmFuc2Zvcm0nICYmIGdldENTU1ZhbHVlKGVsLCBwcm9wKSkpIHJldHVybiAnY3NzJztcbiAgICBpZiAoIWlzLm51bChlbFtwcm9wXSkgJiYgIWlzLnVuZChlbFtwcm9wXSkpIHJldHVybiAnb2JqZWN0JztcbiAgfVxuXG4gIHZhciBnZXRJbml0aWFsVGFyZ2V0VmFsdWUgPSBmdW5jdGlvbih0YXJnZXQsIHByb3ApIHtcbiAgICBzd2l0Y2ggKGdldEFuaW1hdGlvblR5cGUodGFyZ2V0LCBwcm9wKSkge1xuICAgICAgY2FzZSAndHJhbnNmb3JtJzogcmV0dXJuIGdldFRyYW5zZm9ybVZhbHVlKHRhcmdldCwgcHJvcCk7XG4gICAgICBjYXNlICdjc3MnOiByZXR1cm4gZ2V0Q1NTVmFsdWUodGFyZ2V0LCBwcm9wKTtcbiAgICAgIGNhc2UgJ2F0dHJpYnV0ZSc6IHJldHVybiB0YXJnZXQuZ2V0QXR0cmlidXRlKHByb3ApO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0W3Byb3BdIHx8IDA7XG4gIH1cblxuICB2YXIgZ2V0VmFsaWRWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlcywgdmFsLCBvcmlnaW5hbENTUykge1xuICAgIGlmIChpcy5jb2wodmFsKSkgcmV0dXJuIGNvbG9yVG9SZ2IodmFsKTtcbiAgICBpZiAoZ2V0VW5pdCh2YWwpKSByZXR1cm4gdmFsO1xuICAgIHZhciB1bml0ID0gZ2V0VW5pdCh2YWx1ZXMudG8pID8gZ2V0VW5pdCh2YWx1ZXMudG8pIDogZ2V0VW5pdCh2YWx1ZXMuZnJvbSk7XG4gICAgaWYgKCF1bml0ICYmIG9yaWdpbmFsQ1NTKSB1bml0ID0gZ2V0VW5pdChvcmlnaW5hbENTUyk7XG4gICAgcmV0dXJuIHVuaXQgPyB2YWwgKyB1bml0IDogdmFsO1xuICB9XG5cbiAgdmFyIGRlY29tcG9zZVZhbHVlID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIHJneCA9IC8tP1xcZCpcXC4/XFxkKy9nO1xuICAgIHJldHVybiB7XG4gICAgICBvcmlnaW5hbDogdmFsLFxuICAgICAgbnVtYmVyczogbnVtYmVyVG9TdHJpbmcodmFsKS5tYXRjaChyZ3gpID8gbnVtYmVyVG9TdHJpbmcodmFsKS5tYXRjaChyZ3gpLm1hcChOdW1iZXIpIDogWzBdLFxuICAgICAgc3RyaW5nczogbnVtYmVyVG9TdHJpbmcodmFsKS5zcGxpdChyZ3gpXG4gICAgfVxuICB9XG5cbiAgdmFyIHJlY29tcG9zZVZhbHVlID0gZnVuY3Rpb24obnVtYmVycywgc3RyaW5ncywgaW5pdGlhbFN0cmluZ3MpIHtcbiAgICByZXR1cm4gc3RyaW5ncy5yZWR1Y2UoZnVuY3Rpb24oYSwgYiwgaSkge1xuICAgICAgdmFyIGIgPSAoYiA/IGIgOiBpbml0aWFsU3RyaW5nc1tpIC0gMV0pO1xuICAgICAgcmV0dXJuIGEgKyBudW1iZXJzW2kgLSAxXSArIGI7XG4gICAgfSk7XG4gIH1cblxuICAvLyBBbmltYXRhYmxlc1xuXG4gIHZhciBnZXRBbmltYXRhYmxlcyA9IGZ1bmN0aW9uKHRhcmdldHMpIHtcbiAgICB2YXIgdGFyZ2V0cyA9IHRhcmdldHMgPyAoZmxhdHRlbkFycmF5KGlzLmFycih0YXJnZXRzKSA/IHRhcmdldHMubWFwKHRvQXJyYXkpIDogdG9BcnJheSh0YXJnZXRzKSkpIDogW107XG4gICAgcmV0dXJuIHRhcmdldHMubWFwKGZ1bmN0aW9uKHQsIGkpIHtcbiAgICAgIHJldHVybiB7IHRhcmdldDogdCwgaWQ6IGkgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFByb3BlcnRpZXNcblxuICB2YXIgZ2V0UHJvcGVydGllcyA9IGZ1bmN0aW9uKHBhcmFtcywgc2V0dGluZ3MpIHtcbiAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICBmb3IgKHZhciBwIGluIHBhcmFtcykge1xuICAgICAgaWYgKCFkZWZhdWx0U2V0dGluZ3MuaGFzT3duUHJvcGVydHkocCkgJiYgcCAhPT0gJ3RhcmdldHMnKSB7XG4gICAgICAgIHZhciBwcm9wID0gaXMub2JqKHBhcmFtc1twXSkgPyBjbG9uZU9iamVjdChwYXJhbXNbcF0pIDoge3ZhbHVlOiBwYXJhbXNbcF19O1xuICAgICAgICBwcm9wLm5hbWUgPSBwO1xuICAgICAgICBwcm9wcy5wdXNoKG1lcmdlT2JqZWN0cyhwcm9wLCBzZXR0aW5ncykpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvcHM7XG4gIH1cblxuICB2YXIgZ2V0UHJvcGVydGllc1ZhbHVlcyA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCwgdmFsdWUsIGkpIHtcbiAgICB2YXIgdmFsdWVzID0gdG9BcnJheSggaXMuZm5jKHZhbHVlKSA/IHZhbHVlKHRhcmdldCwgaSkgOiB2YWx1ZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZyb206ICh2YWx1ZXMubGVuZ3RoID4gMSkgPyB2YWx1ZXNbMF0gOiBnZXRJbml0aWFsVGFyZ2V0VmFsdWUodGFyZ2V0LCBwcm9wKSxcbiAgICAgIHRvOiAodmFsdWVzLmxlbmd0aCA+IDEpID8gdmFsdWVzWzFdIDogdmFsdWVzWzBdXG4gICAgfVxuICB9XG5cbiAgLy8gVHdlZW5zXG5cbiAgdmFyIGdldFR3ZWVuVmFsdWVzID0gZnVuY3Rpb24ocHJvcCwgdmFsdWVzLCB0eXBlLCB0YXJnZXQpIHtcbiAgICB2YXIgdmFsaWQgPSB7fTtcbiAgICBpZiAodHlwZSA9PT0gJ3RyYW5zZm9ybScpIHtcbiAgICAgIHZhbGlkLmZyb20gPSBwcm9wICsgJygnICsgYWRkRGVmYXVsdFRyYW5zZm9ybVVuaXQocHJvcCwgdmFsdWVzLmZyb20sIHZhbHVlcy50bykgKyAnKSc7XG4gICAgICB2YWxpZC50byA9IHByb3AgKyAnKCcgKyBhZGREZWZhdWx0VHJhbnNmb3JtVW5pdChwcm9wLCB2YWx1ZXMudG8pICsgJyknO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgb3JpZ2luYWxDU1MgPSAodHlwZSA9PT0gJ2NzcycpID8gZ2V0Q1NTVmFsdWUodGFyZ2V0LCBwcm9wKSA6IHVuZGVmaW5lZDtcbiAgICAgIHZhbGlkLmZyb20gPSBnZXRWYWxpZFZhbHVlKHZhbHVlcywgdmFsdWVzLmZyb20sIG9yaWdpbmFsQ1NTKTtcbiAgICAgIHZhbGlkLnRvID0gZ2V0VmFsaWRWYWx1ZSh2YWx1ZXMsIHZhbHVlcy50bywgb3JpZ2luYWxDU1MpO1xuICAgIH1cbiAgICByZXR1cm4geyBmcm9tOiBkZWNvbXBvc2VWYWx1ZSh2YWxpZC5mcm9tKSwgdG86IGRlY29tcG9zZVZhbHVlKHZhbGlkLnRvKSB9O1xuICB9XG5cbiAgdmFyIGdldFR3ZWVuc1Byb3BzID0gZnVuY3Rpb24oYW5pbWF0YWJsZXMsIHByb3BzKSB7XG4gICAgdmFyIHR3ZWVuc1Byb3BzID0gW107XG4gICAgYW5pbWF0YWJsZXMuZm9yRWFjaChmdW5jdGlvbihhbmltYXRhYmxlLCBpKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gYW5pbWF0YWJsZS50YXJnZXQ7XG4gICAgICByZXR1cm4gcHJvcHMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgIHZhciBhbmltVHlwZSA9IGdldEFuaW1hdGlvblR5cGUodGFyZ2V0LCBwcm9wLm5hbWUpO1xuICAgICAgICBpZiAoYW5pbVR5cGUpIHtcbiAgICAgICAgICB2YXIgdmFsdWVzID0gZ2V0UHJvcGVydGllc1ZhbHVlcyh0YXJnZXQsIHByb3AubmFtZSwgcHJvcC52YWx1ZSwgaSk7XG4gICAgICAgICAgdmFyIHR3ZWVuID0gY2xvbmVPYmplY3QocHJvcCk7XG4gICAgICAgICAgdHdlZW4uYW5pbWF0YWJsZXMgPSBhbmltYXRhYmxlO1xuICAgICAgICAgIHR3ZWVuLnR5cGUgPSBhbmltVHlwZTtcbiAgICAgICAgICB0d2Vlbi5mcm9tID0gZ2V0VHdlZW5WYWx1ZXMocHJvcC5uYW1lLCB2YWx1ZXMsIHR3ZWVuLnR5cGUsIHRhcmdldCkuZnJvbTtcbiAgICAgICAgICB0d2Vlbi50byA9IGdldFR3ZWVuVmFsdWVzKHByb3AubmFtZSwgdmFsdWVzLCB0d2Vlbi50eXBlLCB0YXJnZXQpLnRvO1xuICAgICAgICAgIHR3ZWVuLnJvdW5kID0gKGlzLmNvbCh2YWx1ZXMuZnJvbSkgfHwgdHdlZW4ucm91bmQpID8gMSA6IDA7XG4gICAgICAgICAgdHdlZW4uZGVsYXkgPSAoaXMuZm5jKHR3ZWVuLmRlbGF5KSA/IHR3ZWVuLmRlbGF5KHRhcmdldCwgaSwgYW5pbWF0YWJsZXMubGVuZ3RoKSA6IHR3ZWVuLmRlbGF5KSAvIGFuaW1hdGlvbi5zcGVlZDtcbiAgICAgICAgICB0d2Vlbi5kdXJhdGlvbiA9IChpcy5mbmModHdlZW4uZHVyYXRpb24pID8gdHdlZW4uZHVyYXRpb24odGFyZ2V0LCBpLCBhbmltYXRhYmxlcy5sZW5ndGgpIDogdHdlZW4uZHVyYXRpb24pIC8gYW5pbWF0aW9uLnNwZWVkO1xuICAgICAgICAgIHR3ZWVuc1Byb3BzLnB1c2godHdlZW4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdHdlZW5zUHJvcHM7XG4gIH1cblxuICB2YXIgZ2V0VHdlZW5zID0gZnVuY3Rpb24oYW5pbWF0YWJsZXMsIHByb3BzKSB7XG4gICAgdmFyIHR3ZWVuc1Byb3BzID0gZ2V0VHdlZW5zUHJvcHMoYW5pbWF0YWJsZXMsIHByb3BzKTtcbiAgICB2YXIgc3BsaXR0ZWRQcm9wcyA9IGdyb3VwQXJyYXlCeVByb3BzKHR3ZWVuc1Byb3BzLCBbJ25hbWUnLCAnZnJvbScsICd0bycsICdkZWxheScsICdkdXJhdGlvbiddKTtcbiAgICByZXR1cm4gc3BsaXR0ZWRQcm9wcy5tYXAoZnVuY3Rpb24odHdlZW5Qcm9wcykge1xuICAgICAgdmFyIHR3ZWVuID0gY2xvbmVPYmplY3QodHdlZW5Qcm9wc1swXSk7XG4gICAgICB0d2Vlbi5hbmltYXRhYmxlcyA9IHR3ZWVuUHJvcHMubWFwKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAuYW5pbWF0YWJsZXMgfSk7XG4gICAgICB0d2Vlbi50b3RhbER1cmF0aW9uID0gdHdlZW4uZGVsYXkgKyB0d2Vlbi5kdXJhdGlvbjtcbiAgICAgIHJldHVybiB0d2VlbjtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZXZlcnNlVHdlZW5zID0gZnVuY3Rpb24oYW5pbSwgZGVsYXlzKSB7XG4gICAgYW5pbS50d2VlbnMuZm9yRWFjaChmdW5jdGlvbih0d2Vlbikge1xuICAgICAgdmFyIHRvVmFsID0gdHdlZW4udG87XG4gICAgICB2YXIgZnJvbVZhbCA9IHR3ZWVuLmZyb207XG4gICAgICB2YXIgZGVsYXlWYWwgPSBhbmltLmR1cmF0aW9uIC0gKHR3ZWVuLmRlbGF5ICsgdHdlZW4uZHVyYXRpb24pO1xuICAgICAgdHdlZW4uZnJvbSA9IHRvVmFsO1xuICAgICAgdHdlZW4udG8gPSBmcm9tVmFsO1xuICAgICAgaWYgKGRlbGF5cykgdHdlZW4uZGVsYXkgPSBkZWxheVZhbDtcbiAgICB9KTtcbiAgICBhbmltLnJldmVyc2VkID0gYW5pbS5yZXZlcnNlZCA/IGZhbHNlIDogdHJ1ZTtcbiAgfVxuXG4gIHZhciBnZXRUd2VlbnNEdXJhdGlvbiA9IGZ1bmN0aW9uKHR3ZWVucykge1xuICAgIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCB0d2VlbnMubWFwKGZ1bmN0aW9uKHR3ZWVuKXsgcmV0dXJuIHR3ZWVuLnRvdGFsRHVyYXRpb247IH0pKTtcbiAgfVxuXG4gIHZhciBnZXRUd2VlbnNEZWxheSA9IGZ1bmN0aW9uKHR3ZWVucykge1xuICAgIHJldHVybiBNYXRoLm1pbi5hcHBseShNYXRoLCB0d2VlbnMubWFwKGZ1bmN0aW9uKHR3ZWVuKXsgcmV0dXJuIHR3ZWVuLmRlbGF5OyB9KSk7XG4gIH1cblxuICAvLyB3aWxsLWNoYW5nZVxuXG4gIHZhciBnZXRXaWxsQ2hhbmdlID0gZnVuY3Rpb24oYW5pbSkge1xuICAgIHZhciBwcm9wcyA9IFtdO1xuICAgIHZhciBlbHMgPSBbXTtcbiAgICBhbmltLnR3ZWVucy5mb3JFYWNoKGZ1bmN0aW9uKHR3ZWVuKSB7XG4gICAgICBpZiAodHdlZW4udHlwZSA9PT0gJ2NzcycgfHwgdHdlZW4udHlwZSA9PT0gJ3RyYW5zZm9ybScgKSB7XG4gICAgICAgIHByb3BzLnB1c2godHdlZW4udHlwZSA9PT0gJ2NzcycgPyBzdHJpbmdUb0h5cGhlbnModHdlZW4ubmFtZSkgOiAndHJhbnNmb3JtJyk7XG4gICAgICAgIHR3ZWVuLmFuaW1hdGFibGVzLmZvckVhY2goZnVuY3Rpb24oYW5pbWF0YWJsZSkgeyBlbHMucHVzaChhbmltYXRhYmxlLnRhcmdldCk7IH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBwcm9wZXJ0aWVzOiByZW1vdmVBcnJheUR1cGxpY2F0ZXMocHJvcHMpLmpvaW4oJywgJyksXG4gICAgICBlbGVtZW50czogcmVtb3ZlQXJyYXlEdXBsaWNhdGVzKGVscylcbiAgICB9XG4gIH1cblxuICB2YXIgc2V0V2lsbENoYW5nZSA9IGZ1bmN0aW9uKGFuaW0pIHtcbiAgICB2YXIgd2lsbENoYW5nZSA9IGdldFdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgd2lsbENoYW5nZS5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIGVsZW1lbnQuc3R5bGUud2lsbENoYW5nZSA9IHdpbGxDaGFuZ2UucHJvcGVydGllcztcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZW1vdmVXaWxsQ2hhbmdlID0gZnVuY3Rpb24oYW5pbSkge1xuICAgIHZhciB3aWxsQ2hhbmdlID0gZ2V0V2lsbENoYW5nZShhbmltKTtcbiAgICB3aWxsQ2hhbmdlLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgZWxlbWVudC5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnd2lsbC1jaGFuZ2UnKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIFN2ZyBwYXRoICovXG5cbiAgdmFyIGdldFBhdGhQcm9wcyA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICB2YXIgZWwgPSBpcy5zdHIocGF0aCkgPyBzZWxlY3RTdHJpbmcocGF0aClbMF0gOiBwYXRoO1xuICAgIHJldHVybiB7XG4gICAgICBwYXRoOiBlbCxcbiAgICAgIHZhbHVlOiBlbC5nZXRUb3RhbExlbmd0aCgpXG4gICAgfVxuICB9XG5cbiAgdmFyIHNuYXBQcm9ncmVzc1RvUGF0aCA9IGZ1bmN0aW9uKHR3ZWVuLCBwcm9ncmVzcykge1xuICAgIHZhciBwYXRoRWwgPSB0d2Vlbi5wYXRoO1xuICAgIHZhciBwYXRoUHJvZ3Jlc3MgPSB0d2Vlbi52YWx1ZSAqIHByb2dyZXNzO1xuICAgIHZhciBwb2ludCA9IGZ1bmN0aW9uKG9mZnNldCkge1xuICAgICAgdmFyIG8gPSBvZmZzZXQgfHwgMDtcbiAgICAgIHZhciBwID0gcHJvZ3Jlc3MgPiAxID8gdHdlZW4udmFsdWUgKyBvIDogcGF0aFByb2dyZXNzICsgbztcbiAgICAgIHJldHVybiBwYXRoRWwuZ2V0UG9pbnRBdExlbmd0aChwKTtcbiAgICB9XG4gICAgdmFyIHAgPSBwb2ludCgpO1xuICAgIHZhciBwMCA9IHBvaW50KC0xKTtcbiAgICB2YXIgcDEgPSBwb2ludCgrMSk7XG4gICAgc3dpdGNoICh0d2Vlbi5uYW1lKSB7XG4gICAgICBjYXNlICd0cmFuc2xhdGVYJzogcmV0dXJuIHAueDtcbiAgICAgIGNhc2UgJ3RyYW5zbGF0ZVknOiByZXR1cm4gcC55O1xuICAgICAgY2FzZSAncm90YXRlJzogcmV0dXJuIE1hdGguYXRhbjIocDEueSAtIHAwLnksIHAxLnggLSBwMC54KSAqIDE4MCAvIE1hdGguUEk7XG4gICAgfVxuICB9XG5cbiAgLy8gUHJvZ3Jlc3NcblxuICB2YXIgZ2V0VHdlZW5Qcm9ncmVzcyA9IGZ1bmN0aW9uKHR3ZWVuLCB0aW1lKSB7XG4gICAgdmFyIGVsYXBzZWQgPSBNYXRoLm1pbihNYXRoLm1heCh0aW1lIC0gdHdlZW4uZGVsYXksIDApLCB0d2Vlbi5kdXJhdGlvbik7XG4gICAgdmFyIHBlcmNlbnQgPSBlbGFwc2VkIC8gdHdlZW4uZHVyYXRpb247XG4gICAgdmFyIHByb2dyZXNzID0gdHdlZW4udG8ubnVtYmVycy5tYXAoZnVuY3Rpb24obnVtYmVyLCBwKSB7XG4gICAgICB2YXIgc3RhcnQgPSB0d2Vlbi5mcm9tLm51bWJlcnNbcF07XG4gICAgICB2YXIgZWFzZWQgPSBlYXNpbmdzW3R3ZWVuLmVhc2luZ10ocGVyY2VudCwgdHdlZW4uZWxhc3RpY2l0eSk7XG4gICAgICB2YXIgdmFsID0gdHdlZW4ucGF0aCA/IHNuYXBQcm9ncmVzc1RvUGF0aCh0d2VlbiwgZWFzZWQpIDogc3RhcnQgKyBlYXNlZCAqIChudW1iZXIgLSBzdGFydCk7XG4gICAgICB2YWwgPSB0d2Vlbi5yb3VuZCA/IE1hdGgucm91bmQodmFsICogdHdlZW4ucm91bmQpIC8gdHdlZW4ucm91bmQgOiB2YWw7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH0pO1xuICAgIHJldHVybiByZWNvbXBvc2VWYWx1ZShwcm9ncmVzcywgdHdlZW4udG8uc3RyaW5ncywgdHdlZW4uZnJvbS5zdHJpbmdzKTtcbiAgfVxuXG4gIHZhciBzZXRBbmltYXRpb25Qcm9ncmVzcyA9IGZ1bmN0aW9uKGFuaW0sIHRpbWUpIHtcbiAgICB2YXIgdHJhbnNmb3JtcztcbiAgICBhbmltLmN1cnJlbnRUaW1lID0gdGltZTtcbiAgICBhbmltLnByb2dyZXNzID0gKHRpbWUgLyBhbmltLmR1cmF0aW9uKSAqIDEwMDtcbiAgICBmb3IgKHZhciB0ID0gMDsgdCA8IGFuaW0udHdlZW5zLmxlbmd0aDsgdCsrKSB7XG4gICAgICB2YXIgdHdlZW4gPSBhbmltLnR3ZWVuc1t0XTtcbiAgICAgIHR3ZWVuLmN1cnJlbnRWYWx1ZSA9IGdldFR3ZWVuUHJvZ3Jlc3ModHdlZW4sIHRpbWUpO1xuICAgICAgdmFyIHByb2dyZXNzID0gdHdlZW4uY3VycmVudFZhbHVlO1xuICAgICAgZm9yICh2YXIgYSA9IDA7IGEgPCB0d2Vlbi5hbmltYXRhYmxlcy5sZW5ndGg7IGErKykge1xuICAgICAgICB2YXIgYW5pbWF0YWJsZSA9IHR3ZWVuLmFuaW1hdGFibGVzW2FdO1xuICAgICAgICB2YXIgaWQgPSBhbmltYXRhYmxlLmlkO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gYW5pbWF0YWJsZS50YXJnZXQ7XG4gICAgICAgIHZhciBuYW1lID0gdHdlZW4ubmFtZTtcbiAgICAgICAgc3dpdGNoICh0d2Vlbi50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnY3NzJzogdGFyZ2V0LnN0eWxlW25hbWVdID0gcHJvZ3Jlc3M7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2F0dHJpYnV0ZSc6IHRhcmdldC5zZXRBdHRyaWJ1dGUobmFtZSwgcHJvZ3Jlc3MpOyBicmVhaztcbiAgICAgICAgICBjYXNlICdvYmplY3QnOiB0YXJnZXRbbmFtZV0gPSBwcm9ncmVzczsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndHJhbnNmb3JtJzpcbiAgICAgICAgICBpZiAoIXRyYW5zZm9ybXMpIHRyYW5zZm9ybXMgPSB7fTtcbiAgICAgICAgICBpZiAoIXRyYW5zZm9ybXNbaWRdKSB0cmFuc2Zvcm1zW2lkXSA9IFtdO1xuICAgICAgICAgIHRyYW5zZm9ybXNbaWRdLnB1c2gocHJvZ3Jlc3MpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0cmFuc2Zvcm1zKSB7XG4gICAgICBpZiAoIXRyYW5zZm9ybSkgdHJhbnNmb3JtID0gKGdldENTU1ZhbHVlKGRvY3VtZW50LmJvZHksIHRyYW5zZm9ybVN0cikgPyAnJyA6ICctd2Via2l0LScpICsgdHJhbnNmb3JtU3RyO1xuICAgICAgZm9yICh2YXIgdCBpbiB0cmFuc2Zvcm1zKSB7XG4gICAgICAgIGFuaW0uYW5pbWF0YWJsZXNbdF0udGFyZ2V0LnN0eWxlW3RyYW5zZm9ybV0gPSB0cmFuc2Zvcm1zW3RdLmpvaW4oJyAnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBBbmltYXRpb25cblxuICB2YXIgY3JlYXRlQW5pbWF0aW9uID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgdmFyIGFuaW0gPSB7fTtcbiAgICBhbmltLmFuaW1hdGFibGVzID0gZ2V0QW5pbWF0YWJsZXMocGFyYW1zLnRhcmdldHMpO1xuICAgIGFuaW0uc2V0dGluZ3MgPSBtZXJnZU9iamVjdHMocGFyYW1zLCBkZWZhdWx0U2V0dGluZ3MpO1xuICAgIGFuaW0ucHJvcGVydGllcyA9IGdldFByb3BlcnRpZXMocGFyYW1zLCBhbmltLnNldHRpbmdzKTtcbiAgICBhbmltLnR3ZWVucyA9IGdldFR3ZWVucyhhbmltLmFuaW1hdGFibGVzLCBhbmltLnByb3BlcnRpZXMpO1xuICAgIGFuaW0uZHVyYXRpb24gPSBhbmltLnR3ZWVucy5sZW5ndGggPyBnZXRUd2VlbnNEdXJhdGlvbihhbmltLnR3ZWVucykgOiBwYXJhbXMuZHVyYXRpb247XG4gICAgYW5pbS5kZWxheSA9IGFuaW0udHdlZW5zLmxlbmd0aCA/IGdldFR3ZWVuc0RlbGF5KGFuaW0udHdlZW5zKSA6IHBhcmFtcy5kZWxheTtcbiAgICBhbmltLmN1cnJlbnRUaW1lID0gMDtcbiAgICBhbmltLnByb2dyZXNzID0gMDtcbiAgICBhbmltLmVuZGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIGFuaW07XG4gIH1cblxuICAvLyBQdWJsaWNcblxuICB2YXIgYW5pbWF0aW9ucyA9IFtdO1xuICB2YXIgcmFmID0gMDtcblxuICB2YXIgZW5naW5lID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBwbGF5ID0gZnVuY3Rpb24oKSB7IHJhZiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTsgfTtcbiAgICB2YXIgc3RlcCA9IGZ1bmN0aW9uKHQpIHtcbiAgICAgIGlmIChhbmltYXRpb25zLmxlbmd0aCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuaW1hdGlvbnMubGVuZ3RoOyBpKyspIGFuaW1hdGlvbnNbaV0udGljayh0KTtcbiAgICAgICAgcGxheSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUocmFmKTtcbiAgICAgICAgcmFmID0gMDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBsYXk7XG4gIH0pKCk7XG5cbiAgdmFyIGFuaW1hdGlvbiA9IGZ1bmN0aW9uKHBhcmFtcykge1xuXG4gICAgdmFyIGFuaW0gPSBjcmVhdGVBbmltYXRpb24ocGFyYW1zKTtcbiAgICB2YXIgdGltZSA9IHt9O1xuXG4gICAgYW5pbS50aWNrID0gZnVuY3Rpb24obm93KSB7XG4gICAgICBhbmltLmVuZGVkID0gZmFsc2U7XG4gICAgICBpZiAoIXRpbWUuc3RhcnQpIHRpbWUuc3RhcnQgPSBub3c7XG4gICAgICB0aW1lLmN1cnJlbnQgPSBNYXRoLm1pbihNYXRoLm1heCh0aW1lLmxhc3QgKyBub3cgLSB0aW1lLnN0YXJ0LCAwKSwgYW5pbS5kdXJhdGlvbik7XG4gICAgICBzZXRBbmltYXRpb25Qcm9ncmVzcyhhbmltLCB0aW1lLmN1cnJlbnQpO1xuICAgICAgdmFyIHMgPSBhbmltLnNldHRpbmdzO1xuICAgICAgaWYgKHRpbWUuY3VycmVudCA+PSBhbmltLmRlbGF5KSB7XG4gICAgICAgIGlmIChzLmJlZ2luKSBzLmJlZ2luKGFuaW0pOyBzLmJlZ2luID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAocy51cGRhdGUpIHMudXBkYXRlKGFuaW0pO1xuICAgICAgfVxuICAgICAgaWYgKHRpbWUuY3VycmVudCA+PSBhbmltLmR1cmF0aW9uKSB7XG4gICAgICAgIGlmIChzLmxvb3ApIHtcbiAgICAgICAgICB0aW1lLnN0YXJ0ID0gbm93O1xuICAgICAgICAgIGlmIChzLmRpcmVjdGlvbiA9PT0gJ2FsdGVybmF0ZScpIHJldmVyc2VUd2VlbnMoYW5pbSwgdHJ1ZSk7XG4gICAgICAgICAgaWYgKGlzLm51bShzLmxvb3ApKSBzLmxvb3AtLTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhbmltLmVuZGVkID0gdHJ1ZTtcbiAgICAgICAgICBhbmltLnBhdXNlKCk7XG4gICAgICAgICAgaWYgKHMuY29tcGxldGUpIHMuY29tcGxldGUoYW5pbSk7XG4gICAgICAgIH1cbiAgICAgICAgdGltZS5sYXN0ID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhbmltLnNlZWsgPSBmdW5jdGlvbihwcm9ncmVzcykge1xuICAgICAgc2V0QW5pbWF0aW9uUHJvZ3Jlc3MoYW5pbSwgKHByb2dyZXNzIC8gMTAwKSAqIGFuaW0uZHVyYXRpb24pO1xuICAgIH1cblxuICAgIGFuaW0ucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlbW92ZVdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgICB2YXIgaSA9IGFuaW1hdGlvbnMuaW5kZXhPZihhbmltKTtcbiAgICAgIGlmIChpID4gLTEpIGFuaW1hdGlvbnMuc3BsaWNlKGksIDEpO1xuICAgIH1cblxuICAgIGFuaW0ucGxheSA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgYW5pbS5wYXVzZSgpO1xuICAgICAgaWYgKHBhcmFtcykgYW5pbSA9IG1lcmdlT2JqZWN0cyhjcmVhdGVBbmltYXRpb24obWVyZ2VPYmplY3RzKHBhcmFtcywgYW5pbS5zZXR0aW5ncykpLCBhbmltKTtcbiAgICAgIHRpbWUuc3RhcnQgPSAwO1xuICAgICAgdGltZS5sYXN0ID0gYW5pbS5lbmRlZCA/IDAgOiBhbmltLmN1cnJlbnRUaW1lO1xuICAgICAgdmFyIHMgPSBhbmltLnNldHRpbmdzO1xuICAgICAgaWYgKHMuZGlyZWN0aW9uID09PSAncmV2ZXJzZScpIHJldmVyc2VUd2VlbnMoYW5pbSk7XG4gICAgICBpZiAocy5kaXJlY3Rpb24gPT09ICdhbHRlcm5hdGUnICYmICFzLmxvb3ApIHMubG9vcCA9IDE7XG4gICAgICBzZXRXaWxsQ2hhbmdlKGFuaW0pO1xuICAgICAgYW5pbWF0aW9ucy5wdXNoKGFuaW0pO1xuICAgICAgaWYgKCFyYWYpIGVuZ2luZSgpO1xuICAgIH1cblxuICAgIGFuaW0ucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGFuaW0ucmV2ZXJzZWQpIHJldmVyc2VUd2VlbnMoYW5pbSk7XG4gICAgICBhbmltLnBhdXNlKCk7XG4gICAgICBhbmltLnNlZWsoMCk7XG4gICAgICBhbmltLnBsYXkoKTtcbiAgICB9XG5cbiAgICBpZiAoYW5pbS5zZXR0aW5ncy5hdXRvcGxheSkgYW5pbS5wbGF5KCk7XG5cbiAgICByZXR1cm4gYW5pbTtcblxuICB9XG5cbiAgLy8gUmVtb3ZlIG9uZSBvciBtdWx0aXBsZSB0YXJnZXRzIGZyb20gYWxsIGFjdGl2ZSBhbmltYXRpb25zLlxuXG4gIHZhciByZW1vdmUgPSBmdW5jdGlvbihlbGVtZW50cykge1xuICAgIHZhciB0YXJnZXRzID0gZmxhdHRlbkFycmF5KGlzLmFycihlbGVtZW50cykgPyBlbGVtZW50cy5tYXAodG9BcnJheSkgOiB0b0FycmF5KGVsZW1lbnRzKSk7XG4gICAgZm9yICh2YXIgaSA9IGFuaW1hdGlvbnMubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgYW5pbWF0aW9uID0gYW5pbWF0aW9uc1tpXTtcbiAgICAgIHZhciB0d2VlbnMgPSBhbmltYXRpb24udHdlZW5zO1xuICAgICAgZm9yICh2YXIgdCA9IHR3ZWVucy5sZW5ndGgtMTsgdCA+PSAwOyB0LS0pIHtcbiAgICAgICAgdmFyIGFuaW1hdGFibGVzID0gdHdlZW5zW3RdLmFuaW1hdGFibGVzO1xuICAgICAgICBmb3IgKHZhciBhID0gYW5pbWF0YWJsZXMubGVuZ3RoLTE7IGEgPj0gMDsgYS0tKSB7XG4gICAgICAgICAgaWYgKGFycmF5Q29udGFpbnModGFyZ2V0cywgYW5pbWF0YWJsZXNbYV0udGFyZ2V0KSkge1xuICAgICAgICAgICAgYW5pbWF0YWJsZXMuc3BsaWNlKGEsIDEpO1xuICAgICAgICAgICAgaWYgKCFhbmltYXRhYmxlcy5sZW5ndGgpIHR3ZWVucy5zcGxpY2UodCwgMSk7XG4gICAgICAgICAgICBpZiAoIXR3ZWVucy5sZW5ndGgpIGFuaW1hdGlvbi5wYXVzZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFuaW1hdGlvbi52ZXJzaW9uID0gdmVyc2lvbjtcbiAgYW5pbWF0aW9uLnNwZWVkID0gMTtcbiAgYW5pbWF0aW9uLmxpc3QgPSBhbmltYXRpb25zO1xuICBhbmltYXRpb24ucmVtb3ZlID0gcmVtb3ZlO1xuICBhbmltYXRpb24uZWFzaW5ncyA9IGVhc2luZ3M7XG4gIGFuaW1hdGlvbi5nZXRWYWx1ZSA9IGdldEluaXRpYWxUYXJnZXRWYWx1ZTtcbiAgYW5pbWF0aW9uLnBhdGggPSBnZXRQYXRoUHJvcHM7XG4gIGFuaW1hdGlvbi5yYW5kb20gPSByYW5kb207XG5cbiAgcmV0dXJuIGFuaW1hdGlvbjtcblxufSkpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FuaW1lanMvYW5pbWUuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBUZXh0R2VvbWV0cnkgY29tcG9uZW50IGZvciBBLUZyYW1lLlxuICovXG52YXIgZGVidWcgPSBBRlJBTUUudXRpbHMuZGVidWc7XG5cbnZhciBlcnJvciA9IGRlYnVnKCdhZnJhbWUtdGV4dC1jb21wb25lbnQ6ZXJyb3InKTtcblxudmFyIGZvbnRMb2FkZXIgPSBuZXcgVEhSRUUuRm9udExvYWRlcigpO1xuXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3RleHQnLCB7XG4gIHNjaGVtYToge1xuICAgIGJldmVsRW5hYmxlZDoge2RlZmF1bHQ6IGZhbHNlfSxcbiAgICBiZXZlbFNpemU6IHtkZWZhdWx0OiA4LCBtaW46IDB9LFxuICAgIGJldmVsVGhpY2tuZXNzOiB7ZGVmYXVsdDogMTIsIG1pbjogMH0sXG4gICAgY3VydmVTZWdtZW50czoge2RlZmF1bHQ6IDEyLCBtaW46IDB9LFxuICAgIGZvbnQ6IHt0eXBlOiAnYXNzZXQnLCBkZWZhdWx0OiAnaHR0cHM6Ly9yYXdnaXQuY29tL25nb2tldmluL2tmcmFtZS9tYXN0ZXIvY29tcG9uZW50cy90ZXh0L2xpYi9oZWx2ZXRpa2VyX3JlZ3VsYXIudHlwZWZhY2UuanNvbid9LFxuICAgIGhlaWdodDoge2RlZmF1bHQ6IDAuMDUsIG1pbjogMH0sXG4gICAgc2l6ZToge2RlZmF1bHQ6IDAuNSwgbWluOiAwfSxcbiAgICBzdHlsZToge2RlZmF1bHQ6ICdub3JtYWwnLCBvbmVPZjogWydub3JtYWwnLCAnaXRhbGljcyddfSxcbiAgICB0ZXh0OiB7ZGVmYXVsdDogJyd9LFxuICAgIHdlaWdodDoge2RlZmF1bHQ6ICdub3JtYWwnLCBvbmVPZjogWydub3JtYWwnLCAnYm9sZCddfVxuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBjb21wb25lbnQgaXMgYXR0YWNoZWQgYW5kIHdoZW4gY29tcG9uZW50IGRhdGEgY2hhbmdlcy5cbiAgICogR2VuZXJhbGx5IG1vZGlmaWVzIHRoZSBlbnRpdHkgYmFzZWQgb24gdGhlIGRhdGEuXG4gICAqL1xuICB1cGRhdGU6IGZ1bmN0aW9uIChvbGREYXRhKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcblxuICAgIHZhciBtZXNoID0gZWwuZ2V0T3JDcmVhdGVPYmplY3QzRCgnbWVzaCcsIFRIUkVFLk1lc2gpO1xuICAgIGlmIChkYXRhLmZvbnQuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuICAgICAgLy8gTG9hZCB0eXBlZmFjZS5qc29uIGZvbnQuXG4gICAgICBmb250TG9hZGVyLmxvYWQoZGF0YS5mb250LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgdmFyIHRleHREYXRhID0gQUZSQU1FLnV0aWxzLmNsb25lKGRhdGEpO1xuICAgICAgICB0ZXh0RGF0YS5mb250ID0gcmVzcG9uc2U7XG4gICAgICAgIG1lc2guZ2VvbWV0cnkgPSBuZXcgVEhSRUUuVGV4dEdlb21ldHJ5KGRhdGEudGV4dCwgdGV4dERhdGEpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChkYXRhLmZvbnQuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgLy8gU2V0IGZvbnQgaWYgYWxyZWFkeSBoYXZlIGEgdHlwZWZhY2UuanNvbiB0aHJvdWdoIHNldEF0dHJpYnV0ZS5cbiAgICAgIG1lc2guZ2VvbWV0cnkgPSBuZXcgVEhSRUUuVGV4dEdlb21ldHJ5KGRhdGEudGV4dCwgZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yKCdNdXN0IHByb3ZpZGUgYGZvbnRgICh0eXBlZmFjZS5qc29uKSBvciBgZm9udFBhdGhgIChzdHJpbmcpIHRvIHRleHQgY29tcG9uZW50LicpO1xuICAgIH1cbiAgfVxufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYWZyYW1lLXRleHQtY29tcG9uZW50L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qIGdsb2JhbCBBRlJBTUUsIFRIUkVFICovXHJcbmlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xyXG4gIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGF0dGVtcHRlZCB0byByZWdpc3RlciBiZWZvcmUgQUZSQU1FIHdhcyBhdmFpbGFibGUuJyk7XHJcbn1cclxuXHJcbnZhciBjcmVhdGVUZXh0ID0gcmVxdWlyZSgndGhyZWUtYm1mb250LXRleHQnKTtcclxudmFyIGxvYWRGb250ID0gcmVxdWlyZSgnbG9hZC1ibWZvbnQnKTtcclxudmFyIFNERlNoYWRlciA9IHJlcXVpcmUoJy4vbGliL3NoYWRlcnMvc2RmJyk7XHJcblxyXG5yZXF1aXJlKCcuL2V4dHJhcy90ZXh0LXByaW1pdGl2ZS5qcycpOyAvLyBSZWdpc3RlciBleHBlcmltZW50YWwgdGV4dCBwcmltaXRpdmVcclxuXHJcbi8qKlxyXG4gKiBibWZvbnQgdGV4dCBjb21wb25lbnQgZm9yIEEtRnJhbWUuXHJcbiAqL1xyXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2JtZm9udC10ZXh0Jywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgdGV4dDoge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgfSxcclxuICAgIHdpZHRoOiB7XHJcbiAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICBkZWZhdWx0OiAxMDAwXHJcbiAgICB9LFxyXG4gICAgYWxpZ246IHtcclxuICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgIGRlZmF1bHQ6ICdsZWZ0J1xyXG4gICAgfSxcclxuICAgIGxldHRlclNwYWNpbmc6IHtcclxuICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgIGRlZmF1bHQ6IDBcclxuICAgIH0sXHJcbiAgICBsaW5lSGVpZ2h0OiB7XHJcbiAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICBkZWZhdWx0OiAzOFxyXG4gICAgfSxcclxuICAgIGZudDoge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgZGVmYXVsdDogJ2h0dHBzOi8vY2RuLnJhd2dpdC5jb20vYnJ5aWsvYWZyYW1lLWJtZm9udC10ZXh0LWNvbXBvbmVudC9hYTA2NTVjZjkwZjY0NmUxMmM0MGFiNDcwOGVhOTBiNDY4NmNmYjQ1L2Fzc2V0cy9EZWphVnUtc2RmLmZudCdcclxuICAgIH0sXHJcbiAgICBmbnRJbWFnZToge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgZGVmYXVsdDogJ2h0dHBzOi8vY2RuLnJhd2dpdC5jb20vYnJ5aWsvYWZyYW1lLWJtZm9udC10ZXh0LWNvbXBvbmVudC9hYTA2NTVjZjkwZjY0NmUxMmM0MGFiNDcwOGVhOTBiNDY4NmNmYjQ1L2Fzc2V0cy9EZWphVnUtc2RmLnBuZydcclxuICAgIH0sXHJcbiAgICBtb2RlOiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICBkZWZhdWx0OiAnbm9ybWFsJ1xyXG4gICAgfSxcclxuICAgIGNvbG9yOiB7XHJcbiAgICAgIHR5cGU6ICdjb2xvcicsXHJcbiAgICAgIGRlZmF1bHQ6ICcjMDAwJ1xyXG4gICAgfSxcclxuICAgIG9wYWNpdHk6IHtcclxuICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgIGRlZmF1bHQ6ICcxLjAnXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gY29tcG9uZW50IGlzIGF0dGFjaGVkIGFuZCB3aGVuIGNvbXBvbmVudCBkYXRhIGNoYW5nZXMuXHJcbiAgICogR2VuZXJhbGx5IG1vZGlmaWVzIHRoZSBlbnRpdHkgYmFzZWQgb24gdGhlIGRhdGEuXHJcbiAgICovXHJcbiAgdXBkYXRlOiBmdW5jdGlvbiAob2xkRGF0YSkge1xyXG4gICAgLy8gRW50aXR5IGRhdGFcclxuICAgIHZhciBlbCA9IHRoaXMuZWw7XHJcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcclxuXHJcbiAgICAvLyBVc2UgZm9udExvYWRlciB1dGlsaXR5IHRvIGxvYWQgJ2ZudCcgYW5kIHRleHR1cmVcclxuICAgIGZvbnRMb2FkZXIoe1xyXG4gICAgICBmb250OiBkYXRhLmZudCxcclxuICAgICAgaW1hZ2U6IGRhdGEuZm50SW1hZ2VcclxuICAgIH0sIHN0YXJ0KTtcclxuXHJcbiAgICBmdW5jdGlvbiBzdGFydCAoZm9udCwgdGV4dHVyZSkge1xyXG4gICAgICAvLyBTZXR1cCB0ZXh0dXJlLCBzaG91bGQgc2V0IGFuaXNvdHJvcHkgdG8gdXNlciBtYXhpbXVtLi4uXHJcbiAgICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgICB0ZXh0dXJlLmFuaXNvdHJvcHkgPSAxNjtcclxuXHJcbiAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgIGZvbnQ6IGZvbnQsIC8vIHRoZSBiaXRtYXAgZm9udCBkZWZpbml0aW9uXHJcbiAgICAgICAgdGV4dDogZGF0YS50ZXh0LCAvLyB0aGUgc3RyaW5nIHRvIHJlbmRlclxyXG4gICAgICAgIHdpZHRoOiBkYXRhLndpZHRoLFxyXG4gICAgICAgIGFsaWduOiBkYXRhLmFsaWduLFxyXG4gICAgICAgIGxldHRlclNwYWNpbmc6IGRhdGEubGV0dGVyU3BhY2luZyxcclxuICAgICAgICBsaW5lSGVpZ2h0OiBkYXRhLmxpbmVIZWlnaHQsXHJcbiAgICAgICAgbW9kZTogZGF0YS5tb2RlXHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBDcmVhdGUgdGV4dCBnZW9tZXRyeVxyXG4gICAgICB2YXIgZ2VvbWV0cnkgPSBjcmVhdGVUZXh0KG9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gVXNlICcuL2xpYi9zaGFkZXJzL3NkZicgdG8gaGVscCBidWlsZCBhIHNoYWRlciBtYXRlcmlhbFxyXG4gICAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUmF3U2hhZGVyTWF0ZXJpYWwoU0RGU2hhZGVyKHtcclxuICAgICAgICBtYXA6IHRleHR1cmUsXHJcbiAgICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcclxuICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcclxuICAgICAgICBjb2xvcjogZGF0YS5jb2xvcixcclxuICAgICAgICBvcGFjaXR5OiBkYXRhLm9wYWNpdHlcclxuICAgICAgfSkpO1xyXG5cclxuICAgICAgdmFyIHRleHQgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG5cclxuICAgICAgLy8gUm90YXRlIHNvIHRleHQgZmFjZXMgdGhlIGNhbWVyYVxyXG4gICAgICB0ZXh0LnJvdGF0aW9uLnkgPSBNYXRoLlBJO1xyXG5cclxuICAgICAgLy8gU2NhbGUgdGV4dCBkb3duXHJcbiAgICAgIHRleHQuc2NhbGUubXVsdGlwbHlTY2FsYXIoLTAuMDA1KTtcclxuXHJcbiAgICAgIC8vIFJlZ2lzdGVyIHRleHQgbWVzaCB1bmRlciBlbnRpdHkncyBvYmplY3QzRE1hcFxyXG4gICAgICBlbC5zZXRPYmplY3QzRCgnYm1mb250LXRleHQnLCB0ZXh0KTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGNvbXBvbmVudCBpcyByZW1vdmVkIChlLmcuLCB2aWEgcmVtb3ZlQXR0cmlidXRlKS5cclxuICAgKiBHZW5lcmFsbHkgdW5kb2VzIGFsbCBtb2RpZmljYXRpb25zIHRvIHRoZSBlbnRpdHkuXHJcbiAgICovXHJcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVsLnJlbW92ZU9iamVjdDNEKCdibWZvbnQtdGV4dCcpO1xyXG4gIH1cclxufSk7XHJcblxyXG4vKipcclxuICogQSB1dGlsaXR5IHRvIGxvYWQgYSBmb250IHdpdGggYm1mb250LWxvYWRcclxuICogYW5kIGEgdGV4dHVyZSB3aXRoIFRocmVlLlRleHR1cmVMb2FkZXIoKVxyXG4gKi9cclxuZnVuY3Rpb24gZm9udExvYWRlciAob3B0LCBjYikge1xyXG4gIGxvYWRGb250KG9wdC5mb250LCBmdW5jdGlvbiAoZXJyLCBmb250KSB7XHJcbiAgICBpZiAoZXJyKSB7XHJcbiAgICAgIHRocm93IGVycjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGV4dHVyZUxvYWRlciA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCk7XHJcbiAgICB0ZXh0dXJlTG9hZGVyLmxvYWQob3B0LmltYWdlLCBmdW5jdGlvbiAodGV4dHVyZSkge1xyXG4gICAgICBjYihmb250LCB0ZXh0dXJlKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBjcmVhdGVMYXlvdXQgPSByZXF1aXJlKCdsYXlvdXQtYm1mb250LXRleHQnKVxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxudmFyIGNyZWF0ZUluZGljZXMgPSByZXF1aXJlKCdxdWFkLWluZGljZXMnKVxudmFyIGJ1ZmZlciA9IHJlcXVpcmUoJ3RocmVlLWJ1ZmZlci12ZXJ0ZXgtZGF0YScpXG52YXIgYXNzaWduID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpXG5cbnZhciB2ZXJ0aWNlcyA9IHJlcXVpcmUoJy4vbGliL3ZlcnRpY2VzJylcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vbGliL3V0aWxzJylcblxudmFyIEJhc2UgPSBUSFJFRS5CdWZmZXJHZW9tZXRyeVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZVRleHRHZW9tZXRyeSAob3B0KSB7XG4gIHJldHVybiBuZXcgVGV4dEdlb21ldHJ5KG9wdClcbn1cblxuZnVuY3Rpb24gVGV4dEdlb21ldHJ5IChvcHQpIHtcbiAgQmFzZS5jYWxsKHRoaXMpXG5cbiAgaWYgKHR5cGVvZiBvcHQgPT09ICdzdHJpbmcnKSB7XG4gICAgb3B0ID0geyB0ZXh0OiBvcHQgfVxuICB9XG5cbiAgLy8gdXNlIHRoZXNlIGFzIGRlZmF1bHQgdmFsdWVzIGZvciBhbnkgc3Vic2VxdWVudFxuICAvLyBjYWxscyB0byB1cGRhdGUoKVxuICB0aGlzLl9vcHQgPSBhc3NpZ24oe30sIG9wdClcblxuICAvLyBhbHNvIGRvIGFuIGluaXRpYWwgc2V0dXAuLi5cbiAgaWYgKG9wdCkgdGhpcy51cGRhdGUob3B0KVxufVxuXG5pbmhlcml0cyhUZXh0R2VvbWV0cnksIEJhc2UpXG5cblRleHRHZW9tZXRyeS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKG9wdCkge1xuICBpZiAodHlwZW9mIG9wdCA9PT0gJ3N0cmluZycpIHtcbiAgICBvcHQgPSB7IHRleHQ6IG9wdCB9XG4gIH1cblxuICAvLyB1c2UgY29uc3RydWN0b3IgZGVmYXVsdHNcbiAgb3B0ID0gYXNzaWduKHt9LCB0aGlzLl9vcHQsIG9wdClcblxuICBpZiAoIW9wdC5mb250KSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbXVzdCBzcGVjaWZ5IGEgeyBmb250IH0gaW4gb3B0aW9ucycpXG4gIH1cblxuICB0aGlzLmxheW91dCA9IGNyZWF0ZUxheW91dChvcHQpXG5cbiAgLy8gZ2V0IHZlYzIgdGV4Y29vcmRzXG4gIHZhciBmbGlwWSA9IG9wdC5mbGlwWSAhPT0gZmFsc2VcblxuICAvLyB0aGUgZGVzaXJlZCBCTUZvbnQgZGF0YVxuICB2YXIgZm9udCA9IG9wdC5mb250XG5cbiAgLy8gZGV0ZXJtaW5lIHRleHR1cmUgc2l6ZSBmcm9tIGZvbnQgZmlsZVxuICB2YXIgdGV4V2lkdGggPSBmb250LmNvbW1vbi5zY2FsZVdcbiAgdmFyIHRleEhlaWdodCA9IGZvbnQuY29tbW9uLnNjYWxlSFxuXG4gIC8vIGdldCB2aXNpYmxlIGdseXBoc1xuICB2YXIgZ2x5cGhzID0gdGhpcy5sYXlvdXQuZ2x5cGhzLmZpbHRlcihmdW5jdGlvbiAoZ2x5cGgpIHtcbiAgICB2YXIgYml0bWFwID0gZ2x5cGguZGF0YVxuICAgIHJldHVybiBiaXRtYXAud2lkdGggKiBiaXRtYXAuaGVpZ2h0ID4gMFxuICB9KVxuXG4gIC8vIHByb3ZpZGUgdmlzaWJsZSBnbHlwaHMgZm9yIGNvbnZlbmllbmNlXG4gIHRoaXMudmlzaWJsZUdseXBocyA9IGdseXBoc1xuXG4gIC8vIGdldCBjb21tb24gdmVydGV4IGRhdGFcbiAgdmFyIHBvc2l0aW9ucyA9IHZlcnRpY2VzLnBvc2l0aW9ucyhnbHlwaHMpXG4gIHZhciB1dnMgPSB2ZXJ0aWNlcy51dnMoZ2x5cGhzLCB0ZXhXaWR0aCwgdGV4SGVpZ2h0LCBmbGlwWSlcbiAgdmFyIGluZGljZXMgPSBjcmVhdGVJbmRpY2VzKHtcbiAgICBjbG9ja3dpc2U6IHRydWUsXG4gICAgdHlwZTogJ3VpbnQxNicsXG4gICAgY291bnQ6IGdseXBocy5sZW5ndGhcbiAgfSlcblxuICAvLyB1cGRhdGUgdmVydGV4IGRhdGFcbiAgYnVmZmVyLmluZGV4KHRoaXMsIGluZGljZXMsIDEsICd1aW50MTYnKVxuICBidWZmZXIuYXR0cih0aGlzLCAncG9zaXRpb24nLCBwb3NpdGlvbnMsIDIpXG4gIGJ1ZmZlci5hdHRyKHRoaXMsICd1dicsIHV2cywgMilcblxuICAvLyB1cGRhdGUgbXVsdGlwYWdlIGRhdGFcbiAgaWYgKCFvcHQubXVsdGlwYWdlICYmICdwYWdlJyBpbiB0aGlzLmF0dHJpYnV0ZXMpIHtcbiAgICAvLyBkaXNhYmxlIG11bHRpcGFnZSByZW5kZXJpbmdcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgncGFnZScpXG4gIH0gZWxzZSBpZiAob3B0Lm11bHRpcGFnZSkge1xuICAgIHZhciBwYWdlcyA9IHZlcnRpY2VzLnBhZ2VzKGdseXBocylcbiAgICAvLyBlbmFibGUgbXVsdGlwYWdlIHJlbmRlcmluZ1xuICAgIGJ1ZmZlci5hdHRyKHRoaXMsICdwYWdlJywgcGFnZXMsIDEpXG4gIH1cbn1cblxuVGV4dEdlb21ldHJ5LnByb3RvdHlwZS5jb21wdXRlQm91bmRpbmdTcGhlcmUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmJvdW5kaW5nU3BoZXJlID09PSBudWxsKSB7XG4gICAgdGhpcy5ib3VuZGluZ1NwaGVyZSA9IG5ldyBUSFJFRS5TcGhlcmUoKVxuICB9XG5cbiAgdmFyIHBvc2l0aW9ucyA9IHRoaXMuYXR0cmlidXRlcy5wb3NpdGlvbi5hcnJheVxuICB2YXIgaXRlbVNpemUgPSB0aGlzLmF0dHJpYnV0ZXMucG9zaXRpb24uaXRlbVNpemVcbiAgaWYgKCFwb3NpdGlvbnMgfHwgIWl0ZW1TaXplIHx8IHBvc2l0aW9ucy5sZW5ndGggPCAyKSB7XG4gICAgdGhpcy5ib3VuZGluZ1NwaGVyZS5yYWRpdXMgPSAwXG4gICAgdGhpcy5ib3VuZGluZ1NwaGVyZS5jZW50ZXIuc2V0KDAsIDAsIDApXG4gICAgcmV0dXJuXG4gIH1cbiAgdXRpbHMuY29tcHV0ZVNwaGVyZShwb3NpdGlvbnMsIHRoaXMuYm91bmRpbmdTcGhlcmUpXG4gIGlmIChpc05hTih0aGlzLmJvdW5kaW5nU3BoZXJlLnJhZGl1cykpIHtcbiAgICBjb25zb2xlLmVycm9yKCdUSFJFRS5CdWZmZXJHZW9tZXRyeS5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTogJyArXG4gICAgICAnQ29tcHV0ZWQgcmFkaXVzIGlzIE5hTi4gVGhlICcgK1xuICAgICAgJ1wicG9zaXRpb25cIiBhdHRyaWJ1dGUgaXMgbGlrZWx5IHRvIGhhdmUgTmFOIHZhbHVlcy4nKVxuICB9XG59XG5cblRleHRHZW9tZXRyeS5wcm90b3R5cGUuY29tcHV0ZUJvdW5kaW5nQm94ID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5ib3VuZGluZ0JveCA9PT0gbnVsbCkge1xuICAgIHRoaXMuYm91bmRpbmdCb3ggPSBuZXcgVEhSRUUuQm94MygpXG4gIH1cblxuICB2YXIgYmJveCA9IHRoaXMuYm91bmRpbmdCb3hcbiAgdmFyIHBvc2l0aW9ucyA9IHRoaXMuYXR0cmlidXRlcy5wb3NpdGlvbi5hcnJheVxuICB2YXIgaXRlbVNpemUgPSB0aGlzLmF0dHJpYnV0ZXMucG9zaXRpb24uaXRlbVNpemVcbiAgaWYgKCFwb3NpdGlvbnMgfHwgIWl0ZW1TaXplIHx8IHBvc2l0aW9ucy5sZW5ndGggPCAyKSB7XG4gICAgYmJveC5tYWtlRW1wdHkoKVxuICAgIHJldHVyblxuICB9XG4gIHV0aWxzLmNvbXB1dGVCb3gocG9zaXRpb25zLCBiYm94KVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3RocmVlLWJtZm9udC10ZXh0L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciB3b3JkV3JhcCA9IHJlcXVpcmUoJ3dvcmQtd3JhcHBlcicpXG52YXIgeHRlbmQgPSByZXF1aXJlKCd4dGVuZCcpXG52YXIgZmluZENoYXIgPSByZXF1aXJlKCdpbmRleG9mLXByb3BlcnR5JykoJ2lkJylcbnZhciBudW1iZXIgPSByZXF1aXJlKCdhcy1udW1iZXInKVxuXG52YXIgWF9IRUlHSFRTID0gWyd4JywgJ2UnLCAnYScsICdvJywgJ24nLCAncycsICdyJywgJ2MnLCAndScsICdtJywgJ3YnLCAndycsICd6J11cbnZhciBNX1dJRFRIUyA9IFsnbScsICd3J11cbnZhciBDQVBfSEVJR0hUUyA9IFsnSCcsICdJJywgJ04nLCAnRScsICdGJywgJ0snLCAnTCcsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJ11cblxuXG52YXIgVEFCX0lEID0gJ1xcdCcuY2hhckNvZGVBdCgwKVxudmFyIFNQQUNFX0lEID0gJyAnLmNoYXJDb2RlQXQoMClcbnZhciBBTElHTl9MRUZUID0gMCwgXG4gICAgQUxJR05fQ0VOVEVSID0gMSwgXG4gICAgQUxJR05fUklHSFQgPSAyXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlTGF5b3V0KG9wdCkge1xuICByZXR1cm4gbmV3IFRleHRMYXlvdXQob3B0KVxufVxuXG5mdW5jdGlvbiBUZXh0TGF5b3V0KG9wdCkge1xuICB0aGlzLmdseXBocyA9IFtdXG4gIHRoaXMuX21lYXN1cmUgPSB0aGlzLmNvbXB1dGVNZXRyaWNzLmJpbmQodGhpcylcbiAgdGhpcy51cGRhdGUob3B0KVxufVxuXG5UZXh0TGF5b3V0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihvcHQpIHtcbiAgb3B0ID0geHRlbmQoe1xuICAgIG1lYXN1cmU6IHRoaXMuX21lYXN1cmVcbiAgfSwgb3B0KVxuICB0aGlzLl9vcHQgPSBvcHRcbiAgdGhpcy5fb3B0LnRhYlNpemUgPSBudW1iZXIodGhpcy5fb3B0LnRhYlNpemUsIDQpXG5cbiAgaWYgKCFvcHQuZm9udClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ211c3QgcHJvdmlkZSBhIHZhbGlkIGJpdG1hcCBmb250JylcblxuICB2YXIgZ2x5cGhzID0gdGhpcy5nbHlwaHNcbiAgdmFyIHRleHQgPSBvcHQudGV4dHx8JycgXG4gIHZhciBmb250ID0gb3B0LmZvbnRcbiAgdGhpcy5fc2V0dXBTcGFjZUdseXBocyhmb250KVxuICBcbiAgdmFyIGxpbmVzID0gd29yZFdyYXAubGluZXModGV4dCwgb3B0KVxuICB2YXIgbWluV2lkdGggPSBvcHQud2lkdGggfHwgMFxuXG4gIC8vY2xlYXIgZ2x5cGhzXG4gIGdseXBocy5sZW5ndGggPSAwXG5cbiAgLy9nZXQgbWF4IGxpbmUgd2lkdGhcbiAgdmFyIG1heExpbmVXaWR0aCA9IGxpbmVzLnJlZHVjZShmdW5jdGlvbihwcmV2LCBsaW5lKSB7XG4gICAgcmV0dXJuIE1hdGgubWF4KHByZXYsIGxpbmUud2lkdGgsIG1pbldpZHRoKVxuICB9LCAwKVxuXG4gIC8vdGhlIHBlbiBwb3NpdGlvblxuICB2YXIgeCA9IDBcbiAgdmFyIHkgPSAwXG4gIHZhciBsaW5lSGVpZ2h0ID0gbnVtYmVyKG9wdC5saW5lSGVpZ2h0LCBmb250LmNvbW1vbi5saW5lSGVpZ2h0KVxuICB2YXIgYmFzZWxpbmUgPSBmb250LmNvbW1vbi5iYXNlXG4gIHZhciBkZXNjZW5kZXIgPSBsaW5lSGVpZ2h0LWJhc2VsaW5lXG4gIHZhciBsZXR0ZXJTcGFjaW5nID0gb3B0LmxldHRlclNwYWNpbmcgfHwgMFxuICB2YXIgaGVpZ2h0ID0gbGluZUhlaWdodCAqIGxpbmVzLmxlbmd0aCAtIGRlc2NlbmRlclxuICB2YXIgYWxpZ24gPSBnZXRBbGlnblR5cGUodGhpcy5fb3B0LmFsaWduKVxuXG4gIC8vZHJhdyB0ZXh0IGFsb25nIGJhc2VsaW5lXG4gIHkgLT0gaGVpZ2h0XG4gIFxuICAvL3RoZSBtZXRyaWNzIGZvciB0aGlzIHRleHQgbGF5b3V0XG4gIHRoaXMuX3dpZHRoID0gbWF4TGluZVdpZHRoXG4gIHRoaXMuX2hlaWdodCA9IGhlaWdodFxuICB0aGlzLl9kZXNjZW5kZXIgPSBsaW5lSGVpZ2h0IC0gYmFzZWxpbmVcbiAgdGhpcy5fYmFzZWxpbmUgPSBiYXNlbGluZVxuICB0aGlzLl94SGVpZ2h0ID0gZ2V0WEhlaWdodChmb250KVxuICB0aGlzLl9jYXBIZWlnaHQgPSBnZXRDYXBIZWlnaHQoZm9udClcbiAgdGhpcy5fbGluZUhlaWdodCA9IGxpbmVIZWlnaHRcbiAgdGhpcy5fYXNjZW5kZXIgPSBsaW5lSGVpZ2h0IC0gZGVzY2VuZGVyIC0gdGhpcy5feEhlaWdodFxuICAgIFxuICAvL2xheW91dCBlYWNoIGdseXBoXG4gIHZhciBzZWxmID0gdGhpc1xuICBsaW5lcy5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUsIGxpbmVJbmRleCkge1xuICAgIHZhciBzdGFydCA9IGxpbmUuc3RhcnRcbiAgICB2YXIgZW5kID0gbGluZS5lbmRcbiAgICB2YXIgbGluZVdpZHRoID0gbGluZS53aWR0aFxuICAgIHZhciBsYXN0R2x5cGhcbiAgICBcbiAgICAvL2ZvciBlYWNoIGdseXBoIGluIHRoYXQgbGluZS4uLlxuICAgIGZvciAodmFyIGk9c3RhcnQ7IGk8ZW5kOyBpKyspIHtcbiAgICAgIHZhciBpZCA9IHRleHQuY2hhckNvZGVBdChpKVxuICAgICAgdmFyIGdseXBoID0gc2VsZi5nZXRHbHlwaChmb250LCBpZClcbiAgICAgIGlmIChnbHlwaCkge1xuICAgICAgICBpZiAobGFzdEdseXBoKSBcbiAgICAgICAgICB4ICs9IGdldEtlcm5pbmcoZm9udCwgbGFzdEdseXBoLmlkLCBnbHlwaC5pZClcblxuICAgICAgICB2YXIgdHggPSB4XG4gICAgICAgIGlmIChhbGlnbiA9PT0gQUxJR05fQ0VOVEVSKSBcbiAgICAgICAgICB0eCArPSAobWF4TGluZVdpZHRoLWxpbmVXaWR0aCkvMlxuICAgICAgICBlbHNlIGlmIChhbGlnbiA9PT0gQUxJR05fUklHSFQpXG4gICAgICAgICAgdHggKz0gKG1heExpbmVXaWR0aC1saW5lV2lkdGgpXG5cbiAgICAgICAgZ2x5cGhzLnB1c2goe1xuICAgICAgICAgIHBvc2l0aW9uOiBbdHgsIHldLFxuICAgICAgICAgIGRhdGE6IGdseXBoLFxuICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgIGxpbmU6IGxpbmVJbmRleFxuICAgICAgICB9KSAgXG5cbiAgICAgICAgLy9tb3ZlIHBlbiBmb3J3YXJkXG4gICAgICAgIHggKz0gZ2x5cGgueGFkdmFuY2UgKyBsZXR0ZXJTcGFjaW5nXG4gICAgICAgIGxhc3RHbHlwaCA9IGdseXBoXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy9uZXh0IGxpbmUgZG93blxuICAgIHkgKz0gbGluZUhlaWdodFxuICAgIHggPSAwXG4gIH0pXG4gIHRoaXMuX2xpbmVzVG90YWwgPSBsaW5lcy5sZW5ndGg7XG59XG5cblRleHRMYXlvdXQucHJvdG90eXBlLl9zZXR1cFNwYWNlR2x5cGhzID0gZnVuY3Rpb24oZm9udCkge1xuICAvL1RoZXNlIGFyZSBmYWxsYmFja3MsIHdoZW4gdGhlIGZvbnQgZG9lc24ndCBpbmNsdWRlXG4gIC8vJyAnIG9yICdcXHQnIGdseXBoc1xuICB0aGlzLl9mYWxsYmFja1NwYWNlR2x5cGggPSBudWxsXG4gIHRoaXMuX2ZhbGxiYWNrVGFiR2x5cGggPSBudWxsXG5cbiAgaWYgKCFmb250LmNoYXJzIHx8IGZvbnQuY2hhcnMubGVuZ3RoID09PSAwKVxuICAgIHJldHVyblxuXG4gIC8vdHJ5IHRvIGdldCBzcGFjZSBnbHlwaFxuICAvL3RoZW4gZmFsbCBiYWNrIHRvIHRoZSAnbScgb3IgJ3cnIGdseXBoc1xuICAvL3RoZW4gZmFsbCBiYWNrIHRvIHRoZSBmaXJzdCBnbHlwaCBhdmFpbGFibGVcbiAgdmFyIHNwYWNlID0gZ2V0R2x5cGhCeUlkKGZvbnQsIFNQQUNFX0lEKSBcbiAgICAgICAgICB8fCBnZXRNR2x5cGgoZm9udCkgXG4gICAgICAgICAgfHwgZm9udC5jaGFyc1swXVxuXG4gIC8vYW5kIGNyZWF0ZSBhIGZhbGxiYWNrIGZvciB0YWJcbiAgdmFyIHRhYldpZHRoID0gdGhpcy5fb3B0LnRhYlNpemUgKiBzcGFjZS54YWR2YW5jZVxuICB0aGlzLl9mYWxsYmFja1NwYWNlR2x5cGggPSBzcGFjZVxuICB0aGlzLl9mYWxsYmFja1RhYkdseXBoID0geHRlbmQoc3BhY2UsIHtcbiAgICB4OiAwLCB5OiAwLCB4YWR2YW5jZTogdGFiV2lkdGgsIGlkOiBUQUJfSUQsIFxuICAgIHhvZmZzZXQ6IDAsIHlvZmZzZXQ6IDAsIHdpZHRoOiAwLCBoZWlnaHQ6IDBcbiAgfSlcbn1cblxuVGV4dExheW91dC5wcm90b3R5cGUuZ2V0R2x5cGggPSBmdW5jdGlvbihmb250LCBpZCkge1xuICB2YXIgZ2x5cGggPSBnZXRHbHlwaEJ5SWQoZm9udCwgaWQpXG4gIGlmIChnbHlwaClcbiAgICByZXR1cm4gZ2x5cGhcbiAgZWxzZSBpZiAoaWQgPT09IFRBQl9JRCkgXG4gICAgcmV0dXJuIHRoaXMuX2ZhbGxiYWNrVGFiR2x5cGhcbiAgZWxzZSBpZiAoaWQgPT09IFNQQUNFX0lEKSBcbiAgICByZXR1cm4gdGhpcy5fZmFsbGJhY2tTcGFjZUdseXBoXG4gIHJldHVybiBudWxsXG59XG5cblRleHRMYXlvdXQucHJvdG90eXBlLmNvbXB1dGVNZXRyaWNzID0gZnVuY3Rpb24odGV4dCwgc3RhcnQsIGVuZCwgd2lkdGgpIHtcbiAgdmFyIGxldHRlclNwYWNpbmcgPSB0aGlzLl9vcHQubGV0dGVyU3BhY2luZyB8fCAwXG4gIHZhciBmb250ID0gdGhpcy5fb3B0LmZvbnRcbiAgdmFyIGN1clBlbiA9IDBcbiAgdmFyIGN1cldpZHRoID0gMFxuICB2YXIgY291bnQgPSAwXG4gIHZhciBnbHlwaFxuICB2YXIgbGFzdEdseXBoXG5cbiAgaWYgKCFmb250LmNoYXJzIHx8IGZvbnQuY2hhcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgIGVuZDogc3RhcnQsXG4gICAgICB3aWR0aDogMFxuICAgIH1cbiAgfVxuXG4gIGVuZCA9IE1hdGgubWluKHRleHQubGVuZ3RoLCBlbmQpXG4gIGZvciAodmFyIGk9c3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHZhciBpZCA9IHRleHQuY2hhckNvZGVBdChpKVxuICAgIHZhciBnbHlwaCA9IHRoaXMuZ2V0R2x5cGgoZm9udCwgaWQpXG5cbiAgICBpZiAoZ2x5cGgpIHtcbiAgICAgIC8vbW92ZSBwZW4gZm9yd2FyZFxuICAgICAgdmFyIHhvZmYgPSBnbHlwaC54b2Zmc2V0XG4gICAgICB2YXIga2VybiA9IGxhc3RHbHlwaCA/IGdldEtlcm5pbmcoZm9udCwgbGFzdEdseXBoLmlkLCBnbHlwaC5pZCkgOiAwXG4gICAgICBjdXJQZW4gKz0ga2VyblxuXG4gICAgICB2YXIgbmV4dFBlbiA9IGN1clBlbiArIGdseXBoLnhhZHZhbmNlICsgbGV0dGVyU3BhY2luZ1xuICAgICAgdmFyIG5leHRXaWR0aCA9IGN1clBlbiArIGdseXBoLndpZHRoXG5cbiAgICAgIC8vd2UndmUgaGl0IG91ciBsaW1pdDsgd2UgY2FuJ3QgbW92ZSBvbnRvIHRoZSBuZXh0IGdseXBoXG4gICAgICBpZiAobmV4dFdpZHRoID49IHdpZHRoIHx8IG5leHRQZW4gPj0gd2lkdGgpXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIC8vb3RoZXJ3aXNlIGNvbnRpbnVlIGFsb25nIG91ciBsaW5lXG4gICAgICBjdXJQZW4gPSBuZXh0UGVuXG4gICAgICBjdXJXaWR0aCA9IG5leHRXaWR0aFxuICAgICAgbGFzdEdseXBoID0gZ2x5cGhcbiAgICB9XG4gICAgY291bnQrK1xuICB9XG4gIFxuICAvL21ha2Ugc3VyZSByaWdodG1vc3QgZWRnZSBsaW5lcyB1cCB3aXRoIHJlbmRlcmVkIGdseXBoc1xuICBpZiAobGFzdEdseXBoKVxuICAgIGN1cldpZHRoICs9IGxhc3RHbHlwaC54b2Zmc2V0XG5cbiAgcmV0dXJuIHtcbiAgICBzdGFydDogc3RhcnQsXG4gICAgZW5kOiBzdGFydCArIGNvdW50LFxuICAgIHdpZHRoOiBjdXJXaWR0aFxuICB9XG59XG5cbi8vZ2V0dGVycyBmb3IgdGhlIHByaXZhdGUgdmFyc1xuO1snd2lkdGgnLCAnaGVpZ2h0JywgXG4gICdkZXNjZW5kZXInLCAnYXNjZW5kZXInLFxuICAneEhlaWdodCcsICdiYXNlbGluZScsXG4gICdjYXBIZWlnaHQnLFxuICAnbGluZUhlaWdodCcgXS5mb3JFYWNoKGFkZEdldHRlcilcblxuZnVuY3Rpb24gYWRkR2V0dGVyKG5hbWUpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRleHRMYXlvdXQucHJvdG90eXBlLCBuYW1lLCB7XG4gICAgZ2V0OiB3cmFwcGVyKG5hbWUpLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KVxufVxuXG4vL2NyZWF0ZSBsb29rdXBzIGZvciBwcml2YXRlIHZhcnNcbmZ1bmN0aW9uIHdyYXBwZXIobmFtZSkge1xuICByZXR1cm4gKG5ldyBGdW5jdGlvbihbXG4gICAgJ3JldHVybiBmdW5jdGlvbiAnK25hbWUrJygpIHsnLFxuICAgICcgIHJldHVybiB0aGlzLl8nK25hbWUsXG4gICAgJ30nXG4gIF0uam9pbignXFxuJykpKSgpXG59XG5cbmZ1bmN0aW9uIGdldEdseXBoQnlJZChmb250LCBpZCkge1xuICBpZiAoIWZvbnQuY2hhcnMgfHwgZm9udC5jaGFycy5sZW5ndGggPT09IDApXG4gICAgcmV0dXJuIG51bGxcblxuICB2YXIgZ2x5cGhJZHggPSBmaW5kQ2hhcihmb250LmNoYXJzLCBpZClcbiAgaWYgKGdseXBoSWR4ID49IDApXG4gICAgcmV0dXJuIGZvbnQuY2hhcnNbZ2x5cGhJZHhdXG4gIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIGdldFhIZWlnaHQoZm9udCkge1xuICBmb3IgKHZhciBpPTA7IGk8WF9IRUlHSFRTLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGlkID0gWF9IRUlHSFRTW2ldLmNoYXJDb2RlQXQoMClcbiAgICB2YXIgaWR4ID0gZmluZENoYXIoZm9udC5jaGFycywgaWQpXG4gICAgaWYgKGlkeCA+PSAwKSBcbiAgICAgIHJldHVybiBmb250LmNoYXJzW2lkeF0uaGVpZ2h0XG4gIH1cbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gZ2V0TUdseXBoKGZvbnQpIHtcbiAgZm9yICh2YXIgaT0wOyBpPE1fV0lEVEhTLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGlkID0gTV9XSURUSFNbaV0uY2hhckNvZGVBdCgwKVxuICAgIHZhciBpZHggPSBmaW5kQ2hhcihmb250LmNoYXJzLCBpZClcbiAgICBpZiAoaWR4ID49IDApIFxuICAgICAgcmV0dXJuIGZvbnQuY2hhcnNbaWR4XVxuICB9XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGdldENhcEhlaWdodChmb250KSB7XG4gIGZvciAodmFyIGk9MDsgaTxDQVBfSEVJR0hUUy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpZCA9IENBUF9IRUlHSFRTW2ldLmNoYXJDb2RlQXQoMClcbiAgICB2YXIgaWR4ID0gZmluZENoYXIoZm9udC5jaGFycywgaWQpXG4gICAgaWYgKGlkeCA+PSAwKSBcbiAgICAgIHJldHVybiBmb250LmNoYXJzW2lkeF0uaGVpZ2h0XG4gIH1cbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gZ2V0S2VybmluZyhmb250LCBsZWZ0LCByaWdodCkge1xuICBpZiAoIWZvbnQua2VybmluZ3MgfHwgZm9udC5rZXJuaW5ncy5sZW5ndGggPT09IDApXG4gICAgcmV0dXJuIDBcblxuICB2YXIgdGFibGUgPSBmb250Lmtlcm5pbmdzXG4gIGZvciAodmFyIGk9MDsgaTx0YWJsZS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXJuID0gdGFibGVbaV1cbiAgICBpZiAoa2Vybi5maXJzdCA9PT0gbGVmdCAmJiBrZXJuLnNlY29uZCA9PT0gcmlnaHQpXG4gICAgICByZXR1cm4ga2Vybi5hbW91bnRcbiAgfVxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBnZXRBbGlnblR5cGUoYWxpZ24pIHtcbiAgaWYgKGFsaWduID09PSAnY2VudGVyJylcbiAgICByZXR1cm4gQUxJR05fQ0VOVEVSXG4gIGVsc2UgaWYgKGFsaWduID09PSAncmlnaHQnKVxuICAgIHJldHVybiBBTElHTl9SSUdIVFxuICByZXR1cm4gQUxJR05fTEVGVFxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sYXlvdXQtYm1mb250LXRleHQvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIG5ld2xpbmUgPSAvXFxuL1xudmFyIG5ld2xpbmVDaGFyID0gJ1xcbidcbnZhciB3aGl0ZXNwYWNlID0gL1xccy9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0ZXh0LCBvcHQpIHtcbiAgICB2YXIgbGluZXMgPSBtb2R1bGUuZXhwb3J0cy5saW5lcyh0ZXh0LCBvcHQpXG4gICAgcmV0dXJuIGxpbmVzLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgIHJldHVybiB0ZXh0LnN1YnN0cmluZyhsaW5lLnN0YXJ0LCBsaW5lLmVuZClcbiAgICB9KS5qb2luKCdcXG4nKVxufVxuXG5tb2R1bGUuZXhwb3J0cy5saW5lcyA9IGZ1bmN0aW9uIHdvcmR3cmFwKHRleHQsIG9wdCkge1xuICAgIG9wdCA9IG9wdHx8e31cblxuICAgIC8vemVybyB3aWR0aCByZXN1bHRzIGluIG5vdGhpbmcgdmlzaWJsZVxuICAgIGlmIChvcHQud2lkdGggPT09IDAgJiYgb3B0Lm1vZGUgIT09ICdub3dyYXAnKSBcbiAgICAgICAgcmV0dXJuIFtdXG5cbiAgICB0ZXh0ID0gdGV4dHx8JydcbiAgICB2YXIgd2lkdGggPSB0eXBlb2Ygb3B0LndpZHRoID09PSAnbnVtYmVyJyA/IG9wdC53aWR0aCA6IE51bWJlci5NQVhfVkFMVUVcbiAgICB2YXIgc3RhcnQgPSBNYXRoLm1heCgwLCBvcHQuc3RhcnR8fDApXG4gICAgdmFyIGVuZCA9IHR5cGVvZiBvcHQuZW5kID09PSAnbnVtYmVyJyA/IG9wdC5lbmQgOiB0ZXh0Lmxlbmd0aFxuICAgIHZhciBtb2RlID0gb3B0Lm1vZGVcblxuICAgIHZhciBtZWFzdXJlID0gb3B0Lm1lYXN1cmUgfHwgbW9ub3NwYWNlXG4gICAgaWYgKG1vZGUgPT09ICdwcmUnKVxuICAgICAgICByZXR1cm4gcHJlKG1lYXN1cmUsIHRleHQsIHN0YXJ0LCBlbmQsIHdpZHRoKVxuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGdyZWVkeShtZWFzdXJlLCB0ZXh0LCBzdGFydCwgZW5kLCB3aWR0aCwgbW9kZSlcbn1cblxuZnVuY3Rpb24gaWR4T2YodGV4dCwgY2hyLCBzdGFydCwgZW5kKSB7XG4gICAgdmFyIGlkeCA9IHRleHQuaW5kZXhPZihjaHIsIHN0YXJ0KVxuICAgIGlmIChpZHggPT09IC0xIHx8IGlkeCA+IGVuZClcbiAgICAgICAgcmV0dXJuIGVuZFxuICAgIHJldHVybiBpZHhcbn1cblxuZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKGNocikge1xuICAgIHJldHVybiB3aGl0ZXNwYWNlLnRlc3QoY2hyKVxufVxuXG5mdW5jdGlvbiBwcmUobWVhc3VyZSwgdGV4dCwgc3RhcnQsIGVuZCwgd2lkdGgpIHtcbiAgICB2YXIgbGluZXMgPSBbXVxuICAgIHZhciBsaW5lU3RhcnQgPSBzdGFydFxuICAgIGZvciAodmFyIGk9c3RhcnQ7IGk8ZW5kICYmIGk8dGV4dC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hyID0gdGV4dC5jaGFyQXQoaSlcbiAgICAgICAgdmFyIGlzTmV3bGluZSA9IG5ld2xpbmUudGVzdChjaHIpXG5cbiAgICAgICAgLy9JZiB3ZSd2ZSByZWFjaGVkIGEgbmV3bGluZSwgdGhlbiBzdGVwIGRvd24gYSBsaW5lXG4gICAgICAgIC8vT3IgaWYgd2UndmUgcmVhY2hlZCB0aGUgRU9GXG4gICAgICAgIGlmIChpc05ld2xpbmUgfHwgaT09PWVuZC0xKSB7XG4gICAgICAgICAgICB2YXIgbGluZUVuZCA9IGlzTmV3bGluZSA/IGkgOiBpKzFcbiAgICAgICAgICAgIHZhciBtZWFzdXJlZCA9IG1lYXN1cmUodGV4dCwgbGluZVN0YXJ0LCBsaW5lRW5kLCB3aWR0aClcbiAgICAgICAgICAgIGxpbmVzLnB1c2gobWVhc3VyZWQpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxpbmVTdGFydCA9IGkrMVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBsaW5lc1xufVxuXG5mdW5jdGlvbiBncmVlZHkobWVhc3VyZSwgdGV4dCwgc3RhcnQsIGVuZCwgd2lkdGgsIG1vZGUpIHtcbiAgICAvL0EgZ3JlZWR5IHdvcmQgd3JhcHBlciBiYXNlZCBvbiBMaWJHRFggYWxnb3JpdGhtXG4gICAgLy9odHRwczovL2dpdGh1Yi5jb20vbGliZ2R4L2xpYmdkeC9ibG9iL21hc3Rlci9nZHgvc3JjL2NvbS9iYWRsb2dpYy9nZHgvZ3JhcGhpY3MvZzJkL0JpdG1hcEZvbnRDYWNoZS5qYXZhXG4gICAgdmFyIGxpbmVzID0gW11cblxuICAgIHZhciB0ZXN0V2lkdGggPSB3aWR0aFxuICAgIC8vaWYgJ25vd3JhcCcgaXMgc3BlY2lmaWVkLCB3ZSBvbmx5IHdyYXAgb24gbmV3bGluZSBjaGFyc1xuICAgIGlmIChtb2RlID09PSAnbm93cmFwJylcbiAgICAgICAgdGVzdFdpZHRoID0gTnVtYmVyLk1BWF9WQUxVRVxuXG4gICAgd2hpbGUgKHN0YXJ0IDwgZW5kICYmIHN0YXJ0IDwgdGV4dC5sZW5ndGgpIHtcbiAgICAgICAgLy9nZXQgbmV4dCBuZXdsaW5lIHBvc2l0aW9uXG4gICAgICAgIHZhciBuZXdMaW5lID0gaWR4T2YodGV4dCwgbmV3bGluZUNoYXIsIHN0YXJ0LCBlbmQpXG5cbiAgICAgICAgLy9lYXQgd2hpdGVzcGFjZSBhdCBzdGFydCBvZiBsaW5lXG4gICAgICAgIHdoaWxlIChzdGFydCA8IG5ld0xpbmUpIHtcbiAgICAgICAgICAgIGlmICghaXNXaGl0ZXNwYWNlKCB0ZXh0LmNoYXJBdChzdGFydCkgKSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgc3RhcnQrK1xuICAgICAgICB9XG5cbiAgICAgICAgLy9kZXRlcm1pbmUgdmlzaWJsZSAjIG9mIGdseXBocyBmb3IgdGhlIGF2YWlsYWJsZSB3aWR0aFxuICAgICAgICB2YXIgbWVhc3VyZWQgPSBtZWFzdXJlKHRleHQsIHN0YXJ0LCBuZXdMaW5lLCB0ZXN0V2lkdGgpXG5cbiAgICAgICAgdmFyIGxpbmVFbmQgPSBzdGFydCArIChtZWFzdXJlZC5lbmQtbWVhc3VyZWQuc3RhcnQpXG4gICAgICAgIHZhciBuZXh0U3RhcnQgPSBsaW5lRW5kICsgbmV3bGluZUNoYXIubGVuZ3RoXG5cbiAgICAgICAgLy9pZiB3ZSBoYWQgdG8gY3V0IHRoZSBsaW5lIGJlZm9yZSB0aGUgbmV4dCBuZXdsaW5lLi4uXG4gICAgICAgIGlmIChsaW5lRW5kIDwgbmV3TGluZSkge1xuICAgICAgICAgICAgLy9maW5kIGNoYXIgdG8gYnJlYWsgb25cbiAgICAgICAgICAgIHdoaWxlIChsaW5lRW5kID4gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNXaGl0ZXNwYWNlKHRleHQuY2hhckF0KGxpbmVFbmQpKSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBsaW5lRW5kLS1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaW5lRW5kID09PSBzdGFydCkge1xuICAgICAgICAgICAgICAgIGlmIChuZXh0U3RhcnQgPiBzdGFydCArIG5ld2xpbmVDaGFyLmxlbmd0aCkgbmV4dFN0YXJ0LS1cbiAgICAgICAgICAgICAgICBsaW5lRW5kID0gbmV4dFN0YXJ0IC8vIElmIG5vIGNoYXJhY3RlcnMgdG8gYnJlYWssIHNob3cgYWxsLlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXh0U3RhcnQgPSBsaW5lRW5kXG4gICAgICAgICAgICAgICAgLy9lYXQgd2hpdGVzcGFjZSBhdCBlbmQgb2YgbGluZVxuICAgICAgICAgICAgICAgIHdoaWxlIChsaW5lRW5kID4gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1doaXRlc3BhY2UodGV4dC5jaGFyQXQobGluZUVuZCAtIG5ld2xpbmVDaGFyLmxlbmd0aCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgbGluZUVuZC0tXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChsaW5lRW5kID49IHN0YXJ0KSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbWVhc3VyZSh0ZXh0LCBzdGFydCwgbGluZUVuZCwgdGVzdFdpZHRoKVxuICAgICAgICAgICAgbGluZXMucHVzaChyZXN1bHQpXG4gICAgICAgIH1cbiAgICAgICAgc3RhcnQgPSBuZXh0U3RhcnRcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzXG59XG5cbi8vZGV0ZXJtaW5lcyB0aGUgdmlzaWJsZSBudW1iZXIgb2YgZ2x5cGhzIHdpdGhpbiBhIGdpdmVuIHdpZHRoXG5mdW5jdGlvbiBtb25vc3BhY2UodGV4dCwgc3RhcnQsIGVuZCwgd2lkdGgpIHtcbiAgICB2YXIgZ2x5cGhzID0gTWF0aC5taW4od2lkdGgsIGVuZC1zdGFydClcbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgIGVuZDogc3RhcnQrZ2x5cGhzXG4gICAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi93b3JkLXdyYXBwZXIvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBleHRlbmRcblxudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgIHZhciB0YXJnZXQgPSB7fVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXVxuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXRcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi94dGVuZC9pbW11dGFibGUuanNcbi8vIG1vZHVsZSBpZCA9IDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21waWxlKHByb3BlcnR5KSB7XG5cdGlmICghcHJvcGVydHkgfHwgdHlwZW9mIHByb3BlcnR5ICE9PSAnc3RyaW5nJylcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ211c3Qgc3BlY2lmeSBwcm9wZXJ0eSBmb3IgaW5kZXhvZiBzZWFyY2gnKVxuXG5cdHJldHVybiBuZXcgRnVuY3Rpb24oJ2FycmF5JywgJ3ZhbHVlJywgJ3N0YXJ0JywgW1xuXHRcdCdzdGFydCA9IHN0YXJ0IHx8IDAnLFxuXHRcdCdmb3IgKHZhciBpPXN0YXJ0OyBpPGFycmF5Lmxlbmd0aDsgaSsrKScsXG5cdFx0JyAgaWYgKGFycmF5W2ldW1wiJyArIHByb3BlcnR5ICsnXCJdID09PSB2YWx1ZSknLFxuXHRcdCcgICAgICByZXR1cm4gaScsXG5cdFx0J3JldHVybiAtMSdcblx0XS5qb2luKCdcXG4nKSlcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vaW5kZXhvZi1wcm9wZXJ0eS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBudW10eXBlKG51bSwgZGVmKSB7XG5cdHJldHVybiB0eXBlb2YgbnVtID09PSAnbnVtYmVyJ1xuXHRcdD8gbnVtIFxuXHRcdDogKHR5cGVvZiBkZWYgPT09ICdudW1iZXInID8gZGVmIDogMClcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXMtbnVtYmVyL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAxMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZHR5cGUgPSByZXF1aXJlKCdkdHlwZScpXG52YXIgYW5BcnJheSA9IHJlcXVpcmUoJ2FuLWFycmF5JylcbnZhciBpc0J1ZmZlciA9IHJlcXVpcmUoJ2lzLWJ1ZmZlcicpXG5cbnZhciBDVyA9IFswLCAyLCAzXVxudmFyIENDVyA9IFsyLCAxLCAzXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZVF1YWRFbGVtZW50cyhhcnJheSwgb3B0KSB7XG4gICAgLy9pZiB1c2VyIGRpZG4ndCBzcGVjaWZ5IGFuIG91dHB1dCBhcnJheVxuICAgIGlmICghYXJyYXkgfHwgIShhbkFycmF5KGFycmF5KSB8fCBpc0J1ZmZlcihhcnJheSkpKSB7XG4gICAgICAgIG9wdCA9IGFycmF5IHx8IHt9XG4gICAgICAgIGFycmF5ID0gbnVsbFxuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb3B0ID09PSAnbnVtYmVyJykgLy9iYWNrd2FyZHMtY29tcGF0aWJsZVxuICAgICAgICBvcHQgPSB7IGNvdW50OiBvcHQgfVxuICAgIGVsc2VcbiAgICAgICAgb3B0ID0gb3B0IHx8IHt9XG5cbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvcHQudHlwZSA9PT0gJ3N0cmluZycgPyBvcHQudHlwZSA6ICd1aW50MTYnXG4gICAgdmFyIGNvdW50ID0gdHlwZW9mIG9wdC5jb3VudCA9PT0gJ251bWJlcicgPyBvcHQuY291bnQgOiAxXG4gICAgdmFyIHN0YXJ0ID0gKG9wdC5zdGFydCB8fCAwKSBcblxuICAgIHZhciBkaXIgPSBvcHQuY2xvY2t3aXNlICE9PSBmYWxzZSA/IENXIDogQ0NXLFxuICAgICAgICBhID0gZGlyWzBdLCBcbiAgICAgICAgYiA9IGRpclsxXSxcbiAgICAgICAgYyA9IGRpclsyXVxuXG4gICAgdmFyIG51bUluZGljZXMgPSBjb3VudCAqIDZcblxuICAgIHZhciBpbmRpY2VzID0gYXJyYXkgfHwgbmV3IChkdHlwZSh0eXBlKSkobnVtSW5kaWNlcylcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IDA7IGkgPCBudW1JbmRpY2VzOyBpICs9IDYsIGogKz0gNCkge1xuICAgICAgICB2YXIgeCA9IGkgKyBzdGFydFxuICAgICAgICBpbmRpY2VzW3ggKyAwXSA9IGogKyAwXG4gICAgICAgIGluZGljZXNbeCArIDFdID0gaiArIDFcbiAgICAgICAgaW5kaWNlc1t4ICsgMl0gPSBqICsgMlxuICAgICAgICBpbmRpY2VzW3ggKyAzXSA9IGogKyBhXG4gICAgICAgIGluZGljZXNbeCArIDRdID0gaiArIGJcbiAgICAgICAgaW5kaWNlc1t4ICsgNV0gPSBqICsgY1xuICAgIH1cbiAgICByZXR1cm4gaW5kaWNlc1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9xdWFkLWluZGljZXMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDEzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZHR5cGUpIHtcbiAgc3dpdGNoIChkdHlwZSkge1xuICAgIGNhc2UgJ2ludDgnOlxuICAgICAgcmV0dXJuIEludDhBcnJheVxuICAgIGNhc2UgJ2ludDE2JzpcbiAgICAgIHJldHVybiBJbnQxNkFycmF5XG4gICAgY2FzZSAnaW50MzInOlxuICAgICAgcmV0dXJuIEludDMyQXJyYXlcbiAgICBjYXNlICd1aW50OCc6XG4gICAgICByZXR1cm4gVWludDhBcnJheVxuICAgIGNhc2UgJ3VpbnQxNic6XG4gICAgICByZXR1cm4gVWludDE2QXJyYXlcbiAgICBjYXNlICd1aW50MzInOlxuICAgICAgcmV0dXJuIFVpbnQzMkFycmF5XG4gICAgY2FzZSAnZmxvYXQzMic6XG4gICAgICByZXR1cm4gRmxvYXQzMkFycmF5XG4gICAgY2FzZSAnZmxvYXQ2NCc6XG4gICAgICByZXR1cm4gRmxvYXQ2NEFycmF5XG4gICAgY2FzZSAnYXJyYXknOlxuICAgICAgcmV0dXJuIEFycmF5XG4gICAgY2FzZSAndWludDhfY2xhbXBlZCc6XG4gICAgICByZXR1cm4gVWludDhDbGFtcGVkQXJyYXlcbiAgfVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2R0eXBlL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgc3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFuQXJyYXlcblxuZnVuY3Rpb24gYW5BcnJheShhcnIpIHtcbiAgcmV0dXJuIChcbiAgICAgICBhcnIuQllURVNfUEVSX0VMRU1FTlRcbiAgICAmJiBzdHIuY2FsbChhcnIuYnVmZmVyKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJ1xuICAgIHx8IEFycmF5LmlzQXJyYXkoYXJyKVxuICApXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYW4tYXJyYXkvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDE1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qIVxuICogRGV0ZXJtaW5lIGlmIGFuIG9iamVjdCBpcyBhIEJ1ZmZlclxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbi8vIFRoZSBfaXNCdWZmZXIgY2hlY2sgaXMgZm9yIFNhZmFyaSA1LTcgc3VwcG9ydCwgYmVjYXVzZSBpdCdzIG1pc3Npbmdcbi8vIE9iamVjdC5wcm90b3R5cGUuY29uc3RydWN0b3IuIFJlbW92ZSB0aGlzIGV2ZW50dWFsbHlcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gb2JqICE9IG51bGwgJiYgKGlzQnVmZmVyKG9iaikgfHwgaXNTbG93QnVmZmVyKG9iaikgfHwgISFvYmouX2lzQnVmZmVyKVxufVxuXG5mdW5jdGlvbiBpc0J1ZmZlciAob2JqKSB7XG4gIHJldHVybiAhIW9iai5jb25zdHJ1Y3RvciAmJiB0eXBlb2Ygb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlcihvYmopXG59XG5cbi8vIEZvciBOb2RlIHYwLjEwIHN1cHBvcnQuIFJlbW92ZSB0aGlzIGV2ZW50dWFsbHkuXG5mdW5jdGlvbiBpc1Nsb3dCdWZmZXIgKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iai5yZWFkRmxvYXRMRSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb2JqLnNsaWNlID09PSAnZnVuY3Rpb24nICYmIGlzQnVmZmVyKG9iai5zbGljZSgwLCAwKSlcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9pcy1idWZmZXIvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDE2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBmbGF0dGVuID0gcmVxdWlyZSgnZmxhdHRlbi12ZXJ0ZXgtZGF0YScpXG52YXIgd2FybmVkID0gZmFsc2U7XG5cbm1vZHVsZS5leHBvcnRzLmF0dHIgPSBzZXRBdHRyaWJ1dGVcbm1vZHVsZS5leHBvcnRzLmluZGV4ID0gc2V0SW5kZXhcblxuZnVuY3Rpb24gc2V0SW5kZXggKGdlb21ldHJ5LCBkYXRhLCBpdGVtU2l6ZSwgZHR5cGUpIHtcbiAgaWYgKHR5cGVvZiBpdGVtU2l6ZSAhPT0gJ251bWJlcicpIGl0ZW1TaXplID0gMVxuICBpZiAodHlwZW9mIGR0eXBlICE9PSAnc3RyaW5nJykgZHR5cGUgPSAndWludDE2J1xuXG4gIHZhciBpc1I2OSA9ICFnZW9tZXRyeS5pbmRleCAmJiB0eXBlb2YgZ2VvbWV0cnkuc2V0SW5kZXggIT09ICdmdW5jdGlvbidcbiAgdmFyIGF0dHJpYiA9IGlzUjY5ID8gZ2VvbWV0cnkuZ2V0QXR0cmlidXRlKCdpbmRleCcpIDogZ2VvbWV0cnkuaW5kZXhcbiAgdmFyIG5ld0F0dHJpYiA9IHVwZGF0ZUF0dHJpYnV0ZShhdHRyaWIsIGRhdGEsIGl0ZW1TaXplLCBkdHlwZSlcbiAgaWYgKG5ld0F0dHJpYikge1xuICAgIGlmIChpc1I2OSkgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdpbmRleCcsIG5ld0F0dHJpYilcbiAgICBlbHNlIGdlb21ldHJ5LmluZGV4ID0gbmV3QXR0cmliXG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0QXR0cmlidXRlIChnZW9tZXRyeSwga2V5LCBkYXRhLCBpdGVtU2l6ZSwgZHR5cGUpIHtcbiAgaWYgKHR5cGVvZiBpdGVtU2l6ZSAhPT0gJ251bWJlcicpIGl0ZW1TaXplID0gM1xuICBpZiAodHlwZW9mIGR0eXBlICE9PSAnc3RyaW5nJykgZHR5cGUgPSAnZmxvYXQzMidcbiAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkgJiZcbiAgICBBcnJheS5pc0FycmF5KGRhdGFbMF0pICYmXG4gICAgZGF0YVswXS5sZW5ndGggIT09IGl0ZW1TaXplKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOZXN0ZWQgdmVydGV4IGFycmF5IGhhcyB1bmV4cGVjdGVkIHNpemU7IGV4cGVjdGVkICcgK1xuICAgICAgaXRlbVNpemUgKyAnIGJ1dCBmb3VuZCAnICsgZGF0YVswXS5sZW5ndGgpXG4gIH1cblxuICB2YXIgYXR0cmliID0gZ2VvbWV0cnkuZ2V0QXR0cmlidXRlKGtleSlcbiAgdmFyIG5ld0F0dHJpYiA9IHVwZGF0ZUF0dHJpYnV0ZShhdHRyaWIsIGRhdGEsIGl0ZW1TaXplLCBkdHlwZSlcbiAgaWYgKG5ld0F0dHJpYikge1xuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZShrZXksIG5ld0F0dHJpYilcbiAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVBdHRyaWJ1dGUgKGF0dHJpYiwgZGF0YSwgaXRlbVNpemUsIGR0eXBlKSB7XG4gIGRhdGEgPSBkYXRhIHx8IFtdXG4gIGlmICghYXR0cmliIHx8IHJlYnVpbGRBdHRyaWJ1dGUoYXR0cmliLCBkYXRhLCBpdGVtU2l6ZSkpIHtcbiAgICAvLyBjcmVhdGUgYSBuZXcgYXJyYXkgd2l0aCBkZXNpcmVkIHR5cGVcbiAgICBkYXRhID0gZmxhdHRlbihkYXRhLCBkdHlwZSlcblxuICAgIHZhciBuZWVkc05ld0J1ZmZlciA9IGF0dHJpYiAmJiB0eXBlb2YgYXR0cmliLnNldEFycmF5ICE9PSAnZnVuY3Rpb24nXG4gICAgaWYgKCFhdHRyaWIgfHwgbmVlZHNOZXdCdWZmZXIpIHtcbiAgICAgIC8vIFdlIGFyZSBvbiBhbiBvbGQgdmVyc2lvbiBvZiBUaHJlZUpTIHdoaWNoIGNhbid0XG4gICAgICAvLyBzdXBwb3J0IGdyb3dpbmcgLyBzaHJpbmtpbmcgYnVmZmVycywgc28gd2UgbmVlZFxuICAgICAgLy8gdG8gYnVpbGQgYSBuZXcgYnVmZmVyXG4gICAgICBpZiAobmVlZHNOZXdCdWZmZXIgJiYgIXdhcm5lZCkge1xuICAgICAgICB3YXJuZWQgPSB0cnVlXG4gICAgICAgIGNvbnNvbGUud2FybihbXG4gICAgICAgICAgJ0EgV2ViR0wgYnVmZmVyIGlzIGJlaW5nIHVwZGF0ZWQgd2l0aCBhIG5ldyBzaXplIG9yIGl0ZW1TaXplLCAnLFxuICAgICAgICAgICdob3dldmVyIHRoaXMgdmVyc2lvbiBvZiBUaHJlZUpTIG9ubHkgc3VwcG9ydHMgZml4ZWQtc2l6ZSBidWZmZXJzLicsXG4gICAgICAgICAgJ1xcblRoZSBvbGQgYnVmZmVyIG1heSBzdGlsbCBiZSBrZXB0IGluIG1lbW9yeS5cXG4nLFxuICAgICAgICAgICdUbyBhdm9pZCBtZW1vcnkgbGVha3MsIGl0IGlzIHJlY29tbWVuZGVkIHRoYXQgeW91IGRpc3Bvc2UgJyxcbiAgICAgICAgICAneW91ciBnZW9tZXRyaWVzIGFuZCBjcmVhdGUgbmV3IG9uZXMsIG9yIHVwZGF0ZSB0byBUaHJlZUpTIHI4MiBvciBuZXdlci5cXG4nLFxuICAgICAgICAgICdTZWUgaGVyZSBmb3IgZGlzY3Vzc2lvbjpcXG4nLFxuICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3RocmVlLmpzL3B1bGwvOTYzMSdcbiAgICAgICAgXS5qb2luKCcnKSlcbiAgICAgIH1cblxuICAgICAgLy8gQnVpbGQgYSBuZXcgYXR0cmlidXRlXG4gICAgICBhdHRyaWIgPSBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKGRhdGEsIGl0ZW1TaXplKTtcbiAgICB9XG5cbiAgICBhdHRyaWIuaXRlbVNpemUgPSBpdGVtU2l6ZVxuICAgIGF0dHJpYi5uZWVkc1VwZGF0ZSA9IHRydWVcblxuICAgIC8vIE5ldyB2ZXJzaW9ucyBvZiBUaHJlZUpTIHN1Z2dlc3QgdXNpbmcgc2V0QXJyYXlcbiAgICAvLyB0byBjaGFuZ2UgdGhlIGRhdGEuIEl0IHdpbGwgdXNlIGJ1ZmZlckRhdGEgaW50ZXJuYWxseSxcbiAgICAvLyBzbyB5b3UgY2FuIGNoYW5nZSB0aGUgYXJyYXkgc2l6ZSB3aXRob3V0IGFueSBpc3N1ZXNcbiAgICBpZiAodHlwZW9mIGF0dHJpYi5zZXRBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYXR0cmliLnNldEFycmF5KGRhdGEpXG4gICAgfVxuXG4gICAgcmV0dXJuIGF0dHJpYlxuICB9IGVsc2Uge1xuICAgIC8vIGNvcHkgZGF0YSBpbnRvIHRoZSBleGlzdGluZyBhcnJheVxuICAgIGZsYXR0ZW4oZGF0YSwgYXR0cmliLmFycmF5KVxuICAgIGF0dHJpYi5uZWVkc1VwZGF0ZSA9IHRydWVcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbi8vIFRlc3Qgd2hldGhlciB0aGUgYXR0cmlidXRlIG5lZWRzIHRvIGJlIHJlLWNyZWF0ZWQsXG4vLyByZXR1cm5zIGZhbHNlIGlmIHdlIGNhbiByZS11c2UgaXQgYXMtaXMuXG5mdW5jdGlvbiByZWJ1aWxkQXR0cmlidXRlIChhdHRyaWIsIGRhdGEsIGl0ZW1TaXplKSB7XG4gIGlmIChhdHRyaWIuaXRlbVNpemUgIT09IGl0ZW1TaXplKSByZXR1cm4gdHJ1ZVxuICBpZiAoIWF0dHJpYi5hcnJheSkgcmV0dXJuIHRydWVcbiAgdmFyIGF0dHJpYkxlbmd0aCA9IGF0dHJpYi5hcnJheS5sZW5ndGhcbiAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkgJiYgQXJyYXkuaXNBcnJheShkYXRhWzBdKSkge1xuICAgIC8vIFsgWyB4LCB5LCB6IF0gXVxuICAgIHJldHVybiBhdHRyaWJMZW5ndGggIT09IGRhdGEubGVuZ3RoICogaXRlbVNpemVcbiAgfSBlbHNlIHtcbiAgICAvLyBbIHgsIHksIHogXVxuICAgIHJldHVybiBhdHRyaWJMZW5ndGggIT09IGRhdGEubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vdGhyZWUtYnVmZmVyLXZlcnRleC1kYXRhL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKmVzbGludCBuZXctY2FwOjAqL1xudmFyIGR0eXBlID0gcmVxdWlyZSgnZHR5cGUnKVxubW9kdWxlLmV4cG9ydHMgPSBmbGF0dGVuVmVydGV4RGF0YVxuZnVuY3Rpb24gZmxhdHRlblZlcnRleERhdGEgKGRhdGEsIG91dHB1dCwgb2Zmc2V0KSB7XG4gIGlmICghZGF0YSkgdGhyb3cgbmV3IFR5cGVFcnJvcignbXVzdCBzcGVjaWZ5IGRhdGEgYXMgZmlyc3QgcGFyYW1ldGVyJylcbiAgb2Zmc2V0ID0gKyhvZmZzZXQgfHwgMCkgfCAwXG5cbiAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkgJiYgQXJyYXkuaXNBcnJheShkYXRhWzBdKSkge1xuICAgIHZhciBkaW0gPSBkYXRhWzBdLmxlbmd0aFxuICAgIHZhciBsZW5ndGggPSBkYXRhLmxlbmd0aCAqIGRpbVxuXG4gICAgLy8gbm8gb3V0cHV0IHNwZWNpZmllZCwgY3JlYXRlIGEgbmV3IHR5cGVkIGFycmF5XG4gICAgaWYgKCFvdXRwdXQgfHwgdHlwZW9mIG91dHB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG91dHB1dCA9IG5ldyAoZHR5cGUob3V0cHV0IHx8ICdmbG9hdDMyJykpKGxlbmd0aCArIG9mZnNldClcbiAgICB9XG5cbiAgICB2YXIgZHN0TGVuZ3RoID0gb3V0cHV0Lmxlbmd0aCAtIG9mZnNldFxuICAgIGlmIChsZW5ndGggIT09IGRzdExlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdzb3VyY2UgbGVuZ3RoICcgKyBsZW5ndGggKyAnICgnICsgZGltICsgJ3gnICsgZGF0YS5sZW5ndGggKyAnKScgK1xuICAgICAgICAnIGRvZXMgbm90IG1hdGNoIGRlc3RpbmF0aW9uIGxlbmd0aCAnICsgZHN0TGVuZ3RoKVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwLCBrID0gb2Zmc2V0OyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBkaW07IGorKykge1xuICAgICAgICBvdXRwdXRbaysrXSA9IGRhdGFbaV1bal1cbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKCFvdXRwdXQgfHwgdHlwZW9mIG91dHB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIG5vIG91dHB1dCwgY3JlYXRlIGEgbmV3IG9uZVxuICAgICAgdmFyIEN0b3IgPSBkdHlwZShvdXRwdXQgfHwgJ2Zsb2F0MzInKVxuICAgICAgaWYgKG9mZnNldCA9PT0gMCkge1xuICAgICAgICBvdXRwdXQgPSBuZXcgQ3RvcihkYXRhKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0cHV0ID0gbmV3IEN0b3IoZGF0YS5sZW5ndGggKyBvZmZzZXQpXG4gICAgICAgIG91dHB1dC5zZXQoZGF0YSwgb2Zmc2V0KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzdG9yZSBvdXRwdXQgaW4gZXhpc3RpbmcgYXJyYXlcbiAgICAgIG91dHB1dC5zZXQoZGF0YSwgb2Zmc2V0KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvdXRwdXRcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9mbGF0dGVuLXZlcnRleC1kYXRhL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxub2JqZWN0LWFzc2lnblxuKGMpIFNpbmRyZSBTb3JodXNcbkBsaWNlbnNlIE1JVFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbnZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBwcm9wSXNFbnVtZXJhYmxlID0gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuZnVuY3Rpb24gdG9PYmplY3QodmFsKSB7XG5cdGlmICh2YWwgPT09IG51bGwgfHwgdmFsID09PSB1bmRlZmluZWQpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCcpO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdCh2YWwpO1xufVxuXG5mdW5jdGlvbiBzaG91bGRVc2VOYXRpdmUoKSB7XG5cdHRyeSB7XG5cdFx0aWYgKCFPYmplY3QuYXNzaWduKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gRGV0ZWN0IGJ1Z2d5IHByb3BlcnR5IGVudW1lcmF0aW9uIG9yZGVyIGluIG9sZGVyIFY4IHZlcnNpb25zLlxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9NDExOFxuXHRcdHZhciB0ZXN0MSA9IG5ldyBTdHJpbmcoJ2FiYycpOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXctd3JhcHBlcnNcblx0XHR0ZXN0MVs1XSA9ICdkZSc7XG5cdFx0aWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRlc3QxKVswXSA9PT0gJzUnKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuXHRcdHZhciB0ZXN0MiA9IHt9O1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykge1xuXHRcdFx0dGVzdDJbJ18nICsgU3RyaW5nLmZyb21DaGFyQ29kZShpKV0gPSBpO1xuXHRcdH1cblx0XHR2YXIgb3JkZXIyID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDIpLm1hcChmdW5jdGlvbiAobikge1xuXHRcdFx0cmV0dXJuIHRlc3QyW25dO1xuXHRcdH0pO1xuXHRcdGlmIChvcmRlcjIuam9pbignJykgIT09ICcwMTIzNDU2Nzg5Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTMwNTZcblx0XHR2YXIgdGVzdDMgPSB7fTtcblx0XHQnYWJjZGVmZ2hpamtsbW5vcHFyc3QnLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChsZXR0ZXIpIHtcblx0XHRcdHRlc3QzW2xldHRlcl0gPSBsZXR0ZXI7XG5cdFx0fSk7XG5cdFx0aWYgKE9iamVjdC5rZXlzKE9iamVjdC5hc3NpZ24oe30sIHRlc3QzKSkuam9pbignJykgIT09XG5cdFx0XHRcdCdhYmNkZWZnaGlqa2xtbm9wcXJzdCcpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gV2UgZG9uJ3QgZXhwZWN0IGFueSBvZiB0aGUgYWJvdmUgdG8gdGhyb3csIGJ1dCBiZXR0ZXIgdG8gYmUgc2FmZS5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaG91bGRVc2VOYXRpdmUoKSA/IE9iamVjdC5hc3NpZ24gOiBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciB0byA9IHRvT2JqZWN0KHRhcmdldCk7XG5cdHZhciBzeW1ib2xzO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IE9iamVjdChhcmd1bWVudHNbc10pO1xuXG5cdFx0Zm9yICh2YXIga2V5IGluIGZyb20pIHtcblx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcblx0XHRcdFx0dG9ba2V5XSA9IGZyb21ba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG5cdFx0XHRzeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGZyb20pO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzeW1ib2xzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChwcm9wSXNFbnVtZXJhYmxlLmNhbGwoZnJvbSwgc3ltYm9sc1tpXSkpIHtcblx0XHRcdFx0XHR0b1tzeW1ib2xzW2ldXSA9IGZyb21bc3ltYm9sc1tpXV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG87XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L29iamVjdC1hc3NpZ24vaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDE5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzLnBhZ2VzID0gZnVuY3Rpb24gcGFnZXMgKGdseXBocykge1xuICB2YXIgcGFnZXMgPSBuZXcgRmxvYXQzMkFycmF5KGdseXBocy5sZW5ndGggKiA0ICogMSlcbiAgdmFyIGkgPSAwXG4gIGdseXBocy5mb3JFYWNoKGZ1bmN0aW9uIChnbHlwaCkge1xuICAgIHZhciBpZCA9IGdseXBoLmRhdGEucGFnZSB8fCAwXG4gICAgcGFnZXNbaSsrXSA9IGlkXG4gICAgcGFnZXNbaSsrXSA9IGlkXG4gICAgcGFnZXNbaSsrXSA9IGlkXG4gICAgcGFnZXNbaSsrXSA9IGlkXG4gIH0pXG4gIHJldHVybiBwYWdlc1xufVxuXG5tb2R1bGUuZXhwb3J0cy51dnMgPSBmdW5jdGlvbiB1dnMgKGdseXBocywgdGV4V2lkdGgsIHRleEhlaWdodCwgZmxpcFkpIHtcbiAgdmFyIHV2cyA9IG5ldyBGbG9hdDMyQXJyYXkoZ2x5cGhzLmxlbmd0aCAqIDQgKiAyKVxuICB2YXIgaSA9IDBcbiAgZ2x5cGhzLmZvckVhY2goZnVuY3Rpb24gKGdseXBoKSB7XG4gICAgdmFyIGJpdG1hcCA9IGdseXBoLmRhdGFcbiAgICB2YXIgYncgPSAoYml0bWFwLnggKyBiaXRtYXAud2lkdGgpXG4gICAgdmFyIGJoID0gKGJpdG1hcC55ICsgYml0bWFwLmhlaWdodClcblxuICAgIC8vIHRvcCBsZWZ0IHBvc2l0aW9uXG4gICAgdmFyIHUwID0gYml0bWFwLnggLyB0ZXhXaWR0aFxuICAgIHZhciB2MSA9IGJpdG1hcC55IC8gdGV4SGVpZ2h0XG4gICAgdmFyIHUxID0gYncgLyB0ZXhXaWR0aFxuICAgIHZhciB2MCA9IGJoIC8gdGV4SGVpZ2h0XG5cbiAgICBpZiAoZmxpcFkpIHtcbiAgICAgIHYxID0gKHRleEhlaWdodCAtIGJpdG1hcC55KSAvIHRleEhlaWdodFxuICAgICAgdjAgPSAodGV4SGVpZ2h0IC0gYmgpIC8gdGV4SGVpZ2h0XG4gICAgfVxuXG4gICAgLy8gQkxcbiAgICB1dnNbaSsrXSA9IHUwXG4gICAgdXZzW2krK10gPSB2MVxuICAgIC8vIFRMXG4gICAgdXZzW2krK10gPSB1MFxuICAgIHV2c1tpKytdID0gdjBcbiAgICAvLyBUUlxuICAgIHV2c1tpKytdID0gdTFcbiAgICB1dnNbaSsrXSA9IHYwXG4gICAgLy8gQlJcbiAgICB1dnNbaSsrXSA9IHUxXG4gICAgdXZzW2krK10gPSB2MVxuICB9KVxuICByZXR1cm4gdXZzXG59XG5cbm1vZHVsZS5leHBvcnRzLnBvc2l0aW9ucyA9IGZ1bmN0aW9uIHBvc2l0aW9ucyAoZ2x5cGhzKSB7XG4gIHZhciBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KGdseXBocy5sZW5ndGggKiA0ICogMilcbiAgdmFyIGkgPSAwXG4gIGdseXBocy5mb3JFYWNoKGZ1bmN0aW9uIChnbHlwaCkge1xuICAgIHZhciBiaXRtYXAgPSBnbHlwaC5kYXRhXG5cbiAgICAvLyBib3R0b20gbGVmdCBwb3NpdGlvblxuICAgIHZhciB4ID0gZ2x5cGgucG9zaXRpb25bMF0gKyBiaXRtYXAueG9mZnNldFxuICAgIHZhciB5ID0gZ2x5cGgucG9zaXRpb25bMV0gKyBiaXRtYXAueW9mZnNldFxuXG4gICAgLy8gcXVhZCBzaXplXG4gICAgdmFyIHcgPSBiaXRtYXAud2lkdGhcbiAgICB2YXIgaCA9IGJpdG1hcC5oZWlnaHRcblxuICAgIC8vIEJMXG4gICAgcG9zaXRpb25zW2krK10gPSB4XG4gICAgcG9zaXRpb25zW2krK10gPSB5XG4gICAgLy8gVExcbiAgICBwb3NpdGlvbnNbaSsrXSA9IHhcbiAgICBwb3NpdGlvbnNbaSsrXSA9IHkgKyBoXG4gICAgLy8gVFJcbiAgICBwb3NpdGlvbnNbaSsrXSA9IHggKyB3XG4gICAgcG9zaXRpb25zW2krK10gPSB5ICsgaFxuICAgIC8vIEJSXG4gICAgcG9zaXRpb25zW2krK10gPSB4ICsgd1xuICAgIHBvc2l0aW9uc1tpKytdID0geVxuICB9KVxuICByZXR1cm4gcG9zaXRpb25zXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vdGhyZWUtYm1mb250LXRleHQvbGliL3ZlcnRpY2VzLmpzXG4vLyBtb2R1bGUgaWQgPSAyMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaXRlbVNpemUgPSAyXG52YXIgYm94ID0geyBtaW46IFswLCAwXSwgbWF4OiBbMCwgMF0gfVxuXG5mdW5jdGlvbiBib3VuZHMgKHBvc2l0aW9ucykge1xuICB2YXIgY291bnQgPSBwb3NpdGlvbnMubGVuZ3RoIC8gaXRlbVNpemVcbiAgYm94Lm1pblswXSA9IHBvc2l0aW9uc1swXVxuICBib3gubWluWzFdID0gcG9zaXRpb25zWzFdXG4gIGJveC5tYXhbMF0gPSBwb3NpdGlvbnNbMF1cbiAgYm94Lm1heFsxXSA9IHBvc2l0aW9uc1sxXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgIHZhciB4ID0gcG9zaXRpb25zW2kgKiBpdGVtU2l6ZSArIDBdXG4gICAgdmFyIHkgPSBwb3NpdGlvbnNbaSAqIGl0ZW1TaXplICsgMV1cbiAgICBib3gubWluWzBdID0gTWF0aC5taW4oeCwgYm94Lm1pblswXSlcbiAgICBib3gubWluWzFdID0gTWF0aC5taW4oeSwgYm94Lm1pblsxXSlcbiAgICBib3gubWF4WzBdID0gTWF0aC5tYXgoeCwgYm94Lm1heFswXSlcbiAgICBib3gubWF4WzFdID0gTWF0aC5tYXgoeSwgYm94Lm1heFsxXSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5jb21wdXRlQm94ID0gZnVuY3Rpb24gKHBvc2l0aW9ucywgb3V0cHV0KSB7XG4gIGJvdW5kcyhwb3NpdGlvbnMpXG4gIG91dHB1dC5taW4uc2V0KGJveC5taW5bMF0sIGJveC5taW5bMV0sIDApXG4gIG91dHB1dC5tYXguc2V0KGJveC5tYXhbMF0sIGJveC5tYXhbMV0sIDApXG59XG5cbm1vZHVsZS5leHBvcnRzLmNvbXB1dGVTcGhlcmUgPSBmdW5jdGlvbiAocG9zaXRpb25zLCBvdXRwdXQpIHtcbiAgYm91bmRzKHBvc2l0aW9ucylcbiAgdmFyIG1pblggPSBib3gubWluWzBdXG4gIHZhciBtaW5ZID0gYm94Lm1pblsxXVxuICB2YXIgbWF4WCA9IGJveC5tYXhbMF1cbiAgdmFyIG1heFkgPSBib3gubWF4WzFdXG4gIHZhciB3aWR0aCA9IG1heFggLSBtaW5YXG4gIHZhciBoZWlnaHQgPSBtYXhZIC0gbWluWVxuICB2YXIgbGVuZ3RoID0gTWF0aC5zcXJ0KHdpZHRoICogd2lkdGggKyBoZWlnaHQgKiBoZWlnaHQpXG4gIG91dHB1dC5jZW50ZXIuc2V0KG1pblggKyB3aWR0aCAvIDIsIG1pblkgKyBoZWlnaHQgLyAyLCAwKVxuICBvdXRwdXQucmFkaXVzID0gbGVuZ3RoIC8gMlxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3RocmVlLWJtZm9udC10ZXh0L2xpYi91dGlscy5qc1xuLy8gbW9kdWxlIGlkID0gMjFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHhociA9IHJlcXVpcmUoJ3hocicpXG52YXIgbm9vcCA9IGZ1bmN0aW9uKCl7fVxudmFyIHBhcnNlQVNDSUkgPSByZXF1aXJlKCdwYXJzZS1ibWZvbnQtYXNjaWknKVxudmFyIHBhcnNlWE1MID0gcmVxdWlyZSgncGFyc2UtYm1mb250LXhtbCcpXG52YXIgcmVhZEJpbmFyeSA9IHJlcXVpcmUoJ3BhcnNlLWJtZm9udC1iaW5hcnknKVxudmFyIGlzQmluYXJ5Rm9ybWF0ID0gcmVxdWlyZSgnLi9saWIvaXMtYmluYXJ5JylcbnZhciB4dGVuZCA9IHJlcXVpcmUoJ3h0ZW5kJylcblxudmFyIHhtbDIgPSAoZnVuY3Rpb24gaGFzWE1MMigpIHtcbiAgcmV0dXJuIHdpbmRvdy5YTUxIdHRwUmVxdWVzdCAmJiBcIndpdGhDcmVkZW50aWFsc1wiIGluIG5ldyBYTUxIdHRwUmVxdWVzdFxufSkoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdCwgY2IpIHtcbiAgY2IgPSB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicgPyBjYiA6IG5vb3BcblxuICBpZiAodHlwZW9mIG9wdCA9PT0gJ3N0cmluZycpXG4gICAgb3B0ID0geyB1cmk6IG9wdCB9XG4gIGVsc2UgaWYgKCFvcHQpXG4gICAgb3B0ID0ge31cblxuICB2YXIgZXhwZWN0QmluYXJ5ID0gb3B0LmJpbmFyeVxuICBpZiAoZXhwZWN0QmluYXJ5KVxuICAgIG9wdCA9IGdldEJpbmFyeU9wdHMob3B0KVxuXG4gIHhocihvcHQsIGZ1bmN0aW9uKGVyciwgcmVzLCBib2R5KSB7XG4gICAgaWYgKGVycilcbiAgICAgIHJldHVybiBjYihlcnIpXG4gICAgaWYgKCEvXjIvLnRlc3QocmVzLnN0YXR1c0NvZGUpKVxuICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignaHR0cCBzdGF0dXMgY29kZTogJytyZXMuc3RhdHVzQ29kZSkpXG4gICAgaWYgKCFib2R5KVxuICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignbm8gYm9keSByZXN1bHQnKSlcblxuICAgIHZhciBiaW5hcnkgPSBmYWxzZSBcblxuICAgIC8vaWYgdGhlIHJlc3BvbnNlIHR5cGUgaXMgYW4gYXJyYXkgYnVmZmVyLFxuICAgIC8vd2UgbmVlZCB0byBjb252ZXJ0IGl0IGludG8gYSByZWd1bGFyIEJ1ZmZlciBvYmplY3RcbiAgICBpZiAoaXNBcnJheUJ1ZmZlcihib2R5KSkge1xuICAgICAgdmFyIGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYm9keSlcbiAgICAgIGJvZHkgPSBuZXcgQnVmZmVyKGFycmF5LCAnYmluYXJ5JylcbiAgICB9XG5cbiAgICAvL25vdyBjaGVjayB0aGUgc3RyaW5nL0J1ZmZlciByZXNwb25zZVxuICAgIC8vYW5kIHNlZSBpZiBpdCBoYXMgYSBiaW5hcnkgQk1GIGhlYWRlclxuICAgIGlmIChpc0JpbmFyeUZvcm1hdChib2R5KSkge1xuICAgICAgYmluYXJ5ID0gdHJ1ZVxuICAgICAgLy9pZiB3ZSBoYXZlIGEgc3RyaW5nLCB0dXJuIGl0IGludG8gYSBCdWZmZXJcbiAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIFxuICAgICAgICBib2R5ID0gbmV3IEJ1ZmZlcihib2R5LCAnYmluYXJ5JylcbiAgICB9IFxuXG4gICAgLy93ZSBhcmUgbm90IHBhcnNpbmcgYSBiaW5hcnkgZm9ybWF0LCBqdXN0IEFTQ0lJL1hNTC9ldGNcbiAgICBpZiAoIWJpbmFyeSkge1xuICAgICAgLy9taWdodCBzdGlsbCBiZSBhIGJ1ZmZlciBpZiByZXNwb25zZVR5cGUgaXMgJ2FycmF5YnVmZmVyJ1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihib2R5KSlcbiAgICAgICAgYm9keSA9IGJvZHkudG9TdHJpbmcob3B0LmVuY29kaW5nKVxuICAgICAgYm9keSA9IGJvZHkudHJpbSgpXG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICB2YXIgdHlwZSA9IHJlcy5oZWFkZXJzWydjb250ZW50LXR5cGUnXVxuICAgICAgaWYgKGJpbmFyeSlcbiAgICAgICAgcmVzdWx0ID0gcmVhZEJpbmFyeShib2R5KVxuICAgICAgZWxzZSBpZiAoL2pzb24vLnRlc3QodHlwZSkgfHwgYm9keS5jaGFyQXQoMCkgPT09ICd7JylcbiAgICAgICAgcmVzdWx0ID0gSlNPTi5wYXJzZShib2R5KVxuICAgICAgZWxzZSBpZiAoL3htbC8udGVzdCh0eXBlKSAgfHwgYm9keS5jaGFyQXQoMCkgPT09ICc8JylcbiAgICAgICAgcmVzdWx0ID0gcGFyc2VYTUwoYm9keSlcbiAgICAgIGVsc2VcbiAgICAgICAgcmVzdWx0ID0gcGFyc2VBU0NJSShib2R5KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNiKG5ldyBFcnJvcignZXJyb3IgcGFyc2luZyBmb250ICcrZS5tZXNzYWdlKSlcbiAgICAgIGNiID0gbm9vcFxuICAgIH1cbiAgICBjYihudWxsLCByZXN1bHQpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIoYXJyKSB7XG4gIHZhciBzdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG4gIHJldHVybiBzdHIuY2FsbChhcnIpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nXG59XG5cbmZ1bmN0aW9uIGdldEJpbmFyeU9wdHMob3B0KSB7XG4gIC8vSUUxMCsgYW5kIG90aGVyIG1vZGVybiBicm93c2VycyBzdXBwb3J0IGFycmF5IGJ1ZmZlcnNcbiAgaWYgKHhtbDIpXG4gICAgcmV0dXJuIHh0ZW5kKG9wdCwgeyByZXNwb25zZVR5cGU6ICdhcnJheWJ1ZmZlcicgfSlcbiAgXG4gIGlmICh0eXBlb2Ygd2luZG93LlhNTEh0dHBSZXF1ZXN0ID09PSAndW5kZWZpbmVkJylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3lvdXIgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IFhIUiBsb2FkaW5nJylcblxuICAvL0lFOSBhbmQgWE1MMSBicm93c2VycyBjb3VsZCBzdGlsbCB1c2UgYW4gb3ZlcnJpZGVcbiAgdmFyIHJlcSA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKVxuICByZXEub3ZlcnJpZGVNaW1lVHlwZSgndGV4dC9wbGFpbjsgY2hhcnNldD14LXVzZXItZGVmaW5lZCcpXG4gIHJldHVybiB4dGVuZCh7XG4gICAgeGhyOiByZXFcbiAgfSwgb3B0KVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2FkLWJtZm9udC9icm93c2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAyMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCdpc2FycmF5JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IFNsb3dCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuXG4vKipcbiAqIElmIGBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVGA6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChtb3N0IGNvbXBhdGlibGUsIGV2ZW4gSUU2KVxuICpcbiAqIEJyb3dzZXJzIHRoYXQgc3VwcG9ydCB0eXBlZCBhcnJheXMgYXJlIElFIDEwKywgRmlyZWZveCA0KywgQ2hyb21lIDcrLCBTYWZhcmkgNS4xKyxcbiAqIE9wZXJhIDExLjYrLCBpT1MgNC4yKy5cbiAqXG4gKiBEdWUgdG8gdmFyaW91cyBicm93c2VyIGJ1Z3MsIHNvbWV0aW1lcyB0aGUgT2JqZWN0IGltcGxlbWVudGF0aW9uIHdpbGwgYmUgdXNlZCBldmVuXG4gKiB3aGVuIHRoZSBicm93c2VyIHN1cHBvcnRzIHR5cGVkIGFycmF5cy5cbiAqXG4gKiBOb3RlOlxuICpcbiAqICAgLSBGaXJlZm94IDQtMjkgbGFja3Mgc3VwcG9ydCBmb3IgYWRkaW5nIG5ldyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsXG4gKiAgICAgU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzguXG4gKlxuICogICAtIENocm9tZSA5LTEwIGlzIG1pc3NpbmcgdGhlIGBUeXBlZEFycmF5LnByb3RvdHlwZS5zdWJhcnJheWAgZnVuY3Rpb24uXG4gKlxuICogICAtIElFMTAgaGFzIGEgYnJva2VuIGBUeXBlZEFycmF5LnByb3RvdHlwZS5zdWJhcnJheWAgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhcnJheXMgb2ZcbiAqICAgICBpbmNvcnJlY3QgbGVuZ3RoIGluIHNvbWUgc2l0dWF0aW9ucy5cblxuICogV2UgZGV0ZWN0IHRoZXNlIGJ1Z2d5IGJyb3dzZXJzIGFuZCBzZXQgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYCB0byBgZmFsc2VgIHNvIHRoZXlcbiAqIGdldCB0aGUgT2JqZWN0IGltcGxlbWVudGF0aW9uLCB3aGljaCBpcyBzbG93ZXIgYnV0IGJlaGF2ZXMgY29ycmVjdGx5LlxuICovXG5CdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCA9IGdsb2JhbC5UWVBFRF9BUlJBWV9TVVBQT1JUICE9PSB1bmRlZmluZWRcbiAgPyBnbG9iYWwuVFlQRURfQVJSQVlfU1VQUE9SVFxuICA6IHR5cGVkQXJyYXlTdXBwb3J0KClcblxuLypcbiAqIEV4cG9ydCBrTWF4TGVuZ3RoIGFmdGVyIHR5cGVkIGFycmF5IHN1cHBvcnQgaXMgZGV0ZXJtaW5lZC5cbiAqL1xuZXhwb3J0cy5rTWF4TGVuZ3RoID0ga01heExlbmd0aCgpXG5cbmZ1bmN0aW9uIHR5cGVkQXJyYXlTdXBwb3J0ICgpIHtcbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoMSlcbiAgICBhcnIuX19wcm90b19fID0ge19fcHJvdG9fXzogVWludDhBcnJheS5wcm90b3R5cGUsIGZvbzogZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfX1cbiAgICByZXR1cm4gYXJyLmZvbygpID09PSA0MiAmJiAvLyB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZFxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nICYmIC8vIGNocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICAgICAgICBhcnIuc3ViYXJyYXkoMSwgMSkuYnl0ZUxlbmd0aCA9PT0gMCAvLyBpZTEwIGhhcyBicm9rZW4gYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24ga01heExlbmd0aCAoKSB7XG4gIHJldHVybiBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVFxuICAgID8gMHg3ZmZmZmZmZlxuICAgIDogMHgzZmZmZmZmZlxufVxuXG5mdW5jdGlvbiBjcmVhdGVCdWZmZXIgKHRoYXQsIGxlbmd0aCkge1xuICBpZiAoa01heExlbmd0aCgpIDwgbGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgdHlwZWQgYXJyYXkgbGVuZ3RoJylcbiAgfVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSwgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICB0aGF0ID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKVxuICAgIHRoYXQuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gYW4gb2JqZWN0IGluc3RhbmNlIG9mIHRoZSBCdWZmZXIgY2xhc3NcbiAgICBpZiAodGhhdCA9PT0gbnVsbCkge1xuICAgICAgdGhhdCA9IG5ldyBCdWZmZXIobGVuZ3RoKVxuICAgIH1cbiAgICB0aGF0Lmxlbmd0aCA9IGxlbmd0aFxuICB9XG5cbiAgcmV0dXJuIHRoYXRcbn1cblxuLyoqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGhhdmUgdGhlaXJcbiAqIHByb3RvdHlwZSBjaGFuZ2VkIHRvIGBCdWZmZXIucHJvdG90eXBlYC4gRnVydGhlcm1vcmUsIGBCdWZmZXJgIGlzIGEgc3ViY2xhc3Mgb2ZcbiAqIGBVaW50OEFycmF5YCwgc28gdGhlIHJldHVybmVkIGluc3RhbmNlcyB3aWxsIGhhdmUgYWxsIHRoZSBub2RlIGBCdWZmZXJgIG1ldGhvZHNcbiAqIGFuZCB0aGUgYFVpbnQ4QXJyYXlgIG1ldGhvZHMuIFNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0XG4gKiByZXR1cm5zIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIFRoZSBgVWludDhBcnJheWAgcHJvdG90eXBlIHJlbWFpbnMgdW5tb2RpZmllZC5cbiAqL1xuXG5mdW5jdGlvbiBCdWZmZXIgKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgLy8gQ29tbW9uIGNhc2UuXG4gIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmdPck9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0lmIGVuY29kaW5nIGlzIHNwZWNpZmllZCB0aGVuIHRoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nJ1xuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gYWxsb2NVbnNhZmUodGhpcywgYXJnKVxuICB9XG4gIHJldHVybiBmcm9tKHRoaXMsIGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxuLy8gVE9ETzogTGVnYWN5LCBub3QgbmVlZGVkIGFueW1vcmUuIFJlbW92ZSBpbiBuZXh0IG1ham9yIHZlcnNpb24uXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBhcnJcbn1cblxuZnVuY3Rpb24gZnJvbSAodGhhdCwgdmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBhIG51bWJlcicpXG4gIH1cblxuICBpZiAodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUJ1ZmZlcih0aGF0LCB2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh0aGF0LCB2YWx1ZSwgZW5jb2RpbmdPck9mZnNldClcbiAgfVxuXG4gIHJldHVybiBmcm9tT2JqZWN0KHRoYXQsIHZhbHVlKVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uYWxseSBlcXVpdmFsZW50IHRvIEJ1ZmZlcihhcmcsIGVuY29kaW5nKSBidXQgdGhyb3dzIGEgVHlwZUVycm9yXG4gKiBpZiB2YWx1ZSBpcyBhIG51bWJlci5cbiAqIEJ1ZmZlci5mcm9tKHN0clssIGVuY29kaW5nXSlcbiAqIEJ1ZmZlci5mcm9tKGFycmF5KVxuICogQnVmZmVyLmZyb20oYnVmZmVyKVxuICogQnVmZmVyLmZyb20oYXJyYXlCdWZmZXJbLCBieXRlT2Zmc2V0WywgbGVuZ3RoXV0pXG4gKiovXG5CdWZmZXIuZnJvbSA9IGZ1bmN0aW9uICh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBmcm9tKG51bGwsIHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbmlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICBCdWZmZXIucHJvdG90eXBlLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXkucHJvdG90eXBlXG4gIEJ1ZmZlci5fX3Byb3RvX18gPSBVaW50OEFycmF5XG4gIGlmICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wuc3BlY2llcyAmJlxuICAgICAgQnVmZmVyW1N5bWJvbC5zcGVjaWVzXSA9PT0gQnVmZmVyKSB7XG4gICAgLy8gRml4IHN1YmFycmF5KCkgaW4gRVMyMDE2LiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL3B1bGwvOTdcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQnVmZmVyLCBTeW1ib2wuc3BlY2llcywge1xuICAgICAgdmFsdWU6IG51bGwsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFNpemUgKHNpemUpIHtcbiAgaWYgKHR5cGVvZiBzaXplICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wic2l6ZVwiIGFyZ3VtZW50IG11c3QgYmUgYSBudW1iZXInKVxuICB9IGVsc2UgaWYgKHNpemUgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1wic2l6ZVwiIGFyZ3VtZW50IG11c3Qgbm90IGJlIG5lZ2F0aXZlJylcbiAgfVxufVxuXG5mdW5jdGlvbiBhbGxvYyAodGhhdCwgc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICBpZiAoc2l6ZSA8PSAwKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplKVxuICB9XG4gIGlmIChmaWxsICE9PSB1bmRlZmluZWQpIHtcbiAgICAvLyBPbmx5IHBheSBhdHRlbnRpb24gdG8gZW5jb2RpbmcgaWYgaXQncyBhIHN0cmluZy4gVGhpc1xuICAgIC8vIHByZXZlbnRzIGFjY2lkZW50YWxseSBzZW5kaW5nIGluIGEgbnVtYmVyIHRoYXQgd291bGRcbiAgICAvLyBiZSBpbnRlcnByZXR0ZWQgYXMgYSBzdGFydCBvZmZzZXQuXG4gICAgcmV0dXJuIHR5cGVvZiBlbmNvZGluZyA9PT0gJ3N0cmluZydcbiAgICAgID8gY3JlYXRlQnVmZmVyKHRoYXQsIHNpemUpLmZpbGwoZmlsbCwgZW5jb2RpbmcpXG4gICAgICA6IGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplKS5maWxsKGZpbGwpXG4gIH1cbiAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplKVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqIGFsbG9jKHNpemVbLCBmaWxsWywgZW5jb2RpbmddXSlcbiAqKi9cbkJ1ZmZlci5hbGxvYyA9IGZ1bmN0aW9uIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICByZXR1cm4gYWxsb2MobnVsbCwgc2l6ZSwgZmlsbCwgZW5jb2RpbmcpXG59XG5cbmZ1bmN0aW9uIGFsbG9jVW5zYWZlICh0aGF0LCBzaXplKSB7XG4gIGFzc2VydFNpemUoc2l6ZSlcbiAgdGhhdCA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplIDwgMCA/IDAgOiBjaGVja2VkKHNpemUpIHwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2l6ZTsgKytpKSB7XG4gICAgICB0aGF0W2ldID0gMFxuICAgIH1cbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gQnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKG51bGwsIHNpemUpXG59XG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gU2xvd0J1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICovXG5CdWZmZXIuYWxsb2NVbnNhZmVTbG93ID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKG51bGwsIHNpemUpXG59XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHRoYXQsIHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycgfHwgZW5jb2RpbmcgPT09ICcnKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgfVxuXG4gIGlmICghQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJlbmNvZGluZ1wiIG11c3QgYmUgYSB2YWxpZCBzdHJpbmcgZW5jb2RpbmcnKVxuICB9XG5cbiAgdmFyIGxlbmd0aCA9IGJ5dGVMZW5ndGgoc3RyaW5nLCBlbmNvZGluZykgfCAwXG4gIHRoYXQgPSBjcmVhdGVCdWZmZXIodGhhdCwgbGVuZ3RoKVxuXG4gIHZhciBhY3R1YWwgPSB0aGF0LndyaXRlKHN0cmluZywgZW5jb2RpbmcpXG5cbiAgaWYgKGFjdHVhbCAhPT0gbGVuZ3RoKSB7XG4gICAgLy8gV3JpdGluZyBhIGhleCBzdHJpbmcsIGZvciBleGFtcGxlLCB0aGF0IGNvbnRhaW5zIGludmFsaWQgY2hhcmFjdGVycyB3aWxsXG4gICAgLy8gY2F1c2UgZXZlcnl0aGluZyBhZnRlciB0aGUgZmlyc3QgaW52YWxpZCBjaGFyYWN0ZXIgdG8gYmUgaWdub3JlZC4gKGUuZy5cbiAgICAvLyAnYWJ4eGNkJyB3aWxsIGJlIHRyZWF0ZWQgYXMgJ2FiJylcbiAgICB0aGF0ID0gdGhhdC5zbGljZSgwLCBhY3R1YWwpXG4gIH1cblxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlMaWtlICh0aGF0LCBhcnJheSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoIDwgMCA/IDAgOiBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIHRoYXQgPSBjcmVhdGVCdWZmZXIodGhhdCwgbGVuZ3RoKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgdGhhdFtpXSA9IGFycmF5W2ldICYgMjU1XG4gIH1cbiAgcmV0dXJuIHRoYXRcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5QnVmZmVyICh0aGF0LCBhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKSB7XG4gIGFycmF5LmJ5dGVMZW5ndGggLy8gdGhpcyB0aHJvd3MgaWYgYGFycmF5YCBpcyBub3QgYSB2YWxpZCBBcnJheUJ1ZmZlclxuXG4gIGlmIChieXRlT2Zmc2V0IDwgMCB8fCBhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdvZmZzZXRcXCcgaXMgb3V0IG9mIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQgKyAobGVuZ3RoIHx8IDApKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ2xlbmd0aFxcJyBpcyBvdXQgb2YgYm91bmRzJylcbiAgfVxuXG4gIGlmIChieXRlT2Zmc2V0ID09PSB1bmRlZmluZWQgJiYgbGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBhcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5KVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheSwgYnl0ZU9mZnNldClcbiAgfSBlbHNlIHtcbiAgICBhcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSwgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICB0aGF0ID0gYXJyYXlcbiAgICB0aGF0Ll9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIGFuIG9iamVjdCBpbnN0YW5jZSBvZiB0aGUgQnVmZmVyIGNsYXNzXG4gICAgdGhhdCA9IGZyb21BcnJheUxpa2UodGhhdCwgYXJyYXkpXG4gIH1cbiAgcmV0dXJuIHRoYXRcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAodGhhdCwgb2JqKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqKSkge1xuICAgIHZhciBsZW4gPSBjaGVja2VkKG9iai5sZW5ndGgpIHwgMFxuICAgIHRoYXQgPSBjcmVhdGVCdWZmZXIodGhhdCwgbGVuKVxuXG4gICAgaWYgKHRoYXQubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhhdFxuICAgIH1cblxuICAgIG9iai5jb3B5KHRoYXQsIDAsIDAsIGxlbilcbiAgICByZXR1cm4gdGhhdFxuICB9XG5cbiAgaWYgKG9iaikge1xuICAgIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICBvYmouYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHx8ICdsZW5ndGgnIGluIG9iaikge1xuICAgICAgaWYgKHR5cGVvZiBvYmoubGVuZ3RoICE9PSAnbnVtYmVyJyB8fCBpc25hbihvYmoubGVuZ3RoKSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHRoYXQsIDApXG4gICAgICB9XG4gICAgICByZXR1cm4gZnJvbUFycmF5TGlrZSh0aGF0LCBvYmopXG4gICAgfVxuXG4gICAgaWYgKG9iai50eXBlID09PSAnQnVmZmVyJyAmJiBpc0FycmF5KG9iai5kYXRhKSkge1xuICAgICAgcmV0dXJuIGZyb21BcnJheUxpa2UodGhhdCwgb2JqLmRhdGEpXG4gICAgfVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksIG9yIGFycmF5LWxpa2Ugb2JqZWN0LicpXG59XG5cbmZ1bmN0aW9uIGNoZWNrZWQgKGxlbmd0aCkge1xuICAvLyBOb3RlOiBjYW5ub3QgdXNlIGBsZW5ndGggPCBrTWF4TGVuZ3RoKClgIGhlcmUgYmVjYXVzZSB0aGF0IGZhaWxzIHdoZW5cbiAgLy8gbGVuZ3RoIGlzIE5hTiAod2hpY2ggaXMgb3RoZXJ3aXNlIGNvZXJjZWQgdG8gemVyby4pXG4gIGlmIChsZW5ndGggPj0ga01heExlbmd0aCgpKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gYWxsb2NhdGUgQnVmZmVyIGxhcmdlciB0aGFuIG1heGltdW0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemU6IDB4JyArIGtNYXhMZW5ndGgoKS50b1N0cmluZygxNikgKyAnIGJ5dGVzJylcbiAgfVxuICByZXR1cm4gbGVuZ3RoIHwgMFxufVxuXG5mdW5jdGlvbiBTbG93QnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKCtsZW5ndGggIT0gbGVuZ3RoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZXFlcWVxXG4gICAgbGVuZ3RoID0gMFxuICB9XG4gIHJldHVybiBCdWZmZXIuYWxsb2MoK2xlbmd0aClcbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIgKGIpIHtcbiAgcmV0dXJuICEhKGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlIChhLCBiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGEpIHx8ICFCdWZmZXIuaXNCdWZmZXIoYikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgbXVzdCBiZSBCdWZmZXJzJylcbiAgfVxuXG4gIGlmIChhID09PSBiKSByZXR1cm4gMFxuXG4gIHZhciB4ID0gYS5sZW5ndGhcbiAgdmFyIHkgPSBiLmxlbmd0aFxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBNYXRoLm1pbih4LCB5KTsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKGFbaV0gIT09IGJbaV0pIHtcbiAgICAgIHggPSBhW2ldXG4gICAgICB5ID0gYltpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gaXNFbmNvZGluZyAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnbGF0aW4xJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiBjb25jYXQgKGxpc3QsIGxlbmd0aCkge1xuICBpZiAoIWlzQXJyYXkobGlzdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5hbGxvYygwKVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICBsZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmZmVyID0gQnVmZmVyLmFsbG9jVW5zYWZlKGxlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgYnVmID0gbGlzdFtpXVxuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gICAgfVxuICAgIGJ1Zi5jb3B5KGJ1ZmZlciwgcG9zKVxuICAgIHBvcyArPSBidWYubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZmZlclxufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIoc3RyaW5nKSkge1xuICAgIHJldHVybiBzdHJpbmcubGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIEFycmF5QnVmZmVyLmlzVmlldyA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgKEFycmF5QnVmZmVyLmlzVmlldyhzdHJpbmcpIHx8IHN0cmluZyBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSkge1xuICAgIHJldHVybiBzdHJpbmcuYnl0ZUxlbmd0aFxuICB9XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuICAgIHN0cmluZyA9ICcnICsgc3RyaW5nXG4gIH1cblxuICB2YXIgbGVuID0gc3RyaW5nLmxlbmd0aFxuICBpZiAobGVuID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIFVzZSBhIGZvciBsb29wIHRvIGF2b2lkIHJlY3Vyc2lvblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsZW5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICAgIHJldHVybiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIGxlbiAqIDJcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBsZW4gPj4+IDFcbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHJldHVybiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aCAvLyBhc3N1bWUgdXRmOFxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuQnVmZmVyLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5cbmZ1bmN0aW9uIHNsb3dUb1N0cmluZyAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICAvLyBObyBuZWVkIHRvIHZlcmlmeSB0aGF0IFwidGhpcy5sZW5ndGggPD0gTUFYX1VJTlQzMlwiIHNpbmNlIGl0J3MgYSByZWFkLW9ubHlcbiAgLy8gcHJvcGVydHkgb2YgYSB0eXBlZCBhcnJheS5cblxuICAvLyBUaGlzIGJlaGF2ZXMgbmVpdGhlciBsaWtlIFN0cmluZyBub3IgVWludDhBcnJheSBpbiB0aGF0IHdlIHNldCBzdGFydC9lbmRcbiAgLy8gdG8gdGhlaXIgdXBwZXIvbG93ZXIgYm91bmRzIGlmIHRoZSB2YWx1ZSBwYXNzZWQgaXMgb3V0IG9mIHJhbmdlLlxuICAvLyB1bmRlZmluZWQgaXMgaGFuZGxlZCBzcGVjaWFsbHkgYXMgcGVyIEVDTUEtMjYyIDZ0aCBFZGl0aW9uLFxuICAvLyBTZWN0aW9uIDEzLjMuMy43IFJ1bnRpbWUgU2VtYW50aWNzOiBLZXllZEJpbmRpbmdJbml0aWFsaXphdGlvbi5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQgfHwgc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgLy8gUmV0dXJuIGVhcmx5IGlmIHN0YXJ0ID4gdGhpcy5sZW5ndGguIERvbmUgaGVyZSB0byBwcmV2ZW50IHBvdGVudGlhbCB1aW50MzJcbiAgLy8gY29lcmNpb24gZmFpbCBiZWxvdy5cbiAgaWYgKHN0YXJ0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCB8fCBlbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoZW5kIDw9IDApIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIC8vIEZvcmNlIGNvZXJzaW9uIHRvIHVpbnQzMi4gVGhpcyB3aWxsIGFsc28gY29lcmNlIGZhbHNleS9OYU4gdmFsdWVzIHRvIDAuXG4gIGVuZCA+Pj49IDBcbiAgc3RhcnQgPj4+PSAwXG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1dGYxNmxlU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbi8vIFRoZSBwcm9wZXJ0eSBpcyB1c2VkIGJ5IGBCdWZmZXIuaXNCdWZmZXJgIGFuZCBgaXMtYnVmZmVyYCAoaW4gU2FmYXJpIDUtNykgdG8gZGV0ZWN0XG4vLyBCdWZmZXIgaW5zdGFuY2VzLlxuQnVmZmVyLnByb3RvdHlwZS5faXNCdWZmZXIgPSB0cnVlXG5cbmZ1bmN0aW9uIHN3YXAgKGIsIG4sIG0pIHtcbiAgdmFyIGkgPSBiW25dXG4gIGJbbl0gPSBiW21dXG4gIGJbbV0gPSBpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDE2ID0gZnVuY3Rpb24gc3dhcDE2ICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSAyICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAxNi1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSAyKSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgMSlcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAzMiA9IGZ1bmN0aW9uIHN3YXAzMiAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgNCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMzItYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDMpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDIpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwNjQgPSBmdW5jdGlvbiBzd2FwNjQgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDggIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDY0LWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDgpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyA3KVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyA2KVxuICAgIHN3YXAodGhpcywgaSArIDIsIGkgKyA1KVxuICAgIHN3YXAodGhpcywgaSArIDMsIGkgKyA0KVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAoKSB7XG4gIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aCB8IDBcbiAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIDAsIGxlbmd0aClcbiAgcmV0dXJuIHNsb3dUb1N0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBtYXggPSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTXG4gIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICBzdHIgPSB0aGlzLnRvU3RyaW5nKCdoZXgnLCAwLCBtYXgpLm1hdGNoKC8uezJ9L2cpLmpvaW4oJyAnKVxuICAgIGlmICh0aGlzLmxlbmd0aCA+IG1heCkgc3RyICs9ICcgLi4uICdcbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIHN0ciArICc+J1xufVxuXG5CdWZmZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlICh0YXJnZXQsIHN0YXJ0LCBlbmQsIHRoaXNTdGFydCwgdGhpc0VuZCkge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0YXJnZXQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIH1cblxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuZCA9IHRhcmdldCA/IHRhcmdldC5sZW5ndGggOiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc1N0YXJ0ID0gMFxuICB9XG4gIGlmICh0aGlzRW5kID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzRW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChzdGFydCA8IDAgfHwgZW5kID4gdGFyZ2V0Lmxlbmd0aCB8fCB0aGlzU3RhcnQgPCAwIHx8IHRoaXNFbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdvdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kICYmIHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kKSB7XG4gICAgcmV0dXJuIC0xXG4gIH1cbiAgaWYgKHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAxXG4gIH1cblxuICBzdGFydCA+Pj49IDBcbiAgZW5kID4+Pj0gMFxuICB0aGlzU3RhcnQgPj4+PSAwXG4gIHRoaXNFbmQgPj4+PSAwXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCkgcmV0dXJuIDBcblxuICB2YXIgeCA9IHRoaXNFbmQgLSB0aGlzU3RhcnRcbiAgdmFyIHkgPSBlbmQgLSBzdGFydFxuICB2YXIgbGVuID0gTWF0aC5taW4oeCwgeSlcblxuICB2YXIgdGhpc0NvcHkgPSB0aGlzLnNsaWNlKHRoaXNTdGFydCwgdGhpc0VuZClcbiAgdmFyIHRhcmdldENvcHkgPSB0YXJnZXQuc2xpY2Uoc3RhcnQsIGVuZClcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKHRoaXNDb3B5W2ldICE9PSB0YXJnZXRDb3B5W2ldKSB7XG4gICAgICB4ID0gdGhpc0NvcHlbaV1cbiAgICAgIHkgPSB0YXJnZXRDb3B5W2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuLy8gRmluZHMgZWl0aGVyIHRoZSBmaXJzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPj0gYGJ5dGVPZmZzZXRgLFxuLy8gT1IgdGhlIGxhc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0IDw9IGBieXRlT2Zmc2V0YC5cbi8vXG4vLyBBcmd1bWVudHM6XG4vLyAtIGJ1ZmZlciAtIGEgQnVmZmVyIHRvIHNlYXJjaFxuLy8gLSB2YWwgLSBhIHN0cmluZywgQnVmZmVyLCBvciBudW1iZXJcbi8vIC0gYnl0ZU9mZnNldCAtIGFuIGluZGV4IGludG8gYGJ1ZmZlcmA7IHdpbGwgYmUgY2xhbXBlZCB0byBhbiBpbnQzMlxuLy8gLSBlbmNvZGluZyAtIGFuIG9wdGlvbmFsIGVuY29kaW5nLCByZWxldmFudCBpcyB2YWwgaXMgYSBzdHJpbmdcbi8vIC0gZGlyIC0gdHJ1ZSBmb3IgaW5kZXhPZiwgZmFsc2UgZm9yIGxhc3RJbmRleE9mXG5mdW5jdGlvbiBiaWRpcmVjdGlvbmFsSW5kZXhPZiAoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgLy8gRW1wdHkgYnVmZmVyIG1lYW5zIG5vIG1hdGNoXG4gIGlmIChidWZmZXIubGVuZ3RoID09PSAwKSByZXR1cm4gLTFcblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldFxuICBpZiAodHlwZW9mIGJ5dGVPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBieXRlT2Zmc2V0XG4gICAgYnl0ZU9mZnNldCA9IDBcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0ID4gMHg3ZmZmZmZmZikge1xuICAgIGJ5dGVPZmZzZXQgPSAweDdmZmZmZmZmXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IC0weDgwMDAwMDAwKSB7XG4gICAgYnl0ZU9mZnNldCA9IC0weDgwMDAwMDAwXG4gIH1cbiAgYnl0ZU9mZnNldCA9ICtieXRlT2Zmc2V0ICAvLyBDb2VyY2UgdG8gTnVtYmVyLlxuICBpZiAoaXNOYU4oYnl0ZU9mZnNldCkpIHtcbiAgICAvLyBieXRlT2Zmc2V0OiBpdCBpdCdzIHVuZGVmaW5lZCwgbnVsbCwgTmFOLCBcImZvb1wiLCBldGMsIHNlYXJjaCB3aG9sZSBidWZmZXJcbiAgICBieXRlT2Zmc2V0ID0gZGlyID8gMCA6IChidWZmZXIubGVuZ3RoIC0gMSlcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0OiBuZWdhdGl2ZSBvZmZzZXRzIHN0YXJ0IGZyb20gdGhlIGVuZCBvZiB0aGUgYnVmZmVyXG4gIGlmIChieXRlT2Zmc2V0IDwgMCkgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggKyBieXRlT2Zmc2V0XG4gIGlmIChieXRlT2Zmc2V0ID49IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICBpZiAoZGlyKSByZXR1cm4gLTFcbiAgICBlbHNlIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoIC0gMVxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAwKSB7XG4gICAgaWYgKGRpcikgYnl0ZU9mZnNldCA9IDBcbiAgICBlbHNlIHJldHVybiAtMVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIHZhbFxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWwgPSBCdWZmZXIuZnJvbSh2YWwsIGVuY29kaW5nKVxuICB9XG5cbiAgLy8gRmluYWxseSwgc2VhcmNoIGVpdGhlciBpbmRleE9mIChpZiBkaXIgaXMgdHJ1ZSkgb3IgbGFzdEluZGV4T2ZcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcih2YWwpKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlOiBsb29raW5nIGZvciBlbXB0eSBzdHJpbmcvYnVmZmVyIGFsd2F5cyBmYWlsc1xuICAgIGlmICh2YWwubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDB4RkYgLy8gU2VhcmNoIGZvciBhIGJ5dGUgdmFsdWUgWzAtMjU1XVxuICAgIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCAmJlxuICAgICAgICB0eXBlb2YgVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKGRpcikge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCBbIHZhbCBdLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsIG11c3QgYmUgc3RyaW5nLCBudW1iZXIgb3IgQnVmZmVyJylcbn1cblxuZnVuY3Rpb24gYXJyYXlJbmRleE9mIChhcnIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICB2YXIgaW5kZXhTaXplID0gMVxuICB2YXIgYXJyTGVuZ3RoID0gYXJyLmxlbmd0aFxuICB2YXIgdmFsTGVuZ3RoID0gdmFsLmxlbmd0aFxuXG4gIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICBpZiAoZW5jb2RpbmcgPT09ICd1Y3MyJyB8fCBlbmNvZGluZyA9PT0gJ3Vjcy0yJyB8fFxuICAgICAgICBlbmNvZGluZyA9PT0gJ3V0ZjE2bGUnIHx8IGVuY29kaW5nID09PSAndXRmLTE2bGUnKSB7XG4gICAgICBpZiAoYXJyLmxlbmd0aCA8IDIgfHwgdmFsLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICB9XG4gICAgICBpbmRleFNpemUgPSAyXG4gICAgICBhcnJMZW5ndGggLz0gMlxuICAgICAgdmFsTGVuZ3RoIC89IDJcbiAgICAgIGJ5dGVPZmZzZXQgLz0gMlxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWQgKGJ1ZiwgaSkge1xuICAgIGlmIChpbmRleFNpemUgPT09IDEpIHtcbiAgICAgIHJldHVybiBidWZbaV1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGJ1Zi5yZWFkVUludDE2QkUoaSAqIGluZGV4U2l6ZSlcbiAgICB9XG4gIH1cblxuICB2YXIgaVxuICBpZiAoZGlyKSB7XG4gICAgdmFyIGZvdW5kSW5kZXggPSAtMVxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPCBhcnJMZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJlYWQoYXJyLCBpKSA9PT0gcmVhZCh2YWwsIGZvdW5kSW5kZXggPT09IC0xID8gMCA6IGkgLSBmb3VuZEluZGV4KSkge1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGZvdW5kSW5kZXggPSBpXG4gICAgICAgIGlmIChpIC0gZm91bmRJbmRleCArIDEgPT09IHZhbExlbmd0aCkgcmV0dXJuIGZvdW5kSW5kZXggKiBpbmRleFNpemVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ICE9PSAtMSkgaSAtPSBpIC0gZm91bmRJbmRleFxuICAgICAgICBmb3VuZEluZGV4ID0gLTFcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGJ5dGVPZmZzZXQgKyB2YWxMZW5ndGggPiBhcnJMZW5ndGgpIGJ5dGVPZmZzZXQgPSBhcnJMZW5ndGggLSB2YWxMZW5ndGhcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIGZvdW5kID0gdHJ1ZVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWxMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAocmVhZChhcnIsIGkgKyBqKSAhPT0gcmVhZCh2YWwsIGopKSB7XG4gICAgICAgICAgZm91bmQgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiB0aGlzLmluZGV4T2YodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykgIT09IC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIGluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIHRydWUpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUubGFzdEluZGV4T2YgPSBmdW5jdGlvbiBsYXN0SW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIGhleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKHN0ckxlbiAlIDIgIT09IDApIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIHZhciBwYXJzZWQgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgaWYgKGlzTmFOKHBhcnNlZCkpIHJldHVybiBpXG4gICAgYnVmW29mZnNldCArIGldID0gcGFyc2VkXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBsYXRpbjFXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBhc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIHVjczJXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiB3cml0ZSAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZylcbiAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBvZmZzZXRbLCBsZW5ndGhdWywgZW5jb2RpbmddKVxuICB9IGVsc2UgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gICAgaWYgKGlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGxlbmd0aCA9IGxlbmd0aCB8IDBcbiAgICAgIGlmIChlbmNvZGluZyA9PT0gdW5kZWZpbmVkKSBlbmNvZGluZyA9ICd1dGY4J1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICAvLyBsZWdhY3kgd3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpIC0gcmVtb3ZlIGluIHYwLjEzXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0J1ZmZlci53cml0ZShzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXRbLCBsZW5ndGhdKSBpcyBubyBsb25nZXIgc3VwcG9ydGVkJ1xuICAgIClcbiAgfVxuXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbGVuZ3RoID4gcmVtYWluaW5nKSBsZW5ndGggPSByZW1haW5pbmdcblxuICBpZiAoKHN0cmluZy5sZW5ndGggPiAwICYmIChsZW5ndGggPCAwIHx8IG9mZnNldCA8IDApKSB8fCBvZmZzZXQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIHdyaXRlIG91dHNpZGUgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIC8vIFdhcm5pbmc6IG1heExlbmd0aCBub3QgdGFrZW4gaW50byBhY2NvdW50IGluIGJhc2U2NFdyaXRlXG4gICAgICAgIHJldHVybiBiYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdWNzMldyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuZnVuY3Rpb24gYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHV0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcbiAgdmFyIHJlcyA9IFtdXG5cbiAgdmFyIGkgPSBzdGFydFxuICB3aGlsZSAoaSA8IGVuZCkge1xuICAgIHZhciBmaXJzdEJ5dGUgPSBidWZbaV1cbiAgICB2YXIgY29kZVBvaW50ID0gbnVsbFxuICAgIHZhciBieXRlc1BlclNlcXVlbmNlID0gKGZpcnN0Qnl0ZSA+IDB4RUYpID8gNFxuICAgICAgOiAoZmlyc3RCeXRlID4gMHhERikgPyAzXG4gICAgICA6IChmaXJzdEJ5dGUgPiAweEJGKSA/IDJcbiAgICAgIDogMVxuXG4gICAgaWYgKGkgKyBieXRlc1BlclNlcXVlbmNlIDw9IGVuZCkge1xuICAgICAgdmFyIHNlY29uZEJ5dGUsIHRoaXJkQnl0ZSwgZm91cnRoQnl0ZSwgdGVtcENvZGVQb2ludFxuXG4gICAgICBzd2l0Y2ggKGJ5dGVzUGVyU2VxdWVuY2UpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlmIChmaXJzdEJ5dGUgPCAweDgwKSB7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSBmaXJzdEJ5dGVcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHgxRikgPDwgMHg2IHwgKHNlY29uZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4QyB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKHRoaXJkQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0ZGICYmICh0ZW1wQ29kZVBvaW50IDwgMHhEODAwIHx8IHRlbXBDb2RlUG9pbnQgPiAweERGRkYpKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGZvdXJ0aEJ5dGUgPSBidWZbaSArIDNdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwICYmIChmb3VydGhCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweDEyIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweEMgfCAodGhpcmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKGZvdXJ0aEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweEZGRkYgJiYgdGVtcENvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvZGVQb2ludCA9PT0gbnVsbCkge1xuICAgICAgLy8gd2UgZGlkIG5vdCBnZW5lcmF0ZSBhIHZhbGlkIGNvZGVQb2ludCBzbyBpbnNlcnQgYVxuICAgICAgLy8gcmVwbGFjZW1lbnQgY2hhciAoVStGRkZEKSBhbmQgYWR2YW5jZSBvbmx5IDEgYnl0ZVxuICAgICAgY29kZVBvaW50ID0gMHhGRkZEXG4gICAgICBieXRlc1BlclNlcXVlbmNlID0gMVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50ID4gMHhGRkZGKSB7XG4gICAgICAvLyBlbmNvZGUgdG8gdXRmMTYgKHN1cnJvZ2F0ZSBwYWlyIGRhbmNlKVxuICAgICAgY29kZVBvaW50IC09IDB4MTAwMDBcbiAgICAgIHJlcy5wdXNoKGNvZGVQb2ludCA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMClcbiAgICAgIGNvZGVQb2ludCA9IDB4REMwMCB8IGNvZGVQb2ludCAmIDB4M0ZGXG4gICAgfVxuXG4gICAgcmVzLnB1c2goY29kZVBvaW50KVxuICAgIGkgKz0gYnl0ZXNQZXJTZXF1ZW5jZVxuICB9XG5cbiAgcmV0dXJuIGRlY29kZUNvZGVQb2ludHNBcnJheShyZXMpXG59XG5cbi8vIEJhc2VkIG9uIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyNzQ3MjcyLzY4MDc0MiwgdGhlIGJyb3dzZXIgd2l0aFxuLy8gdGhlIGxvd2VzdCBsaW1pdCBpcyBDaHJvbWUsIHdpdGggMHgxMDAwMCBhcmdzLlxuLy8gV2UgZ28gMSBtYWduaXR1ZGUgbGVzcywgZm9yIHNhZmV0eVxudmFyIE1BWF9BUkdVTUVOVFNfTEVOR1RIID0gMHgxMDAwXG5cbmZ1bmN0aW9uIGRlY29kZUNvZGVQb2ludHNBcnJheSAoY29kZVBvaW50cykge1xuICB2YXIgbGVuID0gY29kZVBvaW50cy5sZW5ndGhcbiAgaWYgKGxlbiA8PSBNQVhfQVJHVU1FTlRTX0xFTkdUSCkge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFN0cmluZywgY29kZVBvaW50cykgLy8gYXZvaWQgZXh0cmEgc2xpY2UoKVxuICB9XG5cbiAgLy8gRGVjb2RlIGluIGNodW5rcyB0byBhdm9pZCBcImNhbGwgc3RhY2sgc2l6ZSBleGNlZWRlZFwiLlxuICB2YXIgcmVzID0gJydcbiAgdmFyIGkgPSAwXG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoXG4gICAgICBTdHJpbmcsXG4gICAgICBjb2RlUG9pbnRzLnNsaWNlKGksIGkgKz0gTUFYX0FSR1VNRU5UU19MRU5HVEgpXG4gICAgKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0gJiAweDdGKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gbGF0aW4xU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2kgKyAxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiBzbGljZSAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICB2YXIgbmV3QnVmXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIG5ld0J1ZiA9IHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZClcbiAgICBuZXdCdWYuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47ICsraSkge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG4vKlxuICogTmVlZCB0byBtYWtlIHN1cmUgdGhhdCBidWZmZXIgaXNuJ3QgdHJ5aW5nIHRvIHdyaXRlIG91dCBvZiBib3VuZHMuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChvZmZzZXQsIGV4dCwgbGVuZ3RoKSB7XG4gIGlmICgob2Zmc2V0ICUgMSkgIT09IDAgfHwgb2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludExFID0gZnVuY3Rpb24gcmVhZFVJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludEJFID0gZnVuY3Rpb24gcmVhZFVJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcbiAgfVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF1cbiAgdmFyIG11bCA9IDFcbiAgd2hpbGUgKGJ5dGVMZW5ndGggPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIHJlYWRVSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCA4KSB8IHRoaXNbb2Zmc2V0ICsgMV1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiByZWFkVUludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKCh0aGlzW29mZnNldF0pIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSkgK1xuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gKiAweDEwMDAwMDApXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAoKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50TEUgPSBmdW5jdGlvbiByZWFkSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50QkUgPSBmdW5jdGlvbiByZWFkSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgaSA9IGJ5dGVMZW5ndGhcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1pXVxuICB3aGlsZSAoaSA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIHJlYWRJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIGlmICghKHRoaXNbb2Zmc2V0XSAmIDB4ODApKSByZXR1cm4gKHRoaXNbb2Zmc2V0XSlcbiAgcmV0dXJuICgoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTEpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiByZWFkSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gcmVhZEludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgMV0gfCAodGhpc1tvZmZzZXRdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0pIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSA8PCAyNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdExFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdEJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gcmVhZERvdWJsZUxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiByZWFkRG91YmxlQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImJ1ZmZlclwiIGFyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXIgaW5zdGFuY2UnKVxuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlVUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlVUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVVSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweGZmLCAwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbmZ1bmN0aW9uIG9iamVjdFdyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbikge1xuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZiArIHZhbHVlICsgMVxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGJ1Zi5sZW5ndGggLSBvZmZzZXQsIDIpOyBpIDwgajsgKytpKSB7XG4gICAgYnVmW29mZnNldCArIGldID0gKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbmZ1bmN0aW9uIG9iamVjdFdyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbikge1xuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCA0KTsgaSA8IGo7ICsraSkge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBsaW1pdCA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgdmFyIGkgPSAwXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSAtIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBsaW1pdCA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gMFxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSArIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5mdW5jdGlvbiBjaGVja0lFRUU3NTQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG4gIGlmIChvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA0LCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA4LCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxuICByZXR1cm4gb2Zmc2V0ICsgOFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uIGNvcHkgKHRhcmdldCwgdGFyZ2V0U3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldFN0YXJ0ID49IHRhcmdldC5sZW5ndGgpIHRhcmdldFN0YXJ0ID0gdGFyZ2V0Lmxlbmd0aFxuICBpZiAoIXRhcmdldFN0YXJ0KSB0YXJnZXRTdGFydCA9IDBcbiAgaWYgKGVuZCA+IDAgJiYgZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm4gMFxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCB0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGlmICh0YXJnZXRTdGFydCA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcigndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIH1cbiAgaWYgKHN0YXJ0IDwgMCB8fCBzdGFydCA+PSB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoZW5kIDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgPCBlbmQgLSBzdGFydCkge1xuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCArIHN0YXJ0XG4gIH1cblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcbiAgdmFyIGlcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0ICYmIHN0YXJ0IDwgdGFyZ2V0U3RhcnQgJiYgdGFyZ2V0U3RhcnQgPCBlbmQpIHtcbiAgICAvLyBkZXNjZW5kaW5nIGNvcHkgZnJvbSBlbmRcbiAgICBmb3IgKGkgPSBsZW4gLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSBpZiAobGVuIDwgMTAwMCB8fCAhQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAvLyBhc2NlbmRpbmcgY29weSBmcm9tIHN0YXJ0XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBVaW50OEFycmF5LnByb3RvdHlwZS5zZXQuY2FsbChcbiAgICAgIHRhcmdldCxcbiAgICAgIHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSxcbiAgICAgIHRhcmdldFN0YXJ0XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIGxlblxufVxuXG4vLyBVc2FnZTpcbi8vICAgIGJ1ZmZlci5maWxsKG51bWJlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoYnVmZmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChzdHJpbmdbLCBvZmZzZXRbLCBlbmRdXVssIGVuY29kaW5nXSlcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwgKHZhbCwgc3RhcnQsIGVuZCwgZW5jb2RpbmcpIHtcbiAgLy8gSGFuZGxlIHN0cmluZyBjYXNlczpcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gc3RhcnRcbiAgICAgIHN0YXJ0ID0gMFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IGVuZFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9XG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDEpIHtcbiAgICAgIHZhciBjb2RlID0gdmFsLmNoYXJDb2RlQXQoMClcbiAgICAgIGlmIChjb2RlIDwgMjU2KSB7XG4gICAgICAgIHZhbCA9IGNvZGVcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZW5jb2RpbmcgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnICYmICFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAyNTVcbiAgfVxuXG4gIC8vIEludmFsaWQgcmFuZ2VzIGFyZSBub3Qgc2V0IHRvIGEgZGVmYXVsdCwgc28gY2FuIHJhbmdlIGNoZWNrIGVhcmx5LlxuICBpZiAoc3RhcnQgPCAwIHx8IHRoaXMubGVuZ3RoIDwgc3RhcnQgfHwgdGhpcy5sZW5ndGggPCBlbmQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignT3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc3RhcnQgPSBzdGFydCA+Pj4gMFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IHRoaXMubGVuZ3RoIDogZW5kID4+PiAwXG5cbiAgaWYgKCF2YWwpIHZhbCA9IDBcblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgICB0aGlzW2ldID0gdmFsXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciBieXRlcyA9IEJ1ZmZlci5pc0J1ZmZlcih2YWwpXG4gICAgICA/IHZhbFxuICAgICAgOiB1dGY4VG9CeXRlcyhuZXcgQnVmZmVyKHZhbCwgZW5jb2RpbmcpLnRvU3RyaW5nKCkpXG4gICAgdmFyIGxlbiA9IGJ5dGVzLmxlbmd0aFxuICAgIGZvciAoaSA9IDA7IGkgPCBlbmQgLSBzdGFydDsgKytpKSB7XG4gICAgICB0aGlzW2kgKyBzdGFydF0gPSBieXRlc1tpICUgbGVuXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIElOVkFMSURfQkFTRTY0X1JFID0gL1teK1xcLzAtOUEtWmEtei1fXS9nXG5cbmZ1bmN0aW9uIGJhc2U2NGNsZWFuIChzdHIpIHtcbiAgLy8gTm9kZSBzdHJpcHMgb3V0IGludmFsaWQgY2hhcmFjdGVycyBsaWtlIFxcbiBhbmQgXFx0IGZyb20gdGhlIHN0cmluZywgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHN0ciA9IHN0cmluZ3RyaW0oc3RyKS5yZXBsYWNlKElOVkFMSURfQkFTRTY0X1JFLCAnJylcbiAgLy8gTm9kZSBjb252ZXJ0cyBzdHJpbmdzIHdpdGggbGVuZ3RoIDwgMiB0byAnJ1xuICBpZiAoc3RyLmxlbmd0aCA8IDIpIHJldHVybiAnJ1xuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgdmFyIGNvZGVQb2ludFxuICB2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aFxuICB2YXIgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcbiAgdmFyIGJ5dGVzID0gW11cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgY29kZVBvaW50ID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcblxuICAgIC8vIGlzIHN1cnJvZ2F0ZSBjb21wb25lbnRcbiAgICBpZiAoY29kZVBvaW50ID4gMHhEN0ZGICYmIGNvZGVQb2ludCA8IDB4RTAwMCkge1xuICAgICAgLy8gbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICghbGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgICAvLyBubyBsZWFkIHlldFxuICAgICAgICBpZiAoY29kZVBvaW50ID4gMHhEQkZGKSB7XG4gICAgICAgICAgLy8gdW5leHBlY3RlZCB0cmFpbFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSBpZiAoaSArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgIC8vIHVucGFpcmVkIGxlYWRcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFsaWQgbGVhZFxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gMiBsZWFkcyBpbiBhIHJvd1xuICAgICAgaWYgKGNvZGVQb2ludCA8IDB4REMwMCkge1xuICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyB2YWxpZCBzdXJyb2dhdGUgcGFpclxuICAgICAgY29kZVBvaW50ID0gKGxlYWRTdXJyb2dhdGUgLSAweEQ4MDAgPDwgMTAgfCBjb2RlUG9pbnQgLSAweERDMDApICsgMHgxMDAwMFxuICAgIH0gZWxzZSBpZiAobGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgLy8gdmFsaWQgYm1wIGNoYXIsIGJ1dCBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgfVxuXG4gICAgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcblxuICAgIC8vIGVuY29kZSB1dGY4XG4gICAgaWYgKGNvZGVQb2ludCA8IDB4ODApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMSkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChjb2RlUG9pbnQpXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDgwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2IHwgMHhDMCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyB8IDB4RTAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDQpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDEyIHwgMHhGMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb2RlIHBvaW50JylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnl0ZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0ciwgdW5pdHMpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcblxuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KGJhc2U2NGNsZWFuKHN0cikpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKSBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIGlzbmFuICh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gdmFsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1jb21wYXJlXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYnVmZmVyL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCdcblxuZXhwb3J0cy5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuZXhwb3J0cy50b0J5dGVBcnJheSA9IHRvQnl0ZUFycmF5XG5leHBvcnRzLmZyb21CeXRlQXJyYXkgPSBmcm9tQnl0ZUFycmF5XG5cbnZhciBsb29rdXAgPSBbXVxudmFyIHJldkxvb2t1cCA9IFtdXG52YXIgQXJyID0gdHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnID8gVWludDhBcnJheSA6IEFycmF5XG5cbnZhciBjb2RlID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nXG5mb3IgKHZhciBpID0gMCwgbGVuID0gY29kZS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICBsb29rdXBbaV0gPSBjb2RlW2ldXG4gIHJldkxvb2t1cFtjb2RlLmNoYXJDb2RlQXQoaSldID0gaVxufVxuXG5yZXZMb29rdXBbJy0nLmNoYXJDb2RlQXQoMCldID0gNjJcbnJldkxvb2t1cFsnXycuY2hhckNvZGVBdCgwKV0gPSA2M1xuXG5mdW5jdGlvbiBwbGFjZUhvbGRlcnNDb3VudCAoYjY0KSB7XG4gIHZhciBsZW4gPSBiNjQubGVuZ3RoXG4gIGlmIChsZW4gJSA0ID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG4gIH1cblxuICAvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuICAvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG4gIC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuICAvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcbiAgLy8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuICByZXR1cm4gYjY0W2xlbiAtIDJdID09PSAnPScgPyAyIDogYjY0W2xlbiAtIDFdID09PSAnPScgPyAxIDogMFxufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChiNjQpIHtcbiAgLy8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG4gIHJldHVybiBiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnNDb3VudChiNjQpXG59XG5cbmZ1bmN0aW9uIHRvQnl0ZUFycmF5IChiNjQpIHtcbiAgdmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcbiAgdmFyIGxlbiA9IGI2NC5sZW5ndGhcbiAgcGxhY2VIb2xkZXJzID0gcGxhY2VIb2xkZXJzQ291bnQoYjY0KVxuXG4gIGFyciA9IG5ldyBBcnIobGVuICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cbiAgLy8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuICBsID0gcGxhY2VIb2xkZXJzID4gMCA/IGxlbiAtIDQgOiBsZW5cblxuICB2YXIgTCA9IDBcblxuICBmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTgpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDEyKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA8PCA2KSB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMyldXG4gICAgYXJyW0wrK10gPSAodG1wID4+IDE2KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMikgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPj4gNClcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxMCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgNCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPj4gMilcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG4gIHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDYgJiAweDNGXSArIGxvb2t1cFtudW0gJiAweDNGXVxufVxuXG5mdW5jdGlvbiBlbmNvZGVDaHVuayAodWludDgsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHRtcFxuICB2YXIgb3V0cHV0ID0gW11cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IDMpIHtcbiAgICB0bXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG4gICAgb3V0cHV0LnB1c2godHJpcGxldFRvQmFzZTY0KHRtcCkpXG4gIH1cbiAgcmV0dXJuIG91dHB1dC5qb2luKCcnKVxufVxuXG5mdW5jdGlvbiBmcm9tQnl0ZUFycmF5ICh1aW50OCkge1xuICB2YXIgdG1wXG4gIHZhciBsZW4gPSB1aW50OC5sZW5ndGhcbiAgdmFyIGV4dHJhQnl0ZXMgPSBsZW4gJSAzIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG4gIHZhciBvdXRwdXQgPSAnJ1xuICB2YXIgcGFydHMgPSBbXVxuICB2YXIgbWF4Q2h1bmtMZW5ndGggPSAxNjM4MyAvLyBtdXN0IGJlIG11bHRpcGxlIG9mIDNcblxuICAvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG4gIGZvciAodmFyIGkgPSAwLCBsZW4yID0gbGVuIC0gZXh0cmFCeXRlczsgaSA8IGxlbjI7IGkgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcbiAgICBwYXJ0cy5wdXNoKGVuY29kZUNodW5rKHVpbnQ4LCBpLCAoaSArIG1heENodW5rTGVuZ3RoKSA+IGxlbjIgPyBsZW4yIDogKGkgKyBtYXhDaHVua0xlbmd0aCkpKVxuICB9XG5cbiAgLy8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuICBpZiAoZXh0cmFCeXRlcyA9PT0gMSkge1xuICAgIHRtcCA9IHVpbnQ4W2xlbiAtIDFdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFt0bXAgPj4gMl1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPDwgNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSAnPT0nXG4gIH0gZWxzZSBpZiAoZXh0cmFCeXRlcyA9PT0gMikge1xuICAgIHRtcCA9ICh1aW50OFtsZW4gLSAyXSA8PCA4KSArICh1aW50OFtsZW4gLSAxXSlcbiAgICBvdXRwdXQgKz0gbG9va3VwW3RtcCA+PiAxMF1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPj4gNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA8PCAyKSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9ICc9J1xuICB9XG5cbiAgcGFydHMucHVzaChvdXRwdXQpXG5cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJycpXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYmFzZTY0LWpzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9pZWVlNzU0L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChhcnIpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoYXJyKSA9PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9idWZmZXIvfi9pc2FycmF5L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciB3aW5kb3cgPSByZXF1aXJlKFwiZ2xvYmFsL3dpbmRvd1wiKVxudmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKFwiaXMtZnVuY3Rpb25cIilcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKFwicGFyc2UtaGVhZGVyc1wiKVxudmFyIHh0ZW5kID0gcmVxdWlyZShcInh0ZW5kXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlWEhSXG5jcmVhdGVYSFIuWE1MSHR0cFJlcXVlc3QgPSB3aW5kb3cuWE1MSHR0cFJlcXVlc3QgfHwgbm9vcFxuY3JlYXRlWEhSLlhEb21haW5SZXF1ZXN0ID0gXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiAobmV3IGNyZWF0ZVhIUi5YTUxIdHRwUmVxdWVzdCgpKSA/IGNyZWF0ZVhIUi5YTUxIdHRwUmVxdWVzdCA6IHdpbmRvdy5YRG9tYWluUmVxdWVzdFxuXG5mb3JFYWNoQXJyYXkoW1wiZ2V0XCIsIFwicHV0XCIsIFwicG9zdFwiLCBcInBhdGNoXCIsIFwiaGVhZFwiLCBcImRlbGV0ZVwiXSwgZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgY3JlYXRlWEhSW21ldGhvZCA9PT0gXCJkZWxldGVcIiA/IFwiZGVsXCIgOiBtZXRob2RdID0gZnVuY3Rpb24odXJpLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgICAgICBvcHRpb25zID0gaW5pdFBhcmFtcyh1cmksIG9wdGlvbnMsIGNhbGxiYWNrKVxuICAgICAgICBvcHRpb25zLm1ldGhvZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgICAgIHJldHVybiBfY3JlYXRlWEhSKG9wdGlvbnMpXG4gICAgfVxufSlcblxuZnVuY3Rpb24gZm9yRWFjaEFycmF5KGFycmF5LCBpdGVyYXRvcikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0b3IoYXJyYXlbaV0pXG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc0VtcHR5KG9iail7XG4gICAgZm9yKHZhciBpIGluIG9iail7XG4gICAgICAgIGlmKG9iai5oYXNPd25Qcm9wZXJ0eShpKSkgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIGluaXRQYXJhbXModXJpLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIHZhciBwYXJhbXMgPSB1cmlcblxuICAgIGlmIChpc0Z1bmN0aW9uKG9wdGlvbnMpKSB7XG4gICAgICAgIGNhbGxiYWNrID0gb3B0aW9uc1xuICAgICAgICBpZiAodHlwZW9mIHVyaSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcGFyYW1zID0ge3VyaTp1cml9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBwYXJhbXMgPSB4dGVuZChvcHRpb25zLCB7dXJpOiB1cml9KVxuICAgIH1cblxuICAgIHBhcmFtcy5jYWxsYmFjayA9IGNhbGxiYWNrXG4gICAgcmV0dXJuIHBhcmFtc1xufVxuXG5mdW5jdGlvbiBjcmVhdGVYSFIodXJpLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIG9wdGlvbnMgPSBpbml0UGFyYW1zKHVyaSwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgcmV0dXJuIF9jcmVhdGVYSFIob3B0aW9ucylcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZVhIUihvcHRpb25zKSB7XG4gICAgaWYodHlwZW9mIG9wdGlvbnMuY2FsbGJhY2sgPT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYWxsYmFjayBhcmd1bWVudCBtaXNzaW5nXCIpXG4gICAgfVxuXG4gICAgdmFyIGNhbGxlZCA9IGZhbHNlXG4gICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24gY2JPbmNlKGVyciwgcmVzcG9uc2UsIGJvZHkpe1xuICAgICAgICBpZighY2FsbGVkKXtcbiAgICAgICAgICAgIGNhbGxlZCA9IHRydWVcbiAgICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2soZXJyLCByZXNwb25zZSwgYm9keSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWR5c3RhdGVjaGFuZ2UoKSB7XG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgbG9hZEZ1bmMoKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Qm9keSgpIHtcbiAgICAgICAgLy8gQ2hyb21lIHdpdGggcmVxdWVzdFR5cGU9YmxvYiB0aHJvd3MgZXJyb3JzIGFycm91bmQgd2hlbiBldmVuIHRlc3RpbmcgYWNjZXNzIHRvIHJlc3BvbnNlVGV4dFxuICAgICAgICB2YXIgYm9keSA9IHVuZGVmaW5lZFxuXG4gICAgICAgIGlmICh4aHIucmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGJvZHkgPSB4aHIucmVzcG9uc2VcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkgPSB4aHIucmVzcG9uc2VUZXh0IHx8IGdldFhtbCh4aHIpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNKc29uKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGJvZHkgPSBKU09OLnBhcnNlKGJvZHkpXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJvZHlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlcnJvckZ1bmMoZXZ0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0VGltZXIpXG4gICAgICAgIGlmKCEoZXZ0IGluc3RhbmNlb2YgRXJyb3IpKXtcbiAgICAgICAgICAgIGV2dCA9IG5ldyBFcnJvcihcIlwiICsgKGV2dCB8fCBcIlVua25vd24gWE1MSHR0cFJlcXVlc3QgRXJyb3JcIikgKVxuICAgICAgICB9XG4gICAgICAgIGV2dC5zdGF0dXNDb2RlID0gMFxuICAgICAgICByZXR1cm4gY2FsbGJhY2soZXZ0LCBmYWlsdXJlUmVzcG9uc2UpXG4gICAgfVxuXG4gICAgLy8gd2lsbCBsb2FkIHRoZSBkYXRhICYgcHJvY2VzcyB0aGUgcmVzcG9uc2UgaW4gYSBzcGVjaWFsIHJlc3BvbnNlIG9iamVjdFxuICAgIGZ1bmN0aW9uIGxvYWRGdW5jKCkge1xuICAgICAgICBpZiAoYWJvcnRlZCkgcmV0dXJuXG4gICAgICAgIHZhciBzdGF0dXNcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRUaW1lcilcbiAgICAgICAgaWYob3B0aW9ucy51c2VYRFIgJiYgeGhyLnN0YXR1cz09PXVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy9JRTggQ09SUyBHRVQgc3VjY2Vzc2Z1bCByZXNwb25zZSBkb2Vzbid0IGhhdmUgYSBzdGF0dXMgZmllbGQsIGJ1dCBib2R5IGlzIGZpbmVcbiAgICAgICAgICAgIHN0YXR1cyA9IDIwMFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdHVzID0gKHhoci5zdGF0dXMgPT09IDEyMjMgPyAyMDQgOiB4aHIuc3RhdHVzKVxuICAgICAgICB9XG4gICAgICAgIHZhciByZXNwb25zZSA9IGZhaWx1cmVSZXNwb25zZVxuICAgICAgICB2YXIgZXJyID0gbnVsbFxuXG4gICAgICAgIGlmIChzdGF0dXMgIT09IDApe1xuICAgICAgICAgICAgcmVzcG9uc2UgPSB7XG4gICAgICAgICAgICAgICAgYm9keTogZ2V0Qm9keSgpLFxuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IHN0YXR1cyxcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICAgICAgICAgICAgICB1cmw6IHVyaSxcbiAgICAgICAgICAgICAgICByYXdSZXF1ZXN0OiB4aHJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMpeyAvL3JlbWVtYmVyIHhociBjYW4gaW4gZmFjdCBiZSBYRFIgZm9yIENPUlMgaW4gSUVcbiAgICAgICAgICAgICAgICByZXNwb25zZS5oZWFkZXJzID0gcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVyciA9IG5ldyBFcnJvcihcIkludGVybmFsIFhNTEh0dHBSZXF1ZXN0IEVycm9yXCIpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVyciwgcmVzcG9uc2UsIHJlc3BvbnNlLmJvZHkpXG4gICAgfVxuXG4gICAgdmFyIHhociA9IG9wdGlvbnMueGhyIHx8IG51bGxcblxuICAgIGlmICgheGhyKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmNvcnMgfHwgb3B0aW9ucy51c2VYRFIpIHtcbiAgICAgICAgICAgIHhociA9IG5ldyBjcmVhdGVYSFIuWERvbWFpblJlcXVlc3QoKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHhociA9IG5ldyBjcmVhdGVYSFIuWE1MSHR0cFJlcXVlc3QoKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGtleVxuICAgIHZhciBhYm9ydGVkXG4gICAgdmFyIHVyaSA9IHhoci51cmwgPSBvcHRpb25zLnVyaSB8fCBvcHRpb25zLnVybFxuICAgIHZhciBtZXRob2QgPSB4aHIubWV0aG9kID0gb3B0aW9ucy5tZXRob2QgfHwgXCJHRVRcIlxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5IHx8IG9wdGlvbnMuZGF0YVxuICAgIHZhciBoZWFkZXJzID0geGhyLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgfHwge31cbiAgICB2YXIgc3luYyA9ICEhb3B0aW9ucy5zeW5jXG4gICAgdmFyIGlzSnNvbiA9IGZhbHNlXG4gICAgdmFyIHRpbWVvdXRUaW1lclxuICAgIHZhciBmYWlsdXJlUmVzcG9uc2UgPSB7XG4gICAgICAgIGJvZHk6IHVuZGVmaW5lZCxcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgICAgIHN0YXR1c0NvZGU6IDAsXG4gICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICB1cmw6IHVyaSxcbiAgICAgICAgcmF3UmVxdWVzdDogeGhyXG4gICAgfVxuXG4gICAgaWYgKFwianNvblwiIGluIG9wdGlvbnMgJiYgb3B0aW9ucy5qc29uICE9PSBmYWxzZSkge1xuICAgICAgICBpc0pzb24gPSB0cnVlXG4gICAgICAgIGhlYWRlcnNbXCJhY2NlcHRcIl0gfHwgaGVhZGVyc1tcIkFjY2VwdFwiXSB8fCAoaGVhZGVyc1tcIkFjY2VwdFwiXSA9IFwiYXBwbGljYXRpb24vanNvblwiKSAvL0Rvbid0IG92ZXJyaWRlIGV4aXN0aW5nIGFjY2VwdCBoZWFkZXIgZGVjbGFyZWQgYnkgdXNlclxuICAgICAgICBpZiAobWV0aG9kICE9PSBcIkdFVFwiICYmIG1ldGhvZCAhPT0gXCJIRUFEXCIpIHtcbiAgICAgICAgICAgIGhlYWRlcnNbXCJjb250ZW50LXR5cGVcIl0gfHwgaGVhZGVyc1tcIkNvbnRlbnQtVHlwZVwiXSB8fCAoaGVhZGVyc1tcIkNvbnRlbnQtVHlwZVwiXSA9IFwiYXBwbGljYXRpb24vanNvblwiKSAvL0Rvbid0IG92ZXJyaWRlIGV4aXN0aW5nIGFjY2VwdCBoZWFkZXIgZGVjbGFyZWQgYnkgdXNlclxuICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuanNvbiA9PT0gdHJ1ZSA/IGJvZHkgOiBvcHRpb25zLmpzb24pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gcmVhZHlzdGF0ZWNoYW5nZVxuICAgIHhoci5vbmxvYWQgPSBsb2FkRnVuY1xuICAgIHhoci5vbmVycm9yID0gZXJyb3JGdW5jXG4gICAgLy8gSUU5IG11c3QgaGF2ZSBvbnByb2dyZXNzIGJlIHNldCB0byBhIHVuaXF1ZSBmdW5jdGlvbi5cbiAgICB4aHIub25wcm9ncmVzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gSUUgbXVzdCBkaWVcbiAgICB9XG4gICAgeGhyLm9uYWJvcnQgPSBmdW5jdGlvbigpe1xuICAgICAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgeGhyLm9udGltZW91dCA9IGVycm9yRnVuY1xuICAgIHhoci5vcGVuKG1ldGhvZCwgdXJpLCAhc3luYywgb3B0aW9ucy51c2VybmFtZSwgb3B0aW9ucy5wYXNzd29yZClcbiAgICAvL2hhcyB0byBiZSBhZnRlciBvcGVuXG4gICAgaWYoIXN5bmMpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9ICEhb3B0aW9ucy53aXRoQ3JlZGVudGlhbHNcbiAgICB9XG4gICAgLy8gQ2Fubm90IHNldCB0aW1lb3V0IHdpdGggc3luYyByZXF1ZXN0XG4gICAgLy8gbm90IHNldHRpbmcgdGltZW91dCBvbiB0aGUgeGhyIG9iamVjdCwgYmVjYXVzZSBvZiBvbGQgd2Via2l0cyBldGMuIG5vdCBoYW5kbGluZyB0aGF0IGNvcnJlY3RseVxuICAgIC8vIGJvdGggbnBtJ3MgcmVxdWVzdCBhbmQganF1ZXJ5IDEueCB1c2UgdGhpcyBraW5kIG9mIHRpbWVvdXQsIHNvIHRoaXMgaXMgYmVpbmcgY29uc2lzdGVudFxuICAgIGlmICghc3luYyAmJiBvcHRpb25zLnRpbWVvdXQgPiAwICkge1xuICAgICAgICB0aW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAoYWJvcnRlZCkgcmV0dXJuXG4gICAgICAgICAgICBhYm9ydGVkID0gdHJ1ZS8vSUU5IG1heSBzdGlsbCBjYWxsIHJlYWR5c3RhdGVjaGFuZ2VcbiAgICAgICAgICAgIHhoci5hYm9ydChcInRpbWVvdXRcIilcbiAgICAgICAgICAgIHZhciBlID0gbmV3IEVycm9yKFwiWE1MSHR0cFJlcXVlc3QgdGltZW91dFwiKVxuICAgICAgICAgICAgZS5jb2RlID0gXCJFVElNRURPVVRcIlxuICAgICAgICAgICAgZXJyb3JGdW5jKGUpXG4gICAgICAgIH0sIG9wdGlvbnMudGltZW91dCApXG4gICAgfVxuXG4gICAgaWYgKHhoci5zZXRSZXF1ZXN0SGVhZGVyKSB7XG4gICAgICAgIGZvcihrZXkgaW4gaGVhZGVycyl7XG4gICAgICAgICAgICBpZihoZWFkZXJzLmhhc093blByb3BlcnR5KGtleSkpe1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgaGVhZGVyc1trZXldKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmhlYWRlcnMgJiYgIWlzRW1wdHkob3B0aW9ucy5oZWFkZXJzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJIZWFkZXJzIGNhbm5vdCBiZSBzZXQgb24gYW4gWERvbWFpblJlcXVlc3Qgb2JqZWN0XCIpXG4gICAgfVxuXG4gICAgaWYgKFwicmVzcG9uc2VUeXBlXCIgaW4gb3B0aW9ucykge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gb3B0aW9ucy5yZXNwb25zZVR5cGVcbiAgICB9XG5cbiAgICBpZiAoXCJiZWZvcmVTZW5kXCIgaW4gb3B0aW9ucyAmJlxuICAgICAgICB0eXBlb2Ygb3B0aW9ucy5iZWZvcmVTZW5kID09PSBcImZ1bmN0aW9uXCJcbiAgICApIHtcbiAgICAgICAgb3B0aW9ucy5iZWZvcmVTZW5kKHhocilcbiAgICB9XG5cbiAgICAvLyBNaWNyb3NvZnQgRWRnZSBicm93c2VyIHNlbmRzIFwidW5kZWZpbmVkXCIgd2hlbiBzZW5kIGlzIGNhbGxlZCB3aXRoIHVuZGVmaW5lZCB2YWx1ZS5cbiAgICAvLyBYTUxIdHRwUmVxdWVzdCBzcGVjIHNheXMgdG8gcGFzcyBudWxsIGFzIGJvZHkgdG8gaW5kaWNhdGUgbm8gYm9keVxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbmF1Z3R1ci94aHIvaXNzdWVzLzEwMC5cbiAgICB4aHIuc2VuZChib2R5IHx8IG51bGwpXG5cbiAgICByZXR1cm4geGhyXG5cblxufVxuXG5mdW5jdGlvbiBnZXRYbWwoeGhyKSB7XG4gICAgaWYgKHhoci5yZXNwb25zZVR5cGUgPT09IFwiZG9jdW1lbnRcIikge1xuICAgICAgICByZXR1cm4geGhyLnJlc3BvbnNlWE1MXG4gICAgfVxuICAgIHZhciBmaXJlZm94QnVnVGFrZW5FZmZlY3QgPSB4aHIuc3RhdHVzID09PSAyMDQgJiYgeGhyLnJlc3BvbnNlWE1MICYmIHhoci5yZXNwb25zZVhNTC5kb2N1bWVudEVsZW1lbnQubm9kZU5hbWUgPT09IFwicGFyc2VyZXJyb3JcIlxuICAgIGlmICh4aHIucmVzcG9uc2VUeXBlID09PSBcIlwiICYmICFmaXJlZm94QnVnVGFrZW5FZmZlY3QpIHtcbiAgICAgICAgcmV0dXJuIHhoci5yZXNwb25zZVhNTFxuICAgIH1cblxuICAgIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3hoci9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzZWxmO1xufSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHt9O1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2dsb2JhbC93aW5kb3cuanNcbi8vIG1vZHVsZSBpZCA9IDI4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvblxuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24gKGZuKSB7XG4gIHZhciBzdHJpbmcgPSB0b1N0cmluZy5jYWxsKGZuKVxuICByZXR1cm4gc3RyaW5nID09PSAnW29iamVjdCBGdW5jdGlvbl0nIHx8XG4gICAgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJyAmJiBzdHJpbmcgIT09ICdbb2JqZWN0IFJlZ0V4cF0nKSB8fFxuICAgICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAvLyBJRTggYW5kIGJlbG93XG4gICAgIChmbiA9PT0gd2luZG93LnNldFRpbWVvdXQgfHxcbiAgICAgIGZuID09PSB3aW5kb3cuYWxlcnQgfHxcbiAgICAgIGZuID09PSB3aW5kb3cuY29uZmlybSB8fFxuICAgICAgZm4gPT09IHdpbmRvdy5wcm9tcHQpKVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9pcy1mdW5jdGlvbi9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHRyaW0gPSByZXF1aXJlKCd0cmltJylcbiAgLCBmb3JFYWNoID0gcmVxdWlyZSgnZm9yLWVhY2gnKVxuICAsIGlzQXJyYXkgPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGhlYWRlcnMpIHtcbiAgaWYgKCFoZWFkZXJzKVxuICAgIHJldHVybiB7fVxuXG4gIHZhciByZXN1bHQgPSB7fVxuXG4gIGZvckVhY2goXG4gICAgICB0cmltKGhlYWRlcnMpLnNwbGl0KCdcXG4nKVxuICAgICwgZnVuY3Rpb24gKHJvdykge1xuICAgICAgICB2YXIgaW5kZXggPSByb3cuaW5kZXhPZignOicpXG4gICAgICAgICAgLCBrZXkgPSB0cmltKHJvdy5zbGljZSgwLCBpbmRleCkpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAsIHZhbHVlID0gdHJpbShyb3cuc2xpY2UoaW5kZXggKyAxKSlcblxuICAgICAgICBpZiAodHlwZW9mKHJlc3VsdFtrZXldKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlXG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShyZXN1bHRba2V5XSkpIHtcbiAgICAgICAgICByZXN1bHRba2V5XS5wdXNoKHZhbHVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gWyByZXN1bHRba2V5XSwgdmFsdWUgXVxuICAgICAgICB9XG4gICAgICB9XG4gIClcblxuICByZXR1cm4gcmVzdWx0XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qc1xuLy8gbW9kdWxlIGlkID0gMzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB0cmltO1xuXG5mdW5jdGlvbiB0cmltKHN0cil7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyp8XFxzKiQvZywgJycpO1xufVxuXG5leHBvcnRzLmxlZnQgPSBmdW5jdGlvbihzdHIpe1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqLywgJycpO1xufTtcblxuZXhwb3J0cy5yaWdodCA9IGZ1bmN0aW9uKHN0cil7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3RyaW0vaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDMxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnaXMtZnVuY3Rpb24nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZvckVhY2hcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuXG5mdW5jdGlvbiBmb3JFYWNoKGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFpc0Z1bmN0aW9uKGl0ZXJhdG9yKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpdGVyYXRvciBtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIH1cblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xuICAgICAgICBjb250ZXh0ID0gdGhpc1xuICAgIH1cbiAgICBcbiAgICBpZiAodG9TdHJpbmcuY2FsbChsaXN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJylcbiAgICAgICAgZm9yRWFjaEFycmF5KGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KVxuICAgIGVsc2UgaWYgKHR5cGVvZiBsaXN0ID09PSAnc3RyaW5nJylcbiAgICAgICAgZm9yRWFjaFN0cmluZyhsaXN0LCBpdGVyYXRvciwgY29udGV4dClcbiAgICBlbHNlXG4gICAgICAgIGZvckVhY2hPYmplY3QobGlzdCwgaXRlcmF0b3IsIGNvbnRleHQpXG59XG5cbmZ1bmN0aW9uIGZvckVhY2hBcnJheShhcnJheSwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoYXJyYXksIGkpKSB7XG4gICAgICAgICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSlcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZm9yRWFjaFN0cmluZyhzdHJpbmcsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHN0cmluZy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAvLyBubyBzdWNoIHRoaW5nIGFzIGEgc3BhcnNlIHN0cmluZy5cbiAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBzdHJpbmcuY2hhckF0KGkpLCBpLCBzdHJpbmcpXG4gICAgfVxufVxuXG5mdW5jdGlvbiBmb3JFYWNoT2JqZWN0KG9iamVjdCwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBmb3IgKHZhciBrIGluIG9iamVjdCkge1xuICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGspKSB7XG4gICAgICAgICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9iamVjdFtrXSwgaywgb2JqZWN0KVxuICAgICAgICB9XG4gICAgfVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2Zvci1lYWNoL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlQk1Gb250QXNjaWkoZGF0YSkge1xuICBpZiAoIWRhdGEpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdubyBkYXRhIHByb3ZpZGVkJylcbiAgZGF0YSA9IGRhdGEudG9TdHJpbmcoKS50cmltKClcblxuICB2YXIgb3V0cHV0ID0ge1xuICAgIHBhZ2VzOiBbXSxcbiAgICBjaGFyczogW10sXG4gICAga2VybmluZ3M6IFtdXG4gIH1cblxuICB2YXIgbGluZXMgPSBkYXRhLnNwbGl0KC9cXHJcXG4/fFxcbi9nKVxuXG4gIGlmIChsaW5lcy5sZW5ndGggPT09IDApXG4gICAgdGhyb3cgbmV3IEVycm9yKCdubyBkYXRhIGluIEJNRm9udCBmaWxlJylcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGxpbmVEYXRhID0gc3BsaXRMaW5lKGxpbmVzW2ldLCBpKVxuICAgIGlmICghbGluZURhdGEpIC8vc2tpcCBlbXB0eSBsaW5lc1xuICAgICAgY29udGludWVcblxuICAgIGlmIChsaW5lRGF0YS5rZXkgPT09ICdwYWdlJykge1xuICAgICAgaWYgKHR5cGVvZiBsaW5lRGF0YS5kYXRhLmlkICE9PSAnbnVtYmVyJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdtYWxmb3JtZWQgZmlsZSBhdCBsaW5lICcgKyBpICsgJyAtLSBuZWVkcyBwYWdlIGlkPU4nKVxuICAgICAgaWYgKHR5cGVvZiBsaW5lRGF0YS5kYXRhLmZpbGUgIT09ICdzdHJpbmcnKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ21hbGZvcm1lZCBmaWxlIGF0IGxpbmUgJyArIGkgKyAnIC0tIG5lZWRzIHBhZ2UgZmlsZT1cInBhdGhcIicpXG4gICAgICBvdXRwdXQucGFnZXNbbGluZURhdGEuZGF0YS5pZF0gPSBsaW5lRGF0YS5kYXRhLmZpbGVcbiAgICB9IGVsc2UgaWYgKGxpbmVEYXRhLmtleSA9PT0gJ2NoYXJzJyB8fCBsaW5lRGF0YS5rZXkgPT09ICdrZXJuaW5ncycpIHtcbiAgICAgIC8vLi4uIGRvIG5vdGhpbmcgZm9yIHRoZXNlIHR3byAuLi5cbiAgICB9IGVsc2UgaWYgKGxpbmVEYXRhLmtleSA9PT0gJ2NoYXInKSB7XG4gICAgICBvdXRwdXQuY2hhcnMucHVzaChsaW5lRGF0YS5kYXRhKVxuICAgIH0gZWxzZSBpZiAobGluZURhdGEua2V5ID09PSAna2VybmluZycpIHtcbiAgICAgIG91dHB1dC5rZXJuaW5ncy5wdXNoKGxpbmVEYXRhLmRhdGEpXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dFtsaW5lRGF0YS5rZXldID0gbGluZURhdGEuZGF0YVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvdXRwdXRcbn1cblxuZnVuY3Rpb24gc3BsaXRMaW5lKGxpbmUsIGlkeCkge1xuICBsaW5lID0gbGluZS5yZXBsYWNlKC9cXHQrL2csICcgJykudHJpbSgpXG4gIGlmICghbGluZSlcbiAgICByZXR1cm4gbnVsbFxuXG4gIHZhciBzcGFjZSA9IGxpbmUuaW5kZXhPZignICcpXG4gIGlmIChzcGFjZSA9PT0gLTEpIFxuICAgIHRocm93IG5ldyBFcnJvcihcIm5vIG5hbWVkIHJvdyBhdCBsaW5lIFwiICsgaWR4KVxuXG4gIHZhciBrZXkgPSBsaW5lLnN1YnN0cmluZygwLCBzcGFjZSlcblxuICBsaW5lID0gbGluZS5zdWJzdHJpbmcoc3BhY2UgKyAxKVxuICAvL2NsZWFyIFwibGV0dGVyXCIgZmllbGQgYXMgaXQgaXMgbm9uLXN0YW5kYXJkIGFuZFxuICAvL3JlcXVpcmVzIGFkZGl0aW9uYWwgY29tcGxleGl0eSB0byBwYXJzZSBcIiAvID0gc3ltYm9sc1xuICBsaW5lID0gbGluZS5yZXBsYWNlKC9sZXR0ZXI9W1xcJ1xcXCJdXFxTK1tcXCdcXFwiXS9naSwgJycpICBcbiAgbGluZSA9IGxpbmUuc3BsaXQoXCI9XCIpXG4gIGxpbmUgPSBsaW5lLm1hcChmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gc3RyLnRyaW0oKS5tYXRjaCgoLyhcIi4qP1wifFteXCJcXHNdKykrKD89XFxzKnxcXHMqJCkvZykpXG4gIH0pXG5cbiAgdmFyIGRhdGEgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmUubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZHQgPSBsaW5lW2ldXG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIGRhdGEucHVzaCh7XG4gICAgICAgIGtleTogZHRbMF0sXG4gICAgICAgIGRhdGE6IFwiXCJcbiAgICAgIH0pXG4gICAgfSBlbHNlIGlmIChpID09PSBsaW5lLmxlbmd0aCAtIDEpIHtcbiAgICAgIGRhdGFbZGF0YS5sZW5ndGggLSAxXS5kYXRhID0gcGFyc2VEYXRhKGR0WzBdKVxuICAgIH0gZWxzZSB7XG4gICAgICBkYXRhW2RhdGEubGVuZ3RoIC0gMV0uZGF0YSA9IHBhcnNlRGF0YShkdFswXSlcbiAgICAgIGRhdGEucHVzaCh7XG4gICAgICAgIGtleTogZHRbMV0sXG4gICAgICAgIGRhdGE6IFwiXCJcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgdmFyIG91dCA9IHtcbiAgICBrZXk6IGtleSxcbiAgICBkYXRhOiB7fVxuICB9XG5cbiAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKHYpIHtcbiAgICBvdXQuZGF0YVt2LmtleV0gPSB2LmRhdGE7XG4gIH0pXG5cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBwYXJzZURhdGEoZGF0YSkge1xuICBpZiAoIWRhdGEgfHwgZGF0YS5sZW5ndGggPT09IDApXG4gICAgcmV0dXJuIFwiXCJcblxuICBpZiAoZGF0YS5pbmRleE9mKCdcIicpID09PSAwIHx8IGRhdGEuaW5kZXhPZihcIidcIikgPT09IDApXG4gICAgcmV0dXJuIGRhdGEuc3Vic3RyaW5nKDEsIGRhdGEubGVuZ3RoIC0gMSlcbiAgaWYgKGRhdGEuaW5kZXhPZignLCcpICE9PSAtMSlcbiAgICByZXR1cm4gcGFyc2VJbnRMaXN0KGRhdGEpXG4gIHJldHVybiBwYXJzZUludChkYXRhLCAxMClcbn1cblxuZnVuY3Rpb24gcGFyc2VJbnRMaXN0KGRhdGEpIHtcbiAgcmV0dXJuIGRhdGEuc3BsaXQoJywnKS5tYXAoZnVuY3Rpb24odmFsKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KHZhbCwgMTApXG4gIH0pXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3BhcnNlLWJtZm9udC1hc2NpaS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMzNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHBhcnNlQXR0cmlidXRlcyA9IHJlcXVpcmUoJy4vcGFyc2UtYXR0cmlicycpXG52YXIgcGFyc2VGcm9tU3RyaW5nID0gcmVxdWlyZSgneG1sLXBhcnNlLWZyb20tc3RyaW5nJylcblxuLy9JbiBzb21lIGNhc2VzIGVsZW1lbnQuYXR0cmlidXRlLm5vZGVOYW1lIGNhbiByZXR1cm5cbi8vYWxsIGxvd2VyY2FzZSB2YWx1ZXMuLiBzbyB3ZSBuZWVkIHRvIG1hcCB0aGVtIHRvIHRoZSBjb3JyZWN0IFxuLy9jYXNlXG52YXIgTkFNRV9NQVAgPSB7XG4gIHNjYWxlaDogJ3NjYWxlSCcsXG4gIHNjYWxldzogJ3NjYWxlVycsXG4gIHN0cmV0Y2hoOiAnc3RyZXRjaEgnLFxuICBsaW5laGVpZ2h0OiAnbGluZUhlaWdodCcsXG4gIGFscGhhY2hubDogJ2FscGhhQ2hubCcsXG4gIHJlZGNobmw6ICdyZWRDaG5sJyxcbiAgZ3JlZW5jaG5sOiAnZ3JlZW5DaG5sJyxcbiAgYmx1ZWNobmw6ICdibHVlQ2hubCdcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZShkYXRhKSB7XG4gIGRhdGEgPSBkYXRhLnRvU3RyaW5nKClcbiAgXG4gIHZhciB4bWxSb290ID0gcGFyc2VGcm9tU3RyaW5nKGRhdGEpXG4gIHZhciBvdXRwdXQgPSB7XG4gICAgcGFnZXM6IFtdLFxuICAgIGNoYXJzOiBbXSxcbiAgICBrZXJuaW5nczogW11cbiAgfVxuXG4gIC8vZ2V0IGNvbmZpZyBzZXR0aW5nc1xuICA7WydpbmZvJywgJ2NvbW1vbiddLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIGVsZW1lbnQgPSB4bWxSb290LmdldEVsZW1lbnRzQnlUYWdOYW1lKGtleSlbMF1cbiAgICBpZiAoZWxlbWVudClcbiAgICAgIG91dHB1dFtrZXldID0gcGFyc2VBdHRyaWJ1dGVzKGdldEF0dHJpYnMoZWxlbWVudCkpXG4gIH0pXG5cbiAgLy9nZXQgcGFnZSBpbmZvXG4gIHZhciBwYWdlUm9vdCA9IHhtbFJvb3QuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3BhZ2VzJylbMF1cbiAgaWYgKCFwYWdlUm9vdClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21hbGZvcm1lZCBmaWxlIC0tIG5vIDxwYWdlcz4gZWxlbWVudCcpXG4gIHZhciBwYWdlcyA9IHBhZ2VSb290LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwYWdlJylcbiAgZm9yICh2YXIgaT0wOyBpPHBhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHAgPSBwYWdlc1tpXVxuICAgIHZhciBpZCA9IHBhcnNlSW50KHAuZ2V0QXR0cmlidXRlKCdpZCcpLCAxMClcbiAgICB2YXIgZmlsZSA9IHAuZ2V0QXR0cmlidXRlKCdmaWxlJylcbiAgICBpZiAoaXNOYU4oaWQpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtYWxmb3JtZWQgZmlsZSAtLSBwYWdlIFwiaWRcIiBhdHRyaWJ1dGUgaXMgTmFOJylcbiAgICBpZiAoIWZpbGUpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21hbGZvcm1lZCBmaWxlIC0tIG5lZWRzIHBhZ2UgXCJmaWxlXCIgYXR0cmlidXRlJylcbiAgICBvdXRwdXQucGFnZXNbcGFyc2VJbnQoaWQsIDEwKV0gPSBmaWxlXG4gIH1cblxuICAvL2dldCBrZXJuaW5ncyAvIGNoYXJzXG4gIDtbJ2NoYXJzJywgJ2tlcm5pbmdzJ10uZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgZWxlbWVudCA9IHhtbFJvb3QuZ2V0RWxlbWVudHNCeVRhZ05hbWUoa2V5KVswXVxuICAgIGlmICghZWxlbWVudClcbiAgICAgIHJldHVyblxuICAgIHZhciBjaGlsZFRhZyA9IGtleS5zdWJzdHJpbmcoMCwga2V5Lmxlbmd0aC0xKVxuICAgIHZhciBjaGlsZHJlbiA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoY2hpbGRUYWcpXG4gICAgZm9yICh2YXIgaT0wOyBpPGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7ICAgICAgXG4gICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgb3V0cHV0W2tleV0ucHVzaChwYXJzZUF0dHJpYnV0ZXMoZ2V0QXR0cmlicyhjaGlsZCkpKVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIG91dHB1dFxufVxuXG5mdW5jdGlvbiBnZXRBdHRyaWJzKGVsZW1lbnQpIHtcbiAgdmFyIGF0dHJpYnMgPSBnZXRBdHRyaWJMaXN0KGVsZW1lbnQpXG4gIHJldHVybiBhdHRyaWJzLnJlZHVjZShmdW5jdGlvbihkaWN0LCBhdHRyaWIpIHtcbiAgICB2YXIga2V5ID0gbWFwTmFtZShhdHRyaWIubm9kZU5hbWUpXG4gICAgZGljdFtrZXldID0gYXR0cmliLm5vZGVWYWx1ZVxuICAgIHJldHVybiBkaWN0XG4gIH0sIHt9KVxufVxuXG5mdW5jdGlvbiBnZXRBdHRyaWJMaXN0KGVsZW1lbnQpIHtcbiAgLy9JRTgrIGFuZCBtb2Rlcm4gYnJvd3NlcnNcbiAgdmFyIGF0dHJpYnMgPSBbXVxuICBmb3IgKHZhciBpPTA7IGk8ZWxlbWVudC5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKVxuICAgIGF0dHJpYnMucHVzaChlbGVtZW50LmF0dHJpYnV0ZXNbaV0pXG4gIHJldHVybiBhdHRyaWJzXG59XG5cbmZ1bmN0aW9uIG1hcE5hbWUobm9kZU5hbWUpIHtcbiAgcmV0dXJuIE5BTUVfTUFQW25vZGVOYW1lLnRvTG93ZXJDYXNlKCldIHx8IG5vZGVOYW1lXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3BhcnNlLWJtZm9udC14bWwvbGliL2Jyb3dzZXIuanNcbi8vIG1vZHVsZSBpZCA9IDM0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vU29tZSB2ZXJzaW9ucyBvZiBHbHlwaERlc2lnbmVyIGhhdmUgYSB0eXBvXG4vL3RoYXQgY2F1c2VzIHNvbWUgYnVncyB3aXRoIHBhcnNpbmcuIFxuLy9OZWVkIHRvIGNvbmZpcm0gd2l0aCByZWNlbnQgdmVyc2lvbiBvZiB0aGUgc29mdHdhcmVcbi8vdG8gc2VlIHdoZXRoZXIgdGhpcyBpcyBzdGlsbCBhbiBpc3N1ZSBvciBub3QuXG52YXIgR0xZUEhfREVTSUdORVJfRVJST1IgPSAnY2hhc3JzZXQnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VBdHRyaWJ1dGVzKG9iaikge1xuICBpZiAoR0xZUEhfREVTSUdORVJfRVJST1IgaW4gb2JqKSB7XG4gICAgb2JqWydjaGFyc2V0J10gPSBvYmpbR0xZUEhfREVTSUdORVJfRVJST1JdXG4gICAgZGVsZXRlIG9ialtHTFlQSF9ERVNJR05FUl9FUlJPUl1cbiAgfVxuXG4gIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgaWYgKGsgPT09ICdmYWNlJyB8fCBrID09PSAnY2hhcnNldCcpIFxuICAgICAgY29udGludWVcbiAgICBlbHNlIGlmIChrID09PSAncGFkZGluZycgfHwgayA9PT0gJ3NwYWNpbmcnKVxuICAgICAgb2JqW2tdID0gcGFyc2VJbnRMaXN0KG9ialtrXSlcbiAgICBlbHNlXG4gICAgICBvYmpba10gPSBwYXJzZUludChvYmpba10sIDEwKSBcbiAgfVxuICByZXR1cm4gb2JqXG59XG5cbmZ1bmN0aW9uIHBhcnNlSW50TGlzdChkYXRhKSB7XG4gIHJldHVybiBkYXRhLnNwbGl0KCcsJykubWFwKGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiBwYXJzZUludCh2YWwsIDEwKVxuICB9KVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9wYXJzZS1ibWZvbnQteG1sL2xpYi9wYXJzZS1hdHRyaWJzLmpzXG4vLyBtb2R1bGUgaWQgPSAzNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiB4bWxwYXJzZXIoKSB7XG4gIC8vY29tbW9uIGJyb3dzZXJzXG4gIGlmICh0eXBlb2Ygd2luZG93LkRPTVBhcnNlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyKSB7XG4gICAgICB2YXIgcGFyc2VyID0gbmV3IHdpbmRvdy5ET01QYXJzZXIoKVxuICAgICAgcmV0dXJuIHBhcnNlci5wYXJzZUZyb21TdHJpbmcoc3RyLCAnYXBwbGljYXRpb24veG1sJylcbiAgICB9XG4gIH0gXG5cbiAgLy9JRTggZmFsbGJhY2tcbiAgaWYgKHR5cGVvZiB3aW5kb3cuQWN0aXZlWE9iamVjdCAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICYmIG5ldyB3aW5kb3cuQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTERPTScpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cikge1xuICAgICAgdmFyIHhtbERvYyA9IG5ldyB3aW5kb3cuQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxET01cIilcbiAgICAgIHhtbERvYy5hc3luYyA9IFwiZmFsc2VcIlxuICAgICAgeG1sRG9jLmxvYWRYTUwoc3RyKVxuICAgICAgcmV0dXJuIHhtbERvY1xuICAgIH1cbiAgfVxuXG4gIC8vbGFzdCByZXNvcnQgZmFsbGJhY2tcbiAgcmV0dXJuIGZ1bmN0aW9uKHN0cikge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRpdi5pbm5lckhUTUwgPSBzdHJcbiAgICByZXR1cm4gZGl2XG4gIH1cbn0pKClcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34veG1sLXBhcnNlLWZyb20tc3RyaW5nL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgSEVBREVSID0gWzY2LCA3NywgNzBdXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmVhZEJNRm9udEJpbmFyeShidWYpIHtcbiAgaWYgKGJ1Zi5sZW5ndGggPCA2KVxuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBidWZmZXIgbGVuZ3RoIGZvciBCTUZvbnQnKVxuXG4gIHZhciBoZWFkZXIgPSBIRUFERVIuZXZlcnkoZnVuY3Rpb24oYnl0ZSwgaSkge1xuICAgIHJldHVybiBidWYucmVhZFVJbnQ4KGkpID09PSBieXRlXG4gIH0pXG5cbiAgaWYgKCFoZWFkZXIpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdCTUZvbnQgbWlzc2luZyBCTUYgYnl0ZSBoZWFkZXInKVxuXG4gIHZhciBpID0gM1xuICB2YXIgdmVycyA9IGJ1Zi5yZWFkVUludDgoaSsrKVxuICBpZiAodmVycyA+IDMpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdPbmx5IHN1cHBvcnRzIEJNRm9udCBCaW5hcnkgdjMgKEJNRm9udCBBcHAgdjEuMTApJylcbiAgXG4gIHZhciB0YXJnZXQgPSB7IGtlcm5pbmdzOiBbXSwgY2hhcnM6IFtdIH1cbiAgZm9yICh2YXIgYj0wOyBiPDU7IGIrKylcbiAgICBpICs9IHJlYWRCbG9jayh0YXJnZXQsIGJ1ZiwgaSlcbiAgcmV0dXJuIHRhcmdldFxufVxuXG5mdW5jdGlvbiByZWFkQmxvY2sodGFyZ2V0LCBidWYsIGkpIHtcbiAgaWYgKGkgPiBidWYubGVuZ3RoLTEpXG4gICAgcmV0dXJuIDBcblxuICB2YXIgYmxvY2tJRCA9IGJ1Zi5yZWFkVUludDgoaSsrKVxuICB2YXIgYmxvY2tTaXplID0gYnVmLnJlYWRJbnQzMkxFKGkpXG4gIGkgKz0gNFxuXG4gIHN3aXRjaChibG9ja0lEKSB7XG4gICAgY2FzZSAxOiBcbiAgICAgIHRhcmdldC5pbmZvID0gcmVhZEluZm8oYnVmLCBpKVxuICAgICAgYnJlYWtcbiAgICBjYXNlIDI6XG4gICAgICB0YXJnZXQuY29tbW9uID0gcmVhZENvbW1vbihidWYsIGkpXG4gICAgICBicmVha1xuICAgIGNhc2UgMzpcbiAgICAgIHRhcmdldC5wYWdlcyA9IHJlYWRQYWdlcyhidWYsIGksIGJsb2NrU2l6ZSlcbiAgICAgIGJyZWFrXG4gICAgY2FzZSA0OlxuICAgICAgdGFyZ2V0LmNoYXJzID0gcmVhZENoYXJzKGJ1ZiwgaSwgYmxvY2tTaXplKVxuICAgICAgYnJlYWtcbiAgICBjYXNlIDU6XG4gICAgICB0YXJnZXQua2VybmluZ3MgPSByZWFkS2VybmluZ3MoYnVmLCBpLCBibG9ja1NpemUpXG4gICAgICBicmVha1xuICB9XG4gIHJldHVybiA1ICsgYmxvY2tTaXplXG59XG5cbmZ1bmN0aW9uIHJlYWRJbmZvKGJ1ZiwgaSkge1xuICB2YXIgaW5mbyA9IHt9XG4gIGluZm8uc2l6ZSA9IGJ1Zi5yZWFkSW50MTZMRShpKVxuXG4gIHZhciBiaXRGaWVsZCA9IGJ1Zi5yZWFkVUludDgoaSsyKVxuICBpbmZvLnNtb290aCA9IChiaXRGaWVsZCA+PiA3KSAmIDFcbiAgaW5mby51bmljb2RlID0gKGJpdEZpZWxkID4+IDYpICYgMVxuICBpbmZvLml0YWxpYyA9IChiaXRGaWVsZCA+PiA1KSAmIDFcbiAgaW5mby5ib2xkID0gKGJpdEZpZWxkID4+IDQpICYgMVxuICBcbiAgLy9maXhlZEhlaWdodCBpcyBvbmx5IG1lbnRpb25lZCBpbiBiaW5hcnkgc3BlYyBcbiAgaWYgKChiaXRGaWVsZCA+PiAzKSAmIDEpXG4gICAgaW5mby5maXhlZEhlaWdodCA9IDFcbiAgXG4gIGluZm8uY2hhcnNldCA9IGJ1Zi5yZWFkVUludDgoaSszKSB8fCAnJ1xuICBpbmZvLnN0cmV0Y2hIID0gYnVmLnJlYWRVSW50MTZMRShpKzQpXG4gIGluZm8uYWEgPSBidWYucmVhZFVJbnQ4KGkrNilcbiAgaW5mby5wYWRkaW5nID0gW1xuICAgIGJ1Zi5yZWFkSW50OChpKzcpLFxuICAgIGJ1Zi5yZWFkSW50OChpKzgpLFxuICAgIGJ1Zi5yZWFkSW50OChpKzkpLFxuICAgIGJ1Zi5yZWFkSW50OChpKzEwKVxuICBdXG4gIGluZm8uc3BhY2luZyA9IFtcbiAgICBidWYucmVhZEludDgoaSsxMSksXG4gICAgYnVmLnJlYWRJbnQ4KGkrMTIpXG4gIF1cbiAgaW5mby5vdXRsaW5lID0gYnVmLnJlYWRVSW50OChpKzEzKVxuICBpbmZvLmZhY2UgPSByZWFkU3RyaW5nTlQoYnVmLCBpKzE0KVxuICByZXR1cm4gaW5mb1xufVxuXG5mdW5jdGlvbiByZWFkQ29tbW9uKGJ1ZiwgaSkge1xuICB2YXIgY29tbW9uID0ge31cbiAgY29tbW9uLmxpbmVIZWlnaHQgPSBidWYucmVhZFVJbnQxNkxFKGkpXG4gIGNvbW1vbi5iYXNlID0gYnVmLnJlYWRVSW50MTZMRShpKzIpXG4gIGNvbW1vbi5zY2FsZVcgPSBidWYucmVhZFVJbnQxNkxFKGkrNClcbiAgY29tbW9uLnNjYWxlSCA9IGJ1Zi5yZWFkVUludDE2TEUoaSs2KVxuICBjb21tb24ucGFnZXMgPSBidWYucmVhZFVJbnQxNkxFKGkrOClcbiAgdmFyIGJpdEZpZWxkID0gYnVmLnJlYWRVSW50OChpKzEwKVxuICBjb21tb24ucGFja2VkID0gMFxuICBjb21tb24uYWxwaGFDaG5sID0gYnVmLnJlYWRVSW50OChpKzExKVxuICBjb21tb24ucmVkQ2hubCA9IGJ1Zi5yZWFkVUludDgoaSsxMilcbiAgY29tbW9uLmdyZWVuQ2hubCA9IGJ1Zi5yZWFkVUludDgoaSsxMylcbiAgY29tbW9uLmJsdWVDaG5sID0gYnVmLnJlYWRVSW50OChpKzE0KVxuICByZXR1cm4gY29tbW9uXG59XG5cbmZ1bmN0aW9uIHJlYWRQYWdlcyhidWYsIGksIHNpemUpIHtcbiAgdmFyIHBhZ2VzID0gW11cbiAgdmFyIHRleHQgPSByZWFkTmFtZU5UKGJ1ZiwgaSlcbiAgdmFyIGxlbiA9IHRleHQubGVuZ3RoKzFcbiAgdmFyIGNvdW50ID0gc2l6ZSAvIGxlblxuICBmb3IgKHZhciBjPTA7IGM8Y291bnQ7IGMrKykge1xuICAgIHBhZ2VzW2NdID0gYnVmLnNsaWNlKGksIGkrdGV4dC5sZW5ndGgpLnRvU3RyaW5nKCd1dGY4JylcbiAgICBpICs9IGxlblxuICB9XG4gIHJldHVybiBwYWdlc1xufVxuXG5mdW5jdGlvbiByZWFkQ2hhcnMoYnVmLCBpLCBibG9ja1NpemUpIHtcbiAgdmFyIGNoYXJzID0gW11cblxuICB2YXIgY291bnQgPSBibG9ja1NpemUgLyAyMFxuICBmb3IgKHZhciBjPTA7IGM8Y291bnQ7IGMrKykge1xuICAgIHZhciBjaGFyID0ge31cbiAgICB2YXIgb2ZmID0gYyoyMFxuICAgIGNoYXIuaWQgPSBidWYucmVhZFVJbnQzMkxFKGkgKyAwICsgb2ZmKVxuICAgIGNoYXIueCA9IGJ1Zi5yZWFkVUludDE2TEUoaSArIDQgKyBvZmYpXG4gICAgY2hhci55ID0gYnVmLnJlYWRVSW50MTZMRShpICsgNiArIG9mZilcbiAgICBjaGFyLndpZHRoID0gYnVmLnJlYWRVSW50MTZMRShpICsgOCArIG9mZilcbiAgICBjaGFyLmhlaWdodCA9IGJ1Zi5yZWFkVUludDE2TEUoaSArIDEwICsgb2ZmKVxuICAgIGNoYXIueG9mZnNldCA9IGJ1Zi5yZWFkSW50MTZMRShpICsgMTIgKyBvZmYpXG4gICAgY2hhci55b2Zmc2V0ID0gYnVmLnJlYWRJbnQxNkxFKGkgKyAxNCArIG9mZilcbiAgICBjaGFyLnhhZHZhbmNlID0gYnVmLnJlYWRJbnQxNkxFKGkgKyAxNiArIG9mZilcbiAgICBjaGFyLnBhZ2UgPSBidWYucmVhZFVJbnQ4KGkgKyAxOCArIG9mZilcbiAgICBjaGFyLmNobmwgPSBidWYucmVhZFVJbnQ4KGkgKyAxOSArIG9mZilcbiAgICBjaGFyc1tjXSA9IGNoYXJcbiAgfVxuICByZXR1cm4gY2hhcnNcbn1cblxuZnVuY3Rpb24gcmVhZEtlcm5pbmdzKGJ1ZiwgaSwgYmxvY2tTaXplKSB7XG4gIHZhciBrZXJuaW5ncyA9IFtdXG4gIHZhciBjb3VudCA9IGJsb2NrU2l6ZSAvIDEwXG4gIGZvciAodmFyIGM9MDsgYzxjb3VudDsgYysrKSB7XG4gICAgdmFyIGtlcm4gPSB7fVxuICAgIHZhciBvZmYgPSBjKjEwXG4gICAga2Vybi5maXJzdCA9IGJ1Zi5yZWFkVUludDMyTEUoaSArIDAgKyBvZmYpXG4gICAga2Vybi5zZWNvbmQgPSBidWYucmVhZFVJbnQzMkxFKGkgKyA0ICsgb2ZmKVxuICAgIGtlcm4uYW1vdW50ID0gYnVmLnJlYWRJbnQxNkxFKGkgKyA4ICsgb2ZmKVxuICAgIGtlcm5pbmdzW2NdID0ga2VyblxuICB9XG4gIHJldHVybiBrZXJuaW5nc1xufVxuXG5mdW5jdGlvbiByZWFkTmFtZU5UKGJ1Ziwgb2Zmc2V0KSB7XG4gIHZhciBwb3M9b2Zmc2V0XG4gIGZvciAoOyBwb3M8YnVmLmxlbmd0aDsgcG9zKyspIHtcbiAgICBpZiAoYnVmW3Bvc10gPT09IDB4MDApIFxuICAgICAgYnJlYWtcbiAgfVxuICByZXR1cm4gYnVmLnNsaWNlKG9mZnNldCwgcG9zKVxufVxuXG5mdW5jdGlvbiByZWFkU3RyaW5nTlQoYnVmLCBvZmZzZXQpIHtcbiAgcmV0dXJuIHJlYWROYW1lTlQoYnVmLCBvZmZzZXQpLnRvU3RyaW5nKCd1dGY4Jylcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcGFyc2UtYm1mb250LWJpbmFyeS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMzdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGVxdWFsID0gcmVxdWlyZSgnYnVmZmVyLWVxdWFsJylcbnZhciBIRUFERVIgPSBuZXcgQnVmZmVyKFs2NiwgNzcsIDcwLCAzXSlcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihidWYpIHtcbiAgaWYgKHR5cGVvZiBidWYgPT09ICdzdHJpbmcnKVxuICAgIHJldHVybiBidWYuc3Vic3RyaW5nKDAsIDMpID09PSAnQk1GJ1xuICByZXR1cm4gYnVmLmxlbmd0aCA+IDQgJiYgZXF1YWwoYnVmLnNsaWNlKDAsIDQpLCBIRUFERVIpXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvYWQtYm1mb250L2xpYi9pcy1iaW5hcnkuanNcbi8vIG1vZHVsZSBpZCA9IDM4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7IC8vIGZvciB1c2Ugd2l0aCBicm93c2VyaWZ5XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihhKSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICBpZiAodHlwZW9mIGEuZXF1YWxzID09PSAnZnVuY3Rpb24nKSByZXR1cm4gYS5lcXVhbHMoYik7XG4gICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYnVmZmVyLWVxdWFsL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYXNzaWduID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZVNERlNoYWRlciAob3B0KSB7XHJcbiAgb3B0ID0gb3B0IHx8IHt9XHJcbiAgdmFyIG9wYWNpdHkgPSB0eXBlb2Ygb3B0Lm9wYWNpdHkgPT09ICdudW1iZXInID8gb3B0Lm9wYWNpdHkgOiAxXHJcbiAgdmFyIGFscGhhVGVzdCA9IHR5cGVvZiBvcHQuYWxwaGFUZXN0ID09PSAnbnVtYmVyJyA/IG9wdC5hbHBoYVRlc3QgOiAwLjAwMDFcclxuICB2YXIgcHJlY2lzaW9uID0gb3B0LnByZWNpc2lvbiB8fCAnaGlnaHAnXHJcbiAgdmFyIGNvbG9yID0gb3B0LmNvbG9yXHJcbiAgdmFyIG1hcCA9IG9wdC5tYXBcclxuXHJcbiAgLy8gcmVtb3ZlIHRvIHNhdGlzZnkgcjczXHJcbiAgZGVsZXRlIG9wdC5tYXBcclxuICBkZWxldGUgb3B0LmNvbG9yXHJcbiAgZGVsZXRlIG9wdC5wcmVjaXNpb25cclxuICBkZWxldGUgb3B0Lm9wYWNpdHlcclxuXHJcbiAgcmV0dXJuIGFzc2lnbih7XHJcbiAgICB1bmlmb3Jtczoge1xyXG4gICAgICBvcGFjaXR5OiB7IHR5cGU6ICdmJywgdmFsdWU6IG9wYWNpdHkgfSxcclxuICAgICAgbWFwOiB7IHR5cGU6ICd0JywgdmFsdWU6IG1hcCB8fCBuZXcgVEhSRUUuVGV4dHVyZSgpIH0sXHJcbiAgICAgIGNvbG9yOiB7IHR5cGU6ICdjJywgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcihjb2xvcikgfVxyXG4gICAgfSxcclxuICAgIHZlcnRleFNoYWRlcjogW1xyXG4gICAgICAnYXR0cmlidXRlIHZlYzIgdXY7JyxcclxuICAgICAgJ2F0dHJpYnV0ZSB2ZWM0IHBvc2l0aW9uOycsXHJcbiAgICAgICd1bmlmb3JtIG1hdDQgcHJvamVjdGlvbk1hdHJpeDsnLFxyXG4gICAgICAndW5pZm9ybSBtYXQ0IG1vZGVsVmlld01hdHJpeDsnLFxyXG4gICAgICAndmFyeWluZyB2ZWMyIHZVdjsnLFxyXG4gICAgICAndm9pZCBtYWluKCkgeycsXHJcbiAgICAgICd2VXYgPSB1djsnLFxyXG4gICAgICAnZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogcG9zaXRpb247JyxcclxuICAgICAgJ30nXHJcbiAgICBdLmpvaW4oJ1xcbicpLFxyXG4gICAgZnJhZ21lbnRTaGFkZXI6IFtcclxuICAgICAgJyNpZmRlZiBHTF9PRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMnLFxyXG4gICAgICAnI2V4dGVuc2lvbiBHTF9PRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMgOiBlbmFibGUnLFxyXG4gICAgICAnI2VuZGlmJyxcclxuICAgICAgJ3ByZWNpc2lvbiAnICsgcHJlY2lzaW9uICsgJyBmbG9hdDsnLFxyXG4gICAgICAndW5pZm9ybSBmbG9hdCBvcGFjaXR5OycsXHJcbiAgICAgICd1bmlmb3JtIHZlYzMgY29sb3I7JyxcclxuICAgICAgJ3VuaWZvcm0gc2FtcGxlcjJEIG1hcDsnLFxyXG4gICAgICAndmFyeWluZyB2ZWMyIHZVdjsnLFxyXG5cclxuICAgICAgJ2Zsb2F0IGFhc3RlcChmbG9hdCB2YWx1ZSkgeycsXHJcbiAgICAgICcgICNpZmRlZiBHTF9PRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMnLFxyXG4gICAgICAnICAgIGZsb2F0IGFmd2lkdGggPSBsZW5ndGgodmVjMihkRmR4KHZhbHVlKSwgZEZkeSh2YWx1ZSkpKSAqIDAuNzA3MTA2NzgxMTg2NTQ3NTc7JyxcclxuICAgICAgJyAgI2Vsc2UnLFxyXG4gICAgICAnICAgIGZsb2F0IGFmd2lkdGggPSAoMS4wIC8gMzIuMCkgKiAoMS40MTQyMTM1NjIzNzMwOTUxIC8gKDIuMCAqIGdsX0ZyYWdDb29yZC53KSk7JyxcclxuICAgICAgJyAgI2VuZGlmJyxcclxuICAgICAgJyAgcmV0dXJuIHNtb290aHN0ZXAoMC41IC0gYWZ3aWR0aCwgMC41ICsgYWZ3aWR0aCwgdmFsdWUpOycsXHJcbiAgICAgICd9JyxcclxuXHJcbiAgICAgICd2b2lkIG1haW4oKSB7JyxcclxuICAgICAgJyAgdmVjNCB0ZXhDb2xvciA9IHRleHR1cmUyRChtYXAsIHZVdik7JyxcclxuICAgICAgJyAgZmxvYXQgYWxwaGEgPSBhYXN0ZXAodGV4Q29sb3IuYSk7JyxcclxuICAgICAgJyAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciwgb3BhY2l0eSAqIGFscGhhKTsnLFxyXG4gICAgICBhbHBoYVRlc3QgPT09IDBcclxuICAgICAgICA/ICcnXHJcbiAgICAgICAgOiAnICBpZiAoZ2xfRnJhZ0NvbG9yLmEgPCAnICsgYWxwaGFUZXN0ICsgJykgZGlzY2FyZDsnLFxyXG4gICAgICAnfSdcclxuICAgIF0uam9pbignXFxuJylcclxuICB9LCBvcHQpXHJcbn1cclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FmcmFtZS1ibWZvbnQtdGV4dC1jb21wb25lbnQvbGliL3NoYWRlcnMvc2RmLmpzXG4vLyBtb2R1bGUgaWQgPSA0MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiBnbG9iYWwgQUZSQU1FICovXHJcblxyXG4vKiBFeHBlcmltZW50YWwgdGV4dCBwcmltaXRpdmUuXHJcbiAqIElzc3VlczogY29sb3Igbm90IGNoYW5naW5nLCByZW1vdmVBdHRyaWJ1dGUoKSBub3Qgd29ya2luZywgbWl4aW5nIHByaW1pdGl2ZSB3aXRoIHJlZ3VsYXIgZW50aXRpZXMgZmFpbHNcclxuICogQ29sb3IgaXNzdWUgcmVsYXRlcyB0bzogaHR0cHM6Ly9naXRodWIuY29tL2Rvbm1jY3VyZHkvYWZyYW1lLWV4dHJhcy9ibG9iL21hc3Rlci9zcmMvcHJpbWl0aXZlcy9hLW9jZWFuLmpzI0w0NFxyXG4gKi9cclxuXHJcbnZhciBleHRlbmREZWVwID0gQUZSQU1FLnV0aWxzLmV4dGVuZERlZXA7XHJcbnZhciBtZXNoTWl4aW4gPSBBRlJBTUUucHJpbWl0aXZlcy5nZXRNZXNoTWl4aW4oKTtcclxuXHJcbkFGUkFNRS5yZWdpc3RlclByaW1pdGl2ZSgnYS10ZXh0JywgZXh0ZW5kRGVlcCh7fSwgbWVzaE1peGluLCB7XHJcbiAgZGVmYXVsdENvbXBvbmVudHM6IHtcclxuICAgICdibWZvbnQtdGV4dCc6IHt9XHJcbiAgfSxcclxuICBtYXBwaW5nczoge1xyXG4gICAgdGV4dDogJ2JtZm9udC10ZXh0LnRleHQnLFxyXG4gICAgd2lkdGg6ICdibWZvbnQtdGV4dC53aWR0aCcsXHJcbiAgICBhbGlnbjogJ2JtZm9udC10ZXh0LmFsaWduJyxcclxuICAgIGxldHRlclNwYWNpbmc6ICdibWZvbnQtdGV4dC5sZXR0ZXJTcGFjaW5nJyxcclxuICAgIGxpbmVIZWlnaHQ6ICdibWZvbnQtdGV4dC5saW5lSGVpZ2h0JyxcclxuICAgIGZudDogJ2JtZm9udC10ZXh0LmZudCcsXHJcbiAgICBmbnRJbWFnZTogJ2JtZm9udC10ZXh0LmZudEltYWdlJyxcclxuICAgIG1vZGU6ICdibWZvbnQtdGV4dC5tb2RlJyxcclxuICAgIGNvbG9yOiAnYm1mb250LXRleHQuY29sb3InLFxyXG4gICAgb3BhY2l0eTogJ2JtZm9udC10ZXh0Lm9wYWNpdHknXHJcbiAgfVxyXG59KSk7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50L2V4dHJhcy90ZXh0LXByaW1pdGl2ZS5qc1xuLy8gbW9kdWxlIGlkID0gNDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyogYWZyYW1lLXNlbGVjdC1iYXIgY29tcG9uZW50IC0tIGF0dGVtcHQgdG8gcHVsbCBvdXQgc2VsZWN0IGJhciBjb2RlIGZyb20gY2l0eSBidWlsZGVyIGxvZ2ljICovXG5cbmlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xufVxuXG52YXIgb3B0aW9uSlNPTiA9IFtdOyAgLy8gZ2hldHRvIHdheSB0byBkZWNsYXJlIGdsb2JhbCB2YXIgZm9yIGF2YWlsYWJsZSBvcHRpb25zIGFuZCBvcHRpb24gZ3JvdXBzXG5cblxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdzZWxlY3QtYmFyJywge1xuICBzY2hlbWE6IHtcbiAgICBjb250cm9sczoge3R5cGU6ICdib29sZWFuJywgZGVmYXVsdDogdHJ1ZX0sXG4gICAgY29udHJvbGxlcklEOiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6IFwicmlnaHRDb250cm9sbGVyXCJ9XG4gIH0sXG5cbiAgZmV0Y2hPcHRpb25Hcm91cHM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZWN0RWwgPSB0aGlzLmVsOyAgLy8gUmVmZXJlbmNlIHRvIHRoZSBjb21wb25lbnQncyBlbnRpdHkuXG4gICAgdmFyIG9wdGdyb3VwcyA9IHNlbGVjdEVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwib3B0Z3JvdXBcIik7ICAvLyBHZXQgdGhlIG9wdGdyb3Vwc1xuICAgIGNvbnNvbGUubG9nKG9wdGdyb3Vwcyk7XG4gICAgdmFyIHNlbGVjdGVkT3B0Z3JvdXAgPSBvcHRncm91cHNbMF07ICAgIC8vIFRPRE86IGZvciBub3csIGp1c3QgZ2V0IHRoZSBmaXJzdCBvcHRncm91cCwgZXZlbnR1YWxseSBpdGVyYXRlIHRocm91Z2ggdGhlbVxuXG4gICAgQXJyYXkuZnJvbShvcHRncm91cHMpLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQsIGluZGV4KSB7XG4gICAgICBvcHRpb25KU09OW2VsZW1lbnQuZ2V0QXR0cmlidXRlKFwidmFsdWVcIildID0gZWxlbWVudDsgLy8gdGhpcyBwb3B1bGF0ZXMgb3B0aW9uSlNPTiB3aXRoIG9wdGdyb3VwIGVsZW1lbnRzIHN0b3JlZCBhcyBrZXlzIG9mIHRoZSBcInZhbHVlXCIgYXR0cmlidXRlXG4gICAgfSk7XG5cbiAgICByZXR1cm4gb3B0aW9uSlNPTjtcbiAgfSxcblxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gQ3JlYXRlIHNlbGVjdCBiYXIgbWVudSBmcm9tIGh0bWwgY2hpbGQgYG9wdGlvbmAgZWxlbWVudHMgYmVuZWF0aCBwYXJlbnQgZW50aXR5IHBlciBodG1sNSBzcGVjOiBodHRwOi8vd3d3Lnczc2Nob29scy5jb20vdGFncy90YWdfb3B0Z3JvdXAuYXNwXG5cbiAgICB2YXIgc2VsZWN0RWwgPSB0aGlzLmVsOyAgLy8gUmVmZXJlbmNlIHRvIHRoZSBjb21wb25lbnQncyBlbnRpdHkuXG4gICAgLy8gdmFyIG9wdGdyb3VwcyA9IHNlbGVjdEVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwib3B0Z3JvdXBcIik7ICAvLyBHZXQgdGhlIG9wdGdyb3Vwc1xuICAgIC8vIHZhciBzZWxlY3RlZE9wdGdyb3VwID0gb3B0Z3JvdXBzWzBdOyAgICAvLyBUT0RPOiBmb3Igbm93LCBqdXN0IGdldCB0aGUgZmlyc3Qgb3B0Z3JvdXAsIGV2ZW50dWFsbHkgaXRlcmF0ZSB0aHJvdWdoIHRoZW1cblxuICAgIHNlbGVjdGVkT3B0Z3JvdXAgPSB0aGlzLmZldGNoT3B0aW9uR3JvdXBzKClbJ21tbW1fYWxpZW4nXTtcblxuICAgIC8vIENyZWF0ZSB0aGUgXCJmcmFtZVwiIG9mIHRoZSBzZWxlY3QgbWVudSBiYXJcbiAgICB2YXIgc2VsZWN0UmVuZGVyRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYS1lbnRpdHlcIik7XG4gICAgc2VsZWN0UmVuZGVyRWwuaWQgPSBcInNlbGVjdFJlbmRlclwiO1xuICAgIHNlbGVjdFJlbmRlckVsLmlubmVySFRNTCA9IGBcbiAgICAgIDxhLWJveCBpZD1cIm1lbnVGcmFtZVwiIHNjYWxlPVwiMC40IDAuMTUgMC4wMDVcIiBwb3NpdGlvbj1cIjAgMCAtMC4wMDc1XCIgIG1hdGVyaWFsPVwib3BhY2l0eTogMC41OyB0cmFuc3BhcmVudDogdHJ1ZTsgY29sb3I6ICMwMDAwMDBcIj48L2EtYm94PlxuICAgICAgPGEtZW50aXR5IGlkPVwiZ3JvdXBUZXh0XCIgcG9zaXRpb249XCItMC4xOCAwLjA0NSAtMC4wMDNcIiBzY2FsZT1cIjAuMTI1IDAuMTI1IDAuMTI1XCIgYm1mb250LXRleHQ9XCJ0ZXh0OiAke3NlbGVjdGVkT3B0Z3JvdXAuZ2V0QXR0cmlidXRlKCdsYWJlbCcpfTsgY29sb3I6ICM3NDc0NzRcIj48L2EtZW50aXR5PlxuICAgICAgPGEtZW50aXR5IGlkPVwiYXJyb3dSaWdodFwiIHBvc2l0aW9uPVwiMC4yMjUgMCAwXCIgcm90YXRpb249XCI5MCAxODAgMFwiIHNjYWxlPVwiLTAuMDA0IDAuMDAyIDAuMDA0XCIgb2JqLW1vZGVsPVwib2JqOiNlbnZfYXJyb3dcIiBtYXRlcmlhbD1cIm9wYWNpdHk6IDAuNTsgdHJhbnNwYXJlbnQ6IHRydWU7IGNvbG9yOiAjMDAwMDAwXCI+PC9hLWVudGl0eT5cbiAgICAgIDxhLWVudGl0eSBpZD1cImFycm93TGVmdFwiIHBvc2l0aW9uPVwiLTAuMjI1IDAgMFwiIHJvdGF0aW9uPVwiOTAgMTgwIDBcIiBzY2FsZT1cIjAuMDA0IDAuMDAyIDAuMDA0XCIgb2JqLW1vZGVsPVwib2JqOiNlbnZfYXJyb3dcIiBtYXRlcmlhbD1cIm9wYWNpdHk6MC41OyB0cmFuc3BhcmVudDp0cnVlOyBjb2xvcjojMDAwMDAwXCI+PC9hLWVudGl0eT5cbiAgICAgIDxhLWVudGl0eSBpZD1cImFycm93VXBcIiBwb3NpdGlvbj1cIjAgMC4xIDBcIiByb3RhdGlvbj1cIjAgMjcwIDkwXCIgc2NhbGU9XCIwLjAwNCAwLjAwMiAwLjAwNFwiIG9iai1tb2RlbD1cIm9iajojZW52X2Fycm93XCIgbWF0ZXJpYWw9XCJvcGFjaXR5OiAwLjU7IHRyYW5zcGFyZW50OiB0cnVlOyBjb2xvcjogIzAwMDAwMFwiPjwvYS1lbnRpdHk+XG4gICAgICA8YS1lbnRpdHkgaWQ9XCJhcnJvd0Rvd25cIiBwb3NpdGlvbj1cIjAgLTAuMSAwXCIgcm90YXRpb249XCIwIDI3MCA5MFwiIHNjYWxlPVwiLTAuMDA0IDAuMDAyIDAuMDA0XCIgb2JqLW1vZGVsPVwib2JqOiNlbnZfYXJyb3dcIiBtYXRlcmlhbD1cIm9wYWNpdHk6IDAuNTsgdHJhbnNwYXJlbnQ6IHRydWU7IGNvbG9yOiAjMDAwMDAwXCI+PC9hLWVudGl0eT5cbiAgICAgIDxhLWVudGl0eSBpZD1cIm1lbnVPYmplY3RMaXN0XCI+PC9hLWVudGl0eT5cbiAgICAgIGA7XG4gICAgc2VsZWN0RWwuYXBwZW5kQ2hpbGQoc2VsZWN0UmVuZGVyRWwpO1xuXG4gICAgLy8gV2hhdCBhcmUgdGhlIHNlbGVjdCBtZW51IG9wdGlvbnMgcHJvdmlkZWQgaW4gdGhlIGh0bWw/IEFzc3VtZXMgbGlzdHMgb2YgNyBvciBncmVhdGVyIVxuICAgIC8vIDUgb3IgNiBtYXkgd29yaywgbmVlZHMgdGVzdGluZ1xuICAgIC8vIDQgYW5kIGJlbG93IHNob3VsZCBiZSBubyBzY3JvbGxcbiAgICB2YXIgb3B0aW9uc0VsZW1lbnRzID0gc2VsZWN0ZWRPcHRncm91cC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm9wdGlvblwiKTsgIC8vIHRoZSBhY3R1YWwgSlMgY2hpbGRyZW4gZWxlbWVudHNcbiAgICAvLyBjb25zb2xlLmxvZyhvcHRpb25zRWxlbWVudHMpO1xuICAgIC8vIHZhciBvcHRpb25zRWxlbWVudHMgPSBbMCwxLDIsMyw0LDUsNiw3LDgsOSwxMF07XG5cbiAgICAvLyBjb252ZXJ0IHRoZSBOb2RlTGlzdCBvZiBtYXRjaGluZyBvcHRpb24gZWxlbWVudHMgaW50byBhIEphdmFzY3JpcHQgQXJyYXlcbiAgICB2YXIgb3B0aW9uc0VsZW1lbnRzQXJyYXkgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChzZWxlY3RlZE9wdGdyb3VwLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwib3B0aW9uXCIpKTtcblxuICAgIHZhciBmaXJzdEFycmF5ID0gb3B0aW9uc0VsZW1lbnRzQXJyYXkuc2xpY2UoMCw0KTsgLy8gZ2V0IGl0ZW1zIDAgLSA0XG4gICAgdmFyIHByZXZpZXdBcnJheSA9IG9wdGlvbnNFbGVtZW50c0FycmF5LnNsaWNlKC0zKTsgLy8gZ2V0IHRoZSAzIExBU1QgaXRlbXMgb2YgdGhlIGFycmF5XG5cbiAgICAvLyBDb21iaW5lIGludG8gXCJtZW51QXJyYXlcIiwgYSBsaXN0IG9mIGN1cnJlbnRseSB2aXNpYmxlIG9wdGlvbnMgd2hlcmUgdGhlIG1pZGRsZSBpbmRleCBpcyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9iamVjdFxuICAgIHZhciBtZW51QXJyYXkgPSBwcmV2aWV3QXJyYXkuY29uY2F0KGZpcnN0QXJyYXkpO1xuXG4gICAgdmFyIHNlbGVjdE9wdGlvbnNIVE1MID0gXCJcIjtcbiAgICB2YXIgc3RhcnRQb3NpdGlvblggPSAtMC4yMjU7XG4gICAgdmFyIGRlbHRhWCA9IDAuMDc1O1xuXG4gICAgLy8gRm9yIGVhY2ggbWVudSBvcHRpb24sIGNyZWF0ZSBhIHByZXZpZXcgZWxlbWVudCBhbmQgaXRzIGFwcHJvcHJpYXRlIGNoaWxkcmVuXG4gICAgbWVudUFycmF5LmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQsIG1lbnVBcnJheUluZGV4KSB7XG4vLyAgICAgIGNvbnNvbGUubG9nKG1lbnVBcnJheUluZGV4KTtcbi8vICAgICAgY29uc29sZS5sb2coZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKSk7XG4gICAgICB2YXIgdmlzaWJsZSA9IChtZW51QXJyYXlJbmRleCA9PT0gMCB8fCBtZW51QXJyYXlJbmRleCA9PT0gNikgPyAoZmFsc2UpIDogKHRydWUpO1xuICAgICAgdmFyIHNlbGVjdGVkID0gKG1lbnVBcnJheUluZGV4ID09PSAzKTtcbiAgICAgIHNlbGVjdE9wdGlvbnNIVE1MICs9IGBcbiAgICAgIDxhLWVudGl0eSBpZD1cIm1lbnUke2VsZW1lbnQuZ2V0QXR0cmlidXRlKFwiaW5kZXhcIil9XCIgdmlzaWJsZT1cIiR7dmlzaWJsZX1cIiBjbGFzcz1cInByZXZpZXckeyAoc2VsZWN0ZWQpID8gXCIgc2VsZWN0ZWRcIiA6IFwiXCJ9XCIgb3B0aW9uaWQ9XCIke2VsZW1lbnQuZ2V0QXR0cmlidXRlKFwiaW5kZXhcIil9XCIgdmFsdWU9XCIke2VsZW1lbnQuZ2V0QXR0cmlidXRlKFwidmFsdWVcIil9XCIgb3B0Z3JvdXA9XCIke3NlbGVjdGVkT3B0Z3JvdXAuZ2V0QXR0cmlidXRlKFwidmFsdWVcIil9XCIgcG9zaXRpb249XCIke3N0YXJ0UG9zaXRpb25YfSAwIDBcIj5cbiAgICAgICAgPGEtYm94IGNsYXNzPVwicHJldmlld0ZyYW1lXCIgcG9zaXRpb249XCIwIDAgLTAuMDAzXCIgc2NhbGU9XCIwLjA2IDAuMDYgMC4wMDVcIiBtYXRlcmlhbD1cImNvbG9yOiAkeyhzZWxlY3RlZCkgPyAoXCJ5ZWxsb3dcIikgOiAoXCIjMjIyMjIyXCIpfVwiPjwvYS1ib3g+XG4gICAgICAgIDxhLWltYWdlIGNsYXNzPVwicHJldmlld0ltYWdlXCIgc2NhbGU9XCIwLjA1IDAuMDUgMC4wNVwiIHNyYz1cIiR7ZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJzcmNcIil9XCIgPjwvYS1pbWFnZT5cbiAgICAgICAgPGEtZW50aXR5IGNsYXNzPVwib2JqZWN0TmFtZVwiIHBvc2l0aW9uPVwiLTAuMDI1IC0wLjA0IC0wLjAwM1wiIHNjYWxlPVwiMC4wNSAwLjA1IDAuMDVcIiBibWZvbnQtdGV4dD1cInRleHQ6ICR7ZWxlbWVudC50ZXh0fTsgY29sb3I6ICR7KHNlbGVjdGVkKSA/IChcInllbGxvd1wiKSA6IChcIiM3NDc0NzRcIil9XCI+PC9hLWVudGl0eT5cbiAgICAgIDwvYS1lbnRpdHk+YFxuICAgICAgc3RhcnRQb3NpdGlvblggKz0gZGVsdGFYO1xuICAgIH0pO1xuXG4gICAgLy8gQXBwZW5kIHRoZXNlIG1lbnUgb3B0aW9ucyB0byBhIG5ldyBlbGVtZW50IHdpdGggaWQgb2YgXCJzZWxlY3RPcHRpb25zUm93XCJcbiAgICB2YXIgc2VsZWN0T3B0aW9uc1Jvd0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImEtZW50aXR5XCIpO1xuICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5pZCA9IFwic2VsZWN0T3B0aW9uc1Jvd1wiO1xuICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5pbm5lckhUTUwgPSBzZWxlY3RPcHRpb25zSFRNTDtcbiAgICBzZWxlY3RSZW5kZXJFbC5hcHBlbmRDaGlsZChzZWxlY3RPcHRpb25zUm93RWwpO1xuICB9LFxuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gSWYgY29udHJvbHMgPSB0cnVlIGFuZCBhIGNvbnRyb2xsZXJJRCBoYXMgYmVlbiBwcm92aWRlZCwgdGhlbiBhZGQgY29udHJvbGxlciBldmVudCBsaXN0ZW5lcnNcbiAgICBpZiAodGhpcy5kYXRhLmNvbnRyb2xzICYmIHRoaXMuZGF0YS5jb250cm9sbGVySUQpIHtcbiAgICAgIGNvbnRyb2xsZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5jb250cm9sbGVySUQpO1xuICAgICAgY29udHJvbGxlckVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYWNrcGFkZG93bicsIHRoaXMub25PcHRpb25Td2l0Y2guYmluZCh0aGlzKSk7XG4gICAgICBjb250cm9sbGVyRWwuYWRkRXZlbnRMaXN0ZW5lcignYXhpc21vdmUnLCB0aGlzLm9uQXhpc01vdmUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdvbkhvdmVyTGVmdCcsIHRoaXMub25Ib3ZlckxlZnQuYmluZCh0aGlzKSk7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignb25Ib3ZlclJpZ2h0JywgdGhpcy5vbkhvdmVyUmlnaHQuYmluZCh0aGlzKSk7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignb25PcHRpb25Td2l0Y2gnLCB0aGlzLm9uT3B0aW9uU3dpdGNoLmJpbmQodGhpcykpO1xuICAgIC8vIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ29uT3B0aW9uTmV4dCcsIGZ1bmN0aW9uKCl7dGhpcy5vbk9wdGlvblN3aXRjaChcIm5leHRcIikuYmluZCh0aGlzKX0uYmluZCh0aGlzKSApO1xuICAgIC8vIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ29uT3B0aW9uUHJldmlvdXMnLCB0aGlzLm9uT3B0aW9uU3dpdGNoKFwicHJldmlvdXNcIikuYmluZCh0aGlzKSk7XG5cbiAgfSxcblxuICAvKipcbiAgICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cbiAgICovXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZGF0YS5jb250cm9scyAmJiB0aGlzLmRhdGEuY29udHJvbGxlcklEKSB7XG4gICAgICBjb250cm9sbGVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEuY29udHJvbGxlcklEKTtcbiAgICAgIGNvbnRyb2xsZXJFbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFja3BhZGRvd24nLCB0aGlzLm9uT3B0aW9uU3dpdGNoKTtcbiAgICAgIGNvbnRyb2xsZXJFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdheGlzbW92ZScsIHRoaXMub25BeGlzTW92ZSk7XG4gICAgfVxuXG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdvbk9wdGlvblN3aXRjaCcsIHRoaXMub25PcHRpb25Td2l0Y2gpO1xuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ29uSG92ZXJSaWdodCcsIHRoaXMub25Ib3ZlclJpZ2h0KTtcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdvbkhvdmVyTGVmdCcsIHRoaXMub25Ib3ZlckxlZnQpO1xuICAgIC8vIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ29uT3B0aW9uTmV4dCcsIHRoaXMub25PcHRpb25Td2l0Y2gpO1xuICAgIC8vIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ29uT3B0aW9uUHJldmlvdXMnLCB0aGlzLm9uT3B0aW9uU3dpdGNoKTtcblxuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBlbnRpdHkgcmVzdW1lcy5cbiAgICogVXNlIHRvIGNvbnRpbnVlIG9yIGFkZCBhbnkgZHluYW1pYyBvciBiYWNrZ3JvdW5kIGJlaGF2aW9yIHN1Y2ggYXMgZXZlbnRzLlxuICAgKi9cbiAgcGxheTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcbiAgfSxcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gZW50aXR5IHBhdXNlcy5cbiAgICogVXNlIHRvIHN0b3Agb3IgcmVtb3ZlIGFueSBkeW5hbWljIG9yIGJhY2tncm91bmQgYmVoYXZpb3Igc3VjaCBhcyBldmVudHMuXG4gICAqL1xuICBwYXVzZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgfSxcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBjb21wb25lbnQgaXMgcmVtb3ZlZCAoZS5nLiwgdmlhIHJlbW92ZUF0dHJpYnV0ZSkuXG4gICAqIEdlbmVyYWxseSB1bmRvZXMgYWxsIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGVudGl0eS5cbiAgICovXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgfSxcblxuICBvbkF4aXNNb3ZlOiBmdW5jdGlvbiAoZXZ0KSB7ICAgICAgIC8vIG1lbnU6IHVzZWQgZm9yIGRldGVybWluaW5nIGN1cnJlbnQgYXhpcyBvZiB0cmFja3BhZCBob3ZlciBwb3NpdGlvblxuICAgIGlmIChldnQuZGV0YWlsLmF4aXNbMF0gPT09IDAgJiYgZXZ0LmRldGFpbC5heGlzWzFdID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKFwiYXhpc1swXTogXCIgKyBldnQuZGV0YWlsLmF4aXNbMF0pOyAvLyBsZWZ0IC0xOyByaWdodCArMVxuICAgIC8vIGNvbnNvbGUubG9nKFwiYXhpc1sxXTogXCIgKyBldnQuZGV0YWlsLmF4aXNbMV0pOyAvLyBkb3duIC0xOyB1cCArMVxuICAgIC8vIGNvbnNvbGUubG9nKGV2dC50YXJnZXQuaWQpO1xuXG4gICAgLy8gVE9ETzogdGhpcyBzaG91bGQgcmVmbGVjdCB0aGUgcGFyZW50IGVsZW1lbnQgLy9tZW51OiBvbmx5IGRlYWwgd2l0aCB0cmFja3BhZCBldmVudHMgZnJvbSByaWdodCBjb250cm9sbGVyXG4gICAgaWYgKGV2dC50YXJnZXQuaWQgPT09ICdsZWZ0Q29udHJvbGxlcicpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZXZ0LmRldGFpbC5heGlzWzBdID4gMCkge1xuICAgICAgdGhpcy5vbkhvdmVyUmlnaHQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbkhvdmVyTGVmdCgpO1xuICAgIH1cbiAgfSxcblxuICBvbkhvdmVyUmlnaHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJyb3cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93UmlnaHRcIik7XG4gICAgdmFyIGN1cnJlbnRBcnJvd0NvbG9yID0gbmV3IFRIUkVFLkNvbG9yKGFycm93LmdldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIpLmNvbG9yKTtcbiAgICBpZiAoY3VycmVudEFycm93Q29sb3IuciA9PT0gMCkgeyAvLyBpZiBub3QgYWxyZWFkeSBzb21lIHNoYWRlIG9mIHllbGxvdyAod2hpY2ggaW5kaWNhdGVzIHJlY2VudCBidXR0b24gcHJlc3MpIHRoZW4gYW5pbWF0ZSBncmVlbiBob3ZlclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJyk7XG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScpO1xuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiIzAwRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5vcGFjaXR5JywgZHVyOiA1MDAsIGZyb206IFwiMVwiLCB0bzogXCIwLjVcIiB9KTtcbiAgICB9XG4gIH0sXG5cbiAgb25Ib3ZlckxlZnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJyb3cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93TGVmdFwiKTtcbiAgICB2YXIgY3VycmVudEFycm93Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoYXJyb3cuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpO1xuICAgIGlmIChjdXJyZW50QXJyb3dDb2xvci5yID09PSAwKSB7IC8vIGlmIG5vdCBhbHJlYWR5IHNvbWUgc2hhZGUgb2YgeWVsbG93ICh3aGljaCBpbmRpY2F0ZXMgcmVjZW50IGJ1dHRvbiBwcmVzcykgdGhlbiBhbmltYXRlIGdyZWVuIGhvdmVyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InKTtcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwuY29sb3InLCBkdXI6IDUwMCwgZnJvbTogXCIjMDBGRjAwXCIsIHRvOiBcIiMwMDAwMDBcIiB9KTtcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xuICAgIH1cbiAgfSxcblxuICBvbk9wdGlvblN3aXRjaDogZnVuY3Rpb24gKGV2dCwgZGlyZWN0aW9uKSB7XG4gICAgLy8gU3dpdGNoIHRvIHRoZSBuZXh0IG9wdGlvbiwgb3Igc3dpdGNoIGluIHRoZSBkaXJlY3Rpb24gb2YgdGhlIG1vc3QgcmVjZW50bHkgaG92ZXJlZCBkaXJlY3Rpb25hbCBhcnJvd1xuICAgIC8vIG1lbnU6IHNhdmUgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBtZW51IGVsZW1lbnRcbiAgICBjb25zdCBvbGRNZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VsZWN0T3B0aW9uc1JvdycpLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NlbGVjdGVkJylbMF07XG4gICAgY29uc29sZS5sb2cob2xkTWVudUVsKTtcblxuICAgIHZhciBvbGRTZWxlY3RlZE9wdGlvbkluZGV4ID0gcGFyc2VJbnQob2xkTWVudUVsLmdldEF0dHJpYnV0ZShcIm9wdGlvbmlkXCIpKTtcbiAgICBjb25zb2xlLmxvZyhzZWxlY3RlZE9wdGlvbkluZGV4KTtcbiAgICB2YXIgc2VsZWN0ZWRPcHRpb25JbmRleCA9IG9sZFNlbGVjdGVkT3B0aW9uSW5kZXg7XG5cbiAgICBpZiAodHlwZW9mIGRpcmVjdGlvbiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIHNob3VsZCB3ZSBzd2l0Y2ggdG8gbmV4dCBvciBwcmV2aW91cyBvcHRpb24/XG4gICAgICB2YXIgbGVmdEJ1dHRvbiA9IG5ldyBUSFJFRS5Db2xvcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93UmlnaHRcIikuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpLmcgPCBuZXcgVEhSRUUuQ29sb3IoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0xlZnRcIikuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpLmc7XG4gICAgICBkaXJlY3Rpb24gPSBsZWZ0QnV0dG9uID8gXCJwcmV2aW91c1wiIDogXCJuZXh0XCI7XG4gICAgICBjb25zb2xlLmxvZyhcImxlZnRCdXR0b24/IFwiICsgbGVmdEJ1dHRvbik7XG4gICAgICBjb25zb2xlLmxvZyhcImRpcmVjdGlvbj8gXCIgKyBkaXJlY3Rpb24pO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHRoaXMgc2hvdWxkIHJlZmxlY3QgdGhlIHBhcmVudCBlbGVtZW50IC8vbWVudTogb25seSBkZWFsIHdpdGggdHJhY2twYWQgZXZlbnRzIGZyb20gcmlnaHQgY29udHJvbGxlclxuICAgIGlmIChldnQudGFyZ2V0LmlkID09PSAnbGVmdENvbnRyb2xsZXInKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHNlbGVjdEVsID0gdGhpcy5lbDsgIC8vIFJlZmVyZW5jZSB0byB0aGUgY29tcG9uZW50J3MgZW50aXR5LlxuICAgIHZhciBzZWxlY3RlZE9wdGdyb3VwRWwgPSB0aGlzLmZldGNoT3B0aW9uR3JvdXBzKClbJ21tbW1fYWxpZW4nXTsgLy8gVE9ETyBzZWxlY3RlZCBPcHRncm91cCBzaG91bGQgYmUgZHluYW1pY1xuXG4gICAgLy9vcHRncm91cCBpcyBhbiBlbGVtZW50XG4gICAgY29uc29sZS5sb2coc2VsZWN0ZWRPcHRncm91cEVsKTtcbiAgICBjb25zb2xlLmxvZyhzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xuXG4gICAgaWYgKGRpcmVjdGlvbiA9PSAncHJldmlvdXMnKSB7XG4gICAgICAvLyBMRUZUIEJVVFRPTiBNRU5VIFNUQVJUID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgIHNlbGVjdGVkT3B0aW9uSW5kZXggLT0gMTtcbiAgICAgIGlmIChzZWxlY3RlZE9wdGlvbkluZGV4ID09IC0xKSB7c2VsZWN0ZWRPcHRpb25JbmRleCA9IHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZEVsZW1lbnRDb3VudCAtIDF9XG5cbiAgICAgIC8vIG1lbnU6IGFuaW1hdGUgYXJyb3cgTEVGVFxuICAgICAgdmFyIGFycm93TGVmdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dMZWZ0XCIpO1xuICAgICAgYXJyb3dMZWZ0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xuICAgICAgYXJyb3dMZWZ0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XG4gICAgICBhcnJvd0xlZnQucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJyk7XG4gICAgICBhcnJvd0xlZnQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XG4gICAgICBhcnJvd0xlZnQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XG4gICAgICBhcnJvd0xlZnQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJywgeyBwcm9wZXJ0eTogJ3NjYWxlJywgZHVyOiA1MDAsIGZyb206IFwiMC4wMDYgMC4wMDMgMC4wMDZcIiwgdG86IFwiMC4wMDQgMC4wMDIgMC4wMDRcIiB9KTtcblxuICAgICAgLy8gbWVudTogZ2V0IHRoZSBuZXdseSBzZWxlY3RlZCBtZW51IGVsZW1lbnRcbiAgICAgIGNvbnNvbGUubG9nKHNlbGVjdGVkT3B0aW9uSW5kZXgpO1xuICAgICAgY29uc3QgbmV3TWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbGVjdE9wdGlvbnNSb3cnKS5xdWVyeVNlbGVjdG9yQWxsKFwiW29wdGlvbmlkPSdcIiArIHNlbGVjdGVkT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xuICAgICAgY29uc29sZS5sb2cobmV3TWVudUVsKTtcblxuICAgICAgLy8gbWVudTogcmVtb3ZlIHNlbGVjdGVkIGNsYXNzIGFuZCBjaGFuZ2UgY29sb3JzXG4gICAgICBvbGRNZW51RWwuY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkXCIpO1xuICAgICAgbmV3TWVudUVsLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKTtcbiAgICAgIG9sZE1lbnVFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwib2JqZWN0TmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ2JtZm9udC10ZXh0JywgJ2NvbG9yJywgJ2dyYXknKTtcbiAgICAgIG5ld01lbnVFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwib2JqZWN0TmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ2JtZm9udC10ZXh0JywgJ2NvbG9yJywgJ3llbGxvdycpO1xuICAgICAgb2xkTWVudUVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJwcmV2aWV3RnJhbWVcIilbMF0uc2V0QXR0cmlidXRlKCdtYXRlcmlhbCcsICdjb2xvcicsICcjMjIyMjIyJyk7XG4gICAgICBuZXdNZW51RWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInByZXZpZXdGcmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ21hdGVyaWFsJywgJ2NvbG9yJywgJ3llbGxvdycpO1xuXG4gICAgICAvLyBtZW51OiBzbGlkZSB0aGUgbWVudSBsaXN0IHJvdyBSSUdIVCBieSAxXG4gICAgICBjb25zdCBzZWxlY3RPcHRpb25zUm93RWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NlbGVjdE9wdGlvbnNSb3dcIik7XG4gICAgICAvLyB1c2UgdGhlIGRlc2lyZWRQb3NpdGlvbiBhdHRyaWJ1dGUgKGlmIGV4aXN0cykgaW5zdGVhZCBvZiBvYmplY3QzRCBwb3NpdGlvbiBhcyBhbmltYXRpb24gbWF5IG5vdCBiZSBkb25lIHlldFxuICAgICAgaWYgKHNlbGVjdE9wdGlvbnNSb3dFbC5oYXNBdHRyaWJ1dGUoXCJkZXNpcmVkUG9zaXRpb25cIikpIHtcbiAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0gc2VsZWN0T3B0aW9uc1Jvd0VsLmdldEF0dHJpYnV0ZShcImRlc2lyZWRQb3NpdGlvblwiKTtcbiAgICAgICAgdmFyIG5ld1ggPSBwYXJzZUZsb2F0KG9sZFBvc2l0aW9uLnNwbGl0KFwiIFwiKVswXSkgKyAwLjA3NTtcbiAgICAgICAgdmFyIG5ld1Bvc2l0aW9uU3RyaW5nID0gbmV3WC50b1N0cmluZygpICsgXCIgXCIgKyBvbGRQb3NpdGlvbi5zcGxpdChcIiBcIilbMV0gKyBcIiBcIiArIG9sZFBvc2l0aW9uLnNwbGl0KFwiIFwiKVsyXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBvbGRQb3NpdGlvbiA9IHNlbGVjdE9wdGlvbnNSb3dFbC5vYmplY3QzRC5wb3NpdGlvbjtcbiAgICAgICAgdmFyIG5ld1ggPSBvbGRQb3NpdGlvbi54ICsgMC4wNzU7IC8vIHRoaXMgY291bGQgYmUgYSB2YXJpYWJsZSBhdCB0aGUgY29tcG9uZW50IGxldmVsXG4gICAgICAgIHZhciBuZXdQb3NpdGlvblN0cmluZyA9IG5ld1gudG9TdHJpbmcoKSArIFwiIFwiICsgb2xkUG9zaXRpb24ueSArIFwiIFwiICsgb2xkUG9zaXRpb24uejtcbiAgICAgIH1cbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2xpZGUnKTtcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2xpZGUnLCB7IHByb3BlcnR5OiAncG9zaXRpb24nLCBkdXI6IDUwMCwgZnJvbTogb2xkUG9zaXRpb24sIHRvOiBuZXdQb3NpdGlvblN0cmluZyB9KTtcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5zZXRBdHRyaWJ1dGUoJ2Rlc2lyZWRQb3NpdGlvbicsIG5ld1Bvc2l0aW9uU3RyaW5nKTtcblxuICAgICAgLy8gbWVudTogbWFrZSB0aGUgaGlkZGVuIG1vc3QgTEVGVG1vc3Qgb2JqZWN0ICgtMyBmcm9tIG9sZE1lbnVFbCBpbmRleCkgdmlzaWJsZVxuICAgICAgdmFyIG5ld2x5VmlzaWJsZU9wdGlvbkluZGV4ID0gb2xkU2VsZWN0ZWRPcHRpb25JbmRleCAtIDM7XG4gICAgICBpZiAobmV3bHlWaXNpYmxlT3B0aW9uSW5kZXggPCAwKSB7bmV3bHlWaXNpYmxlT3B0aW9uSW5kZXggPSBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQgLSAzICsgb2xkU2VsZWN0ZWRPcHRpb25JbmRleH07XG4gICAgICB2YXIgbmV3bHlWaXNpYmxlT3B0aW9uRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VsZWN0T3B0aW9uc1JvdycpLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbb3B0aW9uaWQ9J1wiICsgbmV3bHlWaXNpYmxlT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xuXG4gICAgICAvLyBtYWtlIHZpc2libGUgYW5kIGFuaW1hdGVcbiAgICAgIG5ld2x5VmlzaWJsZU9wdGlvbkVsLnNldEF0dHJpYnV0ZSgndmlzaWJsZScsJ3RydWUnKTtcbiAgICAgIG5ld2x5VmlzaWJsZU9wdGlvbkVsLnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uJyk7XG4gICAgICBuZXdseVZpc2libGVPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbicsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiAnMC41IDAuNSAwLjUnLCB0bzogJzEuMCAxLjAgMS4wJyB9KTtcblxuICAgICAgLy8gbWVudTogZGVzdHJveSB0aGUgaGlkZGVuIG1vc3QgUklHSFRtb3N0IG9iamVjdCAoKzMgZnJvbSBvbGRNZW51RWwgaW5kZXgpXG4gICAgICB2YXIgbmV3bHlSZW1vdmVkT3B0aW9uSW5kZXggPSBvbGRTZWxlY3RlZE9wdGlvbkluZGV4ICsgMztcbiAgICAgIGlmIChuZXdseVJlbW92ZWRPcHRpb25JbmRleCA+IHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZEVsZW1lbnRDb3VudCkge25ld2x5UmVtb3ZlZE9wdGlvbkluZGV4ID0gb2xkU2VsZWN0ZWRPcHRpb25JbmRleCArIDMgLSBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnR9O1xuICAgICAgdmFyIG5ld2x5UmVtb3ZlZE9wdGlvbkVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbGVjdE9wdGlvbnNSb3cnKS5xdWVyeVNlbGVjdG9yQWxsKFwiW29wdGlvbmlkPSdcIiArIG5ld2x5UmVtb3ZlZE9wdGlvbkluZGV4ICsgXCInXVwiKVswXTtcbiAgICAgIG5ld2x5UmVtb3ZlZE9wdGlvbkVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobmV3bHlSZW1vdmVkT3B0aW9uRWwpO1xuXG4gICAgICAvLyBtZW51OiBtYWtlIHRoZSBzZWNvbmQgUklHSFRtb3N0IG9iamVjdCAoKzIgZnJvbSBvbGRNZW51RWwgaW5kZXgpIGludmlzaWJsZVxuICAgICAgdmFyIG5ld2x5SW52aXNpYmxlT3B0aW9uSW5kZXggPSBvbGRTZWxlY3RlZE9wdGlvbkluZGV4ICsgMjtcbiAgICAgIGlmIChuZXdseUludmlzaWJsZU9wdGlvbkluZGV4ID4gc2VsZWN0ZWRPcHRncm91cEVsLmNoaWxkRWxlbWVudENvdW50KSB7bmV3bHlJbnZpc2libGVPcHRpb25JbmRleCA9IG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggKyAyIC0gc2VsZWN0ZWRPcHRncm91cEVsLmNoaWxkRWxlbWVudENvdW50fTtcbiAgICAgIHZhciBuZXdseUludmlzaWJsZU9wdGlvbkVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbGVjdE9wdGlvbnNSb3cnKS5xdWVyeVNlbGVjdG9yQWxsKFwiW29wdGlvbmlkPSdcIiArIG5ld2x5SW52aXNpYmxlT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xuICAgICAgbmV3bHlJbnZpc2libGVPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ3Zpc2libGUnLCAnZmFsc2UnKTtcblxuICAgICAgLy8gbWVudTogQ3JlYXRlIHRoZSBuZXh0IExFRlRtb3N0IG9iamVjdCBwcmV2aWV3ICgtNCBmcm9tIG9sZE1lbnVFbCBpbmRleCkgYnV0IGtlZXAgaXQgaGlkZGVuIHVudGlsIGl0J3MgbmVlZGVkXG4gICAgICB2YXIgbmV3bHlDcmVhdGVkT3B0aW9uRWwgPSBuZXdseVZpc2libGVPcHRpb25FbC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ3Zpc2libGUnLCAnZmFsc2UnKTtcblxuICAgICAgdmFyIG5ld2x5Q3JlYXRlZE9wdGlvbkluZGV4ID0gb2xkU2VsZWN0ZWRPcHRpb25JbmRleCAtIDQ7XG4gICAgICBpZiAobmV3bHlDcmVhdGVkT3B0aW9uSW5kZXggPCAwKSB7bmV3bHlDcmVhdGVkT3B0aW9uSW5kZXggPSBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQgLSA0ICsgb2xkU2VsZWN0ZWRPcHRpb25JbmRleH07XG5cbiAgICAgIC8vIGdldCB0aGUgYWN0dWFsIFwib3B0aW9uXCIgZWxlbWVudCB0aGF0IGlzIHRoZSBzb3VyY2Ugb2YgdHJ1dGggZm9yIHZhbHVlLCBpbWFnZSBzcmMgYW5kIGxhYmVsIHNvIHRoYXQgd2UgY2FuIHBvcHVsYXRlIHRoZSBuZXcgbWVudSBvcHRpb25cbiAgICAgIHZhciBzb3VyY2VPcHRpb25FbCA9IHNlbGVjdGVkT3B0Z3JvdXBFbC5xdWVyeVNlbGVjdG9yQWxsKFwiW2luZGV4PSdcIiArIG5ld2x5Q3JlYXRlZE9wdGlvbkluZGV4ICsgXCInXVwiKVswXTtcblxuICAgICAgbmV3bHlDcmVhdGVkT3B0aW9uRWwuc2V0QXR0cmlidXRlKCdvcHRpb25pZCcsIG5ld2x5Q3JlYXRlZE9wdGlvbkluZGV4KTtcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLnNldEF0dHJpYnV0ZSgnaWQnLCAnbWVudScgKyBuZXdseUNyZWF0ZWRPcHRpb25JbmRleCk7XG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgc291cmNlT3B0aW9uRWwuZ2V0QXR0cmlidXRlKFwidmFsdWVcIikpO1xuXG4gICAgICB2YXIgbmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24gPSBuZXdseVZpc2libGVPcHRpb25FbC5vYmplY3QzRC5wb3NpdGlvbjtcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCAobmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24ueCAtIDAuMDc1KSArIFwiIFwiICsgbmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24ueSArIFwiIFwiICsgbmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24ueik7XG5cbiAgICAgIC8vIG1lbnU6IGFkZCB0aGUgbmV3bHkgY2xvbmVkIGFuZCBtb2RpZmllZCBtZW51IG9iamVjdCBwcmV2aWV3IHRvIHRoZSBkb21cbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5pbnNlcnRCZWZvcmUoIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLCBzZWxlY3RPcHRpb25zUm93RWwuZmlyc3RDaGlsZCApOyAvLy8gVE9ETyBZTyBJUyBUSElTIE5PVCBXT1JLSU5HP1xuXG4gICAgICAvLyBtZW51OiBnZXQgY2hpbGQgZWxlbWVudHMgZm9yIGltYWdlIGFuZCBuYW1lLCBwb3B1bGF0ZSBib3RoIGFwcHJvcHJpYXRlbHlcbiAgICAgIGNvbnNvbGUubG9nKG5ld2x5Q3JlYXRlZE9wdGlvbkluZGV4KTtcbiAgICAgIHZhciBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZW51XCIgKyBuZXdseUNyZWF0ZWRPcHRpb25JbmRleCk7XG4gICAgICBjb25zb2xlLmxvZyhhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsKTtcblxuICAgICAgYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJldmlld0ltYWdlXCIpWzBdLnNldEF0dHJpYnV0ZSgnc3JjJywgc291cmNlT3B0aW9uRWwuZ2V0QXR0cmlidXRlKFwic3JjXCIpKVxuICAgICAgYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwib2JqZWN0TmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ2JtZm9udC10ZXh0JywgJ3RleHQnLCBzb3VyY2VPcHRpb25FbC50ZXh0KTtcbiAgICAgIGFwcGVuZGVkTmV3bHlDcmVhdGVkT3B0aW9uRWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm9iamVjdE5hbWVcIilbMF0uc2V0QXR0cmlidXRlKCdibWZvbnQtdGV4dCcsICdjb2xvcicsICcjNzQ3NDc0Jyk7XG5cbiAgICAvLyBMRUZUIE1FTlUgRU5EID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbmNyZW1lbnQgYnkgMSBhbmQgc3RhcnQgb3ZlciBhdCAwIGlmIHJlYWNoZWQgdGhlIGVuZFxuICAgICAgb2JqZWN0SWQgKz0gMTtcbiAgICAgIGlmIChvYmplY3RJZCA9PSBvYmplY3RBcnJheS5sZW5ndGgpIHtvYmplY3RJZCA9IDB9XG5cbiAgICAgIC8vIFJJR0hUIEJVVFRPTiBNRU5VIFNUQVJUID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgIC8vIG1lbnU6IGFuaW1hdGUgYXJyb3cgcmlnaHRcbiAgICAgIHZhciBhcnJvd1JpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1JpZ2h0XCIpO1xuICAgICAgYXJyb3dSaWdodC5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InKTtcbiAgICAgIGFycm93UmlnaHQucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknKTtcbiAgICAgIGFycm93UmlnaHQucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJyk7XG4gICAgICBhcnJvd1JpZ2h0LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5jb2xvcicsIGR1cjogNTAwLCBmcm9tOiBcIiNGRkZGMDBcIiwgdG86IFwiIzAwMDAwMFwiIH0pO1xuICAgICAgYXJyb3dSaWdodC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5vcGFjaXR5JywgZHVyOiA1MDAsIGZyb206IFwiMVwiLCB0bzogXCIwLjVcIiB9KTtcbiAgICAgIGFycm93UmlnaHQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJywgeyBwcm9wZXJ0eTogJ3NjYWxlJywgZHVyOiA1MDAsIGZyb206IFwiLTAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIi0wLjAwNCAwLjAwMiAwLjAwNFwiIH0pO1xuXG4gICAgICAvLyBtZW51OiBnZXQgdGhlIG5ld2x5IHNlbGVjdGVkIG1lbnUgZWxlbWVudFxuICAgICAgY29uc3QgbmV3TWVudUVsID0gJChcImEtZW50aXR5I21lbnVPYmplY3RMaXN0XCIpLmZpbmQoXCJhLWVudGl0eVtvYmplY3RJZD1cIiArIG9iamVjdElkICsgXCJdXCIpO1xuXG4gICAgICAvLyBtZW51OiByZW1vdmUgc2VsZWN0ZWQgY2xhc3MgYW5kIGNoYW5nZSBjb2xvcnNcbiAgICAgIG9sZE1lbnVFbC5yZW1vdmVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAgbmV3TWVudUVsLmFkZENsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICBvbGRNZW51RWwuY2hpbGRyZW4oXCIub2JqZWN0TmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ2JtZm9udC10ZXh0JywgJ2NvbG9yJywgJ2dyYXknKTtcbiAgICAgIG5ld01lbnVFbC5jaGlsZHJlbihcIi5vYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAneWVsbG93Jyk7XG4gICAgICBvbGRNZW51RWwuY2hpbGRyZW4oXCIucHJldmlld0ZyYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCAnY29sb3InLCAnIzIyMjIyMicpO1xuICAgICAgbmV3TWVudUVsLmNoaWxkcmVuKFwiLnByZXZpZXdGcmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ21hdGVyaWFsJywgJ2NvbG9yJywgJ3llbGxvdycpO1xuXG4gICAgICAvLyBtZW51OiBzbGlkZSB0aGUgbWVudSBsaXN0IGxlZnQgYnkgMVxuICAgICAgY29uc3Qgc2VsZWN0T3B0aW9uc1Jvd0VsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51T2JqZWN0TGlzdFwiKTtcbiAgICAgIC8vIHVzZSB0aGUgZGVzaXJlZFBvc2l0aW9uIGF0dHJpYnV0ZSAoaWYgZXhpc3RzKSBpbnN0ZWFkIG9mIG9iamVjdDNEIHBvc2l0aW9uIGFzIGFuaW1hdGlvbiBtYXkgbm90IGJlIGRvbmUgeWV0XG4gICAgICBpZiAoc2VsZWN0T3B0aW9uc1Jvd0VsLmhhc0F0dHJpYnV0ZShcImRlc2lyZWRQb3NpdGlvblwiKSkge1xuICAgICAgICB2YXIgb2xkUG9zaXRpb24gPSBzZWxlY3RPcHRpb25zUm93RWwuZ2V0QXR0cmlidXRlKFwiZGVzaXJlZFBvc2l0aW9uXCIpO1xuICAgICAgICB2YXIgbmV3WCA9IHBhcnNlRmxvYXQob2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzBdKSAtIDAuMDc1O1xuICAgICAgICB2YXIgbmV3UG9zaXRpb25TdHJpbmcgPSBuZXdYLnRvU3RyaW5nKCkgKyBcIiBcIiArIG9sZFBvc2l0aW9uLnNwbGl0KFwiIFwiKVsxXSArIFwiIFwiICsgb2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzJdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0gc2VsZWN0T3B0aW9uc1Jvd0VsLm9iamVjdDNELnBvc2l0aW9uO1xuICAgICAgICB2YXIgbmV3WCA9IG9sZFBvc2l0aW9uLnggLSAwLjA3NTsgLy8gdGhpcyBzaG91bGQgYmUgYSB2YXJpYWJsZSBzb29uXG4gICAgICAgIHZhciBuZXdQb3NpdGlvblN0cmluZyA9IG5ld1gudG9TdHJpbmcoKSArIFwiIFwiICsgb2xkUG9zaXRpb24ueSArIFwiIFwiICsgb2xkUG9zaXRpb24uejtcbiAgICAgIH1cbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2xpZGUnKTtcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2xpZGUnLCB7IHByb3BlcnR5OiAncG9zaXRpb24nLCBkdXI6IDUwMCwgZnJvbTogb2xkUG9zaXRpb24sIHRvOiBuZXdQb3NpdGlvblN0cmluZyB9KTtcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5zZXRBdHRyaWJ1dGUoJ2Rlc2lyZWRQb3NpdGlvbicsIG5ld1Bvc2l0aW9uU3RyaW5nKTtcblxuICAgICAgLy8gbWVudTogbWFrZSB0aGUgaGlkZGVuIG1vc3QgcmlnaHRtb3N0IG9iamVjdCAoKzMgZnJvbSBvbGRNZW51RWwgaW5kZXgpIHZpc2libGVcbiAgICAgIHZhciB0aGlyZE1lbnVFbCA9IG9sZE1lbnVFbFswXS5uZXh0RWxlbWVudFNpYmxpbmcubmV4dEVsZW1lbnRTaWJsaW5nLm5leHRFbGVtZW50U2libGluZztcblxuICAgICAgdGhpcmRNZW51RWwuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywndHJ1ZScpO1xuXG4gICAgICAvLyBUT0RPIE5PVCBXT1JLSU5HIEFGVEVSIEZJUlNUIElURVJBVElPTlxuICAgICAgLy8gdGhpcmRNZW51RWwucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb24nKTtcbiAgICAgIHRoaXJkTWVudUVsLnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uJywgeyBwcm9wZXJ0eTogJ3NjYWxlJywgZHVyOiA1MDAsIGZyb206ICcwLjUgMC41IDAuNScsIHRvOiAnMS4wIDEuMCAxLjAnIH0pO1xuXG4gICAgICAvLyBtZW51OiBkZXN0cm95IHRoZSBoaWRkZW4gbW9zdCBsZWZ0bW9zdCBvYmplY3QgKC0zIGZyb20gb2xkTWVudUVsIGluZGV4KVxuICAgICAgdmFyIG5lZ1RoaXJkTWVudUVsID0gb2xkTWVudUVsWzBdLnByZXZpb3VzRWxlbWVudFNpYmxpbmcucHJldmlvdXNFbGVtZW50U2libGluZy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICAgICAgbmVnVGhpcmRNZW51RWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuZWdUaGlyZE1lbnVFbCk7XG5cbiAgICAgIC8vIG1lbnU6IG1ha2UgdGhlIHNlY29uZCBsZWZ0bW9zdCBvYmplY3QgKC0yIGZyb20gb2xkTWVudUVsIGluZGV4KSBpbnZpc2libGVcbiAgICAgIHZhciBuZWdTZWNvbmRNZW51RWwgPSBvbGRNZW51RWxbMF0ucHJldmlvdXNFbGVtZW50U2libGluZy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICAgICAgbmVnU2Vjb25kTWVudUVsLnNldEF0dHJpYnV0ZSgndmlzaWJsZScsICdmYWxzZScpO1xuXG4gICAgICAvLyBtZW51OiBDcmVhdGUgdGhlIG5leHQgcmlnaHRtb3N0IG9iamVjdCBwcmV2aWV3ICgrNCBmcm9tIG9sZE1lbnVFbCBpbmRleCkgYnV0IGtlZXAgaXQgaGlkZGVuIHVudGlsIGl0J3MgbmVlZGVkXG4gICAgICB2YXIgZm91cnRoTWVudUVsID0gdGhpcmRNZW51RWwuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgZm91cnRoTWVudUVsLnNldEF0dHJpYnV0ZSgndmlzaWJsZScsICdmYWxzZScpO1xuICAgICAgLy8gaWYgb2JqZWN0SWQgKyAzIDwgbGVuZ3RoIHRoZW4gdXNlIHRoaXMgbnVtYmVyXG4gICAgICAvLyBpZiBvYmplY3RJZCArIDMgPiBsZW5ndGgsIHRoZW4gdXNlIHRoaXMgcmVxdWVzdGVkIG51bWJlciBtaW51cyB0aGUgbGVuZ3RoIG9mIHRoZSBvYmplY3QgYXJyYXlcbiAgICAgIHZhciBmb3VydGhNZW51T2JqZWN0SUQgPSAob2JqZWN0SWQgKyAzIDwgb2JqZWN0QXJyYXkubGVuZ3RoKSA/IChvYmplY3RJZCArIDMpIDogKG9iamVjdElkICsgMyAtIG9iamVjdEFycmF5Lmxlbmd0aCk7XG4gICAgICBmb3VydGhNZW51RWwuc2V0QXR0cmlidXRlKCdvYmplY3RJZCcsIGZvdXJ0aE1lbnVPYmplY3RJRCk7XG4gICAgICBmb3VydGhNZW51RWwuc2V0QXR0cmlidXRlKCdpZCcsICdtZW51JyArIGZvdXJ0aE1lbnVPYmplY3RJRCk7XG4gICAgICBmb3VydGhNZW51RWwuc2V0QXR0cmlidXRlKCdmaWxlJywgb2JqZWN0QXJyYXlbZm91cnRoTWVudU9iamVjdElEXS5maWxlKTtcbiAgICAgIHRoaXJkTWVudUVsUG9zaXRpb24gPSB0aGlyZE1lbnVFbC5vYmplY3QzRC5wb3NpdGlvbjtcbiAgICAgIGZvdXJ0aE1lbnVFbC5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgKHRoaXJkTWVudUVsUG9zaXRpb24ueCArIDAuMDc1KSArIFwiIFwiICsgdGhpcmRNZW51RWxQb3NpdGlvbi55ICsgXCIgXCIgKyB0aGlyZE1lbnVFbFBvc2l0aW9uLnopO1xuXG4gICAgICAvLyBtZW51OiBhZGQgdGhlIG5ld2x5IGNsb25lZCBhbmQgbW9kaWZpZWQgbWVudSBvYmplY3QgcHJldmlld1xuICAgICAgc2VsZWN0T3B0aW9uc1Jvd0VsLmFwcGVuZENoaWxkKGZvdXJ0aE1lbnVFbCk7XG5cbiAgICAgIC8vIG1lbnU6IGdldCBjaGlsZCBlbGVtZW50cyBmb3IgaW1hZ2UgYW5kIG5hbWUsIHBvcHVsYXRlIGJvdGggYXBwcm9wcmlhdGVseVxuICAgICAgdmFyIGFwcGVuZGVkRm91cnRoTWVudUVsID0gJCgnI21lbnUnICsgKGZvdXJ0aE1lbnVPYmplY3RJRCkpO1xuXG4gICAgICBhcHBlbmRlZEZvdXJ0aE1lbnVFbC5jaGlsZHJlbihcIi5wcmV2aWV3SW1hZ2VcIilbMF0uc2V0QXR0cmlidXRlKCdzcmMnLCAnYXNzZXRzL3ByZXZpZXcvJyArIG9iamVjdEFycmF5W2ZvdXJ0aE1lbnVPYmplY3RJRF0uZmlsZSArICcuanBnJylcbiAgICAgIGFwcGVuZGVkRm91cnRoTWVudUVsLmNoaWxkcmVuKFwiLm9iamVjdE5hbWVcIilbMF0uc2V0QXR0cmlidXRlKCdibWZvbnQtdGV4dCcsICd0ZXh0JywgaHVtYW5pemUob2JqZWN0QXJyYXlbZm91cnRoTWVudU9iamVjdElEXS5maWxlKSk7XG4gICAgICBhcHBlbmRlZEZvdXJ0aE1lbnVFbC5jaGlsZHJlbihcIi5vYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAnIzc0NzQ3NCcpO1xuICAgICAgLy8gUklHSFQgQlVUVE9OIE1FTlUgRU5EID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICB9XG5cblxuICB9XG5cbn0pO1xuXG4vKlxuXG5PcmlnaW5hbCBNZW51IGh0bWxcblxuPGEtZW50aXR5IGlkPVwibWVudVwiIHNjYWxlPVwiMC43IDAuNyAwLjdcIiBwb3NpdGlvbj1cIjAgMC4wNSAwLjA4XCIgcm90YXRpb249XCItODUgMCAwXCI+XG4gICAgIDxhLWJveCBpZD1cIm1lbnVGcmFtZVwiIHNjYWxlPVwiMC40IDAuMTUgMC4wMDVcIiBwb3NpdGlvbj1cIjAgMCAtMC4wMDc1XCIgIG1hdGVyaWFsPVwib3BhY2l0eTogMC41OyB0cmFuc3BhcmVudDogdHJ1ZTsgY29sb3I6ICMwMDAwMDBcIj48L2EtYm94PlxuICAgICA8YS1lbnRpdHkgaWQ9XCJncm91cFRleHRcIiBwb3NpdGlvbj1cIi0wLjE4IDAuMDQ1IC0wLjAwM1wiIHNjYWxlPVwiMC4xMjUgMC4xMjUgMC4xMjVcIiBibWZvbnQtdGV4dD1cInRleHQ6IEFMSUVOUzsgY29sb3I6ICM3NDc0NzRcIj48L2EtZW50aXR5PlxuXG4gICAgIDxhLWVudGl0eSBpZD1cImFycm93UmlnaHRcIiBwb3NpdGlvbj1cIjAuMjI1IDAgMFwiIHJvdGF0aW9uPVwiOTAgMTgwIDBcIiBzY2FsZT1cIi0wLjAwNCAwLjAwMiAwLjAwNFwiIG9iai1tb2RlbD1cIm9iajojZW52X2Fycm93XCIgbWF0ZXJpYWw9XCJvcGFjaXR5OiAwLjU7IHRyYW5zcGFyZW50OiB0cnVlOyBjb2xvcjogIzAwMDAwMFwiPjwvYS1lbnRpdHk+XG4gICAgIDxhLWVudGl0eSBpZD1cImFycm93TGVmdFwiIHBvc2l0aW9uPVwiLTAuMjI1IDAgMFwiIHJvdGF0aW9uPVwiOTAgMTgwIDBcIiBzY2FsZT1cIjAuMDA0IDAuMDAyIDAuMDA0XCIgb2JqLW1vZGVsPVwib2JqOiNlbnZfYXJyb3dcIiBtYXRlcmlhbD1cIm9wYWNpdHk6MC41OyB0cmFuc3BhcmVudDp0cnVlOyBjb2xvcjojMDAwMDAwXCI+PC9hLWVudGl0eT5cbiAgICAgPGEtZW50aXR5IGlkPVwiYXJyb3dVcFwiIHBvc2l0aW9uPVwiMCAwLjEgMFwiIHJvdGF0aW9uPVwiMCAyNzAgOTBcIiBzY2FsZT1cIjAuMDA0IDAuMDAyIDAuMDA0XCIgb2JqLW1vZGVsPVwib2JqOiNlbnZfYXJyb3dcIiBtYXRlcmlhbD1cIm9wYWNpdHk6IDAuNTsgdHJhbnNwYXJlbnQ6IHRydWU7IGNvbG9yOiAjMDAwMDAwXCI+PC9hLWVudGl0eT5cbiAgICAgPGEtZW50aXR5IGlkPVwiYXJyb3dEb3duXCIgcG9zaXRpb249XCIwIC0wLjEgMFwiIHJvdGF0aW9uPVwiMCAyNzAgOTBcIiBzY2FsZT1cIi0wLjAwNCAwLjAwMiAwLjAwNFwiIG9iai1tb2RlbD1cIm9iajojZW52X2Fycm93XCIgbWF0ZXJpYWw9XCJvcGFjaXR5OiAwLjU7IHRyYW5zcGFyZW50OiB0cnVlOyBjb2xvcjogIzAwMDAwMFwiPjwvYS1lbnRpdHk+XG5cbiAgICAgPGEtZW50aXR5IGlkPVwibWVudU9iamVjdExpc3RcIj5cbiAgICAgICA8YS1lbnRpdHkgaWQ9XCJtZW51MzJcIiB2aXNpYmxlPVwiZmFsc2VcIiBjbGFzcz1cInByZXZpZXdcIiBvYmplY3RJZD1cIjMyXCIgZmlsZT1cImFsaWVuX3Rvb2wxXCIgb2JqZWN0R3JvdXA9XCJtbW1tX2FsaWVuXCIgcG9zaXRpb249XCItMC4yMjUgMCAwXCI+XG4gICAgICAgICA8YS1ib3ggY2xhc3M9XCJwcmV2aWV3RnJhbWVcIiBwb3NpdGlvbj1cIjAgMCAtMC4wMDNcIiBzY2FsZT1cIjAuMDYgMC4wNiAwLjAwNVwiIG1hdGVyaWFsPVwiY29sb3I6ICMyMjIyMjJcIj48L2EtYm94PlxuICAgICAgICAgPGEtaW1hZ2UgY2xhc3M9XCJwcmV2aWV3SW1hZ2VcIiBzY2FsZT1cIjAuMDUgMC4wNSAwLjA1XCIgc3JjPVwiYXNzZXRzL3ByZXZpZXcvYWxpZW5fdG9vbDEuanBnXCIgPjwvYS1pbWFnZT5cbiAgICAgICAgIDxhLWVudGl0eSBjbGFzcz1cIm9iamVjdE5hbWVcIiBwb3NpdGlvbj1cIi0wLjAyNSAtMC4wNCAtMC4wMDNcIiBzY2FsZT1cIjAuMDUgMC4wNSAwLjA1XCIgYm1mb250LXRleHQ9XCJ0ZXh0OiBBbGllbiBUb29sMTsgY29sb3I6ICM3NDc0NzRcIj48L2EtZW50aXR5PlxuICAgICAgIDwvYS1lbnRpdHk+XG5cbiAgICAgICA8YS1lbnRpdHkgaWQ9XCJtZW51MzNcIiBjbGFzcz1cInByZXZpZXdcIiBvYmplY3RJZD1cIjMzXCIgZmlsZT1cImFsaWVuX3Rvb2wyXCIgb2JqZWN0R3JvdXA9XCJtbW1tX2FsaWVuXCIgcG9zaXRpb249XCItMC4xNSAwIDBcIj5cbiAgICAgICAgIDxhLWJveCBjbGFzcz1cInByZXZpZXdGcmFtZVwiIHBvc2l0aW9uPVwiMCAwIC0wLjAwM1wiIHNjYWxlPVwiMC4wNiAwLjA2IDAuMDA1XCIgbWF0ZXJpYWw9XCJjb2xvcjogIzIyMjIyMlwiPjwvYS1ib3g+XG4gICAgICAgICA8YS1pbWFnZSBjbGFzcz1cInByZXZpZXdJbWFnZVwiIHNjYWxlPVwiMC4wNSAwLjA1IDAuMDVcIiBzcmM9XCJhc3NldHMvcHJldmlldy9hbGllbl90b29sMi5qcGdcIiA+PC9hLWltYWdlPlxuICAgICAgICAgPGEtZW50aXR5IGNsYXNzPVwib2JqZWN0TmFtZVwiIHBvc2l0aW9uPVwiLTAuMDI1IC0wLjA0IC0wLjAwM1wiIHNjYWxlPVwiMC4wNSAwLjA1IDAuMDVcIiBibWZvbnQtdGV4dD1cInRleHQ6IEFsaWVuIFRvb2wyOyBjb2xvcjogIzc0NzQ3NFwiPjwvYS1lbnRpdHk+XG4gICAgICAgPC9hLWVudGl0eT5cblxuICAgICAgIDxhLWVudGl0eSBpZD1cIm1lbnUzNFwiIGNsYXNzPVwicHJldmlld1wiIG9iamVjdElkPVwiMzRcIiBmaWxlPVwiYWxpZW5fdG9vbDNcIiBvYmplY3RHcm91cD1cIm1tbW1fYWxpZW5cIiBwb3NpdGlvbj1cIi0wLjA3NSAwIDBcIj5cbiAgICAgICAgIDxhLWJveCBjbGFzcz1cInByZXZpZXdGcmFtZVwiIHBvc2l0aW9uPVwiMCAwIC0wLjAwM1wiIHNjYWxlPVwiMC4wNiAwLjA2IDAuMDA1XCIgbWF0ZXJpYWw9XCJjb2xvcjogIzIyMjIyMlwiPjwvYS1ib3g+XG4gICAgICAgICA8YS1pbWFnZSBjbGFzcz1cInByZXZpZXdJbWFnZVwiIHNjYWxlPVwiMC4wNSAwLjA1IDAuMDVcIiBzcmM9XCJhc3NldHMvcHJldmlldy9hbGllbl90b29sMy5qcGdcIiA+PC9hLWltYWdlPlxuICAgICAgICAgPGEtZW50aXR5IGNsYXNzPVwib2JqZWN0TmFtZVwiIHBvc2l0aW9uPVwiLTAuMDI1IC0wLjA0IC0wLjAwM1wiIHNjYWxlPVwiMC4wNSAwLjA1IDAuMDVcIiBibWZvbnQtdGV4dD1cInRleHQ6IEFsaWVuIFRvb2wzOyBjb2xvcjogIzc0NzQ3NFwiPjwvYS1lbnRpdHk+XG4gICAgICAgPC9hLWVudGl0eT5cblxuICAgICAgIDxhLWVudGl0eSBpZD1cIm1lbnUwXCIgY2xhc3M9XCJwcmV2aWV3IHNlbGVjdGVkXCIgb2JqZWN0SWQ9XCIwXCIgZmlsZT1cImFsaWVuX2JvdDFcIiBvYmplY3RHcm91cD1cIm1tbW1fYWxpZW5cIiBwb3NpdGlvbj1cIjAgMCAwXCI+XG4gICAgICAgICA8YS1ib3ggY2xhc3M9XCJwcmV2aWV3RnJhbWVcIiBwb3NpdGlvbj1cIjAgMCAtMC4wMDNcIiBzY2FsZT1cIjAuMDYgMC4wNiAwLjAwNVwiIG1hdGVyaWFsPVwiY29sb3I6IHllbGxvd1wiPjwvYS1ib3g+XG4gICAgICAgICA8YS1pbWFnZSBjbGFzcz1cInByZXZpZXdJbWFnZVwiIHNjYWxlPVwiMC4wNSAwLjA1IDAuMDVcIiBzcmM9XCJhc3NldHMvcHJldmlldy9hbGllbl9ib3QxLmpwZ1wiID48L2EtaW1hZ2U+XG4gICAgICAgICA8YS1lbnRpdHkgY2xhc3M9XCJvYmplY3ROYW1lXCIgcG9zaXRpb249XCItMC4wMjUgLTAuMDQgLTAuMDAzXCIgc2NhbGU9XCIwLjA1IDAuMDUgMC4wNVwiIGJtZm9udC10ZXh0PVwidGV4dDogQWxpZW4gQm90MTsgY29sb3I6IHllbGxvdzsgb3BhY2l0eTogMlwiPjwvYS1lbnRpdHk+XG4gICAgICAgPC9hLWVudGl0eT5cblxuICAgICAgIDxhLWVudGl0eSBpZD1cIm1lbnUxXCIgY2xhc3M9XCJwcmV2aWV3XCIgb2JqZWN0SWQ9XCIxXCIgZmlsZT1cImFsaWVuX2JvdDJcIiBvYmplY3RHcm91cD1cIm1tbW1fYWxpZW5cIiBwb3NpdGlvbj1cIjAuMDc1IDAgMFwiPlxuICAgICAgICAgPGEtYm94IGNsYXNzPVwicHJldmlld0ZyYW1lXCIgcG9zaXRpb249XCIwIDAgLTAuMDAzXCIgc2NhbGU9XCIwLjA2IDAuMDYgMC4wMDVcIiBtYXRlcmlhbD1cImNvbG9yOiAjMjIyMjIyXCI+PC9hLWJveD5cbiAgICAgICAgIDxhLWltYWdlIGNsYXNzPVwicHJldmlld0ltYWdlXCIgc2NhbGU9XCIwLjA1IDAuMDUgMC4wNVwiIHNyYz1cImFzc2V0cy9wcmV2aWV3L2FsaWVuX2JvdDIuanBnXCIgPjwvYS1pbWFnZT5cbiAgICAgICAgIDxhLWVudGl0eSBjbGFzcz1cIm9iamVjdE5hbWVcIiBwb3NpdGlvbj1cIi0wLjAyNSAtMC4wNCAtMC4wMDNcIiBzY2FsZT1cIjAuMDUgMC4wNSAwLjA1XCIgYm1mb250LXRleHQ9XCJ0ZXh0OiBBbGllbiBCb3QyOyBjb2xvcjogIzc0NzQ3NFwiPjwvYS1lbnRpdHk+XG4gICAgICAgPC9hLWVudGl0eT5cblxuICAgICAgIDxhLWVudGl0eSBpZD1cIm1lbnUyXCIgY2xhc3M9XCJwcmV2aWV3XCIgb2JqZWN0SWQ9XCIyXCIgZmlsZT1cImFsaWVuX2JvdDNcIiBvYmplY3RHcm91cD1cIm1tbW1fYWxpZW5cIiBwb3NpdGlvbj1cIjAuMTUgMCAwXCI+XG4gICAgICAgICA8YS1ib3ggY2xhc3M9XCJwcmV2aWV3RnJhbWVcIiBwb3NpdGlvbj1cIjAgMCAtMC4wMDNcIiBzY2FsZT1cIjAuMDYgMC4wNiAwLjAwNVwiIG1hdGVyaWFsPVwiY29sb3I6ICMyMjIyMjJcIj48L2EtYm94PlxuICAgICAgICAgPGEtaW1hZ2UgY2xhc3M9XCJwcmV2aWV3SW1hZ2VcIiBzY2FsZT1cIjAuMDUgMC4wNSAwLjA1XCIgc3JjPVwiYXNzZXRzL3ByZXZpZXcvYWxpZW5fYm90My5qcGdcIiA+PC9hLWltYWdlPlxuICAgICAgICAgPGEtZW50aXR5IGNsYXNzPVwib2JqZWN0TmFtZVwiIHBvc2l0aW9uPVwiLTAuMDI1IC0wLjA0IC0wLjAwM1wiIHNjYWxlPVwiMC4wNSAwLjA1IDAuMDVcIiBibWZvbnQtdGV4dD1cInRleHQ6IEFsaWVuIEJvdDM7IGNvbG9yOiAjNzQ3NDc0XCI+PC9hLWVudGl0eT5cbiAgICAgICA8L2EtZW50aXR5PlxuXG4gICAgICAgPGEtZW50aXR5IGlkPVwibWVudTNcIiB2aXNpYmxlPVwiZmFsc2VcIiBjbGFzcz1cInByZXZpZXdcIiBvYmplY3RJZD1cIjNcIiBmaWxlPVwiYWxpZW5fY3Jhd2wxXCIgb2JqZWN0R3JvdXA9XCJtbW1tX2FsaWVuXCIgcG9zaXRpb249XCIwLjIyNSAwIDBcIj5cbiAgICAgICAgIDxhLWJveCBjbGFzcz1cInByZXZpZXdGcmFtZVwiIHBvc2l0aW9uPVwiMCAwIC0wLjAwM1wiIHNjYWxlPVwiMC4wNiAwLjA2IDAuMDA1XCIgbWF0ZXJpYWw9XCJjb2xvcjogIzIyMjIyMlwiPjwvYS1ib3g+XG4gICAgICAgICA8YS1pbWFnZSBjbGFzcz1cInByZXZpZXdJbWFnZVwiIHNjYWxlPVwiMC4wNSAwLjA1IDAuMDVcIiBzcmM9XCJhc3NldHMvcHJldmlldy9hbGllbl9jcmF3bDEuanBnXCIgPjwvYS1pbWFnZT5cbiAgICAgICAgIDxhLWVudGl0eSBjbGFzcz1cIm9iamVjdE5hbWVcIiBwb3NpdGlvbj1cIi0wLjAyNSAtMC4wNCAtMC4wMDNcIiBzY2FsZT1cIjAuMDUgMC4wNSAwLjA1XCIgYm1mb250LXRleHQ9XCJ0ZXh0OiBBbGllbiBDcmF3bDE7IGNvbG9yOiAjNzQ3NDc0XCI+PC9hLWVudGl0eT5cbiAgICAgICA8L2EtZW50aXR5PlxuICAgICA8L2EtZW50aXR5PlxuXG4gPC9hLWVudGl0eT5cblxuPC9hLWVudGl0eT5cblxuXG5cbiovXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvYWZyYW1lLXNlbGVjdC1iYXIuanMiLCIvKiBnbG9iYWwgQUZSQU1FICovXG5cbmlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xufVxuXG52YXIgb2JqZWN0Q291bnQgPSAwOyAvLyBzY2VuZSBzdGFydHMgd2l0aCAwIGl0ZW1zXG5cbmZ1bmN0aW9uIGh1bWFuaXplKHN0cikge1xuICB2YXIgZnJhZ3MgPSBzdHIuc3BsaXQoJ18nKTtcbiAgZm9yIChpPTA7IGk8ZnJhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICBmcmFnc1tpXSA9IGZyYWdzW2ldLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZnJhZ3NbaV0uc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGZyYWdzLmpvaW4oJyAnKTtcbn1cblxudmFyIG9iamVjdERhdGFTdG9yZSA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgb2JqZWN0SlNPTiA9IFtdO1xuICAgIGNvbnNvbGUubG9nKFwib2JqZWN0SlNPTiB2YXIgaW5pdGlhbGl6ZWRcIik7XG5cbiAgICAkLmFqYXgoe1xuICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgIHVybDogXCJhc3NldHMvbW1tbV9hbGllbi5qc29uXCIsXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICBzdWNjZXNzIDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBvYmplY3RKU09OWydtbW1tX2FsaWVuJ10gPSBkYXRhO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9iamVjdEpTT04gbG9hZGVkOlwiKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJvYmplY3RKU09OID0gXCIgKyBvYmplY3RKU09OKTtcbiAgICAgICAgY29uc29sZS5sb2cob2JqZWN0SlNPTik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkLmFqYXgoe1xuICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgIHVybDogXCJhc3NldHMvbW1tbV92ZWguanNvblwiLFxuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgc3VjY2VzcyA6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgb2JqZWN0SlNPTlsnbW1tbV92ZWgnXSA9IGRhdGE7XG4gICAgICAgIGNvbnNvbGUubG9nKFwib2JqZWN0SlNPTiBsb2FkZWQ6XCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9iamVjdEpTT04gPSBcIiArIG9iamVjdEpTT04pO1xuICAgICAgICBjb25zb2xlLmxvZyhvYmplY3RKU09OKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICQuYWpheCh7XG4gICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgdXJsOiBcImFzc2V0cy9rZmFycl9iYXNlcy5qc29uXCIsXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICBzdWNjZXNzIDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBvYmplY3RKU09OWydrZmFycl9iYXNlcyddID0gZGF0YTtcbiAgICAgICAgY29uc29sZS5sb2coXCJvYmplY3RKU09OIGxvYWRlZDpcIik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwib2JqZWN0SlNPTiA9IFwiICsgb2JqZWN0SlNPTik7XG4gICAgICAgIGNvbnNvbGUubG9nKG9iamVjdEpTT04pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtmZXRjaEpTT04gOiBmdW5jdGlvbihvYmplY3RHcm91cClcbiAgICB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmV0Y2hKU09OIGZpcmVkXCIpO1xuICAgICAgICBpZiAob2JqZWN0SlNPTikgcmV0dXJuIG9iamVjdEpTT05bb2JqZWN0R3JvdXBdO1xuICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gZWxzZSBzaG93IHNvbWUgZXJyb3IgdGhhdCBpdCBpc24ndCBsb2FkZWQgeWV0O1xuICAgIH19O1xufSkoKTtcblxuLyoqXG4gKiBWaXZlIENvbnRyb2xsZXIgVGVtcGxhdGUgY29tcG9uZW50IGZvciBBLUZyYW1lLlxuICogTW9kaWZlZCBmcm9tIEEtRnJhbWUgRG9taW5vZXMuXG4gKi9cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnYnVpbGRlci1jb250cm9scycsIHtcbiAgc2NoZW1hOiB7fSxcblxuICAvKipcbiAgICogU2V0IGlmIGNvbXBvbmVudCBuZWVkcyBtdWx0aXBsZSBpbnN0YW5jaW5nLlxuICAgKi9cbiAgbXVsdGlwbGU6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBZGQgZXZlbnQgbGlzdGVuZXJzLlxuICAgKi9cbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIC8vIEFwcGxpY2FibGUgdG8gYm90aCBWaXZlIGFuZCBPY3VsdXMgVG91Y2ggY29udHJvbHNcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCd0cmlnZ2VyZG93bicsIHRoaXMub25QbGFjZU9iamVjdC5iaW5kKHRoaXMpKTtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdncmlwZG93bicsIHRoaXMub25VbmRvLmJpbmQodGhpcykpO1xuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ21lbnVkb3duJywgdGhpcy5vbk9iamVjdFByZXZpb3VzLmJpbmQodGhpcykpO1xuICAgIC8vIFZpdmUgc3BlY2lmaWMgY29udHJvbHNcbi8vXHRcdGVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYWNrcGFkZG93bicsIHRoaXMub25PYmplY3ROZXh0LmJpbmQodGhpcykpO1xuICAgIC8vIE9jdWx1cyBUb3VjaCBzcGVjaWZpYyBjb250cm9sc1xuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ1hkb3duJywgdGhpcy5vbk9iamVjdE5leHQuYmluZCh0aGlzKSk7XG4gICAgLy8gZWwuYWRkRXZlbnRMaXN0ZW5lcignQWRvd24nLCB0aGlzLm9uT2JqZWN0TmV4dC5iaW5kKHRoaXMpKTtcblxuICAgIC8vIG1lbnU6IHVzZWQgZm9yIGRldGVybWluaW5nIGN1cnJlbnQgYXhpcyBvZiB0cmFja3BhZCBob3ZlciBwb3NpdGlvblxuICAgIC8vIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignYXhpc21vdmUnLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgLy8gICBpZiAoZXZ0LmRldGFpbC5heGlzWzBdID09PSAwICYmIGV2dC5kZXRhaWwuYXhpc1sxXSA9PT0gMCkge1xuICAgIC8vICAgICByZXR1cm47XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIC8vIG1lbnU6IG9ubHkgZGVhbCB3aXRoIHRyYWNrcGFkIGV2ZW50cyBmcm9tIHJpZ2h0IGNvbnRyb2xsZXJcbiAgICAvLyAgIC8vIGlmIChldnQudGFyZ2V0LmlkID09PSAnbGVmdENvbnRyb2xsZXInKSB7XG4gICAgLy8gICAvLyAgIHJldHVybjtcbiAgICAvLyAgIC8vIH1cbiAgICAvL1xuICAgIC8vICAgaWYgKGV2dC5kZXRhaWwuYXhpc1swXSA+IDApIHtcbiAgICAvLyAgICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1JpZ2h0XCIpO1xuICAgIC8vICAgfSBlbHNlIHtcbiAgICAvLyAgICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0xlZnRcIik7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHZhciBjdXJyZW50QXJyb3dDb2xvciA9IG5ldyBUSFJFRS5Db2xvcihhcnJvdy5nZXRBdHRyaWJ1dGUoXCJtYXRlcmlhbFwiKS5jb2xvcik7XG4gICAgLy9cbiAgICAvLyAgIGlmIChjdXJyZW50QXJyb3dDb2xvci5yID09PSAwKSB7IC8vIGlmIG5vdCBhbHJlYWR5IHNvbWUgc2hhZGUgb2YgeWVsbG93ICh3aGljaCBpbmRpY2F0ZXMgcmVjZW50IGJ1dHRvbiBwcmVzcykgdGhlbiBhbmltYXRlIGdyZWVuIGhvdmVyXG4gICAgLy9cbiAgICAvLyAgICAgLy8gaWYgdXNpbmcgdGhlIG9jdWx1cyByaWZ0IGFuZCB0aGUgdGh1bWJzdGljayBpcyA+ODUlIGluIGVpdGhlciByaWdodC9sZWZ0IGRpcmVjdGlvbiB0aGVuIGZpcmUgYSB0cmFja3BhZGRvd24gZXZlbnRcbiAgICAvLyAgICAgdmFyIGdhbWVwYWRzID0gbmF2aWdhdG9yLmdldEdhbWVwYWRzKCk7XG4gICAgLy8gICAgIC8vIGhlcmUgY2hlY2sgaWYgb2N1bHVzIGNvbnRyb2xsZXIsIGVtaXQgdHJhY2twYWRkb3duXG4gICAgLy8gICAgIGlmIChnYW1lcGFkcykge1xuICAgIC8vICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2FtZXBhZHMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyAgICAgICAgIHZhciBnYW1lcGFkID0gZ2FtZXBhZHNbaV07XG4gICAgLy8gICAgICAgICBpZiAoZ2FtZXBhZCkge1xuICAgIC8vICAgICAgICAgICBpZiAoZ2FtZXBhZC5pZC5pbmRleE9mKCdPY3VsdXMgVG91Y2gnKSA9PT0gMCkge1xuICAgIC8vICAgICAgICAgICAgIGlmIChNYXRoLmFicyhldnQuZGV0YWlsLmF4aXNbMF0pID4gMC44NSkge1xuICAgIC8vICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd0cmFja3BhZGRvd24nKTtcbiAgICAvLyAgICAgICAgICAgICAgIHJldHVybjsgICAvLyBvbmx5IGZpcmUgb24gZmlyc3QgdG91Y2ggY29udHJvbGxlciBtYXRjaCwgYXMgdGhlcmUgYXJlIDJcbiAgICAvLyAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgICB9XG4gICAgLy8gICAgIH1cbiAgICAvL1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gfSk7XG5cbiAgfSxcblxuICAvKipcbiAgICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cbiAgICovXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmlnZ2VyZG93bicsIHRoaXMub25QbGFjZU9iamVjdCk7XG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignZ3JpcGRvd24nLCB0aGlzLm9uVW5kbyk7XG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVudWRvd24nLCB0aGlzLm9uT2JqZWN0UHJldmlvdXMpO1xuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYWNrcGFkZG93bicsIHRoaXMub25PYmplY3ROZXh0KTtcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdYZG93bicsIHRoaXMub25PYmplY3ROZXh0KTtcbiAgICAvLyBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdBZG93bicsIHRoaXMub25PYmplY3ROZXh0KTtcbiAgfSxcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gZW50aXR5IHJlc3VtZXMuXG4gICAqIFVzZSB0byBjb250aW51ZSBvciBhZGQgYW55IGR5bmFtaWMgb3IgYmFja2dyb3VuZCBiZWhhdmlvciBzdWNoIGFzIGV2ZW50cy5cbiAgICovXG4gIHBsYXk6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGVudGl0eSBwYXVzZXMuXG4gICAqIFVzZSB0byBzdG9wIG9yIHJlbW92ZSBhbnkgZHluYW1pYyBvciBiYWNrZ3JvdW5kIGJlaGF2aW9yIHN1Y2ggYXMgZXZlbnRzLlxuICAgKi9cbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgY29tcG9uZW50IGlzIHJlbW92ZWQgKGUuZy4sIHZpYSByZW1vdmVBdHRyaWJ1dGUpLlxuICAgKiBHZW5lcmFsbHkgdW5kb2VzIGFsbCBtb2RpZmljYXRpb25zIHRvIHRoZSBlbnRpdHkuXG4gICAqL1xuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNwYXducyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9iamVjdCBhdCB0aGUgY29udHJvbGxlciBsb2NhdGlvbiB3aGVuIHRyaWdnZXIgcHJlc3NlZFxuICAgKi9cbiAgb25QbGFjZU9iamVjdDogZnVuY3Rpb24gKCkge1xuXG4gICAgLy8gRmV0Y2ggdGhlIEl0ZW0gZWxlbWVudCAodGhlIHBsYWNlYWJsZSBjaXR5IG9iamVjdCkgc2VsZWN0ZWQgb24gdGhpcyBjb250cm9sbGVyXG4gICAgdmFyIHRoaXNJdGVtSUQgPSAodGhpcy5lbC5pZCA9PT0gJ2xlZnRDb250cm9sbGVyJykgPyAnI2xlZnRJdGVtJzonI3JpZ2h0SXRlbSc7XG4gICAgdmFyIHRoaXNJdGVtRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXNJdGVtSUQpO1xuXG4gICAgLy8gV2hpY2ggb2JqZWN0IHNob3VsZCBiZSBwbGFjZWQgaGVyZT8gVGhpcyBJRCBpcyBcInN0b3JlZFwiIGluIHRoZSBET00gZWxlbWVudCBvZiB0aGUgY3VycmVudCBJdGVtXG5cdFx0dmFyIG9iamVjdElkID0gcGFyc2VJbnQodGhpc0l0ZW1FbC5hdHRyaWJ1dGVzLm9iamVjdElkLnZhbHVlKTtcblxuICAgIC8vIFdoYXQncyB0aGUgdHlwZSBvZiBvYmplY3Q/IEZvciBleGFtcGxlLCBcIm1tbW1fYWxpZW5cIiBvciBcImJhc2VzXCJcblx0XHR2YXIgb2JqZWN0R3JvdXAgPSB0aGlzSXRlbUVsLmF0dHJpYnV0ZXMub2JqZWN0R3JvdXAudmFsdWU7XG5cbiAgICAvLyByb3VuZGluZyB0cnVlIG9yIGZhbHNlPyBXZSB3YW50IHRvIHJvdW5kIHBvc2l0aW9uIGFuZCByb3RhdGlvbiBvbmx5IGZvciBcImJhc2VzXCIgdHlwZSBvYmplY3RzXG4gICAgdmFyIHJvdW5kaW5nID0gKG9iamVjdEdyb3VwID09ICdrZmFycl9iYXNlcycpO1xuXG4gICAgLy8gR2V0IGFuIEFycmF5IG9mIGFsbCB0aGUgb2JqZWN0cyBvZiB0aGlzIHR5cGVcbiAgICB2YXIgb2JqZWN0QXJyYXkgPSBvYmplY3REYXRhU3RvcmUuZmV0Y2hKU09OKG9iamVjdEdyb3VwKTtcblxuICAgIC8vIEdldCB0aGUgSXRlbSdzIGN1cnJlbnQgd29ybGQgY29vcmRpbmF0ZXMgLSB3ZSdyZSBnb2luZyB0byBwbGFjZSBpdCByaWdodCB3aGVyZSBpdCBpcyFcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFBvc2l0aW9uID0gdGhpc0l0ZW1FbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKCk7XG5cdFx0dmFyIHRoaXNJdGVtV29ybGRSb3RhdGlvbiA9IHRoaXNJdGVtRWwub2JqZWN0M0QuZ2V0V29ybGRSb3RhdGlvbigpO1xuXHRcdHZhciBvcmlnaW5hbFBvc2l0aW9uU3RyaW5nID0gdGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLnggKyAnICcgKyB0aGlzSXRlbVdvcmxkUG9zaXRpb24ueSArICcgJyArIHRoaXNJdGVtV29ybGRQb3NpdGlvbi56O1xuXG4gICAgLy8gUm91bmQgdGhlIEl0ZW0ncyBwb3NpdGlvbiB0byB0aGUgbmVhcmVzdCAwLjUwIGZvciBhIGJhc2ljIFwiZ3JpZCBzbmFwcGluZ1wiIGVmZmVjdFxuXHRcdHZhciByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25YID0gTWF0aC5yb3VuZCh0aGlzSXRlbVdvcmxkUG9zaXRpb24ueCAqIDIpIC8gMjsgLy9yb3VuZCB0byBuZWFyZXN0IDAuNSBmb3IgZ2hldHRvIFwic25hcHBpbmdcIlxuXHRcdHZhciByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25ZID0gTWF0aC5yb3VuZCh0aGlzSXRlbVdvcmxkUG9zaXRpb24ueSAqIDIpIC8gMjsgLy9yb3VuZCB0byBuZWFyZXN0IDAuNSBmb3IgZ2hldHRvIFwic25hcHBpbmdcIlxuXHRcdHZhciByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25aID0gTWF0aC5yb3VuZCh0aGlzSXRlbVdvcmxkUG9zaXRpb24ueiAqIDIpIC8gMjsgLy9yb3VuZCB0byBuZWFyZXN0IDAuNSBmb3IgZ2hldHRvIFwic25hcHBpbmdcIlxuXHRcdHZhciByb3VuZGVkUG9zaXRpb25TdHJpbmcgPSByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25YICsgJyAwLjUwICcgKyByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25aO1xuXG4gICAgLy8gRmV0Y2ggdGhlIGN1cnJlbnQgSXRlbSdzIHJvdGF0aW9uIGFuZCBjb252ZXJ0IGl0IHRvIGEgRXVsZXIgc3RyaW5nXG5cdFx0dmFyIHRoaXNJdGVtV29ybGRSb3RhdGlvblggPSB0aGlzSXRlbVdvcmxkUm90YXRpb24uX3ggLyAoTWF0aC5QSSAvIDE4MCk7XG5cdFx0dmFyIHRoaXNJdGVtV29ybGRSb3RhdGlvblkgPSB0aGlzSXRlbVdvcmxkUm90YXRpb24uX3kgLyAoTWF0aC5QSSAvIDE4MCk7XG5cdFx0dmFyIHRoaXNJdGVtV29ybGRSb3RhdGlvblogPSB0aGlzSXRlbVdvcmxkUm90YXRpb24uX3ogLyAoTWF0aC5QSSAvIDE4MCk7XG5cdFx0dmFyIG9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZyA9IHRoaXNJdGVtV29ybGRSb3RhdGlvblggKyAnICcgKyB0aGlzSXRlbVdvcmxkUm90YXRpb25ZICsgJyAnICsgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWjtcblxuICAgIC8vIFJvdW5kIHRoZSBJdGVtJ3Mgcm90YXRpb24gdG8gdGhlIG5lYXJlc3QgOTAgZGVncmVlcyBmb3IgYmFzZSB0eXBlIG9iamVjdHNcblx0XHR2YXIgcm91bmRlZFRoaXNJdGVtV29ybGRSb3RhdGlvblkgPSBNYXRoLnJvdW5kKHRoaXNJdGVtV29ybGRSb3RhdGlvblkgLyA5MCkgKiA5MDsgLy8gcm91bmQgdG8gOTAgZGVncmVlc1xuXHRcdHZhciByb3VuZGVkRXVsZXJSb3RhdGlvblN0cmluZyA9IDAgKyAnICcgKyByb3VuZGVkVGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSArICcgJyArIDA7IC8vIGlnbm9yZSByb2xsIGFuZCBwaXRjaFxuXG4gICAgdmFyIG5ld0lkID0gJ29iamVjdCcgKyBvYmplY3RDb3VudDtcblxuICAgICQoJzxhLWVudGl0eSAvPicsIHtcbiAgICAgIGlkOiBuZXdJZCxcbiAgICAgIGNsYXNzOiAnY2l0eSBvYmplY3QgY2hpbGRyZW4nLFxuICAgICAgc2NhbGU6IG9iamVjdEFycmF5W29iamVjdElkXS5zY2FsZSxcbiAgICAgIHJvdGF0aW9uOiByb3VuZGluZyA/IHJvdW5kZWRFdWxlclJvdGF0aW9uU3RyaW5nIDogb3JpZ2luYWxFdWxlclJvdGF0aW9uU3RyaW5nLFxuICAgICAgZmlsZTogb2JqZWN0QXJyYXlbb2JqZWN0SWRdLmZpbGUsXG4gICAgICAvLyBcInBseS1tb2RlbFwiOiBcInNyYzogdXJsKG5ld19hc3NldHMvXCIgKyBvYmplY3RBcnJheVtvYmplY3RJZF0uZmlsZSArIFwiLnBseSlcIixcbiAgICAgIFwib2JqLW1vZGVsXCI6IFwib2JqOiB1cmwoYXNzZXRzL29iai9cIiArIG9iamVjdEFycmF5W29iamVjdElkXS5maWxlICsgXCIub2JqKTsgbXRsOiB1cmwoYXNzZXRzL29iai9cIiArIG9iamVjdEFycmF5W29iamVjdElkXS5maWxlICsgXCIubXRsKVwiLFxuICAgICAgYXBwZW5kVG8gOiAkKCcjY2l0eScpXG4gICAgfSk7XG5cbiAgICBuZXdPYmplY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChuZXdJZCk7XG4gICAgbmV3T2JqZWN0LnNldEF0dHJpYnV0ZShcInBvc2l0aW9uXCIsIHJvdW5kaW5nID8gcm91bmRlZFBvc2l0aW9uU3RyaW5nIDogb3JpZ2luYWxQb3NpdGlvblN0cmluZyk7IC8vIHRoaXMgZG9lcyBzZXQgcG9zaXRpb25cblxuICAgIC8vIElmIHRoaXMgaXMgYSBcImJhc2VzXCIgdHlwZSBvYmplY3QsIGFuaW1hdGUgdGhlIHRyYW5zaXRpb24gdG8gdGhlIHNuYXBwZWQgKHJvdW5kZWQpIHBvc2l0aW9uIGFuZCByb3RhdGlvblxuICAgIGlmIChyb3VuZGluZykge1xuICAgICAgbmV3T2JqZWN0LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uJywgeyBwcm9wZXJ0eTogJ3JvdGF0aW9uJywgZHVyOiA1MDAsIGZyb206IG9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZywgdG86IHJvdW5kZWRFdWxlclJvdGF0aW9uU3RyaW5nIH0pXG4gICAgfTtcblxuICAgIC8vIEluY3JlbWVudCB0aGUgb2JqZWN0IGNvdW50ZXIgc28gc3Vic2VxdWVudCBvYmplY3RzIGhhdmUgdGhlIGNvcnJlY3QgaW5kZXhcblx0XHRvYmplY3RDb3VudCArPSAxO1xuICB9LFxuXG5cdG9uT2JqZWN0TmV4dDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybjtcblx0XHQvLyBzd2l0Y2ggYmV0d2VlbiB0aGUgYXZhaWxhYmxlIG9iamVjdCBvciBiYXNlc1xuXG4gICAgLy8gRmV0Y2ggdGhlIEl0ZW0gZWxlbWVudCAodGhlIHBsYWNlYWJsZSBjaXR5IG9iamVjdCkgc2VsZWN0ZWQgb24gdGhpcyBjb250cm9sbGVyXG4gICAgdmFyIHRoaXNJdGVtSUQgPSAodGhpcy5lbC5pZCA9PT0gJ2xlZnRDb250cm9sbGVyJykgPyAnI2xlZnRJdGVtJzonI3JpZ2h0SXRlbSc7XG4gICAgdmFyIHRoaXNJdGVtRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXNJdGVtSUQpO1xuXG4gICAgLy8gV2hhdCdzIHRoZSB0eXBlIG9mIG9iamVjdCBjdXJyZW50bHkgc2VsZWN0ZWQ/IEZvciBleGFtcGxlLCBcIm1tbW1fYWxpZW5cIiBvciBcImJhc2VzXCJcblx0XHR2YXIgb2JqZWN0R3JvdXAgPSB0aGlzSXRlbUVsLmF0dHJpYnV0ZXMub2JqZWN0R3JvdXAudmFsdWU7XG5cbiAgICAvLyBHZXQgYW4gQXJyYXkgb2YgYWxsIHRoZSBvYmplY3RzIG9mIHRoaXMgdHlwZVxuICAgIHZhciBvYmplY3RBcnJheSA9IG9iamVjdERhdGFTdG9yZS5mZXRjaEpTT04ob2JqZWN0R3JvdXApO1xuXG4gICAgLy8gV2hhdCBpcyB0aGUgSUQgb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBpdGVtP1xuICAgIHZhciBvYmplY3RJZCA9IHBhcnNlSW50KHRoaXNJdGVtRWwuYXR0cmlidXRlcy5vYmplY3RJZC52YWx1ZSk7XG5cbiAgICAvLyBtZW51OiBzYXZlIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgbWVudSBlbGVtZW50XG4gICAgY29uc3Qgb2xkTWVudUVsID0gJChcImEtZW50aXR5I21lbnVPYmplY3RMaXN0XCIpLmZpbmQoXCJhLWVudGl0eVtvYmplY3RJZD1cIiArIG9iamVjdElkICsgXCJdXCIpO1xuXG4gICAgLy8gc2hvdWxkIHdlIHN3aXRjaCBsZWZ0IG9yIHJpZ2h0P1xuICAgIHZhciBsZWZ0QnV0dG9uID0gbmV3IFRIUkVFLkNvbG9yKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dSaWdodFwiKS5nZXRBdHRyaWJ1dGUoXCJtYXRlcmlhbFwiKS5jb2xvcikuZyA8IG5ldyBUSFJFRS5Db2xvcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93TGVmdFwiKS5nZXRBdHRyaWJ1dGUoXCJtYXRlcmlhbFwiKS5jb2xvcikuZztcbiAgICBjb25zb2xlLmxvZyhcImxlZnRCdXR0b24/IFwiICsgbGVmdEJ1dHRvbik7XG5cbiAgICAvLyBJRiBSSUdIVCBDT05UUk9MTEVSXG4gICAgaWYgKHRoaXMuZWwuaWQgPT09ICdyaWdodENvbnRyb2xsZXInKSB7XG4gICAgICAvLyBURVNUIEZPUiBMRUZUIE9SIFJJR0hUIEJVVFRPTiBQUkVTU1xuICAgICAgaWYgKGxlZnRCdXR0b24pIHtcblxuICAgICAgICAvLyBMRUZUIEJVVFRPTiBNRU5VIFNUQVJUID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgb2JqZWN0SWQgLT0gMTtcbiAgICAgICAgaWYgKG9iamVjdElkID09IC0xKSB7b2JqZWN0SWQgPSBvYmplY3RBcnJheS5sZW5ndGggLSAxfVxuXG4gICAgICAgIC8vIG1lbnU6IGFuaW1hdGUgYXJyb3cgTEVGVFxuICAgICAgICB2YXIgYXJyb3dMZWZ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0xlZnRcIik7XG4gICAgICAgIGFycm93TGVmdC5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InKTtcbiAgICAgICAgYXJyb3dMZWZ0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XG4gICAgICAgIGFycm93TGVmdC5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnKTtcbiAgICAgICAgYXJyb3dMZWZ0LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5jb2xvcicsIGR1cjogNTAwLCBmcm9tOiBcIiNGRkZGMDBcIiwgdG86IFwiIzAwMDAwMFwiIH0pO1xuICAgICAgICBhcnJvd0xlZnQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XG4gICAgICAgIGFycm93TGVmdC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnLCB7IHByb3BlcnR5OiAnc2NhbGUnLCBkdXI6IDUwMCwgZnJvbTogXCIwLjAwNiAwLjAwMyAwLjAwNlwiLCB0bzogXCIwLjAwNCAwLjAwMiAwLjAwNFwiIH0pO1xuXG4gICAgICAgIC8vIG1lbnU6IGdldCB0aGUgbmV3bHkgc2VsZWN0ZWQgbWVudSBlbGVtZW50XG4gICAgICAgIGNvbnN0IG5ld01lbnVFbCA9ICQoXCJhLWVudGl0eSNtZW51T2JqZWN0TGlzdFwiKS5maW5kKFwiYS1lbnRpdHlbb2JqZWN0SWQ9XCIgKyBvYmplY3RJZCArIFwiXVwiKTtcblxuICAgICAgICAvLyBtZW51OiByZW1vdmUgc2VsZWN0ZWQgY2xhc3MgYW5kIGNoYW5nZSBjb2xvcnNcbiAgICAgICAgb2xkTWVudUVsLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICAgIG5ld01lbnVFbC5hZGRDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAgICBvbGRNZW51RWwuY2hpbGRyZW4oXCIub2JqZWN0TmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ2JtZm9udC10ZXh0JywgJ2NvbG9yJywgJ2dyYXknKTtcbiAgICAgICAgbmV3TWVudUVsLmNoaWxkcmVuKFwiLm9iamVjdE5hbWVcIilbMF0uc2V0QXR0cmlidXRlKCdibWZvbnQtdGV4dCcsICdjb2xvcicsICd5ZWxsb3cnKTtcbiAgICAgICAgb2xkTWVudUVsLmNoaWxkcmVuKFwiLnByZXZpZXdGcmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ21hdGVyaWFsJywgJ2NvbG9yJywgJyMyMjIyMjInKTtcbiAgICAgICAgbmV3TWVudUVsLmNoaWxkcmVuKFwiLnByZXZpZXdGcmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ21hdGVyaWFsJywgJ2NvbG9yJywgJ3llbGxvdycpO1xuXG4gICAgICAgIC8vIG1lbnU6IHNsaWRlIHRoZSBtZW51IGxpc3QgUklHSFQgYnkgMVxuICAgICAgICBjb25zdCBtZW51T2JqZWN0TGlzdEVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51T2JqZWN0TGlzdFwiKTtcbiAgICAgICAgLy8gdXNlIHRoZSBkZXNpcmVkUG9zaXRpb24gYXR0cmlidXRlIChpZiBleGlzdHMpIGluc3RlYWQgb2Ygb2JqZWN0M0QgcG9zaXRpb24gYXMgYW5pbWF0aW9uIG1heSBub3QgYmUgZG9uZSB5ZXRcbiAgICAgICAgaWYgKG1lbnVPYmplY3RMaXN0RWwuaGFzQXR0cmlidXRlKFwiZGVzaXJlZFBvc2l0aW9uXCIpKSB7XG4gICAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0gbWVudU9iamVjdExpc3RFbC5nZXRBdHRyaWJ1dGUoXCJkZXNpcmVkUG9zaXRpb25cIik7XG4gICAgICAgICAgdmFyIG5ld1ggPSBwYXJzZUZsb2F0KG9sZFBvc2l0aW9uLnNwbGl0KFwiIFwiKVswXSkgKyAwLjA3NTtcbiAgICAgICAgICB2YXIgbmV3UG9zaXRpb25TdHJpbmcgPSBuZXdYLnRvU3RyaW5nKCkgKyBcIiBcIiArIG9sZFBvc2l0aW9uLnNwbGl0KFwiIFwiKVsxXSArIFwiIFwiICsgb2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBvbGRQb3NpdGlvbiA9IG1lbnVPYmplY3RMaXN0RWwub2JqZWN0M0QucG9zaXRpb247XG4gICAgICAgICAgdmFyIG5ld1ggPSBvbGRQb3NpdGlvbi54ICsgMC4wNzU7IC8vIHRoaXMgc2hvdWxkIGJlIGEgdmFyaWFibGUgc29vblxuICAgICAgICAgIHZhciBuZXdQb3NpdGlvblN0cmluZyA9IG5ld1gudG9TdHJpbmcoKSArIFwiIFwiICsgb2xkUG9zaXRpb24ueSArIFwiIFwiICsgb2xkUG9zaXRpb24uejtcbiAgICAgICAgfVxuICAgICAgICBtZW51T2JqZWN0TGlzdEVsLnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zbGlkZScpO1xuICAgICAgICBtZW51T2JqZWN0TGlzdEVsLnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zbGlkZScsIHsgcHJvcGVydHk6ICdwb3NpdGlvbicsIGR1cjogNTAwLCBmcm9tOiBvbGRQb3NpdGlvbiwgdG86IG5ld1Bvc2l0aW9uU3RyaW5nIH0pO1xuICAgICAgICBtZW51T2JqZWN0TGlzdEVsLnNldEF0dHJpYnV0ZSgnZGVzaXJlZFBvc2l0aW9uJywgbmV3UG9zaXRpb25TdHJpbmcpO1xuXG4gICAgICAgIC8vIG1lbnU6IG1ha2UgdGhlIGhpZGRlbiBtb3N0IExFRlRtb3N0IG9iamVjdCAoLTMgZnJvbSBvbGRNZW51RWwgaW5kZXgpIHZpc2libGVcbiAgLy9PTEQgICAgICB2YXIgdGhpcmRNZW51RWwgPSBvbGRNZW51RWxbMF0ubmV4dEVsZW1lbnRTaWJsaW5nLm5leHRFbGVtZW50U2libGluZy5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICAgIHZhciBuZWdUaGlyZE1lbnVFbCA9IG9sZE1lbnVFbFswXS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLnByZXZpb3VzRWxlbWVudFNpYmxpbmcucHJldmlvdXNFbGVtZW50U2libGluZztcblxuICAgICAgICBuZWdUaGlyZE1lbnVFbC5zZXRBdHRyaWJ1dGUoJ3Zpc2libGUnLCd0cnVlJyk7XG5cbiAgICAgICAgLy8gVE9ETyBOT1QgV09SS0lORyBBRlRFUiBGSVJTVCBJVEVSQVRJT05cbiAgICAgICAgLy8gdGhpcmRNZW51RWwucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb24nKTtcbiAgICAgICAgbmVnVGhpcmRNZW51RWwuc2V0QXR0cmlidXRlKCdhbmltYXRpb24nLCB7IHByb3BlcnR5OiAnc2NhbGUnLCBkdXI6IDUwMCwgZnJvbTogJzAuNSAwLjUgMC41JywgdG86ICcxLjAgMS4wIDEuMCcgfSk7XG5cbiAgICAgICAgLy8gbWVudTogZGVzdHJveSB0aGUgaGlkZGVuIG1vc3QgUklHSFRtb3N0IG9iamVjdCAoKzMgZnJvbSBvbGRNZW51RWwgaW5kZXgpXG4gIC8vT0xEICAgICB2YXIgbmVnVGhpcmRNZW51RWwgPSBvbGRNZW51RWxbMF0ucHJldmlvdXNFbGVtZW50U2libGluZy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgICAgIHZhciB0aGlyZE1lbnVFbCA9IG9sZE1lbnVFbFswXS5uZXh0RWxlbWVudFNpYmxpbmcubmV4dEVsZW1lbnRTaWJsaW5nLm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgdGhpcmRNZW51RWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlyZE1lbnVFbCk7XG5cbiAgICAgICAgLy8gbWVudTogbWFrZSB0aGUgc2Vjb25kIFJJR0hUbW9zdCBvYmplY3QgKCsyIGZyb20gb2xkTWVudUVsIGluZGV4KSBpbnZpc2libGVcbiAgLy9PTEQgICAgICB2YXIgbmVnU2Vjb25kTWVudUVsID0gb2xkTWVudUVsWzBdLnByZXZpb3VzRWxlbWVudFNpYmxpbmcucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgICAgdmFyIHNlY29uZE1lbnVFbCA9IG9sZE1lbnVFbFswXS5uZXh0RWxlbWVudFNpYmxpbmcubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgICBzZWNvbmRNZW51RWwuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgLy8gbWVudTogQ3JlYXRlIHRoZSBuZXh0IExFRlRtb3N0IG9iamVjdCBwcmV2aWV3ICgtNCBmcm9tIG9sZE1lbnVFbCBpbmRleCkgYnV0IGtlZXAgaXQgaGlkZGVuIHVudGlsIGl0J3MgbmVlZGVkXG4gICAgICAgIHZhciBuZWdGb3VydGhNZW51RWwgPSBuZWdUaGlyZE1lbnVFbC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIG5lZ0ZvdXJ0aE1lbnVFbC5zZXRBdHRyaWJ1dGUoJ3Zpc2libGUnLCAnZmFsc2UnKTtcbiAgICAgICAgLy8gaWYgb2JqZWN0SWQgLSAzID4gLTEgdGhlbiB1c2UgdGhpcyBudW1iZXJcbiAgICAgICAgLy8gaWYgb2JqZWN0SWQgLSAzIDw9IC0xLCB0aGVuIHVzZSB0aGlzIHJlcXVlc3RlZCBudW1iZXIgcGx1cyB0aGUgbGVuZ3RoIG9mIGFycmF5XG4gIC8vT0xEICAgICAgdmFyIGZvdXJ0aE1lbnVPYmplY3RJRCA9IChvYmplY3RJZCArIDMgPCBvYmplY3RBcnJheS5sZW5ndGgpID8gKG9iamVjdElkICsgMykgOiAob2JqZWN0SWQgKyAzIC0gb2JqZWN0QXJyYXkubGVuZ3RoKTtcbiAgICAgICAgdmFyIG5lZ0ZvdXJ0aE1lbnVPYmplY3RJRCA9IChvYmplY3RJZCAtIDMgPiAtMSkgPyAob2JqZWN0SWQgLSAzKSA6IChvYmplY3RJZCAtIDMgKyBvYmplY3RBcnJheS5sZW5ndGgpO1xuICAgICAgICBuZWdGb3VydGhNZW51RWwuc2V0QXR0cmlidXRlKCdvYmplY3RJZCcsIG5lZ0ZvdXJ0aE1lbnVPYmplY3RJRCk7XG4gICAgICAgIG5lZ0ZvdXJ0aE1lbnVFbC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21lbnUnICsgbmVnRm91cnRoTWVudU9iamVjdElEKTtcbiAgICAgICAgbmVnRm91cnRoTWVudUVsLnNldEF0dHJpYnV0ZSgnZmlsZScsIG9iamVjdEFycmF5W25lZ0ZvdXJ0aE1lbnVPYmplY3RJRF0uZmlsZSk7XG4gICAgICAgIG5lZ1RoaXJkTWVudUVsUG9zaXRpb24gPSBuZWdUaGlyZE1lbnVFbC5vYmplY3QzRC5wb3NpdGlvbjtcbiAgICAgICAgbmVnRm91cnRoTWVudUVsLnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCAobmVnVGhpcmRNZW51RWxQb3NpdGlvbi54IC0gMC4wNzUpICsgXCIgXCIgKyBuZWdUaGlyZE1lbnVFbFBvc2l0aW9uLnkgKyBcIiBcIiArIG5lZ1RoaXJkTWVudUVsUG9zaXRpb24ueik7XG5cbiAgICAgICAgLy8gbWVudTogYWRkIHRoZSBuZXdseSBjbG9uZWQgYW5kIG1vZGlmaWVkIG1lbnUgb2JqZWN0IHByZXZpZXdcbiAgLy8gICAgICBtZW51T2JqZWN0TGlzdEVsLmFwcGVuZENoaWxkKG5lZ0ZvdXJ0aE1lbnVFbCk7XG4gICAgICAgIG1lbnVPYmplY3RMaXN0RWwuaW5zZXJ0QmVmb3JlKCBuZWdGb3VydGhNZW51RWwsIG1lbnVPYmplY3RMaXN0RWwuZmlyc3RDaGlsZCApO1xuXG4gICAgICAgIC8vIG1lbnU6IGdldCBjaGlsZCBlbGVtZW50cyBmb3IgaW1hZ2UgYW5kIG5hbWUsIHBvcHVsYXRlIGJvdGggYXBwcm9wcmlhdGVseVxuICAgICAgICB2YXIgYXBwZW5kZWROZWdGb3VydGhNZW51RWwgPSAkKCcjbWVudScgKyAobmVnRm91cnRoTWVudU9iamVjdElEKSk7XG4gICAgICAgIGFwcGVuZGVkTmVnRm91cnRoTWVudUVsLmNoaWxkcmVuKFwiLnByZXZpZXdJbWFnZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdhc3NldHMvcHJldmlldy8nICsgb2JqZWN0QXJyYXlbbmVnRm91cnRoTWVudU9iamVjdElEXS5maWxlICsgJy5qcGcnKVxuICAgICAgICBhcHBlbmRlZE5lZ0ZvdXJ0aE1lbnVFbC5jaGlsZHJlbihcIi5vYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAndGV4dCcsIGh1bWFuaXplKG9iamVjdEFycmF5W25lZ0ZvdXJ0aE1lbnVPYmplY3RJRF0uZmlsZSkpO1xuICAgICAgICBhcHBlbmRlZE5lZ0ZvdXJ0aE1lbnVFbC5jaGlsZHJlbihcIi5vYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAnIzc0NzQ3NCcpO1xuICAgICAgLy8gTEVGVCBNRU5VIEVORCA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEluY3JlbWVudCBieSAxIGFuZCBzdGFydCBvdmVyIGF0IDAgaWYgcmVhY2hlZCB0aGUgZW5kXG4gICAgXHRcdG9iamVjdElkICs9IDE7XG4gICAgXHRcdGlmIChvYmplY3RJZCA9PSBvYmplY3RBcnJheS5sZW5ndGgpIHtvYmplY3RJZCA9IDB9XG5cbiAgICAgICAgLy8gUklHSFQgQlVUVE9OIE1FTlUgU1RBUlQgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAvLyBtZW51OiBhbmltYXRlIGFycm93IHJpZ2h0XG4gICAgICAgIHZhciBhcnJvd1JpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1JpZ2h0XCIpO1xuICAgICAgICBhcnJvd1JpZ2h0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xuICAgICAgICBhcnJvd1JpZ2h0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XG4gICAgICAgIGFycm93UmlnaHQucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJyk7XG4gICAgICAgIGFycm93UmlnaHQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XG4gICAgICAgIGFycm93UmlnaHQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XG4gICAgICAgIGFycm93UmlnaHQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJywgeyBwcm9wZXJ0eTogJ3NjYWxlJywgZHVyOiA1MDAsIGZyb206IFwiLTAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIi0wLjAwNCAwLjAwMiAwLjAwNFwiIH0pO1xuXG4gICAgICAgIC8vIG1lbnU6IGdldCB0aGUgbmV3bHkgc2VsZWN0ZWQgbWVudSBlbGVtZW50XG4gICAgICAgIGNvbnN0IG5ld01lbnVFbCA9ICQoXCJhLWVudGl0eSNtZW51T2JqZWN0TGlzdFwiKS5maW5kKFwiYS1lbnRpdHlbb2JqZWN0SWQ9XCIgKyBvYmplY3RJZCArIFwiXVwiKTtcblxuICAgICAgICAvLyBtZW51OiByZW1vdmUgc2VsZWN0ZWQgY2xhc3MgYW5kIGNoYW5nZSBjb2xvcnNcbiAgICAgICAgb2xkTWVudUVsLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICAgIG5ld01lbnVFbC5hZGRDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAgICBvbGRNZW51RWwuY2hpbGRyZW4oXCIub2JqZWN0TmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ2JtZm9udC10ZXh0JywgJ2NvbG9yJywgJ2dyYXknKTtcbiAgICAgICAgbmV3TWVudUVsLmNoaWxkcmVuKFwiLm9iamVjdE5hbWVcIilbMF0uc2V0QXR0cmlidXRlKCdibWZvbnQtdGV4dCcsICdjb2xvcicsICd5ZWxsb3cnKTtcbiAgICAgICAgb2xkTWVudUVsLmNoaWxkcmVuKFwiLnByZXZpZXdGcmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ21hdGVyaWFsJywgJ2NvbG9yJywgJyMyMjIyMjInKTtcbiAgICAgICAgbmV3TWVudUVsLmNoaWxkcmVuKFwiLnByZXZpZXdGcmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ21hdGVyaWFsJywgJ2NvbG9yJywgJ3llbGxvdycpO1xuXG4gICAgICAgIC8vIG1lbnU6IHNsaWRlIHRoZSBtZW51IGxpc3QgbGVmdCBieSAxXG4gICAgICAgIGNvbnN0IG1lbnVPYmplY3RMaXN0RWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnVPYmplY3RMaXN0XCIpO1xuICAgICAgICAvLyB1c2UgdGhlIGRlc2lyZWRQb3NpdGlvbiBhdHRyaWJ1dGUgKGlmIGV4aXN0cykgaW5zdGVhZCBvZiBvYmplY3QzRCBwb3NpdGlvbiBhcyBhbmltYXRpb24gbWF5IG5vdCBiZSBkb25lIHlldFxuICAgICAgICBpZiAobWVudU9iamVjdExpc3RFbC5oYXNBdHRyaWJ1dGUoXCJkZXNpcmVkUG9zaXRpb25cIikpIHtcbiAgICAgICAgICB2YXIgb2xkUG9zaXRpb24gPSBtZW51T2JqZWN0TGlzdEVsLmdldEF0dHJpYnV0ZShcImRlc2lyZWRQb3NpdGlvblwiKTtcbiAgICAgICAgICB2YXIgbmV3WCA9IHBhcnNlRmxvYXQob2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzBdKSAtIDAuMDc1O1xuICAgICAgICAgIHZhciBuZXdQb3NpdGlvblN0cmluZyA9IG5ld1gudG9TdHJpbmcoKSArIFwiIFwiICsgb2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzFdICsgXCIgXCIgKyBvbGRQb3NpdGlvbi5zcGxpdChcIiBcIilbMl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0gbWVudU9iamVjdExpc3RFbC5vYmplY3QzRC5wb3NpdGlvbjtcbiAgICAgICAgICB2YXIgbmV3WCA9IG9sZFBvc2l0aW9uLnggLSAwLjA3NTsgLy8gdGhpcyBzaG91bGQgYmUgYSB2YXJpYWJsZSBzb29uXG4gICAgICAgICAgdmFyIG5ld1Bvc2l0aW9uU3RyaW5nID0gbmV3WC50b1N0cmluZygpICsgXCIgXCIgKyBvbGRQb3NpdGlvbi55ICsgXCIgXCIgKyBvbGRQb3NpdGlvbi56O1xuICAgICAgICB9XG4gICAgICAgIG1lbnVPYmplY3RMaXN0RWwucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX3NsaWRlJyk7XG4gICAgICAgIG1lbnVPYmplY3RMaXN0RWwuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX3NsaWRlJywgeyBwcm9wZXJ0eTogJ3Bvc2l0aW9uJywgZHVyOiA1MDAsIGZyb206IG9sZFBvc2l0aW9uLCB0bzogbmV3UG9zaXRpb25TdHJpbmcgfSk7XG4gICAgICAgIG1lbnVPYmplY3RMaXN0RWwuc2V0QXR0cmlidXRlKCdkZXNpcmVkUG9zaXRpb24nLCBuZXdQb3NpdGlvblN0cmluZyk7XG5cbiAgICAgICAgLy8gbWVudTogbWFrZSB0aGUgaGlkZGVuIG1vc3QgcmlnaHRtb3N0IG9iamVjdCAoKzMgZnJvbSBvbGRNZW51RWwgaW5kZXgpIHZpc2libGVcbiAgICAgICAgdmFyIHRoaXJkTWVudUVsID0gb2xkTWVudUVsWzBdLm5leHRFbGVtZW50U2libGluZy5uZXh0RWxlbWVudFNpYmxpbmcubmV4dEVsZW1lbnRTaWJsaW5nO1xuXG4gICAgICAgIHRoaXJkTWVudUVsLnNldEF0dHJpYnV0ZSgndmlzaWJsZScsJ3RydWUnKTtcblxuICAgICAgICAvLyBUT0RPIE5PVCBXT1JLSU5HIEFGVEVSIEZJUlNUIElURVJBVElPTlxuICAgICAgICAvLyB0aGlyZE1lbnVFbC5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbicpO1xuICAgICAgICB0aGlyZE1lbnVFbC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbicsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiAnMC41IDAuNSAwLjUnLCB0bzogJzEuMCAxLjAgMS4wJyB9KTtcblxuICAgICAgICAvLyBtZW51OiBkZXN0cm95IHRoZSBoaWRkZW4gbW9zdCBsZWZ0bW9zdCBvYmplY3QgKC0zIGZyb20gb2xkTWVudUVsIGluZGV4KVxuICAgICAgICB2YXIgbmVnVGhpcmRNZW51RWwgPSBvbGRNZW51RWxbMF0ucHJldmlvdXNFbGVtZW50U2libGluZy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgICAgIG5lZ1RoaXJkTWVudUVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobmVnVGhpcmRNZW51RWwpO1xuXG4gICAgICAgIC8vIG1lbnU6IG1ha2UgdGhlIHNlY29uZCBsZWZ0bW9zdCBvYmplY3QgKC0yIGZyb20gb2xkTWVudUVsIGluZGV4KSBpbnZpc2libGVcbiAgICAgICAgdmFyIG5lZ1NlY29uZE1lbnVFbCA9IG9sZE1lbnVFbFswXS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgICAgIG5lZ1NlY29uZE1lbnVFbC5zZXRBdHRyaWJ1dGUoJ3Zpc2libGUnLCAnZmFsc2UnKTtcblxuICAgICAgICAvLyBtZW51OiBDcmVhdGUgdGhlIG5leHQgcmlnaHRtb3N0IG9iamVjdCBwcmV2aWV3ICgrNCBmcm9tIG9sZE1lbnVFbCBpbmRleCkgYnV0IGtlZXAgaXQgaGlkZGVuIHVudGlsIGl0J3MgbmVlZGVkXG4gICAgICAgIHZhciBmb3VydGhNZW51RWwgPSB0aGlyZE1lbnVFbC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIGZvdXJ0aE1lbnVFbC5zZXRBdHRyaWJ1dGUoJ3Zpc2libGUnLCAnZmFsc2UnKTtcbiAgICAgICAgLy8gaWYgb2JqZWN0SWQgKyAzIDwgbGVuZ3RoIHRoZW4gdXNlIHRoaXMgbnVtYmVyXG4gICAgICAgIC8vIGlmIG9iamVjdElkICsgMyA+IGxlbmd0aCwgdGhlbiB1c2UgdGhpcyByZXF1ZXN0ZWQgbnVtYmVyIG1pbnVzIHRoZSBsZW5ndGggb2YgdGhlIG9iamVjdCBhcnJheVxuICAgICAgICB2YXIgZm91cnRoTWVudU9iamVjdElEID0gKG9iamVjdElkICsgMyA8IG9iamVjdEFycmF5Lmxlbmd0aCkgPyAob2JqZWN0SWQgKyAzKSA6IChvYmplY3RJZCArIDMgLSBvYmplY3RBcnJheS5sZW5ndGgpO1xuICAgICAgICBmb3VydGhNZW51RWwuc2V0QXR0cmlidXRlKCdvYmplY3RJZCcsIGZvdXJ0aE1lbnVPYmplY3RJRCk7XG4gICAgICAgIGZvdXJ0aE1lbnVFbC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21lbnUnICsgZm91cnRoTWVudU9iamVjdElEKTtcbiAgICAgICAgZm91cnRoTWVudUVsLnNldEF0dHJpYnV0ZSgnZmlsZScsIG9iamVjdEFycmF5W2ZvdXJ0aE1lbnVPYmplY3RJRF0uZmlsZSk7XG4gICAgICAgIHRoaXJkTWVudUVsUG9zaXRpb24gPSB0aGlyZE1lbnVFbC5vYmplY3QzRC5wb3NpdGlvbjtcbiAgICAgICAgZm91cnRoTWVudUVsLnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCAodGhpcmRNZW51RWxQb3NpdGlvbi54ICsgMC4wNzUpICsgXCIgXCIgKyB0aGlyZE1lbnVFbFBvc2l0aW9uLnkgKyBcIiBcIiArIHRoaXJkTWVudUVsUG9zaXRpb24ueik7XG5cbiAgICAgICAgLy8gbWVudTogYWRkIHRoZSBuZXdseSBjbG9uZWQgYW5kIG1vZGlmaWVkIG1lbnUgb2JqZWN0IHByZXZpZXdcbiAgICAgICAgbWVudU9iamVjdExpc3RFbC5hcHBlbmRDaGlsZChmb3VydGhNZW51RWwpO1xuXG4gICAgICAgIC8vIG1lbnU6IGdldCBjaGlsZCBlbGVtZW50cyBmb3IgaW1hZ2UgYW5kIG5hbWUsIHBvcHVsYXRlIGJvdGggYXBwcm9wcmlhdGVseVxuICAgICAgICB2YXIgYXBwZW5kZWRGb3VydGhNZW51RWwgPSAkKCcjbWVudScgKyAoZm91cnRoTWVudU9iamVjdElEKSk7XG4gICAgICAgIGFwcGVuZGVkRm91cnRoTWVudUVsLmNoaWxkcmVuKFwiLnByZXZpZXdJbWFnZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdhc3NldHMvcHJldmlldy8nICsgb2JqZWN0QXJyYXlbZm91cnRoTWVudU9iamVjdElEXS5maWxlICsgJy5qcGcnKVxuICAgICAgICBhcHBlbmRlZEZvdXJ0aE1lbnVFbC5jaGlsZHJlbihcIi5vYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAndGV4dCcsIGh1bWFuaXplKG9iamVjdEFycmF5W2ZvdXJ0aE1lbnVPYmplY3RJRF0uZmlsZSkpO1xuICAgICAgICBhcHBlbmRlZEZvdXJ0aE1lbnVFbC5jaGlsZHJlbihcIi5vYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAnIzc0NzQ3NCcpO1xuICAgICAgICAvLyBSSUdIVCBCVVRUT04gTUVOVSBFTkQgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElGIExFRlQgQ09OVFJPTExFUlxuICAgICAgICBvYmplY3RJZCArPSAxO1xuICAgICAgICBpZiAob2JqZWN0SWQgPT0gb2JqZWN0QXJyYXkubGVuZ3RoKSB7b2JqZWN0SWQgPSAwfVxuICAgIH1cblxuXHRcdC8vIFNldCB0aGUgcHJldmlldyBvYmplY3QgdG8gYmUgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBcInByZXZpZXdcIiBpdGVtXG4gICAgdGhpc0l0ZW1FbC5zZXRBdHRyaWJ1dGUoJ29iai1tb2RlbCcsIHsgb2JqOiBcInVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbb2JqZWN0SWRdLmZpbGUgKyBcIi5vYmopXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdGw6IFwidXJsKGFzc2V0cy9vYmovXCIgKyBvYmplY3RBcnJheVtvYmplY3RJZF0uZmlsZSArIFwiLm10bClcIn0pO1xuXHRcdHRoaXNJdGVtRWwuc2V0QXR0cmlidXRlKCdzY2FsZScsIG9iamVjdEFycmF5W29iamVjdElkXS5zY2FsZSk7XG5cdFx0dGhpc0l0ZW1FbC5zZXRBdHRyaWJ1dGUoJ29iamVjdElkJywgb2JqZWN0SWQpO1xuXG5cblxuXHR9LFxuXG4gIG9uT2JqZWN0UHJldmlvdXM6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBzd2l0Y2ggYmV0d2VlbiB0aGUgYXZhaWxhYmxlIG9iamVjdCBvciBiYXNlc1xuXG4gICAgLy8gRmV0Y2ggdGhlIEl0ZW0gZWxlbWVudCAodGhlIHBsYWNlYWJsZSBjaXR5IG9iamVjdCkgc2VsZWN0ZWQgb24gdGhpcyBjb250cm9sbGVyXG4gICAgdmFyIHRoaXNJdGVtSUQgPSAodGhpcy5lbC5pZCA9PT0gJ2xlZnRDb250cm9sbGVyJykgPyAnI2xlZnRJdGVtJzonI3JpZ2h0SXRlbSc7XG4gICAgdmFyIHRoaXNJdGVtRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXNJdGVtSUQpO1xuXG4gICAgLy8gV2hhdCdzIHRoZSB0eXBlIG9mIG9iamVjdCBjdXJyZW50bHkgc2VsZWN0ZWQ/IEZvciBleGFtcGxlLCBcIm1tbW1fYWxpZW5cIiBvciBcImJhc2VzXCJcbiAgICB2YXIgb2JqZWN0R3JvdXAgPSB0aGlzSXRlbUVsLmF0dHJpYnV0ZXMub2JqZWN0R3JvdXAudmFsdWU7XG5cbiAgICAvLyBHZXQgYW4gQXJyYXkgb2YgYWxsIHRoZSBvYmplY3RzIG9mIHRoaXMgdHlwZVxuICAgIHZhciBvYmplY3RBcnJheSA9IG9iamVjdERhdGFTdG9yZS5mZXRjaEpTT04ob2JqZWN0R3JvdXApO1xuXG4gICAgLy8gV2hhdCBpcyB0aGUgSUQgb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBpdGVtP1xuICAgIHZhciBvYmplY3RJZCA9IHBhcnNlSW50KHRoaXNJdGVtRWwuYXR0cmlidXRlcy5vYmplY3RJZC52YWx1ZSk7XG5cbiAgICAvLyBtZW51OiBzYXZlIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgbWVudSBlbGVtZW50XG4gICAgY29uc3Qgb2xkTWVudUVsID0gJChcImEtZW50aXR5I21lbnVPYmplY3RMaXN0XCIpLmZpbmQoXCJhLWVudGl0eVtvYmplY3RJZD1cIiArIG9iamVjdElkICsgXCJdXCIpO1xuXG4gICAgLy8gRGVjcmVtZW50IGJ5IDEgYW5kIHN0YXJ0IG92ZXIgYXQgbGFzdCBvYmplY3QgaWYgcmVhY2hlZCB0aGUgYmVnaW5uaW5nXG4gICAgb2JqZWN0SWQgLT0gMTtcbiAgICBpZiAob2JqZWN0SWQgPT0gLTEpIHtvYmplY3RJZCA9IG9iamVjdEFycmF5Lmxlbmd0aCAtIDF9XG5cbiAgICAvLyBTZXQgdGhlIG5leHQgb2JqZWN0IHRvIGJlIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgXCJwcmV2aWV3XCIgaXRlbVxuICAgIHRoaXNJdGVtRWwuc2V0QXR0cmlidXRlKCdvYmotbW9kZWwnLCB7IG9iajogXCJ1cmwoYXNzZXRzL29iai9cIiArIG9iamVjdEFycmF5W29iamVjdElkXS5maWxlICsgXCIub2JqKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXRsOiBcInVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbb2JqZWN0SWRdLmZpbGUgKyBcIi5tdGwpXCJ9KTtcbiAgICB0aGlzSXRlbUVsLnNldEF0dHJpYnV0ZSgnc2NhbGUnLCBvYmplY3RBcnJheVtvYmplY3RJZF0uc2NhbGUpO1xuICAgIHRoaXNJdGVtRWwuc2V0QXR0cmlidXRlKCdvYmplY3RJZCcsIG9iamVjdElkKTtcblxuICB9LFxuXG4gIC8qKlxuICAgKiBVbmRvIC0gZGVsZXRlcyB0aGUgbW9zdCByZWNlbnRseSBwbGFjZWQgb2JqZWN0XG4gICAqL1xuICBvblVuZG86IGZ1bmN0aW9uICgpIHtcblx0XHRwcmV2aW91c09iamVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjb2JqZWN0XCIgKyAob2JqZWN0Q291bnQgLSAxKSk7XG5cdFx0cHJldmlvdXNPYmplY3QucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwcmV2aW91c09iamVjdCk7XG5cdFx0b2JqZWN0Q291bnQgLT0gMTtcblx0XHRpZihvYmplY3RDb3VudCA9PSAtMSkge29iamVjdENvdW50ID0gMH07XG4gIH0sXG5cbiAgLyoqXG4gICAqIFN1bW1vbnMgYSBzdGljayAoZm9yIHJlYWNoKSAtIGxlZ2FjeSBmcm9tIGRvbWlub2VzIHByb2plY3RcbiAgICpcbiAgICovXG4vLyAgIG9uT2xkR3JpcERvd246IGZ1bmN0aW9uICgpIHtcbi8vICAgICB2YXIgY29udHJvbGxlckVsID0gZDMuc2VsZWN0KHRoaXMuZWwpO1xuLy8gICAgIHZhciBzdGlja0VsO1xuLy9cbi8vICAgICAvLyBLZWVwIHRyYWNrIG9mIFVJIG9wZW4vY2xvc2Vcbi8vICAgICBpZiAodGhpcy5zdGlja1ByZXNlbnQpIHtcbi8vICAgICAgIC8vIFJlbW92ZSBzdGlja1xuLy8gICAgICAgc3RpY2tFbCA9IGNvbnRyb2xsZXJFbC5zZWxlY3QoJyNzdGljaycpO1xuLy8gICAgICAgc3RpY2tFbC50cmFuc2l0aW9uKClcbi8vICAgICAgICAgICAgICAgICAuZHVyYXRpb24oMTAwMClcbi8vICAgICAgICAgICAgICAgICAuYXR0cignb3BhY2l0eScsICcwJylcbi8vICAgICAgICAgICAgICAgICAucmVtb3ZlKCk7XG4vL1xuLy8gICAgICAgdGhpcy5zdGlja1ByZXNlbnQgPSBmYWxzZTtcbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgLy8gQWRkIHN0aWNrXG4vLyAgICAgICBjb250cm9sbGVyRWwuYXBwZW5kKCdhLWJveCcpXG4vLyAgICAgICAgICAgICAgICAgICAuYXR0cignaWQnLCAnc3RpY2snKVxuLy8gICAgICAgICAgICAgICAgICAgLmF0dHIoJ29wYWNpdHknLCAnMCcpXG4vLyAgICAgICAgICAgICAgICAgICAvLyAuYXR0cignc3RhdGljLWJvZHknLCAnJylcbi8vICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsICcwLjEnKVxuLy8gICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsICcwLjEnKVxuLy8gICAgICAgICAgICAgICAgICAgLmF0dHIoJ2RlcHRoJywgJzEnKVxuLy8gICAgICAgICAgICAgICAgICAgLmF0dHIoJ2NvbG9yJywgJ2JsYWNrJylcbi8vICAgICAgICAgICAgICAgICAgIC5hdHRyKCdwb3NpdGlvbicsICcwIDAgLTEnKVxuLy8gICAgICAgICAgICAgICAgICAgICAudHJhbnNpdGlvbigpXG4vLyAgICAgICAgICAgICAgICAgICAgIC5kdXJhdGlvbigxMDAwKVxuLy8gICAgICAgICAgICAgICAgICAgICAuYXR0cignb3BhY2l0eScsICcxJyk7XG4vL1xuLy8gICAgICAgdGhpcy5zdGlja1ByZXNlbnQgPSB0cnVlO1xuLy8gICAgIH1cbi8vICAgfVxuXG59KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2xpYi9idWlsZGVyLWNvbnRyb2xzLmpzIiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUgKi9cblxuLyoqXG4gKiBMb2FkcyBhbmQgc2V0dXAgZ3JvdW5kIG1vZGVsLlxuICovXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2dyb3VuZCcsIHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBvYmplY3RMb2FkZXI7XG4gICAgdmFyIG9iamVjdDNEID0gdGhpcy5lbC5vYmplY3QzRDtcbiAgICB2YXIgTU9ERUxfVVJMID0gJ2h0dHBzOi8vY2RuLmFmcmFtZS5pby9saW5rLXRyYXZlcnNhbC9tb2RlbHMvZ3JvdW5kLmpzb24nO1xuICAgIGlmICh0aGlzLm9iamVjdExvYWRlcikgeyByZXR1cm47IH1cbiAgICBvYmplY3RMb2FkZXIgPSB0aGlzLm9iamVjdExvYWRlciA9IG5ldyBUSFJFRS5PYmplY3RMb2FkZXIoKTtcbiAgICBvYmplY3RMb2FkZXIuY3Jvc3NPcmlnaW4gPSAnJztcbiAgICBvYmplY3RMb2FkZXIubG9hZChNT0RFTF9VUkwsIGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIG9iai5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YWx1ZS5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdmFsdWUubWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xuICAgICAgfSk7XG4gICAgICBvYmplY3QzRC5hZGQob2JqKTtcbiAgICB9KTtcbiAgfVxufSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvZ3JvdW5kLmpzIiwiLyogZ2xvYmFsIEFGUkFNRSAqL1xuQUZSQU1FLnJlZ2lzdGVyU2hhZGVyKCdza3lHcmFkaWVudCcsIHtcbiAgc2NoZW1hOiB7XG4gICAgY29sb3JUb3A6IHsgdHlwZTogJ2NvbG9yJywgZGVmYXVsdDogJ2JsYWNrJywgaXM6ICd1bmlmb3JtJyB9LFxuICAgIGNvbG9yQm90dG9tOiB7IHR5cGU6ICdjb2xvcicsIGRlZmF1bHQ6ICdyZWQnLCBpczogJ3VuaWZvcm0nIH1cbiAgfSxcblxuICB2ZXJ0ZXhTaGFkZXI6IFtcbiAgICAndmFyeWluZyB2ZWMzIHZXb3JsZFBvc2l0aW9uOycsXG5cbiAgICAndm9pZCBtYWluKCkgeycsXG5cbiAgICAgICd2ZWM0IHdvcmxkUG9zaXRpb24gPSBtb2RlbE1hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTsnLFxuICAgICAgJ3ZXb3JsZFBvc2l0aW9uID0gd29ybGRQb3NpdGlvbi54eXo7JyxcblxuICAgICAgJ2dsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTsnLFxuXG4gICAgJ30nXG5cbiAgXS5qb2luKCdcXG4nKSxcblxuICBmcmFnbWVudFNoYWRlcjogW1xuICAgICd1bmlmb3JtIHZlYzMgY29sb3JUb3A7JyxcbiAgICAndW5pZm9ybSB2ZWMzIGNvbG9yQm90dG9tOycsXG5cbiAgICAndmFyeWluZyB2ZWMzIHZXb3JsZFBvc2l0aW9uOycsXG5cbiAgICAndm9pZCBtYWluKCknLFxuXG4gICAgJ3snLFxuICAgICAgJ3ZlYzMgcG9pbnRPblNwaGVyZSA9IG5vcm1hbGl6ZSh2V29ybGRQb3NpdGlvbi54eXopOycsXG4gICAgICAnZmxvYXQgZiA9IDEuMDsnLFxuICAgICAgJ2lmKHBvaW50T25TcGhlcmUueSA+IC0gMC4yKXsnLFxuXG4gICAgICAgICdmID0gc2luKHBvaW50T25TcGhlcmUueSAqIDIuMCk7JyxcblxuICAgICAgJ30nLFxuICAgICAgJ2dsX0ZyYWdDb2xvciA9IHZlYzQobWl4KGNvbG9yQm90dG9tLGNvbG9yVG9wLCBmICksIDEuMCk7JyxcblxuICAgICd9J1xuICBdLmpvaW4oJ1xcbicpXG59KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2xpYi9za3lHcmFkaWVudC5qcyJdLCJzb3VyY2VSb290IjoiIn0=