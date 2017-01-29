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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgY2MxMzE5OTQ2OTc2M2I3MjA0ZWQiLCJ3ZWJwYWNrOi8vLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2FuaW1lanMvYW5pbWUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtdGV4dC1jb21wb25lbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50L2luZGV4LmpzIiwid2VicGFjazovLy8uL34vdGhyZWUtYm1mb250LXRleHQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9sYXlvdXQtYm1mb250LXRleHQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi93b3JkLXdyYXBwZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi94dGVuZC9pbW11dGFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9pbmRleG9mLXByb3BlcnR5L2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYXMtbnVtYmVyL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly8vLi9+L3F1YWQtaW5kaWNlcy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2R0eXBlL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYW4tYXJyYXkvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9pcy1idWZmZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi90aHJlZS1idWZmZXItdmVydGV4LWRhdGEvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9mbGF0dGVuLXZlcnRleC1kYXRhL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vb2JqZWN0LWFzc2lnbi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3RocmVlLWJtZm9udC10ZXh0L2xpYi92ZXJ0aWNlcy5qcyIsIndlYnBhY2s6Ly8vLi9+L3RocmVlLWJtZm9udC10ZXh0L2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvYWQtYm1mb250L2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9idWZmZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYXNlNjQtanMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9pZWVlNzU0L2luZGV4LmpzIiwid2VicGFjazovLy8uL34vaXNhcnJheS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3hoci9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2dsb2JhbC93aW5kb3cuanMiLCJ3ZWJwYWNrOi8vLy4vfi9pcy1mdW5jdGlvbi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3BhcnNlLWhlYWRlcnMvcGFyc2UtaGVhZGVycy5qcyIsIndlYnBhY2s6Ly8vLi9+L3RyaW0vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9mb3ItZWFjaC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3BhcnNlLWJtZm9udC1hc2NpaS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3BhcnNlLWJtZm9udC14bWwvbGliL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wYXJzZS1ibWZvbnQteG1sL2xpYi9wYXJzZS1hdHRyaWJzLmpzIiwid2VicGFjazovLy8uL34veG1sLXBhcnNlLWZyb20tc3RyaW5nL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vcGFyc2UtYm1mb250LWJpbmFyeS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvYWQtYm1mb250L2xpYi9pcy1iaW5hcnkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9idWZmZXItZXF1YWwvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50L2xpYi9zaGFkZXJzL3NkZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2FmcmFtZS1ibWZvbnQtdGV4dC1jb21wb25lbnQvZXh0cmFzL3RleHQtcHJpbWl0aXZlLmpzIiwid2VicGFjazovLy8uL2xpYi9hZnJhbWUtc2VsZWN0LWJhci5qcyIsIndlYnBhY2s6Ly8vLi9saWIvYnVpbGRlci1jb250cm9scy5qcyIsIndlYnBhY2s6Ly8vLi9saWIvZ3JvdW5kLmpzIiwid2VicGFjazovLy8uL2xpYi9za3lHcmFkaWVudC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiQUZSQU1FIiwiRXJyb3IiLCJmaW5kV2l0aEF0dHIiLCJhcnJheSIsImF0dHIiLCJ2YWx1ZSIsImkiLCJsZW5ndGgiLCJpbmRleE9mTWF4IiwiYXJyIiwibWF4IiwibWF4SW5kZXgiLCJsb29wSW5kZXgiLCJkZXNpcmVkSW5kZXgiLCJhcnJheUxlbmd0aCIsImFzc2VydCIsImNvbmRpdGlvbiIsIm1lc3NhZ2UiLCJ0ZXN0TG9vcEFycmF5IiwicmVnaXN0ZXJDb21wb25lbnQiLCJzY2hlbWEiLCJjb250cm9scyIsInR5cGUiLCJkZWZhdWx0IiwiY29udHJvbGxlcklEIiwic2VsZWN0ZWRPcHRncm91cFZhbHVlIiwic2VsZWN0ZWRPcHRncm91cEluZGV4Iiwic2VsZWN0ZWRPcHRpb25WYWx1ZSIsInNlbGVjdGVkT3B0aW9uSW5kZXgiLCJtYWtlU2VsZWN0T3B0aW9uc1JvdyIsInNlbGVjdGVkT3B0Z3JvdXBFbCIsInBhcmVudEVsIiwiaW5kZXgiLCJvZmZzZXRZIiwib3B0Z3JvdXBMYWJlbEVsIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiaWQiLCJzZXRBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJhcHBlbmRDaGlsZCIsIm9wdGlvbnNFbGVtZW50cyIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwib3B0aW9uc0VsZW1lbnRzQXJyYXkiLCJBcnJheSIsInByb3RvdHlwZSIsInNsaWNlIiwiY2FsbCIsImZpcnN0QXJyYXkiLCJwcmV2aWV3QXJyYXkiLCJtZW51QXJyYXkiLCJjb25jYXQiLCJzZWxlY3RPcHRpb25zSFRNTCIsInN0YXJ0UG9zaXRpb25YIiwiZGVsdGFYIiwiZm9yRWFjaCIsImVsZW1lbnQiLCJtZW51QXJyYXlJbmRleCIsInZpc2libGUiLCJzZWxlY3RlZCIsIm9yaWdpbmFsT3B0aW9uc0FycmF5SW5kZXgiLCJ0ZXh0Iiwic2VsZWN0T3B0aW9uc1Jvd0VsIiwiaW5uZXJIVE1MIiwicmVtb3ZlU2VsZWN0T3B0aW9uc1JvdyIsImdldEVsZW1lbnRCeUlkIiwiY29uc29sZSIsImxvZyIsImZpcnN0Q2hpbGQiLCJyZW1vdmVDaGlsZCIsInBhcmVudE5vZGUiLCJpbml0Iiwic2VsZWN0RWwiLCJlbCIsImRhdGEiLCJsYXN0VGltZSIsIkRhdGUiLCJzZWxlY3RSZW5kZXJFbCIsIm9wdGdyb3VwcyIsImFkZEV2ZW50TGlzdGVuZXJzIiwiY29udHJvbGxlckVsIiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uVHJhY2twYWREb3duIiwiYmluZCIsIm9uQXhpc01vdmUiLCJvbkhvdmVyTGVmdCIsIm9uSG92ZXJSaWdodCIsIm9uT3B0aW9uU3dpdGNoIiwib25PcHRpb25OZXh0Iiwib25PcHRpb25QcmV2aW91cyIsIm9uT3B0Z3JvdXBOZXh0Iiwib25PcHRncm91cFByZXZpb3VzIiwicmVtb3ZlRXZlbnRMaXN0ZW5lcnMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicGxheSIsInBhdXNlIiwicmVtb3ZlIiwiZXZ0IiwidGFyZ2V0IiwiZGV0YWlsIiwiYXhpcyIsImlzT2N1bHVzIiwiZ2FtZXBhZHMiLCJuYXZpZ2F0b3IiLCJnZXRHYW1lcGFkcyIsImdhbWVwYWQiLCJpbmRleE9mIiwiTWF0aCIsImFicyIsInlBeGlzIiwib25Ib3ZlclVwIiwib25Ib3ZlckRvd24iLCJ0aGlzVGltZSIsImZsb29yIiwiZW1pdCIsImFycm93IiwiY3VycmVudEFycm93Q29sb3IiLCJUSFJFRSIsIkNvbG9yIiwiY29sb3IiLCJyIiwicmVtb3ZlQXR0cmlidXRlIiwicHJvcGVydHkiLCJkdXIiLCJmcm9tIiwidG8iLCJnIiwiYXJyb3dDb2xvciIsImZsdXNoVG9ET00iLCJuZXh0U2VsZWN0ZWRPcHRncm91cEVsIiwibmV3bHlTZWxlY3RlZE1lbnVFbCIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJhcnJvd1VwQ29sb3IiLCJhcnJvd1JpZ2h0Q29sb3IiLCJhcnJvd0Rvd25Db2xvciIsImFycm93TGVmdENvbG9yIiwiYXJyb3dDb2xvckFycmF5R3JlZW4iLCJyZWR1Y2UiLCJhIiwiYiIsImRpcmVjdGlvbiIsIm9sZE1lbnVFbCIsIm9sZFNlbGVjdGVkT3B0aW9uSW5kZXgiLCJwYXJzZUludCIsImNoaWxkRWxlbWVudENvdW50IiwiYXJyb3dMZWZ0IiwibmV3TWVudUVsIiwicXVlcnlTZWxlY3RvckFsbCIsImNsYXNzTGlzdCIsImFkZCIsImhhc0F0dHJpYnV0ZSIsIm9sZFBvc2l0aW9uIiwibmV3WCIsInBhcnNlRmxvYXQiLCJzcGxpdCIsIm5ld1Bvc2l0aW9uU3RyaW5nIiwidG9TdHJpbmciLCJvYmplY3QzRCIsInBvc2l0aW9uIiwieCIsInkiLCJ6IiwibmV3bHlWaXNpYmxlT3B0aW9uSW5kZXgiLCJuZXdseVZpc2libGVPcHRpb25FbCIsIm5ld2x5UmVtb3ZlZE9wdGlvbkluZGV4IiwibmV3bHlSZW1vdmVkT3B0aW9uRWwiLCJuZXdseUludmlzaWJsZU9wdGlvbkluZGV4IiwibmV3bHlJbnZpc2libGVPcHRpb25FbCIsIm5ld2x5Q3JlYXRlZE9wdGlvbkVsIiwiY2xvbmVOb2RlIiwibmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgiLCJzb3VyY2VPcHRpb25FbCIsImNoaWxkcmVuIiwibmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24iLCJpbnNlcnRCZWZvcmUiLCJhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsIiwiYXJyb3dSaWdodCIsIm9iamVjdENvdW50IiwiaHVtYW5pemUiLCJzdHIiLCJmcmFncyIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwiam9pbiIsIm1lbnVJZCIsIm11bHRpcGxlIiwib25QbGFjZU9iamVjdCIsIm9uVW5kbyIsIm1lbnVFbCIsIm9uT2JqZWN0Q2hhbmdlIiwibGlzdCIsImdyb3VwSlNPTkFycmF5IiwiZ3JvdXBOYW1lIiwicmVxdWVzdFVSTCIsInJlcXVlc3QiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJyZXNwb25zZVR5cGUiLCJzZW5kIiwib25sb2FkIiwicmVzcG9uc2UiLCJuZXdPcHRncm91cEVsIiwib3B0aW9uc0hUTUwiLCJvYmplY3REZWZpbml0aW9uIiwidGhpc0l0ZW1JRCIsInRoaXNJdGVtRWwiLCJxdWVyeVNlbGVjdG9yIiwib2JqZWN0SWQiLCJhdHRyaWJ1dGVzIiwib2JqZWN0R3JvdXAiLCJyb3VuZGluZyIsIm9iamVjdEFycmF5IiwidGhpc0l0ZW1Xb3JsZFBvc2l0aW9uIiwiZ2V0V29ybGRQb3NpdGlvbiIsInRoaXNJdGVtV29ybGRSb3RhdGlvbiIsImdldFdvcmxkUm90YXRpb24iLCJvcmlnaW5hbFBvc2l0aW9uU3RyaW5nIiwicm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWCIsInJvdW5kIiwicm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWSIsInJvdW5kZWRJdGVtV29ybGRQb3NpdGlvbloiLCJyb3VuZGVkUG9zaXRpb25TdHJpbmciLCJ0aGlzSXRlbVdvcmxkUm90YXRpb25YIiwiX3giLCJQSSIsInRoaXNJdGVtV29ybGRSb3RhdGlvblkiLCJfeSIsInRoaXNJdGVtV29ybGRSb3RhdGlvbloiLCJfeiIsIm9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZyIsInJvdW5kZWRUaGlzSXRlbVdvcmxkUm90YXRpb25ZIiwicm91bmRlZEV1bGVyUm90YXRpb25TdHJpbmciLCJuZXdJZCIsIiQiLCJjbGFzcyIsInNjYWxlIiwicm90YXRpb24iLCJmaWxlIiwiYXBwZW5kVG8iLCJuZXdPYmplY3QiLCJjb21wb25lbnRzIiwibmV3T2JqZWN0SWQiLCJvYmoiLCJtdGwiLCJwcmV2aW91c09iamVjdCIsIm9iamVjdExvYWRlciIsIk1PREVMX1VSTCIsIk9iamVjdExvYWRlciIsImNyb3NzT3JpZ2luIiwibG9hZCIsInJlY2VpdmVTaGFkb3ciLCJtYXRlcmlhbCIsInNoYWRpbmciLCJGbGF0U2hhZGluZyIsInJlZ2lzdGVyU2hhZGVyIiwiY29sb3JUb3AiLCJpcyIsImNvbG9yQm90dG9tIiwidmVydGV4U2hhZGVyIiwiZnJhZ21lbnRTaGFkZXIiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7QUN0Q0Esb0JBQUFBLENBQVEsQ0FBUjtBQUNBLG9CQUFBQSxDQUFRLENBQVI7QUFDQSxvQkFBQUEsQ0FBUSxDQUFSO0FBQ0Esb0JBQUFBLENBQVEsQ0FBUjtBQUNBLG9CQUFBQSxDQUFRLEVBQVI7QUFDQSxvQkFBQUEsQ0FBUSxFQUFSO0FBQ0Esb0JBQUFBLENBQVEsRUFBUjtBQUNBLG9CQUFBQSxDQUFRLEVBQVIsRTs7Ozs7O0FDUEE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLGFBQWE7QUFDeEIsaUJBQWdCLGNBQWM7QUFDOUIsdUJBQXNCLGVBQWU7QUFDckMsaUJBQWdCO0FBQ2hCLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7Ozs7Ozs7QUNuQ0Q7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLFdBQVc7QUFDdkIsV0FBVSxZQUFZO0FBQ3RCLFdBQVUsY0FBYztBQUN4QixjQUFhLHNCQUFzQjtBQUNuQyxrQkFBaUIsYUFB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Q0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNEMsMEJBQTBCLEVBQUU7QUFDeEU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWM7QUFDZCxNQUFLO0FBQ0w7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrRUFBaUU7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZO0FBQ1o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQLE1BQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1REFBc0QsdUJBQXVCO0FBQzdFO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0EsNERBQTJELDRCQUE0QixFQUFFO0FBQ3pGOztBQUVBO0FBQ0EsNERBQTJELG9CQUFvQixFQUFFO0FBQ2pGOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlEQUF3RCw2QkFBNkIsRUFBRTtBQUN2RjtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBbUIsd0JBQXdCO0FBQzNDO0FBQ0E7QUFDQTtBQUNBLHNCQUFxQiw4QkFBOEI7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFEQUFvRDtBQUNwRCxpRUFBZ0U7QUFDaEUsa0RBQWlEO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsNEJBQTJCLG1DQUFtQztBQUM5RDtBQUNBO0FBQ0Esd0JBQXVCLHVCQUF1QjtBQUM5QztBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW1DO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLHNDQUFxQyxRQUFRO0FBQzdDO0FBQ0E7QUFDQSxvQ0FBbUMsUUFBUTtBQUMzQztBQUNBLDJDQUEwQyxRQUFRO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLEVBQUM7Ozs7Ozs7QUM5bkJEO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxvQkFBbUIsZUFBZTtBQUNsQyxpQkFBZ0IsbUJBQW1CO0FBQ25DLHNCQUFxQixvQkFBb0I7QUFDekMscUJBQW9CLG9CQUFvQjtBQUN4QyxZQUFXLHlIQUF5SDtBQUNwSSxjQUFhLHNCQUFzQjtBQUNuQyxZQUFXLHFCQUFxQjtBQUNoQyxhQUFZLGdEQUFnRDtBQUM1RCxZQUFXLFlBQVk7QUFDdkIsY0FBYTtBQUNiLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1AsTUFBSztBQUNMO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7Ozs7OztBQzlDRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEseUJBQXNDOztBQUV0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87O0FBRVA7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0wsSUFBRztBQUNIOzs7Ozs7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLFlBQVc7QUFDWDs7QUFFQTtBQUNBO0FBQ0Esd0JBQXVCOztBQUV2QjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLFlBQVc7QUFDWDs7QUFFQTtBQUNBLGtCQUFpQjs7QUFFakI7QUFDQSwwQ0FBeUMsT0FBTztBQUNoRDs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFxQixPQUFPO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxvQkFBbUIsU0FBUztBQUM1QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSw2QkFBNEI7QUFDNUI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsRUFBQztBQUNEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtDQUFpQztBQUNqQztBQUNBLE9BQU07QUFDTjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0JBQWUsb0JBQW9CO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0JBQWUsbUJBQW1CO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0JBQWUsc0JBQXNCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGdCQUFlLGdCQUFnQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRTs7Ozs7O0FDalNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHNCQUFxQix3QkFBd0I7QUFDN0M7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFOzs7Ozs7QUM5SEE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQSxvQkFBbUIsc0JBQXNCO0FBQ3pDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7O0FDbEJBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EscUJBQW9CLGdCQUFnQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBLEU7Ozs7OztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRTs7Ozs7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBLEVBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUN0QkE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0JBQWU7QUFDZjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLDJCQUEwQixnQkFBZ0I7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRTs7Ozs7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3ZCQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3BCQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOERBQTZEO0FBQzdEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7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bkM7QUFDQTtBQUNBLElBQUc7QUFDSDs7Ozs7Ozs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxzQkFBcUIsbURBQW1EO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBbUIsVUFBVTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsWUFBWTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMkJBQTBCO0FBQzFCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLHdDQUF1QyxTQUFTO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdCQUFlLGlCQUFpQjtBQUNoQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWEsaUJBQWlCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQixTQUFTO0FBQzFCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFnRCxFQUFFO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLGtCQUFpQixTQUFTO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBeUM7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHlCQUF3QixlQUFlO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBLHlCQUF3QixRQUFRO0FBQ2hDO0FBQ0Esc0JBQXFCLGVBQWU7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0JBQWlCLFlBQVk7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLHNCQUFxQixTQUFTO0FBQzlCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxzQkFBcUIsU0FBUztBQUM5QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxzQkFBcUIsU0FBUztBQUM5QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsa0JBQWtCO0FBQ25DO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQSxvQkFBbUIsY0FBYztBQUNqQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0RBQXVELE9BQU87QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHdEQUF1RCxPQUFPO0FBQzlEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztB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RUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQSwyQ0FBMEM7QUFDMUM7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7O0FDaFBBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7QUFDQSxFQUFDO0FBQ0Q7QUFDQSxFQUFDO0FBQ0Q7QUFDQTs7Ozs7Ozs7QUNSQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxFOzs7Ozs7O0FDN0JBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7O0FDYkE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx3Q0FBdUMsU0FBUztBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EseUNBQXdDLFNBQVM7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLGtCQUFpQixrQkFBa0I7QUFDbkM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBLE1BQUs7QUFDTDtBQUNBLE1BQUs7QUFDTDtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtB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LGdCQUFTUixHQUFULENBQWE2RixHQUFiO0FBQ0QsTUFORDtBQU9EO0FBaEJnQyxFQUFuQyxFOzs7Ozs7OztBQ0xBO0FBQ0FsUCxRQUFPOFAsY0FBUCxDQUFzQixhQUF0QixFQUFxQztBQUNuQzFPLFdBQVE7QUFDTjJPLGVBQVUsRUFBRXpPLE1BQU0sT0FBUixFQUFpQkMsU0FBUyxPQUExQixFQUFtQ3lPLElBQUksU0FBdkMsRUFESjtBQUVOQyxrQkFBYSxFQUFFM08sTUFBTSxPQUFSLEVBQWlCQyxTQUFTLEtBQTFCLEVBQWlDeU8sSUFBSSxTQUFyQztBQUZQLElBRDJCOztBQU1uQ0UsaUJBQWMsQ0FDWiw4QkFEWSxFQUdaLGVBSFksRUFLViwyREFMVSxFQU1WLHFDQU5VLEVBUVYsMkVBUlUsRUFVWixHQVZZLEVBWVozRSxJQVpZLENBWVAsSUFaTyxDQU5xQjs7QUFvQm5DNEUsbUJBQWdCLENBQ2Qsd0JBRGMsRUFFZCwyQkFGYyxFQUlkLDhCQUpjLEVBTWQsYUFOYyxFQVFkLEdBUmMsRUFTWixxREFUWSxFQVVaLGdCQVZZLEVBV1osOEJBWFksRUFhVixpQ0FiVSxFQWVaLEdBZlksRUFnQlosMERBaEJZLEVBa0JkLEdBbEJjLEVBbUJkNUUsSUFuQmMsQ0FtQlQsSUFuQlM7QUFwQm1CLEVBQXJDLEUiLCJmaWxlIjoiYWZyYW1lLWNpdHktYnVpbGRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGNjMTMxOTk0Njk3NjNiNzIwNGVkIiwicmVxdWlyZSgnYWZyYW1lLWdyaWRoZWxwZXItY29tcG9uZW50Jyk7XHJcbnJlcXVpcmUoJ2FmcmFtZS1hbmltYXRpb24tY29tcG9uZW50Jyk7XHJcbnJlcXVpcmUoJ2FmcmFtZS10ZXh0LWNvbXBvbmVudCcpO1xyXG5yZXF1aXJlKCdhZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50Jyk7XHJcbnJlcXVpcmUoJy4vbGliL2FmcmFtZS1zZWxlY3QtYmFyLmpzJyk7XHJcbnJlcXVpcmUoJy4vbGliL2J1aWxkZXItY29udHJvbHMuanMnKTtcclxucmVxdWlyZSgnLi9saWIvZ3JvdW5kLmpzJyk7XHJcbnJlcXVpcmUoJy4vbGliL3NreUdyYWRpZW50LmpzJyk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2luZGV4LmpzIiwiaWYgKHR5cGVvZiBBRlJBTUUgPT09ICd1bmRlZmluZWQnKSB7XG4gIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGF0dGVtcHRlZCB0byByZWdpc3RlciBiZWZvcmUgQUZSQU1FIHdhcyBhdmFpbGFibGUuJyk7XG59XG5cbi8qKlxuICogR3JpZEhlbHBlciBjb21wb25lbnQgZm9yIEEtRnJhbWUuXG4gKi9cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnZ3JpZGhlbHBlcicsIHtcbiAgc2NoZW1hOiB7XG4gICAgc2l6ZTogeyBkZWZhdWx0OiA1IH0sXG4gICAgZGl2aXNpb25zOiB7IGRlZmF1bHQ6IDEwIH0sXG4gICAgY29sb3JDZW50ZXJMaW5lOiB7ZGVmYXVsdDogJ3JlZCd9LFxuICAgIGNvbG9yR3JpZDoge2RlZmF1bHQ6ICdibGFjayd9XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbGxlZCBvbmNlIHdoZW4gY29tcG9uZW50IGlzIGF0dGFjaGVkLiBHZW5lcmFsbHkgZm9yIGluaXRpYWwgc2V0dXAuXG4gICAqL1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNjZW5lID0gdGhpcy5lbC5vYmplY3QzRDtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcblxuICAgIHZhciBzaXplID0gZGF0YS5zaXplO1xuICAgIHZhciBkaXZpc2lvbnMgPSBkYXRhLmRpdmlzaW9ucztcbiAgICB2YXIgY29sb3JDZW50ZXJMaW5lID0gZGF0YS5jb2xvckNlbnRlckxpbmU7XG4gICAgdmFyIGNvbG9yR3JpZCA9IGRhdGEuY29sb3JHcmlkO1xuXG4gICAgdmFyIGdyaWRIZWxwZXIgPSBuZXcgVEhSRUUuR3JpZEhlbHBlciggc2l6ZSwgZGl2aXNpb25zLCBjb2xvckNlbnRlckxpbmUsIGNvbG9yR3JpZCApO1xuICAgIGdyaWRIZWxwZXIubmFtZSA9IFwiZ3JpZEhlbHBlclwiO1xuICAgIHNjZW5lLmFkZChncmlkSGVscGVyKTtcbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNjZW5lID0gdGhpcy5lbC5vYmplY3QzRDtcbiAgICBzY2VuZS5yZW1vdmUoc2NlbmUuZ2V0T2JqZWN0QnlOYW1lKFwiZ3JpZEhlbHBlclwiKSk7XG4gIH1cbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FmcmFtZS1ncmlkaGVscGVyLWNvbXBvbmVudC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiBnbG9iYWwgQUZSQU1FICovXG5cbnZhciBhbmltZSA9IHJlcXVpcmUoJ2FuaW1lanMnKTtcblxuaWYgKHR5cGVvZiBBRlJBTUUgPT09ICd1bmRlZmluZWQnKSB7XG4gIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGF0dGVtcHRlZCB0byByZWdpc3RlciBiZWZvcmUgQUZSQU1FIHdhcyBhdmFpbGFibGUuJyk7XG59XG5cbnZhciB1dGlscyA9IEFGUkFNRS51dGlscztcbnZhciBnZXRDb21wb25lbnRQcm9wZXJ0eSA9IHV0aWxzLmVudGl0eS5nZXRDb21wb25lbnRQcm9wZXJ0eTtcbnZhciBzZXRDb21wb25lbnRQcm9wZXJ0eSA9IHV0aWxzLmVudGl0eS5zZXRDb21wb25lbnRQcm9wZXJ0eTtcbnZhciBzdHlsZVBhcnNlciA9IHV0aWxzLnN0eWxlUGFyc2VyLnBhcnNlO1xuXG4vKipcbiAqIEFuaW1hdGlvbiBjb21wb25lbnQgZm9yIEEtRnJhbWUuXG4gKi9cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnYW5pbWF0aW9uJywge1xuICBzY2hlbWE6IHtcbiAgICBkZWxheToge2RlZmF1bHQ6IDB9LFxuICAgIGRpcjoge2RlZmF1bHQ6ICcnfSxcbiAgICBkdXI6IHtkZWZhdWx0OiAxMDAwfSxcbiAgICBlYXNpbmc6IHtkZWZhdWx0OiAnZWFzZUluUXVhZCd9LFxuICAgIGVsYXN0aWNpdHk6IHtkZWZhdWx0OiA0MDB9LFxuICAgIGZyb206IHtkZWZhdWx0OiAnJ30sXG4gICAgbG9vcDoge2RlZmF1bHQ6IGZhbHNlfSxcbiAgICBwcm9wZXJ0eToge2RlZmF1bHQ6ICcnfSxcbiAgICByZXBlYXQ6IHtkZWZhdWx0OiAwfSxcbiAgICBzdGFydEV2ZW50czoge3R5cGU6ICdhcnJheSd9LFxuICAgIHBhdXNlRXZlbnRzOiB7dHlwZTogJ2FycmF5J30sXG4gICAgcmVzdW1lRXZlbnRzOiB7dHlwZTogJ2FycmF5J30sXG4gICAgcmVzdGFydEV2ZW50czoge3R5cGU6ICdhcnJheSd9LFxuICAgIHRvOiB7ZGVmYXVsdDogJyd9XG4gIH0sXG5cbiAgbXVsdGlwbGU6IHRydWUsXG5cbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uID0gbnVsbDtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IGZhbHNlO1xuICAgIHRoaXMuY29uZmlnID0gbnVsbDtcbiAgICB0aGlzLnBsYXlBbmltYXRpb25Cb3VuZCA9IHRoaXMucGxheUFuaW1hdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMucGF1c2VBbmltYXRpb25Cb3VuZCA9IHRoaXMucGF1c2VBbmltYXRpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlc3VtZUFuaW1hdGlvbkJvdW5kID0gdGhpcy5yZXN1bWVBbmltYXRpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlc3RhcnRBbmltYXRpb25Cb3VuZCA9IHRoaXMucmVzdGFydEFuaW1hdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmVwZWF0ID0gMDtcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXR0ck5hbWUgPSB0aGlzLmF0dHJOYW1lO1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgdmFyIHByb3BUeXBlID0gZ2V0UHJvcGVydHlUeXBlKGVsLCBkYXRhLnByb3BlcnR5KTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIWRhdGEucHJvcGVydHkpIHsgcmV0dXJuOyB9XG5cbiAgICAvLyBCYXNlIGNvbmZpZy5cbiAgICB0aGlzLnJlcGVhdCA9IGRhdGEucmVwZWF0O1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICBhdXRvcGxheTogZmFsc2UsXG4gICAgICBiZWdpbjogZnVuY3Rpb24gKCkge1xuICAgICAgICBlbC5lbWl0KCdhbmltYXRpb25iZWdpbicpO1xuICAgICAgICBlbC5lbWl0KGF0dHJOYW1lICsgJy1iZWdpbicpO1xuICAgICAgfSxcbiAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGVsLmVtaXQoJ2FuaW1hdGlvbmNvbXBsZXRlJyk7XG4gICAgICAgIGVsLmVtaXQoYXR0ck5hbWUgKyAnLWNvbXBsZXRlJyk7XG4gICAgICAgIC8vIFJlcGVhdC5cbiAgICAgICAgaWYgKC0tc2VsZi5yZXBlYXQgPiAwKSB7IHNlbGYuYW5pbWF0aW9uLnBsYXkoKTsgfVxuICAgICAgfSxcbiAgICAgIGRpcmVjdGlvbjogZGF0YS5kaXIsXG4gICAgICBkdXJhdGlvbjogZGF0YS5kdXIsXG4gICAgICBlYXNpbmc6IGRhdGEuZWFzaW5nLFxuICAgICAgZWxhc3RpY2l0eTogZGF0YS5lbGFzdGljaXR5LFxuICAgICAgbG9vcDogZGF0YS5sb29wXG4gICAgfTtcblxuICAgIC8vIEN1c3RvbWl6ZSBjb25maWcgYmFzZWQgb24gcHJvcGVydHkgdHlwZS5cbiAgICB2YXIgdXBkYXRlQ29uZmlnID0gY29uZmlnRGVmYXVsdDtcbiAgICBpZiAocHJvcFR5cGUgPT09ICd2ZWMyJyB8fCBwcm9wVHlwZSA9PT0gJ3ZlYzMnIHx8IHByb3BUeXBlID09PSAndmVjNCcpIHtcbiAgICAgIHVwZGF0ZUNvbmZpZyA9IGNvbmZpZ1ZlY3RvcjtcbiAgICB9XG5cbiAgICAvLyBDb25maWcuXG4gICAgdGhpcy5jb25maWcgPSB1cGRhdGVDb25maWcoZWwsIGRhdGEsIGNvbmZpZyk7XG4gICAgdGhpcy5hbmltYXRpb24gPSBhbmltZSh0aGlzLmNvbmZpZyk7XG5cbiAgICAvLyBTdG9wIHByZXZpb3VzIGFuaW1hdGlvbi5cbiAgICB0aGlzLnBhdXNlQW5pbWF0aW9uKCk7XG5cbiAgICBpZiAoIXRoaXMuZGF0YS5zdGFydEV2ZW50cy5sZW5ndGgpIHsgdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcgPSB0cnVlOyB9XG5cbiAgICAvLyBQbGF5IGFuaW1hdGlvbiBpZiBubyBob2xkaW5nIGV2ZW50LlxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gIH0sXG5cbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wYXVzZUFuaW1hdGlvbigpO1xuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgfSxcblxuICBwYXVzZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucGF1c2VBbmltYXRpb24oKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbGxlZCBhZnRlciB1cGRhdGUuXG4gICAqL1xuICBwbGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCF0aGlzLmFuaW1hdGlvbiB8fCAhdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcpIHsgcmV0dXJuOyB9XG5cbiAgICAvLyBEZWxheS5cbiAgICBpZiAoZGF0YS5kZWxheSkge1xuICAgICAgc2V0VGltZW91dChwbGF5LCBkYXRhLmRlbGF5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGxheSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBsYXkgKCkge1xuICAgICAgc2VsZi5wbGF5QW5pbWF0aW9uKCk7XG4gICAgICBzZWxmLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgfVxuICB9LFxuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgZGF0YS5zdGFydEV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucGxheUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnBhdXNlRXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5wYXVzZUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnJlc3VtZUV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucmVzdW1lQW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucmVzdGFydEV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucmVzdGFydEFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgfSxcblxuICByZW1vdmVFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIGRhdGEuc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnBsYXlBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5wYXVzZUV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucGF1c2VBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5yZXN1bWVFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3VtZUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnJlc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3RhcnRBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgcGxheUFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uLnBsYXkoKTtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IHRydWU7XG4gIH0sXG5cbiAgcGF1c2VBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbi5wYXVzZSgpO1xuICAgIHRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nID0gZmFsc2U7XG4gIH0sXG5cbiAgcmVzdW1lQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hbmltYXRpb24ucGxheSgpO1xuICAgIHRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nID0gdHJ1ZTtcbiAgfSxcblxuICByZXN0YXJ0QW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hbmltYXRpb24ucmVzdGFydCgpO1xuICAgIHRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nID0gdHJ1ZTtcbiAgfVxufSk7XG5cbi8qKlxuICogU3R1ZmYgcHJvcGVydHkgaW50byBnZW5lcmljIGBwcm9wZXJ0eWAga2V5LlxuICovXG5mdW5jdGlvbiBjb25maWdEZWZhdWx0IChlbCwgZGF0YSwgY29uZmlnKSB7XG4gIHZhciBmcm9tID0gZGF0YS5mcm9tIHx8IGdldENvbXBvbmVudFByb3BlcnR5KGVsLCBkYXRhLnByb3BlcnR5KTtcbiAgcmV0dXJuIEFGUkFNRS51dGlscy5leHRlbmQoe30sIGNvbmZpZywge1xuICAgIHRhcmdldHM6IFt7YWZyYW1lUHJvcGVydHk6IGZyb219XSxcbiAgICBhZnJhbWVQcm9wZXJ0eTogZGF0YS50byxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldENvbXBvbmVudFByb3BlcnR5KGVsLCBkYXRhLnByb3BlcnR5LCB0aGlzLnRhcmdldHNbMF0uYWZyYW1lUHJvcGVydHkpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogRXh0ZW5kIHgveS96L3cgb250byB0aGUgY29uZmlnLlxuICovXG5mdW5jdGlvbiBjb25maWdWZWN0b3IgKGVsLCBkYXRhLCBjb25maWcpIHtcbiAgdmFyIGZyb20gPSBnZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSk7XG4gIGlmIChkYXRhLmZyb20pIHsgZnJvbSA9IEFGUkFNRS51dGlscy5jb29yZGluYXRlcy5wYXJzZShkYXRhLmZyb20pOyB9XG4gIHZhciB0byA9IEFGUkFNRS51dGlscy5jb29yZGluYXRlcy5wYXJzZShkYXRhLnRvKTtcbiAgcmV0dXJuIEFGUkFNRS51dGlscy5leHRlbmQoe30sIGNvbmZpZywge1xuICAgIHRhcmdldHM6IFtmcm9tXSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldENvbXBvbmVudFByb3BlcnR5KGVsLCBkYXRhLnByb3BlcnR5LCB0aGlzLnRhcmdldHNbMF0pO1xuICAgIH1cbiAgfSwgdG8pO1xufVxuXG5mdW5jdGlvbiBnZXRQcm9wZXJ0eVR5cGUgKGVsLCBwcm9wZXJ0eSkge1xuICB2YXIgc3BsaXQgPSBwcm9wZXJ0eS5zcGxpdCgnLicpO1xuICB2YXIgY29tcG9uZW50TmFtZSA9IHNwbGl0WzBdO1xuICB2YXIgcHJvcGVydHlOYW1lID0gc3BsaXRbMV07XG4gIHZhciBjb21wb25lbnQgPSBlbC5jb21wb25lbnRzW2NvbXBvbmVudE5hbWVdIHx8IEFGUkFNRS5jb21wb25lbnRzW2NvbXBvbmVudE5hbWVdO1xuXG4gIC8vIFByaW1pdGl2ZXMuXG4gIGlmICghY29tcG9uZW50KSB7IHJldHVybiBudWxsOyB9XG5cbiAgaWYgKHByb3BlcnR5TmFtZSkge1xuICAgIHJldHVybiBjb21wb25lbnQuc2NoZW1hW3Byb3BlcnR5TmFtZV0udHlwZTtcbiAgfVxuICByZXR1cm4gY29tcG9uZW50LnNjaGVtYS50eXBlO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FmcmFtZS1hbmltYXRpb24tY29tcG9uZW50L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qXG4gKiBBbmltZSB2MS4xLjNcbiAqIGh0dHA6Ly9hbmltZS1qcy5jb21cbiAqIEphdmFTY3JpcHQgYW5pbWF0aW9uIGVuZ2luZVxuICogQ29weXJpZ2h0IChjKSAyMDE2IEp1bGlhbiBHYXJuaWVyXG4gKiBodHRwOi8vanVsaWFuZ2Fybmllci5jb21cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG5cbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAvLyBvbmx5IENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cyxcbiAgICAvLyBsaWtlIE5vZGUuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzIChyb290IGlzIHdpbmRvdylcbiAgICByb290LmFuaW1lID0gZmFjdG9yeSgpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblxuICB2YXIgdmVyc2lvbiA9ICcxLjEuMyc7XG5cbiAgLy8gRGVmYXVsdHNcblxuICB2YXIgZGVmYXVsdFNldHRpbmdzID0ge1xuICAgIGR1cmF0aW9uOiAxMDAwLFxuICAgIGRlbGF5OiAwLFxuICAgIGxvb3A6IGZhbHNlLFxuICAgIGF1dG9wbGF5OiB0cnVlLFxuICAgIGRpcmVjdGlvbjogJ25vcm1hbCcsXG4gICAgZWFzaW5nOiAnZWFzZU91dEVsYXN0aWMnLFxuICAgIGVsYXN0aWNpdHk6IDQwMCxcbiAgICByb3VuZDogZmFsc2UsXG4gICAgYmVnaW46IHVuZGVmaW5lZCxcbiAgICB1cGRhdGU6IHVuZGVmaW5lZCxcbiAgICBjb21wbGV0ZTogdW5kZWZpbmVkXG4gIH1cblxuICAvLyBUcmFuc2Zvcm1zXG5cbiAgdmFyIHZhbGlkVHJhbnNmb3JtcyA9IFsndHJhbnNsYXRlWCcsICd0cmFuc2xhdGVZJywgJ3RyYW5zbGF0ZVonLCAncm90YXRlJywgJ3JvdGF0ZVgnLCAncm90YXRlWScsICdyb3RhdGVaJywgJ3NjYWxlJywgJ3NjYWxlWCcsICdzY2FsZVknLCAnc2NhbGVaJywgJ3NrZXdYJywgJ3NrZXdZJ107XG4gIHZhciB0cmFuc2Zvcm0sIHRyYW5zZm9ybVN0ciA9ICd0cmFuc2Zvcm0nO1xuXG4gIC8vIFV0aWxzXG5cbiAgdmFyIGlzID0ge1xuICAgIGFycjogZnVuY3Rpb24oYSkgeyByZXR1cm4gQXJyYXkuaXNBcnJheShhKSB9LFxuICAgIG9iajogZnVuY3Rpb24oYSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpLmluZGV4T2YoJ09iamVjdCcpID4gLTEgfSxcbiAgICBzdmc6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGEgaW5zdGFuY2VvZiBTVkdFbGVtZW50IH0sXG4gICAgZG9tOiBmdW5jdGlvbihhKSB7IHJldHVybiBhLm5vZGVUeXBlIHx8IGlzLnN2ZyhhKSB9LFxuICAgIG51bTogZnVuY3Rpb24oYSkgeyByZXR1cm4gIWlzTmFOKHBhcnNlSW50KGEpKSB9LFxuICAgIHN0cjogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICdzdHJpbmcnIH0sXG4gICAgZm5jOiBmdW5jdGlvbihhKSB7IHJldHVybiB0eXBlb2YgYSA9PT0gJ2Z1bmN0aW9uJyB9LFxuICAgIHVuZDogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICd1bmRlZmluZWQnIH0sXG4gICAgbnVsOiBmdW5jdGlvbihhKSB7IHJldHVybiB0eXBlb2YgYSA9PT0gJ251bGwnIH0sXG4gICAgaGV4OiBmdW5jdGlvbihhKSB7IHJldHVybiAvKF4jWzAtOUEtRl17Nn0kKXwoXiNbMC05QS1GXXszfSQpL2kudGVzdChhKSB9LFxuICAgIHJnYjogZnVuY3Rpb24oYSkgeyByZXR1cm4gL15yZ2IvLnRlc3QoYSkgfSxcbiAgICBoc2w6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIC9eaHNsLy50ZXN0KGEpIH0sXG4gICAgY29sOiBmdW5jdGlvbihhKSB7IHJldHVybiAoaXMuaGV4KGEpIHx8IGlzLnJnYihhKSB8fCBpcy5oc2woYSkpIH1cbiAgfVxuXG4gIC8vIEVhc2luZ3MgZnVuY3Rpb25zIGFkYXB0ZWQgZnJvbSBodHRwOi8vanF1ZXJ5dWkuY29tL1xuXG4gIHZhciBlYXNpbmdzID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBlYXNlcyA9IHt9O1xuICAgIHZhciBuYW1lcyA9IFsnUXVhZCcsICdDdWJpYycsICdRdWFydCcsICdRdWludCcsICdFeHBvJ107XG4gICAgdmFyIGZ1bmN0aW9ucyA9IHtcbiAgICAgIFNpbmU6IGZ1bmN0aW9uKHQpIHsgcmV0dXJuIDEgKyBNYXRoLnNpbihNYXRoLlBJIC8gMiAqIHQgLSBNYXRoLlBJIC8gMik7IH0sXG4gICAgICBDaXJjOiBmdW5jdGlvbih0KSB7IHJldHVybiAxIC0gTWF0aC5zcXJ0KCAxIC0gdCAqIHQgKTsgfSxcbiAgICAgIEVsYXN0aWM6IGZ1bmN0aW9uKHQsIG0pIHtcbiAgICAgICAgaWYoIHQgPT09IDAgfHwgdCA9PT0gMSApIHJldHVybiB0O1xuICAgICAgICB2YXIgcCA9ICgxIC0gTWF0aC5taW4obSwgOTk4KSAvIDEwMDApLCBzdCA9IHQgLyAxLCBzdDEgPSBzdCAtIDEsIHMgPSBwIC8gKCAyICogTWF0aC5QSSApICogTWF0aC5hc2luKCAxICk7XG4gICAgICAgIHJldHVybiAtKCBNYXRoLnBvdyggMiwgMTAgKiBzdDEgKSAqIE1hdGguc2luKCAoIHN0MSAtIHMgKSAqICggMiAqIE1hdGguUEkgKSAvIHAgKSApO1xuICAgICAgfSxcbiAgICAgIEJhY2s6IGZ1bmN0aW9uKHQpIHsgcmV0dXJuIHQgKiB0ICogKCAzICogdCAtIDIgKTsgfSxcbiAgICAgIEJvdW5jZTogZnVuY3Rpb24odCkge1xuICAgICAgICB2YXIgcG93MiwgYm91bmNlID0gNDtcbiAgICAgICAgd2hpbGUgKCB0IDwgKCAoIHBvdzIgPSBNYXRoLnBvdyggMiwgLS1ib3VuY2UgKSApIC0gMSApIC8gMTEgKSB7fVxuICAgICAgICByZXR1cm4gMSAvIE1hdGgucG93KCA0LCAzIC0gYm91bmNlICkgLSA3LjU2MjUgKiBNYXRoLnBvdyggKCBwb3cyICogMyAtIDIgKSAvIDIyIC0gdCwgMiApO1xuICAgICAgfVxuICAgIH1cbiAgICBuYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUsIGkpIHtcbiAgICAgIGZ1bmN0aW9uc1tuYW1lXSA9IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KCB0LCBpICsgMiApO1xuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5rZXlzKGZ1bmN0aW9ucykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgZWFzZUluID0gZnVuY3Rpb25zW25hbWVdO1xuICAgICAgZWFzZXNbJ2Vhc2VJbicgKyBuYW1lXSA9IGVhc2VJbjtcbiAgICAgIGVhc2VzWydlYXNlT3V0JyArIG5hbWVdID0gZnVuY3Rpb24odCwgbSkgeyByZXR1cm4gMSAtIGVhc2VJbigxIC0gdCwgbSk7IH07XG4gICAgICBlYXNlc1snZWFzZUluT3V0JyArIG5hbWVdID0gZnVuY3Rpb24odCwgbSkgeyByZXR1cm4gdCA8IDAuNSA/IGVhc2VJbih0ICogMiwgbSkgLyAyIDogMSAtIGVhc2VJbih0ICogLTIgKyAyLCBtKSAvIDI7IH07XG4gICAgICBlYXNlc1snZWFzZU91dEluJyArIG5hbWVdID0gZnVuY3Rpb24odCwgbSkgeyByZXR1cm4gdCA8IDAuNSA/ICgxIC0gZWFzZUluKDEgLSAyICogdCwgbSkpIC8gMiA6IChlYXNlSW4odCAqIDIgLSAxLCBtKSArIDEpIC8gMjsgfTtcbiAgICB9KTtcbiAgICBlYXNlcy5saW5lYXIgPSBmdW5jdGlvbih0KSB7IHJldHVybiB0OyB9O1xuICAgIHJldHVybiBlYXNlcztcbiAgfSkoKTtcblxuICAvLyBTdHJpbmdzXG5cbiAgdmFyIG51bWJlclRvU3RyaW5nID0gZnVuY3Rpb24odmFsKSB7XG4gICAgcmV0dXJuIChpcy5zdHIodmFsKSkgPyB2YWwgOiB2YWwgKyAnJztcbiAgfVxuXG4gIHZhciBzdHJpbmdUb0h5cGhlbnMgPSBmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICB2YXIgc2VsZWN0U3RyaW5nID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgaWYgKGlzLmNvbChzdHIpKSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc3RyKTtcbiAgICAgIHJldHVybiBub2RlcztcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvLyBOdW1iZXJzXG5cbiAgdmFyIHJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG4gIH1cblxuICAvLyBBcnJheXNcblxuICB2YXIgZmxhdHRlbkFycmF5ID0gZnVuY3Rpb24oYXJyKSB7XG4gICAgcmV0dXJuIGFyci5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGEuY29uY2F0KGlzLmFycihiKSA/IGZsYXR0ZW5BcnJheShiKSA6IGIpO1xuICAgIH0sIFtdKTtcbiAgfVxuXG4gIHZhciB0b0FycmF5ID0gZnVuY3Rpb24obykge1xuICAgIGlmIChpcy5hcnIobykpIHJldHVybiBvO1xuICAgIGlmIChpcy5zdHIobykpIG8gPSBzZWxlY3RTdHJpbmcobykgfHwgbztcbiAgICBpZiAobyBpbnN0YW5jZW9mIE5vZGVMaXN0IHx8IG8gaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvbikgcmV0dXJuIFtdLnNsaWNlLmNhbGwobyk7XG4gICAgcmV0dXJuIFtvXTtcbiAgfVxuXG4gIHZhciBhcnJheUNvbnRhaW5zID0gZnVuY3Rpb24oYXJyLCB2YWwpIHtcbiAgICByZXR1cm4gYXJyLnNvbWUoZnVuY3Rpb24oYSkgeyByZXR1cm4gYSA9PT0gdmFsOyB9KTtcbiAgfVxuXG4gIHZhciBncm91cEFycmF5QnlQcm9wcyA9IGZ1bmN0aW9uKGFyciwgcHJvcHNBcnIpIHtcbiAgICB2YXIgZ3JvdXBzID0ge307XG4gICAgYXJyLmZvckVhY2goZnVuY3Rpb24obykge1xuICAgICAgdmFyIGdyb3VwID0gSlNPTi5zdHJpbmdpZnkocHJvcHNBcnIubWFwKGZ1bmN0aW9uKHApIHsgcmV0dXJuIG9bcF07IH0pKTtcbiAgICAgIGdyb3Vwc1tncm91cF0gPSBncm91cHNbZ3JvdXBdIHx8IFtdO1xuICAgICAgZ3JvdXBzW2dyb3VwXS5wdXNoKG8pO1xuICAgIH0pO1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhncm91cHMpLm1hcChmdW5jdGlvbihncm91cCkge1xuICAgICAgcmV0dXJuIGdyb3Vwc1tncm91cF07XG4gICAgfSk7XG4gIH1cblxuICB2YXIgcmVtb3ZlQXJyYXlEdXBsaWNhdGVzID0gZnVuY3Rpb24oYXJyKSB7XG4gICAgcmV0dXJuIGFyci5maWx0ZXIoZnVuY3Rpb24oaXRlbSwgcG9zLCBzZWxmKSB7XG4gICAgICByZXR1cm4gc2VsZi5pbmRleE9mKGl0ZW0pID09PSBwb3M7XG4gICAgfSk7XG4gIH1cblxuICAvLyBPYmplY3RzXG5cbiAgdmFyIGNsb25lT2JqZWN0ID0gZnVuY3Rpb24obykge1xuICAgIHZhciBuZXdPYmplY3QgPSB7fTtcbiAgICBmb3IgKHZhciBwIGluIG8pIG5ld09iamVjdFtwXSA9IG9bcF07XG4gICAgcmV0dXJuIG5ld09iamVjdDtcbiAgfVxuXG4gIHZhciBtZXJnZU9iamVjdHMgPSBmdW5jdGlvbihvMSwgbzIpIHtcbiAgICBmb3IgKHZhciBwIGluIG8yKSBvMVtwXSA9ICFpcy51bmQobzFbcF0pID8gbzFbcF0gOiBvMltwXTtcbiAgICByZXR1cm4gbzE7XG4gIH1cblxuICAvLyBDb2xvcnNcblxuICB2YXIgaGV4VG9SZ2IgPSBmdW5jdGlvbihoZXgpIHtcbiAgICB2YXIgcmd4ID0gL14jPyhbYS1mXFxkXSkoW2EtZlxcZF0pKFthLWZcXGRdKSQvaTtcbiAgICB2YXIgaGV4ID0gaGV4LnJlcGxhY2Uocmd4LCBmdW5jdGlvbihtLCByLCBnLCBiKSB7IHJldHVybiByICsgciArIGcgKyBnICsgYiArIGI7IH0pO1xuICAgIHZhciByZ2IgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KTtcbiAgICB2YXIgciA9IHBhcnNlSW50KHJnYlsxXSwgMTYpO1xuICAgIHZhciBnID0gcGFyc2VJbnQocmdiWzJdLCAxNik7XG4gICAgdmFyIGIgPSBwYXJzZUludChyZ2JbM10sIDE2KTtcbiAgICByZXR1cm4gJ3JnYignICsgciArICcsJyArIGcgKyAnLCcgKyBiICsgJyknO1xuICB9XG5cbiAgdmFyIGhzbFRvUmdiID0gZnVuY3Rpb24oaHNsKSB7XG4gICAgdmFyIGhzbCA9IC9oc2xcXCgoXFxkKyksXFxzKihbXFxkLl0rKSUsXFxzKihbXFxkLl0rKSVcXCkvZy5leGVjKGhzbCk7XG4gICAgdmFyIGggPSBwYXJzZUludChoc2xbMV0pIC8gMzYwO1xuICAgIHZhciBzID0gcGFyc2VJbnQoaHNsWzJdKSAvIDEwMDtcbiAgICB2YXIgbCA9IHBhcnNlSW50KGhzbFszXSkgLyAxMDA7XG4gICAgdmFyIGh1ZTJyZ2IgPSBmdW5jdGlvbihwLCBxLCB0KSB7XG4gICAgICBpZiAodCA8IDApIHQgKz0gMTtcbiAgICAgIGlmICh0ID4gMSkgdCAtPSAxO1xuICAgICAgaWYgKHQgPCAxLzYpIHJldHVybiBwICsgKHEgLSBwKSAqIDYgKiB0O1xuICAgICAgaWYgKHQgPCAxLzIpIHJldHVybiBxO1xuICAgICAgaWYgKHQgPCAyLzMpIHJldHVybiBwICsgKHEgLSBwKSAqICgyLzMgLSB0KSAqIDY7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgdmFyIHIsIGcsIGI7XG4gICAgaWYgKHMgPT0gMCkge1xuICAgICAgciA9IGcgPSBiID0gbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHEgPSBsIDwgMC41ID8gbCAqICgxICsgcykgOiBsICsgcyAtIGwgKiBzO1xuICAgICAgdmFyIHAgPSAyICogbCAtIHE7XG4gICAgICByID0gaHVlMnJnYihwLCBxLCBoICsgMS8zKTtcbiAgICAgIGcgPSBodWUycmdiKHAsIHEsIGgpO1xuICAgICAgYiA9IGh1ZTJyZ2IocCwgcSwgaCAtIDEvMyk7XG4gICAgfVxuICAgIHJldHVybiAncmdiKCcgKyByICogMjU1ICsgJywnICsgZyAqIDI1NSArICcsJyArIGIgKiAyNTUgKyAnKSc7XG4gIH1cblxuICB2YXIgY29sb3JUb1JnYiA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIGlmIChpcy5yZ2IodmFsKSkgcmV0dXJuIHZhbDtcbiAgICBpZiAoaXMuaGV4KHZhbCkpIHJldHVybiBoZXhUb1JnYih2YWwpO1xuICAgIGlmIChpcy5oc2wodmFsKSkgcmV0dXJuIGhzbFRvUmdiKHZhbCk7XG4gIH1cblxuICAvLyBVbml0c1xuXG4gIHZhciBnZXRVbml0ID0gZnVuY3Rpb24odmFsKSB7XG4gICAgcmV0dXJuIC8oW1xcK1xcLV0/WzAtOXxhdXRvXFwuXSspKCV8cHh8cHR8ZW18cmVtfGlufGNtfG1tfGV4fHBjfHZ3fHZofGRlZyk/Ly5leGVjKHZhbClbMl07XG4gIH1cblxuICB2YXIgYWRkRGVmYXVsdFRyYW5zZm9ybVVuaXQgPSBmdW5jdGlvbihwcm9wLCB2YWwsIGludGlhbFZhbCkge1xuICAgIGlmIChnZXRVbml0KHZhbCkpIHJldHVybiB2YWw7XG4gICAgaWYgKHByb3AuaW5kZXhPZigndHJhbnNsYXRlJykgPiAtMSkgcmV0dXJuIGdldFVuaXQoaW50aWFsVmFsKSA/IHZhbCArIGdldFVuaXQoaW50aWFsVmFsKSA6IHZhbCArICdweCc7XG4gICAgaWYgKHByb3AuaW5kZXhPZigncm90YXRlJykgPiAtMSB8fCBwcm9wLmluZGV4T2YoJ3NrZXcnKSA+IC0xKSByZXR1cm4gdmFsICsgJ2RlZyc7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuXG4gIC8vIFZhbHVlc1xuXG4gIHZhciBnZXRDU1NWYWx1ZSA9IGZ1bmN0aW9uKGVsLCBwcm9wKSB7XG4gICAgLy8gRmlyc3QgY2hlY2sgaWYgcHJvcCBpcyBhIHZhbGlkIENTUyBwcm9wZXJ0eVxuICAgIGlmIChwcm9wIGluIGVsLnN0eWxlKSB7XG4gICAgICAvLyBUaGVuIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb3IgZmFsbGJhY2sgdG8gJzAnIHdoZW4gZ2V0UHJvcGVydHlWYWx1ZSBmYWlsc1xuICAgICAgcmV0dXJuIGdldENvbXB1dGVkU3R5bGUoZWwpLmdldFByb3BlcnR5VmFsdWUoc3RyaW5nVG9IeXBoZW5zKHByb3ApKSB8fCAnMCc7XG4gICAgfVxuICB9XG5cbiAgdmFyIGdldFRyYW5zZm9ybVZhbHVlID0gZnVuY3Rpb24oZWwsIHByb3ApIHtcbiAgICB2YXIgZGVmYXVsdFZhbCA9IHByb3AuaW5kZXhPZignc2NhbGUnKSA+IC0xID8gMSA6IDA7XG4gICAgdmFyIHN0ciA9IGVsLnN0eWxlLnRyYW5zZm9ybTtcbiAgICBpZiAoIXN0cikgcmV0dXJuIGRlZmF1bHRWYWw7XG4gICAgdmFyIHJneCA9IC8oXFx3KylcXCgoLis/KVxcKS9nO1xuICAgIHZhciBtYXRjaCA9IFtdO1xuICAgIHZhciBwcm9wcyA9IFtdO1xuICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICB3aGlsZSAobWF0Y2ggPSByZ3guZXhlYyhzdHIpKSB7XG4gICAgICBwcm9wcy5wdXNoKG1hdGNoWzFdKTtcbiAgICAgIHZhbHVlcy5wdXNoKG1hdGNoWzJdKTtcbiAgICB9XG4gICAgdmFyIHZhbCA9IHZhbHVlcy5maWx0ZXIoZnVuY3Rpb24oZiwgaSkgeyByZXR1cm4gcHJvcHNbaV0gPT09IHByb3A7IH0pO1xuICAgIHJldHVybiB2YWwubGVuZ3RoID8gdmFsWzBdIDogZGVmYXVsdFZhbDtcbiAgfVxuXG4gIHZhciBnZXRBbmltYXRpb25UeXBlID0gZnVuY3Rpb24oZWwsIHByb3ApIHtcbiAgICBpZiAoIGlzLmRvbShlbCkgJiYgYXJyYXlDb250YWlucyh2YWxpZFRyYW5zZm9ybXMsIHByb3ApKSByZXR1cm4gJ3RyYW5zZm9ybSc7XG4gICAgaWYgKCBpcy5kb20oZWwpICYmIChlbC5nZXRBdHRyaWJ1dGUocHJvcCkgfHwgKGlzLnN2ZyhlbCkgJiYgZWxbcHJvcF0pKSkgcmV0dXJuICdhdHRyaWJ1dGUnO1xuICAgIGlmICggaXMuZG9tKGVsKSAmJiAocHJvcCAhPT0gJ3RyYW5zZm9ybScgJiYgZ2V0Q1NTVmFsdWUoZWwsIHByb3ApKSkgcmV0dXJuICdjc3MnO1xuICAgIGlmICghaXMubnVsKGVsW3Byb3BdKSAmJiAhaXMudW5kKGVsW3Byb3BdKSkgcmV0dXJuICdvYmplY3QnO1xuICB9XG5cbiAgdmFyIGdldEluaXRpYWxUYXJnZXRWYWx1ZSA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCkge1xuICAgIHN3aXRjaCAoZ2V0QW5pbWF0aW9uVHlwZSh0YXJnZXQsIHByb3ApKSB7XG4gICAgICBjYXNlICd0cmFuc2Zvcm0nOiByZXR1cm4gZ2V0VHJhbnNmb3JtVmFsdWUodGFyZ2V0LCBwcm9wKTtcbiAgICAgIGNhc2UgJ2Nzcyc6IHJldHVybiBnZXRDU1NWYWx1ZSh0YXJnZXQsIHByb3ApO1xuICAgICAgY2FzZSAnYXR0cmlidXRlJzogcmV0dXJuIHRhcmdldC5nZXRBdHRyaWJ1dGUocHJvcCk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXRbcHJvcF0gfHwgMDtcbiAgfVxuXG4gIHZhciBnZXRWYWxpZFZhbHVlID0gZnVuY3Rpb24odmFsdWVzLCB2YWwsIG9yaWdpbmFsQ1NTKSB7XG4gICAgaWYgKGlzLmNvbCh2YWwpKSByZXR1cm4gY29sb3JUb1JnYih2YWwpO1xuICAgIGlmIChnZXRVbml0KHZhbCkpIHJldHVybiB2YWw7XG4gICAgdmFyIHVuaXQgPSBnZXRVbml0KHZhbHVlcy50bykgPyBnZXRVbml0KHZhbHVlcy50bykgOiBnZXRVbml0KHZhbHVlcy5mcm9tKTtcbiAgICBpZiAoIXVuaXQgJiYgb3JpZ2luYWxDU1MpIHVuaXQgPSBnZXRVbml0KG9yaWdpbmFsQ1NTKTtcbiAgICByZXR1cm4gdW5pdCA/IHZhbCArIHVuaXQgOiB2YWw7XG4gIH1cblxuICB2YXIgZGVjb21wb3NlVmFsdWUgPSBmdW5jdGlvbih2YWwpIHtcbiAgICB2YXIgcmd4ID0gLy0/XFxkKlxcLj9cXGQrL2c7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9yaWdpbmFsOiB2YWwsXG4gICAgICBudW1iZXJzOiBudW1iZXJUb1N0cmluZyh2YWwpLm1hdGNoKHJneCkgPyBudW1iZXJUb1N0cmluZyh2YWwpLm1hdGNoKHJneCkubWFwKE51bWJlcikgOiBbMF0sXG4gICAgICBzdHJpbmdzOiBudW1iZXJUb1N0cmluZyh2YWwpLnNwbGl0KHJneClcbiAgICB9XG4gIH1cblxuICB2YXIgcmVjb21wb3NlVmFsdWUgPSBmdW5jdGlvbihudW1iZXJzLCBzdHJpbmdzLCBpbml0aWFsU3RyaW5ncykge1xuICAgIHJldHVybiBzdHJpbmdzLnJlZHVjZShmdW5jdGlvbihhLCBiLCBpKSB7XG4gICAgICB2YXIgYiA9IChiID8gYiA6IGluaXRpYWxTdHJpbmdzW2kgLSAxXSk7XG4gICAgICByZXR1cm4gYSArIG51bWJlcnNbaSAtIDFdICsgYjtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEFuaW1hdGFibGVzXG5cbiAgdmFyIGdldEFuaW1hdGFibGVzID0gZnVuY3Rpb24odGFyZ2V0cykge1xuICAgIHZhciB0YXJnZXRzID0gdGFyZ2V0cyA/IChmbGF0dGVuQXJyYXkoaXMuYXJyKHRhcmdldHMpID8gdGFyZ2V0cy5tYXAodG9BcnJheSkgOiB0b0FycmF5KHRhcmdldHMpKSkgOiBbXTtcbiAgICByZXR1cm4gdGFyZ2V0cy5tYXAoZnVuY3Rpb24odCwgaSkge1xuICAgICAgcmV0dXJuIHsgdGFyZ2V0OiB0LCBpZDogaSB9O1xuICAgIH0pO1xuICB9XG5cbiAgLy8gUHJvcGVydGllc1xuXG4gIHZhciBnZXRQcm9wZXJ0aWVzID0gZnVuY3Rpb24ocGFyYW1zLCBzZXR0aW5ncykge1xuICAgIHZhciBwcm9wcyA9IFtdO1xuICAgIGZvciAodmFyIHAgaW4gcGFyYW1zKSB7XG4gICAgICBpZiAoIWRlZmF1bHRTZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eShwKSAmJiBwICE9PSAndGFyZ2V0cycpIHtcbiAgICAgICAgdmFyIHByb3AgPSBpcy5vYmoocGFyYW1zW3BdKSA/IGNsb25lT2JqZWN0KHBhcmFtc1twXSkgOiB7dmFsdWU6IHBhcmFtc1twXX07XG4gICAgICAgIHByb3AubmFtZSA9IHA7XG4gICAgICAgIHByb3BzLnB1c2gobWVyZ2VPYmplY3RzKHByb3AsIHNldHRpbmdzKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwcm9wcztcbiAgfVxuXG4gIHZhciBnZXRQcm9wZXJ0aWVzVmFsdWVzID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wLCB2YWx1ZSwgaSkge1xuICAgIHZhciB2YWx1ZXMgPSB0b0FycmF5KCBpcy5mbmModmFsdWUpID8gdmFsdWUodGFyZ2V0LCBpKSA6IHZhbHVlKTtcbiAgICByZXR1cm4ge1xuICAgICAgZnJvbTogKHZhbHVlcy5sZW5ndGggPiAxKSA/IHZhbHVlc1swXSA6IGdldEluaXRpYWxUYXJnZXRWYWx1ZSh0YXJnZXQsIHByb3ApLFxuICAgICAgdG86ICh2YWx1ZXMubGVuZ3RoID4gMSkgPyB2YWx1ZXNbMV0gOiB2YWx1ZXNbMF1cbiAgICB9XG4gIH1cblxuICAvLyBUd2VlbnNcblxuICB2YXIgZ2V0VHdlZW5WYWx1ZXMgPSBmdW5jdGlvbihwcm9wLCB2YWx1ZXMsIHR5cGUsIHRhcmdldCkge1xuICAgIHZhciB2YWxpZCA9IHt9O1xuICAgIGlmICh0eXBlID09PSAndHJhbnNmb3JtJykge1xuICAgICAgdmFsaWQuZnJvbSA9IHByb3AgKyAnKCcgKyBhZGREZWZhdWx0VHJhbnNmb3JtVW5pdChwcm9wLCB2YWx1ZXMuZnJvbSwgdmFsdWVzLnRvKSArICcpJztcbiAgICAgIHZhbGlkLnRvID0gcHJvcCArICcoJyArIGFkZERlZmF1bHRUcmFuc2Zvcm1Vbml0KHByb3AsIHZhbHVlcy50bykgKyAnKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBvcmlnaW5hbENTUyA9ICh0eXBlID09PSAnY3NzJykgPyBnZXRDU1NWYWx1ZSh0YXJnZXQsIHByb3ApIDogdW5kZWZpbmVkO1xuICAgICAgdmFsaWQuZnJvbSA9IGdldFZhbGlkVmFsdWUodmFsdWVzLCB2YWx1ZXMuZnJvbSwgb3JpZ2luYWxDU1MpO1xuICAgICAgdmFsaWQudG8gPSBnZXRWYWxpZFZhbHVlKHZhbHVlcywgdmFsdWVzLnRvLCBvcmlnaW5hbENTUyk7XG4gICAgfVxuICAgIHJldHVybiB7IGZyb206IGRlY29tcG9zZVZhbHVlKHZhbGlkLmZyb20pLCB0bzogZGVjb21wb3NlVmFsdWUodmFsaWQudG8pIH07XG4gIH1cblxuICB2YXIgZ2V0VHdlZW5zUHJvcHMgPSBmdW5jdGlvbihhbmltYXRhYmxlcywgcHJvcHMpIHtcbiAgICB2YXIgdHdlZW5zUHJvcHMgPSBbXTtcbiAgICBhbmltYXRhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uKGFuaW1hdGFibGUsIGkpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBhbmltYXRhYmxlLnRhcmdldDtcbiAgICAgIHJldHVybiBwcm9wcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgICAgdmFyIGFuaW1UeXBlID0gZ2V0QW5pbWF0aW9uVHlwZSh0YXJnZXQsIHByb3AubmFtZSk7XG4gICAgICAgIGlmIChhbmltVHlwZSkge1xuICAgICAgICAgIHZhciB2YWx1ZXMgPSBnZXRQcm9wZXJ0aWVzVmFsdWVzKHRhcmdldCwgcHJvcC5uYW1lLCBwcm9wLnZhbHVlLCBpKTtcbiAgICAgICAgICB2YXIgdHdlZW4gPSBjbG9uZU9iamVjdChwcm9wKTtcbiAgICAgICAgICB0d2Vlbi5hbmltYXRhYmxlcyA9IGFuaW1hdGFibGU7XG4gICAgICAgICAgdHdlZW4udHlwZSA9IGFuaW1UeXBlO1xuICAgICAgICAgIHR3ZWVuLmZyb20gPSBnZXRUd2VlblZhbHVlcyhwcm9wLm5hbWUsIHZhbHVlcywgdHdlZW4udHlwZSwgdGFyZ2V0KS5mcm9tO1xuICAgICAgICAgIHR3ZWVuLnRvID0gZ2V0VHdlZW5WYWx1ZXMocHJvcC5uYW1lLCB2YWx1ZXMsIHR3ZWVuLnR5cGUsIHRhcmdldCkudG87XG4gICAgICAgICAgdHdlZW4ucm91bmQgPSAoaXMuY29sKHZhbHVlcy5mcm9tKSB8fCB0d2Vlbi5yb3VuZCkgPyAxIDogMDtcbiAgICAgICAgICB0d2Vlbi5kZWxheSA9IChpcy5mbmModHdlZW4uZGVsYXkpID8gdHdlZW4uZGVsYXkodGFyZ2V0LCBpLCBhbmltYXRhYmxlcy5sZW5ndGgpIDogdHdlZW4uZGVsYXkpIC8gYW5pbWF0aW9uLnNwZWVkO1xuICAgICAgICAgIHR3ZWVuLmR1cmF0aW9uID0gKGlzLmZuYyh0d2Vlbi5kdXJhdGlvbikgPyB0d2Vlbi5kdXJhdGlvbih0YXJnZXQsIGksIGFuaW1hdGFibGVzLmxlbmd0aCkgOiB0d2Vlbi5kdXJhdGlvbikgLyBhbmltYXRpb24uc3BlZWQ7XG4gICAgICAgICAgdHdlZW5zUHJvcHMucHVzaCh0d2Vlbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB0d2VlbnNQcm9wcztcbiAgfVxuXG4gIHZhciBnZXRUd2VlbnMgPSBmdW5jdGlvbihhbmltYXRhYmxlcywgcHJvcHMpIHtcbiAgICB2YXIgdHdlZW5zUHJvcHMgPSBnZXRUd2VlbnNQcm9wcyhhbmltYXRhYmxlcywgcHJvcHMpO1xuICAgIHZhciBzcGxpdHRlZFByb3BzID0gZ3JvdXBBcnJheUJ5UHJvcHModHdlZW5zUHJvcHMsIFsnbmFtZScsICdmcm9tJywgJ3RvJywgJ2RlbGF5JywgJ2R1cmF0aW9uJ10pO1xuICAgIHJldHVybiBzcGxpdHRlZFByb3BzLm1hcChmdW5jdGlvbih0d2VlblByb3BzKSB7XG4gICAgICB2YXIgdHdlZW4gPSBjbG9uZU9iamVjdCh0d2VlblByb3BzWzBdKTtcbiAgICAgIHR3ZWVuLmFuaW1hdGFibGVzID0gdHdlZW5Qcm9wcy5tYXAoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5hbmltYXRhYmxlcyB9KTtcbiAgICAgIHR3ZWVuLnRvdGFsRHVyYXRpb24gPSB0d2Vlbi5kZWxheSArIHR3ZWVuLmR1cmF0aW9uO1xuICAgICAgcmV0dXJuIHR3ZWVuO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIHJldmVyc2VUd2VlbnMgPSBmdW5jdGlvbihhbmltLCBkZWxheXMpIHtcbiAgICBhbmltLnR3ZWVucy5mb3JFYWNoKGZ1bmN0aW9uKHR3ZWVuKSB7XG4gICAgICB2YXIgdG9WYWwgPSB0d2Vlbi50bztcbiAgICAgIHZhciBmcm9tVmFsID0gdHdlZW4uZnJvbTtcbiAgICAgIHZhciBkZWxheVZhbCA9IGFuaW0uZHVyYXRpb24gLSAodHdlZW4uZGVsYXkgKyB0d2Vlbi5kdXJhdGlvbik7XG4gICAgICB0d2Vlbi5mcm9tID0gdG9WYWw7XG4gICAgICB0d2Vlbi50byA9IGZyb21WYWw7XG4gICAgICBpZiAoZGVsYXlzKSB0d2Vlbi5kZWxheSA9IGRlbGF5VmFsO1xuICAgIH0pO1xuICAgIGFuaW0ucmV2ZXJzZWQgPSBhbmltLnJldmVyc2VkID8gZmFsc2UgOiB0cnVlO1xuICB9XG5cbiAgdmFyIGdldFR3ZWVuc0R1cmF0aW9uID0gZnVuY3Rpb24odHdlZW5zKSB7XG4gICAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KE1hdGgsIHR3ZWVucy5tYXAoZnVuY3Rpb24odHdlZW4peyByZXR1cm4gdHdlZW4udG90YWxEdXJhdGlvbjsgfSkpO1xuICB9XG5cbiAgdmFyIGdldFR3ZWVuc0RlbGF5ID0gZnVuY3Rpb24odHdlZW5zKSB7XG4gICAgcmV0dXJuIE1hdGgubWluLmFwcGx5KE1hdGgsIHR3ZWVucy5tYXAoZnVuY3Rpb24odHdlZW4peyByZXR1cm4gdHdlZW4uZGVsYXk7IH0pKTtcbiAgfVxuXG4gIC8vIHdpbGwtY2hhbmdlXG5cbiAgdmFyIGdldFdpbGxDaGFuZ2UgPSBmdW5jdGlvbihhbmltKSB7XG4gICAgdmFyIHByb3BzID0gW107XG4gICAgdmFyIGVscyA9IFtdO1xuICAgIGFuaW0udHdlZW5zLmZvckVhY2goZnVuY3Rpb24odHdlZW4pIHtcbiAgICAgIGlmICh0d2Vlbi50eXBlID09PSAnY3NzJyB8fCB0d2Vlbi50eXBlID09PSAndHJhbnNmb3JtJyApIHtcbiAgICAgICAgcHJvcHMucHVzaCh0d2Vlbi50eXBlID09PSAnY3NzJyA/IHN0cmluZ1RvSHlwaGVucyh0d2Vlbi5uYW1lKSA6ICd0cmFuc2Zvcm0nKTtcbiAgICAgICAgdHdlZW4uYW5pbWF0YWJsZXMuZm9yRWFjaChmdW5jdGlvbihhbmltYXRhYmxlKSB7IGVscy5wdXNoKGFuaW1hdGFibGUudGFyZ2V0KTsgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3BlcnRpZXM6IHJlbW92ZUFycmF5RHVwbGljYXRlcyhwcm9wcykuam9pbignLCAnKSxcbiAgICAgIGVsZW1lbnRzOiByZW1vdmVBcnJheUR1cGxpY2F0ZXMoZWxzKVxuICAgIH1cbiAgfVxuXG4gIHZhciBzZXRXaWxsQ2hhbmdlID0gZnVuY3Rpb24oYW5pbSkge1xuICAgIHZhciB3aWxsQ2hhbmdlID0gZ2V0V2lsbENoYW5nZShhbmltKTtcbiAgICB3aWxsQ2hhbmdlLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgZWxlbWVudC5zdHlsZS53aWxsQ2hhbmdlID0gd2lsbENoYW5nZS5wcm9wZXJ0aWVzO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIHJlbW92ZVdpbGxDaGFuZ2UgPSBmdW5jdGlvbihhbmltKSB7XG4gICAgdmFyIHdpbGxDaGFuZ2UgPSBnZXRXaWxsQ2hhbmdlKGFuaW0pO1xuICAgIHdpbGxDaGFuZ2UuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICBlbGVtZW50LnN0eWxlLnJlbW92ZVByb3BlcnR5KCd3aWxsLWNoYW5nZScpO1xuICAgIH0pO1xuICB9XG5cbiAgLyogU3ZnIHBhdGggKi9cblxuICB2YXIgZ2V0UGF0aFByb3BzID0gZnVuY3Rpb24ocGF0aCkge1xuICAgIHZhciBlbCA9IGlzLnN0cihwYXRoKSA/IHNlbGVjdFN0cmluZyhwYXRoKVswXSA6IHBhdGg7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhdGg6IGVsLFxuICAgICAgdmFsdWU6IGVsLmdldFRvdGFsTGVuZ3RoKClcbiAgICB9XG4gIH1cblxuICB2YXIgc25hcFByb2dyZXNzVG9QYXRoID0gZnVuY3Rpb24odHdlZW4sIHByb2dyZXNzKSB7XG4gICAgdmFyIHBhdGhFbCA9IHR3ZWVuLnBhdGg7XG4gICAgdmFyIHBhdGhQcm9ncmVzcyA9IHR3ZWVuLnZhbHVlICogcHJvZ3Jlc3M7XG4gICAgdmFyIHBvaW50ID0gZnVuY3Rpb24ob2Zmc2V0KSB7XG4gICAgICB2YXIgbyA9IG9mZnNldCB8fCAwO1xuICAgICAgdmFyIHAgPSBwcm9ncmVzcyA+IDEgPyB0d2Vlbi52YWx1ZSArIG8gOiBwYXRoUHJvZ3Jlc3MgKyBvO1xuICAgICAgcmV0dXJuIHBhdGhFbC5nZXRQb2ludEF0TGVuZ3RoKHApO1xuICAgIH1cbiAgICB2YXIgcCA9IHBvaW50KCk7XG4gICAgdmFyIHAwID0gcG9pbnQoLTEpO1xuICAgIHZhciBwMSA9IHBvaW50KCsxKTtcbiAgICBzd2l0Y2ggKHR3ZWVuLm5hbWUpIHtcbiAgICAgIGNhc2UgJ3RyYW5zbGF0ZVgnOiByZXR1cm4gcC54O1xuICAgICAgY2FzZSAndHJhbnNsYXRlWSc6IHJldHVybiBwLnk7XG4gICAgICBjYXNlICdyb3RhdGUnOiByZXR1cm4gTWF0aC5hdGFuMihwMS55IC0gcDAueSwgcDEueCAtIHAwLngpICogMTgwIC8gTWF0aC5QSTtcbiAgICB9XG4gIH1cblxuICAvLyBQcm9ncmVzc1xuXG4gIHZhciBnZXRUd2VlblByb2dyZXNzID0gZnVuY3Rpb24odHdlZW4sIHRpbWUpIHtcbiAgICB2YXIgZWxhcHNlZCA9IE1hdGgubWluKE1hdGgubWF4KHRpbWUgLSB0d2Vlbi5kZWxheSwgMCksIHR3ZWVuLmR1cmF0aW9uKTtcbiAgICB2YXIgcGVyY2VudCA9IGVsYXBzZWQgLyB0d2Vlbi5kdXJhdGlvbjtcbiAgICB2YXIgcHJvZ3Jlc3MgPSB0d2Vlbi50by5udW1iZXJzLm1hcChmdW5jdGlvbihudW1iZXIsIHApIHtcbiAgICAgIHZhciBzdGFydCA9IHR3ZWVuLmZyb20ubnVtYmVyc1twXTtcbiAgICAgIHZhciBlYXNlZCA9IGVhc2luZ3NbdHdlZW4uZWFzaW5nXShwZXJjZW50LCB0d2Vlbi5lbGFzdGljaXR5KTtcbiAgICAgIHZhciB2YWwgPSB0d2Vlbi5wYXRoID8gc25hcFByb2dyZXNzVG9QYXRoKHR3ZWVuLCBlYXNlZCkgOiBzdGFydCArIGVhc2VkICogKG51bWJlciAtIHN0YXJ0KTtcbiAgICAgIHZhbCA9IHR3ZWVuLnJvdW5kID8gTWF0aC5yb3VuZCh2YWwgKiB0d2Vlbi5yb3VuZCkgLyB0d2Vlbi5yb3VuZCA6IHZhbDtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlY29tcG9zZVZhbHVlKHByb2dyZXNzLCB0d2Vlbi50by5zdHJpbmdzLCB0d2Vlbi5mcm9tLnN0cmluZ3MpO1xuICB9XG5cbiAgdmFyIHNldEFuaW1hdGlvblByb2dyZXNzID0gZnVuY3Rpb24oYW5pbSwgdGltZSkge1xuICAgIHZhciB0cmFuc2Zvcm1zO1xuICAgIGFuaW0uY3VycmVudFRpbWUgPSB0aW1lO1xuICAgIGFuaW0ucHJvZ3Jlc3MgPSAodGltZSAvIGFuaW0uZHVyYXRpb24pICogMTAwO1xuICAgIGZvciAodmFyIHQgPSAwOyB0IDwgYW5pbS50d2VlbnMubGVuZ3RoOyB0KyspIHtcbiAgICAgIHZhciB0d2VlbiA9IGFuaW0udHdlZW5zW3RdO1xuICAgICAgdHdlZW4uY3VycmVudFZhbHVlID0gZ2V0VHdlZW5Qcm9ncmVzcyh0d2VlbiwgdGltZSk7XG4gICAgICB2YXIgcHJvZ3Jlc3MgPSB0d2Vlbi5jdXJyZW50VmFsdWU7XG4gICAgICBmb3IgKHZhciBhID0gMDsgYSA8IHR3ZWVuLmFuaW1hdGFibGVzLmxlbmd0aDsgYSsrKSB7XG4gICAgICAgIHZhciBhbmltYXRhYmxlID0gdHdlZW4uYW5pbWF0YWJsZXNbYV07XG4gICAgICAgIHZhciBpZCA9IGFuaW1hdGFibGUuaWQ7XG4gICAgICAgIHZhciB0YXJnZXQgPSBhbmltYXRhYmxlLnRhcmdldDtcbiAgICAgICAgdmFyIG5hbWUgPSB0d2Vlbi5uYW1lO1xuICAgICAgICBzd2l0Y2ggKHR3ZWVuLnR5cGUpIHtcbiAgICAgICAgICBjYXNlICdjc3MnOiB0YXJnZXQuc3R5bGVbbmFtZV0gPSBwcm9ncmVzczsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnYXR0cmlidXRlJzogdGFyZ2V0LnNldEF0dHJpYnV0ZShuYW1lLCBwcm9ncmVzcyk7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ29iamVjdCc6IHRhcmdldFtuYW1lXSA9IHByb2dyZXNzOyBicmVhaztcbiAgICAgICAgICBjYXNlICd0cmFuc2Zvcm0nOlxuICAgICAgICAgIGlmICghdHJhbnNmb3JtcykgdHJhbnNmb3JtcyA9IHt9O1xuICAgICAgICAgIGlmICghdHJhbnNmb3Jtc1tpZF0pIHRyYW5zZm9ybXNbaWRdID0gW107XG4gICAgICAgICAgdHJhbnNmb3Jtc1tpZF0ucHVzaChwcm9ncmVzcyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRyYW5zZm9ybXMpIHtcbiAgICAgIGlmICghdHJhbnNmb3JtKSB0cmFuc2Zvcm0gPSAoZ2V0Q1NTVmFsdWUoZG9jdW1lbnQuYm9keSwgdHJhbnNmb3JtU3RyKSA/ICcnIDogJy13ZWJraXQtJykgKyB0cmFuc2Zvcm1TdHI7XG4gICAgICBmb3IgKHZhciB0IGluIHRyYW5zZm9ybXMpIHtcbiAgICAgICAgYW5pbS5hbmltYXRhYmxlc1t0XS50YXJnZXQuc3R5bGVbdHJhbnNmb3JtXSA9IHRyYW5zZm9ybXNbdF0uam9pbignICcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEFuaW1hdGlvblxuXG4gIHZhciBjcmVhdGVBbmltYXRpb24gPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICB2YXIgYW5pbSA9IHt9O1xuICAgIGFuaW0uYW5pbWF0YWJsZXMgPSBnZXRBbmltYXRhYmxlcyhwYXJhbXMudGFyZ2V0cyk7XG4gICAgYW5pbS5zZXR0aW5ncyA9IG1lcmdlT2JqZWN0cyhwYXJhbXMsIGRlZmF1bHRTZXR0aW5ncyk7XG4gICAgYW5pbS5wcm9wZXJ0aWVzID0gZ2V0UHJvcGVydGllcyhwYXJhbXMsIGFuaW0uc2V0dGluZ3MpO1xuICAgIGFuaW0udHdlZW5zID0gZ2V0VHdlZW5zKGFuaW0uYW5pbWF0YWJsZXMsIGFuaW0ucHJvcGVydGllcyk7XG4gICAgYW5pbS5kdXJhdGlvbiA9IGFuaW0udHdlZW5zLmxlbmd0aCA/IGdldFR3ZWVuc0R1cmF0aW9uKGFuaW0udHdlZW5zKSA6IHBhcmFtcy5kdXJhdGlvbjtcbiAgICBhbmltLmRlbGF5ID0gYW5pbS50d2VlbnMubGVuZ3RoID8gZ2V0VHdlZW5zRGVsYXkoYW5pbS50d2VlbnMpIDogcGFyYW1zLmRlbGF5O1xuICAgIGFuaW0uY3VycmVudFRpbWUgPSAwO1xuICAgIGFuaW0ucHJvZ3Jlc3MgPSAwO1xuICAgIGFuaW0uZW5kZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gYW5pbTtcbiAgfVxuXG4gIC8vIFB1YmxpY1xuXG4gIHZhciBhbmltYXRpb25zID0gW107XG4gIHZhciByYWYgPSAwO1xuXG4gIHZhciBlbmdpbmUgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBsYXkgPSBmdW5jdGlvbigpIHsgcmFmID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXApOyB9O1xuICAgIHZhciBzdGVwID0gZnVuY3Rpb24odCkge1xuICAgICAgaWYgKGFuaW1hdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5pbWF0aW9ucy5sZW5ndGg7IGkrKykgYW5pbWF0aW9uc1tpXS50aWNrKHQpO1xuICAgICAgICBwbGF5KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShyYWYpO1xuICAgICAgICByYWYgPSAwO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGxheTtcbiAgfSkoKTtcblxuICB2YXIgYW5pbWF0aW9uID0gZnVuY3Rpb24ocGFyYW1zKSB7XG5cbiAgICB2YXIgYW5pbSA9IGNyZWF0ZUFuaW1hdGlvbihwYXJhbXMpO1xuICAgIHZhciB0aW1lID0ge307XG5cbiAgICBhbmltLnRpY2sgPSBmdW5jdGlvbihub3cpIHtcbiAgICAgIGFuaW0uZW5kZWQgPSBmYWxzZTtcbiAgICAgIGlmICghdGltZS5zdGFydCkgdGltZS5zdGFydCA9IG5vdztcbiAgICAgIHRpbWUuY3VycmVudCA9IE1hdGgubWluKE1hdGgubWF4KHRpbWUubGFzdCArIG5vdyAtIHRpbWUuc3RhcnQsIDApLCBhbmltLmR1cmF0aW9uKTtcbiAgICAgIHNldEFuaW1hdGlvblByb2dyZXNzKGFuaW0sIHRpbWUuY3VycmVudCk7XG4gICAgICB2YXIgcyA9IGFuaW0uc2V0dGluZ3M7XG4gICAgICBpZiAodGltZS5jdXJyZW50ID49IGFuaW0uZGVsYXkpIHtcbiAgICAgICAgaWYgKHMuYmVnaW4pIHMuYmVnaW4oYW5pbSk7IHMuYmVnaW4gPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChzLnVwZGF0ZSkgcy51cGRhdGUoYW5pbSk7XG4gICAgICB9XG4gICAgICBpZiAodGltZS5jdXJyZW50ID49IGFuaW0uZHVyYXRpb24pIHtcbiAgICAgICAgaWYgKHMubG9vcCkge1xuICAgICAgICAgIHRpbWUuc3RhcnQgPSBub3c7XG4gICAgICAgICAgaWYgKHMuZGlyZWN0aW9uID09PSAnYWx0ZXJuYXRlJykgcmV2ZXJzZVR3ZWVucyhhbmltLCB0cnVlKTtcbiAgICAgICAgICBpZiAoaXMubnVtKHMubG9vcCkpIHMubG9vcC0tO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFuaW0uZW5kZWQgPSB0cnVlO1xuICAgICAgICAgIGFuaW0ucGF1c2UoKTtcbiAgICAgICAgICBpZiAocy5jb21wbGV0ZSkgcy5jb21wbGV0ZShhbmltKTtcbiAgICAgICAgfVxuICAgICAgICB0aW1lLmxhc3QgPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFuaW0uc2VlayA9IGZ1bmN0aW9uKHByb2dyZXNzKSB7XG4gICAgICBzZXRBbmltYXRpb25Qcm9ncmVzcyhhbmltLCAocHJvZ3Jlc3MgLyAxMDApICogYW5pbS5kdXJhdGlvbik7XG4gICAgfVxuXG4gICAgYW5pbS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmVtb3ZlV2lsbENoYW5nZShhbmltKTtcbiAgICAgIHZhciBpID0gYW5pbWF0aW9ucy5pbmRleE9mKGFuaW0pO1xuICAgICAgaWYgKGkgPiAtMSkgYW5pbWF0aW9ucy5zcGxpY2UoaSwgMSk7XG4gICAgfVxuXG4gICAgYW5pbS5wbGF5ID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICBhbmltLnBhdXNlKCk7XG4gICAgICBpZiAocGFyYW1zKSBhbmltID0gbWVyZ2VPYmplY3RzKGNyZWF0ZUFuaW1hdGlvbihtZXJnZU9iamVjdHMocGFyYW1zLCBhbmltLnNldHRpbmdzKSksIGFuaW0pO1xuICAgICAgdGltZS5zdGFydCA9IDA7XG4gICAgICB0aW1lLmxhc3QgPSBhbmltLmVuZGVkID8gMCA6IGFuaW0uY3VycmVudFRpbWU7XG4gICAgICB2YXIgcyA9IGFuaW0uc2V0dGluZ3M7XG4gICAgICBpZiAocy5kaXJlY3Rpb24gPT09ICdyZXZlcnNlJykgcmV2ZXJzZVR3ZWVucyhhbmltKTtcbiAgICAgIGlmIChzLmRpcmVjdGlvbiA9PT0gJ2FsdGVybmF0ZScgJiYgIXMubG9vcCkgcy5sb29wID0gMTtcbiAgICAgIHNldFdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgICBhbmltYXRpb25zLnB1c2goYW5pbSk7XG4gICAgICBpZiAoIXJhZikgZW5naW5lKCk7XG4gICAgfVxuXG4gICAgYW5pbS5yZXN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoYW5pbS5yZXZlcnNlZCkgcmV2ZXJzZVR3ZWVucyhhbmltKTtcbiAgICAgIGFuaW0ucGF1c2UoKTtcbiAgICAgIGFuaW0uc2VlaygwKTtcbiAgICAgIGFuaW0ucGxheSgpO1xuICAgIH1cblxuICAgIGlmIChhbmltLnNldHRpbmdzLmF1dG9wbGF5KSBhbmltLnBsYXkoKTtcblxuICAgIHJldHVybiBhbmltO1xuXG4gIH1cblxuICAvLyBSZW1vdmUgb25lIG9yIG11bHRpcGxlIHRhcmdldHMgZnJvbSBhbGwgYWN0aXZlIGFuaW1hdGlvbnMuXG5cbiAgdmFyIHJlbW92ZSA9IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgdmFyIHRhcmdldHMgPSBmbGF0dGVuQXJyYXkoaXMuYXJyKGVsZW1lbnRzKSA/IGVsZW1lbnRzLm1hcCh0b0FycmF5KSA6IHRvQXJyYXkoZWxlbWVudHMpKTtcbiAgICBmb3IgKHZhciBpID0gYW5pbWF0aW9ucy5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciBhbmltYXRpb24gPSBhbmltYXRpb25zW2ldO1xuICAgICAgdmFyIHR3ZWVucyA9IGFuaW1hdGlvbi50d2VlbnM7XG4gICAgICBmb3IgKHZhciB0ID0gdHdlZW5zLmxlbmd0aC0xOyB0ID49IDA7IHQtLSkge1xuICAgICAgICB2YXIgYW5pbWF0YWJsZXMgPSB0d2VlbnNbdF0uYW5pbWF0YWJsZXM7XG4gICAgICAgIGZvciAodmFyIGEgPSBhbmltYXRhYmxlcy5sZW5ndGgtMTsgYSA+PSAwOyBhLS0pIHtcbiAgICAgICAgICBpZiAoYXJyYXlDb250YWlucyh0YXJnZXRzLCBhbmltYXRhYmxlc1thXS50YXJnZXQpKSB7XG4gICAgICAgICAgICBhbmltYXRhYmxlcy5zcGxpY2UoYSwgMSk7XG4gICAgICAgICAgICBpZiAoIWFuaW1hdGFibGVzLmxlbmd0aCkgdHdlZW5zLnNwbGljZSh0LCAxKTtcbiAgICAgICAgICAgIGlmICghdHdlZW5zLmxlbmd0aCkgYW5pbWF0aW9uLnBhdXNlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYW5pbWF0aW9uLnZlcnNpb24gPSB2ZXJzaW9uO1xuICBhbmltYXRpb24uc3BlZWQgPSAxO1xuICBhbmltYXRpb24ubGlzdCA9IGFuaW1hdGlvbnM7XG4gIGFuaW1hdGlvbi5yZW1vdmUgPSByZW1vdmU7XG4gIGFuaW1hdGlvbi5lYXNpbmdzID0gZWFzaW5ncztcbiAgYW5pbWF0aW9uLmdldFZhbHVlID0gZ2V0SW5pdGlhbFRhcmdldFZhbHVlO1xuICBhbmltYXRpb24ucGF0aCA9IGdldFBhdGhQcm9wcztcbiAgYW5pbWF0aW9uLnJhbmRvbSA9IHJhbmRvbTtcblxuICByZXR1cm4gYW5pbWF0aW9uO1xuXG59KSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYW5pbWVqcy9hbmltZS5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIFRleHRHZW9tZXRyeSBjb21wb25lbnQgZm9yIEEtRnJhbWUuXG4gKi9cbnZhciBkZWJ1ZyA9IEFGUkFNRS51dGlscy5kZWJ1ZztcblxudmFyIGVycm9yID0gZGVidWcoJ2FmcmFtZS10ZXh0LWNvbXBvbmVudDplcnJvcicpO1xuXG52YXIgZm9udExvYWRlciA9IG5ldyBUSFJFRS5Gb250TG9hZGVyKCk7XG5cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgndGV4dCcsIHtcbiAgc2NoZW1hOiB7XG4gICAgYmV2ZWxFbmFibGVkOiB7ZGVmYXVsdDogZmFsc2V9LFxuICAgIGJldmVsU2l6ZToge2RlZmF1bHQ6IDgsIG1pbjogMH0sXG4gICAgYmV2ZWxUaGlja25lc3M6IHtkZWZhdWx0OiAxMiwgbWluOiAwfSxcbiAgICBjdXJ2ZVNlZ21lbnRzOiB7ZGVmYXVsdDogMTIsIG1pbjogMH0sXG4gICAgZm9udDoge3R5cGU6ICdhc3NldCcsIGRlZmF1bHQ6ICdodHRwczovL3Jhd2dpdC5jb20vbmdva2V2aW4va2ZyYW1lL21hc3Rlci9jb21wb25lbnRzL3RleHQvbGliL2hlbHZldGlrZXJfcmVndWxhci50eXBlZmFjZS5qc29uJ30sXG4gICAgaGVpZ2h0OiB7ZGVmYXVsdDogMC4wNSwgbWluOiAwfSxcbiAgICBzaXplOiB7ZGVmYXVsdDogMC41LCBtaW46IDB9LFxuICAgIHN0eWxlOiB7ZGVmYXVsdDogJ25vcm1hbCcsIG9uZU9mOiBbJ25vcm1hbCcsICdpdGFsaWNzJ119LFxuICAgIHRleHQ6IHtkZWZhdWx0OiAnJ30sXG4gICAgd2VpZ2h0OiB7ZGVmYXVsdDogJ25vcm1hbCcsIG9uZU9mOiBbJ25vcm1hbCcsICdib2xkJ119XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGNvbXBvbmVudCBpcyBhdHRhY2hlZCBhbmQgd2hlbiBjb21wb25lbnQgZGF0YSBjaGFuZ2VzLlxuICAgKiBHZW5lcmFsbHkgbW9kaWZpZXMgdGhlIGVudGl0eSBiYXNlZCBvbiB0aGUgZGF0YS5cbiAgICovXG4gIHVwZGF0ZTogZnVuY3Rpb24gKG9sZERhdGEpIHtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuXG4gICAgdmFyIG1lc2ggPSBlbC5nZXRPckNyZWF0ZU9iamVjdDNEKCdtZXNoJywgVEhSRUUuTWVzaCk7XG4gICAgaWYgKGRhdGEuZm9udC5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG4gICAgICAvLyBMb2FkIHR5cGVmYWNlLmpzb24gZm9udC5cbiAgICAgIGZvbnRMb2FkZXIubG9hZChkYXRhLmZvbnQsIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICB2YXIgdGV4dERhdGEgPSBBRlJBTUUudXRpbHMuY2xvbmUoZGF0YSk7XG4gICAgICAgIHRleHREYXRhLmZvbnQgPSByZXNwb25zZTtcbiAgICAgICAgbWVzaC5nZW9tZXRyeSA9IG5ldyBUSFJFRS5UZXh0R2VvbWV0cnkoZGF0YS50ZXh0LCB0ZXh0RGF0YSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGRhdGEuZm9udC5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAvLyBTZXQgZm9udCBpZiBhbHJlYWR5IGhhdmUgYSB0eXBlZmFjZS5qc29uIHRocm91Z2ggc2V0QXR0cmlidXRlLlxuICAgICAgbWVzaC5nZW9tZXRyeSA9IG5ldyBUSFJFRS5UZXh0R2VvbWV0cnkoZGF0YS50ZXh0LCBkYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3IoJ011c3QgcHJvdmlkZSBgZm9udGAgKHR5cGVmYWNlLmpzb24pIG9yIGBmb250UGF0aGAgKHN0cmluZykgdG8gdGV4dCBjb21wb25lbnQuJyk7XG4gICAgfVxuICB9XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hZnJhbWUtdGV4dC1jb21wb25lbnQvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUgKi9cclxuaWYgKHR5cGVvZiBBRlJBTUUgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgYXR0ZW1wdGVkIHRvIHJlZ2lzdGVyIGJlZm9yZSBBRlJBTUUgd2FzIGF2YWlsYWJsZS4nKTtcclxufVxyXG5cclxudmFyIGNyZWF0ZVRleHQgPSByZXF1aXJlKCd0aHJlZS1ibWZvbnQtdGV4dCcpO1xyXG52YXIgbG9hZEZvbnQgPSByZXF1aXJlKCdsb2FkLWJtZm9udCcpO1xyXG52YXIgU0RGU2hhZGVyID0gcmVxdWlyZSgnLi9saWIvc2hhZGVycy9zZGYnKTtcclxuXHJcbnJlcXVpcmUoJy4vZXh0cmFzL3RleHQtcHJpbWl0aXZlLmpzJyk7IC8vIFJlZ2lzdGVyIGV4cGVyaW1lbnRhbCB0ZXh0IHByaW1pdGl2ZVxyXG5cclxuLyoqXHJcbiAqIGJtZm9udCB0ZXh0IGNvbXBvbmVudCBmb3IgQS1GcmFtZS5cclxuICovXHJcbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnYm1mb250LXRleHQnLCB7XHJcbiAgc2NoZW1hOiB7XHJcbiAgICB0ZXh0OiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICB9LFxyXG4gICAgd2lkdGg6IHtcclxuICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgIGRlZmF1bHQ6IDEwMDBcclxuICAgIH0sXHJcbiAgICBhbGlnbjoge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgZGVmYXVsdDogJ2xlZnQnXHJcbiAgICB9LFxyXG4gICAgbGV0dGVyU3BhY2luZzoge1xyXG4gICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgZGVmYXVsdDogMFxyXG4gICAgfSxcclxuICAgIGxpbmVIZWlnaHQ6IHtcclxuICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgIGRlZmF1bHQ6IDM4XHJcbiAgICB9LFxyXG4gICAgZm50OiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICBkZWZhdWx0OiAnaHR0cHM6Ly9jZG4ucmF3Z2l0LmNvbS9icnlpay9hZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50L2FhMDY1NWNmOTBmNjQ2ZTEyYzQwYWI0NzA4ZWE5MGI0Njg2Y2ZiNDUvYXNzZXRzL0RlamFWdS1zZGYuZm50J1xyXG4gICAgfSxcclxuICAgIGZudEltYWdlOiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICBkZWZhdWx0OiAnaHR0cHM6Ly9jZG4ucmF3Z2l0LmNvbS9icnlpay9hZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50L2FhMDY1NWNmOTBmNjQ2ZTEyYzQwYWI0NzA4ZWE5MGI0Njg2Y2ZiNDUvYXNzZXRzL0RlamFWdS1zZGYucG5nJ1xyXG4gICAgfSxcclxuICAgIG1vZGU6IHtcclxuICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgIGRlZmF1bHQ6ICdub3JtYWwnXHJcbiAgICB9LFxyXG4gICAgY29sb3I6IHtcclxuICAgICAgdHlwZTogJ2NvbG9yJyxcclxuICAgICAgZGVmYXVsdDogJyMwMDAnXHJcbiAgICB9LFxyXG4gICAgb3BhY2l0eToge1xyXG4gICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgZGVmYXVsdDogJzEuMCdcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBjb21wb25lbnQgaXMgYXR0YWNoZWQgYW5kIHdoZW4gY29tcG9uZW50IGRhdGEgY2hhbmdlcy5cclxuICAgKiBHZW5lcmFsbHkgbW9kaWZpZXMgdGhlIGVudGl0eSBiYXNlZCBvbiB0aGUgZGF0YS5cclxuICAgKi9cclxuICB1cGRhdGU6IGZ1bmN0aW9uIChvbGREYXRhKSB7XHJcbiAgICAvLyBFbnRpdHkgZGF0YVxyXG4gICAgdmFyIGVsID0gdGhpcy5lbDtcclxuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xyXG5cclxuICAgIC8vIFVzZSBmb250TG9hZGVyIHV0aWxpdHkgdG8gbG9hZCAnZm50JyBhbmQgdGV4dHVyZVxyXG4gICAgZm9udExvYWRlcih7XHJcbiAgICAgIGZvbnQ6IGRhdGEuZm50LFxyXG4gICAgICBpbWFnZTogZGF0YS5mbnRJbWFnZVxyXG4gICAgfSwgc3RhcnQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHN0YXJ0IChmb250LCB0ZXh0dXJlKSB7XHJcbiAgICAgIC8vIFNldHVwIHRleHR1cmUsIHNob3VsZCBzZXQgYW5pc290cm9weSB0byB1c2VyIG1heGltdW0uLi5cclxuICAgICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICAgIHRleHR1cmUuYW5pc290cm9weSA9IDE2O1xyXG5cclxuICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgZm9udDogZm9udCwgLy8gdGhlIGJpdG1hcCBmb250IGRlZmluaXRpb25cclxuICAgICAgICB0ZXh0OiBkYXRhLnRleHQsIC8vIHRoZSBzdHJpbmcgdG8gcmVuZGVyXHJcbiAgICAgICAgd2lkdGg6IGRhdGEud2lkdGgsXHJcbiAgICAgICAgYWxpZ246IGRhdGEuYWxpZ24sXHJcbiAgICAgICAgbGV0dGVyU3BhY2luZzogZGF0YS5sZXR0ZXJTcGFjaW5nLFxyXG4gICAgICAgIGxpbmVIZWlnaHQ6IGRhdGEubGluZUhlaWdodCxcclxuICAgICAgICBtb2RlOiBkYXRhLm1vZGVcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSB0ZXh0IGdlb21ldHJ5XHJcbiAgICAgIHZhciBnZW9tZXRyeSA9IGNyZWF0ZVRleHQob3B0aW9ucyk7XHJcblxyXG4gICAgICAvLyBVc2UgJy4vbGliL3NoYWRlcnMvc2RmJyB0byBoZWxwIGJ1aWxkIGEgc2hhZGVyIG1hdGVyaWFsXHJcbiAgICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5SYXdTaGFkZXJNYXRlcmlhbChTREZTaGFkZXIoe1xyXG4gICAgICAgIG1hcDogdGV4dHVyZSxcclxuICAgICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxyXG4gICAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxyXG4gICAgICAgIGNvbG9yOiBkYXRhLmNvbG9yLFxyXG4gICAgICAgIG9wYWNpdHk6IGRhdGEub3BhY2l0eVxyXG4gICAgICB9KSk7XHJcblxyXG4gICAgICB2YXIgdGV4dCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gICAgICAvLyBSb3RhdGUgc28gdGV4dCBmYWNlcyB0aGUgY2FtZXJhXHJcbiAgICAgIHRleHQucm90YXRpb24ueSA9IE1hdGguUEk7XHJcblxyXG4gICAgICAvLyBTY2FsZSB0ZXh0IGRvd25cclxuICAgICAgdGV4dC5zY2FsZS5tdWx0aXBseVNjYWxhcigtMC4wMDUpO1xyXG5cclxuICAgICAgLy8gUmVnaXN0ZXIgdGV4dCBtZXNoIHVuZGVyIGVudGl0eSdzIG9iamVjdDNETWFwXHJcbiAgICAgIGVsLnNldE9iamVjdDNEKCdibWZvbnQtdGV4dCcsIHRleHQpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGEgY29tcG9uZW50IGlzIHJlbW92ZWQgKGUuZy4sIHZpYSByZW1vdmVBdHRyaWJ1dGUpLlxyXG4gICAqIEdlbmVyYWxseSB1bmRvZXMgYWxsIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGVudGl0eS5cclxuICAgKi9cclxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZWwucmVtb3ZlT2JqZWN0M0QoJ2JtZm9udC10ZXh0Jyk7XHJcbiAgfVxyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBBIHV0aWxpdHkgdG8gbG9hZCBhIGZvbnQgd2l0aCBibWZvbnQtbG9hZFxyXG4gKiBhbmQgYSB0ZXh0dXJlIHdpdGggVGhyZWUuVGV4dHVyZUxvYWRlcigpXHJcbiAqL1xyXG5mdW5jdGlvbiBmb250TG9hZGVyIChvcHQsIGNiKSB7XHJcbiAgbG9hZEZvbnQob3B0LmZvbnQsIGZ1bmN0aW9uIChlcnIsIGZvbnQpIHtcclxuICAgIGlmIChlcnIpIHtcclxuICAgICAgdGhyb3cgZXJyO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0ZXh0dXJlTG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcclxuICAgIHRleHR1cmVMb2FkZXIubG9hZChvcHQuaW1hZ2UsIGZ1bmN0aW9uICh0ZXh0dXJlKSB7XHJcbiAgICAgIGNiKGZvbnQsIHRleHR1cmUpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FmcmFtZS1ibWZvbnQtdGV4dC1jb21wb25lbnQvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGNyZWF0ZUxheW91dCA9IHJlcXVpcmUoJ2xheW91dC1ibWZvbnQtdGV4dCcpXG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpXG52YXIgY3JlYXRlSW5kaWNlcyA9IHJlcXVpcmUoJ3F1YWQtaW5kaWNlcycpXG52YXIgYnVmZmVyID0gcmVxdWlyZSgndGhyZWUtYnVmZmVyLXZlcnRleC1kYXRhJylcbnZhciBhc3NpZ24gPSByZXF1aXJlKCdvYmplY3QtYXNzaWduJylcblxudmFyIHZlcnRpY2VzID0gcmVxdWlyZSgnLi9saWIvdmVydGljZXMnKVxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi9saWIvdXRpbHMnKVxuXG52YXIgQmFzZSA9IFRIUkVFLkJ1ZmZlckdlb21ldHJ5XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlVGV4dEdlb21ldHJ5IChvcHQpIHtcbiAgcmV0dXJuIG5ldyBUZXh0R2VvbWV0cnkob3B0KVxufVxuXG5mdW5jdGlvbiBUZXh0R2VvbWV0cnkgKG9wdCkge1xuICBCYXNlLmNhbGwodGhpcylcblxuICBpZiAodHlwZW9mIG9wdCA9PT0gJ3N0cmluZycpIHtcbiAgICBvcHQgPSB7IHRleHQ6IG9wdCB9XG4gIH1cblxuICAvLyB1c2UgdGhlc2UgYXMgZGVmYXVsdCB2YWx1ZXMgZm9yIGFueSBzdWJzZXF1ZW50XG4gIC8vIGNhbGxzIHRvIHVwZGF0ZSgpXG4gIHRoaXMuX29wdCA9IGFzc2lnbih7fSwgb3B0KVxuXG4gIC8vIGFsc28gZG8gYW4gaW5pdGlhbCBzZXR1cC4uLlxuICBpZiAob3B0KSB0aGlzLnVwZGF0ZShvcHQpXG59XG5cbmluaGVyaXRzKFRleHRHZW9tZXRyeSwgQmFzZSlcblxuVGV4dEdlb21ldHJ5LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAob3B0KSB7XG4gIGlmICh0eXBlb2Ygb3B0ID09PSAnc3RyaW5nJykge1xuICAgIG9wdCA9IHsgdGV4dDogb3B0IH1cbiAgfVxuXG4gIC8vIHVzZSBjb25zdHJ1Y3RvciBkZWZhdWx0c1xuICBvcHQgPSBhc3NpZ24oe30sIHRoaXMuX29wdCwgb3B0KVxuXG4gIGlmICghb3B0LmZvbnQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtdXN0IHNwZWNpZnkgYSB7IGZvbnQgfSBpbiBvcHRpb25zJylcbiAgfVxuXG4gIHRoaXMubGF5b3V0ID0gY3JlYXRlTGF5b3V0KG9wdClcblxuICAvLyBnZXQgdmVjMiB0ZXhjb29yZHNcbiAgdmFyIGZsaXBZID0gb3B0LmZsaXBZICE9PSBmYWxzZVxuXG4gIC8vIHRoZSBkZXNpcmVkIEJNRm9udCBkYXRhXG4gIHZhciBmb250ID0gb3B0LmZvbnRcblxuICAvLyBkZXRlcm1pbmUgdGV4dHVyZSBzaXplIGZyb20gZm9udCBmaWxlXG4gIHZhciB0ZXhXaWR0aCA9IGZvbnQuY29tbW9uLnNjYWxlV1xuICB2YXIgdGV4SGVpZ2h0ID0gZm9udC5jb21tb24uc2NhbGVIXG5cbiAgLy8gZ2V0IHZpc2libGUgZ2x5cGhzXG4gIHZhciBnbHlwaHMgPSB0aGlzLmxheW91dC5nbHlwaHMuZmlsdGVyKGZ1bmN0aW9uIChnbHlwaCkge1xuICAgIHZhciBiaXRtYXAgPSBnbHlwaC5kYXRhXG4gICAgcmV0dXJuIGJpdG1hcC53aWR0aCAqIGJpdG1hcC5oZWlnaHQgPiAwXG4gIH0pXG5cbiAgLy8gcHJvdmlkZSB2aXNpYmxlIGdseXBocyBmb3IgY29udmVuaWVuY2VcbiAgdGhpcy52aXNpYmxlR2x5cGhzID0gZ2x5cGhzXG5cbiAgLy8gZ2V0IGNvbW1vbiB2ZXJ0ZXggZGF0YVxuICB2YXIgcG9zaXRpb25zID0gdmVydGljZXMucG9zaXRpb25zKGdseXBocylcbiAgdmFyIHV2cyA9IHZlcnRpY2VzLnV2cyhnbHlwaHMsIHRleFdpZHRoLCB0ZXhIZWlnaHQsIGZsaXBZKVxuICB2YXIgaW5kaWNlcyA9IGNyZWF0ZUluZGljZXMoe1xuICAgIGNsb2Nrd2lzZTogdHJ1ZSxcbiAgICB0eXBlOiAndWludDE2JyxcbiAgICBjb3VudDogZ2x5cGhzLmxlbmd0aFxuICB9KVxuXG4gIC8vIHVwZGF0ZSB2ZXJ0ZXggZGF0YVxuICBidWZmZXIuaW5kZXgodGhpcywgaW5kaWNlcywgMSwgJ3VpbnQxNicpXG4gIGJ1ZmZlci5hdHRyKHRoaXMsICdwb3NpdGlvbicsIHBvc2l0aW9ucywgMilcbiAgYnVmZmVyLmF0dHIodGhpcywgJ3V2JywgdXZzLCAyKVxuXG4gIC8vIHVwZGF0ZSBtdWx0aXBhZ2UgZGF0YVxuICBpZiAoIW9wdC5tdWx0aXBhZ2UgJiYgJ3BhZ2UnIGluIHRoaXMuYXR0cmlidXRlcykge1xuICAgIC8vIGRpc2FibGUgbXVsdGlwYWdlIHJlbmRlcmluZ1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdwYWdlJylcbiAgfSBlbHNlIGlmIChvcHQubXVsdGlwYWdlKSB7XG4gICAgdmFyIHBhZ2VzID0gdmVydGljZXMucGFnZXMoZ2x5cGhzKVxuICAgIC8vIGVuYWJsZSBtdWx0aXBhZ2UgcmVuZGVyaW5nXG4gICAgYnVmZmVyLmF0dHIodGhpcywgJ3BhZ2UnLCBwYWdlcywgMSlcbiAgfVxufVxuXG5UZXh0R2VvbWV0cnkucHJvdG90eXBlLmNvbXB1dGVCb3VuZGluZ1NwaGVyZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYm91bmRpbmdTcGhlcmUgPT09IG51bGwpIHtcbiAgICB0aGlzLmJvdW5kaW5nU3BoZXJlID0gbmV3IFRIUkVFLlNwaGVyZSgpXG4gIH1cblxuICB2YXIgcG9zaXRpb25zID0gdGhpcy5hdHRyaWJ1dGVzLnBvc2l0aW9uLmFycmF5XG4gIHZhciBpdGVtU2l6ZSA9IHRoaXMuYXR0cmlidXRlcy5wb3NpdGlvbi5pdGVtU2l6ZVxuICBpZiAoIXBvc2l0aW9ucyB8fCAhaXRlbVNpemUgfHwgcG9zaXRpb25zLmxlbmd0aCA8IDIpIHtcbiAgICB0aGlzLmJvdW5kaW5nU3BoZXJlLnJhZGl1cyA9IDBcbiAgICB0aGlzLmJvdW5kaW5nU3BoZXJlLmNlbnRlci5zZXQoMCwgMCwgMClcbiAgICByZXR1cm5cbiAgfVxuICB1dGlscy5jb21wdXRlU3BoZXJlKHBvc2l0aW9ucywgdGhpcy5ib3VuZGluZ1NwaGVyZSlcbiAgaWYgKGlzTmFOKHRoaXMuYm91bmRpbmdTcGhlcmUucmFkaXVzKSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1RIUkVFLkJ1ZmZlckdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ1NwaGVyZSgpOiAnICtcbiAgICAgICdDb21wdXRlZCByYWRpdXMgaXMgTmFOLiBUaGUgJyArXG4gICAgICAnXCJwb3NpdGlvblwiIGF0dHJpYnV0ZSBpcyBsaWtlbHkgdG8gaGF2ZSBOYU4gdmFsdWVzLicpXG4gIH1cbn1cblxuVGV4dEdlb21ldHJ5LnByb3RvdHlwZS5jb21wdXRlQm91bmRpbmdCb3ggPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmJvdW5kaW5nQm94ID09PSBudWxsKSB7XG4gICAgdGhpcy5ib3VuZGluZ0JveCA9IG5ldyBUSFJFRS5Cb3gzKClcbiAgfVxuXG4gIHZhciBiYm94ID0gdGhpcy5ib3VuZGluZ0JveFxuICB2YXIgcG9zaXRpb25zID0gdGhpcy5hdHRyaWJ1dGVzLnBvc2l0aW9uLmFycmF5XG4gIHZhciBpdGVtU2l6ZSA9IHRoaXMuYXR0cmlidXRlcy5wb3NpdGlvbi5pdGVtU2l6ZVxuICBpZiAoIXBvc2l0aW9ucyB8fCAhaXRlbVNpemUgfHwgcG9zaXRpb25zLmxlbmd0aCA8IDIpIHtcbiAgICBiYm94Lm1ha2VFbXB0eSgpXG4gICAgcmV0dXJuXG4gIH1cbiAgdXRpbHMuY29tcHV0ZUJveChwb3NpdGlvbnMsIGJib3gpXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vdGhyZWUtYm1mb250LXRleHQvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHdvcmRXcmFwID0gcmVxdWlyZSgnd29yZC13cmFwcGVyJylcbnZhciB4dGVuZCA9IHJlcXVpcmUoJ3h0ZW5kJylcbnZhciBmaW5kQ2hhciA9IHJlcXVpcmUoJ2luZGV4b2YtcHJvcGVydHknKSgnaWQnKVxudmFyIG51bWJlciA9IHJlcXVpcmUoJ2FzLW51bWJlcicpXG5cbnZhciBYX0hFSUdIVFMgPSBbJ3gnLCAnZScsICdhJywgJ28nLCAnbicsICdzJywgJ3InLCAnYycsICd1JywgJ20nLCAndicsICd3JywgJ3onXVxudmFyIE1fV0lEVEhTID0gWydtJywgJ3cnXVxudmFyIENBUF9IRUlHSFRTID0gWydIJywgJ0knLCAnTicsICdFJywgJ0YnLCAnSycsICdMJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onXVxuXG5cbnZhciBUQUJfSUQgPSAnXFx0Jy5jaGFyQ29kZUF0KDApXG52YXIgU1BBQ0VfSUQgPSAnICcuY2hhckNvZGVBdCgwKVxudmFyIEFMSUdOX0xFRlQgPSAwLCBcbiAgICBBTElHTl9DRU5URVIgPSAxLCBcbiAgICBBTElHTl9SSUdIVCA9IDJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVMYXlvdXQob3B0KSB7XG4gIHJldHVybiBuZXcgVGV4dExheW91dChvcHQpXG59XG5cbmZ1bmN0aW9uIFRleHRMYXlvdXQob3B0KSB7XG4gIHRoaXMuZ2x5cGhzID0gW11cbiAgdGhpcy5fbWVhc3VyZSA9IHRoaXMuY29tcHV0ZU1ldHJpY3MuYmluZCh0aGlzKVxuICB0aGlzLnVwZGF0ZShvcHQpXG59XG5cblRleHRMYXlvdXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG9wdCkge1xuICBvcHQgPSB4dGVuZCh7XG4gICAgbWVhc3VyZTogdGhpcy5fbWVhc3VyZVxuICB9LCBvcHQpXG4gIHRoaXMuX29wdCA9IG9wdFxuICB0aGlzLl9vcHQudGFiU2l6ZSA9IG51bWJlcih0aGlzLl9vcHQudGFiU2l6ZSwgNClcblxuICBpZiAoIW9wdC5mb250KVxuICAgIHRocm93IG5ldyBFcnJvcignbXVzdCBwcm92aWRlIGEgdmFsaWQgYml0bWFwIGZvbnQnKVxuXG4gIHZhciBnbHlwaHMgPSB0aGlzLmdseXBoc1xuICB2YXIgdGV4dCA9IG9wdC50ZXh0fHwnJyBcbiAgdmFyIGZvbnQgPSBvcHQuZm9udFxuICB0aGlzLl9zZXR1cFNwYWNlR2x5cGhzKGZvbnQpXG4gIFxuICB2YXIgbGluZXMgPSB3b3JkV3JhcC5saW5lcyh0ZXh0LCBvcHQpXG4gIHZhciBtaW5XaWR0aCA9IG9wdC53aWR0aCB8fCAwXG5cbiAgLy9jbGVhciBnbHlwaHNcbiAgZ2x5cGhzLmxlbmd0aCA9IDBcblxuICAvL2dldCBtYXggbGluZSB3aWR0aFxuICB2YXIgbWF4TGluZVdpZHRoID0gbGluZXMucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGxpbmUpIHtcbiAgICByZXR1cm4gTWF0aC5tYXgocHJldiwgbGluZS53aWR0aCwgbWluV2lkdGgpXG4gIH0sIDApXG5cbiAgLy90aGUgcGVuIHBvc2l0aW9uXG4gIHZhciB4ID0gMFxuICB2YXIgeSA9IDBcbiAgdmFyIGxpbmVIZWlnaHQgPSBudW1iZXIob3B0LmxpbmVIZWlnaHQsIGZvbnQuY29tbW9uLmxpbmVIZWlnaHQpXG4gIHZhciBiYXNlbGluZSA9IGZvbnQuY29tbW9uLmJhc2VcbiAgdmFyIGRlc2NlbmRlciA9IGxpbmVIZWlnaHQtYmFzZWxpbmVcbiAgdmFyIGxldHRlclNwYWNpbmcgPSBvcHQubGV0dGVyU3BhY2luZyB8fCAwXG4gIHZhciBoZWlnaHQgPSBsaW5lSGVpZ2h0ICogbGluZXMubGVuZ3RoIC0gZGVzY2VuZGVyXG4gIHZhciBhbGlnbiA9IGdldEFsaWduVHlwZSh0aGlzLl9vcHQuYWxpZ24pXG5cbiAgLy9kcmF3IHRleHQgYWxvbmcgYmFzZWxpbmVcbiAgeSAtPSBoZWlnaHRcbiAgXG4gIC8vdGhlIG1ldHJpY3MgZm9yIHRoaXMgdGV4dCBsYXlvdXRcbiAgdGhpcy5fd2lkdGggPSBtYXhMaW5lV2lkdGhcbiAgdGhpcy5faGVpZ2h0ID0gaGVpZ2h0XG4gIHRoaXMuX2Rlc2NlbmRlciA9IGxpbmVIZWlnaHQgLSBiYXNlbGluZVxuICB0aGlzLl9iYXNlbGluZSA9IGJhc2VsaW5lXG4gIHRoaXMuX3hIZWlnaHQgPSBnZXRYSGVpZ2h0KGZvbnQpXG4gIHRoaXMuX2NhcEhlaWdodCA9IGdldENhcEhlaWdodChmb250KVxuICB0aGlzLl9saW5lSGVpZ2h0ID0gbGluZUhlaWdodFxuICB0aGlzLl9hc2NlbmRlciA9IGxpbmVIZWlnaHQgLSBkZXNjZW5kZXIgLSB0aGlzLl94SGVpZ2h0XG4gICAgXG4gIC8vbGF5b3V0IGVhY2ggZ2x5cGhcbiAgdmFyIHNlbGYgPSB0aGlzXG4gIGxpbmVzLmZvckVhY2goZnVuY3Rpb24obGluZSwgbGluZUluZGV4KSB7XG4gICAgdmFyIHN0YXJ0ID0gbGluZS5zdGFydFxuICAgIHZhciBlbmQgPSBsaW5lLmVuZFxuICAgIHZhciBsaW5lV2lkdGggPSBsaW5lLndpZHRoXG4gICAgdmFyIGxhc3RHbHlwaFxuICAgIFxuICAgIC8vZm9yIGVhY2ggZ2x5cGggaW4gdGhhdCBsaW5lLi4uXG4gICAgZm9yICh2YXIgaT1zdGFydDsgaTxlbmQ7IGkrKykge1xuICAgICAgdmFyIGlkID0gdGV4dC5jaGFyQ29kZUF0KGkpXG4gICAgICB2YXIgZ2x5cGggPSBzZWxmLmdldEdseXBoKGZvbnQsIGlkKVxuICAgICAgaWYgKGdseXBoKSB7XG4gICAgICAgIGlmIChsYXN0R2x5cGgpIFxuICAgICAgICAgIHggKz0gZ2V0S2VybmluZyhmb250LCBsYXN0R2x5cGguaWQsIGdseXBoLmlkKVxuXG4gICAgICAgIHZhciB0eCA9IHhcbiAgICAgICAgaWYgKGFsaWduID09PSBBTElHTl9DRU5URVIpIFxuICAgICAgICAgIHR4ICs9IChtYXhMaW5lV2lkdGgtbGluZVdpZHRoKS8yXG4gICAgICAgIGVsc2UgaWYgKGFsaWduID09PSBBTElHTl9SSUdIVClcbiAgICAgICAgICB0eCArPSAobWF4TGluZVdpZHRoLWxpbmVXaWR0aClcblxuICAgICAgICBnbHlwaHMucHVzaCh7XG4gICAgICAgICAgcG9zaXRpb246IFt0eCwgeV0sXG4gICAgICAgICAgZGF0YTogZ2x5cGgsXG4gICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgbGluZTogbGluZUluZGV4XG4gICAgICAgIH0pICBcblxuICAgICAgICAvL21vdmUgcGVuIGZvcndhcmRcbiAgICAgICAgeCArPSBnbHlwaC54YWR2YW5jZSArIGxldHRlclNwYWNpbmdcbiAgICAgICAgbGFzdEdseXBoID0gZ2x5cGhcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL25leHQgbGluZSBkb3duXG4gICAgeSArPSBsaW5lSGVpZ2h0XG4gICAgeCA9IDBcbiAgfSlcbiAgdGhpcy5fbGluZXNUb3RhbCA9IGxpbmVzLmxlbmd0aDtcbn1cblxuVGV4dExheW91dC5wcm90b3R5cGUuX3NldHVwU3BhY2VHbHlwaHMgPSBmdW5jdGlvbihmb250KSB7XG4gIC8vVGhlc2UgYXJlIGZhbGxiYWNrcywgd2hlbiB0aGUgZm9udCBkb2Vzbid0IGluY2x1ZGVcbiAgLy8nICcgb3IgJ1xcdCcgZ2x5cGhzXG4gIHRoaXMuX2ZhbGxiYWNrU3BhY2VHbHlwaCA9IG51bGxcbiAgdGhpcy5fZmFsbGJhY2tUYWJHbHlwaCA9IG51bGxcblxuICBpZiAoIWZvbnQuY2hhcnMgfHwgZm9udC5jaGFycy5sZW5ndGggPT09IDApXG4gICAgcmV0dXJuXG5cbiAgLy90cnkgdG8gZ2V0IHNwYWNlIGdseXBoXG4gIC8vdGhlbiBmYWxsIGJhY2sgdG8gdGhlICdtJyBvciAndycgZ2x5cGhzXG4gIC8vdGhlbiBmYWxsIGJhY2sgdG8gdGhlIGZpcnN0IGdseXBoIGF2YWlsYWJsZVxuICB2YXIgc3BhY2UgPSBnZXRHbHlwaEJ5SWQoZm9udCwgU1BBQ0VfSUQpIFxuICAgICAgICAgIHx8IGdldE1HbHlwaChmb250KSBcbiAgICAgICAgICB8fCBmb250LmNoYXJzWzBdXG5cbiAgLy9hbmQgY3JlYXRlIGEgZmFsbGJhY2sgZm9yIHRhYlxuICB2YXIgdGFiV2lkdGggPSB0aGlzLl9vcHQudGFiU2l6ZSAqIHNwYWNlLnhhZHZhbmNlXG4gIHRoaXMuX2ZhbGxiYWNrU3BhY2VHbHlwaCA9IHNwYWNlXG4gIHRoaXMuX2ZhbGxiYWNrVGFiR2x5cGggPSB4dGVuZChzcGFjZSwge1xuICAgIHg6IDAsIHk6IDAsIHhhZHZhbmNlOiB0YWJXaWR0aCwgaWQ6IFRBQl9JRCwgXG4gICAgeG9mZnNldDogMCwgeW9mZnNldDogMCwgd2lkdGg6IDAsIGhlaWdodDogMFxuICB9KVxufVxuXG5UZXh0TGF5b3V0LnByb3RvdHlwZS5nZXRHbHlwaCA9IGZ1bmN0aW9uKGZvbnQsIGlkKSB7XG4gIHZhciBnbHlwaCA9IGdldEdseXBoQnlJZChmb250LCBpZClcbiAgaWYgKGdseXBoKVxuICAgIHJldHVybiBnbHlwaFxuICBlbHNlIGlmIChpZCA9PT0gVEFCX0lEKSBcbiAgICByZXR1cm4gdGhpcy5fZmFsbGJhY2tUYWJHbHlwaFxuICBlbHNlIGlmIChpZCA9PT0gU1BBQ0VfSUQpIFxuICAgIHJldHVybiB0aGlzLl9mYWxsYmFja1NwYWNlR2x5cGhcbiAgcmV0dXJuIG51bGxcbn1cblxuVGV4dExheW91dC5wcm90b3R5cGUuY29tcHV0ZU1ldHJpY3MgPSBmdW5jdGlvbih0ZXh0LCBzdGFydCwgZW5kLCB3aWR0aCkge1xuICB2YXIgbGV0dGVyU3BhY2luZyA9IHRoaXMuX29wdC5sZXR0ZXJTcGFjaW5nIHx8IDBcbiAgdmFyIGZvbnQgPSB0aGlzLl9vcHQuZm9udFxuICB2YXIgY3VyUGVuID0gMFxuICB2YXIgY3VyV2lkdGggPSAwXG4gIHZhciBjb3VudCA9IDBcbiAgdmFyIGdseXBoXG4gIHZhciBsYXN0R2x5cGhcblxuICBpZiAoIWZvbnQuY2hhcnMgfHwgZm9udC5jaGFycy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgZW5kOiBzdGFydCxcbiAgICAgIHdpZHRoOiAwXG4gICAgfVxuICB9XG5cbiAgZW5kID0gTWF0aC5taW4odGV4dC5sZW5ndGgsIGVuZClcbiAgZm9yICh2YXIgaT1zdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdmFyIGlkID0gdGV4dC5jaGFyQ29kZUF0KGkpXG4gICAgdmFyIGdseXBoID0gdGhpcy5nZXRHbHlwaChmb250LCBpZClcblxuICAgIGlmIChnbHlwaCkge1xuICAgICAgLy9tb3ZlIHBlbiBmb3J3YXJkXG4gICAgICB2YXIgeG9mZiA9IGdseXBoLnhvZmZzZXRcbiAgICAgIHZhciBrZXJuID0gbGFzdEdseXBoID8gZ2V0S2VybmluZyhmb250LCBsYXN0R2x5cGguaWQsIGdseXBoLmlkKSA6IDBcbiAgICAgIGN1clBlbiArPSBrZXJuXG5cbiAgICAgIHZhciBuZXh0UGVuID0gY3VyUGVuICsgZ2x5cGgueGFkdmFuY2UgKyBsZXR0ZXJTcGFjaW5nXG4gICAgICB2YXIgbmV4dFdpZHRoID0gY3VyUGVuICsgZ2x5cGgud2lkdGhcblxuICAgICAgLy93ZSd2ZSBoaXQgb3VyIGxpbWl0OyB3ZSBjYW4ndCBtb3ZlIG9udG8gdGhlIG5leHQgZ2x5cGhcbiAgICAgIGlmIChuZXh0V2lkdGggPj0gd2lkdGggfHwgbmV4dFBlbiA+PSB3aWR0aClcbiAgICAgICAgYnJlYWtcblxuICAgICAgLy9vdGhlcndpc2UgY29udGludWUgYWxvbmcgb3VyIGxpbmVcbiAgICAgIGN1clBlbiA9IG5leHRQZW5cbiAgICAgIGN1cldpZHRoID0gbmV4dFdpZHRoXG4gICAgICBsYXN0R2x5cGggPSBnbHlwaFxuICAgIH1cbiAgICBjb3VudCsrXG4gIH1cbiAgXG4gIC8vbWFrZSBzdXJlIHJpZ2h0bW9zdCBlZGdlIGxpbmVzIHVwIHdpdGggcmVuZGVyZWQgZ2x5cGhzXG4gIGlmIChsYXN0R2x5cGgpXG4gICAgY3VyV2lkdGggKz0gbGFzdEdseXBoLnhvZmZzZXRcblxuICByZXR1cm4ge1xuICAgIHN0YXJ0OiBzdGFydCxcbiAgICBlbmQ6IHN0YXJ0ICsgY291bnQsXG4gICAgd2lkdGg6IGN1cldpZHRoXG4gIH1cbn1cblxuLy9nZXR0ZXJzIGZvciB0aGUgcHJpdmF0ZSB2YXJzXG47Wyd3aWR0aCcsICdoZWlnaHQnLCBcbiAgJ2Rlc2NlbmRlcicsICdhc2NlbmRlcicsXG4gICd4SGVpZ2h0JywgJ2Jhc2VsaW5lJyxcbiAgJ2NhcEhlaWdodCcsXG4gICdsaW5lSGVpZ2h0JyBdLmZvckVhY2goYWRkR2V0dGVyKVxuXG5mdW5jdGlvbiBhZGRHZXR0ZXIobmFtZSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGV4dExheW91dC5wcm90b3R5cGUsIG5hbWUsIHtcbiAgICBnZXQ6IHdyYXBwZXIobmFtZSksXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pXG59XG5cbi8vY3JlYXRlIGxvb2t1cHMgZm9yIHByaXZhdGUgdmFyc1xuZnVuY3Rpb24gd3JhcHBlcihuYW1lKSB7XG4gIHJldHVybiAobmV3IEZ1bmN0aW9uKFtcbiAgICAncmV0dXJuIGZ1bmN0aW9uICcrbmFtZSsnKCkgeycsXG4gICAgJyAgcmV0dXJuIHRoaXMuXycrbmFtZSxcbiAgICAnfSdcbiAgXS5qb2luKCdcXG4nKSkpKClcbn1cblxuZnVuY3Rpb24gZ2V0R2x5cGhCeUlkKGZvbnQsIGlkKSB7XG4gIGlmICghZm9udC5jaGFycyB8fCBmb250LmNoYXJzLmxlbmd0aCA9PT0gMClcbiAgICByZXR1cm4gbnVsbFxuXG4gIHZhciBnbHlwaElkeCA9IGZpbmRDaGFyKGZvbnQuY2hhcnMsIGlkKVxuICBpZiAoZ2x5cGhJZHggPj0gMClcbiAgICByZXR1cm4gZm9udC5jaGFyc1tnbHlwaElkeF1cbiAgcmV0dXJuIG51bGxcbn1cblxuZnVuY3Rpb24gZ2V0WEhlaWdodChmb250KSB7XG4gIGZvciAodmFyIGk9MDsgaTxYX0hFSUdIVFMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaWQgPSBYX0hFSUdIVFNbaV0uY2hhckNvZGVBdCgwKVxuICAgIHZhciBpZHggPSBmaW5kQ2hhcihmb250LmNoYXJzLCBpZClcbiAgICBpZiAoaWR4ID49IDApIFxuICAgICAgcmV0dXJuIGZvbnQuY2hhcnNbaWR4XS5oZWlnaHRcbiAgfVxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBnZXRNR2x5cGgoZm9udCkge1xuICBmb3IgKHZhciBpPTA7IGk8TV9XSURUSFMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaWQgPSBNX1dJRFRIU1tpXS5jaGFyQ29kZUF0KDApXG4gICAgdmFyIGlkeCA9IGZpbmRDaGFyKGZvbnQuY2hhcnMsIGlkKVxuICAgIGlmIChpZHggPj0gMCkgXG4gICAgICByZXR1cm4gZm9udC5jaGFyc1tpZHhdXG4gIH1cbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gZ2V0Q2FwSGVpZ2h0KGZvbnQpIHtcbiAgZm9yICh2YXIgaT0wOyBpPENBUF9IRUlHSFRTLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGlkID0gQ0FQX0hFSUdIVFNbaV0uY2hhckNvZGVBdCgwKVxuICAgIHZhciBpZHggPSBmaW5kQ2hhcihmb250LmNoYXJzLCBpZClcbiAgICBpZiAoaWR4ID49IDApIFxuICAgICAgcmV0dXJuIGZvbnQuY2hhcnNbaWR4XS5oZWlnaHRcbiAgfVxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBnZXRLZXJuaW5nKGZvbnQsIGxlZnQsIHJpZ2h0KSB7XG4gIGlmICghZm9udC5rZXJuaW5ncyB8fCBmb250Lmtlcm5pbmdzLmxlbmd0aCA9PT0gMClcbiAgICByZXR1cm4gMFxuXG4gIHZhciB0YWJsZSA9IGZvbnQua2VybmluZ3NcbiAgZm9yICh2YXIgaT0wOyBpPHRhYmxlLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtlcm4gPSB0YWJsZVtpXVxuICAgIGlmIChrZXJuLmZpcnN0ID09PSBsZWZ0ICYmIGtlcm4uc2Vjb25kID09PSByaWdodClcbiAgICAgIHJldHVybiBrZXJuLmFtb3VudFxuICB9XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGdldEFsaWduVHlwZShhbGlnbikge1xuICBpZiAoYWxpZ24gPT09ICdjZW50ZXInKVxuICAgIHJldHVybiBBTElHTl9DRU5URVJcbiAgZWxzZSBpZiAoYWxpZ24gPT09ICdyaWdodCcpXG4gICAgcmV0dXJuIEFMSUdOX1JJR0hUXG4gIHJldHVybiBBTElHTl9MRUZUXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xheW91dC1ibWZvbnQtdGV4dC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgbmV3bGluZSA9IC9cXG4vXG52YXIgbmV3bGluZUNoYXIgPSAnXFxuJ1xudmFyIHdoaXRlc3BhY2UgPSAvXFxzL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRleHQsIG9wdCkge1xuICAgIHZhciBsaW5lcyA9IG1vZHVsZS5leHBvcnRzLmxpbmVzKHRleHQsIG9wdClcbiAgICByZXR1cm4gbGluZXMubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgcmV0dXJuIHRleHQuc3Vic3RyaW5nKGxpbmUuc3RhcnQsIGxpbmUuZW5kKVxuICAgIH0pLmpvaW4oJ1xcbicpXG59XG5cbm1vZHVsZS5leHBvcnRzLmxpbmVzID0gZnVuY3Rpb24gd29yZHdyYXAodGV4dCwgb3B0KSB7XG4gICAgb3B0ID0gb3B0fHx7fVxuXG4gICAgLy96ZXJvIHdpZHRoIHJlc3VsdHMgaW4gbm90aGluZyB2aXNpYmxlXG4gICAgaWYgKG9wdC53aWR0aCA9PT0gMCAmJiBvcHQubW9kZSAhPT0gJ25vd3JhcCcpIFxuICAgICAgICByZXR1cm4gW11cblxuICAgIHRleHQgPSB0ZXh0fHwnJ1xuICAgIHZhciB3aWR0aCA9IHR5cGVvZiBvcHQud2lkdGggPT09ICdudW1iZXInID8gb3B0LndpZHRoIDogTnVtYmVyLk1BWF9WQUxVRVxuICAgIHZhciBzdGFydCA9IE1hdGgubWF4KDAsIG9wdC5zdGFydHx8MClcbiAgICB2YXIgZW5kID0gdHlwZW9mIG9wdC5lbmQgPT09ICdudW1iZXInID8gb3B0LmVuZCA6IHRleHQubGVuZ3RoXG4gICAgdmFyIG1vZGUgPSBvcHQubW9kZVxuXG4gICAgdmFyIG1lYXN1cmUgPSBvcHQubWVhc3VyZSB8fCBtb25vc3BhY2VcbiAgICBpZiAobW9kZSA9PT0gJ3ByZScpXG4gICAgICAgIHJldHVybiBwcmUobWVhc3VyZSwgdGV4dCwgc3RhcnQsIGVuZCwgd2lkdGgpXG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gZ3JlZWR5KG1lYXN1cmUsIHRleHQsIHN0YXJ0LCBlbmQsIHdpZHRoLCBtb2RlKVxufVxuXG5mdW5jdGlvbiBpZHhPZih0ZXh0LCBjaHIsIHN0YXJ0LCBlbmQpIHtcbiAgICB2YXIgaWR4ID0gdGV4dC5pbmRleE9mKGNociwgc3RhcnQpXG4gICAgaWYgKGlkeCA9PT0gLTEgfHwgaWR4ID4gZW5kKVxuICAgICAgICByZXR1cm4gZW5kXG4gICAgcmV0dXJuIGlkeFxufVxuXG5mdW5jdGlvbiBpc1doaXRlc3BhY2UoY2hyKSB7XG4gICAgcmV0dXJuIHdoaXRlc3BhY2UudGVzdChjaHIpXG59XG5cbmZ1bmN0aW9uIHByZShtZWFzdXJlLCB0ZXh0LCBzdGFydCwgZW5kLCB3aWR0aCkge1xuICAgIHZhciBsaW5lcyA9IFtdXG4gICAgdmFyIGxpbmVTdGFydCA9IHN0YXJ0XG4gICAgZm9yICh2YXIgaT1zdGFydDsgaTxlbmQgJiYgaTx0ZXh0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaHIgPSB0ZXh0LmNoYXJBdChpKVxuICAgICAgICB2YXIgaXNOZXdsaW5lID0gbmV3bGluZS50ZXN0KGNocilcblxuICAgICAgICAvL0lmIHdlJ3ZlIHJlYWNoZWQgYSBuZXdsaW5lLCB0aGVuIHN0ZXAgZG93biBhIGxpbmVcbiAgICAgICAgLy9PciBpZiB3ZSd2ZSByZWFjaGVkIHRoZSBFT0ZcbiAgICAgICAgaWYgKGlzTmV3bGluZSB8fCBpPT09ZW5kLTEpIHtcbiAgICAgICAgICAgIHZhciBsaW5lRW5kID0gaXNOZXdsaW5lID8gaSA6IGkrMVxuICAgICAgICAgICAgdmFyIG1lYXN1cmVkID0gbWVhc3VyZSh0ZXh0LCBsaW5lU3RhcnQsIGxpbmVFbmQsIHdpZHRoKVxuICAgICAgICAgICAgbGluZXMucHVzaChtZWFzdXJlZClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGluZVN0YXJ0ID0gaSsxXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzXG59XG5cbmZ1bmN0aW9uIGdyZWVkeShtZWFzdXJlLCB0ZXh0LCBzdGFydCwgZW5kLCB3aWR0aCwgbW9kZSkge1xuICAgIC8vQSBncmVlZHkgd29yZCB3cmFwcGVyIGJhc2VkIG9uIExpYkdEWCBhbGdvcml0aG1cbiAgICAvL2h0dHBzOi8vZ2l0aHViLmNvbS9saWJnZHgvbGliZ2R4L2Jsb2IvbWFzdGVyL2dkeC9zcmMvY29tL2JhZGxvZ2ljL2dkeC9ncmFwaGljcy9nMmQvQml0bWFwRm9udENhY2hlLmphdmFcbiAgICB2YXIgbGluZXMgPSBbXVxuXG4gICAgdmFyIHRlc3RXaWR0aCA9IHdpZHRoXG4gICAgLy9pZiAnbm93cmFwJyBpcyBzcGVjaWZpZWQsIHdlIG9ubHkgd3JhcCBvbiBuZXdsaW5lIGNoYXJzXG4gICAgaWYgKG1vZGUgPT09ICdub3dyYXAnKVxuICAgICAgICB0ZXN0V2lkdGggPSBOdW1iZXIuTUFYX1ZBTFVFXG5cbiAgICB3aGlsZSAoc3RhcnQgPCBlbmQgJiYgc3RhcnQgPCB0ZXh0Lmxlbmd0aCkge1xuICAgICAgICAvL2dldCBuZXh0IG5ld2xpbmUgcG9zaXRpb25cbiAgICAgICAgdmFyIG5ld0xpbmUgPSBpZHhPZih0ZXh0LCBuZXdsaW5lQ2hhciwgc3RhcnQsIGVuZClcblxuICAgICAgICAvL2VhdCB3aGl0ZXNwYWNlIGF0IHN0YXJ0IG9mIGxpbmVcbiAgICAgICAgd2hpbGUgKHN0YXJ0IDwgbmV3TGluZSkge1xuICAgICAgICAgICAgaWYgKCFpc1doaXRlc3BhY2UoIHRleHQuY2hhckF0KHN0YXJ0KSApKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBzdGFydCsrXG4gICAgICAgIH1cblxuICAgICAgICAvL2RldGVybWluZSB2aXNpYmxlICMgb2YgZ2x5cGhzIGZvciB0aGUgYXZhaWxhYmxlIHdpZHRoXG4gICAgICAgIHZhciBtZWFzdXJlZCA9IG1lYXN1cmUodGV4dCwgc3RhcnQsIG5ld0xpbmUsIHRlc3RXaWR0aClcblxuICAgICAgICB2YXIgbGluZUVuZCA9IHN0YXJ0ICsgKG1lYXN1cmVkLmVuZC1tZWFzdXJlZC5zdGFydClcbiAgICAgICAgdmFyIG5leHRTdGFydCA9IGxpbmVFbmQgKyBuZXdsaW5lQ2hhci5sZW5ndGhcblxuICAgICAgICAvL2lmIHdlIGhhZCB0byBjdXQgdGhlIGxpbmUgYmVmb3JlIHRoZSBuZXh0IG5ld2xpbmUuLi5cbiAgICAgICAgaWYgKGxpbmVFbmQgPCBuZXdMaW5lKSB7XG4gICAgICAgICAgICAvL2ZpbmQgY2hhciB0byBicmVhayBvblxuICAgICAgICAgICAgd2hpbGUgKGxpbmVFbmQgPiBzdGFydCkge1xuICAgICAgICAgICAgICAgIGlmIChpc1doaXRlc3BhY2UodGV4dC5jaGFyQXQobGluZUVuZCkpKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGxpbmVFbmQtLVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpbmVFbmQgPT09IHN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG5leHRTdGFydCA+IHN0YXJ0ICsgbmV3bGluZUNoYXIubGVuZ3RoKSBuZXh0U3RhcnQtLVxuICAgICAgICAgICAgICAgIGxpbmVFbmQgPSBuZXh0U3RhcnQgLy8gSWYgbm8gY2hhcmFjdGVycyB0byBicmVhaywgc2hvdyBhbGwuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5leHRTdGFydCA9IGxpbmVFbmRcbiAgICAgICAgICAgICAgICAvL2VhdCB3aGl0ZXNwYWNlIGF0IGVuZCBvZiBsaW5lXG4gICAgICAgICAgICAgICAgd2hpbGUgKGxpbmVFbmQgPiBzdGFydCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzV2hpdGVzcGFjZSh0ZXh0LmNoYXJBdChsaW5lRW5kIC0gbmV3bGluZUNoYXIubGVuZ3RoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBsaW5lRW5kLS1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpbmVFbmQgPj0gc3RhcnQpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBtZWFzdXJlKHRleHQsIHN0YXJ0LCBsaW5lRW5kLCB0ZXN0V2lkdGgpXG4gICAgICAgICAgICBsaW5lcy5wdXNoKHJlc3VsdClcbiAgICAgICAgfVxuICAgICAgICBzdGFydCA9IG5leHRTdGFydFxuICAgIH1cbiAgICByZXR1cm4gbGluZXNcbn1cblxuLy9kZXRlcm1pbmVzIHRoZSB2aXNpYmxlIG51bWJlciBvZiBnbHlwaHMgd2l0aGluIGEgZ2l2ZW4gd2lkdGhcbmZ1bmN0aW9uIG1vbm9zcGFjZSh0ZXh0LCBzdGFydCwgZW5kLCB3aWR0aCkge1xuICAgIHZhciBnbHlwaHMgPSBNYXRoLm1pbih3aWR0aCwgZW5kLXN0YXJ0KVxuICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgZW5kOiBzdGFydCtnbHlwaHNcbiAgICB9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3dvcmQtd3JhcHBlci9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGV4dGVuZFxuXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG5mdW5jdGlvbiBleHRlbmQoKSB7XG4gICAgdmFyIHRhcmdldCA9IHt9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldXG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhcmdldFxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3h0ZW5kL2ltbXV0YWJsZS5qc1xuLy8gbW9kdWxlIGlkID0gOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbXBpbGUocHJvcGVydHkpIHtcblx0aWYgKCFwcm9wZXJ0eSB8fCB0eXBlb2YgcHJvcGVydHkgIT09ICdzdHJpbmcnKVxuXHRcdHRocm93IG5ldyBFcnJvcignbXVzdCBzcGVjaWZ5IHByb3BlcnR5IGZvciBpbmRleG9mIHNlYXJjaCcpXG5cblx0cmV0dXJuIG5ldyBGdW5jdGlvbignYXJyYXknLCAndmFsdWUnLCAnc3RhcnQnLCBbXG5cdFx0J3N0YXJ0ID0gc3RhcnQgfHwgMCcsXG5cdFx0J2ZvciAodmFyIGk9c3RhcnQ7IGk8YXJyYXkubGVuZ3RoOyBpKyspJyxcblx0XHQnICBpZiAoYXJyYXlbaV1bXCInICsgcHJvcGVydHkgKydcIl0gPT09IHZhbHVlKScsXG5cdFx0JyAgICAgIHJldHVybiBpJyxcblx0XHQncmV0dXJuIC0xJ1xuXHRdLmpvaW4oJ1xcbicpKVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9pbmRleG9mLXByb3BlcnR5L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG51bXR5cGUobnVtLCBkZWYpIHtcblx0cmV0dXJuIHR5cGVvZiBudW0gPT09ICdudW1iZXInXG5cdFx0PyBudW0gXG5cdFx0OiAodHlwZW9mIGRlZiA9PT0gJ251bWJlcicgPyBkZWYgOiAwKVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hcy1udW1iZXIvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDExXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanNcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkdHlwZSA9IHJlcXVpcmUoJ2R0eXBlJylcbnZhciBhbkFycmF5ID0gcmVxdWlyZSgnYW4tYXJyYXknKVxudmFyIGlzQnVmZmVyID0gcmVxdWlyZSgnaXMtYnVmZmVyJylcblxudmFyIENXID0gWzAsIDIsIDNdXG52YXIgQ0NXID0gWzIsIDEsIDNdXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlUXVhZEVsZW1lbnRzKGFycmF5LCBvcHQpIHtcbiAgICAvL2lmIHVzZXIgZGlkbid0IHNwZWNpZnkgYW4gb3V0cHV0IGFycmF5XG4gICAgaWYgKCFhcnJheSB8fCAhKGFuQXJyYXkoYXJyYXkpIHx8IGlzQnVmZmVyKGFycmF5KSkpIHtcbiAgICAgICAgb3B0ID0gYXJyYXkgfHwge31cbiAgICAgICAgYXJyYXkgPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBvcHQgPT09ICdudW1iZXInKSAvL2JhY2t3YXJkcy1jb21wYXRpYmxlXG4gICAgICAgIG9wdCA9IHsgY291bnQ6IG9wdCB9XG4gICAgZWxzZVxuICAgICAgICBvcHQgPSBvcHQgfHwge31cblxuICAgIHZhciB0eXBlID0gdHlwZW9mIG9wdC50eXBlID09PSAnc3RyaW5nJyA/IG9wdC50eXBlIDogJ3VpbnQxNidcbiAgICB2YXIgY291bnQgPSB0eXBlb2Ygb3B0LmNvdW50ID09PSAnbnVtYmVyJyA/IG9wdC5jb3VudCA6IDFcbiAgICB2YXIgc3RhcnQgPSAob3B0LnN0YXJ0IHx8IDApIFxuXG4gICAgdmFyIGRpciA9IG9wdC5jbG9ja3dpc2UgIT09IGZhbHNlID8gQ1cgOiBDQ1csXG4gICAgICAgIGEgPSBkaXJbMF0sIFxuICAgICAgICBiID0gZGlyWzFdLFxuICAgICAgICBjID0gZGlyWzJdXG5cbiAgICB2YXIgbnVtSW5kaWNlcyA9IGNvdW50ICogNlxuXG4gICAgdmFyIGluZGljZXMgPSBhcnJheSB8fCBuZXcgKGR0eXBlKHR5cGUpKShudW1JbmRpY2VzKVxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gMDsgaSA8IG51bUluZGljZXM7IGkgKz0gNiwgaiArPSA0KSB7XG4gICAgICAgIHZhciB4ID0gaSArIHN0YXJ0XG4gICAgICAgIGluZGljZXNbeCArIDBdID0gaiArIDBcbiAgICAgICAgaW5kaWNlc1t4ICsgMV0gPSBqICsgMVxuICAgICAgICBpbmRpY2VzW3ggKyAyXSA9IGogKyAyXG4gICAgICAgIGluZGljZXNbeCArIDNdID0gaiArIGFcbiAgICAgICAgaW5kaWNlc1t4ICsgNF0gPSBqICsgYlxuICAgICAgICBpbmRpY2VzW3ggKyA1XSA9IGogKyBjXG4gICAgfVxuICAgIHJldHVybiBpbmRpY2VzXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3F1YWQtaW5kaWNlcy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkdHlwZSkge1xuICBzd2l0Y2ggKGR0eXBlKSB7XG4gICAgY2FzZSAnaW50OCc6XG4gICAgICByZXR1cm4gSW50OEFycmF5XG4gICAgY2FzZSAnaW50MTYnOlxuICAgICAgcmV0dXJuIEludDE2QXJyYXlcbiAgICBjYXNlICdpbnQzMic6XG4gICAgICByZXR1cm4gSW50MzJBcnJheVxuICAgIGNhc2UgJ3VpbnQ4JzpcbiAgICAgIHJldHVybiBVaW50OEFycmF5XG4gICAgY2FzZSAndWludDE2JzpcbiAgICAgIHJldHVybiBVaW50MTZBcnJheVxuICAgIGNhc2UgJ3VpbnQzMic6XG4gICAgICByZXR1cm4gVWludDMyQXJyYXlcbiAgICBjYXNlICdmbG9hdDMyJzpcbiAgICAgIHJldHVybiBGbG9hdDMyQXJyYXlcbiAgICBjYXNlICdmbG9hdDY0JzpcbiAgICAgIHJldHVybiBGbG9hdDY0QXJyYXlcbiAgICBjYXNlICdhcnJheSc6XG4gICAgICByZXR1cm4gQXJyYXlcbiAgICBjYXNlICd1aW50OF9jbGFtcGVkJzpcbiAgICAgIHJldHVybiBVaW50OENsYW1wZWRBcnJheVxuICB9XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vZHR5cGUvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDE0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBzdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG5cbm1vZHVsZS5leHBvcnRzID0gYW5BcnJheVxuXG5mdW5jdGlvbiBhbkFycmF5KGFycikge1xuICByZXR1cm4gKFxuICAgICAgIGFyci5CWVRFU19QRVJfRUxFTUVOVFxuICAgICYmIHN0ci5jYWxsKGFyci5idWZmZXIpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nXG4gICAgfHwgQXJyYXkuaXNBcnJheShhcnIpXG4gIClcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hbi1hcnJheS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyohXG4gKiBEZXRlcm1pbmUgaWYgYW4gb2JqZWN0IGlzIGEgQnVmZmVyXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxuLy8gVGhlIF9pc0J1ZmZlciBjaGVjayBpcyBmb3IgU2FmYXJpIDUtNyBzdXBwb3J0LCBiZWNhdXNlIGl0J3MgbWlzc2luZ1xuLy8gT2JqZWN0LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci4gUmVtb3ZlIHRoaXMgZXZlbnR1YWxseVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogIT0gbnVsbCAmJiAoaXNCdWZmZXIob2JqKSB8fCBpc1Nsb3dCdWZmZXIob2JqKSB8fCAhIW9iai5faXNCdWZmZXIpXG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyIChvYmopIHtcbiAgcmV0dXJuICEhb2JqLmNvbnN0cnVjdG9yICYmIHR5cGVvZiBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyKG9iailcbn1cblxuLy8gRm9yIE5vZGUgdjAuMTAgc3VwcG9ydC4gUmVtb3ZlIHRoaXMgZXZlbnR1YWxseS5cbmZ1bmN0aW9uIGlzU2xvd0J1ZmZlciAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqLnJlYWRGbG9hdExFID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBvYmouc2xpY2UgPT09ICdmdW5jdGlvbicgJiYgaXNCdWZmZXIob2JqLnNsaWNlKDAsIDApKVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2lzLWJ1ZmZlci9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGZsYXR0ZW4gPSByZXF1aXJlKCdmbGF0dGVuLXZlcnRleC1kYXRhJylcbnZhciB3YXJuZWQgPSBmYWxzZTtcblxubW9kdWxlLmV4cG9ydHMuYXR0ciA9IHNldEF0dHJpYnV0ZVxubW9kdWxlLmV4cG9ydHMuaW5kZXggPSBzZXRJbmRleFxuXG5mdW5jdGlvbiBzZXRJbmRleCAoZ2VvbWV0cnksIGRhdGEsIGl0ZW1TaXplLCBkdHlwZSkge1xuICBpZiAodHlwZW9mIGl0ZW1TaXplICE9PSAnbnVtYmVyJykgaXRlbVNpemUgPSAxXG4gIGlmICh0eXBlb2YgZHR5cGUgIT09ICdzdHJpbmcnKSBkdHlwZSA9ICd1aW50MTYnXG5cbiAgdmFyIGlzUjY5ID0gIWdlb21ldHJ5LmluZGV4ICYmIHR5cGVvZiBnZW9tZXRyeS5zZXRJbmRleCAhPT0gJ2Z1bmN0aW9uJ1xuICB2YXIgYXR0cmliID0gaXNSNjkgPyBnZW9tZXRyeS5nZXRBdHRyaWJ1dGUoJ2luZGV4JykgOiBnZW9tZXRyeS5pbmRleFxuICB2YXIgbmV3QXR0cmliID0gdXBkYXRlQXR0cmlidXRlKGF0dHJpYiwgZGF0YSwgaXRlbVNpemUsIGR0eXBlKVxuICBpZiAobmV3QXR0cmliKSB7XG4gICAgaWYgKGlzUjY5KSBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ2luZGV4JywgbmV3QXR0cmliKVxuICAgIGVsc2UgZ2VvbWV0cnkuaW5kZXggPSBuZXdBdHRyaWJcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGUgKGdlb21ldHJ5LCBrZXksIGRhdGEsIGl0ZW1TaXplLCBkdHlwZSkge1xuICBpZiAodHlwZW9mIGl0ZW1TaXplICE9PSAnbnVtYmVyJykgaXRlbVNpemUgPSAzXG4gIGlmICh0eXBlb2YgZHR5cGUgIT09ICdzdHJpbmcnKSBkdHlwZSA9ICdmbG9hdDMyJ1xuICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSAmJlxuICAgIEFycmF5LmlzQXJyYXkoZGF0YVswXSkgJiZcbiAgICBkYXRhWzBdLmxlbmd0aCAhPT0gaXRlbVNpemUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05lc3RlZCB2ZXJ0ZXggYXJyYXkgaGFzIHVuZXhwZWN0ZWQgc2l6ZTsgZXhwZWN0ZWQgJyArXG4gICAgICBpdGVtU2l6ZSArICcgYnV0IGZvdW5kICcgKyBkYXRhWzBdLmxlbmd0aClcbiAgfVxuXG4gIHZhciBhdHRyaWIgPSBnZW9tZXRyeS5nZXRBdHRyaWJ1dGUoa2V5KVxuICB2YXIgbmV3QXR0cmliID0gdXBkYXRlQXR0cmlidXRlKGF0dHJpYiwgZGF0YSwgaXRlbVNpemUsIGR0eXBlKVxuICBpZiAobmV3QXR0cmliKSB7XG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKGtleSwgbmV3QXR0cmliKVxuICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUF0dHJpYnV0ZSAoYXR0cmliLCBkYXRhLCBpdGVtU2l6ZSwgZHR5cGUpIHtcbiAgZGF0YSA9IGRhdGEgfHwgW11cbiAgaWYgKCFhdHRyaWIgfHwgcmVidWlsZEF0dHJpYnV0ZShhdHRyaWIsIGRhdGEsIGl0ZW1TaXplKSkge1xuICAgIC8vIGNyZWF0ZSBhIG5ldyBhcnJheSB3aXRoIGRlc2lyZWQgdHlwZVxuICAgIGRhdGEgPSBmbGF0dGVuKGRhdGEsIGR0eXBlKVxuXG4gICAgdmFyIG5lZWRzTmV3QnVmZmVyID0gYXR0cmliICYmIHR5cGVvZiBhdHRyaWIuc2V0QXJyYXkgIT09ICdmdW5jdGlvbidcbiAgICBpZiAoIWF0dHJpYiB8fCBuZWVkc05ld0J1ZmZlcikge1xuICAgICAgLy8gV2UgYXJlIG9uIGFuIG9sZCB2ZXJzaW9uIG9mIFRocmVlSlMgd2hpY2ggY2FuJ3RcbiAgICAgIC8vIHN1cHBvcnQgZ3Jvd2luZyAvIHNocmlua2luZyBidWZmZXJzLCBzbyB3ZSBuZWVkXG4gICAgICAvLyB0byBidWlsZCBhIG5ldyBidWZmZXJcbiAgICAgIGlmIChuZWVkc05ld0J1ZmZlciAmJiAhd2FybmVkKSB7XG4gICAgICAgIHdhcm5lZCA9IHRydWVcbiAgICAgICAgY29uc29sZS53YXJuKFtcbiAgICAgICAgICAnQSBXZWJHTCBidWZmZXIgaXMgYmVpbmcgdXBkYXRlZCB3aXRoIGEgbmV3IHNpemUgb3IgaXRlbVNpemUsICcsXG4gICAgICAgICAgJ2hvd2V2ZXIgdGhpcyB2ZXJzaW9uIG9mIFRocmVlSlMgb25seSBzdXBwb3J0cyBmaXhlZC1zaXplIGJ1ZmZlcnMuJyxcbiAgICAgICAgICAnXFxuVGhlIG9sZCBidWZmZXIgbWF5IHN0aWxsIGJlIGtlcHQgaW4gbWVtb3J5LlxcbicsXG4gICAgICAgICAgJ1RvIGF2b2lkIG1lbW9yeSBsZWFrcywgaXQgaXMgcmVjb21tZW5kZWQgdGhhdCB5b3UgZGlzcG9zZSAnLFxuICAgICAgICAgICd5b3VyIGdlb21ldHJpZXMgYW5kIGNyZWF0ZSBuZXcgb25lcywgb3IgdXBkYXRlIHRvIFRocmVlSlMgcjgyIG9yIG5ld2VyLlxcbicsXG4gICAgICAgICAgJ1NlZSBoZXJlIGZvciBkaXNjdXNzaW9uOlxcbicsXG4gICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvcHVsbC85NjMxJ1xuICAgICAgICBdLmpvaW4oJycpKVxuICAgICAgfVxuXG4gICAgICAvLyBCdWlsZCBhIG5ldyBhdHRyaWJ1dGVcbiAgICAgIGF0dHJpYiA9IG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoZGF0YSwgaXRlbVNpemUpO1xuICAgIH1cblxuICAgIGF0dHJpYi5pdGVtU2l6ZSA9IGl0ZW1TaXplXG4gICAgYXR0cmliLm5lZWRzVXBkYXRlID0gdHJ1ZVxuXG4gICAgLy8gTmV3IHZlcnNpb25zIG9mIFRocmVlSlMgc3VnZ2VzdCB1c2luZyBzZXRBcnJheVxuICAgIC8vIHRvIGNoYW5nZSB0aGUgZGF0YS4gSXQgd2lsbCB1c2UgYnVmZmVyRGF0YSBpbnRlcm5hbGx5LFxuICAgIC8vIHNvIHlvdSBjYW4gY2hhbmdlIHRoZSBhcnJheSBzaXplIHdpdGhvdXQgYW55IGlzc3Vlc1xuICAgIGlmICh0eXBlb2YgYXR0cmliLnNldEFycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhdHRyaWIuc2V0QXJyYXkoZGF0YSlcbiAgICB9XG5cbiAgICByZXR1cm4gYXR0cmliXG4gIH0gZWxzZSB7XG4gICAgLy8gY29weSBkYXRhIGludG8gdGhlIGV4aXN0aW5nIGFycmF5XG4gICAgZmxhdHRlbihkYXRhLCBhdHRyaWIuYXJyYXkpXG4gICAgYXR0cmliLm5lZWRzVXBkYXRlID0gdHJ1ZVxuICAgIHJldHVybiBudWxsXG4gIH1cbn1cblxuLy8gVGVzdCB3aGV0aGVyIHRoZSBhdHRyaWJ1dGUgbmVlZHMgdG8gYmUgcmUtY3JlYXRlZCxcbi8vIHJldHVybnMgZmFsc2UgaWYgd2UgY2FuIHJlLXVzZSBpdCBhcy1pcy5cbmZ1bmN0aW9uIHJlYnVpbGRBdHRyaWJ1dGUgKGF0dHJpYiwgZGF0YSwgaXRlbVNpemUpIHtcbiAgaWYgKGF0dHJpYi5pdGVtU2l6ZSAhPT0gaXRlbVNpemUpIHJldHVybiB0cnVlXG4gIGlmICghYXR0cmliLmFycmF5KSByZXR1cm4gdHJ1ZVxuICB2YXIgYXR0cmliTGVuZ3RoID0gYXR0cmliLmFycmF5Lmxlbmd0aFxuICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSAmJiBBcnJheS5pc0FycmF5KGRhdGFbMF0pKSB7XG4gICAgLy8gWyBbIHgsIHksIHogXSBdXG4gICAgcmV0dXJuIGF0dHJpYkxlbmd0aCAhPT0gZGF0YS5sZW5ndGggKiBpdGVtU2l6ZVxuICB9IGVsc2Uge1xuICAgIC8vIFsgeCwgeSwgeiBdXG4gICAgcmV0dXJuIGF0dHJpYkxlbmd0aCAhPT0gZGF0YS5sZW5ndGhcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi90aHJlZS1idWZmZXItdmVydGV4LWRhdGEvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDE3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qZXNsaW50IG5ldy1jYXA6MCovXG52YXIgZHR5cGUgPSByZXF1aXJlKCdkdHlwZScpXG5tb2R1bGUuZXhwb3J0cyA9IGZsYXR0ZW5WZXJ0ZXhEYXRhXG5mdW5jdGlvbiBmbGF0dGVuVmVydGV4RGF0YSAoZGF0YSwgb3V0cHV0LCBvZmZzZXQpIHtcbiAgaWYgKCFkYXRhKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdtdXN0IHNwZWNpZnkgZGF0YSBhcyBmaXJzdCBwYXJhbWV0ZXInKVxuICBvZmZzZXQgPSArKG9mZnNldCB8fCAwKSB8IDBcblxuICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSAmJiBBcnJheS5pc0FycmF5KGRhdGFbMF0pKSB7XG4gICAgdmFyIGRpbSA9IGRhdGFbMF0ubGVuZ3RoXG4gICAgdmFyIGxlbmd0aCA9IGRhdGEubGVuZ3RoICogZGltXG5cbiAgICAvLyBubyBvdXRwdXQgc3BlY2lmaWVkLCBjcmVhdGUgYSBuZXcgdHlwZWQgYXJyYXlcbiAgICBpZiAoIW91dHB1dCB8fCB0eXBlb2Ygb3V0cHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgb3V0cHV0ID0gbmV3IChkdHlwZShvdXRwdXQgfHwgJ2Zsb2F0MzInKSkobGVuZ3RoICsgb2Zmc2V0KVxuICAgIH1cblxuICAgIHZhciBkc3RMZW5ndGggPSBvdXRwdXQubGVuZ3RoIC0gb2Zmc2V0XG4gICAgaWYgKGxlbmd0aCAhPT0gZHN0TGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NvdXJjZSBsZW5ndGggJyArIGxlbmd0aCArICcgKCcgKyBkaW0gKyAneCcgKyBkYXRhLmxlbmd0aCArICcpJyArXG4gICAgICAgICcgZG9lcyBub3QgbWF0Y2ggZGVzdGluYXRpb24gbGVuZ3RoICcgKyBkc3RMZW5ndGgpXG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDAsIGsgPSBvZmZzZXQ7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGRpbTsgaisrKSB7XG4gICAgICAgIG91dHB1dFtrKytdID0gZGF0YVtpXVtqXVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoIW91dHB1dCB8fCB0eXBlb2Ygb3V0cHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gbm8gb3V0cHV0LCBjcmVhdGUgYSBuZXcgb25lXG4gICAgICB2YXIgQ3RvciA9IGR0eXBlKG91dHB1dCB8fCAnZmxvYXQzMicpXG4gICAgICBpZiAob2Zmc2V0ID09PSAwKSB7XG4gICAgICAgIG91dHB1dCA9IG5ldyBDdG9yKGRhdGEpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXRwdXQgPSBuZXcgQ3RvcihkYXRhLmxlbmd0aCArIG9mZnNldClcbiAgICAgICAgb3V0cHV0LnNldChkYXRhLCBvZmZzZXQpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHN0b3JlIG91dHB1dCBpbiBleGlzdGluZyBhcnJheVxuICAgICAgb3V0cHV0LnNldChkYXRhLCBvZmZzZXQpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dHB1dFxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2ZsYXR0ZW4tdmVydGV4LWRhdGEvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDE4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qXG5vYmplY3QtYXNzaWduXG4oYykgU2luZHJlIFNvcmh1c1xuQGxpY2Vuc2UgTUlUXG4qL1xuXG4ndXNlIHN0cmljdCc7XG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xudmFyIGdldE93blByb3BlcnR5U3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHByb3BJc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG5mdW5jdGlvbiB0b09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbmZ1bmN0aW9uIHNob3VsZFVzZU5hdGl2ZSgpIHtcblx0dHJ5IHtcblx0XHRpZiAoIU9iamVjdC5hc3NpZ24pIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBEZXRlY3QgYnVnZ3kgcHJvcGVydHkgZW51bWVyYXRpb24gb3JkZXIgaW4gb2xkZXIgVjggdmVyc2lvbnMuXG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD00MTE4XG5cdFx0dmFyIHRlc3QxID0gbmV3IFN0cmluZygnYWJjJyk7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ldy13cmFwcGVyc1xuXHRcdHRlc3QxWzVdID0gJ2RlJztcblx0XHRpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDEpWzBdID09PSAnNScpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0zMDU2XG5cdFx0dmFyIHRlc3QyID0ge307XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG5cdFx0XHR0ZXN0MlsnXycgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpXSA9IGk7XG5cdFx0fVxuXHRcdHZhciBvcmRlcjIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0ZXN0MikubWFwKGZ1bmN0aW9uIChuKSB7XG5cdFx0XHRyZXR1cm4gdGVzdDJbbl07XG5cdFx0fSk7XG5cdFx0aWYgKG9yZGVyMi5qb2luKCcnKSAhPT0gJzAxMjM0NTY3ODknKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuXHRcdHZhciB0ZXN0MyA9IHt9O1xuXHRcdCdhYmNkZWZnaGlqa2xtbm9wcXJzdCcuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24gKGxldHRlcikge1xuXHRcdFx0dGVzdDNbbGV0dGVyXSA9IGxldHRlcjtcblx0XHR9KTtcblx0XHRpZiAoT2JqZWN0LmtleXMoT2JqZWN0LmFzc2lnbih7fSwgdGVzdDMpKS5qb2luKCcnKSAhPT1cblx0XHRcdFx0J2FiY2RlZmdoaWprbG1ub3BxcnN0Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBXZSBkb24ndCBleHBlY3QgYW55IG9mIHRoZSBhYm92ZSB0byB0aHJvdywgYnV0IGJldHRlciB0byBiZSBzYWZlLlxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNob3VsZFVzZU5hdGl2ZSgpID8gT2JqZWN0LmFzc2lnbiA6IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuXHR2YXIgZnJvbTtcblx0dmFyIHRvID0gdG9PYmplY3QodGFyZ2V0KTtcblx0dmFyIHN5bWJvbHM7XG5cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRmcm9tID0gT2JqZWN0KGFyZ3VtZW50c1tzXSk7XG5cblx0XHRmb3IgKHZhciBrZXkgaW4gZnJvbSkge1xuXHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuXHRcdFx0XHR0b1trZXldID0gZnJvbVtrZXldO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChnZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcblx0XHRcdHN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZnJvbSk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHByb3BJc0VudW1lcmFibGUuY2FsbChmcm9tLCBzeW1ib2xzW2ldKSkge1xuXHRcdFx0XHRcdHRvW3N5bWJvbHNbaV1dID0gZnJvbVtzeW1ib2xzW2ldXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vb2JqZWN0LWFzc2lnbi9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMucGFnZXMgPSBmdW5jdGlvbiBwYWdlcyAoZ2x5cGhzKSB7XG4gIHZhciBwYWdlcyA9IG5ldyBGbG9hdDMyQXJyYXkoZ2x5cGhzLmxlbmd0aCAqIDQgKiAxKVxuICB2YXIgaSA9IDBcbiAgZ2x5cGhzLmZvckVhY2goZnVuY3Rpb24gKGdseXBoKSB7XG4gICAgdmFyIGlkID0gZ2x5cGguZGF0YS5wYWdlIHx8IDBcbiAgICBwYWdlc1tpKytdID0gaWRcbiAgICBwYWdlc1tpKytdID0gaWRcbiAgICBwYWdlc1tpKytdID0gaWRcbiAgICBwYWdlc1tpKytdID0gaWRcbiAgfSlcbiAgcmV0dXJuIHBhZ2VzXG59XG5cbm1vZHVsZS5leHBvcnRzLnV2cyA9IGZ1bmN0aW9uIHV2cyAoZ2x5cGhzLCB0ZXhXaWR0aCwgdGV4SGVpZ2h0LCBmbGlwWSkge1xuICB2YXIgdXZzID0gbmV3IEZsb2F0MzJBcnJheShnbHlwaHMubGVuZ3RoICogNCAqIDIpXG4gIHZhciBpID0gMFxuICBnbHlwaHMuZm9yRWFjaChmdW5jdGlvbiAoZ2x5cGgpIHtcbiAgICB2YXIgYml0bWFwID0gZ2x5cGguZGF0YVxuICAgIHZhciBidyA9IChiaXRtYXAueCArIGJpdG1hcC53aWR0aClcbiAgICB2YXIgYmggPSAoYml0bWFwLnkgKyBiaXRtYXAuaGVpZ2h0KVxuXG4gICAgLy8gdG9wIGxlZnQgcG9zaXRpb25cbiAgICB2YXIgdTAgPSBiaXRtYXAueCAvIHRleFdpZHRoXG4gICAgdmFyIHYxID0gYml0bWFwLnkgLyB0ZXhIZWlnaHRcbiAgICB2YXIgdTEgPSBidyAvIHRleFdpZHRoXG4gICAgdmFyIHYwID0gYmggLyB0ZXhIZWlnaHRcblxuICAgIGlmIChmbGlwWSkge1xuICAgICAgdjEgPSAodGV4SGVpZ2h0IC0gYml0bWFwLnkpIC8gdGV4SGVpZ2h0XG4gICAgICB2MCA9ICh0ZXhIZWlnaHQgLSBiaCkgLyB0ZXhIZWlnaHRcbiAgICB9XG5cbiAgICAvLyBCTFxuICAgIHV2c1tpKytdID0gdTBcbiAgICB1dnNbaSsrXSA9IHYxXG4gICAgLy8gVExcbiAgICB1dnNbaSsrXSA9IHUwXG4gICAgdXZzW2krK10gPSB2MFxuICAgIC8vIFRSXG4gICAgdXZzW2krK10gPSB1MVxuICAgIHV2c1tpKytdID0gdjBcbiAgICAvLyBCUlxuICAgIHV2c1tpKytdID0gdTFcbiAgICB1dnNbaSsrXSA9IHYxXG4gIH0pXG4gIHJldHVybiB1dnNcbn1cblxubW9kdWxlLmV4cG9ydHMucG9zaXRpb25zID0gZnVuY3Rpb24gcG9zaXRpb25zIChnbHlwaHMpIHtcbiAgdmFyIHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkoZ2x5cGhzLmxlbmd0aCAqIDQgKiAyKVxuICB2YXIgaSA9IDBcbiAgZ2x5cGhzLmZvckVhY2goZnVuY3Rpb24gKGdseXBoKSB7XG4gICAgdmFyIGJpdG1hcCA9IGdseXBoLmRhdGFcblxuICAgIC8vIGJvdHRvbSBsZWZ0IHBvc2l0aW9uXG4gICAgdmFyIHggPSBnbHlwaC5wb3NpdGlvblswXSArIGJpdG1hcC54b2Zmc2V0XG4gICAgdmFyIHkgPSBnbHlwaC5wb3NpdGlvblsxXSArIGJpdG1hcC55b2Zmc2V0XG5cbiAgICAvLyBxdWFkIHNpemVcbiAgICB2YXIgdyA9IGJpdG1hcC53aWR0aFxuICAgIHZhciBoID0gYml0bWFwLmhlaWdodFxuXG4gICAgLy8gQkxcbiAgICBwb3NpdGlvbnNbaSsrXSA9IHhcbiAgICBwb3NpdGlvbnNbaSsrXSA9IHlcbiAgICAvLyBUTFxuICAgIHBvc2l0aW9uc1tpKytdID0geFxuICAgIHBvc2l0aW9uc1tpKytdID0geSArIGhcbiAgICAvLyBUUlxuICAgIHBvc2l0aW9uc1tpKytdID0geCArIHdcbiAgICBwb3NpdGlvbnNbaSsrXSA9IHkgKyBoXG4gICAgLy8gQlJcbiAgICBwb3NpdGlvbnNbaSsrXSA9IHggKyB3XG4gICAgcG9zaXRpb25zW2krK10gPSB5XG4gIH0pXG4gIHJldHVybiBwb3NpdGlvbnNcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi90aHJlZS1ibWZvbnQtdGV4dC9saWIvdmVydGljZXMuanNcbi8vIG1vZHVsZSBpZCA9IDIwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBpdGVtU2l6ZSA9IDJcbnZhciBib3ggPSB7IG1pbjogWzAsIDBdLCBtYXg6IFswLCAwXSB9XG5cbmZ1bmN0aW9uIGJvdW5kcyAocG9zaXRpb25zKSB7XG4gIHZhciBjb3VudCA9IHBvc2l0aW9ucy5sZW5ndGggLyBpdGVtU2l6ZVxuICBib3gubWluWzBdID0gcG9zaXRpb25zWzBdXG4gIGJveC5taW5bMV0gPSBwb3NpdGlvbnNbMV1cbiAgYm94Lm1heFswXSA9IHBvc2l0aW9uc1swXVxuICBib3gubWF4WzFdID0gcG9zaXRpb25zWzFdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgdmFyIHggPSBwb3NpdGlvbnNbaSAqIGl0ZW1TaXplICsgMF1cbiAgICB2YXIgeSA9IHBvc2l0aW9uc1tpICogaXRlbVNpemUgKyAxXVxuICAgIGJveC5taW5bMF0gPSBNYXRoLm1pbih4LCBib3gubWluWzBdKVxuICAgIGJveC5taW5bMV0gPSBNYXRoLm1pbih5LCBib3gubWluWzFdKVxuICAgIGJveC5tYXhbMF0gPSBNYXRoLm1heCh4LCBib3gubWF4WzBdKVxuICAgIGJveC5tYXhbMV0gPSBNYXRoLm1heCh5LCBib3gubWF4WzFdKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmNvbXB1dGVCb3ggPSBmdW5jdGlvbiAocG9zaXRpb25zLCBvdXRwdXQpIHtcbiAgYm91bmRzKHBvc2l0aW9ucylcbiAgb3V0cHV0Lm1pbi5zZXQoYm94Lm1pblswXSwgYm94Lm1pblsxXSwgMClcbiAgb3V0cHV0Lm1heC5zZXQoYm94Lm1heFswXSwgYm94Lm1heFsxXSwgMClcbn1cblxubW9kdWxlLmV4cG9ydHMuY29tcHV0ZVNwaGVyZSA9IGZ1bmN0aW9uIChwb3NpdGlvbnMsIG91dHB1dCkge1xuICBib3VuZHMocG9zaXRpb25zKVxuICB2YXIgbWluWCA9IGJveC5taW5bMF1cbiAgdmFyIG1pblkgPSBib3gubWluWzFdXG4gIHZhciBtYXhYID0gYm94Lm1heFswXVxuICB2YXIgbWF4WSA9IGJveC5tYXhbMV1cbiAgdmFyIHdpZHRoID0gbWF4WCAtIG1pblhcbiAgdmFyIGhlaWdodCA9IG1heFkgLSBtaW5ZXG4gIHZhciBsZW5ndGggPSBNYXRoLnNxcnQod2lkdGggKiB3aWR0aCArIGhlaWdodCAqIGhlaWdodClcbiAgb3V0cHV0LmNlbnRlci5zZXQobWluWCArIHdpZHRoIC8gMiwgbWluWSArIGhlaWdodCAvIDIsIDApXG4gIG91dHB1dC5yYWRpdXMgPSBsZW5ndGggLyAyXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vdGhyZWUtYm1mb250LXRleHQvbGliL3V0aWxzLmpzXG4vLyBtb2R1bGUgaWQgPSAyMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgeGhyID0gcmVxdWlyZSgneGhyJylcbnZhciBub29wID0gZnVuY3Rpb24oKXt9XG52YXIgcGFyc2VBU0NJSSA9IHJlcXVpcmUoJ3BhcnNlLWJtZm9udC1hc2NpaScpXG52YXIgcGFyc2VYTUwgPSByZXF1aXJlKCdwYXJzZS1ibWZvbnQteG1sJylcbnZhciByZWFkQmluYXJ5ID0gcmVxdWlyZSgncGFyc2UtYm1mb250LWJpbmFyeScpXG52YXIgaXNCaW5hcnlGb3JtYXQgPSByZXF1aXJlKCcuL2xpYi9pcy1iaW5hcnknKVxudmFyIHh0ZW5kID0gcmVxdWlyZSgneHRlbmQnKVxuXG52YXIgeG1sMiA9IChmdW5jdGlvbiBoYXNYTUwyKCkge1xuICByZXR1cm4gc2VsZi5YTUxIdHRwUmVxdWVzdCAmJiBcIndpdGhDcmVkZW50aWFsc1wiIGluIG5ldyBYTUxIdHRwUmVxdWVzdFxufSkoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdCwgY2IpIHtcbiAgY2IgPSB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicgPyBjYiA6IG5vb3BcblxuICBpZiAodHlwZW9mIG9wdCA9PT0gJ3N0cmluZycpXG4gICAgb3B0ID0geyB1cmk6IG9wdCB9XG4gIGVsc2UgaWYgKCFvcHQpXG4gICAgb3B0ID0ge31cblxuICB2YXIgZXhwZWN0QmluYXJ5ID0gb3B0LmJpbmFyeVxuICBpZiAoZXhwZWN0QmluYXJ5KVxuICAgIG9wdCA9IGdldEJpbmFyeU9wdHMob3B0KVxuXG4gIHhocihvcHQsIGZ1bmN0aW9uKGVyciwgcmVzLCBib2R5KSB7XG4gICAgaWYgKGVycilcbiAgICAgIHJldHVybiBjYihlcnIpXG4gICAgaWYgKCEvXjIvLnRlc3QocmVzLnN0YXR1c0NvZGUpKVxuICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignaHR0cCBzdGF0dXMgY29kZTogJytyZXMuc3RhdHVzQ29kZSkpXG4gICAgaWYgKCFib2R5KVxuICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignbm8gYm9keSByZXN1bHQnKSlcblxuICAgIHZhciBiaW5hcnkgPSBmYWxzZSBcblxuICAgIC8vaWYgdGhlIHJlc3BvbnNlIHR5cGUgaXMgYW4gYXJyYXkgYnVmZmVyLFxuICAgIC8vd2UgbmVlZCB0byBjb252ZXJ0IGl0IGludG8gYSByZWd1bGFyIEJ1ZmZlciBvYmplY3RcbiAgICBpZiAoaXNBcnJheUJ1ZmZlcihib2R5KSkge1xuICAgICAgdmFyIGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYm9keSlcbiAgICAgIGJvZHkgPSBuZXcgQnVmZmVyKGFycmF5LCAnYmluYXJ5JylcbiAgICB9XG5cbiAgICAvL25vdyBjaGVjayB0aGUgc3RyaW5nL0J1ZmZlciByZXNwb25zZVxuICAgIC8vYW5kIHNlZSBpZiBpdCBoYXMgYSBiaW5hcnkgQk1GIGhlYWRlclxuICAgIGlmIChpc0JpbmFyeUZvcm1hdChib2R5KSkge1xuICAgICAgYmluYXJ5ID0gdHJ1ZVxuICAgICAgLy9pZiB3ZSBoYXZlIGEgc3RyaW5nLCB0dXJuIGl0IGludG8gYSBCdWZmZXJcbiAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIFxuICAgICAgICBib2R5ID0gbmV3IEJ1ZmZlcihib2R5LCAnYmluYXJ5JylcbiAgICB9IFxuXG4gICAgLy93ZSBhcmUgbm90IHBhcnNpbmcgYSBiaW5hcnkgZm9ybWF0LCBqdXN0IEFTQ0lJL1hNTC9ldGNcbiAgICBpZiAoIWJpbmFyeSkge1xuICAgICAgLy9taWdodCBzdGlsbCBiZSBhIGJ1ZmZlciBpZiByZXNwb25zZVR5cGUgaXMgJ2FycmF5YnVmZmVyJ1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihib2R5KSlcbiAgICAgICAgYm9keSA9IGJvZHkudG9TdHJpbmcob3B0LmVuY29kaW5nKVxuICAgICAgYm9keSA9IGJvZHkudHJpbSgpXG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICB2YXIgdHlwZSA9IHJlcy5oZWFkZXJzWydjb250ZW50LXR5cGUnXVxuICAgICAgaWYgKGJpbmFyeSlcbiAgICAgICAgcmVzdWx0ID0gcmVhZEJpbmFyeShib2R5KVxuICAgICAgZWxzZSBpZiAoL2pzb24vLnRlc3QodHlwZSkgfHwgYm9keS5jaGFyQXQoMCkgPT09ICd7JylcbiAgICAgICAgcmVzdWx0ID0gSlNPTi5wYXJzZShib2R5KVxuICAgICAgZWxzZSBpZiAoL3htbC8udGVzdCh0eXBlKSAgfHwgYm9keS5jaGFyQXQoMCkgPT09ICc8JylcbiAgICAgICAgcmVzdWx0ID0gcGFyc2VYTUwoYm9keSlcbiAgICAgIGVsc2VcbiAgICAgICAgcmVzdWx0ID0gcGFyc2VBU0NJSShib2R5KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNiKG5ldyBFcnJvcignZXJyb3IgcGFyc2luZyBmb250ICcrZS5tZXNzYWdlKSlcbiAgICAgIGNiID0gbm9vcFxuICAgIH1cbiAgICBjYihudWxsLCByZXN1bHQpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIoYXJyKSB7XG4gIHZhciBzdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG4gIHJldHVybiBzdHIuY2FsbChhcnIpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nXG59XG5cbmZ1bmN0aW9uIGdldEJpbmFyeU9wdHMob3B0KSB7XG4gIC8vSUUxMCsgYW5kIG90aGVyIG1vZGVybiBicm93c2VycyBzdXBwb3J0IGFycmF5IGJ1ZmZlcnNcbiAgaWYgKHhtbDIpXG4gICAgcmV0dXJuIHh0ZW5kKG9wdCwgeyByZXNwb25zZVR5cGU6ICdhcnJheWJ1ZmZlcicgfSlcbiAgXG4gIGlmICh0eXBlb2Ygc2VsZi5YTUxIdHRwUmVxdWVzdCA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgdGhyb3cgbmV3IEVycm9yKCd5b3VyIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBYSFIgbG9hZGluZycpXG5cbiAgLy9JRTkgYW5kIFhNTDEgYnJvd3NlcnMgY291bGQgc3RpbGwgdXNlIGFuIG92ZXJyaWRlXG4gIHZhciByZXEgPSBuZXcgc2VsZi5YTUxIdHRwUmVxdWVzdCgpXG4gIHJlcS5vdmVycmlkZU1pbWVUeXBlKCd0ZXh0L3BsYWluOyBjaGFyc2V0PXgtdXNlci1kZWZpbmVkJylcbiAgcmV0dXJuIHh0ZW5kKHtcbiAgICB4aHI6IHJlcVxuICB9LCBvcHQpXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbG9hZC1ibWZvbnQvYnJvd3Nlci5qc1xuLy8gbW9kdWxlIGlkID0gMjJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnaXNhcnJheScpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBTbG93QnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogRHVlIHRvIHZhcmlvdXMgYnJvd3NlciBidWdzLCBzb21ldGltZXMgdGhlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiB3aWxsIGJlIHVzZWQgZXZlblxuICogd2hlbiB0aGUgYnJvd3NlciBzdXBwb3J0cyB0eXBlZCBhcnJheXMuXG4gKlxuICogTm90ZTpcbiAqXG4gKiAgIC0gRmlyZWZveCA0LTI5IGxhY2tzIHN1cHBvcnQgZm9yIGFkZGluZyBuZXcgcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLFxuICogICAgIFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4LlxuICpcbiAqICAgLSBDaHJvbWUgOS0xMCBpcyBtaXNzaW5nIHRoZSBgVHlwZWRBcnJheS5wcm90b3R5cGUuc3ViYXJyYXlgIGZ1bmN0aW9uLlxuICpcbiAqICAgLSBJRTEwIGhhcyBhIGJyb2tlbiBgVHlwZWRBcnJheS5wcm90b3R5cGUuc3ViYXJyYXlgIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYXJyYXlzIG9mXG4gKiAgICAgaW5jb3JyZWN0IGxlbmd0aCBpbiBzb21lIHNpdHVhdGlvbnMuXG5cbiAqIFdlIGRldGVjdCB0aGVzZSBidWdneSBicm93c2VycyBhbmQgc2V0IGBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVGAgdG8gYGZhbHNlYCBzbyB0aGV5XG4gKiBnZXQgdGhlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiwgd2hpY2ggaXMgc2xvd2VyIGJ1dCBiZWhhdmVzIGNvcnJlY3RseS5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSBnbG9iYWwuVFlQRURfQVJSQVlfU1VQUE9SVCAhPT0gdW5kZWZpbmVkXG4gID8gZ2xvYmFsLlRZUEVEX0FSUkFZX1NVUFBPUlRcbiAgOiB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbi8qXG4gKiBFeHBvcnQga01heExlbmd0aCBhZnRlciB0eXBlZCBhcnJheSBzdXBwb3J0IGlzIGRldGVybWluZWQuXG4gKi9cbmV4cG9ydHMua01heExlbmd0aCA9IGtNYXhMZW5ndGgoKVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5U3VwcG9ydCAoKSB7XG4gIHRyeSB7XG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KDEpXG4gICAgYXJyLl9fcHJvdG9fXyA9IHtfX3Byb3RvX186IFVpbnQ4QXJyYXkucHJvdG90eXBlLCBmb286IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH19XG4gICAgcmV0dXJuIGFyci5mb28oKSA9PT0gNDIgJiYgLy8gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGNhbiBiZSBhdWdtZW50ZWRcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAmJiAvLyBjaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgICAgICAgYXJyLnN1YmFycmF5KDEsIDEpLmJ5dGVMZW5ndGggPT09IDAgLy8gaWUxMCBoYXMgYnJva2VuIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGtNYXhMZW5ndGggKCkge1xuICByZXR1cm4gQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRcbiAgICA/IDB4N2ZmZmZmZmZcbiAgICA6IDB4M2ZmZmZmZmZcbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVmZmVyICh0aGF0LCBsZW5ndGgpIHtcbiAgaWYgKGtNYXhMZW5ndGgoKSA8IGxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHR5cGVkIGFycmF5IGxlbmd0aCcpXG4gIH1cbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UsIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgdGhhdCA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgICB0aGF0Ll9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIGFuIG9iamVjdCBpbnN0YW5jZSBvZiB0aGUgQnVmZmVyIGNsYXNzXG4gICAgaWYgKHRoYXQgPT09IG51bGwpIHtcbiAgICAgIHRoYXQgPSBuZXcgQnVmZmVyKGxlbmd0aClcbiAgICB9XG4gICAgdGhhdC5sZW5ndGggPSBsZW5ndGhcbiAgfVxuXG4gIHJldHVybiB0aGF0XG59XG5cbi8qKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBoYXZlIHRoZWlyXG4gKiBwcm90b3R5cGUgY2hhbmdlZCB0byBgQnVmZmVyLnByb3RvdHlwZWAuIEZ1cnRoZXJtb3JlLCBgQnVmZmVyYCBpcyBhIHN1YmNsYXNzIG9mXG4gKiBgVWludDhBcnJheWAsIHNvIHRoZSByZXR1cm5lZCBpbnN0YW5jZXMgd2lsbCBoYXZlIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBtZXRob2RzXG4gKiBhbmQgdGhlIGBVaW50OEFycmF5YCBtZXRob2RzLiBTcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdFxuICogcmV0dXJucyBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBUaGUgYFVpbnQ4QXJyYXlgIHByb3RvdHlwZSByZW1haW5zIHVubW9kaWZpZWQuXG4gKi9cblxuZnVuY3Rpb24gQnVmZmVyIChhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmICEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIC8vIENvbW1vbiBjYXNlLlxuICBpZiAodHlwZW9mIGFyZyA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAodHlwZW9mIGVuY29kaW5nT3JPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdJZiBlbmNvZGluZyBpcyBzcGVjaWZpZWQgdGhlbiB0aGUgZmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZydcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIGFsbG9jVW5zYWZlKHRoaXMsIGFyZylcbiAgfVxuICByZXR1cm4gZnJvbSh0aGlzLCBhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnBvb2xTaXplID0gODE5MiAvLyBub3QgdXNlZCBieSB0aGlzIGltcGxlbWVudGF0aW9uXG5cbi8vIFRPRE86IExlZ2FjeSwgbm90IG5lZWRlZCBhbnltb3JlLiBSZW1vdmUgaW4gbmV4dCBtYWpvciB2ZXJzaW9uLlxuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIGZyb20gKHRoYXQsIHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgbXVzdCBub3QgYmUgYSBudW1iZXInKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodGhhdCwgdmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodGhhdCwgdmFsdWUsIGVuY29kaW5nT3JPZmZzZXQpXG4gIH1cblxuICByZXR1cm4gZnJvbU9iamVjdCh0aGF0LCB2YWx1ZSlcbn1cblxuLyoqXG4gKiBGdW5jdGlvbmFsbHkgZXF1aXZhbGVudCB0byBCdWZmZXIoYXJnLCBlbmNvZGluZykgYnV0IHRocm93cyBhIFR5cGVFcnJvclxuICogaWYgdmFsdWUgaXMgYSBudW1iZXIuXG4gKiBCdWZmZXIuZnJvbShzdHJbLCBlbmNvZGluZ10pXG4gKiBCdWZmZXIuZnJvbShhcnJheSlcbiAqIEJ1ZmZlci5mcm9tKGJ1ZmZlcilcbiAqIEJ1ZmZlci5mcm9tKGFycmF5QnVmZmVyWywgYnl0ZU9mZnNldFssIGxlbmd0aF1dKVxuICoqL1xuQnVmZmVyLmZyb20gPSBmdW5jdGlvbiAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gZnJvbShudWxsLCB2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG5pZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgQnVmZmVyLnByb3RvdHlwZS5fX3Byb3RvX18gPSBVaW50OEFycmF5LnByb3RvdHlwZVxuICBCdWZmZXIuX19wcm90b19fID0gVWludDhBcnJheVxuICBpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnNwZWNpZXMgJiZcbiAgICAgIEJ1ZmZlcltTeW1ib2wuc3BlY2llc10gPT09IEJ1ZmZlcikge1xuICAgIC8vIEZpeCBzdWJhcnJheSgpIGluIEVTMjAxNi4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9wdWxsLzk3XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlciwgU3ltYm9sLnNwZWNpZXMsIHtcbiAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRTaXplIChzaXplKSB7XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IGJlIGEgbnVtYmVyJylcbiAgfSBlbHNlIGlmIChzaXplIDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBuZWdhdGl2ZScpXG4gIH1cbn1cblxuZnVuY3Rpb24gYWxsb2MgKHRoYXQsIHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIGFzc2VydFNpemUoc2l6ZSlcbiAgaWYgKHNpemUgPD0gMCkge1xuICAgIHJldHVybiBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSlcbiAgfVxuICBpZiAoZmlsbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gT25seSBwYXkgYXR0ZW50aW9uIHRvIGVuY29kaW5nIGlmIGl0J3MgYSBzdHJpbmcuIFRoaXNcbiAgICAvLyBwcmV2ZW50cyBhY2NpZGVudGFsbHkgc2VuZGluZyBpbiBhIG51bWJlciB0aGF0IHdvdWxkXG4gICAgLy8gYmUgaW50ZXJwcmV0dGVkIGFzIGEgc3RhcnQgb2Zmc2V0LlxuICAgIHJldHVybiB0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnXG4gICAgICA/IGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplKS5maWxsKGZpbGwsIGVuY29kaW5nKVxuICAgICAgOiBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSkuZmlsbChmaWxsKVxuICB9XG4gIHJldHVybiBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSlcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiBhbGxvYyhzaXplWywgZmlsbFssIGVuY29kaW5nXV0pXG4gKiovXG5CdWZmZXIuYWxsb2MgPSBmdW5jdGlvbiAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGFsbG9jKG51bGwsIHNpemUsIGZpbGwsIGVuY29kaW5nKVxufVxuXG5mdW5jdGlvbiBhbGxvY1Vuc2FmZSAodGhhdCwgc2l6ZSkge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIHRoYXQgPSBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSA8IDAgPyAwIDogY2hlY2tlZChzaXplKSB8IDApXG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpemU7ICsraSkge1xuICAgICAgdGhhdFtpXSA9IDBcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoYXRcbn1cblxuLyoqXG4gKiBFcXVpdmFsZW50IHRvIEJ1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZSA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIHJldHVybiBhbGxvY1Vuc2FmZShudWxsLCBzaXplKVxufVxuLyoqXG4gKiBFcXVpdmFsZW50IHRvIFNsb3dCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlU2xvdyA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIHJldHVybiBhbGxvY1Vuc2FmZShudWxsLCBzaXplKVxufVxuXG5mdW5jdGlvbiBmcm9tU3RyaW5nICh0aGF0LCBzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmICh0eXBlb2YgZW5jb2RpbmcgIT09ICdzdHJpbmcnIHx8IGVuY29kaW5nID09PSAnJykge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gIH1cblxuICBpZiAoIUJ1ZmZlci5pc0VuY29kaW5nKGVuY29kaW5nKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZW5jb2RpbmdcIiBtdXN0IGJlIGEgdmFsaWQgc3RyaW5nIGVuY29kaW5nJylcbiAgfVxuXG4gIHZhciBsZW5ndGggPSBieXRlTGVuZ3RoKHN0cmluZywgZW5jb2RpbmcpIHwgMFxuICB0aGF0ID0gY3JlYXRlQnVmZmVyKHRoYXQsIGxlbmd0aClcblxuICB2YXIgYWN0dWFsID0gdGhhdC53cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuXG4gIGlmIChhY3R1YWwgIT09IGxlbmd0aCkge1xuICAgIC8vIFdyaXRpbmcgYSBoZXggc3RyaW5nLCBmb3IgZXhhbXBsZSwgdGhhdCBjb250YWlucyBpbnZhbGlkIGNoYXJhY3RlcnMgd2lsbFxuICAgIC8vIGNhdXNlIGV2ZXJ5dGhpbmcgYWZ0ZXIgdGhlIGZpcnN0IGludmFsaWQgY2hhcmFjdGVyIHRvIGJlIGlnbm9yZWQuIChlLmcuXG4gICAgLy8gJ2FieHhjZCcgd2lsbCBiZSB0cmVhdGVkIGFzICdhYicpXG4gICAgdGhhdCA9IHRoYXQuc2xpY2UoMCwgYWN0dWFsKVxuICB9XG5cbiAgcmV0dXJuIHRoYXRcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5TGlrZSAodGhhdCwgYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCA8IDAgPyAwIDogY2hlY2tlZChhcnJheS5sZW5ndGgpIHwgMFxuICB0aGF0ID0gY3JlYXRlQnVmZmVyKHRoYXQsIGxlbmd0aClcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIHRoYXRbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUJ1ZmZlciAodGhhdCwgYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aCkge1xuICBhcnJheS5ieXRlTGVuZ3RoIC8vIHRoaXMgdGhyb3dzIGlmIGBhcnJheWAgaXMgbm90IGEgdmFsaWQgQXJyYXlCdWZmZXJcblxuICBpZiAoYnl0ZU9mZnNldCA8IDAgfHwgYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXFwnb2Zmc2V0XFwnIGlzIG91dCBvZiBib3VuZHMnKVxuICB9XG5cbiAgaWYgKGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0ICsgKGxlbmd0aCB8fCAwKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdsZW5ndGhcXCcgaXMgb3V0IG9mIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYnl0ZU9mZnNldCA9PT0gdW5kZWZpbmVkICYmIGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheSlcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQpXG4gIH0gZWxzZSB7XG4gICAgYXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UsIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgdGhhdCA9IGFycmF5XG4gICAgdGhhdC5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBhbiBvYmplY3QgaW5zdGFuY2Ugb2YgdGhlIEJ1ZmZlciBjbGFzc1xuICAgIHRoYXQgPSBmcm9tQXJyYXlMaWtlKHRoYXQsIGFycmF5KVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21PYmplY3QgKHRoYXQsIG9iaikge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKG9iaikpIHtcbiAgICB2YXIgbGVuID0gY2hlY2tlZChvYmoubGVuZ3RoKSB8IDBcbiAgICB0aGF0ID0gY3JlYXRlQnVmZmVyKHRoYXQsIGxlbilcblxuICAgIGlmICh0aGF0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoYXRcbiAgICB9XG5cbiAgICBvYmouY29weSh0aGF0LCAwLCAwLCBsZW4pXG4gICAgcmV0dXJuIHRoYXRcbiAgfVxuXG4gIGlmIChvYmopIHtcbiAgICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgb2JqLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB8fCAnbGVuZ3RoJyBpbiBvYmopIHtcbiAgICAgIGlmICh0eXBlb2Ygb2JqLmxlbmd0aCAhPT0gJ251bWJlcicgfHwgaXNuYW4ob2JqLmxlbmd0aCkpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcih0aGF0LCAwKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZyb21BcnJheUxpa2UodGhhdCwgb2JqKVxuICAgIH1cblxuICAgIGlmIChvYmoudHlwZSA9PT0gJ0J1ZmZlcicgJiYgaXNBcnJheShvYmouZGF0YSkpIHtcbiAgICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKHRoYXQsIG9iai5kYXRhKVxuICAgIH1cbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcsIEJ1ZmZlciwgQXJyYXlCdWZmZXIsIEFycmF5LCBvciBhcnJheS1saWtlIG9iamVjdC4nKVxufVxuXG5mdW5jdGlvbiBjaGVja2VkIChsZW5ndGgpIHtcbiAgLy8gTm90ZTogY2Fubm90IHVzZSBgbGVuZ3RoIDwga01heExlbmd0aCgpYCBoZXJlIGJlY2F1c2UgdGhhdCBmYWlscyB3aGVuXG4gIC8vIGxlbmd0aCBpcyBOYU4gKHdoaWNoIGlzIG90aGVyd2lzZSBjb2VyY2VkIHRvIHplcm8uKVxuICBpZiAobGVuZ3RoID49IGtNYXhMZW5ndGgoKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIGFsbG9jYXRlIEJ1ZmZlciBsYXJnZXIgdGhhbiBtYXhpbXVtICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdzaXplOiAweCcgKyBrTWF4TGVuZ3RoKCkudG9TdHJpbmcoMTYpICsgJyBieXRlcycpXG4gIH1cbiAgcmV0dXJuIGxlbmd0aCB8IDBcbn1cblxuZnVuY3Rpb24gU2xvd0J1ZmZlciAobGVuZ3RoKSB7XG4gIGlmICgrbGVuZ3RoICE9IGxlbmd0aCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGVxZXFlcVxuICAgIGxlbmd0aCA9IDBcbiAgfVxuICByZXR1cm4gQnVmZmVyLmFsbG9jKCtsZW5ndGgpXG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIGlzQnVmZmVyIChiKSB7XG4gIHJldHVybiAhIShiICE9IG51bGwgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAoYSwgYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihhKSB8fCAhQnVmZmVyLmlzQnVmZmVyKGIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIG11c3QgYmUgQnVmZmVycycpXG4gIH1cblxuICBpZiAoYSA9PT0gYikgcmV0dXJuIDBcblxuICB2YXIgeCA9IGEubGVuZ3RoXG4gIHZhciB5ID0gYi5sZW5ndGhcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gTWF0aC5taW4oeCwgeSk7IGkgPCBsZW47ICsraSkge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSB7XG4gICAgICB4ID0gYVtpXVxuICAgICAgeSA9IGJbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIGlzRW5jb2RpbmcgKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gY29uY2F0IChsaXN0LCBsZW5ndGgpIHtcbiAgaWYgKCFpc0FycmF5KGxpc3QpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgfVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBCdWZmZXIuYWxsb2MoMClcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGxlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgbGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZmZlciA9IEJ1ZmZlci5hbGxvY1Vuc2FmZShsZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGJ1ZiA9IGxpc3RbaV1cbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICAgIH1cbiAgICBidWYuY29weShidWZmZXIsIHBvcylcbiAgICBwb3MgKz0gYnVmLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZmZXJcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nLmxlbmd0aFxuICB9XG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBBcnJheUJ1ZmZlci5pc1ZpZXcgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIChBcnJheUJ1ZmZlci5pc1ZpZXcoc3RyaW5nKSB8fCBzdHJpbmcgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikpIHtcbiAgICByZXR1cm4gc3RyaW5nLmJ5dGVMZW5ndGhcbiAgfVxuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICBzdHJpbmcgPSAnJyArIHN0cmluZ1xuICB9XG5cbiAgdmFyIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKGxlbiA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBVc2UgYSBmb3IgbG9vcCB0byBhdm9pZCByZWN1cnNpb25cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGVuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiBsZW4gKiAyXG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gbGVuID4+PiAxXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGggLy8gYXNzdW1lIHV0ZjhcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuXG5mdW5jdGlvbiBzbG93VG9TdHJpbmcgKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG5cbiAgLy8gTm8gbmVlZCB0byB2ZXJpZnkgdGhhdCBcInRoaXMubGVuZ3RoIDw9IE1BWF9VSU5UMzJcIiBzaW5jZSBpdCdzIGEgcmVhZC1vbmx5XG4gIC8vIHByb3BlcnR5IG9mIGEgdHlwZWQgYXJyYXkuXG5cbiAgLy8gVGhpcyBiZWhhdmVzIG5laXRoZXIgbGlrZSBTdHJpbmcgbm9yIFVpbnQ4QXJyYXkgaW4gdGhhdCB3ZSBzZXQgc3RhcnQvZW5kXG4gIC8vIHRvIHRoZWlyIHVwcGVyL2xvd2VyIGJvdW5kcyBpZiB0aGUgdmFsdWUgcGFzc2VkIGlzIG91dCBvZiByYW5nZS5cbiAgLy8gdW5kZWZpbmVkIGlzIGhhbmRsZWQgc3BlY2lhbGx5IGFzIHBlciBFQ01BLTI2MiA2dGggRWRpdGlvbixcbiAgLy8gU2VjdGlvbiAxMy4zLjMuNyBSdW50aW1lIFNlbWFudGljczogS2V5ZWRCaW5kaW5nSW5pdGlhbGl6YXRpb24uXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkIHx8IHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIC8vIFJldHVybiBlYXJseSBpZiBzdGFydCA+IHRoaXMubGVuZ3RoLiBEb25lIGhlcmUgdG8gcHJldmVudCBwb3RlbnRpYWwgdWludDMyXG4gIC8vIGNvZXJjaW9uIGZhaWwgYmVsb3cuXG4gIGlmIChzdGFydCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoZW5kID09PSB1bmRlZmluZWQgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKGVuZCA8PSAwKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICAvLyBGb3JjZSBjb2Vyc2lvbiB0byB1aW50MzIuIFRoaXMgd2lsbCBhbHNvIGNvZXJjZSBmYWxzZXkvTmFOIHZhbHVlcyB0byAwLlxuICBlbmQgPj4+PSAwXG4gIHN0YXJ0ID4+Pj0gMFxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9IChlbmNvZGluZyArICcnKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBUaGUgcHJvcGVydHkgaXMgdXNlZCBieSBgQnVmZmVyLmlzQnVmZmVyYCBhbmQgYGlzLWJ1ZmZlcmAgKGluIFNhZmFyaSA1LTcpIHRvIGRldGVjdFxuLy8gQnVmZmVyIGluc3RhbmNlcy5cbkJ1ZmZlci5wcm90b3R5cGUuX2lzQnVmZmVyID0gdHJ1ZVxuXG5mdW5jdGlvbiBzd2FwIChiLCBuLCBtKSB7XG4gIHZhciBpID0gYltuXVxuICBiW25dID0gYlttXVxuICBiW21dID0gaVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAxNiA9IGZ1bmN0aW9uIHN3YXAxNiAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgMiAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMTYtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDEpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMzIgPSBmdW5jdGlvbiBzd2FwMzIgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDQgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDMyLWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAzKVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyAyKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDY0ID0gZnVuY3Rpb24gc3dhcDY0ICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA4ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA2NC1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA4KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgNylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgNilcbiAgICBzd2FwKHRoaXMsIGkgKyAyLCBpICsgNSlcbiAgICBzd2FwKHRoaXMsIGkgKyAzLCBpICsgNClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGggfCAwXG4gIGlmIChsZW5ndGggPT09IDApIHJldHVybiAnJ1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCAwLCBsZW5ndGgpXG4gIHJldHVybiBzbG93VG9TdHJpbmcuYXBwbHkodGhpcywgYXJndW1lbnRzKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyAoYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIGlmICh0aGlzID09PSBiKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gQnVmZmVyLmNvbXBhcmUodGhpcywgYikgPT09IDBcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gaW5zcGVjdCAoKSB7XG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgbWF4ID0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFU1xuICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5tYXRjaCgvLnsyfS9nKS5qb2luKCcgJylcbiAgICBpZiAodGhpcy5sZW5ndGggPiBtYXgpIHN0ciArPSAnIC4uLiAnXG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBzdHIgKyAnPidcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAodGFyZ2V0LCBzdGFydCwgZW5kLCB0aGlzU3RhcnQsIHRoaXNFbmQpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXInKVxuICB9XG5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICBpZiAoZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmQgPSB0YXJnZXQgPyB0YXJnZXQubGVuZ3RoIDogMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNTdGFydCA9IDBcbiAgfVxuICBpZiAodGhpc0VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc0VuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoc3RhcnQgPCAwIHx8IGVuZCA+IHRhcmdldC5sZW5ndGggfHwgdGhpc1N0YXJ0IDwgMCB8fCB0aGlzRW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCAmJiBzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCkge1xuICAgIHJldHVybiAtMVxuICB9XG4gIGlmIChzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMVxuICB9XG5cbiAgc3RhcnQgPj4+PSAwXG4gIGVuZCA+Pj49IDBcbiAgdGhpc1N0YXJ0ID4+Pj0gMFxuICB0aGlzRW5kID4+Pj0gMFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQpIHJldHVybiAwXG5cbiAgdmFyIHggPSB0aGlzRW5kIC0gdGhpc1N0YXJ0XG4gIHZhciB5ID0gZW5kIC0gc3RhcnRcbiAgdmFyIGxlbiA9IE1hdGgubWluKHgsIHkpXG5cbiAgdmFyIHRoaXNDb3B5ID0gdGhpcy5zbGljZSh0aGlzU3RhcnQsIHRoaXNFbmQpXG4gIHZhciB0YXJnZXRDb3B5ID0gdGFyZ2V0LnNsaWNlKHN0YXJ0LCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIGlmICh0aGlzQ29weVtpXSAhPT0gdGFyZ2V0Q29weVtpXSkge1xuICAgICAgeCA9IHRoaXNDb3B5W2ldXG4gICAgICB5ID0gdGFyZ2V0Q29weVtpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbi8vIEZpbmRzIGVpdGhlciB0aGUgZmlyc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0ID49IGBieXRlT2Zmc2V0YCxcbi8vIE9SIHRoZSBsYXN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA8PSBgYnl0ZU9mZnNldGAuXG4vL1xuLy8gQXJndW1lbnRzOlxuLy8gLSBidWZmZXIgLSBhIEJ1ZmZlciB0byBzZWFyY2hcbi8vIC0gdmFsIC0gYSBzdHJpbmcsIEJ1ZmZlciwgb3IgbnVtYmVyXG4vLyAtIGJ5dGVPZmZzZXQgLSBhbiBpbmRleCBpbnRvIGBidWZmZXJgOyB3aWxsIGJlIGNsYW1wZWQgdG8gYW4gaW50MzJcbi8vIC0gZW5jb2RpbmcgLSBhbiBvcHRpb25hbCBlbmNvZGluZywgcmVsZXZhbnQgaXMgdmFsIGlzIGEgc3RyaW5nXG4vLyAtIGRpciAtIHRydWUgZm9yIGluZGV4T2YsIGZhbHNlIGZvciBsYXN0SW5kZXhPZlxuZnVuY3Rpb24gYmlkaXJlY3Rpb25hbEluZGV4T2YgKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIC8vIEVtcHR5IGJ1ZmZlciBtZWFucyBubyBtYXRjaFxuICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkgcmV0dXJuIC0xXG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXRcbiAgaWYgKHR5cGVvZiBieXRlT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gYnl0ZU9mZnNldFxuICAgIGJ5dGVPZmZzZXQgPSAwXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA+IDB4N2ZmZmZmZmYpIHtcbiAgICBieXRlT2Zmc2V0ID0gMHg3ZmZmZmZmZlxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAtMHg4MDAwMDAwMCkge1xuICAgIGJ5dGVPZmZzZXQgPSAtMHg4MDAwMDAwMFxuICB9XG4gIGJ5dGVPZmZzZXQgPSArYnl0ZU9mZnNldCAgLy8gQ29lcmNlIHRvIE51bWJlci5cbiAgaWYgKGlzTmFOKGJ5dGVPZmZzZXQpKSB7XG4gICAgLy8gYnl0ZU9mZnNldDogaXQgaXQncyB1bmRlZmluZWQsIG51bGwsIE5hTiwgXCJmb29cIiwgZXRjLCBzZWFyY2ggd2hvbGUgYnVmZmVyXG4gICAgYnl0ZU9mZnNldCA9IGRpciA/IDAgOiAoYnVmZmVyLmxlbmd0aCAtIDEpXG4gIH1cblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldDogbmVnYXRpdmUgb2Zmc2V0cyBzdGFydCBmcm9tIHRoZSBlbmQgb2YgdGhlIGJ1ZmZlclxuICBpZiAoYnl0ZU9mZnNldCA8IDApIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoICsgYnl0ZU9mZnNldFxuICBpZiAoYnl0ZU9mZnNldCA+PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgaWYgKGRpcikgcmV0dXJuIC0xXG4gICAgZWxzZSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCAtIDFcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgMCkge1xuICAgIGlmIChkaXIpIGJ5dGVPZmZzZXQgPSAwXG4gICAgZWxzZSByZXR1cm4gLTFcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB2YWxcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsID0gQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgfVxuXG4gIC8vIEZpbmFsbHksIHNlYXJjaCBlaXRoZXIgaW5kZXhPZiAoaWYgZGlyIGlzIHRydWUpIG9yIGxhc3RJbmRleE9mXG4gIGlmIChCdWZmZXIuaXNCdWZmZXIodmFsKSkge1xuICAgIC8vIFNwZWNpYWwgY2FzZTogbG9va2luZyBmb3IgZW1wdHkgc3RyaW5nL2J1ZmZlciBhbHdheXMgZmFpbHNcbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAweEZGIC8vIFNlYXJjaCBmb3IgYSBieXRlIHZhbHVlIFswLTI1NV1cbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiZcbiAgICAgICAgdHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgWyB2YWwgXSwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZhbCBtdXN0IGJlIHN0cmluZywgbnVtYmVyIG9yIEJ1ZmZlcicpXG59XG5cbmZ1bmN0aW9uIGFycmF5SW5kZXhPZiAoYXJyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgdmFyIGluZGV4U2l6ZSA9IDFcbiAgdmFyIGFyckxlbmd0aCA9IGFyci5sZW5ndGhcbiAgdmFyIHZhbExlbmd0aCA9IHZhbC5sZW5ndGhcblxuICBpZiAoZW5jb2RpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgaWYgKGVuY29kaW5nID09PSAndWNzMicgfHwgZW5jb2RpbmcgPT09ICd1Y3MtMicgfHxcbiAgICAgICAgZW5jb2RpbmcgPT09ICd1dGYxNmxlJyB8fCBlbmNvZGluZyA9PT0gJ3V0Zi0xNmxlJykge1xuICAgICAgaWYgKGFyci5sZW5ndGggPCAyIHx8IHZhbC5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiAtMVxuICAgICAgfVxuICAgICAgaW5kZXhTaXplID0gMlxuICAgICAgYXJyTGVuZ3RoIC89IDJcbiAgICAgIHZhbExlbmd0aCAvPSAyXG4gICAgICBieXRlT2Zmc2V0IC89IDJcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWFkIChidWYsIGkpIHtcbiAgICBpZiAoaW5kZXhTaXplID09PSAxKSB7XG4gICAgICByZXR1cm4gYnVmW2ldXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBidWYucmVhZFVJbnQxNkJFKGkgKiBpbmRleFNpemUpXG4gICAgfVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKGRpcikge1xuICAgIHZhciBmb3VuZEluZGV4ID0gLTFcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpIDwgYXJyTGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChyZWFkKGFyciwgaSkgPT09IHJlYWQodmFsLCBmb3VuZEluZGV4ID09PSAtMSA/IDAgOiBpIC0gZm91bmRJbmRleCkpIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggPT09IC0xKSBmb3VuZEluZGV4ID0gaVxuICAgICAgICBpZiAoaSAtIGZvdW5kSW5kZXggKyAxID09PSB2YWxMZW5ndGgpIHJldHVybiBmb3VuZEluZGV4ICogaW5kZXhTaXplXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZm91bmRJbmRleCAhPT0gLTEpIGkgLT0gaSAtIGZvdW5kSW5kZXhcbiAgICAgICAgZm91bmRJbmRleCA9IC0xXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChieXRlT2Zmc2V0ICsgdmFsTGVuZ3RoID4gYXJyTGVuZ3RoKSBieXRlT2Zmc2V0ID0gYXJyTGVuZ3RoIC0gdmFsTGVuZ3RoXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciBmb3VuZCA9IHRydWVcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmFsTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKHJlYWQoYXJyLCBpICsgaikgIT09IHJlYWQodmFsLCBqKSkge1xuICAgICAgICAgIGZvdW5kID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZm91bmQpIHJldHVybiBpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5jbHVkZXMgPSBmdW5jdGlvbiBpbmNsdWRlcyAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gdGhpcy5pbmRleE9mKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpICE9PSAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiBpbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCB0cnVlKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmxhc3RJbmRleE9mID0gZnVuY3Rpb24gbGFzdEluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiBoZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChzdHJMZW4gJSAyICE9PSAwKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgcGFyc2VkID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGlmIChpc05hTihwYXJzZWQpKSByZXR1cm4gaVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IHBhcnNlZFxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIHV0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gbGF0aW4xV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGJhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiB1Y3MyV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcpXG4gIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgb2Zmc2V0WywgbGVuZ3RoXVssIGVuY29kaW5nXSlcbiAgfSBlbHNlIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICAgIGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggfCAwXG4gICAgICBpZiAoZW5jb2RpbmcgPT09IHVuZGVmaW5lZCkgZW5jb2RpbmcgPSAndXRmOCdcbiAgICB9IGVsc2Uge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgLy8gbGVnYWN5IHdyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKSAtIHJlbW92ZSBpbiB2MC4xM1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdCdWZmZXIud3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0WywgbGVuZ3RoXSkgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCdcbiAgICApXG4gIH1cblxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IGxlbmd0aCA+IHJlbWFpbmluZykgbGVuZ3RoID0gcmVtYWluaW5nXG5cbiAgaWYgKChzdHJpbmcubGVuZ3RoID4gMCAmJiAobGVuZ3RoIDwgMCB8fCBvZmZzZXQgPCAwKSkgfHwgb2Zmc2V0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byB3cml0ZSBvdXRzaWRlIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICAvLyBXYXJuaW5nOiBtYXhMZW5ndGggbm90IHRha2VuIGludG8gYWNjb3VudCBpbiBiYXNlNjRXcml0ZVxuICAgICAgICByZXR1cm4gYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHVjczJXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG4gIHZhciByZXMgPSBbXVxuXG4gIHZhciBpID0gc3RhcnRcbiAgd2hpbGUgKGkgPCBlbmQpIHtcbiAgICB2YXIgZmlyc3RCeXRlID0gYnVmW2ldXG4gICAgdmFyIGNvZGVQb2ludCA9IG51bGxcbiAgICB2YXIgYnl0ZXNQZXJTZXF1ZW5jZSA9IChmaXJzdEJ5dGUgPiAweEVGKSA/IDRcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4REYpID8gM1xuICAgICAgOiAoZmlyc3RCeXRlID4gMHhCRikgPyAyXG4gICAgICA6IDFcblxuICAgIGlmIChpICsgYnl0ZXNQZXJTZXF1ZW5jZSA8PSBlbmQpIHtcbiAgICAgIHZhciBzZWNvbmRCeXRlLCB0aGlyZEJ5dGUsIGZvdXJ0aEJ5dGUsIHRlbXBDb2RlUG9pbnRcblxuICAgICAgc3dpdGNoIChieXRlc1BlclNlcXVlbmNlKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAoZmlyc3RCeXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgY29kZVBvaW50ID0gZmlyc3RCeXRlXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4MUYpIDw8IDB4NiB8IChzZWNvbmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3Rikge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweEMgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4NiB8ICh0aGlyZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGRiAmJiAodGVtcENvZGVQb2ludCA8IDB4RDgwMCB8fCB0ZW1wQ29kZVBvaW50ID4gMHhERkZGKSkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBmb3VydGhCeXRlID0gYnVmW2kgKyAzXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAoZm91cnRoQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHgxMiB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHhDIHwgKHRoaXJkQnl0ZSAmIDB4M0YpIDw8IDB4NiB8IChmb3VydGhCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHhGRkZGICYmIHRlbXBDb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlUG9pbnQgPT09IG51bGwpIHtcbiAgICAgIC8vIHdlIGRpZCBub3QgZ2VuZXJhdGUgYSB2YWxpZCBjb2RlUG9pbnQgc28gaW5zZXJ0IGFcbiAgICAgIC8vIHJlcGxhY2VtZW50IGNoYXIgKFUrRkZGRCkgYW5kIGFkdmFuY2Ugb25seSAxIGJ5dGVcbiAgICAgIGNvZGVQb2ludCA9IDB4RkZGRFxuICAgICAgYnl0ZXNQZXJTZXF1ZW5jZSA9IDFcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA+IDB4RkZGRikge1xuICAgICAgLy8gZW5jb2RlIHRvIHV0ZjE2IChzdXJyb2dhdGUgcGFpciBkYW5jZSlcbiAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwXG4gICAgICByZXMucHVzaChjb2RlUG9pbnQgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApXG4gICAgICBjb2RlUG9pbnQgPSAweERDMDAgfCBjb2RlUG9pbnQgJiAweDNGRlxuICAgIH1cblxuICAgIHJlcy5wdXNoKGNvZGVQb2ludClcbiAgICBpICs9IGJ5dGVzUGVyU2VxdWVuY2VcbiAgfVxuXG4gIHJldHVybiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkocmVzKVxufVxuXG4vLyBCYXNlZCBvbiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjc0NzI3Mi82ODA3NDIsIHRoZSBicm93c2VyIHdpdGhcbi8vIHRoZSBsb3dlc3QgbGltaXQgaXMgQ2hyb21lLCB3aXRoIDB4MTAwMDAgYXJncy5cbi8vIFdlIGdvIDEgbWFnbml0dWRlIGxlc3MsIGZvciBzYWZldHlcbnZhciBNQVhfQVJHVU1FTlRTX0xFTkdUSCA9IDB4MTAwMFxuXG5mdW5jdGlvbiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkgKGNvZGVQb2ludHMpIHtcbiAgdmFyIGxlbiA9IGNvZGVQb2ludHMubGVuZ3RoXG4gIGlmIChsZW4gPD0gTUFYX0FSR1VNRU5UU19MRU5HVEgpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShTdHJpbmcsIGNvZGVQb2ludHMpIC8vIGF2b2lkIGV4dHJhIHNsaWNlKClcbiAgfVxuXG4gIC8vIERlY29kZSBpbiBjaHVua3MgdG8gYXZvaWQgXCJjYWxsIHN0YWNrIHNpemUgZXhjZWVkZWRcIi5cbiAgdmFyIHJlcyA9ICcnXG4gIHZhciBpID0gMFxuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFxuICAgICAgU3RyaW5nLFxuICAgICAgY29kZVBvaW50cy5zbGljZShpLCBpICs9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKVxuICAgIClcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldICYgMHg3RilcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGxhdGluMVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGhleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpICsgMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gc2xpY2UgKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gfn5zdGFydFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IH5+ZW5kXG5cbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ICs9IGxlblxuICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICB9IGVsc2UgaWYgKHN0YXJ0ID4gbGVuKSB7XG4gICAgc3RhcnQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCAwKSB7XG4gICAgZW5kICs9IGxlblxuICAgIGlmIChlbmQgPCAwKSBlbmQgPSAwXG4gIH0gZWxzZSBpZiAoZW5kID4gbGVuKSB7XG4gICAgZW5kID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgdmFyIG5ld0J1ZlxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICBuZXdCdWYgPSB0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpXG4gICAgbmV3QnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZClcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyArK2kpIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXdCdWZcbn1cblxuLypcbiAqIE5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgYnVmZmVyIGlzbid0IHRyeWluZyB0byB3cml0ZSBvdXQgb2YgYm91bmRzLlxuICovXG5mdW5jdGlvbiBjaGVja09mZnNldCAob2Zmc2V0LCBleHQsIGxlbmd0aCkge1xuICBpZiAoKG9mZnNldCAlIDEpICE9PSAwIHx8IG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdvZmZzZXQgaXMgbm90IHVpbnQnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gbGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVHJ5aW5nIHRvIGFjY2VzcyBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRMRSA9IGZ1bmN0aW9uIHJlYWRVSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRCRSA9IGZ1bmN0aW9uIHJlYWRVSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG4gIH1cblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdXG4gIHZhciBtdWwgPSAxXG4gIHdoaWxlIChieXRlTGVuZ3RoID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiByZWFkVUludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiByZWFkVUludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICgodGhpc1tvZmZzZXRdKSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikpICtcbiAgICAgICh0aGlzW29mZnNldCArIDNdICogMHgxMDAwMDAwKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdICogMHgxMDAwMDAwKSArXG4gICAgKCh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgIHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludExFID0gZnVuY3Rpb24gcmVhZEludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludEJFID0gZnVuY3Rpb24gcmVhZEludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoXG4gIHZhciBtdWwgPSAxXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0taV1cbiAgd2hpbGUgKGkgPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1pXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiByZWFkSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICBpZiAoISh0aGlzW29mZnNldF0gJiAweDgwKSkgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gcmVhZEludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIDFdIHwgKHRoaXNbb2Zmc2V0XSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiByZWFkSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdKSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10gPDwgMjQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiByZWFkSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDI0KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiByZWFkRmxvYXRMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiByZWFkRmxvYXRCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gcmVhZERvdWJsZUJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgNTIsIDgpXG59XG5cbmZ1bmN0aW9uIGNoZWNrSW50IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJidWZmZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyIGluc3RhbmNlJylcbiAgaWYgKHZhbHVlID4gbWF4IHx8IHZhbHVlIDwgbWluKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJ2YWx1ZVwiIGFyZ3VtZW50IGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uIHdyaXRlVUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCAyKTsgaSA8IGo7ICsraSkge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIG9mZnNldCwgNCk7IGkgPCBqOyArK2kpIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50TEUgPSBmdW5jdGlvbiB3cml0ZUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gMFxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgLSAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50QkUgPSBmdW5jdGlvbiB3cml0ZUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IDBcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgKyAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uIHdyaXRlSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweDdmLCAtMHg4MClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmYgKyB2YWx1ZSArIDFcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuZnVuY3Rpb24gY2hlY2tJRUVFNzU0IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAob2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gd3JpdGVGbG9hdExFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgKyBzdGFydFxuICB9XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG4gIHZhciBpXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCAmJiBzdGFydCA8IHRhcmdldFN0YXJ0ICYmIHRhcmdldFN0YXJ0IDwgZW5kKSB7XG4gICAgLy8gZGVzY2VuZGluZyBjb3B5IGZyb20gZW5kXG4gICAgZm9yIChpID0gbGVuIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2UgaWYgKGxlbiA8IDEwMDAgfHwgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gYXNjZW5kaW5nIGNvcHkgZnJvbSBzdGFydFxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgVWludDhBcnJheS5wcm90b3R5cGUuc2V0LmNhbGwoXG4gICAgICB0YXJnZXQsXG4gICAgICB0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksXG4gICAgICB0YXJnZXRTdGFydFxuICAgIClcbiAgfVxuXG4gIHJldHVybiBsZW5cbn1cblxuLy8gVXNhZ2U6XG4vLyAgICBidWZmZXIuZmlsbChudW1iZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKGJ1ZmZlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoc3RyaW5nWywgb2Zmc2V0WywgZW5kXV1bLCBlbmNvZGluZ10pXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiBmaWxsICh2YWwsIHN0YXJ0LCBlbmQsIGVuY29kaW5nKSB7XG4gIC8vIEhhbmRsZSBzdHJpbmcgY2FzZXM6XG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IHN0YXJ0XG4gICAgICBzdGFydCA9IDBcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW5kID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBlbmRcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfVxuICAgIGlmICh2YWwubGVuZ3RoID09PSAxKSB7XG4gICAgICB2YXIgY29kZSA9IHZhbC5jaGFyQ29kZUF0KDApXG4gICAgICBpZiAoY29kZSA8IDI1Nikge1xuICAgICAgICB2YWwgPSBjb2RlXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VuY29kaW5nIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJyAmJiAhQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMjU1XG4gIH1cblxuICAvLyBJbnZhbGlkIHJhbmdlcyBhcmUgbm90IHNldCB0byBhIGRlZmF1bHQsIHNvIGNhbiByYW5nZSBjaGVjayBlYXJseS5cbiAgaWYgKHN0YXJ0IDwgMCB8fCB0aGlzLmxlbmd0aCA8IHN0YXJ0IHx8IHRoaXMubGVuZ3RoIDwgZW5kKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ091dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHN0YXJ0ID0gc3RhcnQgPj4+IDBcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyB0aGlzLmxlbmd0aCA6IGVuZCA+Pj4gMFxuXG4gIGlmICghdmFsKSB2YWwgPSAwXG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgICAgdGhpc1tpXSA9IHZhbFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnl0ZXMgPSBCdWZmZXIuaXNCdWZmZXIodmFsKVxuICAgICAgPyB2YWxcbiAgICAgIDogdXRmOFRvQnl0ZXMobmV3IEJ1ZmZlcih2YWwsIGVuY29kaW5nKS50b1N0cmluZygpKVxuICAgIHZhciBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBmb3IgKGkgPSAwOyBpIDwgZW5kIC0gc3RhcnQ7ICsraSkge1xuICAgICAgdGhpc1tpICsgc3RhcnRdID0gYnl0ZXNbaSAlIGxlbl1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbnZhciBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXitcXC8wLTlBLVphLXotX10vZ1xuXG5mdW5jdGlvbiBiYXNlNjRjbGVhbiAoc3RyKSB7XG4gIC8vIE5vZGUgc3RyaXBzIG91dCBpbnZhbGlkIGNoYXJhY3RlcnMgbGlrZSBcXG4gYW5kIFxcdCBmcm9tIHRoZSBzdHJpbmcsIGJhc2U2NC1qcyBkb2VzIG5vdFxuICBzdHIgPSBzdHJpbmd0cmltKHN0cikucmVwbGFjZShJTlZBTElEX0JBU0U2NF9SRSwgJycpXG4gIC8vIE5vZGUgY29udmVydHMgc3RyaW5ncyB3aXRoIGxlbmd0aCA8IDIgdG8gJydcbiAgaWYgKHN0ci5sZW5ndGggPCAyKSByZXR1cm4gJydcbiAgLy8gTm9kZSBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgYmFzZTY0IHN0cmluZ3MgKG1pc3NpbmcgdHJhaWxpbmcgPT09KSwgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHdoaWxlIChzdHIubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgIHN0ciA9IHN0ciArICc9J1xuICB9XG4gIHJldHVybiBzdHJcbn1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyaW5nLCB1bml0cykge1xuICB1bml0cyA9IHVuaXRzIHx8IEluZmluaXR5XG4gIHZhciBjb2RlUG9pbnRcbiAgdmFyIGxlbmd0aCA9IHN0cmluZy5sZW5ndGhcbiAgdmFyIGxlYWRTdXJyb2dhdGUgPSBudWxsXG4gIHZhciBieXRlcyA9IFtdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvZGVQb2ludCA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG5cbiAgICAvLyBpcyBzdXJyb2dhdGUgY29tcG9uZW50XG4gICAgaWYgKGNvZGVQb2ludCA+IDB4RDdGRiAmJiBjb2RlUG9pbnQgPCAweEUwMDApIHtcbiAgICAgIC8vIGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoIWxlYWRTdXJyb2dhdGUpIHtcbiAgICAgICAgLy8gbm8gbGVhZCB5ZXRcbiAgICAgICAgaWYgKGNvZGVQb2ludCA+IDB4REJGRikge1xuICAgICAgICAgIC8vIHVuZXhwZWN0ZWQgdHJhaWxcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2UgaWYgKGkgKyAxID09PSBsZW5ndGgpIHtcbiAgICAgICAgICAvLyB1bnBhaXJlZCBsZWFkXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhbGlkIGxlYWRcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgIGlmIChjb2RlUG9pbnQgPCAweERDMDApIHtcbiAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWQgc3Vycm9nYXRlIHBhaXJcbiAgICAgIGNvZGVQb2ludCA9IChsZWFkU3Vycm9nYXRlIC0gMHhEODAwIDw8IDEwIHwgY29kZVBvaW50IC0gMHhEQzAwKSArIDB4MTAwMDBcbiAgICB9IGVsc2UgaWYgKGxlYWRTdXJyb2dhdGUpIHtcbiAgICAgIC8vIHZhbGlkIGJtcCBjaGFyLCBidXQgbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgIH1cblxuICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG5cbiAgICAvLyBlbmNvZGUgdXRmOFxuICAgIGlmIChjb2RlUG9pbnQgPCAweDgwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDEpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goY29kZVBvaW50KVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHg4MDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiB8IDB4QzAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDMpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgfCAweEUwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSA0KSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHgxMiB8IDB4RjAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29kZSBwb2ludCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIsIHVuaXRzKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG5cbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShiYXNlNjRjbGVhbihzdHIpKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSkgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBpc25hbiAodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IHZhbCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2J1ZmZlci9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydHMuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcbmV4cG9ydHMudG9CeXRlQXJyYXkgPSB0b0J5dGVBcnJheVxuZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gZnJvbUJ5dGVBcnJheVxuXG52YXIgbG9va3VwID0gW11cbnZhciByZXZMb29rdXAgPSBbXVxudmFyIEFyciA9IHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJyA/IFVpbnQ4QXJyYXkgOiBBcnJheVxuXG52YXIgY29kZSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJ1xuZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgbG9va3VwW2ldID0gY29kZVtpXVxuICByZXZMb29rdXBbY29kZS5jaGFyQ29kZUF0KGkpXSA9IGlcbn1cblxucmV2TG9va3VwWyctJy5jaGFyQ29kZUF0KDApXSA9IDYyXG5yZXZMb29rdXBbJ18nLmNoYXJDb2RlQXQoMCldID0gNjNcblxuZnVuY3Rpb24gcGxhY2VIb2xkZXJzQ291bnQgKGI2NCkge1xuICB2YXIgbGVuID0gYjY0Lmxlbmd0aFxuICBpZiAobGVuICUgNCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuICB9XG5cbiAgLy8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcbiAgLy8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuICAvLyByZXByZXNlbnQgb25lIGJ5dGVcbiAgLy8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG4gIC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2VcbiAgcmV0dXJuIGI2NFtsZW4gLSAyXSA9PT0gJz0nID8gMiA6IGI2NFtsZW4gLSAxXSA9PT0gJz0nID8gMSA6IDBcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoYjY0KSB7XG4gIC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuICByZXR1cm4gYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzQ291bnQoYjY0KVxufVxuXG5mdW5jdGlvbiB0b0J5dGVBcnJheSAoYjY0KSB7XG4gIHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG4gIHZhciBsZW4gPSBiNjQubGVuZ3RoXG4gIHBsYWNlSG9sZGVycyA9IHBsYWNlSG9sZGVyc0NvdW50KGI2NClcblxuICBhcnIgPSBuZXcgQXJyKGxlbiAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxuXG4gIC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcbiAgbCA9IHBsYWNlSG9sZGVycyA+IDAgPyBsZW4gLSA0IDogbGVuXG5cbiAgdmFyIEwgPSAwXG5cbiAgZm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuICAgIHRtcCA9IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDE4KSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA8PCAxMikgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPDwgNikgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDMpXVxuICAgIGFycltMKytdID0gKHRtcCA+PiAxNikgJiAweEZGXG4gICAgYXJyW0wrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltMKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgaWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xuICAgIHRtcCA9IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDIpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldID4+IDQpXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTApIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDQpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildID4+IDIpXG4gICAgYXJyW0wrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltMKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIGFyclxufVxuXG5mdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuICByZXR1cm4gbG9va3VwW251bSA+PiAxOCAmIDB4M0ZdICsgbG9va3VwW251bSA+PiAxMiAmIDB4M0ZdICsgbG9va3VwW251bSA+PiA2ICYgMHgzRl0gKyBsb29rdXBbbnVtICYgMHgzRl1cbn1cblxuZnVuY3Rpb24gZW5jb2RlQ2h1bmsgKHVpbnQ4LCBzdGFydCwgZW5kKSB7XG4gIHZhciB0bXBcbiAgdmFyIG91dHB1dCA9IFtdXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSAzKSB7XG4gICAgdG1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKVxuICAgIG91dHB1dC5wdXNoKHRyaXBsZXRUb0Jhc2U2NCh0bXApKVxuICB9XG4gIHJldHVybiBvdXRwdXQuam9pbignJylcbn1cblxuZnVuY3Rpb24gZnJvbUJ5dGVBcnJheSAodWludDgpIHtcbiAgdmFyIHRtcFxuICB2YXIgbGVuID0gdWludDgubGVuZ3RoXG4gIHZhciBleHRyYUJ5dGVzID0gbGVuICUgMyAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuICB2YXIgb3V0cHV0ID0gJydcbiAgdmFyIHBhcnRzID0gW11cbiAgdmFyIG1heENodW5rTGVuZ3RoID0gMTYzODMgLy8gbXVzdCBiZSBtdWx0aXBsZSBvZiAzXG5cbiAgLy8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuICBmb3IgKHZhciBpID0gMCwgbGVuMiA9IGxlbiAtIGV4dHJhQnl0ZXM7IGkgPCBsZW4yOyBpICs9IG1heENodW5rTGVuZ3RoKSB7XG4gICAgcGFydHMucHVzaChlbmNvZGVDaHVuayh1aW50OCwgaSwgKGkgKyBtYXhDaHVua0xlbmd0aCkgPiBsZW4yID8gbGVuMiA6IChpICsgbWF4Q2h1bmtMZW5ndGgpKSlcbiAgfVxuXG4gIC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcbiAgaWYgKGV4dHJhQnl0ZXMgPT09IDEpIHtcbiAgICB0bXAgPSB1aW50OFtsZW4gLSAxXVxuICAgIG91dHB1dCArPSBsb29rdXBbdG1wID4+IDJdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFsodG1wIDw8IDQpICYgMHgzRl1cbiAgICBvdXRwdXQgKz0gJz09J1xuICB9IGVsc2UgaWYgKGV4dHJhQnl0ZXMgPT09IDIpIHtcbiAgICB0bXAgPSAodWludDhbbGVuIC0gMl0gPDwgOCkgKyAodWludDhbbGVuIC0gMV0pXG4gICAgb3V0cHV0ICs9IGxvb2t1cFt0bXAgPj4gMTBdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFsodG1wID4+IDQpICYgMHgzRl1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPDwgMikgJiAweDNGXVxuICAgIG91dHB1dCArPSAnPSdcbiAgfVxuXG4gIHBhcnRzLnB1c2gob3V0cHV0KVxuXG4gIHJldHVybiBwYXJ0cy5qb2luKCcnKVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2Jhc2U2NC1qcy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vaWVlZTc1NC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoYXJyKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGFycikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vaXNhcnJheS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgd2luZG93ID0gcmVxdWlyZShcImdsb2JhbC93aW5kb3dcIilcbnZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZShcImlzLWZ1bmN0aW9uXCIpXG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZShcInBhcnNlLWhlYWRlcnNcIilcbnZhciB4dGVuZCA9IHJlcXVpcmUoXCJ4dGVuZFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVhIUlxuY3JlYXRlWEhSLlhNTEh0dHBSZXF1ZXN0ID0gd2luZG93LlhNTEh0dHBSZXF1ZXN0IHx8IG5vb3BcbmNyZWF0ZVhIUi5YRG9tYWluUmVxdWVzdCA9IFwid2l0aENyZWRlbnRpYWxzXCIgaW4gKG5ldyBjcmVhdGVYSFIuWE1MSHR0cFJlcXVlc3QoKSkgPyBjcmVhdGVYSFIuWE1MSHR0cFJlcXVlc3QgOiB3aW5kb3cuWERvbWFpblJlcXVlc3RcblxuZm9yRWFjaEFycmF5KFtcImdldFwiLCBcInB1dFwiLCBcInBvc3RcIiwgXCJwYXRjaFwiLCBcImhlYWRcIiwgXCJkZWxldGVcIl0sIGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIGNyZWF0ZVhIUlttZXRob2QgPT09IFwiZGVsZXRlXCIgPyBcImRlbFwiIDogbWV0aG9kXSA9IGZ1bmN0aW9uKHVyaSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICAgICAgb3B0aW9ucyA9IGluaXRQYXJhbXModXJpLCBvcHRpb25zLCBjYWxsYmFjaylcbiAgICAgICAgb3B0aW9ucy5tZXRob2QgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgICAgICByZXR1cm4gX2NyZWF0ZVhIUihvcHRpb25zKVxuICAgIH1cbn0pXG5cbmZ1bmN0aW9uIGZvckVhY2hBcnJheShhcnJheSwgaXRlcmF0b3IpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZXJhdG9yKGFycmF5W2ldKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNFbXB0eShvYmope1xuICAgIGZvcih2YXIgaSBpbiBvYmope1xuICAgICAgICBpZihvYmouaGFzT3duUHJvcGVydHkoaSkpIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiBpbml0UGFyYW1zKHVyaSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICB2YXIgcGFyYW1zID0gdXJpXG5cbiAgICBpZiAoaXNGdW5jdGlvbihvcHRpb25zKSkge1xuICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnNcbiAgICAgICAgaWYgKHR5cGVvZiB1cmkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHBhcmFtcyA9IHt1cmk6dXJpfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcGFyYW1zID0geHRlbmQob3B0aW9ucywge3VyaTogdXJpfSlcbiAgICB9XG5cbiAgICBwYXJhbXMuY2FsbGJhY2sgPSBjYWxsYmFja1xuICAgIHJldHVybiBwYXJhbXNcbn1cblxuZnVuY3Rpb24gY3JlYXRlWEhSKHVyaSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBvcHRpb25zID0gaW5pdFBhcmFtcyh1cmksIG9wdGlvbnMsIGNhbGxiYWNrKVxuICAgIHJldHVybiBfY3JlYXRlWEhSKG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVYSFIob3B0aW9ucykge1xuICAgIGlmKHR5cGVvZiBvcHRpb25zLmNhbGxiYWNrID09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2FsbGJhY2sgYXJndW1lbnQgbWlzc2luZ1wiKVxuICAgIH1cblxuICAgIHZhciBjYWxsZWQgPSBmYWxzZVxuICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uIGNiT25jZShlcnIsIHJlc3BvbnNlLCBib2R5KXtcbiAgICAgICAgaWYoIWNhbGxlZCl7XG4gICAgICAgICAgICBjYWxsZWQgPSB0cnVlXG4gICAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrKGVyciwgcmVzcG9uc2UsIGJvZHkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkeXN0YXRlY2hhbmdlKCkge1xuICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgIGxvYWRGdW5jKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJvZHkoKSB7XG4gICAgICAgIC8vIENocm9tZSB3aXRoIHJlcXVlc3RUeXBlPWJsb2IgdGhyb3dzIGVycm9ycyBhcnJvdW5kIHdoZW4gZXZlbiB0ZXN0aW5nIGFjY2VzcyB0byByZXNwb25zZVRleHRcbiAgICAgICAgdmFyIGJvZHkgPSB1bmRlZmluZWRcblxuICAgICAgICBpZiAoeGhyLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICBib2R5ID0geGhyLnJlc3BvbnNlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib2R5ID0geGhyLnJlc3BvbnNlVGV4dCB8fCBnZXRYbWwoeGhyKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzSnNvbikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBib2R5ID0gSlNPTi5wYXJzZShib2R5KVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBib2R5XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXJyb3JGdW5jKGV2dCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dFRpbWVyKVxuICAgICAgICBpZighKGV2dCBpbnN0YW5jZW9mIEVycm9yKSl7XG4gICAgICAgICAgICBldnQgPSBuZXcgRXJyb3IoXCJcIiArIChldnQgfHwgXCJVbmtub3duIFhNTEh0dHBSZXF1ZXN0IEVycm9yXCIpIClcbiAgICAgICAgfVxuICAgICAgICBldnQuc3RhdHVzQ29kZSA9IDBcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGV2dCwgZmFpbHVyZVJlc3BvbnNlKVxuICAgIH1cblxuICAgIC8vIHdpbGwgbG9hZCB0aGUgZGF0YSAmIHByb2Nlc3MgdGhlIHJlc3BvbnNlIGluIGEgc3BlY2lhbCByZXNwb25zZSBvYmplY3RcbiAgICBmdW5jdGlvbiBsb2FkRnVuYygpIHtcbiAgICAgICAgaWYgKGFib3J0ZWQpIHJldHVyblxuICAgICAgICB2YXIgc3RhdHVzXG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0VGltZXIpXG4gICAgICAgIGlmKG9wdGlvbnMudXNlWERSICYmIHhoci5zdGF0dXM9PT11bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vSUU4IENPUlMgR0VUIHN1Y2Nlc3NmdWwgcmVzcG9uc2UgZG9lc24ndCBoYXZlIGEgc3RhdHVzIGZpZWxkLCBidXQgYm9keSBpcyBmaW5lXG4gICAgICAgICAgICBzdGF0dXMgPSAyMDBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXR1cyA9ICh4aHIuc3RhdHVzID09PSAxMjIzID8gMjA0IDogeGhyLnN0YXR1cylcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzcG9uc2UgPSBmYWlsdXJlUmVzcG9uc2VcbiAgICAgICAgdmFyIGVyciA9IG51bGxcblxuICAgICAgICBpZiAoc3RhdHVzICE9PSAwKXtcbiAgICAgICAgICAgIHJlc3BvbnNlID0ge1xuICAgICAgICAgICAgICAgIGJvZHk6IGdldEJvZHkoKSxcbiAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiBzdGF0dXMsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge30sXG4gICAgICAgICAgICAgICAgdXJsOiB1cmksXG4gICAgICAgICAgICAgICAgcmF3UmVxdWVzdDogeGhyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZih4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKXsgLy9yZW1lbWJlciB4aHIgY2FuIGluIGZhY3QgYmUgWERSIGZvciBDT1JTIGluIElFXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UuaGVhZGVycyA9IHBhcnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnIgPSBuZXcgRXJyb3IoXCJJbnRlcm5hbCBYTUxIdHRwUmVxdWVzdCBFcnJvclwiKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIHJlc3BvbnNlLCByZXNwb25zZS5ib2R5KVxuICAgIH1cblxuICAgIHZhciB4aHIgPSBvcHRpb25zLnhociB8fCBudWxsXG5cbiAgICBpZiAoIXhocikge1xuICAgICAgICBpZiAob3B0aW9ucy5jb3JzIHx8IG9wdGlvbnMudXNlWERSKSB7XG4gICAgICAgICAgICB4aHIgPSBuZXcgY3JlYXRlWEhSLlhEb21haW5SZXF1ZXN0KClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB4aHIgPSBuZXcgY3JlYXRlWEhSLlhNTEh0dHBSZXF1ZXN0KClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBrZXlcbiAgICB2YXIgYWJvcnRlZFxuICAgIHZhciB1cmkgPSB4aHIudXJsID0gb3B0aW9ucy51cmkgfHwgb3B0aW9ucy51cmxcbiAgICB2YXIgbWV0aG9kID0geGhyLm1ldGhvZCA9IG9wdGlvbnMubWV0aG9kIHx8IFwiR0VUXCJcbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keSB8fCBvcHRpb25zLmRhdGFcbiAgICB2YXIgaGVhZGVycyA9IHhoci5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIHx8IHt9XG4gICAgdmFyIHN5bmMgPSAhIW9wdGlvbnMuc3luY1xuICAgIHZhciBpc0pzb24gPSBmYWxzZVxuICAgIHZhciB0aW1lb3V0VGltZXJcbiAgICB2YXIgZmFpbHVyZVJlc3BvbnNlID0ge1xuICAgICAgICBib2R5OiB1bmRlZmluZWQsXG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgICBzdGF0dXNDb2RlOiAwLFxuICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgdXJsOiB1cmksXG4gICAgICAgIHJhd1JlcXVlc3Q6IHhoclxuICAgIH1cblxuICAgIGlmIChcImpzb25cIiBpbiBvcHRpb25zICYmIG9wdGlvbnMuanNvbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgaXNKc29uID0gdHJ1ZVxuICAgICAgICBoZWFkZXJzW1wiYWNjZXB0XCJdIHx8IGhlYWRlcnNbXCJBY2NlcHRcIl0gfHwgKGhlYWRlcnNbXCJBY2NlcHRcIl0gPSBcImFwcGxpY2F0aW9uL2pzb25cIikgLy9Eb24ndCBvdmVycmlkZSBleGlzdGluZyBhY2NlcHQgaGVhZGVyIGRlY2xhcmVkIGJ5IHVzZXJcbiAgICAgICAgaWYgKG1ldGhvZCAhPT0gXCJHRVRcIiAmJiBtZXRob2QgIT09IFwiSEVBRFwiKSB7XG4gICAgICAgICAgICBoZWFkZXJzW1wiY29udGVudC10eXBlXCJdIHx8IGhlYWRlcnNbXCJDb250ZW50LVR5cGVcIl0gfHwgKGhlYWRlcnNbXCJDb250ZW50LVR5cGVcIl0gPSBcImFwcGxpY2F0aW9uL2pzb25cIikgLy9Eb24ndCBvdmVycmlkZSBleGlzdGluZyBhY2NlcHQgaGVhZGVyIGRlY2xhcmVkIGJ5IHVzZXJcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zLmpzb24gPT09IHRydWUgPyBib2R5IDogb3B0aW9ucy5qc29uKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IHJlYWR5c3RhdGVjaGFuZ2VcbiAgICB4aHIub25sb2FkID0gbG9hZEZ1bmNcbiAgICB4aHIub25lcnJvciA9IGVycm9yRnVuY1xuICAgIC8vIElFOSBtdXN0IGhhdmUgb25wcm9ncmVzcyBiZSBzZXQgdG8gYSB1bmlxdWUgZnVuY3Rpb24uXG4gICAgeGhyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIElFIG11c3QgZGllXG4gICAgfVxuICAgIHhoci5vbmFib3J0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgYWJvcnRlZCA9IHRydWU7XG4gICAgfVxuICAgIHhoci5vbnRpbWVvdXQgPSBlcnJvckZ1bmNcbiAgICB4aHIub3BlbihtZXRob2QsIHVyaSwgIXN5bmMsIG9wdGlvbnMudXNlcm5hbWUsIG9wdGlvbnMucGFzc3dvcmQpXG4gICAgLy9oYXMgdG8gYmUgYWZ0ZXIgb3BlblxuICAgIGlmKCFzeW5jKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSAhIW9wdGlvbnMud2l0aENyZWRlbnRpYWxzXG4gICAgfVxuICAgIC8vIENhbm5vdCBzZXQgdGltZW91dCB3aXRoIHN5bmMgcmVxdWVzdFxuICAgIC8vIG5vdCBzZXR0aW5nIHRpbWVvdXQgb24gdGhlIHhociBvYmplY3QsIGJlY2F1c2Ugb2Ygb2xkIHdlYmtpdHMgZXRjLiBub3QgaGFuZGxpbmcgdGhhdCBjb3JyZWN0bHlcbiAgICAvLyBib3RoIG5wbSdzIHJlcXVlc3QgYW5kIGpxdWVyeSAxLnggdXNlIHRoaXMga2luZCBvZiB0aW1lb3V0LCBzbyB0aGlzIGlzIGJlaW5nIGNvbnNpc3RlbnRcbiAgICBpZiAoIXN5bmMgJiYgb3B0aW9ucy50aW1lb3V0ID4gMCApIHtcbiAgICAgICAgdGltZW91dFRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKGFib3J0ZWQpIHJldHVyblxuICAgICAgICAgICAgYWJvcnRlZCA9IHRydWUvL0lFOSBtYXkgc3RpbGwgY2FsbCByZWFkeXN0YXRlY2hhbmdlXG4gICAgICAgICAgICB4aHIuYWJvcnQoXCJ0aW1lb3V0XCIpXG4gICAgICAgICAgICB2YXIgZSA9IG5ldyBFcnJvcihcIlhNTEh0dHBSZXF1ZXN0IHRpbWVvdXRcIilcbiAgICAgICAgICAgIGUuY29kZSA9IFwiRVRJTUVET1VUXCJcbiAgICAgICAgICAgIGVycm9yRnVuYyhlKVxuICAgICAgICB9LCBvcHRpb25zLnRpbWVvdXQgKVxuICAgIH1cblxuICAgIGlmICh4aHIuc2V0UmVxdWVzdEhlYWRlcikge1xuICAgICAgICBmb3Ioa2V5IGluIGhlYWRlcnMpe1xuICAgICAgICAgICAgaWYoaGVhZGVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKXtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihrZXksIGhlYWRlcnNba2V5XSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5oZWFkZXJzICYmICFpc0VtcHR5KG9wdGlvbnMuaGVhZGVycykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSGVhZGVycyBjYW5ub3QgYmUgc2V0IG9uIGFuIFhEb21haW5SZXF1ZXN0IG9iamVjdFwiKVxuICAgIH1cblxuICAgIGlmIChcInJlc3BvbnNlVHlwZVwiIGluIG9wdGlvbnMpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9IG9wdGlvbnMucmVzcG9uc2VUeXBlXG4gICAgfVxuXG4gICAgaWYgKFwiYmVmb3JlU2VuZFwiIGluIG9wdGlvbnMgJiZcbiAgICAgICAgdHlwZW9mIG9wdGlvbnMuYmVmb3JlU2VuZCA9PT0gXCJmdW5jdGlvblwiXG4gICAgKSB7XG4gICAgICAgIG9wdGlvbnMuYmVmb3JlU2VuZCh4aHIpXG4gICAgfVxuXG4gICAgLy8gTWljcm9zb2Z0IEVkZ2UgYnJvd3NlciBzZW5kcyBcInVuZGVmaW5lZFwiIHdoZW4gc2VuZCBpcyBjYWxsZWQgd2l0aCB1bmRlZmluZWQgdmFsdWUuXG4gICAgLy8gWE1MSHR0cFJlcXVlc3Qgc3BlYyBzYXlzIHRvIHBhc3MgbnVsbCBhcyBib2R5IHRvIGluZGljYXRlIG5vIGJvZHlcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL25hdWd0dXIveGhyL2lzc3Vlcy8xMDAuXG4gICAgeGhyLnNlbmQoYm9keSB8fCBudWxsKVxuXG4gICAgcmV0dXJuIHhoclxuXG5cbn1cblxuZnVuY3Rpb24gZ2V0WG1sKHhocikge1xuICAgIGlmICh4aHIucmVzcG9uc2VUeXBlID09PSBcImRvY3VtZW50XCIpIHtcbiAgICAgICAgcmV0dXJuIHhoci5yZXNwb25zZVhNTFxuICAgIH1cbiAgICB2YXIgZmlyZWZveEJ1Z1Rha2VuRWZmZWN0ID0geGhyLnN0YXR1cyA9PT0gMjA0ICYmIHhoci5yZXNwb25zZVhNTCAmJiB4aHIucmVzcG9uc2VYTUwuZG9jdW1lbnRFbGVtZW50Lm5vZGVOYW1lID09PSBcInBhcnNlcmVycm9yXCJcbiAgICBpZiAoeGhyLnJlc3BvbnNlVHlwZSA9PT0gXCJcIiAmJiAhZmlyZWZveEJ1Z1Rha2VuRWZmZWN0KSB7XG4gICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VYTUxcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBub29wKCkge31cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi94aHIvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDI3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgIG1vZHVsZS5leHBvcnRzID0gc2VsZjtcbn0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7fTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9nbG9iYWwvd2luZG93LmpzXG4vLyBtb2R1bGUgaWQgPSAyOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb25cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uIChmbikge1xuICB2YXIgc3RyaW5nID0gdG9TdHJpbmcuY2FsbChmbilcbiAgcmV0dXJuIHN0cmluZyA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJyB8fFxuICAgICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicgJiYgc3RyaW5nICE9PSAnW29iamVjdCBSZWdFeHBdJykgfHxcbiAgICAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgLy8gSUU4IGFuZCBiZWxvd1xuICAgICAoZm4gPT09IHdpbmRvdy5zZXRUaW1lb3V0IHx8XG4gICAgICBmbiA9PT0gd2luZG93LmFsZXJ0IHx8XG4gICAgICBmbiA9PT0gd2luZG93LmNvbmZpcm0gfHxcbiAgICAgIGZuID09PSB3aW5kb3cucHJvbXB0KSlcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vaXMtZnVuY3Rpb24vaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDI5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciB0cmltID0gcmVxdWlyZSgndHJpbScpXG4gICwgZm9yRWFjaCA9IHJlcXVpcmUoJ2Zvci1lYWNoJylcbiAgLCBpc0FycmF5ID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChoZWFkZXJzKSB7XG4gIGlmICghaGVhZGVycylcbiAgICByZXR1cm4ge31cblxuICB2YXIgcmVzdWx0ID0ge31cblxuICBmb3JFYWNoKFxuICAgICAgdHJpbShoZWFkZXJzKS5zcGxpdCgnXFxuJylcbiAgICAsIGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gcm93LmluZGV4T2YoJzonKVxuICAgICAgICAgICwga2V5ID0gdHJpbShyb3cuc2xpY2UoMCwgaW5kZXgpKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgLCB2YWx1ZSA9IHRyaW0ocm93LnNsaWNlKGluZGV4ICsgMSkpXG5cbiAgICAgICAgaWYgKHR5cGVvZihyZXN1bHRba2V5XSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZVxuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkocmVzdWx0W2tleV0pKSB7XG4gICAgICAgICAgcmVzdWx0W2tleV0ucHVzaCh2YWx1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRba2V5XSA9IFsgcmVzdWx0W2tleV0sIHZhbHVlIF1cbiAgICAgICAgfVxuICAgICAgfVxuICApXG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9wYXJzZS1oZWFkZXJzL3BhcnNlLWhlYWRlcnMuanNcbi8vIG1vZHVsZSBpZCA9IDMwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdHJpbTtcblxuZnVuY3Rpb24gdHJpbShzdHIpe1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqfFxccyokL2csICcnKTtcbn1cblxuZXhwb3J0cy5sZWZ0ID0gZnVuY3Rpb24oc3RyKXtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKTtcbn07XG5cbmV4cG9ydHMucmlnaHQgPSBmdW5jdGlvbihzdHIpe1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xccyokLywgJycpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi90cmltL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJ2lzLWZ1bmN0aW9uJylcblxubW9kdWxlLmV4cG9ydHMgPSBmb3JFYWNoXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHlcblxuZnVuY3Rpb24gZm9yRWFjaChsaXN0LCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmICghaXNGdW5jdGlvbihpdGVyYXRvcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaXRlcmF0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uJylcbiAgICB9XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgY29udGV4dCA9IHRoaXNcbiAgICB9XG4gICAgXG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobGlzdCkgPT09ICdbb2JqZWN0IEFycmF5XScpXG4gICAgICAgIGZvckVhY2hBcnJheShsaXN0LCBpdGVyYXRvciwgY29udGV4dClcbiAgICBlbHNlIGlmICh0eXBlb2YgbGlzdCA9PT0gJ3N0cmluZycpXG4gICAgICAgIGZvckVhY2hTdHJpbmcobGlzdCwgaXRlcmF0b3IsIGNvbnRleHQpXG4gICAgZWxzZVxuICAgICAgICBmb3JFYWNoT2JqZWN0KGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KVxufVxuXG5mdW5jdGlvbiBmb3JFYWNoQXJyYXkoYXJyYXksIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGFycmF5LCBpKSkge1xuICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBhcnJheVtpXSwgaSwgYXJyYXkpXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGZvckVhY2hTdHJpbmcoc3RyaW5nLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzdHJpbmcubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgLy8gbm8gc3VjaCB0aGluZyBhcyBhIHNwYXJzZSBzdHJpbmcuXG4gICAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgc3RyaW5nLmNoYXJBdChpKSwgaSwgc3RyaW5nKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZm9yRWFjaE9iamVjdChvYmplY3QsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgZm9yICh2YXIgayBpbiBvYmplY3QpIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrKSkge1xuICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmplY3Rba10sIGssIG9iamVjdClcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9mb3ItZWFjaC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMzJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUJNRm9udEFzY2lpKGRhdGEpIHtcbiAgaWYgKCFkYXRhKVxuICAgIHRocm93IG5ldyBFcnJvcignbm8gZGF0YSBwcm92aWRlZCcpXG4gIGRhdGEgPSBkYXRhLnRvU3RyaW5nKCkudHJpbSgpXG5cbiAgdmFyIG91dHB1dCA9IHtcbiAgICBwYWdlczogW10sXG4gICAgY2hhcnM6IFtdLFxuICAgIGtlcm5pbmdzOiBbXVxuICB9XG5cbiAgdmFyIGxpbmVzID0gZGF0YS5zcGxpdCgvXFxyXFxuP3xcXG4vZylcblxuICBpZiAobGluZXMubGVuZ3RoID09PSAwKVxuICAgIHRocm93IG5ldyBFcnJvcignbm8gZGF0YSBpbiBCTUZvbnQgZmlsZScpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBsaW5lRGF0YSA9IHNwbGl0TGluZShsaW5lc1tpXSwgaSlcbiAgICBpZiAoIWxpbmVEYXRhKSAvL3NraXAgZW1wdHkgbGluZXNcbiAgICAgIGNvbnRpbnVlXG5cbiAgICBpZiAobGluZURhdGEua2V5ID09PSAncGFnZScpIHtcbiAgICAgIGlmICh0eXBlb2YgbGluZURhdGEuZGF0YS5pZCAhPT0gJ251bWJlcicpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbWFsZm9ybWVkIGZpbGUgYXQgbGluZSAnICsgaSArICcgLS0gbmVlZHMgcGFnZSBpZD1OJylcbiAgICAgIGlmICh0eXBlb2YgbGluZURhdGEuZGF0YS5maWxlICE9PSAnc3RyaW5nJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdtYWxmb3JtZWQgZmlsZSBhdCBsaW5lICcgKyBpICsgJyAtLSBuZWVkcyBwYWdlIGZpbGU9XCJwYXRoXCInKVxuICAgICAgb3V0cHV0LnBhZ2VzW2xpbmVEYXRhLmRhdGEuaWRdID0gbGluZURhdGEuZGF0YS5maWxlXG4gICAgfSBlbHNlIGlmIChsaW5lRGF0YS5rZXkgPT09ICdjaGFycycgfHwgbGluZURhdGEua2V5ID09PSAna2VybmluZ3MnKSB7XG4gICAgICAvLy4uLiBkbyBub3RoaW5nIGZvciB0aGVzZSB0d28gLi4uXG4gICAgfSBlbHNlIGlmIChsaW5lRGF0YS5rZXkgPT09ICdjaGFyJykge1xuICAgICAgb3V0cHV0LmNoYXJzLnB1c2gobGluZURhdGEuZGF0YSlcbiAgICB9IGVsc2UgaWYgKGxpbmVEYXRhLmtleSA9PT0gJ2tlcm5pbmcnKSB7XG4gICAgICBvdXRwdXQua2VybmluZ3MucHVzaChsaW5lRGF0YS5kYXRhKVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXRbbGluZURhdGEua2V5XSA9IGxpbmVEYXRhLmRhdGFcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3V0cHV0XG59XG5cbmZ1bmN0aW9uIHNwbGl0TGluZShsaW5lLCBpZHgpIHtcbiAgbGluZSA9IGxpbmUucmVwbGFjZSgvXFx0Ky9nLCAnICcpLnRyaW0oKVxuICBpZiAoIWxpbmUpXG4gICAgcmV0dXJuIG51bGxcblxuICB2YXIgc3BhY2UgPSBsaW5lLmluZGV4T2YoJyAnKVxuICBpZiAoc3BhY2UgPT09IC0xKSBcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJubyBuYW1lZCByb3cgYXQgbGluZSBcIiArIGlkeClcblxuICB2YXIga2V5ID0gbGluZS5zdWJzdHJpbmcoMCwgc3BhY2UpXG5cbiAgbGluZSA9IGxpbmUuc3Vic3RyaW5nKHNwYWNlICsgMSlcbiAgLy9jbGVhciBcImxldHRlclwiIGZpZWxkIGFzIGl0IGlzIG5vbi1zdGFuZGFyZCBhbmRcbiAgLy9yZXF1aXJlcyBhZGRpdGlvbmFsIGNvbXBsZXhpdHkgdG8gcGFyc2UgXCIgLyA9IHN5bWJvbHNcbiAgbGluZSA9IGxpbmUucmVwbGFjZSgvbGV0dGVyPVtcXCdcXFwiXVxcUytbXFwnXFxcIl0vZ2ksICcnKSAgXG4gIGxpbmUgPSBsaW5lLnNwbGl0KFwiPVwiKVxuICBsaW5lID0gbGluZS5tYXAoZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIHN0ci50cmltKCkubWF0Y2goKC8oXCIuKj9cInxbXlwiXFxzXSspKyg/PVxccyp8XFxzKiQpL2cpKVxuICB9KVxuXG4gIHZhciBkYXRhID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGR0ID0gbGluZVtpXVxuICAgIGlmIChpID09PSAwKSB7XG4gICAgICBkYXRhLnB1c2goe1xuICAgICAgICBrZXk6IGR0WzBdLFxuICAgICAgICBkYXRhOiBcIlwiXG4gICAgICB9KVxuICAgIH0gZWxzZSBpZiAoaSA9PT0gbGluZS5sZW5ndGggLSAxKSB7XG4gICAgICBkYXRhW2RhdGEubGVuZ3RoIC0gMV0uZGF0YSA9IHBhcnNlRGF0YShkdFswXSlcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YVtkYXRhLmxlbmd0aCAtIDFdLmRhdGEgPSBwYXJzZURhdGEoZHRbMF0pXG4gICAgICBkYXRhLnB1c2goe1xuICAgICAgICBrZXk6IGR0WzFdLFxuICAgICAgICBkYXRhOiBcIlwiXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHZhciBvdXQgPSB7XG4gICAga2V5OiBrZXksXG4gICAgZGF0YToge31cbiAgfVxuXG4gIGRhdGEuZm9yRWFjaChmdW5jdGlvbih2KSB7XG4gICAgb3V0LmRhdGFbdi5rZXldID0gdi5kYXRhO1xuICB9KVxuXG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gcGFyc2VEYXRhKGRhdGEpIHtcbiAgaWYgKCFkYXRhIHx8IGRhdGEubGVuZ3RoID09PSAwKVxuICAgIHJldHVybiBcIlwiXG5cbiAgaWYgKGRhdGEuaW5kZXhPZignXCInKSA9PT0gMCB8fCBkYXRhLmluZGV4T2YoXCInXCIpID09PSAwKVxuICAgIHJldHVybiBkYXRhLnN1YnN0cmluZygxLCBkYXRhLmxlbmd0aCAtIDEpXG4gIGlmIChkYXRhLmluZGV4T2YoJywnKSAhPT0gLTEpXG4gICAgcmV0dXJuIHBhcnNlSW50TGlzdChkYXRhKVxuICByZXR1cm4gcGFyc2VJbnQoZGF0YSwgMTApXG59XG5cbmZ1bmN0aW9uIHBhcnNlSW50TGlzdChkYXRhKSB7XG4gIHJldHVybiBkYXRhLnNwbGl0KCcsJykubWFwKGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiBwYXJzZUludCh2YWwsIDEwKVxuICB9KVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9wYXJzZS1ibWZvbnQtYXNjaWkvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDMzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBwYXJzZUF0dHJpYnV0ZXMgPSByZXF1aXJlKCcuL3BhcnNlLWF0dHJpYnMnKVxudmFyIHBhcnNlRnJvbVN0cmluZyA9IHJlcXVpcmUoJ3htbC1wYXJzZS1mcm9tLXN0cmluZycpXG5cbi8vSW4gc29tZSBjYXNlcyBlbGVtZW50LmF0dHJpYnV0ZS5ub2RlTmFtZSBjYW4gcmV0dXJuXG4vL2FsbCBsb3dlcmNhc2UgdmFsdWVzLi4gc28gd2UgbmVlZCB0byBtYXAgdGhlbSB0byB0aGUgY29ycmVjdCBcbi8vY2FzZVxudmFyIE5BTUVfTUFQID0ge1xuICBzY2FsZWg6ICdzY2FsZUgnLFxuICBzY2FsZXc6ICdzY2FsZVcnLFxuICBzdHJldGNoaDogJ3N0cmV0Y2hIJyxcbiAgbGluZWhlaWdodDogJ2xpbmVIZWlnaHQnLFxuICBhbHBoYWNobmw6ICdhbHBoYUNobmwnLFxuICByZWRjaG5sOiAncmVkQ2hubCcsXG4gIGdyZWVuY2hubDogJ2dyZWVuQ2hubCcsXG4gIGJsdWVjaG5sOiAnYmx1ZUNobmwnXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2UoZGF0YSkge1xuICBkYXRhID0gZGF0YS50b1N0cmluZygpXG4gIFxuICB2YXIgeG1sUm9vdCA9IHBhcnNlRnJvbVN0cmluZyhkYXRhKVxuICB2YXIgb3V0cHV0ID0ge1xuICAgIHBhZ2VzOiBbXSxcbiAgICBjaGFyczogW10sXG4gICAga2VybmluZ3M6IFtdXG4gIH1cblxuICAvL2dldCBjb25maWcgc2V0dGluZ3NcbiAgO1snaW5mbycsICdjb21tb24nXS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIHZhciBlbGVtZW50ID0geG1sUm9vdC5nZXRFbGVtZW50c0J5VGFnTmFtZShrZXkpWzBdXG4gICAgaWYgKGVsZW1lbnQpXG4gICAgICBvdXRwdXRba2V5XSA9IHBhcnNlQXR0cmlidXRlcyhnZXRBdHRyaWJzKGVsZW1lbnQpKVxuICB9KVxuXG4gIC8vZ2V0IHBhZ2UgaW5mb1xuICB2YXIgcGFnZVJvb3QgPSB4bWxSb290LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwYWdlcycpWzBdXG4gIGlmICghcGFnZVJvb3QpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdtYWxmb3JtZWQgZmlsZSAtLSBubyA8cGFnZXM+IGVsZW1lbnQnKVxuICB2YXIgcGFnZXMgPSBwYWdlUm9vdC5nZXRFbGVtZW50c0J5VGFnTmFtZSgncGFnZScpXG4gIGZvciAodmFyIGk9MDsgaTxwYWdlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBwID0gcGFnZXNbaV1cbiAgICB2YXIgaWQgPSBwYXJzZUludChwLmdldEF0dHJpYnV0ZSgnaWQnKSwgMTApXG4gICAgdmFyIGZpbGUgPSBwLmdldEF0dHJpYnV0ZSgnZmlsZScpXG4gICAgaWYgKGlzTmFOKGlkKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWFsZm9ybWVkIGZpbGUgLS0gcGFnZSBcImlkXCIgYXR0cmlidXRlIGlzIE5hTicpXG4gICAgaWYgKCFmaWxlKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtYWxmb3JtZWQgZmlsZSAtLSBuZWVkcyBwYWdlIFwiZmlsZVwiIGF0dHJpYnV0ZScpXG4gICAgb3V0cHV0LnBhZ2VzW3BhcnNlSW50KGlkLCAxMCldID0gZmlsZVxuICB9XG5cbiAgLy9nZXQga2VybmluZ3MgLyBjaGFyc1xuICA7WydjaGFycycsICdrZXJuaW5ncyddLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIGVsZW1lbnQgPSB4bWxSb290LmdldEVsZW1lbnRzQnlUYWdOYW1lKGtleSlbMF1cbiAgICBpZiAoIWVsZW1lbnQpXG4gICAgICByZXR1cm5cbiAgICB2YXIgY2hpbGRUYWcgPSBrZXkuc3Vic3RyaW5nKDAsIGtleS5sZW5ndGgtMSlcbiAgICB2YXIgY2hpbGRyZW4gPSBlbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKGNoaWxkVGFnKVxuICAgIGZvciAodmFyIGk9MDsgaTxjaGlsZHJlbi5sZW5ndGg7IGkrKykgeyAgICAgIFxuICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICAgIG91dHB1dFtrZXldLnB1c2gocGFyc2VBdHRyaWJ1dGVzKGdldEF0dHJpYnMoY2hpbGQpKSlcbiAgICB9XG4gIH0pXG4gIHJldHVybiBvdXRwdXRcbn1cblxuZnVuY3Rpb24gZ2V0QXR0cmlicyhlbGVtZW50KSB7XG4gIHZhciBhdHRyaWJzID0gZ2V0QXR0cmliTGlzdChlbGVtZW50KVxuICByZXR1cm4gYXR0cmlicy5yZWR1Y2UoZnVuY3Rpb24oZGljdCwgYXR0cmliKSB7XG4gICAgdmFyIGtleSA9IG1hcE5hbWUoYXR0cmliLm5vZGVOYW1lKVxuICAgIGRpY3Rba2V5XSA9IGF0dHJpYi5ub2RlVmFsdWVcbiAgICByZXR1cm4gZGljdFxuICB9LCB7fSlcbn1cblxuZnVuY3Rpb24gZ2V0QXR0cmliTGlzdChlbGVtZW50KSB7XG4gIC8vSUU4KyBhbmQgbW9kZXJuIGJyb3dzZXJzXG4gIHZhciBhdHRyaWJzID0gW11cbiAgZm9yICh2YXIgaT0wOyBpPGVsZW1lbnQuYXR0cmlidXRlcy5sZW5ndGg7IGkrKylcbiAgICBhdHRyaWJzLnB1c2goZWxlbWVudC5hdHRyaWJ1dGVzW2ldKVxuICByZXR1cm4gYXR0cmlic1xufVxuXG5mdW5jdGlvbiBtYXBOYW1lKG5vZGVOYW1lKSB7XG4gIHJldHVybiBOQU1FX01BUFtub2RlTmFtZS50b0xvd2VyQ2FzZSgpXSB8fCBub2RlTmFtZVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9wYXJzZS1ibWZvbnQteG1sL2xpYi9icm93c2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAzNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvL1NvbWUgdmVyc2lvbnMgb2YgR2x5cGhEZXNpZ25lciBoYXZlIGEgdHlwb1xuLy90aGF0IGNhdXNlcyBzb21lIGJ1Z3Mgd2l0aCBwYXJzaW5nLiBcbi8vTmVlZCB0byBjb25maXJtIHdpdGggcmVjZW50IHZlcnNpb24gb2YgdGhlIHNvZnR3YXJlXG4vL3RvIHNlZSB3aGV0aGVyIHRoaXMgaXMgc3RpbGwgYW4gaXNzdWUgb3Igbm90LlxudmFyIEdMWVBIX0RFU0lHTkVSX0VSUk9SID0gJ2NoYXNyc2V0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlQXR0cmlidXRlcyhvYmopIHtcbiAgaWYgKEdMWVBIX0RFU0lHTkVSX0VSUk9SIGluIG9iaikge1xuICAgIG9ialsnY2hhcnNldCddID0gb2JqW0dMWVBIX0RFU0lHTkVSX0VSUk9SXVxuICAgIGRlbGV0ZSBvYmpbR0xZUEhfREVTSUdORVJfRVJST1JdXG4gIH1cblxuICBmb3IgKHZhciBrIGluIG9iaikge1xuICAgIGlmIChrID09PSAnZmFjZScgfHwgayA9PT0gJ2NoYXJzZXQnKSBcbiAgICAgIGNvbnRpbnVlXG4gICAgZWxzZSBpZiAoayA9PT0gJ3BhZGRpbmcnIHx8IGsgPT09ICdzcGFjaW5nJylcbiAgICAgIG9ialtrXSA9IHBhcnNlSW50TGlzdChvYmpba10pXG4gICAgZWxzZVxuICAgICAgb2JqW2tdID0gcGFyc2VJbnQob2JqW2tdLCAxMCkgXG4gIH1cbiAgcmV0dXJuIG9ialxufVxuXG5mdW5jdGlvbiBwYXJzZUludExpc3QoZGF0YSkge1xuICByZXR1cm4gZGF0YS5zcGxpdCgnLCcpLm1hcChmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQodmFsLCAxMClcbiAgfSlcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcGFyc2UtYm1mb250LXhtbC9saWIvcGFyc2UtYXR0cmlicy5qc1xuLy8gbW9kdWxlIGlkID0gMzVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24geG1scGFyc2VyKCkge1xuICAvL2NvbW1vbiBicm93c2Vyc1xuICBpZiAodHlwZW9mIHdpbmRvdy5ET01QYXJzZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cikge1xuICAgICAgdmFyIHBhcnNlciA9IG5ldyB3aW5kb3cuRE9NUGFyc2VyKClcbiAgICAgIHJldHVybiBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHN0ciwgJ2FwcGxpY2F0aW9uL3htbCcpXG4gICAgfVxuICB9IFxuXG4gIC8vSUU4IGZhbGxiYWNrXG4gIGlmICh0eXBlb2Ygd2luZG93LkFjdGl2ZVhPYmplY3QgIT09ICd1bmRlZmluZWQnXG4gICAgICAmJiBuZXcgd2luZG93LkFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxET00nKSkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHIpIHtcbiAgICAgIHZhciB4bWxEb2MgPSBuZXcgd2luZG93LkFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MRE9NXCIpXG4gICAgICB4bWxEb2MuYXN5bmMgPSBcImZhbHNlXCJcbiAgICAgIHhtbERvYy5sb2FkWE1MKHN0cilcbiAgICAgIHJldHVybiB4bWxEb2NcbiAgICB9XG4gIH1cblxuICAvL2xhc3QgcmVzb3J0IGZhbGxiYWNrXG4gIHJldHVybiBmdW5jdGlvbihzdHIpIHtcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBkaXYuaW5uZXJIVE1MID0gc3RyXG4gICAgcmV0dXJuIGRpdlxuICB9XG59KSgpXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3htbC1wYXJzZS1mcm9tLXN0cmluZy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMzZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIEhFQURFUiA9IFs2NiwgNzcsIDcwXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJlYWRCTUZvbnRCaW5hcnkoYnVmKSB7XG4gIGlmIChidWYubGVuZ3RoIDwgNilcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYnVmZmVyIGxlbmd0aCBmb3IgQk1Gb250JylcblxuICB2YXIgaGVhZGVyID0gSEVBREVSLmV2ZXJ5KGZ1bmN0aW9uKGJ5dGUsIGkpIHtcbiAgICByZXR1cm4gYnVmLnJlYWRVSW50OChpKSA9PT0gYnl0ZVxuICB9KVxuXG4gIGlmICghaGVhZGVyKVxuICAgIHRocm93IG5ldyBFcnJvcignQk1Gb250IG1pc3NpbmcgQk1GIGJ5dGUgaGVhZGVyJylcblxuICB2YXIgaSA9IDNcbiAgdmFyIHZlcnMgPSBidWYucmVhZFVJbnQ4KGkrKylcbiAgaWYgKHZlcnMgPiAzKVxuICAgIHRocm93IG5ldyBFcnJvcignT25seSBzdXBwb3J0cyBCTUZvbnQgQmluYXJ5IHYzIChCTUZvbnQgQXBwIHYxLjEwKScpXG4gIFxuICB2YXIgdGFyZ2V0ID0geyBrZXJuaW5nczogW10sIGNoYXJzOiBbXSB9XG4gIGZvciAodmFyIGI9MDsgYjw1OyBiKyspXG4gICAgaSArPSByZWFkQmxvY2sodGFyZ2V0LCBidWYsIGkpXG4gIHJldHVybiB0YXJnZXRcbn1cblxuZnVuY3Rpb24gcmVhZEJsb2NrKHRhcmdldCwgYnVmLCBpKSB7XG4gIGlmIChpID4gYnVmLmxlbmd0aC0xKVxuICAgIHJldHVybiAwXG5cbiAgdmFyIGJsb2NrSUQgPSBidWYucmVhZFVJbnQ4KGkrKylcbiAgdmFyIGJsb2NrU2l6ZSA9IGJ1Zi5yZWFkSW50MzJMRShpKVxuICBpICs9IDRcblxuICBzd2l0Y2goYmxvY2tJRCkge1xuICAgIGNhc2UgMTogXG4gICAgICB0YXJnZXQuaW5mbyA9IHJlYWRJbmZvKGJ1ZiwgaSlcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAyOlxuICAgICAgdGFyZ2V0LmNvbW1vbiA9IHJlYWRDb21tb24oYnVmLCBpKVxuICAgICAgYnJlYWtcbiAgICBjYXNlIDM6XG4gICAgICB0YXJnZXQucGFnZXMgPSByZWFkUGFnZXMoYnVmLCBpLCBibG9ja1NpemUpXG4gICAgICBicmVha1xuICAgIGNhc2UgNDpcbiAgICAgIHRhcmdldC5jaGFycyA9IHJlYWRDaGFycyhidWYsIGksIGJsb2NrU2l6ZSlcbiAgICAgIGJyZWFrXG4gICAgY2FzZSA1OlxuICAgICAgdGFyZ2V0Lmtlcm5pbmdzID0gcmVhZEtlcm5pbmdzKGJ1ZiwgaSwgYmxvY2tTaXplKVxuICAgICAgYnJlYWtcbiAgfVxuICByZXR1cm4gNSArIGJsb2NrU2l6ZVxufVxuXG5mdW5jdGlvbiByZWFkSW5mbyhidWYsIGkpIHtcbiAgdmFyIGluZm8gPSB7fVxuICBpbmZvLnNpemUgPSBidWYucmVhZEludDE2TEUoaSlcblxuICB2YXIgYml0RmllbGQgPSBidWYucmVhZFVJbnQ4KGkrMilcbiAgaW5mby5zbW9vdGggPSAoYml0RmllbGQgPj4gNykgJiAxXG4gIGluZm8udW5pY29kZSA9IChiaXRGaWVsZCA+PiA2KSAmIDFcbiAgaW5mby5pdGFsaWMgPSAoYml0RmllbGQgPj4gNSkgJiAxXG4gIGluZm8uYm9sZCA9IChiaXRGaWVsZCA+PiA0KSAmIDFcbiAgXG4gIC8vZml4ZWRIZWlnaHQgaXMgb25seSBtZW50aW9uZWQgaW4gYmluYXJ5IHNwZWMgXG4gIGlmICgoYml0RmllbGQgPj4gMykgJiAxKVxuICAgIGluZm8uZml4ZWRIZWlnaHQgPSAxXG4gIFxuICBpbmZvLmNoYXJzZXQgPSBidWYucmVhZFVJbnQ4KGkrMykgfHwgJydcbiAgaW5mby5zdHJldGNoSCA9IGJ1Zi5yZWFkVUludDE2TEUoaSs0KVxuICBpbmZvLmFhID0gYnVmLnJlYWRVSW50OChpKzYpXG4gIGluZm8ucGFkZGluZyA9IFtcbiAgICBidWYucmVhZEludDgoaSs3KSxcbiAgICBidWYucmVhZEludDgoaSs4KSxcbiAgICBidWYucmVhZEludDgoaSs5KSxcbiAgICBidWYucmVhZEludDgoaSsxMClcbiAgXVxuICBpbmZvLnNwYWNpbmcgPSBbXG4gICAgYnVmLnJlYWRJbnQ4KGkrMTEpLFxuICAgIGJ1Zi5yZWFkSW50OChpKzEyKVxuICBdXG4gIGluZm8ub3V0bGluZSA9IGJ1Zi5yZWFkVUludDgoaSsxMylcbiAgaW5mby5mYWNlID0gcmVhZFN0cmluZ05UKGJ1ZiwgaSsxNClcbiAgcmV0dXJuIGluZm9cbn1cblxuZnVuY3Rpb24gcmVhZENvbW1vbihidWYsIGkpIHtcbiAgdmFyIGNvbW1vbiA9IHt9XG4gIGNvbW1vbi5saW5lSGVpZ2h0ID0gYnVmLnJlYWRVSW50MTZMRShpKVxuICBjb21tb24uYmFzZSA9IGJ1Zi5yZWFkVUludDE2TEUoaSsyKVxuICBjb21tb24uc2NhbGVXID0gYnVmLnJlYWRVSW50MTZMRShpKzQpXG4gIGNvbW1vbi5zY2FsZUggPSBidWYucmVhZFVJbnQxNkxFKGkrNilcbiAgY29tbW9uLnBhZ2VzID0gYnVmLnJlYWRVSW50MTZMRShpKzgpXG4gIHZhciBiaXRGaWVsZCA9IGJ1Zi5yZWFkVUludDgoaSsxMClcbiAgY29tbW9uLnBhY2tlZCA9IDBcbiAgY29tbW9uLmFscGhhQ2hubCA9IGJ1Zi5yZWFkVUludDgoaSsxMSlcbiAgY29tbW9uLnJlZENobmwgPSBidWYucmVhZFVJbnQ4KGkrMTIpXG4gIGNvbW1vbi5ncmVlbkNobmwgPSBidWYucmVhZFVJbnQ4KGkrMTMpXG4gIGNvbW1vbi5ibHVlQ2hubCA9IGJ1Zi5yZWFkVUludDgoaSsxNClcbiAgcmV0dXJuIGNvbW1vblxufVxuXG5mdW5jdGlvbiByZWFkUGFnZXMoYnVmLCBpLCBzaXplKSB7XG4gIHZhciBwYWdlcyA9IFtdXG4gIHZhciB0ZXh0ID0gcmVhZE5hbWVOVChidWYsIGkpXG4gIHZhciBsZW4gPSB0ZXh0Lmxlbmd0aCsxXG4gIHZhciBjb3VudCA9IHNpemUgLyBsZW5cbiAgZm9yICh2YXIgYz0wOyBjPGNvdW50OyBjKyspIHtcbiAgICBwYWdlc1tjXSA9IGJ1Zi5zbGljZShpLCBpK3RleHQubGVuZ3RoKS50b1N0cmluZygndXRmOCcpXG4gICAgaSArPSBsZW5cbiAgfVxuICByZXR1cm4gcGFnZXNcbn1cblxuZnVuY3Rpb24gcmVhZENoYXJzKGJ1ZiwgaSwgYmxvY2tTaXplKSB7XG4gIHZhciBjaGFycyA9IFtdXG5cbiAgdmFyIGNvdW50ID0gYmxvY2tTaXplIC8gMjBcbiAgZm9yICh2YXIgYz0wOyBjPGNvdW50OyBjKyspIHtcbiAgICB2YXIgY2hhciA9IHt9XG4gICAgdmFyIG9mZiA9IGMqMjBcbiAgICBjaGFyLmlkID0gYnVmLnJlYWRVSW50MzJMRShpICsgMCArIG9mZilcbiAgICBjaGFyLnggPSBidWYucmVhZFVJbnQxNkxFKGkgKyA0ICsgb2ZmKVxuICAgIGNoYXIueSA9IGJ1Zi5yZWFkVUludDE2TEUoaSArIDYgKyBvZmYpXG4gICAgY2hhci53aWR0aCA9IGJ1Zi5yZWFkVUludDE2TEUoaSArIDggKyBvZmYpXG4gICAgY2hhci5oZWlnaHQgPSBidWYucmVhZFVJbnQxNkxFKGkgKyAxMCArIG9mZilcbiAgICBjaGFyLnhvZmZzZXQgPSBidWYucmVhZEludDE2TEUoaSArIDEyICsgb2ZmKVxuICAgIGNoYXIueW9mZnNldCA9IGJ1Zi5yZWFkSW50MTZMRShpICsgMTQgKyBvZmYpXG4gICAgY2hhci54YWR2YW5jZSA9IGJ1Zi5yZWFkSW50MTZMRShpICsgMTYgKyBvZmYpXG4gICAgY2hhci5wYWdlID0gYnVmLnJlYWRVSW50OChpICsgMTggKyBvZmYpXG4gICAgY2hhci5jaG5sID0gYnVmLnJlYWRVSW50OChpICsgMTkgKyBvZmYpXG4gICAgY2hhcnNbY10gPSBjaGFyXG4gIH1cbiAgcmV0dXJuIGNoYXJzXG59XG5cbmZ1bmN0aW9uIHJlYWRLZXJuaW5ncyhidWYsIGksIGJsb2NrU2l6ZSkge1xuICB2YXIga2VybmluZ3MgPSBbXVxuICB2YXIgY291bnQgPSBibG9ja1NpemUgLyAxMFxuICBmb3IgKHZhciBjPTA7IGM8Y291bnQ7IGMrKykge1xuICAgIHZhciBrZXJuID0ge31cbiAgICB2YXIgb2ZmID0gYyoxMFxuICAgIGtlcm4uZmlyc3QgPSBidWYucmVhZFVJbnQzMkxFKGkgKyAwICsgb2ZmKVxuICAgIGtlcm4uc2Vjb25kID0gYnVmLnJlYWRVSW50MzJMRShpICsgNCArIG9mZilcbiAgICBrZXJuLmFtb3VudCA9IGJ1Zi5yZWFkSW50MTZMRShpICsgOCArIG9mZilcbiAgICBrZXJuaW5nc1tjXSA9IGtlcm5cbiAgfVxuICByZXR1cm4ga2VybmluZ3Ncbn1cblxuZnVuY3Rpb24gcmVhZE5hbWVOVChidWYsIG9mZnNldCkge1xuICB2YXIgcG9zPW9mZnNldFxuICBmb3IgKDsgcG9zPGJ1Zi5sZW5ndGg7IHBvcysrKSB7XG4gICAgaWYgKGJ1Zltwb3NdID09PSAweDAwKSBcbiAgICAgIGJyZWFrXG4gIH1cbiAgcmV0dXJuIGJ1Zi5zbGljZShvZmZzZXQsIHBvcylcbn1cblxuZnVuY3Rpb24gcmVhZFN0cmluZ05UKGJ1Ziwgb2Zmc2V0KSB7XG4gIHJldHVybiByZWFkTmFtZU5UKGJ1Ziwgb2Zmc2V0KS50b1N0cmluZygndXRmOCcpXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3BhcnNlLWJtZm9udC1iaW5hcnkvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDM3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBlcXVhbCA9IHJlcXVpcmUoJ2J1ZmZlci1lcXVhbCcpXG52YXIgSEVBREVSID0gbmV3IEJ1ZmZlcihbNjYsIDc3LCA3MCwgM10pXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYnVmKSB7XG4gIGlmICh0eXBlb2YgYnVmID09PSAnc3RyaW5nJylcbiAgICByZXR1cm4gYnVmLnN1YnN0cmluZygwLCAzKSA9PT0gJ0JNRidcbiAgcmV0dXJuIGJ1Zi5sZW5ndGggPiA0ICYmIGVxdWFsKGJ1Zi5zbGljZSgwLCA0KSwgSEVBREVSKVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2FkLWJtZm9udC9saWIvaXMtYmluYXJ5LmpzXG4vLyBtb2R1bGUgaWQgPSAzOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyOyAvLyBmb3IgdXNlIHdpdGggYnJvd3NlcmlmeVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYikpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgaWYgKHR5cGVvZiBhLmVxdWFscyA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGEuZXF1YWxzKGIpO1xuICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICBcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFbaV0gIT09IGJbaV0pIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2J1ZmZlci1lcXVhbC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMzlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGFzc2lnbiA9IHJlcXVpcmUoJ29iamVjdC1hc3NpZ24nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVTREZTaGFkZXIgKG9wdCkge1xyXG4gIG9wdCA9IG9wdCB8fCB7fVxyXG4gIHZhciBvcGFjaXR5ID0gdHlwZW9mIG9wdC5vcGFjaXR5ID09PSAnbnVtYmVyJyA/IG9wdC5vcGFjaXR5IDogMVxyXG4gIHZhciBhbHBoYVRlc3QgPSB0eXBlb2Ygb3B0LmFscGhhVGVzdCA9PT0gJ251bWJlcicgPyBvcHQuYWxwaGFUZXN0IDogMC4wMDAxXHJcbiAgdmFyIHByZWNpc2lvbiA9IG9wdC5wcmVjaXNpb24gfHwgJ2hpZ2hwJ1xyXG4gIHZhciBjb2xvciA9IG9wdC5jb2xvclxyXG4gIHZhciBtYXAgPSBvcHQubWFwXHJcblxyXG4gIC8vIHJlbW92ZSB0byBzYXRpc2Z5IHI3M1xyXG4gIGRlbGV0ZSBvcHQubWFwXHJcbiAgZGVsZXRlIG9wdC5jb2xvclxyXG4gIGRlbGV0ZSBvcHQucHJlY2lzaW9uXHJcbiAgZGVsZXRlIG9wdC5vcGFjaXR5XHJcblxyXG4gIHJldHVybiBhc3NpZ24oe1xyXG4gICAgdW5pZm9ybXM6IHtcclxuICAgICAgb3BhY2l0eTogeyB0eXBlOiAnZicsIHZhbHVlOiBvcGFjaXR5IH0sXHJcbiAgICAgIG1hcDogeyB0eXBlOiAndCcsIHZhbHVlOiBtYXAgfHwgbmV3IFRIUkVFLlRleHR1cmUoKSB9LFxyXG4gICAgICBjb2xvcjogeyB0eXBlOiAnYycsIHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoY29sb3IpIH1cclxuICAgIH0sXHJcbiAgICB2ZXJ0ZXhTaGFkZXI6IFtcclxuICAgICAgJ2F0dHJpYnV0ZSB2ZWMyIHV2OycsXHJcbiAgICAgICdhdHRyaWJ1dGUgdmVjNCBwb3NpdGlvbjsnLFxyXG4gICAgICAndW5pZm9ybSBtYXQ0IHByb2plY3Rpb25NYXRyaXg7JyxcclxuICAgICAgJ3VuaWZvcm0gbWF0NCBtb2RlbFZpZXdNYXRyaXg7JyxcclxuICAgICAgJ3ZhcnlpbmcgdmVjMiB2VXY7JyxcclxuICAgICAgJ3ZvaWQgbWFpbigpIHsnLFxyXG4gICAgICAndlV2ID0gdXY7JyxcclxuICAgICAgJ2dsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHBvc2l0aW9uOycsXHJcbiAgICAgICd9J1xyXG4gICAgXS5qb2luKCdcXG4nKSxcclxuICAgIGZyYWdtZW50U2hhZGVyOiBbXHJcbiAgICAgICcjaWZkZWYgR0xfT0VTX3N0YW5kYXJkX2Rlcml2YXRpdmVzJyxcclxuICAgICAgJyNleHRlbnNpb24gR0xfT0VTX3N0YW5kYXJkX2Rlcml2YXRpdmVzIDogZW5hYmxlJyxcclxuICAgICAgJyNlbmRpZicsXHJcbiAgICAgICdwcmVjaXNpb24gJyArIHByZWNpc2lvbiArICcgZmxvYXQ7JyxcclxuICAgICAgJ3VuaWZvcm0gZmxvYXQgb3BhY2l0eTsnLFxyXG4gICAgICAndW5pZm9ybSB2ZWMzIGNvbG9yOycsXHJcbiAgICAgICd1bmlmb3JtIHNhbXBsZXIyRCBtYXA7JyxcclxuICAgICAgJ3ZhcnlpbmcgdmVjMiB2VXY7JyxcclxuXHJcbiAgICAgICdmbG9hdCBhYXN0ZXAoZmxvYXQgdmFsdWUpIHsnLFxyXG4gICAgICAnICAjaWZkZWYgR0xfT0VTX3N0YW5kYXJkX2Rlcml2YXRpdmVzJyxcclxuICAgICAgJyAgICBmbG9hdCBhZndpZHRoID0gbGVuZ3RoKHZlYzIoZEZkeCh2YWx1ZSksIGRGZHkodmFsdWUpKSkgKiAwLjcwNzEwNjc4MTE4NjU0NzU3OycsXHJcbiAgICAgICcgICNlbHNlJyxcclxuICAgICAgJyAgICBmbG9hdCBhZndpZHRoID0gKDEuMCAvIDMyLjApICogKDEuNDE0MjEzNTYyMzczMDk1MSAvICgyLjAgKiBnbF9GcmFnQ29vcmQudykpOycsXHJcbiAgICAgICcgICNlbmRpZicsXHJcbiAgICAgICcgIHJldHVybiBzbW9vdGhzdGVwKDAuNSAtIGFmd2lkdGgsIDAuNSArIGFmd2lkdGgsIHZhbHVlKTsnLFxyXG4gICAgICAnfScsXHJcblxyXG4gICAgICAndm9pZCBtYWluKCkgeycsXHJcbiAgICAgICcgIHZlYzQgdGV4Q29sb3IgPSB0ZXh0dXJlMkQobWFwLCB2VXYpOycsXHJcbiAgICAgICcgIGZsb2F0IGFscGhhID0gYWFzdGVwKHRleENvbG9yLmEpOycsXHJcbiAgICAgICcgIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IsIG9wYWNpdHkgKiBhbHBoYSk7JyxcclxuICAgICAgYWxwaGFUZXN0ID09PSAwXHJcbiAgICAgICAgPyAnJ1xyXG4gICAgICAgIDogJyAgaWYgKGdsX0ZyYWdDb2xvci5hIDwgJyArIGFscGhhVGVzdCArICcpIGRpc2NhcmQ7JyxcclxuICAgICAgJ30nXHJcbiAgICBdLmpvaW4oJ1xcbicpXHJcbiAgfSwgb3B0KVxyXG59XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hZnJhbWUtYm1mb250LXRleHQtY29tcG9uZW50L2xpYi9zaGFkZXJzL3NkZi5qc1xuLy8gbW9kdWxlIGlkID0gNDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyogZ2xvYmFsIEFGUkFNRSAqL1xyXG5cclxuLyogRXhwZXJpbWVudGFsIHRleHQgcHJpbWl0aXZlLlxyXG4gKiBJc3N1ZXM6IGNvbG9yIG5vdCBjaGFuZ2luZywgcmVtb3ZlQXR0cmlidXRlKCkgbm90IHdvcmtpbmcsIG1peGluZyBwcmltaXRpdmUgd2l0aCByZWd1bGFyIGVudGl0aWVzIGZhaWxzXHJcbiAqIENvbG9yIGlzc3VlIHJlbGF0ZXMgdG86IGh0dHBzOi8vZ2l0aHViLmNvbS9kb25tY2N1cmR5L2FmcmFtZS1leHRyYXMvYmxvYi9tYXN0ZXIvc3JjL3ByaW1pdGl2ZXMvYS1vY2Vhbi5qcyNMNDRcclxuICovXHJcblxyXG52YXIgZXh0ZW5kRGVlcCA9IEFGUkFNRS51dGlscy5leHRlbmREZWVwO1xyXG52YXIgbWVzaE1peGluID0gQUZSQU1FLnByaW1pdGl2ZXMuZ2V0TWVzaE1peGluKCk7XHJcblxyXG5BRlJBTUUucmVnaXN0ZXJQcmltaXRpdmUoJ2EtdGV4dCcsIGV4dGVuZERlZXAoe30sIG1lc2hNaXhpbiwge1xyXG4gIGRlZmF1bHRDb21wb25lbnRzOiB7XHJcbiAgICAnYm1mb250LXRleHQnOiB7fVxyXG4gIH0sXHJcbiAgbWFwcGluZ3M6IHtcclxuICAgIHRleHQ6ICdibWZvbnQtdGV4dC50ZXh0JyxcclxuICAgIHdpZHRoOiAnYm1mb250LXRleHQud2lkdGgnLFxyXG4gICAgYWxpZ246ICdibWZvbnQtdGV4dC5hbGlnbicsXHJcbiAgICBsZXR0ZXJTcGFjaW5nOiAnYm1mb250LXRleHQubGV0dGVyU3BhY2luZycsXHJcbiAgICBsaW5lSGVpZ2h0OiAnYm1mb250LXRleHQubGluZUhlaWdodCcsXHJcbiAgICBmbnQ6ICdibWZvbnQtdGV4dC5mbnQnLFxyXG4gICAgZm50SW1hZ2U6ICdibWZvbnQtdGV4dC5mbnRJbWFnZScsXHJcbiAgICBtb2RlOiAnYm1mb250LXRleHQubW9kZScsXHJcbiAgICBjb2xvcjogJ2JtZm9udC10ZXh0LmNvbG9yJyxcclxuICAgIG9wYWNpdHk6ICdibWZvbnQtdGV4dC5vcGFjaXR5J1xyXG4gIH1cclxufSkpO1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYWZyYW1lLWJtZm9udC10ZXh0LWNvbXBvbmVudC9leHRyYXMvdGV4dC1wcmltaXRpdmUuanNcbi8vIG1vZHVsZSBpZCA9IDQxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qIGFmcmFtZS1zZWxlY3QtYmFyIGNvbXBvbmVudCAtLSBhdHRlbXB0IHRvIHB1bGwgb3V0IHNlbGVjdCBiYXIgY29kZSBmcm9tIGNpdHkgYnVpbGRlciBsb2dpYyAqL1xyXG5cclxuLyogZm9yIHRlc3RpbmcgaW4gY29uc29sZTpcclxubWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZW51XCIpO1xyXG5tZW51RWwuZW1pdChcIm9uT3B0aW9uTmV4dFwiKTtcclxubWVudUVsLmVtaXQoXCJvbk9wdGlvblByZXZpb3VzXCIpO1xyXG4qL1xyXG5cclxuLy8gTk9URVM6XHJcbi8vIGF0IGxlYXN0IG9uZSBvcHRncm91cCByZXF1aXJlZCwgYXQgbGVhc3kgNyBvcHRpb25zIHJlcXVpcmVkIHBlciBvcHRncm91cFxyXG4vLyA1IG9yIDYgb3B0aW9ucyBwZXIgb3B0Z3JvdXAgbWF5IHdvcmssIG5lZWRzIHRlc3RpbmdcclxuLy8gNCBhbmQgYmVsb3cgc2hvdWxkIGJlIG5vIHNjcm9sbFxyXG5cclxuXHJcbmlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xyXG4gIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGF0dGVtcHRlZCB0byByZWdpc3RlciBiZWZvcmUgQUZSQU1FIHdhcyBhdmFpbGFibGUuJyk7XHJcbn1cclxuXHJcbi8vIEhFTFBFUiBGVU5DVElPTlNcclxuLy8gZmluZCBhbiBlbGVtZW50J3Mgb3JpZ2luYWwgaW5kZXggcG9zaXRpb24gaW4gYW4gYXJyYXkgYnkgc2VhcmNoaW5nIG9uIGFuIGVsZW1lbnQncyB2YWx1ZSBpbiB0aGUgYXJyYXlcclxuZnVuY3Rpb24gZmluZFdpdGhBdHRyKGFycmF5LCBhdHRyLCB2YWx1ZSkgeyAgLy8gZmluZCBhXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgaWYoYXJyYXlbaV1bYXR0cl0gPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAtMTtcclxufVxyXG5cclxuLy8gZm9yIGEgZ2l2ZW4gYXJyYXksIGZpbmQgdGhlIGxhcmdlc3QgdmFsdWUgYW5kIHJldHVybiB0aGUgdmFsdWUgb2YgdGhlIGluZGV4IHRoZXJlb2YgKDAtYmFzZWQgaW5kZXgpXHJcbmZ1bmN0aW9uIGluZGV4T2ZNYXgoYXJyKSB7XHJcbiAgICBpZiAoYXJyLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuICAgIHZhciBtYXggPSBhcnJbMF07XHJcbiAgICB2YXIgbWF4SW5kZXggPSAwO1xyXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoYXJyW2ldID4gbWF4KSB7XHJcbiAgICAgICAgICAgIG1heEluZGV4ID0gaTtcclxuICAgICAgICAgICAgbWF4ID0gYXJyW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBtYXhJbmRleDtcclxufVxyXG5cclxuLy8gcHJvdmlkZSBhIHZhbGlkIEluZGV4IGZvciBhbiBBcnJheSBpZiB0aGUgZGVzaXJlZEluZGV4IGlzIGdyZWF0ZXIgb3IgbGVzcyB0aGFuIGFuIGFycmF5J3MgbGVuZ3RoIGJ5IFwibG9vcGluZ1wiIGFyb3VuZFxyXG5mdW5jdGlvbiBsb29wSW5kZXgoZGVzaXJlZEluZGV4LCBhcnJheUxlbmd0aCkgeyAgIC8vIGV4cGVjdHMgYSAwIGJhc2VkIGluZGV4XHJcbiAgaWYgKGRlc2lyZWRJbmRleCA+IChhcnJheUxlbmd0aCAtIDEpKSB7XHJcbiAgICByZXR1cm4gZGVzaXJlZEluZGV4IC0gYXJyYXlMZW5ndGg7XHJcbiAgfVxyXG4gIGlmIChkZXNpcmVkSW5kZXggPCAwKSB7XHJcbiAgICByZXR1cm4gYXJyYXlMZW5ndGggKyBkZXNpcmVkSW5kZXg7XHJcbiAgfVxyXG4gIHJldHVybiBkZXNpcmVkSW5kZXg7XHJcbn1cclxuLy8gR2hldHRvIHRlc3Rpbmcgb2YgbG9vcEluZGV4IGhlbHBlciBmdW5jdGlvblxyXG5mdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uLCBtZXNzYWdlKSB7XHJcbi8vICAgIGNvbnNvbGUubG9nKGNvbmRpdGlvbi5zdHJpbmdpZnkpO1xyXG4gICAgaWYgKCFjb25kaXRpb24pIHtcclxuICAgICAgICBtZXNzYWdlID0gbWVzc2FnZSB8fCBcIkFzc2VydGlvbiBmYWlsZWRcIjtcclxuICAgICAgICBpZiAodHlwZW9mIEVycm9yICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhyb3cgbWVzc2FnZTsgLy8gRmFsbGJhY2tcclxuICAgIH1cclxufVxyXG52YXIgdGVzdExvb3BBcnJheSA9IFswLDEsMiwzLDQsNSw2LDcsOCw5XTtcclxuYXNzZXJ0KGxvb3BJbmRleCg5LCB0ZXN0TG9vcEFycmF5Lmxlbmd0aCkgPT0gOSk7XHJcbmFzc2VydChsb29wSW5kZXgoMTAsIHRlc3RMb29wQXJyYXkubGVuZ3RoKSA9PSAwKTtcclxuYXNzZXJ0KGxvb3BJbmRleCgxMSwgdGVzdExvb3BBcnJheS5sZW5ndGgpID09IDEpO1xyXG5hc3NlcnQobG9vcEluZGV4KDAsIHRlc3RMb29wQXJyYXkubGVuZ3RoKSA9PSAwKTtcclxuYXNzZXJ0KGxvb3BJbmRleCgtMSwgdGVzdExvb3BBcnJheS5sZW5ndGgpID09IDkpO1xyXG5hc3NlcnQobG9vcEluZGV4KC0yLCB0ZXN0TG9vcEFycmF5Lmxlbmd0aCkgPT0gOCk7XHJcblxyXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3NlbGVjdC1iYXInLCB7XHJcbiAgc2NoZW1hOiB7XHJcbiAgICBjb250cm9sczoge3R5cGU6ICdib29sZWFuJywgZGVmYXVsdDogdHJ1ZX0sXHJcbiAgICBjb250cm9sbGVySUQ6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDogJ3JpZ2h0Q29udHJvbGxlcid9LFxyXG4gICAgc2VsZWN0ZWRPcHRncm91cFZhbHVlOiB7dHlwZTogJ3N0cmluZyd9LCAgICAgICAgICAgIC8vIG5vdCBpbnRlbmRlZCB0byBiZSBzZXQgd2hlbiBkZWZpbmluZyBjb21wb25lbnQsIHVzZWQgZm9yIHRyYWNraW5nIHN0YXRlXHJcbiAgICBzZWxlY3RlZE9wdGdyb3VwSW5kZXg6IHt0eXBlOiAnaW50JywgZGVmYXVsdDogMH0sICAgLy8gbm90IGludGVuZGVkIHRvIGJlIHNldCB3aGVuIGRlZmluaW5nIGNvbXBvbmVudCwgdXNlZCBmb3IgdHJhY2tpbmcgc3RhdGVcclxuICAgIHNlbGVjdGVkT3B0aW9uVmFsdWU6IHt0eXBlOiAnc3RyaW5nJ30sICAgICAgICAgICAgICAvLyBub3QgaW50ZW5kZWQgdG8gYmUgc2V0IHdoZW4gZGVmaW5pbmcgY29tcG9uZW50LCB1c2VkIGZvciB0cmFja2luZyBzdGF0ZVxyXG4gICAgc2VsZWN0ZWRPcHRpb25JbmRleDoge3R5cGU6ICdpbnQnLCBkZWZhdWx0OiAwfSAgICAgIC8vIG5vdCBpbnRlbmRlZCB0byBiZSBzZXQgd2hlbiBkZWZpbmluZyBjb21wb25lbnQsIHVzZWQgZm9yIHRyYWNraW5nIHN0YXRlXHJcbiAgfSxcclxuXHJcbiAgLy8gZm9yIGEgZ2l2ZW4gb3B0Z3JvdXAsIG1ha2UgdGhlIGNoaWxkcmVuc1xyXG4gIG1ha2VTZWxlY3RPcHRpb25zUm93OiBmdW5jdGlvbihzZWxlY3RlZE9wdGdyb3VwRWwsIHBhcmVudEVsLCBpbmRleCwgb2Zmc2V0WSA9IDApIHtcclxuXHJcbiAgICAvLyBtYWtlIHRoZSBvcHRncm91cCBsYWJlbFxyXG4gICAgdmFyIG9wdGdyb3VwTGFiZWxFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhLWVudGl0eVwiKTtcclxuICAgIG9wdGdyb3VwTGFiZWxFbC5pZCA9IFwib3B0Z3JvdXBMYWJlbFwiICsgaW5kZXg7XHJcbiAgICBvcHRncm91cExhYmVsRWwuc2V0QXR0cmlidXRlKFwicG9zaXRpb25cIiwgXCItMC4xOCBcIiArICgwLjA0NSArIG9mZnNldFkpICsgXCIgLTAuMDAzXCIpO1xyXG4gICAgb3B0Z3JvdXBMYWJlbEVsLnNldEF0dHJpYnV0ZShcInNjYWxlXCIsIFwiMC4xMjUgMC4xMjUgMC4xMjVcIik7XHJcbiAgICBvcHRncm91cExhYmVsRWwuc2V0QXR0cmlidXRlKFwiYm1mb250LXRleHRcIiwgXCJ0ZXh0XCIsIHNlbGVjdGVkT3B0Z3JvdXBFbC5nZXRBdHRyaWJ1dGUoJ2xhYmVsJykpO1xyXG4gICAgb3B0Z3JvdXBMYWJlbEVsLnNldEF0dHJpYnV0ZShcImJtZm9udC10ZXh0XCIsIFwiY29sb3JcIiwgXCIjNzQ3NDc0XCIpO1xyXG4gICAgcGFyZW50RWwuYXBwZW5kQ2hpbGQob3B0Z3JvdXBMYWJlbEVsKTtcclxuXHJcbiAgICAvLyBnZXQgdGhlIG9wdGlvbnMgYXZhaWxhYmxlIGZvciB0aGlzIG9wdGdyb3VwIHJvd1xyXG4gICAgdmFyIG9wdGlvbnNFbGVtZW50cyA9IHNlbGVjdGVkT3B0Z3JvdXBFbC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm9wdGlvblwiKTsgIC8vIHRoZSBhY3R1YWwgSlMgY2hpbGRyZW4gZWxlbWVudHNcclxuXHJcbiAgICAvLyBjb252ZXJ0IHRoZSBOb2RlTGlzdCBvZiBtYXRjaGluZyBvcHRpb24gZWxlbWVudHMgaW50byBhIEphdmFzY3JpcHQgQXJyYXlcclxuICAgIHZhciBvcHRpb25zRWxlbWVudHNBcnJheSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG9wdGlvbnNFbGVtZW50cyk7XHJcblxyXG4gICAgdmFyIGZpcnN0QXJyYXkgPSBvcHRpb25zRWxlbWVudHNBcnJheS5zbGljZSgwLDQpOyAvLyBnZXQgaXRlbXMgMCAtIDRcclxuICAgIHZhciBwcmV2aWV3QXJyYXkgPSBvcHRpb25zRWxlbWVudHNBcnJheS5zbGljZSgtMyk7IC8vIGdldCB0aGUgMyBMQVNUIGl0ZW1zIG9mIHRoZSBhcnJheVxyXG5cclxuICAgIC8vIENvbWJpbmUgaW50byBcIm1lbnVBcnJheVwiLCBhIGxpc3Qgb2YgY3VycmVudGx5IHZpc2libGUgb3B0aW9ucyB3aGVyZSB0aGUgbWlkZGxlIGluZGV4IGlzIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgb2JqZWN0XHJcbiAgICB2YXIgbWVudUFycmF5ID0gcHJldmlld0FycmF5LmNvbmNhdChmaXJzdEFycmF5KTtcclxuXHJcbiAgICB2YXIgc2VsZWN0T3B0aW9uc0hUTUwgPSBcIlwiO1xyXG4gICAgdmFyIHN0YXJ0UG9zaXRpb25YID0gLTAuMjI1O1xyXG4gICAgdmFyIGRlbHRhWCA9IDAuMDc1O1xyXG5cclxuICAgIC8vIEZvciBlYWNoIG1lbnUgb3B0aW9uLCBjcmVhdGUgYSBwcmV2aWV3IGVsZW1lbnQgYW5kIGl0cyBhcHByb3ByaWF0ZSBjaGlsZHJlblxyXG4gICAgbWVudUFycmF5LmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQsIG1lbnVBcnJheUluZGV4KSB7XHJcbiAgICAgIHZhciB2aXNpYmxlID0gKG1lbnVBcnJheUluZGV4ID09PSAwIHx8IG1lbnVBcnJheUluZGV4ID09PSA2KSA/IChmYWxzZSkgOiAodHJ1ZSk7XHJcbiAgICAgIHZhciBzZWxlY3RlZCA9IChtZW51QXJyYXlJbmRleCA9PT0gMyk7XHJcbiAgICAgIC8vIGluZGV4IG9mIHRoZSBvcHRpb25zRWxlbWVudHNBcnJheSB3aGVyZSBvcHRpb25zRWxlbWVudHNBcnJheS5lbGVtZW50LmdldGF0dHJpYnV0ZShcInZhbHVlXCIpID0gZWxlbWVudC5nZXRhdHRyaWJ1dGUoXCJ2YWx1ZVwiKVxyXG4gICAgICB2YXIgb3JpZ2luYWxPcHRpb25zQXJyYXlJbmRleCA9IGZpbmRXaXRoQXR0cihvcHRpb25zRWxlbWVudHNBcnJheSwgXCJ2YWx1ZVwiLCBlbGVtZW50LmdldEF0dHJpYnV0ZShcInZhbHVlXCIpKTtcclxuICAgICAgc2VsZWN0T3B0aW9uc0hUTUwgKz0gYFxyXG4gICAgICA8YS1lbnRpdHkgaWQ9XCJtZW51JHtvcmlnaW5hbE9wdGlvbnNBcnJheUluZGV4fVwiIHZpc2libGU9XCIke3Zpc2libGV9XCIgY2xhc3M9XCJwcmV2aWV3JHsgKHNlbGVjdGVkKSA/IFwiIHNlbGVjdGVkXCIgOiBcIlwifVwiIG9wdGlvbmlkPVwiJHtvcmlnaW5hbE9wdGlvbnNBcnJheUluZGV4fVwiIHZhbHVlPVwiJHtlbGVtZW50LmdldEF0dHJpYnV0ZShcInZhbHVlXCIpfVwiIG9wdGdyb3VwPVwiJHtzZWxlY3RlZE9wdGdyb3VwRWwuZ2V0QXR0cmlidXRlKFwidmFsdWVcIil9XCIgcG9zaXRpb249XCIke3N0YXJ0UG9zaXRpb25YfSAke29mZnNldFl9IDBcIj5cclxuICAgICAgICA8YS1ib3ggY2xhc3M9XCJwcmV2aWV3RnJhbWVcIiBwb3NpdGlvbj1cIjAgMCAtMC4wMDNcIiBzY2FsZT1cIjAuMDYgMC4wNiAwLjAwNVwiIG1hdGVyaWFsPVwiY29sb3I6ICR7KHNlbGVjdGVkKSA/IChcInllbGxvd1wiKSA6IChcIiMyMjIyMjJcIil9XCI+PC9hLWJveD5cclxuICAgICAgICA8YS1pbWFnZSBjbGFzcz1cInByZXZpZXdJbWFnZVwiIHNjYWxlPVwiMC4wNSAwLjA1IDAuMDVcIiBzcmM9XCIke2VsZW1lbnQuZ2V0QXR0cmlidXRlKFwic3JjXCIpfVwiID48L2EtaW1hZ2U+XHJcbiAgICAgICAgPGEtZW50aXR5IGNsYXNzPVwib2JqZWN0TmFtZVwiIHBvc2l0aW9uPVwiLTAuMDI1IC0wLjA0IC0wLjAwM1wiIHNjYWxlPVwiMC4wNSAwLjA1IDAuMDVcIiBibWZvbnQtdGV4dD1cInRleHQ6ICR7ZWxlbWVudC50ZXh0fTsgY29sb3I6ICR7KHNlbGVjdGVkKSA/IChcInllbGxvd1wiKSA6IChcIiM3NDc0NzRcIil9XCI+PC9hLWVudGl0eT5cclxuICAgICAgPC9hLWVudGl0eT5gXHJcbiAgICAgIHN0YXJ0UG9zaXRpb25YICs9IGRlbHRhWDtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFwcGVuZCB0aGVzZSBtZW51IG9wdGlvbnMgdG8gYSBuZXcgZWxlbWVudCB3aXRoIGlkIG9mIFwic2VsZWN0T3B0aW9uc1Jvd1wiXHJcbiAgICB2YXIgc2VsZWN0T3B0aW9uc1Jvd0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImEtZW50aXR5XCIpO1xyXG4gICAgc2VsZWN0T3B0aW9uc1Jvd0VsLmlkID0gXCJzZWxlY3RPcHRpb25zUm93XCIgKyBpbmRleDtcclxuICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5pbm5lckhUTUwgPSBzZWxlY3RPcHRpb25zSFRNTDtcclxuICAgIHBhcmVudEVsLmFwcGVuZENoaWxkKHNlbGVjdE9wdGlvbnNSb3dFbCk7XHJcblxyXG4gIH0sXHJcblxyXG4gIHJlbW92ZVNlbGVjdE9wdGlvbnNSb3c6IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgLy8gZmluZCB0aGUgYXBwcm9wcmlhdGUgc2VsZWN0IG9wdGlvbnMgcm93XHJcbiAgICB2YXIgc2VsZWN0T3B0aW9uc1Jvd0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWxlY3RPcHRpb25zUm93XCIgKyBpbmRleCk7XHJcbiAgICB2YXIgb3B0Z3JvdXBMYWJlbEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvcHRncm91cExhYmVsXCIgKyBpbmRleCk7XHJcblxyXG4gICAgY29uc29sZS5sb2coXCJ0cnkgdG8gcmVtb3ZlIGNoaWxkcmVuXCIpO1xyXG4gICAgLy8gZGVsZXRlIGFsbCBjaGlsZHJlbiBvZiBzZWxlY3RPcHRpb25zUm93RWxcclxuICAgIHdoaWxlIChzZWxlY3RPcHRpb25zUm93RWwuZmlyc3RDaGlsZCkge1xyXG4gICAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5yZW1vdmVDaGlsZChzZWxlY3RPcHRpb25zUm93RWwuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyhcImNoaWxkcmVuIHJlbW92ZWRcIik7XHJcblxyXG4gICAgLy8gZGVsZXRlIHNlbGVjdE9wdGlvbnNSb3dFbCBhbmQgb3B0Z3JvdXBMYWJlbEVsXHJcbiAgICBvcHRncm91cExhYmVsRWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChvcHRncm91cExhYmVsRWwpO1xyXG4gICAgc2VsZWN0T3B0aW9uc1Jvd0VsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2VsZWN0T3B0aW9uc1Jvd0VsKTtcclxuICB9LFxyXG5cclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBDcmVhdGUgc2VsZWN0IGJhciBtZW51IGZyb20gaHRtbCBjaGlsZCBgb3B0aW9uYCBlbGVtZW50cyBiZW5lYXRoIHBhcmVudCBlbnRpdHkgaW5zcGlyZWQgYnkgdGhlIGh0bWw1IHNwZWM6IGh0dHA6Ly93d3cudzNzY2hvb2xzLmNvbS90YWdzL3RhZ19vcHRncm91cC5hc3BcclxuICAgIHZhciBzZWxlY3RFbCA9IHRoaXMuZWw7ICAvLyBSZWZlcmVuY2UgdG8gdGhlIGNvbXBvbmVudCdzIGVudGl0eS5cclxuICAgIHRoaXMuZGF0YS5sYXN0VGltZSA9IG5ldyBEYXRlKCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBcImZyYW1lXCIgb2YgdGhlIHNlbGVjdCBtZW51IGJhclxyXG4gICAgdmFyIHNlbGVjdFJlbmRlckVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImEtZW50aXR5XCIpO1xyXG4gICAgc2VsZWN0UmVuZGVyRWwuaWQgPSBcInNlbGVjdFJlbmRlclwiO1xyXG4gICAgc2VsZWN0UmVuZGVyRWwuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8YS1ib3ggaWQ9XCJtZW51RnJhbWVcIiBzY2FsZT1cIjAuNCAwLjE1IDAuMDA1XCIgcG9zaXRpb249XCIwIDAgLTAuMDA3NVwiICBtYXRlcmlhbD1cIm9wYWNpdHk6IDAuNTsgdHJhbnNwYXJlbnQ6IHRydWU7IGNvbG9yOiAjMDAwMDAwXCI+PC9hLWJveD5cclxuICAgICAgPGEtZW50aXR5IGlkPVwiYXJyb3dSaWdodFwiIHBvc2l0aW9uPVwiMC4yMjUgMCAwXCIgcm90YXRpb249XCI5MCAxODAgMFwiIHNjYWxlPVwiLTAuMDA0IDAuMDAyIDAuMDA0XCIgb2JqLW1vZGVsPVwib2JqOiNlbnZfYXJyb3dcIiBtYXRlcmlhbD1cIm9wYWNpdHk6IDAuNTsgdHJhbnNwYXJlbnQ6IHRydWU7IGNvbG9yOiAjMDAwMDAwXCI+PC9hLWVudGl0eT5cclxuICAgICAgPGEtZW50aXR5IGlkPVwiYXJyb3dMZWZ0XCIgcG9zaXRpb249XCItMC4yMjUgMCAwXCIgcm90YXRpb249XCI5MCAxODAgMFwiIHNjYWxlPVwiMC4wMDQgMC4wMDIgMC4wMDRcIiBvYmotbW9kZWw9XCJvYmo6I2Vudl9hcnJvd1wiIG1hdGVyaWFsPVwib3BhY2l0eTowLjU7IHRyYW5zcGFyZW50OnRydWU7IGNvbG9yOiMwMDAwMDBcIj48L2EtZW50aXR5PlxyXG4gICAgICA8YS1lbnRpdHkgaWQ9XCJhcnJvd1VwXCIgcG9zaXRpb249XCIwIDAuMSAwXCIgcm90YXRpb249XCIwIDI3MCA5MFwiIHNjYWxlPVwiMC4wMDQgMC4wMDIgMC4wMDRcIiBvYmotbW9kZWw9XCJvYmo6I2Vudl9hcnJvd1wiIG1hdGVyaWFsPVwib3BhY2l0eTogMC41OyB0cmFuc3BhcmVudDogdHJ1ZTsgY29sb3I6ICMwMDAwMDBcIj48L2EtZW50aXR5PlxyXG4gICAgICA8YS1lbnRpdHkgaWQ9XCJhcnJvd0Rvd25cIiBwb3NpdGlvbj1cIjAgLTAuMSAwXCIgcm90YXRpb249XCIwIDI3MCA5MFwiIHNjYWxlPVwiLTAuMDA0IDAuMDAyIDAuMDA0XCIgb2JqLW1vZGVsPVwib2JqOiNlbnZfYXJyb3dcIiBtYXRlcmlhbD1cIm9wYWNpdHk6IDAuNTsgdHJhbnNwYXJlbnQ6IHRydWU7IGNvbG9yOiAjMDAwMDAwXCI+PC9hLWVudGl0eT5cclxuICAgICAgYDtcclxuICAgIHNlbGVjdEVsLmFwcGVuZENoaWxkKHNlbGVjdFJlbmRlckVsKTtcclxuXHJcblxyXG4gICAgdmFyIG9wdGdyb3VwcyA9IHNlbGVjdEVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwib3B0Z3JvdXBcIik7ICAvLyBHZXQgdGhlIG9wdGdyb3Vwc1xyXG4gICAgdmFyIHNlbGVjdGVkT3B0Z3JvdXBFbCA9IG9wdGdyb3Vwc1t0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4XTsgIC8vIGZldGNoIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgb3B0Z3JvdXBcclxuICAgIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwVmFsdWUgPSBzZWxlY3RlZE9wdGdyb3VwRWwuZ2V0QXR0cmlidXRlKFwidmFsdWVcIik7IC8vIHNldCBjb21wb25lbnQgcHJvcGVydHkgdG8gb3Bncm91cCB2YWx1ZVxyXG5cclxuICAgIHRoaXMubWFrZVNlbGVjdE9wdGlvbnNSb3coc2VsZWN0ZWRPcHRncm91cEVsLCBzZWxlY3RSZW5kZXJFbCwgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCk7XHJcblxyXG4gIH0sXHJcblxyXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBJZiBjb250cm9scyA9IHRydWUgYW5kIGEgY29udHJvbGxlcklEIGhhcyBiZWVuIHByb3ZpZGVkLCB0aGVuIGFkZCBjb250cm9sbGVyIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAgaWYgKHRoaXMuZGF0YS5jb250cm9scyAmJiB0aGlzLmRhdGEuY29udHJvbGxlcklEKSB7XHJcbiAgICAgIHZhciBjb250cm9sbGVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEuY29udHJvbGxlcklEKTtcclxuICAgICAgY29udHJvbGxlckVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYWNrcGFkZG93bicsIHRoaXMub25UcmFja3BhZERvd24uYmluZCh0aGlzKSk7XHJcbiAgICAgIGNvbnRyb2xsZXJFbC5hZGRFdmVudExpc3RlbmVyKCdheGlzbW92ZScsIHRoaXMub25BeGlzTW92ZS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignb25Ib3ZlckxlZnQnLCB0aGlzLm9uSG92ZXJMZWZ0LmJpbmQodGhpcykpO1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignb25Ib3ZlclJpZ2h0JywgdGhpcy5vbkhvdmVyUmlnaHQuYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdvbk9wdGlvblN3aXRjaCcsIHRoaXMub25PcHRpb25Td2l0Y2guYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdvbk9wdGlvbk5leHQnLCB0aGlzLm9uT3B0aW9uTmV4dC5iaW5kKHRoaXMpKTtcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ29uT3B0aW9uUHJldmlvdXMnLCB0aGlzLm9uT3B0aW9uUHJldmlvdXMuYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdvbk9wdGdyb3VwTmV4dCcsIHRoaXMub25PcHRncm91cE5leHQuYmluZCh0aGlzKSk7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdvbk9wdGdyb3VwUHJldmlvdXMnLCB0aGlzLm9uT3B0Z3JvdXBQcmV2aW91cy5iaW5kKHRoaXMpKTtcclxuXHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cclxuICAgKi9cclxuICByZW1vdmVFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuZGF0YS5jb250cm9scyAmJiB0aGlzLmRhdGEuY29udHJvbGxlcklEKSB7XHJcbiAgICAgIGNvbnRyb2xsZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5jb250cm9sbGVySUQpO1xyXG4gICAgICBjb250cm9sbGVyRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhY2twYWRkb3duJywgdGhpcy5vblRyYWNrcGFkRG93bik7XHJcbiAgICAgIGNvbnRyb2xsZXJFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdheGlzbW92ZScsIHRoaXMub25BeGlzTW92ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGVsID0gdGhpcy5lbDtcclxuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ29uT3B0aW9uU3dpdGNoJywgdGhpcy5vbk9wdGlvblN3aXRjaCk7XHJcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdvbkhvdmVyUmlnaHQnLCB0aGlzLm9uSG92ZXJSaWdodCk7XHJcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdvbkhvdmVyTGVmdCcsIHRoaXMub25Ib3ZlckxlZnQpO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignb25PcHRpb25OZXh0JywgdGhpcy5vbk9wdGlvbk5leHQpO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignb25PcHRpb25QcmV2aW91cycsIHRoaXMub25PcHRpb25QcmV2aW91cyk7XHJcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdvbk9wdGdyb3VwTmV4dCcsIHRoaXMub25PcHRncm91cE5leHQpO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignb25PcHRncm91cFByZXZpb3VzJywgdGhpcy5vbk9wdGdyb3VwUHJldmlvdXMpO1xyXG5cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBlbnRpdHkgcmVzdW1lcy5cclxuICAgKiBVc2UgdG8gY29udGludWUgb3IgYWRkIGFueSBkeW5hbWljIG9yIGJhY2tncm91bmQgYmVoYXZpb3Igc3VjaCBhcyBldmVudHMuXHJcbiAgICovXHJcbiAgcGxheTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGVudGl0eSBwYXVzZXMuXHJcbiAgICogVXNlIHRvIHN0b3Agb3IgcmVtb3ZlIGFueSBkeW5hbWljIG9yIGJhY2tncm91bmQgYmVoYXZpb3Igc3VjaCBhcyBldmVudHMuXHJcbiAgICovXHJcbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGNvbXBvbmVudCBpcyByZW1vdmVkIChlLmcuLCB2aWEgcmVtb3ZlQXR0cmlidXRlKS5cclxuICAgKiBHZW5lcmFsbHkgdW5kb2VzIGFsbCBtb2RpZmljYXRpb25zIHRvIHRoZSBlbnRpdHkuXHJcbiAgICovXHJcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgb25BeGlzTW92ZTogZnVuY3Rpb24gKGV2dCkgeyAgICAgICAvLyBtZW51OiB1c2VkIGZvciBkZXRlcm1pbmluZyBjdXJyZW50IGF4aXMgb2YgdHJhY2twYWQgaG92ZXIgcG9zaXRpb25cclxuICAgIGlmIChldnQudGFyZ2V0LmlkICE9IHRoaXMuZGF0YS5jb250cm9sbGVySUQpIHsgICAvL21lbnU6IG9ubHkgZGVhbCB3aXRoIHRyYWNrcGFkIGV2ZW50cyBmcm9tIHJpZ2h0IGNvbnRyb2xsZXJcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG9ubHkgcnVuIHRoaXMgZnVuY3Rpb24gaWYgdGhlcmUgaXMgc29tZSB2YWx1ZSBmb3IgYXQgbGVhc3Qgb25lIGF4aXNcclxuICAgIGlmIChldnQuZGV0YWlsLmF4aXNbMF0gPT09IDAgJiYgZXZ0LmRldGFpbC5heGlzWzFdID09PSAwKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaXNPY3VsdXMgPSBmYWxzZTtcclxuICAgIHZhciBnYW1lcGFkcyA9IG5hdmlnYXRvci5nZXRHYW1lcGFkcygpO1xyXG4gICAgaWYgKGdhbWVwYWRzKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2FtZXBhZHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgZ2FtZXBhZCA9IGdhbWVwYWRzW2ldO1xyXG4gICAgICAgIGlmIChnYW1lcGFkKSB7XHJcbiAgICAgICAgICBpZiAoZ2FtZXBhZC5pZC5pbmRleE9mKCdPY3VsdXMgVG91Y2gnKSA9PT0gMCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImlzT2N1bHVzXCIpO1xyXG4gICAgICAgICAgICBpc09jdWx1cyA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4vLyAgICBjb25zb2xlLmxvZyhcImF4aXNbMF06IFwiICsgZXZ0LmRldGFpbC5heGlzWzBdICsgXCIgbGVmdCAtMTsgcmlnaHQgKzFcIik7XHJcbi8vICAgIGNvbnNvbGUubG9nKFwiYXhpc1sxXTogXCIgKyBldnQuZGV0YWlsLmF4aXNbMV0gKyBcIiBkb3duIC0xOyB1cCArMVwiKTtcclxuLy8gICAgY29uc29sZS5sb2coZXZ0LnRhcmdldC5pZCk7XHJcblxyXG4gICAgLy8gd2hpY2ggYXhpcyBoYXMgbGFyZ2VzdCBhYnNvbHV0ZSB2YWx1ZT8gdGhlbiB1c2UgdGhhdCBheGlzIHZhbHVlIHRvIGRldGVybWluZSBob3ZlciBwb3NpdGlvblxyXG4vLyAgICBjb25zb2xlLmxvZyhldnQuZGV0YWlsLmF4aXNbMF0pO1xyXG4gICAgaWYgKE1hdGguYWJzKGV2dC5kZXRhaWwuYXhpc1swXSkgPiBNYXRoLmFicyhldnQuZGV0YWlsLmF4aXNbMV0pKSB7IC8vIGlmIHggYXhpcyBhYnNvbHV0ZSB2YWx1ZSAobGVmdC9yaWdodCkgaXMgZ3JlYXRlciB0aGFuIHkgYXhpcyAoZG93bi91cClcclxuICAgICAgaWYgKGV2dC5kZXRhaWwuYXhpc1swXSA+IDApIHsgLy8gaWYgdGhlIHJpZ2h0IGF4aXMgaXMgZ3JlYXRlciB0aGFuIDAgKG1pZHBvaW50KVxyXG4gICAgICAgIHRoaXMub25Ib3ZlclJpZ2h0KCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5vbkhvdmVyTGVmdCgpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgaWYgKGlzT2N1bHVzKSB7XHJcbiAgICAgICAgdmFyIHlBeGlzID0gLWV2dC5kZXRhaWwuYXhpc1sxXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgeUF4aXMgPSBldnQuZGV0YWlsLmF4aXNbMV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh5QXhpcyA+IDApIHsgLy8gaWYgdGhlIHVwIGF4aXMgaXMgZ3JlYXRlciB0aGFuIDAgKG1pZHBvaW50KVxyXG4gICAgICAgIHRoaXMub25Ib3ZlclVwKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5vbkhvdmVyRG93bigpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgdXNpbmcgdGhlIG9jdWx1cyB0b3VjaCBjb250cm9scywgYW5kIHRodW1ic3RpY2sgaXMgPjg1JSBpbiBhbnkgZGlyZWN0aW9uIHRoZW4gZmlyZSBvbnRyYWNrcGFkZG93blxyXG4gICAgdmFyIGdhbWVwYWRzID0gbmF2aWdhdG9yLmdldEdhbWVwYWRzKCk7XHJcbiAgICBpZiAoZ2FtZXBhZHMpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lcGFkcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBnYW1lcGFkID0gZ2FtZXBhZHNbaV07XHJcbiAgICAgICAgaWYgKGdhbWVwYWQpIHtcclxuICAgICAgICAgIGlmIChnYW1lcGFkLmlkLmluZGV4T2YoJ09jdWx1cyBUb3VjaCcpID09PSAwKSB7XHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhldnQuZGV0YWlsLmF4aXNbMF0pID4gMC44NSB8fCBNYXRoLmFicyhldnQuZGV0YWlsLmF4aXNbMV0pID4gMC44NSkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBkZWJvdW5jZSAodGhyb3R0bGUpIHN1Y2ggdGhhdCB0aGlzIG9ubHkgcnVucyBvbmNlIGV2ZXJ5IDEvMiBzZWNvbmQgbWF4XHJcbiAgICAgICAgICAgICAgdmFyIHRoaXNUaW1lID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgICBpZiAoIE1hdGguZmxvb3IodGhpc1RpbWUgLSB0aGlzLmRhdGEubGFzdFRpbWUpID4gNTAwICkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhLmxhc3RUaW1lID0gdGhpc1RpbWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uVHJhY2twYWREb3duKGV2dCk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgb25Ib3ZlclJpZ2h0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVsLmVtaXQoXCJtZW51SG92ZXJSaWdodFwiKTtcclxuICAgIHZhciBhcnJvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dSaWdodFwiKTtcclxuICAgIHZhciBjdXJyZW50QXJyb3dDb2xvciA9IG5ldyBUSFJFRS5Db2xvcihhcnJvdy5nZXRBdHRyaWJ1dGUoXCJtYXRlcmlhbFwiKS5jb2xvcik7XHJcbiAgICBpZiAoY3VycmVudEFycm93Q29sb3IuciA9PT0gMCkgeyAvLyBpZiBub3QgYWxyZWFkeSBzb21lIHNoYWRlIG9mIHllbGxvdyAod2hpY2ggaW5kaWNhdGVzIHJlY2VudCBidXR0b24gcHJlc3MpIHRoZW4gYW5pbWF0ZSBncmVlbiBob3ZlclxyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknKTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiIzAwRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG9uSG92ZXJMZWZ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVsLmVtaXQoXCJtZW51SG92ZXJMZWZ0XCIpO1xyXG4gICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0xlZnRcIik7XHJcbiAgICB2YXIgY3VycmVudEFycm93Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoYXJyb3cuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpO1xyXG4gICAgaWYgKGN1cnJlbnRBcnJvd0NvbG9yLnIgPT09IDApIHsgLy8gaWYgbm90IGFscmVhZHkgc29tZSBzaGFkZSBvZiB5ZWxsb3cgKHdoaWNoIGluZGljYXRlcyByZWNlbnQgYnV0dG9uIHByZXNzKSB0aGVuIGFuaW1hdGUgZ3JlZW4gaG92ZXJcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJyk7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5jb2xvcicsIGR1cjogNTAwLCBmcm9tOiBcIiMwMEZGMDBcIiwgdG86IFwiIzAwMDAwMFwiIH0pO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5vcGFjaXR5JywgZHVyOiA1MDAsIGZyb206IFwiMVwiLCB0bzogXCIwLjVcIiB9KTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBvbkhvdmVyRG93bjogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5lbC5lbWl0KFwibWVudUhvdmVyRG93blwiKTtcclxuICAgIHZhciBzZWxlY3RFbCA9IHRoaXMuZWw7XHJcbiAgICB2YXIgb3B0Z3JvdXBzID0gc2VsZWN0RWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRncm91cFwiKTsgIC8vIEdldCB0aGUgb3B0Z3JvdXBzXHJcblxyXG4gICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0Rvd25cIik7XHJcbiAgICB2YXIgY3VycmVudEFycm93Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoYXJyb3cuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpO1xyXG4gICAgaWYgKCAhKGN1cnJlbnRBcnJvd0NvbG9yLnIgPiAwICYmIGN1cnJlbnRBcnJvd0NvbG9yLmcgPiAwKSApIHsgLy8gaWYgbm90IGFscmVhZHkgc29tZSBzaGFkZSBvZiB5ZWxsb3cgKHdoaWNoIGluZGljYXRlcyByZWNlbnQgYnV0dG9uIHByZXNzKSB0aGVuIGFuaW1hdGUgZ3JlZW4gaG92ZXJcclxuICAgICAgaWYgKHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXggKyAyID4gb3B0Z3JvdXBzLmxlbmd0aCkge1xyXG4gICAgICAgIC8vIENBTidUIERPIC0gQUxSRUFEWSBBVCBFTkQgT0YgTElTVFxyXG4gICAgICAgIHZhciBhcnJvd0NvbG9yID0gXCIjRkYwMDAwXCI7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGFycm93Q29sb3IgPSBcIiMwMEZGMDBcIjtcclxuICAgICAgfVxyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknKTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IGFycm93Q29sb3IsIHRvOiBcIiMwMDAwMDBcIiB9KTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgb25Ib3ZlclVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVsLmVtaXQoXCJtZW51SG92ZXJVcFwiKTtcclxuICAgIHZhciBzZWxlY3RFbCA9IHRoaXMuZWw7XHJcbiAgICB2YXIgb3B0Z3JvdXBzID0gc2VsZWN0RWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRncm91cFwiKTsgIC8vIEdldCB0aGUgb3B0Z3JvdXBzXHJcblxyXG4gICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1VwXCIpO1xyXG4gICAgdmFyIGN1cnJlbnRBcnJvd0NvbG9yID0gbmV3IFRIUkVFLkNvbG9yKGFycm93LmdldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIpLmNvbG9yKTtcclxuICAgIGlmICggIShjdXJyZW50QXJyb3dDb2xvci5yID4gMCAmJiBjdXJyZW50QXJyb3dDb2xvci5nID4gMCkgKSB7IC8vIGlmIG5vdCBhbHJlYWR5IHNvbWUgc2hhZGUgb2YgeWVsbG93ICh3aGljaCBpbmRpY2F0ZXMgcmVjZW50IGJ1dHRvbiBwcmVzcykgdGhlbiBhbmltYXRlIGdyZWVuIGhvdmVyXHJcbiAgICAgIGlmICh0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4IC0gMSA8IDApIHtcclxuICAgICAgICAgLy8gQ0FOJ1QgRE8gLSBBTFJFQURZIEFUIEVORCBPRiBMSVNUXHJcbiAgICAgICAgIHZhciBhcnJvd0NvbG9yID0gXCIjRkYwMDAwXCI7XHJcbiAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICB2YXIgYXJyb3dDb2xvciA9IFwiIzAwRkYwMFwiO1xyXG4gICAgICAgfVxyXG4gICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJyk7XHJcbiAgICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScpO1xyXG4gICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IGFycm93Q29sb3IsIHRvOiBcIiMwMDAwMDBcIiB9KTtcclxuICAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG9uT3B0aW9uTmV4dDogZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgdGhpcy5vbk9wdGlvblN3aXRjaChcIm5leHRcIik7XHJcbiAgfSxcclxuXHJcbiAgb25PcHRpb25QcmV2aW91czogZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgdGhpcy5vbk9wdGlvblN3aXRjaChcInByZXZpb3VzXCIpO1xyXG4gIH0sXHJcblxyXG4gIG9uT3B0Z3JvdXBOZXh0OiBmdW5jdGlvbihldnQpIHtcclxuICAgIHZhciBzZWxlY3RFbCA9IHRoaXMuZWw7XHJcbiAgICB2YXIgb3B0Z3JvdXBzID0gc2VsZWN0RWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRncm91cFwiKTsgIC8vIEdldCB0aGUgb3B0Z3JvdXBzXHJcbiAgICB2YXIgc2VsZWN0UmVuZGVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlbGVjdFJlbmRlclwiKTtcclxuXHJcbiAgICBpZiAodGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCArIDIgPiBvcHRncm91cHMubGVuZ3RoKSB7XHJcbiAgICAgIC8vIENBTidUIERPIFRISVMsIHNob3cgcmVkIGFycm93XHJcbiAgICAgIHZhciBhcnJvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dEb3duXCIpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJyk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5jb2xvcicsIGR1cjogNTAwLCBmcm9tOiBcIiNGRjAwMDBcIiwgdG86IFwiIzAwMDAwMFwiIH0pO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5vcGFjaXR5JywgZHVyOiA1MDAsIGZyb206IFwiMVwiLCB0bzogXCIwLjVcIiB9KTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJywgeyBwcm9wZXJ0eTogJ3NjYWxlJywgZHVyOiA1MDAsIGZyb206IFwiLTAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIi0wLjAwNCAwLjAwMiAwLjAwNFwiIH0pO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIENBTiBETyBUSElTLCBzaG93IG5leHQgb3B0Z3JvdXBcclxuXHJcbiAgICAgIHRoaXMucmVtb3ZlU2VsZWN0T3B0aW9uc1Jvdyh0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4KTsgLy8gcmVtb3ZlIHRoZSBvbGQgb3B0Z3JvdXAgcm93XHJcblxyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4ICs9IDE7XHJcbiAgICAgIHZhciBzZWxlY3RlZE9wdGdyb3VwRWwgPSBvcHRncm91cHNbdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleF07ICAvLyBmZXRjaCB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9wdGdyb3VwXHJcbiAgICAgIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwVmFsdWUgPSBzZWxlY3RlZE9wdGdyb3VwRWwuZ2V0QXR0cmlidXRlKFwidmFsdWVcIik7IC8vIHNldCBjb21wb25lbnQgcHJvcGVydHkgdG8gb3Bncm91cCB2YWx1ZVxyXG5cclxuICAgICAgdGhpcy5lbC5mbHVzaFRvRE9NKCk7XHJcblxyXG4gICAgICB2YXIgbmV4dFNlbGVjdGVkT3B0Z3JvdXBFbCA9IG9wdGdyb3Vwc1t0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4XTsgIC8vIGZldGNoIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgb3B0Z3JvdXBcclxuICAgICAgLy8gdGhpcy5tYWtlU2VsZWN0T3B0aW9uc1JvdyhuZXh0U2VsZWN0ZWRPcHRncm91cEVsLCBzZWxlY3RSZW5kZXJFbCwgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCwgLTAuMTUpO1xyXG4gICAgICB0aGlzLm1ha2VTZWxlY3RPcHRpb25zUm93KG5leHRTZWxlY3RlZE9wdGdyb3VwRWwsIHNlbGVjdFJlbmRlckVsLCB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4KTtcclxuXHJcbiAgICAgIC8vIENoYW5nZSBzZWxlY3RlZCBvcHRpb24gZWxlbWVudCB3aGVuIG9wdGdyb3VwIGlzIGNoYW5nZWRcclxuICAgICAgdmFyIHNlbGVjdE9wdGlvbnNSb3dFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWxlY3RPcHRpb25zUm93JyArIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXgpO1xyXG4gICAgICB2YXIgbmV3bHlTZWxlY3RlZE1lbnVFbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzZWxlY3RlZCcpWzBdO1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHNlbGVjdE9wdGlvbnNWYWx1ZSBhbmQgSW5kZXhcclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uVmFsdWUgPSBuZXdseVNlbGVjdGVkTWVudUVsLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpO1xyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRpb25JbmRleCA9IG5ld2x5U2VsZWN0ZWRNZW51RWwuZ2V0QXR0cmlidXRlKFwib3B0aW9uaWRcIik7XHJcblxyXG4gICAgICB0aGlzLmVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIHRoaXMuZWwuZW1pdChcIm1lbnVPcHRncm91cE5leHRcIik7XHJcbiAgICAgIHRoaXMuZWwuZW1pdChcIm1lbnVDaGFuZ2VkXCIpO1xyXG5cclxuICAgICAgdmFyIGFycm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0Rvd25cIik7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnKTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnLCB7IHByb3BlcnR5OiAnc2NhbGUnLCBkdXI6IDUwMCwgZnJvbTogXCItMC4wMDYgMC4wMDMgMC4wMDZcIiwgdG86IFwiLTAuMDA0IDAuMDAyIDAuMDA0XCIgfSk7XHJcbiAgICB9XHJcblxyXG4gIH0sXHJcblxyXG4gIG9uT3B0Z3JvdXBQcmV2aW91czogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICB2YXIgc2VsZWN0RWwgPSB0aGlzLmVsO1xyXG4gICAgdmFyIG9wdGdyb3VwcyA9IHNlbGVjdEVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwib3B0Z3JvdXBcIik7ICAvLyBHZXQgdGhlIG9wdGdyb3Vwc1xyXG4gICAgdmFyIHNlbGVjdFJlbmRlckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWxlY3RSZW5kZXJcIik7XHJcblxyXG4gICAgaWYgKHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXggLSAxIDwgMCkge1xyXG4gICAgICAvLyBDQU4nVCBETyBUSElTLCBzaG93IHJlZCBhcnJvd1xyXG4gICAgICB2YXIgYXJyb3cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93VXBcIik7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScpO1xyXG4gICAgICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnKTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGMDAwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5JywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLm9wYWNpdHknLCBkdXI6IDUwMCwgZnJvbTogXCIxXCIsIHRvOiBcIjAuNVwiIH0pO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2NhbGUnLCB7IHByb3BlcnR5OiAnc2NhbGUnLCBkdXI6IDUwMCwgZnJvbTogXCIwLjAwNiAwLjAwMyAwLjAwNlwiLCB0bzogXCIwLjAwNCAwLjAwMiAwLjAwNFwiIH0pO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIENBTiBETyBUSElTLCBzaG93IHByZXZpb3VzIG9wdGdyb3VwXHJcblxyXG4gICAgICB0aGlzLnJlbW92ZVNlbGVjdE9wdGlvbnNSb3codGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCk7IC8vIHJlbW92ZSB0aGUgb2xkIG9wdGdyb3VwIHJvd1xyXG5cclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCAtPSAxO1xyXG4gICAgICB2YXIgc2VsZWN0ZWRPcHRncm91cEVsID0gb3B0Z3JvdXBzW3RoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXhdOyAgLy8gZmV0Y2ggdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBvcHRncm91cFxyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cFZhbHVlID0gc2VsZWN0ZWRPcHRncm91cEVsLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpOyAvLyBzZXQgY29tcG9uZW50IHByb3BlcnR5IHRvIG9wZ3JvdXAgdmFsdWVcclxuXHJcbiAgICAgIHRoaXMuZWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgdmFyIG5leHRTZWxlY3RlZE9wdGdyb3VwRWwgPSBvcHRncm91cHNbdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleF07ICAvLyBmZXRjaCB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9wdGdyb3VwXHJcbiAgICAgIC8vIHRoaXMubWFrZVNlbGVjdE9wdGlvbnNSb3cobmV4dFNlbGVjdGVkT3B0Z3JvdXBFbCwgc2VsZWN0UmVuZGVyRWwsIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXgsIC0wLjE1KTtcclxuICAgICAgdGhpcy5tYWtlU2VsZWN0T3B0aW9uc1JvdyhuZXh0U2VsZWN0ZWRPcHRncm91cEVsLCBzZWxlY3RSZW5kZXJFbCwgdGhpcy5kYXRhLnNlbGVjdGVkT3B0Z3JvdXBJbmRleCk7XHJcblxyXG4gICAgICAvLyBDaGFuZ2Ugc2VsZWN0ZWQgb3B0aW9uIGVsZW1lbnQgd2hlbiBvcHRncm91cCBpcyBjaGFuZ2VkXHJcbiAgICAgIHZhciBzZWxlY3RPcHRpb25zUm93RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VsZWN0T3B0aW9uc1JvdycgKyB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRncm91cEluZGV4KTtcclxuICAgICAgdmFyIG5ld2x5U2VsZWN0ZWRNZW51RWwgPSBzZWxlY3RPcHRpb25zUm93RWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2VsZWN0ZWQnKVswXTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSBzZWxlY3RPcHRpb25zVmFsdWUgYW5kIEluZGV4XHJcbiAgICAgIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGlvblZhbHVlID0gbmV3bHlTZWxlY3RlZE1lbnVFbC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKTtcclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uSW5kZXggPSBuZXdseVNlbGVjdGVkTWVudUVsLmdldEF0dHJpYnV0ZShcIm9wdGlvbmlkXCIpO1xyXG5cclxuICAgICAgdGhpcy5lbC5mbHVzaFRvRE9NKCk7XHJcblxyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51T3B0Z3JvdXBOZXh0XCIpO1xyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51Q2hhbmdlZFwiKTtcclxuXHJcbiAgICAgIHZhciBhcnJvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXJyb3dVcFwiKTtcclxuICAgICAgYXJyb3cucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJyk7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XHJcbiAgICAgIGFycm93LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScpO1xyXG4gICAgICBhcnJvdy5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fY29sb3InLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwuY29sb3InLCBkdXI6IDUwMCwgZnJvbTogXCIjRkZGRjAwXCIsIHRvOiBcIiMwMDAwMDBcIiB9KTtcclxuICAgICAgYXJyb3cuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XHJcbiAgICAgIGFycm93LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiBcIjAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIjAuMDA0IDAuMDAyIDAuMDA0XCIgfSk7XHJcbiAgICB9XHJcblxyXG4gIH0sXHJcblxyXG4gIG9uVHJhY2twYWREb3duOiBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICAvL21lbnU6IG9ubHkgZGVhbCB3aXRoIHRyYWNrcGFkIGV2ZW50cyBmcm9tIGNvbnRyb2xsZXIgc3BlY2lmaWVkIGluIGNvbXBvbmVudCBwcm9wZXJ0eVxyXG4gICAgaWYgKGV2dC50YXJnZXQuaWQgIT0gdGhpcy5kYXRhLmNvbnRyb2xsZXJJRCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAvLyBXaGljaCBkaXJlY3Rpb24gc2hvdWxkIHRoZSB0cmFja3BhZCB0cmlnZ2VyP1xyXG5cclxuICAgIC8vIEVhY2ggb2YgdGhlIDQgYXJyb3cncyBncmVlbiBpbnRlbnNpdHkgaXMgaW52ZXJzZWx5IGNvcnJlbGF0ZWQgd2l0aCB0aW1lIGVsYXBzZWQgc2luY2UgbGFzdCBob3ZlciBldmVudCBvbiB0aGF0IGF4aXNcclxuICAgIC8vIFRvIGRldGVybWluZSB3aGljaCBkaXJlY3Rpb24gdG8gbW92ZSB1cG9uIGJ1dHRvbiBwcmVzcywgbW92ZSBpbiB0aGUgZGlyZWN0aW9uIHdpdGggdGhlIG1vc3QgZ3JlZW4gY29sb3IgaW50ZW5zaXR5XHJcblxyXG4gICAgLy8gRmV0Y2ggYWxsIDQgZ3JlZW4gdmFsdWVzIGFuZCBwbGFjZSBpbiBhbiBhcnJheSBzdGFydGluZyB3aXRoIHVwLCByaWdodCwgZG93biwgbGVmdCBhcnJvdyBjb2xvcnMgKGNsb2Nrd2lzZSBmcm9tIHRvcClcclxuICAgIHZhciBhcnJvd1VwQ29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1VwXCIpLmdldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIpLmNvbG9yKTtcclxuICAgIHZhciBhcnJvd1JpZ2h0Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1JpZ2h0XCIpLmdldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIpLmNvbG9yKTtcclxuICAgIHZhciBhcnJvd0Rvd25Db2xvciA9IG5ldyBUSFJFRS5Db2xvcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93RG93blwiKS5nZXRBdHRyaWJ1dGUoXCJtYXRlcmlhbFwiKS5jb2xvcik7XHJcbiAgICB2YXIgYXJyb3dMZWZ0Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd0xlZnRcIikuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIikuY29sb3IpO1xyXG4vLyAgICB2YXIgYXJyb3dDb2xvckFycmF5ID0gW2Fycm93VXBDb2xvciwgYXJyb3dSaWdodENvbG9yLCBhcnJvd0Rvd25Db2xvciwgYXJyb3dMZWZ0Q29sb3JdO1xyXG4gICAgdmFyIGFycm93Q29sb3JBcnJheUdyZWVuID0gW2Fycm93VXBDb2xvci5nLCBhcnJvd1JpZ2h0Q29sb3IuZywgYXJyb3dEb3duQ29sb3IuZywgYXJyb3dMZWZ0Q29sb3IuZ107XHJcblxyXG4gICAgaWYgKCBhcnJvd0NvbG9yQXJyYXlHcmVlbi5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSA+IDApIHsgLy8gaWYgYXQgbGVhc3Qgb25lIHZhbHVlIGlzID4gMFxyXG4gICAgICBzd2l0Y2ggKGluZGV4T2ZNYXgoYXJyb3dDb2xvckFycmF5R3JlZW4pKSB7ICAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIHZhbHVlIGluIHRoZSBhcnJheSBpcyB0aGUgbGFyZ2VzdFxyXG4gICAgICAgIGNhc2UgMDogICAgICAgIC8vIHVwXHJcbiAgICAgICAgICB0aGlzLm9uT3B0Z3JvdXBQcmV2aW91cygpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJQUkVTU3VwXCIpO1xyXG4gICAgICAgICAgcmV0dXJuOyAvLyB3aXRob3V0IHRoaXMgcmV0dXJuIHRoZSBvdGhlciBjYXNlcyBhcmUgZmlyZWQgLSB3ZWlyZCFcclxuICAgICAgICBjYXNlIDE6ICAgICAgICAvLyByaWdodFxyXG4gICAgICAgICAgdGhpcy5vbk9wdGlvblN3aXRjaChcIm5leHRcIik7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlBSRVNTcmlnaHRcIik7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY2FzZSAyOiAgICAgICAgLy8gZG93blxyXG4gICAgICAgICAgdGhpcy5vbk9wdGdyb3VwTmV4dCgpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJQUkVTU2Rvd25cIik7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY2FzZSAzOiAgICAgICAgLy8gbGVmdFxyXG4gICAgICAgICAgdGhpcy5vbk9wdGlvblN3aXRjaChcInByZXZpb3VzXCIpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJQUkVTU2xlZnRcIik7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfSxcclxuXHJcbiAgb25PcHRpb25Td2l0Y2g6IGZ1bmN0aW9uIChkaXJlY3Rpb24pIHtcclxuXHJcbiAgICAvLyBTd2l0Y2ggdG8gdGhlIG5leHQgb3B0aW9uLCBvciBzd2l0Y2ggaW4gdGhlIGRpcmVjdGlvbiBvZiB0aGUgbW9zdCByZWNlbnRseSBob3ZlcmVkIGRpcmVjdGlvbmFsIGFycm93XHJcbiAgICAvLyBtZW51OiBzYXZlIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgbWVudSBlbGVtZW50XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImRpcmVjdGlvbj9cIik7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhkaXJlY3Rpb24pO1xyXG4gICAgdmFyIHNlbGVjdE9wdGlvbnNSb3dFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWxlY3RPcHRpb25zUm93JyArIHRoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXgpO1xyXG5cclxuICAgIGNvbnN0IG9sZE1lbnVFbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzZWxlY3RlZCcpWzBdO1xyXG4gICAgLy8gY29uc29sZS5sb2cob2xkTWVudUVsKTtcclxuXHJcbiAgICB2YXIgb2xkU2VsZWN0ZWRPcHRpb25JbmRleCA9IHBhcnNlSW50KG9sZE1lbnVFbC5nZXRBdHRyaWJ1dGUoXCJvcHRpb25pZFwiKSk7XHJcbiAgICB2YXIgc2VsZWN0ZWRPcHRpb25JbmRleCA9IG9sZFNlbGVjdGVkT3B0aW9uSW5kZXg7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhzZWxlY3RlZE9wdGlvbkluZGV4KTtcclxuXHJcbiAgICB2YXIgc2VsZWN0RWwgPSB0aGlzLmVsOyAgLy8gUmVmZXJlbmNlIHRvIHRoZSBjb21wb25lbnQncyBlbnRpdHkuXHJcbiAgICB2YXIgb3B0Z3JvdXBzID0gc2VsZWN0RWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRncm91cFwiKTsgIC8vIEdldCB0aGUgb3B0Z3JvdXBzXHJcbiAgICB2YXIgc2VsZWN0ZWRPcHRncm91cEVsID0gb3B0Z3JvdXBzW3RoaXMuZGF0YS5zZWxlY3RlZE9wdGdyb3VwSW5kZXhdOyAgLy8gZmV0Y2ggdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBvcHRncm91cFxyXG5cclxuICAgIGlmIChkaXJlY3Rpb24gPT0gJ3ByZXZpb3VzJykge1xyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51UHJldmlvdXNcIik7XHJcbiAgICAgIC8vIFBSRVZJT1VTIE9QVElPTiBNRU5VIFNUQVJUID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgICAgc2VsZWN0ZWRPcHRpb25JbmRleCA9IGxvb3BJbmRleChzZWxlY3RlZE9wdGlvbkluZGV4IC09IDEsIHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZEVsZW1lbnRDb3VudCk7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKHNlbGVjdGVkT3B0aW9uSW5kZXgpO1xyXG5cclxuICAgICAgLy8gbWVudTogYW5pbWF0ZSBhcnJvdyBMRUZUXHJcbiAgICAgIHZhciBhcnJvd0xlZnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFycm93TGVmdFwiKTtcclxuICAgICAgYXJyb3dMZWZ0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvd0xlZnQucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknKTtcclxuICAgICAgYXJyb3dMZWZ0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScpO1xyXG4gICAgICBhcnJvd0xlZnQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93TGVmdC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fb3BhY2l0eScsIHsgcHJvcGVydHk6ICdtYXRlcmlhbC5vcGFjaXR5JywgZHVyOiA1MDAsIGZyb206IFwiMVwiLCB0bzogXCIwLjVcIiB9KTtcclxuICAgICAgYXJyb3dMZWZ0LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zY2FsZScsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiBcIjAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIjAuMDA0IDAuMDAyIDAuMDA0XCIgfSk7XHJcblxyXG4gICAgICAvLyBtZW51OiBnZXQgdGhlIG5ld2x5IHNlbGVjdGVkIG1lbnUgZWxlbWVudFxyXG4gICAgICBjb25zdCBuZXdNZW51RWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBzZWxlY3RlZE9wdGlvbkluZGV4ICsgXCInXVwiKVswXTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IHJlbW92ZSBzZWxlY3RlZCBjbGFzcyBhbmQgY2hhbmdlIGNvbG9yc1xyXG4gICAgICBvbGRNZW51RWwuY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkXCIpO1xyXG4gICAgICBuZXdNZW51RWwuY2xhc3NMaXN0LmFkZChcInNlbGVjdGVkXCIpO1xyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRpb25WYWx1ZSA9IG5ld01lbnVFbC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKTtcclxuICAgICAgY29uc29sZS5sb2codGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uVmFsdWUpO1xyXG4gICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRPcHRpb25JbmRleCA9IHNlbGVjdGVkT3B0aW9uSW5kZXg7XHJcbiAgICAgIHRoaXMuZWwuZmx1c2hUb0RPTSgpO1xyXG4gICAgICB0aGlzLmVsLmVtaXQoXCJtZW51Q2hhbmdlZFwiKTtcclxuICAgICAgb2xkTWVudUVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAnZ3JheScpO1xyXG4gICAgICBuZXdNZW51RWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm9iamVjdE5hbWVcIilbMF0uc2V0QXR0cmlidXRlKCdibWZvbnQtdGV4dCcsICdjb2xvcicsICd5ZWxsb3cnKTtcclxuICAgICAgb2xkTWVudUVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJwcmV2aWV3RnJhbWVcIilbMF0uc2V0QXR0cmlidXRlKCdtYXRlcmlhbCcsICdjb2xvcicsICcjMjIyMjIyJyk7XHJcbiAgICAgIG5ld01lbnVFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJldmlld0ZyYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCAnY29sb3InLCAneWVsbG93Jyk7XHJcblxyXG4gICAgICAvLyBtZW51OiBzbGlkZSB0aGUgbWVudSBsaXN0IHJvdyBSSUdIVCBieSAxXHJcbi8vICAgICAgY29uc3Qgc2VsZWN0T3B0aW9uc1Jvd0VsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZWxlY3RPcHRpb25zUm93XCIpO1xyXG4gICAgICAvLyB1c2UgdGhlIGRlc2lyZWRQb3NpdGlvbiBhdHRyaWJ1dGUgKGlmIGV4aXN0cykgaW5zdGVhZCBvZiBvYmplY3QzRCBwb3NpdGlvbiBhcyBhbmltYXRpb24gbWF5IG5vdCBiZSBkb25lIHlldFxyXG4gICAgICBpZiAoc2VsZWN0T3B0aW9uc1Jvd0VsLmhhc0F0dHJpYnV0ZShcImRlc2lyZWRQb3NpdGlvblwiKSkge1xyXG4gICAgICAgIHZhciBvbGRQb3NpdGlvbiA9IHNlbGVjdE9wdGlvbnNSb3dFbC5nZXRBdHRyaWJ1dGUoXCJkZXNpcmVkUG9zaXRpb25cIik7XHJcbiAgICAgICAgdmFyIG5ld1ggPSBwYXJzZUZsb2F0KG9sZFBvc2l0aW9uLnNwbGl0KFwiIFwiKVswXSkgKyAwLjA3NTtcclxuICAgICAgICB2YXIgbmV3UG9zaXRpb25TdHJpbmcgPSBuZXdYLnRvU3RyaW5nKCkgKyBcIiBcIiArIG9sZFBvc2l0aW9uLnNwbGl0KFwiIFwiKVsxXSArIFwiIFwiICsgb2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzJdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBvbGRQb3NpdGlvbiA9IHNlbGVjdE9wdGlvbnNSb3dFbC5vYmplY3QzRC5wb3NpdGlvbjtcclxuICAgICAgICB2YXIgbmV3WCA9IG9sZFBvc2l0aW9uLnggKyAwLjA3NTsgLy8gdGhpcyBjb3VsZCBiZSBhIHZhcmlhYmxlIGF0IHRoZSBjb21wb25lbnQgbGV2ZWxcclxuICAgICAgICB2YXIgbmV3UG9zaXRpb25TdHJpbmcgPSBuZXdYLnRvU3RyaW5nKCkgKyBcIiBcIiArIG9sZFBvc2l0aW9uLnkgKyBcIiBcIiArIG9sZFBvc2l0aW9uLno7XHJcbiAgICAgIH1cclxuICAgICAgc2VsZWN0T3B0aW9uc1Jvd0VsLnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19zbGlkZScpO1xyXG4gICAgICBzZWxlY3RPcHRpb25zUm93RWwuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX3NsaWRlJywgeyBwcm9wZXJ0eTogJ3Bvc2l0aW9uJywgZHVyOiA1MDAsIGZyb206IG9sZFBvc2l0aW9uLCB0bzogbmV3UG9zaXRpb25TdHJpbmcgfSk7XHJcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5zZXRBdHRyaWJ1dGUoJ2Rlc2lyZWRQb3NpdGlvbicsIG5ld1Bvc2l0aW9uU3RyaW5nKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IG1ha2UgdGhlIGhpZGRlbiBtb3N0IExFRlRtb3N0IG9iamVjdCAoLTMgZnJvbSBvbGRNZW51RWwgaW5kZXgpIHZpc2libGVcclxuICAgICAgdmFyIG5ld2x5VmlzaWJsZU9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggLSAzLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlWaXNpYmxlT3B0aW9uRWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBuZXdseVZpc2libGVPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcblxyXG4gICAgICAvLyBtYWtlIHZpc2libGUgYW5kIGFuaW1hdGVcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywndHJ1ZScpO1xyXG4gICAgICBuZXdseVZpc2libGVPcHRpb25FbC5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbicpO1xyXG4gICAgICBuZXdseVZpc2libGVPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbicsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiAnMC41IDAuNSAwLjUnLCB0bzogJzEuMCAxLjAgMS4wJyB9KTtcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgLy8gbWVudTogZGVzdHJveSB0aGUgaGlkZGVuIG1vc3QgUklHSFRtb3N0IG9iamVjdCAoKzMgZnJvbSBvbGRNZW51RWwgaW5kZXgpXHJcbiAgICAgIHZhciBuZXdseVJlbW92ZWRPcHRpb25JbmRleCA9IGxvb3BJbmRleChvbGRTZWxlY3RlZE9wdGlvbkluZGV4ICsgMywgc2VsZWN0ZWRPcHRncm91cEVsLmNoaWxkRWxlbWVudENvdW50KTtcclxuICAgICAgdmFyIG5ld2x5UmVtb3ZlZE9wdGlvbkVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbb3B0aW9uaWQ9J1wiICsgbmV3bHlSZW1vdmVkT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xyXG4gICAgICBuZXdseVJlbW92ZWRPcHRpb25FbC5mbHVzaFRvRE9NKCk7XHJcbiAgICAgIG5ld2x5UmVtb3ZlZE9wdGlvbkVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobmV3bHlSZW1vdmVkT3B0aW9uRWwpO1xyXG5cclxuICAgICAgLy8gbWVudTogbWFrZSB0aGUgc2Vjb25kIFJJR0hUbW9zdCBvYmplY3QgKCsyIGZyb20gb2xkTWVudUVsIGluZGV4KSBpbnZpc2libGVcclxuICAgICAgdmFyIG5ld2x5SW52aXNpYmxlT3B0aW9uSW5kZXggPSBsb29wSW5kZXgob2xkU2VsZWN0ZWRPcHRpb25JbmRleCArIDIsIHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZEVsZW1lbnRDb3VudCk7XHJcbiAgICAgIHZhciBuZXdseUludmlzaWJsZU9wdGlvbkVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbb3B0aW9uaWQ9J1wiICsgbmV3bHlJbnZpc2libGVPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcbiAgICAgIG5ld2x5SW52aXNpYmxlT3B0aW9uRWwuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywgJ2ZhbHNlJyk7XHJcbiAgICAgIG5ld2x5SW52aXNpYmxlT3B0aW9uRWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgLy8gbWVudTogQ3JlYXRlIHRoZSBuZXh0IExFRlRtb3N0IG9iamVjdCBwcmV2aWV3ICgtNCBmcm9tIG9sZE1lbnVFbCBpbmRleCkgYnV0IGtlZXAgaXQgaGlkZGVuIHVudGlsIGl0J3MgbmVlZGVkXHJcbiAgICAgIHZhciBuZXdseUNyZWF0ZWRPcHRpb25FbCA9IG5ld2x5VmlzaWJsZU9wdGlvbkVsLmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgbmV3bHlDcmVhdGVkT3B0aW9uRWwuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywgJ2ZhbHNlJyk7XHJcbiAgICAgIHZhciBuZXdseUNyZWF0ZWRPcHRpb25JbmRleCA9IGxvb3BJbmRleChvbGRTZWxlY3RlZE9wdGlvbkluZGV4IC0gNCwgc2VsZWN0ZWRPcHRncm91cEVsLmNoaWxkRWxlbWVudENvdW50KTtcclxuXHJcbiAgICAgIC8vIGdldCB0aGUgYWN0dWFsIFwib3B0aW9uXCIgZWxlbWVudCB0aGF0IGlzIHRoZSBzb3VyY2Ugb2YgdHJ1dGggZm9yIHZhbHVlLCBpbWFnZSBzcmMgYW5kIGxhYmVsIHNvIHRoYXQgd2UgY2FuIHBvcHVsYXRlIHRoZSBuZXcgbWVudSBvcHRpb25cclxuICAgICAgdmFyIHNvdXJjZU9wdGlvbkVsID0gc2VsZWN0ZWRPcHRncm91cEVsLmNoaWxkcmVuW25ld2x5Q3JlYXRlZE9wdGlvbkluZGV4XTtcclxuXHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLnNldEF0dHJpYnV0ZSgnb3B0aW9uaWQnLCBuZXdseUNyZWF0ZWRPcHRpb25JbmRleCk7XHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLnNldEF0dHJpYnV0ZSgnaWQnLCAnbWVudScgKyBuZXdseUNyZWF0ZWRPcHRpb25JbmRleCk7XHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLnNldEF0dHJpYnV0ZSgndmFsdWUnLCBzb3VyY2VPcHRpb25FbC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKSk7XHJcblxyXG4gICAgICB2YXIgbmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24gPSBuZXdseVZpc2libGVPcHRpb25FbC5vYmplY3QzRC5wb3NpdGlvbjtcclxuICAgICAgbmV3bHlDcmVhdGVkT3B0aW9uRWwuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIChuZXdseVZpc2libGVPcHRpb25Qb3NpdGlvbi54IC0gMC4wNzUpICsgXCIgXCIgKyBuZXdseVZpc2libGVPcHRpb25Qb3NpdGlvbi55ICsgXCIgXCIgKyBuZXdseVZpc2libGVPcHRpb25Qb3NpdGlvbi56KTtcclxuICAgICAgbmV3bHlDcmVhdGVkT3B0aW9uRWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgLy8gbWVudTogYWRkIHRoZSBuZXdseSBjbG9uZWQgYW5kIG1vZGlmaWVkIG1lbnUgb2JqZWN0IHByZXZpZXcgdG8gdGhlIGRvbVxyXG4gICAgICBzZWxlY3RPcHRpb25zUm93RWwuaW5zZXJ0QmVmb3JlKCBuZXdseUNyZWF0ZWRPcHRpb25FbCwgc2VsZWN0T3B0aW9uc1Jvd0VsLmZpcnN0Q2hpbGQgKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IGdldCBjaGlsZCBlbGVtZW50cyBmb3IgaW1hZ2UgYW5kIG5hbWUsIHBvcHVsYXRlIGJvdGggYXBwcm9wcmlhdGVseVxyXG4gICAgICB2YXIgYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5xdWVyeVNlbGVjdG9yQWxsKFwiW29wdGlvbmlkPSdcIiArIG5ld2x5Q3JlYXRlZE9wdGlvbkluZGV4ICsgXCInXVwiKVswXTtcclxuICAgICAgYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJldmlld0ltYWdlXCIpWzBdLnNldEF0dHJpYnV0ZSgnc3JjJywgc291cmNlT3B0aW9uRWwuZ2V0QXR0cmlidXRlKFwic3JjXCIpKVxyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAndGV4dCcsIHNvdXJjZU9wdGlvbkVsLnRleHQpO1xyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAnIzc0NzQ3NCcpO1xyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAvLyBQUkVWSU9VUyBPUFRJT04gTUVOVSBFTkQgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZWwuZW1pdChcIm1lbnVOZXh0XCIpO1xyXG4gICAgICAvLyBORVhUIE9QVElPTiBNRU5VIFNUQVJUID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgICAgc2VsZWN0ZWRPcHRpb25JbmRleCA9IGxvb3BJbmRleChzZWxlY3RlZE9wdGlvbkluZGV4ICs9IDEsIHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZEVsZW1lbnRDb3VudCk7XHJcblxyXG4gICAgICAvLyBtZW51OiBhbmltYXRlIGFycm93IHJpZ2h0XHJcbiAgICAgIHZhciBhcnJvd1JpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcnJvd1JpZ2h0XCIpO1xyXG4gICAgICBhcnJvd1JpZ2h0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19jb2xvcicpO1xyXG4gICAgICBhcnJvd1JpZ2h0LnJlbW92ZUF0dHJpYnV0ZSgnYW5pbWF0aW9uX19vcGFjaXR5Jyk7XHJcbiAgICAgIGFycm93UmlnaHQucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJyk7XHJcbiAgICAgIGFycm93UmlnaHQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX2NvbG9yJywgeyBwcm9wZXJ0eTogJ21hdGVyaWFsLmNvbG9yJywgZHVyOiA1MDAsIGZyb206IFwiI0ZGRkYwMFwiLCB0bzogXCIjMDAwMDAwXCIgfSk7XHJcbiAgICAgIGFycm93UmlnaHQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX29wYWNpdHknLCB7IHByb3BlcnR5OiAnbWF0ZXJpYWwub3BhY2l0eScsIGR1cjogNTAwLCBmcm9tOiBcIjFcIiwgdG86IFwiMC41XCIgfSk7XHJcbiAgICAgIGFycm93UmlnaHQuc2V0QXR0cmlidXRlKCdhbmltYXRpb25fX3NjYWxlJywgeyBwcm9wZXJ0eTogJ3NjYWxlJywgZHVyOiA1MDAsIGZyb206IFwiLTAuMDA2IDAuMDAzIDAuMDA2XCIsIHRvOiBcIi0wLjAwNCAwLjAwMiAwLjAwNFwiIH0pO1xyXG5cclxuICAgICAgLy8gbWVudTogZ2V0IHRoZSBuZXdseSBzZWxlY3RlZCBtZW51IGVsZW1lbnRcclxuICAgICAgY29uc3QgbmV3TWVudUVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbb3B0aW9uaWQ9J1wiICsgc2VsZWN0ZWRPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcblxyXG4gICAgICAvLyBtZW51OiByZW1vdmUgc2VsZWN0ZWQgY2xhc3MgYW5kIGNoYW5nZSBjb2xvcnNcclxuICAgICAgb2xkTWVudUVsLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgbmV3TWVudUVsLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uVmFsdWUgPSBuZXdNZW51RWwuZ2V0QXR0cmlidXRlKFwidmFsdWVcIik7XHJcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZGF0YS5zZWxlY3RlZE9wdGlvblZhbHVlKTtcclxuICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkT3B0aW9uSW5kZXggPSBzZWxlY3RlZE9wdGlvbkluZGV4O1xyXG4gICAgICB0aGlzLmVsLmZsdXNoVG9ET00oKTtcclxuICAgICAgdGhpcy5lbC5lbWl0KFwibWVudUNoYW5nZWRcIik7XHJcbiAgICAgIG9sZE1lbnVFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwib2JqZWN0TmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ2JtZm9udC10ZXh0JywgJ2NvbG9yJywgJ2dyYXknKTtcclxuICAgICAgbmV3TWVudUVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAneWVsbG93Jyk7XHJcbiAgICAgIG9sZE1lbnVFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJldmlld0ZyYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCAnY29sb3InLCAnIzIyMjIyMicpO1xyXG4gICAgICBuZXdNZW51RWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInByZXZpZXdGcmFtZVwiKVswXS5zZXRBdHRyaWJ1dGUoJ21hdGVyaWFsJywgJ2NvbG9yJywgJ3llbGxvdycpO1xyXG5cclxuICAgICAgLy8gbWVudTogc2xpZGUgdGhlIG1lbnUgbGlzdCBsZWZ0IGJ5IDFcclxuLy8gICAgICBjb25zdCBzZWxlY3RPcHRpb25zUm93RWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NlbGVjdE9wdGlvbnNSb3dcIik7XHJcbiAgICAgIC8vIHVzZSB0aGUgZGVzaXJlZFBvc2l0aW9uIGF0dHJpYnV0ZSAoaWYgZXhpc3RzKSBpbnN0ZWFkIG9mIG9iamVjdDNEIHBvc2l0aW9uIGFzIGFuaW1hdGlvbiBtYXkgbm90IGJlIGRvbmUgeWV0XHJcbiAgICAgIC8vIFRPRE8gLSBlcnJvciB3aXRoIHRoaXMgY29kZSB3aGVuIGxvb3BpbmcgdGhyb3VnaCBpbmRleFxyXG5cclxuLy8gICAgICBjb25zb2xlLmxvZyhcIid0cnVlJyBvbGQgcG9zaXRpb25cIik7XHJcbi8vICAgICAgY29uc29sZS5sb2coc2VsZWN0T3B0aW9uc1Jvd0VsLm9iamVjdDNELnBvc2l0aW9uKTtcclxuXHJcbiAgICAgIGlmIChzZWxlY3RPcHRpb25zUm93RWwuaGFzQXR0cmlidXRlKFwiZGVzaXJlZFBvc2l0aW9uXCIpKSB7XHJcbi8vICAgICAgICBjb25zb2xlLmxvZygnZGVzaXJlZFBvc2l0aW9uJyk7XHJcbiAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0gc2VsZWN0T3B0aW9uc1Jvd0VsLmdldEF0dHJpYnV0ZShcImRlc2lyZWRQb3NpdGlvblwiKTtcclxuLy8gICAgICAgIGNvbnNvbGUubG9nKG9sZFBvc2l0aW9uKTtcclxuICAgICAgICB2YXIgbmV3WCA9IHBhcnNlRmxvYXQob2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzBdKSAtIDAuMDc1O1xyXG4gICAgICAgIHZhciBuZXdQb3NpdGlvblN0cmluZyA9IG5ld1gudG9TdHJpbmcoKSArIFwiIFwiICsgb2xkUG9zaXRpb24uc3BsaXQoXCIgXCIpWzFdICsgXCIgXCIgKyBvbGRQb3NpdGlvbi5zcGxpdChcIiBcIilbMl07XHJcbi8vICAgICAgICBjb25zb2xlLmxvZyhuZXdQb3NpdGlvblN0cmluZyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0gc2VsZWN0T3B0aW9uc1Jvd0VsLm9iamVjdDNELnBvc2l0aW9uO1xyXG4gICAgICAgIHZhciBuZXdYID0gb2xkUG9zaXRpb24ueCAtIDAuMDc1OyAvLyB0aGlzIGNvdWxkIGJlIGEgdmFyaWFibGUgc29vblxyXG4gICAgICAgIHZhciBuZXdQb3NpdGlvblN0cmluZyA9IG5ld1gudG9TdHJpbmcoKSArIFwiIFwiICsgb2xkUG9zaXRpb24ueSArIFwiIFwiICsgb2xkUG9zaXRpb24uejtcclxuLy8gICAgICAgIGNvbnNvbGUubG9nKG5ld1Bvc2l0aW9uU3RyaW5nKTtcclxuICAgICAgfVxyXG4gICAgICBzZWxlY3RPcHRpb25zUm93RWwucmVtb3ZlQXR0cmlidXRlKCdhbmltYXRpb25fX3NsaWRlJyk7XHJcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbl9fc2xpZGUnLCB7IHByb3BlcnR5OiAncG9zaXRpb24nLCBkdXI6IDUwMCwgZnJvbTogb2xkUG9zaXRpb24sIHRvOiBuZXdQb3NpdGlvblN0cmluZyB9KTtcclxuICAgICAgc2VsZWN0T3B0aW9uc1Jvd0VsLnNldEF0dHJpYnV0ZSgnZGVzaXJlZFBvc2l0aW9uJywgbmV3UG9zaXRpb25TdHJpbmcpO1xyXG5cclxuICAgICAgLy8gbWVudTogbWFrZSB0aGUgaGlkZGVuIG1vc3QgcmlnaHRtb3N0IG9iamVjdCAoKzMgZnJvbSBvbGRNZW51RWwgaW5kZXgpIHZpc2libGVcclxuICAgICAgdmFyIG5ld2x5VmlzaWJsZU9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggKyAzLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlWaXNpYmxlT3B0aW9uRWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBuZXdseVZpc2libGVPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcblxyXG4gICAgICAvLyBtYWtlIHZpc2libGUgYW5kIGFuaW1hdGVcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywndHJ1ZScpO1xyXG4gICAgICBuZXdseVZpc2libGVPcHRpb25FbC5yZW1vdmVBdHRyaWJ1dGUoJ2FuaW1hdGlvbicpO1xyXG4gICAgICBuZXdseVZpc2libGVPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ2FuaW1hdGlvbicsIHsgcHJvcGVydHk6ICdzY2FsZScsIGR1cjogNTAwLCBmcm9tOiAnMC41IDAuNSAwLjUnLCB0bzogJzEuMCAxLjAgMS4wJyB9KTtcclxuICAgICAgbmV3bHlWaXNpYmxlT3B0aW9uRWwuZmx1c2hUb0RPTSgpO1xyXG5cclxuICAgICAgLy8gbWVudTogZGVzdHJveSB0aGUgaGlkZGVuIG1vc3QgbGVmdG1vc3Qgb2JqZWN0ICgtMyBmcm9tIG9sZE1lbnVFbCBpbmRleClcclxuICAgICAgdmFyIG5ld2x5UmVtb3ZlZE9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggLSAzLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlSZW1vdmVkT3B0aW9uRWwgPSBzZWxlY3RPcHRpb25zUm93RWwucXVlcnlTZWxlY3RvckFsbChcIltvcHRpb25pZD0nXCIgKyBuZXdseVJlbW92ZWRPcHRpb25JbmRleCArIFwiJ11cIilbMF07XHJcbiAgICAgIG5ld2x5UmVtb3ZlZE9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuICAgICAgbmV3bHlSZW1vdmVkT3B0aW9uRWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuZXdseVJlbW92ZWRPcHRpb25FbCk7XHJcblxyXG4gICAgICAvLyBtZW51OiBtYWtlIHRoZSBzZWNvbmQgbGVmdG1vc3Qgb2JqZWN0ICgtMiBmcm9tIG9sZE1lbnVFbCBpbmRleCkgaW52aXNpYmxlXHJcbiAgICAgIHZhciBuZXdseUludmlzaWJsZU9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggLSAyLCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4gICAgICB2YXIgbmV3bHlJbnZpc2libGVPcHRpb25FbCA9IHNlbGVjdE9wdGlvbnNSb3dFbC5xdWVyeVNlbGVjdG9yQWxsKFwiW29wdGlvbmlkPSdcIiArIG5ld2x5SW52aXNpYmxlT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xyXG4gICAgICBuZXdseUludmlzaWJsZU9wdGlvbkVsLnNldEF0dHJpYnV0ZSgndmlzaWJsZScsICdmYWxzZScpO1xyXG4gICAgICBuZXdseUludmlzaWJsZU9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IENyZWF0ZSB0aGUgbmV4dCByaWdodG1vc3Qgb2JqZWN0IHByZXZpZXcgKCs0IGZyb20gb2xkTWVudUVsIGluZGV4KSBidXQga2VlcCBpdCBoaWRkZW4gdW50aWwgaXQncyBuZWVkZWRcclxuICAgICAgdmFyIG5ld2x5Q3JlYXRlZE9wdGlvbkVsID0gbmV3bHlWaXNpYmxlT3B0aW9uRWwuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ3Zpc2libGUnLCAnZmFsc2UnKTtcclxuICAgICAgdmFyIG5ld2x5Q3JlYXRlZE9wdGlvbkluZGV4ID0gbG9vcEluZGV4KG9sZFNlbGVjdGVkT3B0aW9uSW5kZXggKyA0LCBzZWxlY3RlZE9wdGdyb3VwRWwuY2hpbGRFbGVtZW50Q291bnQpO1xyXG4vLyAgICAgIGNvbnNvbGUubG9nKFwibmV3bHlDcmVhdGVkT3B0aW9uSW5kZXg6IFwiICsgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgpO1xyXG4gICAgICAvLyBnZXQgdGhlIGFjdHVhbCBcIm9wdGlvblwiIGVsZW1lbnQgdGhhdCBpcyB0aGUgc291cmNlIG9mIHRydXRoIGZvciB2YWx1ZSwgaW1hZ2Ugc3JjIGFuZCBsYWJlbCBzbyB0aGF0IHdlIGNhbiBwb3B1bGF0ZSB0aGUgbmV3IG1lbnUgb3B0aW9uXHJcbiAgICAgIHZhciBzb3VyY2VPcHRpb25FbCA9IHNlbGVjdGVkT3B0Z3JvdXBFbC5jaGlsZHJlbltuZXdseUNyZWF0ZWRPcHRpb25JbmRleF07XHJcbi8vICAgICAgY29uc29sZS5sb2coXCJzb3VyY2VPcHRpb25FbFwiKTtcclxuLy8gICAgICBjb25zb2xlLmxvZyhzb3VyY2VPcHRpb25FbCk7XHJcblxyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ29wdGlvbmlkJywgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgpO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21lbnUnICsgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXgpO1xyXG4gICAgICBuZXdseUNyZWF0ZWRPcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgc291cmNlT3B0aW9uRWwuZ2V0QXR0cmlidXRlKFwidmFsdWVcIikpO1xyXG5cclxuICAgICAgdmFyIG5ld2x5VmlzaWJsZU9wdGlvblBvc2l0aW9uID0gbmV3bHlWaXNpYmxlT3B0aW9uRWwub2JqZWN0M0QucG9zaXRpb247XHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCAobmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24ueCArIDAuMDc1KSArIFwiIFwiICsgbmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24ueSArIFwiIFwiICsgbmV3bHlWaXNpYmxlT3B0aW9uUG9zaXRpb24ueik7XHJcbiAgICAgIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIC8vIG1lbnU6IGFkZCB0aGUgbmV3bHkgY2xvbmVkIGFuZCBtb2RpZmllZCBtZW51IG9iamVjdCBwcmV2aWV3XHJcbiAgICAgIHNlbGVjdE9wdGlvbnNSb3dFbC5pbnNlcnRCZWZvcmUoIG5ld2x5Q3JlYXRlZE9wdGlvbkVsLCBzZWxlY3RPcHRpb25zUm93RWwuZmlyc3RDaGlsZCApO1xyXG5cclxuICAgICAgLy8gbWVudTogZ2V0IGNoaWxkIGVsZW1lbnRzIGZvciBpbWFnZSBhbmQgbmFtZSwgcG9wdWxhdGUgYm90aCBhcHByb3ByaWF0ZWx5XHJcbiAgICAgIHZhciBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsID0gc2VsZWN0T3B0aW9uc1Jvd0VsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbb3B0aW9uaWQ9J1wiICsgbmV3bHlDcmVhdGVkT3B0aW9uSW5kZXggKyBcIiddXCIpWzBdO1xyXG5cclxuICAgICAgYXBwZW5kZWROZXdseUNyZWF0ZWRPcHRpb25FbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwicHJldmlld0ltYWdlXCIpWzBdLnNldEF0dHJpYnV0ZSgnc3JjJywgc291cmNlT3B0aW9uRWwuZ2V0QXR0cmlidXRlKFwic3JjXCIpKVxyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAndGV4dCcsIHNvdXJjZU9wdGlvbkVsLnRleHQpO1xyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvYmplY3ROYW1lXCIpWzBdLnNldEF0dHJpYnV0ZSgnYm1mb250LXRleHQnLCAnY29sb3InLCAnIzc0NzQ3NCcpO1xyXG4gICAgICBhcHBlbmRlZE5ld2x5Q3JlYXRlZE9wdGlvbkVsLmZsdXNoVG9ET00oKTtcclxuXHJcbiAgICAgIC8vIE5FWFQgTUVOVSBPUFRJT04gRU5EID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIH1cclxuXHJcblxyXG4gIH1cclxuXHJcbn0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvYWZyYW1lLXNlbGVjdC1iYXIuanMiLCIvKiBnbG9iYWwgQUZSQU1FICovXHJcblxyXG5pZiAodHlwZW9mIEFGUkFNRSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xyXG59XHJcblxyXG52YXIgb2JqZWN0Q291bnQgPSAwOyAvLyBzY2VuZSBzdGFydHMgd2l0aCAwIGl0ZW1zXHJcblxyXG5mdW5jdGlvbiBodW1hbml6ZShzdHIpIHtcclxuICB2YXIgZnJhZ3MgPSBzdHIuc3BsaXQoJ18nKTtcclxuICB2YXIgaT0wO1xyXG4gIGZvciAoaT0wOyBpPGZyYWdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBmcmFnc1tpXSA9IGZyYWdzW2ldLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZnJhZ3NbaV0uc2xpY2UoMSk7XHJcbiAgfVxyXG4gIHJldHVybiBmcmFncy5qb2luKCcgJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWaXZlIENvbnRyb2xsZXIgVGVtcGxhdGUgY29tcG9uZW50IGZvciBBLUZyYW1lLlxyXG4gKiBNb2RpZmVkIGZyb20gQS1GcmFtZSBEb21pbm9lcy5cclxuICovXHJcbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnYnVpbGRlci1jb250cm9scycsIHtcclxuICBzY2hlbWE6IHtcclxuICAgIG1lbnVJZDoge3R5cGU6IFwic3RyaW5nXCIsIGRlZmF1bHQ6IFwibWVudVwifVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBpZiBjb21wb25lbnQgbmVlZHMgbXVsdGlwbGUgaW5zdGFuY2luZy5cclxuICAgKi9cclxuICBtdWx0aXBsZTogZmFsc2UsXHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBldmVudCBsaXN0ZW5lcnMuXHJcbiAgICovXHJcbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBlbCA9IHRoaXMuZWw7XHJcbiAgICAvLyBBcHBsaWNhYmxlIHRvIGJvdGggVml2ZSBhbmQgT2N1bHVzIFRvdWNoIGNvbnRyb2xzXHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCd0cmlnZ2VyZG93bicsIHRoaXMub25QbGFjZU9iamVjdC5iaW5kKHRoaXMpKTtcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2dyaXBkb3duJywgdGhpcy5vblVuZG8uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5tZW51SWQpO1xyXG4gICAgbWVudUVsLmFkZEV2ZW50TGlzdGVuZXIoJ21lbnVDaGFuZ2VkJywgdGhpcy5vbk9iamVjdENoYW5nZS5iaW5kKHRoaXMpKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxyXG4gICAqL1xyXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJpZ2dlcmRvd24nLCB0aGlzLm9uUGxhY2VPYmplY3QpO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignZ3JpcGRvd24nLCB0aGlzLm9uVW5kbyk7XHJcbiAgfSxcclxuXHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyBnZXQgdGhlIGxpc3Qgb2Ygb2JqZWN0IGdyb3VwIGpzb24gZGlyZWN0b3JpZXMgLSB3aGljaCBqc29uIGZpbGVzIHNob3VsZCB3ZSByZWFkP1xyXG4gICAgICAvLyBmb3IgZWFjaCBncm91cCwgZmV0Y2ggdGhlIGpzb24gZmlsZSBhbmQgcG9wdWxhdGUgdGhlIG9wdGdyb3VwIGFuZCBvcHRpb24gZWxlbWVudHMgYXMgY2hpbGRyZW4gb2YgdGhlIGFwcHJvcHJpYXRlIG1lbnUgZWxlbWVudFxyXG4gICAgICB2YXIgbGlzdCA9IFtcImtmYXJyX2Jhc2VzXCIsXHJcbiAgICAgICAgICAgICAgXCJtbW1tX3ZlaFwiLFxyXG4gICAgICAgICAgICAgIFwibW1tbV9ibGRcIixcclxuICAgICAgICAgICAgICBcIm1tbW1fYWxpZW5cIixcclxuICAgICAgICAgICAgICBcIm1tbW1fc2NlbmVcIixcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgIHZhciBncm91cEpTT05BcnJheSA9IFtdO1xyXG5cclxuICAgICAgLy8gVE9ETzogd3JhcCB0aGlzIGluIHByb21pc2UgYW5kIHRoZW4gcmVxdWVzdCBhZnJhbWUtc2VsZWN0LWJhciBjb21wb25lbnQgdG8gcmUtaW5pdFxyXG4gICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24gKGdyb3VwTmFtZSwgaW5kZXgpIHtcclxuICAgICAgICAvLyBleGNlbGxlbnQgcmVmZXJlbmNlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0phdmFTY3JpcHQvT2JqZWN0cy9KU09OXHJcbiAgICAgICAgdmFyIHJlcXVlc3RVUkwgPSAnYXNzZXRzLycgKyBncm91cE5hbWUgKyBcIi5qc29uXCI7XHJcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHJlcXVlc3RVUkwpO1xyXG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xyXG4gICAgICAgIHJlcXVlc3Quc2VuZCgpO1xyXG5cclxuICAgICAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyAvLyBmb3IgZWFjaCBncm91cGxpc3QganNvbiBmaWxlIHdoZW4gbG9hZGVkXHJcbiAgICAgICAgICBncm91cEpTT05BcnJheVtncm91cE5hbWVdID0gcmVxdWVzdC5yZXNwb25zZTtcclxuICAgICAgICAgIC8vIGxpdGVyYWxseSBhZGQgdGhpcyBzaGl0IHRvIHRoZSBkb20gZHVkZVxyXG4gICAgICAgICAgLy8gY29uc29sZS5sb2coZ3JvdXBKU09OQXJyYXlbZ3JvdXBOYW1lXSk7XHJcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImdyb3VwTmFtZTogXCIgKyBncm91cE5hbWUpO1xyXG5cclxuICAgICAgICAgIC8vIGZpbmQgdGhlIG9wdGdyb3VwIHBhcmVudCBlbGVtZW50IC0gdGhlIG1lbnUgb3B0aW9uP1xyXG4gICAgICAgICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVudVwiKTtcclxuXHJcbiAgICAgICAgICAvLyBhZGQgdGhlIHBhcmVudCBvcHRncm91cCBub2RlIGxpa2U6IDxvcHRncm91cCBsYWJlbD1cIkFsaWVuc1wiIHZhbHVlPVwibW1tbV9hbGllblwiPlxyXG4gICAgICAgICAgdmFyIG5ld09wdGdyb3VwRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0Z3JvdXBcIik7XHJcbiAgICAgICAgICBuZXdPcHRncm91cEVsLnNldEF0dHJpYnV0ZShcImxhYmVsXCIsIGh1bWFuaXplKGdyb3VwTmFtZSkpOyAvLyBUT0RPOiB0aGlzIHNob3VsZCBiZSBhIHByZXR0aWVyIGxhYmVsLCBub3QgdGhlIGZpbGVuYW1lXHJcbiAgICAgICAgICBuZXdPcHRncm91cEVsLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIGdyb3VwTmFtZSk7XHJcblxyXG4gICAgICAgICAgLy8gY3JlYXRlIGVhY2ggY2hpbGRcclxuICAgICAgICAgIHZhciBvcHRpb25zSFRNTCA9IFwiXCI7XHJcbiAgICAgICAgICBncm91cEpTT05BcnJheVtncm91cE5hbWVdLmZvckVhY2goIGZ1bmN0aW9uKG9iamVjdERlZmluaXRpb24sIGluZGV4KSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKG9iamVjdERlZmluaXRpb25bXCJmaWxlXCJdKTtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2cob2JqZWN0RGVmaW5pdGlvbik7XHJcbiAgICAgICAgICAgIG9wdGlvbnNIVE1MICs9IGA8b3B0aW9uIHZhbHVlPVwiJHtvYmplY3REZWZpbml0aW9uW1wiZmlsZVwiXX1cIiBzcmM9XCJhc3NldHMvcHJldmlldy8ke29iamVjdERlZmluaXRpb25bXCJmaWxlXCJdfS5qcGdcIj4ke2h1bWFuaXplKG9iamVjdERlZmluaXRpb25bXCJmaWxlXCJdKX08L29wdGlvbj5gXHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBuZXdPcHRncm91cEVsLmlubmVySFRNTCA9IG9wdGlvbnNIVE1MO1xyXG4gICAgICAgICAgLy8gVE9ETzogQkFEIFdPUktBUk9VTkQgVE8gTk9UIFJFTE9BRCBCQVNFUyBzaW5jZSBpdCdzIGRlZmluZWQgaW4gSFRNTC4gSW5zdGVhZCwgbm8gb2JqZWN0cyBzaG91bGQgYmUgbGlzdGVkIGluIEhUTUwuIFRoaXMgc2hvdWxkIHVzZSBhIHByb21pc2UgYW5kIHRoZW4gaW5pdCB0aGUgc2VsZWN0LWJhciBjb21wb25lbnQgb25jZSBhbGwgb2JqZWN0cyBhcmUgbGlzdGVkLlxyXG4gICAgICAgICAgaWYgKGdyb3VwTmFtZSA9PSBcImtmYXJyX2Jhc2VzXCIpIHtcclxuICAgICAgICAgICAgLy8gZG8gbm90aGluZyAtIGRvbid0IGFwcGVuZCB0aGlzIHRvIHRoZSBET00gYmVjYXVzZSBvbmUgaXMgYWxyZWFkeSB0aGVyZVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbWVudUVsLmFwcGVuZENoaWxkKG5ld09wdGdyb3VwRWwpO1xyXG4gICAgICAgICAgfVxyXG4vLyAgICAgICAgICByZXNvbHZlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLmdyb3VwSlNPTkFycmF5ID0gZ3JvdXBKU09OQXJyYXk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gZW50aXR5IHJlc3VtZXMuXHJcbiAgICogVXNlIHRvIGNvbnRpbnVlIG9yIGFkZCBhbnkgZHluYW1pYyBvciBiYWNrZ3JvdW5kIGJlaGF2aW9yIHN1Y2ggYXMgZXZlbnRzLlxyXG4gICAqL1xyXG4gIHBsYXk6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBlbnRpdHkgcGF1c2VzLlxyXG4gICAqIFVzZSB0byBzdG9wIG9yIHJlbW92ZSBhbnkgZHluYW1pYyBvciBiYWNrZ3JvdW5kIGJlaGF2aW9yIHN1Y2ggYXMgZXZlbnRzLlxyXG4gICAqL1xyXG4gIHBhdXNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gYSBjb21wb25lbnQgaXMgcmVtb3ZlZCAoZS5nLiwgdmlhIHJlbW92ZUF0dHJpYnV0ZSkuXHJcbiAgICogR2VuZXJhbGx5IHVuZG9lcyBhbGwgbW9kaWZpY2F0aW9ucyB0byB0aGUgZW50aXR5LlxyXG4gICAqL1xyXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFNwYXducyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9iamVjdCBhdCB0aGUgY29udHJvbGxlciBsb2NhdGlvbiB3aGVuIHRyaWdnZXIgcHJlc3NlZFxyXG4gICAqL1xyXG4gIG9uUGxhY2VPYmplY3Q6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAvLyBGZXRjaCB0aGUgSXRlbSBlbGVtZW50ICh0aGUgcGxhY2VhYmxlIGNpdHkgb2JqZWN0KSBzZWxlY3RlZCBvbiB0aGlzIGNvbnRyb2xsZXJcclxuICAgIHZhciB0aGlzSXRlbUlEID0gKHRoaXMuZWwuaWQgPT09ICdsZWZ0Q29udHJvbGxlcicpID8gJyNsZWZ0SXRlbSc6JyNyaWdodEl0ZW0nO1xyXG4gICAgdmFyIHRoaXNJdGVtRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXNJdGVtSUQpO1xyXG5cclxuICAgIC8vIFdoaWNoIG9iamVjdCBzaG91bGQgYmUgcGxhY2VkIGhlcmU/IFRoaXMgSUQgaXMgXCJzdG9yZWRcIiBpbiB0aGUgRE9NIGVsZW1lbnQgb2YgdGhlIGN1cnJlbnQgSXRlbVxyXG5cdFx0dmFyIG9iamVjdElkID0gcGFyc2VJbnQodGhpc0l0ZW1FbC5hdHRyaWJ1dGVzLm9iamVjdElkLnZhbHVlKTtcclxuXHJcbiAgICAvLyBXaGF0J3MgdGhlIHR5cGUgb2Ygb2JqZWN0PyBGb3IgZXhhbXBsZSwgXCJtbW1tX2FsaWVuXCIgb3IgXCJiYXNlc1wiXHJcblx0XHR2YXIgb2JqZWN0R3JvdXAgPSB0aGlzSXRlbUVsLmF0dHJpYnV0ZXMub2JqZWN0R3JvdXAudmFsdWU7XHJcblxyXG4gICAgLy8gcm91bmRpbmcgdHJ1ZSBvciBmYWxzZT8gV2Ugd2FudCB0byByb3VuZCBwb3NpdGlvbiBhbmQgcm90YXRpb24gb25seSBmb3IgXCJiYXNlc1wiIHR5cGUgb2JqZWN0c1xyXG4gICAgdmFyIHJvdW5kaW5nID0gKG9iamVjdEdyb3VwID09ICdrZmFycl9iYXNlcycpO1xyXG5cclxuICAgIC8vIEdldCBhbiBBcnJheSBvZiBhbGwgdGhlIG9iamVjdHMgb2YgdGhpcyB0eXBlXHJcbiAgICB2YXIgb2JqZWN0QXJyYXkgPSB0aGlzLmdyb3VwSlNPTkFycmF5W29iamVjdEdyb3VwXTtcclxuXHJcbiAgICAvLyBHZXQgdGhlIEl0ZW0ncyBjdXJyZW50IHdvcmxkIGNvb3JkaW5hdGVzIC0gd2UncmUgZ29pbmcgdG8gcGxhY2UgaXQgcmlnaHQgd2hlcmUgaXQgaXMhXHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFBvc2l0aW9uID0gdGhpc0l0ZW1FbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKCk7XHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uID0gdGhpc0l0ZW1FbC5vYmplY3QzRC5nZXRXb3JsZFJvdGF0aW9uKCk7XHJcblx0XHR2YXIgb3JpZ2luYWxQb3NpdGlvblN0cmluZyA9IHRoaXNJdGVtV29ybGRQb3NpdGlvbi54ICsgJyAnICsgdGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLnkgKyAnICcgKyB0aGlzSXRlbVdvcmxkUG9zaXRpb24uejtcclxuXHJcbiAgICAvLyBSb3VuZCB0aGUgSXRlbSdzIHBvc2l0aW9uIHRvIHRoZSBuZWFyZXN0IDAuNTAgZm9yIGEgYmFzaWMgXCJncmlkIHNuYXBwaW5nXCIgZWZmZWN0XHJcblx0XHR2YXIgcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWCA9IE1hdGgucm91bmQodGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLnggKiAyKSAvIDI7IC8vcm91bmQgdG8gbmVhcmVzdCAwLjUgZm9yIGdoZXR0byBcInNuYXBwaW5nXCJcclxuXHRcdHZhciByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25ZID0gTWF0aC5yb3VuZCh0aGlzSXRlbVdvcmxkUG9zaXRpb24ueSAqIDIpIC8gMjsgLy9yb3VuZCB0byBuZWFyZXN0IDAuNSBmb3IgZ2hldHRvIFwic25hcHBpbmdcIlxyXG5cdFx0dmFyIHJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblogPSBNYXRoLnJvdW5kKHRoaXNJdGVtV29ybGRQb3NpdGlvbi56ICogMikgLyAyOyAvL3JvdW5kIHRvIG5lYXJlc3QgMC41IGZvciBnaGV0dG8gXCJzbmFwcGluZ1wiXHJcblx0XHR2YXIgcm91bmRlZFBvc2l0aW9uU3RyaW5nID0gcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWCArICcgMC41MCAnICsgcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWjtcclxuXHJcbiAgICAvLyBGZXRjaCB0aGUgY3VycmVudCBJdGVtJ3Mgcm90YXRpb24gYW5kIGNvbnZlcnQgaXQgdG8gYSBFdWxlciBzdHJpbmdcclxuXHRcdHZhciB0aGlzSXRlbVdvcmxkUm90YXRpb25YID0gdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uLl94IC8gKE1hdGguUEkgLyAxODApO1xyXG5cdFx0dmFyIHRoaXNJdGVtV29ybGRSb3RhdGlvblkgPSB0aGlzSXRlbVdvcmxkUm90YXRpb24uX3kgLyAoTWF0aC5QSSAvIDE4MCk7XHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWiA9IHRoaXNJdGVtV29ybGRSb3RhdGlvbi5feiAvIChNYXRoLlBJIC8gMTgwKTtcclxuXHRcdHZhciBvcmlnaW5hbEV1bGVyUm90YXRpb25TdHJpbmcgPSB0aGlzSXRlbVdvcmxkUm90YXRpb25YICsgJyAnICsgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSArICcgJyArIHRoaXNJdGVtV29ybGRSb3RhdGlvblo7XHJcblxyXG4gICAgLy8gUm91bmQgdGhlIEl0ZW0ncyByb3RhdGlvbiB0byB0aGUgbmVhcmVzdCA5MCBkZWdyZWVzIGZvciBiYXNlIHR5cGUgb2JqZWN0c1xyXG5cdFx0dmFyIHJvdW5kZWRUaGlzSXRlbVdvcmxkUm90YXRpb25ZID0gTWF0aC5yb3VuZCh0aGlzSXRlbVdvcmxkUm90YXRpb25ZIC8gOTApICogOTA7IC8vIHJvdW5kIHRvIDkwIGRlZ3JlZXNcclxuXHRcdHZhciByb3VuZGVkRXVsZXJSb3RhdGlvblN0cmluZyA9IDAgKyAnICcgKyByb3VuZGVkVGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSArICcgJyArIDA7IC8vIGlnbm9yZSByb2xsIGFuZCBwaXRjaFxyXG5cclxuICAgIHZhciBuZXdJZCA9ICdvYmplY3QnICsgb2JqZWN0Q291bnQ7XHJcblxyXG4gICAgJCgnPGEtZW50aXR5IC8+Jywge1xyXG4gICAgICBpZDogbmV3SWQsXHJcbiAgICAgIGNsYXNzOiAnY2l0eSBvYmplY3QgY2hpbGRyZW4nLFxyXG4gICAgICBzY2FsZTogb2JqZWN0QXJyYXlbb2JqZWN0SWRdLnNjYWxlLFxyXG4gICAgICByb3RhdGlvbjogcm91bmRpbmcgPyByb3VuZGVkRXVsZXJSb3RhdGlvblN0cmluZyA6IG9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZyxcclxuICAgICAgZmlsZTogb2JqZWN0QXJyYXlbb2JqZWN0SWRdLmZpbGUsXHJcbiAgICAgIC8vIFwicGx5LW1vZGVsXCI6IFwic3JjOiB1cmwobmV3X2Fzc2V0cy9cIiArIG9iamVjdEFycmF5W29iamVjdElkXS5maWxlICsgXCIucGx5KVwiLFxyXG4gICAgICBcIm9iai1tb2RlbFwiOiBcIm9iajogdXJsKGFzc2V0cy9vYmovXCIgKyBvYmplY3RBcnJheVtvYmplY3RJZF0uZmlsZSArIFwiLm9iaik7IG10bDogdXJsKGFzc2V0cy9vYmovXCIgKyBvYmplY3RBcnJheVtvYmplY3RJZF0uZmlsZSArIFwiLm10bClcIixcclxuICAgICAgYXBwZW5kVG8gOiAkKCcjY2l0eScpXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgbmV3T2JqZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobmV3SWQpO1xyXG4gICAgbmV3T2JqZWN0LnNldEF0dHJpYnV0ZShcInBvc2l0aW9uXCIsIHJvdW5kaW5nID8gcm91bmRlZFBvc2l0aW9uU3RyaW5nIDogb3JpZ2luYWxQb3NpdGlvblN0cmluZyk7IC8vIHRoaXMgZG9lcyBzZXQgcG9zaXRpb25cclxuXHJcbiAgICAvLyBJZiB0aGlzIGlzIGEgXCJiYXNlc1wiIHR5cGUgb2JqZWN0LCBhbmltYXRlIHRoZSB0cmFuc2l0aW9uIHRvIHRoZSBzbmFwcGVkIChyb3VuZGVkKSBwb3NpdGlvbiBhbmQgcm90YXRpb25cclxuICAgIGlmIChyb3VuZGluZykge1xyXG4gICAgICBuZXdPYmplY3Quc2V0QXR0cmlidXRlKCdhbmltYXRpb24nLCB7IHByb3BlcnR5OiAncm90YXRpb24nLCBkdXI6IDUwMCwgZnJvbTogb3JpZ2luYWxFdWxlclJvdGF0aW9uU3RyaW5nLCB0bzogcm91bmRlZEV1bGVyUm90YXRpb25TdHJpbmcgfSlcclxuICAgIH07XHJcblxyXG4gICAgLy8gSW5jcmVtZW50IHRoZSBvYmplY3QgY291bnRlciBzbyBzdWJzZXF1ZW50IG9iamVjdHMgaGF2ZSB0aGUgY29ycmVjdCBpbmRleFxyXG5cdFx0b2JqZWN0Q291bnQgKz0gMTtcclxuICB9LFxyXG5cclxuXHRvbk9iamVjdENoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc29sZS5sb2coXCJvbk9iamVjdENoYW5nZSB0cmlnZ2VyZWRcIik7XHJcblxyXG4gICAgLy8gRmV0Y2ggdGhlIEl0ZW0gZWxlbWVudCAodGhlIHBsYWNlYWJsZSBjaXR5IG9iamVjdCkgc2VsZWN0ZWQgb24gdGhpcyBjb250cm9sbGVyXHJcbiAgICB2YXIgdGhpc0l0ZW1JRCA9ICh0aGlzLmVsLmlkID09PSAnbGVmdENvbnRyb2xsZXInKSA/ICcjbGVmdEl0ZW0nOicjcmlnaHRJdGVtJztcclxuICAgIHZhciB0aGlzSXRlbUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzSXRlbUlEKTtcclxuXHJcbiAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLm1lbnVJZCk7XHJcblxyXG4gICAgLy8gV2hhdCdzIHRoZSB0eXBlIG9mIG9iamVjdCBjdXJyZW50bHkgc2VsZWN0ZWQ/IEZvciBleGFtcGxlLCBcIm1tbW1fYWxpZW5cIiBvciBcImJhc2VzXCJcclxuICAgIHZhciBvYmplY3RHcm91cCA9IG1lbnVFbC5jb21wb25lbnRzWydzZWxlY3QtYmFyJ10uZGF0YS5zZWxlY3RlZE9wdGdyb3VwVmFsdWU7XHJcblxyXG4gICAgLy8gR2V0IGFuIEFycmF5IG9mIGFsbCB0aGUgb2JqZWN0cyBvZiB0aGlzIHR5cGVcclxuICAgIHZhciBvYmplY3RBcnJheSA9IHRoaXMuZ3JvdXBKU09OQXJyYXlbb2JqZWN0R3JvdXBdO1xyXG5cclxuICAgIC8vIFdoYXQgaXMgdGhlIElEIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgaXRlbT9cclxuICAgIHZhciBuZXdPYmplY3RJZCA9IHBhcnNlSW50KG1lbnVFbC5jb21wb25lbnRzWydzZWxlY3QtYmFyJ10uZGF0YS5zZWxlY3RlZE9wdGlvbkluZGV4KTtcclxuICAgIHZhciBzZWxlY3RlZE9wdGlvblZhbHVlID0gbWVudUVsLmNvbXBvbmVudHNbJ3NlbGVjdC1iYXInXS5kYXRhLnNlbGVjdGVkT3B0aW9uVmFsdWU7XHJcblxyXG5cdFx0Ly8gU2V0IHRoZSBwcmV2aWV3IG9iamVjdCB0byBiZSB0aGUgY3VycmVudGx5IHNlbGVjdGVkIFwicHJldmlld1wiIGl0ZW1cclxuICAgIHRoaXNJdGVtRWwuc2V0QXR0cmlidXRlKCdvYmotbW9kZWwnLCB7IG9iajogXCJ1cmwoYXNzZXRzL29iai9cIiArIG9iamVjdEFycmF5W25ld09iamVjdElkXS5maWxlICsgXCIub2JqKVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdGw6IFwidXJsKGFzc2V0cy9vYmovXCIgKyBvYmplY3RBcnJheVtuZXdPYmplY3RJZF0uZmlsZSArIFwiLm10bClcIn0pO1xyXG5cdFx0dGhpc0l0ZW1FbC5zZXRBdHRyaWJ1dGUoJ3NjYWxlJywgb2JqZWN0QXJyYXlbbmV3T2JqZWN0SWRdLnNjYWxlKTtcclxuXHRcdHRoaXNJdGVtRWwuc2V0QXR0cmlidXRlKCdvYmplY3RJZCcsIG5ld09iamVjdElkKTtcclxuICAgIHRoaXNJdGVtRWwuc2V0QXR0cmlidXRlKCdvYmplY3RHcm91cCcsIG9iamVjdEdyb3VwKTtcclxuICAgIHRoaXNJdGVtRWwuZmx1c2hUb0RPTSgpO1xyXG5cdH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFVuZG8gLSBkZWxldGVzIHRoZSBtb3N0IHJlY2VudGx5IHBsYWNlZCBvYmplY3RcclxuICAgKi9cclxuICBvblVuZG86IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBwcmV2aW91c09iamVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjb2JqZWN0XCIgKyAob2JqZWN0Q291bnQgLSAxKSk7XHJcblx0XHRwcmV2aW91c09iamVjdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHByZXZpb3VzT2JqZWN0KTtcclxuXHRcdG9iamVjdENvdW50IC09IDE7XHJcblx0XHRpZihvYmplY3RDb3VudCA9PSAtMSkge29iamVjdENvdW50ID0gMH07XHJcbiAgfVxyXG5cclxufSk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2xpYi9idWlsZGVyLWNvbnRyb2xzLmpzIiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUgKi9cclxuXHJcbi8qKlxyXG4gKiBMb2FkcyBhbmQgc2V0dXAgZ3JvdW5kIG1vZGVsLlxyXG4gKi9cclxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdncm91bmQnLCB7XHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG9iamVjdExvYWRlcjtcclxuICAgIHZhciBvYmplY3QzRCA9IHRoaXMuZWwub2JqZWN0M0Q7XHJcbiAgICAvLyB2YXIgTU9ERUxfVVJMID0gJ2h0dHBzOi8vY2RuLmFmcmFtZS5pby9saW5rLXRyYXZlcnNhbC9tb2RlbHMvZ3JvdW5kLmpzb24nO1xyXG4gICAgdmFyIE1PREVMX1VSTCA9ICdhc3NldHMvZW52aXJvbm1lbnQvZ3JvdW5kLmpzb24nO1xyXG4gICAgaWYgKHRoaXMub2JqZWN0TG9hZGVyKSB7IHJldHVybjsgfVxyXG4gICAgb2JqZWN0TG9hZGVyID0gdGhpcy5vYmplY3RMb2FkZXIgPSBuZXcgVEhSRUUuT2JqZWN0TG9hZGVyKCk7XHJcbiAgICBvYmplY3RMb2FkZXIuY3Jvc3NPcmlnaW4gPSAnJztcclxuICAgIG9iamVjdExvYWRlci5sb2FkKE1PREVMX1VSTCwgZnVuY3Rpb24gKG9iaikge1xyXG4gICAgICBvYmouY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB2YWx1ZS5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcclxuICAgICAgICB2YWx1ZS5tYXRlcmlhbC5zaGFkaW5nID0gVEhSRUUuRmxhdFNoYWRpbmc7XHJcbiAgICAgIH0pO1xyXG4gICAgICBvYmplY3QzRC5hZGQob2JqKTtcclxuICAgIH0pO1xyXG4gIH1cclxufSk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2xpYi9ncm91bmQuanMiLCIvKiBnbG9iYWwgQUZSQU1FICovXHJcbkFGUkFNRS5yZWdpc3RlclNoYWRlcignc2t5R3JhZGllbnQnLCB7XHJcbiAgc2NoZW1hOiB7XHJcbiAgICBjb2xvclRvcDogeyB0eXBlOiAnY29sb3InLCBkZWZhdWx0OiAnYmxhY2snLCBpczogJ3VuaWZvcm0nIH0sXHJcbiAgICBjb2xvckJvdHRvbTogeyB0eXBlOiAnY29sb3InLCBkZWZhdWx0OiAncmVkJywgaXM6ICd1bmlmb3JtJyB9XHJcbiAgfSxcclxuXHJcbiAgdmVydGV4U2hhZGVyOiBbXHJcbiAgICAndmFyeWluZyB2ZWMzIHZXb3JsZFBvc2l0aW9uOycsXHJcblxyXG4gICAgJ3ZvaWQgbWFpbigpIHsnLFxyXG5cclxuICAgICAgJ3ZlYzQgd29ybGRQb3NpdGlvbiA9IG1vZGVsTWF0cml4ICogdmVjNCggcG9zaXRpb24sIDEuMCApOycsXHJcbiAgICAgICd2V29ybGRQb3NpdGlvbiA9IHdvcmxkUG9zaXRpb24ueHl6OycsXHJcblxyXG4gICAgICAnZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNCggcG9zaXRpb24sIDEuMCApOycsXHJcblxyXG4gICAgJ30nXHJcblxyXG4gIF0uam9pbignXFxuJyksXHJcblxyXG4gIGZyYWdtZW50U2hhZGVyOiBbXHJcbiAgICAndW5pZm9ybSB2ZWMzIGNvbG9yVG9wOycsXHJcbiAgICAndW5pZm9ybSB2ZWMzIGNvbG9yQm90dG9tOycsXHJcblxyXG4gICAgJ3ZhcnlpbmcgdmVjMyB2V29ybGRQb3NpdGlvbjsnLFxyXG5cclxuICAgICd2b2lkIG1haW4oKScsXHJcblxyXG4gICAgJ3snLFxyXG4gICAgICAndmVjMyBwb2ludE9uU3BoZXJlID0gbm9ybWFsaXplKHZXb3JsZFBvc2l0aW9uLnh5eik7JyxcclxuICAgICAgJ2Zsb2F0IGYgPSAxLjA7JyxcclxuICAgICAgJ2lmKHBvaW50T25TcGhlcmUueSA+IC0gMC4yKXsnLFxyXG5cclxuICAgICAgICAnZiA9IHNpbihwb2ludE9uU3BoZXJlLnkgKiAyLjApOycsXHJcblxyXG4gICAgICAnfScsXHJcbiAgICAgICdnbF9GcmFnQ29sb3IgPSB2ZWM0KG1peChjb2xvckJvdHRvbSxjb2xvclRvcCwgZiApLCAxLjApOycsXHJcblxyXG4gICAgJ30nXHJcbiAgXS5qb2luKCdcXG4nKVxyXG59KTtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL3NreUdyYWRpZW50LmpzIl0sInNvdXJjZVJvb3QiOiIifQ==