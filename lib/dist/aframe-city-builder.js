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
	      controllerEl = document.getElementById(this.data.controllerID);
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
	      controllerEl = document.getElementById(this.data.controllerID);
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
	    list = ["kfarr_bases", "mmmm_veh", "mmmm_bld", "mmmm_alien", "mmmm_scene"];
	
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
	
	    newObject = document.getElementById(newId);
	    newObject.setAttribute("position", rounding ? roundedPositionString : originalPositionString); // this does set position
	
	    // If this is a "bases" type object, animate the transition to the snapped (rounded) position and rotation
	    if (rounding) {
	      newObject.setAttribute('animation', { property: 'rotation', dur: 500, from: originalEulerRotationString, to: roundedEulerRotationString });
	    };
	
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZDFhYzM5NzNjNzFjYTRjY2Q2ZjIiLCJ3ZWJwYWNrOi8vLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2FuaW1lanMvYW5pbWUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtdGV4dC1jb21wb25lbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50L2luZGV4LmpzIiwid2VicGFjazovLy8uL34vdGhyZWUtYm1mb250LXRleHQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9sYXlvdXQtYm1mb250LXRleHQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi93b3JkLXdyYXBwZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi94dGVuZC9pbW11dGFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9pbmRleG9mLXByb3BlcnR5L2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYXMtbnVtYmVyL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly8vLi9+L3F1YWQtaW5kaWNlcy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2R0eXBlL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYW4tYXJyYXkvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9pcy1idWZmZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi90aHJlZS1idWZmZXItdmVydGV4LWRhdGEvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9mbGF0dGVuLXZlcnRleC1kYXRhL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vb2JqZWN0LWFzc2lnbi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3RocmVlLWJtZm9udC10ZXh0L2xpYi92ZXJ0aWNlcy5qcyIsIndlYnBhY2s6Ly8vLi9+L3RocmVlLWJtZm9udC10ZXh0L2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvYWQtYm1mb250L2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9idWZmZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYXNlNjQtanMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9pZWVlNzU0L2luZGV4LmpzIiwid2VicGFjazovLy8uL34vaXNhcnJheS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3hoci9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2dsb2JhbC93aW5kb3cuanMiLCJ3ZWJwYWNrOi8vLy4vfi9pcy1mdW5jdGlvbi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIndlYnBhY2s6Ly8vLi9+L3RyaW0vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9mb3ItZWFjaC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3BhcnNlLWJtZm9udC1hc2NpaS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3BhcnNlLWJtZm9udC14bWwvbGliL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wYXJzZS1ibWZvbnQteG1sL2xpYi9wYXJzZS1hdHRyaWJzLmpzIiwid2VicGFjazovLy8uL34veG1sLXBhcnNlLWZyb20tc3RyaW5nL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vcGFyc2UtYm1mb250LWJpbmFyeS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvYWQtYm1mb250L2xpYi9pcy1iaW5hcnkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9idWZmZXItZXF1YWwvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50L2xpYi9zaGFkZXJzL3NkZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2FmcmFtZS1ibWZvbnQtdGV4dC1jb21wb25lbnQvZXh0cmFzL3RleHQtcHJpbWl0aXZlLmpzIiwid2VicGFjazovLy8uL2xpYi9hZnJhbWUtc2VsZWN0LWJhci5qcyIsIndlYnBhY2s6Ly8vLi9saWIvYnVpbGRlci1jb250cm9scy5qcyIsIndlYnBhY2s6Ly8vLi9saWIvZ3JvdW5kLmpzIiwid2VicGFjazovLy8uL2xpYi9za3lHcmFkaWVudC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiQUZSQU1FIiwiRXJyb3IiLCJmaW5kV2l0aEF0dHIiLCJhcnJheSIsImF0dHIiLCJ2YWx1ZSIsImkiLCJsZW5ndGgiLCJpbmRleE9mTWF4IiwiYXJyIiwibWF4IiwibWF4SW5kZXgiLCJsb29wSW5kZXgiLCJkZXNpcmVkSW5kZXgiLCJhcnJheUxlbmd0aCIsImFzc2VydCIsImNvbmRpdGlvbiIsIm1lc3NhZ2UiLCJ0ZXN0TG9vcEFycmF5IiwicmVnaXN0ZXJDb21wb25lbnQiLCJzY2hlbWEiLCJjb250cm9scyIsInR5cGUiLCJkZWZhdWx0IiwiY29udHJvbGxlcklEIiwic2VsZWN0ZWRPcHRncm91cFZhbHVlIiwic2VsZWN0ZWRPcHRncm91cEluZGV4Iiwic2VsZWN0ZWRPcHRpb25WYWx1ZSIsInNlbGVjdGVkT3B0aW9uSW5kZXgiLCJtYWtlU2VsZWN0T3B0aW9uc1JvdyIsInNlbGVjdGVkT3B0Z3JvdXBFbCIsInBhcmVudEVsIiwiaW5kZXgiLCJvZmZzZXRZIiwib3B0Z3JvdXBMYWJlbEVsIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiaWQiLCJzZXRBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJhcHBlbmRDaGlsZCIsIm9wdGlvbnNFbGVtZW50cyIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwib3B0aW9uc0VsZW1lbnRzQXJyYXkiLCJBcnJheSIsInByb3RvdHlwZSIsInNsaWNlIiwiY2FsbCIsImZpcnN0QXJyYXkiLCJwcmV2aWV3QXJyYXkiLCJtZW51QXJyYXkiLCJjb25jYXQiLCJzZWxlY3RPcHRpb25zSFRNTCIsInN0YXJ0UG9zaXRpb25YIiwiZGVsdGFYIiwiZm9yRWFjaCIsImVsZW1lbnQiLCJtZW51QXJyYXlJbmRleCIsInZpc2libGUiLCJzZWxlY3RlZCIsIm9yaWdpbmFsT3B0aW9uc0FycmF5SW5kZXgiLCJ0ZXh0Iiwic2VsZWN0T3B0aW9uc1Jvd0VsIiwiaW5uZXJIVE1MIiwicmVtb3ZlU2VsZWN0T3B0aW9uc1JvdyIsImdldEVsZW1lbnRCeUlkIiwiY29uc29sZSIsImxvZyIsImZpcnN0Q2hpbGQiLCJyZW1vdmVDaGlsZCIsInBhcmVudE5vZGUiLCJpbml0Iiwic2VsZWN0RWwiLCJlbCIsImRhdGEiLCJsYXN0VGltZSIsIkRhdGUiLCJzZWxlY3RSZW5kZXJFbCIsIm9wdGdyb3VwcyIsImFkZEV2ZW50TGlzdGVuZXJzIiwiY29udHJvbGxlckVsIiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uVHJhY2twYWREb3duIiwiYmluZCIsIm9uQXhpc01vdmUiLCJvbkhvdmVyTGVmdCIsIm9uSG92ZXJSaWdodCIsIm9uT3B0aW9uU3dpdGNoIiwib25PcHRpb25OZXh0Iiwib25PcHRpb25QcmV2aW91cyIsIm9uT3B0Z3JvdXBOZXh0Iiwib25PcHRncm91cFByZXZpb3VzIiwicmVtb3ZlRXZlbnRMaXN0ZW5lcnMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicGxheSIsInBhdXNlIiwicmVtb3ZlIiwiZXZ0IiwidGFyZ2V0IiwiZGV0YWlsIiwiYXhpcyIsImlzT2N1bHVzIiwiZ2FtZXBhZHMiLCJuYXZpZ2F0b3IiLCJnZXRHYW1lcGFkcyIsImdhbWVwYWQiLCJpbmRleE9mIiwiTWF0aCIsImFicyIsInlBeGlzIiwib25Ib3ZlclVwIiwib25Ib3ZlckRvd24iLCJ0aGlzVGltZSIsImZsb29yIiwiZW1pdCIsImFycm93IiwiY3VycmVudEFycm93Q29sb3IiLCJUSFJFRSIsIkNvbG9yIiwiY29sb3IiLCJyIiwicmVtb3ZlQXR0cmlidXRlIiwicHJvcGVydHkiLCJkdXIiLCJmcm9tIiwidG8iLCJnIiwiYXJyb3dDb2xvciIsImZsdXNoVG9ET00iLCJuZXh0U2VsZWN0ZWRPcHRncm91cEVsIiwibmV3bHlTZWxlY3RlZE1lbnVFbCIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJhcnJvd1VwQ29sb3IiLCJhcnJvd1JpZ2h0Q29sb3IiLCJhcnJvd0Rvd25Db2xvciIsImFycm93TGVmdENvbG9yIiwiYXJyb3dDb2xvckFycmF5R3JlZW4iLCJyZWR1Y2UiLCJhIiwiYiIsImRpcmVjdGlvbiIsIm9sZE1lbnVFbCIsIm9sZFNlbGVjdGVkT3B0aW9uSW5kZXgiLCJwYXJzZUludCIsImNoaWxkRWxlbWVudENvdW50IiwiYXJyb3dMZWZ0IiwibmV3TWVudUVsIiwicXVlcnlTZWxlY3RvckFsbCIsImNsYXNzTGlzdCIsImFkZCIsImhhc0F0dHJpYnV0ZSIsIm9sZFBvc2l0aW9uIiwibmV3WCIsInBhcnNlRmxvYXQiLCJzcGxpdCIsIm5ld1Bvc2l0aW9uU3RyaW5nIiwidG9TdHJpbmciLCJvYmplY3QzRCIsInBvc2l0aW9uIiwieCIsInkiLCJ6IiwibmV3bHlWaXNpYmxlT3B0aW9uSW5kZXgiLCJuZXdseVZpc2libGVPcHRpb25FbCIsIm5ld2x5UmVtb3ZlZE9wdGlvbkluZGV4IiwibmV3bHlSZW1vdmVkT3B0aW9uRWwiLCJuZXdseUludmlzaWJsZU9wdGlvbkluZGV4IiwibmV3bHlJbnZpc2libGVPcHRpb25FbCIsIm5ld2x5Q3JlYXRlZE9wdGlvbkVsIiwiY2xvbmVOb2RlIiwibmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgiLCJzb3VyY2VPcHRpb25FbCIsImNoaWxkcmVuIiwibmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24iLCJpbnNlcnRCZWZvcmUiLCJhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsIiwiYXJyb3dSaWdodCIsIm9iamVjdENvdW50IiwiaHVtYW5pemUiLCJzdHIiLCJmcmFncyIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwiam9pbiIsIm1lbnVJZCIsIm11bHRpcGxlIiwib25QbGFjZU9iamVjdCIsIm9uVW5kbyIsIm1lbnVFbCIsIm9uT2JqZWN0Q2hhbmdlIiwibGlzdCIsImdyb3VwSlNPTkFycmF5IiwiZ3JvdXBOYW1lIiwicmVxdWVzdFVSTCIsInJlcXVlc3QiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJyZXNwb25zZVR5cGUiLCJzZW5kIiwib25sb2FkIiwicmVzcG9uc2UiLCJuZXdPcHRncm91cEVsIiwib3B0aW9uc0hUTUwiLCJvYmplY3REZWZpbml0aW9uIiwidGhpc0l0ZW1JRCIsInRoaXNJdGVtRWwiLCJxdWVyeVNlbGVjdG9yIiwib2JqZWN0SWQiLCJhdHRyaWJ1dGVzIiwib2JqZWN0R3JvdXAiLCJyb3VuZGluZyIsIm9iamVjdEFycmF5IiwidGhpc0l0ZW1Xb3JsZFBvc2l0aW9uIiwiZ2V0V29ybGRQb3NpdGlvbiIsInRoaXNJdGVtV29ybGRSb3RhdGlvbiIsImdldFdvcmxkUm90YXRpb24iLCJvcmlnaW5hbFBvc2l0aW9uU3RyaW5nIiwicm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWCIsInJvdW5kIiwicm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWSIsInJvdW5kZWRJdGVtV29ybGRQb3NpdGlvbloiLCJyb3VuZGVkUG9zaXRpb25TdHJpbmciLCJ0aGlzSXRlbVdvcmxkUm90YXRpb25YIiwiX3giLCJQSSIsInRoaXNJdGVtV29ybGRSb3RhdGlvblkiLCJfeSIsInRoaXNJdGVtV29ybGRSb3RhdGlvbloiLCJfeiIsIm9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZyIsInJvdW5kZWRUaGlzSXRlbVdvcmxkUm90YXRpb25ZIiwicm91bmRlZEV1bGVyUm90YXRpb25TdHJpbmciLCJuZXdJZCIsIiQiLCJjbGFzcyIsInNjYWxlIiwicm90YXRpb24iLCJmaWxlIiwiYXBwZW5kVG8iLCJuZXdPYmplY3QiLCJjb21wb25lbnRzIiwibmV3T2JqZWN0SWQiLCJvYmoiLCJtdGwiLCJwcmV2aW91c09iamVjdCIsIm9iamVjdExvYWRlciIsIk1PREVMX1VSTCIsIk9iamVjdExvYWRlciIsImNyb3NzT3JpZ2luIiwibG9hZCIsInJlY2VpdmVTaGFkb3ciLCJtYXRlcmlhbCIsInNoYWRpbmciLCJGbGF0U2hhZGluZyIsInJlZ2lzdGVyU2hhZGVyIiwiY29sb3JUb3AiLCJpcyIsImNvbG9yQm90dG9tIiwidmVydGV4U2hhZGVyIiwiZnJhZ21lbnRTaGFkZXIiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7QUN0Q0Esb0JBQUFBLENBQVEsQ0FBUjtBQUNBLG9CQUFBQSxDQUFRLENBQVI7QUFDQSxvQkFBQUEsQ0FBUSxDQUFSO0FBQ0Esb0JBQUFBLENBQVEsQ0FBUjtBQUNBLG9CQUFBQSxDQUFRLEVBQVI7QUFDQSxvQkFBQUEsQ0FBUSxFQUFSO0FBQ0Esb0JBQUFBLENBQVEsRUFBUjtBQUNBLG9CQUFBQSxDQUFRLEVBQVIsRTs7Ozs7O0FDUEE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLGFBQWE7QUFDeEIsaUJBQWdCLGNBQWM7QUFDOUIsdUJBQXNCLGVBQWU7QUFDckMsaUJBQWdCO0FBQ2hCLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7Ozs7Ozs7QUNuQ0Q7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLFdBQVc7QUFDdkIsV0FBVSxZQUFZO0FBQ3RCLFdBQVUsY0FBYztBQUN4QixjQUFhLHNCQUFzQjtBQUNuQyxrQkFBaUIsYUFB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Q0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNEMsMEJBQTBCLEVBQUU7QUFDeEU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWM7QUFDZCxNQUFLO0FBQ0w7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrRUFBaUU7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZO0FBQ1o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQLE1BQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1REFBc0QsdUJBQXVCO0FBQzdFO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBOztB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Q0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFxQixPQUFPO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxvQkFBbUIsU0FBUztBQUM1QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSw2QkFBNEI7QUFDNUI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsRUFBQztBQUNEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtDQUFpQztBQUNqQztBQUNBLE9BQU07QUFDTjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0JBQWUsb0JBQW9CO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0JBQWUsbUJBQW1CO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0JBQWUsc0JBQXNCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGdCQUFlLGdCQUFnQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRTs7Ozs7O0FDalNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHNCQUFxQix3QkFBd0I7QUFDN0M7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFOzs7Ozs7QUM5SEE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQSxvQkFBbUIsc0JBQXNCO0FBQ3pDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7O0FDbEJBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EscUJBQW9CLGdCQUFnQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBLEU7Ozs7OztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRTs7Ozs7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBLEVBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUN0QkE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0JBQWU7QUFDZjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLDJCQUEwQixnQkFBZ0I7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRTs7Ozs7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3ZCQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3BCQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOERBQTZEO0FBQzdEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxnQ0FBK0IsaUJBQWlCO0FBQ2hELHNCQUFxQixTQUFTO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxpQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGtCQUFpQixRQUFRO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSCxtQ0FBa0M7QUFDbEM7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGlCQUFnQixzQkFBc0I7QUFDdEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQWtCLG9CQUFvQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTs7Ozs7OztBQzVFQTtBQUNBLFlBQVc7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFpQixXQUFXO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEVBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBLFlBQVc7QUFDWDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwREFBeUQ7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx3QkFBdUIsOEJBQThCOztBQUVyRDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxvQ0FBbUM7QUFDbkM7QUFDQTtBQUNBLElBQUc7QUFDSDs7Ozs7Ozs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxzQkFBcUIsbURBQW1EO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBbUIsVUFBVTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsWUFBWTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMkJBQTBCO0FBQzFCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLHdDQUF1QyxTQUFTO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdCQUFlLGlCQUFpQjtBQUNoQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWEsaUJBQWlCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQixTQUFTO0FBQzFCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFnRCxFQUFFO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLGtCQUFpQixTQUFTO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBeUM7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHlCQUF3QixlQUFlO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBLHlCQUF3QixRQUFRO0FBQ2hDO0FBQ0Esc0JBQXFCLGVBQWU7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0JBQWlCLFlBQVk7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLHNCQUFxQixTQUFTO0FBQzlCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxzQkFBcUIsU0FBUztBQUM5QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxzQkFBcUIsU0FBUztBQUM5QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsa0JBQWtCO0FBQ25DO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQSxvQkFBbUIsY0FBYztBQUNqQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0RBQXVELE9BQU87QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHdEQUF1RCxPQUFPO0FBQzlEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztB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RUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQSwyQ0FBMEM7QUFDMUM7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7O0FDaFBBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7QUFDQSxFQUFDO0FBQ0Q7QUFDQSxFQUFDO0FBQ0Q7QUFDQTs7Ozs7Ozs7QUNSQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxFOzs7Ozs7O0FDN0JBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7O0FDYkE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx3Q0FBdUMsU0FBUztBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EseUNBQXdDLFNBQVM7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLGtCQUFpQixrQkFBa0I7QUFDbkM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBLE1BQUs7QUFDTDtBQUNBLE1BQUs7QUFDTDtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtB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QWhCZ0MsRUFBbkMsRTs7Ozs7Ozs7QUNMQTtBQUNBbFAsUUFBTzhQLGNBQVAsQ0FBc0IsYUFBdEIsRUFBcUM7QUFDbkMxTyxXQUFRO0FBQ04yTyxlQUFVLEVBQUV6TyxNQUFNLE9BQVIsRUFBaUJDLFNBQVMsT0FBMUIsRUFBbUN5TyxJQUFJLFNBQXZDLEVBREo7QUFFTkMsa0JBQWEsRUFBRTNPLE1BQU0sT0FBUixFQUFpQkMsU0FBUyxLQUExQixFQUFpQ3lPLElBQUksU0FBckM7QUFGUCxJQUQyQjs7QUFNbkNFLGlCQUFjLENBQ1osOEJBRFksRUFHWixlQUhZLEVBS1YsMkRBTFUsRUFNVixxQ0FOVSxFQVFWLDJFQVJVLEVBVVosR0FWWSxFQVlaM0UsSUFaWSxDQVlQLElBWk8sQ0FOcUI7O0FBb0JuQzRFLG1CQUFnQixDQUNkLHdCQURjLEVBRWQsMkJBRmMsRUFJZCw4QkFKYyxFQU1kLGFBTmMsRUFRZCxHQVJjLEVBU1oscURBVFksRUFVWixnQkFWWSxFQVdaLDhCQVhZLEVBYVYsaUNBYlUsRUFlWixHQWZZLEVBZ0JaLDBEQWhCWSxFQWtCZCxHQWxCYyxFQW1CZDVFLElBbkJjLENBbUJULElBbkJTO0FBcEJtQixFQUFyQyxFIiwiZmlsZSI6ImFmcmFtZS1jaXR5LWJ1aWxkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBkMWFjMzk3M2M3MWNhNGNjZDZmMiIsInJlcXVpcmUoJ2FmcmFtZS1ncmlkaGVscGVyLWNvbXBvbmVudCcpO1xyXG5yZXF1aXJlKCdhZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudCcpO1xyXG5yZXF1aXJlKCdhZnJhbWUtdGV4dC1jb21wb25lbnQnKTtcclxucmVxdWlyZSgnYWZyYW1lLWJtZm9udC10ZXh0LWNvbXBvbmVudCcpO1xyXG5yZXF1aXJlKCcuL2xpYi9hZnJhbWUtc2VsZWN0LWJhci5qcycpO1xyXG5yZXF1aXJlKCcuL2xpYi9idWlsZGVyLWNvbnRyb2xzLmpzJyk7XHJcbnJlcXVpcmUoJy4vbGliL2dyb3VuZC5qcycpO1xyXG5yZXF1aXJlKCcuL2xpYi9za3lHcmFkaWVudC5qcycpO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9pbmRleC5qcyIsImlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xufVxuXG4vKipcbiAqIEdyaWRIZWxwZXIgY29tcG9uZW50IGZvciBBLUZyYW1lLlxuICovXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2dyaWRoZWxwZXInLCB7XG4gIHNjaGVtYToge1xuICAgIHNpemU6IHsgZGVmYXVsdDogNSB9LFxuICAgIGRpdmlzaW9uczogeyBkZWZhdWx0OiAxMCB9LFxuICAgIGNvbG9yQ2VudGVyTGluZToge2RlZmF1bHQ6ICdyZWQnfSxcbiAgICBjb2xvckdyaWQ6IHtkZWZhdWx0OiAnYmxhY2snfVxuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxsZWQgb25jZSB3aGVuIGNvbXBvbmVudCBpcyBhdHRhY2hlZC4gR2VuZXJhbGx5IGZvciBpbml0aWFsIHNldHVwLlxuICAgKi9cbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzY2VuZSA9IHRoaXMuZWwub2JqZWN0M0Q7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG5cbiAgICB2YXIgc2l6ZSA9IGRhdGEuc2l6ZTtcbiAgICB2YXIgZGl2aXNpb25zID0gZGF0YS5kaXZpc2lvbnM7XG4gICAgdmFyIGNvbG9yQ2VudGVyTGluZSA9IGRhdGEuY29sb3JDZW50ZXJMaW5lO1xuICAgIHZhciBjb2xvckdyaWQgPSBkYXRhLmNvbG9yR3JpZDtcblxuICAgIHZhciBncmlkSGVscGVyID0gbmV3IFRIUkVFLkdyaWRIZWxwZXIoIHNpemUsIGRpdmlzaW9ucywgY29sb3JDZW50ZXJMaW5lLCBjb2xvckdyaWQgKTtcbiAgICBncmlkSGVscGVyLm5hbWUgPSBcImdyaWRIZWxwZXJcIjtcbiAgICBzY2VuZS5hZGQoZ3JpZEhlbHBlcik7XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzY2VuZSA9IHRoaXMuZWwub2JqZWN0M0Q7XG4gICAgc2NlbmUucmVtb3ZlKHNjZW5lLmdldE9iamVjdEJ5TmFtZShcImdyaWRIZWxwZXJcIikpO1xuICB9XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyogZ2xvYmFsIEFGUkFNRSAqL1xuXG52YXIgYW5pbWUgPSByZXF1aXJlKCdhbmltZWpzJyk7XG5cbmlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xufVxuXG52YXIgdXRpbHMgPSBBRlJBTUUudXRpbHM7XG52YXIgZ2V0Q29tcG9uZW50UHJvcGVydHkgPSB1dGlscy5lbnRpdHkuZ2V0Q29tcG9uZW50UHJvcGVydHk7XG52YXIgc2V0Q29tcG9uZW50UHJvcGVydHkgPSB1dGlscy5lbnRpdHkuc2V0Q29tcG9uZW50UHJvcGVydHk7XG52YXIgc3R5bGVQYXJzZXIgPSB1dGlscy5zdHlsZVBhcnNlci5wYXJzZTtcblxuLyoqXG4gKiBBbmltYXRpb24gY29tcG9uZW50IGZvciBBLUZyYW1lLlxuICovXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2FuaW1hdGlvbicsIHtcbiAgc2NoZW1hOiB7XG4gICAgZGVsYXk6IHtkZWZhdWx0OiAwfSxcbiAgICBkaXI6IHtkZWZhdWx0OiAnJ30sXG4gICAgZHVyOiB7ZGVmYXVsdDogMTAwMH0sXG4gICAgZWFzaW5nOiB7ZGVmYXVsdDogJ2Vhc2VJblF1YWQnfSxcbiAgICBlbGFzdGljaXR5OiB7ZGVmYXVsdDogNDAwfSxcbiAgICBmcm9tOiB7ZGVmYXVsdDogJyd9LFxuICAgIGxvb3A6IHtkZWZhdWx0OiBmYWxzZX0sXG4gICAgcHJvcGVydHk6IHtkZWZhdWx0OiAnJ30sXG4gICAgcmVwZWF0OiB7ZGVmYXVsdDogMH0sXG4gICAgc3RhcnRFdmVudHM6IHt0eXBlOiAnYXJyYXknfSxcbiAgICBwYXVzZUV2ZW50czoge3R5cGU6ICdhcnJheSd9LFxuICAgIHJlc3VtZUV2ZW50czoge3R5cGU6ICdhcnJheSd9LFxuICAgIHJlc3RhcnRFdmVudHM6IHt0eXBlOiAnYXJyYXknfSxcbiAgICB0bzoge2RlZmF1bHQ6ICcnfVxuICB9LFxuXG4gIG11bHRpcGxlOiB0cnVlLFxuXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbiA9IG51bGw7XG4gICAgdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmNvbmZpZyA9IG51bGw7XG4gICAgdGhpcy5wbGF5QW5pbWF0aW9uQm91bmQgPSB0aGlzLnBsYXlBbmltYXRpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnBhdXNlQW5pbWF0aW9uQm91bmQgPSB0aGlzLnBhdXNlQW5pbWF0aW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXN1bWVBbmltYXRpb25Cb3VuZCA9IHRoaXMucmVzdW1lQW5pbWF0aW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXN0YXJ0QW5pbWF0aW9uQm91bmQgPSB0aGlzLnJlc3RhcnRBbmltYXRpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlcGVhdCA9IDA7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGF0dHJOYW1lID0gdGhpcy5hdHRyTmFtZTtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIHZhciBwcm9wVHlwZSA9IGdldFByb3BlcnR5VHlwZShlbCwgZGF0YS5wcm9wZXJ0eSk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFkYXRhLnByb3BlcnR5KSB7IHJldHVybjsgfVxuXG4gICAgLy8gQmFzZSBjb25maWcuXG4gICAgdGhpcy5yZXBlYXQgPSBkYXRhLnJlcGVhdDtcbiAgICB2YXIgY29uZmlnID0ge1xuICAgICAgYXV0b3BsYXk6IGZhbHNlLFxuICAgICAgYmVnaW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZWwuZW1pdCgnYW5pbWF0aW9uYmVnaW4nKTtcbiAgICAgICAgZWwuZW1pdChhdHRyTmFtZSArICctYmVnaW4nKTtcbiAgICAgIH0sXG4gICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBlbC5lbWl0KCdhbmltYXRpb25jb21wbGV0ZScpO1xuICAgICAgICBlbC5lbWl0KGF0dHJOYW1lICsgJy1jb21wbGV0ZScpO1xuICAgICAgICAvLyBSZXBlYXQuXG4gICAgICAgIGlmICgtLXNlbGYucmVwZWF0ID4gMCkgeyBzZWxmLmFuaW1hdGlvbi5wbGF5KCk7IH1cbiAgICAgIH0sXG4gICAgICBkaXJlY3Rpb246IGRhdGEuZGlyLFxuICAgICAgZHVyYXRpb246IGRhdGEuZHVyLFxuICAgICAgZWFzaW5nOiBkYXRhLmVhc2luZyxcbiAgICAgIGVsYXN0aWNpdHk6IGRhdGEuZWxhc3RpY2l0eSxcbiAgICAgIGxvb3A6IGRhdGEubG9vcFxuICAgIH07XG5cbiAgICAvLyBDdXN0b21pemUgY29uZmlnIGJhc2VkIG9uIHByb3BlcnR5IHR5cGUuXG4gICAgdmFyIHVwZGF0ZUNvbmZpZyA9IGNvbmZpZ0RlZmF1bHQ7XG4gICAgaWYgKHByb3BUeXBlID09PSAndmVjMicgfHwgcHJvcFR5cGUgPT09ICd2ZWMzJyB8fCBwcm9wVHlwZSA9PT0gJ3ZlYzQnKSB7XG4gICAgICB1cGRhdGVDb25maWcgPSBjb25maWdWZWN0b3I7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlnLlxuICAgIHRoaXMuY29uZmlnID0gdXBkYXRlQ29uZmlnKGVsLCBkYXRhLCBjb25maWcpO1xuICAgIHRoaXMuYW5pbWF0aW9uID0gYW5pbWUodGhpcy5jb25maWcpO1xuXG4gICAgLy8gU3RvcCBwcmV2aW91cyBhbmltYXRpb24uXG4gICAgdGhpcy5wYXVzZUFuaW1hdGlvbigpO1xuXG4gICAgaWYgKCF0aGlzLmRhdGEuc3RhcnRFdmVudHMubGVuZ3RoKSB7IHRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nID0gdHJ1ZTsgfVxuXG4gICAgLy8gUGxheSBhbmltYXRpb24gaWYgbm8gaG9sZGluZyBldmVudC5cbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucGF1c2VBbmltYXRpb24oKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gIH0sXG5cbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnBhdXNlQW5pbWF0aW9uKCk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYWZ0ZXIgdXBkYXRlLlxuICAgKi9cbiAgcGxheTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICghdGhpcy5hbmltYXRpb24gfHwgIXRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nKSB7IHJldHVybjsgfVxuXG4gICAgLy8gRGVsYXkuXG4gICAgaWYgKGRhdGEuZGVsYXkpIHtcbiAgICAgIHNldFRpbWVvdXQocGxheSwgZGF0YS5kZWxheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBsYXkoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwbGF5ICgpIHtcbiAgICAgIHNlbGYucGxheUFuaW1hdGlvbigpO1xuICAgICAgc2VsZi5hZGRFdmVudExpc3RlbmVycygpO1xuICAgIH1cbiAgfSxcblxuICBhZGRFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIGRhdGEuc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnBsYXlBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5wYXVzZUV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucGF1c2VBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5yZXN1bWVFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3VtZUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnJlc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3RhcnRBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICBkYXRhLnN0YXJ0RXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5wbGF5QW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucGF1c2VFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnBhdXNlQW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucmVzdW1lRXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5yZXN1bWVBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5yZXN0YXJ0RXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5yZXN0YXJ0QW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICB9LFxuXG4gIHBsYXlBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbi5wbGF5KCk7XG4gICAgdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcgPSB0cnVlO1xuICB9LFxuXG4gIHBhdXNlQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hbmltYXRpb24ucGF1c2UoKTtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IGZhbHNlO1xuICB9LFxuXG4gIHJlc3VtZUFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uLnBsYXkoKTtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IHRydWU7XG4gIH0sXG5cbiAgcmVzdGFydEFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uLnJlc3RhcnQoKTtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IHRydWU7XG4gIH1cbn0pO1xuXG4vKipcbiAqIFN0dWZmIHByb3BlcnR5IGludG8gZ2VuZXJpYyBgcHJvcGVydHlgIGtleS5cbiAqL1xuZnVuY3Rpb24gY29uZmlnRGVmYXVsdCAoZWwsIGRhdGEsIGNvbmZpZykge1xuICB2YXIgZnJvbSA9IGRhdGEuZnJvbSB8fCBnZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSk7XG4gIHJldHVybiBBRlJBTUUudXRpbHMuZXh0ZW5kKHt9LCBjb25maWcsIHtcbiAgICB0YXJnZXRzOiBbe2FmcmFtZVByb3BlcnR5OiBmcm9tfV0sXG4gICAgYWZyYW1lUHJvcGVydHk6IGRhdGEudG8sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSwgdGhpcy50YXJnZXRzWzBdLmFmcmFtZVByb3BlcnR5KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIEV4dGVuZCB4L3kvei93IG9udG8gdGhlIGNvbmZpZy5cbiAqL1xuZnVuY3Rpb24gY29uZmlnVmVjdG9yIChlbCwgZGF0YSwgY29uZmlnKSB7XG4gIHZhciBmcm9tID0gZ2V0Q29tcG9uZW50UHJvcGVydHkoZWwsIGRhdGEucHJvcGVydHkpO1xuICBpZiAoZGF0YS5mcm9tKSB7IGZyb20gPSBBRlJBTUUudXRpbHMuY29vcmRpbmF0ZXMucGFyc2UoZGF0YS5mcm9tKTsgfVxuICB2YXIgdG8gPSBBRlJBTUUudXRpbHMuY29vcmRpbmF0ZXMucGFyc2UoZGF0YS50byk7XG4gIHJldHVybiBBRlJBTUUudXRpbHMuZXh0ZW5kKHt9LCBjb25maWcsIHtcbiAgICB0YXJnZXRzOiBbZnJvbV0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSwgdGhpcy50YXJnZXRzWzBdKTtcbiAgICB9XG4gIH0sIHRvKTtcbn1cblxuZnVuY3Rpb24gZ2V0UHJvcGVydHlUeXBlIChlbCwgcHJvcGVydHkpIHtcbiAgdmFyIHNwbGl0ID0gcHJvcGVydHkuc3BsaXQoJy4nKTtcbiAgdmFyIGNvbXBvbmVudE5hbWUgPSBzcGxpdFswXTtcbiAgdmFyIHByb3BlcnR5TmFtZSA9IHNwbGl0WzFdO1xuICB2YXIgY29tcG9uZW50ID0gZWwuY29tcG9uZW50c1tjb21wb25lbnROYW1lXSB8fCBBRlJBTUUuY29tcG9uZW50c1tjb21wb25lbnROYW1lXTtcblxuICAvLyBQcmltaXRpdmVzLlxuICBpZiAoIWNvbXBvbmVudCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIGlmIChwcm9wZXJ0eU5hbWUpIHtcbiAgICByZXR1cm4gY29tcG9uZW50LnNjaGVtYVtwcm9wZXJ0eU5hbWVdLnR5cGU7XG4gIH1cbiAgcmV0dXJuIGNvbXBvbmVudC5zY2hlbWEudHlwZTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuICogQW5pbWUgdjEuMS4zXG4gKiBodHRwOi8vYW5pbWUtanMuY29tXG4gKiBKYXZhU2NyaXB0IGFuaW1hdGlvbiBlbmdpbmVcbiAqIENvcHlyaWdodCAoYykgMjAxNiBKdWxpYW4gR2FybmllclxuICogaHR0cDovL2p1bGlhbmdhcm5pZXIuY29tXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG4gICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgLy8gbGlrZSBOb2RlLlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5hbmltZSA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHZlcnNpb24gPSAnMS4xLjMnO1xuXG4gIC8vIERlZmF1bHRzXG5cbiAgdmFyIGRlZmF1bHRTZXR0aW5ncyA9IHtcbiAgICBkdXJhdGlvbjogMTAwMCxcbiAgICBkZWxheTogMCxcbiAgICBsb29wOiBmYWxzZSxcbiAgICBhdXRvcGxheTogdHJ1ZSxcbiAgICBkaXJlY3Rpb246ICdub3JtYWwnLFxuICAgIGVhc2luZzogJ2Vhc2VPdXRFbGFzdGljJyxcbiAgICBlbGFzdGljaXR5OiA0MDAsXG4gICAgcm91bmQ6IGZhbHNlLFxuICAgIGJlZ2luOiB1bmRlZmluZWQsXG4gICAgdXBkYXRlOiB1bmRlZmluZWQsXG4gICAgY29tcGxldGU6IHVuZGVmaW5lZFxuICB9XG5cbiAgLy8gVHJhbnNmb3Jtc1xuXG4gIHZhciB2YWxpZFRyYW5zZm9ybXMgPSBbJ3RyYW5zbGF0ZVgnLCAndHJhbnNsYXRlWScsICd0cmFuc2xhdGVaJywgJ3JvdGF0ZScsICdyb3RhdGVYJywgJ3JvdGF0ZVknLCAncm90YXRlWicsICdzY2FsZScsICdzY2FsZVgnLCAnc2NhbGVZJywgJ3NjYWxlWicsICdza2V3WCcsICdza2V3WSddO1xuICB2YXIgdHJhbnNmb3JtLCB0cmFuc2Zvcm1TdHIgPSAndHJhbnNmb3JtJztcblxuICAvLyBVdGlsc1xuXG4gIHZhciBpcyA9IHtcbiAgICBhcnI6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIEFycmF5LmlzQXJyYXkoYSkgfSxcbiAgICBvYmo6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKS5pbmRleE9mKCdPYmplY3QnKSA+IC0xIH0sXG4gICAgc3ZnOiBmdW5jdGlvbihhKSB7IHJldHVybiBhIGluc3RhbmNlb2YgU1ZHRWxlbWVudCB9LFxuICAgIGRvbTogZnVuY3Rpb24oYSkgeyByZXR1cm4gYS5ub2RlVHlwZSB8fCBpcy5zdmcoYSkgfSxcbiAgICBudW06IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICFpc05hTihwYXJzZUludChhKSkgfSxcbiAgICBzdHI6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAnc3RyaW5nJyB9LFxuICAgIGZuYzogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICdmdW5jdGlvbicgfSxcbiAgICB1bmQ6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAndW5kZWZpbmVkJyB9LFxuICAgIG51bDogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICdudWxsJyB9LFxuICAgIGhleDogZnVuY3Rpb24oYSkgeyByZXR1cm4gLyheI1swLTlBLUZdezZ9JCl8KF4jWzAtOUEtRl17M30kKS9pLnRlc3QoYSkgfSxcbiAgICByZ2I6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIC9ecmdiLy50ZXN0KGEpIH0sXG4gICAgaHNsOiBmdW5jdGlvbihhKSB7IHJldHVybiAvXmhzbC8udGVzdChhKSB9LFxuICAgIGNvbDogZnVuY3Rpb24oYSkgeyByZXR1cm4gKGlzLmhleChhKSB8fCBpcy5yZ2IoYSkgfHwgaXMuaHNsKGEpKSB9XG4gIH1cblxuICAvLyBFYXNpbmdzIGZ1bmN0aW9ucyBhZGFwdGVkIGZyb20gaHR0cDovL2pxdWVyeXVpLmNvbS9cblxuICB2YXIgZWFzaW5ncyA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgZWFzZXMgPSB7fTtcbiAgICB2YXIgbmFtZXMgPSBbJ1F1YWQnLCAnQ3ViaWMnLCAnUXVhcnQnLCAnUXVpbnQnLCAnRXhwbyddO1xuICAgIHZhciBmdW5jdGlvbnMgPSB7XG4gICAgICBTaW5lOiBmdW5jdGlvbih0KSB7IHJldHVybiAxICsgTWF0aC5zaW4oTWF0aC5QSSAvIDIgKiB0IC0gTWF0aC5QSSAvIDIpOyB9LFxuICAgICAgQ2lyYzogZnVuY3Rpb24odCkgeyByZXR1cm4gMSAtIE1hdGguc3FydCggMSAtIHQgKiB0ICk7IH0sXG4gICAgICBFbGFzdGljOiBmdW5jdGlvbih0LCBtKSB7XG4gICAgICAgIGlmKCB0ID09PSAwIHx8IHQgPT09IDEgKSByZXR1cm4gdDtcbiAgICAgICAgdmFyIHAgPSAoMSAtIE1hdGgubWluKG0sIDk5OCkgLyAxMDAwKSwgc3QgPSB0IC8gMSwgc3QxID0gc3QgLSAxLCBzID0gcCAvICggMiAqIE1hdGguUEkgKSAqIE1hdGguYXNpbiggMSApO1xuICAgICAgICByZXR1cm4gLSggTWF0aC5wb3coIDIsIDEwICogc3QxICkgKiBNYXRoLnNpbiggKCBzdDEgLSBzICkgKiAoIDIgKiBNYXRoLlBJICkgLyBwICkgKTtcbiAgICAgIH0sXG4gICAgICBCYWNrOiBmdW5jdGlvbih0KSB7IHJldHVybiB0ICogdCAqICggMyAqIHQgLSAyICk7IH0sXG4gICAgICBCb3VuY2U6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgdmFyIHBvdzIsIGJvdW5jZSA9IDQ7XG4gICAgICAgIHdoaWxlICggdCA8ICggKCBwb3cyID0gTWF0aC5wb3coIDIsIC0tYm91bmNlICkgKSAtIDEgKSAvIDExICkge31cbiAgICAgICAgcmV0dXJuIDEgLyBNYXRoLnBvdyggNCwgMyAtIGJvdW5jZSApIC0gNy41NjI1ICogTWF0aC5wb3coICggcG93MiAqIDMgLSAyICkgLyAyMiAtIHQsIDIgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbmFtZXMuZm9yRWFjaChmdW5jdGlvbihuYW1lLCBpKSB7XG4gICAgICBmdW5jdGlvbnNbbmFtZV0gPSBmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdyggdCwgaSArIDIgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhmdW5jdGlvbnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGVhc2VJbiA9IGZ1bmN0aW9uc1tuYW1lXTtcbiAgICAgIGVhc2VzWydlYXNlSW4nICsgbmFtZV0gPSBlYXNlSW47XG4gICAgICBlYXNlc1snZWFzZU91dCcgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIDEgLSBlYXNlSW4oMSAtIHQsIG0pOyB9O1xuICAgICAgZWFzZXNbJ2Vhc2VJbk91dCcgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIHQgPCAwLjUgPyBlYXNlSW4odCAqIDIsIG0pIC8gMiA6IDEgLSBlYXNlSW4odCAqIC0yICsgMiwgbSkgLyAyOyB9O1xuICAgICAgZWFzZXNbJ2Vhc2VPdXRJbicgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIHQgPCAwLjUgPyAoMSAtIGVhc2VJbigxIC0gMiAqIHQsIG0pKSAvIDIgOiAoZWFzZUluKHQgKiAyIC0gMSwgbSkgKyAxKSAvIDI7IH07XG4gICAgfSk7XG4gICAgZWFzZXMubGluZWFyID0gZnVuY3Rpb24odCkgeyByZXR1cm4gdDsgfTtcbiAgICByZXR1cm4gZWFzZXM7XG4gIH0pKCk7XG5cbiAgLy8gU3RyaW5nc1xuXG4gIHZhciBudW1iZXJUb1N0cmluZyA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiAoaXMuc3RyKHZhbCkpID8gdmFsIDogdmFsICsgJyc7XG4gIH1cblxuICB2YXIgc3RyaW5nVG9IeXBoZW5zID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgdmFyIHNlbGVjdFN0cmluZyA9IGZ1bmN0aW9uKHN0cikge1xuICAgIGlmIChpcy5jb2woc3RyKSkgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICB2YXIgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHN0cik7XG4gICAgICByZXR1cm4gbm9kZXM7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLy8gTnVtYmVyc1xuXG4gIHZhciByYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuICB9XG5cbiAgLy8gQXJyYXlzXG5cbiAgdmFyIGZsYXR0ZW5BcnJheSA9IGZ1bmN0aW9uKGFycikge1xuICAgIHJldHVybiBhcnIucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmNvbmNhdChpcy5hcnIoYikgPyBmbGF0dGVuQXJyYXkoYikgOiBiKTtcbiAgICB9LCBbXSk7XG4gIH1cblxuICB2YXIgdG9BcnJheSA9IGZ1bmN0aW9uKG8pIHtcbiAgICBpZiAoaXMuYXJyKG8pKSByZXR1cm4gbztcbiAgICBpZiAoaXMuc3RyKG8pKSBvID0gc2VsZWN0U3RyaW5nKG8pIHx8IG87XG4gICAgaWYgKG8gaW5zdGFuY2VvZiBOb2RlTGlzdCB8fCBvIGluc3RhbmNlb2YgSFRNTENvbGxlY3Rpb24pIHJldHVybiBbXS5zbGljZS5jYWxsKG8pO1xuICAgIHJldHVybiBbb107XG4gIH1cblxuICB2YXIgYXJyYXlDb250YWlucyA9IGZ1bmN0aW9uKGFyciwgdmFsKSB7XG4gICAgcmV0dXJuIGFyci5zb21lKGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGEgPT09IHZhbDsgfSk7XG4gIH1cblxuICB2YXIgZ3JvdXBBcnJheUJ5UHJvcHMgPSBmdW5jdGlvbihhcnIsIHByb3BzQXJyKSB7XG4gICAgdmFyIGdyb3VwcyA9IHt9O1xuICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uKG8pIHtcbiAgICAgIHZhciBncm91cCA9IEpTT04uc3RyaW5naWZ5KHByb3BzQXJyLm1hcChmdW5jdGlvbihwKSB7IHJldHVybiBvW3BdOyB9KSk7XG4gICAgICBncm91cHNbZ3JvdXBdID0gZ3JvdXBzW2dyb3VwXSB8fCBbXTtcbiAgICAgIGdyb3Vwc1tncm91cF0ucHVzaChvKTtcbiAgICB9KTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZ3JvdXBzKS5tYXAoZnVuY3Rpb24oZ3JvdXApIHtcbiAgICAgIHJldHVybiBncm91cHNbZ3JvdXBdO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIHJlbW92ZUFycmF5RHVwbGljYXRlcyA9IGZ1bmN0aW9uKGFycikge1xuICAgIHJldHVybiBhcnIuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0sIHBvcywgc2VsZikge1xuICAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZihpdGVtKSA9PT0gcG9zO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gT2JqZWN0c1xuXG4gIHZhciBjbG9uZU9iamVjdCA9IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgbmV3T2JqZWN0ID0ge307XG4gICAgZm9yICh2YXIgcCBpbiBvKSBuZXdPYmplY3RbcF0gPSBvW3BdO1xuICAgIHJldHVybiBuZXdPYmplY3Q7XG4gIH1cblxuICB2YXIgbWVyZ2VPYmplY3RzID0gZnVuY3Rpb24obzEsIG8yKSB7XG4gICAgZm9yICh2YXIgcCBpbiBvMikgbzFbcF0gPSAhaXMudW5kKG8xW3BdKSA/IG8xW3BdIDogbzJbcF07XG4gICAgcmV0dXJuIG8xO1xuICB9XG5cbiAgLy8gQ29sb3JzXG5cbiAgdmFyIGhleFRvUmdiID0gZnVuY3Rpb24oaGV4KSB7XG4gICAgdmFyIHJneCA9IC9eIz8oW2EtZlxcZF0pKFthLWZcXGRdKShbYS1mXFxkXSkkL2k7XG4gICAgdmFyIGhleCA9IGhleC5yZXBsYWNlKHJneCwgZnVuY3Rpb24obSwgciwgZywgYikgeyByZXR1cm4gciArIHIgKyBnICsgZyArIGIgKyBiOyB9KTtcbiAgICB2YXIgcmdiID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgdmFyIHIgPSBwYXJzZUludChyZ2JbMV0sIDE2KTtcbiAgICB2YXIgZyA9IHBhcnNlSW50KHJnYlsyXSwgMTYpO1xuICAgIHZhciBiID0gcGFyc2VJbnQocmdiWzNdLCAxNik7XG4gICAgcmV0dXJuICdyZ2IoJyArIHIgKyAnLCcgKyBnICsgJywnICsgYiArICcpJztcbiAgfVxuXG4gIHZhciBoc2xUb1JnYiA9IGZ1bmN0aW9uKGhzbCkge1xuICAgIHZhciBoc2wgPSAvaHNsXFwoKFxcZCspLFxccyooW1xcZC5dKyklLFxccyooW1xcZC5dKyklXFwpL2cuZXhlYyhoc2wpO1xuICAgIHZhciBoID0gcGFyc2VJbnQoaHNsWzFdKSAvIDM2MDtcbiAgICB2YXIgcyA9IHBhcnNlSW50KGhzbFsyXSkgLyAxMDA7XG4gICAgdmFyIGwgPSBwYXJzZUludChoc2xbM10pIC8gMTAwO1xuICAgIHZhciBodWUycmdiID0gZnVuY3Rpb24ocCwgcSwgdCkge1xuICAgICAgaWYgKHQgPCAwKSB0ICs9IDE7XG4gICAgICBpZiAodCA+IDEpIHQgLT0gMTtcbiAgICAgIGlmICh0IDwgMS82KSByZXR1cm4gcCArIChxIC0gcCkgKiA2ICogdDtcbiAgICAgIGlmICh0IDwgMS8yKSByZXR1cm4gcTtcbiAgICAgIGlmICh0IDwgMi8zKSByZXR1cm4gcCArIChxIC0gcCkgKiAoMi8zIC0gdCkgKiA2O1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIHZhciByLCBnLCBiO1xuICAgIGlmIChzID09IDApIHtcbiAgICAgIHIgPSBnID0gYiA9IGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBxID0gbCA8IDAuNSA/IGwgKiAoMSArIHMpIDogbCArIHMgLSBsICogcztcbiAgICAgIHZhciBwID0gMiAqIGwgLSBxO1xuICAgICAgciA9IGh1ZTJyZ2IocCwgcSwgaCArIDEvMyk7XG4gICAgICBnID0gaHVlMnJnYihwLCBxLCBoKTtcbiAgICAgIGIgPSBodWUycmdiKHAsIHEsIGggLSAxLzMpO1xuICAgIH1cbiAgICByZXR1cm4gJ3JnYignICsgciAqIDI1NSArICcsJyArIGcgKiAyNTUgKyAnLCcgKyBiICogMjU1ICsgJyknO1xuICB9XG5cbiAgdmFyIGNvbG9yVG9SZ2IgPSBmdW5jdGlvbih2YWwpIHtcbiAgICBpZiAoaXMucmdiKHZhbCkpIHJldHVybiB2YWw7XG4gICAgaWYgKGlzLmhleCh2YWwpKSByZXR1cm4gaGV4VG9SZ2IodmFsKTtcbiAgICBpZiAoaXMuaHNsKHZhbCkpIHJldHVybiBoc2xUb1JnYih2YWwpO1xuICB9XG5cbiAgLy8gVW5pdHNcblxuICB2YXIgZ2V0VW5pdCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiAvKFtcXCtcXC1dP1swLTl8YXV0b1xcLl0rKSglfHB4fHB0fGVtfHJlbXxpbnxjbXxtbXxleHxwY3x2d3x2aHxkZWcpPy8uZXhlYyh2YWwpWzJdO1xuICB9XG5cbiAgdmFyIGFkZERlZmF1bHRUcmFuc2Zvcm1Vbml0ID0gZnVuY3Rpb24ocHJvcCwgdmFsLCBpbnRpYWxWYWwpIHtcbiAgICBpZiAoZ2V0VW5pdCh2YWwpKSByZXR1cm4gdmFsO1xuICAgIGlmIChwcm9wLmluZGV4T2YoJ3RyYW5zbGF0ZScpID4gLTEpIHJldHVybiBnZXRVbml0KGludGlhbFZhbCkgPyB2YWwgKyBnZXRVbml0KGludGlhbFZhbCkgOiB2YWwgKyAncHgnO1xuICAgIGlmIChwcm9wLmluZGV4T2YoJ3JvdGF0ZScpID4gLTEgfHwgcHJvcC5pbmRleE9mKCdza2V3JykgPiAtMSkgcmV0dXJuIHZhbCArICdkZWcnO1xuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICAvLyBWYWx1ZXNcblxuICB2YXIgZ2V0Q1NTVmFsdWUgPSBmdW5jdGlvbihlbCwgcHJvcCkge1xuICAgIC8vIEZpcnN0IGNoZWNrIGlmIHByb3AgaXMgYSB2YWxpZCBDU1MgcHJvcGVydHlcbiAgICBpZiAocHJvcCBpbiBlbC5zdHlsZSkge1xuICAgICAgLy8gVGhlbiByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9yIGZhbGxiYWNrIHRvICcwJyB3aGVuIGdldFByb3BlcnR5VmFsdWUgZmFpbHNcbiAgICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKGVsKS5nZXRQcm9wZXJ0eVZhbHVlKHN0cmluZ1RvSHlwaGVucyhwcm9wKSkgfHwgJzAnO1xuICAgIH1cbiAgfVxuXG4gIHZhciBnZXRUcmFuc2Zvcm1WYWx1ZSA9IGZ1bmN0aW9uKGVsLCBwcm9wKSB7XG4gICAgdmFyIGRlZmF1bHRWYWwgPSBwcm9wLmluZGV4T2YoJ3NjYWxlJykgPiAtMSA/IDEgOiAwO1xuICAgIHZhciBzdHIgPSBlbC5zdHlsZS50cmFuc2Zvcm07XG4gICAgaWYgKCFzdHIpIHJldHVybiBkZWZhdWx0VmFsO1xuICAgIHZhciByZ3ggPSAvKFxcdyspXFwoKC4rPylcXCkvZztcbiAgICB2YXIgbWF0Y2ggPSBbXTtcbiAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgd2hpbGUgKG1hdGNoID0gcmd4LmV4ZWMoc3RyKSkge1xuICAgICAgcHJvcHMucHVzaChtYXRjaFsxXSk7XG4gICAgICB2YWx1ZXMucHVzaChtYXRjaFsyXSk7XG4gICAgfVxuICAgIHZhciB2YWwgPSB2YWx1ZXMuZmlsdGVyKGZ1bmN0aW9uKGYsIGkpIHsgcmV0dXJuIHByb3BzW2ldID09PSBwcm9wOyB9KTtcbiAgICByZXR1cm4gdmFsLmxlbmd0aCA/IHZhbFswXSA6IGRlZmF1bHRWYWw7XG4gIH1cblxuICB2YXIgZ2V0QW5pbWF0aW9uVHlwZSA9IGZ1bmN0aW9uKGVsLCBwcm9wKSB7XG4gICAgaWYgKCBpcy5kb20oZWwpICYmIGFycmF5Q29udGFpbnModmFsaWRUcmFuc2Zvcm1zLCBwcm9wKSkgcmV0dXJuICd0cmFuc2Zvcm0nO1xuICAgIGlmICggaXMuZG9tKGVsKSAmJiAoZWwuZ2V0QXR0cmlidXRlKHByb3ApIHx8IChpcy5zdmcoZWwpICYmIGVsW3Byb3BdKSkpIHJldHVybiAnYXR0cmlidXRlJztcbiAgICBpZiAoIGlzLmRvbShlbCkgJiYgKHByb3AgIT09ICd0cmFuc2Zvcm0nICYmIGdldENTU1ZhbHVlKGVsLCBwcm9wKSkpIHJldHVybiAnY3NzJztcbiAgICBpZiAoIWlzLm51bChlbFtwcm9wXSkgJiYgIWlzLnVuZChlbFtwcm9wXSkpIHJldHVybiAnb2JqZWN0JztcbiAgfVxuXG4gIHZhciBnZXRJbml0aWFsVGFyZ2V0VmFsdWUgPSBmdW5jdGlvbih0YXJnZXQsIHByb3ApIHtcbiAgICBzd2l0Y2ggKGdldEFuaW1hdGlvblR5cGUodGFyZ2V0LCBwcm9wKSkge1xuICAgICAgY2FzZSAndHJhbnNmb3JtJzogcmV0dXJuIGdldFRyYW5zZm9ybVZhbHVlKHRhcmdldCwgcHJvcCk7XG4gICAgICBjYXNlICdjc3MnOiByZXR1cm4gZ2V0Q1NTVmFsdWUodGFyZ2V0LCBwcm9wKTtcbiAgICAgIGNhc2UgJ2F0dHJpYnV0ZSc6IHJldHVybiB0YXJnZXQuZ2V0QXR0cmlidXRlKHByb3ApO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0W3Byb3BdIHx8IDA7XG4gIH1cblxuICB2YXIgZ2V0VmFsaWRWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlcywgdmFsLCBvcmlnaW5hbENTUykge1xuICAgIGlmIChpcy5jb2wodmFsKSkgcmV0dXJuIGNvbG9yVG9SZ2IodmFsKTtcbiAgICBpZiAoZ2V0VW5pdCh2YWwpKSByZXR1cm4gdmFsO1xuICAgIHZhciB1bml0ID0gZ2V0VW5pdCh2YWx1ZXMudG8pID8gZ2V0VW5pdCh2YWx1ZXMudG8pIDogZ2V0VW5pdCh2YWx1ZXMuZnJvbSk7XG4gICAgaWYgKCF1bml0ICYmIG9yaWdpbmFsQ1NTKSB1bml0ID0gZ2V0VW5pdChvcmlnaW5hbENTUyk7XG4gICAgcmV0dXJuIHVuaXQgPyB2YWwgKyB1bml0IDogdmFsO1xuICB9XG5cbiAgdmFyIGRlY29tcG9zZVZhbHVlID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIHJneCA9IC8tP1xcZCpcXC4/XFxkKy9nO1xuICAgIHJldHVybiB7XG4gICAgICBvcmlnaW5hbDogdmFsLFxuICAgICAgbnVtYmVyczogbnVtYmVyVG9TdHJpbmcodmFsKS5tYXRjaChyZ3gpID8gbnVtYmVyVG9TdHJpbmcodmFsKS5tYXRjaChyZ3gpLm1hcChOdW1iZXIpIDogWzBdLFxuICAgICAgc3RyaW5nczogbnVtYmVyVG9TdHJpbmcodmFsKS5zcGxpdChyZ3gpXG4gICAgfVxuICB9XG5cbiAgdmFyIHJlY29tcG9zZVZhbHVlID0gZnVuY3Rpb24obnVtYmVycywgc3RyaW5ncywgaW5pdGlhbFN0cmluZ3MpIHtcbiAgICByZXR1cm4gc3RyaW5ncy5yZWR1Y2UoZnVuY3Rpb24oYSwgYiwgaSkge1xuICAgICAgdmFyIGIgPSAoYiA/IGIgOiBpbml0aWFsU3RyaW5nc1tpIC0gMV0pO1xuICAgICAgcmV0dXJuIGEgKyBudW1iZXJzW2kgLSAxXSArIGI7XG4gICAgfSk7XG4gIH1cblxuICAvLyBBbmltYXRhYmxlc1xuXG4gIHZhciBnZXRBbmltYXRhYmxlcyA9IGZ1bmN0aW9uKHRhcmdldHMpIHtcbiAgICB2YXIgdGFyZ2V0cyA9IHRhcmdldHMgPyAoZmxhdHRlbkFycmF5KGlzLmFycih0YXJnZXRzKSA/IHRhcmdldHMubWFwKHRvQXJyYXkpIDogdG9BcnJheSh0YXJnZXRzKSkpIDogW107XG4gICAgcmV0dXJuIHRhcmdldHMubWFwKGZ1bmN0aW9uKHQsIGkpIHtcbiAgICAgIHJldHVybiB7IHRhcmdldDogdCwgaWQ6IGkgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFByb3BlcnRpZXNcblxuICB2YXIgZ2V0UHJvcGVydGllcyA9IGZ1bmN0aW9uKHBhcmFtcywgc2V0dGluZ3MpIHtcbiAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICBmb3IgKHZhciBwIGluIHBhcmFtcykge1xuICAgICAgaWYgKCFkZWZhdWx0U2V0dGluZ3MuaGFzT3duUHJvcGVydHkocCkgJiYgcCAhPT0gJ3RhcmdldHMnKSB7XG4gICAgICAgIHZhciBwcm9wID0gaXMub2JqKHBhcmFtc1twXSkgPyBjbG9uZU9iamVjdChwYXJhbXNbcF0pIDoge3ZhbHVlOiBwYXJhbXNbcF19O1xuICAgICAgICBwcm9wLm5hbWUgPSBwO1xuICAgICAgICBwcm9wcy5wdXNoKG1lcmdlT2JqZWN0cyhwcm9wLCBzZXR0aW5ncykpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvcHM7XG4gIH1cblxuICB2YXIgZ2V0UHJvcGVydGllc1ZhbHVlcyA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCwgdmFsdWUsIGkpIHtcbiAgICB2YXIgdmFsdWVzID0gdG9BcnJheSggaXMuZm5jKHZhbHVlKSA/IHZhbHVlKHRhcmdldCwgaSkgOiB2YWx1ZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZyb206ICh2YWx1ZXMubGVuZ3RoID4gMSkgPyB2YWx1ZXNbMF0gOiBnZXRJbml0aWFsVGFyZ2V0VmFsdWUodGFyZ2V0LCBwcm9wKSxcbiAgICAgIHRvOiAodmFsdWVzLmxlbmd0aCA+IDEpID8gdmFsdWVzWzFdIDogdmFsdWVzWzBdXG4gICAgfVxuICB9XG5cbiAgLy8gVHdlZW5zXG5cbiAgdmFyIGdldFR3ZWVuVmFsdWVzID0gZnVuY3Rpb24ocHJvcCwgdmFsdWVzLCB0eXBlLCB0YXJnZXQpIHtcbiAgICB2YXIgdmFsaWQgPSB7fTtcbiAgICBpZiAodHlwZSA9PT0gJ3RyYW5zZm9ybScpIHtcbiAgICAgIHZhbGlkLmZyb20gPSBwcm9wICsgJygnICsgYWRkRGVmYXVsdFRyYW5zZm9ybVVuaXQocHJvcCwgdmFsdWVzLmZyb20sIHZhbHVlcy50bykgKyAnKSc7XG4gICAgICB2YWxpZC50byA9IHByb3AgKyAnKCcgKyBhZGREZWZhdWx0VHJhbnNmb3JtVW5pdChwcm9wLCB2YWx1ZXMudG8pICsgJyknO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgb3JpZ2luYWxDU1MgPSAodHlwZSA9PT0gJ2NzcycpID8gZ2V0Q1NTVmFsdWUodGFyZ2V0LCBwcm9wKSA6IHVuZGVmaW5lZDtcbiAgICAgIHZhbGlkLmZyb20gPSBnZXRWYWxpZFZhbHVlKHZhbHVlcywgdmFsdWVzLmZyb20sIG9yaWdpbmFsQ1NTKTtcbiAgICAgIHZhbGlkLnRvID0gZ2V0VmFsaWRWYWx1ZSh2YWx1ZXMsIHZhbHVlcy50bywgb3JpZ2luYWxDU1MpO1xuICAgIH1cbiAgICByZXR1cm4geyBmcm9tOiBkZWNvbXBvc2VWYWx1ZSh2YWxpZC5mcm9tKSwgdG86IGRlY29tcG9zZVZhbHVlKHZhbGlkLnRvKSB9O1xuICB9XG5cbiAgdmFyIGdldFR3ZWVuc1Byb3BzID0gZnVuY3Rpb24oYW5pbWF0YWJsZXMsIHByb3BzKSB7XG4gICAgdmFyIHR3ZWVuc1Byb3BzID0gW107XG4gICAgYW5pbWF0YWJsZXMuZm9yRWFjaChmdW5jdGlvbihhbmltYXRhYmxlLCBpKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gYW5pbWF0YWJsZS50YXJnZXQ7XG4gICAgICByZXR1cm4gcHJvcHMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgIHZhciBhbmltVHlwZSA9IGdldEFuaW1hdGlvblR5cGUodGFyZ2V0LCBwcm9wLm5hbWUpO1xuICAgICAgICBpZiAoYW5pbVR5cGUpIHtcbiAgICAgICAgICB2YXIgdmFsdWVzID0gZ2V0UHJvcGVydGllc1ZhbHVlcyh0YXJnZXQsIHByb3AubmFtZSwgcHJvcC52YWx1ZSwgaSk7XG4gICAgICAgICAgdmFyIHR3ZWVuID0gY2xvbmVPYmplY3QocHJvcCk7XG4gICAgICAgICAgdHdlZW4uYW5pbWF0YWJsZXMgPSBhbmltYXRhYmxlO1xuICAgICAgICAgIHR3ZWVuLnR5cGUgPSBhbmltVHlwZTtcbiAgICAgICAgICB0d2Vlbi5mcm9tID0gZ2V0VHdlZW5WYWx1ZXMocHJvcC5uYW1lLCB2YWx1ZXMsIHR3ZWVuLnR5cGUsIHRhcmdldCkuZnJvbTtcbiAgICAgICAgICB0d2Vlbi50byA9IGdldFR3ZWVuVmFsdWVzKHByb3AubmFtZSwgdmFsdWVzLCB0d2Vlbi50eXBlLCB0YXJnZXQpLnRvO1xuICAgICAgICAgIHR3ZWVuLnJvdW5kID0gKGlzLmNvbCh2YWx1ZXMuZnJvbSkgfHwgdHdlZW4ucm91bmQpID8gMSA6IDA7XG4gICAgICAgICAgdHdlZW4uZGVsYXkgPSAoaXMuZm5jKHR3ZWVuLmRlbGF5KSA/IHR3ZWVuLmRlbGF5KHRhcmdldCwgaSwgYW5pbWF0YWJsZXMubGVuZ3RoKSA6IHR3ZWVuLmRlbGF5KSAvIGFuaW1hdGlvbi5zcGVlZDtcbiAgICAgICAgICB0d2Vlbi5kdXJhdGlvbiA9IChpcy5mbmModHdlZW4uZHVyYXRpb24pID8gdHdlZW4uZHVyYXRpb24odGFyZ2V0LCBpLCBhbmltYXRhYmxlcy5sZW5ndGgpIDogdHdlZW4uZHVyYXRpb24pIC8gYW5pbWF0aW9uLnNwZWVkO1xuICAgICAgICAgIHR3ZWVuc1Byb3BzLnB1c2godHdlZW4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdHdlZW5zUHJvcHM7XG4gIH1cblxuICB2YXIgZ2V0VHdlZW5zID0gZnVuY3Rpb24oYW5pbWF0YWJsZXMsIHByb3BzKSB7XG4gICAgdmFyIHR3ZWVuc1Byb3BzID0gZ2V0VHdlZW5zUHJvcHMoYW5pbWF0YWJsZXMsIHByb3BzKTtcbiAgICB2YXIgc3BsaXR0ZWRQcm9wcyA9IGdyb3VwQXJyYXlCeVByb3BzKHR3ZWVuc1Byb3BzLCBbJ25hbWUnLCAnZnJvbScsICd0bycsICdkZWxheScsICdkdXJhdGlvbiddKTtcbiAgICByZXR1cm4gc3BsaXR0ZWRQcm9wcy5tYXAoZnVuY3Rpb24odHdlZW5Qcm9wcykge1xuICAgICAgdmFyIHR3ZWVuID0gY2xvbmVPYmplY3QodHdlZW5Qcm9wc1swXSk7XG4gICAgICB0d2Vlbi5hbmltYXRhYmxlcyA9IHR3ZWVuUHJvcHMubWFwKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAuYW5pbWF0YWJsZXMgfSk7XG4gICAgICB0d2Vlbi50b3RhbER1cmF0aW9uID0gdHdlZW4uZGVsYXkgKyB0d2Vlbi5kdXJhdGlvbjtcbiAgICAgIHJldHVybiB0d2VlbjtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZXZlcnNlVHdlZW5zID0gZnVuY3Rpb24oYW5pbSwgZGVsYXlzKSB7XG4gICAgYW5pbS50d2VlbnMuZm9yRWFjaChmdW5jdGlvbih0d2Vlbikge1xuICAgICAgdmFyIHRvVmFsID0gdHdlZW4udG87XG4gICAgICB2YXIgZnJvbVZhbCA9IHR3ZWVuLmZyb207XG4gICAgICB2YXIgZGVsYXlWYWwgPSBhbmltLmR1cmF0aW9uIC0gKHR3ZWVuLmRlbGF5ICsgdHdlZW4uZHVyYXRpb24pO1xuICAgICAgdHdlZW4uZnJvbSA9IHRvVmFsO1xuICAgICAgdHdlZW4udG8gPSBmcm9tVmFsO1xuICAgICAgaWYgKGRlbGF5cykgdHdlZW4uZGVsYXkgPSBkZWxheVZhbDtcbiAgICB9KTtcbiAgICBhbmltLnJldmVyc2VkID0gYW5pbS5yZXZlcnNlZCA/IGZhbHNlIDogdHJ1ZTtcbiAgfVxuXG4gIHZhciBnZXRUd2VlbnNEdXJhdGlvbiA9IGZ1bmN0aW9uKHR3ZWVucykge1xuICAgIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCB0d2VlbnMubWFwKGZ1bmN0aW9uKHR3ZWVuKXsgcmV0dXJuIHR3ZWVuLnRvdGFsRHVyYXRpb247IH0pKTtcbiAgfVxuXG4gIHZhciBnZXRUd2VlbnNEZWxheSA9IGZ1bmN0aW9uKHR3ZWVucykge1xuICAgIHJldHVybiBNYXRoLm1pbi5hcHBseShNYXRoLCB0d2VlbnMubWFwKGZ1bmN0aW9uKHR3ZWVuKXsgcmV0dXJuIHR3ZWVuLmRlbGF5OyB9KSk7XG4gIH1cblxuICAvLyB3aWxsLWNoYW5nZVxuXG4gIHZhciBnZXRXaWxsQ2hhbmdlID0gZnVuY3Rpb24oYW5pbSkge1xuICAgIHZhciBwcm9wcyA9IFtdO1xuICAgIHZhciBlbHMgPSBbXTtcbiAgICBhbmltLnR3ZWVucy5mb3JFYWNoKGZ1bmN0aW9uKHR3ZWVuKSB7XG4gICAgICBpZiAodHdlZW4udHlwZSA9PT0gJ2NzcycgfHwgdHdlZW4udHlwZSA9PT0gJ3RyYW5zZm9ybScgKSB7XG4gICAgICAgIHByb3BzLnB1c2godHdlZW4udHlwZSA9PT0gJ2NzcycgPyBzdHJpbmdUb0h5cGhlbnModHdlZW4ubmFtZSkgOiAndHJhbnNmb3JtJyk7XG4gICAgICAgIHR3ZWVuLmFuaW1hdGFibGVzLmZvckVhY2goZnVuY3Rpb24oYW5pbWF0YWJsZSkgeyBlbHMucHVzaChhbmltYXRhYmxlLnRhcmdldCk7IH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBwcm9wZXJ0aWVzOiByZW1vdmVBcnJheUR1cGxpY2F0ZXMocHJvcHMpLmpvaW4oJywgJyksXG4gICAgICBlbGVtZW50czogcmVtb3ZlQXJyYXlEdXBsaWNhdGVzKGVscylcbiAgICB9XG4gIH1cblxuICB2YXIgc2V0V2lsbENoYW5nZSA9IGZ1bmN0aW9uKGFuaW0pIHtcbiAgICB2YXIgd2lsbENoYW5nZSA9IGdldFdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgd2lsbENoYW5nZS5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIGVsZW1lbnQuc3R5bGUud2lsbENoYW5nZSA9IHdpbGxDaGFuZ2UucHJvcGVydGllcztcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZW1vdmVXaWxsQ2hhbmdlID0gZnVuY3Rpb24oYW5pbSkge1xuICAgIHZhciB3aWxsQ2hhbmdlID0gZ2V0V2lsbENoYW5nZShhbmltKTtcbiAgICB3aWxsQ2hhbmdlLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgZWxlbWVudC5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnd2lsbC1jaGFuZ2UnKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIFN2ZyBwYXRoICovXG5cbiAgdmFyIGdldFBhdGhQcm9wcyA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICB2YXIgZWwgPSBpcy5zdHIocGF0aCkgPyBzZWxlY3RTdHJpbmcocGF0aClbMF0gOiBwYXRoO1xuICAgIHJldHVybiB7XG4gICAgICBwYXRoOiBlbCxcbiAgICAgIHZhbHVlOiBlbC5nZXRUb3RhbExlbmd0aCgpXG4gICAgfVxuICB9XG5cbiAgdmFyIHNuYXBQcm9ncmVzc1RvUGF0aCA9IGZ1bmN0aW9uKHR3ZWVuLCBwcm9ncmVzcykge1xuICAgIHZhciBwYXRoRWwgPSB0d2Vlbi5wYXRoO1xuICAgIHZhciBwYXRoUHJvZ3Jlc3MgPSB0d2Vlbi52YWx1ZSAqIHByb2dyZXNzO1xuICAgIHZhciBwb2ludCA9IGZ1bmN0aW9uKG9mZnNldCkge1xuICAgICAgdmFyIG8gPSBvZmZzZXQgfHwgMDtcbiAgICAgIHZhciBwID0gcHJvZ3Jlc3MgPiAxID8gdHdlZW4udmFsdWUgKyBvIDogcGF0aFByb2dyZXNzICsgbztcbiAgICAgIHJldHVybiBwYXRoRWwuZ2V0UG9pbnRBdExlbmd0aChwKTtcbiAgICB9XG4gICAgdmFyIHAgPSBwb2ludCgpO1xuICAgIHZhciBwMCA9IHBvaW50KC0xKTtcbiAgICB2YXIgcDEgPSBwb2ludCgrMSk7XG4gICAgc3dpdGNoICh0d2Vlbi5uYW1lKSB7XG4gICAgICBjYXNlICd0cmFuc2xhdGVYJzogcmV0dXJuIHAueDtcbiAgICAgIGNhc2UgJ3RyYW5zbGF0ZVknOiByZXR1cm4gcC55O1xuICAgICAgY2FzZSAncm90YXRlJzogcmV0dXJuIE1hdGguYXRhbjIocDEueSAtIHAwLnksIHAxLnggLSBwMC54KSAqIDE4MCAvIE1hdGguUEk7XG4gICAgfVxuICB9XG5cbiAgLy8gUHJvZ3Jlc3NcblxuICB2YXIgZ2V0VHdlZW5Qcm9ncmVzcyA9IGZ1bmN0aW9uKHR3ZWVuLCB0aW1lKSB7XG4gICAgdmFyIGVsYXBzZWQgPSBNYXRoLm1pbihNYXRoLm1heCh0aW1lIC0gdHdlZW4uZGVsYXksIDApLCB0d2Vlbi5kdXJhdGlvbik7XG4gICAgdmFyIHBlcmNlbnQgPSBlbGFwc2VkIC8gdHdlZW4uZHVyYXRpb247XG4gICAgdmFyIHByb2dyZXNzID0gdHdlZW4udG8ubnVtYmVycy5tYXAoZnVuY3Rpb24obnVtYmVyLCBwKSB7XG4gICAgICB2YXIgc3RhcnQgPSB0d2Vlbi5mcm9tLm51bWJlcnNbcF07XG4gICAgICB2YXIgZWFzZWQgPSBlYXNpbmdzW3R3ZWVuLmVhc2luZ10ocGVyY2VudCwgdHdlZW4uZWxhc3RpY2l0eSk7XG4gICAgICB2YXIgdmFsID0gdHdlZW4ucGF0aCA/IHNuYXBQcm9ncmVzc1RvUGF0aCh0d2VlbiwgZWFzZWQpIDogc3RhcnQgKyBlYXNlZCAqIChudW1iZXIgLSBzdGFydCk7XG4gICAgICB2YWwgPSB0d2Vlbi5yb3VuZCA/IE1hdGgucm91bmQodmFsICogdHdlZW4ucm91bmQpIC8gdHdlZW4ucm91bmQgOiB2YWw7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH0pO1xuICAgIHJldHVybiByZWNvbXBvc2VWYWx1ZShwcm9ncmVzcywgdHdlZW4udG8uc3RyaW5ncywgdHdlZW4uZnJvbS5zdHJpbmdzKTtcbiAgfVxuXG4gIHZhciBzZXRBbmltYXRpb25Qcm9ncmVzcyA9IGZ1bmN0aW9uKGFuaW0sIHRpbWUpIHtcbiAgICB2YXIgdHJhbnNmb3JtcztcbiAgICBhbmltLmN1cnJlbnRUaW1lID0gdGltZTtcbiAgICBhbmltLnByb2dyZXNzID0gKHRpbWUgLyBhbmltLmR1cmF0aW9uKSAqIDEwMDtcbiAgICBmb3IgKHZhciB0ID0gMDsgdCA8IGFuaW0udHdlZW5zLmxlbmd0aDsgdCsrKSB7XG4gICAgICB2YXIgdHdlZW4gPSBhbmltLnR3ZWVuc1t0XTtcbiAgICAgIHR3ZWVuLmN1cnJlbnRWYWx1ZSA9IGdldFR3ZWVuUHJvZ3Jlc3ModHdlZW4sIHRpbWUpO1xuICAgICAgdmFyIHByb2dyZXNzID0gdHdlZW4uY3VycmVudFZhbHVlO1xuICAgICAgZm9yICh2YXIgYSA9IDA7IGEgPCB0d2Vlbi5hbmltYXRhYmxlcy5sZW5ndGg7IGErKykge1xuICAgICAgICB2YXIgYW5pbWF0YWJsZSA9IHR3ZWVuLmFuaW1hdGFibGVzW2FdO1xuICAgICAgICB2YXIgaWQgPSBhbmltYXRhYmxlLmlkO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gYW5pbWF0YWJsZS50YXJnZXQ7XG4gICAgICAgIHZhciBuYW1lID0gdHdlZW4ubmFtZTtcbiAgICAgICAgc3dpdGNoICh0d2Vlbi50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnY3NzJzogdGFyZ2V0LnN0eWxlW25hbWVdID0gcHJvZ3Jlc3M7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2F0dHJpYnV0ZSc6IHRhcmdldC5zZXRBdHRyaWJ1dGUobmFtZSwgcHJvZ3Jlc3MpOyBicmVhaztcbiAgICAgICAgICBjYXNlICdvYmplY3QnOiB0YXJnZXRbbmFtZV0gPSBwcm9ncmVzczsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndHJhbnNmb3JtJzpcbiAgICAgICAgICBpZiAoIXRyYW5zZm9ybXMpIHRyYW5zZm9ybXMgPSB7fTtcbiAgICAgICAgICBpZiAoIXRyYW5zZm9ybXNbaWRdKSB0cmFuc2Zvcm1zW2lkXSA9IFtdO1xuICAgICAgICAgIHRyYW5zZm9ybXNbaWRdLnB1c2gocHJvZ3Jlc3MpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0cmFuc2Zvcm1zKSB7XG4gICAgICBpZiAoIXRyYW5zZm9ybSkgdHJhbnNmb3JtID0gKGdldENTU1ZhbHVlKGRvY3VtZW50LmJvZHksIHRyYW5zZm9ybVN0cikgPyAnJyA6ICctd2Via2l0LScpICsgdHJhbnNmb3JtU3RyO1xuICAgICAgZm9yICh2YXIgdCBpbiB0cmFuc2Zvcm1zKSB7XG4gICAgICAgIGFuaW0uYW5pbWF0YWJsZXNbdF0udGFyZ2V0LnN0eWxlW3RyYW5zZm9ybV0gPSB0cmFuc2Zvcm1zW3RdLmpvaW4oJyAnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBBbmltYXRpb25cblxuICB2YXIgY3JlYXRlQW5pbWF0aW9uID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgdmFyIGFuaW0gPSB7fTtcbiAgICBhbmltLmFuaW1hdGFibGVzID0gZ2V0QW5pbWF0YWJsZXMocGFyYW1zLnRhcmdldHMpO1xuICAgIGFuaW0uc2V0dGluZ3MgPSBtZXJnZU9iamVjdHMocGFyYW1zLCBkZWZhdWx0U2V0dGluZ3MpO1xuICAgIGFuaW0ucHJvcGVydGllcyA9IGdldFByb3BlcnRpZXMocGFyYW1zLCBhbmltLnNldHRpbmdzKTtcbiAgICBhbmltLnR3ZWVucyA9IGdldFR3ZWVucyhhbmltLmFuaW1hdGFibGVzLCBhbmltLnByb3BlcnRpZXMpO1xuICAgIGFuaW0uZHVyYXRpb24gPSBhbmltLnR3ZWVucy5sZW5ndGggPyBnZXRUd2VlbnNEdXJhdGlvbihhbmltLnR3ZWVucykgOiBwYXJhbXMuZHVyYXRpb247XG4gICAgYW5pbS5kZWxheSA9IGFuaW0udHdlZW5zLmxlbmd0aCA/IGdldFR3ZWVuc0RlbGF5KGFuaW0udHdlZW5zKSA6IHBhcmFtcy5kZWxheTtcbiAgICBhbmltLmN1cnJlbnRUaW1lID0gMDtcbiAgICBhbmltLnByb2dyZXNzID0gMDtcbiAgICBhbmltLmVuZGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIGFuaW07XG4gIH1cblxuICAvLyBQdWJsaWNcblxuICB2YXIgYW5pbWF0aW9ucyA9IFtdO1xuICB2YXIgcmFmID0gMDtcblxuICB2YXIgZW5naW5lID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBwbGF5ID0gZnVuY3Rpb24oKSB7IHJhZiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTsgfTtcbiAgICB2YXIgc3RlcCA9IGZ1bmN0aW9uKHQpIHtcbiAgICAgIGlmIChhbmltYXRpb25zLmxlbmd0aCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuaW1hdGlvbnMubGVuZ3RoOyBpKyspIGFuaW1hdGlvbnNbaV0udGljayh0KTtcbiAgICAgICAgcGxheSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUocmFmKTtcbiAgICAgICAgcmFmID0gMDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBsYXk7XG4gIH0pKCk7XG5cbiAgdmFyIGFuaW1hdGlvbiA9IGZ1bmN0aW9uKHBhcmFtcykge1xuXG4gICAgdmFyIGFuaW0gPSBjcmVhdGVBbmltYXRpb24ocGFyYW1zKTtcbiAgICB2YXIgdGltZSA9IHt9O1xuXG4gICAgYW5pbS50aWNrID0gZnVuY3Rpb24obm93KSB7XG4gICAgICBhbmltLmVuZGVkID0gZmFsc2U7XG4gICAgICBpZiAoIXRpbWUuc3RhcnQpIHRpbWUuc3RhcnQgPSBub3c7XG4gICAgICB0aW1lLmN1cnJlbnQgPSBNYXRoLm1pbihNYXRoLm1heCh0aW1lLmxhc3QgKyBub3cgLSB0aW1lLnN0YXJ0LCAwKSwgYW5pbS5kdXJhdGlvbik7XG4gICAgICBzZXRBbmltYXRpb25Qcm9ncmVzcyhhbmltLCB0aW1lLmN1cnJlbnQpO1xuICAgICAgdmFyIHMgPSBhbmltLnNldHRpbmdzO1xuICAgICAgaWYgKHRpbWUuY3VycmVudCA+PSBhbmltLmRlbGF5KSB7XG4gICAgICAgIGlmIChzLmJlZ2luKSBzLmJlZ2luKGFuaW0pOyBzLmJlZ2luID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAocy51cGRhdGUpIHMudXBkYXRlKGFuaW0pO1xuICAgICAgfVxuICAgICAgaWYgKHRpbWUuY3VycmVudCA+PSBhbmltLmR1cmF0aW9uKSB7XG4gICAgICAgIGlmIChzLmxvb3ApIHtcbiAgICAgICAgICB0aW1lLnN0YXJ0ID0gbm93O1xuICAgICAgICAgIGlmIChzLmRpcmVjdGlvbiA9PT0gJ2FsdGVybmF0ZScpIHJldmVyc2VUd2VlbnMoYW5pbSwgdHJ1ZSk7XG4gICAgICAgICAgaWYgKGlzLm51bShzLmxvb3ApKSBzLmxvb3AtLTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhbmltLmVuZGVkID0gdHJ1ZTtcbiAgICAgICAgICBhbmltLnBhdXNlKCk7XG4gICAgICAgICAgaWYgKHMuY29tcGxldGUpIHMuY29tcGxldGUoYW5pbSk7XG4gICAgICAgIH1cbiAgICAgICAgdGltZS5sYXN0ID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhbmltLnNlZWsgPSBmdW5jdGlvbihwcm9ncmVzcykge1xuICAgICAgc2V0QW5pbWF0aW9uUHJvZ3Jlc3MoYW5pbSwgKHByb2dyZXNzIC8gMTAwKSAqIGFuaW0uZHVyYXRpb24pO1xuICAgIH1cblxuICAgIGFuaW0ucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlbW92ZVdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgICB2YXIgaSA9IGFuaW1hdGlvbnMuaW5kZXhPZihhbmltKTtcbiAgICAgIGlmIChpID4gLTEpIGFuaW1hdGlvbnMuc3BsaWNlKGksIDEpO1xuICAgIH1cblxuICAgIGFuaW0ucGxheSA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgYW5pbS5wYXVzZSgpO1xuICAgICAgaWYgKHBhcmFtcykgYW5pbSA9IG1lcmdlT2JqZWN0cyhjcmVhdGVBbmltYXRpb24obWVyZ2VPYmplY3RzKHBhcmFtcywgYW5pbS5zZXR0aW5ncykpLCBhbmltKTtcbiAgICAgIHRpbWUuc3RhcnQgPSAwO1xuICAgICAgdGltZS5sYXN0ID0gYW5pbS5lbmRlZCA/IDAgOiBhbmltLmN1cnJlbnRUaW1lO1xuICAgICAgdmFyIHMgPSBhbmltLnNldHRpbmdzO1xuICAgICAgaWYgKHMuZGlyZWN0aW9uID09PSAncmV2ZXJzZScpIHJldmVyc2VUd2VlbnMoYW5pbSk7XG4gICAgICBpZiAocy5kaXJlY3Rpb24gPT09ICdhbHRlcm5hdGUnICYmICFzLmxvb3ApIHMubG9vcCA9IDE7XG4gICAgICBzZXRXaWxsQ2hhbmdlKGFuaW0pO1xuICAgICAgYW5pbWF0aW9ucy5wdXNoKGFuaW0pO1xuICAgICAgaWYgKCFyYWYpIGVuZ2luZSgpO1xuICAgIH1cblxuICAgIGFuaW0ucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGFuaW0ucmV2ZXJzZWQpIHJldmVyc2VUd2VlbnMoYW5pbSk7XG4gICAgICBhbmltLnBhdXNlKCk7XG4gICAgICBhbmltLnNlZWsoMCk7XG4gICAgICBhbmltLnBsYXkoKTtcbiAgICB9XG5cbiAgICBpZiAoYW5pbS5zZXR0aW5ncy5hdXRvcGxheSkgYW5pbS5wbGF5KCk7XG5cbiAgICByZXR1cm4gYW5pbTtcblxuICB9XG5cbiAgLy8gUmVtb3ZlIG9uZSBvciBtdWx0aXBsZSB0YXJnZXRzIGZyb20gYWxsIGFjdGl2ZSBhbmltYXRpb25zLlxuXG4gIHZhciByZW1vdmUgPSBmdW5jdGlvbihlbGVtZW50cykge1xuICAgIHZhciB0YXJnZXRzID0gZmxhdHRlbkFycmF5KGlzLmFycihlbGVtZW50cykgPyBlbGVtZW50cy5tYXAodG9BcnJheSkgOiB0b0FycmF5KGVsZW1lbnRzKSk7XG4gICAgZm9yICh2YXIgaSA9IGFuaW1hdGlvbnMubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgYW5pbWF0aW9uID0gYW5pbWF0aW9uc1tpXTtcbiAgICAgIHZhciB0d2VlbnMgPSBhbmltYXRpb24udHdlZW5zO1xuICAgICAgZm9yICh2YXIgdCA9IHR3ZWVucy5sZW5ndGgtMTsgdCA+PSAwOyB0LS0pIHtcbiAgICAgICAgdmFyIGFuaW1hdGFibGVzID0gdHdlZW5zW3RdLmFuaW1hdGFibGVzO1xuICAgICAgICBmb3IgKHZhciBhID0gYW5pbWF0YWJsZXMubGVuZ3RoLTE7IGEgPj0gMDsgYS0tKSB7XG4gICAgICAgICAgaWYgKGFycmF5Q29udGFpbnModGFyZ2V0cywgYW5pbWF0YWJsZXNbYV0udGFyZ2V0KSkge1xuICAgICAgICAgICAgYW5pbWF0YWJsZXMuc3BsaWNlKGEsIDEpO1xuICAgICAgICAgICAgaWYgKCFhbmltYXRhYmxlcy5sZW5ndGgpIHR3ZWVucy5zcGxpY2UodCwgMSk7XG4gICAgICAgICAgICBpZiAoIXR3ZWVucy5sZW5ndGgpIGFuaW1hdGlvbi5wYXVzZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFuaW1hdGlvbi52ZXJzaW9uID0gdmVyc2lvbjtcbiAgYW5pbWF0aW9uLnNwZWVkID0gMTtcbiAgYW5pbWF0aW9uLmxpc3QgPSBhbmltYXRpb25zO1xuICBhbmltYXRpb24ucmVtb3ZlID0gcmVtb3ZlO1xuICBhbmltYXRpb24uZWFzaW5ncyA9IGVhc2luZ3M7XG4gIGFuaW1hdGlvbi5nZXRWYWx1ZSA9IGdldEluaXRpYWxUYXJnZXRWYWx1ZTtcbiAgYW5pbWF0aW9uLnBhdGggPSBnZXRQYXRoUHJvcHM7XG4gIGFuaW1hdGlvbi5yYW5kb20gPSByYW5kb207XG5cbiAgcmV0dXJuIGFuaW1hdGlvbjtcblxufSkpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FuaW1lanMvYW5pbWUuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBUZXh0R2VvbWV0cnkgY29tcG9uZW50IGZvciBBLUZyYW1lLlxuICovXG52YXIgZGVidWcgPSBBRlJBTUUudXRpbHMuZGVidWc7XG5cbnZhciBlcnJvciA9IGRlYnVnKCdhZnJhbWUtdGV4dC1jb21wb25lbnQ6ZXJyb3InKTtcblxudmFyIGZvbnRMb2FkZXIgPSBuZXcgVEhSRUUuRm9udExvYWRlcigpO1xuXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3RleHQnLCB7XG4gIHNjaGVtYToge1xuICAgIGJldmVsRW5hYmxlZDoge2RlZmF1bHQ6IGZhbHNlfSxcbiAgICBiZXZlbFNpemU6IHtkZWZhdWx0OiA4LCBtaW46IDB9LFxuICAgIGJldmVsVGhpY2tuZXNzOiB7ZGVmYXVsdDogMTIsIG1pbjogMH0sXG4gICAgY3VydmVTZWdtZW50czoge2RlZmF1bHQ6IDEyLCBtaW46IDB9LFxuICAgIGZvbnQ6IHt0eXBlOiAnYXNzZXQnLCBkZWZhdWx0OiAnaHR0cHM6Ly9yYXdnaXQuY29tL25nb2tldmluL2tmcmFtZS9tYXN0ZXIvY29tcG9uZW50cy90ZXh0L2xpYi9oZWx2ZXRpa2VyX3JlZ3VsYXIudHlwZWZhY2UuanNvbid9LFxuICAgIGhlaWdodDoge2RlZmF1bHQ6IDAuMDUsIG1pbjogMH0sXG4gICAgc2l6ZToge2RlZmF1bHQ6IDAuNSwgbWluOiAwfSxcbiAgICBzdHlsZToge2RlZmF1bHQ6ICdub3JtYWwnLCBvbmVPZjogWydub3JtYWwnLCAnaXRhbGljcyddfSxcbiAgICB0ZXh0OiB7ZGVmYXVsdDogJyd9LFxuICAgIHdlaWdodDoge2RlZmF1bHQ6ICdub3JtYWwnLCBvbmVPZjogWydub3JtYWwnLCAnYm9sZCddfVxuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBjb21wb25lbnQgaXMgYXR0YWNoZWQgYW5kIHdoZW4gY29tcG9uZW50IGRhdGEgY2hhbmdlcy5cbiAgICogR2VuZXJhbGx5IG1vZGlmaWVzIHRoZSBlbnRpdHkgYmFzZWQgb24gdGhlIGRhdGEuXG4gICAqL1xuICB1cGRhdGU6IGZ1bmN0aW9uIChvbGREYXRhKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcblxuICAgIHZhciBtZXNoID0gZWwuZ2V0T3JDcmVhdGVPYmplY3QzRCgnbWVzaCcsIFRIUkVFLk1lc2gpO1xuICAgIGlmIChkYXRhLmZvbnQuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuICAgICAgLy8gTG9hZCB0eXBlZmFjZS5qc29uIGZvbnQuXG4gICAgICBmb250TG9hZGVyLmxvYWQoZGF0YS5mb250LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgdmFyIHRleHREYXRhID0gQUZSQU1FLnV0aWxzLmNsb25lKGRhdGEpO1xuICAgICAgICB0ZXh0RGF0YS5mb250ID0gcmVzcG9uc2U7XG4gICAgICAgIG1lc2guZ2VvbWV0cnkgPSBuZXcgVEhSRUUuVGV4dEdlb21ldHJ5KGRhdGEudGV4dCwgdGV4dERhdGEpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChkYXRhLmZvbnQuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgLy8gU2V0IGZvbnQgaWYgYWxyZWFkeSBoYXZlIGEgdHlwZWZhY2UuanNvbiB0aHJvdWdoIHNldEF0dHJpYnV0ZS5cbiAgICAgIG1lc2guZ2VvbWV0cnkgPSBuZXcgVEhSRUUuVGV4dEdlb21ldHJ5KGRhdGEudGV4dCwgZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yKCdNdXN0IHByb3ZpZGUgYGZvbnRgICh0eXBlZmFjZS5qc29uKSBvciBgZm9udFBhdGhgIChzdHJpbmcpIHRvIHRleHQgY29tcG9uZW50LicpO1xuICAgIH1cbiAgfVxufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYWZyYW1lLXRleHQtY29tcG9uZW50L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qIGdsb2JhbCBBRlJBTUUsIFRIUkVFICovXHJcbmlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xyXG4gIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGF0dGVtcHRlZCB0byByZWdpc3RlciBiZWZvcmUgQUZSQU1FIHdhcyBhdmFpbGFibGUuJyk7XHJcbn1cclxuXHJcbnZhciBjcmVhdGVUZXh0ID0gcmVxdWlyZSgndGhyZWUtYm1mb250LXRleHQnKTtcclxudmFyIGxvYWRGb250ID0gcmVxdWlyZSgnbG9hZC1ibWZvbnQnKTtcclxudmFyIFNERlNoYWRlciA9IHJlcXVpcmUoJy4vbGliL3NoYWRlcnMvc2RmJyk7XHJcblxyXG5yZXF1aXJlKCcuL2V4dHJhcy90ZXh0LXByaW1pdGl2ZS5qcycpOyAvLyBSZWdpc3RlciBleHBlcmltZW50YWwgdGV4dCBwcmltaXRpdmVcclxuXHJcbi8qKlxyXG4gKiBibWZvbnQgdGV4dCBjb21wb25lbnQgZm9yIEEtRnJhbWUuXHJcbiAqL1xyXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2JtZm9udC10ZXh0Jywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgdGV4dDoge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgfSxcclxuICAgIHdpZHRoOiB7XHJcbiAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICBkZWZhdWx0OiAxMDAwXHJcbiAgICB9LFxyXG4gICAgYWxpZ246IHtcclxuICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgIGRlZmF1bHQ6ICdsZWZ0J1xyXG4gICAgfSxcclxuICAgIGxldHRlclNwYWNpbmc6IHtcclxuICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgIGRlZmF1bHQ6IDBcclxuICAgIH0sXHJcbiAgICBsaW5lSGVpZ2h0OiB7XHJcbiAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICBkZWZhdWx0OiAzOFxyXG4gICAgfSxcclxuICAgIGZudDoge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgZGVmYXVsdDogJ2h0dHBzOi8vY2RuLnJhd2dpdC5jb20vYnJ5aWsvYWZyYW1lLWJtZm9udC10ZXh0LWNvbXBvbmVudC9hYTA2NTVjZjkwZjY0NmUxMmM0MGFiNDcwOGVhOTBiNDY4NmNmYjQ1L2Fzc2V0cy9EZWphVnUtc2RmLmZudCdcclxuICAgIH0sXHJcbiAgICBmbnRJbWFnZToge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgZGVmYXVsdDogJ2h0dHBzOi8vY2RuLnJhd2dpdC5jb20vYnJ5aWsvYWZyYW1lLWJtZm9udC10ZXh0LWNvbXBvbmVudC9hYTA2NTVjZjkwZjY0NmUxMmM0MGFiNDcwOGVhOTBiNDY4NmNmYjQ1L2Fzc2V0cy9EZWphVnUtc2RmLnBuZydcclxuICAgIH0sXHJcbiAgICBtb2RlOiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICBkZWZhdWx0OiAnbm9ybWFsJ1xyXG4gICAgfSxcclxuICAgIGNvbG9yOiB7XHJcbiAgICAgIHR5cGU6ICdjb2xvcicsXHJcbiAgICAgIGRlZmF1bHQ6ICcjMDAwJ1xyXG4gICAgfSxcclxuICAgIG9wYWNpdHk6IHtcclxuICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgIGRlZmF1bHQ6ICcxLjAnXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gY29tcG9uZW50IGlzIGF0dGFjaGVkIGFuZCB3aGVuIGNvbXBvbmVudCBkYXRhIGNoYW5nZXMuXHJcbiAgICogR2VuZXJhbGx5IG1vZGlmaWVzIHRoZSBlbnRpdHkgYmFzZWQgb24gdGhlIGRhdGEuXHJcbiAgICovXHJcbiAgdXBkYXRlOiBmdW5jdGlvbiAob2xkRGF0YSkge1xyXG4gICAgLy8gRW50aXR5IGRhdGFcclxuICAgIHZhciBlbCA9IHRoaXMuZWw7XHJcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcclxuXHJcbiAgICAvLyBVc2UgZm9udExvYWRlciB1dGlsaXR5IHRvIGxvYWQgJ2ZudCcgYW5kIHRleHR1cmVcclxuICAgIGZvbnRMb2FkZXIoe1xyXG4gICAgICBmb250OiBkYXRhLmZudCxcclxuICAgICAgaW1hZ2U6IGRhdGEuZm50SW1hZ2VcclxuICAgIH0sIHN0YXJ0KTtcclxuXHJcbiAgICBmdW5jdGlvbiBzdGFydCAoZm9udCwgdGV4dHVyZSkge1xyXG4gICAgICAvLyBTZXR1cCB0ZXh0dXJlLCBzaG91bGQgc2V0IGFuaXNvdHJvcHkgdG8gdXNlciBtYXhpbXVtLi4uXHJcbiAgICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgICB0ZXh0dXJlLmFuaXNvdHJvcHkgPSAxNjtcclxuXHJcbiAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgIGZvbnQ6IGZvbnQsIC8vIHRoZSBiaXRtYXAgZm9udCBkZWZpbml0aW9uXHJcbiAgICAgICAgdGV4dDogZGF0YS50ZXh0LCAvLyB0aGUgc3RyaW5nIHRvIHJlbmRlclxyXG4gICAgICAgIHdpZHRoOiBkYXRhLndpZHRoLFxyXG4gICAgICAgIGFsaWduOiBkYXRhLmFsaWduLFxyXG4gICAgICAgIGxldHRlclNwYWNpbmc6IGRhdGEubGV0dGVyU3BhY2luZyxcclxuICAgICAgICBsaW5lSGVpZ2h0OiBkYXRhLmxpbmVIZWlnaHQsXHJcbiAgICAgICAgbW9kZTogZGF0YS5tb2RlXHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBDcmVhdGUgdGV4dCBnZW9tZXRyeVxyXG4gICAgICB2YXIgZ2VvbWV0cnkgPSBjcmVhdGVUZXh0KG9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gVXNlICcuL2xpYi9zaGFkZXJzL3NkZicgdG8gaGVscCBidWlsZCBhIHNoYWRlciBtYXRlcmlhbFxyXG4gICAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUmF3U2hhZGVyTWF0ZXJpYWwoU0RGU2hhZGVyKHtcclxuICAgICAgICBtYXA6IHRleHR1cmUsXHJcbiAgICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcclxuICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcclxuICAgICAgICBjb2xvcjogZGF0YS5jb2xvcixcclxuICAgICAgICBvcGFjaXR5OiBkYXRhLm9wYWNpdHlcclxuICAgICAgfSkpO1xyXG5cclxuICAgICAgdmFyIHRleHQgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG5cclxuICAgICAgLy8gUm90YXRlIHNvIHRleHQgZmFjZXMgdGhlIGNhbWVyYVxyXG4gICAgICB0ZXh0LnJvdGF0aW9uLnkgPSBNYXRoLlBJO1xyXG5cclxuICAgICAgLy8gU2NhbGUgdGV4dCBkb3duXHJcbiAgICAgIHRleHQuc2NhbGUubXVsdGlwbHlTY2FsYXIoLTAuMDA1KTtcclxuXHJcbiAgICAgIC8vIFJlZ2lzdGVyIHRleHQgbWVzaCB1bmRlciBlbnRpdHkncyBvYmplY3QzRE1hcFxyXG4gICAgICBlbC5zZXRPYmplY3QzRCgnYm1mb250LXRleHQnLCB0ZXh0KTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGNvbXBvbmVudCBpcyByZW1vdmVkIChlLmcuLCB2aWEgcmVtb3ZlQXR0cmlidXRlKS5cclxuICAgKiBHZW5lcmFsbHkgdW5kb2VzIGFsbCBtb2RpZmljYXRpb25zIHRvIHRoZSBlbnRpdHkuXHJcbiAgICovXHJcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVsLnJlbW92ZU9iamVjdDNEKCdibWZvbnQtdGV4dCcpO1xyXG4gIH1cclxufSk7XHJcblxyXG4vKipcclxuICogQSB1dGlsaXR5IHRvIGxvYWQgYSBmb250IHdpdGggYm1mb250LWxvYWRcclxuICogYW5kIGEgdGV4dHVyZSB3aXRoIFRocmVlLlRleHR1cmVMb2FkZXIoKVxyXG4gKi9cclxuZnVuY3Rpb24gZm9udExvYWRlciAob3B0LCBjYikge1xyXG4gIGxvYWRGb250KG9wdC5mb250LCBmdW5jdGlvbiAoZXJyLCBmb250KSB7XHJcbiAgICBpZiAoZXJyKSB7XHJcbiAgICAgIHRocm93IGVycjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGV4dHVyZUxvYWRlciA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCk7XHJcbiAgICB0ZXh0dXJlTG9hZGVyLmxvYWQob3B0LmltYWdlLCBmdW5jdGlvbiAodGV4dHVyZSkge1xyXG4gICAgICBjYihmb250LCB0ZXh0dXJlKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBjcmVhdGVMYXlvdXQgPSByZXF1aXJlKCdsYXlvdXQtYm1mb250LXRleHQnKVxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxudmFyIGNyZWF0ZUluZGljZXMgPSByZXF1aXJlKCdxdWFkLWluZGljZXMnKVxudmFyIGJ1ZmZlciA9IHJlcXVpcmUoJ3RocmVlLWJ1ZmZlci12ZXJ0ZXgtZGF0YScpXG52YXIgYXNzaWduID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpXG5cbnZhciB2ZXJ0aWNlcyA9IHJlcXVpcmUoJy4vbGliL3ZlcnRpY2VzJylcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vbGliL3V0aWxzJylcblxudmFyIEJhc2UgPSBUSFJFRS5CdWZmZXJHZW9tZXRyeVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZVRleHRHZW9tZXRyeSAob3B0KSB7XG4gIHJldHVybiBuZXcgVGV4dEdlb21ldHJ5KG9wdClcbn1cblxuZnVuY3Rpb24gVGV4dEdlb21ldHJ5IChvcHQpIHtcbiAgQmFzZS5jYWxsKHRoaXMpXG5cbiAgaWYgKHR5cGVvZiBvcHQgPT09ICdzdHJpbmcnKSB7XG4gICAgb3B0ID0geyB0ZXh0OiBvcHQgfVxuICB9XG5cbiAgLy8gdXNlIHRoZXNlIGFzIGRlZmF1bHQgdmFsdWVzIGZvciBhbnkgc3Vic2VxdWVudFxuICAvLyBjYWxscyB0byB1cGRhdGUoKVxuICB0aGlzLl9vcHQgPSBhc3NpZ24oe30sIG9wdClcblxuICAvLyBhbHNvIGRvIGFuIGluaXRpYWwgc2V0dXAuLi5cbiAgaWYgKG9wdCkgdGhpcy51cGRhdGUob3B0KVxufVxuXG5pbmhlcml0cyhUZXh0R2VvbWV0cnksIEJhc2UpXG5cblRleHRHZW9tZXRyeS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKG9wdCkge1xuICBpZiAodHlwZW9mIG9wdCA9PT0gJ3N0cmluZycpIHtcbiAgICBvcHQgPSB7IHRleHQ6IG9wdCB9XG4gIH1cblxuICAvLyB1c2UgY29uc3RydWN0b3IgZGVmYXVsdHNcbiAgb3B0ID0gYXNzaWduKHt9LCB0aGlzLl9vcHQsIG9wdClcblxuICBpZiAoIW9wdC5mb250KSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbXVzdCBzcGVjaWZ5IGEgeyBmb250IH0gaW4gb3B0aW9ucycpXG4gIH1cblxuICB0aGlzLmxheW91dCA9IGNyZWF0ZUxheW91dChvcHQpXG5cbiAgLy8gZ2V0IHZlYzIgdGV4Y29vcmRzXG4gIHZhciBmbGlwWSA9IG9wdC5mbGlwWSAhPT0gZmFsc2VcblxuICAvLyB0aGUgZGVzaXJlZCBCTUZvbnQgZGF0YVxuICB2YXIgZm9udCA9IG9wdC5mb250XG5cbiAgLy8gZGV0ZXJtaW5lIHRleHR1cmUgc2l6ZSBmcm9tIGZvbnQgZmlsZVxuICB2YXIgdGV4V2lkdGggPSBmb250LmNvbW1vbi5zY2FsZVdcbiAgdmFyIHRleEhlaWdodCA9IGZvbnQuY29tbW9uLnNjYWxlSFxuXG4gIC8vIGdldCB2aXNpYmxlIGdseXBoc1xuICB2YXIgZ2x5cGhzID0gdGhpcy5sYXlvdXQuZ2x5cGhzLmZpbHRlcihmdW5jdGlvbiAoZ2x5cGgpIHtcbiAgICB2YXIgYml0bWFwID0gZ2x5cGguZGF0YVxuICAgIHJldHVybiBiaXRtYXAud2lkdGggKiBiaXRtYXAuaGVpZ2h0ID4gMFxuICB9KVxuXG4gIC8vIHByb3ZpZGUgdmlzaWJsZSBnbHlwaHMgZm9yIGNvbnZlbmllbmNlXG4gIHRoaXMudmlzaWJsZUdseXBocyA9IGdseXBoc1xuXG4gIC8vIGdldCBjb21tb24gdmVydGV4IGRhdGFcbiAgdmFyIHBvc2l0aW9ucyA9IHZlcnRpY2VzLnBvc2l0aW9ucyhnbHlwaHMpXG4gIHZhciB1dnMgPSB2ZXJ0aWNlcy51dnMoZ2x5cGhzLCB0ZXhXaWR0aCwgdGV4SGVpZ2h0LCBmbGlwWSlcbiAgdmFyIGluZGljZXMgPSBjcmVhdGVJbmRpY2VzKHtcbiAgICBjbG9ja3dpc2U6IHRydWUsXG4gICAgdHlwZTogJ3VpbnQxNicsXG4gICAgY291bnQ6IGdseXBocy5sZW5ndGhcbiAgfSlcblxuICAvLyB1cGRhdGUgdmVydGV4IGRhdGFcbiAgYnVmZmVyLmluZGV4KHRoaXMsIGluZGljZXMsIDEsICd1aW50MTYnKVxuICBidWZmZXIuYXR0cih0aGlzLCAncG9zaXRpb24nLCBwb3NpdGlvbnMsIDIpXG4gIGJ1ZmZlci5hdHRyKHRoaXMsICd1dicsIHV2cywgMilcblxuICAvLyB1cGRhdGUgbXVsdGlwYWdlIGRhdGFcbiAgaWYgKCFvcHQubXVsdGlwYWdlICYmICdwYWdlJyBpbiB0aGlzLmF0dHJpYnV0ZXMpIHtcbiAgICAvLyBkaXNhYmxlIG11bHRpcGFnZSByZW5kZXJpbmdcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgncGFnZScpXG4gIH0gZWxzZSBpZiAob3B0Lm11bHRpcGFnZSkge1xuICAgIHZhciBwYWdlcyA9IHZlcnRpY2VzLnBhZ2VzKGdseXBocylcbiAgICAvLyBlbmFibGUgbXVsdGlwYWdlIHJlbmRlcmluZ1xuICAgIGJ1ZmZlci5hdHRyKHRoaXMsICdwYWdlJywgcGFnZXMsIDEpXG4gIH1cbn1cblxuVGV4dEdlb21ldHJ5LnByb3RvdHlwZS5jb21wdXRlQm91bmRpbmdTcGhlcmUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmJvdW5kaW5nU3BoZXJlID09PSBudWxsKSB7XG4gICAgdGhpcy5ib3VuZGluZ1NwaGVyZSA9IG5ldyBUSFJFRS5TcGhlcmUoKVxuICB9XG5cbiAgdmFyIHBvc2l0aW9ucyA9IHRoaXMuYXR0cmlidXRlcy5wb3NpdGlvbi5hcnJheVxuICB2YXIgaXRlbVNpemUgPSB0aGlzLmF0dHJpYnV0ZXMucG9zaXRpb24uaXRlbVNpemVcbiAgaWYgKCFwb3NpdGlvbnMgfHwgIWl0ZW1TaXplIHx8IHBvc2l0aW9ucy5sZW5ndGggPCAyKSB7XG4gICAgdGhpcy5ib3VuZGluZ1NwaGVyZS5yYWRpdXMgPSAwXG4gICAgdGhpcy5ib3VuZGluZ1NwaGVyZS5jZW50ZXIuc2V0KDAsIDAsIDApXG4gICAgcmV0dXJuXG4gIH1cbiAgdXRpbHMuY29tcHV0ZVNwaGVyZShwb3NpdGlvbnMsIHRoaXMuYm91bmRpbmdTcGhlcmUpXG4gIGlmIChpc05hTih0aGlzLmJvdW5kaW5nU3BoZXJlLnJhZGl1cykpIHtcbiAgICBjb25zb2xlLmVycm9yKCdUSFJFRS5CdWZmZXJHZW9tZXRyeS5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTogJyArXG4gICAgICAnQ29tcHV0ZWQgcmFkaXVzIGlzIE5hTi4gVGhlICcgK1xuICAgICAgJ1wicG9zaXRpb25cIiBhdHRyaWJ1dGUgaXMgbGlrZWx5IHRvIGhhdmUgTmFOIHZhbHVlcy4nKVxuICB9XG59XG5cblRleHRHZW9tZXRyeS5wcm90b3R5cGUuY29tcHV0ZUJvdW5kaW5nQm94ID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5ib3VuZGluZ0JveCA9PT0gbnVsbCkge1xuICAgIHRoaXMuYm91bmRpbmdCb3ggPSBuZXcgVEhSRUUuQm94MygpXG4gIH1cblxuICB2YXIgYmJveCA9IHRoaXMuYm91bmRpbmdCb3hcbiAgdmFyIHBvc2l0aW9ucyA9IHRoaXMuYXR0cmlidXRlcy5wb3NpdGlvbi5hcnJheVxuICB2YXIgaXRlbVNpemUgPSB0aGlzLmF0dHJpYnV0ZXMucG9zaXRpb24uaXRlbVNpemVcbiAgaWYgKCFwb3NpdGlvbnMgfHwgIWl0ZW1TaXplIHx8IHBvc2l0aW9ucy5sZW5ndGggPCAyKSB7XG4gICAgYmJveC5tYWtlRW1wdHkoKVxuICAgIHJldHVyblxuICB9XG4gIHV0aWxzLmNvbXB1dGVCb3gocG9zaXRpb25zLCBiYm94KVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3RocmVlLWJtZm9udC10ZXh0L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciB3b3JkV3JhcCA9IHJlcXVpcmUoJ3dvcmQtd3JhcHBlcicpXG52YXIgeHRlbmQgPSByZXF1aXJlKCd4dGVuZCcpXG52YXIgZmluZENoYXIgPSByZXF1aXJlKCdpbmRleG9mLXByb3BlcnR5JykoJ2lkJylcbnZhciBudW1iZXIgPSByZXF1aXJlKCdhcy1udW1iZXInKVxuXG52YXIgWF9IRUlHSFRTID0gWyd4JywgJ2UnLCAnYScsICdvJywgJ24nLCAncycsICdyJywgJ2MnLCAndScsICdtJywgJ3YnLCAndycsICd6J11cbnZhciBNX1dJRFRIUyA9IFsnbScsICd3J11cbnZhciBDQVBfSEVJR0hUUyA9IFsnSCcsICdJJywgJ04nLCAnRScsICdGJywgJ0snLCAnTCcsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJ11cblxuXG52YXIgVEFCX0lEID0gJ1xcdCcuY2hhckNvZGVBdCgwKVxudmFyIFNQQUNFX0lEID0gJyAnLmNoYXJDb2RlQXQoMClcbnZhciBBTElHTl9MRUZUID0gMCwgXG4gICAgQUxJR05fQ0VOVEVSID0gMSwgXG4gICAgQUxJR05fUklHSFQgPSAyXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlTGF5b3V0KG9wdCkge1xuICByZXR1cm4gbmV3IFRleHRMYXlvdXQob3B0KVxufVxuXG5mdW5jdGlvbiBUZXh0TGF5b3V0KG9wdCkge1xuICB0aGlzLmdseXBocyA9IFtdXG4gIHRoaXMuX21lYXN1cmUgPSB0aGlzLmNvbXB1dGVNZXRyaWNzLmJpbmQodGhpcylcbiAgdGhpcy51cGRhdGUob3B0KVxufVxuXG5UZXh0TGF5b3V0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihvcHQpIHtcbiAgb3B0ID0geHRlbmQoe1xuICAgIG1lYXN1cmU6IHRoaXMuX21lYXN1cmVcbiAgfSwgb3B0KVxuICB0aGlzLl9vcHQgPSBvcHRcbiAgdGhpcy5fb3B0LnRhYlNpemUgPSBudW1iZXIodGhpcy5fb3B0LnRhYlNpemUsIDQpXG5cbiAgaWYgKCFvcHQuZm9udClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ211c3QgcHJvdmlkZSBhIHZhbGlkIGJpdG1hcCBmb250JylcblxuICB2YXIgZ2x5cGhzID0gdGhpcy5nbHlwaHNcbiAgdmFyIHRleHQgPSBvcHQudGV4dHx8JycgXG4gIHZhciBmb250ID0gb3B0LmZvbnRcbiAgdGhpcy5fc2V0dXBTcGFjZUdseXBocyhmb250KVxuICBcbiAgdmFyIGxpbmVzID0gd29yZFdyYXAubGluZXModGV4dCwgb3B0KVxuICB2YXIgbWluV2lkdGggPSBvcHQud2lkdGggfHwgMFxuXG4gIC8vY2xlYXIgZ2x5cGhzXG4gIGdseXBocy5sZW5ndGggPSAwXG5cbiAgLy9nZXQgbWF4IGxpbmUgd2lkdGhcbiAgdmFyIG1heExpbmVXaWR0aCA9IGxpbmVzLnJlZHVjZShmdW5jdGlvbihwcmV2LCBsaW5lKSB7XG4gICAgcmV0dXJuIE1hdGgubWF4KHByZXYsIGxpbmUud2lkdGgsIG1pbldpZHRoKVxuICB9LCAwKVxuXG4gIC8vdGhlIHBlbiBwb3NpdGlvblxuICB2YXIgeCA9IDBcbiAgdmFyIHkgPSAwXG4gIHZhciBsaW5lSGVpZ2h0ID0gbnVtYmVyKG9wdC5saW5lSGVpZ2h0LCBmb250LmNvbW1vbi5saW5lSGVpZ2h0KVxuICB2YXIgYmFzZWxpbmUgPSBmb250LmNvbW1vbi5iYXNlXG4gIHZhciBkZXNjZW5kZXIgPSBsaW5lSGVpZ2h0LWJhc2VsaW5lXG4gIHZhciBsZXR0ZXJTcGFjaW5nID0gb3B0LmxldHRlclNwYWNpbmcgfHwgMFxuICB2YXIgaGVpZ2h0ID0gbGluZUhlaWdodCAqIGxpbmVzLmxlbmd0aCAtIGRlc2NlbmRlclxuICB2YXIgYWxpZ24gPSBnZXRBbGlnblR5cGUodGhpcy5fb3B0LmFsaWduKVxuXG4gIC8vZHJhdyB0ZXh0IGFsb25nIGJhc2VsaW5lXG4gIHkgLT0gaGVpZ2h0XG4gIFxuICAvL3RoZSBtZXRyaWNzIGZvciB0aGlzIHRleHQgbGF5b3V0XG4gIHRoaXMuX3dpZHRoID0gbWF4TGluZVdpZHRoXG4gIHRoaXMuX2hlaWdodCA9IGhlaWdodFxuICB0aGlzLl9kZXNjZW5kZXIgPSBsaW5lSGVpZ2h0IC0gYmFzZWxpbmVcbiAgdGhpcy5fYmFzZWxpbmUgPSBiYXNlbGluZVxuICB0aGlzLl94SGVpZ2h0ID0gZ2V0WEhlaWdodChmb250KVxuICB0aGlzLl9jYXBIZWlnaHQgPSBnZXRDYXBIZWlnaHQoZm9udClcbiAgdGhpcy5fbGluZUhlaWdodCA9IGxpbmVIZWlnaHRcbiAgdGhpcy5fYXNjZW5kZXIgPSBsaW5lSGVpZ2h0IC0gZGVzY2VuZGVyIC0gdGhpcy5feEhlaWdodFxuICAgIFxuICAvL2xheW91dCBlYWNoIGdseXBoXG4gIHZhciBzZWxmID0gdGhpc1xuICBsaW5lcy5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUsIGxpbmVJbmRleCkge1xuICAgIHZhciBzdGFydCA9IGxpbmUuc3RhcnRcbiAgICB2YXIgZW5kID0gbGluZS5lbmRcbiAgICB2YXIgbGluZVdpZHRoID0gbGluZS53aWR0aFxuICAgIHZhciBsYXN0R2x5cGhcbiAgICBcbiAgICAvL2ZvciBlYWNoIGdseXBoIGluIHRoYXQgbGluZS4uLlxuICAgIGZvciAodmFyIGk9c3RhcnQ7IGk8ZW5kOyBpKyspIHtcbiAgICAgIHZhciBpZCA9IHRleHQuY2hhckNvZGVBdChpKVxuICAgICAgdmFyIGdseXBoID0gc2VsZi5nZXRHbHlwaChmb250LCBpZClcbiAgICAgIGlmIChnbHlwaCkge1xuICAgICAgICBpZiAobGFzdEdseXBoKSBcbiAgICAgICAgICB4ICs9IGdldEtlcm5pbmcoZm9udCwgbGFzdEdseXBoLmlkLCBnbHlwaC5pZClcblxuICAgICAgICB2YXIgdHggPSB4XG4gICAgICAgIGlmIChhbGlnbiA9PT0gQUxJR05fQ0VOVEVSKSBcbiAgICAgICAgICB0eCArPSAobWF4TGluZVdpZHRoLWxpbmVXaWR0aCkvMlxuICAgICAgICBlbHNlIGlmIChhbGlnbiA9PT0gQUxJR05fUklHSFQpXG4gICAgICAgICAgdHggKz0gKG1heExpbmVXaWR0aC1saW5lV2lkdGgpXG5cbiAgICAgICAgZ2x5cGhzLnB1c2goe1xuICAgICAgICAgIHBvc2l0aW9uOiBbdHgsIHldLFxuICAgICAgICAgIGRhdGE6IGdseXBoLFxuICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgIGxpbmU6IGxpbmVJbmRleFxuICAgICAgICB9KSAgXG5cbiAgICAgICAgLy9tb3ZlIHBlbiBmb3J3YXJkXG4gICAgICAgIHggKz0gZ2x5cGgueGFkdmFuY2UgKyBsZXR0ZXJTcGFjaW5nXG4gICAgICAgIGxhc3RHbHlwaCA9IGdseXBoXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy9uZXh0IGxpbmUgZG93blxuICAgIHkgKz0gbGluZUhlaWdodFxuICAgIHggPSAwXG4gIH0pXG4gIHRoaXMuX2xpbmVzVG90YWwgPSBsaW5lcy5sZW5ndGg7XG59XG5cblRleHRMYXlvdXQucHJvdG90eXBlLl9zZXR1cFNwYWNlR2x5cGhzID0gZnVuY3Rpb24oZm9udCkge1xuICAvL1RoZXNlIGFyZSBmYWxsYmFja3MsIHdoZW4gdGhlIGZvbnQgZG9lc24ndCBpbmNsdWRlXG4gIC8vJyAnIG9yICdcXHQnIGdseXBoc1xuICB0aGlzLl9mYWxsYmFja1NwYWNlR2x5cGggPSBudWxsXG4gIHRoaXMuX2ZhbGxiYWNrVGFiR2x5cGggPSBudWxsXG5cbiAgaWYgKCFmb250LmNoYXJzIHx8IGZvbnQuY2hhcnMubGVuZ3RoID09PSAwKVxuICAgIHJldHVyblxuXG4gIC8vdHJ5IHRvIGdldCBzcGFjZSBnbHlwaFxuICAvL3RoZW4gZmFsbCBiYWNrIHRvIHRoZSAnbScgb3IgJ3cnIGdseXBoc1xuICAvL3RoZW4gZmFsbCBiYWNrIHRvIHRoZSBmaXJzdCBnbHlwaCBhdmFpbGFibGVcbiAgdmFyIHNwYWNlID0gZ2V0R2x5cGhCeUlkKGZvbnQsIFNQQUNFX0lEKSBcbiAgICAgICAgICB8fCBnZXRNR2x5cGgoZm9udCkgXG4gICAgICAgICAgfHwgZm9udC5jaGFyc1swXVxuXG4gIC8vYW5kIGNyZWF0ZSBhIGZhbGxiYWNrIGZvciB0YWJcbiAgdmFyIHRhYldpZHRoID0gdGhpcy5fb3B0LnRhYlNpemUgKiBzcGFjZS54YWR2YW5jZVxuICB0aGlzLl9mYWxsYmFja1NwYWNlR2x5cGggPSBzcGFjZVxuICB0aGlzLl9mYWxsYmFja1RhYkdseXBoID0geHRlbmQoc3BhY2UsIHtcbiAgICB4OiAwLCB5OiAwLCB4YWR2YW5jZTogdGFiV2lkdGgsIGlkOiBUQUJfSUQsIFxuICAgIHhvZmZzZXQ6IDAsIHlvZmZzZXQ6IDAsIHdpZHRoOiAwLCBoZWlnaHQ6IDBcbiAgfSlcbn1cblxuVGV4dExheW91dC5wcm90b3R5cGUuZ2V0R2x5cGggPSBmdW5jdGlvbihmb250LCBpZCkge1xuICB2YXIgZ2x5cGggPSBnZXRHbHlwaEJ5SWQoZm9udCwgaWQpXG4gIGlmIChnbHlwaClcbiAgICByZXR1cm4gZ2x5cGhcbiAgZWxzZSBpZiAoaWQgPT09IFRBQl9JRCkgXG4gICAgcmV0dXJuIHRoaXMuX2ZhbGxiYWNrVGFiR2x5cGhcbiAgZWxzZSBpZiAoaWQgPT09IFNQQUNFX0lEKSBcbiAgICByZXR1cm4gdGhpcy5fZmFsbGJhY2tTcGFjZUdseXBoXG4gIHJldHVybiBudWxsXG59XG5cblRleHRMYXlvdXQucHJvdG90eXBlLmNvbXB1dGVNZXRyaWNzID0gZnVuY3Rpb24odGV4dCwgc3RhcnQsIGVuZCwgd2lkdGgpIHtcbiAgdmFyIGxldHRlclNwYWNpbmcgPSB0aGlzLl9vcHQubGV0dGVyU3BhY2luZyB8fCAwXG4gIHZhciBmb250ID0gdGhpcy5fb3B0LmZvbnRcbiAgdmFyIGN1clBlbiA9IDBcbiAgdmFyIGN1cldpZHRoID0gMFxuICB2YXIgY291bnQgPSAwXG4gIHZhciBnbHlwaFxuICB2YXIgbGFzdEdseXBoXG5cbiAgaWYgKCFmb250LmNoYXJzIHx8IGZvbnQuY2hhcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgIGVuZDogc3RhcnQsXG4gICAgICB3aWR0aDogMFxuICAgIH1cbiAgfVxuXG4gIGVuZCA9IE1hdGgubWluKHRleHQubGVuZ3RoLCBlbmQpXG4gIGZvciAodmFyIGk9c3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHZhciBpZCA9IHRleHQuY2hhckNvZGVBdChpKVxuICAgIHZhciBnbHlwaCA9IHRoaXMuZ2V0R2x5cGgoZm9udCwgaWQpXG5cbiAgICBpZiAoZ2x5cGgpIHtcbiAgICAgIC8vbW92ZSBwZW4gZm9yd2FyZFxuICAgICAgdmFyIHhvZmYgPSBnbHlwaC54b2Zmc2V0XG4gICAgICB2YXIga2VybiA9IGxhc3RHbHlwaCA/IGdldEtlcm5pbmcoZm9udCwgbGFzdEdseXBoLmlkLCBnbHlwaC5pZCkgOiAwXG4gICAgICBjdXJQZW4gKz0ga2VyblxuXG4gICAgICB2YXIgbmV4dFBlbiA9IGN1clBlbiArIGdseXBoLnhhZHZhbmNlICsgbGV0dGVyU3BhY2luZ1xuICAgICAgdmFyIG5leHRXaWR0aCA9IGN1clBlbiArIGdseXBoLndpZHRoXG5cbiAgICAgIC8vd2UndmUgaGl0IG91ciBsaW1pdDsgd2UgY2FuJ3QgbW92ZSBvbnRvIHRoZSBuZXh0IGdseXBoXG4gICAgICBpZiAobmV4dFdpZHRoID49IHdpZHRoIHx8IG5leHRQZW4gPj0gd2lkdGgpXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIC8vb3RoZXJ3aXNlIGNvbnRpbnVlIGFsb25nIG91ciBsaW5lXG4gICAgICBjdXJQZW4gPSBuZXh0UGVuXG4gICAgICBjdXJXaWR0aCA9IG5leHRXaWR0aFxuICAgICAgbGFzdEdseXBoID0gZ2x5cGhcbiAgICB9XG4gICAgY291bnQrK1xuICB9XG4gIFxuICAvL21ha2Ugc3VyZSByaWdodG1vc3QgZWRnZSBsaW5lcyB1cCB3aXRoIHJlbmRlcmVkIGdseXBoc1xuICBpZiAobGFzdEdseXBoKVxuICAgIGN1cldpZHRoICs9IGxhc3RHbHlwaC54b2Zmc2V0XG5cbiAgcmV0dXJuIHtcbiAgICBzdGFydDogc3RhcnQsXG4gICAgZW5kOiBzdGFydCArIGNvdW50LFxuICAgIHdpZHRoOiBjdXJXaWR0aFxuICB9XG59XG5cbi8vZ2V0dGVycyBmb3IgdGhlIHByaXZhdGUgdmFyc1xuO1snd2lkdGgnLCAnaGVpZ2h0JywgXG4gICdkZXNjZW5kZXInLCAnYXNjZW5kZXInLFxuICAneEhlaWdodCcsICdiYXNlbGluZScsXG4gICdjYXBIZWlnaHQnLFxuICAnbGluZUhlaWdodCcgXS5mb3JFYWNoKGFkZEdldHRlcilcblxuZnVuY3Rpb24gYWRkR2V0dGVyKG5hbWUpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRleHRMYXlvdXQucHJvdG90eXBlLCBuYW1lLCB7XG4gICAgZ2V0OiB3cmFwcGVyKG5hbWUpLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KVxufVxuXG4vL2NyZWF0ZSBsb29rdXBzIGZvciBwcml2YXRlIHZhcnNcbmZ1bmN0aW9uIHdyYXBwZXIobmFtZSkge1xuICByZXR1cm4gKG5ldyBGdW5jdGlvbihbXG4gICAgJ3JldHVybiBmdW5jdGlvbiAnK25hbWUrJygpIHsnLFxuICAgICcgIHJldHVybiB0aGlzLl8nK25hbWUsXG4gICAgJ30nXG4gIF0uam9pbignXFxuJykpKSgpXG59XG5cbmZ1bmN0aW9uIGdldEdseXBoQnlJZChmb250LCBpZCkge1xuICBpZiAoIWZvbnQuY2hhcnMgfHwgZm9udC5jaGFycy5sZW5ndGggPT09IDApXG4gICAgcmV0dXJuIG51bGxcblxuICB2YXIgZ2x5cGhJZHggPSBmaW5kQ2hhcihmb250LmNoYXJzLCBpZClcbiAgaWYgKGdseXBoSWR4ID49IDApXG4gICAgcmV0dXJuIGZvbnQuY2hhcnNbZ2x5cGhJZHhdXG4gIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIGdldFhIZWlnaHQoZm9udCkge1xuICBmb3IgKHZhciBpPTA7IGk8WF9IRUlHSFRTLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGlkID0gWF9IRUlHSFRTW2ldLmNoYXJDb2RlQXQoMClcbiAgICB2YXIgaWR4ID0gZmluZENoYXIoZm9udC5jaGFycywgaWQpXG4gICAgaWYgKGlkeCA+PSAwKSBcbiAgICAgIHJldHVybiBmb250LmNoYXJzW2lkeF0uaGVpZ2h0XG4gIH1cbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gZ2V0TUdseXBoKGZvbnQpIHtcbiAgZm9yICh2YXIgaT0wOyBpPE1fV0lEVEhTLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGlkID0gTV9XSURUSFNbaV0uY2hhckNvZGVBdCgwKVxuICAgIHZhciBpZHggPSBmaW5kQ2hhcihmb250LmNoYXJzLCBpZClcbiAgICBpZiAoaWR4ID49IDApIFxuICAgICAgcmV0dXJuIGZvbnQuY2hhcnNbaWR4XVxuICB9XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGdldENhcEhlaWdodChmb250KSB7XG4gIGZvciAodmFyIGk9MDsgaTxDQVBfSEVJR0hUUy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpZCA9IENBUF9IRUlHSFRTW2ldLmNoYXJDb2RlQXQoMClcbiAgICB2YXIgaWR4ID0gZmluZENoYXIoZm9udC5jaGFycywgaWQpXG4gICAgaWYgKGlkeCA+PSAwKSBcbiAgICAgIHJldHVybiBmb250LmNoYXJzW2lkeF0uaGVpZ2h0XG4gIH1cbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gZ2V0S2VybmluZyhmb250LCBsZWZ0LCByaWdodCkge1xuICBpZiAoIWZvbnQua2VybmluZ3MgfHwgZm9udC5rZXJuaW5ncy5sZW5ndGggPT09IDApXG4gICAgcmV0dXJuIDBcblxuICB2YXIgdGFibGUgPSBmb250Lmtlcm5pbmdzXG4gIGZvciAodmFyIGk9MDsgaTx0YWJsZS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXJuID0gdGFibGVbaV1cbiAgICBpZiAoa2Vybi5maXJzdCA9PT0gbGVmdCAmJiBrZXJuLnNlY29uZCA9PT0gcmlnaHQpXG4gICAgICByZXR1cm4ga2Vybi5hbW91bnRcbiAgfVxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBnZXRBbGlnblR5cGUoYWxpZ24pIHtcbiAgaWYgKGFsaWduID09PSAnY2VudGVyJylcbiAgICByZXR1cm4gQUxJR05fQ0VOVEVSXG4gIGVsc2UgaWYgKGFsaWduID09PSAncmlnaHQnKVxuICAgIHJldHVybiBBTElHTl9SSUdIVFxuICByZXR1cm4gQUxJR05fTEVGVFxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sYXlvdXQtYm1mb250LXRleHQvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIG5ld2xpbmUgPSAvXFxuL1xudmFyIG5ld2xpbmVDaGFyID0gJ1xcbidcbnZhciB3aGl0ZXNwYWNlID0gL1xccy9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0ZXh0LCBvcHQpIHtcbiAgICB2YXIgbGluZXMgPSBtb2R1bGUuZXhwb3J0cy5saW5lcyh0ZXh0LCBvcHQpXG4gICAgcmV0dXJuIGxpbmVzLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgIHJldHVybiB0ZXh0LnN1YnN0cmluZyhsaW5lLnN0YXJ0LCBsaW5lLmVuZClcbiAgICB9KS5qb2luKCdcXG4nKVxufVxuXG5tb2R1bGUuZXhwb3J0cy5saW5lcyA9IGZ1bmN0aW9uIHdvcmR3cmFwKHRleHQsIG9wdCkge1xuICAgIG9wdCA9IG9wdHx8e31cblxuICAgIC8vemVybyB3aWR0aCByZXN1bHRzIGluIG5vdGhpbmcgdmlzaWJsZVxuICAgIGlmIChvcHQud2lkdGggPT09IDAgJiYgb3B0Lm1vZGUgIT09ICdub3dyYXAnKSBcbiAgICAgICAgcmV0dXJuIFtdXG5cbiAgICB0ZXh0ID0gdGV4dHx8JydcbiAgICB2YXIgd2lkdGggPSB0eXBlb2Ygb3B0LndpZHRoID09PSAnbnVtYmVyJyA/IG9wdC53aWR0aCA6IE51bWJlci5NQVhfVkFMVUVcbiAgICB2YXIgc3RhcnQgPSBNYXRoLm1heCgwLCBvcHQuc3RhcnR8fDApXG4gICAgdmFyIGVuZCA9IHR5cGVvZiBvcHQuZW5kID09PSAnbnVtYmVyJyA/IG9wdC5lbmQgOiB0ZXh0Lmxlbmd0aFxuICAgIHZhciBtb2RlID0gb3B0Lm1vZGVcblxuICAgIHZhciBtZWFzdXJlID0gb3B0Lm1lYXN1cmUgfHwgbW9ub3NwYWNlXG4gICAgaWYgKG1vZGUgPT09ICdwcmUnKVxuICAgICAgICByZXR1cm4gcHJlKG1lYXN1cmUsIHRleHQsIHN0YXJ0LCBlbmQsIHdpZHRoKVxuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGdyZWVkeShtZWFzdXJlLCB0ZXh0LCBzdGFydCwgZW5kLCB3aWR0aCwgbW9kZSlcbn1cblxuZnVuY3Rpb24gaWR4T2YodGV4dCwgY2hyLCBzdGFydCwgZW5kKSB7XG4gICAgdmFyIGlkeCA9IHRleHQuaW5kZXhPZihjaHIsIHN0YXJ0KVxuICAgIGlmIChpZHggPT09IC0xIHx8IGlkeCA+IGVuZClcbiAgICAgICAgcmV0dXJuIGVuZFxuICAgIHJldHVybiBpZHhcbn1cblxuZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKGNocikge1xuICAgIHJldHVybiB3aGl0ZXNwYWNlLnRlc3QoY2hyKVxufVxuXG5mdW5jdGlvbiBwcmUobWVhc3VyZSwgdGV4dCwgc3RhcnQsIGVuZCwgd2lkdGgpIHtcbiAgICB2YXIgbGluZXMgPSBbXVxuICAgIHZhciBsaW5lU3RhcnQgPSBzdGFydFxuICAgIGZvciAodmFyIGk9c3RhcnQ7IGk8ZW5kICYmIGk8dGV4dC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hyID0gdGV4dC5jaGFyQXQoaSlcbiAgICAgICAgdmFyIGlzTmV3bGluZSA9IG5ld2xpbmUudGVzdChjaHIpXG5cbiAgICAgICAgLy9JZiB3ZSd2ZSByZWFjaGVkIGEgbmV3bGluZSwgdGhlbiBzdGVwIGRvd24gYSBsaW5lXG4gICAgICAgIC8vT3IgaWYgd2UndmUgcmVhY2hlZCB0aGUgRU9GXG4gICAgICAgIGlmIChpc05ld2xpbmUgfHwgaT09PWVuZC0xKSB7XG4gICAgICAgICAgICB2YXIgbGluZUVuZCA9IGlzTmV3bGluZSA/IGkgOiBpKzFcbiAgICAgICAgICAgIHZhciBtZWFzdXJlZCA9IG1lYXN1cmUodGV4dCwgbGluZVN0YXJ0LCBsaW5lRW5kLCB3aWR0aClcbiAgICAgICAgICAgIGxpbmVzLnB1c2gobWVhc3VyZWQpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxpbmVTdGFydCA9IGkrMVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBsaW5lc1xufVxuXG5mdW5jdGlvbiBncmVlZHkobWVhc3VyZSwgdGV4dCwgc3RhcnQsIGVuZCwgd2lkdGgsIG1vZGUpIHtcbiAgICAvL0EgZ3JlZWR5IHdvcmQgd3JhcHBlciBiYXNlZCBvbiBMaWJHRFggYWxnb3JpdGhtXG4gICAgLy9odHRwczovL2dpdGh1Yi5jb20vbGliZ2R4L2xpYmdkeC9ibG9iL21hc3Rlci9nZHgvc3JjL2NvbS9iYWRsb2dpYy9nZHgvZ3JhcGhpY3MvZzJkL0JpdG1hcEZvbnRDYWNoZS5qYXZhXG4gICAgdmFyIGxpbmVzID0gW11cblxuICAgIHZhciB0ZXN0V2lkdGggPSB3aWR0aFxuICAgIC8vaWYgJ25vd3JhcCcgaXMgc3BlY2lmaWVkLCB3ZSBvbmx5IHdyYXAgb24gbmV3bGluZSBjaGFyc1xuICAgIGlmIChtb2RlID09PSAnbm93cmFwJylcbiAgICAgICAgdGVzdFdpZHRoID0gTnVtYmVyLk1BWF9WQUxVRVxuXG4gICAgd2hpbGUgKHN0YXJ0IDwgZW5kICYmIHN0YXJ0IDwgdGV4dC5sZW5ndGgpIHtcbiAgICAgICAgLy9nZXQgbmV4dCBuZXdsaW5lIHBvc2l0aW9uXG4gICAgICAgIHZhciBuZXdMaW5lID0gaWR4T2YodGV4dCwgbmV3bGluZUNoYXIsIHN0YXJ0LCBlbmQpXG5cbiAgICAgICAgLy9lYXQgd2hpdGVzcGFjZSBhdCBzdGFydCBvZiBsaW5lXG4gICAgICAgIHdoaWxlIChzdGFydCA8IG5ld0xpbmUpIHtcbiAgICAgICAgICAgIGlmICghaXNXaGl0ZXNwYWNlKCB0ZXh0LmNoYXJBdChzdGFydCkgKSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgc3RhcnQrK1xuICAgICAgICB9XG5cbiAgICAgICAgLy9kZXRlcm1pbmUgdmlzaWJsZSAjIG9mIGdseXBocyBmb3IgdGhlIGF2YWlsYWJsZSB3aWR0aFxuICAgICAgICB2YXIgbWVhc3VyZWQgPSBtZWFzdXJlKHRleHQsIHN0YXJ0LCBuZXdMaW5lLCB0ZXN0V2lkdGgpXG5cbiAgICAgICAgdmFyIGxpbmVFbmQgPSBzdGFydCArIChtZWFzdXJlZC5lbmQtbWVhc3VyZWQuc3RhcnQpXG4gICAgICAgIHZhciBuZXh0U3RhcnQgPSBsaW5lRW5kICsgbmV3bGluZUNoYXIubGVuZ3RoXG5cbiAgICAgICAgLy9pZiB3ZSBoYWQgdG8gY3V0IHRoZSBsaW5lIGJlZm9yZSB0aGUgbmV4dCBuZXdsaW5lLi4uXG4gICAgICAgIGlmIChsaW5lRW5kIDwgbmV3TGluZSkge1xuICAgICAgICAgICAgLy9maW5kIGNoYXIgdG8gYnJlYWsgb25cbiAgICAgICAgICAgIHdoaWxlIChsaW5lRW5kID4gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNXaGl0ZXNwYWNlKHRleHQuY2hhckF0KGxpbmVFbmQpKSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBsaW5lRW5kLS1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaW5lRW5kID09PSBzdGFydCkge1xuICAgICAgICAgICAgICAgIGlmIChuZXh0U3RhcnQgPiBzdGFydCArIG5ld2xpbmVDaGFyLmxlbmd0aCkgbmV4dFN0YXJ0LS1cbiAgICAgICAgICAgICAgICBsaW5lRW5kID0gbmV4dFN0YXJ0IC8vIElmIG5vIGNoYXJhY3RlcnMgdG8gYnJlYWssIHNob3cgYWxsLlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXh0U3RhcnQgPSBsaW5lRW5kXG4gICAgICAgICAgICAgICAgLy9lYXQgd2hpdGVzcGFjZSBhdCBlbmQgb2YgbGluZVxuICAgICAgICAgICAgICAgIHdoaWxlIChsaW5lRW5kID4gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1doaXRlc3BhY2UodGV4dC5jaGFyQXQobGluZUVuZCAtIG5ld2xpbmVDaGFyLmxlbmd0aCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgbGluZUVuZC0tXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChsaW5lRW5kID49IHN0YXJ0KSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbWVhc3VyZSh0ZXh0LCBzdGFydCwgbGluZUVuZCwgdGVzdFdpZHRoKVxuICAgICAgICAgICAgbGluZXMucHVzaChyZXN1bHQpXG4gICAgICAgIH1cbiAgICAgICAgc3RhcnQgPSBuZXh0U3RhcnRcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzXG59XG5cbi8vZGV0ZXJtaW5lcyB0aGUgdmlzaWJsZSBudW1iZXIgb2YgZ2x5cGhzIHdpdGhpbiBhIGdpdmVuIHdpZHRoXG5mdW5jdGlvbiBtb25vc3BhY2UodGV4dCwgc3RhcnQsIGVuZCwgd2lkdGgpIHtcbiAgICB2YXIgZ2x5cGhzID0gTWF0aC5taW4od2lkdGgsIGVuZC1zdGFydClcbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgIGVuZDogc3RhcnQrZ2x5cGhzXG4gICAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi93b3JkLXdyYXBwZXIvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBleHRlbmRcblxudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgIHZhciB0YXJnZXQgPSB7fVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXVxuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXRcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi94dGVuZC9pbW11dGFibGUuanNcbi8vIG1vZHVsZSBpZCA9IDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21waWxlKHByb3BlcnR5KSB7XG5cdGlmICghcHJvcGVydHkgfHwgdHlwZW9mIHByb3BlcnR5ICE9PSAnc3RyaW5nJylcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ211c3Qgc3BlY2lmeSBwcm9wZXJ0eSBmb3IgaW5kZXhvZiBzZWFyY2gnKVxuXG5cdHJldHVybiBuZXcgRnVuY3Rpb24oJ2FycmF5JywgJ3ZhbHVlJywgJ3N0YXJ0JywgW1xuXHRcdCdzdGFydCA9IHN0YXJ0IHx8IDAnLFxuXHRcdCdmb3IgKHZhciBpPXN0YXJ0OyBpPGFycmF5Lmxlbmd0aDsgaSsrKScsXG5cdFx0JyAgaWYgKGFycmF5W2ldW1wiJyArIHByb3BlcnR5ICsnXCJdID09PSB2YWx1ZSknLFxuXHRcdCcgICAgICByZXR1cm4gaScsXG5cdFx0J3JldHVybiAtMSdcblx0XS5qb2luKCdcXG4nKSlcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vaW5kZXhvZi1wcm9wZXJ0eS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBudW10eXBlKG51bSwgZGVmKSB7XG5cdHJldHVybiB0eXBlb2YgbnVtID09PSAnbnVtYmVyJ1xuXHRcdD8gbnVtIFxuXHRcdDogKHR5cGVvZiBkZWYgPT09ICdudW1iZXInID8gZGVmIDogMClcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXMtbnVtYmVyL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAxMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZHR5cGUgPSByZXF1aXJlKCdkdHlwZScpXG52YXIgYW5BcnJheSA9IHJlcXVpcmUoJ2FuLWFycmF5JylcbnZhciBpc0J1ZmZlciA9IHJlcXVpcmUoJ2lzLWJ1ZmZlcicpXG5cbnZhciBDVyA9IFswLCAyLCAzXVxudmFyIENDVyA9IFsyLCAxLCAzXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZVF1YWRFbGVtZW50cyhhcnJheSwgb3B0KSB7XG4gICAgLy9pZiB1c2VyIGRpZG4ndCBzcGVjaWZ5IGFuIG91dHB1dCBhcnJheVxuICAgIGlmICghYXJyYXkgfHwgIShhbkFycmF5KGFycmF5KSB8fCBpc0J1ZmZlcihhcnJheSkpKSB7XG4gICAgICAgIG9wdCA9IGFycmF5IHx8IHt9XG4gICAgICAgIGFycmF5ID0gbnVsbFxuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb3B0ID09PSAnbnVtYmVyJykgLy9iYWNrd2FyZHMtY29tcGF0aWJsZVxuICAgICAgICBvcHQgPSB7IGNvdW50OiBvcHQgfVxuICAgIGVsc2VcbiAgICAgICAgb3B0ID0gb3B0IHx8IHt9XG5cbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvcHQudHlwZSA9PT0gJ3N0cmluZycgPyBvcHQudHlwZSA6ICd1aW50MTYnXG4gICAgdmFyIGNvdW50ID0gdHlwZW9mIG9wdC5jb3VudCA9PT0gJ251bWJlcicgPyBvcHQuY291bnQgOiAxXG4gICAgdmFyIHN0YXJ0ID0gKG9wdC5zdGFydCB8fCAwKSBcblxuICAgIHZhciBkaXIgPSBvcHQuY2xvY2t3aXNlICE9PSBmYWxzZSA/IENXIDogQ0NXLFxuICAgICAgICBhID0gZGlyWzBdLCBcbiAgICAgICAgYiA9IGRpclsxXSxcbiAgICAgICAgYyA9IGRpclsyXVxuXG4gICAgdmFyIG51bUluZGljZXMgPSBjb3VudCAqIDZcblxuICAgIHZhciBpbmRpY2VzID0gYXJyYXkgfHwgbmV3IChkdHlwZSh0eXBlKSkobnVtSW5kaWNlcylcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IDA7IGkgPCBudW1JbmRpY2VzOyBpICs9IDYsIGogKz0gNCkge1xuICAgICAgICB2YXIgeCA9IGkgKyBzdGFydFxuICAgICAgICBpbmRpY2VzW3ggKyAwXSA9IGogKyAwXG4gICAgICAgIGluZGljZXNbeCArIDFdID0gaiArIDFcbiAgICAgICAgaW5kaWNlc1t4ICsgMl0gPSBqICsgMlxuICAgICAgICBpbmRpY2VzW3ggKyAzXSA9IGogKyBhXG4gICAgICAgIGluZGljZXNbeCArIDRdID0gaiArIGJcbiAgICAgICAgaW5kaWNlc1t4ICsgNV0gPSBqICsgY1xuICAgIH1cbiAgICByZXR1cm4gaW5kaWNlc1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9xdWFkLWluZGljZXMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDEzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZHR5cGUpIHtcbiAgc3dpdGNoIChkdHlwZSkge1xuICAgIGNhc2UgJ2ludDgnOlxuICAgICAgcmV0dXJuIEludDhBcnJheVxuICAgIGNhc2UgJ2ludDE2JzpcbiAgICAgIHJldHVybiBJbnQxNkFycmF5XG4gICAgY2FzZSAnaW50MzInOlxuICAgICAgcmV0dXJuIEludDMyQXJyYXlcbiAgICBjYXNlICd1aW50OCc6XG4gICAgICByZXR1cm4gVWludDhBcnJheVxuICAgIGNhc2UgJ3VpbnQxNic6XG4gICAgICByZXR1cm4gVWludDE2QXJyYXlcbiAgICBjYXNlICd1aW50MzInOlxuICAgICAgcmV0dXJuIFVpbnQzMkFycmF5XG4gICAgY2FzZSAnZmxvYXQzMic6XG4gICAgICByZXR1cm4gRmxvYXQzMkFycmF5XG4gICAgY2FzZSAnZmxvYXQ2NCc6XG4gICAgICByZXR1cm4gRmxvYXQ2NEFycmF5XG4gICAgY2FzZSAnYXJyYXknOlxuICAgICAgcmV0dXJuIEFycmF5XG4gICAgY2FzZSAndWludDhfY2xhbXBlZCc6XG4gICAgICByZXR1cm4gVWludDhDbGFtcGVkQXJyYXlcbiAgfVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2R0eXBlL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgc3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFuQXJyYXlcblxuZnVuY3Rpb24gYW5BcnJheShhcnIpIHtcbiAgcmV0dXJuIChcbiAgICAgICBhcnIuQllURVNfUEVSX0VMRU1FTlRcbiAgICAmJiBzdHIuY2FsbChhcnIuYnVmZmVyKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJ1xuICAgIHx8IEFycmF5LmlzQXJyYXkoYXJyKVxuICApXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYW4tYXJyYXkvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDE1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qIVxuICogRGV0ZXJtaW5lIGlmIGFuIG9iamVjdCBpcyBhIEJ1ZmZlclxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbi8vIFRoZSBfaXNCdWZmZXIgY2hlY2sgaXMgZm9yIFNhZmFyaSA1LTcgc3VwcG9ydCwgYmVjYXVzZSBpdCdzIG1pc3Npbmdcbi8vIE9iamVjdC5wcm90b3R5cGUuY29uc3RydWN0b3IuIFJlbW92ZSB0aGlzIGV2ZW50dWFsbHlcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gb2JqICE9IG51bGwgJiYgKGlzQnVmZmVyKG9iaikgfHwgaXNTbG93QnVmZmVyKG9iaikgfHwgISFvYmouX2lzQnVmZmVyKVxufVxuXG5mdW5jdGlvbiBpc0J1ZmZlciAob2JqKSB7XG4gIHJldHVybiAhIW9iai5jb25zdHJ1Y3RvciAmJiB0eXBlb2Ygb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlcihvYmopXG59XG5cbi8vIEZvciBOb2RlIHYwLjEwIHN1cHBvcnQuIFJlbW92ZSB0aGlzIGV2ZW50dWFsbHkuXG5mdW5jdGlvbiBpc1Nsb3dCdWZmZXIgKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iai5yZWFkRmxvYXRMRSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb2JqLnNsaWNlID09PSAnZnVuY3Rpb24nICYmIGlzQnVmZmVyKG9iai5zbGljZSgwLCAwKSlcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9pcy1idWZmZXIvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDE2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBmbGF0dGVuID0gcmVxdWlyZSgnZmxhdHRlbi12ZXJ0ZXgtZGF0YScpXG52YXIgd2FybmVkID0gZmFsc2U7XG5cbm1vZHVsZS5leHBvcnRzLmF0dHIgPSBzZXRBdHRyaWJ1dGVcbm1vZHVsZS5leHBvcnRzLmluZGV4ID0gc2V0SW5kZXhcblxuZnVuY3Rpb24gc2V0SW5kZXggKGdlb21ldHJ5LCBkYXRhLCBpdGVtU2l6ZSwgZHR5cGUpIHtcbiAgaWYgKHR5cGVvZiBpdGVtU2l6ZSAhPT0gJ251bWJlcicpIGl0ZW1TaXplID0gMVxuICBpZiAodHlwZW9mIGR0eXBlICE9PSAnc3RyaW5nJykgZHR5cGUgPSAndWludDE2J1xuXG4gIHZhciBpc1I2OSA9ICFnZW9tZXRyeS5pbmRleCAmJiB0eXBlb2YgZ2VvbWV0cnkuc2V0SW5kZXggIT09ICdmdW5jdGlvbidcbiAgdmFyIGF0dHJpYiA9IGlzUjY5ID8gZ2VvbWV0cnkuZ2V0QXR0cmlidXRlKCdpbmRleCcpIDogZ2VvbWV0cnkuaW5kZXhcbiAgdmFyIG5ld0F0dHJpYiA9IHVwZGF0ZUF0dHJpYnV0ZShhdHRyaWIsIGRhdGEsIGl0ZW1TaXplLCBkdHlwZSlcbiAgaWYgKG5ld0F0dHJpYikge1xuICAgIGlmIChpc1I2OSkgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdpbmRleCcsIG5ld0F0dHJpYilcbiAgICBlbHNlIGdlb21ldHJ5LmluZGV4ID0gbmV3QXR0cmliXG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0QXR0cmlidXRlIChnZW9tZXRyeSwga2V5LCBkYXRhLCBpdGVtU2l6ZSwgZHR5cGUpIHtcbiAgaWYgKHR5cGVvZiBpdGVtU2l6ZSAhPT0gJ251bWJlcicpIGl0ZW1TaXplID0gM1xuICBpZiAodHlwZW9mIGR0eXBlICE9PSAnc3RyaW5nJykgZHR5cGUgPSAnZmxvYXQzMidcbiAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkgJiZcbiAgICBBcnJheS5pc0FycmF5KGRhdGFbMF0pICYmXG4gICAgZGF0YVswXS5sZW5ndGggIT09IGl0ZW1TaXplKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOZXN0ZWQgdmVydGV4IGFycmF5IGhhcyB1bmV4cGVjdGVkIHNpemU7IGV4cGVjdGVkICcgK1xuICAgICAgaXRlbVNpemUgKyAnIGJ1dCBmb3VuZCAnICsgZGF0YVswXS5sZW5ndGgpXG4gIH1cblxuICB2YXIgYXR0cmliID0gZ2VvbWV0cnkuZ2V0QXR0cmlidXRlKGtleSlcbiAgdmFyIG5ld0F0dHJpYiA9IHVwZGF0ZUF0dHJpYnV0ZShhdHRyaWIsIGRhdGEsIGl0ZW1TaXplLCBkdHlwZSlcbiAgaWYgKG5ld0F0dHJpYikge1xuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZShrZXksIG5ld0F0dHJpYilcbiAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVBdHRyaWJ1dGUgKGF0dHJpYiwgZGF0YSwgaXRlbVNpemUsIGR0eXBlKSB7XG4gIGRhdGEgPSBkYXRhIHx8IFtdXG4gIGlmICghYXR0cmliIHx8IHJlYnVpbGRBdHRyaWJ1dGUoYXR0cmliLCBkYXRhLCBpdGVtU2l6ZSkpIHtcbiAgICAvLyBjcmVhdGUgYSBuZXcgYXJyYXkgd2l0aCBkZXNpcmVkIHR5cGVcbiAgICBkYXRhID0gZmxhdHRlbihkYXRhLCBkdHlwZSlcblxuICAgIHZhciBuZWVkc05ld0J1ZmZlciA9IGF0dHJpYiAmJiB0eXBlb2YgYXR0cmliLnNldEFycmF5ICE9PSAnZnVuY3Rpb24nXG4gICAgaWYgKCFhdHRyaWIgfHwgbmVlZHNOZXdCdWZmZXIpIHtcbiAgICAgIC8vIFdlIGFyZSBvbiBhbiBvbGQgdmVyc2lvbiBvZiBUaHJlZUpTIHdoaWNoIGNhbid0XG4gICAgICAvLyBzdXBwb3J0IGdyb3dpbmcgLyBzaHJpbmtpbmcgYnVmZmVycywgc28gd2UgbmVlZFxuICAgICAgLy8gdG8gYnVpbGQgYSBuZXcgYnVmZmVyXG4gICAgICBpZiAobmVlZHNOZXdCdWZmZXIgJiYgIXdhcm5lZCkge1xuICAgICAgICB3YXJuZWQgPSB0cnVlXG4gICAgICAgIGNvbnNvbGUud2FybihbXG4gICAgICAgICAgJ0EgV2ViR0wgYnVmZmVyIGlzIGJlaW5nIHVwZGF0ZWQgd2l0aCBhIG5ldyBzaXplIG9yIGl0ZW1TaXplLCAnLFxuICAgICAgICAgICdob3dldmVyIHRoaXMgdmVyc2lvbiBvZiBUaHJlZUpTIG9ubHkgc3VwcG9ydHMgZml4ZWQtc2l6ZSBidWZmZXJzLicsXG4gICAgICAgICAgJ1xcblRoZSBvbGQgYnVmZmVyIG1heSBzdGlsbCBiZSBrZXB0IGluIG1lbW9yeS5cXG4nLFxuICAgICAgICAgICdUbyBhdm9pZCBtZW1vcnkgbGVha3MsIGl0IGlzIHJlY29tbWVuZGVkIHRoYXQgeW91IGRpc3Bvc2UgJyxcbiAgICAgICAgICAneW91ciBnZW9tZXRyaWVzIGFuZCBjcmVhdGUgbmV3IG9uZXMsIG9yIHVwZGF0ZSB0byBUaHJlZUpTIHI4MiBvciBuZXdlci5cXG4nLFxuICAgICAgICAgICdTZWUgaGVyZSBmb3IgZGlzY3Vzc2lvbjpcXG4nLFxuICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3RocmVlLmpzL3B1bGwvOTYzMSdcbiAgICAgICAgXS5qb2luKCcnKSlcbiAgICAgIH1cblxuICAgICAgLy8gQnVpbGQgYSBuZXcgYXR0cmlidXRlXG4gICAgICBhdHRyaWIgPSBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKGRhdGEsIGl0ZW1TaXplKTtcbiAgICB9XG5cbiAgICBhdHRyaWIuaXRlbVNpemUgPSBpdGVtU2l6ZVxuICAgIGF0dHJpYi5uZWVkc1VwZGF0ZSA9IHRydWVcblxuICAgIC8vIE5ldyB2ZXJzaW9ucyBvZiBUaHJlZUpTIHN1Z2dlc3QgdXNpbmcgc2V0QXJyYXlcbiAgICAvLyB0byBjaGFuZ2UgdGhlIGRhdGEuIEl0IHdpbGwgdXNlIGJ1ZmZlckRhdGEgaW50ZXJuYWxseSxcbiAgICAvLyBzbyB5b3UgY2FuIGNoYW5nZSB0aGUgYXJyYXkgc2l6ZSB3aXRob3V0IGFueSBpc3N1ZXNcbiAgICBpZiAodHlwZW9mIGF0dHJpYi5zZXRBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYXR0cmliLnNldEFycmF5KGRhdGEpXG4gICAgfVxuXG4gICAgcmV0dXJuIGF0dHJpYlxuICB9IGVsc2Uge1xuICAgIC8vIGNvcHkgZGF0YSBpbnRvIHRoZSBleGlzdGluZyBhcnJheVxuICAgIGZsYXR0ZW4oZGF0YSwgYXR0cmliLmFycmF5KVxuICAgIGF0dHJpYi5uZWVkc1VwZGF0ZSA9IHRydWVcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbi8vIFRlc3Qgd2hldGhlciB0aGUgYXR0cmlidXRlIG5lZWRzIHRvIGJlIHJlLWNyZWF0ZWQsXG4vLyByZXR1cm5zIGZhbHNlIGlmIHdlIGNhbiByZS11c2UgaXQgYXMtaXMuXG5mdW5jdGlvbiByZWJ1aWxkQXR0cmlidXRlIChhdHRyaWIsIGRhdGEsIGl0ZW1TaXplKSB7XG4gIGlmIChhdHRyaWIuaXRlbVNpemUgIT09IGl0ZW1TaXplKSByZXR1cm4gdHJ1ZVxuICBpZiAoIWF0dHJpYi5hcnJheSkgcmV0dXJuIHRydWVcbiAgdmFyIGF0dHJpYkxlbmd0aCA9IGF0dHJpYi5hcnJheS5sZW5ndGhcbiAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkgJiYgQXJyYXkuaXNBcnJheShkYXRhWzBdKSkge1xuICAgIC8vIFsgWyB4LCB5LCB6IF0gXVxuICAgIHJldHVybiBhdHRyaWJMZW5ndGggIT09IGRhdGEubGVuZ3RoICogaXRlbVNpemVcbiAgfSBlbHNlIHtcbiAgICAvLyBbIHgsIHksIHogXVxuICAgIHJldHVybiBhdHRyaWJMZW5ndGggIT09IGRhdGEubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vdGhyZWUtYnVmZmVyLXZlcnRleC1kYXRhL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKmVzbGludCBuZXctY2FwOjAqL1xudmFyIGR0eXBlID0gcmVxdWlyZSgnZHR5cGUnKVxubW9kdWxlLmV4cG9ydHMgPSBmbGF0dGVuVmVydGV4RGF0YVxuZnVuY3Rpb24gZmxhdHRlblZlcnRleERhdGEgKGRhdGEsIG91dHB1dCwgb2Zmc2V0KSB7XG4gIGlmICghZGF0YSkgdGhyb3cgbmV3IFR5cGVFcnJvcignbXVzdCBzcGVjaWZ5IGRhdGEgYXMgZmlyc3QgcGFyYW1ldGVyJylcbiAgb2Zmc2V0ID0gKyhvZmZzZXQgfHwgMCkgfCAwXG5cbiAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkgJiYgQXJyYXkuaXNBcnJheShkYXRhWzBdKSkge1xuICAgIHZhciBkaW0gPSBkYXRhWzBdLmxlbmd0aFxuICAgIHZhciBsZW5ndGggPSBkYXRhLmxlbmd0aCAqIGRpbVxuXG4gICAgLy8gbm8gb3V0cHV0IHNwZWNpZmllZCwgY3JlYXRlIGEgbmV3IHR5cGVkIGFycmF5XG4gICAgaWYgKCFvdXRwdXQgfHwgdHlwZW9mIG91dHB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG91dHB1dCA9IG5ldyAoZHR5cGUob3V0cHV0IHx8ICdmbG9hdDMyJykpKGxlbmd0aCArIG9mZnNldClcbiAgICB9XG5cbiAgICB2YXIgZHN0TGVuZ3RoID0gb3V0cHV0Lmxlbmd0aCAtIG9mZnNldFxuICAgIGlmIChsZW5ndGggIT09IGRzdExlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdzb3VyY2UgbGVuZ3RoICcgKyBsZW5ndGggKyAnICgnICsgZGltICsgJ3gnICsgZGF0YS5sZW5ndGggKyAnKScgK1xuICAgICAgICAnIGRvZXMgbm90IG1hdGNoIGRlc3RpbmF0aW9uIGxlbmd0aCAnICsgZHN0TGVuZ3RoKVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwLCBrID0gb2Zmc2V0OyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBkaW07IGorKykge1xuICAgICAgICBvdXRwdXRbaysrXSA9IGRhdGFbaV1bal1cbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKCFvdXRwdXQgfHwgdHlwZW9mIG91dHB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIG5vIG91dHB1dCwgY3JlYXRlIGEgbmV3IG9uZVxuICAgICAgdmFyIEN0b3IgPSBkdHlwZShvdXRwdXQgfHwgJ2Zsb2F0MzInKVxuICAgICAgaWYgKG9mZnNldCA9PT0gMCkge1xuICAgICAgICBvdXRwdXQgPSBuZXcgQ3RvcihkYXRhKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0cHV0ID0gbmV3IEN0b3IoZGF0YS5sZW5ndGggKyBvZmZzZXQpXG4gICAgICAgIG91dHB1dC5zZXQoZGF0YSwgb2Zmc2V0KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzdG9yZSBvdXRwdXQgaW4gZXhpc3RpbmcgYXJyYXlcbiAgICAgIG91dHB1dC5zZXQoZGF0YSwgb2Zmc2V0KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvdXRwdXRcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9mbGF0dGVuLXZlcnRleC1kYXRhL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxub2JqZWN0LWFzc2lnblxuKGMpIFNpbmRyZSBTb3JodXNcbkBsaWNlbnNlIE1JVFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbnZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBwcm9wSXNFbnVtZXJhYmxlID0gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuZnVuY3Rpb24gdG9PYmplY3QodmFsKSB7XG5cdGlmICh2YWwgPT09IG51bGwgfHwgdmFsID09PSB1bmRlZmluZWQpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCcpO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdCh2YWwpO1xufVxuXG5mdW5jdGlvbiBzaG91bGRVc2VOYXRpdmUoKSB7XG5cdHRyeSB7XG5cdFx0aWYgKCFPYmplY3QuYXNzaWduKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gRGV0ZWN0IGJ1Z2d5IHByb3BlcnR5IGVudW1lcmF0aW9uIG9yZGVyIGluIG9sZGVyIFY4IHZlcnNpb25zLlxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9NDExOFxuXHRcdHZhciB0ZXN0MSA9IG5ldyBTdHJpbmcoJ2FiYycpOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXctd3JhcHBlcnNcblx0XHR0ZXN0MVs1XSA9ICdkZSc7XG5cdFx0aWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRlc3QxKVswXSA9PT0gJzUnKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuXHRcdHZhciB0ZXN0MiA9IHt9O1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykge1xuXHRcdFx0dGVzdDJbJ18nICsgU3RyaW5nLmZyb21DaGFyQ29kZShpKV0gPSBpO1xuXHRcdH1cblx0XHR2YXIgb3JkZXIyID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDIpLm1hcChmdW5jdGlvbiAobikge1xuXHRcdFx0cmV0dXJuIHRlc3QyW25dO1xuXHRcdH0pO1xuXHRcdGlmIChvcmRlcjIuam9pbignJykgIT09ICcwMTIzNDU2Nzg5Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTMwNTZcblx0XHR2YXIgdGVzdDMgPSB7fTtcblx0XHQnYWJjZGVmZ2hpamtsbW5vcHFyc3QnLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChsZXR0ZXIpIHtcblx0XHRcdHRlc3QzW2xldHRlcl0gPSBsZXR0ZXI7XG5cdFx0fSk7XG5cdFx0aWYgKE9iamVjdC5rZXlzKE9iamVjdC5hc3NpZ24oe30sIHRlc3QzKSkuam9pbignJykgIT09XG5cdFx0XHRcdCdhYmNkZWZnaGlqa2xtbm9wcXJzdCcpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gV2UgZG9uJ3QgZXhwZWN0IGFueSBvZiB0aGUgYWJvdmUgdG8gdGhyb3csIGJ1dCBiZXR0ZXIgdG8gYmUgc2FmZS5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaG91bGRVc2VOYXRpdmUoKSA/IE9iamVjdC5hc3NpZ24gOiBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciB0byA9IHRvT2JqZWN0KHRhcmdldCk7XG5cdHZhciBzeW1ib2xzO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IE9iamVjdChhcmd1bWVudHNbc10pO1xuXG5cdFx0Zm9yICh2YXIga2V5IGluIGZyb20pIHtcblx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcblx0XHRcdFx0dG9ba2V5XSA9IGZyb21ba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG5cdFx0XHRzeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGZyb20pO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzeW1ib2xzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChwcm9wSXNFbnVtZXJhYmxlLmNhbGwoZnJvbSwgc3ltYm9sc1tpXSkpIHtcblx0XHRcdFx0XHR0b1tzeW1ib2xzW2ldXSA9IGZyb21bc3ltYm9sc1tpXV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG87XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L29iamVjdC1hc3NpZ24vaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDE5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzLnBhZ2VzID0gZnVuY3Rpb24gcGFnZXMgKGdseXBocykge1xuICB2YXIgcGFnZXMgPSBuZXcgRmxvYXQzMkFycmF5KGdseXBocy5sZW5ndGggKiA0ICogMSlcbiAgdmFyIGkgPSAwXG4gIGdseXBocy5mb3JFYWNoKGZ1bmN0aW9uIChnbHlwaCkge1xuICAgIHZhciBpZCA9IGdseXBoLmRhdGEucGFnZSB8fCAwXG4gICAgcGFnZXNbaSsrXSA9IGlkXG4gICAgcGFnZXNbaSsrXSA9IGlkXG4gICAgcGFnZXNbaSsrXSA9IGlkXG4gICAgcGFnZXNbaSsrXSA9IGlkXG4gIH0pXG4gIHJldHVybiBwYWdlc1xufVxuXG5tb2R1bGUuZXhwb3J0cy51dnMgPSBmdW5jdGlvbiB1dnMgKGdseXBocywgdGV4V2lkdGgsIHRleEhlaWdodCwgZmxpcFkpIHtcbiAgdmFyIHV2cyA9IG5ldyBGbG9hdDMyQXJyYXkoZ2x5cGhzLmxlbmd0aCAqIDQgKiAyKVxuICB2YXIgaSA9IDBcbiAgZ2x5cGhzLmZvckVhY2goZnVuY3Rpb24gKGdseXBoKSB7XG4gICAgdmFyIGJpdG1hcCA9IGdseXBoLmRhdGFcbiAgICB2YXIgYncgPSAoYml0bWFwLnggKyBiaXRtYXAud2lkdGgpXG4gICAgdmFyIGJoID0gKGJpdG1hcC55ICsgYml0bWFwLmhlaWdodClcblxuICAgIC8vIHRvcCBsZWZ0IHBvc2l0aW9uXG4gICAgdmFyIHUwID0gYml0bWFwLnggLyB0ZXhXaWR0aFxuICAgIHZhciB2MSA9IGJpdG1hcC55IC8gdGV4SGVpZ2h0XG4gICAgdmFyIHUxID0gYncgLyB0ZXhXaWR0aFxuICAgIHZhciB2MCA9IGJoIC8gdGV4SGVpZ2h0XG5cbiAgICBpZiAoZmxpcFkpIHtcbiAgICAgIHYxID0gKHRleEhlaWdodCAtIGJpdG1hcC55KSAvIHRleEhlaWdodFxuICAgICAgdjAgPSAodGV4SGVpZ2h0IC0gYmgpIC8gdGV4SGVpZ2h0XG4gICAgfVxuXG4gICAgLy8gQkxcbiAgICB1dnNbaSsrXSA9IHUwXG4gICAgdXZzW2krK10gPSB2MVxuICAgIC8vIFRMXG4gICAgdXZzW2krK10gPSB1MFxuICAgIHV2c1tpKytdID0gdjBcbiAgICAvLyBUUlxuICAgIHV2c1tpKytdID0gdTFcbiAgICB1dnNbaSsrXSA9IHYwXG4gICAgLy8gQlJcbiAgICB1dnNbaSsrXSA9IHUxXG4gICAgdXZzW2krK10gPSB2MVxuICB9KVxuICByZXR1cm4gdXZzXG59XG5cbm1vZHVsZS5leHBvcnRzLnBvc2l0aW9ucyA9IGZ1bmN0aW9uIHBvc2l0aW9ucyAoZ2x5cGhzKSB7XG4gIHZhciBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KGdseXBocy5sZW5ndGggKiA0ICogMilcbiAgdmFyIGkgPSAwXG4gIGdseXBocy5mb3JFYWNoKGZ1bmN0aW9uIChnbHlwaCkge1xuICAgIHZhciBiaXRtYXAgPSBnbHlwaC5kYXRhXG5cbiAgICAvLyBib3R0b20gbGVmdCBwb3NpdGlvblxuICAgIHZhciB4ID0gZ2x5cGgucG9zaXRpb25bMF0gKyBiaXRtYXAueG9mZnNldFxuICAgIHZhciB5ID0gZ2x5cGgucG9zaXRpb25bMV0gKyBiaXRtYXAueW9mZnNldFxuXG4gICAgLy8gcXVhZCBzaXplXG4gICAgdmFyIHcgPSBiaXRtYXAud2lkdGhcbiAgICB2YXIgaCA9IGJpdG1hcC5oZWlnaHRcblxuICAgIC8vIEJMXG4gICAgcG9zaXRpb25zW2krK10gPSB4XG4gICAgcG9zaXRpb25zW2krK10gPSB5XG4gICAgLy8gVExcbiAgICBwb3NpdGlvbnNbaSsrXSA9IHhcbiAgICBwb3NpdGlvbnNbaSsrXSA9IHkgKyBoXG4gICAgLy8gVFJcbiAgICBwb3NpdGlvbnNbaSsrXSA9IHggKyB3XG4gICAgcG9zaXRpb25zW2krK10gPSB5ICsgaFxuICAgIC8vIEJSXG4gICAgcG9zaXRpb25zW2krK10gPSB4ICsgd1xuICAgIHBvc2l0aW9uc1tpKytdID0geVxuICB9KVxuICByZXR1cm4gcG9zaXRpb25zXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vdGhyZWUtYm1mb250LXRleHQvbGliL3ZlcnRpY2VzLmpzXG4vLyBtb2R1bGUgaWQgPSAyMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaXRlbVNpemUgPSAyXG52YXIgYm94ID0geyBtaW46IFswLCAwXSwgbWF4OiBbMCwgMF0gfVxuXG5mdW5jdGlvbiBib3VuZHMgKHBvc2l0aW9ucykge1xuICB2YXIgY291bnQgPSBwb3NpdGlvbnMubGVuZ3RoIC8gaXRlbVNpemVcbiAgYm94Lm1pblswXSA9IHBvc2l0aW9uc1swXVxuICBib3gubWluWzFdID0gcG9zaXRpb25zWzFdXG4gIGJveC5tYXhbMF0gPSBwb3NpdGlvbnNbMF1cbiAgYm94Lm1heFsxXSA9IHBvc2l0aW9uc1sxXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgIHZhciB4ID0gcG9zaXRpb25zW2kgKiBpdGVtU2l6ZSArIDBdXG4gICAgdmFyIHkgPSBwb3NpdGlvbnNbaSAqIGl0ZW1TaXplICsgMV1cbiAgICBib3gubWluWzBdID0gTWF0aC5taW4oeCwgYm94Lm1pblswXSlcbiAgICBib3gubWluWzFdID0gTWF0aC5taW4oeSwgYm94Lm1pblsxXSlcbiAgICBib3gubWF4WzBdID0gTWF0aC5tYXgoeCwgYm94Lm1heFswXSlcbiAgICBib3gubWF4WzFdID0gTWF0aC5tYXgoeSwgYm94Lm1heFsxXSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5jb21wdXRlQm94ID0gZnVuY3Rpb24gKHBvc2l0aW9ucywgb3V0cHV0KSB7XG4gIGJvdW5kcyhwb3NpdGlvbnMpXG4gIG91dHB1dC5taW4uc2V0KGJveC5taW5bMF0sIGJveC5taW5bMV0sIDApXG4gIG91dHB1dC5tYXguc2V0KGJveC5tYXhbMF0sIGJveC5tYXhbMV0sIDApXG59XG5cbm1vZHVsZS5leHBvcnRzLmNvbXB1dGVTcGhlcmUgPSBmdW5jdGlvbiAocG9zaXRpb25zLCBvdXRwdXQpIHtcbiAgYm91bmRzKHBvc2l0aW9ucylcbiAgdmFyIG1pblggPSBib3gubWluWzBdXG4gIHZhciBtaW5ZID0gYm94Lm1pblsxXVxuICB2YXIgbWF4WCA9IGJveC5tYXhbMF1cbiAgdmFyIG1heFkgPSBib3gubWF4WzFdXG4gIHZhciB3aWR0aCA9IG1heFggLSBtaW5YXG4gIHZhciBoZWlnaHQgPSBtYXhZIC0gbWluWVxuICB2YXIgbGVuZ3RoID0gTWF0aC5zcXJ0KHdpZHRoICogd2lkdGggKyBoZWlnaHQgKiBoZWlnaHQpXG4gIG91dHB1dC5jZW50ZXIuc2V0KG1pblggKyB3aWR0aCAvIDIsIG1pblkgKyBoZWlnaHQgLyAyLCAwKVxuICBvdXRwdXQucmFkaXVzID0gbGVuZ3RoIC8gMlxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3RocmVlLWJtZm9udC10ZXh0L2xpYi91dGlscy5qc1xuLy8gbW9kdWxlIGlkID0gMjFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHhociA9IHJlcXVpcmUoJ3hocicpXG52YXIgbm9vcCA9IGZ1bmN0aW9uKCl7fVxudmFyIHBhcnNlQVNDSUkgPSByZXF1aXJlKCdwYXJzZS1ibWZvbnQtYXNjaWknKVxudmFyIHBhcnNlWE1MID0gcmVxdWlyZSgncGFyc2UtYm1mb250LXhtbCcpXG52YXIgcmVhZEJpbmFyeSA9IHJlcXVpcmUoJ3BhcnNlLWJtZm9udC1iaW5hcnknKVxudmFyIGlzQmluYXJ5Rm9ybWF0ID0gcmVxdWlyZSgnLi9saWIvaXMtYmluYXJ5JylcbnZhciB4dGVuZCA9IHJlcXVpcmUoJ3h0ZW5kJylcblxudmFyIHhtbDIgPSAoZnVuY3Rpb24gaGFzWE1MMigpIHtcbiAgcmV0dXJuIHNlbGYuWE1MSHR0cFJlcXVlc3QgJiYgXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiBuZXcgWE1MSHR0cFJlcXVlc3Rcbn0pKClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcHQsIGNiKSB7XG4gIGNiID0gdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nID8gY2IgOiBub29wXG5cbiAgaWYgKHR5cGVvZiBvcHQgPT09ICdzdHJpbmcnKVxuICAgIG9wdCA9IHsgdXJpOiBvcHQgfVxuICBlbHNlIGlmICghb3B0KVxuICAgIG9wdCA9IHt9XG5cbiAgdmFyIGV4cGVjdEJpbmFyeSA9IG9wdC5iaW5hcnlcbiAgaWYgKGV4cGVjdEJpbmFyeSlcbiAgICBvcHQgPSBnZXRCaW5hcnlPcHRzKG9wdClcblxuICB4aHIob3B0LCBmdW5jdGlvbihlcnIsIHJlcywgYm9keSkge1xuICAgIGlmIChlcnIpXG4gICAgICByZXR1cm4gY2IoZXJyKVxuICAgIGlmICghL14yLy50ZXN0KHJlcy5zdGF0dXNDb2RlKSlcbiAgICAgIHJldHVybiBjYihuZXcgRXJyb3IoJ2h0dHAgc3RhdHVzIGNvZGU6ICcrcmVzLnN0YXR1c0NvZGUpKVxuICAgIGlmICghYm9keSlcbiAgICAgIHJldHVybiBjYihuZXcgRXJyb3IoJ25vIGJvZHkgcmVzdWx0JykpXG5cbiAgICB2YXIgYmluYXJ5ID0gZmFsc2UgXG5cbiAgICAvL2lmIHRoZSByZXNwb25zZSB0eXBlIGlzIGFuIGFycmF5IGJ1ZmZlcixcbiAgICAvL3dlIG5lZWQgdG8gY29udmVydCBpdCBpbnRvIGEgcmVndWxhciBCdWZmZXIgb2JqZWN0XG4gICAgaWYgKGlzQXJyYXlCdWZmZXIoYm9keSkpIHtcbiAgICAgIHZhciBhcnJheSA9IG5ldyBVaW50OEFycmF5KGJvZHkpXG4gICAgICBib2R5ID0gbmV3IEJ1ZmZlcihhcnJheSwgJ2JpbmFyeScpXG4gICAgfVxuXG4gICAgLy9ub3cgY2hlY2sgdGhlIHN0cmluZy9CdWZmZXIgcmVzcG9uc2VcbiAgICAvL2FuZCBzZWUgaWYgaXQgaGFzIGEgYmluYXJ5IEJNRiBoZWFkZXJcbiAgICBpZiAoaXNCaW5hcnlGb3JtYXQoYm9keSkpIHtcbiAgICAgIGJpbmFyeSA9IHRydWVcbiAgICAgIC8vaWYgd2UgaGF2ZSBhIHN0cmluZywgdHVybiBpdCBpbnRvIGEgQnVmZmVyXG4gICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSBcbiAgICAgICAgYm9keSA9IG5ldyBCdWZmZXIoYm9keSwgJ2JpbmFyeScpXG4gICAgfSBcblxuICAgIC8vd2UgYXJlIG5vdCBwYXJzaW5nIGEgYmluYXJ5IGZvcm1hdCwganVzdCBBU0NJSS9YTUwvZXRjXG4gICAgaWYgKCFiaW5hcnkpIHtcbiAgICAgIC8vbWlnaHQgc3RpbGwgYmUgYSBidWZmZXIgaWYgcmVzcG9uc2VUeXBlIGlzICdhcnJheWJ1ZmZlcidcbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoYm9keSkpXG4gICAgICAgIGJvZHkgPSBib2R5LnRvU3RyaW5nKG9wdC5lbmNvZGluZylcbiAgICAgIGJvZHkgPSBib2R5LnRyaW0oKVxuICAgIH1cblxuICAgIHZhciByZXN1bHRcbiAgICB0cnkge1xuICAgICAgdmFyIHR5cGUgPSByZXMuaGVhZGVyc1snY29udGVudC10eXBlJ11cbiAgICAgIGlmIChiaW5hcnkpXG4gICAgICAgIHJlc3VsdCA9IHJlYWRCaW5hcnkoYm9keSlcbiAgICAgIGVsc2UgaWYgKC9qc29uLy50ZXN0KHR5cGUpIHx8IGJvZHkuY2hhckF0KDApID09PSAneycpXG4gICAgICAgIHJlc3VsdCA9IEpTT04ucGFyc2UoYm9keSlcbiAgICAgIGVsc2UgaWYgKC94bWwvLnRlc3QodHlwZSkgIHx8IGJvZHkuY2hhckF0KDApID09PSAnPCcpXG4gICAgICAgIHJlc3VsdCA9IHBhcnNlWE1MKGJvZHkpXG4gICAgICBlbHNlXG4gICAgICAgIHJlc3VsdCA9IHBhcnNlQVNDSUkoYm9keSlcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjYihuZXcgRXJyb3IoJ2Vycm9yIHBhcnNpbmcgZm9udCAnK2UubWVzc2FnZSkpXG4gICAgICBjYiA9IG5vb3BcbiAgICB9XG4gICAgY2IobnVsbCwgcmVzdWx0KVxuICB9KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyKGFycikge1xuICB2YXIgc3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xuICByZXR1cm4gc3RyLmNhbGwoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJ1xufVxuXG5mdW5jdGlvbiBnZXRCaW5hcnlPcHRzKG9wdCkge1xuICAvL0lFMTArIGFuZCBvdGhlciBtb2Rlcm4gYnJvd3NlcnMgc3VwcG9ydCBhcnJheSBidWZmZXJzXG4gIGlmICh4bWwyKVxuICAgIHJldHVybiB4dGVuZChvcHQsIHsgcmVzcG9uc2VUeXBlOiAnYXJyYXlidWZmZXInIH0pXG4gIFxuICBpZiAodHlwZW9mIHNlbGYuWE1MSHR0cFJlcXVlc3QgPT09ICd1bmRlZmluZWQnKVxuICAgIHRocm93IG5ldyBFcnJvcigneW91ciBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgWEhSIGxvYWRpbmcnKVxuXG4gIC8vSUU5IGFuZCBYTUwxIGJyb3dzZXJzIGNvdWxkIHN0aWxsIHVzZSBhbiBvdmVycmlkZVxuICB2YXIgcmVxID0gbmV3IHNlbGYuWE1MSHR0cFJlcXVlc3QoKVxuICByZXEub3ZlcnJpZGVNaW1lVHlwZSgndGV4dC9wbGFpbjsgY2hhcnNldD14LXVzZXItZGVmaW5lZCcpXG4gIHJldHVybiB4dGVuZCh7XG4gICAgeGhyOiByZXFcbiAgfSwgb3B0KVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvYWQtYm1mb250L2Jyb3dzZXIuanNcbi8vIG1vZHVsZSBpZCA9IDIyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXG5cbid1c2Ugc3RyaWN0J1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2lzYXJyYXknKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gU2xvd0J1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKG1vc3QgY29tcGF0aWJsZSwgZXZlbiBJRTYpXG4gKlxuICogQnJvd3NlcnMgdGhhdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLCBDaHJvbWUgNyssIFNhZmFyaSA1LjErLFxuICogT3BlcmEgMTEuNissIGlPUyA0LjIrLlxuICpcbiAqIER1ZSB0byB2YXJpb3VzIGJyb3dzZXIgYnVncywgc29tZXRpbWVzIHRoZSBPYmplY3QgaW1wbGVtZW50YXRpb24gd2lsbCBiZSB1c2VkIGV2ZW5cbiAqIHdoZW4gdGhlIGJyb3dzZXIgc3VwcG9ydHMgdHlwZWQgYXJyYXlzLlxuICpcbiAqIE5vdGU6XG4gKlxuICogICAtIEZpcmVmb3ggNC0yOSBsYWNrcyBzdXBwb3J0IGZvciBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcyxcbiAqICAgICBTZWU6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOC5cbiAqXG4gKiAgIC0gQ2hyb21lIDktMTAgaXMgbWlzc2luZyB0aGUgYFR5cGVkQXJyYXkucHJvdG90eXBlLnN1YmFycmF5YCBmdW5jdGlvbi5cbiAqXG4gKiAgIC0gSUUxMCBoYXMgYSBicm9rZW4gYFR5cGVkQXJyYXkucHJvdG90eXBlLnN1YmFycmF5YCBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGFycmF5cyBvZlxuICogICAgIGluY29ycmVjdCBsZW5ndGggaW4gc29tZSBzaXR1YXRpb25zLlxuXG4gKiBXZSBkZXRlY3QgdGhlc2UgYnVnZ3kgYnJvd3NlcnMgYW5kIHNldCBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgIHRvIGBmYWxzZWAgc28gdGhleVxuICogZ2V0IHRoZSBPYmplY3QgaW1wbGVtZW50YXRpb24sIHdoaWNoIGlzIHNsb3dlciBidXQgYmVoYXZlcyBjb3JyZWN0bHkuXG4gKi9cbkJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUID0gZ2xvYmFsLlRZUEVEX0FSUkFZX1NVUFBPUlQgIT09IHVuZGVmaW5lZFxuICA/IGdsb2JhbC5UWVBFRF9BUlJBWV9TVVBQT1JUXG4gIDogdHlwZWRBcnJheVN1cHBvcnQoKVxuXG4vKlxuICogRXhwb3J0IGtNYXhMZW5ndGggYWZ0ZXIgdHlwZWQgYXJyYXkgc3VwcG9ydCBpcyBkZXRlcm1pbmVkLlxuICovXG5leHBvcnRzLmtNYXhMZW5ndGggPSBrTWF4TGVuZ3RoKClcblxuZnVuY3Rpb24gdHlwZWRBcnJheVN1cHBvcnQgKCkge1xuICB0cnkge1xuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheSgxKVxuICAgIGFyci5fX3Byb3RvX18gPSB7X19wcm90b19fOiBVaW50OEFycmF5LnByb3RvdHlwZSwgZm9vOiBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9fVxuICAgIHJldHVybiBhcnIuZm9vKCkgPT09IDQyICYmIC8vIHR5cGVkIGFycmF5IGluc3RhbmNlcyBjYW4gYmUgYXVnbWVudGVkXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgJiYgLy8gY2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gICAgICAgIGFyci5zdWJhcnJheSgxLCAxKS5ieXRlTGVuZ3RoID09PSAwIC8vIGllMTAgaGFzIGJyb2tlbiBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5mdW5jdGlvbiBrTWF4TGVuZ3RoICgpIHtcbiAgcmV0dXJuIEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUXG4gICAgPyAweDdmZmZmZmZmXG4gICAgOiAweDNmZmZmZmZmXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1ZmZlciAodGhhdCwgbGVuZ3RoKSB7XG4gIGlmIChrTWF4TGVuZ3RoKCkgPCBsZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCB0eXBlZCBhcnJheSBsZW5ndGgnKVxuICB9XG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlLCBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIHRoYXQgPSBuZXcgVWludDhBcnJheShsZW5ndGgpXG4gICAgdGhhdC5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBhbiBvYmplY3QgaW5zdGFuY2Ugb2YgdGhlIEJ1ZmZlciBjbGFzc1xuICAgIGlmICh0aGF0ID09PSBudWxsKSB7XG4gICAgICB0aGF0ID0gbmV3IEJ1ZmZlcihsZW5ndGgpXG4gICAgfVxuICAgIHRoYXQubGVuZ3RoID0gbGVuZ3RoXG4gIH1cblxuICByZXR1cm4gdGhhdFxufVxuXG4vKipcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgaGF2ZSB0aGVpclxuICogcHJvdG90eXBlIGNoYW5nZWQgdG8gYEJ1ZmZlci5wcm90b3R5cGVgLiBGdXJ0aGVybW9yZSwgYEJ1ZmZlcmAgaXMgYSBzdWJjbGFzcyBvZlxuICogYFVpbnQ4QXJyYXlgLCBzbyB0aGUgcmV0dXJuZWQgaW5zdGFuY2VzIHdpbGwgaGF2ZSBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgbWV0aG9kc1xuICogYW5kIHRoZSBgVWludDhBcnJheWAgbWV0aG9kcy4gU3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXRcbiAqIHJldHVybnMgYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogVGhlIGBVaW50OEFycmF5YCBwcm90b3R5cGUgcmVtYWlucyB1bm1vZGlmaWVkLlxuICovXG5cbmZ1bmN0aW9uIEJ1ZmZlciAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCAmJiAhKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICAvLyBDb21tb24gY2FzZS5cbiAgaWYgKHR5cGVvZiBhcmcgPT09ICdudW1iZXInKSB7XG4gICAgaWYgKHR5cGVvZiBlbmNvZGluZ09yT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnSWYgZW5jb2RpbmcgaXMgc3BlY2lmaWVkIHRoZW4gdGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcnXG4gICAgICApXG4gICAgfVxuICAgIHJldHVybiBhbGxvY1Vuc2FmZSh0aGlzLCBhcmcpXG4gIH1cbiAgcmV0dXJuIGZyb20odGhpcywgYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTIgLy8gbm90IHVzZWQgYnkgdGhpcyBpbXBsZW1lbnRhdGlvblxuXG4vLyBUT0RPOiBMZWdhY3ksIG5vdCBuZWVkZWQgYW55bW9yZS4gUmVtb3ZlIGluIG5leHQgbWFqb3IgdmVyc2lvbi5cbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIGFyclxufVxuXG5mdW5jdGlvbiBmcm9tICh0aGF0LCB2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJ2YWx1ZVwiIGFyZ3VtZW50IG11c3Qgbm90IGJlIGEgbnVtYmVyJylcbiAgfVxuXG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKHRoYXQsIHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmcm9tU3RyaW5nKHRoYXQsIHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0KVxuICB9XG5cbiAgcmV0dXJuIGZyb21PYmplY3QodGhhdCwgdmFsdWUpXG59XG5cbi8qKlxuICogRnVuY3Rpb25hbGx5IGVxdWl2YWxlbnQgdG8gQnVmZmVyKGFyZywgZW5jb2RpbmcpIGJ1dCB0aHJvd3MgYSBUeXBlRXJyb3JcbiAqIGlmIHZhbHVlIGlzIGEgbnVtYmVyLlxuICogQnVmZmVyLmZyb20oc3RyWywgZW5jb2RpbmddKVxuICogQnVmZmVyLmZyb20oYXJyYXkpXG4gKiBCdWZmZXIuZnJvbShidWZmZXIpXG4gKiBCdWZmZXIuZnJvbShhcnJheUJ1ZmZlclssIGJ5dGVPZmZzZXRbLCBsZW5ndGhdXSlcbiAqKi9cbkJ1ZmZlci5mcm9tID0gZnVuY3Rpb24gKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGZyb20obnVsbCwgdmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gIEJ1ZmZlci5wcm90b3R5cGUuX19wcm90b19fID0gVWludDhBcnJheS5wcm90b3R5cGVcbiAgQnVmZmVyLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXlcbiAgaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC5zcGVjaWVzICYmXG4gICAgICBCdWZmZXJbU3ltYm9sLnNwZWNpZXNdID09PSBCdWZmZXIpIHtcbiAgICAvLyBGaXggc3ViYXJyYXkoKSBpbiBFUzIwMTYuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvcHVsbC85N1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIsIFN5bWJvbC5zcGVjaWVzLCB7XG4gICAgICB2YWx1ZTogbnVsbCxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0U2l6ZSAoc2l6ZSkge1xuICBpZiAodHlwZW9mIHNpemUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBiZSBhIG51bWJlcicpXG4gIH0gZWxzZSBpZiAoc2l6ZSA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBub3QgYmUgbmVnYXRpdmUnKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFsbG9jICh0aGF0LCBzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIGlmIChzaXplIDw9IDApIHtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHRoYXQsIHNpemUpXG4gIH1cbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9ubHkgcGF5IGF0dGVudGlvbiB0byBlbmNvZGluZyBpZiBpdCdzIGEgc3RyaW5nLiBUaGlzXG4gICAgLy8gcHJldmVudHMgYWNjaWRlbnRhbGx5IHNlbmRpbmcgaW4gYSBudW1iZXIgdGhhdCB3b3VsZFxuICAgIC8vIGJlIGludGVycHJldHRlZCBhcyBhIHN0YXJ0IG9mZnNldC5cbiAgICByZXR1cm4gdHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJ1xuICAgICAgPyBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSkuZmlsbChmaWxsLCBlbmNvZGluZylcbiAgICAgIDogY3JlYXRlQnVmZmVyKHRoYXQsIHNpemUpLmZpbGwoZmlsbClcbiAgfVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHRoYXQsIHNpemUpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBmaWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogYWxsb2Moc2l6ZVssIGZpbGxbLCBlbmNvZGluZ11dKVxuICoqL1xuQnVmZmVyLmFsbG9jID0gZnVuY3Rpb24gKHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIHJldHVybiBhbGxvYyhudWxsLCBzaXplLCBmaWxsLCBlbmNvZGluZylcbn1cblxuZnVuY3Rpb24gYWxsb2NVbnNhZmUgKHRoYXQsIHNpemUpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICB0aGF0ID0gY3JlYXRlQnVmZmVyKHRoYXQsIHNpemUgPCAwID8gMCA6IGNoZWNrZWQoc2l6ZSkgfCAwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaXplOyArK2kpIHtcbiAgICAgIHRoYXRbaV0gPSAwXG4gICAgfVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbi8qKlxuICogRXF1aXZhbGVudCB0byBCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqICovXG5CdWZmZXIuYWxsb2NVbnNhZmUgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUobnVsbCwgc2l6ZSlcbn1cbi8qKlxuICogRXF1aXZhbGVudCB0byBTbG93QnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZVNsb3cgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUobnVsbCwgc2l6ZSlcbn1cblxuZnVuY3Rpb24gZnJvbVN0cmluZyAodGhhdCwgc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAodHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJyB8fCBlbmNvZGluZyA9PT0gJycpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICB9XG5cbiAgaWYgKCFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImVuY29kaW5nXCIgbXVzdCBiZSBhIHZhbGlkIHN0cmluZyBlbmNvZGluZycpXG4gIH1cblxuICB2YXIgbGVuZ3RoID0gYnl0ZUxlbmd0aChzdHJpbmcsIGVuY29kaW5nKSB8IDBcbiAgdGhhdCA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBsZW5ndGgpXG5cbiAgdmFyIGFjdHVhbCA9IHRoYXQud3JpdGUoc3RyaW5nLCBlbmNvZGluZylcblxuICBpZiAoYWN0dWFsICE9PSBsZW5ndGgpIHtcbiAgICAvLyBXcml0aW5nIGEgaGV4IHN0cmluZywgZm9yIGV4YW1wbGUsIHRoYXQgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGxcbiAgICAvLyBjYXVzZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdCBpbnZhbGlkIGNoYXJhY3RlciB0byBiZSBpZ25vcmVkLiAoZS5nLlxuICAgIC8vICdhYnh4Y2QnIHdpbGwgYmUgdHJlYXRlZCBhcyAnYWInKVxuICAgIHRoYXQgPSB0aGF0LnNsaWNlKDAsIGFjdHVhbClcbiAgfVxuXG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKHRoYXQsIGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGggPCAwID8gMCA6IGNoZWNrZWQoYXJyYXkubGVuZ3RoKSB8IDBcbiAgdGhhdCA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBsZW5ndGgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICB0aGF0W2ldID0gYXJyYXlbaV0gJiAyNTVcbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlCdWZmZXIgKHRoYXQsIGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpIHtcbiAgYXJyYXkuYnl0ZUxlbmd0aCAvLyB0aGlzIHRocm93cyBpZiBgYXJyYXlgIGlzIG5vdCBhIHZhbGlkIEFycmF5QnVmZmVyXG5cbiAgaWYgKGJ5dGVPZmZzZXQgPCAwIHx8IGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ29mZnNldFxcJyBpcyBvdXQgb2YgYm91bmRzJylcbiAgfVxuXG4gIGlmIChhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCArIChsZW5ndGggfHwgMCkpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXFwnbGVuZ3RoXFwnIGlzIG91dCBvZiBib3VuZHMnKVxuICB9XG5cbiAgaWYgKGJ5dGVPZmZzZXQgPT09IHVuZGVmaW5lZCAmJiBsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXkpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBhcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0KVxuICB9IGVsc2Uge1xuICAgIGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlLCBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIHRoYXQgPSBhcnJheVxuICAgIHRoYXQuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gYW4gb2JqZWN0IGluc3RhbmNlIG9mIHRoZSBCdWZmZXIgY2xhc3NcbiAgICB0aGF0ID0gZnJvbUFycmF5TGlrZSh0aGF0LCBhcnJheSlcbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tT2JqZWN0ICh0aGF0LCBvYmopIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihvYmopKSB7XG4gICAgdmFyIGxlbiA9IGNoZWNrZWQob2JqLmxlbmd0aCkgfCAwXG4gICAgdGhhdCA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBsZW4pXG5cbiAgICBpZiAodGhhdC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGF0XG4gICAgfVxuXG4gICAgb2JqLmNvcHkodGhhdCwgMCwgMCwgbGVuKVxuICAgIHJldHVybiB0aGF0XG4gIH1cblxuICBpZiAob2JqKSB7XG4gICAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgIG9iai5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikgfHwgJ2xlbmd0aCcgaW4gb2JqKSB7XG4gICAgICBpZiAodHlwZW9mIG9iai5sZW5ndGggIT09ICdudW1iZXInIHx8IGlzbmFuKG9iai5sZW5ndGgpKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVCdWZmZXIodGhhdCwgMClcbiAgICAgIH1cbiAgICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKHRoYXQsIG9iailcbiAgICB9XG5cbiAgICBpZiAob2JqLnR5cGUgPT09ICdCdWZmZXInICYmIGlzQXJyYXkob2JqLmRhdGEpKSB7XG4gICAgICByZXR1cm4gZnJvbUFycmF5TGlrZSh0aGF0LCBvYmouZGF0YSlcbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgb3IgYXJyYXktbGlrZSBvYmplY3QuJylcbn1cblxuZnVuY3Rpb24gY2hlY2tlZCAobGVuZ3RoKSB7XG4gIC8vIE5vdGU6IGNhbm5vdCB1c2UgYGxlbmd0aCA8IGtNYXhMZW5ndGgoKWAgaGVyZSBiZWNhdXNlIHRoYXQgZmFpbHMgd2hlblxuICAvLyBsZW5ndGggaXMgTmFOICh3aGljaCBpcyBvdGhlcndpc2UgY29lcmNlZCB0byB6ZXJvLilcbiAgaWYgKGxlbmd0aCA+PSBrTWF4TGVuZ3RoKCkpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byBhbGxvY2F0ZSBCdWZmZXIgbGFyZ2VyIHRoYW4gbWF4aW11bSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnc2l6ZTogMHgnICsga01heExlbmd0aCgpLnRvU3RyaW5nKDE2KSArICcgYnl0ZXMnKVxuICB9XG4gIHJldHVybiBsZW5ndGggfCAwXG59XG5cbmZ1bmN0aW9uIFNsb3dCdWZmZXIgKGxlbmd0aCkge1xuICBpZiAoK2xlbmd0aCAhPSBsZW5ndGgpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcbiAgICBsZW5ndGggPSAwXG4gIH1cbiAgcmV0dXJuIEJ1ZmZlci5hbGxvYygrbGVuZ3RoKVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiBpc0J1ZmZlciAoYikge1xuICByZXR1cm4gISEoYiAhPSBudWxsICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKGEsIGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkgfHwgIUJ1ZmZlci5pc0J1ZmZlcihiKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyBtdXN0IGJlIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGEgPT09IGIpIHJldHVybiAwXG5cbiAgdmFyIHggPSBhLmxlbmd0aFxuICB2YXIgeSA9IGIubGVuZ3RoXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xuICAgICAgeCA9IGFbaV1cbiAgICAgIHkgPSBiW2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiBpc0VuY29kaW5nIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdsYXRpbjEnOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIGNvbmNhdCAobGlzdCwgbGVuZ3RoKSB7XG4gIGlmICghaXNBcnJheShsaXN0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gIH1cblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gQnVmZmVyLmFsbG9jKDApXG4gIH1cblxuICB2YXIgaVxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBsZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgIGxlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUobGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBidWYgPSBsaXN0W2ldXG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgICB9XG4gICAgYnVmLmNvcHkoYnVmZmVyLCBwb3MpXG4gICAgcG9zICs9IGJ1Zi5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmZmVyXG59XG5cbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdHJpbmcpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5sZW5ndGhcbiAgfVxuICBpZiAodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgQXJyYXlCdWZmZXIuaXNWaWV3ID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAoQXJyYXlCdWZmZXIuaXNWaWV3KHN0cmluZykgfHwgc3RyaW5nIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5ieXRlTGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmdcbiAgfVxuXG4gIHZhciBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChsZW4gPT09IDApIHJldHVybiAwXG5cbiAgLy8gVXNlIGEgZm9yIGxvb3AgdG8gYXZvaWQgcmVjdXJzaW9uXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxlblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gbGVuICogMlxuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGxlbiA+Pj4gMVxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoIC8vIGFzc3VtZSB1dGY4XG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcblxuZnVuY3Rpb24gc2xvd1RvU3RyaW5nIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuXG4gIC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoYXQgXCJ0aGlzLmxlbmd0aCA8PSBNQVhfVUlOVDMyXCIgc2luY2UgaXQncyBhIHJlYWQtb25seVxuICAvLyBwcm9wZXJ0eSBvZiBhIHR5cGVkIGFycmF5LlxuXG4gIC8vIFRoaXMgYmVoYXZlcyBuZWl0aGVyIGxpa2UgU3RyaW5nIG5vciBVaW50OEFycmF5IGluIHRoYXQgd2Ugc2V0IHN0YXJ0L2VuZFxuICAvLyB0byB0aGVpciB1cHBlci9sb3dlciBib3VuZHMgaWYgdGhlIHZhbHVlIHBhc3NlZCBpcyBvdXQgb2YgcmFuZ2UuXG4gIC8vIHVuZGVmaW5lZCBpcyBoYW5kbGVkIHNwZWNpYWxseSBhcyBwZXIgRUNNQS0yNjIgNnRoIEVkaXRpb24sXG4gIC8vIFNlY3Rpb24gMTMuMy4zLjcgUnVudGltZSBTZW1hbnRpY3M6IEtleWVkQmluZGluZ0luaXRpYWxpemF0aW9uLlxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCB8fCBzdGFydCA8IDApIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICAvLyBSZXR1cm4gZWFybHkgaWYgc3RhcnQgPiB0aGlzLmxlbmd0aC4gRG9uZSBoZXJlIHRvIHByZXZlbnQgcG90ZW50aWFsIHVpbnQzMlxuICAvLyBjb2VyY2lvbiBmYWlsIGJlbG93LlxuICBpZiAoc3RhcnQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChlbmQgPD0gMCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgLy8gRm9yY2UgY29lcnNpb24gdG8gdWludDMyLiBUaGlzIHdpbGwgYWxzbyBjb2VyY2UgZmFsc2V5L05hTiB2YWx1ZXMgdG8gMC5cbiAgZW5kID4+Pj0gMFxuICBzdGFydCA+Pj49IDBcblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHV0ZjE2bGVTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoZW5jb2RpbmcgKyAnJykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuLy8gVGhlIHByb3BlcnR5IGlzIHVzZWQgYnkgYEJ1ZmZlci5pc0J1ZmZlcmAgYW5kIGBpcy1idWZmZXJgIChpbiBTYWZhcmkgNS03KSB0byBkZXRlY3Rcbi8vIEJ1ZmZlciBpbnN0YW5jZXMuXG5CdWZmZXIucHJvdG90eXBlLl9pc0J1ZmZlciA9IHRydWVcblxuZnVuY3Rpb24gc3dhcCAoYiwgbiwgbSkge1xuICB2YXIgaSA9IGJbbl1cbiAgYltuXSA9IGJbbV1cbiAgYlttXSA9IGlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMTYgPSBmdW5jdGlvbiBzd2FwMTYgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDIgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDE2LWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDIpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAxKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDMyID0gZnVuY3Rpb24gc3dhcDMyICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA0ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAzMi1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgMylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgMilcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXA2NCA9IGZ1bmN0aW9uIHN3YXA2NCAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgOCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNjQtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gOCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDcpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDYpXG4gICAgc3dhcCh0aGlzLCBpICsgMiwgaSArIDUpXG4gICAgc3dhcCh0aGlzLCBpICsgMywgaSArIDQpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoIHwgMFxuICBpZiAobGVuZ3RoID09PSAwKSByZXR1cm4gJydcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHJldHVybiB1dGY4U2xpY2UodGhpcywgMCwgbGVuZ3RoKVxuICByZXR1cm4gc2xvd1RvU3RyaW5nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiBlcXVhbHMgKGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXInKVxuICBpZiAodGhpcyA9PT0gYikgcmV0dXJuIHRydWVcbiAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHRoaXMsIGIpID09PSAwXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uIGluc3BlY3QgKCkge1xuICB2YXIgc3RyID0gJydcbiAgdmFyIG1heCA9IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVNcbiAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgIHN0ciA9IHRoaXMudG9TdHJpbmcoJ2hleCcsIDAsIG1heCkubWF0Y2goLy57Mn0vZykuam9pbignICcpXG4gICAgaWYgKHRoaXMubGVuZ3RoID4gbWF4KSBzdHIgKz0gJyAuLi4gJ1xuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgc3RyICsgJz4nXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKHRhcmdldCwgc3RhcnQsIGVuZCwgdGhpc1N0YXJ0LCB0aGlzRW5kKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKHRhcmdldCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgfVxuXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5kID0gdGFyZ2V0ID8gdGFyZ2V0Lmxlbmd0aCA6IDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzU3RhcnQgPSAwXG4gIH1cbiAgaWYgKHRoaXNFbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNFbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKHN0YXJ0IDwgMCB8fCBlbmQgPiB0YXJnZXQubGVuZ3RoIHx8IHRoaXNTdGFydCA8IDAgfHwgdGhpc0VuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ291dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQgJiYgc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQpIHtcbiAgICByZXR1cm4gLTFcbiAgfVxuICBpZiAoc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuXG4gIHN0YXJ0ID4+Pj0gMFxuICBlbmQgPj4+PSAwXG4gIHRoaXNTdGFydCA+Pj49IDBcbiAgdGhpc0VuZCA+Pj49IDBcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0KSByZXR1cm4gMFxuXG4gIHZhciB4ID0gdGhpc0VuZCAtIHRoaXNTdGFydFxuICB2YXIgeSA9IGVuZCAtIHN0YXJ0XG4gIHZhciBsZW4gPSBNYXRoLm1pbih4LCB5KVxuXG4gIHZhciB0aGlzQ29weSA9IHRoaXMuc2xpY2UodGhpc1N0YXJ0LCB0aGlzRW5kKVxuICB2YXIgdGFyZ2V0Q29weSA9IHRhcmdldC5zbGljZShzdGFydCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAodGhpc0NvcHlbaV0gIT09IHRhcmdldENvcHlbaV0pIHtcbiAgICAgIHggPSB0aGlzQ29weVtpXVxuICAgICAgeSA9IHRhcmdldENvcHlbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG4vLyBGaW5kcyBlaXRoZXIgdGhlIGZpcnN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA+PSBgYnl0ZU9mZnNldGAsXG4vLyBPUiB0aGUgbGFzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPD0gYGJ5dGVPZmZzZXRgLlxuLy9cbi8vIEFyZ3VtZW50czpcbi8vIC0gYnVmZmVyIC0gYSBCdWZmZXIgdG8gc2VhcmNoXG4vLyAtIHZhbCAtIGEgc3RyaW5nLCBCdWZmZXIsIG9yIG51bWJlclxuLy8gLSBieXRlT2Zmc2V0IC0gYW4gaW5kZXggaW50byBgYnVmZmVyYDsgd2lsbCBiZSBjbGFtcGVkIHRvIGFuIGludDMyXG4vLyAtIGVuY29kaW5nIC0gYW4gb3B0aW9uYWwgZW5jb2RpbmcsIHJlbGV2YW50IGlzIHZhbCBpcyBhIHN0cmluZ1xuLy8gLSBkaXIgLSB0cnVlIGZvciBpbmRleE9mLCBmYWxzZSBmb3IgbGFzdEluZGV4T2ZcbmZ1bmN0aW9uIGJpZGlyZWN0aW9uYWxJbmRleE9mIChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICAvLyBFbXB0eSBidWZmZXIgbWVhbnMgbm8gbWF0Y2hcbiAgaWYgKGJ1ZmZlci5sZW5ndGggPT09IDApIHJldHVybiAtMVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0XG4gIGlmICh0eXBlb2YgYnl0ZU9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IGJ5dGVPZmZzZXRcbiAgICBieXRlT2Zmc2V0ID0gMFxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPiAweDdmZmZmZmZmKSB7XG4gICAgYnl0ZU9mZnNldCA9IDB4N2ZmZmZmZmZcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgLTB4ODAwMDAwMDApIHtcbiAgICBieXRlT2Zmc2V0ID0gLTB4ODAwMDAwMDBcbiAgfVxuICBieXRlT2Zmc2V0ID0gK2J5dGVPZmZzZXQgIC8vIENvZXJjZSB0byBOdW1iZXIuXG4gIGlmIChpc05hTihieXRlT2Zmc2V0KSkge1xuICAgIC8vIGJ5dGVPZmZzZXQ6IGl0IGl0J3MgdW5kZWZpbmVkLCBudWxsLCBOYU4sIFwiZm9vXCIsIGV0Yywgc2VhcmNoIHdob2xlIGJ1ZmZlclxuICAgIGJ5dGVPZmZzZXQgPSBkaXIgPyAwIDogKGJ1ZmZlci5sZW5ndGggLSAxKVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXQ6IG5lZ2F0aXZlIG9mZnNldHMgc3RhcnQgZnJvbSB0aGUgZW5kIG9mIHRoZSBidWZmZXJcbiAgaWYgKGJ5dGVPZmZzZXQgPCAwKSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCArIGJ5dGVPZmZzZXRcbiAgaWYgKGJ5dGVPZmZzZXQgPj0gYnVmZmVyLmxlbmd0aCkge1xuICAgIGlmIChkaXIpIHJldHVybiAtMVxuICAgIGVsc2UgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggLSAxXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IDApIHtcbiAgICBpZiAoZGlyKSBieXRlT2Zmc2V0ID0gMFxuICAgIGVsc2UgcmV0dXJuIC0xXG4gIH1cblxuICAvLyBOb3JtYWxpemUgdmFsXG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIHZhbCA9IEJ1ZmZlci5mcm9tKHZhbCwgZW5jb2RpbmcpXG4gIH1cblxuICAvLyBGaW5hbGx5LCBzZWFyY2ggZWl0aGVyIGluZGV4T2YgKGlmIGRpciBpcyB0cnVlKSBvciBsYXN0SW5kZXhPZlxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHZhbCkpIHtcbiAgICAvLyBTcGVjaWFsIGNhc2U6IGxvb2tpbmcgZm9yIGVtcHR5IHN0cmluZy9idWZmZXIgYWx3YXlzIGZhaWxzXG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMHhGRiAvLyBTZWFyY2ggZm9yIGEgYnl0ZSB2YWx1ZSBbMC0yNTVdXG4gICAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmXG4gICAgICAgIHR5cGVvZiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoZGlyKSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIFsgdmFsIF0sIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2YWwgbXVzdCBiZSBzdHJpbmcsIG51bWJlciBvciBCdWZmZXInKVxufVxuXG5mdW5jdGlvbiBhcnJheUluZGV4T2YgKGFyciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIHZhciBpbmRleFNpemUgPSAxXG4gIHZhciBhcnJMZW5ndGggPSBhcnIubGVuZ3RoXG4gIHZhciB2YWxMZW5ndGggPSB2YWwubGVuZ3RoXG5cbiAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgIGlmIChlbmNvZGluZyA9PT0gJ3VjczInIHx8IGVuY29kaW5nID09PSAndWNzLTInIHx8XG4gICAgICAgIGVuY29kaW5nID09PSAndXRmMTZsZScgfHwgZW5jb2RpbmcgPT09ICd1dGYtMTZsZScpIHtcbiAgICAgIGlmIChhcnIubGVuZ3RoIDwgMiB8fCB2YWwubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH1cbiAgICAgIGluZGV4U2l6ZSA9IDJcbiAgICAgIGFyckxlbmd0aCAvPSAyXG4gICAgICB2YWxMZW5ndGggLz0gMlxuICAgICAgYnl0ZU9mZnNldCAvPSAyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZCAoYnVmLCBpKSB7XG4gICAgaWYgKGluZGV4U2l6ZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIGJ1ZltpXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYnVmLnJlYWRVSW50MTZCRShpICogaW5kZXhTaXplKVxuICAgIH1cbiAgfVxuXG4gIHZhciBpXG4gIGlmIChkaXIpIHtcbiAgICB2YXIgZm91bmRJbmRleCA9IC0xXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA8IGFyckxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmVhZChhcnIsIGkpID09PSByZWFkKHZhbCwgZm91bmRJbmRleCA9PT0gLTEgPyAwIDogaSAtIGZvdW5kSW5kZXgpKSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkgZm91bmRJbmRleCA9IGlcbiAgICAgICAgaWYgKGkgLSBmb3VuZEluZGV4ICsgMSA9PT0gdmFsTGVuZ3RoKSByZXR1cm4gZm91bmRJbmRleCAqIGluZGV4U2l6ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggIT09IC0xKSBpIC09IGkgLSBmb3VuZEluZGV4XG4gICAgICAgIGZvdW5kSW5kZXggPSAtMVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYnl0ZU9mZnNldCArIHZhbExlbmd0aCA+IGFyckxlbmd0aCkgYnl0ZU9mZnNldCA9IGFyckxlbmd0aCAtIHZhbExlbmd0aFxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgZm91bmQgPSB0cnVlXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZhbExlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmIChyZWFkKGFyciwgaSArIGopICE9PSByZWFkKHZhbCwgaikpIHtcbiAgICAgICAgICBmb3VuZCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kKSByZXR1cm4gaVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXMgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIHRoaXMuaW5kZXhPZih2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSAhPT0gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gaW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgdHJ1ZSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uIGxhc3RJbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBpZiAoc3RyTGVuICUgMiAhPT0gMCkgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHBhcnNlZCA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBpZiAoaXNOYU4ocGFyc2VkKSkgcmV0dXJuIGlcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBwYXJzZWRcbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiB1dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBhc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGxhdGluMVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGFzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBiYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gdWNzMldyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nKVxuICBpZiAob2Zmc2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygb2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIG9mZnNldFssIGxlbmd0aF1bLCBlbmNvZGluZ10pXG4gIH0gZWxzZSBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgICBpZiAoaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgbGVuZ3RoID0gbGVuZ3RoIHwgMFxuICAgICAgaWYgKGVuY29kaW5nID09PSB1bmRlZmluZWQpIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgfSBlbHNlIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIC8vIGxlZ2FjeSB3cml0ZShzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aCkgLSByZW1vdmUgaW4gdjAuMTNcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnQnVmZmVyLndyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldFssIGxlbmd0aF0pIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQnXG4gICAgKVxuICB9XG5cbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCB8fCBsZW5ndGggPiByZW1haW5pbmcpIGxlbmd0aCA9IHJlbWFpbmluZ1xuXG4gIGlmICgoc3RyaW5nLmxlbmd0aCA+IDAgJiYgKGxlbmd0aCA8IDAgfHwgb2Zmc2V0IDwgMCkpIHx8IG9mZnNldCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gd3JpdGUgb3V0c2lkZSBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgLy8gV2FybmluZzogbWF4TGVuZ3RoIG5vdCB0YWtlbiBpbnRvIGFjY291bnQgaW4gYmFzZTY0V3JpdGVcbiAgICAgICAgcmV0dXJuIGJhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1Y3MyV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gdG9KU09OICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG5mdW5jdGlvbiBiYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuICB2YXIgcmVzID0gW11cblxuICB2YXIgaSA9IHN0YXJ0XG4gIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgdmFyIGZpcnN0Qnl0ZSA9IGJ1ZltpXVxuICAgIHZhciBjb2RlUG9pbnQgPSBudWxsXG4gICAgdmFyIGJ5dGVzUGVyU2VxdWVuY2UgPSAoZmlyc3RCeXRlID4gMHhFRikgPyA0XG4gICAgICA6IChmaXJzdEJ5dGUgPiAweERGKSA/IDNcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4QkYpID8gMlxuICAgICAgOiAxXG5cbiAgICBpZiAoaSArIGJ5dGVzUGVyU2VxdWVuY2UgPD0gZW5kKSB7XG4gICAgICB2YXIgc2Vjb25kQnl0ZSwgdGhpcmRCeXRlLCBmb3VydGhCeXRlLCB0ZW1wQ29kZVBvaW50XG5cbiAgICAgIHN3aXRjaCAoYnl0ZXNQZXJTZXF1ZW5jZSkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgaWYgKGZpcnN0Qnl0ZSA8IDB4ODApIHtcbiAgICAgICAgICAgIGNvZGVQb2ludCA9IGZpcnN0Qnl0ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweDFGKSA8PCAweDYgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0YpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHhDIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAodGhpcmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3RkYgJiYgKHRlbXBDb2RlUG9pbnQgPCAweEQ4MDAgfHwgdGVtcENvZGVQb2ludCA+IDB4REZGRikpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgZm91cnRoQnl0ZSA9IGJ1ZltpICsgM11cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKGZvdXJ0aEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4MTIgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4QyB8ICh0aGlyZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAoZm91cnRoQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4RkZGRiAmJiB0ZW1wQ29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29kZVBvaW50ID09PSBudWxsKSB7XG4gICAgICAvLyB3ZSBkaWQgbm90IGdlbmVyYXRlIGEgdmFsaWQgY29kZVBvaW50IHNvIGluc2VydCBhXG4gICAgICAvLyByZXBsYWNlbWVudCBjaGFyIChVK0ZGRkQpIGFuZCBhZHZhbmNlIG9ubHkgMSBieXRlXG4gICAgICBjb2RlUG9pbnQgPSAweEZGRkRcbiAgICAgIGJ5dGVzUGVyU2VxdWVuY2UgPSAxXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPiAweEZGRkYpIHtcbiAgICAgIC8vIGVuY29kZSB0byB1dGYxNiAoc3Vycm9nYXRlIHBhaXIgZGFuY2UpXG4gICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMFxuICAgICAgcmVzLnB1c2goY29kZVBvaW50ID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKVxuICAgICAgY29kZVBvaW50ID0gMHhEQzAwIHwgY29kZVBvaW50ICYgMHgzRkZcbiAgICB9XG5cbiAgICByZXMucHVzaChjb2RlUG9pbnQpXG4gICAgaSArPSBieXRlc1BlclNlcXVlbmNlXG4gIH1cblxuICByZXR1cm4gZGVjb2RlQ29kZVBvaW50c0FycmF5KHJlcylcbn1cblxuLy8gQmFzZWQgb24gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjI3NDcyNzIvNjgwNzQyLCB0aGUgYnJvd3NlciB3aXRoXG4vLyB0aGUgbG93ZXN0IGxpbWl0IGlzIENocm9tZSwgd2l0aCAweDEwMDAwIGFyZ3MuXG4vLyBXZSBnbyAxIG1hZ25pdHVkZSBsZXNzLCBmb3Igc2FmZXR5XG52YXIgTUFYX0FSR1VNRU5UU19MRU5HVEggPSAweDEwMDBcblxuZnVuY3Rpb24gZGVjb2RlQ29kZVBvaW50c0FycmF5IChjb2RlUG9pbnRzKSB7XG4gIHZhciBsZW4gPSBjb2RlUG9pbnRzLmxlbmd0aFxuICBpZiAobGVuIDw9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBjb2RlUG9pbnRzKSAvLyBhdm9pZCBleHRyYSBzbGljZSgpXG4gIH1cblxuICAvLyBEZWNvZGUgaW4gY2h1bmtzIHRvIGF2b2lkIFwiY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkXCIuXG4gIHZhciByZXMgPSAnJ1xuICB2YXIgaSA9IDBcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShcbiAgICAgIFN0cmluZyxcbiAgICAgIGNvZGVQb2ludHMuc2xpY2UoaSwgaSArPSBNQVhfQVJHVU1FTlRTX0xFTkdUSClcbiAgICApXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSAmIDB4N0YpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBsYXRpbjFTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBoZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSArIDFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIHNsaWNlIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IH5+c3RhcnRcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW4gOiB+fmVuZFxuXG4gIGlmIChzdGFydCA8IDApIHtcbiAgICBzdGFydCArPSBsZW5cbiAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgfSBlbHNlIGlmIChzdGFydCA+IGxlbikge1xuICAgIHN0YXJ0ID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgMCkge1xuICAgIGVuZCArPSBsZW5cbiAgICBpZiAoZW5kIDwgMCkgZW5kID0gMFxuICB9IGVsc2UgaWYgKGVuZCA+IGxlbikge1xuICAgIGVuZCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIHZhciBuZXdCdWZcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgbmV3QnVmID0gdGhpcy5zdWJhcnJheShzdGFydCwgZW5kKVxuICAgIG5ld0J1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgKytpKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3QnVmXG59XG5cbi8qXG4gKiBOZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGJ1ZmZlciBpc24ndCB0cnlpbmcgdG8gd3JpdGUgb3V0IG9mIGJvdW5kcy5cbiAqL1xuZnVuY3Rpb24gY2hlY2tPZmZzZXQgKG9mZnNldCwgZXh0LCBsZW5ndGgpIHtcbiAgaWYgKChvZmZzZXQgJSAxKSAhPT0gMCB8fCBvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb2Zmc2V0IGlzIG5vdCB1aW50JylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RyeWluZyB0byBhY2Nlc3MgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50TEUgPSBmdW5jdGlvbiByZWFkVUludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50QkUgPSBmdW5jdGlvbiByZWFkVUludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuICB9XG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXVxuICB2YXIgbXVsID0gMVxuICB3aGlsZSAoYnl0ZUxlbmd0aCA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gcmVhZFVJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiByZWFkVUludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDgpIHwgdGhpc1tvZmZzZXQgKyAxXVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiByZWFkVUludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSAqIDB4MTAwMDAwMCkgK1xuICAgICgodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICB0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRMRSA9IGZ1bmN0aW9uIHJlYWRJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRCRSA9IGZ1bmN0aW9uIHJlYWRJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aFxuICB2YXIgbXVsID0gMVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWldXG4gIHdoaWxlIChpID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0taV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gcmVhZEludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgaWYgKCEodGhpc1tvZmZzZXRdICYgMHg4MCkpIHJldHVybiAodGhpc1tvZmZzZXRdKVxuICByZXR1cm4gKCgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiByZWFkSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAxXSB8ICh0aGlzW29mZnNldF0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gcmVhZEludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDNdIDw8IDI0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gcmVhZEludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCAyNCkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gcmVhZEZsb2F0TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gcmVhZEZsb2F0QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiByZWFkRG91YmxlTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDUyLCA4KVxufVxuXG5mdW5jdGlvbiBjaGVja0ludCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiYnVmZmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlciBpbnN0YW5jZScpXG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBpcyBvdXQgb2YgYm91bmRzJylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludExFID0gZnVuY3Rpb24gd3JpdGVVSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludEJFID0gZnVuY3Rpb24gd3JpdGVVSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiB3cml0ZVVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4ZmYsIDApXG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHZhbHVlID0gTWF0aC5mbG9vcih2YWx1ZSlcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuZnVuY3Rpb24gb2JqZWN0V3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmICsgdmFsdWUgKyAxXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIG9mZnNldCwgMik7IGkgPCBqOyArK2kpIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuZnVuY3Rpb24gb2JqZWN0V3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGJ1Zi5sZW5ndGggLSBvZmZzZXQsIDQpOyBpIDwgajsgKytpKSB7XG4gICAgYnVmW29mZnNldCArIGldID0gKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludExFID0gZnVuY3Rpb24gd3JpdGVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGggLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IDBcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpIC0gMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludEJFID0gZnVuY3Rpb24gd3JpdGVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGggLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpICsgMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiB3cml0ZUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHg3ZiwgLTB4ODApXG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHZhbHVlID0gTWF0aC5mbG9vcih2YWx1ZSlcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDFcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbmZ1bmN0aW9uIGNoZWNrSUVFRTc1NCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbiAgaWYgKG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDQsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gd3JpdGVGbG9hdEJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDgsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG4gIHJldHVybiBvZmZzZXQgKyA4XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gY29weSAodGFyZ2V0LCB0YXJnZXRTdGFydCwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0U3RhcnQgPj0gdGFyZ2V0Lmxlbmd0aCkgdGFyZ2V0U3RhcnQgPSB0YXJnZXQubGVuZ3RoXG4gIGlmICghdGFyZ2V0U3RhcnQpIHRhcmdldFN0YXJ0ID0gMFxuICBpZiAoZW5kID4gMCAmJiBlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVybiAwXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgaWYgKHRhcmdldFN0YXJ0IDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgfVxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChlbmQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCA8IGVuZCAtIHN0YXJ0KSB7XG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0ICsgc3RhcnRcbiAgfVxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuICB2YXIgaVxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQgJiYgc3RhcnQgPCB0YXJnZXRTdGFydCAmJiB0YXJnZXRTdGFydCA8IGVuZCkge1xuICAgIC8vIGRlc2NlbmRpbmcgY29weSBmcm9tIGVuZFxuICAgIGZvciAoaSA9IGxlbiAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIGlmIChsZW4gPCAxMDAwIHx8ICFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIC8vIGFzY2VuZGluZyBjb3B5IGZyb20gc3RhcnRcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIFVpbnQ4QXJyYXkucHJvdG90eXBlLnNldC5jYWxsKFxuICAgICAgdGFyZ2V0LFxuICAgICAgdGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLFxuICAgICAgdGFyZ2V0U3RhcnRcbiAgICApXG4gIH1cblxuICByZXR1cm4gbGVuXG59XG5cbi8vIFVzYWdlOlxuLy8gICAgYnVmZmVyLmZpbGwobnVtYmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChidWZmZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKHN0cmluZ1ssIG9mZnNldFssIGVuZF1dWywgZW5jb2RpbmddKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gZmlsbCAodmFsLCBzdGFydCwgZW5kLCBlbmNvZGluZykge1xuICAvLyBIYW5kbGUgc3RyaW5nIGNhc2VzOlxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAodHlwZW9mIHN0YXJ0ID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBzdGFydFxuICAgICAgc3RhcnQgPSAwXG4gICAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVuZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gZW5kXG4gICAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICAgIH1cbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdmFyIGNvZGUgPSB2YWwuY2hhckNvZGVBdCgwKVxuICAgICAgaWYgKGNvZGUgPCAyNTYpIHtcbiAgICAgICAgdmFsID0gY29kZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZW5jb2RpbmcgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZW5jb2RpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdlbmNvZGluZyBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBlbmNvZGluZyA9PT0gJ3N0cmluZycgJiYgIUJ1ZmZlci5pc0VuY29kaW5nKGVuY29kaW5nKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDI1NVxuICB9XG5cbiAgLy8gSW52YWxpZCByYW5nZXMgYXJlIG5vdCBzZXQgdG8gYSBkZWZhdWx0LCBzbyBjYW4gcmFuZ2UgY2hlY2sgZWFybHkuXG4gIGlmIChzdGFydCA8IDAgfHwgdGhpcy5sZW5ndGggPCBzdGFydCB8fCB0aGlzLmxlbmd0aCA8IGVuZCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdPdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gdGhpcy5sZW5ndGggOiBlbmQgPj4+IDBcblxuICBpZiAoIXZhbCkgdmFsID0gMFxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICAgIHRoaXNbaV0gPSB2YWxcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIGJ5dGVzID0gQnVmZmVyLmlzQnVmZmVyKHZhbClcbiAgICAgID8gdmFsXG4gICAgICA6IHV0ZjhUb0J5dGVzKG5ldyBCdWZmZXIodmFsLCBlbmNvZGluZykudG9TdHJpbmcoKSlcbiAgICB2YXIgbGVuID0gYnl0ZXMubGVuZ3RoXG4gICAgZm9yIChpID0gMDsgaSA8IGVuZCAtIHN0YXJ0OyArK2kpIHtcbiAgICAgIHRoaXNbaSArIHN0YXJ0XSA9IGJ5dGVzW2kgJSBsZW5dXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG52YXIgSU5WQUxJRF9CQVNFNjRfUkUgPSAvW14rXFwvMC05QS1aYS16LV9dL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHN0cmlwcyBvdXQgaW52YWxpZCBjaGFyYWN0ZXJzIGxpa2UgXFxuIGFuZCBcXHQgZnJvbSB0aGUgc3RyaW5nLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgc3RyID0gc3RyaW5ndHJpbShzdHIpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGNvbnZlcnRzIHN0cmluZ3Mgd2l0aCBsZW5ndGggPCAyIHRvICcnXG4gIGlmIChzdHIubGVuZ3RoIDwgMikgcmV0dXJuICcnXG4gIC8vIE5vZGUgYWxsb3dzIGZvciBub24tcGFkZGVkIGJhc2U2NCBzdHJpbmdzIChtaXNzaW5nIHRyYWlsaW5nID09PSksIGJhc2U2NC1qcyBkb2VzIG5vdFxuICB3aGlsZSAoc3RyLmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICBzdHIgPSBzdHIgKyAnPSdcbiAgfVxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cmluZywgdW5pdHMpIHtcbiAgdW5pdHMgPSB1bml0cyB8fCBJbmZpbml0eVxuICB2YXIgY29kZVBvaW50XG4gIHZhciBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG4gIHZhciBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICB2YXIgYnl0ZXMgPSBbXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBjb2RlUG9pbnQgPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuXG4gICAgLy8gaXMgc3Vycm9nYXRlIGNvbXBvbmVudFxuICAgIGlmIChjb2RlUG9pbnQgPiAweEQ3RkYgJiYgY29kZVBvaW50IDwgMHhFMDAwKSB7XG4gICAgICAvLyBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCFsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAgIC8vIG5vIGxlYWQgeWV0XG4gICAgICAgIGlmIChjb2RlUG9pbnQgPiAweERCRkYpIHtcbiAgICAgICAgICAvLyB1bmV4cGVjdGVkIHRyYWlsXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfSBlbHNlIGlmIChpICsgMSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgLy8gdW5wYWlyZWQgbGVhZFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyB2YWxpZCBsZWFkXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyAyIGxlYWRzIGluIGEgcm93XG4gICAgICBpZiAoY29kZVBvaW50IDwgMHhEQzAwKSB7XG4gICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIHZhbGlkIHN1cnJvZ2F0ZSBwYWlyXG4gICAgICBjb2RlUG9pbnQgPSAobGVhZFN1cnJvZ2F0ZSAtIDB4RDgwMCA8PCAxMCB8IGNvZGVQb2ludCAtIDB4REMwMCkgKyAweDEwMDAwXG4gICAgfSBlbHNlIGlmIChsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAvLyB2YWxpZCBibXAgY2hhciwgYnV0IGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICB9XG5cbiAgICBsZWFkU3Vycm9nYXRlID0gbnVsbFxuXG4gICAgLy8gZW5jb2RlIHV0ZjhcbiAgICBpZiAoY29kZVBvaW50IDwgMHg4MCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAxKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKGNvZGVQb2ludClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4ODAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgfCAweEMwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAzKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDIHwgMHhFMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gNCkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4MTIgfCAweEYwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBieXRlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyLCB1bml0cykge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuXG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoYmFzZTY0Y2xlYW4oc3RyKSlcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gaXNuYW4gKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSB2YWwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9idWZmZXIvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDIzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0J1xuXG5leHBvcnRzLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5leHBvcnRzLnRvQnl0ZUFycmF5ID0gdG9CeXRlQXJyYXlcbmV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IGZyb21CeXRlQXJyYXlcblxudmFyIGxvb2t1cCA9IFtdXG52YXIgcmV2TG9va3VwID0gW11cbnZhciBBcnIgPSB0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcgPyBVaW50OEFycmF5IDogQXJyYXlcblxudmFyIGNvZGUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLydcbmZvciAodmFyIGkgPSAwLCBsZW4gPSBjb2RlLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gIGxvb2t1cFtpXSA9IGNvZGVbaV1cbiAgcmV2TG9va3VwW2NvZGUuY2hhckNvZGVBdChpKV0gPSBpXG59XG5cbnJldkxvb2t1cFsnLScuY2hhckNvZGVBdCgwKV0gPSA2MlxucmV2TG9va3VwWydfJy5jaGFyQ29kZUF0KDApXSA9IDYzXG5cbmZ1bmN0aW9uIHBsYWNlSG9sZGVyc0NvdW50IChiNjQpIHtcbiAgdmFyIGxlbiA9IGI2NC5sZW5ndGhcbiAgaWYgKGxlbiAlIDQgPiAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0JylcbiAgfVxuXG4gIC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG4gIC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcbiAgLy8gcmVwcmVzZW50IG9uZSBieXRlXG4gIC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuICAvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG4gIHJldHVybiBiNjRbbGVuIC0gMl0gPT09ICc9JyA/IDIgOiBiNjRbbGVuIC0gMV0gPT09ICc9JyA/IDEgOiAwXG59XG5cbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKGI2NCkge1xuICAvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcbiAgcmV0dXJuIGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVyc0NvdW50KGI2NClcbn1cblxuZnVuY3Rpb24gdG9CeXRlQXJyYXkgKGI2NCkge1xuICB2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxuICB2YXIgbGVuID0gYjY0Lmxlbmd0aFxuICBwbGFjZUhvbGRlcnMgPSBwbGFjZUhvbGRlcnNDb3VudChiNjQpXG5cbiAgYXJyID0gbmV3IEFycihsZW4gKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuICAvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG4gIGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gbGVuIC0gNCA6IGxlblxuXG4gIHZhciBMID0gMFxuXG4gIGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxOCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgMTIpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildIDw8IDYpIHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAzKV1cbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gMTYpICYgMHhGRlxuICAgIGFycltMKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAyKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA+PiA0KVxuICAgIGFycltMKytdID0gdG1wICYgMHhGRlxuICB9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuICAgIHRtcCA9IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDEwKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA8PCA0KSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA+PiAyKVxuICAgIGFycltMKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBhcnJcbn1cblxuZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcbiAgcmV0dXJuIGxvb2t1cFtudW0gPj4gMTggJiAweDNGXSArIGxvb2t1cFtudW0gPj4gMTIgJiAweDNGXSArIGxvb2t1cFtudW0gPj4gNiAmIDB4M0ZdICsgbG9va3VwW251bSAmIDB4M0ZdXG59XG5cbmZ1bmN0aW9uIGVuY29kZUNodW5rICh1aW50OCwgc3RhcnQsIGVuZCkge1xuICB2YXIgdG1wXG4gIHZhciBvdXRwdXQgPSBbXVxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkgKz0gMykge1xuICAgIHRtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcbiAgICBvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSlcbiAgfVxuICByZXR1cm4gb3V0cHV0LmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGZyb21CeXRlQXJyYXkgKHVpbnQ4KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbiA9IHVpbnQ4Lmxlbmd0aFxuICB2YXIgZXh0cmFCeXRlcyA9IGxlbiAlIDMgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcbiAgdmFyIG91dHB1dCA9ICcnXG4gIHZhciBwYXJ0cyA9IFtdXG4gIHZhciBtYXhDaHVua0xlbmd0aCA9IDE2MzgzIC8vIG11c3QgYmUgbXVsdGlwbGUgb2YgM1xuXG4gIC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcbiAgZm9yICh2YXIgaSA9IDAsIGxlbjIgPSBsZW4gLSBleHRyYUJ5dGVzOyBpIDwgbGVuMjsgaSArPSBtYXhDaHVua0xlbmd0aCkge1xuICAgIHBhcnRzLnB1c2goZW5jb2RlQ2h1bmsodWludDgsIGksIChpICsgbWF4Q2h1bmtMZW5ndGgpID4gbGVuMiA/IGxlbjIgOiAoaSArIG1heENodW5rTGVuZ3RoKSkpXG4gIH1cblxuICAvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG4gIGlmIChleHRyYUJ5dGVzID09PSAxKSB7XG4gICAgdG1wID0gdWludDhbbGVuIC0gMV1cbiAgICBvdXRwdXQgKz0gbG9va3VwW3RtcCA+PiAyXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA8PCA0KSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9ICc9PSdcbiAgfSBlbHNlIGlmIChleHRyYUJ5dGVzID09PSAyKSB7XG4gICAgdG1wID0gKHVpbnQ4W2xlbiAtIDJdIDw8IDgpICsgKHVpbnQ4W2xlbiAtIDFdKVxuICAgIG91dHB1dCArPSBsb29rdXBbdG1wID4+IDEwXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA+PiA0KSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFsodG1wIDw8IDIpICYgMHgzRl1cbiAgICBvdXRwdXQgKz0gJz0nXG4gIH1cblxuICBwYXJ0cy5wdXNoKG91dHB1dClcblxuICByZXR1cm4gcGFydHMuam9pbignJylcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9iYXNlNjQtanMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDI0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2llZWU3NTQvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDI1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGFycikge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChhcnIpID09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2lzYXJyYXkvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDI2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xudmFyIHdpbmRvdyA9IHJlcXVpcmUoXCJnbG9iYWwvd2luZG93XCIpXG52YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoXCJpcy1mdW5jdGlvblwiKVxudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoXCJwYXJzZS1oZWFkZXJzXCIpXG52YXIgeHRlbmQgPSByZXF1aXJlKFwieHRlbmRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVYSFJcbmNyZWF0ZVhIUi5YTUxIdHRwUmVxdWVzdCA9IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCB8fCBub29wXG5jcmVhdGVYSFIuWERvbWFpblJlcXVlc3QgPSBcIndpdGhDcmVkZW50aWFsc1wiIGluIChuZXcgY3JlYXRlWEhSLlhNTEh0dHBSZXF1ZXN0KCkpID8gY3JlYXRlWEhSLlhNTEh0dHBSZXF1ZXN0IDogd2luZG93LlhEb21haW5SZXF1ZXN0XG5cbmZvckVhY2hBcnJheShbXCJnZXRcIiwgXCJwdXRcIiwgXCJwb3N0XCIsIFwicGF0Y2hcIiwgXCJoZWFkXCIsIFwiZGVsZXRlXCJdLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICBjcmVhdGVYSFJbbWV0aG9kID09PSBcImRlbGV0ZVwiID8gXCJkZWxcIiA6IG1ldGhvZF0gPSBmdW5jdGlvbih1cmksIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIG9wdGlvbnMgPSBpbml0UGFyYW1zKHVyaSwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgICAgIG9wdGlvbnMubWV0aG9kID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIF9jcmVhdGVYSFIob3B0aW9ucylcbiAgICB9XG59KVxuXG5mdW5jdGlvbiBmb3JFYWNoQXJyYXkoYXJyYXksIGl0ZXJhdG9yKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVyYXRvcihhcnJheVtpXSlcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzRW1wdHkob2JqKXtcbiAgICBmb3IodmFyIGkgaW4gb2JqKXtcbiAgICAgICAgaWYob2JqLmhhc093blByb3BlcnR5KGkpKSByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gaW5pdFBhcmFtcyh1cmksIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHBhcmFtcyA9IHVyaVxuXG4gICAgaWYgKGlzRnVuY3Rpb24ob3B0aW9ucykpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zXG4gICAgICAgIGlmICh0eXBlb2YgdXJpID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBwYXJhbXMgPSB7dXJpOnVyaX1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmFtcyA9IHh0ZW5kKG9wdGlvbnMsIHt1cmk6IHVyaX0pXG4gICAgfVxuXG4gICAgcGFyYW1zLmNhbGxiYWNrID0gY2FsbGJhY2tcbiAgICByZXR1cm4gcGFyYW1zXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVhIUih1cmksIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgb3B0aW9ucyA9IGluaXRQYXJhbXModXJpLCBvcHRpb25zLCBjYWxsYmFjaylcbiAgICByZXR1cm4gX2NyZWF0ZVhIUihvcHRpb25zKVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlWEhSKG9wdGlvbnMpIHtcbiAgICBpZih0eXBlb2Ygb3B0aW9ucy5jYWxsYmFjayA9PT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNhbGxiYWNrIGFyZ3VtZW50IG1pc3NpbmdcIilcbiAgICB9XG5cbiAgICB2YXIgY2FsbGVkID0gZmFsc2VcbiAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiBjYk9uY2UoZXJyLCByZXNwb25zZSwgYm9keSl7XG4gICAgICAgIGlmKCFjYWxsZWQpe1xuICAgICAgICAgICAgY2FsbGVkID0gdHJ1ZVxuICAgICAgICAgICAgb3B0aW9ucy5jYWxsYmFjayhlcnIsIHJlc3BvbnNlLCBib2R5KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZHlzdGF0ZWNoYW5nZSgpIHtcbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICBsb2FkRnVuYygpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRCb2R5KCkge1xuICAgICAgICAvLyBDaHJvbWUgd2l0aCByZXF1ZXN0VHlwZT1ibG9iIHRocm93cyBlcnJvcnMgYXJyb3VuZCB3aGVuIGV2ZW4gdGVzdGluZyBhY2Nlc3MgdG8gcmVzcG9uc2VUZXh0XG4gICAgICAgIHZhciBib2R5ID0gdW5kZWZpbmVkXG5cbiAgICAgICAgaWYgKHhoci5yZXNwb25zZSkge1xuICAgICAgICAgICAgYm9keSA9IHhoci5yZXNwb25zZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYm9keSA9IHhoci5yZXNwb25zZVRleHQgfHwgZ2V0WG1sKHhocilcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0pzb24pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYm9keSA9IEpTT04ucGFyc2UoYm9keSlcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYm9keVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVycm9yRnVuYyhldnQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRUaW1lcilcbiAgICAgICAgaWYoIShldnQgaW5zdGFuY2VvZiBFcnJvcikpe1xuICAgICAgICAgICAgZXZ0ID0gbmV3IEVycm9yKFwiXCIgKyAoZXZ0IHx8IFwiVW5rbm93biBYTUxIdHRwUmVxdWVzdCBFcnJvclwiKSApXG4gICAgICAgIH1cbiAgICAgICAgZXZ0LnN0YXR1c0NvZGUgPSAwXG4gICAgICAgIHJldHVybiBjYWxsYmFjayhldnQsIGZhaWx1cmVSZXNwb25zZSlcbiAgICB9XG5cbiAgICAvLyB3aWxsIGxvYWQgdGhlIGRhdGEgJiBwcm9jZXNzIHRoZSByZXNwb25zZSBpbiBhIHNwZWNpYWwgcmVzcG9uc2Ugb2JqZWN0XG4gICAgZnVuY3Rpb24gbG9hZEZ1bmMoKSB7XG4gICAgICAgIGlmIChhYm9ydGVkKSByZXR1cm5cbiAgICAgICAgdmFyIHN0YXR1c1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dFRpbWVyKVxuICAgICAgICBpZihvcHRpb25zLnVzZVhEUiAmJiB4aHIuc3RhdHVzPT09dW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvL0lFOCBDT1JTIEdFVCBzdWNjZXNzZnVsIHJlc3BvbnNlIGRvZXNuJ3QgaGF2ZSBhIHN0YXR1cyBmaWVsZCwgYnV0IGJvZHkgaXMgZmluZVxuICAgICAgICAgICAgc3RhdHVzID0gMjAwXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0dXMgPSAoeGhyLnN0YXR1cyA9PT0gMTIyMyA/IDIwNCA6IHhoci5zdGF0dXMpXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlc3BvbnNlID0gZmFpbHVyZVJlc3BvbnNlXG4gICAgICAgIHZhciBlcnIgPSBudWxsXG5cbiAgICAgICAgaWYgKHN0YXR1cyAhPT0gMCl7XG4gICAgICAgICAgICByZXNwb25zZSA9IHtcbiAgICAgICAgICAgICAgICBib2R5OiBnZXRCb2R5KCksXG4gICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogc3RhdHVzLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgICAgICAgICAgIHVybDogdXJpLFxuICAgICAgICAgICAgICAgIHJhd1JlcXVlc3Q6IHhoclxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycyl7IC8vcmVtZW1iZXIgeGhyIGNhbiBpbiBmYWN0IGJlIFhEUiBmb3IgQ09SUyBpbiBJRVxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmhlYWRlcnMgPSBwYXJzZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyID0gbmV3IEVycm9yKFwiSW50ZXJuYWwgWE1MSHR0cFJlcXVlc3QgRXJyb3JcIilcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyLCByZXNwb25zZSwgcmVzcG9uc2UuYm9keSlcbiAgICB9XG5cbiAgICB2YXIgeGhyID0gb3B0aW9ucy54aHIgfHwgbnVsbFxuXG4gICAgaWYgKCF4aHIpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuY29ycyB8fCBvcHRpb25zLnVzZVhEUikge1xuICAgICAgICAgICAgeGhyID0gbmV3IGNyZWF0ZVhIUi5YRG9tYWluUmVxdWVzdCgpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgeGhyID0gbmV3IGNyZWF0ZVhIUi5YTUxIdHRwUmVxdWVzdCgpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIga2V5XG4gICAgdmFyIGFib3J0ZWRcbiAgICB2YXIgdXJpID0geGhyLnVybCA9IG9wdGlvbnMudXJpIHx8IG9wdGlvbnMudXJsXG4gICAgdmFyIG1ldGhvZCA9IHhoci5tZXRob2QgPSBvcHRpb25zLm1ldGhvZCB8fCBcIkdFVFwiXG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHkgfHwgb3B0aW9ucy5kYXRhXG4gICAgdmFyIGhlYWRlcnMgPSB4aHIuaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyB8fCB7fVxuICAgIHZhciBzeW5jID0gISFvcHRpb25zLnN5bmNcbiAgICB2YXIgaXNKc29uID0gZmFsc2VcbiAgICB2YXIgdGltZW91dFRpbWVyXG4gICAgdmFyIGZhaWx1cmVSZXNwb25zZSA9IHtcbiAgICAgICAgYm9keTogdW5kZWZpbmVkLFxuICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICAgICAgc3RhdHVzQ29kZTogMCxcbiAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgIHVybDogdXJpLFxuICAgICAgICByYXdSZXF1ZXN0OiB4aHJcbiAgICB9XG5cbiAgICBpZiAoXCJqc29uXCIgaW4gb3B0aW9ucyAmJiBvcHRpb25zLmpzb24gIT09IGZhbHNlKSB7XG4gICAgICAgIGlzSnNvbiA9IHRydWVcbiAgICAgICAgaGVhZGVyc1tcImFjY2VwdFwiXSB8fCBoZWFkZXJzW1wiQWNjZXB0XCJdIHx8IChoZWFkZXJzW1wiQWNjZXB0XCJdID0gXCJhcHBsaWNhdGlvbi9qc29uXCIpIC8vRG9uJ3Qgb3ZlcnJpZGUgZXhpc3RpbmcgYWNjZXB0IGhlYWRlciBkZWNsYXJlZCBieSB1c2VyXG4gICAgICAgIGlmIChtZXRob2QgIT09IFwiR0VUXCIgJiYgbWV0aG9kICE9PSBcIkhFQURcIikge1xuICAgICAgICAgICAgaGVhZGVyc1tcImNvbnRlbnQtdHlwZVwiXSB8fCBoZWFkZXJzW1wiQ29udGVudC1UeXBlXCJdIHx8IChoZWFkZXJzW1wiQ29udGVudC1UeXBlXCJdID0gXCJhcHBsaWNhdGlvbi9qc29uXCIpIC8vRG9uJ3Qgb3ZlcnJpZGUgZXhpc3RpbmcgYWNjZXB0IGhlYWRlciBkZWNsYXJlZCBieSB1c2VyXG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5qc29uID09PSB0cnVlID8gYm9keSA6IG9wdGlvbnMuanNvbilcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSByZWFkeXN0YXRlY2hhbmdlXG4gICAgeGhyLm9ubG9hZCA9IGxvYWRGdW5jXG4gICAgeGhyLm9uZXJyb3IgPSBlcnJvckZ1bmNcbiAgICAvLyBJRTkgbXVzdCBoYXZlIG9ucHJvZ3Jlc3MgYmUgc2V0IHRvIGEgdW5pcXVlIGZ1bmN0aW9uLlxuICAgIHhoci5vbnByb2dyZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBJRSBtdXN0IGRpZVxuICAgIH1cbiAgICB4aHIub25hYm9ydCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGFib3J0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICB4aHIub250aW1lb3V0ID0gZXJyb3JGdW5jXG4gICAgeGhyLm9wZW4obWV0aG9kLCB1cmksICFzeW5jLCBvcHRpb25zLnVzZXJuYW1lLCBvcHRpb25zLnBhc3N3b3JkKVxuICAgIC8vaGFzIHRvIGJlIGFmdGVyIG9wZW5cbiAgICBpZighc3luYykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gISFvcHRpb25zLndpdGhDcmVkZW50aWFsc1xuICAgIH1cbiAgICAvLyBDYW5ub3Qgc2V0IHRpbWVvdXQgd2l0aCBzeW5jIHJlcXVlc3RcbiAgICAvLyBub3Qgc2V0dGluZyB0aW1lb3V0IG9uIHRoZSB4aHIgb2JqZWN0LCBiZWNhdXNlIG9mIG9sZCB3ZWJraXRzIGV0Yy4gbm90IGhhbmRsaW5nIHRoYXQgY29ycmVjdGx5XG4gICAgLy8gYm90aCBucG0ncyByZXF1ZXN0IGFuZCBqcXVlcnkgMS54IHVzZSB0aGlzIGtpbmQgb2YgdGltZW91dCwgc28gdGhpcyBpcyBiZWluZyBjb25zaXN0ZW50XG4gICAgaWYgKCFzeW5jICYmIG9wdGlvbnMudGltZW91dCA+IDAgKSB7XG4gICAgICAgIHRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmIChhYm9ydGVkKSByZXR1cm5cbiAgICAgICAgICAgIGFib3J0ZWQgPSB0cnVlLy9JRTkgbWF5IHN0aWxsIGNhbGwgcmVhZHlzdGF0ZWNoYW5nZVxuICAgICAgICAgICAgeGhyLmFib3J0KFwidGltZW91dFwiKVxuICAgICAgICAgICAgdmFyIGUgPSBuZXcgRXJyb3IoXCJYTUxIdHRwUmVxdWVzdCB0aW1lb3V0XCIpXG4gICAgICAgICAgICBlLmNvZGUgPSBcIkVUSU1FRE9VVFwiXG4gICAgICAgICAgICBlcnJvckZ1bmMoZSlcbiAgICAgICAgfSwgb3B0aW9ucy50aW1lb3V0IClcbiAgICB9XG5cbiAgICBpZiAoeGhyLnNldFJlcXVlc3RIZWFkZXIpIHtcbiAgICAgICAgZm9yKGtleSBpbiBoZWFkZXJzKXtcbiAgICAgICAgICAgIGlmKGhlYWRlcnMuaGFzT3duUHJvcGVydHkoa2V5KSl7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoa2V5LCBoZWFkZXJzW2tleV0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMuaGVhZGVycyAmJiAhaXNFbXB0eShvcHRpb25zLmhlYWRlcnMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkhlYWRlcnMgY2Fubm90IGJlIHNldCBvbiBhbiBYRG9tYWluUmVxdWVzdCBvYmplY3RcIilcbiAgICB9XG5cbiAgICBpZiAoXCJyZXNwb25zZVR5cGVcIiBpbiBvcHRpb25zKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSBvcHRpb25zLnJlc3BvbnNlVHlwZVxuICAgIH1cblxuICAgIGlmIChcImJlZm9yZVNlbmRcIiBpbiBvcHRpb25zICYmXG4gICAgICAgIHR5cGVvZiBvcHRpb25zLmJlZm9yZVNlbmQgPT09IFwiZnVuY3Rpb25cIlxuICAgICkge1xuICAgICAgICBvcHRpb25zLmJlZm9yZVNlbmQoeGhyKVxuICAgIH1cblxuICAgIC8vIE1pY3Jvc29mdCBFZGdlIGJyb3dzZXIgc2VuZHMgXCJ1bmRlZmluZWRcIiB3aGVuIHNlbmQgaXMgY2FsbGVkIHdpdGggdW5kZWZpbmVkIHZhbHVlLlxuICAgIC8vIFhNTEh0dHBSZXF1ZXN0IHNwZWMgc2F5cyB0byBwYXNzIG51bGwgYXMgYm9keSB0byBpbmRpY2F0ZSBubyBib2R5XG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9uYXVndHVyL3hoci9pc3N1ZXMvMTAwLlxuICAgIHhoci5zZW5kKGJvZHkgfHwgbnVsbClcblxuICAgIHJldHVybiB4aHJcblxuXG59XG5cbmZ1bmN0aW9uIGdldFhtbCh4aHIpIHtcbiAgICBpZiAoeGhyLnJlc3BvbnNlVHlwZSA9PT0gXCJkb2N1bWVudFwiKSB7XG4gICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VYTUxcbiAgICB9XG4gICAgdmFyIGZpcmVmb3hCdWdUYWtlbkVmZmVjdCA9IHhoci5zdGF0dXMgPT09IDIwNCAmJiB4aHIucmVzcG9uc2VYTUwgJiYgeGhyLnJlc3BvbnNlWE1MLmRvY3VtZW50RWxlbWVudC5ub2RlTmFtZSA9PT0gXCJwYXJzZXJlcnJvclwiXG4gICAgaWYgKHhoci5yZXNwb25zZVR5cGUgPT09IFwiXCIgJiYgIWZpcmVmb3hCdWdUYWtlbkVmZmVjdCkge1xuICAgICAgICByZXR1cm4geGhyLnJlc3BvbnNlWE1MXG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGxcbn1cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34veGhyL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBnbG9iYWw7XG59IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHNlbGY7XG59IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0ge307XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vZ2xvYmFsL3dpbmRvdy5qc1xuLy8gbW9kdWxlIGlkID0gMjhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBpc0Z1bmN0aW9uXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdcblxuZnVuY3Rpb24gaXNGdW5jdGlvbiAoZm4pIHtcbiAgdmFyIHN0cmluZyA9IHRvU3RyaW5nLmNhbGwoZm4pXG4gIHJldHVybiBzdHJpbmcgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXScgfHxcbiAgICAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nICYmIHN0cmluZyAhPT0gJ1tvYmplY3QgUmVnRXhwXScpIHx8XG4gICAgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgIC8vIElFOCBhbmQgYmVsb3dcbiAgICAgKGZuID09PSB3aW5kb3cuc2V0VGltZW91dCB8fFxuICAgICAgZm4gPT09IHdpbmRvdy5hbGVydCB8fFxuICAgICAgZm4gPT09IHdpbmRvdy5jb25maXJtIHx8XG4gICAgICBmbiA9PT0gd2luZG93LnByb21wdCkpXG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2lzLWZ1bmN0aW9uL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgdHJpbSA9IHJlcXVpcmUoJ3RyaW0nKVxuICAsIGZvckVhY2ggPSByZXF1aXJlKCdmb3ItZWFjaCcpXG4gICwgaXNBcnJheSA9IGZ1bmN0aW9uKGFyZykge1xuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmcpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaGVhZGVycykge1xuICBpZiAoIWhlYWRlcnMpXG4gICAgcmV0dXJuIHt9XG5cbiAgdmFyIHJlc3VsdCA9IHt9XG5cbiAgZm9yRWFjaChcbiAgICAgIHRyaW0oaGVhZGVycykuc3BsaXQoJ1xcbicpXG4gICAgLCBmdW5jdGlvbiAocm93KSB7XG4gICAgICAgIHZhciBpbmRleCA9IHJvdy5pbmRleE9mKCc6JylcbiAgICAgICAgICAsIGtleSA9IHRyaW0ocm93LnNsaWNlKDAsIGluZGV4KSkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICwgdmFsdWUgPSB0cmltKHJvdy5zbGljZShpbmRleCArIDEpKVxuXG4gICAgICAgIGlmICh0eXBlb2YocmVzdWx0W2tleV0pID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWVcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KHJlc3VsdFtrZXldKSkge1xuICAgICAgICAgIHJlc3VsdFtrZXldLnB1c2godmFsdWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0W2tleV0gPSBbIHJlc3VsdFtrZXldLCB2YWx1ZSBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgKVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcGFyc2UtaGVhZGVycy9wYXJzZS1oZWFkZXJzLmpzXG4vLyBtb2R1bGUgaWQgPSAzMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHRyaW07XG5cbmZ1bmN0aW9uIHRyaW0oc3RyKXtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKnxcXHMqJC9nLCAnJyk7XG59XG5cbmV4cG9ydHMubGVmdCA9IGZ1bmN0aW9uKHN0cil7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyovLCAnJyk7XG59O1xuXG5leHBvcnRzLnJpZ2h0ID0gZnVuY3Rpb24oc3RyKXtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vdHJpbS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMzFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCdpcy1mdW5jdGlvbicpXG5cbm1vZHVsZS5leHBvcnRzID0gZm9yRWFjaFxuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG5cbmZ1bmN0aW9uIGZvckVhY2gobGlzdCwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoIWlzRnVuY3Rpb24oaXRlcmF0b3IpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2l0ZXJhdG9yIG11c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgfVxuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgICAgIGNvbnRleHQgPSB0aGlzXG4gICAgfVxuICAgIFxuICAgIGlmICh0b1N0cmluZy5jYWxsKGxpc3QpID09PSAnW29iamVjdCBBcnJheV0nKVxuICAgICAgICBmb3JFYWNoQXJyYXkobGlzdCwgaXRlcmF0b3IsIGNvbnRleHQpXG4gICAgZWxzZSBpZiAodHlwZW9mIGxpc3QgPT09ICdzdHJpbmcnKVxuICAgICAgICBmb3JFYWNoU3RyaW5nKGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KVxuICAgIGVsc2VcbiAgICAgICAgZm9yRWFjaE9iamVjdChsaXN0LCBpdGVyYXRvciwgY29udGV4dClcbn1cblxuZnVuY3Rpb24gZm9yRWFjaEFycmF5KGFycmF5LCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnJheS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChhcnJheSwgaSkpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgYXJyYXlbaV0sIGksIGFycmF5KVxuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmb3JFYWNoU3RyaW5nKHN0cmluZywgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gc3RyaW5nLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIC8vIG5vIHN1Y2ggdGhpbmcgYXMgYSBzcGFyc2Ugc3RyaW5nLlxuICAgICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHN0cmluZy5jaGFyQXQoaSksIGksIHN0cmluZylcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGZvckVhY2hPYmplY3Qob2JqZWN0LCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGZvciAodmFyIGsgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgaykpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqZWN0W2tdLCBrLCBvYmplY3QpXG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vZm9yLWVhY2gvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDMyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VCTUZvbnRBc2NpaShkYXRhKSB7XG4gIGlmICghZGF0YSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIGRhdGEgcHJvdmlkZWQnKVxuICBkYXRhID0gZGF0YS50b1N0cmluZygpLnRyaW0oKVxuXG4gIHZhciBvdXRwdXQgPSB7XG4gICAgcGFnZXM6IFtdLFxuICAgIGNoYXJzOiBbXSxcbiAgICBrZXJuaW5nczogW11cbiAgfVxuXG4gIHZhciBsaW5lcyA9IGRhdGEuc3BsaXQoL1xcclxcbj98XFxuL2cpXG5cbiAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIGRhdGEgaW4gQk1Gb250IGZpbGUnKVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbGluZURhdGEgPSBzcGxpdExpbmUobGluZXNbaV0sIGkpXG4gICAgaWYgKCFsaW5lRGF0YSkgLy9za2lwIGVtcHR5IGxpbmVzXG4gICAgICBjb250aW51ZVxuXG4gICAgaWYgKGxpbmVEYXRhLmtleSA9PT0gJ3BhZ2UnKSB7XG4gICAgICBpZiAodHlwZW9mIGxpbmVEYXRhLmRhdGEuaWQgIT09ICdudW1iZXInKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ21hbGZvcm1lZCBmaWxlIGF0IGxpbmUgJyArIGkgKyAnIC0tIG5lZWRzIHBhZ2UgaWQ9TicpXG4gICAgICBpZiAodHlwZW9mIGxpbmVEYXRhLmRhdGEuZmlsZSAhPT0gJ3N0cmluZycpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbWFsZm9ybWVkIGZpbGUgYXQgbGluZSAnICsgaSArICcgLS0gbmVlZHMgcGFnZSBmaWxlPVwicGF0aFwiJylcbiAgICAgIG91dHB1dC5wYWdlc1tsaW5lRGF0YS5kYXRhLmlkXSA9IGxpbmVEYXRhLmRhdGEuZmlsZVxuICAgIH0gZWxzZSBpZiAobGluZURhdGEua2V5ID09PSAnY2hhcnMnIHx8IGxpbmVEYXRhLmtleSA9PT0gJ2tlcm5pbmdzJykge1xuICAgICAgLy8uLi4gZG8gbm90aGluZyBmb3IgdGhlc2UgdHdvIC4uLlxuICAgIH0gZWxzZSBpZiAobGluZURhdGEua2V5ID09PSAnY2hhcicpIHtcbiAgICAgIG91dHB1dC5jaGFycy5wdXNoKGxpbmVEYXRhLmRhdGEpXG4gICAgfSBlbHNlIGlmIChsaW5lRGF0YS5rZXkgPT09ICdrZXJuaW5nJykge1xuICAgICAgb3V0cHV0Lmtlcm5pbmdzLnB1c2gobGluZURhdGEuZGF0YSlcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0W2xpbmVEYXRhLmtleV0gPSBsaW5lRGF0YS5kYXRhXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dHB1dFxufVxuXG5mdW5jdGlvbiBzcGxpdExpbmUobGluZSwgaWR4KSB7XG4gIGxpbmUgPSBsaW5lLnJlcGxhY2UoL1xcdCsvZywgJyAnKS50cmltKClcbiAgaWYgKCFsaW5lKVxuICAgIHJldHVybiBudWxsXG5cbiAgdmFyIHNwYWNlID0gbGluZS5pbmRleE9mKCcgJylcbiAgaWYgKHNwYWNlID09PSAtMSkgXG4gICAgdGhyb3cgbmV3IEVycm9yKFwibm8gbmFtZWQgcm93IGF0IGxpbmUgXCIgKyBpZHgpXG5cbiAgdmFyIGtleSA9IGxpbmUuc3Vic3RyaW5nKDAsIHNwYWNlKVxuXG4gIGxpbmUgPSBsaW5lLnN1YnN0cmluZyhzcGFjZSArIDEpXG4gIC8vY2xlYXIgXCJsZXR0ZXJcIiBmaWVsZCBhcyBpdCBpcyBub24tc3RhbmRhcmQgYW5kXG4gIC8vcmVxdWlyZXMgYWRkaXRpb25hbCBjb21wbGV4aXR5IHRvIHBhcnNlIFwiIC8gPSBzeW1ib2xzXG4gIGxpbmUgPSBsaW5lLnJlcGxhY2UoL2xldHRlcj1bXFwnXFxcIl1cXFMrW1xcJ1xcXCJdL2dpLCAnJykgIFxuICBsaW5lID0gbGluZS5zcGxpdChcIj1cIilcbiAgbGluZSA9IGxpbmUubWFwKGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBzdHIudHJpbSgpLm1hdGNoKCgvKFwiLio/XCJ8W15cIlxcc10rKSsoPz1cXHMqfFxccyokKS9nKSlcbiAgfSlcblxuICB2YXIgZGF0YSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBkdCA9IGxpbmVbaV1cbiAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAga2V5OiBkdFswXSxcbiAgICAgICAgZGF0YTogXCJcIlxuICAgICAgfSlcbiAgICB9IGVsc2UgaWYgKGkgPT09IGxpbmUubGVuZ3RoIC0gMSkge1xuICAgICAgZGF0YVtkYXRhLmxlbmd0aCAtIDFdLmRhdGEgPSBwYXJzZURhdGEoZHRbMF0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGFbZGF0YS5sZW5ndGggLSAxXS5kYXRhID0gcGFyc2VEYXRhKGR0WzBdKVxuICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAga2V5OiBkdFsxXSxcbiAgICAgICAgZGF0YTogXCJcIlxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICB2YXIgb3V0ID0ge1xuICAgIGtleToga2V5LFxuICAgIGRhdGE6IHt9XG4gIH1cblxuICBkYXRhLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgIG91dC5kYXRhW3Yua2V5XSA9IHYuZGF0YTtcbiAgfSlcblxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIHBhcnNlRGF0YShkYXRhKSB7XG4gIGlmICghZGF0YSB8fCBkYXRhLmxlbmd0aCA9PT0gMClcbiAgICByZXR1cm4gXCJcIlxuXG4gIGlmIChkYXRhLmluZGV4T2YoJ1wiJykgPT09IDAgfHwgZGF0YS5pbmRleE9mKFwiJ1wiKSA9PT0gMClcbiAgICByZXR1cm4gZGF0YS5zdWJzdHJpbmcoMSwgZGF0YS5sZW5ndGggLSAxKVxuICBpZiAoZGF0YS5pbmRleE9mKCcsJykgIT09IC0xKVxuICAgIHJldHVybiBwYXJzZUludExpc3QoZGF0YSlcbiAgcmV0dXJuIHBhcnNlSW50KGRhdGEsIDEwKVxufVxuXG5mdW5jdGlvbiBwYXJzZUludExpc3QoZGF0YSkge1xuICByZXR1cm4gZGF0YS5zcGxpdCgnLCcpLm1hcChmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQodmFsLCAxMClcbiAgfSlcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcGFyc2UtYm1mb250LWFzY2lpL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgcGFyc2VBdHRyaWJ1dGVzID0gcmVxdWlyZSgnLi9wYXJzZS1hdHRyaWJzJylcbnZhciBwYXJzZUZyb21TdHJpbmcgPSByZXF1aXJlKCd4bWwtcGFyc2UtZnJvbS1zdHJpbmcnKVxuXG4vL0luIHNvbWUgY2FzZXMgZWxlbWVudC5hdHRyaWJ1dGUubm9kZU5hbWUgY2FuIHJldHVyblxuLy9hbGwgbG93ZXJjYXNlIHZhbHVlcy4uIHNvIHdlIG5lZWQgdG8gbWFwIHRoZW0gdG8gdGhlIGNvcnJlY3QgXG4vL2Nhc2VcbnZhciBOQU1FX01BUCA9IHtcbiAgc2NhbGVoOiAnc2NhbGVIJyxcbiAgc2NhbGV3OiAnc2NhbGVXJyxcbiAgc3RyZXRjaGg6ICdzdHJldGNoSCcsXG4gIGxpbmVoZWlnaHQ6ICdsaW5lSGVpZ2h0JyxcbiAgYWxwaGFjaG5sOiAnYWxwaGFDaG5sJyxcbiAgcmVkY2hubDogJ3JlZENobmwnLFxuICBncmVlbmNobmw6ICdncmVlbkNobmwnLFxuICBibHVlY2hubDogJ2JsdWVDaG5sJ1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlKGRhdGEpIHtcbiAgZGF0YSA9IGRhdGEudG9TdHJpbmcoKVxuICBcbiAgdmFyIHhtbFJvb3QgPSBwYXJzZUZyb21TdHJpbmcoZGF0YSlcbiAgdmFyIG91dHB1dCA9IHtcbiAgICBwYWdlczogW10sXG4gICAgY2hhcnM6IFtdLFxuICAgIGtlcm5pbmdzOiBbXVxuICB9XG5cbiAgLy9nZXQgY29uZmlnIHNldHRpbmdzXG4gIDtbJ2luZm8nLCAnY29tbW9uJ10uZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgZWxlbWVudCA9IHhtbFJvb3QuZ2V0RWxlbWVudHNCeVRhZ05hbWUoa2V5KVswXVxuICAgIGlmIChlbGVtZW50KVxuICAgICAgb3V0cHV0W2tleV0gPSBwYXJzZUF0dHJpYnV0ZXMoZ2V0QXR0cmlicyhlbGVtZW50KSlcbiAgfSlcblxuICAvL2dldCBwYWdlIGluZm9cbiAgdmFyIHBhZ2VSb290ID0geG1sUm9vdC5nZXRFbGVtZW50c0J5VGFnTmFtZSgncGFnZXMnKVswXVxuICBpZiAoIXBhZ2VSb290KVxuICAgIHRocm93IG5ldyBFcnJvcignbWFsZm9ybWVkIGZpbGUgLS0gbm8gPHBhZ2VzPiBlbGVtZW50JylcbiAgdmFyIHBhZ2VzID0gcGFnZVJvb3QuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3BhZ2UnKVxuICBmb3IgKHZhciBpPTA7IGk8cGFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcCA9IHBhZ2VzW2ldXG4gICAgdmFyIGlkID0gcGFyc2VJbnQocC5nZXRBdHRyaWJ1dGUoJ2lkJyksIDEwKVxuICAgIHZhciBmaWxlID0gcC5nZXRBdHRyaWJ1dGUoJ2ZpbGUnKVxuICAgIGlmIChpc05hTihpZCkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21hbGZvcm1lZCBmaWxlIC0tIHBhZ2UgXCJpZFwiIGF0dHJpYnV0ZSBpcyBOYU4nKVxuICAgIGlmICghZmlsZSlcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWFsZm9ybWVkIGZpbGUgLS0gbmVlZHMgcGFnZSBcImZpbGVcIiBhdHRyaWJ1dGUnKVxuICAgIG91dHB1dC5wYWdlc1twYXJzZUludChpZCwgMTApXSA9IGZpbGVcbiAgfVxuXG4gIC8vZ2V0IGtlcm5pbmdzIC8gY2hhcnNcbiAgO1snY2hhcnMnLCAna2VybmluZ3MnXS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIHZhciBlbGVtZW50ID0geG1sUm9vdC5nZXRFbGVtZW50c0J5VGFnTmFtZShrZXkpWzBdXG4gICAgaWYgKCFlbGVtZW50KVxuICAgICAgcmV0dXJuXG4gICAgdmFyIGNoaWxkVGFnID0ga2V5LnN1YnN0cmluZygwLCBrZXkubGVuZ3RoLTEpXG4gICAgdmFyIGNoaWxkcmVuID0gZWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShjaGlsZFRhZylcbiAgICBmb3IgKHZhciBpPTA7IGk8Y2hpbGRyZW4ubGVuZ3RoOyBpKyspIHsgICAgICBcbiAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgICBvdXRwdXRba2V5XS5wdXNoKHBhcnNlQXR0cmlidXRlcyhnZXRBdHRyaWJzKGNoaWxkKSkpXG4gICAgfVxuICB9KVxuICByZXR1cm4gb3V0cHV0XG59XG5cbmZ1bmN0aW9uIGdldEF0dHJpYnMoZWxlbWVudCkge1xuICB2YXIgYXR0cmlicyA9IGdldEF0dHJpYkxpc3QoZWxlbWVudClcbiAgcmV0dXJuIGF0dHJpYnMucmVkdWNlKGZ1bmN0aW9uKGRpY3QsIGF0dHJpYikge1xuICAgIHZhciBrZXkgPSBtYXBOYW1lKGF0dHJpYi5ub2RlTmFtZSlcbiAgICBkaWN0W2tleV0gPSBhdHRyaWIubm9kZVZhbHVlXG4gICAgcmV0dXJuIGRpY3RcbiAgfSwge30pXG59XG5cbmZ1bmN0aW9uIGdldEF0dHJpYkxpc3QoZWxlbWVudCkge1xuICAvL0lFOCsgYW5kIG1vZGVybiBicm93c2Vyc1xuICB2YXIgYXR0cmlicyA9IFtdXG4gIGZvciAodmFyIGk9MDsgaTxlbGVtZW50LmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspXG4gICAgYXR0cmlicy5wdXNoKGVsZW1lbnQuYXR0cmlidXRlc1tpXSlcbiAgcmV0dXJuIGF0dHJpYnNcbn1cblxuZnVuY3Rpb24gbWFwTmFtZShub2RlTmFtZSkge1xuICByZXR1cm4gTkFNRV9NQVBbbm9kZU5hbWUudG9Mb3dlckNhc2UoKV0gfHwgbm9kZU5hbWVcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcGFyc2UtYm1mb250LXhtbC9saWIvYnJvd3Nlci5qc1xuLy8gbW9kdWxlIGlkID0gMzRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy9Tb21lIHZlcnNpb25zIG9mIEdseXBoRGVzaWduZXIgaGF2ZSBhIHR5cG9cbi8vdGhhdCBjYXVzZXMgc29tZSBidWdzIHdpdGggcGFyc2luZy4gXG4vL05lZWQgdG8gY29uZmlybSB3aXRoIHJlY2VudCB2ZXJzaW9uIG9mIHRoZSBzb2Z0d2FyZVxuLy90byBzZWUgd2hldGhlciB0aGlzIGlzIHN0aWxsIGFuIGlzc3VlIG9yIG5vdC5cbnZhciBHTFlQSF9ERVNJR05FUl9FUlJPUiA9ICdjaGFzcnNldCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUF0dHJpYnV0ZXMob2JqKSB7XG4gIGlmIChHTFlQSF9ERVNJR05FUl9FUlJPUiBpbiBvYmopIHtcbiAgICBvYmpbJ2NoYXJzZXQnXSA9IG9ialtHTFlQSF9ERVNJR05FUl9FUlJPUl1cbiAgICBkZWxldGUgb2JqW0dMWVBIX0RFU0lHTkVSX0VSUk9SXVxuICB9XG5cbiAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICBpZiAoayA9PT0gJ2ZhY2UnIHx8IGsgPT09ICdjaGFyc2V0JykgXG4gICAgICBjb250aW51ZVxuICAgIGVsc2UgaWYgKGsgPT09ICdwYWRkaW5nJyB8fCBrID09PSAnc3BhY2luZycpXG4gICAgICBvYmpba10gPSBwYXJzZUludExpc3Qob2JqW2tdKVxuICAgIGVsc2VcbiAgICAgIG9ialtrXSA9IHBhcnNlSW50KG9ialtrXSwgMTApIFxuICB9XG4gIHJldHVybiBvYmpcbn1cblxuZnVuY3Rpb24gcGFyc2VJbnRMaXN0KGRhdGEpIHtcbiAgcmV0dXJuIGRhdGEuc3BsaXQoJywnKS5tYXAoZnVuY3Rpb24odmFsKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KHZhbCwgMTApXG4gIH0pXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3BhcnNlLWJtZm9udC14bWwvbGliL3BhcnNlLWF0dHJpYnMuanNcbi8vIG1vZHVsZSBpZCA9IDM1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uIHhtbHBhcnNlcigpIHtcbiAgLy9jb21tb24gYnJvd3NlcnNcbiAgaWYgKHR5cGVvZiB3aW5kb3cuRE9NUGFyc2VyICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHIpIHtcbiAgICAgIHZhciBwYXJzZXIgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpXG4gICAgICByZXR1cm4gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyhzdHIsICdhcHBsaWNhdGlvbi94bWwnKVxuICAgIH1cbiAgfSBcblxuICAvL0lFOCBmYWxsYmFja1xuICBpZiAodHlwZW9mIHdpbmRvdy5BY3RpdmVYT2JqZWN0ICE9PSAndW5kZWZpbmVkJ1xuICAgICAgJiYgbmV3IHdpbmRvdy5BY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MRE9NJykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyKSB7XG4gICAgICB2YXIgeG1sRG9jID0gbmV3IHdpbmRvdy5BY3RpdmVYT2JqZWN0KFwiTWljcm9zb2Z0LlhNTERPTVwiKVxuICAgICAgeG1sRG9jLmFzeW5jID0gXCJmYWxzZVwiXG4gICAgICB4bWxEb2MubG9hZFhNTChzdHIpXG4gICAgICByZXR1cm4geG1sRG9jXG4gICAgfVxuICB9XG5cbiAgLy9sYXN0IHJlc29ydCBmYWxsYmFja1xuICByZXR1cm4gZnVuY3Rpb24oc3RyKSB7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZGl2LmlubmVySFRNTCA9IHN0clxuICAgIHJldHVybiBkaXZcbiAgfVxufSkoKVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi94bWwtcGFyc2UtZnJvbS1zdHJpbmcvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDM2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBIRUFERVIgPSBbNjYsIDc3LCA3MF1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZWFkQk1Gb250QmluYXJ5KGJ1Zikge1xuICBpZiAoYnVmLmxlbmd0aCA8IDYpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGJ1ZmZlciBsZW5ndGggZm9yIEJNRm9udCcpXG5cbiAgdmFyIGhlYWRlciA9IEhFQURFUi5ldmVyeShmdW5jdGlvbihieXRlLCBpKSB7XG4gICAgcmV0dXJuIGJ1Zi5yZWFkVUludDgoaSkgPT09IGJ5dGVcbiAgfSlcblxuICBpZiAoIWhlYWRlcilcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0JNRm9udCBtaXNzaW5nIEJNRiBieXRlIGhlYWRlcicpXG5cbiAgdmFyIGkgPSAzXG4gIHZhciB2ZXJzID0gYnVmLnJlYWRVSW50OChpKyspXG4gIGlmICh2ZXJzID4gMylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ09ubHkgc3VwcG9ydHMgQk1Gb250IEJpbmFyeSB2MyAoQk1Gb250IEFwcCB2MS4xMCknKVxuICBcbiAgdmFyIHRhcmdldCA9IHsga2VybmluZ3M6IFtdLCBjaGFyczogW10gfVxuICBmb3IgKHZhciBiPTA7IGI8NTsgYisrKVxuICAgIGkgKz0gcmVhZEJsb2NrKHRhcmdldCwgYnVmLCBpKVxuICByZXR1cm4gdGFyZ2V0XG59XG5cbmZ1bmN0aW9uIHJlYWRCbG9jayh0YXJnZXQsIGJ1ZiwgaSkge1xuICBpZiAoaSA+IGJ1Zi5sZW5ndGgtMSlcbiAgICByZXR1cm4gMFxuXG4gIHZhciBibG9ja0lEID0gYnVmLnJlYWRVSW50OChpKyspXG4gIHZhciBibG9ja1NpemUgPSBidWYucmVhZEludDMyTEUoaSlcbiAgaSArPSA0XG5cbiAgc3dpdGNoKGJsb2NrSUQpIHtcbiAgICBjYXNlIDE6IFxuICAgICAgdGFyZ2V0LmluZm8gPSByZWFkSW5mbyhidWYsIGkpXG4gICAgICBicmVha1xuICAgIGNhc2UgMjpcbiAgICAgIHRhcmdldC5jb21tb24gPSByZWFkQ29tbW9uKGJ1ZiwgaSlcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAzOlxuICAgICAgdGFyZ2V0LnBhZ2VzID0gcmVhZFBhZ2VzKGJ1ZiwgaSwgYmxvY2tTaXplKVxuICAgICAgYnJlYWtcbiAgICBjYXNlIDQ6XG4gICAgICB0YXJnZXQuY2hhcnMgPSByZWFkQ2hhcnMoYnVmLCBpLCBibG9ja1NpemUpXG4gICAgICBicmVha1xuICAgIGNhc2UgNTpcbiAgICAgIHRhcmdldC5rZXJuaW5ncyA9IHJlYWRLZXJuaW5ncyhidWYsIGksIGJsb2NrU2l6ZSlcbiAgICAgIGJyZWFrXG4gIH1cbiAgcmV0dXJuIDUgKyBibG9ja1NpemVcbn1cblxuZnVuY3Rpb24gcmVhZEluZm8oYnVmLCBpKSB7XG4gIHZhciBpbmZvID0ge31cbiAgaW5mby5zaXplID0gYnVmLnJlYWRJbnQxNkxFKGkpXG5cbiAgdmFyIGJpdEZpZWxkID0gYnVmLnJlYWRVSW50OChpKzIpXG4gIGluZm8uc21vb3RoID0gKGJpdEZpZWxkID4+IDcpICYgMVxuICBpbmZvLnVuaWNvZGUgPSAoYml0RmllbGQgPj4gNikgJiAxXG4gIGluZm8uaXRhbGljID0gKGJpdEZpZWxkID4+IDUpICYgMVxuICBpbmZvLmJvbGQgPSAoYml0RmllbGQgPj4gNCkgJiAxXG4gIFxuICAvL2ZpeGVkSGVpZ2h0IGlzIG9ubHkgbWVudGlvbmVkIGluIGJpbmFyeSBzcGVjIFxuICBpZiAoKGJpdEZpZWxkID4+IDMpICYgMSlcbiAgICBpbmZvLmZpeGVkSGVpZ2h0ID0gMVxuICBcbiAgaW5mby5jaGFyc2V0ID0gYnVmLnJlYWRVSW50OChpKzMpIHx8ICcnXG4gIGluZm8uc3RyZXRjaEggPSBidWYucmVhZFVJbnQxNkxFKGkrNClcbiAgaW5mby5hYSA9IGJ1Zi5yZWFkVUludDgoaSs2KVxuICBpbmZvLnBhZGRpbmcgPSBbXG4gICAgYnVmLnJlYWRJbnQ4KGkrNyksXG4gICAgYnVmLnJlYWRJbnQ4KGkrOCksXG4gICAgYnVmLnJlYWRJbnQ4KGkrOSksXG4gICAgYnVmLnJlYWRJbnQ4KGkrMTApXG4gIF1cbiAgaW5mby5zcGFjaW5nID0gW1xuICAgIGJ1Zi5yZWFkSW50OChpKzExKSxcbiAgICBidWYucmVhZEludDgoaSsxMilcbiAgXVxuICBpbmZvLm91dGxpbmUgPSBidWYucmVhZFVJbnQ4KGkrMTMpXG4gIGluZm8uZmFjZSA9IHJlYWRTdHJpbmdOVChidWYsIGkrMTQpXG4gIHJldHVybiBpbmZvXG59XG5cbmZ1bmN0aW9uIHJlYWRDb21tb24oYnVmLCBpKSB7XG4gIHZhciBjb21tb24gPSB7fVxuICBjb21tb24ubGluZUhlaWdodCA9IGJ1Zi5yZWFkVUludDE2TEUoaSlcbiAgY29tbW9uLmJhc2UgPSBidWYucmVhZFVJbnQxNkxFKGkrMilcbiAgY29tbW9uLnNjYWxlVyA9IGJ1Zi5yZWFkVUludDE2TEUoaSs0KVxuICBjb21tb24uc2NhbGVIID0gYnVmLnJlYWRVSW50MTZMRShpKzYpXG4gIGNvbW1vbi5wYWdlcyA9IGJ1Zi5yZWFkVUludDE2TEUoaSs4KVxuICB2YXIgYml0RmllbGQgPSBidWYucmVhZFVJbnQ4KGkrMTApXG4gIGNvbW1vbi5wYWNrZWQgPSAwXG4gIGNvbW1vbi5hbHBoYUNobmwgPSBidWYucmVhZFVJbnQ4KGkrMTEpXG4gIGNvbW1vbi5yZWRDaG5sID0gYnVmLnJlYWRVSW50OChpKzEyKVxuICBjb21tb24uZ3JlZW5DaG5sID0gYnVmLnJlYWRVSW50OChpKzEzKVxuICBjb21tb24uYmx1ZUNobmwgPSBidWYucmVhZFVJbnQ4KGkrMTQpXG4gIHJldHVybiBjb21tb25cbn1cblxuZnVuY3Rpb24gcmVhZFBhZ2VzKGJ1ZiwgaSwgc2l6ZSkge1xuICB2YXIgcGFnZXMgPSBbXVxuICB2YXIgdGV4dCA9IHJlYWROYW1lTlQoYnVmLCBpKVxuICB2YXIgbGVuID0gdGV4dC5sZW5ndGgrMVxuICB2YXIgY291bnQgPSBzaXplIC8gbGVuXG4gIGZvciAodmFyIGM9MDsgYzxjb3VudDsgYysrKSB7XG4gICAgcGFnZXNbY10gPSBidWYuc2xpY2UoaSwgaSt0ZXh0Lmxlbmd0aCkudG9TdHJpbmcoJ3V0ZjgnKVxuICAgIGkgKz0gbGVuXG4gIH1cbiAgcmV0dXJuIHBhZ2VzXG59XG5cbmZ1bmN0aW9uIHJlYWRDaGFycyhidWYsIGksIGJsb2NrU2l6ZSkge1xuICB2YXIgY2hhcnMgPSBbXVxuXG4gIHZhciBjb3VudCA9IGJsb2NrU2l6ZSAvIDIwXG4gIGZvciAodmFyIGM9MDsgYzxjb3VudDsgYysrKSB7XG4gICAgdmFyIGNoYXIgPSB7fVxuICAgIHZhciBvZmYgPSBjKjIwXG4gICAgY2hhci5pZCA9IGJ1Zi5yZWFkVUludDMyTEUoaSArIDAgKyBvZmYpXG4gICAgY2hhci54ID0gYnVmLnJlYWRVSW50MTZMRShpICsgNCArIG9mZilcbiAgICBjaGFyLnkgPSBidWYucmVhZFVJbnQxNkxFKGkgKyA2ICsgb2ZmKVxuICAgIGNoYXIud2lkdGggPSBidWYucmVhZFVJbnQxNkxFKGkgKyA4ICsgb2ZmKVxuICAgIGNoYXIuaGVpZ2h0ID0gYnVmLnJlYWRVSW50MTZMRShpICsgMTAgKyBvZmYpXG4gICAgY2hhci54b2Zmc2V0ID0gYnVmLnJlYWRJbnQxNkxFKGkgKyAxMiArIG9mZilcbiAgICBjaGFyLnlvZmZzZXQgPSBidWYucmVhZEludDE2TEUoaSArIDE0ICsgb2ZmKVxuICAgIGNoYXIueGFkdmFuY2UgPSBidWYucmVhZEludDE2TEUoaSArIDE2ICsgb2ZmKVxuICAgIGNoYXIucGFnZSA9IGJ1Zi5yZWFkVUludDgoaSArIDE4ICsgb2ZmKVxuICAgIGNoYXIuY2hubCA9IGJ1Zi5yZWFkVUludDgoaSArIDE5ICsgb2ZmKVxuICAgIGNoYXJzW2NdID0gY2hhclxuICB9XG4gIHJldHVybiBjaGFyc1xufVxuXG5mdW5jdGlvbiByZWFkS2VybmluZ3MoYnVmLCBpLCBibG9ja1NpemUpIHtcbiAgdmFyIGtlcm5pbmdzID0gW11cbiAgdmFyIGNvdW50ID0gYmxvY2tTaXplIC8gMTBcbiAgZm9yICh2YXIgYz0wOyBjPGNvdW50OyBjKyspIHtcbiAgICB2YXIga2VybiA9IHt9XG4gICAgdmFyIG9mZiA9IGMqMTBcbiAgICBrZXJuLmZpcnN0ID0gYnVmLnJlYWRVSW50MzJMRShpICsgMCArIG9mZilcbiAgICBrZXJuLnNlY29uZCA9IGJ1Zi5yZWFkVUludDMyTEUoaSArIDQgKyBvZmYpXG4gICAga2Vybi5hbW91bnQgPSBidWYucmVhZEludDE2TEUoaSArIDggKyBvZmYpXG4gICAga2VybmluZ3NbY10gPSBrZXJuXG4gIH1cbiAgcmV0dXJuIGtlcm5pbmdzXG59XG5cbmZ1bmN0aW9uIHJlYWROYW1lTlQoYnVmLCBvZmZzZXQpIHtcbiAgdmFyIHBvcz1vZmZzZXRcbiAgZm9yICg7IHBvczxidWYubGVuZ3RoOyBwb3MrKykge1xuICAgIGlmIChidWZbcG9zXSA9PT0gMHgwMCkgXG4gICAgICBicmVha1xuICB9XG4gIHJldHVybiBidWYuc2xpY2Uob2Zmc2V0LCBwb3MpXG59XG5cbmZ1bmN0aW9uIHJlYWRTdHJpbmdOVChidWYsIG9mZnNldCkge1xuICByZXR1cm4gcmVhZE5hbWVOVChidWYsIG9mZnNldCkudG9TdHJpbmcoJ3V0ZjgnKVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9wYXJzZS1ibWZvbnQtYmluYXJ5L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZXF1YWwgPSByZXF1aXJlKCdidWZmZXItZXF1YWwnKVxudmFyIEhFQURFUiA9IG5ldyBCdWZmZXIoWzY2LCA3NywgNzAsIDNdKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGJ1Zikge1xuICBpZiAodHlwZW9mIGJ1ZiA9PT0gJ3N0cmluZycpXG4gICAgcmV0dXJuIGJ1Zi5zdWJzdHJpbmcoMCwgMykgPT09ICdCTUYnXG4gIHJldHVybiBidWYubGVuZ3RoID4gNCAmJiBlcXVhbChidWYuc2xpY2UoMCwgNCksIEhFQURFUilcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9hZC1ibWZvbnQvbGliL2lzLWJpbmFyeS5qc1xuLy8gbW9kdWxlIGlkID0gMzhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjsgLy8gZm9yIHVzZSB3aXRoIGJyb3dzZXJpZnlcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKGEpKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGlmICh0eXBlb2YgYS5lcXVhbHMgPT09ICdmdW5jdGlvbicpIHJldHVybiBhLmVxdWFscyhiKTtcbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiB0cnVlO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9idWZmZXItZXF1YWwvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDM5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBhc3NpZ24gPSByZXF1aXJlKCdvYmplY3QtYXNzaWduJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlU0RGU2hhZGVyIChvcHQpIHtcclxuICBvcHQgPSBvcHQgfHwge31cclxuICB2YXIgb3BhY2l0eSA9IHR5cGVvZiBvcHQub3BhY2l0eSA9PT0gJ251bWJlcicgPyBvcHQub3BhY2l0eSA6IDFcclxuICB2YXIgYWxwaGFUZXN0ID0gdHlwZW9mIG9wdC5hbHBoYVRlc3QgPT09ICdudW1iZXInID8gb3B0LmFscGhhVGVzdCA6IDAuMDAwMVxyXG4gIHZhciBwcmVjaXNpb24gPSBvcHQucHJlY2lzaW9uIHx8ICdoaWdocCdcclxuICB2YXIgY29sb3IgPSBvcHQuY29sb3JcclxuICB2YXIgbWFwID0gb3B0Lm1hcFxyXG5cclxuICAvLyByZW1vdmUgdG8gc2F0aXNmeSByNzNcclxuICBkZWxldGUgb3B0Lm1hcFxyXG4gIGRlbGV0ZSBvcHQuY29sb3JcclxuICBkZWxldGUgb3B0LnByZWNpc2lvblxyXG4gIGRlbGV0ZSBvcHQub3BhY2l0eVxyXG5cclxuICByZXR1cm4gYXNzaWduKHtcclxuICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgIG9wYWNpdHk6IHsgdHlwZTogJ2YnLCB2YWx1ZTogb3BhY2l0eSB9LFxyXG4gICAgICBtYXA6IHsgdHlwZTogJ3QnLCB2YWx1ZTogbWFwIHx8IG5ldyBUSFJFRS5UZXh0dXJlKCkgfSxcclxuICAgICAgY29sb3I6IHsgdHlwZTogJ2MnLCB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKGNvbG9yKSB9XHJcbiAgICB9LFxyXG4gICAgdmVydGV4U2hhZGVyOiBbXHJcbiAgICAgICdhdHRyaWJ1dGUgdmVjMiB1djsnLFxyXG4gICAgICAnYXR0cmlidXRlIHZlYzQgcG9zaXRpb247JyxcclxuICAgICAgJ3VuaWZvcm0gbWF0NCBwcm9qZWN0aW9uTWF0cml4OycsXHJcbiAgICAgICd1bmlmb3JtIG1hdDQgbW9kZWxWaWV3TWF0cml4OycsXHJcbiAgICAgICd2YXJ5aW5nIHZlYzIgdlV2OycsXHJcbiAgICAgICd2b2lkIG1haW4oKSB7JyxcclxuICAgICAgJ3ZVdiA9IHV2OycsXHJcbiAgICAgICdnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiBwb3NpdGlvbjsnLFxyXG4gICAgICAnfSdcclxuICAgIF0uam9pbignXFxuJyksXHJcbiAgICBmcmFnbWVudFNoYWRlcjogW1xyXG4gICAgICAnI2lmZGVmIEdMX09FU19zdGFuZGFyZF9kZXJpdmF0aXZlcycsXHJcbiAgICAgICcjZXh0ZW5zaW9uIEdMX09FU19zdGFuZGFyZF9kZXJpdmF0aXZlcyA6IGVuYWJsZScsXHJcbiAgICAgICcjZW5kaWYnLFxyXG4gICAgICAncHJlY2lzaW9uICcgKyBwcmVjaXNpb24gKyAnIGZsb2F0OycsXHJcbiAgICAgICd1bmlmb3JtIGZsb2F0IG9wYWNpdHk7JyxcclxuICAgICAgJ3VuaWZvcm0gdmVjMyBjb2xvcjsnLFxyXG4gICAgICAndW5pZm9ybSBzYW1wbGVyMkQgbWFwOycsXHJcbiAgICAgICd2YXJ5aW5nIHZlYzIgdlV2OycsXHJcblxyXG4gICAgICAnZmxvYXQgYWFzdGVwKGZsb2F0IHZhbHVlKSB7JyxcclxuICAgICAgJyAgI2lmZGVmIEdMX09FU19zdGFuZGFyZF9kZXJpdmF0aXZlcycsXHJcbiAgICAgICcgICAgZmxvYXQgYWZ3aWR0aCA9IGxlbmd0aCh2ZWMyKGRGZHgodmFsdWUpLCBkRmR5KHZhbHVlKSkpICogMC43MDcxMDY3ODExODY1NDc1NzsnLFxyXG4gICAgICAnICAjZWxzZScsXHJcbiAgICAgICcgICAgZmxvYXQgYWZ3aWR0aCA9ICgxLjAgLyAzMi4wKSAqICgxLjQxNDIxMzU2MjM3MzA5NTEgLyAoMi4wICogZ2xfRnJhZ0Nvb3JkLncpKTsnLFxyXG4gICAgICAnICAjZW5kaWYnLFxyXG4gICAgICAnICByZXR1cm4gc21vb3Roc3RlcCgwLjUgLSBhZndpZHRoLCAwLjUgKyBhZndpZHRoLCB2YWx1ZSk7JyxcclxuICAgICAgJ30nLFxyXG5cclxuICAgICAgJ3ZvaWQgbWFpbigpIHsnLFxyXG4gICAgICAnICB2ZWM0IHRleENvbG9yID0gdGV4dHVyZTJEKG1hcCwgdlV2KTsnLFxyXG4gICAgICAnICBmbG9hdCBhbHBoYSA9IGFhc3RlcCh0ZXhDb2xvci5hKTsnLFxyXG4gICAgICAnICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yLCBvcGFjaXR5ICogYWxwaGEpOycsXHJcbiAgICAgIGFscGhhVGVzdCA9PT0gMFxyXG4gICAgICAgID8gJydcclxuICAgICAgICA6ICcgIGlmIChnbF9GcmFnQ29sb3IuYSA8ICcgKyBhbHBoYVRlc3QgKyAnKSBkaXNjYXJkOycsXHJcbiAgICAgICd9J1xyXG4gICAgXS5qb2luKCdcXG4nKVxyXG4gIH0sIG9wdClcclxufVxyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYWZyYW1lLWJtZm9udC10ZXh0LWNvbXBvbmVudC9saWIvc2hhZGVycy9zZGYuanNcbi8vIG1vZHVsZSBpZCA9IDQwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qIGdsb2JhbCBBRlJBTUUgKi9cclxuXHJcbi8qIEV4cGVyaW1lbnRhbCB0ZXh0IHByaW1pdGl2ZS5cclxuICogSXNzdWVzOiBjb2xvciBub3QgY2hhbmdpbmcsIHJlbW92ZUF0dHJpYnV0ZSgpIG5vdCB3b3JraW5nLCBtaXhpbmcgcHJpbWl0aXZlIHdpdGggcmVndWxhciBlbnRpdGllcyBmYWlsc1xyXG4gKiBDb2xvciBpc3N1ZSByZWxhdGVzIHRvOiBodHRwczovL2dpdGh1Yi5jb20vZG9ubWNjdXJkeS9hZnJhbWUtZXh0cmFzL2Jsb2IvbWFzdGVyL3NyYy9wcmltaXRpdmVzL2Etb2NlYW4uanMjTDQ0XHJcbiAqL1xyXG5cclxudmFyIGV4dGVuZERlZXAgPSBBRlJBTUUudXRpbHMuZXh0ZW5kRGVlcDtcclxudmFyIG1lc2hNaXhpbiA9IEFGUkFNRS5wcmltaXRpdmVzLmdldE1lc2hNaXhpbigpO1xyXG5cclxuQUZSQU1FLnJlZ2lzdGVyUHJpbWl0aXZlKCdhLXRleHQnLCBleHRlbmREZWVwKHt9LCBtZXNoTWl4aW4sIHtcclxuICBkZWZhdWx0Q29tcG9uZW50czoge1xyXG4gICAgJ2JtZm9udC10ZXh0Jzoge31cclxuICB9LFxyXG4gIG1hcHBpbmdzOiB7XHJcbiAgICB0ZXh0OiAnYm1mb250LXRleHQudGV4dCcsXHJcbiAgICB3aWR0aDogJ2JtZm9udC10ZXh0LndpZHRoJyxcclxuICAgIGFsaWduOiAnYm1mb250LXRleHQuYWxpZ24nLFxyXG4gICAgbGV0dGVyU3BhY2luZzogJ2JtZm9udC10ZXh0LmxldHRlclNwYWNpbmcnLFxyXG4gICAgbGluZUhlaWdodDogJ2JtZm9udC10ZXh0LmxpbmVIZWlnaHQnLFxyXG4gICAgZm50OiAnYm1mb250LXRleHQuZm50JyxcclxuICAgIGZudEltYWdlOiAnYm1mb250LXRleHQuZm50SW1hZ2UnLFxyXG4gICAgbW9kZTogJ2JtZm9udC10ZXh0Lm1vZGUnLFxyXG4gICAgY29sb3I6ICdibWZvbnQtdGV4dC5jb2xvcicsXHJcbiAgICBvcGFjaXR5OiAnYm1mb250LXRleHQub3BhY2l0eSdcclxuICB9XHJcbn0pKTtcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FmcmFtZS1ibWZvbnQtdGV4dC1jb21wb25lbnQvZXh0cmFzL3RleHQtcHJpbWl0aXZlLmpzXG4vLyBtb2R1bGUgaWQgPSA0MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiBhZnJhbWUtc2VsZWN0LWJhciBjb21wb25lbnQgLS0gYXR0ZW1wdCB0byBwdWxsIG91dCBzZWxlY3QgYmFyIGNvZGUgZnJvbSBjaXR5IGJ1aWxkZXIgbG9naWMgKi9cclxuXHJcbi8qIGZvciB0ZXN0aW5nIGluIGNvbnNvbGU6XHJcbm1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVudVwiKTtcclxubWVudUVsLmVtaXQoXCJvbk9wdGlvbk5leHRcIik7XHJcbm1lbnVFbC5lbWl0KFwib25PcHRpb25QcmV2aW91c1wiKTtcclxuKi9cclxuXHJcbi8vIE5PVEVTOlxyXG4vLyBhdCBsZWFzdCBvbmUgb3B0Z3JvdXAgcmVxdWlyZWQsIGF0IGxlYXN5IDcgb3B0aW9ucyByZXF1aXJlZCBwZXIgb3B0Z3JvdXBcclxuLy8gNSBvciA2IG9wdGlvbnMgcGVyIG9wdGdyb3VwIG1heSB3b3JrLCBuZWVkcyB0ZXN0aW5nXHJcbi8vIDQgYW5kIGJlbG93IHNob3VsZCBiZSBubyBzY3JvbGxcclxuXHJcblxyXG5pZiAodHlwZW9mIEFGUkFNRSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xyXG59XHJcblxyXG4vLyBIRUxQRVIgRlVOQ1RJT05TXHJcbi8vIGZpbmQgYW4gZWxlbWVudCdzIG9yaWdpbmFsIGluZGV4IHBvc2l0aW9uIGluIGFuIGFycmF5IGJ5IHNlYXJjaGluZyBvbiBhbiBlbGVtZW50J3MgdmFsdWUgaW4gdGhlIGFycmF5XHJcbmZ1bmN0aW9uIGZpbmRXaXRoQXR0cihhcnJheSwgYXR0ciwgdmFsdWUpIHsgIC8vIGZpbmQgYVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmKGFycmF5W2ldW2F0dHJdID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gLTE7XHJcbn1cclxuXHJcbi8vIGZvciBhIGdpdmVuIGFycmF5LCBmaW5kIHRoZSBsYXJnZXN0IHZhbHVlIGFuZCByZXR1cm4gdGhlIHZhbHVlIG9mIHRoZSBpbmRleCB0aGVyZW9mICgwLWJhc2VkIGluZGV4KVxyXG5mdW5jdGlvbiBpbmRleE9mTWF4KGFycikge1xyXG4gICAgaWYgKGFyci5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbiAgICB2YXIgbWF4ID0gYXJyWzBdO1xyXG4gICAgdmFyIG1heEluZGV4ID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGFycltpXSA+IG1heCkge1xyXG4gICAgICAgICAgICBtYXhJbmRleCA9IGk7XHJcbiAgICAgICAgICAgIG1heCA9IGFycltpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWF4SW5kZXg7XHJcbn1cclxuXHJcbi8vIHByb3ZpZGUgYSB2YWxpZCBJbmRleCBmb3IgYW4gQXJyYXkgaWYgdGhlIGRlc2lyZWRJbmRleCBpcyBncmVhdGVyIG9yIGxlc3MgdGhhbiBhbiBhcnJheSdzIGxlbmd0aCBieSBcImxvb3BpbmdcIiBhcm91bmRcclxuZnVuY3Rpb24gbG9vcEluZGV4KGRlc2lyZWRJbmRleCwgYXJyYXlMZW5ndGgpIHsgICAvLyBleHBlY3RzIGEgMCBiYXNlZCBpbmRleFxyXG4gIGlmIChkZXNpcmVkSW5kZXggPiAoYXJyYXlMZW5ndGggLSAxKSkge1xyXG4gICAgcmV0dXJuIGRlc2lyZWRJbmRleCAtIGFycmF5TGVuZ3RoO1xyXG4gIH1cclxuICBpZiAoZGVzaXJlZEluZGV4IDwgMCkge1xyXG4gICAgcmV0dXJuIGFycmF5TGVuZ3RoICsgZGVzaXJlZEluZGV4O1xyXG4gIH1cclxuICByZXR1cm4gZGVzaXJlZEluZGV4O1xyXG59XHJcbi8vIEdoZXR0byB0ZXN0aW5nIG9mIGxvb3BJbmRleCBoZWxwZXIgZnVuY3Rpb25cclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbWVzc2FnZSkge1xyXG4vLyAgICBjb25zb2xlLmxvZyhjb25kaXRpb24uc3RyaW5naWZ5KTtcclxuICAgIGlmICghY29uZGl0aW9uKSB7XHJcbiAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UgfHwgXCJBc3NlcnRpb24gZmFpbGVkXCI7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBFcnJvciAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IG1lc3NhZ2U7IC8vIEZhbGxiYWNrXHJcbiAgICB9XHJcbn1cclxudmFyIHRlc3RMb29wQXJyYXkgPSBbMCwxLDIsMyw0LDUsNiw3LDgsOV07XHJcbmFzc2VydChsb29wSW5kZXgoOSwgdGVzdExvb3BBcnJheS5sZW5ndGgpID09IDkpO1xyXG5hc3NlcnQobG9vcEluZGV4KDEwLCB0ZXN0TG9vcEFycmF5Lmxlbmd0aCkgPT0gMCk7XHJcbmFzc2VydChsb29wSW5kZXgoMTEsIHRlc3RMb29wQXJyYXkubGVuZ3RoKSA9PSAxKTtcclxuYXNzZXJ0KGxvb3BJbmRleCgwLCB0ZXN0TG9vcEFycmF5Lmxlbmd0aCkgPT0gMCk7XHJcbmFzc2VydChsb29wSW5kZXgoLTEsIHRlc3RMb29wQXJyYXkubGVuZ3RoKSA9PSA5KTtcclxuYXNzZXJ0KGxvb3BJbmRleCgtMiwgdGVzdExvb3BBcnJheS5sZW5ndGgpID09IDgpO1xyXG5cclxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdzZWxlY3QtYmFyJywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgY29udHJvbHM6IHt0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6IHRydWV9LFxyXG4gICAgY29udHJvbGxlcklEOiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6ICdyaWdodENvbnRyb2xsZXInfSxcclxuICAgIHNlbGVjdGVkT3B0Z3JvdXBWYWx1ZToge3R5cGU6ICdzdHJpbmcnfSwgICAgICAgICAgICAvLyBub3QgaW50ZW5kZWQgdG8gYmUgc2V0IHdoZW4gZGVmaW5pbmcgY29tcG9uZW50LCB1c2VkIGZvciB0cmFja2luZyBzdGF0ZVxyXG4gICAgc2VsZWN0ZWRPcHRncm91cEluZGV4OiB7dHlwZTogJ2ludCcsIGRlZmF1bHQ6IDB9LCAgIC8vIG5vdCBpbnRlbmRlZCB0byBiZSBzZXQgd2hlbiBkZWZpbmluZyBjb21wb25lbnQsIHVzZWQgZm9yIHRyYWNraW5nIHN0YXRlXHJcbiAgICBzZWxlY3RlZE9wdGlvblZhbHVlOiB7dHlwZTogJ3N0cmluZyd9LCAgICAgICAgICAgICAgLy8gbm90IGludGVuZGVkIHRvIGJlIHNldCB3aGVuIGRlZmluaW5nIGNvbXBvbmVudCwgdXNlZCBmb3IgdHJhY2tpbmcgc3RhdGVcclxuICAgIHNlbGVjdGVkT3B0aW9uSW5kZXg6IHt0eXBlOiAnaW50JywgZGVmYXVsdDogMH0gICAgICAvLyBub3QgaW50ZW5kZWQgdG8gYmUgc2V0IHdoZW4gZGVmaW5pbmcgY29tcG9uZW50LCB1c2VkIGZvciB0cmFja2luZyBzdGF0ZVxyXG4gIH0sXHJcblxyXG4gIC8vIGZvciBhIGdpdmVuIG9wdGdyb3VwLCBtYWtlIHRoZSBjaGlsZHJlbnNcclxuICBtYWtlU2VsZWN0T3B0aW9uc1JvdzogZnVuY3Rpb24oc2VsZWN0ZWRPcHRncm91cEVsLCBwYXJlbnRFbCwgaW5kZXgsIG9mZnNldFkgPSAwKSB7XHJcblxyXG4gICAgLy8gbWFrZSB0aGUgb3B0Z3JvdXAgbGFiZWxcclxuICAgIHZhciBvcHRncm91cExhYmVsRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYS1lbnRpdHlcIik7XHJcbiAgICBvcHRncm91cExhYmVsRWwuaWQgPSBcIm9wdGdyb3VwTGFiZWxcIiArIGluZGV4O1xyXG4gICAgb3B0Z3JvdXBMYWJlbEVsLnNldEF0dHJpYnV0ZShcInBvc2l0aW9uXCIsIFwiLTAuMTggXCIgKyAoMC4wNDUgKyBvZmZzZXRZKSArIFwiIC0wLjAwM1wiKTtcclxuICAgIG9wdGdyb3VwTGFiZWxFbC5zZXRBdHRyaWJ1dGUoXCJzY2FsZVwiLCBcIjAuMTI1IDAuMTI1IDAuMTI1XCIpO1xyXG4gICAgb3B0Z3JvdXBMYWJlbEVsLnNldEF0dHJpYnV0ZShcImJtZm9udC10ZXh0XCIsIFwidGV4dFwiLCBzZWxlY3RlZE9wdGdyb3VwRWwuZ2V0QXR0cmlidXRlKCdsYWJlbCcpKTtcclxuICAgIG9wdGdyb3VwTGFiZWxFbC5zZXRBdHRyaWJ1dGUoXCJibWZvbnQtdGV4dFwiLCBcImNvbG9yXCIsIFwiIzc0NzQ3NFwiKTtcclxuICAgIHBhcmVudEVsLmFwcGVuZENoaWxkKG9wdGdyb3VwTGFiZWxFbCk7XHJcblxyXG4gICAgLy8gZ2V0IHRoZSBvcHRpb25zIGF2YWlsYWJsZSBmb3IgdGhpcyBvcHRncm91cCByb3dcclxuICAgIHZhciBvcHRpb25zRWxlbWVudHMgPSBzZWxlY3RlZE9wdGdyb3VwRWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRpb25cIik7ICAvLyB0aGUgYWN0dWFsIEpTIGNoaWxkcmVuIGVsZW1lbnRzXHJcblxyXG4gICAgLy8gY29udmVydCB0aGUgTm9kZUxpc3Qgb2YgbWF0Y2hpbmcgb3B0aW9uIGVsZW1lbnRzIGludG8gYSBKYXZhc2NyaXB0IEFycmF5XHJcbiAgICB2YXIgb3B0aW9uc0VsZW1lbnRzQXJyYXkgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChvcHRpb25zRWxlbWVudHMpO1xyXG5cclxuICAgIHZhciBmaXJzdEFycmF5ID0gb3B0aW9uc0VsZW1lbnRzQXJyYXkuc2xpY2UoMCw0KTsgLy8gZ2V0IGl0ZW1zIDAgLSA0XHJcbiAgICB2YXIgcHJldmlld0FycmF5ID0gb3B0aW9uc0VsZW1lbnRzQXJyYXkuc2xpY2UoLTMpOyAvLyBnZXQgdGhlIDMgTEFTVCBpdGVtcyBvZiB0aGUgYXJyYXlcclxuXHJcbiAgICAvLyBDb21iaW5lIGludG8gXCJtZW51QXJyYXlcIiwgYSBsaXN0IG9mIGN1cnJlbnRseSB2aXNpYmxlIG9wdGlvbnMgd2hlcmUgdGhlIG1pZGRsZSBpbmRleCBpcyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9iamVjdFxyXG4gICAgdmFyIG1lbnVBcnJheSA9IHByZXZpZXdBcnJheS5jb25jYXQoZmlyc3RBcnJheSk7XHJcblxyXG4gICAgdmFyIHNlbGVjdE9wdGlvbnNIVE1MID0gXCJcIjtcclxuICAgIHZhciBzdGFydFBvc2l0aW9uWCA9IC0wLjIyNTtcclxuICAgIHZhciBkZWx0YVggPSAwLjA3NTtcclxuXHJcbiAgICAvLyBGb3IgZWFjaCBtZW51IG9wdGlvbiwgY3JlYXRlIGEgcHJldmlldyBlbGVtZW50IGFuZCBpdHMgYXBwcm9wcmlhdGUgY2hpbGRyZW5cclxuICAgIG1lbnVBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50LCBtZW51QXJyYXlJbmRleCkge1xyXG4gICAgICB2YXIgdmlzaWJsZSA9IChtZW51QXJyYXlJbmRleCA9PT0gMCB8fCBtZW51QXJyYXlJbmRleCA9PT0gNikgPyAoZmFsc2UpIDogKHRydWUpO1xyXG4gICAgICB2YXIgc2VsZWN0ZWQgPSAobWVudUFycmF5SW5kZXggPT09IDMpO1xyXG4gICAgICAvLyBpbmRleCBvZiB0aGUgb3B0aW9uc0VsZW1lbnRzQXJyYXkgd2hlcmUgb3B0aW9uc0VsZW1lbnRzQXJyYXkuZWxlbWVudC5nZXRhdHRyaWJ1dGUoXCJ2YWx1ZVwiKSA9IGVsZW1lbnQuZ2V0YXR0cmlidXRlKFwidmFsdWVcIilcclxuICAgICAgdmFyIG9yaWdpbmFsT3B0aW9uc0FycmF5SW5kZXggPSBmaW5kV2l0aEF0dHIob3B0aW9uc0VsZW1lbnRzQXJyYXksIFwidmFsdWVcIiwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKSk7XHJcbiAgICAgIHNlbGVjdE9wdGlvbnNIVE1MICs9IGBcclxuICAgICAgPGEtZW50aXR5IGlkPVwibWVudSR7b3JpZ2luYWxPcHRpb25zQXJyYXlJbmRleH1cIiB2aXNpYmxlPVwiJHt2aXNpYmxlfVwiIGNsYXNzPVwicHJldmlldyR7IChzZWxlY3RlZCkgPyBcIiBzZWxlY3RlZFwiIDogXCJcIn1cIiBvcHRpb25pZD1cIiR7b3JpZ2luYWxPcHRpb25zQXJyYXlJbmRleH1cIiB2YWx1ZT1cIiR7ZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKX1cIiBvcHRncm91cD1cIiR7c2VsZWN0ZWRPcHRncm91cEVsLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpfVwiIHBvc2l0aW9uPVwiJHtzdGFydFBvc2l0aW9uWH0gJHtvZmZzZXRZfSAwXCI+XHJcbiAgICAgICAgPGEtYm94IGNsYXNzPVwicHJldmlld0ZyYW1lXCIgcG9zaXRpb249XCIwIDAgLTAuMDAzXCIgc2NhbGU9XCIwLjA2IDAuMDYgMC4wMDVcIiBtYXRlcmlhbD1cImNvbG9yOiAkeyhzZWxlY3RlZCkgPyAoXCJ5ZWxsb3dcIikgOiAoXCIjMjIyMjIyXCIpfVwiPjwvYS1ib3g+XHJcbiAgICAgICAgPGEtaW1hZ2UgY2xhc3M9XCJwcmV2aWV3SW1hZ2VcIiBzY2FsZT1cIjAuMDUgMC4wNSAwLjA1XCIgc3JjPVwiJHtlbGVtZW50LmdldEF0dHJpYnV0ZShcInNyY1wiKX1cIiA+PC9hLWltYWdlPlxyXG4gICAgICAgIDxhLWVudGl0eSBjbGFzcz1cIm9iamVjdE5hbWVcIiBwb3NpdGlvbj1cIi0wLjAyNSAtMC4wNCAtMC4wMDNcIiBzY2FsZT1cIjAuMDUgMC4wNSAwLjA1XCIgYm1mb250LXRleHQ9XCJ0ZXh0OiAke2VsZW1lbnQudGV4dH07IGNvbG9yOiAkeyhzZWxlY3RlZCkgPyAoXCJ5ZWxsb3dcIikgOiAoXCIjNzQ3NDc0XCIpfVwiPjwvYS1lbnRpdHk+XHJcbiAgICAgIDwvYS1lbnRpdHk+YFxyXG4gICAgICBzdGFydFBvc2l0aW9uWCArPSBkZWx0YVg7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBcHBlbmQgdGhlc2UgbWVudSBvcHRpb25zIHRvIGEgbmV3IGVsZW1lbnQgd2l0aCBpZCBvZiBcInNlbGVjdE9wdGlvbnNSb3dcIlxyXG4gICAgdmFyIHNlbGVjdE9wdGlvbnNSb3dFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhLWVudGl0eVwiKTtcclxuICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5pZCA9IFwic2VsZWN0T3B0aW9uc1Jvd1wiICsgaW5kZXg7XHJcbiAgICBzZWxlY3RPcHRpb25zUm93RWwuaW5uZXJIVE1MID0gc2VsZWN0T3B0aW9uc0hUTUw7XHJcbiAgICBwYXJlbnRFbC5hcHBlbmRDaGlsZChzZWxlY3RPcHRpb25zUm93RWwpO1xyXG5cclxuICB9LFxyXG5cclxuICByZW1vdmVTZWxlY3RPcHRpb25zUm93OiBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgIC8vIGZpbmQgdGhlIGFwcHJvcHJpYXRlIHNlbGVjdCBvcHRpb25zIHJvd1xyXG4gICAgdmFyIHNlbGVjdE9wdGlvbnNSb3dFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VsZWN0T3B0aW9uc1Jvd1wiICsgaW5kZXgpO1xyXG4gICAgdmFyIG9wdGdyb3VwTGFiZWxFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3B0Z3JvdXBMYWJlbFwiICsgaW5kZXgpO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKFwidHJ5IHRvIHJlbW92ZSBjaGlsZHJlblwiKTtcclxuICAgIC8vIGRlbGV0ZSBhbGwgY2hpbGRyZW4gb2Ygc2VsZWN0T3B0aW9uc1Jvd0VsXHJcbiAgICB3aGlsZSAoc2VsZWN0T3B0aW9uc1Jvd0VsLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICBzZWxlY3RPcHRpb25zUm93RWwucmVtb3ZlQ2hpbGQoc2VsZWN0T3B0aW9uc1Jvd0VsLmZpcnN0Q2hpbGQpO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCJjaGlsZHJlbiByZW1vdmVkXCIpO1xyXG5cclxuICAgIC8vIGRlbGV0ZSBzZWxlY3RPcHRpb25zUm93RWwgYW5kIG9wdGdyb3VwTGFiZWxFbFxyXG4gICAgb3B0Z3JvdXBMYWJlbEVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob3B0Z3JvdXBMYWJlbEVsKTtcclxuICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNlbGVjdE9wdGlvbnNSb3dFbCk7XHJcbiAgfSxcclxuXHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gQ3JlYXRlIHNlbGVjdCBiYXIgbWVudSBmcm9tIGh0bWwgY2hpbGQgYG9wdGlvbmAgZWxlbWVudHMgYmVuZWF0aCBwYXJlbnQgZW50aXR5IGluc3BpcmVkIGJ5IHRoZSBodG1sNSBzcGVjOiBodHRwOi8vd3d3Lnczc2Nob29scy5jb20vdGFncy90YWdfb3B0Z3JvdXAuYXNwXHJcbiAgICB2YXIgc2VsZWN0RWwgPSB0aGlzLmVsOyAgLy8gUmVmZXJlbmNlIHRvIHRoZSBjb21wb25lbnQncyBlbnRpdHkuXHJcbiAgICB0aGlzLmRhdGEubGFzdFRpbWUgPSBuZXcgRGF0ZSgpO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgXCJmcmFtZVwiIG9mIHRoZSBzZWxlY3QgbWVudSBiYXJcclxuICAgIHZhciBzZWxlY3RSZW5kZXJFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhLWVudGl0eVwiKTtcclxuICAgIHNlbGVjdFJlbmRlckVsLmlkID0gXCJzZWxlY3RSZW5kZXJcIjtcclxuICAgIHNlbGVjdFJlbmRlckVsLmlubmVySFRNTCA9IGBcclxuICAgICAgPGEtYm94IGlkPVwibWVudUZyYW1lXCIgc2NhbGU9XCIwLjQgMC4xNSAwLjAwNVwiIHBvc2l0aW9uPVwiMCAwIC0wLjAwNzVcIiAgbWF0ZXJpYWw9XCJvcGFjaXR5OiAwLjU7IHRyYW5zcGFyZW50OiB0cnVlOyBjb2xvcjogIzAwMDAwMFwiPjwvYS1ib3g+XHJcbiAgICAgIDxhLWVudGl0eSBpZD1cImFycm93UmlnaHRcIiBwb3NpdGlvbj1cIjAuMjI1IDAgMFwiIHJvdGF0aW9uPVwiOTAgMTgwIDBcIiBzY2FsZT1cIi0wLjAwNCAwLjAwMiAwLjAwNFwiIG9iai1tb2RlbD1cIm9iajojZW52X2Fycm93XCIgbWF0ZXJpYWw9XCJvcGFjaXR5OiAwLjU7IHRyYW5zcGFyZW50OiB0cnVlOyBjb2xvcjogIzAwMDAwMFwiPjwvYS1lbnRpdHk+XHJcbiAgICAgIDxhLWVudGl0eSBpZD1cImFycm93TGVmdFwiIHBvc2l0aW9uPVwiLTAuMjI1IDAgMFwiIHJvdGF0aW9uPVwiOTAgMTgwIDBcIiBzY2FsZT1cIjAuMDA0IDAuMDAyIDAuMDA0XCIgb2JqLW1vZGVsPVwib2JqOiNlbnZfYXJyb3dcIiBtYXRlcmlhbD1cIm9wYWNpdHk6MC41OyB0cmFuc3BhcmVudDp0cnVlOyBjb2xvcjojMDAwMDAwXCI+PC9hLWVudGl0eT5cclxuICAgICAgPGEtZW50aXR5IGlkPVwiYXJyb3dVcFwiIHBvc2l0aW9uPVwiMCAwLjEgMFwiIHJvdGF0aW9uPVwiMCAyNzAgOTBcIiBzY2FsZT1cIjAuMDA0IDAuMDAyIDAuMDA0XCIgb2JqLW1vZGVsPVwib2JqOiNlbnZfYXJyb3dcIiBtYXRlcmlhbD1cIm9wYWNpdHk6IDAuNTsgdHJhbnNwYXJlbnQ6IHRydWU7IGNvbG9yOiAjMDAwMDAwXCI+PC9hLWVudGl0eT5cclxuICAgICAgPGEtZW50aXR5IGlkPVwiYXJyb3dEb3duXCIgcG9zaXRpb249XCIwIC0wLjEgMFwiIHJvdGF0aW9uPVwiMCAyNzAgOTBcIiBzY2FsZT1cIi0wLjAwNCAwLjAwMiAwLjAwNFwiIG9iai1tb2RlbD1cIm9iajojZW52X2Fycm93XCIgbWF0ZXJpYWw9XCJvcGFjaXR5OiAwLjU7IHRyYW5zcGFyZW50OiB0cnVlOyBjb2xvcjogIzAwMDAwMFwiPjwvYS1lbnRpdHk+XHJcbiAgICAgIGA7XHJcbiAgICBzZWxlY3RFbC5hcHBlbmRDaGlsZChzZWxlY3RSZW5kZXJFbCk7XHJcblxyXG5cclxuICAgIHZhciBvcHRncm91cHMgPSBzZWxlY3RFbC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm9wdGdyb3VwXCIpOyAgLy8gR2V0IHRoZSBvcHRncm91cHNcclxuICAgIHZhciBzZWxlY3RlZE9wdGdyb3VwRWwgPSBvcHRncm91cHNbdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleF07ICAvLyBmZXRjaCB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9wdGdyb3VwXHJcbiAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cFZhbHVlID0gc2VsZWN0ZWRPcHRncm91cEVsLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpOyAvLyBzZXQgY29tcG9uZW50IHByb3BlcnR5IHRvIG9wZ3JvdXAgdmFsdWVcclxuXHJcbiAgICB0aGlzLm1ha2VTZWxlY3RPcHRpb25zUm93KHNlbGVjdGVkT3B0Z3JvdXBFbCwgc2VsZWN0UmVuZGVyRWwsIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXgpO1xyXG5cclxuICB9LFxyXG5cclxuICBhZGRFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gSWYgY29udHJvbHMgPSB0cnVlIGFuZCBhIGNvbnRyb2xsZXJJRCBoYXMgYmVlbiBwcm92aWRlZCwgdGhlbiBhZGQgY29udHJvbGxlciBldmVudCBsaXN0ZW5lcnNcclxuICAgIGlmICh0aGlzLmRhdGEuY29udHJvbHMgJiYgdGhpcy5kYXRhLmNvbnRyb2xsZXJJRCkge1xyXG4gICAgICBjb250cm9sbGVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEuY29udHJvbGxlcklEKTtcclxuICAgICAgY29udHJvbGxlckVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYWNrcGFkZG93bicsIHRoaXMub25UcmFja3BhZERvd24uYmluZCh0aGlzKSk7XHJcbiAgICAgIGNvbnRyb2xsZXJFbC5hZGRFdmVudExpc3RlbmVyKCdheGlzbW92ZScsIHRoaXMub25BeGlzTW92ZS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignb25Ib3ZlckxlZnQnLCB0aGlzLm9uSG92ZXJMZWZ0LmJpbmQodGhpcykpO1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignb25Ib3ZlclJpZ2h0JywgdGhpcy5vbkhvdmVyUmlnaHQuYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdvbk9wdGlvblN3aXRjaCcsIHRoaXMub25PcHRpb25Td2l0Y2guYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdvbk9wdGlvbk5leHQnLCB0aGlzLm9uT3B0aW9uTmV4dC5iaW5kKHRoaXMpKTtcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ29uT3B0aW9uUHJldmlvdXMnLCB0aGlzLm9uT3B0aW9uUHJldmlvdXMuYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdvbk9wdGdyb3VwTmV4dCcsIHRoaXMub25PcHRncm91cE5leHQuYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdvbk9wdGdyb3VwUHJldmlvdXMnLCB0aGlzLm9uT3B0Z3JvdXBQcmV2aW91cy5iaW5kKHRoaXMpKTtcclxuXHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cclxuICAgKi9cclxuICByZW1vdmVFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuZGF0YS5jb250cm9scyAmJiB0aGlzLmRhdGEuY29udHJvbGxlcklEKSB7XHJcbiAgICAgIGNvbnRyb2xsZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5jb250cm9sbGVySUQpO1xyXG4gICAgICBjb250cm9sbGVyRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhY2twYWRkb3duJywgdGhpcy5vblRyYWNrcGFkRG93bik7XHJcbiAgICAgIGNvbnRyb2xsZXJFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdheGlzbW92ZScsIHRoaXMub25BeGlzTW92ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGVsID0gdGhpcy5lbDtcclxuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ29uT3B0aW9uU3dpdGNoJywgdGhpcy5vbk9wdGlvblN3aXRjaCk7XHJcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdvbkhvdmVyUmlnaHQnLCB0aGlzLm9uSG92ZXJSaWdodCk7XHJcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdvbkhvdmVyTGVmdCcsIHRoaXMub25Ib3ZlckxlZnQpO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignb25PcHRpb25OZXh0JywgdGhpcy5vbk9wdGlvbk5leHQpO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignb25PcHRpb25QcmV2aW91cycsIHRoaXMub25PcHRpb25QcmV2aW91cyk7XHJcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdvbk9wdGdyb3VwTmV4dCcsIHRoaXMub25PcHRncm91cE5leHQpO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignb25PcHRncm91cFByZXZpb3VzJywgdGhpcy5vbk9wdGdyb3VwUHJldmlvdXMpO1xyXG5cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBlbnRpdHkgcmVzdW1lcy5cclxuICAgKiBVc2UgdG8gY29udGludWUgb3IgYWRkIGFueSBkeW5hbWljIG9yIGJhY2tncm91bmQgYmVoYXZpb3Igc3VjaCBhcyBldmVudHMuXHJcbiAgICovXHJcbiAgcGxheTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGVudGl0eSBwYXVzZXMuXHJcbiAgICogVXNlIHRvIHN0b3Agb3IgcmVtb3ZlIGFueSBkeW5hbWljIG9yIGJhY2tncm91bmQgYmVoYXZpb3Igc3VjaCBhcyBldmVudHMuXHJcbiAgICovXHJcbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGNvbXBvbmVudCBpcyByZW1vdmVkIChlLmcuLCB2aWEgcmVtb3ZlQXR0cmlidXRlKS5cclxuICAgKiBHZW5lcmFsbHkgdW5kb2VzIGFsbCBtb2RpZmljYXRpb25zIHRvIHRoZSBlbnRpdHkuXHJcbiAgICovXHJcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgb25BeGlzTW92ZTogZnVuY3Rpb24gKGV2dCkgeyAgICAgICAvLyBtZW51OiB1c2VkIGZvciBkZXRlcm1pbmluZyBjdXJyZW50IGF4aXMgb2YgdHJhY2twYWQgaG92ZXIgcG9zaXRpb25cclxuICAgIGlmIChldnQudGFyZ2V0LmlkICE9IHRoaXMuZGF0YS5jb250cm9sbGVySUQpIHsgICAvL21lbnU6IG9ubHkgZGVhbCB3aXRoIHRyYWNrcGFkIGV2ZW50cyBmcm9tIHJpZ2h0IGNvbnRyb2xsZXJcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG9ubHkgcnVuIHRoaXMgZnVuY3Rpb24gaWYgdGhlcmUgaXMgc29tZSB2YWx1ZSBmb3IgYXQgbGVhc3Qgb25lIGF4aXNcclxuICAgIGlmIChldnQuZGV0YWlsLmF4aXNbMF0gPT09IDAgJiYgZXZ0LmRldGFpbC5heGlzWzFdID09PSAwKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaXNPY3VsdXMgPSBmYWxzZTtcclxuICAgIHZhciBnYW1lcGFkcyA9IG5hdmlnYXRvci5nZXRHYW1lcGFkcygpO1xyXG4gICAgaWYgKGdhbWVwYWRzKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2FtZXBhZHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgZ2FtZXBhZCA9IGdhbWVwYWRzW2ldO1xyXG4gICAgICAgIGlmIChnYW1lcGFkKSB7XHJcbiAgICAgICAgICBpZiAoZ2FtZXBhZC5pZC5pbmRleE9mKCdPY3VsdXMgVG91Y2gnKSA9PT0gMCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImlzT2N1bHVzXCIpO1xyXG4gICAgICAgICAgICBpc09jdWx1cyA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4vLyAgICBjb25zb2xlLmxvZyhcImF4aXNbMF06IFwiICsgZXZ0LmRldGFpbC5heGlzWzBdICsgXCIgbGVmdCAtMTsgcmlnaHQgKzFcIik7XHJcbi8vICAgIGNvbnNvbGUubG9nKFwiYXhpc1sxXTogXCIgKyBldnQuZGV0YWlsLmF4aXNbMV0gKyBcIiBkb3duIC0xOyB1cCArMVwiKTtcclxuLy8gICAgY29uc29sZS5sb2coZXZ0LnRhcmdldC5pZCk7XHJcblxyXG4gICAgLy8gd2hpY2ggYXhpcyBoYXMgbGFyZ2VzdCBhYnNvbHV0ZSB2YWx1ZT8gdGhlbiB1c2UgdGhhdCBheGlzIHZhbHVlIHRvIGRldGVybWluZSBob3ZlciBwb3NpdGlvblxyXG4vLyAgICBjb25zb2xlLmxvZyhldnQuZGV0YWlsLmF4aXNbMF0pO1xyXG4gICAgaWYgKE1hdGguYWJzKGV2dC5kZXRhaWwuYXhpc1swXSkgPiBNYXRoLmFicyhldnQuZGV0YWlsLmF4aXNbMV0pKSB7IC8vIGlmIHggYXhpcyBhYnNvbHV0ZSB2YWx1ZSAobGVmdC9yaWdodCkgaXMgZ3JlYXRlciB0aGFuIHkgYXhpcyAoZG93bi91cClcclxuICAgICAgaWYgKGV2dC5kZXRhaWwuYXhpc1swXSA+IDApIHsgLy8gaWYgdGhlIHJpZ2h0IGF4aXMgaXMgZ3JlYXRlciB0aGFuIDAgKG1pZHBvaW50KVxyXG4gICAgICAgIHRoaXMub25Ib3ZlclJpZ2h0KCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5vbkhvdmVyTGVmdCgpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgaWYgKGlzT2N1bHVzKSB7XHJcbiAgICAgICAgdmFyIHlBeGlzID0gLWV2dC5kZXRhaWwuYXhpc1sxXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgeUF4aXMgPSBldnQuZGV0YWlsLmF4aXNbMV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh5QXhpcyA+IDApIHsgLy8gaWYgdGhlIHVwIGF4aXMgaXMgZ3JlYXRlciB0aGFuIDAgKG1pZHBvaW50KVxyXG4gICAgICAgIHRoaXMub25Ib3ZlclVwKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5vbkhvdmVyRG93bigpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgdXNpbmcgdGhlIG9jdWx1cyB0b3VjaCBjb250cm9scywgYW5kIHRodW1ic3RpY2sgaXMgPjg1JSBpbiBhbnkgZGlyZWN0aW9uIHRoZW4gZmlyZSBvbnRyYWNrcGFkZG93blxyXG4gICAgdmFyIGdhbWVwYWRzID0gbmF2aWdhdG9yLmdldEdhbWVwYWRzKCk7XHJcbiAgICBpZiAoZ2FtZXBhZHMpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lcGFkcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBnYW1lcGFkID0gZ2FtZXBhZHNbaV07XHJcbiAgICAgICAgaWYgKGdhbWVwYWQpIHtcclxuICAgICAgICAgIGlmIChnYW1lcGFkLmlkLmluZGV4T2YoJ09jdWx1cyBUb3VjaCcpID09PSAwKSB7XHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhldnQuZGV0YWlsLmF4aXNbMF0pID4gMC44NSB8fCBNYXRoLmFicyhldnQuZGV0YWlsLmF4aXNbMV0pID4gMC44NSkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBkZWJvdW5jZSAodGhyb3R0bGUpIHN1Y2ggdGhhdCB0aGlzIG9ubHkgcnVucyBvbmNlIGV2ZXJ5IDEvMiBzZWNvbmQgbWF4XHJcbiAgICAgICAgICAgICAgdmFyIHRoaXNUaW1lID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgICBpZiAoIE1hdGguZmxvb3IodGhpc1RpbWUgLSB0aGlzLmRhdGEubGFzdFRpbWUpID4gNTAwICkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhLmxhc3RUaW1lID0gdGhpc1RpbWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uVHJhY2twYWREb3duKGV2dCk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgb25Ib3ZlclJpZ2h0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVsLmVtaXQoXCJtZW51SG92ZXJSaWdodFwiKTtcclxuICAgIHZhciBhcnJvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dSaWdodFwiKTtcclxuICAgIHZhciBjdXJyZW50QXJyb3dDb2xvciA9IG5ldyBUSFJFRS5Db2xvcihhcnJvdy5nZXRBdHRyaWJ1dGUoXCJtYXRlcmlhbFwiKS5jb2xvcik7XHJcbiAgICBpZiAoY3VycmVudEFycm93Q29sb3IuciA9PT0gMCkgeyAvLyBpZiBub3QgYWxyZWFkeSBzb21lIHNoYWRlIG9mIHllbGxvdyAod2hpY2ggaW5kaWNhdGVzIHJlY2VudCBidXR0b24gcHJlc3MpIHRoZW4gYW5pbWF0ZSBncmVlbiBob3ZlclxyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknKTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiIzAwRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG9uSG92ZXJMZWZ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVsLmVtaXQoXCJtZW51SG92ZXJMZWZ0XCIpO1xyXG4gICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0xlZnRcIik7XHJcbiAgICB2YXIgY3VycmVudEFycm93Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoYXJyb3cuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpO1xyXG4gICAgaWYgKGN1cnJlbnRBcnJvd0NvbG9yLnIgPT09IDApIHsgLy8gaWYgbm90IGFscmVhZHkgc29tZSBzaGFkZSBvZiB5ZWxsb3cgKHdoaWNoIGluZGljYXRlcyByZWNlbnQgYnV0dG9uIHByZXNzKSB0aGVuIGFuaW1hdGUgZ3JlZW4gaG92ZXJcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJyk7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5jb2xvcicsIGR1cjogNTAwLCBmcm9tOiBcIiMwMEZGMDBcIiwgdG86IFwiIzAwMDAwMFwiIH0pO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5vcGFjaXR5JywgZHVyOiA1MDAsIGZyb206IFwiMVwiLCB0bzogXCIwLjVcIiB9KTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBvbkhvdmVyRG93bjogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5lbC5lbWl0KFwibWVudUhvdmVyRG93blwiKTtcclxuICAgIHZhciBzZWxlY3RFbCA9IHRoaXMuZWw7XHJcbiAgICB2YXIgb3B0Z3JvdXBzID0gc2VsZWN0RWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRncm91cFwiKTsgIC8vIEdldCB0aGUgb3B0Z3JvdXBzXHJcblxyXG4gICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0Rvd25cIik7XHJcbiAgICB2YXIgY3VycmVudEFycm93Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoYXJyb3cuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpO1xyXG4gICAgaWYgKCAhKGN1cnJlbnRBcnJvd0NvbG9yLnIgPiAwICYmIGN1cnJlbnRBcnJvd0NvbG9yLmcgPiAwKSApIHsgLy8gaWYgbm90IGFscmVhZHkgc29tZSBzaGFkZSBvZiB5ZWxsb3cgKHdoaWNoIGluZGljYXRlcyByZWNlbnQgYnV0dG9uIHByZXNzKSB0aGVuIGFuaW1hdGUgZ3JlZW4gaG92ZXJcclxuICAgICAgaWYgKHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXggKyAyID4gb3B0Z3JvdXBzLmxlbmd0aCkge1xyXG4gICAgICAgIC8vIENBTidUIERPIC0gQUxSRUFEWSBBVCBFTkQgT0YgTElTVFxyXG4gICAgICAgIHZhciBhcnJvd0NvbG9yID0gXCIjRkYwMDAwXCI7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGFycm93Q29sb3IgPSBcIiMwMEZGMDBcIjtcclxuICAgICAgfVxyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknKTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IGFycm93Q29sb3IsIHRvOiBcIiMwMDAwMDBcIiB9KTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgb25Ib3ZlclVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVsLmVtaXQoXCJtZW51SG92ZXJVcFwiKTtcclxuICAgIHZhciBzZWxlY3RFbCA9IHRoaXMuZWw7XHJcbiAgICB2YXIgb3B0Z3JvdXBzID0gc2VsZWN0RWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRncm91cFwiKTsgIC8vIEdldCB0aGUgb3B0Z3JvdXBzXHJcblxyXG4gICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1VwXCIpO1xyXG4gICAgdmFyIGN1cnJlbnRBcnJvd0NvbG9yID0gbmV3IFRIUkVFLkNvbG9yKGFycm93LmdldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIpLmNvbG9yKTtcclxuICAgIGlmICggIShjdXJyZW50QXJyb3dDb2xvci5yID4gMCAmJiBjdXJyZW50QXJyb3dDb2xvci5nID4gMCkgKSB7IC8vIGlmIG5vdCBhbHJlYWR5IHNvbWUgc2hhZGUgb2YgeWVsbG93ICh3aGljaCBpbmRpY2F0ZXMgcmVjZW50IGJ1dHRvbiBwcmVzcykgdGhlbiBhbmltYXRlIGdyZWVuIGhvdmVyXHJcbiAgICAgIGlmICh0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4IC0gMSA8IDApIHtcclxuICAgICAgICAgLy8gQ0FOJ1QgRE8gLSBBTFJFQURZIEFUIEVORCBPRiBMSVNUXHJcbiAgICAgICAgIHZhciBhcnJvd0NvbG9yID0gXCIjRkYwMDAwXCI7XHJcbiAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICB2YXIgYXJyb3dDb2xvciA9IFwiIzAwRkYwMFwiO1xyXG4gICAgICAgfVxyXG4gICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJyk7XHJcbiAgICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScpO1xyXG4gICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IGFycm93Q29sb3IsIHRvOiBcIiMwMDAwMDBcIiB9KTtcclxuICAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG9uT3B0aW9uTmV4dDogZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgdGhpcy5vbk9wdGlvblN3aXRjaChcIm5leHRcIik7XHJcbiAgfSxcclxuXHJcbiAgb25PcHRpb25QcmV2aW91czogZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgdGhpcy5vbk9wdGlvblN3aXRjaChcInByZXZpb3VzXCIpO1xyXG4gIH0sXHJcblxyXG4gIG9uT3B0Z3JvdXBOZXh0OiBmdW5jdGlvbihldnQpIHtcclxuICAgIHZhciBzZWxlY3RFbCA9IHRoaXMuZWw7XHJcbiAgICB2YXIgb3B0Z3JvdXBzID0gc2VsZWN0RWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRncm91cFwiKTsgIC8vIEdldCB0aGUgb3B0Z3JvdXBzXHJcbiAgICB2YXIgc2VsZWN0UmVuZGVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlbGVjdFJlbmRlclwiKTtcclxuXHJcbiAgICBpZiAodGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCArIDIgPiBvcHRncm91cHMubGVuZ3RoKSB7XHJcbiAgICAgIC8vIENBTidUIERPIFRISVMsIHNob3cgcmVkIGFycm93XHJcbiAgICAgIHZhciBhcnJvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dEb3duXCIpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJyk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5jb2xvcicsIGR1cjogNTAwLCBmcm9tOiBcIiNGRjAwMDBcIiwgdG86IFwiIzAwMDAwMFwiIH0pO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5vcGFjaXR5JywgZHVyOiA1MDAsIGZyb206IFwiMVwiLCB0bzogXCIwLjVcIiB9KTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJywgeyBwcm9wZXJ0eTogJ3NjYWxlJywgZHVyOiA1MDAsIGZyb206IFwiLTAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIi0wLjAwNCAwLjAwMiAwLjAwNFwiIH0pO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIENBTiBETyBUSElTLCBzaG93IG5leHQgb3B0Z3JvdXBcclxuXHJcbiAgICAgIHRoaXMucmVtb3ZlU2VsZWN0T3B0aW9uc1Jvdyh0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4KTsgLy8gcmVtb3ZlIHRoZSBvbGQgb3B0Z3JvdXAgcm93XHJcblxyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4ICs9IDE7XHJcbiAgICAgIHZhciBzZWxlY3RlZE9wdGdyb3VwRWwgPSBvcHRncm91cHNbdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleF07ICAvLyBmZXRjaCB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9wdGdyb3VwXHJcbiAgICAgIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwVmFsdWUgPSBzZWxlY3RlZE9wdGdyb3VwRWwuZ2V0QXR0cmlidXRlKFwidmFsdWVcIik7IC8vIHNldCBjb21wb25lbnQgcHJvcGVydHkgdG8gb3Bncm91cCB2YWx1ZVxyXG5cclxuICAgICAgdGhpcy5lbC5mbHVzaFRvRE9NKCk7XHJcblxyXG4gICAgICB2YXIgbmV4dFNlbGVjdGVkT3B0Z3JvdXBFbCA9IG9wdGdyb3Vwc1t0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4XTsgIC8vIGZldGNoIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgb3B0Z3JvdXBcclxuICAgICAgLy8gdGhpcy5tYWtlU2VsZWN0T3B0aW9uc1JvdyhuZXh0U2VsZWN0ZWRPcHRncm91cEVsLCBzZWxlY3RSZW5kZXJFbCwgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCwgLTAuMTUpO1xyXG4gICAgICB0aGlzLm1ha2VTZWxlY3RPcHRpb25zUm93KG5leHRTZWxlY3RlZE9wdGdyb3VwRWwsIHNlbGVjdFJlbmRlckVsLCB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4KTtcclxuXHJcbiAgICAgIC8vIENoYW5nZSBzZWxlY3RlZCBvcHRpb24gZWxlbWVudCB3aGVuIG9wdGdyb3VwIGlzIGNoYW5nZWRcclxuICAgICAgdmFyIHNlbGVjdE9wdGlvbnNSb3dFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWxlY3RPcHRpb25zUm93JyArIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXgpO1xyXG4gICAgICB2YXIgbmV3bHlTZWxlY3RlZE1lbnVFbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzZWxlY3RlZCcpWzBdO1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHNlbGVjdE9wdGlvbnNWYWx1ZSBhbmQgSW5kZXhcclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uVmFsdWUgPSBuZXdseVNlbGVjdGVkTWVudUVsLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpO1xyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRpb25JbmRleCA9IG5ld2x5U2VsZWN0ZWRNZW51RWwuZ2V0QXR0cmlidXRlKFwib3B0aW9uaWRcIik7XHJcblxyXG4gICAgICB0aGlzLmVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuZW1pdChcIm1lbnVPcHRncm91cE5leHRcIik7XHJcbiAgICAgIHRoaXMuZWwuZW1pdChcIm1lbnVDaGFuZ2VkXCIpO1xyXG5cclxuICAgICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0Rvd25cIik7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnKTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnLCB7IHByb3BlcnR5OiAnc2NhbGUnLCBkdXI6IDUwMCwgZnJvbTogXCItMC4wMDYgMC4wMDMgMC4wMDZcIiwgdG86IFwiLTAuMDA0IDAuMDAyIDAuMDA0XCIgfSk7XHJcbiAgICB9XHJcblxyXG4gIH0sXHJcblxyXG4gIG9uT3B0Z3JvdXBQcmV2aW91czogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICB2YXIgc2VsZWN0RWwgPSB0aGlzLmVsO1xyXG4gICAgdmFyIG9wdGdyb3VwcyA9IHNlbGVjdEVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwib3B0Z3JvdXBcIik7ICAvLyBHZXQgdGhlIG9wdGdyb3Vwc1xyXG4gICAgdmFyIHNlbGVjdFJlbmRlckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWxlY3RSZW5kZXJcIik7XHJcblxyXG4gICAgaWYgKHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXggLSAxIDwgMCkge1xyXG4gICAgICAvLyBDQU4nVCBETyBUSElTLCBzaG93IHJlZCBhcnJvd1xyXG4gICAgICB2YXIgYXJyb3cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93VXBcIik7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnKTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGMDAwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnLCB7IHByb3BlcnR5OiAnc2NhbGUnLCBkdXI6IDUwMCwgZnJvbTogXCIwLjAwNiAwLjAwMyAwLjAwNlwiLCB0bzogXCIwLjAwNCAwLjAwMiAwLjAwNFwiIH0pO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIENBTiBETyBUSElTLCBzaG93IHByZXZpb3VzIG9wdGdyb3VwXHJcblxyXG4gICAgICB0aGlzLnJlbW92ZVNlbGVjdE9wdGlvbnNSb3codGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCk7IC8vIHJlbW92ZSB0aGUgb2xkIG9wdGdyb3VwIHJvd1xyXG5cclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCAtPSAxO1xyXG4gICAgICB2YXIgc2VsZWN0ZWRPcHRncm91cEVsID0gb3B0Z3JvdXBzW3RoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXhdOyAgLy8gZmV0Y2ggdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBvcHRncm91cFxyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cFZhbHVlID0gc2VsZWN0ZWRPcHRncm91cEVsLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpOyAvLyBzZXQgY29tcG9uZW50IHByb3BlcnR5IHRvIG9wZ3JvdXAgdmFsdWVcclxuXHJcbiAgICAgIHRoaXMuZWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgdmFyIG5leHRTZWxlY3RlZE9wdGdyb3VwRWwgPSBvcHRncm91cHNbdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleF07ICAvLyBmZXRjaCB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9wdGdyb3VwXHJcbiAgICAgIC8vIHRoaXMubWFrZVNlbGVjdE9wdGlvbnNSb3cobmV4dFNlbGVjdGVkT3B0Z3JvdXBFbCwgc2VsZWN0UmVuZGVyRWwsIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXgsIC0wLjE1KTtcclxuICAgICAgdGhpcy5tYWtlU2VsZWN0T3B0aW9uc1JvdyhuZXh0U2VsZWN0ZWRPcHRncm91cEVsLCBzZWxlY3RSZW5kZXJFbCwgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCk7XHJcblxyXG4gICAgICAvLyBDaGFuZ2Ugc2VsZWN0ZWQgb3B0aW9uIGVsZW1lbnQgd2hlbiBvcHRncm91cCBpcyBjaGFuZ2VkXHJcbiAgICAgIHZhciBzZWxlY3RPcHRpb25zUm93RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VsZWN0T3B0aW9uc1JvdycgKyB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4KTtcclxuICAgICAgdmFyIG5ld2x5U2VsZWN0ZWRNZW51RWwgPSBzZWxlY3RPcHRpb25zUm93RWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2VsZWN0ZWQnKVswXTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSBzZWxlY3RPcHRpb25zVmFsdWUgYW5kIEluZGV4XHJcbiAgICAgIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGlvblZhbHVlID0gbmV3bHlTZWxlY3RlZE1lbnVFbC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKTtcclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uSW5kZXggPSBuZXdseVNlbGVjdGVkTWVudUVsLmdldEF0dHJpYnV0ZShcIm9wdGlvbmlkXCIpO1xyXG5cclxuICAgICAgdGhpcy5lbC5mbHVzaFRvRE9NKCk7XHJcblxyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51T3B0Z3JvdXBOZXh0XCIpO1xyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51Q2hhbmdlZFwiKTtcclxuXHJcbiAgICAgIHZhciBhcnJvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dVcFwiKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJyk7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScpO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwuY29sb3InLCBkdXI6IDUwMCwgZnJvbTogXCIjRkZGRjAwXCIsIHRvOiBcIiMwMDAwMDBcIiB9KTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiBcIjAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIjAuMDA0IDAuMDAyIDAuMDA0XCIgfSk7XHJcbiAgICB9XHJcblxyXG4gIH0sXHJcblxyXG4gIG9uVHJhY2twYWREb3duOiBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICAvL21lbnU6IG9ubHkgZGVhbCB3aXRoIHRyYWNrcGFkIGV2ZW50cyBmcm9tIGNvbnRyb2xsZXIgc3BlY2lmaWVkIGluIGNvbXBvbmVudCBwcm9wZXJ0eVxyXG4gICAgaWYgKGV2dC50YXJnZXQuaWQgIT0gdGhpcy5kYXRhLmNvbnRyb2xsZXJJRCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAvLyBXaGljaCBkaXJlY3Rpb24gc2hvdWxkIHRoZSB0cmFja3BhZCB0cmlnZ2VyP1xyXG5cclxuICAgIC8vIEVhY2ggb2YgdGhlIDQgYXJyb3cncyBncmVlbiBpbnRlbnNpdHkgaXMgaW52ZXJzZWx5IGNvcnJlbGF0ZWQgd2l0aCB0aW1lIGVsYXBzZWQgc2luY2UgbGFzdCBob3ZlciBldmVudCBvbiB0aGF0IGF4aXNcclxuICAgIC8vIFRvIGRldGVybWluZSB3aGljaCBkaXJlY3Rpb24gdG8gbW92ZSB1cG9uIGJ1dHRvbiBwcmVzcywgbW92ZSBpbiB0aGUgZGlyZWN0aW9uIHdpdGggdGhlIG1vc3QgZ3JlZW4gY29sb3IgaW50ZW5zaXR5XHJcblxyXG4gICAgLy8gRmV0Y2ggYWxsIDQgZ3JlZW4gdmFsdWVzIGFuZCBwbGFjZSBpbiBhbiBhcnJheSBzdGFydGluZyB3aXRoIHVwLCByaWdodCwgZG93biwgbGVmdCBhcnJvdyBjb2xvcnMgKGNsb2Nrd2lzZSBmcm9tIHRvcClcclxuICAgIHZhciBhcnJvd1VwQ29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1VwXCIpLmdldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIpLmNvbG9yKTtcclxuICAgIHZhciBhcnJvd1JpZ2h0Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1JpZ2h0XCIpLmdldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIpLmNvbG9yKTtcclxuICAgIHZhciBhcnJvd0Rvd25Db2xvciA9IG5ldyBUSFJFRS5Db2xvcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93RG93blwiKS5nZXRBdHRyaWJ1dGUoXCJtYXRlcmlhbFwiKS5jb2xvcik7XHJcbiAgICB2YXIgYXJyb3dMZWZ0Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0xlZnRcIikuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpO1xyXG4vLyAgICB2YXIgYXJyb3dDb2xvckFycmF5ID0gW2Fycm93VXBDb2xvciwgYXJyb3dSaWdodENvbG9yLCBhcnJvd0Rvd25Db2xvciwgYXJyb3dMZWZ0Q29sb3JdO1xyXG4gICAgdmFyIGFycm93Q29sb3JBcnJheUdyZWVuID0gW2Fycm93VXBDb2xvci5nLCBhcnJvd1JpZ2h0Q29sb3IuZywgYXJyb3dEb3duQ29sb3IuZywgYXJyb3dMZWZ0Q29sb3IuZ107XHJcblxyXG4gICAgaWYgKCBhcnJvd0NvbG9yQXJyYXlHcmVlbi5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSA+IDApIHsgLy8gaWYgYXQgbGVhc3Qgb25lIHZhbHVlIGlzID4gMFxyXG4gICAgICBzd2l0Y2ggKGluZGV4T2ZNYXgoYXJyb3dDb2xvckFycmF5R3JlZW4pKSB7ICAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIHZhbHVlIGluIHRoZSBhcnJheSBpcyB0aGUgbGFyZ2VzdFxyXG4gICAgICAgIGNhc2UgMDogICAgICAgIC8vIHVwXHJcbiAgICAgICAgICB0aGlzLm9uT3B0Z3JvdXBQcmV2aW91cygpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJQUkVTU3VwXCIpO1xyXG4gICAgICAgICAgcmV0dXJuOyAvLyB3aXRob3V0IHRoaXMgcmV0dXJuIHRoZSBvdGhlciBjYXNlcyBhcmUgZmlyZWQgLSB3ZWlyZCFcclxuICAgICAgICBjYXNlIDE6ICAgICAgICAvLyByaWdodFxyXG4gICAgICAgICAgdGhpcy5vbk9wdGlvblN3aXRjaChcIm5leHRcIik7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlBSRVNTcmlnaHRcIik7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY2FzZSAyOiAgICAgICAgLy8gZG93blxyXG4gICAgICAgICAgdGhpcy5vbk9wdGdyb3VwTmV4dCgpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJQUkVTU2Rvd25cIik7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY2FzZSAzOiAgICAgICAgLy8gbGVmdFxyXG4gICAgICAgICAgdGhpcy5vbk9wdGlvblN3aXRjaChcInByZXZpb3VzXCIpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJQUkVTU2xlZnRcIik7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfSxcclxuXHJcbiAgb25PcHRpb25Td2l0Y2g6IGZ1bmN0aW9uIChkaXJlY3Rpb24pIHtcclxuXHJcbiAgICAvLyBTd2l0Y2ggdG8gdGhlIG5leHQgb3B0aW9uLCBvciBzd2l0Y2ggaW4gdGhlIGRpcmVjdGlvbiBvZiB0aGUgbW9zdCByZWNlbnRseSBob3ZlcmVkIGRpcmVjdGlvbmFsIGFycm93XHJcbiAgICAvLyBtZW51OiBzYXZlIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgbWVudSBlbGVtZW50XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImRpcmVjdGlvbj9cIik7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhkaXJlY3Rpb24pO1xyXG4gICAgdmFyIHNlbGVjdE9wdGlvbnNSb3dFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWxlY3RPcHRpb25zUm93JyArIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXgpO1xyXG5cclxuICAgIGNvbnN0IG9sZE1lbnVFbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzZWxlY3RlZCcpWzBdO1xyXG4gICAgLy8gY29uc29sZS5sb2cob2xkTWVudUVsKTtcclxuXHJcbiAgICB2YXIgb2xkU2VsZWN0ZWRPcHRpb25JbmRleCA9IHBhcnNlSW50KG9sZE1lbnVFbC5nZXRBdHRyaWJ1dGUoXCJvcHRpb25pZFwiKSk7XHJcbiAgICB2YXIgc2VsZWN0ZWRPcHRpb25JbmRleCA9IG9sZFNlbGVjdGVkT3B0aW9uSW5kZXg7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhzZWxlY3RlZE9wdGlvbkluZGV4KTtcclxuXHJcbiAgICB2YXIgc2VsZWN0RWwgPSB0aGlzLmVsOyAgLy8gUmVmZXJlbmNlIHRvIHRoZSBjb21wb25lbnQncyBlbnRpdHkuXHJcbiAgICB2YXIgb3B0Z3JvdXBzID0gc2VsZWN0RWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRncm91cFwiKTsgIC8vIEdldCB0aGUgb3B0Z3JvdXBzXHJcbiAgICB2YXIgc2VsZWN0ZWRPcHRncm91cEVsID0gb3B0Z3JvdXBzW3RoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXhdOyAgLy8gZmV0Y2ggdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBvcHRncm91cFxyXG5cclxuICAgIGlmIChkaXJlY3Rpb24gPT0gJ3ByZXZpb3VzJykge1xyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51UHJldmlvdXNcIik7XHJcbiAgICAgIC8vIFBSRVZJT1VTIE9QVElPTiBNRU5VIFNUQVJUID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgICAgc2VsZWN0ZWRPcHRpb25JbmRleCA9IGxvb3BJbmRleChzZWxlY3RlZE9wdGlvbkluZGV4IC09IDEsIHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZEVsZW1lbnRDb3VudCk7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKHNlbGVjdGVkT3B0aW9uSW5kZXgpO1xyXG5cclxuICAgICAgLy8gbWVudTogYW5pbWF0ZSBhcnJvdyBMRUZUXHJcbiAgICAgIHZhciBhcnJvd0xlZnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93TGVmdFwiKTtcclxuICAgICAgYXJyb3dMZWZ0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvd0xlZnQucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknKTtcclxuICAgICAgYXJyb3dMZWZ0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScpO1xyXG4gICAgICBhcnJvd0xlZnQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93TGVmdC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5vcGFjaXR5JywgZHVyOiA1MDAsIGZyb206IFwiMVwiLCB0bzogXCIwLjVcIiB9KTtcclxuICAgICAgYXJyb3dMZWZ0LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiBcIjAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIjAuMDA0IDAuMDAyIDAuMDA0XCIgfSk7XHJcblxyXG4gICAgICAvLyBtZW51OiBnZXQgdGhlIG5ld2x5IHNlbGVjdGVkIG1lbnUgZWxlbWVudFxyXG4gICAgICBjb25zdCBuZXdNZW51RWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBzZWxlY3RlZE9wdGlvbkluZGV4ICsgXCInXVwiKVswXTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IHJlbW92ZSBzZWxlY3RlZCBjbGFzcyBhbmQgY2hhbmdlIGNvbG9yc1xyXG4gICAgICBvbGRNZW51RWwuY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkXCIpO1xyXG4gICAgICBuZXdNZW51RWwuY2xhc3NMaXN0LmFkZChcInNlbGVjdGVkXCIpO1xyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRpb25WYWx1ZSA9IG5ld01lbnVFbC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKTtcclxuICAgICAgY29uc29sZS5sb2codGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uVmFsdWUpO1xyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRpb25JbmRleCA9IHNlbGVjdGVkT3B0aW9uSW5kZXg7XHJcbiAgICAgIHRoaXMuZWwuZmx1c2hUb0RPTSgpO1xyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51Q2hhbmdlZFwiKTtcclxuICAgICAgb2xkTWVudUVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAnZ3JheScpO1xyXG4gICAgICBuZXdNZW51RWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm9iamVjdE5hbWVcIilbMF0uc2V0QXR0cmlidXRlKCdibWZvbnQtdGV4dCcsICdjb2xvcicsICd5ZWxsb3cnKTtcclxuICAgICAgb2xkTWVudUVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJwcmV2aWV3RnJhbWVcIilbMF0uc2V0QXR0cmlidXRlKCdtYXRlcmlhbCcsICdjb2xvcicsICcjMjIyMjIyJyk7XHJcbiAgICAgIG5ld01lbnVFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJldmlld0ZyYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCAnY29sb3InLCAneWVsbG93Jyk7XHJcblxyXG4gICAgICAvLyBtZW51OiBzbGlkZSB0aGUgbWVudSBsaXN0IHJvdyBSSUdIVCBieSAxXHJcbi8vICAgICAgY29uc3Qgc2VsZWN0T3B0aW9uc1Jvd0VsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZWxlY3RPcHRpb25zUm93XCIpO1xyXG4gICAgICAvLyB1c2UgdGhlIGRlc2lyZWRQb3NpdGlvbiBhdHRyaWJ1dGUgKGlmIGV4aXN0cykgaW5zdGVhZCBvZiBvYmplY3QzRCBwb3NpdGlvbiBhcyBhbmltYXRpb24gbWF5IG5vdCBiZSBkb25lIHlldFxyXG4gICAgICBpZiAoc2VsZWN0T3B0aW9uc1Jvd0VsLmhhc0F0dHJpYnV0ZShcImRlc2lyZWRQb3NpdGlvblwiKSkge1xyXG4gICAgICAgIHZhciBvbGRQb3NpdGlvbiA9IHNlbGVjdE9wdGlvbnNSb3dFbC5nZXRBdHRyaWJ1dGUoXCJkZXNpcmVkUG9zaXRpb25cIik7XHJcbiAgICAgICAgdmFyIG5ld1ggPSBwYXJzZUZsb2F0KG9sZFBvc2l0aW9uLnNwbGl0KFwiIFwiKVswXSkgKyAwLjA3NTtcclxuICAgICAgICB2YXIgbmV3UG9zaXRpb25TdHJpbmcgPSBuZXdYLnRvU3RyaW5nKCkgKyBcIiBcIiArIG9sZFBvc2l0aW9uLnNwbGl0KFwiIFwiKVsxXSArIFwiIFwiICsgb2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzJdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBvbGRQb3NpdGlvbiA9IHNlbGVjdE9wdGlvbnNSb3dFbC5vYmplY3QzRC5wb3NpdGlvbjtcclxuICAgICAgICB2YXIgbmV3WCA9IG9sZFBvc2l0aW9uLnggKyAwLjA3NTsgLy8gdGhpcyBjb3VsZCBiZSBhIHZhcmlhYmxlIGF0IHRoZSBjb21wb25lbnQgbGV2ZWxcclxuICAgICAgICB2YXIgbmV3UG9zaXRpb25TdHJpbmcgPSBuZXdYLnRvU3RyaW5nKCkgKyBcIiBcIiArIG9sZFBvc2l0aW9uLnkgKyBcIiBcIiArIG9sZFBvc2l0aW9uLno7XHJcbiAgICAgIH1cclxuICAgICAgc2VsZWN0T3B0aW9uc1Jvd0VsLnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zbGlkZScpO1xyXG4gICAgICBzZWxlY3RPcHRpb25zUm93RWwuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX3NsaWRlJywgeyBwcm9wZXJ0eTogJ3Bvc2l0aW9uJywgZHVyOiA1MDAsIGZyb206IG9sZFBvc2l0aW9uLCB0bzogbmV3UG9zaXRpb25TdHJpbmcgfSk7XHJcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5zZXRBdHRyaWJ1dGUoJ2Rlc2lyZWRQb3NpdGlvbicsIG5ld1Bvc2l0aW9uU3RyaW5nKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IG1ha2UgdGhlIGhpZGRlbiBtb3N0IExFRlRtb3N0IG9iamVjdCAoLTMgZnJvbSBvbGRNZW51RWwgaW5kZXgpIHZpc2libGVcclxuICAgICAgdmFyIG5ld2x5VmlzaWJsZU9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggLSAzLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlWaXNpYmxlT3B0aW9uRWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBuZXdseVZpc2libGVPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcblxyXG4gICAgICAvLyBtYWtlIHZpc2libGUgYW5kIGFuaW1hdGVcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywndHJ1ZScpO1xyXG4gICAgICBuZXdseVZpc2libGVPcHRpb25FbC5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbicpO1xyXG4gICAgICBuZXdseVZpc2libGVPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbicsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiAnMC41IDAuNSAwLjUnLCB0bzogJzEuMCAxLjAgMS4wJyB9KTtcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgLy8gbWVudTogZGVzdHJveSB0aGUgaGlkZGVuIG1vc3QgUklHSFRtb3N0IG9iamVjdCAoKzMgZnJvbSBvbGRNZW51RWwgaW5kZXgpXHJcbiAgICAgIHZhciBuZXdseVJlbW92ZWRPcHRpb25JbmRleCA9IGxvb3BJbmRleChvbGRTZWxlY3RlZE9wdGlvbkluZGV4ICsgMywgc2VsZWN0ZWRPcHRncm91cEVsLmNoaWxkRWxlbWVudENvdW50KTtcclxuICAgICAgdmFyIG5ld2x5UmVtb3ZlZE9wdGlvbkVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbb3B0aW9uaWQ9J1wiICsgbmV3bHlSZW1vdmVkT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xyXG4gICAgICBuZXdseVJlbW92ZWRPcHRpb25FbC5mbHVzaFRvRE9NKCk7XHJcbiAgICAgIG5ld2x5UmVtb3ZlZE9wdGlvbkVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobmV3bHlSZW1vdmVkT3B0aW9uRWwpO1xyXG5cclxuICAgICAgLy8gbWVudTogbWFrZSB0aGUgc2Vjb25kIFJJR0hUbW9zdCBvYmplY3QgKCsyIGZyb20gb2xkTWVudUVsIGluZGV4KSBpbnZpc2libGVcclxuICAgICAgdmFyIG5ld2x5SW52aXNpYmxlT3B0aW9uSW5kZXggPSBsb29wSW5kZXgob2xkU2VsZWN0ZWRPcHRpb25JbmRleCArIDIsIHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZEVsZW1lbnRDb3VudCk7XHJcbiAgICAgIHZhciBuZXdseUludmlzaWJsZU9wdGlvbkVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbb3B0aW9uaWQ9J1wiICsgbmV3bHlJbnZpc2libGVPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcbiAgICAgIG5ld2x5SW52aXNpYmxlT3B0aW9uRWwuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywgJ2ZhbHNlJyk7XHJcbiAgICAgIG5ld2x5SW52aXNpYmxlT3B0aW9uRWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgLy8gbWVudTogQ3JlYXRlIHRoZSBuZXh0IExFRlRtb3N0IG9iamVjdCBwcmV2aWV3ICgtNCBmcm9tIG9sZE1lbnVFbCBpbmRleCkgYnV0IGtlZXAgaXQgaGlkZGVuIHVudGlsIGl0J3MgbmVlZGVkXHJcbiAgICAgIHZhciBuZXdseUNyZWF0ZWRPcHRpb25FbCA9IG5ld2x5VmlzaWJsZU9wdGlvbkVsLmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgbmV3bHlDcmVhdGVkT3B0aW9uRWwuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywgJ2ZhbHNlJyk7XHJcbiAgICAgIHZhciBuZXdseUNyZWF0ZWRPcHRpb25JbmRleCA9IGxvb3BJbmRleChvbGRTZWxlY3RlZE9wdGlvbkluZGV4IC0gNCwgc2VsZWN0ZWRPcHRncm91cEVsLmNoaWxkRWxlbWVudENvdW50KTtcclxuXHJcbiAgICAgIC8vIGdldCB0aGUgYWN0dWFsIFwib3B0aW9uXCIgZWxlbWVudCB0aGF0IGlzIHRoZSBzb3VyY2Ugb2YgdHJ1dGggZm9yIHZhbHVlLCBpbWFnZSBzcmMgYW5kIGxhYmVsIHNvIHRoYXQgd2UgY2FuIHBvcHVsYXRlIHRoZSBuZXcgbWVudSBvcHRpb25cclxuICAgICAgdmFyIHNvdXJjZU9wdGlvbkVsID0gc2VsZWN0ZWRPcHRncm91cEVsLmNoaWxkcmVuW25ld2x5Q3JlYXRlZE9wdGlvbkluZGV4XTtcclxuXHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLnNldEF0dHJpYnV0ZSgnb3B0aW9uaWQnLCBuZXdseUNyZWF0ZWRPcHRpb25JbmRleCk7XHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLnNldEF0dHJpYnV0ZSgnaWQnLCAnbWVudScgKyBuZXdseUNyZWF0ZWRPcHRpb25JbmRleCk7XHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLnNldEF0dHJpYnV0ZSgndmFsdWUnLCBzb3VyY2VPcHRpb25FbC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKSk7XHJcblxyXG4gICAgICB2YXIgbmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24gPSBuZXdseVZpc2libGVPcHRpb25FbC5vYmplY3QzRC5wb3NpdGlvbjtcclxuICAgICAgbmV3bHlDcmVhdGVkT3B0aW9uRWwuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIChuZXdseVZpc2libGVPcHRpb25Qb3NpdGlvbi54IC0gMC4wNzUpICsgXCIgXCIgKyBuZXdseVZpc2libGVPcHRpb25Qb3NpdGlvbi55ICsgXCIgXCIgKyBuZXdseVZpc2libGVPcHRpb25Qb3NpdGlvbi56KTtcclxuICAgICAgbmV3bHlDcmVhdGVkT3B0aW9uRWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgLy8gbWVudTogYWRkIHRoZSBuZXdseSBjbG9uZWQgYW5kIG1vZGlmaWVkIG1lbnUgb2JqZWN0IHByZXZpZXcgdG8gdGhlIGRvbVxyXG4gICAgICBzZWxlY3RPcHRpb25zUm93RWwuaW5zZXJ0QmVmb3JlKCBuZXdseUNyZWF0ZWRPcHRpb25FbCwgc2VsZWN0T3B0aW9uc1Jvd0VsLmZpcnN0Q2hpbGQgKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IGdldCBjaGlsZCBlbGVtZW50cyBmb3IgaW1hZ2UgYW5kIG5hbWUsIHBvcHVsYXRlIGJvdGggYXBwcm9wcmlhdGVseVxyXG4gICAgICB2YXIgYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5xdWVyeVNlbGVjdG9yQWxsKFwiW29wdGlvbmlkPSdcIiArIG5ld2x5Q3JlYXRlZE9wdGlvbkluZGV4ICsgXCInXVwiKVswXTtcclxuICAgICAgYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJldmlld0ltYWdlXCIpWzBdLnNldEF0dHJpYnV0ZSgnc3JjJywgc291cmNlT3B0aW9uRWwuZ2V0QXR0cmlidXRlKFwic3JjXCIpKVxyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAndGV4dCcsIHNvdXJjZU9wdGlvbkVsLnRleHQpO1xyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAnIzc0NzQ3NCcpO1xyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAvLyBQUkVWSU9VUyBPUFRJT04gTUVOVSBFTkQgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZWwuZW1pdChcIm1lbnVOZXh0XCIpO1xyXG4gICAgICAvLyBORVhUIE9QVElPTiBNRU5VIFNUQVJUID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgICAgc2VsZWN0ZWRPcHRpb25JbmRleCA9IGxvb3BJbmRleChzZWxlY3RlZE9wdGlvbkluZGV4ICs9IDEsIHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZEVsZW1lbnRDb3VudCk7XHJcblxyXG4gICAgICAvLyBtZW51OiBhbmltYXRlIGFycm93IHJpZ2h0XHJcbiAgICAgIHZhciBhcnJvd1JpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1JpZ2h0XCIpO1xyXG4gICAgICBhcnJvd1JpZ2h0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvd1JpZ2h0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XHJcbiAgICAgIGFycm93UmlnaHQucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJyk7XHJcbiAgICAgIGFycm93UmlnaHQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93UmlnaHQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XHJcbiAgICAgIGFycm93UmlnaHQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJywgeyBwcm9wZXJ0eTogJ3NjYWxlJywgZHVyOiA1MDAsIGZyb206IFwiLTAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIi0wLjAwNCAwLjAwMiAwLjAwNFwiIH0pO1xyXG5cclxuICAgICAgLy8gbWVudTogZ2V0IHRoZSBuZXdseSBzZWxlY3RlZCBtZW51IGVsZW1lbnRcclxuICAgICAgY29uc3QgbmV3TWVudUVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbb3B0aW9uaWQ9J1wiICsgc2VsZWN0ZWRPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcblxyXG4gICAgICAvLyBtZW51OiByZW1vdmUgc2VsZWN0ZWQgY2xhc3MgYW5kIGNoYW5nZSBjb2xvcnNcclxuICAgICAgb2xkTWVudUVsLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgbmV3TWVudUVsLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uVmFsdWUgPSBuZXdNZW51RWwuZ2V0QXR0cmlidXRlKFwidmFsdWVcIik7XHJcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZGF0YS5zZWxlY3RlZE9wdGlvblZhbHVlKTtcclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uSW5kZXggPSBzZWxlY3RlZE9wdGlvbkluZGV4O1xyXG4gICAgICB0aGlzLmVsLmZsdXNoVG9ET00oKTtcclxuICAgICAgdGhpcy5lbC5lbWl0KFwibWVudUNoYW5nZWRcIik7XHJcbiAgICAgIG9sZE1lbnVFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwib2JqZWN0TmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ2JtZm9udC10ZXh0JywgJ2NvbG9yJywgJ2dyYXknKTtcclxuICAgICAgbmV3TWVudUVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAneWVsbG93Jyk7XHJcbiAgICAgIG9sZE1lbnVFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJldmlld0ZyYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCAnY29sb3InLCAnIzIyMjIyMicpO1xyXG4gICAgICBuZXdNZW51RWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInByZXZpZXdGcmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ21hdGVyaWFsJywgJ2NvbG9yJywgJ3llbGxvdycpO1xyXG5cclxuICAgICAgLy8gbWVudTogc2xpZGUgdGhlIG1lbnUgbGlzdCBsZWZ0IGJ5IDFcclxuLy8gICAgICBjb25zdCBzZWxlY3RPcHRpb25zUm93RWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NlbGVjdE9wdGlvbnNSb3dcIik7XHJcbiAgICAgIC8vIHVzZSB0aGUgZGVzaXJlZFBvc2l0aW9uIGF0dHJpYnV0ZSAoaWYgZXhpc3RzKSBpbnN0ZWFkIG9mIG9iamVjdDNEIHBvc2l0aW9uIGFzIGFuaW1hdGlvbiBtYXkgbm90IGJlIGRvbmUgeWV0XHJcbiAgICAgIC8vIFRPRE8gLSBlcnJvciB3aXRoIHRoaXMgY29kZSB3aGVuIGxvb3BpbmcgdGhyb3VnaCBpbmRleFxyXG5cclxuLy8gICAgICBjb25zb2xlLmxvZyhcIid0cnVlJyBvbGQgcG9zaXRpb25cIik7XHJcbi8vICAgICAgY29uc29sZS5sb2coc2VsZWN0T3B0aW9uc1Jvd0VsLm9iamVjdDNELnBvc2l0aW9uKTtcclxuXHJcbiAgICAgIGlmIChzZWxlY3RPcHRpb25zUm93RWwuaGFzQXR0cmlidXRlKFwiZGVzaXJlZFBvc2l0aW9uXCIpKSB7XHJcbi8vICAgICAgICBjb25zb2xlLmxvZygnZGVzaXJlZFBvc2l0aW9uJyk7XHJcbiAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0gc2VsZWN0T3B0aW9uc1Jvd0VsLmdldEF0dHJpYnV0ZShcImRlc2lyZWRQb3NpdGlvblwiKTtcclxuLy8gICAgICAgIGNvbnNvbGUubG9nKG9sZFBvc2l0aW9uKTtcclxuICAgICAgICB2YXIgbmV3WCA9IHBhcnNlRmxvYXQob2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzBdKSAtIDAuMDc1O1xyXG4gICAgICAgIHZhciBuZXdQb3NpdGlvblN0cmluZyA9IG5ld1gudG9TdHJpbmcoKSArIFwiIFwiICsgb2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzFdICsgXCIgXCIgKyBvbGRQb3NpdGlvbi5zcGxpdChcIiBcIilbMl07XHJcbi8vICAgICAgICBjb25zb2xlLmxvZyhuZXdQb3NpdGlvblN0cmluZyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0gc2VsZWN0T3B0aW9uc1Jvd0VsLm9iamVjdDNELnBvc2l0aW9uO1xyXG4gICAgICAgIHZhciBuZXdYID0gb2xkUG9zaXRpb24ueCAtIDAuMDc1OyAvLyB0aGlzIGNvdWxkIGJlIGEgdmFyaWFibGUgc29vblxyXG4gICAgICAgIHZhciBuZXdQb3NpdGlvblN0cmluZyA9IG5ld1gudG9TdHJpbmcoKSArIFwiIFwiICsgb2xkUG9zaXRpb24ueSArIFwiIFwiICsgb2xkUG9zaXRpb24uejtcclxuLy8gICAgICAgIGNvbnNvbGUubG9nKG5ld1Bvc2l0aW9uU3RyaW5nKTtcclxuICAgICAgfVxyXG4gICAgICBzZWxlY3RPcHRpb25zUm93RWwucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX3NsaWRlJyk7XHJcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2xpZGUnLCB7IHByb3BlcnR5OiAncG9zaXRpb24nLCBkdXI6IDUwMCwgZnJvbTogb2xkUG9zaXRpb24sIHRvOiBuZXdQb3NpdGlvblN0cmluZyB9KTtcclxuICAgICAgc2VsZWN0T3B0aW9uc1Jvd0VsLnNldEF0dHJpYnV0ZSgnZGVzaXJlZFBvc2l0aW9uJywgbmV3UG9zaXRpb25TdHJpbmcpO1xyXG5cclxuICAgICAgLy8gbWVudTogbWFrZSB0aGUgaGlkZGVuIG1vc3QgcmlnaHRtb3N0IG9iamVjdCAoKzMgZnJvbSBvbGRNZW51RWwgaW5kZXgpIHZpc2libGVcclxuICAgICAgdmFyIG5ld2x5VmlzaWJsZU9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggKyAzLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlWaXNpYmxlT3B0aW9uRWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBuZXdseVZpc2libGVPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcblxyXG4gICAgICAvLyBtYWtlIHZpc2libGUgYW5kIGFuaW1hdGVcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywndHJ1ZScpO1xyXG4gICAgICBuZXdseVZpc2libGVPcHRpb25FbC5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbicpO1xyXG4gICAgICBuZXdseVZpc2libGVPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbicsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiAnMC41IDAuNSAwLjUnLCB0bzogJzEuMCAxLjAgMS4wJyB9KTtcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgLy8gbWVudTogZGVzdHJveSB0aGUgaGlkZGVuIG1vc3QgbGVmdG1vc3Qgb2JqZWN0ICgtMyBmcm9tIG9sZE1lbnVFbCBpbmRleClcclxuICAgICAgdmFyIG5ld2x5UmVtb3ZlZE9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggLSAzLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlSZW1vdmVkT3B0aW9uRWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBuZXdseVJlbW92ZWRPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcbiAgICAgIG5ld2x5UmVtb3ZlZE9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuICAgICAgbmV3bHlSZW1vdmVkT3B0aW9uRWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuZXdseVJlbW92ZWRPcHRpb25FbCk7XHJcblxyXG4gICAgICAvLyBtZW51OiBtYWtlIHRoZSBzZWNvbmQgbGVmdG1vc3Qgb2JqZWN0ICgtMiBmcm9tIG9sZE1lbnVFbCBpbmRleCkgaW52aXNpYmxlXHJcbiAgICAgIHZhciBuZXdseUludmlzaWJsZU9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggLSAyLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlJbnZpc2libGVPcHRpb25FbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5xdWVyeVNlbGVjdG9yQWxsKFwiW29wdGlvbmlkPSdcIiArIG5ld2x5SW52aXNpYmxlT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xyXG4gICAgICBuZXdseUludmlzaWJsZU9wdGlvbkVsLnNldEF0dHJpYnV0ZSgndmlzaWJsZScsICdmYWxzZScpO1xyXG4gICAgICBuZXdseUludmlzaWJsZU9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IENyZWF0ZSB0aGUgbmV4dCByaWdodG1vc3Qgb2JqZWN0IHByZXZpZXcgKCs0IGZyb20gb2xkTWVudUVsIGluZGV4KSBidXQga2VlcCBpdCBoaWRkZW4gdW50aWwgaXQncyBuZWVkZWRcclxuICAgICAgdmFyIG5ld2x5Q3JlYXRlZE9wdGlvbkVsID0gbmV3bHlWaXNpYmxlT3B0aW9uRWwuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ3Zpc2libGUnLCAnZmFsc2UnKTtcclxuICAgICAgdmFyIG5ld2x5Q3JlYXRlZE9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggKyA0LCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4vLyAgICAgIGNvbnNvbGUubG9nKFwibmV3bHlDcmVhdGVkT3B0aW9uSW5kZXg6IFwiICsgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgpO1xyXG4gICAgICAvLyBnZXQgdGhlIGFjdHVhbCBcIm9wdGlvblwiIGVsZW1lbnQgdGhhdCBpcyB0aGUgc291cmNlIG9mIHRydXRoIGZvciB2YWx1ZSwgaW1hZ2Ugc3JjIGFuZCBsYWJlbCBzbyB0aGF0IHdlIGNhbiBwb3B1bGF0ZSB0aGUgbmV3IG1lbnUgb3B0aW9uXHJcbiAgICAgIHZhciBzb3VyY2VPcHRpb25FbCA9IHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZHJlbltuZXdseUNyZWF0ZWRPcHRpb25JbmRleF07XHJcbi8vICAgICAgY29uc29sZS5sb2coXCJzb3VyY2VPcHRpb25FbFwiKTtcclxuLy8gICAgICBjb25zb2xlLmxvZyhzb3VyY2VPcHRpb25FbCk7XHJcblxyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ29wdGlvbmlkJywgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgpO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21lbnUnICsgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgpO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgc291cmNlT3B0aW9uRWwuZ2V0QXR0cmlidXRlKFwidmFsdWVcIikpO1xyXG5cclxuICAgICAgdmFyIG5ld2x5VmlzaWJsZU9wdGlvblBvc2l0aW9uID0gbmV3bHlWaXNpYmxlT3B0aW9uRWwub2JqZWN0M0QucG9zaXRpb247XHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCAobmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24ueCArIDAuMDc1KSArIFwiIFwiICsgbmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24ueSArIFwiIFwiICsgbmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24ueik7XHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IGFkZCB0aGUgbmV3bHkgY2xvbmVkIGFuZCBtb2RpZmllZCBtZW51IG9iamVjdCBwcmV2aWV3XHJcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5pbnNlcnRCZWZvcmUoIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLCBzZWxlY3RPcHRpb25zUm93RWwuZmlyc3RDaGlsZCApO1xyXG5cclxuICAgICAgLy8gbWVudTogZ2V0IGNoaWxkIGVsZW1lbnRzIGZvciBpbWFnZSBhbmQgbmFtZSwgcG9wdWxhdGUgYm90aCBhcHByb3ByaWF0ZWx5XHJcbiAgICAgIHZhciBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbb3B0aW9uaWQ9J1wiICsgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xyXG5cclxuICAgICAgYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJldmlld0ltYWdlXCIpWzBdLnNldEF0dHJpYnV0ZSgnc3JjJywgc291cmNlT3B0aW9uRWwuZ2V0QXR0cmlidXRlKFwic3JjXCIpKVxyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAndGV4dCcsIHNvdXJjZU9wdGlvbkVsLnRleHQpO1xyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAnIzc0NzQ3NCcpO1xyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIC8vIE5FWFQgTUVOVSBPUFRJT04gRU5EID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIH1cclxuXHJcblxyXG4gIH1cclxuXHJcbn0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvYWZyYW1lLXNlbGVjdC1iYXIuanMiLCIvKiBnbG9iYWwgQUZSQU1FICovXHJcblxyXG5pZiAodHlwZW9mIEFGUkFNRSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xyXG59XHJcblxyXG52YXIgb2JqZWN0Q291bnQgPSAwOyAvLyBzY2VuZSBzdGFydHMgd2l0aCAwIGl0ZW1zXHJcblxyXG5mdW5jdGlvbiBodW1hbml6ZShzdHIpIHtcclxuICB2YXIgZnJhZ3MgPSBzdHIuc3BsaXQoJ18nKTtcclxuICBmb3IgKGk9MDsgaTxmcmFncy5sZW5ndGg7IGkrKykge1xyXG4gICAgZnJhZ3NbaV0gPSBmcmFnc1tpXS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGZyYWdzW2ldLnNsaWNlKDEpO1xyXG4gIH1cclxuICByZXR1cm4gZnJhZ3Muam9pbignICcpO1xyXG59XHJcblxyXG4vKipcclxuICogVml2ZSBDb250cm9sbGVyIFRlbXBsYXRlIGNvbXBvbmVudCBmb3IgQS1GcmFtZS5cclxuICogTW9kaWZlZCBmcm9tIEEtRnJhbWUgRG9taW5vZXMuXHJcbiAqL1xyXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2J1aWxkZXItY29udHJvbHMnLCB7XHJcbiAgc2NoZW1hOiB7XHJcbiAgICBtZW51SWQ6IHt0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0OiBcIm1lbnVcIn1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBTZXQgaWYgY29tcG9uZW50IG5lZWRzIG11bHRpcGxlIGluc3RhbmNpbmcuXHJcbiAgICovXHJcbiAgbXVsdGlwbGU6IGZhbHNlLFxyXG5cclxuICAvKipcclxuICAgKiBBZGQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gICAqL1xyXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xyXG4gICAgLy8gQXBwbGljYWJsZSB0byBib3RoIFZpdmUgYW5kIE9jdWx1cyBUb3VjaCBjb250cm9sc1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigndHJpZ2dlcmRvd24nLCB0aGlzLm9uUGxhY2VPYmplY3QuYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdncmlwZG93bicsIHRoaXMub25VbmRvLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEubWVudUlkKTtcclxuICAgIG1lbnVFbC5hZGRFdmVudExpc3RlbmVyKCdtZW51Q2hhbmdlZCcsIHRoaXMub25PYmplY3RDaGFuZ2UuYmluZCh0aGlzKSk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cclxuICAgKi9cclxuICByZW1vdmVFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGVsID0gdGhpcy5lbDtcclxuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyaWdnZXJkb3duJywgdGhpcy5vblBsYWNlT2JqZWN0KTtcclxuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2dyaXBkb3duJywgdGhpcy5vblVuZG8pO1xyXG4gIH0sXHJcblxyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gZ2V0IHRoZSBsaXN0IG9mIG9iamVjdCBncm91cCBqc29uIGRpcmVjdG9yaWVzIC0gd2hpY2gganNvbiBmaWxlcyBzaG91bGQgd2UgcmVhZD9cclxuICAgICAgLy8gZm9yIGVhY2ggZ3JvdXAsIGZldGNoIHRoZSBqc29uIGZpbGUgYW5kIHBvcHVsYXRlIHRoZSBvcHRncm91cCBhbmQgb3B0aW9uIGVsZW1lbnRzIGFzIGNoaWxkcmVuIG9mIHRoZSBhcHByb3ByaWF0ZSBtZW51IGVsZW1lbnRcclxuICAgICAgbGlzdCA9IFtcImtmYXJyX2Jhc2VzXCIsXHJcbiAgICAgICAgICAgICAgXCJtbW1tX3ZlaFwiLFxyXG4gICAgICAgICAgICAgIFwibW1tbV9ibGRcIixcclxuICAgICAgICAgICAgICBcIm1tbW1fYWxpZW5cIixcclxuICAgICAgICAgICAgICBcIm1tbW1fc2NlbmVcIixcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgIHZhciBncm91cEpTT05BcnJheSA9IFtdO1xyXG5cclxuICAgICAgLy8gVE9ETzogd3JhcCB0aGlzIGluIHByb21pc2UgYW5kIHRoZW4gcmVxdWVzdCBhZnJhbWUtc2VsZWN0LWJhciBjb21wb25lbnQgdG8gcmUtaW5pdFxyXG4gICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24gKGdyb3VwTmFtZSwgaW5kZXgpIHtcclxuICAgICAgICAvLyBleGNlbGxlbnQgcmVmZXJlbmNlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0phdmFTY3JpcHQvT2JqZWN0cy9KU09OXHJcbiAgICAgICAgdmFyIHJlcXVlc3RVUkwgPSAnYXNzZXRzLycgKyBncm91cE5hbWUgKyBcIi5qc29uXCI7XHJcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHJlcXVlc3RVUkwpO1xyXG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xyXG4gICAgICAgIHJlcXVlc3Quc2VuZCgpO1xyXG5cclxuICAgICAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyAvLyBmb3IgZWFjaCBncm91cGxpc3QganNvbiBmaWxlIHdoZW4gbG9hZGVkXHJcbiAgICAgICAgICBncm91cEpTT05BcnJheVtncm91cE5hbWVdID0gcmVxdWVzdC5yZXNwb25zZTtcclxuICAgICAgICAgIC8vIGxpdGVyYWxseSBhZGQgdGhpcyBzaGl0IHRvIHRoZSBkb20gZHVkZVxyXG4gICAgICAgICAgLy8gY29uc29sZS5sb2coZ3JvdXBKU09OQXJyYXlbZ3JvdXBOYW1lXSk7XHJcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImdyb3VwTmFtZTogXCIgKyBncm91cE5hbWUpO1xyXG5cclxuICAgICAgICAgIC8vIGZpbmQgdGhlIG9wdGdyb3VwIHBhcmVudCBlbGVtZW50IC0gdGhlIG1lbnUgb3B0aW9uP1xyXG4gICAgICAgICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVudVwiKTtcclxuXHJcbiAgICAgICAgICAvLyBhZGQgdGhlIHBhcmVudCBvcHRncm91cCBub2RlIGxpa2U6IDxvcHRncm91cCBsYWJlbD1cIkFsaWVuc1wiIHZhbHVlPVwibW1tbV9hbGllblwiPlxyXG4gICAgICAgICAgdmFyIG5ld09wdGdyb3VwRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0Z3JvdXBcIik7XHJcbiAgICAgICAgICBuZXdPcHRncm91cEVsLnNldEF0dHJpYnV0ZShcImxhYmVsXCIsIGh1bWFuaXplKGdyb3VwTmFtZSkpOyAvLyBUT0RPOiB0aGlzIHNob3VsZCBiZSBhIHByZXR0aWVyIGxhYmVsLCBub3QgdGhlIGZpbGVuYW1lXHJcbiAgICAgICAgICBuZXdPcHRncm91cEVsLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIGdyb3VwTmFtZSk7XHJcblxyXG4gICAgICAgICAgLy8gY3JlYXRlIGVhY2ggY2hpbGRcclxuICAgICAgICAgIHZhciBvcHRpb25zSFRNTCA9IFwiXCI7XHJcbiAgICAgICAgICBncm91cEpTT05BcnJheVtncm91cE5hbWVdLmZvckVhY2goIGZ1bmN0aW9uKG9iamVjdERlZmluaXRpb24sIGluZGV4KSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKG9iamVjdERlZmluaXRpb25bXCJmaWxlXCJdKTtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2cob2JqZWN0RGVmaW5pdGlvbik7XHJcbiAgICAgICAgICAgIG9wdGlvbnNIVE1MICs9IGA8b3B0aW9uIHZhbHVlPVwiJHtvYmplY3REZWZpbml0aW9uW1wiZmlsZVwiXX1cIiBzcmM9XCJhc3NldHMvcHJldmlldy8ke29iamVjdERlZmluaXRpb25bXCJmaWxlXCJdfS5qcGdcIj4ke2h1bWFuaXplKG9iamVjdERlZmluaXRpb25bXCJmaWxlXCJdKX08L29wdGlvbj5gXHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBuZXdPcHRncm91cEVsLmlubmVySFRNTCA9IG9wdGlvbnNIVE1MO1xyXG4gICAgICAgICAgLy8gVE9ETzogQkFEIFdPUktBUk9VTkQgVE8gTk9UIFJFTE9BRCBCQVNFUyBzaW5jZSBpdCdzIGRlZmluZWQgaW4gSFRNTC4gSW5zdGVhZCwgbm8gb2JqZWN0cyBzaG91bGQgYmUgbGlzdGVkIGluIEhUTUwuIFRoaXMgc2hvdWxkIHVzZSBhIHByb21pc2UgYW5kIHRoZW4gaW5pdCB0aGUgc2VsZWN0LWJhciBjb21wb25lbnQgb25jZSBhbGwgb2JqZWN0cyBhcmUgbGlzdGVkLlxyXG4gICAgICAgICAgaWYgKGdyb3VwTmFtZSA9PSBcImtmYXJyX2Jhc2VzXCIpIHtcclxuICAgICAgICAgICAgLy8gZG8gbm90aGluZyAtIGRvbid0IGFwcGVuZCB0aGlzIHRvIHRoZSBET00gYmVjYXVzZSBvbmUgaXMgYWxyZWFkeSB0aGVyZVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbWVudUVsLmFwcGVuZENoaWxkKG5ld09wdGdyb3VwRWwpO1xyXG4gICAgICAgICAgfVxyXG4vLyAgICAgICAgICByZXNvbHZlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLmdyb3VwSlNPTkFycmF5ID0gZ3JvdXBKU09OQXJyYXk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gZW50aXR5IHJlc3VtZXMuXHJcbiAgICogVXNlIHRvIGNvbnRpbnVlIG9yIGFkZCBhbnkgZHluYW1pYyBvciBiYWNrZ3JvdW5kIGJlaGF2aW9yIHN1Y2ggYXMgZXZlbnRzLlxyXG4gICAqL1xyXG4gIHBsYXk6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBlbnRpdHkgcGF1c2VzLlxyXG4gICAqIFVzZSB0byBzdG9wIG9yIHJlbW92ZSBhbnkgZHluYW1pYyBvciBiYWNrZ3JvdW5kIGJlaGF2aW9yIHN1Y2ggYXMgZXZlbnRzLlxyXG4gICAqL1xyXG4gIHBhdXNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gYSBjb21wb25lbnQgaXMgcmVtb3ZlZCAoZS5nLiwgdmlhIHJlbW92ZUF0dHJpYnV0ZSkuXHJcbiAgICogR2VuZXJhbGx5IHVuZG9lcyBhbGwgbW9kaWZpY2F0aW9ucyB0byB0aGUgZW50aXR5LlxyXG4gICAqL1xyXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFNwYXducyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9iamVjdCBhdCB0aGUgY29udHJvbGxlciBsb2NhdGlvbiB3aGVuIHRyaWdnZXIgcHJlc3NlZFxyXG4gICAqL1xyXG4gIG9uUGxhY2VPYmplY3Q6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAvLyBGZXRjaCB0aGUgSXRlbSBlbGVtZW50ICh0aGUgcGxhY2VhYmxlIGNpdHkgb2JqZWN0KSBzZWxlY3RlZCBvbiB0aGlzIGNvbnRyb2xsZXJcclxuICAgIHZhciB0aGlzSXRlbUlEID0gKHRoaXMuZWwuaWQgPT09ICdsZWZ0Q29udHJvbGxlcicpID8gJyNsZWZ0SXRlbSc6JyNyaWdodEl0ZW0nO1xyXG4gICAgdmFyIHRoaXNJdGVtRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXNJdGVtSUQpO1xyXG5cclxuICAgIC8vIFdoaWNoIG9iamVjdCBzaG91bGQgYmUgcGxhY2VkIGhlcmU/IFRoaXMgSUQgaXMgXCJzdG9yZWRcIiBpbiB0aGUgRE9NIGVsZW1lbnQgb2YgdGhlIGN1cnJlbnQgSXRlbVxyXG5cdFx0dmFyIG9iamVjdElkID0gcGFyc2VJbnQodGhpc0l0ZW1FbC5hdHRyaWJ1dGVzLm9iamVjdElkLnZhbHVlKTtcclxuXHJcbiAgICAvLyBXaGF0J3MgdGhlIHR5cGUgb2Ygb2JqZWN0PyBGb3IgZXhhbXBsZSwgXCJtbW1tX2FsaWVuXCIgb3IgXCJiYXNlc1wiXHJcblx0XHR2YXIgb2JqZWN0R3JvdXAgPSB0aGlzSXRlbUVsLmF0dHJpYnV0ZXMub2JqZWN0R3JvdXAudmFsdWU7XHJcblxyXG4gICAgLy8gcm91bmRpbmcgdHJ1ZSBvciBmYWxzZT8gV2Ugd2FudCB0byByb3VuZCBwb3NpdGlvbiBhbmQgcm90YXRpb24gb25seSBmb3IgXCJiYXNlc1wiIHR5cGUgb2JqZWN0c1xyXG4gICAgdmFyIHJvdW5kaW5nID0gKG9iamVjdEdyb3VwID09ICdrZmFycl9iYXNlcycpO1xyXG5cclxuICAgIC8vIEdldCBhbiBBcnJheSBvZiBhbGwgdGhlIG9iamVjdHMgb2YgdGhpcyB0eXBlXHJcbiAgICB2YXIgb2JqZWN0QXJyYXkgPSB0aGlzLmdyb3VwSlNPTkFycmF5W29iamVjdEdyb3VwXTtcclxuXHJcbiAgICAvLyBHZXQgdGhlIEl0ZW0ncyBjdXJyZW50IHdvcmxkIGNvb3JkaW5hdGVzIC0gd2UncmUgZ29pbmcgdG8gcGxhY2UgaXQgcmlnaHQgd2hlcmUgaXQgaXMhXHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFBvc2l0aW9uID0gdGhpc0l0ZW1FbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKCk7XHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uID0gdGhpc0l0ZW1FbC5vYmplY3QzRC5nZXRXb3JsZFJvdGF0aW9uKCk7XHJcblx0XHR2YXIgb3JpZ2luYWxQb3NpdGlvblN0cmluZyA9IHRoaXNJdGVtV29ybGRQb3NpdGlvbi54ICsgJyAnICsgdGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLnkgKyAnICcgKyB0aGlzSXRlbVdvcmxkUG9zaXRpb24uejtcclxuXHJcbiAgICAvLyBSb3VuZCB0aGUgSXRlbSdzIHBvc2l0aW9uIHRvIHRoZSBuZWFyZXN0IDAuNTAgZm9yIGEgYmFzaWMgXCJncmlkIHNuYXBwaW5nXCIgZWZmZWN0XHJcblx0XHR2YXIgcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWCA9IE1hdGgucm91bmQodGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLnggKiAyKSAvIDI7IC8vcm91bmQgdG8gbmVhcmVzdCAwLjUgZm9yIGdoZXR0byBcInNuYXBwaW5nXCJcclxuXHRcdHZhciByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25ZID0gTWF0aC5yb3VuZCh0aGlzSXRlbVdvcmxkUG9zaXRpb24ueSAqIDIpIC8gMjsgLy9yb3VuZCB0byBuZWFyZXN0IDAuNSBmb3IgZ2hldHRvIFwic25hcHBpbmdcIlxyXG5cdFx0dmFyIHJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblogPSBNYXRoLnJvdW5kKHRoaXNJdGVtV29ybGRQb3NpdGlvbi56ICogMikgLyAyOyAvL3JvdW5kIHRvIG5lYXJlc3QgMC41IGZvciBnaGV0dG8gXCJzbmFwcGluZ1wiXHJcblx0XHR2YXIgcm91bmRlZFBvc2l0aW9uU3RyaW5nID0gcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWCArICcgMC41MCAnICsgcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWjtcclxuXHJcbiAgICAvLyBGZXRjaCB0aGUgY3VycmVudCBJdGVtJ3Mgcm90YXRpb24gYW5kIGNvbnZlcnQgaXQgdG8gYSBFdWxlciBzdHJpbmdcclxuXHRcdHZhciB0aGlzSXRlbVdvcmxkUm90YXRpb25YID0gdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uLl94IC8gKE1hdGguUEkgLyAxODApO1xyXG5cdFx0dmFyIHRoaXNJdGVtV29ybGRSb3RhdGlvblkgPSB0aGlzSXRlbVdvcmxkUm90YXRpb24uX3kgLyAoTWF0aC5QSSAvIDE4MCk7XHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWiA9IHRoaXNJdGVtV29ybGRSb3RhdGlvbi5feiAvIChNYXRoLlBJIC8gMTgwKTtcclxuXHRcdHZhciBvcmlnaW5hbEV1bGVyUm90YXRpb25TdHJpbmcgPSB0aGlzSXRlbVdvcmxkUm90YXRpb25YICsgJyAnICsgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSArICcgJyArIHRoaXNJdGVtV29ybGRSb3RhdGlvblo7XHJcblxyXG4gICAgLy8gUm91bmQgdGhlIEl0ZW0ncyByb3RhdGlvbiB0byB0aGUgbmVhcmVzdCA5MCBkZWdyZWVzIGZvciBiYXNlIHR5cGUgb2JqZWN0c1xyXG5cdFx0dmFyIHJvdW5kZWRUaGlzSXRlbVdvcmxkUm90YXRpb25ZID0gTWF0aC5yb3VuZCh0aGlzSXRlbVdvcmxkUm90YXRpb25ZIC8gOTApICogOTA7IC8vIHJvdW5kIHRvIDkwIGRlZ3JlZXNcclxuXHRcdHZhciByb3VuZGVkRXVsZXJSb3RhdGlvblN0cmluZyA9IDAgKyAnICcgKyByb3VuZGVkVGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSArICcgJyArIDA7IC8vIGlnbm9yZSByb2xsIGFuZCBwaXRjaFxyXG5cclxuICAgIHZhciBuZXdJZCA9ICdvYmplY3QnICsgb2JqZWN0Q291bnQ7XHJcblxyXG4gICAgJCgnPGEtZW50aXR5IC8+Jywge1xyXG4gICAgICBpZDogbmV3SWQsXHJcbiAgICAgIGNsYXNzOiAnY2l0eSBvYmplY3QgY2hpbGRyZW4nLFxyXG4gICAgICBzY2FsZTogb2JqZWN0QXJyYXlbb2JqZWN0SWRdLnNjYWxlLFxyXG4gICAgICByb3RhdGlvbjogcm91bmRpbmcgPyByb3VuZGVkRXVsZXJSb3RhdGlvblN0cmluZyA6IG9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZyxcclxuICAgICAgZmlsZTogb2JqZWN0QXJyYXlbb2JqZWN0SWRdLmZpbGUsXHJcbiAgICAgIC8vIFwicGx5LW1vZGVsXCI6IFwic3JjOiB1cmwobmV3X2Fzc2V0cy9cIiArIG9iamVjdEFycmF5W29iamVjdElkXS5maWxlICsgXCIucGx5KVwiLFxyXG4gICAgICBcIm9iai1tb2RlbFwiOiBcIm9iajogdXJsKGFzc2V0cy9vYmovXCIgKyBvYmplY3RBcnJheVtvYmplY3RJZF0uZmlsZSArIFwiLm9iaik7IG10bDogdXJsKGFzc2V0cy9vYmovXCIgKyBvYmplY3RBcnJheVtvYmplY3RJZF0uZmlsZSArIFwiLm10bClcIixcclxuICAgICAgYXBwZW5kVG8gOiAkKCcjY2l0eScpXHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXdPYmplY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChuZXdJZCk7XHJcbiAgICBuZXdPYmplY3Quc2V0QXR0cmlidXRlKFwicG9zaXRpb25cIiwgcm91bmRpbmcgPyByb3VuZGVkUG9zaXRpb25TdHJpbmcgOiBvcmlnaW5hbFBvc2l0aW9uU3RyaW5nKTsgLy8gdGhpcyBkb2VzIHNldCBwb3NpdGlvblxyXG5cclxuICAgIC8vIElmIHRoaXMgaXMgYSBcImJhc2VzXCIgdHlwZSBvYmplY3QsIGFuaW1hdGUgdGhlIHRyYW5zaXRpb24gdG8gdGhlIHNuYXBwZWQgKHJvdW5kZWQpIHBvc2l0aW9uIGFuZCByb3RhdGlvblxyXG4gICAgaWYgKHJvdW5kaW5nKSB7XHJcbiAgICAgIG5ld09iamVjdC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbicsIHsgcHJvcGVydHk6ICdyb3RhdGlvbicsIGR1cjogNTAwLCBmcm9tOiBvcmlnaW5hbEV1bGVyUm90YXRpb25TdHJpbmcsIHRvOiByb3VuZGVkRXVsZXJSb3RhdGlvblN0cmluZyB9KVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBJbmNyZW1lbnQgdGhlIG9iamVjdCBjb3VudGVyIHNvIHN1YnNlcXVlbnQgb2JqZWN0cyBoYXZlIHRoZSBjb3JyZWN0IGluZGV4XHJcblx0XHRvYmplY3RDb3VudCArPSAxO1xyXG4gIH0sXHJcblxyXG5cdG9uT2JqZWN0Q2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIm9uT2JqZWN0Q2hhbmdlIHRyaWdnZXJlZFwiKTtcclxuXHJcbiAgICAvLyBGZXRjaCB0aGUgSXRlbSBlbGVtZW50ICh0aGUgcGxhY2VhYmxlIGNpdHkgb2JqZWN0KSBzZWxlY3RlZCBvbiB0aGlzIGNvbnRyb2xsZXJcclxuICAgIHZhciB0aGlzSXRlbUlEID0gKHRoaXMuZWwuaWQgPT09ICdsZWZ0Q29udHJvbGxlcicpID8gJyNsZWZ0SXRlbSc6JyNyaWdodEl0ZW0nO1xyXG4gICAgdmFyIHRoaXNJdGVtRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXNJdGVtSUQpO1xyXG5cclxuICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEubWVudUlkKTtcclxuXHJcbiAgICAvLyBXaGF0J3MgdGhlIHR5cGUgb2Ygb2JqZWN0IGN1cnJlbnRseSBzZWxlY3RlZD8gRm9yIGV4YW1wbGUsIFwibW1tbV9hbGllblwiIG9yIFwiYmFzZXNcIlxyXG4gICAgdmFyIG9iamVjdEdyb3VwID0gbWVudUVsLmNvbXBvbmVudHNbJ3NlbGVjdC1iYXInXS5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBWYWx1ZTtcclxuXHJcbiAgICAvLyBHZXQgYW4gQXJyYXkgb2YgYWxsIHRoZSBvYmplY3RzIG9mIHRoaXMgdHlwZVxyXG4gICAgdmFyIG9iamVjdEFycmF5ID0gdGhpcy5ncm91cEpTT05BcnJheVtvYmplY3RHcm91cF07XHJcblxyXG4gICAgLy8gV2hhdCBpcyB0aGUgSUQgb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBpdGVtP1xyXG4gICAgdmFyIG5ld09iamVjdElkID0gcGFyc2VJbnQobWVudUVsLmNvbXBvbmVudHNbJ3NlbGVjdC1iYXInXS5kYXRhLnNlbGVjdGVkT3B0aW9uSW5kZXgpO1xyXG4gICAgdmFyIHNlbGVjdGVkT3B0aW9uVmFsdWUgPSBtZW51RWwuY29tcG9uZW50c1snc2VsZWN0LWJhciddLmRhdGEuc2VsZWN0ZWRPcHRpb25WYWx1ZTtcclxuXHJcblx0XHQvLyBTZXQgdGhlIHByZXZpZXcgb2JqZWN0IHRvIGJlIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgXCJwcmV2aWV3XCIgaXRlbVxyXG4gICAgdGhpc0l0ZW1FbC5zZXRBdHRyaWJ1dGUoJ29iai1tb2RlbCcsIHsgb2JqOiBcInVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbbmV3T2JqZWN0SWRdLmZpbGUgKyBcIi5vYmopXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG10bDogXCJ1cmwoYXNzZXRzL29iai9cIiArIG9iamVjdEFycmF5W25ld09iamVjdElkXS5maWxlICsgXCIubXRsKVwifSk7XHJcblx0XHR0aGlzSXRlbUVsLnNldEF0dHJpYnV0ZSgnc2NhbGUnLCBvYmplY3RBcnJheVtuZXdPYmplY3RJZF0uc2NhbGUpO1xyXG5cdFx0dGhpc0l0ZW1FbC5zZXRBdHRyaWJ1dGUoJ29iamVjdElkJywgbmV3T2JqZWN0SWQpO1xyXG4gICAgdGhpc0l0ZW1FbC5zZXRBdHRyaWJ1dGUoJ29iamVjdEdyb3VwJywgb2JqZWN0R3JvdXApO1xyXG4gICAgdGhpc0l0ZW1FbC5mbHVzaFRvRE9NKCk7XHJcblx0fSxcclxuXHJcbiAgLyoqXHJcbiAgICogVW5kbyAtIGRlbGV0ZXMgdGhlIG1vc3QgcmVjZW50bHkgcGxhY2VkIG9iamVjdFxyXG4gICAqL1xyXG4gIG9uVW5kbzogZnVuY3Rpb24gKCkge1xyXG5cdFx0cHJldmlvdXNPYmplY3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI29iamVjdFwiICsgKG9iamVjdENvdW50IC0gMSkpO1xyXG5cdFx0cHJldmlvdXNPYmplY3QucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwcmV2aW91c09iamVjdCk7XHJcblx0XHRvYmplY3RDb3VudCAtPSAxO1xyXG5cdFx0aWYob2JqZWN0Q291bnQgPT0gLTEpIHtvYmplY3RDb3VudCA9IDB9O1xyXG4gIH1cclxuXHJcbn0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvYnVpbGRlci1jb250cm9scy5qcyIsIi8qIGdsb2JhbCBBRlJBTUUsIFRIUkVFICovXHJcblxyXG4vKipcclxuICogTG9hZHMgYW5kIHNldHVwIGdyb3VuZCBtb2RlbC5cclxuICovXHJcbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnZ3JvdW5kJywge1xyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvYmplY3RMb2FkZXI7XHJcbiAgICB2YXIgb2JqZWN0M0QgPSB0aGlzLmVsLm9iamVjdDNEO1xyXG4gICAgLy8gdmFyIE1PREVMX1VSTCA9ICdodHRwczovL2Nkbi5hZnJhbWUuaW8vbGluay10cmF2ZXJzYWwvbW9kZWxzL2dyb3VuZC5qc29uJztcclxuICAgIHZhciBNT0RFTF9VUkwgPSAnYXNzZXRzL2Vudmlyb25tZW50L2dyb3VuZC5qc29uJztcclxuICAgIGlmICh0aGlzLm9iamVjdExvYWRlcikgeyByZXR1cm47IH1cclxuICAgIG9iamVjdExvYWRlciA9IHRoaXMub2JqZWN0TG9hZGVyID0gbmV3IFRIUkVFLk9iamVjdExvYWRlcigpO1xyXG4gICAgb2JqZWN0TG9hZGVyLmNyb3NzT3JpZ2luID0gJyc7XHJcbiAgICBvYmplY3RMb2FkZXIubG9hZChNT0RFTF9VUkwsIGZ1bmN0aW9uIChvYmopIHtcclxuICAgICAgb2JqLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdmFsdWUucmVjZWl2ZVNoYWRvdyA9IHRydWU7XHJcbiAgICAgICAgdmFsdWUubWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xyXG4gICAgICB9KTtcclxuICAgICAgb2JqZWN0M0QuYWRkKG9iaik7XHJcbiAgICB9KTtcclxuICB9XHJcbn0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvZ3JvdW5kLmpzIiwiLyogZ2xvYmFsIEFGUkFNRSAqL1xyXG5BRlJBTUUucmVnaXN0ZXJTaGFkZXIoJ3NreUdyYWRpZW50Jywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgY29sb3JUb3A6IHsgdHlwZTogJ2NvbG9yJywgZGVmYXVsdDogJ2JsYWNrJywgaXM6ICd1bmlmb3JtJyB9LFxyXG4gICAgY29sb3JCb3R0b206IHsgdHlwZTogJ2NvbG9yJywgZGVmYXVsdDogJ3JlZCcsIGlzOiAndW5pZm9ybScgfVxyXG4gIH0sXHJcblxyXG4gIHZlcnRleFNoYWRlcjogW1xyXG4gICAgJ3ZhcnlpbmcgdmVjMyB2V29ybGRQb3NpdGlvbjsnLFxyXG5cclxuICAgICd2b2lkIG1haW4oKSB7JyxcclxuXHJcbiAgICAgICd2ZWM0IHdvcmxkUG9zaXRpb24gPSBtb2RlbE1hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTsnLFxyXG4gICAgICAndldvcmxkUG9zaXRpb24gPSB3b3JsZFBvc2l0aW9uLnh5ejsnLFxyXG5cclxuICAgICAgJ2dsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTsnLFxyXG5cclxuICAgICd9J1xyXG5cclxuICBdLmpvaW4oJ1xcbicpLFxyXG5cclxuICBmcmFnbWVudFNoYWRlcjogW1xyXG4gICAgJ3VuaWZvcm0gdmVjMyBjb2xvclRvcDsnLFxyXG4gICAgJ3VuaWZvcm0gdmVjMyBjb2xvckJvdHRvbTsnLFxyXG5cclxuICAgICd2YXJ5aW5nIHZlYzMgdldvcmxkUG9zaXRpb247JyxcclxuXHJcbiAgICAndm9pZCBtYWluKCknLFxyXG5cclxuICAgICd7JyxcclxuICAgICAgJ3ZlYzMgcG9pbnRPblNwaGVyZSA9IG5vcm1hbGl6ZSh2V29ybGRQb3NpdGlvbi54eXopOycsXHJcbiAgICAgICdmbG9hdCBmID0gMS4wOycsXHJcbiAgICAgICdpZihwb2ludE9uU3BoZXJlLnkgPiAtIDAuMil7JyxcclxuXHJcbiAgICAgICAgJ2YgPSBzaW4ocG9pbnRPblNwaGVyZS55ICogMi4wKTsnLFxyXG5cclxuICAgICAgJ30nLFxyXG4gICAgICAnZ2xfRnJhZ0NvbG9yID0gdmVjNChtaXgoY29sb3JCb3R0b20sY29sb3JUb3AsIGYgKSwgMS4wKTsnLFxyXG5cclxuICAgICd9J1xyXG4gIF0uam9pbignXFxuJylcclxufSk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2xpYi9za3lHcmFkaWVudC5qcyJdLCJzb3VyY2VSb290IjoiIn0=